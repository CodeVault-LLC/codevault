// Applies pending migrations. Runs as a discrete pre-deploy step (Fly's
// release_command, Render's pre-deploy, a one-shot job elsewhere) — never at
// app boot.
//
// The reason is specific: Drizzle's migrator takes no advisory lock of its own,
// so a container host starting N replicas at once would have N processes racing
// the same DDL. Exiting non-zero here blocks the rollout, which is what we
// want.
//
// The lock below is belt-and-braces: it makes the script safe even if someone
// later wires it somewhere that can run concurrently.

import { drizzle } from "drizzle-orm/postgres-js"
import { migrate } from "drizzle-orm/postgres-js/migrator"
import { sql } from "drizzle-orm"
import postgres from "postgres"

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  console.error("DATABASE_URL is not set")
  process.exit(1)
}

// Arbitrary but fixed: any process using this constant contends with us.
const MIGRATION_LOCK_ID = 8_242_026

// max: 1 — a session-level advisory lock is held by a connection, so the lock
// and the migrations must run on the same one.
const client = postgres(databaseUrl, { max: 1 })
const db = drizzle({ client })

try {
  await db.execute(sql`select pg_advisory_lock(${MIGRATION_LOCK_ID})`)
  console.log("Applying migrations…")

  await migrate(db, { migrationsFolder: "./drizzle" })

  console.log("Migrations applied.")
} catch (error) {
  console.error("Migration failed:", error)
  process.exitCode = 1
} finally {
  await db
    .execute(sql`select pg_advisory_unlock(${MIGRATION_LOCK_ID})`)
    .catch(() => {})
  await client.end()
}
