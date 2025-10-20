import React from "react";

type CTA = { label: string; href: string; variant?: "primary" | "secondary" | "outline" };

type HeroBannerProps = {
  stateBadge?: { text: string };            // e.g. "Adjourned — resumes at 14:00"
  tagline: string;                          // e.g. "Inside Parliament | Dáil Éireann"
  title: string;                            // e.g. "Proceedings paused"
  description?: string;
  background: string;                       // image url (import or path)
  ctas?: CTA[];                             // uses your .btn utilities
  bottomSlot?: React.ReactNode;             // e.g. the video placeholder frame
};

export default function HeroBanner({
  stateBadge,
  tagline,
  title,
  description,
  background,
  ctas = [],
  bottomSlot,
}: HeroBannerProps) {
  return (
    <section className="relative">
      <div className="relative max-w-6xl mx-auto px-4 pt-10 pb-6">
        {/* visual hero */}
        <div className="relative overflow-hidden rounded-2xl border border-brand-gray-300">
          {/* background image */}
          <div
            className="aspect-video bg-brand-gray-100"
            style={{
              backgroundImage: `url(${background})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            aria-hidden
          />
          {/* overlay for legibility */}
          <div className="hero-overlay" />

          {/* content overlay */}
          <div className="absolute inset-0 flex items-end">
            <div className="p-6 sm:p-8 w-full">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                {/* state badge (cream chip) */}
                {stateBadge && (
                  <span className="inline-flex items-center bg-brand-cream/95 text-brand-gray-800 px-3 py-1 rounded-full text-xs font-medium border border-brand-gray-300">
                    {stateBadge.text}
                  </span>
                )}
                {/* tagline */}
                <span className="tagline">{tagline}</span>
              </div>

              <h2 className="text-white title-shadow text-2xl sm:text-3xl font-bold font-mont">
                {title}
              </h2>

              {description && (
                <p className="mt-2 text-brand-cream/95 max-w-2xl">
                  {description}
                </p>
              )}

              {ctas.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-3">
                  {ctas.map((c) => (
                    <a
                      key={c.label}
                      href={c.href}
                      className={
                        "btn " +
                        (c.variant === "secondary"
                          ? "btn-secondary"
                          : c.variant === "outline"
                          ? "btn-outline"
                          : "btn-primary")
                      }
                    >
                      {c.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Optional element below the hero (e.g., processing slate or static placeholder) */}
        {bottomSlot && <div className="mt-6">{bottomSlot}</div>}
      </div>
    </section>
  );
}