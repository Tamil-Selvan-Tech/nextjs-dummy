import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  FileText,
  Globe,
  GraduationCap,
  HelpCircle,
  LineChart,
  Newspaper,
  Trophy,
} from "lucide-react";
import Image from "next/image";
import { Navbar } from "@/components/navbar";

type ExamPageProps = {
  params: Promise<{ examSlug: string }>;
};

const examContent: Record<
  string,
  {
    title: string;
    short: string;
    heroImage: string;
    mode: string;
    date: string;
    level: string;
    colleges: string;
    authority: string;
    courses: string;
    seats: string;
    duration: string;
    questionCount: string;
    totalMarks: string;
    applicationFee: string;
    lastDate: string;
    eligibility: string;
    officialSite: string;
    timeline: Array<{ label: string; value: string }>;
    faqs: Array<{ question: string; answer: string }>;
  }
> = {
  "jee-main": {
    title: "JEE Main 2026",
    short: "Engineering entrance for B.E/B.Tech/B.Arch admissions.",
    heroImage:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80",
    mode: "Online Exam",
    date: "April 02, 2026",
    level: "National",
    colleges: "2031",
    authority: "National Testing Agency (NTA)",
    courses: "B.E, B.Tech, B.Arch",
    seats: "38,000+",
    duration: "3 Hours",
    questionCount: "90 Questions",
    totalMarks: "300",
    applicationFee: "INR 1,000 (General)",
    lastDate: "March 10, 2026",
    eligibility: "Class 12 with Physics, Chemistry, Mathematics",
    officialSite: "https://jeemain.nta.nic.in",
    timeline: [
      { label: "Application Start", value: "Jan 05, 2026" },
      { label: "Last Date", value: "Mar 10, 2026" },
      { label: "Admit Card", value: "Mar 24, 2026" },
      { label: "Exam Window", value: "Apr 02 - Apr 09, 2026" },
    ],
    faqs: [
      {
        question: "Can I attempt JEE Main multiple times?",
        answer: "Yes. You can attempt in multiple sessions and best score is considered for ranking.",
      },
      {
        question: "Is JEE Main mandatory for NIT admission?",
        answer: "Yes. NITs and many centrally funded institutes use JEE Main rank.",
      },
    ],
  },
  "jee-advanced": {
    title: "JEE Advanced 2026",
    short: "Gateway exam for IIT admissions across India.",
    heroImage:
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=80",
    mode: "Online Exam",
    date: "May 17, 2026",
    level: "National",
    colleges: "73",
    authority: "IIT Joint Admission Board",
    courses: "B.Tech, Dual Degree",
    seats: "17,000+",
    duration: "6 Hours (2 Papers)",
    questionCount: "Variable by paper",
    totalMarks: "Variable",
    applicationFee: "INR 3,200 (General)",
    lastDate: "Apr 30, 2026",
    eligibility: "Top JEE Main qualifiers + Class 12 criteria",
    officialSite: "https://jeeadv.ac.in",
    timeline: [
      { label: "Registration", value: "Apr 18, 2026" },
      { label: "Last Date", value: "Apr 30, 2026" },
      { label: "Admit Card", value: "May 10, 2026" },
      { label: "Exam Date", value: "May 17, 2026" },
    ],
    faqs: [
      {
        question: "Who can apply for JEE Advanced?",
        answer: "Only eligible top rankers from JEE Main can register.",
      },
      {
        question: "How many papers are there?",
        answer: "Two compulsory papers are conducted on the same day.",
      },
    ],
  },
  cuet: {
    title: "CUET UG 2026",
    short: "Common entrance test for central and participating universities.",
    heroImage:
      "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1200&q=80",
    mode: "Offline Exam",
    date: "May 11, 2026",
    level: "National",
    colleges: "584",
    authority: "National Testing Agency (NTA)",
    courses: "UG Programs Across Universities",
    seats: "2.5L+",
    duration: "Varies by subjects",
    questionCount: "Subject-based sections",
    totalMarks: "Depends on subjects",
    applicationFee: "INR 750 onwards",
    lastDate: "Apr 02, 2026",
    eligibility: "Class 12 or appearing candidates",
    officialSite: "https://cuet.nta.nic.in",
    timeline: [
      { label: "Application Start", value: "Feb 27, 2026" },
      { label: "Last Date", value: "Apr 02, 2026" },
      { label: "City Intimation", value: "May 02, 2026" },
      { label: "Exam Dates", value: "May 11 - May 28, 2026" },
    ],
    faqs: [
      {
        question: "Can I choose multiple domain subjects?",
        answer: "Yes, you can choose subjects based on university eligibility.",
      },
      {
        question: "Is CUET accepted by state universities?",
        answer: "Many state/private universities also accept CUET scores.",
      },
    ],
  },
  neet: {
    title: "NEET UG 2026",
    short: "Medical entrance exam for MBBS/BDS and allied programs.",
    heroImage:
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80",
    mode: "Offline Exam",
    date: "May 05, 2026",
    level: "National",
    colleges: "612",
    authority: "National Testing Agency (NTA)",
    courses: "MBBS, BDS, AYUSH, BSc Nursing",
    seats: "1L+",
    duration: "3 Hours 20 Minutes",
    questionCount: "200 (180 to be answered)",
    totalMarks: "720",
    applicationFee: "INR 1,700 (General)",
    lastDate: "Mar 15, 2026",
    eligibility: "Class 12 with Physics, Chemistry, Biology",
    officialSite: "https://neet.nta.nic.in",
    timeline: [
      { label: "Application Start", value: "Feb 09, 2026" },
      { label: "Last Date", value: "Mar 15, 2026" },
      { label: "Admit Card", value: "Apr 26, 2026" },
      { label: "Exam Date", value: "May 05, 2026" },
    ],
    faqs: [
      {
        question: "Is NEET compulsory for MBBS in India?",
        answer: "Yes, NEET score is mandatory for MBBS/BDS admissions.",
      },
      {
        question: "How is NEET score calculated?",
        answer: "Based on correct and incorrect answers with negative marking.",
      },
    ],
  },
};

export default async function ExamOverviewPage({ params }: ExamPageProps) {
  const { examSlug } = await params;
  const details = examContent[examSlug] ?? examContent["jee-main"];

  return (
    <section className="min-h-screen bg-[#f4f7fc] text-slate-900">
      <Navbar />
      <div className="page-container-full py-10">
        <div className="rounded-3xl border border-[rgba(15,76,129,0.12)] bg-white p-6 shadow-[0_20px_46px_rgba(12,31,58,0.12)] md:p-8">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <span className="inline-flex rounded-full bg-[rgba(30,79,163,0.1)] px-3 py-1 text-xs font-semibold text-[rgb(30,79,163)]">
                Exam Overview
              </span>
              <h1 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
                Your Roadmap for <span className="text-[rgb(30,79,163)]">{details.title}</span>
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-600 md:text-base">{details.short}</p>
              <div className="mt-5 flex flex-wrap gap-3 text-sm">
                <span className="rounded-full border border-[rgba(15,76,129,0.16)] bg-white px-3 py-1.5 font-semibold">
                  {details.mode}
                </span>
                <span className="rounded-full border border-[rgba(15,76,129,0.16)] bg-white px-3 py-1.5 font-semibold">
                  {details.date}
                </span>
                <span className="rounded-full border border-[rgba(15,76,129,0.16)] bg-white px-3 py-1.5 font-semibold">
                  {details.level}
                </span>
              </div>
            </div>
            <div className="relative min-h-[240px] overflow-hidden rounded-3xl border border-[rgba(15,76,129,0.14)] bg-slate-100">
              <Image
                src={details.heroImage}
                alt="Exam preparation"
                fill
                sizes="(min-width: 1024px) 38vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>

        <section className="mt-8">
          <h2 className="text-2xl font-bold text-slate-900">Upcoming Major Exams</h2>
          <p className="mt-1 text-sm text-slate-600">Stay ahead with dates and quick overview cards.</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Object.values(examContent).map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-[rgba(15,76,129,0.12)] bg-white p-4 shadow-[0_12px_24px_rgba(15,76,129,0.08)]"
              >
                <p className="text-xs font-semibold uppercase text-[rgb(30,79,163)]">{item.mode}</p>
                <h3 className="mt-1 text-xl font-bold">{item.title}</h3>
                <dl className="mt-3 space-y-1.5 text-sm">
                  <div className="flex items-center justify-between">
                    <dt className="text-slate-500">Date</dt>
                    <dd className="font-semibold">{item.date}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-slate-500">Level</dt>
                    <dd className="font-semibold">{item.level}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-slate-500">Colleges</dt>
                    <dd className="font-semibold">{item.colleges}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-6 overflow-x-auto rounded-2xl border border-[rgba(15,76,129,0.12)] bg-white px-3 py-2 shadow-[0_8px_20px_rgba(15,76,129,0.08)]">
          <div className="flex min-w-max items-center gap-4 text-sm">
            {[
              "Overview",
              "Registration",
              "Admit Card",
              "Answer Key",
              "Question Paper",
              "Cutoff",
              "Preparation",
              "Mock Test",
              "News",
            ].map((tab, idx) => (
              <button
                key={tab}
                type="button"
                className={`rounded-full px-3 py-1.5 font-semibold ${
                  idx === 0
                    ? "bg-[rgba(30,79,163,0.12)] text-[rgb(30,79,163)]"
                    : "text-slate-600 hover:bg-[rgba(15,76,129,0.06)]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.55fr_0.7fr]">
          <div className="rounded-3xl border border-[rgba(15,76,129,0.12)] bg-white p-6 shadow-[0_16px_36px_rgba(15,76,129,0.08)]">
            <h2 className="text-2xl font-bold">{details.title} Overview</h2>
            <p className="mt-2 text-sm text-slate-600">
              {details.title} is one of the key admission exams in India. This sample page gives you
              an exam snapshot including eligibility, pattern, timeline, and preparation details.
            </p>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl bg-[rgba(30,79,163,0.08)] p-4">
                <Trophy className="size-5 text-[rgb(30,79,163)]" />
                <p className="mt-2 text-xs text-slate-600">Authority</p>
                <p className="text-sm font-semibold">{details.authority}</p>
              </div>
              <div className="rounded-2xl bg-[rgba(30,79,163,0.08)] p-4">
                <GraduationCap className="size-5 text-[rgb(30,79,163)]" />
                <p className="mt-2 text-xs text-slate-600">Courses</p>
                <p className="text-sm font-semibold">{details.courses}</p>
              </div>
              <div className="rounded-2xl bg-[rgba(30,79,163,0.08)] p-4">
                <BookOpen className="size-5 text-[rgb(30,79,163)]" />
                <p className="mt-2 text-xs text-slate-600">Seats Approx</p>
                <p className="text-sm font-semibold">{details.seats} Total</p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-[rgba(15,76,129,0.1)] p-4">
              <h4 className="text-base font-bold">Exam Pattern (Sample)</h4>
              <div className="mt-3 grid grid-cols-4 gap-2 text-xs font-semibold text-slate-500">
                <span>Section</span>
                <span>Questions</span>
                <span>Marks</span>
                <span>Mode</span>
              </div>
              <div className="mt-2 grid grid-cols-4 gap-2 text-sm">
                <span>Physics</span><span>25</span><span>100</span><span>{details.mode.includes("Online") ? "CBT" : "Pen/Paper"}</span>
                <span>Chemistry</span><span>25</span><span>100</span><span>{details.mode.includes("Online") ? "CBT" : "Pen/Paper"}</span>
                <span>Maths/Biology</span><span>25</span><span>100</span><span>{details.mode.includes("Online") ? "CBT" : "Pen/Paper"}</span>
              </div>
            </div>
          </div>

          <aside className="rounded-3xl border border-[rgba(15,76,129,0.12)] bg-white p-5 shadow-[0_16px_36px_rgba(15,76,129,0.08)]">
            <h3 className="text-lg font-bold">Quick Links</h3>
            <div className="mt-3 space-y-2">
              {[
                "Official Brochure PDF",
                "Syllabus PDF",
                "Previous Year Papers",
                "Official Mock Test",
              ].map((link) => (
                <button
                  key={link}
                  type="button"
                  className="flex w-full items-center justify-between rounded-lg border border-[rgba(15,76,129,0.1)] px-3 py-2 text-left text-sm font-semibold text-slate-700"
                >
                  {link}
                  <ArrowRight className="size-4 text-[rgb(30,79,163)]" />
                </button>
              ))}
            </div>
          </aside>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-[rgba(15,76,129,0.12)] bg-white p-6 shadow-[0_16px_36px_rgba(15,76,129,0.08)]">
            <h3 className="text-2xl font-bold">Exam At a Glance</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-[rgba(15,76,129,0.12)] p-3">
                <p className="text-xs text-slate-500">Duration</p>
                <p className="text-sm font-semibold">{details.duration}</p>
              </div>
              <div className="rounded-xl border border-[rgba(15,76,129,0.12)] p-3">
                <p className="text-xs text-slate-500">Question Count</p>
                <p className="text-sm font-semibold">{details.questionCount}</p>
              </div>
              <div className="rounded-xl border border-[rgba(15,76,129,0.12)] p-3">
                <p className="text-xs text-slate-500">Total Marks</p>
                <p className="text-sm font-semibold">{details.totalMarks}</p>
              </div>
              <div className="rounded-xl border border-[rgba(15,76,129,0.12)] p-3">
                <p className="text-xs text-slate-500">Application Fee</p>
                <p className="text-sm font-semibold">{details.applicationFee}</p>
              </div>
            </div>
            <div className="mt-4 rounded-xl border border-[rgba(15,76,129,0.12)] bg-[rgba(30,79,163,0.06)] p-3">
              <p className="text-xs text-slate-500">Eligibility</p>
              <p className="text-sm font-semibold">{details.eligibility}</p>
            </div>
          </div>

          <div className="rounded-3xl border border-[rgba(15,76,129,0.12)] bg-white p-6 shadow-[0_16px_36px_rgba(15,76,129,0.08)]">
            <h3 className="text-2xl font-bold">Important Timeline</h3>
            <div className="mt-4 space-y-3">
              {details.timeline.map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-xl border border-[rgba(15,76,129,0.1)] p-3">
                  <div className="flex items-center gap-2">
                    <Clock3 className="size-4 text-[rgb(30,79,163)]" />
                    <span className="text-sm font-semibold">{item.label}</span>
                  </div>
                  <span className="text-sm text-slate-700">{item.value}</span>
                </div>
              ))}
            </div>
            <a
              href={details.officialSite}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[rgb(30,79,163)]"
            >
              <Globe className="size-4" />
              Official Website
            </a>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-[rgba(15,76,129,0.12)] bg-white p-6 shadow-[0_16px_36px_rgba(15,76,129,0.08)]">
            <h3 className="text-2xl font-bold">Registration Process</h3>
            <div className="mt-4 space-y-4">
              {[
                "Online Registration",
                "Fill Application Form",
                "Upload Documents",
                "Pay Exam Fee",
              ].map((step, index) => (
                <div key={step} className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[rgb(30,79,163)] text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-semibold">{step}</p>
                    <p className="text-sm text-slate-600">
                      Dummy step description for UI preview and flow visibility.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-[rgba(15,76,129,0.12)] bg-white p-6 shadow-[0_16px_36px_rgba(15,76,129,0.08)]">
            <h3 className="text-lg font-bold">Document Checklist</h3>
            <div className="mt-4 space-y-2 text-sm">
              {[
                "Class 10th / 12th Marksheet",
                "Aadhaar Card",
                "Passport-size Photo",
                "Signature",
                "Category Certificate (if needed)",
              ].map((doc) => (
                <div key={doc} className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-[rgb(30,79,163)]" />
                  <span>{doc}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-[rgba(15,76,129,0.12)] bg-white p-6 shadow-[0_16px_36px_rgba(15,76,129,0.08)]">
            <h3 className="text-2xl font-bold">Cutoff Trends</h3>
            <p className="mt-2 text-sm text-slate-600">Sample historical trend section for demo purposes.</p>
            <div className="mt-4 rounded-2xl border border-[rgba(15,76,129,0.1)] p-4">
              <div className="grid grid-cols-4 gap-2 text-xs font-semibold text-slate-500">
                <span>Category</span>
                <span>2023</span>
                <span>2024</span>
                <span>2025</span>
              </div>
              <div className="mt-2 grid grid-cols-4 gap-2 text-sm">
                <span>General</span><span>89.2</span><span>90.1</span><span>91.0</span>
                <span>OBC-NCL</span><span>75.6</span><span>76.2</span><span>77.4</span>
                <span>SC</span><span>59.1</span><span>60.3</span><span>61.2</span>
                <span>ST</span><span>48.6</span><span>49.4</span><span>50.1</span>
              </div>
            </div>
          </div>
          <div className="rounded-3xl border border-[rgba(15,76,129,0.12)] bg-white p-6 shadow-[0_16px_36px_rgba(15,76,129,0.08)]">
            <h3 className="text-2xl font-bold">Preparation Strategy</h3>
            <div className="mt-4 space-y-3">
              {[
                { icon: CalendarDays, text: "Plan weekly mock tests and revise mistakes." },
                { icon: ClipboardList, text: "Maintain a revision tracker for core topics." },
                { icon: LineChart, text: "Measure score growth every two weeks." },
              ].map((item) => (
                <div key={item.text} className="rounded-2xl border border-[rgba(15,76,129,0.1)] p-3">
                  <item.icon className="size-4 text-[rgb(30,79,163)]" />
                  <p className="mt-2 text-sm text-slate-700">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-[rgba(15,76,129,0.12)] bg-white p-6 shadow-[0_16px_36px_rgba(15,76,129,0.08)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-2xl font-bold">Latest News & Updates</h3>
            <button className="inline-flex items-center gap-2 rounded-full bg-[rgb(30,79,163)] px-4 py-2 text-sm font-semibold text-white">
              View All
              <ArrowRight className="size-4" />
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {[
              "NTA releases revised schedule for mock sessions.",
              "Application correction window opens next week.",
              "Top institutes publish latest intake update.",
            ].map((news) => (
              <div
                key={news}
                className="flex items-center gap-3 rounded-2xl border border-[rgba(15,76,129,0.1)] p-3"
              >
                <Newspaper className="size-4 text-[rgb(30,79,163)]" />
                <span className="text-sm">{news}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <button className="rounded-xl border border-[rgba(15,76,129,0.14)] p-3 text-left text-sm font-semibold">
              <FileText className="mb-2 size-4 text-[rgb(30,79,163)]" />
              Previous Papers
            </button>
            <button className="rounded-xl border border-[rgba(15,76,129,0.14)] p-3 text-left text-sm font-semibold">
              <ClipboardList className="mb-2 size-4 text-[rgb(30,79,163)]" />
              Syllabus Overview
            </button>
            <button className="rounded-xl border border-[rgba(15,76,129,0.14)] p-3 text-left text-sm font-semibold">
              <ArrowRight className="mb-2 size-4 text-[rgb(30,79,163)]" />
              Official Website
            </button>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-[rgba(15,76,129,0.12)] bg-white p-6 shadow-[0_16px_36px_rgba(15,76,129,0.08)]">
          <h3 className="text-2xl font-bold">Frequently Asked Questions</h3>
          <div className="mt-4 space-y-3">
            {details.faqs.map((faq) => (
              <div key={faq.question} className="rounded-2xl border border-[rgba(15,76,129,0.12)] p-4">
                <div className="flex items-start gap-2">
                  <HelpCircle className="mt-0.5 size-4 text-[rgb(30,79,163)]" />
                  <p className="font-semibold">{faq.question}</p>
                </div>
                <p className="mt-2 text-sm text-slate-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
