import { Lesson } from "../generate/types"

export const jsonLessonExample: Lesson = {
  kind: "masterclass",
  title: "Masterclass – Clean Alternate Picking",
  topic: "alternate picking for guitar",
  goal: "Help the learner understand and practice clean alternate picking at slow to medium speeds without tension.",
  estimatedTimeMinutes: 40,
  level: "some experience",
  hobby: "electric guitar",
  summary:
    "This masterclass breaks alternate picking into posture, motion, rhythm, and progressive drills so the player can build clean and relaxed technique.",

  sections: [
    {
      heading: "Why alternate picking matters",
      body: "Alternate picking uses a consistent down-up motion so you do not have to think about which direction your pick is moving on every note. It makes your playing more efficient and gives you a stable base for faster lines.",
      tips: [
        "Think of your hand as a metronome that never stops moving.",
        "Focus on smoothness before speed.",
      ],
    },
    {
      heading: "Posture and pick grip",
      body: "Hold the pick between the side of your index finger and the pad of your thumb. Keep your wrist relaxed and let the motion come from a small wrist movement, not the whole arm.",
      examples: [
        "Try resting your forearm lightly on the guitar body.",
        "Use a medium pick to avoid getting stuck in the strings.",
      ],
    },
  ],

  practiceIdeas: [
    "5 minutes: mute the strings and play constant down-up strokes at 60 BPM.",
    "10 minutes: play one note per beat on a single string, then two notes per beat.",
    "10 minutes: simple 4-note patterns across two strings while keeping the motion consistent.",
  ],

  recommendedResources: [
    {
      title: "Alternate picking basics – YouTube search",
      type: "search",
      url: "https://www.youtube.com/results?search_query=beginner+alternate+picking+guitar",
      note: "Use this after you try the drills to see how teachers hold their pick and move their wrist.",
    },
  ],
}
