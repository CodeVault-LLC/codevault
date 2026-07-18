// Server-only environment. Kept in its own module on purpose (design §10.3):
// when `isServer` is false, t3-env still constructs the `server: {}` object
// literal at module scope, so sharing a file with the client schema would ship
// every server variable *name* into the browser bundle. Values would not leak,
// but the names are free reconnaissance.

import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

export const env = createEnv({
  server: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),

    DATABASE_URL: z.url(),

    // Object storage. Endpoint points at SeaweedFS locally and at
    // <ACCOUNT_ID>.r2.cloudflarestorage.com in production — presigned URLs do
    // not work against an R2 custom domain, so this is never the CDN host.
    S3_ENDPOINT: z.url(),
    S3_REGION: z.string().default("auto"),
    S3_ACCESS_KEY_ID: z.string().min(1),
    S3_SECRET_ACCESS_KEY: z.string().min(1),
    // SeaweedFS requires the bucket in the path for presigned requests.
    S3_FORCE_PATH_STYLE: z.stringbool().default(false),

    BUCKET_PUBLIC: z.string().min(1),
    BUCKET_INTERNAL: z.string().min(1),
    BUCKET_QUARANTINE: z.string().min(1),

    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.url(),

    // Pick before the first enrollment — changing the relying-party ID
    // invalidates every credential already registered against it (design §7.2).
    PASSKEY_RP_ID: z.string().min(1),
    PASSKEY_RP_NAME: z.string().min(1),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
})
