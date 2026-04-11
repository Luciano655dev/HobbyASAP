"use client"

import Link from "next/link"
import { useState } from "react"
import { useHydrated } from "@/app/lib/useHydrated"
import { getSupabaseBrowserClient } from "@/app/lib/supabase/client"
import { getClientSiteUrl } from "@/app/lib/site-url"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const hydrated = useHydrated()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError("")

    const supabase = getSupabaseBrowserClient()
    const redirectTo = `${getClientSiteUrl()}/auth/confirm?next=/reset-password`
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    })

    if (resetError) {
      setError(resetError.message)
      setLoading(false)
      return
    }

    window.location.href = `/auth/check-email?mode=recovery&email=${encodeURIComponent(email)}`
  }

  return (
    <section className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center px-4 py-10">
      <div className="w-full rounded-3xl border border-border bg-surface p-6 shadow-sm">
        <p className="text-[11px] uppercase tracking-wide text-muted">Authentication</p>
        <h1 className="mt-2 text-2xl font-bold text-text">Forgot password</h1>
        <p className="mt-1 text-sm text-muted">
          Enter your account email and we&apos;ll send you a secure reset link.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="forgot-password-email"
              className="text-[11px] font-semibold text-muted"
            >
              Email
            </label>
            <input
              id="forgot-password-email"
              type="email"
              value={email}
              disabled={!hydrated || loading}
              onChange={(event) => setEmail(event.target.value)}
              required
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
            disabled={!hydrated || loading}
            className="w-full rounded-xl bg-accent-strong px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent disabled:opacity-60"
          >
            {!hydrated
              ? "Preparing form..."
              : loading
                ? "Sending reset email..."
                : "Send reset email"}
          </button>
        </form>

        <p className="mt-4 text-sm text-muted">
          Remembered your password?{" "}
          <Link href="/login" className="font-semibold text-accent hover:underline">
            Login
          </Link>
        </p>
      </div>
    </section>
  )
}
