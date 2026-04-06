import { notFound } from "next/navigation";
import { CollegeDetailsView } from "../../../components/college-details-view";
import { fetchPublicPanelData } from "@/lib/public-data";
import { getCollegeById, getCoursesForCollege, normalizeText } from "@/lib/site-data";

export default async function CollegeDetailsPage({
  params,
}: {
  params: Promise<{ collegeId: string }>;
}) {
  const { collegeId } = await params;
  const panelData = await fetchPublicPanelData();
  const college =
    panelData.colleges.find((item) => item.id === collegeId) || getCollegeById(collegeId);

  if (!college) notFound();

  const relatedCourses = panelData.courses.filter(
    (course) =>
      course.collegeId === college.id ||
      normalizeText(course.college) === normalizeText(college.name) ||
      normalizeText(course.university) === normalizeText(college.university),
  );

  return (
    <CollegeDetailsView
      college={college}
      relatedCourses={relatedCourses.length ? relatedCourses : getCoursesForCollege(college.name)}
    />
  );
}
