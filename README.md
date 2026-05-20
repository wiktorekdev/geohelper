<div align="center">
  <img src="docs/logo.png" width="120" alt="GeoHelper" />

  <h1>GeoHelper</h1>
  <p>A tiny helper window that shows real coordinates while you play GeoGuessr on Steam.</p>

  <p>
    <a href="../../stargazers"><img src="https://img.shields.io/github/stars/wiktorekdev/geohelper?style=flat-square&color=f2b705" alt="Stars" /></a>
    <a href="../../releases/latest"><img src="https://img.shields.io/github/v/release/wiktorekdev/geohelper?style=flat-square&color=blue" alt="Latest release" /></a>
    <a href="../../releases"><img src="https://img.shields.io/github/downloads/wiktorekdev/geohelper/total?style=flat-square&color=success" alt="Downloads" /></a>
    <img src="https://img.shields.io/badge/platform-Windows%20%7C%20Linux%20%7C%20macOS-0078D6?style=flat-square" alt="Windows, Linux, macOS" />
    <a href="https://ko-fi.com/wiktorekdev"><img src="https://img.shields.io/badge/Support-Buy%20me%20a%20coffee-FF5E5B?style=flat-square&logo=ko-fi&logoColor=white" alt="Donate" /></a>
    <a href="LICENSE"><img src="https://img.shields.io/github/license/wiktorekdev/geohelper?style=flat-square" alt="MIT" /></a>
  </p>
</div>

<p align="center">
  <img src="docs/screenshots/paris.png" alt="GeoHelper showing Paris" />
</p>

## What it is

GeoHelper is a tiny helper window that sits next to your Steam client and shows round details (country, region, road, postcode, flag) using Chrome DevTools Protocol (CDP) network traffic.

Because it just reads network requests the game already makes, you don't need any browser extensions, injected scripts, or automation. It’s built entirely for custom maps, solo training, and learning. (Please don't cheat in ranked).

## How it works

The app connects to the Chrome DevTools Protocol (CDP) endpoint exposed by Steam on `localhost:9222`. When a round starts, it grabs the panorama IDs from the game's incoming RPC network traffic and resolves them to coordinates. Everything is processed locally on your machine—there are no third-party servers, and no external API requests are made (except directly to map and geocoding providers).

## Getting started

1. Grab the latest build from [Releases](../../releases/latest) and run it.
2. In Steam, right-click **GeoGuessr** → **Properties** → **Launch Options**, and paste:
   ```
   --remote-debugging-port=9222
   ```
3. Start GeoGuessr, then open GeoHelper. Once the status indicator turns green, it’ll start showing details as soon as a round begins.

Works on Windows 10/11, Linux (GTK 3 + WebKitGTK 4.1), and macOS 11+.

## Customization

Click the pencil icon in the sidebar to toggle edit mode:

- **Drag-and-drop layout**: Move widgets (coordinates, country info, map panel) around to fit your screen.
- **Granular widget toggle**: Hide coordinates or map tiles if you want to practice purely with flags, languages, or currency.
- **Custom Themes**: Switch between built-in themes (Dark, Light, Sunset, Forest) or write your own styles in `themes.json` using CSS variables, gradients, blurs, and custom fonts.
- **Per-widget overrides**: Tweak background colors, font sizes, weights, and padding on individual widgets.

<p align="center">
  <img src="docs/screenshots/edit-mode.png" alt="GeoHelper layout editor" />
</p>

## Map & Geocoding Providers

Switch between map and reverse-geocoding sources in the settings panel:

| Feature | OpenStreetMap & CartoDB | Google Maps SDK |
| :--- | :--- | :--- |
| **Availability** | Out of the box (Default) | Requires personal API key |
| **Pricing** | Free | Uses Google Cloud free tier |
| **Styles / Views** | OSM standard, CartoDB Voyager, CartoDB Dark Matter | Roadmap, Dark Mode, Hybrid |
| **Geocoding** | Nominatim | Google Geocoding API |

## Build from source

Needs Node 20+ and a stable Rust toolchain.

```bash
npm install
npm run dev       # hot-reload
npm run build     # release
```

## Support

If this helper makes practicing more fun or saves you some coordinate lookups, feel free to buy me a coffee!

<p align="left">
  <a href="https://ko-fi.com/wiktorekdev">
    <img src="https://img.shields.io/badge/Donate-Buy%20me%20a%20coffee-FF5E5B?style=for-the-badge&logo=ko-fi&logoColor=white" alt="Donate" />
  </a>
</p>

## Disclaimer

Personal, educational project. Read [GeoGuessr's ToS](https://www.geoguessr.com/terms). Using helpers in ranked or online modes can get your account banned.

## License

This project is licensed under the [MIT License](LICENSE).
