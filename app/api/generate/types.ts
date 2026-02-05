// types.ts

export type ResourceType =
  | "video"
  | "article"
  | "book"
  | "course"
  | "community"
  | "search"

export type ModuleType = "read" | "quiz"

export interface BaseModule {
  id: string
  type: ModuleType
  title: string
  summary: string
  estimatedMinutes: number
  xp: number
}

export interface ReadModule extends BaseModule {
  type: "read"
  content: string[]
  keyTakeaways?: string[]
}

export interface QuizQuestion {
  question: string
  options: string[]
  answerIndex: number
  explanation: string
}

export interface QuizModule extends BaseModule {
  type: "quiz"
  prompt: string
  questions: QuizQuestion[]
}

export type Module = ReadModule | QuizModule

export interface HobbyPlan {
  hobby: string
  level: string
  icon: string
  theme: {
    from: string
    to: string
  }
  modules: Module[]
}

// ---------- NEW: lesson types for masterclasses / in-depth ----------

export type LessonKind = "masterclass" | "inDepth"

export interface LessonSection {
  heading: string
  body: string
  tips?: string[]
  examples?: string[]
}

export interface Lesson {
  kind: LessonKind
  title: string
  topic: string
  goal: string
  estimatedTimeMinutes: number
  level: string
  hobby: string
  summary: string
  sections: LessonSection[]
  practiceIdeas: string[]
  recommendedResources?: {
    title: string
    type: ResourceType
    url: string
    note: string
  }[]
}
