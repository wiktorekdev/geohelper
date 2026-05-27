"use client";

import { useEffect, useRef, useState } from "react";
import {
  Apple,
  ChevronDown,
  Check,
  Download,
  Monitor,
  Package,
  Terminal,
  type LucideIcon,
} from "lucide-react";
import {
  ARCH_PACKAGE_URL,
  EXTERNAL_LINK_PROPS,
  GITHUB_API_URL,
  RELEASES_LATEST_URL,
} from "../links";

type TargetId =
  | "windows"
  | "macos"
  | "macos-aarch64"
  | "macos-x86_64"
  | "linux-appimage"
  | "linux-deb"
  | "linux-rpm"
  | "linux-arch"
  | "desktop";

type Target = {
  id: TargetId;
  label: string;
  menuLabel: string;
  assetPattern?: string;
  href?: string;
  icon: LucideIcon;
};

const TARGETS: Target[] = [
  {
    id: "windows",
    label: "Windows",
    menuLabel: "Windows installer",
    assetPattern: "windows-setup.exe",
    icon: Monitor,
  },
  {
    id: "macos",
    label: "macOS",
    menuLabel: "macOS downloads",
    href: RELEASES_LATEST_URL,
    icon: Apple,
  },
  {
    id: "macos-aarch64",
    label: "macOS Apple Silicon",
    menuLabel: "macOS Apple Silicon",
    assetPattern: "macos-aarch64.dmg",
    icon: Apple,
  },
  {
    id: "macos-x86_64",
    label: "macOS Intel",
    menuLabel: "macOS Intel",
    assetPattern: "macos-x86_64.dmg",
    icon: Apple,
  },
  {
    id: "linux-appimage",
    label: "Linux AppImage",
    menuLabel: "Linux AppImage",
    assetPattern: "linux.AppImage",
    icon: Terminal,
  },
  {
    id: "linux-deb",
    label: "Debian/Ubuntu",
    menuLabel: "Debian/Ubuntu .deb",
    assetPattern: "linux.deb",
    icon: Package,
  },
  {
    id: "linux-rpm",
    label: "Fedora/RHEL",
    menuLabel: "Fedora/RHEL .rpm",
    assetPattern: "linux.rpm",
    icon: Package,
  },
  {
    id: "linux-arch",
    label: "Arch/CachyOS",
    menuLabel: "Arch/CachyOS package",
    href: ARCH_PACKAGE_URL,
    icon: Package,
  },
  {
    id: "desktop",
    label: "Desktop app",
    menuLabel: "All downloads",
    href: RELEASES_LATEST_URL,
    icon: Download,
  },
];

const TARGET_BY_ID = Object.fromEntries(TARGETS.map((target) => [target.id, target])) as Record<
  TargetId,
  Target
>;

function detectByUserAgent(): TargetId {
  if (typeof navigator === "undefined") return "desktop";

  const ua = navigator.userAgent.toLowerCase();
  if (/android|iphone|ipad|ipod|mobile|tablet/.test(ua)) return "desktop";
  if (ua.includes("mac")) return "macos";
  if (ua.includes("linux") || ua.includes("x11")) return "linux-appimage";
  return "windows";
}

async function detectTarget(): Promise<TargetId> {
  const fallback = detectByUserAgent();
  const nav = navigator as Navigator & {
    userAgentData?: {
      platform?: string;
      getHighEntropyValues?: (hints: string[]) => Promise<{
        architecture?: string;
        platform?: string;
      }>;
    };
  };

  if (!nav.userAgentData?.getHighEntropyValues) return fallback;

  try {
    const hints = await nav.userAgentData.getHighEntropyValues(["architecture", "platform"]);
    const platform = (hints.platform || nav.userAgentData.platform || "").toLowerCase();
    const architecture = (hints.architecture || "").toLowerCase();

    if (platform.includes("mac")) {
      if (architecture === "x86" || architecture === "x86_64") return "macos-x86_64";
      if (architecture === "arm" || architecture === "arm64" || architecture === "aarch64") {
        return "macos-aarch64";
      }
    }
  } catch {
    return fallback;
  }

  return fallback;
}

type ReleaseAsset = {
  name: string;
  browser_download_url: string;
};

export default function DownloadButton() {
  const [targetId, setTargetId] = useState<TargetId>("desktop");
  const [open, setOpen] = useState(false);
  const [assets, setAssets] = useState<ReleaseAsset[]>([]);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    detectTarget().then(setTargetId);
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

  const getDownloadUrl = (target: Target): string => {
    if (target.href) return target.href;
    if (!target.assetPattern) return RELEASES_LATEST_URL;

    const asset = assets.find((a) => a.name.includes(target.assetPattern || ""));
    return asset?.browser_download_url || RELEASES_LATEST_URL;
  };

  const selected = TARGET_BY_ID[targetId];
  const Icon = selected.icon;
  const href = getDownloadUrl(selected);

  return (
    <div ref={ref} className="relative inline-flex overflow-visible rounded-lg">
      <a
        href={href}
        {...EXTERNAL_LINK_PROPS}
        className="inline-flex items-center gap-2 rounded-l-lg bg-white px-5 py-3 font-semibold text-black transition hover:bg-neutral-200"
      >
        <Download className="size-[18px]" />
        <span className="hidden sm:inline">
          {targetId === "desktop" ? "Download" : "Download for"}
        </span>
        <Icon className="size-[18px] sm:hidden" />
        <span>{selected.label}</span>
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
        <div className="absolute left-0 right-0 top-full z-50 mt-2 min-w-64 rounded-lg border border-white/10 bg-neutral-950/95 p-1 text-left text-sm shadow-xl shadow-black/50 backdrop-blur">
          {TARGETS.filter((target) => target.id !== "desktop").map((target) => {
            const TargetIcon = target.icon;
            return (
              <button
                key={target.id}
                onClick={() => {
                  setTargetId(target.id);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-neutral-200 hover:bg-white/5"
              >
                <TargetIcon className="size-4 text-neutral-400" />
                {target.menuLabel}
                {targetId === target.id && <Check className="ml-auto size-3.5 text-red-400" />}
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
