import { createServerFn } from "@tanstack/react-start"

import { sessionMiddleware } from "./middleware"

// Exposed so route `beforeLoad` guards can ask who is signed in.
//
// Reads the session the request middleware already resolved from the cookie
// rather than reaching for the Request itself — function middleware receives
// context, not headers.
//
// What beforeLoad returns is serialized and shipped to the client, so this
// returns the narrow StaffSession projection and never a token, a hash, or an
// internal flag (design §7.6).
export const fetchStaffSession = createServerFn({ method: "GET" })
  .middleware([sessionMiddleware])
  .handler(({ context }) => context.staff)
