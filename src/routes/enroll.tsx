import { createFileRoute, redirect, useRouter } from "@tanstack/react-router"
import { z } from "zod"

import { AuthPanel } from "@/components/auth/auth-panel"
import { authClient } from "@/lib/auth-client"
import { fetchStaffSession } from "@/server/auth/functions"
import { site } from "@/core/config/site"

// Same panel as `/login`, for the same reason: this page is reachable by
// anyone holding a URL, so it describes CodeVault and nothing else. It used to
// walk through the enrollment ceremony step by step, which handed a reader the
// mechanism (single-use, burned on verify) for free.
const ASIDE = {
  eyebrow: site.name,
  intro: site.description,
  closing: site.tagline,
  // Unsplash (Joshua Earle) — Unsplash License, attribution not required.
  image: {
    src: "/stock/person-open-arms-mountains.avif",
    alt: "A person standing with their arms open, facing a range of snow-covered mountains.",
  },
}

// The first-passkey flow (design §7.3), and the recovery flow — built once,
// used for both.
//
// The token in the URL is the entire authorization for this ceremony. It is
// validated server-side by the passkey plugin's resolveUser hook and burned
// once a credential has actually been verified.
export const Route = createFileRoute("/enroll")({
  validateSearch: z.object({ token: z.string().min(1).optional() }),
  // Only bounce a signed-in visitor when the link is empty — there is genuinely
  // nothing to do, so the dashboard is a better destination than a dead end. A
  // link that *does* carry a token still runs, because enrolling an additional
  // credential is a thing you do while signed in.
  beforeLoad: async ({ search }) => {
    if (search.token) return

    const staff = await fetchStaffSession()
    if (staff) throw redirect({ to: "/admin" })
  },
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
        eyebrow={site.name}
        heading={
          <>
            This link no longer{" "}
            <span className="font-serif font-normal italic">works</span>.
          </>
        }
        // Says nothing about *why*. A missing token, a spent one, and one that
        // was never real all land on this exact screen — otherwise the page
        // answers questions for whoever is poking at it.
        help="Get in touch with whoever invited you and ask for a new link."
        actionLabel="Nothing to do here"
        pendingLabel="…"
        disabled
        aside={ASIDE}
      />
    )
  }

  return (
    <AuthPanel
      eyebrow={site.name}
      heading={
        <>
          Set up your <span className="font-serif font-normal italic">key</span>
          .
        </>
      }
      help="Register this device as the way you sign in. Your browser will ask for a fingerprint, a face, or a PIN — whatever it already trusts."
      actionLabel="Create a passkey"
      pendingLabel="Waiting for your authenticator…"
      aside={ASIDE}
      onAction={async () => {
        // `context` carries the enrollment token to the server's resolveUser
        // hook, which is what stands in for the session this flow does not
        // have yet.
        const created = await authClient.passkey.addPasskey({
          context: token,
        })

        // Fixed message, not the server's: an invalid token and a rejected
        // ceremony have to be indistinguishable from out here.
        if (created.error) {
          throw new Error("That didn't work. Ask for a new link.")
        }

        // Registration does not sign you in, so do that with the credential
        // just created.
        const signedIn = await authClient.signIn.passkey()
        if (signedIn.error) {
          throw new Error("That didn't work. Try signing in.")
        }

        await router.navigate({ to: "/admin" })
      }}
    />
  )
}
