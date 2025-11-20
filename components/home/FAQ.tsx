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
        <FAQCard title="Do I need an account">
          For now, no. You can open the app, type a hobby and generate plans
          without creating an account. Later, accounts can help you sync across
          devices.
        </FAQCard>
        <FAQCard title="Does it work for very niche hobbies">
          Yes. As long as you can describe the hobby with words, the AI can
          propose phases, quests and useful search ideas for you.
        </FAQCard>
        <FAQCard title="Can I change the roadmap">
          Think of the roadmap as a strong first draft. You can regenerate it
          with another level, copy and tweak sections, or extend it with your
          own ideas.
        </FAQCard>
        <FAQCard title="Is this just a chat with a model">
          Under the hood there is an AI model, but the key part is structure.
          Roadmaps, daily quests, masterclass lessons and Q and A tied to your
          current plan.
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
