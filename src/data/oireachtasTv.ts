import Geneva from "../assets/carousel/Geneva.jpg";
import Censor from "../assets/carousel/Censor.jpg";
import ATH from "../assets/carousel/ATH.jpg";
import CommitteeMeeting from "../assets/carousel/committee_meeting.jpg";
import FinanceCommittee from "../assets/carousel/finance-committee.jpg";
import LeadersQuestions from "../assets/carousel/leaders-questions.jpg";
import ReportLaunch from "../assets/carousel/report_launch.jpg";
import WideCommittee from "../assets/carousel/wide_committee.jpg";

const publicAsset = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;

export type OireachtasTvItem = {
  id: string;
  title: string;
  series: "Around the Houses" | "In Focus" | "Inside Parliament: Briefing" | "Perspectives" | "Featured";
  meta: string;
  href: string;
  thumb: string;
  previewSrc?: string;
  summary?: string;
  playerUrl?: string;
  companionUrl?: string;
  eyebrow?: string;
};

function getTvPublishedAtValue(item: OireachtasTvItem): number {
  const [datePart] = item.meta.split(" · ");
  const timestamp = Date.parse(datePart.trim());
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

export const tvFeatured: OireachtasTvItem[] = [
  {
    id: "tv-feature-1",
    title: "A Day in May",
    series: "Featured",
    meta: "19 Dec 2025 · CC",
    href: "https://www.oireachtas.ie/en/oireachtas-tv/oireachtas-tv-productions/a-day-in-may/",
    companionUrl: "https://www.oireachtas.ie/en/oireachtas-tv/oireachtas-tv-productions/a-day-in-may/",
    playerUrl: "https://media.heanet.ie/player/6b58ba973bb0466c829d282706155ec0",
    thumb: "https://www.oireachtas.ie/assets/Uploads/Still-from-A-Day-in-May-documentary.png",
    eyebrow: "Oireachtas TV presents",
    summary:
      "In 2015, Ireland became the first country in the world to bring in marriage equality by popular vote but the story did not end with the counting of ballot papers.",
  },
  {
    id: "tv-feature-2",
    title: "In the Opinion of the Censor",
    series: "Featured",
    meta: "25 Jul 2025 · CC",
    href: "https://www.oireachtas.ie/en/oireachtas-tv/oireachtas-tv-productions/in-the-opinion-of-the-censor/",
    companionUrl: "https://www.oireachtas.ie/en/oireachtas-tv/oireachtas-tv-productions/in-the-opinion-of-the-censor/",
    playerUrl: "https://media.heanet.ie/player/5bc14ab9e9bc4ece9d0cd2a2fd04f41b",
    thumb: Censor,
    eyebrow: "Oireachtas TV presents",
    summary:
      "This history of film censorship in Ireland tells a fascinating story of Ireland's evolution from conservative roots through social change.",
  },
  {
    id: "tv-feature-3",
    title: "Election '24",
    series: "Featured",
    meta: "23 Dec 2024 · CC",
    href: "https://www.oireachtas.ie/en/oireachtas-tv/oireachtas-tv-productions/election-24/",
    companionUrl: "https://www.oireachtas.ie/en/oireachtas-tv/oireachtas-tv-productions/election-24/",
    playerUrl: "https://media.heanet.ie/player/865219e99ab04333a0d4d67dd1313b03",
    thumb: "https://www.oireachtas.ie/assets/Uploads/Election-screengrab.jpg",
    eyebrow: "Oireachtas TV presents",
    summary:
      "Share in the story of Election '24, following candidates, the media and voters in Ireland as they prepared to exercise their inviolable right to participate in our democracy.",
  },
  {
    id: "tv-feature-4",
    title: "The Geneva Window: Through a Glass Darkly",
    series: "Featured",
    meta: "25 Mar 2024 · CC",
    href: "https://www.oireachtas.ie/en/oireachtas-tv/oireachtas-tv-productions/geneva-window/",
    companionUrl: "https://www.oireachtas.ie/en/oireachtas-tv/oireachtas-tv-productions/geneva-window/",
    playerUrl: "https://media.heanet.ie/player/1e0278b9e8c54ceb90e6a2feb6a2e092",
    thumb: Geneva,
    eyebrow: "Oireachtas TV presents",
    summary:
      "Harry Clarke's famous Geneva Window was commissioned as a gift to the League of Nations International Labor Building in Geneva.",
  },
];

export const tvCurated: OireachtasTvItem[] = [
  {
    id: "tv-3",
    title: "May 2026",
    series: "Around the Houses",
    meta: "8 Jun 2026 · CC",
    href: "https://media.heanet.ie/player/555f0032ef36446b9b9f1cafdfd56537",
    playerUrl: "https://media.heanet.ie/player/555f0032ef36446b9b9f1cafdfd56537",
    thumb: ATH,
    summary: "Stay up to date with what happens in the Houses with our regularly updated series.",
  },
  {
    id: "tv-4",
    title: "February 2026",
    series: "Around the Houses",
    meta: "9 Mar 2026 · CC",
    href: "https://media.heanet.ie/player/4b52395201804f7cba8d25dd86a6c8cc",
    playerUrl: "https://media.heanet.ie/player/4b52395201804f7cba8d25dd86a6c8cc",
    thumb: LeadersQuestions,
    summary: "Stay up to date with what happens in the Houses with our regularly updated series.",
  },
  {
    id: "tv-5",
    title: "January 2026",
    series: "Around the Houses",
    meta: "9 Feb 2026 · CC",
    href: "https://media.heanet.ie/player/0eccc6d6079a452daeb6b0d52e8b37bc",
    playerUrl: "https://media.heanet.ie/player/0eccc6d6079a452daeb6b0d52e8b37bc",
    thumb: ReportLaunch,
    summary: "Stay up to date with what happens in the Houses with our regularly updated series.",
  },
  {
    id: "tv-15",
    title: "December 2025",
    series: "Around the Houses",
    meta: "8 Feb 2026 · CC",
    href: "https://media.heanet.ie/player/a3bb0c96348847609e00a641f09dbba7",
    playerUrl: "https://media.heanet.ie/player/a3bb0c96348847609e00a641f09dbba7",
    thumb: CommitteeMeeting,
    summary: "Stay up to date with what happens in the Houses with our regularly updated series.",
  },
  {
    id: "tv-16",
    title: "September 2025",
    series: "Around the Houses",
    meta: "13 Oct 2025 · CC",
    href: "https://media.heanet.ie/player/48ce27df7726488394fe7dc25624b3b0",
    playerUrl: "https://media.heanet.ie/player/48ce27df7726488394fe7dc25624b3b0",
    thumb: WideCommittee,
    summary: "Stay up to date with what happens in the Houses with our regularly updated series.",
  },
  {
    id: "tv-17",
    title: "June 2025",
    series: "Around the Houses",
    meta: "9 Jul 2025 · CC",
    href: "https://media.heanet.ie/player/0d431a1b007b417498194b76f861404a",
    playerUrl: "https://media.heanet.ie/player/0d431a1b007b417498194b76f861404a",
    thumb: FinanceCommittee,
    summary: "Stay up to date with what happens in the Houses with our regularly updated series.",
  },
  {
    id: "tv-18",
    title: "May 2026",
    series: "In Focus",
    meta: "25 May 2026 · CC",
    href: "https://media.heanet.ie/player/02f1a4437cc045b9a88dc8bc295cb02b",
    playerUrl: "https://media.heanet.ie/player/02f1a4437cc045b9a88dc8bc295cb02b",
    thumb: publicAsset("/media/oireachtas-tv/in-focus-1.png"),
    summary: "Get the inside track on what matters in Parliament with our regularly updated magazine series.",
  },
  {
    id: "tv-19",
    title: "April 2026",
    series: "In Focus",
    meta: "27 Apr 2026 · CC",
    href: "https://media.heanet.ie/player/d9e5918779f04f6b9d9960496b2ba18f",
    playerUrl: "https://media.heanet.ie/player/d9e5918779f04f6b9d9960496b2ba18f",
    thumb: publicAsset("/media/oireachtas-tv/in-focus-2.png"),
    summary: "Get the inside track on what matters in Parliament with our regularly updated magazine series.",
  },
  {
    id: "tv-20",
    title: "March 2026",
    series: "In Focus",
    meta: "30 Mar 2026 · CC",
    href: "https://media.heanet.ie/player/44b8102c656e4e4593ea715798d721a6",
    playerUrl: "https://media.heanet.ie/player/44b8102c656e4e4593ea715798d721a6",
    thumb: publicAsset("/media/oireachtas-tv/in-focus-3.png"),
    summary: "Get the inside track on what matters in Parliament with our regularly updated magazine series.",
  },
  {
    id: "tv-21",
    title: "February 2026",
    series: "In Focus",
    meta: "24 Feb 2026 · CC",
    href: "https://media.heanet.ie/player/64681e5ada4240628f5b01c1eca02639",
    playerUrl: "https://media.heanet.ie/player/64681e5ada4240628f5b01c1eca02639",
    thumb: publicAsset("/media/oireachtas-tv/in-focus-4.png"),
    summary: "Get the inside track on what matters in Parliament with our regularly updated magazine series.",
  },
  {
    id: "tv-22",
    title: "January 2026",
    series: "In Focus",
    meta: "26 Jan 2026 · CC",
    href: "https://media.heanet.ie/player/b30e3c914f1149b78e704f8eb7af8d59",
    playerUrl: "https://media.heanet.ie/player/b30e3c914f1149b78e704f8eb7af8d59",
    thumb: publicAsset("/media/oireachtas-tv/in-focus-5.png"),
    summary: "Get the inside track on what matters in Parliament with our regularly updated magazine series.",
  },
  {
    id: "tv-23",
    title: "November 2025",
    series: "In Focus",
    meta: "25 Nov 2025 · CC",
    href: "https://media.heanet.ie/player/78ff1c7b740142b5807c7dc5adb322a1",
    playerUrl: "https://media.heanet.ie/player/78ff1c7b740142b5807c7dc5adb322a1",
    thumb: publicAsset("/media/oireachtas-tv/in-focus-6.png"),
    summary: "Get the inside track on what matters in Parliament with our regularly updated magazine series.",
  },
  {
    id: "tv-6",
    title: "This week in Dáil Éireann",
    series: "Inside Parliament: Briefing",
    meta: "2 min · 22 Apr 2026 · CC",
    href: "https://www.oireachtas.ie/en/dail-schedule-display-view/",
    thumb: publicAsset("/media/shorts/posters/this-week-dail-eireann.png"),
    previewSrc: publicAsset("/media/shorts/videos/this-week-dail-eireann.mp4"),
    summary: "A short briefing on the business due before Dáil Éireann in the week ahead.",
  },
  {
    id: "tv-7",
    title: "Turning history's wounds into shared strengths",
    series: "Inside Parliament: Briefing",
    meta: "6 min · 9 May 2026 · CC",
    href: "https://www.oireachtas.ie/en/inter-parliamentary-work/european-union/europe-day//",
    thumb: publicAsset("/media/shorts/posters/europe-day-cathaoirleach.png"),
    previewSrc: publicAsset("/media/shorts/videos/europe-day-cathaoirleach.mp4"),
    summary: "A short Europe Day briefing from the Cathaoirleach.",
  },
  {
    id: "tv-8",
    title: "European unity in a time of uncertainty",
    series: "Inside Parliament: Briefing",
    meta: "6 min · 9 May 2026 · CC",
    href: "https://www.oireachtas.ie/en/inter-parliamentary-work/european-union/europe-day//",
    thumb: publicAsset("/media/shorts/posters/europe-day-ceann-comhairle.png"),
    previewSrc: publicAsset("/media/shorts/videos/europe-day-ceann-comhairle.mp4"),
    summary: "A short Europe Day briefing from the Ceann Comhairle.",
  },
  {
    id: "tv-9",
    title: "Oversight of children in care",
    series: "Inside Parliament: Briefing",
    meta: "4 min · 23 Apr 2026 · CC",
    href: "https://www.oireachtas.ie/en/committees/34/health/",
    thumb: publicAsset("/media/shorts/posters/oversight-of-children-in-care.jpg"),
    previewSrc: publicAsset("/media/shorts/videos/oversight-of-children-in-care.mp4"),
    summary: "A briefing built around the launch of a committee report on children in care.",
  },
  {
    id: "tv-10",
    title: "Biodiversity around Leinster House",
    series: "Inside Parliament: Briefing",
    meta: "2 min · 24 Apr 2026 · CC",
    href: "https://www.oireachtas.ie/en/how-parliament-works/inside-parliament/parliament-now/biodiversity-around-leinster-house-20260524/",
    thumb: publicAsset("/media/shorts/posters/biodiversity-around-leinster-house.jpg"),
    previewSrc: publicAsset("/media/shorts/videos/biodiversity-around-leinster-house.mp4"),
    summary: "A short look at biodiversity and climate awareness around the Leinster House campus.",
  },
  {
    id: "tv-11",
    title: "Ireland's MEPs in the Seanad",
    series: "Inside Parliament: Briefing",
    meta: "2 min · 26 May 2026 · CC",
    href: "https://www.oireachtas.ie/en/how-parliament-works/inside-parliament/parliament-at-work/ireland-s-meps-in-the-seanad-20260526/",
    thumb: publicAsset("/media/shared/european-parliament.jpg"),
    previewSrc: publicAsset("/media/parliament-at-work/ireland-s-meps-in-the-seanad-20260526/cathaoirleach-meps-mobile-2.mp4"),
    summary: "A short Seanad-focused briefing on its engagement with Ireland's Members of the European Parliament.",
  },
  {
    id: "tv-12",
    title: "European scrutiny in the Seanad",
    series: "Inside Parliament: Briefing",
    meta: "2 min · 22 Apr 2026 · CC",
    href: "https://www.oireachtas.ie/en/how-parliament-works/inside-parliament/parliament-at-work/the-seanad-at-work/",
    thumb: publicAsset("/media/shorts/posters/european-scrutiny-seanad.png"),
    previewSrc: publicAsset("/media/shorts/videos/european-scrutiny-seanad.mp4"),
    summary: "A short explainer on how the Seanad scrutinises European measures and legislation.",
  },
  {
    id: "tv-13",
    title: "How do TDs vote in the Dáil?",
    series: "Inside Parliament: Briefing",
    meta: "2 min · 23 Apr 2026 · CC",
    href: "https://www.oireachtas.ie/en/how-parliament-works/inside-parliament/parliament-explained/how-do-tds-vote-in-the-dail/",
    thumb: publicAsset("/media/shorts/posters/how-tds-vote-in-the-dail.jpg"),
    previewSrc: publicAsset("/media/shorts/videos/how-tds-vote-in-the-dail.mp4"),
    summary: "A short visual explainer showing how TDs vote in Dáil Éireann.",
  },
  {
    id: "tv-24",
    title: "Eamon Ryan",
    series: "Perspectives",
    meta: "25 Nov 2025 · CC",
    href: "https://media.heanet.ie/player/8d1fd5d0345d4f2abba6355ee1cfbb57",
    playerUrl: "https://media.heanet.ie/player/8d1fd5d0345d4f2abba6355ee1cfbb57",
    thumb: publicAsset("/media/oireachtas-tv/eamon ryan.png"),
    summary: "Find out what makes our politicians tick with our popular interview series.",
  },
  {
    id: "tv-25",
    title: "Shane Ross",
    series: "Perspectives",
    meta: "16 Nov 2025 · CC",
    href: "https://media.heanet.ie/player/d9d0eab8ccf84bf88e0c9e0cd9a16717",
    playerUrl: "https://media.heanet.ie/player/d9d0eab8ccf84bf88e0c9e0cd9a16717",
    thumb: publicAsset("/media/oireachtas-tv/shane ross.png"),
    summary: "Find out what makes our politicians tick with our popular interview series.",
  },
  {
    id: "tv-26",
    title: "Eamon Ó Cuív",
    series: "Perspectives",
    meta: "11 Nov 2025 · CC",
    href: "https://media.heanet.ie/player/57399dc3d6c043d5a67d615d25e72b43",
    playerUrl: "https://media.heanet.ie/player/57399dc3d6c043d5a67d615d25e72b43",
    thumb: publicAsset("/media/oireachtas-tv/eamon o cuiv.png"),
    summary: "Find out what makes our politicians tick with our popular interview series.",
  },
  {
    id: "tv-27",
    title: "Mary Coughlan",
    series: "Perspectives",
    meta: "5 Nov 2025 · CC",
    href: "https://media.heanet.ie/player/d89952772b004212a1897a9a940fb7cf",
    playerUrl: "https://media.heanet.ie/player/d89952772b004212a1897a9a940fb7cf",
    thumb: publicAsset("/media/oireachtas-tv/mary coughlan.png"),
    summary: "Find out what makes our politicians tick with our popular interview series.",
  },
  {
    id: "tv-28",
    title: "Richard Bruton",
    series: "Perspectives",
    meta: "28 Oct 2025 · CC",
    href: "https://media.heanet.ie/player/d298a61853614f07ac1faacc45e89792",
    playerUrl: "https://media.heanet.ie/player/d298a61853614f07ac1faacc45e89792",
    thumb: publicAsset("/media/oireachtas-tv/richard bruton.png"),
    summary: "Find out what makes our politicians tick with our popular interview series.",
  },
  {
    id: "tv-29",
    title: "Dermot Ahern",
    series: "Perspectives",
    meta: "20 Oct 2025 · CC",
    href: "https://media.heanet.ie/player/8ebffb7b509a4868a6a6177d41e82248",
    playerUrl: "https://media.heanet.ie/player/8ebffb7b509a4868a6a6177d41e82248",
    thumb: publicAsset("/media/oireachtas-tv/dermot ahern.png"),
    summary: "Find out what makes our politicians tick with our popular interview series.",
  },
  {
    id: "tv-30",
    title: "Pat Rabbitte",
    series: "Perspectives",
    meta: "13 Oct 2025 · CC",
    href: "https://media.heanet.ie/player/4d30c25ca597492db80fb2675a018977",
    playerUrl: "https://media.heanet.ie/player/4d30c25ca597492db80fb2675a018977",
    thumb: publicAsset("/media/oireachtas-tv/pat rabbitte.png"),
    summary: "Find out what makes our politicians tick with our popular interview series.",
  },
  {
    id: "tv-31",
    title: "Róisín Shortall",
    series: "Perspectives",
    meta: "2 Oct 2025 · CC",
    href: "https://media.heanet.ie/player/eba8be9b22974323b8ae6988087add08",
    playerUrl: "https://media.heanet.ie/player/eba8be9b22974323b8ae6988087add08",
    thumb: publicAsset("/media/oireachtas-tv/roisin shortall.png"),
    summary: "Find out what makes our politicians tick with our popular interview series.",
  },
];

export const tvShelves: Array<{ title: string; items: OireachtasTvItem[] }> = [
  {
    title: "Latest videos",
    items: [...tvFeatured, ...tvCurated.filter((item) => item.series !== "Inside Parliament: Briefing")].sort(
      (a, b) => getTvPublishedAtValue(b) - getTvPublishedAtValue(a),
    ),
  },
  {
    title: "Inside Parliament: Briefing",
    items: tvCurated.filter((item) => item.series === "Inside Parliament: Briefing"),
  },
  {
    title: "Perspectives",
    items: tvCurated.filter((item) => item.series === "Perspectives"),
  },
  {
    title: "Around the Houses",
    items: tvCurated.filter((item) => item.series === "Around the Houses"),
  },
  {
    title: "In Focus",
    items: tvCurated.filter((item) => item.series === "In Focus"),
  },
];
