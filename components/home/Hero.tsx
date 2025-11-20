"use client"

import Link from "next/link"

export default function Hero() {
  return (
    <section className="relative mx-auto flex max-w-6xl flex-col gap-10 px-4 pb-14 pt-16 sm:pb-18 sm:pt-20 lg:flex-row lg:items-center">
      {/* extra glows */}
      <div className="pointer-events-none absolute left-[-120px] top-10 h-64 w-64 rounded-full bg-lime-400/35 blur-3xl" />
      <div className="pointer-events-none absolute right-[-80px] top-40 h-56 w-56 rounded-full bg-violet-500/40 blur-3xl" />

      {/* Left side */}
      <div className="relative z-10 max-w-xl space-y-7">
        <div className="inline-flex items-center gap-2 rounded-full border border-lime-300/70 bg-slate-950/80 px-3 py-1 text-[11px] text-lime-100 shadow-md shadow-lime-300/40">
          <span className="text-base">🧩</span>
          <span>Turn hobbies into tiny quests you actually finish</span>
        </div>

        <div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Learn any hobby like
            <span className="block bg-gradient-to-r from-lime-300 via-sky-300 to-violet-300 bg-clip-text text-transparent">
              As fast and easy as possible.
            </span>
          </h1>
          <p className="mt-3 text-sm text-slate-200 sm:text-base">
            HobbyASAP gives you a roadmap, daily quests, streaks and masterclass
            style deep dives for any hobby, from guitar to coding to fishing. No
            more “what now” feeling.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/app"
            className="inline-flex items-center justify-center rounded-full bg-lime-400 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-lime-300/60 hover:bg-lime-300"
          >
            Start a hobby quest
            <span className="ml-1.5 text-lg">▶</span>
          </Link>
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById("how-it-works")
              if (el) el.scrollIntoView({ behavior: "smooth" })
            }}
            className="inline-flex items-center justify-center rounded-full border border-white/15 bg-slate-950/70 px-4 py-2 text-xs font-medium text-slate-100 hover:border-lime-300 hover:text-lime-200"
          >
            See how it works
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-300">
          <Badge>🔥 Designed for streaks and XP</Badge>
          <Badge>🎯 15 to 30 minute sessions</Badge>
          <Badge>🔓 No account needed to test</Badge>
        </div>
      </div>

      {/* Right side - fake app card */}
      <div className="relative z-10 mx-auto w-full max-w-md">
        {/* top pills */}
        <div className="absolute -right-2 -top-3 flex items-center gap-1 rounded-full bg-slate-950/90 px-3 py-1 text-[11px] text-lime-200 shadow-md shadow-lime-300/60">
          <span className="text-base">🔥</span>
          <span>5 day streak</span>
        </div>
        <div className="absolute -left-2 -bottom-3 flex items-center gap-1 rounded-full bg-violet-500/20 px-2.5 py-1 text-[11px] text-violet-100">
          <span>⭐</span>
          <span>+80 XP this week</span>
        </div>

        <div className="rounded-[26px] border border-white/10 bg-slate-950/90 p-4 shadow-2xl shadow-slate-950/90">
          {/* header */}
          <div className="mb-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-lime-300 to-sky-400 text-lg">
                🎸
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-50">
                  Guitar quest
                </p>
                <p className="text-[11px] text-lime-200">
                  Level 2 • Confident beginner
                </p>
              </div>
            </div>
            <div className="text-right text-[11px]">
              <p className="text-slate-400">Today XP</p>
              <p className="font-semibold text-lime-300">+30</p>
              <div className="mt-1 h-1.5 w-20 rounded-full bg-slate-800">
                <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-lime-300 to-sky-400" />
              </div>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            {/* today card */}
            <div className="rounded-2xl border border-lime-300/60 bg-lime-300/10 p-3">
              <div className="mb-1 flex items-center justify-between">
                <p className="text-[11px] font-semibold text-lime-100">
                  Today - 25 minute session
                </p>
                <span className="rounded-full bg-slate-950/70 px-2 py-[2px] text-[10px] text-lime-100">
                  Daily quests
                </span>
              </div>
              <ul className="space-y-1.5">
                <HeroTask
                  done
                  label="Warmup: switch between 2 open chords for 3 min"
                  meta="5 min • +8 XP"
                />
                <HeroTask
                  label="Practice one strumming pattern with a metronome"
                  meta="15 min • +15 XP"
                />
                <HeroTask
                  label="Record yourself playing and note 1 thing to fix"
                  meta="5 min • +7 XP"
                />
              </ul>
              <div className="mt-2 flex flex-wrap gap-1.5 text-[10px]">
                <Chip>Masterclass: clean chord changes</Chip>
                <Chip variant="ghost">In depth: rhythm feel tips</Chip>
              </div>
            </div>

            {/* week + Q&A */}
            <div className="grid gap-2 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-3">
                <p className="text-[11px] font-semibold text-slate-100">
                  Week focus
                </p>
                <p className="mt-1 text-[11px] text-slate-300">
                  Switch chords without stopping the strum.
                </p>
                <ul className="mt-1 list-disc pl-4 text-[11px] text-slate-400">
                  <li>3 sets of 2 chord switches with slow metronome</li>
                  <li>Play along with a simple backing track</li>
                  <li>1 tiny recording per day to track progress</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-sky-400/50 bg-sky-500/10 p-3">
                <p className="text-[11px] font-semibold text-slate-100">
                  Ask your hobby coach
                </p>
                <p className="mt-1 text-[11px] text-slate-200">
                  “My fingers hurt and I mute strings. What should I change”
                </p>
                <p className="mt-1 rounded-xl bg-slate-950/70 px-2 py-1 text-[11px] text-sky-100">
                  Try 5 min of slow presses, close to the fret, with lighter
                  pressure. Only then add full strums.
                </p>
              </div>
            </div>

            <button className="mt-1 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-lime-300 to-sky-300 px-4 py-2 text-xs font-semibold text-slate-950 shadow-md shadow-lime-300/50 hover:brightness-110">
              Continue today session
              <span>▶</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

function HeroTask(props: { label: string; meta: string; done?: boolean }) {
  const { label, meta, done } = props
  return (
    <li className="flex items-start gap-2">
      <div
        className={`mt-[2px] flex h-4 w-4 items-center justify-center rounded-md border text-[9px] ${
          done
            ? "border-lime-300 bg-lime-300 text-slate-900"
            : "border-slate-600 bg-slate-950 text-slate-500"
        }`}
      >
        {done ? "✓" : ""}
      </div>
      <div>
        <p className={done ? "text-slate-400 line-through" : "text-slate-100"}>
          {label}
        </p>
        <p className="text-[10px] text-slate-400">{meta}</p>
      </div>
    </li>
  )
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/80 px-3 py-1 text-[11px] text-slate-200 border border-white/10">
      {children}
    </span>
  )
}

function Chip({
  children,
  variant = "solid",
}: {
  children: React.ReactNode
  variant?: "solid" | "ghost"
}) {
  if (variant === "ghost") {
    return (
      <span className="rounded-full border border-slate-600 bg-slate-950/70 px-2 py-[2px] text-[10px] text-slate-200">
        {children}
      </span>
    )
  }
  return (
    <span className="rounded-full bg-slate-950/70 px-2 py-[2px] text-[10px] text-lime-100 border border-lime-300/60">
      {children}
    </span>
  )
}
