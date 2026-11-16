import react from "@vitejs/plugin-react"
import { fileURLToPath, URL } from "node:url"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // @/* -> this app's own src — editor + bundler resolution
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      // @shared/* -> the shared package's source directly, bypassing its
      // own package.json export map. The real importable package name is
      // "@shared/core" (see packages/shared/package.json) — this alias is
      // a separate, path-only concern and must not be confused with that
      // import specifier (see Task 1-02's Challenge for why this distinction
      // matters: conflating the two caused a real bug there).
      "@shared": fileURLToPath(new URL("../../packages/shared/src", import.meta.url)),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
})
