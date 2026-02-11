"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Bot, MessageSquare, Plus, Trash2 } from "lucide-react"
import AskQuestionPanel, { type QAItem } from "../AskQuestionPanel"
import { type Lesson } from "../types"
import { useSessionsHistory } from "../hooks/useSessionsHistory"
import { LS_CURRENT_SESSION_KEY } from "../constants"

export default function AiChatPage() {
  const router = useRouter()
  const { history, saveSnapshot } = useSessionsHistory()
  const [lessonLoading, setLessonLoading] = useState(false)

  const currentSession = useMemo(() => {
    if (typeof window === "undefined") return null
    const currentId = localStorage.getItem(LS_CURRENT_SESSION_KEY)
    if (!currentId) return null
    return history.find((item) => item.id === currentId) ?? null
  }, [history])

  const chatThreads = useMemo(() => {
    if (!currentSession) return []
    const threads = Array.isArray(currentSession.chatThreads)
      ? currentSession.chatThreads
      : []
    if (threads.length > 0) return threads

    const fallbackCreatedAt = currentSession.createdAt || new Date().toISOString()
    return [
      {
        id: `chat_legacy_${currentSession.id}`,
        title: "New chat",
        createdAt: fallbackCreatedAt,
        updatedAt: fallbackCreatedAt,
        questions: currentSession.questions ?? [],
      },
    ]
  }, [currentSession])

  const activeChatId = useMemo(() => {
    if (!currentSession || chatThreads.length === 0) return null
    const sessionActiveId = currentSession.activeChatId
    if (sessionActiveId && chatThreads.some((thread) => thread.id === sessionActiveId)) {
      return sessionActiveId
    }
    return chatThreads[0].id
  }, [currentSession, chatThreads])

  const activeChat = useMemo(() => {
    if (!activeChatId) return null
    return chatThreads.find((thread) => thread.id === activeChatId) ?? null
  }, [chatThreads, activeChatId])

  const orderedThreads = useMemo(() => {
    return [...chatThreads].sort((a, b) => {
      const aTime = new Date(a.updatedAt).getTime()
      const bTime = new Date(b.updatedAt).getTime()
      return bTime - aTime
    })
  }, [chatThreads])

  function formatThreadDate(value: string) {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return "recently"
    return date.toLocaleDateString()
  }

  function createChatTitleFromQuestion(text: string) {
    const trimmed = text.trim()
    if (!trimmed) return "New chat"
    return trimmed.length > 48 ? `${trimmed.slice(0, 48)}...` : trimmed
  }

  function saveSessionChats(
    nextThreads: typeof chatThreads,
    requestedActiveChatId?: string | null
  ) {
    if (!currentSession) return
    const resolvedActiveChatId =
      requestedActiveChatId &&
      nextThreads.some((thread) => thread.id === requestedActiveChatId)
        ? requestedActiveChatId
        : nextThreads[0]?.id ?? null
    const activeQuestions =
      nextThreads.find((thread) => thread.id === resolvedActiveChatId)?.questions ?? []

    saveSnapshot({
      ...currentSession,
      chatThreads: nextThreads,
      activeChatId: resolvedActiveChatId,
      questions: activeQuestions,
    })
  }

  function handleNewChat() {
    if (!currentSession) return
    const now = new Date().toISOString()
    const newChat = {
      id: `chat_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      title: "New chat",
      createdAt: now,
      updatedAt: now,
      questions: [] as QAItem[],
    }
    saveSessionChats([newChat, ...chatThreads], newChat.id)
  }

  function handleSelectChat(chatId: string) {
    saveSessionChats(chatThreads, chatId)
  }

  function handleDeleteChat(chatId: string) {
    if (!currentSession) return
    const remaining = chatThreads.filter((thread) => thread.id !== chatId)
    if (remaining.length === 0) {
      const now = new Date().toISOString()
      const replacement = {
        id: `chat_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        title: "New chat",
        createdAt: now,
        updatedAt: now,
        questions: [] as QAItem[],
      }
      saveSessionChats([replacement], replacement.id)
      return
    }

    const nextActiveId = activeChatId === chatId ? remaining[0].id : activeChatId
    saveSessionChats(remaining, nextActiveId)
  }

  async function openInDepth(topic: string) {
    if (!currentSession) return
    setLessonLoading(true)

    try {
      const language = localStorage.getItem("hobbyasap_lang") ?? "en"
      const res = await fetch("/api/lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hobby: currentSession.plan.hobby,
          level: currentSession.plan.level,
          kind: "inDepth",
          topic,
          language,
        }),
      })
      if (!res.ok) return
      const data = await res.json()
      const lesson = data.lesson as Lesson

      saveSnapshot({
        ...currentSession,
        lessons: [...currentSession.lessons, lesson],
      })
      router.push("/app/deep-dives?openLatest=1")
    } finally {
      setLessonLoading(false)
    }
  }

  function handleQuestionAdded(item: QAItem) {
    if (!activeChat) return
    const nextThreads = chatThreads.map((thread) => {
      if (thread.id !== activeChat.id) return thread
      const nextQuestions = [...thread.questions, item]
      const shouldRename =
        thread.questions.length === 0 || thread.title === "New chat"
      return {
        ...thread,
        title: shouldRename
          ? createChatTitleFromQuestion(item.question)
          : thread.title,
        updatedAt: new Date().toISOString(),
        questions: nextQuestions,
      }
    })
    saveSessionChats(nextThreads, activeChat.id)
  }

  function handleQuestionDeleted(id: string) {
    if (!activeChat) return
    const nextThreads = chatThreads.map((thread) => {
      if (thread.id !== activeChat.id) return thread
      return {
        ...thread,
        updatedAt: new Date().toISOString(),
        questions: thread.questions.filter((q) => q.id !== id),
      }
    })
    saveSessionChats(nextThreads, activeChat.id)
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-6 pb-24 sm:px-6 sm:py-8 sm:pb-8">
      {!currentSession ? (
        <p className="text-sm text-muted">Select a course in Courses.</p>
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-linear-to-r from-surface to-surface-2 p-4 shadow-sm sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-lg font-semibold tracking-tight text-text">
                  AI Chat
                </h1>
                <p className="mt-1 text-xs text-muted sm:text-sm">
                  Ask focused questions and choose exactly which context to include.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-[11px] text-muted">
                <Bot className="h-3.5 w-3.5" />
                <span>{currentSession.hobby}</span>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[17rem_1fr]">
          <aside className="rounded-2xl border border-border bg-surface/90 p-3 shadow-sm md:sticky md:top-4 md:h-[calc(100vh-11rem)] md:overflow-hidden">
            <button
              type="button"
              onClick={handleNewChat}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent-strong px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-accent"
            >
              <Plus className="h-4 w-4" />
              New chat
            </button>

            <div className="mt-3 max-h-56 space-y-2 overflow-y-auto pr-1 md:max-h-[calc(100%-3.25rem)]">
              {orderedThreads.map((thread) => {
                const isActive = thread.id === activeChatId
                return (
                  <div
                    key={thread.id}
                    className={`flex items-center gap-2 rounded-xl border px-2 py-2 transition ${
                      isActive
                        ? "border-accent/50 bg-accent-soft shadow-sm"
                        : "border-border bg-surface hover:bg-surface-2"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleSelectChat(thread.id)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <p className="truncate text-xs font-semibold text-text">
                        {thread.title}
                      </p>
                      <p className="mt-0.5 text-[10px] text-muted">
                        {thread.questions.length} messages ·{" "}
                        {formatThreadDate(thread.updatedAt)}
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteChat(thread.id)}
                      className="rounded-md p-1 text-muted hover:bg-danger/10 hover:text-danger"
                      aria-label="Delete chat"
                      title="Delete chat"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )
              })}
            </div>
          </aside>

          <div>
            <div className="mb-2 inline-flex max-w-full items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-[11px] text-muted">
              <MessageSquare className="h-3.5 w-3.5" />
              <span className="truncate">
                {activeChat?.title ?? "New chat"}
              </span>
            </div>
            <AskQuestionPanel
              plan={currentSession.plan}
              lessons={currentSession.lessons}
              questions={activeChat?.questions ?? []}
              onQuestionAdded={handleQuestionAdded}
              onQuestionDeleted={handleQuestionDeleted}
              onInDepthRequest={openInDepth}
              lessonLoading={lessonLoading}
            />
          </div>
          </div>
        </div>
      )}
    </section>
  )
}
