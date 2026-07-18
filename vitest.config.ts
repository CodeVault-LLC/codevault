import { defineConfig } from "vitest/config"
import { loadEnv } from "vite"
import { fileURLToPath } from "node:url"

// Integration tests talk to the docker-compose Postgres, so they run in Node
// with no DOM.
//
// The env has to be loaded explicitly: vitest runs each test file in a worker
// process, and those do not inherit the .env that `bun run` injects into its
// own process. An empty prefix loads every variable, not just VITE_ ones —
// safe here because this only ever reaches the workers' process.env, never a
// client bundle.
export default defineConfig(({ mode }) => ({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    env: loadEnv(mode, process.cwd(), ""),
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
}))
