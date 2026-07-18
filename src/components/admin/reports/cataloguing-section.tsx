import type { CataloguingSectionProps } from "./types"
import type { TechnicalReviewType } from "@/core/reports/types"
import { TECHNICAL_REVIEW_TYPES } from "@/core/reports/vocabulary"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { projects } from "@/core/config/projects"
import { technicalReviewLabels } from "@/core/config/reports"

/**
 * The editorial fields the deposit form leaves at their defaults.
 *
 * Deposit asks only for what blocks publish, which is right — a deposit form
 * that demanded a funding number would get a made-up funding number. These are
 * the fields that get filled in afterwards, once someone is cataloguing rather
 * than depositing, and they are on this screen for that reason rather than
 * being retrofitted into the deposit flow.
 */
export function CataloguingSection({
  fields,
  onChange,
}: CataloguingSectionProps) {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          htmlFor="technicalReviewType"
          label="Technical review"
          description="What review this document actually received. A record of fact, not a workflow state."
        >
          <Select
            id="technicalReviewType"
            value={fields.technicalReviewType}
            onChange={(event) =>
              onChange({
                technicalReviewType: event.target.value as TechnicalReviewType,
              })
            }
          >
            {TECHNICAL_REVIEW_TYPES.map((type) => (
              <option key={type} value={type}>
                {technicalReviewLabels[type]}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          htmlFor="projectSlug"
          label="Project"
          description="Which CodeVault project this came out of, if any."
        >
          <Select
            id="projectSlug"
            value={fields.projectSlug ?? ""}
            onChange={(event) =>
              onChange({ projectSlug: event.target.value || null })
            }
          >
            <option value="">No project</option>
            {projects.map((project) => (
              <option key={project.slug} value={project.slug}>
                {project.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field
        htmlFor="reportNumbers"
        label="Report numbers"
        description="Comma separated. Editorial, and may repeat across revisions — unlike the accession ID, which is a database fact and never repeats."
      >
        <Input
          id="reportNumbers"
          defaultValue={fields.reportNumbers.join(", ")}
          onBlur={(event) =>
            onChange({
              reportNumbers: event.target.value
                .split(",")
                .map((value) => value.trim())
                .filter(Boolean),
            })
          }
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          htmlFor="license"
          label="Licence"
          description="An SPDX identifier, e.g. CC-BY-4.0."
        >
          <Input
            id="license"
            defaultValue={fields.license ?? ""}
            onBlur={(event) =>
              onChange({ license: event.target.value || null })
            }
          />
        </Field>

        <Field
          htmlFor="doi"
          label="DOI"
          // The column is the whole hedge from §4.5: registering DOIs later
          // becomes a serialization exercise rather than a migration. Nothing
          // in the archive registers one, so this is where a hand-registered
          // DOI would be recorded.
          description="Only if one has been registered elsewhere. The archive does not issue DOIs."
        >
          <Input
            id="doi"
            defaultValue={fields.doi ?? ""}
            onBlur={(event) => onChange({ doi: event.target.value || null })}
          />
        </Field>
      </div>

      <Field
        htmlFor="embargoUntil"
        label="Embargo until"
        description="Evaluated against the clock on every request — there is no job to run, and nothing flips when the date passes. Leave empty for no embargo."
      >
        <Input
          id="embargoUntil"
          type="date"
          // `toISOString().slice(0, 10)` rather than a locale format: the input
          // requires ISO, and a locale-formatted value silently fails to
          // populate it.
          defaultValue={
            fields.embargoUntil
              ? fields.embargoUntil.toISOString().slice(0, 10)
              : ""
          }
          onBlur={(event) =>
            onChange({
              embargoUntil: event.target.value
                ? new Date(`${event.target.value}T00:00:00Z`)
                : null,
            })
          }
        />
      </Field>
    </div>
  )
}
