import comm1 from "../assets/images/comm1.jpg";
import comm2 from "../assets/images/comm2.jpg";
import comm6 from "../assets/images/comm6.jpg";
import comm7 from "../assets/images/comm7.jpg";
import comm8 from "../assets/images/comm8.jpg";
import comm9 from "../assets/images/comm9.jpg";
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

export type Forum = "Dáil Éireann" | "Seanad Éireann" | "Committees" | string;
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
  status: VodStatus;
  sourcePage?: string;
  hlsUrl?: string;
  mp4Url?: string;
  startTime?: string;
  duration?: string;
};

type Seed = {
  id: string;
  topic: string;
  title: string;
  date: string;
  startTime: string;
  duration: string;
  sourcePage: string;
  debate: string;
  hlsUrl: string;
  mp4Url: string;
};

const dailThumbs = [
  dail1,
  dail2,
  dail3,
  dail4,
  dail5,
  dail6,
  dail7,
  dail8,
  dail9,
  dail10,
  dail11,
  dail12,
  dail13,
];
const seanadThumbs = [
  sean1,
  sean2,
  sean3,
  sean4,
  sean5,
  sean6,
  sean7,
  sean8,
  sean9,
  sean10,
  sean11,
  sean12,
  sean13,
  sean14,
  sean15,
];

function buildRealVod(
  forum: Forum,
  seed: Seed,
  thumb: string,
  accessibilityMeta: string,
): VodItem {
  return {
    id: seed.id,
    kind: "VOD",
    forum,
    topic: seed.topic,
    title: seed.title,
    date: seed.date,
    meta: `${seed.duration} · ${accessibilityMeta}`,
    href: seed.mp4Url,
    debate: seed.debate,
    thumb,
    status: "Concluded",
    sourcePage: seed.sourcePage,
    hlsUrl: seed.hlsUrl,
    mp4Url: seed.mp4Url,
    startTime: seed.startTime,
    duration: seed.duration,
  };
}

const dailSeeds: Seed[] = [
  {
    id: "vod-dail-2026-05-27-topical-issues-0901",
    topic: "Topical Issues",
    title: "Topical Issues",
    date: "Wednesday, 27 May 2026",
    startTime: "09:01",
    duration: "1 hour, 3 minutes",
    sourcePage:
      "https://www.oireachtas.ie/en/oireachtas-tv/video-on-demand/dail/2026-05-27/",
    debate: "https://www.oireachtas.ie/en/debates/debate/dail/2026-05-27/",
    hlsUrl:
      "https://video.oireachtas.ie/dail/34/2026-05-27/topical-issues_0901/hls.m3u8",
    mp4Url:
      "https://video.oireachtas.ie/dail/34/2026-05-27/topical-issues_0901/video.mp4",
  },
  {
    id: "vod-dail-2026-05-27-private-members-business-1004",
    topic: "Private Members' Business",
    title:
      "Private Members' Business (Independent Technical Group): Motion re Fiscal Planning Framework for Economic Certainty",
    date: "Wednesday, 27 May 2026",
    startTime: "10:04",
    duration: "1 hour, 59 minutes",
    sourcePage:
      "https://www.oireachtas.ie/en/oireachtas-tv/video-on-demand/dail/2026-05-27/",
    debate: "https://www.oireachtas.ie/en/debates/debate/dail/2026-05-27/",
    hlsUrl:
      "https://video.oireachtas.ie/dail/34/2026-05-27/private-members-business_1004/hls.m3u8",
    mp4Url:
      "https://video.oireachtas.ie/dail/34/2026-05-27/private-members-business_1004/video.mp4",
  },
  {
    id: "vod-dail-2026-05-27-leaders-questions-1204",
    topic: "Leaders' Questions",
    title:
      "Leaders' Questions (Independent Technical Group, Independent and Parties Technical Group, Labour Party, Sinn Féin)",
    date: "Wednesday, 27 May 2026",
    startTime: "12:04",
    duration: "34 minutes",
    sourcePage:
      "https://www.oireachtas.ie/en/oireachtas-tv/video-on-demand/dail/2026-05-27/",
    debate: "https://www.oireachtas.ie/en/debates/debate/dail/2026-05-27/",
    hlsUrl:
      "https://video.oireachtas.ie/dail/34/2026-05-27/leaders-questions_1204/hls.m3u8",
    mp4Url:
      "https://video.oireachtas.ie/dail/34/2026-05-27/leaders-questions_1204/video.mp4",
  },
  {
    id: "vod-dail-2026-05-27-other-members-questions-1238",
    topic: "Other Members' Questions",
    title: "Other Members’ Questions",
    date: "Wednesday, 27 May 2026",
    startTime: "12:38",
    duration: "9 minutes",
    sourcePage:
      "https://www.oireachtas.ie/en/oireachtas-tv/video-on-demand/dail/2026-05-27/",
    debate: "https://www.oireachtas.ie/en/debates/debate/dail/2026-05-27/",
    hlsUrl:
      "https://video.oireachtas.ie/dail/34/2026-05-27/other-members-questions_1238/hls.m3u8",
    mp4Url:
      "https://video.oireachtas.ie/dail/34/2026-05-27/other-members-questions_1238/video.mp4",
  },
  {
    id: "vod-dail-2026-05-27-questions-policy-legislation-1246",
    topic: "Questions on Policy or Legislation",
    title: "Questions on Policy or Legislation",
    date: "Wednesday, 27 May 2026",
    startTime: "12:46",
    duration: "33 minutes",
    sourcePage:
      "https://www.oireachtas.ie/en/oireachtas-tv/video-on-demand/dail/2026-05-27/",
    debate: "https://www.oireachtas.ie/en/debates/debate/dail/2026-05-27/",
    hlsUrl:
      "https://video.oireachtas.ie/dail/34/2026-05-27/questions-on-policy-or-legislation_1246/hls.m3u8",
    mp4Url:
      "https://video.oireachtas.ie/dail/34/2026-05-27/questions-on-policy-or-legislation_1246/video.mp4",
  },
  {
    id: "vod-dail-2026-05-27-government-business-1421",
    topic: "Government Business",
    title:
      "Government Business: Statements on Ensuring our Skills, Training and Innovation systems keep pace in a changing world",
    date: "Wednesday, 27 May 2026",
    startTime: "14:21",
    duration: "2 hours, 21 minutes",
    sourcePage:
      "https://www.oireachtas.ie/en/oireachtas-tv/video-on-demand/dail/2026-05-27/",
    debate: "https://www.oireachtas.ie/en/debates/debate/dail/2026-05-27/",
    hlsUrl:
      "https://video.oireachtas.ie/dail/34/2026-05-27/government-business_1421/hls.m3u8",
    mp4Url:
      "https://video.oireachtas.ie/dail/34/2026-05-27/government-business_1421/video.mp4",
  },
  {
    id: "vod-dail-2026-05-27-government-business-1643",
    topic: "Government Business",
    title:
      "Government Business: Motion re Extension of Civil Law (Miscellaneous Provisions) Act 2021",
    date: "Wednesday, 27 May 2026",
    startTime: "16:43",
    duration: "48 minutes",
    sourcePage:
      "https://www.oireachtas.ie/en/oireachtas-tv/video-on-demand/dail/2026-05-27/",
    debate: "https://www.oireachtas.ie/en/debates/debate/dail/2026-05-27/",
    hlsUrl:
      "https://video.oireachtas.ie/dail/34/2026-05-27/government-business_1643/hls.m3u8",
    mp4Url:
      "https://video.oireachtas.ie/dail/34/2026-05-27/government-business_1643/video.mp4",
  },
  {
    id: "vod-dail-2026-05-27-government-business-1731",
    topic: "Government Business",
    title:
      "Government Business: Gas Safety (Amendment) Bill 2026 — Motion to Instruct the Committee",
    date: "Wednesday, 27 May 2026",
    startTime: "17:31",
    duration: "24 minutes",
    sourcePage:
      "https://www.oireachtas.ie/en/oireachtas-tv/video-on-demand/dail/2026-05-27/",
    debate: "https://www.oireachtas.ie/en/debates/debate/dail/2026-05-27/",
    hlsUrl:
      "https://video.oireachtas.ie/dail/34/2026-05-27/government-business_1731/hls.m3u8",
    mp4Url:
      "https://video.oireachtas.ie/dail/34/2026-05-27/government-business_1731/video.mp4",
  },
  {
    id: "vod-dail-2026-05-27-business-proposal-1755",
    topic: "Business Proposal",
    title: "Business Proposal",
    date: "Wednesday, 27 May 2026",
    startTime: "17:55",
    duration: "1 minute",
    sourcePage:
      "https://www.oireachtas.ie/en/oireachtas-tv/video-on-demand/dail/2026-05-27/",
    debate: "https://www.oireachtas.ie/en/debates/debate/dail/2026-05-27/",
    hlsUrl:
      "https://video.oireachtas.ie/dail/34/2026-05-27/business-proposal_1755/hls.m3u8",
    mp4Url:
      "https://video.oireachtas.ie/dail/34/2026-05-27/business-proposal_1755/video.mp4",
  },
  {
    id: "vod-dail-2026-05-27-government-business-1756",
    topic: "Government Business",
    title: "Government Business: Gas Safety (Amendment) Bill 2026",
    date: "Wednesday, 27 May 2026",
    startTime: "17:56",
    duration: "10 minutes",
    sourcePage:
      "https://www.oireachtas.ie/en/oireachtas-tv/video-on-demand/dail/2026-05-27/",
    debate: "https://www.oireachtas.ie/en/debates/debate/dail/2026-05-27/",
    hlsUrl:
      "https://video.oireachtas.ie/dail/34/2026-05-27/government-business_1756/hls.m3u8",
    mp4Url:
      "https://video.oireachtas.ie/dail/34/2026-05-27/government-business_1756/video.mp4",
  },
  {
    id: "vod-dail-2026-05-27-government-business-1806",
    topic: "Government Business",
    title: "Government Business: Údarás na Gaeltachta (Amendment) Bill 2024",
    date: "Wednesday, 27 May 2026",
    startTime: "18:06",
    duration: "2 hours, 7 minutes",
    sourcePage:
      "https://www.oireachtas.ie/en/oireachtas-tv/video-on-demand/dail/2026-05-27/",
    debate: "https://www.oireachtas.ie/en/debates/debate/dail/2026-05-27/",
    hlsUrl:
      "https://video.oireachtas.ie/dail/34/2026-05-27/government-business_1806/hls.m3u8",
    mp4Url:
      "https://video.oireachtas.ie/dail/34/2026-05-27/government-business_1806/video.mp4",
  },
  {
    id: "vod-dail-2026-05-27-motions-without-debate-2014",
    topic: "Motion(s) without debate",
    title:
      "Motion(s) without debate: Motion re Report of the Committee on Standing Orders and Dáil Reform in respect of Dáil sittings from 9 to 11 June 2026",
    date: "Wednesday, 27 May 2026",
    startTime: "20:14",
    duration: "1 minute",
    sourcePage:
      "https://www.oireachtas.ie/en/oireachtas-tv/video-on-demand/dail/2026-05-27/",
    debate: "https://www.oireachtas.ie/en/debates/debate/dail/2026-05-27/",
    hlsUrl:
      "https://video.oireachtas.ie/dail/34/2026-05-27/motion-s-without-debate_2014/hls.m3u8",
    mp4Url:
      "https://video.oireachtas.ie/dail/34/2026-05-27/motion-s-without-debate_2014/video.mp4",
  },
  {
    id: "vod-dail-2026-05-27-deferred-divisions-2015",
    topic: "Deferred Divisions",
    title: "Deferred Divisions: Motion re Cost of Disability - Amendment",
    date: "Wednesday, 27 May 2026",
    startTime: "20:15",
    duration: "20 minutes",
    sourcePage:
      "https://www.oireachtas.ie/en/oireachtas-tv/video-on-demand/dail/2026-05-27/",
    debate: "https://www.oireachtas.ie/en/debates/debate/dail/2026-05-27/",
    hlsUrl:
      "https://video.oireachtas.ie/dail/34/2026-05-27/deferred-divisions_2015/hls.m3u8",
    mp4Url:
      "https://video.oireachtas.ie/dail/34/2026-05-27/deferred-divisions_2015/video.mp4",
  },
  {
    id: "vod-dail-2026-05-27-deferred-divisions-2035",
    topic: "Deferred Divisions",
    title:
      "Deferred Divisions: Motion re Fiscal Planning Framework for Economic Certainty - Amendment",
    date: "Wednesday, 27 May 2026",
    startTime: "20:35",
    duration: "11 minutes",
    sourcePage:
      "https://www.oireachtas.ie/en/oireachtas-tv/video-on-demand/dail/2026-05-27/",
    debate: "https://www.oireachtas.ie/en/debates/debate/dail/2026-05-27/",
    hlsUrl:
      "https://video.oireachtas.ie/dail/34/2026-05-27/deferred-divisions_2035/hls.m3u8",
    mp4Url:
      "https://video.oireachtas.ie/dail/34/2026-05-27/deferred-divisions_2035/video.mp4",
  },
  {
    id: "vod-dail-2026-05-28-pq-oral-0849",
    topic: "Parliamentary Questions: Oral",
    title: "Parliamentary Questions: Oral",
    date: "Thursday, 28 May 2026",
    startTime: "08:49",
    duration: "1 hour, 40 minutes",
    sourcePage:
      "https://www.oireachtas.ie/en/oireachtas-tv/video-on-demand/dail/2026-05-28/",
    debate: "https://www.oireachtas.ie/en/debates/debate/dail/2026-05-28/",
    hlsUrl:
      "https://video.oireachtas.ie/dail/34/2026-05-28/p-q-s-oral_0849/hls.m3u8",
    mp4Url:
      "https://video.oireachtas.ie/dail/34/2026-05-28/p-q-s-oral_0849/video.mp4",
  },
  {
    id: "vod-dail-2026-05-28-pq-oral-1030",
    topic: "Parliamentary Questions: Oral",
    title: "Parliamentary Questions: Oral",
    date: "Thursday, 28 May 2026",
    startTime: "10:30",
    duration: "1 hour, 30 minutes",
    sourcePage:
      "https://www.oireachtas.ie/en/oireachtas-tv/video-on-demand/dail/2026-05-28/",
    debate: "https://www.oireachtas.ie/en/debates/debate/dail/2026-05-28/",
    hlsUrl:
      "https://video.oireachtas.ie/dail/34/2026-05-28/p-q-s-oral_1030/hls.m3u8",
    mp4Url:
      "https://video.oireachtas.ie/dail/34/2026-05-28/p-q-s-oral_1030/video.mp4",
  },
  {
    id: "vod-dail-2026-05-28-leaders-questions-1200",
    topic: "Leaders' Questions",
    title:
      "Leaders' Questions (Independent Technical Group, Labour Party, Sinn Féin, Social Democrats)",
    date: "Thursday, 28 May 2026",
    startTime: "12:00",
    duration: "36 minutes",
    sourcePage:
      "https://www.oireachtas.ie/en/oireachtas-tv/video-on-demand/dail/2026-05-28/",
    debate: "https://www.oireachtas.ie/en/debates/debate/dail/2026-05-28/",
    hlsUrl:
      "https://video.oireachtas.ie/dail/34/2026-05-28/leaders-questions_1200/hls.m3u8",
    mp4Url:
      "https://video.oireachtas.ie/dail/34/2026-05-28/leaders-questions_1200/video.mp4",
  },
  {
    id: "vod-dail-2026-05-28-other-members-questions-1237",
    topic: "Other Members' Questions",
    title: "Other Members’ Questions",
    date: "Thursday, 28 May 2026",
    startTime: "12:37",
    duration: "9 minutes",
    sourcePage:
      "https://www.oireachtas.ie/en/oireachtas-tv/video-on-demand/dail/2026-05-28/",
    debate: "https://www.oireachtas.ie/en/debates/debate/dail/2026-05-28/",
    hlsUrl:
      "https://video.oireachtas.ie/dail/34/2026-05-28/other-members-questions_1237/hls.m3u8",
    mp4Url:
      "https://video.oireachtas.ie/dail/34/2026-05-28/other-members-questions_1237/video.mp4",
  },
  {
    id: "vod-dail-2026-05-28-questions-policy-legislation-1246",
    topic: "Questions on Policy or Legislation",
    title: "Questions on Policy or Legislation",
    date: "Thursday, 28 May 2026",
    startTime: "12:46",
    duration: "32 minutes",
    sourcePage:
      "https://www.oireachtas.ie/en/oireachtas-tv/video-on-demand/dail/2026-05-28/",
    debate: "https://www.oireachtas.ie/en/debates/debate/dail/2026-05-28/",
    hlsUrl:
      "https://video.oireachtas.ie/dail/34/2026-05-28/questions-on-policy-or-legislation_1246/hls.m3u8",
    mp4Url:
      "https://video.oireachtas.ie/dail/34/2026-05-28/questions-on-policy-or-legislation_1246/video.mp4",
  },
  {
    id: "vod-dail-2026-05-28-government-business-1358",
    topic: "Government Business",
    title: "Government Business: Broadcasting (Amendment) Bill 2026",
    date: "Thursday, 28 May 2026",
    startTime: "13:58",
    duration: "1 hour, 57 minutes",
    sourcePage:
      "https://www.oireachtas.ie/en/oireachtas-tv/video-on-demand/dail/2026-05-28/",
    debate: "https://www.oireachtas.ie/en/debates/debate/dail/2026-05-28/",
    hlsUrl:
      "https://video.oireachtas.ie/dail/34/2026-05-28/government-business_1358/hls.m3u8",
    mp4Url:
      "https://video.oireachtas.ie/dail/34/2026-05-28/government-business_1358/video.mp4",
  },
  {
    id: "vod-dail-2026-05-28-topical-issues-1556",
    topic: "Topical Issues",
    title: "Topical Issues",
    date: "Thursday, 28 May 2026",
    startTime: "15:56",
    duration: "45 minutes",
    sourcePage:
      "https://www.oireachtas.ie/en/oireachtas-tv/video-on-demand/dail/2026-05-28/",
    debate: "https://www.oireachtas.ie/en/debates/debate/dail/2026-05-28/",
    hlsUrl:
      "https://video.oireachtas.ie/dail/34/2026-05-28/topical-issues_1556/hls.m3u8",
    mp4Url:
      "https://video.oireachtas.ie/dail/34/2026-05-28/topical-issues_1556/video.mp4",
  },
  {
    id: "vod-dail-2026-05-28-private-members-report-1642",
    topic: "Private Members' Business",
    title:
      "Private Members' Bill or Committee Report (alternating weekly): Public Health (Alcohol) (Amendment) Bill 2025",
    date: "Thursday, 28 May 2026",
    startTime: "16:42",
    duration: "55 minutes",
    sourcePage:
      "https://www.oireachtas.ie/en/oireachtas-tv/video-on-demand/dail/2026-05-28/",
    debate: "https://www.oireachtas.ie/en/debates/debate/dail/2026-05-28/",
    hlsUrl:
      "https://video.oireachtas.ie/dail/34/2026-05-28/private-members-bill-or-committee-report-alternating-weekly_1642/hls.m3u8",
    mp4Url:
      "https://video.oireachtas.ie/dail/34/2026-05-28/private-members-bill-or-committee-report-alternating-weekly_1642/video.mp4",
  },
];

const seanadSeeds: Seed[] = [
  {
    id: "vod-seanad-2026-05-26-commencement-matters-1431",
    topic: "Commencement Matters",
    title: "Commencement Matters",
    date: "Tuesday, 26 May 2026",
    startTime: "14:31",
    duration: "31 minutes",
    sourcePage:
      "https://www.oireachtas.ie/en/oireachtas-tv/video-on-demand/seanad/2026-05-26/",
    debate: "https://www.oireachtas.ie/en/debates/debate/seanad/2026-05-26/",
    hlsUrl:
      "https://video.oireachtas.ie/seanad/27/2026-05-26/commencement-matters_1431/hls.m3u8",
    mp4Url:
      "https://video.oireachtas.ie/seanad/27/2026-05-26/commencement-matters_1431/video.mp4",
  },
  {
    id: "vod-seanad-2026-05-26-order-of-business-1533",
    topic: "Order of Business",
    title: "Order of Business",
    date: "Tuesday, 26 May 2026",
    startTime: "15:33",
    duration: "1 hour, 22 minutes",
    sourcePage:
      "https://www.oireachtas.ie/en/oireachtas-tv/video-on-demand/seanad/2026-05-26/",
    debate: "https://www.oireachtas.ie/en/debates/debate/seanad/2026-05-26/",
    hlsUrl:
      "https://video.oireachtas.ie/seanad/27/2026-05-26/order-of-business_1533/hls.m3u8",
    mp4Url:
      "https://video.oireachtas.ie/seanad/27/2026-05-26/order-of-business_1533/video.mp4",
  },
  {
    id: "vod-seanad-2026-05-26-government-business-1704",
    topic: "Government Business",
    title:
      "Government Business: Statements on Student Accommodation and Supports",
    date: "Tuesday, 26 May 2026",
    startTime: "17:04",
    duration: "1 hour, 16 minutes",
    sourcePage:
      "https://www.oireachtas.ie/en/oireachtas-tv/video-on-demand/seanad/2026-05-26/",
    debate: "https://www.oireachtas.ie/en/debates/debate/seanad/2026-05-26/",
    hlsUrl:
      "https://video.oireachtas.ie/seanad/27/2026-05-26/government-business_1704/hls.m3u8",
    mp4Url:
      "https://video.oireachtas.ie/seanad/27/2026-05-26/government-business_1704/video.mp4",
  },
  {
    id: "vod-seanad-2026-05-26-government-business-1821",
    topic: "Government Business",
    title:
      "Government Business: International Co-operation (Omagh Bombing Inquiry) Bill 2026 - Report and Final Stages",
    date: "Tuesday, 26 May 2026",
    startTime: "18:21",
    duration: "4 minutes",
    sourcePage:
      "https://www.oireachtas.ie/en/oireachtas-tv/video-on-demand/seanad/2026-05-26/",
    debate: "https://www.oireachtas.ie/en/debates/debate/seanad/2026-05-26/",
    hlsUrl:
      "https://video.oireachtas.ie/seanad/27/2026-05-26/government-business_1821/hls.m3u8",
    mp4Url:
      "https://video.oireachtas.ie/seanad/27/2026-05-26/government-business_1821/video.mp4",
  },
  {
    id: "vod-seanad-2026-05-26-government-business-1825",
    topic: "Government Business",
    title:
      "Government Business: Garda Síochána (Powers) Bill 2026 - Committee Stage (resumed)",
    date: "Tuesday, 26 May 2026",
    startTime: "18:25",
    duration: "2 hours, 35 minutes",
    sourcePage:
      "https://www.oireachtas.ie/en/oireachtas-tv/video-on-demand/seanad/2026-05-26/",
    debate: "https://www.oireachtas.ie/en/debates/debate/seanad/2026-05-26/",
    hlsUrl:
      "https://video.oireachtas.ie/seanad/27/2026-05-26/government-business_1825/hls.m3u8",
    mp4Url:
      "https://video.oireachtas.ie/seanad/27/2026-05-26/government-business_1825/video.mp4",
  },
  {
    id: "vod-seanad-2026-05-27-commencement-matters-1030",
    topic: "Commencement Matters",
    title: "Commencement Matters",
    date: "Wednesday, 27 May 2026",
    startTime: "10:30",
    duration: "50 minutes",
    sourcePage:
      "https://www.oireachtas.ie/en/oireachtas-tv/video-on-demand/seanad/2026-05-27/",
    debate: "https://www.oireachtas.ie/en/debates/debate/seanad/2026-05-27/",
    hlsUrl:
      "https://video.oireachtas.ie/seanad/27/2026-05-27/commencement-matters_1030/hls.m3u8",
    mp4Url:
      "https://video.oireachtas.ie/seanad/27/2026-05-27/commencement-matters_1030/video.mp4",
  },
  {
    id: "vod-seanad-2026-05-27-order-of-business-1133",
    topic: "Order of Business",
    title: "Order of Business",
    date: "Wednesday, 27 May 2026",
    startTime: "11:33",
    duration: "1 hour, 15 minutes",
    sourcePage:
      "https://www.oireachtas.ie/en/oireachtas-tv/video-on-demand/seanad/2026-05-27/",
    debate: "https://www.oireachtas.ie/en/debates/debate/seanad/2026-05-27/",
    hlsUrl:
      "https://video.oireachtas.ie/seanad/27/2026-05-27/order-of-business_1133/hls.m3u8",
    mp4Url:
      "https://video.oireachtas.ie/seanad/27/2026-05-27/order-of-business_1133/video.mp4",
  },
  {
    id: "vod-seanad-2026-05-27-motions-without-debate-1247",
    topic: "Motion(s) without debate",
    title:
      "Motion(s) without debate: Motion regarding the appointment of Ordinary Members of An Coimisiún Toghcháin",
    date: "Wednesday, 27 May 2026",
    startTime: "12:47",
    duration: "1 minute",
    sourcePage:
      "https://www.oireachtas.ie/en/oireachtas-tv/video-on-demand/seanad/2026-05-27/",
    debate: "https://www.oireachtas.ie/en/debates/debate/seanad/2026-05-27/",
    hlsUrl:
      "https://video.oireachtas.ie/seanad/27/2026-05-27/motion-s-without-debate_1247/hls.m3u8",
    mp4Url:
      "https://video.oireachtas.ie/seanad/27/2026-05-27/motion-s-without-debate_1247/video.mp4",
  },
  {
    id: "vod-seanad-2026-05-27-special-address-1409",
    topic: "Special Address",
    title: "Special Address",
    date: "Wednesday, 27 May 2026",
    startTime: "14:09",
    duration: "2 hours, 50 minutes",
    sourcePage:
      "https://www.oireachtas.ie/en/oireachtas-tv/video-on-demand/seanad/2026-05-27/",
    debate: "https://www.oireachtas.ie/en/debates/debate/seanad/2026-05-27/",
    hlsUrl:
      "https://video.oireachtas.ie/seanad/27/2026-05-27/special-address_1409/hls.m3u8",
    mp4Url:
      "https://video.oireachtas.ie/seanad/27/2026-05-27/special-address_1409/video.mp4",
  },
  {
    id: "vod-seanad-2026-05-27-government-business-1701",
    topic: "Government Business",
    title:
      "Government Business: Garda Síochána (Recording Devices) (Amendment) Bill 2025 - Second Stage",
    date: "Wednesday, 27 May 2026",
    startTime: "17:01",
    duration: "48 minutes",
    sourcePage:
      "https://www.oireachtas.ie/en/oireachtas-tv/video-on-demand/seanad/2026-05-27/",
    debate: "https://www.oireachtas.ie/en/debates/debate/seanad/2026-05-27/",
    hlsUrl:
      "https://video.oireachtas.ie/seanad/27/2026-05-27/government-business_1701/hls.m3u8",
    mp4Url:
      "https://video.oireachtas.ie/seanad/27/2026-05-27/government-business_1701/video.mp4",
  },
  {
    id: "vod-seanad-2026-05-27-private-members-business-1836",
    topic: "Private Members' Business",
    title: "Private Members’ Business: Motion regarding Rents",
    date: "Wednesday, 27 May 2026",
    startTime: "18:36",
    duration: "1 hour, 13 minutes",
    sourcePage:
      "https://www.oireachtas.ie/en/oireachtas-tv/video-on-demand/seanad/2026-05-27/",
    debate: "https://www.oireachtas.ie/en/debates/debate/seanad/2026-05-27/",
    hlsUrl:
      "https://video.oireachtas.ie/seanad/27/2026-05-27/private-members-business_1836/hls.m3u8",
    mp4Url:
      "https://video.oireachtas.ie/seanad/27/2026-05-27/private-members-business_1836/video.mp4",
  },
  {
    id: "vod-seanad-2026-05-28-commencement-matters-0931",
    topic: "Commencement Matters",
    title: "Commencement Matters",
    date: "Thursday, 28 May 2026",
    startTime: "09:31",
    duration: "44 minutes",
    sourcePage:
      "https://www.oireachtas.ie/en/oireachtas-tv/video-on-demand/seanad/2026-05-28/",
    debate: "https://www.oireachtas.ie/en/debates/debate/seanad/2026-05-28/",
    hlsUrl:
      "https://video.oireachtas.ie/seanad/27/2026-05-28/commencement-matters_0931/hls.m3u8",
    mp4Url:
      "https://video.oireachtas.ie/seanad/27/2026-05-28/commencement-matters_0931/video.mp4",
  },
  {
    id: "vod-seanad-2026-05-28-order-of-business-1032",
    topic: "Order of Business",
    title: "Order of Business",
    date: "Thursday, 28 May 2026",
    startTime: "10:32",
    duration: "59 minutes",
    sourcePage:
      "https://www.oireachtas.ie/en/oireachtas-tv/video-on-demand/seanad/2026-05-28/",
    debate: "https://www.oireachtas.ie/en/debates/debate/seanad/2026-05-28/",
    hlsUrl:
      "https://video.oireachtas.ie/seanad/27/2026-05-28/order-of-business_1032/hls.m3u8",
    mp4Url:
      "https://video.oireachtas.ie/seanad/27/2026-05-28/order-of-business_1032/video.mp4",
  },
  {
    id: "vod-seanad-2026-05-28-government-business-1133",
    topic: "Government Business",
    title:
      "Government Business: Arbitration (Amendment) Bill 2025 - Committee Stage (resumed)",
    date: "Thursday, 28 May 2026",
    startTime: "11:33",
    duration: "3 hours, 12 minutes",
    sourcePage:
      "https://www.oireachtas.ie/en/oireachtas-tv/video-on-demand/seanad/2026-05-28/",
    debate: "https://www.oireachtas.ie/en/debates/debate/seanad/2026-05-28/",
    hlsUrl:
      "https://video.oireachtas.ie/seanad/27/2026-05-28/government-business_1133/hls.m3u8",
    mp4Url:
      "https://video.oireachtas.ie/seanad/27/2026-05-28/government-business_1133/video.mp4",
  },
  {
    id: "vod-seanad-2026-05-28-private-members-business-1508",
    topic: "Private Members' Business",
    title:
      "Private Members’ Business: Motion regarding the EU - Israel Association Agreement",
    date: "Thursday, 28 May 2026",
    startTime: "15:08",
    duration: "1 hour, 51 minutes",
    sourcePage:
      "https://www.oireachtas.ie/en/oireachtas-tv/video-on-demand/seanad/2026-05-28/",
    debate: "https://www.oireachtas.ie/en/debates/debate/seanad/2026-05-28/",
    hlsUrl:
      "https://video.oireachtas.ie/seanad/27/2026-05-28/private-members-business_1508/hls.m3u8",
    mp4Url:
      "https://video.oireachtas.ie/seanad/27/2026-05-28/private-members-business_1508/video.mp4",
  },
];

const realDailVod = dailSeeds.map((seed, index) =>
  buildRealVod(
    "Dáil Éireann",
    seed,
    dailThumbs[index % dailThumbs.length],
    "ISL · CC",
  ),
);
const realSeanadVod = seanadSeeds.map((seed, index) =>
  buildRealVod(
    "Seanad Éireann",
    seed,
    seanadThumbs[index % seanadThumbs.length],
    "CC",
  ),
);

const committeeVod: VodItem[] = [
  {
    id: "vod-committee-2026-05-28-public-accounts",
    kind: "VOD",
    forum: "Committee of Public Accounts",
    topic:
      "Competition and Consumer Protection Commission - Financial Statements 2024",
    title: "Committee of Public Accounts",
    date: "Thursday, 28 May 2026",
    meta: "3 hours, 57 minutes · CC",
    href: "https://video.oireachtas.ie/committees/34/236/2026-05-28/11504/committee-of-public-accounts_0931/video.mp4",
    debate:
      "https://www.oireachtas.ie/en/debates/debate/committee_of_public_accounts/2026-05-28/",
    thumb: comm1,
    status: "Concluded",
    sourcePage:
      "https://www.oireachtas.ie/en/oireachtas-tv/video-on-demand/committee-of-public-accounts/2026-05-28/",
    hlsUrl:
      "https://video.oireachtas.ie/committees/34/236/2026-05-28/11504/committee-of-public-accounts_0931/hls.m3u8",
    mp4Url:
      "https://video.oireachtas.ie/committees/34/236/2026-05-28/11504/committee-of-public-accounts_0931/video.mp4",
    startTime: "09:31",
    duration: "3 hours, 57 minutes",
  },
  {
    id: "vod-committee-2026-05-28-children-equality",
    kind: "VOD",
    forum: "Joint Committee on Children and Equality",
    topic:
      "Strategic Priorities Identified by the Chairpersons of the Boards of Tusla and the Adoption Authority of Ireland: Discussion",
    title: "Joint Committee on Children and Equality",
    date: "Thursday, 28 May 2026",
    meta: "2 hours, 22 minutes · CC",
    href: "https://video.oireachtas.ie/committees/34/268/2026-05-28/11740/joint-committee-on-children-and-equality_0932/video.mp4",
    debate:
      "https://www.oireachtas.ie/en/debates/debate/joint_committee_on_children_and_equality/2026-05-28/",
    thumb: comm2,
    status: "Concluded",
    sourcePage:
      "https://www.oireachtas.ie/en/oireachtas-tv/video-on-demand/joint-committee-on-children-and-equality/2026-05-28/",
    hlsUrl:
      "https://video.oireachtas.ie/committees/34/268/2026-05-28/11740/joint-committee-on-children-and-equality_0932/hls.m3u8",
    mp4Url:
      "https://video.oireachtas.ie/committees/34/268/2026-05-28/11740/joint-committee-on-children-and-equality_0932/video.mp4",
    startTime: "09:32",
    duration: "2 hours, 22 minutes",
  },
  {
    id: "vod-committee-2026-05-27-disability-matters",
    kind: "VOD",
    forum: "Joint Committee on Disability Matters",
    topic:
      "Access to Employment for Persons with Disabilities: Discussion (Resumed)",
    title: "Joint Committee on Disability Matters",
    date: "Wednesday, 27 May 2026",
    meta: "60 minutes · CC",
    href: "https://video.oireachtas.ie/committees/34/274/2026-05-27/11694/joint-committee-on-disability-matters_0935/video.mp4",
    debate:
      "https://www.oireachtas.ie/en/debates/debate/joint_committee_on_disability_matters/2026-05-27/",
    thumb: comm6,
    status: "Concluded",
    sourcePage:
      "https://www.oireachtas.ie/en/oireachtas-tv/video-on-demand/joint-committee-on-disability-matters/2026-05-27/",
    hlsUrl:
      "https://video.oireachtas.ie/committees/34/274/2026-05-27/11694/joint-committee-on-disability-matters_0935/hls.m3u8",
    mp4Url:
      "https://video.oireachtas.ie/committees/34/274/2026-05-27/11694/joint-committee-on-disability-matters_0935/video.mp4",
    startTime: "09:35",
    duration: "60 minutes",
  },
  {
    id: "vod-committee-2026-05-27-social-protection",
    kind: "VOD",
    forum:
      "Joint Committee on Social Protection, Rural and Community Development",
    topic:
      "General Scheme of the Social Welfare and Other Matters Bill 2026: Discussion (Resumed)",
    title:
      "Joint Committee on Social Protection, Rural and Community Development",
    date: "Wednesday, 27 May 2026",
    meta: "1 hour, 31 minutes · CC",
    href: "https://video.oireachtas.ie/committees/34/307/2026-05-27/11273/joint-committee-on-social-protection-rural-and-community-development_0932/video.mp4",
    debate:
      "https://www.oireachtas.ie/en/debates/debate/joint_committee_on_social_protection_rural_and_community_development/2026-05-27/",
    thumb: comm7,
    status: "Concluded",
    sourcePage:
      "https://www.oireachtas.ie/en/oireachtas-tv/video-on-demand/joint-committee-on-social-protection-rural-and-community-development/2026-05-27/",
    hlsUrl:
      "https://video.oireachtas.ie/committees/34/307/2026-05-27/11273/joint-committee-on-social-protection-rural-and-community-development_0932/hls.m3u8",
    mp4Url:
      "https://video.oireachtas.ie/committees/34/307/2026-05-27/11273/joint-committee-on-social-protection-rural-and-community-development_0932/video.mp4",
    startTime: "09:32",
    duration: "1 hour, 31 minutes",
  },
  {
    id: "vod-committee-2026-05-27-arts-select",
    kind: "VOD",
    forum: "Select Committee on Arts, Media, Communications, Culture and Sport",
    topic:
      "Update on Departmental Priorities and Legislation: Department of Culture, Communications and Sport",
    title: "Select Committee on Arts, Media, Communications, Culture and Sport",
    date: "Wednesday, 27 May 2026",
    meta: "5 minutes · CC",
    href: "https://video.oireachtas.ie/committees/34/263/2026-05-27/11777/select-committee-on-arts-media-communications-culture-and-sport_1204/video.mp4",
    debate:
      "https://www.oireachtas.ie/en/debates/debate/select_committee_on_arts_media_communications_culture_and_sport/2026-05-27/",
    thumb: comm8,
    status: "Concluded",
    sourcePage:
      "https://www.oireachtas.ie/en/oireachtas-tv/video-on-demand/select-committee-on-arts-media-communications-culture-and-sport/2026-05-27/",
    hlsUrl:
      "https://video.oireachtas.ie/committees/34/263/2026-05-27/11777/select-committee-on-arts-media-communications-culture-and-sport_1204/hls.m3u8",
    mp4Url:
      "https://video.oireachtas.ie/committees/34/263/2026-05-27/11777/select-committee-on-arts-media-communications-culture-and-sport_1204/video.mp4",
    startTime: "12:04",
    duration: "5 minutes",
  },
  {
    id: "vod-committee-2026-05-27-transport",
    kind: "VOD",
    forum: "Joint Committee on Transport",
    topic:
      "The Remit of Transport Infrastructure Ireland: Transport Infrastructure Ireland",
    title: "Joint Committee on Transport",
    date: "Wednesday, 27 May 2026",
    meta: "2 hours, 26 minutes · CC",
    href: "https://video.oireachtas.ie/committees/34/310/2026-05-27/11738/joint-committee-on-transport_0932/video.mp4",
    debate:
      "https://www.oireachtas.ie/en/debates/debate/joint_committee_on_transport/2026-05-27/",
    thumb: comm9,
    status: "Concluded",
    sourcePage:
      "https://www.oireachtas.ie/en/oireachtas-tv/video-on-demand/joint-committee-on-transport/2026-05-27/",
    hlsUrl:
      "https://video.oireachtas.ie/committees/34/310/2026-05-27/11738/joint-committee-on-transport_0932/hls.m3u8",
    mp4Url:
      "https://video.oireachtas.ie/committees/34/310/2026-05-27/11738/joint-committee-on-transport_0932/video.mp4",
    startTime: "09:32",
    duration: "2 hours, 26 minutes",
  },
  {
    id: "vod-committee-2026-05-27-health",
    kind: "VOD",
    forum: "Joint Committee on Health",
    topic: "National Maternity Strategy 2016-2026",
    title: "Joint Committee on Health",
    date: "Wednesday, 27 May 2026",
    meta: "2 hours, 23 minutes · CC",
    href: "https://video.oireachtas.ie/committees/34/298/2026-05-27/11585/joint-committee-on-health_0934/video.mp4",
    debate:
      "https://www.oireachtas.ie/en/debates/debate/joint_committee_on_health/2026-05-27/",
    thumb: comm2,
    status: "Concluded",
    sourcePage:
      "https://www.oireachtas.ie/en/oireachtas-tv/video-on-demand/joint-committee-on-health/2026-05-27/",
    hlsUrl:
      "https://video.oireachtas.ie/committees/34/298/2026-05-27/11585/joint-committee-on-health_0934/hls.m3u8",
    mp4Url:
      "https://video.oireachtas.ie/committees/34/298/2026-05-27/11585/joint-committee-on-health_0934/video.mp4",
    startTime: "09:34",
    duration: "2 hours, 23 minutes",
  },
];

const liveHouseVod: VodItem[] = [
  {
    id: "vod-live-dail",
    kind: "VOD",
    forum: "Dáil Éireann",
    topic: "Questions on Policy or Legislation",
    title: "Questions on Policy or Legislation",
    date: "Today",
    meta: "ISL · CC",
    href: "https://www.oireachtas.ie/en/oireachtas-tv/dail-eireann-live/",
    thumb: dail5,
    status: "Live",
  },
  {
    id: "vod-live-seanad",
    kind: "VOD",
    forum: "Seanad Éireann",
    topic: "Motion regarding the arts sector",
    title: "Motion regarding the arts sector",
    date: "Today",
    meta: "CC",
    href: "https://www.oireachtas.ie/en/oireachtas-tv/seanad-eireann-live/",
    thumb: sean13,
    status: "Vótáil",
  },
];

export const vodAll: VodItem[] = [
  ...realDailVod,
  ...realSeanadVod,
  ...committeeVod,
  ...liveHouseVod,
];
export const vodDail = vodAll.filter(
  (item) => item.forum === "Dáil Éireann" && item.status === "Concluded",
);
export const vodSeanad = vodAll.filter(
  (item) => item.forum === "Seanad Éireann" && item.status === "Concluded",
);
export const vodCommittees = vodAll.filter(
  (item) =>
    (item.forum || "").toLowerCase().includes("committee") &&
    item.status === "Concluded",
);
