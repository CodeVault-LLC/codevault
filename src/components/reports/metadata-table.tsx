import type { MetadataTableProps } from "./types"
import { cn } from "@/lib/utils"

// A real <dl>, not a grid of divs — the record page is a catalogue card, and
// label/value pairs are what a description list is for. Screen readers and
// scrapers both get the association for free.
//
// Rows whose value is null are dropped, so a sparse record reads as a short
// table rather than a long one full of dashes.
export function MetadataTable({ rows }: MetadataTableProps) {
  const present = rows.filter((row) => row.value !== null)

  return (
    <dl className="border-faded divide-faded divide-y border-t border-b">
      {present.map((row) => (
        <div
          key={row.label}
          className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-[12rem_1fr] sm:gap-6"
        >
          <dt className="text-faded text-detail-xs tracking-wide uppercase">
            {row.label}
          </dt>
          <dd
            className={cn(
              "text-paragraph-s text-pretty",
              row.mono && "font-mono text-[0.9em]"
            )}
          >
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}
