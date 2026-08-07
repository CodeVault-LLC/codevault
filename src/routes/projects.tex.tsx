import { createFileRoute } from "@tanstack/react-router"

import { TexPage } from "@/components/projects/tex-page"

export const Route = createFileRoute("/projects/tex")({
  component: TexPage,
  head: () => ({
    meta: [
      { title: "TeX — CodeVault" },
      {
        name: "description",
        content:
          "TeX — an editor for LaTeX that parses the document instead of matching text, rebuilds only what a save could have changed, and says what went wrong in a sentence rather than a transcript.",
      },
    ],
  }),
})
