import { createFileRoute } from "@tanstack/react-router"

import { LegalIndex } from "@/components/legal/legal-index"
import { legalPages } from "@/core/config/legal"

export const Route = createFileRoute("/legal/")({
  component: LegalIndex,
  head: () => ({
    meta: [
      { title: "Legal — CodeVault" },
      { name: "description", content: legalPages.index.description },
    ],
  }),
})
