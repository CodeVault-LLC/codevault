import { createFileRoute } from "@tanstack/react-router"

import { checkHealth } from "@/server/health/check"

// The container host's health probe. 200 while both dependencies answer, 503
// otherwise — a rollout that cannot reach Postgres or R2 should fail rather
// than take traffic.
export const Route = createFileRoute("/api/health")({
  server: {
    handlers: {
      GET: async () => {
        const report = await checkHealth()

        return Response.json(report, {
          status: report.status === "ok" ? 200 : 503,
          headers: { "cache-control": "no-store" },
        })
      },
    },
  },
})
