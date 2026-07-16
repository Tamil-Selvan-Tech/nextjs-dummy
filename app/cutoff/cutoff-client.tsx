"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type Ref } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  Building2,
  CheckCircle2,
  CircleAlert,
  Bell,
  ChevronDown,
  FileText,
  GraduationCap,
  ChevronRight,
  LineChart,
  MapPin,
  Phone,
  LayoutGrid,
  List,
  Star,
  Target,
  User,
  Users,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { parseCutoffValue } from "@/lib/cutoff-utils";
import { formatRankingRangeForDisplay } from "@/lib/ranking-utils";
import { normalizeText, type College, type Course } from "@/lib/site-data";

type CutoffClientProps = {
  selectedLevel: string;
  selectedState: string;
  selectedDegree: string;
  selectedCourse: string;
  selectedSpecialization: string;
  selectedCategory: string;
  selectedDreamCollege: string;
  selectedCollegeType: string;
  selectedAdmissionType: string;
  enteredCutoff: string;
  studentName: string;
  submittedDetails: Record<string, string>;
  colleges: College[];
  courses: Course[];
  embedded?: boolean;
};

type SelectedLevelId = "6" | "7" | "8" | "9" | "10" | "11" | "12";

const compactSearchText = (value: string) => normalizeText(value).replace(/[^a-z0-9]/g, "");
// Supported level parser for cutoff page query params.
const normalizeSelectedLevel = (value: string): SelectedLevelId => {
  const digits = String(value || "").match(/\d+/)?.[0] || "";
  if (
    digits === "6" ||
    digits === "7" ||
    digits === "8" ||
    digits === "9" ||
    digits === "10" ||
    digits === "11" ||
    digits === "12"
  ) {
    return digits;
  }
  return "10";
};

// Predictor scale helper for degree and admission-type based cutoff calculations.
const getCutoffScale = (degree: string, admissionType: string) => {
  if (degree === "Medical") return 720;
  if (degree === "B.Arch") return 400;
  if (degree === "Arts & Science") return 600;
  if (degree === "Law") {
    return admissionType === "CLAT" ? 125 : 300;
  }
  if (degree === "Engineering") {
    if (admissionType === "JEE Main") return 300;
    if (admissionType === "JEE Advanced") return 360;
    return 200;
  }
  if (degree === "Agriculture") return 200;
  if (degree === "Paramedical") return 200;
  return 100;
};

// Category normalizer for category-wise cutoff matching.
const normalizeCategoryKey = (value: string) => {
  const normalized = normalizeText(value).replace(/[^a-z0-9]/g, "");
  if (!normalized) return "";
  if (["oc", "general", "open", "opencompetition", "ews"].includes(normalized)) return "OC";
  if (["bc", "obc", "backwardclass"].includes(normalized)) return "BC";
  if (["bcm", "backwardclassmuslim"].includes(normalized)) return "BCM";
  if (["mbc", "dnc", "mbcdnc", "mostbackwardclass"].includes(normalized)) return "MBC";
  if (["sca", "scheduledcastearunthathiyar"].includes(normalized)) return "SCA";
  if (["sc", "scheduledcaste"].includes(normalized)) return "SC";
  if (["st", "scheduledtribe"].includes(normalized)) return "ST";
  return normalized.toUpperCase();
};

const categoryDisplayLabel = (value: string) => {
  const category = normalizeCategoryKey(value);
  if (category === "OC") return "OC / General";
  if (category === "MBC") return "MBC / DNC";
  return category || "-";
};

const formatResultValue = (value: string) => {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "-";
  const numeric = Number(trimmed);
  if (!Number.isFinite(numeric)) return trimmed;
  return numeric.toFixed(1);
};

const formatCutoffLabel = (value: unknown) => {
  const parsed = parseCutoffValue(String(value || ""));
  if (!parsed || Math.max(parsed.start, parsed.end) <= 0) return "Cutoff unavailable";
  return parsed.start === parsed.end ? `${parsed.start}` : `${parsed.start} - ${parsed.end}`;
};

const hasUsableCutoffRange = (value: string | number | null | undefined) => {
  const parsed = parseCutoffValue(value);
  return Boolean(parsed && Math.max(parsed.start, parsed.end) > 0);
};

const DEGREE_MATCH_ALIASES: Record<string, string[]> = {
  Engineering: ["engineering", "be", "btech", "b.e", "b.tech"],
  "Arts & Science": ["arts", "science", "arts science", "bsc", "b.sc", "ba", "b.a", "bcom", "b.com"],
  Law: ["law", "llb", "ba llb", "bba llb", "llm", "legal"],
  "B.Arch": ["barch", "b.arch", "architecture", "arch", "design"],
  Paramedical: ["paramedical", "allied health", "health science", "nursing", "physiotherapy", "radiology"],
  Medical: ["medical", "mbbs", "bds", "doctor", "medicine", "clinical"],
  Agriculture: ["agriculture", "agri", "farming", "food science", "crop science"],
};

const matchesAnyAlias = (haystack: string, aliases: string[]) =>
  aliases.some((alias) => haystack.includes(normalizeText(alias)));

const ENGINEERING_MATCH_ALIASES = ["engineering", "be", "btech", "b.e", "b.tech", "m.e", "me", "mtech", "m.tech"];

const isCertificateCourse = (course: Course) => {
  const haystack = [
    course.degreeType,
    course.courseType,
    course.course,
    course.courseName,
    course.specialization,
    course.stream,
    course.courseCategory,
  ]
    .map((item) => normalizeText(String(item || "")))
    .filter(Boolean)
    .join(" ");

  return haystack.includes("certificate");
};

const degreeMatchesCourse = (course: Course, degree: string) => {
  if (!degree) return true;
  const haystack = [
    course.stream,
    course.degreeType,
    course.courseCategory,
    course.courseType,
    course.course,
    course.specialization,
  ]
    .map((item) => normalizeText(item))
    .join(" ");
  const degreeToken = normalizeText(degree);
  if (!degreeToken) return true;
  if (haystack.includes(degreeToken)) return true;
  const aliases = degree === "Engineering" ? ENGINEERING_MATCH_ALIASES : DEGREE_MATCH_ALIASES[degree] || [degreeToken];
  return matchesAnyAlias(haystack, aliases);
};

const matchesLooseSearchText = (haystack: string, searchValue: string) => {
  const normalizedSearch = normalizeText(searchValue);
  if (!normalizedSearch) return false;

  const compactHaystack = compactSearchText(haystack);
  const compactSearch = compactSearchText(normalizedSearch);
  const searchTokens = normalizedSearch.split(" ").filter(Boolean);

  return (
    haystack.includes(normalizedSearch) ||
    (compactSearch.length > 0 && compactHaystack.includes(compactSearch)) ||
    searchTokens.some((token) => token && haystack.includes(token))
  );
};

const courseMatchesSelection = (course: Course, selectedCourse: string, selectedSpecialization: string) => {
  const courseSearch = normalizeText(selectedCourse);
  const specializationSearch = normalizeText(selectedSpecialization);
  if (!courseSearch && !specializationSearch) return true;

  const courseName = normalizeText(course.course || course.courseName || course.courseType || "");
  const specialization = normalizeText(course.specialization || course.courseName || "");
  const stream = normalizeText(course.stream || course.courseCategory || "");
  const courseHaystack = [courseName, specialization, stream].filter(Boolean).join(" ");
  const courseMatch = matchesLooseSearchText(courseHaystack, courseSearch);
  const specializationMatch = matchesLooseSearchText(courseHaystack, specializationSearch);

  if (courseSearch && specializationSearch) {
    return courseMatch || specializationMatch;
  }
  if (courseSearch) return courseMatch;
  if (specializationSearch) return specializationMatch;
  return false;
};

const isExamBasedAdmissionType = (value: string) => {
  const normalized = normalizeText(value);
  if (!normalized) return false;
  if (
    normalized === "pcm" ||
    normalized.includes("mark") ||
    normalized.includes("board") ||
    normalized.includes("merit") ||
    normalized.includes("general admission") ||
    normalized.includes("general")
  ) {
    return false;
  }
  return true;
};

const examNameMatchesSelection = (examName: string, selectedExam: string) => {
  const normalizedExamName = normalizeText(examName);
  const normalizedSelection = normalizeText(selectedExam);
  if (!normalizedExamName || !normalizedSelection) return false;
  return normalizedExamName.includes(normalizedSelection) || normalizedSelection.includes(normalizedExamName);
};

const getSelectedExamForCourse = (course: Course, selectedExam: string) => {
  const entranceExams = Array.isArray(course.entranceExams) ? course.entranceExams : [];
  return entranceExams.find((exam) =>
    examNameMatchesSelection(String(exam.examName || ""), selectedExam),
  );
};

const getExamCutoffValue = (
  exam: NonNullable<Course["entranceExams"]>[number] | undefined,
  categoryKey: string,
) => {
  if (!exam) return "";
  const categoryCutoff = getCategoryCutoffValue(exam.cutoffByCategory, categoryKey);
  return String(categoryCutoff || exam.cutoffScoreOrRank || "").trim();
};

const getCategoryCutoffValue = (
  entries: Array<{ category?: string; cutoff?: string }> | undefined,
  categoryKey: string,
) => {
  if (!Array.isArray(entries) || entries.length === 0) return "";

  const usableEntries = entries.filter((entry) => hasUsableCutoffRange(entry.cutoff));
  if (!usableEntries.length) return "";

  const exactEntry = categoryKey
    ? usableEntries.find((entry) => normalizeCategoryKey(String(entry.category || "")) === categoryKey)
    : undefined;
  if (exactEntry?.cutoff) return String(exactEntry.cutoff).trim();

  return usableEntries
    .sort((left, right) => {
      const leftCutoff = parseCutoffValue(left.cutoff);
      const rightCutoff = parseCutoffValue(right.cutoff);
      const leftMax = leftCutoff ? Math.max(leftCutoff.start, leftCutoff.end) : 0;
      const rightMax = rightCutoff ? Math.max(rightCutoff.start, rightCutoff.end) : 0;
      return rightMax - leftMax;
    })[0]?.cutoff || "";
};

const getCollegeLookupValues = (college: College) =>
  [college.id, college.collegeCode || "", college.name, college.university]
    .map((value) => normalizeText(String(value || "")))
    .filter(Boolean);

const normalizeComparableText = (value: string) => normalizeText(value).replace(/[^a-z0-9]/g, "");

const matchesExactComparableText = (left: string, right: string) => {
  const leftNormalized = normalizeText(left);
  const rightNormalized = normalizeText(right);
  if (!leftNormalized || !rightNormalized) return false;
  return leftNormalized === rightNormalized || normalizeComparableText(left) === normalizeComparableText(right);
};

const getCourseDegreeValues = (course: Course) =>
  [
    course.degreeType,
    course.courseCategory,
    course.stream,
    course.courseType,
  ]
    .map((value) => String(value || "").trim())
    .filter(Boolean);

const matchesRequestedDegree = (course: Course, selectedDegree: string) => {
  if (!selectedDegree) return true;
  return getCourseDegreeValues(course).some((value) => matchesExactComparableText(value, selectedDegree));
};

const getCourseMatchValues = (course: Course) =>
  [
    course.courseName,
    course.specialization,
    course.course,
  ]
    .map((value) => String(value || "").trim())
    .filter(Boolean);

const matchesRequestedCourse = (course: Course, selectedCourse: string) => {
  if (!selectedCourse) return true;
  return getCourseMatchValues(course).some((value) => matchesExactComparableText(value, selectedCourse));
};

const parsePositiveCutoffValue = (value: string | number | null | undefined) => {
  const parsed = parseCutoffValue(value);
  if (!parsed) return null;
  const maxValue = Math.max(parsed.start, parsed.end);
  return maxValue > 0 ? maxValue : null;
};

const getSuggestedRequiredCutoff = (
  course: Course,
  detail: NonNullable<Course["collegeDetails"]>[number],
  selectedCategory: string,
) => {
  const categoryKey = normalizeCategoryKey(selectedCategory);
  const categoryCutoff = getCategoryCutoffValue(detail.cutoffByCategory || course.cutoffByCategory || [], categoryKey);
  const categoryCutoffValue = parsePositiveCutoffValue(categoryCutoff);
  if (categoryCutoffValue !== null) return categoryCutoffValue;

  const detailCutoffValue = parsePositiveCutoffValue(detail.cutoff);
  if (detailCutoffValue !== null) return detailCutoffValue;

  const detailCutoffTextValue = parsePositiveCutoffValue(detail.cutoffText);
  if (detailCutoffTextValue !== null) return detailCutoffTextValue;

  const courseCutoffValue = parsePositiveCutoffValue(course.cutoff);
  if (courseCutoffValue !== null) return courseCutoffValue;

  return parsePositiveCutoffValue(course.cutoffText);
};

type WhatsNextCard = {
  title: string;
  description: string;
  icon: typeof GraduationCap;
};

const WHATS_NEXT_CARDS: WhatsNextCard[] = [
  {
    title: "Best-Fit College Matches",
    description:
      "Explore colleges that align with your cutoff score and personal preferences. Identify ambitious, safe, and best-fit college options to create a smarter and more effective shortlist for admissions.",
    icon: GraduationCap,
  },
  {
    title: "Course and Eligibility Guidance",
    description:
      "Understand the admission pathway for your preferred course, including expected cutoff ranges, eligibility criteria, and admission requirements. This helps students plan their next steps with less confusion and better clarity.",
    icon: Bell,
  },
  {
    title: "Smarter Shortlist Support",
    description:
      "Use cutoff trends, category-based insights, and college-fit analysis to build a practical and reliable shortlist. Compare multiple college options and make a more informed final admission decision.",
    icon: Star,
  },
];

function WhatsNextSection({
  onShowSuggestedColleges,
  sectionRef,
}: {
  onShowSuggestedColleges: () => void;
  sectionRef?: Ref<HTMLElement>;
}) {
  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden rounded-[28px] border border-[#cfe0ff] bg-[#f6f9ff] px-5 py-6 shadow-[0_20px_50px_rgba(16,40,96,0.05)] sm:px-8 sm:py-8"
    >
      <div className="absolute inset-y-0 left-0 w-[62%] bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.95),rgba(239,245,255,0.88)_52%,rgba(238,244,255,0.3)_100%)]" />
      <div className="absolute -right-16 top-0 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.85)_0%,rgba(255,255,255,0)_70%)] blur-2xl" />

      <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_auto] lg:items-start">
        <div className="max-w-3xl">
          <h2 className="text-[1.9rem] font-medium leading-tight tracking-[-0.04em] text-[#0c1326] sm:text-[2.2rem]">
            What&apos;s next after your <em className="font-semibold italic text-[#193f87]">cutoff</em>?
          </h2>
          <p className="mt-4 max-w-3xl text-[1.06rem] leading-8 text-[#5b667d] sm:text-[1.18rem]">
            Based on your score, <span className="font-semibold text-[#0d1d46]">WhatsNext</span> can guide you to the best-fit colleges and counseling advice.
          </p>
        </div>

        <button
          type="button"
          onClick={onShowSuggestedColleges}
          className="inline-flex items-center justify-center gap-4 rounded-full bg-[#0f2358] px-6 py-4 text-[1rem] font-semibold text-white shadow-[0_16px_32px_rgba(15,35,88,0.18)] transition hover:-translate-y-0.5 hover:bg-[#112b68]"
          aria-label="Show suggested colleges"
        >
          <span className="inline-flex size-7 items-center justify-center rounded-full bg-white/10">
            <Building2 className="size-5" />
          </span>
          <span>Show Suggested Colleges</span>
          <ChevronRight className="size-5" />
        </button>
      </div>

      <div className="relative mt-8 grid gap-5 xl:grid-cols-3">
        {WHATS_NEXT_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <article
              key={card.title}
              className="rounded-[24px] border border-[#cfdcf5] bg-[linear-gradient(180deg,#ffffff_0%,#fbfcff_100%)] px-6 py-7 shadow-[0_14px_30px_rgba(15,35,88,0.04)]"
            >
              <div className="flex items-start gap-4">
                <div className="flex size-20 shrink-0 items-center justify-center rounded-full bg-[#eef4ff] text-[#2462f0]">
                  <Icon className="size-10" strokeWidth={2} />
                </div>
                <h3 className="pt-1 text-[1.1rem] font-medium leading-7 text-[#0c1326]">
                  {card.title}
                </h3>
              </div>
              <p className="mt-8 max-w-[24rem] text-[1.02rem] leading-9 text-[#5d6781]">
                {card.description}
              </p>
            </article>
          );
        })}
      </div>

      <p className="relative mt-8 text-[1.1rem] leading-8 text-[#5a647b] sm:text-[1.2rem]">
        Let <span className="font-semibold text-[#2462f0]">WhatsNext</span> guide your journey to success.
      </p>
    </section>
  );
}

const compareScoreToCutoff = (
  cutoffValue: string | number,
  score: number | null,
): { status: "match" | "below" | "above" | "unavailable"; distance: number | null } => {
  if (score === null) return { status: "unavailable", distance: null };
  const parsed = parseCutoffValue(cutoffValue);
  if (!parsed || Math.max(parsed.start, parsed.end) <= 0) return { status: "unavailable", distance: null };

  const start = Math.min(parsed.start, parsed.end);
  const end = Math.max(parsed.start, parsed.end);

  if (start === end) {
    return score >= start
      ? { status: "match", distance: score - start }
      : { status: "below", distance: score - start };
  }

  if (score < start) return { status: "below", distance: score - start };
  if (score > end) return { status: "above", distance: score - end };
  return { status: "match", distance: 0 };
};

const resolveCollegeRouteKey = (college: College) => {
  const rawValue =
    (college as { _id?: string })._id ||
    college.id ||
    college.collegeCode ||
    college.name ||
    "";
  const normalized = normalizeText(String(rawValue || ""))
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return normalized || normalizeText(college.name).replace(/[^a-z0-9]+/g, "-");
};

export function CutoffClient({
  selectedLevel,
  selectedState,
  selectedDegree,
  selectedCourse,
  selectedSpecialization,
  selectedCategory,
  selectedDreamCollege,
  selectedCollegeType,
  selectedAdmissionType,
  enteredCutoff,
  studentName,
  submittedDetails,
  colleges,
  courses,
  embedded = false,
}: CutoffClientProps) {
  // Core cutoff page state and active level selection.
  const resolvedLevel = normalizeSelectedLevel(selectedLevel);
  const isJuniorLevel = ["6", "7", "8", "9", "10"].includes(resolvedLevel);
  const isTwelfthStandard = resolvedLevel === "12";
  // Keep the focused predictor layout for true 12th-standard flows only.
  // 11th-level students should continue to see the tiered predictor experience,
  // even when they choose degree tracks like Law.
  const usesFocusedMatchFlow = !isJuniorLevel && isTwelfthStandard;
  const hasExamBasedCutoffFlow = usesFocusedMatchFlow && isExamBasedAdmissionType(selectedAdmissionType);
  const cutoffResultSectionRef = useRef<HTMLElement | null>(null);
  const whatsNextSectionRef = useRef<HTMLElement | null>(null);
  const suggestedCollegesSectionRef = useRef<HTMLElement | null>(null);
  const suggestedCollegeCardsTopRef = useRef<HTMLDivElement | null>(null);
  const hasSuggestedCollegePaginationMountedRef = useRef(false);
  const suggestedCollegeSortMenuRef = useRef<HTMLDivElement | null>(null);
  const [suggestedCollegePage, setSuggestedCollegePage] = useState(1);
  const [suggestedCollegeSort, setSuggestedCollegeSort] = useState("alphabetical");
  const [suggestedCollegeView, setSuggestedCollegeView] = useState<"grid" | "list">("grid");
  const [isSuggestedCollegeSortOpen, setIsSuggestedCollegeSortOpen] = useState(false);
  const [showSuggestedColleges, setShowSuggestedColleges] = useState(false);
  const selectedCutoffScore = useMemo(() => {
    const parsed = parseCutoffValue(enteredCutoff);
    if (!parsed) return null;
    return Math.max(parsed.start, parsed.end);
  }, [enteredCutoff]);
  const cutoffScoreForMatching = selectedCutoffScore;
  const eligibleCourses = useMemo(
    () => courses.filter((course) => !isCertificateCourse(course)),
    [courses],
  );

  const selectedCollegeRecord = useMemo(() => {
    const selectedKey = normalizeText(selectedDreamCollege);
    if (!selectedKey) return null;

    return (
      colleges.find((college) => {
        const collegeKeys = getCollegeLookupValues(college);
        return collegeKeys.some(
          (key) => key === selectedKey || key.includes(selectedKey) || selectedKey.includes(key),
        );
      }) || null
    );
  }, [colleges, selectedDreamCollege]);
  
  const dreamCollegeName = selectedCollegeRecord?.name || selectedDreamCollege || "-";
  const safeStudentName =
    submittedDetails.name ||
    submittedDetails.studentName ||
    submittedDetails.fullName ||
    submittedDetails.applicantName ||
    "-";
  const selectedCollegeLookupKeys = useMemo(
    () =>
      [
        selectedDreamCollege,
        selectedCollegeRecord?.id,
        selectedCollegeRecord?.collegeCode,
        selectedCollegeRecord?.name,
        selectedCollegeRecord?.university,
        dreamCollegeName,
      ]
        .map((value) => normalizeText(String(value || "")))
        .filter(Boolean),
    [
      dreamCollegeName,
      selectedCollegeRecord?.collegeCode,
      selectedCollegeRecord?.id,
      selectedCollegeRecord?.name,
      selectedCollegeRecord?.university,
      selectedDreamCollege,
    ],
  );
  const matchesSelectedCollegeKey = useCallback((value: string) => {
    const normalized = normalizeText(value);
    if (!normalized) return false;
    return selectedCollegeLookupKeys.some(
      (key) => key === normalized || key.includes(normalized) || normalized.includes(key),
    );
  }, [selectedCollegeLookupKeys]);
  const resultMaximumCutoff =
    selectedDegree === "Law" && selectedAdmissionType === "CLAT"
      ? 120
      : getCutoffScale(selectedDegree, selectedAdmissionType);
  const enteredScoreLabel = formatResultValue(enteredCutoff);
  const resultDetailRows = [
    [
      { label: "Maximum Cutoff", value: String(resultMaximumCutoff), icon: LineChart },
      { label: "Cutoff", value: enteredScoreLabel, icon: Target },
    ],
    [
      { label: "Admission Type", value: selectedAdmissionType || "-", icon: FileText },
      { label: "Degree", value: selectedDegree || "-", icon: GraduationCap },
    ],
    [
      { label: "Category", value: categoryDisplayLabel(selectedCategory), icon: Users },
      { label: "Name", value: safeStudentName, icon: User },
    ],
    [
      { label: "Phone", value: submittedDetails.phone || "-", icon: Phone, iconClassName: "text-[#09246b]" },
      { label: "Dream College", value: dreamCollegeName, icon: Building2 },
    ],
    [
      { label: "Course", value: selectedCourse || "-", icon: BookOpen },
      { label: "State", value: selectedState || "Tamil Nadu", icon: MapPin },
    ],
  ];
  const selectedCollegeLogo =
    selectedCollegeRecord?.logo ||
    selectedCollegeRecord?.image ||
    "";
  const handleShowSuggestedColleges = useCallback(() => {
    setShowSuggestedColleges(true);
    setSuggestedCollegePage(1);
  }, []);

  const handleScrollToWhatsNext = useCallback(() => {
    whatsNextSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  useEffect(() => {
    if (!showSuggestedColleges) return;

    const rafId = window.requestAnimationFrame(() => {
      suggestedCollegesSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });

    return () => window.cancelAnimationFrame(rafId);
  }, [showSuggestedColleges]);

  useEffect(() => {
    if (!showSuggestedColleges) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (
        suggestedCollegeSortMenuRef.current &&
        !suggestedCollegeSortMenuRef.current.contains(event.target as Node)
      ) {
        setIsSuggestedCollegeSortOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);
  const suggestedCollegeCards = useMemo(() => {
    if (selectedCutoffScore === null) return [];

    const selectedCutoffLimit = selectedCutoffScore;

    const cardMap = new Map<
      string,
      {
        college: College;
        course: Course;
        requiredCutoff: number;
        courseLabel: string;
        appearanceIndex: number;
      }
    >();

    eligibleCourses.forEach((course) => {
      if (!matchesRequestedDegree(course, selectedDegree)) return;
      if (!matchesRequestedCourse(course, selectedCourse)) return;

      const collegeDetails =
        Array.isArray(course.collegeDetails) && course.collegeDetails.length
          ? course.collegeDetails
          : [
              {
                college: course.collegeId || course.college,
                collegeId: course.collegeId,
                collegeCode: course.collegeCode,
                cutoff: course.cutoff,
                cutoffText: course.cutoffText,
                cutoffByCategory: course.cutoffByCategory,
              },
            ];

      collegeDetails.forEach((detail) => {
        const requiredCutoff = getSuggestedRequiredCutoff(course, detail, selectedCategory);
        if (requiredCutoff === null || requiredCutoff > selectedCutoffLimit) {
          return;
        }

        const college = colleges.find((item) => {
          const lookupValues = getCollegeLookupValues(item);
          const detailValues = [detail.college, detail.collegeId, detail.collegeCode]
            .map((value) => normalizeText(String(value || "")))
            .filter(Boolean);

          return detailValues.some((detailValue) =>
            lookupValues.some(
              (lookupValue) =>
                lookupValue === detailValue ||
                lookupValue.includes(detailValue) ||
                detailValue.includes(lookupValue),
            ),
          );
        });

        if (!college) return;

        const key = `${college.id}-${course.id}`;
        if (!cardMap.has(key)) {
          cardMap.set(key, {
            college,
            course,
            requiredCutoff,
            courseLabel:
              getCourseMatchValues(course).find((value) => matchesExactComparableText(value, selectedCourse)) ||
              course.specialization ||
              course.courseName ||
              course.course,
            appearanceIndex: cardMap.size,
          });
        }
      });
    });

    return [...cardMap.values()].sort((left, right) => {
      if (right.requiredCutoff !== left.requiredCutoff) {
        return right.requiredCutoff - left.requiredCutoff;
      }
      return left.college.name.localeCompare(right.college.name);
    });
  }, [colleges, eligibleCourses, selectedCategory, selectedCourse, selectedDegree, selectedCutoffScore]);
  const suggestedCollegeOrderedCards = useMemo(() => {
    const cards = [...suggestedCollegeCards];

    if (suggestedCollegeSort === "newest-first") {
      return cards.sort((left, right) => {
        if (left.appearanceIndex !== right.appearanceIndex) {
          return right.appearanceIndex - left.appearanceIndex;
        }
        return left.college.name.localeCompare(right.college.name);
      });
    }

    if (suggestedCollegeSort === "oldest-first") {
      return cards.sort((left, right) => {
        if (left.appearanceIndex !== right.appearanceIndex) {
          return left.appearanceIndex - right.appearanceIndex;
        }
        return left.college.name.localeCompare(right.college.name);
      });
    }

    return cards.sort((left, right) => left.college.name.localeCompare(right.college.name));
  }, [suggestedCollegeCards, suggestedCollegeSort]);
  const suggestedCollegePageSize = 6;
  const suggestedCollegePageCount = Math.max(1, Math.ceil(suggestedCollegeOrderedCards.length / suggestedCollegePageSize));
  const suggestedCollegeActivePage = Math.min(suggestedCollegePage, suggestedCollegePageCount);
  const suggestedCollegeStartIndex = (suggestedCollegeActivePage - 1) * suggestedCollegePageSize;
  const suggestedCollegeVisibleCards = suggestedCollegeOrderedCards.slice(
    suggestedCollegeStartIndex,
    suggestedCollegeStartIndex + suggestedCollegePageSize,
  );
  const suggestedCollegeVisiblePages = useMemo(() => {
    if (suggestedCollegePageCount <= 3) {
      return Array.from({ length: suggestedCollegePageCount }, (_, index) => index + 1);
    }

    if (suggestedCollegeActivePage <= 2) {
      return [1, 2, 3];
    }

    if (suggestedCollegeActivePage >= suggestedCollegePageCount - 1) {
      return [suggestedCollegePageCount - 2, suggestedCollegePageCount - 1, suggestedCollegePageCount];
    }

    return [suggestedCollegeActivePage - 1, suggestedCollegeActivePage, suggestedCollegeActivePage + 1];
  }, [suggestedCollegeActivePage, suggestedCollegePageCount]);

  useEffect(() => {
    if (!showSuggestedColleges) return;
    if (!hasSuggestedCollegePaginationMountedRef.current) {
      hasSuggestedCollegePaginationMountedRef.current = true;
      return;
    }

    const rafId = window.requestAnimationFrame(() => {
      suggestedCollegeCardsTopRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });

    return () => window.cancelAnimationFrame(rafId);
  }, [suggestedCollegeActivePage, showSuggestedColleges]);

  const selectedCollegeRelatedCourses = useMemo(
    () =>
      eligibleCourses.filter((course) => {
        if (!degreeMatchesCourse(course, selectedDegree)) return false;
        if (
          matchesSelectedCollegeKey(course.collegeId || "") ||
          matchesSelectedCollegeKey(course.collegeCode || "") ||
          matchesSelectedCollegeKey(course.college || "") ||
          matchesSelectedCollegeKey(course.university || "")
        ) {
          return true;
        }

        const details =
          Array.isArray(course.collegeDetails) && course.collegeDetails.length
            ? course.collegeDetails
            : [
                {
                  college: course.collegeId || course.college,
                  cutoff: course.cutoff,
                  cutoffByCategory: course.cutoffByCategory || [],
                },
              ];

        return details.some((detail) =>
          [detail.college, detail.collegeId, detail.collegeCode].some((value) =>
            matchesSelectedCollegeKey(String(value || "")),
          ),
        );
      }),
    [eligibleCourses, matchesSelectedCollegeKey, selectedDegree],
  );
  const selectedCourseForCollege = useMemo(() => {
    const scoreCourseCutoffAvailability = (course: Course) => {
      const details = Array.isArray(course.collegeDetails) ? course.collegeDetails : [];
      const matchingDetail = details.find((detail) =>
        [detail.college, detail.collegeId, detail.collegeCode].some((value) =>
          matchesSelectedCollegeKey(String(value || "")),
        ),
      );

      if (matchingDetail) {
        const categoryCutoff = getCategoryCutoffValue(
          matchingDetail.cutoffByCategory || course.cutoffByCategory || [],
          normalizeCategoryKey(selectedCategory),
        );
        if (hasUsableCutoffRange(categoryCutoff)) return 4;
        if (hasUsableCutoffRange(matchingDetail.cutoffText)) return 3;
        if (hasUsableCutoffRange(matchingDetail.cutoff)) return 2;
      }

      const courseCategoryCutoff = getCategoryCutoffValue(course.cutoffByCategory || [], normalizeCategoryKey(selectedCategory));
      if (hasUsableCutoffRange(courseCategoryCutoff)) return 2;
      if (hasUsableCutoffRange(course.cutoffText)) return 1;
      if (hasUsableCutoffRange(course.cutoff)) return 1;
      return 0;
    };

    const matchedSelectedCourses = selectedCollegeRelatedCourses.filter((course) =>
      courseMatchesSelection(course, selectedCourse, selectedSpecialization),
    );
    const prioritizedMatches = [...matchedSelectedCourses].sort((left, right) => {
      const rightScore = scoreCourseCutoffAvailability(right);
      const leftScore = scoreCourseCutoffAvailability(left);
      if (rightScore !== leftScore) return rightScore - leftScore;
      return String(left.college || "").localeCompare(String(right.college || ""));
    });

    return prioritizedMatches[0] || selectedCollegeRelatedCourses[0];
  }, [
    matchesSelectedCollegeKey,
    normalizeCategoryKey,
    selectedCategory,
    selectedCollegeRelatedCourses,
    selectedCourse,
    selectedSpecialization,
  ]);
  const selectedCourseDetails =
    selectedCourseForCollege && Array.isArray(selectedCourseForCollege.collegeDetails)
      ? selectedCourseForCollege.collegeDetails.find((detail) => {
          return (
            matchesSelectedCollegeKey(String(detail.college || "")) ||
            matchesSelectedCollegeKey(String(detail.collegeId || "")) ||
            matchesSelectedCollegeKey(String(detail.collegeCode || ""))
          );
        })
      : undefined;
  const selectedCourseCutoffByCategory =
    selectedCourseDetails?.cutoffByCategory && selectedCourseDetails.cutoffByCategory.length > 0
      ? selectedCourseDetails.cutoffByCategory
      : selectedCourseForCollege?.cutoffByCategory || [];
  const selectedCategoryCutoff = getCategoryCutoffValue(
    selectedCourseCutoffByCategory,
    normalizeCategoryKey(selectedCategory),
  );
  const selectedExamCutoff = hasExamBasedCutoffFlow
    ? getExamCutoffValue(
        selectedCourseForCollege
          ? getSelectedExamForCourse(selectedCourseForCollege, selectedAdmissionType)
          : undefined,
        normalizeCategoryKey(selectedCategory),
      )
    : "";
  const rawSelectedCollegeCutoff =
    selectedExamCutoff ||
    selectedCategoryCutoff ||
    "";
  const parsedSelectedCollegeCutoff = parseCutoffValue(String(rawSelectedCollegeCutoff || ""));
  const hasSelectedCollegeCutoffValue = hasUsableCutoffRange(rawSelectedCollegeCutoff);
  const selectedCollegeCutoffScore =
    parsedSelectedCollegeCutoff && hasSelectedCollegeCutoffValue
      ? Math.max(parsedSelectedCollegeCutoff.start, parsedSelectedCollegeCutoff.end)
      : null;
  const selectedCollegeCutoffMin =
    parsedSelectedCollegeCutoff && hasSelectedCollegeCutoffValue
      ? Math.min(parsedSelectedCollegeCutoff.start, parsedSelectedCollegeCutoff.end)
      : selectedCollegeCutoffScore;
  const selectedCollegeCutoffMax =
    parsedSelectedCollegeCutoff && hasSelectedCollegeCutoffValue
      ? Math.max(parsedSelectedCollegeCutoff.start, parsedSelectedCollegeCutoff.end)
      : selectedCollegeCutoffScore;
  const selectedCollegeCutoffLabel =
    parsedSelectedCollegeCutoff && hasSelectedCollegeCutoffValue
      ? formatCutoffLabel(rawSelectedCollegeCutoff)
      : "Not available";
  const selectedCollegeComparison = compareScoreToCutoff(
    rawSelectedCollegeCutoff,
    cutoffScoreForMatching,
  );
  const hasCollegeCutoff = selectedCollegeComparison.status !== "unavailable";
  const hasHighMatch = selectedCollegeComparison.status === "match";
  const isAboveCollegeCutoff = selectedCollegeComparison.status === "above";
  const hasPositiveCollegeMatch = hasHighMatch || isAboveCollegeCutoff;
  const scoreGaugePercent =
    selectedCutoffScore !== null ? Math.max(0, Math.min(100, (selectedCutoffScore / resultMaximumCutoff) * 100)) : 0;
  const selectedScoreDifference =
    hasCollegeCutoff && selectedCollegeComparison.distance !== null
      ? selectedCollegeComparison.distance
      : null;
  const selectedScoreDifferenceLabel =
    selectedScoreDifference !== null
      ? selectedScoreDifference === 0
        ? "Within range"
        : formatResultValue(String(Math.abs(selectedScoreDifference)))
      : "-";
  const selectedMatchEmoji = hasHighMatch ? "😊" : isAboveCollegeCutoff ? "😎" : "😟";
  const selectedMatchBadgeEmoji = hasHighMatch ? "🙂" : isAboveCollegeCutoff ? "🟢" : "☹️";
  const selectedMatchLabel = !hasCollegeCutoff
    ? "Cutoff Not Available"
    : hasHighMatch
      ? "High Match"
      : isAboveCollegeCutoff
        ? "Above Cutoff"
        : "Not Matched";
  const selectedMatchMessage = hasHighMatch
    ? "Great! Your cutoff matches the college cutoff range. You have a good chance of getting admission."
    : isAboveCollegeCutoff
      ? "Your cutoff is above the college cutoff range. This is a positive sign for admission chances."
      : hasCollegeCutoff
        ? "Your cutoff is below this selected college cutoff range."
        : "Cutoff not available for this course.";
  const selectedMatchHelpText = hasHighMatch
    ? "Keep this college in your main shortlist and continue comparing similar options."
    : isAboveCollegeCutoff
      ? "You are above the required cutoff mark. Keep this college in your shortlist and review course demand before applying."
      : "You can compare other colleges and courses to find a better fit for your score.";

  const selectedMatchHelpTextForDisplay = hasCollegeCutoff
    ? selectedMatchHelpText
    : "We cannot calculate a match for this selected college and course until a valid cutoff is added.";
  const compactGaugeScoreClass =
    enteredScoreLabel.length >= 5 ? "text-[2.35rem]" : enteredScoreLabel.length === 4 ? "text-[2.7rem]" : "text-[3.1rem]";
  const collegeGaugeRangeStartPercent =
    selectedCollegeCutoffMin !== null
      ? Math.max(0, Math.min(100, (selectedCollegeCutoffMin / resultMaximumCutoff) * 100))
      : 0;
  const collegeGaugeRangeEndPercent =
    selectedCollegeCutoffMax !== null
      ? Math.max(0, Math.min(100, (selectedCollegeCutoffMax / resultMaximumCutoff) * 100))
      : 0;
  const collegeGaugeRangeLength = hasCollegeCutoff
    ? Math.max(
        selectedCollegeCutoffMin === selectedCollegeCutoffMax ? 4 : 6,
        collegeGaugeRangeEndPercent - collegeGaugeRangeStartPercent,
      )
    : 0;
  const rangeBarMarkerPercent = Math.max(0, Math.min(100, scoreGaugePercent));
  const gaugeRadius = 76;
  const gaugeSize = 236;
  const gaugeCenter = gaugeSize / 2;
  const gaugeVisibleAngle = 270;
  const gaugeStartAngle = 135;
  const gaugeCircumference = 2 * Math.PI * gaugeRadius;
  const gaugeVisibleLength = gaugeCircumference * (gaugeVisibleAngle / 360);
  const gaugeHiddenLength = gaugeCircumference - gaugeVisibleLength;
  const scoreGaugeStrokeLength = gaugeVisibleLength * (scoreGaugePercent / 100);
  const scoreMarkerAngleInRadians = ((gaugeStartAngle + (gaugeVisibleAngle * scoreGaugePercent) / 100) * Math.PI) / 180;
  const scoreMarkerX = gaugeCenter + gaugeRadius * Math.cos(scoreMarkerAngleInRadians);
  const scoreMarkerY = gaugeCenter + gaugeRadius * Math.sin(scoreMarkerAngleInRadians);
  const getCollegeDetailHref = (college: College) => {
    const routeKey = resolveCollegeRouteKey(college);
    if (!routeKey) {
      return "#";
    }
    return `/college/${encodeURIComponent(routeKey)}`;
  };

  if (isJuniorLevel) {
    return null;
  }

  if (!isJuniorLevel) {
    return (
      <>
        {!embedded ? <Navbar /> : null}
        <main className={`cutoff-result-theme min-h-screen bg-[#FFFFFF] px-4 text-[#0F1B25] sm:px-6 ${embedded ? "py-0" : "py-4"}`}>
          <div className="mx-auto w-full max-w-[1180px]">
            <section className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
              <article className="rounded-[12px] border border-[#e1e9f8] bg-white p-4 shadow-[0_18px_48px_rgba(20,42,99,0.09)] sm:p-5">
                <div className="flex items-start gap-4">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#eef4ff] text-[#1758f4] shadow-[0_14px_24px_rgba(23,88,244,0.18)]">
                    <CheckCircle2 className="size-7" strokeWidth={2.6} />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-[1.28rem] font-black leading-tight tracking-[-0.03em] text-[#09246b] sm:text-[1.7rem]">
                      Your Selected College &amp; Course Match 
                    </h2>
                    <p className="mt-3 text-[0.94rem] font-medium leading-6 text-[#26376b] sm:text-[0.98rem]">
                      Here’s how your score compares with the cutoff for your selected college and course.
                    </p>
                  </div>
                </div>

                <div className="mt-6 overflow-hidden rounded-[12px] border border-[#abc7ff] bg-[linear-gradient(180deg,#ffffff_0%,#f9fbff_100%)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.75)] sm:mt-7">
                  <div className="grid grid-cols-1 gap-0 sm:grid-cols-3 xl:grid-cols-[minmax(320px,1.35fr)_minmax(120px,0.65fr)_minmax(150px,0.8fr)_minmax(190px,0.9fr)] xl:items-stretch">
                   <div className="flex min-w-0 flex-col items-center gap-4 p-4 text-center sm:col-span-3 sm:flex-row sm:text-left xl:col-span-1">
  <Link
  href={selectedCollegeRecord ? getCollegeDetailHref(selectedCollegeRecord) : "#"}
>
  <div className="relative flex size-16 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-[#abc7ff] bg-white shadow-[0_10px_22px_rgba(20,42,99,0.08)] transition hover:scale-105 sm:size-20">
    {selectedCollegeLogo ? (
      <Image
        src={selectedCollegeLogo}
        alt={`${dreamCollegeName} logo`}
        fill
        sizes="80px"
        className="object-contain p-2.5"
      />
    ) : (
      <Building2 className="size-9 text-[#09246b]" />
    )}
  </div>
</Link>

  <div className="min-w-0">
    <h3 className="text-[1.08rem] font-black leading-6 text-[#09246b]">
      {dreamCollegeName}
    </h3>

    <p className="mt-2 flex items-center justify-center gap-2 text-[0.86rem] font-semibold text-[#1766f2] sm:justify-start">
      <MapPin className="size-4 shrink-0" />
      <span className="min-w-0 truncate">
        {selectedCollegeRecord?.city ||
          selectedCollegeRecord?.district ||
          selectedState ||
          "Tamil Nadu"}
      </span>
    </p>

    <p className="mt-3 text-[0.94rem] font-black leading-6 text-[#1766f2]">
      {selectedCourse || "-"}
    </p>
  </div>
</div>

                    <div className="border-t border-[#dbe5f7] px-3 py-4 sm:px-2 xl:border-l xl:border-t-0 xl:pl-4">
                      <p className="text-center text-[0.74rem] font-semibold leading-5 text-[#07133b] sm:text-[0.84rem]">Your Cutoff<br />(Score)</p>
                      <p className="mt-3 text-center text-[1.55rem] font-black text-[#1766f2] sm:text-[1.7rem]">
                        {enteredScoreLabel} <span className="text-[1.35rem]"></span>
                      </p>
                    </div>

                    <div className="border-t border-[#dbe5f7] px-3 py-4 sm:border-l sm:px-2 xl:pl-4">
                      <p className="text-center text-[0.74rem] font-semibold leading-5 text-[#07133b] sm:text-[0.84rem]">Target College<br />Cutoff (Score)</p>
                      <p className="mt-3 whitespace-nowrap text-center text-[1.15rem] font-black text-[#1766f2] sm:text-[1.25rem]">
                        {selectedCollegeCutoffLabel} <span className="text-[1.35rem]"></span>
                      </p>
                    </div>

                    <div className="border-t border-[#dbe5f7] px-3 py-4 sm:border-l sm:px-2 xl:pl-4">
                      <p className="text-center text-[0.74rem] font-semibold leading-5 text-[#07133b] sm:text-[0.84rem]">Match Status</p>
                      <span
                        className={`mx-auto mt-4 flex min-h-12 w-full max-w-[210px] min-w-0 flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-[18px] px-3 py-2.5 text-center text-[0.78rem] font-black leading-5 sm:text-[0.82rem] ${
                          !hasCollegeCutoff
                            ? "bg-[#eaf1ff] text-[#07133b]"
                            : hasPositiveCollegeMatch
                              ? "bg-[#e9fff1] text-[#058b3d]"
                              : "bg-[#fff0f0] text-[#d40000]"
                        }`}
                      >
                        <span className="text-[1.25rem] leading-none">{selectedMatchBadgeEmoji}</span>
                        <span className="min-w-0 max-w-full break-words">{selectedMatchLabel}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className={`mt-5 flex flex-col-reverse items-center justify-between gap-3 rounded-[12px] border px-4 py-4 sm:flex-row sm:gap-4 sm:px-5 ${
                    hasPositiveCollegeMatch
                      ? "border-[#bde8c9] bg-[linear-gradient(90deg,#f0fff6_0%,#ffffff_100%)]"
                      : "border-[#ffd1d1] bg-[linear-gradient(90deg,#fff5f5_0%,#ffffff_100%)]"
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                    <div className="min-w-0 text-center sm:text-left">
                      <h3 className={`text-[1rem] font-black leading-6 sm:text-[1.1rem] ${hasPositiveCollegeMatch ? "text-[#058b3d]" : "text-[#d40000]"}`}>
                        {selectedMatchMessage}
                      </h3>
                      <p className="mt-2 text-[0.9rem] font-medium leading-6 text-[#07133b] sm:text-[0.96rem]">
                        {selectedMatchHelpTextForDisplay}
                      </p>
                    </div>
                  </div>
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white/70 text-[1.4rem] leading-none shadow-[0_8px_18px_rgba(15,23,42,0.06)] sm:size-14 sm:text-[1.65rem]">
                    {selectedMatchEmoji}
                  </div>
                </div>

                <div className="mt-5 rounded-[18px] border border-[#dce6fb] bg-white p-5 shadow-[0_14px_34px_rgba(20,42,99,0.06)] sm:p-6">
                  <div className="flex items-center gap-3">
                    <Building2 className="size-7 text-[#1766f2]" />
                    <h3 className="text-[1.05rem] font-black text-[#09246b]">What does this mean?</h3>
                  </div>

                  <div className="mt-5 grid overflow-hidden rounded-[16px] border border-[#dbe5f7] bg-white md:grid-cols-3">
                    <div className="flex items-center gap-4 px-4 py-4 md:border-r md:border-[#dbe5f7] sm:px-5">
                      <div className={`flex size-14 shrink-0 items-center justify-center rounded-full ${hasPositiveCollegeMatch ? "bg-[#e9fff1]" : "bg-[#eef4ff]"} text-[#1766f2]`}>
                        <LineChart className="size-7" />
                      </div>
                      <div>
                        <p className="text-[0.84rem] font-black text-[#09246b]">Score Difference</p>
                        <p className={`mt-1 text-[1.15rem] font-black ${hasPositiveCollegeMatch ? "text-[#058b3d]" : "text-[#d40000]"}`}>
                          {selectedScoreDifferenceLabel}
                        </p>
                        <p className="mt-1 text-[0.82rem] font-medium text-[#07133b]">
                          {hasHighMatch
                            ? "Inside college cutoff range"
                            : selectedCollegeComparison.status === "above"
                              ? "Above college cutoff range"
                              : hasCollegeCutoff
                                ? "Below college cutoff"
                                : "Cutoff not available"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 px-4 py-4 md:border-r md:border-[#dbe5f7] sm:px-5">
                      <div className={`flex size-14 shrink-0 items-center justify-center rounded-full ${hasPositiveCollegeMatch ? "bg-[#e9fff1]" : "bg-[#eef4ff]"} text-[#1766f2]`}>
                        <Target className="size-7" />
                      </div>
                      <div>
                        <p className="text-[0.84rem] font-black text-[#09246b]">Improve Chances</p>
                        <p className={`mt-1 text-[1.15rem] font-black ${hasPositiveCollegeMatch ? "text-[#058b3d]" : "text-[#1766f2]"}`}>
                          {hasPositiveCollegeMatch ? "Strong" : "Low"}
                        </p>
                        <p className="mt-1 text-[0.82rem] font-medium text-[#07133b]">
                          {hasPositiveCollegeMatch ? "Good admission chance" : "Consider other options"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 px-4 py-4 sm:px-5">
                      <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-[#e9fff1] text-[#1766f2]">
                        <BookOpen className="size-7" />
                      </div>
                      <div>
                        <p className="text-[0.84rem] font-black text-[#09246b]">Better Options</p>
                        <p className="mt-1 text-[1.15rem] font-black text-[#1766f2]">Available</p>
                        <p className="mt-1 text-[0.82rem] font-medium text-[#07133b]">
                          Explore suggested colleges
                        </p>
                      </div>
                    </div>

                    
                  </div>
                  <div className="mt-3 rounded-[18px] border border-[#15357a] bg-white px-4 py-4 shadow-[0_10px_22px_rgba(15,35,88,0.05)] sm:px-5 sm:py-5">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="flex size-16 shrink-0 items-center justify-center rounded-[18px] bg-[#15357a] text-white shadow-[0_14px_28px_rgba(21,53,122,0.18)]">
                          <GraduationCap className="size-8" strokeWidth={2.2} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-[1rem] font-semibold leading-6 text-[#0b1b3b] sm:text-[1.12rem]">
                            Find better colleges that match your score!
                          </h3>
                          <p className="mt-1 text-[0.92rem] leading-6 text-[#22314d] sm:text-[0.98rem]">
                            Get personalized college suggestions based on your score and preferences.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleScrollToWhatsNext}
                        className="flex size-14 shrink-0 items-center justify-center rounded-full bg-[#15357a] text-white shadow-[0_14px_28px_rgba(21,53,122,0.18)] transition"
                        aria-label="Scroll to Whats Next section"
                      >
                        <ChevronRight className="size-6 rotate-90" />
                      </button>
                    </div>
                  </div>
                </div>

              </article>

              <aside className="space-y-4">
                <article className="overflow-hidden rounded-[20px] border border-[#dce6fb] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.98)_0%,rgba(244,248,255,0.97)_52%,rgba(237,244,255,0.99)_100%)] p-4 shadow-[0_20px_44px_rgba(20,42,99,0.09)]">
                  <div className="flex flex-col items-start gap-3 sm:flex-row sm:justify-between">
                    <div className="min-w-0">
                      <h2 className="text-[1rem] font-black tracking-[-0.04em] text-[#17337c] sm:text-[1.08rem]">
                        Cutoff Comparison
                      </h2>
                      <p className="mt-0.5 text-[0.8rem] font-medium text-[#7a87b6]">
                        Know where you stand!
                      </p>
                    </div>

                    <div
                      className={`inline-flex shrink-0 items-center gap-1.5 self-start rounded-full border px-2.5 py-1.5 text-[0.72rem] font-black shadow-[0_8px_18px_rgba(16,163,127,0.10)] sm:self-auto ${
                        hasPositiveCollegeMatch
                          ? "border-[#bff2df] bg-[linear-gradient(180deg,#f2fff9_0%,#ecfff6_100%)] text-[#149b74]"
                          : "border-[#ffd7d7] bg-[linear-gradient(180deg,#fff8f8_0%,#fff1f1_100%)] text-[#d14343]"
                      }`}
                    >
                      <span
                        className={`flex size-6 items-center justify-center rounded-full ${
                          hasPositiveCollegeMatch ? "bg-[#19c58a] text-white" : "bg-[#ef6b6b] text-white"
                        }`}
                      >
                        {hasPositiveCollegeMatch ? <Star className="size-3 fill-current" /> : <CircleAlert className="size-3" />}
                      </span>
                      {hasPositiveCollegeMatch ? "Good Match" : "Low Match"}
                    </div>
                  </div>

                  <div className="relative mt-5 rounded-[20px] border border-[#e4ecff] bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(245,249,255,0.98)_100%)] px-3.5 pb-4.5 pt-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                    <div className="pointer-events-none absolute inset-x-5 top-4 h-24 rounded-full bg-[radial-gradient(circle,rgba(244,180,0,0.16)_0%,rgba(255,255,255,0)_72%)] blur-2xl" />
                    <div className="relative mx-auto w-full max-w-[250px]">
                      <div className="relative mx-auto h-[210px] w-[218px]">
                        <svg viewBox={`0 0 ${gaugeSize} ${gaugeSize}`} className="h-full w-full overflow-visible">
                          <circle
                            cx={gaugeCenter}
                            cy={gaugeCenter}
                            r={gaugeRadius + 16}
                            fill="none"
                            stroke="#d8e5ff"
                            strokeWidth="1.5"
                            strokeDasharray="3 12"
                            opacity="0.92"
                          />
                          <circle
                            cx={gaugeCenter}
                            cy={gaugeCenter}
                            r={gaugeRadius + 3}
                            fill="none"
                            stroke="#dce7ff"
                            strokeWidth="1.5"
                            strokeDasharray={`${gaugeVisibleLength} ${gaugeHiddenLength}`}
                            strokeLinecap="round"
                            transform={`rotate(${gaugeStartAngle} ${gaugeCenter} ${gaugeCenter})`}
                            opacity="0.8"
                          />
                          <defs>
                            <linearGradient id="compactScoreGaugeGradient" x1="58" y1="230" x2="246" y2="70" gradientUnits="userSpaceOnUse">
                              <stop offset="0%" stopColor="#1758f4" />
                              <stop offset="52%" stopColor="#1758f4" />
                              <stop offset="100%" stopColor="#132a60" />
                            </linearGradient>
                          </defs>
                          <circle
                            cx={gaugeCenter}
                            cy={gaugeCenter}
                            r={gaugeRadius}
                            fill="none"
                            stroke="#d9e4fb"
                            strokeWidth="21"
                            strokeDasharray={`${gaugeVisibleLength} ${gaugeHiddenLength}`}
                            strokeLinecap="round"
                            transform={`rotate(${gaugeStartAngle} ${gaugeCenter} ${gaugeCenter})`}
                          />
                          <circle
                            cx={gaugeCenter}
                            cy={gaugeCenter}
                            r={gaugeRadius}
                            fill="none"
                            stroke="url(#compactScoreGaugeGradient)"
                            strokeWidth="21"
                            strokeDasharray={`${scoreGaugeStrokeLength} ${gaugeCircumference}`}
                            strokeLinecap="round"
                            transform={`rotate(${gaugeStartAngle} ${gaugeCenter} ${gaugeCenter})`}
                            style={{ filter: "drop-shadow(0 10px 14px rgba(244,180,0,0.22))" }}
                          />
                          <circle
                            cx={scoreMarkerX}
                            cy={scoreMarkerY}
                            r="10"
                            fill="#ffffff"
                            stroke="#1758f4"
                            strokeWidth="5"
                            style={{ filter: "drop-shadow(0 8px 14px rgba(244,180,0,0.18))" }}
                          />
                        </svg>

                        <div className="absolute inset-x-0 top-[50px] flex justify-center">
                          <div className="flex h-[116px] w-[116px] flex-col items-center justify-center rounded-full bg-white/95 shadow-[0_18px_38px_rgba(31,80,173,0.08)] ring-1 ring-[#edf3ff]">
                            <div className={`${compactGaugeScoreClass} font-black leading-none tracking-[-0.08em] text-[#1758f4]`}>
                              {enteredScoreLabel}
                            </div>
                            <div className="mt-1.5 text-[0.88rem] font-black text-[#17337c]">Your Score</div>
                            <div className="mt-2.5 h-1 w-12 rounded-full bg-[#1758f4]" />
                          </div>
                        </div>

                        <div className="absolute bottom-[8px] left-0 text-center">
                        <div className="text-[0.96rem] font-black text-[#1758f4]">0</div>
                          <div className="mt-1 text-[0.72rem] font-medium text-[#7384b9]">Minimum</div>
                        </div>
                        <div className="absolute bottom-[24px] left-[50px] h-px w-[42px] border-t-2 border-dashed border-[#cddcff]" />

                        <div className="absolute bottom-[8px] right-0 text-center">
                        <div className="text-[0.96rem] font-black text-[#1758f4]">{resultMaximumCutoff}</div>
                          <div className="mt-1 text-[0.72rem] font-medium text-[#7384b9]">Maximum</div>
                        </div>
                        <div className="absolute bottom-[24px] right-[50px] h-px w-[42px] border-t-2 border-dashed border-[#cddcff]" />
                      </div>

                      <div
                        className={`-mt-1 inline-flex w-full items-center justify-center gap-1.5 rounded-[0.95rem] px-3 py-2.5 text-center text-[0.8rem] font-bold shadow-[0_14px_28px_rgba(12,31,98,0.14)] ${
                          hasPositiveCollegeMatch
                            ? "bg-[linear-gradient(90deg,#142f86_0%,#0b216d_100%)] text-white"
                            : "bg-[linear-gradient(90deg,#7a1f2d_0%,#5f1022_100%)] text-white"
                        }`}
                      >
                        <span>
                          Your score is{" "}
                          <span className={hasPositiveCollegeMatch ? "text-[#53f0a8]" : "text-[#ffd3d3]"}>
                            {hasHighMatch ? "within" : isAboveCollegeCutoff ? "above" : "below"}
                          </span>{" "}
                          the cutoff range
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-[20px] border border-[#e5ecfb] bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] px-4 py-4 shadow-[0_12px_28px_rgba(20,42,99,0.05)]">
                    <div className="flex items-center justify-center gap-2.5 text-center">
                      <span className="h-px w-6 bg-[#d7e4ff]" />
                      <span className="text-[0.72rem] font-black uppercase tracking-[0.24em] text-[#1758f4]">
                        College Cutoff Range
                      </span>
                      <span className="h-px w-6 bg-[#d7e4ff]" />
                    </div>

                    <div className="mt-4 grid grid-cols-[64px_minmax(0,1fr)_64px] items-center gap-3">
                      <div className="text-left">
                        <div className="text-[1.16rem] font-black tracking-[-0.05em] text-[#1758f4]">
                          {selectedCollegeCutoffMin !== null ? formatResultValue(String(selectedCollegeCutoffMin)) : "-"}
                        </div>
                        <div className="mt-0.5 text-[0.7rem] font-medium leading-4 text-[#7583b5]">Low Cutoff</div>
                      </div>

                      <div className="relative px-0.5 py-6">
                        <div className="h-3.5 overflow-hidden rounded-full border border-[#dbe6fb] bg-[repeating-linear-gradient(135deg,#eef3ff_0px,#eef3ff_4px,#f9fbff_4px,#f9fbff_8px)]">
                          {hasCollegeCutoff ? (
                            <div
                              className="absolute top-1/2 h-3.5 -translate-y-1/2 rounded-full bg-[#1758f4] shadow-[0_8px_14px_rgba(23,88,244,0.18)]"
                              style={{
                                left: `${collegeGaugeRangeStartPercent}%`,
                                width: `${Math.max(collegeGaugeRangeLength, 0)}%`,
                              }}
                            />
                          ) : null}
                        </div>

                        <div
                          className="absolute top-0 flex -translate-x-1/2 flex-col items-center"
                          style={{ left: `${rangeBarMarkerPercent}%` }}
                        >
                          <div className="rounded-[0.7rem] bg-[#1758f4] px-1.5 py-0.5 text-[0.58rem] font-black leading-none text-white shadow-[0_10px_18px_rgba(23,88,244,0.2)]">
                            {enteredScoreLabel}
                          </div>
                          <div className="-mt-0.5 h-2 w-2 rotate-45 bg-[#1758f4]" />
                        </div>

                        <div
                          className="absolute top-1/2 flex size-4 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-[#1758f4] bg-white shadow-[0_8px_16px_rgba(23,88,244,0.14)]"
                          style={{ left: `${rangeBarMarkerPercent}%` }}
                        >
                          <span className="size-1.5 rounded-full bg-[#1758f4]" />
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[1.16rem] font-black tracking-[-0.05em] text-[#2563eb]">
                          {selectedCollegeCutoffMax !== null ? formatResultValue(String(selectedCollegeCutoffMax)) : "-"}
                        </div>
                        <div className="mt-0.5 text-[0.7rem] font-medium leading-4 text-[#7583b5]">High Cutoff</div>
                      </div>
                    </div>

                    <p className="mt-2 text-center text-[0.78rem] font-medium text-[#6879af]">
                      Your score position in cutoff range
                    </p>
                  </div>

                  <div className="mt-4 rounded-[18px] border border-[#cfddfb] bg-[linear-gradient(135deg,#eef4ff_0%,#ffffff_85%)] p-3.5 shadow-[0_14px_28px_rgba(20,42,99,0.05)]">
                    <div className="flex items-start gap-2.5">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#1758f4] text-white shadow-[0_12px_24px_rgba(23,88,244,0.24)]">
                        <CircleAlert className="size-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-[0.98rem] font-black tracking-[-0.03em] text-[#17337c]">What does this mean?</h3>
                        <p className="mt-1.5 text-[0.82rem] font-medium leading-5 text-[#22427f]">
                          {selectedMatchMessage}
                        </p>
                        <p className="mt-1 text-[0.78rem] font-medium leading-5 text-[#5f73a8]">
                          {selectedMatchHelpTextForDisplay}
                        </p>
                      </div>
                    </div>
                  </div>

                </article>
              </aside>
            </section>

            <div className={`${embedded ? "mt-8" : "mt-10"}`}>
              <WhatsNextSection
                onShowSuggestedColleges={handleShowSuggestedColleges}
                sectionRef={whatsNextSectionRef}
              />
            </div>

            {showSuggestedColleges ? (
              <section
                ref={suggestedCollegesSectionRef}
                className={`${embedded ? "mt-8" : "mt-10"} overflow-hidden rounded-[24px] border border-[#dbe6fb] bg-[linear-gradient(180deg,#ffffff_0%,#f7faff_100%)] px-4 py-5 shadow-[0_18px_44px_rgba(16,40,96,0.06)] sm:px-6 sm:py-6`}
              >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-[1.45rem] font-black tracking-[-0.04em] text-[#07133b] sm:text-[1.85rem]">
                    Suggested Colleges
                  </h2>
                  <p className="mt-2 max-w-3xl text-[0.94rem] font-medium leading-6 text-[#5b6886] sm:text-[1rem]">
                    Displaying colleges that match your selected degree and course, with required cutoff at or below your cutoff score.
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 rounded-full border border-[#d9e4fb] bg-white px-4 py-2 text-[0.9rem] font-semibold text-[#17337c] shadow-[0_10px_22px_rgba(16,40,96,0.05)]">
                  <Users className="size-4 text-[#2462f0]" />
                  <span>{suggestedCollegeCards.length} matches</span>
                </div>
              </div>

              <div className="mt-5 border-b border-[#e4ecfb] pb-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <p className="text-[0.92rem] font-medium text-[#6b7693]">
                    Based on {selectedDegree || "-"} cut off{" "}
                    {selectedCutoffScore !== null ? formatResultValue(String(selectedCutoffScore)) : "-"} / {resultMaximumCutoff}
                  </p>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div ref={suggestedCollegeSortMenuRef} className="relative w-full min-w-0 sm:w-[220px]">
                      <button
                        type="button"
                        onClick={() => setIsSuggestedCollegeSortOpen((current) => !current)}
                        className="flex h-[52px] w-full items-center justify-between gap-3 rounded-[16px] border border-[#d9e4fb] bg-white px-4 text-[0.94rem] font-medium text-[#0f1d3d] shadow-[0_10px_22px_rgba(16,40,96,0.05)] transition hover:border-[#c8d7f6] sm:h-[56px] sm:px-5"
                        aria-haspopup="listbox"
                        aria-expanded={isSuggestedCollegeSortOpen}
                        aria-label="Sort suggested colleges"
                      >
                        <span className="truncate">
                          {suggestedCollegeSort === "alphabetical"
                            ? "Alphabetical"
                            : suggestedCollegeSort === "newest-first"
                              ? "Newest First"
                              : "Oldest First"}
                        </span>
                        <ChevronDown className="size-4 shrink-0 text-[#68758f]" />
                      </button>

                      {isSuggestedCollegeSortOpen ? (
                        <div
                          role="listbox"
                          className="absolute left-0 top-[calc(100%+8px)] z-20 w-full overflow-hidden rounded-[14px] border border-[#d9e4fb] bg-white shadow-[0_18px_34px_rgba(16,40,96,0.12)]"
                        >
                          {[
                            { label: "Alphabetical", value: "alphabetical" },
                            { label: "Newest First", value: "newest-first" },
                            { label: "Oldest First", value: "oldest-first" },
                          ].map((option) => {
                            const isActive = suggestedCollegeSort === option.value;
                            return (
                              <button
                                key={option.value}
                                type="button"
                                role="option"
                                aria-selected={isActive}
                                onClick={() => {
                                  setSuggestedCollegeSort(option.value);
                                  setSuggestedCollegePage(1);
                                  setIsSuggestedCollegeSortOpen(false);
                                }}
                                className={`flex w-full items-center px-5 py-3 text-left text-[0.95rem] transition ${
                                  isActive
                                    ? "bg-white text-[#0f1d3d] font-semibold"
                                    : "bg-white text-[#0f1d3d] hover:bg-[#f7f9fc]"
                                }`}
                              >
                                {option.label}
                              </button>
                            );
                          })}
                        </div>
                      ) : null}
                    </div>

                    <div className="inline-flex w-full overflow-hidden rounded-[16px] border border-[#d9e4fb] bg-white shadow-[0_10px_22px_rgba(16,40,96,0.05)] sm:w-auto">
                      <button
                        type="button"
                        onClick={() => setSuggestedCollegeView("grid")}
                        className={`inline-flex h-[52px] flex-1 items-center justify-center gap-2 px-4 text-[0.92rem] font-medium transition sm:h-[56px] sm:min-w-[112px] sm:px-5 sm:text-[0.95rem] ${
                          suggestedCollegeView === "grid"
                            ? "bg-[#1758f4] text-white"
                            : "bg-white text-[#0f1d3d] hover:bg-[#1758f4] hover:text-white"
                        }`}
                        aria-pressed={suggestedCollegeView === "grid"}
                      >
                        <LayoutGrid className="size-4" />
                        Grid
                      </button>
                      <button
                        type="button"
                        onClick={() => setSuggestedCollegeView("list")}
                        className={`inline-flex h-[52px] flex-1 items-center justify-center gap-2 border-l border-[#d9e4fb] px-4 text-[0.92rem] font-medium transition sm:h-[56px] sm:min-w-[112px] sm:px-5 sm:text-[0.95rem] ${
                          suggestedCollegeView === "list"
                            ? "bg-[#1758f4] text-white"
                            : "bg-white text-[#0f1d3d] hover:bg-[#1758f4] hover:text-white"
                        }`}
                        aria-pressed={suggestedCollegeView === "list"}
                      >
                        <List className="size-4" />
                        List
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {suggestedCollegeCards.length > 0 ? (
                <>
                  <div
                    ref={suggestedCollegeCardsTopRef}
                    className={`mt-5 scroll-mt-24 grid gap-5 sm:scroll-mt-28 ${
                      suggestedCollegeView === "list" ? "grid-cols-1" : "md:grid-cols-2 xl:grid-cols-3"
                    }`}
                  >
                    {suggestedCollegeVisibleCards.map((card) => {
                    const college = card.college;
                    const collegeLink = getCollegeDetailHref(college);
                    const displayLocation = college.city || college.district || college.state || selectedState || "-";
                    const requiredVsUserGap = selectedCutoffScore !== null ? selectedCutoffScore - card.requiredCutoff : 0;
                    const topBadge =
                      requiredVsUserGap <= 5
                        ? "Top Match"
                        : requiredVsUserGap <= 15
                          ? "High Match"
                          : "Best Match";
                    const isListView = suggestedCollegeView === "list";
                    return (
                      <article
                        key={`${college.id}-${card.course.id}`}
                        className={`group overflow-hidden rounded-[22px] border transition ${
                          isListView
                            ? "border-[#15357a] bg-white shadow-none"
                            : "border-[#d6def0] bg-white shadow-[0_14px_30px_rgba(16,40,96,0.06)] hover:-translate-y-0.5 hover:shadow-[0_20px_42px_rgba(16,40,96,0.1)]"
                        }`}
                      >
                        {isListView ? (
                          <div className="flex flex-col gap-3 px-4 py-4 lg:flex-row lg:items-center lg:gap-4 lg:px-5 lg:py-3.5">
                            <div className="flex min-w-0 flex-1 items-center gap-3 lg:gap-4">
                              <div className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#d9e4fb] bg-white shadow-[0_8px_20px_rgba(15,27,37,0.08)] sm:size-14 lg:size-15">
                                {college.logo || college.image ? (
                                  <Image
                                    src={college.logo || college.image}
                                    alt={`${college.name} logo`}
                                    fill
                                    sizes="56px"
                                    className="object-contain p-1.5"
                                  />
                                ) : (
                                  <Building2 className="size-6 text-[#123ea0] sm:size-7" />
                                )}
                              </div>

                              <div className="min-w-0">
                                <h3 className="line-clamp-2 text-[0.95rem] font-semibold leading-5 text-[#07133b] sm:truncate sm:text-[1.04rem] lg:text-[1.12rem]">
                                  {college.name}
                                </h3>
                                <p className="mt-1 flex items-center gap-2 truncate text-[0.8rem] text-[#66748f] sm:mt-0.5 sm:text-[0.9rem]">
                                  {college.ownershipType || "College"}
                                  <span className="text-[#a5afc0]">·</span>
                                  <span className="truncate">{displayLocation}</span>
                                </p>
                                <div className="mt-2 inline-flex max-w-full items-center rounded-full border border-[#d9e4fb] bg-white px-3 py-1 text-[0.74rem] font-medium text-[#0f1d3d] sm:text-[0.78rem]">
                                  <span className="mr-2 uppercase tracking-[0.14em] text-[#6f7c97]">Course</span>
                                  <span className="truncate">{card.courseLabel}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:flex-1 lg:justify-end">
                              <div className="grid grid-cols-1 gap-3 text-center sm:grid-cols-3 sm:gap-6">
                                <div>
                                  <p className="text-[0.72rem] text-[#7c879d] sm:text-[0.74rem]">Cut Off</p>
                                  <p className="mt-1 text-[0.86rem] font-medium text-[#1758f4] sm:mt-1.5 sm:text-[0.96rem]">
                                    {formatResultValue(String(card.requiredCutoff))}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[0.72rem] text-[#7c879d] sm:text-[0.74rem]">Est.</p>
                                  <p className="mt-1 text-[0.86rem] font-medium text-[#07133b] sm:mt-1.5 sm:text-[0.96rem]">
                                    {college.establishedYear || "-"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[0.72rem] text-[#7c879d] sm:text-[0.74rem]">Ranking</p>
                                  <p className="mt-1 text-[0.86rem] font-medium text-[#07133b] sm:mt-1.5 sm:text-[0.96rem]">
                                    {formatRankingRangeForDisplay(college.ranking)}
                                  </p>
                                </div>
                              </div>

                              <Link
                                href={collegeLink}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#eef4ff] px-4 py-2 text-[0.88rem] font-medium text-[#1559ef] transition hover:bg-[#e3edff] sm:w-auto sm:text-[0.9rem]"
                                aria-label={`View details for ${college.name}`}
                              >
                                View Details
                                <ChevronRight className="size-4" />
                              </Link>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div
                              className="px-4 py-4 text-white sm:px-5 sm:py-5"
                              style={{
                                background:
                                  "linear-gradient(135deg, #0b2a74 0%, #1557f0 52%, #12398f 100%)",
                              }}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white px-3 py-1 text-[0.75rem] font-medium text-[#123ea0] shadow-[0_8px_18px_rgba(3,18,55,0.12)] sm:px-4 sm:py-1.5 sm:text-[0.82rem]">
                                  <span className="size-2.5 rounded-full border-2 border-[#123ea0] bg-white sm:size-3" />
                                  {topBadge}
                                </span>
                                <div className="flex size-10 items-center justify-center rounded-[14px] bg-white text-[#0b2a74] shadow-[0_10px_22px_rgba(3,18,55,0.12)] sm:size-11">
                                  <BookOpen className="size-4 sm:size-5" strokeWidth={2.1} />
                                </div>
                              </div>

                              <div className="mt-4 flex items-start justify-between gap-4 sm:mt-5">
                                <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                                  <div className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white shadow-[0_12px_24px_rgba(3,18,55,0.22)] sm:size-14">
                                    {college.logo || college.image ? (
                                      <Image
                                        src={college.logo || college.image}
                                        alt={`${college.name} logo`}
                                        fill
                                        sizes="56px"
                                        className="object-contain p-1.5 sm:p-2"
                                      />
                                    ) : (
                                      <Building2 className="size-6 text-[#123ea0] sm:size-7" />
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <h3 className="line-clamp-2 text-[0.98rem] font-semibold leading-5 text-white sm:truncate sm:text-[1.2rem]">
                                      {college.name}
                                    </h3>
                                    <p className="mt-1 flex items-center gap-2 text-[0.8rem] font-medium text-white/90 sm:text-[0.88rem]">
                                      <MapPin className="size-3.5 shrink-0 sm:size-4" />
                                      {displayLocation}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div className="mt-4 flex flex-wrap gap-2 sm:mt-5">
                                <span className="rounded-full border border-white/20 bg-white/15 px-3 py-1 text-[0.72rem] font-medium text-white backdrop-blur sm:py-1.5 sm:text-[0.78rem]">
                                  Degree {selectedDegree || "-"}
                                </span>
                                <span className="rounded-full border border-white/20 bg-white/15 px-3 py-1 text-[0.72rem] font-medium text-white backdrop-blur sm:py-1.5 sm:text-[0.78rem]">
                                  Course {card.courseLabel}
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-0 border-y border-[#eaf0fb] bg-[#f8f8fb]">
                              <div className="px-3 py-3 text-center sm:px-4 sm:py-4">
                                <p className="text-[0.66rem] font-medium uppercase tracking-[0.14em] text-[#68758f] sm:text-[0.7rem]">
                                  Cut Off
                                </p>
                                <p className="mt-1.5 text-[1.15rem] font-medium text-[#1559ef] sm:mt-2 sm:text-[1.35rem]">
                                  {formatResultValue(String(card.requiredCutoff))}
                                </p>
                              </div>
                              <div className="px-3 py-3 text-center sm:px-4 sm:py-4">
                                <p className="text-[0.66rem] font-medium uppercase tracking-[0.14em] text-[#68758f] sm:text-[0.7rem]">
                                  Your Cutoff
                                </p>
                                <p className="mt-1.5 text-[1.15rem] font-semibold text-[#07133b] sm:mt-2 sm:text-[1.35rem]">
                                  {selectedCutoffScore !== null ? formatResultValue(String(selectedCutoffScore)) : "-"}
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                              <div className="min-w-0">
                                <p className="text-[0.68rem] font-medium uppercase tracking-[0.14em] text-[#7380a0] sm:text-[0.72rem]">
                                  University
                                </p>
                                <p className="mt-1 truncate text-[0.88rem] font-medium text-[#1b2436] sm:text-[0.92rem]">
                                  {college.university}
                                </p>
                              </div>

                              <Link
                                href={collegeLink}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#eef4ff] px-4 py-2 text-[0.88rem] font-medium text-[#1559ef] transition hover:bg-[#e3edff] sm:w-auto sm:text-[0.9rem]"
                              >
                                View Details
                                <ChevronRight className="size-4" />
                              </Link>
                            </div>
                          </>
                        )}
                      </article>
                    );
                    })}
                  </div>

                  <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                    {suggestedCollegeVisiblePages.map((pageNumber) => {
                      const isActive = pageNumber === suggestedCollegeActivePage;
                      return (
                        <button
                          key={pageNumber}
                          type="button"
                          onClick={() => setSuggestedCollegePage(pageNumber)}
                          className={`min-w-[56px] rounded-[16px] px-5 py-4 text-[1rem] font-medium transition ${
                            isActive
                              ? "bg-[#1758f4] text-white shadow-[0_14px_24px_rgba(23,88,244,0.22)]"
                              : "bg-[#eef4ff] text-[#1758f4] hover:bg-[#e0ebff]"
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() =>
                        setSuggestedCollegePage((current) => Math.min(current + 1, suggestedCollegePageCount))
                      }
                      disabled={suggestedCollegeActivePage >= suggestedCollegePageCount}
                      className="inline-flex min-w-[110px] items-center justify-center gap-2 rounded-[16px] bg-[#eef4ff] px-5 py-4 text-[1rem] font-medium text-[#1758f4] transition hover:bg-[#e0ebff] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <span>Next</span>
                      <ChevronRight className="size-5" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="mt-5 rounded-[20px] border border-dashed border-[#cddafb] bg-white px-5 py-8 text-center">
                  <h3 className="text-[1.05rem] font-bold text-[#17337c]">
                    No suggested colleges available yet
                  </h3>
                  <p className="mt-2 text-[0.94rem] leading-6 text-[#60708f]">
                    We did not find any colleges for this degree, course, and cutoff combination in the current data.
                  </p>
                </div>
              )}
              </section>
            ) : null}

            <section
              ref={cutoffResultSectionRef}
              className={`${embedded ? "mt-8" : "mt-10"} overflow-hidden rounded-[10px] border border-[#E6EAF0] bg-white px-3 py-4 shadow-[0_10px_26px_rgba(15,27,37,0.08)] sm:px-7 sm:py-7`}
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#eef4ff] text-[#1758f4] shadow-[0_14px_24px_rgba(23,88,244,0.18)] sm:size-12">
                  <CheckCircle2 className="size-6 sm:size-8" strokeWidth={2.6} />
                </div>
                <h2 className="text-[1.7rem] font-semibold leading-tight text-[#07133b] sm:text-[2.45rem]">
                  Your Cutoff Result
                </h2>
              </div>
              <div className="mt-4 overflow-hidden rounded-[8px] border border-[#E6EAF0] bg-white sm:mt-6">
                {resultDetailRows.map((row, rowIndex) => (
                  <div
                    key={row.map((item) => item.label).join("-")}
                    className={`grid grid-cols-2 ${
                      rowIndex < resultDetailRows.length - 1 ? "border-b border-[#E6EAF0]" : ""
                    }`}
                  >
                    {row.map((item, itemIndex) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.label}
                          className={`grid min-h-[78px] grid-cols-[28px_minmax(0,1fr)] items-center gap-2 px-2.5 py-3 sm:min-h-[84px] sm:grid-cols-[58px_minmax(0,1fr)] sm:gap-3 sm:px-6 ${
                            itemIndex === 0 ? "border-r border-[#E6EAF0]" : ""
                          }`}
                        >
                          <div className="flex size-7 items-center justify-center rounded-full bg-[#eef4ff] text-[#1758f4] sm:size-11">
                            <Icon className={`size-4 sm:size-6 ${item.iconClassName || ""}`} strokeWidth={2.2} />
                          </div>
                          <div className="min-w-0">
                            <div className="text-[0.72rem] font-bold uppercase leading-4 tracking-[0.02em] text-[#465573] sm:text-[0.78rem]">
                              {item.label}
                            </div>
                            <div className="mt-1 break-words text-[0.86rem] font-semibold leading-5 text-[#07133b] sm:text-[1.08rem] sm:leading-6">
                              {item.value}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </section>

          </div>
        </main>
      </>
    );
  }

  return null;
}





