import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { tmpdir } from "node:os"

import type { RenderedThumbnail } from "./types"
import { isToolAvailable, runTool } from "./tools"

/**
 * Cover-page render (design §5.2's `thumb.webp`).
 *
 * Every failure path here returns null rather than throwing. A thumbnail is a
 * convenience — it makes the deposit screen show you which document you just
 * uploaded — and losing an archived report because a page would not rasterize
 * is exactly the trade §9.4 warns against. The `partial` failure class exists
 * for this: the record is archivable, one derived artifact is missing, backfill
 * it later.
 */

const THUMBNAIL_WIDTH_PX = 480

/** A single page render. Well past the point where something is wrong. */
const RENDER_TIMEOUT_MS = 20_000

/**
 * `pdftoppm` cannot emit WebP — it renders PNG, and a second pass through
 * `cwebp` produces the WebP the design asks for (§5.2). When `cwebp` is absent
 * that pass is skipped and the bytes are a PNG. Storing those under a `.webp`
 * key with an `image/webp` content type would be a lie browsers eventually
 * catch, so `RenderedThumbnail` carries the format and the caller derives both
 * the key and the content type from it.
 */
export function thumbnailContentType(format: RenderedThumbnail["format"]) {
  return format === "webp" ? "image/webp" : "image/png"
}

export async function renderCoverThumbnail(
  bytes: Uint8Array
): Promise<RenderedThumbnail | null> {
  if (!(await isToolAvailable("pdftoppm"))) return null

  const workDir = await mkdtemp(join(tmpdir(), "codevault-thumb-"))
  const inputPath = join(workDir, "input.pdf")

  try {
    await writeFile(inputPath, bytes)

    // -f 1 -l 1 renders only the first page; without both, a 400-page report
    // rasterizes every page before we throw all but one away.
    //
    // -singlefile makes pdftoppm write to the given path verbatim instead of
    // appending its usual "-1" page suffix, which would otherwise mean guessing
    // the filename it chose.
    const result = await runTool(
      "pdftoppm",
      [
        "-png",
        "-f",
        "1",
        "-l",
        "1",
        "-singlefile",
        "-scale-to-x",
        String(THUMBNAIL_WIDTH_PX),
        // Preserves the page's aspect ratio rather than forcing a square.
        "-scale-to-y",
        "-1",
        inputPath,
        join(workDir, "cover"),
      ],
      { timeoutMs: RENDER_TIMEOUT_MS }
    )

    if (!result.ok) return null

    const pngPath = join(workDir, "cover.png")
    const png = new Uint8Array(await readFile(pngPath))

    const webp = await toWebp(pngPath, workDir)
    return webp
      ? { bytes: webp, format: "webp" }
      : { bytes: png, format: "png" }
  } catch {
    return null
  } finally {
    await rm(workDir, { recursive: true, force: true })
  }
}

/**
 * PNG → WebP, or null if `cwebp` is not installed.
 *
 * Worth the second subprocess: a cover render is typically 3–5× smaller as
 * WebP, and this image is served on every listing row that shows one.
 */
async function toWebp(
  pngPath: string,
  workDir: string
): Promise<Uint8Array | null> {
  if (!(await isToolAvailable("cwebp"))) return null

  const webpPath = join(workDir, "cover.webp")

  // -quiet keeps the encoder's progress output off stderr; -q 82 is past the
  // point where artifacts are visible on text-heavy page renders.
  const result = await runTool(
    "cwebp",
    ["-quiet", "-q", "82", pngPath, "-o", webpPath],
    { timeoutMs: RENDER_TIMEOUT_MS }
  )

  if (!result.ok) return null

  try {
    return new Uint8Array(await readFile(webpPath))
  } catch {
    return null
  }
}
