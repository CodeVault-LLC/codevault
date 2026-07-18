// Creates the three buckets the archive needs, if they are missing.
//
// Idempotent, and run as part of `bun run dev:up`. In production the buckets
// are created once by hand in the Cloudflare dashboard — this exists so a local
// stack is one command away, not to manage production storage.

import { CreateBucketCommand, HeadBucketCommand } from "@aws-sdk/client-s3"

import { env } from "@/env/server"
import { s3 } from "@/server/storage/s3-client"

const buckets = [env.BUCKET_PUBLIC, env.BUCKET_INTERNAL, env.BUCKET_QUARANTINE]

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

console.log(`Bootstrapping buckets at ${env.S3_ENDPOINT}`)
for (const bucket of buckets) {
  await ensureBucket(bucket)
}
