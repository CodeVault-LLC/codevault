// Client-safe environment. Everything here is compiled into the browser
// bundle, so it may only ever hold public values. See `./server.ts` for why the
// two schemas live in separate modules.

import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

export const env = createEnv({
  clientPrefix: "VITE_",
  client: {
    // Separate *registrable* domain that serves report files — not a subdomain
    // of the app, so parent-domain cookies stay unreachable from a rendered
    // PDF (design §5.3).
    VITE_CONTENT_URL: z.url(),
  },
  // Required: the default is `process.env`, which is undefined in the browser.
  runtimeEnv: import.meta.env,
  // Statically replaced by Vite, so the server branch is eliminated at build.
  isServer: import.meta.env.SSR,
  emptyStringAsUndefined: true,
})
