"use client"

import { useEffect, useMemo, useState } from "react"
import { motion, type Variants } from "framer-motion"
import { HobbyPlan, QuizModule } from "../types"

interface ModulesPathProps {
  plan: HobbyPlan
  completedTaskIds: string[]
  onToggleTask: (id: string) => void
  onOpenLesson: (kind: "masterclass" | "inDepth", topic: string) => void
  lessonLoading: boolean
}

type QuizState = {
  selected: Record<number, number>
  submitted: boolean
}

const pathVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: "easeOut" },
  },
}

const moduleCardVariants: Variants = {
  hidden: { opacity: 0, y: 10, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.2, ease: "easeOut" },
  },
}

export default function ModulesPath({
  plan,
  completedTaskIds,
  onToggleTask,
  onOpenLesson,
  lessonLoading,
}: ModulesPathProps) {
  const modules = plan.modules
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null)
  const [quizStates, setQuizStates] = useState<Record<string, QuizState>>({})
  const [isFollowingCurrent, setIsFollowingCurrent] = useState(true)

  const nextIncompleteIndex = useMemo(() => {
    return modules.findIndex((module) => !completedTaskIds.includes(module.id))
  }, [modules, completedTaskIds])

  const maxUnlockedIndex =
    nextIncompleteIndex === -1 ? modules.length - 1 : nextIncompleteIndex

  const defaultActiveId = modules[maxUnlockedIndex]?.id ?? null
  const currentModuleId = defaultActiveId

  useEffect(() => {
    if (!modules.length) return
    const activeExists = modules.some((module) => module.id === activeModuleId)
    if (!activeModuleId || !activeExists) {
      setActiveModuleId(defaultActiveId)
      setIsFollowingCurrent(true)
      return
    }
    if (isFollowingCurrent && defaultActiveId) {
      setActiveModuleId(defaultActiveId)
    }
  }, [modules, activeModuleId, defaultActiveId, isFollowingCurrent])

  useEffect(() => {
    setQuizStates({})
    setIsFollowingCurrent(true)
  }, [plan.hobby, plan.level])

  useEffect(() => {
    if (!activeModuleId || !modules.length) return
    if (!isFollowingCurrent) return
    if (!completedTaskIds.includes(activeModuleId)) return

    const activeIndex = modules.findIndex(
      (module) => module.id === activeModuleId
    )
    if (activeIndex === -1) return

    const next = modules
      .slice(activeIndex + 1)
      .find((module) => !completedTaskIds.includes(module.id))
    if (next) {
      setActiveModuleId(next.id)
    }
  }, [completedTaskIds, activeModuleId, modules])

  const activeModule =
    modules.find((module) => module.id === activeModuleId) ?? modules[0]

  function isUnlocked(index: number) {
    return index <= maxUnlockedIndex
  }

  function completeModule(id: string) {
    if (!completedTaskIds.includes(id)) {
      onToggleTask(id)
    }
  }

  function goToCurrentModule() {
    if (currentModuleId) {
      setActiveModuleId(currentModuleId)
      setIsFollowingCurrent(true)
    }
  }

  function getQuizState(id: string): QuizState {
    return quizStates[id] ?? { selected: {}, submitted: false }
  }

  function updateQuizState(id: string, next: QuizState) {
    setQuizStates((prev) => ({ ...prev, [id]: next }))
  }

  function selectQuizOption(id: string, questionIndex: number, optionIndex: number) {
    const prev = getQuizState(id)
    updateQuizState(id, {
      selected: { ...prev.selected, [questionIndex]: optionIndex },
      submitted: false,
    })
  }

  function submitQuiz(module: QuizModule) {
    const state = getQuizState(module.id)
    const allAnswered =
      module.questions.length > 0 &&
      module.questions.every((_, index) => state.selected[index] !== undefined)
    if (!allAnswered) return

    updateQuizState(module.id, { ...state, submitted: true })

    const allCorrect = module.questions.every(
      (question, index) => state.selected[index] === question.answerIndex
    )
    if (allCorrect) {
      completeModule(module.id)
    }
  }

  return (
    <section className="mb-10">
      <motion.div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5"
        variants={pathVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <div>
          <h2 className="text-sm sm:text-base font-semibold text-text">
            Learning path modules
          </h2>
          <p className="text-xs text-muted">
            Follow the path, unlock each module, and complete quick quizzes to
            advance.
          </p>
        </div>
        <div className="text-[11px] text-muted">
          {completedTaskIds.filter((id) =>
            modules.some((module) => module.id === id)
          ).length}
          /{modules.length} modules complete
        </div>
      </motion.div>

      {activeModule && (
        <motion.div
          className="mb-8 rounded-2xl border border-border bg-surface/90 p-5 shadow-md"
          variants={moduleCardVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-muted">
                {activeModule.type === "read" ? "Reading module" : "Quiz module"}
              </p>
              <h3 className="text-lg font-semibold text-text mt-1">
                {activeModule.title}
              </h3>
              <p className="text-sm text-muted mt-2">
                {activeModule.summary}
              </p>
            </div>
            <div className="text-[11px] text-muted">
              {activeModule.estimatedMinutes} min · {activeModule.xp} XP
            </div>
          </div>

          {activeModule.type === "read" && (
            <div className="mt-4 space-y-4">
              <ul className="list-disc pl-5 text-sm text-text space-y-1">
                {activeModule.content.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              {activeModule.keyTakeaways &&
                activeModule.keyTakeaways.length > 0 && (
                  <div>
                    <p className="text-[11px] font-semibold text-muted mb-1">
                      Key takeaways
                    </p>
                    <div className="flex flex-wrap gap-2 text-[11px] text-accent">
                      {activeModule.keyTakeaways.map((takeaway) => (
                        <span
                          key={takeaway}
                          className="rounded-full border border-accent/30 px-2.5 py-1"
                        >
                          {takeaway}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                {completedTaskIds.includes(activeModule.id) &&
                activeModule.id !== currentModuleId ? (
                  <button
                    type="button"
                    onClick={goToCurrentModule}
                    className="inline-flex items-center justify-center rounded-xl px-3 py-1.5 text-[11px] font-semibold transition bg-accent-strong text-white hover:bg-accent cursor-pointer"
                  >
                    Go to current module
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={completedTaskIds.includes(activeModule.id)}
                    onClick={() => completeModule(activeModule.id)}
                    className={`inline-flex items-center justify-center rounded-xl px-3 py-1.5 text-[11px] font-semibold transition ${
                      completedTaskIds.includes(activeModule.id)
                        ? "bg-accent/15 text-accent border border-accent/30 cursor-default"
                        : "bg-accent-strong text-white hover:bg-accent cursor-pointer"
                    }`}
                  >
                    {completedTaskIds.includes(activeModule.id)
                      ? "Completed"
                      : "Mark module complete"}
                  </button>
                )}
                <button
                  type="button"
                  disabled={lessonLoading}
                  onClick={() =>
                    !lessonLoading &&
                    onOpenLesson("masterclass", activeModule.title)
                  }
                  className={`inline-flex items-center justify-center rounded-xl border border-border bg-surface px-3 py-1.5 text-[11px] font-semibold text-text hover:bg-surface-2 cursor-pointer ${
                    lessonLoading ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                >
                  Add masterclass
                </button>
                <button
                  type="button"
                  disabled={lessonLoading}
                  onClick={() =>
                    !lessonLoading &&
                    onOpenLesson("inDepth", activeModule.title)
                  }
                  className={`inline-flex items-center justify-center rounded-xl border border-border bg-surface px-3 py-1.5 text-[11px] font-semibold text-text hover:bg-surface-2 cursor-pointer ${
                    lessonLoading ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                >
                  Deep dive
                </button>
              </div>
            </div>
          )}

          {activeModule.type === "quiz" && (
            <div className="mt-4 space-y-4">
              <p className="text-sm text-muted">{activeModule.prompt}</p>

              {activeModule.questions.map((question, questionIndex) => {
                const quizState = getQuizState(activeModule.id)
                const selectedIndex = quizState.selected[questionIndex]
                const isSubmitted = quizState.submitted
                const isCorrect =
                  selectedIndex === question.answerIndex && isSubmitted

                return (
                  <div
                    key={`${activeModule.id}-q-${questionIndex}`}
                    className="rounded-2xl border border-border bg-surface/70 p-3"
                  >
                    <p className="text-sm font-medium text-text mb-2">
                      {questionIndex + 1}. {question.question}
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {question.options.map((option, optionIndex) => {
                        const isSelected = selectedIndex === optionIndex
                        const showResult = isSubmitted
                        const optionIsCorrect =
                          optionIndex === question.answerIndex
                        const optionClasses = showResult
                          ? optionIsCorrect
                            ? "border-accent/60 bg-accent-soft text-accent"
                            : isSelected
                            ? "border-danger/60 bg-danger/10 text-danger"
                            : "border-border bg-surface/70 text-muted"
                          : isSelected
                          ? "border-accent/60 bg-accent-soft text-accent"
                          : "border-border bg-surface/70 text-muted hover:border-accent/40"

                        return (
                          <button
                            key={`${activeModule.id}-q-${questionIndex}-opt-${optionIndex}`}
                            type="button"
                            disabled={completedTaskIds.includes(activeModule.id)}
                            onClick={() =>
                              selectQuizOption(
                                activeModule.id,
                                questionIndex,
                                optionIndex
                              )
                            }
                            className={`rounded-xl border px-3 py-2 text-left text-xs transition cursor-pointer ${optionClasses} ${
                              completedTaskIds.includes(activeModule.id)
                                ? "cursor-not-allowed"
                                : ""
                            }`}
                          >
                            {option}
                          </button>
                        )
                      })}
                    </div>
                    {isSubmitted && (
                      <p
                        className={`mt-2 text-xs ${
                          isCorrect ? "text-accent" : "text-muted"
                        }`}
                      >
                        {question.explanation}
                      </p>
                    )}
                  </div>
                )
              })}

              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                {(() => {
                  const quizState = getQuizState(activeModule.id)
                  const canSubmit =
                    activeModule.questions.length > 0 &&
                    activeModule.questions.every(
                      (_, index) => quizState.selected[index] !== undefined
                    )

                  return (
                    <button
                      type="button"
                      disabled={
                        completedTaskIds.includes(activeModule.id) || !canSubmit
                      }
                      onClick={() => submitQuiz(activeModule)}
                      className={`inline-flex items-center justify-center rounded-xl px-3 py-1.5 text-[11px] font-semibold transition cursor-pointer ${
                        completedTaskIds.includes(activeModule.id)
                          ? "bg-accent/15 text-accent border border-accent/30 cursor-default"
                          : !canSubmit
                          ? "bg-surface-2 text-muted border border-border cursor-not-allowed"
                          : "bg-accent-strong text-white hover:bg-accent"
                      }`}
                    >
                      {completedTaskIds.includes(activeModule.id)
                        ? "Quiz completed"
                        : "Check answers"}
                    </button>
                  )
                })()}
                {completedTaskIds.includes(activeModule.id) &&
                  activeModule.id !== currentModuleId && (
                    <button
                      type="button"
                      onClick={goToCurrentModule}
                      className="inline-flex items-center justify-center rounded-xl px-3 py-1.5 text-[11px] font-semibold transition bg-accent-strong text-white hover:bg-accent cursor-pointer"
                    >
                      Go to current module
                    </button>
                  )}
                {!completedTaskIds.includes(activeModule.id) && (
                  <p className="text-[11px] text-muted">
                    Answer all questions correctly to complete this module.
                  </p>
                )}
              </div>
            </div>
          )}
        </motion.div>
      )}

      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-px bg-border sm:left-1/2 sm:-translate-x-1/2" />
        <div className="space-y-6">
          {modules.map((module, index) => {
            const unlocked = isUnlocked(index)
            const completed = completedTaskIds.includes(module.id)
            const isActive = module.id === activeModuleId
            const alignLeft = index % 2 === 0
            const icon =
              module.type === "read" ? "📖" : module.type === "quiz" ? "🧠" : "⭐"

            return (
              <motion.div
                key={module.id}
                className={`flex ${alignLeft ? "justify-start" : "justify-end"}`}
                variants={moduleCardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.4 }}
              >
                <div
                  className={`w-full sm:w-1/2 pl-12 sm:pl-0 ${
                    alignLeft ? "sm:pr-10" : "sm:pl-10"
                  }`}
                >
                  <button
                    type="button"
                    disabled={!unlocked}
                    onClick={() => {
                      if (!unlocked) return
                      setActiveModuleId(module.id)
                      setIsFollowingCurrent(module.id === currentModuleId)
                    }}
                    className={`relative z-10 w-full rounded-2xl border px-4 py-3 text-left transition ${
                      completed
                        ? "border-accent/50 bg-accent-soft"
                        : unlocked
                        ? "border-border bg-surface/80 hover:border-accent/60 hover:bg-surface-2"
                        : "border-border bg-surface/60 opacity-60 cursor-not-allowed"
                    } ${isActive ? "ring-1 ring-accent/60" : ""} ${
                      unlocked ? "cursor-pointer" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center text-base sm:text-lg shadow-sm ${
                          completed
                            ? "bg-accent text-white"
                            : unlocked
                            ? "bg-surface-2 text-text border border-border"
                            : "bg-surface-2 text-muted border border-border"
                        }`}
                      >
                        {completed ? "✓" : unlocked ? icon : "🔒"}
                      </div>
                      <div className="flex-1">
                        <p className="text-[11px] uppercase tracking-wide text-muted">
                          {module.type === "read" ? "Read module" : "Quiz module"}
                        </p>
                        <p className="text-sm font-semibold text-text">
                          {module.title}
                        </p>
                        <p className="text-[11px] text-muted">
                          {module.estimatedMinutes} min · {module.xp} XP
                        </p>
                        {completed && (
                          <span className="mt-1 inline-flex items-center rounded-full border border-accent/40 px-2 py-[2px] text-[10px] text-accent sm:hidden">
                            Completed
                          </span>
                        )}
                      </div>
                      {completed && (
                        <span className="text-[10px] text-accent">
                          Completed
                        </span>
                      )}
                    </div>
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

    </section>
  )
}
