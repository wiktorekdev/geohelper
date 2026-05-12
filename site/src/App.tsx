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
  Menu,
  Monitor,
  Palette,
  Shield,
  Sparkles,
  Terminal,
  X,
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
      <Features />
      <Customizer />
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

// ─── Nav with scroll-triggered backdrop ─────────────────────────────────────
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile sheet when a link is clicked.
  const close = () => setOpen(false);

  return (
    <div
      className={
        "sticky top-0 z-40 transition-colors " +
        (scrolled || open
          ? "border-b border-white/10 bg-neutral-950/80 backdrop-blur-md"
          : "border-b border-transparent")
      }
    >
      <header className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <a href="#top" className="flex items-center gap-2.5" onClick={close}>
          <img src={logoUrl} alt="" className="size-8" />
          <span className="font-semibold tracking-tight text-white">GeoHelper</span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 text-sm md:flex">
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

        {/* Mobile trigger */}
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex size-9 items-center justify-center rounded-md border border-white/10 bg-white/[0.02] text-neutral-200 transition hover:bg-white/[0.06] md:hidden"
        >
          {open ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>
      </header>

      {/* Mobile sheet */}
      {open && (
        <nav className="border-t border-white/10 bg-neutral-950/95 px-6 py-4 md:hidden">
          <div className="flex flex-col gap-1 text-sm">
            <MobileLink href="#features" onClick={close}>Features</MobileLink>
            <MobileLink href="#customize" onClick={close}>Customize</MobileLink>
            <MobileLink href="#get-started" onClick={close}>Get started</MobileLink>
            <MobileLink href={GITHUB_URL} onClick={close}>GitHub</MobileLink>
            <a
              href={RELEASES_LATEST_URL}
              onClick={close}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-md bg-white px-4 py-2.5 font-medium text-black transition hover:bg-neutral-200"
            >
              <Download className="size-4" />
              Download
            </a>
          </div>
        </nav>
      )}
    </div>
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

function MobileLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      onClick={onClick}
      className="rounded-md px-3 py-2.5 text-neutral-300 transition hover:bg-white/5 hover:text-white"
    >
      {children}
    </a>
  );
}

function Hero() {
  return (
    <Reveal className="relative z-30">
      <section
        id="top"
        className="relative mx-auto max-w-4xl px-6 pt-12 pb-10 text-center sm:pt-20"
      >
        <a
          href={`${GITHUB_URL}/releases/latest`}
          className="group mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] py-1 pl-1 pr-3 text-[11px] text-neutral-300 transition hover:border-white/20 hover:bg-white/[0.05]"
        >
          <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2 py-0.5 text-red-300">
            <Sparkles className="size-3" />
            v0.13
          </span>
          <span>New: layout editor, customize what you see</span>
          <ArrowRight className="size-3 text-neutral-500 transition group-hover:translate-x-0.5 group-hover:text-white" />
        </a>

        <h1 className="text-[2.5rem] font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl">
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
            href={RELEASES_LATEST_URL}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-5 py-3 text-white transition hover:bg-white/5"
          >
            <Github className="size-[18px]" />
            Source on GitHub
          </a>
        </div>

        <p className="mt-6 font-mono text-xs text-neutral-500">
          MIT · around 6 MB · no installer required
        </p>
      </section>
    </Reveal>
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
        <Download className="size-[18px]" />
        <span className="hidden sm:inline">Download for</span>
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

// ─── Rotating hero screenshot ───────────────────────────────────────────────
function HeroScreenshot() {
  const shots = [
    { src: parisShot, label: "Paris" },
    { src: krakowShot, label: "Kraków" },
    { src: tokyoShot, label: "Tokyo" },
  ];
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % shots.length), 4200);
    return () => clearInterval(t);
  }, [paused, shots.length]);

  return (
    <Reveal>
      <section className="relative mx-auto max-w-6xl px-6 pb-24">
        <div
          className="relative overflow-hidden rounded-xl border border-white/10 bg-neutral-950"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {shots.map((s, i) => (
            <img
              key={s.src}
              src={s.src}
              alt={`GeoHelper showing ${s.label}`}
              className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
              style={{ opacity: i === idx ? 1 : 0 }}
            />
          ))}
          <img src={shots[0].src} aria-hidden className="block w-full opacity-0" alt="" />
        </div>
      </section>
    </Reveal>
  );
}

// ─── Feature grid ───────────────────────────────────────────────────────────
function Features() {
  const items: Array<{ title: string; body: string; icon: React.ReactNode }> = [
    {
      icon: <KeyRound className="size-[22px]" />,
      title: "No API keys needed",
      body: "Six map providers work out of the box. Google Maps is optional.",
    },
    {
      icon: <Zap className="size-[22px]" />,
      title: "Native and fast",
      body: "Built with Rust and Tauri. Cold-starts in under a second, around 6 MB.",
    },
    {
      icon: <Box className="size-[22px]" />,
      title: "Three platforms",
      body: "Signed Windows installer, .deb and AppImage for Linux, .dmg for macOS.",
    },
    {
      icon: <MapPin className="size-[22px]" />,
      title: "Rich location info",
      body: "Flag, country, region, neighbourhood, road, postcode when available.",
    },
    {
      icon: <Shield className="size-[22px]" />,
      title: "Nothing injected",
      body: "Reads CDP traffic the game already makes. No patches, no hooks, no DLL.",
    },
    {
      icon: <Code2 className="size-[22px]" />,
      title: "Open source, MIT",
      body: "Read the code, fork it, or send a pull request. No telemetry, ever.",
    },
  ];

  return (
    <Reveal>
      <section id="features" className="relative mx-auto max-w-5xl px-6 pb-24">
        <h2 className="mb-10 text-2xl font-semibold text-white sm:text-3xl">Small app, full kit.</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <div
              key={it.title}
              className="group rounded-xl border border-white/10 bg-white/[0.02] p-5 transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.04]"
            >
              <div className="mb-3 inline-flex size-9 items-center justify-center rounded-lg bg-red-500/10 text-red-400 ring-1 ring-red-500/20">
                {it.icon}
              </div>
              <h3 className="font-semibold text-white">{it.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-neutral-400">{it.body}</p>
            </div>
          ))}
        </div>
      </section>
    </Reveal>
  );
}

function Customizer() {
  const bullets = [
    { icon: <Layout className="size-4" />, text: "Drag to reorder every section" },
    { icon: <Palette className="size-4" />, text: "Custom colors, bold, font size per widget" },
    { icon: <Code2 className="size-4" />, text: "Hide everything except what you want to train" },
  ];

  return (
    <Reveal>
      <section id="customize" className="relative mx-auto max-w-5xl px-6 pb-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">Make it yours.</h2>
          <p className="mt-4 leading-relaxed text-neutral-400">
            Hit the pencil icon and the sidebar becomes a canvas. Drag sections around,
            change colors and sizes per widget, hide what you don't need. Want to practice
            by seeing only the currency and language? Toggle the rest off.
          </p>
          <ul className="mx-auto mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm">
            {bullets.map((b) => (
              <li key={b.text} className="flex items-center gap-2 text-neutral-300">
                <span className="text-red-400">{b.icon}</span>
                {b.text}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative mt-10 overflow-hidden rounded-xl border border-white/10 bg-neutral-950">
          <img src={editShot} alt="GeoHelper layout editor" className="block w-full" />
        </div>
      </section>
    </Reveal>
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
    <Reveal>
      <section id="get-started" className="relative mx-auto max-w-5xl px-6 pb-24">
        <h2 className="mb-8 text-2xl font-semibold text-white sm:text-3xl">Three steps, one minute.</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Step n="01" title="Download" icon={<Download className="size-5" />}>
            Grab the latest build for your OS from{" "}
            <a
              href={RELEASES_LATEST_URL}
              className="underline decoration-red-500/60 hover:text-white"
            >
              releases
            </a>{" "}
            and open it.
          </Step>

          <Step
            n="02"
            title="Add launch flags to Steam"
            icon={<Terminal className="size-5" />}
          >
            <p>Right-click GeoGuessr, Properties, Launch Options, paste:</p>
            <div className="mt-3 flex items-start gap-2 rounded bg-black/60 px-3 py-2">
              <code className="flex-1 break-all font-mono text-[11px] text-red-300">{flags}</code>
              <button
                type="button"
                onClick={copy}
                aria-label="Copy launch flags"
                className="shrink-0 rounded border border-white/10 p-1 text-neutral-400 transition hover:bg-white/5 hover:text-white"
              >
                {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
              </button>
            </div>
          </Step>

          <Step n="03" title="Play" icon={<MapPin className="size-5" />}>
            Start GeoGuessr, start GeoHelper. Dot goes green, coordinates show up.
          </Step>
        </div>
      </section>
    </Reveal>
  );
}

function Step({
  n,
  title,
  icon,
  children,
}: {
  n: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="relative rounded-xl border border-white/10 bg-white/[0.02] p-5">
      <div className="mb-4 inline-flex size-9 items-center justify-center rounded-lg bg-red-500/10 text-red-400 ring-1 ring-red-500/20">
        {icon}
      </div>
      <div className="absolute right-4 top-4 font-mono text-[10px] tracking-widest text-neutral-600">
        {n}
      </div>
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
    <Reveal>
      <section className="relative mx-auto max-w-4xl px-6 pb-20">
        <h2 className="mb-8 text-2xl font-semibold text-white sm:text-3xl">Questions we actually get asked.</h2>
        <div className="divide-y divide-white/5 rounded-xl border border-white/10 bg-white/[0.02]">
          {items.map((it) => (
            <details key={it.q} className="group px-5 py-4">
              <summary className="flex cursor-pointer items-center justify-between gap-4 text-white">
                <span className="font-medium">{it.q}</span>
                <ChevronDown className="size-4 text-neutral-500 transition group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-neutral-400">{it.a}</p>
            </details>
          ))}
        </div>
      </section>
    </Reveal>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/5">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-sm text-neutral-500">
        <div className="flex items-center gap-2">
          <img src={logoUrl} alt="" className="size-5" />
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

// ─── Scroll reveal wrapper ──────────────────────────────────────────────────
function Reveal({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setSeen(true);
            io.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -80px 0px", threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={(seen ? "reveal reveal-in " : "reveal ") + className}>
      {children}
    </div>
  );
}
