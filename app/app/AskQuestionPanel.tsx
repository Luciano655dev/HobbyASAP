"use client"

import { useState } from "react"
import { motion, type Variants } from "framer-motion"
import { Bot, Trash2, User } from "lucide-react"
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
  questions: QAItem[]
  onQuestionAdded: (item: QAItem) => void
  onQuestionDeleted: (id: string) => void
  onInDepthRequest?: (topic: string) => void
  lessonLoading?: boolean
  questionLimitReached?: boolean
  questionRemaining?: number
  questionLimit?: number
}

const panelVariants: Variants = {
  hidden: { opacity: 0, y: 10, scale: 0.99 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.22, ease: "easeOut" },
  },
}

const messageVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.18, ease: "easeOut" },
  },
}

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
              <p className="text-sm leading-relaxed text-text">
                {nonBulletLines.join(" ").trim()}
              </p>
            )}
            {bulletLines.length > 0 && (
              <ul className="mt-1 list-disc space-y-1 pl-5 text-xs text-muted">
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
    questionLimitReached = false,
    questionRemaining = 0,
    questionLimit = 0,
  } = props

  const [question, setQuestion] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
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

    if (questionLimitReached) {
      setError(`AI question limit reached (${questionLimit}).`)
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
    <motion.section
      className="mb-20 md:mb-0 sm:mb-16 md:h-full"
      variants={panelVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex h-[68vh] min-h-[30rem] flex-col overflow-hidden rounded-2xl border border-border bg-surface/95 shadow-sm sm:h-[calc(100vh-13rem)] md:h-full">
        <div className="border-b border-border p-3 sm:p-4">
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
                    <p className="text-[11px] text-muted">No deep dives yet.</p>
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
                          <span className="line-clamp-2">{lesson.title}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-3 sm:px-4 sm:py-4">
          {questions.length === 0 ? (
            <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-border bg-surface-2/40 p-6 text-center">
              <div>
                <p className="text-sm font-medium text-text">Start your conversation</p>
                <p className="mt-1 text-xs text-muted">
                  Add context, ask your question, and your chat will appear here.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((item) => (
                <motion.div key={item.id} variants={messageVariants} initial="hidden" animate="visible">
                  <div className="mb-2 flex justify-end gap-2">
                    <div className="max-w-[85%] rounded-2xl rounded-br-md bg-accent-strong px-3 py-2 text-sm text-white shadow-sm">
                      {item.question}
                    </div>
                    <div className="mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full border border-accent/50 bg-accent-soft text-accent">
                      <User className="h-4 w-4" />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <div className="mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-surface-2 text-muted">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1 rounded-2xl rounded-tl-md border border-border bg-surface p-3 shadow-sm">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                          AI response
                        </p>
                        <button
                          type="button"
                          onClick={() => onQuestionDeleted(item.id)}
                          className="rounded-md p-1 text-muted hover:bg-danger/10 hover:text-danger"
                          aria-label="Delete message"
                          title="Delete message"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {renderAnswer(item.answer)}

                      {item.tasks && item.tasks.length > 0 && (
                        <div className="mt-3 rounded-xl border border-border bg-surface-2/50 p-2.5">
                          <p className="mb-1 text-[11px] font-semibold text-muted">Suggested tasks</p>
                          <ul className="space-y-1 text-xs text-muted">
                            {item.tasks.map((task, index) => (
                              <li key={`${item.id}-task-${index}`}>- {task.label}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {item.inDepthTopic && onInDepthRequest && (
                        <button
                          type="button"
                          disabled={inDepthDisabled}
                          onClick={() =>
                            !inDepthDisabled && onInDepthRequest(item.inDepthTopic as string)
                          }
                          className={`mt-3 inline-flex items-center justify-center rounded-xl bg-accent-strong px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-accent ${
                            inDepthDisabled ? "cursor-not-allowed opacity-50" : ""
                          }`}
                        >
                          In-depth on “{item.inDepthTopic}”
                        </button>
                      )}

                      <p className="mt-2 text-[10px] text-muted">
                        {new Date(item.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        · {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={handleAsk} className="border-t border-border bg-surface px-3 py-2.5 sm:px-4 sm:py-3">
          <textarea
            rows={3}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={
              hasContext
                ? "Ask about a module, quiz answer, or deep dive..."
                : "Generate a path first, then add context and ask."
            }
            className="w-full resize-none rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
            disabled={!hasContext || loading}
          />

          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="submit"
              disabled={
                !hasContext ||
                loading ||
                selectedContextCount === 0 ||
                questionLimitReached
              }
              className="inline-flex w-full items-center justify-center rounded-xl bg-accent-strong px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:text-sm"
            >
              {loading ? "Thinking..." : "Send"}
            </button>
            <p className="text-[10px] text-muted sm:text-right">
              Context is only what you select. {questionRemaining} questions left.
            </p>
          </div>

          {error && (
            <p className="mt-2 rounded-xl border border-danger/40 bg-danger/10 px-3 py-2 text-xs text-danger">
              {error}
            </p>
          )}
        </form>
      </div>
    </motion.section>
  )
}
