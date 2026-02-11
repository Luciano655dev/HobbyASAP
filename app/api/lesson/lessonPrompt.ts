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
Selected module context (use this as your main source of truth):
${JSON.stringify(moduleContext, null, 2)}
`
    : ""

  const explanationRules = moduleContext
    ? moduleContext.moduleType === "read"
      ? `
Explanation behavior for this READ module:
- Explain the module content point by point in a cleaner, more intuitive way.
- Keep every important concept from "readContent" and "readKeyTakeaways", then go a little deeper.
- Add practical interpretation: what this means in practice and common mistakes.
- Prioritize high-signal information: principles, decision rules, tradeoffs, common traps, and what matters most first.
- If useful, explain "how to think" about the concept, not only "what to do".
- The deep dive must feel like a guided explanation of this exact module, not a generic article.
`
      : `
Explanation behavior for this QUIZ module:
- Build the deep dive as answer explanations.
- For each quiz question in "quizQuestions":
  - Start by stating the exact correct option immediately (no suspense).
  - Explain the shortest clear reasoning path to reach that answer.
  - When possible, show a quick method/check the learner can use to get to the right answer.
  - Explain why every other option is wrong, one by one, explicitly.
- Do this for EVERY question in the quiz, in order.
- For each question, include a concise "Wrong options analysis" part that covers all incorrect options.
- Do not be vague. Be decisive and instructional.
- Never say "it depends" unless the provided quiz data itself is ambiguous.
- If the module has N questions, the lesson must explain all N questions.
- Prefer section headings like:
  - "Question 1 - Correct answer and why"
  - "Question 2 - Correct answer and why"
- Keep language simple and instructional, like a teacher reviewing a quiz.
- The deep dive must feel directly tied to this exact quiz.
`
    : `
No module context was provided:
- Create a high-quality in-depth explanation for the requested topic.
- Keep it practical and easy to apply.
`

  return `
You are HobbyASAP, an assistant that creates ultra clear, practical, COURSE-LIKE lessons for any hobby.

Task:
Create ONE ${label} lesson for this hobby and topic:

- Hobby: "${hobby}"
- User level: "${level}"
- Topic / focus: "${topic}"

${moduleContextBlock}

You MUST return valid JSON that matches EXACTLY this structure (keys, nesting and types):

${JSON.stringify(jsonLessonExample, null, 2)}

Required adaptations:
- "kind" must be exactly "${kind}".
- "hobby" must be exactly "${hobby}".
- "level" must be exactly "${level}".
- "topic" should restate the topic in a natural short phrase.
- "title" should sound like a chapter of a paid course (clear + attractive).
- "summary" must explain in 2–3 sentences what the learner will understand or be able to do.
- If module context is present, the lesson must explain THAT module.
- If the module context is quiz-based, each question must include:
  - correct answer,
  - reasoning path,
  - a quick method to get to the correct answer when possible,
  - why each incorrect option is incorrect.

Content rules:
- Aim for a rich answer (~1200–1800 words total when the content allows).
- Each "sections" item must feel like a mini chapter:
  - "heading": short and clear.
  - "body": 6–10 full sentences, concrete, precise, and beginner-friendly.
  - "tips" and "examples" should be actionable, not generic.
  - Each section should feel like a bite-sized module a learner can complete in 5-15 minutes.
- "recommendedResources":
  - 1–4 items.
  - Use a mix of "video", "article", "book", "course", "community", or "search" types where it makes sense.
  - "note" must say WHY and WHEN to use that resource (1 sentence).

${explanationRules}

${hasModuleContext ? "- Do not ignore the selected module context." : ""}

Important:
- Output JSON ONLY. No markdown, no backticks, no explanations.
- Do NOT include comments.
- Do NOT include trailing commas.
- Use only valid JSON values.
- Do not leave placeholders like "string" or "todo".
`
}
