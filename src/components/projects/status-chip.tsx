import type { ProjectStatus } from "@/core/config/projects"
import { cn } from "@/lib/utils"

// Olive is the "alive" accent — reserved for things that are shipped or moving.
// Paused reads as quiet grey, honest about its state rather than dressed up.
const dotByStatus: Record<ProjectStatus, string> = {
  Shipped: "bg-olive",
  "In progress": "bg-olive",
  Paused: "bg-cloud-dark",
}

export function StatusChip({
  status,
  className,
}: {
  status: ProjectStatus
  className?: string
}) {
  return (
    <span
      className={cn(
        "border-faded inline-flex items-center gap-2 rounded-full border px-3 py-1",
        "text-faded text-detail-xs font-medium uppercase",
        className
      )}
    >
      <span
        aria-hidden
        className={cn(
          "size-1.5 rounded-full",
          dotByStatus[status],
          status === "In progress" && "ring-2 ring-olive/25"
        )}
      />
      {status}
    </span>
  )
}
