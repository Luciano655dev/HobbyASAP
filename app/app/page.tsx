// app/page.tsx
"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import AskQuestionPanel, { QAItem } from "./AskQuestionPanel"
import {
  HobbyPlan,
  PlanSection,
  IntroSection,
  RoadmapSection,
  WeeklySection,
  ChecklistSection,
  ResourcesSection,
  GearSection,
  TipsSection,
  AdvancedSection,
  TodaySection,
  Lesson,
  LessonKind,
} from "./types"
import buildTaskId from "./helpers/buildTaskId"

const LS_SESSIONS_KEY = "hobbyasap_sessions_v1"

interface QuestionTurn {
  id: string
  question: string
  answer: string
  createdAt: string
}

interface StreakState {
  current: number
  longest: number
  lastActiveDate: string | null // "YYYY-MM-DD"
}

interface SavedSession {
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

const INITIAL_STREAK: StreakState = {
  current: 0,
  longest: 0,
  lastActiveDate: null,
}

export default function Page() {
  const [hobby, setHobby] = useState("")
  const [level, setLevel] = useState("complete beginner")

  const [plan, setPlan] = useState<HobbyPlan | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([])
  const [history, setHistory] = useState<SavedSession[]>([])
  const [streak, setStreak] = useState<StreakState>(INITIAL_STREAK)

  // Lessons rendered on the page
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [lessonLoading, setLessonLoading] = useState(false)
  const [lessonError, setLessonError] = useState("")
  const [lessonLastTopic, setLessonLastTopic] = useState<string | null>(null)

  // Q&A
  const [questions, setQuestions] = useState<QAItem[]>([])

  // Current session identity
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [sessionCreatedAt, setSessionCreatedAt] = useState<string | null>(null)

  // Refs for scrolling
  const planRef = useRef<HTMLDivElement | null>(null)
  const lessonsEndRef = useRef<HTMLDivElement | null>(null)

  // Load sessions history from localStorage once
  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const raw = localStorage.getItem(LS_SESSIONS_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as SavedSession[]
        setHistory(parsed)
      }
    } catch {
      // ignore parse errors
    }
  }, [])

  // Scroll to plan when a new plan is set
  useEffect(() => {
    if (plan && planRef.current) {
      planRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [plan])

  // Scroll to bottom when a new lesson is added
  useEffect(() => {
    if (lessons.length > 0 && lessonsEndRef.current) {
      lessonsEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      })
    }
  }, [lessons.length])

  // Auto-save session snapshot whenever important things change
  useEffect(() => {
    if (!plan || !sessionId) return

    const createdAt = sessionCreatedAt || new Date().toISOString()

    const snapshot: SavedSession = {
      id: sessionId,
      createdAt,
      hobby,
      level,
      icon: plan.icon || null,
      plan,
      completedTaskIds,
      streak,
      lessons,
      questions,
    }

    setSessionCreatedAt(createdAt)

    setHistory((prev) => {
      const withoutCurrent = prev.filter((s) => s.id !== sessionId)
      const updated = [snapshot, ...withoutCurrent].slice(0, 20)
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem(LS_SESSIONS_KEY, JSON.stringify(updated))
        }
      } catch {
        // ignore storage errors
      }
      return updated
    })
  }, [
    plan,
    completedTaskIds,
    streak,
    lessons,
    questions,
    hobby,
    level,
    sessionId,
    sessionCreatedAt,
  ])

  const allTasks = useMemo(() => {
    if (!plan) return []
    const tasks: { id: string; label: string; isToday: boolean }[] = []

    for (const section of plan.sections) {
      if (section.kind === "today" || section.kind === "checklist") {
        section.items.forEach((item, index) => {
          const id = buildTaskId(section.id, index, item.label)
          tasks.push({
            id,
            label: item.label,
            isToday: section.kind === "today",
          })
        })
      }
    }

    return tasks
  }, [plan])

  const progress = useMemo(() => {
    if (!plan || allTasks.length === 0) return 0
    const done = allTasks.filter((t) => completedTaskIds.includes(t.id)).length
    return Math.round((done / allTasks.length) * 100)
  }, [plan, allTasks, completedTaskIds])

  const dailySessionCompleted = useMemo(() => {
    if (!plan) return false
    const todayTasks = allTasks.filter((t) => t.isToday)
    if (todayTasks.length === 0) return false
    return todayTasks.every((t) => completedTaskIds.includes(t.id))
  }, [plan, allTasks, completedTaskIds])

  // XP & level based on completed tasks + lesson practice items
  const xpStats = useMemo(() => {
    const LESSON_PRACTICE_XP = 10
    const XP_PER_LEVEL: number = 120

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

  const theme = {
    from: plan?.theme?.from || "#10b981ff",
    to: plan?.theme?.to || "#020617ff",
  }

  const icon = plan?.icon

  // ---- Streak helper ----
  function updateStreakOnTaskCheck() {
    const today = new Date()
    const todayStr = today.toISOString().slice(0, 10) // YYYY-MM-DD

    setStreak((prev) => {
      if (prev.lastActiveDate === todayStr) {
        return prev // already counted today
      }

      let newCurrent = 1
      if (prev.lastActiveDate) {
        const prevDate = new Date(prev.lastActiveDate)
        const diffMs = today.getTime() - prevDate.getTime()
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

        if (diffDays === 1) {
          newCurrent = prev.current + 1
        } else {
          newCurrent = 1
        }
      }

      const newLongest = Math.max(prev.longest, newCurrent)

      return {
        current: newCurrent,
        longest: newLongest,
        lastActiveDate: todayStr,
      }
    })
  }

  // ---- History helpers ----

  function deleteHistoryItem(id: string) {
    setHistory((prev) => {
      const updated = prev.filter((h) => h.id !== id)
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem(LS_SESSIONS_KEY, JSON.stringify(updated))
        }
      } catch {
        // ignore
      }
      // If we just deleted the active session, reset current view
      if (id === sessionId) {
        setPlan(null)
        setCompletedTaskIds([])
        setLessons([])
        setQuestions([])
        setStreak(INITIAL_STREAK)
        setSessionId(null)
        setSessionCreatedAt(null)
      }
      return updated
    })
  }

  function clearHistory() {
    setHistory([])
    if (typeof window !== "undefined") {
      localStorage.removeItem(LS_SESSIONS_KEY)
    }
    setPlan(null)
    setCompletedTaskIds([])
    setLessons([])
    setQuestions([])
    setStreak(INITIAL_STREAK)
    setSessionId(null)
    setSessionCreatedAt(null)
  }

  function loadFromHistory(session: SavedSession) {
    setHobby(session.hobby)
    setLevel(session.level)
    setError("")
    setCompletedTaskIds(session.completedTaskIds)
    setPlan(session.plan)
    setLessons(session.lessons)
    setQuestions(session.questions)
    setStreak(session.streak)
    setSessionId(session.id)
    setSessionCreatedAt(session.createdAt)
    setLessonError("")
    setLessonLastTopic(null)
  }

  // ---- API / form ----

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setPlan(null)
    setCompletedTaskIds([])
    setLessons([])
    setQuestions([])
    setStreak(INITIAL_STREAK)
    setLessonError("")
    setLessonLastTopic(null)

    if (!hobby.trim()) {
      setError("Please type a hobby.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hobby, level }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to generate plan.")
      }

      const data = await res.json()
      const newPlan = data.plan as HobbyPlan
      setPlan(newPlan)

      const newSessionId = `${hobby.toLowerCase()}_${Date.now()}`
      setSessionId(newSessionId)
      setSessionCreatedAt(new Date().toISOString())
    } catch (err: any) {
      setError(err.message || "Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  function toggleTask(id: string) {
    setCompletedTaskIds((prev) => {
      if (prev.includes(id)) {
        // unchecking
        return prev.filter((x) => x !== id)
      } else {
        // checking
        updateStreakOnTaskCheck()
        return [...prev, id]
      }
    })
  }

  // ---- Lessons: masterclass / in-depth ----

  async function openLesson(kind: LessonKind, topic: string) {
    if (!plan) return
    setLessonError("")
    setLessonLoading(true)
    setLessonLastTopic(topic)

    try {
      const res = await fetch("/api/lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hobby: plan.hobby,
          level: plan.level,
          kind,
          topic,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to load lesson.")
      }

      const data = await res.json()
      const newLesson = data.lesson as Lesson

      setLessons((prev) => [...prev, newLesson])
    } catch (err: any) {
      setLessonError(
        err.message || "Something went wrong generating the lesson."
      )
    } finally {
      setLessonLoading(false)
    }
  }

  function handleRemoveLesson(index: number) {
    setLessons((prev) => prev.filter((_, i) => i !== index))
  }

  // ---- Questions handlers (AskQuestionPanel will call these) ----

  function handleQuestionAdded(item: QAItem) {
    setQuestions((prev) => [...prev, item])
  }

  function handleQuestionDeleted(id: string) {
    setQuestions((prev) => prev.filter((q) => q.id !== id))
  }

  // ---- Render helpers for each main plan section ----

  function renderSection(section: PlanSection) {
    switch (section.kind) {
      case "intro": {
        const s = section as IntroSection
        return (
          <div
            key={s.id}
            className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-md"
          >
            <h3 className="text-base font-semibold mb-2 text-slate-50">
              {s.title}
            </h3>
            {s.description && (
              <p className="text-xs text-slate-400 mb-2">{s.description}</p>
            )}
            <p className="text-sm text-slate-100 mb-3">{s.body}</p>
            {s.bulletPoints && s.bulletPoints.length > 0 && (
              <ul className="list-disc list-inside text-sm text-slate-200 space-y-1">
                {s.bulletPoints.map((bp, i) => (
                  <li key={i}>{bp}</li>
                ))}
              </ul>
            )}
          </div>
        )
      }

      case "roadmap": {
        const s = section as RoadmapSection
        return (
          <div
            key={s.id}
            className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-md"
          >
            <h3 className="text-base font-semibold mb-2 text-slate-50">
              {s.title}
            </h3>
            {s.description && (
              <p className="text-xs text-slate-400 mb-3">{s.description}</p>
            )}

            {s.milestones?.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-slate-300 mb-2">
                  Big milestones:
                </p>
                <div className="space-y-2">
                  {s.milestones.map((m, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <div className="h-6 w-6 rounded-full bg-emerald-500/20 border border-emerald-400/60 flex items-center justify-center text-xs font-bold text-emerald-200">
                        {i + 1}
                      </div>
                      <span className="text-slate-100">{m}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {s.phases && s.phases.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-300 mb-2">
                  Phases:
                </p>
                <div className="space-y-3">
                  {s.phases.map((p, i) => (
                    <div
                      key={i}
                      className="border border-slate-800 rounded-2xl p-3 bg-slate-950/70"
                    >
                      <p className="text-sm font-semibold text-slate-50">
                        {p.name}
                      </p>
                      <p className="text-xs text-slate-300 mb-1">
                        Goal: {p.goal}
                      </p>
                      {p.focus?.length > 0 && (
                        <ul className="list-disc list-inside text-xs text-slate-200 space-y-1 mb-2">
                          {p.focus.map((f, idx) => (
                            <li key={idx}>{f}</li>
                          ))}
                        </ul>
                      )}
                      {p.focus && p.focus.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              openLesson("masterclass", p.focus.join(", "))
                            }
                            className="text-[11px] rounded-full border border-emerald-400/50 px-2 py-0.5 text-emerald-200 hover:bg-emerald-500/10"
                          >
                            Phase masterclass
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              openLesson("inDepth", p.focus.join(", "))
                            }
                            className="text-[11px] rounded-full border border-slate-500/60 px-2 py-0.5 text-slate-200 hover:bg-slate-800/80"
                          >
                            Phase in depth
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      }

      case "today": {
        const s = section as TodaySection
        return (
          <div
            key={s.id}
            className="bg-slate-900/90 border border-emerald-500/40 rounded-2xl p-5 shadow-md shadow-emerald-500/10"
          >
            <h3 className="text-base font-semibold mb-1.5 text-emerald-300 flex items-center gap-1.5">
              <span>{s.title}</span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-200 px-2 py-0.5 rounded-full border border-emerald-400/40">
                Daily session
              </span>
            </h3>
            {s.description && (
              <p className="text-[11px] text-slate-400 mb-3">{s.description}</p>
            )}
            <ul className="space-y-3 text-sm">
              {s.items.map((item, index) => {
                const id = buildTaskId(s.id, index, item.label)
                const checked = completedTaskIds.includes(id)
                return (
                  <li
                    key={id}
                    className={`flex flex-col sm:flex-row sm:items-start gap-3 rounded-2xl px-3 py-2.5 border transition-colors ${
                      checked
                        ? "border-emerald-400/60 bg-emerald-500/10"
                        : "border-slate-700 bg-slate-950/70 hover:border-emerald-400/60"
                    }`}
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 rounded border-slate-400 bg-slate-950 accent-emerald-400"
                        checked={checked}
                        onChange={() => toggleTask(id)}
                      />
                      <div className="flex-1">
                        <p
                          className={
                            checked
                              ? "text-slate-400 line-through text-sm"
                              : "text-slate-100 text-sm"
                          }
                        >
                          {item.label}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          {item.minutes && (
                            <>
                              ~{item.minutes} min{" "}
                              <span className="mx-1 text-slate-600">•</span>
                            </>
                          )}
                          {item.xp && (
                            <>
                              XP:{" "}
                              <span className="font-semibold text-emerald-300">
                                +{item.xp}
                              </span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 pb-1 sm:pb-0">
                      <button
                        type="button"
                        onClick={() => openLesson("masterclass", item.label)}
                        className="text-[11px] rounded-full border border-emerald-400/50 px-2 py-0.5 text-emerald-200 hover:bg-emerald-500/10"
                      >
                        Masterclass
                      </button>
                      <button
                        type="button"
                        onClick={() => openLesson("inDepth", item.label)}
                        className="text-[11px] rounded-full border border-slate-500/60 px-2 py-0.5 text-slate-200 hover:bg-slate-800/80"
                      >
                        In depth
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        )
      }

      case "checklist": {
        const s = section as ChecklistSection
        return (
          <div
            key={s.id}
            className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-md"
          >
            <h3 className="text-base font-semibold mb-1.5 text-slate-50">
              {s.title}
            </h3>
            {s.description && (
              <p className="text-[11px] text-slate-400 mb-3">{s.description}</p>
            )}
            <ul className="space-y-3 text-sm max-h-80 overflow-auto pr-1">
              {s.items.map((item, index) => {
                const id = buildTaskId(s.id, index, item.label)
                const checked = completedTaskIds.includes(id)
                return (
                  <li
                    key={id}
                    className={`flex flex-col sm:flex-row sm:items-start gap-3 rounded-2xl px-3 py-2.5 border transition-colors ${
                      checked
                        ? "border-slate-700 bg-slate-950/70"
                        : "border-slate-800 bg-slate-950/80 hover:border-emerald-400/60"
                    }`}
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 rounded border-slate-400 bg-slate-950 accent-emerald-400"
                        checked={checked}
                        onChange={() => toggleTask(id)}
                      />
                      <div className="flex-1">
                        <p
                          className={
                            checked
                              ? "text-slate-500 line-through text-sm"
                              : "text-slate-100 text-sm"
                          }
                        >
                          {item.label}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          {item.minutes && (
                            <>
                              ~{item.minutes} min{" "}
                              <span className="mx-1 text-slate-600">•</span>
                            </>
                          )}
                          {item.xp && (
                            <>
                              XP:{" "}
                              <span className="font-semibold text-emerald-300">
                                +{item.xp}
                              </span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 pb-1 sm:pb-0">
                      <button
                        type="button"
                        onClick={() => openLesson("masterclass", item.label)}
                        className="text-[11px] rounded-full border border-emerald-400/50 px-2 py-0.5 text-emerald-200 hover:bg-emerald-500/10"
                      >
                        Masterclass
                      </button>
                      <button
                        type="button"
                        onClick={() => openLesson("inDepth", item.label)}
                        className="text-[11px] rounded-full border border-slate-500/60 px-2 py-0.5 text-slate-200 hover:bg-slate-800/80"
                      >
                        In depth
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        )
      }

      case "weekly": {
        const s = section as WeeklySection
        return (
          <div
            key={s.id}
            className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-md"
          >
            <h3 className="text-base font-semibold mb-2 text-slate-50">
              {s.title}
            </h3>
            {s.description && (
              <p className="text-xs text-slate-400 mb-3">{s.description}</p>
            )}
            <div className="grid gap-3 md:grid-cols-2">
              {s.weeks.map((w, i) => (
                <div
                  key={i}
                  className="border border-slate-800 rounded-2xl p-4 bg-slate-950/70"
                >
                  <p className="text-xs font-semibold text-emerald-300 mb-1">
                    Week {w.week}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-100 mb-2">
                    <span className="font-semibold">Focus:</span> {w.focus}
                  </p>
                  {w.practice?.length > 0 && (
                    <ul className="list-disc list-inside text-xs sm:text-sm text-slate-200 space-y-1 mb-2">
                      {w.practice.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  )}
                  <p className="text-xs sm:text-sm text-slate-300 mb-2">
                    <span className="font-semibold">Goal:</span> {w.goal}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => openLesson("masterclass", w.focus)}
                      className="text-[11px] rounded-full border border-emerald-400/50 px-2 py-0.5 text-emerald-200 hover:bg-emerald-500/10"
                    >
                      Week masterclass
                    </button>
                    <button
                      type="button"
                      onClick={() => openLesson("inDepth", w.focus)}
                      className="text-[11px] rounded-full border border-slate-500/60 px-2 py-0.5 text-slate-200 hover:bg-slate-800/80"
                    >
                      Week in depth
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      }

      case "resources": {
        const s = section as ResourcesSection
        return (
          <div
            key={s.id}
            className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-md"
          >
            <h3 className="text-base font-semibold mb-2 text-slate-50">
              {s.title}
            </h3>
            {s.description && (
              <p className="text-xs text-slate-400 mb-3">{s.description}</p>
            )}
            <ul className="space-y-3 text-sm">
              {s.resources.map((r, i) => (
                <li
                  key={i}
                  className="border-b border-slate-800 pb-2 last:border-none last:pb-0"
                >
                  <p className="font-medium text-slate-50">
                    {r.title}{" "}
                    <span className="text-[11px] text-slate-400">
                      ({r.type})
                    </span>
                  </p>
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-emerald-300 hover:underline break-all"
                  >
                    {r.url}
                  </a>
                  {r.note && (
                    <p className="text-[12px] text-slate-300 mt-0.5">
                      {r.note}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )
      }

      case "gear": {
        const s = section as GearSection
        return (
          <div
            key={s.id}
            className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-md"
          >
            <h3 className="text-base font-semibold mb-2 text-slate-50">
              {s.title}
            </h3>
            {s.description && (
              <p className="text-xs text-slate-400 mb-3">{s.description}</p>
            )}
            <div className="grid gap-4 md:grid-cols-3 text-xs sm:text-sm">
              <div>
                <p className="font-semibold text-slate-50 mb-1.5">
                  Starter setup
                </p>
                <ul className="list-disc list-inside text-slate-200 space-y-1">
                  {s.starter.map((g, i) => (
                    <li key={i}>{g}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-semibold text-slate-50 mb-1.5">
                  Nice to have later
                </p>
                <ul className="list-disc list-inside text-slate-200 space-y-1">
                  {s.niceToHave.map((g, i) => (
                    <li key={i}>{g}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-semibold text-slate-50 mb-1.5">
                  Money saving tips
                </p>
                <ul className="list-disc list-inside text-slate-200 space-y-1">
                  {s.moneySavingTips.map((g, i) => (
                    <li key={i}>{g}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )
      }

      case "tips": {
        const s = section as TipsSection
        return (
          <div
            key={s.id}
            className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-md"
          >
            <h3 className="text-base font-semibold mb-2 text-slate-50">
              {s.title}
            </h3>
            {s.description && (
              <p className="text-xs text-slate-400 mb-3">{s.description}</p>
            )}
            <ul className="space-y-3 text-sm">
              {s.mistakes.map((m, i) => (
                <li
                  key={i}
                  className="border-b border-slate-800 pb-2 last:border-none last:pb-0"
                >
                  <p className="font-medium text-slate-50">{m.mistake}</p>
                  <p className="text-[12px] text-slate-300 mt-0.5">
                    <span className="font-semibold">Fix:</span> {m.fix}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )
      }

      case "advanced": {
        const s = section as AdvancedSection
        return (
          <div
            key={s.id}
            className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-md"
          >
            <h3 className="text-base font-semibold mb-2 text-slate-50">
              {s.title}
            </h3>
            {s.description && (
              <p className="text-xs text-slate-400 mb-3">{s.description}</p>
            )}
            <div className="grid gap-3 text-xs sm:text-sm md:grid-cols-2">
              <div>
                <p className="font-semibold text-slate-50 mb-1.5">
                  Possible directions
                </p>
                <ul className="list-disc list-inside text-slate-200 space-y-1">
                  {s.directions.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-semibold text-slate-50 mb-1.5">
                  Long term goals
                </p>
                <ul className="list-disc list-inside text-slate-200 space-y-1">
                  {s.longTermGoals.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )
      }

      default:
        return null
    }
  }

  // ---- UI ----

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex justify-center px-4 py-8 sm:py-10">
      <div className="w-full max-w-5xl">
        {/* Hero */}
        <header className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/70 px-3 py-1 text-[11px] font-medium text-emerald-200 border border-emerald-500/30 shadow-sm mb-3">
            <span>🪄</span>
            <span>Turn any hobby into a personalized learning path</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-3 tracking-tight text-slate-50">
            HobbyASAP
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
            Type any hobby and let the AI design a custom layout: intros, small
            tasks, checklists, roadmaps, resources, plus persistent
            masterclasses, deep dives and Q&A that stay on the page.
          </p>

          {/* GLOBAL STATS STRIP */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-[11px] sm:text-xs">
            <div className="inline-flex items-center gap-1 rounded-full bg-slate-900/80 px-3 py-1 border border-orange-400/70 text-orange-200 shadow-sm">
              <span>🔥</span>
              <span>
                Streak: <span className="font-semibold">{streak.current}</span>
              </span>
              <span className="text-[10px] text-orange-200/80">
                best {streak.longest}
              </span>
            </div>
            <div className="inline-flex items-center gap-1 rounded-full bg-slate-900/80 px-3 py-1 border border-emerald-400/70 text-emerald-200 shadow-sm">
              <span>⭐</span>
              <span className="font-semibold">Level {xpStats.levelNumber}</span>
              <span className="text-[10px] text-emerald-200/80">
                {xpStats.levelLabel}
              </span>
            </div>
            <div className="inline-flex items-center gap-1 rounded-full bg-slate-900/80 px-3 py-1 border border-sky-400/70 text-sky-200 shadow-sm">
              <span>💎</span>
              <span>
                Total XP:{" "}
                <span className="font-semibold">{xpStats.totalXp}</span>
              </span>
            </div>
          </div>
        </header>

        {/* Input + history */}
        <section className="mb-8 grid gap-5 md:grid-cols-[minmax(0,1.5fr),minmax(0,1fr)]">
          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col gap-4 shadow-md"
          >
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">
                  Hobby
                </label>
                <input
                  type="text"
                  value={hobby}
                  onChange={(e) => setHobby(e.target.value)}
                  placeholder="Example: Fishing, Photography, Guitar, Coding..."
                  className="mt-1 w-full rounded-xl px-3 py-2.5 bg-slate-950 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm text-slate-50 placeholder:text-slate-500"
                />
              </div>
              <div className="w-full sm:w-56 space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">
                  Your current level
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="mt-1 w-full rounded-xl px-3 py-2.5 bg-slate-950 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm text-slate-50"
                >
                  <option value="complete beginner">Complete beginner</option>
                  <option value="some experience">Some experience</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced learner</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex items-center justify-center rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-4 py-2.5 text-sm disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Designing your plan..." : "Generate my plan"}
            </button>

            {error && (
              <p className="mt-1 text-sm text-red-400 bg-red-950/40 border border-red-800/60 rounded-xl px-3 py-2">
                {error}
              </p>
            )}
          </form>

          {/* History (full session reload) */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm sm:text-base font-semibold text-slate-50">
                Saved runs
              </h2>
              {history.length > 0 && (
                <button
                  type="button"
                  onClick={clearHistory}
                  className="text-[11px] text-slate-500 hover:text-red-400"
                >
                  Clear all
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <p className="text-xs sm:text-sm text-slate-400">
                When you generate a plan and start working on it, HobbyASAP will
                remember your streak, XP, tasks, lessons and questions as a
                “run” you can reload later.
              </p>
            ) : (
              <div className="max-h-64 overflow-y-auto pr-1">
                <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                  {history.map((session) => (
                    <div
                      key={session.id}
                      className="group flex flex-col gap-2 rounded-2xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs sm:text-sm hover:border-emerald-400 hover:bg-slate-900 cursor-pointer transition-colors"
                      onClick={() => loadFromHistory(session)}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-xl bg-slate-900 flex items-center justify-center text-lg">
                            {session.icon || "⭐"}
                          </div>
                          <div>
                            <p className="font-medium text-slate-50">
                              {session.hobby}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {session.level}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="text-[11px] text-slate-500 hover:text-red-400"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteHistoryItem(session.id)
                          }}
                        >
                          ✕
                        </button>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span>
                          🔥 Streak: {session.streak.current} ( best{" "}
                          {session.streak.longest})
                        </span>
                        <span>
                          {new Date(session.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Plan header */}
        {plan && (
          <section className="mb-8" ref={planRef}>
            <div
              className="rounded-2xl border border-slate-800 p-5 sm:p-6 flex flex-col gap-4 shadow-lg shadow-slate-900/80"
              style={{
                backgroundImage: `
                  linear-gradient(
                    to bottom right, 
                    rgba(0,0,0,0.70), 
                    rgba(0,0,0,0.85)
                  ),
                  linear-gradient(
                    to bottom right, 
                    ${theme.from}, 
                    ${theme.to}
                  )
                `,
              }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="h-14 w-14 rounded-3xl bg-slate-950/70 flex items-center justify-center text-3xl shadow-sm">
                    {icon}
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-50">
                      {plan.hobby} ·{" "}
                      <span className="text-emerald-200">{plan.level}</span>
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-200 mt-1">
                      This layout was fully designed by the AI for this hobby
                      and level. Click Masterclass or In depth on any task,
                      phase, or week to stack deeper lessons below.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
                  <div className="w-full sm:w-60">
                    <div className="flex items-center justify-between text-[11px] text-slate-100 mb-1">
                      <span>Plan progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-900/70 overflow-hidden border border-slate-900/80">
                      <div
                        className="h-full bg-emerald-400"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                  {dailySessionCompleted && (
                    <p className="text-[11px] text-emerald-200">
                      ✅ Today’s small tasks completed!
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Plan sections */}
        {plan && (
          <section className="space-y-5 mb-10">
            {plan.sections.map((section) => renderSection(section))}
          </section>
        )}

        {!plan && !loading && !error && (
          <p className="text-xs sm:text-sm text-slate-500 text-center mb-10">
            Generate a plan to see how the AI designs different sections for
            each hobby: intros, tiny tasks, checklists, roadmaps and more. Then
            click Masterclass / In depth to stack course-style content below and
            ask follow-up questions.
          </p>
        )}

        {/* Lessons area */}
        {plan && (
          <section className="mb-16 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm sm:text-base font-semibold text-slate-50">
                Masterclasses & deep dives
              </h2>
              {lessonLoading && (
                <p className="text-[11px] text-emerald-300">
                  Generating{" "}
                  {lessonLastTopic ? `"${lessonLastTopic}"` : "lesson"}…
                </p>
              )}
            </div>
            {lessonError && (
              <p className="text-xs text-red-400 bg-red-950/40 border border-red-800/60 rounded-xl px-3 py-2">
                {lessonError}
              </p>
            )}

            {lessons.length === 0 && !lessonLoading && !lessonError && (
              <p className="text-xs sm:text-sm text-slate-500">
                Click any Masterclass or In depth button in your plan above to
                add detailed course-style lessons here. They will stay on the
                page so you can scroll, re-read, and work through the tasks.
              </p>
            )}

            <div className="space-y-4">
              {lessons.map((lesson, lessonIndex) => {
                const lessonKey = `${lesson.kind}-${lesson.topic}-${lessonIndex}`
                return (
                  <div
                    key={lessonKey}
                    className="bg-slate-900/95 border border-slate-800 rounded-2xl p-5 shadow-md"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-slate-400">
                          {lesson.kind === "masterclass"
                            ? "Masterclass"
                            : "In depth"}
                        </p>
                        <h3 className="mt-1 text-lg font-semibold text-slate-50">
                          {lesson.title}
                        </h3>
                        <p className="mt-1 text-[11px] text-slate-400">
                          Hobby: {lesson.hobby} · Level: {lesson.level} · Topic:{" "}
                          {lesson.topic}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <p className="text-[11px] text-slate-400">
                          ~{lesson.estimatedTimeMinutes} min
                        </p>
                        <button
                          type="button"
                          onClick={() => handleRemoveLesson(lessonIndex)}
                          className="text-[10px] rounded-full border border-red-500/60 px-2 py-0.5 text-red-300 hover:bg-red-500/10"
                        >
                          Remove lesson
                        </button>
                      </div>
                    </div>

                    <p className="text-sm text-slate-200 mb-4">
                      {lesson.summary}
                    </p>

                    <div className="space-y-4 mb-4">
                      {lesson.sections.map((section, sectionIndex) => (
                        <div
                          key={`${lessonKey}-section-${sectionIndex}`}
                          className="border border-slate-800 rounded-2xl p-3 bg-slate-950/80"
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="text-sm font-medium text-slate-100">
                              {section.heading}
                            </h4>
                            <button
                              type="button"
                              onClick={() =>
                                openLesson(
                                  "inDepth",
                                  `${lesson.topic} – ${section.heading}`
                                )
                              }
                              className="text-[10px] rounded-full border border-slate-500/60 px-2 py-0.5 text-slate-200 hover:bg-slate-800/80"
                            >
                              More depth on this
                            </button>
                          </div>
                          <p className="text-sm text-slate-300 mb-1">
                            {section.body}
                          </p>
                          {section.tips && section.tips.length > 0 && (
                            <div className="mt-1">
                              <p className="text-[11px] font-semibold text-slate-300 mb-0.5">
                                Tips
                              </p>
                              <ul className="list-disc pl-5 text-xs text-slate-400 space-y-1">
                                {section.tips.map((tip) => (
                                  <li key={tip}>{tip}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {section.examples && section.examples.length > 0 && (
                            <div className="mt-2">
                              <p className="text-[11px] font-semibold text-slate-300 mb-0.5">
                                Examples / drills
                              </p>
                              <ul className="list-disc pl-5 text-xs text-slate-400 space-y-1">
                                {section.examples.map((ex) => (
                                  <li key={ex}>{ex}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {lesson.practiceIdeas &&
                      lesson.practiceIdeas.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-emerald-200 mb-2">
                            Practice tasks for this lesson
                          </h4>
                          <ul className="space-y-2 text-sm">
                            {lesson.practiceIdeas.map((idea, practiceIndex) => {
                              const id = buildTaskId(
                                `lesson-${lessonIndex}`,
                                practiceIndex,
                                idea
                              )
                              const checked = completedTaskIds.includes(id)
                              return (
                                <li
                                  key={id}
                                  className={`flex items-start gap-3 rounded-2xl px-3 py-2 border text-xs sm:text-sm ${
                                    checked
                                      ? "border-emerald-400/60 bg-emerald-500/10"
                                      : "border-slate-700 bg-slate-950/70 hover:border-emerald-400/60"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    className="mt-1 h-4 w-4 rounded border-slate-400 bg-slate-950 accent-emerald-400"
                                    checked={checked}
                                    onChange={() => toggleTask(id)}
                                  />
                                  <p
                                    className={
                                      checked
                                        ? "text-slate-400 line-through"
                                        : "text-slate-100"
                                    }
                                  >
                                    {idea}
                                  </p>
                                </li>
                              )
                            })}
                          </ul>
                        </div>
                      )}

                    {lesson.recommendedResources &&
                      lesson.recommendedResources.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-slate-100 mb-1.5">
                            Recommended resources
                          </h4>
                          <ul className="space-y-1 text-xs text-slate-300">
                            {lesson.recommendedResources.map((r) => (
                              <li key={r.url}>
                                <span className="font-semibold">{r.title}</span>{" "}
                                <span className="text-slate-500">
                                  ({r.type})
                                </span>
                                {": "}
                                <a
                                  href={r.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-emerald-300 hover:underline break-all"
                                >
                                  {r.url}
                                </a>
                                {r.note && (
                                  <span className="text-slate-500">
                                    {" "}
                                    – {r.note}
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                  </div>
                )
              })}
              {/* Scroll target for the bottom */}
              <div ref={lessonsEndRef} />
            </div>
          </section>
        )}

        {plan ? (
          <AskQuestionPanel
            plan={plan}
            lessons={lessons}
            questions={questions}
            onQuestionAdded={handleQuestionAdded}
            onQuestionDeleted={handleQuestionDeleted}
            onInDepthRequest={(topic) => openLesson("inDepth", topic)}
          />
        ) : null}
      </div>
    </main>
  )
}
