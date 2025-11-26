import { getRedis } from "@/app/lib/redis"

const GLOBAL_DAILY_LIMIT = 2_500_000

function todayKey() {
  return new Date().toISOString().slice(0, 10) // YYYY-MM-DD
}

export async function checkGlobalTokenBudget() {
  const redis = getRedis()
  if (!redis) return { allowed: true, redis: null as any, key: "" }

  const day = todayKey()
  const key = `groq:tokens:global:${day}`

  const usedRaw = await redis.get(key)
  const used = Number(usedRaw ?? 0)

  if (used >= GLOBAL_DAILY_LIMIT) {
    return { allowed: false }
  }

  return { allowed: true, redis, key }
}

export async function addGlobalTokens(
  redis: ReturnType<typeof getRedis> | null,
  key: string,
  used: number
) {
  if (!redis || !used) return

  const ttl = 60 * 60 * 48 // 48h just to cross midnight safely
  const multi = redis.multi()
  multi.incrby(key, used)
  multi.expire(key, ttl)
  await multi.exec()
}
