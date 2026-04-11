import Link from "next/link"

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

export default function HobbiesGrid() {
  return (
    <section id="hobbies" className="mx-auto max-w-6xl px-4 pb-14 sm:pb-18">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold sm:text-2xl">
            Choose your next hobby quest
          </h2>
          <p className="mt-1 text-sm text-muted">
            These are just ideas. HobbyASAP works with almost anything you can
            describe.
          </p>
        </div>
        <p className="text-[11px] text-muted">
          Plans are generated when you ask. Nothing is pre recorded.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {CARDS.map((card) => (
          <Link
            key={card.title}
            href="/app"
            className="group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-surface/80 p-3 transition hover:-translate-y-1 hover:border-accent/60 hover:shadow-lg hover:shadow-accent/20"
          >
            <div className="absolute right-2 top-2 rounded-full bg-surface/80 px-2 py-[2px] text-[9px] text-accent opacity-0 transition group-hover:opacity-100">
              New quest
            </div>
            <div className="mb-1 text-2xl">{card.icon}</div>
            <p className="text-sm font-semibold text-text">{card.title}</p>
            <p className="mt-1 text-[11px] text-muted">{card.text}</p>
            <div className="mt-3 flex items-center justify-between text-[10px] text-muted">
              <span>Auto roadmap</span>
              <span className="rounded-full bg-accent/15 px-2 py-[2px] text-accent">
                10 to 20 quests
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
