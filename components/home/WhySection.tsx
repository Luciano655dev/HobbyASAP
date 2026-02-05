"use client"

import { motion, type Variants } from "framer-motion"
import type React from "react"

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
    },
  },
}

const gridVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 18, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.35,
      ease: "easeOut",
    },
  },
}

const whyItemVariants: Variants = {
  hidden: { opacity: 0, x: -8 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.25, ease: "easeOut" },
  },
}

export default function WhySection() {
  return (
    <motion.section
      className="mx-auto max-w-6xl px-4 pb-14 sm:pb-18"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={sectionVariants}
    >
      <motion.div
        className="grid gap-6 md:grid-cols-[1.4fr,1fr]"
        variants={gridVariants}
      >
        <motion.div
          className="rounded-3xl border border-border bg-surface/85 p-4 sm:p-5"
          variants={cardVariants}
        >
          <h2 className="mb-2 text-xl font-semibold">
            Why not just bounce between tutorials
          </h2>
          <p className="mb-3 text-sm text-muted">
            YouTube is full of good content, but it rarely tells you the order,
            how often to practice, or when to move on. That is where HobbyASAP
            lives.
          </p>
          <ul className="space-y-2 text-sm text-text">
            <WhyItem>
              Phases, weekly focus and daily quests instead of ten random open
              tabs.
            </WhyItem>
            <WhyItem>
              Tiny tasks that fit a busy day but still give you XP and progress.
            </WhyItem>
            <WhyItem>
              A whole mistakes section, so you do not spend months practicing
              bad habits.
            </WhyItem>
            <WhyItem>
              A Q and A coach that remembers your roadmap and previous answers.
            </WhyItem>
          </ul>
        </motion.div>

        <motion.div
          className="flex flex-col justify-between gap-4 rounded-3xl border border-border bg-surface/85 p-4 sm:p-5"
          variants={cardVariants}
        >
          <div>
            <p className="mb-2 text-[11px] uppercase tracking-wide text-muted">
              Made for <strong>real learners</strong>
            </p>

            <div className="border-l-4 border-border pl-3 py-1 mb-2">
              <p className="text-sm text-text italic mb-1">
                “I'm not paying a new course for every skill that I want to
                learn. This app is saving me!”
              </p>
              <p className="text-xs text-muted">
                — Luciano Menezes, Daykeeper.app (and HobbyASAP) Founder 
              </p>
            </div>
            <div className="border-l-4 border-border pl-3 py-1 mb-2">
              <p className="text-sm text-text italic mb-1">
                "I love this, it changed my life! I'm using It everyday! And the developer
                is a cutie :)”
              </p>
              <p className="text-xs text-muted">
                — Sofia Jordão, My Girlfriend :)
              </p>
            </div>
            <div className="border-l-4 border-border pl-3 py-1 mb-2">
              <p className="text-sm text-text italic mb-1">
                "This app is impressive! We should probably admit this student!!”
              </p>
              <p className="text-xs text-muted">
                — You if you are reviewing my college application :D
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-accent/40 bg-accent-soft p-3 text-xs text-accent">
            <p className="mb-1 font-semibold">
              Experimental and open to change
            </p>
            <p>
              HobbyASAP is still a prototype built by one person. Expect new
              ideas, improvements and some chaos while it grows.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </motion.section>
  )
}

function WhyItem({ children }: { children: React.ReactNode }) {
  return (
    <motion.li className="flex gap-2" variants={whyItemVariants}>
      <span className="mt-0.5 text-accent">✓</span>
      <span>{children}</span>
    </motion.li>
  )
}
