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

    // Test files run one at a time, not in parallel workers.
    //
    // These are integration tests against one shared database, and some of the
    // state they touch is global by construction: the audit log is a single
    // hash chain over every row, so a file that verifies it cannot run
    // alongside a file that appends to it — the appends are not corruption, but
    // a verification pass straddling them reads as though they were.
    //
    // The alternative is scoping verification to a segment, which would mean
    // shaping a production API around a test's convenience. At a two-second
    // suite, running in sequence is the cheaper honesty.
    fileParallelism: false,
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
}))
