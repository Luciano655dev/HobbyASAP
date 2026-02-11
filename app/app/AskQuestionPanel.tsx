"use client"

import { useState } from "react"
import { motion, type Variants } from "framer-motion"
import type { HobbyPlan, Lesson } from "./types"

export interface QATask {
  label: string
  minutes?: number
  xp?: number
}

export interface QAItem {
  id: string
  question: string
  answer: string
  createdAt: string
  tasks: QATask[]
  inDepthTopic: string | null
}

interface AskQuestionPanelProps {
  plan: HobbyPlan
  lessons: Lesson[]

  // History of questions for this run (stored in page.tsx)
  questions: QAItem[]

  // Parent handles storing / removing questions (for persistence)
  onQuestionAdded: (item: QAItem) => void
  onQuestionDeleted: (id: string) => void

  // Hook into openLesson("inDepth", topic)
  onInDepthRequest?: (topic: string) => void

  // whether an in-depth lesson is currently generating
  lessonLoading?: boolean
}

// Animations
const panelVariants: Variants = {
  hidden: { opacity: 0, y: 10, scale: 0.99 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.25, ease: "easeOut" },
  },
}

const latestCardVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: "easeOut" },
  },
}

const historyListVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
    },
  },
}

const historyItemVariants: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.15, ease: "easeOut" },
  },
}

// Helper to render the answer with paragraphs + simple bullets
function renderAnswer(answer: string) {
  const blocks = answer.split(/\n{2,}/).filter((b) => b.trim().length > 0)

  return (
    <>
      {blocks.map((block, idx) => {
        const lines = block.split("\n")
        const bulletLines = lines.filter((l) => /^\s*[-*]\s+/.test(l))
        const nonBulletLines = lines.filter((l) => !/^\s*[-*]\s+/.test(l))

        return (
          <div key={idx} className="mb-2 last:mb-0">
            {nonBulletLines.length > 0 && (
              <p className="text-sm text-muted">
                {nonBulletLines.join(" ").trim()}
              </p>
            )}
            {bulletLines.length > 0 && (
              <ul className="list-disc pl-5 text-xs text-muted mt-1 space-y-1">
                {bulletLines.map((line, i) => (
                  <li key={i}>{line.replace(/^\s*[-*]\s+/, "")}</li>
                ))}
              </ul>
            )}
          </div>
        )
      })}
    </>
  )
}

export default function AskQuestionPanel(props: AskQuestionPanelProps) {
  const {
    plan,
    lessons,
    questions,
    onQuestionAdded,
    onQuestionDeleted,
    onInDepthRequest,
    lessonLoading = false,
  } = props

  const [question, setQuestion] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [completedTasks, setCompletedTasks] = useState<string[]>([])
  const [showContextPicker, setShowContextPicker] = useState(false)
  const [includeCourseContext, setIncludeCourseContext] = useState(false)
  const [includeHistoryContext, setIncludeHistoryContext] = useState(false)
  const [selectedModuleIds, setSelectedModuleIds] = useState<string[]>([])
  const [selectedDeepDiveIndexes, setSelectedDeepDiveIndexes] = useState<number[]>(
    []
  )

  const hasContext = !!plan
  const selectedContextCount =
    Number(includeCourseContext) +
    Number(includeHistoryContext) +
    Number(selectedModuleIds.length > 0) +
    Number(selectedDeepDiveIndexes.length > 0)

  // We assume parent appends new questions at the end of the array
  const latest = questions.length > 0 ? questions[questions.length - 1] : null
  // Older ones, newest first
  const older =
    questions.length > 1 ? [...questions.slice(0, -1)].reverse() : []

  function toggleTask(id: string) {
    setCompletedTasks((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  function toggleModuleContext(moduleId: string) {
    setSelectedModuleIds((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    )
  }

  function toggleDeepDiveContext(index: number) {
    setSelectedDeepDiveIndexes((prev) =>
      prev.includes(index) ? prev.filter((x) => x !== index) : [...prev, index]
    )
  }

  function clearContextSelection() {
    setIncludeCourseContext(false)
    setIncludeHistoryContext(false)
    setSelectedModuleIds([])
    setSelectedDeepDiveIndexes([])
  }

  async function handleAsk(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!question.trim()) {
      setError("Type a question first.")
      return
    }

    if (!plan) {
      setError("Generate a path first so you can add context.")
      return
    }

    if (selectedContextCount === 0) {
      setError("Add at least one context before asking.")
      return
    }

    setLoading(true)
    try {
      const language = localStorage.getItem("hobbyasap_lang") ?? "en"

      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question.trim(),
          plan,
          lessons,
          language,
          // Sent as optional context pool; API includes only selected blocks.
          history: questions.map((item) => ({
            question: item.question,
            answer: item.answer,
          })),
          contextSelection: {
            includeCourse: includeCourseContext,
            moduleIds: selectedModuleIds,
            deepDiveIndexes: selectedDeepDiveIndexes,
            includeHistory: includeHistoryContext,
          },
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to get an answer.")
      }

      const data = await res.json()
      const answer: string = data.answer
      const tasks: QATask[] = Array.isArray(data.tasks) ? data.tasks : []
      const inDepthTopic: string | null =
        typeof data.inDepthTopic === "string" && data.inDepthTopic.trim()
          ? data.inDepthTopic.trim()
          : null

      const item: QAItem = {
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        question: question.trim(),
        answer,
        createdAt: new Date().toISOString(),
        tasks,
        inDepthTopic,
      }

      // Let the parent know about the new question so it can persist it
      onQuestionAdded(item)
      setQuestion("")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  const inDepthDisabled = !onInDepthRequest || lessonLoading

  return (
    <section className="mb-20 space-y-4 sm:mb-16">
      {/* Title row outside card, like LessonsArea */}
      <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-sm font-semibold text-text sm:text-base">
            Ask AI
          </h2>
          <p className="mt-0.5 text-[11px] text-muted sm:text-xs">
            Add the exact context you want, then ask your question.
          </p>
        </div>
        {!hasContext && (
          <span className="text-[10px] px-2 py-1 rounded-full border border-border text-muted">
            Generate a path first
          </span>
        )}
      </div>

      <motion.div
        className="rounded-2xl border border-border bg-surface/95 p-4 shadow-sm sm:p-6"
        variants={panelVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {/* Ask form */}
        <form onSubmit={handleAsk} className="mb-4 flex flex-col gap-3">
          <div className="rounded-xl border border-border bg-surface-2/60 px-3 py-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowContextPicker((prev) => !prev)}
                className="rounded-full border border-border bg-surface px-3 py-1 text-[11px] font-semibold text-text transition-colors hover:bg-surface-2"
              >
                {showContextPicker ? "Hide context" : "Add context"}
              </button>
              <button
                type="button"
                onClick={clearContextSelection}
                disabled={selectedContextCount === 0}
                className="rounded-full border border-border bg-surface px-3 py-1 text-[11px] text-muted hover:bg-surface-2 disabled:opacity-50"
              >
                Clear
              </button>
              <p className="text-[10px] text-muted sm:ml-auto">
                {selectedContextCount === 0
                  ? "No context selected"
                  : `${selectedContextCount} context group${selectedContextCount > 1 ? "s" : ""} selected`}
              </p>
            </div>

            {selectedContextCount > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {includeCourseContext && (
                  <span className="rounded-full border border-accent/50 bg-accent-soft px-2 py-0.5 text-[10px] font-medium text-accent">
                    Course
                  </span>
                )}
                {selectedModuleIds.length > 0 && (
                  <span className="rounded-full border border-accent/50 bg-accent-soft px-2 py-0.5 text-[10px] font-medium text-accent">
                    Modules ({selectedModuleIds.length})
                  </span>
                )}
                {selectedDeepDiveIndexes.length > 0 && (
                  <span className="rounded-full border border-accent/50 bg-accent-soft px-2 py-0.5 text-[10px] font-medium text-accent">
                    Deep dives ({selectedDeepDiveIndexes.length})
                  </span>
                )}
                {includeHistoryContext && (
                  <span className="rounded-full border border-accent/50 bg-accent-soft px-2 py-0.5 text-[10px] font-medium text-accent">
                    Previous Q&A
                  </span>
                )}
              </div>
            )}

            {showContextPicker && (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-border bg-surface p-2.5 shadow-sm">
                  <p className="mb-2 text-[11px] font-semibold text-text">General</p>
                  <label className="flex items-center gap-2 text-xs text-text">
                    <input
                      type="checkbox"
                      checked={includeCourseContext}
                      onChange={(e) => setIncludeCourseContext(e.target.checked)}
                      className="h-3.5 w-3.5 rounded border-border accent-accent"
                    />
                    <span>Course overview</span>
                  </label>
                  <label className="mt-2 flex items-center gap-2 text-xs text-text">
                    <input
                      type="checkbox"
                      checked={includeHistoryContext}
                      onChange={(e) => setIncludeHistoryContext(e.target.checked)}
                      className="h-3.5 w-3.5 rounded border-border accent-accent"
                    />
                    <span>Previous Q&A</span>
                  </label>
                </div>

                <div className="rounded-xl border border-border bg-surface p-2.5 shadow-sm">
                  <p className="mb-2 text-[11px] font-semibold text-text">
                    Modules ({plan.modules.length})
                  </p>
                  <div className="max-h-36 space-y-1 overflow-y-auto pr-1">
                    {plan.modules.map((module) => (
                      <label
                        key={module.id}
                        className="flex items-start gap-2 text-xs text-text"
                      >
                        <input
                          type="checkbox"
                          checked={selectedModuleIds.includes(module.id)}
                          onChange={() => toggleModuleContext(module.id)}
                          className="mt-0.5 h-3.5 w-3.5 rounded border-border accent-accent"
                        />
                        <span className="line-clamp-2">{module.title}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-surface p-2.5 shadow-sm sm:col-span-2">
                  <p className="mb-2 text-[11px] font-semibold text-text">
                    Deep dives ({lessons.length})
                  </p>
                  {lessons.length === 0 ? (
                    <p className="text-[11px] text-muted">
                      No deep dives yet.
                    </p>
                  ) : (
                    <div className="max-h-36 space-y-1 overflow-y-auto pr-1">
                      {lessons.map((lesson, index) => (
                        <label
                          key={`${lesson.title}-${index}`}
                          className="flex items-start gap-2 text-xs text-text"
                        >
                          <input
                            type="checkbox"
                            checked={selectedDeepDiveIndexes.includes(index)}
                            onChange={() => toggleDeepDiveContext(index)}
                            className="mt-0.5 h-3.5 w-3.5 rounded border-border accent-accent"
                          />
                          <span className="line-clamp-2">
                            {lesson.title}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <textarea
            rows={4}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={
              hasContext
                ? "Example: Explain module 3 in simpler words and what to practice first."
                : "Generate a path first, then add context and ask."
            }
            className="w-full resize-none rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
            disabled={!hasContext || loading}
          />

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="submit"
              disabled={!hasContext || loading || selectedContextCount === 0}
              className="inline-flex w-full items-center justify-center rounded-xl bg-accent-strong px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:text-sm"
            >
              {loading ? "Thinking..." : "Ask AI"}
            </button>
            <p className="text-[10px] text-muted sm:text-right">
              Context is only what you select.
            </p>
          </div>

          {error && (
            <p className="text-xs text-danger bg-danger/10 border border-danger/40 rounded-xl px-3 py-2">
              {error}
            </p>
          )}
        </form>

      {/* Latest answer - big coach card */}
        {latest && (
          <motion.div
            className="mb-5 rounded-2xl border border-accent/35 bg-linear-to-b from-surface to-surface/90 p-3.5 shadow-sm sm:p-4"
            variants={latestCardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <div className="flex items-start justify-between gap-2 mb-1">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-accent mb-1">
                  Latest answer
                </p>
                <p className="text-xs text-muted">
                  Question:{" "}
                  <span className="text-text font-medium">
                    {latest.question}
                  </span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => onQuestionDeleted(latest.id)}
                className="text-[10px] rounded-full border border-danger/60 px-2 py-0.5 text-danger hover:bg-danger/10"
              >
                Remove
              </button>
            </div>

            <div className="mb-3 rounded-xl border border-border bg-surface/70 px-3 py-2">
              {renderAnswer(latest.answer)}
            </div>

            {/* Optional tasks from the AI for this answer */}
            {latest.tasks && latest.tasks.length > 0 && (
              <div className="mb-3">
                <p className="text-[11px] font-semibold text-accent mb-1.5">
                  Suggested practice from this answer
                </p>
                <ul className="space-y-1.5">
                  {latest.tasks.map((task, index) => {
                    const id = `${latest.id}-task-${index}-${task.label}`
                    const checked = completedTasks.includes(id)
                    return (
                      <li
                        key={id}
                        className={`flex items-start gap-2 rounded-2xl px-3 py-1.5 border text-[11px] sm:text-xs ${
                          checked
                            ? "border-accent/60 bg-accent-soft"
                            : "border-border bg-surface/70 hover:border-accent/60"
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="mt-0.5 h-3.5 w-3.5 rounded border-border bg-surface accent-accent"
                          checked={checked}
                          onChange={() => toggleTask(id)}
                        />
                        <div className="flex-1">
                          <p
                            className={
                              checked
                                ? "text-muted line-through"
                                : "text-text"
                            }
                          >
                            {task.label}
                          </p>
                          <p className="text-[10px] text-muted mt-0.5">
                            {task.minutes && <>~{task.minutes} min </>}
                            {task.minutes && task.xp && "· "}
                            {task.xp && <>XP: {task.xp}</>}
                          </p>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}

            {/* Optional in-depth button */}
            {latest.inDepthTopic && onInDepthRequest && (
              <button
                type="button"
                disabled={inDepthDisabled}
                onClick={() =>
                  !inDepthDisabled &&
                  onInDepthRequest(latest.inDepthTopic!)
                }
                className={`inline-flex items-center justify-center rounded-xl bg-accent-strong px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm shadow-accent/30 transition hover:bg-accent hover:shadow-md active:translate-y-[1px] ${
                  inDepthDisabled
                    ? "opacity-50 cursor-not-allowed active:translate-y-0 hover:bg-accent-strong hover:shadow-sm"
                    : ""
                }`}
              >
                In-depth on “{latest.inDepthTopic}”
              </button>
            )}

            <p className="mt-2 text-[10px] text-muted">
              {new Date(latest.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              · {new Date(latest.createdAt).toLocaleDateString()}
            </p>
          </motion.div>
        )}

        {/* Q&A history list (older ones) */}
        {older.length > 0 && (
          <div className="border-t border-border pt-3">
            <h3 className="text-xs sm:text-sm font-semibold text-text mb-2">
              Previous questions
            </h3>
            <motion.div
              className="max-h-64 space-y-3 overflow-y-auto pr-1 sm:max-h-52"
              variants={historyListVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              {older.map((item) => (
                <motion.div
                  key={item.id}
                  className="rounded-2xl border border-border bg-surface/85 p-3 text-xs shadow-sm sm:text-sm"
                  variants={historyItemVariants}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-text font-medium">
                      Q: {item.question}
                    </p>
                    <button
                      type="button"
                      onClick={() => onQuestionDeleted(item.id)}
                      className="text-[10px] rounded-full border border-danger/60 px-2 py-0.5 text-danger hover:bg-danger/10"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="text-muted text-xs sm:text-sm mb-2">
                    {renderAnswer(item.answer)}
                  </div>

                  {item.tasks && item.tasks.length > 0 && (
                    <div className="mb-1">
                      <p className="text-[10px] font-semibold text-accent mb-0.5">
                        Suggested tasks from this answer:
                      </p>
                      <ul className="space-y-0.5">
                        {item.tasks.map((task, index) => {
                          const id = `${item.id}-task-${index}-${task.label}`
                          const checked = completedTasks.includes(id)
                          return (
                            <li
                              key={id}
                              className={`flex items-start gap-2 rounded-xl px-2 py-1 border text-[10px] ${
                                checked
                                  ? "border-accent/60 bg-accent-soft"
                                  : "border-border bg-surface/70"
                              }`}
                            >
                              <input
                                type="checkbox"
                                className="mt-0.5 h-3 w-3 rounded border-border bg-surface accent-accent"
                                checked={checked}
                                onChange={() => toggleTask(id)}
                              />
                              <div className="flex-1">
                                <p
                                  className={
                                    checked
                                      ? "text-muted line-through"
                                      : "text-text"
                                  }
                                >
                                  {task.label}
                                </p>
                              </div>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  )}

                  {item.inDepthTopic && onInDepthRequest && (
                    <button
                      type="button"
                      disabled={inDepthDisabled}
                      onClick={() =>
                        !inDepthDisabled &&
                        onInDepthRequest(item.inDepthTopic!)
                      }
                      className={`mt-1 inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[10px] text-text hover:bg-surface-2 ${
                        inDepthDisabled
                          ? "opacity-50 cursor-not-allowed hover:bg-surface"
                          : ""
                      }`}
                    >
                      In-depth on “{item.inDepthTopic}”
                    </button>
                  )}

                  <p className="mt-1 text-[10px] text-muted">
                    {new Date(item.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    · {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}

        {!latest && !error && (
          <p className="text-[11px] text-muted mt-1">
            No questions yet. Add context, ask your question, and the answer
            will appear here.
          </p>
        )}
      </motion.div>
    </section>
  )
}
