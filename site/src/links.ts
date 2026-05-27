export const GITHUB_URL = "https://github.com/wiktorekdev/geohelper";
export const RELEASES_LATEST_URL = `${GITHUB_URL}/releases/latest`;
export const KOFI_URL = "https://ko-fi.com/wiktorekdev";
export const GITHUB_API_URL = "https://api.github.com/repos/wiktorekdev/geohelper/releases/latest";
export const ARCH_PACKAGE_URL = `${GITHUB_URL}/tree/main/packaging/arch`;

export const DOWNLOAD_URLS = {
  windows: RELEASES_LATEST_URL,
  macosAppleSilicon: RELEASES_LATEST_URL,
  macosIntel: RELEASES_LATEST_URL,
  linux: RELEASES_LATEST_URL,
  deb: RELEASES_LATEST_URL,
  rpm: RELEASES_LATEST_URL,
  arch: ARCH_PACKAGE_URL,
  all: RELEASES_LATEST_URL,
} as const;

export const EXTERNAL_LINK_PROPS = {
  rel: "noreferrer",
} as const;
