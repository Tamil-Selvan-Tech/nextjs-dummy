import Link from "next/link";
import { CollegeDetailsView } from "../../../components/college-details-view";
import { fetchPublicPanelData } from "@/lib/public-data";
import { getCollegeById, getCoursesForCollege, normalizeText } from "@/lib/site-data";
import { Navbar } from "@/components/navbar";

export default async function CollegeDetailsPage({
  params,
}: {
  params: Promise<{ collegeId: string }>;
}) {
  const { collegeId } = await params;
  const panelData = await fetchPublicPanelData();
  const college =
    panelData.colleges.find((item) => item.id === collegeId) || getCollegeById(collegeId);

  if (!college) {
    const suggestions = panelData.colleges.slice(0, 6);
    return (
      <section className="min-h-screen bg-[linear-gradient(180deg,#eef4fb_0%,#e7eef8_100%)] text-[color:var(--text-dark)]">
        <Navbar />
        <div className="page-container-full py-10 md:py-12">
          <div className="rounded-[1.6rem] border border-[rgba(15,76,129,0.12)] bg-white p-6 shadow-[0_18px_40px_rgba(15,76,129,0.08)] md:p-8">
            <p className="inline-flex rounded-full border border-[rgba(15,76,129,0.16)] bg-[rgba(15,76,129,0.08)] px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--brand-primary)]">
              College Not Found
            </p>
            <h1 className="mt-4 text-2xl font-bold md:text-3xl">We couldnâ€™t find that college</h1>
            <p className="mt-2 text-sm text-[color:var(--text-muted)] md:text-base">
              The college link may be invalid, or the data isnâ€™t available yet. Try one of the
              colleges below, or go back to explore.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/explore"
                className="rounded-full bg-[color:var(--brand-primary)] px-5 py-2 text-xs font-semibold text-white"
              >
                Explore Colleges
              </Link>
              <Link
                href="/"
                className="rounded-full border border-[rgba(15,76,129,0.18)] px-5 py-2 text-xs font-semibold text-[color:var(--text-dark)]"
              >
                Back Home
              </Link>
            </div>
          </div>

          {suggestions.length ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {suggestions.map((item) => (
                <Link
                  key={item.id}
                  href={`/college/${item.id}`}
                  className="group rounded-2xl border border-[rgba(15,76,129,0.1)] bg-white p-4 shadow-[0_14px_30px_rgba(15,76,129,0.06)] transition hover:-translate-y-0.5 hover:border-[rgba(15,76,129,0.2)]"
                >
                  <div className="overflow-hidden rounded-xl border border-[rgba(15,76,129,0.08)] bg-[rgba(15,76,129,0.04)]">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-32 w-full object-cover transition duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-32 w-full items-center justify-center bg-[linear-gradient(135deg,#f8fbff_0%,#e8f3ff_100%)] px-3 text-center text-sm font-bold text-[color:var(--brand-primary)]">
                        {item.name}
                      </div>
                    )}
                  </div>
                  <div className="mt-3 text-sm font-semibold text-[color:var(--text-dark)]">{item.name}</div>
                  <div className="mt-1 text-xs text-[color:var(--text-muted)]">
                    {item.district}, {item.state}
                  </div>
                  <div className="mt-2 text-[11px] font-semibold text-[color:var(--brand-primary)]">
                    {item.accreditation}
                  </div>
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </section>
    );
  }

  const collegeIdentityValues = [
    college.id,
    (college as { collegeCode?: string }).collegeCode || "",
    college.name,
  ].map((value) => normalizeText(value)).filter(Boolean);

  const relatedCourses = panelData.courses.filter(
    (course) => {
      const courseIdentityValues = [
        course.collegeId || "",
        course.collegeCode || "",
        course.college || "",
      ].map((value) => normalizeText(value)).filter(Boolean);

      return (
        courseIdentityValues.some((value) => collegeIdentityValues.includes(value)) ||
        course.collegeDetails.some((detail) =>
          [detail.college, detail.collegeId, detail.collegeCode].some((value) =>
            collegeIdentityValues.includes(normalizeText(value || "")),
          ),
        )
      );
    },
  );
  const matchingRelatedCourses = relatedCourses.length
    ? relatedCourses
    : getCoursesForCollege(college.name);
  const pickLatestRepeatedEntranceExam = (
    exams: (typeof matchingRelatedCourses)[number]["entranceExams"],
  ) => {
    if (!Array.isArray(exams) || exams.length <= 1) return exams || [];

    const counts = new Map<string, number>();
    exams.forEach((exam) => {
      const key = normalizeText(exam.examName);
      if (key) counts.set(key, (counts.get(key) || 0) + 1);
    });

    const repeatedExamName = [...counts.entries()]
      .filter(([, count]) => count > 1)
      .sort((first, second) => second[1] - first[1])[0]?.[0];

    if (!repeatedExamName) return exams;

    const repeatedExams = exams.filter(
      (exam) => normalizeText(exam.examName) === repeatedExamName,
    );
    const latestRepeatedExamWithoutCutoff = [...repeatedExams]
      .reverse()
      .find(
        (exam) =>
          !normalizeText(exam.cutoffScoreOrRank) &&
          (normalizeText(exam.paperOrSyllabus) || normalizeText(exam.preparationNotes)),
      );
    const latestRepeatedExam = latestRepeatedExamWithoutCutoff || [...repeatedExams]
      .reverse()
      .find(Boolean);

    return latestRepeatedExam ? [latestRepeatedExam] : exams;
  };

  const collegeScopedCourses = matchingRelatedCourses.map((course) => {
    const matchingCollegeDetail = course.collegeDetails.find(
      (detail) =>
        [detail.college, detail.collegeId, detail.collegeCode].some((value) =>
          collegeIdentityValues.includes(normalizeText(value || "")),
        ),
    );
    const hasExamCollegeScope = course.entranceExams?.some(
      (exam) =>
        normalizeText(exam.collegeId) ||
        normalizeText(exam.college) ||
        normalizeText(exam.collegeCode),
    );
    const scopedEntranceExams = hasExamCollegeScope
      ? course.entranceExams?.filter(
          (exam) =>
            normalizeText(exam.collegeId) === normalizeText(college.id) ||
            normalizeText(exam.college) === normalizeText(college.name) ||
            normalizeText(exam.collegeCode) === normalizeText((college as { collegeCode?: string }).collegeCode),
        )
      : pickLatestRepeatedEntranceExam(course.entranceExams);

    return {
      ...course,
      college: course.college || college.name,
      collegeId: course.collegeId || college.id,
      semesterFees: matchingCollegeDetail?.semesterFees ?? course.semesterFees,
      totalFees: matchingCollegeDetail?.totalFees ?? course.totalFees,
      hostelFees: matchingCollegeDetail?.hostelFees ?? course.hostelFees,
      cutoff: matchingCollegeDetail?.cutoff ?? course.cutoff,
      cutoffText: matchingCollegeDetail?.cutoffText ?? course.cutoffText,
      cutoffByCategory: matchingCollegeDetail?.cutoffByCategory ?? course.cutoffByCategory,
      intake: matchingCollegeDetail?.intake ?? course.intake,
      applicationFee: matchingCollegeDetail?.applicationFee ?? course.applicationFee,
      entranceExams: scopedEntranceExams || [],
    };
  });

  return (
    <CollegeDetailsView
      college={college}
      relatedCourses={collegeScopedCourses}
    />
  );
}
