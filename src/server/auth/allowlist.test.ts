// The §7.2 route-enumeration test.
//
// The design doc flagged `disableSignUp` as ⚠️ VERIFY — "treat 'not in the
// docs' as unverified, not absent". It was right to. Better Auth builds its
// endpoint map from an unconditional object literal, so disabling
// email/password does not unmount those routes: `/sign-up/email` stays
// reachable and answers 400, not 404. Turning a feature off is not the same as
// removing its endpoint.
//
// Hence the allowlist, and hence this test. The route list below is
// transcribed from Better Auth 1.6.23's own getEndpoints().

import { describe, expect, it } from "vitest"

import {
  ALLOWED_AUTH_PATHS,
  isAllowedAuthPath,
  normalizeAuthPath,
} from "./allowlist"

// Every core route Better Auth mounts regardless of configuration.
const CORE_ROUTES = [
  "/sign-in/social",
  "/callback/:id",
  "/get-session",
  "/sign-out",
  "/sign-up/email",
  "/sign-in/email",
  "/reset-password",
  "/verify-password",
  "/verify-email",
  "/send-verification-email",
  "/change-email",
  "/change-password",
  "/update-session",
  "/update-user",
  "/delete-user",
  "/request-password-reset",
  "/reset-password/:token",
  "/list-sessions",
  "/revoke-session",
  "/revoke-sessions",
  "/revoke-other-sessions",
  "/link-social",
  "/list-accounts",
  "/delete-user/callback",
  "/unlink-account",
  "/refresh-token",
  "/get-access-token",
  "/account-info",
  "/ok",
  "/error",
]

const PASSKEY_ROUTES = [
  "/passkey/generate-register-options",
  "/passkey/generate-authenticate-options",
  "/passkey/verify-registration",
  "/passkey/verify-authentication",
  "/passkey/list-user-passkeys",
  "/passkey/delete-passkey",
  "/passkey/update-passkey",
]

// Everything a passkey-only archive has no business exposing.
const MUST_BE_REFUSED = CORE_ROUTES.filter(
  (route) => !ALLOWED_AUTH_PATHS.has(route)
)

describe("the auth surface is an allowlist", () => {
  it("refuses every credential-creating and password route", () => {
    for (const route of [
      "/sign-up/email",
      "/sign-in/email",
      "/reset-password",
      "/change-password",
      "/request-password-reset",
      "/set-password",
      "/verify-password",
    ]) {
      expect(isAllowedAuthPath(`/api/auth${route}`)).toBe(false)
    }
  })

  it("refuses every core route not explicitly allowed", () => {
    // Guards against the allowlist quietly becoming permissive.
    expect(MUST_BE_REFUSED.length).toBeGreaterThan(15)

    for (const route of MUST_BE_REFUSED) {
      expect(isAllowedAuthPath(`/api/auth${route}`)).toBe(false)
    }
  })

  it("allows the passkey ceremonies", () => {
    for (const route of PASSKEY_ROUTES) {
      expect(isAllowedAuthPath(`/api/auth${route}`)).toBe(true)
    }
  })

  it("allows session lifecycle and revocation", () => {
    for (const route of [
      "/get-session",
      "/sign-out",
      "/list-sessions",
      "/revoke-session",
      "/revoke-sessions",
      "/revoke-other-sessions",
    ]) {
      expect(isAllowedAuthPath(`/api/auth${route}`)).toBe(true)
    }
  })

  it("refuses an unknown route, as a future plugin's would be", () => {
    // The reason this is an allowlist and not a denylist: anything a future
    // version adds is refused by default rather than silently exposed.
    expect(isAllowedAuthPath("/api/auth/some/future/endpoint")).toBe(false)
  })
})

describe("path normalisation cannot be tricked", () => {
  it("strips the mount prefix", () => {
    expect(normalizeAuthPath("/api/auth/get-session")).toBe("/get-session")
  })

  it("ignores trailing slashes", () => {
    // Otherwise "/sign-up/email/" would sail straight past an exact-match set.
    expect(isAllowedAuthPath("/api/auth/sign-up/email/")).toBe(false)
    expect(isAllowedAuthPath("/api/auth/get-session/")).toBe(true)
  })
})
