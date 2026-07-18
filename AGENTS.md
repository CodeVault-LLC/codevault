# AGENTS.md

Guidance for AI agents (and humans) working in this repository. Read this first,
then the linked docs before making substantial changes.

## What this project is

The CodeVault website — a **TanStack Start** (React 19 + TypeScript, SSR) app
styled with **Tailwind v4** and **shadcn/ui**, in a warm, editorial, Anthropic-
adjacent design language.

CodeVault is **not a product company**. We run **projects** across everything in
tech — a trial, an experience, an adjustment, a result. Voice and identity
matter here as much as code. **Do not** reframe the site as a product/SaaS
company. Full context: [`docs/overview.md`](./docs/overview.md).

## Read before you build

| If you're touching… | Read |
| --- | --- |
| Copy, messaging, positioning | [`docs/overview.md`](./docs/overview.md) |
| Anything visual (color, type, layout, motion) | [`docs/design-system.md`](./docs/design-system.md) + [`docs/design-rules.md`](./docs/design-rules.md) |
| Any code | [`docs/code-rules.md`](./docs/code-rules.md) |

## Ground rules

1. **Match the existing code.** Read neighboring files and follow their idioms,
   naming, and structure. Consistency beats cleverness.
2. **Content lives in config.** User-facing strings (nav, cards, footer, meta,
   tagline) belong in [`src/core/config/site.ts`](./src/core/config/site.ts),
   not scattered inline.
3. **Use the design tokens.** No raw hex or hand-set font sizes — swatches,
   semantic tokens, and the `text-display-*` / `text-paragraph-*` scale only.
   See [`src/styles/globals.css`](./src/styles/globals.css).
4. **Reuse shared helpers.** `cn()` from `@/lib/utils` for classes; motion
   variants from [`src/core/lib/motion.ts`](./src/core/lib/motion.ts). Respect
   `useReducedMotion()`.
5. **Keep the voice.** Plain, understated, curious, never promotional. Avoid
   product-company language ("platform," "solution," "get started," "sign up").
6. **Say less.** This is the rule that gets broken most. Detail is not the same
   as quality — a reader who opened "Get in touch" wants the address, not an
   essay about our correspondence philosophy. Cut to what the page is actually
   for. **Not every heading needs a description**, and a section that only
   works because it's padded out should be shorter or gone. One good sentence
   beats three that circle it. Silence is often the right answer.
7. **Responsive, accessible, dark-mode-safe.** All three are part of "done."
8. **Never hand-edit generated files** (`src/routeTree.gen.ts`).

## Working agreement

- Branch off `main`; PRs target `main`. Current working branch: `fix`.
- **Ask before large or ambiguous changes.** For creative/redesign work,
  confirm direction before implementing.
- **Commit and push only when the user asks.**

## Verify before you claim done

Typecheck and lint are necessary but not sufficient — they don't prove behavior.
Run the app and observe the change:

```bash
npm install
npm run dev          # SSR dev server on :3000
npm run typecheck    # tsc --noEmit
npm run lint         # ESLint (@tanstack/eslint-config)
npm run format       # Prettier (no semicolons, double quotes, printWidth 80)
```

Because the app is SSR, content changes are observable in the fetched HTML;
interactive behavior needs a real browser. See
[`docs/code-rules.md`](./docs/code-rules.md#verification).
