import Link from "next/link"

export default function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-2xl items-center px-4 py-10">
      <section className="w-full rounded-3xl border border-border bg-surface p-6 shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
          Not found
        </p>
        <h1 className="mt-2 text-2xl font-bold text-text">
          That page does not exist
        </h1>
        <p className="mt-2 text-sm text-muted">
          The URL may be wrong, expired, or no longer available.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/"
            className="rounded-xl bg-accent-strong px-4 py-2 text-sm font-semibold text-white hover:bg-accent"
          >
            Go home
          </Link>
          <Link
            href="/app"
            className="rounded-xl border border-border bg-surface-2 px-4 py-2 text-sm font-medium text-text hover:bg-surface"
          >
            Open app
          </Link>
        </div>
      </section>
    </main>
  )
}
