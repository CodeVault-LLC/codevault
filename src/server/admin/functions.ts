import { createServerFn } from "@tanstack/react-start"

import { getAdminOverview } from "./overview"
import { requireStaff } from "@/server/auth/middleware"

/**
 * `requireStaff` here is the actual security boundary, not the `beforeLoad`
 * guard on the /admin route. This is a same-origin RPC endpoint reachable by
 * direct POST regardless of which route rendered the UI (design §7.6), and it
 * returns draft titles and corpus-wide counts.
 */
export const fetchAdminOverviewFn = createServerFn({ method: "GET" })
  .middleware([requireStaff])
  .handler(() => getAdminOverview())
