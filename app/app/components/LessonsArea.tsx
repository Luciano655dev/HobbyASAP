// app/components/LessonsArea.tsx
import type { RefObject } from "react"
import { Lesson } from "../types"
import buildTaskId from "../helpers/buildTaskId"

interface LessonsAreaProps {
  lessons: Lesson[]
  lessonLoading: boolean
  lessonError: string
  lessonLastTopic: string | null
  completedTaskIds: string[]
  onToggleTask: (id: string) => void
  onRemoveLesson: (index: number) => void
  onOpenLesson: (kind: "masterclass" | "inDepth", topic: string) => void
  lessonsEndRef: RefObject<HTMLDivElement>
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
  return (
    <section className="mb-16 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm sm:text-base font-semibold text-slate-50">
          Masterclasses & deep dives
        </h2>
        {lessonLoading && (
          <p className="text-[11px] text-emerald-300">
            Generating {lessonLastTopic ? `"${lessonLastTopic}"` : "lesson"}…
          </p>
        )}
      </div>
      {lessonError && (
        <p className="text-xs text-red-400 bg-red-950/40 border border-red-800/60 rounded-xl px-3 py-2">
          {lessonError}
        </p>
      )}

      {lessons.length === 0 && !lessonLoading && !lessonError && (
        <p className="text-xs sm:text-sm text-slate-500">
          Click any Masterclass or In depth button in your plan above to add
          detailed course-style lessons here. They will stay on the page so you
          can scroll, re-read, and work through the tasks.
        </p>
      )}

      <div className="space-y-4">
        {lessons.map((lesson, lessonIndex) => {
          const lessonKey = `${lesson.kind}-${lesson.topic}-${lessonIndex}`
          return (
            <div
              key={lessonKey}
              className="bg-slate-900/95 border border-slate-800 rounded-2xl p-5 shadow-md"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-slate-400">
                    {lesson.kind === "masterclass" ? "Masterclass" : "In depth"}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-slate-50">
                    {lesson.title}
                  </h3>
                  <p className="mt-1 text-[11px] text-slate-400">
                    Hobby: {lesson.hobby} · Level: {lesson.level} · Topic:{" "}
                    {lesson.topic}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <p className="text-[11px] text-slate-400">
                    ~{lesson.estimatedTimeMinutes} min
                  </p>
                  <button
                    type="button"
                    onClick={() => onRemoveLesson(lessonIndex)}
                    className="text-[10px] rounded-full border border-red-500/60 px-2 py-0.5 text-red-300 hover:bg-red-500/10"
                  >
                    Remove lesson
                  </button>
                </div>
              </div>

              <p className="text-sm text-slate-200 mb-4">{lesson.summary}</p>

              <div className="space-y-4 mb-4">
                {lesson.sections.map((section, sectionIndex) => (
                  <div
                    key={`${lessonKey}-section-${sectionIndex}`}
                    className="border border-slate-800 rounded-2xl p-3 bg-slate-950/80"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="text-sm font-medium text-slate-100">
                        {section.heading}
                      </h4>
                      <button
                        type="button"
                        onClick={() =>
                          onOpenLesson(
                            "inDepth",
                            `${lesson.topic} – ${section.heading}`
                          )
                        }
                        className="text-[10px] rounded-full border border-slate-500/60 px-2 py-0.5 text-slate-200 hover:bg-slate-800/80"
                      >
                        More depth on this
                      </button>
                    </div>
                    <p className="text-sm text-slate-300 mb-1">
                      {section.body}
                    </p>
                    {section.tips && section.tips.length > 0 && (
                      <div className="mt-1">
                        <p className="text-[11px] font-semibold text-slate-300 mb-0.5">
                          Tips
                        </p>
                        <ul className="list-disc pl-5 text-xs text-slate-400 space-y-1">
                          {section.tips.map((tip) => (
                            <li key={tip}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {section.examples && section.examples.length > 0 && (
                      <div className="mt-2">
                        <p className="text-[11px] font-semibold text-slate-300 mb-0.5">
                          Examples / drills
                        </p>
                        <ul className="list-disc pl-5 text-xs text-slate-400 space-y-1">
                          {section.examples.map((ex) => (
                            <li key={ex}>{ex}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {lesson.practiceIdeas && lesson.practiceIdeas.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-emerald-200 mb-2">
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
                        <li
                          key={id}
                          className={`flex items-start gap-3 rounded-2xl px-3 py-2 border text-xs sm:text-sm ${
                            checked
                              ? "border-emerald-400/60 bg-emerald-500/10"
                              : "border-slate-700 bg-slate-950/70 hover:border-emerald-400/60"
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="mt-1 h-4 w-4 rounded border-slate-400 bg-slate-950 accent-emerald-400"
                            checked={checked}
                            onChange={() => onToggleTask(id)}
                          />
                          <p
                            className={
                              checked
                                ? "text-slate-400 line-through"
                                : "text-slate-100"
                            }
                          >
                            {idea}
                          </p>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}

              {lesson.recommendedResources &&
                lesson.recommendedResources.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-100 mb-1.5">
                      Recommended resources
                    </h4>
                    <ul className="space-y-1 text-xs text-slate-300">
                      {lesson.recommendedResources.map((r) => (
                        <li key={r.url}>
                          <span className="font-semibold">{r.title}</span>{" "}
                          <span className="text-slate-500">({r.type})</span>
                          {": "}
                          <a
                            href={r.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-emerald-300 hover:underline break-all"
                          >
                            {r.url}
                          </a>
                          {r.note && (
                            <span className="text-slate-500"> – {r.note}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>
          )
        })}
        {/* Scroll target for the bottom */}
        <div ref={lessonsEndRef} />
      </div>
    </section>
  )
}
