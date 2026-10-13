# Search and AI

How the site describes itself to search engines and AI assistants. All of it
is generated from `src/core/config/`, so it says what the pages say.

| What                      | Where                         | Built by                      |
| ------------------------- | ----------------------------- | ----------------------------- |
| Title, description, cards | every page's `<head>`         | `core/lib/seo.ts`             |
| Structured data (JSON-LD) | every page's `<head>`         | `core/lib/structured-data.ts` |
| Sitemap                   | `/sitemap.xml`                | `routes/sitemap[.]xml.ts`     |
| Crawler rules             | `/robots.txt`                 | `routes/robots[.]txt.ts`      |
| Summary for AI assistants | `/llms.txt`, `/llms-full.txt` | `core/lib/llms.ts`            |
| News feed                 | `/news/rss.xml`               | `core/lib/llms.ts`            |
| Social cards (1200×630)   | `public/og/`                  | `bun run og:images`           |

- **The name.** "CodeVault" is shared with unrelated companies abroad. The
  About page (AboutPage) says plainly who this CodeVault is: a Norwegian
  software company that makes CodeVault Electrical. Keep the name, country
  and product together wherever the company is described, here and on other
  sites.
- **Structured data.** Home says who CodeVault is (Organization, WebSite),
  including the topics it works on (`knowsAbout`).
  `/electrical` describes the product (SoftwareApplication), its FAQ
  (FAQPage) and where it sits (BreadcrumbList). Every post is a BlogPosting.
  Never add ratings, prices or dates that aren't true.
- **Guides.** `/guides/$slug` pages answer the questions people search for
  and link to `/electrical`. Each is a `TechArticle` that `mentions` the
  product, with `dateModified` from its `updated` date. See
  [overview.md](./overview.md#writing-a-guide) for how to write one.
- **Robots.** Everything is open. Search and AI crawlers are also welcomed by
  name. Don't block one without a reason.
- **Canonical address.** `site.url` is `https://www.codevault.no`, where the
  site is served; the bare domain redirects there.
- **Caching.** Pages are cached at Vercel's edge for a day and cleared on every
  deploy (`lib/cache-headers.ts`).

## Adding a guide

Run `bun run og:images`; a test fails until the card exists. The sitemap,
`llms.txt` and `llms-full.txt` pick it up by themselves, and so do the
Guides index and the list on `/electrical`.

## Adding a news post

Run `bun run og:images` to make its social card. A test fails until the card
exists. `llms.txt`, `llms-full.txt`, the feed and the sitemap pick the post up
by themselves.
