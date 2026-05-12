const CALLBACK = "__geohelperGmapsReady";

let loader: Promise<void> | null = null;

declare global {
  interface Window {
    __geohelperGmapsReady?: () => void;
  }
}

export function loadGoogleMaps(apiKey: string): Promise<void> {
  if (window.google?.maps) return Promise.resolve();
  if (loader) return loader;

  loader = new Promise<void>((resolve, reject) => {
    window.__geohelperGmapsReady = () => resolve();

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&v=weekly&callback=${CALLBACK}`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      loader = null;
      reject(new Error("failed to load Google Maps"));
    };
    document.head.appendChild(script);
  });

  return loader;
}
