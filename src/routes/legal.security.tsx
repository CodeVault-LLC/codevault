import { createFileRoute } from "@tanstack/react-router"

import { Security } from "@/components/legal/security"
import { legalPages } from "@/core/config/legal"

export const Route = createFileRoute("/legal/security")({
  component: Security,
  head: () => ({
    meta: [
      { title: "Security — CodeVault" },
      { name: "description", content: legalPages.security.description },
    ],
  }),
})
