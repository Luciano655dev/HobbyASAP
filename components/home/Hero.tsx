import Link from "next/link"
import type React from "react"

export default function Hero() {
  return (
    <section className="relative mx-auto flex max-w-6xl flex-col gap-10 px-4 pb-14 pt-16 sm:pb-18 sm:pt-20 lg:flex-row lg:items-center">
      <div className="relative z-10 max-w-xl space-y-7">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Learn any hobby
            <span className="block bg-linear-to-r from-accent-strong via-accent to-accent bg-clip-text text-transparent">
              as fast and as easily as possible
            </span>
          </h1>
          <p className="mt-3 text-sm text-muted sm:text-base">
            HobbyASAP gives you a roadmap, daily quests, streaks and deep dives
            for any hobby, from guitar to coding to fishing. No more “what now”
            feeling.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/app"
            className="inline-flex items-center justify-center rounded-full bg-accent-strong px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent/40 transition hover:bg-accent"
          >
            Start a hobby quest
            <span className="ml-1.5 text-lg">▶</span>
          </Link>
          <a
            href="#how-it-works"
            className="inline-flex items-center justify-center rounded-full border border-border bg-surface/70 px-4 py-2 text-xs font-medium text-text transition hover:border-accent/50 hover:text-accent"
          >
            See how it works
          </a>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-[11px] text-muted">
          <span>🔥 Designed for streaks and XP</span>
          <span>🎯 15 to 30 minute sessions</span>
          <span>🔓 No account needed to test</span>
        </div>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-md">
        <div className="rounded-[26px] border border-border bg-surface/90 p-4 shadow-2xl shadow-accent/10">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-linear-to-br from-accent to-accent-strong text-lg text-white">
                🎸
              </div>
              <div>
                <p className="text-sm font-semibold text-text">Guitar quest</p>
                <p className="text-[11px] text-accent">
                  Level 2 • Confident beginner
                </p>
              </div>
            </div>
            <div className="text-right text-[11px]">
              <p className="text-muted">Today XP</p>
              <p className="font-semibold text-accent">+30</p>
              <div className="mt-1 h-1.5 w-20 rounded-full bg-surface-2">
                <div className="h-full w-2/3 rounded-full bg-linear-to-r from-accent to-accent-strong" />
              </div>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="rounded-2xl border border-accent/40 bg-accent-soft p-3">
              <div className="mb-1 flex items-center justify-between">
                <p className="text-[11px] font-semibold text-accent">
                  Today - 25 minute session
                </p>
                <span className="rounded-full bg-surface/70 px-2 py-0.5 text-[10px] text-accent">
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
                <Chip>Deep dive: clean chord changes</Chip>
                <Chip variant="ghost">In depth: rhythm feel tips</Chip>
              </div>
            </div>

            <div className="grid gap-2 md:grid-cols-2">
              <div className="rounded-2xl border border-border bg-surface-2/80 p-3">
                <p className="text-[11px] font-semibold text-text">Week focus</p>
                <p className="mt-1 text-[11px] text-muted">
                  Switch chords without stopping the strum.
                </p>
                <ul className="mt-1 list-disc pl-4 text-[11px] text-muted">
                  <li>3 sets of 2 chord switches with slow metronome</li>
                  <li>Play along with a simple backing track</li>
                  <li>1 tiny recording per day to track progress</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-accent/40 bg-accent-soft p-3">
                <p className="text-[11px] font-semibold text-text">
                  Ask your hobby coach
                </p>
                <p className="mt-1 text-[11px] text-text">
                  “My fingers hurt and I mute strings. What should I change”
                </p>
                <p className="mt-1 rounded-xl bg-surface/70 px-2 py-1 text-[11px] text-accent">
                  Try 5 min of slow presses, close to the fret, with lighter
                  pressure. Only then add full strums.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="mt-1 flex w-full items-center justify-center gap-2 rounded-full bg-linear-to-r from-accent to-accent-strong px-4 py-2 text-xs font-semibold text-white shadow-md shadow-accent/40 transition hover:brightness-110"
            >
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
        className={`mt-0.5 flex h-4 w-4 items-center justify-center rounded-md border text-[9px] ${
          done
            ? "border-accent bg-accent text-white"
            : "border-border bg-surface text-muted"
        }`}
      >
        {done ? "✓" : ""}
      </div>
      <div>
        <p className={done ? "text-muted line-through" : "text-text"}>
          {label}
        </p>
        <p className="text-[10px] text-muted">{meta}</p>
      </div>
    </li>
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
      <span className="rounded-full border border-border bg-surface/70 px-2 py-0.5 text-[10px] text-text">
        {children}
      </span>
    )
  }

  return (
    <span className="rounded-full border border-accent/40 bg-surface/70 px-2 py-0.5 text-[10px] text-accent">
      {children}
    </span>
  )
}
