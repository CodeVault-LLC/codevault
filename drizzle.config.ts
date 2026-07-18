import { defineConfig } from "drizzle-kit"

// `generate` + `migrate` everywhere, never `push` outside local scratch work:
// the reviewable, committed SQL diff is the point for an archive holding data
// that cannot be recreated (design §10.4).
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/server/db/schema/index.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
