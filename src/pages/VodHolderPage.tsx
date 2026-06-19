import React, { useEffect, useId, useMemo, useRef, useState } from "react";

import { type VodItem, vodAll, vodDail } from "../data/vod";
import { buildVodHolderHref, buildVodHubHref } from "../utils/vodNavigation";

const SAVED_VIDEOS_STORAGE_KEY = "vod-poc:saved-videos";
const FOCUS_MODE_STORAGE_KEY = "vod-poc:focus-mode";
const OFFICIAL_REPORT_OPEN_STORAGE_KEY = "vod-poc:official-report-open";

type RelatedLink = {
  label: string;
  href: string;
};

type BusinessItem = {
  id: string;
  displayStartTime: string;
  compactStartTime: string;
  clockStartMinutes: number;
  clockEndMinutes: number;
  durationSeconds: number;
  durationLabel?: string;
  title: string;
  navigationTitle: string;
  compactNavigationTitle: string;
  description: string;
  relatedLinks: RelatedLink[];
  speakers: SpeakerSummary[];
  videoSource: string;
};

type SittingDay = {
  chamber: string;
  sittingTitle: string;
  date: string;
  businessItems: BusinessItem[];
  totalDurationSeconds: number;
};

type ResolvedSitting = {
  sittingDay: SittingDay;
  initialItemId?: string;
};

type SpeakerSummary = {
  eId: string;
  name: string;
  role?: string;
  memberPageHref: string;
  imageHref: string;
  firstSpokenMinute: number;
};

type DebateSpeakerEvent = {
  eId: string;
  spokenMinute: number;
  role?: string;
};

type DebateSectionRecord = {
  eId: string;
  depth: number;
  sectionName: string;
  heading: string;
  normalizedHeading: string;
  startMinute: number | null;
  eventIds: string[];
  topLevelEid: string;
  topLevelHeading: string;
  topLevelStartMinute: number | null;
  topLevelEventIds: string[];
  summaries: DebateParagraphRecord[];
  questions: DebateQuestionRecord[];
  speakerIds: string[];
  speeches: DebateSpeechRecord[];
  division?: DebateDivisionRecord;
  orderedContent: DebateSectionContentRecord[];
};

type DebateSectionContentRecord =
  | {
      type: "summary";
      summary: DebateParagraphRecord;
    }
  | {
      type: "question";
      question: DebateQuestionRecord;
    }
  | {
      type: "speech";
      speech: DebateSpeechRecord;
    }
  | {
      type: "division";
    }
  | {
      type: "childSection";
      sectionId: string;
    };

type DebateDivisionRecord = {
  ta: string[];
  nil: string[];
  staon: string[];
};

type DebateParagraphRecord = {
  eId: string;
  text: string;
  html: string;
  className?: string;
  titleAttr?: string;
  refersTo?: string;
};

type DebateQuestionRecord = {
  eId: string;
  speakerId?: string;
  speakerName?: string;
  speakerDisplayName?: string;
  role?: string;
  spokenMinute: number | null;
  paragraphs: DebateParagraphRecord[];
};

type DebateSpeakerReference = {
  eId: string;
  name: string;
  memberPageHref: string;
  imageHref: string;
};

type DebateEventReference = {
  eId: string;
  label: string;
  href: string;
};

type DebateSpeechRecord = {
  eId: string;
  speakerId?: string;
  speakerName: string;
  speakerDisplayName: string;
  role?: string;
  spokenMinute: number | null;
  paragraphs: DebateParagraphRecord[];
};

type BusinessContextRecord = {
  matchedSections: DebateSectionRecord[];
  representativeSpeakers: SpeakerSummary[];
  relatedLinks: RelatedLink[];
};

type ParsedDebateRecord = {
  references: Map<string, DebateSpeakerReference>;
  events: Map<string, DebateEventReference>;
  speakerRoles: Map<string, string>;
  sections: DebateSectionRecord[];
};

const localAsset = (path: string) =>
  `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;

const QUESTION_PAPER_URL = "https://www.oireachtas.ie/en/publications/business-papers/";
const DAIL_ORDER_PAPER_URL =
  "https://www.oireachtas.ie/en/publications/?author=dail-eireann&topic%5B0%5D=business-papers&topic%5B1%5D=order-paper";
const SEANAD_ORDER_PAPER_URL =
  "https://www.oireachtas.ie/en/publications/?author=seanad-eireann&topic%5B0%5D=business-papers&topic%5B1%5D=order-paper";
const GENERAL_ORDER_PAPER_URL = "https://www.oireachtas.ie/en/publications/business-papers/";
const PROTOTYPE_VIDEO_SOURCE = localAsset(
  "/media/shorts/videos/this-week-dail-eireann.mp4",
);
const ISL_VIDEO_SOURCE = localAsset("/media/shared/isl.mp4");

const debateRecordModules = import.meta.glob("../data/debateRecords/*.xml", {
  query: "?raw",
  import: "default",
}) as Record<string, () => Promise<string>>;

const DEBATE_RECORD_LOADERS: Record<string, () => Promise<string>> = Object.fromEntries(
  Object.entries(debateRecordModules).map(([path, loadXml]) => {
    const filename = path.split("/").pop()?.replace(/\.xml$/, "") || path;
    return [filename, loadXml];
  }),
);

function getVodStorageKey(id: string): string {
  return `vod:${id}`;
}

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

function readStoredBoolean(storageKey: string, fallback = false) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (raw === null) return fallback;
    if (raw === "true") return true;
    if (raw === "false") return false;
    const parsed = JSON.parse(raw);
    return typeof parsed === "boolean" ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function writeStoredBoolean(storageKey: string, value: boolean) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(value));
  } catch {
    // Ignore storage write issues in this prototype.
  }
}

function parseDurationToSeconds(duration?: string): number {
  if (!duration) return 0;

  const hoursMatch = duration.match(/(\d+)\s*(hour|hr)/i);
  const minutesMatch = duration.match(/(\d+)\s*(minute|min)/i);
  const secondsMatch = duration.match(/(\d+)\s*(second|sec)/i);
  const hours = hoursMatch ? Number.parseInt(hoursMatch[1], 10) : 0;
  const minutes = minutesMatch ? Number.parseInt(minutesMatch[1], 10) : 0;
  const seconds = secondsMatch ? Number.parseInt(secondsMatch[1], 10) : 0;

  return hours * 3600 + minutes * 60 + seconds;
}

function formatDurationShort(duration?: string): string | undefined {
  if (!duration) return duration;

  const hoursMatch = duration.match(/(\d+)\s*(hour|hr)/i);
  const minutesMatch = duration.match(/(\d+)\s*(minute|min)/i);
  const secondsMatch = duration.match(/(\d+)\s*(second|sec)/i);
  const hours = hoursMatch ? Number.parseInt(hoursMatch[1], 10) : 0;
  const minutes = minutesMatch ? Number.parseInt(minutesMatch[1], 10) : 0;
  const seconds = secondsMatch ? Number.parseInt(secondsMatch[1], 10) : 0;

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours} hr`);
  if (minutes > 0) parts.push(`${minutes} min`);
  if (seconds > 0 && hours === 0) parts.push(`${seconds} sec`);
  return parts.length > 0 ? parts.join(" ") : duration;
}

function formatDisplayTime(time?: string): string {
  if (!time) return "";

  const [rawHours, rawMinutes] = time.split(":");
  const hours = Number.parseInt(rawHours || "", 10);
  const minutes = Number.parseInt(rawMinutes || "", 10);

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return time;

  const period = hours >= 12 ? "p.m." : "a.m.";
  const twelveHour = hours % 12 === 0 ? 12 : hours % 12;
  return `${twelveHour}.${String(minutes).padStart(2, "0")} ${period}`;
}

function parseClockTimeToMinutes(time?: string): number {
  if (!time) return 0;

  const [rawHours, rawMinutes] = time.split(":");
  const hours = Number.parseInt(rawHours || "", 10);
  const minutes = Number.parseInt(rawMinutes || "", 10);

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return 0;
  return hours * 60 + minutes;
}

function formatHourMarker(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const period = hours >= 12 ? "p.m." : "a.m.";
  const twelveHour = hours % 12 === 0 ? 12 : hours % 12;
  return `${twelveHour} ${period}`;
}

function formatMinutesAsDisplayTime(totalMinutes?: number | null): string {
  if (!Number.isFinite(totalMinutes)) return "";
  const hours = Math.floor((totalMinutes || 0) / 60);
  const minutes = (totalMinutes || 0) % 60;
  const period = hours >= 12 ? "p.m." : "a.m.";
  const twelveHour = hours % 12 === 0 ? 12 : hours % 12;
  return `${twelveHour}.${String(minutes).padStart(2, "0")} ${period}`;
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
  if (Number.isFinite(totalMinutes) && totalMinutes > 0) return `${totalMinutes} min`;
  return duration;
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

function getHouseLabel(item: VodItem): string {
  return item.forum;
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
        variant === "light" ? "media-play-badge-light" : "media-play-badge-dark",
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
}: {
  thumb: string;
  title: string;
  previewSrc?: string;
  durationLabel?: string;
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
        "preview-frame relative overflow-hidden aspect-video",
        previewReady ? "preview-frame-active" : "",
      ].join(" ")}
      onMouseEnter={playPreview}
      onMouseLeave={pausePreview}
      onFocus={playPreview}
      onBlur={pausePreview}
    >
      <img src={thumb} alt="" className="preview-image h-full w-full object-cover" />
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
      <div className="absolute inset-0 flex items-center justify-center">
        <PlayBadge className="preview-badge h-16 w-16 text-xl" variant="light" />
      </div>
      <div className="preview-chrome absolute inset-x-0 bottom-0 flex items-center justify-between px-3 py-3 text-white">
        <span />
        {durationLabel ? <span className="preview-time">{durationLabel}</span> : null}
      </div>
      <div className="preview-progress absolute bottom-0 left-0 h-[3px] w-0 rounded-full bg-white/85" />
      <span className="sr-only">{title}</span>
    </div>
  );
}

function StatusBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center whitespace-nowrap rounded-[0.4rem] border border-[#4c79be]/25 bg-[#9dbfe8] px-2.5 py-1.5 text-[0.76rem] font-semibold leading-none tracking-[0.01em] text-[#17191c]">
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

function DebateLink({ href }: { href?: string }) {
  if (!href) return null;

  return (
    <a
      href={href}
      onClick={(event) => event.stopPropagation()}
      className="contextual-link contextual-link-light inline-flex items-center gap-1 text-sm font-medium underline-offset-2 transition hover:underline"
    >
      <span>Debate</span>
      <span aria-hidden="true">↗</span>
    </a>
  );
}

function ExploreOtherBusinessCard({
  item,
  saved,
  onToggleSaved,
}: {
  item: VodItem;
  saved: boolean;
  onToggleSaved: () => void;
}) {
  const holderHref = buildVodHolderHref(item.id);
  const metaWithoutDuration = stripDurationFromMeta(item.meta, item.duration);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-sm bg-white transition hover:bg-[#fffefb]">
      <div className="relative bg-brand-gray-100">
        <a href={holderHref} className="block">
          <HoverPreview
            thumb={item.thumb}
            title={item.title}
            previewSrc={item.mp4Url}
            durationLabel={formatDurationCompact(item.duration)}
          />
        </a>
        <div className="absolute bottom-3 right-3 z-10 flex max-w-[78%] flex-col items-end gap-2">
          <StatusBadge label="On demand" />
          <HouseBadge label={getHouseLabel(item)} />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <a href={holderHref} className="block">
          <h3 className="card-title-clamp-3 text-lg font-semibold leading-snug text-brand-gray-700">
            {item.title}
          </h3>
        </a>
        <div className="mt-auto flex items-end justify-between gap-3 pt-3">
          <div className="min-w-0">
            <p className="text-sm text-brand-gray-500">
              {[item.date, metaWithoutDuration].filter(Boolean).join(" · ")}
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

function ExploreOtherBusinessSection({
  items,
  isVideoSaved,
  onToggleSavedVideo,
}: {
  items: VodItem[];
  isVideoSaved: (key: string) => boolean;
  onToggleSavedVideo: (key: string) => void;
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

  if (!items.length) return null;

  return (
    <section className="border-t border-brand-gray-300/35 px-4 py-6 sm:px-5 sm:py-7">
      <div className="mb-4 flex items-end justify-between gap-4 border-b border-brand-gray-300/45 pb-3">
        <div>
          <h2 className="text-2xl font-semibold text-brand-gray-700">
            Explore other business
          </h2>
          <p className="mt-1 text-sm text-brand-gray-500">
            Discover recent debates in the Oireachtas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scrollRail("prev")}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-gray-300 bg-white/70 text-brand-gray-600 transition hover:border-brand-gray-400 hover:text-brand-gray-800"
            aria-label="Scroll Explore other business backward"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => scrollRail("next")}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-gray-300 bg-white/70 text-brand-gray-600 transition hover:border-brand-gray-400 hover:text-brand-gray-800"
            aria-label="Scroll Explore other business forward"
          >
            →
          </button>
        </div>
      </div>

      <div
        ref={railRef}
        className="flex gap-4 overflow-x-auto pb-2 pr-2 scroll-smooth snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item) => (
          <div
            key={item.id}
            className="w-[20rem] shrink-0 snap-start sm:w-[22rem] xl:w-[23rem]"
          >
            <ExploreOtherBusinessCard
              item={item}
              saved={isVideoSaved(getVodStorageKey(item.id))}
              onToggleSaved={() => onToggleSavedVideo(getVodStorageKey(item.id))}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

function buildDescription(item: VodItem): string {
  const topic = (item.topic || "").toLowerCase();
  const title = item.title.trim();

  if (topic.includes("leaders")) {
    return "Questions from party leaders, with Government replies on matters of immediate public concern.";
  }
  if (topic.includes("oral")) {
    return "Oral questions to Ministers, with short exchanges and follow-up responses from the floor.";
  }
  if (topic.includes("other members")) {
    return "Short supplementary exchanges as members raise follow-on questions and ministerial replies.";
  }
  if (topic.includes("policy or legislation")) {
    return "Questions focused on Government policy or legislation, with direct ministerial answers and short interventions.";
  }
  if (topic.includes("topical")) {
    return "Brief focused debates on urgent constituency and policy matters selected for discussion that day.";
  }
  if (topic.includes("government business")) {
    const clause = title.includes(":") ? title.split(":").slice(1).join(":").trim() : "";
    return clause
      ? `Government business before the House, focused here on ${clause}.`
      : "Government business before the House, including the principal debate or motion scheduled for this sitting.";
  }
  if (topic.includes("private members")) {
    return "Private Members’ time, with debate led outside Government business on the motion or report listed for the sitting.";
  }
  if (topic.includes("business proposal")) {
    return "Procedural business setting out how the House will order or arrange the remainder of its work.";
  }

  return `${title} forms part of the recorded parliamentary business for this sitting day.`;
}

function buildCompactNavigationTitle(topic: string): string {
  const normalized = topic.toLowerCase();

  if (normalized.includes("parliamentary questions: oral")) {
    return "PQs: Oral";
  }
  if (normalized.includes("leaders")) {
    return "Leaders' Qs";
  }
  if (normalized.includes("other members")) {
    return "Other Members";
  }
  if (normalized.includes("policy or legislation")) {
    return "Policy / Legislation";
  }
  if (normalized.includes("government business")) {
    return "Govt Business";
  }
  if (normalized.includes("topical")) {
    return "Topical Issues";
  }
  if (normalized.includes("private members")) {
    return "Private Members";
  }

  return topic;
}

function buildRelatedLinks(item: VodItem): RelatedLink[] {
  const topic = (item.topic || "").toLowerCase();
  const links: RelatedLink[] = [];

  if (topic.includes("question")) {
    links.push({ label: "Question Paper", href: QUESTION_PAPER_URL });
  } else {
    links.push({ label: "Order Paper", href: getOrderPaperUrl(item.forum) });
  }

  if (item.debate) {
    links.push({ label: "Official Report", href: item.debate });
  }

  return links;
}

function getOrderPaperUrl(forum: string) {
  if (forum === "Dáil Éireann") return DAIL_ORDER_PAPER_URL;
  if (forum === "Seanad Éireann") return SEANAD_ORDER_PAPER_URL;
  return GENERAL_ORDER_PAPER_URL;
}

function buildBillPageHref(sourceHref: string) {
  const match = sourceHref.match(/\/ie\/oireachtas\/bill\/(\d{4})\/(\d+)\//);
  if (!match) return undefined;
  return `https://www.oireachtas.ie/en/bills/bill/${match[1]}/${match[2]}/`;
}

function mergeRelatedLinks(...groups: RelatedLink[][]) {
  const seen = new Set<string>();
  const merged: RelatedLink[] = [];

  for (const group of groups) {
    for (const link of group) {
      const key = `${link.label}::${link.href}`;
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(link);
    }
  }

  return merged;
}

function buildMemberPageHref(memberPath: string) {
  return `https://www.oireachtas.ie/en/members/member/${memberPath}`;
}

function buildMemberImageHref(memberPath: string) {
  return `https://data.oireachtas.ie/ie/oireachtas/member/id/${memberPath}/image/large`;
}

function extractRecordedMinute(recordedTime?: string | null) {
  if (!recordedTime) return Number.NaN;

  const match = recordedTime.match(/T(\d{2}):(\d{2})/);
  if (!match) return Number.NaN;

  return Number.parseInt(match[1], 10) * 60 + Number.parseInt(match[2], 10);
}

function isProceduralRole(role?: string) {
  if (!role) return false;
  const normalized = role.toLowerCase();
  return normalized.includes("cathaoirleach") || normalized.includes("ceann comhairle");
}

function inferSpeakerRole(label?: string) {
  if (!label) return undefined;
  const normalized = normalizeHeadingText(label);

  if (normalized.includes("ceann comhairle")) return "An Ceann Comhairle";
  if (normalized.includes("cathaoirleach")) return "An Cathaoirleach";

  return undefined;
}

function normalizeHeadingText(value?: string | null) {
  return (value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&amp;/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function textContentWithoutRecordedTime(element: Element) {
  const clone = element.cloneNode(true) as Element;
  Array.from(clone.getElementsByTagNameNS("*", "recordedTime")).forEach((node) =>
    node.remove(),
  );
  return (clone.textContent || "").trim();
}

function textContentsWithoutRecordedTime(elements: Element[]) {
  return elements
    .map((element) => textContentWithoutRecordedTime(element))
    .filter(Boolean);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function serializeInlineContent(element?: Element | null): string {
  if (!element) return "";

  const normalizeWhitespace = (value: string) => value.replace(/\s+/g, " ");

  const walk = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) {
      return escapeHtml(normalizeWhitespace(node.nodeValue || ""));
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return "";

    const child = node as Element;
    if (child.localName === "recordedTime") return "";

    const inner = Array.from(child.childNodes)
      .map((grandchild) => walk(grandchild))
      .join("");

    if (child.localName === "i" || child.localName === "em") return `<em>${inner}</em>`;
    if (child.localName === "b" || child.localName === "strong") {
      return `<strong>${inner}</strong>`;
    }
    if (child.localName === "q" || child.localName === "quote") return `&ldquo;${inner}&rdquo;`;
    if (child.localName === "br") return "<br />";

    return inner;
  };

  return Array.from(element.childNodes)
    .map((child) => walk(child))
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}

function paragraphRecordsWithoutRecordedTime(elements: Element[]) {
  return elements
    .map((element, index) => {
      const text = textContentWithoutRecordedTime(element);
      if (!text) return null;

      return {
        eId: element.getAttribute("eId") || `paragraph-${index + 1}`,
        text,
        html: serializeInlineContent(element),
        className: element.getAttribute("class") || undefined,
        titleAttr: element.getAttribute("title") || undefined,
        refersTo: element.getAttribute("refersTo") || undefined,
      } satisfies DebateParagraphRecord;
    })
    .filter((paragraph): paragraph is DebateParagraphRecord => Boolean(paragraph));
}

function extractRecordedMinuteFromElement(element?: Element | null) {
  if (!element) return null;
  const recordedTimeNode = element.getElementsByTagNameNS("*", "recordedTime")[0];
  const minute = extractRecordedMinute(recordedTimeNode?.getAttribute("time"));
  return Number.isFinite(minute) ? minute : null;
}

function splitMeaningfulTokens(value: string) {
  return normalizeHeadingText(value)
    .split(" ")
    .filter((token) => token.length >= 4);
}

function extractSpecificBusinessTitle(title: string) {
  const afterColon = title.includes(":") ? title.split(":").slice(1).join(":") : title;
  return afterColon
    .replace(/\bgovernment business\b/i, "")
    .replace(/\bprivate members'? business\b/i, "")
    .trim();
}

function getBusinessMatchTitle(item: BusinessItem) {
  return item.navigationTitle || item.title;
}

function countMatchingTokens(tokens: string[], heading: string) {
  return tokens.reduce((count, token) => count + Number(heading.includes(token)), 0);
}

function deriveDebateRecordKey(sittingDay: SittingDay) {
  const isoDate = (() => {
    const parsed = parseDisplayDate(sittingDay.date);
    if (!parsed) return "";
    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, "0");
    const day = String(parsed.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  })();

  if (!isoDate) return undefined;

  if (sittingDay.chamber === "Dáil Éireann") return `dail-${isoDate}`;
  if (sittingDay.chamber === "Seanad Éireann") return `seanad-${isoDate}`;

  const slug = normalizeHeadingText(sittingDay.chamber).replace(/\s+/g, "-");
  return `${slug}-${isoDate}`;
}

function parseDebateRecord(xmlText: string) {
  if (!xmlText) {
    return {
      references: new Map<string, DebateSpeakerReference>(),
      events: new Map<string, DebateEventReference>(),
      speakerRoles: new Map<string, string>(),
      sections: [] as DebateSectionRecord[],
    } satisfies ParsedDebateRecord;
  }

  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlText, "application/xml");
  const references = new Map<string, DebateSpeakerReference>();
  const events = new Map<string, DebateEventReference>();
  const roles = new Map<string, string>();
  const speakerRoles = new Map<string, string>();

  for (const roleNode of Array.from(xml.getElementsByTagNameNS("*", "TLCRole"))) {
    const eId = roleNode.getAttribute("eId");
    const showAs = roleNode.getAttribute("showAs");
    if (eId && showAs) roles.set(eId, showAs);
  }

  for (const personNode of Array.from(xml.getElementsByTagNameNS("*", "TLCPerson"))) {
    const eId = personNode.getAttribute("eId");
    const href = personNode.getAttribute("href");
    const showAs = personNode.getAttribute("showAs");
    const memberPath = href?.match(/\/ie\/oireachtas\/member\/id\/(.+)$/)?.[1];

    if (!eId || !showAs || !memberPath) continue;

    references.set(eId, {
      eId,
      name: showAs,
      memberPageHref: buildMemberPageHref(memberPath),
      imageHref: buildMemberImageHref(memberPath),
    });
  }

  for (const eventNode of Array.from(xml.getElementsByTagNameNS("*", "TLCEvent"))) {
    const eId = eventNode.getAttribute("eId");
    const href = eventNode.getAttribute("href");
    const showAs = eventNode.getAttribute("showAs");
    if (!eId || !href || !showAs) continue;

    const resolvedHref = buildBillPageHref(href) || `https://www.oireachtas.ie${href}`;
    events.set(eId, {
      eId,
      label: showAs,
      href: resolvedHref,
    });
  }

  for (const speechNode of Array.from(xml.getElementsByTagNameNS("*", "speech"))) {
    const by = speechNode.getAttribute("by")?.replace(/^#/, "");
    const roleId = speechNode.getAttribute("as")?.replace(/^#/, "");
    if (!by || !roleId || speakerRoles.has(by)) continue;
    const role = roles.get(roleId);
    if (role) speakerRoles.set(by, role);
  }

  const debateBody = xml.getElementsByTagNameNS("*", "debateBody")[0];
  const sections: DebateSectionRecord[] = [];

  const collectSections = (
    parent: Element,
    depth: number,
    topLevelContext?: {
      eId: string;
      heading: string;
      startMinute: number | null;
      eventIds: string[];
    },
  ) => {
    const childSections = Array.from(parent.children).filter(
      (child) => child.localName === "debateSection",
    );

    for (const sectionNode of childSections) {
      const sectionName = (sectionNode.getAttribute("name") || "").toLowerCase();
      const headingNode = Array.from(sectionNode.children).find(
        (child) => child.localName === "heading",
      );

      const heading = headingNode ? textContentWithoutRecordedTime(headingNode) : "";
      const recordedTimeNode = headingNode?.getElementsByTagNameNS("*", "recordedTime")[0];
      const startMinuteRaw = extractRecordedMinute(recordedTimeNode?.getAttribute("time"));
      const startMinute = Number.isFinite(startMinuteRaw) ? startMinuteRaw : null;
      const sectionEventIds = (sectionNode.getAttribute("refersTo") || "")
        .split(/\s+/)
        .map((value) => value.replace(/^#/, "").trim())
        .filter(Boolean);
      const currentTopLevelContext =
        depth === 0 || !topLevelContext
          ? {
              eId: sectionNode.getAttribute("eId") || heading || sectionName,
              heading,
              startMinute,
              eventIds: sectionEventIds,
            }
          : topLevelContext;
      const speakerIds: string[] = [];
      const seenSpeakerIds = new Set<string>();
      const speeches: DebateSpeechRecord[] = [];
      const summaries: DebateParagraphRecord[] = [];
      const questions: DebateQuestionRecord[] = [];
      const orderedContent: DebateSectionContentRecord[] = [];
      let division: DebateDivisionRecord | undefined;
      let insertedDivisionContent = false;

      const buildDivisionVoteList = (voteName: "ta" | "nil" | "staon") => {
        const voteSection = Array.from(sectionNode.children).find(
          (child) =>
            child.localName === "debateSection" &&
            (child.getAttribute("name") || "").toLowerCase() === voteName,
        );
        if (!voteSection) return [];

        return Array.from(voteSection.children)
          .filter((child) => child.localName === "p")
          .slice(1)
          .map((paragraph) => {
            const personElement = Array.from(paragraph.children).find(
              (child) => child.localName === "person",
            );
            return textContentWithoutRecordedTime(personElement || paragraph);
          })
          .filter(Boolean);
      };

      for (const childNode of Array.from(sectionNode.children)) {
        if (childNode.localName === "summary") {
          const summaryText = textContentWithoutRecordedTime(childNode);
          if (summaryText) {
            const summaryRecord = {
              eId: childNode.getAttribute("eId") || `${heading}-summary-${summaries.length + 1}`,
              text: summaryText,
              html: serializeInlineContent(childNode),
              className: childNode.getAttribute("class") || undefined,
              titleAttr: childNode.getAttribute("title") || undefined,
              refersTo: childNode.getAttribute("refersTo") || undefined,
            } satisfies DebateParagraphRecord;
            summaries.push(summaryRecord);
            orderedContent.push({
              type: "summary",
              summary: summaryRecord,
            });
          }
          continue;
        }

        if (sectionName === "division" && childNode.localName === "debateSection") {
          if (!insertedDivisionContent) {
            orderedContent.push({ type: "division" });
            insertedDivisionContent = true;
          }
          continue;
        }

        if (childNode.localName === "debateSection") {
          const childSectionId =
            childNode.getAttribute("eId") ||
            textContentWithoutRecordedTime(
              Array.from(childNode.children).find((child) => child.localName === "heading") ||
                childNode,
            ) ||
            `${heading}-section-${orderedContent.length + 1}`;
          orderedContent.push({
            type: "childSection",
            sectionId: childSectionId,
          });
          continue;
        }

        if (childNode.localName === "question") {
          const paragraphNodes = Array.from(childNode.children).filter(
            (child) => child.localName === "p",
          );
          const paragraphs = paragraphRecordsWithoutRecordedTime(paragraphNodes);
          if (paragraphs.length > 0) {
            const questionSpeakerId = childNode.getAttribute("by")?.replace(/^#/, "") || undefined;
            const questionFromNode = Array.from(childNode.children).find(
              (child) => child.localName === "from",
            );
            const questionRecord = {
              eId: childNode.getAttribute("eId") || `${heading}-question-${questions.length + 1}`,
              speakerId: questionSpeakerId,
              speakerName: questionSpeakerId
                ? references.get(questionSpeakerId)?.name
                : undefined,
              speakerDisplayName: questionFromNode
                ? textContentWithoutRecordedTime(questionFromNode)
                : questionSpeakerId
                  ? references.get(questionSpeakerId)?.name
                  : undefined,
              role: questionSpeakerId
                ? speakerRoles.get(questionSpeakerId)
                : undefined,
              spokenMinute: startMinute,
              paragraphs,
            } satisfies DebateQuestionRecord;
            questions.push(questionRecord);
            orderedContent.push({
              type: "question",
              question: questionRecord,
            });
          }
          continue;
        }

        if (childNode.localName !== "speech") continue;

        const by = childNode.getAttribute("by")?.replace(/^#/, "");
        const fromNode = Array.from(childNode.children).find((grandchild) => grandchild.localName === "from");
        const paragraphNodes = Array.from(childNode.children).filter(
          (grandchild) => grandchild.localName === "p",
        );
        const paragraphs = paragraphRecordsWithoutRecordedTime(paragraphNodes);
        const fallbackName = fromNode ? textContentWithoutRecordedTime(fromNode) : "Speaker";

        const speechRecord = {
          eId: childNode.getAttribute("eId") || fallbackName,
          speakerId: by,
          speakerName: references.get(by || "")?.name || fallbackName,
          speakerDisplayName: fallbackName,
          role: by ? speakerRoles.get(by) ?? inferSpeakerRole(fallbackName) : inferSpeakerRole(fallbackName),
          spokenMinute: extractRecordedMinuteFromElement(fromNode) ?? startMinute,
          paragraphs,
        } satisfies DebateSpeechRecord;

        speeches.push(speechRecord);
        orderedContent.push({
          type: "speech",
          speech: speechRecord,
        });

        if (!by || !references.has(by) || seenSpeakerIds.has(by)) continue;
        seenSpeakerIds.add(by);
        speakerIds.push(by);
      }

      if (sectionName === "division") {
        division = {
          ta: buildDivisionVoteList("ta"),
          nil: buildDivisionVoteList("nil"),
          staon: buildDivisionVoteList("staon"),
        };
      }

      sections.push({
        eId: sectionNode.getAttribute("eId") || heading || sectionName,
        depth,
        sectionName,
        heading,
        normalizedHeading: normalizeHeadingText(heading),
        startMinute,
        eventIds: sectionEventIds,
        topLevelEid: currentTopLevelContext.eId,
        topLevelHeading: currentTopLevelContext.heading,
        topLevelStartMinute: currentTopLevelContext.startMinute,
        topLevelEventIds: currentTopLevelContext.eventIds,
        summaries,
        questions,
        speakerIds,
        speeches,
        division,
        orderedContent,
      });

      if (sectionName === "division") continue;
      collectSections(sectionNode, depth + 1, currentTopLevelContext);
    }
  };

  if (debateBody) collectSections(debateBody, 0);

  return { references, events, speakerRoles, sections } satisfies ParsedDebateRecord;
}

function scoreSectionForItem(item: BusinessItem, section: DebateSectionRecord) {
  const topic = normalizeHeadingText(item.navigationTitle);
  const title = normalizeHeadingText(item.title);
  const heading = section.normalizedHeading;
  const specificTitle = normalizeHeadingText(
    extractSpecificBusinessTitle(getBusinessMatchTitle(item)),
  );
  const titleTokens = splitMeaningfulTokens(title);
  const specificTitleTokens = splitMeaningfulTokens(specificTitle);
  let score = 0;

  if (item.navigationTitle === "Parliamentary Questions: Oral") {
    if (heading.includes("priority questions") || heading.includes("other questions")) {
      score += 6;
    }
  }

  if (topic.includes("leaders") && heading.includes("leaders questions")) score += 8;
  if (topic.includes("other members") && heading.includes("other members")) score += 8;
  if (
    topic.includes("policy or legislation") &&
    (heading.includes("promised legislation") || heading.includes("policy") || heading.includes("legislation"))
  ) {
    score += 8;
  }
  if (topic.includes("topical") && heading.includes("topical")) score += 8;
  if (topic.includes("commencement") && heading.includes("commencement matters")) score += 8;
  if (topic.includes("order of business") && heading.includes("order of business")) score += 8;
  if (topic.includes("special address") && heading.includes("special address")) score += 8;
  if (topic.includes("motion") && heading.includes("motion")) score += 6;
  if (topic.includes("private members") && heading.includes("private members")) score += 8;
  if (topic.includes("government business")) {
    if (
      heading.includes("bill") ||
      heading.includes("stage") ||
      heading.includes("statements") ||
      heading.includes("motion")
    ) {
      score += 2;
    }
  }

  for (const token of titleTokens) {
    if (heading.includes(token)) score += 2;
  }

  if (specificTitle && heading.includes(specificTitle)) {
    score += 10;
  }

  if (specificTitleTokens.length > 0) {
    const specificMatches = countMatchingTokens(specificTitleTokens, heading);
    const specificRatio = specificMatches / specificTitleTokens.length;

    if (specificRatio >= 0.75) score += 8;
    else if (specificRatio >= 0.5) score += 4;
  }

  if (section.depth === 0) score += 1;

  return score;
}

function buildSpeakersForItem(
  item: BusinessItem,
  references: Map<string, DebateSpeakerReference>,
  speakerRoles: Map<string, string>,
  sections: DebateSectionRecord[],
) {
  const firstSeen = new Map<string, SpeakerSummary>();
  const speakerEvents: DebateSpeakerEvent[] = [];
  const sortedSections = [...sections].sort((a, b) => {
    const startDelta =
      (a.startMinute ?? item.clockStartMinutes) - (b.startMinute ?? item.clockStartMinutes);
    if (startDelta !== 0) return startDelta;
    return a.depth - b.depth;
  });

  for (const section of sortedSections) {
    for (const question of section.questions) {
      if (!question.speakerId || !references.has(question.speakerId)) continue;
      const spokenMinute = question.spokenMinute ?? section.startMinute ?? item.clockStartMinutes;

      speakerEvents.push({
        eId: question.speakerId,
        spokenMinute,
        role: question.role ?? speakerRoles.get(question.speakerId),
      });
    }

    for (const speech of section.speeches) {
      if (!speech.speakerId || !references.has(speech.speakerId)) continue;
      const spokenMinute = speech.spokenMinute ?? section.startMinute ?? item.clockStartMinutes;

      speakerEvents.push({
        eId: speech.speakerId,
        spokenMinute,
        role: speech.role,
      });
    }
  }

  const nonProceduralEvents = speakerEvents.filter(
    (event) => !isProceduralRole(event.role),
  );
  const orderedEvents =
    nonProceduralEvents.length >= 2 ? nonProceduralEvents : speakerEvents;

  for (const event of orderedEvents) {
    if (firstSeen.has(event.eId)) continue;
    const reference = references.get(event.eId);
    if (!reference) continue;

    firstSeen.set(event.eId, {
      ...reference,
      role: event.role,
      firstSpokenMinute: event.spokenMinute,
    });
  }

  if (firstSeen.size === 0) {
    for (const section of sections) {
      for (const speakerId of section.speakerIds) {
        if (firstSeen.has(speakerId)) continue;
        const reference = references.get(speakerId);
        if (!reference) continue;

        firstSeen.set(speakerId, {
          ...reference,
          role: speakerRoles.get(speakerId),
          firstSpokenMinute: section.startMinute ?? item.clockStartMinutes,
        });
      }
    }
  }

  return [...firstSeen.values()].sort((a, b) => {
    const proceduralDelta =
      Number(isProceduralRole(a.role)) - Number(isProceduralRole(b.role));
    if (proceduralDelta !== 0) return proceduralDelta;
    return a.firstSpokenMinute - b.firstSpokenMinute;
  });
}

function buildContextualRelatedLinks(
  item: BusinessItem,
  sections: DebateSectionRecord[],
  events: Map<string, DebateEventReference>,
) {
  const specificTitle = normalizeHeadingText(
    extractSpecificBusinessTitle(getBusinessMatchTitle(item)),
  );
  const specificTitleTokens = splitMeaningfulTokens(specificTitle);
  const billLinks = sections
    .filter((section) => {
      if (scoreSectionForItem(item, section) < 6) return false;
      if (specificTitleTokens.length === 0) return /bill|legislation|motion/i.test(item.title);

      const sectionHeadingMatches = countMatchingTokens(
        specificTitleTokens,
        section.normalizedHeading,
      );
      const topLevelHeadingMatches = countMatchingTokens(
        specificTitleTokens,
        normalizeHeadingText(section.topLevelHeading),
      );

      return (
        sectionHeadingMatches / specificTitleTokens.length >= 0.5 ||
        topLevelHeadingMatches / specificTitleTokens.length >= 0.5
      );
    })
    .flatMap((section) => section.eventIds)
    .map((eventId) => events.get(eventId))
    .filter(
      (event): event is DebateEventReference =>
        Boolean(event) && /bill/i.test(event.label),
    )
    .map((event) => ({
      label: "Bill page",
      href: event.href,
    }));

  const primaryLinks = item.relatedLinks.filter(
    (link) => link.label === "Question Paper" || link.label === "Order Paper",
  );
  const officialReportLinks = item.relatedLinks.filter(
    (link) => link.label === "Official Report",
  );

  return mergeRelatedLinks(primaryLinks, billLinks, officialReportLinks);
}

function buildBusinessContexts(
  sittingDay: SittingDay,
  debateRecord: ParsedDebateRecord,
) {
  const { references, events, speakerRoles, sections } = debateRecord;

  return new Map<string, BusinessContextRecord>(
    sittingDay.businessItems.map((item) => {
      const matchedSections = selectSectionsForItem(item, sections);
      return [
        item.id,
        {
          matchedSections,
          representativeSpeakers: buildSpeakersForItem(
            item,
            references,
            speakerRoles,
            matchedSections,
          ),
          relatedLinks: buildContextualRelatedLinks(item, matchedSections, events),
        },
      ];
    }),
  );
}

function selectSectionsForItem(item: BusinessItem, sections: DebateSectionRecord[]) {
  const overlapLeadMinutes = 0;
  const overlapTailMinutes = 0;
  const topLevelSections = sections
    .filter((section, index, allSections) => {
      if (section.topLevelEid !== section.eId) return false;
      return allSections.findIndex((candidate) => candidate.eId === section.eId) === index;
    })
    .sort(
      (a, b) =>
        (a.topLevelStartMinute ?? Number.POSITIVE_INFINITY) -
        (b.topLevelStartMinute ?? Number.POSITIVE_INFINITY),
    );

  const overlappingTopLevelEids = topLevelSections
    .filter((section, index) => {
      const startMinute = section.topLevelStartMinute;
      if (!Number.isFinite(startMinute)) return false;
      const nextSection = topLevelSections[index + 1];
      const endMinute = nextSection?.topLevelStartMinute ?? Number.POSITIVE_INFINITY;
      return (
        (startMinute || 0) < item.clockEndMinutes + overlapTailMinutes &&
        endMinute > item.clockStartMinutes - overlapLeadMinutes
      );
    })
    .map((section) => section.topLevelEid);

  if (overlappingTopLevelEids.length > 0) {
    const overlappingSections = sections.filter((section) =>
      overlappingTopLevelEids.includes(section.topLevelEid),
    );

    const overlappingTopLevelSections = topLevelSections
      .filter((section) => overlappingTopLevelEids.includes(section.topLevelEid))
      .map((section) => ({
        section,
        score: scoreSectionForItem(item, section),
      }))
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return (
          (a.section.topLevelStartMinute ?? Number.POSITIVE_INFINITY) -
          (b.section.topLevelStartMinute ?? Number.POSITIVE_INFINITY)
        );
      });

    if (overlappingTopLevelSections.length > 0 && overlappingTopLevelSections[0].score > 0) {
      const minimumScore = Math.max(4, overlappingTopLevelSections[0].score - 2);
      const preferredTopLevelEids = overlappingTopLevelSections
        .filter(({ score }) => score >= minimumScore)
        .map(({ section }) => section.topLevelEid);

      if (preferredTopLevelEids.length === 0) {
        return overlappingSections;
      }

      return overlappingSections.filter((section) =>
        preferredTopLevelEids.includes(section.topLevelEid),
      );
    }

    return overlappingSections;
  }

  const specificTitle = normalizeHeadingText(
    extractSpecificBusinessTitle(getBusinessMatchTitle(item)),
  );
  const specificTitleTokens = splitMeaningfulTokens(specificTitle);
  const candidateSections = sections.filter(
    (section) => {
      const sectionStart = section.startMinute;
      if (!Number.isFinite(sectionStart)) return false;
      return (
        (sectionStart || 0) >= item.clockStartMinutes - overlapLeadMinutes &&
        (sectionStart || 0) < item.clockEndMinutes + overlapTailMinutes
      );
    },
  );

  const matchedSections = candidateSections
    .map((section) => ({
      section,
      score: scoreSectionForItem(item, section),
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.section.depth !== b.section.depth) return a.section.depth - b.section.depth;
      return (a.section.startMinute ?? Number.POSITIVE_INFINITY) - (b.section.startMinute ?? Number.POSITIVE_INFINITY);
    });

  const selectedSections =
    matchedSections.length > 0
      ? matchedSections
          .filter(({ score }) => score >= Math.max(4, matchedSections[0].score - 2))
          .map(({ section }) => section)
      : candidateSections.filter((section) => section.depth === 0);

  const fallbackSections =
    specificTitleTokens.length > 0
      ? sections.filter((section) => {
          const matches = countMatchingTokens(specificTitleTokens, section.normalizedHeading);
          return matches / specificTitleTokens.length >= 0.6;
        })
      : [];

  const combinedSections = [
    ...selectedSections,
    ...fallbackSections,
  ].filter(
    (section, index, allSections) =>
      allSections.findIndex((candidate) => candidate.eId === section.eId) === index,
  );

  const selectedTopLevelEids = combinedSections.map((section) => section.topLevelEid);

  if (selectedTopLevelEids.length === 0) {
    return combinedSections;
  }

  return sections.filter((section) => selectedTopLevelEids.includes(section.topLevelEid));
}

function attachDebateContexts(
  sittingDay: SittingDay,
  businessContexts: Map<string, BusinessContextRecord>,
) {
  return {
    ...sittingDay,
    businessItems: sittingDay.businessItems.map((item) => ({
      ...item,
      relatedLinks: businessContexts.get(item.id)?.relatedLinks || item.relatedLinks,
      speakers: businessContexts.get(item.id)?.representativeSpeakers || [],
    })),
  };
}

function buildSittingDay(items: VodItem[]): SittingDay {
  const sorted = [...items].sort((a, b) =>
    (a.startTime || "").localeCompare(b.startTime || ""),
  );
  const selected = sorted;

  const businessItems = selected.map((item) => {
    const durationSeconds = Math.max(parseDurationToSeconds(item.duration), 60);
    const clockStartMinutes = parseClockTimeToMinutes(item.startTime);
    return {
      id: item.id,
      displayStartTime: item.startTime || "",
      compactStartTime: formatDisplayTime(item.startTime),
      clockStartMinutes,
      clockEndMinutes: clockStartMinutes + Math.round(durationSeconds / 60),
      durationSeconds,
      durationLabel: formatDurationShort(item.duration),
      title: item.title,
      navigationTitle: item.topic,
      compactNavigationTitle: buildCompactNavigationTitle(item.topic),
      description: buildDescription(item),
      relatedLinks: buildRelatedLinks(item),
      speakers: [],
      videoSource: item.mp4Url || PROTOTYPE_VIDEO_SOURCE,
    };
  });

  return {
    chamber: selected[0]?.forum || "Dáil Éireann",
    sittingTitle: `${selected[0]?.forum || "Dáil Éireann"} sitting`,
    date: selected[0]?.date || "",
    businessItems,
    totalDurationSeconds: Math.max(
      businessItems.reduce((total, item) => total + item.durationSeconds, 0),
      businessItems[0]?.durationSeconds || 0,
    ),
  };
}

function getRealDailPrototypeDay(): SittingDay {
  const prototypeItems = vodDail.filter(
    (item) => item.date === "Thursday, 28 May 2026",
  );
  return buildSittingDay(prototypeItems);
}

function buildExistingVodHref() {
  return buildVodHubHref("DEMAND");
}

function resolveSittingFromUrl(): ResolvedSitting {
  const search = new URLSearchParams(window.location.search);
  const itemId = search.get("item");
  const selectedItem = itemId ? vodAll.find((item) => item.id === itemId) : undefined;

  if (!selectedItem?.date) {
    return {
      sittingDay: getRealDailPrototypeDay(),
      initialItemId: undefined,
    };
  }

  const sittingItems = vodAll.filter(
    (item) => item.date === selectedItem.date && item.forum === selectedItem.forum,
  );

  if (sittingItems.length === 0) {
    return {
      sittingDay: getRealDailPrototypeDay(),
      initialItemId: undefined,
    };
  }

  return {
    sittingDay: buildSittingDay(sittingItems),
    initialItemId: selectedItem.id,
  };
}

function SpeakerAvatar({ speaker }: { speaker: SpeakerSummary }) {
  const [imageFailed, setImageFailed] = useState(false);
  const initials = speaker.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");

  return (
    <a
      href={speaker.memberPageHref}
      title={speaker.role ? `${speaker.name} · ${speaker.role}` : speaker.name}
      aria-label={speaker.role ? `${speaker.name}, ${speaker.role}` : speaker.name}
      className="group inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-brand-gray-300 bg-brand-gray-100 text-[0.72rem] font-semibold text-brand-gray-700 transition hover:border-brand-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray-500 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-cream"
    >
      {!imageFailed ? (
        <img
          src={speaker.imageHref}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span aria-hidden="true" className="text-[0.72rem] font-semibold">
          {initials}
        </span>
      )}
      <span className="sr-only">{speaker.name}</span>
    </a>
  );
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4 fill-current">
      <path d="M7 2.5A2.5 2.5 0 0 0 4.5 5v8A2.5 2.5 0 0 0 7 15.5h6A2.5 2.5 0 0 0 15.5 13V5A2.5 2.5 0 0 0 13 2.5H7Zm0 1h6c.828 0 1.5.672 1.5 1.5v8c0 .828-.672 1.5-1.5 1.5H7A1.5 1.5 0 0 1 5.5 13V5c0-.828.672-1.5 1.5-1.5Z" />
      <path d="M3.5 6.5a.5.5 0 0 1 .5.5V14A2.5 2.5 0 0 0 6.5 16.5h6a.5.5 0 0 1 0 1h-6A3.5 3.5 0 0 1 3 14V7a.5.5 0 0 1 .5-.5Z" />
    </svg>
  );
}

function ClipIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4 fill-current">
      <path d="M6.25 3A2.25 2.25 0 0 0 4 5.25v1.5a2.25 2.25 0 0 0 2.25 2.25H8.5V7.75H6.25A1.25 1.25 0 0 1 5 6.5v-1A1.5 1.5 0 0 1 6.5 4h1A1.5 1.5 0 0 1 9 5.5V8h1V5.25A2.25 2.25 0 0 0 7.75 3h-1.5Z" />
      <path d="M12.25 8A2.25 2.25 0 0 0 10 10.25v4.5A2.25 2.25 0 0 0 12.25 17h1.5A2.25 2.25 0 0 0 16 14.75v-1.5A2.25 2.25 0 0 0 13.75 11H11.5v1h2.25c.69 0 1.25.56 1.25 1.25v1.5c0 .69-.56 1.25-1.25 1.25h-1.5c-.69 0-1.25-.56-1.25-1.25v-4.5c0-.69.56-1.25 1.25-1.25h1.5A1.25 1.25 0 0 1 15 10.25V11h1v-.75A2.25 2.25 0 0 0 13.75 8h-1.5Z" />
      <path d="M9.5 5h1v10h-1z" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4 fill-current">
      <path d="M10.5 2.5a.5.5 0 0 0-1 0V11.3L6.85 8.65a.5.5 0 1 0-.7.7l3.5 3.5a.5.5 0 0 0 .7 0l3.5-3.5a.5.5 0 0 0-.7-.7L10.5 11.3V2.5Z" />
      <path d="M3 13.5a.5.5 0 0 1 .5.5v1A1.5 1.5 0 0 0 5 16.5h10A1.5 1.5 0 0 0 16.5 15v-1a.5.5 0 0 1 1 0v1A2.5 2.5 0 0 1 15 17.5H5A2.5 2.5 0 0 1 2.5 15v-1a.5.5 0 0 1 .5-.5Z" />
    </svg>
  );
}

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      className={`h-4 w-4 fill-current ${direction === "right" ? "rotate-180" : ""}`}
    >
      <path d="M12.85 4.15a.5.5 0 0 1 0 .7L8.71 9l4.14 4.15a.5.5 0 0 1-.7.7l-4.5-4.5a.5.5 0 0 1 0-.7l4.5-4.5a.5.5 0 0 1 .7 0Z" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4 fill-current">
      <path d="M10.76 2.2a.5.5 0 0 0-.61.61 7 7 0 1 1-8.34 8.34.5.5 0 0 0-.61.61A8 8 0 1 0 10.76 2.2Z" />
    </svg>
  );
}

function BookmarkGlyph({ saved }: { saved: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-[1.05rem] w-[1.05rem]"
      fill={saved ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 4.75h10a1.25 1.25 0 0 1 1.25 1.25v13.15l-6.25-3.85-6.25 3.85V6A1.25 1.25 0 0 1 7 4.75Z" />
    </svg>
  );
}

function SaveVideoButton({
  saved,
  onToggle,
}: {
  saved: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="video-save-button h-full w-full justify-center px-2.5 py-2 text-[0.82rem] leading-tight"
      aria-pressed={saved}
      aria-label={saved ? "Remove from My videos" : "Save to My videos"}
      title={saved ? "Remove from My videos" : "Save to My videos"}
    >
      <BookmarkGlyph saved={saved} />
      <span className="whitespace-nowrap">{saved ? "Saved" : "Save"}</span>
    </button>
  );
}

function IslSwitch({
  enabled,
  onToggle,
  className = "",
}: {
  enabled: boolean;
  onToggle: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={onToggle}
      className={`holder-switch ${className}`.trim()}
      aria-label={`ISL ${enabled ? "on" : "off"}`}
      title={`ISL ${enabled ? "on" : "off"}`}
    >
      <span className="holder-switch__label">Off</span>
      <span className="holder-switch__track" aria-hidden="true">
        <span className="holder-switch__thumb" />
      </span>
      <span className="holder-switch__label">On</span>
    </button>
  );
}

function HeaderTrail({
  chamber,
  date,
}: {
  chamber: string;
  date: string;
}) {
  return (
    <nav
      aria-label="Video context"
      className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[0.8rem] font-semibold uppercase tracking-[0.14em] text-brand-gray-500"
    >
      <a
        href={buildExistingVodHref()}
        className="text-brand-gray-600 transition hover:text-brand-gray-800"
      >
        Parliament on demand
      </a>
      <span aria-hidden="true" className="text-brand-gray-300">
        /
      </span>
      <span>{chamber}</span>
      <span aria-hidden="true" className="text-brand-gray-300">
        /
      </span>
      <span className="normal-case tracking-normal text-brand-gray-600">{date}</span>
    </nav>
  );
}

function HubStickyTabs() {
  return (
    <div className="sticky top-0 z-20 border-b border-brand-gray-300/80 bg-brand-cream/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
        <div className="subtle-tablist">
          <div className="tab-cluster tab-cluster-related" role="tablist" aria-label="Browse video hub">
            <a href={buildVodHubHref("NOW")} className="subtle-tab">
              Parliament in session
            </a>
            <a
              href={buildVodHubHref("DEMAND")}
              className="subtle-tab subtle-tab-active"
              aria-current="page"
            >
              Parliament on demand
            </a>
          </div>
          <div className="tab-cluster">
            <a href={buildVodHubHref("TV")} className="subtle-tab tv-tab">
              Oireachtas TV+
            </a>
            <a href={buildVodHubHref("MY")} className="subtle-tab my-parliament-tab">
              <span className="my-parliament-tab-icon" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  className="h-[1rem] w-[1rem]"
                  fill="currentColor"
                >
                  <circle cx="12" cy="7.25" r="3.35" />
                  <path d="M4.6 19.2C4.6 15.95 7.95 14.3 12 14.3C16.05 14.3 19.4 15.95 19.4 19.2V20.15H4.6V19.2Z" />
                </svg>
              </span>
              <span>My videos</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function VideoPlayer({
  videoRef,
  src,
  title,
  focusMode,
}: {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  src: string;
  title: string;
  focusMode: boolean;
}) {
  return (
    <section aria-labelledby="sitting-video-title" className="space-y-2">
      <div
        className={`border border-brand-gray-300 bg-brand-gray-900 p-2 transition ${
          focusMode ? "rounded-sm shadow-[0_18px_40px_rgba(0,0,0,0.2)]" : "rounded-sm"
        }`}
      >
        <div className="overflow-hidden rounded-sm bg-black">
          <video
            ref={videoRef}
            className="aspect-[16/8.9] w-full bg-black"
            controls
            playsInline
            preload="metadata"
            src={src}
            aria-describedby="sitting-video-title"
          />
        </div>
      </div>
      <h2 id="sitting-video-title" className="sr-only">
        {title}
      </h2>
    </section>
  );
}

function VideoContextBar({
  chamber,
  date,
  item,
  focusMode,
  saved,
  videoUrl,
  controlOffset,
  sectionRef,
  controlRailRef,
  onToggleFocusMode,
  onToggleSaved,
  islEnabled,
  onToggleIsl,
  nextItem,
}: {
  chamber: string;
  date: string;
  item: BusinessItem;
  focusMode: boolean;
  saved: boolean;
  videoUrl: string;
  controlOffset?: number;
  sectionRef: React.RefObject<HTMLElement>;
  controlRailRef: React.RefObject<HTMLDivElement>;
  onToggleFocusMode: () => void;
  onToggleSaved: () => void;
  islEnabled: boolean;
  onToggleIsl: () => void;
  nextItem?: BusinessItem;
}) {
  return (
    <section
      ref={sectionRef}
      className="border-t border-brand-gray-300/45 bg-white/48 px-3 py-5 sm:px-4 sm:py-5"
    >
      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(11rem,12rem)] lg:items-start lg:gap-x-8">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-brand-gray-500">
            <span>{`Proceedings of ${chamber}`}</span>
            <span className="text-brand-gray-300" aria-hidden="true">
              /
            </span>
            <span className="normal-case tracking-normal text-brand-gray-600">
              {date}
            </span>
          </div>
          <h2 className="mt-3 text-[1.12rem] font-semibold leading-tight tracking-[-0.01em] text-brand-gray-800 sm:text-[1.28rem]">
            {item.title}
          </h2>
          <p className="mt-3 text-sm font-medium text-brand-gray-500">
            {[item.compactStartTime, item.durationLabel].filter(Boolean).join(" · ")}
          </p>
          <p className="mt-4 text-sm leading-6 text-brand-gray-600">{item.description}</p>
          <p className="mt-3 text-sm text-brand-gray-500">
            {nextItem ? `Next: ${nextItem.navigationTitle}` : "This is the final item of business."}
          </p>
        </div>

        <div
          ref={controlRailRef}
          style={
            !focusMode && typeof controlOffset === "number"
              ? { marginTop: `${controlOffset}px` }
              : undefined
          }
          className="grid shrink-0 auto-rows-[var(--holder-action-row)] gap-[var(--holder-action-gap)] pt-3 [--holder-action-gap:0.625rem] [--holder-action-row:3.25rem] lg:w-full lg:pt-1"
        >
          {focusMode ? (
            <div className="whitespace-nowrap">
              <IslSwitch enabled={islEnabled} onToggle={onToggleIsl} />
            </div>
          ) : null}
          <button
            type="button"
            onClick={onToggleFocusMode}
            aria-pressed={focusMode}
            className="video-save-button h-full w-full justify-center gap-1.5 px-3 py-2 text-[0.82rem] leading-tight"
          >
            <MoonIcon />
            {focusMode ? "Exit focus" : "Focus mode"}
          </button>
          {!focusMode ? (
            <>
              <SaveVideoButton saved={saved} onToggle={onToggleSaved} />
              {videoUrl ? (
                <a
                  href={videoUrl}
                  download
                  className="video-save-button h-full w-full justify-center gap-1.5 px-3 py-2 text-[0.82rem] leading-tight"
                >
                  <DownloadIcon />
                  Download
                </a>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function InfoSidebar({
  item,
  speakers,
  itemIndex,
  itemCount,
  shareState,
  clipOpen,
  islEnabled,
  actionsRef,
  onPrevious,
  onNext,
  onShare,
  onToggleClip,
  onToggleIsl,
}: {
  item: BusinessItem;
  speakers: SpeakerSummary[];
  itemIndex: number;
  itemCount: number;
  shareState: "idle" | "done";
  clipOpen: boolean;
  islEnabled: boolean;
  actionsRef: React.RefObject<HTMLDivElement>;
  onPrevious: () => void;
  onNext: () => void;
  onShare: () => void;
  onToggleClip: () => void;
  onToggleIsl: () => void;
}) {
  const clipPanelId = useId();

  return (
    <aside className="border-t border-brand-gray-300/50 bg-white/62 px-4 py-5 sm:px-5 sm:py-6 lg:border-t-0 lg:border-l lg:border-l-brand-gray-300/40">
      <div className="flex h-full flex-col gap-6">
        {speakers.length > 0 ? (
          <div className="border-b border-brand-gray-300/45 pb-5">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-brand-gray-500">
              Speakers
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2.5">
              {speakers.slice(0, 9).map((speaker) => (
                <SpeakerAvatar key={speaker.eId} speaker={speaker} />
              ))}
              {speakers.length > 9 ? (
                <span className="inline-flex h-10 min-w-10 items-center justify-center rounded-full border border-brand-gray-300 bg-white px-2 text-[0.74rem] font-semibold text-brand-gray-600">
                  +{speakers.length - 9}
                </span>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="border-b border-brand-gray-300/45 pb-5">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-brand-gray-500">
            Accessibility
          </p>
          <div className="mt-4 space-y-4">
            {islEnabled ? (
              <div className="overflow-hidden rounded-sm border border-brand-gray-300 bg-brand-gray-900">
                <video
                  className="aspect-video w-full bg-black object-cover"
                  src={ISL_VIDEO_SOURCE}
                  autoPlay
                  loop
                  muted
                  playsInline
                  aria-label="Irish Sign Language availability cue"
                />
              </div>
            ) : (
              <div className="rounded-sm border border-dashed border-brand-gray-300 bg-brand-gray-50 px-3 py-4 text-sm leading-6 text-brand-gray-500">
                Irish Sign Language is available for this video.
              </div>
            )}
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-brand-gray-600">
                ISL
              </span>
              <IslSwitch enabled={islEnabled} onToggle={onToggleIsl} />
            </div>
          </div>
        </div>

        <div className="border-b border-brand-gray-300/45 pb-5">
          {item.relatedLinks.length > 0 ? (
            <div>
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-brand-gray-500">
                More resources
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2.5 text-sm">
                {item.relatedLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="contextual-link contextual-link-light inline-flex items-center gap-1 font-medium underline-offset-2 transition hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray-500 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-cream"
                  >
                    {link.label}
                    <span aria-hidden="true">↗</span>
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div ref={actionsRef} className="hidden pt-1 lg:block">
          <ActionButtonsPanel
            item={item}
            itemIndex={itemIndex}
            itemCount={itemCount}
            shareState={shareState}
            clipOpen={clipOpen}
            clipPanelId={clipPanelId}
            onPrevious={onPrevious}
            onNext={onNext}
            onShare={onShare}
            onToggleClip={onToggleClip}
          />
        </div>
      </div>
    </aside>
  );
}

function ActionButtonsPanel({
  item,
  itemIndex,
  itemCount,
  shareState,
  clipOpen,
  clipPanelId,
  onPrevious,
  onNext,
  onShare,
  onToggleClip,
}: {
  item: BusinessItem;
  itemIndex: number;
  itemCount: number;
  shareState: "idle" | "done";
  clipOpen: boolean;
  clipPanelId: string;
  onPrevious: () => void;
  onNext: () => void;
  onShare: () => void;
  onToggleClip: () => void;
}) {
  const buttonClass =
    "video-save-button h-full w-full justify-center gap-1.5 px-2.5 py-2 text-[0.82rem] leading-tight";

  return (
    <>
      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-brand-gray-500">
        Actions
      </p>
      <div className="mt-4 grid grid-cols-2 auto-rows-[var(--holder-action-row)] gap-[var(--holder-action-gap)] [--holder-action-gap:0.625rem] [--holder-action-row:3.25rem]">
        <button
          type="button"
          onClick={onPrevious}
          disabled={itemIndex === 0}
          className={`${buttonClass} disabled:cursor-not-allowed disabled:opacity-40`}
          aria-label={`Jump to previous chapter${itemIndex > 0 ? `, ${itemIndex} of ${itemCount}` : ""}`}
        >
          <ChevronIcon direction="left" />
          Previous
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={itemIndex === itemCount - 1}
          className={`${buttonClass} disabled:cursor-not-allowed disabled:opacity-40`}
          aria-label={`Jump to next chapter${itemIndex < itemCount - 1 ? `, ${itemIndex + 2} of ${itemCount}` : ""}`}
        >
          Next
          <ChevronIcon direction="right" />
        </button>
        <button type="button" onClick={onShare} className={buttonClass}>
          <CopyIcon />
          {shareState === "done" ? "Copied" : "Share"}
        </button>
        <button
          type="button"
          onClick={onToggleClip}
          aria-expanded={clipOpen}
          aria-controls={clipPanelId}
          className={buttonClass}
        >
          <ClipIcon />
          Create a clip
        </button>
      </div>
      <div
        id={clipPanelId}
        hidden={!clipOpen}
        className="mt-4 border border-brand-gray-300/45 bg-white px-4 py-4 text-sm leading-6 text-brand-gray-600"
      >
        <p className="font-medium text-brand-gray-800">Create a clip</p>
        <p className="mt-2">
          A future clipper will open on <span className="font-medium">{item.title}</span>,
          letting users start from this chapter and trim a precise range for reuse.
        </p>
      </div>
    </>
  );
}

function buildHourMarkers(items: BusinessItem[]) {
  if (items.length === 0) return [];

  const firstMinute = items[0].clockStartMinutes;
  const lastMinute = items[items.length - 1].clockEndMinutes;
  const span = Math.max(1, lastMinute - firstMinute);
  const firstHour = Math.ceil(firstMinute / 60) * 60;
  const markers: Array<{ label: string; left: string }> = [];

  for (let minute = firstHour; minute < lastMinute; minute += 60) {
    const offset = ((minute - firstMinute) / span) * 100;
    markers.push({
      label: formatHourMarker(minute),
      left: `${Math.max(0, Math.min(100, offset))}%`,
    });
  }

  return markers;
}

function TimelineNavButton({
  direction,
  disabled,
  onClick,
}: {
  direction: "left" | "right";
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-brand-gray-300 bg-white/80 text-brand-gray-700 transition hover:border-brand-gray-400 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray-500 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-cream disabled:cursor-not-allowed disabled:opacity-35"
      aria-label={direction === "left" ? "Scroll to earlier proceedings" : "Scroll to later proceedings"}
    >
      <ChevronIcon direction={direction} />
    </button>
  );
}

function ChapterStrip({
  chamber,
  date,
  items,
  activeIndex,
  onSelect,
  onPrevious,
  onNext,
  focusMode,
  onToggleFocusMode,
  islEnabled,
  onToggleIsl,
}: {
  chamber: string;
  date: string;
  items: BusinessItem[];
  activeIndex: number;
  onSelect: (index: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  focusMode: boolean;
  onToggleFocusMode: () => void;
  islEnabled: boolean;
  onToggleIsl: () => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLLIElement | null>>([]);

  useEffect(() => {
    const scroller = scrollRef.current;
    const activeNode = itemRefs.current[activeIndex];
    if (!scroller || !activeNode) return;

    const targetLeft =
      activeNode.offsetLeft - scroller.clientWidth / 2 + activeNode.offsetWidth / 2;
    const maxScrollLeft = scroller.scrollWidth - scroller.clientWidth;
    scroller.scrollTo({
      left: Math.max(0, Math.min(maxScrollLeft, targetLeft)),
      behavior: "smooth",
    });
  }, [activeIndex]);

  if (items.length === 1) {
    const onlyItem = items[0];

    return (
      <section className="border-t border-brand-gray-300 bg-brand-gray-50/45 px-4 py-3 sm:px-5">
        <p className="text-[0.8rem] font-semibold uppercase tracking-[0.16em] text-brand-gray-500">
          Today’s proceedings
        </p>
        <div className="mt-2 flex items-center gap-3 rounded-sm border border-brand-gray-300 bg-white px-3 py-3 text-sm text-brand-gray-700">
          <span className="inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-brand-gray-800" />
          <span className="font-semibold text-brand-gray-800">
            {onlyItem.navigationTitle}
          </span>
          <span className="text-brand-gray-500">
            {onlyItem.compactStartTime}
            {onlyItem.durationLabel ? ` · ${onlyItem.durationLabel}` : ""}
          </span>
        </div>
      </section>
    );
  }

  const hourMarkers = buildHourMarkers(items);
  const firstMinute = items[0].clockStartMinutes;
  const lastMinute = items[items.length - 1].clockEndMinutes;
  const timelineSpanMinutes = Math.max(1, lastMinute - firstMinute);
  const pxPerMinute = 5.5;
  const timelineWidth = `${Math.max(1040, timelineSpanMinutes * pxPerMinute)}px`;

  return (
      <section className="border-t border-brand-gray-300/45 bg-brand-gray-50/45 px-4 py-4 sm:px-5 sm:py-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-[0.8rem] font-semibold uppercase tracking-[0.16em] text-brand-gray-500">
            Explore the interactive timeline of the proceedings
          </h2>
          <p className="text-sm text-brand-gray-500">
            Scroll across the day’s proceedings to move from earlier to later items of business.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <TimelineNavButton
            direction="left"
            disabled={activeIndex === 0}
            onClick={onPrevious}
          />
          <TimelineNavButton
            direction="right"
            disabled={activeIndex === items.length - 1}
            onClick={onNext}
          />
          {focusMode ? (
            <>
              <div className="whitespace-nowrap">
                <IslSwitch enabled={islEnabled} onToggle={onToggleIsl} />
              </div>
              <button
                type="button"
                onClick={onToggleFocusMode}
                aria-pressed={focusMode}
                className="inline-flex items-center gap-2 rounded-full border border-brand-gray-300 bg-white/80 px-3 py-1.5 text-sm font-medium text-brand-gray-700 transition hover:border-brand-gray-400 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray-500 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-cream"
              >
                <MoonIcon />
                Exit focus
              </button>
            </>
          ) : null}
        </div>
      </div>

      <div
        ref={scrollRef}
        className="mt-4 overflow-x-auto pb-2 [scrollbar-width:thin] [scrollbar-color:rgba(84,78,70,0.45)_transparent]"
      >
        <div style={{ width: timelineWidth }}>
          {hourMarkers.length > 0 ? (
            <div className="relative mb-2 h-7">
              <div className="absolute inset-x-0 top-5 border-t border-brand-gray-300/45" />
              {hourMarkers.map((marker) => (
                <div
                  key={marker.label}
                  style={{ left: marker.left }}
                  className="absolute top-0 -translate-x-1/2 text-center"
                >
                  <span className="block whitespace-nowrap text-[0.72rem] font-medium text-brand-gray-500">
                    {marker.label}
                  </span>
                  <span className="mx-auto mt-0.5 block h-2.5 w-px bg-brand-gray-300/55" />
                </div>
              ))}
            </div>
          ) : null}

          <ol className="relative h-[9.5rem] min-w-full rounded-sm border border-brand-gray-300/45 bg-white">
        {items.map((item, index) => {
          const left = `${((item.clockStartMinutes - firstMinute) / timelineSpanMinutes) * 100}%`;
          const width = `${((item.clockEndMinutes - item.clockStartMinutes) / timelineSpanMinutes) * 100}%`;
          const itemMinutes = Math.max(1, item.clockEndMinutes - item.clockStartMinutes);
          const useCompactLabel = itemMinutes <= 20;
          const isActive = index === activeIndex;
          const isCompleted = index < activeIndex;
          const stateLabel = isActive
            ? "Current"
            : isCompleted
              ? "Earlier"
              : "Later";

          return (
            <li
              key={item.id}
              style={{ left, width }}
              className="absolute inset-y-0"
              ref={(node) => {
                itemRefs.current[index] = node;
              }}
            >
              <button
                type="button"
                onClick={() => onSelect(index)}
                aria-current={isActive ? "true" : undefined}
                title={`${item.navigationTitle} · ${item.compactStartTime}${item.durationLabel ? ` · ${item.durationLabel}` : ""} · ${item.description}`}
                className={`flex h-full w-full flex-col justify-between gap-2 border-r border-brand-gray-300 px-3 py-2.5 text-left transition focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray-500 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-cream ${
                  isActive
                    ? "bg-brand-gray-800 text-white"
                    : isCompleted
                      ? "bg-brand-gray-100/85 text-brand-gray-700"
                      : "bg-white text-brand-gray-500 hover:bg-brand-gray-50/80"
                }`}
              >
                <span className="text-[0.68rem] font-semibold uppercase tracking-[0.14em]">
                  {stateLabel}
                </span>
                <span className="line-clamp-3 text-[0.76rem] font-semibold leading-4 sm:text-[0.8rem]">
                  {useCompactLabel ? item.compactNavigationTitle : item.navigationTitle}
                </span>
                <span className="text-[0.72rem] opacity-80">
                  {item.compactStartTime}
                </span>
              </button>
            </li>
          );
        })}
          </ol>
        </div>
      </div>
    </section>
  );
}

function OfficialReportAccordion({
  chamber,
  date,
  sections,
  activeItem,
  activeSections,
  isOpen,
  onToggle,
}: {
  chamber: string;
  date: string;
  sections: DebateSectionRecord[];
  activeItem: BusinessItem;
  activeSections: DebateSectionRecord[];
  isOpen: boolean;
  onToggle: () => void;
}) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const activeSectionIds = new Set(activeSections.map((section) => section.eId));
  const topLevelSections = useMemo(
    () => sections.filter((section) => section.depth === 0),
    [sections],
  );
  const sectionById = useMemo(
    () => new Map(sections.map((section) => [section.eId, section])),
    [sections],
  );
  const officialReportLink = activeItem.relatedLinks.find(
    (link) => link.label === "Official Report",
  );
  const currentSectionHeading = activeItem.navigationTitle;

  useEffect(() => {
    if (!isOpen || activeSections.length === 0) return;

    const targetId = `report-${activeSections[0].eId}`;
    const targetNode = document.getElementById(targetId);
    const scrollContainer = scrollContainerRef.current;

    if (!targetNode || !scrollContainer) return;

    const nextTop =
      targetNode.offsetTop - scrollContainer.offsetTop - 12;

    scrollContainer.scrollTo({
      top: Math.max(0, nextTop),
      behavior: "smooth",
    });
  }, [activeSections, isOpen]);

  return (
    <section className="relative border-t border-brand-gray-300/18 px-4 py-6 sm:px-5 sm:py-7">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Collapse debate transcript" : "Expand debate transcript"}
        className="absolute left-2 top-8 z-10 inline-flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full border border-brand-gray-300/28 bg-[#fcfbf8] text-brand-gray-600 shadow-[0_1px_3px_rgba(74,70,61,0.08)] transition hover:border-brand-gray-400 hover:text-brand-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray-500 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-cream"
      >
        <span
          aria-hidden="true"
          className={`text-lg transition-transform ${isOpen ? "rotate-90" : ""}`}
        >
          ›
        </span>
      </button>

      <div className="official-report-sheet border border-brand-gray-300/14 bg-[#fcfbf8] px-4 py-5 shadow-[0_1px_0_rgba(74,70,61,0.04)] sm:px-6 sm:py-6">
        <div className="flex flex-col gap-4">
          <div className="space-y-2">
            <h2 className="text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-brand-gray-500">
              Debate transcript
            </h2>
            <div className="space-y-1">
              <p className="official-report-title font-serif text-[1.45rem] leading-8 text-brand-gray-800">
                {`Proceedings of ${chamber} for ${date}`}
              </p>
              <p className="max-w-3xl text-sm leading-6 text-brand-gray-500">
                Unrevised transcript of the day&apos;s business. The Debates Office publishes the{" "}
                {officialReportLink ? (
                  <a
                    href={officialReportLink.href}
                    className="contextual-link contextual-link-light font-medium underline-offset-2 transition hover:underline"
                  >
                    Official Report
                  </a>
                ) : (
                  "Official Report"
                )}{" "}
                of the proceedings.
              </p>
            </div>
          </div>

          {isOpen ? (
            <div className="border-t border-brand-gray-300/14 pt-5">
              <div className="mb-4 border-b border-brand-gray-300/10 pb-4">
                <h3 className="text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-brand-gray-500">
                  Highlighted section
                </h3>
                <p className="mt-2 font-serif text-[1.15rem] leading-8 text-brand-gray-800">
                  {currentSectionHeading}
                </p>
              </div>

              <div
                ref={scrollContainerRef}
                className="max-h-[42rem] overflow-y-auto pr-2 sm:pr-3"
              >
                <div className="official-report-reader reader">
                  {topLevelSections.map((section) => (
                    <OfficialReportSection
                      key={section.eId}
                      section={section}
                      highlighted={activeSectionIds.has(section.eId)}
                      activeSectionIds={activeSectionIds}
                      sectionById={sectionById}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function OfficialReportSection({
  section,
  highlighted,
  activeSectionIds,
  sectionById,
}: {
  section: DebateSectionRecord;
  highlighted: boolean;
  activeSectionIds: Set<string>;
  sectionById: Map<string, DebateSectionRecord>;
}) {
  const summaryClassName = (summary: DebateParagraphRecord) => {
    const rawClass = (summary.className || "").toLowerCase();
    const summaryTitle = (summary.titleAttr || "").toLowerCase();
    const normalizedText = summary.text.toLowerCase();
    const isInterruptions = /^\(\s*interruptions?\s*\)\s*\.?\s*$/i.test(summary.text);
    const isPrayer =
      /^paidir agus machnamh\s*\.?\s*$/i.test(summary.text) ||
      /^prayer and reflection\s*\.?\s*$/i.test(summary.text);
    const isDivisionLine =
      summaryTitle === "division" || /^the\s+d[áa]il\s+divided:/i.test(summary.text);
    const isChairFormula =
      normalizedText.startsWith("chuaigh an cathaoirleach") ||
      normalizedText.startsWith("chuaigh an cathaoirleach gníomhach") ||
      normalizedText.startsWith("chuaigh an ceann comhairle") ||
      normalizedText.startsWith("chuaigh an leas-cheann comhairle");

    return [
      "official-report-summary",
      rawClass.includes("center") ? "official-report-summary--center" : "",
      isDivisionLine ? "official-report-summary--divisionline" : "",
      summaryTitle === "tellers" ? "official-report-summary--meta" : "",
      summaryTitle === "decision" ? "official-report-summary--decision" : "",
      (isInterruptions || isPrayer) && !isChairFormula
        ? "official-report-summary--italic"
        : "",
    ]
      .filter(Boolean)
      .join(" ");
  };

  const divisionRows = section.division
    ? Array.from({
        length: Math.max(
          section.division.ta.length,
          section.division.nil.length,
          section.division.staon.length,
        ),
      }).map((_, index) => ({
        ta: section.division?.ta[index] || "",
        nil: section.division?.nil[index] || "",
        staon: section.division?.staon[index] || "",
      }))
    : [];

  const renderQuestion = (question: DebateQuestionRecord) => (
    <div key={question.eId} className="official-report-question question space-y-2">
      {question.paragraphs.map((paragraph, index) => (
        <p
          key={paragraph.eId || `${question.eId}-${index}`}
          className="official-report-question__p question__p font-serif text-[1.02rem] leading-8 text-brand-gray-700"
          dangerouslySetInnerHTML={{ __html: paragraph.html }}
        />
      ))}
    </div>
  );

  const renderSpeech = (speech: DebateSpeechRecord) => (
    <article
      key={speech.eId}
      className="official-report-speech speech"
      data-speaker={speech.speakerName || undefined}
    >
      {speech.paragraphs.map((paragraph, index) => (
        <p
          key={paragraph.eId || `${speech.eId}-${index}`}
          className={[
            "official-report-speech__p font-serif text-[1.02rem] leading-8 text-brand-gray-700",
            index === 0 ? "official-report-speech__p--first" : "",
            paragraph.className || "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {index === 0 ? (
            <>
              <span className="official-report-speaker speaker font-sans font-semibold text-brand-gray-800">
                {speech.speakerDisplayName}:
              </span>{" "}
              <span dangerouslySetInnerHTML={{ __html: paragraph.html }} />
            </>
          ) : (
            <span dangerouslySetInnerHTML={{ __html: paragraph.html }} />
          )}
        </p>
      ))}
    </article>
  );

  const renderDivision = () =>
    section.division ? (
      <div key={`${section.eId}-division`} className="mt-4">
        <table className="official-report-division-table division__table">
          <thead>
            <tr>
              <th scope="col">Tá</th>
              <th scope="col">Níl</th>
              <th scope="col">Staon</th>
            </tr>
          </thead>
          <tbody>
            {divisionRows.map((row, index) => (
              <tr key={`${section.eId}-division-row-${index}`}>
                <td>{row.ta}</td>
                <td>{row.nil}</td>
                <td>{row.staon}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : null;

  return (
    <section
      id={`report-${section.eId}`}
      className={`official-report-section section scroll-mt-28 border-t border-brand-gray-300/10 px-3 py-5 transition first:border-t-0 ${
        section.sectionName === "division" ? "official-report-section--division" : ""
      } ${
        highlighted ? "bg-brand-gray-50/40 ring-1 ring-brand-gray-300/12" : ""
      }`}
      style={{ marginLeft: `${Math.min(section.depth, 3) * 18}px` }}
    >
      {section.heading ? (
        <div className="flex flex-col items-center gap-y-1 text-center">
          <h3
            className={`official-report-section__heading section__heading font-serif text-[1.08rem] leading-7 text-brand-gray-800 ${
              section.depth === 0 ? "font-semibold" : "font-medium"
            }`}
          >
            {section.heading}
          </h3>
          {section.startMinute !== null ? (
            <span className="official-report-section__time text-[0.78rem] font-medium uppercase tracking-[0.08em] text-brand-gray-500">
              {formatMinutesAsDisplayTime(section.startMinute)}
            </span>
          ) : null}
        </div>
      ) : null}

      {section.orderedContent.length > 0 ? (
        <div className="mt-3 space-y-4">
          {section.orderedContent.map((content, index) => {
            if (content.type === "summary") {
              return (
                <p
                  key={content.summary.eId || `${section.eId}-summary-${index}`}
                  className={`${summaryClassName(content.summary)} summary`}
                  dangerouslySetInnerHTML={{ __html: content.summary.html }}
                />
              );
            }

            if (content.type === "question") {
              return renderQuestion(content.question);
            }

            if (content.type === "speech") {
              return renderSpeech(content.speech);
            }

            if (content.type === "division") {
              return renderDivision();
            }

            if (content.type === "childSection") {
              const childSection = sectionById.get(content.sectionId);
              if (!childSection) return null;

              return (
                <OfficialReportSection
                  key={childSection.eId}
                  section={childSection}
                  highlighted={activeSectionIds.has(childSection.eId)}
                  activeSectionIds={activeSectionIds}
                  sectionById={sectionById}
                />
              );
            }

            return null;
          })}
        </div>
      ) : null}
    </section>
  );
}

export default function VodHolderPage() {
  const resolvedSitting = useMemo(() => resolveSittingFromUrl(), []);
  const baseSittingDay = resolvedSitting.sittingDay;
  const initialActiveIndex = Math.max(
    0,
    baseSittingDay.businessItems.findIndex((item) => item.id === resolvedSitting.initialItemId),
  );
  const [sittingDay, setSittingDay] = useState(baseSittingDay);
  const sittingResetKey = `${baseSittingDay.chamber}|${baseSittingDay.date}|${resolvedSitting.initialItemId || ""}`;
  const videoRef = useRef<HTMLVideoElement>(null);
  const contextSectionRef = useRef<HTMLElement>(null);
  const controlRailRef = useRef<HTMLDivElement>(null);
  const sidebarActionsRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(initialActiveIndex);
  const [clipOpen, setClipOpen] = useState(false);
  const [shareState, setShareState] = useState<"idle" | "done">("idle");
  const [focusMode, setFocusMode] = useState(() =>
    readStoredBoolean(FOCUS_MODE_STORAGE_KEY, false),
  );
  const [islEnabled, setIslEnabled] = useState(true);
  const [contextControlOffset, setContextControlOffset] = useState<number | undefined>(
    undefined,
  );
  const [savedVideoKeys, setSavedVideoKeys] = useState<string[]>(() =>
    readStoredKeys(SAVED_VIDEOS_STORAGE_KEY),
  );
  const [parsedDebateRecord, setParsedDebateRecord] = useState<ParsedDebateRecord>({
    references: new Map<string, DebateSpeakerReference>(),
    events: new Map<string, DebateEventReference>(),
    speakerRoles: new Map<string, string>(),
    sections: [],
  });
  const [businessContexts, setBusinessContexts] = useState<Map<string, BusinessContextRecord>>(
    new Map(),
  );
  const [officialReportOpen, setOfficialReportOpen] = useState(() =>
    readStoredBoolean(OFFICIAL_REPORT_OPEN_STORAGE_KEY, true),
  );
  const [videoSource, setVideoSource] = useState(
    sittingDay.businessItems[initialActiveIndex]?.videoSource || PROTOTYPE_VIDEO_SOURCE,
  );
  const activeItem = sittingDay.businessItems[activeIndex];
  const nextItem = sittingDay.businessItems[activeIndex + 1];
  const activeVideoKey = activeItem ? getVodStorageKey(activeItem.id) : "";
  const isSaved = activeVideoKey ? savedVideoKeys.includes(activeVideoKey) : false;
  const excludedItemIds = useMemo(
    () => new Set(sittingDay.businessItems.map((item) => item.id)),
    [sittingDay.businessItems],
  );
  const exploreOtherBusinessItems = useMemo(
    () =>
      [...vodAll]
        .filter((item) => !excludedItemIds.has(item.id))
        .sort(compareVodItemsByRecency),
    [excludedItemIds],
  );
  const activeReportSections = useMemo(
    () => businessContexts.get(activeItem.id)?.matchedSections || [],
    [activeItem.id, businessContexts],
  );

  useEffect(() => {
    let cancelled = false;
    setSittingDay(baseSittingDay);
    setParsedDebateRecord({
      references: new Map<string, DebateSpeakerReference>(),
      events: new Map<string, DebateEventReference>(),
      speakerRoles: new Map<string, string>(),
      sections: [],
    });
    setBusinessContexts(new Map());

    const debateRecordKey = deriveDebateRecordKey(baseSittingDay);
    const loadDebateRecord = debateRecordKey
      ? DEBATE_RECORD_LOADERS[debateRecordKey]
      : undefined;

    if (!loadDebateRecord) return () => {
      cancelled = true;
    };

    loadDebateRecord()
      .then((xmlText) => {
        if (cancelled) return;
        const parsedDebateRecord = parseDebateRecord(xmlText);
        const nextBusinessContexts = buildBusinessContexts(
          baseSittingDay,
          parsedDebateRecord,
        );
        setParsedDebateRecord(parsedDebateRecord);
        setBusinessContexts(nextBusinessContexts);
        setSittingDay(attachDebateContexts(baseSittingDay, nextBusinessContexts));
      })
      .catch(() => {
        if (cancelled) return;
        setParsedDebateRecord({
          references: new Map<string, DebateSpeakerReference>(),
          events: new Map<string, DebateEventReference>(),
          speakerRoles: new Map<string, string>(),
          sections: [],
        });
        setBusinessContexts(new Map());
        setSittingDay(baseSittingDay);
      });

    return () => {
      cancelled = true;
    };
  }, [baseSittingDay]);

  useEffect(() => {
    setActiveIndex(initialActiveIndex);
    setClipOpen(false);
    setIslEnabled(true);
    setOfficialReportOpen(readStoredBoolean(OFFICIAL_REPORT_OPEN_STORAGE_KEY, true));
    setVideoSource(
      baseSittingDay.businessItems[initialActiveIndex]?.videoSource || PROTOTYPE_VIDEO_SOURCE,
    );
  }, [baseSittingDay, initialActiveIndex, sittingResetKey]);

  useEffect(() => {
    if (!activeItem) return;

    const search = new URLSearchParams(window.location.search);
    search.set("prototype", "holder");
    search.set("item", activeItem.id);
    const nextUrl = `${window.location.pathname}?${search.toString()}${window.location.hash}`;
    window.history.replaceState({}, "", nextUrl);
  }, [activeItem]);

  useEffect(() => {
    writeStoredKeys(SAVED_VIDEOS_STORAGE_KEY, savedVideoKeys);
  }, [savedVideoKeys]);

  useEffect(() => {
    writeStoredBoolean(FOCUS_MODE_STORAGE_KEY, focusMode);
  }, [focusMode]);

  useEffect(() => {
    writeStoredBoolean(OFFICIAL_REPORT_OPEN_STORAGE_KEY, officialReportOpen);
  }, [officialReportOpen]);

  useEffect(() => {
    if (focusMode) {
      setContextControlOffset(undefined);
      return;
    }

    const updateOffset = () => {
      if (window.innerWidth < 1024) {
        setContextControlOffset(undefined);
        return;
      }

      const contextSection = contextSectionRef.current;
      const controlRail = controlRailRef.current;
      const sidebarActions = sidebarActionsRef.current;

      if (!contextSection || !controlRail || !sidebarActions) {
        setContextControlOffset(undefined);
        return;
      }

      const contextTop = contextSection.getBoundingClientRect().top;
      const actionsBottom = sidebarActions.getBoundingClientRect().bottom;
      const railHeight = controlRail.getBoundingClientRect().height;
      const nextOffset = Math.max(12, actionsBottom - contextTop - railHeight);

      setContextControlOffset(nextOffset);
    };

    updateOffset();

    const resizeObserver = new ResizeObserver(() => {
      updateOffset();
    });

    if (contextSectionRef.current) resizeObserver.observe(contextSectionRef.current);
    if (controlRailRef.current) resizeObserver.observe(controlRailRef.current);
    if (sidebarActionsRef.current) resizeObserver.observe(sidebarActionsRef.current);

    window.addEventListener("resize", updateOffset);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateOffset);
    };
  }, [focusMode, activeIndex, clipOpen, islEnabled, activeItem.id]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      video.currentTime = 0;
    };

    const handleEnded = () => {
      if (activeIndex < sittingDay.businessItems.length - 1) {
        const nextIndex = activeIndex + 1;
        setActiveIndex(nextIndex);
        setVideoSource(sittingDay.businessItems[nextIndex].videoSource);
      }
    };
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("ended", handleEnded);
    };
  }, [activeIndex, activeItem.durationSeconds, sittingDay]);

  const selectBusinessItem = (index: number) => {
    setActiveIndex(index);
    setVideoSource(sittingDay.businessItems[index].videoSource);
  };

  const handlePrevious = () => {
    if (activeIndex === 0) return;
    selectBusinessItem(activeIndex - 1);
  };

  const handleNext = () => {
    if (activeIndex >= sittingDay.businessItems.length - 1) return;
    selectBusinessItem(activeIndex + 1);
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Explore the ${sittingDay.chamber} sitting from ${sittingDay.date}`,
          url: shareUrl,
        });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      }
      setShareState("done");
      window.setTimeout(() => setShareState("idle"), 1800);
    } catch {
      // Ignore dismissed share sheets or clipboard restrictions in this prototype.
    }
  };

  const handleToggleSaved = () => {
    if (!activeVideoKey) return;
    setSavedVideoKeys((current) =>
      current.includes(activeVideoKey)
        ? current.filter((item) => item !== activeVideoKey)
        : [activeVideoKey, ...current],
    );
  };

  const isVideoSaved = (key: string) => savedVideoKeys.includes(key);

  const onToggleSavedVideo = (key: string) => {
    setSavedVideoKeys((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [key, ...current],
    );
  };

  return (
    <main className="min-h-screen bg-brand-cream text-brand-gray-700">
      <HubStickyTabs />
      <div
        className={`mx-auto flex w-full max-w-[82rem] flex-col gap-5 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10 ${
          focusMode ? "max-w-[74rem]" : ""
        }`}
      >
        <header className="flex flex-col gap-4">
          <HeaderTrail chamber={sittingDay.chamber} date={sittingDay.date} />
          <h1 className="sr-only">
            {`Explore the ${sittingDay.chamber} sitting from ${sittingDay.date}`}
          </h1>
        </header>

        <section className="overflow-hidden rounded-sm border border-brand-gray-300/55 bg-white/55 shadow-sm">
          <div className={`${focusMode ? "bg-brand-gray-900/4" : ""}`}>
            <div className={`mx-auto max-w-[72rem] px-3 pt-4 sm:px-4 sm:pt-5 ${focusMode ? "max-w-[52rem]" : ""}`}>
              <div className={`grid overflow-hidden rounded-sm border border-brand-gray-300/45 bg-white/30 ${focusMode ? "" : "lg:grid-cols-[minmax(0,1fr)_20rem]"}`}>
                <div className="min-w-0">
                  <VideoPlayer
                    videoRef={videoRef}
                    src={videoSource}
                    title={sittingDay.sittingTitle}
                    focusMode={focusMode}
                  />
                  {!focusMode ? (
                    <VideoContextBar
                      chamber={sittingDay.chamber}
                      date={sittingDay.date}
                      item={activeItem}
                      focusMode={focusMode}
                      saved={isSaved}
                      videoUrl={activeItem.videoSource}
                      controlOffset={contextControlOffset}
                      sectionRef={contextSectionRef}
                      controlRailRef={controlRailRef}
                      onToggleFocusMode={() => setFocusMode((current) => !current)}
                      onToggleSaved={handleToggleSaved}
                      islEnabled={islEnabled}
                      onToggleIsl={() => setIslEnabled((current) => !current)}
                      nextItem={nextItem}
                    />
                  ) : null}
                  {!focusMode ? (
                    <div className="border-t border-brand-gray-300/40 bg-white/52 px-3 py-4 sm:px-4 lg:hidden">
                      <ActionButtonsPanel
                        item={activeItem}
                        itemIndex={activeIndex}
                        itemCount={sittingDay.businessItems.length}
                        shareState={shareState}
                        clipOpen={clipOpen}
                        clipPanelId="mobile-clip-panel"
                        onPrevious={handlePrevious}
                        onNext={handleNext}
                        onShare={handleShare}
                        onToggleClip={() => setClipOpen((current) => !current)}
                      />
                    </div>
                  ) : null}
                </div>

                {!focusMode ? (
                  <InfoSidebar
                    item={activeItem}
                    speakers={activeItem.speakers}
                    itemIndex={activeIndex}
                    itemCount={sittingDay.businessItems.length}
                    shareState={shareState}
                    clipOpen={clipOpen}
                    islEnabled={islEnabled}
                    actionsRef={sidebarActionsRef}
                    onPrevious={handlePrevious}
                    onNext={handleNext}
                    onShare={handleShare}
                    onToggleClip={() => setClipOpen((current) => !current)}
                    onToggleIsl={() => setIslEnabled((current) => !current)}
                  />
                ) : null}
              </div>
            </div>

            <div className={`mx-auto max-w-[72rem] ${focusMode ? "max-w-[52rem]" : ""}`}>
              <ChapterStrip
                chamber={sittingDay.chamber}
                date={sittingDay.date}
                items={sittingDay.businessItems}
                activeIndex={activeIndex}
                onSelect={selectBusinessItem}
                onPrevious={handlePrevious}
                onNext={handleNext}
                focusMode={focusMode}
                onToggleFocusMode={() => setFocusMode((current) => !current)}
                islEnabled={islEnabled}
                onToggleIsl={() => setIslEnabled((current) => !current)}
              />
            </div>

            {!focusMode && parsedDebateRecord.sections.length > 0 ? (
              <div className="mx-auto max-w-[72rem]">
                <OfficialReportAccordion
                  chamber={sittingDay.chamber}
                  date={sittingDay.date}
                  sections={parsedDebateRecord.sections}
                  activeItem={activeItem}
                  activeSections={activeReportSections}
                  isOpen={officialReportOpen}
                  onToggle={() => setOfficialReportOpen((current) => !current)}
                />
              </div>
            ) : null}

            {!focusMode ? (
              <div className="mx-auto max-w-[72rem]">
                <ExploreOtherBusinessSection
                  items={exploreOtherBusinessItems}
                  isVideoSaved={isVideoSaved}
                  onToggleSavedVideo={onToggleSavedVideo}
                />
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
