"use client"

import { useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, type Variants } from "framer-motion"
import { Trash2, X } from "lucide-react"
import { useSessionsHistory } from "../hooks/useSessionsHistory"
import { LS_CURRENT_SESSION_KEY, SESSIONS_UPDATED_EVENT } from "../constants"
import type { Lesson } from "../types"
import ConfirmModal from "../components/ConfirmModal"

type DeepDiveItem = {
  sessionId: string
  sessionHobby: string
  lesson: Lesson
  lessonIndex: number
  moduleId: string | null
  moduleTitle: string
}

const listVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: "easeOut" },
  },
}

const modalVariants: Variants = {
  hidden: { opacity: 0, y: 14, scale: 0.985 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.2, ease: "easeOut" },
  },
}

export default function DeepDivesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { history, saveSnapshot } = useSessionsHistory()
  const [openKey, setOpenKey] = useState<string | null>(null)
  const [dismissedAutoOpen, setDismissedAutoOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<DeepDiveItem | null>(null)

  const deepDives = useMemo<DeepDiveItem[]>(() => {
    return history.flatMap((session) => {
      return session.lessons
        .map((lesson, lessonIndex) => ({ lesson, lessonIndex }))
        .filter((entry) => entry.lesson.kind === "inDepth")
        .reverse()
        .map((entry) => {
          const fallbackModule = session.plan.modules.find(
            (module) => module.title === entry.lesson.topic
          )

          return {
            sessionId: session.id,
            sessionHobby: session.hobby,
            lesson: entry.lesson,
            lessonIndex: entry.lessonIndex,
            moduleId: entry.lesson.sourceModuleId ?? fallbackModule?.id ?? null,
            moduleTitle:
              entry.lesson.sourceModuleTitle ??
              fallbackModule?.title ??
              entry.lesson.topic,
          }
        })
    })
  }, [history])

  const shouldAutoOpenLatest =
    !dismissedAutoOpen && searchParams.get("openLatest") === "1"
  const resolvedOpenKey =
    openKey !== null
      ? openKey
      : shouldAutoOpenLatest && deepDives.length > 0
      ? `${deepDives[0].sessionId}:${deepDives[0].lessonIndex}`
      : null

  const openIndex =
    resolvedOpenKey === null
      ? -1
      : deepDives.findIndex(
          (item) => `${item.sessionId}:${item.lessonIndex}` === resolvedOpenKey
        )
  const openItem = openIndex >= 0 ? deepDives[openIndex] : null

  function closeModal() {
    setOpenKey(null)
    setDismissedAutoOpen(true)
  }

  function removeDeepDive(item: DeepDiveItem) {
    const session = history.find((entry) => entry.id === item.sessionId)
    if (!session) return

    const next = {
      ...session,
      lessons: session.lessons.filter((_, index) => index !== item.lessonIndex),
    }
    saveSnapshot(next)

    if (openItem && openItem.sessionId === item.sessionId && openItem.lessonIndex === item.lessonIndex) {
      closeModal()
    }
  }

  function requestRemoveDeepDive(item: DeepDiveItem) {
    setPendingDelete(item)
  }

  function goToModule(item: DeepDiveItem) {
    if (typeof window !== "undefined") {
      localStorage.setItem(LS_CURRENT_SESSION_KEY, item.sessionId)
      window.dispatchEvent(new Event(SESSIONS_UPDATED_EVENT))
    }

    const url = item.moduleId
      ? `/app/learn?sessionId=${encodeURIComponent(item.sessionId)}&moduleId=${encodeURIComponent(
          item.moduleId
        )}`
      : `/app/learn?sessionId=${encodeURIComponent(item.sessionId)}`

    router.push(url)
  }

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-text">Deep Dives</h1>

      {deepDives.length === 0 ? (
        <p className="mt-6 text-sm text-muted">
          No deep dives yet. Generate them from the Learn page.
        </p>
      ) : (
        <motion.div
          className="mt-6 space-y-3"
          variants={listVariants}
          initial="hidden"
          animate="visible"
        >
          {deepDives.map((item) => (
            <motion.div
              key={`${item.sessionId}:${item.lessonIndex}`}
              role="button"
              tabIndex={0}
              onClick={() => setOpenKey(`${item.sessionId}:${item.lessonIndex}`)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  setOpenKey(`${item.sessionId}:${item.lessonIndex}`)
                }
              }}
              className="w-full cursor-pointer rounded-2xl border border-border bg-surface p-4 text-left shadow-sm transition hover:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/40"
              variants={itemVariants}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-text">{item.lesson.title}</h2>
                  <p className="mt-1 text-xs text-muted">
                    ~{item.lesson.estimatedTimeMinutes} min
                  </p>

                  <div className="mt-2 flex flex-wrap gap-1.5 text-[10px]">
                    <span className="rounded-full border border-border bg-surface-2 px-2 py-0.5 text-muted">
                      {item.sessionHobby}
                    </span>
                    <span className="rounded-full border border-accent/30 bg-accent-soft px-2 py-0.5 text-accent">
                      {item.moduleTitle}
                    </span>
                  </div>

                  <p className="mt-2 line-clamp-2 text-sm text-muted">
                    {item.lesson.summary}
                  </p>
                </div>
                <div className="shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      requestRemoveDeepDive(item)
                    }}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface-2 text-muted hover:bg-danger/10 hover:text-danger"
                    aria-label="Delete deep dive"
                    title="Delete deep dive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {openItem && (
        <div className="fixed inset-0 z-50 bg-app-bg/90 px-4 py-6 backdrop-blur-sm sm:px-10">
          <motion.div
            className="mx-auto flex h-[88vh] max-w-3xl flex-col rounded-3xl border border-border bg-surface p-5 sm:p-6"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">Deep dive</p>
                <h3 className="text-xl font-semibold text-text">{openItem.lesson.title}</h3>
                <p className="mt-1 text-[11px] text-muted">
                  Course: {openItem.sessionHobby} · Module: {openItem.moduleTitle}
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface-2 text-text hover:bg-surface"
                aria-label="Close deep dive"
                title="Close deep dive"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto">
              <p className="text-sm text-muted">{openItem.lesson.summary}</p>

              {openItem.lesson.sections.map((section, sectionIndex) => (
                <article
                  key={`${openItem.lesson.title}-section-${sectionIndex}`}
                  className="rounded-2xl border border-border bg-surface-2 p-4"
                >
                  <h4 className="text-sm font-semibold text-text">{section.heading}</h4>
                  <p className="mt-1 whitespace-pre-line text-sm text-muted">
                    {section.body}
                  </p>
                  {section.tips && section.tips.length > 0 && (
                    <div className="mt-2">
                      <p className="text-[11px] font-semibold text-muted">Key reasoning</p>
                      <ul className="mt-1 list-disc space-y-1 pl-5 text-xs text-muted">
                        {section.tips.map((tip) => (
                          <li key={tip}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {section.examples && section.examples.length > 0 && (
                    <div className="mt-2">
                      <p className="text-[11px] font-semibold text-muted">
                        Wrong options analysis
                      </p>
                      <ul className="mt-1 list-disc space-y-1 pl-5 text-xs text-muted">
                        {section.examples.map((example) => (
                          <li key={example}>{example}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </article>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-4">
              <button
                type="button"
                onClick={() => requestRemoveDeepDive(openItem)}
                className="rounded-xl border border-danger/50 px-3 py-2 text-xs font-semibold text-danger hover:bg-danger/10"
              >
                Delete deep dive
              </button>
              <button
                type="button"
                onClick={() => goToModule(openItem)}
                className="rounded-xl bg-accent-strong px-4 py-2 text-xs font-semibold text-white hover:bg-accent"
              >
                Go to module
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <ConfirmModal
        open={!!pendingDelete}
        title="Delete deep dive?"
        message={
          pendingDelete
            ? `Are you sure you want to delete \"${pendingDelete.lesson.title}\"?`
            : ""
        }
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          if (pendingDelete) {
            removeDeepDive(pendingDelete)
          }
          setPendingDelete(null)
        }}
        onCancel={() => setPendingDelete(null)}
      />
    </section>
  )
}
