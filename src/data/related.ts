import type { RelatedItem } from "../components/RelatedResources";

import leadersQuestions from "../assets/carousel/leaders-questions.jpg";
import seanadLeaders from "../assets/carousel/seanad_leaders.jpg";
import financeCommittee from "../assets/carousel/finance-committee.jpg";

export const relatedItems: RelatedItem[] = [
  {
    id: "r1",
    title: "Leaders’ Questions — Highlights",
    href: "#",
    meta: "7 min · ISL · CC",
    badge: "Dáil Éireann",
    thumb: leadersQuestions,
  },
  {
    id: "r2",
    title: "Order of Business — Seanad Éireann",
    href: "#",
    meta: "12 min · ISL · CC",
    badge: "Seanad Éireann",
    thumb: seanadLeaders,
  },
  {
    id: "r3",
    title: "Committee on Finance — Budget Outlook",
    href: "#",
    meta: "2 hr 8 min · CC",
    badge: "Committee Room 1",
    thumb: financeCommittee,
  },
];