export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="mx-auto max-w-6xl px-4 pb-12 pt-2 sm:pb-16"
    >
      <div className="mb-7 text-center">
        <h2 className="text-xl font-semibold sm:text-2xl">
          How HobbyASAP turns hobbies into quests
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted">
          Instead of dumping information on you, it builds a path: first wins,
          weekly themes, and small quests you can actually finish.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
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
          title="Go deeper instantly"
          text="Tap in depth on any part to unlock deeper explanations, drills and examples."
          pill="Deep dive mode"
          color="violet"
        />
      </div>
    </section>
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
      circle: "bg-accent/20 text-accent",
      pill: "bg-accent/15 text-accent border-accent/40",
    },
    sky: {
      circle: "bg-accent/20 text-accent",
      pill: "bg-accent/15 text-accent border-accent/40",
    },
    violet: {
      circle: "bg-accent/20 text-accent",
      pill: "bg-accent/15 text-accent border-accent/40",
    },
  } as const

  const c = colorMap[props.color]

  return (
    <div className="rounded-3xl border border-border bg-surface/80 p-4 shadow-sm shadow-accent/5 transition hover:-translate-y-1 hover:shadow-md">
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
      <h3 className="mb-1 text-sm font-semibold text-text">{props.title}</h3>
      <p className="text-xs text-muted">{props.text}</p>
    </div>
  )
}
