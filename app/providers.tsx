import type { ReactNode } from "react"
import type { User } from "@supabase/supabase-js"
import AuthProvider from "@/components/auth/AuthProvider"

export default function Providers({
  children,
  initialUser,
}: {
  children: ReactNode
  initialUser: User | null
}) {
  return <AuthProvider initialUser={initialUser}>{children}</AuthProvider>
}
