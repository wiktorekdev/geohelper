import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { readFileSync } from "node:fs";

const rootPackage = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf-8"),
) as { version: string };
const geohelperVersion = rootPackage.version;

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: "geohelper-version",
      transformIndexHtml(html) {
        return html.split("__GEOHELPER_VERSION__").join(geohelperVersion);
      },
    },
  ],
  base: process.env.BASE_URL ?? "/",
  define: {
    __GEOHELPER_VERSION__: JSON.stringify(geohelperVersion),
  },
});
