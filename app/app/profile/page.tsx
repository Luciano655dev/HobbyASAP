"use client"

import { useEffect, useMemo, useState } from "react"
import { useSessionsHistory } from "../hooks/useSessionsHistory"
import { useGlobalXpStats } from "../hooks/useXpStats"
import { LS_CURRENT_SESSION_KEY, SESSIONS_UPDATED_EVENT } from "../constants"

function getSessionChatCount(session: {
  chatThreads?: { questions: { id: string }[] }[]
  questions: { id: string }[]
}) {
  if (Array.isArray(session.chatThreads) && session.chatThreads.length > 0) {
    return session.chatThreads.reduce(
      (total, thread) => total + thread.questions.length,
      0
    )
  }
  return session.questions.length
}

export default function ProfilePage() {
  const { history } = useSessionsHistory()
  const xpStats = useGlobalXpStats(history)
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)

  useEffect(() => {
    function syncCurrentSession() {
      if (typeof window === "undefined") return
      setCurrentSessionId(localStorage.getItem(LS_CURRENT_SESSION_KEY))
    }

    syncCurrentSession()
    window.addEventListener(SESSIONS_UPDATED_EVENT, syncCurrentSession)
    window.addEventListener("storage", syncCurrentSession)

    return () => {
      window.removeEventListener(SESSIONS_UPDATED_EVENT, syncCurrentSession)
      window.removeEventListener("storage", syncCurrentSession)
    }
  }, [])

  const currentSession = useMemo(() => {
    if (!history.length) return null
    return (
      history.find((session) => session.id === currentSessionId) ?? history[0]
    )
  }, [history, currentSessionId])

  const maxStreak = useMemo(() => {
    return history.reduce(
      (max, session) => Math.max(max, session.streak.longest),
      0
    )
  }, [history])

  const aggregateStats = useMemo(() => {
    let totalModules = 0
    let completedModules = 0
    let totalDeepDives = 0
    let totalAiChats = 0
    let readModules = 0
    let quizModules = 0
    let completedCourses = 0

    for (const session of history) {
      const modules = Array.isArray(session.plan?.modules) ? session.plan.modules : []
      const moduleIds = new Set(modules.map((m) => m.id))
      const completedModuleCount = session.completedTaskIds.filter((id) =>
        moduleIds.has(id)
      ).length

      totalModules += modules.length
      completedModules += completedModuleCount
      totalDeepDives += session.lessons.length
      totalAiChats += getSessionChatCount(session)
      readModules += modules.filter((m) => m.type === "read").length
      quizModules += modules.filter((m) => m.type === "quiz").length
      if (modules.length > 0 && completedModuleCount === modules.length) {
        completedCourses += 1
      }
    }

    const completionRate =
      totalModules === 0
        ? 0
        : Math.round((completedModules / totalModules) * 100)
    const avgCompletionPerCourse =
      history.length === 0 ? 0 : Math.round(completedModules / history.length)

    return {
      totalModules,
      completedModules,
      completionRate,
      avgCompletionPerCourse,
      totalDeepDives,
      totalAiChats,
      readModules,
      quizModules,
      completedCourses,
    }
  }, [history])

  const currentCourseStats = useMemo(() => {
    if (!currentSession) return null

    const modules = Array.isArray(currentSession.plan?.modules)
      ? currentSession.plan.modules
      : []
    const moduleIds = new Set(modules.map((m) => m.id))
    const completedModules = currentSession.completedTaskIds.filter((id) =>
      moduleIds.has(id)
    ).length
    const completionPercent =
      modules.length === 0 ? 0 : Math.round((completedModules / modules.length) * 100)
    const readModules = modules.filter((m) => m.type === "read").length
    const quizModules = modules.filter((m) => m.type === "quiz").length

    return {
      totalModules: modules.length,
      completedModules,
      completionPercent,
      readModules,
      quizModules,
      deepDives: currentSession.lessons.length,
      aiChats: getSessionChatCount(currentSession),
    }
  }, [currentSession])

  const mostFocusedCourse = useMemo(() => {
    if (!history.length) return null

    const scored = history.map((session) => {
      const totalModules = session.plan.modules.length
      const moduleCompletions = session.completedTaskIds.filter((id) =>
        session.plan.modules.some((m) => m.id === id)
      ).length
      const score =
        moduleCompletions * 4 +
        session.lessons.length +
        getSessionChatCount(session)

      return {
        session,
        score,
        moduleCompletions,
        totalModules,
        completionPercent:
          totalModules === 0 ? 0 : Math.round((moduleCompletions / totalModules) * 100),
      }
    })

    scored.sort((a, b) => b.score - a.score)
    return scored[0]
  }, [history])

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-text">Profile</h1>
      <p className="mt-1 text-sm text-muted">Overall progress and activity.</p>

      <div className="mt-6 rounded-2xl border border-border bg-surface p-4 sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          Level
        </p>
        <div className="mt-1 flex flex-wrap items-baseline gap-x-2">
          <p className="text-2xl font-bold text-text">
            Level {xpStats.levelNumber}
          </p>
          <p className="text-sm text-muted">{xpStats.levelLabel}</p>
        </div>
        <p className="mt-1 text-xs text-muted">
          {xpStats.xpInLevel}/{xpStats.xpForNextLevel} XP to next level
        </p>
        <div className="mt-2 h-2 rounded-full bg-surface-2">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-accent to-accent-strong"
            style={{ width: `${xpStats.levelProgressPercent}%` }}
          />
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Current streak"
          value={`${currentSession?.streak.current ?? 0} days`}
          note={currentSession ? `In ${currentSession.hobby}` : "No active course"}
        />
        <StatCard
          label="Max streak"
          value={`${maxStreak} days`}
          note="Best across all courses"
        />
        <StatCard
          label="Total XP"
          value={`${xpStats.totalXp} XP`}
          note="Across all courses"
        />
        <StatCard
          label="Module completion"
          value={`${aggregateStats.completionRate}%`}
          note={`${aggregateStats.completedModules}/${aggregateStats.totalModules} modules`}
        />
        <StatCard
          label="Courses"
          value={`${history.length}`}
          note={history.length === 1 ? "Saved course" : "Saved courses"}
        />
        <StatCard
          label="Courses completed"
          value={`${aggregateStats.completedCourses}`}
          note="Fully completed paths"
        />
        <StatCard
          label="Deep dives"
          value={`${aggregateStats.totalDeepDives}`}
          note="Generated explanations"
        />
        <StatCard
          label="AI chats"
          value={`${aggregateStats.totalAiChats}`}
          note="Questions asked to AI"
        />
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-surface p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          Current course snapshot
        </p>
        {!currentSession || !currentCourseStats ? (
          <p className="mt-2 text-sm text-muted">No active course yet.</p>
        ) : (
          <div className="mt-2">
            <p className="text-base font-semibold text-text">{currentSession.hobby}</p>
            <p className="text-xs text-muted">{currentSession.level}</p>
            <p className="mt-2 text-sm text-muted">
              {currentCourseStats.completedModules}/{currentCourseStats.totalModules} modules complete (
              {currentCourseStats.completionPercent}%)
            </p>
            <div className="mt-2 h-2 rounded-full bg-surface-2">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-accent to-accent-strong"
                style={{ width: `${currentCourseStats.completionPercent}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-muted">
              {currentCourseStats.readModules} reading modules,{" "}
              {currentCourseStats.quizModules} quiz modules,{" "}
              {currentCourseStats.deepDives} deep dives and{" "}
              {currentCourseStats.aiChats} AI chats.
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-surface p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          Learning footprint
        </p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <p className="rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm text-muted">
            {aggregateStats.readModules} reading modules and{" "}
            {aggregateStats.quizModules} quiz modules across all courses.
          </p>
          <p className="rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm text-muted">
            Average of {aggregateStats.avgCompletionPerCourse} modules completed per course.
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-surface p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          Most focused course
        </p>
        {!mostFocusedCourse ? (
          <p className="mt-2 text-sm text-muted">No course data yet.</p>
        ) : (
          <div className="mt-2">
            <p className="text-base font-semibold text-text">
              {mostFocusedCourse.session.hobby}
            </p>
            <p className="text-xs text-muted">
              {mostFocusedCourse.session.level}
            </p>
            <p className="mt-2 text-sm text-muted">
              {mostFocusedCourse.moduleCompletions}/{mostFocusedCourse.totalModules} modules complete (
              {mostFocusedCourse.completionPercent}%),{" "}
              {mostFocusedCourse.session.lessons.length} generated lessons,{" "}
              {getSessionChatCount(mostFocusedCourse.session)} AI chats.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

function StatCard({
  label,
  value,
  note,
}: {
  label: string
  value: string
  note: string
}) {
  return (
    <article className="rounded-2xl border border-border bg-surface p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </p>
      <p className="mt-1 text-xl font-bold text-text">{value}</p>
      <p className="mt-1 text-xs text-muted">{note}</p>
    </article>
  )
}
