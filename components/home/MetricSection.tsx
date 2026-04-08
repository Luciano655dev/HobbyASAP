"use client"

import { useMetrics } from "@/hooks/useMetrics"

export default function MetricsSection() {
  const { metrics, loading, error } = useMetrics()

  return (
    <section className="mx-auto max-w-6xl px-4 pb-10 pt-4">
      {error && !loading && (
        <p className="mb-2 text-center text-[12px] text-danger">
          Could not load live stats right now.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Skeletons */}
        {loading && !error && (
          <>
            <div className="h-24 rounded-3xl border border-border bg-surface/80 shadow-sm shadow-accent/5 animate-pulse" />
            <div className="h-24 rounded-3xl border border-border bg-surface/80 shadow-sm shadow-accent/5 animate-pulse" />
          </>
        )}

        {/* Stats */}
        {!loading && !error && metrics && (
          <>
            {/* USERS CARD */}
            <div className="relative overflow-hidden rounded-3xl border border-border bg-surface/80 p-4 sm:p-5 shadow-sm shadow-accent/5">
              <div className="relative flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/20 text-accent text-lg">
                  🧑‍🚀
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-accent/80">
                    People
                  </span>
                  <span className="text-lg sm:text-xl font-semibold text-text">
                    {metrics.users.toLocaleString()}
                  </span>
                  <span className="text-[11px] text-muted">
                    have tried HobbyASAP
                  </span>
                </div>
              </div>
            </div>

            {/* MODULES CARD */}
            <div className="relative overflow-hidden rounded-3xl border border-border bg-surface/80 p-4 sm:p-5 shadow-sm shadow-accent/5">
              <div className="relative flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/20 text-accent text-lg">
                  🪄
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-accent/80">
                    Lessons
                  </span>
                  <span className="text-lg sm:text-xl font-semibold text-text">
                    {metrics.lessons.toLocaleString()}
                  </span>
                  <span className="text-[11px] text-muted">
                    course modules created
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
