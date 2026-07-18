# Manual Accession Identifiers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a depositor supply a document's own accession identifier — such as `CV-STD-0001` — instead of always receiving `CV-YYYY-NNNN` from the server counter.

**Architecture:** A draft stages its desired identifier in a new `reports.requested_accession_id` column, keeping `accession_id` null until publish so the query layer's `accession_id != null ⟹ published` invariant survives untouched. Publish extends its existing crash-recovery fallback into a three-way choice: an already-committed ID, then a staged one, then the counter. A pure validator in `src/core` runs identically in browser and server.

**Tech Stack:** TypeScript, Drizzle ORM 1.0 over Postgres 18, TanStack Start server functions, Zod 4, React 19, Vitest, Bun.

## Global Constraints

- Package manager is **Bun**. Run `bun run <script>`, never `npm`/`pnpm`.
- Grammar is exactly `/^CV-[A-Z0-9]{2,8}-\d{4}$/`.
- A series matching `/^\d{4}$/` is reserved for the counter and rejected as a manual value.
- A manual identifier is editable only while `status = 'draft'`. Never mutable after publish.
- Pure validation lives in `src/core/reports/` and must import nothing from `src/server/`.
- No incremental migration. Schema changes are delivered by squashing `drizzle/` to one baseline and resetting the database.
- Existing prose comment style in this repo explains *why*, not *what*. Match it.

---

## File Structure

| File | Responsibility |
|---|---|
| `src/core/reports/accession-id.ts` | **Create.** Pure grammar + reserved-series validation. |
| `src/core/reports/accession-id.test.ts` | **Create.** Validator table tests. |
| `src/core/reports/types.ts:38` | **Modify.** Widen `AccessionId`. |
| `src/core/reports/publish-gate-types.ts` | **Modify.** Add candidate field, gate code, gate field. |
| `src/core/reports/publish-gate.ts` | **Modify.** Block publish on a malformed staged ID. |
| `src/server/db/schema/reports.ts` | **Modify.** Add `requestedAccessionId`. |
| `src/server/reports/publish.ts` | **Modify.** Three-way fallback, uniqueness probe, clear staging column. |
| `src/server/reports/publish-types.ts` | **Modify.** Add `accession_taken` failure reason. |
| `src/server/admin/schema.ts` | **Modify.** Accept the field in the patch. |
| `src/server/admin/mutations.ts` | **Modify.** Refuse the field on a non-draft. |
| `src/server/reports/publish.test.ts` | **Modify.** Publish-path tests. |
| `src/components/admin/reports/types.ts` | **Modify.** Add to `RecordPatch`. |
| `src/components/admin/reports/use-record-form.ts` | **Modify.** Add to form state and gate candidate. |
| `src/components/admin/reports/cataloguing-section.tsx` | **Modify.** Render the field. |
| `drizzle/` | **Replace.** Five directories squashed to one baseline. |

---

### Task 1: The validator

**Files:**
- Create: `src/core/reports/accession-id.ts`
- Create: `src/core/reports/accession-id.test.ts`
- Modify: `src/core/reports/types.ts:33-38`

**Interfaces:**
- Consumes: nothing.
- Produces: `parseAccessionId(input: string): AccessionIdResult`, types `AccessionIdError = "malformed" | "reserved_series"` and `AccessionIdResult = { ok: true; value: string } | { ok: false; error: AccessionIdError }`. Also `ACCESSION_ID_HINT: string` for form copy.

- [ ] **Step 1: Write the failing test**

Create `src/core/reports/accession-id.test.ts`:

```ts
import { describe, expect, it } from "vitest"

import { parseAccessionId } from "./accession-id"

describe("parseAccessionId", () => {
  it.each(["CV-STD-0001", "CV-RPT-0042", "CV-TN-0007", "CV-A1-9999"])(
    "accepts %s",
    (input) => {
      expect(parseAccessionId(input)).toEqual({ ok: true, value: input })
    }
  )

  it("trims surrounding whitespace before judging", () => {
    expect(parseAccessionId("  CV-STD-0001  ")).toEqual({
      ok: true,
      value: "CV-STD-0001",
    })
  })

  it.each([
    ["cv-std-0001", "lowercase"],
    ["CV-STD-1", "tail shorter than four digits"],
    ["CV-STD-00001", "tail longer than four digits"],
    ["CV-STANDARDS-0001", "series longer than eight"],
    ["CV-S-0001", "series shorter than two"],
    ["STD-0001", "missing CV prefix"],
    ["CV/STD/0001", "unsafe as a path segment"],
    ["CV-STD-000A", "non-numeric tail"],
    ["", "empty"],
  ])("rejects %s as malformed (%s)", (input) => {
    expect(parseAccessionId(input)).toEqual({ ok: false, error: "malformed" })
  })

  // The counter owns CV-<year>-NNNN. Letting a human claim one would put two
  // allocators in the same namespace.
  it.each(["CV-2026-0005", "CV-1999-0001", "CV-0000-0001"])(
    "rejects %s as a reserved series",
    (input) => {
      expect(parseAccessionId(input)).toEqual({
        ok: false,
        error: "reserved_series",
      })
    }
  )
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run test src/core/reports/accession-id.test.ts`
Expected: FAIL — `Failed to resolve import "./accession-id"`.

- [ ] **Step 3: Write the implementation**

Create `src/core/reports/accession-id.ts`:

```ts
// Validation for a hand-entered accession identifier.
//
// Pure and free of server imports, like `publish-gate.ts` beside it, so the
// dashboard validates as the operator types and the server validates before it
// commits — the same function in both places rather than two that agree until
// they don't.

/**
 * `CV-<series>-<NNNN>`.
 *
 * Deliberately the same shape the counter emits: `CV-2026-0001` and
 * `CV-STD-0001` differ only in what occupies the series slot. There is one
 * identifier format in this system, not a manual one and an automatic one.
 *
 * Uppercase alphanumerics only, and no separator other than the two hyphens,
 * because this string becomes an S3 key segment (`server/storage/keys.ts`) and
 * a URL path segment.
 */
const ACCESSION_ID = /^CV-([A-Z0-9]{2,8})-\d{4}$/

/** A four-digit series is a year, and years belong to the counter. */
const YEAR_SERIES = /^\d{4}$/

export type AccessionIdError = "malformed" | "reserved_series"

export type AccessionIdResult =
  | { ok: true; value: string }
  | { ok: false; error: AccessionIdError }

/** Shown under the input, and in the malformed error. */
export const ACCESSION_ID_HINT =
  "CV-STD-0001 — two to eight uppercase letters or digits, then four digits."

/**
 * A tagged result rather than a boolean.
 *
 * `reserved_series` in particular has to be distinguishable: someone typing
 * `CV-2026-0005` has made a reasonable-looking mistake, and "invalid" would
 * leave them re-reading a grammar their input already satisfies.
 */
export function parseAccessionId(input: string): AccessionIdResult {
  const value = input.trim()
  const match = ACCESSION_ID.exec(value)

  if (!match) return { ok: false, error: "malformed" }
  if (YEAR_SERIES.test(match[1])) {
    return { ok: false, error: "reserved_series" }
  }

  return { ok: true, value }
}

/** Form and gate copy for a rejection, so the two cannot word it differently. */
export function accessionIdErrorMessage(error: AccessionIdError): string {
  return error === "reserved_series"
    ? "Year series such as CV-2026-0005 are allocated automatically. Use a letter series, e.g. CV-STD-0001."
    : `Not a valid accession ID. Expected ${ACCESSION_ID_HINT}`
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun run test src/core/reports/accession-id.test.ts`
Expected: PASS, 20 tests.

- [ ] **Step 5: Widen the identifier type**

In `src/core/reports/types.ts`, replace lines 35-38:

```ts
// The accession identifier: CV-<series>-NNNN. The series is a year when the
// counter allocated it at publish, or a letter code such as STD when the
// document arrived carrying an identifier of its own. Permanent once set, and
// never reused — including after withdrawal (design §4.5).
export type AccessionId = `CV-${string}-${string}`
```

- [ ] **Step 6: Typecheck and commit**

Run: `bun run typecheck`
Expected: no errors.

```bash
git add src/core/reports/accession-id.ts src/core/reports/accession-id.test.ts src/core/reports/types.ts
git commit -m "feat: validate hand-entered accession identifiers"
```

---

### Task 2: Gate integration

**Files:**
- Modify: `src/core/reports/publish-gate-types.ts`
- Modify: `src/core/reports/publish-gate.ts`
- Modify: `src/server/reports/publish.ts:22-43` (`toGateCandidate`)

**Interfaces:**
- Consumes: `parseAccessionId`, `accessionIdErrorMessage` from Task 1.
- Produces: `GateCandidate.requestedAccessionId: string | null`; gate code `"invalid_requested_accession_id"`; gate field `"accessionId"`.

- [ ] **Step 1: Write the failing test**

Append to `src/core/reports/publish-gate.test.ts` (create it if absent, importing `evaluatePublishGate` and a local `candidate()` helper mirroring the existing tests in that file):

```ts
describe("staged accession identifier", () => {
  it("does not block when absent — the counter will allocate", () => {
    const gate = evaluatePublishGate(
      candidate({ requestedAccessionId: null })
    )
    expect(
      gate.blockers.some((b) => b.code === "invalid_requested_accession_id")
    ).toBe(false)
  })

  it("does not block when well formed", () => {
    const gate = evaluatePublishGate(
      candidate({ requestedAccessionId: "CV-STD-0001" })
    )
    expect(
      gate.blockers.some((b) => b.code === "invalid_requested_accession_id")
    ).toBe(false)
  })

  it("blocks a malformed identifier and names the field", () => {
    const gate = evaluatePublishGate(
      candidate({ requestedAccessionId: "nope" })
    )
    const finding = gate.blockers.find(
      (b) => b.code === "invalid_requested_accession_id"
    )
    expect(finding?.field).toBe("accessionId")
  })

  it("blocks a reserved year series with its own message", () => {
    const gate = evaluatePublishGate(
      candidate({ requestedAccessionId: "CV-2026-0005" })
    )
    const finding = gate.blockers.find(
      (b) => b.code === "invalid_requested_accession_id"
    )
    expect(finding?.message).toContain("allocated automatically")
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run test src/core/reports/publish-gate.test.ts`
Expected: FAIL — `requestedAccessionId` is not a property of `GateCandidate`.

- [ ] **Step 3: Extend the gate types**

In `src/core/reports/publish-gate-types.ts`, add to `GateCandidate` after `pdfEmbeddedTitle`:

```ts
  /**
   * The identifier the draft is asking to be published under, or null to let
   * the counter allocate one. Only the *shape* is judged here — whether it is
   * already taken is a database question, and the gate is pure.
   */
  requestedAccessionId: string | null
```

Add to `GateCode`:

```ts
  | "invalid_requested_accession_id"
```

Add to `GateField`:

```ts
  | "accessionId"
```

- [ ] **Step 4: Implement the gate check**

In `src/core/reports/publish-gate.ts`, add the import:

```ts
import { accessionIdErrorMessage, parseAccessionId } from "./accession-id"
```

and insert this block immediately before the `if (record.dissemination !== "metadata_only")` block:

```ts
  // Shape only. A taken identifier is caught by the uniqueness probe in the
  // publish path, because answering that needs a database read and this
  // function must stay pure enough to run in the browser.
  if (record.requestedAccessionId !== null) {
    const parsed = parseAccessionId(record.requestedAccessionId)

    if (!parsed.ok) {
      blockers.push({
        code: "invalid_requested_accession_id",
        field: "accessionId",
        message: accessionIdErrorMessage(parsed.error),
      })
    }
  }
```

- [ ] **Step 5: Feed the column through the adapter**

In `src/server/reports/publish.ts`, add to the object returned by `toGateCandidate`, after `pdfEmbeddedTitle`:

```ts
    requestedAccessionId: row.requestedAccessionId,
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `bun run test src/core/reports/`
Expected: PASS. `bun run typecheck` will still fail until Task 3 adds the column — that is expected and is fixed there.

- [ ] **Step 7: Commit**

```bash
git add src/core/reports/publish-gate-types.ts src/core/reports/publish-gate.ts src/core/reports/publish-gate.test.ts src/server/reports/publish.ts
git commit -m "feat: block publish on a malformed staged accession id"
```

---

### Task 3: Schema column and write path

**Files:**
- Modify: `src/server/db/schema/reports.ts:36`
- Modify: `src/server/admin/schema.ts:56-80`
- Modify: `src/server/admin/mutations.ts:52-80`

**Interfaces:**
- Consumes: `parseAccessionId` from Task 1.
- Produces: `reports.requestedAccessionId` column; `updateReportSchema` accepts `patch.requestedAccessionId?: string | null`; `updateReport` returns `reason: "accession_not_editable"` when the field is patched on a non-draft.

- [ ] **Step 1: Add the column**

In `src/server/db/schema/reports.ts`, insert immediately after the `accessionId` field:

```ts
    // What a draft is asking to be published as, when the document already
    // carries an identifier of its own — CV-STD-0001 rather than a number from
    // the counter.
    //
    // Deliberately *not* written into `accession_id` while still a draft. The
    // query layer treats a non-null accession ID as proof of publication
    // (`reports/queries.ts`, HAS_ACCESSION), and staff listings have no other
    // status predicate — so an early write here would surface drafts in staff
    // search and facet counts. Publish moves the value across and clears this.
    requestedAccessionId: text("requested_accession_id").unique(),
```

- [ ] **Step 2: Accept it in the patch schema**

In `src/server/admin/schema.ts`, add to the `patch` object after `doi`:

```ts
    // Shape is enforced by the publish gate rather than here, so a half-typed
    // identifier still saves — the same reason a draft may hold an empty
    // abstract. Publish is where an unusable value is refused.
    requestedAccessionId: z.string().trim().max(20).nullish(),
```

Then extend the docstring above `updateReportSchema`, replacing the sentence beginning "`status`, `accessionId`...":

```ts
 * `status`, `accessionId`, `withdrawnAt` and `withdrawnReason` are absent for a
 * different reason: those are state transitions, and each has its own operation
 * with its own guard and its own audit entry. An UPDATE that could set `status`
 * would be a way to publish or withdraw without passing through either.
 *
 * `requestedAccessionId` is here rather than there because it is a request, not
 * a transition — it changes nothing public until publish reads it. `updateReport`
 * still refuses it on anything already published, where the identifier is frozen.
```

- [ ] **Step 3: Write the failing guard test**

Append to `src/server/admin/mutations.test.ts`:

```ts
it("refuses a staged accession id on a published record", async () => {
  const [row] = await db
    .insert(reports)
    .values({ status: "published", accessionId: "CV-2026-0001" })
    .returning({ id: reports.id })

  const result = await updateReport(
    { reportId: row.id, patch: { requestedAccessionId: "CV-STD-0001" } },
    actor
  )

  expect(result).toEqual({ ok: false, reason: "accession_not_editable" })
})

it("accepts a staged accession id on a draft", async () => {
  const [row] = await db
    .insert(reports)
    .values({})
    .returning({ id: reports.id })

  const result = await updateReport(
    { reportId: row.id, patch: { requestedAccessionId: "CV-STD-0001" } },
    actor
  )

  expect(result.ok).toBe(true)
})
```

- [ ] **Step 4: Run test to verify it fails**

Run: `bun run test src/server/admin/mutations.test.ts`
Expected: FAIL — the published case returns `{ ok: true }`.

- [ ] **Step 5: Implement the guard**

In `src/server/admin/mutations.ts`, add `"accession_not_editable"` to the failure reasons in `UpdateReportResult` (`src/server/admin/mutation-types.ts`), then insert into `updateReport` immediately after `const after = { ...before, ...input.patch }`:

```ts
  // An accession ID is frozen the moment it is allocated, because it is
  // embedded in the record's storage keys and in every citation already
  // issued against it (design §4.5). Editing the staging column after publish
  // could not move the record anyway — publish has already read it — so
  // accepting the write would be a lie told to whoever typed it.
  if (
    input.patch.requestedAccessionId !== undefined &&
    before.status !== "draft"
  ) {
    return { ok: false, reason: "accession_not_editable" }
  }
```

- [ ] **Step 6: Run tests and typecheck**

Run: `bun run test src/server/admin/mutations.test.ts && bun run typecheck`
Expected: PASS, no type errors.

- [ ] **Step 7: Commit**

```bash
git add src/server/db/schema/reports.ts src/server/admin/schema.ts src/server/admin/mutations.ts src/server/admin/mutation-types.ts src/server/admin/mutations.test.ts
git commit -m "feat: stage a requested accession id on drafts"
```

---

### Task 4: Publish honours the staged identifier

**Files:**
- Modify: `src/server/reports/publish.ts:83-104`
- Modify: `src/server/reports/publish-types.ts:11`
- Modify: `src/server/reports/publish.test.ts`

**Interfaces:**
- Consumes: `reports.requestedAccessionId` (Task 3), `parseAccessionId` (Task 1).
- Produces: `PublishFailure.reason` gains `"accession_taken"`.

- [ ] **Step 1: Write the failing tests**

Append to `src/server/reports/publish.test.ts` (reuse that file's existing `publishableDraft()` helper for a row that passes the gate):

```ts
it("publishes under a staged identifier verbatim", async () => {
  const id = await publishableDraft({ requestedAccessionId: "CV-STD-0001" })

  const result = await publishReport(id)

  expect(result).toMatchObject({ ok: true, accessionId: "CV-STD-0001" })
})

it("clears the staging column once published", async () => {
  const id = await publishableDraft({ requestedAccessionId: "CV-STD-0002" })

  await publishReport(id)
  const [row] = await db.select().from(reports).where(eq(reports.id, id))

  expect(row.accessionId).toBe("CV-STD-0002")
  expect(row.requestedAccessionId).toBeNull()
})

it("leaves the counter unadvanced when an identifier was staged", async () => {
  const id = await publishableDraft({ requestedAccessionId: "CV-STD-0003" })

  await publishReport(id)
  const rows = await db.select().from(accessionSequence)

  expect(rows).toHaveLength(0)
})

it("falls back to the counter when nothing is staged", async () => {
  const id = await publishableDraft({ requestedAccessionId: null })

  const result = await publishReport(id)

  expect(result).toMatchObject({
    ok: true,
    accessionId: `CV-${new Date().getUTCFullYear()}-0001`,
  })
})

it("refuses an identifier already held by a published record", async () => {
  await db
    .insert(reports)
    .values({ status: "published", accessionId: "CV-STD-0009" })

  const id = await publishableDraft({ requestedAccessionId: "CV-STD-0009" })
  const result = await publishReport(id)

  expect(result).toEqual({ ok: false, reason: "accession_taken" })
})

it("leaves the draft a draft when the identifier is taken", async () => {
  await db
    .insert(reports)
    .values({ status: "published", accessionId: "CV-STD-0010" })

  const id = await publishableDraft({ requestedAccessionId: "CV-STD-0010" })
  await publishReport(id)
  const [row] = await db.select().from(reports).where(eq(reports.id, id))

  expect(row.status).toBe("draft")
  expect(row.accessionId).toBeNull()
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun run test src/server/reports/publish.test.ts`
Expected: FAIL — the staged identifier is ignored and a counter value is allocated.

- [ ] **Step 3: Add the failure reason**

In `src/server/reports/publish-types.ts`:

```ts
export type PublishFailure = {
  ok: false
  reason: "not_found" | "not_a_draft" | "gate_failed" | "accession_taken"
  gate?: GateResult
}
```

- [ ] **Step 4: Implement the three-way fallback**

In `src/server/reports/publish.ts`, add the import:

```ts
import { parseAccessionId } from "@/core/reports/accession-id"
```

Replace lines 83-87 (the `const accessionId = row.accessionId ?? ...` statement) with:

```ts
    // Three sources, in order of authority:
    //
    //   1. An identifier this row already holds — an earlier attempt got as far
    //      as committing one, and burning a second would waste a permanent
    //      identifier for nothing.
    //   2. One the operator staged, for a document that arrived already known
    //      by an identifier of its own.
    //   3. The counter.
    //
    // Revalidated here rather than trusted from the form: a server function is
    // a public endpoint reachable by direct POST regardless of which UI called
    // it (design §7.6).
    let accessionId = row.accessionId

    if (!accessionId && row.requestedAccessionId) {
      const parsed = parseAccessionId(row.requestedAccessionId)
      if (!parsed.ok) return { error: "gate_failed", gate } as const

      // The unique constraint would catch this too, but as a rolled-back
      // transaction rather than an answer. Asking first means the operator is
      // told which identifier clashed.
      const taken = await tx
        .select({ id: reports.id })
        .from(reports)
        .where(eq(reports.accessionId, parsed.value))
        .limit(1)

      if (taken.length > 0) return { error: "accession_taken" } as const

      accessionId = parsed.value
    }

    accessionId ??= await allocateAccessionId(tx, new Date().getUTCFullYear())
```

- [ ] **Step 5: Clear the staging column on the same write**

In the same transaction, replace the `UPDATE` at lines 100-103 with:

```ts
    // Cleared as the real column is set, so a published row has exactly one
    // source of truth for what it is called.
    await tx
      .update(reports)
      .set({ accessionId, requestedAccessionId: null, updatedAt: new Date() })
      .where(eq(reports.id, reportId))
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `bun run test src/server/reports/publish.test.ts && bun run typecheck`
Expected: PASS, no type errors.

- [ ] **Step 7: Commit**

```bash
git add src/server/reports/publish.ts src/server/reports/publish-types.ts src/server/reports/publish.test.ts
git commit -m "feat: publish under a staged accession id when one is set"
```

---

### Task 5: The dashboard field

**Files:**
- Modify: `src/components/admin/reports/types.ts:26-43`
- Modify: `src/components/admin/reports/use-record-form.ts:49-66,133-146`
- Modify: `src/components/admin/reports/cataloguing-section.tsx`

**Interfaces:**
- Consumes: `RecordFields.requestedAccessionId`, `GateResult` from Task 2, `findingsFor` from `publish-gate.ts`.
- Produces: no new exports.

- [ ] **Step 1: Add the field to the patch type**

In `src/components/admin/reports/types.ts`, add to `RecordPatch` after `doi`:

```ts
  requestedAccessionId?: string | null
```

Then extend `CataloguingSectionProps`:

```ts
export type CataloguingSectionProps = {
  fields: RecordFields
  gate: GateResult
  /** Frozen once allocated, so the field renders read-only after publish. */
  accessionId: string | null
  isDraft: boolean
  onChange: (patch: RecordPatch) => void
}
```

- [ ] **Step 2: Add it to form state and the gate candidate**

In `src/components/admin/reports/use-record-form.ts`, add to the `useState` initialiser after `doi: report.doi,`:

```ts
    requestedAccessionId: report.requestedAccessionId,
```

The `gate` memo spreads `...fields`, so the candidate picks it up with no further change. Confirm `AdminReportDetail`'s report projection (`src/server/admin/types.ts` and the query that builds it in `src/server/admin/record.ts`) selects `requestedAccessionId`; add it to both if the projection is explicit.

- [ ] **Step 3: Render the field**

In `src/components/admin/reports/cataloguing-section.tsx`, add the imports:

```ts
import { ACCESSION_ID_HINT } from "@/core/reports/accession-id"
import { findingsFor } from "@/core/reports/publish-gate"
```

Change the signature to destructure the new props:

```ts
export function CataloguingSection({
  fields,
  gate,
  accessionId,
  isDraft,
  onChange,
}: CataloguingSectionProps) {
  const accessionFindings = findingsFor(gate, "accessionId")
```

and insert this `Field` immediately **above** the existing "Report numbers" field:

```tsx
      <Field
        htmlFor="requestedAccessionId"
        label="Accession ID"
        // The identifier is the one thing about a record that can never be
        // corrected later, so the consequence of leaving it blank is stated
        // here rather than discovered at publish.
        description={
          isDraft
            ? `Leave blank to allocate CV-${new Date().getUTCFullYear()}-NNNN at publish. Set it only for a document that already has an identifier — ${ACCESSION_ID_HINT} Frozen once published.`
            : "Allocated at publish and permanent, including after withdrawal."
        }
        error={accessionFindings.blockers[0]?.message}
      >
        <Input
          id="requestedAccessionId"
          readOnly={!isDraft}
          defaultValue={
            isDraft ? (fields.requestedAccessionId ?? "") : (accessionId ?? "")
          }
          placeholder="CV-STD-0001"
          onBlur={
            isDraft
              ? (event) =>
                  onChange({
                    requestedAccessionId: event.target.value.trim() || null,
                  })
              : undefined
          }
        />
      </Field>
```

If `Field` has no `error` prop, render the message below the `Input` in the same markup the other sections use for gate blockers — check `metadata-form.tsx` for the established pattern and match it exactly rather than inventing one.

- [ ] **Step 4: Pass the new props at the call site**

In `src/components/admin/reports/record-workspace.tsx:102`, update the `<CataloguingSection>` usage:

```tsx
        <CataloguingSection
          fields={fields}
          gate={gate}
          accessionId={detail.report.accessionId}
          isDraft={detail.report.status === "draft"}
          onChange={update}
        />
```

- [ ] **Step 5: Verify**

Run: `bun run typecheck && bun run lint && bun run test`
Expected: no type errors, no lint errors, all tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/admin/reports/
git commit -m "feat: edit a draft's accession id from the record screen"
```

---

### Task 6: Squash migrations and wipe

Nothing is deployed and no data needs preserving, so the schema change ships as a rebuild rather than an `ALTER TABLE`. This step is **destructive and irreversible** — it drops the Postgres and SeaweedFS volumes, taking every report row (draft, published and withdrawn), every stored PDF and thumbnail, the audit log, and all user accounts.

Targets are local and were verified before this plan was written: Postgres `localhost:5433`, storage `localhost:8333`.

**Files:**
- Delete: the five directories under `drizzle/`
- Create: one regenerated baseline migration under `drizzle/`

- [ ] **Step 1: Confirm the targets are still local**

Run: `grep -E '^(DATABASE_URL|S3_ENDPOINT)' .env`
Expected: `localhost:5433` and `localhost:8333`. **If either points anywhere else, stop.**

- [ ] **Step 2: Remove the existing migration history**

```bash
rm -rf drizzle/20260718110954_immutable_array_to_string \
       drizzle/20260718111019_late_lake \
       drizzle/20260718114138_abstract_override_reason \
       drizzle/20260718122337_auth_tables \
       drizzle/20260718150243_groovy_tiger_shark \
       drizzle/meta
```

- [ ] **Step 3: Generate one baseline**

Run: `bun run db:generate`
Expected: a single new directory under `drizzle/` whose `migration.sql` contains `"requested_accession_id" text`.

Verify: `grep -r requested_accession_id drizzle/`

- [ ] **Step 4: Check the baseline carries the hand-written SQL function**

The `search_vector` generated column depends on `immutable_array_to_string`, which was hand-written in the migration just deleted — `drizzle-kit generate` will **not** reproduce it from the schema.

Run: `grep -c immutable_array_to_string drizzle/*/migration.sql`
Expected: at least 1. If 0, prepend the function definition from git history to the top of the new `migration.sql`:

```bash
git show c8a497e:drizzle/20260718110954_immutable_array_to_string/migration.sql
```

- [ ] **Step 5: Wipe and rebuild**

Run: `bun run dev:reset`
Expected: containers recreated, the baseline migration applied, three buckets created.

- [ ] **Step 6: Confirm the archive is empty**

Run: `docker compose exec -T postgres psql -U codevault -d codevault -c "select count(*) from reports; select count(*) from accession_sequence;"`
Expected: `0` for both.

- [ ] **Step 7: Recreate the admin account**

Run: `bun run admin:provision`
Expected: an admin account is created. The volume drop removed all users.

- [ ] **Step 8: Commit**

```bash
git add drizzle/
git commit -m "chore: squash migrations to one baseline and reset the archive"
```

---

### Task 7: End-to-end verification

- [ ] **Step 1: Full check**

Run: `bun run typecheck && bun run lint && bun run test`
Expected: all pass.

- [ ] **Step 2: Drive the real flow**

Start the app (`bun run dev`), sign in, and:

1. Create a draft from the deposit screen, upload a PDF, fill it to pass the gate.
2. On the record screen set Accession ID to `CV-STD-0001`. Confirm it saves.
3. Enter `CV-2026-0005`. Confirm the gate blocks publish with the reserved-series message and the Publish button is unavailable.
4. Restore `CV-STD-0001` and publish. Confirm the record page resolves at `/reports/CV-STD-0001` and the PDF downloads.
5. Confirm the Accession ID field is now read-only.
6. Create a second draft, leave the field blank, publish. Confirm it is allocated `CV-2026-0001` — the counter is unaffected by the manual publish.
7. Create a third draft, set `CV-STD-0001` again, attempt publish. Confirm it is refused as taken and stays a draft.

- [ ] **Step 3: Commit any fixes**

```bash
git add -A
git commit -m "fix: address issues found in end-to-end verification"
```

---

## Self-Review

**Spec coverage:** Schema → Task 3. Validation → Task 1. Publish → Task 4. Gate → Task 2. UI → Task 5. Database reset → Task 6. Testing → Tasks 1-4 plus Task 7. Every spec section maps to a task.

**Placeholders:** None. Two conditional branches are called out explicitly rather than left vague — the `Field` `error` prop in Task 5 Step 3, and the `immutable_array_to_string` check in Task 6 Step 4, both of which name the file to check and the exact fallback.

**Type consistency:** `parseAccessionId` / `AccessionIdResult` / `accessionIdErrorMessage` / `ACCESSION_ID_HINT` (Task 1) are used under those names in Tasks 2, 4 and 5. `requestedAccessionId` is spelled identically across the column, the Zod patch, `GateCandidate`, `RecordPatch` and the form state. `accession_taken` is added to `PublishFailure` in Task 4 before the tests assert it.
