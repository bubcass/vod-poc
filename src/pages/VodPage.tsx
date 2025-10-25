// src/pages/VodPage.tsx
import React, { useMemo, useState, useEffect, useRef } from "react";
import { TopTabs, TabKey } from "../components/TopTabs";
import { vodAll, vodDail, vodSeanad, vodCommittees, VodItem } from "../data/vod";

/** Try very hard to produce { main, rest } for the UI. */
function normalizeMetaFromItem(item: VodItem): { main?: string; rest?: string } {
  const dateField: unknown = (item as any)?.date;
  if (typeof dateField === "string" && dateField.trim()) {
    const restStr =
      typeof (item as any).meta === "object"
        ? (item as any).meta?.rest
        : typeof (item as any).meta === "string"
        ? (item as any).meta.replace(dateField, "").replace(/^(\s*[—·,-]\s*)/, "").trim()
        : undefined;
    return { main: dateField.trim(), rest: restStr };
  }

  const meta = (item as any).meta;
  if (meta && typeof meta === "object") return { main: meta.main, rest: meta.rest };

  const s = typeof meta === "string" ? meta.trim() : "";
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
  if (dotIdx > 0) return { main: s.slice(0, dotIdx).trim(), rest: s.slice(dotIdx + 3).trim() };

  return { rest: s };
}

export default function VodPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("ALL");
  const [q, setQ] = useState("");

  // Base items by tab
  const itemsForTab: VodItem[] = useMemo(() => {
    switch (activeTab) {
      case "DAIL": return vodDail;
      case "SEANAD": return vodSeanad;
      case "COMMITTEES": return vodCommittees;
      case "SEARCH": return vodAll;
      case "ALL":
      default: return vodAll;
    }
  }, [activeTab]);

  // Featured (non-SEARCH) — note join by " · "
  const featured = useMemo(() => {
    if (activeTab === "SEARCH") return [];
    return itemsForTab.slice(0, 5).map((it) => {
      const nm = normalizeMetaFromItem(it);
      return {
        id: it.id,
        title: it.title,
        meta: [nm.main, nm.rest].filter(Boolean).join(" · "),
        thumb: it.thumb,
        href: it.href,
        debate: (it as any).debate,
        forum: it.forum,
        status: (((it as any)?.status ?? "") as string).toLowerCase(),
      };
    });
  }, [itemsForTab, activeTab]);

  // SEARCH results
  const filteredForSearch: VodItem[] = useMemo(() => {
    if (activeTab !== "SEARCH") return itemsForTab;
    const term = q.trim().toLowerCase();
    if (!term) return vodAll.slice(0, 30);
    return vodAll
      .filter((v) => {
        const nm = normalizeMetaFromItem(v);
        const hay = [v.title, v.forum, (v as any).topic, nm.main, nm.rest]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(term);
      })
      .slice(0, 30);
  }, [activeTab, q, itemsForTab]);

  // Explore shelves
  const leadersOnly = useMemo(
    () => vodAll.filter((v) => (((v as any).topic || "") as string).toLowerCase().includes("leader")),
    []
  );
  const orderOfBusinessOnly = useMemo(
    () =>
      vodAll.filter((v) => {
        const t = (((v as any).topic || "") as string).toLowerCase();
        const ti = (v.title || "").toLowerCase();
        return t.includes("order of business") || ti.includes("order of business");
      }),
    []
  );
  const privateMembersOnly = useMemo(
    () =>
      vodAll.filter((v) => {
        const t = (((v as any).topic || "") as string).toLowerCase();
        const ti = (v.title || "").toLowerCase();
        return t.includes("private members") || ti.includes("private members");
      }),
    []
  );

  // Per-forum shelves
  const leadersDail = useMemo(
    () =>
      vodAll.filter(
        (v) =>
          v.forum === "Dáil Éireann" &&
          ((((v as any).topic || "") as string).toLowerCase().includes("leader") ||
            (v.title || "").toLowerCase().includes("leader"))
      ),
    []
  );

  const orderSeanad = useMemo(
    () =>
      vodAll.filter(
        (v) =>
          v.forum === "Seanad Éireann" &&
          ((((v as any).topic || "") as string).toLowerCase().includes("order of business") ||
            (v.title || "").toLowerCase().includes("order of business"))
      ),
    []
  );

  const schoolsFunding = useMemo(
    () =>
      vodAll.filter(
        (v) =>
          (v.forum || "").toLowerCase().includes("committee") &&
          ((v.title || "").toLowerCase().includes("school") ||
            (((v as any).topic || "") as string).toLowerCase().includes("school")) &&
          ((v.title || "").toLowerCase().includes("funding") ||
            (((v as any).topic || "") as string).toLowerCase().includes("funding"))
      ),
    []
  );

  // ----- DATA-DRIVEN "On now" slides for ALL tab -----
  type FeaturedItemLocal = {
    id: string;
    title: string; // will show in subline
    meta?: string; // already joined with dot
    thumb: string;
    href?: string;
    debate?: string;
    forum?: string; // big headline
    status?: string; // controls pill on ALL tab
    badges?: { label: string }[];
  };

  const ON_NOW = new Set(["live", "in public session", "public", "vote", "vótáil", "votáil", "votail"]);

  const allFromDataOnNow: FeaturedItemLocal[] = useMemo(() => {
    const items = vodAll
      .filter((v) => ON_NOW.has((((v as any).status ?? "") as string).toLowerCase()))
      .map((v) => {
        const nm = normalizeMetaFromItem(v);
        return {
          id: v.id,
          title: v.title,
          meta: nm.rest || "", // exclude date for On now
          thumb: v.thumb,
          href: v.href,
          debate: (v as any).debate,
          forum: v.forum,
          status: (((v as any).status ?? "") as string).toLowerCase(),
        } as FeaturedItemLocal;
      });

    const chamberRank = (forum: string) =>
      forum?.toLowerCase().includes("dáil") ? 0 :
      forum?.toLowerCase().includes("seanad") ? 1 :
      2;

    items.sort((a, b) => {
      const ar = chamberRank(a.forum || "");
      const br = chamberRank(b.forum || "");
      if (ar !== br) return ar - br;
      return (a.title || "").localeCompare(b.title || "");
    });

    return items;
  }, []);

  const VISIBLE_LIMIT = activeTab === "SEARCH" ? 30 : 8;

  return (
    <div className="min-h-screen flex flex-col bg-brand-cream text-brand-gray-800">
      {/* HEADER */}
      <header className="bg-white border-b border-brand-gray-300">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <h1 className="text-center text-[1.8rem] sm:text-[2.1rem] md:text-[2.4rem] font-semibold tracking-tight text-brand-gray-800 mb-3 leading-tight">
            Inside Parliament | Watch
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
                Showing {filteredForSearch.length} result{filteredForSearch.length === 1 ? "" : "s"}
                {q ? <> for <span className="font-medium">“{q}”</span></> : null}.
              </div>
            </div>
          </div>
        </section>
      ) : (
        // Width-stable hero
        <section className="bg-gradient-to-b from-brand-gray-50 to-brand-cream">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <HeroCarousel
              items={activeTab === "ALL"
                ? (allFromDataOnNow.length ? (allFromDataOnNow as any) : (featured as any))
                : (featured as any)}
              intervalMs={6000}
              onPlay={(item) => item.href && window.open(item.href, "_self")}
              liveMode={activeTab === "ALL" && allFromDataOnNow.length > 0}
            />
          </div>
        </section>
      )}

      {/* MAIN */}
      <main className="flex-grow">
        <VodGrid
          title={activeTab === "SEARCH" ? "Search results" : "Explore recent debates"}
          items={activeTab === "SEARCH" ? filteredForSearch : itemsForTab}
          limit={VISIBLE_LIMIT}
        />

        {activeTab === "ALL" && leadersOnly.length > 0 && (
          <VodGrid title="Discover: Leaders’ Questions" items={leadersOnly} limit={9} />
        )}
        {activeTab === "ALL" && orderOfBusinessOnly.length > 0 && (
          <VodGrid title="Discover: Order of Business" items={orderOfBusinessOnly} limit={9} />
        )}
        {activeTab === "ALL" && privateMembersOnly.length > 0 && (
          <VodGrid title="Discover: Private Members’ Business" items={privateMembersOnly} limit={9} />
        )}

        {activeTab === "DAIL" && leadersDail.length > 0 && (
          <VodGrid title="Discover: Leaders’ Questions" items={leadersDail} limit={9} />
        )}

        {activeTab === "SEANAD" && orderSeanad.length > 0 && (
          <VodGrid title="Discover: Order of Business" items={orderSeanad} limit={9} />
        )}

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

  const rawStatus = (((item as any)?.status || "") as string).toLowerCase();
  const isSpecial =
    rawStatus === "live" ||
    rawStatus === "public" ||
    rawStatus === "in public session" ||
    rawStatus === "vote" ||
    rawStatus === "vótáil" ||
    rawStatus === "votáil" ||
    rawStatus === "votail";
  const showOnDemand = !isSpecial;

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

        {/* Badge row (bottom-left) */}
        <div className="absolute left-2 bottom-2 flex items-center gap-1">
          {item.forum && (
            <span className="inline-flex items-center px-2.5 py-0.5 text-[11px] font-semibold rounded-md bg-[#FFC107]/90 text-black border border-[#E0A800] shadow-sm">
              {item.forum}
            </span>
          )}
          {showOnDemand && (
            <span className="inline-flex items-center px-2.5 py-0.5 text-[11px] font-semibold rounded-md bg-blue-300/90 text-blue-900 border border-blue-400 shadow-sm">
              On demand
            </span>
          )}
        </div>

        {/* Hover play */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/35">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/90 text-brand-gray-800 border border-white">
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
              <path fill="currentColor" d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
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

/* ===================== Width-stable container-locked hero carousel ===================== */

type FeaturedItemLocalHC = {
  id: string;
  title: string; // used in subline
  meta?: string;  // joined with dot
  thumb: string;
  href?: string;
  debate?: string;
  forum?: string; // shown as the big headline
  status?: string; // used on ALL tab
  badges?: { label: string }[];
};

function HeroCarousel({
  items,
  intervalMs = 6000,
  onPlay,
  liveMode = false,
}: {
  items: FeaturedItemLocalHC[];
  intervalMs?: number;
  onPlay?: (item: FeaturedItemLocalHC) => void;
  liveMode?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const count = items.length;
  if (count === 0) return null;

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
      if (e.key === "ArrowRight") { e.preventDefault(); next(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
      else if (e.code === "Space") { e.preventDefault(); setPaused((p) => !p); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const item = items[index];

  // Pill styles (both Live and Vótáil pulse gently)
  const pillBase = "inline-flex items-center px-3 py-1.5 text-[13px] font-semibold rounded-md";
  const gentlePulse = "animate-[pulse_3.6s_ease-in-out_infinite]";

  const pillLive = `${pillBase} bg-green-600/90 text-white border border-green-700 shadow-sm ${gentlePulse}`;
  const pillVote = `${pillBase} bg-red-600/90 text-white border border-red-700 shadow-sm ${gentlePulse}`;
  const pillForum = `${pillBase} bg-[#FFC107]/90 text-black border border-[#E0A800] shadow-[0_1px_3px_rgba(0,0,0,0.25)]`;
  const pillOnDemand = `${pillBase} bg-blue-300/90 text-blue-900 border border-blue-400 shadow-sm`;

  const status = ((item.status || "") as string).toLowerCase();
  const statusLabel =
    status === "public" || status === "in public session" ? "In public session"
    : status === "live" ? "Live"
    : (status === "vote" || status === "vótáil" || status === "votáil" || status === "votail") ? "Vótáil"
    : "";

  const statusClass =
    status === "public" || status === "in public session" ? pillLive
    : status === "live" ? pillLive
    : (status === "vote" || status === "vótáil" || status === "votáil" || status === "votail") ? pillVote
    : "";

  // Subline (title · meta), On now already excludes date at the data-prep step
  const sublineParts = [item.title, item.meta].filter(Boolean);
  const subline = sublineParts.join(" · ");

  return (
    <div
      ref={rootRef}
      className="relative w-full rounded-xl overflow-hidden border border-brand-gray-300 shadow-md group"
      aria-roledescription="carousel"
      aria-label="Featured videos"
      tabIndex={0}
    >
      {/* Fixed-height, width-stable */}
      <div className="relative w-full h-[clamp(360px,60vh,800px)]">
        {/* Image */}
        <img
          src={item.thumb}
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center"
          draggable={false}
        />

        {/* Dark overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/25 to-transparent" />

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-end p-6 sm:p-8">
          <div className="max-w-2xl space-y-3">
            {/* Pills row */}
            {statusLabel && liveMode ? (
              <span className={statusClass}>{statusLabel}</span>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                {item.forum && <span className={pillForum}>{item.forum}</span>}
                <span className={pillOnDemand}>On demand</span>
              </div>
            )}

            {/* Forum as main headline */}
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-snug drop-shadow-md">
              {item.forum || item.title}
            </h2>

            {/* Subline: title · meta */}
            {subline && <p className="text-white/90 text-base sm:text-lg">{subline}</p>}

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 pt-1">
              <button
                onClick={() => onPlay?.(item)}
                className="px-4 py-2 bg-[#666666] text-white text-sm font-medium rounded-md hover:bg-[#555555] transition"
              >
                ▶ Watch now
              </button>

              {/* NEW: Only on the On now tab */}
              {liveMode && (
                <a
                  href="https://www.oireachtas.ie/en/detailed-schedule/"
                  className="px-4 py-2 bg-white/10 text-white text-sm font-medium rounded-md hover:bg-white/20 transition border border-white/20"
                >
                  Schedule of proceedings
                </a>
              )}

              {item.debate && !liveMode && (
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
        {count > 1 && (
          <>
            <button
              aria-label="Previous"
              onClick={() => setIndex((i) => ((i - 1 + count) % count))}
              className="absolute z-20 left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full
                         bg-black/40 text-white backdrop-blur-sm border border-white/20
                         hover:bg-black/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-white
                         transition opacity-100 md:opacity-0 md:group-hover:opacity-100"
            >
              ‹
            </button>
            <button
              aria-label="Next"
              onClick={() => setIndex((i) => ((i + 1) % count))}
              className="absolute z-20 right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full
                         bg-black/40 text-white backdrop-blur-sm border border-white/20
                         hover:bg-black/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-white
                         transition opacity-100 md:opacity-0 md:group-hover:opacity-100"
            >
              ›
            </button>
          </>
        )}

        {/* Dots + pause */}
        <div className="absolute z-20 bottom-3 right-4 flex items-center gap-2">
          <PauseButton paused={paused} setPaused={setPaused} />
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

function PauseButton({
  paused,
  setPaused,
}: {
  paused: boolean;
  setPaused: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <button
      onClick={() => setPaused((p) => !p)}
      className="text-white/80 text-xs px-2 py-0.5 rounded bg-black/30 hover:bg-black/50 border border-white/20"
      aria-pressed={paused}
      aria-label={paused ? "Resume autoplay" : "Pause autoplay"}
      title={paused ? "Resume" : "Pause"}
    >
      {paused ? "▶" : "⏸"}
    </button>
  );
}