import { S3Client } from "@aws-sdk/client-s3"

import { env } from "@/env/server"

// R2's presigned-URL ceiling. Any longer expiry is silently rejected at
// signing time, so the port clamps rather than letting a caller find out in
// production.
export const MAX_PRESIGN_SECONDS = 7 * 24 * 60 * 60

// AWS SDK v3.729.0 began sending CRC32 checksums on every upload, which broke
// every S3-compatible backend at once. R2 has since added checksum support, but
// pinning the behaviour costs nothing and keeps the local emulator honest.
const s3 = new S3Client({
  region: env.S3_REGION,
  endpoint: env.S3_ENDPOINT,
  forcePathStyle: env.S3_FORCE_PATH_STYLE,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY,
  },
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
})

export { s3 }

/** Clamp an expiry to R2's ceiling. Non-positive values fall back to a minute. */
export function clampExpiry(seconds: number): number {
  if (!Number.isFinite(seconds) || seconds <= 0) return 60
  return Math.min(Math.floor(seconds), MAX_PRESIGN_SECONDS)
}
