import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

const host = process.env.TAURI_DEV_HOST;

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  clearScreen: false,
  build: {
    // lucide-react ships every icon in one module; themes resolve their icon by
    // name at runtime (see theme-selector), so the full set is intentionally
    // bundled. This is a local desktop app, so the larger "icons" chunk is fine.
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return
          // Keep leaflet/react-leaflet out of manual chunks so they stay in
          // the lazily-loaded map-panel chunk.
          if (id.includes("leaflet")) return
          if (id.includes("lucide-react")) return "icons"
          if (id.includes("@dnd-kit")) return "dnd"
          if (id.includes("motion")) return "motion"
          // Everything else (react, base-ui, floating-ui and small utils) goes
          // into a single self-contained vendor chunk. Splitting these apart
          // creates circular chunk graphs because base-ui depends on react.
          return "vendor"
        },
      },
    },
  },
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? { protocol: "ws", host, port: 1421 }
      : undefined,
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
});
