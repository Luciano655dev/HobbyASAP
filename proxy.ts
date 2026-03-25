import { NextResponse, type NextRequest } from "next/server"
import { createSupabaseMiddlewareClient } from "@/app/lib/supabase/middleware"

const protectedAppPrefix = "/app"
const protectedApiPrefixes = [
  "/api/ask",
  "/api/generate",
  "/api/lesson",
  "/api/course-sessions",
]
const authPages = new Set(["/login", "/register"])

function hasE2EAuthBypass(request: NextRequest) {
  return (
    process.env.E2E_AUTH_BYPASS === "1" &&
    request.cookies.get("hobbyasap_e2e_auth")?.value === "1"
  )
}

function isProtectedApiPath(pathname: string) {
  return protectedApiPrefixes.some(
    (protectedPrefix) =>
      pathname === protectedPrefix || pathname.startsWith(`${protectedPrefix}/`)
  )
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  if (hasE2EAuthBypass(request)) {
    return NextResponse.next()
  }

  const { supabase, getResponse } = createSupabaseMiddlewareClient(request)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (
    (pathname === protectedAppPrefix ||
      pathname.startsWith(`${protectedAppPrefix}/`)) &&
    !user
  ) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("next", pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isProtectedApiPath(pathname) && !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (authPages.has(pathname) && user) {
    return NextResponse.redirect(new URL("/app", request.url))
  }

  return getResponse()
}

export const config = {
  matcher: [
    "/app/:path*",
    "/api/ask/:path*",
    "/api/generate/:path*",
    "/api/lesson/:path*",
    "/api/course-sessions/:path*",
    "/login",
    "/register",
  ],
}
