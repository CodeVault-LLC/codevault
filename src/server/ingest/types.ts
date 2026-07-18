// Why an upload was refused. Kept as a closed set rather than free text so the
// dashboard can explain the failure and the bulk importer (design §10.5) can
// classify it as transient or permanent without parsing strings.
export type IngestRejectionReason =
  "missing" | "empty" | "too_large" | "not_a_pdf" | "encrypted" | "unreadable"

export type IngestRejection = {
  ok: false
  reason: IngestRejectionReason
  detail: string
}

/** Everything derived from the file itself. None of it is ever hand-entered. */
export type ExtractedDocument = {
  byteSize: number
  /** sha256 of the exact bytes stored. */
  checksum: Uint8Array
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

export type IngestSuccess = {
  ok: true
  document: ExtractedDocument
}

export type IngestResult = IngestSuccess | IngestRejection
