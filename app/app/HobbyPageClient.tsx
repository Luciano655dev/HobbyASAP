"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { HobbyPlan, Lesson, LessonKind, ModuleInDepthContext } from "./types"
import type { QAItem } from "./AskQuestionPanel"
import {
  useSessionsHistory,
  INITIAL_STREAK,
  SavedSession,
  StreakState,
} from "./hooks/useSessionsHistory"
import PlanHeader from "./components/PlanHeader"
import ModulesPath from "./components/ModulesPath"
import {
  LS_CURRENT_SESSION_KEY,
  MAX_DEEP_DIVES_PER_COURSE,
  MAX_SECTIONS_PER_COURSE,
  SESSIONS_UPDATED_EVENT,
} from "./constants"

export default function HobbyPageClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { history, saveSnapshot } = useSessionsHistory()

  const [sessionHobby, setSessionHobby] = useState<string>("")
  const [sessionLevel, setSessionLevel] = useState<string>("")
  const [plan, setPlan] = useState<HobbyPlan | null>(null)
  const [error, setError] = useState("")
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([])
  const [streak, setStreak] = useState<StreakState>(INITIAL_STREAK)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [lessonLoading, setLessonLoading] = useState(false)
  const [sectionLoading, setSectionLoading] = useState(false)
  const [questions, setQuestions] = useState<QAItem[]>([])
  const [chatThreads, setChatThreads] = useState<SavedSession["chatThreads"]>([])
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [sectionsGenerated, setSectionsGenerated] = useState(1)
  const [sectionModuleCounts, setSectionModuleCounts] = useState<number[]>([])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [sessionCreatedAt, setSessionCreatedAt] = useState<string | null>(null)

  const setCurrentSession = useCallback((sessionIdToSet: string) => {
    if (typeof window === "undefined") return
    localStorage.setItem(LS_CURRENT_SESSION_KEY, sessionIdToSet)
    window.dispatchEvent(new Event(SESSIONS_UPDATED_EVENT))
  }, [])

  const moduleIds = useMemo(() => {
    if (!plan) return []
    return plan.modules.map((module) => module.id)
  }, [plan])

  const progress = useMemo(() => {
    if (!plan || moduleIds.length === 0) return 0
    const done = moduleIds.filter((id) => completedTaskIds.includes(id)).length
    return Math.round((done / moduleIds.length) * 100)
  }, [plan, moduleIds, completedTaskIds])

  const dailySessionCompleted = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10)
    return streak.lastActiveDate === todayStr
  }, [streak.lastActiveDate])

  const themeFrom = "var(--accent-strong)"
  const themeTo = "var(--accent)"

  function updateStreakOnTaskCheck() {
    const today = new Date()
    const todayStr = today.toISOString().slice(0, 10)

    setStreak((prev) => {
      if (prev.lastActiveDate === todayStr) {
        return prev
      }

      let newCurrent = 1
      if (prev.lastActiveDate) {
        const prevDate = new Date(prev.lastActiveDate)
        const diffMs = today.getTime() - prevDate.getTime()
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
        newCurrent = diffDays === 1 ? prev.current + 1 : 1
      }

      return {
        current: newCurrent,
        longest: Math.max(prev.longest, newCurrent),
        lastActiveDate: todayStr,
      }
    })
  }

  const loadFromHistory = useCallback(
    (session: SavedSession) => {
      setSessionHobby(session.hobby)
      setSessionLevel(session.level)
      setError("")
      setCompletedTaskIds(session.completedTaskIds)
      setPlan(session.plan)
      setLessons(session.lessons)
      setQuestions(session.questions)
      setChatThreads(session.chatThreads ?? [])
      setActiveChatId(session.activeChatId ?? null)
      setSectionsGenerated(session.sectionsGenerated ?? 1)
      setSectionModuleCounts(
        session.sectionModuleCounts && session.sectionModuleCounts.length > 0
          ? session.sectionModuleCounts
          : [session.plan.modules.length]
      )
      setStreak(session.streak)
      setSessionId(session.id)
      setSessionCreatedAt(session.createdAt)
      setCurrentSession(session.id)
    },
    [setCurrentSession]
  )

  useEffect(() => {
    if (!history.length) return

    const fromQuery = searchParams.get("sessionId")
    const storedCurrent =
      typeof window !== "undefined"
        ? localStorage.getItem(LS_CURRENT_SESSION_KEY)
        : null
    const targetSessionId = fromQuery || storedCurrent || history[0]?.id
    if (!targetSessionId || targetSessionId === sessionId) return

    const targetSession = history.find((item) => item.id === targetSessionId)
    if (!targetSession) return
    loadFromHistory(targetSession)
  }, [history, searchParams, sessionId, loadFromHistory])

  useEffect(() => {
    if (!plan || !sessionId) return

    const createdAt = sessionCreatedAt || new Date().toISOString()
    const snapshot: SavedSession = {
      id: sessionId,
      createdAt,
      hobby: sessionHobby,
      level: sessionLevel,
      icon: plan.icon || null,
      plan,
      sectionsGenerated,
      sectionModuleCounts,
      completedTaskIds,
      streak,
      lessons,
      chatThreads,
      activeChatId,
      questions,
    }

    setSessionCreatedAt(createdAt)
    saveSnapshot(snapshot)
  }, [
    plan,
    completedTaskIds,
    streak,
    lessons,
    sectionsGenerated,
    sectionModuleCounts,
    chatThreads,
    activeChatId,
    questions,
    sessionId,
    sessionCreatedAt,
    sessionHobby,
    sessionLevel,
    saveSnapshot,
  ])

  function toggleTask(id: string) {
    setCompletedTaskIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((x) => x !== id)
      }
      updateStreakOnTaskCheck()
      return [...prev, id]
    })
  }

  async function openLesson(
    kind: LessonKind,
    topic: string,
    moduleContext?: ModuleInDepthContext
  ) {
    if (!plan) return
    if (lessons.length >= MAX_DEEP_DIVES_PER_COURSE) {
      setError(
        `Deep dive limit reached (${MAX_DEEP_DIVES_PER_COURSE}) for this course.`
      )
      return
    }
    setLessonLoading(true)
    setError("")

    try {
      const language = localStorage.getItem("hobbyasap_lang") ?? "en"
      const res = await fetch("/api/lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hobby: plan.hobby,
          level: plan.level,
          kind,
          topic,
          language,
          moduleContext,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to load lesson.")
      }

      const data = await res.json()
      const newLesson: Lesson = {
        ...(data.lesson as Lesson),
        sourceSessionId: sessionId ?? undefined,
        sourceCourseHobby: sessionHobby || plan.hobby,
        sourceModuleId: moduleContext?.moduleId,
        sourceModuleTitle: moduleContext?.title ?? topic,
      }
      const nextLessons = [...lessons, newLesson]
      setLessons(nextLessons)

      if (sessionId) {
        const createdAt = sessionCreatedAt || new Date().toISOString()
        saveSnapshot({
          id: sessionId,
          createdAt,
          hobby: sessionHobby,
          level: sessionLevel,
          icon: plan.icon || null,
          plan,
          sectionsGenerated,
          sectionModuleCounts,
          completedTaskIds,
          streak,
          lessons: nextLessons,
          chatThreads,
          activeChatId,
          questions,
        })
      }

      router.push("/app/deep-dives?openLatest=1")
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong generating the lesson."
      )
    } finally {
      setLessonLoading(false)
    }
  }

  async function generateNextSection() {
    if (!plan || !sessionId) return
    if (sectionsGenerated >= MAX_SECTIONS_PER_COURSE) {
      setError(`Section limit reached (${MAX_SECTIONS_PER_COURSE}) for this course.`)
      return
    }
    setSectionLoading(true)
    setError("")
    let timeoutId: ReturnType<typeof setTimeout> | undefined

    try {
      const language = localStorage.getItem("hobbyasap_lang") ?? "en"
      const controller = new AbortController()
      timeoutId = setTimeout(() => controller.abort(), 30000)

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hobby: plan.hobby,
          level: plan.level,
          language,
          existingModules: plan.modules,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to generate next section.")
      }

      const data = await res.json()
      const nextPlan = data.plan as HobbyPlan
      const addedModules = Array.isArray(nextPlan.modules) ? nextPlan.modules : []
      if (addedModules.length === 0) {
        throw new Error("AI did not return modules for the next section.")
      }

      const mergedPlan: HobbyPlan = {
        ...plan,
        modules: [...plan.modules, ...addedModules],
      }
      setPlan(mergedPlan)
      setSectionsGenerated((prev) => prev + 1)
      setSectionModuleCounts((prev) => [...prev, addedModules.length])
    } catch (err: unknown) {
      setError(
        err instanceof Error && err.name === "AbortError"
          ? "Section generation timed out. Please try again."
          : err instanceof Error
          ? err.message
          : "Something went wrong generating the next section."
      )
    } finally {
      if (timeoutId) clearTimeout(timeoutId)
      setSectionLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-app-bg text-text flex justify-center px-4 py-8 sm:py-10">
      <div className="w-full max-w-5xl">
        {error && (
          <p className="mb-5 text-sm text-danger bg-danger/10 border border-danger/40 rounded-xl px-3 py-2">
            {error}
          </p>
        )}

        {plan ? (
          <>
            <section className="mb-8">
              <PlanHeader
                plan={plan}
                themeFrom={themeFrom}
                themeTo={themeTo}
                progress={progress}
                dailySessionCompleted={dailySessionCompleted}
                sectionsGenerated={sectionsGenerated}
              />
            </section>

            <ModulesPath
              key={`${sessionId ?? "no-session"}:${searchParams.get("moduleId") ?? "no-module"}`}
              plan={plan}
              completedTaskIds={completedTaskIds}
              sectionModuleCounts={sectionModuleCounts}
              onToggleTask={toggleTask}
              onOpenLesson={openLesson}
              lessonLoading={lessonLoading}
              sectionLoading={sectionLoading}
              sectionsGenerated={sectionsGenerated}
              maxSections={MAX_SECTIONS_PER_COURSE}
              onGenerateNextSection={generateNextSection}
              initialOpenModuleId={searchParams.get("moduleId")}
            />
          </>
        ) : (
          <section className="rounded-2xl border border-border bg-surface p-6 text-center">
            <h1 className="text-xl font-semibold text-text">No current course loaded</h1>
            <p className="mt-2 text-sm text-muted">
              Select one in Courses or create a new one.
            </p>
            <div className="mt-4 flex items-center justify-center gap-3">
              <Link
                href="/app/courses"
                className="rounded-xl border border-border bg-surface-2 px-4 py-2 text-sm font-medium text-text hover:bg-surface"
              >
                Open courses
              </Link>
              <Link
                href="/app/courses/new"
                className="rounded-xl bg-accent-strong px-4 py-2 text-sm font-semibold text-white hover:bg-accent"
              >
                Create course
              </Link>
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
