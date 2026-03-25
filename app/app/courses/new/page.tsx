"use client"

import type { Route } from "next"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { MAX_COURSES } from "../../constants"
import { useAppData } from "../../AppDataProvider"
import { useHydrated } from "@/app/lib/useHydrated"

const LOADING_STEPS = [
  "Checking whether this course already exists...",
  "Assembling the learning path structure...",
  "Saving your course to the workspace...",
]

export default function NewCoursePage() {
  const router = useRouter()
  const {
    history,
    preferredLanguage,
    setCurrentSessionId,
    setPreferredLanguage,
    refresh,
  } = useAppData()
  const [hobby, setHobby] = useState("")
  const [level, setLevel] = useState("complete beginner")
  const [language, setLanguage] = useState<"en" | "pt">(preferredLanguage)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [loadingStepIndex, setLoadingStepIndex] = useState(0)
  const hydrated = useHydrated()
  const courseCount = history.length

  useEffect(() => {
    setLanguage(preferredLanguage)
  }, [preferredLanguage])

  useEffect(() => {
    if (!loading) {
      setLoadingStepIndex(0)
      return
    }

    const intervalId = window.setInterval(() => {
      setLoadingStepIndex((current) =>
        current < LOADING_STEPS.length - 1 ? current + 1 : current
      )
    }, 1800)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [loading])

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
      const res = await fetch("/api/course-sessions", {
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
      await setPreferredLanguage(language)
      await refresh()

      const sessionId =
        typeof data.sessionId === "string" ? data.sessionId : null
      if (!sessionId) {
        throw new Error("Failed to create the course session.")
      }

      await setCurrentSessionId(sessionId)
      router.push(`/app/learn?sessionId=${encodeURIComponent(sessionId)}` as Route)
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

  if (loading) {
    return (
      <section className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-4xl items-center px-4 py-8 sm:px-6">
        <div className="w-full overflow-hidden rounded-[2rem] border border-border bg-surface shadow-lg">
          <div className="border-b border-border bg-linear-to-r from-accent-soft via-surface to-surface px-6 py-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
              Building your course
            </p>
            <h1 className="mt-2 text-3xl font-bold text-text">{hobby.trim()}</h1>
            <p className="mt-2 text-sm text-muted">
              {level} · {language === "pt" ? "Portuguese" : "English"}
            </p>
          </div>

          <div className="space-y-6 px-6 py-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-accent/30 bg-accent-soft">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
              </div>
              <div>
                <p className="text-base font-semibold text-text">
                  Generating section 1 of your learning path
                </p>
                <p className="mt-1 text-sm text-muted">
                  This usually takes a few seconds. You&apos;ll be redirected
                  automatically when it finishes.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-surface-2 p-4">
              <div className="mb-4 h-2 overflow-hidden rounded-full bg-surface">
                <div
                  className="h-full rounded-full bg-linear-to-r from-accent to-accent-strong transition-all duration-500"
                  style={{
                    width: `${((loadingStepIndex + 1) / LOADING_STEPS.length) * 100}%`,
                  }}
                />
              </div>

              <div className="space-y-3">
                {LOADING_STEPS.map((step, index) => {
                  const isDone = index < loadingStepIndex
                  const isCurrent = index === loadingStepIndex

                  return (
                    <div key={step} className="flex items-center gap-3">
                      <div
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold ${
                          isDone
                            ? "border-accent bg-accent text-white"
                            : isCurrent
                              ? "border-accent/50 bg-accent-soft text-accent"
                              : "border-border bg-surface text-muted"
                        }`}
                      >
                        {isDone ? "✓" : index + 1}
                      </div>
                      <p
                        className={`text-sm ${
                          isCurrent || isDone ? "text-text" : "text-muted"
                        }`}
                      >
                        {step}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
    )
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
                disabled={!hydrated || loading}
                onClick={() => setLanguage("en")}
                className={`px-2.5 py-1 rounded-full transition-colors ${
                  language === "en" ? "bg-surface text-accent" : "text-muted"
                }`}
              >
                EN
              </button>
              <button
                type="button"
                disabled={!hydrated || loading}
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
            <label htmlFor="course-hobby" className="text-[11px] font-semibold text-muted">
              Hobby
            </label>
            <input
              id="course-hobby"
              type="text"
              value={hobby}
              disabled={!hydrated || loading}
              onChange={(e) => setHobby(e.target.value)}
              placeholder="Example: Fishing, Photography, Guitar, Coding..."
              className="mt-1 w-full rounded-xl px-3 py-2.5 bg-surface border border-border focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent text-sm text-text placeholder:text-muted"
            />
          </div>
          <div className="w-full sm:w-56 space-y-1">
            <label htmlFor="course-level" className="text-[11px] font-semibold text-muted">
              Your current level
            </label>
            <select
              id="course-level"
              value={level}
              disabled={!hydrated || loading}
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
          disabled={!hydrated || loading || courseCount >= MAX_COURSES}
          className="mt-4 w-full rounded-xl bg-accent-strong hover:bg-accent text-white font-semibold px-4 py-2.5 text-sm disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {!hydrated
            ? "Preparing form..."
            : loading
              ? "Generating section 1..."
              : "Generate section 1"}
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
