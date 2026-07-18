import { createCsrfMiddleware, createStart } from "@tanstack/react-start"

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
  requestMiddleware: [csrfMiddleware],
}))
