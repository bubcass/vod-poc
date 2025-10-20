// src/components/RotatingFeatured.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";

export type FeaturedItem = {
  id: string;
  title: string;
  meta?: string;
  thumb: string;
  href: string;
  debate?: string;
  badges?: { label: string }[];
};

type Props = {
  items: FeaturedItem[];
  intervalMs?: number;
  onPlay?: (item: FeaturedItem) => void;
  showControls?: boolean;
};

export default function RotatingFeatured({
  items,
  intervalMs = 6000,
  onPlay,
  showControls = true,
}: Props) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const count = items.length;
  const clamp = (i: number) => ((i % count) + count) % count;

  const next = () => setIndex((i) => clamp(i + 1));
  const prev = () => setIndex((i) => clamp(i - 1));

  useEffect(() => {
    if (paused || count <= 1) return;
    const t = setInterval(next, intervalMs);
    return () => clearInterval(t);
  }, [paused, intervalMs, count]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const onEnter = () => setPaused(true);
    const onLeave = () => setPaused(false);
    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);
    el.addEventListener("focusin", onEnter);
    el.addEventListener("focusout", onLeave);
    return () => {
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
      el.removeEventListener("focusin", onEnter);
      el.removeEventListener("focusout", onLeave);
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(document.activeElement)) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      } else if (e.code === "Space") {
        e.preventDefault();
        setPaused((p) => !p);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const item = items[index];

  const preloadSrcs = useMemo(() => {
    if (count <= 1) return [item.thumb];
    const prevIdx = clamp(index - 1);
    const nextIdx = clamp(index + 1);
    return [items[prevIdx].thumb, items[nextIdx].thumb];
  }, [index, items, count]);

  // Amber badge to match shelf (adjust if needed)
  const forumBadgeClass =
    "inline-flex items-center px-3 py-1.5 text-[13px] font-semibold rounded-md " +
    "bg-[#FFC107]/90 text-black border border-[#E0A800] shadow-[0_1px_3px_rgba(0,0,0,0.25)] backdrop-blur-sm";

  return (
    <div
      ref={rootRef}
      className="relative w-full overflow-hidden rounded-xl border border-brand-gray-300 shadow-md group"
      aria-roledescription="carousel"
      aria-label="Featured videos"
      tabIndex={0}
    >
      {/* Keep hero in 16:9 like shelf; cap overall height to avoid getting too tall */}
      <div className="relative aspect-video max-h-[70vh]">
        {/* Background image with top emphasis for faces/text near the top */}
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-no-repeat transition-[background-image] duration-500"
          style={{
            backgroundImage: `url(${item.thumb})`,
            backgroundPosition: "top",
          }}
          role="img"
          aria-label={item.title}
        />

        {/* Preload neighbors */}
        {preloadSrcs.map((src, i) => (
          <link key={i} rel="preload" as="image" href={src} />
        ))}

        {/* Gradient */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/40 to-transparent" />

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-end p-6 sm:p-8">
          <div className="max-w-2xl">
            {/* Forum/location badges */}
            {item.badges && item.badges.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {item.badges.map((b, i) => (
                  <span key={i} className={forumBadgeClass}>
                    {b.label}
                  </span>
                ))}
              </div>
            )}

            {/* Title */}
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 leading-snug drop-shadow-md">
              {item.title}
            </h2>

            {/* Meta (can include bolded date via your data split) */}
            {item.meta && <p className="text-white/85 text-sm mb-3">{item.meta}</p>}

            {/* CTAs */}
            <div className="flex gap-3">
              <button
                onClick={() => onPlay?.(item)}
                className="px-4 py-2 bg-brand-gold text-white text-sm font-medium rounded-md hover:bg-brand-gold/90 transition"
              >
                ▶ Watch now
              </button>
              {item.debate && (
                <a
                  href={item.debate}
                  className="px-4 py-2 bg-white/10 text-white text-sm font-medium rounded-md hover:bg-white/20 transition border border-white/20"
                >
                  Read debate
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        {showControls && count > 1 && (
          <>
            <button
              aria-label="Previous"
              onClick={prev}
              className="absolute z-20 left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 text-white backdrop-blur-sm border border-white/20 hover:bg-black/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-white transition opacity-100 md:opacity-0 md:group-hover:opacity-100"
            >
              ‹
            </button>
            <button
              aria-label="Next"
              onClick={next}
              className="absolute z-20 right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 text-white backdrop-blur-sm border border-white/20 hover:bg-black/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-white transition opacity-100 md:opacity-0 md:group-hover:opacity-100"
            >
              ›
            </button>
          </>
        )}

        {/* Dots + pause */}
        <div className="absolute z-20 bottom-3 right-4 flex items-center gap-2">
          <button
            onClick={() => setPaused((p) => !p)}
            className="text-white/80 text-xs px-2 py-0.5 rounded bg-black/30 hover:bg黑/50 border border-white/20"
            aria-pressed={paused}
            aria-label={paused ? "Resume autoplay" : "Pause autoplay"}
            title={paused ? "Resume" : "Pause"}
          >
            {paused ? "▶" : "⏸"}
          </button>
          {items.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`w-2.5 h-2.5 rounded-full ${i === index ? "bg-white" : "bg-white/40"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}