import { createCsrfMiddleware, createStart } from "@tanstack/react-start"

import { securityHeaders } from "@/server/http/security-headers"
import { sessionMiddleware } from "@/server/auth/middleware"

// Global middleware registration.
//
// Every `createServerFn` is a same-origin RPC endpoint reachable by direct HTTP
// POST, regardless of which route rendered the UI that calls it. A `beforeLoad`
// guard on /admin/* protects the *view*, not the data. So protection is
// registered globally here and is opt-out, rather than attached per function
// where one forgotten `.middleware([...])` is an unauthenticated data endpoint
// (design §7.6).
//
// Note this differs from the design doc, which listed the CSRF middleware under
// `functionMiddleware`. It is a *request* middleware — `createCsrfMiddleware`
// returns `RequestMiddlewareAfterServer`, and the framework's own warning names
// `requestMiddleware`. Registered the other way it silently does nothing.
//
// It validates Sec-Fetch-Site / Origin / Referer and, by default, rejects a
// request carrying none of them.
const csrfMiddleware = createCsrfMiddleware({
  // Server functions only. Ordinary document navigations are same-origin GETs
  // that carry no CSRF risk and must not be blocked.
  filter: (ctx) => ctx.handlerType === "serverFn",
})

export const startInstance = createStart(() => ({
  // Order matters. `securityHeaders` is first because it decorates whatever
  // response comes back out of the chain, and that has to include the ones
  // CSRF rejects — a 403 is still a document a browser renders.
  //
  // Session resolution runs for every request so `context.staff` is available
  // to any server function that asks for it. It only *resolves* — refusing is
  // `requireStaff`'s job, attached per function, because plenty of server
  // functions here are legitimately public (the reports listing, the record
  // page).
  requestMiddleware: [securityHeaders, csrfMiddleware, sessionMiddleware],
}))
