// app/api/lesson/route.ts
import { NextResponse } from "next/server"
import { Lesson } from "../generate/types"
import Groq from "groq-sdk"
import getLessonPrompt, { LessonModuleContext } from "./lessonPrompt"
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
    const { hobby, level, kind, topic, language, moduleContext } =
      await req.json()

    if (!hobby || typeof hobby !== "string") {
      return NextResponse.json({ error: "Hobby is required." }, { status: 400 })
    }

    if (kind !== "inDepth") {
      return NextResponse.json(
        { error: 'Kind must be "inDepth".' },
        { status: 400 }
      )
    }

    if (!topic || typeof topic !== "string") {
      return NextResponse.json({ error: "Topic is required." }, { status: 400 })
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

    const lang = language === "pt" ? "pt" : "en"
    const systemPrompt: any = getSystemPrompt(lang)

    const normalizedModuleContext = normalizeModuleContext(moduleContext)

    const userPrompt = getLessonPrompt({
      hobby,
      level: userLevel,
      kind,
      topic,
      moduleContext: normalizedModuleContext,
    })

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.1,
      max_tokens: 3600,
    })

    // === COUNT TOKENS & UPDATE GLOBAL USAGE ===
    const usage = (completion as any).usage
    const usedTokens: number = usage?.total_tokens ?? 0
    if (budget.allowed) {
      await addGlobalTokens(budget.redis, budget.key, usedTokens)
    }

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

    const needsQuizRepair =
      normalizedModuleContext?.moduleType === "quiz" &&
      !isQuizLessonDetailedEnough(lesson, normalizedModuleContext)

    if (needsQuizRepair) {
      const repaired = await repairQuizLesson({
        groq,
        systemPrompt,
        hobby,
        level: userLevel,
        topic,
        moduleContext: normalizedModuleContext,
        initialLesson: lesson,
      })

      if (repaired && isQuizLessonDetailedEnough(repaired, normalizedModuleContext)) {
        lesson = repaired
      } else {
        lesson = buildQuizFallbackLesson({
          hobby,
          level: userLevel,
          topic,
          moduleContext: normalizedModuleContext,
        })
      }
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

function normalizeText(value: string) {
  return value.trim().toLowerCase()
}

function isQuizLessonDetailedEnough(
  lesson: Lesson,
  moduleContext: LessonModuleContext
) {
  const quizQuestions = moduleContext.quizQuestions ?? []
  if (!quizQuestions.length) return true

  if (!Array.isArray(lesson.sections) || lesson.sections.length < quizQuestions.length) {
    return false
  }

  for (let i = 0; i < quizQuestions.length; i += 1) {
    const quizQ = quizQuestions[i]
    const section = lesson.sections[i]
    if (!section) return false

    const body = normalizeText(section.body ?? "")
    if (!body) return false

    const correctOptionText = normalizeText(quizQ.correctAnswer)
    if (!body.includes(correctOptionText)) return false

    const otherOptions = quizQ.options.filter(
      (_, optionIndex) => optionIndex !== quizQ.answerIndex
    )
    const auxText = normalizeText(
      `${(section.examples ?? []).join(" ")} ${(section.tips ?? []).join(" ")}`
    )
    const combined = `${body} ${auxText}`

    for (const option of otherOptions) {
      if (!combined.includes(normalizeText(option))) {
        return false
      }
    }
  }

  return true
}

async function repairQuizLesson(params: {
  groq: Groq
  systemPrompt: string
  hobby: string
  level: string
  topic: string
  moduleContext: LessonModuleContext
  initialLesson: Lesson
}) {
  const { groq, systemPrompt, hobby, level, topic, moduleContext, initialLesson } =
    params

  const repairPrompt = `
You must repair an in-depth quiz explanation JSON.
Return JSON only and keep this shape:
{
  "kind": "inDepth",
  "title": "string",
  "topic": "string",
  "goal": "string",
  "estimatedTimeMinutes": number,
  "level": "string",
  "hobby": "string",
  "summary": "string",
  "sections": [
    {
      "heading": "string",
      "body": "string",
      "tips": ["string"],
      "examples": ["string"]
    }
  ],
  "recommendedResources": [
    {
      "title": "string",
      "type": "video|article|book|course|community|search",
      "url": "string",
      "note": "string"
    }
  ]
}

Hard requirements:
- One section per quiz question, in order.
- For each section:
  1) state the exact correct answer,
  2) explain reasoning path,
  3) explain why EACH wrong option is wrong.
- Mention each wrong option text explicitly.
- Keep explanations concrete and detailed, not generic.

Hobby: ${hobby}
Level: ${level}
Topic: ${topic}

Quiz context:
${JSON.stringify(moduleContext, null, 2)}

Current inadequate JSON:
${JSON.stringify(initialLesson, null, 2)}
`

  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: repairPrompt },
    ],
    temperature: 0.0,
    max_tokens: 3600,
  })

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
  if (firstBrace === -1 || lastBrace === -1) return null

  try {
    return JSON.parse(raw.slice(firstBrace, lastBrace + 1)) as Lesson
  } catch {
    return null
  }
}

function buildQuizFallbackLesson(params: {
  hobby: string
  level: string
  topic: string
  moduleContext: LessonModuleContext
}): Lesson {
  const { hobby, level, topic, moduleContext } = params
  const questions = moduleContext.quizQuestions ?? []

  return {
    kind: "inDepth",
    title: `Deep Dive - ${moduleContext.title}`,
    topic,
    goal:
      "Explain each quiz question in depth, showing how to find the correct answer and why each incorrect option is not valid.",
    estimatedTimeMinutes: Math.max(20, questions.length * 8),
    level,
    hobby,
    summary:
      "This deep dive reviews each quiz question with direct answer analysis, reasoning steps, and explicit wrong-option breakdowns.",
    sections: questions.map((q, index) => {
      const wrongOptions = q.options.filter(
        (_, optionIndex) => optionIndex !== q.answerIndex
      )

      return {
        heading: `Question ${index + 1} - Correct answer and full analysis`,
        body: `Correct answer: "${q.correctAnswer}".\nReasoning path: ${q.explanation}\nHow to get there quickly: identify the option that best matches the question intent and eliminate options that miss key conditions, reverse cause/effect, or describe adjacent but different concepts.`,
        tips: [
          "Read the question objective first before scanning options.",
          "Eliminate obviously mismatched options before making your final choice.",
          "Check whether the chosen option fully answers the question, not partially.",
        ],
        examples: wrongOptions.map(
          (option) =>
            `"${option}" is incorrect here because it does not satisfy the core condition implied by the question compared to "${q.correctAnswer}".`
        ),
      }
    }),
    recommendedResources: [],
  }
}

function normalizeModuleContext(input: unknown): LessonModuleContext | undefined {
  if (!input || typeof input !== "object") return undefined

  type QuizQuestionContext = NonNullable<LessonModuleContext["quizQuestions"]>[number]
  const maybe = input as Partial<LessonModuleContext>
  if (
    typeof maybe.moduleId !== "string" ||
    (maybe.moduleType !== "read" && maybe.moduleType !== "quiz") ||
    typeof maybe.title !== "string" ||
    typeof maybe.summary !== "string" ||
    typeof maybe.estimatedMinutes !== "number" ||
    typeof maybe.xp !== "number"
  ) {
    return undefined
  }

  return {
    moduleId: maybe.moduleId,
    moduleType: maybe.moduleType,
    title: maybe.title,
    summary: maybe.summary,
    estimatedMinutes: maybe.estimatedMinutes,
    xp: maybe.xp,
    readContent: Array.isArray(maybe.readContent)
      ? maybe.readContent.filter((item): item is string => typeof item === "string")
      : undefined,
    readKeyTakeaways: Array.isArray(maybe.readKeyTakeaways)
      ? maybe.readKeyTakeaways.filter(
          (item): item is string => typeof item === "string"
        )
      : undefined,
    quizPrompt: typeof maybe.quizPrompt === "string" ? maybe.quizPrompt : undefined,
    quizQuestions: Array.isArray(maybe.quizQuestions)
      ? maybe.quizQuestions
          .map((question) => {
            if (!question || typeof question !== "object") return null
            const q = question as Partial<QuizQuestionContext>
            if (
              typeof q.question !== "string" ||
              !Array.isArray(q.options) ||
              typeof q.answerIndex !== "number" ||
              typeof q.correctAnswer !== "string" ||
              typeof q.explanation !== "string"
            ) {
              return null
            }
            return {
              question: q.question,
              options: q.options.filter(
                (option): option is string => typeof option === "string"
              ),
              answerIndex: q.answerIndex,
              correctAnswer: q.correctAnswer,
              explanation: q.explanation,
            }
          })
          .filter(
            (
              q
            ): q is NonNullable<LessonModuleContext["quizQuestions"]>[number] =>
              q !== null
          )
      : undefined,
  }
}
