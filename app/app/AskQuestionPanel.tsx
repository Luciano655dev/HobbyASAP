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

  const hasContext = !!plan

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

  async function handleAsk(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!question.trim()) {
      setError("Type a question first.")
      return
    }

    if (!plan) {
      setError("Generate a path first so I have context.")
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
          // send history as simple Q/A pairs for context
          history: questions.map((item) => ({
            question: item.question,
            answer: item.answer,
          })),
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
    } catch (err: any) {
      setError(err.message || "Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  const inDepthDisabled = !onInDepthRequest || lessonLoading

  return (
    <section className="mb-16 space-y-4">
      {/* Title row outside card, like LessonsArea */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm sm:text-base font-semibold text-text">
            Ask a question about your path
          </h2>
          <p className="text-[11px] sm:text-xs text-muted mt-0.5">
            Ask anything about your modules, quizzes, or deep dives. I’ll
            use your current path, lessons, and previous questions as context.
          </p>
        </div>
        {!hasContext && (
          <span className="text-[10px] px-2 py-1 rounded-full border border-border text-muted">
            Generate a path first
          </span>
        )}
      </div>

      <motion.div
        className="bg-surface/90 border border-border rounded-2xl p-5 sm:p-6 shadow-md"
        variants={panelVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {/* Ask form */}
        <form onSubmit={handleAsk} className="flex flex-col gap-3 mb-4">
          <textarea
            rows={3}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={
              hasContext
                ? "Example: Can you clarify week 2 drills? Or how should I adapt this if I only have 30 minutes?"
                : "Generate a path first, then ask questions about it."
            }
            className="w-full rounded-xl px-3 py-2.5 bg-surface border border-border focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent text-sm text-text placeholder:text-muted resize-none"
            disabled={!hasContext || loading}
          />

          <div className="flex items-center justify-between gap-3">
            <button
              type="submit"
              disabled={!hasContext || loading}
              className="inline-flex items-center justify-center rounded-xl bg-accent-strong hover:bg-accent text-white font-semibold px-4 py-2 text-xs sm:text-sm disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Thinking..." : "Ask about this path"}
            </button>
            <p className="text-[10px] text-muted">
              Context: modules · deep dives · previous Q&A.
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
            className="mb-5 rounded-2xl border border-accent/40 bg-surface/90 p-4 shadow-md shadow-accent/10"
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

            <div className="rounded-xl bg-surface/70 border border-border px-3 py-2 mb-3">
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
                className={`inline-flex items-center justify-center rounded-xl bg-accent-strong px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm shadow-accent/40 hover:bg-accent hover:shadow-md active:translate-y-[1px] transition ${
                  inDepthDisabled
                    ? "opacity-50 cursor-not-allowed active:translate-y-0 hover:bg-accent-strong hover:shadow-sm"
                    : ""
                }`}
              >
                🔍 In-depth on “{latest.inDepthTopic}”
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
              className="space-y-3 max-h-52 overflow-y-auto pr-1"
              variants={historyListVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              {older.map((item) => (
                <motion.div
                  key={item.id}
                  className="rounded-2xl border border-border bg-surface/80 p-3 text-xs sm:text-sm"
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
            No questions yet. Ask something specific about your modules,
            quizzes, or gear and you’ll see the answer here, sometimes with
            extra practice tasks and an in-depth suggestion.
          </p>
        )}
      </motion.div>
    </section>
  )
}
