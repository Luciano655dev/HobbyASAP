// app/components/PlanHeader.tsx
import { HobbyPlan } from "../types"

interface PlanHeaderProps {
  plan: HobbyPlan
  themeFrom: string
  themeTo: string
  progress: number
  dailySessionCompleted: boolean
}

export default function PlanHeader({
  plan,
  themeFrom,
  themeTo,
  progress,
  dailySessionCompleted,
}: PlanHeaderProps) {
  const icon = plan.icon

  return (
    <div
      className="rounded-2xl border border-slate-800 p-5 sm:p-6 flex flex-col gap-4 shadow-lg shadow-slate-900/80"
      style={{
        backgroundImage: `
          linear-gradient(
            to bottom right, 
            rgba(0,0,0,0.70), 
            rgba(0,0,0,0.85)
          ),
          linear-gradient(
            to bottom right, 
            ${themeFrom}, 
            ${themeTo}
          )
        `,
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="h-14 w-14 rounded-3xl bg-slate-950/70 flex items-center justify-center text-3xl shadow-sm">
            {icon}
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-50">
              {plan.hobby} ·{" "}
              <span className="text-emerald-200">{plan.level}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 mt-1">
              This layout was fully designed by the AI for this hobby and level.
              Click Masterclass or In depth on any task, phase, or week to stack
              deeper lessons below.
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
          <div className="w-full sm:w-60">
            <div className="flex items-center justify-between text-[11px] text-slate-100 mb-1">
              <span>Plan progress</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-900/70 overflow-hidden border border-slate-900/80">
              <div
                className="h-full bg-emerald-400"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          {dailySessionCompleted && (
            <p className="text-[11px] text-emerald-200">
              ✅ Today’s small tasks completed!
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
