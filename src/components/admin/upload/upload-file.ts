import type { UploadFileOptions } from "./types"
import { UploadError } from "./types"

// Rolled by hand — about a hundred lines against Uppy's ~500KB plugin graph to
// issue a single PUT (design §8.3). At R2's 5 GiB single-PUT ceiling and our
// 100 MB cap, multipart is unnecessary, so this is genuinely all it takes.
//
// XMLHttpRequest rather than fetch, and not by preference: fetch still has no
// portable upload progress. Request streaming is Chromium-only and HTTP/2
// gated, so a progress bar built on fetch silently does nothing in Firefox and
// Safari.
//
// The migration path stays open — Uppy's `getUploadParameters` hook is just
// "return a presigned URL", which is exactly the endpoint behind this.

/** Uploads one file to a presigned URL, reporting progress. */
export function uploadFile({
  file,
  url,
  contentType,
  signal,
  onProgress,
}: UploadFileOptions): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new UploadError("aborted", "Upload cancelled."))
      return
    }

    const xhr = new XMLHttpRequest()
    xhr.open("PUT", url, true)

    // Must match the type signed into the URL, or the PUT is rejected.
    xhr.setRequestHeader("Content-Type", contentType)

    const onAbort = () => xhr.abort()
    signal?.addEventListener("abort", onAbort, { once: true })

    const cleanup = () => signal?.removeEventListener("abort", onAbort)

    xhr.upload.onprogress = (event) => {
      if (!onProgress) return

      onProgress({
        loaded: event.loaded,
        total: event.total,
        fraction: event.lengthComputable ? event.loaded / event.total : 0,
      })
    }

    xhr.onload = () => {
      cleanup()

      if (xhr.status >= 200 && xhr.status < 300) {
        resolve()
        return
      }

      reject(
        new UploadError(
          "rejected",
          `Storage rejected the upload (HTTP ${xhr.status}).`,
          xhr.status
        )
      )
    }

    xhr.onerror = () => {
      cleanup()
      reject(new UploadError("network", "The upload failed to reach storage."))
    }

    xhr.onabort = () => {
      cleanup()
      reject(new UploadError("aborted", "Upload cancelled."))
    }

    xhr.send(file)
  })
}

/**
 * Retries transient failures with backoff.
 *
 * A rejected upload is not retried: a 4xx from storage means the signature or
 * the content type is wrong, and repeating it just wastes the presign's short
 * TTL. Cancellation is never retried either.
 */
export async function uploadFileWithRetry(
  options: UploadFileOptions,
  attempts = 3
): Promise<void> {
  let lastError: unknown

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await uploadFile(options)
      return
    } catch (error) {
      lastError = error

      const reason = error instanceof UploadError ? error.reason : "network"
      if (reason === "aborted" || reason === "rejected") throw error
      if (attempt === attempts) break

      await new Promise((resolve) => setTimeout(resolve, 2 ** attempt * 250))
    }
  }

  throw lastError
}
