import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

import { env } from "@/env/server"

// postgres.js rather than bun-sql: concurrent-statement issues were reported
// against bun-sql and could not be confirmed resolved, and concurrent ingest
// workers are exactly that failure mode (design §10.4).
//
// Held on globalThis so Vite's dev HMR reuses one pool instead of opening a new
// one on every module reload until Postgres runs out of connections.
const globalForDb = globalThis as unknown as {
  __codevaultSql?: ReturnType<typeof postgres>
}

const client =
  globalForDb.__codevaultSql ??
  postgres(env.DATABASE_URL, {
    // Match the ingest concurrency ceiling (design §10.5) — a pool smaller
    // than the worker count surfaces as timeouts that look like S3 errors.
    max: 16,
  })

if (env.NODE_ENV !== "production") {
  globalForDb.__codevaultSql = client
}

export const db = drizzle({ client })
