import { getRedis } from "@/app/lib/redis"

const GLOBAL_DAILY_LIMIT = 2_500_000
const REDIS_TIMEOUT_MS = 2000

type BudgetAllowed = {
  allowed: true
  redis: ReturnType<typeof getRedis>
  key: string
}

type BudgetBlocked = {
  allowed: false
}

export type GlobalTokenBudget = BudgetAllowed | BudgetBlocked

async function withTimeout<T>(promise: Promise<T>, ms: number) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error("Redis timeout")), ms)
  })
  try {
    return await Promise.race([promise, timeout])
  } finally {
    if (timeoutId) clearTimeout(timeoutId)
  }
}

function todayKey() {
  return new Date().toISOString().slice(0, 10) // YYYY-MM-DD
}

export async function checkGlobalTokenBudget(): Promise<GlobalTokenBudget> {
  const redis = getRedis()
  if (!redis) return { allowed: true, redis: null, key: "" }

  const day = todayKey()
  const key = `groq:tokens:global:${day}`

  let used = 0
  try {
    const usedRaw = await withTimeout(redis.get(key), REDIS_TIMEOUT_MS)
    used = Number(usedRaw ?? 0)
  } catch (err) {
    console.error("Redis unavailable for token budget check:", err)
    return { allowed: true, redis: null, key: "" }
  }

  if (used >= GLOBAL_DAILY_LIMIT) {
    return { allowed: false }
  }

  return { allowed: true, redis, key }
}

export async function addGlobalTokens(
  redis: ReturnType<typeof getRedis> | null | undefined,
  key: string,
  used: number
) {
  if (!redis || !used) return

  const ttl = 60 * 60 * 48 // 48h just to cross midnight safely
  try {
    const multi = redis.multi()
    multi.incrby(key, used)
    multi.expire(key, ttl)
    await withTimeout(multi.exec(), REDIS_TIMEOUT_MS)
  } catch (err) {
    console.error("Redis unavailable for token usage update:", err)
  }
}
