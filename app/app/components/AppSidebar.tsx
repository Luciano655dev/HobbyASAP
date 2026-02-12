"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import {
  Bot,
  BookOpen,
  ChevronRight,
  Compass,
  Layers,
  PlusCircle,
  User,
} from "lucide-react"
import {
  LS_CURRENT_SESSION_KEY,
  LS_SESSIONS_KEY,
  SESSIONS_UPDATED_EVENT,
} from "../constants"

const navItems = [
  { href: "/app/courses", label: "Courses", icon: Compass },
  { href: "/app/deep-dives", label: "Deep Dives", icon: Layers },
  { href: "/app/ai-chat", label: "AI Chat", icon: Bot },
  { href: "/app/profile", label: "Profile", icon: User },
] as const

function isActivePath(pathname: string | null, href: string) {
  return pathname === href || pathname?.startsWith(`${href}/`)
}

export default function AppSidebar() {
  const pathname = usePathname()
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [hasCourses, setHasCourses] = useState(false)
  const [currentSession, setCurrentSession] = useState<null | {
    hobby: string
    icon: string | null
    completedModules: number
    totalModules: number
  }>(null)

  useEffect(() => {
    function syncCurrentCourse() {
      try {
        const raw = localStorage.getItem(LS_SESSIONS_KEY)
        const sessions: unknown = raw ? JSON.parse(raw) : []
        if (!Array.isArray(sessions) || sessions.length === 0) {
          setHasCourses(false)
          setCurrentSessionId(null)
          setCurrentSession(null)
          return
        }
        setHasCourses(true)

        const storedCurrentId = localStorage.getItem(LS_CURRENT_SESSION_KEY)
        const fallbackId = sessions[0]?.id
        const resolvedId = sessions.some((s) => s?.id === storedCurrentId)
          ? storedCurrentId
          : fallbackId

        if (resolvedId) {
          localStorage.setItem(LS_CURRENT_SESSION_KEY, resolvedId)
        }

        const current = sessions.find((s) => s?.id === resolvedId)
        setCurrentSessionId(resolvedId ?? null)
        if (!current) {
          setCurrentSession(null)
          return
        }

        const completedTaskIds = Array.isArray(current.completedTaskIds)
          ? current.completedTaskIds
          : []
        const modules = Array.isArray(current.plan?.modules)
          ? current.plan.modules
          : []

        const completedModules = completedTaskIds.filter((id: string) =>
          modules.some((m: { id?: string }) => m.id === id)
        ).length
        const totalModules = modules.length

        setCurrentSession({
          hobby: typeof current.hobby === "string" ? current.hobby : "Current course",
          icon:
            typeof current.icon === "string" && current.icon.trim()
              ? current.icon
              : null,
          completedModules,
          totalModules,
        })
      } catch {
        setHasCourses(false)
        setCurrentSessionId(null)
        setCurrentSession(null)
      }
    }

    syncCurrentCourse()
    window.addEventListener(SESSIONS_UPDATED_EVENT, syncCurrentCourse)
    window.addEventListener("storage", syncCurrentCourse)

    return () => {
      window.removeEventListener(SESSIONS_UPDATED_EVENT, syncCurrentCourse)
      window.removeEventListener("storage", syncCurrentCourse)
    }
  }, [])

  const currentCourseHref = useMemo(() => {
    if (!currentSessionId) return "/app/courses/new"
    return `/app/learn?sessionId=${encodeURIComponent(currentSessionId)}`
  }, [currentSessionId])

  const currentProgress = useMemo(() => {
    if (!currentSession || currentSession.totalModules === 0) return 0
    return Math.round(
      (currentSession.completedModules / currentSession.totalModules) * 100
    )
  }, [currentSession])

  const mobileItems = [
    { href: currentCourseHref, label: "Current", icon: BookOpen },
    { href: "/app/courses", label: "Courses", icon: Compass },
    { href: "/app/deep-dives", label: "Deep Dives", icon: Layers },
    { href: "/app/ai-chat", label: "AI Chat", icon: Bot },
    { href: "/app/profile", label: "Profile", icon: User },
  ] as const

  return (
    <>
      <aside className="hidden border-r border-border/80 bg-surface/95 md:sticky md:top-0 md:flex md:h-screen md:w-72 md:flex-col">
        <div className="border-b border-border/80 px-4 py-4">
          <Link href={hasCourses ? "/app/learn" : "/app/courses/new"} className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent text-sm font-bold text-white">
              H
            </div>
            <div>
              <p className="text-[15px] font-bold leading-none tracking-[-0.01em] text-text">
                HobbyASAP
              </p>
              <p className="mt-0.5 text-[10px] leading-tight text-muted">
                Daily learning quests
              </p>
            </div>
          </Link>
        </div>

        <div className="px-3 py-3">
          <Link
            href="/app/courses/new"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-accent/30 bg-accent-soft px-3 py-2 text-xs font-semibold text-accent transition hover:border-accent/50 hover:bg-accent/20"
          >
            <PlusCircle className="h-4 w-4" />
            <span>New Course</span>
          </Link>
        </div>

        <div className="px-3 pb-3">
          <Link
            href={currentCourseHref}
            className={`flex items-center gap-3 rounded-2xl border px-3 py-2.5 transition ${
              pathname === "/app/learn"
                ? "border-accent/40 bg-accent-soft"
                : "border-border bg-surface hover:border-accent/30 hover:bg-surface-2"
            }`}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-border bg-surface-2 text-base">
              {currentSession?.icon ?? "⭐"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-text">
                {currentSession?.hobby ?? "No active course"}
              </p>
              <p className="text-[10px] text-muted">
                {currentSession
                  ? `${currentSession.completedModules}/${currentSession.totalModules} • ${currentProgress}%`
                  : "Create a course to start"}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted" />
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-2 pb-4">
          {[
            {
              href: currentCourseHref,
              label: "Learn",
              icon: BookOpen,
              active: pathname === "/app/learn",
            },
            ...navItems.map((item) => ({
              ...item,
              active: isActivePath(pathname, item.href),
            })),
          ].map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={`${item.href}-${item.label}`}
                href={item.href}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
                  item.active
                    ? "bg-accent-soft text-accent"
                    : "text-muted hover:bg-surface-2 hover:text-text"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="font-medium">{item.label}</span>
                <ChevronRight
                  className={`ml-auto h-4 w-4 transition ${
                    item.active
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-100"
                  }`}
                />
              </Link>
            )
          })}
        </nav>
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-40 px-3 pt-2 [padding-bottom:max(env(safe-area-inset-bottom),0.5rem)] md:hidden">
        <div className="mx-auto max-w-md rounded-3xl border border-border/70 bg-linear-to-b from-surface/95 to-surface/90 p-1.5 shadow-[0_12px_36px_rgba(0,0,0,0.18)] backdrop-blur-xl">
          <div className="flex items-center justify-between gap-1 overflow-x-auto">
            {mobileItems.map((item) => {
              const Icon = item.icon
              const isActive =
                item.href.startsWith("/app/learn")
                  ? pathname === "/app/learn"
                  : isActivePath(pathname, item.href)

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-label={item.label}
                  title={item.label}
                  className={`group relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border transition-all ${
                    isActive
                      ? "border-accent/45 bg-accent-soft text-accent shadow-[0_4px_10px_rgba(0,0,0,0.08)]"
                      : "border-transparent text-muted hover:border-border/70 hover:bg-surface-2 hover:text-text"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </Link>
              )
            })}
          </div>
        </div>
      </nav>
    </>
  )
}
