import { createMiddleware } from "@tanstack/react-start"

import { getStaffSession } from "./session"

// The enforcement point (design §7.6).
//
// TanStack Start's own docs are explicit that `beforeLoad` is route UX and NOT
// the security boundary for data: every createServerFn is a same-origin RPC
// endpoint reachable by direct POST regardless of which route rendered the UI
// that calls it. So authorization happens here, at the data boundary.

/**
 * Resolves the session once per request and puts it in server context.
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
    return next({ context: { staff } })
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

    return next({ context: { staff: context.staff } })
  })
