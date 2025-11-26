// app/api/lesson/route.ts
import { NextResponse } from "next/server"
import { Lesson } from "../generate/types"
import Groq from "groq-sdk"
import getLessonPrompt from "./lessonPrompt"
import {
  checkGlobalTokenBudget,
  addGlobalTokens,
} from "@/app/lib/groqGlobalLimit"

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(req: Request) {
  try {
    const { hobby, level, kind, topic } = await req.json()

    if (!hobby || typeof hobby !== "string") {
      return NextResponse.json({ error: "Hobby is required." }, { status: 400 })
    }

    if (kind !== "masterclass" && kind !== "inDepth") {
      return NextResponse.json(
        { error: 'Kind must be "masterclass" or "inDepth".' },
        { status: 400 }
      )
    }

    if (!topic || typeof topic !== "string") {
      return NextResponse.json({ error: "Topic is required." }, { status: 400 })
    }

    // === GLOBAL TOKEN LIMIT CHECK ===
    const budget: any = await checkGlobalTokenBudget()
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

    const systemPrompt =
      "You are HobbyASAP, an AI that creates ultra clear, COURSE-LIKE lessons for hobby learners. " +
      "You ALWAYS respond with VALID JSON only. No markdown, no code fences, no comments."

    const userPrompt = getLessonPrompt({
      hobby,
      level: userLevel,
      kind,
      topic,
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
    const usage = (completion as any).usage
    const usedTokens: number = usage?.total_tokens ?? 0
    await addGlobalTokens(budget.redis, budget.key, usedTokens)

    let raw = completion.choices?.[0]?.message?.content || ""
    raw = raw.trim()

    if (raw.startsWith("```")) {
      raw = raw
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim()
    }

    const firstBrace = raw.indexOf("{")
    const lastBrace = raw.lastIndexOf("}")
    if (firstBrace === -1 || lastBrace === -1) {
      console.error("No JSON braces found in lesson output:", raw)
      return NextResponse.json(
        { error: "AI response did not contain a valid JSON object." },
        { status: 500 }
      )
    }

    const jsonStr = raw.slice(firstBrace, lastBrace + 1)

    let lesson: Lesson
    try {
      lesson = JSON.parse(jsonStr)
    } catch (parseErr) {
      console.error("Lesson JSON parse error:", parseErr, "RAW:", raw)
      return NextResponse.json(
        { error: "AI returned invalid JSON for lesson." },
        { status: 500 }
      )
    }

    return NextResponse.json({ lesson })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: "Something went wrong generating the lesson." },
      { status: 500 }
    )
  }
}
