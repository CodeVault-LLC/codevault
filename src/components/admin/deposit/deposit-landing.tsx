import { useState } from "react"
import { Link, useRouter } from "@tanstack/react-router"
import { CircleCheck, FileUp, Inbox, Plus, Trash2 } from "lucide-react"

import type { DraftSummary } from "@/server/deposit/types"
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { createDraftFn, deleteDraftFn } from "@/server/deposit/functions"
import { formatBytes, formatRelativeTime } from "@/components/admin/format"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

/**
 * The deposit landing screen.
 *
 * Its whole reason for existing is that a draft is a database row, and a
 * database row must not be created by looking at a page. Creation is a button
 * here, and nothing about arriving on this route writes anything.
 *
 * The second reason is that drafts previously had nowhere to be seen. They
 * accumulated invisibly with no way to resume the right one or discard the rest.
 */
export function DepositLanding({
  drafts,
  generatedAt,
}: {
  drafts: DraftSummary[]
  /** The server's clock — see the note in the admin overview about hydration. */
  generatedAt: Date
}) {
  const router = useRouter()
  const [creating, setCreating] = useState(false)

  // Most recently touched first. `listDrafts` orders oldest-first because the
  // overview wants the longest-blocked; here the useful question is "what was I
  // last working on".
  const ordered = [...drafts].sort(
    (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
  )

  async function startDeposit() {
    setCreating(true)

    try {
      const reportId = await createDraftFn()
      await router.navigate({
        to: "/admin/deposit/$draftId",
        params: { draftId: reportId },
      })
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-ui-xl">Deposit</h1>
          <p className="text-ui-sm text-muted-foreground">
            Add a report to the archive. Nothing is created until you start one.
          </p>
        </div>

        <Button onClick={() => void startDeposit()} disabled={creating}>
          <Plus data-icon="inline-start" />
          {creating ? "Starting…" : "New deposit"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-ui-lg">In progress</CardTitle>
          <CardDescription className="text-ui-sm">
            {ordered.length === 0
              ? "Drafts you start will be listed here until they publish."
              : `${ordered.length} draft${ordered.length === 1 ? "" : "s"} not yet published. Drafts hold no accession ID and are not publicly reachable.`}
          </CardDescription>
        </CardHeader>

        <CardContent className={ordered.length === 0 ? undefined : "px-0"}>
          {ordered.length === 0 ? (
            <Empty className="py-10">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Inbox />
                </EmptyMedia>
                <EmptyTitle className="text-ui-base">
                  No drafts in progress
                </EmptyTitle>
                <EmptyDescription className="text-ui-sm">
                  Start a deposit to upload a PDF and describe it. You can leave
                  and come back — a draft is saved as you go.
                </EmptyDescription>
              </EmptyHeader>

              <Button onClick={() => void startDeposit()} disabled={creating}>
                <FileUp data-icon="inline-start" />
                Start a deposit
              </Button>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6 text-ui-xs">Title</TableHead>
                  <TableHead className="text-ui-xs">Document</TableHead>
                  <TableHead className="text-ui-xs">State</TableHead>
                  <TableHead className="text-ui-xs">Edited</TableHead>
                  <TableHead className="pr-6 text-right text-ui-xs">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {ordered.map((draft) => (
                  <DraftRow key={draft.id} draft={draft} now={generatedAt} />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function DraftRow({ draft, now }: { draft: DraftSummary; now: Date }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  async function discard() {
    setDeleting(true)

    try {
      await deleteDraftFn({ data: { reportId: draft.id } })
      // Re-reads the loader rather than filtering local state, so the row count
      // and the overview's blocked total cannot disagree with the database.
      await router.invalidate()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <TableRow>
      <TableCell className="max-w-0 truncate pl-6 text-ui-sm font-medium">
        <Link
          to="/admin/deposit/$draftId"
          params={{ draftId: draft.id }}
          className="rounded-sm underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {draft.title}
        </Link>
      </TableCell>

      <TableCell className="text-ui-xs whitespace-nowrap text-muted-foreground">
        {draft.hasFile ? (
          <>
            {draft.pageCount !== null && `${draft.pageCount} pp`}
            {draft.pageCount !== null && draft.fileSize !== null && " · "}
            {draft.fileSize !== null && formatBytes(draft.fileSize)}
          </>
        ) : (
          "No file yet"
        )}
      </TableCell>

      <TableCell>
        {draft.publishable ? (
          <Badge variant="outline" className="gap-1 text-ui-xs">
            <CircleCheck className="size-3 text-olive" aria-hidden />
            Ready
          </Badge>
        ) : (
          <Badge variant="outline" className="text-ui-xs text-muted-foreground">
            {draft.blockerCount} blocking
          </Badge>
        )}
      </TableCell>

      <TableCell className="text-ui-xs whitespace-nowrap text-muted-foreground">
        {formatRelativeTime(draft.updatedAt, now)}
      </TableCell>

      <TableCell className="pr-6 text-right">
        <AlertDialog>
          <AlertDialogTrigger
            render={
              <Button variant="ghost" size="sm" aria-label="Discard draft">
                <Trash2 className="size-3.5" />
              </Button>
            }
          />

          <AlertDialogContent>
            <AlertDialogTitle>Discard this draft?</AlertDialogTitle>
            <AlertDialogDescription>
              “{draft.title}” and its uploaded file will be deleted. This cannot
              be undone. No accession ID has been allocated yet, so nothing
              public points at it.
            </AlertDialogDescription>

            <AlertDialogFooter>
              <AlertDialogClose
                render={<Button variant="ghost">Keep it</Button>}
              />
              <Button
                variant="destructive"
                disabled={deleting}
                onClick={() => void discard()}
              >
                {deleting ? "Discarding…" : "Discard draft"}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </TableCell>
    </TableRow>
  )
}
