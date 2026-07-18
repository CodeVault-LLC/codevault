import {
  createFileRoute,
  redirect,
  stripSearchParams,
} from "@tanstack/react-router"

import {
  ADMIN_AUDIT_DEFAULTS,
  adminAuditSchema,
} from "@/core/admin/search-params"
import { AuditScreen } from "@/components/admin/audit/audit-screen"
import { can } from "@/core/auth/permissions"
import { fetchAuditLogFn } from "@/server/admin/functions"

/**
 * The audit log — admin only.
 *
 * As with `/admin/users`, the redirect is route UX and the server function's
 * `requireCapability("audit.read")` is the boundary (design §7.6).
 */
export const Route = createFileRoute("/admin/audit")({
  beforeLoad: ({ context }) => {
    if (!can(context.staff.role, "audit.read")) {
      throw redirect({ to: "/admin" })
    }
  },

  validateSearch: adminAuditSchema,
  search: { middlewares: [stripSearchParams(ADMIN_AUDIT_DEFAULTS)] },
  loaderDeps: ({ search }) => search,

  loader: async ({ deps }) => ({
    data: await fetchAuditLogFn({ data: deps }),
    generatedAt: new Date(),
  }),

  component: AdminAuditRoute,
})

function AdminAuditRoute() {
  const { data, generatedAt } = Route.useLoaderData()
  const search = Route.useSearch()

  return <AuditScreen data={data} search={search} generatedAt={generatedAt} />
}
