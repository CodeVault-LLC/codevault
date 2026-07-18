import { createFileRoute } from "@tanstack/react-router"

import { Cookies } from "@/components/legal/cookies"
import { legalPages } from "@/core/config/legal"

export const Route = createFileRoute("/legal/cookies")({
  component: Cookies,
  head: () => ({
    meta: [
      { title: "Cookies — CodeVault" },
      { name: "description", content: legalPages.cookies.description },
    ],
  }),
})
