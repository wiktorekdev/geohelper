import { ArrowLeft, Github } from "lucide-react";

import { EXTERNAL_LINK_PROPS, GITHUB_URL } from "../links";

export default function NotFoundContent() {
  return (
    <main className="min-h-dvh bg-neutral-950 text-white">
      <div className="grid min-h-dvh place-items-center px-6">
        <section className="w-full max-w-xl text-center">
          <img src="/logo.png" alt="" className="mx-auto mb-6 size-14" />
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-red-300">
            404
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Page not found
          </h1>
          <p className="mx-auto mt-4 max-w-md leading-relaxed text-neutral-400">
            The GeoHelper page you opened does not exist or has moved.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href="/"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 font-semibold text-black transition hover:bg-neutral-200"
            >
              <ArrowLeft className="size-4" />
              Back home
            </a>
            <a
              href={GITHUB_URL}
              {...EXTERNAL_LINK_PROPS}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-5 py-3 text-white transition hover:bg-white/5"
            >
              <Github className="size-4" />
              GitHub
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
