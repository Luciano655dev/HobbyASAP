export const metadata = {
  title: "License | HobbyASAP",
}

export default function LicensePage() {
  return (
    <main className="min-h-screen bg-app-bg text-text">
      <section className="mx-auto max-w-3xl px-4 py-12">
        <p className="text-[11px] uppercase tracking-wide text-muted">Legal</p>
        <h1 className="mt-2 text-3xl font-semibold">License</h1>
        <div className="mt-6 space-y-6 rounded-3xl border border-border bg-surface p-6 text-sm text-muted shadow-sm">
          <p>
            HobbyASAP is released under the MIT License. You can use, copy,
            modify, and distribute the software, including for commercial use,
            as long as the original copyright notice and license text stay with
            the project.
          </p>

          <div className="rounded-2xl border border-border bg-surface-2 p-4">
            <p className="font-medium text-text">What this means</p>
            <div className="mt-3 space-y-2">
              <p>You may use the code in personal or commercial projects.</p>
              <p>You may modify and redistribute the code.</p>
              <p>You must keep the license and copyright notice.</p>
              <p>The software is provided without warranty or liability.</p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-app-bg p-4 font-mono text-xs leading-6 text-muted">
            <p>MIT License</p>
            <p>Copyright (c) 2026 Luciano Menezes</p>
            <p>
              Permission is hereby granted, free of charge, to any person
              obtaining a copy of this software and associated documentation
              files to deal in the Software without restriction, subject to the
              license conditions.
            </p>
            <p>
              THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href="https://github.com/luciano655dev/hobbyasap"
              target="_blank"
              rel="noreferrer"
              className="inline-flex rounded-xl border border-border px-4 py-2 font-medium text-text transition hover:border-accent/40 hover:bg-surface-2"
            >
              Open GitHub Repository
            </a>
            <a
              href="/LICENSE"
              className="inline-flex rounded-xl border border-border px-4 py-2 font-medium text-text transition hover:border-accent/40 hover:bg-surface-2"
            >
              View Full License File
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
