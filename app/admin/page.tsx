"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BadgeCheck,
  Bell,
  Building2,
  ExternalLink,
  FileClock,
  ImageUp,
  KeyRound,
  LayoutDashboard,
  MailOpen,
  PencilLine,
  Plus,
  Trash2,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AdminPortalShell } from "@/components/admin-portal-shell";
import {
  clearAuth,
  readAuthToken,
  readCurrentUser,
  type SafeAuthUser,
} from "@/lib/auth-storage";
import { request, withAuth } from "@/lib/api";
import {
  COLLEGE_ACCREDITATION_OPTIONS,
  INDIA_STATE_DISTRICT_MAP,
  INDIA_STATES,
} from "@/lib/india-location-data";
import {
  formatCutoffForSave,
  isValidCutoffValue,
  normalizeCutoffInput,
} from "@/lib/cutoff-utils";
import {
  formatRankingRangeForDisplay,
  formatRankingRangeForSave,
  isValidRankingRange,
  normalizeRankingRangeInput,
} from "@/lib/ranking-utils";
import { showToast } from "@/lib/toast";

type AdminUser = SafeAuthUser & { isSuperAdmin?: boolean; permissions?: string[] };
type CategoryCutoff = { category?: string; cutoff?: string };
type AdminCollege = { _id: string; name?: string; establishedYear?: string | number; ownershipType?: string; university?: string; country?: string; state?: string; city?: string; district?: string; address?: string; pincode?: string; description?: string; reviews?: string; admissionProcess?: string; applicationMode?: string; locationLink?: string; mapUrl?: string; website?: string; contactEmail?: string; alternatePhone?: string; contactPhone?: string; phone?: string; accreditation?: string; awardsRecognitions?: string; quotas?: string[] | string; brochurePdfUrl?: string; brochureUrl?: string; campusVideoUrl?: string; isBestCollege?: boolean; isTopCollege?: boolean; logo?: string; images?: string[]; image?: string; ranking?: string | number; placementRate?: string | number; feesStructure?: Record<string, unknown>; courseTags?: string; facilities?: string[] | string; scholarships?: string; placements?: { highestPackage?: string | number; averagePackage?: string | number; companiesVisited?: string | number; placementRate?: string | number }; hostelDetails?: { availability?: string; hostelType?: string; cctvAvailable?: string; boysRoomsCount?: string | number; girlsRoomsCount?: string | number; facilityOptions?: string[]; waterAvailability?: string; powerBackup?: string; internet?: { wifiAvailable?: string; speed?: string; pricing?: string }; foodAvailability?: string; foodTimings?: string; laundryService?: string; roomCleaningFrequency?: string; rules?: string; hostelFees?: { minAmount?: string | number; maxAmount?: string | number } } };
type AdminCourseExam = { examName?: string; cutoffScoreOrRank?: string; weightage?: string; paperOrSyllabus?: string; preparationNotes?: string };
type AdminCourse = { _id: string; course?: string; courseName?: string; courseType?: string; courseCategory?: string; degreeType?: string; stream?: string; specialization?: string; duration?: string; mode?: string; lateralEntryAvailable?: boolean; lateralEntryDetails?: string; minimumQualification?: string; admissionProcess?: string; applicationFee?: string | number; intake?: string | number; hostelFees?: string | number; university?: string; cutoff?: string | number; cutoffByCategory?: CategoryCutoff[]; description?: string; isTopCourse?: boolean; entranceExams?: AdminCourseExam[]; colleges?: Array<{ _id?: string; name?: string }>; collegeDetails?: Array<{ college?: string | { _id?: string; name?: string }; semesterFees?: number; totalFees?: number; hostelFees?: number; cutoff?: string; cutoffByCategory?: CategoryCutoff[]; intake?: number; applicationFee?: number }> };
type PlatformUser = { _id: string; name?: string; email?: string; phone?: string; role?: string; createdAt?: string };
type Enquiry = { _id: string; name?: string; email?: string; collegeName?: string; courseName?: string; message?: string; createdAt?: string; user?: { name?: string; email?: string } };
type RequestItem = { _id: string; requesterName?: string; requesterEmail?: string; email?: string; phone?: string; message?: string; status?: string; updatedAt?: string; actionType?: string; payload?: { name?: string; course?: string; courseName?: string; duration?: string }; grantedCollegeIds?: string[]; allowOwnCollegeCreate?: boolean };
type SubAdmin = { _id: string; email?: string; permissions?: string[]; mustResetPassword?: boolean; createdAt?: string };
type AdminState = { colleges: AdminCollege[]; courses: AdminCourse[]; users: PlatformUser[]; enquiries: Enquiry[]; collegeRequests: RequestItem[]; subAdmins: SubAdmin[] };
type SiteSettings = { homeHeroImageUrl?: string };
type CollegeForm = { name: string; establishedYear: string; ownershipType: string; university: string; country: string; state: string; city: string; district: string; address: string; pincode: string; description: string; reviews: string; admissionProcess: string; applicationMode: string; ranking: string; placementRate: string; feeMin: string; feeMax: string; locationLink: string; website: string; contactEmail: string; contactPhone: string; alternatePhone: string; accreditation: string; awardsRecognitions: string; brochurePdfUrl: string; campusVideoUrl: string; isTopCollege: boolean; logo: string; coverImage: string; images: string[]; courseTags: string; facilities: string; scholarships: string; highestPackage: string; averagePackage: string; companiesVisited: string; quotas: string; hostelAvailability: string; hostelType: string; hostelFeeMin: string; hostelFeeMax: string; cctvAvailable: string; boysRoomsCount: string; girlsRoomsCount: string; hostelFacilityOptions: string; waterAvailability: string; powerBackup: string; wifiAvailable: string; wifiSpeed: string; wifiPricing: string; foodAvailability: string; foodTimings: string; laundryService: string; roomCleaningFrequency: string; hostelRules: string };
type CourseExamForm = { examName: string; cutoffScoreOrRank: string; weightage: string; paperOrSyllabus: string; preparationNotes: string };
type CourseCollegeDetailForm = { semesterFees: string; totalFees: string; cutoff: string; intake: string; applicationFee: string };
type CourseForm = { courseType: string; degreeType: string; stream: string; specialization: string; duration: string; mode: string; lateralEntryAvailable: boolean; lateralEntryDetails: string; minimumQualification: string; university: string; admissionProcess: string; description: string; isTopCourse: boolean; entranceExamsEnabled: boolean; entranceExams: CourseExamForm[]; colleges: string[]; details: Record<string, CourseCollegeDetailForm> };
type SubAdminForm = { email: string; password: string; permissions: string[] };
type EmbeddedCourseDraft = { id?: string; courseType: string; degreeType: string; stream: string; specialization: string; duration: string; mode: string; lateralEntryAvailable: boolean; lateralEntryDetails: string; minimumQualification: string; university: string; admissionProcess: string; description: string; isTopCourse: boolean; entranceExamsEnabled: boolean; semesterFees: string; totalFees: string; cutoff: string; cutoffByCategory: CategoryCutoff[]; cutoffCategory: string; cutoffValue: string; intake: string; applicationFee: string; entranceExams: CourseExamForm[] };
type CollegeValidation = { valid: boolean; step: number; field: string; message: string };
type CourseCatalogItem = { stream: string; courseType: string; specialization: string; degreeType: string };
type CourseOption = { value: string; label: string };

const emptyState: AdminState = { colleges: [], courses: [], users: [], enquiries: [], collegeRequests: [], subAdmins: [] };
const emptyCollegeForm: CollegeForm = { name: "", establishedYear: "", ownershipType: "", university: "", country: "India", state: "", city: "", district: "", address: "", pincode: "", description: "", reviews: "", admissionProcess: "", applicationMode: "", ranking: "", placementRate: "", feeMin: "", feeMax: "", locationLink: "", website: "", contactEmail: "", contactPhone: "", alternatePhone: "", accreditation: "", awardsRecognitions: "", brochurePdfUrl: "", campusVideoUrl: "", isTopCollege: false, logo: "", coverImage: "", images: [], courseTags: "", facilities: "", scholarships: "", highestPackage: "", averagePackage: "", companiesVisited: "", hostelAvailability: "not_available", hostelType: "", hostelFeeMin: "", hostelFeeMax: "", cctvAvailable: "", boysRoomsCount: "", girlsRoomsCount: "", hostelFacilityOptions: "", waterAvailability: "", powerBackup: "", wifiAvailable: "", wifiSpeed: "", wifiPricing: "", foodAvailability: "not_available", foodTimings: "", laundryService: "", roomCleaningFrequency: "", hostelRules: "", quotas: "" };
const emptyCourseExam = (): CourseExamForm => ({ examName: "", cutoffScoreOrRank: "", weightage: "", paperOrSyllabus: "", preparationNotes: "" });
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
const emptyCourseDetail = (): CourseCollegeDetailForm => ({ semesterFees: "", totalFees: "", cutoff: "", intake: "", applicationFee: "" });
const emptyCourseForm: CourseForm = { courseType: "", degreeType: "", stream: "", specialization: "", duration: "", mode: "Full-time", lateralEntryAvailable: false, lateralEntryDetails: "", minimumQualification: "", university: "", admissionProcess: "", description: "", isTopCourse: false, entranceExamsEnabled: false, entranceExams: [emptyCourseExam()], colleges: [], details: {} };
const emptyEmbeddedCourseDraft = (): EmbeddedCourseDraft => ({
  courseType: "",
  degreeType: "",
  stream: "",
  specialization: "",
  duration: "",
  mode: "Full-time",
  lateralEntryAvailable: false,
  lateralEntryDetails: "",
  minimumQualification: "",
  university: "",
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
const emptySubAdminForm: SubAdminForm = { email: "", password: "", permissions: [] };
const normalizeIndianPhoneInput = (value: string) => {
  const digits = value.replace(/\D/g, "");
  if (digits.length > 10 && digits.startsWith("91")) return digits.slice(2, 12);
  return digits.slice(0, 10);
};
const isValidIndianPhone = (value: string) => /^[6-9]\d{9}$/.test(value);
const adminModules = ["colleges", "college-requests", "users", "enquiries"];
const adminModuleLabels: Record<string, string> = {
  colleges: "Colleges",
  "college-requests": "College Requests",
  users: "Users",
  enquiries: "Enquiries",
};
const inputClass = "w-full rounded-[1rem] border border-[rgba(148,163,184,0.24)] bg-[linear-gradient(180deg,#ffffff_0%,#fbfdff_100%)] px-3.5 py-2.5 text-xs text-slate-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_6px_16px_rgba(148,163,184,0.06)] outline-none transition placeholder:text-slate-400 focus:border-[rgba(56,189,248,0.38)] focus:ring-4 focus:ring-sky-100 sm:text-sm";
const labelClass = "mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500";
const primaryButtonClass = "inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#0f4c81_0%,#38bdf8_100%)] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(56,189,248,0.24)] transition duration-200 hover:shadow-[0_18px_34px_rgba(56,189,248,0.28)]";
const softButtonClass = "inline-flex items-center gap-2 rounded-full border border-[rgba(37,99,235,0.3)] bg-white px-4 py-2.5 text-sm font-semibold text-[#2563eb] shadow-[0_10px_20px_rgba(37,99,235,0.08)] transition duration-200 hover:bg-[#3b82f6] hover:text-white hover:border-[#3b82f6] hover:shadow-[0_12px_24px_rgba(37,99,235,0.18)]";
const solidBlueButtonClass = "inline-flex items-center gap-2 rounded-full border border-[rgba(37,99,235,0.3)] bg-[#3b82f6] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(37,99,235,0.16)] transition duration-200 hover:bg-white hover:text-[#2563eb] hover:border-[rgba(37,99,235,0.34)] hover:shadow-[0_12px_24px_rgba(37,99,235,0.12)]";
const dangerButtonClass = "inline-flex items-center gap-2 rounded-full border border-[rgba(251,191,36,0.22)] bg-[linear-gradient(135deg,#fff8e7_0%,#fff0d2_100%)] px-4 py-2.5 text-sm font-semibold text-[#9a6700] shadow-[0_8px_18px_rgba(251,191,36,0.12)] transition duration-200 hover:bg-[linear-gradient(135deg,#fff4d6_0%,#ffebc2_100%)]";
const requiredMarkClass = "ml-1 text-rose-500";
const errorTextClass = "mt-1 block text-[11px] font-medium text-rose-600";
const formSectionClass = "grid gap-2 md:grid-cols-2 xl:grid-cols-3";
const ownershipTypeOptions = ["Private", "Government", "Deemed"];
const applicationModeOptions = ["Online", "Offline", "Online & Offline"];
const degreeTypeOptions = ["UG", "PG", "Diploma", "Certificate", "Doctorate"];
const streamOptions = ["Engineering", "Computer / IT", "Science", "Medical / Health", "Paramedical", "Commerce", "Management", "Arts", "Law", "Design", "Agriculture", "Aviation", "Hotel Management", "Education", "Social Work", "Physical Education & Sports", "Vocational Courses", "Diploma / ITI"];
const modeOptions = ["Full-time", "Part-time", "Distance", "Online", "Hybrid"];
const qualificationLabelMap: Record<string, string> = {
  "10th": "Secondary School (10th)",
  "10+2": "Higher Secondary (10+2)",
  Diploma: "Diploma",
  Graduation: "Graduation",
  "Post Graduation": "Post Graduation",
};
const qualificationOptions = Object.values(qualificationLabelMap);
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
  { stream: "Computer / IT", courseType: "BCA", specialization: "General", degreeType: "UG" },
  { stream: "Computer / IT", courseType: "BCA", specialization: "Data Science", degreeType: "UG" },
  { stream: "Computer / IT", courseType: "BCA", specialization: "Artificial Intelligence", degreeType: "UG" },
  { stream: "Computer / IT", courseType: "BCA", specialization: "Cyber Security", degreeType: "UG" },
  { stream: "Computer / IT", courseType: "BCA", specialization: "Cloud Computing", degreeType: "UG" },
  { stream: "Computer / IT", courseType: "BCA", specialization: "Blockchain Technology", degreeType: "UG" },
  { stream: "Computer / IT", courseType: "BCA", specialization: "Game Development", degreeType: "UG" },
  { stream: "Computer / IT", courseType: "BCA", specialization: "Web Development", degreeType: "UG" },
  { stream: "Science", courseType: "B.Sc", specialization: "Computer Science", degreeType: "UG" },
  { stream: "Science", courseType: "B.Sc", specialization: "Information Technology", degreeType: "UG" },
  { stream: "Science", courseType: "B.Sc", specialization: "Software Engineering", degreeType: "UG" },
  { stream: "Science", courseType: "B.Sc", specialization: "Data Analytics", degreeType: "UG" },
  { stream: "Science", courseType: "B.Sc", specialization: "Artificial Intelligence", degreeType: "UG" },
  { stream: "Science", courseType: "B.Sc", specialization: "Cyber Security", degreeType: "UG" },
  { stream: "Science", courseType: "B.Sc", specialization: "Animation & Multimedia", degreeType: "UG" },
  { stream: "Science", courseType: "B.Sc", specialization: "Physics", degreeType: "UG" },
  { stream: "Science", courseType: "B.Sc", specialization: "Chemistry", degreeType: "UG" },
  { stream: "Science", courseType: "B.Sc", specialization: "Mathematics", degreeType: "UG" },
  { stream: "Science", courseType: "B.Sc", specialization: "Statistics", degreeType: "UG" },
  { stream: "Science", courseType: "B.Sc", specialization: "Biotechnology", degreeType: "UG" },
  { stream: "Science", courseType: "B.Sc", specialization: "Microbiology", degreeType: "UG" },
  { stream: "Science", courseType: "B.Sc", specialization: "Biochemistry", degreeType: "UG" },
  { stream: "Science", courseType: "B.Sc", specialization: "Genetics", degreeType: "UG" },
  { stream: "Science", courseType: "B.Sc", specialization: "Zoology", degreeType: "UG" },
  { stream: "Science", courseType: "B.Sc", specialization: "Botany", degreeType: "UG" },
  { stream: "Science", courseType: "B.Sc", specialization: "Environmental Science", degreeType: "UG" },
  { stream: "Science", courseType: "B.Sc", specialization: "Food Science", degreeType: "UG" },
  { stream: "Science", courseType: "B.Sc", specialization: "Nutrition & Dietetics", degreeType: "UG" },
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
  { stream: "Commerce", courseType: "B.Com", specialization: "General", degreeType: "UG" },
  { stream: "Commerce", courseType: "B.Com", specialization: "Accounting & Finance", degreeType: "UG" },
  { stream: "Commerce", courseType: "B.Com", specialization: "Banking & Insurance", degreeType: "UG" },
  { stream: "Commerce", courseType: "B.Com", specialization: "Corporate Secretaryship", degreeType: "UG" },
  { stream: "Commerce", courseType: "B.Com", specialization: "Computer Applications", degreeType: "UG" },
  { stream: "Commerce", courseType: "B.Com", specialization: "Taxation", degreeType: "UG" },
  { stream: "Commerce", courseType: "B.Com", specialization: "E-Commerce", degreeType: "UG" },
  { stream: "Management", courseType: "BBA", specialization: "General", degreeType: "UG" },
  { stream: "Management", courseType: "BBA", specialization: "Marketing", degreeType: "UG" },
  { stream: "Management", courseType: "BBA", specialization: "Finance", degreeType: "UG" },
  { stream: "Management", courseType: "BBA", specialization: "Human Resource", degreeType: "UG" },
  { stream: "Management", courseType: "BBA", specialization: "Logistics", degreeType: "UG" },
  { stream: "Management", courseType: "BBA", specialization: "International Business", degreeType: "UG" },
  { stream: "Management", courseType: "BBA", specialization: "Aviation Management", degreeType: "UG" },
  { stream: "Arts", courseType: "B.A", specialization: "English", degreeType: "UG" },
  { stream: "Arts", courseType: "B.A", specialization: "Tamil", degreeType: "UG" },
  { stream: "Arts", courseType: "B.A", specialization: "Hindi", degreeType: "UG" },
  { stream: "Arts", courseType: "B.A", specialization: "History", degreeType: "UG" },
  { stream: "Arts", courseType: "B.A", specialization: "Political Science", degreeType: "UG" },
  { stream: "Arts", courseType: "B.A", specialization: "Sociology", degreeType: "UG" },
  { stream: "Arts", courseType: "B.A", specialization: "Psychology", degreeType: "UG" },
  { stream: "Arts", courseType: "B.A", specialization: "Economics", degreeType: "UG" },
  { stream: "Arts", courseType: "B.A", specialization: "Journalism", degreeType: "UG" },
  { stream: "Arts", courseType: "B.A", specialization: "Public Administration", degreeType: "UG" },
  { stream: "Arts", courseType: "B.A", specialization: "Philosophy", degreeType: "UG" },
  { stream: "Arts", courseType: "B.A", specialization: "Geography", degreeType: "UG" },
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
  Medical: { UG: "5.5 Years", PG: "3 Years", Diploma: "2 Years", Certificate: "1 Year", Doctorate: "3 Years" },
  Law: { UG: "3 Years", PG: "2 Years", Diploma: "1 Year", Certificate: "6 Months", Doctorate: "3 Years" },
  Design: { UG: "4 Years", PG: "2 Years", Diploma: "2 Years", Certificate: "6 Months", Doctorate: "3 Years" },
  Education: { UG: "3 Years", PG: "2 Years", Diploma: "2 Years", Certificate: "1 Year", Doctorate: "3 Years" },
  Paramedical: { UG: "4 Years", PG: "2 Years", Diploma: "2 Years", Certificate: "1 Year", Doctorate: "3 Years" },
  "Computer Applications": { UG: "3 Years", PG: "2 Years", Diploma: "2 Years", Certificate: "6 Months", Doctorate: "3 Years" },
};
const streamCourseNameByDegreeType: Record<string, Partial<Record<string, string>>> = {
  Engineering: { UG: "B.E", PG: "M.E", Diploma: "Diploma in Engineering", Certificate: "Certificate in Engineering", Doctorate: "Ph.D" },
  Management: { UG: "BBA", PG: "MBA", Diploma: "Diploma in Management", Certificate: "Certificate in Management", Doctorate: "Ph.D" },
  Arts: { UG: "B.A", PG: "M.A", Diploma: "Diploma in Arts", Certificate: "Certificate in Arts", Doctorate: "Ph.D" },
  Science: { UG: "B.Sc", PG: "M.Sc", Diploma: "Diploma in Science", Certificate: "Certificate in Science", Doctorate: "Ph.D" },
  Commerce: { UG: "B.Com", PG: "M.Com", Diploma: "Diploma in Commerce", Certificate: "Certificate in Commerce", Doctorate: "Ph.D" },
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
  getDefaultCourseName(stream, degreeType) || currentValue;
const formatQualificationLabel = (value?: string) => qualificationLabelMap[String(value || "").trim()] || String(value || "").trim();
const getDefaultMinimumQualification = (courseName: string, degreeType: string, stream: string) => {
  const normalizedCourse = courseName.trim().toUpperCase();
  const normalizedStream = stream.trim();

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
  if (degreeType === "Certificate") return formatQualificationLabel(normalizedStream === "Medical" ? "10+2" : "10th");
  return formatQualificationLabel("10+2");
};
const getQualificationSuggestions = (courseName: string, degreeType: string, stream: string) => {
  const highestRequired = getDefaultMinimumQualification(courseName, degreeType, stream);
  return Array.from(new Set(highestRequired ? [highestRequired] : qualificationOptions));
};
const normalizeAdminOption = (value?: string) => String(value || "").trim();
const streamAliasMap: Record<string, string> = {
  "Computer Applications": "Computer / IT",
  Medical: "Medical / Health",
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
  const normalizedStream = stream.trim();

  if (["Engineering", "Medical", "Law"].includes(normalizedStream)) return true;
  if (normalizedStream === "Management" && degreeType === "PG") return true;
  return ["B.E", "B.TECH", "M.E", "M.TECH", "MBBS", "M.D", "LLB", "LLM", "MBA", "MCA"].includes(normalizedCourse);
};

const formatDate = (value?: string) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "-";

const formatFeeRange = (value?: Record<string, unknown>) => {
  const tuition = ((value?.tuitionFee as Record<string, unknown> | undefined) || value || {}) as Record<string, unknown>;
  return { min: String(tuition.minAmount ?? value?.minAmount ?? "").trim(), max: String(tuition.maxAmount ?? value?.maxAmount ?? "").trim() };
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
  "Basic Info",
  "Location",
  "Contact",
  "Media",
  "Highlights",
  "Facilities",
  "Admission",
  "Placement",
  "Hostel",
  "Courses",
];

const facilityQuickOptions = ["Library", "Sports", "WiFi", "Labs", "Transport", "Cafeteria"];

export default function AdminPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const token = readAuthToken() || "";
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [adminState, setAdminState] = useState<AdminState>(emptyState);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({});
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "overview");
  const [statusText, setStatusText] = useState("");
  const lastToastMessageRef = useRef("");
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
  const [courseForm, setCourseForm] = useState<CourseForm>(emptyCourseForm);
  const [selectedCourseCollegeId, setSelectedCourseCollegeId] = useState("");
  const [embeddedCourses, setEmbeddedCourses] = useState<EmbeddedCourseDraft[]>([]);
  const [embeddedCourseForm, setEmbeddedCourseForm] = useState<EmbeddedCourseDraft>(emptyEmbeddedCourseDraft);
  const [showEmbeddedCourseEditor, setShowEmbeddedCourseEditor] = useState(false);
  const [editingEmbeddedCourseIndex, setEditingEmbeddedCourseIndex] = useState<number | null>(null);
  const [showSavedCourseList, setShowSavedCourseList] = useState(false);
  const [showSubAdminForm, setShowSubAdminForm] = useState(false);
  const [editSubAdminId, setEditSubAdminId] = useState("");
  const [subAdminForm, setSubAdminForm] = useState<SubAdminForm>(emptySubAdminForm);
  const [isSendingPasswordLink, setIsSendingPasswordLink] = useState(false);
  const [homeHeroImageFile, setHomeHeroImageFile] = useState<File | null>(null);
  const [isUploadingHomeHeroImage, setIsUploadingHomeHeroImage] = useState(false);
  useEffect(() => {
    if (!statusText || statusText === lastToastMessageRef.current) return;
    showToast(statusText, "info");
    lastToastMessageRef.current = statusText;
  }, [statusText]);
  const [customFacilityInput, setCustomFacilityInput] = useState("");
  const [showRequestNotifications, setShowRequestNotifications] = useState(false);
  const [expandedCollegeIds, setExpandedCollegeIds] = useState<string[]>([]);
  const [showAllCollegeCards, setShowAllCollegeCards] = useState(false);
  const logoPreviewUrl = useMemo(
    () => (logoFile ? URL.createObjectURL(logoFile) : collegeForm.logo || ""),
    [collegeForm.logo, logoFile],
  );
  const coverImagePreviewUrl = useMemo(
    () => (coverImageFile ? URL.createObjectURL(coverImageFile) : collegeForm.coverImage || ""),
    [collegeForm.coverImage, coverImageFile],
  );
  const homeHeroPreviewUrl = useMemo(
    () =>
      homeHeroImageFile
        ? URL.createObjectURL(homeHeroImageFile)
        : String(siteSettings.homeHeroImageUrl || "").trim(),
    [homeHeroImageFile, siteSettings.homeHeroImageUrl],
  );
  const selectedFacilities = useMemo(
    () =>
      collegeForm.facilities
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    [collegeForm.facilities],
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
  const getCourseTypeOptionsForSelection = useCallback(
    (stream: string, degreeType: string) => {
      const normalizedStream = normalizeCourseStream(stream);
      const catalogOptions = courseCatalog
        .filter((item) => (!normalizedStream || item.stream === normalizedStream) && (!degreeType || item.degreeType === degreeType))
        .map((item) => item.courseType);
      const existingOptions = adminState.courses.flatMap((course) => {
        if (normalizeCourseStream(course.stream) !== normalizedStream) return [];
        if (degreeType && normalizeAdminOption(course.degreeType) !== degreeType) return [];
        return [normalizeAdminOption(course.courseType)].filter(Boolean);
      });

      return Array.from(new Set([...catalogOptions, ...existingOptions]));
    },
    [adminState.courses],
  );
  const getSpecializationOptionsForSelection = useCallback(
    (stream: string, degreeType: string, courseType: string) => {
      const normalizedStream = normalizeCourseStream(stream);
      const catalogOptions = courseCatalog
        .filter((item) =>
          (!normalizedStream || item.stream === normalizedStream) &&
          (!degreeType || item.degreeType === degreeType) &&
          (!courseType || item.courseType === courseType),
        )
        .map((item) => ({
          value: item.specialization,
          label: item.specialization === item.courseType ? item.courseType : `${item.courseType} - ${item.specialization}`,
        }));
      const existingOptions = adminState.courses.flatMap((course) => {
        if (normalizeCourseStream(course.stream) !== normalizedStream) return [];
        if (degreeType && normalizeAdminOption(course.degreeType) !== degreeType) return [];
        if (courseType && normalizeAdminOption(course.courseType) !== courseType) return [];

        const specialization = normalizeAdminOption(course.specialization || course.courseName);
        const existingCourseType = normalizeAdminOption(course.courseType);
        if (!specialization) return [];

        return [{
          value: specialization,
          label: specialization === existingCourseType ? existingCourseType : `${existingCourseType} - ${specialization}`,
        }];
      });

      const optionMap = new Map<string, CourseOption>();
      [...catalogOptions, ...existingOptions].forEach((item) => {
        if (!item.value) return;
        optionMap.set(item.value, item);
      });

      return Array.from(optionMap.values());
    },
    [adminState.courses],
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
  const embeddedResolvedCourseName = useMemo(
    () => embeddedCourseForm.courseType,
    [embeddedCourseForm.courseType],
  );
  const courseResolvedCourseName = useMemo(
    () => courseForm.courseType,
    [courseForm.courseType],
  );

  const canAccess = useCallback(
    (module: string) =>
      Boolean(currentUser?.isSuperAdmin || currentUser?.permissions?.includes(module)),
    [currentUser],
  );

  const navItems = useMemo(
    () => [
      { id: "overview", label: "Overview", icon: LayoutDashboard },
      ...(canAccess("colleges")
        ? [{ id: "colleges", label: "Colleges", icon: Building2 }]
        : []),
      ...(canAccess("college-requests")
        ? [{ id: "college-requests", label: "College Requests", icon: FileClock }]
        : []),
      ...(canAccess("users")
        ? [{ id: "users", label: "Users", icon: UserRound }]
        : []),
      ...(canAccess("enquiries")
        ? [{ id: "enquiries", label: "Enquiries", icon: MailOpen }]
        : []),
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
        canRead("colleges") ? request("/api/admin/colleges", withAuth(authToken)) : Promise.resolve({}),
        canRead("courses") ? request("/api/admin/courses", withAuth(authToken)) : Promise.resolve({}),
        canRead("users") ? request("/api/admin/users", withAuth(authToken)) : Promise.resolve({}),
        canRead("enquiries") ? request("/api/admin/enquiries", withAuth(authToken)) : Promise.resolve({}),
        canRead("college-requests") ? request("/api/admin/college-add-requests", withAuth(authToken)) : Promise.resolve({}),
        nextUser.isSuperAdmin ? request("/api/admin/sub-admins", withAuth(authToken)).catch(() => ({})) : Promise.resolve({}),
        request("/api/admin/site-settings", withAuth(authToken)).catch(() => ({})),
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
  }, [router]);

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
    const nextTab = searchParams.get("tab") || "overview";
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
      if (homeHeroImageFile && homeHeroPreviewUrl) URL.revokeObjectURL(homeHeroPreviewUrl);
      collegeImagePreviews.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [collegeImagePreviews, coverImageFile, coverImagePreviewUrl, homeHeroImageFile, homeHeroPreviewUrl, logoFile, logoPreviewUrl]);

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
      courseType: course.courseType || "",
      degreeType: course.degreeType || "",
      stream: course.stream || course.courseCategory || "",
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
          ? course.entranceExams.map((item) => ({
              examName: item.examName || "",
              cutoffScoreOrRank: item.cutoffScoreOrRank || "",
              weightage: item.weightage || "",
              paperOrSyllabus: item.paperOrSyllabus || "",
              preparationNotes: item.preparationNotes || "",
            }))
          : [emptyCourseExam()],
    };
  };

  const buildEmbeddedCoursesForCollege = (collegeId: string) =>
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
      .map((course) => buildEmbeddedCourseDraft(course, collegeId));

  const resetEmbeddedCourseEditor = () => {
    setEmbeddedCourseForm(emptyEmbeddedCourseDraft());
    setEditingEmbeddedCourseIndex(null);
    setShowEmbeddedCourseEditor(false);
  };

  const buildEmbeddedCourseCutoffState = (draft: EmbeddedCourseDraft) => {
    const category = String(draft.cutoffCategory || "").trim().toUpperCase();
    const cutoffValue = formatCutoffForSave(draft.cutoffValue);
    if (!category || !cutoffValue || !isValidCutoffValue(cutoffValue)) {
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
        .map((exam) => ({
          examName: exam.examName.trim(),
          cutoffScoreOrRank: exam.cutoffScoreOrRank.trim(),
          weightage: exam.weightage.trim(),
          paperOrSyllabus: exam.paperOrSyllabus.trim(),
          preparationNotes: exam.preparationNotes.trim(),
        }))
        .filter((exam) =>
          [exam.examName, exam.cutoffScoreOrRank, exam.weightage, exam.paperOrSyllabus, exam.preparationNotes]
            .some(Boolean),
        ),
    };

    setEmbeddedCourses((prev) => {
      const next = [...prev];
      if (editingEmbeddedCourseIndex !== null && next[editingEmbeddedCourseIndex]) {
        next[editingEmbeddedCourseIndex] = normalizedDraft;
        return next;
      }
      return [...next, normalizedDraft];
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

  const clearCollegeFieldError = (field: string) => {
    setCollegeFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

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

  const uploadHomeHeroImage = async () => {
    if (!token || !currentUser?.isSuperAdmin || !homeHeroImageFile || isUploadingHomeHeroImage) {
      return;
    }

    setIsUploadingHomeHeroImage(true);
    try {
      const formData = new FormData();
      formData.append("homeHeroImage", homeHeroImageFile);

      const data = await request("/api/admin/site-settings/home-hero-image", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      setSiteSettings((data as { settings?: SiteSettings })?.settings || {});
      setHomeHeroImageFile(null);
      setStatusText(
        (data as { message?: string })?.message || "Home page background image updated",
      );
    } catch (error) {
      setStatusText(
        error instanceof Error ? error.message : "Unable to update home page background image",
      );
    } finally {
      setIsUploadingHomeHeroImage(false);
    }
  };

  const validateCollegeForm = (nextLogo: string, nextCoverImage: string, nextImages: string[]) => {
    const validations: CollegeValidation[] = [
      { valid: Boolean(collegeForm.name.trim()), step: 0, field: "name", message: "Basic Info: College name is required" },
      { valid: Boolean(collegeForm.description.trim()), step: 0, field: "description", message: "Basic Info: Description is required" },
      { valid: Boolean(collegeForm.establishedYear.trim()), step: 0, field: "establishedYear", message: "Basic Info: Established year is required" },
      { valid: Boolean(collegeForm.university.trim()), step: 0, field: "university", message: "Basic Info: University / affiliation is required" },
      { valid: Boolean(collegeForm.country.trim()), step: 1, field: "country", message: "Location: Country is required" },
      { valid: Boolean(collegeForm.state.trim()), step: 1, field: "state", message: "Location: State is required" },
      { valid: Boolean(collegeForm.city.trim()), step: 1, field: "city", message: "Location: City is required" },
      { valid: Boolean(collegeForm.address.trim()), step: 1, field: "address", message: "Location: Address is required" },
      { valid: Boolean(collegeForm.pincode.trim()), step: 1, field: "pincode", message: "Location: Pincode is required" },
      { valid: Boolean(collegeForm.contactEmail.trim()), step: 2, field: "contactEmail", message: "Contact: Official email is required" },
      { valid: Boolean(collegeForm.contactPhone.trim()), step: 2, field: "contactPhone", message: "Contact: Phone number is required" },
      { valid: !collegeForm.contactPhone.trim() || isValidIndianPhone(collegeForm.contactPhone.trim()), step: 2, field: "contactPhone", message: "Contact: Enter a valid 10 digit mobile number" },
      { valid: !collegeForm.alternatePhone.trim() || isValidIndianPhone(collegeForm.alternatePhone.trim()), step: 2, field: "alternatePhone", message: "Contact: Enter a valid 10 digit alternate number" },
      { valid: Boolean(nextLogo.trim()), step: 3, field: "logo", message: "Media: College logo is required" },
      { valid: Boolean(nextCoverImage.trim()), step: 3, field: "coverImage", message: "Media: Cover image is required" },
      { valid: nextImages.length >= 2, step: 3, field: "images", message: "Media: At least 2 gallery images are required" },
      { valid: nextImages.length <= 7, step: 3, field: "images", message: "Media: Maximum 7 gallery images allowed" },
      {
        valid: !String(collegeForm.ranking || "").trim() || isValidRankingRange(collegeForm.ranking),
        step: 4,
        field: "ranking",
        message: "Highlights: Use NIRF format like 101-150. Both numbers must be between 1 and 9999.",
      },
      {
        valid: Boolean(collegeForm.feeMin.trim()) && Boolean(collegeForm.feeMax.trim()),
        step: 6,
        field: "feeMin",
        message: "Admission: Minimum fee and maximum fee are required",
      },
      { valid: Boolean(collegeForm.admissionProcess.trim()), step: 6, field: "admissionProcess", message: "Admission: Admission process is required" },
      { valid: Boolean(collegeForm.applicationMode.trim()), step: 6, field: "applicationMode", message: "Admission: Application mode is required" },
    ];

    if (hasHostelFacility) {
      validations.push(
        { valid: Boolean(collegeForm.hostelType.trim()), step: 8, field: "hostelType", message: "Hostel: Hostel type is required" },
        {
          valid: Boolean(collegeForm.hostelFeeMin.trim()) || Boolean(collegeForm.hostelFeeMax.trim()),
          step: 8,
          field: "hostelFeeMin",
          message: "Hostel: Hostel fee structure is required",
        },
        { valid: Boolean(collegeForm.cctvAvailable.trim()), step: 8, field: "cctvAvailable", message: "Hostel: CCTV availability is required" },
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
    resetEmbeddedCourseEditor();
  };

  const resetCourseForm = () => {
    setShowCourseForm(false);
    setEditCourseId("");
    setSelectedCourseCollegeId("");
    setCourseForm(emptyCourseForm);
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

      const data = await request(
        editCourseId ? `/api/admin/courses/${editCourseId}` : "/api/admin/courses",
        withAuth(token, {
          method: editCourseId ? "PUT" : "POST",
          body: JSON.stringify({
            course: `${courseForm.courseType} - ${courseForm.stream} - ${courseForm.specialization}`,
            courseType: courseResolvedCourseName.trim(),
            courseCategory: courseForm.stream.trim(),
            courseName: courseForm.specialization.trim(),
            degreeType: courseForm.degreeType.trim(),
            stream: courseForm.stream.trim(),
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
            entranceExams: courseForm.entranceExams.filter((item) =>
              [item.examName, item.cutoffScoreOrRank, item.weightage, item.paperOrSyllabus, item.preparationNotes]
                .some((value) => String(value || "").trim()),
            ),
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
            isBestCollege: collegeForm.isTopCollege,
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
      if (savedCollegeId && embeddedCourses.length > 0) {
        for (const draft of embeddedCourses) {
          const payload = {
            course: `${getResolvedCourseName(draft.stream, draft.degreeType, draft.courseType)} - ${draft.stream} - ${draft.specialization}`,
            courseType: getResolvedCourseName(draft.stream, draft.degreeType, draft.courseType),
            courseCategory: draft.stream,
            courseName: draft.specialization,
            degreeType: draft.degreeType,
            stream: draft.stream,
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

    await runAction(editSubAdminId || "sub-admin-new", async () => {
      const data = await request(
        editSubAdminId ? `/api/admin/sub-admins/${editSubAdminId}` : "/api/admin/sub-admins",
        withAuth(token, {
          method: editSubAdminId ? "PUT" : "POST",
          body: JSON.stringify({
            email: subAdminForm.email.trim(),
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
      label: "Pending Reviews",
      value: adminState.collegeRequests.length,
      icon: FileClock,
      helper: "Requests waiting for action",
      accent: "Approval Queue",
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
  const pendingRequestNotifications = [
    ...adminState.collegeRequests
      .filter((item) => (item.status || "pending") === "pending")
      .map((item) => ({
        id: `college-${item._id}`,
        kind: "College Request",
        name: item.payload?.name || item.requesterName || "College request",
        email: item.requesterEmail || "-",
        tab: "college-requests",
      })),
  ];
  const embeddedCutoffRangeParts = getCutoffRangeParts(embeddedCourseForm.cutoffValue);

  return (
    <AdminPortalShell
      currentUser={currentUser}
      navItems={navItems}
      activeTab={activeTab}
      onChangeTab={handleTabChange}
      headerActions={
        <div className="flex items-center gap-3">
          {currentUser?.isSuperAdmin ? (
            <button
              type="button"
              onClick={() => void sendSuperAdminPasswordChangeLink()}
              disabled={isSendingPasswordLink}
              className="inline-flex items-center justify-center rounded-[1rem] border border-[rgba(15,76,129,0.14)] bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:border-[rgba(15,76,129,0.24)] hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
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
              onClick={() => setShowRequestNotifications((prev) => !prev)}
              className="relative inline-flex items-center justify-center rounded-[1rem] border border-[rgba(56,189,248,0.18)] bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:border-[rgba(56,189,248,0.28)] hover:bg-sky-50 sm:text-sm"
            >
              <Bell className="size-4" />
              <span className="ml-2">Requests</span>
              {pendingRequestNotifications.length > 0 ? (
                <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {pendingRequestNotifications.length}
                </span>
              ) : null}
            </button>
            {showRequestNotifications ? (
              <div className="absolute right-0 top-[calc(100%+0.6rem)] z-30 w-[22rem] rounded-[1.25rem] border border-white/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(247,250,255,0.96))] p-3 shadow-[0_24px_48px_rgba(148,163,184,0.2)] backdrop-blur-sm">
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--brand-primary)]">
                      Notifications
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-900">College Requests</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowRequestNotifications(false)}
                    className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600"
                  >
                    Close
                  </button>
                </div>
                <div className="mt-3 max-h-[22rem] space-y-2 overflow-y-auto">
                  {pendingRequestNotifications.length > 0 ? (
                    pendingRequestNotifications.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setShowRequestNotifications(false);
                          handleTabChange(item.tab);
                        }}
                        className="w-full rounded-[1rem] border border-[rgba(15,76,129,0.08)] bg-white px-3.5 py-3 text-left transition hover:bg-[rgba(15,76,129,0.04)]"
                      >
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--brand-primary)]">
                          {item.kind}
                        </p>
                        <p className="mt-1 text-sm font-bold text-slate-900">{item.name}</p>
                        <p className="mt-1 text-xs text-slate-500">{item.email}</p>
                      </button>
                    ))
                  ) : (
                    <div className="rounded-[1rem] border border-dashed border-[rgba(15,76,129,0.14)] bg-white px-4 py-8 text-center text-sm text-slate-500">
                      No pending college requests.
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
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={`admin-skeleton-${index}`} className="h-28 rounded-[1.5rem] border border-white/80 bg-[linear-gradient(135deg,#ffffff_0%,#f3f8ff_100%)] shadow-[0_16px_28px_rgba(148,163,184,0.1)]" />
          ))}
        </div>
      ) : null}

      {!loading && activeTab === "overview" ? (
        <div className="space-y-4">
          <article className="overflow-hidden rounded-[1.6rem] border border-[rgba(15,76,129,0.1)] bg-[linear-gradient(135deg,#ffffff_0%,#f5faff_100%)] p-5 shadow-[0_24px_48px_rgba(148,163,184,0.12)]">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <div className="inline-flex rounded-full border border-[rgba(15,76,129,0.12)] bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--brand-primary)]">
                  Home Page Background
                </div>
                <h3 className="mt-3 text-lg font-bold text-slate-900">Change the home page hero background image</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Admin overview-la indha section use panni new background image upload panna mudiyum. Save aana udane home page hero background change aagum.
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

              <div className="w-full max-w-xl">
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
                  <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
                    <span>Preview</span>
                    <span className="truncate text-right">
                      {homeHeroImageFile?.name || siteSettings.homeHeroImageUrl || "Using default image"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </article>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
                    <div className="rounded-[1rem] border border-white/70 bg-white/75 px-3 py-2 text-right shadow-[0_10px_20px_rgba(255,255,255,0.24)] backdrop-blur-sm">
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
        </div>
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
                  <div className="absolute left-[3%] right-[3%] top-[1.15rem] h-[4px] rounded-full bg-[#dbeafe]" />
                  <div
                    className="absolute left-[3%] top-[1.15rem] h-[4px] rounded-full bg-[linear-gradient(90deg,#f59e0b_0%,#38bdf8_100%)] transition-all"
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
                <div className="grid grid-cols-3 gap-3 sm:hidden">
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

              {collegeStep === 1 ? (
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
              {collegeStep === 2 ? (
              <>
              <div className="mb-3">
                <p className="text-sm font-semibold text-slate-900">Contact Details</p>
                <p className="text-xs text-slate-500">Primary contact details shown for this college.</p>
              </div>
              <div className={formSectionClass}>
                <label>
                  <span className={labelClass}>Official Email<span className={requiredMarkClass}>*</span></span>
                  <input className={getCollegeInputClass("contactEmail")} type="email" placeholder="Official email" value={collegeForm.contactEmail} onChange={(event) => { clearCollegeFieldError("contactEmail"); setCollegeForm((prev) => ({ ...prev, contactEmail: event.target.value })); }} required />
                  {collegeFieldErrors.contactEmail ? <span className={errorTextClass}>{collegeFieldErrors.contactEmail}</span> : null}
                </label>
                <label>
                  <span className={labelClass}>Phone Number<span className={requiredMarkClass}>*</span></span>
                  <input className={getCollegeInputClass("contactPhone")} type="tel" inputMode="numeric" maxLength={10} placeholder="10 digit mobile number" value={collegeForm.contactPhone} onChange={(event) => { clearCollegeFieldError("contactPhone"); setCollegeForm((prev) => ({ ...prev, contactPhone: normalizeIndianPhoneInput(event.target.value) })); }} required />
                  {collegeFieldErrors.contactPhone ? <span className={errorTextClass}>{collegeFieldErrors.contactPhone}</span> : null}
                </label>
                <label>
                  <span className={labelClass}>Alternate Phone</span>
                  <input className={getCollegeInputClass("alternatePhone")} type="tel" inputMode="numeric" maxLength={10} placeholder="10 digit alternate number" value={collegeForm.alternatePhone} onChange={(event) => { clearCollegeFieldError("alternatePhone"); setCollegeForm((prev) => ({ ...prev, alternatePhone: normalizeIndianPhoneInput(event.target.value) })); }} />
                  {collegeFieldErrors.alternatePhone ? <span className={errorTextClass}>{collegeFieldErrors.alternatePhone}</span> : null}
                </label>
                <label className="xl:col-span-2">
                  <span className={labelClass}>Website URL</span>
                  <input className={inputClass} placeholder="Website URL" value={collegeForm.website} onChange={(event) => setCollegeForm((prev) => ({ ...prev, website: event.target.value }))} />
                </label>
              </div>
              </>
              ) : null}

              {collegeStep === 3 ? (
              <>
              <div className="mb-3">
                <p className="text-sm font-semibold text-slate-900">Media Upload</p>
                <p className="text-xs text-slate-500">Upload logo, cover, gallery images, video, and brochure.</p>
              </div>
              <div className="mt-2 grid gap-2 md:grid-cols-2">
                <label>
                  <span className={labelClass}>Logo Image<span className={requiredMarkClass}>*</span></span>
                  <input className={getCollegeInputClass("logo")} type="file" accept=".jpg,.jpeg,.svg,image/jpeg,image/svg+xml" onChange={(event) => { clearCollegeFieldError("logo"); setLogoFile(event.target.files?.[0] || null); }} />
                  {collegeFieldErrors.logo ? <span className={errorTextClass}>{collegeFieldErrors.logo}</span> : null}
                </label>
                <label>
                  <span className={labelClass}>Cover Image<span className={requiredMarkClass}>*</span></span>
                  <input className={getCollegeInputClass("coverImage")} type="file" accept=".jpg,.jpeg,.svg,image/jpeg,image/svg+xml" onChange={(event) => { clearCollegeFieldError("coverImage"); setCoverImageFile(event.target.files?.[0] || null); }} />
                  {collegeFieldErrors.coverImage ? <span className={errorTextClass}>{collegeFieldErrors.coverImage}</span> : null}
                </label>
                <label className="md:col-span-2">
                  <span className={labelClass}>College Images<span className={requiredMarkClass}>*</span></span>
                  <input
                    className={getCollegeInputClass("images")}
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
                  {collegeFieldErrors.images ? <span className={errorTextClass}>{collegeFieldErrors.images}</span> : null}
                  <span className="mt-1 block text-[11px] text-slate-500">Upload high-quality images in 16:9 ratio, preferably 1600x900 or 1920x1080.</span>
                  <span className="block text-[11px] text-slate-500">Low quality or portrait images may appear cropped or blurry.</span>
                  <span className="block text-[11px] text-slate-500">Only JPG or SVG images are recommended. Minimum 2 images, Maximum 7 images.</span>
                  <span className="block text-[11px] font-semibold text-slate-600">Selected count: {collegeForm.images.length + imageFiles.length}</span>
                </label>
                <label className="md:col-span-2">
                  <span className={labelClass}>Brochure PDF</span>
                  <input className={inputClass} type="file" accept="application/pdf" onChange={(event) => setBrochureFile(event.target.files?.[0] || null)} />
                </label>
                <label className="md:col-span-2">
                  <span className={labelClass}>Campus Video (YouTube link)</span>
                  <input className={inputClass} placeholder="YouTube video link" value={collegeForm.campusVideoUrl} onChange={(event) => setCollegeForm((prev) => ({ ...prev, campusVideoUrl: event.target.value }))} />
                </label>
              </div>
              {logoPreviewUrl ? (
                <div className="mt-3">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Logo Preview</p>
                  <div className="relative inline-block rounded-lg border border-slate-300 bg-white p-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setLogoFile(null);
                        setCollegeForm((prev) => ({ ...prev, logo: "" }));
                      }}
                      className="absolute -right-2 -top-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white"
                      aria-label="Remove logo"
                    >
                      X
                    </button>
                    <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded border border-slate-200 bg-slate-50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={logoPreviewUrl}
                        alt="College logo preview"
                        className="h-16 w-16 rounded object-cover"
                      />
                    </div>
                  </div>
                </div>
              ) : null}
              {coverImagePreviewUrl ? (
                <div className="mt-3">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Cover Image Preview</p>
                  <div className="relative inline-block rounded-lg border border-slate-300 bg-white p-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setCoverImageFile(null);
                        setCollegeForm((prev) => ({ ...prev, coverImage: "" }));
                      }}
                      className="absolute -right-2 -top-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white"
                      aria-label="Remove cover image"
                    >
                      X
                    </button>
                    <div className="flex h-16 w-24 items-center justify-center overflow-hidden rounded border border-slate-200 bg-slate-50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={coverImagePreviewUrl}
                        alt="College cover preview"
                        className="h-16 w-24 rounded object-cover"
                      />
                    </div>
                  </div>
                </div>
              ) : null}
              {collegeForm.images.length > 0 || collegeImagePreviews.length > 0 ? (
                <div className="mt-3">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">College Image Preview</p>
                  <div className="flex flex-wrap gap-2">
                    {collegeForm.images.map((image, index) => (
                      <div key={`existing-college-image-${index}`} className="relative rounded-lg border border-slate-300 bg-white p-1.5">
                        <div className="h-16 w-16 overflow-hidden rounded border border-slate-200 bg-slate-50">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={image} alt={`College preview ${index + 1}`} className="h-16 w-16 rounded object-cover" />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeCollegeImageAt(index)}
                          className="absolute -right-2 -top-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white"
                          aria-label={`Remove college image ${index + 1}`}
                        >
                          X
                        </button>
                      </div>
                    ))}
                    {collegeImagePreviews.map((item, index) => (
                      <div key={`new-college-image-${item.key}`} className="relative rounded-lg border border-slate-300 bg-white p-1.5">
                        <div className="h-16 w-16 overflow-hidden rounded border border-slate-200 bg-slate-50">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={item.url} alt={item.name} className="h-16 w-16 rounded object-cover" />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeCollegeImageAt(collegeForm.images.length + index)}
                          className="absolute -right-2 -top-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white"
                          aria-label={`Remove new college image ${index + 1}`}
                        >
                          X
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
              {collegeForm.brochurePdfUrl ? (
                <p className="mt-2 text-xs text-slate-500">
                  Brochure ready: {collegeForm.brochurePdfUrl}
                </p>
              ) : null}
              </>
              ) : null}

              {collegeStep === 4 ? (
              <>
              <div className="mb-3">
                <p className="text-sm font-semibold text-slate-900">Highlights Section</p>
                <p className="text-xs text-slate-500">Highlight ranking, accreditation, reviews, and awards.</p>
              </div>
              <div className={formSectionClass}>
                <label>
                  <span className={labelClass}>Ranking (NIRF / State rank)</span>
                  <div className="relative">
                    <input
                      className={`${getCollegeInputClass("ranking")} text-center`}
                      placeholder="101-150"
                      inputMode="numeric"
                      maxLength={9}
                      value={collegeForm.ranking}
                      onChange={(event) => {
                        clearCollegeFieldError("ranking");
                        const rawValue = event.target.value;
                        const cleanedValue = String(rawValue || "")
                          .replace(/[\u2013\u2014]/g, "-")
                          .replace(/[^\d-]/g, "");
                        const digitsOnly = cleanedValue.replace(/-/g, "");
                        let normalizedInput = "";

                        if (cleanedValue.includes("-")) {
                          normalizedInput = normalizeRankingRangeInput(cleanedValue);
                        } else if (digitsOnly.length > 4) {
                          normalizedInput = formatRankingRangeForSave(digitsOnly) || digitsOnly.slice(0, 4);
                        } else {
                          normalizedInput = digitsOnly ? `${digitsOnly}-` : "";
                        }

                        setCollegeForm((prev) => ({
                          ...prev,
                          ranking: normalizedInput,
                        }));
                      }}
                      onBlur={() => {
                        const formatted = formatRankingRangeForSave(collegeForm.ranking);
                        setCollegeForm((prev) => ({ ...prev, ranking: formatted }));
                        setCollegeFieldErrors((prev) => ({
                          ...prev,
                          ranking: isValidRankingRange(formatted)
                            ? ""
                            : "Use NIRF format like 101-150. Both numbers must be between 1 and 9999.",
                        }));
                      }}
                    />
                    <span className="pointer-events-none absolute inset-y-0 left-1/2 flex -translate-x-1/2 items-center text-base font-semibold text-slate-400">
                      -
                    </span>
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
              </div>
              <datalist id="college-accreditation-options">
                {COLLEGE_ACCREDITATION_OPTIONS.map((option) => (
                  <option key={option} value={option} />
                ))}
              </datalist>
              </>
              ) : null}

              {collegeStep === 5 ? (
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
              <div className="mt-3 flex gap-2">
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
                  className={softButtonClass}
                >
                  Add
                </button>
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

              {collegeStep === 6 ? (
              <>
              <div className="mb-3">
                <p className="text-sm font-semibold text-slate-900">Admission Info</p>
                <p className="text-xs text-slate-500">Admission flow, quotas, scholarships, and fee range details.</p>
              </div>
              <div className={formSectionClass}>
                <label>
                  <span className={labelClass}>Quotas</span>
                  <input className={inputClass} placeholder="Management, Govt, Sports..." value={collegeForm.quotas} onChange={(event) => setCollegeForm((prev) => ({ ...prev, quotas: event.target.value }))} />
                </label>
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
              </div>
              <textarea className={`${inputClass} mt-2`} rows={2} placeholder="Scholarships" value={collegeForm.scholarships} onChange={(event) => setCollegeForm((prev) => ({ ...prev, scholarships: event.target.value }))} />
              </>
              ) : null}

              {collegeStep === 7 ? (
              <>
              <div className="mb-3">
                <p className="text-sm font-semibold text-slate-900">H. Placement Details</p>
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

              {collegeStep === 8 ? (
              <>
              <div className="mb-3">
                <p className="text-sm font-semibold text-slate-900">I. Hostel Details</p>
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

              {collegeStep === 9 ? (
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
                      setEmbeddedCourseForm(emptyEmbeddedCourseDraft());
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
                        value={embeddedCourseForm.stream}
                        onChange={(event) =>
                          setEmbeddedCourseForm((prev) => {
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
                            };
                          })
                        }
                        required
                      >
                        <option value="">Select stream</option>
                        {streamOptions.map((item) => (
                          <option key={item} value={item}>{item}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span className={labelClass}>Specialization<span className={requiredMarkClass}>*</span></span>
                      <select
                        className={inputClass}
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
                      >
                        <option value="">Select specialization</option>
                        {embeddedSpecializationEntries.map((item) => (
                          <option key={item.label} value={item.value}>{item.label}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span className={labelClass}>Course Name<span className={requiredMarkClass}>*</span></span>
                      <select
                        className={inputClass}
                        value={embeddedResolvedCourseName}
                        onChange={(event) =>
                          setEmbeddedCourseForm((prev) => ({
                            ...prev,
                            courseType: event.target.value,
                            specialization: "",
                            minimumQualification:
                              getDefaultMinimumQualification(event.target.value, prev.degreeType, prev.stream) || prev.minimumQualification,
                            entranceExamsEnabled:
                              shouldAutoShowEntranceExams(event.target.value, prev.degreeType, prev.stream) || prev.entranceExamsEnabled,
                          }))
                        }
                        required
                      >
                        <option value="">Select course name</option>
                        {embeddedCourseTypeOptions.map((item) => (
                          <option key={item} value={item}>{item}</option>
                        ))}
                      </select>
                    </label>
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
                      <input className={inputClass} list="embedded-qualification-options" placeholder="10+2 / Graduation" value={embeddedCourseForm.minimumQualification} onChange={(event) => setEmbeddedCourseForm((prev) => ({ ...prev, minimumQualification: event.target.value }))} required />
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
                      <span className={labelClass}>Cutoff By Category<span className={requiredMarkClass}>*</span></span>
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
                        {embeddedCourseForm.entranceExams.map((exam, index) => (
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
                              <input className={inputClass} placeholder="Exam name" value={exam.examName} onChange={(event) => setEmbeddedCourseForm((prev) => ({ ...prev, entranceExams: prev.entranceExams.map((item, examIndex) => examIndex === index ? { ...item, examName: event.target.value } : item) }))} />
                              <input className={inputClass} placeholder="Cutoff score / rank" value={exam.cutoffScoreOrRank} onChange={(event) => setEmbeddedCourseForm((prev) => ({ ...prev, entranceExams: prev.entranceExams.map((item, examIndex) => examIndex === index ? { ...item, cutoffScoreOrRank: event.target.value } : item) }))} />
                              <input className={inputClass} placeholder="Exam weightage" value={exam.weightage} onChange={(event) => setEmbeddedCourseForm((prev) => ({ ...prev, entranceExams: prev.entranceExams.map((item, examIndex) => examIndex === index ? { ...item, weightage: event.target.value } : item) }))} />
                              <input className={`${inputClass} md:col-span-2 xl:col-span-3`} placeholder="Specified paper / syllabus" value={exam.paperOrSyllabus} onChange={(event) => setEmbeddedCourseForm((prev) => ({ ...prev, entranceExams: prev.entranceExams.map((item, examIndex) => examIndex === index ? { ...item, paperOrSyllabus: event.target.value } : item) }))} />
                              <textarea className={`${inputClass} md:col-span-2 xl:col-span-3`} rows={2} placeholder="Preparation notes" value={exam.preparationNotes} onChange={(event) => setEmbeddedCourseForm((prev) => ({ ...prev, entranceExams: prev.entranceExams.map((item, examIndex) => examIndex === index ? { ...item, preparationNotes: event.target.value } : item) }))} />
                            </div>
                          </div>
                        ))}
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
                    checked={collegeForm.isTopCollege}
                    onChange={(event) =>
                      setCollegeForm((prev) => ({
                        ...prev,
                        isTopCollege: event.target.checked,
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

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {visibleCollegeCards.map((college) => {
              const range = formatFeeRange(college.feesStructure);
              const isExpanded = expandedCollegeIds.includes(college._id);
              return (
                <article key={college._id} className="rounded-[1.35rem] border border-white/80 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-3.5 shadow-[0_18px_34px_rgba(148,163,184,0.12)]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{college.name || "College"}</h3>
                      <p className="text-sm text-slate-600">{college.university || "-"}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{[college.district, college.state].filter(Boolean).join(", ")}</p>
                      {isExpanded ? (
                        <>
                        <p className="mt-1 text-xs text-slate-500">Fees: {range.min || "-"} to {range.max || "-"}</p>
                        <p className="mt-1 text-xs text-slate-500">Tags: {college.courseTags || "-"}</p>
                        <p className="mt-1 text-xs text-slate-500">Facilities: {Array.isArray(college.facilities) ? college.facilities.join(", ") : (college.facilities || "-")}</p>
                        <p className="mt-1 text-xs text-slate-500">Placement: {String(college.placements?.placementRate || college.placementRate || "-")}</p>
                        <p className="mt-1 text-xs text-slate-500">Contact: {college.contactPhone || college.phone || "-"}</p>
                        <p className="mt-1 text-xs text-slate-500">{college.isTopCollege || college.isBestCollege ? "Best college" : "Standard listing"}</p>
                        </>
                      ) : null}
                    </div>
                    {college.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={college.logo} alt={college.name || "College"} className="h-14 w-14 rounded-[1rem] border border-white bg-white p-2 object-contain shadow-[0_10px_18px_rgba(148,163,184,0.12)]" />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-[1rem] bg-[linear-gradient(135deg,#eff6ff_0%,#fff7ed_100%)]">
                        <Building2 className="size-7 text-[#0f4c81]" />
                      </div>
                    )}
                  </div>

                  <div className="mt-3 space-y-2">
                    <div className="flex flex-wrap justify-center gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedCollegeIds((prev) =>
                            prev.includes(college._id)
                              ? prev.filter((item) => item !== college._id)
                              : [...prev, college._id],
                          )
                        }
                        className={`${softButtonClass} w-[132px] justify-center px-3 py-1.5 text-xs`}
                      >
                        {isExpanded ? "Hide Info" : "See Details"}
                      </button>
                      <Link href={`/college/${college._id}`} className={`${softButtonClass} w-[132px] justify-center px-3 py-1.5 text-sm`}>
                        View
                        <ExternalLink className="size-4" />
                      </Link>
                    </div>
                    <div className="flex flex-wrap justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                        const rangeData = formatFeeRange(college.feesStructure);
                        const placementData = college.placements || {};
                        const hostelFees = college.hostelDetails?.hostelFees || {};
                        const hostelData = college.hostelDetails || {};
                        setEditCollegeId(college._id);
                        setCollegeStep(0);
                        setShowCollegeForm(true);
                        setBrochureFile(null);
                        setCoverImageFile(null);
                        resetEmbeddedCourseEditor();
                        setEmbeddedCourses(buildEmbeddedCoursesForCollege(college._id));
                        setCollegeForm({
                          name: college.name || "",
                          establishedYear: String(college.establishedYear || ""),
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
                          placementRate: String(college.placementRate || ""),
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
                          isTopCollege: Boolean(college.isTopCollege || college.isBestCollege),
                          logo: college.logo || "",
                          coverImage: college.image || "",
                          images: Array.isArray(college.images) ? college.images : [],
                          courseTags: college.courseTags || "",
                          facilities: Array.isArray(college.facilities) ? college.facilities.join(", ") : (college.facilities || ""),
                          scholarships: college.scholarships || "",
                          highestPackage: String(placementData.highestPackage || ""),
                          averagePackage: String(placementData.averagePackage || ""),
                          companiesVisited: String(placementData.companiesVisited || ""),
                          hostelAvailability: hostelData.availability || "not_available",
                          hostelType: hostelData.hostelType || "",
                          hostelFeeMin: String(hostelFees.minAmount || ""),
                          hostelFeeMax: String(hostelFees.maxAmount || ""),
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
                        }}
                        className={`${solidBlueButtonClass} w-[132px] justify-center px-3 py-1.5 text-xs`}
                      >
                        <PencilLine className="size-4" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          void runAction(`college-${college._id}`, async () => {
                            const data = await request(`/api/admin/colleges/${college._id}`, withAuth(token, { method: "DELETE" }));
                            setStatusText(data?.message || "College deleted");
                            await loadAdminData(token, currentUser);
                          })
                        }
                        className="inline-flex w-[132px] items-center justify-center gap-2 rounded-full bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white"
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
                setCollegeStep(5);
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
                      value={courseForm.stream}
                      onChange={(event) =>
                        setCourseForm((prev) => {
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
                          };
                        })
                      }
                      required
                    >
                      <option value="">Select stream</option>
                      {streamOptions.map((item) => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span className={labelClass}>Specialization<span className={requiredMarkClass}>*</span></span>
                    <select
                      className={inputClass}
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
                    >
                      <option value="">Select specialization</option>
                      {courseSpecializationEntries.map((item) => (
                        <option key={item.label} value={item.value}>{item.label}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                      <span className={labelClass}>Course Name<span className={requiredMarkClass}>*</span></span>
                    <select
                      className={inputClass}
                      value={courseResolvedCourseName}
                      onChange={(event) =>
                        setCourseForm((prev) => ({
                          ...prev,
                          courseType: event.target.value,
                          specialization: "",
                          minimumQualification:
                            getDefaultMinimumQualification(event.target.value, prev.degreeType, prev.stream) || prev.minimumQualification,
                          entranceExamsEnabled:
                            shouldAutoShowEntranceExams(event.target.value, prev.degreeType, prev.stream) || prev.entranceExamsEnabled,
                        }))
                      }
                      required
                    >
                      <option value="">Select course name</option>
                      {courseTypeOptions.map((item) => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </select>
                  </label>
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
                    <input className={inputClass} list="course-qualification-options" placeholder="10+2 / Graduation" value={courseForm.minimumQualification} onChange={(event) => setCourseForm((prev) => ({ ...prev, minimumQualification: event.target.value }))} required />
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
                    {courseForm.entranceExams.map((exam, index) => (
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
                          <input className={inputClass} placeholder="Exam name" value={exam.examName} onChange={(event) => setCourseForm((prev) => ({ ...prev, entranceExams: prev.entranceExams.map((item, examIndex) => examIndex === index ? { ...item, examName: event.target.value } : item) }))} />
                          <input className={inputClass} placeholder="Cutoff score / rank" value={exam.cutoffScoreOrRank} onChange={(event) => setCourseForm((prev) => ({ ...prev, entranceExams: prev.entranceExams.map((item, examIndex) => examIndex === index ? { ...item, cutoffScoreOrRank: event.target.value } : item) }))} />
                          <input className={inputClass} placeholder="Exam weightage" value={exam.weightage} onChange={(event) => setCourseForm((prev) => ({ ...prev, entranceExams: prev.entranceExams.map((item, examIndex) => examIndex === index ? { ...item, weightage: event.target.value } : item) }))} />
                          <input className={`${inputClass} md:col-span-2 xl:col-span-3`} placeholder="Specified paper / syllabus" value={exam.paperOrSyllabus} onChange={(event) => setCourseForm((prev) => ({ ...prev, entranceExams: prev.entranceExams.map((item, examIndex) => examIndex === index ? { ...item, paperOrSyllabus: event.target.value } : item) }))} />
                          <textarea className={`${inputClass} md:col-span-2 xl:col-span-3`} rows={2} placeholder="Preparation notes" value={exam.preparationNotes} onChange={(event) => setCourseForm((prev) => ({ ...prev, entranceExams: prev.entranceExams.map((item, examIndex) => examIndex === index ? { ...item, preparationNotes: event.target.value } : item) }))} />
                        </div>
                      </div>
                    ))}
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
                          <span className="mt-1 block text-[11px] text-slate-500">Use values like 190, 190.5, or 190-195</span>
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
            <div className="grid gap-4 xl:grid-cols-2">
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
                          details[collegeId] = {
                            semesterFees: String(item.semesterFees || ""),
                            totalFees: String(item.totalFees || ""),
                            cutoff: String(resolvePrimaryCategoryCutoff(detailCutoffByCategory, item.cutoff || course.cutoff || "")),
                            intake: String(item.intake ?? course.intake ?? ""),
                            applicationFee: String(item.applicationFee ?? course.applicationFee ?? ""),
                          };
                        });
                        setEditCourseId(course._id);
                        setShowCourseForm(true);
                        setSelectedCourseCollegeId("");
                        setCourseForm({
                          courseType: course.courseType || course.course || "",
                          degreeType: course.degreeType || "",
                          stream: course.stream || course.courseCategory || "",
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
                              ? course.entranceExams.map((item) => ({
                                  examName: item.examName || "",
                                  cutoffScoreOrRank: item.cutoffScoreOrRank || "",
                                  weightage: item.weightage || "",
                                  paperOrSyllabus: item.paperOrSyllabus || "",
                                  preparationNotes: item.preparationNotes || "",
                                }))
                              : [emptyCourseExam()],
                          colleges: collegeIds,
                          details,
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
            <div className="overflow-x-auto rounded-[1rem] border border-slate-200 bg-white shadow-[0_8px_18px_rgba(15,23,42,0.05)]">
              <table className="min-w-full text-left text-[13px] text-slate-700">
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
                          onClick={() =>
                            void runAction(`user-${user._id}`, async () => {
                              const data = await request(`/api/admin/users/${user._id}`, withAuth(token, { method: "DELETE" }));
                              setStatusText(data?.message || "User deleted");
                              await loadAdminData(token, currentUser);
                            })
                          }
                          className="rounded-full bg-rose-600 px-3 py-1.5 text-[11px] font-semibold text-white"
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
                onClick={() =>
                  void runAction(`enquiry-${enquiry._id}`, async () => {
                    const data = await request(`/api/admin/enquiries/${enquiry._id}`, withAuth(token, { method: "DELETE" }));
                    setStatusText(data?.message || "Enquiry deleted");
                    await loadAdminData(token, currentUser);
                  })
                }
                className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white"
              >
                Delete
              </button>
            </article>
          ))}
        </div>
      ) : null}

      {!loading && activeTab === "college-requests" ? (
        <div className="space-y-3">
          {adminState.collegeRequests.map((item) => (
            <article key={item._id} className="luxe-card flex items-start justify-between gap-4 p-5">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-slate-900">{item.payload?.name || item.requesterName || "College request"}</h3>
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
                <p className="text-sm text-slate-500">{item.requesterEmail || "-"}</p>
              </div>
              <div className="flex gap-3">
                <Link href={`/admin/requested-college/${item._id}`} className={solidBlueButtonClass}>
                  Review
                  <ExternalLink className="size-4" />
                </Link>
                {item.status !== "approved" ? (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        void runAction(`college-request-${item._id}`, async () => {
                          const data = await request(`/api/admin/college-add-requests/${item._id}/status`, withAuth(token, { method: "PUT", body: JSON.stringify({ status: "approved" }) }));
                          setStatusText(data?.message || "College request approved");
                          await loadAdminData(token, currentUser);
                        })
                      }
                      className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        void runAction(`college-request-delete-${item._id}`, async () => {
                          const data = await request(`/api/admin/college-add-requests/${item._id}`, withAuth(token, { method: "DELETE" }));
                          setStatusText(data?.message || "College request rejected");
                          await loadAdminData(token, currentUser);
                        })
                      }
                      className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white"
                    >
                      Reject
                    </button>
                  </>
                ) : (
                  <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                    Approved
                  </span>
                )}
              </div>
            </article>
          ))}
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
                <input className={inputClass} type="email" placeholder="Admin email" value={subAdminForm.email} onChange={(event) => setSubAdminForm((prev) => ({ ...prev, email: event.target.value }))} required />
                <input className={inputClass} type="password" placeholder={editSubAdminId ? "New password (optional)" : "Password"} value={subAdminForm.password} onChange={(event) => setSubAdminForm((prev) => ({ ...prev, password: event.target.value }))} />
              </div>

              <div className="grid gap-2 md:grid-cols-2">
                {adminModules.map((module) => (
                  <label key={module} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
                    <input
                      type="checkbox"
                      checked={subAdminForm.permissions.includes(module)}
                      onChange={(event) =>
                        setSubAdminForm((prev) => ({
                          ...prev,
                          permissions: event.target.checked
                            ? [...new Set([...prev.permissions, module])]
                            : prev.permissions.filter((item) => item !== module),
                        }))
                      }
                    />
                    {adminModuleLabels[module] || module}
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
              <article key={item._id} className="luxe-card flex items-center justify-between gap-4 p-5">
                <div>
                  <h3 className="font-bold text-slate-900">{item.email || "Sub-admin"}</h3>
                  <p className="text-sm text-slate-500">{(item.permissions || []).join(", ") || "No permissions"}</p>
                  <p className="text-sm text-slate-500">{item.mustResetPassword ? "Password setup pending" : "Ready"} • {formatDate(item.createdAt)}</p>
                </div>
                <div className="flex gap-3">
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
                    className={solidBlueButtonClass}
                  >
                    <PencilLine className="size-4" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      void runAction(`sub-admin-${item._id}`, async () => {
                        const data = await request(`/api/admin/sub-admins/${item._id}`, withAuth(token, { method: "DELETE" }));
                        setStatusText(data?.message || "Admin deleted");
                        await loadAdminData(token, currentUser);
                      })
                    }
                    className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white"
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : null}

      {showSavedCourseList ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4" onClick={() => setShowSavedCourseList(false)}>
          <div className="w-full max-w-7xl rounded-[1.5rem] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.22)]" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
              <h3 className="text-base font-bold text-slate-900">Saved Course List</h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowSavedCourseList(false)}
                  className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
                >
                  Done
                </button>
              </div>
            </div>

            <div className="max-h-[75vh] overflow-auto p-5">
              <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                <table className="min-w-full text-left text-[12px] text-slate-700 sm:text-[13px]">
                  <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600">
                    <tr>
                      <th className="px-3 py-2.5">Course</th>
                      <th className="px-3 py-2.5">Degree</th>
                      <th className="px-3 py-2.5">Stream</th>
                      <th className="px-3 py-2.5">Duration</th>
                      <th className="px-3 py-2.5">Qualification</th>
                      <th className="px-3 py-2.5">Semester Fee</th>
                      <th className="px-3 py-2.5">Total Fee</th>
                      <th className="px-3 py-2.5">Cutoff</th>
                      <th className="px-3 py-2.5">Intake</th>
                      <th className="px-3 py-2.5">Application Fee</th>
                      <th className="px-3 py-2.5">Entrance Exam</th>
                      <th className="px-3 py-2.5">University</th>
                      <th className="px-3 py-2.5">Lateral Entry</th>
                      <th className="px-3 py-2.5">Description</th>
                      <th className="px-3 py-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {embeddedCourses.map((item, index) => (
                      <tr key={`${item.id || item.courseType}-${index}`} className="border-t border-slate-100 align-top">
                        <td className="px-3 py-3">
                          <p className="font-semibold text-slate-900">
                            {[item.courseType, item.specialization].filter(Boolean).join(" - ") || "Course"}
                          </p>
                          <p className="mt-1 text-[11px] text-slate-500">{item.mode || "-"}</p>
                        </td>
                        <td className="px-3 py-3">{item.degreeType || "-"}</td>
                        <td className="px-3 py-3">{item.stream || "-"}</td>
                        <td className="px-3 py-3">{item.duration || "-"}</td>
                        <td className="px-3 py-3">{formatQualificationLabel(item.minimumQualification || "") || "-"}</td>
                        <td className="px-3 py-3">{item.semesterFees || "-"}</td>
                        <td className="px-3 py-3 font-semibold text-slate-900">{item.totalFees || "-"}</td>
                        <td className="px-3 py-3">
                          {normalizeCategoryCutoffs(item.cutoffByCategory).length > 0 ? (
                            <div className="space-y-1 text-[11px] text-slate-600">
                              {normalizeCategoryCutoffs(item.cutoffByCategory).map((cutoffItem) => (
                                <p key={`${item.id || item.courseType}-${cutoffItem.category}`}>
                                  <span className="font-semibold text-slate-800">{cutoffItem.category}</span>: {cutoffItem.cutoff}
                                </p>
                              ))}
                            </div>
                          ) : (
                            item.cutoff || "-"
                          )}
                        </td>
                        <td className="px-3 py-3">{item.intake || "-"}</td>
                        <td className="px-3 py-3">{item.applicationFee || "-"}</td>
                        <td className="px-3 py-3">
                          {item.entranceExams.some((exam) => Object.values(exam).some(Boolean)) ? (
                            <div className="space-y-2">
                              {item.entranceExams
                                .filter((exam) => Object.values(exam).some(Boolean))
                                .map((exam, examIndex) => (
                                  <div key={`${item.id || item.courseType}-exam-${examIndex}`} className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-[11px] text-slate-600">
                                    <p className="font-semibold text-slate-800">{exam.examName || `Exam ${examIndex + 1}`}</p>
                                    <p>Cutoff: {exam.cutoffScoreOrRank || "-"}</p>
                                    <p>Weightage: {exam.weightage || "-"}</p>
                                    <p>Paper: {exam.paperOrSyllabus || "-"}</p>
                                    <p>Notes: {exam.preparationNotes || "-"}</p>
                                  </div>
                                ))}
                            </div>
                          ) : (
                            "Not needed"
                          )}
                        </td>
                        <td className="px-3 py-3">{item.university || "-"}</td>
                        <td className="px-3 py-3">
                          {item.lateralEntryAvailable
                            ? `Available${item.lateralEntryDetails ? ` - ${item.lateralEntryDetails}` : ""}`
                            : "Not available"}
                        </td>
                        <td className="max-w-[18rem] px-3 py-3 whitespace-normal">{item.description || "-"}</td>
                        <td className="px-3 py-3">
                          <div className="flex justify-end gap-2">
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
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </AdminPortalShell>
  );
}
