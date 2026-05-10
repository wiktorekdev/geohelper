import { useEffect, useRef, useState } from "react";
import {
  Apple,
  Box,
  Check,
  ChevronDown,
  Code2,
  Copy,
  Download,
  Github,
  KeyRound,
  MapPin,
  Monitor,
  Shield,
  Terminal,
  Zap,
} from "lucide-react";

import logoUrl from "./assets/logo.png";
import screenshotUrl from "./assets/screenshot.png";
import { GITHUB_URL, KOFI_URL, RELEASES_LATEST_URL } from "./links";

type OsId = "windows" | "macos" | "linux";

const OS_LABEL: Record<OsId, string> = {
  windows: "Windows",
  macos: "macOS",
  linux: "Linux",
};

function detectOs(): OsId {
  if (typeof navigator === "undefined") return "windows";
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("mac")) return "macos";
  if (ua.includes("linux") || ua.includes("x11")) return "linux";
  return "windows";
}

export default function App() {
  return (
    <div className="relative">
      <div className="absolute inset-x-0 top-0 h-[800px] grid-bg pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-[800px] pointer-events-none bg-[radial-gradient(ellipse_60%_40%_at_50%_-10%,rgba(239,68,68,0.18),transparent_70%)]" />
      <Nav />
      <Hero />
      <Screenshot />
      <Features />
      <HowItWorks />
      <GetStarted />
      <Faq />
      <Footer />
    </div>
  );
}

function Nav() {
  return (
    <header className="relative max-w-6xl mx-auto flex items-center justify-between px-6 pt-6">
      <a href="#top" className="flex items-center gap-2.5">
        <img src={logoUrl} alt="" className="h-8 w-8" />
        <span className="font-semibold tracking-tight text-white">GeoHelper</span>
      </a>
      <nav className="flex items-center gap-1 text-sm">
        <NavLink href="#features">Features</NavLink>
        <NavLink href="#get-started">Get started</NavLink>
        <NavLink href={GITHUB_URL}>GitHub</NavLink>
        <a
          href={RELEASES_LATEST_URL}
          className="ml-2 inline-flex items-center gap-2 px-4 py-1.5 rounded-md bg-white text-black font-medium hover:bg-neutral-200 transition"
        >
          Download
        </a>
      </nav>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="px-3 py-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-white/5 transition"
    >
      {children}
    </a>
  );
}

function Hero() {
  return (
    <section className="relative max-w-4xl mx-auto text-center pt-20 pb-14 px-6" id="top">
      <img src={logoUrl} alt="" className="mx-auto h-24 w-24 mb-8 logo-float" />

      <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-white leading-[1.05]">
        Live coordinates for{" "}
        <span className="bg-gradient-to-br from-red-400 to-red-600 bg-clip-text text-transparent">
          GeoGuessr
        </span>
        .
      </h1>

      <p className="mt-6 max-w-xl mx-auto text-lg text-neutral-400 leading-relaxed">
        A tiny desktop helper that reads GeoGuessr's own traffic and tells you where the current
        Street View actually is. No browser extension, no scripts inside the game.
      </p>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <DownloadButton />
        <a
          href={GITHUB_URL}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-white/10 hover:bg-white/5 transition text-white"
        >
          <Github className="h-[18px] w-[18px]" />
          Source on GitHub
        </a>
      </div>

      <p className="mt-6 text-xs text-neutral-500 font-mono">
        MIT · around 6 MB · no installer required
      </p>
    </section>
  );
}

function DownloadButton() {
  const [os, setOs] = useState<OsId>(() => detectOs());
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onDoc);
    return () => window.removeEventListener("mousedown", onDoc);
  }, [open]);

  const Icon = os === "macos" ? Apple : os === "linux" ? Terminal : Monitor;

  return (
    <div ref={ref} className="relative inline-flex rounded-lg overflow-visible">
      <a
        href={RELEASES_LATEST_URL}
        className="inline-flex items-center gap-2 px-5 py-3 rounded-l-lg bg-white text-black font-semibold hover:bg-neutral-200 transition"
      >
        <Download className="h-[18px] w-[18px]" />
        <span className="hidden sm:inline">Download for</span>
        <Icon className="h-[18px] w-[18px] sm:hidden" />
        <span>{OS_LABEL[os]}</span>
      </a>
      <button
        type="button"
        aria-label="Pick another platform"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center justify-center w-10 rounded-r-lg bg-white text-black border-l border-black/10 hover:bg-neutral-200 transition"
      >
        <ChevronDown className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full mt-2 rounded-lg border border-white/10 bg-neutral-950/95 backdrop-blur p-1 text-left text-sm shadow-xl shadow-black/50 z-10">
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
                <OsIcon className="h-4 w-4 text-neutral-400" />
                {OS_LABEL[id]}
                {os === id && <Check className="ml-auto h-3.5 w-3.5 text-red-400" />}
              </button>
            );
          })}
          <div className="mt-1 border-t border-white/10 pt-1">
            <a
              href={RELEASES_LATEST_URL}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-neutral-400 hover:text-white hover:bg-white/5"
            >
              All downloads
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

function Screenshot() {
  return (
    <section className="relative max-w-6xl mx-auto px-6 pb-20">
      <div className="relative rounded-xl overflow-hidden screenshot-glow">
        <img src={screenshotUrl} alt="GeoHelper window next to GeoGuessr" className="w-full block" />
      </div>
    </section>
  );
}

function Features() {
  const items: Array<{ title: string; body: string; icon: React.ReactNode }> = [
    {
      icon: <KeyRound className="h-[22px] w-[22px]" />,
      title: "No API keys needed",
      body: "Six map providers work out of the box. Google Maps is optional.",
    },
    {
      icon: <Zap className="h-[22px] w-[22px]" />,
      title: "Native and fast",
      body: "Built with Rust and Tauri. Cold-starts in under a second, around 6 MB.",
    },
    {
      icon: <Box className="h-[22px] w-[22px]" />,
      title: "Three platforms",
      body: "Signed Windows installer, .deb and AppImage for Linux, .dmg for macOS.",
    },
    {
      icon: <MapPin className="h-[22px] w-[22px]" />,
      title: "Rich location info",
      body: "Flag, country, region, neighbourhood, road, postcode when available.",
    },
    {
      icon: <Shield className="h-[22px] w-[22px]" />,
      title: "Nothing injected",
      body: "Reads CDP traffic the game already makes. No patches, no hooks, no DLL.",
    },
    {
      icon: <Code2 className="h-[22px] w-[22px]" />,
      title: "Open source, MIT",
      body: "Read the code, fork it, or send a pull request. No telemetry, ever.",
    },
  ];

  return (
    <section id="features" className="relative max-w-5xl mx-auto px-6 pb-20">
      <h2 className="mb-10 text-2xl sm:text-3xl font-bold text-white">Small app, full kit.</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => (
          <div
            key={it.title}
            className="rounded-lg border border-white/10 bg-white/[0.02] p-5 hover:border-white/20 hover:bg-white/[0.04] transition"
          >
            <div className="text-red-400 mb-3">{it.icon}</div>
            <h3 className="font-semibold text-white">{it.title}</h3>
            <p className="mt-1 text-sm text-neutral-400 leading-relaxed">{it.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="relative max-w-4xl mx-auto px-6 pb-20">
      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">How it works</h2>
      <p className="text-neutral-400 leading-relaxed">
        GeoHelper connects to the Chrome DevTools Protocol that the Steam GeoGuessr client already
        exposes, reads network traffic coming out of the game, picks up Street View panorama IDs
        and asks the game's own resolver to turn them back into coordinates. The result goes
        through a tiny Rust bridge into a window sitting next to your game.
      </p>
      <p className="mt-4 text-neutral-400 leading-relaxed">
        No servers. No browser extension. No code injected into GeoGuessr.
      </p>
    </section>
  );
}

function GetStarted() {
  const [copied, setCopied] = useState(false);
  const flags = "--remote-debugging-port=9222 --remote-allow-origins=*";

  async function copy() {
    try {
      await navigator.clipboard.writeText(flags);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }

  return (
    <section id="get-started" className="relative max-w-5xl mx-auto px-6 pb-24">
      <h2 className="mb-8 text-2xl sm:text-3xl font-bold text-white">Three steps, one minute.</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        <Step n="01" title="Download">
          Grab the latest build for your OS from{" "}
          <a href={RELEASES_LATEST_URL} className="underline decoration-red-500/60 hover:text-white">
            releases
          </a>{" "}
          and open it.
        </Step>

        <Step n="02" title="Add launch flags to Steam">
          <p>Right-click GeoGuessr, Properties, Launch Options, paste:</p>
          <div className="mt-3 flex items-start gap-2 rounded bg-black/60 px-3 py-2">
            <code className="flex-1 break-all font-mono text-[11px] text-red-300">{flags}</code>
            <button
              type="button"
              onClick={copy}
              aria-label="Copy launch flags"
              className="shrink-0 rounded border border-white/10 p-1 text-neutral-400 hover:text-white hover:bg-white/5 transition"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
        </Step>

        <Step n="03" title="Play">
          Start GeoGuessr, start GeoHelper. Dot goes green, coordinates show up.
        </Step>
      </div>
    </section>
  );
}

function Step({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02] p-5">
      <div className="text-xs font-mono text-red-400">{n}</div>
      <strong className="block mt-1 text-white">{title}</strong>
      <div className="mt-2 text-sm text-neutral-400 leading-relaxed">{children}</div>
    </div>
  );
}

function Faq() {
  const items = [
    {
      q: "Will I get banned?",
      a: "If you use it in ranked or online multiplayer, eventually yes. GeoHelper is built for solo play, custom maps and training. Read GeoGuessr's ToS.",
    },
    {
      q: "Does it work on Mac and Linux?",
      a: "Builds are produced for all three OSes. Your GeoGuessr Steam client still needs to expose CDP on localhost:9222 the same way it does on Windows. If that works for you, GeoHelper works.",
    },
    {
      q: "Why macOS shows a security warning",
      a: "Because the build is not code-signed with an Apple Developer ID. Right-click the app and pick Open once, or run xattr -dr com.apple.quarantine on it. After that it launches normally.",
    },
    {
      q: "Does it work with GeoGuessr in the browser?",
      a: "No. The browser version doesn't expose a CDP endpoint to the outside world the way the Steam client does with those launch flags. Steam only for now. A browser extension is on the roadmap.",
    },
  ];

  return (
    <section className="relative max-w-4xl mx-auto px-6 pb-24">
      <h2 className="mb-8 text-2xl sm:text-3xl font-bold text-white">Questions we actually get asked.</h2>
      <div className="divide-y divide-white/5 rounded-lg border border-white/10 bg-white/[0.02]">
        {items.map((it) => (
          <details key={it.q} className="group px-5 py-4">
            <summary className="flex cursor-pointer items-center justify-between gap-4 text-white">
              <span className="font-medium">{it.q}</span>
              <ChevronDown className="h-4 w-4 text-neutral-500 transition group-open:rotate-180" />
            </summary>
            <p className="mt-3 text-sm text-neutral-400 leading-relaxed">{it.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/5">
      <div className="max-w-5xl mx-auto px-6 py-8 flex flex-wrap items-center justify-between gap-4 text-sm text-neutral-500">
        <div className="flex items-center gap-2">
          <img src={logoUrl} alt="" className="h-5 w-5" />
          <span>GeoHelper</span>
        </div>
        <div className="flex items-center gap-5">
          <a href={GITHUB_URL} className="hover:text-white transition">GitHub</a>
          <a href={KOFI_URL} className="hover:text-white transition">Ko-fi</a>
          <a href={`${GITHUB_URL}/blob/main/LICENSE`} className="hover:text-white transition">
            MIT License
          </a>
        </div>
      </div>
    </footer>
  );
}
