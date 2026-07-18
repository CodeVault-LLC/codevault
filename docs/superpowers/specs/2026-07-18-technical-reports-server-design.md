# CodeVault Technical Reports Server — design & build plan

A private-authored, publicly-readable archive of CodeVault's technical writing,
modelled on the **NASA Technical Reports Server (NTRS)**. Reports are deposited
through an authenticated admin dashboard, stored as PDFs in object storage with
metadata in Postgres, and published as citable record pages.

**This document is written to be executed without prior context.** It states the
stack, the decisions, the reasoning behind them, and the order of work. Where a
fact was verified against a primary source during research it is stated plainly;
where it was not, it is marked ⚠️ **VERIFY**.

---

## 0. Context for someone starting cold

**The repo.** `codevault.dev` marketing site at `/home/lukasolsen/codevault/codevault`.
TanStack **Start** (not plain Router) — React 19 SSR app on Vite. Bun is the
package manager (`bun.lock`). Tailwind v4 (config in CSS, no `tailwind.config`),
shadcn/ui in `base-nova` style over `@base-ui/react` primitives.

**Installed versions** (verified from `node_modules`, not `package.json`):

| Package | Installed |
| --- | --- |
| `@tanstack/react-start` | 1.168.26 |
| `@tanstack/react-router` | 1.170.16 |
| `@tanstack/react-router-ssr-query` | 1.167.1 |
| `@tanstack/router-plugin` | 1.168.18 |
| `@tanstack/react-query` | 5.101.2 — **transitive only, not a direct dep** |
| vite | 8.1.0 (Rolldown is the default bundler in Vite 8) |
| react | 19.2.7 |
| typescript | ^6 |

**Step zero, before any feature work:** `package.json` pins every TanStack
package to `"latest"`. This framework is visibly moving — server routes were
restructured, the deploy `target` option was removed, `.inputValidator` was
renamed, and the `createMiddleware` default flipped. A `bun install` on another
machine can pull a different API surface. **Pin exact versions and add
`@tanstack/react-query` as a direct dependency.**

**What exists today:** a marketing site only. No database, no auth, no server
functions, no API routes, no deploy config, no tests. Content lives in typed
consts in `src/core/config/*.ts`. The one established data pattern is
"typed array + `getX(slug)` helper + a `paths` const map for type-safe `Link to=`"
(see `src/core/config/projects.ts`).

**Design system:** `docs/design-system.md`, `docs/design-rules.md`,
`docs/code-rules.md`, `docs/overview.md`, and `AGENTS.md`. Read them. Ivory /
slate / olive palette, fluid `text-display-*` / `text-paragraph-*` scale,
`Container` owns layout width, one serif-italic accent word per heading, dark
mode and reduced motion are part of "done". Prettier: no semicolons, double
quotes, printWidth 80.

**Voice:** plain, understated, curious, never promotional. CodeVault runs
*projects*, not products. Avoid "platform", "solution", "get started".

---

## 1. The decision that reframes everything

An earlier draft of this plan had reports authored as LaTeX in a private git
repo, compiled by CI, and pushed to storage — a **build-based** archive. That is
abandoned. This plan is **submission-based**: you author and compile a PDF
wherever you like, then deposit it through an authenticated dashboard.

This is how real institutional repositories work. DSpace, EPrints, Invenio,
Zenodo and NTRS are all submission systems, not build pipelines. Aligning with
that prior art is worth more than the reproducibility the CI model offered.

**But be honest about what was lost.** The CI model gave the archive its
trustworthiness through automated gates: `latexmk` clean exit, zero undefined
references, no `TODO` surviving into the PDF, deterministic checksums, and
metadata provably identical between the PDF cover page and the record page
because both derived from one `report.yaml`.

All of that disappears with the pipeline. Two consequences drive the design:

1. **Server-side validation is now the primary safety net, not a backstop.**
   Section 9 is load-bearing, not defensive detail.
2. **"Metadata has one source" is genuinely broken, not bent.** A locally
   compiled PDF and a hand-filled form will drift. The mitigation: extract the
   PDF's embedded title/author metadata server-side on ingest and **diff it
   against the submitted form values**, surfacing a warning in the dashboard.
   Cheap, and it restores most of the guarantee.

**One write path, two clients.** The dashboard UI and the bulk-import CLI both
call the same ingest service layer. Never two write paths into one datastore.

---

## 2. Principles

1. **The report is the artifact. The record page is the front door.** The PDF is
   the deliverable, but the record page — ID, title, authors, abstract, date,
   type, keywords — is what people find, cite, and link. It is a catalogue entry
   that happens to have a file attached.
2. **Default deny.** `classification` is required, has no default, and is
   enforced in the query layer — never in a template.
3. **The security boundary is the server function, not the route.** See §7.
4. **Withdrawal is a state transition, not a delete.** Citations must not break.
5. **Validate at publish, not at save.** Drafts may be incomplete; published
   records may not.

---

## 3. Scope — three surfaces

| Surface | Path | Audience | Auth |
| --- | --- | --- | --- |
| **Reports server** | `/reports/*` | Public | None (public records only) |
| **Login** | `/login`, `/enroll` | Staff | Passkey |
| **Admin dashboard** | `/admin/*` | Staff | Passkey + role |

The marketing site (`/`, `/projects/*`) is untouched except for one nav link.

**Navbar separation — a requirement, and it falls out for free.** `__root.tsx`
renders a bare `<Outlet/>` with no navbar; the navbar is composed per-page
(`src/components/layout/navbar.tsx`, used by `project-shell.tsx` etc.). So the
three surfaces become sibling layout branches:

```
src/routes/
  __root.tsx              bare shell, no chrome
  _marketing.tsx          → <Navbar/> (marketing) + <Outlet/> + <Footer/>
    _marketing.index.tsx
    _marketing.projects.*.tsx
  reports.tsx             → <ReportsNavbar/> + <Outlet/>      ← has Sign in
    reports.index.tsx
    reports.$reportId.tsx
    reports.browse.tsx
  admin.tsx               → <AdminShell/> + beforeLoad guard
    admin.index.tsx
    admin.reports.tsx
    admin.deposit.tsx
    ...
  login.tsx
  enroll.tsx
```

`ReportsNavbar` is a **separate component**, not `Navbar` with a conditional. The
login button therefore cannot structurally leak onto consumer pages. Do not add
an `isAdmin` prop to the marketing navbar — that is precisely the coupling this
structure exists to prevent.

Route conventions (verified): `_` prefix = pathless layout (no URL segment);
`_` suffix = escape nesting; `(folder)` = organizational group, not in URL;
`$` = path param; `-` prefix = excluded from the route tree (colocate helpers);
`__root.tsx` required. `routeTree.gen.ts` is generated — never hand-edit.

---

## 4. Domain model

### 4.1 Lifecycle

Borrowed from EPrints, which uses a single `eprint_status` field with four
values (`inbox` / `buffer` / `archive` / `deleted`) over identical metadata.

```
draft ──submit──▶ in_review ──publish──▶ published ──withdraw──▶ withdrawn
  ▲                   │                      │
  └───return──────────┘                      └──▶ new draft (edit in place)
                                             └──▶ new record (revision, §4.3)
```

**`in_review` is optional and off by default.** For an archive with one or two
trusted authors, a review queue is a state whose only occupant is the person who
created it — ceremony without signal. Research into repository curation practice
is consistent on this: the highest-value curation is *improving documentation*,
not gatekeeping the publish button, and quality is better enforced by required
fields, controlled vocabularies, and minimum word counts than by human review.
So: keep the state in the enum (adding it later is a migration), but let a single
author go `draft → published` directly.

Keep NTRS's `technical_review_type` as **metadata** — a record of what review the
document actually received — rather than as a workflow state. That is the useful
half of the idea.

### 4.2 Two orthogonal flags, not states

Every mature system models these as attributes, not lifecycle states. Making
embargo a state creates a whole class of "who un-embargoes it" bugs.

- **`embargo_until timestamptz null`** — applied per-record *and* per-file.
  DSpace evaluates this lazily as a policy start date; no cron job. Copy that:
  compute visibility at query time from `now()`, don't run a job that flips rows.
- **`discoverable boolean not null default true`** — DSpace's "non-discoverable"
  concept. Orthogonal to access. A non-discoverable record is absent from search,
  browse, sitemap and RSS but reachable by direct link.

### 4.3 Classification, and NTRS's actual mechanism

NTRS's public corpus exposes only `distribution: PUBLIC`, `status: CURATED`. The
interesting field is **`disseminated`**, sampled live across 600 records as
`DOCUMENT_AND_METADATA` (472) or `METADATA_ONLY` (128).

That is the mechanism to copy, and it is better than a single public/internal
switch: **one enum decides whether *files* are served, independently of whether
the *record* is visible.** A metadata-only record is publicly findable and
citable while the document itself is withheld. It generalizes the "available on
request" case without a bespoke code path.

```sql
create type classification as enum ('public', 'internal');
create type dissemination  as enum ('document_and_metadata', 'metadata_only');
```

- `classification = 'internal'` → the whole record is invisible to anonymous
  viewers. Title, abstract, existence: all hidden. Leaking the *title* of an
  internal report is still a leak.
- `dissemination = 'metadata_only'` → record page is public; the PDF is not
  served.

⚠️ **Scope note.** "Internal" here means commercially sensitive / staff-only. If
it ever means *government-classified*, this design is not appropriate — that is a
FISMA-authorized-system problem, not a self-built Node app. Decide this before
Phase 3.

### 4.4 Revisions — separate records, typed relations

NTRS has **no version field and no version chain**. A revision is an independent
record with its own ID, joined by a typed relation:

```json
"related": [{ "type": "SUPERSEDED_BY", "accessionNumber": "NACA-RM-L53G28" }]
```

This is the opposite of Invenio/Zenodo's parent-child versioning, and for
technical reports it is more honest: *Rev B is a distinct published document, not
an edit of Rev A.* Adopt the NTRS model.

Use DataCite 4.6's controlled relation vocabulary rather than inventing one:
`IsNewVersionOf`, `IsPreviousVersionOf`, `Obsoletes`, `IsObsoletedBy`,
`IsSupplementTo`, `References`.

Metadata *corrections* (typo in an abstract) edit in place with no new record.
Follow Zenodo here: make post-publication metadata editing cheap and
unceremonious. If fixing a typo requires a workflow, typos don't get fixed.

### 4.5 Identifiers

`CV-2026-0042` — prefix, year, zero-padded sequence, allocated server-side and
monotonic within the year. Human-legible, sortable, speakable. NTRS's opaque
`20260000042` is worse for a small archive.

Permanent and never reused, even after withdrawal. Independent of title, project,
slug, and storage path.

**`report_number` is a separate, multi-valued, non-unique field.** NTRS keeps
`otherReportNumbers` (`NASA-CR-156800`) distinct from `id`, and so should we: the
ID is a database fact, report numbers are editorial and may repeat across
revisions.

**Do not buy DOIs.** DataCite is €2,000/yr institutional membership plus a
revenue-scaled infrastructure fee — roughly **€3,000/yr** for a small for-profit
studio, and the commitment is perpetual, not annual. What actually makes an
identifier persistent is URL discipline, not a registry. `codevault.dev/reports/CV-2026-0042`
that never 404s beats a DOI pointing at a URL you reorganized.

The hedge costs nothing: a nullable `doi` column plus a polymorphic
`identifiers` table, and a DataCite-shaped internal model (§10.3). Registering
DOIs later becomes a serialization exercise, not a migration. ARK is the free
alternative (NAAN registration costs nothing) but carries no citation-network
benefit, which is the only reason to want a DOI in the first place.

**Build the tombstone path on day one**, before there is anything to tombstone.
Per DataCite guidance a tombstone page must carry the full bibliographic
citation, show the identifier in human- and machine-readable form, and state
clearly that the item is no longer available. Record `dateType: "Withdrawn"` with
a reason. Getting this right now is what makes DOIs addable later without regret.

### 4.6 Record fields

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `CV-YYYY-NNNN` | Permanent, never reused |
| `status` | enum | draft / in_review / published / withdrawn |
| `classification` | enum | public / internal — **required, no default** |
| `dissemination` | enum | document_and_metadata / metadata_only |
| `discoverable` | bool | default true |
| `embargo_until` | timestamptz? | Lazily evaluated |
| `title` | text | No trailing period |
| `authors` | jsonb | `{name, affiliation?, orcid?}[]` — ordered, order is meaning |
| `abstract` | text | ≥75 words to publish (§11) |
| `doc_type` | enum | report / memorandum / note / conference_paper / presentation / preprint / dataset / white_paper |
| `technical_review_type` | enum | none / internal / external / single_expert |
| `project_slug` | text? | FK into `src/core/config/projects.ts` |
| `subject_category` | text | Controlled vocabulary, one per record |
| `keywords` | text[] | 3–8, controlled vocabulary |
| `report_numbers` | text[] | Editorial, non-unique |
| `license` | text? | SPDX id |
| `funding` | jsonb? | `{number, type}[]` — NTRS parity |
| `doi` | text? | Null until/unless registered |
| `published_at` | date | Date of record |
| `withdrawn_at`, `withdrawn_reason` | | Tombstone data |

Derived on ingest, never hand-entered: `pdf_key`, `file_size`, `page_count`,
`checksum` (sha256), `fulltext`, `thumb_key`, `pdf_embedded_title` (for the drift
diff in §1).

### 4.7 The abstract carries the SEO

There is no HTML reading view — the PDF is the artifact. That means search
engines index the record page and nothing else. NTRS survives this because its
abstracts are substantive. The abstract is not a teaser; it is the only prose
about this report a machine will ever read. A thin abstract is a validation
failure, not a style preference.

(NTRS's own honest escape hatch, from a real curated record: *"There are no
author-identified significant results in this report."* Sometimes the truthful
abstract is thin — allow an explicit override with a recorded reason rather than
an unbounded word-count wall.)

---

## 5. Storage

Three classes of data, three homes.

| Data | Home | Why |
| --- | --- | --- |
| Metadata, sessions, audit log | Postgres | Queried, faceted, access-controlled |
| PDFs, extracted text, thumbnails | Cloudflare R2 | Binary, CDN-served, free egress |
| Nothing | git | The repo holds code, not content |

### 5.1 Buckets

```
codevault-reports-public      CDN-fronted, public read
codevault-reports-internal    no public access; every read is a presigned URL
codevault-reports-quarantine  short-lived; lifecycle rule expires after 24h
```

Three buckets rather than one with per-object ACLs. A misconfigured ACL on one
object is invisible; a misconfigured bucket policy is loud and testable.

### 5.2 Key layout

```
reports/CV-2026-0042/v1/report.pdf
reports/CV-2026-0042/v1/report.txt      pre-extracted full text
reports/CV-2026-0042/v1/thumb.webp      cover-page render
```

**R2 has no object versioning.** The `/v1/` segment is therefore load-bearing,
not cosmetic — it is the only versioning mechanism available.

Also serve the extracted text at a public URL, as NTRS does at
`/api/citations/{id}/downloads/{id}.txt`. Cheap, and it makes both our search and
any consumer's life easier.

### 5.3 Serving files safely — separate registrable domain

**Serve every PDF from a separate registrable domain**, e.g. `codevaultusercontent.com`.
Not a subdomain — `assets.codevault.dev` is same-*site*, so parent-domain cookies
stay reachable. This is the pattern behind `googleusercontent.com` and
`githubusercontent.com`, and it is the one mitigation that still holds when the
others are misconfigured.

Headers on every file response:

```
Content-Type: application/pdf              explicit, never sniffed
X-Content-Type-Options: nosniff
Content-Security-Policy: sandbox; default-src 'none'; frame-ancestors 'none'
Cross-Origin-Resource-Policy: same-site
Content-Disposition: attachment            on /download
```

Two endpoints, because `attachment` is incompatible with an in-browser viewer:
`/download/<id>` sends `attachment`; `/raw/<id>` sends `inline` and is consumed
only by pdf.js via fetch, never navigated to directly.

⚠️ **VERIFY:** CSP `sandbox` is specified for *documents*; its behavior on an
`application/pdf` response rendered by a native browser plugin is not
well-specified and varies. Treat as defense-in-depth, not a guarantee.

---

## 6. Database

**Postgres, with Drizzle as the ORM — decided, not open.** Full-text search via
`tsvector` + GIN, comfortable well past this archive's scale, and one system
instead of two (no sync job, no drift between DB and index). Revisit Meilisearch
only if search quality becomes a measured complaint, and then as a read replica
of this table.

```sql
create type classification  as enum ('public','internal');
create type dissemination   as enum ('document_and_metadata','metadata_only');
create type report_status   as enum ('draft','in_review','published','withdrawn');

create table reports (
  id               text primary key,              -- CV-2026-0042
  status           report_status not null default 'draft',
  classification   classification not null,       -- deliberately no default
  dissemination    dissemination not null default 'document_and_metadata',
  discoverable     boolean not null default true,
  embargo_until    timestamptz,

  title            text not null,
  abstract         text not null default '',
  authors          jsonb not null default '[]',
  doc_type         text not null,
  technical_review_type text not null default 'none',
  project_slug     text,
  subject_category text,
  keywords         text[] not null default '{}',
  report_numbers   text[] not null default '{}',
  license          text,
  funding          jsonb not null default '[]',
  doi              text unique,

  pdf_key          text,
  thumb_key        text,
  page_count       int,
  file_size        bigint,
  checksum         bytea,                          -- sha256, 32 bytes
  fulltext         text,
  pdf_embedded_title text,                         -- for the drift diff

  published_at     date,
  withdrawn_at     timestamptz,
  withdrawn_reason text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  search_vector tsvector generated always as (
    setweight(to_tsvector('english', coalesce(title,'')),    'A') ||
    setweight(to_tsvector('english', coalesce(abstract,'')), 'B') ||
    setweight(to_tsvector('english', array_to_string(keywords,' ')), 'C') ||
    setweight(to_tsvector('english', coalesce(fulltext,'')), 'D')
  ) stored
);

create index on reports using gin (search_vector);
create index on reports (status, classification, published_at desc);
create unique index on reports (checksum) where checksum is not null;

create table report_relations (
  from_id  text not null references reports(id),
  to_id    text not null references reports(id),
  relation text not null,        -- DataCite vocabulary, §4.4
  primary key (from_id, to_id, relation)
);

create table report_files (
  id            bigint generated always as identity primary key,
  report_id     text not null references reports(id),
  kind          text not null,   -- 'pdf' | 'text' | 'thumb' | 'source'
  bucket        text not null,
  key           text not null,
  byte_size     bigint not null,
  checksum      bytea not null,
  embargo_until timestamptz      -- per-file embargo, §4.2
);
```

⚠️ **Ignore Drizzle's own full-text-search guide here.** It states that Drizzle
"doesn't natively support tsvector as a column type" and demonstrates computing
`to_tsvector()` inline in the `WHERE` clause. That defeats the GIN index and will
table-scan a document corpus. Use the **stored generated column** above, declared
via `customType` + `generatedAlwaysAs` with `.using("gin", …)` — Drizzle supports
this properly. `ts_rank`, `websearch_to_tsquery`, and `plainto_tsquery` are all
reachable through the `sql` template.

**Full text is indexed at weight D from day one** even though v1 search only
surfaces title/abstract matches strongly. Extraction is one ingest step and a
text column; having it means enabling body search later is a ranking tweak rather
than a re-ingest of every document.

⚠️ **Watch the TOAST cost.** Extracted text from a technical report runs 50KB–2MB.
At a thousand reports that is gigabytes of TOASTed text, and it dwarfs row-insert
cost. Build the GIN index `concurrently` *after* a bulk load, never during.

---

## 7. Authentication

**Better Auth 1.6.23** (npm `latest`, published 2026-07-02) with the passkey
plugin, which wraps `@simplewebauthn/server` 13.3.2. It has a genuine first-party
TanStack Start integration — `better-auth/tanstack-start` exports a
`tanstackStartCookies()` plugin — not a community shim.

Ruled out: **Lucia** is deprecated (v3 EOL March 2025, repositioned as a
learn-to-build-it-yourself resource). **Auth.js** has no first-party Start
adapter. **Clerk/WorkOS** put identity outside the Postgres our authorization
queries run against, which is structurally at odds with §2's default-deny thesis,
and save nothing at this user count.

### 7.1 Passkey-only, no password

Two independent arguments converge, which is unusual and worth leaning on:

- **Security.** CISA classifies FIDO2/WebAuthn as phishing-resistant and OTP as
  explicitly *not*. TOTP is phishable by construction — anything a user can type
  into the real site they can type into an attacker-in-the-middle proxy. WebAuthn
  signatures are origin-scoped and cannot be proxied. With no password,
  credential stuffing is structurally impossible.
- **Accessibility.** Transcribing a one-time code is a *cognitive function test*
  under WCAG SC 3.3.8, so **password + TOTP fails WCAG AA** unless paired with a
  non-cognitive alternative. WebAuthn satisfies 3.3.8 and AAA-level 3.3.9.

You asked for "extremely secure" and "accessible". They point the same way here.

Synced passkeys meet **AAL2** per NIST SP 800-63-4 (final, updated 2025-08-26),
conditional on each admin's own Apple/Google/1Password account being MFA-protected
— at this team size, verify that by policy rather than assuming it. Synced
passkeys do **not** meet AAL3 (syncing violates non-exportability); AAL3 needs
device-bound hardware.

### 7.2 Configuration

```ts
emailAndPassword: { enabled: false, disableSignUp: true },
passkey: {
  rpID: "codevault.dev",        // pick BEFORE first enrollment — changing it
  rpName: "CodeVault",          // invalidates every existing credential
  authenticatorSelection: {
    userVerification: "required",   // NOT "preferred" — see below
    residentKey: "required",        // discoverable; kills username enumeration
  },
  attestation: "none",
},
```

- **`userVerification: "required"`, and verify the UV flag server-side.** This
  contradicts SimpleWebAuthn's general `"preferred"` guidance, which optimizes
  consumer signup funnels. Wrong tradeoff here: `"preferred"` lets an assertion
  silently degrade to single-factor and drop below AAL2.
- Algorithms `[-7, -8, -257]` (ES256, EdDSA, RS256). Keep RS256 or you lock out
  Windows Hello / TPM.
- **Signature counter: store it, but skip the check when `signCount === 0`** —
  synced passkeys report 0 permanently, and a strict regression check locks out
  legitimate users. (Note: `signCount` is *not* deprecated in WebAuthn L3
  despite widespread claims; it remains normatively defined. WebAuthn L3 is still
  a Candidate Recommendation — L2 is the REC.)
- **Persist `credentialDeviceType` and `credentialBackedUp`** (the BE/BS flags).
  These let you enforce "at least one hardware key" by policy instead of by FIDO
  MDS machinery.
- **Skip FIDO MDS / AAGUID allowlisting.** Bad tradeoff at this scale — MDS
  fetching, caching, staleness, and it breaks when someone buys an unlisted key.
  The stored device-type flag gets the same outcome.

⚠️ **VERIFY before trusting `disableSignUp` alone.** That flag governs the
email/password sign-up route. It is not by itself proof that a passkey-only
config exposes no other credential-creating endpoint. **Enumerate the routes
mounted on `auth.handler` and add a test asserting every non-allowlisted path
returns 403/404.** Treat "not in the docs" as unverified, not absent.

### 7.3 Enrollment — the real custom work

Better Auth's `addPasskey()` is session-authenticated: it assumes a logged-in
user. A provisioned-but-unenrolled admin has no session and no password, so
**there is no built-in first-passkey flow.** This is the one genuinely custom
piece of the auth work. Budget for it.

1. CLI creates the user row with **zero credentials**.
2. CLI mints a one-time, ~1h TTL, single-use enrollment token. **Store only its
   SHA-256 hash.**
3. Deliver the token **out-of-band** (Signal, in person) — never to the email
   that is the account identifier.
4. `/enroll?token=…` validates the hash, generates WebAuthn registration
   options, verifies the response, writes the credential, and **burns the token
   atomically**.
5. Require a **second credential** before granting access to internal documents.

**This same path is the recovery path — build it once.**

### 7.4 Recovery, with no help desk

- **Two credentials minimum, on different failure domains** (one synced, one
  hardware key). Enforce in code: block internal documents until
  `credentialCount >= 2`. This is the primary control.
- **Admin-issued re-enrollment token**, with a *different* admin issuing than
  requesting — cheap two-person control, mirroring Entra's Temporary Access Pass.
- **Out-of-band voice/video verification** as the policy wrapper. At this team
  size, people who know each other beats anything automated.
- **A hardware key in a safe** (~$50) as break-glass.
- **Recovery codes: last resort only.** Hashed, single-use, high-entropy. They
  reintroduce exactly the phishable shared secret passkeys were adopted to
  escape. Consider requiring two codes from two people.
- **Never:** security questions, SMS, or email magic links.

### 7.5 Sessions

Better Auth defaults to `expiresIn: 604800` (7 days). **Far too long here.**

- Idle timeout **30–60 min**; absolute **8–12 h**.
- **`useSecureCookies: true` explicitly** — the default is `false`, which is a
  production footgun.
- **DB-backed sessions, not JWT.** We need instant revocation and session
  listing; a stateless token gives neither.
- Store only `sha256(token)`. A fast hash is fine — the token is high-entropy,
  so there is no brute-force margin to defend.
- Rotate the session ID on login and on privilege change (session fixation).
- Rate limiting: `storage: "database"`, not the default `"memory"`, which won't
  survive a restart or a second instance.

⚠️ **VERIFY:** whether `cookiePrefix: "__Host-"` composes correctly with Better
Auth's `better-auth.session_token` naming. The prefix requires `Path=/`,
`Secure`, and *no* `Domain`. **Read the actual `Set-Cookie` header** rather than
assuming.

### 7.6 The enforcement point

TanStack Start's own docs are explicit, and this is the single most important
thing in this document:

> "Protect the data/API boundary first. Any server function, server route, or
> other API endpoint that returns or mutates private data must authorize the
> request itself." … "`beforeLoad` is useful for route UX… **It is not the
> security boundary for the data.**"

Every `createServerFn` is a same-origin RPC endpoint reachable by direct HTTP
POST regardless of which route rendered the UI. A `beforeLoad` guard on
`/admin/*` protects nothing if the underlying server function doesn't re-check.

Therefore:

**Register auth and CSRF as *global* middleware in `src/start.ts`**, so
protection is opt-*out* rather than opt-in. Per-function `.middleware([auth])`
means one forgotten attachment is an unauthenticated data endpoint.

```ts
// src/start.ts
import { createStart } from "@tanstack/react-start"

export const startInstance = createStart(() => ({
  requestMiddleware:  [sessionMiddleware],
  functionMiddleware: [authMiddleware, csrfMiddleware],
}))
```

- `createMiddleware({ type })` — **pass `type` explicitly.** The default is
  `'request'`; older tutorials assume `'function'`. Getting this wrong silently
  attaches the wrong kind.
- Every `.server`/`.client` **must return `next()`**.
- **`sendContext` from the client is untrusted.** Derive the session server-side
  from cookies + DB, never from client-supplied context.
- TanStack Start ships **`createCsrfMiddleware()`**, which validates `Sec-Fetch-Site`
  / `Origin` / `Referer` and rejects requests carrying none of them by default.
  ⚠️ **VERIFY** its exact options shape — confirmed to exist as an export, but
  read from types rather than documented.

**And: whatever `beforeLoad` returns is serialized and shipped to the client.**
Return a narrow user projection — never a password hash, session secret, or
internal flag.

### 7.7 The highest-leverage hardening

**Put an identity-aware proxy in front of the whole app** — Cloudflare Access or
Tailscale. That moves the perimeter off the Node process entirely and is worth
more than everything else in this section combined.

IP allowlisting is a poor fit — a distributed team on residential and mobile IPs
means high lockout risk for low marginal value once passkeys are origin-bound.

**Audit log**, append-only with hash chaining (each row stores
`sha256(prev_hash || row)`) so tampering is detectable. Record actor, credential
ID used, report ID, classification, IP, user-agent, outcome. **Never log** session
tokens, enrollment tokens, or WebAuthn challenges.

Headers: HSTS + preload, `frame-ancestors 'none'`, `Referrer-Policy: no-referrer`,
`Clear-Site-Data` on logout. ⚠️ CSP with Vite SSR inline scripts and nonces is
fiddly — give it its own spike.

---

## 8. The admin dashboard

### 8.1 Screens

| Route | Purpose |
| --- | --- |
| `/admin` | Overview: counts by status, recent deposits, drafts needing attention, storage used, failed ingests |
| `/admin/reports` | Table of every record. Filter by status / classification / type / year. Bulk actions. |
| `/admin/deposit` | **The deposit flow** — §8.2 |
| `/admin/reports/$id` | Edit metadata, manage files, change state, add relations |
| `/admin/reports/$id/revise` | Create a successor record, pre-filled, auto-linked `IsNewVersionOf` |
| `/admin/users` | Provision, list credentials, revoke sessions, issue enrollment tokens |
| `/admin/audit` | The audit log, filterable |
| `/admin/imports` | Bulk import runs and their per-item outcomes (§10.5) |

### 8.2 Deposit flow

Deliberately **not** a wizard that hides fields. One page, four sections, with
the upload first because everything else can be pre-filled from it.

1. **Upload** — drag/drop, presigned PUT direct to the quarantine bucket, live
   progress. On completion the server validates and extracts (§9).
2. **Review extracted** — page count, file size, checksum, embedded title/author,
   a text-extraction preview, and the cover thumbnail. **This is where the
   metadata-drift diff surfaces**: if the PDF's embedded title differs from what
   you type in step 3, show it inline. Prefill title/authors from the PDF where
   present.
3. **Metadata** — the §4.6 fields. Controlled vocabularies as comboboxes, not
   free text. Live validation showing exactly what is blocking publish.
4. **Classification & publish** — classification (no default; the form cannot be
   submitted until explicitly chosen), dissemination, discoverable, embargo.
   Then *Save draft* or *Publish*.

**Save is always permitted. Publish runs §11's gate.** The dashboard shows a
persistent checklist of what's missing rather than failing on submit.

### 8.4 The core loop, end to end

This is the system. Everything else in this document supports it. It must work
as a single continuous path before anything is broadened.

```
 1. Sign in            /login       passkey → session cookie
 2. Deposit            /admin/deposit
      a. drop PDF   → presigned PUT → quarantine bucket
      b. server validates, sanitizes, extracts       (§9)
      c. form prefills from the PDF; you fill the rest
      d. choose classification — no default, cannot be skipped
 3. Publish            gate runs    (§11)
      → allocates CV-2026-0001
      → copies file from quarantine to the public bucket
      → status: draft → published
 4. It is live         /reports/CV-2026-0001
      → record page, metadata table, abstract
      → Download button → separate content domain, §5.3 headers
      → BibTeX / RIS export
      → appears in /reports listing
      → Highwire meta tags in the server-rendered HTML   (§12)
 5. Sign out           → the same URL still works, because it is public
```

**Step 5 is the acceptance test, not a formality.** Open the record page in a
private window with no session. If it renders, the public path is genuinely
public and doesn't accidentally depend on your admin session. If you then flip
the record to `classification: internal` and reload that same window, it must
404 — not 403, which would confirm the record exists.

Three things about this loop are worth stating explicitly because they are easy
to get subtly wrong:

- **Publication is a state transition, not a copy into a second system.** There
  is one `reports` table. The public site and the dashboard read the same rows
  through the same query layer, differing only in the `Viewer` passed in. A
  separate "published" table would drift.
- **The ID is allocated at publish, not at draft.** A draft that is never
  published should not burn a permanent identifier, because IDs are never
  reused (§4.5). Drafts are keyed by an internal UUID until then.
- **The file moves buckets at publish**, from quarantine to public or internal.
  Until then it is not reachable from any public URL, which means an abandoned
  draft is never accidentally live.

### 8.3 Upload client

**Roll it ourselves — about 100–150 lines.** At ≤100 MB, R2's 5 GiB single-PUT
ceiling means multipart is unnecessary, so this is: presign server-side, one
`XMLHttpRequest` PUT, `xhr.upload.onprogress` for the bar, `xhr.abort()` wired to
an `AbortController`, plus a retry wrapper.

Use **XHR, not `fetch`** — `fetch` still has no portable upload progress
(request streaming is Chromium-only and HTTP/2-gated).

Rejected: **Uppy** (~500KB of plugin graph to issue one PUT); **react-dropzone**
(alive, but shipped five majors in six months, two of them on 2026-07-18 — if
used, pin exactly, never float the major); **FilePond** (React wrapper 19 months
stale); **tus** (R2 has no native tus endpoint; you'd operate a translation shim
for resumability S3 multipart already provides). Note **shadcn has no official
file-upload primitive** — verified 404 on the registry; everything marketed as
one is third-party.

Migration path stays open: Uppy's `getUploadParameters` is just "return a
presigned URL", so the endpoint built now is the one Uppy would call later.

---

## 9. The ingest pipeline

This is the safety net that replaced CI. Take it seriously.

```
browser ──presigned PUT──▶ quarantine bucket
                                │
                     R2 event notification → Cloudflare Queue
                                │
                                ▼
              ┌── HEAD: actual size within limit?      ─── no ─▶ delete, reject
              ├── ranged GET 4KB: %PDF- magic bytes?   ─── no ─▶ delete, reject
              ├── CDR sanitize (§9.3)
              ├── extract: page count, embedded title/author, full text
              ├── render cover thumbnail
              ├── sha256 → dedupe check
              └── copy to public|internal bucket, delete from quarantine
```

### 9.1 Why quarantine

**R2 does not support presigned POST** — verified: it supports GET, HEAD, PUT,
DELETE only. Presigned POST is what carries S3's `content-length-range` policy
condition, so **on R2 there is no way to enforce a size cap at upload time.** A
client can write an oversized object before you can delete it.

Mitigations, in order: short presign TTL (5–10 min), server-generated keys (never
user-controlled paths or extensions), `Content-Type` pinned into the signature,
per-user rate limits on presign issuance, and a lifecycle rule expiring the
quarantine bucket after 24h. Then `HeadObject` after upload and delete if it
violates policy.

⚠️ Signing `Content-Length` into `SignedHeaders` is sometimes suggested as a
workaround. It pins an exact byte count, and **no Cloudflare doc confirms R2
enforces it. VERIFY before relying on it.**

**Drive validation from R2 event notifications, not the client callback.** R2 has
a native event-notification mechanism into Cloudflare Queues (distinct from the
S3-compat bucket-notification API, which R2 does *not* implement). A client that
uploads and never calls your completion endpoint otherwise leaves an unvalidated
object sitting forever.

### 9.2 Validation

Client `Content-Type` is untrustworthy — OWASP: *"trivial to spoof."* Check the
`%PDF-` signature (`25 50 44 46 2D`). Note OWASP's own hedge: magic bytes
"should not be used on its own, as bypassing it is pretty common and easy." A
file can be a valid PDF *and* valid HTML to a sniffing browser. Headers and
origin isolation (§5.3) are what close that hole; magic bytes only catch the
accidental case.

Library: `file-type@22.0.1` (ESM-only, Node ≥22) or `magic-bytes.js@1.13.0` if
CJS-bound. Enforce size limits and run parsing with timeouts — robustness against
malformed input is explicitly best-effort.

### 9.3 Sanitize, don't scan

**Skip ClamAV.** It needs ~4GB always-on (1.2GB to load definitions, spiking to
~2.4GiB during daily signature reload; ClamAV's own docs say 2GB is
insufficient), it's signature-based and weak against novel malicious PDFs, and it
addresses *endpoint infection* — which is not the threat model. For an archive
serving PDFs to browsers the risk is **stored XSS and content hijacking**, and
scanning does nothing for those.

(AWS GuardDuty Malware Protection for S3 does not cover R2 — it hooks S3 via
EventBridge and IAM, neither of which R2 exposes.)

**Do CDR instead** — Content Disarm & Reconstruct, which OWASP names for exactly
this file type. It is deterministic rather than probabilistic: it strips
dangerous constructs (`/JavaScript`, `/JS`, `/OpenAction`, `/AA`, `/Launch`,
`/EmbeddedFile`) whether or not anyone has a signature for them.

- **`mutool clean`** for well-formed files — garbage collection, xref compaction,
  stream cleaning. Preserves fidelity.
- Escalate to a **Ghostscript PDF→PostScript→PDF round-trip** when a structural
  scan finds any dangerous key. PostScript has no representation for embedded
  JavaScript, so the constructs cannot survive the intermediate format. Costs:
  possible rasterization, loss of bookmarks/links. **Ghostscript has its own CVE
  history — run it sandboxed (`-dSAFER`, no network, resource limits).**
- **qpdf is not a sanitizer.** It has no JavaScript or OpenAction removal flag —
  confirmed by qpdf issue #1312, an open request for exactly that.

Re-verify magic bytes on the *output*, and store only the sanitized artifact.

### 9.4 Extraction

Container host (§10.1), so native binaries are available and faster:
`pdftotext` / `pdftoppm` (poppler-utils), `mutool`. Pure-JS fallback:
`unpdf@1.6.2` or `pdfjs-dist@6.1.200`.

If rendering PDFs client-side with pdf.js: **keep it current and never pass
`enableScripting: true`.** Note the ubiquitous `isEvalSupported: false` advice is
**obsolete** — the option was removed in v4.2.67 when glyph handling was
restructured to eliminate `eval()`, and setting it today is silently ignored.
CVE-2024-4367 (High) affected ≤4.1.392 and allowed arbitrary JS "in the context
of the hosting domain" — which is precisely why §5.3's separate domain matters.

⚠️ **Prototype extraction on ~50 representative real reports before building the
pipeline around it.** Every other component here is a solved problem with a
well-worn library; extraction quality on multi-column layouts, tables, and
scanned pages is where the time will actually go and where results disappoint.

**If extraction yields nothing, still store the document with `fulltext = null`.**
Losing an archived file because OCR failed is far worse than having one you can't
full-text search yet. Backfill later as a separate pass keyed off
`fulltext is null`.

---

## 10. Environments

### 10.1 Hosting

**Node server via Nitro on a container host** (Fly.io / Railway class).

Driven by three constraints: a persistent Postgres pool needs a long-lived
process; native PDF binaries (poppler, mupdf, Ghostscript) need a container; and
**Cloudflare Workers is ruled out** — it forces HTTP-based Postgres and breaks
pool reuse.

Note the Vite plugin **no longer has a `target` option** — that was removed.
Hosting is configured by adding a separate plugin (`nitro/vite` with
`preset: 'node-server'`). Build output is `.output/server/index.mjs`.
Guard the DB pool behind a module singleton so it survives dev HMR.

### 10.2 Local development

`docker-compose.yml` with Postgres 18 + **SeaweedFS** for S3-compatible storage.
One command brings the stack up, runs migrations, and seeds.

```bash
bun run dev:up        # docker compose up -d && migrate && seed
bun run dev           # SSR dev server on :3000
bun run dev:reset     # drop, migrate, seed — a clean slate in seconds
```

**Do not use MinIO.** `minio/minio` is **archived and read-only** as of
2026-04-24; its last release was October 2025, so it has had no security patches
for nine months and none are coming. The community edition is source-only, with
users directed to commercial AIStor. The OpenMaxIO console fork is not archived
but has had no commits since 2025-06-24 — effectively abandoned. **LocalStack is
also out**: since 2026-03-23 it requires an auth token to run at all, and its
permanent free tier is non-commercial only.

**SeaweedFS** (Apache 2.0, actively maintained, adopted by Kubeflow Pipelines as
its post-MinIO object backend) supports presigned URLs and multipart. Presigned
requests require the bucket in the path, which aligns with
`forcePathStyle: true` — what you want locally anyway.

**Consider Garage instead if you want the machine to enforce discipline.**
SeaweedFS *supports* object tagging and versioning; R2 does not. That mismatch
lets you write code locally that dies on deploy. Garage lacks roughly the same
feature set R2 lacks, so it fails loudly in dev exactly where prod would fail.
It's harder to configure and AGPL (irrelevant for a dev-only container). Lead
with SeaweedFS plus the storage interface below; switch to Garage if drift bites.

**The parity discipline: a narrow storage interface that cannot express what R2
lacks.** Expose only `put / get / head / delete / list / presignUpload /
presignDownload`, clamp `expiresIn` to R2's 7-day ceiling internally, and
deliberately provide no way to set tags, ACLs, or versions. If the interface
can't express it, nobody writes code that breaks on deploy.

Differences to encode as config rather than discover at deploy: **region is
`auto` on R2**; **no presigned POST** (GET/HEAD/PUT/DELETE only); **presigned
URLs only work on `<ACCOUNT_ID>.r2.cloudflarestorage.com`, not custom domains**;
**ETag differs between single-PUT and multipart, so never use it as a content
hash**; **no full-object SHA-256** (only CRC-64/NVME); **no ACLs, no versioning,
no object tagging, no Object Lock**; and **multipart requires every part except
the last to be the same size**, which S3 does not — an adaptive-part-size
uploader works on S3 and fails on R2.

Set `requestChecksumCalculation: "WHEN_REQUIRED"` and
`responseChecksumValidation: "WHEN_REQUIRED"` on the S3 client. The AWS SDK
v3.729.0 change that began sending CRC32 on all uploads broke R2 and MinIO
alike; R2 has since added checksum support, but pinning the behavior costs
nothing and keeps the local emulator honest.

⚠️ **Use AWS SDK v3, not `Bun.S3Client`, for now.** Bun's native client
explicitly supports R2 and has nicer synchronous presigning, but its checksum
behavior is undocumented — precisely the thing that recently broke every
S3-compatible backend — and there is no escape-hatch flag.

**Two Postgres 18 Compose gotchas** (current stable 18.4, released 2026-05-14):
`PGDATA` is now version-specific at `/var/lib/postgresql/18/docker`, and the
declared volume moved up to the parent `/var/lib/postgresql`. **Mounting the old
`/var/lib/postgresql/data` path against an 18 image gives you a silently
non-persistent database.** Also, put `CREATE EXTENSION` statements in a
*migration*, not `/docker-entrypoint-initdb.d` — initdb scripts only run on an
empty data dir, and you need the extensions in production regardless.

### 10.3 Env configuration

`@t3-oss/env-core@0.13.11` + **Zod 4** (`zod@4.4.3`).

**Split into `src/env/server.ts` and `src/env/client.ts`. This is not
stylistic.** When `isServer` is false, t3-env still *constructs* the `server: {}`
object literal at module scope — so if they share a file, **every server variable
name ends up in the client bundle.** Values don't leak; names are still free
reconnaissance.

```ts
// src/env/client.ts
export const env = createEnv({
  clientPrefix: "VITE_",
  client: { VITE_ARCHIVE_CDN_URL: z.url() },
  runtimeEnv: import.meta.env,    // required — default is process.env, undefined in browser
  isServer: import.meta.env.SSR,  // statically replaced, so the server branch is eliminated
  emptyStringAsUndefined: true,
})
```

Never touch Vite's `envPrefix`. An empty prefix ships every DB credential to the
browser.

⚠️ **VERIFY once:** build for production and grep the client bundle for a known
secret value. Vite 8 uses Rolldown, and I could not confirm from docs that its
dead-code elimination of `import.meta.env.SSR` branches is byte-for-byte
equivalent to Rollup's.

### 10.4 Migrations and seeding

Three distinct things, often conflated. Keep them separate.

| Kind | Runs where | Idempotent | Content |
| --- | --- | --- | --- |
| **Migrations** | All envs, on deploy | By ledger | Schema only |
| **Reference seeds** | All envs, on deploy | Yes, by design | Subject taxonomy, doc types, controlled vocabularies |
| **Dev fixtures** | Local + CI only | Yes | ~30 fake reports with generated PDFs |

**Start on `drizzle-orm@1.0.0-rc.4`, not the 0.45 stable line.** Read the release
dates as a timeline: `drizzle-orm@0.45.2` is from 2026-03-27 and
`drizzle-kit@0.31.10` from 2026-03-17 — four months stale — while the RC line has
`rc.4` from 2026-06-27 and branch builds from yesterday. The stable line is in
maintenance; all engineering is on 1.0. The remaining pre-stable roadmap items
are MSSQL support, MariaDB support, and down migrations — **the first two are
irrelevant to a Postgres project.** Starting on 0.45 means adopting a frozen line
and paying a v0→v1 migration later for nothing gained now.

**Pin an exact RC version, not a `^` range.** There is a live regression —
[drizzle-orm#5777](https://github.com/drizzle-team/drizzle-orm/issues/5777),
open — where `drizzle-kit migrate` runs a full commutativity check on every
invocation, taking ~115s on a 70-migration repo even with nothing pending.
`--ignore-conflicts` suppresses the report but not the work. Seconds at our
migration count, but worth watching before it grows.

**`push` in local dev only; `generate` + `migrate` everywhere else.** `push`
diffs the TS schema straight against the live DB with no SQL artifact — fine
while a schema is churning, wrong for an archive holding data you cannot
recreate (`push --force` auto-accepts all data-loss statements). The reviewable,
committed SQL diff is the point.

**Migrations run as a discrete pre-deploy step, never at app boot — and the
reason is specific.** Drizzle's migrator has **no advisory lock**
([discussion #2624](https://github.com/drizzle-team/drizzle-orm/discussions/2624));
a proper lock is planned, not shipped. On a container host starting N replicas
simultaneously, boot-time `migrate()` means N processes racing the same DDL. Use
the platform's release hook (Fly `release_command`, Render pre-deploy, a one-shot
job elsewhere) so one process runs, exits non-zero on failure, and blocks the
rollout. If you ever must migrate at boot, wrap it in `pg_advisory_lock()`
yourself.

**There are no down migrations.** Drizzle doesn't ship them and it's still an
open v1 roadmap item. This is the real cost of the choice, and it's where most
teams land anyway. So:

- **Expand/contract.** Never destructive in one deploy. Add nullable column →
  backfill → deploy code writing both → deploy code reading new → *separately,
  later* drop the old. Each step is revertible by rolling back the app, not the DB.
- **Forward-fix.** A bad migration is corrected by a new one, not reversed.
- **Backups are the actual rollback.** Verify point-in-time restore *before* you
  need it.
- Use `CREATE INDEX CONCURRENTLY` on populated tables — the non-concurrent form
  takes a lock that will stall ingest. Drizzle emits explicit `BEGIN`/`COMMIT` in
  the SQL file rather than wrapping implicitly, so this works.

**Reference seeds** key on a natural key (slug), not a serial ID, and use
`onConflictDoUpdate` so edits propagate rather than silently no-op:

```ts
await db.insert(subjectCategories).values(CATEGORIES)
  .onConflictDoUpdate({
    target: subjectCategories.slug,
    set: { name: sql`excluded.name` },
  })
```

**The first admin user is never seeded with a secret.** `bun run admin:provision
--email …` creates the user with zero credentials and prints a one-time
enrollment URL (§7.3). Nothing secret is committed or stored at rest in the
platform's variable store. Guard it with a "create only if no admin exists" check
so it is idempotent and cannot be re-triggered to mint a second superuser.

**Fixture tooling:** `drizzle-seed@0.3.1` (Apache 2.0, maintained by the Drizzle
team, tracks the RC line) plus `@faker-js/faker@10.5.0`. Note drizzle-seed's docs
scope it to "testing, development, and debugging" — **it is a dev-fixture tool,
not a mechanism for production reference data.** Tier 3 only; hand-write tier 2.
**Do not adopt `@snaplet/seed`** — Snaplet shut down and open-sourced it in
August 2024 with Supabase announcing they'd maintain it; npm shows `0.98.0` last
published 2024-08-14, the literal day of that announcement. Nearly two years of
silence.

⚠️ **VERIFY:** both research passes flagged a possible **`bun-sql` concurrency
issue** ("Bun has issues with executing concurrent statements") reported around
Bun 1.2.0, and neither could confirm it against current docs — current Bun is
1.3.14. Concurrent ingest workers is exactly that failure mode. **Default to
`postgres.js` under Drizzle** unless a 30-line smoke test firing 16 concurrent
inserts proves `bun-sql` is fine.

### 10.5 Bulk import — getting real data in

The answer to "how do we initially put all of the data in both dev and prod" is a
CLI hitting the same ingest service the dashboard uses.

**No queue. No Redis.** At a few thousand documents the orchestration cost is
irrelevant — the dominant cost is PDF extraction. The "queue" you actually need
is a table, which gives restartability without a broker:

```sql
create type import_status as enum ('pending','running','succeeded','failed','skipped');

create table import_run (
  id bigint generated always as identity primary key,
  source_root text not null,
  dry_run     boolean not null default false,
  git_sha     text,
  started_at  timestamptz not null default now(),
  finished_at timestamptz
);

create table import_item (
  id           bigint generated always as identity primary key,
  run_id       bigint not null references import_run(id),
  source_path  text not null,
  content_hash bytea,
  report_id    text references reports(id),
  status       import_status not null default 'pending',
  attempts     int not null default 0,
  error_kind   text,          -- 'encrypted'|'corrupt'|'s3'|'extract'|'db'
  error_detail text,
  unique (run_id, source_path)
);
```

Claim work with `FOR UPDATE SKIP LOCKED` — the same primitive pg-boss and
graphile-worker use internally, which is why you don't need either:

```sql
update import_item set status='running', attempts=attempts+1
where id in (
  select id from import_item
  where run_id = $1 and status in ('pending','failed') and attempts < 3
  order by id for update skip locked limit 50
) returning *;
```

Multiple importer processes can run against the same run with zero coordination.

**Idempotency is by content hash.** sha256 of the file bytes, stream it
(`Bun.CryptoHasher` incrementally over `Bun.file(path).stream()` — never
`.arrayBuffer()`, which will blow the heap when ten 200MB scans run concurrently).
Use the hash as the storage key so the upload itself is idempotent. Re-running a
completed import then costs seconds: hash, index lookup, skip.

**Ordering matters.** Upload to R2 *first*, write the DB row *second*, and mark
the item terminal in the same transaction as the report insert. A crash between
upload and insert leaves an orphaned object, which a content-addressed key makes
harmless. The reverse order leaves a DB row pointing at nothing — much worse.

**`--dry-run` does everything except the two writes.** It reports total files,
duplicates, already-imported, extraction failures, total bytes, and estimated
wall clock. On a real corpus this surfaces the encrypted and corrupt PDFs before
you start a long run. Record it as an `import_run` with `dry_run = true` so the
findings stay queryable.

**Assume 2–5% of any real corpus fails.** Classify: transient (S3 5xx, deadlock)
→ retry with backoff; permanent (encrypted, zero-byte, not a PDF) → fail
immediately, don't burn retries; partial (uploads fine, extraction empty) →
insert the record with `fulltext = null` and backfill later.

Concurrency 8–16 via `p-limit@7.3.0`. **Match your Postgres pool size to it** or
you'll get pool timeouts that look like S3 errors. Batch inserts at ~1,000 rows
(Drizzle generates one statement per `.values()` and Postgres caps at 65,535 bind
parameters). Don't reach for `COPY` — at these volumes it saves milliseconds and
costs you `ON CONFLICT`.

### 10.6 Dev/prod parity summary

```
local     docker compose (postgres + minio) → migrate → reference seed → fixtures
CI        same, ephemeral, + the §11 policy test
prod      managed postgres + R2 → migrate on deploy → reference seed → admin:provision once
```

Same code, same migrations, same seeds. Only fixtures and credentials differ.

---

## 11. Quality gates

**Blocking publish** (not save). Draft records may be incomplete.

- `classification` explicitly set — no inferred default
- Abstract ≥75 words, unless an explicit override with a recorded reason
- No placeholder text: `TBD`, `TODO`, `Lorem ipsum`, `N/A`, `Abstract goes here`
- Title is not the filename
- ≥1 author with an affiliation
- `subject_category` set; ≥3 keywords, all from the controlled vocabulary
- PDF present, validated, sanitized, with a stored checksum
- **PDF contains searchable text** — Google Scholar will not index a scanned
  image, so this is a real publication requirement, not a nicety
- **PDF ≤5 MB** — Scholar's hard limit (⚠️ this conflicts with the 100 MB upload
  ceiling; large reports are accepted but flagged as un-indexable)
- `pdf_embedded_title` diffed against `title`; mismatch warns, doesn't block

**CI tests — the important one first:**

- **No `internal` record appears in any public artifact.** Run against a seeded
  DB with at least one internal fixture, asserting absence from: anonymous
  search, listing, record page, sitemap, RSS, related-links from public records,
  and author pages. **This is the single most valuable test in the system.**
- Every non-allowlisted `auth.handler` route returns 403/404 (§7.2)
- `citation_pdf_url` is a well-formed absolute URL — NTRS itself ships
  `"https://ntrs.nasa.govundefined"` in production from a JS template-string bug,
  which is exactly the failure this test catches
- Upload rejects: oversized, non-PDF with PDF extension, PDF-with-JavaScript
- Accessibility: semantics, focus, contrast, dark mode, reduced motion

---

## 12. Discovery

Priority order, highest value first. The first item is roughly a day of work and
matters more than the rest combined.

**1. Highwire Press meta tags, server-rendered.** This is what Google Scholar
actually reads. Required: `citation_title` (the *paper's* title — explicitly not
the repository name), `citation_author` (repeated per author),
`citation_publication_date`. For this archive specifically:
`citation_technical_report_institution` and `citation_technical_report_number`,
which are the correct pair — do not abuse `citation_journal_title` the way NTRS
does. Plus `citation_pdf_url` as an absolute URL.

Dublin Core is explicitly "a last resort" per Scholar's own guidelines.

**2. Crawlable HTML.** Scholar requires plain `<a href>` GET links — **not
JavaScript-only navigation**. This is the constraint that bites a router-driven
SPA. `/reports` and `/reports/browse` must ship real anchors and server-rendered
`<meta>` tags in the initial HTML, not client-injected ones. Every record needs
its own unique URL, reachable within ten links of the homepage. Plus
`sitemap.xml`. Use 301s if anything ever moves, and **never redirect an article
URL to the homepage.**

**3. DataCite 4.6 as the internal metadata shape** — not for interop, but as a
schema someone else already argued about. Its `relatedIdentifier` vocabulary
solves §4.4's revision linking, and its `dates`/`dateType` covers `Withdrawn` and
`Available` (embargo). Costs nothing extra and makes future DOI registration a
serialization exercise.

**4. Dublin Core export** — ten lines of mapping, the lingua franca for
harvesters. Emit it; don't design around it.

**5. OAI-PMH — defer.** It puts you in BASE, CORE, OpenAIRE and OpenDOAR, but
those are how *academics* find things. For a tech studio's engineering reports,
Google and Scholar are essentially all the discovery that matters. Note the cheap
option for later: the **OAI Static Repository** spec exists for exactly "small
and relatively stable collections" — one static XML file at a stable URL plus a
gateway. Hours, not a subsystem.

**Citation export:** `@citation-js/core` + `plugin-bibtex` + `plugin-ris` +
`plugin-csl`, all at 0.8.2. Everything converts through **CSL-JSON as the pivot
format**, so store CSL-JSON-shaped metadata and get BibTeX/RIS/formatted strings
free. **Generate server-side** — `@citation-js/core` pulls `node-fetch` and
`sync-fetch`, which are unwelcome in a browser bundle. Lighter alternative if
bundle size matters: `biblatex-csl-converter@3.6.0` (TypeScript, no network deps,
covers all three formats, loses CSL style formatting).

---

## 13. Visual design

Depart from the marketing site on **layout grammar, not tokens.**

Keep without exception: ivory/slate/olive, the `text-display-*` /
`text-paragraph-*` / `text-detail-xs` scale, `Container`, dark mode, reduced
motion, and the voice. These are what make it recognisably CodeVault.

| | Marketing site | Reports server | Admin dashboard |
| --- | --- | --- | --- |
| Rhythm | `py-24 md:py-32` | `py-8`–`py-12` | Denser still |
| Listing | Cards in a grid | Hairline-separated rows | Data table |
| Type | Sans, one serif-italic accent word | **Mono-forward for IDs/dates; no serif-italic** | Same |
| Metadata | Prose | Label/value table | Editable fields |
| Chrome | Marketing nav | Search bar + facet rail + **Sign in** | Sidebar + user menu |
| Motion | Scroll reveals, the globe | Near-none | None |
| Olive | Emotional payoff | Classification + status chips only | Status only |

**Dropping the serif-italic accent word is the clearest possible signal you've
entered a different room**, without leaving the design system.

Tokens available (from `src/styles/globals.css`): `--ivory-light #faf9f5`,
`--ivory-medium #f0eee6`, `--ivory-dark #e8e6dc`, `--oat #e3dacc`,
`--slate-dark #141413`, `--slate-medium #3d3d3a`, `--slate-light #5e5d59`,
`--cloud-dark/medium/light`, `--olive #788c5d`, `--clay #d97757`,
`--destructive #b1432a`; radii `--radius-s .25rem` / `-m .5rem` / `-l 1rem`.

Use semantic tokens (`--background`, `--foreground`, `--muted-foreground`,
`--border`, `--ring`) for anything structural so dark mode keeps working.

**Three public surfaces:**

- **`/reports`** — search-first. One wide input, facets in a left rail (year,
  type, project, subject, author), dense result rows: mono ID, title, authors,
  date, page count. Server-side pagination, URL-synced state.
- **`/reports/CV-2026-0042`** — the record page. Title, authors, metadata table,
  full abstract, prominent download with file size and page count, BibTeX/RIS
  export, related records. It should read like a catalogue card and be legible
  without scrolling past decoration.
- **`/reports/browse`** — by year and subject, for walking the shelves.

**Login page:** minimal and accessible. One heading, one button ("Sign in with a
passkey"), one line of help text, and an error region with `aria-live="polite"`.
No decoration, no marketing chrome, no "register" link — there is no
registration. Visible focus ring, works at 200% zoom, keyboard-only navigable.

**Search state** uses `validateSearch` (Zod 4 works directly — no adapter needed;
Zod 3 would require `@tanstack/zod-adapter`) plus `loaderDeps` and
`stripSearchParams` to keep URLs clean at defaults.

---

## 14. Phasing

**Phase 1 builds §8.4's loop end to end, thin but complete. Every phase after it
thickens one layer while the loop keeps working.** The alternative — all of auth,
then all of deposit, then all of the public site — means you don't find out
whether the thing works until the very end, and the interesting failures are all
at the seams.

**Phase 0 — foundations.** Pin TanStack versions exactly. Add
`@tanstack/react-query` as a direct dep. Docker Compose (Postgres 18 +
SeaweedFS, minding §10.2's PGDATA change). Drizzle 1.0-rc schema + first
migration, applied via a pre-deploy step. `src/env/{server,client}.ts`, split.
`src/start.ts` with global middleware registered but permissive. One container
deployed with a health check. *Nothing user-visible — this de-risks everything
with no precedent in the repo.*

**Phase 1 — the walking skeleton.** The whole of §8.4, as thin as it can be
while still being real:

- One provisioned admin, passkey enrollment, login, session, CSRF.
- `/admin/deposit`: presigned PUT, magic-byte validation, `%PDF-` check, page
  count and checksum extraction. **No CDR, no thumbnails, no full-text yet.**
- A metadata form covering only what §11 blocks publish on.
- Publish: allocate `CV-2026-0001`, move the file to the public bucket, flip
  status.
- `/reports/CV-2026-0001`: record page, metadata table, abstract, download via
  the separate content domain with §5.3 headers.
- `/reports`: a plain reverse-chronological list. No search, no facets.

*Done when you can sign in, deposit a real report, publish it, sign out, and
load its record page in a private window.* Ship the "no internal in public
artifacts" test here, while it is trivially green, so it fails loudly later.

**Phase 2 — harden ingest.** Quarantine bucket + R2 event notifications, CDR
sanitization, full-text extraction, cover thumbnails, the embedded-title drift
diff, dedupe by checksum, the failure taxonomy. *The loop is unchanged; what
happens inside step 2b gets serious.*

**Phase 3 — the archive proper.** Postgres FTS with the generated tsvector
column, facets, `/reports/browse`, Highwire meta tags, `sitemap.xml`, BibTeX and
RIS export, crawlable anchors. *The loop is unchanged; step 4 becomes
discoverable.*

**Phase 4 — the dashboard proper.** Overview, reports table with filters, edit
metadata post-publication, withdraw with tombstone, revisions with typed
relations, user management, audit log view. *The loop is unchanged; step 2
becomes a workspace rather than a form.*

**Phase 5 — bulk import.** The `import_run` / `import_item` CLI, dry-run,
reporting. Load the real corpus through the same ingest service the dashboard
uses.

**Phase 6 — internal.** Turn on `classification: internal` and
`dissemination: metadata_only`. Presigned delivery from the internal bucket,
per-file embargo, the role split, the identity-aware proxy. **Gated on the
Phase 1 policy test still being green.**

**Phase 7 — polish.** Author pages, RSS, related-record graph UI, Dublin Core
export, OAI-PMH static repository if it ever earns its place.

---

## 15. Open questions

1. **Does "internal" ever mean government-classified?** If yes, stop — this
   design is not appropriate (§4.3).
2. **Which container host** — Fly.io, Railway, Render, or self-hosted Coolify.
   Constrains Phase 0.
3. **The separate content domain.** Needs registering before Phase 3
   (`codevaultusercontent.com` or similar). Must be a distinct registrable
   domain, not a subdomain.
4. **Subject taxonomy.** Needs a first draft before Phase 2 — far cheaper now
   than retrofitted across hundreds of records.
5. **`reports.codevault.dev` vs `codevault.dev/reports`.** Path is simpler (one
   deploy, shared session, consolidated SEO) and is the recommendation; subdomain
   only if the archive later wants its own deploy cadence.
6. **Team size.** The passkey recovery design assumes ≥2 people so a second admin
   can issue re-enrollment tokens. If this is genuinely one person, the hardware
   key in a safe stops being optional.

---

## Appendix — verified version reference

| Package | Version | Note |
| --- | --- | --- |
| `better-auth` | 1.6.23 | 2026-07-02; 1.7.0 in RC |
| `@simplewebauthn/server` | 13.3.2 | via Better Auth |
| `drizzle-orm` / `drizzle-kit` | **1.0.0-rc.4** | pin exact, not `^` (§10.4) |
| `drizzle-seed` | 0.3.1 | dev fixtures only |
| `@faker-js/faker` | 10.5.0 | |
| SeaweedFS | — | local S3; **MinIO is archived** |
| Postgres | 18.4 | note the Compose PGDATA change (§10.2) |
| `zod` | 4.4.3 | v4 works with `validateSearch` directly |
| `@t3-oss/env-core` | 0.13.11 | |
| `file-type` | 22.0.1 | ESM-only, Node ≥22 |
| `magic-bytes.js` | 1.13.0 | CJS-friendly alternative |
| `pdfjs-dist` | 6.1.200 | |
| `unpdf` | 1.6.2 | pure-JS extraction fallback |
| `citation-js` (`@citation-js/*`) | 0.8.2 | |
| `biblatex-csl-converter` | 3.6.0 | lighter alternative |
| `p-limit` | 7.3.0 | has `limit.map()` |
| `postgres` (postgres.js) | 3.4.9 | preferred driver under Drizzle |
| `vite` | 8.1.x | Rolldown default |
| `bun` | 1.3.14 | |

Claims marked ⚠️ **VERIFY** in this document were not confirmed against a primary
source and must be checked before they are relied upon.
