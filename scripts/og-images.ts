// Renders the social cards (Open Graph images) in public/og/: one for the
// site, one for CodeVault Electrical, and one per news post.
//
// Run with `bun run og:images` after changing a post's title or summary, or
// adding one. It lays each card out as HTML with the site's own fonts and has
// headless Chrome take a 1200×630 screenshot — the one size every unfurler
// handles as a wide card. Chrome is a build tool here, not an app dependency,
// so this is a manual step like `brand:assets`. Set CHROME to its path if it
// isn't in the usual macOS place.

import { execFileSync } from "node:child_process"
import { mkdirSync, rmSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { pathToFileURL } from "node:url"

import { electrical } from "../src/core/config/electrical"
import { allPosts } from "../src/core/config/news"
import { site } from "../src/core/config/site"

const ROOT = join(import.meta.dirname, "..")
const OUT = join(ROOT, "public", "og")
const TMP = join(ROOT, ".og-tmp")
const CHROME =
  process.env.CHROME ??
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

const font = (pkg: string, file: string) =>
  pathToFileURL(
    join(ROOT, "node_modules", "@fontsource-variable", pkg, "files", file)
  ).href

// The CodeVault aperture, as LogoGlyph draws it.
const BLADE = "M12.3 0A12.3 12.3 0 0 1 5.775 10.86L-.412 5.886L5.003 3.127Z"
const glyph = `<svg viewBox="0 0 32 32" width="40" height="40"><g transform="translate(16 16)" fill="#141413" stroke="#141413" stroke-width="1.6" stroke-linejoin="round">${[
  0, 90, 180, 270,
]
  .map((a) => `<path transform="rotate(${a})" d="${BLADE}"/>`)
  .join("")}</g></svg>`

// A run around an obstacle, between two terminals: the product's own picture.
const route = `<svg class="route" viewBox="0 0 420 240" width="420" height="240" fill="none" stroke-linecap="round" stroke-linejoin="round">
  <g stroke="#87867f" stroke-width="3" stroke-dasharray="10 9">
    <rect x="150" y="40" width="110" height="96"/>
    <path d="M150 40 L260 136 M260 40 L150 136"/>
  </g>
  <path d="M40 196 H286 Q316 196 316 166 V70 Q316 40 346 40 H372" stroke="#e85d3c" stroke-width="10"/>
  <rect x="10" y="180" width="32" height="32" fill="#141413"/>
  <rect x="372" y="24" width="32" height="32" fill="#141413"/>
</svg>`

const escape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

function card(opts: { label: string; title: string; body: string }) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: Inter; src: url(${font("inter", "inter-latin-wght-normal.woff2")}); font-weight: 100 900; }
@font-face { font-family: Lora; src: url(${font("lora", "lora-latin-wght-normal.woff2")}); font-weight: 400 700; }
@font-face { font-family: Mono; src: url(${font("jetbrains-mono", "jetbrains-mono-latin-wght-normal.woff2")}); font-weight: 100 800; }
* { margin: 0; box-sizing: border-box; }
html, body { width: 1200px; height: 630px; overflow: hidden; }
body { background: #faf9f5; color: #141413; font-family: Inter; padding: 72px 80px; position: relative; }
.top { display: flex; align-items: center; gap: 14px; font-weight: 600; font-size: 30px; letter-spacing: -0.01em; }
.label { margin-left: auto; font-family: Mono; font-size: 18px; letter-spacing: 0.08em; text-transform: uppercase; color: #5e5d59; }
h1 { font-family: Lora; font-weight: 400; font-size: 72px; line-height: 1.06; letter-spacing: -0.02em; margin-top: 64px; max-width: 760px; }
h1.long { font-size: 54px; max-width: 840px; margin-top: 56px; }
p { font-size: 27px; line-height: 1.4; color: #5e5d59; margin-top: 26px; max-width: 640px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.domain { position: absolute; left: 80px; bottom: 64px; font-family: Mono; font-size: 18px; letter-spacing: 0.04em; color: #87867f; }
.route { position: absolute; right: 64px; bottom: 56px; }
</style></head><body>
<div class="top">${glyph}<span>${site.name}</span><span class="label">${escape(opts.label)}</span></div>
<h1${opts.title.length > 34 ? ' class="long"' : ""}>${escape(opts.title)}</h1>
<p>${escape(opts.body)}</p>
<div class="domain">codevault.no</div>
${route}
</body></html>`
}

function render(name: string, html: string) {
  const src = join(TMP, `${name.replace(/\//g, "-")}.html`)
  writeFileSync(src, html)
  const out = join(OUT, `${name}.png`)
  mkdirSync(join(out, ".."), { recursive: true })
  execFileSync(
    CHROME,
    [
      "--headless=new",
      "--disable-gpu",
      "--hide-scrollbars",
      "--force-device-scale-factor=1",
      "--window-size=1200,630",
      // Lets the web fonts load before the screenshot is taken.
      "--virtual-time-budget=3000",
      `--screenshot=${out}`,
      pathToFileURL(src).href,
    ],
    { stdio: "ignore" }
  )
  console.log(`  og/${name}.png`)
}

mkdirSync(TMP, { recursive: true })
console.log("social cards →")

render(
  "site",
  card({
    label: "Company",
    title:
      "Software for problems large organisations have learned to live with.",
    body: `Right now: ${electrical.name}, conduit routing for Revit.`,
  })
)

render(
  "about",
  card({
    label: "About",
    title: "CodeVault is a software company in Norway.",
    body: `Software for problems large organisations have learned to live with. First: ${electrical.name}.`,
  })
)

render(
  "electrical",
  card({
    label: electrical.hero.eyebrow,
    title: electrical.name,
    body: `${electrical.tagline} ${electrical.hero.body}`,
  })
)

for (const post of allPosts())
  render(
    `news/${post.slug}`,
    card({ label: post.category, title: post.title, body: post.summary })
  )

rmSync(TMP, { recursive: true, force: true })
