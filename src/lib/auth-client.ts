import { createAuthClient } from "better-auth/react"
import { passkeyClient } from "@better-auth/passkey/client"

// Browser-side auth. Talks to /api/auth, which is allowlist-wrapped server-side.
export const authClient = createAuthClient({
  plugins: [passkeyClient()],
})
