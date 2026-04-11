import { NextResponse } from "next/server"
import { getSiteMetrics, logSiteMetricEvent } from "@/app/lib/siteMetrics"

type MetricsBody = {
  type: "prompt" | "new_user" | "newUser"
  userId?: string
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as MetricsBody
    const metricKey = body.type === "newUser" ? "new_user" : body.type

    if (metricKey === "prompt" || metricKey === "new_user") {
      await logSiteMetricEvent({
        metricKey,
        userId: typeof body.userId === "string" ? body.userId : null,
        metadata: {
          source: "api_metrics_post",
        },
      })
    }

    return NextResponse.json(
      { ok: true },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    )
  } catch (err) {
    console.error("Metrics POST error", err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

export async function GET() {
  try {
    const metrics = await getSiteMetrics()

    return NextResponse.json(metrics, {
      headers: {
        "Cache-Control": "no-store",
      },
    })
  } catch (err) {
    console.error("Metrics GET error", err)
    return NextResponse.json(
      { lessons: 0, users: 0, error: "Failed to load metrics" },
      { status: 500 }
    )
  }
}
