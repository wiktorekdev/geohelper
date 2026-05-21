import { GITHUB_URL, RELEASES_LATEST_URL } from "../links";
import NavMobileMenu from "./NavMobileMenu";
import StickyHeader from "./StickyHeader";

export default function Nav() {
  return (
    <StickyHeader>
      <header className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <a href="#top" className="flex items-center gap-2.5">
          <img src="/logo.png" alt="" className="size-8" />
          <span className="font-semibold tracking-tight text-white">GeoHelper</span>
        </a>

        {/* Desktop Navigation - 100% Static HTML */}
        <nav className="hidden items-center gap-1 text-sm md:flex">
          <a
            href="#features"
            className="rounded-md px-3 py-1.5 text-neutral-400 transition hover:bg-white/5 hover:text-white"
          >
            Features
          </a>
          <a
            href="#customize"
            className="rounded-md px-3 py-1.5 text-neutral-400 transition hover:bg-white/5 hover:text-white"
          >
            Customize
          </a>
          <a
            href="#get-started"
            className="rounded-md px-3 py-1.5 text-neutral-400 transition hover:bg-white/5 hover:text-white"
          >
            Get started
          </a>
          <a
            href={GITHUB_URL}
            className="rounded-md px-3 py-1.5 text-neutral-400 transition hover:bg-white/5 hover:text-white"
          >
            GitHub
          </a>
          <a
            href={RELEASES_LATEST_URL}
            className="ml-2 inline-flex items-center gap-2 rounded-md bg-white px-4 py-1.5 font-medium text-black transition hover:bg-neutral-200"
          >
            Download
          </a>
        </nav>

        {/* Mobile Navigation - Client Component for interaction */}
        <NavMobileMenu />
      </header>
    </StickyHeader>
  );
}
