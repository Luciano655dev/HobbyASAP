// app/components/HistoryPanel.tsx
"use client"

import { motion } from "framer-motion"
import { Calendar, Flame, Play, Trash2 } from "lucide-react"
import { SavedSession } from "../hooks/useSessionsHistory"

interface HistoryPanelProps {
  history: SavedSession[]
  onClearAll: () => void
  onDelete: (id: string) => void
  onLoad: (session: SavedSession) => void
}

export default function HistoryPanel({
  history,
  onClearAll,
  onDelete,
  onLoad,
}: HistoryPanelProps) {
  return (
    <motion.div
      className="bg-surface/90 border border-border rounded-2xl p-5 sm:p-6 shadow-sm"
      initial={{ opacity: 0, y: 10, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm sm:text-base font-semibold text-text">Saved runs</h2>
        {history.length > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface-2 px-2.5 py-1 text-[11px] text-muted hover:text-danger"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear all
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <p className="text-xs sm:text-sm text-muted">
          When you generate a path and start working on it, HobbyASAP will
          remember your streak, XP, modules, lessons and questions as a “run”
          you can reload later.
        </p>
      ) : (
        <div className="max-h-[30rem] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {history.map((session) => (
              <div
                key={session.id}
                className="group rounded-2xl border border-border bg-surface p-3 shadow-sm transition hover:border-accent/50 hover:shadow"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface-2 text-lg">
                      {session.icon || "⭐"}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text">{session.hobby}</p>
                      <p className="text-[11px] text-muted">{session.level}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="rounded-md p-1 text-muted hover:bg-danger/10 hover:text-danger"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(session.id)
                    }}
                    aria-label={`Delete ${session.hobby}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-xl border border-border bg-surface-2 px-2 py-1.5 text-[11px] text-muted">
                    <p className="inline-flex items-center gap-1">
                      <Flame className="h-3.5 w-3.5 text-warning" />
                      Streak
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-text">
                      {session.streak.current}
                      <span className="ml-1 text-[10px] font-normal text-muted">
                        (best {session.streak.longest})
                      </span>
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-surface-2 px-2 py-1.5 text-[11px] text-muted">
                    <p>Modules</p>
                    <p className="mt-0.5 text-sm font-semibold text-text">
                      {session.completedTaskIds.filter((id) =>
                        session.plan.modules.some((m) => m.id === id)
                      ).length}
                      <span className="ml-1 text-[10px] font-normal text-muted">
                        /{session.plan.modules.length}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <p className="inline-flex items-center gap-1 text-[11px] text-muted">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(session.createdAt).toLocaleDateString()}
                  </p>
                  <button
                    type="button"
                    onClick={() => onLoad(session)}
                    className="inline-flex items-center gap-1 rounded-lg bg-accent-strong px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-accent"
                  >
                    <Play className="h-3.5 w-3.5" />
                    Open
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}
