# Overview

## What CodeVault is

CodeVault builds projects across tech — tools, games, hardware, research — and
writes down how they went. It is not a product company. The site is where the
work is announced and explained.

Right now most of the work is **Kilo**, an electrical design tool for
industrially built building modules. Kilo has its own page and most of the
news, but the site is CodeVault's, not Kilo's.

## What the site is

Three things, and nothing else:

| Page | Route | Purpose |
| --- | --- | --- |
| Home | `/` | Headline, the current announcement, latest posts |
| Kilo | `/kilo` | What Kilo is, how it works, where it stands |
| News | `/news`, `/news/$slug` | Every announcement, engineering note and update |

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

- **Honest status.** Kilo is in development. "Working" means it runs today,
  not that it's finished. Don't announce what hasn't happened.
- **Say less.** One good sentence beats three that circle it. Not every
  heading needs a description.
- **No product-company language** — "platform," "solution," "get started,"
  "sign up," "revolutionary."
- **No customer names** without permission, even when the source documents
  have them.

## Writing a news post

Add an entry to `src/core/config/news.ts`. Every claim about Kilo should be
checkable against the Kilo repository (`PHASES.md`, `docs/decisions/`,
`docs/jobs/`, the commit log) on the post's date. Pick an existing illustration
(`ArtKey`) and tone, or add one to `components/news/post-art.tsx`.
