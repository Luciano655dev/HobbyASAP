import type React from "react"

export default function WhySection() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-14 sm:pb-18">
      <div className="grid gap-6 md:grid-cols-[1.4fr,1fr]">
        <div className="rounded-3xl border border-border bg-surface/85 p-4 sm:p-5">
          <h2 className="mb-2 text-xl font-semibold">
            Why not just bounce between tutorials
          </h2>
          <p className="mb-3 text-sm text-muted">
            YouTube is full of good content, but it rarely tells you the order,
            how often to practice, or when to move on. That is where HobbyASAP
            lives.
          </p>
          <ul className="space-y-2 text-sm text-text">
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

        <div className="flex flex-col justify-between gap-4 rounded-3xl border border-border bg-surface/85 p-4 sm:p-5">
          <div>
            <p className="mb-2 text-[11px] uppercase tracking-wide text-muted">
              Made for <strong>real learners</strong>
            </p>

            <div className="mb-2 border-l-4 border-border py-1 pl-3">
              <p className="mb-1 text-sm italic text-text">
                “I'm not paying a new course for every skill that I want to
                learn. This app is saving me!”
              </p>
              <p className="text-xs text-muted">
                Luciano Menezes, Daykeeper.app (and HobbyASAP) Founder
              </p>
            </div>
            <div className="mb-2 border-l-4 border-border py-1 pl-3">
              <p className="mb-1 text-sm italic text-text">
                "I love this, it changed my life! I'm using It everyday! And the
                developer is a cutie :)”
              </p>
              <p className="text-xs text-muted">Sofia Jordão, My Girlfriend :)</p>
            </div>
            <div className="mb-2 border-l-4 border-border py-1 pl-3">
              <p className="mb-1 text-sm italic text-text">
                "This app is impressive! We should probably admit this student!!”
              </p>
              <p className="text-xs text-muted">
                You if you are reviewing my college application :D
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-accent/40 bg-accent-soft p-3 text-xs text-accent">
            <p className="mb-1 font-semibold">Experimental and open to change</p>
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
      <span className="mt-0.5 text-accent">✓</span>
      <span>{children}</span>
    </li>
  )
}
