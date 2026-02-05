import { HobbyPlan } from "./types"

export const jsonSchemaExample: HobbyPlan = {
  hobby: "guitar",
  level: "complete beginner",
  icon: "🎸",
  theme: {
    from: "#10b981ff",
    to: "#020617ff",
  },
  modules: [
    {
      id: "module-1",
      type: "read",
      title: "Your first guitar setup",
      summary: "What to buy, how to hold the guitar, and how to tune it.",
      estimatedMinutes: 12,
      xp: 12,
      content: ["string"],
      keyTakeaways: ["string"],
    },
    {
      id: "module-2",
      type: "read",
      title: "Your first chords",
      summary: "Learn two simple chords and how to switch between them.",
      estimatedMinutes: 15,
      xp: 14,
      content: ["string"],
      keyTakeaways: ["string"],
    },
    {
      id: "module-3",
      type: "quiz",
      title: "Chord basics check",
      summary: "Quick quiz to reinforce your first chord lesson.",
      estimatedMinutes: 8,
      xp: 12,
      prompt: "Answer the questions to unlock the next module.",
      questions: [
        {
          question: "string",
          options: ["string"],
          answerIndex: 0,
          explanation: "string",
        },
      ],
    },
  ],
}
