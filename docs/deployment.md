# Deployment

The site is a single Node process with no external services.

```bash
bun run build                  # outputs .output/
node .output/server/index.mjs  # serves on $PORT (default 3000)
```

Or with Docker:

```bash
docker build -t codevault .
docker run -p 3000:3000 codevault
```

## Vercel

The production site is on Vercel, deployed from `main`. No settings are
needed: Vercel sets `VERCEL=1` during its build, and `vite.config.ts` then
builds for Vercel instead of a Node server (Nitro's `vercel` preset). The
build writes `.vercel/output`, which Vercel serves directly: static files
from the edge, and every page rendered by one Node 24 function. The Node
version comes from `engines` in `package.json`.

To check a Vercel build locally:

```bash
VERCEL=1 bun run build         # outputs .vercel/output/
```

## Headers

Security headers (CSP, HSTS over HTTPS, frame and referrer policy) are set by
`src/lib/security-headers.ts`. HSTS is only sent in production over HTTPS,
including behind a TLS-terminating proxy that sets `x-forwarded-proto`.
