import { createFileRoute } from "@tanstack/react-router"
import { timingSafeEqual } from "node:crypto"
import { z } from "zod"

import { env } from "@/env/server"
import { handleQuarantineEvent } from "@/server/ingest/notifications"

/**
 * The R2 event-notification sink (design §9.1).
 *
 * A Cloudflare Queue consumer POSTs here when objects land in the quarantine
 * bucket, so validation is driven by the bucket rather than by a client
 * remembering to call back. Nothing else in the system needs this to be public,
 * and it is not — see the shared-secret check below.
 *
 * It deliberately answers 200 for individual rejections. The queue's retry is
 * for delivery failures, and a PDF that is encrypted will still be encrypted on
 * the fourth attempt — the taxonomy in `types.ts` is what decides retryability,
 * not the HTTP status. Returning 500 here would put permanent failures into a
 * redelivery loop, which is exactly the failure §10.5 warns against.
 */

const eventSchema = z.object({
  // R2's payload carries more; only the key is trusted. See `QuarantineEvent`.
  messages: z
    .array(z.object({ object: z.object({ key: z.string().min(1).max(1024) }) }))
    .max(100),
})

function isAuthorized(request: Request): boolean {
  const provided = request.headers.get("authorization")
  const expected = `Bearer ${env.INGEST_NOTIFY_SECRET}`

  if (!provided) return false

  const a = Buffer.from(provided)
  const b = Buffer.from(expected)

  // Length has to match before `timingSafeEqual`, which throws otherwise. The
  // comparison is constant-time so a wrong secret cannot be recovered a byte at
  // a time from response timings.
  return a.length === b.length && timingSafeEqual(a, b)
}

export const Route = createFileRoute("/api/ingest/notify")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isAuthorized(request)) {
          // 404 rather than 401: an unauthenticated caller learns nothing about
          // whether this endpoint exists.
          return new Response("Not found", { status: 404 })
        }

        const parsed = eventSchema.safeParse(await request.json())

        if (!parsed.success) {
          return Response.json({ error: "Malformed payload" }, { status: 400 })
        }

        // Sequential rather than concurrent. Each message runs a PDF sanitizer
        // and a page renderer, both of which are memory-hungry subprocesses;
        // fanning a batch of 100 out at once is how a container gets OOM-killed
        // mid-ingest. Throughput is not the constraint here.
        const outcomes = []

        for (const message of parsed.data.messages) {
          try {
            outcomes.push(
              await handleQuarantineEvent({ key: message.object.key })
            )
          } catch (error) {
            // One bad message must not fail the batch — the rest are unrelated
            // objects that deserve their turn.
            outcomes.push({
              key: message.object.key,
              outcome: "rejected" as const,
              reason: "unreadable" as const,
              failureClass: "permanent" as const,
              detail: error instanceof Error ? error.message : "Unknown error",
            })
          }
        }

        return Response.json({ outcomes }, { status: 200 })
      },
    },
  },
})
