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
  <img src="docs/screenshot.png" alt="GeoHelper next to GeoGuessr" />
</p>

## What this is

GeoHelper is a small desktop app (~6 MB) that sits next to GeoGuessr and tells you where the current Street View pano actually is. It works by reading the Chrome DevTools traffic the game already makes. No browser extension, no injected scripts, no automation inside the game.

It's meant for custom maps, solo play and learning. Don't use it in ranked matches.

## Getting started

1. Download `GeoHelper.exe` from [Releases](../../releases) and put it anywhere.
2. In Steam, right-click **GeoGuessr**, **Properties**, **Launch Options**, and paste:
   ```
   --remote-debugging-port=9222 --remote-allow-origins=*
   ```
3. Start GeoGuessr. Start GeoHelper. The dot next to the logo goes green once they see each other.

Works on Windows 10/11, recent Linux (GTK 3 + WebKitGTK 4.1) and macOS 11+.

## Build from source

Needs Node 20+ and a stable Rust toolchain.

```bash
npm install
npm run dev       # hot-reload
npm run build     # release
```

## How it works

GeoHelper connects to `localhost:9222`, the CDP endpoint GeoGuessr exposes when you pass those launch flags. It reads the Street View pano IDs off Google Maps RPC responses and asks the game's own `StreetViewService` to turn them back into coordinates. No servers, no external APIs beyond the ones the map and reverse-geocoder already need.

## Roadmap

- [ ] App overlay mode
- [ ] Chromium / Gecko browser extension
- [ ] Layout customizer

Open an issue if any of it matters to you.

## Support

If this is useful: [ko-fi.com/wiktorekdev](https://ko-fi.com/wiktorekdev)

## Disclaimer

Personal, educational project. Read [GeoGuessr's ToS](https://www.geoguessr.com/terms). Using helpers in ranked or online modes can get your account banned. Stick to custom maps and solo play.

[MIT](LICENSE)
