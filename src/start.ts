import { createStart } from "@tanstack/react-start"

import { cacheHeaders } from "@/lib/cache-headers"
import { securityHeaders } from "@/lib/security-headers"

export const startInstance = createStart(() => ({
  requestMiddleware: [securityHeaders, cacheHeaders],
}))
