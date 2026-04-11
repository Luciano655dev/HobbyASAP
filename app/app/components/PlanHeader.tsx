// app/components/PlanHeader.tsx
"use client"

import { motion, type Variants } from "framer-motion"
import { HobbyPlan } from "../types"

interface PlanHeaderProps {
  plan: HobbyPlan
  themeFrom: string
  themeTo: string
  progress: number
  dailySessionCompleted: boolean
  sectionsGenerated: number
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.25, ease: "easeOut" },
  },
}

export default function PlanHeader({
  plan,
  themeFrom,
  themeTo,
  progress,
  dailySessionCompleted,
  sectionsGenerated,
}: PlanHeaderProps) {
  const icon = plan.icon

  return (
    <motion.div
      className="rounded-2xl border border-border p-4 sm:p-5 shadow-sm"
      style={{
        backgroundImage: `
          linear-gradient(
            to bottom right, 
            color-mix(in oklab, ${themeFrom} 5%, var(--surface)),
            color-mix(in oklab, ${themeTo} 5%, var(--surface))
          ),
          linear-gradient(to bottom right, var(--surface), var(--surface))
        `,
      }}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.35 }}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-border bg-surface-2 text-2xl">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-semibold text-text sm:text-xl">
            {plan.hobby}
          </h2>
          <p className="mt-0.5 text-xs text-muted sm:text-sm">{plan.level}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
            <span className="rounded-full border border-border bg-surface px-2 py-1 text-muted">
              {plan.modules.length} modules
            </span>
            <span className="rounded-full border border-border bg-surface px-2 py-1 text-muted">
              Section {sectionsGenerated}
            </span>
            {dailySessionCompleted ? (
              <span className="rounded-full border border-accent/40 bg-accent-soft px-2 py-1 text-accent">
                Advanced today
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between text-xs text-muted">
          <span>Progress</span>
          <span className="font-semibold text-text">{progress}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
          <motion.div
            className="h-full bg-accent"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          />
        </div>
      </div>

    </motion.div>
  )
}
