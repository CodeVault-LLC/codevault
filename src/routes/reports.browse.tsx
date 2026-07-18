import { createFileRoute } from "@tanstack/react-router"

import { BrowseIndexView } from "@/components/reports/browse-index"
import { fetchBrowseIndex } from "@/server/reports/functions"
import { reportsArchive } from "@/core/config/reports"
import { site } from "@/core/config/site"

export const Route = createFileRoute("/reports/browse")({
  loader: () => fetchBrowseIndex(),
  component: BrowseRoute,
  head: () => ({
    meta: [
      { title: `${reportsArchive.browseTitle} — ${reportsArchive.name}` },
      { name: "description", content: reportsArchive.browseDescription },
      { name: "og:site_name", content: site.name },
    ],
  }),
})

function BrowseRoute() {
  return <BrowseIndexView index={Route.useLoaderData()} />
}
