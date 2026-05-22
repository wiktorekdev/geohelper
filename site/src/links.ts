export const GITHUB_URL = "https://github.com/wiktorekdev/geohelper";
export const RELEASES_LATEST_URL = `${GITHUB_URL}/releases/latest`;
export const KOFI_URL = "https://ko-fi.com/wiktorekdev";
export const GITHUB_API_URL = "https://api.github.com/repos/wiktorekdev/geohelper/releases/latest";

export const DOWNLOAD_URLS = {
  windows: `${GITHUB_URL}/releases/latest/download/GeoHelper-windows-setup.exe`,
  macos: `${GITHUB_URL}/releases/latest/download/GeoHelper-macos.dmg`,
  linux: `${GITHUB_URL}/releases/latest/download/GeoHelper-linux.AppImage`,
  deb: `${GITHUB_URL}/releases/latest/download/GeoHelper-linux.deb`,
  rpm: `${GITHUB_URL}/releases/latest/download/GeoHelper-linux.rpm`,
  all: RELEASES_LATEST_URL,
} as const;

export const EXTERNAL_LINK_PROPS = {
  rel: "noreferrer",
} as const;
