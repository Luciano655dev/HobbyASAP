"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"

const STORAGE_KEY = "hobbyasap_theme"

type Theme = "light" | "dark"

function applyTheme(next: Theme) {
  if (typeof document === "undefined") return
  document.documentElement.dataset.theme = next
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "light"
    const saved = localStorage.getItem(STORAGE_KEY)
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    return saved === "light" || saved === "dark"
      ? saved
      : prefersDark
      ? "dark"
      : "light"
  })

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

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
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-text shadow-sm transition hover:border-accent/50 hover:bg-surface-2"
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  )
}
