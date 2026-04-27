import { API_BASE_URL, LOCAL_API_BASE_URL, REMOTE_FALLBACK_BASE_URL } from "@/lib/api";
import { formatCutoffForSave, parseCutoffValue } from "@/lib/cutoff-utils";
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
const shouldTryRemoteFallback =
  API_BASE_URL.includes("localhost:5000") || API_BASE_URL.includes("127.0.0.1:5000");
const shouldTryLocalFallback =
  process.env.NODE_ENV !== "production" &&
  !API_BASE_URL.includes("localhost:5000") &&
  !API_BASE_URL.includes("127.0.0.1:5000");

const toNumber = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const raw = String(value ?? "").trim();
  if (!raw) return 0;
  const parsedRange = parseCutoffValue(raw);
  if (parsedRange) return parsedRange.start;
  const digits = raw.replace(/[^0-9.]/g, "").trim();
  const parsed = Number(digits);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toCutoffText = (value: unknown) => {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  const normalized = formatCutoffForSave(raw);
  if (!normalized || !normalized.includes("-")) return "";
  return normalized;
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

const normalizeCutoffCategory = (value: unknown) => {
  const normalized = normalizeText(String(value || "")).replace(/[^a-z0-9]/g, "");
  if (!normalized) return "";
  if (normalized === "oc" || normalized === "general" || normalized === "open" || normalized === "opencompetition" || normalized === "ews") {
    return "OC";
  }
  if (normalized === "bc" || normalized === "obc" || normalized === "backwardclass") {
    return "BC";
  }
  if (normalized === "bcm" || normalized === "backwardclassmuslim") {
    return "BCM";
  }
  if (normalized === "mbc" || normalized === "dnc" || normalized === "mbcdnc" || normalized === "mostbackwardclass" || normalized === "denotifiedcommunity") {
    return "MBC";
  }
  if (normalized === "sca" || normalized === "scheduledcastearunthathiyar") {
    return "SCA";
  }
  if (normalized === "sc" || normalized === "scheduledcaste") {
    return "SC";
  }
  if (normalized === "st" || normalized === "scheduledtribe") {
    return "ST";
  }
  return String(value || "").trim().toUpperCase();
};

const mapCutoffByCategory = (
  entries: Array<{ category?: string; cutoff?: string }> | undefined,
) =>
  Array.isArray(entries)
    ? entries
        .map((entry) => ({
          category: normalizeCutoffCategory(entry.category),
          cutoff: String(entry.cutoff || "").trim(),
        }))
        .filter((entry) => entry.category && entry.cutoff)
    : [];

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
        return await fetchFrom(LOCAL_API_BASE_URL);
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
  ownership?: string;
  ownership_type?: string;
  collegeType?: string;
  type?: string;
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
  isTopCollege?: boolean;
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
  cutoffByCategory?: Array<{
    category?: string;
    cutoff?: string;
  }>;
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
  collegeDetails?: Array<{
    college?: string | { _id?: string; name?: string };
    semesterFees?: number | string;
    totalFees?: number | string;
    hostelFees?: number | string;
    cutoff?: number | string;
    cutoffByCategory?: Array<{
      category?: string;
      cutoff?: string;
    }>;
    intake?: number | string;
    applicationFee?: number | string;
  }>;
};

type BackendSiteSettings = {
  settings?: {
    homeHeroImageUrl?: string;
    examSchedules?: Array<{
      id?: string;
      examName?: string;
      applicationFees?: string;
      startDateToApply?: string;
      lastDateToApply?: string;
      correctionDate?: string;
      lastDateForFeePayment?: string;
      admitCardRelease?: string;
      examDate?: string;
      resultDate?: string;
      updatedAt?: string;
    }>;
  };
};

export type PublicExamSchedule = {
  id: string;
  examName: string;
  applicationFees: string;
  startDateToApply: string;
  lastDateToApply: string;
  correctionDate: string;
  lastDateForFeePayment: string;
  admitCardRelease: string;
  examDate: string;
  resultDate: string;
  updatedAt: string;
};

const mapExamSchedules = (siteSettingsData?: BackendSiteSettings): PublicExamSchedule[] =>
  Array.isArray(siteSettingsData?.settings?.examSchedules)
    ? siteSettingsData.settings.examSchedules
        .map((item, index) => ({
          id: String(item?.id || `${index}`),
          examName: String(item?.examName || "").trim(),
          applicationFees: String(item?.applicationFees || "").trim(),
          startDateToApply: String(item?.startDateToApply || "").trim(),
          lastDateToApply: String(item?.lastDateToApply || "").trim(),
          correctionDate: String(item?.correctionDate || "").trim(),
          lastDateForFeePayment: String(item?.lastDateForFeePayment || "").trim(),
          admitCardRelease: String(item?.admitCardRelease || "").trim(),
          examDate: String(item?.examDate || "").trim(),
          resultDate: String(item?.resultDate || "").trim(),
          updatedAt: String(item?.updatedAt || "").trim(),
        }))
        .filter((item) => item.examName)
    : [];

const mapCourses = (records: BackendCourse[]): Course[] =>
  records.map((item, index) => {
    const cutoffByCategory = mapCutoffByCategory(item.cutoffByCategory);

    const collegeDetails = Array.isArray(item.collegeDetails)
      ? item.collegeDetails
          .map((detail) => {
            const rawCollege = detail?.college;
            const resolvedCollege =
              typeof rawCollege === "string"
                ? rawCollege
                : String(rawCollege?.name || rawCollege?._id || "").trim();

            return {
              college: resolvedCollege,
              semesterFees: toNumber(detail.semesterFees),
              totalFees: toNumber(detail.totalFees),
              hostelFees: toNumber(detail.hostelFees),
              cutoff: toNumber(detail.cutoff),
              cutoffText: toCutoffText(detail.cutoff),
              cutoffByCategory: mapCutoffByCategory(detail.cutoffByCategory),
              intake: toNumber(detail.intake),
              applicationFee: toNumber(detail.applicationFee),
            };
          })
          .filter((detail) => detail.college)
      : [];

    return {
      id: String(item.id || `course-${index}`),
      course: String(item.course || item.courseName || "Course"),
      duration: String(item.duration || "Not available"),
      semesterFees: toNumber(item.semesterFees),
      totalFees: toNumber(item.totalFees),
      cutoff: toNumber(item.cutoff),
      cutoffText: toCutoffText(item.cutoff),
      cutoffByCategory,
      isTopCourse: Boolean(item.isTopCourse),
      university: String(item.university || ""),
      college: String(item.college || ""),
      collegeId: String(item.collegeId || ""),
      specialization: String(
        item.specialization || item.courseName || item.courseCategory || "General",
      ),
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
      collegeDetails,
    };
  });

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
      ownershipType: String(
        item.ownershipType ||
          item.ownership ||
          item.ownership_type ||
          item.collegeType ||
          item.type ||
          "",
      ),
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
      isBestCollege: Boolean(item.isBestCollege || item.isTopCollege),
      isTopCollege: Boolean(item.isTopCollege || item.isBestCollege),
      accreditation: String(item.accreditation || "Not available"),
      ranking: String(item.ranking || "Not ranked"),
      placementRate: toNumber(item.placementRate),
      hasHostel: Boolean(item.hasHostel),
      facilities: toList(item.facilities),
      quotas: toList(item.quotas),
      courseTags: toList(item.courseTags),
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
    const [collegeData, courseData, siteSettingsData] = await Promise.all([
      fetchJson<{ colleges?: BackendCollege[] }>("/api/public/colleges"),
      fetchJson<{ courses?: BackendCourse[] }>("/api/public/courses"),
      fetchJson<BackendSiteSettings>("/api/public/site-settings"),
    ]);

    const mappedCourses = mapCourses(Array.isArray(courseData.courses) ? courseData.courses : []);
    const mappedColleges = mapColleges(
      Array.isArray(collegeData.colleges) ? collegeData.colleges : [],
      mappedCourses,
    );

    return {
      colleges: mappedColleges.length ? mappedColleges : fallbackColleges,
      courses: mappedCourses.length ? mappedCourses : fallbackCourses,
      homeHeroImageUrl: String(siteSettingsData?.settings?.homeHeroImageUrl || "").trim(),
      examSchedules: mapExamSchedules(siteSettingsData),
    };
  } catch {
    return {
      colleges: fallbackColleges,
      courses: fallbackCourses,
      homeHeroImageUrl: "",
      examSchedules: [],
    };
  }
}

export async function fetchPublicExamSchedules() {
  try {
    const siteSettingsData = await fetchJson<BackendSiteSettings>("/api/public/site-settings");
    return mapExamSchedules(siteSettingsData);
  } catch {
    return [];
  }
}
