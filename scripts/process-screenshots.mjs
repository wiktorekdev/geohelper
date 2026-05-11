import sharp from "sharp";
import { readFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dir = dirname(fileURLToPath(import.meta.url));
const root = join(__dir, "..");
const outDir = join(root, "docs", "screenshots");
mkdirSync(outDir, { recursive: true });

const RAWS = [
  { src: "raw-paris-gmaps.png",  name: "paris" },
  { src: "raw-krakow-gmaps.png", name: "krakow" },
  { src: "raw-tokyo-gmaps.png",  name: "tokyo" },
  { src: "raw-edit-mode.png",    name: "edit-mode" },
];

const RADIUS = 16;
const SHADOW_BLUR = 40;
const SHADOW_SPREAD = 2;

// Build a rounded-rect SVG mask
function roundedMask(w, h, r) {
  return Buffer.from(
    `<svg width="${w}" height="${h}"><rect x="0" y="0" width="${w}" height="${h}" rx="${r}" ry="${r}" fill="white"/></svg>`
  );
}

// Build a drop-shadow composite layer (dark semi-transparent blurred rect)
async function makeShadow(w, h) {
  const pad = SHADOW_BLUR + SHADOW_SPREAD;
  const totalW = w + pad * 2;
  const totalH = h + pad * 2;
  const rect = Buffer.from(
    `<svg width="${totalW}" height="${totalH}">
      <rect x="${pad}" y="${pad + 8}" width="${w}" height="${h}" rx="${RADIUS}" ry="${RADIUS}" fill="rgba(0,0,0,0.55)"/>
    </svg>`
  );
  return sharp(rect)
    .blur(SHADOW_BLUR / 3)
    .toBuffer();
}

async function processOne(srcFile, name) {
  const srcPath = join(root, srcFile);
  const img = sharp(srcPath);
  const meta = await img.metadata();
  const { width: W, height: H } = meta;

  // 1. Apply rounded corners mask
  const rounded = await sharp(srcPath)
    .composite([{ input: roundedMask(W, H, RADIUS), blend: "dest-in" }])
    .png()
    .toBuffer();

  // ── GitHub / README version ──────────────────────────────────────────────
  // Light neutral background (#f4f4f5), shadow, rounded corners
  const pad = SHADOW_BLUR + SHADOW_SPREAD;
  const canvasW = W + pad * 2;
  const canvasH = H + pad * 2;

  const shadow = await makeShadow(W, H);

  const githubBg = await sharp({
    create: { width: canvasW, height: canvasH, channels: 4, background: { r: 244, g: 244, b: 245, alpha: 1 } },
  })
    .composite([
      { input: shadow, left: 0, top: 0 },
      { input: rounded, left: pad, top: pad },
    ])
    .png()
    .toBuffer();

  await sharp(githubBg)
    .resize(Math.round(canvasW * 0.75))   // 75% — keeps it crisp but not huge
    .toFile(join(outDir, `${name}-github.png`));

  // ── Landing page version ─────────────────────────────────────────────────
  // Dark background with red glow matching the site palette
  const siteW = canvasW + 80;
  const siteH = canvasH + 80;

  // Red glow SVG overlay
  const glow = Buffer.from(
    `<svg width="${siteW}" height="${siteH}">
      <radialGradient id="g" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#ef4444" stop-opacity="0.18"/>
        <stop offset="100%" stop-color="#ef4444" stop-opacity="0"/>
      </radialGradient>
      <rect width="${siteW}" height="${siteH}" fill="url(#g)"/>
    </svg>`
  );

  const siteBg = await sharp({
    create: { width: siteW, height: siteH, channels: 4, background: { r: 10, g: 10, b: 10, alpha: 1 } },
  })
    .composite([
      { input: glow, left: 0, top: 0 },
      { input: shadow, left: 40, top: 40 },
      { input: rounded, left: 40 + pad, top: 40 + pad },
    ])
    .png()
    .toBuffer();

  await sharp(siteBg)
    .resize(Math.round(siteW * 0.75))
    .toFile(join(outDir, `${name}-site.png`));

  console.log(`✓ ${name}`);
}

for (const { src, name } of RAWS) {
  await processOne(src, name);
}

console.log(`\nDone → docs/screenshots/`);
