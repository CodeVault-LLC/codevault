import { useState } from "react"
import { Link, useRouter } from "@tanstack/react-router"
import { Link2, Plus, Unlink } from "lucide-react"

import type { RelatedRecord } from "@/server/admin/types"
import type { RelationType } from "@/core/reports/types"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { addRelationFn, removeRelationFn } from "@/server/admin/functions"
import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { RELATION_TYPES } from "@/core/reports/vocabulary"
import { Select } from "@/components/ui/select"
import { StatusBadge } from "@/components/admin/status-badge"
import { adminRecord, relationLabel, relationLabels } from "@/core/config/admin"

/**
 * Typed relations between records (design §4.4).
 *
 * The vocabulary is DataCite 4.6's rather than one invented here, which costs
 * nothing and means the relations serialize straight into a DataCite payload if
 * DOIs are ever registered.
 *
 * Every link is written in both directions by the server, so removing one from
 * either end removes both. That is why this panel never has to ask which record
 * "owns" the relationship — neither does.
 */
export function RelationsPanel({
  reportId,
  relations,
  canEdit,
}: {
  reportId: string
  relations: RelatedRecord[]
  canEdit: boolean
}) {
  const router = useRouter()
  const [target, setTarget] = useState("")
  const [relation, setRelation] = useState<RelationType>("IsNewVersionOf")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function add() {
    setBusy(true)
    setError(null)

    try {
      const result = await addRelationFn({
        data: { fromId: reportId, target, relation },
      })

      if (!result.ok) {
        setError(
          result.reason === "not_found"
            ? "No record with that identifier."
            : result.reason === "self_relation"
              ? "A record cannot be related to itself."
              : "Could not add that link."
        )
        return
      }

      setTarget("")
      // Re-reads the loader rather than patching local state, so what is shown
      // is what the database holds — including the inverse link the server
      // wrote, which this component never saw.
      await router.invalidate()
    } finally {
      setBusy(false)
    }
  }

  async function remove(record: RelatedRecord) {
    setBusy(true)

    try {
      await removeRelationFn({
        data: {
          fromId: reportId,
          toId: record.reportId,
          relation: record.relation,
        },
      })
      await router.invalidate()
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-ui-lg">
          {adminRecord.relationsTitle}
        </CardTitle>
        <CardDescription className="text-ui-sm text-pretty">
          {adminRecord.relationsDescription}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {relations.length === 0 ? (
          <p className="text-ui-sm text-muted-foreground">
            {adminRecord.relationsEmpty}
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {relations.map((record) => (
              <li
                key={`${record.relation}-${record.reportId}`}
                className="flex items-center gap-3 rounded-lg border border-border px-3 py-2"
              >
                <Link2
                  className="size-3.5 shrink-0 text-muted-foreground"
                  aria-hidden
                />

                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-ui-xs text-muted-foreground">
                    {relationLabel(record.relation)}
                  </span>

                  <Link
                    to="/admin/reports/$reportId"
                    params={{ reportId: record.reportId }}
                    className="truncate rounded-sm text-ui-sm underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <span className="font-mono text-ui-xs text-muted-foreground">
                      {record.accessionId ?? "draft"}
                    </span>{" "}
                    {record.title}
                  </Link>
                </div>

                {/* The other record's own state. "Supersedes CV-2026-0004"
                    reads very differently once you can see that CV-2026-0004
                    was never published. */}
                <span className="ml-auto shrink-0">
                  <StatusBadge status={record.status} />
                </span>

                {canEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={busy}
                    aria-label={`Remove the ${record.relation} link to ${record.accessionId ?? record.title}`}
                    onClick={() => void remove(record)}
                  >
                    <Unlink className="size-3.5" />
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}

        {canEdit && (
          <div className="flex flex-col gap-3 border-t border-border pt-4">
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <Field
                htmlFor="relation-target"
                label={adminRecord.relationTargetLabel}
                description={adminRecord.relationTargetHelp}
              >
                <Input
                  id="relation-target"
                  value={target}
                  placeholder="CV-2026-0004"
                  onChange={(event) => setTarget(event.target.value)}
                />
              </Field>

              <Field htmlFor="relation-type" label="Relation">
                <Select
                  id="relation-type"
                  value={relation}
                  onChange={(event) =>
                    setRelation(event.target.value as RelationType)
                  }
                >
                  {RELATION_TYPES.map((value) => (
                    <option key={value} value={value}>
                      {relationLabels[value]}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            <div className="flex items-center gap-3">
              <Button
                size="sm"
                disabled={busy || target.trim().length === 0}
                onClick={() => void add()}
              >
                <Plus data-icon="inline-start" />
                {busy ? "Linking…" : "Add link"}
              </Button>

              {error && (
                <p role="alert" className="text-ui-xs text-destructive">
                  {error}
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
