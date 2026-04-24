import { notFound } from "next/navigation";
import { ExamDetailsClient } from "@/components/exam-details-client";
import { applyExamSchedulesToExamContent, examContent } from "@/lib/exam-content";
import { fetchPublicExamSchedules } from "@/lib/public-data";

type ExamPageProps = {
  params: Promise<{ examSlug: string }>;
};

function normalizeExamSlug(value: string) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default async function ExamOverviewPage({ params }: ExamPageProps) {
  const { examSlug } = await params;
  const examSchedules = await fetchPublicExamSchedules();
  const mergedExamContent = applyExamSchedulesToExamContent(examContent, examSchedules);
  const normalizedRequestedSlug = normalizeExamSlug(examSlug);
  const details =
    mergedExamContent[examSlug] ||
    Object.values(mergedExamContent).find((item) => {
      const candidateSlugs = [
        item.slug,
        item.title,
        item.short,
        item.title.replace(/\s+\d{4}$/, ""),
      ];
      return candidateSlugs.some(
        (candidate) => normalizeExamSlug(candidate) === normalizedRequestedSlug,
      );
    });

  if (!details) {
    notFound();
  }

  return (
    <ExamDetailsClient
      key={details.slug}
      details={details}
      allExams={Object.values(mergedExamContent)}
    />
  );
}
