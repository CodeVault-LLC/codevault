import { useState } from "react"
import { Link, useRouter } from "@tanstack/react-router"
import {
  ArrowUpRight,
  Ban,
  Check,
  CopyPlus,
  Loader2,
  RotateCcw,
  X,
} from "lucide-react"

import type { AdminReportDetail } from "@/server/admin/types"
import type { GateResult } from "@/core/reports/publish-gate-types"
import type { RecordWorkspaceProps, SaveState } from "./types"
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
  restoreReportFn,
  reviseReportFn,
  withdrawReportFn,
} from "@/server/admin/functions"
import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { StatusBadge } from "@/components/admin/status-badge"
import { Textarea } from "@/components/ui/textarea"
import { adminRecord } from "@/core/config/admin"
import { publishReportFn } from "@/server/deposit/functions"

/**
 * The state transitions, and only the transitions.
 *
 * Metadata edits save themselves as you leave each field; these do not, and the
 * difference is deliberate. Publishing allocates a permanent identifier and
 * moves a file into a public bucket; withdrawing takes a cited document out of
 * circulation. Each is a discrete act with a consequence worth reading before
 * confirming, so each is a button behind a dialog that says what it will do.
 */
export function StatePanel({
  detail,
  permissions,
  gate,
  saveState,
}: {
  detail: AdminReportDetail
  permissions: RecordWorkspaceProps["permissions"]
  gate: GateResult
  saveState: SaveState
}) {
  const { report } = detail

  return (
    <aside className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start">
      <section className="flex flex-col gap-3 rounded-xl border border-border p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-ui-sm font-medium">{adminRecord.stateTitle}</h2>
          <StatusBadge status={report.status} />
        </div>

        {report.accessionId && (
          <p className="font-mono text-ui-xs text-muted-foreground">
            {report.accessionId}
          </p>
        )}

        {report.status === "published" && report.accessionId && (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            nativeButton={false}
            render={
              // A plain navigation out to the public record, so the operator
              // can see what a reader sees. `target` rather than a client
              // navigation because it leaves the admin surface entirely.
              <Link
                to="/reports/$accessionId"
                params={{ accessionId: report.accessionId }}
                target="_blank"
                rel="noreferrer"
              />
            }
          >
            View public record
            <ArrowUpRight data-icon="inline-end" />
          </Button>
        )}
      </section>

      {report.status === "draft" && <GatePanel gate={gate} />}

      <section className="flex flex-col gap-3 rounded-xl border border-border p-4">
        <h2 className="text-ui-sm font-medium">Actions</h2>

        {report.status === "draft" && (
          <>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              nativeButton={false}
              render={
                <Link
                  to="/admin/deposit/$draftId"
                  params={{ draftId: report.id }}
                />
              }
            >
              Open in the deposit flow
            </Button>

            {permissions.canPublish && (
              <PublishAction reportId={report.id} gate={gate} />
            )}
          </>
        )}

        {report.status === "published" && permissions.canWithdraw && (
          <WithdrawAction reportId={report.id} />
        )}

        {report.status === "withdrawn" && permissions.canRestore && (
          <RestoreAction reportId={report.id} />
        )}

        {(report.status === "published" || report.status === "withdrawn") &&
          permissions.canWrite && <ReviseAction reportId={report.id} />}
      </section>

      <SaveStatus state={saveState} />
    </aside>
  )
}

/** What is standing between this draft and publish. */
function GatePanel({ gate }: { gate: GateResult }) {
  return (
    <section
      aria-labelledby="record-gate-heading"
      className="flex flex-col gap-3 rounded-xl border border-border p-4"
    >
      <h2 id="record-gate-heading" className="text-ui-sm font-medium">
        Before this can publish
      </h2>

      {gate.publishable ? (
        <p className="flex items-center gap-2 text-ui-sm">
          <Check className="size-4 shrink-0 text-olive" aria-hidden />
          Everything required is present.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {gate.blockers.map((finding) => (
            <li
              key={`${finding.code}-${finding.field}`}
              className="flex items-start gap-2 text-ui-xs text-pretty"
            >
              <X
                className="mt-0.5 size-3.5 shrink-0 text-destructive"
                aria-hidden
              />
              {finding.message}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function PublishAction({
  reportId,
  gate,
}: {
  reportId: string
  gate: GateResult
}) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function publish() {
    setBusy(true)

    try {
      await publishReportFn({ data: { reportId } })
      await router.invalidate()
    } finally {
      setBusy(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button
            size="sm"
            className="w-full"
            disabled={!gate.publishable || busy}
          >
            {busy ? "Publishing…" : "Publish"}
          </Button>
        }
      />

      <AlertDialogContent>
        <AlertDialogTitle>Publish this report?</AlertDialogTitle>
        <AlertDialogDescription>
          It will be assigned a permanent accession ID, its PDF moves out of
          quarantine, and the record becomes live. The identifier is never
          reused, even if the record is later withdrawn.
        </AlertDialogDescription>

        <AlertDialogFooter>
          <AlertDialogClose render={<Button variant="ghost">Cancel</Button>} />
          <Button disabled={busy} onClick={() => void publish()}>
            {busy ? "Publishing…" : "Publish"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

/**
 * Withdrawal, which requires a reason.
 *
 * The reason is not bookkeeping — it goes on the public tombstone, where it is
 * the one thing telling someone who followed a citation what happened. So the
 * button stays disabled until there is enough of one to be a sentence, and the
 * field says where it will appear rather than leaving that to be discovered.
 */
function WithdrawAction({ reportId }: { reportId: string }) {
  const router = useRouter()
  const [reason, setReason] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Mirrors the server's own minimum. A display value only — the server
  // decides, and a drift here shows a misleading control rather than letting a
  // one-word reason through.
  const MIN_REASON = 10

  async function withdraw() {
    setBusy(true)
    setError(null)

    try {
      const result = await withdrawReportFn({ data: { reportId, reason } })

      if (!result.ok) {
        setError(
          result.reason === "wrong_status"
            ? "This record is not published, so there is nothing to withdraw."
            : "Could not withdraw this record."
        )
        return
      }

      await router.invalidate()
    } finally {
      setBusy(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button variant="outline" size="sm" className="w-full">
            <Ban data-icon="inline-start" />
            Withdraw
          </Button>
        }
      />

      <AlertDialogContent>
        <AlertDialogTitle>{adminRecord.withdrawTitle}</AlertDialogTitle>
        <AlertDialogDescription>
          {adminRecord.withdrawDescription}
        </AlertDialogDescription>

        <div className="mt-4">
          <Field
            htmlFor="withdraw-reason"
            label={adminRecord.withdrawReasonLabel}
            description={adminRecord.withdrawReasonHelp}
          >
            <Textarea
              id="withdraw-reason"
              rows={3}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            />
          </Field>
        </div>

        {error && (
          <p role="alert" className="mt-2 text-ui-xs text-destructive">
            {error}
          </p>
        )}

        <AlertDialogFooter>
          <AlertDialogClose render={<Button variant="ghost">Cancel</Button>} />
          <Button
            variant="destructive"
            disabled={busy || reason.trim().length < MIN_REASON}
            onClick={() => void withdraw()}
          >
            {busy ? "Withdrawing…" : "Withdraw"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function RestoreAction({ reportId }: { reportId: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function restore() {
    setBusy(true)

    try {
      await restoreReportFn({ data: { reportId } })
      await router.invalidate()
    } finally {
      setBusy(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button variant="outline" size="sm" className="w-full">
            <RotateCcw data-icon="inline-start" />
            Reinstate
          </Button>
        }
      />

      <AlertDialogContent>
        <AlertDialogTitle>{adminRecord.restoreTitle}</AlertDialogTitle>
        <AlertDialogDescription>
          {adminRecord.restoreDescription}
        </AlertDialogDescription>

        <AlertDialogFooter>
          <AlertDialogClose render={<Button variant="ghost">Cancel</Button>} />
          <Button disabled={busy} onClick={() => void restore()}>
            {busy ? "Reinstating…" : "Reinstate"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function ReviseAction({ reportId }: { reportId: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function revise() {
    setBusy(true)

    try {
      const result = await reviseReportFn({ data: { reportId } })

      if (result.ok) {
        // Straight into the new draft's deposit workspace: the next thing to do
        // is upload the revised document, and that is where it happens.
        await router.navigate({
          to: "/admin/deposit/$draftId",
          params: { draftId: result.draftId },
        })
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button variant="outline" size="sm" className="w-full">
            <CopyPlus data-icon="inline-start" />
            Start a revision
          </Button>
        }
      />

      <AlertDialogContent>
        <AlertDialogTitle>{adminRecord.reviseTitle}</AlertDialogTitle>
        <AlertDialogDescription>
          {adminRecord.reviseDescription}
        </AlertDialogDescription>

        <AlertDialogFooter>
          <AlertDialogClose render={<Button variant="ghost">Cancel</Button>} />
          <Button disabled={busy} onClick={() => void revise()}>
            {busy ? "Creating…" : "Create the draft"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

/**
 * Save status.
 *
 * `aria-live="polite"` rather than `assertive`: routine saves should not
 * interrupt a screen reader mid-sentence. A refusal is a longer message on
 * purpose — it has to say both what was rejected and that the field has been
 * put back, because the operator is looking at a value that just changed under
 * them.
 */
function SaveStatus({ state }: { state: SaveState }) {
  return (
    <p
      aria-live="polite"
      className={[
        "rounded-xl border border-border p-4 text-ui-xs text-pretty",
        state.status === "failed"
          ? "text-destructive"
          : "text-muted-foreground",
      ].join(" ")}
    >
      {state.status === "saving" && (
        <span className="flex items-center gap-1.5">
          <Loader2 className="size-3 animate-spin" aria-hidden />
          Saving…
        </span>
      )}

      {state.status === "saved" && (
        <span className="flex items-center gap-1.5">
          <Check className="size-3 text-olive" aria-hidden />
          Saved at{" "}
          {state.at.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
          .
        </span>
      )}

      {state.status === "failed" && state.message}

      {state.status === "idle" &&
        "Edits save as you leave each field. A change that would break a published record's publish gate is refused and reverted."}
    </p>
  )
}
