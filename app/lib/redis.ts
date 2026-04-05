import Redis from "ioredis"

let redis: Redis | null = null

function isUsableRedisClient(client: Redis | null) {
  if (!client) return false
  return client.status !== "end" && client.status !== "close"
}

export function getRedis() {
  if (!isUsableRedisClient(redis)) {
    const url = process.env.REDIS_URL
    if (!url) return null

    if (redis) {
      redis.removeAllListeners()
      redis = null
    }

    redis = new Redis(url, {
      connectTimeout: 2000,
      maxRetriesPerRequest: 1,
      enableReadyCheck: false,
      lazyConnect: true,
      retryStrategy: (times) => {
        if (times >= 1) return null
        return Math.min(times * 200, 800)
      },
    })

    redis.on("error", (error) => {
      console.error("Redis connection error:", error)
    })

    redis.on("end", () => {
      redis = null
    })

    redis.on("close", () => {
      if (redis?.status === "close") {
        redis = null
      }
    })
  }

  return redis
}
