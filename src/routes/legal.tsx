import { Outlet, createFileRoute } from "@tanstack/react-router"

import { Footer } from "@/components/layout/footer"
import { LegalNav } from "@/components/legal/legal-nav"

export const Route = createFileRoute("/legal")({
  component: LegalLayout,
})

function LegalLayout() {
  return (
    <>
      <LegalNav />
      <main id="main-content">
        <Outlet />
      </main>
      <Footer />
    </>
  )
}
