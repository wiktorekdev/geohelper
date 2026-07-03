"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      console.warn("Failed to copy text: ", e);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label="Copy launch flags"
      className="shrink-0 rounded border border-white/[0.06] p-1 text-zinc-500 transition hover:text-zinc-300"
    >
      {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
    </button>
  );
}
