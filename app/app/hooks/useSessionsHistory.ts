"use client"

import { HobbyPlan, Lesson } from "../types"
import { QAItem } from "../AskQuestionPanel"
import { useAppData } from "../AppDataProvider"

export interface StreakState {
  current: number
  longest: number
  lastActiveDate: string | null
}

export const INITIAL_STREAK: StreakState = {
  current: 0,
  longest: 0,
  lastActiveDate: null,
}

export interface ChatThread {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  questions: QAItem[]
}

export interface SavedSession {
  id: string
  createdAt: string
  hobby: string
  level: string
  icon: string | null
  plan: HobbyPlan
  sectionsGenerated?: number
  sectionModuleCounts?: number[]
  completedTaskIds: string[]
  streak: StreakState
  lessons: Lesson[]
  chatThreads?: ChatThread[]
  activeChatId?: string | null
  // Legacy mirror for compatibility with existing UI/code paths.
  questions: QAItem[]
}

export function useSessionsHistory() {
  const { history, saveSnapshot, deleteSession, clearAllSessions } = useAppData()
  return { history, saveSnapshot, deleteSession, clearAllSessions }
}
