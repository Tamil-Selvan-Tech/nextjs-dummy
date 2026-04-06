import { notFound } from "next/navigation";
import { CourseDetailsView } from "@/components/course-details-view";
import { fetchPublicPanelData } from "@/lib/public-data";
import { colleges, getRelatedCourses, normalizeText } from "@/lib/site-data";

export default async function CourseDetailsPage({
  params,
}: {
  params: Promise<{ courseName: string }>;
}) {
  const { courseName } = await params;
  const decodedName = decodeURIComponent(courseName);
  const panelData = await fetchPublicPanelData();
  const relatedCourses = panelData.courses.filter(
    (course) => normalizeText(course.course) === normalizeText(decodedName),
  );

  const safeRelatedCourses = relatedCourses.length ? relatedCourses : getRelatedCourses(decodedName);

  if (safeRelatedCourses.length === 0) notFound();

  const collegesForCourse = (panelData.colleges.length ? panelData.colleges : colleges).filter(
    (college) =>
      safeRelatedCourses.some(
        (course) => normalizeText(course.college) === normalizeText(college.name),
      ),
  );

  return (
    <CourseDetailsView
      courseName={decodedName}
      relatedCourses={safeRelatedCourses}
      collegesForCourse={collegesForCourse}
    />
  );
}
