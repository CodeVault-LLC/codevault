import { defineConfig } from "vite"
import { devtools } from "@tanstack/devtools-vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { nitro } from "nitro/vite"

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  // Keep Start's server entry and middleware together through Nitro's second
  // bundling pass. Split SSR chunks can initialize shared helpers out of order.
  environments: {
    ssr: {
      build: { rolldownOptions: { output: { codeSplitting: false } } },
    },
  },
  plugins: [
    devtools(),
    tailwindcss(),
    tanstackStart(),
    // Hosting is configured here rather than through the Start plugin — its
    // `target` option was removed. `node-server` because the archive needs a
    // long-lived process for the Postgres pool and a container for the native
    // PDF binaries, which rules out Workers (design §10.1).
    nitro({ preset: "node-server" }),
    viteReact(),
  ],
})

export default config
