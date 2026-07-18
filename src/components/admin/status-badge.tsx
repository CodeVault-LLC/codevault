import { Ban, CircleCheck, CircleDot, PencilLine } from "lucide-react"

import type { ReportStatus } from "@/core/reports/types"
import { Badge } from "@/components/ui/badge"

/**
 * Status is carried by an icon and a word, not by color. Color alone fails for
 * colorblind readers, in print, and under forced-colors — so the swatch here is
 * reinforcement, never the signal itself.
 */
const STATUS_PRESENTATION: Record<
  ReportStatus,
  {
    label: string
    icon: typeof CircleDot
    variant: "default" | "secondary" | "destructive" | "outline"
  }
> = {
  draft: { label: "Draft", icon: PencilLine, variant: "secondary" },
  in_review: { label: "In review", icon: CircleDot, variant: "outline" },
  published: { label: "Published", icon: CircleCheck, variant: "default" },
  withdrawn: { label: "Withdrawn", icon: Ban, variant: "destructive" },
}

export function StatusBadge({ status }: { status: ReportStatus }) {
  const { label, icon: Icon, variant } = STATUS_PRESENTATION[status]

  return (
    <Badge variant={variant} className="font-normal">
      <Icon data-icon="inline-start" aria-hidden />
      {label}
    </Badge>
  )
}
