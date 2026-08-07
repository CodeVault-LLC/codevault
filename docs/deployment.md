# Production deployment

How CodeVault gets from this repo to `codevault.no`. Target is a single
container on an Oracle Cloud Always Free VM, with Postgres alongside it and
Cloudflare R2 for objects. Total recurring cost is one extra domain
registration.

The design decisions behind this shape are in
`specs/2026-07-18-technical-reports-server-design.md` — §5 (origins), §9
(ingest), §10 (hosting). This document is the procedure, not the rationale.

## Why not Vercel

The marketing routes would deploy there fine. The archive will not, at any
tier. `Dockerfile` apk-installs `mupdf-tools`, `ghostscript`, `poppler-utils`
and `libwebp-tools`, and `src/server/ingest/sanitize.ts` shells out to them —
serverless functions have no filesystem to install those into. Separately, the
Postgres pool in `src/server/db/client.ts` is `max: 16` cached on `globalThis`,
which assumes one long-lived process; per-invocation isolation would exhaust
connections. `vite.config.ts` pins the `node-server` preset for both reasons.

---

## Step 0 — Lock two decisions first

Both are painful to change later. Do these before anything else.

**The RP ID.** `PASSKEY_RP_ID` binds every WebAuthn credential to a domain.
Change it later and all enrolled passkeys stop working, including the admin
credential from `scripts/admin-provision.ts` — that locks you out of your own
dashboard with no email reset path, because there is no email in this system.

Set it to the apex, `codevault.no`, not `www.codevault.no`. The apex covers
both hosts; the `www` form does not cover the apex.

**The content origin.** `VITE_CONTENT_URL` must be a *separate registrable
domain*, not a subdomain of `codevault.no`. §5.3 isolates rendered PDFs from
parent-domain cookies, and `content.codevault.no` shares cookie scope with
`codevault.no` — it would defeat the control entirely.

Register a second domain now. `codevaultusercontent.no` works (Norid allows up
to 100 `.no` domains per org); so does any `.com`. It must be on Cloudflare DNS
so R2 can attach a custom domain to it.

While you are here, fix `src/core/config/site.ts:6` — it still reads
`https://codevault.dev`, which is wrong for canonical URLs, the sitemap, and
citation output.

---

## Step 1 — Cloudflare: R2 buckets

In the Cloudflare dashboard, R2 → create three buckets:

```
codevault-reports-public
codevault-reports-internal
codevault-reports-quarantine
```

Then:

1. **Quarantine lifecycle** — add a rule deleting objects after 1 day. Failed
   and abandoned uploads must not accumulate.
2. **Public bucket custom domain** — attach your content domain to
   `codevault-reports-public`. This is what `VITE_CONTENT_URL` points at.
   Leave the other two private.
3. **API token** — R2 → Manage API Tokens → create one with Object Read &
   Write scoped to these three buckets. Record the access key ID, secret, and
   your account ID.

The S3 endpoint is `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`. Use the
account endpoint, never the custom domain — presigned URLs are signed against
the account host and will not verify otherwise.

**CORS on the quarantine bucket is required, not optional.** The deposit flow
PUTs from the browser cross-origin with a PDF content type, which triggers a
preflight; without a CORS policy the upload fails as a bare network error with
no status. Set it in the dashboard, or run the repo's own script against R2:

```bash
# from a checkout, with a .env pointing at R2 and BETTER_AUTH_URL set to the
# production origin — the script derives the allowed origin from it
bun run storage:bootstrap
```

---

## Step 2 — Provision the VM

Oracle Cloud → Compute → Instances → Create.

- Shape: **VM.Standard.A1.Flex**, 4 OCPU / 24 GB (the full Always Free ARM
  allocation)
- Image: Ubuntu 24.04 (aarch64)
- Boot volume: 100 GB (also inside the free allowance)
- Upload your SSH public key

Two things to expect. ARM capacity is genuinely scarce in popular regions —
"out of host capacity" is normal, and you may need to retry over several days
or pick a quieter home region. And Always Free resources can be reclaimed if
the account looks idle; adding a payment method without upgrading marks it
active.

You do **not** need to open ports 80/443 in the Oracle security list. Step 4
uses an outbound-only tunnel.

---

## Step 3 — Base setup on the VM

```bash
ssh ubuntu@<VM_IP>

sudo apt update && sudo apt upgrade -y

# Docker
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker ubuntu
# log out and back in for the group to take effect

# Oracle images ship a restrictive iptables policy; the tunnel is outbound-only
# so nothing needs opening, but confirm Docker's own rules survived:
sudo iptables -L DOCKER-USER -n

sudo apt install -y git
git clone https://github.com/CodeVault-LLC/codevault.git
cd codevault
```

Add swap. The ARM box has 24 GB, but Ghostscript on a large PDF spikes hard and
an OOM kill mid-ingest is the failure you least want:

```bash
sudo fallocate -l 4G /swapfile && sudo chmod 600 /swapfile
sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

## Step 4 — Cloudflare Tunnel

A tunnel means no inbound ports, no certificate renewal, and no Oracle security
list work. It is free.

```bash
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64.deb -o cloudflared.deb
sudo dpkg -i cloudflared.deb

cloudflared tunnel login
cloudflared tunnel create codevault
cloudflared tunnel route dns codevault codevault.no
cloudflared tunnel route dns codevault www.codevault.no
```

`/etc/cloudflared/config.yml`:

```yaml
tunnel: codevault
credentials-file: /root/.cloudflared/<TUNNEL_UUID>.json

ingress:
  - hostname: codevault.no
    service: http://localhost:3000
  - hostname: www.codevault.no
    service: http://localhost:3000
  - service: http_404
```

```bash
sudo cloudflared service install
sudo systemctl enable --now cloudflared
```

In Cloudflare → SSL/TLS, set encryption mode to **Full**. Then add a redirect
rule sending `www.codevault.no` to `codevault.no` so there is one canonical
origin — session cookies and the RP ID both assume it.

### Security headers: what the app sets, and what is left for the edge

The app sets CSP, `X-Content-Type-Options`, `Referrer-Policy`,
`X-Frame-Options`, `Permissions-Policy` and the two `Cross-Origin-*` headers on
every response it renders — see
[`src/server/http/security-headers.ts`](../src/server/http/security-headers.ts).
`Strict-Transport-Security` is set there too, but only when `NODE_ENV` is
`production` **and** the request arrives with `X-Forwarded-Proto: https`, which
is what the tunnel sends.

Two gaps that only the edge can close:

1. **Static assets bypass the middleware.** Fonts, icons and the stock images
   are served straight off disk by Nitro and never pass through the request
   chain. Nothing above protects an immutable PNG, but a scanner will report
   the absence. If that matters, add the headers as a Cloudflare Transform
   Rule on `/assets/*`, `/fonts/*` and `/stock/*`.

2. **CSP still allows inline script.** `script-src` carries `'unsafe-inline'`
   because TanStack Start inlines its hydration payload. The framework can
   nonce those tags via `router.options.ssr.nonce`, but the nonce has to be
   minted per request and reach `getRouter()`, which takes no arguments today.
   Until that is threaded through, the policy does not stop injected inline
   script — it only limits what injected script can reach. Tightening this is
   the single highest-value change left in this file.

HSTS is deliberately `max-age=31536000` with **no** `includeSubDomains` and
**no** `preload`. Preloading is close to irreversible, and the app domain may
yet grow a subdomain that is not ours to pin.

---

## Step 5 — Production environment file

On the VM, `~/codevault/.env` (never committed — `.env.example` is the
template):

```bash
NODE_ENV=production

DATABASE_URL=postgres://codevault:<STRONG_PASSWORD>@postgres:5432/codevault

S3_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com
S3_REGION=auto
S3_ACCESS_KEY_ID=<R2_ACCESS_KEY_ID>
S3_SECRET_ACCESS_KEY=<R2_SECRET>
S3_FORCE_PATH_STYLE=false

BUCKET_PUBLIC=codevault-reports-public
BUCKET_INTERNAL=codevault-reports-internal
BUCKET_QUARANTINE=codevault-reports-quarantine

BETTER_AUTH_SECRET=<openssl rand -base64 48>
BETTER_AUTH_URL=https://codevault.no

PASSKEY_RP_ID=codevault.no
PASSKEY_RP_NAME=CodeVault

VITE_CONTENT_URL=https://<your-content-domain>

INGEST_NOTIFY_SECRET=<openssl rand -base64 32>
```

Note `S3_FORCE_PATH_STYLE=false` — that differs from the local SeaweedFS
default of `true`. And `DATABASE_URL` uses host `postgres` (the compose service
name) on port 5432, not the `localhost:5433` the local stack exposes.

```bash
chmod 600 .env
```

---

## Step 6 — Production compose file

`docker-compose.prod.yml`. The repo's `docker-compose.yml` is the local dev
stack — Postgres on a nonstandard port plus SeaweedFS — and is not what runs
here.

```yaml
services:
  postgres:
    image: postgres:18.4-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: codevault
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: codevault
    volumes:
      # /var/lib/postgresql, not /data — PG18 moved the data directory
      - postgres-data:/var/lib/postgresql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U codevault"]
      interval: 10s
      timeout: 5s
      retries: 5
    # No ports mapping. Postgres is reachable only on the compose network.

  app:
    build: .
    restart: unless-stopped
    env_file: .env
    ports:
      - "127.0.0.1:3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
    # The PDF tools exchange files rather than streams, so /tmp must be
    # writable; nothing else is.
    tmpfs:
      - /tmp
    read_only: true

volumes:
  postgres-data:
```

Binding to `127.0.0.1:3000` rather than `0.0.0.0:3000` matters — Docker writes
its own iptables rules and would otherwise publish the app past the host
firewall, bypassing the tunnel.

---

## Step 7 — First deploy

```bash
cd ~/codevault
export POSTGRES_PASSWORD='<same password as in DATABASE_URL>'

docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d postgres
```

Migrations run as a discrete step, before the app starts. The image
deliberately does not run them at boot — Drizzle's migrator takes no lock of
its own, so replicas booting together would race the same DDL. `scripts/
migrate.ts` takes `pg_advisory_lock(8242026)` to make the step safe to repeat.

```bash
docker compose -f docker-compose.prod.yml run --rm app node .output/migrate.mjs
docker compose -f docker-compose.prod.yml up -d app
```

Verify:

```bash
curl -s localhost:3000/api/health
```

That endpoint does real work — a Postgres `select 1` and an R2 `list` — so a
200 confirms both dependencies, not just that the process booted. A 503 means
one of them is wrong; check `docker compose -f docker-compose.prod.yml logs app`.

---

## Step 8 — Provision the first admin

`scripts/admin-provision.ts` needs Bun and the source tree, which the runtime
image does not carry (it holds only `.output` and `drizzle`). Build the build
stage and run it there:

```bash
docker build --target build -t codevault-tools .

docker run --rm --env-file .env \
  --network codevault_default \
  codevault-tools \
  bun run admin:provision --email you@example.com --name "Your Name" --role admin
```

It prints a one-time enrollment URL and stores only a SHA-256 hash of the
token. **Do not send that URL to the email address that is the account
identifier** — deliver it out of band (§7.3). Open it and enroll a passkey
immediately; the token expires.

Confirm `PASSKEY_RP_ID` is `codevault.no` before you do this. Enrolling against
the wrong value means re-provisioning from scratch.

If a link expires or a device is lost, reissue rather than creating a second
account:

```bash
docker run --rm --env-file .env --network codevault_default \
  codevault-tools bun run admin:provision --email you@example.com --reissue
```

---

## Step 9 — Backups

Durable state is exactly two systems: Postgres and R2. R2 is Cloudflare's
problem. Postgres is yours, and on a single VM with no managed provider behind
it, this step is the difference between a hiccup and losing the archive.

`/etc/systemd/system/codevault-backup.service`:

```ini
[Unit]
Description=CodeVault Postgres backup to R2

[Service]
Type=oneshot
User=ubuntu
WorkingDirectory=/home/ubuntu/codevault
ExecStart=/home/ubuntu/codevault/scripts/backup.sh
```

`scripts/backup.sh` — dump, compress, ship to R2, prune local copies. Point
`rclone` at an R2 remote, or use the AWS CLI with the same credentials. Give it
its own bucket with a 30-day lifecycle rule.

Pair with a `codevault-backup.timer` on `OnCalendar=daily`. Then **restore one
dump into a throwaway database and confirm it loads** — an untested backup is a
guess.

---

## Step 10 — CI/CD

GitHub Actions is free for public repos and 2000 minutes/month private. A
minimal deploy job SSHes in, pulls, rebuilds, migrates, restarts:

```yaml
- run: docker compose -f docker-compose.prod.yml build
- run: docker compose -f docker-compose.prod.yml run --rm app node .output/migrate.mjs
- run: docker compose -f docker-compose.prod.yml up -d app
```

Gate it behind `bun run typecheck && bun run test && bun run lint` on the way
in. Note that building on the VM competes with the running app for memory —
acceptable at this size, but if ingest starts getting OOM-killed during
deploys, move to building the image in Actions and pushing to a registry.

---

## Open items before this is production-ready

Three gaps that are not deployment steps but block a real launch.

**Ingest events have no producer.** `src/routes/api.ingest.notify.ts` is
specced as the sink for R2 event notifications delivered via Cloudflare Queues.
Queues requires a Workers Paid plan ($5/mo), which is the only thing in this
architecture that is not free. It is also avoidable: the endpoint is a plain
authenticated HTTP POST taking a batch of keys, so the admin client can call it
directly once its presigned upload completes. That needs writing.

**The orphan sweeper is not scheduled.** `sweepOrphanedUploads()` in
`src/server/ingest/notifications.ts` exists and is never invoked. It is the
backstop for uploads whose completion callback never arrives — which becomes
the primary safety net if you take the client-driven approach above. Wire it to
a timer.

**No error tracking.** There is no Sentry, no logging service, no analytics
anywhere in the tree. `/api/health` tells you the process is alive; nothing
tells you an ingest failed at 3am. At minimum, alert on the healthcheck.

## Cost

| Piece | Provider | Cost |
| --- | --- | --- |
| Compute, 4 vCPU / 24 GB | Oracle Always Free | $0 |
| Postgres | Docker, same VM | $0 |
| Object storage, 10 GB, zero egress | Cloudflare R2 | $0 |
| DNS, CDN, TLS, tunnel | Cloudflare free | $0 |
| CI | GitHub Actions | $0 |
| App domain | `codevault.no` | already owned |
| Content domain | second registrable domain | ~100 NOK/yr |

The honest caveat: Oracle Always Free carries no SLA, and idle accounts can be
reclaimed. That is a real tension for an archive whose premise is that
citations do not rot. It is fine for now — but revisit it before you publish
anything you are promising to keep alive.
