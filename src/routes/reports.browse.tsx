import { createFileRoute } from "@tanstack/react-router"

import { BrowseIndexView } from "@/components/reports/browse-index"
import { fetchBrowseIndex } from "@/server/reports/functions"
import { reportsArchive } from "@/core/config/reports"
import { seo } from "@/core/lib/seo"

export const Route = createFileRoute("/reports/browse")({
  loader: () => fetchBrowseIndex(),
  component: BrowseRoute,
  head: () =>
    seo({
      title: `${reportsArchive.browseTitle} — ${reportsArchive.name}`,
      description: reportsArchive.browseDescription,
      path: "/reports/browse",
    }),
})

function BrowseRoute() {
  return <BrowseIndexView index={Route.useLoaderData()} />
}
