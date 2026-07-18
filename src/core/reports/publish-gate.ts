import type {
  GateCandidate,
  GateField,
  GateFinding,
  GateResult,
} from "./publish-gate-types"
import { accessionIdErrorMessage, parseAccessionId } from "./accession-id"

// The publish gate (design §11).
//
// Validate at publish, not at save: a draft may be incomplete, a published
// record may not. Save is always permitted; this runs only on the transition.
//
// Pure and free of server imports so the deposit form can run it against
// unsaved values and show a live checklist of what is blocking publish, rather
// than failing on submit (design §8.2).

/** Google Scholar will not index a PDF above this size. */
const SCHOLAR_SIZE_LIMIT_BYTES = 5_000_000

const MIN_ABSTRACT_WORDS = 75
const MIN_KEYWORDS = 3

// Substrings that mean a field was never actually filled in. Matched
// case-insensitively against title and abstract.
const PLACEHOLDERS = ["tbd", "todo", "lorem ipsum", "abstract goes here", "n/a"]

const FILENAME_SUFFIX = /\.(pdf|docx?|tex|md|txt)$/i

function countWords(text: string): number {
  const trimmed = text.trim()
  return trimmed === "" ? 0 : trimmed.split(/\s+/).length
}

function findPlaceholder(text: string): string | null {
  const haystack = text.toLowerCase()
  return PLACEHOLDERS.find((needle) => haystack.includes(needle)) ?? null
}

export function evaluatePublishGate(record: GateCandidate): GateResult {
  const blockers: GateFinding[] = []
  const warnings: GateFinding[] = []

  // Default deny. There is no inferred classification anywhere in the stack,
  // and this is the last place that could accidentally invent one.
  if (record.classification === null) {
    blockers.push({
      code: "classification_unset",
      field: "classification",
      message: "Choose a classification. There is no default.",
    })
  }

  // The abstract is the only prose about this report a search engine will ever
  // read, because there is no HTML reading view. A thin abstract is a
  // validation failure, not a style preference (design §4.7).
  //
  // The override exists because sometimes the truthful abstract really is
  // thin — but it costs a recorded reason.
  const abstractWords = countWords(record.abstract)
  if (abstractWords < MIN_ABSTRACT_WORDS && !record.abstractOverrideReason) {
    blockers.push({
      code: "abstract_too_short",
      field: "abstract",
      message: `Abstract is ${abstractWords} words; ${MIN_ABSTRACT_WORDS} are required, or record a reason for the exception.`,
    })
  }

  // Title and abstract are checked separately rather than coalesced, so the
  // finding can name the field it actually came from. A placeholder in the
  // abstract reported under the title is worse than no anchor at all.
  const titlePlaceholder = findPlaceholder(record.title)
  if (titlePlaceholder) {
    blockers.push({
      code: "placeholder_text",
      field: "title",
      message: `Placeholder text "${titlePlaceholder}" is still present.`,
    })
  }

  const abstractPlaceholder = findPlaceholder(record.abstract)
  if (abstractPlaceholder) {
    blockers.push({
      code: "placeholder_text",
      field: "abstract",
      message: `Placeholder text "${abstractPlaceholder}" is still present.`,
    })
  }

  if (FILENAME_SUFFIX.test(record.title.trim())) {
    blockers.push({
      code: "title_looks_like_filename",
      field: "title",
      message: "The title is a filename. Use the document's actual title.",
    })
  }

  if (!record.authors.some((author) => author.affiliation?.trim())) {
    blockers.push({
      code: "no_author_with_affiliation",
      field: "authors",
      message: "At least one author needs an affiliation.",
    })
  }

  if (!record.subjectCategory) {
    blockers.push({
      code: "subject_category_unset",
      field: "subjectCategory",
      message: "Choose a subject category.",
    })
  }

  if (record.keywords.length < MIN_KEYWORDS) {
    blockers.push({
      code: "too_few_keywords",
      field: "keywords",
      message: `${record.keywords.length} keywords; at least ${MIN_KEYWORDS} are required.`,
    })
  }

  // Shape only. A taken identifier is caught by the uniqueness probe in the
  // publish path, because answering that needs a database read and this
  // function must stay pure enough to run in the browser.
  if (record.requestedAccessionId !== null) {
    const parsed = parseAccessionId(record.requestedAccessionId)

    if (!parsed.ok) {
      blockers.push({
        code: "invalid_requested_accession_id",
        field: "accessionId",
        message: accessionIdErrorMessage(parsed.error),
      })
    }
  }

  // A metadata-only record is published deliberately without a served
  // document, so the file requirements do not apply to it (design §4.3).
  if (record.dissemination !== "metadata_only") {
    if (!record.pdfKey) {
      blockers.push({
        code: "no_file",
        field: "document",
        message: "No PDF has been attached.",
      })
    }

    if (!record.checksum) {
      blockers.push({
        code: "no_checksum",
        field: "document",
        message: "The PDF has not been validated — no checksum is stored.",
      })
    }

    // Scholar will not index a scanned image, so searchable text is a real
    // publication requirement rather than a nicety.
    if (!record.fulltext?.trim()) {
      blockers.push({
        code: "no_searchable_text",
        field: "document",
        message:
          "No searchable text could be extracted. A scanned image will not be indexed.",
      })
    }

    // Accepted, but flagged: the upload ceiling is far above Scholar's.
    if (record.fileSize && record.fileSize > SCHOLAR_SIZE_LIMIT_BYTES) {
      warnings.push({
        code: "over_scholar_size_limit",
        field: "document",
        message: `${(record.fileSize / 1_000_000).toFixed(1)} MB exceeds Google Scholar's 5 MB limit; this record will not be indexed there.`,
      })
    }
  }

  // The drift diff that partly restores what the abandoned CI pipeline
  // guaranteed: a locally compiled PDF and a hand-filled form can disagree
  // (design §1). Warns rather than blocks — the PDF's embedded title is often
  // just wrong.
  if (
    record.pdfEmbeddedTitle &&
    record.pdfEmbeddedTitle.trim() !== record.title.trim()
  ) {
    warnings.push({
      code: "embedded_title_drift",
      field: "title",
      message: `The PDF's embedded title is "${record.pdfEmbeddedTitle}", which differs from the title entered.`,
    })
  }

  return { blockers, warnings, publishable: blockers.length === 0 }
}

/**
 * Findings for one control, so a form field can render its own errors without
 * knowing which codes belong to it.
 *
 * Blockers first: a field with both is showing something that stops publish and
 * something that merely deserves a look, and that order is the useful one.
 */
export function findingsFor(
  gate: GateResult,
  field: GateField
): { blockers: GateFinding[]; warnings: GateFinding[] } {
  return {
    blockers: gate.blockers.filter((finding) => finding.field === field),
    warnings: gate.warnings.filter((finding) => finding.field === field),
  }
}
