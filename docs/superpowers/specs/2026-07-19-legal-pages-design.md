# Legal pages — design

Four pages at `/legal/*` — privacy, terms, cookies, security — plus
`security.txt`. Written to be **true on the day they publish**, with every
entity-specific fact isolated in one config file so registering a company later
is an edit, not a rewrite.

> **Not legal advice.** This spec was written by an AI agent. The prose it
> produces should be read by a Norwegian lawyer before it ships, particularly
> the privacy policy — that document creates binding obligations under GDPR.
> Where a fact could not be verified from the codebase it is marked
> ⚠️ **VERIFY** rather than guessed.

---

## 0. Established facts

Verified against the codebase on 2026-07-19, not assumed.

| Fact | Source |
| --- | --- |
| No public accounts. Staff-only, invite-token + passkey. | `src/routes/login.tsx`, `src/routes/enroll.tsx`, `src/server/auth/allowlist.ts` |
| Reports are CodeVault-authored, publicly readable. | `docs/superpowers/specs/2026-07-18-technical-reports-server-design.md` |
| No third-party analytics anywhere. | grep over `src/` — no posthog/plausible/gtag/sentry/umami |
| Staff sessions store IP address + user-agent. | `src/server/db/schema/auth.ts:73-74` |
| Audit log stores IP address + user-agent. | `src/server/db/schema/audit-log.ts:84` |
| Audit log is hash-chained (tamper-evident). | `src/server/audit/chain.ts` |
| Public report downloads are **not** audit-logged. | `src/routes/reports.$accessionId_.download.ts` — no audit call |
| Hosting: Oracle Cloud VM; objects on Cloudflare R2; DNS on Cloudflare. | `docs/deployment.md` |
| Production domain is `codevault.no`. | `docs/deployment.md` |

### Decisions taken by the operator

- **Operator / controller:** Lukas Moe Olsen, a natural person in Norway. No
  registered legal entity exists.
- **Published contact:** `codevault@gmail.com` (not the personal address —
  deliberately chosen to keep it off a permanently-indexed page).
- **Governing law:** Norway. **No geographic restriction on use** — anyone
  anywhere may read reports and use the software.
- **Audit log retention:** indefinite, justified by hash-chain integrity.
- **Analytics:** none today; cookieless (Plausible/Umami) is a possible future.

### Open items — marked VERIFY in the prose, not invented

1. **Oracle Cloud region and Cloudflare R2 jurisdiction.** Determines whether a
   third-country transfer must be disclosed. If both are EU, the transfers
   section stays a single sentence. Resolve at deploy time.
2. **`src/core/config/site.ts:6`** still reads `https://codevault.dev` while
   `docs/deployment.md` says `codevault.no`. The legal pages must name the real
   domain. **Out of scope for this work** — flagged for the operator.

---

## 1. The entity problem, and how the design absorbs it

"CodeVault LLC" (the GitHub org) and "CodeVault, Inc." (rendered today in
`src/components/layout/footer.tsx`) both name a **US corporate form that does
not exist** — neither as a US company nor as anything registrable in Norway.
Asserting either on a legal page is a false statement about legal form.

Until an entity exists, the operator is a natural person and the pages say so.

**The mechanism:** `src/core/config/legal.ts` is the single source of every
entity-dependent fact. Prose components import from it. No entity name, address,
date, or jurisdiction is ever written inline in a paragraph.

```ts
export const legal = {
  operator: {
    // A natural person until an entity is registered. When that happens,
    // replace `name` with the registered name and fill in `orgNumber` — no
    // prose changes anywhere.
    name: "Lukas Moe Olsen",
    kind: "individual" as "individual" | "entity",
    orgNumber: null as string | null,
    country: "Norway",
  },
  contact: { email: "codevault@gmail.com" },
  supervisoryAuthority: {
    name: "Datatilsynet",
    url: "https://www.datatilsynet.no",
  },
  effective: "2026-07-19", // the real publish date — never backdated
} as const
```

Pages render "operated by {name}" and, when `kind === "entity"`, additionally
render the org number. Registering a company becomes a four-line diff.

---

## 2. Routes and files

```
src/routes/legal.tsx              layout + section nav — mirrors about.tsx
src/routes/legal.index.tsx        short index listing the four documents
src/routes/legal.privacy.tsx
src/routes/legal.terms.tsx
src/routes/legal.cookies.tsx
src/routes/legal.security.tsx
src/components/legal/*.tsx        the prose, one component per document
src/core/config/legal.ts          the facts
public/.well-known/security.txt
```

Follows the existing `about.tsx` + `src/components/about/*` pattern exactly —
same nav, same `AboutHero`-equivalent, same `Container`.

**On AGENTS.md rule 2** ("content lives in config"): the *variable facts* live
in `legal.ts`, satisfying the rule's intent. The *prose* stays in components.
Forcing multi-page legal text into typed string arrays would fight the format
and make the text harder to read and review — which, for a document a lawyer
must check, is the wrong trade.

Each document carries a visible "Last updated" from `legal.effective`.

---

## 3. Privacy policy

The one page with real legal force. Every claim traces to something the code
actually does.

**Controller and contact.** Named natural person, Norway, `codevault@gmail.com`.
No postal address — GDPR requires identity and a working contact channel, and an
individual controller is not obliged to publish a home address.

**If you only read the site.** No account. No analytics. No cookies set.
Downloading a report writes no application-level record — verified, not assumed.
The only data processed is what any web server unavoidably receives: IP address
and request metadata, held in infrastructure logs at Oracle Cloud and Cloudflare.
This section is short because the truth is short.

**If you hold a staff account.** Discloses, per field: account identifier,
passkey credential metadata, session records including **IP address and
user-agent**, and audit-log entries including the same. Legal basis: legitimate
interest in securing and maintaining an archive of our own work.

**Retention.** Sessions expire per better-auth configuration. Audit entries are
**retained indefinitely** — stated with its justification, not as a habit: the
log is hash-chained, so deleting an entry breaks the tamper-evidence the log
exists to provide. Data subjects are staff only; no public visitor appears in it.

> A lawyer is most likely to question indefinite retention of IP addresses. The
> purpose-based justification above is the defence, and it is genuine. Flagged
> here so the operator is not surprised by the question.

**Recipients.** Oracle Cloud (hosting) and Cloudflare (object storage, DNS).
No other processors. No advertising, no data sales, no profiling.

**Transfers.** ⚠️ **VERIFY** — depends on open item 1.

**Rights.** Access, rectification, erasure, restriction, objection, portability;
how to exercise them; right to complain to **Datatilsynet**.

**Changes.** How material changes are signalled.

---

## 4. Terms of use

**Who operates this site.** Named operator and contact — satisfying trader
identification under *ehandelsloven* and the e-Commerce Directive. Folded in
here rather than a separate *Impressum*, which is a German/Austrian construct.

**The archive.** Reports are published as-is, as a record of our own work. No
warranty of accuracy, currency, or fitness. No reliance undertaking.

**Intellectual property.** Site content and reports are the operator's.
**Software published in CodeVault repositories is governed solely by the licence
in each repository** — these terms neither extend nor restrict it. No
geographic restriction on use or distribution.

**Acceptable use.** No circumventing authentication, no attacks on the ingest
API, no automated access at volumes that degrade the service. Deliberately
narrow — an archive meant to be read should not forbid reading it.

**Liability.** Limited to the extent Norwegian law permits — and no further.

> Template terms asserting "we exclude all liability whatsoever" are
> **unenforceable in Norway**: liability for gross negligence and intent cannot
> be disclaimed, and mandatory consumer rights cannot be waived by contract.
> The clause will be written to hold rather than to sound maximal.

**Governing law.** Norwegian law; Norwegian courts. This determines *forum*, not
*audience* — it places no limit on who may use the site or the software.

---

## 5. Cookies

A table of what is actually set:

| Cookie | Purpose | Duration | Basis |
| --- | --- | --- | --- |
| better-auth session | Keeps a signed-in staff member signed in | 8 hours (`src/server/auth/auth.ts:40`, refreshed every 30 min while active) | Strictly necessary |

The cookie's exact *name* is set by better-auth, not by us — read it from a real
response at implementation time rather than assuming the library default.

Plus: no analytics, advertising, or third-party cookies today. Nothing is set for
a visitor who does not sign in.

**No consent banner, and why.** Strictly necessary cookies require *disclosure*
under the ePrivacy Directive, not consent. A banner here would be theatre.

**What changes with analytics.** If cookieless analytics (Plausible/Umami) is
added later, it stores no personal data and sets no cookie — this page gains a
paragraph and still needs no banner. Written now so adding it needs no rewrite.

---

## 6. Security

Not legally required. Included because the site has authentication, file upload,
and a document archive — the combination that attracts reports.

- **Scope:** `codevault.no` and the content origin. Explicitly out of scope:
  third-party services, and anything on GitHub.
- **How to report:** `codevault@gmail.com`.
- **What to expect:** acknowledgement, and honest handling.
- **Safe harbour:** good-faith research within scope will not be pursued.
- **No bug bounty.** Stated plainly, so nobody arrives expecting payment.

`public/.well-known/security.txt` per RFC 9116 — `Contact`, `Expires`,
`Preferred-Languages`, `Canonical`. **`Expires` must be a real future date and
is a maintenance obligation**: an expired `security.txt` is worse than none.

---

## 7. Changes to existing files

| File | Change | Why |
| --- | --- | --- |
| `src/components/layout/footer.tsx` | "CodeVault, Inc." → operator from `legal.ts` | **Names a legal form that does not exist.** |
| `src/core/config/site.ts` | `footerNav.Legal` `#privacy`/`#terms`/`#cookies` → real routes; add Security | Links currently go nowhere. |
| `src/components/layout/footer.tsx` | Remove the "Cookie preferences" link | Promises a control panel that does not and should not exist. |
| `src/routes/sitemap[.]xml.ts` | Add the four legal routes | Consistency. |

**Not changed:** `site.ts:6` (`codevault.dev` → `.no`). Real, but the operator's
call — see open item 2.

---

## 8. Voice

These are legal documents, which pulls toward boilerplate. Resist it. The house
voice — plain, understated, never padded — applies here too, and legal writing is
*better* when it is direct: a reader who cannot understand what you collect has
not been informed, whatever the document technically discloses.

AGENTS.md rule 6 ("say less") holds. Do not pad a section to look thorough. Where
the honest answer is "we don't do that," write that and stop.

---

## 9. Testing and verification

- Typecheck, lint, format.
- SSR: each route returns 200 and renders its content in fetched HTML.
- `/.well-known/security.txt` is served as `text/plain` with a future `Expires`.
- Every footer legal link resolves — no `#` anchors remain.
- Dark mode, responsive, reduced motion — part of "done" per AGENTS.md rule 7.
- **Read the rendered prose end to end** against §0, confirming no claim exceeds
  what the code does. This is the check that matters most; typecheck cannot
  catch a false statement about data handling.

---

## 10. Out of scope

Deliberately excluded, with reasons — so they are not re-litigated later:

- **EULA** — software is licensed per-repository on GitHub. A site-level EULA
  would confuse the two.
- **DPA, SLA, Acceptable Use Policy** — SaaS-with-customers artifacts. There are
  no customers.
- **Refund / shipping / returns** — no commerce.
- **Standalone disclaimer page** — belongs inside Terms; splitting liability
  language across two documents weakens both.
- **Accessibility statement** — not required at this size. Worth revisiting.
- **Cookie consent banner** — see §5.
- **Separate Impressum** — German/Austrian requirement; trader identification is
  handled in Terms.
