import type { CarouselItem } from "../components/ShelfCarousel";

// 🔸 Images
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
import CR1 from "../assets/carousel/CR1.jpg";
import CR3 from "../assets/carousel/CR3.jpg";
import Per from "../assets/carousel/Per.jpg";
import Geneva from "../assets/carousel/Geneva.jpg";
import ATH from "../assets/carousel/ATH.jpg";
import Censor from "../assets/carousel/Censor.jpg";

// ---------------------------------------------------------------------------
// Helper to guarantee unique, namespaced IDs per dataset
// ---------------------------------------------------------------------------
type BareItem = Omit<CarouselItem, "id">;

function withPrefix(prefix: string, arr: BareItem[]): CarouselItem[] {
  return arr.map((it, idx) => ({
    ...it,
    id: `${prefix}-${idx + 1}`,
  }));
}

// ---------------------------------------------------------------------------
// DÁIL — Sitting suspended  (source of truth you built)
// ---------------------------------------------------------------------------
const RAW_DAIL_SUSPENDED: BareItem[] = [
  {
    kind: "Votáil",
    title: "Order of Business",
    subtitle: "Inside Parliament | Seanad Éireann",
    meta: "ISL · CC",
    href: "https://www.oireachtas.ie/en/oireachtas-tv/seanad-eireann-live/",
    thumb: seanadLeaders,
  },
  {
    kind: "In public session",
    title: "European migration policy",
    subtitle: "Committee on European Union Affairs",
    meta: "Committee Room 1 · CC",
    href: "https://www.oireachtas.ie/en/oireachtas-tv/cr1-live/",
    thumb: CR1,
  },
  {
    kind: "In public session",
    title: "Third level fees",
    subtitle: "Committee on Education and Youth",
    meta: "Committee Room 3 · CC",
    href: "https://www.oireachtas.ie/en/oireachtas-tv/cr3-live/",
    thumb: CR3,
  },
  {
    kind: "Learning Hub",
    title: "How committees work",
    subtitle: "Get to know your Parliament",
    meta: "3 min",
    href: "https://data.oireachtas.ie/ie/oireachtas/communications/other/2025/2025-07-23_a-brief-guide-to-how-your-parliament-works_en.pdf",
    thumb: wide_committee,
  },
  {
    kind: "VOD",
    title: "National Children's Hospital",
    subtitle: "Committee on Health",
    meta: "Earlier today · 2 hr 8 min · CC·",
    href: "https://www.oireachtas.ie/en/oireachtas-tv/cr1-live/",
    thumb: financeCommittee,
  },
  {
    kind: "VOD",
    title: "Topical Issues",
    subtitle: "Inside Parliament | Dáil Éireann",
    meta: "Earlier today · 47 min · CC",
    href: "https://www.oireachtas.ie/en/oireachtas-tv/cr2-live/",
    thumb: genericPlaceholder,
  },
  {
    kind: "VOD",
    title: "Discussion with Meta and Google",
    subtitle: "Committee on Artificial Intelligence",
    meta: "Yesterday · 2 hr 18 min · CC",
    href: "https://www.oireachtas.ie/en/oireachtas-tv/cr3-live/",
    thumb: committee_meeting,
  },
  {
    kind: "Visual data",
    title: "Government expenditure and fiscal policy",
    subtitle: "PBO | Briefing",
    meta: "Interactive data exploration",
    href: "https://www.oireachtas.ie/en/how-parliament-is-run/houses-of-the-oireachtas-service/parliamentary-budget-office/briefing/",
    thumb: pbo,
  },
  {
    kind: "VOD",
    title: "Inside Parliament | Tuesday, 20 April 2027",
    subtitle: "Highlights",
    meta: "4 min · ISL · CC",
    href: "https://www.oireachtas.ie/en/oireachtas-tv/video-archive/committees/",
    thumb: ivana,
  },
  {
    kind: "Report",
    title: "Children's Health Ireland",
    subtitle: "Committee on Health",
    meta: "42 min read",
    href: "https://data.oireachtas.ie/ie/oireachtas/committee/dail/34/joint_committee_on_health/reports/2025/2025-10-08_report-on-pre-legislative-scrutiny-of-the-health-assisted-human-reproduction-amendment-bill_en.pdf",
    thumb: reportLaunch,
  },
];

export const adjournedItems = withPrefix("da-sus", RAW_DAIL_SUSPENDED);

// ---------------------------------------------------------------------------
// COMMITTEES — No sitting (your original noSittingItems)
// ---------------------------------------------------------------------------
const RAW_COMMITTEES_NO_SITTING: BareItem[] = [
   {
    kind: "VOD",
    title: "The Geneva Window | Through a Glass Darkly",
    subtitle: "Oireachtas TV Productions",
    meta: "1 hr 8 min · ISL · CC",
    href: "https://www.oireachtas.ie/en/oireachtas-tv/oireachtas-tv-productions/geneva-window/",
    thumb: Geneva,
  },
  {
    kind: "Visual data",
    title: "Government expenditure and fiscal policy",
    subtitle: "PBO | Briefing",
    meta: "Interactive data exploration",
    href: "https://www.oireachtas.ie/en/how-parliament-is-run/houses-of-the-oireachtas-service/parliamentary-budget-office/briefing/",
    thumb: pbo,
  },
  {
    kind: "VOD",
    title: "In the Opinion of the Censor",
    subtitle: "Oireachtas TV Productions",
    meta: "1 hr 4 min · ISL · CC",
    href: "https://www.oireachtas.ie/en/oireachtas-tv/oireachtas-tv-productions/in-the-opinion-of-the-censor/",
    thumb: Censor,
  },
  {
    kind: "Report",
    title: "Children's Health Ireland",
    subtitle: "Committee on Health",
    meta: "42 min read",
    href: "https://data.oireachtas.ie/ie/oireachtas/committee/dail/34/joint_committee_on_finance_public_expenditure_public_service_reform_and_digitalisation_and_taoiseach/reports/2025/2025-08-05_report-on-the-israeli-bond-programme_en.pdf",
    thumb: reportLaunch,
  },
  {
    kind: "Visual data",
    title: "Sports funding",
    subtitle: "Constituency Insights",
    meta: "Interactive data exploration",
    href: "https://d1xvr8qokt4flm.cloudfront.net/en/members/constituency-dashboard/in-focus/",
    thumb: fundingMap,
  },
  {
    kind: "VOD",
    title: "Around the Houses | March 2027",
    subtitle: "Oireachtas TV Productions",
    meta: "48 min · ISL · CC",
    href: "https://www.oireachtas.ie/en/oireachtas-tv/oireachtas-tv-productions/oireachtas-tv-monthly/10668",
    thumb: ATH,
  },
  {
    kind: "Report",
    title: "Review of DEIS school programmes",
    subtitle: "Committee on Children and Equality",
    meta: "34 min read",
    href: "https://data.oireachtas.ie/ie/oireachtas/committee/dail/34/joint_committee_on_justice_home_affairs_and_migration/reports/2025/2025-09-24_report-on-pre-legislative-scrutiny-of-the-general-scheme-of-the-guardianship-of-infants-amendment-bill-2025_en.pdf",
    thumb: reportLaunchBrief,
  },
  {
    kind: "VOD",
    title: "Inside Parliament | Tuesday, 20 April 2027",
    subtitle: "Highlights",
    meta: "7 min · ISL · CC",
    href: "https://www.oireachtas.ie/en/oireachtas-tv/video-archive/committees/10608",
    thumb: ivana,
  },
];

export const noSittingItems = withPrefix("com-nosit", RAW_COMMITTEES_NO_SITTING);

// ---------------------------------------------------------------------------
// DÁIL — No sitting  (your populated set)
// ---------------------------------------------------------------------------
const RAW_DAIL_NO_SITTING: BareItem[] = [
  {
    kind: "VOD",
    title: "Leaders' Questions",
    subtitle: "Inside Parliament | Dáil Éireann",
    meta: "Thursday, 24 April 2027 · 34 min · ISL · CC",
    href: "https://www.oireachtas.ie/en/oireachtas-tv/video-archive/dail-videos/#",
    thumb: leadersQuestions,
  },
  {
    kind: "VOD",
    title: "Vote 35 - Defence",
    subtitle: "Committee of Public Accounts",
    meta: "Thursday, 24 April 2027 · 3 hr 18 min · CC·",
    href: "https://www.oireachtas.ie/en/oireachtas-tv/video-archive/committees/10657",
    thumb: committee_meeting,
  },
  {
    kind: "Visual data",
    title: "Government expenditure and fiscal policy",
    subtitle: "PBO | Briefing",
    meta: "Interactive data exploration",
    href: "https://www.oireachtas.ie/en/how-parliament-is-run/houses-of-the-oireachtas-service/parliamentary-budget-office/briefing/",
    thumb: pbo,
  },
  {
    kind: "Report",
    title: "Children's Health Ireland",
    subtitle: "Committee on Health",
    meta: "42 min read",
    href: "https://data.oireachtas.ie/ie/oireachtas/committee/dail/34/joint_committee_on_finance_public_expenditure_public_service_reform_and_digitalisation_and_taoiseach/reports/2025/2025-08-05_report-on-the-israeli-bond-programme_en.pdf",
    thumb: reportLaunch,
  },
  {
    kind: "VOD",
    title: "Discussion with Meta and Google",
    subtitle: "Committee on Artificial Intelligence",
    meta: "Thursday, 24 April 2027 · 2 hr 8 min · CC",
    href: "https://www.oireachtas.ie/en/oireachtas-tv/video-archive/committees/10662",
    thumb: explainerCommittees,
  },
  {
    kind: "Visual data",
    title: "Sports funding",
    subtitle: "Constituency Insights",
    meta: "Interactive data exploration",
    href: "https://d1xvr8qokt4flm.cloudfront.net/en/members/constituency-dashboard/in-focus/",
    thumb: fundingMap,
  },
  {
    kind: "Report",
    title: "Review of DEIS school programmes",
    subtitle: "Committee on Children and Equality",
    meta: "34 min read",
    href: "https://data.oireachtas.ie/ie/oireachtas/committee/dail/34/joint_committee_on_justice_home_affairs_and_migration/reports/2025/2025-09-24_report-on-pre-legislative-scrutiny-of-the-general-scheme-of-the-guardianship-of-infants-amendment-bill-2025_en.pdf",
    thumb: reportLaunchBrief,
  },
  {
    kind: "VOD",
    title: "Inside Parliament | Thursday, 24 April 2027",
    subtitle: "Highlights",
    meta: "7 min · ISL · CC",
    href: "https://www.oireachtas.ie/en/oireachtas-tv/video-archive/committees/10608",
    thumb: ivana,
  },
];

export const dailNoSittingItems = withPrefix("da-nosit", RAW_DAIL_NO_SITTING);

// ---------------------------------------------------------------------------
// SEANAD — Sitting suspended (cloned from Dáil suspended but with your tweaks)
// ---------------------------------------------------------------------------
const RAW_SEANAD_SUSPENDED: BareItem[] = [
  {
    kind: "Votáil",
    title: "Order of Business",
    subtitle: "Inside Parliament | Dáil Éireann",
    meta: "ISL · CC",
    href: "https://www.oireachtas.ie/en/oireachtas-tv/dail-eireann-live/",
    thumb: leadersQuestions,
  },
  {
    kind: "In public session",
    title: "European migration policy",
    subtitle: "Committee on European Union Affairs",
    meta: "Committee Room 1 · CC",
    href: "https://www.oireachtas.ie/en/oireachtas-tv/cr1-live/",
    thumb: CR1,
  },
  {
    kind: "In public session",
    title: "Third level fees",
    subtitle: "Committee on Education and Youth",
    meta: "Committee Room 3 · CC",
    href: "https://www.oireachtas.ie/en/oireachtas-tv/cr3-live/",
    thumb: CR3,
  },
  {
    kind: "Learning Hub",
    title: "How committees work",
    subtitle: "Get to know your Parliament",
    meta: "3 min",
    href: "https://data.oireachtas.ie/ie/oireachtas/communications/other/2025/2025-07-23_a-brief-guide-to-how-your-parliament-works_en.pdf",
    thumb: wide_committee,
  },
  {
    kind: "VOD",
    title: "National Children's Hospital",
    subtitle: "Committee on Health",
    meta: "Earlier today · 2 hr 8 min · CC·",
    href: "https://www.oireachtas.ie/en/oireachtas-tv/cr1-live/",
    thumb: financeCommittee,
  },
  {
    kind: "VOD",
    title: "Topical Issues",
    subtitle: "Inside Parliament | Dáil Éireann",
    meta: "Earlier today · 47 min · CC",
    href: "https://www.oireachtas.ie/en/oireachtas-tv/cr2-live/",
    thumb: genericPlaceholder,
  },
  {
    kind: "VOD",
    title: "Discussion with Meta and Google",
    subtitle: "Committee on Artificial Intelligence",
    meta: "Yesterday · 2 hr 18 min · CC",
    href: "https://www.oireachtas.ie/en/oireachtas-tv/cr3-live/",
    thumb: committee_meeting,
  },
  {
    kind: "Visual data",
    title: "Government expenditure and fiscal policy",
    subtitle: "PBO | Briefing",
    meta: "Interactive data exploration",
    href: "https://www.oireachtas.ie/en/how-parliament-is-run/houses-of-the-oireachtas-service/parliamentary-budget-office/briefing/",
    thumb: pbo,
  },
  {
    kind: "VOD",
    title: "Inside Parliament | Tuesday, 20 April 2027",
    subtitle: "Highlights",
    meta: "4 min · ISL · CC",
    href: "https://www.oireachtas.ie/en/oireachtas-tv/video-archive/committees/",
    thumb: ivana,
  },
  {
    kind: "Report",
    title: "Children's Health Ireland",
    subtitle: "Committee on Health",
    meta: "42 min read",
    href: "https://data.oireachtas.ie/ie/oireachtas/committee/dail/34/joint_committee_on_health/reports/2025/2025-10-08_report-on-pre-legislative-scrutiny-of-the-health-assisted-human-reproduction-amendment-bill_en.pdf",
    thumb: reportLaunch,
  },
];

export const seanadSuspendedItems = withPrefix("se-sus", RAW_SEANAD_SUSPENDED);

// ---------------------------------------------------------------------------
// COMMITTEES — Sitting suspended (your populated version; fixed ids)
// ---------------------------------------------------------------------------
const RAW_COMMITTEES_SUSPENDED: BareItem[] = [
  {
    kind: "Live",
    title: "Questions to the Taoiseach",
    subtitle: "Inside Parliament | Dáil Éireann",
    meta: "ISL · CC",
    href: "https://www.oireachtas.ie/en/oireachtas-tv/dail-eireann-live/",
    thumb: leadersQuestions,
  },
  {
    kind: "Votáil",
    title: "Order of Business",
    subtitle: "Inside Parliament | Seanad Éireann",
    meta: "ISL · CC",
    href: "https://www.oireachtas.ie/en/oireachtas-tv/seanad-eireann-live/",
    thumb: seanadLeaders,
  },
  {
    kind: "In public session",
    title: "European migration policy",
    subtitle: "Committee on European Union Affairs",
    meta: "Committee Room 1 · CC",
    href: "https://www.oireachtas.ie/en/oireachtas-tv/cr1-live/",
    thumb: CR1,
  },
  {
    kind: "In public session",
    title: "Third level fees",
    subtitle: "Committee on Education and Youth",
    meta: "Committee Room 3 · CC",
    href: "https://www.oireachtas.ie/en/oireachtas-tv/cr3-live/",
    thumb: CR3,
  },
  {
    kind: "Learning Hub",
    title: "How committees work",
    subtitle: "Get to know your Parliament",
    meta: "3 min",
    href: "https://data.oireachtas.ie/ie/oireachtas/communications/other/2025/2025-07-23_a-brief-guide-to-how-your-parliament-works_en.pdf",
    thumb: wide_committee,
  },
  {
    kind: "VOD",
    title: "National Children's Hospital",
    subtitle: "Committee on Health",
    meta: "Earlier today · 2 hr 8 min · CC·",
    href: "https://www.oireachtas.ie/en/oireachtas-tv/cr1-live/",
    thumb: financeCommittee,
  },
  {
    kind: "VOD",
    title: "Topical Issues",
    subtitle: "Inside Parliament | Dáil Éireann",
    meta: "Earlier today · 47 min · CC",
    href: "https://www.oireachtas.ie/en/oireachtas-tv/cr2-live/",
    thumb: genericPlaceholder,
  },
  {
    kind: "VOD",
    title: "Discussion with Meta and Google",
    subtitle: "Committee on Artificial Intelligence",
    meta: "Yesterday · 2 hr 18 min · CC",
    href: "https://www.oireachtas.ie/en/oireachtas-tv/cr3-live/",
    thumb: committee_meeting,
  },
  {
    kind: "Visual data",
    title: "Government expenditure and fiscal policy",
    subtitle: "PBO | Briefing",
    meta: "Interactive data exploration",
    href: "https://www.oireachtas.ie/en/how-parliament-is-run/houses-of-the-oireachtas-service/parliamentary-budget-office/briefing/",
    thumb: pbo,
  },
  {
    kind: "VOD",
    title: "Inside Parliament | Tuesday, 20 April 2027",
    subtitle: "Highlights",
    meta: "4 min · ISL · CC",
    href: "https://www.oireachtas.ie/en/oireachtas-tv/video-archive/committees/",
    thumb: ivana,
  },
  {
    kind: "Report",
    title: "Children's Health Ireland",
    subtitle: "Committee on Health",
    meta: "42 min read",
    href: "https://data.oireachtas.ie/ie/oireachtas/committee/dail/34/joint_committee_on_health/reports/2025/2025-10-08_report-on-pre-legislative-scrutiny-of-the-health-assisted-human-reproduction-amendment-bill_en.pdf",
    thumb: reportLaunch,
  },
];

export const committeesSuspendedItems = withPrefix("com-sus", RAW_COMMITTEES_SUSPENDED);