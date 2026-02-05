"use client"

import { useEffect, useState } from "react"

const STORAGE_KEY = "hobbyasap_theme"

type Theme = "light" | "dark"

function applyTheme(next: Theme) {
  if (typeof document === "undefined") return
  document.documentElement.dataset.theme = next
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light")

  useEffect(() => {
    if (typeof window === "undefined") return
    const saved = localStorage.getItem(STORAGE_KEY)
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches
    const next: Theme =
      saved === "light" || saved === "dark"
        ? saved
        : prefersDark
        ? "dark"
        : "light"
    setTheme(next)
    applyTheme(next)
  }, [])

  function toggleTheme() {
    const next: Theme = theme === "dark" ? "light" : "dark"
    setTheme(next)
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, next)
    }
    applyTheme(next)
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle color theme"
      className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-[11px] font-semibold text-text shadow-sm transition hover:border-accent/50 hover:bg-surface-2"
    >
      <span className="text-base">{theme === "dark" ? "🌙" : "☀️"}</span>
      <span>{theme === "dark" ? "Dark" : "Light"}</span>
    </button>
  )
}
