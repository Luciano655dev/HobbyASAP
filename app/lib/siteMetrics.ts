import "server-only"

import { getRedis } from "@/app/lib/redis"
import { getSupabaseAdminClient } from "@/app/lib/supabase/admin"

export type SiteMetricKey = "prompt" | "new_user"

type LogSiteMetricEventParams = {
  metricKey: SiteMetricKey
  userId?: string | null
  metadata?: Record<string, unknown>
}

type CourseTemplateMetricRow = {
  section_module_counts: number[] | null
}

export async function logSiteMetricEvent({
  metricKey,
  userId = null,
  metadata = {},
}: LogSiteMetricEventParams) {
  const supabase = getSupabaseAdminClient()
  const { error } = await supabase.from("site_metric_events").insert({
    metric_key: metricKey,
    user_id: userId,
    metadata,
  } as never)

  if (error) {
    const duplicateNewUserMetric =
      metricKey === "new_user" &&
      (error.code === "23505" ||
        error.message.toLowerCase().includes("duplicate key"))

    if (!duplicateNewUserMetric) {
      throw error
    }
  }
}

export async function getSiteMetrics() {
  const supabase = getSupabaseAdminClient()
  const redis = getRedis()

  const getLegacyMetric = async (key: string) => {
    if (!redis) return 0

    try {
      const value = await redis.get(key)
      return Number(value ?? 0)
    } catch (error) {
      console.warn(`Failed to read legacy metric ${key}:`, error)
      return 0
    }
  }

  const [
    { data: courseTemplates, error: courseTemplatesError },
    { count: users, error: usersError },
    legacyModules,
    legacyUsers,
  ] = await Promise.all([
    supabase
      .from("course_templates")
      .select("section_module_counts"),
    supabase
      .from("user_settings")
      .select("*", { count: "exact", head: true })
      .limit(0),
    getLegacyMetric("metrics:prompts"),
    getLegacyMetric("metrics:users"),
  ])

  if (courseTemplatesError) {
    throw courseTemplatesError
  }

  if (usersError) {
    throw usersError
  }

  const modules =
    (courseTemplates as CourseTemplateMetricRow[] | null)?.reduce((total, template) => {
      const counts = Array.isArray(template.section_module_counts)
        ? template.section_module_counts
        : []

      return (
        total +
        counts.reduce(
          (countTotal, count) =>
            countTotal + (typeof count === "number" ? count : 0),
          0
        )
      )
    }, 0) ?? 0

  return {
    lessons: modules + legacyModules,
    users: (users ?? 0) + legacyUsers,
  }
}
