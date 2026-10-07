import { createStart } from "@tanstack/react-start"

import { securityHeaders } from "@/lib/security-headers"

export const startInstance = createStart(() => ({
  requestMiddleware: [securityHeaders],
}))
