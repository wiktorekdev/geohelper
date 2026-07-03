// Generate site/public/og-image.png (1200x630) from the current logo + paris screenshot.
// Usage: node scripts/screenshots/og-image.mjs

import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import sharp from "sharp"

const __dir = dirname(fileURLToPath(import.meta.url))
const root = join(__dir, "../..")

const W = 1200
const H = 630

// Screenshot panel: right side, rounded, slight indigo border
const SHOT_W = 760
const SHOT_X = W - SHOT_W + 20 // bleed off the right edge a touch
const SHOT_Y = 35
const SHOT_H = H - 70
const SHOT_R = 16

const bg = `<svg width="${W}" height="${H}">
  <defs>
    <radialGradient id="glow" cx="20%" cy="15%" r="80%">
      <stop offset="0%" stop-color="#6366f1" stop-opacity="0.10"/>
      <stop offset="60%" stop-color="#09090b" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="#09090b"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
</svg>`

const text = `<svg width="${W}" height="${H}">
  <style>
    .title { font: 800 54px 'Segoe UI', system-ui, sans-serif; fill: #fafafa; letter-spacing: -1px; }
    .tag   { font: 600 26px 'Segoe UI', system-ui, sans-serif; fill: #a1a1aa; }
    .desc  { font: 400 24px 'Segoe UI', system-ui, sans-serif; fill: #d4d4d8; }
    .gh    { font: 400 19px 'Segoe UI', system-ui, sans-serif; fill: #a1a1aa; }
    .ghb   { font: 700 19px 'Segoe UI', system-ui, sans-serif; fill: #fafafa; }
  </style>
  <text x="46" y="185" class="title">GeoHelper</text>
  <text x="46" y="240" class="tag">GeoGuessr Steam helper</text>
  <text x="46" y="315" class="desc">Live coordinates, location details,</text>
  <text x="46" y="350" class="desc">and map preview.</text>
  <rect x="46" y="390" width="96" height="4" rx="2" fill="#6366f1"/>
  <text x="46" y="465" class="gh">github.com/<tspan class="ghb">wiktorekdev/geohelper</tspan></text>
</svg>`

const frame = `<svg width="${SHOT_W}" height="${SHOT_H}">
  <rect x="1" y="1" width="${SHOT_W - 2}" height="${SHOT_H - 2}" rx="${SHOT_R}"
        fill="none" stroke="#6366f1" stroke-opacity="0.55" stroke-width="2"/>
</svg>`

const mask = Buffer.from(
  `<svg width="${SHOT_W}" height="${SHOT_H}"><rect width="${SHOT_W}" height="${SHOT_H}" rx="${SHOT_R}" fill="white"/></svg>`
)

async function main() {
  const shot = await sharp(join(root, "docs/screenshots/paris.png"))
    .resize(SHOT_W, SHOT_H, { fit: "cover", position: "left top" })
    .composite([{ input: mask, blend: "dest-in" }])
    .png()
    .toBuffer()

  const shotFramed = await sharp(shot)
    .composite([{ input: Buffer.from(frame) }])
    .png()
    .toBuffer()

  const logo = await sharp(join(root, "docs/logo.png")).resize(96, 96).png().toBuffer()

  await sharp(Buffer.from(bg))
    .composite([
      { input: shotFramed, left: SHOT_X, top: SHOT_Y },
      { input: logo, left: 42, top: 52 },
      { input: Buffer.from(text) },
    ])
    .png({ compressionLevel: 9 })
    .toFile(join(root, "site/public/og-image.png"))

  console.log("✓ og-image")
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
