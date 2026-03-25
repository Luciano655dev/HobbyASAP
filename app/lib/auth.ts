import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "./supabase/server"

export async function requireAuthenticatedUser() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return {
      user: null,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    }
  }

  return { user, response: null }
}
