"use client"

import { useMemo, useState } from "react"
import { motion, type Variants } from "framer-motion"
import { HobbyPlan, Module, ModuleInDepthContext, QuizModule } from "../types"
import {
  ArrowRight,
  BookOpen,
  Brain,
  Check,
  Search,
  X,
} from "lucide-react"

interface ModulesPathProps {
  plan: HobbyPlan
  completedTaskIds: string[]
  sectionModuleCounts: number[]
  onToggleTask: (id: string) => void
  onOpenLesson: (
    kind: "inDepth",
    topic: string,
    moduleContext?: ModuleInDepthContext
  ) => void
  lessonLoading: boolean
  sectionLoading?: boolean
  onGenerateNextSection?: () => void
  initialOpenModuleId?: string | null
}

type QuizState = {
  selected: Record<number, number>
  submitted: boolean
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 8, scale: 0.98 },
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
  sectionModuleCounts,
  onToggleTask,
  onOpenLesson,
  lessonLoading,
  sectionLoading = false,
  onGenerateNextSection,
  initialOpenModuleId,
}: ModulesPathProps) {
  const modules = plan.modules
  const [quizStates, setQuizStates] = useState<Record<string, QuizState>>({})
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null)
  const [openModuleId, setOpenModuleId] = useState<string | null>(
    initialOpenModuleId ?? null
  )

  const nextIncompleteIndex = useMemo(() => {
    return modules.findIndex((module) => !completedTaskIds.includes(module.id))
  }, [modules, completedTaskIds])

  const maxUnlockedIndex =
    nextIncompleteIndex === -1 ? modules.length - 1 : nextIncompleteIndex

  const currentModuleId = modules[maxUnlockedIndex]?.id ?? null
  const openModule = modules.find((module) => module.id === openModuleId) ?? null
  const openModuleIndex = openModule
    ? modules.findIndex((module) => module.id === openModule.id)
    : -1
  const nextModule =
    openModuleIndex >= 0 && openModuleIndex + 1 < modules.length
      ? modules[openModuleIndex + 1]
      : null
  const nextModuleUnlocked = nextModule
    ? isUnlocked(openModuleIndex + 1)
    : false

  function isUnlocked(index: number) {
    return index <= maxUnlockedIndex
  }

  const normalizedSectionCounts = useMemo(() => {
    const positiveCounts = sectionModuleCounts.filter((count) => count > 0)
    const totalFromSections = positiveCounts.reduce((sum, count) => sum + count, 0)
    if (positiveCounts.length === 0) return [modules.length]
    if (totalFromSections === modules.length) return positiveCounts
    if (totalFromSections < modules.length) {
      return [...positiveCounts, modules.length - totalFromSections]
    }
    return [modules.length]
  }, [sectionModuleCounts, modules.length])

  const sectionStartIndexes = useMemo(() => {
    const starts: number[] = []
    let cursor = 0
    for (const count of normalizedSectionCounts) {
      starts.push(cursor)
      cursor += count
    }
    return starts
  }, [normalizedSectionCounts])

  function completeModule(id: string) {
    if (!completedTaskIds.includes(id)) {
      onToggleTask(id)
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

  function buildInDepthContext(module: Module): ModuleInDepthContext {
    if (module.type === "read") {
      return {
        moduleId: module.id,
        moduleType: module.type,
        title: module.title,
        summary: module.summary,
        estimatedMinutes: module.estimatedMinutes,
        xp: module.xp,
        readContent: module.content,
        readKeyTakeaways: module.keyTakeaways,
      }
    }

    return {
      moduleId: module.id,
      moduleType: module.type,
      title: module.title,
      summary: module.summary,
      estimatedMinutes: module.estimatedMinutes,
      xp: module.xp,
      quizPrompt: module.prompt,
      quizQuestions: module.questions.map((q) => ({
        question: q.question,
        options: q.options,
        answerIndex: q.answerIndex,
        correctAnswer: q.options[q.answerIndex] ?? "",
        explanation: q.explanation,
      })),
    }
  }

  const isOpenModuleCompleted = openModule
    ? completedTaskIds.includes(openModule.id)
    : false
  const canSubmitOpenQuiz =
    openModule?.type === "quiz"
      ? openModule.questions.length > 0 &&
        openModule.questions.every(
          (_, index) => getQuizState(openModule.id).selected[index] !== undefined
        )
      : false
  const completedModulesCount = modules.filter((module) =>
    completedTaskIds.includes(module.id)
  ).length
  const canGenerateNextSection =
    modules.length > 0 && completedModulesCount === modules.length

  return (
    <section className="mb-10">
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-text">Learning path</h2>
          <p className="text-xs text-muted">
            Click a node, then start module.
          </p>
        </div>
        <div className="text-[11px] text-muted">
          {completedTaskIds.filter((id) =>
            modules.some((module) => module.id === id)
          ).length}
          /{modules.length} complete
        </div>
      </div>

      <div className="relative mx-auto max-w-3xl rounded-2xl border border-border bg-surface/80 px-3 py-6 sm:rounded-3xl sm:px-8 sm:py-8">
        <div className="relative space-y-5 sm:space-y-6">
          {modules.map((module, index) => {
            const unlocked = isUnlocked(index)
            const completed = completedTaskIds.includes(module.id)
            const isCurrent = module.id === currentModuleId
            const isSelected = module.id === selectedModuleId
            const nodeOffsetPattern = [-132, -48, 42, 134, 58, -18]
            const nodeOffset = nodeOffsetPattern[index % nodeOffsetPattern.length]
            const labelOnRight = nodeOffset <= 20
            const isSectionStart = sectionStartIndexes.includes(index)
            const sectionIndex = sectionStartIndexes.indexOf(index)
            const sectionNumber = sectionIndex + 1
            const sectionModuleCount =
              sectionIndex >= 0 ? normalizedSectionCounts[sectionIndex] : 0
            const sectionEndIndex =
              sectionIndex >= 0
                ? sectionStartIndexes[sectionIndex] + sectionModuleCount - 1
                : index
            const sectionCompletedCount =
              sectionIndex >= 0
                ? modules
                    .slice(index, sectionEndIndex + 1)
                    .filter((item) => completedTaskIds.includes(item.id)).length
                : 0

            return (
              <div key={module.id}>
                {isSectionStart && (
                  <div className="mb-4 mt-7 first:mt-0">
                    <div className="flex items-center gap-3">
                      <div className="h-px flex-1 bg-border/80" />
                      <div className="rounded-2xl border border-accent/35 bg-surface px-3 py-2 shadow-sm">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-accent">
                          Section {sectionNumber}
                        </p>
                        <p className="mt-0.5 text-[11px] text-muted">
                          {sectionCompletedCount}/{sectionModuleCount} complete
                        </p>
                      </div>
                      <div className="h-px flex-1 bg-border/80" />
                    </div>
                  </div>
                )}
                <div className="relative sm:hidden">
                  <div className="grid min-h-[108px] grid-cols-[2.75rem,1fr] items-center gap-3">
                  <div className="relative z-20 flex justify-center">
                    <button
                      type="button"
                      disabled={!unlocked}
                      onClick={() => {
                        if (!unlocked) return
                        setSelectedModuleId(module.id)
                      }}
                      className={`relative flex h-12 w-12 items-center justify-center rounded-full border-4 text-xl shadow-md transition ${
                        completed
                          ? "border-accent bg-accent text-white"
                          : isCurrent
                          ? "border-accent-strong bg-accent-strong text-white hover:bg-accent"
                          : unlocked
                          ? "border-border bg-surface text-text hover:border-accent hover:bg-surface-2"
                          : "border-border bg-surface-2 text-muted opacity-55 cursor-not-allowed"
                      }`}
                    >
                      {completed ? (
                        <Check className="h-6 w-6" />
                      ) : module.type === "quiz" ? (
                        <Brain className="h-6 w-6" />
                      ) : (
                        <BookOpen className="h-6 w-6" />
                      )}
                    </button>

                    {isSelected && unlocked && (
                      <motion.div
                        className="absolute bottom-full left-1/2 z-[80] mb-2 w-[min(20rem,calc(100vw-1.5rem))] -translate-x-1/2 rounded-2xl border border-accent/40 bg-surface p-4 text-text shadow-xl"
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        <p className="text-[11px] uppercase tracking-wide text-muted">
                          {module.type === "read" ? "Read module" : "Quiz module"}
                        </p>
                        <p className="mt-1 text-sm font-semibold">{module.title}</p>
                        <p className="mt-1 text-xs text-muted">
                          {module.estimatedMinutes} min · {module.xp} XP
                        </p>
                        <div className="mt-3 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedModuleId(null)}
                            className="rounded-xl border border-border bg-surface-2 px-2.5 py-1.5 text-[11px] font-semibold text-muted hover:bg-surface"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setOpenModuleId(module.id)
                              setSelectedModuleId(null)
                            }}
                            className="flex-1 rounded-xl bg-accent-strong px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-accent"
                          >
                            Start module
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={!unlocked}
                    onClick={() => {
                      if (!unlocked) return
                      setSelectedModuleId(module.id)
                    }}
                    className={`w-full rounded-2xl border px-3 py-3 text-left shadow-sm transition ${
                      completed
                        ? "border-accent/50 bg-accent-soft"
                        : unlocked
                        ? "border-border bg-surface/90 hover:border-accent/50 hover:bg-surface"
                        : "border-border bg-surface/70 opacity-60 cursor-not-allowed"
                    } ${unlocked ? "cursor-pointer" : ""}`}
                  >
                    <p className="line-clamp-2 text-[15px] font-semibold leading-snug text-text">
                      {module.title}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs text-muted">
                      {module.summary}
                    </p>
                    <p className="mt-1.5 text-[11px] text-muted">
                      {module.type === "read" ? "Read" : "Quiz"} · {module.estimatedMinutes} min ·{" "}
                      {module.xp} XP
                    </p>
                  </button>
                </div>
                </div>

                <div className="relative hidden min-h-[132px] sm:block">
                  <div
                    className="absolute top-1/2 z-20 -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `calc(50% + ${nodeOffset}px)` }}
                  >
                    <div
                      className={`relative flex items-center gap-4 ${
                        labelOnRight ? "" : "flex-row-reverse"
                      }`}
                    >
                      <button
                        type="button"
                        disabled={!unlocked}
                        onClick={() => {
                          if (!unlocked) return
                          setSelectedModuleId(module.id)
                        }}
                        className={`relative flex h-20 w-20 items-center justify-center rounded-full border-4 text-xl shadow-md transition ${
                          completed
                            ? "border-accent bg-accent text-white"
                            : isCurrent
                            ? "border-accent-strong bg-accent-strong text-white hover:bg-accent"
                            : unlocked
                            ? "border-border bg-surface text-text hover:border-accent hover:bg-surface-2"
                            : "border-border bg-surface-2 text-muted opacity-55 cursor-not-allowed"
                        }`}
                      >
                        {completed ? (
                          <Check className="h-7 w-7" />
                        ) : module.type === "quiz" ? (
                          <Brain className="h-7 w-7" />
                        ) : (
                          <BookOpen className="h-7 w-7" />
                        )}
                      </button>

                      <button
                        type="button"
                        disabled={!unlocked}
                        onClick={() => {
                          if (!unlocked) return
                          setSelectedModuleId(module.id)
                        }}
                        className={`w-[17.5rem] rounded-2xl border px-4 py-3 text-left shadow-sm transition ${
                          completed
                            ? "border-accent/50 bg-accent-soft"
                            : unlocked
                            ? "border-border bg-surface/90 hover:border-accent/60 hover:bg-surface"
                            : "border-border bg-surface/60 opacity-60 cursor-not-allowed"
                        } ${unlocked ? "cursor-pointer" : ""}`}
                      >
                        <p className="line-clamp-1 text-sm font-semibold text-text">
                          {module.title}
                        </p>
                        <p className="mt-1 text-[11px] text-muted">
                          {module.type === "read" ? "Read module" : "Quiz module"} ·{" "}
                          {module.estimatedMinutes} min · {module.xp} XP
                        </p>
                        <p className="mt-1 line-clamp-2 text-xs text-muted">
                          {module.summary}
                        </p>
                      </button>
                    </div>

                    {isSelected && unlocked && (
                      <motion.div
                        className="absolute bottom-full left-1/2 z-30 mb-3 w-64 -translate-x-1/2 rounded-2xl border border-accent/40 bg-surface p-4 text-text shadow-xl"
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        <p className="text-[11px] uppercase tracking-wide text-muted">
                          {module.type === "read" ? "Read module" : "Quiz module"}
                        </p>
                        <p className="mt-1 text-sm font-semibold">{module.title}</p>
                        <p className="mt-1 text-xs text-muted">
                          {module.estimatedMinutes} min · {module.xp} XP
                        </p>
                        <div className="mt-3 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedModuleId(null)}
                            className="rounded-xl border border-border bg-surface-2 px-2.5 py-1.5 text-[11px] font-semibold text-muted hover:bg-surface"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setOpenModuleId(module.id)
                              setSelectedModuleId(null)
                            }}
                            className="flex-1 rounded-xl bg-accent-strong px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-accent"
                          >
                            Start module
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>

              </div>
            )
          })}

          {onGenerateNextSection && (
            <div className="mt-6 flex justify-center border-t border-border/70 pt-4">
              <button
                type="button"
                onClick={onGenerateNextSection}
                disabled={sectionLoading || !canGenerateNextSection}
                className="inline-flex items-center justify-center rounded-xl bg-accent-strong px-4 py-2 text-xs font-semibold text-white hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
                title={
                  canGenerateNextSection
                    ? "Generate next section"
                    : `Complete all modules first (${completedModulesCount}/${modules.length})`
                }
              >
                {sectionLoading
                  ? "Generating next section..."
                  : "Generate next section"}
              </button>
            </div>
          )}
          {onGenerateNextSection && !canGenerateNextSection && (
            <p className="mt-2 text-center text-[11px] text-muted">
              Complete all modules to unlock the next section ({completedModulesCount}/
              {modules.length}).
            </p>
          )}
        </div>
      </div>

      {openModule && (
        <div className="fixed inset-0 z-50 bg-app-bg/90 backdrop-blur-sm px-4 py-6 sm:px-10">
          <div className="mx-auto flex h-[88vh] max-w-3xl flex-col">
            <div className="mb-4 flex items-center gap-3">
              <div className="h-2 flex-1 rounded-full bg-surface-2">
                <div
                  className="h-2 rounded-full bg-accent transition-all"
                  style={{
                    width: `${Math.round(
                      (completedTaskIds.filter((id) =>
                        modules.some((module) => module.id === id)
                      ).length /
                        Math.max(modules.length, 1)) *
                        100
                    )}%`,
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => setOpenModuleId(null)}
                aria-label="Close module"
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface text-lg font-semibold text-text hover:bg-surface-2"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-1 flex-col rounded-3xl border border-border bg-surface p-5 sm:p-6">
              <div className="flex-1 overflow-y-auto">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted">
                    {openModule.type === "read" ? "Read module" : "Quiz module"}
                  </p>
                  <h3 className="mt-1 text-2xl font-bold text-text">
                    {openModule.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted">{openModule.summary}</p>
                </div>
                <span className="text-xs text-muted">
                  {openModule.estimatedMinutes} min · {openModule.xp} XP
                </span>
              </div>

              {openModule.type === "read" && (
                <div className="space-y-5">
                  <ul className="list-disc space-y-2 pl-5 text-sm text-text">
                    {openModule.content.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>

                  {openModule.keyTakeaways && openModule.keyTakeaways.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                        Key takeaways
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {openModule.keyTakeaways.map((takeaway) => (
                          <span
                            key={takeaway}
                            className="rounded-full border border-accent/40 bg-accent-soft px-3 py-1 text-xs text-accent"
                          >
                            {takeaway}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {openModule.type === "quiz" && (
                <div className="space-y-4">
                  <p className="text-sm text-muted">{openModule.prompt}</p>

                  {openModule.questions.map((question, questionIndex) => {
                    const quizState = getQuizState(openModule.id)
                    const selectedIndex = quizState.selected[questionIndex]
                    const isSubmitted = quizState.submitted

                    return (
                      <div
                        key={`${openModule.id}-q-${questionIndex}`}
                        className="rounded-2xl border border-border bg-surface-2 p-3"
                      >
                        <p className="mb-2 text-sm font-medium text-text">
                          {questionIndex + 1}. {question.question}
                        </p>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {question.options.map((option, optionIndex) => {
                            const isSelected = selectedIndex === optionIndex
                            const optionIsCorrect = optionIndex === question.answerIndex
                            const optionClasses = isSubmitted
                              ? optionIsCorrect
                                ? "border-accent/60 bg-accent-soft text-accent"
                                : isSelected
                                ? "border-danger/70 bg-danger/10 text-danger"
                                : "border-border bg-surface text-muted"
                              : isSelected
                              ? "border-accent/60 bg-accent-soft text-accent"
                              : "border-border bg-surface text-text hover:border-accent/50"

                            return (
                              <button
                                key={`${openModule.id}-q-${questionIndex}-opt-${optionIndex}`}
                                type="button"
                                disabled={completedTaskIds.includes(openModule.id)}
                                onClick={() =>
                                  selectQuizOption(
                                    openModule.id,
                                    questionIndex,
                                    optionIndex
                                  )
                                }
                                className={`rounded-xl border px-3 py-2 text-left text-xs transition ${optionClasses}`}
                              >
                                {option}
                              </button>
                            )
                          })}
                        </div>
                        {isSubmitted && (
                          <p className="mt-2 text-xs text-muted">
                            {question.explanation}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
              </div>

              <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-4">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={lessonLoading}
                    onClick={() =>
                      !lessonLoading &&
                      onOpenLesson(
                        "inDepth",
                        openModule.title,
                        buildInDepthContext(openModule)
                      )
                    }
                    aria-label="Open deep dive"
                    title="Open deep dive"
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface-2 px-3 py-2 text-xs font-semibold text-text hover:bg-surface disabled:opacity-50"
                  >
                    <Search className="h-4 w-4" />
                    Deep dive
                  </button>
                </div>

                <div>
                  {!isOpenModuleCompleted ? (
                    openModule.type === "quiz" ? (
                      <button
                        type="button"
                        disabled={!canSubmitOpenQuiz}
                        onClick={() => submitQuiz(openModule)}
                        aria-label="Check answers"
                        title="Check answers"
                        className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl text-2xl font-bold ${
                          canSubmitOpenQuiz
                            ? "bg-accent-strong text-white hover:bg-accent"
                            : "border border-border bg-surface-2 text-muted cursor-not-allowed"
                        }`}
                      >
                        <Check className="h-7 w-7" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => completeModule(openModule.id)}
                        aria-label="Mark module complete"
                        title="Mark module complete"
                        className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-strong text-2xl font-bold text-white hover:bg-accent"
                      >
                        <Check className="h-7 w-7" />
                      </button>
                    )
                  ) : nextModule ? (
                    <button
                      type="button"
                      disabled={!nextModuleUnlocked}
                      onClick={() => {
                        if (!nextModuleUnlocked) return
                        setOpenModuleId(nextModule.id)
                      }}
                      aria-label="Go to next module"
                      title="Go to next module"
                        className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl text-2xl font-bold ${
                        nextModuleUnlocked
                          ? "bg-accent-strong text-white hover:bg-accent"
                          : "border border-border bg-surface-2 text-muted cursor-not-allowed"
                      }`}
                      >
                        <ArrowRight className="h-7 w-7" />
                      </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setOpenModuleId(null)}
                      aria-label="Module completed"
                      title="Module completed"
                      className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/50 bg-accent-soft text-2xl font-bold text-accent"
                    >
                      <Check className="h-7 w-7" />
                    </button>
                  )}
                </div>
              </div>
              </div>

            </div>
          </div>
      )}
    </section>
  )
}
