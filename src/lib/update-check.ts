import { check, type Update } from "@tauri-apps/plugin-updater";

import { errorMessage } from "./errors";
import { REPO } from "./links";
import { t } from "@/lib/i18n";

export type UpdateInfo = {
  latest: string;
  publishedAt: string;
  url: string;
  hasUpdate: boolean;
  checkedAt: number;
};

export type UpdateCheckResult =
  | { ok: true; info: UpdateInfo | null; handle: Update | null }
  | { ok: false; error: string };

export async function checkForUpdate(): Promise<UpdateCheckResult> {
  try {
    const update = await check();

    if (!update) {
      return { ok: true, info: null, handle: null };
    }

    return {
      ok: true,
      info: {
        latest: update.version,
        publishedAt: update.date ?? "",
        url: `https://github.com/${REPO}/releases/tag/v${update.version}`,
        hasUpdate: true,
        checkedAt: Date.now(),
      },
      handle: update,
    };
  } catch (e) {
    return {
      ok: false,
      error: errorMessage(e, t("update.checkFailed")),
    };
  }
}
