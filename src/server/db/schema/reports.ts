import { sql } from "drizzle-orm"
import {
  bigint,
  boolean,
  bytea,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core"

import type { Author, Funding } from "@/core/reports/types"
import { tsvector } from "./columns"
import {
  classificationEnum,
  disseminationEnum,
  docTypeEnum,
  reportStatusEnum,
  technicalReviewTypeEnum,
} from "./enums"

export const reports = pgTable(
  "reports",
  {
    // The primary key is an internal UUID, not the accession ID. A draft that
    // is never published must not burn a permanent identifier, because
    // accession IDs are never reused (design §4.5, §8.4).
    id: uuid("id").primaryKey().defaultRandom(),

    // CV-YYYY-NNNN. Null until publish allocates one; permanent thereafter,
    // including after withdrawal.
    accessionId: text("accession_id").unique(),

    // What a draft is asking to be published as, when the document already
    // carries an identifier of its own — CV-STD-0001 rather than a number from
    // the counter.
    //
    // Deliberately *not* written into `accession_id` while still a draft. The
    // query layer treats a non-null accession ID as proof of publication
    // (`reports/queries.ts`, HAS_ACCESSION), and staff listings have no other
    // status predicate — so an early write there would surface drafts in staff
    // search and facet counts. Publish moves the value across and clears this.
    requestedAccessionId: text("requested_accession_id").unique(),

    status: reportStatusEnum("status").notNull().default("draft"),

    // Deliberately no default. An unset classification must be a decision the
    // depositor is forced to make, not one the schema makes for them.
    classification: classificationEnum("classification"),

    dissemination: disseminationEnum("dissemination")
      .notNull()
      .default("document_and_metadata"),

    // Orthogonal to access. A non-discoverable record is absent from search,
    // browse, sitemap and RSS but still reachable by direct link (design §4.2).
    discoverable: boolean("discoverable").notNull().default(true),

    // Evaluated lazily at query time against now(), the way DSpace treats a
    // policy start date. There is no job that flips rows.
    embargoUntil: timestamp("embargo_until", { withTimezone: true }),

    title: text("title").notNull().default(""),
    abstract: text("abstract").notNull().default(""),
    // Sometimes the truthful abstract really is thin. NTRS's own escape hatch
    // is a curated note saying so. An exception is allowed, but it costs a
    // recorded reason rather than being an unbounded word-count wall
    // (design §4.7).
    abstractOverrideReason: text("abstract_override_reason"),
    authors: jsonb("authors").$type<Author[]>().notNull().default([]),

    docType: docTypeEnum("doc_type").notNull().default("report"),
    technicalReviewType: technicalReviewTypeEnum("technical_review_type")
      .notNull()
      .default("none"),

    projectSlug: text("project_slug"),
    subjectCategory: text("subject_category"),
    keywords: text("keywords").array().notNull().default([]),

    // Editorial and non-unique: NASA-CR-156800 style numbers may repeat across
    // revisions. Distinct from the accession ID, which is a database fact.
    reportNumbers: text("report_numbers").array().notNull().default([]),

    license: text("license"),
    funding: jsonb("funding").$type<Funding[]>().notNull().default([]),

    // Null until/unless a DOI is ever registered. The column is the whole
    // hedge — it makes registering later a serialization exercise rather than
    // a migration (design §4.5).
    doi: text("doi").unique(),

    // Derived on ingest, never hand-entered.
    pdfKey: text("pdf_key"),
    thumbKey: text("thumb_key"),
    pageCount: integer("page_count"),
    fileSize: bigint("file_size", { mode: "number" }),
    checksum: bytea("checksum"),
    fulltext: text("fulltext"),
    // The PDF's own embedded title, kept so the dashboard can diff it against
    // the submitted title and surface metadata drift (design §1).
    pdfEmbeddedTitle: text("pdf_embedded_title"),

    publishedAt: date("published_at"),

    // Withdrawal is a state transition, not a delete — citations must not
    // break. These carry the tombstone page (design §4.5).
    withdrawnAt: timestamp("withdrawn_at", { withTimezone: true }),
    withdrawnReason: text("withdrawn_reason"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    // Full text is indexed at weight D from day one even though early search
    // only ranks title and abstract strongly. Having the column means turning
    // on body search later is a ranking tweak, not a re-ingest of the corpus.
    searchVector: tsvector("search_vector").generatedAlwaysAs(
      sql`
        setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(abstract, '')), 'B') ||
        setweight(to_tsvector('english', immutable_array_to_string(keywords, ' ')), 'C') ||
        setweight(to_tsvector('english', coalesce(fulltext, '')), 'D')
      `
    ),
  },
  (table) => [
    index("reports_search_vector_idx").using("gin", table.searchVector),
    index("reports_listing_idx").on(
      table.status,
      table.classification,
      table.publishedAt.desc()
    ),
    // Deduplication by content. Partial, because drafts without a file yet all
    // have a null checksum and those must not collide.
    uniqueIndex("reports_checksum_idx")
      .on(table.checksum)
      .where(sql`checksum is not null`),
  ]
)
