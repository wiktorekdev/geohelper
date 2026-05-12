import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Base path: "/" for Vercel deployment at root domain.
// Override via BASE_URL env var if needed.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: process.env.BASE_URL ?? "/",
});
