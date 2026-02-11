"use client"

import { useState, type RefObject } from "react"
import { motion, type Variants } from "framer-motion"
import { Lesson } from "../types"
import buildTaskId from "../helpers/buildTaskId"
import buildLessonSectionTaskId from "../helpers/buildLessonSectionTaskId"

interface LessonsAreaProps {
  lessons: Lesson[]
  lessonLoading: boolean
  lessonError: string
  lessonLastTopic: string | null
  completedTaskIds: string[]
  onToggleTask: (id: string) => void
  onRemoveLesson: (index: number) => void
  onOpenLesson: (kind: "inDepth", topic: string) => void
  lessonsEndRef: RefObject<HTMLDivElement | null>
}

// whole lesson card
const lessonCardVariants: Variants = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.25,
      ease: "easeOut",
    },
  },
}

// inner sections list
const sectionsListVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
    },
  },
}

// each inner section card
const sectionCardVariants: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: "easeOut" },
  },
}

// practice tasks list
const practiceListVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
    },
  },
}

const practiceItemVariants: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: "easeOut" },
  },
}

export default function LessonsArea({
  lessons,
  lessonLoading,
  lessonError,
  lessonLastTopic,
  completedTaskIds,
  onToggleTask,
  onRemoveLesson,
  onOpenLesson,
  lessonsEndRef,
}: LessonsAreaProps) {
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({})

  function toggleModuleOpen(id: string) {
    setOpenModules((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  function openModule(id: string) {
    setOpenModules((prev) => ({ ...prev, [id]: true }))
  }

  return (
    <section className="mb-16 space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-sm sm:text-base font-semibold text-text">
          Deep dives
        </h2>
        {lessonLoading && (
          <p className="text-[11px] text-accent">
            Generating {lessonLastTopic ? `"${lessonLastTopic}"` : "lesson"}…
          </p>
        )}
      </div>
      {lessonError && (
        <p className="text-xs text-danger bg-danger/10 border border-danger/40 rounded-xl px-3 py-2">
          {lessonError}
        </p>
      )}

      {lessons.length === 0 && !lessonLoading && !lessonError && (
        <p className="text-xs sm:text-sm text-muted">
          Click any In depth button in your path above to add
          detailed course-style lessons here. They will stay on the page so you
          can scroll, re-read, and work through the tasks.
        </p>
      )}

      <div className="space-y-4">
        {lessons.map((lesson, lessonIndex) => {
          const lessonKey = `${lesson.kind}-${lesson.topic}-${lessonIndex}`
          const moduleIds = lesson.sections.map((section, sectionIndex) =>
            buildLessonSectionTaskId(lessonIndex, sectionIndex, section.heading)
          )
          const completedModules = moduleIds.filter((id) =>
            completedTaskIds.includes(id)
          ).length
          const nextIncompleteIndex = moduleIds.findIndex(
            (id) => !completedTaskIds.includes(id)
          )
          const defaultOpenIndex =
            nextIncompleteIndex === -1 ? 0 : nextIncompleteIndex
          const hasCustomOpenState = moduleIds.some((id) =>
            Object.prototype.hasOwnProperty.call(openModules, id)
          )
          const moduleProgressPercent =
            moduleIds.length > 0
              ? Math.round((completedModules / moduleIds.length) * 100)
              : 0
          const nextModuleId =
            nextIncompleteIndex === -1 ? null : moduleIds[nextIncompleteIndex]

          return (
            <motion.div
              key={lessonKey}
              className="bg-surface/95 border border-border rounded-3xl p-4 sm:p-5 shadow-md"
              variants={lessonCardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.35 }} // only when this lesson scrolls into view
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-3">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-muted">
                    In depth
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-text">
                    {lesson.title}
                  </h3>
                  <p className="mt-1 text-[11px] text-muted">
                    Hobby: {lesson.hobby} · Level: {lesson.level} · Topic:{" "}
                    {lesson.topic}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-2 text-[11px] text-muted sm:flex-col sm:items-end sm:justify-start">
                  <p>~{lesson.estimatedTimeMinutes} min</p>
                  <button
                    type="button"
                    onClick={() => onRemoveLesson(lessonIndex)}
                    className="text-[10px] rounded-full border border-danger/60 px-2.5 py-1 text-danger hover:bg-danger/10"
                  >
                    Remove lesson
                  </button>
                </div>
              </div>

              <p className="text-sm text-muted mb-4">{lesson.summary}</p>

              {moduleIds.length > 0 && (
                <div className="mb-4 rounded-2xl border border-border bg-surface/60 p-3">
                  <div className="flex items-center justify-between text-[11px] text-muted">
                    <span>Modules</span>
                    <span>
                      {completedModules}/{moduleIds.length} complete
                    </span>
                  </div>
                  <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                    <div className="h-1.5 flex-1 rounded-full bg-surface-2">
                      <div
                        className="h-1.5 rounded-full bg-accent transition-all"
                        style={{ width: `${moduleProgressPercent}%` }}
                      />
                    </div>
                    {nextModuleId ? (
                      <button
                        type="button"
                        onClick={() => openModule(nextModuleId)}
                        className="w-full sm:w-auto rounded-full border border-accent/50 px-3 py-1.5 text-[10px] font-semibold text-accent hover:bg-accent/10"
                      >
                        Continue module
                      </button>
                    ) : (
                      <span className="text-[10px] text-accent">
                        All modules complete
                      </span>
                    )}
                  </div>
                </div>
              )}

              <motion.div
                className="space-y-4 mb-4"
                variants={sectionsListVariants}
              >
                {lesson.sections.map((section, sectionIndex) => {
                  const moduleId = moduleIds[sectionIndex]
                  const isCompleted = completedTaskIds.includes(moduleId)
                  const isOpen =
                    openModules[moduleId] ??
                    (!hasCustomOpenState &&
                      sectionIndex === defaultOpenIndex)
                  const contentId = `${lessonKey}-module-${sectionIndex}`

                  return (
                    <motion.div
                      key={`${lessonKey}-section-${sectionIndex}`}
                      className={`rounded-2xl border p-3 ${
                        isCompleted
                          ? "border-accent/40 bg-accent-soft"
                          : "border-border bg-surface/80"
                      }`}
                      variants={sectionCardVariants}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <button
                          type="button"
                          onClick={() => toggleModuleOpen(moduleId)}
                          aria-expanded={isOpen}
                          aria-controls={contentId}
                          className="group flex-1 text-left"
                        >
                          <div className="flex items-center gap-2 text-[11px] text-muted">
                            <span
                              className={`h-2.5 w-2.5 rounded-full ${
                                isCompleted
                                  ? "bg-accent"
                                  : "bg-muted"
                              }`}
                            />
                            <span className="uppercase tracking-wide">
                              Module {sectionIndex + 1}
                            </span>
                            {isCompleted && (
                              <span className="rounded-full border border-accent/40 px-1.5 py-0.5 text-[10px] text-accent">
                                Completed
                              </span>
                            )}
                          </div>
                          <h4 className="mt-1 text-sm font-medium text-text group-hover:text-accent transition-colors">
                            {section.heading}
                          </h4>
                          <p className="mt-0.5 text-[11px] text-muted">
                            {isOpen ? "Hide details" : "Open module"}
                          </p>
                        </button>
                        <label className="flex items-center gap-2 rounded-full border border-border bg-surface/70 px-3 py-1 text-[11px] text-muted sm:border-transparent sm:bg-transparent sm:px-0 sm:py-0">
                          <input
                            type="checkbox"
                            className="mt-0.5 h-5 w-5 sm:h-4 sm:w-4 rounded border-border bg-surface accent-accent"
                            checked={isCompleted}
                            onChange={() => onToggleTask(moduleId)}
                          />
                          <span
                            className={
                              isCompleted ? "text-accent" : "text-muted"
                            }
                          >
                            {isCompleted ? "Completed" : "Mark complete"}
                          </span>
                        </label>
                      </div>

                      {isOpen && (
                        <div
                          id={contentId}
                          className="mt-3 border-t border-border pt-3"
                        >
                          <p className="text-sm text-muted mb-1">
                            {section.body}
                          </p>
                          {section.tips && section.tips.length > 0 && (
                            <div className="mt-1">
                              <p className="text-[11px] font-semibold text-muted mb-0.5">
                                Tips
                              </p>
                              <ul className="list-disc pl-5 text-xs text-muted space-y-1">
                                {section.tips.map((tip) => (
                                  <li key={tip}>{tip}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {section.examples && section.examples.length > 0 && (
                            <div className="mt-2">
                              <p className="text-[11px] font-semibold text-muted mb-0.5">
                                Examples / drills
                              </p>
                              <ul className="list-disc pl-5 text-xs text-muted space-y-1">
                                {section.examples.map((ex) => (
                                  <li key={ex}>{ex}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          <div className="mt-3">
                            <button
                              type="button"
                              disabled={lessonLoading}
                              onClick={() =>
                                !lessonLoading &&
                                onOpenLesson(
                                  "inDepth",
                                  `${lesson.topic} - ${section.heading}`
                                )
                              }
                              className={`inline-flex items-center justify-center rounded-xl bg-surface-2 px-3 py-1.5 text-[11px] font-semibold text-text border border-border shadow-sm hover:bg-surface hover:shadow-md active:translate-y-[1px] transition ${
                                lessonLoading
                                  ? "opacity-50 cursor-not-allowed active:translate-y-0 hover:bg-surface-2 hover:shadow-sm"
                                  : ""
                              }`}
                            >
                              More depth on this
                            </button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )
                })}
              </motion.div>

              {lesson.practiceIdeas && lesson.practiceIdeas.length > 0 && (
                <motion.div
                  className="mb-4"
                  variants={practiceListVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.3 }}
                >
                  <h4 className="text-sm font-medium text-accent mb-2">
                    Practice tasks for this lesson
                  </h4>
                  <ul className="space-y-2 text-sm">
                    {lesson.practiceIdeas.map((idea, practiceIndex) => {
                      const id = buildTaskId(
                        `lesson-${lessonIndex}`,
                        practiceIndex,
                        idea
                      )
                      const checked = completedTaskIds.includes(id)
                      return (
                        <motion.li
                          key={id}
                          className={`flex items-start gap-3 rounded-2xl px-3 py-2 border text-xs sm:text-sm ${
                            checked
                              ? "border-accent/60 bg-accent-soft"
                              : "border-border bg-surface/70 hover:border-accent/60"
                          }`}
                          variants={practiceItemVariants}
                        >
                          <input
                            type="checkbox"
                            className="mt-1 h-5 w-5 sm:h-4 sm:w-4 rounded border-border bg-surface accent-accent"
                            checked={checked}
                            onChange={() => onToggleTask(id)}
                          />
                          <p
                            className={
                              checked
                                ? "text-muted line-through"
                                : "text-text"
                            }
                          >
                            {idea}
                          </p>
                        </motion.li>
                      )
                    })}
                  </ul>
                </motion.div>
              )}

              {lesson.recommendedResources &&
                lesson.recommendedResources.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-text mb-1.5">
                      Recommended resources
                    </h4>
                    <ul className="space-y-1 text-xs text-muted">
                      {lesson.recommendedResources.map((r) => (
                        <li key={r.url}>
                          <span className="font-semibold">{r.title}</span>{" "}
                          <span className="text-muted">({r.type})</span>
                          {": "}
                          <a
                            href={r.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-accent hover:underline break-all"
                          >
                            {r.url}
                          </a>
                          {r.note && (
                            <span className="text-muted"> - {r.note}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
            </motion.div>
          )
        })}
        {/* Scroll target for the bottom */}
        <div ref={lessonsEndRef} />
      </div>
    </section>
  )
}
