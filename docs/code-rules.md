# Code rules

## Stack

- **React 19** + **TypeScript** (strict), **Vite 8**.
- **TanStack Start / Router** — SSR and file-based routing in `src/routes`.
  `routeTree.gen.ts` is generated; never edit it.
- **Nitro** (`node-server` preset) for the server build.
- **Tailwind CSS v4** — tokens in `globals.css` via `@theme`.
- **GSAP** (with `@gsap/react`) for JS animation, **lucide-react** for icons.
- **Vitest** for tests.

No database, auth, storage or environment variables. Keep it that way unless
there's a strong reason; ask first.

## Structure

- `src/core/config/` — all content and copy (`site.ts`, `news.ts`, `kilo.ts`,
  `pages.ts`). Components own structure, not words.
- `src/components/` — `layout`, `ui` (shared primitives), `news`, `kilo`,
  `home`, `brand`.
- `src/core/lib/` — `motion.ts` (GSAP, its plugins, shared motion settings),
  `seo.ts` head tags.
- `src/lib/` — `cn()`, security headers.

## TypeScript

- Strict, with `noUnusedLocals` / `noUnusedParameters`.
- `verbatimModuleSyntax`: type-only imports use `import type`.
- Import via `@/`.
- Typed router links: use real route paths with `params` / `search`
  (`to="/news/$slug" params={{ slug }}`), not hand-built URLs, where you can.
- TypeScript stays on 6.x until `typescript-eslint` supports 7.

## Styling and React

- Compose classes with `cn()`.
- Function components and hooks. Side effects in `useEffect` with cleanup;
  GSAP in `useGSAP` with a `scope`, and `contextSafe` for anything created
  later (callbacks, delayed calls).
- Per-frame animation lives outside React state (see `KiloScene`): a
  `requestAnimationFrame` loop that stops offscreen and when the tab is hidden.

## Formatting and linting

- Prettier: no semicolons, double quotes, `printWidth` 80. `bun run format`.
- ESLint via `@tanstack/eslint-config`. `bun run lint`.
- `bun run typecheck` must pass.

## Verification

Typecheck and lint don't prove behavior. Run the app and look:

```bash
bun install
bun run dev        # http://localhost:3000
bun run typecheck
bun run lint
bun run test
bun run build
```

Content is visible in the SSR'd HTML (`curl localhost:3000/news`). Motion, the
canvas, the mobile menu and filters need a real browser — check 375px and
desktop, light and dark.
