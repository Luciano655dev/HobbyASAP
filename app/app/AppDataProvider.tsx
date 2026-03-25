"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { getSupabaseBrowserClient } from "@/app/lib/supabase/client"
import { useAuth } from "@/components/auth/AuthProvider"
import { INITIAL_STREAK, type SavedSession } from "./hooks/useSessionsHistory"

type PreferredLanguage = "en" | "pt"

type UserSettingsRow = {
  active_session_id: string | null
  preferred_language: PreferredLanguage | null
}

type CourseTemplateRow = {
  id: string
  hobby: string
  level: string
  language: PreferredLanguage
  icon: string | null
  plan: SavedSession["plan"]
  sections_generated: number | null
  section_module_counts: number[] | null
}

type UserCourseSessionRow = {
  id: string
  created_at: string
  template_id: string
  completed_task_ids: string[] | null
  streak: SavedSession["streak"] | null
  lessons: SavedSession["lessons"] | null
  chat_threads: SavedSession["chatThreads"] | null
  active_chat_id: string | null
  questions: SavedSession["questions"] | null
  template: CourseTemplateRow | CourseTemplateRow[] | null
}

type AppDataContextValue = {
  history: SavedSession[]
  currentSessionId: string | null
  currentSession: SavedSession | null
  preferredLanguage: PreferredLanguage
  loading: boolean
  error: string
  saveSnapshot: (snapshot: SavedSession) => Promise<void>
  deleteSession: (id: string) => Promise<void>
  clearAllSessions: () => Promise<void>
  setCurrentSessionId: (id: string | null) => Promise<void>
  setPreferredLanguage: (language: PreferredLanguage) => Promise<void>
  refresh: () => Promise<void>
}

const AppDataContext = createContext<AppDataContextValue | undefined>(undefined)

function normalizeSession(raw: SavedSession): SavedSession {
  const legacyQuestions = Array.isArray(raw.questions) ? raw.questions : []
  const fallbackCreatedAt = raw.createdAt || new Date().toISOString()
  const incomingThreads = Array.isArray(raw.chatThreads)
    ? raw.chatThreads.filter((thread) => thread && typeof thread.id === "string")
    : []
  const chatThreads =
    incomingThreads.length > 0
      ? incomingThreads.map((thread) => ({
          id: thread.id,
          title:
            typeof thread.title === "string" && thread.title.trim()
              ? thread.title.trim()
              : "New chat",
          createdAt:
            typeof thread.createdAt === "string" && thread.createdAt
              ? thread.createdAt
              : fallbackCreatedAt,
          updatedAt:
            typeof thread.updatedAt === "string" && thread.updatedAt
              ? thread.updatedAt
              : fallbackCreatedAt,
          questions: Array.isArray(thread.questions) ? thread.questions : [],
        }))
      : [
          {
            id: `chat_legacy_${raw.id}`,
            title: "New chat",
            createdAt: fallbackCreatedAt,
            updatedAt: fallbackCreatedAt,
            questions: legacyQuestions,
          },
        ]

  const activeChatId =
    typeof raw.activeChatId === "string" &&
    chatThreads.some((thread) => thread.id === raw.activeChatId)
      ? raw.activeChatId
      : chatThreads[0]?.id ?? null

  return {
    ...raw,
    sectionsGenerated:
      typeof raw.sectionsGenerated === "number" && raw.sectionsGenerated > 0
        ? raw.sectionsGenerated
        : 1,
    sectionModuleCounts:
      Array.isArray(raw.sectionModuleCounts) && raw.sectionModuleCounts.length > 0
        ? raw.sectionModuleCounts
        : [raw.plan.modules.length],
    completedTaskIds: Array.isArray(raw.completedTaskIds) ? raw.completedTaskIds : [],
    streak: raw.streak ?? INITIAL_STREAK,
    lessons: Array.isArray(raw.lessons) ? raw.lessons : [],
    chatThreads,
    activeChatId,
    questions:
      chatThreads.find((thread) => thread.id === activeChatId)?.questions ??
      legacyQuestions,
  }
}

function rowToSession(row: UserCourseSessionRow): SavedSession {
  const template = Array.isArray(row.template) ? row.template[0] : row.template

  if (!template) {
    throw new Error("Missing shared course template for user course session.")
  }

  return normalizeSession({
    id: row.id,
    createdAt: row.created_at,
    hobby: template.hobby,
    level: template.level,
    icon: template.icon,
    plan: template.plan,
    sectionsGenerated: template.sections_generated ?? 1,
    sectionModuleCounts: template.section_module_counts ?? [
      template.plan.modules.length,
    ],
    completedTaskIds: row.completed_task_ids ?? [],
    streak: row.streak ?? INITIAL_STREAK,
    lessons: row.lessons ?? [],
    chatThreads: row.chat_threads ?? [],
    activeChatId: row.active_chat_id,
    questions: row.questions ?? [],
  })
}

function sessionToRow(snapshot: SavedSession, userId: string, templateId: string) {
  const normalized = normalizeSession(snapshot)

  return {
    id: normalized.id,
    user_id: userId,
    template_id: templateId,
    created_at: normalized.createdAt,
    completed_task_ids: normalized.completedTaskIds,
    streak: normalized.streak,
    lessons: normalized.lessons,
    chat_threads: normalized.chatThreads ?? [],
    active_chat_id: normalized.activeChatId ?? null,
    questions: normalized.questions,
  }
}

export default function AppDataProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const [history, setHistory] = useState<SavedSession[]>([])
  const [templateIdBySessionId, setTemplateIdBySessionId] = useState<
    Record<string, string>
  >({})
  const [currentSessionId, setCurrentSessionIdState] = useState<string | null>(null)
  const [preferredLanguage, setPreferredLanguageState] =
    useState<PreferredLanguage>("en")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const historyRef = useRef<SavedSession[]>([])
  const currentSessionIdRef = useRef<string | null>(null)
  const preferredLanguageRef = useRef<PreferredLanguage>("en")

  useEffect(() => {
    historyRef.current = history
  }, [history])

  useEffect(() => {
    currentSessionIdRef.current = currentSessionId
  }, [currentSessionId])

  useEffect(() => {
    preferredLanguageRef.current = preferredLanguage
  }, [preferredLanguage])

  const refresh = useCallback(async () => {
    if (!user) {
      setHistory([])
      setTemplateIdBySessionId({})
      setCurrentSessionIdState(null)
      setPreferredLanguageState("en")
      setLoading(false)
      return
    }

    setLoading(true)
    setError("")
    const supabase = getSupabaseBrowserClient()

    const [{ data: sessions, error: sessionsError }, { data: settings, error: settingsError }] =
      await Promise.all([
        supabase
          .from("user_course_sessions")
          .select(
            "id, created_at, template_id, completed_task_ids, streak, lessons, chat_threads, active_chat_id, questions, template:course_templates(id, hobby, level, language, icon, plan, sections_generated, section_module_counts)"
          )
          .order("created_at", { ascending: false }),
        supabase
          .from("user_settings")
          .select("active_session_id, preferred_language")
          .maybeSingle(),
      ])

    if (sessionsError || settingsError) {
      setError(sessionsError?.message || settingsError?.message || "Failed to sync.")
      setLoading(false)
      return
    }

    const nextHistory = Array.isArray(sessions)
      ? sessions
          .filter((row) => !!(row as unknown as UserCourseSessionRow).template)
          .map((row) => rowToSession(row as unknown as UserCourseSessionRow))
      : []
    const nextTemplateMap = Array.isArray(sessions)
      ? Object.fromEntries(
          sessions
            .filter((row) => {
              const typedRow = row as unknown as UserCourseSessionRow
              return typeof typedRow.id === "string" && typeof typedRow.template_id === "string"
            })
            .map((row) => {
              const typedRow = row as unknown as UserCourseSessionRow
              return [typedRow.id, typedRow.template_id]
            })
        )
      : {}
    const resolvedCurrentSessionId =
      (settings as UserSettingsRow | null)?.active_session_id &&
      nextHistory.some(
        (session) =>
          session.id === (settings as UserSettingsRow | null)?.active_session_id
      )
        ? (settings as UserSettingsRow).active_session_id
        : nextHistory[0]?.id ?? null
    const resolvedLanguage =
      (settings as UserSettingsRow | null)?.preferred_language === "pt" ? "pt" : "en"

    setHistory(nextHistory)
    setTemplateIdBySessionId(nextTemplateMap)
    setCurrentSessionIdState(resolvedCurrentSessionId)
    setPreferredLanguageState(resolvedLanguage)

    await supabase.from("user_settings").upsert({
      user_id: user.id,
      active_session_id: resolvedCurrentSessionId,
      preferred_language: resolvedLanguage,
    })

    setLoading(false)
  }, [user])

  useEffect(() => {
    if (authLoading) return
    const timeoutId = window.setTimeout(() => {
      void refresh()
    }, 0)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [authLoading, refresh])

  const persistSettings = useCallback(
    async (updates: Partial<UserSettingsRow>) => {
      if (!user) return
      const supabase = getSupabaseBrowserClient()
      const { error: upsertError } = await supabase.from("user_settings").upsert({
        user_id: user.id,
        active_session_id:
          updates.active_session_id !== undefined
            ? updates.active_session_id
            : currentSessionIdRef.current,
        preferred_language:
          updates.preferred_language !== undefined
            ? updates.preferred_language
            : preferredLanguageRef.current,
      })

      if (upsertError) {
        setError(upsertError.message)
      }
    },
    [user]
  )

  const setCurrentSessionId = useCallback(
    async (id: string | null) => {
      setCurrentSessionIdState(id)
      await persistSettings({ active_session_id: id })
    },
    [persistSettings]
  )

  const setPreferredLanguage = useCallback(
    async (language: PreferredLanguage) => {
      setPreferredLanguageState(language)
      await persistSettings({ preferred_language: language })
    },
    [persistSettings]
  )

  const saveSnapshot = useCallback(
    async (snapshot: SavedSession) => {
      if (!user) return

      const normalized = normalizeSession(snapshot)
      const templateId = templateIdBySessionId[snapshot.id]

      if (!templateId) {
        setError("Missing shared template reference for this saved course.")
        return
      }

      setHistory((prev) => {
        const next = [normalized, ...prev.filter((item) => item.id !== normalized.id)]
        return next.slice(0, 20)
      })

      if (!currentSessionIdRef.current) {
        setCurrentSessionIdState(normalized.id)
      }

      const supabase = getSupabaseBrowserClient()
      const { error: upsertError } = await supabase
        .from("user_course_sessions")
        .upsert(sessionToRow(normalized, user.id, templateId))

      if (upsertError) {
        setError(upsertError.message)
        return
      }

      if (!currentSessionIdRef.current) {
        await persistSettings({ active_session_id: normalized.id })
      }
    },
    [persistSettings, templateIdBySessionId, user]
  )

  const deleteSession = useCallback(
    async (id: string) => {
      if (!user) return

      const nextHistory = historyRef.current.filter((session) => session.id !== id)
      setHistory(nextHistory)

      const nextCurrentSessionId =
        currentSessionIdRef.current === id ? nextHistory[0]?.id ?? null : currentSessionIdRef.current

      if (nextCurrentSessionId !== currentSessionIdRef.current) {
        setCurrentSessionIdState(nextCurrentSessionId)
      }

      const supabase = getSupabaseBrowserClient()
      const { error: deleteError } = await supabase
        .from("user_course_sessions")
        .delete()
        .eq("id", id)

      if (deleteError) {
        setError(deleteError.message)
      }

      if (nextCurrentSessionId !== currentSessionIdRef.current) {
        await persistSettings({ active_session_id: nextCurrentSessionId })
      }

      setTemplateIdBySessionId((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      })
    },
    [persistSettings, user]
  )

  const clearAllSessions = useCallback(async () => {
    if (!user) return

    setHistory([])
    setCurrentSessionIdState(null)

    const supabase = getSupabaseBrowserClient()
    const { error: deleteError } = await supabase
      .from("user_course_sessions")
      .delete()
      .eq("user_id", user.id)

    if (deleteError) {
      setError(deleteError.message)
      return
    }

    setTemplateIdBySessionId({})
    await persistSettings({ active_session_id: null })
  }, [persistSettings, user])

  const currentSession = useMemo(() => {
    if (!history.length) return null
    if (!currentSessionId) return history[0]
    return history.find((session) => session.id === currentSessionId) ?? history[0]
  }, [currentSessionId, history])

  const value = useMemo(
    () => ({
      history,
      currentSessionId,
      currentSession,
      preferredLanguage,
      loading: authLoading || loading,
      error,
      saveSnapshot,
      deleteSession,
      clearAllSessions,
      setCurrentSessionId,
      setPreferredLanguage,
      refresh,
    }),
    [
      authLoading,
      clearAllSessions,
      currentSession,
      currentSessionId,
      deleteSession,
      error,
      history,
      loading,
      preferredLanguage,
      refresh,
      saveSnapshot,
      setCurrentSessionId,
      setPreferredLanguage,
    ]
  )

  return (
    <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
  )
}

export function useAppData() {
  const context = useContext(AppDataContext)

  if (!context) {
    throw new Error("useAppData must be used inside AppDataProvider.")
  }

  return context
}
