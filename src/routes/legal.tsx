import { Outlet, createFileRoute } from "@tanstack/react-router"

import { LegalNav } from "@/components/legal/legal-nav"

/**
 * Layout for the /legal cluster.
 *
 * Same shape as the About layout: the sub-nav lives here so it survives
 * navigation between the documents, which is what lets the active indicator
 * slide rather than cut.
 */
export const Route = createFileRoute("/legal")({
  component: LegalLayout,
})

function LegalLayout() {
  return (
    <>
      <LegalNav />
      <Outlet />
    </>
  )
}
