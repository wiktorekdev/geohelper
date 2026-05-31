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

function Hero() {
  return (
    <Reveal className="relative z-30">
      <section
        id="top"
        className="relative mx-auto max-w-4xl px-6 pt-12 pb-10 text-center sm:pt-20"
      >
        <a
          href={`${GITHUB_URL}/releases/latest`}
          {...EXTERNAL_LINK_PROPS}
          className="group mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] py-1 pl-1 pr-3 text-[11px] text-neutral-300 transition hover:border-white/20 hover:bg-white/[0.05]"
        >
          <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2 py-0.5 text-red-300">
            <Download className="size-3" />
            v{GEOHELPER_VERSION}
          </span>
          <span>Latest GeoHelper release</span>
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
            className="lucide lucide-arrow-right size-3 text-neutral-500 transition group-hover:translate-x-0.5 group-hover:text-white"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </a>

        <h1 className="text-[2.5rem] font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl">
          Live coordinates for{" "}
          <span className="text-red-400">
            GeoGuessr
          </span>
          .
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-neutral-400">
          A tiny desktop helper that reads GeoGuessr&apos;s own traffic and tells you where the current
          Street View actually is. No browser extension, no scripts inside the game.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <DownloadButton />
          <a
            href={GITHUB_URL}
            {...EXTERNAL_LINK_PROPS}
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
      body: "Windows installer, Linux packages, and separate macOS builds for Apple Silicon and Intel.",
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
      body: "Read the code, fork it, or send a pull request. The desktop app has no telemetry.",
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
            change colors and sizes per widget, hide what you don&apos;t need. Want to practice
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
      <section id="get-started" className="relative mx-auto max-w-5xl px-6 pb-24">
        <h2 className="mb-8 text-2xl font-semibold text-white sm:text-3xl">Three steps, one minute.</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Step n="01" title="Download" icon={<Download className="size-5" />}>
            Grab the latest build for your OS from{" "}
            <a
              href={RELEASES_LATEST_URL}
              {...EXTERNAL_LINK_PROPS}
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
  return (
    <Reveal>
      <section className="relative mx-auto max-w-4xl px-6 pb-20">
        <h2 className="mb-8 text-2xl font-semibold text-white sm:text-3xl">Questions we actually get asked.</h2>
        <div className="divide-y divide-white/5 rounded-xl border border-white/10 bg-white/[0.02]">
          {FAQ_ENTRIES.map((it) => (
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
          <img src="/logo.png" alt="" className="size-5" />
          <span>GeoHelper</span>
        </div>
        <div className="flex items-center gap-5">
          <a href={GITHUB_URL} {...EXTERNAL_LINK_PROPS} className="transition hover:text-white">
            GitHub
          </a>
          <a href={KOFI_URL} {...EXTERNAL_LINK_PROPS} className="transition hover:text-white">
            Ko-fi
          </a>
          <a
            href={`${GITHUB_URL}/blob/main/LICENSE`}
            {...EXTERNAL_LINK_PROPS}
            className="transition hover:text-white"
          >
            MIT License
          </a>
        </div>
      </div>
    </footer>
  );
}
