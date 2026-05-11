// Take the raw Playwright captures and only apply rounded corners — no
// padding, no backgrounds, no shadows. Keeps the image content-only so
// README/site can style it in context.

import sharp from "sharp";
import { mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dir = dirname(fileURLToPath(import.meta.url));
const root = join(__dir, "..");
const outDir = join(root, "docs", "screenshots");
mkdirSync(outDir, { recursive: true });

const RAWS = [
  { src: "raw-paris.png",  name: "paris" },
  { src: "raw-krakow.png", name: "krakow" },
  { src: "raw-tokyo.png",  name: "tokyo" },
  { src: "raw-edit.png",   name: "edit-mode" },
];

const RADIUS = 12;

function roundedMask(w, h, r) {
  return Buffer.from(
    `<svg width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${r}" ry="${r}" fill="white"/></svg>`,
  );
}

async function processOne(srcFile, name) {
  const srcPath = join(root, srcFile);
  const { width: W, height: H } = await sharp(srcPath).metadata();

  await sharp(srcPath)
    .composite([{ input: roundedMask(W, H, RADIUS), blend: "dest-in" }])
    .png({ compressionLevel: 9 })
    .toFile(join(outDir, `${name}.png`));

  console.log(`✓ ${name}`);
}

for (const { src, name } of RAWS) {
  await processOne(src, name);
}

console.log(`\nDone → docs/screenshots/`);
