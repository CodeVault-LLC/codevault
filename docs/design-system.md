# Design system

Everything lives in [`src/styles/globals.css`](../src/styles/globals.css).

## Color

Swatches are fixed; semantic tokens flip with the system color scheme.

| Swatch | Hex | Use |
| --- | --- | --- |
| `ivory` | `#faf9f5` | Page background (light) |
| `ivory-medium` | `#f0eee6` | Surfaces: the announcement card, panels |
| `oat` | `#e3dacc` | Release cards (light) |
| `slate` | `#141413` | Ink, footer |
| `clay` | `#d97757` | Kilo, the accent — mascot, circuits, list bullets |
| `clay-strong` | `#a64b31` | Accent text and the Kilo mark on light |
| `sky`, `olive`, `cactus`, `heather`, `coral` | | Illustration tiles only |

Semantic tokens: `background`, `foreground`, `surface`, `card`, `card-hover`,
`muted-foreground`, `faint`, `border`, `border-strong`, `accent`, and
`inverse` / `inverse-foreground` / `inverse-muted` for the footer.

Dark mode follows `prefers-color-scheme`; there is no toggle. Illustration
tiles keep their swatch and ink in both themes, like printed artwork.

## Type

| Family | Token | Use |
| --- | --- | --- |
| Inter | `font-sans` | Headlines, UI, cards |
| Lora | `font-serif` | Reading text (the body default), article titles |
| JetBrains Mono | `font-mono` | Uppercase detail labels |

Scale (each step carries its line height and tracking):

- `text-display-xxl` — article titles (serif)
- `text-display-xl` — the home headline (sans, bold)
- `text-display-l` — page titles
- `text-display-m` — article section headings (serif), featured titles
- `text-display-s` — section and card titles (sans, semibold)
- `text-display-xs` — list titles
- `text-paragraph-l` / `-m` / `-s` — serif reading sizes
- `text-ui` — nav and buttons; `text-caption` — meta; `text-label` — mono labels

## Shape and space

- Announcement card: `rounded-3xl`. Cards and art tiles: `rounded-2xl`.
  Buttons and inputs: `rounded-lg`. Chips: `rounded-full`.
- Wrap content in `Container` (max 86rem, gutter 16 → 40px).
- Sections breathe: `py-20 lg:py-28` between major blocks.

## Motion

- Headlines rise in word by word (`HeadlineWords`, CSS `word-rise`).
- Hero elements fade up with `fade-rise` and a `--d` delay.
- Sections reveal on scroll with `Reveal` / `RevealItem` (framer-motion,
  variants in `core/lib/motion.ts`).
- Card hover: background shifts one step, the arrow slides 2px.
- The Kilo scene is canvas; see `components/kilo/kilo-scene.tsx`.

Everything respects reduced motion: CSS animations switch off, framer-motion
runs under `MotionConfig reducedMotion="user"`, and the canvas draws its
finished state once.

## Components

| Component | Where |
| --- | --- |
| `SiteHeader`, `SiteFooter`, `PageShell`, `Container` | `components/layout` |
| `ButtonLink`, `buttonClass`, `Arrow`, `HeadlineWords`, `ArcRule`, `Reveal` | `components/ui` |
| `ReleaseCard`, `NewsRow`, `PostArt` | `components/news` |
| `KiloScene`, `KiloMascot`, `KiloLogo` | `components/kilo` |
| `KiloAnnouncement` | `components/home` |
