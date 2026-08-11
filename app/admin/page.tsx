"use client";

import { strFromU8, strToU8, unzipSync, zipSync } from "@/lib/vendor/fflate-browser";
import { createPortal } from "react-dom";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  BadgeCheck,
  Bell,
  BookOpen,
  Building2,
  ChevronDown,
  ChevronRight,
  Download,
  ExternalLink,
  FileClock,
  Filter,
  ImageUp,
  KeyRound,
  LayoutDashboard,
  Mail,
  MailOpen,
  MapPin,
  PencilLine,
  Plus,
  Search,
  TriangleAlert,
  Trash2,
  UserRound,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AdminPortalShell } from "@/components/admin-portal-shell";
import { AdminCutoffQuestions } from "@/components/admin-cutoff-questions";
import { CollegeLogoBadge } from "@/components/college-logo-badge";
import { ResponsiveTableWrapper } from "@/components/responsive-table-wrapper";
import {
  clearAuth,
  readAuthToken,
  readCurrentUser,
  type SafeAuthUser,
} from "@/lib/auth-storage";
import { API_BASE_URL, request, withAuth } from "@/lib/api";
import {
  COLLEGE_ACCREDITATION_OPTIONS,
  INDIA_STATE_DISTRICT_MAP,
  INDIA_STATES,
} from "@/lib/india-location-data";
import {
  formatCutoffForSave,
  isValidCutoffValue,
  normalizeCutoffInput,
  parseCutoffValue,
} from "@/lib/cutoff-utils";
import { normalizeScientificIntegerText } from "@/lib/integer-text";
import {
  formatRankingRangeForDisplay,
  formatRankingRangeForSave,
  isValidRankingRange,
  parseRankingRange,
  normalizeRankingRangeInput,
} from "@/lib/ranking-utils";
import {
  formatCompactIndianCurrency,
  formatCompactIndianCurrencyRange,
} from "@/lib/currency-format";
import { showToast } from "@/lib/toast";
import { Loading } from "@/components/loading";
const AdminCollegesCoursesSection = dynamic(
  () => import("@/components/admin-colleges-courses-section"),
  { ssr: false, loading: () => <Loading fullScreen={false} /> },
);
const AdminOverviewSection = dynamic(
  () => import("@/components/admin-overview-section").then((module) => module.AdminOverviewSection),
  { ssr: false, loading: () => <Loading fullScreen={false} /> },
);
const BulkUploadDashboard = dynamic(
  () => import("@/components/admin-bulk-upload-dashboard"),
  { ssr: false, loading: () => <Loading fullScreen={false} /> },
);

type AdminUser = SafeAuthUser & { isSuperAdmin?: boolean; permissions?: string[] };
type CategoryCutoff = { category?: string; cutoff?: string };
type AdminCollege = { _id: string; collegeCode?: string; name?: string; establishedYear?: string | number; ownershipType?: string; university?: string; country?: string; state?: string; city?: string; district?: string; address?: string; pincode?: string; description?: string; reviews?: string; admissionProcess?: string; applicationMode?: string; locationLink?: string; mapUrl?: string; website?: string; contactEmail?: string; ownerEmail?: string; alternatePhone?: string; contactPhone?: string; phone?: string; accreditation?: string; awardsRecognitions?: string; quotas?: string[] | string; brochurePdfUrl?: string; brochureUrl?: string; campusVideoUrl?: string; isBestCollege?: boolean; isTopCollege?: boolean; logo?: string; images?: string[]; image?: string; ranking?: string | number; placementRate?: string | number; lastDashboardEditAt?: string; feesStructure?: Record<string, unknown>; courseTags?: string; facilities?: string[] | string; scholarships?: string; placements?: { highestPackage?: string | number; averagePackage?: string | number; companiesVisited?: string | number; placementRate?: string | number }; hostelDetails?: { availability?: string; hostelType?: string; cctvAvailable?: string; boysRoomsCount?: string | number; girlsRoomsCount?: string | number; facilityOptions?: string[]; waterAvailability?: string; powerBackup?: string; internet?: { wifiAvailable?: string; speed?: string; pricing?: string }; foodAvailability?: string; foodTimings?: string; laundryService?: string; roomCleaningFrequency?: string; rules?: string; hostelFees?: { minAmount?: string | number; maxAmount?: string | number } } };
type AdminCourseExam = { examName?: string; cutoffScoreOrRank?: string; cutoffByCategory?: CategoryCutoff[]; cutoffCategory?: string; weightage?: string; paperOrSyllabus?: string; preparationNotes?: string };
type AdminCourse = { _id: string; course?: string; courseName?: string; courseType?: string; courseCategory?: string; degreeType?: string; stream?: string; specialization?: string; duration?: string; mode?: string; lateralEntryAvailable?: boolean; lateralEntryDetails?: string; minimumQualification?: string; admissionProcess?: string; applicationFee?: string | number; intake?: string | number; hostelFees?: string | number; university?: string; college?: string; collegeId?: string; collegeCode?: string; cutoff?: string | number; cutoffByCategory?: CategoryCutoff[]; description?: string; isTopCourse?: boolean; entranceExams?: AdminCourseExam[]; colleges?: Array<string | { _id?: string; name?: string; collegeCode?: string }>; collegeDetails?: Array<{ college?: string | { _id?: string; name?: string; collegeCode?: string }; collegeId?: string; collegeCode?: string; semesterFees?: number; totalFees?: number; hostelFees?: number; cutoff?: string; cutoffByCategory?: CategoryCutoff[]; intake?: number; applicationFee?: number }> };
type PlatformUser = { _id: string; name?: string; email?: string; phone?: string; role?: string; createdAt?: string };
type Enquiry = { _id: string; name?: string; email?: string; collegeName?: string; courseName?: string; message?: string; createdAt?: string; user?: { name?: string; email?: string } };
type ChangeSummaryItem = { field?: string; label?: string; before?: unknown; after?: unknown };
type RequestItem = { _id: string; requesterName?: string; requesterEmail?: string; email?: string; phone?: string; message?: string; status?: string; updatedAt?: string; createdAt?: string; actionType?: string; payload?: { name?: string; course?: string; courseName?: string; duration?: string; logo?: string; image?: string; coverImage?: string; logoImage?: string }; submittedPayload?: Record<string, unknown> | null; changeSummary?: ChangeSummaryItem[]; formAccessUsedAt?: string; grantedCollegeIds?: string[]; allowOwnCollegeCreate?: boolean };
type SubAdmin = { _id: string; email?: string; permissions?: string[]; mustResetPassword?: boolean; createdAt?: string };
type AdminState = { colleges: AdminCollege[]; courses: AdminCourse[]; users: PlatformUser[]; enquiries: Enquiry[]; collegeRequests: RequestItem[]; subAdmins: SubAdmin[] };
type SiteSettings = { homeHeroImageUrl?: string; examSchedules?: SavedExamSchedule[] };
type CollegeForm = { name: string; establishedYear: string; ownershipType: string; university: string; country: string; state: string; city: string; district: string; address: string; pincode: string; description: string; reviews: string; admissionProcess: string; applicationMode: string; ranking: string; placementRate: string; feeMin: string; feeMax: string; locationLink: string; website: string; contactEmail: string; contactPhone: string; alternatePhone: string; accreditation: string; awardsRecognitions: string; brochurePdfUrl: string; campusVideoUrl: string; isTopCollege: boolean; isBestCollege: boolean; logo: string; coverImage: string; images: string[]; courseTags: string; facilities: string; scholarships: string; highestPackage: string; averagePackage: string; companiesVisited: string; quotas: string; hostelAvailability: string; hostelType: string; hostelFeeMin: string; hostelFeeMax: string; cctvAvailable: string; boysRoomsCount: string; girlsRoomsCount: string; hostelFacilityOptions: string; waterAvailability: string; powerBackup: string; wifiAvailable: string; wifiSpeed: string; wifiPricing: string; foodAvailability: string; foodTimings: string; laundryService: string; roomCleaningFrequency: string; hostelRules: string };
type CourseExamForm = { examName: string; cutoffScoreOrRank: string; cutoffByCategory: CategoryCutoff[]; cutoffCategory: string; cutoffValue: string; weightage: string; paperOrSyllabus: string; preparationNotes: string };
type CourseCollegeDetailForm = { semesterFees: string; totalFees: string; cutoff: string; intake: string; applicationFee: string };
type CourseForm = { courseType: string; degreeType: string; stream: string; specialization: string; duration: string; mode: string; lateralEntryAvailable: boolean; lateralEntryDetails: string; minimumQualification: string; university: string; admissionProcess: string; description: string; isTopCourse: boolean; entranceExamsEnabled: boolean; entranceExams: CourseExamForm[]; colleges: string[]; details: Record<string, CourseCollegeDetailForm> };
type SubAdminForm = { email: string; password: string; permissions: string[] };
type ExamScheduleForm = { examName: string; applicationFees: string; startDateToApply: string; lastDateToApply: string; correctionDate: string; lastDateForFeePayment: string; admitCardRelease: string; examDate: string; isTopExam: boolean; resultDate: string };
type SavedExamSchedule = ExamScheduleForm & { id: string; updatedAt: string };
type EmbeddedCourseDraft = { id?: string; courseType: string; degreeType: string; stream: string; specialization: string; duration: string; mode: string; lateralEntryAvailable: boolean; lateralEntryDetails: string; minimumQualification: string; university: string; admissionProcess: string; description: string; isTopCourse: boolean; entranceExamsEnabled: boolean; semesterFees: string; totalFees: string; cutoff: string; cutoffByCategory: CategoryCutoff[]; cutoffCategory: string; cutoffValue: string; intake: string; applicationFee: string; entranceExams: CourseExamForm[] };
type CollegeValidation = { valid: boolean; step: number; field: string; message: string };
type CourseCatalogItem = { stream: string; courseType: string; specialization: string; degreeType: string };
type CourseOption = { value: string; label: string };
type CutoffRangeConfig = { max: number; scaleLabel: string; contextLabel: string };
type DeleteCollegeDialogState = {
  id: string;
  name: string;
  top: number;
  left: number;
  width: number;
  placement: "top" | "bottom";
} | null;
type DeleteUserDialogState = {
  id: string;
  name: string;
  email: string;
} | null;
type DeleteEnquiryDialogState = {
  id: string;
  name: string;
  email: string;
} | null;
type DeleteSubAdminDialogState = {
  id: string;
  email: string;
} | null;
type DeleteExamDialogState = {
  id: string;
  name: string;
} | null;

const MAX_BULK_IMAGE_ZIP_SIZE_BYTES = 100 * 1024 * 1024;
const MAX_BULK_COLLEGE_ROWS = 100;
const EXAM_SCHEDULES_PER_PAGE = 5;
const getBulkCollegeLimitMessage = () =>
  `You can upload up to ${MAX_BULK_COLLEGE_ROWS} colleges at a time. Please split larger files and try again.`;
const getBulkZipLimitMessage = () =>
  "ZIP file must be 100MB or less. Please upload a smaller ZIP file.";

const emptyState: AdminState = { colleges: [], courses: [], users: [], enquiries: [], collegeRequests: [], subAdmins: [] };
const normalizeAdminIdentityValue = (value: unknown) => String(value || "").trim().toLowerCase();
const getAdminCourseCollegeIdentityValues = (course: AdminCourse) =>
  [
    course.collegeId || "",
    course.collegeCode || "",
    course.college || "",
    ...(course.colleges || []).flatMap((item) =>
      typeof item === "string"
        ? [item]
        : [item?._id || "", item?.collegeCode || "", item?.name || ""],
    ),
    ...(course.collegeDetails || []).flatMap((detail) => {
      const detailCollege = detail.college;
      return typeof detailCollege === "string"
        ? [detailCollege, detail.collegeId || "", detail.collegeCode || ""]
        : [detailCollege?._id || "", detail.collegeId || "", detailCollege?.collegeCode || "", detailCollege?.name || "", detail.collegeCode || ""];
    }),
  ]
    .map(normalizeAdminIdentityValue)
    .filter(Boolean);
const getAdminCollegeIdentityValues = (college: Pick<AdminCollege, "_id" | "collegeCode" | "name">) =>
  [college._id, college.collegeCode || "", college.name || ""]
    .map(normalizeAdminIdentityValue)
    .filter(Boolean);
const doesAdminCourseBelongToCollege = (
  course: AdminCourse,
  college: Pick<AdminCollege, "_id" | "collegeCode" | "name">,
) => {
  const collegeIdentityValues = new Set(getAdminCollegeIdentityValues(college));
  return getAdminCourseCollegeIdentityValues(course).some((value) => collegeIdentityValues.has(value));
};
const emptyCollegeForm: CollegeForm = { name: "", establishedYear: "", ownershipType: "", university: "", country: "India", state: "", city: "", district: "", address: "", pincode: "", description: "", reviews: "", admissionProcess: "", applicationMode: "", ranking: "", placementRate: "", feeMin: "", feeMax: "", locationLink: "", website: "", contactEmail: "", contactPhone: "", alternatePhone: "", accreditation: "", awardsRecognitions: "", brochurePdfUrl: "", campusVideoUrl: "", isTopCollege: false, isBestCollege: false, logo: "", coverImage: "", images: [], courseTags: "", facilities: "", scholarships: "", highestPackage: "", averagePackage: "", companiesVisited: "", hostelAvailability: "not_available", hostelType: "", hostelFeeMin: "", hostelFeeMax: "", cctvAvailable: "", boysRoomsCount: "", girlsRoomsCount: "", hostelFacilityOptions: "", waterAvailability: "", powerBackup: "", wifiAvailable: "", wifiSpeed: "", wifiPricing: "", foodAvailability: "not_available", foodTimings: "", laundryService: "", roomCleaningFrequency: "", hostelRules: "", quotas: "" };
const emptyCourseExam = (): CourseExamForm => ({ examName: "", cutoffScoreOrRank: "", cutoffByCategory: [], cutoffCategory: "OC", cutoffValue: "", weightage: "", paperOrSyllabus: "", preparationNotes: "" });
const cutoffCategoryOptions = [
  { value: "OC", label: "OC / General" },
  { value: "BC", label: "BC" },
  { value: "BCM", label: "BCM" },
  { value: "MBC", label: "MBC / DNC" },
  { value: "SC", label: "SC" },
  { value: "SCA", label: "SCA" },
  { value: "ST", label: "ST" },
];
const defaultCutoffCategory = cutoffCategoryOptions[0]?.value || "OC";
const cutoffValidationMessage = "Enter cutoff like 190, 190.5, or a range like 190-195. Each value must be between 0 and 9999.";
const normalizeCutoffSideInput = (value: string) =>
  normalizeCutoffInput(
    String(value || "")
      .replace(/[\u2013\u2014]/g, "-")
      .replace(/-/g, ""),
  );
const getCutoffRangeParts = (value: string | number | null | undefined) => {
  const raw = String(value || "").replace(/[\u2013\u2014]/g, "-");
  if (!raw.includes("-")) {
    return { start: normalizeCutoffSideInput(raw), end: "" };
  }

  const [start = "", ...rest] = raw.split("-");
  return {
    start: normalizeCutoffSideInput(start),
    end: normalizeCutoffSideInput(rest.join("-")),
  };
};
const buildCutoffRangeValue = (start: string, end: string) => {
  const normalizedStart = normalizeCutoffSideInput(start);
  const normalizedEnd = normalizeCutoffSideInput(end);

  if (!normalizedStart && !normalizedEnd) return "";
  return `${normalizedStart}-${normalizedEnd}`;
};
const normalizeCategoryCutoffs = (value: unknown): CategoryCutoff[] => {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  return value
    .map((item) => ({
      category: String((item as CategoryCutoff)?.category || "").trim().toUpperCase(),
      cutoff: String((item as CategoryCutoff)?.cutoff || "").trim(),
    }))
    .filter((item) => {
      if (!item.category || !item.cutoff || seen.has(item.category)) {
        return false;
      }
      seen.add(item.category);
      return true;
    })
    .sort((left, right) => {
      const leftIndex = cutoffCategoryOptions.findIndex((item) => item.value === left.category);
      const rightIndex = cutoffCategoryOptions.findIndex((item) => item.value === right.category);
      const normalizedLeft = leftIndex === -1 ? Number.MAX_SAFE_INTEGER : leftIndex;
      const normalizedRight = rightIndex === -1 ? Number.MAX_SAFE_INTEGER : rightIndex;
      if (normalizedLeft !== normalizedRight) return normalizedLeft - normalizedRight;
      return left.category.localeCompare(right.category);
    });
};
const resolvePrimaryCategoryCutoff = (
  cutoffByCategory: CategoryCutoff[],
  fallback: string | number | undefined = "",
) =>
  normalizeCategoryCutoffs(cutoffByCategory).find((item) => item.category === defaultCutoffCategory)?.cutoff ||
  normalizeCategoryCutoffs(cutoffByCategory)[0]?.cutoff ||
  formatCutoffForSave(fallback);
const normalizeCategoryCutoffsWithFallback = (
  cutoffByCategory: unknown,
  fallbackCutoff: string | number | undefined = "",
  fallbackCategory: string = defaultCutoffCategory,
) => {
  const normalizedCutoffs = normalizeCategoryCutoffs(cutoffByCategory);
  if (normalizedCutoffs.length > 0) return normalizedCutoffs;

  const normalizedFallbackCutoff = String(fallbackCutoff || "").trim();
  const normalizedFallbackCategory = String(fallbackCategory || defaultCutoffCategory).trim().toUpperCase();
  if (!normalizedFallbackCutoff || !normalizedFallbackCategory) {
    return [];
  }

  return [{ category: normalizedFallbackCategory, cutoff: normalizedFallbackCutoff }];
};
const getCutoffValueForCategory = (cutoffByCategory: CategoryCutoff[], category: string) =>
  normalizeCategoryCutoffs(cutoffByCategory).find(
    (item) => String(item.category || "").trim().toUpperCase() === String(category || "").trim().toUpperCase(),
  )?.cutoff || "";
const getNextCutoffCategoryValue = (currentCategory: string, cutoffByCategory: CategoryCutoff[]) => {
  const normalizedCurrentCategory = String(currentCategory || "").trim().toUpperCase();
  const normalizedCutoffs = normalizeCategoryCutoffs(cutoffByCategory);
  const usedCategories = new Set(
    normalizedCutoffs.map((item) => String(item.category || "").trim().toUpperCase()),
  );
  const orderedCategories = cutoffCategoryOptions.map((item) => item.value);
  const startIndex = Math.max(orderedCategories.indexOf(normalizedCurrentCategory), 0);

  for (let index = startIndex + 1; index < orderedCategories.length; index += 1) {
    if (!usedCategories.has(orderedCategories[index])) {
      return orderedCategories[index];
    }
  }
  for (let index = 0; index < orderedCategories.length; index += 1) {
    if (!usedCategories.has(orderedCategories[index])) {
      return orderedCategories[index];
    }
  }
  return orderedCategories[0] || normalizedCurrentCategory || defaultCutoffCategory;
};
const getNextEmbeddedCutoffSelection = (currentCategory: string, cutoffByCategory: CategoryCutoff[]) => {
  const nextCategory = getNextCutoffCategoryValue(currentCategory, cutoffByCategory);
  return {
    nextCategory,
    nextCutoffValue: getCutoffValueForCategory(cutoffByCategory, nextCategory),
  };
};
const createCourseExamDraft = (exam?: Partial<AdminCourseExam> | null): CourseExamForm => {
  const normalizedCutoffs = normalizeCategoryCutoffsWithFallback(
    exam?.cutoffByCategory,
    exam?.cutoffScoreOrRank,
    exam?.cutoffCategory,
  );
  const initialCategory = normalizedCutoffs[0]?.category || defaultCutoffCategory;

  return {
    examName: String(exam?.examName || "").trim(),
    cutoffScoreOrRank: String(resolvePrimaryCategoryCutoff(normalizedCutoffs, exam?.cutoffScoreOrRank || "") || ""),
    cutoffByCategory: normalizedCutoffs,
    cutoffCategory: initialCategory,
    cutoffValue: getCutoffValueForCategory(normalizedCutoffs, initialCategory),
    weightage: String(exam?.weightage || "").trim(),
    paperOrSyllabus: String(exam?.paperOrSyllabus || "").trim(),
    preparationNotes: String(exam?.preparationNotes || "").trim(),
  };
};
const normalizeCourseExamDraftForSave = (exam: CourseExamForm) => {
  const normalizedCutoffs = normalizeCategoryCutoffsWithFallback(
    exam.cutoffByCategory,
    exam.cutoffScoreOrRank,
    exam.cutoffCategory,
  );

  return {
    examName: exam.examName.trim(),
    cutoffScoreOrRank: String(resolvePrimaryCategoryCutoff(normalizedCutoffs, exam.cutoffScoreOrRank) || ""),
    cutoffByCategory: normalizedCutoffs,
    weightage: exam.weightage.trim(),
    paperOrSyllabus: exam.paperOrSyllabus.trim(),
    preparationNotes: exam.preparationNotes.trim(),
  };
};
const hasCourseExamValues = (exam: CourseExamForm) => {
  const normalizedCutoffs = normalizeCategoryCutoffsWithFallback(
    exam.cutoffByCategory,
    exam.cutoffScoreOrRank,
    exam.cutoffCategory,
  );

  return [
    exam.examName,
    exam.weightage,
    exam.paperOrSyllabus,
    exam.preparationNotes,
    exam.cutoffScoreOrRank,
    exam.cutoffValue,
    ...normalizedCutoffs.map((item) => `${item.category}:${item.cutoff}`),
  ].some((value) => String(value || "").trim());
};
const buildCourseExamCutoffState = (
  exam: CourseExamForm,
  rangeConfig: CutoffRangeConfig,
) => {
  const category = String(exam.cutoffCategory || "").trim().toUpperCase();
  const cutoffValue = formatCutoffForSave(exam.cutoffValue);
  if (!category || !cutoffValue || !isValidCutoffValue(cutoffValue)) {
    return null;
  }
  if (!isCutoffWithinRangeConfig(cutoffValue, rangeConfig)) {
    return null;
  }

  const normalizedCutoffs = normalizeCategoryCutoffs(exam.cutoffByCategory);
  const nextCutoffs = normalizeCategoryCutoffs([
    ...normalizedCutoffs.filter((item) => item.category !== category),
    { category, cutoff: cutoffValue },
  ]);
  const nextCategory = getNextCutoffCategoryValue(category, nextCutoffs);

  return {
    ...exam,
    cutoffByCategory: nextCutoffs,
    cutoffScoreOrRank: String(resolvePrimaryCategoryCutoff(nextCutoffs, cutoffValue) || ""),
    cutoffCategory: nextCategory,
    cutoffValue: getCutoffValueForCategory(nextCutoffs, nextCategory),
  };
};
const removeCourseExamCutoffState = (exam: CourseExamForm, category: string): CourseExamForm => {
  const nextCutoffs = normalizeCategoryCutoffs(exam.cutoffByCategory).filter(
    (item) => item.category !== category,
  );
  const activeCategory = nextCutoffs.some((item) => item.category === exam.cutoffCategory)
    ? exam.cutoffCategory
    : getNextCutoffCategoryValue(exam.cutoffCategory, nextCutoffs);

  return {
    ...exam,
    cutoffByCategory: nextCutoffs,
    cutoffScoreOrRank: String(resolvePrimaryCategoryCutoff(nextCutoffs) || ""),
    cutoffCategory: activeCategory,
    cutoffValue: getCutoffValueForCategory(nextCutoffs, activeCategory),
  };
};
const syncCourseExamsForStream = (stream: string, exams: CourseExamForm[]) => {
  const allowedExamNames = getExamScheduleNameOptions(stream);
  return exams.map((exam) =>
    !exam.examName || allowedExamNames.includes(exam.examName)
      ? exam
      : {
          ...exam,
          examName: "",
          cutoffScoreOrRank: "",
          cutoffByCategory: [],
          cutoffCategory: defaultCutoffCategory,
          cutoffValue: "",
        },
  );
};
const emptyCourseDetail = (): CourseCollegeDetailForm => ({ semesterFees: "", totalFees: "", cutoff: "", intake: "", applicationFee: "" });
const createEmptyCourseForm = (university = ""): CourseForm => ({ courseType: "", degreeType: "", stream: "", specialization: "", duration: "", mode: "Full-time", lateralEntryAvailable: false, lateralEntryDetails: "", minimumQualification: "", university, admissionProcess: "", description: "", isTopCourse: false, entranceExamsEnabled: false, entranceExams: [emptyCourseExam()], colleges: [], details: {} });
const createEmptyEmbeddedCourseDraft = (university = ""): EmbeddedCourseDraft => ({
  courseType: "",
  degreeType: "",
  stream: "",
  specialization: "",
  duration: "",
  mode: "Full-time",
  lateralEntryAvailable: false,
  lateralEntryDetails: "",
  minimumQualification: "",
  university,
  admissionProcess: "",
  description: "",
  isTopCourse: false,
  entranceExamsEnabled: false,
  semesterFees: "",
  totalFees: "",
  cutoff: "",
  cutoffByCategory: [],
  cutoffCategory: defaultCutoffCategory,
  cutoffValue: "",
  intake: "",
  applicationFee: "",
  entranceExams: [emptyCourseExam()],
});
const CUSTOM_STREAM_OPTION = "__custom_stream__";
const CUSTOM_SPECIALIZATION_OPTION = "__custom_specialization__";
const CUSTOM_COURSE_NAME_OPTION = "__custom_course_name__";
type CustomCourseFieldMode = {
  stream: boolean;
  specialization: boolean;
  courseName: boolean;
};
const defaultCustomCourseFieldMode: CustomCourseFieldMode = {
  stream: false,
  specialization: false,
  courseName: false,
};
const emptySubAdminForm: SubAdminForm = { email: "", password: "", permissions: [] };
const emptyExamScheduleForm: ExamScheduleForm = {
  examName: "",
  applicationFees: "",
  startDateToApply: "",
  lastDateToApply: "",
  correctionDate: "",
  lastDateForFeePayment: "",
  admitCardRelease: "",
  examDate: "",
  isTopExam: false,
  resultDate: "",
};
const examScheduleNameOptions = ["JEE Main", "JEE Advanced", "CUET", "NEET"];
const examScheduleNameOptionsByStream: Record<string, string[]> = {
  Engineering: ["JEE Main", "JEE Advanced"],
  Architecture: ["NATA", "JEE Main", "JEE Advanced"],
  Law: ["CLAT"],
  "Medical / Health": ["NEET"],
  Agriculture: ["ICAR AIEEA"],
};
const normalizeExamScheduleName = (value: string) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
const getExamScheduleNameOptions = (stream: string) =>
  examScheduleNameOptionsByStream[normalizeCourseStream(stream)] || examScheduleNameOptions;
const resolveExamCutoffRangeConfig = (stream: string, examName: string): CutoffRangeConfig => {
  const normalizedExamName = normalizeExamScheduleName(examName);
  if (normalizedExamName === normalizeExamScheduleName("NATA")) {
    return { max: 200, scaleLabel: "out of 200", contextLabel: "NATA" };
  }
  if (normalizedExamName === normalizeExamScheduleName("JEE Main")) {
    return { max: 300, scaleLabel: "out of 300", contextLabel: "JEE Main" };
  }
  if (normalizedExamName === normalizeExamScheduleName("JEE Advanced")) {
    return { max: 360, scaleLabel: "out of 360", contextLabel: "JEE Advanced" };
  }
  if (normalizedExamName === normalizeExamScheduleName("CLAT")) {
    return { max: 120, scaleLabel: "out of 120", contextLabel: "CLAT" };
  }
  if (normalizedExamName === normalizeExamScheduleName("NEET")) {
    return { max: 720, scaleLabel: "out of 720", contextLabel: "NEET" };
  }
  return resolveCutoffRangeConfig("", "UG", stream, "12th");
};
const normalizeIndianPhoneInput = (value: string) => {
  return String(value || "")
    .replace(/[^\d+\-()\s]/g, "")
    .replace(/\s{2,}/g, " ")
    .slice(0, 24);
};
const isValidIndianPhone = (value: string) => {
  const raw = String(value || "").trim();
  const digits = raw.replace(/\D/g, "");
  return digits.length >= 6 && digits.length <= 15 && /^[\d+\-()\s]+$/.test(raw);
};
const adminModuleLabels: Record<string, string> = {
  overview: "Overview",
  colleges: "Colleges",
  "bulk-upload": "College Data Upload",
  courses: "Courses",
  "college-notifications": "College Notifications",
  "college-requests": "College Notifications",
  users: "Users",
  enquiries: "Enquiries",
  exams: "Exams",
  "cutoff-questions": "Cutoff Questions",
};
const adminAccessSections = [
  { id: "overview", label: adminModuleLabels.overview, icon: LayoutDashboard },
  { id: "colleges", label: adminModuleLabels.colleges, icon: Building2 },
  { id: "bulk-upload", label: adminModuleLabels["bulk-upload"], icon: ImageUp },
  { id: "college-notifications", label: adminModuleLabels["college-notifications"], icon: FileClock },
  { id: "users", label: adminModuleLabels.users, icon: UserRound },
  { id: "enquiries", label: adminModuleLabels.enquiries, icon: MailOpen },
  { id: "exams", label: adminModuleLabels.exams, icon: BadgeCheck },
  { id: "cutoff-questions", label: adminModuleLabels["cutoff-questions"], icon: BookOpen },
] as const;
const formatAdminPermissionSummary = (permissions?: string[]) => {
  const labels = Array.from(
    new Set(
      (permissions || [])
        .map((item) => adminModuleLabels[item] || item)
        .filter(Boolean),
    ),
  );
  return labels.join(", ") || "No permissions";
};
const inputClass = "w-full rounded-[1rem] border border-[rgba(148,163,184,0.24)] bg-[linear-gradient(180deg,#ffffff_0%,#fbfdff_100%)] px-3 py-2.5 text-xs text-slate-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_6px_16px_rgba(148,163,184,0.06)] outline-none transition placeholder:text-slate-400 focus:border-[rgba(56,189,248,0.38)] focus:ring-4 focus:ring-sky-100 sm:px-3.5 sm:text-sm md:text-sm";
const labelClass = "mb-1 block text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 sm:mb-1.5 sm:text-[11px]";
const primaryButtonClass = "inline-flex items-center justify-center gap-1 rounded-full bg-[linear-gradient(135deg,#0f4c81_0%,#38bdf8_100%)] px-3 py-2 text-xs font-semibold text-white shadow-[0_16px_30px_rgba(56,189,248,0.24)] transition duration-200 hover:shadow-[0_18px_34px_rgba(56,189,248,0.28)] sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm";
const softButtonClass = "inline-flex items-center justify-center gap-1 rounded-full border border-[rgba(37,99,235,0.3)] bg-white px-3 py-2 text-xs font-semibold text-[#2563eb] shadow-[0_10px_20px_rgba(37,99,235,0.08)] transition duration-200 hover:bg-[#3b82f6] hover:text-white hover:border-[#3b82f6] hover:shadow-[0_12px_24px_rgba(37,99,235,0.18)] sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm";
const solidBlueButtonClass = "inline-flex items-center justify-center gap-1 rounded-full border border-[rgba(37,99,235,0.3)] bg-[#3b82f6] px-3 py-2 text-xs font-semibold text-white shadow-[0_10px_20px_rgba(37,99,235,0.16)] transition duration-200 hover:bg-white hover:text-[#2563eb] hover:border-[rgba(37,99,235,0.34)] hover:shadow-[0_12px_24px_rgba(37,99,235,0.12)] sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm";
const dangerButtonClass = "inline-flex items-center justify-center gap-1 rounded-full border border-[rgba(251,191,36,0.22)] bg-[linear-gradient(135deg,#fff8e7_0%,#fff0d2_100%)] px-3 py-2 text-xs font-semibold text-[#9a6700] shadow-[0_8px_18px_rgba(251,191,36,0.12)] transition duration-200 hover:bg-[linear-gradient(135deg,#fff4d6_0%,#ffebc2_100%)] sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm";
const requiredMarkClass = "ml-1 text-rose-500";
const usersRowsPerPage = 10;
const collegeEditStatusRowsPerPage = 10;
const collegeNotificationsRowsPerPage = 5;
const getUserRoleBadgeClass = (role?: string) =>
  String(role || "").toLowerCase() === "college"
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : "border-blue-200 bg-blue-50 text-blue-700";
const getCompactPaginationItems = (currentPage: number, totalPages: number): (number | string)[] => {
  if (totalPages <= 6) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "ellipsis", totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [1, "ellipsis", ...Array.from({ length: 5 }, (_, index) => totalPages - 4 + index)];
  }

  return [1, "ellipsis-left", currentPage - 1, currentPage, currentPage + 1, "ellipsis-right", totalPages];
};
const errorTextClass = "mt-1 block text-[10px] font-medium text-rose-600 sm:text-[11px]";
const formSectionClass = "grid gap-2 grid-cols-1 sm:gap-3 md:grid-cols-2 xl:grid-cols-3";
const mediaUploadCardClass = "group relative overflow-hidden rounded-[1.5rem] border border-[rgba(148,163,184,0.18)] bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(248,250,252,0.95))] p-4 shadow-[0_16px_34px_rgba(148,163,184,0.08)] transition duration-300 hover:-translate-y-0.5 hover:border-[rgba(56,189,248,0.26)] hover:shadow-[0_22px_42px_rgba(125,211,252,0.14)]";
const mediaUploadButtonClass = "inline-flex h-[110px] w-[110px] shrink-0 flex-col items-center justify-center gap-2 rounded-[1.15rem] border border-[rgba(15,23,42,0.08)] bg-white px-4 py-3 text-center text-sm font-semibold text-slate-800 shadow-[0_10px_24px_rgba(15,23,42,0.06)] transition duration-200 group-hover:border-[rgba(56,189,248,0.24)] group-hover:text-[#0f4c81]";
const mediaPreviewTileClass = "group relative overflow-hidden rounded-[1.2rem] border border-[rgba(148,163,184,0.18)] bg-white p-2 shadow-[0_14px_28px_rgba(148,163,184,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_34px_rgba(148,163,184,0.12)]";
const inferToastTypeFromMessage = (message: string): "success" | "error" | "info" => {
  const normalized = String(message || "").trim().toLowerCase();
  if (!normalized) return "info";
  if (/(unable|invalid|error|failed|expired|required|select |should be|must be|not authorized|not found|session|different email|reserved|already exists)/.test(normalized)) {
    return "error";
  }
  if (/(saved|updated|deleted|processed|completed|added|sent|successful|created|validated|synced|ready)/.test(normalized)) {
    return "success";
  }
  return "info";
};
const ownershipTypeOptions = ["Private", "Government", "Deemed"];
const applicationModeOptions = ["Online", "Offline", "Online & Offline"];
const degreeTypeOptions = ["UG", "PG", "Diploma", "Certificate", "Doctorate"];
const artsAndScienceStream = "Arts & Science";
const artsScienceCourseTypeGroups = {
  science: "B.Sc (Science Courses)",
  commerce: "B.Com (Commerce Courses)",
  arts: "B.A (Arts Courses)",
  professional: "Other Professional Courses",
} as const;
const streamOptions = ["Engineering", "Architecture", artsAndScienceStream, "Medical / Health", "Paramedical", "Law", "Design", "Agriculture", "Aviation", "Hotel Management", "Education", "Social Work", "Physical Education & Sports", "Vocational Courses", "Diploma / ITI"];
const modeOptions = ["Full-time", "Part-time", "Distance", "Online", "Hybrid"];
const qualificationLabelMap: Record<string, string> = {
  "10th": "Secondary School (Grade 10)",
  "Secondary School (10th)": "Secondary School (Grade 10)",
  "Grade 10": "Secondary School (Grade 10)",
  "10+2": "Higher Secondary (Grade 12)",
  "12th": "Higher Secondary (Grade 12)",
  "Higher Secondary (+2)": "Higher Secondary (Grade 12)",
  "Grade 12": "Higher Secondary (Grade 12)",
  Diploma: "Diploma",
  Graduation: "Graduation",
  "Post Graduation": "Post Graduation",
};
const qualificationOptions = Array.from(new Set(Object.values(qualificationLabelMap)));
const courseCatalog: CourseCatalogItem[] = [
  { stream: "Engineering", courseType: "B.E", specialization: "Computer Science Engineering", degreeType: "UG" },
  { stream: "Engineering", courseType: "B.E", specialization: "Information Science Engineering", degreeType: "UG" },
  { stream: "Engineering", courseType: "B.E", specialization: "Mechanical Engineering", degreeType: "UG" },
  { stream: "Engineering", courseType: "B.E", specialization: "Civil Engineering", degreeType: "UG" },
  { stream: "Engineering", courseType: "B.E", specialization: "Electrical Engineering", degreeType: "UG" },
  { stream: "Engineering", courseType: "B.E", specialization: "Electronics & Communication Engineering", degreeType: "UG" },
  { stream: "Engineering", courseType: "B.E", specialization: "Electronics & Instrumentation Engineering", degreeType: "UG" },
  { stream: "Engineering", courseType: "B.E", specialization: "Mechatronics Engineering", degreeType: "UG" },
  { stream: "Engineering", courseType: "B.E", specialization: "Automobile Engineering", degreeType: "UG" },
  { stream: "Engineering", courseType: "B.E", specialization: "Aeronautical Engineering", degreeType: "UG" },
  { stream: "Engineering", courseType: "B.E", specialization: "Aerospace Engineering", degreeType: "UG" },
  { stream: "Engineering", courseType: "B.E", specialization: "Marine Engineering", degreeType: "UG" },
  { stream: "Engineering", courseType: "B.Tech", specialization: "Information Technology", degreeType: "UG" },
  { stream: "Engineering", courseType: "B.Tech", specialization: "Artificial Intelligence", degreeType: "UG" },
  { stream: "Engineering", courseType: "B.Tech", specialization: "Data Science", degreeType: "UG" },
  { stream: "Engineering", courseType: "B.Tech", specialization: "Cyber Security", degreeType: "UG" },
  { stream: "Engineering", courseType: "B.Tech", specialization: "Robotics", degreeType: "UG" },
  { stream: "Engineering", courseType: "B.Tech", specialization: "Biotechnology", degreeType: "UG" },
  { stream: "Engineering", courseType: "B.Tech", specialization: "Chemical Engineering", degreeType: "UG" },
  { stream: "Engineering", courseType: "B.Tech", specialization: "Petroleum Engineering", degreeType: "UG" },
  { stream: "Engineering", courseType: "B.Tech", specialization: "Food Technology", degreeType: "UG" },
  { stream: "Engineering", courseType: "B.Tech", specialization: "Textile Technology", degreeType: "UG" },
  { stream: "Engineering", courseType: "Diploma in Engineering", specialization: "Mechanical Engineering", degreeType: "Diploma" },
  { stream: "Engineering", courseType: "Diploma in Engineering", specialization: "Civil Engineering", degreeType: "Diploma" },
  { stream: "Engineering", courseType: "Diploma in Engineering", specialization: "Electrical Engineering", degreeType: "Diploma" },
  { stream: "Engineering", courseType: "Diploma in Engineering", specialization: "Electronics Engineering", degreeType: "Diploma" },
  { stream: "Engineering", courseType: "Diploma in Engineering", specialization: "Automobile Engineering", degreeType: "Diploma" },
  { stream: "Engineering", courseType: "Diploma in Engineering", specialization: "Information Technology", degreeType: "Diploma" },
  { stream: "Architecture", courseType: "B.Arch (Bachelor of Architecture)", specialization: "Architecture", degreeType: "UG" },
  { stream: artsAndScienceStream, courseType: artsScienceCourseTypeGroups.science, specialization: "B.Sc Mathematics", degreeType: "UG" },
  { stream: artsAndScienceStream, courseType: artsScienceCourseTypeGroups.science, specialization: "B.Sc Physics", degreeType: "UG" },
  { stream: artsAndScienceStream, courseType: artsScienceCourseTypeGroups.science, specialization: "B.Sc Chemistry", degreeType: "UG" },
  { stream: artsAndScienceStream, courseType: artsScienceCourseTypeGroups.science, specialization: "B.Sc Computer Science", degreeType: "UG" },
  { stream: artsAndScienceStream, courseType: artsScienceCourseTypeGroups.science, specialization: "B.Sc Information Technology (IT)", degreeType: "UG" },
  { stream: artsAndScienceStream, courseType: artsScienceCourseTypeGroups.science, specialization: "B.Sc Microbiology", degreeType: "UG" },
  { stream: artsAndScienceStream, courseType: artsScienceCourseTypeGroups.science, specialization: "B.Sc Biotechnology", degreeType: "UG" },
  { stream: artsAndScienceStream, courseType: artsScienceCourseTypeGroups.science, specialization: "B.Sc Zoology", degreeType: "UG" },
  { stream: artsAndScienceStream, courseType: artsScienceCourseTypeGroups.science, specialization: "B.Sc Botany", degreeType: "UG" },
  { stream: artsAndScienceStream, courseType: artsScienceCourseTypeGroups.science, specialization: "B.Sc Geology", degreeType: "UG" },
  { stream: artsAndScienceStream, courseType: artsScienceCourseTypeGroups.science, specialization: "B.Sc Home Science", degreeType: "UG" },
  { stream: artsAndScienceStream, courseType: artsScienceCourseTypeGroups.science, specialization: "B.Sc Nutrition & Dietetics", degreeType: "UG" },
  { stream: "Medical / Health", courseType: "MBBS", specialization: "General Medicine", degreeType: "UG" },
  { stream: "Medical / Health", courseType: "BDS", specialization: "Dentistry", degreeType: "UG" },
  { stream: "Medical / Health", courseType: "BAMS", specialization: "Ayurveda", degreeType: "UG" },
  { stream: "Medical / Health", courseType: "BHMS", specialization: "Homeopathy", degreeType: "UG" },
  { stream: "Medical / Health", courseType: "BUMS", specialization: "Unani", degreeType: "UG" },
  { stream: "Medical / Health", courseType: "BPT", specialization: "Physiotherapy", degreeType: "UG" },
  { stream: "Medical / Health", courseType: "B.Sc", specialization: "Nursing", degreeType: "UG" },
  { stream: "Medical / Health", courseType: "B.Pharm", specialization: "Pharmacy", degreeType: "UG" },
  { stream: "Medical / Health", courseType: "Pharm.D", specialization: "Doctor of Pharmacy", degreeType: "Doctorate" },
  { stream: "Medical / Health", courseType: "B.V.Sc", specialization: "Veterinary Science", degreeType: "UG" },
  { stream: "Paramedical", courseType: "B.Sc", specialization: "Radiology", degreeType: "UG" },
  { stream: "Paramedical", courseType: "B.Sc", specialization: "Medical Lab Technology", degreeType: "UG" },
  { stream: "Paramedical", courseType: "B.Sc", specialization: "Optometry", degreeType: "UG" },
  { stream: "Paramedical", courseType: "B.Sc", specialization: "Dialysis Technology", degreeType: "UG" },
  { stream: "Paramedical", courseType: "B.Sc", specialization: "Operation Theatre Technology", degreeType: "UG" },
  { stream: "Paramedical", courseType: "B.Sc", specialization: "Cardiac Technology", degreeType: "UG" },
  { stream: "Paramedical", courseType: "B.Sc", specialization: "Respiratory Therapy", degreeType: "UG" },
  { stream: artsAndScienceStream, courseType: artsScienceCourseTypeGroups.commerce, specialization: "B.Com (General)", degreeType: "UG" },
  { stream: artsAndScienceStream, courseType: artsScienceCourseTypeGroups.commerce, specialization: "B.Com Accounting & Finance", degreeType: "UG" },
  { stream: artsAndScienceStream, courseType: artsScienceCourseTypeGroups.commerce, specialization: "B.Com Banking & Insurance", degreeType: "UG" },
  { stream: artsAndScienceStream, courseType: artsScienceCourseTypeGroups.commerce, specialization: "B.Com Corporate Secretaryship", degreeType: "UG" },
  { stream: artsAndScienceStream, courseType: artsScienceCourseTypeGroups.commerce, specialization: "B.Com Computer Applications", degreeType: "UG" },
  { stream: artsAndScienceStream, courseType: artsScienceCourseTypeGroups.arts, specialization: "B.A English", degreeType: "UG" },
  { stream: artsAndScienceStream, courseType: artsScienceCourseTypeGroups.arts, specialization: "B.A Tamil", degreeType: "UG" },
  { stream: artsAndScienceStream, courseType: artsScienceCourseTypeGroups.arts, specialization: "B.A History", degreeType: "UG" },
  { stream: artsAndScienceStream, courseType: artsScienceCourseTypeGroups.arts, specialization: "B.A Economics", degreeType: "UG" },
  { stream: artsAndScienceStream, courseType: artsScienceCourseTypeGroups.arts, specialization: "B.A Political Science", degreeType: "UG" },
  { stream: artsAndScienceStream, courseType: artsScienceCourseTypeGroups.arts, specialization: "B.A Sociology", degreeType: "UG" },
  { stream: artsAndScienceStream, courseType: artsScienceCourseTypeGroups.arts, specialization: "B.A Psychology", degreeType: "UG" },
  { stream: artsAndScienceStream, courseType: artsScienceCourseTypeGroups.professional, specialization: "BBA (Bachelor of Business Administration)", degreeType: "UG" },
  { stream: artsAndScienceStream, courseType: artsScienceCourseTypeGroups.professional, specialization: "BCA (Bachelor of Computer Applications)", degreeType: "UG" },
  { stream: artsAndScienceStream, courseType: artsScienceCourseTypeGroups.professional, specialization: "BSW (Social Work)", degreeType: "UG" },
  { stream: artsAndScienceStream, courseType: artsScienceCourseTypeGroups.professional, specialization: "BFA (Fine Arts)", degreeType: "UG" },
  { stream: "Law", courseType: "LLB", specialization: "General", degreeType: "UG" },
  { stream: "Law", courseType: "BA LLB", specialization: "Integrated", degreeType: "UG" },
  { stream: "Law", courseType: "BBA LLB", specialization: "Integrated", degreeType: "UG" },
  { stream: "Law", courseType: "B.Com LLB", specialization: "Integrated", degreeType: "UG" },
  { stream: "Design", courseType: "B.Des", specialization: "Graphic Design", degreeType: "UG" },
  { stream: "Design", courseType: "B.Des", specialization: "UI/UX Design", degreeType: "UG" },
  { stream: "Design", courseType: "B.Des", specialization: "Animation", degreeType: "UG" },
  { stream: "Design", courseType: "B.Des", specialization: "Fashion Design", degreeType: "UG" },
  { stream: "Design", courseType: "B.Des", specialization: "Interior Design", degreeType: "UG" },
  { stream: "Design", courseType: "BFA", specialization: "Fine Arts", degreeType: "UG" },
  { stream: "Design", courseType: "B.Sc", specialization: "Visual Communication", degreeType: "UG" },
  { stream: "Agriculture", courseType: "B.Sc", specialization: "Agriculture", degreeType: "UG" },
  { stream: "Agriculture", courseType: "B.Sc", specialization: "Horticulture", degreeType: "UG" },
  { stream: "Agriculture", courseType: "B.Sc", specialization: "Forestry", degreeType: "UG" },
  { stream: "Agriculture", courseType: "B.Sc", specialization: "Sericulture", degreeType: "UG" },
  { stream: "Agriculture", courseType: "B.Tech", specialization: "Agricultural Engineering", degreeType: "UG" },
  { stream: "Agriculture", courseType: "B.Sc", specialization: "Dairy Technology", degreeType: "UG" },
  { stream: "Agriculture", courseType: "B.Sc", specialization: "Fisheries Science", degreeType: "UG" },
  { stream: "Aviation", courseType: "B.Sc", specialization: "Aviation", degreeType: "UG" },
  { stream: "Aviation", courseType: "BBA", specialization: "Aviation", degreeType: "UG" },
  { stream: "Aviation", courseType: "Commercial Pilot License (CPL)", specialization: "Commercial Pilot License (CPL)", degreeType: "Certificate" },
  { stream: "Aviation", courseType: "Aircraft Maintenance Engineering (AME)", specialization: "Aircraft Maintenance Engineering (AME)", degreeType: "Certificate" },
  { stream: "Hotel Management", courseType: "BHM", specialization: "Hotel Management", degreeType: "UG" },
  { stream: "Hotel Management", courseType: "B.Sc", specialization: "Catering Science", degreeType: "UG" },
  { stream: "Hotel Management", courseType: "B.Sc", specialization: "Hospitality & Hotel Administration", degreeType: "UG" },
  { stream: "Hotel Management", courseType: "Diploma", specialization: "Hotel Management", degreeType: "Diploma" },
  { stream: "Education", courseType: "B.Ed", specialization: "Bachelor of Education", degreeType: "UG" },
  { stream: "Education", courseType: "D.El.Ed", specialization: "Diploma in Elementary Education", degreeType: "Diploma" },
  { stream: "Education", courseType: "B.P.Ed", specialization: "Physical Education", degreeType: "UG" },
  { stream: "Social Work", courseType: "BSW", specialization: "Social Work", degreeType: "UG" },
  { stream: "Physical Education & Sports", courseType: "B.Sc", specialization: "Sports Science", degreeType: "UG" },
  { stream: "Physical Education & Sports", courseType: "B.P.Ed", specialization: "Physical Education", degreeType: "UG" },
  { stream: "Vocational Courses", courseType: "B.Voc", specialization: "Retail Management", degreeType: "UG" },
  { stream: "Vocational Courses", courseType: "B.Voc", specialization: "Tourism", degreeType: "UG" },
  { stream: "Vocational Courses", courseType: "B.Voc", specialization: "Software Development", degreeType: "UG" },
  { stream: "Vocational Courses", courseType: "B.Voc", specialization: "Banking & Finance", degreeType: "UG" },
  { stream: "Diploma / ITI", courseType: "Diploma", specialization: "Mechanical Engineering", degreeType: "Diploma" },
  { stream: "Diploma / ITI", courseType: "Diploma", specialization: "Civil Engineering", degreeType: "Diploma" },
  { stream: "Diploma / ITI", courseType: "Diploma", specialization: "Electrical Engineering", degreeType: "Diploma" },
  { stream: "Diploma / ITI", courseType: "Diploma", specialization: "Electronics Engineering", degreeType: "Diploma" },
  { stream: "Diploma / ITI", courseType: "Diploma", specialization: "Automobile Engineering", degreeType: "Diploma" },
  { stream: "Diploma / ITI", courseType: "ITI", specialization: "Electrician", degreeType: "Certificate" },
  { stream: "Diploma / ITI", courseType: "ITI", specialization: "Fitter", degreeType: "Certificate" },
  { stream: "Diploma / ITI", courseType: "ITI", specialization: "Welder", degreeType: "Certificate" },
  { stream: "Diploma / ITI", courseType: "ITI", specialization: "Mechanic", degreeType: "Certificate" },
  { stream: "Diploma / ITI", courseType: "ITI", specialization: "Plumber", degreeType: "Certificate" },
  { stream: "Diploma / ITI", courseType: "ITI", specialization: "Computer Operator", degreeType: "Certificate" },
];
const defaultDurationByDegreeType: Record<string, string> = {
  UG: "3 Years",
  PG: "2 Years",
  Diploma: "3 Years",
  Certificate: "6 Months",
  Doctorate: "3 Years",
};
const streamDurationByDegreeType: Record<string, Partial<Record<string, string>>> = {
  Engineering: { UG: "4 Years", PG: "2 Years", Diploma: "3 Years", Certificate: "6 Months", Doctorate: "3 Years" },
  Architecture: { UG: "5 Years", PG: "2 Years", Diploma: "3 Years", Certificate: "6 Months", Doctorate: "3 Years" },
  Medical: { UG: "5.5 Years", PG: "3 Years", Diploma: "2 Years", Certificate: "1 Year", Doctorate: "3 Years" },
  Law: { UG: "3 Years", PG: "2 Years", Diploma: "1 Year", Certificate: "6 Months", Doctorate: "3 Years" },
  Design: { UG: "4 Years", PG: "2 Years", Diploma: "2 Years", Certificate: "6 Months", Doctorate: "3 Years" },
  Education: { UG: "3 Years", PG: "2 Years", Diploma: "2 Years", Certificate: "1 Year", Doctorate: "3 Years" },
  Paramedical: { UG: "4 Years", PG: "2 Years", Diploma: "2 Years", Certificate: "1 Year", Doctorate: "3 Years" },
  "Computer Applications": { UG: "3 Years", PG: "2 Years", Diploma: "2 Years", Certificate: "6 Months", Doctorate: "3 Years" },
};
const streamCourseNameByDegreeType: Record<string, Partial<Record<string, string>>> = {
  Engineering: { UG: "B.E", PG: "M.E", Diploma: "Diploma in Engineering", Certificate: "Certificate in Engineering", Doctorate: "Ph.D" },
  Architecture: { UG: "B.Arch (Bachelor of Architecture)", PG: "M.Arch", Diploma: "Diploma in Architecture", Certificate: "Certificate in Architecture", Doctorate: "Ph.D" },
  "Arts & Science": { UG: "B.A", PG: "M.A", Diploma: "Diploma in Arts & Science", Certificate: "Certificate in Arts & Science", Doctorate: "Ph.D" },
  Medical: { UG: "MBBS", PG: "M.D", Diploma: "Diploma in Medical Sciences", Certificate: "Certificate in Medical Sciences", Doctorate: "Ph.D" },
  Law: { UG: "LLB", PG: "LLM", Diploma: "Diploma in Law", Certificate: "Certificate in Law", Doctorate: "Ph.D" },
  Design: { UG: "B.Des", PG: "M.Des", Diploma: "Diploma in Design", Certificate: "Certificate in Design", Doctorate: "Ph.D" },
  Education: { UG: "B.Ed", PG: "M.Ed", Diploma: "Diploma in Education", Certificate: "Certificate in Education", Doctorate: "Ph.D" },
  Paramedical: { UG: "BPT", PG: "MPT", Diploma: "Diploma in Paramedical", Certificate: "Certificate in Paramedical", Doctorate: "Ph.D" },
  "Computer Applications": { UG: "BCA", PG: "MCA", Diploma: "Diploma in Computer Applications", Certificate: "Certificate in Computer Applications", Doctorate: "Ph.D" },
};

const getDefaultDuration = (stream: string, degreeType: string) =>
  streamDurationByDegreeType[stream]?.[degreeType] || defaultDurationByDegreeType[degreeType] || "";
const getDefaultCourseName = (stream: string, degreeType: string) =>
  streamCourseNameByDegreeType[stream]?.[degreeType] || "";
const getResolvedCourseName = (stream: string, degreeType: string, currentValue: string) =>
  normalizeAdminOption(currentValue) || getDefaultCourseName(stream, degreeType) || "";
const formatQualificationLabel = (value?: string) => qualificationLabelMap[String(value || "").trim()] || String(value || "").trim();
const resolveCutoffRangeConfig = (
  courseName: string,
  degreeType: string,
  stream: string,
  minimumQualification: string,
): CutoffRangeConfig => {
  const normalizedCourse = String(courseName || "").trim().toUpperCase();
  const normalizedDegreeType = String(degreeType || "").trim();
  const normalizedStream = normalizeCourseStream(stream);
  const normalizedQualification = String(minimumQualification || "").trim().toLowerCase();

  if (normalizedStream === "Engineering") {
    return { max: 200, scaleLabel: "out of 200", contextLabel: "Engineering" };
  }
  if (normalizedStream === "Architecture" || normalizedCourse.includes("B.ARCH")) {
    return { max: 400, scaleLabel: "out of 400", contextLabel: "Architecture" };
  }
  if (normalizedStream === "Medical / Health") {
    return { max: 600, scaleLabel: "out of 600", contextLabel: "Medical / Health" };
  }
  if (normalizedStream === "Paramedical") {
    return { max: 200, scaleLabel: "out of 200", contextLabel: "Paramedical" };
  }
  if (normalizedStream === "Agriculture") {
    return { max: 200, scaleLabel: "out of 200", contextLabel: "Agriculture" };
  }
  if (normalizedStream === "Law") {
    return { max: 300, scaleLabel: "out of 300", contextLabel: "Law" };
  }
  if (normalizedQualification.includes("post graduation") || normalizedDegreeType === "Doctorate") {
    return { max: 100, scaleLabel: "out of 100", contextLabel: "Post Graduation" };
  }
  if (
    (normalizedQualification.includes("graduation") && !normalizedQualification.includes("post")) ||
    normalizedDegreeType === "PG"
  ) {
    return { max: 100, scaleLabel: "out of 100", contextLabel: "Graduation" };
  }
  if (
    normalizedQualification.includes("grade 10") ||
    normalizedQualification.includes("10th") ||
    normalizedDegreeType === "Diploma" ||
    normalizedStream === "Diploma / ITI"
  ) {
    return { max: 500, scaleLabel: "out of 500", contextLabel: "Grade 10" };
  }
  return { max: 600, scaleLabel: "out of 600", contextLabel: normalizedStream || "this course" };
};
const getCutoffRangeHelperText = (config: CutoffRangeConfig) =>
  `Allowed cutoff range: 0-${config.max} (${config.scaleLabel}).`;
const isCutoffWithinRangeConfig = (
  value: string | number | null | undefined,
  config: CutoffRangeConfig,
) => {
  const parsed = parseCutoffValue(value);
  if (!parsed) return false;
  return parsed.start >= 0 && parsed.end >= 0 && parsed.start <= config.max && parsed.end <= config.max;
};
const getCutoffLimitWarning = (
  value: string | number | null | undefined,
  config: CutoffRangeConfig,
) => {
  const parsed = parseCutoffValue(value);
  if (!parsed) return "";
  if (parsed.start > config.max || parsed.end > config.max) {
    return `Cutoff cannot be more than ${config.max} for ${config.contextLabel}.`;
  }
  return "";
};
const getCutoffValidationMessageForConfig = (config: CutoffRangeConfig) =>
  `Enter cutoff like 190, 190.5, or a range like 190-195. ${config.contextLabel} cutoff must stay within 0-${config.max} (${config.scaleLabel}).`;
const getDefaultMinimumQualification = (courseName: string, degreeType: string, stream: string) => {
  const normalizedCourse = courseName.trim().toUpperCase();
  const normalizedStream = normalizeCourseStream(stream);

  if (["MBA", "MCA", "M.E", "M.TECH", "M.SC", "M.COM", "M.A", "LLM", "MPT", "M.DES", "M.ED"].includes(normalizedCourse)) {
    return formatQualificationLabel("Graduation");
  }
  if (["PH.D", "M.D"].includes(normalizedCourse) || degreeType === "Doctorate") {
    return formatQualificationLabel("Post Graduation");
  }
  if (["B.ED"].includes(normalizedCourse)) {
    return formatQualificationLabel("Graduation");
  }
  if (degreeType === "PG") return formatQualificationLabel("Graduation");
  if (degreeType === "Doctorate") return formatQualificationLabel("Post Graduation");
  if (degreeType === "Diploma") return formatQualificationLabel("10th");
  if (degreeType === "Certificate") return formatQualificationLabel(normalizedStream === "Medical / Health" ? "10+2" : "10th");
  return formatQualificationLabel("10+2");
};
const getQualificationSuggestions = (courseName: string, degreeType: string, stream: string) => {
  const highestRequired = getDefaultMinimumQualification(courseName, degreeType, stream);
  return Array.from(new Set(highestRequired ? [highestRequired] : qualificationOptions));
};
const normalizeAdminOption = (value?: string) => String(value || "").trim();
const normalizeAdminSearchText = (value?: string) =>
  String(value || "")
    .trim()
    .toLowerCase();
const scoreAdminCollegeSearchResult = (college: AdminCollege, query: string) => {
  const normalizedQuery = normalizeAdminSearchText(query);
  if (!normalizedQuery) return 0;

  const name = normalizeAdminSearchText(college.name);
  const university = normalizeAdminSearchText(college.university);
  const collegeCode = normalizeAdminSearchText(college.collegeCode);
  const city = normalizeAdminSearchText(college.city);
  const district = normalizeAdminSearchText(college.district);
  const state = normalizeAdminSearchText(college.state);
  const address = normalizeAdminSearchText(college.address);
  const pincode = normalizeAdminSearchText(college.pincode);

  let score = 0;

  if (name === normalizedQuery) score += 1000;
  else if (name.startsWith(normalizedQuery)) score += 800;
  else if (name.includes(normalizedQuery)) score += 600;

  if (university === normalizedQuery) score += 400;
  else if (university.startsWith(normalizedQuery)) score += 300;
  else if (university.includes(normalizedQuery)) score += 200;

  if (collegeCode === normalizedQuery) score += 150;
  else if (collegeCode.includes(normalizedQuery)) score += 100;

  if (city.includes(normalizedQuery) || district.includes(normalizedQuery) || state.includes(normalizedQuery)) {
    score += 50;
  }

  if (address.includes(normalizedQuery) || pincode.includes(normalizedQuery)) {
    score += 25;
  }

  return score;
};
const normalizeArtsScienceCourseType = (stream: string, courseType: string, specialization = "") => {
  if (normalizeCourseStream(stream) !== artsAndScienceStream) return normalizeAdminOption(courseType);

  const normalizedCourseType = normalizeAdminOption(courseType);
  const normalizedSpecialization = normalizeAdminOption(specialization);
  if (
    [
      artsScienceCourseTypeGroups.science,
      artsScienceCourseTypeGroups.commerce,
      artsScienceCourseTypeGroups.arts,
      artsScienceCourseTypeGroups.professional,
    ].includes(normalizedCourseType as (typeof artsScienceCourseTypeGroups)[keyof typeof artsScienceCourseTypeGroups])
  ) {
    return normalizedCourseType;
  }

  if (normalizedCourseType === "B.Sc") return artsScienceCourseTypeGroups.science;
  if (normalizedCourseType === "B.Com") return artsScienceCourseTypeGroups.commerce;
  if (normalizedCourseType === "B.A") return artsScienceCourseTypeGroups.arts;
  if (["BBA", "BCA", "BSW", "BFA"].includes(normalizedCourseType)) {
    return artsScienceCourseTypeGroups.professional;
  }
  if (
    normalizedSpecialization.startsWith("B.Sc ") ||
    ["Physics", "Chemistry", "Mathematics", "Microbiology", "Biotechnology", "Zoology", "Botany"].includes(normalizedSpecialization)
  ) {
    return artsScienceCourseTypeGroups.science;
  }
  if (normalizedSpecialization.startsWith("B.Com ") || normalizedSpecialization === "B.Com (General)") {
    return artsScienceCourseTypeGroups.commerce;
  }
  if (normalizedSpecialization.startsWith("B.A ")) {
    return artsScienceCourseTypeGroups.arts;
  }
  if (
    normalizedSpecialization.startsWith("BBA ") ||
    normalizedSpecialization.startsWith("BCA ") ||
    normalizedSpecialization.startsWith("BSW ") ||
    normalizedSpecialization.startsWith("BFA ")
  ) {
    return artsScienceCourseTypeGroups.professional;
  }

  return normalizedCourseType;
};
const streamAliasMap: Record<string, string> = {
  "Computer Applications": artsAndScienceStream,
  Medical: "Medical / Health",
  Arts: artsAndScienceStream,
  Science: artsAndScienceStream,
  Commerce: artsAndScienceStream,
  Management: artsAndScienceStream,
  "Computer / IT": artsAndScienceStream,
};
const normalizeCourseStream = (value?: string) => streamAliasMap[normalizeAdminOption(value)] || normalizeAdminOption(value);
const getDurationMultiplier = (duration: string) => {
  const match = String(duration || "").match(/(\d+(?:\.\d+)?)/);
  if (!match) return 0;
  return Number(match[1]) || 0;
};
const calculateTotalFeesFromSemesterFees = (semesterFees: string, duration: string) => {
  const feeValue = Number(String(semesterFees || "").replace(/,/g, "").trim() || 0);
  const durationYears = getDurationMultiplier(duration);
  const multiplier = durationYears * 2;
  if (!feeValue || !multiplier) return "";
  return String(feeValue * multiplier);
};
const shouldAutoShowEntranceExams = (courseName: string, degreeType: string, stream: string) => {
  const normalizedCourse = courseName.trim().toUpperCase();
  const normalizedStream = normalizeCourseStream(stream);

  if (["Engineering", "Medical / Health", "Law"].includes(normalizedStream)) return true;
  if (normalizedStream === "Management" && degreeType === "PG") return true;
  return ["B.E", "B.TECH", "M.E", "M.TECH", "MBBS", "M.D", "LLB", "LLM", "MBA", "MCA"].includes(normalizedCourse);
};

const formatDate = (value?: string) =>
  value
    ? /^\d{2}-\d{2}-\d{4}$/.test(String(value).trim())
      ? String(value).trim()
      : new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "-";

const correctionDateRangePattern = /^\d{2}-\d{2}-\d{4}\s+to\s+\d{2}-\d{2}-\d{4}$/i;
const parseDayMonthYearValue = (value: string) => {
  const trimmedValue = String(value || "").trim();
  const match = trimmedValue.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (!match) return null;

  const [, dayText, monthText, yearText] = match;
  const day = Number(dayText);
  const month = Number(monthText);
  const year = Number(yearText);
  const parsedDate = new Date(Date.UTC(year, month - 1, day));

  if (
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.getUTCFullYear() !== year ||
    parsedDate.getUTCMonth() !== month - 1 ||
    parsedDate.getUTCDate() !== day
  ) {
    return null;
  }

  return `${yearText}-${monthText}-${dayText}`;
};

const parseExamDateValue = (value: string) => {
  const trimmedValue = String(value || "").trim();
  if (!trimmedValue) return null;
  if (/^\d{2}-\d{2}-\d{4}$/.test(trimmedValue)) {
    return parseDayMonthYearValue(trimmedValue);
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmedValue)) {
    const [yearText = "", monthText = "", dayText = ""] = trimmedValue.split("-");
    return parseDayMonthYearValue(`${dayText}-${monthText}-${yearText}`);
  }
  return null;
};

const formatExamDateForInput = (value: string) => {
  const parsedValue = parseExamDateValue(value);
  return parsedValue || "";
};

const formatExamDateFromInput = (value: string) => {
  const trimmedValue = String(value || "").trim();
  if (!trimmedValue) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmedValue)) {
    const [yearText = "", monthText = "", dayText = ""] = trimmedValue.split("-");
    return `${dayText}-${monthText}-${yearText}`;
  }
  return trimmedValue;
};

const formatCorrectionDateRange = (value?: string) => String(value || "").trim() || "-";

const renderChangeValue = (value: unknown) => {
  if (Array.isArray(value)) {
    const normalized = value.map((item) => String(item ?? "").trim()).filter(Boolean);
    if (normalized.length === 0) return "Empty";
    return normalized.join(", ");
  }
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  const text = String(value ?? "").trim();
  return text || "Empty";
};

const getRequestAssetValue = (item: RequestItem, keys: string[]) => {
  for (const key of keys) {
    const value = item.payload?.[key as keyof NonNullable<RequestItem["payload"]>] ?? item.submittedPayload?.[key];
    const normalizedValue = String(value ?? "").trim();
    if (normalizedValue) return normalizedValue;
  }
  return "";
};

const stripTrailingZeroDecimal = (value: unknown) => {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  return raw.replace(/^(-?\d+)\.0+$/, "$1");
};

const isCutoffPreviewColumn = (column?: string) =>
  column === "cutoff" || String(column || "").startsWith("cutoff_");

const formatFeeRange = (value?: Record<string, unknown>) => {
  const tuition = ((value?.tuitionFee as Record<string, unknown> | undefined) || value || {}) as Record<string, unknown>;
  return {
    min: stripTrailingZeroDecimal(tuition.minAmount ?? value?.minAmount ?? ""),
    max: stripTrailingZeroDecimal(tuition.maxAmount ?? value?.maxAmount ?? ""),
  };
};

const normalizeRankingInteger = (value: string) => {
  const raw = normalizeScientificIntegerText(value);
  if (!raw) return "";
  const numeric = Number(raw);
  if (!Number.isFinite(numeric)) return raw.replace(/[^\d]/g, "");
  return String(Math.trunc(numeric));
};

const formatPreviewCellValue = (value: unknown, column?: string) => {
  const raw = String(value ?? "").trim();
  if (!raw) return column === "accreditation" ? "Empty" : "-";
  if (column === "phoneNumber" || column === "alternatePhone" || column === "pincode") return normalizeScientificIntegerText(raw);
  if (isCutoffPreviewColumn(column)) return raw;
  if (/^-?\d+\.0+$/.test(raw)) return stripTrailingZeroDecimal(raw);
  if (/^\d+$/.test(raw) && raw.length > 1 && raw.startsWith("0")) return raw;
  return raw;
};

const normalizeScientificInteger = (value: string) => normalizeScientificIntegerText(value);

const buildFeeRange = (min: string, max: string) => ({
  tuitionFee: { minAmount: min, maxAmount: max },
  admissionFee: { minAmount: min, maxAmount: max },
  transportFee: { minAmount: min, maxAmount: max },
  hostelFee: { minAmount: min, maxAmount: max },
  minAmount: min,
  maxAmount: max,
});

const collegeSteps = [
  "College Basic Details",
  "Media & Facilities",
  "Admission & Placement",
  "Courses & Cutoff",
];

const facilityQuickOptions = ["Library", "Sports", "WiFi", "Labs", "Transport", "Cafeteria"];
const quotaQuickOptions = ["Management Quota", "Government Quota", "Reservation Quota", "Sports Quota", "Minority Quota", "NRI Quota"];
const scholarshipQuickOptions = ["Merit Scholarship", "Government Scholarship", "Minority Scholarship", "Sports Scholarship", "Need Based Scholarship", "First Graduate Scholarship"];

function AdminPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const token = readAuthToken() || "";
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [adminState, setAdminState] = useState<AdminState>(emptyState);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({});
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "overview");
  const [statusState, setStatusState] = useState({ text: "", nonce: 0 });
  const statusText = statusState.text;
  const setStatusText = useCallback((nextText: string) => {
    setStatusState((prev) => ({
      text: String(nextText || ""),
      nonce: prev.nonce + 1,
    }));
  }, []);
  const collegeFormRef = useRef<HTMLFormElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCollegeForm, setShowCollegeForm] = useState(false);
  const [editCollegeId, setEditCollegeId] = useState("");
  const [collegeStep, setCollegeStep] = useState(0);
  const [collegeForm, setCollegeForm] = useState<CollegeForm>(emptyCollegeForm);
  const [collegeFieldErrors, setCollegeFieldErrors] = useState<Record<string, string>>({});
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [brochureFile, setBrochureFile] = useState<File | null>(null);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [editCourseId, setEditCourseId] = useState("");
  const [courseForm, setCourseForm] = useState<CourseForm>(() => createEmptyCourseForm());
  const [courseCustomFieldMode, setCourseCustomFieldMode] =
    useState<CustomCourseFieldMode>(defaultCustomCourseFieldMode);
  const [customCourseCatalog, setCustomCourseCatalog] = useState<CourseCatalogItem[]>([]);
  const [customStandaloneStreams, setCustomStandaloneStreams] = useState<string[]>([]);
  const [selectedCourseCollegeId, setSelectedCourseCollegeId] = useState("");
  const [embeddedCourses, setEmbeddedCourses] = useState<EmbeddedCourseDraft[]>([]);
  const [embeddedCourseForm, setEmbeddedCourseForm] = useState<EmbeddedCourseDraft>(() => createEmptyEmbeddedCourseDraft());
  const [embeddedCourseCustomFieldMode, setEmbeddedCourseCustomFieldMode] =
    useState<CustomCourseFieldMode>(defaultCustomCourseFieldMode);
  const [showEmbeddedCourseEditor, setShowEmbeddedCourseEditor] = useState(false);
  const [editingEmbeddedCourseIndex, setEditingEmbeddedCourseIndex] = useState<number | null>(null);
  const [showSavedCourseList, setShowSavedCourseList] = useState(false);
  const [showSubAdminForm, setShowSubAdminForm] = useState(false);
  const [editSubAdminId, setEditSubAdminId] = useState("");
  const [subAdminForm, setSubAdminForm] = useState<SubAdminForm>(emptySubAdminForm);
  const [examForm, setExamForm] = useState<ExamScheduleForm>(emptyExamScheduleForm);
  const [savedExams, setSavedExams] = useState<SavedExamSchedule[]>([]);
  const [editExamId, setEditExamId] = useState("");
  const [examSchedulesPage, setExamSchedulesPage] = useState(1);
  const [isSendingPasswordLink, setIsSendingPasswordLink] = useState(false);
  const [showCollegeEditReminderConfirm, setShowCollegeEditReminderConfirm] = useState(false);
  const [isSendingCollegeEditReminders, setIsSendingCollegeEditReminders] = useState(false);
  const [deleteCollegeDialog, setDeleteCollegeDialog] = useState<DeleteCollegeDialogState>(null);
  const [isDeletingCollege, setIsDeletingCollege] = useState(false);
  const [deleteUserDialog, setDeleteUserDialog] = useState<DeleteUserDialogState>(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [usersPage, setUsersPage] = useState(1);
  const [usersSearchText, setUsersSearchText] = useState("");
  const [editedCollegesPage, setEditedCollegesPage] = useState(1);
  const [pendingCollegesPage, setPendingCollegesPage] = useState(1);
  const [collegeNotificationsPage, setCollegeNotificationsPage] = useState(1);
  const [collegeNotificationsSearchText, setCollegeNotificationsSearchText] = useState("");
  const [deleteEnquiryDialog, setDeleteEnquiryDialog] = useState<DeleteEnquiryDialogState>(null);
  const [isDeletingEnquiry, setIsDeletingEnquiry] = useState(false);
  const [deleteSubAdminDialog, setDeleteSubAdminDialog] = useState<DeleteSubAdminDialogState>(null);
  const [isDeletingSubAdmin, setIsDeletingSubAdmin] = useState(false);
  const [deleteExamDialog, setDeleteExamDialog] = useState<DeleteExamDialogState>(null);
  const [isDeletingExam, setIsDeletingExam] = useState(false);
  const [customFacilityInput, setCustomFacilityInput] = useState("");
  const [customQuotaInput, setCustomQuotaInput] = useState("");
  const [customScholarshipInput, setCustomScholarshipInput] = useState("");
  const [showRequestNotifications, setShowRequestNotifications] = useState(false);
  const [notificationPopoverRect, setNotificationPopoverRect] = useState<{ top: number; left: number; width: number } | null>(null);
  const [seenNotificationIds, setSeenNotificationIds] = useState<string[]>([]);
  const [lastSeenNotificationAt, setLastSeenNotificationAt] = useState(0);
  const [isSeenNotificationsReady, setIsSeenNotificationsReady] = useState(false);
  const seenNotificationHydratedRef = useRef(false);
  const seenNotificationIdsRef = useRef<string[]>([]);
  const lastSeenNotificationAtRef = useRef(0);
  const notificationButtonRef = useRef<HTMLButtonElement | null>(null);
  const [expandedCollegeIds, setExpandedCollegeIds] = useState<string[]>([]);
  const [currentCollegeCardsPage, setCurrentCollegeCardsPage] = useState(1);
  const [collegeSearchText, setCollegeSearchText] = useState("");
  const examFormRef = useRef<HTMLFormElement | null>(null);
  const examNameInputRef = useRef<HTMLInputElement | null>(null);
  const loadedAdminSectionsRef = useRef<Set<string>>(new Set());
  const loadingAdminSectionsRef = useRef<Set<string>>(new Set());
  const adminDataRequestKeyRef = useRef("");
  useEffect(() => {
    if (!statusState.text.trim()) return;
    showToast(statusState.text, inferToastTypeFromMessage(statusState.text));
  }, [statusState]);
  const logoPreviewUrl = useMemo(
    () => (logoFile ? URL.createObjectURL(logoFile) : collegeForm.logo || ""),
    [collegeForm.logo, logoFile],
  );
  const coverImagePreviewUrl = useMemo(
    () => (coverImageFile ? URL.createObjectURL(coverImageFile) : collegeForm.coverImage || ""),
    [collegeForm.coverImage, coverImageFile],
  );
  const selectedFacilities = useMemo(
    () =>
      collegeForm.facilities
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    [collegeForm.facilities],
  );
  const selectedQuotas = useMemo(
    () =>
      collegeForm.quotas
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    [collegeForm.quotas],
  );
  const selectedScholarships = useMemo(
    () =>
      collegeForm.scholarships
        .split(/[\n,]+/)
        .map((item) => item.trim())
        .filter(Boolean),
    [collegeForm.scholarships],
  );
  const hasHostelFacility = useMemo(
    () => collegeForm.hostelAvailability === "available",
    [collegeForm.hostelAvailability],
  );
  const collegeImagePreviews = useMemo(
    () =>
      imageFiles.map((file, index) => ({
        key: `${file.name}-${file.lastModified}-${index}`,
        url: URL.createObjectURL(file),
        name: file.name,
      })),
    [imageFiles],
  );
  const examTableRows = useMemo(
    () =>
      savedExams.map((item) => ({
        id: item.id,
        examName: item.examName || "Exam",
        applicationFees: item.applicationFees || "-",
        startDateToApply: item.startDateToApply || "",
        lastDateToApply: item.lastDateToApply || "",
        correctionDate: item.correctionDate || "",
        lastDateForFeePayment: item.lastDateForFeePayment || "",
        admitCardRelease: item.admitCardRelease || "",
        examDate: item.examDate || "",
        resultDate: item.resultDate || "",
        isTopExam: Boolean(item.isTopExam),
        updatedAt: item.updatedAt || "",
      })),
    [savedExams],
  );
  const examSchedulesTotalPages = Math.max(1, Math.ceil(examTableRows.length / EXAM_SCHEDULES_PER_PAGE));
  const visibleExamTableRows = useMemo(
    () =>
      examTableRows.slice(
        (examSchedulesPage - 1) * EXAM_SCHEDULES_PER_PAGE,
        examSchedulesPage * EXAM_SCHEDULES_PER_PAGE,
      ),
    [examSchedulesPage, examTableRows],
  );
  const totalCollegeImageCount = collegeForm.images.length + imageFiles.length;
  const firstCollegeImagePreviewUrl = collegeImagePreviews[0]?.url || collegeForm.images[0] || "";
  const availableStreamOptions = useMemo(
    () =>
      Array.from(
        new Set([
          ...streamOptions,
          ...customStandaloneStreams.map((item) => normalizeCourseStream(item)).filter(Boolean),
          ...customCourseCatalog.map((item) => normalizeCourseStream(item.stream)).filter(Boolean),
        ]),
      ),
    [customCourseCatalog, customStandaloneStreams],
  );
  const embeddedStreamOptions = useMemo(() => {
    const currentStream = normalizeCourseStream(embeddedCourseForm.stream);
    return currentStream && !availableStreamOptions.includes(currentStream)
      ? [currentStream, ...availableStreamOptions]
      : availableStreamOptions;
  }, [availableStreamOptions, embeddedCourseForm.stream]);
  const courseStreamOptionsForForm = useMemo(() => {
    const currentStream = normalizeCourseStream(courseForm.stream);
    return currentStream && !availableStreamOptions.includes(currentStream)
      ? [currentStream, ...availableStreamOptions]
      : availableStreamOptions;
  }, [availableStreamOptions, courseForm.stream]);
  const normalizedEmbeddedStream = normalizeCourseStream(embeddedCourseForm.stream);
  const normalizedCourseStreamValue = normalizeCourseStream(courseForm.stream);
  const embeddedStreamSelectValue = embeddedStreamOptions.includes(normalizedEmbeddedStream)
    ? normalizedEmbeddedStream
    : embeddedCourseCustomFieldMode.stream || embeddedCourseForm.stream
      ? CUSTOM_STREAM_OPTION
      : "";
  const courseStreamSelectValue = courseStreamOptionsForForm.includes(normalizedCourseStreamValue)
    ? normalizedCourseStreamValue
    : courseCustomFieldMode.stream || courseForm.stream
      ? CUSTOM_STREAM_OPTION
      : "";
  const getCourseTypeOptionsForSelection = useCallback(
    (stream: string, degreeType: string) => {
      const normalizedStream = normalizeCourseStream(stream);
      const catalogOptions = [...courseCatalog, ...customCourseCatalog]
        .filter((item) => (!normalizedStream || item.stream === normalizedStream) && (!degreeType || item.degreeType === degreeType))
        .map((item) => normalizeArtsScienceCourseType(item.stream, item.courseType, item.specialization));
      const existingOptions = adminState.courses.flatMap((course) => {
        if (normalizeCourseStream(course.stream) !== normalizedStream) return [];
        if (degreeType && normalizeAdminOption(course.degreeType) !== degreeType) return [];
        return [
          normalizeArtsScienceCourseType(
            String(course.stream || course.courseCategory || ""),
            normalizeAdminOption(course.courseType),
            normalizeAdminOption(course.specialization || course.courseName),
          ),
        ].filter(Boolean);
      });

      return Array.from(new Set([...catalogOptions, ...existingOptions]));
    },
    [adminState.courses, customCourseCatalog],
  );
  const getSpecializationOptionsForSelection = useCallback(
    (stream: string, degreeType: string, courseType: string) => {
      const normalizedStream = normalizeCourseStream(stream);
      const isArtsAndScienceSelection = normalizedStream === artsAndScienceStream;
      const catalogOptions = [...courseCatalog, ...customCourseCatalog]
        .filter((item) =>
          (!normalizedStream || item.stream === normalizedStream) &&
          (!degreeType || item.degreeType === degreeType) &&
          (!courseType || item.courseType === courseType),
        )
        .map((item) => ({
          value: item.specialization,
          label:
            isArtsAndScienceSelection || item.specialization === item.courseType
              ? item.specialization
              : `${item.courseType} - ${item.specialization}`,
        }));
      const existingOptions = adminState.courses.flatMap((course) => {
        if (normalizeCourseStream(course.stream) !== normalizedStream) return [];
        if (degreeType && normalizeAdminOption(course.degreeType) !== degreeType) return [];
        const existingCourseType = normalizeArtsScienceCourseType(
          String(course.stream || course.courseCategory || ""),
          normalizeAdminOption(course.courseType),
          normalizeAdminOption(course.specialization || course.courseName),
        );
        if (courseType && existingCourseType !== courseType) return [];

        const specialization = normalizeAdminOption(course.specialization || course.courseName);
        if (!specialization) return [];

        return [{
          value: specialization,
          label:
            isArtsAndScienceSelection || specialization === existingCourseType
              ? specialization
              : `${existingCourseType} - ${specialization}`,
        }];
      });

      const optionMap = new Map<string, CourseOption>();
      [...catalogOptions, ...existingOptions].forEach((item) => {
        if (!item.value) return;
        optionMap.set(item.value, item);
      });

      return Array.from(optionMap.values());
    },
    [adminState.courses, customCourseCatalog],
  );
  const embeddedCourseTypeOptions = useMemo(
    () => getCourseTypeOptionsForSelection(embeddedCourseForm.stream, embeddedCourseForm.degreeType),
    [embeddedCourseForm.degreeType, embeddedCourseForm.stream, getCourseTypeOptionsForSelection],
  );
  const courseTypeOptions = useMemo(
    () => getCourseTypeOptionsForSelection(courseForm.stream, courseForm.degreeType),
    [courseForm.degreeType, courseForm.stream, getCourseTypeOptionsForSelection],
  );
  const embeddedSpecializationEntries = useMemo(
    () => getSpecializationOptionsForSelection(embeddedCourseForm.stream, embeddedCourseForm.degreeType, embeddedCourseForm.courseType),
    [embeddedCourseForm.courseType, embeddedCourseForm.degreeType, embeddedCourseForm.stream, getSpecializationOptionsForSelection],
  );
  const courseSpecializationEntries = useMemo(
    () => getSpecializationOptionsForSelection(courseForm.stream, courseForm.degreeType, courseForm.courseType),
    [courseForm.courseType, courseForm.degreeType, courseForm.stream, getSpecializationOptionsForSelection],
  );
  const embeddedQualificationOptions = useMemo(
    () =>
      getQualificationSuggestions(
        embeddedCourseForm.courseType,
        embeddedCourseForm.degreeType,
        embeddedCourseForm.stream,
      ),
    [embeddedCourseForm.courseType, embeddedCourseForm.degreeType, embeddedCourseForm.stream],
  );
  const courseQualificationOptions = useMemo(
    () =>
      getQualificationSuggestions(
        courseForm.courseType,
        courseForm.degreeType,
        courseForm.stream,
      ),
    [courseForm.courseType, courseForm.degreeType, courseForm.stream],
  );
  const addCustomStreamOption = useCallback((rawValue: string) => {
    const nextValue = normalizeCourseStream(rawValue);
    if (!nextValue) return false;
    setCustomStandaloneStreams((prev) => (prev.includes(nextValue) ? prev : [...prev, nextValue]));
    return true;
  }, []);
  const addCustomCourseCatalogItem = useCallback((item: CourseCatalogItem) => {
    const normalizedStream = normalizeCourseStream(item.stream);
    const normalizedCourseType = normalizeAdminOption(item.courseType);
    const normalizedSpecialization = normalizeAdminOption(item.specialization);
    const normalizedDegreeType = normalizeAdminOption(item.degreeType);
    if (!normalizedStream || !normalizedCourseType || !normalizedDegreeType) return false;

    setCustomCourseCatalog((prev) => {
      const alreadyExists = prev.some(
        (entry) =>
          entry.stream === normalizedStream &&
          entry.degreeType === normalizedDegreeType &&
          entry.courseType === normalizedCourseType &&
          normalizeAdminOption(entry.specialization) === normalizedSpecialization,
      );
      if (alreadyExists) return prev;
      return [
        ...prev,
        {
          stream: normalizedStream,
          degreeType: normalizedDegreeType,
          courseType: normalizedCourseType,
          specialization: normalizedSpecialization,
        },
      ];
    });
    return true;
  }, []);
  const embeddedResolvedCourseName = useMemo(
    () => embeddedCourseForm.courseType,
    [embeddedCourseForm.courseType],
  );
  const courseResolvedCourseName = useMemo(
    () => courseForm.courseType,
    [courseForm.courseType],
  );
  const embeddedCourseNameSelectValue = embeddedCourseTypeOptions.includes(embeddedResolvedCourseName)
    ? embeddedResolvedCourseName
    : embeddedResolvedCourseName
      ? CUSTOM_COURSE_NAME_OPTION
      : "";
  const embeddedSpecializationOptionValues = embeddedSpecializationEntries.map((item) => item.value);
  const courseSpecializationOptionValues = courseSpecializationEntries.map((item) => item.value);
  const embeddedSpecializationSelectValue = embeddedSpecializationOptionValues.includes(embeddedCourseForm.specialization)
    ? embeddedCourseForm.specialization
    : embeddedCourseCustomFieldMode.specialization || embeddedCourseForm.specialization
      ? CUSTOM_SPECIALIZATION_OPTION
      : "";
  const courseNameSelectValue = courseTypeOptions.includes(courseResolvedCourseName)
    ? courseResolvedCourseName
    : courseCustomFieldMode.courseName || courseResolvedCourseName
      ? CUSTOM_COURSE_NAME_OPTION
      : "";
  const courseSpecializationSelectValue = courseSpecializationOptionValues.includes(courseForm.specialization)
    ? courseForm.specialization
    : courseCustomFieldMode.specialization || courseForm.specialization
      ? CUSTOM_SPECIALIZATION_OPTION
      : "";
  const embeddedCutoffRangeConfig = useMemo(
    () =>
      resolveCutoffRangeConfig(
        embeddedResolvedCourseName,
        embeddedCourseForm.degreeType,
        embeddedCourseForm.stream,
        embeddedCourseForm.minimumQualification,
      ),
    [
      embeddedCourseForm.degreeType,
      embeddedCourseForm.minimumQualification,
      embeddedCourseForm.stream,
      embeddedResolvedCourseName,
    ],
  );
  const courseCutoffRangeConfig = useMemo(
    () =>
      resolveCutoffRangeConfig(
        courseResolvedCourseName,
        courseForm.degreeType,
        courseForm.stream,
        courseForm.minimumQualification,
      ),
    [courseForm.degreeType, courseForm.minimumQualification, courseForm.stream, courseResolvedCourseName],
  );
  const canAccess = useCallback(
    (module: string) =>
      Boolean(currentUser?.isSuperAdmin || currentUser?.permissions?.includes(module)),
    [currentUser],
  );

  const navItems = useMemo(
    () => [
      ...adminAccessSections.filter((section) => canAccess(section.id)),
      ...(currentUser?.isSuperAdmin
        ? [{ id: "admin-access", label: "Admin Access", icon: KeyRound }]
        : []),
    ],
    [canAccess, currentUser],
  );

  const availableCountries = useMemo(() => ["India"], []);
  const availableStates = useMemo(() => INDIA_STATES, []);
  const availableDistricts = useMemo(
    () =>
      collegeForm.state
        ? (INDIA_STATE_DISTRICT_MAP[collegeForm.state] || []).slice().sort((a, b) => a.localeCompare(b))
        : [],
    [collegeForm.state],
  );
  const filteredCollegeCards = useMemo(() => {
    const normalizedSearch = collegeSearchText.trim().toLowerCase();
    if (!normalizedSearch) return adminState.colleges;

    return adminState.colleges
      .map((college, index) => ({
        college,
        index,
        score: scoreAdminCollegeSearchResult(college, normalizedSearch),
      }))
      .filter((entry) => entry.score > 0)
      .sort((left, right) => right.score - left.score || left.index - right.index)
      .map((entry) => entry.college);
  }, [adminState.colleges, collegeSearchText]);
  const collegeCardsPerPage = 10;
  const collegeCardsTotalPages = Math.max(1, Math.ceil(filteredCollegeCards.length / collegeCardsPerPage));
  const safeCollegeCardsPage = Math.min(currentCollegeCardsPage, collegeCardsTotalPages);
  const collegeCardsPageStart = filteredCollegeCards.length === 0 ? 0 : (safeCollegeCardsPage - 1) * collegeCardsPerPage + 1;
  const collegeCardsPageEnd = filteredCollegeCards.length
    ? Math.min(safeCollegeCardsPage * collegeCardsPerPage, filteredCollegeCards.length)
    : 0;
  const visibleCollegeCards = useMemo(
    () =>
      filteredCollegeCards.slice(
        (safeCollegeCardsPage - 1) * collegeCardsPerPage,
        safeCollegeCardsPage * collegeCardsPerPage,
      ),
    [filteredCollegeCards, safeCollegeCardsPage],
  );
  const collegeCardPageOptions = useMemo(() => {
    const pages: Array<{ value: string; label: string }> = [];
    for (let page = 1; page <= collegeCardsTotalPages; page += 1) {
      const start = (page - 1) * collegeCardsPerPage + 1;
      const end = Math.min(page * collegeCardsPerPage, filteredCollegeCards.length);
      pages.push({ value: String(page), label: `${start}-${end}` });
    }
    return pages;
  }, [collegeCardsTotalPages, filteredCollegeCards.length]);
  const getAdminSectionKeys = useCallback((tabId: string) => {
    if (tabId === "overview") {
      return ["colleges", "courses", "users", "enquiries", "collegeRequests", "subAdmins", "siteSettings"];
    }
    if (tabId === "bulk-upload") return ["colleges"];
    if (tabId === "colleges") return ["colleges", "courses"];
    if (tabId === "courses") return ["colleges", "courses"];
    if (tabId === "users") return ["users"];
    if (tabId === "enquiries") return ["enquiries"];
    if (tabId === "college-notifications") return ["collegeRequests", "colleges"];
    if (tabId === "exams") return ["siteSettings"];
    if (tabId === "admin-access") return ["subAdmins"];
    return [] as string[];
  }, []);

  const loadAdminData = useCallback(async (
    authToken: string,
    fallbackUser?: AdminUser | null,
    scopeTabId: string = activeTab,
    forceRefresh = false,
  ) => {
    try {
      const me = await request("/api/admin/me", withAuth(authToken));
      const nextUser: AdminUser = {
        id: String(me?.admin?.id || fallbackUser?.id || "admin"),
        name: me?.admin?.name || fallbackUser?.name || "Admin",
        email: me?.admin?.email || fallbackUser?.email || "",
        role: "admin",
        isSuperAdmin: Boolean(me?.admin?.isSuperAdmin),
        permissions: Array.isArray(me?.admin?.permissions) ? me.admin.permissions : [],
      };

      window.localStorage.setItem("collegehub_current_user", JSON.stringify(nextUser));
      setCurrentUser(nextUser);

      const canRead = (module: string) =>
        Boolean(nextUser.isSuperAdmin || nextUser.permissions?.includes(module));

      const sectionKeys = getAdminSectionKeys(scopeTabId);
      const shouldLoad =
        forceRefresh ||
        sectionKeys.some(
          (key) =>
            !loadedAdminSectionsRef.current.has(key) &&
            !loadingAdminSectionsRef.current.has(key),
        );
      if (!shouldLoad) return;

      sectionKeys.forEach((key) => loadingAdminSectionsRef.current.add(key));
      setLoading(true);

      const jobs: Array<Promise<unknown>> = [];
      const jobKeys: string[] = [];
      const queueJob = (key: string, job: Promise<unknown>) => {
        jobKeys.push(key);
        jobs.push(job);
      };

      if (sectionKeys.includes("colleges") && canRead("colleges")) {
        queueJob("colleges", request("/api/admin/colleges", withAuth(authToken)));
      }
      if (sectionKeys.includes("courses") && canRead("courses")) {
        queueJob("courses", request("/api/admin/courses", withAuth(authToken)));
      }
      if (sectionKeys.includes("users") && canRead("users")) {
        queueJob("users", request("/api/admin/users", withAuth(authToken)));
      }
      if (sectionKeys.includes("enquiries") && canRead("enquiries")) {
        queueJob("enquiries", request("/api/admin/enquiries", withAuth(authToken)));
      }
      if (sectionKeys.includes("collegeRequests") && canRead("college-notifications")) {
        queueJob("collegeRequests", request("/api/admin/college-add-requests", withAuth(authToken)));
      }
      if (sectionKeys.includes("subAdmins") && nextUser.isSuperAdmin) {
        queueJob("subAdmins", request("/api/admin/sub-admins", withAuth(authToken)).catch(() => ({})));
      }
      if (sectionKeys.includes("siteSettings") && (canRead("exams") || canRead("overview"))) {
        queueJob("siteSettings", request("/api/admin/site-settings", withAuth(authToken)).catch(() => ({})));
      }

      if (jobs.length === 0) {
        loadedAdminSectionsRef.current.add(scopeTabId);
        return;
      }

      const results = await Promise.all(jobs);

      setAdminState((prev) => {
        const nextAdminState: AdminState = { ...prev };

        results.forEach((result, index) => {
          const key = jobKeys[index];
          if (key === "colleges") {
            nextAdminState.colleges = ((result as { colleges?: AdminCollege[] })?.colleges || []);
          }
          if (key === "courses") {
          nextAdminState.courses = ((result as { courses?: AdminCourse[] })?.courses || []);
        }
        if (key === "users") {
          nextAdminState.users = (((result as { users?: PlatformUser[] })?.users || [])).filter((item) => item.role !== "admin");
        }
        if (key === "enquiries") {
          nextAdminState.enquiries = ((result as { enquiries?: Enquiry[] })?.enquiries || []);
        }
        if (key === "collegeRequests") {
          nextAdminState.collegeRequests = ((result as { requests?: RequestItem[] })?.requests || []);
        }
        if (key === "subAdmins") {
          nextAdminState.subAdmins = ((result as { admins?: SubAdmin[] })?.admins || []);
        }
          if (key === "siteSettings") {
            setSiteSettings((result as { settings?: SiteSettings })?.settings || {});
          }
          loadedAdminSectionsRef.current.add(key);
        });

        return nextAdminState;
      });

      loadedAdminSectionsRef.current.add(scopeTabId);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to load admin";
      setStatusText(message);
      if (message.toLowerCase().includes("not authorized")) {
        clearAuth();
        router.replace("/login?redirect=/admin");
      }
    } finally {
      getAdminSectionKeys(scopeTabId).forEach((key) => loadingAdminSectionsRef.current.delete(key));
      setLoading(false);
    }
  }, [router, setStatusText]);

  const handleBulkImportComplete = useCallback(async () => {
    if (!token) return;
    loadedAdminSectionsRef.current.delete("colleges");
    loadedAdminSectionsRef.current.delete("courses");
    await loadAdminData(token, currentUser, "colleges", true);
    setActiveTab("colleges");
  }, [currentUser, loadAdminData, token]);

  useEffect(() => {
    setSavedExams(
      Array.isArray(siteSettings.examSchedules)
        ? siteSettings.examSchedules.filter(
            (item) => typeof item?.id === "string" && typeof item?.examName === "string",
          )
        : [],
    );
  }, [siteSettings.examSchedules]);

  useEffect(() => {
    setExamSchedulesPage((page) => Math.min(Math.max(page, 1), examSchedulesTotalPages));
  }, [examSchedulesTotalPages]);

  useEffect(() => {
    const storedToken = readAuthToken();
    const storedUser = readCurrentUser() as AdminUser | null;

    if (!storedToken || !storedUser) {
      router.replace("/login?redirect=/admin");
      return;
    }
    if (storedUser.role !== "admin") {
      router.replace(storedUser.role === "college" ? "/college-dashboard" : "/account");
      return;
    }

    window.localStorage.setItem("collegehub_current_user", JSON.stringify(storedUser));
    setCurrentUser(storedUser);

    return undefined;
  }, [loadAdminData, router]);

  useEffect(() => {
    if (!token || !currentUser) return;
    const requestKey = `${currentUser.id || "unknown"}:${activeTab}`;
    if (adminDataRequestKeyRef.current === requestKey) return;
    adminDataRequestKeyRef.current = requestKey;
    void loadAdminData(token, currentUser, activeTab, false);
  }, [activeTab, currentUser, loadAdminData, token]);

  useEffect(() => {
    if (!navItems.find((item) => item.id === activeTab)) {
      setActiveTab(navItems[0]?.id || "overview");
    }
  }, [activeTab, navItems]);

  useEffect(() => {
    const rawTab = searchParams.get("tab") || "overview";
    const nextTab = rawTab === "college-requests" ? "college-notifications" : rawTab;
    setActiveTab(nextTab);
  }, [searchParams]);

  const filteredUsers = useMemo(() => {
    const query = usersSearchText.trim().toLowerCase();
    if (!query) return adminState.users;

    return adminState.users.filter((user) =>
      [user.name, user.email, user.phone, user.role]
        .map((value) => String(value || "").toLowerCase())
        .some((value) => value.includes(query)),
    );
  }, [adminState.users, usersSearchText]);
  const usersTotalPages = Math.max(1, Math.ceil(filteredUsers.length / usersRowsPerPage));
  const usersPageStart = filteredUsers.length === 0 ? 0 : (usersPage - 1) * usersRowsPerPage + 1;
  const usersPageEnd = Math.min(usersPage * usersRowsPerPage, filteredUsers.length);
  const visibleUsers = useMemo(
    () => filteredUsers.slice((usersPage - 1) * usersRowsPerPage, usersPage * usersRowsPerPage),
    [filteredUsers, usersPage],
  );
  const usersPaginationItems = useMemo<(number | string)[]>(() => {
    if (usersTotalPages <= 6) {
      return Array.from({ length: usersTotalPages }, (_, index) => index + 1);
    }

    if (usersPage <= 4) {
      return [1, 2, 3, 4, 5, "ellipsis", usersTotalPages];
    }

    if (usersPage >= usersTotalPages - 3) {
      return [1, "ellipsis", ...Array.from({ length: 5 }, (_, index) => usersTotalPages - 4 + index)];
    }

    return [1, "ellipsis-left", usersPage - 1, usersPage, usersPage + 1, "ellipsis-right", usersTotalPages];
  }, [usersPage, usersTotalPages]);

  useEffect(() => {
    setUsersPage((current) => Math.min(current, usersTotalPages));
  }, [usersTotalPages]);

  useEffect(() => {
    if (activeTab === "users") {
      setUsersPage(1);
    }
  }, [activeTab]);

  useEffect(() => {
    setUsersPage(1);
  }, [usersSearchText]);

  useEffect(() => {
    setCurrentCollegeCardsPage((current) => Math.min(Math.max(current, 1), collegeCardsTotalPages));
  }, [collegeCardsTotalPages]);

  useEffect(() => {
    setCurrentCollegeCardsPage(1);
  }, [collegeSearchText]);

  useEffect(() => {
    if (collegeForm.state && !availableDistricts.includes(collegeForm.district)) {
      setCollegeForm((prev) => ({ ...prev, district: "" }));
    }
  }, [availableDistricts, collegeForm.district, collegeForm.state]);

  useEffect(() => {
    if (!showCollegeForm || activeTab !== "colleges") return;

    const timer = window.setTimeout(() => {
      collegeFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);

    return () => window.clearTimeout(timer);
  }, [activeTab, collegeStep, showCollegeForm]);

  useEffect(() => {
    if (collegeForm.hostelAvailability === "available") return;

    setCollegeForm((prev) => ({
      ...prev,
      hostelAvailability: "not_available",
      hostelType: "",
      hostelFeeMin: "",
      hostelFeeMax: "",
      cctvAvailable: "",
      hostelFacilityOptions: "",
      hostelRules: "",
    }));
    setCollegeFieldErrors((prev) => {
      const next = { ...prev };
      delete next.hostelType;
      delete next.hostelFeeMin;
      delete next.cctvAvailable;
      return next;
    });
  }, [collegeForm.hostelAvailability]);

  useEffect(() => {
    return () => {
      if (logoFile && logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
      if (coverImageFile && coverImagePreviewUrl) URL.revokeObjectURL(coverImagePreviewUrl);
      collegeImagePreviews.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [collegeImagePreviews, coverImageFile, coverImagePreviewUrl, logoFile, logoPreviewUrl]);

  useEffect(() => {
    const nextUniversity = collegeForm.university.trim();
    if (!nextUniversity) return;
    setEmbeddedCourseForm((previous) =>
      previous.university.trim()
        ? previous
        : { ...previous, university: nextUniversity },
    );
  }, [collegeForm.university]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    const params = new URLSearchParams(searchParams.toString());
    if (tabId === "overview") {
      params.delete("tab");
    } else {
      params.set("tab", tabId);
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  };

  const buildEmbeddedCourseDraft = (course: AdminCourse, collegeId?: string): EmbeddedCourseDraft => {
    const collegeDetail =
      (course.collegeDetails || []).find(
        (item) =>
          (typeof item.college === "string" ? item.college : String(item.college?._id || "")) === collegeId,
      ) ||
      course.collegeDetails?.[0];
    const detailCutoffByCategory =
      Array.isArray(collegeDetail?.cutoffByCategory) && collegeDetail.cutoffByCategory.length > 0
        ? collegeDetail.cutoffByCategory
        : course.cutoffByCategory;
    const normalizedCutoffs = normalizeCategoryCutoffsWithFallback(
      detailCutoffByCategory,
      collegeDetail?.cutoff || course.cutoff || "",
    );
    const initialCutoffCategory = normalizedCutoffs[0]?.category || defaultCutoffCategory;

    return {
      id: course._id,
      courseType: normalizeArtsScienceCourseType(
        course.stream || course.courseCategory || "",
        course.courseType || "",
        course.specialization || course.courseName || "",
      ),
      degreeType: course.degreeType || "",
      stream: normalizeCourseStream(course.stream || course.courseCategory || ""),
      specialization: course.specialization || course.courseName || course.course || "",
      duration: course.duration || "",
      mode: course.mode || "Full-time",
      lateralEntryAvailable: Boolean(course.lateralEntryAvailable),
      lateralEntryDetails: course.lateralEntryDetails || "",
      minimumQualification: formatQualificationLabel(course.minimumQualification || ""),
      university: course.university || "",
      admissionProcess: course.admissionProcess || "",
      description: course.description || "",
      isTopCourse: Boolean(course.isTopCourse),
      entranceExamsEnabled: Array.isArray(course.entranceExams) && course.entranceExams.length > 0,
      semesterFees: String(collegeDetail?.semesterFees || ""),
      totalFees: String(collegeDetail?.totalFees || ""),
      cutoffByCategory: normalizedCutoffs,
      cutoff: String(
        resolvePrimaryCategoryCutoff(
          normalizedCutoffs,
          collegeDetail?.cutoff || course.cutoff || "",
        ),
      ),
      cutoffCategory: initialCutoffCategory,
      cutoffValue: getCutoffValueForCategory(normalizedCutoffs, initialCutoffCategory),
      intake: String(collegeDetail?.intake ?? course.intake ?? ""),
      applicationFee: String(collegeDetail?.applicationFee ?? course.applicationFee ?? ""),
      entranceExams:
        Array.isArray(course.entranceExams) && course.entranceExams.length > 0
          ? course.entranceExams.map((item) => createCourseExamDraft(item))
          : [emptyCourseExam()],
    };
  };

  const getEmbeddedCourseDraftTitle = (draft: Pick<EmbeddedCourseDraft, "courseType" | "specialization">) =>
    [normalizeAdminOption(draft.courseType), normalizeAdminOption(draft.specialization)]
      .filter(Boolean)
      .join(" - ") || "This course";

  const getEmbeddedCourseIdentitySignature = (draft: EmbeddedCourseDraft) =>
    [
      normalizeCourseStream(draft.stream),
      normalizeAdminOption(draft.degreeType).toLowerCase(),
      normalizeAdminOption(draft.courseType).toLowerCase(),
      normalizeAdminOption(draft.specialization).toLowerCase(),
      normalizeAdminOption(draft.duration).toLowerCase(),
    ].join("|");

  const getEmbeddedCourseDraftSignature = (draft: EmbeddedCourseDraft) =>
    [
      getEmbeddedCourseIdentitySignature(draft),
      normalizeAdminOption(draft.university).toLowerCase(),
      normalizeAdminOption(draft.totalFees).toLowerCase(),
    ].join("|");

  const dedupeEmbeddedCourses = (drafts: EmbeddedCourseDraft[]) => {
    const seen = new Set<string>();
    return drafts.filter((draft) => {
      const signature = getEmbeddedCourseDraftSignature(draft);
      if (!signature) return true;
      if (seen.has(signature)) {
        return false;
      }
      seen.add(signature);
      return true;
    });
  };

  const buildEmbeddedCoursesForCollege = (college: AdminCollege) =>
    dedupeEmbeddedCourses(
      adminState.courses
        .filter((course) => doesAdminCourseBelongToCollege(course, college))
        .map((course) => buildEmbeddedCourseDraft(course, college._id)),
    );

  const openCollegeEditor = (college: AdminCollege, targetStep = 0) => {
    const rangeData = formatFeeRange(college.feesStructure);
    const placementData = college.placements || {};
    const hostelFees = college.hostelDetails?.hostelFees || {};
    const hostelData = college.hostelDetails || {};

    setEditCollegeId(college._id);
    setCollegeStep(targetStep);
    setShowCollegeForm(true);
    setLogoFile(null);
    setCoverImageFile(null);
    setImageFiles([]);
    setBrochureFile(null);
    setCollegeFieldErrors({});
    setCustomFacilityInput("");
    setCustomQuotaInput("");
    setCustomScholarshipInput("");
    setShowCourseForm(false);
    setShowSavedCourseList(false);
    resetEmbeddedCourseEditor();
    setEmbeddedCourses(buildEmbeddedCoursesForCollege(college));
    setCollegeForm({
      name: college.name || "",
      establishedYear: stripTrailingZeroDecimal(college.establishedYear),
      ownershipType: college.ownershipType || "",
      university: college.university || "",
      country: college.country || "India",
      state: college.state || "",
      city: college.city || "",
      district: college.district || "",
      address: college.address || "",
      pincode: college.pincode || "",
      description: college.description || "",
      reviews: college.reviews || "",
      admissionProcess: college.admissionProcess || "",
      applicationMode: college.applicationMode || "",
      ranking: formatRankingRangeForSave(String(college.ranking || "")),
      placementRate: stripTrailingZeroDecimal(placementData.placementRate ?? college.placementRate ?? ""),
      feeMin: rangeData.min,
      feeMax: rangeData.max,
      locationLink: college.locationLink || college.mapUrl || "",
      website: college.website || "",
      contactEmail: college.contactEmail || "",
      contactPhone: college.contactPhone || college.phone || "",
      alternatePhone: college.alternatePhone || "",
      accreditation: college.accreditation || "",
      awardsRecognitions: college.awardsRecognitions || "",
      quotas: Array.isArray(college.quotas) ? college.quotas.join(", ") : (college.quotas || ""),
      brochurePdfUrl: college.brochurePdfUrl || college.brochureUrl || "",
      campusVideoUrl: college.campusVideoUrl || "",
      isTopCollege: Boolean(college.isTopCollege),
      isBestCollege: Boolean(college.isBestCollege || college.isTopCollege),
      logo: college.logo || "",
      coverImage: college.image || "",
      images: Array.isArray(college.images) ? college.images : [],
      courseTags: college.courseTags || "",
      facilities: Array.isArray(college.facilities) ? college.facilities.join(", ") : (college.facilities || ""),
      scholarships: college.scholarships || "",
      highestPackage: stripTrailingZeroDecimal(placementData.highestPackage || ""),
      averagePackage: stripTrailingZeroDecimal(placementData.averagePackage || ""),
      companiesVisited: stripTrailingZeroDecimal(placementData.companiesVisited || ""),
      hostelAvailability: hostelData.availability || "not_available",
      hostelType: hostelData.hostelType || "",
      hostelFeeMin: stripTrailingZeroDecimal(hostelFees.minAmount || ""),
      hostelFeeMax: stripTrailingZeroDecimal(hostelFees.maxAmount || ""),
      cctvAvailable: String(hostelData.cctvAvailable || ""),
      boysRoomsCount: String(hostelData.boysRoomsCount || ""),
      girlsRoomsCount: String(hostelData.girlsRoomsCount || ""),
      hostelFacilityOptions: Array.isArray(hostelData.facilityOptions) ? hostelData.facilityOptions.join(", ") : "",
      waterAvailability: String(hostelData.waterAvailability || ""),
      powerBackup: String(hostelData.powerBackup || ""),
      wifiAvailable: String(hostelData.internet?.wifiAvailable || ""),
      wifiSpeed: String(hostelData.internet?.speed || ""),
      wifiPricing: String(hostelData.internet?.pricing || ""),
      foodAvailability: String(hostelData.foodAvailability || "not_available"),
      foodTimings: String(hostelData.foodTimings || ""),
      laundryService: String(hostelData.laundryService || ""),
      roomCleaningFrequency: String(hostelData.roomCleaningFrequency || ""),
      hostelRules: String(hostelData.rules || ""),
    });
  };

  const resetEmbeddedCourseEditor = () => {
    setEmbeddedCourseForm(createEmptyEmbeddedCourseDraft(collegeForm.university.trim()));
    setEmbeddedCourseCustomFieldMode(defaultCustomCourseFieldMode);
    setEditingEmbeddedCourseIndex(null);
    setShowEmbeddedCourseEditor(false);
  };

  const buildEmbeddedCourseCutoffState = (draft: EmbeddedCourseDraft) => {
    const category = String(draft.cutoffCategory || "").trim().toUpperCase();
    const cutoffValue = formatCutoffForSave(draft.cutoffValue);
    if (!category || !cutoffValue || !isValidCutoffValue(cutoffValue)) {
      return null;
    }
    if (!isCutoffWithinRangeConfig(cutoffValue, embeddedCutoffRangeConfig)) {
      return null;
    }

    const normalizedCutoffs = normalizeCategoryCutoffs(draft.cutoffByCategory);
    const nextCutoffs = normalizeCategoryCutoffs([
      ...normalizedCutoffs.filter((item) => item.category !== category),
      { category, cutoff: cutoffValue },
    ]);
    const { nextCategory, nextCutoffValue } = getNextEmbeddedCutoffSelection(category, nextCutoffs);

    return {
      ...draft,
      cutoffByCategory: nextCutoffs,
      cutoff: resolvePrimaryCategoryCutoff(nextCutoffs, cutoffValue),
      cutoffCategory: nextCategory,
      cutoffValue: nextCutoffValue,
    };
  };

  const shouldSkipEmbeddedCutoffAutoAdvance = (
    event: React.FocusEvent<HTMLInputElement>,
    segment: "start" | "end",
  ) => {
    const nextTarget = event.relatedTarget as HTMLElement | null;
    if (!nextTarget) return false;
    if (nextTarget.dataset.cutoffAction === "add") return true;
    if (segment === "start" && nextTarget.dataset.cutoffInputSegment === "end") {
      return true;
    }
    return false;
  };

  const handleEmbeddedCutoffBlur = (segment: "start" | "end") =>
    (event: React.FocusEvent<HTMLInputElement>) => {
      const shouldSkipAutoAdvance = shouldSkipEmbeddedCutoffAutoAdvance(event, segment);
      setEmbeddedCourseForm((prev) => {
        const parts = getCutoffRangeParts(prev.cutoffValue);
        const normalizedDraft = {
          ...prev,
          cutoffValue: buildCutoffRangeValue(parts.start, parts.end),
        };
        if (shouldSkipAutoAdvance) {
          return normalizedDraft;
        }
        return buildEmbeddedCourseCutoffState(normalizedDraft) ?? normalizedDraft;
      });
      setStatusText("");
    };

  const upsertEmbeddedCourseCutoff = () => {
    const category = String(embeddedCourseForm.cutoffCategory || "").trim().toUpperCase();
    const cutoffValue = formatCutoffForSave(embeddedCourseForm.cutoffValue);
    if (!category) {
      setStatusText("Select a cutoff category");
      return;
    }
    if (!cutoffValue) {
      setStatusText(cutoffValidationMessage);
      return;
    }
    if (!isCutoffWithinRangeConfig(cutoffValue, embeddedCutoffRangeConfig)) {
      setStatusText(getCutoffValidationMessageForConfig(embeddedCutoffRangeConfig));
      return;
    }

    setEmbeddedCourseForm((prev) => buildEmbeddedCourseCutoffState(prev) ?? prev);
    setStatusText("");
  };

  const removeEmbeddedCourseCutoff = (category: string) => {
    setEmbeddedCourseForm((prev) => {
      const nextCutoffs = normalizeCategoryCutoffs(prev.cutoffByCategory).filter(
        (item) => item.category !== category,
      );
      const activeCategory = nextCutoffs.some((item) => item.category === prev.cutoffCategory)
        ? prev.cutoffCategory
        : getNextCutoffCategoryValue(prev.cutoffCategory, nextCutoffs);
      return {
        ...prev,
        cutoffByCategory: nextCutoffs,
        cutoff: resolvePrimaryCategoryCutoff(nextCutoffs),
        cutoffCategory: activeCategory,
        cutoffValue: getCutoffValueForCategory(nextCutoffs, activeCategory),
      };
    });
  };

  const editEmbeddedCourse = (index: number) => {
    const draft = embeddedCourses[index];
    if (!draft) return;
    const normalizedCutoffs = normalizeCategoryCutoffsWithFallback(draft.cutoffByCategory, draft.cutoff);
    const initialCategory = normalizedCutoffs[0]?.category || defaultCutoffCategory;
    setEmbeddedCourseForm({
      ...draft,
      entranceExamsEnabled:
        Boolean(draft.entranceExamsEnabled) ||
        (Array.isArray(draft.entranceExams) && draft.entranceExams.length > 0),
      cutoffByCategory: normalizedCutoffs,
      cutoffCategory: initialCategory,
      cutoffValue: getCutoffValueForCategory(normalizedCutoffs, initialCategory),
      entranceExams:
        Array.isArray(draft.entranceExams) && draft.entranceExams.length > 0
          ? draft.entranceExams.map((exam) => ({ ...exam }))
          : [emptyCourseExam()],
    });
    setEmbeddedCourseCustomFieldMode({
      stream: !embeddedStreamOptions.includes(normalizeCourseStream(draft.stream)),
      specialization: !getSpecializationOptionsForSelection(
        draft.stream,
        draft.degreeType,
        draft.courseType,
      )
        .map((item) => item.value)
        .includes(draft.specialization),
      courseName: !getCourseTypeOptionsForSelection(draft.stream, draft.degreeType).includes(
        draft.courseType,
      ),
    });
    setEditingEmbeddedCourseIndex(index);
    setShowEmbeddedCourseEditor(true);
  };

  const saveEmbeddedCourseDraft = () => {
    if (!embeddedCourseForm.courseType.trim()) {
      setStatusText("Course name is required inside Add College > Courses");
      return;
    }
    if (!embeddedCourseForm.degreeType.trim()) {
      setStatusText("Degree type is required inside Add College > Courses");
      return;
    }
    if (!embeddedCourseForm.stream.trim()) {
      setStatusText("Stream is required inside Add College > Courses");
      return;
    }
    if (!embeddedCourseForm.specialization.trim()) {
      setStatusText("Specialization is required inside Add College > Courses");
      return;
    }
    if (!embeddedCourseForm.duration.trim()) {
      setStatusText("Duration is required inside Add College > Courses");
      return;
    }
    if (!embeddedCourseForm.minimumQualification.trim()) {
      setStatusText("Minimum qualification is required inside Add College > Courses");
      return;
    }
    if (!embeddedCourseForm.totalFees.trim()) {
      setStatusText("Total fees is required for each college course");
      return;
    }
    const normalizedDraftCutoffs = normalizeCategoryCutoffsWithFallback(
      embeddedCourseForm.cutoffByCategory,
      embeddedCourseForm.cutoffValue || embeddedCourseForm.cutoff,
      embeddedCourseForm.cutoffCategory,
    )
      .map((item) => ({
        ...item,
        cutoff: formatCutoffForSave(item.cutoff),
      }))
      .filter((item) => item.cutoff);
    if (normalizedDraftCutoffs.length === 0) {
      setStatusText("Cutoff is required for each college course");
      return;
    }
    if (normalizedDraftCutoffs.some((item) => !isValidCutoffValue(item.cutoff))) {
      setStatusText(cutoffValidationMessage);
      return;
    }
    if (normalizedDraftCutoffs.some((item) => !isCutoffWithinRangeConfig(item.cutoff, embeddedCutoffRangeConfig))) {
      setStatusText(getCutoffValidationMessageForConfig(embeddedCutoffRangeConfig));
      return;
    }
    if (!embeddedCourseForm.intake.trim()) {
      setStatusText("Allotted seats is required for each college course");
      return;
    }

    const normalizedDraft: EmbeddedCourseDraft = {
      ...embeddedCourseForm,
      courseType: embeddedResolvedCourseName.trim(),
      degreeType: embeddedCourseForm.degreeType.trim(),
      stream: embeddedCourseForm.stream.trim(),
      specialization: embeddedCourseForm.specialization.trim(),
      duration: embeddedCourseForm.duration.trim(),
      mode: embeddedCourseForm.mode.trim() || "Full-time",
      lateralEntryDetails: embeddedCourseForm.lateralEntryDetails.trim(),
      minimumQualification: embeddedCourseForm.minimumQualification.trim(),
      university: embeddedCourseForm.university.trim(),
      admissionProcess: embeddedCourseForm.admissionProcess.trim(),
      description: embeddedCourseForm.description.trim(),
      isTopCourse: Boolean(embeddedCourseForm.isTopCourse),
      entranceExamsEnabled: embeddedCourseForm.entranceExamsEnabled,
      semesterFees: embeddedCourseForm.semesterFees.trim(),
      totalFees: embeddedCourseForm.totalFees.trim(),
      cutoffByCategory: normalizedDraftCutoffs,
      cutoff: resolvePrimaryCategoryCutoff(
        normalizedDraftCutoffs,
        formatCutoffForSave(embeddedCourseForm.cutoff),
      ),
      cutoffCategory: defaultCutoffCategory,
      cutoffValue: "",
      intake: embeddedCourseForm.intake.trim(),
      applicationFee: embeddedCourseForm.applicationFee.trim(),
      entranceExams: embeddedCourseForm.entranceExams
        .filter((exam) => hasCourseExamValues(exam))
        .map((exam) => createCourseExamDraft(normalizeCourseExamDraftForSave(exam))),
    };

    const duplicateDraftIndex = embeddedCourses.findIndex((item, index) =>
      index !== editingEmbeddedCourseIndex &&
      getEmbeddedCourseIdentitySignature(item) === getEmbeddedCourseIdentitySignature(normalizedDraft),
    );
    if (duplicateDraftIndex >= 0) {
      setStatusText(`${getEmbeddedCourseDraftTitle(normalizedDraft)} is already added for this college`);
      return;
    }

    setEmbeddedCourses((prev) => {
      const next = [...prev];
      if (editingEmbeddedCourseIndex !== null && next[editingEmbeddedCourseIndex]) {
        next[editingEmbeddedCourseIndex] = normalizedDraft;
        return dedupeEmbeddedCourses(next);
      }
      return dedupeEmbeddedCourses([...next, normalizedDraft]);
    });
    setStatusText(editingEmbeddedCourseIndex !== null ? "College course updated" : "College course added");
    resetEmbeddedCourseEditor();
  };

  const removeFacility = (value: string) => {
    setCollegeForm((prev) => ({
      ...prev,
      facilities: prev.facilities
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .filter((item) => item.toLowerCase() !== value.toLowerCase())
        .join(", "),
    }));
  };

  const toggleFacility = (value: string) => {
    if (selectedFacilities.some((item) => item.toLowerCase() === value.toLowerCase())) {
      removeFacility(value);
      return;
    }

    setCollegeForm((prev) => ({
      ...prev,
      facilities: [...selectedFacilities, value].join(", "),
    }));
  };

  const addCustomFacility = () => {
    const nextValue = customFacilityInput.trim();
    if (!nextValue) return;
    if (selectedFacilities.some((item) => item.toLowerCase() === nextValue.toLowerCase())) {
      setCustomFacilityInput("");
      return;
    }

    setCollegeForm((prev) => ({
      ...prev,
      facilities: [...selectedFacilities, nextValue].join(", "),
    }));
    setCustomFacilityInput("");
  };

  const removeScholarship = (value: string) => {
    setCollegeForm((prev) => ({
      ...prev,
      scholarships: prev.scholarships
        .split(/[\n,]+/)
        .map((item) => item.trim())
        .filter(Boolean)
        .filter((item) => item.toLowerCase() !== value.toLowerCase())
        .join(", "),
    }));
  };

  const toggleScholarship = (value: string) => {
    if (selectedScholarships.some((item) => item.toLowerCase() === value.toLowerCase())) {
      removeScholarship(value);
      return;
    }

    setCollegeForm((prev) => ({
      ...prev,
      scholarships: [...selectedScholarships, value].join(", "),
    }));
  };

  const addCustomScholarship = () => {
    const nextValue = customScholarshipInput.trim();
    if (!nextValue) return;
    if (selectedScholarships.some((item) => item.toLowerCase() === nextValue.toLowerCase())) {
      setCustomScholarshipInput("");
      return;
    }

    setCollegeForm((prev) => ({
      ...prev,
      scholarships: [...selectedScholarships, nextValue].join(", "),
    }));
    setCustomScholarshipInput("");
  };

  const removeQuota = (value: string) => {
    setCollegeForm((prev) => ({
      ...prev,
      quotas: prev.quotas
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .filter((item) => item.toLowerCase() !== value.toLowerCase())
        .join(", "),
    }));
  };

  const toggleQuota = (value: string) => {
    if (selectedQuotas.some((item) => item.toLowerCase() === value.toLowerCase())) {
      removeQuota(value);
      return;
    }

    setCollegeForm((prev) => ({
      ...prev,
      quotas: [...selectedQuotas, value].join(", "),
    }));
  };

  const addCustomQuota = () => {
    const nextValue = customQuotaInput.trim();
    if (!nextValue) return;
    if (selectedQuotas.some((item) => item.toLowerCase() === nextValue.toLowerCase())) {
      setCustomQuotaInput("");
      return;
    }

    setCollegeForm((prev) => ({
      ...prev,
      quotas: [...selectedQuotas, nextValue].join(", "),
    }));
    setCustomQuotaInput("");
  };

  const clearCollegeFieldError = (field: string) => {
    setCollegeFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const normalizedRankingInput = useMemo(
    () => normalizeRankingRangeInput(collegeForm.ranking),
    [collegeForm.ranking],
  );
  const [rankingStartInput = "", rankingEndInput = ""] = normalizedRankingInput.split("-");

  const updateCollegeRankingPart = useCallback(
    (part: "start" | "end", rawValue: string) => {
      clearCollegeFieldError("ranking");
      const nextPart = String(rawValue || "").replace(/\D/g, "").slice(0, 4);

      setCollegeForm((prev) => {
        const currentInput = normalizeRankingRangeInput(prev.ranking);
        const [currentStart = "", currentEnd = ""] = currentInput.split("-");
        const nextStart = part === "start" ? nextPart : currentStart;
        const nextEnd = part === "end" ? nextPart : currentEnd;
        const nextRanking = nextStart || nextEnd ? `${nextStart}-${nextEnd}` : "";

        return {
          ...prev,
          ranking: nextRanking,
        };
      });
    },
    [clearCollegeFieldError],
  );

  const applyCollegeValidation = (validation: { step: number | null; message: string; field?: string }) => {
    if (!validation.message) {
      setCollegeFieldErrors({});
      return;
    }

    if ("field" in validation && validation.field) {
      setCollegeFieldErrors({ [validation.field]: validation.message });
      setStatusText("");
      return;
    }
    setStatusText(validation.message);
  };

  const getCollegeInputClass = (field: string) =>
    collegeFieldErrors[field] ? `${inputClass} border-rose-300 focus:border-rose-300 focus:ring-rose-100` : inputClass;

  const removeCollegeImageAt = (index: number) => {
    if (index < collegeForm.images.length) {
      setCollegeForm((prev) => ({
        ...prev,
        images: prev.images.filter((_, imageIndex) => imageIndex !== index),
      }));
      return;
    }

    const fileIndex = index - collegeForm.images.length;
    setImageFiles((prev) => prev.filter((_, imageIndex) => imageIndex !== fileIndex));
  };

  const getPendingCollegeAssetState = () => ({
    nextLogo: logoFile ? "pending-logo-upload" : collegeForm.logo,
    nextCoverImage: coverImageFile ? "pending-cover-upload" : collegeForm.coverImage,
    nextImages: [
      ...collegeForm.images,
      ...imageFiles.map((file, index) => `${file.name}-${file.lastModified}-${index}`),
    ],
  });

  const runAction = async (key: string, task: () => Promise<void>) => {
    try {
      await task();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong";
      setStatusText(message);
    } finally {
      void key;
    }
  };

  const openCollegeEditReminderConfirm = () => {
    if (!token || collegeDashboardEditStatus.notEdited.length === 0 || isSendingCollegeEditReminders) {
      return;
    }
    setShowCollegeEditReminderConfirm(true);
  };

  const closeCollegeEditReminderConfirm = () => {
    if (isSendingCollegeEditReminders) {
      return;
    }
    setShowCollegeEditReminderConfirm(false);
  };

  const confirmCollegeEditReminderSend = async () => {
    if (!token || isSendingCollegeEditReminders || collegeDashboardEditStatus.notEdited.length === 0) {
      return;
    }

    setIsSendingCollegeEditReminders(true);
    try {
      await runAction("college-edit-reminders", async () => {
        const data = await request(
          "/api/admin/colleges/send-edit-reminders",
          withAuth(token, { method: "POST" }),
        );
        setStatusText(data?.message || "Reminder emails processed for pending college edits");
      });
      setShowCollegeEditReminderConfirm(false);
    } finally {
      setIsSendingCollegeEditReminders(false);
    }
  };

  const openDeleteCollegeDialog = (college: AdminCollege, anchorElement: HTMLElement) => {
    const preferredWidth = 340;
    const viewportPadding = 12;
    const preferredHeight = 190;
    const rect = anchorElement.getBoundingClientRect();
    const availableWidth = Math.max(window.innerWidth - viewportPadding * 2, 280);
    const width = Math.min(preferredWidth, availableWidth);
    const left = Math.min(
      window.innerWidth - width - viewportPadding,
      Math.max(viewportPadding, rect.right - width),
    );
    const topPlacement = rect.top - preferredHeight - 10;
    const hasTopSpace = topPlacement >= viewportPadding;
    const placement = hasTopSpace ? "top" : "bottom";
    const top = hasTopSpace
      ? topPlacement
      : Math.min(window.innerHeight - preferredHeight - viewportPadding, rect.bottom + 10);

    setDeleteCollegeDialog({
      id: String(college._id || "").trim(),
      name: String(college.name || "").trim() || "Selected College",
      top,
      left,
      width,
      placement,
    });
  };

  const closeDeleteCollegeDialog = () => {
    if (isDeletingCollege) {
      return;
    }
    setDeleteCollegeDialog(null);
  };

  const confirmDeleteCollege = async () => {
    if (!token || !deleteCollegeDialog || isDeletingCollege) {
      return;
    }

    setIsDeletingCollege(true);
    try {
      const data = await request(
        `/api/admin/colleges/${deleteCollegeDialog.id}`,
        withAuth(token, {
          method: "DELETE",
          body: JSON.stringify({
            confirmCollegeName: deleteCollegeDialog.name,
          }),
        }),
      );
      setStatusText(data?.message || "College deleted");
      setDeleteCollegeDialog(null);
      await loadAdminData(token, currentUser, activeTab, true);
    } catch (error) {
      setStatusText(error instanceof Error ? error.message : "Unable to delete college");
    } finally {
      setIsDeletingCollege(false);
    }
  };

  const openDeleteUserDialog = (user: PlatformUser) => {
    setDeleteUserDialog({
      id: user._id,
      name: user.name || "User",
      email: user.email || "",
    });
  };

  const closeDeleteUserDialog = () => {
    if (isDeletingUser) return;
    setDeleteUserDialog(null);
  };

  const confirmDeleteUser = async () => {
    if (!token || !deleteUserDialog || isDeletingUser) {
      return;
    }

    setIsDeletingUser(true);
    try {
      const data = await request(`/api/admin/users/${deleteUserDialog.id}`, withAuth(token, { method: "DELETE" }));
      setStatusText(data?.message || "User deleted");
      setDeleteUserDialog(null);
      await loadAdminData(token, currentUser, activeTab, true);
    } catch (error) {
      setStatusText(error instanceof Error ? error.message : "Unable to delete user");
    } finally {
      setIsDeletingUser(false);
    }
  };

  const openDeleteEnquiryDialog = (enquiry: Enquiry) => {
    setDeleteEnquiryDialog({
      id: enquiry._id,
      name: enquiry.name || enquiry.user?.name || "Enquiry",
      email: enquiry.email || enquiry.user?.email || "",
    });
  };

  const closeDeleteEnquiryDialog = () => {
    if (isDeletingEnquiry) return;
    setDeleteEnquiryDialog(null);
  };

  const confirmDeleteEnquiry = async () => {
    if (!token || !deleteEnquiryDialog || isDeletingEnquiry) {
      return;
    }

    setIsDeletingEnquiry(true);
    try {
      const data = await request(`/api/admin/enquiries/${deleteEnquiryDialog.id}`, withAuth(token, { method: "DELETE" }));
      setStatusText(data?.message || "Enquiry deleted");
      setDeleteEnquiryDialog(null);
      await loadAdminData(token, currentUser, activeTab, true);
    } catch (error) {
      setStatusText(error instanceof Error ? error.message : "Unable to delete enquiry");
    } finally {
      setIsDeletingEnquiry(false);
    }
  };

  const openDeleteSubAdminDialog = (item: SubAdmin) => {
    setDeleteSubAdminDialog({
      id: item._id,
      email: item.email || "Sub-admin",
    });
  };

  const closeDeleteSubAdminDialog = () => {
    if (isDeletingSubAdmin) return;
    setDeleteSubAdminDialog(null);
  };

  const confirmDeleteSubAdmin = async () => {
    if (!token || !deleteSubAdminDialog || isDeletingSubAdmin) {
      return;
    }

    setIsDeletingSubAdmin(true);
    try {
      const data = await request(`/api/admin/sub-admins/${deleteSubAdminDialog.id}`, withAuth(token, { method: "DELETE" }));
      setStatusText(data?.message || "Admin deleted");
      setDeleteSubAdminDialog(null);
      await loadAdminData(token, currentUser, activeTab, true);
    } catch (error) {
      setStatusText(error instanceof Error ? error.message : "Unable to delete admin");
    } finally {
      setIsDeletingSubAdmin(false);
    }
  };

  const sendSuperAdminPasswordChangeLink = async () => {
    if (!token || !currentUser?.isSuperAdmin || isSendingPasswordLink) {
      return;
    }

    setIsSendingPasswordLink(true);
    try {
      const data = await request("/api/admin/super-admin/password-change/request", withAuth(token, {
        method: "POST",
      }));
      setStatusText((data as { message?: string })?.message || "Password change link sent to admin email");
    } catch (error) {
      setStatusText(error instanceof Error ? error.message : "Unable to send password change link");
    } finally {
      setIsSendingPasswordLink(false);
    }
  };

  const validateCollegeForm = (nextLogo: string, nextCoverImage: string, nextImages: string[]) => {
    const validations: CollegeValidation[] = [
      { valid: Boolean(collegeForm.name.trim()), step: 0, field: "name", message: "Basic Info: College name is required" },
      { valid: Boolean(collegeForm.description.trim()), step: 0, field: "description", message: "Basic Info: Description is required" },
      { valid: Boolean(collegeForm.establishedYear.trim()), step: 0, field: "establishedYear", message: "Basic Info: Established year is required" },
      { valid: Boolean(collegeForm.university.trim()), step: 0, field: "university", message: "Basic Info: University / affiliation is required" },
      { valid: Boolean(collegeForm.country.trim()), step: 0, field: "country", message: "Location: Country is required" },
      { valid: Boolean(collegeForm.state.trim()), step: 0, field: "state", message: "Location: State is required" },
      { valid: Boolean(collegeForm.city.trim()), step: 0, field: "city", message: "Location: City is required" },
      { valid: Boolean(collegeForm.address.trim()), step: 0, field: "address", message: "Location: Address is required" },
      { valid: Boolean(collegeForm.pincode.trim()), step: 0, field: "pincode", message: "Location: Pincode is required" },
      { valid: Boolean(collegeForm.contactEmail.trim()), step: 0, field: "contactEmail", message: "Contact: Official email is required" },
      { valid: Boolean(collegeForm.contactPhone.trim()), step: 0, field: "contactPhone", message: "Contact: Phone number is required" },
      { valid: !collegeForm.contactPhone.trim() || isValidIndianPhone(collegeForm.contactPhone.trim()), step: 0, field: "contactPhone", message: "Contact: Enter a valid phone number" },
      { valid: !collegeForm.alternatePhone.trim() || isValidIndianPhone(collegeForm.alternatePhone.trim()), step: 0, field: "alternatePhone", message: "Contact: Enter a valid alternate phone number" },
      { valid: Boolean(nextLogo.trim()), step: 1, field: "logo", message: "Media: College logo is required" },
      { valid: Boolean(nextCoverImage.trim()), step: 1, field: "coverImage", message: "Media: Cover image is required" },
      { valid: nextImages.length >= 2, step: 1, field: "images", message: "Media: At least 2 gallery images are required" },
      { valid: nextImages.length <= 7, step: 1, field: "images", message: "Media: Maximum 7 gallery images allowed" },
      {
        valid: !String(collegeForm.ranking || "").trim() || isValidRankingRange(collegeForm.ranking),
        step: 0,
        field: "ranking",
        message: "Highlights: Use NIRF format like 101-150. Both numbers must be between 1 and 9999.",
      },
      {
        valid: Boolean(collegeForm.feeMin.trim()) && Boolean(collegeForm.feeMax.trim()),
        step: 2,
        field: "feeMin",
        message: "Admission: Minimum fee and maximum fee are required",
      },
      { valid: Boolean(collegeForm.admissionProcess.trim()), step: 2, field: "admissionProcess", message: "Admission: Admission process is required" },
      { valid: Boolean(collegeForm.applicationMode.trim()), step: 2, field: "applicationMode", message: "Admission: Application mode is required" },
    ];

    if (hasHostelFacility) {
      validations.push(
        { valid: Boolean(collegeForm.hostelType.trim()), step: 1, field: "hostelType", message: "Hostel: Hostel type is required" },
        {
          valid: Boolean(collegeForm.hostelFeeMin.trim()) || Boolean(collegeForm.hostelFeeMax.trim()),
          step: 1,
          field: "hostelFeeMin",
          message: "Hostel: Hostel fee structure is required",
        },
        { valid: Boolean(collegeForm.cctvAvailable.trim()), step: 1, field: "cctvAvailable", message: "Hostel: CCTV availability is required" },
      );
    }

    const failedValidation = validations.find((item) => !item.valid);
    if (!failedValidation) {
      return { step: null, message: "" };
    }

    return { step: failedValidation.step, message: failedValidation.message };
  };

  const validateCollegeStep = (step: number) => {
    const { nextLogo, nextCoverImage, nextImages } = getPendingCollegeAssetState();
    const validationResult = validateCollegeForm(nextLogo, nextCoverImage, nextImages);

    if (!validationResult.message) {
      return { step: null, message: "" };
    }

    if (typeof validationResult.step === "number" && validationResult.step <= step) {
      return validationResult;
    }

    return { step: null, message: "" };
  };

  const navigateCollegeStep = (targetStep: number) => {
    if (targetStep <= collegeStep) {
      setCollegeFieldErrors({});
      setCollegeStep(targetStep);
      return;
    }

    for (let stepIndex = collegeStep; stepIndex < targetStep; stepIndex += 1) {
      const validationResult = validateCollegeStep(stepIndex);
      if (validationResult.message) {
        applyCollegeValidation(validationResult);
        if (typeof validationResult.step === "number") {
          setCollegeStep(validationResult.step);
        }
        return;
      }
    }

    setStatusText("");
    setCollegeFieldErrors({});
    setCollegeStep(targetStep);
  };

  const uploadAssets = async () => {
    if (!token || (!logoFile && !coverImageFile && imageFiles.length === 0 && !brochureFile)) {
      return { logo: "", coverImage: "", images: [] as string[], brochurePdfUrl: "" };
    }

    const formData = new FormData();
    if (logoFile) formData.append("logo", logoFile);
    if (coverImageFile) formData.append("coverImage", coverImageFile);
    imageFiles.forEach((file) => formData.append("images", file));
    if (brochureFile) formData.append("brochure", brochureFile);

    const data = await request("/api/admin/upload-assets", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    return {
      logo: String(data?.data?.logo || ""),
      coverImage: String(data?.data?.coverImage || ""),
      images: Array.isArray(data?.data?.images) ? (data.data.images as string[]) : [],
      brochurePdfUrl: String(data?.data?.brochurePdfUrl || ""),
    };
  };

  const resetCollegeForm = () => {
    setShowCollegeForm(false);
    setEditCollegeId("");
    setCollegeStep(0);
    setCollegeForm(emptyCollegeForm);
    setCollegeFieldErrors({});
    setEmbeddedCourses([]);
    setLogoFile(null);
    setCoverImageFile(null);
    setImageFiles([]);
    setBrochureFile(null);
    setShowCourseForm(false);
    setShowSavedCourseList(false);
    setCustomFacilityInput("");
    setCustomQuotaInput("");
    setCustomScholarshipInput("");
    resetEmbeddedCourseEditor();
  };

  const resetCourseForm = () => {
    setShowCourseForm(false);
    setEditCourseId("");
    setSelectedCourseCollegeId("");
    setCourseForm(createEmptyCourseForm(collegeForm.university.trim()));
    setCourseCustomFieldMode(defaultCustomCourseFieldMode);
  };

  const saveCourse = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) return;

    await runAction(editCourseId || "course-new", async () => {
      const selectedCollegeIds = [...new Set(courseForm.colleges.filter(Boolean))];
      if (selectedCollegeIds.length === 0) {
        setStatusText("Select at least one college for this course");
        return;
      }

      const collegeWithoutIntake = selectedCollegeIds.find(
        (collegeId) => !String(courseForm.details[collegeId]?.intake || "").trim(),
      );
      if (collegeWithoutIntake) {
        const collegeName =
          adminState.colleges.find((college) => college._id === collegeWithoutIntake)?.name || "selected college";
        setStatusText(`Allotted seats is required for ${collegeName}`);
        return;
      }
      const collegeWithoutCutoff = selectedCollegeIds.find(
        (collegeId) => !String(courseForm.details[collegeId]?.cutoff || "").trim(),
      );
      if (collegeWithoutCutoff) {
        const collegeName =
          adminState.colleges.find((college) => college._id === collegeWithoutCutoff)?.name || "selected college";
        setStatusText(`Cutoff is required for ${collegeName}`);
        return;
      }
      const collegeWithInvalidCutoff = selectedCollegeIds.find(
        (collegeId) => !isValidCutoffValue(courseForm.details[collegeId]?.cutoff || ""),
      );
      if (collegeWithInvalidCutoff) {
        const collegeName =
          adminState.colleges.find((college) => college._id === collegeWithInvalidCutoff)?.name || "selected college";
        setStatusText(`${collegeName}: ${cutoffValidationMessage}`);
        return;
      }
      const collegeWithOutOfRangeCutoff = selectedCollegeIds.find(
        (collegeId) => !isCutoffWithinRangeConfig(courseForm.details[collegeId]?.cutoff || "", courseCutoffRangeConfig),
      );
      if (collegeWithOutOfRangeCutoff) {
        const collegeName =
          adminState.colleges.find((college) => college._id === collegeWithOutOfRangeCutoff)?.name || "selected college";
        setStatusText(`${collegeName}: ${getCutoffValidationMessageForConfig(courseCutoffRangeConfig)}`);
        return;
      }

      const collegeDetails = selectedCollegeIds.map((collegeId) => ({
        college: collegeId,
        semesterFees: Number(courseForm.details[collegeId]?.semesterFees || 0),
        totalFees: Number(courseForm.details[collegeId]?.totalFees || 0),
        hostelFees: 0,
        cutoff: formatCutoffForSave(courseForm.details[collegeId]?.cutoff || ""),
        intake: Number(courseForm.details[collegeId]?.intake || 0),
        applicationFee: Number(courseForm.details[collegeId]?.applicationFee || 0),
      }));
      const primaryCollegeId = selectedCollegeIds[0] || "";
      const primaryDetails = courseForm.details[primaryCollegeId] || emptyCourseDetail();
      const normalizedCourseStream = normalizeCourseStream(courseForm.stream);

      const data = await request(
        editCourseId ? `/api/admin/courses/${editCourseId}` : "/api/admin/courses",
        withAuth(token, {
          method: editCourseId ? "PUT" : "POST",
          body: JSON.stringify({
            course: `${courseForm.courseType} - ${normalizedCourseStream} - ${courseForm.specialization}`,
            courseType: courseResolvedCourseName.trim(),
            courseCategory: normalizedCourseStream,
            courseName: courseForm.specialization.trim(),
            degreeType: courseForm.degreeType.trim(),
            stream: normalizedCourseStream,
            specialization: courseForm.specialization.trim(),
            duration: courseForm.duration.trim(),
            mode: courseForm.mode.trim(),
            lateralEntryAvailable: courseForm.lateralEntryAvailable,
            lateralEntryDetails: courseForm.lateralEntryDetails.trim(),
            minimumQualification: courseForm.minimumQualification.trim(),
            university: courseForm.university.trim(),
            admissionProcess: courseForm.admissionProcess.trim(),
            description: courseForm.description.trim(),
            isTopCourse: courseForm.isTopCourse,
            entranceExams: courseForm.entranceExams
              .filter((item) => hasCourseExamValues(item))
              .map((item) => normalizeCourseExamDraftForSave(item)),
            colleges: selectedCollegeIds,
            college: primaryCollegeId,
            semesterFees: Number(primaryDetails.semesterFees || 0),
            totalFees: Number(primaryDetails.totalFees || 0),
            hostelFees: 0,
            cutoff: formatCutoffForSave(primaryDetails.cutoff || ""),
            intake: Number(primaryDetails.intake || 0),
            applicationFee: Number(primaryDetails.applicationFee || 0),
            collegeDetails,
          }),
        }),
      );

      setStatusText(data?.message || "Course saved");
      resetCourseForm();
      await loadAdminData(token, currentUser, activeTab, true);
    });
  };

  const resetSubAdminForm = () => {
    setShowSubAdminForm(false);
    setEditSubAdminId("");
    setSubAdminForm(emptySubAdminForm);
  };

  const saveCollege = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) return;

    await runAction(editCollegeId || "college-new", async () => {
      const uploaded = await uploadAssets();
      const nextImages = [...new Set([...collegeForm.images, ...uploaded.images])].filter(Boolean);
      const nextLogo = uploaded.logo || collegeForm.logo;
      const nextCoverImage = uploaded.coverImage || collegeForm.coverImage;
      const nextBrochure = uploaded.brochurePdfUrl || collegeForm.brochurePdfUrl;
      const validationResult = validateCollegeForm(nextLogo, nextCoverImage, nextImages);

      if (validationResult.message) {
        applyCollegeValidation(validationResult);
        if (typeof validationResult.step === "number") {
          setCollegeStep(validationResult.step);
        }
        return;
      }

      const data = await request(
        editCollegeId ? `/api/admin/colleges/${editCollegeId}` : "/api/admin/colleges",
        withAuth(token, {
          method: editCollegeId ? "PUT" : "POST",
          body: JSON.stringify({
            name: collegeForm.name.trim(),
            establishedYear: collegeForm.establishedYear.trim(),
            ownershipType: collegeForm.ownershipType.trim(),
            university: collegeForm.university.trim(),
            country: collegeForm.country.trim() || "India",
            state: collegeForm.state.trim(),
            city: collegeForm.city.trim(),
            district: collegeForm.district.trim(),
            address: collegeForm.address.trim(),
            pincode: collegeForm.pincode.trim(),
            description: collegeForm.description.trim(),
            reviews: collegeForm.reviews.trim(),
            admissionProcess: collegeForm.admissionProcess.trim(),
            applicationMode: collegeForm.applicationMode.trim(),
            logo: nextLogo,
            images: nextImages,
            image: nextCoverImage,
            ranking: formatRankingRangeForSave(collegeForm.ranking),
            placementRate: collegeForm.placementRate.trim(),
            feesStructure: buildFeeRange(collegeForm.feeMin.trim(), collegeForm.feeMax.trim()),
            locationLink: collegeForm.locationLink.trim(),
            website: collegeForm.website.trim(),
            contactEmail: collegeForm.contactEmail.trim(),
            contactPhone: collegeForm.contactPhone.trim(),
            alternatePhone: collegeForm.alternatePhone.trim(),
            accreditation: collegeForm.accreditation.trim(),
            awardsRecognitions: collegeForm.awardsRecognitions.trim(),
            quotas: collegeForm.quotas
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean),
            brochurePdfUrl: nextBrochure.trim(),
            campusVideoUrl: collegeForm.campusVideoUrl.trim(),
            isTopCollege: collegeForm.isTopCollege,
            isBestCollege: collegeForm.isBestCollege,
            courseTags: collegeForm.courseTags.trim(),
            facilities: collegeForm.facilities
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean),
            scholarships: collegeForm.scholarships.trim(),
            placements: {
              placementRate: collegeForm.placementRate.trim(),
              highestPackage: collegeForm.highestPackage.trim(),
              averagePackage: collegeForm.averagePackage.trim(),
              companiesVisited: collegeForm.companiesVisited.trim(),
            },
            hostelDetails: {
              availability: hasHostelFacility ? "available" : "not_available",
              hostelType: hasHostelFacility ? collegeForm.hostelType : "",
              cctvAvailable: hasHostelFacility ? collegeForm.cctvAvailable : "",
              boysRoomsCount: hasHostelFacility ? collegeForm.boysRoomsCount.trim() : "",
              girlsRoomsCount: hasHostelFacility ? collegeForm.girlsRoomsCount.trim() : "",
              facilityOptions:
                hasHostelFacility
                  ? collegeForm.hostelFacilityOptions
                      .split(",")
                      .map((item) => item.trim())
                      .filter(Boolean)
                  : [],
              waterAvailability: hasHostelFacility ? collegeForm.waterAvailability : "",
              powerBackup: hasHostelFacility ? collegeForm.powerBackup : "",
              internet: {
                wifiAvailable: hasHostelFacility ? collegeForm.wifiAvailable : "",
                speed: hasHostelFacility ? collegeForm.wifiSpeed.trim() : "",
                pricing: hasHostelFacility ? collegeForm.wifiPricing : "",
              },
              foodAvailability: hasHostelFacility ? collegeForm.foodAvailability : "not_available",
              foodTimings: hasHostelFacility ? collegeForm.foodTimings.trim() : "",
              laundryService: hasHostelFacility ? collegeForm.laundryService : "",
              roomCleaningFrequency: hasHostelFacility ? collegeForm.roomCleaningFrequency.trim() : "",
              rules: hasHostelFacility ? collegeForm.hostelRules.trim() : "",
              hostelFees: {
                minAmount: collegeForm.hostelFeeMin.trim(),
                maxAmount: collegeForm.hostelFeeMax.trim(),
              },
            },
          }),
        }),
      );

      const savedCollegeId = String(data?.college?._id || editCollegeId || "");
      const uniqueEmbeddedCourses = dedupeEmbeddedCourses(embeddedCourses);
      if (savedCollegeId && uniqueEmbeddedCourses.length > 0) {
        for (const draft of uniqueEmbeddedCourses) {
          const normalizedDraftStream = normalizeCourseStream(draft.stream);
          const payload = {
            course: `${getResolvedCourseName(normalizedDraftStream, draft.degreeType, draft.courseType)} - ${normalizedDraftStream} - ${draft.specialization}`,
            courseType: getResolvedCourseName(normalizedDraftStream, draft.degreeType, draft.courseType),
            courseCategory: normalizedDraftStream,
            courseName: draft.specialization,
            degreeType: draft.degreeType,
            stream: normalizedDraftStream,
            specialization: draft.specialization,
            duration: draft.duration,
            mode: draft.mode,
            lateralEntryAvailable: draft.lateralEntryAvailable,
            lateralEntryDetails: draft.lateralEntryDetails,
            minimumQualification: draft.minimumQualification,
            university: draft.university || collegeForm.university,
            admissionProcess: draft.admissionProcess,
            description: draft.description,
            isTopCourse: draft.isTopCourse,
            entranceExams: draft.entranceExams,
            colleges: [savedCollegeId],
            college: savedCollegeId,
            semesterFees: Number(draft.semesterFees || 0),
            totalFees: Number(draft.totalFees || 0),
            hostelFees: 0,
            cutoff: draft.cutoff,
            cutoffByCategory: draft.cutoffByCategory,
            intake: Number(draft.intake || 0),
            applicationFee: Number(draft.applicationFee || 0),
            collegeDetails: [
              {
                college: savedCollegeId,
                semesterFees: Number(draft.semesterFees || 0),
                totalFees: Number(draft.totalFees || 0),
                hostelFees: 0,
                cutoff: draft.cutoff,
                cutoffByCategory: draft.cutoffByCategory,
                intake: Number(draft.intake || 0),
                applicationFee: Number(draft.applicationFee || 0),
              },
            ],
          };

          await request(
            draft.id ? `/api/admin/courses/${draft.id}` : "/api/admin/courses",
            withAuth(token, {
              method: draft.id ? "PUT" : "POST",
              body: JSON.stringify(payload),
            }),
          );
        }
      }

      setCollegeFieldErrors({});
      setStatusText(data?.message || "College saved");
      resetCollegeForm();
      await loadAdminData(token, currentUser, activeTab, true);
    });
  };

  const saveSubAdmin = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) return;
    const normalizedSubAdminEmail = subAdminForm.email.trim().toLowerCase();
    const normalizedCurrentAdminEmail = String(currentUser?.email || "").trim().toLowerCase();
    if (normalizedSubAdminEmail && normalizedCurrentAdminEmail && normalizedSubAdminEmail === normalizedCurrentAdminEmail) {
      setStatusText("This is admin mail. Please use a different email for sub admin.");
      return;
    }

    await runAction(editSubAdminId || "sub-admin-new", async () => {
      const data = await request(
        editSubAdminId ? `/api/admin/sub-admins/${editSubAdminId}` : "/api/admin/sub-admins",
        withAuth(token, {
          method: editSubAdminId ? "PUT" : "POST",
          body: JSON.stringify({
            email: normalizedSubAdminEmail,
            password: subAdminForm.password.trim(),
            permissions: subAdminForm.permissions,
          }),
        }),
      );

      setStatusText(data?.message || "Admin saved");
      resetSubAdminForm();
      await loadAdminData(token, currentUser, activeTab, true);
    });
  };

  const resetExamForm = () => {
    setExamForm(emptyExamScheduleForm);
    setEditExamId("");
  };

  const scrollToExamForm = () => {
    window.requestAnimationFrame(() => {
      examFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      examNameInputRef.current?.focus({ preventScroll: true });
    });
  };

  const startExamEdit = (item: SavedExamSchedule) => {
    setEditExamId(item.id);
    setExamForm({
      examName: item.examName || "",
      applicationFees: item.applicationFees || "",
      startDateToApply: item.startDateToApply || "",
      lastDateToApply: item.lastDateToApply || "",
      correctionDate: item.correctionDate || "",
      lastDateForFeePayment: item.lastDateForFeePayment || "",
      admitCardRelease: item.admitCardRelease || "",
      examDate: item.examDate || "",
      isTopExam: Boolean(item.isTopExam),
      resultDate: item.resultDate || "",
    });
    scrollToExamForm();
  };

  const persistExamSchedules = async (nextSchedules: SavedExamSchedule[]) => {
    if (!token) {
      throw new Error("Admin session not found");
    }

    let data;
    try {
      data = await request(
        "/api/admin/site-settings/exam-schedules",
        withAuth(token, {
          method: "PUT",
          body: JSON.stringify({ examSchedules: nextSchedules }),
        }),
      );
    } catch (error) {
      const message = error instanceof Error ? error.message.toLowerCase() : "";
      if (!message.includes("route not found")) {
        throw error;
      }

      data = await request(
        "/api/admin/site-settings/exam-schedules",
        withAuth(token, {
          method: "POST",
          body: JSON.stringify({ examSchedules: nextSchedules }),
        }),
      );
    }

    const nextSettings = (data as { settings?: SiteSettings })?.settings || {};
    setSiteSettings(nextSettings);
    setSavedExams(nextSettings.examSchedules || []);
    return data;
  };

  const saveExamSchedule = async (event: React.FormEvent) => {
    event.preventDefault();

    const normalizedExamName = examForm.examName.trim();
    if (!normalizedExamName) {
      setStatusText("Exams: Exam name is required");
      return;
    }

    const orderedDates = [
      { label: "Start Date to Apply", value: examForm.startDateToApply },
      { label: "Last Date to Apply", value: examForm.lastDateToApply },
      { label: "Last Date for Fee Payment", value: examForm.lastDateForFeePayment },
      { label: "Admit Card Release", value: examForm.admitCardRelease },
      { label: "Exam Date", value: examForm.examDate },
      { label: "Result Date", value: examForm.resultDate },
    ];

    const normalizedOrderedDates = orderedDates.map((item) => ({
      ...item,
      parsedValue: item.value ? parseExamDateValue(item.value) : null,
    }));

    const invalidDate = normalizedOrderedDates.find((item) => item.value && !item.parsedValue);
    if (invalidDate) {
      setStatusText(`Exams: ${invalidDate.label} must be in DD-MM-YYYY format`);
      return;
    }

    for (let index = 1; index < normalizedOrderedDates.length; index += 1) {
      const previous = normalizedOrderedDates[index - 1];
      const current = normalizedOrderedDates[index];
      if (previous.parsedValue && current.parsedValue && current.parsedValue < previous.parsedValue) {
        setStatusText(`Exams: ${current.label} should be after ${previous.label}`);
        return;
      }
    }

    if (examForm.correctionDate.trim()) {
      if (!correctionDateRangePattern.test(examForm.correctionDate.trim())) {
        setStatusText("Exams: Correction Date must be in DD-MM-YYYY to DD-MM-YYYY format");
        return;
      }

      const [correctionStart = "", correctionEnd = ""] = examForm.correctionDate.split(/\s+to\s+/i);
      const parsedCorrectionStart = parseDayMonthYearValue(correctionStart);
      const parsedCorrectionEnd = parseDayMonthYearValue(correctionEnd);

      if (!parsedCorrectionStart || !parsedCorrectionEnd) {
        setStatusText("Exams: Correction Date contains an invalid date");
        return;
      }

      if (parsedCorrectionEnd < parsedCorrectionStart) {
        setStatusText("Exams: Correction Date end should be after start date");
        return;
      }
    }

    const matchingExamId = savedExams.find(
      (item) =>
        item.id !== editExamId &&
        normalizeExamScheduleName(item.examName) === normalizeExamScheduleName(normalizedExamName),
    )?.id;
    const resolvedExamId = editExamId || matchingExamId || `${Date.now()}`;
    const payload: SavedExamSchedule = {
      id: resolvedExamId,
      updatedAt: new Date().toISOString(),
      examName: normalizedExamName,
      applicationFees: examForm.applicationFees.trim(),
      startDateToApply: examForm.startDateToApply,
      lastDateToApply: examForm.lastDateToApply,
      correctionDate: examForm.correctionDate.trim(),
      lastDateForFeePayment: examForm.lastDateForFeePayment,
      admitCardRelease: examForm.admitCardRelease,
      examDate: examForm.examDate,
      isTopExam: Boolean(examForm.isTopExam),
      resultDate: examForm.resultDate,
    };

    const nextSchedules = (
      editExamId || matchingExamId
        ? savedExams.map((item) => (item.id === resolvedExamId ? payload : item))
        : [payload, ...savedExams]
    );

    try {
      const data = await persistExamSchedules(nextSchedules);
      setStatusText(
        (data as { message?: string })?.message ||
          (editExamId || matchingExamId ? "Exam schedule updated" : "Exam schedule saved"),
      );
      setExamSchedulesPage(1);
      resetExamForm();
    } catch (error) {
      setStatusText(error instanceof Error ? error.message : "Unable to save exam schedule");
    }
  };

  const removeExamSchedule = async (examId: string) => {
    const nextSchedules = savedExams.filter((item) => item.id !== examId);

    try {
      const data = await persistExamSchedules(nextSchedules);
      setStatusText((data as { message?: string })?.message || "Exam schedule deleted");
      if (editExamId === examId) {
        resetExamForm();
      }
    } catch (error) {
      setStatusText(error instanceof Error ? error.message : "Unable to delete exam schedule");
    }
  };

  const openDeleteExamDialog = (exam: SavedExamSchedule) => {
    setDeleteExamDialog({
      id: exam.id,
      name: exam.examName || "Exam",
    });
  };

  const closeDeleteExamDialog = () => {
    if (isDeletingExam) return;
    setDeleteExamDialog(null);
  };

  const confirmDeleteExam = async () => {
    if (!deleteExamDialog || isDeletingExam) {
      return;
    }

    setIsDeletingExam(true);
    try {
      await removeExamSchedule(deleteExamDialog.id);
      setDeleteExamDialog(null);
    } finally {
      setIsDeletingExam(false);
    }
  };

  const collegeChangeNotifications = useMemo(
    () =>
      adminState.collegeRequests
        .filter((item) => Array.isArray(item.changeSummary) && item.changeSummary.length > 0)
        .sort(
          (left, right) =>
            new Date(right.updatedAt || right.createdAt || 0).getTime() -
            new Date(left.updatedAt || left.createdAt || 0).getTime(),
        ),
    [adminState.collegeRequests],
  );
  const filteredCollegeChangeNotifications = useMemo(() => {
    const query = collegeNotificationsSearchText.trim().toLowerCase();
    return query
      ? collegeChangeNotifications.filter((item) => {
          const searchableText = [
            item.payload?.name,
            item.requesterName,
            item.requesterEmail,
            item.status,
            ...(item.changeSummary || []).flatMap((change) => [
              change.label,
              change.field,
              String(change.before ?? ""),
              String(change.after ?? ""),
            ]),
          ]
            .map((value) => String(value || "").toLowerCase())
            .join(" ");

          return searchableText.includes(query);
        })
      : collegeChangeNotifications;
  }, [collegeChangeNotifications, collegeNotificationsSearchText]);
  const collegeNotificationsTotalPages = Math.max(
    1,
    Math.ceil(filteredCollegeChangeNotifications.length / collegeNotificationsRowsPerPage),
  );
  const collegeNotificationsPageStart =
    filteredCollegeChangeNotifications.length === 0
      ? 0
      : (collegeNotificationsPage - 1) * collegeNotificationsRowsPerPage + 1;
  const collegeNotificationsPageEnd = Math.min(
    collegeNotificationsPage * collegeNotificationsRowsPerPage,
    filteredCollegeChangeNotifications.length,
  );
  const visibleCollegeChangeNotifications = useMemo(
    () =>
      filteredCollegeChangeNotifications.slice(
        (collegeNotificationsPage - 1) * collegeNotificationsRowsPerPage,
        collegeNotificationsPage * collegeNotificationsRowsPerPage,
      ),
    [collegeNotificationsPage, filteredCollegeChangeNotifications],
  );
  const collegeNotificationsPaginationItems = useMemo(
    () => getCompactPaginationItems(collegeNotificationsPage, collegeNotificationsTotalPages),
    [collegeNotificationsPage, collegeNotificationsTotalPages],
  );
  const getNotificationCollege = useCallback(
    (item: RequestItem) => {
      // First, try to find by grantedCollegeIds if available
      if (item.grantedCollegeIds && item.grantedCollegeIds.length > 0) {
        const collegeById = adminState.colleges.find((college) => item.grantedCollegeIds?.includes(college._id));
        if (collegeById) return collegeById;
      }

      // Fall back to matching by name and email
      const notificationName = String(item.payload?.name || item.requesterName || "").trim().toLowerCase();
      const notificationEmail = String(item.requesterEmail || item.email || "").trim().toLowerCase();

      return adminState.colleges.find((college) => {
        const collegeName = String(college.name || "").trim().toLowerCase();
        const collegeEmail = String(college.contactEmail || college.ownerEmail || "").trim().toLowerCase();
        return (
          (notificationName && collegeName && collegeName === notificationName) ||
          (notificationEmail && collegeEmail && collegeEmail === notificationEmail)
        );
      });
    },
    [adminState.colleges],
  );
  useEffect(() => {
    setCollegeNotificationsPage((current) => Math.min(current, collegeNotificationsTotalPages));
  }, [collegeNotificationsTotalPages]);

  useEffect(() => {
    setCollegeNotificationsPage(1);
  }, [collegeNotificationsSearchText]);

  const stats = [
    {
      label: "Live Colleges",
      value: adminState.colleges.length,
      icon: Building2,
      helper: "Published and visible now",
      accent: "Campus Network",
      cardClass: "border-[rgba(59,130,246,0.12)] bg-[linear-gradient(145deg,#ffffff_0%,#eef6ff_62%,#f8fbff_100%)]",
      iconWrapClass: "bg-[linear-gradient(135deg,#dbeafe_0%,#eff6ff_100%)] text-[#1d4ed8] shadow-[0_12px_26px_rgba(59,130,246,0.18)]",
      accentClass: "border-[rgba(59,130,246,0.18)] bg-white/80 text-[#2563eb]",
      glowClass: "bg-[radial-gradient(circle_at_top_right,rgba(96,165,250,0.22),transparent_56%)]",
    },
    {
      label: "Active Courses",
      value: adminState.courses.length,
      icon: BadgeCheck,
      helper: "Programs currently mapped",
      accent: "Course Catalog",
      cardClass: "border-[rgba(14,165,233,0.14)] bg-[linear-gradient(145deg,#ffffff_0%,#ecfeff_60%,#f8fbff_100%)]",
      iconWrapClass: "bg-[linear-gradient(135deg,#cffafe_0%,#ecfeff_100%)] text-cyan-600 shadow-[0_12px_26px_rgba(6,182,212,0.16)]",
      accentClass: "border-[rgba(6,182,212,0.18)] bg-white/80 text-cyan-700",
      glowClass: "bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.2),transparent_58%)]",
    },
    {
      label: "Exams",
      value: savedExams.length,
      icon: BookOpen,
      helper: "Saved exam schedules",
      accent: "Exam Library",
      cardClass: "border-[rgba(251,191,36,0.18)] bg-[linear-gradient(145deg,#ffffff_0%,#fffbeb_60%,#fffdf7_100%)]",
      iconWrapClass: "bg-[linear-gradient(135deg,#fef3c7_0%,#fff7ed_100%)] text-amber-600 shadow-[0_12px_26px_rgba(245,158,11,0.16)]",
      accentClass: "border-[rgba(245,158,11,0.16)] bg-white/85 text-amber-700",
      glowClass: "bg-[radial-gradient(circle_at_top_right,rgba(252,211,77,0.24),transparent_58%)]",
    },
    {
      label: "Users",
      value: adminState.users.length,
      icon: UserRound,
      helper: "Registered platform accounts",
      accent: "User Base",
      cardClass: "border-[rgba(168,85,247,0.14)] bg-[linear-gradient(145deg,#ffffff_0%,#faf5ff_60%,#fdfaff_100%)]",
      iconWrapClass: "bg-[linear-gradient(135deg,#f3e8ff_0%,#faf5ff_100%)] text-violet-600 shadow-[0_12px_26px_rgba(168,85,247,0.16)]",
      accentClass: "border-[rgba(168,85,247,0.16)] bg-white/85 text-violet-700",
      glowClass: "bg-[radial-gradient(circle_at_top_right,rgba(196,181,253,0.22),transparent_58%)]",
    },
  ];
  const pendingRequestNotifications = useMemo(
    () =>
      collegeChangeNotifications
        .filter((item) => String(item.status || "pending").toLowerCase() === "pending")
        .map((item) => ({
          id: `college-${item._id}-${new Date(String(item.updatedAt || item.createdAt || "")).getTime() || 0}`,
          kind: "College Change",
          name: item.payload?.name || item.requesterName || "College update",
          email: item.requesterEmail || "-",
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          tab: "college-notifications",
        })),
    [collegeChangeNotifications],
  );
  const latestPendingNotificationAt = useMemo(
    () =>
      pendingRequestNotifications.reduce((latest, item) => {
        const ts = new Date(String(item.updatedAt || item.createdAt || "")).getTime();
        return Number.isFinite(ts) && ts > latest ? ts : latest;
      }, 0),
    [pendingRequestNotifications],
  );
  const collegeDashboardEditStatus = useMemo(() => {
    const edited = adminState.colleges.filter((item) => Boolean(item.lastDashboardEditAt));
    const notEdited = adminState.colleges.filter((item) => !item.lastDashboardEditAt);
    return { edited, notEdited };
  }, [adminState.colleges]);
  const editedCollegesTotalPages = Math.max(
    1,
    Math.ceil(collegeDashboardEditStatus.edited.length / collegeEditStatusRowsPerPage),
  );
  const editedCollegesPageStart =
    collegeDashboardEditStatus.edited.length === 0
      ? 0
      : (editedCollegesPage - 1) * collegeEditStatusRowsPerPage + 1;
  const editedCollegesPageEnd = Math.min(
    editedCollegesPage * collegeEditStatusRowsPerPage,
    collegeDashboardEditStatus.edited.length,
  );
  const visibleEditedColleges = useMemo(
    () =>
      collegeDashboardEditStatus.edited.slice(
        (editedCollegesPage - 1) * collegeEditStatusRowsPerPage,
        editedCollegesPage * collegeEditStatusRowsPerPage,
      ),
    [collegeDashboardEditStatus.edited, editedCollegesPage],
  );
  const editedCollegesPaginationItems = useMemo(
    () => getCompactPaginationItems(editedCollegesPage, editedCollegesTotalPages),
    [editedCollegesPage, editedCollegesTotalPages],
  );
  const pendingCollegesTotalPages = Math.max(
    1,
    Math.ceil(collegeDashboardEditStatus.notEdited.length / collegeEditStatusRowsPerPage),
  );
  const pendingCollegesPageStart =
    collegeDashboardEditStatus.notEdited.length === 0
      ? 0
      : (pendingCollegesPage - 1) * collegeEditStatusRowsPerPage + 1;
  const pendingCollegesPageEnd = Math.min(
    pendingCollegesPage * collegeEditStatusRowsPerPage,
    collegeDashboardEditStatus.notEdited.length,
  );
  const visiblePendingColleges = useMemo(
    () =>
      collegeDashboardEditStatus.notEdited.slice(
        (pendingCollegesPage - 1) * collegeEditStatusRowsPerPage,
        pendingCollegesPage * collegeEditStatusRowsPerPage,
      ),
    [collegeDashboardEditStatus.notEdited, pendingCollegesPage],
  );
  const pendingCollegesPaginationItems = useMemo(
    () => getCompactPaginationItems(pendingCollegesPage, pendingCollegesTotalPages),
    [pendingCollegesPage, pendingCollegesTotalPages],
  );
  useEffect(() => {
    setEditedCollegesPage((current) => Math.min(current, editedCollegesTotalPages));
  }, [editedCollegesTotalPages]);

  useEffect(() => {
    setPendingCollegesPage((current) => Math.min(current, pendingCollegesTotalPages));
  }, [pendingCollegesTotalPages]);
  const unreadRequestNotifications = useMemo(
    () =>
      isSeenNotificationsReady
        ? pendingRequestNotifications.filter((item) => !seenNotificationIds.includes(item.id))
        : [],
    [isSeenNotificationsReady, pendingRequestNotifications, seenNotificationIds],
  );
  const fallbackAdminEmail = useMemo(
    () => String(readCurrentUser()?.email || "").trim().toLowerCase(),
    [],
  );
  const seenNotificationStorageKey = useMemo(
    () =>
      (currentUser?.email || fallbackAdminEmail)
        ? `collegehub_admin_seen_notifications_${String(
            currentUser?.email || fallbackAdminEmail,
          )
            .trim()
            .toLowerCase()}`
        : "",
    [currentUser?.email, fallbackAdminEmail],
  );
  const persistSeenNotifications = useCallback(
    (ids: string[], lastSeenAt: number) => {
      if (!seenNotificationStorageKey) return;
      try {
        window.localStorage.setItem(
          seenNotificationStorageKey,
          JSON.stringify({
            seenIds: ids,
            lastSeenAt,
          }),
        );
      } catch {
        // ignore storage errors
      }
    },
    [seenNotificationStorageKey],
  );
  useEffect(() => {
    seenNotificationIdsRef.current = seenNotificationIds;
  }, [seenNotificationIds]);
  useEffect(() => {
    lastSeenNotificationAtRef.current = lastSeenNotificationAt;
  }, [lastSeenNotificationAt]);
  const markNotificationIdsAsSeen = useCallback(
    (ids: string[]) => {
      if (ids.length === 0) return;
      const nextSeenIds = Array.from(new Set([...seenNotificationIdsRef.current, ...ids]));
      const nextLastSeenAt = Math.max(lastSeenNotificationAtRef.current, latestPendingNotificationAt);
      seenNotificationIdsRef.current = nextSeenIds;
      lastSeenNotificationAtRef.current = nextLastSeenAt;
      setSeenNotificationIds(nextSeenIds);
      setLastSeenNotificationAt(nextLastSeenAt);
      persistSeenNotifications(nextSeenIds, nextLastSeenAt);
    },
    [
      latestPendingNotificationAt,
      persistSeenNotifications,
    ],
  );

  useEffect(() => {
    seenNotificationHydratedRef.current = false;
    setIsSeenNotificationsReady(false);
    if (!seenNotificationStorageKey) {
      setSeenNotificationIds([]);
      setLastSeenNotificationAt(0);
      setIsSeenNotificationsReady(true);
      return;
    }
    try {
      const raw = window.localStorage.getItem(seenNotificationStorageKey);
      if (!raw) {
        setSeenNotificationIds([]);
        setLastSeenNotificationAt(0);
        seenNotificationHydratedRef.current = true;
        setIsSeenNotificationsReady(true);
        return;
      }
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        const nextIds = Array.isArray(parsed.seenIds)
          ? parsed.seenIds.map((item: unknown) => String(item || "").trim()).filter(Boolean)
          : [];
        const nextLastSeenAt =
          Number.isFinite(Number(parsed.lastSeenAt)) && Number(parsed.lastSeenAt) > 0
            ? Number(parsed.lastSeenAt)
            : 0;
        setSeenNotificationIds(nextIds);
        setLastSeenNotificationAt(nextLastSeenAt);
      } else if (Array.isArray(parsed)) {
        setSeenNotificationIds(parsed.map((item) => String(item || "").trim()).filter(Boolean));
        setLastSeenNotificationAt(0);
      } else {
        setSeenNotificationIds([]);
        setLastSeenNotificationAt(0);
      }
    } catch {
      setSeenNotificationIds([]);
      setLastSeenNotificationAt(0);
    } finally {
      seenNotificationHydratedRef.current = true;
      setIsSeenNotificationsReady(true);
    }
  }, [seenNotificationStorageKey]);

  useEffect(() => {
    if (!seenNotificationStorageKey || !seenNotificationHydratedRef.current) return;
    try {
      window.localStorage.setItem(
        seenNotificationStorageKey,
        JSON.stringify({
          seenIds: seenNotificationIds,
          lastSeenAt: lastSeenNotificationAt,
        }),
      );
    } catch {
      // ignore storage errors
    }
  }, [seenNotificationIds, lastSeenNotificationAt, seenNotificationStorageKey]);

  useEffect(() => {
    if (pendingRequestNotifications.length === 0) return;
    const activeIds = new Set(pendingRequestNotifications.map((item) => item.id));
    setSeenNotificationIds((previous) => {
      const next = previous.filter((id) => activeIds.has(id));
      seenNotificationIdsRef.current = next;
      if (next.length === previous.length) return previous;
      return next;
    });
  }, [pendingRequestNotifications]);

  useEffect(() => {
    if (activeTab !== "college-notifications") return;
    if (unreadRequestNotifications.length === 0) return;
    markNotificationIdsAsSeen(unreadRequestNotifications.map((item) => item.id));
  }, [
    activeTab,
    markNotificationIdsAsSeen,
    unreadRequestNotifications,
    unreadRequestNotifications.length,
  ]);
  useEffect(() => {
    if (!showRequestNotifications) {
      setNotificationPopoverRect(null);
      return;
    }

    const updateNotificationPopoverPosition = () => {
      const button = notificationButtonRef.current;
      if (!button) return;

      const rect = button.getBoundingClientRect();
      const popoverWidth = Math.min(352, window.innerWidth - 20);
      const left = Math.max(12, Math.min(rect.right - popoverWidth, window.innerWidth - popoverWidth - 12));
      const top = rect.bottom + 12;

      setNotificationPopoverRect({
        top,
        left,
        width: popoverWidth,
      });
    };

    updateNotificationPopoverPosition();
    window.addEventListener("resize", updateNotificationPopoverPosition);
    window.addEventListener("scroll", updateNotificationPopoverPosition, true);

    return () => {
      window.removeEventListener("resize", updateNotificationPopoverPosition);
      window.removeEventListener("scroll", updateNotificationPopoverPosition, true);
    };
  }, [showRequestNotifications]);
  const embeddedCutoffRangeParts = getCutoffRangeParts(embeddedCourseForm.cutoffValue);
  const embeddedCutoffWarning = getCutoffLimitWarning(embeddedCourseForm.cutoffValue, embeddedCutoffRangeConfig);

  return (
    <AdminPortalShell
      currentUser={currentUser}
      navItems={navItems}
      activeTab={activeTab}
      onChangeTab={handleTabChange}
      headerActions={
        <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto sm:gap-3">
          {currentUser?.isSuperAdmin && activeTab === "admin-access" ? (
            <button
              type="button"
              onClick={() => void sendSuperAdminPasswordChangeLink()}
              disabled={isSendingPasswordLink}
              className="inline-flex items-center justify-center rounded-2xl border border-[rgba(15,76,129,0.14)] bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:border-[rgba(15,76,129,0.24)] hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
            >
              <KeyRound className="size-4" />
              <span className="ml-2">
                {isSendingPasswordLink ? "Sending Link..." : "Change Password"}
              </span>
            </button>
          ) : null}

          <div className="relative z-[1200]">
            <button
              ref={notificationButtonRef}
              type="button"
              onClick={() => {
                const nextOpen = !showRequestNotifications;
                setShowRequestNotifications(nextOpen);
                if (nextOpen) {
                  markNotificationIdsAsSeen(unreadRequestNotifications.map((item) => item.id));
                }
              }}
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(56,189,248,0.28)] bg-white text-slate-700 transition hover:border-[rgba(56,189,248,0.4)] hover:bg-sky-50"
            >
              <Bell className="size-4" />
              {unreadRequestNotifications.length > 0 ? (
                <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {unreadRequestNotifications.length}
                </span>
              ) : null}
            </button>
            {showRequestNotifications && notificationPopoverRect && typeof document !== "undefined"
              ? createPortal(
                  <div
                    className="fixed z-[6000] rounded-[1.25rem] border border-white/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(247,250,255,0.96))] p-3 shadow-[0_24px_48px_rgba(148,163,184,0.2)] backdrop-blur-sm"
                    style={{
                      top: notificationPopoverRect.top,
                      left: notificationPopoverRect.left,
                      width: notificationPopoverRect.width,
                    }}
                  >
                    <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-(--brand-primary)">
                          Notifications
                        </p>
                        <p className="mt-1 text-sm font-bold text-slate-900">College Notifications</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowRequestNotifications(false)}
                        aria-label="Close notifications"
                        className="flex size-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                    <div className="mt-3 max-h-88 space-y-2 overflow-y-auto">
                      {unreadRequestNotifications.length > 0 ? (
                        unreadRequestNotifications.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              markNotificationIdsAsSeen([item.id]);
                              setShowRequestNotifications(false);
                              handleTabChange(item.tab);
                            }}
                            className="w-full rounded-2xl border border-[rgba(15,76,129,0.08)] bg-white px-3.5 py-3 text-left transition hover:bg-[rgba(15,76,129,0.04)]"
                          >
                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-(--brand-primary)">
                              {item.kind}
                            </p>
                            <p className="mt-1 text-sm font-bold text-slate-900">{item.name}</p>
                            <p className="mt-1 text-xs text-slate-500">{item.email}</p>
                          </button>
                        ))
                      ) : (
                        <div className="rounded-2xl border border-dashed border-[rgba(15,76,129,0.14)] bg-white px-4 py-8 text-center text-sm text-slate-500">
                          No new college notifications.
                        </div>
                      )}
                    </div>
                  </div>,
                  document.body,
                )
              : null}
          </div>
        </div>
      }
    >
      {statusText ? (
        <div className="rounded-[1.3rem] border border-emerald-100 bg-[linear-gradient(135deg,#ecfdf5_0%,#d1fae5_100%)] px-4 py-3 text-sm font-medium text-emerald-900 shadow-[0_14px_28px_rgba(16,185,129,0.12)]">
          {statusText}
        </div>
      ) : null}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={`admin-skeleton-${index}`} className="h-28 rounded-3xl border border-white/80 bg-[linear-gradient(135deg,#ffffff_0%,#f3f8ff_100%)] shadow-[0_16px_28px_rgba(148,163,184,0.1)]" />
          ))}
        </div>
      ) : null}

      {!loading && activeTab === "overview" ? (
        <AdminOverviewSection
          token={token}
          stats={stats}
          collegeDashboardEditStatus={collegeDashboardEditStatus}
          openCollegeEditReminderConfirm={openCollegeEditReminderConfirm}
          editedCollegesPage={editedCollegesPage}
          editedCollegesPageStart={editedCollegesPageStart}
          editedCollegesPageEnd={editedCollegesPageEnd}
          editedCollegesTotalPages={editedCollegesTotalPages}
          visibleEditedColleges={visibleEditedColleges}
          editedCollegesPaginationItems={editedCollegesPaginationItems}
          setEditedCollegesPage={setEditedCollegesPage}
          pendingCollegesPage={pendingCollegesPage}
          pendingCollegesPageStart={pendingCollegesPageStart}
          pendingCollegesPageEnd={pendingCollegesPageEnd}
          pendingCollegesTotalPages={pendingCollegesTotalPages}
          visiblePendingColleges={visiblePendingColleges}
          pendingCollegesPaginationItems={pendingCollegesPaginationItems}
          setPendingCollegesPage={setPendingCollegesPage}
        />
      ) : null}

      {!loading && activeTab === "bulk-upload" ? (
        <BulkUploadDashboard
          onImportComplete={handleBulkImportComplete}
          onAddManualCollege={() => {
            handleTabChange("colleges");
            resetCollegeForm();
            setShowCollegeForm(true);
          }}
          existingColleges={adminState.colleges}
        />
      ) : null}

      {!loading && activeTab === "colleges" ? (
        <AdminCollegesCoursesSection
          {...{
            activeTab: typeof activeTab !== "undefined" ? activeTab : undefined,
            addCustomCourseCatalogItem: typeof addCustomCourseCatalogItem !== "undefined" ? addCustomCourseCatalogItem : undefined,
            addCustomStreamOption: typeof addCustomStreamOption !== "undefined" ? addCustomStreamOption : undefined,
            adminDataRequestKeyRef: typeof adminDataRequestKeyRef !== "undefined" ? adminDataRequestKeyRef : undefined,
            adminState: typeof adminState !== "undefined" ? adminState : undefined,
            availableCountries: typeof availableCountries !== "undefined" ? availableCountries : undefined,
            availableDistricts: typeof availableDistricts !== "undefined" ? availableDistricts : undefined,
            availableStates: typeof availableStates !== "undefined" ? availableStates : undefined,
            availableStreamOptions: typeof availableStreamOptions !== "undefined" ? availableStreamOptions : undefined,
            brochureFile: typeof brochureFile !== "undefined" ? brochureFile : undefined,
            canAccess: typeof canAccess !== "undefined" ? canAccess : undefined,
            catalogOptions: typeof catalogOptions !== "undefined" ? catalogOptions : undefined,
            collegeCardPageOptions: typeof collegeCardPageOptions !== "undefined" ? collegeCardPageOptions : undefined,
            collegeCardsPageEnd: typeof collegeCardsPageEnd !== "undefined" ? collegeCardsPageEnd : undefined,
            collegeCardsPageStart: typeof collegeCardsPageStart !== "undefined" ? collegeCardsPageStart : undefined,
            collegeCardsPerPage: typeof collegeCardsPerPage !== "undefined" ? collegeCardsPerPage : undefined,
            collegeCardsTotalPages: typeof collegeCardsTotalPages !== "undefined" ? collegeCardsTotalPages : undefined,
            collegeFieldErrors: typeof collegeFieldErrors !== "undefined" ? collegeFieldErrors : undefined,
            collegeForm: typeof collegeForm !== "undefined" ? collegeForm : undefined,
            collegeFormRef: typeof collegeFormRef !== "undefined" ? collegeFormRef : undefined,
            collegeImagePreviews: typeof collegeImagePreviews !== "undefined" ? collegeImagePreviews : undefined,
            collegeNotificationsPage: typeof collegeNotificationsPage !== "undefined" ? collegeNotificationsPage : undefined,
            collegeNotificationsSearchText: typeof collegeNotificationsSearchText !== "undefined" ? collegeNotificationsSearchText : undefined,
            collegeSearchText: typeof collegeSearchText !== "undefined" ? collegeSearchText : undefined,
            collegeStep: typeof collegeStep !== "undefined" ? collegeStep : undefined,
            courseCustomFieldMode: typeof courseCustomFieldMode !== "undefined" ? courseCustomFieldMode : undefined,
            courseCutoffRangeConfig: typeof courseCutoffRangeConfig !== "undefined" ? courseCutoffRangeConfig : undefined,
            courseForm: typeof courseForm !== "undefined" ? courseForm : undefined,
            courseNameSelectValue: typeof courseNameSelectValue !== "undefined" ? courseNameSelectValue : undefined,
            courseQualificationOptions: typeof courseQualificationOptions !== "undefined" ? courseQualificationOptions : undefined,
            courseResolvedCourseName: typeof courseResolvedCourseName !== "undefined" ? courseResolvedCourseName : undefined,
            courseSpecializationEntries: typeof courseSpecializationEntries !== "undefined" ? courseSpecializationEntries : undefined,
            courseSpecializationOptionValues: typeof courseSpecializationOptionValues !== "undefined" ? courseSpecializationOptionValues : undefined,
            courseSpecializationSelectValue: typeof courseSpecializationSelectValue !== "undefined" ? courseSpecializationSelectValue : undefined,
            courseStreamOptionsForForm: typeof courseStreamOptionsForForm !== "undefined" ? courseStreamOptionsForForm : undefined,
            courseStreamSelectValue: typeof courseStreamSelectValue !== "undefined" ? courseStreamSelectValue : undefined,
            courseTypeOptions: typeof courseTypeOptions !== "undefined" ? courseTypeOptions : undefined,
            coverImageFile: typeof coverImageFile !== "undefined" ? coverImageFile : undefined,
            coverImagePreviewUrl: typeof coverImagePreviewUrl !== "undefined" ? coverImagePreviewUrl : undefined,
            currentCollegeCardsPage: typeof currentCollegeCardsPage !== "undefined" ? currentCollegeCardsPage : undefined,
            currentStream: typeof currentStream !== "undefined" ? currentStream : undefined,
            currentUser: typeof currentUser !== "undefined" ? currentUser : undefined,
            customCourseCatalog: typeof customCourseCatalog !== "undefined" ? customCourseCatalog : undefined,
            customFacilityInput: typeof customFacilityInput !== "undefined" ? customFacilityInput : undefined,
            customQuotaInput: typeof customQuotaInput !== "undefined" ? customQuotaInput : undefined,
            customScholarshipInput: typeof customScholarshipInput !== "undefined" ? customScholarshipInput : undefined,
            customStandaloneStreams: typeof customStandaloneStreams !== "undefined" ? customStandaloneStreams : undefined,
            deleteCollegeDialog: typeof deleteCollegeDialog !== "undefined" ? deleteCollegeDialog : undefined,
            deleteEnquiryDialog: typeof deleteEnquiryDialog !== "undefined" ? deleteEnquiryDialog : undefined,
            deleteExamDialog: typeof deleteExamDialog !== "undefined" ? deleteExamDialog : undefined,
            deleteSubAdminDialog: typeof deleteSubAdminDialog !== "undefined" ? deleteSubAdminDialog : undefined,
            deleteUserDialog: typeof deleteUserDialog !== "undefined" ? deleteUserDialog : undefined,
            editCollegeId: typeof editCollegeId !== "undefined" ? editCollegeId : undefined,
            editCourseId: typeof editCourseId !== "undefined" ? editCourseId : undefined,
            editExamId: typeof editExamId !== "undefined" ? editExamId : undefined,
            editSubAdminId: typeof editSubAdminId !== "undefined" ? editSubAdminId : undefined,
            editedCollegesPage: typeof editedCollegesPage !== "undefined" ? editedCollegesPage : undefined,
            editingEmbeddedCourseIndex: typeof editingEmbeddedCourseIndex !== "undefined" ? editingEmbeddedCourseIndex : undefined,
            embeddedCourseCustomFieldMode: typeof embeddedCourseCustomFieldMode !== "undefined" ? embeddedCourseCustomFieldMode : undefined,
            embeddedCourseForm: typeof embeddedCourseForm !== "undefined" ? embeddedCourseForm : undefined,
            embeddedCourseNameSelectValue: typeof embeddedCourseNameSelectValue !== "undefined" ? embeddedCourseNameSelectValue : undefined,
            embeddedCourseTypeOptions: typeof embeddedCourseTypeOptions !== "undefined" ? embeddedCourseTypeOptions : undefined,
            embeddedCourses: typeof embeddedCourses !== "undefined" ? embeddedCourses : undefined,
            embeddedCutoffRangeConfig: typeof embeddedCutoffRangeConfig !== "undefined" ? embeddedCutoffRangeConfig : undefined,
            embeddedQualificationOptions: typeof embeddedQualificationOptions !== "undefined" ? embeddedQualificationOptions : undefined,
            embeddedResolvedCourseName: typeof embeddedResolvedCourseName !== "undefined" ? embeddedResolvedCourseName : undefined,
            embeddedSpecializationEntries: typeof embeddedSpecializationEntries !== "undefined" ? embeddedSpecializationEntries : undefined,
            embeddedSpecializationOptionValues: typeof embeddedSpecializationOptionValues !== "undefined" ? embeddedSpecializationOptionValues : undefined,
            embeddedSpecializationSelectValue: typeof embeddedSpecializationSelectValue !== "undefined" ? embeddedSpecializationSelectValue : undefined,
            embeddedStreamOptions: typeof embeddedStreamOptions !== "undefined" ? embeddedStreamOptions : undefined,
            embeddedStreamSelectValue: typeof embeddedStreamSelectValue !== "undefined" ? embeddedStreamSelectValue : undefined,
            end: typeof end !== "undefined" ? end : undefined,
            examForm: typeof examForm !== "undefined" ? examForm : undefined,
            examFormRef: typeof examFormRef !== "undefined" ? examFormRef : undefined,
            examNameInputRef: typeof examNameInputRef !== "undefined" ? examNameInputRef : undefined,
            examSchedulesPage: typeof examSchedulesPage !== "undefined" ? examSchedulesPage : undefined,
            examSchedulesTotalPages: typeof examSchedulesTotalPages !== "undefined" ? examSchedulesTotalPages : undefined,
            examTableRows: typeof examTableRows !== "undefined" ? examTableRows : undefined,
            existingCourseType: typeof existingCourseType !== "undefined" ? existingCourseType : undefined,
            existingOptions: typeof existingOptions !== "undefined" ? existingOptions : undefined,
            expandedCollegeIds: typeof expandedCollegeIds !== "undefined" ? expandedCollegeIds : undefined,
            filteredCollegeCards: typeof filteredCollegeCards !== "undefined" ? filteredCollegeCards : undefined,
            filteredUsers: typeof filteredUsers !== "undefined" ? filteredUsers : undefined,
            firstCollegeImagePreviewUrl: typeof firstCollegeImagePreviewUrl !== "undefined" ? firstCollegeImagePreviewUrl : undefined,
            getAdminSectionKeys: typeof getAdminSectionKeys !== "undefined" ? getAdminSectionKeys : undefined,
            getCourseTypeOptionsForSelection: typeof getCourseTypeOptionsForSelection !== "undefined" ? getCourseTypeOptionsForSelection : undefined,
            getSpecializationOptionsForSelection: typeof getSpecializationOptionsForSelection !== "undefined" ? getSpecializationOptionsForSelection : undefined,
            handleBulkImportComplete: typeof handleBulkImportComplete !== "undefined" ? handleBulkImportComplete : undefined,
            hasHostelFacility: typeof hasHostelFacility !== "undefined" ? hasHostelFacility : undefined,
            imageFiles: typeof imageFiles !== "undefined" ? imageFiles : undefined,
            isArtsAndScienceSelection: typeof isArtsAndScienceSelection !== "undefined" ? isArtsAndScienceSelection : undefined,
            isDeletingCollege: typeof isDeletingCollege !== "undefined" ? isDeletingCollege : undefined,
            isDeletingEnquiry: typeof isDeletingEnquiry !== "undefined" ? isDeletingEnquiry : undefined,
            isDeletingExam: typeof isDeletingExam !== "undefined" ? isDeletingExam : undefined,
            isDeletingSubAdmin: typeof isDeletingSubAdmin !== "undefined" ? isDeletingSubAdmin : undefined,
            isDeletingUser: typeof isDeletingUser !== "undefined" ? isDeletingUser : undefined,
            isSeenNotificationsReady: typeof isSeenNotificationsReady !== "undefined" ? isSeenNotificationsReady : undefined,
            isSendingCollegeEditReminders: typeof isSendingCollegeEditReminders !== "undefined" ? isSendingCollegeEditReminders : undefined,
            isSendingPasswordLink: typeof isSendingPasswordLink !== "undefined" ? isSendingPasswordLink : undefined,
            lastSeenNotificationAt: typeof lastSeenNotificationAt !== "undefined" ? lastSeenNotificationAt : undefined,
            lastSeenNotificationAtRef: typeof lastSeenNotificationAtRef !== "undefined" ? lastSeenNotificationAtRef : undefined,
            loadAdminData: typeof loadAdminData !== "undefined" ? loadAdminData : undefined,
            loadedAdminSectionsRef: typeof loadedAdminSectionsRef !== "undefined" ? loadedAdminSectionsRef : undefined,
            loading: typeof loading !== "undefined" ? loading : undefined,
            loadingAdminSectionsRef: typeof loadingAdminSectionsRef !== "undefined" ? loadingAdminSectionsRef : undefined,
            logoFile: typeof logoFile !== "undefined" ? logoFile : undefined,
            logoPreviewUrl: typeof logoPreviewUrl !== "undefined" ? logoPreviewUrl : undefined,
            me: typeof me !== "undefined" ? me : undefined,
            message: typeof message !== "undefined" ? message : undefined,
            navItems: typeof navItems !== "undefined" ? navItems : undefined,
            nextTab: typeof nextTab !== "undefined" ? nextTab : undefined,
            nextValue: typeof nextValue !== "undefined" ? nextValue : undefined,
            normalizedCourseStreamValue: typeof normalizedCourseStreamValue !== "undefined" ? normalizedCourseStreamValue : undefined,
            normalizedCourseType: typeof normalizedCourseType !== "undefined" ? normalizedCourseType : undefined,
            normalizedDegreeType: typeof normalizedDegreeType !== "undefined" ? normalizedDegreeType : undefined,
            normalizedEmbeddedStream: typeof normalizedEmbeddedStream !== "undefined" ? normalizedEmbeddedStream : undefined,
            normalizedSearch: typeof normalizedSearch !== "undefined" ? normalizedSearch : undefined,
            normalizedSpecialization: typeof normalizedSpecialization !== "undefined" ? normalizedSpecialization : undefined,
            normalizedStream: typeof normalizedStream !== "undefined" ? normalizedStream : undefined,
            optionMap: typeof optionMap !== "undefined" ? optionMap : undefined,
            pathname: typeof pathname !== "undefined" ? pathname : undefined,
            pendingCollegesPage: typeof pendingCollegesPage !== "undefined" ? pendingCollegesPage : undefined,
            query: typeof query !== "undefined" ? query : undefined,
            queueJob: typeof queueJob !== "undefined" ? queueJob : undefined,
            rawTab: typeof rawTab !== "undefined" ? rawTab : undefined,
            requestKey: typeof requestKey !== "undefined" ? requestKey : undefined,
            results: typeof results !== "undefined" ? results : undefined,
            router: typeof router !== "undefined" ? router : undefined,
            safeCollegeCardsPage: typeof safeCollegeCardsPage !== "undefined" ? safeCollegeCardsPage : undefined,
            savedExams: typeof savedExams !== "undefined" ? savedExams : undefined,
            searchParams: typeof searchParams !== "undefined" ? searchParams : undefined,
            sectionKeys: typeof sectionKeys !== "undefined" ? sectionKeys : undefined,
            seenNotificationHydratedRef: typeof seenNotificationHydratedRef !== "undefined" ? seenNotificationHydratedRef : undefined,
            seenNotificationIds: typeof seenNotificationIds !== "undefined" ? seenNotificationIds : undefined,
            seenNotificationIdsRef: typeof seenNotificationIdsRef !== "undefined" ? seenNotificationIdsRef : undefined,
            selectedCourseCollegeId: typeof selectedCourseCollegeId !== "undefined" ? selectedCourseCollegeId : undefined,
            selectedFacilities: typeof selectedFacilities !== "undefined" ? selectedFacilities : undefined,
            selectedQuotas: typeof selectedQuotas !== "undefined" ? selectedQuotas : undefined,
            selectedScholarships: typeof selectedScholarships !== "undefined" ? selectedScholarships : undefined,
            setActiveTab: typeof setActiveTab !== "undefined" ? setActiveTab : undefined,
            setAdminState: typeof setAdminState !== "undefined" ? setAdminState : undefined,
            setBrochureFile: typeof setBrochureFile !== "undefined" ? setBrochureFile : undefined,
            setCollegeFieldErrors: typeof setCollegeFieldErrors !== "undefined" ? setCollegeFieldErrors : undefined,
            setCollegeForm: typeof setCollegeForm !== "undefined" ? setCollegeForm : undefined,
            setCollegeNotificationsPage: typeof setCollegeNotificationsPage !== "undefined" ? setCollegeNotificationsPage : undefined,
            setCollegeNotificationsSearchText: typeof setCollegeNotificationsSearchText !== "undefined" ? setCollegeNotificationsSearchText : undefined,
            setCollegeSearchText: typeof setCollegeSearchText !== "undefined" ? setCollegeSearchText : undefined,
            setCollegeStep: typeof setCollegeStep !== "undefined" ? setCollegeStep : undefined,
            setCourseCustomFieldMode: typeof setCourseCustomFieldMode !== "undefined" ? setCourseCustomFieldMode : undefined,
            setCourseForm: typeof setCourseForm !== "undefined" ? setCourseForm : undefined,
            setCoverImageFile: typeof setCoverImageFile !== "undefined" ? setCoverImageFile : undefined,
            setCurrentCollegeCardsPage: typeof setCurrentCollegeCardsPage !== "undefined" ? setCurrentCollegeCardsPage : undefined,
            setCurrentUser: typeof setCurrentUser !== "undefined" ? setCurrentUser : undefined,
            setCustomCourseCatalog: typeof setCustomCourseCatalog !== "undefined" ? setCustomCourseCatalog : undefined,
            setCustomFacilityInput: typeof setCustomFacilityInput !== "undefined" ? setCustomFacilityInput : undefined,
            setCustomQuotaInput: typeof setCustomQuotaInput !== "undefined" ? setCustomQuotaInput : undefined,
            setCustomScholarshipInput: typeof setCustomScholarshipInput !== "undefined" ? setCustomScholarshipInput : undefined,
            setCustomStandaloneStreams: typeof setCustomStandaloneStreams !== "undefined" ? setCustomStandaloneStreams : undefined,
            setDeleteCollegeDialog: typeof setDeleteCollegeDialog !== "undefined" ? setDeleteCollegeDialog : undefined,
            setDeleteEnquiryDialog: typeof setDeleteEnquiryDialog !== "undefined" ? setDeleteEnquiryDialog : undefined,
            setDeleteExamDialog: typeof setDeleteExamDialog !== "undefined" ? setDeleteExamDialog : undefined,
            setDeleteSubAdminDialog: typeof setDeleteSubAdminDialog !== "undefined" ? setDeleteSubAdminDialog : undefined,
            setDeleteUserDialog: typeof setDeleteUserDialog !== "undefined" ? setDeleteUserDialog : undefined,
            setEditCollegeId: typeof setEditCollegeId !== "undefined" ? setEditCollegeId : undefined,
            setEditCourseId: typeof setEditCourseId !== "undefined" ? setEditCourseId : undefined,
            setEditExamId: typeof setEditExamId !== "undefined" ? setEditExamId : undefined,
            setEditSubAdminId: typeof setEditSubAdminId !== "undefined" ? setEditSubAdminId : undefined,
            setEditedCollegesPage: typeof setEditedCollegesPage !== "undefined" ? setEditedCollegesPage : undefined,
            setEditingEmbeddedCourseIndex: typeof setEditingEmbeddedCourseIndex !== "undefined" ? setEditingEmbeddedCourseIndex : undefined,
            setEmbeddedCourseCustomFieldMode: typeof setEmbeddedCourseCustomFieldMode !== "undefined" ? setEmbeddedCourseCustomFieldMode : undefined,
            setEmbeddedCourseForm: typeof setEmbeddedCourseForm !== "undefined" ? setEmbeddedCourseForm : undefined,
            setEmbeddedCourses: typeof setEmbeddedCourses !== "undefined" ? setEmbeddedCourses : undefined,
            setExamForm: typeof setExamForm !== "undefined" ? setExamForm : undefined,
            setExamSchedulesPage: typeof setExamSchedulesPage !== "undefined" ? setExamSchedulesPage : undefined,
            setExpandedCollegeIds: typeof setExpandedCollegeIds !== "undefined" ? setExpandedCollegeIds : undefined,
            setImageFiles: typeof setImageFiles !== "undefined" ? setImageFiles : undefined,
            setIsDeletingCollege: typeof setIsDeletingCollege !== "undefined" ? setIsDeletingCollege : undefined,
            setIsDeletingEnquiry: typeof setIsDeletingEnquiry !== "undefined" ? setIsDeletingEnquiry : undefined,
            setIsDeletingExam: typeof setIsDeletingExam !== "undefined" ? setIsDeletingExam : undefined,
            setIsDeletingSubAdmin: typeof setIsDeletingSubAdmin !== "undefined" ? setIsDeletingSubAdmin : undefined,
            setIsDeletingUser: typeof setIsDeletingUser !== "undefined" ? setIsDeletingUser : undefined,
            setIsSeenNotificationsReady: typeof setIsSeenNotificationsReady !== "undefined" ? setIsSeenNotificationsReady : undefined,
            setIsSendingCollegeEditReminders: typeof setIsSendingCollegeEditReminders !== "undefined" ? setIsSendingCollegeEditReminders : undefined,
            setIsSendingPasswordLink: typeof setIsSendingPasswordLink !== "undefined" ? setIsSendingPasswordLink : undefined,
            setLastSeenNotificationAt: typeof setLastSeenNotificationAt !== "undefined" ? setLastSeenNotificationAt : undefined,
            setLoading: typeof setLoading !== "undefined" ? setLoading : undefined,
            setLogoFile: typeof setLogoFile !== "undefined" ? setLogoFile : undefined,
            setPendingCollegesPage: typeof setPendingCollegesPage !== "undefined" ? setPendingCollegesPage : undefined,
            setSavedExams: typeof setSavedExams !== "undefined" ? setSavedExams : undefined,
            setSeenNotificationIds: typeof setSeenNotificationIds !== "undefined" ? setSeenNotificationIds : undefined,
            setSelectedCourseCollegeId: typeof setSelectedCourseCollegeId !== "undefined" ? setSelectedCourseCollegeId : undefined,
            setShowCollegeEditReminderConfirm: typeof setShowCollegeEditReminderConfirm !== "undefined" ? setShowCollegeEditReminderConfirm : undefined,
            setShowCollegeForm: typeof setShowCollegeForm !== "undefined" ? setShowCollegeForm : undefined,
            setShowCourseForm: typeof setShowCourseForm !== "undefined" ? setShowCourseForm : undefined,
            setShowEmbeddedCourseEditor: typeof setShowEmbeddedCourseEditor !== "undefined" ? setShowEmbeddedCourseEditor : undefined,
            setShowRequestNotifications: typeof setShowRequestNotifications !== "undefined" ? setShowRequestNotifications : undefined,
            setShowSavedCourseList: typeof setShowSavedCourseList !== "undefined" ? setShowSavedCourseList : undefined,
            setShowSubAdminForm: typeof setShowSubAdminForm !== "undefined" ? setShowSubAdminForm : undefined,
            setSiteSettings: typeof setSiteSettings !== "undefined" ? setSiteSettings : undefined,
            setStatusState: typeof setStatusState !== "undefined" ? setStatusState : undefined,
            setStatusText: typeof setStatusText !== "undefined" ? setStatusText : undefined,
            setSubAdminForm: typeof setSubAdminForm !== "undefined" ? setSubAdminForm : undefined,
            setUsersPage: typeof setUsersPage !== "undefined" ? setUsersPage : undefined,
            setUsersSearchText: typeof setUsersSearchText !== "undefined" ? setUsersSearchText : undefined,
            shouldLoad: typeof shouldLoad !== "undefined" ? shouldLoad : undefined,
            showCollegeEditReminderConfirm: typeof showCollegeEditReminderConfirm !== "undefined" ? showCollegeEditReminderConfirm : undefined,
            showCollegeForm: typeof showCollegeForm !== "undefined" ? showCollegeForm : undefined,
            showCourseForm: typeof showCourseForm !== "undefined" ? showCourseForm : undefined,
            showEmbeddedCourseEditor: typeof showEmbeddedCourseEditor !== "undefined" ? showEmbeddedCourseEditor : undefined,
            showRequestNotifications: typeof showRequestNotifications !== "undefined" ? showRequestNotifications : undefined,
            showSavedCourseList: typeof showSavedCourseList !== "undefined" ? showSavedCourseList : undefined,
            showSubAdminForm: typeof showSubAdminForm !== "undefined" ? showSubAdminForm : undefined,
            siteSettings: typeof siteSettings !== "undefined" ? siteSettings : undefined,
            specialization: typeof specialization !== "undefined" ? specialization : undefined,
            start: typeof start !== "undefined" ? start : undefined,
            statusState: typeof statusState !== "undefined" ? statusState : undefined,
            statusText: typeof statusText !== "undefined" ? statusText : undefined,
            storedToken: typeof storedToken !== "undefined" ? storedToken : undefined,
            storedUser: typeof storedUser !== "undefined" ? storedUser : undefined,
            subAdminForm: typeof subAdminForm !== "undefined" ? subAdminForm : undefined,
            timer: typeof timer !== "undefined" ? timer : undefined,
            token: typeof token !== "undefined" ? token : undefined,
            totalCollegeImageCount: typeof totalCollegeImageCount !== "undefined" ? totalCollegeImageCount : undefined,
            usersPage: typeof usersPage !== "undefined" ? usersPage : undefined,
            usersPageEnd: typeof usersPageEnd !== "undefined" ? usersPageEnd : undefined,
            usersPageStart: typeof usersPageStart !== "undefined" ? usersPageStart : undefined,
            usersPaginationItems: typeof usersPaginationItems !== "undefined" ? usersPaginationItems : undefined,
            usersSearchText: typeof usersSearchText !== "undefined" ? usersSearchText : undefined,
            usersTotalPages: typeof usersTotalPages !== "undefined" ? usersTotalPages : undefined,
            visibleCollegeCards: typeof visibleCollegeCards !== "undefined" ? visibleCollegeCards : undefined,
            visibleExamTableRows: typeof visibleExamTableRows !== "undefined" ? visibleExamTableRows : undefined,
            visibleUsers: typeof visibleUsers !== "undefined" ? visibleUsers : undefined,
          }}
        />
      ) : null}

      {!loading && activeTab === "users" ? (
        <div className="space-y-3">
          {adminState.users.length === 0 ? (
            <div className="luxe-card p-5 text-sm text-slate-600">
              No users found right now.
            </div>
          ) : (
            <div className="overflow-hidden rounded-[0.65rem] border border-[#dbe3ee] bg-white shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
              <div className="flex flex-col gap-2 border-b border-[#dbe3ee] bg-white px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full sm:max-w-sm">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8ba0bd]" />
                  <input
                    type="search"
                    value={usersSearchText}
                    onChange={(event) => setUsersSearchText(event.target.value)}
                    placeholder="Search users"
                    className="h-9 w-full rounded-md border border-[#dbe3ee] bg-[#f8fafc] pl-9 pr-3 text-[13px] font-medium text-[#263954] outline-none transition placeholder:text-[#8ba0bd] focus:border-[#93b4d8] focus:bg-white focus:ring-2 focus:ring-[#e7f0fb]"
                  />
                </div>
                <p className="text-[12px] font-semibold text-[#60708f]">
                  {filteredUsers.length} users
                </p>
              </div>
              <div className="admin-users-table-scroll overflow-x-auto pb-2">
                <table className="w-full min-w-[1040px] table-fixed text-left text-[13px] text-[#40557a]">
                  <thead className="border-b border-[#dbe3ee] bg-[linear-gradient(90deg,#f0f7ff_0%,#f8fbff_50%,#fff7ed_100%)] text-[11px] font-bold uppercase">
                    <tr>
                      {[
                        { label: "Name", width: "w-[20%]", align: "text-left", tone: "bg-[#eaf3ff] text-[#0f4c81]" },
                        { label: "Email", width: "w-[27%]", align: "text-left", tone: "bg-[#eef8ff] text-[#2563eb]" },
                        { label: "Phone", width: "w-[15%]", align: "text-left", tone: "bg-[#ecfdf5] text-[#0f766e]" },
                        { label: "Role", width: "w-[13%]", align: "text-center", tone: "bg-[#f0fdf4] text-[#15803d]" },
                        { label: "Joined", width: "w-[14%]", align: "text-left", tone: "bg-[#fff7ed] text-[#b45309]" },
                        { label: "Action", width: "w-[11%]", align: "text-right", tone: "bg-[#fff1f2] text-[#be123c]" },
                      ].map((column) => (
                        <th key={column.label} className={`${column.width} px-4 py-2 ${column.align}`}>
                          <span className={`inline-flex items-center rounded-md px-2 py-1 ${column.tone} ${column.align === "text-right" ? "justify-end" : ""}`}>
                            {column.label}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#dbe3ee]">
                    {visibleUsers.map((user) => {
                      const role = user.role || "user";

                      return (
                        <tr key={user._id} className="bg-white transition hover:bg-[#f8fbff]">
                          <td className="truncate px-4 py-2.5 font-bold leading-5 text-[#15213a]">{user.name || "User"}</td>
                          <td className="truncate px-4 py-2.5 font-medium leading-5 text-[#40557a]">{user.email || "-"}</td>
                          <td className="truncate px-4 py-2.5 font-medium leading-5 text-[#40557a]">{user.phone || "-"}</td>
                          <td className="px-4 py-2.5 text-center">
                            <span className={`inline-flex min-w-[4.2rem] items-center justify-center rounded-full border px-3 py-1 text-[11px] font-bold capitalize ${getUserRoleBadgeClass(role)}`}>
                              {role}
                            </span>
                          </td>
                          <td className="truncate px-4 py-2.5 font-medium leading-5 text-[#2f4366]">{formatDate(user.createdAt)}</td>
                          <td className="px-4 py-2.5 text-right">
                            <button
                              type="button"
                              onClick={() => openDeleteUserDialog(user)}
                              className="inline-flex min-w-20 items-center justify-center whitespace-nowrap rounded-md border border-rose-200 bg-rose-50 px-3 py-1.5 text-[11px] font-bold text-rose-600 transition hover:bg-rose-600 hover:text-white"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {visibleUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-sm font-semibold text-[#60708f]">
                          No matching users found.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-col gap-3 border-t border-[#dbe3ee] bg-white px-4 py-2.5 text-[12px] font-medium text-[#40557a] sm:flex-row sm:items-center sm:justify-between">
                <p>
                  Showing {usersPageStart} to {usersPageEnd} of {filteredUsers.length} users
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setUsersPage((current) => Math.max(1, current - 1))}
                    disabled={usersPage === 1}
                    className="rounded-md border border-[#dbe3ee] bg-white px-4 py-1.5 text-xs font-bold text-[#263954] transition hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:text-[#b9c3d2]"
                  >
                    Previous
                  </button>
                  {usersPaginationItems.map((item) =>
                    typeof item === "number" ? (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setUsersPage(item)}
                        className={`h-8 min-w-8 rounded-md px-3 text-xs font-bold transition ${
                          usersPage === item
                            ? "bg-[#eef0ff] text-[#4f46e5]"
                            : "bg-white text-[#40557a] hover:bg-[#f8fafc]"
                        }`}
                      >
                        {item}
                      </button>
                    ) : (
                      <span key={item} className="px-2 text-xs font-bold text-[#40557a]">
                        ...
                      </span>
                    ),
                  )}
                  <button
                    type="button"
                    onClick={() => setUsersPage((current) => Math.min(usersTotalPages, current + 1))}
                    disabled={usersPage === usersTotalPages}
                    className="rounded-md border border-[#dbe3ee] bg-white px-4 py-1.5 text-xs font-bold text-[#263954] transition hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:text-[#b9c3d2]"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : null}

      {!loading && activeTab === "enquiries" ? (
        <div className="space-y-3">
          {adminState.enquiries.map((enquiry) => (
            <article key={enquiry._id} className="luxe-card flex items-start justify-between gap-4 p-5">
              <div>
                <h3 className="font-bold text-slate-900">{enquiry.name || enquiry.user?.name || "Enquiry"}</h3>
                <p className="text-sm text-slate-500">{enquiry.email || enquiry.user?.email || "-"}</p>
                <p className="text-sm text-slate-500">
                  {[enquiry.collegeName, enquiry.courseName, formatDate(enquiry.createdAt)].filter(Boolean).join(" â€¢ ")}
                </p>
                <p className="mt-2 text-sm text-slate-600">{enquiry.message || "No message"}</p>
              </div>
              <button
                type="button"
                onClick={() => openDeleteEnquiryDialog(enquiry)}
                className="inline-flex min-w-24 items-center justify-center whitespace-nowrap rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white"
              >
                Delete
              </button>
            </article>
          ))}
        </div>
      ) : null}

      {!loading && activeTab === "college-notifications" ? (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8ba0bd]" />
              <input
                type="search"
                value={collegeNotificationsSearchText}
                onChange={(event) => setCollegeNotificationsSearchText(event.target.value)}
                placeholder="Search by college name"
                className="h-10 w-full rounded-md border border-[#dbe3ee] bg-white pl-9 pr-3 text-[13px] font-medium text-[#263954] shadow-[0_8px_18px_rgba(15,23,42,0.04)] outline-none transition placeholder:text-[#8ba0bd] focus:border-[#93b4d8] focus:ring-2 focus:ring-[#e7f0fb]"
              />
            </div>

          </div>

          <div className="space-y-3">
            {visibleCollegeChangeNotifications.map((item, index) => {
              const matchedCollege = getNotificationCollege(item);
              const collegeName = item.payload?.name || item.requesterName || matchedCollege?.name || "College update";
              const collegeLogo = getRequestAssetValue(item, ["logo", "logoImage"]) || matchedCollege?.logo || "";
              const serialNumber = collegeNotificationsPageStart + index;
              const status = String(item.status || "pending").toLowerCase();
              const statusClass =
                status === "approved"
                  ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                  : status === "rejected"
                    ? "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
                    : "bg-amber-50 text-amber-700 ring-1 ring-amber-200";

              return (
                <article
                  key={item._id}
                  className="overflow-hidden rounded-xl border border-[#dbe3ee] bg-white shadow-[0_10px_24px_rgba(15,23,42,0.04)]"
                >
                  <div className="grid gap-0 lg:grid-cols-[26rem_minmax(0,1fr)]">
                    <div className="flex gap-4 p-4 lg:border-r lg:border-[#dbe3ee]">
                      <CollegeLogoBadge
                        src={collegeLogo}
                        alt={`${collegeName} logo`}
                        className="h-16 w-16 shrink-0 rounded-full"
                        fallback={<span className="text-base font-black">{serialNumber}</span>}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="min-w-0 text-[15px] font-black leading-5 text-[#15213a]">
                            <span className="mr-1">{serialNumber}.</span>
                            {collegeName}
                          </h3>
                          <span className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-bold capitalize ${statusClass}`}>
                            {status}
                          </span>
                        </div>
                        <div className="mt-3 space-y-1.5 text-[12px] font-medium text-[#60708f]">
                          <p className="break-all">
                            Edited by login email: {item.requesterEmail || "-"}
                          </p>
                          <p>Updated on {formatDate(item.updatedAt || item.createdAt)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="relative p-4">
                      <button
                        type="button"
                        aria-label="More options"
                        className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-md text-[#8ba0bd] transition hover:bg-[#f8fafc] hover:text-[#263954]"
                      >
                        ...
                      </button>
                      <div className="grid gap-x-6 gap-y-4 pr-8 sm:grid-cols-2 xl:grid-cols-5">
                        {(item.changeSummary || []).map((change, changeIndex) => (
                          <div key={`${item._id}-${change.field || changeIndex}`} className="min-w-0">
                            <p className="truncate text-[11px] font-black text-[#263954]">
                              {change.label || change.field || "Field"}
                            </p>
                            <p className="mt-1 break-words text-[11px] font-bold leading-4 text-rose-600">
                              Before: {renderChangeValue(change.before)}
                            </p>
                            <p className="break-words text-[11px] font-bold leading-4 text-emerald-600">
                              Now: {renderChangeValue(change.after)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {filteredCollegeChangeNotifications.length > 0 ? (
            <div className="flex flex-col gap-3 pt-1 text-[12px] font-medium text-[#60708f] sm:flex-row sm:items-center sm:justify-between">
              <p>
                Showing {collegeNotificationsPageStart} to {collegeNotificationsPageEnd} of {filteredCollegeChangeNotifications.length} colleges
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setCollegeNotificationsPage((current) => Math.max(1, current - 1))}
                  disabled={collegeNotificationsPage === 1}
                  className="inline-flex h-9 min-w-24 items-center justify-center rounded-md border border-rose-200 bg-white px-4 text-sm font-bold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:bg-rose-50 disabled:text-rose-200"
                >
                  Previous
                </button>
                {collegeNotificationsPaginationItems.map((item) =>
                  typeof item === "number" ? (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setCollegeNotificationsPage(item)}
                      className={`h-9 min-w-9 rounded-md px-3 text-sm font-bold transition ${
                        collegeNotificationsPage === item
                          ? "bg-rose-50 text-rose-600"
                          : "bg-white text-[#8a4d61] hover:bg-rose-50 hover:text-rose-600"
                      }`}
                    >
                      {item}
                    </button>
                  ) : (
                    <span key={item} className="px-2 text-sm font-bold text-[#8a4d61]">
                      ...
                    </span>
                  ),
                )}
                <button
                  type="button"
                  onClick={() =>
                    setCollegeNotificationsPage((current) => Math.min(collegeNotificationsTotalPages, current + 1))
                  }
                  disabled={collegeNotificationsPage === collegeNotificationsTotalPages}
                  className="inline-flex h-9 min-w-20 items-center justify-center rounded-md border border-rose-200 bg-white px-4 text-sm font-bold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:bg-rose-50 disabled:text-rose-200"
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}

          {filteredCollegeChangeNotifications.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#dbe3ee] bg-white px-4 py-8 text-center text-sm font-semibold text-[#60708f]">
              No field change notifications found.
            </div>
          ) : null}
        </div>
      ) : null}

      {!loading && activeTab === "exams" ? (
        <div className="space-y-4">
          <form ref={examFormRef} onSubmit={saveExamSchedule} className="luxe-card space-y-5 p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--brand-primary)]">
                  Exam Schedule
                </p>
                <h3 className="mt-1 text-lg font-bold text-slate-900">
                  Add exam dates with future-ready date inputs
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Type exam details and enter dates in `dd-mm-yyyy` format.
                </p>
              </div>
              <button
                type="button"
                onClick={resetExamForm}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
              >
                Clear
              </button>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <label className="md:col-span-2 xl:col-span-2">
                <span className={labelClass}>Exam Name<span className={requiredMarkClass}>*</span></span>
                <input
                  ref={examNameInputRef}
                  className={inputClass}
                  list="exam-schedule-name-options"
                  placeholder="Type or choose an exam name"
                  value={examForm.examName}
                  onChange={(event) =>
                    setExamForm((prev) => ({
                      ...prev,
                      examName: event.target.value,
                    }))
                  }
                  required
                />
                <datalist id="exam-schedule-name-options">
                  {examScheduleNameOptions.map((item) => (
                    <option key={item} value={item} />
                  ))}
                </datalist>
                <span className="mt-1 block text-[11px] text-slate-500">
                  Pick a suggestion or type a new exam name to create a fresh exam entry.
                </span>
              </label>
              <label>
                <span className={labelClass}>Application Fees</span>
                <input
                  className={inputClass}
                  placeholder="1220-1500"
                  value={examForm.applicationFees}
                  onChange={(event) => setExamForm((prev) => ({ ...prev, applicationFees: event.target.value }))}
                />
                <span className="mt-1 block text-[11px] text-slate-500">Enter a fee range like 500-1000 or 1220-1500</span>
              </label>
              <label>
                <span className={labelClass}>Start Date to Apply</span>
                <input
                  className={inputClass}
                  type="date"
                  value={formatExamDateForInput(examForm.startDateToApply)}
                  onChange={(event) => setExamForm((prev) => ({ ...prev, startDateToApply: formatExamDateFromInput(event.target.value) }))}
                />
                <span className="mt-1 block text-[11px] text-slate-500">dd-mm-yyyy</span>
              </label>
              <label>
                <span className={labelClass}>Last Date to Apply</span>
                <input
                  className={inputClass}
                  type="date"
                  value={formatExamDateForInput(examForm.lastDateToApply)}
                  onChange={(event) => setExamForm((prev) => ({ ...prev, lastDateToApply: formatExamDateFromInput(event.target.value) }))}
                />
                <span className="mt-1 block text-[11px] text-slate-500">dd-mm-yyyy</span>
              </label>
              <label>
                <span className={labelClass}>Correction Date</span>
                <input
                  className={inputClass}
                  placeholder="05-04-2026 to 07-04-2026"
                  value={examForm.correctionDate}
                  onChange={(event) => setExamForm((prev) => ({ ...prev, correctionDate: event.target.value }))}
                />
              </label>
              <label>
                <span className={labelClass}>Last Date for Fee Payment</span>
                <input
                  className={inputClass}
                  type="date"
                  value={formatExamDateForInput(examForm.lastDateForFeePayment)}
                  onChange={(event) => setExamForm((prev) => ({ ...prev, lastDateForFeePayment: formatExamDateFromInput(event.target.value) }))}
                />
                <span className="mt-1 block text-[11px] text-slate-500">dd-mm-yyyy</span>
              </label>
              <label>
                <span className={labelClass}>Admit Card Release</span>
                <input
                  className={inputClass}
                  type="date"
                  value={formatExamDateForInput(examForm.admitCardRelease)}
                  onChange={(event) => setExamForm((prev) => ({ ...prev, admitCardRelease: formatExamDateFromInput(event.target.value) }))}
                />
                <span className="mt-1 block text-[11px] text-slate-500">dd-mm-yyyy</span>
              </label>
              <label>
                <span className={labelClass}>Exam Date</span>
                <input
                  className={inputClass}
                  type="date"
                  value={formatExamDateForInput(examForm.examDate)}
                  onChange={(event) => setExamForm((prev) => ({ ...prev, examDate: formatExamDateFromInput(event.target.value) }))}
                />
                <span className="mt-1 block text-[11px] text-slate-500">dd-mm-yyyy</span>
              </label>
              <label>
                <span className={labelClass}>Result Date</span>
                <input
                  className={inputClass}
                  type="date"
                  value={formatExamDateForInput(examForm.resultDate)}
                  onChange={(event) => setExamForm((prev) => ({ ...prev, resultDate: formatExamDateFromInput(event.target.value) }))}
                />
                <span className="mt-1 block text-[11px] text-slate-500">dd-mm-yyyy</span>
              </label>
              <label className="flex items-center gap-3 rounded-[1rem] border border-slate-200 bg-slate-50 px-4 py-3 md:col-span-2 xl:col-span-3">
                <input
                  type="checkbox"
                  checked={examForm.isTopExam}
                  onChange={(event) => setExamForm((prev) => ({ ...prev, isTopExam: event.target.checked }))}
                  className="size-4 rounded border-slate-300 text-[color:var(--brand-primary)] focus:ring-[color:var(--brand-primary)]"
                />
                <div className="min-w-0">
                  <span className="block text-sm font-semibold text-slate-800">Top Exam</span>
                  <span className="block text-[11px] text-slate-500">
                    Tick this to show the exam on the homepage top section.
                  </span>
                </div>
              </label>
            </div>

            <div className="flex flex-wrap gap-3">
              <button className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
                {editExamId ? "Update Exam" : "Save Exam"}
              </button>
              {editExamId ? (
                <button
                  type="button"
                  onClick={resetExamForm}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
                >
                  Cancel Edit
                </button>
              ) : null}
            </div>
          </form>

          {savedExams.length > 0 ? (
            <div className="overflow-hidden rounded-[0.65rem] border border-[#dbe3ee] bg-white shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
              <div className="flex flex-col gap-2 border-b border-[#dbe3ee] bg-white px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[12px] font-semibold text-[#60708f]">
                  {savedExams.length} exam schedules
                </p>
                <p className="text-[12px] font-semibold text-[#60708f]">
                  Top exam works on the homepage rail
                </p>
              </div>

              <div className="admin-users-table-scroll overflow-x-auto pb-2">
                <table className="w-full min-w-[1120px] table-fixed text-left text-[13px] text-[#40557a]">
                  <thead className="border-b border-[#dbe3ee] bg-[linear-gradient(90deg,#f0f7ff_0%,#f8fbff_50%,#fff7ed_100%)] text-[11px] font-bold uppercase">
                    <tr>
                      {[
                        { label: "Exam Name", width: "w-[24%]", align: "text-left", tone: "bg-[#eaf3ff] text-[#0f4c81]" },
                        { label: "Application Fees", width: "w-[14%]", align: "text-left", tone: "bg-[#eef8ff] text-[#2563eb]" },
                        { label: "Exam Date", width: "w-[14%]", align: "text-left", tone: "bg-[#ecfdf5] text-[#0f766e]" },
                        { label: "Top Exam", width: "w-[12%]", align: "text-center", tone: "bg-[#f0fdf4] text-[#15803d]" },
                        { label: "Updated", width: "w-[13%]", align: "text-left", tone: "bg-[#fff7ed] text-[#b45309]" },
                        { label: "Action", width: "w-[23%]", align: "text-right", tone: "bg-[#fff1f2] text-[#be123c]" },
                      ].map((column) => (
                        <th key={column.label} className={`${column.width} px-4 py-2 ${column.align}`}>
                          <span className={`inline-flex items-center rounded-md px-2 py-1 ${column.tone} ${column.align === "text-right" ? "justify-end" : ""}`}>
                            {column.label}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#dbe3ee]">
                    {visibleExamTableRows.map((row) => {
                      const exam = row as SavedExamSchedule;
                      return (
                        <tr key={row.id} className="bg-white transition hover:bg-[#f8fbff]">
                          <td className="px-4 py-2.5 align-top">
                            <div className="min-w-0">
                              <p className="truncate font-bold leading-5 text-[#15213a]">{row.examName}</p>
                              <p className="mt-0.5 truncate text-[11px] text-[#60708f]">
                                {formatDate(row.startDateToApply)} to {formatDate(row.lastDateToApply)}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-2.5 font-medium leading-5 text-[#40557a]">
                            {row.applicationFees || "-"}
                          </td>
                          <td className="px-4 py-2.5 font-medium leading-5 text-[#2f4366]">
                            {formatDate(row.examDate)}
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            <span className={`inline-flex min-w-[4.4rem] items-center justify-center rounded-full border px-3 py-1 text-[11px] font-bold ${row.isTopExam ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50 text-slate-600"}`}>
                              {row.isTopExam ? "Featured" : "Standard"}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 font-medium leading-5 text-[#2f4366]">
                            {formatDate(row.updatedAt)}
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <div className="flex flex-wrap justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => startExamEdit(exam)}
                                className="inline-flex min-w-20 items-center justify-center whitespace-nowrap rounded-md bg-[#eef0ff] px-3 py-1.5 text-[11px] font-bold text-[#4f46e5] transition hover:bg-[#e0e7ff]"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => openDeleteExamDialog(exam)}
                                className="inline-flex min-w-20 items-center justify-center whitespace-nowrap rounded-md border border-rose-200 bg-rose-50 px-3 py-1.5 text-[11px] font-bold text-rose-600 transition hover:bg-rose-600 hover:text-white"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-col gap-2 border-t border-[#dbe3ee] bg-white px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[12px] font-semibold text-[#60708f]">
                  Showing {(examSchedulesPage - 1) * EXAM_SCHEDULES_PER_PAGE + 1}-{Math.min(examSchedulesPage * EXAM_SCHEDULES_PER_PAGE, examTableRows.length)} of {examTableRows.length}
                </p>
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setExamSchedulesPage((page) => Math.max(1, page - 1))}
                    disabled={examSchedulesPage <= 1}
                    className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    Previous
                  </button>
                  <span className="inline-flex min-w-8 items-center justify-center rounded-md bg-[#4f46e5] px-3 py-1.5 text-[12px] font-bold text-white">
                    {examSchedulesPage}
                  </span>
                  <button
                    type="button"
                    onClick={() => setExamSchedulesPage((page) => Math.min(examSchedulesTotalPages, page + 1))}
                    disabled={examSchedulesPage >= examSchedulesTotalPages}
                    className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-[1rem] border border-dashed border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
              No exam schedules added yet.
            </div>
          )}
        </div>
      ) : null}

      {!loading && activeTab === "cutoff-questions" ? (
        <AdminCutoffQuestions />
      ) : null}

      {!loading && activeTab === "admin-access" ? (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => (showSubAdminForm ? resetSubAdminForm() : setShowSubAdminForm(true))}
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <Plus className="size-4" />
              {showSubAdminForm ? "Close" : "Add Admin"}
            </button>
          </div>

          {showSubAdminForm ? (
            <form onSubmit={saveSubAdmin} className="luxe-card space-y-4 p-5">
              <div className="grid gap-3 md:grid-cols-2">
                <label className="block">
                  <span className={labelClass}>Sub Admin Mail</span>
                  <input className={inputClass} type="email" placeholder="Enter sub admin email address" value={subAdminForm.email} onChange={(event) => setSubAdminForm((prev) => ({ ...prev, email: event.target.value }))} required />
                  <span className="mt-1 block text-[11px] text-slate-500">Use a different mail id from the main admin email.</span>
                </label>
                <label className="block">
                  <span className={labelClass}>Password</span>
                  <input className={inputClass} type="password" placeholder={editSubAdminId ? "New password (optional)" : "Password"} value={subAdminForm.password} onChange={(event) => setSubAdminForm((prev) => ({ ...prev, password: event.target.value }))} />
                </label>
              </div>

              <div className="grid gap-2 md:grid-cols-2">
                {adminAccessSections.map((section) => (
                  <label key={section.id} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
                    <input
                      type="checkbox"
                      checked={subAdminForm.permissions.includes(section.id)}
                      onChange={(event) =>
                        setSubAdminForm((prev) => ({
                          ...prev,
                          permissions: event.target.checked
                            ? [...new Set([...prev.permissions, section.id])]
                            : prev.permissions.filter((item) => item !== section.id),
                        }))
                      }
                    />
                    {section.label}
                  </label>
                ))}
              </div>

              <div className="flex gap-3">
                <button className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
                  {editSubAdminId ? "Update Admin" : "Save Admin"}
                </button>
                <button type="button" onClick={resetSubAdminForm} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
                  Cancel
                </button>
              </div>
            </form>
          ) : null}

          <div className="space-y-3">
            {adminState.subAdmins.map((item) => (
              <article key={item._id} className="luxe-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-900">{item.email || "Sub-admin"}</h3>
                  <p className="text-sm text-slate-500">{formatAdminPermissionSummary(item.permissions)}</p>
                  <p className="text-sm text-slate-500">{item.mustResetPassword ? "Password setup pending" : "Ready"} • {formatDate(item.createdAt)}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setEditSubAdminId(item._id);
                      setShowSubAdminForm(true);
                      setSubAdminForm({
                        email: item.email || "",
                        password: "",
                        permissions: item.permissions || [],
                      });
                    }}
                    className={`${solidBlueButtonClass} min-w-24 whitespace-nowrap`}
                  >
                    <PencilLine className="size-4" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => openDeleteSubAdminDialog(item)}
                    className="inline-flex min-w-24 items-center justify-center whitespace-nowrap rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white"
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : null}

      {deleteExamDialog ? (
        <div
          className="fixed inset-0 z-[2200] flex items-center justify-center bg-slate-950/45 p-4"
          onClick={closeDeleteExamDialog}
        >
          <div
            className="w-full max-w-sm rounded-[1.35rem] border border-rose-100 bg-white p-5 shadow-[0_26px_60px_rgba(15,23,42,0.24)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
                <TriangleAlert className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-rose-500">Delete Exam</p>
                <h3 className="mt-1 text-base font-bold text-slate-950">
                  Are you delete this exam?
                </h3>
                <p className="mt-1.5 break-words text-xs leading-5 text-slate-500">
                  {deleteExamDialog.name} will be removed from the exams list.
                </p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeDeleteExamDialog}
                disabled={isDeletingExam}
                className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void confirmDeleteExam()}
                disabled={isDeletingExam}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeletingExam ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {deleteUserDialog ? (
        <div
          className="fixed inset-0 z-[2200] flex items-center justify-center bg-slate-950/45 p-4"
          onClick={closeDeleteUserDialog}
        >
          <div
            className="w-full max-w-sm rounded-[1.35rem] border border-rose-100 bg-white p-5 shadow-[0_26px_60px_rgba(15,23,42,0.24)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
                <TriangleAlert className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-rose-500">Delete User</p>
                <h3 className="mt-1 text-base font-bold text-slate-950">
                  Are you sure you want to delete {deleteUserDialog.name}?
                </h3>
                <p className="mt-1.5 break-words text-xs leading-5 text-slate-500">
                  {deleteUserDialog.email || "This user"} will be removed from the platform.
                </p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeDeleteUserDialog}
                disabled={isDeletingUser}
                className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void confirmDeleteUser()}
                disabled={isDeletingUser}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeletingUser ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {deleteEnquiryDialog ? (
        <div
          className="fixed inset-0 z-[2200] flex items-center justify-center bg-slate-950/45 p-4"
          onClick={closeDeleteEnquiryDialog}
        >
          <div
            className="w-full max-w-sm rounded-[1.35rem] border border-rose-100 bg-white p-5 shadow-[0_26px_60px_rgba(15,23,42,0.24)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
                <TriangleAlert className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-rose-500">Delete Enquiry</p>
                <h3 className="mt-1 text-base font-bold text-slate-950">
                  Are you sure you want to delete this enquiry?
                </h3>
                <p className="mt-1.5 break-words text-xs leading-5 text-slate-500">
                  {deleteEnquiryDialog.name}{deleteEnquiryDialog.email ? ` - ${deleteEnquiryDialog.email}` : ""} will be removed.
                </p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeDeleteEnquiryDialog}
                disabled={isDeletingEnquiry}
                className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void confirmDeleteEnquiry()}
                disabled={isDeletingEnquiry}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeletingEnquiry ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {deleteSubAdminDialog ? (
        <div
          className="fixed inset-0 z-[2200] flex items-center justify-center bg-slate-950/45 p-4"
          onClick={closeDeleteSubAdminDialog}
        >
          <div
            className="w-full max-w-sm rounded-[1.35rem] border border-rose-100 bg-white p-5 shadow-[0_26px_60px_rgba(15,23,42,0.24)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
                <TriangleAlert className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-rose-500">Delete Admin</p>
                <h3 className="mt-1 text-base font-bold text-slate-950">
                  Are you sure you want to delete this admin?
                </h3>
                <p className="mt-1.5 break-words text-xs leading-5 text-slate-500">
                  {deleteSubAdminDialog.email} will lose admin access.
                </p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeDeleteSubAdminDialog}
                disabled={isDeletingSubAdmin}
                className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void confirmDeleteSubAdmin()}
                disabled={isDeletingSubAdmin}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeletingSubAdmin ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {deleteCollegeDialog ? (
        <div
          className="fixed inset-0 z-[2100] bg-transparent"
          onClick={closeDeleteCollegeDialog}
        >
          <div
            className="fixed overflow-hidden rounded-[1.5rem] border border-rose-100 bg-[linear-gradient(180deg,#ffffff_0%,#fff8f8_100%)] shadow-[0_26px_60px_rgba(15,23,42,0.22)]"
            style={{
              top: deleteCollegeDialog.top,
              left: deleteCollegeDialog.left,
              width: deleteCollegeDialog.width,
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className={`absolute right-8 size-4 rotate-45 bg-white ${
                deleteCollegeDialog.placement === "top"
                  ? "-bottom-1 border-b border-r border-rose-100"
                  : "-top-1 border-l border-t border-rose-100"
              }`}
            />
            <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#ef4444_0%,#fb7185_55%,#f59e0b_100%)]" />
            <button
              type="button"
              onClick={closeDeleteCollegeDialog}
              disabled={isDeletingCollege}
              className="absolute right-3 top-3 flex size-7 items-center justify-center rounded-full bg-white/80 text-slate-400 transition hover:bg-white hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <X className="size-3.5" />
            </button>

            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#fee2e2_0%,#fecaca_100%)] text-rose-600 shadow-[0_12px_24px_rgba(239,68,68,0.16)]">
                  <TriangleAlert className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-rose-500">
                    Delete
                  </p>
                  <h3 className="mt-1 pr-7 text-base font-bold leading-5 text-slate-950">
                    Delete {deleteCollegeDialog.name}?
                  </h3>
                  <p className="mt-1.5 text-xs leading-5 text-slate-500">
                    Are you sure you want to delete this college? This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-[1.25rem] border border-rose-100 bg-rose-50 px-3 py-2.5 text-xs font-semibold text-rose-700">
                Confirm delete to remove {deleteCollegeDialog.name}.
              </div>

              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={closeDeleteCollegeDialog}
                  disabled={isDeletingCollege}
                  className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void confirmDeleteCollege()}
                  disabled={isDeletingCollege}
                  className="inline-flex items-center justify-center rounded-xl bg-[linear-gradient(135deg,#ef4444_0%,#dc2626_100%)] px-4 py-2 text-xs font-semibold text-white shadow-[0_14px_28px_rgba(239,68,68,0.2)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isDeletingCollege ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {showCollegeEditReminderConfirm ? (
        <div
          className="fixed inset-0 z-[2200] flex items-center justify-center bg-slate-950/45 p-4"
          onClick={closeCollegeEditReminderConfirm}
        >
          <div
            className="w-full max-w-lg rounded-[1.35rem] border border-blue-100 bg-white p-5 shadow-[0_26px_60px_rgba(15,23,42,0.24)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-[#2563eb]">
                <Mail className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#2563eb]">
                  Send Mail
                </p>
                <h3 className="mt-1 text-base font-bold text-slate-950">
                  Send reminder mail now?
                </h3>
                <p className="mt-1.5 text-xs leading-5 text-slate-500">
                  This will send the reminder email for the pending college edit status list.
                </p>
                <div className="mt-3 rounded-2xl bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700">
                  {collegeDashboardEditStatus.notEdited.length} colleges will receive the mail.
                </div>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeCollegeEditReminderConfirm}
                disabled={isSendingCollegeEditReminders}
                className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void confirmCollegeEditReminderSend()}
                disabled={isSendingCollegeEditReminders}
                className="rounded-xl bg-[#2563eb] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSendingCollegeEditReminders ? "Sending..." : "OK"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showSavedCourseList ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4" onClick={() => setShowSavedCourseList(false)}>
          <div className="flex max-h-[90vh] w-full max-w-6xl flex-col rounded-[1.5rem] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.22)]" onClick={(event) => event.stopPropagation()}>
            <div className="flex flex-col gap-2 border-b border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
              <h3 className="text-base font-bold text-slate-900 md:text-lg">Saved Course List</h3>
              <button
                type="button"
                onClick={() => setShowSavedCourseList(false)}
                className="w-full rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 sm:w-auto"
              >
                Done
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-5">
              <ResponsiveTableWrapper
                columns={[
                  {
                    key: "course",
                    label: "Course",
                    className: "whitespace-nowrap",
                    render: (_, row) => {
                      const item = row as EmbeddedCourseDraft;
                      return (
                        <div className="min-w-max">
                          <p className="whitespace-nowrap font-semibold text-slate-900">
                            {[item.courseType, item.specialization].filter(Boolean).join(" - ") || "Course"}
                          </p>
                          <p className="mt-1 whitespace-nowrap text-[11px] text-slate-500">{item.mode || "-"}</p>
                        </div>
                      );
                    },
                  },
                  {
                    key: "degreeType",
                    label: "Degree",
                    className: "whitespace-nowrap",
                  },
                  {
                    key: "stream",
                    label: "Stream",
                  },
                  {
                    key: "duration",
                    label: "Duration",
                    className: "whitespace-nowrap",
                  },
                  {
                    key: "minimumQualification",
                    label: "Qualification",
                    render: (value) => formatQualificationLabel(String(value || "")) || "-",
                  },
                  {
                    key: "semesterFees",
                    label: "Semester Fee",
                    className: "whitespace-nowrap",
                    render: (value) => formatCompactIndianCurrency(value),
                  },
                  {
                    key: "totalFees",
                    label: "Total Fee",
                    className: "whitespace-nowrap font-semibold text-slate-900",
                    render: (value) => formatCompactIndianCurrency(value),
                  },
                  {
                    key: "cutoff",
                    label: "Cutoff",
                    className: "whitespace-nowrap",
                    render: (_, row) => {
                      const item = row as EmbeddedCourseDraft;
                      const categoryCutoffs = normalizeCategoryCutoffs(item.cutoffByCategory);
                      if (categoryCutoffs.length > 0) {
                        return (
                          <div className="space-y-1 text-[11px] text-slate-600">
                            {categoryCutoffs.map((cutoffItem) => (
                              <p key={cutoffItem.category} className="whitespace-nowrap">
                                <span className="font-semibold text-slate-800">{cutoffItem.category}</span>: {cutoffItem.cutoff}
                              </p>
                            ))}
                          </div>
                        );
                      }
                      return item.cutoff || "-";
                    },
                  },
                  {
                    key: "intake",
                    label: "Intake",
                    className: "whitespace-nowrap",
                    render: (value) => formatPreviewCellValue(value, "intake"),
                  },
                  {
                    key: "applicationFee",
                    label: "Application Fee",
                    className: "whitespace-nowrap",
                    render: (value) => formatCompactIndianCurrency(value),
                  },
                  {
                    key: "entranceExams",
                    label: "Entrance Exam",
                    render: (_, row) => {
                      const item = row as EmbeddedCourseDraft;
                      if (item.entranceExams && item.entranceExams.some((exam) => Object.values(exam).some(Boolean))) {
                        return (
                          <div className="space-y-2">
                            {item.entranceExams
                              .filter((exam) => Object.values(exam).some(Boolean))
                              .map((exam, idx) => (
                                <div key={idx} className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-[11px] text-slate-600">
                                  <p className="font-semibold text-slate-800">{exam.examName || `Exam ${idx + 1}`}</p>
                                  <p>Cutoff: {exam.cutoffScoreOrRank || "-"}</p>
                                  <p>Weightage: {exam.weightage || "-"}</p>
                                </div>
                              ))}
                          </div>
                        );
                      }
                      return "Not needed";
                    },
                  },
                  {
                    key: "university",
                    label: "University",
                  },
                  {
                    key: "actions",
                    label: "Action",
                    className: "whitespace-nowrap",
                    render: (_, row, index) => {
                      const item = row as EmbeddedCourseDraft & { _id?: string };
                      return (
                        <div className="flex flex-wrap justify-end gap-2 xl:flex-nowrap">
                          <button
                            type="button"
                            onClick={() => {
                              setShowSavedCourseList(false);
                              editEmbeddedCourse(index);
                            }}
                            className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setEmbeddedCourses((prev) => prev.filter((_, courseIndex) => courseIndex !== index))
                            }
                            className="rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600"
                          >
                            Remove
                          </button>
                        </div>
                      );
                    },
                  },
                ]}
                data={embeddedCourses}
                keyExtractor={(_, idx) => `course-${idx}`}
                expandedRowContent={(row) => {
                  const item = row as EmbeddedCourseDraft;
                  return (
                    <div className="grid gap-3 text-sm">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <p className="font-semibold text-slate-700">Degree:</p>
                          <p className="mt-1 break-words text-slate-600">{item.degreeType || "-"}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-700">Stream:</p>
                          <p className="mt-1 break-words text-slate-600">{item.stream || "-"}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-700">Duration:</p>
                          <p className="mt-1 break-words text-slate-600">{item.duration || "-"}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-700">Qualification:</p>
                          <p className="mt-1 break-words text-slate-600">
                            {formatQualificationLabel(String(item.minimumQualification || "")) || "-"}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-700">Lateral Entry:</p>
                        <p className="mt-1 break-words text-slate-600">
                          {item.lateralEntryAvailable
                            ? `Available${item.lateralEntryDetails ? ` - ${item.lateralEntryDetails}` : ""}`
                            : "Not available"}
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-700">Description:</p>
                        <p className="mt-1 break-words text-slate-600">{item.description || "-"}</p>
                      </div>
                      <div className="flex flex-wrap gap-2 border-t border-slate-200 pt-3">
                        <button
                          type="button"
                          onClick={() => {
                            setShowSavedCourseList(false);
                            const courseIndex = embeddedCourses.findIndex((course) => course.id === item.id);
                            if (courseIndex >= 0) {
                              editEmbeddedCourse(courseIndex);
                            }
                          }}
                          className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setEmbeddedCourses((prev) => prev.filter((course) => course.id !== item.id))
                          }
                          className="rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                }}
              />
            </div>
          </div>
        </div>
      ) : null}
    </AdminPortalShell>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<Loading />}>
      <AdminPageContent />
    </Suspense>
  );
}
