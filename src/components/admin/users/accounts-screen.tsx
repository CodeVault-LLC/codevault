import { useState } from "react"

import type { IssuedEnrollment } from "./types"
import type { StaffAccount } from "@/server/admin/user-types"
import { AccountsTable } from "./accounts-table"
import { EnrollmentLink } from "./enrollment-link"
import { PasskeyDrawer } from "./passkey-drawer"
import { ProvisionDialog } from "./provision-dialog"
import { adminUsers } from "@/core/config/admin"

/**
 * Account management (design §8.1, §7.3, §7.4).
 *
 * Header, table, and two things layered over it: a drawer for one account's
 * passkeys and a dialog for provisioning. The screen itself holds only the
 * state those two need to hand back — which account's credentials are open, and
 * the one-time enrollment link that must not be lost.
 */
export function AccountsScreen({
  accounts,
  currentUserId,
  generatedAt,
}: {
  accounts: StaffAccount[]
  /** So the table can mark "you" and refuse what you may not do to yourself. */
  currentUserId: string
  generatedAt: Date
}) {
  const [issued, setIssued] = useState<IssuedEnrollment | null>(null)
  const [managing, setManaging] = useState<StaffAccount | null>(null)

  const activeAdmins = accounts.filter(
    (account) => account.role === "admin" && !account.disabledAt
  ).length

  // The drawer is opened with a row's account object, which goes stale the
  // moment a credential is revoked and the loader re-runs. Re-reading it from
  // the fresh list by id keeps the open drawer showing what the database now
  // holds rather than the snapshot it was opened with.
  const managingAccount = managing
    ? (accounts.find((account) => account.id === managing.id) ?? null)
    : null

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-ui-xl">{adminUsers.title}</h1>
          <p className="text-ui-sm text-muted-foreground">
            {adminUsers.description}
          </p>
        </div>

        <ProvisionDialog onIssued={setIssued} />
      </div>

      {/* Above the table, not beside the row that produced it. This is the one
          thing on the screen that cannot be retrieved after a reload, so it
          must not be somewhere that needs scrolling to notice. */}
      {issued && (
        <EnrollmentLink issued={issued} onDismiss={() => setIssued(null)} />
      )}

      <AccountsTable
        accounts={accounts}
        guards={{ activeAdmins, currentUserId }}
        onIssued={setIssued}
        onManagePasskeys={setManaging}
      />

      <PasskeyDrawer
        account={managingAccount}
        now={generatedAt}
        onClose={() => setManaging(null)}
      />
    </div>
  )
}
