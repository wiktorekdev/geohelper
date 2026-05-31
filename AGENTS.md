# GeoHelper AI Agent Coordination & Codebase Guardrails (AGENTS.md)

This document is public and serves as the absolute technical specification and guardrails for any AI agent or developer modifying the GeoHelper codebase. Do not diverge from these specifications.

---

## 1. Remote Debugging & Network Specifications

### The Port Conflict Constraint (Port 34788)
- **Rule**: The default Chrome DevTools Protocol (CDP) port **MUST** remain exactly `34788`.
- **Rationale**: The standard Chromium port `9222` frequently collides with Brave, Chrome, VS Code, and other local developer tools. By reserving `34788`, we avoid connection hijacking where GeoHelper hooks into a browser instead of the GeoGuessr game process.
- **Guardrail**: Never reintroduce automatic port scanning or roll back the port to `9222` without explicit architecture review.

### The Origin Verification Constraint (`--remote-allow-origins=*`)
- **Rule**: Every connection instruction, UI helper, and document **MUST** require both flags together:
  ```
  --remote-debugging-port=34788 --remote-allow-origins=*
  ```
- **Rationale**: Chromium 115+ introduced strict WebSocket origin checks. Because GeoHelper is a Tauri desktop application running from a custom origin (or direct loopback HTTP clients), Chromium rejects connections with `403 Forbidden` or raw `WebSockets request was expected` plain-text headers unless `--remote-allow-origins=*` is explicitly set.
- **Guardrail**: If the backend detects a `400 Bad Request` or `WebSockets request was expected` plain-text body instead of a valid JSON target list from the port, it **MUST** map this to a specific `MissingAllowOrigins` error. The UI must intercept this to show a targeted "Launch Options missing remote-allow-origins" prompt rather than a generic connection error.

---

## 2. Changelog & Versioning Guardrails

### Caching Raw Changelog in AppData
- To keep the app-size lightweight and changelogs dynamic, **do not bake a static JSON changelog into the build**.
- The Rust backend is responsible for:
  1. Downloading the raw `CHANGELOG.md` file from `https://raw.githubusercontent.com/wiktorekdev/geohelper/main/CHANGELOG.md`.
  2. Saving it to the system AppData folder (`geohelper/changelog.cache`).
  3. Reading it and returning the raw string or parsed data structures to the frontend.
- This allows updates/announcements to propagate instantly to users without pushing a new AppData binary compile.

### Changelog Syntax & Categories
When adding release items in `CHANGELOG.md`, use exactly these categories under `## [Version] - YYYY-MM-DD`:
- `### Added` — for completely new UI widgets, languages, or features.
- `### Changed` — for structural adjustments, refactors, port shifts, or performance upgrades.
- `### Fixed` — for precise bugs, parsing errors, or crash prevention.

---

## 3. UI Aesthetics & Customization
- **Glassmorphism Theme**: Any notification popup or panel must follow the CSS glassmorphism theme (`backdrop-blur-md`, subtle HSL border matching the active theme, light/dark responsive opacity).
- **Badge Indicators**: If a new version is fetched and parsed from the AppData cache, the Bell button in the header **MUST** display an animated, pulsate-styled orange indicator (`bg-amber-500` or `bg-orange-500`).
