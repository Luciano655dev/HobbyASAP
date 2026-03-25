"use client"

import { useEffect } from "react"
import * as Sentry from "@sentry/nextjs"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <main className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-2xl items-center px-4 py-10">
      <section className="w-full rounded-3xl border border-border bg-surface p-6 shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
          Unexpected error
        </p>
        <h1 className="mt-2 text-2xl font-bold text-text">
          Something broke while loading this page
        </h1>
        <p className="mt-2 text-sm text-muted">
          Try again once. If the problem keeps happening, check the Vercel logs with
          the error digest below.
        </p>
        <div className="mt-4 rounded-2xl border border-danger/40 bg-danger/10 px-4 py-3">
          <p className="text-sm text-danger">{error.message || "Unknown error."}</p>
          {error.digest ? (
            <p className="mt-1 text-xs text-danger/80">Digest: {error.digest}</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={reset}
          className="mt-5 rounded-xl bg-accent-strong px-4 py-2 text-sm font-semibold text-white hover:bg-accent"
        >
          Try again
        </button>
      </section>
    </main>
  )
}
