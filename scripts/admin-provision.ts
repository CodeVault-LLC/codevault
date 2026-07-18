// Creates an admin with ZERO credentials and prints a one-time enrollment URL.
//
// The first admin is never seeded with a secret (design §10.4). Nothing secret
// is committed, and nothing secret is stored at rest in the platform's variable
// store — the enrollment token exists only on this stdout and as a SHA-256 hash
// in the database.
//
//   bun run admin:provision --email you@example.com --name "Your Name"
//
// Deliver the printed URL out of band — Signal, or in person — never to the
// email address that is the account identifier (design §7.3).

import { eq } from "drizzle-orm"

import { STAFF_ROLES } from "@/core/auth/permissions"
import { auth } from "@/server/auth/auth"
import { db } from "@/server/db/client"
import { env } from "@/env/server"
import { issueEnrollmentToken } from "@/server/auth/enrollment"
import { user } from "@/server/db/schema"

function flag(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`)
  return index === -1 ? undefined : process.argv[index + 1]
}

const roleFlag = flag("role")

if (
  roleFlag &&
  !STAFF_ROLES.includes(roleFlag as (typeof STAFF_ROLES)[number])
) {
  console.error(`--role must be one of: ${STAFF_ROLES.join(", ")}`)
  process.exit(1)
}

const email = flag("email")
const name = flag("name") ?? email
const allowAdditional = process.argv.includes("--allow-additional")

// Mints a fresh token for an account that already exists. This is the recovery
// path from §7.4 — a lost or expired enrollment link, or a lost device — and
// it is the same code path as first enrollment, built once.
const reissue = process.argv.includes("--reissue")

if (!email) {
  console.error(
    'Usage: bun run admin:provision --email you@example.com --name "Your Name" [--role staff|admin]'
  )
  console.error(
    "       bun run admin:provision --email you@example.com --reissue"
  )
  process.exit(1)
}

const alreadyRegistered = await db
  .select({ id: user.id })
  .from(user)
  .where(eq(user.email, email))
  .limit(1)

if (reissue && alreadyRegistered.length === 0) {
  console.error(`No account for ${email}. Provision it first.`)
  process.exit(1)
}

// Whether this is the very first account in the archive. Read once, because it
// decides two separate things below.
const isFirstAccount =
  (await db.select({ id: user.id }).from(user).limit(1)).length === 0

// Idempotency guard, so this cannot be re-triggered to mint a second
// superuser. Provisioning a genuine second admin is deliberate and explicit.
if (!reissue) {
  if (!isFirstAccount && !allowAdditional) {
    console.error(
      "An admin already exists.\n" +
        "  --reissue           mint a fresh enrollment link for this account\n" +
        "  --allow-additional  provision a different admin"
    )
    process.exit(1)
  }
}

const context = await auth.$context

const userId =
  alreadyRegistered.length > 0
    ? alreadyRegistered[0].id
    : (
        await context.internalAdapter.createUser({
          email,
          name: name!,
          emailVerified: false,
        })
      ).id

// The first account must be an admin — nothing else can reach the screen that
// grants the role, so a `staff` first account is an archive locked out of its
// own administration. Every account after it defaults to the *lower* privilege,
// matching the column default and §2's default-deny; `--role admin` is how you
// ask for more, deliberately and in writing.
const role = roleFlag ?? (isFirstAccount ? "admin" : "staff")

if (!reissue) {
  await db
    .update(user)
    .set({ role: role as (typeof STAFF_ROLES)[number] })
    .where(eq(user.id, userId))
}

const { token, expiresAt } = await issueEnrollmentToken(userId, {
  issuedBy: "cli",
})

const url = `${env.BETTER_AUTH_URL}/enroll?token=${encodeURIComponent(token)}`

console.log("")
console.log(`  Account   ${email}`)
console.log(`  Role      ${reissue ? "unchanged" : role}`)
console.log(`  Passkeys  none — enrol with the link below`)
console.log(`  Expires   ${expiresAt.toISOString()}`)
console.log("")
console.log(`  ${url}`)
console.log("")
console.log("  Single use. Deliver out of band, not by email.")
console.log("")

// The db pool keeps the event loop alive otherwise.
process.exit(0)
