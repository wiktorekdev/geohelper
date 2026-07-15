import packageJson from "../../package.json"

export const REPO = "wiktorekdev/geohelper"
export const GITHUB_URL = `https://github.com/${REPO}`
export const RELEASES_URL = `${GITHUB_URL}/releases`
export const LATEST_RELEASE_URL = `${RELEASES_URL}/latest`
export const KOFI_URL = "https://ko-fi.com/wiktorekdev"
export const VERSION = packageJson.version

export function compareVersions(a: string, b: string): number {
  const an = a
    .replace(/^v/, "")
    .split(".")
    .map((n) => parseInt(n, 10) || 0)
  const bn = b
    .replace(/^v/, "")
    .split(".")
    .map((n) => parseInt(n, 10) || 0)
  const len = Math.max(an.length, bn.length)
  for (let i = 0; i < len; i++) {
    const av = an[i] ?? 0
    const bv = bn[i] ?? 0
    if (av !== bv) return av - bv
  }
  return 0
}

export function isVersionInstalled(changelogVersion: string): boolean {
  return compareVersions(changelogVersion, VERSION) <= 0
}
