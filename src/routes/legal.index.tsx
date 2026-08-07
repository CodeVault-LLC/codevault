import { createFileRoute } from "@tanstack/react-router"

import { LegalIndex } from "@/components/legal/legal-index"
import { legalPages } from "@/core/config/legal"
import { seo } from "@/core/lib/seo"

export const Route = createFileRoute("/legal/")({
  component: LegalIndex,
  head: () =>
    seo({
      title: "Legal — CodeVault",
      description: legalPages.index.description,
      path: "/legal",
    }),
})
