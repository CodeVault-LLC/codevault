import type { DocType } from "@/core/reports/types"
import type { MetadataFormProps } from "./types"
import { CLASSIFICATIONS, DOC_TYPES } from "@/core/reports/vocabulary"
import { classificationLabels, docTypeLabels } from "@/core/config/reports"

const fieldClass =
  "border-faded focus-visible:ring-ring mt-1 w-full rounded-lg border bg-transparent px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"

const labelClass = "text-detail-xs text-faded tracking-wide uppercase"

// Phase 1 edits only what §11 blocks publish on, plus the classification
// controls. Deliberately one page with visible fields rather than a wizard that
// hides them (design §8.2).
export function MetadataForm({ draft, onChange }: MetadataFormProps) {
  const report = draft.report

  // Authors are ordered and order is meaning, so this keeps them in sequence.
  // Phase 1 edits them as "Name (Affiliation)" lines; the structured editor
  // arrives with the dashboard proper in Phase 4.
  const authorsText = report.authors
    .map((a) => (a.affiliation ? `${a.name} (${a.affiliation})` : a.name))
    .join("\n")

  function parseAuthors(text: string) {
    return text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const match = /^(.*?)\s*\((.*)\)$/.exec(line)
        return match
          ? { name: match[1].trim(), affiliation: match[2].trim() }
          : { name: line }
      })
  }

  return (
    <section className="space-y-5">
      <div>
        <label className={labelClass} htmlFor="title">
          Title
        </label>
        <input
          id="title"
          className={fieldClass}
          defaultValue={report.title}
          onBlur={(e) => onChange({ title: e.target.value })}
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="abstract">
          Abstract
        </label>
        <textarea
          id="abstract"
          rows={8}
          className={fieldClass}
          defaultValue={report.abstract}
          onBlur={(e) => onChange({ abstract: e.target.value })}
        />
        <p className="text-faded mt-1 text-detail-xs">
          There is no HTML reading view, so this is the only prose about this
          report a search engine will ever see. 75 words minimum.
        </p>
      </div>

      <div>
        <label className={labelClass} htmlFor="authors">
          Authors — one per line, as “Name (Affiliation)”
        </label>
        <textarea
          id="authors"
          rows={3}
          className={fieldClass}
          defaultValue={authorsText}
          onBlur={(e) => onChange({ authors: parseAuthors(e.target.value) })}
        />
        <p className="text-faded mt-1 text-detail-xs">
          Order is meaning. At least one author needs an affiliation.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="docType">
            Document type
          </label>
          <select
            id="docType"
            className={fieldClass}
            defaultValue={report.docType}
            onChange={(e) => onChange({ docType: e.target.value as DocType })}
          >
            {DOC_TYPES.map((type) => (
              <option key={type} value={type}>
                {docTypeLabels[type]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="subjectCategory">
            Subject
          </label>
          <input
            id="subjectCategory"
            className={fieldClass}
            defaultValue={report.subjectCategory ?? ""}
            onBlur={(e) =>
              onChange({ subjectCategory: e.target.value || null })
            }
          />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="keywords">
          Keywords — comma separated, three or more
        </label>
        <input
          id="keywords"
          className={fieldClass}
          defaultValue={report.keywords.join(", ")}
          onBlur={(e) =>
            onChange({
              keywords: e.target.value
                .split(",")
                .map((k) => k.trim())
                .filter(Boolean),
            })
          }
        />
      </div>

      <fieldset className="border-faded rounded-lg border p-4">
        <legend className={labelClass}>Classification</legend>

        {/* No default and no pre-selected option: an unset classification must
            be a decision the depositor is forced to make (design §2, §8.2). */}
        <div className="mt-2 space-y-2">
          {CLASSIFICATIONS.map((value) => (
            <label
              key={value}
              className="flex items-center gap-2 text-paragraph-s"
            >
              <input
                type="radio"
                name="classification"
                value={value}
                defaultChecked={report.classification === value}
                onChange={() => onChange({ classification: value })}
              />
              {classificationLabels[value]}
            </label>
          ))}
        </div>

        <p className="text-faded mt-3 text-detail-xs">
          Internal hides the whole record from anonymous viewers — title,
          abstract, and its existence.
        </p>

        <label className="mt-4 flex items-center gap-2 text-paragraph-s">
          <input
            type="checkbox"
            defaultChecked={report.dissemination === "metadata_only"}
            onChange={(e) =>
              onChange({
                dissemination: e.target.checked
                  ? "metadata_only"
                  : "document_and_metadata",
              })
            }
          />
          Metadata only — publish the record, withhold the document
        </label>

        <label className="mt-2 flex items-center gap-2 text-paragraph-s">
          <input
            type="checkbox"
            defaultChecked={report.discoverable}
            onChange={(e) => onChange({ discoverable: e.target.checked })}
          />
          Discoverable — appears in listings and search
        </label>
      </fieldset>
    </section>
  )
}
