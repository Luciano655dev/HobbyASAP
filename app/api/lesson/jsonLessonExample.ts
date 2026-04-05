import { Lesson } from "../generate/types"

export const jsonLessonExample: Lesson = {
  kind: "inDepth",
  title: "string",
  topic: "string",
  goal: "string",
  estimatedTimeMinutes: 30,
  level: "string",
  hobby: "string",
  summary: "string",

  sections: [
    {
      heading: "string",
      body: "string",
      tips: ["string"],
      examples: ["string"],
    },
  ],

  recommendedResources: [
    {
      title: "string",
      type: "search",
      url: "https://example.com",
      note: "string",
    },
  ],
}
