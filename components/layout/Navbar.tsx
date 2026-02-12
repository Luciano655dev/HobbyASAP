import Link from "next/link"
import ThemeToggle from "./ThemeToggle"

export default function Navbar() {
  return (
    <div>
      {/* Background glows */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute -bottom-40 left-10 h-[260px] w-[260px] rounded-full bg-accent/15 blur-3xl" />
        <div className="absolute -bottom-56 right-10 h-[320px] w-[320px] rounded-full bg-accent/10 blur-3xl" />
      </div>

      <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-app-bg/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:py-4">
          {/* Logo + wordmark */}
          <Link
            href="/"
            className="flex items-center gap-2 transition hover:opacity-90"
          >
            <div
              aria-hidden="true"
              className="flex h-9 w-9 items-center justify-center rounded-2xl border border-border bg-linear-to-br from-accent to-accent-strong text-sm font-bold text-white shadow-sm"
            >
              H
            </div>
            <div>
              <p className="text-[15px] font-bold leading-none tracking-[-0.01em] text-text">
                HobbyASAP
              </p>
              <p className="mt-0.5 text-[10px] leading-tight text-muted">
                Daily learning quests
              </p>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-4 text-xs text-muted sm:flex">
            <Link href="/#how-it-works" className="hover:text-accent transition">
              How it works
            </Link>
            <Link href="/#hobbies" className="hover:text-accent transition">
              Hobbies
            </Link>
            <Link href="/#faq" className="hover:text-accent transition">
              FAQ
            </Link>
            <ThemeToggle />
            <Link
              href="/app"
              className="inline-flex items-center gap-1 rounded-full bg-accent-strong px-4 py-1.5 text-[11px] font-semibold text-white shadow-md shadow-accent/40 hover:bg-accent"
            >
              Open app
              <span className="text-xs">▶</span>
            </Link>
          </nav>

          {/* Mobile */}
          <div className="flex items-center gap-2 sm:hidden">
            <ThemeToggle />
            <Link
              href="/app"
              className="flex items-center gap-1 rounded-full border border-border bg-surface px-3 py-1.5 text-[11px] font-medium text-text shadow-sm transition hover:bg-surface-2"
            >
              <span>Open app</span>
              <span>▶</span>
            </Link>
          </div>
        </div>
      </header>
    </div>
  )
}
