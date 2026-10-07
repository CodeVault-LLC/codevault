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

Security headers (CSP, HSTS over HTTPS, frame and referrer policy) are set by
`src/lib/security-headers.ts`. HSTS is only sent in production over HTTPS,
including behind a TLS-terminating proxy that sets `x-forwarded-proto`.
