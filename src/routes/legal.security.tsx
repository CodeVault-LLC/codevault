import { createFileRoute } from "@tanstack/react-router"

import { Security } from "@/components/legal/security"
import { legalPages } from "@/core/config/legal"
import { seo } from "@/core/lib/seo"

export const Route = createFileRoute("/legal/security")({
  component: Security,
  head: () =>
    seo({
      title: "Security — CodeVault",
      description: legalPages.security.description,
      path: "/legal/security",
    }),
})
