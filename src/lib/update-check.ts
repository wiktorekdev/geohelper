import { REPO, VERSION } from "./version";

export type UpdateInfo = {
  latest: string;
  publishedAt: string;
  url: string;
  hasUpdate: boolean;
  checkedAt: number;
};

type GitHubRelease = {
  tag_name?: unknown;
  published_at?: unknown;
  html_url?: unknown;
};

export type UpdateCheckResult =
  | { ok: true; info: UpdateInfo | null }
  | { ok: false; error: string };

export async function checkForUpdate(): Promise<UpdateCheckResult> {
  try {
    const res = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`, {
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!res.ok) return { ok: false, error: `GitHub returned HTTP ${res.status}` };

    const data = (await res.json()) as GitHubRelease;
    const latest = String(data.tag_name ?? "").replace(/^v/, "");
    if (!latest) return { ok: false, error: "Latest release has no tag" };

    return {
      ok: true,
      info: {
        latest,
        publishedAt: typeof data.published_at === "string" ? data.published_at : "",
        url: typeof data.html_url === "string" ? data.html_url : `https://github.com/${REPO}/releases`,
        hasUpdate: compareSemver(latest, VERSION) > 0,
        checkedAt: Date.now(),
      },
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Update check failed",
    };
  }
}

function compareSemver(a: string, b: string): number {
  const pa = parseSemver(a);
  const pb = parseSemver(b);

  for (const key of ["major", "minor", "patch"] as const) {
    if (pa[key] !== pb[key]) return pa[key] > pb[key] ? 1 : -1;
  }

  if (!pa.prerelease && pb.prerelease) return 1;
  if (pa.prerelease && !pb.prerelease) return -1;
  if (!pa.prerelease && !pb.prerelease) return 0;

  const aa = pa.prerelease!.split(".");
  const bb = pb.prerelease!.split(".");
  for (let i = 0; i < Math.max(aa.length, bb.length); i++) {
    const x = aa[i];
    const y = bb[i];
    if (x === undefined) return -1;
    if (y === undefined) return 1;
    if (x === y) continue;

    const xn = /^\d+$/.test(x) ? Number(x) : null;
    const yn = /^\d+$/.test(y) ? Number(y) : null;
    if (xn !== null && yn !== null) return xn > yn ? 1 : -1;
    if (xn !== null) return -1;
    if (yn !== null) return 1;
    return x > y ? 1 : -1;
  }

  return 0;
}

function parseSemver(version: string) {
  const match = version.match(/^v?(\d+)(?:\.(\d+))?(?:\.(\d+))?(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$/);
  return {
    major: Number(match?.[1] ?? 0),
    minor: Number(match?.[2] ?? 0),
    patch: Number(match?.[3] ?? 0),
    prerelease: match?.[4],
  };
}
