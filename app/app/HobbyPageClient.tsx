"use client"

import { v4 as uuidv4 } from "uuid"
import { useEffect, useMemo, useRef, useState } from "react"
import { motion, type Variants } from "framer-motion"
import AskQuestionPanel, { QAItem } from "./AskQuestionPanel"
import { HobbyPlan, Lesson, LessonKind } from "./types"
import {
  useSessionsHistory,
  INITIAL_STREAK,
  SavedSession,
  StreakState,
} from "./hooks/useSessionsHistory"
import { useGlobalXpStats } from "./hooks/useXpStats"
import Hero from "./components/Hero"
import HistoryPanel from "./components/HistoryPanel"
import PlanHeader from "./components/PlanHeader"
import ModulesPath from "./components/ModulesPath"
import LessonsArea from "./components/LessonsArea"

// Animations for the main layout + form
const layoutVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: "easeOut" },
  },
}

const formVariants: Variants = {
  hidden: { opacity: 0, y: 10, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.25, ease: "easeOut", delay: 0.05 },
  },
}

export default function HobbyPageClient() {
  // language state (EN / PT)
  const [language, setLanguage] = useState<"en" | "pt">("en")

  // basic form state (input)
  const [hobby, setHobby] = useState("")
  const [level, setLevel] = useState("complete beginner")

  // frozen session meta (what goes to history)
  const [sessionHobby, setSessionHobby] = useState<string>("")
  const [sessionLevel, setSessionLevel] = useState<string>("")

  // main plan
  const [plan, setPlan] = useState<HobbyPlan | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // progress state
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([])
  const [streak, setStreak] = useState<StreakState>(INITIAL_STREAK)

  // lessons
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [lessonLoading, setLessonLoading] = useState(false)
  const [lessonError, setLessonError] = useState("")
  const [lessonLastTopic, setLessonLastTopic] = useState<string | null>(null)

  // Q&A
  const [questions, setQuestions] = useState<QAItem[]>([])

  // current session identity
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [sessionCreatedAt, setSessionCreatedAt] = useState<string | null>(null)

  // history (localStorage) from hook
  const { history, saveSnapshot, deleteSession, clearAllSessions } =
    useSessionsHistory()

  // Scroll Management
  const planRef = useRef<HTMLDivElement | null>(null)
  const lessonsEndRef = useRef<HTMLDivElement | null>(null)
  const prevLessonsLengthRef = useRef(0)
  const suppressNextScrollRef = useRef(false)

  // ---- Init: user id + language from localStorage ----
  useEffect(() => {
    if (typeof window === "undefined") return

    // user id
    const KEY = "hobbyasap_user_id"
    let userId = localStorage.getItem(KEY)

    if (!userId) {
      userId = uuidv4()
      localStorage.setItem(KEY, userId)

      // fire "newUser" metric once
      fetch("/api/metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "newUser" }),
      }).catch(() => {
        // ignore errors, it's just analytics
      })
    }

    // language preference
    const savedLang = localStorage.getItem("hobbyasap_lang") as
      | "en"
      | "pt"
      | null
    if (savedLang === "en" || savedLang === "pt") {
      setLanguage(savedLang)
    }
  }, [])

  // Scroll only when a NEW lesson is added via openLesson, not when loading history
  useEffect(() => {
    const prevLength = prevLessonsLengthRef.current
    const currentLength = lessons.length

    if (suppressNextScrollRef.current) {
      suppressNextScrollRef.current = false
      prevLessonsLengthRef.current = currentLength
      return
    }

    if (currentLength > prevLength && lessonsEndRef.current) {
      lessonsEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      })
    }

    prevLessonsLengthRef.current = currentLength
  }, [lessons.length])

  // modules progress
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

  // XP stats via hook (global from history)
  const xpStats = useGlobalXpStats(history)

  // theme + icon for header
  const themeFrom = "var(--accent-strong)"
  const themeTo = "var(--accent)"

  // ---- Streak helper ----
  function updateStreakOnTaskCheck() {
    const today = new Date()
    const todayStr = today.toISOString().slice(0, 10) // YYYY-MM-DD

    setStreak((prev) => {
      if (prev.lastActiveDate === todayStr) {
        return prev
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

  // ---- History helpers (wrap hook) ----

  function handleDeleteHistoryItem(id: string) {
    deleteSession(id)

    if (id === sessionId) {
      setPlan(null)
      setCompletedTaskIds([])
      setLessons([])
      setQuestions([])
      setStreak(INITIAL_STREAK)
      setSessionId(null)
      setSessionCreatedAt(null)
      setSessionHobby("")
      setSessionLevel("complete beginner")
    }
  }

  function handleClearHistory() {
    clearAllSessions()
    setPlan(null)
    setCompletedTaskIds([])
    setLessons([])
    setQuestions([])
    setStreak(INITIAL_STREAK)
    setSessionId(null)
    setSessionCreatedAt(null)
    setSessionHobby("")
    setSessionLevel("complete beginner")
  }

  function loadFromHistory(session: SavedSession) {
    suppressNextScrollRef.current = true

    setHobby(session.hobby)
    setLevel(session.level)
    setSessionHobby(session.hobby)
    setSessionLevel(session.level)

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

  // ---- Auto-save snapshot whenever important things change ----
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
      completedTaskIds,
      streak,
      lessons,
      questions,
    }

    setSessionCreatedAt(createdAt)
    saveSnapshot(snapshot)
  }, [
    plan,
    completedTaskIds,
    streak,
    lessons,
    questions,
    sessionId,
    sessionCreatedAt,
    sessionHobby,
    sessionLevel,
    saveSnapshot,
  ])

  // ---- Language toggle handler ----
  function handleLanguageChange(next: "en" | "pt") {
    setLanguage(next)
    if (typeof window !== "undefined") {
      localStorage.setItem("hobbyasap_lang", next)
    }
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
    let timeoutId: ReturnType<typeof setTimeout> | undefined
    try {
      const controller = new AbortController()
      timeoutId = setTimeout(() => controller.abort(), 30000)
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hobby, level, language }),
        signal: controller.signal,
      })
      clearTimeout(timeoutId)

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to generate path.")
      }

      const data = await res.json()
      const newPlan = data.plan as HobbyPlan
      setPlan(newPlan)

      const newSessionId = `${hobby.toLowerCase()}_${Date.now()}`
      setSessionId(newSessionId)
      setSessionCreatedAt(new Date().toISOString())

      setSessionHobby(hobby)
      setSessionLevel(level)
    } catch (err: any) {
      const message =
        err?.name === "AbortError"
          ? "Generation timed out. Please try again."
          : err.message || "Something went wrong."
      setError(message)
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      setLoading(false)
    }
  }

  function toggleTask(id: string) {
    setCompletedTaskIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((x) => x !== id)
      } else {
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
          language,
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

  // ---- Questions handlers ----

  function handleQuestionAdded(item: QAItem) {
    setQuestions((prev) => [...prev, item])
  }

  function handleQuestionDeleted(id: string) {
    setQuestions((prev) => prev.filter((q) => q.id !== id))
  }

  // ---- UI ----

  return (
    <main className="min-h-screen bg-app-bg text-text flex justify-center px-4 py-8 sm:py-10">
      <div className="w-full max-w-5xl">
        {/* Hero + global stats */}
        <Hero streak={streak} xpStats={xpStats} />

        {/* Input + history */}
        <motion.section
          className="mb-8 grid gap-5 md:grid-cols-[minmax(0,1.5fr),minmax(0,1fr)]"
          variants={layoutVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            className="bg-surface/90 border border-border rounded-2xl p-5 sm:p-6 flex flex-col gap-4 shadow-md"
            variants={formVariants}
          >
            {/* Top row: title + language toggle */}
            <div className="flex items-center justify-between gap-3 mb-1">
              <h2 className="text-sm font-semibold text-text">
                Design your hobby path
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-muted">Language</span>
                <div className="inline-flex items-center rounded-full bg-surface-2 p-1 text-[11px]">
                  <button
                    type="button"
                    onClick={() => handleLanguageChange("en")}
                    className={`px-2.5 py-1 rounded-full transition-colors ${
                      language === "en"
                        ? "bg-surface text-accent"
                        : "text-muted"
                    }`}
                  >
                    EN
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLanguageChange("pt")}
                    className={`px-2.5 py-1 rounded-full transition-colors ${
                      language === "pt"
                        ? "bg-surface text-accent"
                        : "text-muted"
                    }`}
                  >
                    PT
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 space-y-1">
                <label className="text-[11px] font-semibold text-muted">
                  Hobby
                </label>
                <input
                  type="text"
                  value={hobby}
                  onChange={(e) => setHobby(e.target.value)}
                  placeholder="Example: Fishing, Photography, Guitar, Coding..."
                  className="mt-1 w-full rounded-xl px-3 py-2.5 bg-surface border border-border focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent text-sm text-text placeholder:text-muted"
                />
              </div>
              <div className="w-full sm:w-56 space-y-1">
                <label className="text-[11px] font-semibold text-muted">
                  Your current level
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="mt-1 w-full rounded-xl px-3 py-2.5 bg-surface border border-border focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent text-sm text-text"
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
              className="mt-2 inline-flex items-center justify-center rounded-xl bg-accent-strong hover:bg-accent text-white font-semibold px-4 py-2.5 text-sm disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Designing your path..." : "Generate my path"}
            </button>

            {error && (
              <p className="mt-1 text-sm text-danger bg-danger/10 border border-danger/40 rounded-xl px-3 py-2">
                {error}
              </p>
            )}
          </motion.form>

          {/* History (full session reload) */}
          <HistoryPanel
            history={history}
            onClearAll={handleClearHistory}
            onDelete={handleDeleteHistoryItem}
            onLoad={loadFromHistory}
          />
        </motion.section>

        {/* Plan header */}
        {plan && (
          <section className="mb-8" ref={planRef}>
            <PlanHeader
              plan={plan}
              themeFrom={themeFrom}
              themeTo={themeTo}
              progress={progress}
              dailySessionCompleted={dailySessionCompleted}
            />
          </section>
        )}

        {/* Modules path */}
        {plan && (
          <ModulesPath
            plan={plan}
            completedTaskIds={completedTaskIds}
            onToggleTask={toggleTask}
            onOpenLesson={openLesson}
            lessonLoading={lessonLoading}
          />
        )}

        {!plan && !loading && !error && (
          <p className="text-xs sm:text-sm text-muted text-center mb-10">
            Generate a path to see a Duolingo-style sequence of reading modules
            and quick quizzes. Complete modules to progress, then stack
            masterclasses or deep dives below and ask follow-up questions.
          </p>
        )}

        {/* Ask questions */}
        {plan ? (
          <AskQuestionPanel
            plan={plan}
            lessons={lessons}
            questions={questions}
            onQuestionAdded={handleQuestionAdded}
            onQuestionDeleted={handleQuestionDeleted}
            onInDepthRequest={(topic) => openLesson("inDepth", topic)}
            lessonLoading={lessonLoading}
          />
        ) : null}

        {/* Lessons area */}
        {plan && (
          <LessonsArea
            lessons={lessons}
            lessonLoading={lessonLoading}
            lessonError={lessonError}
            lessonLastTopic={lessonLastTopic}
            completedTaskIds={completedTaskIds}
            onToggleTask={toggleTask}
            onRemoveLesson={handleRemoveLesson}
            onOpenLesson={openLesson}
            lessonsEndRef={lessonsEndRef}
          />
        )}
      </div>
    </main>
  )
}
