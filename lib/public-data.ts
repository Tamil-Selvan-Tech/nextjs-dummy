import { API_BASE_URL } from "@/lib/api";
import {
  colleges as fallbackColleges,
  courses as fallbackCourses,
  normalizeText,
  type College,
  type Course,
} from "@/lib/site-data";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80";
const BROKEN_IMAGE_URLS = new Set([
  "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80",
]);
const REMOTE_FALLBACK_BASE_URL = "https://college-edwiser-backend-nz7v.onrender.com";
const LOCAL_FALLBACK_BASE_URL = "http://localhost:5000";
const shouldTryRemoteFallback =
  API_BASE_URL.includes("localhost:5000") || API_BASE_URL.includes("127.0.0.1:5000");
const shouldTryLocalFallback =
  process.env.NODE_ENV !== "production" &&
  !API_BASE_URL.includes("localhost:5000") &&
  !API_BASE_URL.includes("127.0.0.1:5000");

const toNumber = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const digits = String(value ?? "")
    .replace(/[^0-9.]/g, "")
    .trim();
  const parsed = Number(digits);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toList = (value: unknown) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }
  return String(value || "")
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
};

const fetchJson = async <T>(path: string) => {
  const fetchFrom = async (baseUrl: string) => {
    const response = await fetch(`${baseUrl}${path}`, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }
    return (await response.json()) as T;
  };

  try {
    return await fetchFrom(API_BASE_URL);
  } catch (error) {
    if (shouldTryLocalFallback) {
      try {
        return await fetchFrom(LOCAL_FALLBACK_BASE_URL);
      } catch {
        // fall through to remote fallback if configured
      }
    }
    if (!shouldTryRemoteFallback) throw error;
    return fetchFrom(REMOTE_FALLBACK_BASE_URL);
  }
};

type BackendCollege = {
  _id?: string;
  name?: string;
  university?: string;
  description?: string;
  establishedYear?: string | number;
  ownershipType?: string;
  country?: string;
  city?: string;
  district?: string;
  state?: string;
  address?: string;
  pincode?: string;
  image?: string;
  images?: string | string[];
  logo?: string;
  accreditation?: string;
  ranking?: string;
  placementRate?: number | string;
  hasHostel?: boolean;
  facilities?: string | string[];
  quotas?: string | string[];
  courseTags?: string | string[];
  isBestCollege?: boolean;
  reviews?: string;
  admissionProcess?: string;
  applicationMode?: string;
  website?: string;
  locationLink?: string;
  mapUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  alternatePhone?: string;
  awardsRecognitions?: string;
  brochurePdfUrl?: string;
  brochureUrl?: string;
  campusVideoUrl?: string;
  scholarships?: string;
  feesStructure?: Record<string, unknown>;
  placements?: Record<string, unknown>;
  highestPackage?: string | number;
  averagePackage?: string | number;
  companiesVisited?: string | number;
  hostelDetails?: Record<string, unknown>;
};

type BackendCourse = {
  id?: string;
  course?: string;
  duration?: string;
  semesterFees?: number | string;
  totalFees?: number | string;
  cutoff?: number | string;
  isTopCourse?: boolean;
  university?: string;
  college?: string;
  collegeId?: string;
  courseName?: string;
  courseType?: string;
  courseCategory?: string;
  degreeType?: string;
  stream?: string;
  specialization?: string;
  mode?: string;
  applicationFee?: number | string;
  intake?: number | string;
  description?: string;
  entranceExams?: Array<{
    examName?: string;
    cutoffScoreOrRank?: string;
    weightage?: string;
    paperOrSyllabus?: string;
    preparationNotes?: string;
  }>;
  minimumQualification?: string;
};

const mapCourses = (records: BackendCourse[]): Course[] =>
  records.map((item, index) => ({
    id: String(item.id || `course-${index}`),
    course: String(item.course || item.courseName || "Course"),
    duration: String(item.duration || "Not available"),
    semesterFees: toNumber(item.semesterFees),
    totalFees: toNumber(item.totalFees),
    cutoff: toNumber(item.cutoff),
    isTopCourse: Boolean(item.isTopCourse),
    university: String(item.university || ""),
    college: String(item.college || ""),
    collegeId: String(item.collegeId || ""),
    specialization: String(item.specialization || item.courseName || item.courseCategory || "General"),
    courseType: String(item.courseType || ""),
    courseCategory: String(item.courseCategory || "General"),
    degreeType: String(item.degreeType || ""),
    stream: String(item.stream || ""),
    mode: String(item.mode || ""),
    applicationFee: toNumber(item.applicationFee),
    intake: toNumber(item.intake),
    description: String(item.description || ""),
    minimumQualification: String(item.minimumQualification || ""),
    entranceExams: Array.isArray(item.entranceExams)
      ? item.entranceExams.map((exam) => ({
          examName: String(exam.examName || ""),
          cutoffScoreOrRank: String(exam.cutoffScoreOrRank || ""),
          weightage: String(exam.weightage || ""),
          paperOrSyllabus: String(exam.paperOrSyllabus || ""),
          preparationNotes: String(exam.preparationNotes || ""),
        }))
      : [],
    collegeDetails: [],
  }));

const getFallbackCollegeImage = (item: BackendCollege) => {
  const matchedCollege = fallbackColleges.find(
    (college) =>
      normalizeText(college.name) === normalizeText(String(item.name || "")) ||
      normalizeText(college.university) === normalizeText(String(item.university || "")),
  );

  return matchedCollege?.image || FALLBACK_IMAGE;
};

const mapColleges = (records: BackendCollege[], courseRows: Course[]): College[] =>
  records.map((item, index) => {
    const matchingCourseRows = courseRows.filter(
      (course) =>
        normalizeText(course.college) === normalizeText(String(item.name || "")) ||
        normalizeText(course.university) === normalizeText(String(item.university || "")),
    );

    const streams = [
      ...new Set(
        [
          ...toList(item.courseTags),
          ...matchingCourseRows.map((course) => course.courseCategory).filter(Boolean),
        ].map((value) => String(value).trim()),
      ),
    ].filter(Boolean);

    const resolvedImage = String(item.image || "").trim();

    const rawPlacements =
      item.placements && typeof item.placements === "object" ? item.placements : {};
    const highestPackage =
      (rawPlacements as Record<string, unknown>).highestPackage ?? item.highestPackage ?? "";
    const averagePackage =
      (rawPlacements as Record<string, unknown>).averagePackage ?? item.averagePackage ?? "";
    const companiesVisited =
      (rawPlacements as Record<string, unknown>).companiesVisited ?? item.companiesVisited ?? "";

    return {
      id: String(item._id || `college-${index}`),
      name: String(item.name || "College"),
      university: String(item.university || ""),
      description: String(item.description || "College information will appear here."),
      establishedYear: String(item.establishedYear || ""),
      ownershipType: String(item.ownershipType || ""),
      country: String(item.country || ""),
      district: String(item.district || ""),
      state: String(item.state || ""),
      city: String(item.city || ""),
      address: String(item.address || ""),
      pincode: String(item.pincode || ""),
      image:
        resolvedImage && !BROKEN_IMAGE_URLS.has(resolvedImage)
          ? resolvedImage
          : getFallbackCollegeImage(item),
      images: toList(item.images),
      logo: String(item.logo || ""),
      isBestCollege: Boolean(item.isBestCollege),
      accreditation: String(item.accreditation || "Not available"),
      ranking: String(item.ranking || "Not ranked"),
      placementRate: toNumber(item.placementRate),
      hasHostel: Boolean(item.hasHostel),
      facilities: toList(item.facilities),
      quotas: toList(item.quotas),
      streams: streams.length ? streams : ["General"],
      reviews: String(item.reviews || ""),
      admissionProcess: String(item.admissionProcess || ""),
      applicationMode: String(item.applicationMode || ""),
      website: String(item.website || ""),
      locationLink: String(item.locationLink || ""),
      mapUrl: String(item.mapUrl || ""),
      contactEmail: String(item.contactEmail || ""),
      contactPhone: String(item.contactPhone || ""),
      alternatePhone: String(item.alternatePhone || ""),
      awardsRecognitions: String(item.awardsRecognitions || ""),
      brochurePdfUrl: String(item.brochurePdfUrl || ""),
      brochureUrl: String(item.brochureUrl || ""),
      campusVideoUrl: String(item.campusVideoUrl || ""),
      scholarships: String(item.scholarships || ""),
      feesStructure:
        item.feesStructure && typeof item.feesStructure === "object" ? item.feesStructure : {},
      placements: {
        ...(rawPlacements as Record<string, unknown>),
        highestPackage,
        averagePackage,
        companiesVisited,
      },
      hostelDetails:
        item.hostelDetails && typeof item.hostelDetails === "object" ? item.hostelDetails : {},
    };
  });

export async function fetchPublicPanelData() {
  try {
    const [collegeData, courseData] = await Promise.all([
      fetchJson<{ colleges?: BackendCollege[] }>("/api/public/colleges"),
      fetchJson<{ courses?: BackendCourse[] }>("/api/public/courses"),
    ]);

    const mappedCourses = mapCourses(Array.isArray(courseData.courses) ? courseData.courses : []);
    const mappedColleges = mapColleges(
      Array.isArray(collegeData.colleges) ? collegeData.colleges : [],
      mappedCourses,
    );

    return {
      colleges: mappedColleges.length ? mappedColleges : fallbackColleges,
      courses: mappedCourses.length ? mappedCourses : fallbackCourses,
    };
  } catch {
    return {
      colleges: fallbackColleges,
      courses: fallbackCourses,
    };
  }
}
