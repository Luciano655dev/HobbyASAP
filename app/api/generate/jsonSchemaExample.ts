import { HobbyPlan } from "./types"

export const jsonSchemaExample: HobbyPlan = {
  hobby: "guitar",
  level: "complete beginner",
  icon: "🎸",
  theme: {
    from: "#10b981ff",
    to: "#020617ff",
  },
  sections: [
    {
      id: "intro-1",
      kind: "intro",
      title: "Welcome to guitar",
      description: "Short friendly summary of what this hobby is about.",
      body: "string",
      bulletPoints: ["string"],
    },
    {
      id: "roadmap-1",
      kind: "roadmap",
      title: "Big milestones",
      description: "4–7 big steps in the journey.",
      milestones: ["string"],
      phases: [
        {
          name: "string",
          goal: "string",
          focus: ["string"],
        },
      ],
    },
    {
      id: "today-1",
      kind: "today",
      title: "Today’s tiny steps",
      description: "Very small tasks you can do right now.",
      items: [
        {
          label: "string",
          minutes: 20,
          xp: 10,
        },
      ],
    },
    {
      id: "checklist-1",
      kind: "checklist",
      title: "Core practice",
      description: "Repeatable sessions that build skill.",
      items: [
        {
          label: "string",
          minutes: 40,
          xp: 15,
        },
      ],
    },
    {
      id: "weekly-1",
      kind: "weekly",
      title: "Weekly plan",
      description: "Week-by-week structure.",
      weeks: [
        {
          week: 1,
          focus: "string",
          practice: ["string"],
          goal: "string",
        },
      ],
    },
    {
      id: "resources-1",
      kind: "resources",
      title: "Helpful resources",
      description: "Links that match the level.",
      resources: [
        {
          title: "string",
          type: "video",
          url: "string",
          note: "string",
        },
      ],
    },
    {
      id: "gear-1",
      kind: "gear",
      title: "Gear suggestions",
      description: "What to buy now vs later.",
      starter: ["string"],
      niceToHave: ["string"],
      moneySavingTips: ["string"],
    },
    {
      id: "tips-1",
      kind: "tips",
      title: "Common mistakes",
      description: "Traps to avoid.",
      mistakes: [
        {
          mistake: "string",
          fix: "string",
        },
      ],
    },
    {
      id: "advanced-1",
      kind: "advanced",
      title: "Advanced path",
      description: "Options once you are solid.",
      directions: ["string"],
      longTermGoals: ["string"],
    },
  ],
}
