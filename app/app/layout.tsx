"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import AppSidebar from "./components/AppSidebar"
import { LS_SESSIONS_KEY, SESSIONS_UPDATED_EVENT } from "./constants"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [hasCourses, setHasCourses] = useState(false)

  useEffect(() => {
    function syncHasCourses() {
      try {
        const raw = localStorage.getItem(LS_SESSIONS_KEY)
        const parsed = raw ? JSON.parse(raw) : []
        setHasCourses(Array.isArray(parsed) && parsed.length > 0)
      } catch {
        setHasCourses(false)
      }
    }

    syncHasCourses()
    window.addEventListener(SESSIONS_UPDATED_EVENT, syncHasCourses)
    window.addEventListener("storage", syncHasCourses)

    return () => {
      window.removeEventListener(SESSIONS_UPDATED_EVENT, syncHasCourses)
      window.removeEventListener("storage", syncHasCourses)
    }
  }, [])

  const shouldShowSidebar = hasCourses || pathname === "/app/courses/new"

  return (
    <div className="min-h-screen bg-app-bg text-text md:flex">
      {shouldShowSidebar ? <AppSidebar /> : null}
      <main className={`flex-1 ${shouldShowSidebar ? "pb-20 md:pb-0" : ""}`}>
        {children}
      </main>
    </div>
  )
}
