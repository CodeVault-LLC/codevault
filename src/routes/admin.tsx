import { Outlet, createFileRoute, redirect } from "@tanstack/react-router"

import { AdminShell } from "@/components/admin/admin-shell"
import { fetchStaffSession } from "@/server/auth/functions"

export const Route = createFileRoute("/admin")({
  // Route UX, NOT the security boundary. TanStack Start's docs are explicit
  // about this and it is worth restating here: every server function behind
  // these screens re-checks authorization itself via `requireStaff`, because a
  // server function is reachable by direct POST regardless of this guard
  // (design §7.6). This exists so a signed-out visitor gets a login page
  // instead of a broken screen.
  beforeLoad: async () => {
    const staff = await fetchStaffSession()
    if (!staff) throw redirect({ to: "/login" })

    return { staff }
  },
  component: AdminLayout,
  head: () => ({
    meta: [
      { title: "Dashboard — CodeVault" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
})

function AdminLayout() {
  const { staff } = Route.useRouteContext()

  return (
    <AdminShell userName={staff.email}>
      <Outlet />
    </AdminShell>
  )
}
