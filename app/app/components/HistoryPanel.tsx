// app/components/HistoryPanel.tsx
"use client"

import { motion } from "framer-motion"
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
      className="bg-surface/90 border border-border rounded-2xl p-5 sm:p-6 shadow-md"
      initial={{ opacity: 0, y: 10, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm sm:text-base font-semibold text-text">
          Saved runs
        </h2>
        {history.length > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-[11px] text-muted hover:text-danger"
          >
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
        <div className="max-h-64 overflow-y-auto pr-1">
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
            {history.map((session) => (
              <div
                key={session.id}
                className="group flex flex-col gap-2 rounded-2xl border border-border bg-surface/70 px-3 py-2 text-xs sm:text-sm hover:border-accent hover:bg-surface-2 cursor-pointer transition-colors"
                onClick={() => onLoad(session)}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-xl bg-surface-2 flex items-center justify-center text-lg">
                      {session.icon || "⭐"}
                    </div>
                    <div>
                      <p className="font-medium text-text">
                        {session.hobby}
                      </p>
                      <p className="text-[11px] text-muted">
                        {session.level}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="text-[11px] text-muted hover:text-danger"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(session.id)
                    }}
                  >
                    ✕
                  </button>
                </div>
                <div className="flex items-center justify-between text-[10px] text-muted">
                  <span className="flex items-center justify-center">
                    🔥{" "}
                    <strong className="text-base px-1">
                      {session.streak.current}
                    </strong>{" "}
                    (best {session.streak.longest})
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
    </motion.div>
  )
}
