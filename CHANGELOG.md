# Changelog

All notable changes to GeoHelper are kept here.

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

## [0.13.0] — 2026-05-11

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

## [0.12.3] — 2026-05-10

- Added a Street View shortcut next to the Google Maps button.

## [0.12.2] — 2026-05-10

- Detect portable vs installed builds; portable users now get a manual-download banner instead of a broken installer run.

## [0.12.1] — 2026-05-10

- Fix the Windows updater artifact: Tauri 2 signs `setup.exe` directly, not a `.nsis.zip`.

## [0.12.0] — 2026-05-10

- Auto-updater (Ed25519 signed releases, Tauri updater plugin), manifest hosted as a release asset.

## [0.11.0] — 2026-05-10

- First multi-platform release: Windows, Linux, macOS.
