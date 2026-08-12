/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-nocheck
"use client";

import type { Dispatch, ReactNode, SetStateAction } from "react";
import { BadgeCheck, ChevronDown, ChevronRight, FileClock, ImageUp, MapPin, Plus, Search, TriangleAlert, Trash2, UserRound, Users, X, Download, ExternalLink, KeyRound, Mail, MailOpen, BookOpen, Building2, LayoutDashboard, PencilLine, Filter } from "lucide-react";
import Link from "next/link";
import { ResponsiveTableWrapper } from "@/components/responsive-table-wrapper";
import { CollegeLogoBadge } from "@/components/college-logo-badge";
import { AdminCutoffQuestions } from "@/components/admin-cutoff-questions";
import { formatCompactIndianCurrency, formatCompactIndianCurrencyRange } from "@/lib/currency-format";
import {
  formatRankingRangeForDisplay,
  formatRankingRangeForSave,
  isValidRankingRange,
  normalizeRankingRangeInput,
} from "@/lib/ranking-utils";
import { formatCutoffForSave, normalizeCutoffInput, parseCutoffValue } from "@/lib/cutoff-utils";
import { normalizeScientificIntegerText } from "@/lib/integer-text";
import {
  buildCourseExamCutoffState,
  cutoffValidationMessage,
  createCourseExamDraft,
  emptyCourseDetail,
  shouldSkipEmbeddedCutoffAutoAdvance,
  removeCourseExamCutoffState,
  type CourseForm,
  type RequestItem,
} from "@/components/admin-course-shared";

const inputClass =
  "w-full rounded-[1rem] border border-[rgba(148,163,184,0.24)] bg-[linear-gradient(180deg,#ffffff_0%,#fbfdff_100%)] px-3 py-2.5 text-xs text-slate-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_6px_16px_rgba(148,163,184,0.06)] outline-none transition placeholder:text-slate-400 focus:border-[rgba(56,189,248,0.38)] focus:ring-4 focus:ring-sky-100 sm:px-3.5 sm:text-sm md:text-sm";
const labelClass =
  "mb-1 block text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 sm:mb-1.5 sm:text-[11px]";
const primaryButtonClass =
  "inline-flex items-center justify-center gap-1 rounded-full bg-[linear-gradient(135deg,#0f4c81_0%,#38bdf8_100%)] px-3 py-2 text-xs font-semibold text-white shadow-[0_16px_30px_rgba(56,189,248,0.24)] transition duration-200 hover:shadow-[0_18px_34px_rgba(56,189,248,0.28)] sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm";
const softButtonClass =
  "inline-flex items-center justify-center gap-1 rounded-full border border-[rgba(37,99,235,0.3)] bg-white px-3 py-2 text-xs font-semibold text-[#2563eb] shadow-[0_10px_20px_rgba(37,99,235,0.08)] transition duration-200 hover:bg-[#3b82f6] hover:text-white hover:border-[#3b82f6] hover:shadow-[0_12px_24px_rgba(37,99,235,0.18)] sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm";
const solidBlueButtonClass =
  "inline-flex items-center justify-center gap-1 rounded-full border border-[rgba(37,99,235,0.3)] bg-[#3b82f6] px-3 py-2 text-xs font-semibold text-white shadow-[0_10px_20px_rgba(37,99,235,0.16)] transition duration-200 hover:bg-white hover:text-[#2563eb] hover:border-[rgba(37,99,235,0.34)] hover:shadow-[0_12px_24px_rgba(37,99,235,0.12)] sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm";
const dangerButtonClass =
  "inline-flex items-center justify-center gap-1 rounded-full border border-[rgba(251,191,36,0.22)] bg-[linear-gradient(135deg,#fff8e7_0%,#fff0d2_100%)] px-3 py-2 text-xs font-semibold text-[#9a6700] shadow-[0_8px_18px_rgba(251,191,36,0.12)] transition duration-200 hover:bg-[linear-gradient(135deg,#fff4d6_0%,#ffebc2_100%)] sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm";
const requiredMarkClass = "ml-1 text-rose-500";
const errorTextClass = "mt-1 block text-[10px] font-medium text-rose-600 sm:text-[11px]";
const formSectionClass = "grid gap-2 grid-cols-1 sm:gap-3 md:grid-cols-2 xl:grid-cols-3";
const mediaUploadCardClass =
  "group relative overflow-hidden rounded-[1.5rem] border border-[rgba(148,163,184,0.28)] bg-white/95 p-4 shadow-[0_14px_28px_rgba(148,163,184,0.12)] transition hover:border-[rgba(37,99,235,0.22)] hover:shadow-[0_18px_30px_rgba(148,163,184,0.16)]";
const mediaUploadButtonClass =
  "inline-flex h-[110px] w-[110px] shrink-0 flex-col items-center justify-center gap-2 rounded-[1.25rem] border border-dashed border-[#c7d5ea] bg-[#f8fbff] text-[#0f4c81] transition group-hover:border-[#93b4d8] group-hover:bg-[#f3f8ff]";
const mediaPreviewTileClass =
  "group relative overflow-hidden rounded-[1.2rem] border border-[rgba(148,163,184,0.22)] bg-white shadow-[0_12px_24px_rgba(148,163,184,0.1)]";
const collegeSteps = [
  "College Basic Details",
  "Media & Facilities",
  "Admission & Placement",
  "Courses & Cutoff",
];
const ownershipTypeOptions = ["Private", "Government", "Deemed"];
const applicationModeOptions = ["Online", "Offline", "Online & Offline"];
const degreeTypeOptions = ["UG", "PG", "Diploma", "Certificate", "Doctorate"];
const streamOptions = ["Engineering", "Architecture", "Arts and Science", "Medical / Health", "Paramedical", "Law", "Design", "Agriculture", "Aviation", "Hotel Management", "Education", "Social Work", "Physical Education & Sports", "Vocational Courses", "Diploma / ITI"];
const modeOptions = ["Full-time", "Part-time", "Distance", "Online", "Hybrid"];
const cutoffCategoryOptions = [
  { value: "OC", label: "OC / General" },
  { value: "BC", label: "BC" },
  { value: "BCM", label: "BCM" },
  { value: "MBC", label: "MBC / DNC" },
  { value: "SC", label: "SC" },
  { value: "SCA", label: "SCA" },
  { value: "ST", label: "ST" },
];
const COLLEGE_ACCREDITATION_OPTIONS = ["NAAC", "NBA", "AICTE", "UGC", "NIRF", "A++", "A+", "A"];
const facilityQuickOptions = ["Library", "Sports", "WiFi", "Labs", "Transport", "Cafeteria"];
const quotaQuickOptions = ["Management Quota", "Government Quota", "Reservation Quota", "Sports Quota", "Minority Quota", "NRI Quota"];
const scholarshipQuickOptions = ["Merit Scholarship", "Government Scholarship", "Minority Scholarship", "Sports Scholarship", "Need Based Scholarship", "First Graduate Scholarship"];
const CUSTOM_STREAM_OPTION = "__custom_stream__";
const CUSTOM_SPECIALIZATION_OPTION = "__custom_specialization__";
const CUSTOM_COURSE_NAME_OPTION = "__custom_course_name__";

const getCollegeInputClass = (field: string, collegeFieldErrors: Record<string, string | undefined> = {}) =>
  collegeFieldErrors[field] ? `${inputClass} border-rose-300 focus:border-rose-300 focus:ring-rose-100` : inputClass;

const normalizeIndianPhoneInput = (value: string) =>
  String(value || "")
    .replace(/[^\d+\-()\s]/g, "")
    .replace(/\s{2,}/g, " ")
    .slice(0, 24);

const stripTrailingZeroDecimal = (value: unknown) => {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  return raw.replace(/^(-?\d+)\.0+$/, "$1");
};

const formatFeeRange = (value?: Record<string, unknown>) => {
  const tuition = ((value?.tuitionFee as Record<string, unknown> | undefined) || value || {}) as Record<string, unknown>;
  return {
    min: stripTrailingZeroDecimal(tuition.minAmount ?? value?.minAmount ?? ""),
    max: stripTrailingZeroDecimal(tuition.maxAmount ?? value?.maxAmount ?? ""),
  };
};

const normalizeAdminIdentityValue = (value: unknown) => String(value ?? "").trim();

const getAdminCourseCollegeIdentityValues = (course: {
  collegeId?: string;
  college?: string | { _id?: string; collegeCode?: string; name?: string };
  colleges?: Array<string | { _id?: string; collegeCode?: string; name?: string }>;
  collegeDetails?: Array<{
    college?: string | { _id?: string; collegeCode?: string; name?: string };
    collegeId?: string;
    collegeCode?: string;
  }>;
}) =>
  [
    course.collegeId || "",
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
        : [
            detailCollege?._id || "",
            detail.collegeId || "",
            detailCollege?.collegeCode || "",
            detailCollege?.name || "",
            detail.collegeCode || "",
          ];
    }),
  ]
    .map(normalizeAdminIdentityValue)
    .filter(Boolean);

const getAdminCollegeIdentityValues = (college: { _id: string; collegeCode?: string; name?: string }) =>
  [college._id, college.collegeCode || "", college.name || ""]
    .map(normalizeAdminIdentityValue)
    .filter(Boolean);

const doesAdminCourseBelongToCollege = (
  course: {
    collegeId?: string;
    college?: string | { _id?: string; collegeCode?: string; name?: string };
    colleges?: Array<string | { _id?: string; collegeCode?: string; name?: string }>;
    collegeDetails?: Array<{
      college?: string | { _id?: string; collegeCode?: string; name?: string };
      collegeId?: string;
      collegeCode?: string;
    }>;
  },
  college: { _id: string; collegeCode?: string; name?: string },
) => {
  const collegeIdentityValues = new Set(getAdminCollegeIdentityValues(college));
  return getAdminCourseCollegeIdentityValues(course).some((value) => collegeIdentityValues.has(value));
};

type CutoffRangeConfig = { max: number; scaleLabel: string; contextLabel: string };
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
const artsAndScienceStream = "Arts & Science";
const artsScienceCourseTypeGroups = {
  science: "B.Sc (Science Courses)",
  commerce: "B.Com (Commerce Courses)",
  arts: "B.A (Arts Courses)",
  professional: "Other Professional Courses",
} as const;
const defaultDurationByDegreeType: Record<string, string> = {
  UG: "3 Years",
  PG: "2 Years",
  Diploma: "3 Years",
  Certificate: "6 Months",
  Doctorate: "3 Years",
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
const normalizeAdminOption = (value?: string) => String(value || "").trim();
const formatQualificationLabel = (value?: string) => qualificationLabelMap[String(value || "").trim()] || String(value || "").trim();
const normalizeCourseStream = (value?: string) => streamAliasMap[normalizeAdminOption(value)] || normalizeAdminOption(value);
const getDefaultDuration = (stream: string, degreeType: string) =>
  streamDurationByDegreeType[stream]?.[degreeType] || defaultDurationByDegreeType[degreeType] || "";
const getDefaultCourseName = (stream: string, degreeType: string) =>
  streamCourseNameByDegreeType[stream]?.[degreeType] || "";
const getResolvedCourseName = (stream: string, degreeType: string, currentValue: string) =>
  normalizeAdminOption(currentValue) || getDefaultCourseName(stream, degreeType) || "";
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
const calculateTotalFeesFromSemesterFees = (semesterFees: string, duration: string) => {
  const feeValue = Number(String(semesterFees || "").replace(/,/g, "").trim() || 0);
  const durationYears = Number(String(duration || "").match(/(\d+(?:\.\d+)?)/)?.[1] || 0);
  const multiplier = durationYears * 2;
  if (!feeValue || !multiplier) return "";
  return String(feeValue * multiplier);
};
const emptyCourseExam = () => ({
  examName: "",
  cutoffScoreOrRank: "",
  cutoffByCategory: [],
  cutoffCategory: "OC",
  cutoffValue: "",
  weightage: "",
  paperOrSyllabus: "",
  preparationNotes: "",
});
const createEmptyEmbeddedCourseDraft = (university = "") => ({
  id: "",
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
  cutoffCategory: "OC",
  cutoffValue: "",
  intake: "",
  applicationFee: "",
  entranceExams: [emptyCourseExam()],
});
const defaultCutoffCategory = "OC";
const embeddedCutoffCategoryOrder = ["OC", "BC", "BCM", "MBC", "SC", "SCA", "ST"];
const normalizeCategoryCutoffs = (value: unknown) => {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  return value
    .map((item) => ({
      category: String((item as any)?.category || "").trim().toUpperCase(),
      cutoff: String((item as any)?.cutoff || "").trim(),
    }))
    .filter((item) => {
      if (!item.category || !item.cutoff || seen.has(item.category)) return false;
      seen.add(item.category);
      return true;
    })
    .sort((left, right) => {
      const leftIndex = embeddedCutoffCategoryOrder.indexOf(left.category);
      const rightIndex = embeddedCutoffCategoryOrder.indexOf(right.category);
      return (leftIndex === -1 ? embeddedCutoffCategoryOrder.length : leftIndex) -
        (rightIndex === -1 ? embeddedCutoffCategoryOrder.length : rightIndex);
    });
};
const normalizeCategoryCutoffsWithFallback = (value: unknown, fallbackCutoff = "") => {
  const normalized = normalizeCategoryCutoffs(value);
  if (normalized.length > 0) return normalized;
  const fallback = formatCutoffForSave(fallbackCutoff);
  return fallback ? [{ category: defaultCutoffCategory, cutoff: fallback }] : [];
};
const resolvePrimaryCategoryCutoff = (cutoffs: unknown, fallbackCutoff = "") =>
  normalizeCategoryCutoffs(cutoffs)[0]?.cutoff || formatCutoffForSave(fallbackCutoff) || "";
const dedupeEmbeddedCourses = (courses: any[]) => {
  const seen = new Set<string>();
  return courses.filter((course) => {
    const key = [
      course?.courseType || "",
      course?.degreeType || "",
      course?.stream || "",
      course?.specialization || "",
      course?.university || "",
    ]
      .join("|")
      .toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};
const getCutoffValueForCategory = (cutoffs: any[], category: string) => {
  const found = Array.isArray(cutoffs)
    ? cutoffs.find((item) => String(item?.category || "").trim().toUpperCase() === String(category || "").trim().toUpperCase())
    : null;
  return String(found?.cutoff || "");
};
const resolveExamCutoffRangeConfig = (stream: string, examName: string) => resolveCutoffRangeConfig(examName, "", stream, "");
const getExamScheduleNameOptions = (stream: string) => {
  const normalizedStream = normalizeCourseStream(stream);
  if (normalizedStream === "Engineering") return ["JEE Main", "JEE Advanced", "CUET"];
  if (normalizedStream === "Medical / Health") return ["NEET", "CUET"];
  if (normalizedStream === "Law") return ["CLAT", "AILET", "CUET"];
  return ["CUET", "JEE Main", "NEET"];
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

  return parsedDate;
};
const getCutoffRangeParts = (value: string | number | null | undefined) => {
  const raw = String(value || "").replace(/[\u2013\u2014]/g, "-");
  if (!raw.includes("-")) {
    return { start: normalizeCutoffInput(raw), end: "" };
  }

  const [start = "", ...rest] = raw.split("-");
  return {
    start: normalizeCutoffInput(start),
    end: normalizeCutoffInput(rest.join("-")),
  };
};
const buildCutoffRangeValue = (start: string, end: string) => {
  const normalizedStart = normalizeCutoffInput(start);
  const normalizedEnd = normalizeCutoffInput(end);

  if (!normalizedStart && !normalizedEnd) return "";
  return `${normalizedStart}-${normalizedEnd}`;
};
const syncCourseExamsForStream = (stream: string, exams: any[]) => {
  const nextStream = normalizeCourseStream(stream);
  if (nextStream === "Engineering" || nextStream === "Medical / Health" || nextStream === "Law") return exams;
  return [];
};
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
function getCutoffRangeHelperText(config: CutoffRangeConfig) {
  return `Allowed cutoff range: 0-${config.max} (${config.scaleLabel}).`;
}
function getCutoffLimitWarning(
  value: string | number | null | undefined,
  config: CutoffRangeConfig,
) {
  const parsed = parseCutoffValue(value);
  if (!parsed) return "";
  if (parsed.start > config.max || parsed.end > config.max) {
    return `Cutoff cannot be more than ${config.max} for ${config.contextLabel}.`;
  }
  return "";
}
function getCutoffValidationMessageForConfig(config: CutoffRangeConfig) {
  return `Enter cutoff like 190, 190.5, or a range like 190-195. ${config.contextLabel} cutoff must stay within 0-${config.max} (${config.scaleLabel}).`;
}
function isCutoffWithinRangeConfig(
  value: string | number | null | undefined,
  config: CutoffRangeConfig,
) {
  const parsed = parseCutoffValue(value);
  if (!parsed) return false;
  return parsed.start >= 0 && parsed.end >= 0 && parsed.start <= config.max && parsed.end <= config.max;
}
const formatPreviewCellValue = (value: unknown, column?: string) => {
  const raw = String(value ?? "").trim();
  if (!raw) return column === "accreditation" ? "Empty" : "-";
  if (column === "phoneNumber" || column === "alternatePhone" || column === "pincode") return normalizeScientificIntegerText(raw);
  if (/^-?\d+\.0+$/.test(raw)) return stripTrailingZeroDecimal(raw);
  if (/^\d+$/.test(raw) && raw.length > 1 && raw.startsWith("0")) return raw;
  return raw;
};

type AdminCollegesCoursesSectionProps = {
  activeTab: any;
  addCustomCourseCatalogItem: any;
  addCustomStreamOption: any;
  adminDataRequestKeyRef: any;
  adminState: any;
  availableCountries: any;
  availableDistricts: any;
  availableStates: any;
  availableStreamOptions: any;
  brochureFile: any;
  canAccess: any;
  collegeCardPageOptions: any;
  collegeCardsPageEnd: any;
  collegeCardsPageStart: any;
  collegeCardsPerPage: any;
  collegeCardsTotalPages: any;
  clearCollegeFieldError: any;
  collegeFieldErrors: any;
  collegeForm: any;
  collegeFormRef: any;
  collegeImagePreviews: any;
  collegeNotificationsPage: any;
  collegeNotificationsSearchText: any;
  collegeSearchText: any;
  collegeStep: any;
  collegeSteps: any;
  courseCustomFieldMode: any;
  courseCutoffRangeConfig: any;
  courseForm: any;
  courseNameSelectValue: any;
  courseQualificationOptions: any;
  courseResolvedCourseName: any;
  courseSpecializationEntries: any;
  courseSpecializationOptionValues: any;
  courseSpecializationSelectValue: any;
  courseStreamOptionsForForm: any;
  courseStreamSelectValue: any;
  courseTypeOptions: any;
  coverImageFile: any;
  coverImagePreviewUrl: any;
  currentCollegeCardsPage: any;
  currentUser: any;
  customCourseCatalog: any;
  customFacilityInput: any;
  customQuotaInput: any;
  customScholarshipInput: any;
  customStandaloneStreams: any;
  deleteCollegeDialog: any;
  deleteEnquiryDialog: any;
  deleteExamDialog: any;
  deleteSubAdminDialog: any;
  deleteUserDialog: any;
  editCollegeId: any;
  editCourseId: any;
  editExamId: any;
  editSubAdminId: any;
  editedCollegesPage: any;
  editingEmbeddedCourseIndex: any;
  embeddedCourseCustomFieldMode: any;
  embeddedCourseForm: any;
  embeddedCourseNameSelectValue: any;
  embeddedCourseTypeOptions: any;
  embeddedCourses: any;
  embeddedCutoffRangeConfig: any;
  embeddedQualificationOptions: any;
  embeddedResolvedCourseName: any;
  embeddedSpecializationEntries: any;
  embeddedSpecializationOptionValues: any;
  embeddedSpecializationSelectValue: any;
  embeddedStreamOptions: any;
  embeddedStreamSelectValue: any;
  examForm: any;
  examFormRef: any;
  examNameInputRef: any;
  examSchedulesPage: any;
  examSchedulesTotalPages: any;
  examTableRows: any;
  expandedCollegeIds: any;
  filteredCollegeCards: any;
  filteredUsers: any;
  firstCollegeImagePreviewUrl: any;
  getAdminSectionKeys: any;
  getCourseTypeOptionsForSelection: any;
  getSpecializationOptionsForSelection: any;
  handleBulkImportComplete: any;
  hasHostelFacility: any;
  imageFiles: any;
  isDeletingCollege: any;
  isDeletingEnquiry: any;
  isDeletingExam: any;
  isDeletingSubAdmin: any;
  isDeletingUser: any;
  isSeenNotificationsReady: any;
  isSendingCollegeEditReminders: any;
  isSendingPasswordLink: any;
  lastSeenNotificationAt: any;
  lastSeenNotificationAtRef: any;
  loadAdminData: any;
  loadedAdminSectionsRef: any;
  loading: any;
  loadingAdminSectionsRef: any;
  logoFile: any;
  logoPreviewUrl: any;
  navItems: any;
  normalizedCourseStreamValue: any;
  normalizedEmbeddedStream: any;
  pathname: any;
  pendingCollegesPage: any;
  router: any;
  safeCollegeCardsPage: any;
  savedExams: any;
  saveCollege: any;
  saveCourse: any;
  saveEmbeddedCourseDraft: any;
  handleTabChange: any;
  openCollegeEditor: any;
  openDeleteCollegeDialog: any;
  resetCollegeForm: any;
  resetCourseForm: any;
  runAction: any;
  searchParams: any;
  seenNotificationHydratedRef: any;
  seenNotificationIds: any;
  seenNotificationIdsRef: any;
  selectedCourseCollegeId: any;
  selectedFacilities: any;
  selectedQuotas: any;
  selectedScholarships: any;
  setActiveTab: any;
  setAdminState: any;
  setBrochureFile: any;
  setCollegeFieldErrors: any;
  setCollegeForm: any;
  setCollegeNotificationsPage: any;
  setCollegeNotificationsSearchText: any;
  setCollegeSearchText: any;
  setCollegeStep: any;
  setCourseCustomFieldMode: any;
  setCourseForm: any;
  setCoverImageFile: any;
  setCurrentCollegeCardsPage: any;
  setCurrentUser: any;
  setCustomCourseCatalog: any;
  setCustomFacilityInput: any;
  setCustomQuotaInput: any;
  setCustomScholarshipInput: any;
  setCustomStandaloneStreams: any;
  setDeleteCollegeDialog: any;
  setDeleteEnquiryDialog: any;
  setDeleteExamDialog: any;
  setDeleteSubAdminDialog: any;
  setDeleteUserDialog: any;
  setEditCollegeId: any;
  setEditCourseId: any;
  setEditExamId: any;
  setEditSubAdminId: any;
  setEditedCollegesPage: any;
  setEditingEmbeddedCourseIndex: any;
  setEmbeddedCourseCustomFieldMode: any;
  setEmbeddedCourseForm: any;
  setEmbeddedCourses: any;
  setExamForm: any;
  setExamSchedulesPage: any;
  setExpandedCollegeIds: any;
  setImageFiles: any;
  setIsDeletingCollege: any;
  setIsDeletingEnquiry: any;
  setIsDeletingExam: any;
  setIsDeletingSubAdmin: any;
  setIsDeletingUser: any;
  setIsSeenNotificationsReady: any;
  setIsSendingCollegeEditReminders: any;
  setIsSendingPasswordLink: any;
  setLastSeenNotificationAt: any;
  setLoading: any;
  setLogoFile: any;
  setPendingCollegesPage: any;
  setSavedExams: any;
  setSeenNotificationIds: any;
  setSelectedCourseCollegeId: any;
  setShowCollegeEditReminderConfirm: any;
  setShowCollegeForm: any;
  setShowCourseForm: any;
  setShowEmbeddedCourseEditor: any;
  setShowRequestNotifications: any;
  setShowSavedCourseList: any;
  setShowSubAdminForm: any;
  setSiteSettings: any;
  setStatusState: any;
  setStatusText: any;
  setSubAdminForm: any;
  setUsersPage: any;
  setUsersSearchText: any;
  resetCollegeForm: any;
  navigateCollegeStep: any;
  saveCollege: any;
  saveCourse: any;
  saveEmbeddedCourseDraft: any;
  showCollegeEditReminderConfirm: any;
  showCollegeForm: any;
  showCourseForm: any;
  showEmbeddedCourseEditor: any;
  showRequestNotifications: any;
  showSavedCourseList: any;
  showSubAdminForm: any;
  siteSettings: any;
  statusState: any;
  statusText: any;
  subAdminForm: any;
  token: any;
  totalCollegeImageCount: any;
  navigateCollegeStep: any;
  usersPage: any;
  usersPageEnd: any;
  usersPageStart: any;
  usersPaginationItems: any;
  usersSearchText: any;
  usersTotalPages: any;
  visibleCollegeCards: any;
  visibleExamTableRows: any;
  visibleUsers: any;
};

export default function AdminCollegesCoursesSection(props: AdminCollegesCoursesSectionProps) {
  const {
    activeTab,
    addCustomCourseCatalogItem,
    addCustomStreamOption,
    adminDataRequestKeyRef,
    adminState,
    availableCountries,
    availableDistricts,
    availableStates,
    availableStreamOptions,
    brochureFile,
    canAccess,
    collegeCardPageOptions,
    collegeCardsPageEnd,
    collegeCardsPageStart,
    collegeCardsPerPage,
    collegeCardsTotalPages,
    collegeFieldErrors,
    collegeForm,
    collegeFormRef,
    collegeImagePreviews,
    collegeNotificationsPage,
    collegeNotificationsSearchText,
    collegeSearchText,
    collegeStep,
    courseCustomFieldMode,
    courseCutoffRangeConfig,
    courseForm,
    courseNameSelectValue,
    courseQualificationOptions,
    courseResolvedCourseName,
    courseSpecializationEntries,
    courseSpecializationOptionValues,
    courseSpecializationSelectValue,
    courseStreamOptionsForForm,
    courseStreamSelectValue,
    courseTypeOptions,
    coverImageFile,
    coverImagePreviewUrl,
    currentCollegeCardsPage,
    currentUser,
    customCourseCatalog,
    customFacilityInput,
    customQuotaInput,
    customScholarshipInput,
    customStandaloneStreams,
    deleteCollegeDialog,
    deleteEnquiryDialog,
    deleteExamDialog,
    deleteSubAdminDialog,
    deleteUserDialog,
    editCollegeId,
    editCourseId,
    editExamId,
    editSubAdminId,
    editedCollegesPage,
    editingEmbeddedCourseIndex,
    embeddedCourseCustomFieldMode,
    embeddedCourseForm,
    embeddedCourseNameSelectValue,
    embeddedCourseTypeOptions,
    embeddedCourses,
    embeddedCutoffRangeConfig,
    embeddedQualificationOptions,
    embeddedResolvedCourseName,
    embeddedSpecializationEntries,
    embeddedSpecializationOptionValues,
    embeddedSpecializationSelectValue,
    embeddedStreamOptions,
    embeddedStreamSelectValue,
    examForm,
    examFormRef,
    examNameInputRef,
    examSchedulesPage,
    examSchedulesTotalPages,
    examTableRows,
    expandedCollegeIds,
    filteredCollegeCards,
    filteredUsers,
    firstCollegeImagePreviewUrl,
    getAdminSectionKeys,
    getCourseTypeOptionsForSelection,
    getSpecializationOptionsForSelection,
    handleBulkImportComplete,
    hasHostelFacility,
    imageFiles,
    isDeletingCollege,
    isDeletingEnquiry,
    isDeletingExam,
    isDeletingSubAdmin,
    isDeletingUser,
    isSeenNotificationsReady,
    isSendingCollegeEditReminders,
    isSendingPasswordLink,
    lastSeenNotificationAt,
    lastSeenNotificationAtRef,
    loadAdminData,
    loadedAdminSectionsRef,
    loading,
    loadingAdminSectionsRef,
    logoFile,
    logoPreviewUrl,
    navItems,
    normalizedCourseStreamValue,
    normalizedEmbeddedStream,
    pathname,
    pendingCollegesPage,
    router,
    safeCollegeCardsPage,
    savedExams,
    saveCollege,
    saveCourse,
    saveEmbeddedCourseDraft,
    handleTabChange,
    openCollegeEditor,
    openDeleteCollegeDialog,
    resetCollegeForm,
    resetCourseForm,
    runAction,
    searchParams,
    seenNotificationHydratedRef,
    seenNotificationIds,
    seenNotificationIdsRef,
    selectedCourseCollegeId,
    selectedFacilities,
    selectedQuotas,
    selectedScholarships,
    setActiveTab,
  setAdminState,
  setBrochureFile,
  setCollegeFieldErrors,
    setCollegeForm: setCollegeFormRaw,
  setCollegeNotificationsPage,
    setCollegeNotificationsSearchText,
    setCollegeSearchText,
    setCollegeStep,
    setCourseCustomFieldMode,
    setCourseForm,
    setCoverImageFile,
    setCurrentCollegeCardsPage,
    setCurrentUser,
    setCustomCourseCatalog,
    setCustomFacilityInput,
    setCustomQuotaInput,
    setCustomScholarshipInput,
    setCustomStandaloneStreams,
    setDeleteCollegeDialog,
    setDeleteEnquiryDialog,
    setDeleteExamDialog,
    setDeleteSubAdminDialog,
    setDeleteUserDialog,
    setEditCollegeId,
    setEditCourseId,
    setEditExamId,
    setEditSubAdminId,
    setEditedCollegesPage,
    setEditingEmbeddedCourseIndex,
    setEmbeddedCourseCustomFieldMode,
    setEmbeddedCourseForm,
    setEmbeddedCourses,
    setExamForm,
    setExamSchedulesPage,
    setExpandedCollegeIds,
    setImageFiles,
    setIsDeletingCollege,
    setIsDeletingEnquiry,
    setIsDeletingExam,
    setIsDeletingSubAdmin,
    setIsDeletingUser,
    setIsSeenNotificationsReady,
    setIsSendingCollegeEditReminders,
    setIsSendingPasswordLink,
    setLastSeenNotificationAt,
    setLoading,
    setLogoFile,
    setPendingCollegesPage,
    setSavedExams,
    setSeenNotificationIds,
    setSelectedCourseCollegeId,
    setShowCollegeEditReminderConfirm,
    setShowCollegeForm,
    setShowCourseForm,
    setShowEmbeddedCourseEditor,
    setShowRequestNotifications,
    setShowSavedCourseList,
    setShowSubAdminForm,
    setSiteSettings,
    setStatusState,
    setStatusText,
    setSubAdminForm,
    setUsersPage,
    setUsersSearchText,
    showCollegeEditReminderConfirm,
    showCollegeForm,
    showCourseForm,
    showEmbeddedCourseEditor,
    showRequestNotifications,
    showSavedCourseList,
    showSubAdminForm,
    siteSettings,
    statusState,
    statusText,
    subAdminForm,
    token,
    totalCollegeImageCount,
    usersPage,
    usersPageEnd,
    usersPageStart,
    usersPaginationItems,
    usersSearchText,
    usersTotalPages,
    visibleCollegeCards,
    visibleExamTableRows,
    visibleUsers
  } = props;
  const setCollegeForm = setCollegeFormRaw as Dispatch<SetStateAction<Record<string, any>>>;
  const getCollegeInputClass = (field: string) =>
    collegeFieldErrors[field] ? `${inputClass} border-rose-300 focus:border-rose-300 focus:ring-rose-100` : inputClass;
  const clearCollegeFieldError = (field: string) => {
    setCollegeFieldErrors((prev: Record<string, string>) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const collegeFieldErrorsSafe = collegeFieldErrors ?? {};
  const resolvedCollegeSteps = Array.isArray(collegeSteps) && collegeSteps.length > 0
    ? collegeSteps
    : ["College Basic Details", "Media & Facilities", "Admission & Placement", "Courses & Cutoff"];
  const handleNavigateCollegeStep = typeof navigateCollegeStep === "function" ? navigateCollegeStep : () => {};
  const handleResetCollegeForm = typeof resetCollegeForm === "function" ? resetCollegeForm : () => {};
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
  const handleEmbeddedCutoffBlur = (_segment: "start" | "end") => () => {
    setEmbeddedCourseForm((prev) => {
      const normalized = normalizeCutoffInput(prev.cutoffValue);
      return normalized ? { ...prev, cutoffValue: normalized } : prev;
    });
  };
  const embeddedCutoffWarning = getCutoffLimitWarning(
    embeddedCourseForm.cutoffValue || embeddedCourseForm.cutoff,
    embeddedCutoffRangeConfig,
  );
  const upsertEmbeddedCourseCutoff = () => {
    const category = String(embeddedCourseForm.cutoffCategory || "").trim().toUpperCase();
    const cutoffValue = formatCutoffForSave(embeddedCourseForm.cutoffValue || embeddedCourseForm.cutoff);
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

    setEmbeddedCourseForm((prev) => {
      const nextCutoffs = normalizeCategoryCutoffs(prev.cutoffByCategory).filter((item) => item.category !== category);
      nextCutoffs.push({ category, cutoff: cutoffValue });
      const sortedCutoffs = normalizeCategoryCutoffs(nextCutoffs);
      return {
        ...prev,
        cutoffByCategory: sortedCutoffs,
        cutoff: resolvePrimaryCategoryCutoff(sortedCutoffs, cutoffValue),
        cutoffCategory: category,
        cutoffValue,
      };
    });
    setStatusText("");
  };
  const removeEmbeddedCourseCutoff = (category: string) => {
    setEmbeddedCourseForm((prev) => {
      const nextCutoffs = normalizeCategoryCutoffs(prev.cutoffByCategory).filter((item) => item.category !== category);
      const activeCategory = nextCutoffs.some((item) => item.category === prev.cutoffCategory)
        ? prev.cutoffCategory
        : nextCutoffs[0]?.category || defaultCutoffCategory;
      return {
        ...prev,
        cutoffByCategory: nextCutoffs,
        cutoff: resolvePrimaryCategoryCutoff(nextCutoffs, prev.cutoff || prev.cutoffValue),
        cutoffCategory: activeCategory,
        cutoffValue: getCutoffValueForCategory(nextCutoffs, activeCategory),
      };
    });
  };
  const resetEmbeddedCourseEditor = () => {
    setEmbeddedCourseForm(createEmptyEmbeddedCourseDraft(String(collegeForm?.university || "").trim()));
    setEditingEmbeddedCourseIndex(null);
    setShowEmbeddedCourseEditor(false);
  };
  const normalizedRankingInput = normalizeRankingRangeInput(collegeForm?.ranking || "");
  const [rankingStartInput = "", rankingEndInput = ""] = normalizedRankingInput.split("-");
  const updateCollegeRankingPart = (part: "start" | "end", value: string) => {
    const nextValue = value.replace(/\D/g, "").slice(0, 4);
    setCollegeForm((prev) => {
      const currentInput = normalizeRankingRangeInput(prev.ranking);
      const [currentStart = "", currentEnd = ""] = currentInput.split("-");

      return {
        ...prev,
        ranking:
          part === "start"
            ? nextValue
              ? `${nextValue}${currentEnd ? `-${currentEnd}` : ""}`
              : currentEnd
                ? `-${currentEnd}`
                : ""
            : currentStart
              ? `${currentStart}${nextValue ? `-${nextValue}` : ""}`
              : nextValue
                ? nextValue
                : "",
      };
    });
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
    const nextValue = String(customFacilityInput || "").trim();
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
    const nextValue = String(customQuotaInput || "").trim();
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
    const nextValue = String(customScholarshipInput || "").trim();
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

  return (
    <>
      {!loading && activeTab === "colleges" ? (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => (showCollegeForm ? handleResetCollegeForm() : setShowCollegeForm(true))}
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
                    style={{ width: `${Math.max(0, (collegeStep / Math.max(resolvedCollegeSteps.length - 1, 1)) * 94)}%` }}
                  />
                  <div
                    className="relative grid gap-2"
                    style={{ gridTemplateColumns: `repeat(${resolvedCollegeSteps.length}, minmax(0, 1fr))` }}
                  >
                    {resolvedCollegeSteps.map((stepLabel, index) => {
                      const isActive = collegeStep === index;
                      const isCompleted = index < collegeStep;

                      return (
                        <button
                          key={stepLabel}
                          type="button"
                          onClick={() => handleNavigateCollegeStep(index)}
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
                  {resolvedCollegeSteps.map((stepLabel, index) => {
                    const isActive = collegeStep === index;
                    const isCompleted = index < collegeStep;

                    return (
                      <button
                        key={stepLabel}
                        type="button"
                        onClick={() => handleNavigateCollegeStep(index)}
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
                  {collegeFieldErrorsSafe.name ? <span className={errorTextClass}>{collegeFieldErrorsSafe.name}</span> : null}
                </label>
                <label className="xl:col-span-2">
                  <span className={labelClass}>Description<span className={requiredMarkClass}>*</span></span>
                  <textarea className={getCollegeInputClass("description")} rows={2} placeholder="College overview" value={collegeForm.description} onChange={(event) => { clearCollegeFieldError("description"); setCollegeForm((prev) => ({ ...prev, description: event.target.value })); }} required />
                  {collegeFieldErrorsSafe.description ? <span className={errorTextClass}>{collegeFieldErrorsSafe.description}</span> : null}
                </label>
                <label>
                  <span className={labelClass}>Established Year<span className={requiredMarkClass}>*</span></span>
                  <input className={getCollegeInputClass("establishedYear")} type="number" placeholder="1998" value={collegeForm.establishedYear} onChange={(event) => { clearCollegeFieldError("establishedYear"); setCollegeForm((prev) => ({ ...prev, establishedYear: event.target.value })); }} required />
                  {collegeFieldErrorsSafe.establishedYear ? <span className={errorTextClass}>{collegeFieldErrorsSafe.establishedYear}</span> : null}
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
                  {collegeFieldErrorsSafe.university ? <span className={errorTextClass}>{collegeFieldErrorsSafe.university}</span> : null}
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
                  {collegeFieldErrorsSafe.country ? <span className={errorTextClass}>{collegeFieldErrorsSafe.country}</span> : null}
                </label>
                <label>
                  <span className={labelClass}>State<span className={requiredMarkClass}>*</span></span>
                  <select className={getCollegeInputClass("state")} value={collegeForm.state} onChange={(event) => { clearCollegeFieldError("state"); setCollegeForm((prev) => ({ ...prev, state: event.target.value, district: "" })); }} required>
                    <option value="">Select state</option>
                    {availableStates.map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                  {collegeFieldErrorsSafe.state ? <span className={errorTextClass}>{collegeFieldErrorsSafe.state}</span> : null}
                </label>
                <label>
                  <span className={labelClass}>City<span className={requiredMarkClass}>*</span></span>
                  <input className={getCollegeInputClass("city")} placeholder="Enter city" value={collegeForm.city} onChange={(event) => { clearCollegeFieldError("city"); setCollegeForm((prev) => ({ ...prev, city: event.target.value })); }} required />
                  {collegeFieldErrorsSafe.city ? <span className={errorTextClass}>{collegeFieldErrorsSafe.city}</span> : null}
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
                  {collegeFieldErrorsSafe.address ? <span className={errorTextClass}>{collegeFieldErrorsSafe.address}</span> : null}
                </label>
                <label>
                  <span className={labelClass}>Pincode<span className={requiredMarkClass}>*</span></span>
                  <input className={getCollegeInputClass("pincode")} placeholder="Enter pincode" value={collegeForm.pincode} onChange={(event) => { clearCollegeFieldError("pincode"); setCollegeForm((prev) => ({ ...prev, pincode: event.target.value })); }} required />
                  {collegeFieldErrorsSafe.pincode ? <span className={errorTextClass}>{collegeFieldErrorsSafe.pincode}</span> : null}
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
                  {collegeFieldErrorsSafe.contactEmail ? <span className={errorTextClass}>{collegeFieldErrorsSafe.contactEmail}</span> : null}
                </label>
                <label>
                  <span className={labelClass}>Phone Number<span className={requiredMarkClass}>*</span></span>
                  <input className={getCollegeInputClass("contactPhone")} type="tel" inputMode="tel" maxLength={24} placeholder="Phone number or landline" value={collegeForm.contactPhone} onChange={(event) => { clearCollegeFieldError("contactPhone"); setCollegeForm((prev) => ({ ...prev, contactPhone: normalizeIndianPhoneInput(event.target.value) })); }} required />
                  {collegeFieldErrorsSafe.contactPhone ? <span className={errorTextClass}>{collegeFieldErrorsSafe.contactPhone}</span> : null}
                </label>
                <label>
                  <span className={labelClass}>Alternate Phone</span>
                  <input className={getCollegeInputClass("alternatePhone")} type="tel" inputMode="tel" maxLength={24} placeholder="Alternate phone or landline" value={collegeForm.alternatePhone} onChange={(event) => { clearCollegeFieldError("alternatePhone"); setCollegeForm((prev) => ({ ...prev, alternatePhone: normalizeIndianPhoneInput(event.target.value) })); }} />
                  {collegeFieldErrorsSafe.alternatePhone ? <span className={errorTextClass}>{collegeFieldErrorsSafe.alternatePhone}</span> : null}
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
                    {collegeFieldErrorsSafe.logo ? <span className={errorTextClass}>{collegeFieldErrorsSafe.logo}</span> : null}
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
                    {collegeFieldErrorsSafe.coverImage ? <span className={errorTextClass}>{collegeFieldErrorsSafe.coverImage}</span> : null}
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
                      const selectedFiles = Array.from(event.target.files || []);
                      if (!selectedFiles.length) return;
                      const remainingSlots = Math.max(0, 7 - collegeForm.images.length - imageFiles.length);
                      if (remainingSlots === 0) {
                        setStatusText("Maximum 7 gallery images allowed");
                        event.currentTarget.value = "";
                        return;
                      }
                      const nextFiles = selectedFiles.slice(0, remainingSlots);
                      clearCollegeFieldError("images");
                      setImageFiles((prev) => [...prev, ...nextFiles]);
                      setStatusText(
                        selectedFiles.length > remainingSlots
                          ? `Only ${remainingSlots} more image(s) added. Maximum 7 gallery images allowed.`
                          : `${collegeForm.images.length + imageFiles.length + nextFiles.length} college image(s) selected`,
                      );
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
                        <p className="text-sm leading-6 text-slate-500">Select multiple images at once. Minimum 2 images, maximum 7 images. Selected: {totalCollegeImageCount}</p>
                      </div>
                      <div className="lg:justify-self-end">
                        <span className={mediaUploadButtonClass}>{totalCollegeImageCount > 0 ? "Add multiple images" : "Upload multiple images"}</span>
                      </div>
                    </div>
                  </label>
                  {collegeFieldErrorsSafe.images ? <span className={errorTextClass}>{collegeFieldErrorsSafe.images}</span> : null}
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
                  {collegeFieldErrorsSafe.ranking ? (
                    <span className={errorTextClass}>{collegeFieldErrorsSafe.ranking}</span>
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
                  {collegeFieldErrorsSafe.feeMin || collegeFieldErrorsSafe.feeMax ? (
                    <span className={errorTextClass}>
                      {collegeFieldErrorsSafe.feeMin || collegeFieldErrorsSafe.feeMax}
                    </span>
                  ) : null}
                </label>
                <label className="xl:col-span-2">
                  <span className={labelClass}>Admission Process<span className={requiredMarkClass}>*</span></span>
                  <textarea className={getCollegeInputClass("admissionProcess")} rows={2} placeholder="Admission process" value={collegeForm.admissionProcess} onChange={(event) => { clearCollegeFieldError("admissionProcess"); setCollegeForm((prev) => ({ ...prev, admissionProcess: event.target.value })); }} required />
                  {collegeFieldErrorsSafe.admissionProcess ? <span className={errorTextClass}>{collegeFieldErrorsSafe.admissionProcess}</span> : null}
                </label>
                <label>
                  <span className={labelClass}>Application Mode<span className={requiredMarkClass}>*</span></span>
                  <select className={getCollegeInputClass("applicationMode")} value={collegeForm.applicationMode} onChange={(event) => { clearCollegeFieldError("applicationMode"); setCollegeForm((prev) => ({ ...prev, applicationMode: event.target.value })); }}>
                    <option value="">Select application mode</option>
                    {applicationModeOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  {collegeFieldErrorsSafe.applicationMode ? <span className={errorTextClass}>{collegeFieldErrorsSafe.applicationMode}</span> : null}
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
                  {collegeFieldErrorsSafe.hostelType ? <span className={errorTextClass}>{collegeFieldErrorsSafe.hostelType}</span> : null}
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
                  {collegeFieldErrorsSafe.hostelFeeMin ? <span className={errorTextClass}>{collegeFieldErrorsSafe.hostelFeeMin}</span> : null}
                </label>
                <label>
                  <span className={labelClass}>CCTV Availability<span className={requiredMarkClass}>*</span></span>
                  <select className={getCollegeInputClass("cctvAvailable")} value={collegeForm.cctvAvailable} onChange={(event) => { clearCollegeFieldError("cctvAvailable"); setCollegeForm((prev) => ({ ...prev, cctvAvailable: event.target.value })); }}>
                    <option value="">CCTV availability</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                  {collegeFieldErrorsSafe.cctvAvailable ? <span className={errorTextClass}>{collegeFieldErrorsSafe.cctvAvailable}</span> : null}
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
                            value={getCutoffRangeParts(embeddedCourseForm.cutoffValue || embeddedCourseForm.cutoff || "").start}
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
                            value={getCutoffRangeParts(embeddedCourseForm.cutoffValue || embeddedCourseForm.cutoff || "").end}
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
                {collegeStep < resolvedCollegeSteps.length - 1 ? (
                  <button type="button" onClick={() => handleNavigateCollegeStep(Math.min(collegeStep + 1, resolvedCollegeSteps.length - 1))} className={softButtonClass}>
                    Next
                  </button>
                ) : null}
                <button type={collegeStep === resolvedCollegeSteps.length - 1 ? "submit" : "button"} className={primaryButtonClass} onClick={() => {
                  if (collegeStep < resolvedCollegeSteps.length - 1) {
                    handleNavigateCollegeStep(Math.min(collegeStep + 1, resolvedCollegeSteps.length - 1));
                  }
                }}>
                  {collegeStep === resolvedCollegeSteps.length - 1
                    ? editCollegeId
                      ? "Update College"
                      : "Save College"
                    : "Continue"}
                </button>
              </div>
            </form>
          ) : null}

          <div className="mb-4 w-full rounded-2xl border border-[#dbe7fb] bg-white p-3 shadow-[0_12px_28px_rgba(59,91,139,0.08)]">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <label className="relative block w-full lg:max-w-[34rem]">
                <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#2563eb]" strokeWidth={2} />
                <input
                  value={collegeSearchText}
                  onChange={(event) => setCollegeSearchText(event.target.value)}
                  placeholder="Search by college name or location"
                  className="h-12 w-full rounded-xl border border-[#cfe0ff] bg-[#f8fbff] pl-12 pr-4 text-sm font-semibold text-[#061647] outline-none transition placeholder:text-[#6b7fa7] focus:border-[#2563eb] focus:bg-white focus:shadow-[0_0_0_4px_rgba(37,99,235,0.12)]"
                />
              </label>

              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-bold text-[#526995]">
                  {filteredCollegeCards.length} of {adminState.colleges.length} colleges
                </span>
                {collegeSearchText ? (
                  <button
                    type="button"
                    onClick={() => setCollegeSearchText("")}
                    className="inline-flex h-10 items-center justify-center rounded-lg border border-[#cfe0ff] bg-white px-4 text-xs font-black text-[#2563eb] transition hover:bg-[#eff6ff]"
                  >
                    Clear
                  </button>
                ) : null}

                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#526995]">Page</span>
                  <div className="relative inline-flex items-center">
                    <select
                      value={String(safeCollegeCardsPage)}
                      onChange={(event) => setCurrentCollegeCardsPage(Number(event.target.value) || 1)}
                      className="h-10 appearance-none bg-transparent pl-0 pr-8 text-sm font-semibold text-[#061647] outline-none"
                    >
                      {collegeCardPageOptions.map((page) => (
                        <option key={page.value} value={page.value}>
                          {page.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-0 top-1/2 size-4 -translate-y-1/2 text-[#526995]" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-2 text-xs font-semibold text-[#6b7fa7]">
              Showing {collegeCardsPageStart}-{collegeCardsPageEnd} of {filteredCollegeCards.length}
            </div>
          </div>

          {visibleCollegeCards.length ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {visibleCollegeCards.map((college) => {
              const range = formatFeeRange(college.feesStructure);
              const isExpanded = expandedCollegeIds.includes(college._id);
              const courseCount = adminState.courses.filter((course) =>
                doesAdminCourseBelongToCollege(course, college),
              ).length;

              return (
                <article key={college._id} className="relative flex min-h-[16.75rem] flex-col rounded-[1.35rem] border border-[#e9f0fb] bg-white p-5 shadow-[0_18px_40px_rgba(59,91,139,0.12)]">
                  <div className="flex min-h-[6.75rem] items-start gap-4">
                    {college.logo ? (
                      <CollegeLogoBadge
                        src={college.logo}
                        alt={college.name || "College"}
                        className="h-16 w-16 shrink-0 rounded-[1.25rem] bg-[#f1f6ff]"
                        imageClassName="p-2.5"
                      />
                    ) : (
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.25rem] bg-[#f1f6ff] shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
                        <Building2 className="size-8 text-[#2563eb]" strokeWidth={1.9} />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <h3 className="line-clamp-3 break-words text-lg font-black leading-6 text-[#061647]">{college.name || "College"}</h3>
                      <p className="mt-2 line-clamp-1 break-words text-sm font-semibold leading-6 text-[#526995]">{college.university || "-"}</p>
                      <p className="mt-2 flex min-h-5 items-start gap-2 break-words text-sm font-semibold leading-5 text-[#526995]">
                        <MapPin className="mt-0.5 size-4 shrink-0 fill-[#2563eb] text-[#2563eb]" />
                        <span className="line-clamp-2">{[college.district, college.state].filter(Boolean).join(", ") || "-"}</span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-2 flex min-h-[1.25rem] items-start">
                    {college.isTopCollege || college.isBestCollege ? (
                      <span className="inline-flex w-max rounded-full bg-[#eff6ff] px-3 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#2563eb]">
                        Best College
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3">
                    {[
                      { label: "Courses", value: courseCount || "-", icon: Users },
                      { label: "Type", value: college.ownershipType || "-", icon: Building2 },
                    ].map((item) => {
                      const MetricIcon = item.icon;
                      return (
                        <div key={item.label} className="flex min-h-[4.55rem] items-center gap-2 rounded-lg bg-[#f4f8ff] px-3 py-3">
                          <MetricIcon className="size-5 shrink-0 text-[#2563eb]" strokeWidth={2} />
                          <div className="min-w-0">
                            <p className="text-xs font-bold leading-4 text-[#445b85]">{item.label}</p>
                            <p className="mt-1 break-words text-xs font-black leading-4 text-black sm:text-sm">{item.value}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {isExpanded ? (
                    <div className="mt-4 rounded-lg border border-[#d8e6ff] bg-[#f8fbff] px-3 py-2.5 text-xs font-semibold leading-5 text-[#526995]">
                      <p>Fees: {formatCompactIndianCurrencyRange(range.min, range.max)}</p>
                      <p>Tags: {college.courseTags || "-"}</p>
                      <p>Facilities: {Array.isArray(college.facilities) ? college.facilities.join(", ") : (college.facilities || "-")}</p>
                      <p>Placement: {String((college.placements?.placementRate ?? college.placementRate) || "-")}</p>
                      <p>Contact: {college.contactPhone || college.phone || "-"}</p>
                    </div>
                  ) : null}

                  <div className="mt-auto pt-6">
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedCollegeIds((prev) =>
                            prev.includes(college._id)
                              ? prev.filter((item) => item !== college._id)
                              : [...prev, college._id],
                          )
                        }
                        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-[#80adff] bg-white px-3 text-sm font-black text-[#2563eb] transition hover:bg-[#eff6ff]"
                      >
                        {isExpanded ? "Hide Info" : "See Details"}
                        <ChevronRight className="size-5" />
                      </button>
                      <Link href={`/college/${college._id}`} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#2563eb] px-3 text-sm font-black text-white shadow-[0_12px_22px_rgba(37,99,235,0.2)] transition hover:bg-[#1d4ed8]">
                        View
                        <ExternalLink className="size-4" />
                      </Link>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3 border-t border-[#d7deea] pt-4">
                      <button
                        type="button"
                        onClick={() => openCollegeEditor(college)}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#2563eb] px-3 text-sm font-black text-white shadow-[0_10px_18px_rgba(37,99,235,0.18)] transition hover:bg-[#1d4ed8]"
                      >
                        <PencilLine className="size-4" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          openDeleteCollegeDialog(college, event.currentTarget);
                        }}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#ef4444] px-3 text-sm font-black text-white shadow-[0_10px_18px_rgba(239,68,68,0.18)] transition hover:bg-[#dc2626]"
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
          ) : (
            <div className="rounded-2xl border border-dashed border-[#cfe0ff] bg-white px-5 py-10 text-center text-sm font-semibold text-[#526995]">
              No colleges found for &quot;{collegeSearchText.trim()}&quot;.
            </div>
          )}
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
                        const collegeIds = (course.colleges || [])
                          .map((item) => (typeof item === "string" ? item : String(item._id || "")))
                          .filter(Boolean);
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
                          await loadAdminData(token, currentUser, activeTab, true);
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
    </>
  );
}
