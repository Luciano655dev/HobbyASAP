import "./globals.css"
import RootChrome from "@/components/layout/RootChrome"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning data-theme="light">
      <body className="min-h-screen bg-app-bg text-text relative">
        <RootChrome>{children}</RootChrome>
      </body>
    </html>
  )
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
