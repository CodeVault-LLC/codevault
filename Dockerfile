# syntax=docker/dockerfile:1

# Build with Bun (the repo's package manager), run on Node. The Nitro
# node-server preset emits a plain Node entrypoint, and a long-lived process is
# what the Postgres pool needs (design §10.1).

FROM oven/bun:1.3.9-alpine AS build
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .

# The build compiles; it never connects. Env validation is skipped here and
# only here — at runtime a missing variable must stop the process from starting.
ENV SKIP_ENV_VALIDATION=true
RUN bun run build && bun run build:migrate

FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# The app writes nothing to disk — all state is in Postgres and object storage.
RUN addgroup -S app && adduser -S app -G app

COPY --from=build /app/.output ./.output
# The .sql files the migrator reads. Kept as files rather than bundled so the
# migrations that ran are inspectable inside a running container.
COPY --from=build /app/drizzle ./drizzle

USER app
EXPOSE 3000

# Migrations are NOT run here. They are a discrete pre-deploy step
# (`node .output/migrate.mjs`) because Drizzle's migrator takes no advisory
# lock, so N replicas booting at once would race the same DDL (design §10.4).
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", ".output/server/index.mjs"]
