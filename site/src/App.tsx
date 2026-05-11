import { useEffect, useRef, useState } from "react";
import {
  Apple,
  ArrowRight,
  Box,
  Check,
  ChevronDown,
  Code2,
  Copy,
  Download,
  Github,
  KeyRound,
  Layout,
  MapPin,
  Monitor,
  Palette,
  Shield,
  Sparkles,
  Terminal,
  Zap,
} from "lucide-react";

import logoUrl from "./assets/logo.png";
import parisShot from "./assets/paris.png";
import krakowShot from "./assets/krakow.png";
import tokyoShot from "./assets/tokyo.png";
import editShot from "./assets/edit-mode.png";
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
    <div className="relative overflow-x-hidden">
      <Backdrop />
      <Nav />
      <Hero />
      <HeroScreenshot />
      <TrustStrip />
      <Features />
      <Customizer />
      <HowItWorks />
      <GetStarted />
      <Faq />
      <Footer />
    </div>
  );
}

function Backdrop() {
  return (
    <>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[900px] grid-bg" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[900px] bg-[radial-gradient(ellipse_60%_40%_at_50%_-10%,rgba(239,68,68,0.20),transparent_70%)]" />
    </>
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
        <NavLink href="#customize">Customize</NavLink>
        <NavLink href="#get-started">Get started</NavLink>
        <NavLink href={GITHUB_URL}>GitHub</NavLink>
        <a
          href={RELEASES_LATEST_URL}
          className="ml-2 inline-flex items-center gap-2 rounded-md bg-white px-4 py-1.5 font-medium text-black transition hover:bg-neutral-200"
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
      className="rounded-md px-3 py-1.5 text-neutral-400 transition hover:bg-white/5 hover:text-white"
    >
      {children}
    </a>
  );
}

function Hero() {
  return (
    <section
      id="top"
      className="relative mx-auto max-w-4xl px-6 pt-16 pb-10 text-center sm:pt-24"
    >
      <a
        href={`${GITHUB_URL}/releases/latest`}
        className="group mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] py-1 pl-1 pr-3 text-[11px] text-neutral-300 transition hover:border-white/20 hover:bg-white/[0.05]"
      >
        <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2 py-0.5 text-red-300">
          <Sparkles className="h-3 w-3" />
          v0.13
        </span>
        <span>New: layout editor — customize what you see</span>
        <ArrowRight className="h-3 w-3 text-neutral-500 transition group-hover:translate-x-0.5 group-hover:text-white" />
      </a>

      <h1 className="text-5xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl">
        Live coordinates for{" "}
        <span className="bg-gradient-to-br from-red-400 to-red-600 bg-clip-text text-transparent">
          GeoGuessr
        </span>
        .
      </h1>

      <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-neutral-400">
        A tiny desktop helper that reads GeoGuessr's own traffic and tells you where the current
        Street View actually is. No browser extension, no scripts inside the game.
      </p>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <DownloadButton />
        <a
          href={GITHUB_URL}
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-5 py-3 text-white transition hover:bg-white/5"
        >
          <Github className="h-[18px] w-[18px]" />
          Source on GitHub
        </a>
      </div>

      <p className="mt-6 font-mono text-xs text-neutral-500">
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
    <div ref={ref} className="relative inline-flex overflow-visible rounded-lg">
      <a
        href={RELEASES_LATEST_URL}
        className="inline-flex items-center gap-2 rounded-l-lg bg-white px-5 py-3 font-semibold text-black transition hover:bg-neutral-200"
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
        className="inline-flex w-10 items-center justify-center rounded-r-lg border-l border-black/10 bg-white text-black transition hover:bg-neutral-200"
      >
        <ChevronDown className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-10 mt-2 rounded-lg border border-white/10 bg-neutral-950/95 p-1 text-left text-sm shadow-xl shadow-black/50 backdrop-blur">
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

// Auto-rotating hero screenshot: swaps between three real screenshots every
// few seconds so the page feels alive without feeling noisy.
function HeroScreenshot() {
  const shots = [
    { src: parisShot, label: "France — Paris" },
    { src: krakowShot, label: "Poland — Kraków" },
    { src: tokyoShot, label: "Japan — Tokyo" },
  ];
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % shots.length), 4200);
    return () => clearInterval(t);
  }, [shots.length]);

  return (
    <section className="relative mx-auto max-w-6xl px-6 pb-20">
      <div className="screenshot-glow relative overflow-hidden rounded-xl border border-white/10 bg-black">
        {shots.map((s, i) => (
          <img
            key={s.src}
            src={s.src}
            alt={`GeoHelper showing ${s.label}`}
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
            style={{ opacity: i === idx ? 1 : 0 }}
          />
        ))}
        <img
          src={shots[0].src}
          aria-hidden
          className="block w-full opacity-0"
          alt=""
        />
        <div className="absolute left-3 bottom-3 flex items-center gap-2 rounded-full border border-white/10 bg-black/60 px-2.5 py-1 text-[11px] text-neutral-300 backdrop-blur">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/70" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
          {shots[idx].label}
        </div>
      </div>
    </section>
  );
}

function TrustStrip() {
  return (
    <section className="relative mx-auto max-w-5xl px-6 pb-20">
      <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 rounded-xl border border-white/5 bg-white/[0.015] px-8 py-5 text-sm text-neutral-400">
        <Stat label="Platforms" value="Windows · Linux · macOS" />
        <Stat label="Binary size" value="~6 MB" />
        <Stat label="API keys" value="Optional" />
        <Stat label="Telemetry" value="None" />
        <Stat label="License" value="MIT" />
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="text-[10px] uppercase tracking-widest text-neutral-500">{label}</div>
      <div className="mt-0.5 text-[13px] font-medium text-neutral-200">{value}</div>
    </div>
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
    <section id="features" className="relative mx-auto max-w-5xl px-6 pb-24">
      <h2 className="mb-10 text-2xl font-bold text-white sm:text-3xl">Small app, full kit.</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => (
          <div
            key={it.title}
            className="group rounded-xl border border-white/10 bg-white/[0.02] p-5 transition hover:border-white/20 hover:bg-white/[0.04]"
          >
            <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/10 text-red-400 ring-1 ring-red-500/20">
              {it.icon}
            </div>
            <h3 className="font-semibold text-white">{it.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-neutral-400">{it.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Customizer() {
  const bullets = [
    { icon: <Layout className="h-4 w-4" />, text: "Drag to reorder every section" },
    { icon: <Palette className="h-4 w-4" />, text: "Custom colors, bold, font size per widget" },
    { icon: <Sparkles className="h-4 w-4" />, text: "Hide everything except what you want to train" },
  ];

  return (
    <section id="customize" className="relative mx-auto max-w-6xl px-6 pb-24">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-[11px] font-medium text-red-300">
            <Sparkles className="h-3 w-3" />
            New in v0.13
          </div>
          <h2 className="text-2xl font-bold text-white sm:text-3xl">Make it yours.</h2>
          <p className="mt-4 leading-relaxed text-neutral-400">
            Hit the pencil icon and the sidebar becomes a canvas. Drag sections around,
            change colors and sizes per widget, hide what you don't need. Want to practice
            by seeing only the currency and language? Just toggle the rest off.
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            {bullets.map((b) => (
              <li key={b.text} className="flex items-center gap-3 text-neutral-200">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-white/5 text-red-400 ring-1 ring-white/10">
                  {b.icon}
                </span>
                {b.text}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative">
          <div className="screenshot-glow relative overflow-hidden rounded-xl border border-white/10 bg-black">
            <img src={editShot} alt="GeoHelper layout editor" className="block w-full" />
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="relative mx-auto max-w-4xl px-6 pb-24">
      <h2 className="mb-4 text-2xl font-bold text-white sm:text-3xl">How it works</h2>
      <p className="leading-relaxed text-neutral-400">
        GeoHelper connects to the Chrome DevTools Protocol that the Steam GeoGuessr client already
        exposes, reads network traffic coming out of the game, picks up Street View panorama IDs
        and asks the game's own resolver to turn them back into coordinates. The result goes
        through a tiny Rust bridge into a window sitting next to your game.
      </p>
      <p className="mt-4 leading-relaxed text-neutral-400">
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
    <section id="get-started" className="relative mx-auto max-w-5xl px-6 pb-24">
      <h2 className="mb-8 text-2xl font-bold text-white sm:text-3xl">Three steps, one minute.</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        <Step n="01" title="Download">
          Grab the latest build for your OS from{" "}
          <a
            href={RELEASES_LATEST_URL}
            className="underline decoration-red-500/60 hover:text-white"
          >
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
              className="shrink-0 rounded border border-white/10 p-1 text-neutral-400 transition hover:bg-white/5 hover:text-white"
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
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
      <div className="font-mono text-xs text-red-400">{n}</div>
      <strong className="mt-1 block text-white">{title}</strong>
      <div className="mt-2 text-sm leading-relaxed text-neutral-400">{children}</div>
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
    <section className="relative mx-auto max-w-4xl px-6 pb-24">
      <h2 className="mb-8 text-2xl font-bold text-white sm:text-3xl">Questions we actually get asked.</h2>
      <div className="divide-y divide-white/5 rounded-xl border border-white/10 bg-white/[0.02]">
        {items.map((it) => (
          <details key={it.q} className="group px-5 py-4">
            <summary className="flex cursor-pointer items-center justify-between gap-4 text-white">
              <span className="font-medium">{it.q}</span>
              <ChevronDown className="h-4 w-4 text-neutral-500 transition group-open:rotate-180" />
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-neutral-400">{it.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/5">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-sm text-neutral-500">
        <div className="flex items-center gap-2">
          <img src={logoUrl} alt="" className="h-5 w-5" />
          <span>GeoHelper</span>
        </div>
        <div className="flex items-center gap-5">
          <a href={GITHUB_URL} className="transition hover:text-white">
            GitHub
          </a>
          <a href={KOFI_URL} className="transition hover:text-white">
            Ko-fi
          </a>
          <a
            href={`${GITHUB_URL}/blob/main/LICENSE`}
            className="transition hover:text-white"
          >
            MIT License
          </a>
        </div>
      </div>
    </footer>
  );
}
