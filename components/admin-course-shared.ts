"use client";

import { formatCutoffForSave, isValidCutoffValue, parseCutoffValue } from "@/lib/cutoff-utils";

export type ChangeSummaryItem = { field?: string; label?: string; before?: unknown; after?: unknown };
export type RequestItem = {
  _id: string;
  requesterName?: string;
  requesterEmail?: string;
  email?: string;
  phone?: string;
  message?: string;
  status?: string;
  updatedAt?: string;
  createdAt?: string;
  actionType?: string;
  payload?: {
    name?: string;
    course?: string;
    courseName?: string;
    duration?: string;
    logo?: string;
    image?: string;
    coverImage?: string;
    logoImage?: string;
  };
  submittedPayload?: Record<string, unknown> | null;
  changeSummary?: ChangeSummaryItem[];
  formAccessUsedAt?: string;
  grantedCollegeIds?: string[];
  allowOwnCollegeCreate?: boolean;
};

export type CategoryCutoff = { category?: string; cutoff?: string };
export type CourseCollegeDetailForm = {
  semesterFees: string;
  totalFees: string;
  cutoff: string;
  intake: string;
  applicationFee: string;
};
export type CourseExamForm = {
  examName: string;
  cutoffScoreOrRank: string;
  cutoffByCategory: CategoryCutoff[];
  cutoffCategory: string;
  cutoffValue: string;
  weightage: string;
  paperOrSyllabus: string;
  preparationNotes: string;
};
export type CourseForm = {
  courseType: string;
  degreeType: string;
  stream: string;
  specialization: string;
  duration: string;
  mode: string;
  lateralEntryAvailable: boolean;
  lateralEntryDetails: string;
  minimumQualification: string;
  university: string;
  admissionProcess: string;
  description: string;
  isTopCourse: boolean;
  entranceExamsEnabled: boolean;
  entranceExams: CourseExamForm[];
  colleges: string[];
  details: Record<string, CourseCollegeDetailForm>;
};
export type EmbeddedCourseDraft = {
  id?: string;
  courseType: string;
  degreeType: string;
  stream: string;
  specialization: string;
  duration: string;
  mode: string;
  lateralEntryAvailable: boolean;
  lateralEntryDetails: string;
  minimumQualification: string;
  university: string;
  admissionProcess: string;
  description: string;
  isTopCourse: boolean;
  entranceExamsEnabled: boolean;
  semesterFees: string;
  totalFees: string;
  cutoff: string;
  cutoffByCategory: CategoryCutoff[];
  cutoffCategory: string;
  cutoffValue: string;
  intake: string;
  applicationFee: string;
  entranceExams: CourseExamForm[];
};

export type CutoffRangeConfig = { max: number; scaleLabel: string; contextLabel: string };

export const normalizeAdminOption = (value?: string) => String(value || "").trim();
export const streamAliasMap: Record<string, string> = {
  "Computer Applications": "Arts & Science",
  Medical: "Medical / Health",
  Arts: "Arts & Science",
  Science: "Arts & Science",
  Commerce: "Arts & Science",
  Management: "Arts & Science",
  "Computer / IT": "Arts & Science",
};
export const inferToastTypeFromMessage = (message: string): "success" | "error" | "info" => {
  const normalized = String(message || "").toLowerCase();
  if (normalized.includes("success") || normalized.includes("saved") || normalized.includes("updated")) return "success";
  if (normalized.includes("error") || normalized.includes("failed") || normalized.includes("invalid")) return "error";
  return "info";
};
export const shouldSkipEmbeddedCutoffAutoAdvance = (
  event: { relatedTarget?: EventTarget | null },
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

export const cutoffValidationMessage =
  "Enter cutoff like 190, 190.5, or a range like 190-195. Each value must be between 0 and 9999.";
export const defaultCutoffCategory = "OC";

export const emptyCourseDetail = (): CourseCollegeDetailForm => ({
  semesterFees: "",
  totalFees: "",
  cutoff: "",
  intake: "",
  applicationFee: "",
});

export const emptyCourseExam = (): CourseExamForm => ({
  examName: "",
  cutoffScoreOrRank: "",
  cutoffByCategory: [],
  cutoffCategory: defaultCutoffCategory,
  cutoffValue: "",
  weightage: "",
  paperOrSyllabus: "",
  preparationNotes: "",
});

export const normalizeCategoryCutoffs = (value: unknown): CategoryCutoff[] => {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  return value
    .map((item) => ({
      category: String((item as CategoryCutoff)?.category || "").trim().toUpperCase(),
      cutoff: String((item as CategoryCutoff)?.cutoff || "").trim(),
    }))
    .filter((item) => {
      if (!item.category || !item.cutoff || seen.has(item.category)) return false;
      seen.add(item.category);
      return true;
    });
};

export const normalizeCategoryCutoffsWithFallback = (
  cutoffByCategory: unknown,
  fallbackCutoff: string | number | undefined = "",
  fallbackCategory: string = defaultCutoffCategory,
) => {
  const normalizedCutoffs = normalizeCategoryCutoffs(cutoffByCategory);
  if (normalizedCutoffs.length > 0) return normalizedCutoffs;

  const normalizedFallbackCutoff = String(fallbackCutoff || "").trim();
  const normalizedFallbackCategory = String(fallbackCategory || defaultCutoffCategory).trim().toUpperCase();
  if (!normalizedFallbackCutoff || !normalizedFallbackCategory) return [];

  return [{ category: normalizedFallbackCategory, cutoff: normalizedFallbackCutoff }];
};

export const getCutoffValueForCategory = (cutoffByCategory: CategoryCutoff[], category: string) =>
  normalizeCategoryCutoffs(cutoffByCategory).find(
    (item) => String(item.category || "").trim().toUpperCase() === String(category || "").trim().toUpperCase(),
  )?.cutoff || "";

export const getNextCutoffCategoryValue = (currentCategory: string, cutoffByCategory: CategoryCutoff[]) => {
  const normalizedCurrentCategory = String(currentCategory || "").trim().toUpperCase();
  const normalizedCutoffs = normalizeCategoryCutoffs(cutoffByCategory);
  const usedCategories = new Set(normalizedCutoffs.map((item) => String(item.category || "").trim().toUpperCase()));
  const orderedCategories = ["OC", "BC", "BCM", "MBC", "SC", "SCA", "ST"];
  const startIndex = Math.max(orderedCategories.indexOf(normalizedCurrentCategory), 0);

  for (let index = startIndex + 1; index < orderedCategories.length; index += 1) {
    if (!usedCategories.has(orderedCategories[index])) return orderedCategories[index];
  }
  for (let index = 0; index < orderedCategories.length; index += 1) {
    if (!usedCategories.has(orderedCategories[index])) return orderedCategories[index];
  }
  return orderedCategories[0] || normalizedCurrentCategory || defaultCutoffCategory;
};

export const resolvePrimaryCategoryCutoff = (
  cutoffByCategory: CategoryCutoff[],
  fallback: string | number | undefined = "",
) =>
  normalizeCategoryCutoffs(cutoffByCategory).find((item) => item.category === defaultCutoffCategory)?.cutoff ||
  normalizeCategoryCutoffs(cutoffByCategory)[0]?.cutoff ||
  formatCutoffForSave(fallback);

export const getNextEmbeddedCutoffSelection = (currentCategory: string, cutoffByCategory: CategoryCutoff[]) => {
  const nextCategory = getNextCutoffCategoryValue(currentCategory, cutoffByCategory);
  return {
    nextCategory,
    nextCutoffValue: getCutoffValueForCategory(cutoffByCategory, nextCategory),
  };
};

export const createCourseExamDraft = (exam?: Partial<CourseExamForm> | null): CourseExamForm => {
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

export const normalizeCourseExamDraftForSave = (exam: CourseExamForm) => {
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

export const buildCourseExamCutoffState = (exam: CourseExamForm, rangeConfig: CutoffRangeConfig) => {
  const category = String(exam.cutoffCategory || "").trim().toUpperCase();
  const cutoffValue = formatCutoffForSave(exam.cutoffValue);
  if (!category || !cutoffValue || !isValidCutoffValue(cutoffValue)) return null;

  const parsed = parseCutoffValue(cutoffValue);
  if (!parsed) return null;
  if (parsed.start < 0 || parsed.end < 0 || parsed.start > rangeConfig.max || parsed.end > rangeConfig.max) return null;

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

export const removeCourseExamCutoffState = (exam: CourseExamForm, category: string): CourseExamForm => {
  const nextCutoffs = normalizeCategoryCutoffs(exam.cutoffByCategory).filter((item) => item.category !== category);
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

export const emptyCourseDetailMap = {} as const;

export const createEmptyCourseForm = (university = ""): CourseForm => ({
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
  entranceExams: [emptyCourseExam()],
  colleges: [],
  details: {},
});

export const createEmptyEmbeddedCourseDraft = (university = ""): EmbeddedCourseDraft => ({
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
