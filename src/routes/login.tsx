import { createFileRoute, useRouter } from "@tanstack/react-router"

import { AuthPanel } from "@/components/auth/auth-panel"
import { authClient } from "@/lib/auth-client"

export const Route = createFileRoute("/login")({
  component: LoginRoute,
  head: () => ({ meta: [{ title: "Sign in — CodeVault" }] }),
})

function LoginRoute() {
  const router = useRouter()

  return (
    <AuthPanel
      heading="Sign in"
      // No email field: the credential is discoverable (residentKey required),
      // so the authenticator supplies the identity. That is also what makes
      // username enumeration impossible here (design §7.2).
      help="Use the passkey registered to this device."
      actionLabel="Sign in with a passkey"
      pendingLabel="Waiting for your passkey…"
      onAction={async () => {
        const result = await authClient.signIn.passkey()

        if (result.error) {
          throw new Error(
            result.error.message || "That passkey was not accepted."
          )
        }

        await router.navigate({ to: "/admin" })
      }}
    />
  )
}
