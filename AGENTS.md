# AGENTS.md

Guidance for AI agents (and humans) working in this repository. Read this first,
then the linked docs before making substantial changes.

## What this project is

The CodeVault website — a **TanStack Start** (React 19 + TypeScript, SSR) app
styled with **Tailwind v4**. Three sections: Home, **News** (with **Guides**), and
**CodeVault Electrical** (our Revit add-in for electricians, at `/electrical`).
No database, auth or storage.

The design deliberately follows anthropic.com's patterns — palette, type
pairing, announcement card, release cards, article layout — using our own
fonts, marks and artwork. Never use Anthropic's names, logos or assets.

CodeVault builds **software for problems large organisations have learned to
live with**, and writes down how the work is going. CodeVault Electrical is
the current product. Read as a company a large customer can trust, without overclaiming. Full context:
[`docs/overview.md`](./docs/overview.md).

## Read before you build

| If you're touching…                            | Read                                                                                                  |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Copy, messaging, positioning                   | [`docs/overview.md`](./docs/overview.md)                                                              |
| Anything visual (color, type, layout, motion)  | [`docs/design-system.md`](./docs/design-system.md) + [`docs/design-rules.md`](./docs/design-rules.md) |
| Any code                                       | [`docs/code-rules.md`](./docs/code-rules.md)                                                          |
| Metadata, structured data, feeds, social cards | [`docs/seo.md`](./docs/seo.md)                                                                        |

## Ground rules

1. **Match the existing code.** Read neighboring files and follow their idioms,
   naming, and structure. Consistency beats cleverness.
2. **Content lives in config.** User-facing strings (nav, cards, footer, meta,
   tagline) belong in [`src/core/config/`](./src/core/config/) — `site.ts`,
   `news.ts`, `guides.ts`, `electrical.ts`, `about.ts`, `pages.ts`, `company.ts`, `legal.ts` — not
   scattered inline.
3. **Use the design tokens.** No raw hex or hand-set font sizes — swatches,
   semantic tokens, and the `text-display-*` / `text-paragraph-*` / `text-ui`
   / `text-caption` / `text-label` scale only.
   See [`src/styles/globals.css`](./src/styles/globals.css).
4. **Reuse shared helpers.** `cn()` from `@/lib/utils` for classes; GSAP and
   its motion settings from [`src/core/lib/motion.ts`](./src/core/lib/motion.ts)
   (import `gsap` from there, not from `"gsap"`). Respect reduced motion.
5. **Be accurate about CodeVault Electrical, not confessional.** News posts and
   status labels must be true of its repository on the date given. Routes keep
   clear of what is set to Avoid; never call them "clash-free". No customer
   names. **Accurate does not mean listing our own shortcomings.** Don't add
   disclaimers about what is untested, unfinished or unproven ("These three are
   new, and we haven't tried them in Revit yet."). Say what it does; if
   something isn't ready to stand behind, leave it out rather than apologise
   for it.
6. **Keep the voice.** Plain, understated, curious, never promotional. Avoid
   product-company language ("platform," "solution," "get started," "sign up").
7. **Say less.** This is the rule that gets broken most. Detail is not the same
   as quality — a reader who opened "Get in touch" wants the address, not an
   essay about our correspondence philosophy. Cut to what the page is actually
   for. **Not every heading needs a description**, and a section that only
   works because it's padded out should be shorter or gone. One good sentence
   beats three that circle it. Silence is often the right answer. News posts
   are the exception in length, not in discipline: they read as an
   engineering blog, with depth on how the work thinks. See "Writing a news
   post" in [`docs/overview.md`](./docs/overview.md).
8. **Responsive, accessible, dark-mode-safe.** All three are part of "done."
9. **Never hand-edit generated files** (`src/routeTree.gen.ts`).

## Working agreement

- Branch off `main`; PRs target `main`. Current working branch: `fresh`.
- **Ask before large or ambiguous changes.** For creative/redesign work,
  confirm direction before implementing.
- **Commit and push only when the user asks.**
- **Open work is in [`TODO.md`](./TODO.md)**, most urgent first. Check it
  before starting, and remove items when they're done.

## Verify before you claim done

Typecheck and lint are necessary but not sufficient — they don't prove behavior.
Run the app and observe the change:

```bash
bun install
bun run dev          # SSR dev server on :3000
bun run typecheck    # tsc --noEmit
bun run lint         # ESLint (@tanstack/eslint-config)
bun run test         # Vitest
bun run format       # Prettier (no semicolons, double quotes, printWidth 80)
```

Because the app is SSR, content changes are observable in the fetched HTML;
interactive behavior needs a real browser. See
[`docs/code-rules.md`](./docs/code-rules.md#verification).
