"use client"

import type { Route } from "next"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppData } from "./AppDataProvider"

export default function AppEntryPage() {
  const router = useRouter()
  const { loading, history } = useAppData()

  useEffect(() => {
    if (loading) return
    router.replace((history.length > 0 ? "/app/learn" : "/app/courses/new") as Route)
  }, [history.length, loading, router])

  return (
    <div className="min-h-screen grid place-items-center px-4">
      <p className="text-sm text-muted">Loading your dashboard...</p>
    </div>
  )
}
