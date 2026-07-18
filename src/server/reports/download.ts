import type { Viewer } from "./types"
import { canServeFile } from "./visibility"
import { getReportByAccessionId } from "./queries"
import { objectStore } from "@/server/storage/object-store"
import { servingBucket } from "@/server/storage/keys"

// Short-lived on purpose: the URL is handed to a browser that is about to
// follow it immediately, so there is no reason for it to outlive the click.
const DOWNLOAD_TTL_SECONDS = 60

/**
 * Resolves a presigned download URL, or null if the caller may not have the
 * file — whether because the record is not theirs to see, because it is
 * metadata-only or embargoed, or because no file has been attached.
 *
 * Every one of those cases returns null and the route renders a 404. A caller
 * must not be able to tell "exists but withheld" from "does not exist".
 */
export async function resolveDownloadUrl(
  viewer: Viewer,
  accessionId: string
): Promise<string | null> {
  const report = await getReportByAccessionId(viewer, accessionId)
  if (!report) return null

  if (!canServeFile(viewer, report)) return null
  if (!report.pdfKey || !report.classification) return null

  return objectStore.presignDownload({
    bucket: servingBucket(report.classification),
    key: report.pdfKey,
    expiresInSeconds: DOWNLOAD_TTL_SECONDS,
    // `attachment` is incompatible with an in-browser viewer, which is why the
    // design splits /download from a future inline /raw endpoint (design §5.3).
    disposition: "attachment",
    filename: `${accessionId}.pdf`,
  })
}
