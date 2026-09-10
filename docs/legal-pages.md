# Legal pages

## Overview

This brief records the implemented `/legal` overview and its Privacy, Terms,
Cookies, and Security documents. It applies only to these pages. The existing
[design system](./design-system.md), [design rules](./design-rules.md), and
[CodeVault identity](./overview.md) remain authoritative.

The approved direction uses a panoramic fjord on the overview and quieter image
strips above documents. The document list stays short; policy pages give the
text and section navigation most of the space. Policy content files and
`src/core/config/legal.ts` were unchanged by this presentation work.

## Colors

The pages reuse CodeVault's ivory, slate, and olive tokens from
[`globals.css`](../src/styles/globals.css). Background, text, muted text, borders,
and focus rings use semantic tokens that follow the active theme. The panorama
uses ivory text over a slate gradient. Olive marks the current legal route and
list bullets. There is no separate legal palette.

## Typography

The existing sans family and fluid type scale carry the pages. Each page title
retains one italic serif accent. The overview uses `text-display-xxl`; document
titles use `text-display-xl`. Sections use `text-display-s`, and document body
text uses `text-paragraph-m`. Navigation, dates, and index descriptions use
`text-paragraph-s`.

## Layout

The shared `Container` owns the width and horizontal gutters. On wider screens,
the overview pairs its section heading with a divided document list. On narrow
screens, each document description moves below its title.

Documents use a shallow full-width photograph, then a title and reading area.
At the large breakpoint, a 16rem navigation column sits beside the article.
Below that breakpoint, native `details` and `summary` expose the contents list
above the article. Section anchors include scroll offsets for the sticky header.

## Elevation & Depth

The layout uses whitespace and thin dividers without card shadows. The overview
gradient supports title legibility over the photograph; documents keep text
outside the image.

## Components

- [`LegalIndex`](../src/components/legal/legal-index.tsx) renders the panorama,
  document anchor, and four linked document rows. Arrow movement stops under
  reduced motion.
- [`LegalDocument`](../src/components/legal/legal-document.tsx) renders the image
  strip, title, update date, article, and return links. It derives contents links
  from direct `LegalSection` children, using their authored titles and IDs.
- [`LegalNav`](../src/components/legal/legal-nav.tsx) provides a home link and
  sticky legal navigation. The narrow layout allows horizontal scrolling;
  `aria-current="page"` identifies the current route.
- [`LegalFooter`](../src/components/legal/legal-footer.tsx) contains the name and
  contact email. [`legal.tsx`](../src/routes/legal.tsx) owns the shared layout.

Presentation strings and image metadata live in `legalPresentation` in
[`site.ts`](../src/core/config/site.ts). The photograph comes from the supplied
local `/v2` reference at `http://localhost:3000/images/fjord.webp`. It is reused
as `public/legal/fjord.webp`, with an 800px responsive version. Adjacent JSON
files record provenance; the reference supplied no photographer or license.

## Do's and Don'ts

- Do preserve the authored policy sections and derive navigation from them.
- Do retain visible keyboard focus, labelled navigation, and native mobile
  contents disclosure.
- Don't turn this page composition into a site-wide redesign rule.

Verification recorded for this implementation: typecheck passed; lint reported
the two existing sidebar warnings; the design detector returned `[]`. SSR
checks returned HTTP 200 and valid local anchors across all five legal routes.
Visual capture was blocked by `Preview snapshot failed`. The reviewer requested
recapture, so mobile, desktop, and dark-mode visual signoff remain pending.
No unobserved visual result is recorded here as an approved design rule.
