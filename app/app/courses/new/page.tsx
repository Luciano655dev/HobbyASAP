"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { type HobbyPlan } from "../../types"
import { INITIAL_STREAK, type SavedSession } from "../../hooks/useSessionsHistory"
import {
  LS_CURRENT_SESSION_KEY,
  LS_SESSIONS_KEY,
  MAX_COURSES,
  SESSIONS_UPDATED_EVENT,
} from "../../constants"
import { useEffect } from "react"

export default function NewCoursePage() {
  const router = useRouter()
  const [hobby, setHobby] = useState("")
  const [level, setLevel] = useState("complete beginner")
  const [language, setLanguage] = useState<"en" | "pt">("en")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [courseCount, setCourseCount] = useState(0)

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const raw = localStorage.getItem(LS_SESSIONS_KEY)
      const parsed = raw ? JSON.parse(raw) : []
      setCourseCount(Array.isArray(parsed) ? parsed.length : 0)
    } catch {
      setCourseCount(0)
    }
  }, [])

  function persistNewSession(snapshot: SavedSession) {
    const raw = localStorage.getItem(LS_SESSIONS_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    const previous = Array.isArray(parsed) ? parsed : []

    const updated = [snapshot, ...previous.filter((s) => s.id !== snapshot.id)].slice(
      0,
      20
    )
    localStorage.setItem(LS_SESSIONS_KEY, JSON.stringify(updated))
    localStorage.setItem(LS_CURRENT_SESSION_KEY, snapshot.id)
    localStorage.setItem("hobbyasap_lang", language)
    window.dispatchEvent(new Event(SESSIONS_UPDATED_EVENT))
  }

  async function handleStart(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = hobby.trim()
    if (!trimmed) {
      setError("Please type a hobby.")
      return
    }

    if (courseCount >= MAX_COURSES) {
      setError(
        `Course limit reached (${MAX_COURSES}). Delete a course before creating a new one.`
      )
      return
    }

    setError("")
    setLoading(true)
    let timeoutId: ReturnType<typeof setTimeout> | undefined

    try {
      const controller = new AbortController()
      timeoutId = setTimeout(() => controller.abort(), 30000)
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hobby: trimmed,
          level,
          language,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to generate path.")
      }

      const data = await res.json()
      const plan = data.plan as HobbyPlan
      const id = `${trimmed.toLowerCase()}_${Date.now()}`
      const createdAt = new Date().toISOString()
      const chatId = `chat_${Date.now()}`

      const snapshot: SavedSession = {
        id,
        createdAt,
        hobby: trimmed,
        level,
        icon: plan.icon || null,
        plan,
        sectionsGenerated: 1,
        sectionModuleCounts: [plan.modules.length],
        completedTaskIds: [],
        streak: INITIAL_STREAK,
        lessons: [],
        chatThreads: [
          {
            id: chatId,
            title: "New chat",
            createdAt,
            updatedAt: createdAt,
            questions: [],
          },
        ],
        activeChatId: chatId,
        questions: [],
      }

      persistNewSession(snapshot)
      setCourseCount((prev) => prev + 1)
      router.push(`/app/learn?sessionId=${encodeURIComponent(id)}`)
    } catch (err: unknown) {
      setError(
        err instanceof Error && err.name === "AbortError"
          ? "Generation timed out. Please try again."
          : err instanceof Error
          ? err.message
          : "Something went wrong."
      )
    } finally {
      if (timeoutId) clearTimeout(timeoutId)
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text">Create a new course</h1>
          <p className="mt-1 text-sm text-muted">
            Generate section 1 now, then keep adding next sections later.
          </p>
        </div>
        <Link
          href="/app/courses"
          className="rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium text-text hover:bg-surface-2"
        >
          Back to courses
        </Link>
      </div>

      <form
        onSubmit={handleStart}
        className="w-full rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-md"
      >
        <div className="mb-1 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-text">Design your hobby path</h2>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-border bg-surface-2 px-2.5 py-1 text-[10px] text-muted">
              Courses: {courseCount}/{MAX_COURSES}
            </span>
            <span className="text-[11px] text-muted">Language</span>
            <div className="inline-flex items-center rounded-full bg-surface-2 p-1 text-[11px]">
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`px-2.5 py-1 rounded-full transition-colors ${
                  language === "en" ? "bg-surface text-accent" : "text-muted"
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage("pt")}
                className={`px-2.5 py-1 rounded-full transition-colors ${
                  language === "pt" ? "bg-surface text-accent" : "text-muted"
                }`}
              >
                PT
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 space-y-1">
            <label className="text-[11px] font-semibold text-muted">Hobby</label>
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
          disabled={loading || courseCount >= MAX_COURSES}
          className="mt-4 w-full rounded-xl bg-accent-strong hover:bg-accent text-white font-semibold px-4 py-2.5 text-sm disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Generating section 1..." : "Generate section 1"}
        </button>

        {error && (
          <p className="mt-3 text-sm text-danger bg-danger/10 border border-danger/40 rounded-xl px-3 py-2">
            {error}
          </p>
        )}
      </form>
    </section>
  )
}
