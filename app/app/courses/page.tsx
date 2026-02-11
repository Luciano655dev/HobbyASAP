"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Sparkles } from "lucide-react"
import HistoryPanel from "../components/HistoryPanel"
import { useSessionsHistory, type SavedSession } from "../hooks/useSessionsHistory"
import {
  LS_CURRENT_SESSION_KEY,
  SESSIONS_UPDATED_EVENT,
} from "../constants"

function setCurrentSession(id: string | null) {
  if (typeof window === "undefined") return

  if (id) {
    localStorage.setItem(LS_CURRENT_SESSION_KEY, id)
  } else {
    localStorage.removeItem(LS_CURRENT_SESSION_KEY)
  }
  window.dispatchEvent(new Event(SESSIONS_UPDATED_EVENT))
}

export default function CoursesPage() {
  const router = useRouter()
  const { history, deleteSession, clearAllSessions } = useSessionsHistory()
  const totalModules = history.reduce(
    (sum, session) => sum + session.plan.modules.length,
    0
  )

  function handleLoad(session: SavedSession) {
    setCurrentSession(session.id)
    router.push(`/app/learn?sessionId=${encodeURIComponent(session.id)}`)
  }

  function handleDelete(id: string) {
    deleteSession(id)

    if (typeof window === "undefined") return
    const current = localStorage.getItem(LS_CURRENT_SESSION_KEY)
    if (current === id) {
      const next = history.find((item) => item.id !== id)?.id ?? null
      setCurrentSession(next)
    }
  }

  function handleClearAll() {
    clearAllSessions()
    setCurrentSession(null)
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-5 rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted">
              Dashboard
            </p>
            <h1 className="mt-1 text-2xl font-bold text-text">Courses</h1>
            <p className="mt-1 text-sm text-muted">
              Manage your saved courses and switch your current learning path.
            </p>
          </div>
          <Link
            href="/app/courses/new"
            className="inline-flex items-center gap-2 rounded-xl bg-accent-strong px-4 py-2 text-sm font-semibold text-white hover:bg-accent"
          >
            <Sparkles className="h-4 w-4" />
            <span>Start new course</span>
          </Link>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-surface-2 px-3 py-2">
            <p className="text-[11px] text-muted">Saved courses</p>
            <p className="mt-0.5 text-base font-semibold text-text">{history.length}</p>
          </div>
          <div className="rounded-xl border border-border bg-surface-2 px-3 py-2">
            <p className="text-[11px] text-muted">Total modules</p>
            <p className="mt-0.5 text-base font-semibold text-text">{totalModules}</p>
          </div>
          <div className="rounded-xl border border-border bg-surface-2 px-3 py-2">
            <p className="text-[11px] text-muted">Last update</p>
            <p className="mt-0.5 text-base font-semibold text-text">
              {history[0]
                ? new Date(history[0].createdAt).toLocaleDateString()
                : "No runs yet"}
            </p>
          </div>
        </div>
      </div>

      <HistoryPanel
        history={history}
        onClearAll={handleClearAll}
        onDelete={handleDelete}
        onLoad={handleLoad}
      />
    </section>
  )
}
