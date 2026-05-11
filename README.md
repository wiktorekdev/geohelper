<div align="center">
  <img src="docs/logo.png" width="120" alt="GeoHelper" />

  <h1>GeoHelper</h1>
  <p>A tiny helper window that shows real coordinates while you play GeoGuessr on Steam.</p>

  <p>
    <a href="../../stargazers"><img src="https://img.shields.io/github/stars/wiktorekdev/geohelper?style=flat-square&color=f2b705" alt="Stars" /></a>
    <a href="../../releases/latest"><img src="https://img.shields.io/github/v/release/wiktorekdev/geohelper?style=flat-square&color=blue" alt="Latest release" /></a>
    <a href="../../releases"><img src="https://img.shields.io/github/downloads/wiktorekdev/geohelper/total?style=flat-square&color=success" alt="Downloads" /></a>
    <img src="https://img.shields.io/badge/platform-Windows%20%7C%20Linux%20%7C%20macOS-0078D6?style=flat-square" alt="Windows, Linux, macOS" />
    <a href="LICENSE"><img src="https://img.shields.io/github/license/wiktorekdev/geohelper?style=flat-square" alt="MIT" /></a>
  </p>
</div>

<p align="center">
  <img src="docs/screenshots/paris.png" alt="GeoHelper showing Paris" />
</p>

## What this is

GeoHelper (~6 MB) sits next to GeoGuessr and shows where the current Street View pano actually is — country, region, road, postcode, flag. It reads Chrome DevTools traffic the game already makes. No browser extension, no injected scripts, no automation.

Built for custom maps, solo play and learning. Don't use it in ranked.

## Getting started

1. Download from [Releases](../../releases/latest) and run it.
2. In Steam → right-click **GeoGuessr** → **Properties** → **Launch Options**, paste:
   ```
   --remote-debugging-port=9222 --remote-allow-origins=*
   ```
3. Start GeoGuessr, start GeoHelper. Dot goes green, coordinates appear.

Works on Windows 10/11, Linux (GTK 3 + WebKitGTK 4.1) and macOS 11+.

## Customize

Drag sections, change colors and font sizes per widget, hide what you don't need.

<p align="center">
  <img src="docs/screenshots/edit-mode.png" alt="GeoHelper layout editor" />
</p>

## Build from source

Needs Node 20+ and a stable Rust toolchain.

```bash
npm install
npm run dev       # hot-reload
npm run build     # release
```

## How it works

Connects to `localhost:9222` — the CDP endpoint GeoGuessr exposes with those launch flags. Reads Street View pano IDs from Google Maps RPC responses and resolves them back to coordinates through the game's own service. No external servers, no APIs beyond what the map already uses.

## Support

If this is useful: [ko-fi.com/wiktorekdev](https://ko-fi.com/wiktorekdev)

## Disclaimer

Personal, educational project. Read [GeoGuessr's ToS](https://www.geoguessr.com/terms). Using helpers in ranked or online modes can get your account banned. Stick to custom maps and solo play.

[MIT](LICENSE)
