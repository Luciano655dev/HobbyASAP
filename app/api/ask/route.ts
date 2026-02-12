// app/api/ask/route.ts
import { NextResponse } from "next/server"
import Groq from "groq-sdk"
import type { HobbyPlan, Lesson } from "../generate/types"
import {
  checkGlobalTokenBudget,
  addGlobalTokens,
  type GlobalTokenBudget,
} from "@/app/lib/groqGlobalLimit"

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

interface HistoryItem {
  question: string
  answer: string
}

interface ContextSelection {
  includeCourse?: boolean
  moduleIds?: string[]
  deepDiveIndexes?: number[]
  includeHistory?: boolean
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)

    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
    }

    const { question, plan, lessons, history } = body as {
      question?: string
      plan?: HobbyPlan | null
      lessons?: Lesson[] | null
      history?: HistoryItem[] | null
      contextSelection?: ContextSelection | null
    }
    const contextSelection = (body as { contextSelection?: ContextSelection | null })
      .contextSelection

    if (!question || typeof question !== "string" || !question.trim()) {
      return NextResponse.json(
        { error: "A non-empty question is required." },
        { status: 400 }
      )
    }

    if (!process.env.GROQ_API_KEY) {
      console.error("Missing GROQ_API_KEY")
      return NextResponse.json(
        { error: "Server misconfiguration: missing GROQ_API_KEY." },
        { status: 500 }
      )
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

    const safeLessons = Array.isArray(lessons) ? lessons : []
    const safeHistory = Array.isArray(history) ? history.slice(-5) : [] // last 5 QAs max
    const includeCourse = !!contextSelection?.includeCourse
    const selectedModuleIds = Array.isArray(contextSelection?.moduleIds)
      ? contextSelection!.moduleIds!.filter((x) => typeof x === "string" && x.trim())
      : []
    const selectedDeepDiveIndexes = Array.isArray(contextSelection?.deepDiveIndexes)
      ? contextSelection!.deepDiveIndexes!.filter(
          (x) => Number.isInteger(x) && x >= 0
        )
      : []
    const includeHistory = !!contextSelection?.includeHistory

    const selectedContextCount =
      Number(includeCourse) +
      Number(selectedModuleIds.length > 0) +
      Number(selectedDeepDiveIndexes.length > 0) +
      Number(includeHistory)

    if (selectedContextCount === 0) {
      return NextResponse.json(
        { error: "Select at least one context before asking the AI." },
        { status: 400 }
      )
    }

    if (!plan && (includeCourse || selectedModuleIds.length > 0)) {
      return NextResponse.json(
        { error: "Course/module context is unavailable right now." },
        { status: 400 }
      )
    }

    if (!safeLessons.length && selectedDeepDiveIndexes.length > 0) {
      return NextResponse.json(
        { error: "Deep dive context is unavailable right now." },
        { status: 400 }
      )
    }

    const contextBlocks: string[] = []
    if (includeCourse && plan) {
      contextBlocks.push(buildCourseSummary(plan))
    }
    if (selectedModuleIds.length > 0 && plan) {
      contextBlocks.push(buildModulesSummary(plan, selectedModuleIds))
    }
    if (selectedDeepDiveIndexes.length > 0) {
      contextBlocks.push(
        buildSelectedDeepDivesSummary(safeLessons, selectedDeepDiveIndexes)
      )
    }
    if (includeHistory) {
      const historySummary = buildHistorySummary(safeHistory)
      contextBlocks.push(
        historySummary
          ? `=== Recent Q&A history ===\n${historySummary}`
          : "=== Recent Q&A history ===\n(no previous questions)"
      )
    }

    // We force JSON output with answer + tasks + inDepthTopic
    const systemPrompt =
      "You are HobbyASAP Coach, an expert hobby mentor.\n" +
      "- You answer questions using ONLY the selected context provided by the user.\n" +
      "- Explain in clear, simple language and give concrete, actionable steps.\n" +
      "- You are allowed to add extra tiny practice tasks when useful, but it is optional.\n" +
      "- If user seems to want more depth on a specific topic, you may suggest an inDepthTopic.\n\n" +
      "You MUST respond with VALID JSON ONLY (no markdown, no prose around it) in this exact shape:\n" +
      `{
  "answer": "string with your full explanation in natural language",
  "tasks": [
    {
      "label": "short, concrete practice task",
      "minutes": 15,
      "xp": 10
    }
  ],
  "inDepthTopic": "short topic string or null if not needed"
}\n` +
      "- tasks can be an empty array.\n" +
      "- inDepthTopic can be null.\n" +
      "- Do NOT add any extra top-level keys.\n"

    const userPrompt =
      `User-selected context:\n\n` +
      `${contextBlocks.join("\n\n")}\n\n` +
      `Now answer this NEW question based ONLY on the selected context above:\n` +
      `Q: ${question.trim()}\n\n` +
      `Remember to return valid JSON with fields: answer, tasks, inDepthTopic.`

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 800,
    })

    // === COUNT TOKENS & UPDATE GLOBAL USAGE ===
    const usage = (completion as { usage?: { total_tokens?: number } }).usage
    const usedTokens: number = usage?.total_tokens ?? 0
    if (budget.allowed) {
      await addGlobalTokens(budget.redis, budget.key, usedTokens)
    }

    let raw = completion.choices?.[0]?.message?.content || ""
    raw = raw.trim()

    // In case the model tries to be "helpful" and adds code fences…
    if (raw.startsWith("```")) {
      raw = raw
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim()
    }

    const firstBrace = raw.indexOf("{")
    const lastBrace = raw.lastIndexOf("}")
    if (firstBrace === -1 || lastBrace === -1) {
      console.error("No JSON braces found in ask output:", raw)
      return NextResponse.json(
        {
          error:
            "AI response did not contain a valid JSON object. Try asking again in simpler words.",
        },
        { status: 500 }
      )
    }

    const jsonStr = raw.slice(firstBrace, lastBrace + 1)

    type AskResult = {
      answer: string
      tasks?: {
        label: string
        minutes?: number
        xp?: number
      }[]
      inDepthTopic?: string | null
    }

    let parsed: AskResult
    try {
      parsed = JSON.parse(jsonStr)
    } catch (err) {
      console.error("JSON parse error in ask route:", err, "RAW:", raw)
      return NextResponse.json(
        {
          error:
            "AI returned invalid JSON for the question. Try again or rephrase your question.",
        },
        { status: 500 }
      )
    }

    const answer = parsed.answer?.trim()
    if (!answer) {
      return NextResponse.json(
        {
          error:
            "The AI did not return an answer. Try rephrasing your question.",
        },
        { status: 500 }
      )
    }

    const tasks = Array.isArray(parsed.tasks) ? parsed.tasks : []
    const inDepthTopic =
      typeof parsed.inDepthTopic === "string" && parsed.inDepthTopic.trim()
        ? parsed.inDepthTopic.trim()
        : null

    return NextResponse.json({
      answer,
      tasks,
      inDepthTopic,
    })
  } catch (err) {
    console.error("Ask API error:", err)
    return NextResponse.json(
      { error: "Something went wrong answering your question." },
      { status: 500 }
    )
  }
}

/**
 * Compact summary for full-course context
 */
function buildCourseSummary(plan: HobbyPlan): string {
  return [
    "=== Course overview ===",
    `Hobby: ${plan.hobby}`,
    `Level: ${plan.level}`,
    `Modules: ${plan.modules.length}`,
  ].join("\n")
}

/**
 * Selected modules summary for context
 */
function buildModulesSummary(plan: HobbyPlan, selectedModuleIds: string[]): string {
  const selectedModules = plan.modules.filter((module) =>
    selectedModuleIds.includes(module.id)
  )
  if (!selectedModules.length) return "=== Selected modules ===\n(none found)"

  const parts: string[] = []
  selectedModules.forEach((module) => {
    parts.push(
      `\n=== Module: ${module.type.toUpperCase()} - ${module.title} ===`
    )
    parts.push(`Summary: ${module.summary}`)
    parts.push(`Estimated: ${module.estimatedMinutes} min | XP: ${module.xp}`)

    if (module.type === "read") {
      const content = (module.content || []).slice(0, 6)
      if (content.length) {
        parts.push(
          `Content:\n${content.map((x: string) => `- ${x}`).join("\n")}`
        )
      }

      const takeaways = (module.keyTakeaways || []).slice(0, 4)
      if (takeaways.length) {
        parts.push(`Key takeaways: ${takeaways.join(", ")}`)
      }
    }

    if (module.type === "quiz") {
      parts.push(`Prompt: ${module.prompt}`)
      const questions = (module.questions || []).slice(0, 3)
      for (const q of questions) {
        parts.push(
          `Quiz Q: ${q.question}\n  Options: ${(q.options || [])
            .slice(0, 4)
            .join(", ")}\n  Correct answer: ${
            q.options?.[q.answerIndex] ?? ""
          }\n  Explanation: ${q.explanation}`
        )
      }
    }
  })

  return parts.join("\n")
}

/**
 * Selected deep-dives summary for context
 */
function buildSelectedDeepDivesSummary(
  lessons: Lesson[],
  selectedIndexes: number[]
): string {
  const selected = selectedIndexes
    .map((index) => ({ lesson: lessons[index], index }))
    .filter((item) => !!item.lesson)

  if (!selected.length) return "=== Selected deep dives ===\n(none found)"

  const parts: string[] = []
  selected.forEach(({ lesson, index }) => {
    parts.push(
      `\n=== Deep dive ${index + 1}: ${lesson!.title} ===`
    )
    parts.push(`Topic: ${lesson!.topic}`)
    parts.push(`Summary: ${lesson!.summary}`)
    parts.push(`Estimated time: ${lesson!.estimatedTimeMinutes} min`)

    if (lesson!.sections?.length) {
      lesson!.sections.slice(0, 5).forEach((section) => {
        parts.push(
          `Section: ${section.heading}\n  Body: ${section.body}\n  Tips: ${(
            section.tips || []
          )
            .slice(0, 4)
            .join(", ")}\n  Examples: ${(section.examples || [])
            .slice(0, 4)
            .join(", ")}`
        )
      })
    }
  })

  return parts.join("\n")
}

/**
 * Q&A history summary so user can continue previous questions
 */
function buildHistorySummary(history: HistoryItem[]): string {
  if (!history.length) return ""

  return history
    .map(
      (item, idx) =>
        `Q${idx + 1}: ${item.question}\nA${idx + 1}: ${item.answer}`
    )
    .join("\n\n")
}
