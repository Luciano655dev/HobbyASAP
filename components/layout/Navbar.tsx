import Link from "next/link"

export default function Navbar() {
  return (
    <div>
      {/* Background glows */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-lime-400/25 blur-3xl" />
        <div className="absolute -bottom-40 left-10 h-[260px] w-[260px] rounded-full bg-sky-500/25 blur-3xl" />
        <div className="absolute -bottom-56 right-10 h-[320px] w-[320px] rounded-full bg-violet-500/30 blur-3xl" />
      </div>

      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:py-4">
          {/* Logo + wordmark */}
          <Link
            href="/"
            className="flex items-center gap-2 transition hover:opacity-90"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-lime-400 text-lg font-black text-slate-950 shadow-lg shadow-lime-300/60">
              H
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight">HobbyASAP</p>
              <p className="text-[10px] leading-tight text-lime-200">
                Hobbies as daily quests
              </p>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-5 text-xs text-slate-200 sm:flex">
            <a href="#how-it-works" className="hover:text-lime-200 transition">
              How it works
            </a>
            <a href="#hobbies" className="hover:text-lime-200 transition">
              Hobbies
            </a>
            <a href="#faq" className="hover:text-lime-200 transition">
              FAQ
            </a>
            <Link
              href="/app"
              className="inline-flex items-center gap-1 rounded-full bg-lime-400 px-4 py-1.5 text-[11px] font-semibold text-slate-950 shadow-md shadow-lime-300/50 hover:bg-lime-300"
            >
              Open app
              <span className="text-xs">▶</span>
            </Link>
          </nav>

          {/* Mobile */}
          <Link
            href="/app"
            className="flex items-center gap-1 rounded-full border border-lime-300/70 bg-slate-950/80 px-3 py-1.5 text-[11px] font-medium text-lime-200 shadow-sm shadow-lime-300/50 transition hover:bg-slate-900 sm:hidden"
          >
            <span>Open app</span>
            <span>▶</span>
          </Link>
        </div>
      </header>
    </div>
  )
}
