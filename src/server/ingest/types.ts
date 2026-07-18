// Why an upload was refused. A closed set rather than free text, so the
// dashboard can explain the failure and the bulk importer (design §10.5) can
// decide whether to retry without parsing strings.
export type IngestRejectionReason =
  | "missing"
  | "empty"
  | "too_large"
  | "not_a_pdf"
  | "encrypted"
  | "unreadable"
  | "duplicate"
  | "sanitization_failed"
  | "storage_error"

/**
 * How a failure should be treated on retry — design §10.5's taxonomy.
 *
 * This is the whole reason the reasons above are an enum: 2–5% of any real
 * corpus fails, and the importer has to tell "the object store returned a 500"
 * apart from "this file is encrypted". Retrying the first costs a second;
 * retrying the second burns attempts on a file that will never succeed.
 *
 * - `transient` — retry with backoff. The input was fine; something else broke.
 * - `permanent` — do not retry. The bytes themselves are the problem.
 * - `partial`   — not an ingest failure at all. The document is archivable and
 *                 some derived artifact is missing; backfill it later.
 */
export type FailureClass = "transient" | "permanent" | "partial"

const FAILURE_CLASSES: Record<IngestRejectionReason, FailureClass> = {
  // Nothing at the key — usually the event notification arrived before the
  // write was visible, which is exactly what a retry fixes.
  missing: "transient",
  storage_error: "transient",

  empty: "permanent",
  too_large: "permanent",
  not_a_pdf: "permanent",
  encrypted: "permanent",
  unreadable: "permanent",
  // Already archived under this checksum. A re-run must skip it rather than
  // retry it — that is what makes imports idempotent (design §10.5).
  duplicate: "permanent",
  sanitization_failed: "permanent",
}

export function classifyFailure(reason: IngestRejectionReason): FailureClass {
  return FAILURE_CLASSES[reason]
}

export function isRetryable(reason: IngestRejectionReason): boolean {
  return classifyFailure(reason) === "transient"
}

export type IngestRejection = {
  ok: false
  reason: IngestRejectionReason
  detail: string
  /** Set when `reason` is `duplicate`: the record already holding these bytes. */
  duplicateOf?: DuplicateRecord
}

export type DuplicateRecord = {
  reportId: string
  /** Null when the existing record is itself still a draft. */
  accessionId: string | null
  title: string
}

/**
 * Dangerous PDF constructs, stripped by CDR whether or not any scanner has a
 * signature for them (design §9.3).
 */
export type DangerousConstruct =
  "/JavaScript" | "/JS" | "/OpenAction" | "/AA" | "/Launch" | "/EmbeddedFile"

export type SanitizationReport = {
  /**
   * Which tool produced the stored artifact.
   *
   * `none` means no sanitizer was available and the original bytes were kept —
   * an honest state, not a silent pass. See `sanitize.ts` for why that is
   * allowed to happen at all.
   */
  method: "mutool" | "ghostscript" | "none"
  /** Constructs the structural scan found in the input. */
  removedConstructs: DangerousConstruct[]
  /** Bytes before sanitization, for the record. */
  originalByteSize: number
}

/**
 * What one parse of the document yields.
 *
 * Separate from `ExtractedDocument` because extraction genuinely does not know
 * about the steps around it: it is handed bytes and reports what is in them.
 * Which sanitizer produced those bytes, and whether a cover rendered, are the
 * pipeline's business.
 */
export type ExtractedCore = {
  /** Of the sanitized artifact, which is what gets stored and served. */
  byteSize: number
  pageCount: number
  /** The PDF's own /Title, for the drift diff against the form (design §1). */
  embeddedTitle: string | null
  embeddedAuthor: string | null
  /**
   * Null when nothing could be extracted — a scanned image, say. The document
   * is still stored: losing an archived file because OCR failed is far worse
   * than having one that is not yet searchable (design §9.4).
   */
  fulltext: string | null
}

/** Everything derived from the file itself. None of it is ever hand-entered. */
export type ExtractedDocument = ExtractedCore & {
  /**
   * sha256 of the bytes **as uploaded**, before sanitization.
   *
   * The source, not the stored artifact, and that is deliberate. This value is
   * the deduplication key (design §10.5: "sha256 of the file bytes"), so it has
   * to be stable for a given input — and the sanitized output is not. The
   * Ghostscript escalation embeds `/CreationDate` and `/ModDate`, so
   * round-tripping one document twice produces two different digests.
   *
   * Hashing the output would therefore break dedupe precisely for the files
   * that trigger escalation — the ones carrying active content, which are the
   * ones most worth recognising on a re-deposit. It would fail silently, as a
   * duplicate record rather than an error.
   *
   * The stored artifact's own integrity digest is a separate concern and
   * belongs on `report_files.checksum`, which is per-object and can hold one
   * for each derived file.
   */
  checksum: Uint8Array
  /**
   * Cover-page render. Null when the renderer is unavailable or the page would
   * not rasterize — a cosmetic loss, never a reason to refuse a document. That
   * is the `partial` class in the taxonomy above.
   */
  thumbnail: RenderedThumbnail | null
  sanitization: SanitizationReport
}

/**
 * The rendered cover and what it actually is.
 *
 * The format travels with the bytes because it is not always WebP — see
 * `thumbnail.ts`. The storage key and content type are both derived from it, so
 * a PNG is never stored under a `.webp` key.
 */
export type RenderedThumbnail = {
  bytes: Uint8Array
  format: "webp" | "png"
}

export type ExtractionResult =
  { ok: true; document: ExtractedCore } | IngestRejection

export type IngestSuccess = {
  ok: true
  document: ExtractedDocument
  /** The sanitized bytes. These, not the upload, are what gets stored. */
  sanitizedBytes: Uint8Array
}

export type IngestResult = IngestSuccess | IngestRejection
