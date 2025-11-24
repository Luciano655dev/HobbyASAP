"use client"

import { useEffect, useState, useCallback } from "react"
import { HobbyPlan, Lesson } from "../types"
import { QAItem } from "../AskQuestionPanel"

const LS_SESSIONS_KEY = "hobbyasap_sessions_v1"

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
  const [history, setHistory] = useState<SavedSession[]>([])

  // Load from localStorage once
  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const raw = localStorage.getItem(LS_SESSIONS_KEY)
      if (raw) {
        setHistory(JSON.parse(raw))
      }
    } catch {
      // ignore
    }
  }, [])

  const persist = useCallback((next: SavedSession[]) => {
    setHistory(next)
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(LS_SESSIONS_KEY, JSON.stringify(next))
      }
    } catch {
      // ignore
    }
  }, [])

  const saveSnapshot = useCallback((snapshot: SavedSession) => {
    setHistory((prev) => {
      const updated = [
        snapshot,
        ...prev.filter((s) => s.id !== snapshot.id),
      ].slice(0, 20)
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem(LS_SESSIONS_KEY, JSON.stringify(updated))
        }
      } catch {
        // ignore
      }
      return updated
    })
  }, [])

  const deleteSession = useCallback((id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((s) => s.id !== id)
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem(LS_SESSIONS_KEY, JSON.stringify(updated))
        }
      } catch {
        // ignore
      }
      return updated
    })
  }, [])

  const clearAllSessions = useCallback(() => {
    persist([])
    if (typeof window !== "undefined") {
      localStorage.removeItem(LS_SESSIONS_KEY)
    }
  }, [persist])

  return { history, saveSnapshot, deleteSession, clearAllSessions }
}
