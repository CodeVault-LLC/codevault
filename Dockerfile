# syntax=docker/dockerfile:1

# Build with Bun (the repo's package manager), run the Nitro node-server
# output on Node. The site has no database, storage or secrets.

FROM oven/bun:1-alpine AS build
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
RUN addgroup -S app && adduser -S app -G app
COPY --from=build /app/.output ./.output
USER app
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
