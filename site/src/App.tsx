import logoUrl from "./assets/logo.png";
import screenshotUrl from "./assets/screenshot.png";
import { Box, Code2, Download, Lock, MapPin } from "lucide-react";
import { GITHUB_URL, KOFI_URL, RELEASES_LATEST_URL } from "./links";

export default function App() {
  return (
    <div className="relative">
      <div className="absolute inset-x-0 top-0 h-[700px] grid-bg pointer-events-none" />
      <Nav />
      <Hero />
      <Screenshot />
      <Features />
      <HowItWorks />
      <GetStarted />
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
        <NavLink href={GITHUB_URL}>GitHub</NavLink>
        <NavLink href={KOFI_URL}>Ko-fi</NavLink>
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
    <section className="relative max-w-4xl mx-auto text-center pt-20 pb-14 px-6">
      <img src={logoUrl} alt="" className="mx-auto h-24 w-24 mb-8 logo-float" />

      <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-white leading-[1.05]">
        Live coordinates for{" "}
        <span className="bg-gradient-to-br from-red-400 to-red-600 bg-clip-text text-transparent">
          GeoGuessr
        </span>
        .
      </h1>

      <p className="mt-6 max-w-xl mx-auto text-lg text-neutral-400 leading-relaxed">
        A tiny Windows helper that reads GeoGuessr's own traffic and tells you where the current
        Street View actually is. No browser extension, no scripts inside the game.
      </p>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <a
          href={RELEASES_LATEST_URL}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-white text-black font-semibold hover:bg-neutral-200 transition"
        >
          <Download className="h-[18px] w-[18px]" />
          Download for Windows
        </a>
        <a
          href={GITHUB_URL}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-white/10 hover:bg-white/5 transition text-white"
        >
          <GithubIcon />
          Source on GitHub
        </a>
      </div>

      <p className="mt-6 text-xs text-neutral-500 font-mono">
        MIT - Windows 10 / 11 - about 6 MB - no installer required
      </p>
    </section>
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
      icon: <Lock className="h-[22px] w-[22px]" />,
      title: "No API keys needed",
      body: "Six map providers work out of the box. Google is optional.",
    },
    {
      icon: <Box className="h-[22px] w-[22px]" />,
      title: "Native Windows app",
      body: "Built with Rust and Tauri. Starts in a second, a tiny binary.",
    },
    {
      icon: <MapPin className="h-[22px] w-[22px]" />,
      title: "Rich location info",
      body: "Flag, country, region, neighbourhood, road, postcode when available.",
    },
    {
      icon: <Code2 className="h-[22px] w-[22px]" />,
      title: "Open source",
      body: "MIT licensed. Read the code, fork it, send a pull request.",
    },
  ];

  return (
    <section className="relative max-w-5xl mx-auto px-6 pb-20 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((it) => (
        <div key={it.title} className="rounded-lg border border-white/10 bg-white/[0.02] p-5">
          <div className="text-red-400 mb-3">{it.icon}</div>
          <h3 className="font-semibold text-white">{it.title}</h3>
          <p className="mt-1 text-sm text-neutral-400">{it.body}</p>
        </div>
      ))}
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="relative max-w-4xl mx-auto px-6 pb-20">
      <h2 className="text-2xl font-bold text-white mb-4">How it works</h2>
      <p className="text-neutral-400 leading-relaxed">
        GeoHelper connects to the Chrome DevTools Protocol that the Steam GeoGuessr client already
        exposes, reads network traffic coming out of the game, picks up Street View panorama IDs
        and asks the game's own resolver to turn them back into coordinates. The result goes
        through a tiny Rust bridge into a React window sitting next to your game.
      </p>
      <p className="mt-4 text-neutral-400 leading-relaxed">
        No servers. No browser extension. No code injected into GeoGuessr.
      </p>
    </section>
  );
}

function GetStarted() {
  return (
    <section className="relative max-w-5xl mx-auto px-6 pb-24">
      <h2 className="text-2xl font-bold text-white mb-8">Get started</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        <Step n="01" title="Download">
          Grab{" "}
          <a href={RELEASES_LATEST_URL} className="underline decoration-red-500/60 hover:text-white">
            GeoHelper.exe
          </a>{" "}
          from the latest release and put it anywhere.
        </Step>

        <Step n="02" title="Add launch flags to Steam">
          <p>Right-click GeoGuessr, Properties, Launch Options, paste:</p>
          <code className="mt-3 block break-all rounded bg-black/60 px-3 py-2 font-mono text-[11px] text-red-300">
            --remote-debugging-port=9222 --remote-allow-origins=*
          </code>
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
      <div className="mt-2 text-sm text-neutral-400">{children}</div>
    </div>
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

function GithubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}
