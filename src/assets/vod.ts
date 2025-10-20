// src/data/vod.ts
import type { CarouselItem } from "../components/ShelfCarousel";

// Reuse images you already have in this repo
import leadersQuestions from "../assets/carousel/leaders-questions.jpg";
import seanadLeaders from "../assets/carousel/seanad_leaders.jpg";
import financeCommittee from "../assets/carousel/finance-committee.jpg";
import explainerCommittees from "../assets/carousel/explainer-committees.jpg";
import genericPlaceholder from "../assets/carousel/generic-placeholder.jpg";
import reportLaunch from "../assets/carousel/report_launch.jpg";
import pbo from "../assets/carousel/PBO-treemap-zoomed.png";
import ivana from "../assets/carousel/ivana.jpg";
import committee_meeting from "../assets/carousel/committee_meeting.jpg";
import wide_committee from "../assets/carousel/wide_committee.jpg";
import fundingMap from "../assets/carousel/fundingMap.png";
import reportLaunchBrief from "../assets/carousel/reportLaunch.jpg";

// ——— Dáil ———
export const vodDail: CarouselItem[] = [
  {
    id: "d1",
    kind: "VOD",
    title: "Leaders’ Questions",
    subtitle: "Inside Parliament | Dáil Éireann",
    meta: "Today · 38 min · ISL · CC",
    href: "#",
    thumb: leadersQuestions,
  },
  {
    id: "d2",
    kind: "VOD",
    title: "Topical Issues",
    subtitle: "Inside Parliament | Dáil Éireann",
    meta: "Yesterday · 47 min · CC",
    href: "#",
    thumb: genericPlaceholder,
  },
  {
    id: "d3",
    kind: "Report",
    title: "Pre-leg scrutiny: Climate Bill",
    subtitle: "Committee referral",
    meta: "12 min read",
    href: "#",
    thumb: reportLaunch,
  },
  {
    id: "d4",
    kind: "Learning Hub",
    title: "How a Bill becomes law",
    subtitle: "Get to know your Parliament",
    meta: "3 min",
    href: "#",
    thumb: wide_committee,
  },
];

// ——— Seanad ———
export const vodSeanad: CarouselItem[] = [
  {
    id: "s1",
    kind: "VOD",
    title: "Order of Business",
    subtitle: "Inside Parliament | Seanad Éireann",
    meta: "Earlier · 26 min · CC",
    href: "#",
    thumb: seanadLeaders,
  },
  {
    id: "s2",
    kind: "Report",
    title: "Children’s Health Ireland",
    subtitle: "Committee on Health",
    meta: "42 min read",
    href: "#",
    thumb: reportLaunchBrief,
  },
  {
    id: "s3",
    kind: "Visual data",
    title: "Sports funding by county",
    subtitle: "Constituency insights",
    meta: "Explore interactive",
    href: "#",
    thumb: fundingMap,
  },
  {
    id: "s4",
    kind: "VOD",
    title: "Highlights: Tuesday",
    subtitle: "Inside Parliament | Seanad Éireann",
    meta: "8 min · CC",
    href: "#",
    thumb: ivana,
  },
];

// ——— Committees ———
export const vodCommittees: CarouselItem[] = [
  {
    id: "c1",
    kind: "VOD",
    title: "National Children’s Hospital — update",
    subtitle: "Committee on Health",
    meta: "2 hr 08 min · CC",
    href: "#",
    thumb: financeCommittee,
  },
  {
    id: "c2",
    kind: "VOD",
    title: "Discussion with Meta and Google",
    subtitle: "Committee on Artificial Intelligence",
    meta: "2 hr 18 min · CC",
    href: "#",
    thumb: committee_meeting,
  },
  {
    id: "c3",
    kind: "VOD",
    title: "CR2 afternoon session",
    subtitle: "Committee highlights",
    meta: "41 min · CC",
    href: "#",
    thumb: explainerCommittees,
  },
  {
    id: "c4",
    kind: "Learning Hub",
    title: "How committees work",
    subtitle: "Explainer",
    meta: "3 min",
    href: "#",
    thumb: wide_committee,
  },
];

// ——— All (mix of everything) ———
export const vodAll: CarouselItem[] = [
  ...vodDail,
  ...vodSeanad,
  ...vodCommittees,
  {
    id: "a_extra1",
    kind: "VOD",
    title: "Inside Parliament — Weekend round-up",
    subtitle: "Highlights",
    meta: "12 min · CC",
    href: "#",
    thumb: ivana,
  },
  {
    id: "a_extra2",
    kind: "Visual data",
    title: "Government expenditure & fiscal policy",
    subtitle: "PBO | Briefing",
    meta: "Explore interactive",
    href: "#",
    thumb: pbo,
  },
].slice(0, 12); // keep it tidy