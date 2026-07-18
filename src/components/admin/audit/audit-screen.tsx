import { Link, useNavigate } from "@tanstack/react-router"
import { ScrollText, ShieldAlert, ShieldCheck, X } from "lucide-react"

import type { AdminAuditSearch } from "@/core/admin/search-params"
import type { AuditEntry, ChainVerification } from "@/server/audit/types"
import {
  AUDIT_ACTIONS,
  AUDIT_OUTCOMES,
  auditActionLabel,
  auditActionLabels,
} from "@/core/audit/vocabulary"
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
import { adminAudit, auditOutcomeLabels } from "@/core/config/admin"
import { AdminPagination } from "@/components/admin/pagination"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select } from "@/components/ui/select"
import { formatRelativeTime } from "@/components/admin/format"
import { hasActiveAuditFilters } from "@/core/admin/search-params"

type AuditPageData = {
  entries: AuditEntry[]
  total: number
  page: number
  pageSize: number
  pageCount: number
  chain: ChainVerification
}

/**
 * The audit log (design §7.7, §8.1).
 *
 * Read-only, and there is no control anywhere on this screen that writes to it.
 * That is the point of an append-only log: the dashboard that reads it must not
 * also be a way to edit it, or the hash chain is guarding against an attacker
 * who has been handed a button.
 */
export function AuditScreen({
  data,
  search,
  generatedAt,
}: {
  data: AuditPageData
  search: AdminAuditSearch
  generatedAt: Date
}) {
  const filtered = hasActiveAuditFilters(search)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-ui-xl">{adminAudit.title}</h1>
        <p className="text-ui-sm text-pretty text-muted-foreground">
          {adminAudit.description}
        </p>
      </div>

      <ChainStatus chain={data.chain} />
      <AuditFilterBar search={search} filtered={filtered} />

      <Card>
        <CardContent className={data.entries.length === 0 ? undefined : "px-0"}>
          {data.entries.length === 0 ? (
            <Empty className="py-12">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ScrollText />
                </EmptyMedia>
                <EmptyTitle className="text-ui-base">
                  {filtered ? "Nothing matches" : "Nothing recorded yet"}
                </EmptyTitle>
                <EmptyDescription className="text-ui-sm">
                  {filtered ? adminAudit.emptyFiltered : adminAudit.empty}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6 text-ui-xs">Seq</TableHead>
                    <TableHead className="text-ui-xs">When</TableHead>
                    <TableHead className="text-ui-xs">Who</TableHead>
                    <TableHead className="text-ui-xs">What</TableHead>
                    <TableHead className="pr-6 text-ui-xs">Target</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {data.entries.map((entry) => (
                    <AuditRow key={entry.seq} entry={entry} now={generatedAt} />
                  ))}
                </TableBody>
              </Table>

              <AdminPagination
                linkTo={(next) => ({
                  to: "/admin/audit",
                  search: (prev) => ({ ...prev, page: next }),
                })}
                page={data.page}
                pageCount={data.pageCount}
                pageSize={data.pageSize}
                total={data.total}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * The chain's verdict, stated before the log rather than after it.
 *
 * A log nobody has checked is a log asking to be trusted, which is precisely
 * what the hash chain exists to make unnecessary. Putting the verdict above the
 * entries means the reader knows whether what follows can be relied on before
 * they start relying on it.
 */
function ChainStatus({ chain }: { chain: ChainVerification }) {
  if (chain.checked === 0) return null

  return (
    <p
      role={chain.ok ? "status" : "alert"}
      className={[
        "flex items-start gap-2 rounded-lg border px-4 py-3 text-ui-sm text-pretty",
        chain.ok
          ? "border-border text-muted-foreground"
          : "border-destructive/50 bg-destructive/8 text-destructive",
      ].join(" ")}
    >
      {chain.ok ? (
        <ShieldCheck
          className="mt-0.5 size-4 shrink-0 text-olive"
          aria-hidden
        />
      ) : (
        <ShieldAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
      )}

      <span>
        {chain.ok ? adminAudit.chainOk : adminAudit.chainBroken}{" "}
        <span className="text-muted-foreground">
          {chain.checked} entr{chain.checked === 1 ? "y" : "ies"} checked
          {chain.brokenAt !== null && `; first mismatch at #${chain.brokenAt}`}.
        </span>
      </span>
    </p>
  )
}

function AuditFilterBar({
  search,
  filtered,
}: {
  search: AdminAuditSearch
  filtered: boolean
}) {
  const navigate = useNavigate()

  function setFilter(patch: Partial<AdminAuditSearch>) {
    // Back to page one on any filter change, or narrowing while deep in the log
    // lands on an empty page that reads as "nothing matches".
    void navigate({
      to: "/admin/audit",
      search: (prev) => ({ ...prev, ...patch, page: 1 }),
    })
  }

  return (
    <div className="flex flex-wrap items-end gap-2">
      <div className="flex min-w-48 flex-col gap-1">
        <label
          htmlFor="audit-action"
          className="text-ui-xs text-muted-foreground"
        >
          Action
        </label>
        <Select
          id="audit-action"
          value={search.action ?? ""}
          onChange={(event) =>
            setFilter({
              action: (event.target.value ||
                undefined) as AdminAuditSearch["action"],
            })
          }
        >
          <option value="">{adminAudit.allActions}</option>
          {AUDIT_ACTIONS.map((action) => (
            <option key={action} value={action}>
              {auditActionLabels[action]}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex min-w-36 flex-col gap-1">
        <label
          htmlFor="audit-outcome"
          className="text-ui-xs text-muted-foreground"
        >
          Outcome
        </label>
        <Select
          id="audit-outcome"
          value={search.outcome ?? ""}
          onChange={(event) =>
            setFilter({
              outcome: (event.target.value ||
                undefined) as AdminAuditSearch["outcome"],
            })
          }
        >
          <option value="">{adminAudit.allOutcomes}</option>
          {AUDIT_OUTCOMES.map((outcome) => (
            <option key={outcome} value={outcome}>
              {auditOutcomeLabels[outcome]}
            </option>
          ))}
        </Select>
      </div>

      {filtered && (
        <Button
          variant="ghost"
          size="sm"
          className="text-ui-xs"
          nativeButton={false}
          render={<Link to="/admin/audit" search={{ page: 1 }} />}
        >
          <X className="size-3.5" aria-hidden />
          Clear filters
        </Button>
      )}
    </div>
  )
}

function AuditRow({ entry, now }: { entry: AuditEntry; now: Date }) {
  const label = auditActionLabel(entry.action)

  return (
    <TableRow>
      <TableCell className="pl-6 font-mono text-ui-xs text-muted-foreground">
        {/* The sequence number is the chain's position, so it is worth showing:
            it is what `brokenAt` above refers to. */}
        {entry.seq}
      </TableCell>

      <TableCell className="text-ui-xs whitespace-nowrap text-muted-foreground">
        <time dateTime={entry.occurredAt.toISOString()}>
          {formatRelativeTime(entry.occurredAt, now)}
        </time>
      </TableCell>

      <TableCell className="text-ui-xs">
        <span className="font-mono">{entry.actorEmail ?? "system"}</span>
        {entry.ip && (
          <span className="block text-muted-foreground">{entry.ip}</span>
        )}
      </TableCell>

      <TableCell>
        <div className="flex flex-col gap-0.5">
          <span className="flex items-center gap-2 text-ui-sm">
            {label}

            {entry.outcome !== "success" && (
              <Badge variant="destructive" className="text-ui-xs font-normal">
                {auditOutcomeLabels.failure}
              </Badge>
            )}

            {entry.classification === "internal" && (
              <Badge variant="outline" className="text-ui-xs font-normal">
                Internal
              </Badge>
            )}
          </span>

          {entry.summary && (
            <span className="text-ui-xs text-pretty text-muted-foreground">
              {entry.summary}
            </span>
          )}
        </div>
      </TableCell>

      <TableCell className="pr-6 text-ui-xs">
        {entry.targetType === "report" && entry.targetId ? (
          // Straight to the record. Chasing "what happened to CV-2026-0004"
          // from a log entry is the common path and should not require
          // copying an identifier into a search box.
          <Link
            to="/admin/reports/$reportId"
            params={{ reportId: entry.targetId }}
            className="rounded-sm font-mono underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {entry.targetLabel ?? entry.targetId}
          </Link>
        ) : (
          <span className="font-mono text-muted-foreground">
            {entry.targetLabel ?? "—"}
          </span>
        )}
      </TableCell>
    </TableRow>
  )
}
