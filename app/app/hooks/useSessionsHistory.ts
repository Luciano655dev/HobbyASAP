"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { HobbyPlan, Lesson } from "../types"
import { QAItem } from "../AskQuestionPanel"
import { LS_SESSIONS_KEY, SESSIONS_UPDATED_EVENT } from "../constants"

function emitSessionsUpdatedEvent() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(SESSIONS_UPDATED_EVENT))
  }
}

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

function buildFallbackChatTitle(questions: QAItem[]): string {
  const firstQuestion = questions[0]?.question?.trim()
  if (!firstQuestion) return "New chat"
  return firstQuestion.length > 48
    ? `${firstQuestion.slice(0, 48)}...`
    : firstQuestion
}

function normalizeSession(raw: SavedSession): SavedSession {
  const nowIso = new Date().toISOString()
  const legacyQuestions = Array.isArray(raw.questions) ? raw.questions : []
  const incomingThreads = Array.isArray(raw.chatThreads)
    ? raw.chatThreads
        .filter((thread) => thread && typeof thread.id === "string")
        .map((thread) => ({
          id: thread.id,
          title:
            typeof thread.title === "string" && thread.title.trim()
              ? thread.title.trim()
              : buildFallbackChatTitle(
                  Array.isArray(thread.questions) ? thread.questions : []
                ),
          createdAt:
            typeof thread.createdAt === "string" && thread.createdAt
              ? thread.createdAt
              : nowIso,
          updatedAt:
            typeof thread.updatedAt === "string" && thread.updatedAt
              ? thread.updatedAt
              : nowIso,
          questions: Array.isArray(thread.questions) ? thread.questions : [],
        }))
    : []

  const chatThreads =
    incomingThreads.length > 0
      ? incomingThreads
      : [
          {
            id: `chat_legacy_${raw.id}`,
            title: buildFallbackChatTitle(legacyQuestions),
            createdAt: raw.createdAt || nowIso,
            updatedAt: raw.createdAt || nowIso,
            questions: legacyQuestions,
          },
        ]

  const activeChatId =
    typeof raw.activeChatId === "string" &&
    chatThreads.some((thread) => thread.id === raw.activeChatId)
      ? raw.activeChatId
      : chatThreads[0]?.id ?? null

  const activeChatQuestions =
    chatThreads.find((thread) => thread.id === activeChatId)?.questions ?? []

  return {
    ...raw,
    sectionsGenerated:
      typeof raw.sectionsGenerated === "number" && raw.sectionsGenerated > 0
        ? raw.sectionsGenerated
        : 1,
    sectionModuleCounts:
      Array.isArray(raw.sectionModuleCounts) &&
      raw.sectionModuleCounts.length > 0 &&
      raw.sectionModuleCounts.every(
        (count) => Number.isInteger(count) && count > 0
      )
        ? raw.sectionModuleCounts
        : [Array.isArray(raw.plan?.modules) ? raw.plan.modules.length : 0].filter(
            (count) => count > 0
          ),
    chatThreads,
    activeChatId,
    questions: activeChatQuestions,
  }
}

export function useSessionsHistory() {
  const [history, setHistory] = useState<SavedSession[]>(() => {
    if (typeof window === "undefined") return []
    try {
      const raw = localStorage.getItem(LS_SESSIONS_KEY)
      const parsed = raw ? JSON.parse(raw) : []
      return Array.isArray(parsed)
        ? parsed.map((session) => normalizeSession(session as SavedSession))
        : []
    } catch {
      return []
    }
  })
  const isFirstSyncRef = useRef(true)

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      if (history.length === 0) {
        localStorage.removeItem(LS_SESSIONS_KEY)
      } else {
        localStorage.setItem(LS_SESSIONS_KEY, JSON.stringify(history))
      }
    } catch {
      // ignore
    }

    // Avoid broadcasting on the first mount hydration sync.
    if (isFirstSyncRef.current) {
      isFirstSyncRef.current = false
      return
    }
    emitSessionsUpdatedEvent()
  }, [history])

  const saveSnapshot = useCallback((snapshot: SavedSession) => {
    const normalized = normalizeSession(snapshot)
    setHistory((prev) => {
      return [normalized, ...prev.filter((s) => s.id !== normalized.id)].slice(0, 20)
    })
  }, [])

  const deleteSession = useCallback((id: string) => {
    setHistory((prev) => prev.filter((s) => s.id !== id))
  }, [])

  const clearAllSessions = useCallback(() => {
    setHistory([])
  }, [])

  return { history, saveSnapshot, deleteSession, clearAllSessions }
}
