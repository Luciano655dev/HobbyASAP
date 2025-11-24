// app/hooks/useXpStats.tsx
"use client"

import { useMemo } from "react"
import { HobbyPlan, Lesson } from "../types"
import buildTaskId from "../helpers/buildTaskId"
import { SavedSession } from "./useSessionsHistory"

const LESSON_PRACTICE_XP = 10
const XP_PER_LEVEL = 120

export interface XpStatsResult {
  totalXp: number
  levelNumber: number
  xpInLevel: number
  xpForNextLevel: number
  levelProgressPercent: number
  levelLabel: string
}

// ----- internal helper: compute total XP for a single session -----
function computeTotalXp(
  plan: HobbyPlan | null,
  lessons: Lesson[],
  completedTaskIds: string[]
): number {
  let totalXp = 0

  if (plan) {
    for (const section of plan.sections) {
      if (section.kind === "today" || section.kind === "checklist") {
        section.items.forEach((item, index) => {
          const id = buildTaskId(section.id, index, item.label)
          if (completedTaskIds.includes(id)) {
            totalXp += item.xp ?? 10
          }
        })
      }
    }
  }

  lessons.forEach((lesson, lessonIndex) => {
    lesson.practiceIdeas?.forEach((idea, practiceIndex) => {
      const id = buildTaskId(`lesson-${lessonIndex}`, practiceIndex, idea)
      if (completedTaskIds.includes(id)) {
        totalXp += LESSON_PRACTICE_XP
      }
    })
  })

  return totalXp
}

// ----- old hook: per-session XP (still useful if you ever want it) -----
export function useXpStats(
  plan: HobbyPlan | null,
  lessons: Lesson[],
  completedTaskIds: string[]
): XpStatsResult {
  return useMemo(() => {
    const totalXp = computeTotalXp(plan, lessons, completedTaskIds)

    const levelNumber = Math.floor(totalXp / XP_PER_LEVEL) + 1
    const baseXpForCurrentLevel = (levelNumber - 1) * XP_PER_LEVEL
    const xpInLevel = Math.max(0, totalXp - baseXpForCurrentLevel)
    const xpForNextLevel = XP_PER_LEVEL
    const levelProgressPercent = Math.min(
      100,
      Math.round((xpInLevel / xpForNextLevel) * 100)
    )

    const levelLabel =
      levelNumber === 1
        ? "New explorer"
        : levelNumber === 2
        ? "Getting consistent"
        : levelNumber === 3
        ? "Serious hobbyist"
        : levelNumber === 4
        ? "Hobby grinder"
        : "Quest master"

    return {
      totalXp,
      levelNumber,
      xpInLevel,
      xpForNextLevel,
      levelProgressPercent,
      levelLabel,
    }
  }, [plan, lessons, completedTaskIds])
}

// ----- NEW: global XP across all sessions in history -----
export function useGlobalXpStats(sessions: SavedSession[]): XpStatsResult {
  return useMemo(() => {
    const totalXp = sessions.reduce((sum, session) => {
      return (
        sum +
        computeTotalXp(session.plan, session.lessons, session.completedTaskIds)
      )
    }, 0)

    const levelNumber = Math.floor(totalXp / XP_PER_LEVEL) + 1
    const baseXpForCurrentLevel = (levelNumber - 1) * XP_PER_LEVEL
    const xpInLevel = Math.max(0, totalXp - baseXpForCurrentLevel)
    const xpForNextLevel = XP_PER_LEVEL
    const levelProgressPercent = Math.min(
      100,
      Math.round((xpInLevel / xpForNextLevel) * 100)
    )

    const levelLabel =
      levelNumber === 1
        ? "New explorer"
        : levelNumber === 2
        ? "Getting consistent"
        : levelNumber === 3
        ? "Serious hobbyist"
        : levelNumber === 4
        ? "Hobby grinder"
        : "Quest master"

    return {
      totalXp,
      levelNumber,
      xpInLevel,
      xpForNextLevel,
      levelProgressPercent,
      levelLabel,
    }
  }, [sessions])
}
