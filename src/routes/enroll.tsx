import { createFileRoute, useRouter } from "@tanstack/react-router"
import { z } from "zod"

import { AuthPanel } from "@/components/auth/auth-panel"
import { authClient } from "@/lib/auth-client"

// The first-passkey flow (design §7.3), and the recovery flow — built once,
// used for both.
//
// The token in the URL is the entire authorization for this ceremony. It is
// validated server-side by the passkey plugin's resolveUser hook and burned
// once a credential has actually been verified.
export const Route = createFileRoute("/enroll")({
  validateSearch: z.object({ token: z.string().min(1).optional() }),
  component: EnrollRoute,
  head: () => ({
    meta: [
      { title: "Set up a passkey — CodeVault" },
      // An enrollment URL must never reach a search index or a referrer log.
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
})

function EnrollRoute() {
  const { token } = Route.useSearch()
  const router = useRouter()

  if (!token) {
    return (
      <AuthPanel
        heading="Set up a passkey"
        help="This link is missing its enrollment token. Ask for a new one."
        actionLabel="Nothing to do"
        pendingLabel="…"
        onAction={() => Promise.reject(new Error("No enrollment token."))}
      />
    )
  }

  return (
    <AuthPanel
      heading="Set up a passkey"
      help="Register this device as a way to sign in. You will need a second credential before you can open internal documents."
      actionLabel="Create a passkey"
      pendingLabel="Waiting for your authenticator…"
      onAction={async () => {
        // `context` carries the enrollment token to the server's resolveUser
        // hook, which is what stands in for the session this flow does not
        // have yet.
        const created = await authClient.passkey.addPasskey({
          context: token,
        })

        if (created.error) {
          throw new Error(
            created.error.message || "That enrollment link is not valid."
          )
        }

        // Registration does not sign you in, so do that with the credential
        // just created.
        const signedIn = await authClient.signIn.passkey()
        if (signedIn.error) {
          throw new Error(
            "Passkey created, but sign-in failed. Try signing in."
          )
        }

        await router.navigate({ to: "/admin" })
      }}
    />
  )
}
