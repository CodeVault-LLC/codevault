import { createFileRoute } from "@tanstack/react-router"

import { handleAuthRequest } from "@/server/auth/allowlist"

// Better Auth mounts at /api/auth. Everything goes through the allowlist
// wrapper rather than straight to `auth.handler`, so an endpoint we never
// intended to expose 404s instead of answering.
export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: ({ request }) => handleAuthRequest(request),
      POST: ({ request }) => handleAuthRequest(request),
    },
  },
})
