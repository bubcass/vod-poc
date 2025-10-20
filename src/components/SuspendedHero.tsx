import React from "react";

type CTA = { label: string; href: string; variant?: "primary" | "secondary" | "outline"; active?: boolean };

export default function SuspendedHero({
  tagline,
  title,
  description,
  nextLine,
  ctas = [],
  background,
  overlay = 55,
}: {
  tagline?: string | null;
  title: string;
  description?: string;
  nextLine?: string;
  ctas?: CTA[];
  background?: string;
  overlay?: number;
}) {
  return (
    <div className="h-full w-full relative rounded-2xl overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: background ? `url(${background})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: background ? undefined : "#EAE7DD",
        }}
        aria-hidden
      />

      {/* Dark gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to top, rgba(0,0,0,${overlay / 100}), rgba(0,0,0,0.25), rgba(0,0,0,0))`,
        }}
      />

      {/* Content */}
      <div className="relative h-full flex items-end">
        <div className="w-full px-5 sm:px-8 py-8 sm:py-10">
          <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 sm:p-6 max-w-2xl border border-white/10">
            {/* Tagline pill */}
{tagline && (
  <span
    className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold mb-3 shadow-sm border
      ${
        ["sitting suspended", "suspended"].includes(tagline?.trim().toLowerCase())
          ? "bg-[grey] text-white border-[grey]" // purple
          : tagline?.trim().toLowerCase() === "sos"
          ? "bg-[grey] text-[white] border-[grey]" // grey
          : "bg-[#FFC107] text-black border-[#FFC107]" // amber
      }`}
  >
    {tagline}
  </span>
)}

            {/* Title */}
            <h2 className="text-[#f5f5f5] text-2xl sm:text-3xl font-bold font-mont mb-3 [text-shadow:0_1px_3px_rgba(0,0,0,.4)]">
              {title}
            </h2>

            {/* Next line */}
           {nextLine && (
  <p className="text-[#f5f5f5] font-semibold mb-3 animate-subtlePulse">
    {nextLine}
  </p>
)}

            {/* Description */}
            {description && (
              <p className="text-[#f5f5f5] text-sm sm:text-base mb-4">
                {description}
              </p>
            )}

            {/* CTAs */}
            {ctas.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {ctas.map((c) => {
                  const base =
                    "px-4 py-2 rounded-md text-sm font-medium transition";
                  
                  if (c.variant === "outline") {
                    return (
                      <a
                        key={c.label}
                        href={c.href}
                        className={`${base}
                          border-2 border-brand-gold text-[#f5f5f5]
                          hover:bg-brand-gold/10
                          focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2
                          focus:bg-brand-gold focus:text-white
                          active:bg-brand-gold active:text-white
                          transition-colors`}
                      >
                        {c.label}
                      </a>
                    );
                  }

                  if (c.variant === "secondary") {
                    return (
                      <a
                        key={c.label}
                        href={c.href}
                        className={`${base} bg-[#f5f5f5] text-black hover:bg-white`}
                      >
                        {c.label}
                      </a>
                    );
                  }

                  // primary
                  return (
                    <a
                      key={c.label}
                      href={c.href}
                      className={`${base} bg-brand-gold text-white hover:bg-brand-gold/90`}
                    >
                      {c.label}
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}