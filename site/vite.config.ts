import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Base path: default "/geohelper/" for GitHub Pages at <user>.github.io/geohelper
// Override via BASE_URL env var when deploying to a custom domain.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: process.env.BASE_URL ?? "/geohelper/",
});
