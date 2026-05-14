import { Store } from "@tauri-apps/plugin-store";

const STORE_PATH = "settings.json";
const GOOGLE_API_KEY = "googleApiKey";
const LEGACY_GOOGLE_API_KEY = "geohelper.googleApiKey";

let storePromise: Promise<Store> | null = null;

function getStore() {
  storePromise ??= Store.load(STORE_PATH, { defaults: {}, autoSave: true });
  return storePromise;
}

function readLegacyGoogleApiKey(): string {
  try {
    return localStorage.getItem(LEGACY_GOOGLE_API_KEY) ?? "";
  } catch {
    return "";
  }
}

function clearLegacyGoogleApiKey() {
  try {
    localStorage.removeItem(LEGACY_GOOGLE_API_KEY);
  } catch {
    return;
  }
}

export async function loadGoogleApiKey(): Promise<string> {
  try {
    const store = await getStore();
    const stored = await store.get<string>(GOOGLE_API_KEY);
    if (typeof stored === "string") {
      clearLegacyGoogleApiKey();
      return stored;
    }

    const legacy = readLegacyGoogleApiKey().trim();
    if (legacy) {
      await store.set(GOOGLE_API_KEY, legacy);
      clearLegacyGoogleApiKey();
      return legacy;
    }
  } catch {
    return readLegacyGoogleApiKey().trim();
  }

  clearLegacyGoogleApiKey();
  return "";
}

export async function saveGoogleApiKey(apiKey: string): Promise<void> {
  try {
    const store = await getStore();
    const key = apiKey.trim();
    if (key) {
      await store.set(GOOGLE_API_KEY, key);
    } else {
      await store.delete(GOOGLE_API_KEY);
    }
    clearLegacyGoogleApiKey();
  } catch {
    return;
  }
}
