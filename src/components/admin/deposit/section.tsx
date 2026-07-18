import type { ReactNode } from "react"

/**
 * One numbered step of the deposit flow.
 *
 * Numbered but not gated. §8.2 is explicit that this is deliberately *not* a
 * wizard that hides fields — every section is on the page, visible and
 * editable, at all times. The numbers describe the order things are most
 * usefully done in (upload first, because everything else can be prefilled from
 * it), not an order they must be done in.
 */
export function Section({
  step,
  title,
  description,
  children,
}: {
  step: number
  title: string
  description: string
  children: ReactNode
}) {
  const headingId = `deposit-section-${step}`

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-border font-mono text-ui-xs text-muted-foreground"
        >
          {step}
        </span>

        <div className="flex flex-col gap-0.5">
          <h2 id={headingId} className="text-ui-lg font-medium">
            {title}
          </h2>
          <p className="text-ui-sm text-pretty text-muted-foreground">
            {description}
          </p>
        </div>
      </div>

      {/* Indented to the heading text, so the numbered rail reads as a spine
          down the page rather than as decoration on each block. */}
      <div className="flex flex-col gap-5 sm:pl-9">{children}</div>
    </section>
  )
}
