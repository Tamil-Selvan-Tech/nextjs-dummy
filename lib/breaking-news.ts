export type BreakingNewsItem = {
  status: "LIVE" | "NEW" | "LAST DATE" | "ALERT";
  title: string;
  tone: "danger" | "success" | "warning" | "info";
  href: string;
};

export const BREAKING_NEWS_ITEMS: BreakingNewsItem[] = [
  {
    status: "LIVE",
    title: "10th Result Date Announced",
    tone: "danger",
    href: "https://tnresults.nic.in/",
  },
  {
    status: "LIVE",
    title: "12th Result Date Announced",
    tone: "danger",
    href: "https://tnresults.nic.in/",
  },
  {
    status: "NEW",
    title: "TNEA Counseling Open",
    tone: "success",
    href: "https://www.tneaonline.org/",
  },
  {
    status: "ALERT",
    title: "NEET Updates & Counseling Alerts",
    tone: "info",
    href: "/exams/neet",
  },
  {
    status: "NEW",
    title: "JEE Main / Advanced Schedule",
    tone: "success",
    href: "https://jeemain.nta.nic.in/",
  },
  {
    status: "NEW",
    title: "CUET Updates & Registration",
    tone: "success",
    href: "/exams/cuet",
  },
  {
    status: "ALERT",
    title: "Polytechnic Admission Open",
    tone: "info",
    href: "https://www.tnpoly.in/registration",
  },
  {
    status: "LAST DATE",
    title: "Scholarship Apply Today",
    tone: "warning",
    href: "https://scholarships.gov.in/ApplicationForm/",
  },
  {
    status: "NEW",
    title: "Government Exam Notifications",
    tone: "success",
    href: "https://tnpsc.gov.in/english/notification.aspx",
  },
  {
    status: "LAST DATE",
    title: "College Admission Last Dates",
    tone: "warning",
    href: "/explore?view=colleges",
  },
];
