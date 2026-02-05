import "./globals.css"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
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
        <Navbar />

        <main>{children}</main>

        <Footer />
      </body>
    </html>
  )
}

export const metadata = {
  title: "HobbyASAP",
  description:
    "AI-powered learning paths, masterclasses, quests, Levels, and streaks.",
  icons: {
    icon: "/logo.png",
  },
}
