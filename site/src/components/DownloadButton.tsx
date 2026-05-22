"use client";

import { useEffect, useRef, useState } from "react";
import { Apple, ChevronDown, Check, Download, Monitor, Terminal } from "lucide-react";
import { EXTERNAL_LINK_PROPS, GITHUB_API_URL, RELEASES_LATEST_URL } from "../links";

type OsId = "windows" | "macos" | "linux" | "desktop";

const OS_LABEL: Record<OsId, string> = {
  windows: "Windows",
  macos: "macOS",
  linux: "Linux",
  desktop: "Desktop app",
};

function detectOs(): OsId {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent.toLowerCase();
  if (/android|iphone|ipad|ipod|mobile|tablet/.test(ua)) return "desktop";
  if (ua.includes("mac")) return "macos";
  if (ua.includes("linux") || ua.includes("x11")) return "linux";
  return "windows";
}

type ReleaseAsset = {
  name: string;
  browser_download_url: string;
};

export default function DownloadButton() {
  const [os, setOs] = useState<OsId>("desktop");
  const [open, setOpen] = useState(false);
  const [assets, setAssets] = useState<ReleaseAsset[]>([]);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setOs(detectOs());
  }, []);

  useEffect(() => {
    fetch(GITHUB_API_URL)
      .then((res) => res.json())
      .then((data) => {
        setAssets(data.assets || []);
      })
      .catch(() => {
        setAssets([]);
      });
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onDoc);
    return () => window.removeEventListener("mousedown", onDoc);
  }, [open]);

  const Icon = os === "macos" ? Apple : os === "linux" ? Terminal : Monitor;

  const getDownloadUrl = (targetOs: OsId): string => {
    if (targetOs === "desktop") return RELEASES_LATEST_URL;

    const patterns = {
      windows: "windows-setup.exe",
      macos: "macos.dmg",
      linux: "linux.AppImage",
    };

    const pattern = patterns[targetOs];
    const asset = assets.find((a) => a.name.includes(pattern));
    return asset?.browser_download_url || RELEASES_LATEST_URL;
  };

  const href = getDownloadUrl(os);

  return (
    <div ref={ref} className="relative inline-flex overflow-visible rounded-lg">
      <a
        href={href}
        {...EXTERNAL_LINK_PROPS}
        className="inline-flex items-center gap-2 rounded-l-lg bg-white px-5 py-3 font-semibold text-black transition hover:bg-neutral-200"
      >
        <Download className="size-[18px]" />
        <span className="hidden sm:inline">
          {os === "desktop" ? "Download" : "Download for"}
        </span>
        <Icon className="size-[18px] sm:hidden" />
        <span>{OS_LABEL[os]}</span>
      </a>
      <button
        type="button"
        aria-label="Pick another platform"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex w-10 items-center justify-center rounded-r-lg border-l border-black/10 bg-white text-black transition hover:bg-neutral-200"
      >
        <ChevronDown className="size-4" />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-lg border border-white/10 bg-neutral-950/95 p-1 text-left text-sm shadow-xl shadow-black/50 backdrop-blur">
          {(["windows", "macos", "linux"] as OsId[]).map((id) => {
            const OsIcon = id === "macos" ? Apple : id === "linux" ? Terminal : Monitor;
            return (
              <button
                key={id}
                onClick={() => {
                  setOs(id);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-neutral-200 hover:bg-white/5"
              >
                <OsIcon className="size-4 text-neutral-400" />
                {OS_LABEL[id]}
                {os === id && <Check className="ml-auto size-3.5 text-red-400" />}
              </button>
            );
          })}
          <div className="mt-1 border-t border-white/10 pt-1">
            <a
              href={RELEASES_LATEST_URL}
              {...EXTERNAL_LINK_PROPS}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-neutral-400 hover:bg-white/5 hover:text-white"
            >
              All downloads
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
