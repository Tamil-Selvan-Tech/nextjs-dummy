import { notFound } from "next/navigation";
import { ExamDetailsClient } from "@/components/exam-details-client";
import { examContent } from "@/lib/exam-content";

type ExamPageProps = {
  params: Promise<{ examSlug: string }>;
};

export default async function ExamOverviewPage({ params }: ExamPageProps) {
  const { examSlug } = await params;
  const details = examContent[examSlug];

  if (!details) {
    notFound();
  }

  return <ExamDetailsClient key={details.slug} details={details} allExams={Object.values(examContent)} />;
}
