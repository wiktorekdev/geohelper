<div align="center">
  <img src="docs/logo.png" width="120" alt="GeoHelper" />
  <h1>GeoHelper</h1>
  <p><strong>A beautiful & lightweight GeoGuessr Steam Helper</strong></p>
  <p>Live coordinates • Country • Region • Road • Postcode • Flag • Map preview</p>

  <p>
    <a href="../../stargazers"><img src="https://img.shields.io/github/stars/wiktorekdev/geohelper?style=flat-square&color=f2b705" alt="Stars" /></a>
    <a href="../../releases/latest"><img src="https://img.shields.io/github/v/release/wiktorekdev/geohelper?style=flat-square&color=blue" alt="Latest release" /></a>
    <a href="../../releases"><img src="https://img.shields.io/github/downloads/wiktorekdev/geohelper/total?style=flat-square&color=success" alt="Downloads" /></a>
    <img src="https://img.shields.io/badge/platform-Windows%20%7C%20Linux%20%7C%20macOS-0078D6?style=flat-square" alt="Platforms" />
    <a href="https://ko-fi.com/wiktorekdev"><img src="https://img.shields.io/badge/Support-Buy%20me%20a%20coffee-FF5E5B?style=flat-square&logo=ko-fi&logoColor=white" alt="Donate" /></a>
    <a href="LICENSE"><img src="https://img.shields.io/github/license/wiktorekdev/geohelper?style=flat-square" alt="MIT" /></a>
  </p>
</div>

<p align="center">
  <img src="docs/screenshots/paris.png" alt="GeoHelper showing Paris" />
</p>

## What is GeoHelper?

**GeoHelper** is a clean, customizable desktop helper for **GeoGuessr on Steam**.  
It shows live round information: coordinates, country, region, road, postcode, flag and map preview.

Perfect for **custom maps, singleplayer, solo practice and learning geography**.

### Key Features

- Beautiful draggable & resizable widgets with full layout customization
- Powerful custom theming system (JSON + CSS variables)
- Live coordinates and rich location data
- Map preview (OpenStreetMap default + Google Maps support)
- Very small size (~6MB) thanks to **Tauri**
- No injection, no DLLs, no browser extensions — uses Steam’s own Chrome DevTools Protocol (CDP)

## How it works

GeoHelper connects to the Chrome DevTools Protocol endpoint exposed by Steam (`--remote-debugging-port=9222`) and reads the game’s own network RPC traffic. Everything is processed locally on your machine.

## Getting Started

1. Download the latest release from [Releases](../../releases/latest)
2. Right-click **GeoGuessr** in Steam → Properties → Launch Options and add:
   ```
   --remote-debugging-port=9222
   ```
3. Run GeoHelper and start playing

**Supported platforms:** Windows 10/11, Linux, macOS 11+

### Linux dependencies

Ubuntu/Debian builds usually install the needed WebKitGTK dependencies automatically from the `.deb` package. On Arch-based distros such as Arch Linux and CachyOS, install the runtime dependencies first:

```bash
git clone https://github.com/wiktorekdev/geohelper.git
cd geohelper/packaging/arch
makepkg -si
```

If you prefer to run the AppImage or raw binary directly, install the runtime dependencies manually:

```bash
sudo pacman -S --needed webkit2gtk-4.1 libsoup3 gtk3 libayatana-appindicator
```

If you are building GeoHelper from source on Arch/CachyOS, install the full Tauri development dependency set:

```bash
sudo pacman -S --needed webkit2gtk-4.1 base-devel curl wget file openssl appmenu-gtk-module libappindicator-gtk3 librsvg xdotool
```

## Customization

Click the pencil icon to enter **Edit Mode**:

- Drag & drop widgets anywhere on screen
- Toggle and resize individual widgets
- Custom Themes (built-in + fully custom via `themes.json`)
- Per-widget styling (colors, fonts, padding, etc.)

<p align="center">
  <img src="docs/screenshots/edit-mode.png" alt="GeoHelper Edit Mode - Drag and Drop" />
</p>

## Map Providers

| Feature      | OpenStreetMap (Default) | Google Maps (Optional)   |
| ------------ | ----------------------- | ------------------------ |
| Availability | Built-in                | Requires API key         |
| Pricing      | Completely free         | Google Cloud free tier   |
| Styles       | Multiple CartoDB styles | Roadmap, Satellite, Dark |

## Build from Source

```bash
npm install
npm run dev          # development with hot reload
npm run build        # create release builds
```

## Support

If you enjoy the project and want to support further development:

<a href="https://ko-fi.com/wiktorekdev">
  <img src="https://img.shields.io/badge/Buy%20me%20a%20coffee-FF5E5B?style=for-the-badge&logo=ko-fi&logoColor=white" alt="Buy me a coffee" />
</a>

## Disclaimer

This is a **personal, educational practice tool**.  
Using helpers in ranked or competitive modes violates GeoGuessr’s Terms of Service and may result in a ban. Use responsibly.

## License

[MIT License](LICENSE)
