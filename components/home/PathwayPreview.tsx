"use client"

import Link from "next/link"
import { motion, type Variants } from "framer-motion"

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
}

const modules = [
  {
    title: "Module 1: Posture + simple warmup",
    type: "Read",
    duration: "8 min",
    xp: "+8 XP",
    status: "done",
  },
  {
    title: "Quick quiz: strings & finger names",
    type: "Quiz",
    duration: "3 min",
    xp: "+6 XP",
    status: "done",
  },
  {
    title: "Module 2: First chord shapes",
    type: "Read",
    duration: "12 min",
    xp: "+10 XP",
    status: "current",
  },
  {
    title: "Quick quiz: chord names",
    type: "Quiz",
    duration: "4 min",
    xp: "+6 XP",
    status: "locked",
  },
  {
    title: "Module 3: Clean chord changes",
    type: "Read",
    duration: "15 min",
    xp: "+12 XP",
    status: "locked",
  },
] as const

export default function PathwayPreview() {
  return (
    <motion.section
      className="mx-auto max-w-6xl px-4 pb-16"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.35 }}
      variants={sectionVariants}
    >
      <div className="relative overflow-hidden rounded-3xl border border-border bg-surface/90 p-5 sm:p-8">
        <div className="pointer-events-none absolute -right-24 top-0 h-48 w-48 rounded-full bg-accent/15 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 bottom-0 h-40 w-40 rounded-full bg-accent/10 blur-3xl" />

        <div className="grid gap-6 lg:grid-cols-[1fr,1.2fr] lg:items-center">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent-soft px-3 py-1 text-[11px] font-semibold text-accent">
              New path view
            </span>
            <h2 className="text-2xl font-semibold sm:text-3xl">
              Your hobby path, laid out like a game
            </h2>
            <p className="text-sm text-muted sm:text-base">
              Every module is a bite-sized step. Read the lesson, take a quick
              quiz, and unlock the next module. You can always revisit completed
              steps when you want a refresher.
            </p>

            <ul className="space-y-2 text-sm text-text">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-accent">✓</span>
                <span>Reading modules that teach one concept at a time.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-accent">✓</span>
                <span>Fast quizzes that lock in the key ideas.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-accent">✓</span>
                <span>Optional masterclasses for deeper practice.</span>
              </li>
            </ul>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/app"
                className="inline-flex items-center justify-center rounded-full bg-accent-strong px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent/40 hover:bg-accent"
              >
                Build my path
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex items-center justify-center rounded-full border border-border bg-surface/70 px-4 py-2 text-xs font-medium text-text hover:border-accent/50 hover:text-accent"
              >
                See the flow
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-surface/95 p-4 sm:p-5">
            <div className="flex items-center justify-between text-[11px] text-muted">
              <span className="uppercase tracking-wide">Guitar path</span>
              <span className="text-accent">Level 1</span>
            </div>

            <div className="relative mt-4 pl-6">
              <div className="absolute left-[10px] top-2 bottom-2 w-px bg-gradient-to-b from-accent/60 via-border to-border" />

              <div className="space-y-4">
                {modules.map((module) => (
                  <div
                    key={module.title}
                    className="relative flex items-start gap-4"
                  >
                    <div
                      className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${
                        module.status === "done"
                          ? "bg-accent-strong text-white shadow-md shadow-accent/40"
                          : module.status === "current"
                            ? "border border-accent bg-accent-soft text-accent"
                            : "border border-border bg-surface-2 text-muted"
                      }`}
                    >
                      {module.type === "Read" ? "📘" : "❓"}
                    </div>

                    <div
                      className={`flex-1 rounded-2xl border p-3 text-xs ${
                        module.status === "current"
                          ? "border-accent/60 bg-accent-soft"
                          : "border-border bg-surface/80"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-[11px] font-semibold text-text">
                          {module.title}
                        </p>
                        <span
                          className={`rounded-full border px-2 py-[2px] text-[10px] font-semibold ${
                            module.type === "Read"
                              ? "border-accent/30 text-accent"
                              : "border-border text-text"
                          }`}
                        >
                          {module.type}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-3 text-[10px] text-muted">
                        <span>{module.duration}</span>
                        <span>{module.xp}</span>
                        {module.status === "current" && (
                          <span className="rounded-full bg-accent/15 px-2 py-[2px] text-accent">
                            Current
                          </span>
                        )}
                        {module.status === "locked" && (
                          <span className="rounded-full bg-surface-2 px-2 py-[2px] text-muted">
                            Locked
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-accent/40 bg-accent-soft px-3 py-2 text-[11px] text-accent">
              Complete the next quiz to unlock Module 3.
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  )
}
