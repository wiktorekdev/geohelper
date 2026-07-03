"use client";

import { useState } from "react";
import { Menu, X, Download } from "lucide-react";
import { EXTERNAL_LINK_PROPS, GITHUB_URL, RELEASES_LATEST_URL } from "../links";

export default function NavMobileMenu() {
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  return (
    <>
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex size-9 items-center justify-center rounded-md border border-white/[0.06] text-zinc-400 transition hover:text-zinc-200 md:hidden"
      >
        {open ? <X className="size-4" /> : <Menu className="size-4" />}
      </button>

      {open && (
        <nav className="mobile-menu-drawer absolute left-0 right-0 top-full border-t border-white/[0.06] bg-zinc-950/95 px-6 py-4 backdrop-blur-md md:hidden">
          <div className="flex flex-col gap-1 text-sm">
            <a
              href="#features"
              onClick={close}
              className="rounded-md px-3 py-2.5 text-zinc-400 transition hover:text-zinc-100"
            >
              Features
            </a>
            <a
              href="#customize"
              onClick={close}
              className="rounded-md px-3 py-2.5 text-zinc-400 transition hover:text-zinc-100"
            >
              Customize
            </a>
            <a
              href="#get-started"
              onClick={close}
              className="rounded-md px-3 py-2.5 text-zinc-400 transition hover:text-zinc-100"
            >
              Get started
            </a>
            <a
              href={GITHUB_URL}
              {...EXTERNAL_LINK_PROPS}
              onClick={close}
              className="rounded-md px-3 py-2.5 text-zinc-400 transition hover:text-zinc-100"
            >
              GitHub
            </a>
            <a
              href={RELEASES_LATEST_URL}
              {...EXTERNAL_LINK_PROPS}
              onClick={close}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-md bg-indigo-500 px-4 py-2.5 font-medium text-white transition hover:bg-indigo-400"
            >
              <Download className="size-4" />
              Download
            </a>
          </div>
        </nav>
      )}
    </>
  );
}
