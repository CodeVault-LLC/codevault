# Guides: pages people find without searching for "CodeVault"

**Date:** October 13, 2026
**Status:** Approved in conversation; awaiting review of this spec

## Why

People who would use CodeVault Electrical search for the problem in front of
them, not for us. They search for a Revit error message, a family that won't
connect, or a clash with somebody else's ducts. For most of these questions
the top results today are old Autodesk forum threads and help pages, or
vendor pages. Nobody has written one clear, current answer.

A guide answers one of those questions properly, then says in a sentence or
two what CodeVault Electrical does about it, with a link to `/electrical`. The
visitor moves to our page by following that link. Nothing redirects them.
Pages built only to rank and then forward the visitor are "doorway pages"
under Google's spam policies, and they put the whole site at risk.

**Success:** guides are indexed and appear for their target searches in
Search Console, and visitors move from guides to `/electrical`. Adding the
site to Search Console (already in `TODO.md`) is the prerequisite for
measuring either.

## Scope

**In:** a Guides section, four guides, and the wiring that makes them findable.

**Out, for later batches:**

- The NEC 360° bend rule. CodeVault Electrical prefers fewer bends but doesn't
  count degrees between pull points, so the page can't credibly point to the
  product yet.
- A comparison of conduit routing add-ins. It names competitors, so it needs
  extra care while we're in development.
- Norwegian pages. The decision was English first.
- Templated pages, one per error or Revit version. They would be thin.

## Content rules

Every guide follows `AGENTS.md` and `docs/overview.md`, plus:

1. **Useful without us.** The page answers the question for someone who will
   never install the add-in. The product section is short and comes last.
2. **True, and not too specific.** Revit facts are ones Autodesk documents, or
   ones anyone can check in Revit. Claims about CodeVault Electrical trace to
   its repository's `CHANGELOG.md`. Leave out setting names, millimetre
   defaults, attempt counts and unverified version changes (for example, the
   reported Revit 2027 add-in folder move). They go stale or overclaim.
3. **The searcher's words in the title.** Quote error messages exactly as
   Revit prints them.
4. **Say less.** No intro that restates the title. The short answer comes
   first, and each section earns its place.
5. **Never "clash-free".** Routes keep clear of what's set to Avoid.

## Content model

New file `src/core/config/guides.ts`:

```ts
export type Guide = {
  slug: string
  /** The H1, in the searcher's words. */
  title: string
  /** The <title>. Problem first, "— CodeVault" appended by the route. ≤ 60 chars before the suffix. */
  seoTitle: string
  /** Meta description and index summary. The answer, ≤ 155 chars. */
  description: string
  /** Two or three sentences under the title: the direct answer. */
  answer: string
  /** yyyy-mm-dd; changed whenever the content is checked or edited. */
  updated: string
  /** Shown as a detail row, e.g. "Revit 2025 and 2026". */
  appliesTo: string
  body: Block[] // the news Block type, reused
  /** One or two sentences on what CodeVault Electrical does here. */
  product: string
  /** News slugs and guide slugs to link under "Related". */
  related: { news?: string[]; guides?: string[] }
}
```

Exports `allGuides()` (in config order) and `findGuide(slug)`, mirroring
`news.ts`. Page-level strings (index heading, "Related", "Updated", "Applies
to", the product section's heading and link label) go in
`src/core/config/pages.ts` beside `news`.

## Pages

### `/guides/$slug`

Reuses the article layout from `news.$slug.tsx`:

1. Small eyebrow "Guide", then the H1 and the arc rule.
2. Details row: contents (from `h2`s) on one side; on the other, "Applies to"
   and "Updated". No publish date or category.
3. The short answer as the lead paragraph (`text-paragraph-l`).
4. The body blocks.
5. **With CodeVault Electrical**: a `bg-surface` card with `product` and a
   link to `/electrical` (not the early-access mailto).
6. **Related**: linked news posts and guides.

No hero illustration. Guides are reference pages, and a figure from
`PostArt` is used inside the body only where it explains something.

The body renderer (`BodyBlock`) moves out of `news.$slug.tsx` into
`src/components/news/body-block.tsx`, and both routes use it. The rendering
stays the same.

### `/guides`

A heading and a list of guides (title + description), using the same row
pattern as the News index. Nothing else.

## Search and structured data

- `seo()` with `type: "article"`, path `/guides/<slug>`, image
  `/og/guides/<slug>.png`.
- JSON-LD: `TechArticle` (new `guideArticle()` in `structured-data.ts`) with
  `headline`, `description`, `dateModified` = `updated`, `author`/`publisher`
  → organization, `about` → the Electrical software. Plus `BreadcrumbList`
  (CodeVault › Guides › title). The `/guides` index gets `BreadcrumbList`.
- No HowTo or FAQPage markup on guides.
- **Sitemap:** `/guides` and every guide, `lastmod` = `updated`.
- **`llms.txt` / `llms-full.txt`:** a Guides section listing each guide; the
  full file includes the answer and body text, like posts.
- **Social cards:** `scripts/og-images.ts` makes one per guide in
  `public/og/guides/`, in the same style as post cards.

## Internal links

- Footer: a "Guides" link to `/guides` in the Electrical column. The footer's
  grid has room for three columns, and four long guide titles would crowd it.
- `/electrical`: a short "Guides" list after Questions, with titles only.
- News posts link to their guide inside the existing body text, where it
  reads naturally. Nothing is added just for the link:
  - "What a route promises" → linked models, insufficient space
  - "Introducing CodeVault Electrical" → device without connector,
    deploying to every machine
- No top-nav entry.

## The four guides

Outlines only. The final copy is written during implementation and reviewed
against the rules above.

### 1. "Insufficient space to create the required fittings" on conduit in Revit

- slug `revit-conduit-insufficient-space-for-fittings`
- **Answer:** Revit needs enough straight conduit on both sides of a bend to
  place the elbow. The usual causes are a run that's too short, or a
  conduit type with no fittings assigned.
- **Body:** why elbows need straight run; check the conduit type (Revit's
  templates include "Conduit without Fittings", and it's easy to pick it by
  accident); lengthen the short segment or move the bend; check the fitting
  family's length; back-to-back bends need room between them.
- **Product:** It keeps room for every elbow, sized from the conduit you use,
  and continues the type of the conduit you picked, preferring types with
  fittings.
- **Sources:** Autodesk layout troubleshooting (short segments prevent
  fitting placement); product changelog.
- **Related:** "What a route promises"; guide 3.

### 2. Connecting conduit to a device with no conduit connector in Revit

- slug `revit-conduit-device-without-connector`
- **Answer:** Revit only joins conduit to a family with a conduit connector.
  Either add one to the family, or run conduit to the device and leave the
  end unconnected.
- **Body:** how to tell (no conduit grip; it won't snap); conduit connector
  vs electrical connector; adding an individual or surface connector in the
  Family Editor and reloading; when editing every family isn't practical
  (many receptacle, switch and light families ship without one).
- **Product:** Routes still reach devices with no conduit connector. Any end
  that couldn't be joined is named in the preview, so you can finish it by
  hand.
- **Sources:** Autodesk "Connect Conduit to Equipment" and connector
  tutorial; product changelog.
- **Related:** "Up, across and down"; guide 1.

### 3. Routing conduit around ducts in a linked Revit model

- slug `revit-conduit-around-linked-models`
- **Answer:** You can't edit a linked model from yours, so the conduit has
  to move. Find the clashes with Interference Check against the link, then
  route over, under or around them.
- **Body:** why electrical gets the leftover space; Interference Check
  against linked categories (keep the sets narrow); confirm the link is
  positioned correctly; rerouting with offsets and what each offset costs in
  fittings; when to ask the other discipline to move instead; recheck after
  each change; the link changes with every revision.
- **Product:** It checks each suggested route against the real geometry of
  the host model and loaded links, keeping clear of what's set to Avoid, and
  lists what it passes through. If a link isn't loaded, it stops and says so.
- **Sources:** Autodesk Interference Check docs; product changelog.
- **Related:** "What a route promises"; guide 1.

### 4. Deploying a Revit add-in to every machine

- slug `deploy-revit-add-in-to-every-machine`
- **Audience:** BIM managers and IT.
- **Answer:** Revit loads add-ins from a per-user folder and an all-users
  folder. Install to the all-users location (usually with a multi-user
  installer, pushed by your deployment tool) so every user gets the same
  version.
- **Body:** the two locations and that a same-named per-user manifest takes
  precedence (stale versions); bundles vs `.addin` manifests at a high level;
  pushing with Intune, SCCM or Group Policy; check the folder Autodesk
  documents for your Revit version; managing settings centrally; what to ask
  a vendor before rollout (network calls, what it changes, shared-model
  behaviour).
- **Product:** It installs per user or per machine. A machine-wide settings
  file overrides each user's, one switch turns it off, and it makes no
  network calls.
- **Sources:** Autodesk "Add-in Registration"; product README and
  `docs/settings.md`; the "Before it goes on every machine" section on
  `/electrical`.
- **Related:** "Introducing CodeVault Electrical".

## Testing and verification

- `src/core/config/guides.test.ts`: unique slugs; unique `h2` ids per guide;
  `updated` is a real date; every related slug resolves (news and guides);
  `seoTitle` ≤ 60 and `description` ≤ 155 characters; every guide has a
  social card in `public/og/guides/`.
- `bun run typecheck`, `lint`, `test`, `format`.
- Run the dev server and check the fetched HTML of a guide: `<title>`,
  description, canonical, JSON-LD; check `/sitemap.xml`, `/llms.txt` and
  `/llms-full.txt`; check a guide and `/guides` in the browser at phone width
  and in dark mode.

## Docs to update

- `docs/overview.md`: add Guides to the page table.
- `docs/seo.md`: add guides to the table and a short "Adding a guide"
  section (content rules, run `og:images`, bump `updated` on every edit).
- `AGENTS.md`: add `guides.ts` to the config list.
