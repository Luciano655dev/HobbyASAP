"use client"

import Link from "next/link"
import type { Route } from "next"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { useHydrated } from "@/app/lib/useHydrated"
import { getSupabaseBrowserClient } from "@/app/lib/supabase/client"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const hydrated = useHydrated()
  const resetSuccess = searchParams.get("reset") === "success"

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError("")

    const supabase = getSupabaseBrowserClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }

    router.replace((searchParams.get("next") || "/app") as Route)
    router.refresh()
  }

  return (
    <section className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center px-4 py-10">
      <div className="w-full rounded-3xl border border-border bg-surface p-6 shadow-sm">
        <p className="text-[11px] uppercase tracking-wide text-muted">Authentication</p>
        <h1 className="mt-2 text-2xl font-bold text-text">Login</h1>
        <p className="mt-1 text-sm text-muted">
          Access your saved courses, settings, and progress.
        </p>

        {resetSuccess ? (
          <p className="mt-4 rounded-xl border border-accent/40 bg-accent-soft px-3 py-2 text-sm text-accent">
            Your password was updated. Log in with the new one.
          </p>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="login-email" className="text-[11px] font-semibold text-muted">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              disabled={!hydrated || loading}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="mt-1 w-full rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <div>
            <label
              htmlFor="login-password"
              className="text-[11px] font-semibold text-muted"
            >
              Password
            </label>
            <input
              id="login-password"
              type="password"
              value={password}
              disabled={!hydrated || loading}
              onChange={(event) => setPassword(event.target.value)}
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
            {!hydrated ? "Preparing form..." : loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
          <p>
            Need an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-accent hover:underline"
            >
              Register
            </Link>
          </p>
          <Link
            href="/forgot-password"
            className="font-semibold text-accent hover:underline"
          >
            Forgot password?
          </Link>
        </div>
      </div>
    </section>
  )
}
