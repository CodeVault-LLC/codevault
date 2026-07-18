import { Outlet, createFileRoute } from "@tanstack/react-router"

import { ReportsNavbar } from "@/components/reports/reports-navbar"

// The archive's layout branch. `__root.tsx` renders a bare <Outlet/> with no
// chrome, so the three surfaces — marketing, reports, admin — are siblings that
// compose their own navigation. The archive's chrome lives only here
// (design §3).
export const Route = createFileRoute("/reports")({
  component: ReportsLayout,
})

function ReportsLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <ReportsNavbar />
      <main>
        <Outlet />
      </main>
    </div>
  )
}
