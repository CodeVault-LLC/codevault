# Overview

## What CodeVault is

CodeVault is a Norwegian company (currently an enkeltpersonforetak) that builds
software for problems large organisations have learned to live with, and writes
down how the work is going. The site is where that work is announced and
explained, and it should read as a company a large customer can trust: clear
about what we do, honest about where it stands.

Right now most of the work is **CodeVault Electrical**, a Revit add-in for
electricians. It starts with conduit routing: pick two devices, or several, and
it suggests a route that keeps clear of what's in the way. It has its own page
and most of the news, but the site is CodeVault's, not the product's.

## What the site is

Four things, plus the pages the law asks for:

| Page       | Route                  | Purpose                                                  |
| ---------- | ---------------------- | -------------------------------------------------------- |
| Home       | `/`                    | Headline, the current announcement, latest posts         |
| Electrical | `/electrical`          | What it does, how it works, where it stands              |
| News       | `/news`, `/news/$slug` | Every announcement, engineering note and update          |
| Brand      | `/brand`               | Logo, Orbit the mascot, colour and type                  |
| Contact    | `/contact`             | Email, and the business facts ehandelsloven § 8 requires |
| Privacy    | `/privacy`             | The GDPR notice: what data the site touches and why      |

The business facts (name, company form, org number, address) live in
`src/core/config/company.ts`. The footer, Contact and Privacy pages read them
from there, so registering the business or changing its form is a change to
that one file. The privacy notice in `legal.ts` must stay true: adding
cookies, analytics, a form or a new service provider means updating it first.

There is no database, no sign-in and no storage. Content lives in
`src/core/config/` and ships with the code.

## Reference

The design deliberately follows anthropic.com: its warm palette, bold sans
headlines over serif reading text, the large announcement card with an
animated scene, oat release cards with mono detail rows, and article pages
with a serif title over a drawn arc. Follow the patterns, not the assets —
we use our own fonts (Inter, Lora, JetBrains Mono), our own marks and our own
artwork, and never Anthropic's names or logos.

## Voice

Plain, understated, curious. Say what something is and what state it's in.

- **Honest status.** CodeVault Electrical is in development. "Working" means
  it runs today, not that it's released. Don't announce what hasn't happened.
- **Promise what the product promises.** Routes keep clear of everything set to
  Avoid, and list what they pass through. Never "clash-free" or "avoids every
  obstacle"; the product itself doesn't say that.
- **Say less.** One good sentence beats three that circle it. Not every
  heading needs a description.
- **No product-company language** — "platform," "solution," "get started,"
  "sign up," "revolutionary."
- **No customer names** without permission, even when the source documents
  have them.

## Writing a news post

Add an entry to `src/core/config/news.ts`. Every claim about CodeVault
Electrical should be checkable against its repository (`CHANGELOG.md`,
`PLAN.md`, `docs/adr/`, the commit log) on the post's date. Describe what it
does for the people using it, not what it's built with. Pick an existing
illustration (`ArtKey`) and tone, or add one to
`components/news/post-art.tsx`. Then run `bun run og:images` for its social
card; see [seo.md](./seo.md).
