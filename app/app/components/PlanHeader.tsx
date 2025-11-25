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

const leftVariants: Variants = {
  hidden: { opacity: 0, x: -12 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.25, ease: "easeOut" },
  },
}

const rightVariants: Variants = {
  hidden: { opacity: 0, x: 12 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.25, ease: "easeOut", delay: 0.05 },
  },
}

const iconVariants: Variants = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.2, ease: "easeOut" },
  },
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
    <motion.div
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
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.35 }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Left: icon + title */}
        <motion.div
          className="flex items-center gap-3 sm:gap-4"
          variants={leftVariants}
        >
          <motion.div
            className="h-14 w-14 rounded-3xl bg-slate-950/70 flex items-center justify-center text-3xl shadow-sm"
            variants={iconVariants}
          >
            {icon}
          </motion.div>
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
        </motion.div>

        {/* Right: progress */}
        <motion.div
          className="flex flex-col items-end gap-2 w-full sm:w-auto"
          variants={rightVariants}
        >
          <div className="w-full sm:w-60">
            <div className="flex items-center justify-between text-[11px] text-slate-100 mb-1">
              <span>Plan progress</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-900/70 overflow-hidden border border-slate-900/80">
              <motion.div
                className="h-full bg-emerald-400"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              />
            </div>
          </div>
          {dailySessionCompleted && (
            <p className="text-[11px] text-emerald-200">
              ✅ Today’s small tasks completed!
            </p>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}
