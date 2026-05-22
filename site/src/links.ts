export const GITHUB_URL = "https://github.com/wiktorekdev/geohelper";
export const RELEASES_LATEST_URL = `${GITHUB_URL}/releases/latest`;
export const KOFI_URL = "https://ko-fi.com/wiktorekdev";
export const GEOHELPER_VERSION = process.env.GEOHELPER_VERSION ?? "0.0.0";

const latestDownloadUrl = (assetName: string) =>
  `${GITHUB_URL}/releases/latest/download/${assetName}`;

export const DOWNLOAD_URLS = {
  windows: latestDownloadUrl(`GeoHelper-${GEOHELPER_VERSION}-windows-setup.exe`),
  macos: latestDownloadUrl(`GeoHelper-${GEOHELPER_VERSION}-macos.dmg`),
  linux: latestDownloadUrl(`GeoHelper-${GEOHELPER_VERSION}-linux.AppImage`),
  deb: latestDownloadUrl(`GeoHelper-${GEOHELPER_VERSION}-linux.deb`),
  rpm: latestDownloadUrl(`GeoHelper-${GEOHELPER_VERSION}-linux.rpm`),
  all: RELEASES_LATEST_URL,
} as const;

export const EXTERNAL_LINK_PROPS = {
  target: "_blank",
  rel: "noreferrer",
} as const;
