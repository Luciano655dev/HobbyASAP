import { HobbyPlan } from "./types"

export const jsonSchemaExample: HobbyPlan = {
  hobby: "string",
  level: "string",
  icon: "🎯",
  theme: {
    from: "#10b981",
    to: "#0f172a",
  },
  modules: [
    {
      id: "module-1",
      type: "read",
      title: "string",
      summary: "string",
      estimatedMinutes: 10,
      xp: 10,
      content: ["string"],
      keyTakeaways: ["string"],
    },
    {
      id: "module-2",
      type: "quiz",
      title: "string",
      summary: "string",
      estimatedMinutes: 8,
      xp: 10,
      prompt: "string",
      questions: [
        {
          question: "string",
          options: ["string", "string", "string"],
          answerIndex: 0,
          explanation: "string",
        },
      ],
    },
  ],
}
