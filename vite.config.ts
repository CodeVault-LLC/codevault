import path from "path";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import { TanStackRouterVite } from "@tanstack/router-vite-plugin";
import mdx from "@mdx-js/rollup";

export default defineConfig({
  plugins: [
    {
      enforce: "pre",
      ...mdx({}),
    },
    react(),
    TanStackRouterVite(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    fs: {
      cachedChecks: false,
    },
  },
});
