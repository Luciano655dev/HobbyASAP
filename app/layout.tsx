import "./globals.css"
import RootChrome from "@/components/layout/RootChrome"
import Providers from "./providers"
import { getSupabaseServerClient } from "./lib/supabase/server"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabasePromise = getSupabaseServerClient()

  return (
    <html lang="en" suppressHydrationWarning data-theme="light">
      <body className="min-h-screen bg-app-bg text-text relative">
        <ResolvedProviders supabasePromise={supabasePromise}>
          <RootChrome>{children}</RootChrome>
        </ResolvedProviders>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}

async function ResolvedProviders({
  children,
  supabasePromise,
}: {
  children: React.ReactNode
  supabasePromise: ReturnType<typeof getSupabaseServerClient>
}) {
  const supabase = await supabasePromise
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return <Providers initialUser={user}>{children}</Providers>
}

export const metadata = {
  title: "HobbyASAP",
  description:
    "AI-powered learning paths, deep dives, quests, levels, and streaks.",
  icons: {
    icon: "/Logo.png",
    apple: "/Logo.png",
  },
}
