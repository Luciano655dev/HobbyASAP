import { NextResponse } from "next/server"
import Groq from "groq-sdk"
import { HobbyPlan } from "./types"
import getUserPrompt from "./userPrompt"

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(req: Request) {
  try {
    const { hobby, level } = await req.json()

    if (!hobby || typeof hobby !== "string") {
      return NextResponse.json({ error: "Hobby is required" }, { status: 400 })
    }

    const userLevel =
      typeof level === "string" && level.trim() ? level : "complete beginner"

    const systemPrompt =
      "You are HobbyASAP, an AI that creates ultra clear, structured learning plans for any hobby. " +
      "You ALWAYS respond with VALID JSON only. No markdown, no code fences, no comments."

    const userPrompt = getUserPrompt(hobby, userLevel)

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.0,
      max_tokens: 2800,
    })

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

    return NextResponse.json({ plan })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: "Something went wrong generating the plan." },
      { status: 500 }
    )
  }
}
