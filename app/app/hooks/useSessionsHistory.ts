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

export interface SavedSession {
  id: string
  createdAt: string
  hobby: string
  level: string
  icon: string | null
  plan: HobbyPlan
  completedTaskIds: string[]
  streak: StreakState
  lessons: Lesson[]
  questions: QAItem[]
}

export function useSessionsHistory() {
  const [history, setHistory] = useState<SavedSession[]>(() => {
    if (typeof window === "undefined") return []
    try {
      const raw = localStorage.getItem(LS_SESSIONS_KEY)
      const parsed = raw ? JSON.parse(raw) : []
      return Array.isArray(parsed) ? parsed : []
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
    setHistory((prev) => {
      return [snapshot, ...prev.filter((s) => s.id !== snapshot.id)].slice(0, 20)
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
