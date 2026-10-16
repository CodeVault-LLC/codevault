import type { Status } from "@/core/config/electrical"
import { cn } from "@/lib/utils"

const statusDot: Record<Status, string> = {
  Working: "bg-olive",
  "In progress": "bg-persimmon pulse-dot",
  Next: "ring-1 ring-faint ring-inset",
}

export function StatusChip({ status }: { status: Status }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-2 font-sans text-caption text-muted-foreground">
      <span
        aria-hidden
        className={cn("size-2 rounded-full", statusDot[status])}
      />
      {status}
    </span>
  )
}
