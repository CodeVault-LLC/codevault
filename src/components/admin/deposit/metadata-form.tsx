import type { DocType } from "@/core/reports/types"
import type { MetadataFormProps } from "./types"
import { DOC_TYPES } from "@/core/reports/vocabulary"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { docTypeLabels } from "@/core/config/reports"
import { findingsFor } from "@/core/reports/publish-gate"

// Mirrors the gate's own threshold, for the live word count. Duplicated as a
// display value only — the gate remains the thing that decides, and a drift
// here would show a misleading counter, not let a thin abstract through.
const MIN_ABSTRACT_WORDS = 75

function countWords(text: string): number {
  const trimmed = text.trim()
  return trimmed === "" ? 0 : trimmed.split(/\s+/).length
}

/**
 * Step 3: the metadata.
 *
 * Every field carries its own findings, anchored by the gate rather than
 * re-derived here — see `GateField`. The checklist in the rail and the message
 * under an input are two views of one verdict, so they cannot disagree about
 * what is blocking publish.
 */
export function MetadataForm({ fields, gate, onChange }: MetadataFormProps) {
  // Authors are ordered and order is meaning, so this keeps them in sequence.
  // Edited as "Name (Affiliation)" lines for now; the structured editor arrives
  // with the dashboard proper in Phase 4.
  const authorsText = fields.authors
    .map((author) =>
      author.affiliation
        ? `${author.name} (${author.affiliation})`
        : author.name
    )
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

  const abstractWords = countWords(fields.abstract)

  return (
    <>
      <Field
        htmlFor="title"
        label="Title"
        description="The document's own title, not the filename."
        {...findingsFor(gate, "title")}
      >
        <Input
          id="title"
          defaultValue={fields.title}
          onBlur={(event) => onChange({ title: event.target.value })}
        />
      </Field>

      <Field
        htmlFor="abstract"
        label="Abstract"
        description={
          <>
            There is no HTML reading view, so this is the only prose about this
            report a search engine will ever see.{" "}
            <span
              className={
                abstractWords >= MIN_ABSTRACT_WORDS
                  ? "text-olive"
                  : "text-foreground"
              }
            >
              {abstractWords} of {MIN_ABSTRACT_WORDS} words.
            </span>
          </>
        }
        {...findingsFor(gate, "abstract")}
      >
        <Textarea
          id="abstract"
          rows={8}
          defaultValue={fields.abstract}
          onBlur={(event) => onChange({ abstract: event.target.value })}
        />
      </Field>

      <Field
        htmlFor="authors"
        label="Authors"
        description="One per line, as “Name (Affiliation)”. Order is meaning — it is the credit order and it is preserved. At least one needs an affiliation."
        {...findingsFor(gate, "authors")}
      >
        <Textarea
          id="authors"
          rows={3}
          defaultValue={authorsText}
          onBlur={(event) =>
            onChange({ authors: parseAuthors(event.target.value) })
          }
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field htmlFor="docType" label="Document type">
          <Select
            id="docType"
            defaultValue={fields.docType}
            onChange={(event) =>
              onChange({ docType: event.target.value as DocType })
            }
          >
            {DOC_TYPES.map((type) => (
              <option key={type} value={type}>
                {docTypeLabels[type]}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          htmlFor="subjectCategory"
          label="Subject"
          description="One per record."
          {...findingsFor(gate, "subjectCategory")}
        >
          <Input
            id="subjectCategory"
            defaultValue={fields.subjectCategory ?? ""}
            onBlur={(event) =>
              onChange({ subjectCategory: event.target.value || null })
            }
          />
        </Field>
      </div>

      <Field
        htmlFor="keywords"
        label="Keywords"
        description="Comma separated. Three or more, and they are what someone browsing the archive will filter by."
        {...findingsFor(gate, "keywords")}
      >
        <Input
          id="keywords"
          defaultValue={fields.keywords.join(", ")}
          onBlur={(event) =>
            onChange({
              keywords: event.target.value
                .split(",")
                .map((keyword) => keyword.trim())
                .filter(Boolean),
            })
          }
        />
      </Field>
    </>
  )
}
