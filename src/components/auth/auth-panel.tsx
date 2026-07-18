import { useState } from "react"

import type { AuthPanelProps, AuthStatus } from "./types"
import { Button } from "@/components/ui/button"
import { Container } from "@/components/layout/container"
import { LogoMark } from "@/components/brand/logo-mark"

// Minimal and accessible (design §13). One heading, one button, one line of
// help, and a live error region. No decoration, no marketing chrome, and no
// "register" link — there is no registration.
export function AuthPanel({
  heading,
  help,
  actionLabel,
  pendingLabel,
  onAction,
}: AuthPanelProps) {
  const [status, setStatus] = useState<AuthStatus>({ phase: "idle" })

  async function run() {
    setStatus({ phase: "working" })

    try {
      await onAction()
      setStatus({ phase: "done" })
    } catch (error) {
      setStatus({
        phase: "error",
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong. Try again.",
      })
    }
  }

  const working = status.phase === "working"

  return (
    <Container className="flex min-h-screen items-center justify-center py-12">
      <main className="w-full max-w-sm">
        <LogoMark />

        <h1 className="mt-8 text-display-s font-semibold text-balance">
          {heading}
        </h1>
        <p className="text-faded mt-2 text-paragraph-s text-pretty">{help}</p>

        <Button
          className="mt-6 w-full"
          size="lg"
          disabled={working}
          onClick={() => void run()}
        >
          {working ? pendingLabel : actionLabel}
        </Button>

        {/* Announced without stealing focus. */}
        <div aria-live="polite" className="mt-4 min-h-6">
          {status.phase === "error" && (
            <p className="text-paragraph-s text-pretty text-destructive">
              {status.message}
            </p>
          )}
        </div>
      </main>
    </Container>
  )
}
