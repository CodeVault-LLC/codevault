import { useState } from "react"
import { useRouter } from "@tanstack/react-router"
import { UserPlus } from "lucide-react"

import type { IssuedEnrollment } from "./types"
import type { StaffRole } from "@/core/auth/permissions"
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  STAFF_ROLES,
  roleDescriptions,
  roleLabels,
} from "@/core/auth/permissions"
import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { adminUsers } from "@/core/config/admin"
import { provisionAccountFn } from "@/server/admin/functions"

/**
 * Provisioning, behind a dialog rather than as a permanent card.
 *
 * Creating an account is occasional; reading the table is the daily job. A form
 * that sits above the data every visit spends the top of the screen on the rare
 * task. It is also a genuinely consequential act — a new way into the archive —
 * which suits a deliberate open-and-confirm rather than fields that are always
 * one stray keystroke from being filled in.
 */
export function ProvisionDialog({
  onIssued,
}: {
  onIssued: (issued: IssuedEnrollment) => void
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [role, setRole] = useState<StaffRole>("staff")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function provision() {
    setBusy(true)
    setError(null)

    try {
      const result = await provisionAccountFn({ data: { email, name, role } })

      if (!result.ok) {
        setError(
          result.reason === "email_taken"
            ? "An account already uses that address."
            : "Could not provision that account."
        )
        return
      }

      onIssued({
        url: result.enrollmentUrl,
        expiresAt: result.expiresAt,
        email,
      })

      setEmail("")
      setName("")
      setRole("staff")
      setOpen(false)
      await router.invalidate()
    } finally {
      setBusy(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button>
            <UserPlus data-icon="inline-start" />
            Provision an account
          </Button>
        }
      />

      <AlertDialogContent>
        <AlertDialogTitle>{adminUsers.provisionTitle}</AlertDialogTitle>
        <AlertDialogDescription>
          {adminUsers.provisionDescription}
        </AlertDialogDescription>

        <div className="mt-4 flex flex-col gap-4">
          <Field htmlFor="provision-email" label="Email">
            <Input
              id="provision-email"
              type="email"
              // Off, deliberately: this is an address being assigned to someone
              // else, and the browser offering the operator's own is a way to
              // provision an account for the wrong person.
              autoComplete="off"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </Field>

          <Field htmlFor="provision-name" label="Name">
            <Input
              id="provision-name"
              autoComplete="off"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </Field>

          <Field
            htmlFor="provision-role"
            label="Role"
            description={roleDescriptions[role]}
          >
            <Select
              id="provision-role"
              value={role}
              onChange={(event) => setRole(event.target.value as StaffRole)}
            >
              {STAFF_ROLES.map((value) => (
                <option key={value} value={value}>
                  {roleLabels[value]}
                </option>
              ))}
            </Select>
          </Field>

          {error && (
            <p role="alert" className="text-ui-xs text-destructive">
              {error}
            </p>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogClose render={<Button variant="ghost">Cancel</Button>} />
          <Button
            disabled={busy || !email.trim() || !name.trim()}
            onClick={() => void provision()}
          >
            {busy ? "Provisioning…" : "Provision"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
