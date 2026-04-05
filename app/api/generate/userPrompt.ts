import { jsonSchemaExample } from "./jsonSchemaExample"
import { Module } from "./types"

interface GeneratePromptOptions {
  existingModules?: Module[]
}

export default function getUserPrompt(
  hobby: string,
  userLevel: string,
  options?: GeneratePromptOptions
) {
  const existingModules = Array.isArray(options?.existingModules)
    ? options!.existingModules!
    : []
  const nextSectionNumber = existingModules.length > 0 ? 2 : 1
  const sectionGoal =
    existingModules.length > 0
      ? "Create ONLY the next section of the path."
      : "Create ONLY section 1 of the path."
  const priorModulesSummary =
    existingModules.length > 0
      ? `\nPrevious modules already generated (continue from these, do not repeat):\n${existingModules
          .map(
            (module, index) =>
              `${index + 1}. [${module.type.toUpperCase()}] ${module.title} - ${
                module.summary
              }`
          )
          .join("\n")}\n`
      : ""

  return `
Create one course section for hobby "${hobby}" at level "${userLevel}".
Target section: ${nextSectionNumber}. ${sectionGoal}
${priorModulesSummary}

Return valid JSON only, matching this shape exactly:

${JSON.stringify(jsonSchemaExample, null, 2)}

Rules:
- 8-12 modules in sequence, easiest to harder.
- Mix about 70% "read" and 30% "quiz".
- Use only this section; if prior modules exist, continue forward and do not repeat topics.
- Top-level keys must be exactly: hobby, level, icon, theme, modules.
- icon: one matching emoji only.
- theme.from/theme.to: valid hex colors.
- Each module id must be "module-1", "module-2", ... within this section only.
- summary: 1-2 concrete sentences.
- estimatedMinutes: 5-20. xp: 8-20.
- Read modules: 4-8 content bullets, 2-4 keyTakeaways.
- Quiz modules: short prompt, 3-6 questions, 3-4 options each, 0-based answerIndex, short explanation.
- Keep content practical, specific, and self-contained. No links.

Level rules:
- complete beginner: define basics simply, make first modules very beginner-friendly.
- some experience: reinforce fundamentals and common mistakes.
- intermediate: focus on refinement and consistency.
- advanced learner: skip basics and focus on specialization/performance.

Output constraints:
- JSON only.
- No extra keys.
- No comments, markdown, code fences, trailing commas, placeholders, NaN, Infinity, or undefined.
`
}
