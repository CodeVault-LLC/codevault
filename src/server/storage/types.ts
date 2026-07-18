// The storage port.
//
// This interface is narrow on purpose. R2 has no ACLs, no object versioning,
// no object tagging and no Object Lock, so the port provides no way to express
// any of them — if the interface cannot say it, nobody writes code locally that
// dies on deploy. The same reasoning removes ETag from `head`: R2's ETag
// differs between single-PUT and multipart uploads, so it must never be
// mistaken for a content hash. Checksums come from `crypto`, not from storage.

export type ObjectRef = {
  bucket: string
  key: string
}

export type PutObjectInput = ObjectRef & {
  body: Uint8Array
  contentType: string
}

export type ObjectHead = {
  contentLength: number
  contentType: string | undefined
}

export type ListedObject = {
  key: string
  size: number
}

export type PresignUploadInput = ObjectRef & {
  // Pinned into the signature, so the client cannot substitute another type
  // after the URL is issued.
  contentType: string
  expiresInSeconds: number
}

export type PresignDownloadInput = ObjectRef & {
  expiresInSeconds: number
  // Sent back as Content-Disposition. `attachment` for /download, `inline` for
  // the viewer path (design §5.3).
  disposition?: "attachment" | "inline"
  filename?: string
}

export interface ObjectStore {
  put: (input: PutObjectInput) => Promise<void>
  get: (ref: ObjectRef) => Promise<Uint8Array>
  /** Null when the object does not exist, rather than throwing. */
  head: (ref: ObjectRef) => Promise<ObjectHead | null>
  delete: (ref: ObjectRef) => Promise<void>
  list: (bucket: string, prefix: string) => Promise<ListedObject[]>

  /**
   * Copy without removing the source.
   *
   * Deliberately not a `move`. Publishing copies out of quarantine, commits the
   * database, and only then deletes the source — so a crash between the copy
   * and the commit is retryable rather than leaving the source gone and the
   * record unpublishable. Copying twice is harmless; losing the original is
   * not. Stray quarantine objects expire on the bucket's 24h lifecycle rule.
   */
  copy: (from: ObjectRef, to: ObjectRef) => Promise<void>

  presignUpload: (input: PresignUploadInput) => Promise<string>
  presignDownload: (input: PresignDownloadInput) => Promise<string>
}
