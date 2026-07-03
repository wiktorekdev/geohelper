import {
  Box,
  ChevronDown,
  Code2,
  Download,
  Github,
  KeyRound,
  Layout,
  MapPin,
  Palette,
  Shield,
  Terminal,
  Zap,
} from "lucide-react";

import { FAQ_ENTRIES } from "../faq";
import {
  EXTERNAL_LINK_PROPS,
  GITHUB_URL,
  KOFI_URL,
  RELEASES_LATEST_URL,
} from "../links";
import Nav from "../components/Nav";
import DownloadButton from "../components/DownloadButton";
import HeroScreenshot from "../components/HeroScreenshot";
import CopyButton from "../components/CopyButton";
import Reveal from "../components/Reveal";

const GEOHELPER_VERSION = process.env.GEOHELPER_VERSION ?? "0.0.0";

export default function Page() {
  return (
    <div className="relative overflow-x-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[800px] hero-glow" />
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

function Hero() {
  return (
    <Reveal className="relative z-30">
      <section
        id="top"
        className="relative mx-auto max-w-3xl px-6 pt-16 pb-12 text-center sm:pt-24"
      >
        <a
          href={`${GITHUB_URL}/releases/latest`}
          {...EXTERNAL_LINK_PROPS}
          className="group mx-auto mb-8 inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.02] py-1 pl-1 pr-3 text-[11px] text-zinc-400 transition hover:border-white/[0.12] hover:bg-white/[0.04]"
        >
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/10 px-2 py-0.5 text-indigo-400">
            <Download className="size-3" />
            v{GEOHELPER_VERSION}
          </span>
          <span>Latest release</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-3 text-zinc-600 transition group-hover:translate-x-0.5 group-hover:text-zinc-300"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </a>

        <h1 className="text-[2.75rem] font-semibold leading-[1.08] tracking-tight text-zinc-100 sm:text-5xl md:text-6xl">
          Live coordinates for{" "}
          <span className="text-indigo-400">GeoGuessr</span>.
        </h1>

        <p className="mx-auto mt-6 max-w-lg text-[17px] leading-relaxed text-zinc-400">
          A tiny desktop helper that reads GeoGuessr&apos;s own traffic and
          tells you where the current Street View actually is. No browser
          extension, no scripts inside the game.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <DownloadButton />
          <a
            href={GITHUB_URL}
            {...EXTERNAL_LINK_PROPS}
            className="inline-flex items-center gap-2 rounded-lg border border-white/[0.08] px-5 py-3 text-zinc-300 transition hover:border-white/[0.15] hover:text-white"
          >
            <Github className="size-[18px]" />
            Source on GitHub
          </a>
        </div>

        <p className="mt-8 font-mono text-xs text-zinc-600">
          MIT · around 6 MB · no installer required
        </p>
      </section>
    </Reveal>
  );
}

function Features() {
  const items: Array<{ title: string; body: string; icon: React.ReactNode }> = [
    {
      icon: <KeyRound className="size-[18px]" />,
      title: "No API keys needed",
      body: "Six map providers work out of the box. Google Maps is optional.",
    },
    {
      icon: <Zap className="size-[18px]" />,
      title: "Native and fast",
      body: "Built with Rust and Tauri. Cold-starts in under a second, around 6 MB.",
    },
    {
      icon: <Box className="size-[18px]" />,
      title: "Three platforms",
      body: "Windows installer, Linux packages, and separate macOS builds for Apple Silicon and Intel.",
    },
    {
      icon: <MapPin className="size-[18px]" />,
      title: "Rich location info",
      body: "Flag, country, region, neighbourhood, road, postcode when available.",
    },
    {
      icon: <Shield className="size-[18px]" />,
      title: "Nothing injected",
      body: "Reads CDP traffic the game already makes. No patches, no hooks, no DLL.",
    },
    {
      icon: <Code2 className="size-[18px]" />,
      title: "Open source, MIT",
      body: "Read the code, fork it, or send a pull request. The desktop app has no telemetry.",
    },
  ];

  return (
    <Reveal>
      <section id="features" className="relative mx-auto max-w-5xl px-6 pb-28">
        <h2 className="mb-3 text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl">
          Small app, full kit.
        </h2>
        <p className="mb-10 max-w-lg text-zinc-500">
          Everything you need to practice geography, nothing you don&apos;t.
        </p>
        <div className="grid gap-px overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.03] sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <div
              key={it.title}
              className="bg-zinc-950 p-6 transition hover:bg-white/[0.02]"
            >
              <div className="mb-3 inline-flex size-8 items-center justify-center rounded-md bg-indigo-500/10 text-indigo-400">
                {it.icon}
              </div>
              <h3 className="text-[15px] font-medium text-zinc-200">{it.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-zinc-500">{it.body}</p>
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
      <section id="customize" className="relative mx-auto max-w-5xl px-6 pb-28">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl">
            Make it yours.
          </h2>
          <p className="mt-4 leading-relaxed text-zinc-400">
            Hit the pencil icon and the sidebar becomes a canvas. Drag sections
            around, change colors and sizes per widget, hide what you
            don&apos;t need.
          </p>
          <ul className="mx-auto mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm">
            {bullets.map((b) => (
              <li key={b.text} className="flex items-center gap-2 text-zinc-400">
                <span className="text-indigo-400">{b.icon}</span>
                {b.text}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative mt-10 overflow-hidden rounded-xl border border-white/[0.06] bg-zinc-950 shadow-2xl shadow-black/40">
          <img src="/edit-mode.png" alt="GeoHelper layout editor" className="block w-full" />
        </div>
      </section>
    </Reveal>
  );
}

function GetStarted() {
  const flags = "--remote-debugging-port=34788 --remote-allow-origins=*";

  return (
    <Reveal>
      <section id="get-started" className="relative mx-auto max-w-5xl px-6 pb-28">
        <h2 className="mb-3 text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl">
          Three steps, one minute.
        </h2>
        <p className="mb-8 text-zinc-500">Up and running before your next round.</p>
        <div className="grid gap-px overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.03] sm:grid-cols-3">
          <Step n="01" title="Download" icon={<Download className="size-5" />}>
            Grab the latest build for your OS from{" "}
            <a
              href={RELEASES_LATEST_URL}
              {...EXTERNAL_LINK_PROPS}
              className="underline decoration-indigo-500/40 underline-offset-2 hover:text-zinc-100"
            >
              releases
            </a>{" "}
            and open it.
          </Step>

          <Step
            n="02"
            title="Add launch flags"
            icon={<Terminal className="size-5" />}
          >
            <p>Right-click GeoGuessr in Steam, Properties, Launch Options, paste:</p>
            <div className="mt-3 flex items-start gap-2 rounded-md border border-white/[0.06] bg-black/40 px-3 py-2">
              <code className="flex-1 break-all font-mono text-[11px] text-indigo-300">{flags}</code>
              <CopyButton text={flags} />
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
    <div className="relative bg-zinc-950 p-6">
      <div className="mb-4 inline-flex size-8 items-center justify-center rounded-md bg-indigo-500/10 text-indigo-400">
        {icon}
      </div>
      <div className="absolute right-4 top-4 font-mono text-[10px] tracking-widest text-zinc-700">
        {n}
      </div>
      <strong className="block text-[15px] font-medium text-zinc-200">{title}</strong>
      <div className="mt-2 text-sm leading-relaxed text-zinc-500">{children}</div>
    </div>
  );
}

function Faq() {
  return (
    <Reveal>
      <section className="relative mx-auto max-w-3xl px-6 pb-24">
        <h2 className="mb-8 text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl">
          Questions we actually get asked.
        </h2>
        <div className="divide-y divide-white/[0.04] rounded-xl border border-white/[0.06]">
          {FAQ_ENTRIES.map((it) => (
            <details key={it.q} className="group px-5 py-4">
              <summary className="flex cursor-pointer items-center justify-between gap-4 text-zinc-200">
                <span className="text-[15px] font-medium">{it.q}</span>
                <ChevronDown className="size-4 shrink-0 text-zinc-600 transition group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-zinc-500">{it.a}</p>
            </details>
          ))}
        </div>
      </section>
    </Reveal>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/[0.04]">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-sm text-zinc-600">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="" className="size-5 opacity-60" />
          <span>GeoHelper</span>
        </div>
        <div className="flex items-center gap-5">
          <a href={GITHUB_URL} {...EXTERNAL_LINK_PROPS} className="transition hover:text-zinc-300">
            GitHub
          </a>
          <a href={KOFI_URL} {...EXTERNAL_LINK_PROPS} className="transition hover:text-zinc-300">
            Ko-fi
          </a>
          <a
            href={`${GITHUB_URL}/blob/main/LICENSE`}
            {...EXTERNAL_LINK_PROPS}
            className="transition hover:text-zinc-300"
          >
            MIT License
          </a>
        </div>
      </div>
    </footer>
  );
}
