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
