import { ArrowLeft, Github } from "lucide-react";

import { EXTERNAL_LINK_PROPS, GITHUB_URL } from "../links";

export default function NotFoundContent() {
  return (
    <main className="min-h-dvh bg-zinc-950 text-zinc-100">
      <div className="grid min-h-dvh place-items-center px-6">
        <section className="w-full max-w-md text-center">
          <img src="/logo.png" alt="" className="mx-auto mb-6 size-12 opacity-60" />
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-indigo-400">
            404
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Page not found
          </h1>
          <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-zinc-500">
            The GeoHelper page you opened does not exist or has moved.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href="/"
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-5 py-3 font-semibold text-white transition hover:bg-indigo-400"
            >
              <ArrowLeft className="size-4" />
              Back home
            </a>
            <a
              href={GITHUB_URL}
              {...EXTERNAL_LINK_PROPS}
              className="inline-flex items-center gap-2 rounded-lg border border-white/[0.08] px-5 py-3 text-zinc-300 transition hover:border-white/[0.15] hover:text-white"
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
