import Link from "next/link"

type SearchParams = Promise<{
  mode?: string
  email?: string
}>

export default async function CheckEmailPage(props: {
  searchParams: SearchParams
}) {
  const searchParams = await props.searchParams
  const mode = searchParams.mode === "recovery" ? "recovery" : "confirm"
  const email = searchParams.email ? decodeURIComponent(searchParams.email) : ""

  const title =
    mode === "recovery" ? "Check your reset email" : "Confirm your email"
  const description =
    mode === "recovery"
      ? "We sent a password reset link to your inbox. Open it on this same device to continue."
      : "We sent a confirmation link to your inbox so we can activate your account."

  return (
    <section className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-lg items-center px-4 py-10">
      <div className="w-full rounded-3xl border border-border bg-surface p-6 shadow-sm">
        <p className="text-[11px] uppercase tracking-wide text-muted">Authentication</p>
        <h1 className="mt-2 text-2xl font-bold text-text">{title}</h1>
        <p className="mt-2 text-sm text-muted">{description}</p>

        {email ? (
          <div className="mt-4 rounded-2xl border border-border bg-surface-2 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
              Sent to
            </p>
            <p className="mt-1 text-sm font-medium text-text">{email}</p>
          </div>
        ) : null}

        <div className="mt-4 space-y-2 rounded-2xl border border-border bg-surface-2 px-4 py-4 text-sm text-muted">
          <p>Open the newest email from Supabase or HobbyASAP.</p>
          <p>If you do not see it, check spam, promotions, or wait a minute and try again.</p>
          <p>Use the same browser/device when opening the link to make the handoff cleaner.</p>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/login"
            className="rounded-xl bg-accent-strong px-4 py-2 text-sm font-semibold text-white hover:bg-accent"
          >
            Back to login
          </Link>
          {mode === "confirm" ? (
            <Link
              href="/register"
              className="rounded-xl border border-border bg-surface-2 px-4 py-2 text-sm font-medium text-text hover:bg-surface"
            >
              Try another email
            </Link>
          ) : (
            <Link
              href="/forgot-password"
              className="rounded-xl border border-border bg-surface-2 px-4 py-2 text-sm font-medium text-text hover:bg-surface"
            >
              Send again
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}
