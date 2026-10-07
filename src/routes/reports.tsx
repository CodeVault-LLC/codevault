import { Outlet, createFileRoute } from "@tanstack/react-router"

import { Footer } from "@/components/layout/footer"
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
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <ReportsNavbar />
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
