import { createMiddleware } from "@tanstack/react-start"

import type { Capability } from "@/core/auth/permissions"
import { auditActor, getStaffSession } from "./session"
import { can } from "@/core/auth/permissions"

// The enforcement point (design §7.6).
//
// TanStack Start's own docs are explicit that `beforeLoad` is route UX and NOT
// the security boundary for data: every createServerFn is a same-origin RPC
// endpoint reachable by direct POST regardless of which route rendered the UI
// that calls it. So authorization happens here, at the data boundary.

/**
 * Resolves the session once per request and puts it in server context, along
 * with the actor to record against anything this request does.
 *
 * A *request* middleware because only that kind receives the Request — the
 * function middleware signature carries data, context and next, but no
 * headers. `type` is passed explicitly: the default is 'request', and older
 * tutorials assume 'function', so getting it wrong silently attaches the wrong
 * kind of middleware.
 */
export const sessionMiddleware = createMiddleware({ type: "request" }).server(
  async ({ request, next }) => {
    const staff = await getStaffSession(request.headers)

    // Always calls next(). A middleware that forgets to is a hung request.
    return next({
      context: { staff, actor: auditActor(staff, request.headers) },
    })
  }
)

/**
 * Refuses any server function call without a session.
 *
 * Attach to every server function that reads or mutates non-public data.
 * Derived from the cookie and the database upstream — `sendContext` from the
 * client is untrusted and is never consulted.
 */
export const requireStaff = createMiddleware({ type: "function" })
  .middleware([sessionMiddleware])
  .server(async ({ context, next }) => {
    if (!context.staff) {
      // A Response, not a thrown Error. An Error surfaces as an opaque 500,
      // which tells the caller nothing and makes "was this actually refused?"
      // impossible to answer from the outside — including in a test.
      throw new Response("Unauthorized", {
        status: 401,
        headers: { "cache-control": "no-store" },
      })
    }

    return next({ context: { staff: context.staff, actor: context.actor } })
  })

/**
 * Refuses a caller whose role does not carry a capability.
 *
 * A factory rather than one middleware per role, so a server function declares
 * the *operation* it performs and the role mapping stays in exactly one place —
 * the capability table in `@/core/auth/permissions`. Adding a role later is then
 * an edit to that table rather than a hunt for every `role === "admin"` in the
 * codebase.
 *
 * 403 here, unlike the reports query layer's 404. The difference is deliberate:
 * an internal record's *existence* is the secret, so confirming it would be a
 * leak. These endpoints are a known, documented part of the dashboard, and
 * hiding them from someone who already holds a staff session would produce a
 * confusing dead end rather than protect anything.
 */
export function requireCapability(capability: Capability) {
  return createMiddleware({ type: "function" })
    .middleware([requireStaff])
    .server(async ({ context, next }) => {
      if (!can(context.staff.role, capability)) {
        throw new Response("Forbidden", {
          status: 403,
          headers: { "cache-control": "no-store" },
        })
      }

      return next({ context: { staff: context.staff, actor: context.actor } })
    })
}
