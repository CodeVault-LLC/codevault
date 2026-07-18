import { EyeOff, Globe, Lock } from "lucide-react"

import type { ClassificationSectionProps } from "./types"
import { CLASSIFICATIONS } from "@/core/reports/vocabulary"
import { classificationLabels } from "@/core/config/reports"
import { findingsFor } from "@/core/reports/publish-gate"

/**
 * Step 4: who can see this, and what of it.
 *
 * Classification renders as cards rather than a row of radios because it is the
 * one decision on the page with no default anywhere in the stack — not in the
 * schema, not in the gate, not here — and the consequence of each option needs
 * to be readable at the moment of choosing rather than inferable from a label
 * (design §2, §4.3).
 */
export function ClassificationSection({
  fields,
  gate,
  onChange,
}: ClassificationSectionProps) {
  const findings = findingsFor(gate, "classification")

  const descriptions: Record<(typeof CLASSIFICATIONS)[number], string> = {
    public: "Anyone can find, read and cite this record.",
    internal:
      "Hidden from anonymous viewers entirely — title, abstract, and the fact that it exists.",
  }

  const icons = { public: Globe, internal: Lock }

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-1 text-ui-sm font-medium">Classification</legend>

      <div
        role="radiogroup"
        aria-label="Classification"
        aria-invalid={findings.blockers.length > 0 || undefined}
        className="grid gap-3 sm:grid-cols-2"
      >
        {CLASSIFICATIONS.map((value) => {
          const Icon = icons[value]
          const selected = fields.classification === value

          return (
            <label
              key={value}
              className={[
                "flex cursor-pointer gap-3 rounded-xl border p-3 transition-colors",
                "has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50",
                selected
                  ? "border-olive bg-olive/5"
                  : "border-border hover:bg-muted/40",
              ].join(" ")}
            >
              <input
                type="radio"
                name="classification"
                value={value}
                checked={selected}
                onChange={() => onChange({ classification: value })}
                className="sr-only"
              />

              <Icon
                className={[
                  "mt-0.5 size-4 shrink-0",
                  selected ? "text-olive" : "text-muted-foreground",
                ].join(" ")}
                aria-hidden
              />

              <span className="flex flex-col gap-0.5">
                <span className="text-ui-sm font-medium">
                  {classificationLabels[value]}
                </span>
                <span className="text-ui-xs text-pretty text-muted-foreground">
                  {descriptions[value]}
                </span>
              </span>
            </label>
          )
        })}
      </div>

      {findings.blockers.map((finding) => (
        <p key={finding.code} className="text-ui-xs text-destructive">
          {finding.message}
        </p>
      ))}

      <div className="mt-1 flex flex-col gap-3 border-t border-border pt-3">
        <Toggle
          id="metadata-only"
          checked={fields.dissemination === "metadata_only"}
          onChange={(checked) =>
            onChange({
              dissemination: checked
                ? "metadata_only"
                : "document_and_metadata",
            })
          }
          icon={EyeOff}
          label="Metadata only"
          description="Publish the record and withhold the document. The page stays public and citable; the PDF is not served."
        />

        <Toggle
          id="discoverable"
          checked={fields.discoverable}
          onChange={(checked) => onChange({ discoverable: checked })}
          icon={Globe}
          label="Discoverable"
          description="Appears in listings, search and the sitemap. Turning this off leaves the record reachable by direct link only."
        />
      </div>
    </fieldset>
  )
}

function Toggle({
  id,
  checked,
  onChange,
  icon: Icon,
  label,
  description,
}: {
  id: string
  checked: boolean
  onChange: (checked: boolean) => void
  icon: typeof Globe
  label: string
  description: string
}) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-3">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 size-4 shrink-0 accent-olive"
      />

      <span className="flex flex-col gap-0.5">
        <span className="inline-flex items-center gap-1.5 text-ui-sm font-medium">
          <Icon className="size-3.5 text-muted-foreground" aria-hidden />
          {label}
        </span>
        <span className="text-ui-xs text-pretty text-muted-foreground">
          {description}
        </span>
      </span>
    </label>
  )
}
