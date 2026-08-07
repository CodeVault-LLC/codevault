import { createFileRoute } from "@tanstack/react-router"

import { site } from "@/core/config/site"

// The web app manifest, generated rather than sitting in `public/` alongside
// the icons it names.
//
// It carries the site name, the description, and the light theme color — all
// three of which already exist in `@/core/config/site`, and a static copy is a
// second place to forget. Same reasoning as `robots.txt`, `sitemap.xml` and
// `security.txt`; the icons stay static because they are bytes, not content.
//
// `[.]` escapes the dot so this is one route at /site.webmanifest.

export const Route = createFileRoute("/site.webmanifest")({
  server: {
    handlers: {
      GET: () => {
        const manifest = {
          // `id` is what keeps an installed app pointed at this site if
          // `start_url` ever changes. Omitted, the browser derives it from
          // `start_url` and a later edit reads as a different app.
          id: "/",
          name: site.name,
          short_name: site.name,
          description: site.description,
          lang: "en",
          dir: "ltr",
          start_url: "/",
          scope: "/",
          display: "standalone",
          orientation: "any",
          // A manifest has one theme color, not the media-scoped pair the
          // document head carries, so this is the light value. Browsers that
          // honor the meta tags prefer those anyway.
          theme_color: site.themeColor.light,
          background_color: site.themeColor.light,
          icons: [
            {
              src: "/android-chrome-192x192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "/android-chrome-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "/icon-maskable-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
          ],
        }

        return new Response(JSON.stringify(manifest, null, 2), {
          headers: {
            "content-type": "application/manifest+json; charset=utf-8",
            "cache-control": "public, max-age=86400",
          },
        })
      },
    },
  },
})
