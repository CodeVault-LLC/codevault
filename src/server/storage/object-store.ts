import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
} from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

import type {
  ListedObject,
  ObjectHead,
  ObjectRef,
  ObjectStore,
  PresignDownloadInput,
  PutObjectInput,
} from "./types"
import { clampExpiry, s3 } from "./s3-client"

function isNotFound(error: unknown): boolean {
  const name = (error as { name?: string } | null)?.name
  return name === "NotFound" || name === "NoSuchKey"
}

export const objectStore: ObjectStore = {
  async put({ bucket, key, body, contentType }: PutObjectInput) {
    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      })
    )
  },

  async get({ bucket, key }: ObjectRef) {
    const result = await s3.send(
      new GetObjectCommand({ Bucket: bucket, Key: key })
    )
    if (!result.Body) {
      throw new Error(`Empty body reading ${bucket}/${key}`)
    }
    return result.Body.transformToByteArray()
  },

  async head({ bucket, key }: ObjectRef): Promise<ObjectHead | null> {
    try {
      const result = await s3.send(
        new HeadObjectCommand({ Bucket: bucket, Key: key })
      )
      return {
        contentLength: result.ContentLength ?? 0,
        contentType: result.ContentType,
      }
    } catch (error) {
      // A missing object is an ordinary answer to "is this there?", not a
      // failure — the ingest pipeline asks exactly that.
      if (isNotFound(error)) return null
      throw error
    }
  },

  async delete({ bucket, key }: ObjectRef) {
    await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }))
  },

  async list(bucket: string, prefix: string): Promise<ListedObject[]> {
    const objects: ListedObject[] = []
    let continuationToken: string | undefined

    do {
      const page = await s3.send(
        new ListObjectsV2Command({
          Bucket: bucket,
          Prefix: prefix,
          ContinuationToken: continuationToken,
        })
      )

      for (const item of page.Contents ?? []) {
        if (item.Key) objects.push({ key: item.Key, size: item.Size ?? 0 })
      }

      continuationToken = page.IsTruncated
        ? page.NextContinuationToken
        : undefined
    } while (continuationToken)

    return objects
  },

  async move(from: ObjectRef, to: ObjectRef) {
    await s3.send(
      new CopyObjectCommand({
        Bucket: to.bucket,
        Key: to.key,
        CopySource: `${from.bucket}/${from.key}`,
      })
    )
    await s3.send(
      new DeleteObjectCommand({ Bucket: from.bucket, Key: from.key })
    )
  },

  presignUpload({ bucket, key, contentType, expiresInSeconds }) {
    return getSignedUrl(
      s3,
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        ContentType: contentType,
      }),
      { expiresIn: clampExpiry(expiresInSeconds) }
    )
  },

  presignDownload({
    bucket,
    key,
    expiresInSeconds,
    disposition,
    filename,
  }: PresignDownloadInput) {
    const contentDisposition = disposition
      ? filename
        ? `${disposition}; filename="${filename.replace(/["\\]/g, "")}"`
        : disposition
      : undefined

    return getSignedUrl(
      s3,
      new GetObjectCommand({
        Bucket: bucket,
        Key: key,
        ResponseContentDisposition: contentDisposition,
        // Never sniffed. The archive serves exactly one media type.
        ResponseContentType: "application/pdf",
      }),
      { expiresIn: clampExpiry(expiresInSeconds) }
    )
  },
}
