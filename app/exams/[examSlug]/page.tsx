import { notFound } from "next/navigation";
import { ExamDetailsClient } from "@/components/exam-details-client";
import { applyExamSchedulesToExamContent, examContent } from "@/lib/exam-content";
import { fetchPublicExamSchedules } from "@/lib/public-data";

type ExamPageProps = {
  params: Promise<{ examSlug: string }>;
};

export default async function ExamOverviewPage({ params }: ExamPageProps) {
  const { examSlug } = await params;
  const examSchedules = await fetchPublicExamSchedules();
  const mergedExamContent = applyExamSchedulesToExamContent(examContent, examSchedules);
  const details = mergedExamContent[examSlug];

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
