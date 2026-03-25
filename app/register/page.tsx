"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useHydrated } from "@/app/lib/useHydrated"
import { getSupabaseBrowserClient } from "@/app/lib/supabase/client"
import { getClientSiteUrl } from "@/app/lib/site-url"

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const hydrated = useHydrated()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError("")

    const supabase = getSupabaseBrowserClient()
    const emailRedirectTo = `${getClientSiteUrl()}/auth/confirm?next=/auth/confirmed`
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo,
        data: {
          full_name: name.trim(),
        },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    const userId = data.user?.id
    if (userId) {
      await supabase.from("user_settings").upsert({
        user_id: userId,
        preferred_language: "en",
        active_session_id: null,
      })

      await fetch("/api/metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "newUser" }),
      }).catch(() => null)
    }

    if (data.session) {
      router.replace("/app")
      router.refresh()
      return
    }

    window.location.href = `/auth/check-email?mode=confirm&email=${encodeURIComponent(email)}`
  }

  return (
    <section className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center px-4 py-10">
      <div className="w-full rounded-3xl border border-border bg-surface p-6 shadow-sm">
        <p className="text-[11px] uppercase tracking-wide text-muted">Authentication</p>
        <h1 className="mt-2 text-2xl font-bold text-text">Register</h1>
        <p className="mt-1 text-sm text-muted">
          Create an account to save courses and sync your settings.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="register-name" className="text-[11px] font-semibold text-muted">
              Name
            </label>
            <input
              id="register-name"
              type="text"
              value={name}
              disabled={!hydrated || loading}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your name"
              className="mt-1 w-full rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <div>
            <label
              htmlFor="register-email"
              className="text-[11px] font-semibold text-muted"
            >
              Email
            </label>
            <input
              id="register-email"
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
              htmlFor="register-password"
              className="text-[11px] font-semibold text-muted"
            >
              Password
            </label>
            <input
              id="register-password"
              type="password"
              value={password}
              disabled={!hydrated || loading}
              onChange={(event) => setPassword(event.target.value)}
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
            disabled={!hydrated || loading}
            className="w-full rounded-xl bg-accent-strong px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent disabled:opacity-60"
          >
            {!hydrated ? "Preparing form..." : loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-4 text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-accent hover:underline">
            Login
          </Link>
        </p>
      </div>
    </section>
  )
}
