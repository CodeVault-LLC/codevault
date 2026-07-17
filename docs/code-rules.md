# Code rules

Conventions for high-quality code in this repo. The goal is code that reads like
the code already here — consistent, typed, and boring in the good way.

## Stack

- **React 19** + **TypeScript** (strict), **Vite 8**.
- **TanStack Start / Router** — SSR + file-based routing. Routes live in
  [`src/routes/`](../src/routes); `routeTree.gen.ts` is generated — never edit it
  by hand.
- **Tailwind CSS v4** (config-in-CSS via `@theme`; tokens in `globals.css`).
- **shadcn/ui** + **@base-ui/react** for primitives, **class-variance-authority**
  for variants, **framer-motion** for animation, **lucide-react** for icons.
- Tests: **Vitest** + Testing Library.

## Project structure

```
src/
  routes/                 file-based routes (SSR). "/" is index.tsx
  components/
    ui/                   shadcn / base-ui primitives (Button, etc.)
    layout/               Navbar, Footer, Container — page chrome
    sections/             homepage sections (hero, about, latest-releases…)
    brand/                LogoMark and brand assets
  core/
    config/site.ts        site-wide content: nav, releases, footer, meta
    lib/motion.ts         shared framer-motion variants
    pages/                standalone page views (e.g. not-found)
  lib/utils.ts            cn() and small helpers
  styles/globals.css      design tokens + base layer
```

Rules of placement:
- **Content and copy** (labels, cards, nav, taglines) go in
  `core/config/site.ts`, not inline in components.
- **Reusable primitives** go in `components/ui`; **page-specific building
  blocks** in `components/sections` or `components/layout`.
- **Shared animation** goes in `core/lib/motion.ts`.
- Keep files focused. When a component starts doing several unrelated things,
  split it (see how `Navbar` extracts `DropdownPanel` and `MobileMenu`).

## TypeScript & imports

- **Strict mode is on**, plus `noUnusedLocals` / `noUnusedParameters` and
  `noFallthroughCasesInSwitch`. Unused code fails the build — delete it.
- `verbatimModuleSyntax` is on: **type-only imports must be `import type`**
  (e.g. `import type { Variants } from "framer-motion"`). Mixed value/type
  imports use inline `type` on the specifier only when needed.
- Use the `@/` alias for `src` imports (`@/components/...`), not long relative
  paths.
- Avoid `any`. Model real types; narrow instead of casting. The `as never`
  casts around the topojson data are an isolated, commented exception — don't
  spread that pattern.

## Styling

- Compose classes with **`cn()`** from `@/lib/utils` (clsx + tailwind-merge) —
  it dedupes conflicting Tailwind classes. Don't concatenate class strings by
  hand.
- Component variants use **`cva`** (see `components/ui/button.tsx`).
- Follow the [design rules](./design-rules.md): tokens over hex, type scale over
  raw sizes, semantic tokens for structure.
- Prettier is configured with the Tailwind plugin and knows about `cn`/`cva`, so
  class ordering is automatic — just run format.

## React patterns

- Function components with hooks. No class components.
- Keep render pure. Side effects go in `useEffect` with correct deps and
  cleanup (every listener/observer/rAF added is removed — see `Navbar`,
  `WorldGlobe`).
- For per-frame animation, keep state in a `ref` and write to the DOM inside a
  single `requestAnimationFrame` loop; don't drive 60fps through `useState`.
- Respect `useReducedMotion()` anywhere you animate.
- Prefer semantic HTML and wire ARIA (`aria-labelledby`, `aria-expanded`,
  `aria-label`) as you build, not after.

## Formatting & linting

- **Prettier** (`.prettierrc`): no semicolons, double quotes, 2-space indent,
  `printWidth: 80`, `trailingComma: "es5"`, LF line endings. Run
  `npm run format`; `npm run check` verifies.
- **ESLint** uses `@tanstack/eslint-config`. Run `npm run lint`. Don't add new
  warnings. (Two pre-existing `consistent-type-specifier-style` errors in
  `button.tsx` / `utils.ts` predate current work — fix opportunistically, but
  don't let your change add more.)
- **`npm run typecheck`** (`tsc --noEmit`) must pass.

## Commits

- Small, focused commits with clear messages. Branch off `main`; open PRs into
  `main`. The active working branch is `fix`.
- Don't commit generated files you didn't mean to (`routeTree.gen.ts` is managed
  by the router plugin).

## Verification

Typecheck and lint are necessary but **not sufficient** — they prove the code
compiles, not that it works. For any behavioral change, **run the app and drive
the change**:

```bash
npm run dev          # Vite dev server (SSR)
```

Because the app is SSR, you can fetch `/` and assert on the rendered HTML for
content changes; interactive behavior (drag, menus) needs a real browser. Always
observe the change in the running app before calling it done. See the repo's
`verify` skill for the full protocol.

## Quick command reference

| Command | Does |
| --- | --- |
| `npm run dev` | Start dev server on :3000 (SSR) |
| `npm run build` | Production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run format` | Prettier write |
| `npm run check` | Prettier check |
| `npm run test` | Vitest |
