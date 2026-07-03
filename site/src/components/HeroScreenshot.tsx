"use client";

import { useEffect, useRef, useState } from "react";

export default function HeroScreenshot() {
  const shots = [
    { src: "/paris.png", label: "Normal Mode" },
    { src: "/edit-mode.png", label: "Edit Mode" },
  ];
  const [idx, setIdx] = useState(0);
  const paused = useRef(false);

  useEffect(() => {
    const t = setInterval(() => {
      if (!paused.current) setIdx((i) => (i + 1) % shots.length);
    }, 4200);
    return () => clearInterval(t);
  }, [shots.length]);

  return (
    <section className="relative mx-auto max-w-6xl px-6 pb-28">
      <div
        className="relative overflow-hidden rounded-xl border border-white/[0.06] bg-zinc-950 shadow-2xl shadow-indigo-500/[0.03]"
        onMouseEnter={() => {
          paused.current = true;
        }}
        onMouseLeave={() => {
          paused.current = false;
        }}
      >
        {shots.map((s, i) => (
          <img
            key={s.src}
            src={s.src}
            alt={`GeoHelper showing ${s.label}`}
            fetchPriority={i === 0 ? "high" : "low"}
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
            style={{ opacity: i === idx ? 1 : 0 }}
          />
        ))}
        <img
          src={shots[0].src}
          aria-hidden
          className="block w-full opacity-0"
          alt=""
          fetchPriority="high"
        />
      </div>
    </section>
  );
}
