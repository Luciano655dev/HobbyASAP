export const coursePlanResponseFormat = {
  type: "json_schema",
  json_schema: {
    name: "course_plan",
    strict: true,
    schema: {
      type: "object",
      additionalProperties: false,
      required: ["hobby", "level", "icon", "theme", "modules"],
      properties: {
        hobby: { type: "string" },
        level: { type: "string" },
        icon: { type: "string" },
        theme: {
          type: "object",
          additionalProperties: false,
          required: ["from", "to"],
          properties: {
            from: { type: "string" },
            to: { type: "string" },
          },
        },
        modules: {
          type: "array",
          items: {
            anyOf: [
              {
                type: "object",
                additionalProperties: false,
                required: [
                  "id",
                  "type",
                  "title",
                  "summary",
                  "estimatedMinutes",
                  "xp",
                  "content",
                  "keyTakeaways",
                ],
                properties: {
                  id: { type: "string" },
                  type: { type: "string", enum: ["read"] },
                  title: { type: "string" },
                  summary: { type: "string" },
                  estimatedMinutes: { type: "number" },
                  xp: { type: "number" },
                  content: {
                    type: "array",
                    items: { type: "string" },
                  },
                  keyTakeaways: {
                    type: "array",
                    items: { type: "string" },
                  },
                },
              },
              {
                type: "object",
                additionalProperties: false,
                required: [
                  "id",
                  "type",
                  "title",
                  "summary",
                  "estimatedMinutes",
                  "xp",
                  "prompt",
                  "questions",
                ],
                properties: {
                  id: { type: "string" },
                  type: { type: "string", enum: ["quiz"] },
                  title: { type: "string" },
                  summary: { type: "string" },
                  estimatedMinutes: { type: "number" },
                  xp: { type: "number" },
                  prompt: { type: "string" },
                  questions: {
                    type: "array",
                    items: {
                      type: "object",
                      additionalProperties: false,
                      required: [
                        "question",
                        "options",
                        "answerIndex",
                        "explanation",
                      ],
                      properties: {
                        question: { type: "string" },
                        options: {
                          type: "array",
                          items: { type: "string" },
                        },
                        answerIndex: { type: "number" },
                        explanation: { type: "string" },
                      },
                    },
                  },
                },
              },
            ],
          },
        },
      },
    },
  },
} as const
