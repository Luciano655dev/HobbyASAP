import Link from "next/link"

export default function FAQ() {
  return (
    <section id="faq" className="mx-auto max-w-6xl px-4 pb-18 sm:pb-24">
      <div className="mb-6 text-center">
        <h2 className="text-xl font-semibold sm:text-2xl">
          Questions and answers
        </h2>
        <p className="mt-2 text-sm text-slate-200">
          A few things people usually want to know before trying a new toy.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FAQCard title="What problem does HobbyASAP solve?">
          Most people want to learn new things but quit because there's no clear
          path. HobbyASAP gives you structured plans, quests and weekly goals so
          you always know exactly what to do next.
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
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/app"
          className="inline-flex items-center justify-center rounded-full bg-lime-400 px-6 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-lime-300/60 hover:bg-lime-300"
        >
          Start your first hobby quest
          <span className="ml-1.5 text-lg">▶</span>
        </Link>
        <p className="mt-2 text-[11px] text-slate-400">
          You bring curiosity. HobbyASAP brings structure, quests and XP.
        </p>
      </div>
    </section>
  )
}

function FAQCard(props: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/85 p-4">
      <p className="mb-1 text-sm font-semibold text-slate-50">{props.title}</p>
      <p className="text-xs text-slate-300">{props.children}</p>
    </div>
  )
}
