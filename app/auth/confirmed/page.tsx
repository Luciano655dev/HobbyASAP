import Link from "next/link"

type SearchParams = Promise<{
  status?: string
  message?: string
}>

export default async function AuthConfirmedPage(props: {
  searchParams: SearchParams
}) {
  const searchParams = await props.searchParams
  const status = searchParams.status === "error" ? "error" : "success"
  const message = searchParams.message
    ? decodeURIComponent(searchParams.message)
    : status === "success"
      ? "Your email was confirmed successfully. You can continue into the app now."
      : "We could not confirm your email. The link may be invalid or expired."

  return (
    <section className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-lg items-center px-4 py-10">
      <div className="w-full rounded-3xl border border-border bg-surface p-6 shadow-sm">
        <p className="text-[11px] uppercase tracking-wide text-muted">Authentication</p>
        <h1 className="mt-2 text-2xl font-bold text-text">
          {status === "success" ? "Email confirmed" : "Confirmation failed"}
        </h1>
        <p
          className={`mt-3 rounded-2xl border px-4 py-3 text-sm ${
            status === "success"
              ? "border-accent/40 bg-accent-soft text-accent"
              : "border-danger/40 bg-danger/10 text-danger"
          }`}
        >
          {message}
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href={status === "success" ? "/login" : "/register"}
            className="rounded-xl bg-accent-strong px-4 py-2 text-sm font-semibold text-white hover:bg-accent"
          >
            {status === "success" ? "Go to login" : "Create account again"}
          </Link>
          <Link
            href="/"
            className="rounded-xl border border-border bg-surface-2 px-4 py-2 text-sm font-medium text-text hover:bg-surface"
          >
            Back home
          </Link>
        </div>
      </div>
    </section>
  )
}
