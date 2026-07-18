import { createFileRoute, stripSearchParams } from "@tanstack/react-router"

import {
  ADMIN_REPORTS_DEFAULTS,
  adminReportsSchema,
} from "@/core/admin/search-params"
import {
  fetchAdminReportsFn,
  fetchReportYearsFn,
} from "@/server/admin/functions"
import { ReportsTable } from "@/components/admin/reports/reports-table"

/**
 * The reports table (design §8.1).
 *
 * Filter state lives in the URL. `validateSearch` takes the Zod schema
 * directly — Zod 4 needs no adapter — and `stripSearchParams` keeps the
 * defaults out of the address bar, so an unfiltered table is `/admin/reports`
 * rather than `/admin/reports?q=&page=1`.
 */
export const Route = createFileRoute("/admin/reports/")({
  validateSearch: adminReportsSchema,
  search: { middlewares: [stripSearchParams(ADMIN_REPORTS_DEFAULTS)] },

  // Without this the loader would not re-run when a filter changes: TanStack
  // only re-fetches when the deps it was given change, and by default search
  // params are not among them.
  loaderDeps: ({ search }) => search,

  loader: async ({ deps }) => ({
    page: await fetchAdminReportsFn({ data: deps }),
    years: await fetchReportYearsFn(),
    // The server's clock, not the renderer's, so relative timestamps render
    // identically during SSR and hydration.
    generatedAt: new Date(),
  }),

  component: AdminReportsRoute,
})

function AdminReportsRoute() {
  const { page, years, generatedAt } = Route.useLoaderData()
  const search = Route.useSearch()

  return (
    <ReportsTable
      page={page}
      search={search}
      years={years}
      generatedAt={generatedAt}
    />
  )
}
