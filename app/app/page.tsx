"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { LS_CURRENT_SESSION_KEY, LS_SESSIONS_KEY } from "./constants"

export default function AppEntryPage() {
  const router = useRouter()

  useEffect(() => {
    let hasCourses = false

    try {
      const raw = localStorage.getItem(LS_SESSIONS_KEY)
      const parsed = raw ? JSON.parse(raw) : []
      hasCourses = Array.isArray(parsed) && parsed.length > 0
      if (hasCourses && !localStorage.getItem(LS_CURRENT_SESSION_KEY)) {
        localStorage.setItem(LS_CURRENT_SESSION_KEY, parsed[0].id)
      }
    } catch {
      hasCourses = false
    }

    router.replace(hasCourses ? "/app/learn" : "/app/courses/new")
  }, [router])

  return (
    <div className="min-h-screen grid place-items-center px-4">
      <p className="text-sm text-muted">Loading your dashboard...</p>
    </div>
  )
}
