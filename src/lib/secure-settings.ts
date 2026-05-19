import { getSettingsStore } from "./settings-persistence";

const GOOGLE_API_KEY = "googleApiKey";

export async function loadGoogleApiKey(): Promise<string> {
  try {
    const store = await getSettingsStore();
    const stored = await store.get<string>(GOOGLE_API_KEY);
    return stored ?? "";
  } catch {
    return "";
  }
}

export async function saveGoogleApiKey(apiKey: string): Promise<void> {
  try {
    const store = await getSettingsStore();
    const key = apiKey.trim();
    if (key) {
      await store.set(GOOGLE_API_KEY, key);
    } else {
      await store.delete(GOOGLE_API_KEY);
    }
    await store.save();
  } catch {
    return;
  }
}
