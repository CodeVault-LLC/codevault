import { createFileRoute } from "@tanstack/react-router"

import { Terms } from "@/components/legal/terms"
import { legalPages } from "@/core/config/legal"

export const Route = createFileRoute("/legal/terms")({
  component: Terms,
  head: () => ({
    meta: [
      { title: "Terms of use — CodeVault" },
      { name: "description", content: legalPages.terms.description },
    ],
  }),
})
