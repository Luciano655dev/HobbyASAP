import "server-only"

import OpenAI from "openai"
import getUserPrompt from "@/app/api/generate/userPrompt"
import getSystemPrompt from "@/app/api/getSystemPrompt"
import { coursePlanResponseFormat } from "@/app/api/generate/coursePlanResponseFormat"
import type { HobbyPlan, Module } from "@/app/api/generate/types"
import {
  addGlobalTokens,
  checkGlobalTokenBudget,
  type GlobalTokenBudget,
} from "@/app/lib/groqGlobalLimit"

export type SupportedLanguage = "en" | "pt"

export type CourseTemplateRecord = {
  id: string
  hobby: string
  normalized_hobby: string
  level: string
  language: SupportedLanguage
  icon: string | null
  plan: HobbyPlan
  sections_generated: number
  section_module_counts: number[]
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const COURSE_MODEL = process.env.OPENAI_COURSE_MODEL || "gpt-5.4-mini"

export function normalizeCourseHobby(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
}

export function normalizeCourseLevel(value: string) {
  return value.trim().toLowerCase()
}

export function normalizeCourseLanguage(value: string): SupportedLanguage {
  return value === "pt" ? "pt" : "en"
}

export async function generateCourseSection(params: {
  hobby: string
  level: string
  language: SupportedLanguage
  existingModules?: Module[]
}) {
  const { hobby, level, language, existingModules = [] } = params

  const budget: GlobalTokenBudget = await checkGlobalTokenBudget()
  if (!budget.allowed) {
    throw new Error(
      "HobbyASAP has reached today's AI usage limit. Please try again tomorrow."
    )
  }

  const systemPrompt = getSystemPrompt(language)
  const userPrompt = getUserPrompt(hobby, level, {
    existingModules,
  })

  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY for course generation.")
  }

  const completion = await openai.chat.completions.create({
    model: COURSE_MODEL,
    messages: [
      { role: "developer", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0,
    max_completion_tokens: 2800,
    response_format: coursePlanResponseFormat,
  })

  const usage = (completion as { usage?: { total_tokens?: number } }).usage
  await addGlobalTokens(budget.redis, budget.key, usage?.total_tokens ?? 0)

  const refusal = completion.choices?.[0]?.message?.refusal
  if (refusal) {
    throw new Error(`OpenAI refused course generation: ${refusal}`)
  }

  let raw = completion.choices?.[0]?.message?.content || ""
  raw = raw.trim()

  if (raw.startsWith("```")) {
    raw = raw.replace(/```json/gi, "").replace(/```/g, "").trim()
  }

  const firstBrace = raw.indexOf("{")
  const lastBrace = raw.lastIndexOf("}")

  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error("AI response did not contain a valid JSON object.")
  }

  const jsonStr = raw.slice(firstBrace, lastBrace + 1)
  const plan = JSON.parse(jsonStr) as HobbyPlan

  if (existingModules.length > 0) {
    const offset = existingModules.length
    plan.modules = plan.modules.map((module, index) => ({
      ...module,
      id: `module-${offset + index + 1}`,
    }))
  }

  return plan
}
