export type UploadProgress = {
  loaded: number
  total: number
  /** 0–1. Zero when the browser cannot report a total. */
  fraction: number
}

export type UploadFileOptions = {
  file: File
  /** Presigned PUT URL, issued server-side with the content type baked in. */
  url: string
  contentType: string
  signal?: AbortSignal
  onProgress?: (progress: UploadProgress) => void
}

export type UploadFailureReason = "aborted" | "network" | "rejected"

export class UploadError extends Error {
  readonly reason: UploadFailureReason
  readonly status: number | null

  constructor(reason: UploadFailureReason, message: string, status?: number) {
    super(message)
    this.name = "UploadError"
    this.reason = reason
    this.status = status ?? null
  }
}

export type UploadState =
  | { phase: "idle" }
  | { phase: "uploading"; progress: UploadProgress }
  | { phase: "validating" }
  | { phase: "failed"; message: string }
  | { phase: "done" }
