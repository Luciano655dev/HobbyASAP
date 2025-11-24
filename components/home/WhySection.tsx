export default function WhySection() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-14 sm:pb-18">
      <div className="grid gap-6 md:grid-cols-[1.4fr,1fr]">
        <div className="rounded-3xl border border-white/10 bg-slate-950/85 p-4 sm:p-5">
          <h2 className="mb-2 text-xl font-semibold">
            Why not just bounce between tutorials
          </h2>
          <p className="mb-3 text-sm text-slate-200">
            YouTube is full of good content, but it rarely tells you the order,
            how often to practice, or when to move on. That is where HobbyASAP
            lives.
          </p>
          <ul className="space-y-2 text-sm text-slate-100">
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
        </div>

        <div className="flex flex-col justify-between gap-4 rounded-3xl border border-white/10 bg-slate-950/85 p-4 sm:p-5">
          <div>
            <p className="mb-2 text-[11px] uppercase tracking-wide text-slate-400">
              Made for <strong>real learners</strong>
            </p>

            <div className="border-l-4 border-slate-700 pl-3 py-1 mb-2">
              <p className="text-sm text-slate-200 italic mb-1">
                “I'm not paying a new course for every skill that I want to
                learn. This app is saving me!”
              </p>
              <p className="text-xs text-slate-400">
                — Luciano Menezes, Daykeeper CEO
              </p>
            </div>
            <div className="border-l-4 border-slate-700 pl-3 py-1">
              <p className="text-sm text-slate-200 italic mb-1">
                “This app is awesome! I'm using It everyday! And the developer
                is a cutie :)”
              </p>
              <p className="text-xs text-slate-400">
                — Sofia Jordão, My Girlfriend :)
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-lime-300/60 bg-lime-300/10 p-3 text-xs text-lime-100">
            <p className="mb-1 font-semibold">
              Experimental and open to change
            </p>
            <p>
              HobbyASAP is still a prototype built by one person. Expect new
              ideas, improvements and some chaos while it grows.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function WhyItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2">
      <span className="mt-0.5 text-lime-300">✓</span>
      <span>{children}</span>
    </li>
  )
}
