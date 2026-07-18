import { Link, createFileRoute } from "@tanstack/react-router"

import { Container } from "@/components/layout/container"

// Phase 1 keeps this deliberately thin — counts by status, recent deposits and
// the rest of §8.1's overview arrive with the dashboard proper in Phase 4.
export const Route = createFileRoute("/admin/")({
  component: AdminIndexRoute,
})

function AdminIndexRoute() {
  return (
    <Container className="py-8">
      <h1 className="text-display-s font-semibold">Dashboard</h1>
      <p className="text-faded mt-2 text-paragraph-s">
        Deposit a report, or browse the archive.
      </p>

      <Link
        to="/admin/deposit"
        className="mt-6 inline-flex rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
      >
        Deposit a report
      </Link>
    </Container>
  )
}
