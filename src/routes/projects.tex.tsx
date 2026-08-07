import { createFileRoute } from "@tanstack/react-router"

import { TexPage } from "@/components/projects/tex-page"
import { seo } from "@/core/lib/seo"

export const Route = createFileRoute("/projects/tex")({
  component: TexPage,
  head: () =>
    seo({
      title: "TeX — CodeVault",
      description:
        "TeX — an editor for LaTeX that parses the document instead of matching text, rebuilds only what a save could have changed, and says what went wrong in a sentence rather than a transcript.",
      path: "/projects/tex",
    }),
})
