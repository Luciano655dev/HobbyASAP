"use client"

import { usePathname } from "next/navigation"
import Navbar from "./Navbar"
import Footer from "./Footer"

export default function RootChrome({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isAppRoute = pathname?.startsWith("/app")

  return (
    <>
      <Navbar />
      <main>{children}</main>
      {!isAppRoute ? <Footer /> : null}
    </>
  )
}
