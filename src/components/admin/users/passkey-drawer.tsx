import { useState } from "react"
import { useRouter } from "@tanstack/react-router"
import { AlertTriangle, KeyRound, Smartphone, Trash2 } from "lucide-react"

import type { StaffAccount } from "@/server/admin/user-types"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { adminUsers } from "@/core/config/admin"
import { formatRelativeTime } from "@/components/admin/format"
import { revokeCredentialFn } from "@/server/admin/functions"

/**
 * One account's passkeys.
 *
 * In a drawer rather than in the table, because a credential list is per-account
 * detail that does not compare across rows — the table answers "who has how
 * many", and this answers "which ones, and should any of them go". Putting it
 * inline would size every row to the account with the most devices.
 *
 * The device-type and backup flags are the point of the screen. §7.4's recovery
 * design is "two credentials on different failure domains", and a row reading
 * *synced, backed up* shares a failure domain with the account it syncs
 * through, while a *device-bound* one does not. That distinction is not
 * derivable from a count, which is why it is shown per credential.
 */
export function PasskeyDrawer({
  account,
  now,
  onClose,
}: {
  /** Null when the drawer is closed. */
  account: StaffAccount | null
  now: Date
  onClose: () => void
}) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function revoke(credentialRowId: string) {
    if (!account) return
    setBusy(true)

    try {
      await revokeCredentialFn({
        data: { userId: account.id, credentialRowId },
      })
      // Re-reads the loader rather than splicing local state, so the count in
      // the table behind the drawer moves with it.
      await router.invalidate()
    } finally {
      setBusy(false)
    }
  }

  return (
    <Sheet
      open={account !== null}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <SheetContent className="gap-0">
        <SheetHeader>
          <SheetTitle className="text-ui-lg">
            {adminUsers.credentialsTitle}
          </SheetTitle>
          <SheetDescription className="font-mono text-ui-xs">
            {account?.email}
          </SheetDescription>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4">
          <p className="text-ui-xs text-pretty text-muted-foreground">
            {adminUsers.credentialsDescription}
          </p>

          {account && account.credentials.length === 0 ? (
            <p className="flex items-start gap-2 rounded-lg border border-border px-3 py-2.5 text-ui-sm text-muted-foreground">
              <KeyRound className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              {adminUsers.credentialsEmpty}
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {account?.credentials.map((credential) => (
                <li
                  key={credential.id}
                  className="flex items-start gap-3 rounded-lg border border-border px-3 py-2.5"
                >
                  <Smartphone
                    className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                    aria-hidden
                  />

                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="truncate text-ui-sm">
                      {credential.name || "Unnamed passkey"}
                    </span>

                    <span className="flex flex-wrap items-center gap-1.5">
                      {/* The WebAuthn BE/BS flags, in words. Stored and shown
                          so "at least one hardware key" can be a policy read
                          off the table rather than FIDO MDS machinery
                          (design §7.2). */}
                      <Badge
                        variant="secondary"
                        className="text-ui-xs font-normal"
                      >
                        {credential.deviceType === "multiDevice"
                          ? "Synced"
                          : "Device-bound"}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-ui-xs font-normal"
                      >
                        {credential.backedUp ? "Backed up" : "No backup"}
                      </Badge>
                    </span>

                    {credential.createdAt && (
                      <span className="text-ui-xs text-muted-foreground">
                        Added {formatRelativeTime(credential.createdAt, now)}
                      </span>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={busy}
                    aria-label={`Remove ${credential.name || "this passkey"}`}
                    onClick={() => void revoke(credential.id)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </li>
              ))}
            </ul>
          )}

          {account?.credentials.length === 1 && (
            <p className="flex items-start gap-2 text-ui-xs text-pretty text-muted-foreground">
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              {adminUsers.singleCredentialWarning}
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
