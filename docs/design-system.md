# Design system

Everything lives in [`src/styles/globals.css`](../src/styles/globals.css).

## Color

Swatches are fixed; semantic tokens flip with the system color scheme.

| Swatch                                       | Hex                  | Use                                               |
| -------------------------------------------- | -------------------- | ------------------------------------------------- |
| `ivory`                                      | `#faf9f5`            | Page background (light)                           |
| `ivory-medium`                               | `#f0eee6`            | Surfaces: the announcement card, panels           |
| `oat`                                        | `#e3dacc`            | Release cards (light)                             |
| `slate`                                      | `#141413`            | Ink, footer                                       |
| `persimmon`                                  | `#e85d3c`            | Kilo, the accent — mascot, circuits, list bullets |
| `persimmon-strong`                           | `#b03a1e`            | Accent text and the Kilo mark on light            |
| `persimmon-shade`, `persimmon-light`         | `#c64528`, `#f7977d` | Orbit's shading only                              |
| `sky`, `olive`, `cactus`, `heather`, `coral` |                      | Illustration tiles only                           |

Semantic tokens: `background`, `foreground`, `surface`, `card`, `card-hover`,
`muted-foreground`, `faint`, `border`, `border-strong`, `accent`, and
`inverse` / `inverse-foreground` / `inverse-muted` for the footer.

Dark mode follows `prefers-color-scheme`; there is no toggle. Illustration
tiles keep their swatch and ink in both themes, like printed artwork.

## Type

| Family         | Token        | Use                                             |
| -------------- | ------------ | ----------------------------------------------- |
| Inter          | `font-sans`  | Headlines, UI, cards                            |
| Lora           | `font-serif` | Reading text (the body default), article titles |
| JetBrains Mono | `font-mono`  | Uppercase detail labels                         |

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
- Sections reveal on scroll with `Reveal` / `RevealItem` (GSAP ScrollTrigger,
  settings in `core/lib/motion.ts`; the hidden start state is CSS).
- Card hover: background shifts one step, the arrow slides 2px.
- The Kilo scene is canvas; see `components/kilo/kilo-scene.tsx`. Orbit
  rides on top as SVG, held `still` and moved by the scene. It flies: lifts
  off each roof, swoops low between the modules and settles on the next.
  Every leg starts and ends at rest with zero acceleration, and the bank,
  glance and trailing hands come from the path's own velocity, so motion
  stays smooth at any frame rate. Flights stay below the rooftops so they
  never cross the title.
- Orbit (`components/brand/orbit.tsx`) is still at rest; no floating. It
  blinks, waves once on arrival and on hover, and works in short bursts with
  pauses. Only while on screen.

Everything respects reduced motion: CSS animations switch off, GSAP code runs
under `gsap.matchMedia()` with the queries in `motionQuery`, and the canvas
draws its finished state once.

## Components

| Component                                                                  | Where               |
| -------------------------------------------------------------------------- | ------------------- |
| `SiteHeader`, `SiteFooter`, `PageShell`, `Container`                       | `components/layout` |
| `ButtonLink`, `buttonClass`, `Arrow`, `HeadlineWords`, `ArcRule`, `Reveal` | `components/ui`     |
| `ReleaseCard`, `NewsRow`, `PostArt`                                        | `components/news`   |
| `KiloScene`, `KiloLogo`                                                    | `components/kilo`   |
| `KiloAnnouncement`                                                         | `components/home`   |
| `Orbit` (the CodeVault mascot), `LogoMark`, `LogoGlyph`                    | `components/brand`  |
