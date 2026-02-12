"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import AppSidebar from "./components/AppSidebar"
import { LS_SESSIONS_KEY, SESSIONS_UPDATED_EVENT } from "./constants"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [hasCourses, setHasCourses] = useState(false)
  const [coursesLoaded, setCoursesLoaded] = useState(false)

  useEffect(() => {
    function syncHasCourses() {
      try {
        const raw = localStorage.getItem(LS_SESSIONS_KEY)
        const parsed = raw ? JSON.parse(raw) : []
        setHasCourses(Array.isArray(parsed) && parsed.length > 0)
      } catch {
        setHasCourses(false)
      } finally {
        setCoursesLoaded(true)
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

  useEffect(() => {
    if (!coursesLoaded) return
    if (hasCourses) return
    if (!pathname) return

    const allowedWithoutCourses = ["/app/courses/new", "/app/courses"]
    const canStay = allowedWithoutCourses.some(
      (allowedPath) =>
        pathname === allowedPath || pathname.startsWith(`${allowedPath}/`)
    )
    if (!canStay) {
      router.replace("/app/courses/new")
    }
  }, [coursesLoaded, hasCourses, pathname, router])

  return (
    <div className="min-h-screen bg-app-bg text-text md:flex">
      <AppSidebar />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
    </div>
  )
}
