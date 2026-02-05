import Redis from "ioredis"

let redis: Redis | null = null

export function getRedis() {
  if (!redis) {
    const url = process.env.REDIS_URL
    if (!url) return null
    redis = new Redis(url, {
      connectTimeout: 2000,
      maxRetriesPerRequest: 1,
      enableReadyCheck: false,
      retryStrategy: (times) => {
        if (times >= 2) return null
        return Math.min(times * 200, 800)
      },
    })
  }
  return redis
}
