import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/app/lib/supabase/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const tokenHash = requestUrl.searchParams.get("token_hash")
  const type = requestUrl.searchParams.get("type")
  const next = requestUrl.searchParams.get("next")
  const redirectTo = next ? new URL(next, requestUrl.origin) : null

  try {
    const supabase = await getSupabaseServerClient()

    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        return NextResponse.redirect(
          new URL(
            `/auth/confirmed?status=error&message=${encodeURIComponent(error.message)}`,
            requestUrl.origin
          )
        )
      }

      if (redirectTo) {
        return NextResponse.redirect(redirectTo)
      }

      return NextResponse.redirect(new URL("/auth/confirmed", requestUrl.origin))
    }

    if (tokenHash && type) {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: type as
          | "signup"
          | "recovery"
          | "email_change"
          | "email"
          | "invite"
          | "magiclink",
      })

      if (error) {
        return NextResponse.redirect(
          new URL(
            `/auth/confirmed?status=error&message=${encodeURIComponent(error.message)}`,
            requestUrl.origin
          )
        )
      }

      if (redirectTo) {
        return NextResponse.redirect(redirectTo)
      }

      return NextResponse.redirect(new URL("/auth/confirmed", requestUrl.origin))
    }

    return NextResponse.redirect(
      new URL(
        "/auth/confirmed?status=error&message=Missing+confirmation+token.",
        requestUrl.origin
      )
    )
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Authentication callback failed."
    return NextResponse.redirect(
      new URL(
        `/auth/confirmed?status=error&message=${encodeURIComponent(message)}`,
        requestUrl.origin
      )
    )
  }
}
