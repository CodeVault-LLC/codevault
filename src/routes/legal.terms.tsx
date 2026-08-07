import { createFileRoute } from "@tanstack/react-router"

import { Terms } from "@/components/legal/terms"
import { legalPages } from "@/core/config/legal"
import { seo } from "@/core/lib/seo"

export const Route = createFileRoute("/legal/terms")({
  component: Terms,
  head: () =>
    seo({
      title: "Terms of use — CodeVault",
      description: legalPages.terms.description,
      path: "/legal/terms",
    }),
})
