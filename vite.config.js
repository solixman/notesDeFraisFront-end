import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import { resolve } from "path"

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"), // This line is crucial for the @/ alias
    },
  },
  server: {
    port: 5173,
    host: true,
    hmr: {
      overlay: false,
    },
  },
  optimizeDeps: {
    force: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
})
