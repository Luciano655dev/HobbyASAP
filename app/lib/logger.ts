import "server-only"

type LogLevel = "info" | "warn" | "error"

type LogPayload = {
  event: string
  requestId?: string
  route?: string
  userId?: string
  metadata?: Record<string, unknown>
  error?: unknown
}

function serializeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    }
  }

  return error
}

function emit(level: LogLevel, payload: LogPayload) {
  const entry = {
    level,
    timestamp: new Date().toISOString(),
    event: payload.event,
    requestId: payload.requestId,
    route: payload.route,
    userId: payload.userId,
    metadata: payload.metadata,
    error: payload.error ? serializeError(payload.error) : undefined,
  }

  const line = JSON.stringify(entry)

  if (level === "error") {
    console.error(line)
    return
  }

  if (level === "warn") {
    console.warn(line)
    return
  }

  console.info(line)
}

export function logInfo(payload: LogPayload) {
  emit("info", payload)
}

export function logWarn(payload: LogPayload) {
  emit("warn", payload)
}

export function logError(payload: LogPayload) {
  emit("error", payload)
}
