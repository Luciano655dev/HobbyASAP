import "./globals.css"
import RootChrome from "@/components/layout/RootChrome"
import { Nunito } from "next/font/google"

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-app",
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={nunito.variable}
      suppressHydrationWarning
      data-theme="light"
    >
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
