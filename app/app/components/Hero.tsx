// app/components/Hero.tsx
import { StreakState } from "../hooks/useSessionsHistory"
import { XpStatsResult } from "../hooks/useXpStats"

interface HeroProps {
  streak: StreakState
  xpStats: XpStatsResult
}

export default function Hero({ streak, xpStats }: HeroProps) {
  return (
    <header className="mb-8 text-center">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-3 tracking-tight text-slate-50 bg-gradient-to-r from-lime-300 to-sky-300 bg-clip-text text-transparent">
        HobbyASAP
      </h1>
      <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
        Type any hobby and let the AI design a custom layout: intros, small
        tasks, checklists, roadmaps, resources, plus persistent masterclasses,
        deep dives and the possibility of asking questions.
      </p>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-[11px] sm:text-xs">
        {/* Streak */}
        <div className="inline-flex items-center gap-2 rounded-2xl border border-orange-400/70 bg-slate-900/80 px-5 py-2 shadow-sm">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-400/20 text-sm">
            🔥
          </div>
          <div className="flex flex-col leading-tight">
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-semibold text-orange-100">
                {streak.current}
              </span>
              <span className="text-[10px] text-orange-200/80">
                max {streak.longest}
              </span>
            </div>
          </div>
        </div>

        {/* Level + XP (global) */}
        <div className="inline-flex items-center gap-3 rounded-2xl border border-emerald-400/70 bg-slate-900/80 px-5 py-2 shadow-sm">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-300 to-sky-300 text-xs font-bold text-slate-900">
            {xpStats.levelNumber}
          </div>
          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-emerald-100">
              {xpStats.levelLabel}
            </p>
            <div className="flex items-center gap-2 text-[10px] text-emerald-100/90">
              <span>
                {xpStats.xpInLevel}/{xpStats.xpForNextLevel} XP
              </span>
              <div className="h-1.5 w-20 rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-300 to-sky-300"
                  style={{
                    width: `${xpStats.levelProgressPercent}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
