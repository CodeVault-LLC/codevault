import { useState } from "react"
import { Check, Copy, KeyRound, X } from "lucide-react"

import type { IssuedEnrollment } from "./types"
import { Button } from "@/components/ui/button"
import { adminUsers } from "@/core/config/admin"

/**
 * A freshly minted enrollment link.
 *
 * Shown exactly once and never retrievable — only its SHA-256 hash reaches the
 * database (design §7.3). So this component's whole job is to make that
 * unmistakable *before* the operator navigates away: the warning sits above the
 * link rather than below it, the address it belongs to is named so it cannot be
 * sent to the wrong person, and there is a copy button rather than 200
 * characters of base64url to select by hand.
 *
 * It is not an anchor. Following it would burn the token in the wrong browser —
 * the admin's, not the person being enrolled.
 */
export function EnrollmentLink({
  issued,
  onDismiss,
}: {
  issued: IssuedEnrollment
  onDismiss: () => void
}) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(issued.url)
      setCopied(true)
      // Reverts rather than latching, so a second copy reads as a second copy
      // and not as a button that has stopped responding.
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard access can be refused outright. The text is selectable
      // either way, so there is nothing to recover from and nothing to say.
    }
  }

  return (
    <section
      aria-labelledby="enrollment-heading"
      className="flex flex-col gap-3 rounded-lg border border-clay/40 bg-clay/8 p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <h2
          id="enrollment-heading"
          className="flex items-center gap-2 text-ui-sm font-medium"
        >
          <KeyRound className="size-4" aria-hidden />
          Enrollment link for{" "}
          <span className="font-mono font-normal">{issued.email}</span>
        </h2>

        <Button
          variant="ghost"
          size="sm"
          aria-label="Dismiss the enrollment link"
          onClick={onDismiss}
        >
          <X className="size-3.5" />
        </Button>
      </div>

      <p className="text-ui-xs text-pretty">{adminUsers.tokenDelivery}</p>

      <div className="flex items-center gap-2">
        <code className="min-w-0 flex-1 truncate rounded-md border border-border bg-background px-2 py-1.5 font-mono text-ui-xs">
          {issued.url}
        </code>

        <Button size="sm" variant="outline" onClick={() => void copy()}>
          {copied ? (
            <>
              <Check data-icon="inline-start" className="text-olive" />
              Copied
            </>
          ) : (
            <>
              <Copy data-icon="inline-start" />
              Copy
            </>
          )}
        </Button>
      </div>

      <p className="text-ui-xs text-muted-foreground">
        Single use. Expires{" "}
        <time dateTime={issued.expiresAt.toISOString()} className="font-mono">
          {issued.expiresAt.toLocaleString()}
        </time>
        .
      </p>
    </section>
  )
}
