import type { ReportListProps } from "./types"
import { Container } from "@/components/layout/container"
import { ReportRow } from "./report-row"
import { reportsArchive } from "@/core/config/reports"

// Reverse-chronological, server-rendered, no search yet (design §14, Phase 1).
export function ReportList({ reports }: ReportListProps) {
  return (
    <Container className="py-10 md:py-12">
      <header className="max-w-2xl">
        <h1 className="text-display-m font-semibold text-balance">
          {reportsArchive.name}
        </h1>
        <p className="text-faded mt-3 text-paragraph-s text-pretty">
          {reportsArchive.description}
        </p>
      </header>

      {reports.length === 0 ? (
        <p className="text-faded border-faded mt-10 border-t py-8 text-paragraph-s">
          {reportsArchive.emptyListing}
        </p>
      ) : (
        <ul className="border-faded mt-10 border-t">
          {reports.map((report) => (
            <ReportRow key={report.accessionId} report={report} />
          ))}
        </ul>
      )}
    </Container>
  )
}
