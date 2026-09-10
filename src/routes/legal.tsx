import { Outlet, createFileRoute } from "@tanstack/react-router"

import { LegalFooter } from "@/components/legal/legal-footer"
import { LegalNav } from "@/components/legal/legal-nav"

export const Route = createFileRoute("/legal")({
  component: LegalLayout,
})

function LegalLayout() {
  return (
    <>
      <LegalNav />
      <main>
        <Outlet />
      </main>
      <LegalFooter />
    </>
  )
}
