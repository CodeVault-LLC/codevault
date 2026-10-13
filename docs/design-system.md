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

## Photography

Daylight photographs of buildings under construction: galvanized conduit,
cable tray, ceiling voids, switch rooms, the outside of a frame going up.
Calm, orderly, warm neutral light, so they sit with ivory and oat. No people,
no text, no logos. They're generated for this site (OpenAI image generation
through Codex); the prompts ask for an editorial architectural photograph,
35mm, bright natural daylight, muted warm neutral palette.

- Listed with alt text in `src/core/config/images.ts`; files in
  `public/images/` as WebP at 960 and 1536 wide (`cwebp -q 80`).
- Shown with `Photo`, which crops to its frame and settles in once when
  scrolled into view. `priority` for a photo near the top of a page.
- They set the scene. Never caption one as a route CodeVault Electrical
  made, or as a customer's building.

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
- Wrap content in `Container` (max 80rem, 1280px, gutter 16 → 40px).
- Sections breathe: `py-20 lg:py-28` between major blocks.

## Motion

- Headlines rise in word by word (`HeadlineWords`, CSS `word-rise`).
- Hero elements fade up with `fade-rise` and a `--d` delay.
- Sections reveal on scroll with `Reveal` / `RevealItem` (GSAP ScrollTrigger,
  settings in `core/lib/motion.ts`; the hidden start state is CSS).
- Card hover: background shifts one step, the arrow slides 2px.
- **The announcement card introduces itself, then rests** (about five
  seconds, CSS only, in `components/home/electrical-announcement.tsx`).
  Three illustration tiles fade in on their swatches, pale at first and
  deepening like a print, each drawing one thing the product does. A hairline
  arc draws through them, each tile folds down into a small device on the
  line as the line passes, and the name settles onto the line, then the
  tagline and button. At rest, every ten seconds a soft persimmon pulse
  glides along the line and each device lights as it passes; otherwise
  nothing moves. With reduced motion it opens on the resting card, still.
- **The Electrical hero** (`components/electrical/electrical-hero.tsx`)
  fills the screen with one building, a long floor under construction with
  conduit converging down the ceiling, in three lights: morning, noon and
  evening, one camera. It opens dark: a level line draws out from the
  middle across the room's horizon, and the picture opens out from it, top
  and bottom, easing back into place. No colour, one movement. Then the
  name and an index of the page, its rows joined by dashed runs that turn
  solid persimmon when pointed at. The scene opens in the visitor's own time
  of day; the switch at the bottom changes it with a slow crossfade. After
  the introduction the camera drifts very slowly, and scrolling away lifts
  the words off. Reference: Anthropic's model launch pages; ours shows a
  building, not a sky.
- The routing scene is canvas; see `components/electrical/routing-scene.tsx`.
  A chalk floor plan, drawn flat like a drawing sheet: walls, doors,
  windows, a column grid with bubbles, ductwork dashed overhead. Room by
  room, a pointer picks the devices, the search spreads, a route is
  suggested (dashed), a check walks it and marks each wall it passes through
  with a sleeve, and it's added (solid); the lights come on. Every route
  comes from the router in `floor-plan.ts`, so none of them cross a duct, a
  column or a door's swing. The plan is sized by whichever of the frame's
  width and height runs out first, never stretched.
- **How it works** on the Electrical page is scroll-driven: the steps scroll
  past a pinned drawing (under the header on phones) that plays each step as
  it's read. Its steps in `electrical.ts` match the scene's four stages.
- Large statements can ink in word by word as they scroll (`InkText`), as
  "What we look for" does on the homepage. Once per page at most.
- Doodles (`components/ui/doodle.tsx`) are small line drawings in the same
  language — square terminals, stepped routes, something in the way — that
  draw themselves in once when scrolled into view. One per idea, beside the
  point it illustrates: Contact and the 404 page. New
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
