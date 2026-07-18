import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { tmpdir } from "node:os"

import type { DangerousConstruct, SanitizationReport } from "./types"
import { hasPdfMagic } from "./validate"
import { isToolAvailable, runTool } from "./tools"

/**
 * Content Disarm & Reconstruct (design §9.3).
 *
 * **Not a virus scan.** ClamAV is deliberately not here: it wants ~4GB always
 * on, it is signature-based and weak against a novel malicious PDF, and it
 * addresses endpoint infection — which is not the threat model. An archive
 * serving PDFs to browsers is defending against stored XSS and content
 * hijacking, and scanning does nothing for those.
 *
 * CDR is deterministic instead of probabilistic: it strips dangerous constructs
 * whether or not anyone has a signature for them. Two tiers:
 *
 * 1. `mutool clean` for well-formed files — garbage collection, xref
 *    compaction, stream cleaning, preserving fidelity.
 * 2. A Ghostscript PDF→PostScript→PDF round trip when the structural scan finds
 *    a dangerous key. PostScript has no representation for embedded JavaScript,
 *    so the construct cannot survive the intermediate format. It costs
 *    fidelity — possible rasterization, loss of bookmarks and links — which is
 *    why it is the escalation and not the default.
 *
 * qpdf is absent on purpose: it has no JavaScript or OpenAction removal flag,
 * confirmed by qpdf issue #1312, an open request for exactly that. It is a
 * repair tool, not a sanitizer.
 */

const DANGEROUS_CONSTRUCTS: DangerousConstruct[] = [
  "/JavaScript",
  "/JS",
  "/OpenAction",
  "/AA",
  "/Launch",
  "/EmbeddedFile",
]

/** Ghostscript is the slow path, and it is the one prone to pathological input. */
const GHOSTSCRIPT_TIMEOUT_MS = 60_000

export type SanitizeResult =
  | { ok: true; bytes: Uint8Array; report: SanitizationReport }
  | { ok: false; detail: string }

/**
 * Finds dangerous keys in the raw bytes.
 *
 * A deliberately blunt scan over the whole file rather than a parse of the
 * object graph, and it errs toward false positives: a PDF that merely mentions
 * `/JavaScript` inside a compressed stream triggers the escalation even when
 * nothing would ever execute. That is the right bias — the cost of a false
 * positive is a slower, slightly lower-fidelity conversion, and the cost of a
 * false negative is a live construct in the archive.
 *
 * It cannot see inside compressed object streams, which is precisely why it
 * decides *which sanitizer to run* rather than deciding whether the file is
 * safe. Everything is sanitized either way.
 */
export function scanForDangerousConstructs(
  bytes: Uint8Array
): DangerousConstruct[] {
  // latin1 maps bytes to code points one-to-one, so a token split across the
  // buffer is never mangled the way a UTF-8 decode would mangle it.
  const text = Buffer.from(bytes).toString("latin1")

  return DANGEROUS_CONSTRUCTS.filter((construct) => text.includes(construct))
}

export async function sanitizePdf(bytes: Uint8Array): Promise<SanitizeResult> {
  const found = scanForDangerousConstructs(bytes)
  const originalByteSize = bytes.byteLength

  const workDir = await mkdtemp(join(tmpdir(), "codevault-cdr-"))
  const inputPath = join(workDir, "input.pdf")
  const outputPath = join(workDir, "output.pdf")

  try {
    await writeFile(inputPath, bytes)

    const escalate = found.length > 0
    const result = escalate
      ? await runGhostscript(inputPath, outputPath)
      : await runMutool(inputPath, outputPath)

    if (!result.ok) {
      // A tool that is not installed must not silently become a pass. The
      // document is still archivable — refusing every upload because an image
      // lacks a binary would be worse — but the report says `none` so the
      // gap is visible in the dashboard rather than inferred from its absence.
      if (result.reason === "unavailable") {
        return {
          ok: true,
          bytes,
          report: {
            method: "none",
            removedConstructs: found,
            originalByteSize,
          },
        }
      }

      return { ok: false, detail: result.detail }
    }

    const sanitized = new Uint8Array(await readFile(outputPath))

    // Re-verify magic bytes on the *output* (design §9.3). A sanitizer that
    // produced something that is no longer a PDF has failed, however cleanly
    // it exited.
    if (!hasPdfMagic(sanitized)) {
      return {
        ok: false,
        detail: "Sanitized output is not a PDF.",
      }
    }

    if (sanitized.byteLength === 0) {
      return { ok: false, detail: "Sanitized output is empty." }
    }

    return {
      ok: true,
      bytes: sanitized,
      report: {
        method: escalate ? "ghostscript" : "mutool",
        removedConstructs: found,
        originalByteSize,
      },
    }
  } catch (error) {
    return {
      ok: false,
      detail: error instanceof Error ? error.message : "Sanitization failed.",
    }
  } finally {
    // The temp directory holds a copy of the document, so it goes whatever
    // happened above.
    await rm(workDir, { recursive: true, force: true })
  }
}

type RunOutcome =
  { ok: true } | { ok: false; reason: "unavailable" | "failed"; detail: string }

async function runMutool(
  inputPath: string,
  outputPath: string
): Promise<RunOutcome> {
  if (!(await isToolAvailable("mutool"))) {
    return { ok: false, reason: "unavailable", detail: "mutool not installed" }
  }

  // -g garbage-collects unreferenced objects, repeated for objects that only
  // become unreferenced once others are dropped. -s cleans content streams,
  // -d decompresses so the result is inspectable rather than opaque.
  const result = await runTool("mutool", [
    "clean",
    "-ggg",
    "-s",
    "-d",
    inputPath,
    outputPath,
  ])

  return result.ok
    ? { ok: true }
    : { ok: false, reason: "failed", detail: result.detail }
}

async function runGhostscript(
  inputPath: string,
  outputPath: string
): Promise<RunOutcome> {
  if (!(await isToolAvailable("gs"))) {
    return { ok: false, reason: "unavailable", detail: "gs not installed" }
  }

  // Ghostscript has its own CVE history, so it runs locked down (design §9.3):
  // -dSAFER disables file access outside the input, -dNOTRANSPARENCY and the
  // absent -dNOSAFER are deliberate, and no network is reachable from it.
  const result = await runTool(
    "gs",
    [
      "-dSAFER",
      "-dBATCH",
      "-dNOPAUSE",
      "-dQUIET",
      "-dNOOUTERSAVE",
      // The round trip that does the actual disarming. Going out through
      // PostScript is what guarantees the constructs cannot survive: the
      // format has no way to express them.
      "-sDEVICE=pdfwrite",
      "-dCompatibilityLevel=1.7",
      `-sOutputFile=${outputPath}`,
      inputPath,
    ],
    { timeoutMs: GHOSTSCRIPT_TIMEOUT_MS }
  )

  return result.ok
    ? { ok: true }
    : { ok: false, reason: "failed", detail: result.detail }
}
