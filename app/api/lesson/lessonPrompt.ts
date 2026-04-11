// app/api/lesson/lessonPrompt.ts
import { jsonLessonExample } from "./jsonLessonExample"

export interface LessonModuleContext {
  moduleId: string
  moduleType: "read" | "quiz"
  title: string
  summary: string
  estimatedMinutes: number
  xp: number
  readContent?: string[]
  readKeyTakeaways?: string[]
  quizPrompt?: string
  quizQuestions?: {
    question: string
    options: string[]
    answerIndex: number
    correctAnswer: string
    explanation: string
  }[]
}

export default function getLessonPrompt(params: {
  hobby: string
  level: string
  kind: "inDepth"
  topic: string
  moduleContext?: LessonModuleContext
}) {
  const { hobby, level, kind, topic, moduleContext } = params

  const label = "IN DEPTH (explanation + how to do it)"
  const hasModuleContext = !!moduleContext

  const moduleContextBlock = moduleContext
    ? `
Module context:
${JSON.stringify(moduleContext, null, 2)}
`
    : ""

  const explanationRules = moduleContext
    ? moduleContext.moduleType === "read"
      ? `
Read-module focus:
- Cover the provided content point by point.
- Preserve key ideas, add practical interpretation, common mistakes, and decision rules.
- Make it feel like an explanation of this exact module, not a generic article.
`
      : `
Quiz-module focus:
- One section per quiz question, in order.
- Start each section with the exact correct option.
- Explain the reasoning path and, when useful, a quick way to solve it.
- Explicitly explain why every wrong option is wrong.
- Be decisive and instructional.
`
    : `
No module context:
- Create a practical in-depth explanation for the topic.
`

  return `
Create one ${label} lesson.
Hobby: "${hobby}"
Level: "${level}"
Topic: "${topic}"

${moduleContextBlock}

Return valid JSON only, matching this shape exactly:

${JSON.stringify(jsonLessonExample, null, 2)}

Rules:
- kind must be "${kind}".
- hobby must be "${hobby}".
- level must be "${level}".
- topic should restate the topic naturally.
- title should feel like a polished course chapter.
- summary: 2-3 useful sentences.
- If module context exists, explain that module directly.
- Sections: short heading, concrete body, actionable tips/examples.
- Aim for depth, but avoid filler and repetition.
- recommendedResources: 1-4 items max; note should say why/when to use it.

${explanationRules}

${hasModuleContext ? "- Do not ignore the module context." : ""}

Output constraints:
- JSON only.
- No markdown, comments, code fences, trailing commas, placeholders, or extra text.
`
}
