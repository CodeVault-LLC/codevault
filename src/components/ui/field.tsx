import * as React from "react"
import { AlertTriangle, X } from "lucide-react"

import type { GateFinding } from "@/core/reports/publish-gate-types"
import { cn } from "@/lib/utils"

/**
 * Label, control, description and findings as one unit.
 *
 * The accessibility wiring is the reason this exists rather than each form
 * repeating the markup: `aria-describedby` has to name both the description and
 * the error, `aria-invalid` has to track whether there is a blocker, and every
 * one of those ids has to be derived from the control's. Done by hand at each
 * call site, one of them is always wrong.
 *
 * Blockers render before warnings. A field carrying both is showing something
 * that stops publish and something that merely deserves a look, and that is the
 * useful order.
 */

type FieldProps = {
  /** Must match the control's `id`; every other id here derives from it. */
  htmlFor: string
  label: string
  description?: React.ReactNode
  blockers?: GateFinding[]
  warnings?: GateFinding[]
  children: React.ReactNode
  className?: string
}

export function Field({
  htmlFor,
  label,
  description,
  blockers = [],
  warnings = [],
  children,
  className,
}: FieldProps) {
  const descriptionId = description ? `${htmlFor}-description` : undefined
  const findingsId =
    blockers.length > 0 || warnings.length > 0
      ? `${htmlFor}-findings`
      : undefined

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-ui-sm font-medium">
        {label}
      </label>

      {/* The control owns `id`; this passes it what it needs to point at. */}
      <FieldControlContext.Provider
        value={{
          "aria-describedby":
            [descriptionId, findingsId].filter(Boolean).join(" ") || undefined,
          "aria-invalid": blockers.length > 0 || undefined,
        }}
      >
        {children}
      </FieldControlContext.Provider>

      {description && (
        <p
          id={descriptionId}
          className="text-ui-xs text-pretty text-muted-foreground"
        >
          {description}
        </p>
      )}

      {findingsId && (
        <ul id={findingsId} className="flex flex-col gap-1">
          {blockers.map((finding) => (
            <li
              key={`${finding.code}-${finding.field}`}
              className="flex items-start gap-1.5 text-ui-xs text-pretty text-destructive"
            >
              <X className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              {finding.message}
            </li>
          ))}

          {warnings.map((finding) => (
            <li
              key={`${finding.code}-${finding.field}`}
              className="flex items-start gap-1.5 text-ui-xs text-pretty text-muted-foreground"
            >
              {/* Warnings never block — worth seeing, not necessarily fixing. */}
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              {finding.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

type FieldControlAttributes = {
  "aria-describedby"?: string
  "aria-invalid"?: true
}

const FieldControlContext = React.createContext<FieldControlAttributes>({})

/**
 * The ARIA attributes the surrounding `Field` computed, for a control to spread
 * onto itself. Empty outside a `Field`, so a control stays usable standalone.
 */
export function useFieldControl(): FieldControlAttributes {
  return React.useContext(FieldControlContext)
}
