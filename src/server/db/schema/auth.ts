import {
  bigint,
  boolean,
  bytea,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core"

import { staffRoleEnum } from "./enums"

// Better Auth's required tables.
//
// The property names here are load-bearing: the Drizzle adapter looks fields up
// by Better Auth's *field* name (`emailVerified`, `userId`, `credentialID`) on
// the table object, so these must match exactly — including `credentialID`'s
// unusual casing. Column names in Postgres are ours to choose, hence snake_case
// underneath.
//
// Verified field-by-field against getAuthTables() in @better-auth/core rather
// than reproduced from memory.

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),

  // Ours, not Better Auth's. The adapter is told about this table by model
  // name and reads the fields it knows; columns it has never heard of are
  // simply along for the ride.
  //
  // Defaults to the *lower* privilege. A column that defaulted to 'admin'
  // would mean any future insert path that forgets to set a role mints a
  // superuser, which is exactly the failure default-deny exists to prevent
  // (design §2).
  role: staffRoleEnum("role").notNull().default("staff"),

  // Deactivation is a timestamp, not a boolean, and not a delete.
  //
  // Not a delete because the audit log names this account as the actor on
  // everything it ever did, and those rows have to stay readable. Not a
  // boolean because "when did they lose access" is a question worth being able
  // to answer, and a boolean throws it away.
  disabledAt: timestamp("disabled_at", { withTimezone: true }),
})

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    // Only the token's hash is meaningful to us, but Better Auth owns this
    // column and stores the signed token itself.
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_user_id_idx").on(table.userId)]
)

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      withTimezone: true,
    }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      withTimezone: true,
    }),
    scope: text("scope"),
    // Always null here: there are no passwords in this system at all.
    password: text("password"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("account_user_id_idx").on(table.userId)]
)

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)]
)

export const passkey = pgTable(
  "passkey",
  {
    id: text("id").primaryKey(),
    name: text("name"),
    publicKey: text("public_key").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    credentialID: text("credential_id").notNull(),
    // Stored, but not checked when it is 0: synced passkeys report 0
    // permanently, and a strict regression check locks out legitimate users
    // (design §7.2).
    counter: integer("counter").notNull(),
    // The BE/BS flags. These are what let us enforce "at least one hardware
    // key" by policy, instead of running FIDO MDS machinery (design §7.2).
    deviceType: text("device_type").notNull(),
    backedUp: boolean("backed_up").notNull(),
    transports: text("transports"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    aaguid: text("aaguid"),
  },
  (table) => [
    index("passkey_user_id_idx").on(table.userId),
    // Better Auth declares no uniqueness on credentialID. A credential ID is
    // globally unique by construction, and two rows claiming one would be a
    // serious problem, so the constraint is added here.
    uniqueIndex("passkey_credential_id_idx").on(table.credentialID),
  ]
)

// Required because rate limiting is configured with `storage: "database"` —
// the default "memory" survives neither a restart nor a second instance
// (design §7.5).
export const rateLimit = pgTable("rate_limit", {
  id: text("id").primaryKey(),
  key: text("key").notNull().unique(),
  count: integer("count").notNull(),
  lastRequest: bigint("last_request", { mode: "number" }).notNull(),
})

// Ours, not Better Auth's.
//
// A provisioned-but-unenrolled admin has no session and no password, so there
// is no built-in way to register a first passkey. This table carries the
// one-time grant that lets them (design §7.3).
export const enrollmentToken = pgTable(
  "enrollment_token",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    // Only the SHA-256 hash is stored. The token itself is shown once, on the
    // provisioning CLI's stdout, and never persisted anywhere.
    tokenHash: bytea("token_hash").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    // Set when redeemed. Single-use is enforced by an UPDATE guarded on this
    // being null, so two concurrent redemptions cannot both win.
    usedAt: timestamp("used_at", { withTimezone: true }),
    // Which admin issued it — the two-person control from §7.4 is a policy
    // wrapper, but it needs a record to be auditable.
    issuedBy: text("issued_by"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("enrollment_token_user_id_idx").on(table.userId)]
)
