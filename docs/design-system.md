# Design system

Everything lives in [`src/styles/globals.css`](../src/styles/globals.css).

## Color

Swatches are fixed; semantic tokens flip with the system color scheme.

| Swatch                                       | Hex                  | Use                                          |
| -------------------------------------------- | -------------------- | -------------------------------------------- |
| `ivory`                                      | `#faf9f5`            | Page background (light)                      |
| `ivory-medium`                               | `#f0eee6`            | Surfaces: the announcement card, panels      |
| `oat`                                        | `#e3dacc`            | Release cards (light)                        |
| `slate`                                      | `#141413`            | Ink, footer                                  |
| `persimmon`                                  | `#e85d3c`            | The accent — mascot, routes, list bullets    |
| `persimmon-strong`                           | `#b03a1e`            | Accent text and the Electrical mark on light |
| `persimmon-shade`, `persimmon-light`         | `#c64528`, `#f7977d` | Orbit's shading only                         |
| `sky`, `olive`, `cactus`, `heather`, `coral` |                      | Illustration tiles only                      |

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
- The routing scene is canvas; see `components/electrical/routing-scene.tsx`.
  A chalk floor plan lies foreshortened on the card, as if on a table: walls,
  doors, windows, a column grid with bubbles, ductwork dashed overhead. Room
  by room, a pointer picks the devices, the search spreads, the route draws in
  with rounded elbows, a check walks it and marks each wall it passes through
  with a sleeve, and the lights come on. Every route comes from the router in
  `floor-plan.ts`, so none of them cross a duct, a column or a door's swing.
  Wide screens get a three-room plan, sized by the card's height so it sits
  in the middle rather than stretching; narrow ones get a compact plan.
- Doodles (`components/ui/doodle.tsx`) are small line drawings in the same
  language — square terminals, stepped routes, something in the way — that
  draw themselves in once when scrolled into view. One per idea, beside the
  point it illustrates: the "How it works" items, Contact, the 404 page. New
  drawings go in that file's `DRAWINGS`. Don't put one on every heading.
- The tool diagrams on the Electrical page draw in on scroll and replay when
  their card is hovered. An "In progress" status dot breathes (`pulse-dot`).
- Orbit appears on the Brand page only. The scenes, news illustrations and
  doodles stay without it. A mascot on every page reads as a toy.
- Orbit (`components/brand/orbit.tsx`) is still at rest; no floating. It
  blinks, waves once on arrival and on hover, and works in short bursts with
  pauses. Only while on screen.

Everything respects reduced motion: CSS animations switch off, GSAP code runs
under `gsap.matchMedia()` with the queries in `motionQuery`, and the canvas
draws its finished state once.

## Components

| Component                                                                            | Where                   |
| ------------------------------------------------------------------------------------ | ----------------------- |
| `SiteHeader`, `SiteFooter`, `PageShell`, `Container`                                 | `components/layout`     |
| `ButtonLink`, `buttonClass`, `Arrow`, `HeadlineWords`, `ArcRule`, `Reveal`, `Doodle` | `components/ui`         |
| `ReleaseCard`, `NewsRow`, `PostArt`                                                  | `components/news`       |
| `RoutingScene`, `ToolDiagram`, `ElectricalMark`                                      | `components/electrical` |
| `ElectricalAnnouncement`                                                             | `components/home`       |
| `Orbit` (the CodeVault mascot), `LogoMark`, `LogoGlyph`                              | `components/brand`      |
