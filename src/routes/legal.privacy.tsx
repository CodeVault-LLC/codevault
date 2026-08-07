import { createFileRoute } from "@tanstack/react-router"

import { Privacy } from "@/components/legal/privacy"
import { legalPages } from "@/core/config/legal"
import { seo } from "@/core/lib/seo"

export const Route = createFileRoute("/legal/privacy")({
  component: Privacy,
  head: () =>
    seo({
      title: "Privacy policy — CodeVault",
      description: legalPages.privacy.description,
      path: "/legal/privacy",
    }),
})
