import { EXTERNAL_LINK_PROPS, GITHUB_URL, RELEASES_LATEST_URL } from "../links";
import NavMobileMenu from "./NavMobileMenu";
import StickyHeader from "./StickyHeader";

export default function Nav() {
  return (
    <StickyHeader>
      <header className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="#top" className="flex items-center gap-2.5">
          <img src="/logo.png" alt="" className="size-7" />
          <span className="text-[15px] font-semibold tracking-tight text-zinc-100">GeoHelper</span>
        </a>

        <nav className="hidden items-center gap-1 text-sm md:flex">
          <a
            href="#features"
            className="rounded-md px-3 py-1.5 text-zinc-500 transition hover:text-zinc-200"
          >
            Features
          </a>
          <a
            href="#customize"
            className="rounded-md px-3 py-1.5 text-zinc-500 transition hover:text-zinc-200"
          >
            Customize
          </a>
          <a
            href="#get-started"
            className="rounded-md px-3 py-1.5 text-zinc-500 transition hover:text-zinc-200"
          >
            Get started
          </a>
          <a
            href={GITHUB_URL}
            {...EXTERNAL_LINK_PROPS}
            className="rounded-md px-3 py-1.5 text-zinc-500 transition hover:text-zinc-200"
          >
            GitHub
          </a>
          <a
            href={RELEASES_LATEST_URL}
            {...EXTERNAL_LINK_PROPS}
            className="ml-2 inline-flex items-center gap-2 rounded-md bg-indigo-500 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-indigo-400"
          >
            Download
          </a>
        </nav>

        <NavMobileMenu />
      </header>
    </StickyHeader>
  );
}
