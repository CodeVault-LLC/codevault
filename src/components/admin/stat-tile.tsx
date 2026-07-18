import type { LucideIcon } from "lucide-react"

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type StatTileProps = {
  label: string
  value: string
  /** One short clause of context. Omitted rather than padded with filler. */
  hint?: string
  icon: LucideIcon
}

/**
 * A single number with its label — the right form when there is one figure to
 * report and no series behind it. Deliberately not a sparkline: the corpus has
 * no time dimension recorded yet, and a trend line drawn from nothing is a
 * decoration that reads as data.
 */
export function StatTile({ label, value, hint, icon: Icon }: StatTileProps) {
  return (
    <Card className="gap-0 py-4">
      <CardHeader className="gap-1.5 px-4">
        <CardDescription className="flex items-center gap-1.5 text-ui-xs font-medium tracking-wide uppercase">
          <Icon className="size-3.5" aria-hidden />
          {label}
        </CardDescription>
        <CardTitle className="text-ui-2xl">{value}</CardTitle>
        {hint && (
          <CardDescription className="text-ui-xs">{hint}</CardDescription>
        )}
      </CardHeader>
    </Card>
  )
}
