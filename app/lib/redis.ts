import Redis from "ioredis"

let redis: Redis | null = null

export function getRedis() {
  if (!redis) {
    const url = process.env.REDIS_URL
    if (!url) return null
    redis = new Redis(url)
  }
  return redis
}
