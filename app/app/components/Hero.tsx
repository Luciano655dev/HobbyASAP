// app/components/Hero.tsx
"use client"

import { motion, type Variants } from "framer-motion"
import { StreakState } from "../hooks/useSessionsHistory"
import { XpStatsResult } from "../hooks/useXpStats"

interface HeroProps {
  streak: StreakState
  xpStats: XpStatsResult
}

const headerVariants: Variants = {
  hidden: { opacity: 0, y: -12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: "easeOut" },
  },
}

const titleVariants: Variants = {
  hidden: { opacity: 0, y: 10, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.25, ease: "easeOut" },
  },
}

const subtitleVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delay: 0.1, duration: 0.25, ease: "easeOut" },
  },
}

const statsRowVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.15,
      staggerChildren: 0.08,
    },
  },
}

const statCardVariants: Variants = {
  hidden: { opacity: 0, y: 10, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.22, ease: "easeOut" },
  },
}

export default function Hero({ streak, xpStats }: HeroProps) {
  return (
    <motion.header
      className="mb-8 text-center"
      variants={headerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1
        variants={titleVariants}
        className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-3 tracking-tight text-text bg-gradient-to-r from-accent-strong to-accent bg-clip-text text-transparent"
      >
        HobbyASAP
      </motion.h1>

      <motion.p
        variants={subtitleVariants}
        className="text-sm sm:text-base text-muted max-w-2xl mx-auto"
      >
        Type any hobby and let the AI design a custom learning path with
        read-and-quiz modules, plus persistent masterclasses, deep dives, and
        the ability to ask questions as you go.
      </motion.p>

      <motion.div
        className="mt-4 flex flex-wrap items-center justify-center gap-3 text-[11px] sm:text-xs"
        variants={statsRowVariants}
      >
        {/* Streak */}
        <motion.div
          variants={statCardVariants}
          className="inline-flex items-center gap-2 rounded-2xl border border-warning/50 bg-surface/80 px-5 py-2 shadow-sm"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-warning/20 text-sm">
            🔥
          </div>
          <div className="flex flex-col leading-tight">
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-semibold text-warning">
                {streak.current}
              </span>
              <span className="text-[10px] text-warning/80">
                max {streak.longest}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Level + XP (global) */}
        <motion.div
          variants={statCardVariants}
          className="inline-flex items-center gap-3 rounded-2xl border border-accent/50 bg-surface/80 px-5 py-2 shadow-sm"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-strong text-xs font-bold text-white">
            {xpStats.levelNumber}
          </div>
          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-accent">
              {xpStats.levelLabel}
            </p>
            <div className="flex items-center gap-2 text-[10px] text-accent/90">
              <span>
                {xpStats.xpInLevel}/{xpStats.xpForNextLevel} XP
              </span>
              <div className="h-1.5 w-20 rounded-full bg-surface-2">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-accent to-accent-strong"
                  style={{
                    width: `${xpStats.levelProgressPercent}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.header>
  )
}
