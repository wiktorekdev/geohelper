"use client";

import { useEffect, useState } from "react";

export default function StickyHeader({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={
        "sticky top-0 z-40 transition-colors duration-200 sticky-header-container " +
        (scrolled
          ? "border-b border-white/[0.06] bg-zinc-950/80 backdrop-blur-xl"
          : "border-b border-transparent")
      }
    >
      {children}
    </div>
  );
}
