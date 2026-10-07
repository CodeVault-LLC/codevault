import { defineConfig } from "vite"
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
    tailwindcss(),
    tanstackStart(),
    nitro({ preset: "node-server" }),
    viteReact(),
  ],
})

export default config
