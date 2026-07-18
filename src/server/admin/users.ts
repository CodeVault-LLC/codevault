import { and, count, eq, gt, isNull, ne } from "drizzle-orm"

import type { AuditActor } from "@/server/audit/types"
import type {
  AccountResult,
  CredentialSummary,
  EnrollmentResult,
  ProvisionResult,
  StaffAccount,
} from "./user-types"
import type { StaffRole } from "@/core/auth/permissions"
import { auth } from "@/server/auth/auth"
import { db } from "@/server/db/client"
import { enrollmentToken, passkey, session, user } from "@/server/db/schema"
import { env } from "@/env/server"
import { issueEnrollmentToken } from "@/server/auth/enrollment"
import { recordAudit } from "@/server/audit/audit"
import { roleLabels } from "@/core/auth/permissions"

// Account management (design §8.1, §7.3, §7.4).
//
// Two things run through all of it. First, nothing here ever handles a
// credential: there are no passwords in this system, and an enrollment token's
// plaintext exists for the length of one response and is stored only as a
// hash. Second, every operation that could remove someone's access checks that
// it is not removing the *last* access — a dashboard whose user screen can lock
// the archive out of its own user screen is a trap, not a tool.

/**
 * How many active admins there are, optionally excluding one.
 *
 * The exclusion is what makes this answer the question actually being asked:
 * not "how many admins are there" but "how many would be left if I did this".
 */
async function otherActiveAdmins(exceptUserId: string): Promise<number> {
  const [row] = await db
    .select({ total: count() })
    .from(user)
    .where(
      and(
        eq(user.role, "admin"),
        isNull(user.disabledAt),
        ne(user.id, exceptUserId)
      )
    )

  return row.total
}

/**
 * Every account, with its credentials and session count.
 *
 * Three queries and a join in memory rather than one query with aggregates: an
 * account has a handful of passkeys and there are a handful of accounts, so the
 * shape of the result matters more than the round trips. A single query with
 * two `left join`s would multiply rows and need distinguishing counts, which is
 * more SQL to be subtly wrong in than this is.
 */
export async function listStaffAccounts(): Promise<StaffAccount[]> {
  const now = new Date()

  const [accounts, credentials, sessions, pending] = await Promise.all([
    db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        disabledAt: user.disabledAt,
        createdAt: user.createdAt,
      })
      .from(user)
      .orderBy(user.createdAt),

    db
      .select({
        id: passkey.id,
        userId: passkey.userId,
        name: passkey.name,
        deviceType: passkey.deviceType,
        backedUp: passkey.backedUp,
        createdAt: passkey.createdAt,
      })
      .from(passkey)
      .orderBy(passkey.createdAt),

    // Expired rows are left in the table by Better Auth until something cleans
    // them; counting them would report sessions that cannot authenticate.
    db
      .select({ userId: session.userId, total: count() })
      .from(session)
      .where(gt(session.expiresAt, now))
      .groupBy(session.userId),

    db
      .select({ userId: enrollmentToken.userId })
      .from(enrollmentToken)
      .where(
        and(isNull(enrollmentToken.usedAt), gt(enrollmentToken.expiresAt, now))
      ),
  ])

  const byUser = new Map<string, CredentialSummary[]>()
  for (const row of credentials) {
    const list = byUser.get(row.userId) ?? []
    list.push({
      id: row.id,
      name: row.name,
      deviceType: row.deviceType,
      backedUp: row.backedUp,
      createdAt: row.createdAt,
    })
    byUser.set(row.userId, list)
  }

  const sessionCounts = new Map(sessions.map((row) => [row.userId, row.total]))
  const pendingUsers = new Set(pending.map((row) => row.userId))

  return accounts.map((account) => ({
    ...account,
    credentials: byUser.get(account.id) ?? [],
    activeSessions: sessionCounts.get(account.id) ?? 0,
    hasPendingEnrollment: pendingUsers.has(account.id),
  }))
}

function enrollmentUrl(token: string): string {
  return `${env.BETTER_AUTH_URL}/enroll?token=${encodeURIComponent(token)}`
}

/**
 * Creates an account with zero credentials and mints its first enrollment link.
 *
 * The account is never seeded with a secret (design §10.4). What comes back is
 * a one-time URL to be delivered out of band — Signal, or in person — and
 * explicitly never to the email address that is the account identifier, since
 * that address is the thing the link would otherwise be protecting.
 */
export async function provisionAccount(
  input: { email: string; name: string; role: StaffRole },
  actor: AuditActor
): Promise<ProvisionResult> {
  const existing = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, input.email))
    .limit(1)

  if (existing.length > 0) return { ok: false, reason: "email_taken" }

  // Through Better Auth's own adapter rather than a direct insert, so the id
  // format, timestamps and any future required column stay whatever Better
  // Auth expects them to be.
  const context = await auth.$context
  const created = await context.internalAdapter.createUser({
    email: input.email,
    name: input.name,
    emailVerified: false,
  })

  // The role is set in a second statement because `createUser` only knows
  // about Better Auth's own fields. A separate UPDATE is honest about that
  // rather than pretending the adapter handles it.
  await db.update(user).set({ role: input.role }).where(eq(user.id, created.id))

  const { token, expiresAt } = await issueEnrollmentToken(created.id, {
    issuedBy: actor.userId ?? undefined,
  })

  await recordAudit({
    actor,
    action: "user.provision",
    targetType: "user",
    targetId: created.id,
    targetLabel: input.email,
    summary: `Provisioned ${input.email} as ${roleLabels[input.role]}.`,
    detail: { role: input.role },
  })

  return {
    ok: true,
    userId: created.id,
    enrollmentUrl: enrollmentUrl(token),
    expiresAt,
  }
}

/**
 * Mints a fresh enrollment link for an existing account — the recovery path.
 *
 * Same code path as first enrollment, built once (design §7.3). The one
 * addition is §7.4's cheap two-person control: a different admin issues than
 * requests, so nobody can restore their own access from a session that may not
 * be theirs. Recovering your own account goes through `admin:provision
 * --reissue`, which requires shell access to the host — a meaningfully
 * different thing to hold than a browser tab.
 */
export async function issueEnrollment(
  userId: string,
  actor: AuditActor
): Promise<EnrollmentResult> {
  if (actor.userId === userId) return { ok: false, reason: "self_enrollment" }

  const rows = await db
    .select({ email: user.email })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1)

  if (rows.length === 0) return { ok: false, reason: "not_found" }

  const { token, expiresAt } = await issueEnrollmentToken(userId, {
    issuedBy: actor.userId ?? undefined,
  })

  await recordAudit({
    actor,
    action: "user.enrollment.issue",
    targetType: "user",
    targetId: userId,
    targetLabel: rows[0].email,
    summary: `Issued an enrollment link for ${rows[0].email}.`,
    // The token is never recorded, here or anywhere. Only that one was issued.
    detail: { expiresAt: expiresAt.toISOString() },
  })

  return { ok: true, enrollmentUrl: enrollmentUrl(token), expiresAt }
}

export async function setAccountRole(
  userId: string,
  role: StaffRole,
  actor: AuditActor
): Promise<AccountResult> {
  // Changing your own role is refused rather than merely discouraged. It is the
  // one mistake on this screen with no path back through the UI: demote
  // yourself and the button that would undo it is now hidden from you.
  if (actor.userId === userId) return { ok: false, reason: "self" }

  const rows = await db
    .select({ email: user.email, role: user.role, disabledAt: user.disabledAt })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1)

  if (rows.length === 0) return { ok: false, reason: "not_found" }

  const before = rows[0]
  if (before.role === role) return { ok: true }

  // Demoting the last active admin would leave the archive with no account
  // able to provision, promote, or read the audit log — recoverable only by SQL
  // against production.
  if (
    before.role === "admin" &&
    !before.disabledAt &&
    (await otherActiveAdmins(userId)) === 0
  ) {
    return { ok: false, reason: "last_admin" }
  }

  await db.update(user).set({ role }).where(eq(user.id, userId))

  await recordAudit({
    actor,
    action: "user.role.change",
    targetType: "user",
    targetId: userId,
    targetLabel: before.email,
    summary: `Changed ${before.email} from ${roleLabels[before.role]} to ${roleLabels[role]}.`,
    detail: { from: before.role, to: role },
  })

  return { ok: true }
}

/**
 * Deactivates an account and cuts its live sessions.
 *
 * Both halves matter. The flag is what `getStaffSession` checks on every
 * request, so a cookie issued a minute ago stops working; deleting the sessions
 * is what makes the accounts screen show zero afterwards and closes the window
 * where a long-poll or an in-flight request could still be holding one.
 *
 * Not a delete. The audit log names this account as the actor on everything it
 * ever did, and those rows have to stay readable (schema/auth.ts).
 */
export async function setAccountDisabled(
  userId: string,
  disabled: boolean,
  actor: AuditActor
): Promise<AccountResult> {
  if (disabled && actor.userId === userId) return { ok: false, reason: "self" }

  const rows = await db
    .select({ email: user.email, role: user.role, disabledAt: user.disabledAt })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1)

  if (rows.length === 0) return { ok: false, reason: "not_found" }

  const before = rows[0]

  if (
    disabled &&
    before.role === "admin" &&
    !before.disabledAt &&
    (await otherActiveAdmins(userId)) === 0
  ) {
    return { ok: false, reason: "last_admin" }
  }

  await db
    .update(user)
    .set({ disabledAt: disabled ? new Date() : null })
    .where(eq(user.id, userId))

  if (disabled) {
    await db.delete(session).where(eq(session.userId, userId))
  }

  await recordAudit({
    actor,
    action: disabled ? "user.disable" : "user.enable",
    targetType: "user",
    targetId: userId,
    targetLabel: before.email,
    summary: disabled
      ? `Deactivated ${before.email} and revoked its sessions.`
      : `Reinstated ${before.email}.`,
  })

  return { ok: true }
}

/**
 * Signs an account out everywhere.
 *
 * Database-backed sessions are what make this possible at all — a stateless
 * token could not be recalled (design §7.5). Permitted against your own account
 * as well as someone else's: "I left my laptop somewhere" is the case this
 * exists for, and it costs the person doing it nothing but a re-login.
 */
export async function revokeSessions(
  userId: string,
  actor: AuditActor
): Promise<AccountResult> {
  const rows = await db
    .select({ email: user.email })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1)

  if (rows.length === 0) return { ok: false, reason: "not_found" }

  const revoked = await db
    .delete(session)
    .where(eq(session.userId, userId))
    .returning({ id: session.id })

  await recordAudit({
    actor,
    action: "user.sessions.revoke",
    targetType: "user",
    targetId: userId,
    targetLabel: rows[0].email,
    summary: `Revoked ${revoked.length} session${revoked.length === 1 ? "" : "s"} for ${rows[0].email}.`,
    detail: { revoked: revoked.length },
  })

  return { ok: true }
}

/**
 * Removes one passkey.
 *
 * Deliberately allowed to take an account down to zero credentials, and
 * deliberately *warned* about rather than blocked. A stolen device is exactly
 * when someone needs to remove a credential without first proving they still
 * have another, and refusing would turn a compromise into a longer compromise.
 * The way back in is an enrollment link from another admin — the recovery path
 * that already exists (design §7.4).
 */
export async function revokeCredential(
  userId: string,
  credentialRowId: string,
  actor: AuditActor
): Promise<AccountResult> {
  const rows = await db
    .select({ email: user.email, name: passkey.name })
    .from(passkey)
    .innerJoin(user, eq(user.id, passkey.userId))
    // Matched on both, so a credential id belonging to a different account
    // cannot be deleted by naming the wrong user.
    .where(and(eq(passkey.id, credentialRowId), eq(passkey.userId, userId)))
    .limit(1)

  if (rows.length === 0) return { ok: false, reason: "not_found" }

  await db
    .delete(passkey)
    .where(and(eq(passkey.id, credentialRowId), eq(passkey.userId, userId)))

  const [remaining] = await db
    .select({ total: count() })
    .from(passkey)
    .where(eq(passkey.userId, userId))

  await recordAudit({
    actor,
    action: "user.credential.revoke",
    targetType: "credential",
    targetId: credentialRowId,
    targetLabel: rows[0].email,
    summary: `Removed a passkey from ${rows[0].email}; ${remaining.total} remaining.`,
    detail: { remaining: remaining.total, name: rows[0].name },
  })

  return { ok: true }
}
