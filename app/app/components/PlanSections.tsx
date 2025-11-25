// app/components/PlanSections.tsx
import {
  HobbyPlan,
  PlanSection,
  IntroSection,
  RoadmapSection,
  WeeklySection,
  ChecklistSection,
  ResourcesSection,
  GearSection,
  TipsSection,
  AdvancedSection,
  TodaySection,
} from "../types"
import buildTaskId from "../helpers/buildTaskId"

interface PlanSectionsProps {
  plan: HobbyPlan
  completedTaskIds: string[]
  onToggleTask: (id: string) => void
  onOpenLesson: (kind: "masterclass" | "inDepth", topic: string) => void
}

const primaryButtonClasses =
  "inline-flex items-center justify-center rounded-xl bg-emerald-500/90 px-3 py-1.5 text-[11px] font-semibold text-slate-950 shadow-sm shadow-emerald-500/40 hover:bg-emerald-400 hover:shadow-md active:translate-y-[1px] transition"
const secondaryButtonClasses =
  "inline-flex items-center justify-center rounded-xl bg-slate-800/90 px-3 py-1.5 text-[11px] font-semibold text-slate-50 border border-slate-600 shadow-sm hover:bg-slate-700 hover:shadow-md active:translate-y-[1px] transition"

export default function PlanSections({
  plan,
  completedTaskIds,
  onToggleTask,
  onOpenLesson,
}: PlanSectionsProps) {
  function renderSection(section: PlanSection) {
    switch (section.kind) {
      case "intro": {
        const s = section as IntroSection
        return (
          <div
            key={s.id}
            className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-md"
          >
            <h3 className="text-base font-semibold mb-2 text-slate-50">
              {s.title}
            </h3>
            {s.description && (
              <p className="text-xs text-slate-400 mb-2">{s.description}</p>
            )}
            <p className="text-sm text-slate-100 mb-3">{s.body}</p>
            {s.bulletPoints && s.bulletPoints.length > 0 && (
              <ul className="list-disc list-inside text-sm text-slate-200 space-y-1">
                {s.bulletPoints.map((bp, i) => (
                  <li key={i}>{bp}</li>
                ))}
              </ul>
            )}
          </div>
        )
      }

      case "roadmap": {
        const s = section as RoadmapSection
        return (
          <div
            key={s.id}
            className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-md"
          >
            <h3 className="text-base font-semibold mb-2 text-slate-50">
              {s.title}
            </h3>
            {s.description && (
              <p className="text-xs text-slate-400 mb-3">{s.description}</p>
            )}

            {s.milestones?.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-slate-300 mb-2">
                  Big milestones:
                </p>
                <div className="space-y-2">
                  {s.milestones.map((m, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <div className="h-6 w-6 rounded-full bg-emerald-500/20 border border-emerald-400/60 flex items-center justify-center text-xs font-bold text-emerald-200">
                        {i + 1}
                      </div>
                      <span className="text-slate-100">{m}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {s.phases && s.phases.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-300 mb-2">
                  Phases:
                </p>
                <div className="space-y-3">
                  {s.phases.map((p, i) => (
                    <div
                      key={i}
                      className="border border-slate-800 rounded-2xl p-3 bg-slate-950/70"
                    >
                      <p className="text-sm font-semibold text-slate-50">
                        {p.name}
                      </p>
                      <p className="text-xs text-slate-300 mb-1">
                        Goal: {p.goal}
                      </p>
                      {p.focus?.length > 0 && (
                        <ul className="list-disc list-inside text-xs text-slate-200 space-y-1 mb-2">
                          {p.focus.map((f, idx) => (
                            <li key={idx}>{f}</li>
                          ))}
                        </ul>
                      )}
                      {p.focus && p.focus.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              onOpenLesson("masterclass", p.focus.join(", "))
                            }
                            className={primaryButtonClasses}
                          >
                            Phase masterclass
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              onOpenLesson("inDepth", p.focus.join(", "))
                            }
                            className={secondaryButtonClasses}
                          >
                            Phase in depth
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      }

      case "today": {
        const s = section as TodaySection
        return (
          <div
            key={s.id}
            className="bg-slate-900/90 border border-emerald-500/40 rounded-2xl p-5 shadow-md shadow-emerald-500/10"
          >
            <h3 className="text-base font-semibold mb-1.5 text-emerald-300 flex items-center gap-1.5">
              <span>{s.title}</span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-200 px-2 py-0.5 rounded-full border border-emerald-400/40">
                Daily session
              </span>
            </h3>
            {s.description && (
              <p className="text-[11px] text-slate-400 mb-3">{s.description}</p>
            )}
            <ul className="space-y-3 text-sm">
              {s.items.map((item, index) => {
                const id = buildTaskId(s.id, index, item.label)
                const checked = completedTaskIds.includes(id)
                return (
                  <li
                    key={id}
                    className={`flex flex-col sm:flex-row sm:items-start gap-3 rounded-2xl px-3 py-2.5 border transition-colors ${
                      checked
                        ? "border-emerald-400/60 bg-emerald-500/10"
                        : "border-slate-700 bg-slate-950/70 hover:border-emerald-400/60"
                    }`}
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 rounded border-slate-400 bg-slate-950 accent-emerald-400"
                        checked={checked}
                        onChange={() => onToggleTask(id)}
                      />
                      <div className="flex-1">
                        <p
                          className={
                            checked
                              ? "text-slate-400 line-through text-sm"
                              : "text-slate-100 text-sm"
                          }
                        >
                          {item.label}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          {item.minutes && (
                            <>
                              ~{item.minutes} min{" "}
                              <span className="mx-1 text-slate-600">•</span>
                            </>
                          )}
                          {item.xp && (
                            <>
                              XP:{" "}
                              <span className="font-semibold text-emerald-300">
                                +{item.xp}
                              </span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 pb-1 sm:pb-0">
                      <button
                        type="button"
                        onClick={() => onOpenLesson("inDepth", item.label)}
                        className={secondaryButtonClasses}
                      >
                        In depth
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        )
      }

      case "checklist": {
        const s = section as ChecklistSection
        return (
          <div
            key={s.id}
            className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-md"
          >
            <h3 className="text-base font-semibold mb-1.5 text-slate-50">
              {s.title}
            </h3>
            {s.description && (
              <p className="text-[11px] text-slate-400 mb-3">{s.description}</p>
            )}
            <ul className="space-y-3 text-sm max-h-80 overflow-auto pr-1">
              {s.items.map((item, index) => {
                const id = buildTaskId(s.id, index, item.label)
                const checked = completedTaskIds.includes(id)
                return (
                  <li
                    key={id}
                    className={`flex flex-col sm:flex-row sm:items-start gap-3 rounded-2xl px-3 py-2.5 border transition-colors ${
                      checked
                        ? "border-slate-700 bg-slate-950/70"
                        : "border-slate-800 bg-slate-950/80 hover:border-emerald-400/60"
                    }`}
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 rounded border-slate-400 bg-slate-950 accent-emerald-400"
                        checked={checked}
                        onChange={() => onToggleTask(id)}
                      />
                      <div className="flex-1">
                        <p
                          className={
                            checked
                              ? "text-slate-500 line-through text-sm"
                              : "text-slate-100 text-sm"
                          }
                        >
                          {item.label}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          {item.minutes && (
                            <>
                              ~{item.minutes} min{" "}
                              <span className="mx-1 text-slate-600">•</span>
                            </>
                          )}
                          {item.xp && (
                            <>
                              XP:{" "}
                              <span className="font-semibold text-emerald-300">
                                +{item.xp}
                              </span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 pb-1 sm:pb-0">
                      <button
                        type="button"
                        onClick={() => onOpenLesson("inDepth", item.label)}
                        className={secondaryButtonClasses}
                      >
                        In depth
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        )
      }

      case "weekly": {
        const s = section as WeeklySection
        return (
          <div
            key={s.id}
            className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-md"
          >
            <h3 className="text-base font-semibold mb-2 text-slate-50">
              {s.title}
            </h3>
            {s.description && (
              <p className="text-xs text-slate-400 mb-3">{s.description}</p>
            )}
            <div className="grid gap-3 md:grid-cols-2">
              {s.weeks.map((w, i) => (
                <div
                  key={i}
                  className="border border-slate-800 rounded-2xl p-4 bg-slate-950/70"
                >
                  <p className="text-xs font-semibold text-emerald-300 mb-1">
                    Week {w.week}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-100 mb-2">
                    <span className="font-semibold">Focus:</span> {w.focus}
                  </p>
                  {w.practice?.length > 0 && (
                    <ul className="list-disc list-inside text-xs sm:text-sm text-slate-200 space-y-1 mb-2">
                      {w.practice.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  )}
                  <p className="text-xs sm:text-sm text-slate-300 mb-2">
                    <span className="font-semibold">Goal:</span> {w.goal}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenLesson("masterclass", w.focus)}
                      className={primaryButtonClasses}
                    >
                      Week masterclass
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenLesson("inDepth", w.focus)}
                      className={secondaryButtonClasses}
                    >
                      Week in depth
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      }

      case "resources": {
        const s = section as ResourcesSection
        return (
          <div
            key={s.id}
            className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-md"
          >
            <h3 className="text-base font-semibold mb-2 text-slate-50">
              {s.title}
            </h3>
            {s.description && (
              <p className="text-xs text-slate-400 mb-3">{s.description}</p>
            )}
            <ul className="space-y-3 text-sm">
              {s.resources.map((r, i) => (
                <li
                  key={i}
                  className="border-b border-slate-800 pb-2 last:border-none last:pb-0"
                >
                  <p className="font-medium text-slate-50">
                    {r.title}{" "}
                    <span className="text-[11px] text-slate-400">
                      ({r.type})
                    </span>
                  </p>
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-emerald-300 hover:underline break-all"
                  >
                    {r.url}
                  </a>
                  {r.note && (
                    <p className="text-[12px] text-slate-300 mt-0.5">
                      {r.note}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )
      }

      case "gear": {
        const s = section as GearSection
        return (
          <div
            key={s.id}
            className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-md"
          >
            <h3 className="text-base font-semibold mb-2 text-slate-50">
              {s.title}
            </h3>
            {s.description && (
              <p className="text-xs text-slate-400 mb-3">{s.description}</p>
            )}
            <div className="grid gap-4 md:grid-cols-3 text-xs sm:text-sm">
              <div>
                <p className="font-semibold text-slate-50 mb-1.5">
                  Starter setup
                </p>
                <ul className="list-disc list-inside text-slate-200 space-y-1">
                  {s.starter.map((g, i) => (
                    <li key={i}>{g}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-semibold text-slate-50 mb-1.5">
                  Nice to have later
                </p>
                <ul className="list-disc list-inside text-slate-200 space-y-1">
                  {s.niceToHave.map((g, i) => (
                    <li key={i}>{g}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-semibold text-slate-50 mb-1.5">
                  Money saving tips
                </p>
                <ul className="list-disc list-inside text-slate-200 space-y-1">
                  {s.moneySavingTips.map((g, i) => (
                    <li key={i}>{g}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )
      }

      case "tips": {
        const s = section as TipsSection
        return (
          <div
            key={s.id}
            className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-md"
          >
            <h3 className="text-base font-semibold mb-2 text-slate-50">
              {s.title}
            </h3>
            {s.description && (
              <p className="text-xs text-slate-400 mb-3">{s.description}</p>
            )}
            <ul className="space-y-3 text-sm">
              {s.mistakes.map((m, i) => (
                <li
                  key={i}
                  className="border-b border-slate-800 pb-2 last:border-none last:pb-0"
                >
                  <p className="font-medium text-slate-50">{m.mistake}</p>
                  <p className="text-[12px] text-slate-300 mt-0.5">
                    <span className="font-semibold">Fix:</span> {m.fix}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )
      }

      case "advanced": {
        const s = section as AdvancedSection
        return (
          <div
            key={s.id}
            className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-md"
          >
            <h3 className="text-base font-semibold mb-2 text-slate-50">
              {s.title}
            </h3>
            {s.description && (
              <p className="text-xs text-slate-400 mb-3">{s.description}</p>
            )}
            <div className="grid gap-3 text-xs sm:text-sm md:grid-cols-2">
              <div>
                <p className="font-semibold text-slate-50 mb-1.5">
                  Possible directions
                </p>
                <ul className="list-disc list-inside text-slate-200 space-y-1">
                  {s.directions.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-semibold text-slate-50 mb-1.5">
                  Long term goals
                </p>
                <ul className="list-disc list-inside text-slate-200 space-y-1">
                  {s.longTermGoals.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )
      }

      default:
        return null
    }
  }

  return (
    <section className="space-y-5 mb-10">
      {plan.sections.map((section) => renderSection(section))}
    </section>
  )
}
