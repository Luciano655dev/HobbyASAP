"use client"

import type { Route } from "next"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Bot,
  BookOpen,
  ChevronRight,
  Compass,
  Layers,
  PlusCircle,
  User,
} from "lucide-react"
import { useAppData } from "../AppDataProvider"

const navItems = [
  { href: "/app/courses", label: "Courses", icon: Compass },
  { href: "/app/deep-dives", label: "Deep Dives", icon: Layers },
  { href: "/app/ai-chat", label: "AI Chat", icon: Bot },
  { href: "/app/profile", label: "Profile", icon: User },
] as const

type SidebarNavItem = {
  href: Route
  label: string
  icon: typeof BookOpen
}

function isActivePath(pathname: string | null, href: string) {
  return pathname === href || pathname?.startsWith(`${href}/`)
}

export default function AppSidebar() {
  const pathname = usePathname()
  const { currentSession, currentSessionId, history } = useAppData()

  const currentCourseHref: Route = currentSessionId
    ? (`/app/learn?sessionId=${encodeURIComponent(currentSessionId)}` as Route)
    : "/app/courses/new"

  const completedModules = currentSession
    ? currentSession.completedTaskIds.filter((id) =>
        currentSession.plan.modules.some((module) => module.id === id)
      ).length
    : 0

  const currentProgress =
    currentSession && currentSession.plan.modules.length > 0
      ? Math.round((completedModules / currentSession.plan.modules.length) * 100)
      : 0

  const mobileItems: SidebarNavItem[] = [
    { href: currentCourseHref, label: "Current", icon: BookOpen },
    { href: "/app/courses", label: "Courses", icon: Compass },
    { href: "/app/deep-dives", label: "Deep Dives", icon: Layers },
    { href: "/app/ai-chat", label: "AI Chat", icon: Bot },
  ]

  return (
    <>
      <aside className="hidden w-80 shrink-0 border-r border-border bg-surface/80 md:flex md:flex-col">
        <div className="border-b border-border px-5 py-5">
          <p className="text-[11px] uppercase tracking-wide text-muted">Workspace</p>
          <div className="mt-2">
            <div>
              <h2 className="text-lg font-semibold text-text">Your courses</h2>
              <p className="text-xs text-muted">
                {history.length} saved {history.length === 1 ? "course" : "courses"}
              </p>
            </div>
          </div>
        </div>

        <div className="px-3 pt-3">
          <Link
            href="/app/courses/new"
            className="flex items-center justify-center gap-2 rounded-2xl bg-accent-strong px-4 py-3 text-sm font-semibold text-white hover:bg-accent"
          >
            <PlusCircle className="h-4 w-4" />
            <span>New Course</span>
          </Link>
        </div>

        <div className="px-3 pb-3 pt-3">
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
                  ? `${completedModules}/${currentSession.plan.modules.length} • ${currentProgress}%`
                  : "Create a course to start"}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted" />
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-2 pb-4">
          {([
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
          ] as Array<SidebarNavItem & { active: boolean }>).map((item) => {
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
                    item.active ? "opacity-100" : "opacity-0 group-hover:opacity-100"
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
