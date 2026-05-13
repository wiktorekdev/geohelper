# Changelog

All notable changes to GeoHelper are kept here.

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
