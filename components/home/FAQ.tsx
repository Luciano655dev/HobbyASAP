"use client"

import Link from "next/link"
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
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 15, scale: 0.97 },
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

export default function FAQ() {
  return (
    <motion.section
      id="faq"
      className="mx-auto max-w-6xl px-4 pb-18 sm:pb-24"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }} // animates when FAQ scrolls into view
      variants={sectionVariants}
    >
      <div className="mb-6 text-center">
        <h2 className="text-xl font-semibold sm:text-2xl">
          Questions and answers
        </h2>
        <p className="mt-2 text-sm text-slate-200">
          A few things people usually want to know before trying a new toy.
        </p>
      </div>

      <motion.div className="grid gap-4 md:grid-cols-2" variants={gridVariants}>
        <FAQCard title="What problem does HobbyASAP solve?">
          Most people want to learn new things but quit because there&apos;s no
          clear path. HobbyASAP gives you structured plans, quests and weekly
          goals so you always know exactly what to do next.
        </FAQCard>

        <FAQCard title="Why do I need this instead of just Googling?">
          Googling gives you information. HobbyASAP turns that information into
          a step-by-step learning journey with phases, tasks, and progress
          tracking — all personalized to your time and level.
        </FAQCard>

        <FAQCard title="How does HobbyASAP save me time?">
          Instead of spending hours researching, comparing tutorials, and
          figuring out where to start, you generate a full roadmap in seconds.
          Everything is organized for you so you can focus on doing the hobby,
          not planning it.
        </FAQCard>

        <FAQCard title="Is this just a chat with AI?">
          No. The AI is only the engine. The real value is the structure:
          quests, roadmaps, masterclasses, XP, streaks and a full learning
          environment designed to keep you consistent.
        </FAQCard>
      </motion.div>

      <div className="mt-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
        >
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/app"
              className="inline-flex items-center justify-center rounded-full bg-lime-400 px-6 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-lime-300/60 hover:bg-lime-300"
            >
              Start your first hobby quest
              <span className="ml-1.5 text-lg">▶</span>
            </Link>
          </motion.div>
          <p className="mt-2 text-[11px] text-slate-400">
            You bring curiosity. HobbyASAP brings structure, quests and XP.
          </p>
        </motion.div>
      </div>
    </motion.section>
  )
}

function FAQCard(props: { title: string; children: React.ReactNode }) {
  return (
    <motion.div
      className="rounded-2xl border border-white/10 bg-slate-950/85 p-4"
      variants={cardVariants}
      whileHover={{ y: -3, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <p className="mb-1 text-sm font-semibold text-slate-50">{props.title}</p>
      <p className="text-xs text-slate-300">{props.children}</p>
    </motion.div>
  )
}
