import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { passkey } from "@better-auth/passkey"
import { tanstackStartCookies } from "better-auth/tanstack-start"

import { burnEnrollmentToken, resolveEnrollmentGrant } from "./enrollment"
import { db } from "@/server/db/client"
import { env } from "@/env/server"
import * as schema from "@/server/db/schema"

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,

  database: drizzleAdapter(db, {
    provider: "pg",
    // Keyed by Better Auth's *model* names, not our table names.
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
      passkey: schema.passkey,
      rateLimit: schema.rateLimit,
    },
  }),

  // No passwords anywhere. With no password there is no credential to stuff,
  // and phishing a WebAuthn signature is not possible — it is origin-scoped
  // (design §7.1).
  emailAndPassword: {
    enabled: false,
    disableSignUp: true,
  },

  session: {
    // Better Auth defaults to 7 days, which is far too long for a system that
    // can publish and withdraw records. 8 hours absolute, 30 minutes idle
    // (design §7.5).
    expiresIn: 8 * 60 * 60,
    updateAge: 30 * 60,
    // Re-authentication window for sensitive operations.
    freshAge: 15 * 60,
  },

  advanced: {
    // The default is false, which is a production footgun.
    useSecureCookies: env.NODE_ENV === "production",
  },

  rateLimit: {
    enabled: true,
    // Not the default "memory", which survives neither a restart nor a second
    // instance (design §7.5).
    storage: "database",
  },

  plugins: [
    passkey({
      // Changing either of these invalidates every credential already
      // registered against them.
      rpID: env.PASSKEY_RP_ID,
      rpName: env.PASSKEY_RP_NAME,

      authenticatorSelection: {
        // NOT "preferred", which is SimpleWebAuthn's general advice and is
        // tuned for consumer signup funnels. "preferred" lets an assertion
        // silently degrade to a single factor and drop below AAL2
        // (design §7.2).
        userVerification: "required",
        // Discoverable credentials — this is what kills username enumeration,
        // because the user never types an identifier.
        residentKey: "required",
      },

      registration: {
        // This is the whole enrollment mechanism. With requireSession false,
        // Better Auth drops its session middleware from the two registration
        // endpoints and defers to resolveUser instead — which means the
        // enrollment token below *is* the authorization for this ceremony.
        // Anything that fails to resolve gets nothing.
        requireSession: false,

        resolveUser: async ({ context }) => {
          if (!context) {
            throw new Error("An enrollment token is required.")
          }

          const grant = await resolveEnrollmentGrant(context)
          // Unknown, expired and already-used are one indistinguishable
          // answer. Never log the token itself.
          if (!grant) {
            throw new Error("That enrollment link is not valid.")
          }

          return {
            id: grant.userId,
            name: grant.email,
            displayName: grant.name,
          }
        },

        // Burned only once the credential has actually been verified, so a
        // failed ceremony leaves the token usable for a retry.
        afterVerification: async ({ context }) => {
          if (!context) return

          const grant = await resolveEnrollmentGrant(context)
          if (grant) await burnEnrollmentToken(grant.tokenId)
        },
      },
    }),

    // First-party TanStack Start integration — sets cookies through
    // @tanstack/react-start-server rather than a community shim.
    tanstackStartCookies(),
  ],
})
