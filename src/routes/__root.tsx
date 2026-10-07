import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router"
import { MotionConfig } from "framer-motion"

import "@/styles/globals.css"
import { site } from "@/core/config/site"
import { NotFound } from "@/components/layout/not-found"

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: site.title },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-touch-icon.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "/favicon-32x32.png",
      },
      { rel: "manifest", href: "/site.webmanifest" },
    ],
  }),
  errorComponent: () => <NotFound />,
  notFoundComponent: () => <NotFound />,
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    // Extensions stamp attributes onto <html>/<body> before hydration; this
    // suppresses the mismatch warning for those two elements only.
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Rendered here, not in head(): head() de-duplicates meta by name. */}
        <meta
          name="theme-color"
          media="(prefers-color-scheme: light)"
          content="#faf9f5"
        />
        <meta
          name="theme-color"
          media="(prefers-color-scheme: dark)"
          content="#1f1e1d"
        />
        <HeadContent />
      </head>
      <body suppressHydrationWarning>
        <MotionConfig reducedMotion="user">{children}</MotionConfig>
        <Scripts />
      </body>
    </html>
  )
}
