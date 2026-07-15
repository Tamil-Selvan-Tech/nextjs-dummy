import { notFound } from "next/navigation";
import { CourseDetailsView } from "@/components/course-details-view";
import { fetchPublicPanelData } from "@/lib/public-data";
import {
  colleges,
  courseMatchesLookup,
  formatCourseDisplayName,
  getRelatedCourses,
  getCollegeById,
  normalizeText,
} from "@/lib/site-data";

const getCollegeIdentityValues = (college: {
  id: string;
  name: string;
  collegeCode?: string;
}) =>
  [college.id, college.collegeCode || "", college.name]
    .map((value) => normalizeText(value))
    .filter(Boolean);

const courseMatchesCollegeIdentity = (
  course: {
    collegeId?: string;
    collegeCode?: string;
    college?: string;
    collegeDetails: Array<{
      college?: string;
      collegeId?: string;
      collegeCode?: string;
    }>;
  },
  collegeIdentityValues: string[],
) => {
  if (!collegeIdentityValues.length) return false;

  const courseIdentityValues = [
    course.collegeId || "",
    course.collegeCode || "",
    course.college || "",
  ]
    .map((value) => normalizeText(value))
    .filter(Boolean);

  if (courseIdentityValues.some((value) => collegeIdentityValues.includes(value))) {
    return true;
  }

  return Array.isArray(course.collegeDetails)
    ? course.collegeDetails.some((detail) =>
        [detail.college, detail.collegeId, detail.collegeCode]
          .map((value) => normalizeText(value || ""))
          .filter(Boolean)
          .some((value) => collegeIdentityValues.includes(value)),
      )
    : false;
};

const collectCourseCollegeIdentityValues = (course: {
  collegeId?: string;
  collegeCode?: string;
  college?: string;
  collegeDetails: Array<{
    college?: string;
    collegeId?: string;
    collegeCode?: string;
  }>;
}) =>
  [
    course.collegeId || "",
    course.collegeCode || "",
    course.college || "",
    ...course.collegeDetails.flatMap((detail) => [
      detail.college || "",
      detail.collegeId || "",
      detail.collegeCode || "",
    ]),
  ]
    .map((value) => normalizeText(value))
    .filter(Boolean);

export default async function CourseDetailsPage({
  params,
}: {
  params: Promise<{ courseName: string }>;
}) {
  const { courseName } = await params;
  const decodedName = decodeURIComponent(courseName);
  const panelData = await fetchPublicPanelData();
  const normalizedDecodedName = normalizeText(decodedName);
  const relatedCourses = panelData.courses.filter(
    (course) => {
      const displayLabel = formatCourseDisplayName(
        course.course,
        course.stream || course.courseCategory,
        course.specialization,
      );
      const searchableCourseValues = [
        course.course,
        course.courseName || "",
        course.specialization || "",
        course.courseCategory || "",
        course.stream || "",
        displayLabel,
      ];

      return searchableCourseValues.some(
        (value) =>
          normalizeText(value) === normalizedDecodedName || courseMatchesLookup(value, decodedName),
      );
    },
  );

  const safeRelatedCourses = relatedCourses.length ? relatedCourses : getRelatedCourses(decodedName);

  if (safeRelatedCourses.length === 0) notFound();

  const availableColleges = panelData.colleges.length ? panelData.colleges : colleges;
  const collegeLookup = new Map(
    availableColleges.map((college) => [normalizeText(college.id), college]),
  );
  const collegeKeys = new Set<string>();

  safeRelatedCourses.forEach((course) => {
    collectCourseCollegeIdentityValues(course).forEach((value) => collegeKeys.add(value));
  });

  const collegesForCourse = availableColleges.filter((college) => {
    const collegeIdentityValues = getCollegeIdentityValues(college);
    const exactMatch = safeRelatedCourses.some((course) =>
      courseMatchesCollegeIdentity(course, collegeIdentityValues),
    );

    if (exactMatch) {
      return true;
    }

    const normalizedCollegeName = normalizeText(college.name);
    const normalizedUniversity = normalizeText(college.university);
    return [...collegeKeys].some((key) => {
      if (key === normalizedCollegeName || key === normalizedUniversity) return true;
      if (normalizedCollegeName && key.includes(normalizedCollegeName)) return true;
      if (normalizedUniversity && key.includes(normalizedUniversity)) return true;
      return false;
    });
  });

  const collegesResolvedFromCourses =
    collegesForCourse.length > 0
      ? collegesForCourse
      : safeRelatedCourses
          .flatMap((course) => collectCourseCollegeIdentityValues(course))
          .map((value) => collegeLookup.get(value) || getCollegeById(value))
          .filter((college): college is NonNullable<typeof college> => Boolean(college));

  const finalCollegesForCourse = collegesResolvedFromCourses.length
    ? Array.from(new Map(collegesResolvedFromCourses.map((college) => [college.id, college])).values())
    : collegesForCourse;
  const primaryCourse = safeRelatedCourses[0];
  const displayCourseName = formatCourseDisplayName(
    primaryCourse?.course || decodedName,
    primaryCourse?.stream || primaryCourse?.courseCategory,
    primaryCourse?.specialization,
  );

  return (
    <CourseDetailsView
      courseName={displayCourseName}
      relatedCourses={safeRelatedCourses}
      collegesForCourse={finalCollegesForCourse}
    />
  );
}
