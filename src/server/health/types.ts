export type CheckName = "database" | "storage"

export type CheckResult = {
  name: CheckName
  ok: boolean
  durationMs: number
  /** Present only when the check failed. Never carries credentials. */
  detail?: string
}

export type HealthStatus = "ok" | "degraded"

export type HealthReport = {
  status: HealthStatus
  checks: CheckResult[]
}
