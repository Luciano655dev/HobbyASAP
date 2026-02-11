"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
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
    if (!currentSession) return
    saveSnapshot({
      ...currentSession,
      questions: [...currentSession.questions, item],
    })
  }

  function handleQuestionDeleted(id: string) {
    if (!currentSession) return
    saveSnapshot({
      ...currentSession,
      questions: currentSession.questions.filter((q) => q.id !== id),
    })
  }

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      {!currentSession ? (
        <p className="text-sm text-muted">Select a course in Courses.</p>
      ) : (
        <AskQuestionPanel
          plan={currentSession.plan}
          lessons={currentSession.lessons}
          questions={currentSession.questions}
          onQuestionAdded={handleQuestionAdded}
          onQuestionDeleted={handleQuestionDeleted}
          onInDepthRequest={openInDepth}
          lessonLoading={lessonLoading}
        />
      )}
    </section>
  )
}
