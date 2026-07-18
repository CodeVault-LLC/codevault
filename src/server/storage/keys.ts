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

export function reportThumbKey(accessionId: string): string {
  return `reports/${accessionId}/${CURRENT_VERSION}/thumb.webp`
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
