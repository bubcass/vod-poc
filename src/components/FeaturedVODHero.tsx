import React from "react";

type Badge = { label: string; tone?: "blue" | "green" | "gold" | "neutral" };

export default function FeaturedVODHero({
  background,
  title,
  summary,
  meta,
  badges = [],
  onPlay,
}: {
  background?: string;
  title: string;
  summary?: string;
  meta?: string;           // e.g. "47 min · ISL · CC"
  badges?: Badge[];        // e.g. [{label:"Video on demand", tone:"blue"}]
  onPlay?: () => void;     // simulate play for POC
}) {
  return (
    <div className="relative rounded-2xl overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: background ? `url(${background})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: background ? undefined : "#0f0f0f",
        }}
        aria-hidden
      />
      {/* Stronger, filmic gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,.60) 0%, rgba(0,0,0,.45) 35%, rgba(0,0,0,.30) 60%, rgba(0,0,0,.55) 100%)",
        }}
      />

      {/* Content block */}
      <div className="relative px-5 sm:px-8 py-10 sm:py-12">
        <div className="max-w-3xl">
          {/* Badges row */}
          {badges.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {badges.map((b, i) => (
                <span
                  key={i}
                  className={
                    "inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-md border " +
                    (b.tone === "blue"
                      ? "bg-blue-100/70 text-blue-900 border-blue-700"
                      : b.tone === "green"
                      ? "bg-green-100/70 text-green-900 border-green-700"
                      : b.tone === "gold"
                      ? "bg-brand-gold/15 text-brand-gold border-brand-gold"
                      : "bg-white/10 text-white border-white/30")
                  }
                >
                  {b.label}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h2 className="text-white text-3xl sm:text-4xl font-bold font-mont leading-tight [text-shadow:0_2px_8px_rgba(0,0,0,.5)]">
            {title}
          </h2>

          {/* Summary */}
          {summary && (
            <p className="mt-3 text-white/90 text-sm sm:text-base max-w-prose [text-shadow:0_1px_3px_rgba(0,0,0,.5)]">
              {summary}
            </p>
          )}

          {/* Meta */}
          {meta && (
            <p className="mt-2 text-white/80 text-sm [text-shadow:0_1px_3px_rgba(0,0,0,.5)]">
              {meta}
            </p>
          )}

          {/* Controls */}
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onPlay}
              onKeyDown={(e) => e.key === "Enter" && onPlay?.()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold
                         bg-white text-black hover:bg-white/90 focus-visible:outline-none
                         focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white"
              aria-label="Play video"
            >
              {/* Play icon */}
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden className="-ml-0.5">
                <path fill="currentColor" d="M8 5v14l11-7z" />
              </svg>
              Play
            </button>

            <a
              href="#"
              className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium
                         border-2 border-brand-gold text-white hover:bg-brand-gold/10
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold
                         focus-visible:ring-offset-2"
            >
              Add to watchlist
            </a>
          </div>
        </div>
      </div>

      {/* Aspect guard for a cinematic feel */}
      <div className="pointer-events-none select-none opacity-0">
        <div className="aspect-[16/7]" />
      </div>
    </div>
  );
}