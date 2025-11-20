export type ResourceType =
  | "video"
  | "article"
  | "book"
  | "course"
  | "community"
  | "search"

export type SectionKind =
  | "intro"
  | "roadmap"
  | "today"
  | "checklist"
  | "weekly"
  | "resources"
  | "gear"
  | "tips"
  | "advanced"

export interface BaseSection {
  id: string
  kind: SectionKind
  title: string
  description?: string
}

export interface IntroSection extends BaseSection {
  kind: "intro"
  body: string
  bulletPoints?: string[]
}

export interface RoadmapSection extends BaseSection {
  kind: "roadmap"
  milestones: string[]
  phases?: {
    name: string
    goal: string
    focus: string[]
  }[]
}

export interface TodaySection extends BaseSection {
  kind: "today"
  items: {
    label: string
    minutes?: number
    xp?: number
  }[]
}

export interface ChecklistSection extends BaseSection {
  kind: "checklist"
  items: {
    label: string
    minutes?: number
    xp?: number
  }[]
}

export interface WeeklySection extends BaseSection {
  kind: "weekly"
  weeks: {
    week: number
    focus: string
    practice: string[]
    goal: string
  }[]
}

export interface ResourcesSection extends BaseSection {
  kind: "resources"
  resources: {
    title: string
    type: ResourceType
    url: string
    note: string
  }[]
}

export interface GearSection extends BaseSection {
  kind: "gear"
  starter: string[]
  niceToHave: string[]
  moneySavingTips: string[]
}

export interface TipsSection extends BaseSection {
  kind: "tips"
  mistakes: {
    mistake: string
    fix: string
  }[]
}

export interface AdvancedSection extends BaseSection {
  kind: "advanced"
  directions: string[]
  longTermGoals: string[]
}

export type PlanSection =
  | IntroSection
  | RoadmapSection
  | TodaySection
  | ChecklistSection
  | WeeklySection
  | ResourcesSection
  | GearSection
  | TipsSection
  | AdvancedSection

export interface HobbyPlan {
  hobby: string
  level: string
  icon: string
  theme: {
    from: string
    to: string
  }
  sections: PlanSection[]
}

// ---- History types / constants ----

export interface HistoryItem {
  id: string
  hobby: string
  level: string
  createdAt: string
  icon?: string
  plan: HobbyPlan
}

// Lesson
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
