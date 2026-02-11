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
You are HobbyASAP, an assistant that creates ultra clear, highly personalized and DETAILED learning plans for any hobby.

Task:
Create a learning SECTION for the hobby: "${hobby}".
User level: "${userLevel}". Make sure the difficulty, language and tasks match this level.
Current section target: ${nextSectionNumber}.
${sectionGoal}
${priorModulesSummary}

You MUST return valid JSON that matches EXACTLY this structure (keys, nesting and types):

${JSON.stringify(jsonSchemaExample, null, 2)}

You will build a Duolingo-style SECTION of modules in the "modules" array:

- The section should feel like a sequence the learner can move through.
- Mix "read" modules (new content) and "quiz" modules (small checks).
- Keep the order from easiest to harder.
- Use clear, friendly titles that feel like steps on a path.

🔒 Hard JSON rules (very important):
- Output JSON ONLY. No markdown, no backticks, no explanations.
- Do NOT include comments.
- Do NOT include trailing commas.
- Use only valid JSON values (no NaN, no Infinity, no undefined).
- All string fields must contain meaningful text (never "string", "todo", or placeholders).

🎯 Level adaptation:
- If level is "complete beginner":
  - Assume they know nothing about the hobby.
  - Explain terms in simple language.
  - The first 2-4 modules should be very beginner friendly.
- If level is "some experience":
  - Assume they know basic terms and tools.
  - Focus on solidifying fundamentals and fixing common mistakes.
- If level is "intermediate":
  - Assume they practice regularly.
  - Focus on refinement, consistency, and slightly advanced ideas.
- If level is "advanced learner":
  - Assume they already have strong fundamentals.
  - Focus on specialization, style, performance, and challenging projects.
  - It is OK to skip basic "intro" material.

📌 ICON rules:
- "icon" must be a SINGLE emoji character (for example: "🎣", "🎸", "💻", "📷").
- The emoji must match the hobby vibe as closely as possible.
- Do NOT add text, multiple emojis, or explanations in the "icon" field.

🎨 THEME rules:
- "theme.from" and "theme.to" MUST be valid CSS color values in 6- or 8-digit hex format, like "#10b981" or "#0f172aff".
- Choose colors so that the gradient visually matches the hobby:
  - Calm / nature / outdoor hobbies → soft greens, blues, teals.
  - Tech / coding → blues, cyans, purples.
  - Art / drawing → violets, magentas, creative pastel colors.
  - Intense physical / gym → reds, oranges, strong saturated colors.
  - Cinematic / filmmaking → deep blues, violets, warm accents.
- "theme.from" should usually be the lighter color; "theme.to" can be darker and richer.

🧩 How to use "modules":
Use modules like building blocks:

- Create 8-12 modules for THIS section only.
- Around 70% "read" modules and 30% "quiz" modules.
- Every module must include:
  - "id": unique INSIDE THIS SECTION (use "module-1", "module-2", ... in order).
  - "title": short, clear, motivating.
  - "summary": 1-2 sentences describing what they learn or check.
  - "estimatedMinutes": realistic (5-20).
  - "xp": 8-20.

Read module rules:
- "content": 4-8 bullet points with concrete guidance.
- "keyTakeaways": 2-4 short takeaways.

Quiz module rules:
- "prompt": short instructions for the quiz.
- "questions": 3-6 questions.
- Each question:
  - "options": 3-4 choices.
  - "answerIndex": 0-based index of the correct option.
  - "explanation": 1-2 sentences about why it is correct.

📚 Content quality:
- Aim for a rich section (at least ~350 words total).
- Avoid filler like "practice a lot" or "keep going" without specifics.
- Make sure all sentences are complete and not cut off.
- Avoid repeating the same text across modules; vary wording and go deeper.

🔁 Continuation rule:
- If previous modules are provided, this section MUST continue from where they ended.
- Do not repeat the same topics from prior modules.
- Move one clear step forward in difficulty and specificity.

🔗 Module content rule:
- Do NOT include external links inside modules. Keep everything self-contained.

🚫 Final rules:
- Do NOT add extra top-level keys.
- Do NOT wrap the JSON in backticks.
- Do NOT leave any "string" placeholders.
Just return the final JSON object, fully filled.
`
}
