"use client"

import { motion, type Variants } from "framer-motion"

// section fades in when scrolled into view
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

// grid staggers the step cards
const gridVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

// each step card pops in
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

export default function HowItWorks() {
  return (
    <motion.section
      id="how-it-works"
      className="mx-auto max-w-6xl px-4 pb-12 pt-2 sm:pb-16"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }} // only when user reaches this section
      variants={sectionVariants}
    >
      <div className="mb-7 text-center">
        <h2 className="text-xl font-semibold sm:text-2xl">
          How HobbyASAP turns hobbies into quests
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-slate-200">
          Instead of dumping information on you, it builds a path: first wins,
          weekly themes, and small quests you can actually finish.
        </p>
      </div>

      <motion.div className="grid gap-4 md:grid-cols-3" variants={gridVariants}>
        <StepCard
          step="1"
          title="Type your hobby and level"
          text="Say what you want to learn and how experienced you are. The app adjusts tasks and language for you."
          pill="Setup in seconds"
          color="lime"
        />
        <StepCard
          step="2"
          title="Get a playful roadmap"
          text="See phases, weekly goals, daily quests, gear tips and common mistakes, all in one board."
          pill="Roadmap view"
          color="sky"
        />
        <StepCard
          step="3"
          title="Go into master mode"
          text="Tap masterclass or in depth on any part to unlock deeper explanations, drills and examples."
          pill="Deep dive mode"
          color="violet"
        />
      </motion.div>
    </motion.section>
  )
}

function StepCard(props: {
  step: string
  title: string
  text: string
  pill: string
  color: "lime" | "sky" | "violet"
}) {
  const colorMap = {
    lime: {
      circle: "bg-lime-400/20 text-lime-200",
      pill: "bg-lime-400/20 text-lime-100 border-lime-300/70",
    },
    sky: {
      circle: "bg-sky-400/20 text-sky-200",
      pill: "bg-sky-400/20 text-sky-100 border-sky-300/70",
    },
    violet: {
      circle: "bg-violet-400/20 text-violet-200",
      pill: "bg-violet-400/20 text-violet-100 border-violet-300/70",
    },
  } as const

  const c = colorMap[props.color]

  return (
    <motion.div
      className="rounded-3xl border border-white/10 bg-slate-950/80 p-4 shadow-sm shadow-slate-950/80"
      variants={cardVariants}
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="mb-3 flex items-center justify-between">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${c.circle}`}
        >
          {props.step}
        </div>
        <span
          className={`rounded-full border px-2 py-[2px] text-[10px] font-semibold ${c.pill}`}
        >
          {props.pill}
        </span>
      </div>
      <h3 className="mb-1 text-sm font-semibold text-slate-50">
        {props.title}
      </h3>
      <p className="text-xs text-slate-300">{props.text}</p>
    </motion.div>
  )
}
