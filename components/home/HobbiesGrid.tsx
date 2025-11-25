"use client"

import { useRouter } from "next/navigation"
import { motion, type Variants } from "framer-motion"

const CARDS = [
  {
    icon: "🎣",
    title: "Fishing",
    text: "Knots, casting, reading water, handling fish.",
  },
  {
    icon: "🎬",
    title: "Filmmaking",
    text: "Shots, storyboards, editing short videos.",
  },
  {
    icon: "💻",
    title: "Coding",
    text: "Fundamentals, projects, problem solving.",
  },
  {
    icon: "🧵",
    title: "Any weird hobby",
    text: "Chess, sewing, gardening, 3D printing and more.",
  },
]

// section fades in when it enters the viewport
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

// grid staggers its children
const gridVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

// each card pops in slightly
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

export default function HobbiesGrid() {
  const router = useRouter()

  return (
    <motion.section
      id="hobbies"
      className="mx-auto max-w-6xl px-4 pb-14 sm:pb-18"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }} // <- only when user scrolls here
      variants={sectionVariants}
    >
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold sm:text-2xl">
            Choose your next hobby quest
          </h2>
          <p className="mt-1 text-sm text-slate-200">
            These are just ideas. HobbyASAP works with almost anything you can
            describe.
          </p>
        </div>
        <p className="text-[11px] text-slate-400">
          Plans are generated when you ask. Nothing is pre recorded.
        </p>
      </div>

      <motion.div
        className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4"
        variants={gridVariants}
      >
        {CARDS.map((card) => (
          <motion.div
            key={card.title}
            className="group relative flex cursor-pointer flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-950/80 p-3 transition hover:-translate-y-1 hover:border-lime-300/80 hover:shadow-lg hover:shadow-lime-300/30"
            onClick={() => router.replace("/app")}
            variants={cardVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="absolute right-2 top-2 rounded-full bg-slate-950/80 px-2 py-[2px] text-[9px] text-lime-200 opacity-0 transition group-hover:opacity-100">
              New quest
            </div>
            <div className="mb-1 text-2xl">{card.icon}</div>
            <p className="text-sm font-semibold text-slate-50">{card.title}</p>
            <p className="mt-1 text-[11px] text-slate-400">{card.text}</p>
            <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400">
              <span>Auto roadmap</span>
              <span className="rounded-full bg-lime-300/15 px-2 py-[2px] text-lime-200">
                10 to 20 quests
              </span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  )
}
