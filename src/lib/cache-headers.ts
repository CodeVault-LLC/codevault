import { createMiddleware } from "@tanstack/react-start"

// Lets Vercel's edge keep rendered pages, so most visits (and most crawler
// requests) are answered nearby instead of by the server function.
//
// Every page is built from content that only changes when the site is
// deployed, and Vercel clears its edge cache on every deploy. So a successful
// HTML page can be held at the edge for a day and served stale while it
// refreshes. `Vercel-CDN-Cache-Control` is read by Vercel's edge only and
// never passed on, so browsers and any other cache in front of a self-hosted
// copy still revalidate every time.
//
// Only 200 HTML responses to GET. Server routes that set their own
// Cache-Control (robots.txt, the sitemap, feeds) keep it.

const EDGE = "public, s-maxage=86400, stale-while-revalidate=604800"

export const cacheHeaders = createMiddleware({ type: "request" }).server(
  async ({ request, next }) => {
    const result = await next()
    const { response } = result
    const html = response.headers.get("content-type")?.startsWith("text/html")
    if (request.method === "GET" && response.status === 200 && html)
      response.headers.set("vercel-cdn-cache-control", EDGE)
    return result
  }
)
