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

Five things, plus the pages the law asks for:

| Page       | Route                      | Purpose                                                  |
| ---------- | -------------------------- | -------------------------------------------------------- |
| Home       | `/`                        | Headline, the current announcement, latest posts         |
| Electrical | `/electrical`              | What it does, how it works, where it stands              |
| News       | `/news`, `/news/$slug`     | Every announcement, engineering note and update          |
| Guides     | `/guides`, `/guides/$slug` | Plain answers to problems people search for              |
| About      | `/about`                   | Who CodeVault is: what we make, where we are, the facts  |
| Brand      | `/brand`                   | Logo, Orbit the mascot, colour and type                  |
| Contact    | `/contact`                 | Email, and the business facts ehandelsloven § 8 requires |
| Privacy    | `/privacy`                 | The GDPR notice: what data the site touches and why      |

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

## Writing a guide

Guides are how people find us without searching for "CodeVault". Each one
answers a question someone types into a search engine, such as a Revit
problem or a rollout question, and ends with a sentence or two on what
CodeVault Electrical does about it, linked to `/electrical`. Never redirect a
visitor from a guide; a page built to rank and then forward people is a
doorway page, and search engines penalise the whole site for it.

- **Useful without us.** Someone who will never install the add-in should
  still get their answer.
- **True, and not too specific.** Revit facts are ones Autodesk documents or
  anyone can check. Product claims trace to the product's changelog. Leave
  out setting names and numbers that will go stale.
- **The searcher's words** in the title and the first sentences.

Add an entry to `src/core/config/guides.ts`, link it from related news posts
(`guides` on the post), run `bun run og:images`, and bump `updated` whenever
a guide changes.

## Writing a news post

News reads as an engineering blog, not a changelog. Write as the engineers
who built it ("we"), to a reader who knows the trade ("you"), and leave them
feeling the work is careful and the problems are hard. The product is how we
solved the problem, never the pitch.

- **Open with the problem**, not the button. What's hard about it, on site
  or in the model, comes before what the tool does.
- **Show how it thinks.** The search, the checks, the trade-offs we chose
  and why. Real numbers where we have them. This is where the depth comes
  from, and it never needs a language or framework name.
- **Have a view.** One or two lines a reader could quote: "The opening is
  part of the route, so the same search that chooses the route should
  choose it."
- **Limits are design decisions**, stated once as a choice ("all or
  nothing, on purpose"), never as an apology.
- **Light on story.** One concrete case is enough to set up a problem.
- **Two lengths.** Engineering posts are essays; release posts open the
  same way but stay short.

Add an entry to `src/core/config/news.ts`. Every claim about CodeVault
Electrical should be checkable against its repository (`CHANGELOG.md`,
`PLAN.md`, `docs/adr/`, the commit log) on the post's date. Describe what it
does for the people using it, not what it's built with. Pick an existing
illustration (`ArtKey`) and tone, or add one to
`components/news/post-art.tsx`. Then run `bun run og:images` for its social
card; see [seo.md](./seo.md).
