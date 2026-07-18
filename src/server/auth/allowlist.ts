import { auth } from "./auth"

// The auth surface is an allowlist, not a denylist (design §7.2).
//
// This exists because of a specific finding: Better Auth builds its endpoint
// map from an unconditional object literal. Disabling email/password does NOT
// unmount those routes — `/sign-up/email` stays reachable and answers 400, not
// 404. So "we turned the feature off" is not the same as "the endpoint is
// gone", and a passkey-only deployment still exposes ~31 core routes.
//
// Better Auth does offer `disabledPaths`, but it is an exact-match denylist:
// every path a future version or plugin adds is silently permitted. Inverting
// it — deny everything not named here — fails closed instead.
export const ALLOWED_AUTH_PATHS: ReadonlySet<string> = new Set([
  // Session lifecycle.
  "/get-session",
  "/sign-out",

  // Session management, so credentials can be revoked without a help desk
  // (design §7.5).
  "/list-sessions",
  "/revoke-session",
  "/revoke-sessions",
  "/revoke-other-sessions",

  // The WebAuthn ceremonies.
  "/passkey/generate-register-options",
  "/passkey/verify-registration",
  "/passkey/generate-authenticate-options",
  "/passkey/verify-authentication",
  "/passkey/list-user-passkeys",
  "/passkey/delete-passkey",
  "/passkey/update-passkey",

  // Health probe.
  "/ok",
])

const BASE_PATH = "/api/auth"

/** The path as Better Auth sees it, with the mount prefix removed. */
export function normalizeAuthPath(pathname: string): string {
  const withoutBase = pathname.startsWith(BASE_PATH)
    ? pathname.slice(BASE_PATH.length)
    : pathname

  const withLeadingSlash = withoutBase.startsWith("/")
    ? withoutBase
    : `/${withoutBase}`

  // Trailing slashes would otherwise be a trivial allowlist bypass.
  return withLeadingSlash.length > 1
    ? withLeadingSlash.replace(/\/+$/, "")
    : withLeadingSlash
}

export function isAllowedAuthPath(pathname: string): boolean {
  return ALLOWED_AUTH_PATHS.has(normalizeAuthPath(pathname))
}

/**
 * Handles an auth request, or 404s it.
 *
 * 404 rather than 403: a refused endpoint should be indistinguishable from one
 * that was never mounted.
 */
export async function handleAuthRequest(request: Request): Promise<Response> {
  const { pathname } = new URL(request.url)

  if (!isAllowedAuthPath(pathname)) {
    return new Response("Not found", { status: 404 })
  }

  return auth.handler(request)
}
