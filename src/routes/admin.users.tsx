import { createFileRoute, redirect } from "@tanstack/react-router"

import { AccountsScreen } from "@/components/admin/users/accounts-screen"
import { can } from "@/core/auth/permissions"
import { fetchStaffAccountsFn } from "@/server/admin/functions"
import { useStaff } from "@/components/admin/use-staff"

/**
 * Account management — admin only.
 *
 * The `beforeLoad` redirect is route UX, not the security boundary: it sends a
 * staff account back to the overview rather than letting the loader fire and
 * fail with a bare 403. Every server function behind this screen carries its
 * own capability check, which is where access is actually decided (design §7.6).
 */
export const Route = createFileRoute("/admin/users")({
  beforeLoad: ({ context }) => {
    if (!can(context.staff.role, "users.read")) {
      throw redirect({ to: "/admin" })
    }
  },

  loader: async () => ({
    accounts: await fetchStaffAccountsFn(),
    // The server's clock, so relative timestamps render identically during SSR
    // and hydration.
    generatedAt: new Date(),
  }),

  component: AdminUsersRoute,
})

function AdminUsersRoute() {
  const { accounts, generatedAt } = Route.useLoaderData()
  const staff = useStaff()

  return (
    <AccountsScreen
      accounts={accounts}
      currentUserId={staff.userId}
      generatedAt={generatedAt}
    />
  )
}
