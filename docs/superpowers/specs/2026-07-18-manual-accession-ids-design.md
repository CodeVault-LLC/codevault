# Manual accession identifiers

**Date:** 2026-07-18
**Status:** Approved

## Problem

Accession IDs are allocated by the server at publish time, in the fixed form
`CV-YYYY-NNNN`, from a per-year counter (`allocateAccessionId`,
`src/server/reports/accession.ts:25-38`). Documents that already exist outside
the system carry identifiers that do not fit that grammar — the CodeVault
Release Certification System is `CV-STD-0001`, where the middle segment is a
series code rather than a year, and the number is assigned editorially rather
than by a counter.

There is no way to deposit such a document without it being handed a different
identifier than the one it is already known by.

Note that the internal primary key (`reports.id`, a UUID) is not the problem.
It is invisible, has no editorial meaning, and stays exactly as it is. The
identifier under discussion is the public one, `reports.accession_id`.

## Decisions

| Question | Decision |
|---|---|
| Manual vs automatic | Manual **overrides**; automatic remains the default. A blank field allocates `CV-YYYY-NNNN` exactly as today. |
| Mutability | Editable while `status = 'draft'`. Frozen permanently at publish. |
| Grammar | `/^CV-[A-Z0-9]{2,8}-\d{4}$/` |
| Collisions | A four-digit series is reserved for the counter. `CV-2026-0005` is rejected as a manual value. |

The grammar is chosen so the auto-allocated format is a *subset* of the manual
one — `CV-2026-0001` and `CV-STD-0001` differ only in what occupies the series
slot. There is one identifier format, not two.

Reserving numeric series partitions the namespace: the counter owns
`CV-<year>-*`, editors own `CV-<alpha>-*`. The two can never collide, so no
retry loop is needed inside the publish transaction.

Immutability after publish is not a convenience choice. Accession IDs are
embedded in S3 object keys (`src/server/storage/keys.ts:10-30`) and copied into
`audit_log.target_label`. A mutable public ID would orphan stored objects and
invalidate issued citations. Freezing at publish preserves the guarantee
published records have today, and means no storage re-key path ever has to
exist.

## Design

### Schema

One new column on `reports`:

```ts
requestedAccessionId: text("requested_accession_id").unique(),
```

Drafts stage the desired identifier here. `accession_id` remains untouched
until publish.

**Why a second column rather than writing `accession_id` early.** The public
query layer treats accession-ID-presence as a proxy for published-ness:

```ts
// src/server/reports/queries.ts:36-39
// A published record always has an accession ID, but the column is nullable
// because drafts do not.
const HAS_ACCESSION = isNotNull(reports.accessionId)
```

`listableBy` returns `UNRESTRICTED` for staff viewers
(`src/server/reports/visibility.ts:73`), so for staff `HAS_ACCESSION` is the
only predicate keeping drafts out of listings, search results and facet counts.
Writing a manual ID onto a draft's `accession_id` would silently leak drafts
into the staff-facing archive.

The staging column preserves the invariant `accession_id != null ⟹ published`
exactly. The query layer needs no changes, and there is no visibility
regression to reason about.

### Validation

New pure module `src/core/reports/accession-id.ts`, sited in `src/core`
alongside `publish-gate.ts` so browser and server run identical logic.

```ts
export type AccessionIdError = "malformed" | "reserved_series"
export type AccessionIdResult =
  | { ok: true; value: string }
  | { ok: false; error: AccessionIdError }

export function parseAccessionId(input: string): AccessionIdResult
```

A tagged result rather than a boolean, so the form can say *which* rule failed.
`reserved_series` in particular needs explaining — a user typing `CV-2026-0005`
has made a reasonable-looking mistake and deserves better than "invalid".

`src/core/reports/types.ts:38` currently types the identifier as
`` `CV-${number}-${string}` ``, which no longer describes the value space. It
widens to `` `CV-${string}-${string}` ``.

### Publish

`src/server/reports/publish.ts:85-87` already reads:

```ts
const accessionId =
  row.accessionId ?? (await allocateAccessionId(tx, new Date().getUTCFullYear()))
```

This is the crash-recovery path — reuse an ID committed by an interrupted
earlier attempt. It extends to a three-way fallback:

```ts
const accessionId =
  row.accessionId ??
  requestedAccessionId(row) ??
  (await allocateAccessionId(tx, new Date().getUTCFullYear()))
```

where `requestedAccessionId` revalidates through `parseAccessionId` inside the
transaction. Form input is never trusted at the point of use.

The same `UPDATE` that sets `accession_id` clears `requested_accession_id`, so
a published row has exactly one source of truth for its identifier.

The `unique` constraint on `accession_id` remains the final arbiter. A losing
concurrent publish rolls the transaction back and reports a conflict rather
than corrupting either record.

### Publish gate

`evaluatePublishGate` (`src/core/reports/publish-gate.ts`) gains a check that a
staged identifier is well-formed. It stays pure.

Uniqueness cannot be decided purely — it needs a read. That probe sits beside
the gate in the publish path and surfaces through the same UI as every other
blocker, so a taken identifier is visible *before* the publish button is
pressed rather than as a failure after it.

### UI

One field in `src/components/admin/reports/cataloguing-section.tsx`, beside
Report numbers, following the established save-on-blur pattern in
`use-record-form.ts`.

- Editable while `status === 'draft'`.
- Read-only once published, showing the frozen `accession_id`.
- Placeholder shows the auto-allocated format, making it evident that blank
  means automatic.
- Inline validation message distinguishes malformed from reserved-series.

`RecordPatch` (`src/components/admin/reports/types.ts`) and the local form
state in `use-record-form.ts` each gain the field. The admin patch schema
(`src/server/admin/schema.ts`) validates it server-side.

## Database reset

Nothing is deployed and no data needs preserving, so schema change is delivered
by rebuild rather than by incremental migration:

1. Delete the five existing directories under `drizzle/`.
2. `bun run db:generate` — produces one fresh baseline migration covering the
   whole schema including `requested_accession_id`.
3. `bun run dev:reset` — `docker compose down -v && dev:up`, destroying the
   Postgres and SeaweedFS volumes, then recreating, migrating and
   re-bootstrapping the buckets.
4. `bun run admin:provision` — recreate the admin account, which the volume
   drop also removed.

Step 3 is the wipe requested alongside this feature: every report row, draft
and published alike, and every stored PDF and thumbnail. `report_files` and
`report_relations` go with them; `audit_log` is dropped with the volume too.

Squashing loses migration history. That is acceptable precisely because nothing
is deployed — and the alternative, a history whose first five entries describe a
database no environment has ever held, is worse. Once an environment holds real
data this option closes, and `drizzle.config.ts:3-5` applies again in full.

The targets are verified local: `localhost:5433` for Postgres, `localhost:8333`
for storage.

## Testing

**Validator** (`src/core/reports/accession-id.test.ts`) — table test:
accepts `CV-STD-0001`, `CV-RPT-0042`, `CV-TN-0007`; rejects `cv-std-0001`
(lowercase), `CV-STD-1` (short tail), `CV-STANDARDS-0001` (long series),
`STD-0001` (no prefix), `CV/STD/0001` (unsafe as a path segment) as
`malformed`, and `CV-2026-0005` as `reserved_series`.

**Publish** (`src/server/reports/publish.test.ts`) — a staged identifier is
honoured verbatim; a blank one falls back to the counter; a duplicate is
rejected and the transaction rolls back; a manual publish leaves
`accession_sequence` unadvanced.

**Gate** — a malformed staged identifier blocks publish and names itself in the
gate result.

## Out of scope

- Renaming a published identifier. Deliberately impossible; see immutability.
- Backfilling into a year series (`CV-2026-0005`). Rejected by design.
- `report_files`, which is defined but unqueried. Untouched here.
- Series-level allocation (server numbering within `STD`). If editorial demand
  appears, it layers on later without changing this grammar.
