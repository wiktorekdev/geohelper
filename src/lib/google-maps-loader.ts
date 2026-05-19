import { t } from "@/lib/i18n";

const CALLBACK = "__geohelperGmapsReady";

let loader: Promise<void> | null = null;
let loaderKey = "";

declare global {
  interface Window {
    __geohelperGmapsReady?: () => void;
  }
}

export function loadGoogleMaps(apiKey: string): Promise<void> {
  const key = apiKey.trim();
  if (!key) return Promise.reject(new Error(t("validation.required")));
  if (window.google?.maps && loaderKey === key) return Promise.resolve();
  if (loader && loaderKey === key) return loader;

  if (window.google?.maps && loaderKey !== key) {
    Reflect.deleteProperty(window, "google");
  }

  loader = null;
  loaderKey = key;

  loader = new Promise<void>((resolve, reject) => {
    window.__geohelperGmapsReady = () => {
      Reflect.deleteProperty(window, CALLBACK);
      resolve();
    };

    document.querySelectorAll<HTMLScriptElement>("script[data-geohelper-gmaps]").forEach((s) => {
      s.remove();
    });

    const script = document.createElement("script");
    script.dataset.geohelperGmaps = "true";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&v=weekly&callback=${CALLBACK}`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      loader = null;
      loaderKey = "";
      Reflect.deleteProperty(window, CALLBACK);
      reject(new Error(t("map.loadFailed")));
    };
    document.head.appendChild(script);
  });

  return loader;
}
