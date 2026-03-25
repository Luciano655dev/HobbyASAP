"use client"

import { useEffect, useState } from "react"

interface Metrics {
  prompts: number
  users: number
}

export default function MetricsSection() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchMetrics() {
      try {
        const res = await fetch("/api/metrics")
        if (!res.ok) throw new Error("Failed to load metrics")
        const data = (await res.json()) as Metrics

        if (!cancelled) setMetrics(data)
      } catch (err: any) {
        if (!cancelled) setError(err.message || "Failed to load metrics")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchMetrics()

    return () => {
      cancelled = true
    }
  }, [])

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
              {/* subtle gradient edge */}
              <div className="pointer-events-none absolute inset-px rounded-[22px] border border-accent/20" />

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

            {/* PROMPTS CARD */}
            <div className="relative overflow-hidden rounded-3xl border border-border bg-surface/80 p-4 sm:p-5 shadow-sm shadow-accent/5">
              {/* subtle gradient edge */}
              <div className="pointer-events-none absolute inset-px rounded-[22px] border border-accent/25" />

              <div className="relative flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/20 text-accent text-lg">
                  🪄
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-accent/80">
                    Plans
                  </span>
                  <span className="text-lg sm:text-xl font-semibold text-text">
                    {metrics.prompts.toLocaleString()}
                  </span>
                  <span className="text-[11px] text-muted">
                    AI plans generated
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
