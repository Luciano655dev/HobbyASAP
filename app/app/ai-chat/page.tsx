"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Bot, Plus, Trash2 } from "lucide-react"
import AskQuestionPanel, { type QAItem } from "../AskQuestionPanel"
import { type Lesson } from "../types"
import { useSessionsHistory } from "../hooks/useSessionsHistory"
import {
  MAX_CHAT_THREADS_PER_COURSE,
  MAX_DEEP_DIVES_PER_COURSE,
  MAX_QUESTIONS_TOTAL,
} from "../constants"
import ConfirmModal from "../components/ConfirmModal"
import { useAppData } from "../AppDataProvider"

export default function AiChatPage() {
  const router = useRouter()
  const { history, saveSnapshot } = useSessionsHistory()
  const { currentSession, preferredLanguage } = useAppData()
  const [lessonLoading, setLessonLoading] = useState(false)
  const [pendingDeleteChatId, setPendingDeleteChatId] = useState<string | null>(
    null
  )
  const [chatLimitError, setChatLimitError] = useState("")

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

  const totalQuestionCount = useMemo(() => {
    return history.reduce((total, session) => {
      if (Array.isArray(session.chatThreads) && session.chatThreads.length > 0) {
        return (
          total +
          session.chatThreads.reduce(
            (sum, thread) => sum + thread.questions.length,
            0
          )
        )
      }
      return total + session.questions.length
    }, 0)
  }, [history])

  const questionLimitReached = totalQuestionCount >= MAX_QUESTIONS_TOTAL
  const questionRemaining = Math.max(0, MAX_QUESTIONS_TOTAL - totalQuestionCount)
  const chatLimitReached = chatThreads.length >= MAX_CHAT_THREADS_PER_COURSE
  const deepDiveLimitReached = (currentSession?.lessons.length ?? 0) >= MAX_DEEP_DIVES_PER_COURSE

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
    if (chatLimitReached) {
      setChatLimitError(
        `Chat limit reached (${MAX_CHAT_THREADS_PER_COURSE}) for this course.`
      )
      return
    }
    setChatLimitError("")
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

  const pendingDeleteThread = pendingDeleteChatId
    ? chatThreads.find((thread) => thread.id === pendingDeleteChatId) ?? null
    : null

  async function openInDepth(topic: string) {
    if (!currentSession) return
    if (deepDiveLimitReached) return
    setLessonLoading(true)

    try {
      const res = await fetch("/api/lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hobby: currentSession.plan.hobby,
          level: currentSession.plan.level,
          kind: "inDepth",
          topic,
          language: preferredLanguage,
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
    if (questionLimitReached) return
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
          <div>
            <h1 className="text-2xl font-bold text-text">AI Chat</h1>
            <p className="mt-1 text-sm text-muted">
              Ask focused questions and choose exactly which context to include.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_17rem] md:h-[calc(100vh-11rem)]">
          <div className="min-w-0 md:h-full">
            <AskQuestionPanel
              plan={currentSession.plan}
              lessons={currentSession.lessons}
              questions={activeChat?.questions ?? []}
              onQuestionAdded={handleQuestionAdded}
              onQuestionDeleted={handleQuestionDeleted}
              onInDepthRequest={openInDepth}
              lessonLoading={lessonLoading}
              questionLimitReached={questionLimitReached}
              questionRemaining={questionRemaining}
              questionLimit={MAX_QUESTIONS_TOTAL}
            />
          </div>

          <aside className="rounded-2xl border border-border bg-surface/90 p-3 shadow-sm md:h-full md:overflow-hidden">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-[11px] text-muted">
              <Bot className="h-3.5 w-3.5" />
              <span>{currentSession.hobby}</span>
            </div>
            <button
              type="button"
              onClick={handleNewChat}
              disabled={chatLimitReached}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent-strong px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus className="h-4 w-4" />
              New chat
            </button>
            <p className="mt-1 text-[10px] text-muted">
              Chats: {chatThreads.length}/{MAX_CHAT_THREADS_PER_COURSE}
            </p>
            <p className="mt-0.5 text-[10px] text-muted">
              AI questions: {totalQuestionCount}/{MAX_QUESTIONS_TOTAL}
            </p>
            <p className="mt-0.5 text-[10px] text-muted">
              Deep dives: {currentSession.lessons.length}/{MAX_DEEP_DIVES_PER_COURSE}
            </p>
            {chatLimitError && (
              <p className="mt-1 rounded-lg border border-danger/40 bg-danger/10 px-2 py-1 text-[10px] text-danger">
                {chatLimitError}
              </p>
            )}

            <div className="mt-3 max-h-56 space-y-2 overflow-y-auto pr-1 md:max-h-[calc(100%-4.75rem)]">
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
                      onClick={() => setPendingDeleteChatId(thread.id)}
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
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!pendingDeleteChatId}
        title="Delete chat?"
        message={
          pendingDeleteThread
            ? `Are you sure you want to delete \"${pendingDeleteThread.title}\"?`
            : "Are you sure you want to delete this chat?"
        }
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          if (pendingDeleteChatId) {
            handleDeleteChat(pendingDeleteChatId)
          }
          setPendingDeleteChatId(null)
        }}
        onCancel={() => setPendingDeleteChatId(null)}
      />
    </section>
  )
}
