# Changelog

All notable changes to GeoHelper are kept here.

## [0.21.0] - 2026-06-15

### Added

- **German locale** - added a complete German translation and automatic detection for German Windows locales.
- **Automatic language selection** - language settings can now follow the system language when supported.

### Changed

- **Changelog UX refresh** - simplified the changelog sidebar with cleaner release headers, quieter category groups, and less decorative styling.

### Fixed

- **DevTools port validation lint** - removed a redundant Rust string conversion that failed Clippy with `-D warnings`.
- **Launch option diagnostics** - backend diagnostics now show both required Steam flags.

### Removed

- **Custom theme system** - removed the low-use custom `themes.json` system, its migration path, example file, and documentation. The reliable built-in Light/Dark selector remains.

---

## [0.20.0] - 2026-05-31

### Added

- **Added some easter eggs** 🫣
- **Changelog sidebar and update card** - added an in-app changelog view with release details and a compact update notification card.
- **Advanced text customization** - selected text can now use 20 bundled Google Fonts, numeric sizing, bold, italic, underline, custom colors, hidden state, and a saved rainbow text mode.
- **Marker customization upgrades** - marker fill, border, and size controls now support a wider size range with numeric input and cleaner responsive toolbar layout.
- **Selective reset dialog** - global reset now opens a confirmation dialog where users can choose whether to reset widget order, text styles, hidden text state, sidebar/map layout, and marker styling.
- **React Hot Toast notifications** - replaced Sonner with `react-hot-toast` and a compact dark top-center notification style.

### Changed

- **Layout editor responsiveness** - edit, text, and marker toolbars now wrap and stack more predictably on narrow windows, with marker customization appearing above text customization.
- **Sidebar resize handle** - replaced the visible dotted resize pill with a subtle edge-only resize target.
- **Flag customization rules** - country flags can still be resized, but font, color, bold, italic, underline, and rainbow styles no longer apply to flags.
- **Map toggle sizing** - restored the previous sidebar-width collapse behavior when hiding the map and removed the max-size logic that interfered with window resizing.
- **Simplified error recovery page** - replaced the multiple action options on the unexpected error boundary fallback screen with a single, clear "Reload" button.

### Fixed

- **Sidebar crash in customization mode** - restored the missing Motion import that caused `m is not defined` when opening customization.
- **Color swatch default** - the text color picker now reflects the current default foreground color instead of always showing white.
- **Number input spinners** - numeric text and marker size inputs no longer show browser spinner arrows.
- **Changelog detail overflow** - release detail cards use tighter spacing to avoid unnecessary scrollbars for short releases.

---

## [0.19.2] - 2026-05-30

### Changed

- **Remote debugging port changed to `34788`** — switched from the generic `9222` to a dedicated port that is far less likely to conflict with other Chromium-based apps (Brave, Chrome, VS Code, etc.). Update your Steam launch options to:
  ```
  --remote-debugging-port=34788 --remote-allow-origins=*
  ```
- **`--remote-allow-origins=*` is now required** — a recent GeoGuessr game update changed how Electron validates WebSocket origins. The flag must be present alongside the port flag or the game will reject the DevTools connection.
- **Updated documentation and landing page** — updated `README.md` and the marketing website (`site/`) to reflect the new `34788` port and origin validation flag instructions.
- **Developer sniffer script updated** — changed the local RPC sniffer tool port to `34788`.

### Fixed

- **Targeted error message for missing `--remote-allow-origins=*`** — when the game is running but the flag is absent, GeoHelper now shows a clear prompt to add the Steam launch option instead of the generic "Connection lost" message.

---

## [0.19.1] - 2026-05-27


### Added

- **Separate macOS builds** - release artifacts now distinguish Apple Silicon (`macos-aarch64`) from Intel (`macos-x86_64`) so users do not download an incompatible app.
- **Arch/CachyOS package template** - added an Arch package recipe that declares the WebKitGTK runtime dependencies needed by Tauri apps.
- **Smarter website downloads** - the website download menu now exposes Apple Silicon, Intel, AppImage, `.deb`, `.rpm`, and Arch/CachyOS options.

### Fixed

- **macOS updater manifest** - `latest.json` no longer points both `darwin-x86_64` and `darwin-aarch64` to the same app archive.
- **macOS release guard** - release CI now verifies the staged `.app` binary architecture before publishing macOS artifacts.
- **Static download metadata** - website structured data no longer references versionless release asset URLs that are not published.

## [0.19.0] - 2026-05-22

This release is mostly about making GeoHelper feel cleaner to use and easier to ship. The website got a real release-ready polish pass, app versions now come from one source, and layout editing is less jumpy.

### Added

- **Marker toolbar** - marker customization now opens from the layout edit toolbar as its own floating toolbar, matching the text customization workflow instead of relying on map marker clicks.
- **Marker color controls** - marker fill color, border color, and size are editable from the new marker toolbar with the app color picker and live preview behavior.
- **Website icons** - added favicon, Apple touch icon, and web manifest assets for the landing page.
- **Custom website 404** - added a branded not-found page instead of the default framework fallback.
- **Real release download links** - the website now points users directly to GitHub release download assets instead of generic placeholders.
- **Expanded locales** - added Spanish and Russian locale files.
- **Issue templates** - added GitHub issue templates for cleaner bug reports and feature requests.

### Changed

- **Versioning** - `package.json` is now the main app version source. Tauri reads from it, and the old sync script/CI sync step has been removed.
- **Version bump** - app and Rust crate metadata now target `0.19.0`.
- **Landing page SEO** - refreshed metadata, Open Graph image, social sharing tags, robots.txt, sitemap, and external link behavior.
- **Open Graph image** - replaced the old social preview with the new GeoHelper screenshot-based image.
- **External links** - website external links now open in a new tab with safe `rel` attributes.
- **Layout editor toolbars** - edit, marker, and text toolbars now stack predictably so they do not overlap each other.
- **Map toggle behavior** - hiding/showing the map no longer remounts the sidebar, so the sidebar does not visually refresh.
- **Hidden-map toolbar** - compact icon-only controls are used when the map is hidden so the toolbar fits the narrow sidebar layout.
- **Footer overlap** - the edit toolbar moves up in map-hidden mode so GitHub and Ko-fi footer icons stay reachable.
- **Text sizing animation** - switching selected text between S/M/L now transitions font size smoothly instead of snapping.
- **Color picker internals** - simplified the color picker to the hex-only behavior the app actually uses.

### Fixed

- **Marker settings overlap** - marker customization no longer covers the main edit toolbar or text selection toolbar.
- **Marker click UX** - removed marker-click customization, which was hard to discover and behaved differently between Google Maps and OSM.
- **Google marker parity** - Google Maps marker customization now uses the same toolbar flow as OSM.
- **Invalid marker styles** - persisted marker colors are normalized before being used, and marker size is clamped to the supported range.
- **Settings write churn** - marker and display style changes now debounce frequent store writes during dragging.
- **Error boundary chunk warning** - removed the mixed static/dynamic settings import that caused Vite chunking warnings.
- **State timing hacks** - cleaned up several zero-delay state sync paths in settings, map, validation, and color controls.
- **Sidebar remount on map toggle** - the sidebar stays mounted when showing or hiding the map.
- **Whitespace checks** - fixed the trailing blank line in `src/App.tsx`.

### Removed

- **Version sync script** - removed `scripts/sync-version.mjs` and the related package/CI command.
- **Marker pencil badge** - removed the edit pencil badge from the map marker to keep the marker clean.
- **Dead color picker exports** - removed unused alpha, output, format, and eyedropper color picker pieces.

## [0.18.0] - 2026-05-20

### Added

- **React Error Boundary Integration** — Upgraded custom error boundary to use `react-error-boundary` library for more robust error handling and recovery options.
- **Radix UI Toolbar Components** — Implemented `@radix-ui/react-toolbar` in edit and selection toolbars for improved keyboard navigation and accessibility.
- **Prettier Code Formatting** — Added Prettier with format script for consistent code style across the project.
- **Dynamic Geocoding User-Agent Compliance** — Implemented policy-compliant HTTP `User-Agent` headers (`GeoHelper/${VERSION}`) for the OSM Nominatim provider. This automatically references a dynamic compile-time version constant, eliminating the need to manually update geocoder strings on release.
- **Automatic Version Syncing** — Added build-time version synchronization script that automatically updates Tauri config and Cargo.toml from package.json during build.

### Changed

- **Bundle Size** — Minimal impact from library additions (react-error-boundary, @radix-ui/react-toolbar) and removal (react-resizable-panels). Main bundle remains approximately 1.5MB gzipped.
- **Robust Writability Checks for Portable Mode** — Enhanced Tauri backend `is_portable` check to verify folder write access before storing data in the application directory. If executed from a write-restricted directory (such as `C:\Program Files`), it safely falls back to standard local AppData storage instead of causing WebView2 startup crashes.
- **Resilient App Hydration Bootstrapping** — Converted settings and localization store initialization from `Promise.all` to `Promise.allSettled`. This guarantees that a single corrupted theme or preferences file will not halt the application startup or leave a black screen.

## [0.17.3] - 2026-05-20

### Fixed

- **CartoDB CSP Blocking** — Added CartoDB domain to Tauri's Content Security Policy to fix the black screen issue when using CartoDB Voyager or Dark Matter layers.

## [0.17.2] - 2026-05-20

### Fixed

- **Updater Loop** — `tauri.conf.json` was pinned to `0.17.0` while the crate was `0.17.1`, so installed builds reported themselves as `0.17.0` and re-prompted for the same update on every launch. All version sources are now in sync.

## [0.17.1] - 2026-05-20

### Added

- **Interactive Marker Customization** — Click on the map pin in layout customization mode to open a premium floating marker customization overlay.
- **Dynamic Marker Aesthetics** — Live custom marker styles supporting custom colors, custom borders, and dynamic sizing (16px to 48px), including a static blue edit pencil badge and a smooth hover scale transition to indicate clickability.
- **Embedded Popover Color Picker** — Replaced plain custom HEX inputs in the marker panel with an advanced popover-triggerable color picker (selection panel + hue slider) for precise color picking.
- **WebSocket Keepalives (Heartbeats)** — Added continuous Ping/Pong heartbeat frames with a 10-second idle detection loop in the Rust backend to prevent connections to GeoGuessr from dying silently.
- **Dynamic Debug Port Detection** — Added automatic fallback and retry scanning to dynamically locate active remote debugging ports when starting connection sequences.
- **Typed Command Error Propagation** — Rust backend Tauri commands now propagate structured, typed error diagnostics directly to the UI rather than failing silently or returning plain generic errors.

### Changed

- **Cached Store Persistence** — Globally caches JSON settings and theme store load tasks to completely eliminate redundant file reads and improve startup performance.

## [0.17.0] - 2026-05-19

### Added

- **Settings Auto-Recovery** — Safely detects and recovers from corrupted JSON settings/themes configuration files without locking up the app.
- **Custom Theme Documentation** — Added a detailed theme guide (`docs/themes.md`) explaining OKLCH color mappings, custom icons, and background gradients.
- **Theme Example Template** — Added a pre-configured `themes.examples.json` template file to the repository.

### Changed

- **Unified Settings Storage** — Migrated display configurations, language selections, and updater states from browser `localStorage` into a single, portable `settings.json` file.
- **Isolated Custom Themes** — Moved custom theme user profiles to `themes.json`, keeping them independent of core configuration.
- **Compact Theme Dropdown** — Refactored the theme picker styling to match the compact dimensions, padding, and layout of the language dropdown.
- **Unified Bun Workflows** — Completely removed `package-lock.json` and migrated all local and CI/CD pipelines (GitHub Actions) to build with Bun, improving CI build speeds by ~30 seconds.

### Removed

- **Unused Theme Presets** — Sunset and Forest built-in themes have been removed to keep the out-of-the-box appearance clean and focused.

## [0.16.0] - 2026-05-19

### Added

- **Localization** — English and Polish, with a language picker under Settings → Appearance.
- **Themes** — **Sunset** and **Forest** presets, plus a searchable theme picker. Your previous dark/light choice migrates automatically.
- **Map toggle** — show or hide the map from the sidebar header at any time (edit-toolbar control remains as well).

### Changed

- **Map hidden layout** — the sidebar fills the window instead of leaving empty space beside it; the width grip only appears while the map is visible.
- **Appearance** — Moon/Sun theme buttons replaced by the searchable picker above.
- **Color picker** — rebuilt for the layout editor: hex/RGB input, paste, and eyedropper where supported.
- **Connection status** — the last error stays visible while CDP retries; launch-flag detection reads the GeoGuessr process directly (no PowerShell) and distinguishes “not running” from “running without port 9222”.
- **Update banner** — refreshed layout and translated strings.

### Removed

- **Old color picker** — Replaced the legacy color picker component with the new UI color picker supporting direct hex/RGB input and custom color styling.

### Fixed

- Color picker no longer loops or crashes on open; reset returns white instead of black.
- Edit toolbar placement when the map is shown or hidden.
- A few small connection-status and window-resize tweaks.

## [0.15.0] - 2026-05-18

### Added

- **Per-element styling** — click any text in the sidebar to make it bold, change its size, pick a custom color, or hide it entirely.
- **Multi-select** — drag a marquee to select several elements at once, then style them together from the floating toolbar.
- **Section shortcuts** — select everything in a section, reset its look, or hide the whole section in one click.
- **Resizable sidebar** — in edit mode, drag the grip on the right edge to set your preferred width between 320px and 700px. The choice is saved across sessions.
- Clearer theme buttons with Moon and Sun icons.

### Improved

- **Smoother map toggle** — hiding the map no longer shrinks the sidebar, and the window resize waits for the animation to finish so nothing jumps.
- Toolbars move out of the way when the map is hidden so they do not overlap the footer buttons.
- Google Maps API key input shows a green border when valid and red when invalid — no more extra validation text.
- Selection toolbar adapts to what you have selected; for example, bold and color controls hide when only the flag is selected.

### Removed

- BigDataCloud geocoding provider.
- CartoDB (Dark, Light, Voyager), Esri Satellite, and OpenTopoMap map layers.
- Old section-style popover — replaced by the new click-to-select workflow.

### Fixed

- Flag keeps its rounded corners at the largest size.
- Window restores to the correct height when bringing the map back after hiding it.

## [0.14.2] - 2026-05-15

### Security

- Removed the unnecessary `--remote-allow-origins=*` launch option from the README, website, in-app setup hint, and backend diagnostics. GeoHelper only needs `--remote-debugging-port=9222`.
- Added strict validation for returned CDP WebSocket targets: GeoHelper now only accepts DevTools WebSocket URLs on loopback port `9222` with a normal `/devtools/` path.

### Upgrade note

- If you copied the old Steam launch options, remove `--remote-allow-origins=*` and leave only:
  ```
  --remote-debugging-port=9222
  ```

## [0.14.1] - 2026-05-15

### Changed

- **About → updates:** on an installed build, **Install & restart** now runs the same Tauri updater flow as the update banner (download, install, relaunch) instead of opening the GitHub release page. Portable builds still get a **Download v…** button that opens the release.
- While an update runs from About, the panel shows **download progress**, **installing**, and on failure **Try again** plus **Download manually**—matching the banner behaviour.

### Removed

- The decorative **“new”** badge next to the **Latest** version line in About.

## [0.14.0] - 2026-05-14

Chunky release: CDP integration with GeoGuessr was reworked, map and settings code reorganized, and the Google Maps API key moved out of the WebView’s `localStorage` into a small Tauri-backed store file (one-time migration on first launch if a key was already saved).

### Added

- Safer storage for the Maps API key via the Tauri Store plugin, with a one-time copy from the old `localStorage` value.
- Lazy-loaded map panel so the first screen loads a bit lighter.
- Settings split into clearer sections (about, look and feel, data sources); sidebar got small UX touches like a proper empty state and clearer connection/geocode feedback.
- ESLint flat config for the main `src/` tree.

### Changed

- CDP pipeline reworked end to end: better picking of the actual game tab, saner batching and limits when resolving Street View panos, clearer errors when debugging isn’t on or port 9222 is wrong..
- App state is split into Zustand slices, and the map/settings components use dedicated hooks so the UI logic is easier to follow.
- Geocoding and location display behaves more predictably.
- Tauri permissions are tighter: the app can only open the handful of URLs it needs (GitHub, Ko-fi, Google Cloud console, Maps).
- Couple bug fixes

## [0.13.1] - 2026-05-13

### Added

- Google Maps API key validation in settings after typing stops or the input loses focus.

### Changed

- Improved landing page metadata, sitemap freshness and FAQ structured data for search engines.

### Fixed

- CDP reconnect now interrupts an active connection instead of waiting for the socket to close.
- CDP response handling no longer stalls behind network event backpressure.
- Failed CDP sends now clean up pending response waiters.
- Google Maps markers appear correctly when the map script finishes loading after coordinates already exist.
- Google Maps reloads cleanly when the API key changes.
- Always-on-top setting rolls back if the native window call fails.
- Countries with plain `UTC` timezone data now show local time.

## [0.13.0] - 2026-05-11

### Added

- Layout editor (pencil icon in the sidebar header). Drag to reorder sections, per-section style options (visibility, size S/M/L, bold, custom color via picker), reset per section or all.
- Mock preview data (Paris) loads automatically when you enter edit mode without a GeoGuessr round active, so every section is visible to style.
- Hide-the-map toggle in the edit toolbar. Turning it off also skips all tile requests.
- Tooltips on header icons and quick actions.
- Toasts (Sonner) for "coordinates copied" and "layout reset" feedback.
- Global error screen: if the UI crashes, users see a friendly screen with Reload and "Reset layout & reload" options instead of a black window.

### Changed

- Coordinates card: two buttons now, branded Google Maps button replaces the plain link.
- Section rendering is data-driven from the layout config, so new widgets can be slotted in without touching the sidebar itself.

### Removed

- Street View shortcut. It froze or black-screened for a chunk of users, not worth keeping around.
- DevTools context menu in release builds (keeps inputs paste-friendly).

### Notes

- No changes to the CDP sniffer or updater signing — update path from 0.12.x is unchanged.
- Linux and macOS builds remain unsigned; macOS users still need to right-click → Open on first launch.

## [0.12.3] - 2026-05-10

- Added a Street View shortcut next to the Google Maps button.

## [0.12.2] - 2026-05-10

- Detect portable vs installed builds; portable users now get a manual-download banner instead of a broken installer run.

## [0.12.1] - 2026-05-10

- Fix the Windows updater artifact: Tauri 2 signs `setup.exe` directly, not a `.nsis.zip`.

## [0.12.0] - 2026-05-10

- Auto-updater (Ed25519 signed releases, Tauri updater plugin), manifest hosted as a release asset.

## [0.11.0] - 2026-05-10

- First multi-platform release: Windows, Linux, macOS.
