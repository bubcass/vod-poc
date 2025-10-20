import React, { useEffect, useRef, useState } from "react";

export type StorItem = {
  id: string;
  unit:
    | "Parliamentary Budget Office"
    | "Parliamentary Research Service"
    | "Library & Research Service"
    | "Learning Hub"
    | string;
  title: string;
  subtitle?: string;
  meta?: string;
  href: string;
};

type Props = {
  title: string;
  items: StorItem[];
  perView?: { base?: number; md?: number; lg?: number; xl?: number };
  gapPx?: number;
};

// Pill styling per unit (no top colour block)
function unitPill(unit: string) {
  const name = unit.toLowerCase();

  if (name.includes("budget")) {
    // 🟣 Parliamentary Budget Office
    return "bg-[#f3e6f1] text-[#670048] border border-[#670048]";
  }

  if (name.includes("research service") && !name.includes("library")) {
    // 🔵 Parliamentary Research Service
    return "bg-[#e8eaf3] text-[#2b3c71] border border-[#2b3c71]";
  }

  if (name.includes("library")) {
    // 🟤 Library & Research Service
    return "bg-brand-gold/15 text-brand-gold border border-brand-gold";
  }

  if (name.includes("learning hub")) {
    return "bg-yellow-100 text-yellow-800 border border-yellow-400";
  }

  // default fallback
  return "bg-brand-gold/15 text-brand-gold border border-brand-gold";
}

export function StorCarousel({
  title,
  items,
  perView = { base: 1, md: 2, lg: 4, xl: 4 },
  gapPx = 16,
}: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);
  const [pageIdx, setPageIdx] = useState(0);
  const [cardWidth, setCardWidth] = useState<number | undefined>(undefined);

  const getColsForWidth = (w: number) => {
    if (w >= 1280) return perView.xl ?? perView.lg ?? perView.md ?? perView.base ?? 1;
    if (w >= 1024) return perView.lg ?? perView.md ?? perView.base ?? 1;
    if (w >= 768) return perView.md ?? perView.base ?? 1;
    return perView.base ?? 1;
  };

  const stepWidth = () => (cardWidth ?? 320) + gapPx;

  const recalcCardWidth = () => {
    const track = trackRef.current;
    if (!track) return;
    const cols = Math.max(1, getColsForWidth(track.clientWidth));
    const width = Math.floor((track.clientWidth - gapPx * (cols - 1)) / cols);
    setCardWidth(width);
  };

  const updateScrollState = () => {
    const t = trackRef.current!;
    const maxScroll = t.scrollWidth - t.clientWidth;
    setCanPrev(t.scrollLeft > 0);
    setCanNext(t.scrollLeft < maxScroll - 1);
    setPageIdx(Math.round(t.scrollLeft / stepWidth()));
  };

  useEffect(() => {
    const t = trackRef.current!;
    recalcCardWidth();
    updateScrollState();

    const onScroll = () => updateScrollState();
    t.addEventListener("scroll", onScroll, { passive: true });

    const ro = new ResizeObserver(() => {
      recalcCardWidth();
      requestAnimationFrame(updateScrollState);
    });
    ro.observe(t);

    const onWindowResize = () => {
      recalcCardWidth();
      requestAnimationFrame(updateScrollState);
    };
    window.addEventListener("resize", onWindowResize);

    return () => {
      t.removeEventListener("scroll", onScroll);
      ro.disconnect();
      window.removeEventListener("resize", onWindowResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gapPx, perView.base, perView.md, perView.lg, perView.xl]);

  const scrollByDir = (dir: number) => {
    trackRef.current?.scrollBy({ left: dir * stepWidth(), behavior: "smooth" });
  };

  if (!items?.length) {
    return (
      <section className="py-8 border-t border-brand-gray-300">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-semibold mb-2 font-mont text-brand-gold">
            {title}
          </h2>
          <p className="text-sm text-brand-gray-700">Nothing to show right now.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 border-t border-brand-gray-300">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-end justify-between mb-3">
          <h2 className="text-2xl font-semibold font-mont text-brand-gold">{title}</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-brand-gray-300 disabled:opacity-40 text-brand-gray-800 bg-white hover:bg-brand-gray-100"
              aria-label="Scroll left"
              disabled={!canPrev}
              onClick={() => scrollByDir(-1)}
            >
              ←
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-brand-gray-300 disabled:opacity-40 text-brand-gray-800 bg-white hover:bg-brand-gray-100"
              aria-label="Scroll right"
              disabled={!canNext}
              onClick={() => scrollByDir(1)}
            >
              →
            </button>
          </div>
        </div>

        {/* Cards */}
        <div
          className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 focus:outline-none
                     [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="list"
          aria-label={title}
          tabIndex={0}
          ref={trackRef}
        >
          {items.map((item) => (
            <article
              role="listitem"
              key={item.id}
              className="carousel-item snap-start shrink-0 rounded-lg border border-brand-gray-300 hover:shadow-sm transition bg-white p-4 flex flex-col justify-between"
              style={{ width: cardWidth ?? undefined }}
            >
              <div>
                <span
                  className={
                    "inline-flex items-center px-2 py-0.5 text-[11px] rounded-md font-medium " +
                    unitPill(item.unit)
                  }
                >
                  {item.unit}
                </span>

                {item.subtitle && (
                  <div className="text-xs text-brand-gray-600 mt-1">{item.subtitle}</div>
                )}

                <h3 className="font-medium leading-snug mt-2 text-brand-gray-800 line-clamp-3">
                  {item.title}
                </h3>

                {item.meta && (
                  <p className="text-sm text-brand-gray-700 mt-1">{item.meta}</p>
                )}
              </div>

              <a
                href={item.href}
                className="inline-flex items-center gap-1 text-brand-gold text-sm font-medium mt-3 hover:underline"
              >
                Read <span aria-hidden>→</span>
              </a>
            </article>
          ))}
        </div>

        {/* Dots */}
        <div className="flex items-center justify-center gap-2 mt-4" aria-hidden>
          {Array.from({ length: Math.max(1, Math.ceil(items.length / 3)) }).map((_, i) => (
            <span
              key={i}
              className={
                "w-2.5 h-2.5 rounded-full " +
                (i === pageIdx ? "bg-brand-gray-800" : "bg-brand-gray-300")
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}