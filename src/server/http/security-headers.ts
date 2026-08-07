import { createMiddleware } from "@tanstack/react-start"

import { env } from "@/env/server"

// Response headers that apply to every request the app serves.
//
// A request middleware rather than per-route, for the same reason
// authorization is global (design §7.6): a header set per handler is a header
// someone forgets on the next handler, and the one that gets forgotten is
// always on the response that needed it.
//
// Static assets served straight off disk by Nitro do not pass through here.
// That is fine for everything below — none of it protects an immutable font or
// a PNG — but it does mean the edge is the only place a header covers
// *everything*. See docs/deployment.md for what belongs on Cloudflare.

/**
 * Content-Security-Policy.
 *
 * `script-src` carries `'unsafe-inline'`, and that is a deliberate, documented
 * limit rather than an oversight. TanStack Start's SSR output inlines the
 * hydration payload as a `<script>`, so a policy without it serves a blank
 * page. The framework can nonce those tags — `router.options.ssr.nonce` — but
 * the nonce has to be minted per request and reach `getRouter()`, which the
 * router factory has no way to receive today. Until that is threaded through,
 * the honest description of this policy is: it does not stop injected inline
 * script.
 *
 * What it does stop is most of what an injected script would want to do next.
 * `base-uri 'none'` blocks a rewritten `<base>` redirecting every relative URL
 * on the page. `form-action 'self'` blocks a posted-away credential.
 * `object-src 'none'` removes the plugin surface entirely. `frame-ancestors
 * 'none'` is the clickjacking control that actually supersedes
 * X-Frame-Options. Those four are worth having on their own.
 *
 * `connect-src 'self'`: report downloads leave via a 302 to a presigned URL,
 * which is a navigation and not a fetch, so the content origin does not need
 * listing here. Add it the day something XHRs to it.
 */
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  // Tailwind ships a real stylesheet, but React 19 hoists `<style>` for
  // anything using `data-precedence`, and the dev server injects more.
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ")

/**
 * Everything that is the same on every response regardless of environment.
 *
 * `Permissions-Policy` denies the interesting sensors outright — the site asks
 * for none of them, and the passkey flows use WebAuthn, which is governed by
 * `publickey-credentials-get`/`-create` and so is left enabled for self.
 */
const STATIC_HEADERS: Record<string, string> = {
  "content-security-policy": CSP,
  // Stops a browser from second-guessing a Content-Type — the reason an
  // uploaded file that claims to be a PDF cannot be sniffed into HTML.
  "x-content-type-options": "nosniff",
  // Full URL to our own origin, bare origin to anyone else. An accession ID in
  // a path is not a secret, but an outbound referrer is free telemetry we have
  // no reason to hand over.
  "referrer-policy": "strict-origin-when-cross-origin",
  // Redundant next to `frame-ancestors 'none'` above, and kept for the
  // browsers and scanners that still only read this one.
  "x-frame-options": "DENY",
  "permissions-policy": [
    "accelerometer=()",
    "camera=()",
    "geolocation=()",
    "gyroscope=()",
    "magnetometer=()",
    "microphone=()",
    "payment=()",
    "usb=()",
    "interest-cohort=()",
    "publickey-credentials-get=(self)",
    "publickey-credentials-create=(self)",
  ].join(", "),
  // Severs the opener relationship, so a window we open — or one that opens
  // us — cannot reach back through `window.opener`.
  "cross-origin-opener-policy": "same-origin",
  "cross-origin-resource-policy": "same-origin",
}

/**
 * HSTS, and only over HTTPS.
 *
 * Sending it on a plaintext response is meaningless (browsers ignore it) and
 * over local http://localhost it is actively hostile — a browser that pins the
 * host will refuse plain HTTP there for the next two years, which is a
 * genuinely miserable afternoon.
 *
 * `includeSubDomains` is deliberately absent. The content origin is a separate
 * *registrable* domain (design §5.3), so it is not covered either way, but the
 * app domain may yet grow a subdomain that is not ours to pin. `preload` is
 * out for the same reason: it is close to irreversible.
 */
const HSTS = "max-age=31536000"

export const securityHeaders = createMiddleware({ type: "request" }).server(
  async ({ request, next }) => {
    const result = await next()
    const { headers } = result.response

    for (const [name, value] of Object.entries(STATIC_HEADERS)) {
      // `set`, not `append`: a handler that already chose a policy for itself
      // is the exception worth allowing, and two CSP headers are intersected
      // by the browser rather than overridden — which is how a route ends up
      // with a policy nobody wrote.
      if (!headers.has(name)) headers.set(name, value)
    }

    // `x-forwarded-proto` because production terminates TLS at Cloudflare and
    // reaches the container over plain HTTP through the tunnel — the request
    // URL here says `http:` even when the reader is on `https:`.
    const proto =
      request.headers.get("x-forwarded-proto") ?? new URL(request.url).protocol

    if (env.NODE_ENV === "production" && proto.startsWith("https")) {
      headers.set("strict-transport-security", HSTS)
    }

    return result
  }
)
