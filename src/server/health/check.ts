import { sql } from "drizzle-orm"

import type { CheckName, CheckResult, HealthReport } from "./types"
import { db } from "@/server/db/client"
import { env } from "@/env/server"
import { objectStore } from "@/server/storage/object-store"

async function timed(
  name: CheckName,
  run: () => Promise<unknown>
): Promise<CheckResult> {
  const startedAt = Date.now()
  try {
    await run()
    return { name, ok: true, durationMs: Date.now() - startedAt }
  } catch (error) {
    return {
      name,
      ok: false,
      durationMs: Date.now() - startedAt,
      // The message only. A connection error can carry the DSN, credentials
      // included, and this endpoint is reachable by the platform's health
      // prober rather than by an authenticated operator.
      detail: error instanceof Error ? error.message : "unknown error",
    }
  }
}

/**
 * Checks the two dependencies the app cannot serve without. Deliberately
 * exercises real round trips rather than reporting on cached state — a health
 * check that cannot fail is not a health check.
 */
export async function checkHealth(): Promise<HealthReport> {
  const checks = await Promise.all([
    timed("database", () => db.execute(sql`select 1`)),
    // Lists a prefix that matches nothing: cheap, but it still proves
    // connectivity and that the credentials are accepted.
    timed("storage", () =>
      objectStore.list(env.BUCKET_PUBLIC, "__healthcheck__/")
    ),
  ])

  return {
    status: checks.every((check) => check.ok) ? "ok" : "degraded",
    checks,
  }
}
