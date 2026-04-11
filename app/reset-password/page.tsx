"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useHydrated } from "@/app/lib/useHydrated"
import { getSupabaseBrowserClient } from "@/app/lib/supabase/client"

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [error, setError] = useState("")
  const hydrated = useHydrated()

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()

    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        setError("This password reset link is invalid or expired. Request a new one.")
      }
      setCheckingSession(false)
    })
  }, [])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (password.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setLoading(true)
    setError("")

    const supabase = getSupabaseBrowserClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    router.replace("/login?reset=success")
    router.refresh()
  }

  return (
    <section className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center px-4 py-10">
      <div className="w-full rounded-3xl border border-border bg-surface p-6 shadow-sm">
        <p className="text-[11px] uppercase tracking-wide text-muted">Authentication</p>
        <h1 className="mt-2 text-2xl font-bold text-text">Set a new password</h1>
        <p className="mt-1 text-sm text-muted">
          Choose a new password for your HobbyASAP account.
        </p>

        {checkingSession ? (
          <p className="mt-6 text-sm text-muted">Checking your reset session...</p>
        ) : error && !loading && password.length === 0 ? (
          <div className="mt-6">
            <p className="rounded-xl border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
              {error}
            </p>
            <Link
              href="/forgot-password"
              className="mt-4 inline-flex rounded-xl bg-accent-strong px-4 py-2 text-sm font-semibold text-white hover:bg-accent"
            >
              Request a new link
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-[11px] font-semibold text-muted">New password</label>
              <input
                type="password"
                value={password}
                disabled={!hydrated || loading || checkingSession}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={6}
                className="mt-1 w-full rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-muted">
                Confirm password
              </label>
              <input
                type="password"
                value={confirmPassword}
                disabled={!hydrated || loading || checkingSession}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                minLength={6}
                className="mt-1 w-full rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            {error ? (
              <p className="rounded-xl border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={!hydrated || loading || checkingSession}
              className="w-full rounded-xl bg-accent-strong px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent disabled:opacity-60"
            >
              {!hydrated
                ? "Preparing form..."
                : loading
                  ? "Saving password..."
                  : "Update password"}
            </button>
          </form>
        )}
      </div>
    </section>
  )
}
