import Image from "next/image";
import { Navbar } from "@/components/navbar";
import { TopExamCard, type TopExamCardData } from "@/components/top-exam-card";
import { applyExamSchedulesToExamContent, examContent } from "@/lib/exam-content";
import { fetchPublicExamSchedules, type PublicExamSchedule } from "@/lib/public-data";

const FEATURED_EXAMS = ["jee-main", "jee-advanced", "cuet", "neet"] as const;

const normalizeExamSlug = (value: string) =>
  String(value || "")
    .trim()
    .replace(/\s+\d{4}$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const buildAdminExamSummary = (schedule: PublicExamSchedule) => {
  const applicationWindow =
    schedule.startDateToApply && schedule.lastDateToApply
      ? `Application window: ${schedule.startDateToApply} to ${schedule.lastDateToApply}.`
      : "Live exam schedule with important dates and application details.";

  return `${schedule.examName} admission schedule, exam date, fees, and application timeline in one place. ${applicationWindow}`;
};

const buildAdminExamHighlights = (schedule: PublicExamSchedule) =>
  [
    schedule.applicationFees ? `Application fees: ${schedule.applicationFees}` : "",
    schedule.startDateToApply && schedule.lastDateToApply
      ? `Apply from ${schedule.startDateToApply} to ${schedule.lastDateToApply}`
      : "",
    schedule.resultDate ? `Result date: ${schedule.resultDate}` : "Check schedule updates before applying.",
  ].filter(Boolean);

export default async function ExamsPage() {
  const examSchedules = await fetchPublicExamSchedules();
  const mergedExamContent = applyExamSchedulesToExamContent(examContent, examSchedules);

  const featuredExamCards = FEATURED_EXAMS.map((slug) => {
    const exam = mergedExamContent[slug];
    return {
      id: exam.slug,
      name: exam.title.replace(/\s+\d{4}$/, ""),
      href: `/exams/${exam.slug}`,
      mode: exam.mode,
      participatingColleges: exam.colleges,
      examDate: exam.date,
      examLevel: exam.level,
      summary: exam.short,
      highlights: exam.overviewHighlights.slice(0, 3),
    };
  });
  const featuredExamLookup = new Set(
    FEATURED_EXAMS.flatMap((slug) => {
      const exam = mergedExamContent[slug];
      return [slug, exam.slug, exam.title, exam.title.replace(/\s+\d{4}$/, ""), exam.short].map(normalizeExamSlug);
    }),
  );
  const adminExamCards: TopExamCardData[] = [...examSchedules]
    .sort((left, right) => new Date(String(right.updatedAt || 0)).getTime() - new Date(String(left.updatedAt || 0)).getTime())
    .filter((schedule) => !featuredExamLookup.has(normalizeExamSlug(schedule.examName)))
    .map((schedule) => ({
      id: `admin-${schedule.id}`,
      name: schedule.examName,
      href: "/exams",
      mode: schedule.isTopExam ? "Featured Exam" : "Live Exam",
      participatingColleges: "-",
      examDate: schedule.examDate,
      examLevel: "National",
      summary: buildAdminExamSummary(schedule),
      highlights: buildAdminExamHighlights(schedule),
    }));
  const examCards = [...adminExamCards, ...featuredExamCards];

  return (
    <div className="home-theme bg-[color:var(--page-bg)]">
      <section className="relative overflow-hidden bg-[color:var(--page-bg)] text-[color:var(--text-dark)]">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.12),transparent_54%),linear-gradient(180deg,rgba(247,248,252,0.97),rgba(247,248,252,1))]" />
          <div className="absolute left-[-4rem] top-[8rem] h-40 w-40 rounded-full bg-[rgba(59,130,246,0.08)] blur-3xl" />
          <div className="absolute right-[-5rem] top-[14rem] h-44 w-44 rounded-full bg-[rgba(29,78,216,0.1)] blur-3xl" />
        </div>

        <div className="relative z-10">
          <Navbar />
          <div className="mx-auto max-w-[90rem] px-4 pb-7 pt-4 sm:px-6 lg:px-8">
            <div className="relative min-h-[170px] lg:min-h-[195px]">
              <div className="max-w-[650px] pt-2 lg:pt-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[color:var(--brand-primary-soft)]">
                  Exams
                </p>

                <h1 className="mt-3 whitespace-nowrap font-montserrat-display text-xl font-bold leading-tight tracking-normal text-[color:var(--text-dark)] sm:text-2xl lg:text-[2.35rem]">
                  Master Your Entry Strategy
                </h1>

                <div className="mt-4 h-1.5 w-14 rounded-full bg-gradient-to-r from-[#3B82F6] to-[#142A63]" />

                <p className="mt-4 max-w-[580px] text-[15px] leading-7 text-[color:var(--text-muted)]">
                  Explore top exams, detailed syllabus, important dates, and preparation resources in one place.
                </p>
              </div>

              <div className="absolute right-0 top-[-2.4rem] hidden lg:block xl:right-3 xl:top-[-3rem]">
                <Image
                  src="/exam-img.png"
                  alt="Exam illustration"
                  width={320}
                  height={265}
                  priority
                  className="object-contain drop-shadow-[0_30px_50px_rgba(20,42,99,0.18)]"
                />
              </div>
            </div>

            <div className="mt-3 grid gap-5 lg:grid-cols-2">
              {examCards.map((exam) => (
                <TopExamCard key={exam.id} exam={exam} variant="detailed" />
              ))}
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
