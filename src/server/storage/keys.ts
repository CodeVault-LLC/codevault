import { randomUUID } from "node:crypto"

import type { Classification } from "@/core/reports/types"
import { env } from "@/env/server"

// R2 has no object versioning, so the /v1/ segment is the only versioning
// mechanism available. It is load-bearing, not cosmetic (design §5.2).
const CURRENT_VERSION = "v1"

export function reportPdfKey(accessionId: string): string {
  return `reports/${accessionId}/${CURRENT_VERSION}/report.pdf`
}

export function reportTextKey(accessionId: string): string {
  return `reports/${accessionId}/${CURRENT_VERSION}/report.txt`
}

/**
 * The cover render's key.
 *
 * The extension is a parameter because the format is not guaranteed to be WebP
 * — it depends on whether `cwebp` is present on the host. Serving a PNG from a
 * `.webp` key is the kind of small lie that surfaces much later as a broken
 * image, so the key follows the bytes.
 */
export function reportThumbKey(
  accessionId: string,
  format: ThumbnailFormat
): string {
  return `reports/${accessionId}/${CURRENT_VERSION}/thumb.${format}`
}

export type ThumbnailFormat = "webp" | "png"

/**
 * Where a cover render waits while its report is still a draft.
 *
 * Derived from the PDF's own quarantine key so the two are deleted, expired and
 * reasoned about together — an orphaned thumbnail is not dangerous, but it is
 * one more thing nobody would ever notice was there.
 */
export function quarantineThumbKey(
  quarantinePdfKey: string,
  format: ThumbnailFormat
): string {
  return `${quarantinePdfKey.replace(/\.pdf$/, "")}.thumb.${format}`
}

/**
 * Reads the format back off a stored key.
 *
 * Publish needs to know which extension to write at the destination, and the
 * key is where that fact already lives — storing the format in a second column
 * would be a copy that could disagree with it.
 */
export function thumbnailFormatFromKey(key: string): ThumbnailFormat {
  return key.endsWith(".png") ? "png" : "webp"
}

/**
 * A fresh quarantine key. Server-generated and random, never derived from the
 * uploaded filename: a user-controlled path or extension is a traversal and
 * content-type problem, and the name carries no information we need.
 */
export function newQuarantineKey(): string {
  return `uploads/${randomUUID()}.pdf`
}

/**
 * Which bucket serves a record's files. Internal records live in a bucket with
 * no public access at all, so a misconfiguration is loud and testable rather
 * than an invisible per-object ACL (design §5.1).
 */
export function servingBucket(classification: Classification): string {
  return classification === "internal" ? env.BUCKET_INTERNAL : env.BUCKET_PUBLIC
}
