"use client";

import { strFromU8, strToU8, unzipSync, zipSync } from "@/lib/vendor/fflate-browser";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BadgeCheck,
  Bell,
  Building2,
  Download,
  ExternalLink,
  FileClock,
  Filter,
  ImageUp,
  KeyRound,
  LayoutDashboard,
  MailOpen,
  PencilLine,
  Plus,
  Search,
  TriangleAlert,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AdminPortalShell } from "@/components/admin-portal-shell";
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

type AdminUser = SafeAuthUser & { isSuperAdmin?: boolean; permissions?: string[] };
type CategoryCutoff = { category?: string; cutoff?: string };
type AdminCollege = { _id: string; collegeCode?: string; name?: string; establishedYear?: string | number; ownershipType?: string; university?: string; country?: string; state?: string; city?: string; district?: string; address?: string; pincode?: string; description?: string; reviews?: string; admissionProcess?: string; applicationMode?: string; locationLink?: string; mapUrl?: string; website?: string; contactEmail?: string; ownerEmail?: string; alternatePhone?: string; contactPhone?: string; phone?: string; accreditation?: string; awardsRecognitions?: string; quotas?: string[] | string; brochurePdfUrl?: string; brochureUrl?: string; campusVideoUrl?: string; isBestCollege?: boolean; isTopCollege?: boolean; logo?: string; images?: string[]; image?: string; ranking?: string | number; placementRate?: string | number; lastDashboardEditAt?: string; feesStructure?: Record<string, unknown>; courseTags?: string; facilities?: string[] | string; scholarships?: string; placements?: { highestPackage?: string | number; averagePackage?: string | number; companiesVisited?: string | number; placementRate?: string | number }; hostelDetails?: { availability?: string; hostelType?: string; cctvAvailable?: string; boysRoomsCount?: string | number; girlsRoomsCount?: string | number; facilityOptions?: string[]; waterAvailability?: string; powerBackup?: string; internet?: { wifiAvailable?: string; speed?: string; pricing?: string }; foodAvailability?: string; foodTimings?: string; laundryService?: string; roomCleaningFrequency?: string; rules?: string; hostelFees?: { minAmount?: string | number; maxAmount?: string | number } } };
type AdminCourseExam = { examName?: string; cutoffScoreOrRank?: string; cutoffByCategory?: CategoryCutoff[]; cutoffCategory?: string; weightage?: string; paperOrSyllabus?: string; preparationNotes?: string };
type AdminCourse = { _id: string; course?: string; courseName?: string; courseType?: string; courseCategory?: string; degreeType?: string; stream?: string; specialization?: string; duration?: string; mode?: string; lateralEntryAvailable?: boolean; lateralEntryDetails?: string; minimumQualification?: string; admissionProcess?: string; applicationFee?: string | number; intake?: string | number; hostelFees?: string | number; university?: string; cutoff?: string | number; cutoffByCategory?: CategoryCutoff[]; description?: string; isTopCourse?: boolean; entranceExams?: AdminCourseExam[]; colleges?: Array<{ _id?: string; name?: string }>; collegeDetails?: Array<{ college?: string | { _id?: string; name?: string }; semesterFees?: number; totalFees?: number; hostelFees?: number; cutoff?: string; cutoffByCategory?: CategoryCutoff[]; intake?: number; applicationFee?: number }> };
type PlatformUser = { _id: string; name?: string; email?: string; phone?: string; role?: string; createdAt?: string };
type Enquiry = { _id: string; name?: string; email?: string; collegeName?: string; courseName?: string; message?: string; createdAt?: string; user?: { name?: string; email?: string } };
type ChangeSummaryItem = { field?: string; label?: string; before?: unknown; after?: unknown };
type RequestItem = { _id: string; requesterName?: string; requesterEmail?: string; email?: string; phone?: string; message?: string; status?: string; updatedAt?: string; createdAt?: string; actionType?: string; payload?: { name?: string; course?: string; courseName?: string; duration?: string }; submittedPayload?: Record<string, unknown> | null; changeSummary?: ChangeSummaryItem[]; formAccessUsedAt?: string; grantedCollegeIds?: string[]; allowOwnCollegeCreate?: boolean };
type SubAdmin = { _id: string; email?: string; permissions?: string[]; mustResetPassword?: boolean; createdAt?: string };
type AdminState = { colleges: AdminCollege[]; courses: AdminCourse[]; users: PlatformUser[]; enquiries: Enquiry[]; collegeRequests: RequestItem[]; subAdmins: SubAdmin[] };
type SiteSettings = { homeHeroImageUrl?: string; examSchedules?: SavedExamSchedule[] };
type CollegeForm = { name: string; establishedYear: string; ownershipType: string; university: string; country: string; state: string; city: string; district: string; address: string; pincode: string; description: string; reviews: string; admissionProcess: string; applicationMode: string; ranking: string; placementRate: string; feeMin: string; feeMax: string; locationLink: string; website: string; contactEmail: string; contactPhone: string; alternatePhone: string; accreditation: string; awardsRecognitions: string; brochurePdfUrl: string; campusVideoUrl: string; isTopCollege: boolean; isBestCollege: boolean; logo: string; coverImage: string; images: string[]; courseTags: string; facilities: string; scholarships: string; highestPackage: string; averagePackage: string; companiesVisited: string; quotas: string; hostelAvailability: string; hostelType: string; hostelFeeMin: string; hostelFeeMax: string; cctvAvailable: string; boysRoomsCount: string; girlsRoomsCount: string; hostelFacilityOptions: string; waterAvailability: string; powerBackup: string; wifiAvailable: string; wifiSpeed: string; wifiPricing: string; foodAvailability: string; foodTimings: string; laundryService: string; roomCleaningFrequency: string; hostelRules: string };
type CourseExamForm = { examName: string; cutoffScoreOrRank: string; cutoffByCategory: CategoryCutoff[]; cutoffCategory: string; cutoffValue: string; weightage: string; paperOrSyllabus: string; preparationNotes: string };
type CourseCollegeDetailForm = { semesterFees: string; totalFees: string; cutoff: string; intake: string; applicationFee: string };
type CourseForm = { courseType: string; degreeType: string; stream: string; specialization: string; duration: string; mode: string; lateralEntryAvailable: boolean; lateralEntryDetails: string; minimumQualification: string; university: string; admissionProcess: string; description: string; isTopCourse: boolean; entranceExamsEnabled: boolean; entranceExams: CourseExamForm[]; colleges: string[]; details: Record<string, CourseCollegeDetailForm> };
type SubAdminForm = { email: string; password: string; permissions: string[] };
type ExamScheduleForm = { examName: string; applicationFees: string; startDateToApply: string; lastDateToApply: string; correctionDate: string; lastDateForFeePayment: string; admitCardRelease: string; examDate: string; resultDate: string };
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

const emptyState: AdminState = { colleges: [], courses: [], users: [], enquiries: [], collegeRequests: [], subAdmins: [] };
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
  const digits = value.replace(/\D/g, "");
  if (digits.length > 10 && digits.startsWith("91")) return digits.slice(2, 12);
  return digits.slice(0, 10);
};
const isValidIndianPhone = (value: string) => /^\d{10}$/.test(value);
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
};
const adminAccessSections = [
  { id: "overview", label: adminModuleLabels.overview, icon: LayoutDashboard },
  { id: "colleges", label: adminModuleLabels.colleges, icon: Building2 },
  { id: "bulk-upload", label: adminModuleLabels["bulk-upload"], icon: ImageUp },
  { id: "college-notifications", label: adminModuleLabels["college-notifications"], icon: FileClock },
  { id: "users", label: adminModuleLabels.users, icon: UserRound },
  { id: "enquiries", label: adminModuleLabels.enquiries, icon: MailOpen },
  { id: "exams", label: adminModuleLabels.exams, icon: BadgeCheck },
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

const expandScientificInteger = (value: string) => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (!/[eE]/.test(raw)) return raw.replace(/\.0+$/, "");
  const numeric = Number(raw);
  if (!Number.isFinite(numeric)) return raw;
  const normalized = numeric.toLocaleString("en-US", {
    useGrouping: false,
    maximumFractionDigits: 0,
  });
  return normalized;
};

const normalizeRankingInteger = (value: string) => {
  const raw = expandScientificInteger(String(value || "").trim());
  if (!raw) return "";
  const numeric = Number(raw);
  if (!Number.isFinite(numeric)) return raw.replace(/[^\d]/g, "");
  return String(Math.trunc(numeric));
};

const formatPreviewCellValue = (value: unknown, column?: string) => {
  const raw = String(value ?? "").trim();
  if (!raw) return column === "accreditation" ? "Empty" : "-";
  if (column === "phoneNumber" || column === "alternatePhone" || column === "pincode") return expandScientificInteger(raw);
  if (isCutoffPreviewColumn(column)) return raw;
  if (/^-?\d+\.0+$/.test(raw)) return stripTrailingZeroDecimal(raw);
  if (/^\d+$/.test(raw) && raw.length > 1 && raw.startsWith("0")) return raw;
  return raw;
};

const normalizeScientificInteger = (value: string) => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (!/[eE]/.test(raw)) return raw.replace(/\.0+$/, "");
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return raw;
  return parsed.toLocaleString("en-US", { useGrouping: false, maximumFractionDigits: 0 });
};

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

type BulkSheetKey = "colleges" | "courses" | "entranceexams" | "collegeimages";
type BulkRowStatus = "Valid" | "Invalid" | "Review";
type BulkFieldIssueLevel = "missing" | "invalid" | "review" | "duplicate" | "exists";
type BulkFieldIssue = {
  level: BulkFieldIssueLevel;
  messages: string[];
};
type BulkPreviewRow = {
  id: number;
  sheet: BulkSheetKey;
  rowNumber: number;
  data: Record<string, string>;
  status: BulkRowStatus;
  errors: string[];
  fieldIssues: Record<string, BulkFieldIssue>;
};
type ZipAssetRecord = {
  normalizedPath: string;
  normalizedName: string;
  matchTokens: Set<string>;
};
type ZipAssetIndex = {
  byPath: Map<string, ZipAssetRecord>;
  byName: Map<string, ZipAssetRecord[]>;
};

const bulkSheetLabels: Record<BulkSheetKey, string> = {
  colleges: "Colleges",
  courses: "Courses",
  entranceexams: "EntranceExams",
  collegeimages: "CollegeImages",
};
const parseCollegeCodeSequence = (value: string) => {
  const raw = String(value || "").trim();
  if (!raw) return null;
  const match = raw.match(/^(.*?)(\d+)$/);
  if (!match) return null;
  const [, prefix, numberPart] = match;
  const numericValue = Number(numberPart);
  if (!Number.isFinite(numericValue)) return null;
  return {
    code: raw,
    prefix,
    numericValue,
    padLength: numberPart.length,
  };
};
const normalizeAccreditationOptionValue = (value: string) => String(value || "").trim().replace(/\s+/g, " ").toLowerCase();
const collegeAccreditationOptionSet = new Set(COLLEGE_ACCREDITATION_OPTIONS.map(normalizeAccreditationOptionValue));
const bulkCutoffCategories = ["OC", "BC", "BCM", "MBC", "SC", "SCA", "ST"] as const;
const bulkCutoffCategoryKeyMap = Object.fromEntries(
  bulkCutoffCategories.map((category) => [category, category.toLowerCase()]),
) as Record<(typeof bulkCutoffCategories)[number], string>;
const bulkSingleCutoffColumns = bulkCutoffCategories.map((category) => {
  const key = bulkCutoffCategoryKeyMap[category];
  return `cutoff_${key}`;
});
const bulkRangeCutoffColumns = bulkCutoffCategories.flatMap((category) => {
  const key = bulkCutoffCategoryKeyMap[category];
  return [`cutoff_${key}_min`, `cutoff_${key}_max`];
});
const bulkCutoffColumns = [...bulkSingleCutoffColumns, ...bulkRangeCutoffColumns];

const bulkSheetColumns: Record<BulkSheetKey, string[]> = {
  colleges: [
    "collegeCode", "collegeName", "description", "establishedYear", "ownershipType", "university", "country", "state", "city", "district", "address", "pincode", "googleMapUrl", "officialEmail", "phoneNumber", "alternatePhone", "websiteUrl", "logoImage", "coverImage", "brochurePdf", "campusVideo", "ranking", "accreditation", "awards", "reviews", "facilities", "quotas", "minFee", "maxFee", "admissionProcess", "applicationMode", "scholarships", "placementPercentage", "averagePackage", "highestPackage", "hostelGeneralInfo", "hostelType", "hostelMinFee", "hostelMaxFee", "cctvAvailability", "hostelFacilities", "isBestCollege",
  ],
  courses: [
    "collegeCode", "degreeType", "stream", "specialization", "courseName", "duration", "mode", "lateralEntry", "bestCourse", "minimumQualification", "university", "allottedSeats", "applicationFee", "courseDescription", "semesterFees", "totalFees", "cutoff_oc_min", "cutoff_oc_max", "cutoff_bc_min", "cutoff_bc_max", "cutoff_bcm_min", "cutoff_bcm_max", "cutoff_mbc_min", "cutoff_mbc_max", "cutoff_sc_min", "cutoff_sc_max", "cutoff_sca_min", "cutoff_sca_max", "cutoff_st_min", "cutoff_st_max",
  ],
  entranceexams: [
    "collegeCode", "courseName", "examName", "examWeightage", "cutoff_oc_min", "cutoff_oc_max", "cutoff_bc_min", "cutoff_bc_max", "cutoff_bcm_min", "cutoff_bcm_max", "cutoff_mbc_min", "cutoff_mbc_max", "cutoff_sc_min", "cutoff_sc_max", "cutoff_sca_min", "cutoff_sca_max", "cutoff_st_min", "cutoff_st_max", "specifiedSubjects", "preparationNotes",
  ],
  collegeimages: ["collegeCode", "imageType", "imageName"],
};

const normalizedBulkColumnLookup = Object.fromEntries(
  Object.values(bulkSheetColumns).flat().map((column) => [column.toLowerCase(), column]),
) as Record<string, string>;
const bulkPreviewColumnLabels: Record<string, string> = {
  rankingMin: "ranking_min",
  rankingMax: "ranking_max",
};

const bulkColumnAliases: Record<string, string> = {
  scholarship: "scholarships",
  hostelgen: "hostelgeneralinfo",
  allotedseats: "allottedseats",
  specifiedpaperorsyllabus: "specifiedsubjects",
  rankingmin: "rankingmin",
  rankingmax: "rankingmax",
};

function BulkUploadDashboard({
  onImportComplete,
  onAddManualCollege,
  existingColleges = [],
}: {
  onImportComplete?: () => Promise<void> | void;
  onAddManualCollege?: () => void;
  existingColleges?: AdminCollege[];
}) {
  const previewDetailsRef = useRef<HTMLElement | null>(null);
  const [selectedUploadFiles, setSelectedUploadFiles] = useState<Record<string, File | null>>({});
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});
  const [activeUploadStep, setActiveUploadStep] = useState<"1" | "2" | null>(null);
  const [showZipUploadStep, setShowZipUploadStep] = useState(false);
  const [showValidationSummaryStep, setShowValidationSummaryStep] = useState(false);
  const [validationSummary, setValidationSummary] = useState({
    totalRecords: 0,
    validRecords: 0,
    failedRecords: 0,
    invalidRecords: 0,
    duplicates: 0,
    pendingReview: 0,
  });
  
  const [validationStatusText, setValidationStatusText] = useState("Upload bulk Excel or single college Excel, then upload one combined image ZIP to validate records.");
  const [showFullDetails, setShowFullDetails] = useState(false);
  const [showFinishPopup, setShowFinishPopup] = useState(false);
  const [showAllErrors, setShowAllErrors] = useState(false);
  const [activeDetailSheet, setActiveDetailSheet] = useState<BulkSheetKey>("colleges");
  const [detailSearchText, setDetailSearchText] = useState("");
  const [detailStatusFilter, setDetailStatusFilter] = useState<"all" | BulkRowStatus>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [openFieldPanel, setOpenFieldPanel] = useState<"all" | "single" | null>(null);
  const [customSheetColumns, setCustomSheetColumns] = useState<Record<BulkSheetKey, string[]>>({
    colleges: [],
    courses: [],
    entranceexams: [],
    collegeimages: [],
  });
  const [customFieldForm, setCustomFieldForm] = useState({
    fieldName: "",
    fieldType: "Number",
    defaultValue: "",
    selectedCollegeRowId: "",
  });
  const [editingRowId, setEditingRowId] = useState<number | null>(null);
  const [editingFocusField, setEditingFocusField] = useState("");
  const [editingRowBackup, setEditingRowBackup] = useState<BulkPreviewRow | null>(null);
  const [fieldErrorText, setFieldErrorText] = useState("");
  const [previewRows, setPreviewRows] = useState<BulkPreviewRow[]>([]);
  const [validatedZipAssetIndex, setValidatedZipAssetIndex] = useState<ZipAssetIndex | null>(null);
  const [mediaPreviewUrls, setMediaPreviewUrls] = useState<Record<string, string>>({});
  const [isImporting, setIsImporting] = useState(false);
  const [currentDetailPage, setCurrentDetailPage] = useState(1);
  const editingFieldRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const itemsPerPage = 5;
  const existingCollegeCodeSet = useMemo(
    () =>
      new Set(
        existingColleges
          .map((college) => String(college.collegeCode || "").trim().toLowerCase())
          .filter(Boolean),
      ),
    [existingColleges],
  );
  const existingCollegeNameSet = useMemo(
    () =>
      new Set(
        existingColleges
          .map((college) => String(college.name || "").trim().toLowerCase())
          .filter(Boolean),
      ),
    [existingColleges],
  );
  const lastCollegeCodeInsight = useMemo(() => {
    const parsedCodes = existingColleges
      .map((college) => parseCollegeCodeSequence(String(college.collegeCode || "")))
      .filter(Boolean) as Array<{
      code: string;
      prefix: string;
      numericValue: number;
      padLength: number;
    }>;

    if (parsedCodes.length) {
      const highestCode = parsedCodes.reduce((best, current) => {
        if (current.numericValue !== best.numericValue) {
          return current.numericValue > best.numericValue ? current : best;
        }
        if (current.prefix !== best.prefix) {
          return current.prefix.localeCompare(best.prefix) > 0 ? current : best;
        }
        return current.code.localeCompare(best.code) > 0 ? current : best;
      });
      const nextSuggestedCode = `${highestCode.prefix}${String(highestCode.numericValue + 1).padStart(highestCode.padLength, "0")}`;
      return {
        lastCode: highestCode.code,
        nextSuggestedCode,
      };
    }

    const fallbackCode = existingColleges
      .map((college) => String(college.collegeCode || "").trim())
      .filter(Boolean)
      .sort((left, right) => left.localeCompare(right))
      .at(-1);

    return {
      lastCode: fallbackCode || "",
      nextSuggestedCode: "",
    };
  }, [existingColleges]);
  const uploadCards = [
    {
      step: "1",
      title: "Add Bulk College Data",
      subtitle: "Upload Excel file to add multiple colleges at once",
      icon: ImageUp,
      dropText: "Drag & drop your Excel file here",
      action: "Choose Excel File",
      note: "Supports: .xlsx, .csv",
      accept: ".xlsx,.csv",
      allowedExtensions: [".xlsx", ".csv"],
    },
    {
      step: "2",
      title: "Add Single College Data",
      subtitle: "Upload one college record as Excel or CSV",
      icon: ImageUp,
      dropText: "Drag & drop your single college Excel here",
      action: "Choose Excel File",
      note: "Supports: .xlsx, .csv",
      accept: ".xlsx,.csv",
      allowedExtensions: [".xlsx", ".csv"],
    },
    {
      step: "3",
      title: "Add College Images ZIP",
      subtitle: "Upload logo, cover, brochure, and gallery files for each college",
      icon: FileClock,
      dropText: "Drag & drop combined media ZIP here",
      action: "Choose ZIP File",
      note: "Excel media columns must contain ZIP file names only. Max size: 50MB",
      accept: ".zip",
      allowedExtensions: [".zip"],
      maxSize: 50 * 1024 * 1024,
    },
  ];

  const formatFileSize = (size: number) => {
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getFileExtension = (fileName: string) => {
    const dotIndex = fileName.lastIndexOf(".");
    return dotIndex >= 0 ? fileName.slice(dotIndex).toLowerCase() : "";
  };

  const decodeXml = (value: string) =>
    value
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'");

  const normalizeUploadKey = (value: string) =>
    String(value || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");

  const displayColumnName = (value: string) =>
    bulkPreviewColumnLabels[value] || normalizedBulkColumnLookup[value.toLowerCase()] || value;

  const normalizeZipName = (value: string) =>
    String(value || "").replace(/\\/g, "/").split("/").pop()?.trim().toLowerCase() || "";

  const normalizeZipPath = (value: string) =>
    String(value || "").replace(/\\/g, "/").replace(/^\.?\//, "").trim().toLowerCase();

  const getZipMatchTokens = (value: string) => {
    const normalizedPath = normalizeZipPath(value);
    const tokens = new Set<string>();

    normalizedPath
      .split("/")
      .map((segment) => segment.replace(/\.[^.]+$/, ""))
      .forEach((segment) => {
        const compactToken = normalizeUploadKey(segment);
        if (compactToken) tokens.add(compactToken);

        segment
          .split(/[^a-z0-9]+/i)
          .map((part) => normalizeUploadKey(part))
          .filter(Boolean)
          .forEach((partToken) => tokens.add(partToken));

        const alphaNumericGroups = segment.match(/[a-z]+|\d+/gi) || [];
        alphaNumericGroups
          .map((part) => normalizeUploadKey(part))
          .filter(Boolean)
          .forEach((partToken) => tokens.add(partToken));
      });

    const fullPathToken = normalizeUploadKey(normalizedPath.replace(/\.[^.]+$/, ""));
    if (fullPathToken) tokens.add(fullPathToken);

    return tokens;
  };

  const buildZipAssetIndex = (fileNames: Iterable<string>): ZipAssetIndex => {
    const byPath = new Map<string, ZipAssetRecord>();
    const byName = new Map<string, ZipAssetRecord[]>();

    for (const fileName of fileNames) {
      const normalizedPath = normalizeZipPath(fileName);
      const normalizedName = normalizeZipName(fileName);
      if (!normalizedPath || !normalizedName) continue;

      const descriptor: ZipAssetRecord = {
        normalizedPath,
        normalizedName,
        matchTokens: getZipMatchTokens(fileName),
      };

      byPath.set(normalizedPath, descriptor);
      if (!byName.has(normalizedName)) byName.set(normalizedName, []);
      byName.get(normalizedName)?.push(descriptor);
    }

    return { byPath, byName };
  };

  const findBrochureZipAssetRecord = (
    zipAssetIndex: ZipAssetIndex | null,
    collegeCode = "",
  ): ZipAssetRecord | null => {
    if (!zipAssetIndex) return null;

    const collegeToken = normalizeUploadKey(collegeCode);
    const records = [...zipAssetIndex.byPath.values()].filter((record) =>
      !collegeToken || record.matchTokens.has(collegeToken),
    );

    const brochureNamedRecords = records.filter((record) => record.normalizedName.includes("brochure"));
    if (brochureNamedRecords.length > 0) return brochureNamedRecords[0];

    const pdfRecords = records.filter((record) => getFileExtension(record.normalizedName) === ".pdf");
    if (pdfRecords.length === 1) return pdfRecords[0];

    return null;
  };

  const resolveZipAssetRecord = (
    zipAssetIndex: ZipAssetIndex | null,
    fileName: string,
    collegeCode = "",
    options: { preferBrochure?: boolean } = {},
  ): ZipAssetRecord | null => {
    const raw = String(fileName || "").trim();
    if (!raw || !zipAssetIndex) return null;

    const normalizedPath = normalizeZipPath(raw);
    if (normalizedPath && zipAssetIndex.byPath.has(normalizedPath)) {
      return zipAssetIndex.byPath.get(normalizedPath) || null;
    }

    const normalizedName = normalizeZipName(raw);
    if (!normalizedName) return null;

    const collegeToken = normalizeUploadKey(collegeCode);
    const candidates = zipAssetIndex.byName.get(normalizedName) || [];
    if (candidates.length <= 1) {
      if (candidates[0]) return candidates[0];
    } else if (collegeToken) {
      const tokenMatches = candidates.filter((candidate) => candidate.matchTokens.has(collegeToken));
      if (tokenMatches.length > 0) return tokenMatches[0];
    }

    const requestedBaseToken = normalizeUploadKey(
      normalizedName.replace(/\.(jpg|jpeg|png|webp|gif|svg|pdf)$/i, ""),
    );
    if (requestedBaseToken) {
      const looseMatches = [...zipAssetIndex.byPath.values()].filter((record) => {
        if (collegeToken && !record.matchTokens.has(collegeToken)) return false;
        const recordBaseToken = normalizeUploadKey(record.normalizedName.replace(/\.(jpg|jpeg|png|webp|gif|svg|pdf)$/i, ""));
        return recordBaseToken === requestedBaseToken || recordBaseToken.includes(requestedBaseToken);
      });
      if (looseMatches.length > 0) return looseMatches[0];
    }

    if (options.preferBrochure) {
      return findBrochureZipAssetRecord(zipAssetIndex, collegeCode);
    }

    return candidates[0] || null;
  };

  const zipImageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"]);
  const supportedGalleryImageTypes = ["campus", "hostel", "classroom", "laboratory", "library", "sports", "placement", "hospital"] as const;

  const inferGalleryImageType = (fileName: string) => {
    const normalizedBaseName = normalizeUploadKey(normalizeZipName(fileName).replace(/\.[^.]+$/, ""));
    return supportedGalleryImageTypes.find((type) => normalizedBaseName.includes(type)) || "campus";
  };

  const inferZipMediaForCollege = (
    zipAssetIndex: ZipAssetIndex | null,
    collegeCode: string,
    allowLooseMatch = false,
  ) => {
    if (!zipAssetIndex) {
      return {
        logoImage: "",
        coverImage: "",
        brochurePdf: "",
        galleryImages: [] as Array<{ imageName: string; imageType: string }>,
      };
    }

    const collegeToken = normalizeUploadKey(collegeCode);
    let records = [...zipAssetIndex.byPath.values()].filter((record) => record.matchTokens.has(collegeToken));
    if (records.length === 0 && allowLooseMatch) {
      records = [...zipAssetIndex.byPath.values()];
    }

    records.sort((left, right) => left.normalizedPath.localeCompare(right.normalizedPath));

    let logoImage = "";
    let coverImage = "";
    let brochurePdf = "";
    const galleryImages: Array<{ imageName: string; imageType: string }> = [];

    for (const record of records) {
      const extension = getFileExtension(record.normalizedName);
      const normalizedBaseName = normalizeUploadKey(record.normalizedName.replace(/\.[^.]+$/, ""));

      if (!brochurePdf && (extension === ".pdf" || normalizedBaseName.includes("brochure"))) {
        brochurePdf = record.normalizedPath;
        continue;
      }

      if (!zipImageExtensions.has(extension)) continue;

      if (!logoImage && normalizedBaseName.includes("logo")) {
        logoImage = record.normalizedPath;
        continue;
      }

      if (!coverImage && (normalizedBaseName.includes("cover") || normalizedBaseName.includes("banner"))) {
        coverImage = record.normalizedPath;
        continue;
      }

      galleryImages.push({
        imageName: record.normalizedPath,
        imageType: inferGalleryImageType(record.normalizedName),
      });
    }

    return {
      logoImage,
      coverImage,
      brochurePdf,
      galleryImages,
    };
  };

  const enrichSheetsWithZipAssets = (
    sheets: Map<string, Record<string, string>[]>,
    zipAssetIndex: ZipAssetIndex | null,
  ) => {
    if (!zipAssetIndex) return sheets;

    const nextSheets = new Map<string, Record<string, string>[]>(
      [...sheets.entries()].map(([sheet, rows]) => [sheet, rows.map((row) => ({ ...row }))]),
    );

    const collegeCodeKey = normalizeUploadKey("collegeCode");
    const logoImageKey = normalizeUploadKey("logoImage");
    const coverImageKey = normalizeUploadKey("coverImage");
    const brochurePdfKey = normalizeUploadKey("brochurePdf");
    const imageTypeKey = normalizeUploadKey("imageType");
    const imageNameKey = normalizeUploadKey("imageName");

    const colleges = nextSheets.get("colleges") || [];
    const collegeImages = [...(nextSheets.get("collegeimages") || [])];
    const hasSingleCollege = colleges.length === 1;
    const existingImageKeys = new Set(
      collegeImages.map((row) => {
        const code = String(row[collegeCodeKey] || "").trim().toLowerCase();
        const imageName = normalizeZipPath(String(row[imageNameKey] || ""));
        return `${code}|${imageName}`;
      }),
    );

    for (const collegeRow of colleges) {
      const collegeCode = String(collegeRow[collegeCodeKey] || "").trim();
      if (!collegeCode) continue;
    }

    nextSheets.set("colleges", colleges);
    if (collegeImages.length > 0) {
      nextSheets.set("collegeimages", collegeImages);
    }

    return nextSheets;
  };

  const parseCsvRows = (text: string) => {
    const rows: string[][] = [];
    let cell = "";
    let row: string[] = [];
    let inQuotes = false;

    for (let index = 0; index < text.length; index += 1) {
      const char = text[index];
      const next = text[index + 1];
      if (char === '"' && inQuotes && next === '"') {
        cell += '"';
        index += 1;
      } else if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        row.push(cell.trim());
        cell = "";
      } else if ((char === "\n" || char === "\r") && !inQuotes) {
        if (char === "\r" && next === "\n") index += 1;
        row.push(cell.trim());
        if (row.some(Boolean)) rows.push(row);
        row = [];
        cell = "";
      } else {
        cell += char;
      }
    }

    row.push(cell.trim());
    if (row.some(Boolean)) rows.push(row);
    return rows;
  };

  const rowsToObjects = (rows: string[][]) => {
    const [headerRow = [], ...dataRows] = rows;
    const headers = headerRow.map((item) => {
      const normalized = normalizeUploadKey(item);
      return bulkColumnAliases[normalized] || normalized;
    });
    return dataRows
      .map((row) =>
        headers.reduce<Record<string, string>>((record, header, index) => {
          if (header) record[header] = String(row[index] || "").trim();
          return record;
        }, {}),
      )
      .filter((row) => Object.values(row).some(Boolean));
  };

  const readZipEntries = async (file: File) => {
    try {
      const buffer = new Uint8Array(await file.arrayBuffer());
      const entries = unzipSync(buffer);
      return new Map<string, Uint8Array>(
        Object.entries(entries).map(([fileName, content]) => [fileName.replace(/\\/g, "/"), content]),
      );
    } catch {
      throw new Error("Unable to extract ZIP file. Please upload a valid .zip archive.");
    }
  };

  const parseAttributes = (value: string) => {
    const attrs: Record<string, string> = {};
    value.replace(/([\w:]+)="([^"]*)"/g, (_match, key: string, attrValue: string) => {
      attrs[key] = decodeXml(attrValue);
      return "";
    });
    return attrs;
  };

  const columnIndexFromCellRef = (ref: string) => {
    const letters = (ref.match(/[A-Z]+/i)?.[0] || "").toUpperCase();
    return letters.split("").reduce((total, char) => total * 26 + char.charCodeAt(0) - 64, 0) - 1;
  };

  const parseXlsxFile = async (file: File) => {
    const entries = await readZipEntries(file);
    const getXml = (path: string) => {
      const entry = entries.get(path) || entries.get(path.replace(/^\//, ""));
      return entry ? strFromU8(entry) : "";
    };

    const sharedXml = getXml("xl/sharedStrings.xml");
    const sharedStrings = [...sharedXml.matchAll(/<si[^>]*>([\s\S]*?)<\/si>/g)].map((match) =>
      decodeXml([...match[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((item) => item[1]).join("")),
    );
    const workbookXml = getXml("xl/workbook.xml");
    const relsXml = getXml("xl/_rels/workbook.xml.rels");
    const rels = new Map<string, string>();
    relsXml.replace(/<Relationship\b([^>]*)\/>/g, (_match, attrsText: string) => {
      const attrs = parseAttributes(attrsText);
      if (attrs.Id && attrs.Target) rels.set(attrs.Id, attrs.Target);
      return "";
    });

    const sheets = new Map<string, Record<string, string>[]>();
    workbookXml.replace(/<sheet\b([^>]*)\/>/g, (_match, attrsText: string) => {
      const attrs = parseAttributes(attrsText);
      const relId = attrs["r:id"];
      const target = relId ? rels.get(relId) : "";
      if (!attrs.name || !target) return "";
      const sheetPath = target.startsWith("/") ? target.slice(1) : `xl/${target.replace(/^\.\.\//, "")}`;
      const sheetXml = getXml(sheetPath);
      const tableRows: string[][] = [];

      sheetXml.replace(/<row\b[^>]*>([\s\S]*?)<\/row>/g, (_rowMatch, rowXml: string) => {
        const rowValues: string[] = [];
        rowXml.replace(/<c\b([^>]*)>([\s\S]*?)<\/c>/g, (_cellMatch, cellAttrs: string, cellXml: string) => {
          const attrsForCell = parseAttributes(cellAttrs);
          const index = columnIndexFromCellRef(attrsForCell.r || "");
          const rawValue = cellXml.match(/<v[^>]*>([\s\S]*?)<\/v>/)?.[1] || "";
          const inlineValue = cellXml.match(/<t[^>]*>([\s\S]*?)<\/t>/)?.[1] || "";
          rowValues[index >= 0 ? index : rowValues.length] =
            attrsForCell.t === "s" ? sharedStrings[Number(rawValue)] || "" : decodeXml(inlineValue || rawValue);
          return "";
        });
        if (rowValues.some(Boolean)) tableRows.push(rowValues);
        return "";
      });

      sheets.set(normalizeUploadKey(attrs.name), rowsToObjects(tableRows));
      return "";
    });

    return sheets;
  };

  const readWorkbookSheets = async (file: File) => {
    const extension = getFileExtension(file.name);
    if (extension === ".csv") {
      return new Map([["colleges", rowsToObjects(parseCsvRows(await file.text()))]]);
    }
    if (extension === ".xlsx") return parseXlsxFile(file);
    throw new Error("Please upload .xlsx or .csv files for bulk validation.");
  };

  const readZipAssetIndex = async (file: File) => {
    const entries = await readZipEntries(file);
    return buildZipAssetIndex(entries.keys());
  };

  const getImageMimeType = (fileName: string) => {
    const extension = getFileExtension(fileName);
    if (extension === ".png") return "image/png";
    if (extension === ".webp") return "image/webp";
    if (extension === ".gif") return "image/gif";
    if (extension === ".svg") return "image/svg+xml";
    return "image/jpeg";
  };

  const readZipImagePreviewUrls = async (file: File) => {
    const entries = await readZipEntries(file);
    const imageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"]);
    return Object.fromEntries(
      [...entries.entries()]
        .filter(([name]) => imageExtensions.has(getFileExtension(name)))
        .map(([name, bytes]) => {
          const normalizedName = normalizeZipPath(name);
          const blobPart = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
          return [normalizedName, URL.createObjectURL(new Blob([blobPart], { type: getImageMimeType(name) }))];
        }),
    );
  };

  const getSheetRows = (sheets: Map<string, Record<string, string>[]>, sheet: BulkSheetKey) => sheets.get(sheet) || [];

  const cellValue = (row: Record<string, string>, column: string) => String(row[normalizeUploadKey(column)] || "").trim();

  const isRemoteAssetReference = (value: string) => /^https?:\/\//i.test(String(value || "").trim());
  const getZipOnlyAssetError = (column: string) => `${displayColumnName(column)} must be a ZIP file name, not a URL`;
  const parseLooseNumber = (value: string) => {
    const raw = String(value || "").trim();
    if (!raw) return undefined;
    const cleaned = raw.replace(/,/g, "");
    const directParsed = Number(cleaned);
    if (Number.isFinite(directParsed)) return directParsed;
    const match = cleaned.match(/-?\d+(\.\d+)?/);
    if (!match) return undefined;
    const parsed = Number(match[0]);
    return Number.isFinite(parsed) ? parsed : undefined;
  };
  const normalizeIntegerishValue = (value: string) => {
    const raw = String(value || "").trim().replace(/,/g, "");
    if (!raw) return "";
    if (/^\d+\.0+$/.test(raw)) return raw.replace(/\.0+$/, "");
    return raw;
  };
  const isFlexibleBooleanValue = (value: string) => {
    const normalized = String(value || "").trim().toLowerCase();
    return !normalized || ["true", "false", "yes", "no", "1", "0", "available", "not_available", "not available"].includes(normalized);
  };
  const isValidEmailValue = (value: string) => {
    const raw = String(value || "").trim();
    return !raw || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw);
  };
  const isValidPhoneValue = (value: string) => {
    const raw = String(value || "").trim();
    if (!raw) return true;
    const digits = normalizeScientificInteger(raw).replace(/\D/g, "");
    if (/^\d{10}$/.test(digits)) return true;
    if (digits.length === 11 && digits.startsWith("0")) return true;
    const normalized = digits.length > 10 && digits.startsWith("91") ? digits.slice(2) : digits;
    return /^\d{10}$/.test(normalized);
  };
  const isValidPincodeValue = (value: string) => {
    const raw = normalizeScientificInteger(normalizeIntegerishValue(value)).replace(/\s/g, "");
    return !raw || /^\d{6}$/.test(raw);
  };
  const isValidUrlValue = (value: string) => {
    const raw = String(value || "").trim();
    if (!raw || isRemoteAssetReference(raw)) return true;
    try {
      const parsed = new URL(raw);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  };
  const isValidYearValue = (value: string) => {
    const raw = String(value || "").trim();
    if (!raw) return true;
    const year = parseLooseNumber(raw);
    return year !== undefined && year >= 1800 && year <= new Date().getFullYear() + 1;
  };
  const isStrictIntegerValue = (value: string) => {
    const raw = normalizeScientificInteger(normalizeIntegerishValue(value));
    return !raw || /^\d+$/.test(raw);
  };
  const isValidDurationValue = (value: string) => {
    const raw = String(value || "").trim();
    if (!raw) return false;
    return /^\d+(?:\.\d+)?\s*(year|years|month|months|semester|semesters)$/i.test(raw);
  };
  const isValidAccreditationValue = (value: string) => {
    const raw = String(value || "").trim();
    if (!raw) return true;
    return collegeAccreditationOptionSet.has(normalizeAccreditationOptionValue(raw));
  };
  const getBulkRankingValidationMessage = (value: string) => {
    const normalized = String(value || "").trim();
    if (!normalized) return "";
    const [startText = "", endText = ""] = normalized.split("-").map((item) => normalizeRankingInteger(item));
    if (!startText || !endText) return "Both rankingMin and rankingMax are required when entering ranking";
    if (Number(startText) > Number(endText)) return "rankingMin must be less than or equal to rankingMax";
    return "";
  };
  const isValidBulkRankingValue = (value: string) => {
    const normalized = String(value || "").trim();
    if (!normalized) return true;
    const [startText = "", endText = ""] = normalized.split("-").map((item) => normalizeRankingInteger(item));
    return Boolean(startText && endText && Number.isFinite(Number(startText)) && Number.isFinite(Number(endText)));
  };
  const isNumberWithinRange = (value: string, minimum: number, maximum: number) => {
    const parsed = parseLooseNumber(value);
    return parsed === undefined || (parsed >= minimum && parsed <= maximum);
  };
  const isCheckedPreviewBoolean = (value: string) => {
    const normalized = String(value || "").trim().toLowerCase();
    return ["true", "yes", "1", "available"].includes(normalized);
  };
  const hasAnyBulkCutoffValue = (rowData: Record<string, string>, columns = bulkCutoffColumns) =>
    columns.some((column) => String(rowData[column] || "").trim());
  const getBulkPreviewColumns = (sheet: BulkSheetKey) =>
    sheet === "colleges"
      ? bulkSheetColumns.colleges.flatMap((column) => (column === "ranking" ? ["rankingMin", "rankingMax"] : [column]))
      : bulkSheetColumns[sheet];
  const getPreviewRankingRangeValues = (rankingValue: string) => {
    const normalized = String(rankingValue || "").trim();
    if (!normalized) return { rankingMin: "", rankingMax: "" };
    const [rankingMin = "", rankingMax = ""] = normalized.split("-").map((item) => normalizeRankingInteger(item));
    return { rankingMin, rankingMax };
  };
  const createFieldIssue = (level: BulkFieldIssueLevel, message: string): BulkFieldIssue => ({
    level,
    messages: [message],
  });
  const addFieldIssue = (
    issues: Record<string, BulkFieldIssue>,
    column: string,
    level: BulkFieldIssueLevel,
    message: string,
  ) => {
    const current = issues[column];
    if (!current) {
      issues[column] = createFieldIssue(level, message);
      return;
    }
    const levelPriority: Record<BulkFieldIssueLevel, number> = {
      missing: 5,
      invalid: 4,
      duplicate: 3,
      exists: 2,
      review: 1,
    };
    issues[column] = {
      level: levelPriority[level] > levelPriority[current.level] ? level : current.level,
      messages: current.messages.includes(message) ? current.messages : [...current.messages, message],
    };
  };
  const collectFieldIssues = (issues: Record<string, BulkFieldIssue>) =>
    Object.values(issues).flatMap((issue) => issue.messages);
  const validateBulkCutoffRanges = (
    rowData: Record<string, string>,
    { allowSingle = true }: { allowSingle?: boolean } = {},
  ) =>
    bulkCutoffCategories.flatMap((category) => {
      const key = bulkCutoffCategoryKeyMap[category];
      const singleColumn = `cutoff_${key}`;
      const minColumn = `cutoff_${key}_min`;
      const maxColumn = `cutoff_${key}_max`;
      const single = String(rowData[singleColumn] || "").trim();
      const min = String(rowData[minColumn] || "").trim();
      const max = String(rowData[maxColumn] || "").trim();
      const errors: string[] = [];

      if ((min && !max) || (!min && max)) {
        errors.push(`Both ${displayColumnName(minColumn)} and ${displayColumnName(maxColumn)} are required when using a range for ${category}`);
        return errors;
      }

      if (allowSingle && single && (min || max)) {
        errors.push(`Use either ${displayColumnName(singleColumn)} or ${displayColumnName(minColumn)} / ${displayColumnName(maxColumn)} for ${category}`);
      }

      const minValue = parseLooseNumber(min);
      const maxValue = parseLooseNumber(max);
      if (minValue !== undefined && maxValue !== undefined && minValue > maxValue) {
        errors.push(`${displayColumnName(minColumn)} must be less than or equal to ${displayColumnName(maxColumn)}`);
      }

      return errors;
    });

  const buildBulkValidationSummary = (rows: BulkPreviewRow[]) => ({
    totalRecords: rows.length,
    validRecords: rows.filter((row) => row.status === "Valid").length,
    failedRecords: 0,
    invalidRecords: rows.filter((row) => row.status === "Invalid").length,
    duplicates: rows.filter((row) => row.errors.some((error) => error === "Duplicate collegeCode" || error.includes("already exists in the system"))).length,
    pendingReview: rows.filter((row) => row.status === "Review").length,
  });

  const validateBulkPreviewRows = (
    rows: Array<Pick<BulkPreviewRow, "id" | "sheet" | "rowNumber" | "data">>,
    zipAssetIndex: ZipAssetIndex | null,
    hasImageZip: boolean,
  ): BulkPreviewRow[] => {
    const colleges = rows.filter((row) => row.sheet === "colleges");
    const courses = rows.filter((row) => row.sheet === "courses");
    const collegeImages = rows.filter((row) => row.sheet === "collegeimages");
    const collegeCodeCounts = colleges.reduce<Record<string, number>>((counts, row) => {
      const code = String(row.data.collegeCode || "").trim().toLowerCase();
      if (code) counts[code] = (counts[code] || 0) + 1;
      return counts;
    }, {});
    const collegeCodes = new Set(Object.keys(collegeCodeCounts));
    const courseNames = new Set(courses.map((row) => String(row.data.courseName || "").trim().toLowerCase()).filter(Boolean));
    const courseNameTokens = new Set(
      courses.flatMap((row) =>
        String(row.data.courseName || "")
          .split(/[,\/|]/)
          .map((item) => item.trim().toLowerCase())
          .filter(Boolean),
      ),
    );
    const courseNameList = (value: string) =>
      String(value || "")
        .split(/[,\/|]/)
        .map((item) => item.trim())
        .filter(Boolean);
    const isValidEntranceExamCourseName = (value: string) => {
      const names = courseNameList(value);
      if (names.length === 0) return true;
      return names.every((name) => {
        const normalizedName = name.toLowerCase();
        if (courseNames.has(normalizedName) || courseNameTokens.has(normalizedName)) return true;
        return [...courseNames, ...courseNameTokens].some((courseName) => {
          const courseTokens = courseName.split(/[,\/|]/).map((item) => item.trim().toLowerCase()).filter(Boolean);
          return courseTokens.includes(normalizedName) || normalizedName.includes(courseName);
        });
      });
    };
    const imageCountByCollege = collegeImages.reduce<Record<string, number>>((counts, row) => {
      const code = String(row.data.collegeCode || "").trim().toLowerCase();
      if (code) counts[code] = (counts[code] || 0) + 1;
      return counts;
    }, {});
    const supportedImageTypes = new Set(["campus", "hostel", "classroom", "laboratory", "library", "sports", "placement", "hospital"]);

    return rows.map((row) => {
      const rowData = row.data || {};
      const cell = (column: string) => String(rowData[column] || "").trim();
      const isFilledCell = (column: string) => Boolean(cell(column));
      const isNumericPreviewCell = (column: string) => {
        const value = cell(column);
        return !value || parseLooseNumber(value) !== undefined;
      };
      const isTrueFalsePreviewCell = (column: string) => {
        return isFlexibleBooleanValue(cell(column));
      };

      let errors: string[] = [];
      let reviewErrors: string[] = [];
      const fieldIssues: Record<string, BulkFieldIssue> = {};

      if (row.sheet === "colleges") {
        const required = ["collegeCode", "collegeName", "university", "state", "city", "officialEmail", "phoneNumber"];
        const numeric = ["establishedYear", "minFee", "maxFee", "placementPercentage", "averagePackage", "highestPackage", "hostelMinFee", "hostelMaxFee"];
        const imageMediaNames = ["logoImage", "coverImage"].map((column) => cell(column)).filter(Boolean);
        const localImageMediaNames = imageMediaNames.filter((name) => !isRemoteAssetReference(name));
        const localImageMediaColumns = ["logoImage", "coverImage"].filter((column) => {
          const columnValue = cell(column);
          return columnValue && !isRemoteAssetReference(columnValue);
        });
        const brochureValue = cell("brochurePdf");

        required.forEach((column) => {
          if (!isFilledCell(column)) addFieldIssue(fieldIssues, column, "missing", `${column} is required`);
        });
        numeric.forEach((column) => {
          if (!isNumericPreviewCell(column)) addFieldIssue(fieldIssues, column, "invalid", `${column} must be numeric`);
        });
        if (!isValidYearValue(cell("establishedYear"))) addFieldIssue(fieldIssues, "establishedYear", "invalid", "establishedYear must be a valid year");
        if (!isValidEmailValue(cell("officialEmail"))) addFieldIssue(fieldIssues, "officialEmail", "invalid", "officialEmail must be a valid email address");
        if (!isValidPhoneValue(cell("phoneNumber"))) addFieldIssue(fieldIssues, "phoneNumber", "invalid", "phoneNumber must be a valid 10 digit phone number");
        if (!isValidPhoneValue(cell("alternatePhone"))) addFieldIssue(fieldIssues, "alternatePhone", "invalid", "alternatePhone must be a valid 10 digit phone number");
        if (!isValidPincodeValue(cell("pincode"))) addFieldIssue(fieldIssues, "pincode", "invalid", "pincode must be a valid 6 digit code");
        if (!isValidUrlValue(cell("websiteUrl"))) addFieldIssue(fieldIssues, "websiteUrl", "invalid", "websiteUrl must be a valid URL");
        if (!isValidUrlValue(cell("googleMapUrl"))) addFieldIssue(fieldIssues, "googleMapUrl", "invalid", "googleMapUrl must be a valid URL");
        if (!isValidUrlValue(cell("campusVideo"))) addFieldIssue(fieldIssues, "campusVideo", "invalid", "campusVideo must be a valid URL");
        if (!isValidBulkRankingValue(cell("ranking"))) addFieldIssue(fieldIssues, "ranking", "invalid", getBulkRankingValidationMessage(cell("ranking")));
        if (!isValidAccreditationValue(cell("accreditation"))) {
          addFieldIssue(fieldIssues, "accreditation", "invalid", "accreditation must match a valid accreditation option or be left empty");
        }
        if (!isNumberWithinRange(cell("placementPercentage"), 0, 100)) addFieldIssue(fieldIssues, "placementPercentage", "invalid", "placementPercentage must be between 0 and 100");
        if (parseLooseNumber(cell("minFee")) !== undefined && parseLooseNumber(cell("maxFee")) !== undefined && (parseLooseNumber(cell("minFee")) || 0) > (parseLooseNumber(cell("maxFee")) || 0)) {
          addFieldIssue(fieldIssues, "minFee", "invalid", "minFee must be less than or equal to maxFee");
          addFieldIssue(fieldIssues, "maxFee", "invalid", "minFee must be less than or equal to maxFee");
        }
        if (parseLooseNumber(cell("hostelMinFee")) !== undefined && parseLooseNumber(cell("hostelMaxFee")) !== undefined && (parseLooseNumber(cell("hostelMinFee")) || 0) > (parseLooseNumber(cell("hostelMaxFee")) || 0)) {
          addFieldIssue(fieldIssues, "hostelMinFee", "invalid", "hostelMinFee must be less than or equal to hostelMaxFee");
          addFieldIssue(fieldIssues, "hostelMaxFee", "invalid", "hostelMinFee must be less than or equal to hostelMaxFee");
        }
        if (parseLooseNumber(cell("averagePackage")) !== undefined && parseLooseNumber(cell("highestPackage")) !== undefined && (parseLooseNumber(cell("averagePackage")) || 0) > (parseLooseNumber(cell("highestPackage")) || 0)) {
          addFieldIssue(fieldIssues, "averagePackage", "invalid", "averagePackage must be less than or equal to highestPackage");
          addFieldIssue(fieldIssues, "highestPackage", "invalid", "averagePackage must be less than or equal to highestPackage");
        }
        if (!isTrueFalsePreviewCell("cctvAvailability")) addFieldIssue(fieldIssues, "cctvAvailability", "invalid", "cctvAvailability must be TRUE or FALSE");
        if (!isTrueFalsePreviewCell("isBestCollege")) addFieldIssue(fieldIssues, "isBestCollege", "invalid", "isBestCollege must be TRUE or FALSE");
        if (collegeCodeCounts[cell("collegeCode").toLowerCase()] > 1) addFieldIssue(fieldIssues, "collegeCode", "duplicate", "Duplicate collegeCode");
        if (cell("collegeCode") && existingCollegeCodeSet.has(cell("collegeCode").toLowerCase())) {
          addFieldIssue(fieldIssues, "collegeCode", "exists", "collegeCode already exists in the system");
        }
        if (cell("collegeName") && existingCollegeNameSet.has(cell("collegeName").toLowerCase())) {
          addFieldIssue(fieldIssues, "collegeName", "exists", "collegeName already exists in the system");
        }
        ["logoImage", "coverImage"]
          .filter((column) => isRemoteAssetReference(cell(column)))
          .forEach((column) => addFieldIssue(fieldIssues, column, "invalid", getZipOnlyAssetError(column)));
        if (hasImageZip) {
          localImageMediaNames.forEach((name, index) => {
            if (!resolveZipAssetRecord(zipAssetIndex, name, cell("collegeCode"))) {
              const column = localImageMediaColumns[index] || "logoImage";
              addFieldIssue(fieldIssues, column, "invalid", `${name} not found in ZIP`);
            }
          });
        } else if (localImageMediaNames.length) {
          if (localImageMediaNames.length) {
            addFieldIssue(fieldIssues, "logoImage", "review", "Upload combined media ZIP to validate logo and cover files");
            addFieldIssue(fieldIssues, "coverImage", "review", "Upload combined media ZIP to validate logo and cover files");
          }
        }
      }

      if (row.sheet === "courses") {
        const numeric = ["allottedSeats", "applicationFee", "semesterFees", "totalFees", ...bulkCutoffColumns];
        ["collegeCode", "courseName", "degreeType", "stream", "specialization", "duration", "mode"].forEach((column) => {
          if (!isFilledCell(column)) addFieldIssue(fieldIssues, column, "missing", `${column} is required`);
        });
        if (isFilledCell("collegeCode") && !collegeCodes.has(cell("collegeCode").toLowerCase())) {
          addFieldIssue(fieldIssues, "collegeCode", "invalid", "collegeCode does not exist in Colleges sheet");
        }
        if (cell("collegeCode") && existingCollegeCodeSet.has(cell("collegeCode").toLowerCase())) {
          addFieldIssue(fieldIssues, "collegeCode", "exists", "collegeCode already exists in the system");
        }
        numeric.forEach((column) => {
          if (!isNumericPreviewCell(column)) addFieldIssue(fieldIssues, column, "invalid", `${column} must be numeric`);
        });
        if (isFilledCell("duration") && !isValidDurationValue(cell("duration"))) addFieldIssue(fieldIssues, "duration", "invalid", "duration must be like 4 Years, 5.5 Years, or 6 Months");
        if (!isStrictIntegerValue(cell("allottedSeats"))) addFieldIssue(fieldIssues, "allottedSeats", "invalid", "allottedSeats must contain digits only");
        validateBulkCutoffRanges(rowData).forEach((message) => {
          const matchedColumns = bulkCutoffColumns.filter((column) => message.includes(displayColumnName(column)) || message.includes(column));
          if (matchedColumns.length) {
            matchedColumns.forEach((column) => addFieldIssue(fieldIssues, column, "invalid", message));
          } else {
            addFieldIssue(fieldIssues, "cutoff_oc", "invalid", message);
          }
        });
        if (!isTrueFalsePreviewCell("lateralEntry")) addFieldIssue(fieldIssues, "lateralEntry", "invalid", "lateralEntry must be TRUE or FALSE");
        if (!isTrueFalsePreviewCell("bestCourse")) addFieldIssue(fieldIssues, "bestCourse", "invalid", "bestCourse must be TRUE or FALSE");
        if (parseLooseNumber(cell("semesterFees")) !== undefined && parseLooseNumber(cell("totalFees")) !== undefined && (parseLooseNumber(cell("semesterFees")) || 0) > (parseLooseNumber(cell("totalFees")) || 0)) {
          addFieldIssue(fieldIssues, "semesterFees", "invalid", "semesterFees must be less than or equal to totalFees");
          addFieldIssue(fieldIssues, "totalFees", "invalid", "semesterFees must be less than or equal to totalFees");
        }
      }

      if (row.sheet === "entranceexams") {
        const numeric = ["examWeightage", ...bulkRangeCutoffColumns];
        ["collegeCode", "courseName", "examName"].forEach((column) => {
          if (!isFilledCell(column)) addFieldIssue(fieldIssues, column, "missing", `${column} is required`);
        });
        if (isFilledCell("collegeCode") && !collegeCodes.has(cell("collegeCode").toLowerCase())) {
          addFieldIssue(fieldIssues, "collegeCode", "invalid", "collegeCode does not exist in Colleges sheet");
        }
        numeric.forEach((column) => {
          if (!isNumericPreviewCell(column)) addFieldIssue(fieldIssues, column, "invalid", `${column} must be numeric`);
        });
        validateBulkCutoffRanges(rowData, { allowSingle: false }).forEach((message) => {
          const matchedColumns = bulkRangeCutoffColumns.filter((column) => message.includes(displayColumnName(column)) || message.includes(column));
          if (matchedColumns.length) {
            matchedColumns.forEach((column) => addFieldIssue(fieldIssues, column, "invalid", message));
          } else {
            addFieldIssue(fieldIssues, "cutoff_oc_min", "invalid", message);
          }
        });
        if (!isNumberWithinRange(cell("examWeightage"), 0, 100)) addFieldIssue(fieldIssues, "examWeightage", "invalid", "examWeightage must be between 0 and 100");
      }

      if (row.sheet === "collegeimages") {
        const imageName = cell("imageName");
        const imageType = cell("imageType").toLowerCase();
        const needsZipValidation = imageName && !isRemoteAssetReference(imageName);
        ["collegeCode", "imageType", "imageName"].forEach((column) => {
          if (!isFilledCell(column)) addFieldIssue(fieldIssues, column, "missing", `${column} is required`);
        });
        if (isFilledCell("collegeCode") && !collegeCodes.has(cell("collegeCode").toLowerCase())) {
          addFieldIssue(fieldIssues, "collegeCode", "invalid", "collegeCode does not exist in Colleges sheet");
        }
        if (imageType && !supportedImageTypes.has(imageType)) addFieldIssue(fieldIssues, "imageType", "invalid", "imageType is not supported");
        if (imageCountByCollege[cell("collegeCode").toLowerCase()] > 7) addFieldIssue(fieldIssues, "imageName", "invalid", "Maximum 7 college images allowed");
        if (isRemoteAssetReference(imageName)) addFieldIssue(fieldIssues, "imageName", "invalid", getZipOnlyAssetError("imageName"));
        if (hasImageZip && needsZipValidation && !resolveZipAssetRecord(zipAssetIndex, imageName, cell("collegeCode"))) {
          addFieldIssue(fieldIssues, "imageName", "invalid", `${imageName} not found in ZIP`);
        }
        if (!hasImageZip && needsZipValidation) addFieldIssue(fieldIssues, "imageName", "review", "Upload combined media ZIP to validate this image");
      }

      errors = collectFieldIssues(fieldIssues);
      reviewErrors = Object.values(fieldIssues)
        .filter((issue) => issue.level === "review")
        .flatMap((issue) => issue.messages);

      return {
        ...row,
        status:
          errors.some((message) => !reviewErrors.includes(message))
            ? "Invalid"
            : reviewErrors.length && !Object.keys(fieldIssues).every((column) => ["logoImage", "coverImage"].includes(column))
              ? "Review"
              : "Valid",
        errors,
        fieldIssues,
      };
    });
  };

  const createBulkPreviewRows = (
    sheets: Map<string, Record<string, string>[]>,
    zipAssetIndex: ZipAssetIndex | null,
    hasImageZip: boolean,
    isSingleCollegeUpload: boolean,
  ) => {
    const colleges = isSingleCollegeUpload ? getSheetRows(sheets, "colleges").slice(0, 1) : getSheetRows(sheets, "colleges");
    const courses = isSingleCollegeUpload ? getSheetRows(sheets, "courses").filter((row) => !colleges[0] || cellValue(row, "collegeCode") === cellValue(colleges[0], "collegeCode")) : getSheetRows(sheets, "courses");
    const entranceExams = getSheetRows(sheets, "entranceexams");
    const collegeImages = getSheetRows(sheets, "collegeimages");
    let nextId = 1;
    const makeRow = (sheet: BulkSheetKey, row: Record<string, string>, index: number): Pick<BulkPreviewRow, "id" | "sheet" | "rowNumber" | "data"> => {
      const data = Object.fromEntries(bulkSheetColumns[sheet].map((column) => [column, cellValue(row, column)]));
      if (sheet === "colleges") {
        const rankingValue = cellValue(row, "ranking");
        const rankingMinValue = cellValue(row, "rankingMin");
        const rankingMaxValue = cellValue(row, "rankingMax");
        data.ranking = rankingValue || (rankingMinValue || rankingMaxValue ? `${normalizeRankingInteger(rankingMinValue)}-${normalizeRankingInteger(rankingMaxValue)}` : "");
      }

      return {
        id: nextId++,
        sheet,
        rowNumber: index + 2,
        data,
      };
    };

    return validateBulkPreviewRows(
      [
        ...colleges.map((row, index) => makeRow("colleges", row, index)),
        ...courses.map((row, index) => makeRow("courses", row, index)),
        ...entranceExams.map((row, index) => makeRow("entranceexams", row, index)),
        ...collegeImages.map((row, index) => makeRow("collegeimages", row, index)),
      ],
      zipAssetIndex,
      hasImageZip,
    );
  };

  const summaryRows = [
    { label: "Total Records", value: `${validationSummary.totalRecords}`, color: "text-[#143071]", dot: "bg-[#16a34a]", icon: BadgeCheck },
    { label: "Valid Records", value: `${validationSummary.validRecords}`, color: "text-[#16a34a]", dot: "bg-[#16a34a]", icon: BadgeCheck },
    { label: "Failed Records", value: `${validationSummary.failedRecords}`, color: "text-[#ef233c]", dot: "bg-[#ef233c]", icon: X },
    { label: "Invalid Records", value: `${validationSummary.invalidRecords}`, color: "text-[#ef233c]", dot: "bg-[#ff9f1c]", icon: TriangleAlert },
    { label: "Duplicates", value: `${validationSummary.duplicates}`, color: "text-[#e8790a]", dot: "bg-[#ff9f1c]", icon: TriangleAlert },
    { label: "Pending Review", value: `${validationSummary.pendingReview}`, color: "text-[#e8790a]", dot: "bg-[#ff9f1c]", icon: TriangleAlert },
  ];

  const getUploadFileError = (file: File, item: (typeof uploadCards)[number]) => {
    const extension = getFileExtension(file.name);
    if (!item.allowedExtensions.includes(extension)) {
      return item.accept === ".zip" ? "Only .zip image archive files are allowed." : "Only .xlsx or .csv files are allowed.";
    }
    if (item.maxSize && file.size > item.maxSize) {
      return "ZIP file size must be 50MB or less.";
    }
    return "";
  };

  const resetUploadSelection = useCallback((step: "1" | "2" | "3") => {
    setSelectedUploadFiles((previous) => {
      if (step === "3") {
        return { ...previous, "3": null };
      }

      const otherExcelStep = step === "1" ? "2" : "1";
      return { ...previous, [step]: null, [otherExcelStep]: null, "3": null };
    });

    setUploadErrors((previous) => {
      if (step === "3") {
        return { ...previous, "3": "" };
      }

      const otherExcelStep = step === "1" ? "2" : "1";
      return { ...previous, [step]: "", [otherExcelStep]: "", "3": "" };
    });

    if (step !== "3") {
      setActiveUploadStep(step);
      setShowZipUploadStep(false);
    }
    setShowValidationSummaryStep(false);
    setShowFullDetails(false);
    setShowFinishPopup(false);
  }, []);

  const selectUploadFile = (item: (typeof uploadCards)[number], file: File | null) => {
    if (!file) {
      resetUploadSelection(item.step as "1" | "2" | "3");
      return;
    }

    const error = getUploadFileError(file, item);
    if (error) {
      if (item.step === "3") {
        setSelectedUploadFiles((previous) => ({ ...previous, "3": null }));
        setUploadErrors((previous) => ({ ...previous, "3": error }));
        return;
      }

      const otherExcelStep = item.step === "1" ? "2" : "1";
      setActiveUploadStep(item.step as "1" | "2");
      setShowZipUploadStep(false);
      setShowFullDetails(false);
      setSelectedUploadFiles((previous) => ({ ...previous, [item.step]: null, [otherExcelStep]: null, "3": null }));
      setUploadErrors((previous) => ({ ...previous, [item.step]: error, [otherExcelStep]: "", "3": "" }));
      return;
    }

    if (item.step === "3") {
      setSelectedUploadFiles((previous) => ({ ...previous, "3": file }));
      setUploadErrors((previous) => ({ ...previous, "3": "" }));
      setShowValidationSummaryStep(false);
      setShowFinishPopup(false);
      return;
    }

    const otherExcelStep = item.step === "1" ? "2" : "1";
    setActiveUploadStep(item.step as "1" | "2");
    setShowZipUploadStep(false);
    setShowValidationSummaryStep(false);
    setShowFullDetails(false);
    setShowFinishPopup(false);
    setSelectedUploadFiles((previous) => ({ ...previous, [item.step]: file, [otherExcelStep]: null, "3": null }));
    setUploadErrors((previous) => ({ ...previous, [item.step]: "", [otherExcelStep]: "", "3": "" }));
  };

  const activeExcelFile = activeUploadStep ? selectedUploadFiles[activeUploadStep] : null;
  const selectedZipFile = selectedUploadFiles["3"];
  const workflowSteps = [
    "College Data",
    "College Images ZIP",
    "Validation Summary",
    "Review Uploaded Data",
    "Finish",
  ];
  const visibleWorkflowStep = showFullDetails
    ? 3
    : showFinishPopup
      ? 4
      : showValidationSummaryStep
        ? 2
        : showZipUploadStep
          ? 1
          : 0;
  const currentWorkflowStep = visibleWorkflowStep;
  const summaryCardStyles = [
    "border-blue-100 bg-blue-50 text-blue-700",
    "border-green-100 bg-green-50 text-green-700",
    "border-red-100 bg-red-50 text-red-700",
    "border-orange-100 bg-orange-50 text-orange-700",
    "border-purple-100 bg-purple-50 text-purple-700",
    "border-amber-100 bg-amber-50 text-amber-700",
  ];

  const downloadSampleTemplates = () => {
    const escapeXml = (value: string) =>
      String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
    const getExcelColumnName = (index: number) => {
      let value = index + 1;
      let result = "";
      while (value > 0) {
        const remainder = (value - 1) % 26;
        result = String.fromCharCode(65 + remainder) + result;
        value = Math.floor((value - 1) / 26);
      }
      return result;
    };
    const createInlineStringCell = (cellRef: string, value: string) =>
      `<c r="${cellRef}" t="inlineStr"><is><t xml:space="preserve">${escapeXml(value)}</t></is></c>`;
    const createWorksheetXml = (headers: string[], row: Record<string, string | undefined>) => {
      const headerCells = headers
        .map((header, index) => createInlineStringCell(`${getExcelColumnName(index)}1`, header))
        .join("");
      const valueCells = headers
        .map((header, index) => createInlineStringCell(`${getExcelColumnName(index)}2`, String(row[header] || "")))
        .join("");

      return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>
    <row r="1">${headerCells}</row>
    <row r="2">${valueCells}</row>
  </sheetData>
</worksheet>`;
    };

    const workbookSheets = [
      {
        name: "Colleges",
        headers: [
          "collegeCode", "collegeName", "description", "establishedYear", "ownershipType", "university", "country", "state", "city", "district", "address", "pincode", "googleMapUrl", "officialEmail", "phoneNumber", "alternatePhone", "websiteUrl", "logoImage", "coverImage", "brochurePdf", "campusVideo", "ranking_min", "ranking_max", "accreditation", "awards", "reviews", "facilities", "quotas", "minFee", "maxFee", "admissionProcess", "applicationMode", "scholarships", "placementPercentage", "averagePackage", "highestPackage", "hostelGeneralInfo", "hostelType", "hostelMinFee", "hostelMaxFee", "cctvAvailability", "hostelFacilities", "isBestCollege",
        ],
        row: {
          collegeCode: "CLG001",
          collegeName: "ABC Engineering College",
          description: "NAAC accredited engineering college in Chennai",
          establishedYear: "2001",
          ownershipType: "Private",
          university: "Anna University",
          country: "India",
          state: "Tamil Nadu",
          city: "Chennai",
          district: "Chennai",
          address: "123 Sample Road, Guindy",
          pincode: "600001",
          googleMapUrl: "https://maps.google.com/?q=ABC+Engineering+College+Chennai",
          officialEmail: "info@abccollege.edu",
          phoneNumber: "9876543210",
          alternatePhone: "9444455555",
          websiteUrl: "https://abccollege.edu",
          logoImage: "clg001-logo.png",
          coverImage: "clg001-cover.jpg",
          brochurePdf: "clg001-brochure.pdf",
          campusVideo: "https://www.youtube.com/watch?v=college-demo",
          ranking_min: "10",
          ranking_max: "25",
          accreditation: "NAAC A+",
          awards: "Best Emerging Engineering College 2025",
          reviews: "Strong placements and modern campus facilities",
          facilities: "Sports,WiFi,Labs",
          quotas: "Management Quota,Government Quota,Reservation Quota",
          minFee: "50000",
          maxFee: "85000",
          admissionProcess: "Online Application",
          applicationMode: "Online",
          scholarships: "Merit Scholarship",
          placementPercentage: "92",
          averagePackage: "450000",
          highestPackage: "1800000",
          hostelGeneralInfo: "Separate hostel blocks",
          hostelType: "Boys & Girls",
          hostelMinFee: "60000",
          hostelMaxFee: "120000",
          cctvAvailability: "TRUE",
          hostelFacilities: "WiFi,Gym,CCTV",
          isBestCollege: "TRUE",
        },
      },
      {
        name: "Courses",
        headers: [
          "collegeCode", "degreeType", "stream", "specialization", "courseName", "duration", "mode", "lateralEntry", "bestCourse", "minimumQualification", "university", "allottedSeats", "applicationFee", "courseDescription", "semesterFees", "totalFees", "cutoff_oc_min", "cutoff_oc_max", "cutoff_bc_min", "cutoff_bc_max", "cutoff_bcm_min", "cutoff_bcm_max", "cutoff_mbc_min", "cutoff_mbc_max", "cutoff_sc_min", "cutoff_sc_max", "cutoff_sca_min", "cutoff_sca_max", "cutoff_st_min", "cutoff_st_max",
        ],
        row: {
          collegeCode: "CLG001",
          degreeType: "UG",
          stream: "Engineering",
          specialization: "Computer Science Engineering",
          courseName: "Computer Science Engineering",
          duration: "4 Years",
          mode: "Full-time",
          lateralEntry: "TRUE",
          bestCourse: "TRUE",
          minimumQualification: "12th Pass",
          university: "Anna University",
          allottedSeats: "120",
          applicationFee: "500",
          courseDescription: "Industry-aligned computer science program",
          semesterFees: "50000",
          totalFees: "400000",
          cutoff_oc_min: "180",
          cutoff_oc_max: "190",
          cutoff_bc_min: "175",
          cutoff_bc_max: "185",
          cutoff_bcm_min: "172",
          cutoff_bcm_max: "182",
          cutoff_mbc_min: "170",
          cutoff_mbc_max: "180",
          cutoff_sc_min: "160",
          cutoff_sc_max: "170",
          cutoff_sca_min: "155",
          cutoff_sca_max: "165",
          cutoff_st_min: "150",
          cutoff_st_max: "160",
        },
      },
      {
        name: "EntranceExams",
        headers: [
          "collegeCode", "courseName", "examName", "examWeightage", "cutoff_oc_min", "cutoff_oc_max", "cutoff_bc_min", "cutoff_bc_max", "cutoff_bcm_min", "cutoff_bcm_max", "cutoff_mbc_min", "cutoff_mbc_max", "cutoff_sc_min", "cutoff_sc_max", "cutoff_sca_min", "cutoff_sca_max", "cutoff_st_min", "cutoff_st_max", "specifiedSubjects", "preparationNotes",
        ],
        row: {
          collegeCode: "CLG001",
          courseName: "Computer Science Engineering",
          examName: "TNEA",
          examWeightage: "80",
          cutoff_oc_min: "180",
          cutoff_oc_max: "190",
          cutoff_bc_min: "175",
          cutoff_bc_max: "185",
          cutoff_bcm_min: "172",
          cutoff_bcm_max: "182",
          cutoff_mbc_min: "170",
          cutoff_mbc_max: "180",
          cutoff_sc_min: "160",
          cutoff_sc_max: "170",
          cutoff_sca_min: "155",
          cutoff_sca_max: "165",
          cutoff_st_min: "150",
          cutoff_st_max: "160",
          specifiedSubjects: "Physics, Chemistry, Mathematics",
          preparationNotes: "Practice previous year questions",
        },
      },
      {
        name: "CollegeImages",
        headers: ["collegeCode", "imageType", "imageName"],
        row: {
          collegeCode: "CLG001",
          imageType: "campus",
          imageName: "clg001-campus-01.jpg",
        },
      },
    ];

    const workbookXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    ${workbookSheets.map((sheet, index) => `<sheet name="${escapeXml(sheet.name)}" sheetId="${index + 1}" r:id="rId${index + 1}"/>`).join("")}
  </sheets>
</workbook>`;
    const workbookRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  ${workbookSheets.map((_, index) => `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${index + 1}.xml"/>`).join("")}
  <Relationship Id="rId${workbookSheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;
    const rootRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;
    const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
  ${workbookSheets.map((_, index) => `<Override PartName="/xl/worksheets/sheet${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join("")}
</Types>`;
    const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="1"><font><sz val="11"/><name val="Calibri"/></font></fonts>
  <fills count="1"><fill><patternFill patternType="none"/></fill></fills>
  <borders count="1"><border/></borders>
  <cellStyleXfs count="1"><xf/></cellStyleXfs>
  <cellXfs count="1"><xf xfId="0"/></cellXfs>
  <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`;

    const zipEntries = {
      "[Content_Types].xml": strToU8(contentTypesXml),
      "_rels/.rels": strToU8(rootRelsXml),
      "xl/workbook.xml": strToU8(workbookXml),
      "xl/_rels/workbook.xml.rels": strToU8(workbookRelsXml),
      "xl/styles.xml": strToU8(stylesXml),
      ...Object.fromEntries(
        workbookSheets.map((sheet, index) => [
          `xl/worksheets/sheet${index + 1}.xml`,
          strToU8(createWorksheetXml(sheet.headers, sheet.row)),
        ]),
      ),
    };

    const workbookBlob = new Blob([zipSync(zipEntries)], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(workbookBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "sample-bulk-upload.xlsx";
    link.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    let isCancelled = false;

    const validateBulkUpload = async () => {
      const bulkExcelFile = selectedUploadFiles["1"];
      const singleExcelFile = selectedUploadFiles["2"];
      const imageZipFile = selectedUploadFiles["3"];
      const excelFile = bulkExcelFile || singleExcelFile;

      if (!excelFile) {
        setPreviewRows([]);
        setValidatedZipAssetIndex(null);
        setMediaPreviewUrls((previousUrls) => {
          Object.values(previousUrls).forEach((url) => URL.revokeObjectURL(url));
          return {};
        });
        setValidationSummary(buildBulkValidationSummary([]));
        setValidationStatusText("Upload bulk Excel or single college Excel, then upload one combined image ZIP to validate records.");
        return;
      }

      setValidationStatusText("Validating uploaded college data...");

      try {
        const sheets = await readWorkbookSheets(excelFile);
        if (!sheets.has("colleges") && sheets.has("college")) sheets.set("colleges", sheets.get("college") || []);
        if (!sheets.has("courses") && sheets.has("course")) sheets.set("courses", sheets.get("course") || []);
        if (!sheets.has("entranceexams") && sheets.has("entranceexam")) sheets.set("entranceexams", sheets.get("entranceexam") || []);
        if (!sheets.has("entranceexams") && sheets.has("enteranceexam")) sheets.set("entranceexams", sheets.get("enteranceexam") || []);
        if (!sheets.has("entranceexams") && sheets.has("enteranceexams")) sheets.set("entranceexams", sheets.get("enteranceexams") || []);
        if (!sheets.has("entranceexams") && sheets.has("enterenceexam")) sheets.set("entranceexams", sheets.get("enterenceexam") || []);
        if (!sheets.has("entranceexams") && sheets.has("enterenceexams")) sheets.set("entranceexams", sheets.get("enterenceexams") || []);
        if (!sheets.has("collegeimages") && sheets.has("collegeimage")) sheets.set("collegeimages", sheets.get("collegeimage") || []);
        if (!sheets.has("colleges") && sheets.size === 1) {
          sheets.set("colleges", [...sheets.values()][0] || []);
        }
        const imageZipAssetIndex = imageZipFile ? await readZipAssetIndex(imageZipFile) : null;
        const imagePreviewUrls = imageZipFile ? await readZipImagePreviewUrls(imageZipFile) : {};
        const enrichedSheets = enrichSheetsWithZipAssets(sheets, imageZipAssetIndex);
        const nextPreviewRows = createBulkPreviewRows(
          enrichedSheets,
          imageZipAssetIndex,
          Boolean(imageZipFile),
          Boolean(singleExcelFile && !bulkExcelFile),
        );
        const duplicateRows = nextPreviewRows.filter((row) =>
          row.errors.some((error) => error === "Duplicate collegeCode" || error.includes("already exists in the system")),
        ).length;
        const invalidRows = nextPreviewRows.filter((row) => row.status === "Invalid").length;
        const rowsNeedingZipReview = nextPreviewRows.filter((row) => row.status === "Review").length;
        const totalRecords = nextPreviewRows.length;
        const validRecords = nextPreviewRows.filter((row) => row.status === "Valid").length;

        if (isCancelled) return;
        setValidatedZipAssetIndex(imageZipAssetIndex);
        setMediaPreviewUrls((previousUrls) => {
          Object.values(previousUrls).forEach((url) => URL.revokeObjectURL(url));
          return imagePreviewUrls;
        });
        setPreviewRows(nextPreviewRows);
        if (!nextPreviewRows.some((row) => row.sheet === activeDetailSheet)) {
          setActiveDetailSheet(nextPreviewRows[0]?.sheet || "colleges");
        }
        setValidationSummary({
          totalRecords,
          validRecords,
          failedRecords: 0,
          invalidRecords: invalidRows,
          duplicates: duplicateRows,
          pendingReview: rowsNeedingZipReview,
        });
        setValidationStatusText(
          imageZipFile
            ? "Excel and combined image ZIP validation completed."
            : "Excel validated. Upload one combined ZIP with logo, cover, and college images to verify media files.",
        );
      } catch (error) {
        if (isCancelled) return;
        setPreviewRows([]);
        setValidatedZipAssetIndex(null);
        setMediaPreviewUrls((previousUrls) => {
          Object.values(previousUrls).forEach((url) => URL.revokeObjectURL(url));
          return {};
        });
        setValidationSummary({
          totalRecords: 0,
          validRecords: 0,
          failedRecords: 1,
          invalidRecords: 0,
          duplicates: 0,
          pendingReview: 0,
        });
        setValidationStatusText(error instanceof Error ? error.message : "Unable to validate uploaded file.");
      }
    };

    void validateBulkUpload();

    return () => {
      isCancelled = true;
    };
    // The parser helpers are local pure functions; validation should rerun only when selected files change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUploadFiles]);

  useEffect(() => {
    setCurrentDetailPage(1);
  }, [activeDetailSheet, detailSearchText, detailStatusFilter]);

  useEffect(() => {
    if (editingRowId === null || !editingFocusField) return;
    const targetKey = `${editingRowId}-${editingFocusField}`;
    const timer = window.setTimeout(() => {
      const targetField = editingFieldRefs.current[targetKey];
      targetField?.focus();
      targetField?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }, 80);
    return () => window.clearTimeout(timer);
  }, [editingFocusField, editingRowId]);

  const visibleDetailRows = previewRows.filter((row) => row.sheet === activeDetailSheet);
  const normalizedDetailSearch = detailSearchText.trim().toLowerCase();
  const detailRows = visibleDetailRows.filter((row) => {
    const matchesStatus = detailStatusFilter === "all" || row.status === detailStatusFilter;
    const searchableText = [bulkSheetLabels[row.sheet], row.rowNumber, row.status, ...Object.values(row.data)].join(" ").toLowerCase();
    return matchesStatus && (!normalizedDetailSearch || searchableText.includes(normalizedDetailSearch));
  });
  const totalPages = Math.ceil(detailRows.length / itemsPerPage);
  const startIndex = (currentDetailPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDetailRows = detailRows.slice(startIndex, endIndex);
  const activeDetailColumns = [...getBulkPreviewColumns(activeDetailSheet), ...customSheetColumns[activeDetailSheet]];
  const getIssueColumnForPreviewColumn = (column: string) =>
    column === "rankingMin" || column === "rankingMax" ? "ranking" : column;
  const getPreviewColumnWidthClass = (column: string) => {
    if (["facilities", "quotas", "hostelFacilities", "address", "awards", "reviews"].includes(column)) {
      return "w-72 min-w-72";
    }
    if (["googleMapUrl", "websiteUrl", "campusVideo", "brochurePdf", "courseDescription", "description"].includes(column)) {
      return "w-64 min-w-64";
    }
    if (["logoImage", "coverImage", "imageName"].includes(column)) {
      return "w-52 min-w-52";
    }
    return "w-48 min-w-48";
  };
  const errorItems = useMemo(
    () =>
      previewRows.flatMap((row, rowIndex) =>
        row.errors.map((message, messageIndex) => ({
          id: `${row.id}-${rowIndex}-${messageIndex}`,
          rowId: row.id,
          sheet: row.sheet,
          rowNumber: row.rowNumber,
          summary: `${bulkSheetLabels[row.sheet]} row ${row.rowNumber}: ${message}`,
          message,
        })),
      ),
    [previewRows],
  );
  const activeErrors = errorItems.map((item) => item.summary);
  const visibleErrorItems = showAllErrors ? errorItems : errorItems.slice(0, 4);
  const editingRow = editingRowId !== null ? previewRows.find((row) => row.id === editingRowId) || null : null;
  const editingRowIssueEntries = useMemo(() => {
    if (!editingRow) return [];
    const seen = new Set<string>();
    const orderedColumns = [...getBulkPreviewColumns(editingRow.sheet), ...customSheetColumns[editingRow.sheet]];
    return orderedColumns
      .map((column) => {
        const issueColumn = getIssueColumnForPreviewColumn(column);
        if (seen.has(issueColumn)) return null;
        seen.add(issueColumn);
        const issue = editingRow.fieldIssues[issueColumn];
        if (!issue) return null;
        return {
          column,
          issueColumn,
          label: displayColumnName(column),
          level: issue.level,
          messages: issue.messages,
        };
      })
      .filter(Boolean) as Array<{
      column: string;
      issueColumn: string;
      label: string;
      level: BulkFieldIssueLevel;
      messages: string[];
    }>;
  }, [customSheetColumns, editingRow]);

  const refreshValidationSummary = (rows: BulkPreviewRow[]) => {
    setValidationSummary(buildBulkValidationSummary(rows));
  };
  const openPreviewTable = () => {
    setShowFullDetails(true);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        previewDetailsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  };

  const updatePreviewCell = (rowId: number, column: string, value: string) => {
    setPreviewRows((rows) => {
      const editingTargetRow = rows.find((row) => row.id === rowId);
      const previousCollegeCode =
        editingTargetRow?.sheet === "colleges" && column === "collegeCode"
          ? String(editingTargetRow.data.collegeCode || "").trim().toLowerCase()
          : "";

      return rows.map((row) => {
        if (column === "rankingMin" || column === "rankingMax") {
          if (row.id !== rowId) return row;
          const currentRange = getPreviewRankingRangeValues(row.data.ranking || "");
          const nextRange = {
            rankingMin: column === "rankingMin" ? value : currentRange.rankingMin,
            rankingMax: column === "rankingMax" ? value : currentRange.rankingMax,
          };
          const nextRanking = normalizeRankingRangeInput(`${nextRange.rankingMin.trim()}-${nextRange.rankingMax.trim()}`);
          return { ...row, data: { ...row.data, ranking: nextRanking } };
        }
        if (row.id === rowId) {
          return { ...row, data: { ...row.data, [column]: value } };
        }
        if (
          previousCollegeCode &&
          ["courses", "entranceexams", "collegeimages"].includes(row.sheet) &&
          String(row.data.collegeCode || "").trim().toLowerCase() === previousCollegeCode
        ) {
          return { ...row, data: { ...row.data, collegeCode: value } };
        }
        return row;
      });
    });
  };

  const getFirstIssueColumn = (row: BulkPreviewRow) => {
    const orderedColumns = [...getBulkPreviewColumns(row.sheet), ...customSheetColumns[row.sheet]];
    const firstMatchedColumn = orderedColumns.find((column) => row.fieldIssues[getIssueColumnForPreviewColumn(column)]);
    return firstMatchedColumn || Object.keys(row.fieldIssues)[0] || "";
  };

  const startEditingRow = (row: BulkPreviewRow) => {
    setEditingRowBackup({ ...row, data: { ...row.data }, errors: [...row.errors], fieldIssues: { ...row.fieldIssues } });
    setEditingRowId(row.id);
    setEditingFocusField(getFirstIssueColumn(row));
  };

  const saveEditingRow = () => {
    const nextPreviewRows = validateBulkPreviewRows(
      previewRows,
      validatedZipAssetIndex,
      Boolean(validatedZipAssetIndex?.byPath.size),
    );
    setPreviewRows(nextPreviewRows);
    refreshValidationSummary(nextPreviewRows);
    setEditingRowId(null);
    setEditingFocusField("");
    setEditingRowBackup(null);
    setValidationStatusText("");
  };

  const cancelEditingRow = () => {
    if (editingRowBackup) {
      setPreviewRows((rows) =>
        rows.map((row) => (row.id === editingRowBackup.id ? { ...editingRowBackup, data: { ...editingRowBackup.data }, errors: [...editingRowBackup.errors], fieldIssues: { ...editingRowBackup.fieldIssues } } : row)),
      );
      refreshValidationSummary(previewRows.map((row) => (row.id === editingRowBackup.id ? editingRowBackup : row)));
    }
    setEditingRowId(null);
    setEditingFocusField("");
    setEditingRowBackup(null);
  };

  const startDeleteCellDataMode = (row: BulkPreviewRow) => {
    startEditingRow(row);
    setValidationStatusText("Delete mode enabled. Clear only the cell values you want to remove, then save the row.");
  };

  const openAllCollegeFieldPanel = () => {
    setActiveDetailSheet("colleges");
    setOpenFieldPanel((panel) => (panel === "all" ? null : "all"));
    setCustomFieldForm({
      fieldName: "",
      fieldType: "Number",
      defaultValue: "",
      selectedCollegeRowId: "",
    });
    setFieldErrorText("");
  };

  const openSingleCollegeFieldPanel = () => {
    const firstCollege = previewRows.find((row) => row.sheet === "colleges");
    setActiveDetailSheet("colleges");
    setOpenFieldPanel((panel) => (panel === "single" ? null : "single"));
    setCustomFieldForm({
      fieldName: "",
      fieldType: "Number",
      defaultValue: "",
      selectedCollegeRowId: firstCollege ? String(firstCollege.id) : "",
    });
    setFieldErrorText("");
  };

  const addCustomFieldToTable = () => {
    const fieldName = customFieldForm.fieldName.trim();
    if (!fieldName) {
      setFieldErrorText("Field name is required");
      return;
    }
    const targetSheet: BulkSheetKey = "colleges";
    const existingColumns = [...bulkSheetColumns[targetSheet], ...customSheetColumns[targetSheet]];
    if (existingColumns.some((column) => column.trim().toLowerCase() === fieldName.toLowerCase())) {
      setFieldErrorText(`Field name '${fieldName}' already exists`);
      return;
    }
    if (openFieldPanel === "single" && !customFieldForm.selectedCollegeRowId) {
      setFieldErrorText("Select a college before adding custom field");
      return;
    }

    setCustomSheetColumns((columns) => ({
      ...columns,
      [targetSheet]: [...columns[targetSheet], fieldName],
    }));
    setPreviewRows((rows) =>
      rows.map((row) => {
        if (row.sheet !== targetSheet) return row;
        const shouldApplyValue = openFieldPanel === "all" || String(row.id) === customFieldForm.selectedCollegeRowId;
        return {
          ...row,
          data: {
            ...row.data,
            [fieldName]: shouldApplyValue ? customFieldForm.defaultValue : "",
          },
        };
      }),
    );
    setActiveDetailSheet(targetSheet);
    setOpenFieldPanel(null);
    setFieldErrorText("");
    setValidationStatusText(`${fieldName} field added to ${openFieldPanel === "all" ? "all colleges" : "selected college"}.`);
  };

  const openErrorRow = (rowId: number, sheet: BulkSheetKey) => {
    const targetRows = previewRows.filter((row) => row.sheet === sheet);
    const targetIndex = targetRows.findIndex((row) => row.id === rowId);
    const targetPage = targetIndex >= 0 ? Math.floor(targetIndex / itemsPerPage) + 1 : 1;
    const targetRow = targetRows[targetIndex] || previewRows.find((row) => row.id === rowId) || null;

    setShowFullDetails(true);
    setShowAllErrors(true);
    setActiveDetailSheet(sheet);
    setDetailStatusFilter("all");
    setDetailSearchText("");
    setCurrentDetailPage(targetPage);

    window.setTimeout(() => {
      previewDetailsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      if (targetRow) {
        startEditingRow(targetRow);
      }
    }, 120);
  };

  const importValidData = async () => {
    const authToken = readAuthToken();
    if (!authToken) {
      setValidationStatusText("Admin session expired. Please login again.");
      return;
    }

    if (editingRowId !== null) {
      setValidationStatusText("Finish editing the current row before importing.");
      return;
    }

    if (validationSummary.validRecords === 0) {
      setValidationStatusText("No valid records are ready for import.");
      return;
    }

    const validPreviewRows = previewRows.filter((row) => row.status === "Valid");
    const backendSheetNames: Record<BulkSheetKey, string> = {
      colleges: "College",
      courses: "Courses",
      entranceexams: "EntranceExams",
      collegeimages: "CollegeImages",
    };
    const backendPreviewRows = validPreviewRows.map((row) => ({
      ...row,
      sheet: backendSheetNames[row.sheet] || row.sheet,
      sheetKey: row.sheet,
      status: "Valid",
      statusKey: "valid",
      displayStatus: "Valid",
      isValid: true,
    }));
    const validRowsBySheet = {
      colleges: validPreviewRows.filter((row) => row.sheet === "colleges").map((row) => row.data),
      courses: validPreviewRows.filter((row) => row.sheet === "courses").map((row) => row.data),
      entranceExams: validPreviewRows.filter((row) => row.sheet === "entranceexams").map((row) => row.data),
      collegeImages: validPreviewRows.filter((row) => row.sheet === "collegeimages").map((row) => row.data),
    };
    const formData = new FormData();
    formData.append("previewRows", JSON.stringify(backendPreviewRows));
    formData.append("validRows", JSON.stringify(backendPreviewRows));
    formData.append("colleges", JSON.stringify(validRowsBySheet.colleges));
    formData.append("courses", JSON.stringify(validRowsBySheet.courses));
    formData.append("entranceExams", JSON.stringify(validRowsBySheet.entranceExams));
    formData.append("entranceexams", JSON.stringify(validRowsBySheet.entranceExams));
    formData.append("collegeImages", JSON.stringify(validRowsBySheet.collegeImages));
    formData.append("collegeimages", JSON.stringify(validRowsBySheet.collegeImages));
    const imageZipFile = selectedUploadFiles["3"];
    if (imageZipFile) {
      formData.append("imageZip", imageZipFile);
    }

    setIsImporting(true);
    setValidationStatusText("");

    try {
      const data = await request<{
        message?: string;
        summary?: {
          importedColleges?: number;
          collegesCreated?: number;
          collegesUpdated?: number;
          coursesCreated?: number;
          coursesUpdated?: number;
        };
        issues?: Array<{
          sheet?: string;
          rowNumber?: number;
          message?: string;
        }>;
      }>("/api/admin/bulk-import", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: formData,
      });

      const summary = data?.summary || {};
      const nextStatusText = [
        data?.message || "Bulk import completed.",
        summary.importedColleges ? `${summary.importedColleges} colleges synced` : "",
        summary.coursesCreated || summary.coursesUpdated
          ? `${(summary.coursesCreated || 0) + (summary.coursesUpdated || 0)} courses synced`
          : "",
      ]
        .filter(Boolean)
        .join(" ");

      setValidationStatusText(nextStatusText);

      setShowFullDetails(false);
      setShowFinishPopup(true);
    } catch (error) {
      const rawMessage = error instanceof Error ? error.message : "Bulk import failed.";
      const message =
        rawMessage === "Failed to fetch"
          ? `Bulk import failed. Backend is not reachable at ${API_BASE_URL}.`
          : rawMessage;
      setValidationStatusText(message);
    } finally {
      setIsImporting(false);
    }
  };

  const renderUploadCard = (item: (typeof uploadCards)[number]) => {
    const Icon = item.icon;
    const selectedFile = selectedUploadFiles[item.step];
    const uploadError = uploadErrors[item.step];
    const isZipCard = item.step === "3";
    const isManualCard = item.step === "2";
    const isSelectedExcel = !isZipCard && activeUploadStep === item.step;
    const cardClasses = isZipCard
      ? "border border-blue-200 bg-white"
      : isSelectedExcel
        ? "border-2 border-blue-400 bg-blue-50/60 ring-2 ring-blue-100"
        : "border border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/30";
    const fileMetaClasses = selectedFile ? "border-green-100 bg-green-50" : "border-slate-100 bg-slate-50";
    const iconClasses = isZipCard ? "text-blue-600" : isManualCard ? "text-purple-600" : "text-green-600";

    if (isZipCard) {
      return (
        <article className="rounded-2xl border border-blue-100 bg-white p-4 shadow-[0_18px_44px_rgba(15,23,42,0.06)] sm:p-5">
          <div className="flex items-start gap-3">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
              <FileClock className="size-6" />
            </span>
            <div>
              <h3 className="text-base font-black leading-6 text-slate-950">Add College Images ZIP</h3>
              <p className="mt-1 text-sm font-semibold leading-5 text-slate-500">
                ZIP should contain logo, cover, brochure, and college images
              </p>
            </div>
          </div>

          <div
            className="mt-4 flex min-h-40 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-blue-300 bg-gradient-to-br from-blue-50/80 via-white to-blue-50 px-4 py-6 text-center"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              selectUploadFile(item, event.dataTransfer.files?.[0] || null);
            }}
          >
            <FileClock className="size-14 text-blue-600" />
            <p className="mt-3 text-sm font-black text-slate-950">Drag & drop ZIP file here</p>
            <p className="mt-1 text-xs font-semibold text-slate-500">Supported formats: ZIP with images and PDF (Max size: 100MB)</p>
            <label className="mt-4 inline-flex cursor-pointer items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-black text-white shadow-[0_12px_24px_rgba(37,99,235,0.2)] transition hover:bg-blue-700">
              Choose ZIP File
              <input
                type="file"
                accept={item.accept}
                className="hidden"
                onChange={(event) => {
                  selectUploadFile(item, event.target.files?.[0] || null);
                  event.target.value = "";
                }}
              />
            </label>
            {uploadError ? (
              <span className="mt-3 block text-xs font-bold leading-5 text-red-600">{uploadError}</span>
            ) : null}
          </div>

          <div className="mt-4 rounded-2xl bg-blue-50/80 p-4">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                <span className="text-xs font-black">i</span>
              </span>
              <div className="text-xs font-semibold leading-5 text-slate-700">
                <p className="font-black text-blue-700">Important Instructions</p>
                <ul className="mt-1 list-disc space-y-0.5 pl-4">
                  <li>Upload a ZIP file only.</li>
                  <li>ZIP must contain college logo, cover image, brochure PDF, and gallery images.</li>
                  <li>File names must follow the college code.</li>
                  <li>
                    Example: If college code is <span className="rounded-md bg-white px-1.5 py-0.5 font-black">CLG001</span>, then files should be:
                  </li>
                </ul>
                <div className="mt-1 flex flex-wrap items-center gap-2 pl-4">
                  <span className="rounded-md bg-white px-2 py-1 font-black">CLG001.logo</span>
                  <span>and</span>
                  <span className="rounded-md bg-white px-2 py-1 font-black">CLG001.coverimage</span>
                  <span>and</span>
                  <span className="rounded-md bg-white px-2 py-1 font-black">CLG001.brochure.pdf</span>
                </div>
              </div>
            </div>
          </div>

          {selectedFile ? (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="max-w-full truncate rounded-lg bg-white px-4 py-3 text-sm font-black text-slate-950 shadow-sm">
                {selectedFile.name}
              </span>
              <button
                type="button"
                onClick={() => resetUploadSelection("3")}
                className="flex size-10 items-center justify-center rounded-full border border-red-100 bg-white text-red-500 transition hover:bg-red-50 hover:text-red-700"
                aria-label="Remove selected ZIP file"
              >
                <X className="size-5" />
              </button>
            </div>
          ) : null}
        </article>
      );
    }

    return (
      <article
        className={`relative flex h-full flex-col rounded-2xl p-5 shadow-[0_18px_44px_rgba(15,23,42,0.06)] transition ${!isZipCard ? "cursor-pointer" : ""} ${cardClasses}`}
        onClick={() => {
          if (!isZipCard) {
            setActiveUploadStep(item.step as "1" | "2");
          }
        }}
      >
        {!isZipCard && isSelectedExcel ? (
          <span className="absolute right-4 top-4 flex size-6 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm">
            <BadgeCheck className="size-4" />
          </span>
        ) : null}
        <div className="mb-4 flex items-start gap-3 pr-8">
          <span className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${isZipCard ? "bg-blue-100" : isManualCard ? "bg-purple-50" : "bg-green-50"}`}>
            <Icon className={`size-6 ${iconClasses}`} />
          </span>
          <div>
            <h3 className="text-base font-bold leading-snug text-slate-950">{item.title}</h3>
            <span className="mt-1 block text-sm font-medium leading-5 text-slate-500">
              {isZipCard ? "ZIP should contain logo, cover, brochure, and college images" : isManualCard ? "Add college details manually one by one" : "Upload Excel file for multiple colleges"}
            </span>
          </div>
        </div>

        <div
          className={`flex ${isZipCard ? "min-h-52 border-2 border-dashed border-blue-300 bg-gradient-to-br from-blue-50 to-white" : "min-h-36 border border-slate-100 bg-white"} flex-col items-center justify-center rounded-2xl px-4 py-5 text-center transition`}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            selectUploadFile(item, event.dataTransfer.files?.[0] || null);
          }}
        >
          {isZipCard ? <FileClock className="size-14 text-blue-600" /> : null}
          <span className="mt-2 block max-w-xs text-sm font-bold leading-5 text-slate-900">
            {isZipCard ? "Drag & drop ZIP file here" : isManualCard ? "Add college details manually" : "Upload Excel file"}
          </span>
          <span className="mt-1 block text-xs font-semibold leading-4 text-slate-500">
            {isZipCard ? "Supported formats: JPG, PNG, JPEG, PDF brochure. Maximum ZIP size: 100MB." : item.note}
          </span>
          {item.step === "2" ? (
            <button
              type="button"
              onClick={onAddManualCollege}
              className="mt-4 rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-xs font-bold leading-none text-blue-700 shadow-[0_12px_24px_rgba(37,99,235,0.08)] transition hover:bg-blue-50"
            >
              Add Manually
            </button>
          ) : (
            <label className={`mt-4 inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-[0_12px_24px_rgba(37,99,235,0.18)] transition ${isZipCard ? "bg-blue-600 hover:bg-blue-700" : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"}`}>
              {isZipCard ? "Choose ZIP File" : "Upload Excel File"}
              <input
                type="file"
                accept={item.accept}
                className="hidden"
                onChange={(event) => {
                  selectUploadFile(item, event.target.files?.[0] || null);
                  event.target.value = "";
                }}
              />
            </label>
          )}
          {uploadError ? (
            <span className="mt-3 block text-xs font-bold leading-5 text-red-600">{uploadError}</span>
          ) : null}
        </div>

        <div className={`mt-4 grid min-h-14 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border px-3 py-3 ${fileMetaClasses}`}>
          <FileClock className={`size-5 shrink-0 ${iconClasses}`} />
          <span className="min-w-0 overflow-hidden wrap-break-word text-xs font-bold leading-5 text-slate-900 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
            {selectedFile?.name || "No file selected"}
          </span>
          {selectedFile ? (
            <span className="flex shrink-0 items-center gap-2">
              <span className="whitespace-nowrap text-xs font-semibold leading-5 text-slate-500">
                {formatFileSize(selectedFile.size)}
              </span>
              {isZipCard ? (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    resetUploadSelection("3");
                  }}
                  className="flex size-7 shrink-0 items-center justify-center rounded-full border border-red-100 bg-white text-red-500 transition hover:bg-red-50 hover:text-red-700"
                  aria-label="Remove selected ZIP file"
                >
                  <X className="size-4" />
                </button>
              ) : (
                <BadgeCheck className="size-5 shrink-0 text-green-600" />
              )}
            </span>
          ) : null}
        </div>
      </article>
    );
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] rounded-[1.5rem] bg-gradient-to-br from-white via-blue-50/70 to-slate-50 px-4 py-5 text-slate-900 sm:px-6">
      <div className="flex flex-col gap-4 border-b border-blue-100 pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold leading-tight text-slate-950 sm:text-3xl">College Data Upload</h1>
          <p className="mt-1 text-sm font-medium text-slate-500 sm:text-base">
            Upload college data and images in a few simple steps
          </p>
        </div>
        <Link
          href="/admin"
          className="inline-flex w-fit items-center justify-center gap-2 rounded-xl border border-blue-100 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.06)] transition hover:border-blue-200 hover:bg-blue-50"
        >
          <LayoutDashboard className="size-4" />
          Back to Dashboard
        </Link>
      </div>

      <div className="mt-6">
        <main className="min-w-0 space-y-5">
          <section className="rounded-2xl border border-blue-100 bg-white p-4 shadow-[0_18px_46px_rgba(15,23,42,0.06)] sm:p-6">
            <div className="relative hidden items-start justify-between gap-3 md:flex">
              <div className="absolute left-[5%] right-[5%] top-5 h-1 rounded-full bg-slate-100" />
              <div
                className="absolute left-[5%] top-5 h-1 rounded-full bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 transition-all"
                style={{ width: `${Math.max(0, (currentWorkflowStep / Math.max(workflowSteps.length - 1, 1)) * 90)}%` }}
              />
              {workflowSteps.map((step, index) => {
                const completed = index < currentWorkflowStep;
                const active = index === currentWorkflowStep;
                return (
                  <div key={step} className="relative z-10 flex flex-1 flex-col items-center text-center">
                    <span className={`flex size-10 items-center justify-center rounded-full text-sm font-bold shadow-sm ${completed ? "bg-green-600 text-white" : active ? "bg-blue-600 text-white ring-4 ring-blue-100" : "bg-white text-slate-400 ring-1 ring-slate-200"}`}>
                      {completed ? <BadgeCheck className="size-5" /> : index + 1}
                    </span>
                    <span className={`mt-2 text-xs font-bold ${active ? "text-blue-700" : completed ? "text-green-700" : "text-slate-500"}`}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {!showValidationSummaryStep ? (
            <section className="rounded-2xl border border-blue-100 bg-white p-4 shadow-[0_18px_46px_rgba(15,23,42,0.06)] sm:p-6">
              <div className="mb-5">
                <h2 className="text-lg font-bold text-slate-950">
                  {showZipUploadStep ? "Step 2: Add College Images ZIP" : "Step 1: College Data"}
                </h2>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  {showZipUploadStep ? "Upload a ZIP file containing logo, cover, brochure and college images" : "Choose an option to add college data"}
                </p>
              </div>

              {showZipUploadStep ? (
                <div className="space-y-4">
                  {renderUploadCard(uploadCards[2])}
                  <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold leading-6 text-blue-700">
                    {selectedZipFile ? "ZIP file selected. Validation results are updated automatically." : "Excel is ready. Upload one combined ZIP with logo, cover, brochure, and college images."}
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="rounded-2xl border border-amber-200 bg-[linear-gradient(135deg,#fff8e7_0%,#eef4ff_100%)] px-4 py-3 shadow-[0_14px_30px_rgba(245,158,11,0.08)]">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#fff1c2] text-[#b45309]">
                          <KeyRound className="size-4" />
                        </span>
                        <div>
                          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#b45309]">College Code</p>
                          <p className="text-xs font-semibold text-slate-600">Use this to decide the next code</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <div className="rounded-xl border border-white/80 bg-white/90 px-3 py-2">
                          <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Last</span>
                          <p className="mt-1 text-lg font-black text-slate-950">{lastCollegeCodeInsight.lastCode || "No code yet"}</p>
                        </div>
                        <div className="rounded-xl border border-[#c7d2fe] bg-[#eef2ff] px-3 py-2">
                          <span className="text-[10px] font-black uppercase tracking-[0.14em] text-[#4338ca]">Next</span>
                          <p className="mt-1 text-lg font-black text-[#312e81]">{lastCollegeCodeInsight.nextSuggestedCode || "Create first code"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-4 lg:grid-cols-2">
                    {renderUploadCard(uploadCards[0])}
                    {renderUploadCard(uploadCards[1])}
                  </div>
                  <div className="rounded-2xl border border-green-100 bg-gradient-to-r from-green-50 to-blue-50 p-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-3">
                        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-green-100 text-green-700">
                          <Download className="size-5" />
                        </span>
                        <div>
                          <h3 className="text-sm font-bold text-slate-950">Download Sample Excel</h3>
                          <p className="mt-1 text-sm font-medium text-slate-500">Download sample Excel file with the correct format.</p>
                          <p className="mt-1 text-xs font-semibold text-green-700">Use this format to avoid validation errors</p>
                          <p className="mt-2 text-[11px] font-semibold leading-5 text-slate-600">
                            Brochure example: <span className="font-black text-slate-900">CLG001.brochure.pdf</span>
                          </p>
                          <p className="text-[11px] font-semibold leading-5 text-slate-600">
                            Matching ZIP examples: <span className="font-black text-slate-900">CLG001.logo.png</span>, <span className="font-black text-slate-900">CLG001.cover.png</span>, <span className="font-black text-slate-900">CLG001.brochure.pdf</span>
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={downloadSampleTemplates}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-green-200 bg-white px-4 py-2.5 text-xs font-bold text-green-700 shadow-sm transition hover:bg-green-50"
                      >
                        <Download className="size-4" />
                        Download Sample
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-blue-50 pt-5">
                {showZipUploadStep ? (
                  <button
                    type="button"
                    onClick={() => {
                      setShowZipUploadStep(false);
                      setShowValidationSummaryStep(false);
                    }}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    Back
                  </button>
                ) : null}
                {!showZipUploadStep ? (
                  activeExcelFile && activeUploadStep ? (
                    <button
                      type="button"
                      onClick={() => resetUploadSelection(activeUploadStep)}
                      className="rounded-xl border border-red-100 px-5 py-2.5 text-xs font-bold text-red-600 transition hover:bg-red-50"
                    >
                      Cancel
                    </button>
                  ) : null
                ) : null}
                {!showZipUploadStep ? (
                  <button
                    type="button"
                    onClick={() => {
                      setShowZipUploadStep(true);
                      setShowValidationSummaryStep(false);
                    }}
                    disabled={!activeExcelFile}
                    className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-2.5 text-xs font-bold text-white shadow-[0_12px_24px_rgba(79,70,229,0.22)] transition hover:from-blue-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:from-purple-300 disabled:to-blue-300 disabled:shadow-none"
                  >
                    Next
                  </button>
                ) : null}
                {showZipUploadStep ? (
                  <button
                    type="button"
                    onClick={() => setShowValidationSummaryStep(true)}
                    className="rounded-xl border border-blue-100 bg-white px-5 py-2.5 text-xs font-bold text-blue-700 transition hover:bg-blue-50"
                  >
                    Skip
                  </button>
                ) : null}
                {showZipUploadStep ? (
                  <button
                    type="button"
                    onClick={() => setShowValidationSummaryStep(true)}
                    disabled={!selectedZipFile}
                    className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-2.5 text-xs font-bold text-white shadow-[0_12px_24px_rgba(79,70,229,0.22)] transition hover:from-blue-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:from-purple-300 disabled:to-blue-300 disabled:shadow-none"
                  >
                    Next
                  </button>
                ) : null}
              </div>
            </section>
          ) : null}

          {showValidationSummaryStep ? (
            <section className="rounded-2xl border border-blue-100 bg-white p-4 shadow-[0_18px_46px_rgba(15,23,42,0.06)] sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-950">Step 3: Validation Summary</h2>
                  <p className="mt-1 max-w-3xl text-sm font-medium leading-6 text-slate-500">
                    Excel validated. Upload one combined ZIP with logo, cover, brochure, and college images to verify media files.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openPreviewTable}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-2.5 text-xs font-bold text-white shadow-[0_12px_24px_rgba(79,70,229,0.22)] transition hover:from-blue-700 hover:to-purple-700"
                >
                  Preview Data
                  <ExternalLink className="size-4" />
                </button>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
                {summaryRows.map((row, index) => (
                  <div key={row.label} className={`rounded-2xl border p-4 ${summaryCardStyles[index] || summaryCardStyles[0]}`}>
                    <span className="text-xs font-bold">{row.label}</span>
                    <strong className="mt-2 block text-2xl font-black">{row.value}</strong>
                  </div>
                ))}
              </div>
              {validationStatusText ? (
                <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-bold leading-6 text-blue-800">
                  {validationStatusText}
                </div>
              ) : null}
              <div className="mt-5 flex border-t border-blue-50 pt-5">
                <button
                  type="button"
                  onClick={() => {
                    setShowValidationSummaryStep(false);
                    setShowZipUploadStep(true);
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  Back
                </button>
              </div>
            </section>
          ) : null}
        </main>

        {false ? (
        <aside className="space-y-4 xl:sticky xl:top-4 xl:self-start">
          <section className="rounded-2xl border border-blue-100 bg-white p-5 shadow-[0_18px_46px_rgba(15,23,42,0.06)]">
            <h2 className="text-base font-bold text-slate-950">Upload Progress</h2>
            <div className="mt-4 space-y-1">
              {workflowSteps.map((step, index) => {
                const completed = index < currentWorkflowStep;
                const active = index === currentWorkflowStep;
                return (
                  <div key={step} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span className={`flex size-7 items-center justify-center rounded-full text-xs font-bold ${completed ? "bg-green-600 text-white" : active ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"}`}>
                        {completed ? <BadgeCheck className="size-4" /> : index + 1}
                      </span>
                      {index < workflowSteps.length - 1 ? <span className="h-8 w-px bg-slate-200" /> : null}
                    </div>
                    <div className="pb-3">
                      <p className={`text-sm font-bold ${active ? "text-slate-950" : "text-slate-600"}`}>{step}</p>
                      <p className="mt-0.5 text-xs font-medium text-slate-400">{completed ? "Completed" : active ? "In progress" : "Pending"}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-blue-100 bg-white p-5 shadow-[0_18px_46px_rgba(15,23,42,0.06)]">
            <h2 className="text-base font-bold text-slate-950">Summary</h2>
            <div className="mt-4 space-y-2">
              {summaryRows.map((row) => (
                <div key={row.label} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                  <span className="text-xs font-bold text-slate-600">{row.label}</span>
                  <span className={`text-sm font-black ${row.color}`}>{row.value}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-blue-100 bg-white p-5 shadow-[0_18px_46px_rgba(15,23,42,0.06)]">
            <h2 className="text-base font-bold text-slate-950">Guidelines</h2>
            <div className="mt-4 space-y-2 text-sm font-medium text-slate-600">
              {["Excel format: .xlsx, .xls", "ZIP format: .zip", "Image formats: JPG, PNG, JPEG", "Brochure format: PDF", "Max ZIP size: 100MB", "ZIP should contain logo, cover, brochure & images", "File names should not contain special characters"].map((guide) => (
                <div key={guide} className="flex gap-2">
                  <BadgeCheck className="mt-0.5 size-4 shrink-0 text-blue-600" />
                  <span>{guide}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-green-100 bg-green-50 p-5 shadow-[0_18px_46px_rgba(15,23,42,0.06)]">
            <div className="flex items-start gap-3">
              <Download className="mt-1 size-5 text-green-700" />
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-green-900">Need Help?</h3>
                <p className="mt-1 text-xs font-semibold leading-5 text-green-800">Download sample files and view format guidelines.</p>
                <button type="button" onClick={downloadSampleTemplates} className="mt-4 w-full rounded-xl border border-green-200 bg-white px-4 py-2.5 text-xs font-bold text-green-700 transition hover:bg-green-50">
                  Download Sample Files
                </button>
              </div>
            </div>
          </section>
        </aside>
        ) : null}
      </div>

      {showFullDetails ? (
        <section ref={previewDetailsRef} className="mt-5 rounded-lg border border-[#dbe6f8] bg-white shadow-[0_12px_30px_rgba(25,61,137,0.08)]">
          <div className="flex flex-col gap-3 border-b border-[#e7eefb] p-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={openAllCollegeFieldPanel}
                className="inline-flex items-center gap-2 rounded-md bg-[#4f32f6] px-4 py-2 text-xs font-extrabold text-white shadow-[0_8px_18px_rgba(79,50,246,0.2)]"
              >
                <Plus className="size-4" />
                Add New Field (All Colleges)
              </button>
              <button
                type="button"
                onClick={openSingleCollegeFieldPanel}
                className="inline-flex items-center gap-2 rounded-md border border-[#cbc8ff] bg-white px-4 py-2 text-xs font-extrabold text-[#4f32f6]"
              >
                <Plus className="size-4" />
                Add Custom Field (Single College)
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex h-10 min-w-55 items-center gap-2 rounded-md border border-[#dbe6f8] bg-white px-3 text-xs font-bold text-[#4965aa]">
                <Search className="size-4" />
                <input
                  className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-[#8a9bc6]"
                  placeholder="Search college..."
                  value={detailSearchText}
                  onChange={(event) => setDetailSearchText(event.target.value)}
                />
              </label>
              <button
                type="button"
                onClick={() => setShowFilters((value) => !value)}
                className={`inline-flex h-10 items-center gap-2 rounded-md border px-3 text-xs font-extrabold ${showFilters || detailStatusFilter !== "all" ? "border-[#4f32f6] bg-[#f4f2ff] text-[#4f32f6]" : "border-[#dbe6f8] bg-white text-[#10235d]"}`}
              >
                <Filter className="size-4" />
                Filters
              </button>
            </div>
          </div>

          {showFilters ? (
            <div className="flex flex-wrap items-center gap-2 border-b border-[#e7eefb] bg-[#fbfcff] px-3 py-3">
              {(["all", "Valid", "Invalid", "Review"] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setDetailStatusFilter(status)}
                  className={`rounded-md px-3 py-2 text-xs font-extrabold ${detailStatusFilter === status ? "bg-[#4f32f6] text-white" : "border border-[#dbe6f8] bg-white text-[#31509c]"}`}
                >
                  {status === "all" ? "All Status" : status}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setDetailSearchText("");
                  setDetailStatusFilter("all");
                }}
                className="rounded-md border border-[#dbe6f8] bg-white px-3 py-2 text-xs font-extrabold text-[#ef233c]"
              >
                Clear
              </button>
            </div>
          ) : null}

          <div className="sticky top-0 z-10 border-b border-[#e7eefb] bg-white">
            <div className="flex flex-wrap gap-2 px-3 py-2">
              {(Object.keys(bulkSheetLabels) as BulkSheetKey[]).map((sheet) => {
                const count = previewRows.filter((row) => row.sheet === sheet).length;
                return (
                  <button
                    key={sheet}
                    type="button"
                    onClick={() => {
                      setActiveDetailSheet(sheet);
                      setCurrentDetailPage(1);
                    }}
                    className={`rounded-md px-3 py-2 text-xs font-extrabold ${activeDetailSheet === sheet ? "bg-[#4f32f6] text-white" : "border border-[#dbe6f8] bg-white text-[#31509c]"}`}
                  >
                    {bulkSheetLabels[sheet]} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          <div className="responsive-data-table max-h-[58vh] max-w-full overflow-auto rounded-[1.1rem] border border-[#e7eefb] bg-white pb-2 [scrollbar-color:#31509c_#dbe6f8] [scrollbar-width:thin] [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#31509c] [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-[#dbe6f8]">
            <table className="min-w-max border-separate border-spacing-0 text-left text-xs">
              <thead className="bg-[#f3f5ff] text-[#10235d]">
                <tr>
                  {["S.No", ...activeDetailColumns, "Status", "Actions"].map((heading) => {
                    const isStatusColumn = heading === "Status";
                    const isActionsColumn = heading === "Actions";
                    const isSerialColumn = heading === "S.No";
                    const columnWidthClass = isSerialColumn
                      ? "w-16 min-w-16"
                      : isStatusColumn
                        ? "w-28 min-w-28 bg-[#f3f5ff] md:sticky md:right-20 md:z-20"
                        : isActionsColumn
                          ? "w-24 min-w-24 bg-[#f3f5ff] md:sticky md:right-0 md:z-20"
                          : getPreviewColumnWidthClass(heading);
                    return (
                      <th
                        key={heading || "select"}
                        className={`border-b border-r border-[#e7eefb] px-3 py-3 align-top font-extrabold whitespace-nowrap ${columnWidthClass}`}
                      >
                        {displayColumnName(heading)}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf2fb] border-b-2 border-[#e7eefb]">
                {paginatedDetailRows.length ? paginatedDetailRows.map((row) => (
                  <tr key={row.id} className="bg-white text-[#10235d]">
                    <td className="w-16 border-r border-[#edf2fb] px-3 py-3 align-top font-extrabold">{row.id}</td>
                    {activeDetailColumns.map((column) => {
                      const rankingRange = getPreviewRankingRangeValues(row.data.ranking || "");
                      const value =
                        column === "rankingMin"
                          ? rankingRange.rankingMin
                          : column === "rankingMax"
                            ? rankingRange.rankingMax
                            : row.data[column] || "";
                      const isImagePreviewColumn = ["logoImage", "coverImage", "imageName"].includes(column);
                      const previewAsset = value
                        ? resolveZipAssetRecord(
                            validatedZipAssetIndex,
                            value,
                            row.data.collegeCode || "",
                            column === "brochurePdf" ? { preferBrochure: true } : {},
                          )
                        : null;
                      const previewUrl = previewAsset ? mediaPreviewUrls[previewAsset.normalizedPath] : "";
                      const isBooleanColumn = ["cctvAvailability", "isBestCollege", "lateralEntry", "bestCourse"].includes(column);
                      const isEditing = editingRowId === row.id;
                      const issueColumn = column === "rankingMin" || column === "rankingMax" ? "ranking" : column;
                      const fieldIssue = row.fieldIssues[issueColumn];
                      const fieldIssueMessage = fieldIssue?.messages.join(" | ") || "";
                      const editingFieldKey = `${row.id}-${column}`;
                      const issueLabel =
                        fieldIssue?.level === "missing"
                          ? "Missing"
                          : fieldIssue?.level === "invalid"
                            ? "Invalid"
                            : fieldIssue?.level === "duplicate"
                              ? "Duplicate"
                              : fieldIssue?.level === "exists"
                                ? "Already Exists"
                              : fieldIssue?.level === "review"
                                ? ["logoImage", "coverImage"].includes(column)
                                  ? "Missing"
                                  : "Review"
                                : "";
                      const issueClassName =
                        fieldIssue?.level === "missing"
                          ? "bg-[#fff4e5] text-[#b45309]"
                          : fieldIssue?.level === "invalid"
                            ? "bg-[#ffe9e9] text-[#ef233c]"
                            : fieldIssue?.level === "duplicate" || fieldIssue?.level === "exists"
                              ? "bg-[#fff1f1] text-[#c81e1e]"
                              : "bg-[#fff7e6] text-[#e8790a]";
                      const displayValue = formatPreviewCellValue(value, column);
                      const isAssetValueColumn = isImagePreviewColumn || column === "brochurePdf";
                      return (
                        <td key={`${row.id}-${column}`} className={`${getPreviewColumnWidthClass(column)} border-r border-[#edf2fb] px-3 py-3 align-top font-bold`}>
                          {isEditing ? (
                            <div className="min-w-30 space-y-2">
                              {isBooleanColumn ? (
                                <label className={`inline-flex items-center gap-2 rounded-md border px-2 py-1.5 ${fieldIssue ? "border-[#ef233c] bg-[#fff5f5]" : "border-[#cbd7ee] bg-white"}`}>
                                  <input
                                    ref={(node) => {
                                      editingFieldRefs.current[editingFieldKey] = node;
                                    }}
                                    type="checkbox"
                                    checked={isCheckedPreviewBoolean(value)}
                                    onChange={(event) => updatePreviewCell(row.id, column, event.target.checked ? "TRUE" : "FALSE")}
                                    className="size-4 accent-[#4f32f6]"
                                    aria-invalid={Boolean(fieldIssue)}
                                  />
                                  <span className={`text-[11px] font-extrabold ${fieldIssue ? "text-[#ef233c]" : "text-[#31509c]"}`}>
                                    {isCheckedPreviewBoolean(value) ? "TRUE" : "FALSE"}
                                  </span>
                                </label>
                              ) : (
                                <input
                                  ref={(node) => {
                                    editingFieldRefs.current[editingFieldKey] = node;
                                  }}
                                  value={value}
                                  onChange={(event) => updatePreviewCell(row.id, column, event.target.value)}
                                  aria-invalid={Boolean(fieldIssue)}
                                  className={`min-w-30 rounded-sm border px-2 py-1 text-xs font-bold outline-none ${
                                    fieldIssue
                                      ? "border-[#ef233c] bg-[#fff5f5] text-[#b42318] focus:border-[#ef233c]"
                                      : "border-[#cbd7ee] bg-white text-[#10235d] focus:border-[#4f32f6]"
                                  }`}
                                />
                              )}
                              {fieldIssue ? (
                                <div className="space-y-1">
                                  <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] ${issueClassName}`}>
                                    {issueLabel}
                                  </span>
                                  <p className="text-[11px] font-semibold leading-4 text-[#b42318]" title={fieldIssueMessage}>
                                    {fieldIssueMessage}
                                  </p>
                                </div>
                              ) : null}
                            </div>
                          ) : isBooleanColumn ? (
                            <input type="checkbox" checked={isCheckedPreviewBoolean(value)} readOnly className="size-4 accent-[#4f32f6]" />
                          ) : isAssetValueColumn ? (
                            <div className="space-y-2">
                              <span
                                className={`block min-w-0 whitespace-normal break-all leading-5 ${fieldIssue ? "text-[#10235d]" : ""}`}
                                title={displayValue}
                              >
                                {displayValue === "-"
                                  ? fieldIssue?.level === "missing"
                                    ? "Missing"
                                    : "-"
                                  : displayValue}
                              </span>
                              {previewUrl && isImagePreviewColumn ? (
                                <span className="flex min-w-24 items-center gap-2">
                                  {/* Blob URLs from uploaded ZIP files cannot be optimized by next/image. */}
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={previewUrl}
                                    alt={value}
                                    className="h-12 w-20 rounded-md border border-[#dbe6f8] object-cover"
                                  />
                                </span>
                              ) : null}
                              {column === "brochurePdf" && isRemoteAssetReference(value) ? (
                                <a
                                  href={value}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white"
                                >
                                  Open File
                                  <ExternalLink className="size-3" />
                                </a>
                              ) : null}
                              {fieldIssue ? (
                                <span
                                  className={`inline-flex whitespace-nowrap rounded-full px-2 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] ${issueClassName}`}
                                  title={fieldIssue.messages.join(" | ")}
                                >
                                  {issueLabel}
                                </span>
                              ) : null}
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <span
                                className={`block min-w-0 whitespace-normal break-normal leading-5 [overflow-wrap:normal] ${fieldIssue ? "text-[#10235d]" : ""}`}
                                title={formatPreviewCellValue(value, column)}
                              >
                                {formatPreviewCellValue(value, column) === "-"
                                  ? fieldIssue?.level === "missing"
                                    ? "Missing"
                                    : "-"
                                  : formatPreviewCellValue(value, column)}
                              </span>
                              {fieldIssue ? (
                                <span
                                  className={`inline-flex whitespace-nowrap rounded-full px-2 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] ${issueClassName}`}
                                  title={fieldIssue.messages.join(" | ")}
                                >
                                  {issueLabel}
                                </span>
                              ) : null}
                            </div>
                          )}
                        </td>
                      );
                    })}
                    <td className="w-28 min-w-28 border-r border-[#edf2fb] bg-white px-3 py-3 align-top md:sticky md:right-20 md:z-20">
                      <span
                        className={`inline-flex min-w-20 justify-center whitespace-nowrap rounded-sm px-2 py-1 text-[11px] font-extrabold ${
                          row.status === "Valid" ? "bg-[#e8f8ee] text-[#16a34a]" : row.status === "Review" ? "bg-[#fff7e6] text-[#e8790a]" : "bg-[#ffe9e9] text-[#ef233c]"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="w-24 min-w-24 bg-white px-3 py-3 align-top md:sticky md:right-0 md:z-20">
                      <div className="flex items-center justify-center gap-3">
                        {editingRowId === row.id ? (
                          <>
                            <button type="button" className="text-[#16a34a]" aria-label="Save row changes" onClick={saveEditingRow}>
                              <BadgeCheck className="size-4" />
                            </button>
                            <button type="button" className="text-[#ef233c]" aria-label="Cancel row changes" onClick={cancelEditingRow}>
                              <X className="size-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button type="button" className="text-[#31509c]" aria-label="Edit row" onClick={() => startEditingRow(row)}>
                              <PencilLine className="size-4" />
                            </button>
                            <button type="button" className="text-[#ef233c]" aria-label="Delete selected cell data" onClick={() => startDeleteCellDataMode(row)}>
                              <Trash2 className="size-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={activeDetailColumns.length + 3} className="px-4 py-10 text-center text-sm font-bold text-[#4965aa]">
                      {previewRows.length ? "No records match the current search or filter." : "Upload bulk Excel data to show records in this table."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {detailRows.length > 0 && (
            <div className="flex flex-col gap-3 border-t border-[#e7eefb] bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs font-bold text-[#10235d]">
                Showing {startIndex + 1} to {Math.min(endIndex, detailRows.length)} of {detailRows.length} records
              </div>
              <div className="flex max-w-full items-center gap-1 overflow-x-auto pb-1 sm:gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentDetailPage(Math.max(1, currentDetailPage - 1))}
                  disabled={currentDetailPage === 1}
                  className="inline-flex h-9 items-center justify-center rounded-full border border-[#dbe6f8] bg-white px-3 text-xs font-extrabold text-[#31509c] transition hover:bg-[#f3f5ff] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Prev
                </button>
                {(() => {
                  const visiblePages = new Set<number>([1, totalPages, currentDetailPage - 1, currentDetailPage, currentDetailPage + 1]);
                  const pages = Array.from(visiblePages)
                    .filter((page) => page >= 1 && page <= totalPages)
                    .sort((left, right) => left - right);
                  return pages.map((page, index) => {
                    const previousPage = pages[index - 1];
                    const needsGap = previousPage && page - previousPage > 1;
                    return (
                      <div key={page} className="flex items-center gap-1">
                        {needsGap ? <span className="px-1 text-sm font-black text-[#7a8ab3]">...</span> : null}
                        <button
                          type="button"
                          onClick={() => setCurrentDetailPage(page)}
                          className={`inline-flex h-9 min-w-9 items-center justify-center rounded-full border px-3 text-xs font-extrabold transition ${
                            currentDetailPage === page
                              ? "border-[#4f32f6] bg-[#4f32f6] text-white shadow-[0_10px_18px_rgba(79,50,246,0.18)]"
                              : "border-[#dbe6f8] bg-white text-[#31509c] hover:bg-[#f3f5ff]"
                          }`}
                        >
                          {page}
                        </button>
                      </div>
                    );
                  });
                })()}
                <button
                  type="button"
                  onClick={() => setCurrentDetailPage(Math.min(totalPages, currentDetailPage + 1))}
                  disabled={currentDetailPage === totalPages}
                  className="inline-flex h-9 items-center justify-center rounded-full border border-[#dbe6f8] bg-white px-3 text-xs font-extrabold text-[#31509c] transition hover:bg-[#f3f5ff] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}

      

{false ? (
<div className="border-t border-[#e7eefb] bg-white p-3">
  <div className="overflow-hidden rounded-2xl border border-[#f4b7b7] bg-linear-to-br from-[#fff5f5] to-white shadow-sm">

  
    <div className="flex flex-col gap-3 border-b border-[#f3dede] px-4 py-4 lg:flex-row lg:items-center lg:justify-between">

      <div className="flex items-center gap-3">

      
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ffe3e3]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-[#e11d2e]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v4m0 4h.01M10.29 3.86l-8 14A1 1 0 003.14 19h17.72a1 1 0 00.85-1.5l-8-14a1 1 0 00-1.72 0z"
            />
          </svg>
        </div>

        
        <div>
          <h2 className="text-xl font-extrabold text-[#a11220]">
            Errors ({activeErrors.length})
          </h2>

          <p className="mt-1 text-sm font-medium text-[#5b6678]">
            {activeErrors.length} issues found while processing your file
          </p>
        </div>
      </div>

 
      <div className="rounded-full border border-[#f2b7b7] bg-[#fff5f5] px-4 py-2 text-sm font-bold text-[#d11a2a] shadow-sm">
        ⚠ {activeErrors.length} Errors
      </div>
    </div>


    <div className="space-y-3 px-4 py-4">

      {(showAllErrors ? activeErrors : activeErrors.slice(0, 4)).map(
        (error, index) => (
          <div
            key={`${index}-${error}`}
            className="flex items-center justify-between rounded-xl border border-[#ececec] bg-white px-4 py-3 shadow-sm"
          >
            <div className="flex items-center gap-3">

             
              <div className="h-3 w-3 rounded-full bg-[#ef233c]" />

           
              <p className="text-sm font-semibold text-[#a11220]">
                {error}
              </p>
            </div>

           
            <div className="rounded-lg bg-[#fff1f1] px-3 py-1 text-xs font-bold text-[#d11a2a]">
              Error
            </div>
          </div>
        )
      )}
    </div>

  
    <div className="flex flex-col gap-3 border-t border-[#e6e6e6] px-4 py-4 lg:flex-row lg:items-center lg:justify-between">

      <p className="text-sm font-medium text-[#6b7280]">
        Please fix the above errors and try uploading again.
      </p>

      <div className="flex items-center gap-3">

    
        <div className="rounded-lg bg-[#fff1f1] px-4 py-2 text-sm font-bold text-[#d11a2a]">
          Total Errors: {activeErrors.length}
        </div>

    
        {activeErrors.length > 4 && (
          <button
            type="button"
            onClick={() => setShowAllErrors(!showAllErrors)}
            className="rounded-lg bg-[#ef233c] px-4 py-2 text-sm font-bold text-white shadow-md transition hover:bg-[#d90429]"
          >
            {showAllErrors ? "Show Less" : "View All Errors →"}
          </button>
        )}
      </div>
    </div>
</div>
</div>
) : null}

            {openFieldPanel ? (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 py-6 backdrop-blur-sm">
                <div className="w-full max-w-3xl rounded-2xl border border-blue-100 bg-white p-5 shadow-[0_28px_80px_rgba(15,23,42,0.24)]">
                  <span className="block text-lg font-bold text-slate-950">
                    {openFieldPanel === "all" ? "Add New Field for All Colleges" : "Add Custom Field for Single College"}
                  </span>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    {openFieldPanel === "single" ? (
                      <label className="text-xs font-bold text-slate-600">
                        College
                        <select
                          className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold outline-none focus:border-purple-300 focus:ring-4 focus:ring-purple-50"
                          value={customFieldForm.selectedCollegeRowId}
                          onChange={(event) => setCustomFieldForm((form) => ({ ...form, selectedCollegeRowId: event.target.value }))}
                        >
                          {previewRows.filter((row) => row.sheet === "colleges").map((row) => (
                            <option key={row.id} value={row.id}>{row.data.collegeName || row.data.collegeCode || `Row ${row.rowNumber}`}</option>
                          ))}
                          {!previewRows.some((row) => row.sheet === "colleges") ? <option value="">No college loaded</option> : null}
                        </select>
                      </label>
                    ) : null}
                    <label className="text-xs font-bold text-slate-600">
                      Field Name
                      <input
                        className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold outline-none focus:border-purple-300 focus:ring-4 focus:ring-purple-50"
                        value={customFieldForm.fieldName}
                        onChange={(event) => setCustomFieldForm((form) => ({ ...form, fieldName: event.target.value }))}
                      />
                    </label>
                    <label className="text-xs font-bold text-slate-600">
                      Field Type
                      <select
                        className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold outline-none focus:border-purple-300 focus:ring-4 focus:ring-purple-50"
                        value={customFieldForm.fieldType}
                        onChange={(event) => setCustomFieldForm((form) => ({ ...form, fieldType: event.target.value }))}
                      >
                        <option>Number</option>
                        <option>Text</option>
                        <option>TRUE/FALSE</option>
                      </select>
                    </label>
                    <label className="text-xs font-bold text-slate-600">
                      Default Value
                      <input
                        className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold outline-none focus:border-purple-300 focus:ring-4 focus:ring-purple-50"
                        value={customFieldForm.defaultValue}
                        onChange={(event) => setCustomFieldForm((form) => ({ ...form, defaultValue: event.target.value }))}
                      />
                    </label>
                  </div>
                  <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button type="button" className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50" onClick={() => setOpenFieldPanel(null)}>Cancel</button>
                    <button type="button" className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-2.5 text-xs font-bold text-white shadow-[0_12px_24px_rgba(79,70,229,0.22)] transition hover:from-blue-700 hover:to-purple-700" onClick={addCustomFieldToTable}>Add Field</button>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="flex justify-end gap-3 border-t border-[#e7eefb] bg-white px-4 py-4">
              {validationStatusText ? (
                <div className="mr-auto flex min-h-11 max-w-xl items-center rounded-md border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-bold leading-5 text-blue-800">
                  {validationStatusText}
                </div>
              ) : null}
              <button
                type="button"
                onClick={() => {
                  cancelEditingRow();
                  setShowFullDetails(false);
                  setOpenFieldPanel(null);
                  setShowFilters(false);
                }}
                className="h-11 rounded-md border border-[#dbe6f8] px-8 text-xs font-extrabold text-[#31509c]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={validationSummary.validRecords === 0 || editingRowId !== null || isImporting}
                onClick={() => {
                  void importValidData();
                }}
                className={`h-11 rounded-md px-8 text-xs font-extrabold shadow-[0_8px_18px_rgba(79,50,246,0.22)] ${
                  validationSummary.validRecords === 0 || editingRowId !== null || isImporting
                    ? "cursor-not-allowed bg-[#c7cbe0] text-white"
                    : "bg-[#4f32f6] text-white"
                }`}
              >
                {isImporting
                  ? "Importing..."
                  : `Import Valid Data (${validationSummary.validRecords || 0})`}
              </button>
            </div>
          

          {fieldErrorText ? (
            <div className="fixed bottom-6 right-6 z-40 flex w-[min(360px,calc(100vw-2rem))] items-start gap-3 rounded-md border border-[#ffb4b4] bg-[#fff5f5] p-4 text-xs shadow-[0_14px_34px_rgba(239,35,60,0.14)]">
              <X className="mt-0.5 size-4 shrink-0 rounded-full bg-[#ef233c] p-0.5 text-white" />
              <div className="min-w-0 flex-1">
                <span className="block font-extrabold text-[#a11220]">Cannot add field</span>
                <span className="mt-1 block font-bold text-[#6b2830]">{fieldErrorText}</span>
              </div>
              <button type="button" onClick={() => setFieldErrorText("")} className="text-[#8a9bc6]">
                <X className="size-4" />
              </button>
            </div>
          ) : null}
        </section>
      ) : null}

      {showFinishPopup ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl border border-green-100 bg-white p-6 text-center shadow-[0_28px_80px_rgba(15,23,42,0.24)]">
            <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-green-100 text-green-700">
              <BadgeCheck className="size-9" />
            </span>
            <h2 className="mt-5 text-xl font-bold text-slate-950">All college data and images uploaded successfully</h2>
            <p className="mt-2 text-sm font-medium text-slate-500">You can now proceed or go back to dashboard.</p>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => setShowFinishPopup(false)}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowFinishPopup(false);
                  if (onImportComplete) {
                    void onImportComplete();
                  }
                }}
                className="rounded-xl bg-gradient-to-r from-green-600 to-emerald-500 px-5 py-2.5 text-xs font-bold text-white shadow-[0_12px_24px_rgba(22,163,74,0.22)] transition hover:from-green-700 hover:to-emerald-600"
              >
                Finish Upload
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

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
  const [isSendingPasswordLink, setIsSendingPasswordLink] = useState(false);
  const [deleteCollegeDialog, setDeleteCollegeDialog] = useState<DeleteCollegeDialogState>(null);
  const [isDeletingCollege, setIsDeletingCollege] = useState(false);
  const [deleteUserDialog, setDeleteUserDialog] = useState<DeleteUserDialogState>(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [deleteEnquiryDialog, setDeleteEnquiryDialog] = useState<DeleteEnquiryDialogState>(null);
  const [isDeletingEnquiry, setIsDeletingEnquiry] = useState(false);
  const [deleteSubAdminDialog, setDeleteSubAdminDialog] = useState<DeleteSubAdminDialogState>(null);
  const [isDeletingSubAdmin, setIsDeletingSubAdmin] = useState(false);
  const [customFacilityInput, setCustomFacilityInput] = useState("");
  const [customQuotaInput, setCustomQuotaInput] = useState("");
  const [customScholarshipInput, setCustomScholarshipInput] = useState("");
  const [showRequestNotifications, setShowRequestNotifications] = useState(false);
  const [seenNotificationIds, setSeenNotificationIds] = useState<string[]>([]);
  const [lastSeenNotificationAt, setLastSeenNotificationAt] = useState(0);
  const [isSeenNotificationsReady, setIsSeenNotificationsReady] = useState(false);
  const seenNotificationHydratedRef = useRef(false);
  const seenNotificationIdsRef = useRef<string[]>([]);
  const lastSeenNotificationAtRef = useRef(0);
  const [expandedCollegeIds, setExpandedCollegeIds] = useState<string[]>([]);
  const [showAllCollegeCards, setShowAllCollegeCards] = useState(false);
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
  const visibleCollegeCards = useMemo(
    () => (showAllCollegeCards ? adminState.colleges : adminState.colleges.slice(0, 6)),
    [adminState.colleges, showAllCollegeCards],
  );
  const hiddenCollegeCount = Math.max(adminState.colleges.length - visibleCollegeCards.length, 0);
  const loadAdminData = useCallback(async (authToken: string, fallbackUser?: AdminUser | null) => {
    try {
      setLoading(true);
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

      const jobs: Array<Promise<unknown>> = [
        canRead("colleges") || canRead("courses")
          ? request("/api/admin/colleges", withAuth(authToken))
          : Promise.resolve({}),
        canRead("courses") ? request("/api/admin/courses", withAuth(authToken)) : Promise.resolve({}),
        canRead("users") ? request("/api/admin/users", withAuth(authToken)) : Promise.resolve({}),
        canRead("enquiries") ? request("/api/admin/enquiries", withAuth(authToken)) : Promise.resolve({}),
        canRead("college-notifications") ? request("/api/admin/college-add-requests", withAuth(authToken)) : Promise.resolve({}),
        nextUser.isSuperAdmin ? request("/api/admin/sub-admins", withAuth(authToken)).catch(() => ({})) : Promise.resolve({}),
        canRead("exams") || canRead("overview")
          ? request("/api/admin/site-settings", withAuth(authToken)).catch(() => ({}))
          : Promise.resolve({}),
      ];

      const [colleges, courses, users, enquiries, collegeRequests, subAdmins, settings] =
        await Promise.all(jobs);

      setAdminState({
        colleges: (colleges as { colleges?: AdminCollege[] })?.colleges || [],
        courses: (courses as { courses?: AdminCourse[] })?.courses || [],
        users: ((users as { users?: PlatformUser[] })?.users || []).filter((item) => item.role !== "admin"),
        enquiries: (enquiries as { enquiries?: Enquiry[] })?.enquiries || [],
        collegeRequests: (collegeRequests as { requests?: RequestItem[] })?.requests || [],
        subAdmins: (subAdmins as { admins?: SubAdmin[] })?.admins || [],
      });
      setSiteSettings((settings as { settings?: SiteSettings })?.settings || {});
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to load admin";
      setStatusText(message);
      if (message.toLowerCase().includes("not authorized")) {
        clearAuth();
        router.replace("/login?redirect=/admin");
      }
    } finally {
      setLoading(false);
    }
  }, [router, setStatusText]);

  const handleBulkImportComplete = useCallback(async () => {
    if (!token) return;
    await loadAdminData(token, currentUser);
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

    const timer = window.setTimeout(() => {
      void loadAdminData(storedToken, storedUser);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadAdminData, router]);

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

  const buildEmbeddedCoursesForCollege = (collegeId: string) =>
    dedupeEmbeddedCourses(
      adminState.courses
        .filter((course) =>
          (course.colleges || []).some((item) => {
            const linkedCollegeId =
              typeof item === "string" ? item : String(item?._id || "");
            return linkedCollegeId === collegeId;
          }) ||
          (course.collegeDetails || []).some((item) =>
            (typeof item.college === "string" ? item.college : String(item.college?._id || "")) === collegeId),
        )
        .map((course) => buildEmbeddedCourseDraft(course, collegeId)),
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
    setEmbeddedCourses(buildEmbeddedCoursesForCollege(college._id));
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
      await loadAdminData(token, currentUser);
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
      await loadAdminData(token, currentUser);
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
      await loadAdminData(token, currentUser);
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
      await loadAdminData(token, currentUser);
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
      { valid: !collegeForm.contactPhone.trim() || isValidIndianPhone(collegeForm.contactPhone.trim()), step: 0, field: "contactPhone", message: "Contact: Enter a valid 10 digit phone number" },
      { valid: !collegeForm.alternatePhone.trim() || isValidIndianPhone(collegeForm.alternatePhone.trim()), step: 0, field: "alternatePhone", message: "Contact: Enter a valid 10 digit alternate phone number" },
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
      await loadAdminData(token, currentUser);
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
      await loadAdminData(token, currentUser);
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
      await loadAdminData(token, currentUser);
    });
  };

  const resetExamForm = () => {
    setExamForm(emptyExamScheduleForm);
    setEditExamId("");
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
    if (!examScheduleNameOptions.includes(normalizedExamName)) {
      setStatusText("Exams: Select a valid exam name");
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
      label: "Change Alerts",
      value: collegeChangeNotifications.length,
      icon: FileClock,
      helper: "College dashboard field updates",
      accent: "Notification Feed",
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

          <div className="relative">
            <button
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
            {showRequestNotifications ? (
              <div className="absolute right-0 top-[calc(100%+0.6rem)] z-30 w-[min(22rem,calc(100vw-1.25rem))] rounded-[1.25rem] border border-white/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(247,250,255,0.96))] p-3 shadow-[0_24px_48px_rgba(148,163,184,0.2)] backdrop-blur-sm">
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
                    className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600"
                  >
                    Close
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
              </div>
            ) : null}
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
        <div className="space-y-4">
          {/*
          <article className="overflow-hidden rounded-[1.6rem] border border-[rgba(15,76,129,0.1)] bg-[linear-gradient(135deg,#ffffff_0%,#f5faff_100%)] p-5 shadow-[0_24px_48px_rgba(148,163,184,0.12)]">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="max-w-2xl min-w-0">
                <div className="inline-flex rounded-full border border-[rgba(15,76,129,0.12)] bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-(--brand-primary)">
                  Home Page Background
                </div>
                <h3 className="mt-3 text-lg font-bold text-slate-900">Change the home page hero background image</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Use this section in the Admin Overview to upload a new hero background image. Once you save it, the home page hero background will update immediately.
                </p>
                {currentUser?.isSuperAdmin ? (
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300">
                      <ImageUp className="size-4" />
                      <span>{homeHeroImageFile ? "Change Selected Image" : "Choose Image"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) => setHomeHeroImageFile(event.target.files?.[0] || null)}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => void uploadHomeHeroImage()}
                      disabled={!homeHeroImageFile || isUploadingHomeHeroImage}
                      className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isUploadingHomeHeroImage ? "Uploading..." : "Update Background"}
                    </button>
                    {homeHeroImageFile ? (
                      <button
                        type="button"
                        onClick={() => setHomeHeroImageFile(null)}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
                      >
                        Cancel
                      </button>
                    ) : null}
                  </div>
                ) : (
                  <p className="mt-4 text-sm font-medium text-slate-500">
                    Super admin can update this image.
                  </p>
                )}
              </div>

              <div className="w-full max-w-full xl:max-w-xl">
                <div className="overflow-hidden rounded-[1.4rem] border border-slate-200 bg-white shadow-[0_16px_36px_rgba(15,23,42,0.08)]">
                  {homeHeroPreviewUrl ? (
                    <div
                      className="h-56 w-full bg-cover bg-center"
                      style={{ backgroundImage: `url('${homeHeroPreviewUrl}')` }}
                    />
                  ) : (
                    <div className="flex h-56 items-center justify-center bg-[linear-gradient(135deg,#eef6ff_0%,#f8fbff_100%)] text-sm font-medium text-slate-500">
                      No custom home background image set
                    </div>
                  )}
                  <div className="border-t border-slate-100 px-4 py-3 text-xs font-medium text-slate-500">
                    Background Preview
                  </div>
                </div>
              </div>
            </div>
          </article>
          */}

          <div className="grid gap-4 md:grid-cols-2">
            {stats.map((item) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.label}
                  className={`group relative overflow-hidden rounded-[1.6rem] border p-5 shadow-[0_24px_48px_rgba(148,163,184,0.14)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_56px_rgba(148,163,184,0.18)] ${item.cardClass}`}
                >
                  <div className={`pointer-events-none absolute inset-0 ${item.glowClass}`} />
                  <div className="relative flex items-start justify-between gap-4">
                    <div>
                      <span className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${item.accentClass}`}>
                        {item.accent}
                      </span>
                      <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                        {item.label}
                      </p>
                    </div>
                    <span className={`flex h-12 w-12 items-center justify-center rounded-[1.15rem] ${item.iconWrapClass}`}>
                      <Icon className="size-5" />
                    </span>
                  </div>
                  <div className="relative mt-7 flex items-end justify-between gap-3">
                    <p className="text-4xl font-bold tracking-[-0.04em] text-slate-900">{item.value}</p>
                    <div className="rounded-2xl border border-white/70 bg-white/75 px-3 py-2 text-right shadow-[0_10px_20px_rgba(255,255,255,0.24)] backdrop-blur-sm">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Live Status</p>
                      <p className="mt-1 text-xs font-semibold text-slate-700">Updated from dashboard</p>
                    </div>
                  </div>
                  <div className="relative mt-5 flex items-center justify-between gap-3 border-t border-white/70 pt-4">
                    <p className="text-sm text-slate-600">{item.helper}</p>
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_0_6px_rgba(74,222,128,0.14)]" />
                  </div>
                </article>
              );
            })}
          </div>

          <article className="rounded-[1.6rem] border border-[rgba(15,76,129,0.1)] bg-white p-5 shadow-[0_20px_40px_rgba(148,163,184,0.1)]">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--brand-primary)]">
                  College Edit Status
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  void runAction("college-edit-reminders", async () => {
                    const data = await request(
                      "/api/admin/colleges/send-edit-reminders",
                      withAuth(token, { method: "POST" }),
                    );
                    setStatusText(
                      data?.message || "Reminder emails processed for pending college edits",
                    );
                  })
                }
                disabled={!token || collegeDashboardEditStatus.notEdited.length === 0}
                className={solidBlueButtonClass}
              >
                Send Mail
              </button>
            </div>

            <div className="mt-5 grid gap-4">
              <div className="overflow-hidden rounded-[1.25rem] border border-emerald-200">
                <div className="flex items-center justify-between gap-3 border-b border-emerald-100 bg-[linear-gradient(135deg,#f0fdf4_0%,#ecfdf5_100%)] px-4 py-3">
                  <p className="text-sm font-bold text-emerald-900">Edited Colleges</p>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-700">
                    {collegeDashboardEditStatus.edited.length}
                  </span>
                </div>
                {collegeDashboardEditStatus.edited.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 text-sm">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">College</th>
                          <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Email</th>
                          <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Last Edit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {collegeDashboardEditStatus.edited.map((college) => (
                          <tr key={`edited-college-${college._id}`} className="align-middle">
                            <td className="px-4 py-3 font-semibold text-slate-900">{college.name || "College"}</td>
                            <td className="px-4 py-3 text-slate-600">{college.contactEmail || college.ownerEmail || "-"}</td>
                            <td className="px-4 py-3 text-slate-600">
                              {college.lastDashboardEditAt
                                ? new Date(college.lastDashboardEditAt).toLocaleDateString("en-IN", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  })
                                : "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="bg-white px-4 py-6 text-sm text-slate-500">
                    No colleges have updated their dashboard yet.
                  </div>
                )}
              </div>

              <div className="overflow-hidden rounded-[1.25rem] border border-amber-200">
                <div className="flex items-center justify-between gap-3 border-b border-amber-100 bg-[linear-gradient(135deg,#fffbeb_0%,#fff7ed_100%)] px-4 py-3">
                  <p className="text-sm font-bold text-amber-900">Pending Colleges</p>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-amber-700">
                    {collegeDashboardEditStatus.notEdited.length}
                  </span>
                </div>
                {collegeDashboardEditStatus.notEdited.length > 0 ? (
                  <div className="bg-white">
                    <div className="space-y-3 p-4 sm:hidden">
                      {collegeDashboardEditStatus.notEdited.map((college) => (
                        <div
                          key={`pending-college-mobile-${college._id}`}
                          className="rounded-2xl border border-amber-100 bg-[linear-gradient(135deg,#ffffff_0%,#fffbeb_100%)] p-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-900">{college.name || "College"}</p>
                              <p className="mt-1 break-all text-xs text-slate-500">
                                {college.contactEmail || college.ownerEmail || "-"}
                              </p>
                            </div>
                            <span className="inline-flex shrink-0 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                              Pending
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="hidden overflow-x-auto sm:block">
                      <table className="min-w-full table-fixed divide-y divide-slate-200 text-sm">
                        <colgroup>
                          <col className="w-[34%]" />
                          <col className="w-[46%]" />
                          <col className="w-[20%]" />
                        </colgroup>
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">College</th>
                            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Email</th>
                            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {collegeDashboardEditStatus.notEdited.map((college) => (
                            <tr key={`pending-college-${college._id}`} className="align-middle">
                              <td className="px-4 py-3 font-semibold text-slate-900 wrap-break-word">{college.name || "College"}</td>
                              <td className="px-4 py-3 text-slate-600 break-all">{college.contactEmail || college.ownerEmail || "-"}</td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span className="inline-flex whitespace-nowrap rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                                  Pending
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white px-4 py-6 text-sm text-slate-500">
                    Every college has updated the dashboard at least once.
                  </div>
                )}
              </div>
            </div>
          </article>
        </div>
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
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => (showCollegeForm ? resetCollegeForm() : setShowCollegeForm(true))}
              className={primaryButtonClass}
            >
              <Plus className="size-4" />
              {showCollegeForm ? "Close" : "Add College"}
            </button>
          </div>

          {showCollegeForm ? (
            <form ref={collegeFormRef} onSubmit={saveCollege} className="rounded-[1.35rem] border border-white/80 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-3 text-sm shadow-[0_24px_46px_rgba(148,163,184,0.14)] sm:p-4">
              <div className="mb-4 rounded-[1.3rem] border border-[rgba(148,163,184,0.16)] bg-[linear-gradient(135deg,#fffdf8_0%,#f4faff_100%)] px-4 py-5">
                <div className="relative hidden sm:block">
                  <div className="absolute left-[3%] right-[3%] top-[1.15rem] h-1 rounded-full bg-[#dbeafe]" />
                  <div
                    className="absolute left-[3%] top-[1.15rem] h-1 rounded-full bg-[linear-gradient(90deg,#f59e0b_0%,#38bdf8_100%)] transition-all"
                    style={{ width: `${Math.max(0, (collegeStep / Math.max(collegeSteps.length - 1, 1)) * 94)}%` }}
                  />
                  <div
                    className="relative grid gap-2"
                    style={{ gridTemplateColumns: `repeat(${collegeSteps.length}, minmax(0, 1fr))` }}
                  >
                    {collegeSteps.map((stepLabel, index) => {
                      const isActive = collegeStep === index;
                      const isCompleted = index < collegeStep;

                      return (
                        <button
                          key={stepLabel}
                          type="button"
                          onClick={() => navigateCollegeStep(index)}
                          className="flex flex-col items-center text-center"
                        >
                          <span
                            className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-[6px] border-slate-50 text-xs font-bold shadow-sm transition ${
                              isActive
                                ? "bg-[linear-gradient(135deg,#f59e0b_0%,#fb923c_100%)] text-white"
                                : isCompleted
                                  ? "bg-[linear-gradient(135deg,#0f4c81_0%,#38bdf8_100%)] text-white"
                                  : "bg-[#dbeafe] text-[#64748b]"
                            }`}
                          >
                            {index + 1}
                          </span>
                          <span className={`mt-3 text-[11px] font-medium leading-4 ${isActive ? "text-slate-900" : "text-slate-500"}`}>
                            {stepLabel}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:hidden">
                  {collegeSteps.map((stepLabel, index) => {
                    const isActive = collegeStep === index;
                    const isCompleted = index < collegeStep;

                    return (
                      <button
                        key={stepLabel}
                        type="button"
                        onClick={() => navigateCollegeStep(index)}
                        className="flex flex-col items-center gap-2 text-center"
                      >
                        <span
                          className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition ${
                            isActive
                              ? "bg-[linear-gradient(135deg,#f59e0b_0%,#fb923c_100%)] text-white"
                              : isCompleted
                                ? "bg-[linear-gradient(135deg,#0f4c81_0%,#38bdf8_100%)] text-white"
                                : "bg-slate-300 text-slate-700"
                          }`}
                        >
                          {index + 1}
                        </span>
                        <span className={`text-[11px] font-medium leading-4 ${isActive ? "text-slate-900" : "text-slate-500"}`}>
                          {stepLabel}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>

              {collegeStep === 0 ? (
              <>
              <div className="mb-3">
                <p className="text-sm font-semibold text-slate-900">Basic Information</p>
                <p className="text-xs text-slate-500">Mandatory college basics and overview details.</p>
              </div>
              <div className={formSectionClass}>
                <label>
                  <span className={labelClass}>College Name<span className={requiredMarkClass}>*</span></span>
                  <input className={getCollegeInputClass("name")} placeholder="Enter college name" value={collegeForm.name} onChange={(event) => { clearCollegeFieldError("name"); setCollegeForm((prev) => ({ ...prev, name: event.target.value })); }} required />
                  {collegeFieldErrors.name ? <span className={errorTextClass}>{collegeFieldErrors.name}</span> : null}
                </label>
                <label className="xl:col-span-2">
                  <span className={labelClass}>Description<span className={requiredMarkClass}>*</span></span>
                  <textarea className={getCollegeInputClass("description")} rows={2} placeholder="College overview" value={collegeForm.description} onChange={(event) => { clearCollegeFieldError("description"); setCollegeForm((prev) => ({ ...prev, description: event.target.value })); }} required />
                  {collegeFieldErrors.description ? <span className={errorTextClass}>{collegeFieldErrors.description}</span> : null}
                </label>
                <label>
                  <span className={labelClass}>Established Year<span className={requiredMarkClass}>*</span></span>
                  <input className={getCollegeInputClass("establishedYear")} type="number" placeholder="1998" value={collegeForm.establishedYear} onChange={(event) => { clearCollegeFieldError("establishedYear"); setCollegeForm((prev) => ({ ...prev, establishedYear: event.target.value })); }} required />
                  {collegeFieldErrors.establishedYear ? <span className={errorTextClass}>{collegeFieldErrors.establishedYear}</span> : null}
                </label>
                <label>
                  <span className={labelClass}>Ownership Type</span>
                  <select className={inputClass} value={collegeForm.ownershipType} onChange={(event) => setCollegeForm((prev) => ({ ...prev, ownershipType: event.target.value }))}>
                    <option value="">Select ownership</option>
                    {ownershipTypeOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className={labelClass}>University / Affiliation<span className={requiredMarkClass}>*</span></span>
                  <input className={getCollegeInputClass("university")} placeholder="Enter university / affiliation" value={collegeForm.university} onChange={(event) => { clearCollegeFieldError("university"); setCollegeForm((prev) => ({ ...prev, university: event.target.value })); }} required />
                  {collegeFieldErrors.university ? <span className={errorTextClass}>{collegeFieldErrors.university}</span> : null}
                </label>
              </div>

              </>
              ) : null}

              {collegeStep === 0 ? (
              <>
              <div className="mb-3">
                <p className="text-sm font-semibold text-slate-900">Location Details</p>
                <p className="text-xs text-slate-500">Address and map details for the college campus.</p>
              </div>
              <div className={formSectionClass}>
                <label>
                  <span className={labelClass}>Country<span className={requiredMarkClass}>*</span></span>
                  <select className={getCollegeInputClass("country")} value={collegeForm.country} onChange={(event) => { clearCollegeFieldError("country"); setCollegeForm((prev) => ({ ...prev, country: event.target.value })); }}>
                    {availableCountries.map((country) => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                  {collegeFieldErrors.country ? <span className={errorTextClass}>{collegeFieldErrors.country}</span> : null}
                </label>
                <label>
                  <span className={labelClass}>State<span className={requiredMarkClass}>*</span></span>
                  <select className={getCollegeInputClass("state")} value={collegeForm.state} onChange={(event) => { clearCollegeFieldError("state"); setCollegeForm((prev) => ({ ...prev, state: event.target.value, district: "" })); }} required>
                    <option value="">Select state</option>
                    {availableStates.map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                  {collegeFieldErrors.state ? <span className={errorTextClass}>{collegeFieldErrors.state}</span> : null}
                </label>
                <label>
                  <span className={labelClass}>City<span className={requiredMarkClass}>*</span></span>
                  <input className={getCollegeInputClass("city")} placeholder="Enter city" value={collegeForm.city} onChange={(event) => { clearCollegeFieldError("city"); setCollegeForm((prev) => ({ ...prev, city: event.target.value })); }} required />
                  {collegeFieldErrors.city ? <span className={errorTextClass}>{collegeFieldErrors.city}</span> : null}
                </label>
                <label>
                  <span className={labelClass}>District</span>
                  <select className={inputClass} value={collegeForm.district} onChange={(event) => setCollegeForm((prev) => ({ ...prev, district: event.target.value }))}>
                    <option value="">Select district</option>
                    {availableDistricts.map((district) => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </select>
                </label>
                <label className="xl:col-span-2">
                  <span className={labelClass}>Address<span className={requiredMarkClass}>*</span></span>
                  <input className={getCollegeInputClass("address")} placeholder="Enter full address" value={collegeForm.address} onChange={(event) => { clearCollegeFieldError("address"); setCollegeForm((prev) => ({ ...prev, address: event.target.value })); }} required />
                  {collegeFieldErrors.address ? <span className={errorTextClass}>{collegeFieldErrors.address}</span> : null}
                </label>
                <label>
                  <span className={labelClass}>Pincode<span className={requiredMarkClass}>*</span></span>
                  <input className={getCollegeInputClass("pincode")} placeholder="Enter pincode" value={collegeForm.pincode} onChange={(event) => { clearCollegeFieldError("pincode"); setCollegeForm((prev) => ({ ...prev, pincode: event.target.value })); }} required />
                  {collegeFieldErrors.pincode ? <span className={errorTextClass}>{collegeFieldErrors.pincode}</span> : null}
                </label>
                <label className="xl:col-span-2">
                  <span className={labelClass}>Google Map URL</span>
                  <input className={inputClass} placeholder="Google Maps link" value={collegeForm.locationLink} onChange={(event) => setCollegeForm((prev) => ({ ...prev, locationLink: event.target.value }))} />
                </label>
              </div>

              </>
              ) : null}
              {collegeStep === 0 ? (
              <>
              <div className="mb-3">
                <p className="text-sm font-semibold text-slate-900">Contact Details</p>
                <p className="text-xs text-slate-500">Primary contact details shown for this college.</p>
              </div>
              <div className="mb-3 rounded-2xl border border-sky-200 bg-sky-50/90 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-700">Important Contact</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">Official Email is the primary email used for college communication, request updates, and dashboard follow-up.</p>
                <p className="mt-1 text-xs leading-5 text-slate-600">Use the active official college mail ID here so admin and college dashboard communication stay aligned.</p>
              </div>
              <div className={formSectionClass}>
                <label className="md:col-span-2 xl:col-span-2">
                  <span className={`${labelClass} text-sky-700`}>Official Email<span className={requiredMarkClass}>*</span></span>
                  <input className={`${getCollegeInputClass("contactEmail")} border-sky-200 bg-sky-50/40`} type="email" placeholder="Official email" value={collegeForm.contactEmail} onChange={(event) => { clearCollegeFieldError("contactEmail"); setCollegeForm((prev) => ({ ...prev, contactEmail: event.target.value })); }} required />
                  {collegeFieldErrors.contactEmail ? <span className={errorTextClass}>{collegeFieldErrors.contactEmail}</span> : null}
                </label>
                <label>
                  <span className={labelClass}>Phone Number<span className={requiredMarkClass}>*</span></span>
                  <input className={getCollegeInputClass("contactPhone")} type="tel" inputMode="numeric" maxLength={10} placeholder="10 digit phone number" value={collegeForm.contactPhone} onChange={(event) => { clearCollegeFieldError("contactPhone"); setCollegeForm((prev) => ({ ...prev, contactPhone: normalizeIndianPhoneInput(event.target.value) })); }} required />
                  {collegeFieldErrors.contactPhone ? <span className={errorTextClass}>{collegeFieldErrors.contactPhone}</span> : null}
                </label>
                <label>
                  <span className={labelClass}>Alternate Phone</span>
                  <input className={getCollegeInputClass("alternatePhone")} type="tel" inputMode="numeric" maxLength={10} placeholder="10 digit alternate phone number" value={collegeForm.alternatePhone} onChange={(event) => { clearCollegeFieldError("alternatePhone"); setCollegeForm((prev) => ({ ...prev, alternatePhone: normalizeIndianPhoneInput(event.target.value) })); }} />
                  {collegeFieldErrors.alternatePhone ? <span className={errorTextClass}>{collegeFieldErrors.alternatePhone}</span> : null}
                </label>
                <label className="xl:col-span-2">
                  <span className={labelClass}>Website URL</span>
                  <input className={inputClass} placeholder="Website URL" value={collegeForm.website} onChange={(event) => setCollegeForm((prev) => ({ ...prev, website: event.target.value }))} />
                </label>
              </div>
              </>
              ) : null}

              {collegeStep === 1 ? (
              <>
              <div className="mb-3">
                <p className="text-sm font-semibold text-slate-900">Media Upload</p>
                <p className="text-xs text-slate-500">Upload logo, cover, gallery images, video, and brochure.</p>
              </div>
              <div className="mt-2 space-y-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <span className={labelClass}>Logo Image<span className={requiredMarkClass}>*</span></span>
                    <div className="relative">
                      <input
                        id="college-logo-upload"
                        className="sr-only"
                        type="file"
                        accept=".jpg,.jpeg,.svg,image/jpeg,image/svg+xml"
                        onChange={(event) => {
                          clearCollegeFieldError("logo");
                          setLogoFile(event.target.files?.[0] || null);
                        }}
                      />
                      <label htmlFor="college-logo-upload" className={`${mediaUploadCardClass} block min-h-[250px] cursor-pointer`}>
                        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(125,211,252,0.12),transparent_45%)]" />
                        <div className="relative flex h-full flex-col gap-6">
                          <p className="pr-12 text-[1.05rem] font-semibold leading-tight tracking-[-0.02em] text-slate-900 sm:text-[1.15rem]">
                            Upload logo image
                          </p>
                          <div className="grid gap-5 sm:grid-cols-[auto_auto] sm:items-center sm:justify-between">
                            <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/80 bg-[linear-gradient(135deg,#f8fafc_0%,#eef6ff_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_12px_24px_rgba(148,163,184,0.12)]">
                              {logoPreviewUrl ? (
                                <>
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={logoPreviewUrl}
                                    alt="College logo preview"
                                    className="h-full w-full rounded-full object-cover transition duration-300 group-hover:scale-110"
                                  />
                                </>
                              ) : (
                                <ImageUp className="size-9 text-slate-400" />
                              )}
                            </div>
                            <div className="sm:justify-self-end">
                              <span className={mediaUploadButtonClass}>
                                <ImageUp className="size-6" />
                                {logoPreviewUrl ? "Change image" : "Upload image"}
                              </span>
                            </div>
                          </div>
                          <div className="min-w-0 max-w-[320px]">
                            <p className="text-sm font-semibold leading-7 text-slate-500">Formats allowed are `.jpg`, `.jpeg`, `.svg`.</p>
                            <p className="mt-3 text-sm font-semibold leading-7 text-slate-500">Square or transparent logos look best.</p>
                          </div>
                        </div>
                      </label>
                      {logoPreviewUrl ? (
                        <button
                          type="button"
                          onClick={() => {
                            setLogoFile(null);
                            setCollegeForm((prev) => ({ ...prev, logo: "" }));
                          }}
                          className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-rose-600 text-xs font-bold text-white shadow-[0_10px_24px_rgba(225,29,72,0.28)] transition hover:bg-rose-700"
                          aria-label="Remove logo"
                        >
                          X
                        </button>
                      ) : null}
                    </div>
                    {collegeFieldErrors.logo ? <span className={errorTextClass}>{collegeFieldErrors.logo}</span> : null}
                  </div>

                  <div className="space-y-1.5">
                    <span className={labelClass}>Cover Image<span className={requiredMarkClass}>*</span></span>
                    <div className="relative">
                      <input
                        id="college-cover-upload"
                        className="sr-only"
                        type="file"
                        accept=".jpg,.jpeg,.svg,image/jpeg,image/svg+xml"
                        onChange={(event) => {
                          clearCollegeFieldError("coverImage");
                          setCoverImageFile(event.target.files?.[0] || null);
                        }}
                      />
                      <label htmlFor="college-cover-upload" className={`${mediaUploadCardClass} block min-h-[250px] cursor-pointer`}>
                        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.12),transparent_45%)]" />
                        <div className="relative flex h-full flex-col gap-6">
                          <p className="pr-12 text-[1.05rem] font-semibold leading-tight tracking-[-0.02em] text-slate-900 sm:text-[1.15rem]">
                            Upload cover image
                          </p>
                          <div className="grid gap-5 sm:grid-cols-[auto_auto] sm:items-center sm:justify-between">
                            <div className="flex h-28 w-40 shrink-0 items-center justify-center overflow-hidden rounded-[1.2rem] border border-white/80 bg-[linear-gradient(135deg,#f8fafc_0%,#eef6ff_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_12px_24px_rgba(148,163,184,0.12)]">
                              {coverImagePreviewUrl ? (
                                <>
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={coverImagePreviewUrl}
                                    alt="College cover preview"
                                    className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
                                  />
                                </>
                              ) : (
                                <ImageUp className="size-9 text-slate-400" />
                              )}
                            </div>
                            <div className="sm:justify-self-end">
                              <span className={mediaUploadButtonClass}>
                                <ImageUp className="size-6" />
                                {coverImagePreviewUrl ? "Change image" : "Upload image"}
                              </span>
                            </div>
                          </div>
                          <div className="min-w-0 max-w-[340px]">
                            <p className="text-sm font-semibold leading-7 text-slate-500">Best ratio is 16:9 for the college hero banner.</p>
                            <p className="mt-2 text-sm font-semibold leading-7 text-slate-500">Prefer 1600x900 or 1920x1080 for a crisp preview.</p>
                          </div>
                        </div>
                      </label>
                      {coverImagePreviewUrl ? (
                        <button
                          type="button"
                          onClick={() => {
                            setCoverImageFile(null);
                            setCollegeForm((prev) => ({ ...prev, coverImage: "" }));
                          }}
                          className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-rose-600 text-xs font-bold text-white shadow-[0_10px_24px_rgba(225,29,72,0.28)] transition hover:bg-rose-700"
                          aria-label="Remove cover image"
                        >
                          X
                        </button>
                      ) : null}
                    </div>
                    {collegeFieldErrors.coverImage ? <span className={errorTextClass}>{collegeFieldErrors.coverImage}</span> : null}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className={labelClass}>College Images<span className={requiredMarkClass}>*</span></span>
                  <input
                    id="college-gallery-upload"
                    className="sr-only"
                    type="file"
                    accept=".jpg,.jpeg,.svg,image/jpeg,image/svg+xml"
                    multiple
                    onChange={(event) => {
                      const nextFiles = Array.from(event.target.files || []);
                      if (!nextFiles.length) return;
                      clearCollegeFieldError("images");
                      setImageFiles((prev) => [...prev, ...nextFiles]);
                      setStatusText(`${collegeForm.images.length + imageFiles.length + nextFiles.length} college image(s) selected`);
                      event.currentTarget.value = "";
                    }}
                  />
                  <label htmlFor="college-gallery-upload" className={`${mediaUploadCardClass} block cursor-pointer`}>
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_48%)]" />
                    <div className="relative grid gap-4 sm:grid-cols-[auto_minmax(0,1fr)] lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center">
                      <div className="flex h-20 w-28 shrink-0 items-center justify-center overflow-hidden rounded-[1.1rem] border border-white/80 bg-[linear-gradient(135deg,#f8fafc_0%,#eef6ff_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_12px_24px_rgba(148,163,184,0.12)]">
                        {firstCollegeImagePreviewUrl ? (
                          <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={firstCollegeImagePreviewUrl}
                              alt="College gallery preview"
                              className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
                            />
                          </>
                        ) : (
                          <ImageUp className="size-8 text-slate-400" />
                        )}
                      </div>
                      <div className="min-w-0 lg:pr-2">
                        <p className="text-lg font-semibold leading-tight tracking-[-0.02em] text-slate-900">Upload college gallery</p>
                        <p className="mt-2 text-sm leading-6 text-slate-500">Only JPG or SVG images are recommended.</p>
                        <p className="text-sm leading-6 text-slate-500">Minimum 2 images, maximum 7 images. Selected: {totalCollegeImageCount}</p>
                      </div>
                      <div className="lg:justify-self-end">
                        <span className={mediaUploadButtonClass}>{totalCollegeImageCount > 0 ? "Add more images" : "Upload images"}</span>
                      </div>
                    </div>
                  </label>
                  {collegeFieldErrors.images ? <span className={errorTextClass}>{collegeFieldErrors.images}</span> : null}
                  <span className="block text-[11px] text-slate-500">Upload high-quality images in 16:9 ratio, preferably 1600x900 or 1920x1080.</span>
                  <span className="block text-[11px] text-slate-500">Low quality or portrait images may appear cropped or blurry.</span>
                </div>

                {totalCollegeImageCount > 0 ? (
                  <div className="space-y-3 rounded-[1.4rem] border border-[rgba(148,163,184,0.16)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.94))] p-4 shadow-[0_16px_32px_rgba(148,163,184,0.08)]">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Preview Images</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {collegeForm.images.map((image, index) => (
                        <div key={`existing-college-image-${index}`} className={`${mediaPreviewTileClass} w-[132px]`}>
                          <div className="mb-2 flex items-center justify-between gap-2">
                            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Image {index + 1}</span>
                            <button
                              type="button"
                              onClick={() => removeCollegeImageAt(index)}
                              className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white transition hover:bg-rose-700"
                              aria-label={`Remove college image ${index + 1}`}
                            >
                              X
                            </button>
                          </div>
                          <div className="h-24 w-full overflow-hidden rounded-[0.95rem] border border-slate-100 bg-slate-50">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={image} alt={`College preview ${index + 1}`} className="h-full w-full object-cover transition duration-300 group-hover:scale-110" />
                          </div>
                        </div>
                      ))}

                      {collegeImagePreviews.map((item, index) => (
                        <div key={`new-college-image-${item.key}`} className={`${mediaPreviewTileClass} w-[132px]`}>
                          <div className="mb-2 flex items-center justify-between gap-2">
                            <span className="truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">New {index + 1}</span>
                            <button
                              type="button"
                              onClick={() => removeCollegeImageAt(collegeForm.images.length + index)}
                              className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white transition hover:bg-rose-700"
                              aria-label={`Remove new college image ${index + 1}`}
                            >
                              X
                            </button>
                          </div>
                          <div className="h-24 w-full overflow-hidden rounded-[0.95rem] border border-slate-100 bg-slate-50">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={item.url} alt={item.name} className="h-full w-full object-cover transition duration-300 group-hover:scale-110" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="grid gap-3 md:grid-cols-2">
                  <label>
                    <span className={labelClass}>Brochure PDF</span>
                    <input className={inputClass} type="file" accept="application/pdf" onChange={(event) => setBrochureFile(event.target.files?.[0] || null)} />
                  </label>
                  <label>
                    <span className={labelClass}>Campus Video (YouTube link)</span>
                    <input className={inputClass} placeholder="YouTube video link" value={collegeForm.campusVideoUrl} onChange={(event) => setCollegeForm((prev) => ({ ...prev, campusVideoUrl: event.target.value }))} />
                  </label>
                </div>
              </div>
              {collegeForm.brochurePdfUrl ? (
                <p className="mt-2 text-xs text-slate-500">
                  Brochure ready: {collegeForm.brochurePdfUrl}
                </p>
              ) : null}
              </>
              ) : null}

              {collegeStep === 0 ? (
              <>
              <div className="mb-3">
                <p className="text-sm font-semibold text-slate-900">Highlights Section</p>
                <p className="text-xs text-slate-500">Highlight ranking, accreditation, reviews, and awards.</p>
              </div>
              <div className={formSectionClass}>
                <label>
                  <span className={labelClass}>Ranking (NIRF / State rank)</span>
                  <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
                    <input
                      className={`${getCollegeInputClass("ranking")} text-center`}
                      placeholder="101"
                      inputMode="numeric"
                      maxLength={4}
                      aria-label="Ranking start"
                      value={rankingStartInput}
                      onChange={(event) => updateCollegeRankingPart("start", event.target.value)}
                      onBlur={() => {
                        const normalizedInput = normalizeRankingRangeInput(collegeForm.ranking);
                        const formatted =
                          normalizedInput.includes("-") && isValidRankingRange(normalizedInput)
                            ? formatRankingRangeForSave(normalizedInput)
                            : normalizedInput;
                        setCollegeForm((prev) => ({ ...prev, ranking: formatted }));
                        setCollegeFieldErrors((prev) => ({
                          ...prev,
                          ranking: isValidRankingRange(formatted)
                            ? ""
                            : "Use NIRF format like 101-150. Both numbers must be between 1 and 9999.",
                        }));
                      }}
                    />
                    <span className="inline-flex h-11 items-center justify-center px-1 text-base font-semibold text-slate-400">
                      -
                    </span>
                    <input
                      className={`${getCollegeInputClass("ranking")} text-center disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400`}
                      placeholder="150"
                      inputMode="numeric"
                      maxLength={4}
                      aria-label="Ranking end"
                      value={rankingEndInput}
                      disabled={!rankingStartInput}
                      onChange={(event) => updateCollegeRankingPart("end", event.target.value)}
                      onBlur={() => {
                        const normalizedInput = normalizeRankingRangeInput(collegeForm.ranking);
                        const formatted =
                          normalizedInput.includes("-") && isValidRankingRange(normalizedInput)
                            ? formatRankingRangeForSave(normalizedInput)
                            : normalizedInput;
                        setCollegeForm((prev) => ({ ...prev, ranking: formatted }));
                        setCollegeFieldErrors((prev) => ({
                          ...prev,
                          ranking: isValidRankingRange(formatted)
                            ? ""
                            : "Use NIRF format like 101-150. Both numbers must be between 1 and 9999.",
                        }));
                      }}
                    />
                  </div>
                  <span className="mt-1.5 block text-center text-[11px] text-slate-400">
                    Enter a ranking range like `25 - 50`
                  </span>
                  {collegeFieldErrors.ranking ? (
                    <span className={errorTextClass}>{collegeFieldErrors.ranking}</span>
                  ) : null}
                  {collegeForm.ranking ? (
                    <span className="mt-1 block text-center text-[11px] font-medium text-slate-500">
                      Saved as: {formatRankingRangeForDisplay(collegeForm.ranking)}
                    </span>
                  ) : null}
                </label>
                <label>
                  <span className={labelClass}>Accreditation</span>
                  <input className={inputClass} placeholder="NAAC, NBA, AICTE..." list="college-accreditation-options" value={collegeForm.accreditation} onChange={(event) => setCollegeForm((prev) => ({ ...prev, accreditation: event.target.value }))} />
                </label>
                <label>
                  <span className={labelClass}>Awards & Recognitions</span>
                  <input className={inputClass} placeholder="Awards and recognitions" value={collegeForm.awardsRecognitions} onChange={(event) => setCollegeForm((prev) => ({ ...prev, awardsRecognitions: event.target.value }))} />
                </label>
                <label className="xl:col-span-3">
                  <span className={labelClass}>Reviews</span>
                  <textarea
                    className={inputClass}
                    rows={3}
                    placeholder="Good placement support. Clean hostel rooms. Helpful faculty guidance."
                    value={collegeForm.reviews}
                    onChange={(event) => setCollegeForm((prev) => ({ ...prev, reviews: event.target.value }))}
                  />
                  <span className="mt-1 block text-[11px] text-slate-500">
                    Separate each review point with a full stop. It will be shown as bullet points on the college page.
                  </span>
                </label>
              </div>
              <datalist id="college-accreditation-options">
                {COLLEGE_ACCREDITATION_OPTIONS.map((option) => (
                  <option key={option} value={option} />
                ))}
              </datalist>
              </>
              ) : null}

              {collegeStep === 1 ? (
              <>
              <div className="mb-3">
                <p className="text-sm font-semibold text-slate-900">Facilities</p>
                <p className="text-xs text-slate-500">Select campus facilities and add extra ones if needed.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {facilityQuickOptions.map((option) => {
                  const isSelected = selectedFacilities.some((item) => item.toLowerCase() === option.toLowerCase());
                  return (
                    <button key={option} type="button" onClick={() => toggleFacility(option)} className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${isSelected ? "border-sky-200 bg-sky-50 text-sky-700" : "border-slate-200 bg-white text-slate-600"}`}>
                      {option}
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Add Custom Facility</p>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                  <input
                    className={inputClass}
                    placeholder="Type custom facility and press Enter"
                    value={customFacilityInput}
                    onChange={(event) => setCustomFacilityInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addCustomFacility();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={addCustomFacility}
                    className={`${softButtonClass} w-full justify-center sm:w-auto sm:min-w-27`}
                  >
                    Add Facility
                  </button>
                </div>
              </div>
              <div className="mt-3 rounded-xl border border-slate-200 bg-white px-3 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Selected Facilities</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {selectedFacilities.length > 0 ? selectedFacilities.map((item) => (
                    <button key={item} type="button" onClick={() => removeFacility(item)} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-700">
                      {item}
                    </button>
                  )) : <span className="text-xs text-slate-400">No facilities selected</span>}
                </div>
              </div>
              </>
              ) : null}

              {collegeStep === 2 ? (
              <>
              <div className="mb-3">
                <p className="text-sm font-semibold text-slate-900">Admission Info</p>
                <p className="text-xs text-slate-500">Admission flow, quotas, scholarships, and fee range details.</p>
              </div>
              <div className={formSectionClass}>
                <div className="xl:col-span-3">
                  <span className={labelClass}>Quotas</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {quotaQuickOptions.map((option) => {
                      const isSelected = selectedQuotas.some((item) => item.toLowerCase() === option.toLowerCase());
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => toggleQuota(option)}
                          className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${isSelected ? "border-sky-200 bg-sky-50 text-sky-700" : "border-slate-200 bg-white text-slate-600"}`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Add Custom Quota</p>
                    <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                      <input
                        className={inputClass}
                        placeholder="Type custom quota and press Enter"
                        value={customQuotaInput}
                        onChange={(event) => setCustomQuotaInput(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            addCustomQuota();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={addCustomQuota}
                        className={`${softButtonClass} w-full justify-center sm:w-auto sm:min-w-27`}
                      >
                        Add Quota
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 rounded-xl border border-slate-200 bg-white px-3 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Selected Quotas</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {selectedQuotas.length > 0 ? selectedQuotas.map((item) => (
                        <button key={item} type="button" onClick={() => removeQuota(item)} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-700">
                          {item}
                        </button>
                      )) : <span className="text-xs text-slate-400">No quotas selected</span>}
                    </div>
                  </div>
                </div>
                <label>
                  <span className={labelClass}>Fee Structure<span className={requiredMarkClass}>*</span></span>
                  <div className="grid grid-cols-2 gap-2">
                    <input className={getCollegeInputClass("feeMin")} placeholder="Minimum fee" value={collegeForm.feeMin} onChange={(event) => { clearCollegeFieldError("feeMin"); setCollegeForm((prev) => ({ ...prev, feeMin: event.target.value })); }} required />
                    <input className={getCollegeInputClass("feeMax")} placeholder="Maximum fee" value={collegeForm.feeMax} onChange={(event) => { clearCollegeFieldError("feeMax"); setCollegeForm((prev) => ({ ...prev, feeMax: event.target.value })); }} required />
                  </div>
                  <div className="mt-1 grid grid-cols-2 gap-2 text-[11px] font-medium text-slate-500">
                    <span>Min Fee</span>
                    <span>Max Fee</span>
                  </div>
                  {collegeFieldErrors.feeMin || collegeFieldErrors.feeMax ? (
                    <span className={errorTextClass}>
                      {collegeFieldErrors.feeMin || collegeFieldErrors.feeMax}
                    </span>
                  ) : null}
                </label>
                <label className="xl:col-span-2">
                  <span className={labelClass}>Admission Process<span className={requiredMarkClass}>*</span></span>
                  <textarea className={getCollegeInputClass("admissionProcess")} rows={2} placeholder="Admission process" value={collegeForm.admissionProcess} onChange={(event) => { clearCollegeFieldError("admissionProcess"); setCollegeForm((prev) => ({ ...prev, admissionProcess: event.target.value })); }} required />
                  {collegeFieldErrors.admissionProcess ? <span className={errorTextClass}>{collegeFieldErrors.admissionProcess}</span> : null}
                </label>
                <label>
                  <span className={labelClass}>Application Mode<span className={requiredMarkClass}>*</span></span>
                  <select className={getCollegeInputClass("applicationMode")} value={collegeForm.applicationMode} onChange={(event) => { clearCollegeFieldError("applicationMode"); setCollegeForm((prev) => ({ ...prev, applicationMode: event.target.value })); }}>
                    <option value="">Select application mode</option>
                    {applicationModeOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  {collegeFieldErrors.applicationMode ? <span className={errorTextClass}>{collegeFieldErrors.applicationMode}</span> : null}
                </label>
                <div className="xl:col-span-3">
                  <span className={labelClass}>Scholarships</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {scholarshipQuickOptions.map((option) => {
                      const isSelected = selectedScholarships.some((item) => item.toLowerCase() === option.toLowerCase());
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => toggleScholarship(option)}
                          className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${isSelected ? "border-sky-200 bg-sky-50 text-sky-700" : "border-slate-200 bg-white text-slate-600"}`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Add Custom Scholarship</p>
                    <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                      <input
                        className={inputClass}
                        placeholder="Type custom scholarship and press Enter"
                        value={customScholarshipInput}
                        onChange={(event) => setCustomScholarshipInput(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            addCustomScholarship();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={addCustomScholarship}
                        className={`${softButtonClass} w-full justify-center sm:w-auto sm:min-w-27`}
                      >
                        Add Scholarship
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 rounded-xl border border-slate-200 bg-white px-3 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Selected Scholarships</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {selectedScholarships.length > 0 ? selectedScholarships.map((item) => (
                        <button key={item} type="button" onClick={() => removeScholarship(item)} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-700">
                          {item}
                        </button>
                      )) : <span className="text-xs text-slate-400">No scholarships selected</span>}
                    </div>
                  </div>
                </div>
              </div>
              </>
              ) : null}

              {collegeStep === 2 ? (
              <>
              <div className="mb-3">
                <p className="text-sm font-semibold text-slate-900">Placement Details</p>
                <p className="text-xs text-slate-500">Placement numbers and package information.</p>
              </div>
              <div className={formSectionClass}>
                <label className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3">
                  <span className={`${labelClass} text-emerald-700`}>Placement Percentage</span>
                  <input className={`${inputClass} border-emerald-200 bg-white`} placeholder="Placement %" value={collegeForm.placementRate} onChange={(event) => setCollegeForm((prev) => ({ ...prev, placementRate: event.target.value }))} />
                  <span className="mt-2 block text-[11px] font-medium text-emerald-700">Keep this as an important highlight point for the college profile.</span>
                </label>
                <label>
                  <span className={labelClass}>Average Package</span>
                  <input className={inputClass} placeholder="Average package" value={collegeForm.averagePackage} onChange={(event) => setCollegeForm((prev) => ({ ...prev, averagePackage: event.target.value }))} />
                </label>
                <label>
                  <span className={labelClass}>Highest Package</span>
                  <input className={inputClass} placeholder="Highest package" value={collegeForm.highestPackage} onChange={(event) => setCollegeForm((prev) => ({ ...prev, highestPackage: event.target.value }))} />
                </label>
              </div>
              </>
              ) : null}

              {collegeStep === 1 ? (
              <>
              <div className="mb-3">
                <p className="text-sm font-semibold text-slate-900">Hostel Details</p>
                <p className="text-xs text-slate-500">Hostel type, fee structure, CCTV, and hostel-specific facilities.</p>
              </div>
              <div className="mb-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setCollegeForm((prev) => ({ ...prev, hostelAvailability: "available" }))}
                  className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${collegeForm.hostelAvailability === "available" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-600"}`}
                >
                  Hostel Available
                </button>
                <button
                  type="button"
                  onClick={() => setCollegeForm((prev) => ({ ...prev, hostelAvailability: "not_available" }))}
                  className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${collegeForm.hostelAvailability === "not_available" ? "border-rose-200 bg-rose-50 text-rose-700" : "border-slate-200 bg-white text-slate-600"}`}
                >
                  Hostel Not Available
                </button>
              </div>
              {!hasHostelFacility ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-600">
                  Select `Hostel Available` to enter hostel details.
                </div>
              ) : (
              <div className="mt-2 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                <label className="xl:col-span-3">
                  <span className={labelClass}>General Info</span>
                  <textarea className={inputClass} rows={2} placeholder="General info" value={collegeForm.hostelRules} onChange={(event) => setCollegeForm((prev) => ({ ...prev, hostelRules: event.target.value }))} />
                </label>
                <label>
                  <span className={labelClass}>Hostel Type<span className={requiredMarkClass}>*</span></span>
                  <select className={getCollegeInputClass("hostelType")} value={collegeForm.hostelType} onChange={(event) => { clearCollegeFieldError("hostelType"); setCollegeForm((prev) => ({ ...prev, hostelType: event.target.value, hostelAvailability: event.target.value ? "available" : "not_available" })); }}>
                    <option value="">Hostel type</option>
                    <option value="inside_campus">Inside Campus Hostel</option>
                    <option value="outside_campus">Outside Campus Hostel</option>
                  </select>
                  {collegeFieldErrors.hostelType ? <span className={errorTextClass}>{collegeFieldErrors.hostelType}</span> : null}
                </label>
                <label>
                  <span className={labelClass}>Hostel Fees Structure<span className={requiredMarkClass}>*</span></span>
                  <div className="grid grid-cols-2 gap-2">
                    <input className={getCollegeInputClass("hostelFeeMin")} placeholder="Min fee" value={collegeForm.hostelFeeMin} onChange={(event) => { clearCollegeFieldError("hostelFeeMin"); setCollegeForm((prev) => ({ ...prev, hostelFeeMin: event.target.value })); }} />
                    <input className={inputClass} placeholder="Max fee" value={collegeForm.hostelFeeMax} onChange={(event) => setCollegeForm((prev) => ({ ...prev, hostelFeeMax: event.target.value }))} />
                  </div>
                  <div className="mt-1 grid grid-cols-2 gap-2 text-[11px] font-medium text-slate-500">
                    <span>Min Fee</span>
                    <span>Max Fee</span>
                  </div>
                  {collegeFieldErrors.hostelFeeMin ? <span className={errorTextClass}>{collegeFieldErrors.hostelFeeMin}</span> : null}
                </label>
                <label>
                  <span className={labelClass}>CCTV Availability<span className={requiredMarkClass}>*</span></span>
                  <select className={getCollegeInputClass("cctvAvailable")} value={collegeForm.cctvAvailable} onChange={(event) => { clearCollegeFieldError("cctvAvailable"); setCollegeForm((prev) => ({ ...prev, cctvAvailable: event.target.value })); }}>
                    <option value="">CCTV availability</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                  {collegeFieldErrors.cctvAvailable ? <span className={errorTextClass}>{collegeFieldErrors.cctvAvailable}</span> : null}
                </label>
                <label className="xl:col-span-3">
                  <span className={labelClass}>Facilities</span>
                  <input className={inputClass} placeholder="Hostel facilities" value={collegeForm.hostelFacilityOptions} onChange={(event) => setCollegeForm((prev) => ({ ...prev, hostelFacilityOptions: event.target.value }))} />
                </label>
              </div>
              )}
              </>
              ) : null}

              {collegeStep === 3 ? (
              <>
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Add Course</p>
                  <p className="text-[11px] text-slate-500">Courses now stay inside the Add College flow instead of a separate create form.</p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-[11px] text-slate-500">Selected: {embeddedCourses.length}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setEmbeddedCourseForm(createEmptyEmbeddedCourseDraft(collegeForm.university.trim()));
                      setEditingEmbeddedCourseIndex(null);
                      setShowEmbeddedCourseEditor(true);
                    }}
                    className="rounded-full bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
                  >
                    Add Course
                  </button>
                </div>
              </div>
              {showEmbeddedCourseEditor ? (
                <div className="mt-3 space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {editingEmbeddedCourseIndex !== null ? "Edit Course In Add College" : "Create Course In Add College"}
                      </h3>
                      <p className="text-xs text-slate-500">This course will be saved together with the current college.</p>
                    </div>
                    <button type="button" onClick={resetEmbeddedCourseEditor} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">
                      Cancel
                    </button>
                  </div>

                  <div className={formSectionClass}>
                    <label>
                      <span className={labelClass}>Degree Type<span className={requiredMarkClass}>*</span></span>
                      <select
                        className={inputClass}
                        value={embeddedCourseForm.degreeType}
                        onChange={(event) =>
                          setEmbeddedCourseForm((prev) => {
                            const nextCourseTypeOptions = getCourseTypeOptionsForSelection(prev.stream, event.target.value);
                            const nextCourseType = nextCourseTypeOptions.includes(prev.courseType) ? prev.courseType : nextCourseTypeOptions[0] || "";

                            return {
                              ...prev,
                              degreeType: event.target.value,
                              courseType: nextCourseType,
                              specialization: "",
                              duration: getDefaultDuration(prev.stream, event.target.value) || prev.duration,
                              minimumQualification:
                                getDefaultMinimumQualification(nextCourseType, event.target.value, prev.stream) || prev.minimumQualification,
                              entranceExamsEnabled:
                                shouldAutoShowEntranceExams(nextCourseType, event.target.value, prev.stream) || prev.entranceExamsEnabled,
                            };
                          })
                        }
                        required
                      >
                        <option value="">Select degree type</option>
                        {degreeTypeOptions.map((item) => (
                          <option key={item} value={item}>{item}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span className={labelClass}>Stream<span className={requiredMarkClass}>*</span></span>
                      <select
                        className={inputClass}
                        value={embeddedStreamSelectValue}
                        onChange={(event) =>
                          setEmbeddedCourseForm((prev) => {
                            if (event.target.value === CUSTOM_STREAM_OPTION) {
                              setEmbeddedCourseCustomFieldMode({
                                stream: true,
                                specialization: false,
                                courseName: false,
                              });
                              return {
                                ...prev,
                                stream: streamOptions.includes(prev.stream) ? "" : prev.stream,
                                courseType: "",
                                specialization: "",
                                entranceExams: syncCourseExamsForStream(
                                  streamOptions.includes(prev.stream) ? "" : prev.stream,
                                  prev.entranceExams,
                                ),
                              };
                            }
                            setEmbeddedCourseCustomFieldMode({
                              stream: false,
                              specialization: false,
                              courseName: false,
                            });
                            const nextCourseTypeOptions = getCourseTypeOptionsForSelection(event.target.value, prev.degreeType);
                            const nextCourseType = nextCourseTypeOptions.includes(prev.courseType) ? prev.courseType : nextCourseTypeOptions[0] || "";

                            return {
                              ...prev,
                              stream: event.target.value,
                              courseType: nextCourseType,
                              specialization: "",
                              duration: getDefaultDuration(event.target.value, prev.degreeType) || prev.duration,
                              minimumQualification:
                                getDefaultMinimumQualification(nextCourseType, prev.degreeType, event.target.value) || prev.minimumQualification,
                              entranceExamsEnabled:
                                shouldAutoShowEntranceExams(nextCourseType, prev.degreeType, event.target.value) || prev.entranceExamsEnabled,
                              entranceExams: syncCourseExamsForStream(event.target.value, prev.entranceExams),
                            };
                          })
                        }
                        required
                      >
                        <option value="">Select stream</option>
                        {embeddedStreamOptions.map((item) => (
                          <option key={item} value={item}>{item}</option>
                        ))}
                    </select>
                  </label>
                    <label>
                      <span className={labelClass}>Specialization<span className={requiredMarkClass}>*</span></span>
                      <select
                        className={inputClass}
                        value={embeddedSpecializationSelectValue}
                        onChange={(event) =>
                          setEmbeddedCourseForm((prev) => {
                            if (event.target.value === CUSTOM_SPECIALIZATION_OPTION) {
                              setEmbeddedCourseCustomFieldMode((current) => ({
                                ...current,
                                specialization: true,
                              }));
                              return {
                                ...prev,
                                specialization: embeddedSpecializationOptionValues.includes(prev.specialization)
                                  ? ""
                                  : prev.specialization,
                              };
                            }
                            return {
                              ...prev,
                              specialization: event.target.value,
                              minimumQualification:
                                getDefaultMinimumQualification(
                                  prev.courseType,
                                  prev.degreeType,
                                  prev.stream,
                                ) || prev.minimumQualification,
                              entranceExamsEnabled:
                                shouldAutoShowEntranceExams(
                                  prev.courseType,
                                  prev.degreeType,
                                  prev.stream,
                                ) || prev.entranceExamsEnabled,
                            };
                          })
                        }
                        required
                      >
                        <option value="">Select specialization</option>
                        {embeddedSpecializationEntries.map((item) => (
                          <option key={item.label} value={item.value}>{item.label}</option>
                        ))}
                        <option value={CUSTOM_SPECIALIZATION_OPTION}>Custom specialization</option>
                      </select>
                    </label>
                    {embeddedSpecializationSelectValue === CUSTOM_SPECIALIZATION_OPTION ? (
                      <label>
                        <span className={labelClass}>Custom Specialization<span className={requiredMarkClass}>*</span></span>
                        <input
                          className={inputClass}
                          placeholder="Type custom specialization"
                          value={embeddedCourseForm.specialization}
                          onChange={(event) =>
                            setEmbeddedCourseForm((prev) => ({
                              ...prev,
                              specialization: event.target.value,
                              minimumQualification:
                                getDefaultMinimumQualification(
                                  prev.courseType,
                                  prev.degreeType,
                                  prev.stream,
                                ) || prev.minimumQualification,
                              entranceExamsEnabled:
                                shouldAutoShowEntranceExams(
                                  prev.courseType,
                                  prev.degreeType,
                                  prev.stream,
                                ) || prev.entranceExamsEnabled,
                            }))
                          }
                          required
                        />
                        <button
                          type="button"
                          onClick={() => {
                            addCustomCourseCatalogItem({
                              stream: embeddedCourseForm.stream,
                              degreeType: embeddedCourseForm.degreeType,
                              courseType: embeddedCourseForm.courseType,
                              specialization: embeddedCourseForm.specialization,
                            });
                          }}
                          className="mt-2 inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
                        >
                          Add Custom Specialization
                        </button>
                      </label>
                    ) : null}
                    <label>
                      <span className={labelClass}>Course Name<span className={requiredMarkClass}>*</span></span>
                      <select
                        className={inputClass}
                        value={embeddedCourseNameSelectValue}
                        onChange={(event) =>
                          setEmbeddedCourseForm((prev) => {
                            if (event.target.value === CUSTOM_COURSE_NAME_OPTION) {
                              setEmbeddedCourseCustomFieldMode((current) => ({
                                ...current,
                                courseName: true,
                                specialization: false,
                              }));
                              return { ...prev, courseType: embeddedCourseTypeOptions.includes(prev.courseType) ? "" : prev.courseType, specialization: "" };
                            }
                            setEmbeddedCourseCustomFieldMode((current) => ({
                              ...current,
                              courseName: false,
                              specialization: false,
                            }));
                            return {
                              ...prev,
                              courseType: event.target.value,
                              specialization: "",
                              minimumQualification:
                                getDefaultMinimumQualification(event.target.value, prev.degreeType, prev.stream) || prev.minimumQualification,
                              entranceExamsEnabled:
                                shouldAutoShowEntranceExams(event.target.value, prev.degreeType, prev.stream) || prev.entranceExamsEnabled,
                            };
                          })
                        }
                        required
                      >
                        <option value="">Select course name</option>
                        {embeddedCourseTypeOptions.map((item) => (
                          <option key={item} value={item}>{item}</option>
                        ))}
                        <option value={CUSTOM_COURSE_NAME_OPTION}>Custom course name</option>
                      </select>
                    </label>
                    {embeddedCourseNameSelectValue === CUSTOM_COURSE_NAME_OPTION ? (
                      <label>
                        <span className={labelClass}>Custom Course Name<span className={requiredMarkClass}>*</span></span>
                        <input
                          className={inputClass}
                          placeholder="Type custom course name"
                          value={embeddedCourseForm.courseType}
                          onChange={(event) =>
                            setEmbeddedCourseForm((prev) => ({
                              ...prev,
                              courseType: event.target.value,
                              specialization: "",
                            }))
                          }
                          required
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (
                              addCustomCourseCatalogItem({
                                stream: embeddedCourseForm.stream,
                                degreeType: embeddedCourseForm.degreeType,
                                courseType: embeddedCourseForm.courseType,
                                specialization: "",
                              })
                            ) {
                              setEmbeddedCourseForm((prev) => ({ ...prev, courseType: normalizeAdminOption(prev.courseType) }));
                            }
                          }}
                          className="mt-2 inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
                        >
                          Add Custom Course Name
                        </button>
                      </label>
                    ) : null}
                    <label>
                      <span className={labelClass}>Duration<span className={requiredMarkClass}>*</span></span>
                      <input className={inputClass} placeholder="4 Years" value={embeddedCourseForm.duration} onChange={(event) => setEmbeddedCourseForm((prev) => ({ ...prev, duration: event.target.value, totalFees: calculateTotalFeesFromSemesterFees(prev.semesterFees, event.target.value) || prev.totalFees }))} required />
                    </label>
                    <label>
                      <span className={labelClass}>Mode</span>
                      <select className={inputClass} value={embeddedCourseForm.mode} onChange={(event) => setEmbeddedCourseForm((prev) => ({ ...prev, mode: event.target.value }))}>
                        {modeOptions.map((item) => (
                          <option key={item} value={item}>{item}</option>
                        ))}
                      </select>
                    </label>
                    <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={embeddedCourseForm.lateralEntryAvailable}
                        onChange={(event) =>
                          setEmbeddedCourseForm((prev) => ({
                            ...prev,
                            lateralEntryAvailable: event.target.checked,
                            lateralEntryDetails: event.target.checked ? prev.lateralEntryDetails : "",
                          }))
                        }
                      />
                      Lateral Entry
                    </label>
                    <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={embeddedCourseForm.isTopCourse}
                        onChange={(event) =>
                          setEmbeddedCourseForm((prev) => ({
                            ...prev,
                            isTopCourse: event.target.checked,
                          }))
                        }
                      />
                      Best Course
                    </label>
                    {embeddedCourseForm.lateralEntryAvailable ? (
                      <label className="md:col-span-2">
                        <span className={labelClass}>Lateral Entry Details</span>
                        <input className={inputClass} placeholder="Diploma entry rules, direct second year..." value={embeddedCourseForm.lateralEntryDetails} onChange={(event) => setEmbeddedCourseForm((prev) => ({ ...prev, lateralEntryDetails: event.target.value }))} />
                      </label>
                    ) : null}
                    <label>
                      <span className={labelClass}>Minimum Qualification<span className={requiredMarkClass}>*</span></span>
                      <input className={inputClass} list="embedded-qualification-options" placeholder="Grade 12 / Graduation" value={embeddedCourseForm.minimumQualification} onChange={(event) => setEmbeddedCourseForm((prev) => ({ ...prev, minimumQualification: event.target.value }))} required />
                    </label>
                    <label>
                      <span className={labelClass}>University</span>
                      <input className={inputClass} placeholder="Affiliated or awarding university" value={embeddedCourseForm.university} onChange={(event) => setEmbeddedCourseForm((prev) => ({ ...prev, university: event.target.value }))} />
                    </label>
                    <label>
                      <span className={labelClass}>Semester Fees<span className={requiredMarkClass}>*</span></span>
                      <input className={inputClass} placeholder="Semester fees" value={embeddedCourseForm.semesterFees} onChange={(event) => setEmbeddedCourseForm((prev) => ({ ...prev, semesterFees: event.target.value, totalFees: calculateTotalFeesFromSemesterFees(event.target.value, prev.duration) || prev.totalFees }))} />
                    </label>
                    <label>
                      <span className={labelClass}>Total Fees<span className={requiredMarkClass}>*</span></span>
                      <input className={inputClass} placeholder="Total fees" value={embeddedCourseForm.totalFees} onChange={(event) => setEmbeddedCourseForm((prev) => ({ ...prev, totalFees: event.target.value }))} required />
                    </label>
                    <div className="md:col-span-2 xl:col-span-3">
                      <span className={labelClass}>Cutoff By Category</span>
                      <div className="grid gap-2 md:grid-cols-[180px_minmax(0,1fr)_auto]">
                        <select
                          className={inputClass}
                          value={embeddedCourseForm.cutoffCategory}
                          onChange={(event) =>
                            setEmbeddedCourseForm((prev) => ({
                              ...prev,
                              cutoffCategory: event.target.value,
                              cutoffValue: getCutoffValueForCategory(prev.cutoffByCategory, event.target.value),
                            }))
                          }
                        >
                          {cutoffCategoryOptions.map((item) => (
                            <option key={item.value} value={item.value}>{item.label}</option>
                          ))}
                        </select>
                        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
                          <input
                            className={`${inputClass} text-center`}
                            placeholder=""
                            value={embeddedCutoffRangeParts.start}
                            data-cutoff-input-segment="start"
                            onChange={(event) =>
                              setEmbeddedCourseForm((prev) => ({
                                ...prev,
                                cutoffValue: buildCutoffRangeValue(event.target.value, getCutoffRangeParts(prev.cutoffValue).end),
                              }))
                            }
                            onBlur={handleEmbeddedCutoffBlur("start")}
                            inputMode="decimal"
                            maxLength={7}
                          />
                          <span className="text-base font-semibold text-slate-500">-</span>
                          <input
                            className={`${inputClass} text-center`}
                            placeholder=""
                            value={embeddedCutoffRangeParts.end}
                            data-cutoff-input-segment="end"
                            onChange={(event) =>
                              setEmbeddedCourseForm((prev) => ({
                                ...prev,
                                cutoffValue: buildCutoffRangeValue(getCutoffRangeParts(prev.cutoffValue).start, event.target.value),
                              }))
                            }
                            onBlur={handleEmbeddedCutoffBlur("end")}
                            inputMode="decimal"
                            maxLength={7}
                          />
                        </div>
                        <button
                          type="button"
                          data-cutoff-action="add"
                          onClick={upsertEmbeddedCourseCutoff}
                          className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                        >
                          Add Cutoff
                        </button>
                      </div>
                      <p className="mt-2 text-[11px] text-slate-500">
                        {getCutoffRangeHelperText(embeddedCutoffRangeConfig)}
                      </p>
                      {embeddedCutoffWarning ? (
                        <p className="mt-1 text-[11px] font-medium text-rose-600">{embeddedCutoffWarning}</p>
                      ) : null}
                      {normalizeCategoryCutoffs(embeddedCourseForm.cutoffByCategory).length > 0 ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {normalizeCategoryCutoffs(embeddedCourseForm.cutoffByCategory).map((item) => (
                            <div key={item.category} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700">
                              <span>{item.category}: {item.cutoff}</span>
                              <button
                                type="button"
                                onClick={() => removeEmbeddedCourseCutoff(String(item.category || ""))}
                                className="text-rose-600 transition hover:text-rose-700"
                                aria-label={`Remove ${item.category} cutoff`}
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-2 text-xs text-slate-500">
                          Add category-wise cutoff values like OC, BC, MBC, SC, and ST. Use values like 190, 190.5, or 190-195.
                        </p>
                      )}
                    </div>
                    <label>
                      <span className={labelClass}>Allotted Seats<span className={requiredMarkClass}>*</span></span>
                      <input className={inputClass} placeholder="Total allotted seats" value={embeddedCourseForm.intake} onChange={(event) => setEmbeddedCourseForm((prev) => ({ ...prev, intake: event.target.value }))} required />
                    </label>
                    <label>
                      <span className={labelClass}>Application Fee</span>
                      <input className={inputClass} placeholder="Application fee" value={embeddedCourseForm.applicationFee} onChange={(event) => setEmbeddedCourseForm((prev) => ({ ...prev, applicationFee: event.target.value }))} />
                    </label>
                    <label className="md:col-span-2 xl:col-span-3">
                      <span className={labelClass}>Course Description</span>
                      <textarea className={inputClass} rows={3} placeholder="Short overview of course content, outcomes, and focus area..." value={embeddedCourseForm.description} onChange={(event) => setEmbeddedCourseForm((prev) => ({ ...prev, description: event.target.value }))} />
                    </label>
                  </div>

                  {embeddedCourseForm.entranceExamsEnabled ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-3">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">Entrance Exams</h3>
                          <p className="text-xs text-slate-500">Add exam details if this course needs them.</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setEmbeddedCourseForm((prev) => ({
                                ...prev,
                                entranceExamsEnabled: false,
                              }))
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-xs font-bold text-slate-700"
                            aria-label="Hide entrance exam section"
                          >
                            X
                          </button>
                          <button
                            type="button"
                            onClick={() => setEmbeddedCourseForm((prev) => ({ ...prev, entranceExams: [...prev.entranceExams, emptyCourseExam()] }))}
                            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
                          >
                            <Plus className="size-4" />
                            Add Exam
                          </button>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {embeddedCourseForm.entranceExams.map((exam, index) => {
                          const examOptions = getExamScheduleNameOptions(embeddedCourseForm.stream);
                          const examRangeConfig = resolveExamCutoffRangeConfig(embeddedCourseForm.stream, exam.examName);
                          const examRangeParts = getCutoffRangeParts(exam.cutoffValue);
                          const examCutoffWarning = getCutoffLimitWarning(exam.cutoffValue, examRangeConfig);

                          return (
                            <div key={`embedded-exam-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                              <div className="mb-2 flex items-center justify-between gap-3">
                                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Exam {index + 1}</p>
                                {embeddedCourseForm.entranceExams.length > 1 ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setEmbeddedCourseForm((prev) => ({
                                        ...prev,
                                        entranceExams: prev.entranceExams.filter((_, examIndex) => examIndex !== index),
                                      }))
                                    }
                                    className="text-xs font-semibold text-rose-600"
                                  >
                                    Remove
                                  </button>
                                ) : null}
                              </div>
                              <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                                <label>
                                  <span className={labelClass}>Exam Name</span>
                                  <select
                                    className={inputClass}
                                    value={exam.examName}
                                    onChange={(event) =>
                                      setEmbeddedCourseForm((prev) => ({
                                        ...prev,
                                        entranceExams: prev.entranceExams.map((item, examIndex) =>
                                          examIndex === index
                                            ? {
                                                ...item,
                                                examName: event.target.value,
                                                cutoffByCategory: [],
                                                cutoffScoreOrRank: "",
                                                cutoffCategory: defaultCutoffCategory,
                                                cutoffValue: "",
                                              }
                                            : item,
                                        ),
                                      }))
                                    }
                                  >
                                    <option value="">Select exam name</option>
                                    {examOptions.map((item) => (
                                      <option key={item} value={item}>
                                        {item}
                                      </option>
                                    ))}
                                    {exam.examName && !examOptions.includes(exam.examName) ? (
                                      <option value={exam.examName}>{exam.examName}</option>
                                    ) : null}
                                  </select>
                                </label>
                                <label>
                                  <span className={labelClass}>Exam Weightage</span>
                                  <input className={inputClass} placeholder="Exam weightage" value={exam.weightage} onChange={(event) => setEmbeddedCourseForm((prev) => ({ ...prev, entranceExams: prev.entranceExams.map((item, examIndex) => examIndex === index ? { ...item, weightage: event.target.value } : item) }))} />
                                </label>
                                <div className="md:col-span-2 xl:col-span-3">
                                  <span className={labelClass}>Cutoff By Category</span>
                                  <div className="grid gap-2 md:grid-cols-[180px_minmax(0,1fr)_auto]">
                                    <select
                                      className={inputClass}
                                      value={exam.cutoffCategory}
                                      onChange={(event) =>
                                        setEmbeddedCourseForm((prev) => ({
                                          ...prev,
                                          entranceExams: prev.entranceExams.map((item, examIndex) =>
                                            examIndex === index
                                              ? {
                                                  ...item,
                                                  cutoffCategory: event.target.value,
                                                  cutoffValue: getCutoffValueForCategory(item.cutoffByCategory, event.target.value),
                                                }
                                              : item,
                                          ),
                                        }))
                                      }
                                    >
                                      {cutoffCategoryOptions.map((item) => (
                                        <option key={item.value} value={item.value}>{item.label}</option>
                                      ))}
                                    </select>
                                    <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
                                      <input
                                        className={`${inputClass} text-center`}
                                        value={examRangeParts.start}
                                        data-cutoff-input-segment="start"
                                        onChange={(event) =>
                                          setEmbeddedCourseForm((prev) => ({
                                            ...prev,
                                            entranceExams: prev.entranceExams.map((item, examIndex) =>
                                              examIndex === index
                                                ? {
                                                    ...item,
                                                    cutoffValue: buildCutoffRangeValue(event.target.value, getCutoffRangeParts(item.cutoffValue).end),
                                                  }
                                                : item,
                                            ),
                                          }))
                                        }
                                        onBlur={(event) => {
                                          const shouldSkipAutoAdvance = shouldSkipEmbeddedCutoffAutoAdvance(event, "start");
                                          setEmbeddedCourseForm((prev) => ({
                                            ...prev,
                                            entranceExams: prev.entranceExams.map((item, examIndex) => {
                                              if (examIndex !== index) return item;
                                              const normalizedDraft = {
                                                ...item,
                                                cutoffValue: buildCutoffRangeValue(
                                                  getCutoffRangeParts(item.cutoffValue).start,
                                                  getCutoffRangeParts(item.cutoffValue).end,
                                                ),
                                              };
                                              if (shouldSkipAutoAdvance) {
                                                return normalizedDraft;
                                              }
                                              return buildCourseExamCutoffState(normalizedDraft, examRangeConfig) ?? normalizedDraft;
                                            }),
                                          }));
                                          setStatusText("");
                                        }}
                                        inputMode="decimal"
                                        maxLength={7}
                                      />
                                      <span className="text-base font-semibold text-slate-500">-</span>
                                      <input
                                        className={`${inputClass} text-center`}
                                        value={examRangeParts.end}
                                        data-cutoff-input-segment="end"
                                        onChange={(event) =>
                                          setEmbeddedCourseForm((prev) => ({
                                            ...prev,
                                            entranceExams: prev.entranceExams.map((item, examIndex) =>
                                              examIndex === index
                                                ? {
                                                    ...item,
                                                    cutoffValue: buildCutoffRangeValue(getCutoffRangeParts(item.cutoffValue).start, event.target.value),
                                                  }
                                                : item,
                                            ),
                                          }))
                                        }
                                        onBlur={(event) => {
                                          const shouldSkipAutoAdvance = shouldSkipEmbeddedCutoffAutoAdvance(event, "end");
                                          setEmbeddedCourseForm((prev) => ({
                                            ...prev,
                                            entranceExams: prev.entranceExams.map((item, examIndex) => {
                                              if (examIndex !== index) return item;
                                              const normalizedDraft = {
                                                ...item,
                                                cutoffValue: buildCutoffRangeValue(
                                                  getCutoffRangeParts(item.cutoffValue).start,
                                                  getCutoffRangeParts(item.cutoffValue).end,
                                                ),
                                              };
                                              if (shouldSkipAutoAdvance) {
                                                return normalizedDraft;
                                              }
                                              return buildCourseExamCutoffState(normalizedDraft, examRangeConfig) ?? normalizedDraft;
                                            }),
                                          }));
                                          setStatusText("");
                                        }}
                                        inputMode="decimal"
                                        maxLength={7}
                                      />
                                    </div>
                                    <button
                                      type="button"
                                      data-cutoff-action="add"
                                      onClick={() => {
                                        if (!exam.cutoffCategory) {
                                          setStatusText("Select an entrance exam cutoff category");
                                          return;
                                        }
                                        if (!formatCutoffForSave(exam.cutoffValue)) {
                                          setStatusText(cutoffValidationMessage);
                                          return;
                                        }
                                        if (!isCutoffWithinRangeConfig(exam.cutoffValue, examRangeConfig)) {
                                          setStatusText(getCutoffValidationMessageForConfig(examRangeConfig));
                                          return;
                                        }
                                        setEmbeddedCourseForm((prev) => ({
                                          ...prev,
                                          entranceExams: prev.entranceExams.map((item, examIndex) =>
                                            examIndex === index
                                              ? buildCourseExamCutoffState(item, examRangeConfig) ?? item
                                              : item,
                                          ),
                                        }));
                                        setStatusText("");
                                      }}
                                      className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                                    >
                                      Add Cutoff
                                    </button>
                                  </div>
                                  <p className="mt-2 text-[11px] text-slate-500">
                                    {getCutoffRangeHelperText(examRangeConfig)}
                                  </p>
                                  {examCutoffWarning ? (
                                    <p className="mt-1 text-[11px] font-medium text-rose-600">{examCutoffWarning}</p>
                                  ) : null}
                                  {normalizeCategoryCutoffs(exam.cutoffByCategory).length > 0 ? (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                      {normalizeCategoryCutoffs(exam.cutoffByCategory).map((item) => (
                                        <div key={`${index}-${item.category}`} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700">
                                          <span>{item.category}: {item.cutoff}</span>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              setEmbeddedCourseForm((prev) => ({
                                                ...prev,
                                                entranceExams: prev.entranceExams.map((examItem, examIndex) =>
                                                  examIndex === index
                                                    ? removeCourseExamCutoffState(examItem, String(item.category || ""))
                                                    : examItem,
                                                ),
                                              }))
                                            }
                                            className="text-rose-600 transition hover:text-rose-700"
                                            aria-label={`Remove ${item.category} cutoff`}
                                          >
                                            <Trash2 className="size-3.5" />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  ) : null}
                                </div>
                                <input className={`${inputClass} md:col-span-2 xl:col-span-3`} placeholder="Specified paper / syllabus" value={exam.paperOrSyllabus} onChange={(event) => setEmbeddedCourseForm((prev) => ({ ...prev, entranceExams: prev.entranceExams.map((item, examIndex) => examIndex === index ? { ...item, paperOrSyllabus: event.target.value } : item) }))} />
                                <textarea className={`${inputClass} md:col-span-2 xl:col-span-3`} rows={2} placeholder="Preparation notes" value={exam.preparationNotes} onChange={(event) => setEmbeddedCourseForm((prev) => ({ ...prev, entranceExams: prev.entranceExams.map((item, examIndex) => examIndex === index ? { ...item, preparationNotes: event.target.value } : item) }))} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setEmbeddedCourseForm((prev) => ({
                              ...prev,
                              entranceExamsEnabled: true,
                              entranceExams:
                                prev.entranceExams.length > 0 ? prev.entranceExams : [emptyCourseExam()],
                            }))
                          }
                          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
                        >
                          <Plus className="size-4" />
                          Add Entrance Exam
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setEmbeddedCourseForm((prev) => ({
                              ...prev,
                              entranceExamsEnabled: false,
                              entranceExams: [emptyCourseExam()],
                            }))
                          }
                          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600"
                        >
                          Entrance Exam Not Needed
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button type="button" onClick={saveEmbeddedCourseDraft} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
                      {editingEmbeddedCourseIndex !== null ? "Update Course" : "Save Course"}
                    </button>
                    <button type="button" onClick={resetEmbeddedCourseEditor} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : null}
              {embeddedCourses.length > 0 ? (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Saved Course List</h3>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {embeddedCourses.map((item, index) => (
                          <span
                            key={`${item.id || item.courseType}-${index}`}
                            className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700"
                          >
                            {[
                              [item.courseType, item.specialization].filter(Boolean).join(" - "),
                              item.degreeType,
                              item.stream,
                              item.duration,
                            ]
                              .filter(Boolean)
                              .join(" | ")}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowSavedCourseList(true)}
                      className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                    >
                      Saved Course List
                    </button>
                  </div>
                </div>
              ) : null}
              </>
              ) : null}
              </div>

              <div className="mt-3 space-y-1.5">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={collegeForm.isBestCollege}
                    onChange={(event) =>
                      setCollegeForm((prev) => ({
                        ...prev,
                        isBestCollege: event.target.checked,
                      }))
                    }
                  />
                  Mark as Best College
                </label>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={() => setCollegeStep((prev) => Math.max(prev - 1, 0))} className={softButtonClass}>
                  Prev
                </button>
                {collegeStep < collegeSteps.length - 1 ? (
                  <button type="button" onClick={() => navigateCollegeStep(Math.min(collegeStep + 1, collegeSteps.length - 1))} className={softButtonClass}>
                    Next
                  </button>
                ) : null}
                <button type={collegeStep === collegeSteps.length - 1 ? "submit" : "button"} className={primaryButtonClass} onClick={() => {
                  if (collegeStep < collegeSteps.length - 1) {
                    navigateCollegeStep(Math.min(collegeStep + 1, collegeSteps.length - 1));
                  }
                }}>
                  {collegeStep === collegeSteps.length - 1
                    ? editCollegeId
                      ? "Update College"
                      : "Save College"
                    : "Continue"}
                </button>
              </div>
            </form>
          ) : null}

          {adminState.colleges.length > 6 ? (
            <div className="mb-3 flex justify-end">
              <button
                type="button"
                onClick={() => setShowAllCollegeCards((prev) => !prev)}
                className={softButtonClass}
              >
                {showAllCollegeCards ? "Show less" : `View all colleges${hiddenCollegeCount ? ` (${hiddenCollegeCount}+ more)` : ""}`}
              </button>
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleCollegeCards.map((college) => {
              const range = formatFeeRange(college.feesStructure);
              const isExpanded = expandedCollegeIds.includes(college._id);
              return (
                <article key={college._id} className="flex h-full flex-col rounded-[1.35rem] border border-white/80 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-4 shadow-[0_18px_34px_rgba(148,163,184,0.12)]">
                  <div className="flex flex-1 items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="break-words text-base font-bold leading-6 text-slate-900">{college.name || "College"}</h3>
                      <p className="mt-1 break-words text-sm leading-5 text-slate-600">{college.university || "-"}</p>
                      <p className="mt-1 min-h-4 break-words text-xs leading-4 text-slate-500">{[college.district, college.state].filter(Boolean).join(", ") || "-"}</p>
                      {college.isTopCollege || college.isBestCollege ? (
                        <span className="mt-1 inline-flex rounded-full bg-[rgba(15,76,129,0.08)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[color:var(--brand-primary)]">
                          Best College
                        </span>
                      ) : null}
                      {isExpanded ? (
                        <>
                        <p className="mt-1 text-xs text-slate-500">
                          Fees: {formatCompactIndianCurrencyRange(range.min, range.max)}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">Tags: {college.courseTags || "-"}</p>
                        <p className="mt-1 text-xs text-slate-500">Facilities: {Array.isArray(college.facilities) ? college.facilities.join(", ") : (college.facilities || "-")}</p>
                        <p className="mt-1 text-xs text-slate-500">Placement: {String((college.placements?.placementRate ?? college.placementRate) || "-")}</p>
                        <p className="mt-1 text-xs text-slate-500">Contact: {college.contactPhone || college.phone || "-"}</p>
                        <p className="mt-1 text-xs text-slate-500">{college.isTopCollege || college.isBestCollege ? "Best college" : "Standard listing"}</p>
                        </>
                      ) : null}
                    </div>
                    {college.logo ? (
                      <CollegeLogoBadge
                        src={college.logo}
                        alt={college.name || "College"}
                        className="h-14 w-14 shrink-0 rounded-[1rem]"
                        imageClassName="p-2"
                      />
                    ) : (
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[1rem] bg-[linear-gradient(135deg,#eff6ff_0%,#fff7ed_100%)]">
                        <Building2 className="size-7 text-[#0f4c81]" />
                      </div>
                    )}
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedCollegeIds((prev) =>
                            prev.includes(college._id)
                              ? prev.filter((item) => item !== college._id)
                              : [...prev, college._id],
                          )
                        }
                        className={`${softButtonClass} h-9 w-full justify-center px-3 py-1.5 text-xs`}
                      >
                        {isExpanded ? "Hide Info" : "See Details"}
                      </button>
                      <Link href={`/college/${college._id}`} className={`${softButtonClass} h-9 w-full justify-center px-3 py-1.5 text-xs`}>
                        View
                        <ExternalLink className="size-4" />
                      </Link>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openCollegeEditor(college)}
                        className="inline-flex h-9 min-w-24 items-center justify-center gap-2 rounded-full border border-[rgba(37,99,235,0.3)] bg-[#3b82f6] px-3 py-2 text-xs font-semibold text-white shadow-[0_10px_20px_rgba(37,99,235,0.2)] transition duration-200 hover:bg-[#2563eb] hover:shadow-[0_12px_24px_rgba(37,99,235,0.26)]"
                      >
                        <PencilLine className="size-4" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          openDeleteCollegeDialog(college, event.currentTarget);
                        }}
                        className="inline-flex h-9 min-w-24 items-center justify-center gap-2 rounded-full border border-[rgba(220,38,38,0.4)] bg-[#ef4444] px-3 py-2 text-xs font-semibold text-white shadow-[0_10px_20px_rgba(239,68,68,0.2)] transition duration-200 hover:bg-[#dc2626] hover:shadow-[0_12px_24px_rgba(239,68,68,0.26)]"
                      >
                        <Trash2 className="size-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      ) : null}

      {!loading && activeTab === "courses" ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            New courses are now created inside <span className="font-semibold">Add College &gt; Courses</span>. This page keeps the live course list and edit controls.
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                resetCourseForm();
                setEmbeddedCourses([]);
                handleTabChange("colleges");
                setShowCollegeForm(true);
                setCollegeStep(3);
              }}
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <Plus className="size-4" />
              Add Course In College
            </button>
          </div>

          {showCourseForm ? (
            <form onSubmit={saveCourse} className="space-y-4 rounded-[1.4rem] border border-slate-200 bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
              <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3">
                  <h3 className="text-sm font-bold text-slate-900">A. Basic Course Info</h3>
                  <p className="text-xs text-slate-500">Set the main course identity before assigning fees, admission details, and college-wise data.</p>
                </div>
                <div className={formSectionClass}>
                  <label>
                    <span className={labelClass}>Degree Type<span className={requiredMarkClass}>*</span></span>
                    <select
                      className={inputClass}
                      value={courseForm.degreeType}
                      onChange={(event) =>
                        setCourseForm((prev) => {
                          const nextCourseTypeOptions = getCourseTypeOptionsForSelection(prev.stream, event.target.value);
                          const nextCourseType = nextCourseTypeOptions.includes(prev.courseType) ? prev.courseType : nextCourseTypeOptions[0] || "";

                          return {
                            ...prev,
                            degreeType: event.target.value,
                            courseType: nextCourseType,
                            specialization: "",
                            duration: getDefaultDuration(prev.stream, event.target.value) || prev.duration,
                            minimumQualification:
                              getDefaultMinimumQualification(nextCourseType, event.target.value, prev.stream) || prev.minimumQualification,
                            entranceExamsEnabled:
                              shouldAutoShowEntranceExams(nextCourseType, event.target.value, prev.stream) || prev.entranceExamsEnabled,
                          };
                        })
                      }
                      required
                    >
                      <option value="">Select degree type</option>
                      {degreeTypeOptions.map((item) => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span className={labelClass}>Stream<span className={requiredMarkClass}>*</span></span>
                    <select
                      className={inputClass}
                      value={courseStreamSelectValue}
                      onChange={(event) =>
                        setCourseForm((prev) => {
                          if (event.target.value === CUSTOM_STREAM_OPTION) {
                            setCourseCustomFieldMode({
                              stream: true,
                              specialization: false,
                              courseName: false,
                            });
                            return {
                              ...prev,
                              stream: streamOptions.includes(prev.stream) ? "" : prev.stream,
                              courseType: "",
                              specialization: "",
                              entranceExams: syncCourseExamsForStream(
                                streamOptions.includes(prev.stream) ? "" : prev.stream,
                                prev.entranceExams,
                              ),
                            };
                          }
                          setCourseCustomFieldMode({
                            stream: false,
                            specialization: false,
                            courseName: false,
                          });
                          const nextCourseTypeOptions = getCourseTypeOptionsForSelection(event.target.value, prev.degreeType);
                          const nextCourseType = nextCourseTypeOptions.includes(prev.courseType) ? prev.courseType : nextCourseTypeOptions[0] || "";

                          return {
                            ...prev,
                            stream: event.target.value,
                            courseType: nextCourseType,
                            specialization: "",
                            duration: getDefaultDuration(event.target.value, prev.degreeType) || prev.duration,
                            minimumQualification:
                              getDefaultMinimumQualification(nextCourseType, prev.degreeType, event.target.value) || prev.minimumQualification,
                            entranceExamsEnabled:
                              shouldAutoShowEntranceExams(nextCourseType, prev.degreeType, event.target.value) || prev.entranceExamsEnabled,
                            entranceExams: syncCourseExamsForStream(event.target.value, prev.entranceExams),
                          };
                        })
                      }
                      required
                    >
                      <option value="">Select stream</option>
                      {courseStreamOptionsForForm.map((item) => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span className={labelClass}>Specialization<span className={requiredMarkClass}>*</span></span>
                    <select
                      className={inputClass}
                      value={courseSpecializationSelectValue}
                      onChange={(event) =>
                        setCourseForm((prev) => {
                          if (event.target.value === CUSTOM_SPECIALIZATION_OPTION) {
                            setCourseCustomFieldMode((current) => ({
                              ...current,
                              specialization: true,
                            }));
                            return {
                              ...prev,
                              specialization: courseSpecializationOptionValues.includes(prev.specialization)
                                ? ""
                                : prev.specialization,
                            };
                          }
                          return {
                            ...prev,
                            specialization: event.target.value,
                            minimumQualification:
                              getDefaultMinimumQualification(
                                prev.courseType,
                                prev.degreeType,
                                prev.stream,
                              ) || prev.minimumQualification,
                            entranceExamsEnabled:
                              shouldAutoShowEntranceExams(
                                prev.courseType,
                                prev.degreeType,
                                prev.stream,
                              ) || prev.entranceExamsEnabled,
                          };
                        })
                      }
                      required
                    >
                      <option value="">Select specialization</option>
                      {courseSpecializationEntries.map((item) => (
                        <option key={item.label} value={item.value}>{item.label}</option>
                      ))}
                      <option value={CUSTOM_SPECIALIZATION_OPTION}>Custom specialization</option>
                    </select>
                  </label>
                  {courseSpecializationSelectValue === CUSTOM_SPECIALIZATION_OPTION ? (
                    <label>
                      <span className={labelClass}>Custom Specialization<span className={requiredMarkClass}>*</span></span>
                      <input
                        className={inputClass}
                        placeholder="Type custom specialization"
                        value={courseForm.specialization}
                        onChange={(event) =>
                          setCourseForm((prev) => ({
                            ...prev,
                            specialization: event.target.value,
                            minimumQualification:
                              getDefaultMinimumQualification(
                                prev.courseType,
                                prev.degreeType,
                                prev.stream,
                              ) || prev.minimumQualification,
                            entranceExamsEnabled:
                              shouldAutoShowEntranceExams(
                                prev.courseType,
                                prev.degreeType,
                                prev.stream,
                              ) || prev.entranceExamsEnabled,
                          }))
                        }
                        required
                      />
                      <button
                        type="button"
                        onClick={() => {
                          addCustomCourseCatalogItem({
                            stream: courseForm.stream,
                            degreeType: courseForm.degreeType,
                            courseType: courseForm.courseType,
                            specialization: courseForm.specialization,
                          });
                        }}
                        className="mt-2 inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
                      >
                        Add Custom Specialization
                      </button>
                    </label>
                  ) : null}
                  <label>
                    <span className={labelClass}>Course Name<span className={requiredMarkClass}>*</span></span>
                    <select
                      className={inputClass}
                      value={courseNameSelectValue}
                      onChange={(event) =>
                        setCourseForm((prev) => {
                          if (event.target.value === CUSTOM_COURSE_NAME_OPTION) {
                            setCourseCustomFieldMode((current) => ({
                              ...current,
                              courseName: true,
                              specialization: false,
                            }));
                            return { ...prev, courseType: courseTypeOptions.includes(prev.courseType) ? "" : prev.courseType, specialization: "" };
                          }
                          setCourseCustomFieldMode((current) => ({
                            ...current,
                            courseName: false,
                            specialization: false,
                          }));
                          return {
                            ...prev,
                            courseType: event.target.value,
                            specialization: "",
                            minimumQualification:
                              getDefaultMinimumQualification(event.target.value, prev.degreeType, prev.stream) || prev.minimumQualification,
                            entranceExamsEnabled:
                              shouldAutoShowEntranceExams(event.target.value, prev.degreeType, prev.stream) || prev.entranceExamsEnabled,
                          };
                        })
                      }
                      required
                    >
                      <option value="">Select course name</option>
                      {courseTypeOptions.map((item) => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                      <option value={CUSTOM_COURSE_NAME_OPTION}>Custom course name</option>
                    </select>
                  </label>
                  {courseNameSelectValue === CUSTOM_COURSE_NAME_OPTION ? (
                    <label>
                      <span className={labelClass}>Custom Course Name<span className={requiredMarkClass}>*</span></span>
                      <input
                        className={inputClass}
                        placeholder="Type custom course name"
                        value={courseForm.courseType}
                        onChange={(event) =>
                          setCourseForm((prev) => ({
                            ...prev,
                            courseType: event.target.value,
                            specialization: "",
                          }))
                        }
                        required
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (
                            addCustomCourseCatalogItem({
                              stream: courseForm.stream,
                              degreeType: courseForm.degreeType,
                              courseType: courseForm.courseType,
                              specialization: "",
                            })
                          ) {
                            setCourseForm((prev) => ({ ...prev, courseType: normalizeAdminOption(prev.courseType) }));
                          }
                        }}
                        className="mt-2 inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
                      >
                        Add Custom Course Name
                      </button>
                    </label>
                  ) : null}
                  <label>
                    <span className={labelClass}>Duration<span className={requiredMarkClass}>*</span></span>
                    <input className={inputClass} placeholder="4 Years" value={courseForm.duration} onChange={(event) => setCourseForm((prev) => ({ ...prev, duration: event.target.value, details: Object.fromEntries(Object.entries(prev.details).map(([collegeId, detail]) => [collegeId, { ...detail, totalFees: calculateTotalFeesFromSemesterFees(detail.semesterFees, event.target.value) || detail.totalFees }])) }))} required />
                  </label>
                  <label>
                    <span className={labelClass}>Mode<span className={requiredMarkClass}>*</span></span>
                    <select className={inputClass} value={courseForm.mode} onChange={(event) => setCourseForm((prev) => ({ ...prev, mode: event.target.value }))} required>
                      {modeOptions.map((item) => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </select>
                  </label>
                  <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={courseForm.lateralEntryAvailable}
                      onChange={(event) =>
                        setCourseForm((prev) => ({
                          ...prev,
                          lateralEntryAvailable: event.target.checked,
                          lateralEntryDetails: event.target.checked ? prev.lateralEntryDetails : "",
                        }))
                      }
                    />
                    Lateral Entry
                  </label>
                  <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={courseForm.isTopCourse}
                      onChange={(event) =>
                        setCourseForm((prev) => ({
                          ...prev,
                          isTopCourse: event.target.checked,
                        }))
                      }
                    />
                    Best Course
                  </label>
                  {courseForm.lateralEntryAvailable ? (
                    <label className="md:col-span-2">
                      <span className={labelClass}>Lateral Entry Details</span>
                      <input className={inputClass} placeholder="Diploma entry rules, direct second year..." value={courseForm.lateralEntryDetails} onChange={(event) => setCourseForm((prev) => ({ ...prev, lateralEntryDetails: event.target.value }))} />
                    </label>
                  ) : null}
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3">
                  <h3 className="text-sm font-bold text-slate-900">B, C, F, G. Fees, Eligibility, Admission, Content</h3>
                  <p className="text-xs text-slate-500">Keep shared course-level content here. College-specific fees and intake come in the next section.</p>
                </div>
                <div className={formSectionClass}>
                  <label>
                    <span className={labelClass}>Minimum Qualification<span className={requiredMarkClass}>*</span></span>
                    <input className={inputClass} list="course-qualification-options" placeholder="Grade 12 / Graduation" value={courseForm.minimumQualification} onChange={(event) => setCourseForm((prev) => ({ ...prev, minimumQualification: event.target.value }))} required />
                  </label>
                  <label>
                    <span className={labelClass}>University</span>
                    <input className={inputClass} placeholder="Affiliated or awarding university" value={courseForm.university} onChange={(event) => setCourseForm((prev) => ({ ...prev, university: event.target.value }))} />
                  </label>
                  <label className="md:col-span-2 xl:col-span-3">
                    <span className={labelClass}>Course Description</span>
                    <textarea className={inputClass} rows={3} placeholder="Short overview of course content, outcomes, and focus area..." value={courseForm.description} onChange={(event) => setCourseForm((prev) => ({ ...prev, description: event.target.value }))} />
                  </label>
                </div>
              </section>

              {courseForm.entranceExamsEnabled ? (
                <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">D. Entrance Exams</h3>
                      <p className="text-xs text-slate-500">Add one or more exams with cutoff, weightage, syllabus, or preparation notes.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setCourseForm((prev) => ({
                            ...prev,
                            entranceExamsEnabled: false,
                            entranceExams: [emptyCourseExam()],
                          }))
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-xs font-bold text-slate-700"
                        aria-label="Hide entrance exam section"
                      >
                        X
                      </button>
                      <button
                        type="button"
                        onClick={() => setCourseForm((prev) => ({ ...prev, entranceExams: [...prev.entranceExams, emptyCourseExam()] }))}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
                      >
                        <Plus className="size-4" />
                        Add Exam
                      </button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {courseForm.entranceExams.map((exam, index) => {
                      const examOptions = getExamScheduleNameOptions(courseForm.stream);
                      const examRangeConfig = resolveExamCutoffRangeConfig(courseForm.stream, exam.examName);
                      const examRangeParts = getCutoffRangeParts(exam.cutoffValue);
                      const examCutoffWarning = getCutoffLimitWarning(exam.cutoffValue, examRangeConfig);

                      return (
                        <div key={`exam-${index}`} className="rounded-2xl border border-slate-200 bg-white p-3">
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Exam {index + 1}</p>
                            {courseForm.entranceExams.length > 1 ? (
                              <button
                                type="button"
                                onClick={() =>
                                  setCourseForm((prev) => ({
                                    ...prev,
                                    entranceExams: prev.entranceExams.filter((_, examIndex) => examIndex !== index),
                                  }))
                                }
                                className="text-xs font-semibold text-rose-600"
                              >
                                Remove
                              </button>
                            ) : null}
                          </div>
                          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                            <label>
                              <span className={labelClass}>Exam Name</span>
                              <select
                                className={inputClass}
                                value={exam.examName}
                                onChange={(event) =>
                                  setCourseForm((prev) => ({
                                    ...prev,
                                    entranceExams: prev.entranceExams.map((item, examIndex) =>
                                      examIndex === index
                                        ? {
                                            ...item,
                                            examName: event.target.value,
                                            cutoffByCategory: [],
                                            cutoffScoreOrRank: "",
                                            cutoffCategory: defaultCutoffCategory,
                                            cutoffValue: "",
                                          }
                                        : item,
                                    ),
                                  }))
                                }
                              >
                                <option value="">Select exam name</option>
                                {examOptions.map((item) => (
                                  <option key={item} value={item}>
                                    {item}
                                  </option>
                                ))}
                                {exam.examName && !examOptions.includes(exam.examName) ? (
                                  <option value={exam.examName}>{exam.examName}</option>
                                ) : null}
                              </select>
                            </label>
                            <label>
                              <span className={labelClass}>Exam Weightage</span>
                              <input className={inputClass} placeholder="Exam weightage" value={exam.weightage} onChange={(event) => setCourseForm((prev) => ({ ...prev, entranceExams: prev.entranceExams.map((item, examIndex) => examIndex === index ? { ...item, weightage: event.target.value } : item) }))} />
                            </label>
                            <div className="md:col-span-2 xl:col-span-3">
                              <span className={labelClass}>Cutoff By Category</span>
                              <div className="grid gap-2 md:grid-cols-[180px_minmax(0,1fr)_auto]">
                                <select
                                  className={inputClass}
                                  value={exam.cutoffCategory}
                                  onChange={(event) =>
                                    setCourseForm((prev) => ({
                                      ...prev,
                                      entranceExams: prev.entranceExams.map((item, examIndex) =>
                                        examIndex === index
                                          ? {
                                              ...item,
                                              cutoffCategory: event.target.value,
                                              cutoffValue: getCutoffValueForCategory(item.cutoffByCategory, event.target.value),
                                            }
                                          : item,
                                      ),
                                    }))
                                  }
                                >
                                  {cutoffCategoryOptions.map((item) => (
                                    <option key={item.value} value={item.value}>{item.label}</option>
                                  ))}
                                </select>
                                <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
                                  <input
                                    className={`${inputClass} text-center`}
                                    value={examRangeParts.start}
                                    data-cutoff-input-segment="start"
                                    onChange={(event) =>
                                      setCourseForm((prev) => ({
                                        ...prev,
                                        entranceExams: prev.entranceExams.map((item, examIndex) =>
                                          examIndex === index
                                            ? {
                                                ...item,
                                                cutoffValue: buildCutoffRangeValue(event.target.value, getCutoffRangeParts(item.cutoffValue).end),
                                              }
                                            : item,
                                        ),
                                      }))
                                    }
                                    onBlur={(event) => {
                                      const shouldSkipAutoAdvance = shouldSkipEmbeddedCutoffAutoAdvance(event, "start");
                                      setCourseForm((prev) => ({
                                        ...prev,
                                        entranceExams: prev.entranceExams.map((item, examIndex) => {
                                          if (examIndex !== index) return item;
                                          const normalizedDraft = {
                                            ...item,
                                            cutoffValue: buildCutoffRangeValue(
                                              getCutoffRangeParts(item.cutoffValue).start,
                                              getCutoffRangeParts(item.cutoffValue).end,
                                            ),
                                          };
                                          if (shouldSkipAutoAdvance) {
                                            return normalizedDraft;
                                          }
                                          return buildCourseExamCutoffState(normalizedDraft, examRangeConfig) ?? normalizedDraft;
                                        }),
                                      }));
                                      setStatusText("");
                                    }}
                                    inputMode="decimal"
                                    maxLength={7}
                                  />
                                  <span className="text-base font-semibold text-slate-500">-</span>
                                  <input
                                    className={`${inputClass} text-center`}
                                    value={examRangeParts.end}
                                    data-cutoff-input-segment="end"
                                    onChange={(event) =>
                                      setCourseForm((prev) => ({
                                        ...prev,
                                        entranceExams: prev.entranceExams.map((item, examIndex) =>
                                          examIndex === index
                                            ? {
                                                ...item,
                                                cutoffValue: buildCutoffRangeValue(getCutoffRangeParts(item.cutoffValue).start, event.target.value),
                                              }
                                            : item,
                                        ),
                                      }))
                                    }
                                    onBlur={(event) => {
                                      const shouldSkipAutoAdvance = shouldSkipEmbeddedCutoffAutoAdvance(event, "end");
                                      setCourseForm((prev) => ({
                                        ...prev,
                                        entranceExams: prev.entranceExams.map((item, examIndex) => {
                                          if (examIndex !== index) return item;
                                          const normalizedDraft = {
                                            ...item,
                                            cutoffValue: buildCutoffRangeValue(
                                              getCutoffRangeParts(item.cutoffValue).start,
                                              getCutoffRangeParts(item.cutoffValue).end,
                                            ),
                                          };
                                          if (shouldSkipAutoAdvance) {
                                            return normalizedDraft;
                                          }
                                          return buildCourseExamCutoffState(normalizedDraft, examRangeConfig) ?? normalizedDraft;
                                        }),
                                      }));
                                      setStatusText("");
                                    }}
                                    inputMode="decimal"
                                    maxLength={7}
                                  />
                                </div>
                                <button
                                  type="button"
                                  data-cutoff-action="add"
                                  onClick={() => {
                                    if (!exam.cutoffCategory) {
                                      setStatusText("Select an entrance exam cutoff category");
                                      return;
                                    }
                                    if (!formatCutoffForSave(exam.cutoffValue)) {
                                      setStatusText(cutoffValidationMessage);
                                      return;
                                    }
                                    if (!isCutoffWithinRangeConfig(exam.cutoffValue, examRangeConfig)) {
                                      setStatusText(getCutoffValidationMessageForConfig(examRangeConfig));
                                      return;
                                    }
                                    setCourseForm((prev) => ({
                                      ...prev,
                                      entranceExams: prev.entranceExams.map((item, examIndex) =>
                                        examIndex === index
                                          ? buildCourseExamCutoffState(item, examRangeConfig) ?? item
                                          : item,
                                      ),
                                    }));
                                    setStatusText("");
                                  }}
                                  className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                                >
                                  Add Cutoff
                                </button>
                              </div>
                              <p className="mt-2 text-[11px] text-slate-500">
                                {getCutoffRangeHelperText(examRangeConfig)}
                              </p>
                              {examCutoffWarning ? (
                                <p className="mt-1 text-[11px] font-medium text-rose-600">{examCutoffWarning}</p>
                              ) : null}
                              {normalizeCategoryCutoffs(exam.cutoffByCategory).length > 0 ? (
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {normalizeCategoryCutoffs(exam.cutoffByCategory).map((item) => (
                                    <div key={`${index}-${item.category}`} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700">
                                      <span>{item.category}: {item.cutoff}</span>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setCourseForm((prev) => ({
                                            ...prev,
                                            entranceExams: prev.entranceExams.map((examItem, examIndex) =>
                                              examIndex === index
                                                ? removeCourseExamCutoffState(examItem, String(item.category || ""))
                                                : examItem,
                                            ),
                                          }))
                                        }
                                        className="text-rose-600 transition hover:text-rose-700"
                                        aria-label={`Remove ${item.category} cutoff`}
                                      >
                                        <Trash2 className="size-3.5" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              ) : null}
                            </div>
                            <input className={`${inputClass} md:col-span-2 xl:col-span-3`} placeholder="Specified paper / syllabus" value={exam.paperOrSyllabus} onChange={(event) => setCourseForm((prev) => ({ ...prev, entranceExams: prev.entranceExams.map((item, examIndex) => examIndex === index ? { ...item, paperOrSyllabus: event.target.value } : item) }))} />
                            <textarea className={`${inputClass} md:col-span-2 xl:col-span-3`} rows={2} placeholder="Preparation notes" value={exam.preparationNotes} onChange={(event) => setCourseForm((prev) => ({ ...prev, entranceExams: prev.entranceExams.map((item, examIndex) => examIndex === index ? { ...item, preparationNotes: event.target.value } : item) }))} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              ) : (
                <section className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setCourseForm((prev) => ({
                          ...prev,
                          entranceExamsEnabled: true,
                          entranceExams:
                            prev.entranceExams.length > 0 ? prev.entranceExams : [emptyCourseExam()],
                        }))
                      }
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
                    >
                      <Plus className="size-4" />
                      Add Entrance Exam
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setCourseForm((prev) => ({
                          ...prev,
                          entranceExamsEnabled: false,
                          entranceExams: [emptyCourseExam()],
                        }))
                      }
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600"
                    >
                      Entrance Exam Not Needed
                    </button>
                  </div>
                </section>
              )}

              {selectedCourseCollegeId ? (
                <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">
                  Adding course for{" "}
                  <span className="font-semibold text-slate-900">
                    {adminState.colleges.find((college) => college._id === selectedCourseCollegeId)?.name || "Selected College"}
                  </span>
                </div>
              ) : null}

              <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3">
                  <h3 className="text-sm font-bold text-slate-900">E. College Selection And Seat / Fee Mapping</h3>
                  <p className="text-xs text-slate-500">Pick one or more colleges, then fill each college-specific fee, cutoff, intake, and application details.</p>
                </div>
                <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                {adminState.colleges.map((college) => (
                  <label key={college._id} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
                    <input
                      type="checkbox"
                      checked={courseForm.colleges.includes(college._id)}
                      onChange={(event) =>
                        setCourseForm((prev) => ({
                          ...prev,
                          colleges: event.target.checked
                            ? [...new Set([...prev.colleges, college._id])]
                            : prev.colleges.filter((item) => item !== college._id),
                          details: {
                            ...prev.details,
                            [college._id]:
                              prev.details[college._id] || emptyCourseDetail(),
                          },
                        }))
                      }
                    />
                    {college.name || "College"}
                  </label>
                ))}
                </div>

                <div className="mt-3 space-y-3">
                  {courseForm.colleges.map((collegeId) => (
                    <div key={collegeId} className="rounded-2xl border border-slate-200 bg-white p-3">
                      <p className="mb-3 text-sm font-semibold text-slate-900">
                        {adminState.colleges.find((college) => college._id === collegeId)?.name || "Selected College"}
                      </p>
                      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                        <label>
                          <span className={labelClass}>Semester Fees<span className={requiredMarkClass}>*</span></span>
                          <input className={inputClass} placeholder="Semester fees" value={courseForm.details[collegeId]?.semesterFees || ""} onChange={(event) => setCourseForm((prev) => ({ ...prev, details: { ...prev.details, [collegeId]: { ...(prev.details[collegeId] || emptyCourseDetail()), semesterFees: event.target.value, totalFees: calculateTotalFeesFromSemesterFees(event.target.value, prev.duration) || prev.details[collegeId]?.totalFees || "" } } }))} />
                        </label>
                        <label>
                          <span className={labelClass}>Total Fees</span>
                          <input className={inputClass} placeholder="Total fees" value={courseForm.details[collegeId]?.totalFees || ""} onChange={(event) => setCourseForm((prev) => ({ ...prev, details: { ...prev.details, [collegeId]: { ...(prev.details[collegeId] || emptyCourseDetail()), totalFees: event.target.value } } }))} />
                        </label>
                        <label>
                          <span className={labelClass}>Cutoff</span>
                          <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
                            <input
                              className={`${inputClass} text-center`}
                              placeholder=""
                              value={getCutoffRangeParts(courseForm.details[collegeId]?.cutoff || "").start}
                              onChange={(event) =>
                                setCourseForm((prev) => {
                                  const parts = getCutoffRangeParts(prev.details[collegeId]?.cutoff || "");
                                  return {
                                    ...prev,
                                    details: {
                                      ...prev.details,
                                      [collegeId]: {
                                        ...(prev.details[collegeId] || emptyCourseDetail()),
                                        cutoff: buildCutoffRangeValue(event.target.value, parts.end),
                                      },
                                    },
                                  };
                                })
                              }
                              onBlur={() =>
                                setCourseForm((prev) => {
                                  const parts = getCutoffRangeParts(prev.details[collegeId]?.cutoff || "");
                                  return {
                                    ...prev,
                                    details: {
                                      ...prev.details,
                                      [collegeId]: {
                                        ...(prev.details[collegeId] || emptyCourseDetail()),
                                        cutoff: buildCutoffRangeValue(parts.start, parts.end),
                                      },
                                    },
                                  };
                                })
                              }
                              inputMode="decimal"
                              maxLength={7}
                            />
                            <span className="text-base font-semibold text-slate-500">-</span>
                            <input
                              className={`${inputClass} text-center`}
                              placeholder=""
                              value={getCutoffRangeParts(courseForm.details[collegeId]?.cutoff || "").end}
                              onChange={(event) =>
                                setCourseForm((prev) => {
                                  const parts = getCutoffRangeParts(prev.details[collegeId]?.cutoff || "");
                                  return {
                                    ...prev,
                                    details: {
                                      ...prev.details,
                                      [collegeId]: {
                                        ...(prev.details[collegeId] || emptyCourseDetail()),
                                        cutoff: buildCutoffRangeValue(parts.start, event.target.value),
                                      },
                                    },
                                  };
                                })
                              }
                              onBlur={() =>
                                setCourseForm((prev) => {
                                  const parts = getCutoffRangeParts(prev.details[collegeId]?.cutoff || "");
                                  return {
                                    ...prev,
                                    details: {
                                      ...prev.details,
                                      [collegeId]: {
                                        ...(prev.details[collegeId] || emptyCourseDetail()),
                                        cutoff: buildCutoffRangeValue(parts.start, parts.end),
                                      },
                                    },
                                  };
                                })
                              }
                              inputMode="decimal"
                              maxLength={7}
                            />
                          </div>
                          <span className="mt-1 block text-[11px] text-slate-500">
                            Use values like 190, 190.5, or 190-195. {getCutoffRangeHelperText(courseCutoffRangeConfig)}
                          </span>
                          {getCutoffLimitWarning(courseForm.details[collegeId]?.cutoff || "", courseCutoffRangeConfig) ? (
                            <span className="mt-1 block text-[11px] font-medium text-rose-600">
                              {getCutoffLimitWarning(courseForm.details[collegeId]?.cutoff || "", courseCutoffRangeConfig)}
                            </span>
                          ) : null}
                        </label>
                        <label>
                          <span className={labelClass}>Total Allotted Seats<span className={requiredMarkClass}>*</span></span>
                          <input className={inputClass} placeholder="Total allotted seats" value={courseForm.details[collegeId]?.intake || ""} onChange={(event) => setCourseForm((prev) => ({ ...prev, details: { ...prev.details, [collegeId]: { ...(prev.details[collegeId] || emptyCourseDetail()), intake: event.target.value } } }))} required />
                        </label>
                        <label>
                          <span className={labelClass}>Application Fee</span>
                          <input className={inputClass} placeholder="Application fee" value={courseForm.details[collegeId]?.applicationFee || ""} onChange={(event) => setCourseForm((prev) => ({ ...prev, details: { ...prev.details, [collegeId]: { ...(prev.details[collegeId] || emptyCourseDetail()), applicationFee: event.target.value } } }))} />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <div className="mt-3 flex gap-2">
                <button className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
                  {editCourseId ? "Update Course" : "Save Course"}
                </button>
                <button type="button" onClick={resetCourseForm} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
                  Cancel
                </button>
              </div>
            </form>
          ) : null}

          <datalist id="embedded-qualification-options">
            {embeddedQualificationOptions.map((item) => (
              <option key={item} value={item} />
            ))}
          </datalist>
          <datalist id="course-qualification-options">
            {courseQualificationOptions.map((item) => (
              <option key={item} value={item} />
            ))}
          </datalist>

          {adminState.courses.length === 0 ? (
            <div className="rounded-[1.4rem] border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
              No courses have been added yet.
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {adminState.courses.map((course) => (
                <article key={course._id} className="rounded-[1.4rem] border border-slate-200 bg-white p-4 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
                  <h3 className="text-base font-bold text-slate-900">
                    {course.courseType || course.course || "Course"}{course.specialization ? ` - ${course.specialization}` : ""}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {[course.degreeType, course.stream || course.courseCategory, course.duration, course.mode].filter(Boolean).join(" • ")}
                  </p>
                  <div className="mt-3 grid gap-2 text-xs text-slate-600 sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <span className="font-semibold text-slate-900">Eligibility:</span> {formatQualificationLabel(course.minimumQualification || "") || "Not set"}
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <span className="font-semibold text-slate-900">Colleges:</span> {(course.colleges || []).length || 0}
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const collegeIds = (course.colleges || []).map((item) => String(item._id || "")).filter(Boolean);
                        const details: CourseForm["details"] = {};
                        (course.collegeDetails || []).forEach((item) => {
                          const collegeId = typeof item.college === "string" ? item.college : String(item.college?._id || "");
                          if (!collegeId) return;
                          const detailCutoffByCategory =
                            Array.isArray(item.cutoffByCategory) && item.cutoffByCategory.length > 0
                              ? item.cutoffByCategory
                              : course.cutoffByCategory;
                          const normalizedDetailCutoffs = normalizeCategoryCutoffsWithFallback(
                            detailCutoffByCategory,
                            item.cutoff || course.cutoff || "",
                          );
                          details[collegeId] = {
                            semesterFees: String(item.semesterFees || ""),
                            totalFees: String(item.totalFees || ""),
                            cutoff: String(resolvePrimaryCategoryCutoff(normalizedDetailCutoffs, item.cutoff || course.cutoff || "")),
                            intake: String(item.intake ?? course.intake ?? ""),
                            applicationFee: String(item.applicationFee ?? course.applicationFee ?? ""),
                          };
                        });
                        setEditCourseId(course._id);
                        setShowCourseForm(true);
                        setSelectedCourseCollegeId("");
                        setCourseForm({
                          courseType: normalizeArtsScienceCourseType(
                            course.stream || course.courseCategory || "",
                            course.courseType || course.course || "",
                            course.specialization || course.courseName || "",
                          ),
                          degreeType: course.degreeType || "",
                          stream: normalizeCourseStream(course.stream || course.courseCategory || ""),
                          specialization: course.specialization || course.courseName || "",
                          duration: course.duration || "",
                          mode: course.mode || "Full-time",
                          lateralEntryAvailable: Boolean(course.lateralEntryAvailable),
                          lateralEntryDetails: course.lateralEntryDetails || "",
                          minimumQualification: formatQualificationLabel(course.minimumQualification || ""),
                          university: course.university || "",
                          admissionProcess: course.admissionProcess || "",
                          description: course.description || "",
                          isTopCourse: Boolean(course.isTopCourse),
                          entranceExamsEnabled:
                            Array.isArray(course.entranceExams) && course.entranceExams.length > 0,
                          entranceExams:
                            Array.isArray(course.entranceExams) && course.entranceExams.length > 0
                              ? course.entranceExams.map((item) => createCourseExamDraft(item))
                              : [emptyCourseExam()],
                          colleges: collegeIds,
                          details,
                        });
                        setCourseCustomFieldMode({
                          stream: !courseStreamOptionsForForm.includes(
                            normalizeCourseStream(course.stream || course.courseCategory || ""),
                          ),
                          specialization: !getSpecializationOptionsForSelection(
                            course.stream || course.courseCategory || "",
                            course.degreeType || "",
                            normalizeArtsScienceCourseType(
                              course.stream || course.courseCategory || "",
                              course.courseType || course.course || "",
                              course.specialization || course.courseName || "",
                            ),
                          )
                            .map((item) => item.value)
                            .includes(course.specialization || course.courseName || ""),
                          courseName: !getCourseTypeOptionsForSelection(
                            course.stream || course.courseCategory || "",
                            course.degreeType || "",
                          ).includes(
                            normalizeArtsScienceCourseType(
                              course.stream || course.courseCategory || "",
                              course.courseType || course.course || "",
                              course.specialization || course.courseName || "",
                            ),
                          ),
                        });
                      }}
                      className={solidBlueButtonClass}
                    >
                      <PencilLine className="size-4" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        void runAction(`course-${course._id}`, async () => {
                          const data = await request(`/api/admin/courses/${course._id}`, withAuth(token, { method: "DELETE" }));
                          setStatusText(data?.message || "Course deleted");
                          await loadAdminData(token, currentUser);
                        })
                      }
                      className={dangerButtonClass}
                    >
                      <Trash2 className="size-4" />
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {!loading && activeTab === "users" ? (
        <div className="space-y-3">
          {adminState.users.length === 0 ? (
            <div className="luxe-card p-5 text-sm text-slate-600">
              No users found right now.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-[0_8px_18px_rgba(15,23,42,0.05)]">
              <table className="min-w-[760px] text-left text-[13px] text-slate-700">
                <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600">
                  <tr>
                    <th className="px-3 py-2.5">Name</th>
                    <th className="px-3 py-2.5">Email</th>
                    <th className="px-3 py-2.5">Phone</th>
                    <th className="px-3 py-2.5">Role</th>
                    <th className="px-3 py-2.5">Joined</th>
                    <th className="px-3 py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {adminState.users.map((user) => (
                    <tr key={user._id} className="border-t border-slate-100">
                      <td className="px-3 py-2.5 font-semibold leading-5 text-slate-900">{user.name || "User"}</td>
                      <td className="px-3 py-2.5 leading-5 text-slate-700">{user.email || "-"}</td>
                      <td className="px-3 py-2.5 leading-5 text-slate-700">{user.phone || "-"}</td>
                      <td className="px-3 py-2.5 capitalize leading-5 text-slate-700">{user.role || "user"}</td>
                      <td className="px-3 py-2.5 leading-5 text-slate-700">{formatDate(user.createdAt)}</td>
                      <td className="px-3 py-2.5 text-right">
                        <button
                          type="button"
                          onClick={() => openDeleteUserDialog(user)}
                          className="inline-flex min-w-20 items-center justify-center whitespace-nowrap rounded-full bg-rose-600 px-3 py-1.5 text-[11px] font-semibold text-white"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
        <div className="space-y-3">
          {collegeChangeNotifications.map((item) => (
            <article key={item._id} className="luxe-card p-5">
              <div className="w-full min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="font-bold text-slate-900">
                    {item.payload?.name || item.requesterName || "College update"}
                  </h3>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${
                      item.status === "approved"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : item.status === "rejected"
                          ? "border-rose-200 bg-rose-50 text-rose-700"
                          : "border-amber-200 bg-amber-50 text-amber-700"
                    }`}
                  >
                    {item.status || "pending"}
                  </span>
                </div>
                <p className="mt-1 break-words text-sm text-slate-500">
                  Edited by login email: {item.requesterEmail || "-"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Updated on {formatDate(item.updatedAt || item.createdAt)}
                </p>
                <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {(item.changeSummary || []).map((change, index) => (
                    <div
                      key={`${item._id}-${change.field || index}`}
                      className="min-w-0 rounded-[0.9rem] border border-slate-200 bg-slate-50 px-3 py-3"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                        {change.label || change.field || "Field"}
                      </p>
                      <p className="mt-1 text-sm text-rose-700">
                        Before: {renderChangeValue(change.before)}
                      </p>
                      <p className="mt-0.5 text-sm text-emerald-700">
                        Now: {renderChangeValue(change.after)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          ))}
          {collegeChangeNotifications.length === 0 ? (
            <div className="rounded-[1rem] border border-dashed border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
              No field change notifications yet.
            </div>
          ) : null}
        </div>
      ) : null}

      {!loading && activeTab === "exams" ? (
        <div className="space-y-4">
          <form onSubmit={saveExamSchedule} className="luxe-card space-y-5 p-5">
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
                <select
                  className={inputClass}
                  value={examForm.examName}
                  onChange={(event) =>
                    setExamForm((prev) => ({
                      ...prev,
                      examName: event.target.value,
                    }))
                  }
                  required
                >
                  <option value="">Select exam name</option>
                  {examScheduleNameOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                  {examForm.examName && !examScheduleNameOptions.includes(examForm.examName) ? (
                    <option value={examForm.examName}>{examForm.examName}</option>
                  ) : null}
                </select>
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

          <div className="space-y-3">
            {savedExams.length > 0 ? savedExams.map((item) => (
              <article key={item.id} className="luxe-card space-y-4 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{item.examName || "Exam"}</h3>
                    <p className="text-sm text-slate-500">
                      Last updated {formatDate(item.updatedAt)}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
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
                          resultDate: item.resultDate || "",
                        });
                      }}
                      className={solidBlueButtonClass}
                    >
                      <PencilLine className="size-4" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void removeExamSchedule(item.id)}
                      className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  <div className="rounded-[1rem] border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Application Fees</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{item.applicationFees || "-"}</p>
                  </div>
                  <div className="rounded-[1rem] border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Start Date to Apply</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{formatDate(item.startDateToApply)}</p>
                  </div>
                  <div className="rounded-[1rem] border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Last Date to Apply</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{formatDate(item.lastDateToApply)}</p>
                  </div>
                  <div className="rounded-[1rem] border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Correction Date</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{formatCorrectionDateRange(item.correctionDate)}</p>
                  </div>
                  <div className="rounded-[1rem] border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Last Date for Fee Payment</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{formatDate(item.lastDateForFeePayment)}</p>
                  </div>
                  <div className="rounded-[1rem] border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Admit Card Release</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{formatDate(item.admitCardRelease)}</p>
                  </div>
                  <div className="rounded-[1rem] border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Exam Date</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{formatDate(item.examDate)}</p>
                  </div>
                  <div className="rounded-[1rem] border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Result Date</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{formatDate(item.resultDate)}</p>
                  </div>
                </div>
              </article>
            )) : (
              <div className="rounded-[1rem] border border-dashed border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
                No exam schedules added yet.
              </div>
            )}
          </div>
        </div>
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
    <Suspense fallback={null}>
      <AdminPageContent />
    </Suspense>
  );
}
