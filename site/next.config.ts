import type { NextConfig } from "next";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const rootPackage = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf-8"),
) as { version: string };

const nextConfig: NextConfig = {
  output: "export",
  outputFileTracingRoot: resolve(__dirname, ".."),
  env: {
    GEOHELPER_VERSION: rootPackage.version,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
