import { createFileRoute } from "@tanstack/react-router"

import { SandboxPage } from "@/components/projects/sandbox-page"
import { seo } from "@/core/lib/seo"

export const Route = createFileRoute("/projects/sandbox")({
  component: SandboxPage,
  head: () =>
    seo({
      title: "Sandbox | CodeVault",
      description:
        "A disposable QEMU environment for AI-assisted vulnerability scanning, with host-owned policy, deny-by-default networking, and a list of the boundaries still missing.",
      path: "/projects/sandbox",
    }),
})
