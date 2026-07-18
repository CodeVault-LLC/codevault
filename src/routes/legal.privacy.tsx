import { createFileRoute } from "@tanstack/react-router"

import { Privacy } from "@/components/legal/privacy"
import { legalPages } from "@/core/config/legal"

export const Route = createFileRoute("/legal/privacy")({
  component: Privacy,
  head: () => ({
    meta: [
      { title: "Privacy policy — CodeVault" },
      { name: "description", content: legalPages.privacy.description },
    ],
  }),
})
