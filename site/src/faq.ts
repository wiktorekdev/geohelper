export const FAQ_ENTRIES = [
  {
    q: "Will I get banned?",
    a: "If you use it in ranked or online multiplayer, eventually yes. GeoHelper is built for solo play, custom maps and training. Read GeoGuessr's ToS.",
  },
  {
    q: "Does it work on Mac and Linux?",
    a: "Builds are produced for all three OSes, with separate macOS downloads for Apple Silicon and Intel Macs. On Arch-based distros like Arch Linux and CachyOS, use the Arch package instructions so the needed WebKitGTK dependencies are installed with the app. Your GeoGuessr Steam client still needs to expose CDP on localhost:9222 the same way it does on Windows.",
  },
  {
    q: "Why macOS shows a security warning",
    a: "Because the build is not code-signed with an Apple Developer ID. Right-click the app and pick Open once, or run xattr -dr com.apple.quarantine on it. After that it launches normally.",
  },
  {
    q: "Does it work with GeoGuessr in the browser?",
    a: "No. The browser version doesn't expose a CDP endpoint to the outside world the way the Steam client does with those launch flags. Steam only for now. A browser extension is on the roadmap.",
  },
] as const;
