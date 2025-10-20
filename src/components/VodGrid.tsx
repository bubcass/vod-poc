// src/components/VodGrid.tsx
import React from "react";

export type VodGridItem = {
  id: string;
  title: string;
  href: string;
  thumb?: string;
  badges?: string[];
  kind?: string;
};

type Props = {
  title: string;
  items: VodGridItem[];
  className?: string;
};

// 🟡 Amber brand badge styling
const pillClasses = () =>
  "bg-[#FFC107]/95 text-black border border-[#E0A800]/80 shadow-sm";

export default function VodGrid({ title, items, className = "" }: Props) {
  const visibleItems = items.slice(0, 9);

  return (
    <section className="py-12 border-t border-brand-gray-300">
      <div className={`max-w-7xl mx-auto px-4 ${className}`}>
        <h2 className="text-2xl font-semibold font-mont text-brand-gold mb-6">
          {title}
        </h2>

        {!visibleItems?.length ? (
          <p className="text-sm text-brand-gray-700">Nothing to show right now.</p>
        ) : (
          <ul
            role="list"
            aria-label={title}
            className="
              grid gap-6
              grid-cols-1
              sm:grid-cols-2
              md:grid-cols-3
              lg:grid-cols-3
              xl:grid-cols-3
              2xl:grid-cols-4
            "
          >
            {visibleItems.map((it) => {
              const pills = it.badges?.length ? it.badges : it.kind ? [it.kind] : [];
              return (
                <li key={it.id}>
                  <article className="group relative rounded-lg overflow-hidden bg-brand-gray-100 shadow-sm hover:shadow-lg transition">
                    <a href={it.href} aria-label={it.title} className="block relative">
                      <div className="aspect-[16/9] overflow-hidden">
                        {it.thumb && (
                          <img
                            src={it.thumb}
                            alt=""
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.06]"
                          />
                        )}
                      </div>

                      {/* 🟡 top-left badges */}
                      {pills.length > 0 && (
                        <div className="pointer-events-none absolute top-3 left-3 flex flex-wrap gap-1.5">
                          {pills.map((p, i) => (
                            <span
                              key={i}
                              className={`inline-flex items-center px-2.5 py-1 text-[11px] rounded-md font-medium backdrop-blur-sm ${pillClasses()}`}
                            >
                              {p}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* ▶️ hover play overlay */}
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200 bg-black/40">
                        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white/95 text-brand-gray-800 border border-white shadow-lg">
                          <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden>
                            <path fill="currentColor" d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>

                      {/* title overlay */}
                      <div className="absolute inset-x-0 bottom-0">
                        <div
                          className="
                            bg-gradient-to-t from-black/70 via-black/25 to-transparent
                            px-4 pb-3 pt-12
                            opacity-95 group-hover:opacity-100 transition
                          "
                        >
                          <h3 className="text-white text-lg font-medium leading-snug line-clamp-2 drop-shadow-sm">
                            {it.title}
                          </h3>
                        </div>
                      </div>

                      {/* focus ring */}
                      <span className="absolute inset-0 rounded-lg ring-0 ring-brand-gold/0 group-focus-visible:ring-2 group-focus-visible:ring-brand-gold/80 transition-shadow" />
                    </a>
                  </article>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}