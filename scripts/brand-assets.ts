// Regenerates every static brand asset in public/ from one source of truth: the
// aperture geometry below, which is the same geometry LogoGlyph draws.
//
// Run with `bun run brand:assets` after changing the mark. It needs
// `rsvg-convert` (librsvg) and `magick` (ImageMagick) on PATH — they are build
// tools, not app dependencies, so this is a deliberate manual step rather than
// part of `bun run build`.
//
// The rasters all use the badge (filled plate, knocked-out aperture) rather than
// the bare mark. A transparent mark disappears against dark browser chrome at
// 16px; the plate is legible everywhere, and keeps the tab, the phone home
// screen, and the PWA tile looking like the same product.

import { mkdirSync, writeFileSync } from "node:fs"
import { execFileSync } from "node:child_process"
import { join } from "node:path"

const PUBLIC = join(import.meta.dirname, "..", "public")
const TMP = join(import.meta.dirname, "..", ".brand-tmp")

const SLATE = "#141413"
const IVORY = "#faf9f5"

const BLADE = "M12.3 0A12.3 12.3 0 0 1 5.775 10.86L-.412 5.886L5.003 3.127Z"

/** The four blades, centered on a 32×32 grid at the given scale. */
function blades(fill: string, scale: number) {
  const paths = [0, 90, 180, 270]
    .map((a) => `<path transform="rotate(${a})" d="${BLADE}"/>`)
    .join("")
  return `<g transform="translate(16 16) scale(${scale})" fill="${fill}" stroke="${fill}" stroke-width="1.6" stroke-linejoin="round">${paths}</g>`
}

/** The bare aperture, transparent behind it. */
function markSvg(fill: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">${blades(fill, 1)}</svg>`
}

/**
 * The aperture knocked out of a plate. `radius` is the plate corner radius and
 * `inset` shrinks the glyph — maskable icons need the glyph inside the safe
 * zone, and Apple applies its own mask so its tile wants square corners.
 */
function badgeSvg(opts: {
  plate: string
  glyph: string
  radius: number
  inset?: number
}) {
  const scale = 0.78 * (opts.inset ?? 1)
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="${opts.radius}" fill="${opts.plate}"/>${blades(opts.glyph, scale)}</svg>`
}

/** The mark alone, flipping with the reader's color scheme. */
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <style>
    .blade { fill: ${SLATE}; stroke: ${SLATE}; }
    @media (prefers-color-scheme: dark) {
      .blade { fill: ${IVORY}; stroke: ${IVORY}; }
    }
  </style>
  <g transform="translate(16 16)" stroke-width="1.6" stroke-linejoin="round">
    ${[0, 90, 180, 270]
      .map((a) => `<path class="blade" transform="rotate(${a})" d="${BLADE}"/>`)
      .join("\n    ")}
  </g>
</svg>
`

function png(name: string, svg: string, size: number) {
  const src = join(TMP, `${name}.svg`)
  writeFileSync(src, svg)
  execFileSync("rsvg-convert", [
    "-w",
    String(size),
    "-h",
    String(size),
    src,
    "-o",
    join(PUBLIC, name),
  ])
  console.log(`  ${name} (${size}px)`)
}

mkdirSync(TMP, { recursive: true })

const tab = badgeSvg({ plate: SLATE, glyph: IVORY, radius: 7 })
const tile = badgeSvg({ plate: SLATE, glyph: IVORY, radius: 8.5 })
const maskable = badgeSvg({
  plate: SLATE,
  glyph: IVORY,
  radius: 0,
  inset: 0.72,
})

console.log("brand assets →")

writeFileSync(join(PUBLIC, "favicon.svg"), faviconSvg)
console.log("  favicon.svg")
writeFileSync(join(PUBLIC, "logo-mark.svg"), markSvg(SLATE))
console.log("  logo-mark.svg")

png("favicon-16x16.png", tab, 16)
png("favicon-32x32.png", tab, 32)
// Apple masks the tile itself, so this one is square and full-bleed.
png(
  "apple-touch-icon.png",
  badgeSvg({ plate: SLATE, glyph: IVORY, radius: 0 }),
  180
)
png("android-chrome-192x192.png", tile, 192)
png("android-chrome-512x512.png", tile, 512)
png("icon-maskable-512x512.png", maskable, 512)
png("icon.png", tile, 1024)

// The .ico carries 16/32/48 so Windows and older browsers pick a real size
// instead of downsampling one.
const icoSrc = join(TMP, "ico.svg")
writeFileSync(icoSrc, tab)
const icoParts = [16, 32, 48].map((s) => {
  const out = join(TMP, `ico-${s}.png`)
  execFileSync("rsvg-convert", [
    "-w",
    String(s),
    "-h",
    String(s),
    icoSrc,
    "-o",
    out,
  ])
  return out
})
execFileSync("magick", [...icoParts, join(PUBLIC, "favicon.ico")])
console.log("  favicon.ico (16/32/48)")

// --- The social card --------------------------------------------------------
//
// 1200×630 is the aspect every Open Graph consumer crops toward, and the one
// size where a card renders as a wide banner rather than a thumbnail. It lives
// here rather than in a design file because it is the mark plus two strings
// that already exist in `src/core/config/site.ts`; a hand-exported PNG would go
// stale the first time either changed.
//
// Two passes, because neither tool does both halves well: rsvg-convert draws
// the plate and the aperture, then magick sets the type. The type is set with
// the Inter TTF that ships in `public/fonts` rather than a font-family name —
// librsvg resolves families through fontconfig, so an SVG asking for "Inter"
// renders in whatever the machine happens to have, and the card would look
// different on every developer's laptop.

const OG = { w: 1200, h: 630 }
const INTER = join(PUBLIC, "fonts", "Inter-VariableFont_opsz,wght.ttf")

// Kept in sync by hand with `site.name`/`site.tagline` — this script is a Node
// build tool and importing the app's config would drag in the Vite aliases.
const OG_WORDMARK = "CodeVault"
const OG_TAGLINE = "We point ourselves at tech, and see what happens."
const OG_DOMAIN = "codevault.no"

const ogPlate = `<svg xmlns="http://www.w3.org/2000/svg" width="${OG.w}" height="${OG.h}" viewBox="0 0 ${OG.w} ${OG.h}">
  <rect width="${OG.w}" height="${OG.h}" fill="${SLATE}"/>
  <g transform="translate(88 88) scale(3)" fill="${IVORY}" stroke="${IVORY}" stroke-width="1.6" stroke-linejoin="round">
    <g transform="translate(16 16)">
      ${[0, 90, 180, 270]
        .map((a) => `<path transform="rotate(${a})" d="${BLADE}"/>`)
        .join("\n      ")}
    </g>
  </g>
  <rect x="88" y="512" width="120" height="2" fill="${IVORY}" opacity="0.28"/>
</svg>
`

const ogPlatePath = join(TMP, "og-plate.svg")
const ogFlatPath = join(TMP, "og-plate.png")
writeFileSync(ogPlatePath, ogPlate)
execFileSync("rsvg-convert", [
  "-w",
  String(OG.w),
  "-h",
  String(OG.h),
  ogPlatePath,
  "-o",
  ogFlatPath,
])

// `-annotate` offsets are from the NorthWest gravity corner, so every y below
// is a top edge rather than a baseline — easier to keep on the 88px margin.
execFileSync("magick", [
  ogFlatPath,
  "-font",
  INTER,
  "-gravity",
  "NorthWest",
  "-fill",
  IVORY,
  "-pointsize",
  "96",
  "-annotate",
  "+88+286",
  OG_WORDMARK,
  // The tagline is the quieter of the two lines, so it drops to ~65% rather
  // than changing color — a second ivory would read as a third brand tone.
  "-fill",
  `${IVORY}A6`,
  "-pointsize",
  "38",
  "-annotate",
  "+88+412",
  OG_TAGLINE,
  "-fill",
  `${IVORY}73`,
  "-pointsize",
  "26",
  "-annotate",
  "+88+544",
  OG_DOMAIN,
  join(PUBLIC, "og-image.png"),
])
console.log(`  og-image.png (${OG.w}×${OG.h})`)
