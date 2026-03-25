import { NextResponse } from "next/server"
import { requireAuthenticatedUser } from "@/app/lib/auth"
import {
  generateCourseSection,
  normalizeCourseHobby,
  normalizeCourseLanguage,
  normalizeCourseLevel,
} from "@/app/lib/courseTemplates"
import { getSupabaseAdminClient } from "@/app/lib/supabase/admin"
import { logError, logInfo } from "@/app/lib/logger"
import { checkRateLimit } from "@/app/lib/rateLimit"

type CourseTemplateRow = {
  id: string
  hobby: string
  normalized_hobby: string
  level: string
  language: "en" | "pt"
  icon: string | null
  plan: unknown
  sections_generated: number
  section_module_counts: number[]
}

type ExistingSessionRow = {
  id: string
}

const INITIAL_STREAK = {
  current: 0,
  longest: 0,
  lastActiveDate: null,
}

export async function POST(request: Request) {
  const requestId = crypto.randomUUID()

  try {
    const auth = await requireAuthenticatedUser()
    if (auth.response || !auth.user) {
      return auth.response ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json().catch(() => null)
    const hobby =
      typeof body?.hobby === "string" ? body.hobby.trim() : ""
    const level =
      typeof body?.level === "string" && body.level.trim()
        ? body.level.trim()
        : "complete beginner"
    const language = normalizeCourseLanguage(body?.language)

    if (!hobby) {
      return NextResponse.json({ error: "Hobby is required." }, { status: 400 })
    }

    const rateLimit = await checkRateLimit({
      request,
      namespace: "course-sessions:create",
      limit: 8,
      windowSeconds: 60 * 10,
      userId: auth.user.id,
    })

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Too many course generation requests. Please wait a few minutes.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfterSeconds),
          },
        }
      )
    }

    const supabase = getSupabaseAdminClient()
    const normalizedHobby = normalizeCourseHobby(hobby)
    const normalizedLevel = normalizeCourseLevel(level)

    let template: CourseTemplateRow | null = null
    const { data: existingTemplate, error: existingTemplateError } = await supabase
      .from("course_templates")
      .select(
        "id, hobby, normalized_hobby, level, language, icon, plan, sections_generated, section_module_counts"
      )
      .eq("normalized_hobby", normalizedHobby)
      .eq("level", normalizedLevel)
      .eq("language", language)
      .maybeSingle()

    if (existingTemplateError) {
      logError({
        event: "course_template_lookup_failed",
        requestId,
        route: "/api/course-sessions",
        userId: auth.user.id,
        error: existingTemplateError,
      })
      return NextResponse.json(
        { error: existingTemplateError.message },
        { status: 500 }
      )
    }

    template = (existingTemplate as CourseTemplateRow | null) ?? null

    if (!template) {
      logInfo({
        event: "course_template_cache_miss",
        requestId,
        route: "/api/course-sessions",
        userId: auth.user.id,
        metadata: {
          hobby: normalizedHobby,
          level: normalizedLevel,
          language,
        },
      })
      const plan = await generateCourseSection({
        hobby,
        level,
        language,
      })
      const templateInsert = {
        hobby: hobby.trim(),
        normalized_hobby: normalizedHobby,
        level: normalizedLevel,
        language,
        icon: plan.icon || null,
        plan,
        sections_generated: 1,
        section_module_counts: [plan.modules.length],
      }

      const { data: insertedTemplate, error: insertTemplateError } = await supabase
        .from("course_templates")
        .insert(templateInsert as never)
        .select(
          "id, hobby, normalized_hobby, level, language, icon, plan, sections_generated, section_module_counts"
        )
        .maybeSingle()

      if (insertTemplateError) {
        const { data: racedTemplate, error: racedTemplateError } = await supabase
          .from("course_templates")
          .select(
            "id, hobby, normalized_hobby, level, language, icon, plan, sections_generated, section_module_counts"
          )
          .eq("normalized_hobby", normalizedHobby)
          .eq("level", normalizedLevel)
          .eq("language", language)
          .maybeSingle()

        if (racedTemplateError || !racedTemplate) {
          logError({
            event: "course_template_insert_failed",
            requestId,
            route: "/api/course-sessions",
            userId: auth.user.id,
            error: insertTemplateError,
          })
          return NextResponse.json(
            { error: insertTemplateError.message },
            { status: 500 }
          )
        }

        template = racedTemplate as CourseTemplateRow
      } else {
        template = insertedTemplate as CourseTemplateRow | null
      }
    }

    if (!template) {
      logError({
        event: "course_template_resolution_failed",
        requestId,
        route: "/api/course-sessions",
        userId: auth.user.id,
      })
      return NextResponse.json(
        { error: "Failed to resolve shared course template." },
        { status: 500 }
      )
    }

    logInfo({
      event: "course_template_resolved",
      requestId,
      route: "/api/course-sessions",
      userId: auth.user.id,
      metadata: {
        templateId: template.id,
        reused: !!existingTemplate,
      },
    })

    const { data: existingSessionData, error: existingSessionError } = await supabase
      .from("user_course_sessions")
      .select("id")
      .eq("user_id", auth.user.id)
      .eq("template_id", template.id)
      .maybeSingle()

    if (existingSessionError) {
      logError({
        event: "user_course_session_lookup_failed",
        requestId,
        route: "/api/course-sessions",
        userId: auth.user.id,
        error: existingSessionError,
      })
      return NextResponse.json(
        { error: existingSessionError.message },
        { status: 500 }
      )
    }

    const existingSession = existingSessionData as ExistingSessionRow | null

    if (existingSession?.id) {
      logInfo({
        event: "user_course_session_reused",
        requestId,
        route: "/api/course-sessions",
        userId: auth.user.id,
        metadata: {
          sessionId: existingSession.id,
          templateId: template.id,
        },
      })
      return NextResponse.json({
        sessionId: existingSession.id,
        templateId: template.id,
        reusedTemplate: true,
        existingSession: true,
      })
    }

    const createdAt = new Date().toISOString()
    const chatId = `chat_${crypto.randomUUID()}`
    const sessionId = crypto.randomUUID()
    const sessionInsert = {
      id: sessionId,
      user_id: auth.user.id,
      template_id: template.id,
      created_at: createdAt,
      completed_task_ids: [],
      streak: INITIAL_STREAK,
      lessons: [],
      chat_threads: [
        {
          id: chatId,
          title: "New chat",
          createdAt,
          updatedAt: createdAt,
          questions: [],
        },
      ],
      active_chat_id: chatId,
      questions: [],
    }

    const { error: insertSessionError } = await supabase
      .from("user_course_sessions")
      .insert(sessionInsert as never)

    if (insertSessionError) {
      logError({
        event: "user_course_session_insert_failed",
        requestId,
        route: "/api/course-sessions",
        userId: auth.user.id,
        error: insertSessionError,
      })
      return NextResponse.json(
        { error: insertSessionError.message },
        { status: 500 }
      )
    }

    logInfo({
      event: "user_course_session_created",
      requestId,
      route: "/api/course-sessions",
      userId: auth.user.id,
      metadata: {
        sessionId,
        templateId: template.id,
      },
    })

    return NextResponse.json({
      sessionId,
      templateId: template.id,
      reusedTemplate: true,
      existingSession: false,
    })
  } catch (error) {
    logError({
      event: "course_session_request_failed",
      requestId,
      route: "/api/course-sessions",
      error,
    })
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create course session.",
      },
      { status: 500 }
    )
  }
}
