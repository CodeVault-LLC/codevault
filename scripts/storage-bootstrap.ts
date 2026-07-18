// Creates the three buckets the archive needs and applies the CORS policy the
// browser upload depends on.
//
// Idempotent, and run as part of `bun run dev:up`. In production the buckets
// are created once by hand in the Cloudflare dashboard — this exists so a local
// stack is one command away, not to manage production storage.
//
// ⚠️ The CORS policy below is NOT local-only scaffolding. R2 requires the
// equivalent policy on the quarantine bucket or browser uploads fail in
// production exactly as they do here. Set it in the Cloudflare dashboard, or
// with this same PutBucketCors call against the R2 endpoint.

import {
  CreateBucketCommand,
  HeadBucketCommand,
  PutBucketCorsCommand,
} from "@aws-sdk/client-s3"

import { env } from "@/env/server"
import { s3 } from "@/server/storage/s3-client"

const buckets = [env.BUCKET_PUBLIC, env.BUCKET_INTERNAL, env.BUCKET_QUARANTINE]

// The app's own origin. Derived from BETTER_AUTH_URL rather than given its own
// variable, so the two cannot drift apart into a confusing CORS failure.
const appOrigin = new URL(env.BETTER_AUTH_URL).origin

async function ensureBucket(bucket: string): Promise<void> {
  try {
    await s3.send(new HeadBucketCommand({ Bucket: bucket }))
    console.log(`  ${bucket} — already exists`)
    return
  } catch {
    // Fall through to create. A HEAD failure here means "absent or
    // unreachable"; if it is unreachable the create below fails loudly.
  }

  await s3.send(new CreateBucketCommand({ Bucket: bucket }))
  console.log(`  ${bucket} — created`)
}

/**
 * Lets the browser PUT straight into quarantine.
 *
 * The deposit flow uploads direct to object storage from the page, which is a
 * cross-origin request: the app is on one origin and storage is on another. A
 * PDF Content-Type is not a CORS-simple value, so the browser sends an OPTIONS
 * preflight first — and an unauthenticated preflight is rejected by the S3 auth
 * layer unless a bucket CORS policy answers it. Without this the upload fails
 * with no status at all, which surfaces as a bare network error.
 *
 * Only the quarantine bucket needs it. Downloads are served by redirecting the
 * browser to a presigned URL, which is a navigation rather than a fetch, so no
 * preflight is involved.
 */
async function ensureUploadCors(bucket: string): Promise<void> {
  await s3.send(
    new PutBucketCorsCommand({
      Bucket: bucket,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedOrigins: [appOrigin],
            AllowedMethods: ["PUT"],
            AllowedHeaders: ["content-type"],
            MaxAgeSeconds: 3000,
          },
        ],
      },
    })
  )

  console.log(`  ${bucket} — CORS allows PUT from ${appOrigin}`)
}

console.log(`Bootstrapping buckets at ${env.S3_ENDPOINT}`)
for (const bucket of buckets) {
  await ensureBucket(bucket)
}

await ensureUploadCors(env.BUCKET_QUARANTINE)
