import { useEffect, useState } from "react"

export interface Metrics {
  prompts: number
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
        const res = await fetch("/api/metrics", { method: "GET" })
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

    return () => {
      cancelled = true
    }
  }, [])

  return { metrics, loading, error }
}
