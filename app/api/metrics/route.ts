import { NextResponse } from "next/server"
import { getRedis } from "@/app/lib/redis"

type MetricsBody = {
  type: "prompt" | "newUser"
}

// POST → increment counters
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as MetricsBody
    const redis = getRedis()

    if (!redis) {
      // dev mode with no REDIS_URL
      return NextResponse.json({ ok: true, redisDisabled: true })
    }

    if (body.type === "prompt") {
      await redis.incr("metrics:prompts")
    }

    if (body.type === "newUser") {
      await redis.incr("metrics:users")
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("Metrics POST error", err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

// GET → return counters
export async function GET() {
  try {
    const redis = getRedis()

    if (!redis) {
      return NextResponse.json({
        prompts: 0,
        users: 0,
        redisDisabled: true,
      })
    }

    const prompts = Number((await redis.get("metrics:prompts")) ?? 0)
    const users = Number((await redis.get("metrics:users")) ?? 0)

    return NextResponse.json({ prompts, users })
  } catch (err) {
    console.error("Metrics GET error", err)
    return NextResponse.json(
      { prompts: 0, users: 0, error: "Failed to load metrics" },
      { status: 500 }
    )
  }
}
