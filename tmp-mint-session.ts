// Throwaway: mints a signed staff session cookie so the dashboard can be driven
// without completing a WebAuthn ceremony.
import { makeSignature } from "better-auth/crypto"

import { db } from "@/server/db/client"
import { env } from "@/env/server"
import { session, user } from "@/server/db/schema"

const USER_ID = "verify-staff-user"
const TOKEN = "verify-session-token-abcdef123456"

await db
  .insert(user)
  .values({
    id: USER_ID,
    name: "Verify Staff",
    email: "verify@codevault.test",
    emailVerified: true,
  })
  .onConflictDoNothing()

await db
  .insert(session)
  .values({
    id: "verify-session-id",
    token: TOKEN,
    userId: USER_ID,
    expiresAt: new Date(Date.now() + 86_400_000),
  })
  .onConflictDoNothing()

const sig = await makeSignature(TOKEN, env.BETTER_AUTH_SECRET)
console.log(`COOKIE=better-auth.session_token=${TOKEN}.${sig}`)
process.exit(0)
