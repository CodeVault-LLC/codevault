import { createFileRoute, redirect, useRouter } from "@tanstack/react-router"

import { AuthPanel } from "@/components/auth/auth-panel"
import { authClient } from "@/lib/auth-client"
import { fetchStaffSession } from "@/server/auth/functions"
import { site } from "@/core/config/site"

// Everything on this page is readable by anyone who can reach it, so it says
// nothing about what is behind it. The aside is the same story the marketing
// site tells (design §7.2) — no capabilities, no internal vocabulary, no hint
// about how many people hold a credential.
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

export const Route = createFileRoute("/login")({
  // Someone who already has a session has nothing to do here. Same caveat as
  // the `/admin` guard: this is UX, not a security boundary.
  beforeLoad: async () => {
    const staff = await fetchStaffSession()
    if (staff) throw redirect({ to: "/admin" })
  },
  component: LoginRoute,
  head: () => ({
    meta: [
      { title: "Sign in — CodeVault" },
      // Same reasoning as /enroll and /admin. `robots.txt` already asks
      // crawlers not to fetch this, but a disallowed URL can still be indexed
      // from an inbound link — the directive that actually keeps it out of
      // results is this one, and it is only read if the page is fetched.
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
})

function LoginRoute() {
  const router = useRouter()

  return (
    <AuthPanel
      eyebrow={site.name}
      heading={
        <>
          Welcome <span className="font-serif font-normal italic">back</span>.
        </>
      }
      // No email field: the credential is discoverable (residentKey required),
      // so the authenticator supplies the identity. That is also what makes
      // username enumeration impossible here (design §7.2).
      help="Your passkey is the whole sign-in. Nothing to type, nothing to remember — just the device you registered."
      actionLabel="Continue with your passkey"
      pendingLabel="Waiting for your passkey…"
      footnote="Trouble signing in? Get in touch with whoever set up your account."
      aside={ASIDE}
      onAction={async () => {
        const result = await authClient.signIn.passkey()

        if (result.error) {
          // Deliberately fixed, and deliberately not the server's message.
          // Every failure — no credential, unknown credential, rejected
          // ceremony — has to look identical from out here.
          throw new Error("That didn't work. Try again.")
        }

        await router.navigate({ to: "/admin" })
      }}
    />
  )
}
