import "server-only"

import { createHash } from "node:crypto"
import type { Lesson } from "@/app/api/generate/types"
import type { LessonModuleContext } from "@/app/api/lesson/lessonPrompt"
import { normalizeCourseHobby, normalizeCourseLanguage, normalizeCourseLevel } from "./courseTemplates"

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value)
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`
  }

  const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) =>
    a.localeCompare(b)
  )

  return `{${entries
    .map(([key, nestedValue]) => `${JSON.stringify(key)}:${stableStringify(nestedValue)}`)
    .join(",")}}`
}

export function buildSharedLessonCacheKey(params: {
  hobby: string
  level: string
  language: string
  kind: string
  topic: string
  moduleContext?: LessonModuleContext
}) {
  const normalizedPayload = {
    hobby: normalizeCourseHobby(params.hobby),
    level: normalizeCourseLevel(params.level),
    language: normalizeCourseLanguage(params.language),
    kind: params.kind.trim().toLowerCase(),
    topic: params.topic.trim().toLowerCase(),
    moduleContext: params.moduleContext ?? null,
  }

  return createHash("sha256")
    .update(stableStringify(normalizedPayload))
    .digest("hex")
}

export type SharedLessonRow = {
  id: string
  cache_key: string
  hobby: string
  level: string
  language: "en" | "pt"
  kind: string
  topic: string
  module_context: LessonModuleContext | null
  lesson: Lesson
}
