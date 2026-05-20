// Capture README screenshots via Vite dev + window.__geohelper__.
// Usage: npm run vite:dev (or let this script start it) then node scripts/screenshots/capture.mjs

import { spawn } from "node:child_process";
import { chromium } from "playwright";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync, existsSync } from "node:fs";
import { mkdirSync } from "node:fs";
import sharp from "sharp";
import { SCENES } from "./scenes.mjs";

const __dir = dirname(fileURLToPath(import.meta.url));
const root = join(__dir, "../..");

function getGoogleMapsApiKey() {
  if (process.env.GOOGLE_MAPS_API_KEY) {
    return process.env.GOOGLE_MAPS_API_KEY.trim();
  }
  const envPath = join(root, ".env");
  if (existsSync(envPath)) {
    try {
      const content = readFileSync(envPath, "utf-8");
      const lines = content.split(/\r?\n/);
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("GOOGLE_MAPS_API_KEY=")) {
          const key = trimmed.substring("GOOGLE_MAPS_API_KEY=".length);
          return key.replace(/['"]/g, "").trim();
        }
      }
    } catch {
      // ignore
    }
  }
  return "";
}
const URL = "http://localhost:1420";
const VIEWPORT = { width: 1280, height: 820 };
const RADIUS = 12;
const outDir = join(root, "docs", "screenshots");
mkdirSync(outDir, { recursive: true });

function roundedMask(w, h, r) {
  return Buffer.from(
    `<svg width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${r}" ry="${r}" fill="white"/></svg>`
  );
}

/** Only the shots used in README / site hero essentials */
const CAPTURE_KEYS = ["paris", "edit"];

function waitForServer(maxMs = 60_000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const tick = async () => {
      try {
        const res = await fetch(URL);
        if (res.ok) return resolve();
      } catch {
        /* retry */
      }
      if (Date.now() - start > maxMs) {
        reject(new Error(`Timed out waiting for ${URL}`));
        return;
      }
      setTimeout(tick, 400);
    };
    tick();
  });
}

function startVite() {
  const child = spawn("npm", ["run", "vite:dev"], {
    cwd: root,
    shell: true,
    stdio: "ignore",
    env: { ...process.env, BROWSER: "none" },
  });
  return child;
}

async function applyScene(page, scene, apiKey) {
  await page.evaluate(([cfg, key]) => {
    const gh = window.__geohelper__;
    if (!gh) throw new Error("__geohelper__ missing — run Vite in dev mode");

    const store = gh.store.getState();
    const display = gh.displayStore.getState();

    store.clearLocation();
    store.setConn({ kind: "connected" });
    store.setGeocodeError(null);
    store.setLocationLoading(false);

    // Use Google Maps with the provided API key for high-quality screenshots
    if (key) {
      store.setGoogleApiKey(key);
      store.setMapProvider("google-roadmap");
    }

    if (display.editing) display.stopEditing();
    if (!display.mapVisible) display.setMapVisible(true);

    if (cfg.mock) {
      const { coords, place, country } = cfg.mock;
      store.pushCoords({ ...coords, timestamp: Date.now() });
      store.setPlace(place);
      store.setCountryDetails(country);
    }

    if (cfg.edit) {
      if (!gh.store.getState().current) {
        store.pushCoords({
          lat: 48.8566,
          lng: 2.3522,
          source: "mock",
          timestamp: Date.now(),
        });
        store.setPlace({
          country: "France",
          countryCode: "fr",
          region: "Île-de-France",
          city: "Paris",
          neighbourhood: "4th Arrondissement",
          road: "Rue de Rivoli",
          postcode: "75004",
          continent: "Europe",
        });
        store.setCountryDetails({
          capital: "Paris",
          subregion: "Western Europe",
          languages: ["French"],
          currency: "EUR (€)",
          callingCode: "+33",
          timezones: ["UTC+01:00"],
        });
      }
      if (!gh.displayStore.getState().editing) {
        gh.displayStore.getState().toggleEditing();
      }
    }

    if (cfg.settings) {
      store.openSettings();
    }
  }, [scene, apiKey]);
}

async function main() {
  const ownVite = !process.env.SCREENSHOT_VITE_EXTERNAL;
  let vite;
  if (ownVite) {
    vite = startVite();
    await waitForServer();
  } else {
    await waitForServer();
  }

  const apiKey = getGoogleMapsApiKey();
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: VIEWPORT });

  try {
    for (const key of CAPTURE_KEYS) {
      const scene = SCENES[key];
      if (!scene) throw new Error(`Unknown scene: ${key}`);

      await page.goto(URL, { waitUntil: "networkidle" });
      await page.waitForFunction(() => window.__geohelper__);
      await applyScene(page, scene, apiKey);

      // Let map tiles and layout animations settle
      await page.waitForTimeout(2500);

      const buffer = await page.screenshot({ type: "png" });
      const { width: W, height: H } = await sharp(buffer).metadata();

      await sharp(buffer)
        .composite([{ input: roundedMask(W, H, RADIUS), blend: "dest-in" }])
        .png({ compressionLevel: 9 })
        .toFile(join(outDir, `${scene.file}.png`));

      console.log(`✓ ${scene.file}`);
    }
  } finally {
    await browser.close();
    if (vite) vite.kill("SIGTERM");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
