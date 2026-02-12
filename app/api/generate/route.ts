// app/api/generate/route.ts
import { NextResponse } from "next/server"
import { getRedis } from "@/app/lib/redis"
import { HobbyPlan, Module } from "./types"
import Groq from "groq-sdk"
import getUserPrompt from "./userPrompt"
import getSystemPrompt from "../getSystemPrompt"
import {
  checkGlobalTokenBudget,
  addGlobalTokens,
  type GlobalTokenBudget,
} from "@/app/lib/groqGlobalLimit"

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(req: Request) {
  try {
    const { hobby, level, language, existingModules } = await req.json()

    if (!hobby || typeof hobby !== "string") {
      return NextResponse.json({ error: "Hobby is required" }, { status: 400 })
    }

    // === GLOBAL TOKEN LIMIT CHECK ===
    const budget: GlobalTokenBudget = await checkGlobalTokenBudget()
    if (!budget.allowed) {
      return NextResponse.json(
        {
          error:
            "HobbyASAP has reached today's AI usage limit. Please try again tomorrow.",
        },
        { status: 429 }
      )
    }

    const userLevel =
      typeof level === "string" && level.trim() ? level : "complete beginner"

    const safeExistingModules = Array.isArray(existingModules)
      ? (existingModules as Module[]).filter(
          (module) =>
            module &&
            typeof module.id === "string" &&
            typeof module.title === "string" &&
            typeof module.summary === "string" &&
            (module.type === "read" || module.type === "quiz")
        )
      : []

    const lang = language === "pt" ? "pt" : "en"
    const systemPrompt = getSystemPrompt(lang)

    const userPrompt = getUserPrompt(hobby, userLevel, {
      existingModules: safeExistingModules,
    })

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.0,
      max_tokens: 2800,
    })

    // === COUNT TOKENS & UPDATE GLOBAL USAGE ===
    const usage = (completion as { usage?: { total_tokens?: number } }).usage
    const usedTokens: number = usage?.total_tokens ?? 0
    if (budget.allowed) {
      await addGlobalTokens(budget.redis, budget.key, usedTokens)
    }

    let raw = completion.choices?.[0]?.message?.content || ""
    raw = raw.trim()

    // Strip code fences if any
    if (raw.startsWith("```")) {
      raw = raw
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim()
    }

    // Extra safety: only parse between first { and last }
    const firstBrace = raw.indexOf("{")
    const lastBrace = raw.lastIndexOf("}")

    if (firstBrace === -1 || lastBrace === -1) {
      console.error("No JSON braces found in model output:", raw)
      return NextResponse.json(
        {
          error:
            "AI response did not contain a valid JSON object. Try again or try a simpler hobby name.",
        },
        { status: 500 }
      )
    }

    const jsonStr = raw.slice(firstBrace, lastBrace + 1)

    let plan: HobbyPlan
    try {
      plan = JSON.parse(jsonStr)
    } catch (parseErr) {
      console.error("JSON parse error:", parseErr, "RAW:", raw)
      return NextResponse.json(
        {
          error:
            "AI returned invalid JSON. Try again or try a simpler hobby name.",
        },
        { status: 500 }
      )
    }

    if (safeExistingModules.length > 0) {
      const offset = safeExistingModules.length
      plan.modules = plan.modules.map((module, index) => ({
        ...module,
        id: `module-${offset + index + 1}`,
      }))
    }

    // keep your simple metrics
    try {
      const redis = getRedis()
      if (redis) {
        await redis.incr("metrics:prompts")
      }
    } catch (metricsErr) {
      console.error("Failed to increment metrics:prompts", metricsErr)
    }

    return NextResponse.json({ plan })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: "Something went wrong generating the path." },
      { status: 500 }
    )
  }
}
