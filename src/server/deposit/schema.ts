import { z } from "zod"

import {
  CLASSIFICATIONS,
  DISSEMINATIONS,
  DOC_TYPES,
  TECHNICAL_REVIEW_TYPES,
} from "@/core/reports/vocabulary"

// Input validation for the deposit form.
//
// Save is always permitted and this schema reflects that: almost everything is
// optional, because a draft may be incomplete. What a record needs in order to
// be *published* is the publish gate's business, not this schema's
// (design §8.2, §11).

const authorSchema = z.object({
  name: z.string().min(1).max(200),
  affiliation: z.string().max(200).optional(),
  orcid: z.string().max(40).optional(),
})

const fundingSchema = z.object({
  number: z.string().min(1).max(100),
  type: z.string().min(1).max(100),
})

export const saveDraftSchema = z.object({
  reportId: z.uuid(),
  patch: z.object({
    title: z.string().max(500).optional(),
    abstract: z.string().max(20_000).optional(),
    abstractOverrideReason: z.string().max(500).nullish(),
    authors: z.array(authorSchema).max(50).optional(),
    docType: z.enum(DOC_TYPES).optional(),
    technicalReviewType: z.enum(TECHNICAL_REVIEW_TYPES).optional(),

    // No default anywhere in the stack. Nullable so the form can represent
    // "not chosen yet", which is what blocks publish (design §2).
    classification: z.enum(CLASSIFICATIONS).nullish(),
    dissemination: z.enum(DISSEMINATIONS).optional(),
    discoverable: z.boolean().optional(),
    embargoUntil: z.coerce.date().nullish(),

    projectSlug: z.string().max(100).nullish(),
    subjectCategory: z.string().max(100).nullish(),
    keywords: z.array(z.string().min(1).max(80)).max(20).optional(),
    reportNumbers: z.array(z.string().min(1).max(100)).max(20).optional(),
    license: z.string().max(100).nullish(),
    funding: z.array(fundingSchema).max(20).optional(),
  }),
})

export const beginUploadSchema = z.object({
  reportId: z.uuid(),
  // Pinned into the presigned URL's signature. Only one type is ever accepted.
  contentType: z.literal("application/pdf"),
})

export const completeUploadSchema = z.object({
  reportId: z.uuid(),
  quarantineKey: z.string().min(1).max(200),
})

export const reportIdSchema = z.object({
  reportId: z.uuid(),
})
