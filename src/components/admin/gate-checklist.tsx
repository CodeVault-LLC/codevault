import { AlertTriangle, Check, X } from "lucide-react"

import type { GateChecklistProps } from "./types"

// A persistent checklist of what is blocking publish, rather than an error
// thrown on submit. The depositor should always be able to see exactly what is
// missing (design §8.2).
export function GateChecklist({ gate }: GateChecklistProps) {
  return (
    <section
      aria-labelledby="gate-heading"
      className="border-faded rounded-lg border p-4"
    >
      <h2
        id="gate-heading"
        className="text-faded text-detail-xs tracking-wide uppercase"
      >
        Publish checklist
      </h2>

      {gate.publishable && gate.warnings.length === 0 && (
        <p className="mt-3 flex items-center gap-2 text-paragraph-s">
          <Check className="size-4 text-olive" aria-hidden />
          Ready to publish.
        </p>
      )}

      {gate.blockers.length > 0 && (
        <ul className="mt-3 space-y-2">
          {gate.blockers.map((finding) => (
            <li
              key={finding.code}
              className="flex items-start gap-2 text-paragraph-s"
            >
              <X
                className="mt-0.5 size-4 shrink-0 text-destructive"
                aria-hidden
              />
              <span className="text-pretty">{finding.message}</span>
            </li>
          ))}
        </ul>
      )}

      {gate.warnings.length > 0 && (
        <ul className="border-faded mt-3 space-y-2 border-t pt-3">
          {gate.warnings.map((finding) => (
            <li
              key={finding.code}
              className="text-faded flex items-start gap-2 text-paragraph-s"
            >
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
              {/* Warnings never block — they are worth seeing, not fixing. */}
              <span className="text-pretty">{finding.message}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
