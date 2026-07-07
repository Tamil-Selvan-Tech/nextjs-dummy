import { API_BASE_URL, LOCAL_API_BASE_URL, REMOTE_FALLBACK_BASE_URL } from "@/lib/api";
import { formatCutoffForSave, parseCutoffValue } from "@/lib/cutoff-utils";
import {
  colleges as fallbackColleges,
  courses as fallbackCourses,
  normalizeText,
  type College,
  type Course,
} from "@/lib/site-data";

const BROKEN_IMAGE_URLS = new Set([
  "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80",
]);
const shouldTryRemoteFallback =
  API_BASE_URL.includes("localhost:5000") || API_BASE_URL.includes("127.0.0.1:5000");
const shouldTryLocalFallback =
  process.env.NODE_ENV !== "production" &&
  !API_BASE_URL.includes("localhost:5000") &&
  !API_BASE_URL.includes("127.0.0.1:5000");
const PUBLIC_PANEL_CACHE_TTL_MS = 5 * 60 * 1000;

type CachedEntry<T> = {
  value: T;
  expiresAt: number;
};

const inFlightPublicRequests = new Map<string, Promise<unknown>>();
const memoryPublicCache = new Map<string, CachedEntry<unknown>>();

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

const stripTrailingZeroDecimal = (value: unknown) => {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  return raw.replace(/^(-?\d+)\.0+$/, "$1");
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

const splitMultilineValues = (value: unknown) =>
  String(value || "")
    .split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean);

const normalizeFieldKey = (value: unknown) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const standardCollegeFieldKeys = new Set(
  [
    "_id",
    "id",
    "collegeCode",
    "collegeId",
    "collegeName",
    "name",
    "description",
    "establishedYear",
    "ownershipType",
    "ownership",
    "ownership_type",
    "collegeType",
    "type",
    "university",
    "country",
    "state",
    "city",
    "district",
    "address",
    "pincode",
    "googleMapUrl",
    "locationLink",
    "mapUrl",
    "officialEmail",
    "contactEmail",
    "ownerEmail",
    "phoneNumber",
    "contactPhone",
    "phone",
    "alternatePhone",
    "websiteUrl",
    "website",
    "logoImage",
    "logo",
    "coverImage",
    "image",
    "images",
    "brochurePdf",
    "brochurePdfUrl",
    "brochureUrl",
    "campusVideo",
    "campusVideoUrl",
    "ranking",
    "rankingMin",
    "rankingMax",
    "accreditation",
    "awards",
    "awardsRecognitions",
    "reviews",
    "facilities",
    "quotas",
    "minFee",
    "maxFee",
    "feesStructure",
    "admissionProcess",
    "applicationMode",
    "scholarship",
    "scholarships",
    "placementPercentage",
    "placementRate",
    "averagePackage",
    "highestPackage",
    "companiesVisited",
    "placements",
    "hostelDetails",
    "hostelGeneralInfo",
    "hostelType",
    "hostelMinFee",
    "hostelMaxFee",
    "cctvAvailability",
    "hostelFacilities",
    "isBestCollege",
    "isTopCollege",
    "courseTags",
    "customFields",
    "__v",
    "createdAt",
    "updatedAt",
  ].map(normalizeFieldKey),
);

const parseStructuredPlacements = (value: unknown) => {
  const base = {
    highestPackage: "",
    placementRate: "",
    averagePackage: "",
    companiesVisited: "",
  };

  if (value && typeof value === "object" && !Array.isArray(value)) {
    const record = value as Record<string, unknown>;
    return {
      highestPackage: String(record.highestPackage ?? "").trim(),
      placementRate: String(record.placementRate ?? "").trim(),
      averagePackage: String(record.averagePackage ?? "").trim(),
      companiesVisited: String(record.companiesVisited ?? record.companyCount ?? "").trim(),
    };
  }

  const lines = splitMultilineValues(value);
  for (const line of lines) {
    const lower = line.toLowerCase();
    const valueText = line.split(/[:-]/).slice(1).join("-").trim();
    if (!valueText) continue;
    if (lower.includes("highest")) base.highestPackage = valueText;
    if (lower.includes("placement")) base.placementRate = valueText;
    if (lower.includes("average")) base.averagePackage = valueText;
    if (lower.includes("companies")) base.companiesVisited = valueText;
  }

  return base;
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

const fetchJson = async <T>(path: string, init: RequestInit = {}) => {
  const fetchFrom = async (baseUrl: string) => {
    const response = await fetch(`${baseUrl}${path}`, {
      cache: "no-store",
      ...init,
    });
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

const getCacheStorage = () => {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

const readCachedEntry = <T>(cacheKey: string): T | null => {
  const memoryEntry = memoryPublicCache.get(cacheKey) as CachedEntry<T> | undefined;
  if (memoryEntry && memoryEntry.expiresAt > Date.now()) {
    return memoryEntry.value;
  }

  if (memoryEntry) {
    memoryPublicCache.delete(cacheKey);
  }

  const storage = getCacheStorage();
  if (!storage) return null;

  try {
    const raw = storage.getItem(cacheKey);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as CachedEntry<T>;
    if (!parsed || typeof parsed.expiresAt !== "number" || parsed.expiresAt <= Date.now()) {
      storage.removeItem(cacheKey);
      return null;
    }

    memoryPublicCache.set(cacheKey, parsed);
    return parsed.value;
  } catch {
    return null;
  }
};

const writeCachedEntry = <T>(cacheKey: string, value: T, ttlMs: number) => {
  const entry: CachedEntry<T> = {
    value,
    expiresAt: Date.now() + ttlMs,
  };
  memoryPublicCache.set(cacheKey, entry);

  const storage = getCacheStorage();
  if (!storage) return;

  try {
    storage.setItem(cacheKey, JSON.stringify(entry));
  } catch {
    // Ignore storage quota / unavailable storage errors.
  }
};

const fetchJsonWithCache = async <T>(path: string, ttlMs = PUBLIC_PANEL_CACHE_TTL_MS) => {
  const cacheKey = `collegeedwiser:public-data:${path}`;
  const cached = readCachedEntry<T>(cacheKey);
  if (cached) {
    return cached;
  }

  const inFlight = inFlightPublicRequests.get(cacheKey);
  if (inFlight) {
    return inFlight as Promise<T>;
  }

  const promise = (async () => {
    const data = await fetchJson<T>(
      path,
      typeof window === "undefined" ? { cache: "force-cache" } : {},
    );
    writeCachedEntry(cacheKey, data, ttlMs);
    return data;
  })();

  inFlightPublicRequests.set(cacheKey, promise);

  try {
    return await promise;
  } finally {
    inFlightPublicRequests.delete(cacheKey);
  }
};

type BackendCollege = {
  _id?: string;
  collegeCode?: string;
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
  customFields?: Record<string, unknown>;
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
  collegeCode?: string;
  colleges?: Array<string | { _id?: string; name?: string; collegeCode?: string }>;
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
    college?: string;
    collegeId?: string;
    collegeCode?: string;
    courseName?: string;
    cutoffScoreOrRank?: string;
    cutoffByCategory?: Array<{
      category?: string;
      cutoff?: string;
    }>;
    weightage?: string;
    paperOrSyllabus?: string;
    preparationNotes?: string;
  }>;
  minimumQualification?: string;
  collegeDetails?: Array<{
    college?: string | { _id?: string; name?: string; collegeCode?: string };
    collegeId?: string;
    collegeCode?: string;
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

const getBackendCourseCollegeLinks = (item: BackendCourse) =>
  Array.isArray(item.colleges) ? item.colleges : [];

const getBackendCourseCollegeLinkValues = (item: BackendCourse) =>
  getBackendCourseCollegeLinks(item)
    .flatMap((college) =>
      typeof college === "string"
        ? [college]
        : [college?._id || "", college?.collegeCode || "", college?.name || ""],
    )
    .map((value) => String(value || "").trim())
    .filter(Boolean);

const getCourseCollegeIdentityValues = (course: Course) =>
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
    .map((value) => String(value || "").trim())
    .filter(Boolean);

const buildCourseCollegeIdentityIndex = (courseRows: Course[]) => {
  const index = new Map<string, Course[]>();

  courseRows.forEach((course) => {
    const seenKeys = new Set<string>();
    getCourseCollegeIdentityValues(course).forEach((value) => {
      const key = normalizeText(value);
      if (!key || seenKeys.has(key)) return;
      seenKeys.add(key);

      const existing = index.get(key);
      if (existing) {
        existing.push(course);
      } else {
        index.set(key, [course]);
      }
    });
  });

  return index;
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
      isTopExam?: boolean;
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
  isTopExam: boolean;
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
          isTopExam: Boolean(item?.isTopExam),
          resultDate: String(item?.resultDate || "").trim(),
          updatedAt: String(item?.updatedAt || "").trim(),
        }))
        .filter((item) => item.examName)
    : [];

const mapCourses = (records: BackendCourse[]): Course[] => {
  const mappedCourses = records.map((item, index) => {
    const cutoffByCategory = mapCutoffByCategory(item.cutoffByCategory);
    const linkedCollegeValues = getBackendCourseCollegeLinkValues(item);
    const firstLinkedCollege = getBackendCourseCollegeLinks(item)[0];
    const linkedCollegeId =
      typeof firstLinkedCollege === "string"
        ? firstLinkedCollege
        : String(firstLinkedCollege?._id || "").trim();
    const linkedCollegeCode =
      typeof firstLinkedCollege === "string"
        ? ""
        : String(firstLinkedCollege?.collegeCode || "").trim();
    const linkedCollegeName =
      typeof firstLinkedCollege === "string"
        ? ""
        : String(firstLinkedCollege?.name || "").trim();

    const collegeDetails = Array.isArray(item.collegeDetails)
      ? item.collegeDetails
          .map((detail) => {
            const rawCollege = detail?.college;
            const resolvedCollege =
              typeof rawCollege === "string"
                ? rawCollege
                : String(rawCollege?.name || rawCollege?._id || "").trim();
            const resolvedCollegeId =
              typeof rawCollege === "string"
                ? rawCollege
                : String(rawCollege?._id || "").trim();

            return {
              college: resolvedCollege,
              collegeId: String(detail.collegeId || resolvedCollegeId || "").trim(),
              collegeCode: String(
                detail.collegeCode ||
                  (typeof rawCollege === "string" ? "" : rawCollege?.collegeCode) ||
                  item.collegeCode ||
                  "",
              ).trim(),
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
      duration: String(item.duration || "").trim(),
      semesterFees: toNumber(item.semesterFees),
      totalFees: toNumber(item.totalFees),
      cutoff: toNumber(item.cutoff),
      cutoffText: toCutoffText(item.cutoff),
      cutoffByCategory,
      isTopCourse: Boolean(item.isTopCourse),
      university: String(item.university || ""),
      college: String(item.college || linkedCollegeName || linkedCollegeValues[0] || ""),
      collegeId: String(item.collegeId || linkedCollegeId || ""),
      collegeCode: String(item.collegeCode || linkedCollegeCode || collegeDetails[0]?.collegeCode || ""),
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
            college: String(exam.college || ""),
            collegeId: String(exam.collegeId || ""),
            collegeCode: String(exam.collegeCode || ""),
            courseName: String(exam.courseName || ""),
            cutoffScoreOrRank: String(exam.cutoffScoreOrRank || ""),
            cutoffByCategory: mapCutoffByCategory(exam.cutoffByCategory),
            weightage: String(exam.weightage || ""),
            paperOrSyllabus: String(exam.paperOrSyllabus || ""),
            preparationNotes: String(exam.preparationNotes || ""),
          }))
        : [],
      collegeDetails,
    };
  });

  const seenCourseSignatures = new Set<string>();

  return mappedCourses.filter((course) => {
    const signature = [
      normalizeText(course.collegeId),
      normalizeText(course.collegeCode),
      normalizeText(course.course),
      normalizeText(course.college),
      normalizeText(course.university),
      normalizeText(course.specialization),
      normalizeText(course.duration),
      normalizeText(course.courseCategory),
      normalizeText(course.courseType),
      normalizeText(course.stream),
      ...getCourseCollegeIdentityValues(course).map((value) => normalizeText(value)),
      String(course.totalFees || 0),
      String(course.cutoff || 0),
    ].join("|");

    if (seenCourseSignatures.has(signature)) {
      return false;
    }

    seenCourseSignatures.add(signature);
    return true;
  });
};

const mapColleges = (records: BackendCollege[], courseRows: Course[]): College[] =>
  {
    const courseIdentityIndex = buildCourseCollegeIdentityIndex(courseRows);

    return records.map((item, index) => {
    const collegeIdentityValues = [
      String(item._id || "").trim(),
      String(item.collegeCode || "").trim(),
      String(item.name || "").trim(),
    ].filter(Boolean);
    const normalizedCollegeIdentityValues = [...new Set(
      collegeIdentityValues.map((value) => normalizeText(value)).filter(Boolean),
    )];
    const matchingCourseRows = (() => {
      const matched = new Map<string, Course>();

      normalizedCollegeIdentityValues.forEach((key) => {
        const linkedCourses = courseIdentityIndex.get(key);
        if (!linkedCourses) return;

        linkedCourses.forEach((course) => {
          matched.set(course.id, course);
        });
      });

      return [...matched.values()];
    })();

    const streams = [
      ...new Set(
        [
          ...toList(item.courseTags),
          ...matchingCourseRows.map((course) => course.courseCategory).filter(Boolean),
        ].map((value) => String(value).trim()),
      ),
    ].filter(Boolean);

    const resolvedImage = String(item.image || "").trim();

    const hasPlacementsSource = item.placements !== undefined && item.placements !== null;
    const parsedPlacements = parseStructuredPlacements(item.placements);
    const highestPackage = parsedPlacements.highestPackage || String(item.highestPackage ?? "").trim();
    const averagePackage = parsedPlacements.averagePackage || String(item.averagePackage ?? "").trim();
    const companiesVisited =
      parsedPlacements.companiesVisited || String(item.companiesVisited ?? "").trim();
    const placementRate = hasPlacementsSource
      ? parsedPlacements.placementRate
      : String(item.placementRate ?? "").trim();
    const rawHostelDetails =
      item.hostelDetails && typeof item.hostelDetails === "object" ? item.hostelDetails : {};
    const campusHighlights =
      item.customFields && typeof item.customFields === "object" && !Array.isArray(item.customFields)
        ? Object.entries(item.customFields)
            .filter(([label]) => !standardCollegeFieldKeys.has(normalizeFieldKey(label)))
            .map(([label, value]) => ({
              label: String(label || "").trim(),
              value: String(value ?? "").trim(),
            }))
            .filter((entry) => entry.label && entry.value)
        : [];
    const hasHostel =
      Boolean(item.hasHostel) ||
      String((rawHostelDetails as Record<string, unknown>).availability || "")
        .trim()
        .toLowerCase() === "available";

    return {
      id: String(item._id || `college-${index}`),
      collegeCode: String(item.collegeCode || ""),
      name: String(item.name || "College"),
      university: String(item.university || ""),
      description: String(item.description || "College information will appear here."),
      establishedYear: stripTrailingZeroDecimal(item.establishedYear),
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
          : "",
      images: toList(item.images),
      logo: String(item.logo || ""),
      isBestCollege: Boolean(item.isBestCollege || item.isTopCollege),
      isTopCollege: Boolean(item.isTopCollege || item.isBestCollege),
      accreditation: String(item.accreditation || "").trim(),
      ranking: String(item.ranking || "Not ranked"),
      placementRate: toNumber(placementRate),
      hasHostel,
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
        ...(item.placements && typeof item.placements === "object" && !Array.isArray(item.placements)
          ? (item.placements as Record<string, unknown>)
          : {}),
        highestPackage,
        placementRate,
        averagePackage,
        companiesVisited,
      },
      hostelDetails: rawHostelDetails,
      campusHighlights,
    };
    });
  };

type PublicPanelData = {
  colleges: College[];
  courses: Course[];
  homeHeroImageUrl: string;
  examSchedules: PublicExamSchedule[];
};

const fetchPublicPanelDataImpl = async (
  options: { forceRefresh?: boolean } = {},
  querySuffix = "",
): Promise<PublicPanelData> => {
  try {
    const coursesQuerySuffix = querySuffix ? querySuffix.replace(/^\?/, "&") : "";
    const shouldUseCachedFetch =
      !options.forceRefresh &&
      !(querySuffix && typeof window === "undefined");
    const fetcher = shouldUseCachedFetch ? fetchJsonWithCache : fetchJson;
    const [collegeData, courseData, siteSettingsData] = await Promise.all([
      fetcher<{ colleges?: BackendCollege[] }>(`/api/public/colleges${querySuffix}`),
      fetcher<{ courses?: BackendCourse[] }>(`/api/public/courses?raw=1${coursesQuerySuffix}`),
      fetcher<BackendSiteSettings>("/api/public/site-settings"),
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
};

export async function fetchPublicPanelData(options: { forceRefresh?: boolean } = {}) {
  return fetchPublicPanelDataImpl(options);
}

export async function fetchPublicSummaryData(options: { forceRefresh?: boolean } = {}) {
  return fetchPublicPanelDataImpl(options, "?summary=1");
}

export async function fetchPublicExamSchedules() {
  try {
    const siteSettingsData = await fetchJsonWithCache<BackendSiteSettings>("/api/public/site-settings");
    return mapExamSchedules(siteSettingsData);
  } catch {
    return [];
  }
}
