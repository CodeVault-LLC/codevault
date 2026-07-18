import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"
import { TanStackDevtools } from "@tanstack/react-devtools"

import "@/styles/globals.css"
import { NotFound } from "@/core/pages/not-found"

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      // theme-color is deliberately absent here: head() de-duplicates meta by
      // name, so the two media-scoped variants would collapse into one. They
      // are rendered directly in RootDocument's <head> instead.
      {
        title: "CodeVault",
      },
    ],
    links: [
      // Browsers that support it take the SVG and get the mark at any size;
      // the PNGs and .ico below are the fallback for the ones that don't.
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
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        href: "/favicon-16x16.png",
      },
      { rel: "manifest", href: "/site.webmanifest" },
      { rel: "icon", href: "/favicon.ico" },
    ],
  }),
  errorComponent: () => <NotFound />,
  notFoundComponent: () => <NotFound />,
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    // Browser extensions (dark-mode toolbars, translators, password managers)
    // stamp attributes onto <html>/<body> before React hydrates, which reads
    // as a server/client mismatch. Suppression is one level deep — it covers
    // these two elements' attributes only, so genuine mismatches inside the
    // app still warn.
    <html lang="en" suppressHydrationWarning>
      <head>
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
        {children}
        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
