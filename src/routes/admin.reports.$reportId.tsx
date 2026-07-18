import { createFileRoute, notFound } from "@tanstack/react-router"

import { NotFound } from "@/core/pages/not-found"
import { RecordWorkspace } from "@/components/admin/reports/record-workspace"
import { can } from "@/core/auth/permissions"
import { useStaff } from "@/components/admin/use-staff"
import { fetchAdminReportFn } from "@/server/admin/functions"

/**
 * One record's workspace — the screen §8.1 calls "edit metadata, manage files,
 * change state, add relations".
 *
 * The permissions computed here are for the UI only: they decide which buttons
 * exist, so an account is not offered an action that will be refused. Every one
 * of those actions re-checks its own capability at the server function, which
 * is where the decision actually happens (design §7.6).
 */
export const Route = createFileRoute("/admin/reports/$reportId")({
  loader: async ({ params }) => {
    const detail = await fetchAdminReportFn({
      data: { reportId: params.reportId },
    })

    if (!detail) throw notFound()

    return { detail }
  },

  component: AdminRecordRoute,
  notFoundComponent: () => <NotFound />,
})

function AdminRecordRoute() {
  const { detail } = Route.useLoaderData()
  // Read from /admin, the route whose beforeLoad resolves the session — see
  // `useStaff` for why this does not go through this route's own context.
  const staff = useStaff()

  return (
    <RecordWorkspace
      detail={detail}
      permissions={{
        canWrite: can(staff.role, "reports.write"),
        canPublish: can(staff.role, "reports.publish"),
        canWithdraw: can(staff.role, "reports.withdraw"),
        canRestore: can(staff.role, "reports.restore"),
      }}
    />
  )
}
