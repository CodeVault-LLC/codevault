# Design system

The concrete foundations. All of this is defined in
[`src/styles/globals.css`](../src/styles/globals.css) as CSS custom properties
and Tailwind v4 `@theme` tokens. **Use the tokens — never hard-code a hex value
or a raw pixel font size in a component.**

## Feeling

Warm, quiet, editorial. An ivory paper background, near-black slate text, a
single restrained green (olive) as the living accent. Generous whitespace, few
borders, gentle motion. It should read like a well-set page, not a dashboard.

## Color

Brand swatches (available as `bg-*`, `text-*`, `border-*` where wired):

| Token | Value | Use |
| --- | --- | --- |
| `--ivory-light` | `#faf9f5` | Default page background |
| `--ivory-medium` | `#f0eee6` | Alternating section background |
| `--ivory-dark` | `#e8e6dc` | Subtle raised/inset surfaces |
| `--oat` | `#e3dacc` | Warmer card surface (e.g. project cards) |
| `--slate-dark` | `#141413` | Foreground / primary text & buttons |
| `--slate-medium` | `#3d3d3a` | Button hover, secondary dark |
| `--slate-light` | `#5e5d59` | Muted foreground |
| `--cloud-*` | greys | Borders, disabled, faint UI |
| `--olive` | `#788c5d` | **The accent.** Life, "healthy," highlights |
| `--clay` / `--accent` | `#d97757` / `#c6613f` | Rare warm accent, selection |

Semantic tokens (`--background`, `--foreground`, `--muted-foreground`,
`--border`, `--ring`, `--primary`, etc.) map onto the swatches and **flip in dark
mode** (the `.dark` block). Prefer semantic tokens for anything structural so
dark mode keeps working; reach for a named swatch only for deliberate brand
moments.

Conventions in use:
- `text-faded` = 60% foreground, for eyebrows and captions.
- `border-faded` = the hairline border used across cards and dividers.
- Olive is the emotional payoff (see the globe going green on scroll). Use it
  sparingly so it stays meaningful.

## Typography

Three families, all with graceful fallbacks (`--font-sans`, `--font-serif`,
`--font-mono`):

- **Sans** (Anthropic Sans → Inter) — everything by default.
- **Serif** (Anthropic Serif → Tiempos) — used *italic* for a single emphasized
  word in a heading (e.g. *people*, *tech*, *project*). This is our signature
  move. One accent word per heading, no more.
- **Mono** — code and the occasional label.

Use the **fluid type scale utilities**, not raw sizes:

- Headings: `text-display-xs … text-display-xxl` (already carry weight,
  line-height, letter-spacing).
- Body: `text-paragraph-s / -m / -l`.
- Eyebrows / labels: `text-detail-xs` (uppercase, tracked) paired with
  `text-faded`.

Use `text-balance` on headings and `text-pretty` on paragraphs.

## Spacing, radius, layout

- Layout width is owned by [`Container`](../src/components/layout/container.tsx) —
  wrap section content in it rather than re-inventing max-widths.
- Sections breathe: vertical rhythm like `py-20 md:py-28` / `py-24 md:py-32`.
- Radii come from tokens: `rounded-lg / -xl / -2xl` map to `--radius-*`. Cards
  are typically `rounded-2xl` with a `border-faded` hairline.
- Card grids use the "gap-px over a faded background" trick to draw dividers
  (`bg-faded` + `gap-px` + `overflow-hidden rounded-2xl`).

## Motion

Framer Motion, with shared variants in
[`src/core/lib/motion.ts`](../src/core/lib/motion.ts): `fadeUp`, `fadeIn`,
`fadeDown`, `scaleIn`, `staggerContainer(stagger, delay)`, and `viewportOnce`.

- Reuse these variants; don't scatter bespoke `initial/animate` objects.
- Entrance pattern: a `staggerContainer` parent with `fadeUp` children,
  `whileInView="show"` + `viewport={viewportOnce}` for scroll reveals.
- Standard easing is `[0.22, 1, 0.36, 1]`. Durations stay in the ~0.4–0.6s range.
- **Always respect reduced motion** — `useReducedMotion()` and skip transforms
  when it's set (see `hero.tsx` and `navbar.tsx`).
- High-frequency animation (e.g. the globe) runs a single `requestAnimationFrame`
  loop writing directly to the DOM via refs — it must not trigger React
  re-renders. Follow that pattern for anything animating every frame.

## Icons & assets

- Icons: [`lucide-react`](https://lucide.dev), sized with `size-*` utilities.
- Brand mark: [`LogoMark`](../src/components/brand/logo-mark.tsx).
