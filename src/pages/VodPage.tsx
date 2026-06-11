import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  vodAll,
  vodCommittees,
  vodDail,
  vodSeanad,
  VodItem,
} from "../data/vod";
import {
  OireachtasTvItem,
  tvCurated,
  tvFeatured,
  tvShelves,
} from "../data/oireachtasTv";

const FULL_SCHEDULE_URL = "https://www.oireachtas.ie/en/detailed-schedule/";
const SAVED_VIDEOS_STORAGE_KEY = "vod-poc:saved-videos";
const RECENT_VIDEOS_STORAGE_KEY = "vod-poc:recent-videos";
const RECENT_VIDEOS_LIMIT = 18;

type Mode = "NOW" | "DEMAND" | "TV" | "MY";
type DemandForum = "DAIL" | "SEANAD" | "COMMITTEES";
type DatePreset = "ALL" | "MONTH" | "SIX_MONTHS" | "YEAR" | "CUSTOM";
type DemandFilters = {
  query: string;
  topics: string[];
  datePreset: DatePreset;
  startDate: string;
  endDate: string;
};
type TvFilters = {
  query: string;
  series: string[];
};
type LiveForumState = "LIVE" | "VOTE" | "UP_NEXT" | "ADJOURNED";
type LiveForumCard = {
  id: string;
  sourceItemId: string;
  location: string;
  forum: string;
  state: LiveForumState;
  statusLabel: string;
  startTimeLabel: string;
  href: string;
  thumb: string;
  previewSrc?: string;
  meta: string;
  note: string;
};

const ALL_DEMAND_FORUMS: DemandForum[] = ["DAIL", "SEANAD", "COMMITTEES"];
const DEMAND_FORUM_LABELS: Record<DemandForum, string> = {
  DAIL: "Dáil Éireann",
  SEANAD: "Seanad Éireann",
  COMMITTEES: "Committees",
};

type LibraryVideo = {
  key: string;
  source: "VOD" | "TV";
  id: string;
  title: string;
  href: string;
  thumb: string;
  meta?: string;
  duration?: string;
  previewSrc?: string;
  label: string;
  secondaryLabel: string;
  tone: "live" | "vote" | "vod";
  summary?: string;
};

const MOCK_LIVE_DATE = "Tuesday, 9 June 2026";

function getVodStorageKey(id: string): string {
  return `vod:${id}`;
}

function getTvStorageKey(id: string): string {
  return `tv:${id}`;
}

function withAutoplayPreview(url?: string): string | undefined {
  if (!url) return undefined;
  const joiner = url.includes("?") ? "&" : "?";
  return `${url}${joiner}autoplay=1&muted=1&playsinline=1`;
}

const publicAsset = (path: string) =>
  `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;

function readStoredKeys(storageKey: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

function writeStoredKeys(storageKey: string, keys: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(keys));
  } catch {
    // Ignore storage write issues in this prototype.
  }
}

function toLibraryVideoFromVod(item: VodItem): LibraryVideo {
  const liveLabel = isLiveStatus(item) ? getLiveLabel(item) : "On demand";
  const liveTone =
    liveLabel === "Vótáil"
      ? "vote"
      : liveLabel === "On demand"
        ? "vod"
        : "live";
  return {
    key: getVodStorageKey(item.id),
    source: "VOD",
    id: item.id,
    title: item.title,
    href: item.href,
    thumb: item.thumb,
    meta:
      [item.date, stripDurationFromMeta(item.meta, item.duration)]
        .filter(Boolean)
        .join(" · ") || item.meta,
    duration: item.duration,
    previewSrc: item.mp4Url,
    label: getHouseLabel(item),
    secondaryLabel: liveLabel,
    tone: liveTone,
  };
}

function toLibraryVideoFromTv(item: OireachtasTvItem): LibraryVideo {
  return {
    key: getTvStorageKey(item.id),
    source: "TV",
    id: item.id,
    title: item.title,
    href: item.href,
    thumb: item.thumb,
    meta: item.meta,
    label: "Oireachtas TV",
    secondaryLabel: item.series,
    tone: "vod",
    summary: item.summary,
  };
}

function normalizeMetaFromItem(item: VodItem): {
  main?: string;
  rest?: string;
} {
  const dateField = typeof item.date === "string" ? item.date.trim() : "";
  const metaField = typeof item.meta === "string" ? item.meta.trim() : "";

  if (dateField) {
    return {
      main: dateField,
      rest:
        metaField
          .replace(dateField, "")
          .replace(/^(\s*[—·,-]\s*)/, "")
          .trim() || undefined,
    };
  }

  if (!metaField) return {};

  const dotIdx = metaField.indexOf(" · ");
  if (dotIdx > 0) {
    return {
      main: metaField.slice(0, dotIdx).trim(),
      rest: metaField.slice(dotIdx + 3).trim(),
    };
  }

  return { rest: metaField };
}

function isLiveStatus(item: VodItem): boolean {
  const status = (item.status || "").toLowerCase();
  return [
    "live",
    "in public session",
    "public",
    "vote",
    "vótáil",
    "votáil",
    "votail",
  ].includes(status);
}

function getLiveLabel(item: VodItem): string {
  const status = (item.status || "").toLowerCase();
  if (
    status === "vote" ||
    status === "vótáil" ||
    status === "votáil" ||
    status === "votail"
  ) {
    return "Vótáil";
  }
  if (status === "public" || status === "in public session") {
    return "In public session";
  }
  return "Live";
}

function getHouseLabel(item: VodItem): string {
  if ((item.forum || "").toLowerCase().includes("committee")) {
    return item.forum;
  }
  return item.forum;
}

function isCommitteeVodItem(item: VodItem): boolean {
  const forum = (item.forum || "").toLowerCase();
  return forum !== "dáil éireann" && forum !== "seanad éireann";
}

function getCommitteePageHref(item: VodItem): string | undefined {
  if (!isCommitteeVodItem(item)) return undefined;
  const committeeHrefMap: Record<string, string> = {
    "Committee of Public Accounts":
      "https://www.oireachtas.ie/en/committees/34/committee-of-public-accounts/",
    "Joint Committee on Children and Equality":
      "https://www.oireachtas.ie/en/committees/34/children-and-equality/",
    "Joint Committee on Disability Matters":
      "https://www.oireachtas.ie/en/committees/34/disability-matters/",
    "Joint Committee on Social Protection, Rural and Community Development":
      "https://www.oireachtas.ie/en/committees/34/social-protection-rural-and-community-development/",
    "Select Committee on Arts, Media, Communications, Culture and Sport":
      "https://www.oireachtas.ie/en/committees/34/arts-media-communications-culture-and-sport/",
    "Joint Committee on Transport":
      "https://www.oireachtas.ie/en/committees/34/transport/",
    "Joint Committee on Health":
      "https://www.oireachtas.ie/en/committees/34/health/",
  };

  return committeeHrefMap[item.forum];
}

function stripDurationFromMeta(
  meta: string | undefined,
  duration?: string,
): string | undefined {
  if (!meta) return meta;
  if (!duration) return meta;
  return (
    meta
      .replace(duration, "")
      .replace(/^(\s*[·—,-]\s*)/, "")
      .replace(/(\s*[·—,-]\s*)$/, "")
      .trim() || undefined
  );
}

function formatDurationCompact(duration?: string): string | undefined {
  if (!duration) return duration;
  const hoursMatch = duration.match(/(\d+)\s*(hour|hr)/i);
  const minutesMatch = duration.match(/(\d+)\s*(minute|min)/i);
  const hours = hoursMatch ? Number.parseInt(hoursMatch[1], 10) : 0;
  const minutes = minutesMatch ? Number.parseInt(minutesMatch[1], 10) : 0;
  const totalMinutes = hours * 60 + minutes;
  if (Number.isFinite(totalMinutes) && totalMinutes > 0)
    return `${totalMinutes} min`;
  return duration;
}

function formatMetaCompact(meta?: string): string | undefined {
  if (!meta) return meta;
  const parts = meta
    .split(" · ")
    .map((part, index) =>
      index === 0 ? formatDurationCompact(part) || part : part,
    );
  return parts.join(" · ");
}

function StatusBadge({
  label,
  tone,
}: {
  label: string;
  tone: "live" | "vote" | "vod" | "upnext" | "adjourned";
}) {
  const toneClass =
    tone === "vote"
      ? "bg-[#9f1f2d] text-white border-[#9f1f2d]"
      : tone === "vod"
        ? "bg-[#9dbfe8] text-[#17191c] border-[#4c79be]/25"
        : tone === "live"
          ? "bg-[rgba(193,234,214,0.9)] text-[#0e6241] border-[rgba(74,161,114,0.18)]"
          : tone === "upnext"
            ? "bg-[rgba(255,253,248,0.94)] text-[#3f3b34] border-[rgba(74,70,61,0.18)]"
            : tone === "adjourned"
              ? "bg-[rgba(255,253,248,0.94)] text-[#59544d] border-[rgba(74,70,61,0.18)]"
              : "bg-[rgba(33,34,37,0.92)] text-white border-white/10";

  return (
    <span
      className={[
        "inline-flex items-center whitespace-nowrap rounded-[0.4rem] border px-2.5 py-1.5 text-[0.76rem] font-semibold leading-none tracking-[0.01em]",
        toneClass,
      ].join(" ")}
    >
      {label}
    </span>
  );
}

function HouseBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex max-w-full items-center rounded-[0.4rem] border border-[rgba(74,70,61,0.18)] bg-[rgba(255,253,248,0.94)] px-2.5 py-1.5 text-[0.76rem] font-semibold tracking-[0.01em] text-[#3f3b34]">
      <span className="badge-label-clamp-2">{label}</span>
    </span>
  );
}

function DebateLink({ href, dark = false }: { href?: string; dark?: boolean }) {
  if (!href) return null;

  return (
    <a
      href={href}
      onClick={(event) => event.stopPropagation()}
      className={[
        "inline-flex items-center gap-1 text-sm font-medium underline-offset-2 transition hover:underline",
        dark
          ? "contextual-link contextual-link-dark"
          : "contextual-link contextual-link-light",
      ].join(" ")}
    >
      <span>Debate</span>
      <span aria-hidden="true">↗</span>
    </a>
  );
}

function CommitteePageLink({
  item,
  dark = false,
}: {
  item: VodItem;
  dark?: boolean;
}) {
  const href = getCommitteePageHref(item);
  if (!href) return null;

  return (
    <a
      href={href}
      onClick={(event) => event.stopPropagation()}
      className={[
        "inline-flex items-center gap-1 text-sm font-medium underline-offset-2 transition hover:underline",
        dark
          ? "contextual-link contextual-link-dark"
          : "contextual-link contextual-link-light",
      ].join(" ")}
    >
      <span>{item.forum}</span>
      <span aria-hidden="true">↗</span>
    </a>
  );
}

function matchesSearch(item: VodItem, term: string): boolean {
  if (!term) return true;
  const { main, rest } = normalizeMetaFromItem(item);
  const haystack = [item.title, item.forum, item.topic, main, rest]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(term);
}

function matchesTvSearch(item: OireachtasTvItem, term: string): boolean {
  if (!term) return true;
  const haystack = [item.title, item.series, item.meta, item.summary]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(term);
}

function parseDisplayDate(date?: string): Date | null {
  if (!date) return null;
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function compareVodItemsByRecency(a: VodItem, b: VodItem): number {
  const aDate = parseDisplayDate(a.date)?.getTime() ?? 0;
  const bDate = parseDisplayDate(b.date)?.getTime() ?? 0;
  if (aDate !== bDate) return bDate - aDate;
  return (b.startTime || "").localeCompare(a.startTime || "");
}

function formatDateInput(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildDemandFilterChips(filters: DemandFilters): string[] {
  const chips: string[] = [];
  if (filters.query.trim()) chips.push(`Search: ${filters.query.trim()}`);
  chips.push(...filters.topics);
  if (filters.datePreset === "MONTH") chips.push("Past month");
  if (filters.datePreset === "SIX_MONTHS") chips.push("Past 6 months");
  if (filters.datePreset === "YEAR") chips.push("Past year");
  if (
    filters.datePreset === "CUSTOM" &&
    (filters.startDate || filters.endDate)
  ) {
    chips.push(
      `From ${filters.startDate || "start"} to ${filters.endDate || "today"}`,
    );
  }
  return chips;
}

function buildTvFilterChips(filters: TvFilters): string[] {
  const chips: string[] = [];
  if (filters.query.trim()) chips.push(`Search: ${filters.query.trim()}`);
  chips.push(...filters.series);
  return chips;
}

function buildMockLiveForums(source: VodItem[]): LiveForumCard[] {
  const byId = new Map(source.map((item) => [item.id, item]));
  const pick = (id: string) => {
    const item = byId.get(id);
    if (!item) throw new Error(`Missing mock live source item: ${id}`);
    return item;
  };

  const dail = pick("vod-dail-2026-05-28-pq-oral-0849");
  const seanad = pick("vod-seanad-2026-05-28-order-of-business-1032");
  const cr1 = pick("vod-committee-2026-05-28-public-accounts");
  const cr2 = pick("vod-committee-2026-05-27-disability-matters");
  const cr3 = pick("vod-committee-2026-05-28-children-equality");
  const cr4 = pick("vod-committee-2026-05-27-transport");

  return [
    {
      id: "live-dail",
      sourceItemId: dail.id,
      location: "Dáil Chamber",
      forum: "Dáil Éireann",
      state: "LIVE",
      statusLabel: "Live",
      startTimeLabel: "Started at 8.49 a.m.",
      href: dail.href,
      thumb: publicAsset("/media/live/full_dail.jpg"),
      previewSrc: dail.mp4Url,
      meta: MOCK_LIVE_DATE,
      note: "Parliamentary Questions: Oral",
    },
    {
      id: "live-seanad",
      sourceItemId: seanad.id,
      location: "Seanad Chamber",
      forum: "Seanad Éireann",
      state: "VOTE",
      statusLabel: "Vótáil",
      startTimeLabel: "Started at 10.32 a.m.",
      href: seanad.href,
      thumb: seanad.thumb,
      previewSrc: seanad.mp4Url,
      meta: MOCK_LIVE_DATE,
      note: "Order of Business",
    },
    {
      id: "live-cr1",
      sourceItemId: cr1.id,
      location: "Committee Room 1",
      forum: "Committee of Public Accounts",
      state: "LIVE",
      statusLabel: "In public session",
      startTimeLabel: "Started at 9.00 a.m.",
      href: cr1.href,
      thumb: cr1.thumb,
      previewSrc: cr1.mp4Url,
      meta: MOCK_LIVE_DATE,
      note: "Engagement with the Department of Health and HSE",
    },
    {
      id: "live-cr2",
      sourceItemId: cr2.id,
      location: "Committee Room 2",
      forum: "Joint Committee on Disability Matters",
      state: "LIVE",
      statusLabel: "In public session",
      startTimeLabel: "Started at 10.30 a.m.",
      href: cr2.href,
      thumb: cr2.thumb,
      previewSrc: cr2.mp4Url,
      meta: MOCK_LIVE_DATE,
      note: "DEIS schools",
    },
    {
      id: "live-cr3",
      sourceItemId: cr3.id,
      location: "Committee Room 3",
      forum: "Joint Committee on Finance",
      state: "UP_NEXT",
      statusLabel: "Up next",
      startTimeLabel: "Scheduled for 2.15 p.m.",
      href: cr3.href,
      thumb: cr3.thumb,
      previewSrc: cr3.mp4Url,
      meta: MOCK_LIVE_DATE,
      note: "Financial aids to farmers and hauliers",
    },
    {
      id: "live-cr4",
      sourceItemId: cr4.id,
      location: "Committee Room 4",
      forum: "Joint Committee on Public Petitions",
      state: "ADJOURNED",
      statusLabel: "Concluded",
      startTimeLabel: "Concluded at 12.45 p.m.",
      href: cr4.href,
      thumb: cr4.thumb,
      previewSrc: cr4.mp4Url,
      meta: MOCK_LIVE_DATE,
      note: "No further business scheduled",
    },
  ];
}

function matchesDemandDate(item: VodItem, filters: DemandFilters): boolean {
  const itemDate = parseDisplayDate(item.date);
  if (!itemDate) return true;

  const now = new Date("2027-04-27T12:00:00");
  let start: Date | null = null;
  let end: Date | null = null;

  if (filters.datePreset === "MONTH")
    start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  if (filters.datePreset === "SIX_MONTHS")
    start = new Date(now.getTime() - 183 * 24 * 60 * 60 * 1000);
  if (filters.datePreset === "YEAR")
    start = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
  if (filters.datePreset === "CUSTOM") {
    start = filters.startDate
      ? new Date(`${filters.startDate}T00:00:00`)
      : null;
    end = filters.endDate ? new Date(`${filters.endDate}T23:59:59`) : null;
  }

  if (start && itemDate < start) return false;
  if (end && itemDate > end) return false;
  return true;
}

function getDemandForum(item: VodItem): DemandForum {
  const forum = (item.forum || "").toLowerCase();
  if (forum.includes("dáil")) return "DAIL";
  if (forum.includes("seanad")) return "SEANAD";
  return "COMMITTEES";
}

function PlayBadge({
  className = "",
  variant = "dark",
}: {
  className?: string;
  variant?: "dark" | "light";
}) {
  return (
    <span
      className={[
        "media-play-badge",
        variant === "light"
          ? "media-play-badge-light"
          : "media-play-badge-dark",
        className,
      ].join(" ")}
      aria-hidden="true"
    >
      ▶
    </span>
  );
}

function HoverPreview({
  thumb,
  title,
  previewSrc,
  durationLabel,
  badgeVariant = "dark",
  aspectClassName = "aspect-video",
  imageClassName = "",
  showPlayBadge = true,
  children,
}: {
  thumb: string;
  title: string;
  previewSrc?: string;
  durationLabel?: string;
  badgeVariant?: "dark" | "light";
  aspectClassName?: string;
  imageClassName?: string;
  showPlayBadge?: boolean;
  children?: React.ReactNode;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [previewReady, setPreviewReady] = useState(false);

  const playPreview = () => {
    const video = videoRef.current;
    if (!video) return;
    const playAttempt = video.play();
    if (playAttempt && typeof playAttempt.catch === "function") {
      playAttempt.catch(() => {});
    }
  };

  const pausePreview = () => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    video.currentTime = 0;
    setPreviewReady(false);
  };

  return (
    <div
      className={[
        "preview-frame relative overflow-hidden",
        previewReady ? "preview-frame-active" : "",
        aspectClassName,
      ].join(" ")}
      onMouseEnter={playPreview}
      onMouseLeave={pausePreview}
      onFocus={playPreview}
      onBlur={pausePreview}
    >
      <img
        src={thumb}
        alt=""
        className={[
          "preview-image h-full w-full object-cover",
          imageClassName,
        ].join(" ")}
      />
      {previewSrc ? (
        <video
          ref={videoRef}
          className="preview-video absolute inset-0 h-full w-full object-cover"
          src={previewSrc}
          poster={thumb}
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          tabIndex={-1}
          onPlaying={() => setPreviewReady(true)}
          onPause={() => setPreviewReady(false)}
          onEnded={() => setPreviewReady(false)}
        />
      ) : null}
      <div className="preview-shade absolute inset-0" />
      {showPlayBadge ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <PlayBadge
            className="preview-badge h-16 w-16 text-xl"
            variant={badgeVariant}
          />
        </div>
      ) : null}
      <div className="preview-chrome absolute inset-x-0 bottom-0 flex items-center justify-between px-3 py-3 text-white">
        <span />
        {durationLabel ? (
          <span className="preview-time">{durationLabel}</span>
        ) : null}
      </div>
      <div className="preview-progress absolute bottom-0 left-0 h-[3px] w-0 rounded-full bg-white/85" />
      {children}
      <span className="sr-only">{title}</span>
    </div>
  );
}

function TvPlayerOverlay({
  item,
  onClose,
}: {
  item: OireachtasTvItem;
  onClose: () => void;
}) {
  const [windowed, setWindowed] = useState(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[120] bg-[rgba(8,10,14,0.94)] text-white"
      role="dialog"
      aria-modal="true"
      aria-label={`Playing ${item.title}`}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-white/56">
              {item.eyebrow || "Oireachtas TV"}
            </p>
            <h3 className="mt-1 truncate text-lg font-semibold text-white sm:text-xl">
              {item.title}
            </h3>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setWindowed((value) => !value)}
              className="hidden rounded-full border border-white/14 px-4 py-2 text-sm font-semibold text-white/72 transition hover:border-white/28 hover:text-white sm:inline-flex"
            >
              {windowed ? "Go full window" : "Play in window"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/14 text-white/82 transition hover:border-white/28 hover:text-white"
              aria-label="Close player"
            >
              ✕
            </button>
          </div>
        </div>

        <div
          className={[
            "flex flex-1",
            windowed ? "items-center justify-center p-4 sm:p-6" : "",
          ].join(" ")}
        >
          <div
            className={[
              "player-shell relative overflow-hidden border-white/10 bg-black",
              windowed
                ? "w-full max-w-5xl rounded-lg border shadow-[0_24px_70px_rgba(0,0,0,0.46)]"
                : "h-full w-full",
            ].join(" ")}
          >
            <div
              className={[
                "relative bg-black",
                windowed ? "aspect-video" : "h-full min-h-[24rem]",
              ].join(" ")}
            >
              {item.playerUrl ? (
                <iframe
                  src={item.playerUrl}
                  title={item.title}
                  className="h-full w-full border-0"
                  allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                  allowFullScreen
                />
              ) : (
                <img
                  src={item.thumb}
                  alt=""
                  className="h-full w-full object-cover"
                />
              )}

              <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-[rgba(6,8,12,0.92)] via-[rgba(6,8,12,0.4)] to-transparent p-4 sm:p-6 pointer-events-none">
                <div className="mx-auto max-w-6xl">
                  <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div className="max-w-3xl">
                      <p className="text-sm font-medium text-white/76">
                        {item.meta}
                      </p>
                      <p className="mt-3 text-base leading-relaxed text-white/84">
                        {item.summary ||
                          "Player view for Oireachtas TV content with autoplay-led presentation and in-window controls."}
                      </p>
                    </div>
                    {item.companionUrl ? (
                      <span className="text-sm font-semibold text-white/72">
                        Explore further below
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeaturedLiveStage({
  item,
  onMarkWatched,
}: {
  item: LiveForumCard;
  onMarkWatched: () => void;
}) {
  const [playInline, setPlayInline] = useState(false);
  const [previewReady, setPreviewReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canPreview =
    Boolean(item.previewSrc) &&
    item.state !== "ADJOURNED" &&
    item.state !== "UP_NEXT";
  const tone =
    item.state === "VOTE"
      ? "vote"
      : item.state === "UP_NEXT"
        ? "upnext"
        : item.state === "ADJOURNED"
          ? "adjourned"
          : "live";

  useEffect(() => {
    setPlayInline(false);
    setPreviewReady(false);
  }, [item.id]);

  useEffect(() => {
    if (!playInline) return;
    const video = videoRef.current;
    if (!video) return;
    const playAttempt = video.play();
    if (playAttempt && typeof playAttempt.catch === "function") {
      playAttempt.catch(() => {});
    }
  }, [playInline, item.id]);

  return (
    <article className="featured-live-stage mx-auto max-w-[70rem] overflow-hidden rounded-sm bg-black text-white">
      <div
        className={[
          "preview-frame featured-live-frame relative aspect-[16/8.75] overflow-hidden",
          previewReady
            ? "preview-frame-active featured-live-preview-active"
            : "",
        ].join(" ")}
        onMouseEnter={() => {
          if (playInline) return;
          const video = videoRef.current;
          if (!video || !canPreview) return;
          const playAttempt = video.play();
          if (playAttempt && typeof playAttempt.catch === "function")
            playAttempt.catch(() => {});
        }}
        onMouseLeave={() => {
          if (playInline) return;
          const video = videoRef.current;
          if (!video || !canPreview) return;
          video.pause();
          video.currentTime = 0;
          setPreviewReady(false);
        }}
      >
        {playInline && canPreview ? (
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            src={item.previewSrc}
            poster={item.thumb}
            controls
            autoPlay
            playsInline
            preload="auto"
          />
        ) : (
          <>
            <img
              src={item.thumb}
              alt=""
              className="preview-image h-full w-full object-cover"
            />
            {canPreview ? (
              <video
                ref={videoRef}
                className="preview-video absolute inset-0 h-full w-full object-cover"
                src={item.previewSrc}
                poster={item.thumb}
                muted
                loop
                playsInline
                preload="metadata"
                aria-hidden="true"
                tabIndex={-1}
                onPlaying={() => setPreviewReady(true)}
                onPause={() => setPreviewReady(false)}
                onEnded={() => setPreviewReady(false)}
              />
            ) : null}
            <div className="featured-live-shade absolute inset-0" />
            <div className="featured-live-copy absolute inset-x-0 bottom-0 z-10 p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge label={item.statusLabel} tone={tone} />
              </div>
              <h3 className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-5xl">
                {item.forum}
              </h3>
              <p className="mt-3 max-w-3xl text-xl text-white/88">
                {item.note}
              </p>
              <p className="mt-2 text-base font-medium text-white/72">
                {item.startTimeLabel} · ISL · CC
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                {canPreview ? (
                  <button
                    type="button"
                    onClick={() => {
                      onMarkWatched();
                      setPlayInline(true);
                    }}
                    className="featured-live-action featured-live-action-primary"
                  >
                    <span aria-hidden="true">▶</span>
                    <span>Watch now</span>
                  </button>
                ) : null}
                <a
                  href={FULL_SCHEDULE_URL}
                  className="featured-live-action featured-live-action-secondary"
                >
                  Full schedule
                </a>
              </div>
            </div>
          </>
        )}
      </div>
    </article>
  );
}

export default function VodPage() {
  const [mode, setMode] = useState<Mode>("NOW");
  const [selectedDemandForums, setSelectedDemandForums] =
    useState<DemandForum[]>(ALL_DEMAND_FORUMS);
  const [searchOpen, setSearchOpen] = useState(false);
  const [savedVideoKeys, setSavedVideoKeys] = useState<string[]>([]);
  const [recentVideoKeys, setRecentVideoKeys] = useState<string[]>([]);
  const [demandFilters, setDemandFilters] = useState<DemandFilters>({
    query: "",
    topics: [],
    datePreset: "ALL",
    startDate: "",
    endDate: "",
  });
  const [tvFilters, setTvFilters] = useState<TvFilters>({
    query: "",
    series: [],
  });

  const liveForums = useMemo(() => buildMockLiveForums(vodAll), []);
  const missedItems = useMemo(() => {
    const dated = [...vodAll].filter((item) => !isLiveStatus(item));
    dated.sort(compareVodItemsByRecency);
    return dated.slice(0, 8);
  }, []);
  const featuredDemandItems = useMemo(() => {
    const newest = (items: VodItem[], count: number) =>
      [...items]
        .filter((item) => !isLiveStatus(item))
        .sort(compareVodItemsByRecency)
        .slice(0, count);

    const baseItems = [
      ...newest(vodDail, 2),
      ...newest(vodSeanad, 1),
      ...newest(vodCommittees, 2),
    ];
    const leadersLead = [...vodDail]
      .filter(
        (item) =>
          !isLiveStatus(item) && item.title.includes("Leaders' Questions"),
      )
      .sort(compareVodItemsByRecency)[0];

    if (!leadersLead) return baseItems.slice(0, 4);

    return [
      leadersLead,
      ...baseItems.filter((item) => item.id !== leadersLead.id),
    ].slice(0, 4);
  }, []);

  useEffect(() => {
    if (mode === "NOW") setSearchOpen(false);
  }, [mode]);

  const demandSource = useMemo(() => {
    return vodAll.filter(
      (item) =>
        !isLiveStatus(item) &&
        selectedDemandForums.includes(getDemandForum(item)),
    );
  }, [selectedDemandForums]);

  const normalizedDemandQuery = demandFilters.query.trim().toLowerCase();

  const demandResults = useMemo(() => {
    return demandSource.filter((item) => {
      if (!matchesSearch(item, normalizedDemandQuery)) return false;
      if (
        demandFilters.topics.length &&
        !demandFilters.topics.includes(item.topic)
      )
        return false;
      if (!matchesDemandDate(item, demandFilters)) return false;
      return true;
    });
  }, [demandFilters, demandSource, normalizedDemandQuery]);

  const committeeGroups = useMemo(() => {
    const source =
      normalizedDemandQuery ||
      demandFilters.topics.length ||
      demandFilters.datePreset !== "ALL"
        ? demandResults
        : vodCommittees;
    const groups = new Map<string, VodItem[]>();

    source.forEach((item) => {
      const key = item.forum || "Committees";
      const existing = groups.get(key) || [];
      existing.push(item);
      groups.set(key, existing);
    });

    return Array.from(groups.entries()).sort((a, b) =>
      a[0].localeCompare(b[0]),
    );
  }, [
    demandFilters.datePreset,
    demandFilters.topics.length,
    demandResults,
    normalizedDemandQuery,
  ]);

  const demandAvailableTopics = useMemo(() => {
    return Array.from(new Set(demandSource.map((item) => item.topic)))
      .sort((a, b) => a.localeCompare(b))
      .slice(0, 8);
  }, [demandSource]);

  const normalizedTvQuery = tvFilters.query.trim().toLowerCase();
  const tvFilteredItems = useMemo(() => {
    return tvCurated.filter((item) => {
      if (!matchesTvSearch(item, normalizedTvQuery)) return false;
      if (tvFilters.series.length && !tvFilters.series.includes(item.series))
        return false;
      return true;
    });
  }, [normalizedTvQuery, tvFilters.series]);

  const tvFilteredShelves = useMemo(() => {
    return tvShelves
      .map((shelf) => ({
        ...shelf,
        items: shelf.items.filter((item) =>
          tvFilteredItems.some((filtered) => filtered.id === item.id),
        ),
      }))
      .filter((shelf) => shelf.items.length > 0);
  }, [tvFilteredItems]);

  const tvAvailableSeries = useMemo(() => {
    return Array.from(new Set(tvCurated.map((item) => item.series)));
  }, []);

  const libraryVideoMap = useMemo(() => {
    const entries: Array<[string, LibraryVideo]> = [
      ...vodAll.map(
        (item) =>
          [getVodStorageKey(item.id), toLibraryVideoFromVod(item)] as [
            string,
            LibraryVideo,
          ],
      ),
      ...tvFeatured.map(
        (item) =>
          [getTvStorageKey(item.id), toLibraryVideoFromTv(item)] as [
            string,
            LibraryVideo,
          ],
      ),
      ...tvCurated.map(
        (item) =>
          [getTvStorageKey(item.id), toLibraryVideoFromTv(item)] as [
            string,
            LibraryVideo,
          ],
      ),
    ];
    return new Map(entries);
  }, []);
  const searchFiltersActive = Boolean(
    demandFilters.query ||
    demandFilters.topics.length ||
    demandFilters.datePreset !== "ALL",
  );
  const savedVideos = useMemo(
    () =>
      savedVideoKeys
        .map((key) => libraryVideoMap.get(key))
        .filter((item): item is LibraryVideo => Boolean(item)),
    [libraryVideoMap, savedVideoKeys],
  );
  const recentVideos = useMemo(
    () =>
      recentVideoKeys
        .map((key) => libraryVideoMap.get(key))
        .filter((item): item is LibraryVideo => Boolean(item)),
    [libraryVideoMap, recentVideoKeys],
  );

  useEffect(() => {
    setSavedVideoKeys(readStoredKeys(SAVED_VIDEOS_STORAGE_KEY));
    setRecentVideoKeys(readStoredKeys(RECENT_VIDEOS_STORAGE_KEY));
  }, []);

  useEffect(() => {
    writeStoredKeys(SAVED_VIDEOS_STORAGE_KEY, savedVideoKeys);
  }, [savedVideoKeys]);

  useEffect(() => {
    writeStoredKeys(RECENT_VIDEOS_STORAGE_KEY, recentVideoKeys);
  }, [recentVideoKeys]);

  const toggleSavedVideo = (key: string) => {
    setSavedVideoKeys((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [key, ...current],
    );
  };

  const markVideoWatched = (key: string) => {
    setRecentVideoKeys((current) => {
      const next = [key, ...current.filter((item) => item !== key)];
      return next.slice(0, RECENT_VIDEOS_LIMIT);
    });
  };

  const isVideoSaved = (key: string) => savedVideoKeys.includes(key);

  return (
    <div
      className={[
        "min-h-screen transition-colors duration-500",
        mode === "TV"
          ? "bg-brand-ink text-white"
          : "bg-brand-cream text-brand-gray-700",
      ].join(" ")}
    >
      <header className={mode === "TV" ? "border-b border-white/10" : ""}>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <div
            className={
              mode === "TV" ? "subtle-tablist tv-tablist" : "subtle-tablist"
            }
          >
            <div
              className="tab-cluster tab-cluster-related"
              role="tablist"
              aria-label="Browse video hub"
            >
              <button
                type="button"
                role="tab"
                aria-selected={mode === "NOW"}
                onClick={() => setMode("NOW")}
                className={[
                  "subtle-tab",
                  mode === "NOW" ? "subtle-tab-active" : "",
                ].join(" ")}
              >
                Parliament in session
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === "DEMAND"}
                onClick={() => setMode("DEMAND")}
                className={[
                  "subtle-tab",
                  mode === "DEMAND" ? "subtle-tab-active" : "",
                ].join(" ")}
              >
                On demand
              </button>
            </div>
            <div className="tab-cluster">
              <button
                type="button"
                onClick={() => setMode("TV")}
                className={[
                  "subtle-tab",
                  "tv-tab",
                  mode === "TV" ? "subtle-tab-active" : "",
                ].join(" ")}
              >
                Oireachtas Player
              </button>
              <button
                type="button"
                onClick={() => setMode("MY")}
                className={[
                  "subtle-tab",
                  "my-parliament-tab",
                  mode === "MY" ? "subtle-tab-active" : "",
                ].join(" ")}
              >
                <span className="my-parliament-tab-icon" aria-hidden="true">
                  <MyParliamentGlyph />
                </span>
                <span>My videos</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  mode !== "NOW" &&
                  mode !== "MY" &&
                  setSearchOpen((value) => !value)
                }
                disabled={mode === "NOW" || mode === "MY"}
                className={[
                  "subtle-tab",
                  "search-tab",
                  searchOpen ? "subtle-tab-active" : "",
                  mode === "NOW" || mode === "MY" ? "subtle-tab-disabled" : "",
                ].join(" ")}
                aria-label="Refine search"
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-4.35-4.35M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {mode === "NOW" ? (
        <OnNowView
          items={liveForums}
          missedItems={missedItems}
          isVideoSaved={isVideoSaved}
          onToggleSavedVideo={toggleSavedVideo}
          onMarkVideoWatched={markVideoWatched}
        />
      ) : null}
      {mode === "DEMAND" ? (
        <OnDemandView
          isVideoSaved={isVideoSaved}
          onToggleSavedVideo={toggleSavedVideo}
          onMarkVideoWatched={markVideoWatched}
          selectedForums={selectedDemandForums}
          setSelectedForums={setSelectedDemandForums}
          filters={demandFilters}
          setFilters={setDemandFilters}
          onOpenAdvancedFilters={() => setSearchOpen(true)}
          results={demandResults}
          committeeGroups={committeeGroups}
          searchFiltersActive={searchFiltersActive}
          activeFilterChips={buildDemandFilterChips(demandFilters)}
          featuredItems={featuredDemandItems}
        />
      ) : null}
      {mode === "TV" && tvFeatured ? (
        <OireachtasTvView
          isVideoSaved={isVideoSaved}
          onToggleSavedVideo={toggleSavedVideo}
          onMarkVideoWatched={markVideoWatched}
          featured={tvFeatured}
          curated={tvFilteredItems.length ? tvFilteredItems : tvCurated}
          shelves={tvFilteredShelves.length ? tvFilteredShelves : tvShelves}
          activeFilterChips={buildTvFilterChips(tvFilters)}
        />
      ) : null}
      {mode === "MY" ? (
        <MyParliamentView
          savedVideos={savedVideos}
          recentVideos={recentVideos}
          isVideoSaved={isVideoSaved}
          onToggleSavedVideo={toggleSavedVideo}
          onMarkVideoWatched={markVideoWatched}
        />
      ) : null}
      {searchOpen ? (
        <SearchDrawer
          mode={mode}
          demandFilters={demandFilters}
          setDemandFilters={setDemandFilters}
          demandAvailableTopics={demandAvailableTopics}
          tvFilters={tvFilters}
          setTvFilters={setTvFilters}
          tvAvailableSeries={tvAvailableSeries}
          onClose={() => setSearchOpen(false)}
        />
      ) : null}
    </div>
  );
}

function OnNowView({
  items,
  missedItems,
  isVideoSaved,
  onToggleSavedVideo,
  onMarkVideoWatched,
}: {
  items: LiveForumCard[];
  missedItems: VodItem[];
  isVideoSaved: (key: string) => boolean;
  onToggleSavedVideo: (key: string) => void;
  onMarkVideoWatched: (key: string) => void;
}) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");
  const active = items.find((item) => item.id === activeId) ?? items[0];

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <section className="pq-panel p-4 sm:p-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-brand-gray-700">
                Now on
              </h2>
            </div>
          </div>

          {active ? (
            <div className="space-y-5">
              <FeaturedLiveStage
                item={active}
                onMarkWatched={() =>
                  onMarkVideoWatched(getVodStorageKey(active.sourceItemId))
                }
              />

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {items.map((item) => (
                  <LiveForumPanel
                    key={item.id}
                    item={item}
                    active={item.id === active.id}
                    onSelect={() => setActiveId(item.id)}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="mt-8">
        <DemandSection
          isVideoSaved={isVideoSaved}
          onToggleSavedVideo={onToggleSavedVideo}
          onMarkVideoWatched={onMarkVideoWatched}
          title="Watch again"
          description="Discover recent debates in the Oireachtas"
          items={missedItems}
        />
      </section>
    </main>
  );
}

function LiveForumPanel({
  item,
  active = false,
  onSelect,
}: {
  item: LiveForumCard;
  active?: boolean;
  onSelect: () => void;
}) {
  const tone =
    item.state === "VOTE"
      ? "vote"
      : item.state === "UP_NEXT"
        ? "upnext"
        : item.state === "ADJOURNED"
          ? "adjourned"
          : "live";

  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        "flex h-full w-full rounded-sm border bg-white px-4 py-4 text-left transition",
        active
          ? "border-brand-gold shadow-[0_10px_24px_rgba(47,47,47,0.06)]"
          : "border-brand-gray-300 hover:border-brand-gold",
      ].join(" ")}
    >
      <div className="flex w-full items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-brand-gray-500">
            {item.location}
          </p>
          <h3 className="mt-2 text-lg font-semibold leading-snug text-brand-gray-700">
            {item.forum}
          </h3>
          <p className="mt-2 text-sm font-medium text-brand-gray-500">
            {item.startTimeLabel}
          </p>
          <p className="mt-2 text-sm text-brand-gray-500">{item.note}</p>
        </div>
        <StatusBadge label={item.statusLabel} tone={tone} />
      </div>
    </button>
  );
}

function OnDemandView({
  isVideoSaved,
  onToggleSavedVideo,
  onMarkVideoWatched,
  selectedForums,
  setSelectedForums,
  filters,
  setFilters,
  onOpenAdvancedFilters,
  results,
  committeeGroups,
  searchFiltersActive,
  activeFilterChips,
  featuredItems,
}: {
  isVideoSaved: (key: string) => boolean;
  onToggleSavedVideo: (key: string) => void;
  onMarkVideoWatched: (key: string) => void;
  selectedForums: DemandForum[];
  setSelectedForums: React.Dispatch<React.SetStateAction<DemandForum[]>>;
  filters: DemandFilters;
  setFilters: React.Dispatch<React.SetStateAction<DemandFilters>>;
  onOpenAdvancedFilters: () => void;
  results: VodItem[];
  committeeGroups: [string, VodItem[]][];
  searchFiltersActive?: boolean;
  activeFilterChips?: string[];
  featuredItems: VodItem[];
}) {
  const allForumsSelected = selectedForums.length === ALL_DEMAND_FORUMS.length;
  const isForumSelected = (forum: DemandForum) =>
    selectedForums.includes(forum);

  const toggleForum = (forum: DemandForum) => {
    setSelectedForums((current) => {
      if (current.includes(forum)) {
        if (current.length === 1) return current;
        return current.filter((item) => item !== forum);
      }
      return ALL_DEMAND_FORUMS.filter(
        (item) => current.includes(item) || item === forum,
      );
    });
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {featuredItems.length ? (
        <FeaturedDemandShowcase
          items={featuredItems}
          isVideoSaved={isVideoSaved}
          onToggleSavedVideo={onToggleSavedVideo}
          onMarkVideoWatched={onMarkVideoWatched}
        />
      ) : null}

      <section className="pq-panel p-4 sm:p-6">
        <div className="search-inline-panel">
          <div className="search-inline-main">
            <label htmlFor="demand-inline-query" className="search-query-label">
              Search
            </label>
            <div className="search-input-wrap mt-3">
              <input
                id="demand-inline-query"
                type="search"
                value={filters.query}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    query: event.target.value,
                  }))
                }
                placeholder="Search titles, committees, business topics or dates"
                className="search-query-input"
              />
              {filters.query ? (
                <button
                  type="button"
                  className="search-clear"
                  onClick={() =>
                    setFilters((current) => ({ ...current, query: "" }))
                  }
                  aria-label="Clear search"
                  title="Clear search"
                >
                  ×
                </button>
              ) : null}
            </div>
            <div className="search-inline-actions mt-3">
              <button
                type="button"
                className="advanced-search-link"
                onClick={onOpenAdvancedFilters}
              >
                Advanced search
              </button>
              <button
                type="button"
                className="filters-clear"
                onClick={() => {
                  setSelectedForums(ALL_DEMAND_FORUMS);
                  setFilters({
                    query: "",
                    topics: [],
                    datePreset: "ALL",
                    startDate: "",
                    endDate: "",
                  });
                }}
              >
                Reset filters
              </button>
            </div>
          </div>

          <div className="search-inline-filters">
            <div className="quick-filter-row">
              {ALL_DEMAND_FORUMS.map((forum) => (
                <button
                  key={forum}
                  type="button"
                  onClick={() => toggleForum(forum)}
                  className={[
                    "quick-filter-chip",
                    isForumSelected(forum)
                      ? "quick-filter-chip-active"
                      : "quick-filter-chip-inactive",
                  ].join(" ")}
                  aria-pressed={isForumSelected(forum)}
                >
                  <span>{DEMAND_FORUM_LABELS[forum]}</span>
                  {isForumSelected(forum) ? (
                    <span
                      className="quick-filter-chip-dismiss"
                      aria-hidden="true"
                    >
                      ×
                    </span>
                  ) : (
                    <span className="quick-filter-chip-add" aria-hidden="true">
                      +
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {searchFiltersActive ? (
          <div className="active-filters mt-5" aria-label="Active filters">
            <p className="active-filters-label">Active filters</p>
            <div className="active-filters-list">
              {(activeFilterChips || []).map((chip) => (
                <span key={chip} className="active-filter-chip">
                  {chip}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <section className="mt-8">
        {allForumsSelected && !searchFiltersActive ? (
          <div className="space-y-8">
            <DemandSection
              isVideoSaved={isVideoSaved}
              onToggleSavedVideo={onToggleSavedVideo}
              onMarkVideoWatched={onMarkVideoWatched}
              title="Dáil Éireann"
              items={vodDail}
              hideForumBadge
            />
            <DemandSection
              isVideoSaved={isVideoSaved}
              onToggleSavedVideo={onToggleSavedVideo}
              onMarkVideoWatched={onMarkVideoWatched}
              title="Seanad Éireann"
              items={vodSeanad}
              hideForumBadge
            />
            <DemandSection
              isVideoSaved={isVideoSaved}
              onToggleSavedVideo={onToggleSavedVideo}
              onMarkVideoWatched={onMarkVideoWatched}
              title="Committees"
              items={vodCommittees}
              hideForumBadge
              preferTopicTitle
            />
          </div>
        ) : selectedForums.length === 1 &&
          selectedForums[0] === "COMMITTEES" &&
          !searchFiltersActive ? (
          <div className="space-y-8">
            {committeeGroups.map(([committee, items]) => (
              <DemandSection
                key={committee}
                isVideoSaved={isVideoSaved}
                onToggleSavedVideo={onToggleSavedVideo}
                onMarkVideoWatched={onMarkVideoWatched}
                title={committee}
                items={items}
                hideForumBadge
                preferTopicTitle
              />
            ))}
          </div>
        ) : !searchFiltersActive ? (
          <div className="space-y-8">
            {selectedForums.includes("DAIL") ? (
              <DemandSection
                isVideoSaved={isVideoSaved}
                onToggleSavedVideo={onToggleSavedVideo}
                onMarkVideoWatched={onMarkVideoWatched}
                title="Dáil Éireann"
                items={vodDail}
                hideForumBadge
              />
            ) : null}
            {selectedForums.includes("SEANAD") ? (
              <DemandSection
                isVideoSaved={isVideoSaved}
                onToggleSavedVideo={onToggleSavedVideo}
                onMarkVideoWatched={onMarkVideoWatched}
                title="Seanad Éireann"
                items={vodSeanad}
                hideForumBadge
              />
            ) : null}
            {selectedForums.includes("COMMITTEES") ? (
              <DemandSection
                isVideoSaved={isVideoSaved}
                onToggleSavedVideo={onToggleSavedVideo}
                onMarkVideoWatched={onMarkVideoWatched}
                title="Committees"
                items={vodCommittees}
                hideForumBadge
                preferTopicTitle
              />
            ) : null}
          </div>
        ) : (
          <DemandSection
            isVideoSaved={isVideoSaved}
            onToggleSavedVideo={onToggleSavedVideo}
            onMarkVideoWatched={onMarkVideoWatched}
            title="Filtered results"
            items={results}
            emptyMessage="Nothing matched that search yet."
          />
        )}
      </section>
    </main>
  );
}

function FeaturedDemandShowcase({
  items,
  isVideoSaved,
  onToggleSavedVideo,
  onMarkVideoWatched,
}: {
  items: VodItem[];
  isVideoSaved: (key: string) => boolean;
  onToggleSavedVideo: (key: string) => void;
  onMarkVideoWatched: (key: string) => void;
}) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");
  const active = items.find((item) => item.id === activeId) ?? items[0];
  const supporting = items.filter((item) => item.id !== active?.id).slice(0, 3);

  if (!active) return null;

  return (
    <section className="mb-6">
      <div className="mx-auto mb-4 max-w-[70rem]">
        <h2 className="text-2xl font-semibold text-brand-gray-700">
          On demand spotlight
        </h2>
      </div>

      <div className="demand-feature-panel mx-auto max-w-[70rem] overflow-hidden rounded-sm">
        <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_432px]">
          <div className="relative min-h-[18.5rem]">
            <div className="block h-full">
              <HoverPreview
                thumb={active.thumb}
                title={active.title}
                previewSrc={active.mp4Url}
                badgeVariant="light"
                aspectClassName="h-full min-h-[18.5rem]"
                showPlayBadge={false}
              >
                <div className="demand-feature-card-scrim absolute inset-0" />
                <div className="absolute inset-x-0 bottom-0 z-10 p-5 sm:p-6 pointer-events-none">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge label="On demand" tone="vod" />
                    <span className="featured-house-badge">
                      {getHouseLabel(active)}
                    </span>
                  </div>
                  <h3 className="demand-feature-title mt-4 max-w-[22rem] text-[1.4rem] font-semibold leading-[1.06] text-white sm:text-[1.65rem]">
                    {active.title}
                  </h3>
                  {isCommitteeVodItem(active) ? (
                    <p className="mt-3 text-sm font-medium text-white/72">
                      {active.topic}
                    </p>
                  ) : null}
                  <p className="mt-3 text-sm font-semibold text-white/90">
                    {[active.date, formatDurationCompact(active.duration)]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  <div className="mt-3 pointer-events-auto">
                    <DebateLink href={active.debate} dark />
                  </div>
                  <div className="mt-5 flex items-center gap-3 pointer-events-auto">
                    <a
                      href={active.href}
                      onClick={() =>
                        onMarkVideoWatched(getVodStorageKey(active.id))
                      }
                      className="featured-live-action featured-live-action-primary"
                    >
                      <span aria-hidden="true">▶</span>
                      <span>Watch now</span>
                    </a>
                    <SaveVideoButton
                      saved={isVideoSaved(getVodStorageKey(active.id))}
                      onToggle={() =>
                        onToggleSavedVideo(getVodStorageKey(active.id))
                      }
                      dark
                    />
                  </div>
                </div>
              </HoverPreview>
            </div>
          </div>

          <div className="demand-feature-rail border-t border-brand-gray-300 p-5 xl:border-l xl:border-t-0">
            <div className="space-y-4">
              {supporting.map((item) => (
                <DemandFeatureRailCard
                  key={item.id}
                  item={item}
                  onSelect={() => setActiveId(item.id)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DemandFeatureRailCard({
  item,
  onSelect,
}: {
  item: VodItem;
  onSelect: () => void;
}) {
  return (
    <article className="tv-card-surface tv-rail-card relative w-full overflow-hidden rounded-sm text-left no-underline">
      <button
        type="button"
        onClick={onSelect}
        className="grid w-full appearance-none grid-cols-[10rem_minmax(0,1fr)] items-stretch border-0 bg-transparent p-0 text-left"
      >
        <div className="relative min-h-full self-stretch overflow-hidden bg-black/10">
          <img src={item.thumb} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center">
            <PlayBadge className="h-10 w-10 text-sm" />
          </div>
        </div>
        <div className="min-w-0 flex-1 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="featured-house-badge featured-house-badge-rail">
              {getHouseLabel(item)}
            </span>
          </div>
          <h4 className="demand-feature-rail-title mt-3 text-[0.94rem] font-semibold leading-[1.15] text-brand-gray-700">
            {item.title}
          </h4>
          {isCommitteeVodItem(item) ? (
            <p className="mt-2 text-[0.8rem] font-medium text-brand-gray-500">
              {item.topic}
            </p>
          ) : null}
          <p className="mt-2 text-[0.82rem] font-medium text-brand-gray-500">
            {[item.date, formatDurationCompact(item.duration)]
              .filter(Boolean)
              .join(" · ")}
          </p>
          <div className="mt-2">
            <DebateLink href={item.debate} />
          </div>
        </div>
      </button>
    </article>
  );
}

function OireachtasTvView({
  isVideoSaved,
  onToggleSavedVideo,
  onMarkVideoWatched,
  featured,
  curated,
  shelves,
  activeFilterChips,
}: {
  isVideoSaved: (key: string) => boolean;
  onToggleSavedVideo: (key: string) => void;
  onMarkVideoWatched: (key: string) => void;
  featured: OireachtasTvItem[];
  curated: OireachtasTvItem[];
  shelves: Array<{ title: string; items: OireachtasTvItem[] }>;
  activeFilterChips?: string[];
}) {
  const [activeId, setActiveId] = useState(featured[0]?.id ?? "");
  const [playerItem, setPlayerItem] = useState<OireachtasTvItem | null>(null);
  const active = featured.find((item) => item.id === activeId) ?? featured[0];
  const [featurePreviewing, setFeaturePreviewing] = useState(false);

  useEffect(() => {
    setFeaturePreviewing(false);
  }, [active?.id]);

  return (
    <>
      <main className="tv-stage mx-auto max-w-7xl px-4 py-8 text-white sm:px-6">
        <div className="mx-auto mb-4 max-w-[70rem]">
          <h2 className="text-2xl font-semibold text-white">Spotlight</h2>
        </div>
        <section className="tv-panel mx-auto max-w-[70rem] overflow-hidden rounded-sm">
          <div className="grid gap-0 xl:grid-cols-[minmax(0,1.45fr)_380px]">
            <div
              className="relative min-h-[520px]"
              onMouseEnter={() => {
                if (active?.playerUrl) setFeaturePreviewing(true);
              }}
              onMouseLeave={() => setFeaturePreviewing(false)}
            >
              {featurePreviewing && active?.playerUrl ? (
                <iframe
                  src={withAutoplayPreview(active.playerUrl)}
                  title={`${active.title} preview`}
                  className="absolute inset-0 h-full w-full border-0"
                  allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                />
              ) : (
                <img
                  src={active.thumb}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
              <div className="tv-hero-scrim absolute inset-0" />
              <div className="relative z-20 flex min-h-[520px] flex-col justify-end p-6 sm:p-8">
                <span className="hero-eyebrow inline-flex w-fit items-center rounded-sm px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.16em]">
                  {active.eyebrow || "Oireachtas TV"}
                </span>
                <h2 className="demand-feature-title mt-4 max-w-[22rem] text-[1.4rem] font-semibold leading-[1.06] text-white sm:text-[1.65rem]">
                  {active.title}
                </h2>
                {active.meta ? (
                  <p className="mt-3 max-w-2xl text-sm font-medium text-white/82">
                    {(formatMetaCompact(active.meta) || active.meta)
                      .split(" · ")
                      .map((part, index, parts) => (
                        <React.Fragment key={`${active.id}-meta-${part}`}>
                          <span>{part}</span>
                          {index < parts.length - 1 ? (
                            <span className="hero-meta-dot">•</span>
                          ) : null}
                        </React.Fragment>
                      ))}
                  </p>
                ) : null}
                <p className="mt-3 max-w-[24rem] text-sm leading-relaxed text-white/82">
                  {active.summary ||
                    "A curated Oireachtas TV feature sits at the top of the editorial video destination."}
                </p>
                <div className="mt-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        onMarkVideoWatched(getTvStorageKey(active.id));
                        setPlayerItem(active);
                      }}
                      className="featured-live-action featured-live-action-primary"
                    >
                      <span aria-hidden="true">▶</span>
                      <span>Watch now</span>
                    </button>
                    {active.companionUrl ? (
                      <a
                        href={active.companionUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="featured-live-action featured-live-action-secondary"
                      >
                        <span>Explore further</span>
                      </a>
                    ) : null}
                  </div>
                  <div className="mt-4">
                    <SaveVideoButton
                      saved={isVideoSaved(getTvStorageKey(active.id))}
                      onToggle={() =>
                        onToggleSavedVideo(getTvStorageKey(active.id))
                      }
                      dark
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="tv-rail border-t border-white/10 p-5 xl:border-l xl:border-t-0">
              <div className="space-y-4">
                {featured.map((item) => (
                  <TvRailCard
                    key={item.id}
                    item={item}
                    active={item.id === active.id}
                    onSelect={() => setActiveId(item.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="mt-10 space-y-10">
          {activeFilterChips?.length ? (
            <section className="active-filters" aria-label="Active filters">
              <p className="active-filters-label text-white/72">
                Active filters
              </p>
              <div className="active-filters-list">
                {activeFilterChips.map((chip) => (
                  <span key={chip} className="active-filter-chip">
                    {chip}
                  </span>
                ))}
              </div>
            </section>
          ) : null}
          {shelves.map((shelf) => (
            <section key={shelf.title}>
              {shelf.title === "Inside Parliament: Briefing" ? (
                <>
                  <div className="mb-4 flex items-end justify-between border-b border-white/10 pb-3">
                    <div>
                      <h3 className="text-2xl font-semibold text-white">
                        {shelf.title}
                      </h3>
                      <p className="mt-1 text-sm text-white/62">
                        Get inside your Parliament with the latest insights and
                        explainers.
                      </p>
                    </div>
                  </div>
                  <BriefingShelf items={shelf.items} />
                </>
              ) : (
                <TvCarouselShelf
                  title={shelf.title}
                  items={shelf.items}
                  isVideoSaved={isVideoSaved}
                  onToggleSavedVideo={onToggleSavedVideo}
                  onPlayItem={(item) => {
                    onMarkVideoWatched(getTvStorageKey(item.id));
                    setPlayerItem(item);
                  }}
                />
              )}
            </section>
          ))}
        </div>
      </main>
      {playerItem ? (
        <TvPlayerOverlay
          item={playerItem}
          onClose={() => setPlayerItem(null)}
        />
      ) : null}
    </>
  );
}

function SearchDrawer({
  mode,
  demandFilters,
  setDemandFilters,
  demandAvailableTopics,
  tvFilters,
  setTvFilters,
  tvAvailableSeries,
  onClose,
}: {
  mode: Mode;
  demandFilters: DemandFilters;
  setDemandFilters: React.Dispatch<React.SetStateAction<DemandFilters>>;
  demandAvailableTopics: string[];
  tvFilters: TvFilters;
  setTvFilters: React.Dispatch<React.SetStateAction<TvFilters>>;
  tvAvailableSeries: string[];
  onClose: () => void;
}) {
  const drawerTitle = mode === "TV" ? "Refine Oireachtas TV" : "Refine archive";

  return (
    <div
      className="fixed inset-0 z-[110] bg-[rgba(18,20,24,0.28)]"
      onClick={onClose}
    >
      <aside
        className="search-drawer absolute right-0 top-0 h-full w-full max-w-[32rem] overflow-y-auto border-l border-brand-gray-300 bg-brand-cream shadow-[0_18px_48px_rgba(0,0,0,0.18)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-brand-gray-300 px-6 py-6">
          <div>
            <p className="text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-brand-gold">
              Refine search
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-brand-gray-700">
              {drawerTitle}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-gray-300 text-brand-gray-600"
            aria-label="Close search"
          >
            ✕
          </button>
        </div>

        <div className="space-y-8 px-6 py-6">
          {mode === "DEMAND" ? (
            <>
              <section className="search-query-group">
                <label
                  htmlFor="demand-refine-query"
                  className="search-query-label"
                >
                  Search terms
                </label>
                <input
                  id="demand-refine-query"
                  type="search"
                  value={demandFilters.query}
                  onChange={(event) =>
                    setDemandFilters((current) => ({
                      ...current,
                      query: event.target.value,
                    }))
                  }
                  placeholder="Search titles, committees, business topics or dates"
                  className="search-query-input mt-3"
                />
              </section>

              <div className="filters-grid">
                <fieldset className="filter-group">
                  <legend>Business type</legend>
                  <div className="checkbox-group mt-4">
                    {demandAvailableTopics.map((topic) => {
                      const checked = demandFilters.topics.includes(topic);
                      return (
                        <label key={topic} className="checkbox-option">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() =>
                              setDemandFilters((current) => ({
                                ...current,
                                topics: checked
                                  ? current.topics.filter(
                                      (item) => item !== topic,
                                    )
                                  : [...current.topics, topic],
                              }))
                            }
                            className="h-5 w-5 rounded border-brand-gray-300 text-brand-gold focus:ring-brand-gold"
                          />
                          <span>{topic}</span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>

                <fieldset className="filter-group">
                  <legend>Publication date</legend>
                  <div className="radio-group mt-4">
                    {[
                      ["ALL", "All dates"],
                      ["MONTH", "Past month"],
                      ["SIX_MONTHS", "Past 6 months"],
                      ["YEAR", "Past year"],
                      ["CUSTOM", "Custom range"],
                    ].map(([value, label]) => (
                      <label key={value} className="radio-option">
                        <input
                          type="radio"
                          name="demand-date"
                          checked={demandFilters.datePreset === value}
                          onChange={() =>
                            setDemandFilters((current) => ({
                              ...current,
                              datePreset: value as DatePreset,
                            }))
                          }
                          className="h-5 w-5 border-brand-gray-300 text-brand-gold focus:ring-brand-gold"
                        />
                        <span>{label}</span>
                      </label>
                    ))}
                  </div>

                  {demandFilters.datePreset === "CUSTOM" ? (
                    <div className="date-range mt-4">
                      <label>
                        <span>From</span>
                        <input
                          type="date"
                          value={demandFilters.startDate}
                          max={formatDateInput(new Date("2027-04-27T12:00:00"))}
                          onChange={(event) =>
                            setDemandFilters((current) => ({
                              ...current,
                              startDate: event.target.value,
                            }))
                          }
                        />
                      </label>
                      <label>
                        <span>To</span>
                        <input
                          type="date"
                          value={demandFilters.endDate}
                          max={formatDateInput(new Date("2027-04-27T12:00:00"))}
                          onChange={(event) =>
                            setDemandFilters((current) => ({
                              ...current,
                              endDate: event.target.value,
                            }))
                          }
                        />
                      </label>
                    </div>
                  ) : null}
                </fieldset>
              </div>

              <div className="filters-actions pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="filters-apply"
                >
                  Apply filters
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setDemandFilters({
                      query: "",
                      topics: [],
                      datePreset: "ALL",
                      startDate: "",
                      endDate: "",
                    })
                  }
                  className="filters-clear"
                >
                  Clear search and filters
                </button>
              </div>
            </>
          ) : (
            <>
              <section className="search-query-group">
                <label htmlFor="tv-refine-query" className="search-query-label">
                  Search terms
                </label>
                <input
                  id="tv-refine-query"
                  type="search"
                  value={tvFilters.query}
                  onChange={(event) =>
                    setTvFilters((current) => ({
                      ...current,
                      query: event.target.value,
                    }))
                  }
                  placeholder="Search programme names, people, series or themes"
                  className="search-query-input mt-3"
                />
              </section>

              <div className="filters-grid">
                <fieldset className="filter-group">
                  <legend>Programme type</legend>
                  <div className="checkbox-group mt-4">
                    {tvAvailableSeries.map((series) => {
                      const checked = tvFilters.series.includes(series);
                      return (
                        <label key={series} className="checkbox-option">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() =>
                              setTvFilters((current) => ({
                                ...current,
                                series: checked
                                  ? current.series.filter(
                                      (item) => item !== series,
                                    )
                                  : [...current.series, series],
                              }))
                            }
                            className="h-5 w-5 rounded border-brand-gray-300 text-brand-gold focus:ring-brand-gold"
                          />
                          <span>{series}</span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              </div>

              <div className="filters-actions pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="filters-apply"
                >
                  Apply filters
                </button>
                <button
                  type="button"
                  onClick={() => setTvFilters({ query: "", series: [] })}
                  className="filters-clear"
                >
                  Clear search and filters
                </button>
              </div>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}

function BookmarkGlyph({ saved }: { saved: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-[0.95rem] w-[0.95rem]"
      fill={saved ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.9"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 4.75h10a1 1 0 0 1 1 1V20l-6-3.7L6 20V5.75a1 1 0 0 1 1-1Z"
      />
    </svg>
  );
}

function MyParliamentGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-[1rem] w-[1rem]"
      fill="currentColor"
    >
      <circle cx="12" cy="7.25" r="3.35" />
      <path d="M4.6 19.2C4.6 15.95 7.95 14.3 12 14.3C16.05 14.3 19.4 15.95 19.4 19.2V20.15H4.6V19.2Z" />
    </svg>
  );
}

function SaveVideoButton({
  saved,
  onToggle,
  dark = false,
}: {
  saved: boolean;
  onToggle: () => void;
  dark?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onToggle();
      }}
      className={[
        "video-save-button",
        dark ? "video-save-button-dark" : "",
      ].join(" ")}
      aria-pressed={saved}
      aria-label={saved ? "Remove from My videos" : "Save to My videos"}
      title={saved ? "Remove from My videos" : "Save to My videos"}
    >
      <BookmarkGlyph saved={saved} />
      <span>{saved ? "Saved" : "Save"}</span>
    </button>
  );
}

function DemandSection({
  isVideoSaved,
  onToggleSavedVideo,
  onMarkVideoWatched,
  title,
  items,
  description,
  hideForumBadge = false,
  preferTopicTitle = false,
  emptyMessage = "Nothing to show right now.",
}: {
  isVideoSaved: (key: string) => boolean;
  onToggleSavedVideo: (key: string) => void;
  onMarkVideoWatched: (key: string) => void;
  title: string;
  items: VodItem[];
  description?: string;
  hideForumBadge?: boolean;
  preferTopicTitle?: boolean;
  emptyMessage?: string;
}) {
  const railRef = useRef<HTMLDivElement | null>(null);

  const scrollRail = (direction: "prev" | "next") => {
    const rail = railRef.current;
    if (!rail) return;
    const distance = Math.max(rail.clientWidth * 0.82, 320);
    rail.scrollBy({
      left: direction === "next" ? distance : -distance,
      behavior: "smooth",
    });
  };

  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-4 border-b border-brand-gray-300 pb-3">
        <div>
          <h3 className="text-2xl font-semibold text-brand-gray-700">
            {title}
          </h3>
          {description ? (
            <p className="mt-1 text-sm text-brand-gray-500">{description}</p>
          ) : null}
        </div>
        {items.length ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollRail("prev")}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-gray-300 bg-white/70 text-brand-gray-600 transition hover:border-brand-gold hover:text-brand-gold"
              aria-label={`Scroll ${title} backward`}
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => scrollRail("next")}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-gray-300 bg-white/70 text-brand-gray-600 transition hover:border-brand-gold hover:text-brand-gold"
              aria-label={`Scroll ${title} forward`}
            >
              →
            </button>
          </div>
        ) : null}
      </div>

      {!items.length ? (
        <p className="text-sm text-brand-gray-500">{emptyMessage}</p>
      ) : (
        <div
          ref={railRef}
          className="flex gap-4 overflow-x-auto pb-2 pr-2 scroll-smooth snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((item) => (
            <div
              key={item.id}
              className="w-[20rem] shrink-0 snap-start sm:w-[22rem] xl:w-[23rem]"
            >
              <DemandCard
                item={item}
                hideForumBadge={hideForumBadge}
                preferTopicTitle={preferTopicTitle}
                saved={isVideoSaved(getVodStorageKey(item.id))}
                onToggleSaved={() =>
                  onToggleSavedVideo(getVodStorageKey(item.id))
                }
                onMarkWatched={() =>
                  onMarkVideoWatched(getVodStorageKey(item.id))
                }
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function LiveCard({
  item,
  saved,
  onToggleSaved,
  onMarkWatched,
}: {
  item: VodItem;
  saved: boolean;
  onToggleSaved: () => void;
  onMarkWatched: () => void;
}) {
  const { main, rest } = normalizeMetaFromItem(item);
  const liveLabel = getLiveLabel(item);
  const liveTone = liveLabel === "Vótáil" ? "vote" : "live";

  return (
    <article className="group rounded-sm border border-brand-gray-300 bg-white p-4 transition hover:border-brand-gold hover:bg-[#fffefb]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <HouseBadge label={getHouseLabel(item)} />
            <StatusBadge label={liveLabel} tone={liveTone} />
          </div>
          <a href={item.href} onClick={onMarkWatched} className="block">
            <h3 className="mt-3 text-xl font-semibold leading-snug text-brand-gray-700">
              {item.title}
            </h3>
          </a>
          <p className="mt-2 text-sm text-brand-gray-500">
            {[main, rest].filter(Boolean).join(" · ")}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <SaveVideoButton saved={saved} onToggle={onToggleSaved} />
          <a href={item.href} onClick={onMarkWatched} className="inline-flex">
            <PlayBadge className="h-10 w-10 shrink-0 text-sm" variant="light" />
          </a>
        </div>
      </div>
    </article>
  );
}

function DemandCard({
  item,
  hideForumBadge = false,
  preferTopicTitle = false,
  saved,
  onToggleSaved,
  onMarkWatched,
}: {
  item: VodItem;
  hideForumBadge?: boolean;
  preferTopicTitle?: boolean;
  saved: boolean;
  onToggleSaved: () => void;
  onMarkWatched: () => void;
}) {
  const { main, rest } = normalizeMetaFromItem(item);
  const restWithoutDuration = stripDurationFromMeta(rest, item.duration);
  const committeeItem = isCommitteeVodItem(item);
  const displayTitle =
    committeeItem && preferTopicTitle ? item.topic : item.title;
  const supportingLine =
    committeeItem && preferTopicTitle
      ? item.forum
      : committeeItem
        ? item.topic
        : undefined;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-sm bg-white transition hover:bg-[#fffefb]">
      <div className="relative bg-brand-gray-100">
        <a href={item.href} onClick={onMarkWatched} className="block">
          <HoverPreview
            thumb={item.thumb}
            title={item.title}
            previewSrc={item.mp4Url}
            durationLabel={formatDurationCompact(item.duration)}
            badgeVariant="light"
          />
        </a>
        <div className="absolute bottom-3 right-3 z-10 flex max-w-[78%] flex-col items-end gap-2">
          <StatusBadge label="On demand" tone="vod" />
          {!hideForumBadge ? <HouseBadge label={getHouseLabel(item)} /> : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <a href={item.href} onClick={onMarkWatched} className="block">
          <h4 className="card-title-clamp-3 text-lg font-semibold leading-snug text-brand-gray-700">
            {displayTitle}
          </h4>
        </a>
        {supportingLine ? (
          <div className="mt-3 text-sm font-medium text-brand-gray-500">
            {committeeItem && preferTopicTitle ? (
              <CommitteePageLink item={item} />
            ) : (
              supportingLine
            )}
          </div>
        ) : null}
        <div className="mt-auto flex items-end justify-between gap-3 pt-3">
          <div className="min-w-0">
            <p className="text-sm text-brand-gray-500">
              {[main, restWithoutDuration].filter(Boolean).join(" · ")}
            </p>
            <div className="mt-2">
              <DebateLink href={item.debate} />
            </div>
          </div>
          <div className="shrink-0">
            <SaveVideoButton saved={saved} onToggle={onToggleSaved} />
          </div>
        </div>
      </div>
    </article>
  );
}

function TvRailCard({
  item,
  active = false,
  onSelect,
}: {
  item: OireachtasTvItem;
  active?: boolean;
  onSelect?: () => void;
}) {
  return (
    <article
      className={[
        "tv-card-surface tv-rail-card relative w-full overflow-hidden rounded-sm text-left no-underline",
        active ? "border-white/20" : "",
      ].join(" ")}
    >
      <button
        type="button"
        onClick={onSelect}
        className="grid w-full appearance-none grid-cols-[9rem_minmax(0,1fr)] items-stretch border-0 bg-transparent p-0 text-left"
      >
        <div className="relative min-h-full self-stretch overflow-hidden bg-black/10">
          <img src={item.thumb} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center">
            <PlayBadge className="h-10 w-10 text-sm" />
          </div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-between p-3">
          <h4 className="tv-card-title card-title-clamp-3 text-[1rem] font-semibold leading-[1.15]">
            {item.title}
          </h4>
          {item.meta ? (
            <p className="tv-meta mt-1.5 text-sm font-medium">
              {formatMetaCompact(item.meta)}
            </p>
          ) : null}
        </div>
      </button>
    </article>
  );
}

function TvPosterCard({
  item,
  saved = false,
  onToggleSaved,
  onPlay,
}: {
  item: OireachtasTvItem;
  saved?: boolean;
  onToggleSaved?: () => void;
  onPlay: () => void;
}) {
  return (
    <article className="group relative overflow-hidden rounded-sm border border-white/10 bg-black text-left transition hover:border-white/18">
      <button
        type="button"
        onClick={onPlay}
        className="block h-full w-full text-left"
      >
        <HoverPreview
          thumb={item.thumb}
          title={item.title}
          previewSrc={item.previewSrc}
          aspectClassName="aspect-[4/5]"
        >
          <div className="demand-feature-card-scrim absolute inset-0" />
          <div className="absolute inset-x-0 bottom-0 z-10 p-4 pointer-events-none">
            <p className="tv-kicker mb-3 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-white/78">
              {item.series}
            </p>
            <h4 className="demand-feature-title max-w-[15rem] text-[1.15rem] font-semibold leading-[1.08] text-white">
              {item.title}
            </h4>
            {item.meta ? (
              <p className="mt-3 text-sm font-medium text-white/82">
                {formatMetaCompact(item.meta)}
              </p>
            ) : null}
          </div>
        </HoverPreview>
      </button>
      {onToggleSaved ? (
        <div className="pointer-events-auto absolute right-4 top-4 z-20">
          <SaveVideoButton saved={saved} onToggle={onToggleSaved} dark />
        </div>
      ) : null}
    </article>
  );
}

function TvCarouselShelf({
  title,
  items,
  isVideoSaved,
  onToggleSavedVideo,
  onPlayItem,
}: {
  title: string;
  items: OireachtasTvItem[];
  isVideoSaved: (key: string) => boolean;
  onToggleSavedVideo: (key: string) => void;
  onPlayItem: (item: OireachtasTvItem) => void;
}) {
  const railRef = useRef<HTMLDivElement | null>(null);

  const scrollRail = (direction: "prev" | "next") => {
    const rail = railRef.current;
    if (!rail) return;
    const distance = Math.max(rail.clientWidth * 0.82, 320);
    rail.scrollBy({
      left: direction === "next" ? distance : -distance,
      behavior: "smooth",
    });
  };

  return (
    <>
      <div className="mb-4 flex items-end justify-between border-b border-white/10 pb-3">
        <div>
          <h3 className="text-2xl font-semibold text-white">{title}</h3>
          <p className="mt-1 text-sm text-white/62">
            {title === "Latest videos"
              ? "Find what's new in the Houses of the Oireachtas."
              : title === "Around the Houses"
                ? "Stay up to date with what happens in the Houses with our regularly updated series"
                : title === "In Focus"
                  ? "Get the inside track on what matters in Parliament with our regularly updated magazine series"
                  : "Find out what makes our politicians tick with our popular interview series"}
          </p>
        </div>
        {items.length ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollRail("prev")}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/14 bg-white/5 text-white/82 transition hover:border-white/28 hover:text-white"
              aria-label={`Scroll ${title} backward`}
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => scrollRail("next")}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/14 bg-white/5 text-white/82 transition hover:border-white/28 hover:text-white"
              aria-label={`Scroll ${title} forward`}
            >
              →
            </button>
          </div>
        ) : null}
      </div>

      <div
        ref={railRef}
        className="flex gap-4 overflow-x-auto pb-2 pr-2 scroll-smooth snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item) => (
          <div
            key={item.id}
            className="w-[19rem] shrink-0 snap-start sm:w-[21rem] xl:w-[22rem]"
          >
            <TvPosterCard
              item={item}
              saved={isVideoSaved(getTvStorageKey(item.id))}
              onToggleSaved={() => onToggleSavedVideo(getTvStorageKey(item.id))}
              onPlay={() => onPlayItem(item)}
            />
          </div>
        ))}
      </div>
    </>
  );
}

function MyParliamentView({
  savedVideos,
  recentVideos,
  isVideoSaved,
  onToggleSavedVideo,
  onMarkVideoWatched,
}: {
  savedVideos: LibraryVideo[];
  recentVideos: LibraryVideo[];
  isVideoSaved: (key: string) => boolean;
  onToggleSavedVideo: (key: string) => void;
  onMarkVideoWatched: (key: string) => void;
}) {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <section className="pq-panel p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <span className="my-parliament-panel-icon" aria-hidden="true">
            <MyParliamentGlyph />
          </span>
          <div>
            <h2 className="text-2xl font-semibold text-brand-gray-700">
              My videos
            </h2>
            <p className="mt-2 max-w-3xl text-sm text-brand-gray-500">
              Saved videos and recently watched sessions in a convenient
              personalised collection. This information is stored locally on
              your device, so clearing browser history and caches may cause you
              to lose your saved videos.
            </p>
          </div>
        </div>
      </section>

      <div className="mt-8 space-y-8">
        <LibraryShelf
          title="Saved for later"
          description="A personalised collection of videos to come back to."
          items={savedVideos}
          isVideoSaved={isVideoSaved}
          onToggleSavedVideo={onToggleSavedVideo}
          onMarkVideoWatched={onMarkVideoWatched}
          emptyMessage="Nothing saved yet. Use the save control on any video card to add it to My videos."
        />
        <LibraryShelf
          title="Recently watched"
          description="Catch up on recently watched sessions."
          items={recentVideos}
          isVideoSaved={isVideoSaved}
          onToggleSavedVideo={onToggleSavedVideo}
          onMarkVideoWatched={onMarkVideoWatched}
          emptyMessage="Nothing watched yet. Open a live stream, catch-up item or Oireachtas TV feature and it will appear here."
        />
      </div>
    </main>
  );
}

function LibraryShelf({
  title,
  description,
  items,
  isVideoSaved,
  onToggleSavedVideo,
  onMarkVideoWatched,
  emptyMessage,
}: {
  title: string;
  description?: string;
  items: LibraryVideo[];
  isVideoSaved: (key: string) => boolean;
  onToggleSavedVideo: (key: string) => void;
  onMarkVideoWatched: (key: string) => void;
  emptyMessage: string;
}) {
  const railRef = useRef<HTMLDivElement | null>(null);

  const scrollRail = (direction: "prev" | "next") => {
    const rail = railRef.current;
    if (!rail) return;
    const distance = Math.max(rail.clientWidth * 0.82, 320);
    rail.scrollBy({
      left: direction === "next" ? distance : -distance,
      behavior: "smooth",
    });
  };

  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-4 border-b border-brand-gray-300 pb-3">
        <div>
          <h3 className="text-2xl font-semibold text-brand-gray-700">
            {title}
          </h3>
          {description ? (
            <p className="mt-1 text-sm text-brand-gray-500">{description}</p>
          ) : null}
        </div>
        {items.length ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollRail("prev")}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-gray-300 bg-white/70 text-brand-gray-600 transition hover:border-brand-gold hover:text-brand-gold"
              aria-label={`Scroll ${title} backward`}
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => scrollRail("next")}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-gray-300 bg-white/70 text-brand-gray-600 transition hover:border-brand-gold hover:text-brand-gold"
              aria-label={`Scroll ${title} forward`}
            >
              →
            </button>
          </div>
        ) : null}
      </div>

      {!items.length ? (
        <div className="my-parliament-empty">
          <p>{emptyMessage}</p>
        </div>
      ) : (
        <div
          ref={railRef}
          className="flex gap-4 overflow-x-auto pb-2 pr-2 scroll-smooth snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((item) => (
            <div
              key={item.key}
              className="w-[20rem] shrink-0 snap-start sm:w-[22rem] xl:w-[23rem]"
            >
              <LibraryVideoCard
                item={item}
                saved={isVideoSaved(item.key)}
                onToggleSaved={() => onToggleSavedVideo(item.key)}
                onMarkWatched={() => onMarkVideoWatched(item.key)}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function LibraryVideoCard({
  item,
  saved,
  onToggleSaved,
  onMarkWatched,
}: {
  item: LibraryVideo;
  saved: boolean;
  onToggleSaved: () => void;
  onMarkWatched: () => void;
}) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-sm bg-white transition hover:bg-[#fffefb]">
      <div className="relative bg-brand-gray-100">
        <a href={item.href} onClick={onMarkWatched} className="block">
          <HoverPreview
            thumb={item.thumb}
            title={item.title}
            previewSrc={item.previewSrc}
            durationLabel={formatDurationCompact(item.duration)}
            badgeVariant="light"
          />
        </a>
        <div className="absolute bottom-3 right-3 z-10 flex max-w-[78%] flex-col items-end gap-2">
          <StatusBadge label={item.secondaryLabel} tone={item.tone} />
          <HouseBadge label={item.label} />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <a href={item.href} onClick={onMarkWatched} className="block">
          <h4 className="card-title-clamp-3 text-lg font-semibold leading-snug text-brand-gray-700">
            {item.title}
          </h4>
        </a>
        <div className="mt-auto flex items-end justify-between gap-3 pt-3">
          {item.meta ? (
            <p className="text-sm text-brand-gray-500">{item.meta}</p>
          ) : (
            <span />
          )}
          <div className="shrink-0">
            <SaveVideoButton saved={saved} onToggle={onToggleSaved} />
          </div>
        </div>
      </div>
    </article>
  );
}

function BriefingShelf({ items }: { items: OireachtasTvItem[] }) {
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  const openViewer = (index: number) => setViewerIndex(index);
  const closeViewer = () => setViewerIndex(null);
  const current = viewerIndex === null ? null : items[viewerIndex];

  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => openViewer(index)}
            className="group relative w-[15rem] shrink-0 overflow-hidden rounded-sm border border-white/10 bg-black text-left"
          >
            <HoverPreview
              thumb={item.thumb}
              title={item.title}
              previewSrc={item.previewSrc}
              aspectClassName="aspect-[4/7]"
            />
            <div className="absolute inset-x-0 bottom-0 p-4">
              <h4 className="text-[0.98rem] font-semibold leading-tight text-white">
                {item.title}
              </h4>
              <p className="mt-2 text-sm text-white/74">{item.meta}</p>
            </div>
          </button>
        ))}
      </div>

      {current ? (
        <div
          className="fixed inset-0 z-[100] bg-[rgba(8,10,14,0.96)]"
          role="dialog"
          aria-modal="true"
          aria-label={current.title}
          onClick={(event) => {
            if (event.target === event.currentTarget) closeViewer();
          }}
        >
          <div className="relative flex h-screen w-screen flex-col bg-[#111317] text-white">
            <div className="absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-4 bg-gradient-to-b from-black/78 via-black/34 to-transparent p-4 sm:p-6">
              <div className="max-w-[42rem]">
                <p className="text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-white/56">
                  Inside Parliament: Briefing
                </p>
                <h4 className="mt-2 text-2xl font-semibold leading-tight text-white sm:text-3xl">
                  {current.title}
                </h4>
                <p className="mt-2 text-sm text-white/64">{current.meta}</p>
              </div>
              <button
                type="button"
                onClick={closeViewer}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-black/20 text-white/82 backdrop-blur-sm"
                aria-label="Close viewer"
              >
                ✕
              </button>
            </div>

            <div className="relative flex min-h-0 flex-1 items-center justify-center">
              <button
                type="button"
                onClick={() =>
                  setViewerIndex((prev) =>
                    prev === null || prev === 0 ? prev : prev - 1,
                  )
                }
                disabled={viewerIndex === 0}
                className="absolute left-4 top-1/2 z-20 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/20 text-white/82 backdrop-blur-sm disabled:opacity-30 sm:left-6"
                aria-label="Previous briefing"
              >
                ↑
              </button>

              <div
                className="relative flex h-full w-full items-center justify-center"
                onTouchStart={(event) =>
                  setTouchStartY(event.touches[0]?.clientY ?? null)
                }
                onTouchEnd={(event) => {
                  if (touchStartY === null || viewerIndex === null) return;
                  const endY = event.changedTouches[0]?.clientY ?? touchStartY;
                  const delta = endY - touchStartY;
                  if (delta <= -48 && viewerIndex < items.length - 1)
                    setViewerIndex(viewerIndex + 1);
                  if (delta >= 48 && viewerIndex > 0)
                    setViewerIndex(viewerIndex - 1);
                  setTouchStartY(null);
                }}
              >
                {current.previewSrc ? (
                  <video
                    key={current.id}
                    src={current.previewSrc}
                    poster={current.thumb}
                    className="h-full w-full object-contain"
                    controls
                    autoPlay
                    playsInline
                    preload="auto"
                  />
                ) : (
                  <img
                    src={current.thumb}
                    alt=""
                    className="h-full w-full object-contain"
                  />
                )}
              </div>

              <button
                type="button"
                onClick={() =>
                  setViewerIndex((prev) =>
                    prev === null || prev >= items.length - 1 ? prev : prev + 1,
                  )
                }
                disabled={viewerIndex === items.length - 1}
                className="absolute right-4 top-1/2 z-20 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/20 text-white/82 backdrop-blur-sm disabled:opacity-30 sm:right-6"
                aria-label="Next briefing"
              >
                ↓
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
