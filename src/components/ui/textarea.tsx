import * as React from "react"

import { cn } from "@/lib/utils"
import { useFieldControl } from "./field"

/**
 * Styled to match `Input` deliberately — same border, ring, invalid and
 * disabled treatment — so a form mixing the two reads as one control set rather
 * than two components that happen to sit near each other.
 */
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  const fieldControl = useFieldControl()

  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "field-sizing-content min-h-16 w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-ui-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...fieldControl}
      {...props}
    />
  )
}

export { Textarea }
