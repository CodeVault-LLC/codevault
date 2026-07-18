import { fileTypeFromBuffer } from "file-type"

// R2 has no presigned POST, which is what carries S3's content-length-range
// policy condition — so there is no way to cap size at upload time. The cap is
// enforced here, after the fact, by HEADing the object and deleting it if it
// violates policy (design §9.1).
export const MAX_UPLOAD_BYTES = 100 * 1024 * 1024

// "%PDF-" — 25 50 44 46 2D.
const PDF_MAGIC = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d])

/**
 * The signature check from §9.2. The client's Content-Type is untrustworthy —
 * OWASP calls it "trivial to spoof".
 *
 * OWASP also hedges on magic bytes themselves: bypassing them is "pretty common
 * and easy", and a file can be a valid PDF *and* valid HTML to a sniffing
 * browser. This catches the accidental case; what actually closes that hole is
 * the explicit Content-Type, nosniff, and serving from a separate registrable
 * domain (design §5.3).
 */
export function hasPdfMagic(bytes: Uint8Array): boolean {
  if (bytes.length < PDF_MAGIC.length) return false
  return PDF_MAGIC.every((byte, index) => bytes[index] === byte)
}

/**
 * A second opinion from `file-type`, which sniffs more thoroughly than a prefix
 * comparison. Both must agree before the bytes are accepted.
 */
export async function looksLikePdf(bytes: Uint8Array): Promise<boolean> {
  if (!hasPdfMagic(bytes)) return false

  const detected = await fileTypeFromBuffer(bytes)
  return detected?.mime === "application/pdf"
}

export function exceedsSizeLimit(byteSize: number): boolean {
  return byteSize > MAX_UPLOAD_BYTES
}
