import { useState } from "react"
import { useRouter } from "@tanstack/react-router"
import {
  CircleCheck,
  CircleSlash,
  Clock,
  Ellipsis,
  KeyRound,
  LogOut,
  ShieldCheck,
  UserPlus,
  UserX,
  Users,
} from "lucide-react"

import type { AccountGuards, AccountState } from "./account-actions"
import type { IssuedEnrollment } from "./types"
import type { StaffAccount } from "@/server/admin/user-types"
import type { StaffRole } from "@/core/auth/permissions"
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuGroupLabel,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { STAFF_ROLES, roleLabels } from "@/core/auth/permissions"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  accountState,
  blocksDeactivate,
  blocksEnrollment,
  blocksRoleChange,
} from "./account-actions"
import {
  disableAccountFn,
  enableAccountFn,
  issueEnrollmentFn,
  revokeSessionsFn,
  setAccountRoleFn,
} from "@/server/admin/functions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { adminUsers } from "@/core/config/admin"
import { cn } from "@/lib/utils"

/**
 * The accounts table.
 *
 * A table rather than a stack of cards, matching the reports screen and the
 * rest of the admin surface: the questions an operator brings here — who is an
 * admin, who cannot sign in, who has one passkey and no backup — are
 * comparisons across accounts, and comparison is what a table is for. The
 * per-account detail that does not compare, the credential list, lives one
 * click away in a drawer rather than expanding every row to fit its longest
 * member.
 */
export function AccountsTable({
  accounts,
  guards,
  onIssued,
  onManagePasskeys,
}: {
  accounts: StaffAccount[]
  guards: AccountGuards
  onIssued: (issued: IssuedEnrollment) => void
  onManagePasskeys: (account: StaffAccount) => void
}) {
  return (
    <Card>
      <CardContent className={accounts.length === 0 ? undefined : "px-0"}>
        {accounts.length === 0 ? (
          <Empty className="py-12">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Users />
              </EmptyMedia>
              <EmptyTitle className="text-ui-base">No accounts</EmptyTitle>
              <EmptyDescription className="text-ui-sm">
                {adminUsers.empty}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6 text-ui-xs">
                  {adminUsers.columns.account}
                </TableHead>
                <TableHead className="text-ui-xs">
                  {adminUsers.columns.role}
                </TableHead>
                <TableHead className="text-ui-xs">
                  {adminUsers.columns.state}
                </TableHead>
                <TableHead className="text-ui-xs">
                  {adminUsers.columns.passkeys}
                </TableHead>
                <TableHead className="text-ui-xs">
                  {adminUsers.columns.sessions}
                </TableHead>
                <TableHead className="pr-6 text-right text-ui-xs">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {accounts.map((account) => (
                <AccountRow
                  key={account.id}
                  account={account}
                  guards={guards}
                  onIssued={onIssued}
                  onManagePasskeys={() => onManagePasskeys(account)}
                />
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

const STATE_PRESENTATION: Record<
  AccountState,
  { icon: typeof CircleCheck; className: string }
> = {
  active: { icon: CircleCheck, className: "text-olive" },
  deactivated: { icon: CircleSlash, className: "text-muted-foreground" },
  pending: { icon: Clock, className: "text-muted-foreground" },
  // The only one that is a problem rather than a state: an account nobody can
  // get into and nobody has been asked to fix.
  locked_out: { icon: KeyRound, className: "text-destructive" },
}

function AccountRow({
  account,
  guards,
  onIssued,
  onManagePasskeys,
}: {
  account: StaffAccount
  guards: AccountGuards
  onIssued: (issued: IssuedEnrollment) => void
  onManagePasskeys: () => void
}) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmingDeactivate, setConfirmingDeactivate] = useState(false)

  const state = accountState(account)
  const { icon: StateIcon, className: stateClass } = STATE_PRESENTATION[state]
  const isSelf = account.id === guards.currentUserId

  async function run(action: () => Promise<{ ok: boolean; reason?: string }>) {
    setBusy(true)
    setError(null)

    try {
      const result = await action()

      if (!result.ok) {
        setError(
          result.reason === "self_enrollment"
            ? adminUsers.selfEnrollmentRefused
            : result.reason === "last_admin"
              ? adminUsers.lastAdminRefused
              : result.reason === "self"
                ? adminUsers.selfRefused
                : "That did not work."
        )
        return
      }

      await router.invalidate()
    } finally {
      setBusy(false)
    }
  }

  // One passkey and no backup is the recovery risk §7.4 is written around, so
  // it is flagged on the row rather than left to be discovered in the drawer.
  const atRisk = !account.disabledAt && account.credentials.length === 1

  return (
    <>
      <TableRow className={account.disabledAt ? "opacity-60" : undefined}>
        <TableCell className="max-w-0 pl-6">
          <div className="flex items-center gap-2">
            <span className="truncate text-ui-sm font-medium">
              {account.name}
            </span>
            {isSelf && (
              <Badge
                variant="outline"
                className="shrink-0 text-ui-xs font-normal"
              >
                You
              </Badge>
            )}
          </div>
          <span className="block truncate font-mono text-ui-xs text-muted-foreground">
            {account.email}
          </span>
        </TableCell>

        <TableCell>
          <Badge
            variant={account.role === "admin" ? "default" : "secondary"}
            className="font-normal"
          >
            {roleLabels[account.role]}
          </Badge>
        </TableCell>

        <TableCell>
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  className="flex cursor-default items-center gap-1.5 rounded-sm text-ui-xs whitespace-nowrap focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                >
                  <StateIcon
                    className={cn("size-3.5 shrink-0", stateClass)}
                    aria-hidden
                  />
                  {adminUsers.stateLabels[state]}
                </button>
              }
            />
            <TooltipContent>{adminUsers.stateHints[state]}</TooltipContent>
          </Tooltip>
        </TableCell>

        <TableCell>
          {/* Two sibling controls, not one nested inside the other. The
              warning's tooltip trigger is itself a button, and a button inside
              a button is invalid markup — the inner one also swallows the
              clicks meant to open the drawer. */}
          <span className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onManagePasskeys}
              className="rounded-sm font-mono text-ui-xs tabular-nums underline-offset-4 hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              {account.credentials.length}
              <span className="sr-only"> passkeys — manage</span>
            </button>

            {atRisk && (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <button
                      type="button"
                      className="cursor-default rounded-sm text-clay focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                    >
                      <KeyRound className="size-3.5" aria-hidden />
                      <span className="sr-only">
                        {adminUsers.singleCredentialWarning}
                      </span>
                    </button>
                  }
                />
                <TooltipContent>
                  {adminUsers.singleCredentialWarning}
                </TooltipContent>
              </Tooltip>
            )}
          </span>
        </TableCell>

        <TableCell className="font-mono text-ui-xs text-muted-foreground tabular-nums">
          {account.activeSessions}
        </TableCell>

        <TableCell className="pr-6 text-right">
          <RowActions
            account={account}
            guards={guards}
            busy={busy}
            onManagePasskeys={onManagePasskeys}
            onDeactivate={() => setConfirmingDeactivate(true)}
            onRun={run}
            onIssued={onIssued}
          />
        </TableCell>
      </TableRow>

      {/* A second row rather than a floating toast: the message belongs to this
          account, and a refusal the operator has to go looking for is a
          refusal they will read as the button being broken. */}
      {error && (
        <TableRow>
          <TableCell colSpan={6} className="px-6 pt-0">
            <p role="alert" className="text-ui-xs text-pretty text-destructive">
              {error}
            </p>
          </TableCell>
        </TableRow>
      )}

      <AlertDialog
        open={confirmingDeactivate}
        onOpenChange={setConfirmingDeactivate}
      >
        <AlertDialogContent>
          <AlertDialogTitle>Deactivate {account.email}?</AlertDialogTitle>
          <AlertDialogDescription>
            Their sessions are cut immediately and they cannot sign in, even
            with a passkey they still hold. The account is not deleted — the
            audit log names it as the actor on everything it has done, and those
            entries have to stay readable. This is reversible.
          </AlertDialogDescription>

          <AlertDialogFooter>
            <AlertDialogClose
              render={<Button variant="ghost">Cancel</Button>}
            />
            <Button
              variant="destructive"
              disabled={busy}
              onClick={() => {
                setConfirmingDeactivate(false)
                void run(() =>
                  disableAccountFn({ data: { userId: account.id } })
                )
              }}
            >
              Deactivate
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

/**
 * The row's action menu.
 *
 * A menu rather than a row of buttons, because six accounts times five controls
 * is thirty buttons competing with the data for attention. Blocked actions stay
 * *visible and disabled* rather than being hidden: "you cannot demote the last
 * admin" is something worth learning, and an action that silently vanishes
 * teaches nothing.
 */
function RowActions({
  account,
  guards,
  busy,
  onManagePasskeys,
  onDeactivate,
  onRun,
  onIssued,
}: {
  account: StaffAccount
  guards: AccountGuards
  busy: boolean
  onManagePasskeys: () => void
  onDeactivate: () => void
  onRun: (
    action: () => Promise<{ ok: boolean; reason?: string }>
  ) => Promise<void>
  onIssued: (issued: IssuedEnrollment) => void
}) {
  const enrollmentBlock = blocksEnrollment(account, guards)
  const deactivateBlock = blocksDeactivate(account, guards)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            disabled={busy}
            aria-label={`Actions for ${account.email}`}
          >
            <Ellipsis className="size-4" />
          </Button>
        }
      />

      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuGroup>
          <DropdownMenuGroupLabel>Role</DropdownMenuGroupLabel>
          <DropdownMenuRadioGroup
            value={account.role}
            onValueChange={(value) =>
              void onRun(() =>
                setAccountRoleFn({
                  data: { userId: account.id, role: value as StaffRole },
                })
              )
            }
          >
            {STAFF_ROLES.map((role) => {
              const block = blocksRoleChange(account, guards, role)

              return (
                <DropdownMenuRadioItem
                  key={role}
                  value={role}
                  disabled={block !== null}
                  // The title is the fallback explanation for a disabled item,
                  // which cannot host a tooltip of its own.
                  title={block ?? undefined}
                >
                  {roleLabels[role]}
                </DropdownMenuRadioItem>
              )
            })}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem onClick={onManagePasskeys}>
            <KeyRound />
            Manage passkeys
          </DropdownMenuItem>

          <DropdownMenuItem
            disabled={enrollmentBlock !== null}
            title={enrollmentBlock ?? undefined}
            onClick={() =>
              void onRun(async () => {
                const result = await issueEnrollmentFn({
                  data: { userId: account.id },
                })
                if (result.ok) {
                  onIssued({
                    url: result.enrollmentUrl,
                    expiresAt: result.expiresAt,
                    email: account.email,
                  })
                }
                return result
              })
            }
          >
            <UserPlus />
            Issue enrollment link
          </DropdownMenuItem>

          <DropdownMenuItem
            disabled={account.activeSessions === 0}
            onClick={() =>
              void onRun(() =>
                revokeSessionsFn({ data: { userId: account.id } })
              )
            }
          >
            <LogOut />
            Revoke {account.activeSessions} session
            {account.activeSessions === 1 ? "" : "s"}
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          {account.disabledAt ? (
            <DropdownMenuItem
              onClick={() =>
                void onRun(() =>
                  enableAccountFn({ data: { userId: account.id } })
                )
              }
            >
              <ShieldCheck />
              Reinstate
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              variant="destructive"
              disabled={deactivateBlock !== null}
              title={deactivateBlock ?? undefined}
              onClick={onDeactivate}
            >
              <UserX />
              Deactivate
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
