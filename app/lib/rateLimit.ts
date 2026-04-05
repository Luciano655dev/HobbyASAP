import "server-only"

import { getRedis } from "./redis"

type RateLimitResult = {
  allowed: boolean
  remaining: number
  retryAfterSeconds: number
}

function extractClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown"
  }

  return request.headers.get("x-real-ip") || "unknown"
}

function getIdentityKey(request: Request, userId?: string) {
  if (userId) return `user:${userId}`
  return `ip:${extractClientIp(request)}`
}

export async function checkRateLimit(params: {
  request: Request
  namespace: string
  limit: number
  windowSeconds: number
  userId?: string
}): Promise<RateLimitResult> {
  const { request, namespace, limit, windowSeconds, userId } = params
  const redis = getRedis()

  if (!redis) {
    return {
      allowed: true,
      remaining: limit,
      retryAfterSeconds: 0,
    }
  }

  const identityKey = getIdentityKey(request, userId)
  const key = `ratelimit:${namespace}:${identityKey}`

  try {
    const current = await redis.incr(key)
    if (current === 1) {
      await redis.expire(key, windowSeconds)
    }

    const ttl = await redis.ttl(key)
    const retryAfterSeconds = ttl > 0 ? ttl : windowSeconds
    const remaining = Math.max(0, limit - current)

    return {
      allowed: current <= limit,
      remaining,
      retryAfterSeconds,
    }
  } catch (error) {
    console.error("Rate limit Redis unavailable:", error)
    return {
      allowed: true,
      remaining: limit,
      retryAfterSeconds: 0,
    }
  }
}
