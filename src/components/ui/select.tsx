import * as React from "react"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { useFieldControl } from "./field"

/**
 * A native `<select>`, styled to match `Input`.
 *
 * Native rather than a listbox built from divs, and that is a deliberate
 * choice for the admin surface: it is keyboard-navigable, screen-reader
 * correct, and type-ahead searchable for free, and on mobile it opens the
 * platform picker. A custom control would have to re-earn all of that. When a
 * field needs filtering over a long controlled vocabulary, that is a combobox
 * and a different component — not a reason to reimplement this one.
 */
function Select({
  className,
  children,
  ...props
}: React.ComponentProps<"select">) {
  const fieldControl = useFieldControl()

  return (
    <div className="relative">
      <select
        data-slot="select"
        className={cn(
          "h-8 w-full appearance-none rounded-lg border border-input bg-transparent py-1 pr-8 pl-2.5 text-ui-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
          className
        )}
        {...fieldControl}
        {...props}
      >
        {children}
      </select>

      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
    </div>
  )
}

export { Select }
