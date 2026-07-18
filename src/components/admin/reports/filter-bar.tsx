import { Link, useNavigate } from "@tanstack/react-router"
import { Search, X } from "lucide-react"

import type { AdminReportsSearch } from "@/core/admin/search-params"
import {
  CLASSIFICATIONS,
  DOC_TYPES,
  REPORT_STATUSES,
} from "@/core/reports/vocabulary"
import { adminReports } from "@/core/config/admin"
import {
  classificationLabels,
  docTypeLabels,
  statusLabels,
} from "@/core/config/reports"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { hasActiveReportFilters } from "@/core/admin/search-params"

/**
 * The table's filters.
 *
 * Status is chips and everything else is a select, which is not an
 * inconsistency: status is the axis an operator switches between constantly and
 * wants to see the shape of — the counts are half the information — while
 * classification, type and year are narrowing tools reached for occasionally.
 * Giving status the wider control matches how often it is used.
 *
 * Every control writes to the URL rather than to component state. That is what
 * makes a filtered table linkable and survives a refresh (design §13).
 */
export function ReportFilterBar({
  search,
  statusCounts,
  years,
}: {
  search: AdminReportsSearch
  statusCounts: Record<string, number>
  /** Every year with a published record, so the select offers only real ones. */
  years: number[]
}) {
  const navigate = useNavigate()
  const active = hasActiveReportFilters(search)

  /**
   * Changing any filter resets to page one.
   *
   * Without it, narrowing a filter while on page seven lands on an empty page,
   * which reads as "no results" rather than "you are past the end".
   */
  function setFilter(patch: Partial<AdminReportsSearch>) {
    void navigate({
      to: "/admin/reports",
      search: (prev) => ({ ...prev, ...patch, page: 1 }),
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div
          role="group"
          aria-label="Filter by status"
          className="flex flex-wrap items-center gap-1"
        >
          <StatusChip
            search={search}
            value={undefined}
            label={adminReports.allStatuses}
            count={Object.values(statusCounts).reduce((a, b) => a + b, 0)}
          />

          {REPORT_STATUSES.map((status) => (
            <StatusChip
              key={status}
              search={search}
              value={status}
              label={statusLabels[status]}
              count={statusCounts[status] ?? 0}
            />
          ))}
        </div>

        {active && (
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto text-ui-xs"
            render={
              <Link
                to="/admin/reports"
                // Every filter dropped at once, including the query. A "clear"
                // that left the search box populated would not have cleared.
                search={{ q: "", page: 1 }}
              />
            }
          >
            <X className="size-3.5" aria-hidden />
            {adminReports.clearFilters}
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-end gap-2">
        <div className="relative min-w-56 flex-1">
          <label htmlFor="admin-report-search" className="sr-only">
            {adminReports.searchLabel}
          </label>
          <Search
            className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            id="admin-report-search"
            type="search"
            className="pl-8"
            placeholder={adminReports.searchPlaceholder}
            defaultValue={search.q}
            // On blur and on Enter, not on every keystroke. Each change is a
            // navigation and a round trip; per-keystroke would push a history
            // entry per letter and make the back button useless.
            onBlur={(event) => {
              if (event.target.value !== search.q) {
                setFilter({ q: event.target.value })
              }
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.currentTarget.blur()
            }}
          />
        </div>

        <FilterSelect
          id="filter-classification"
          label="Classification"
          value={search.classification ?? ""}
          onChange={(value) =>
            setFilter({
              classification: (value ||
                undefined) as AdminReportsSearch["classification"],
            })
          }
          options={CLASSIFICATIONS.map((value) => ({
            value,
            label: classificationLabels[value],
          }))}
        />

        <FilterSelect
          id="filter-type"
          label="Type"
          value={search.type ?? ""}
          onChange={(value) =>
            setFilter({
              type: (value || undefined) as AdminReportsSearch["type"],
            })
          }
          options={DOC_TYPES.map((value) => ({
            value,
            label: docTypeLabels[value],
          }))}
        />

        <FilterSelect
          id="filter-year"
          label="Year"
          value={search.year ? String(search.year) : ""}
          onChange={(value) =>
            setFilter({ year: value ? Number(value) : undefined })
          }
          options={years.map((year) => ({
            value: String(year),
            label: String(year),
          }))}
        />
      </div>
    </div>
  )
}

function StatusChip({
  search,
  value,
  label,
  count,
}: {
  search: AdminReportsSearch
  value: AdminReportsSearch["status"]
  label: string
  count: number
}) {
  const selected = search.status === value

  return (
    <Link
      to="/admin/reports"
      search={(prev) => ({ ...prev, status: value, page: 1 })}
      aria-current={selected ? "true" : undefined}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-ui-xs transition-colors",
        "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
        selected
          ? "border-foreground bg-foreground text-background"
          : "border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      )}
    >
      {label}
      <span
        className={cn(
          "font-mono tabular-nums",
          selected ? "text-background/70" : "text-muted-foreground/70"
        )}
      >
        {count}
      </span>
    </Link>
  )
}

/**
 * A select whose empty option means "no filter".
 *
 * The empty option is labelled with the dimension's own name ("Any type")
 * rather than left blank, so the control reads as a sentence when collapsed and
 * a screen reader announces something other than silence.
 */
function FilterSelect({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div className="flex min-w-32 flex-col gap-1">
      <label htmlFor={id} className="text-ui-xs text-muted-foreground">
        {label}
      </label>
      <Select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Any {label.toLowerCase()}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </div>
  )
}
