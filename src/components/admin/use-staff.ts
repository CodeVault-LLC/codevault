import { useRouteContext } from "@tanstack/react-router"

import type { StaffSession } from "@/server/auth/session-types"

/**
 * The signed-in staff member, read from the route that owns them.
 *
 * `/admin`'s `beforeLoad` is what resolves the session, so `staff` lives in
 * *that* match's context. A child screen could reach it through its own
 * `Route.useRouteContext()`, since the router merges a parent's context down
 * into each child match — but that merge is recomputed at specific points in
 * the match lifecycle, and there is at least one path where a child renders
 * against a context that has not picked the parent's up yet.
 *
 * That path is a real one and it was reported: open `/admin/users`, navigate
 * out to `/reports`, then press the browser's back button. The child's own
 * `beforeLoad` sees `staff` (its context is rebuilt fresh for that call) and
 * `/admin`'s layout sees `staff`, but the child *component* reads `undefined`
 * and throws into the nearest error boundary — which is what surfaced as a
 * "404 not found".
 *
 * Naming the owning route sidesteps the merge entirely: this reads the match
 * that actually holds the value. `from: "/admin"` is checked against the
 * generated route tree, so it cannot drift if the route ever moves.
 */
export function useStaff(): StaffSession {
  return useRouteContext({ from: "/admin", select: (context) => context.staff })
}
