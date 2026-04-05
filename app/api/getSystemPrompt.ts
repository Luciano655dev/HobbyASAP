export default function getSystemPrompt(lang: string) {
  return (
    "You are HobbyASAP. Return valid JSON only.\n" +
    "No markdown, code fences, comments, or extra text.\n" +
    "Use Brazilian Portuguese when LANGUAGE='pt'; otherwise use English.\n" +
    `LANGUAGE: ${lang}`
  )
}
