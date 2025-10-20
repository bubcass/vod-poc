// src/pages/VodPage.tsx
import React, { useMemo, useState } from "react";
import { TopTabs, TabKey } from "../components/TopTabs";
import RotatingFeatured, { FeaturedItem } from "../components/RotatingFeatured";
import { vodAll, vodDail, vodSeanad, vodCommittees, VodItem } from "../data/vod";

/** Try very hard to produce { main, rest } for the UI. */
function normalizeMetaFromItem(item: VodItem): { main?: string; rest?: string } {
  const dateField: unknown = (item as any)?.date;
  if (typeof dateField === "string" && dateField.trim()) {
    const restStr =
      typeof item.meta === "object"
        ? item.meta?.rest
        : typeof item.meta === "string"
        ? item.meta.replace(dateField, "").replace(/^(\s*[—·,-]\s*)/, "").trim()
        : undefined;
    return { main: dateField.trim(), rest: restStr };
  }

  if (item.meta && typeof item.meta === "object") {
    return { main: item.meta.main, rest: item.meta.rest };
  }

  const s = typeof item.meta === "string" ? item.meta.trim() : "";
  if (!s) return {};

  let splitIdx = s.indexOf(" — ");
  let sepLen = 3;
  if (splitIdx < 0) {
    splitIdx = s.indexOf(" · ");
    sepLen = 3;
  }

  if (splitIdx >= 0) {
    const main = s.slice(0, splitIdx).trim();
    const rest = s.slice(splitIdx + sepLen).trim();
    return { main, rest };
  }

  const dotIdx = s.indexOf(" · ");
  if (dotIdx > 0) {
    return { main: s.slice(0, dotIdx).trim(), rest: s.slice(dotIdx + 3).trim() };
  }

  return { rest: s };
}

export default function VodPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("ALL");
  const [q, setQ] = useState("");

  const itemsForTab: VodItem[] = useMemo(() => {
    switch (activeTab) {
      case "DAIL":
        return vodDail;
      case "SEANAD":
        return vodSeanad;
      case "COMMITTEES":
        return vodCommittees;
      case "SEARCH":
        return vodAll;
      case "ALL":
      default:
        return vodAll;
    }
  }, [activeTab]);

  // Hero
  const featured: FeaturedItem[] = useMemo(() => {
    if (activeTab === "SEARCH") return [];
    return itemsForTab.slice(0, 5).map((it) => {
      const nm = normalizeMetaFromItem(it);
      return {
        id: it.id,
        title: it.title,
        meta: [nm.main, nm.rest].filter(Boolean).join(" — "),
        thumb: it.thumb,
        href: it.href,
        debate: it.debate,
        badges: it.forum ? [{ label: it.forum }] : undefined,
      };
    });
  }, [itemsForTab, activeTab]);

  // Search filtering
  const filteredForSearch: VodItem[] = useMemo(() => {
    if (activeTab !== "SEARCH") return itemsForTab;
    const term = q.trim().toLowerCase();
    if (!term) return vodAll.slice(0, 30);
    return vodAll
      .filter((v) => {
        const nm = normalizeMetaFromItem(v);
        const hay = [v.title, v.forum, v.topic, nm.main, nm.rest]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(term);
      })
      .slice(0, 30);
  }, [activeTab, q]);

  // --- Explore shelves ---
  const leadersOnly = useMemo(
    () => vodAll.filter((v) => (v.topic || "").toLowerCase().includes("leader")),
    []
  );
  const orderOfBusinessOnly = useMemo(
    () =>
      vodAll.filter((v) => {
        const t = (v.topic || "").toLowerCase();
        const ti = (v.title || "").toLowerCase();
        return t.includes("order of business") || ti.includes("order of business");
      }),
    []
  );
  const privateMembersOnly = useMemo(
    () =>
      vodAll.filter((v) => {
        const t = (v.topic || "").toLowerCase();
        const ti = (v.title || "").toLowerCase();
        return t.includes("private members") || ti.includes("private members");
      }),
    []
  );

  // --- Dáil, Seanad, Committees shelves ---
  const leadersDail = useMemo(
    () =>
      vodAll.filter(
        (v) =>
          v.forum === "Dáil Éireann" &&
          ((v.topic || "").toLowerCase().includes("leader") ||
            (v.title || "").toLowerCase().includes("leader"))
      ),
    []
  );

  const orderSeanad = useMemo(
    () =>
      vodAll.filter(
        (v) =>
          v.forum === "Seanad Éireann" &&
          ((v.topic || "").toLowerCase().includes("order of business") ||
            (v.title || "").toLowerCase().includes("order of business"))
      ),
    []
  );

  // 👇 NEW: Committees-specific filter for “Schools funding”
  const schoolsFunding = useMemo(
    () =>
      vodAll.filter(
        (v) =>
          v.forum?.toLowerCase().includes("committee") &&
          (v.title?.toLowerCase().includes("school") ||
            v.topic?.toLowerCase().includes("school")) &&
          (v.title?.toLowerCase().includes("funding") ||
            v.topic?.toLowerCase().includes("funding"))
      ),
    []
  );

  const VISIBLE_LIMIT = activeTab === "SEARCH" ? 30 : 8;

  return (
    <div className="min-h-screen flex flex-col bg-brand-cream text-brand-gray-800">
      {/* HEADER */}
      <header className="bg-white border-b border-brand-gray-300">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <h1 className="text-center text-[1.8rem] sm:text-[2.1rem] md:text-[2.4rem] font-semibold tracking-tight text-brand-gray-800 mb-3 leading-tight">
            Inside Parliament | Video on demand
          </h1>
          <TopTabs value={activeTab} onChange={setActiveTab} />
        </div>
      </header>

      {/* HERO / SEARCH */}
      {activeTab === "SEARCH" ? (
        <section className="bg-gradient-to-b from-brand-gray-50 to-brand-cream">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="rounded-xl border border-brand-gray-300 bg-white/70 backdrop-blur p-4">
              <label htmlFor="vod-search" className="block text-sm font-medium text-brand-gray-700 mb-1">
                Search
              </label>
              <input
                id="vod-search"
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder='Try terms like "Order of Business", "Dáil", "Committee on Health", "27 April"...'
                className="w-full rounded-md border border-brand-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
              <div className="mt-2 text-xs text-brand-gray-600">
                Showing {filteredForSearch.length} result
                {filteredForSearch.length === 1 ? "" : "s"}
                {q ? <> for <span className="font-medium">“{q}”</span></> : null}.
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="bg-gradient-to-b from-brand-gray-50 to-brand-cream">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <RotatingFeatured items={featured} intervalMs={6000} onPlay={(item) => alert(`Play: ${item.title}`)} />
          </div>
        </section>
      )}

      {/* MAIN */}
      <main className="flex-grow">
        {/* Primary shelf */}
        <VodGrid
          title={activeTab === "SEARCH" ? "Search results" : "Explore recent debates"}
          items={activeTab === "SEARCH" ? filteredForSearch : itemsForTab}
          limit={VISIBLE_LIMIT}
        />

        {/* Explore-only shelves */}
        {activeTab === "ALL" && leadersOnly.length > 0 && (
          <VodGrid title="Discover: Leaders’ Questions" items={leadersOnly} limit={9} />
        )}
        {activeTab === "ALL" && orderOfBusinessOnly.length > 0 && (
          <VodGrid title="Discover: Order of Business" items={orderOfBusinessOnly} limit={9} />
        )}
        {activeTab === "ALL" && privateMembersOnly.length > 0 && (
          <VodGrid title="Discover: Private Members’ Business" items={privateMembersOnly} limit={9} />
        )}

        {/* Dáil-specific shelf */}
        {activeTab === "DAIL" && leadersDail.length > 0 && (
          <VodGrid title="Discover: Leaders’ Questions" items={leadersDail} limit={9} />
        )}

        {/* Seanad-specific shelf */}
        {activeTab === "SEANAD" && orderSeanad.length > 0 && (
          <VodGrid title="Discover: Order of Business" items={orderSeanad} limit={9} />
        )}

        {/* 👇 NEW Committees-specific shelf */}
        {activeTab === "COMMITTEES" && schoolsFunding.length > 0 && (
          <VodGrid title="In Focus: Schools funding" items={schoolsFunding} limit={9} />
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-brand-gray-300">
        <div className="max-w-7xl mx-auto px-4 py-6 text-sm text-brand-gray-600 flex flex-col sm:flex-row justify-between">
          <p>© Houses of the Oireachtas 2025</p>
          <p>
            <a className="hover:underline" href="https://www.oireachtas.ie/en/accessibility-statement/">
              Accessibility
            </a>{" "}
            ·{" "}
            <a className="hover:underline" href="https://www.oireachtas.ie/en/transparency/">
              Transparency
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ===================== Local components ===================== */

function VodGrid({
  title,
  items,
  limit,
}: {
  title: string;
  items: VodItem[];
  limit?: number;
}) {
  const list = typeof limit === "number" ? items.slice(0, limit) : items;

  return (
    <section className="py-8 border-t border-brand-gray-300">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-semibold font-mont text-brand-gold mb-3">{title}</h2>

        {/* Mobile scroll */}
        <div className="md:hidden">
          <div
            className="flex gap-4 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="list"
            aria-label={title}
          >
            {list.map((it) => (
              <div key={it.id} className="min-w-[260px] snap-start shrink-0">
                <VodCard item={it} />
              </div>
            ))}
          </div>
        </div>

        {/* Desktop grid */}
        <div className="hidden md:grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4">
          {list.map((it) => (
            <VodCard key={it.id} item={it} />
          ))}
        </div>
      </div>
    </section>
  );
}

function VodCard({ item }: { item: VodItem }) {
  const { main: metaMain, rest: metaRest } = normalizeMetaFromItem(item);

  return (
    <a
      href={item.href}
      className="group block bg-white rounded-md overflow-hidden border border-brand-gray-300 hover:shadow-md transition h-full"
    >
      <div className="relative aspect-video overflow-hidden bg-brand-gray-100">
        <img
          src={item.thumb}
          alt=""
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          loading="lazy"
        />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/35">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/90 text-brand-gray-800 border border-white">
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
              <path fill="currentColor" d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
        {item.forum && (
          <span className="absolute left-2 bottom-2 inline-flex items-center px-2.5 py-0.5 text-[11px] font-semibold rounded-md bg-[#FFC107]/90 text-black border border-[#E0A800] shadow-sm">
            {item.forum}
          </span>
        )}
      </div>

      <div className="p-3">
        <h3 className="font-medium text-brand-gray-800 leading-snug line-clamp-2 xl:line-clamp-3 2xl:line-clamp-4">
          {item.title}
        </h3>
        {metaMain && (
          <div className="text-[13px] font-semibold text-brand-gray-900 mt-1">{metaMain}</div>
        )}
        {metaRest && (
          <div className="text-xs text-brand-gray-700 mt-0.5 line-clamp-1 xl:line-clamp-2 2xl:line-clamp-none">
            {metaRest}
          </div>
        )}
      </div>
    </a>
  );
}