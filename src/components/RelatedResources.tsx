// src/components/RelatedResources.tsx
import React from "react";

export type RelatedItem = {
  id: string;
  title: string;
  href: string;
  meta?: string;
  thumb?: string;   // 16:9
  badge?: string;
};

export function RelatedResources({
  title,
  items = [],
}: {
  title: string;
  items: RelatedItem[];
}) {
  return (
    <section className="bg-brand-cream py-12 border-t border-brand-gray-300">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-semibold mb-4 font-mont text-brand-gold">
          {title}
        </h2>

        {/* ⛳ Loud empty-state so you can verify the component appears */}
        {(!items || items.length === 0) && (
          <div className="rounded-md border border-amber-400 bg-amber-50 text-amber-900 p-4">
            <p>
              <strong>Debug:</strong> RelatedResources is rendering, but
              <em> items[] is empty</em>. Wire your data or use the test data below.
            </p>
          </div>
        )}

        {items && items.length > 0 && (
          <ul
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            role="list"
            aria-label={title}
          >
            {items.map((it) => (
              <li key={it.id} role="listitem">
                <a
                  href={it.href}
                  className="group block bg-white rounded-md overflow-hidden border border-brand-gray-300 hover:shadow-md transition"
                >
                  <div className="relative aspect-video overflow-hidden bg-brand-gray-100">
                    {it.thumb ? (
                      <img
                        src={it.thumb}
                        alt=""
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                        loading="lazy"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-brand-gray-600">
                        <svg width="36" height="36" viewBox="0 0 24 24" aria-hidden>
                          <path fill="currentColor" d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    )}
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/35">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/90 text-brand-gray-800 border border-white">
                        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
                          <path fill="currentColor" d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="p-3">
                    {it.badge && (
                      <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded-md bg-brand-gold/15 text-brand-gold border border-brand-gold">
                        {it.badge}
                      </span>
                    )}
                    <h3 className="mt-1 font-medium text-brand-gray-800 leading-snug line-clamp-2">
                      {it.title}
                    </h3>
                    {it.meta && (
                      <p className="text-sm text-brand-gray-700 mt-1">{it.meta}</p>
                    )}
                    <span className="inline-flex items-center gap-1 text-brand-gold text-sm font-medium mt-2 group-hover:underline">
                      View <span aria-hidden>→</span>
                    </span>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export default RelatedResources;