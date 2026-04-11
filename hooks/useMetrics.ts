import { useEffect, useState } from "react"

export interface Metrics {
  lessons: number
  users: number
}

export function useMetrics() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchMetrics() {
      try {
        const res = await fetch("/api/metrics", {
          method: "GET",
          cache: "no-store",
        })
        if (!res.ok) {
          throw new Error("Failed to load metrics")
        }
        const data = (await res.json()) as Metrics
        if (!cancelled) {
          setMetrics(data)
          setError(null)
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || "Failed to load metrics")
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchMetrics()
    const intervalId = window.setInterval(fetchMetrics, 30_000)

    return () => {
      cancelled = true
      window.clearInterval(intervalId)
    }
  }, [])

  return { metrics, loading, error }
}
