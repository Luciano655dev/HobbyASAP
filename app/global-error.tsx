"use client"

import { useEffect } from "react"
import * as Sentry from "@sentry/nextjs"

export default function RootGlobalError({
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
    <html lang="en">
      <body className="min-h-screen bg-app-bg px-4 py-10 text-text">
        <main className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-2xl items-center">
          <section className="w-full rounded-3xl border border-border bg-surface p-6 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
              Application error
            </p>
            <h1 className="mt-2 text-2xl font-bold text-text">
              HobbyASAP failed to render
            </h1>
            <p className="mt-2 text-sm text-muted">
              This is a top-level application failure. Retry once, then inspect the
              deployment logs if it persists.
            </p>
            <div className="mt-4 rounded-2xl border border-danger/40 bg-danger/10 px-4 py-3">
              <p className="text-sm text-danger">
                {error.message || "Unknown application error."}
              </p>
              {error.digest ? (
                <p className="mt-1 text-xs text-danger/80">Digest: {error.digest}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={reset}
              className="mt-5 rounded-xl bg-accent-strong px-4 py-2 text-sm font-semibold text-white hover:bg-accent"
            >
              Reload application
            </button>
          </section>
        </main>
      </body>
    </html>
  )
}
