import { NextResponse } from "next/server"
import { MAX_SECTIONS_PER_COURSE } from "@/app/app/constants"
import { requireAuthenticatedUser } from "@/app/lib/auth"
import {
  generateCourseSection,
  normalizeCourseLanguage,
} from "@/app/lib/courseTemplates"
import { getSupabaseAdminClient } from "@/app/lib/supabase/admin"
import type { HobbyPlan } from "@/app/api/generate/types"
import { checkRateLimit } from "@/app/lib/rateLimit"
import { logError, logInfo } from "@/app/lib/logger"

type SessionWithTemplateRow = {
  id: string
  template_id: string
  template: {
    hobby: string
    level: string
    language: "en" | "pt"
    plan: HobbyPlan
    sections_generated: number
    section_module_counts: number[]
  } | null
}

export async function POST(
  request: Request,
  context: { params: Promise<{ sessionId: string }> }
) {
  const requestId = crypto.randomUUID()

  try {
    const auth = await requireAuthenticatedUser()
    if (auth.response || !auth.user) {
      return auth.response ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { sessionId } = await context.params
    const rateLimit = await checkRateLimit({
      request,
      namespace: "course-sessions:extend",
      limit: 8,
      windowSeconds: 60 * 10,
      userId: auth.user.id,
    })

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Too many section generation requests. Please wait a few minutes.",
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

    const { data: session, error: sessionError } = await supabase
      .from("user_course_sessions")
      .select(
        "id, template_id, template:course_templates(hobby, level, language, plan, sections_generated, section_module_counts)"
      )
      .eq("id", sessionId)
      .eq("user_id", auth.user.id)
      .maybeSingle()

    if (sessionError) {
      logError({
        event: "course_template_extend_lookup_failed",
        requestId,
        route: "/api/course-sessions/[sessionId]/extend",
        userId: auth.user.id,
        error: sessionError,
      })
      return NextResponse.json({ error: sessionError.message }, { status: 500 })
    }

    const resolvedSession = session as SessionWithTemplateRow | null
    if (!resolvedSession?.template) {
      return NextResponse.json({ error: "Course session not found." }, { status: 404 })
    }

    const template = resolvedSession.template
    if (template.sections_generated >= MAX_SECTIONS_PER_COURSE) {
      return NextResponse.json(
        {
          error: `Section limit reached (${MAX_SECTIONS_PER_COURSE}) for this course.`,
        },
        { status: 400 }
      )
    }

    const nextSection = await generateCourseSection({
      hobby: template.hobby,
      level: template.level,
      language: normalizeCourseLanguage(template.language),
      existingModules: template.plan.modules,
    })

    const addedModules = Array.isArray(nextSection.modules) ? nextSection.modules : []
    if (addedModules.length === 0) {
      return NextResponse.json(
        { error: "AI did not return modules for the next section." },
        { status: 500 }
      )
    }

    const mergedPlan: HobbyPlan = {
      ...template.plan,
      modules: [...template.plan.modules, ...addedModules],
    }
    const nextSectionsGenerated = template.sections_generated + 1
    const nextSectionModuleCounts = [
      ...(template.section_module_counts ?? []),
      addedModules.length,
    ]
    const templateUpdate = {
      plan: mergedPlan,
      icon: mergedPlan.icon || null,
      sections_generated: nextSectionsGenerated,
      section_module_counts: nextSectionModuleCounts,
    }

    const { error: updateTemplateError } = await supabase
      .from("course_templates")
      .update(templateUpdate as never)
      .eq("id", resolvedSession.template_id)

    if (updateTemplateError) {
      logError({
        event: "course_template_extend_update_failed",
        requestId,
        route: "/api/course-sessions/[sessionId]/extend",
        userId: auth.user.id,
        error: updateTemplateError,
      })
      return NextResponse.json(
        { error: updateTemplateError.message },
        { status: 500 }
      )
    }

    logInfo({
      event: "course_template_extended",
      requestId,
      route: "/api/course-sessions/[sessionId]/extend",
      userId: auth.user.id,
      metadata: {
        sessionId,
        templateId: resolvedSession.template_id,
        sectionsGenerated: nextSectionsGenerated,
      },
    })

    return NextResponse.json({
      plan: mergedPlan,
      sectionsGenerated: nextSectionsGenerated,
      sectionModuleCounts: nextSectionModuleCounts,
    })
  } catch (error) {
    logError({
      event: "course_template_extend_failed",
      requestId,
      route: "/api/course-sessions/[sessionId]/extend",
      error,
    })
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to extend shared course template.",
      },
      { status: 500 }
    )
  }
}
