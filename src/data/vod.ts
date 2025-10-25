// src/data/vod.ts
import ivana from "../assets/carousel/ivana.jpg";
import leadersQuestions from "../assets/carousel/leaders-questions.jpg";
import financeCommittee from "../assets/carousel/finance-committee.jpg";
import committee_meeting from "../assets/carousel/committee_meeting.jpg";
import reportLaunch from "../assets/carousel/report_launch.jpg";
import genericPlaceholder from "../assets/carousel/generic-placeholder.jpg";
import seanadLeaders from "../assets/carousel/seanad_leaders.jpg";

// 🖼️ New image imports (committees, seanad, dail)
import comm1 from "../assets/images/comm1.jpg";
import comm2 from "../assets/images/comm2.jpg";
import comm3 from "../assets/images/comm3.jpg";
import comm4 from "../assets/images/comm4.jpg";
import comm5 from "../assets/images/comm5.jpg";
import comm6 from "../assets/images/comm6.jpg";
import comm7 from "../assets/images/comm7.jpg";
import comm8 from "../assets/images/comm8.jpg";
import comm9 from "../assets/images/comm9.jpg";
import comm10 from "../assets/images/comm10.jpg";

import sean1 from "../assets/images/sean1.jpg";
import sean2 from "../assets/images/sean2.jpg";
import sean3 from "../assets/images/sean3.jpg";
import sean4 from "../assets/images/sean4.jpg";
import sean5 from "../assets/images/sean5.jpg";
import sean6 from "../assets/images/sean6.jpg";
import sean7 from "../assets/images/sean7.jpg";
import sean8 from "../assets/images/sean8.jpg";
import sean9 from "../assets/images/sean9.jpg";
import sean10 from "../assets/images/sean10.jpg";
import sean11 from "../assets/images/sean11.jpg";
import sean12 from "../assets/images/sean12.jpg";
import sean13 from "../assets/images/sean13.jpg";
import sean14 from "../assets/images/sean14.jpg";
import sean15 from "../assets/images/sean15.jpg";
import sean16 from "../assets/images/sean16.jpg";
import sean17 from "../assets/images/sean17.jpg";

import dail1 from "../assets/images/dail1.jpg";
import dail2 from "../assets/images/dail2.jpg";
import dail3 from "../assets/images/dail3.jpg";
import dail4 from "../assets/images/dail4.jpg";
import dail5 from "../assets/images/dail5.jpg";
import dail6 from "../assets/images/dail6.jpg";
import dail7 from "../assets/images/dail7.jpg";
import dail8 from "../assets/images/dail8.jpg";
import dail9 from "../assets/images/dail9.jpg";
import dail10 from "../assets/images/dail10.jpg";
import dail11 from "../assets/images/dail11.jpg";
import dail12 from "../assets/images/dail12.jpg";
import dail13 from "../assets/images/dail13.jpg";

// Forum types
export type Forum = "Dáil Éireann" | "Seanad Éireann" | "Committees" | string;

// New status type
export type VodStatus = "Live" | "In public session" | "Vótáil" | "Concluded";

export type VodItem = {
  id: string;
  kind: "VOD";
  forum: Forum;
  topic: string;
  title: string;
  date?: string;
  meta?: string;
  href: string;
  debate?: string;
  thumb: string;
  status: VodStatus; // <-- new required field
};

// 🎬 Main dataset
export const vodAll: VodItem[] = [
  // Existing examples (marked Concluded)
  {
    id: "vod-1",
    kind: "VOD",
    forum: "Dáil Éireann",
    topic: "Leaders' Questions",
    title: "Leaders' Questions",
    date: "Thursday, 27 April 2027",
    meta: "48 mins · ISL · CC",
    href: "https://www.oireachtas.ie/en/oireachtas-tv/video-archive/dail-videos/",
    debate: "https://www.oireachtas.ie/en/debates/debate/dail/2025-10-16/34/",
    thumb: ivana,
    status: "Concluded",
  },
  {
    id: "vod-2",
    kind: "VOD",
    forum: "Dáil Éireann",
    topic: "Topical Issues",
    title: "Topical Issues",
    date: "Thursday, 27 April 2027",
    meta: "37 mins · ISL · CC",
    href: "https://www.oireachtas.ie/en/oireachtas-tv/video-archive/dail-videos/",
    debate: "https://www.oireachtas.ie/en/debates/debate/dail/2025-10-16/41/",
    thumb: dail13,
    status: "Concluded",
  },
  {
    id: "vod-3",
    kind: "VOD",
    forum: "Seanad Éireann",
    topic: "Order of Business",
    title: "Order of Business",
    date: "Thursday, 27 April 2027",
    meta: "1 hr 4 mins · CC",
    href: "https://www.oireachtas.ie/en/oireachtas-tv/video-archive/seanad-videos/",
    debate: "https://www.oireachtas.ie/en/debates/debate/seanad/2025-10-15/9/",
    thumb: seanadLeaders,
    status: "Concluded",
  },
  {
    id: "vod-4",
    kind: "VOD",
    forum: "Committee on Health",
    topic: "Health",
    title: "National Children’s Hospital | Quarterly update",
    date: "Thursday, 27 April 2027",
    meta: "2 hr 08 mins · CC",
    href: "#",
    debate: "https://www.oireachtas.ie/en/debates/debate/joint_committee_on_disability_matters/2025-10-15/",
    thumb: financeCommittee,
    status: "Concluded",
  },
  {
    id: "vod-5",
    kind: "VOD",
    forum: "Committee on Justice, Home Affairs and Migration",
    topic: "Justice",
    title: "Policing and Community Safety Bill 2027",
    date: "Thursday, 27 April 2027",
    meta: "1 hr 42 mins · CC",
    href: "https://www.oireachtas.ie/en/oireachtas-tv/video-archive/committees/",
    debate: "https://www.oireachtas.ie/en/debates/debate/joint_committee_on_justice_home_affairs_and_migration/2025-10-14/",
    thumb: committee_meeting,
    status: "Concluded",
  },
  {
    id: "vod-6",
    kind: "VOD",
    forum: "Committee of Public Accounts",
    topic: "Finance",
    title: "Vote 15 - Agriculture",
    date: "Thursday, 27 April 2027",
    meta: "2 hr 47 mins · CC",
    href: "https://www.oireachtas.ie/en/oireachtas-tv/video-archive/committees/",
    debate: "https://www.oireachtas.ie/en/debates/debate/committee_of_public_accounts/2025-10-16/",
    thumb: comm10,
    status: "Concluded",
  },
  {
    id: "vod-7",
    kind: "VOD",
    forum: "Dáil Éireann",
    topic: "Questions to the Taoiseach",
    title: "Questions to the Taoiseach",
    date: "Thursday, 27 April 2027",
    meta: "48 mins · ISL · CC",
    href: "https://www.oireachtas.ie/en/oireachtas-tv/video-archive/dail-videos/",
    debate: "https://www.oireachtas.ie/en/debates/debate/dail/2025-10-16/34/",
    thumb: dail2,
    status: "Concluded",
  },
  {
    id: "vod-8",
    kind: "VOD",
    forum: "Seanad Éireann",
    topic: "Commencement Matters",
    title: "Commencement Matters",
    date: "Thursday, 27 April 2027",
    meta: "32 mins · CC",
    href: "https://www.oireachtas.ie/en/oireachtas-tv/video-archive/seanad-videos/",
    debate: "https://www.oireachtas.ie/en/debates/debate/dail/2025-10-16/34/",
    thumb: sean15,
    status: "Concluded",
  },
  {
    id: "vod-9",
    kind: "VOD",
    forum: "Committee on Foreign Affairs and Trade",
    topic: "Conflict in the Middle East",
    title: "Conflict in the Middle East",
    date: "Thursday, 27 April 2027",
    meta: "1 hr 57 mins · CC",
    href: "https://www.oireachtas.ie/en/oireachtas-tv/video-archive/committees/",
    debate: "https://www.oireachtas.ie/en/debates/debate/joint_committee_on_foreign_affairs_and_trade/2025-10-14/",
    thumb: comm2,
    status: "Concluded",
  },
  {
    id: "vod-10",
    kind: "VOD",
    forum: "Dáil Éireann",
    topic: "Private Members' Business",
    title: "Private Members' Business",
    date: "Wednesday, 26 April 2027",
    meta: "2 hr 8 mins · ISL · CC",
    href: "https://www.oireachtas.ie/en/oireachtas-tv/video-archive/dail-videos/",
    debate: "https://www.oireachtas.ie/en/debates/debate/dail/2025-10-16/34/",
    thumb: dail8,
    status: "Concluded",
  },
  {
    id: "vod-11",
    kind: "VOD",
    forum: "Seanad Éireann",
    topic: "Private Members' Business",
    title: "Private Members' Business",
    date: "Wednesday, 26 April 2027",
    meta: "1 hr 42 mins · CC",
    href: "https://www.oireachtas.ie/en/oireachtas-tv/video-archive/seanad-videos/",
    debate: "https://www.oireachtas.ie/en/debates/debate/dail/2025-10-16/34/",
    thumb: sean4,
    status: "Concluded",
  },
  {
    id: "vod-12",
    kind: "VOD",
    forum: "Dáil Éireann",
    topic: "Statements on Housing",
    title: "Statements on Housing",
    date: "Wednesday, 26 April 2027",
    meta: "2 hr 12 mins · CC",
    href: "https://www.oireachtas.ie/en/oireachtas-tv/video-archive/dail-videos/",
    debate: "https://www.oireachtas.ie/en/debates/debate/dail/2025-10-16/34/",
    thumb: dail6,
    status: "Concluded",
  },
  {
    id: "vod-13",
    kind: "VOD",
    forum: "Seanad Éireann",
    topic: "Housing (Miscellaneous) Bill 2027",
    title: "Housing (Miscellaneous) Bill 2027",
    date: "Wednesday, 27 April 2027",
    meta: "4 hr 17 mins · CC",
    href: "https://www.oireachtas.ie/en/oireachtas-tv/video-archive/seanad-videos/",
    debate: "https://www.oireachtas.ie/en/debates/debate/dail/2025-10-16/34/",
    thumb: sean5,
    status: "Concluded",
  },
  {
    id: "vod-14",
    kind: "VOD",
    forum: "Committee on Education and Youth",
    topic: "Funding for DEIS schools",
    title: "Funding for DEIS schools",
    date: "Wednesday, 26 April 2027",
    meta: "1 hr 58 mins · CC",
    href: "https://www.oireachtas.ie/en/oireachtas-tv/video-archive/committees/",
    debate: "https://www.oireachtas.ie/en/debates/debate/joint_committee_on_foreign_affairs_and_trade/2025-10-14/",
    thumb: comm3,
    status: "Concluded",
  },
  {
    id: "vod-15",
    kind: "VOD",
    forum: "Dáil Éireann",
    topic: "Topical Issues",
    title: "Topical Issues",
    date: "Wednesday, 26 April 2027",
    meta: "37 mins · CC",
    href: "https://www.oireachtas.ie/en/oireachtas-tv/video-archive/dail-videos/",
    debate: "https://www.oireachtas.ie/en/debates/debate/dail/2025-10-16/34/",
    thumb: dail7,
    status: "Concluded",
  },
  {
    id: "vod-16",
    kind: "VOD",
    forum: "Dáil Éireann",
    topic: "Message to Seanad",
    title: "Message to Seanad",
    date: "Wednesday, 26 April 2027",
    meta: "1 min · CC",
    href: "https://www.oireachtas.ie/en/oireachtas-tv/video-archive/dail-videos/",
    debate: "https://www.oireachtas.ie/en/debates/debate/dail/2025-10-16/34/",
    thumb: dail5,
    status: "Concluded",
  },
  {
    id: "vod-17",
    kind: "VOD",
    forum: "Seanad Éireann",
    topic: "Social Justice Bill 2027",
    title: "Social Justice Bill 2027",
    date: "Wednesday, 26 April 2027",
    meta: "42 mins · ISL · CC",
    href: "https://www.oireachtas.ie/en/oireachtas-tv/video-archive/seanad-videos/",
    debate: "https://www.oireachtas.ie/en/debates/debate/dail/2025-10-16/34/",
    thumb: sean6,
    status: "Concluded",
  },
  {
    id: "vod-18",
    kind: "VOD",
    forum: "Dáil Éireann",
    topic: "Questions to the Minister for Finance",
    title: "Questions to the Minister for Finance",
    date: "Wednesday, 26 April 2027",
    meta: "1 hr 32 mins · ISL · CC",
    href: "https://www.oireachtas.ie/en/oireachtas-tv/video-archive/dail-videos/",
    debate: "https://www.oireachtas.ie/en/debates/debate/dail/2025-10-16/34/",
    thumb: dail9,
    status: "Concluded",
  },
  {
    id: "vod-19",
    kind: "VOD",
    forum: "Committee on Defence and National Security",
    topic: "UNIFIL missions in the Middle East",
    title: "UNIFIL missions in the Middle East",
    date: "Wednesday, 26 April 2027",
    meta: "2hr 17 mins · CC",
    href: "https://www.oireachtas.ie/en/oireachtas-tv/video-archive/committees/",
    debate: "https://www.oireachtas.ie/en/debates/debate/joint_committee_on_foreign_affairs_and_trade/2025-10-14/",
    thumb: comm4,
    status: "Concluded",
  },
  {
    id: "vod-20",
    kind: "VOD",
    forum: "Committee on Disability Matters",
    topic: "Special school funding",
    title: "Special school funding",
    date: "Wednesday, 26 April 2027",
    meta: "1 hr 58 mins · ISL · CC",
    href: "https://www.oireachtas.ie/en/oireachtas-tv/video-archive/committees/",
    debate: "https://www.oireachtas.ie/en/debates/debate/joint_committee_on_foreign_affairs_and_trade/2025-10-14/",
    thumb: comm5,
    status: "Concluded",
  },
  {
    id: "vod-21",
    kind: "VOD",
    forum: "Seanad Éireann",
    topic: "Media Regulation Bill 2026",
    title: "Media Regulation Bill 2026",
    date: "Wednesday, 26 April 2027",
    meta: "3 hr 48 mins · CC",
    href: "https://www.oireachtas.ie/en/oireachtas-tv/video-archive/seanad-videos/",
    debate: "https://www.oireachtas.ie/en/debates/debate/dail/2025-10-16/34/",
    thumb: sean8,
    status: "Concluded",
  },
  {
    id: "vod-22",
    kind: "VOD",
    forum: "Seanad Éireann",
    topic: "Order of Business",
    title: "Order of Business",
    date: "Wednesday, 26 April 2027",
    meta: "58 mins · ISL · CC",
    href: "https://www.oireachtas.ie/en/oireachtas-tv/video-archive/seanad-videos/",
    debate: "https://www.oireachtas.ie/en/debates/debate/dail/2025-10-16/34/",
    thumb: sean9,
    status: "Concluded",
  },
  {
    id: "vod-23",
    kind: "VOD",
    forum: "Dáil Éireann",
    topic: "Leaders' Questions",
    title: "Leaders' Questions",
    date: "Wednesday, 26 April 2027",
    meta: "52 mins · ISL · CC",
    href: "https://www.oireachtas.ie/en/oireachtas-tv/video-archive/dail-videos/",
    debate: "https://www.oireachtas.ie/en/debates/debate/dail/2025-10-16/34/",
    thumb: dail10,
    status: "Concluded",
  },
  {
    id: "vod-24",
    kind: "VOD",
    forum: "Committee on Climate, Environment and Energy",
    topic: "Carbon emission budgets 2028-2033",
    title: "Carbon emission budgets 2028-2033",
    date: "Wednesday, 26 April 2027",
    meta: "1 hr 38 mins · CC",
    href: "https://www.oireachtas.ie/en/oireachtas-tv/video-archive/committees/",
    debate: "https://www.oireachtas.ie/en/debates/debate/joint_committee_on_foreign_affairs_and_trade/2025-10-14/",
    thumb: comm6,
    status: "Concluded",
  },

  // ------ Six new "On now" test placeholders (Live/Public) ------
  {
    id: "vod-test-1",
    kind: "VOD",
    forum: "Dáil Éireann",
    topic: "Questions on Policy or Legislation",
    title: "Questions on Policy or Legislation",
    date: "Today",
    meta: "ISL · CC",
    href: "#",
    thumb: leadersQuestions,
    status: "Live",
  },
  {
    id: "vod-test-2",
    kind: "VOD",
    forum: "Seanad Éireann",
    topic: "Motion re arts sector",
    title: "Motion re arts sector",
    date: "Today",
    meta: "CC",
    href: "#",
    thumb: sean13,
    status: "Vótáil",
  },
  {
    id: "vod-test-3",
    kind: "VOD",
    forum: "Committee on Enterprise, Tourism and Employment",
    topic: "Tax treatment of small businesses",
    title: "Tax treatment of small businesses",
    date: "Today",
    meta: "Committee Room 1 · CC",
    href: "#",
    thumb: comm1,
    status: "In public session",
  },
  {
    id: "vod-test-4",
    kind: "VOD",
    forum: "Committee on Education and Youth",
    topic: "Grants for youth groups",
    title: "Grants for youth groups",
    date: "Today",
    meta: "Committee Room 2 · CC",
    href: "#",
    thumb: comm7,
    status: "In public session",
  },
  {
    id: "vod-test-5",
    kind: "VOD",
    forum: "Committee on Climate, Environment and Energy",
    topic: "Meeting the obligations of the Paris Agreement",
    title: "Meeting the obligations of the Paris Agreement",
    date: "Today",
    meta: "Committee Room 3 · CC",
    href: "#",
    thumb: comm8,
    status: "In public session",
  },
  {
    id: "vod-test-6",
    kind: "VOD",
    forum: "Committee on Health",
    topic: "Vaccination programmes for school children",
    title: "Vaccination programmes for school children",
    date: "Today",
    meta: "Committee Room 4 · CC",
    href: "#",
    thumb: comm9,
    status: "In public session",
  },
];

// ✳️ Simple filtered subsets for tabs
export const vodDail = vodAll.filter((v) => v.forum === "Dáil Éireann");
export const vodSeanad = vodAll.filter((v) => v.forum === "Seanad Éireann");
export const vodCommittees = vodAll.filter((v) =>
  (v.forum || "").toLowerCase().includes("committee")
);