"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  BookOpen,
  BrainCircuit,
  Building2,
  CalendarDays,
  ChevronDown,
  Check,
  CheckCircle2,
  CircleAlert,
  FileText,
  FlaskConical,
  GraduationCap,
  LayoutGrid,
  LineChart,
  List,
  MapPin,
  Medal,
  Microscope,
  PenTool,
  Phone,
  ShieldCheck,
  Sparkles,
  Sprout,
  Star,
  Target,
  TrendingUp,
  Trophy,
  User,
  Users,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { parseCutoffValue } from "@/lib/cutoff-utils";
import { parseRankingRange } from "@/lib/ranking-utils";
import { normalizeText, type College, type Course } from "@/lib/site-data";

const COLLEGE_RETURN_URL_KEY = "collegeedwiser-college-return-url";
const CUTOFF_RETURN_TO_SUGGESTIONS_KEY = "collegeedwiser-cutoff-return-to-suggestions";

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

type StandardId = "6" | "7" | "8" | "9" | "10";
type SelectedLevelId = StandardId | "11" | "12";
type SubjectKey = "subjectOne" | "subjectTwo" | "subjectThree";

type SubjectMarks = Record<SubjectKey, number>;
type MarksByStandard = Record<StandardId, SubjectMarks>;

type PredictorCard = {
  id: string;
  name: string;
  location: string;
  image: string;
  logo: string;
  href: string;
  cutoffLabel: string;
  matchScore: number;
  isBestCollege: boolean;
  ranking: string;
  rankingStart: number | null;
  tierId: TierBucket["id"];
  targetScore: number | null;
  ownershipType: string;
  accreditation: string;
  establishedYear: string;
};

type SuggestedCollegeSort = "alphabetical" | "newest" | "oldest";
type SuggestedCollegeView = "grid" | "list";

const compactSearchText = (value: string) => normalizeText(value).replace(/[^a-z0-9]/g, "");

const suggestionMatchesSearch = (haystackParts: Array<string | number | null | undefined>, searchQuery: string) => {
  const normalizedQuery = normalizeText(searchQuery);
  const compactQuery = compactSearchText(searchQuery);
  const queryTokens = normalizedQuery.split(" ").filter(Boolean);
  if (!queryTokens.length && !compactQuery) return true;

  const normalizedHaystack = haystackParts
    .map((item) => normalizeText(String(item || "")))
    .filter(Boolean)
    .join(" ");
  const compactHaystack = compactSearchText(normalizedHaystack);

  return (
    normalizedHaystack.includes(normalizedQuery) ||
    (compactQuery.length > 0 && compactHaystack.includes(compactQuery)) ||
    queryTokens.every((token) => normalizedHaystack.includes(token) || compactHaystack.includes(compactSearchText(token)))
  );
};

const getCollegeLocationSearchParts = (college: PredictorCard, collegeRecord?: College) => [
  college.name,
  college.location,
  college.cutoffLabel,
  college.ranking,
  college.ownershipType,
  college.accreditation,
  college.establishedYear,
  collegeRecord?.name,
  collegeRecord?.collegeCode,
  collegeRecord?.university,
  collegeRecord?.district,
  collegeRecord?.city,
  collegeRecord?.state,
  collegeRecord?.country,
  collegeRecord?.address,
  collegeRecord?.pincode,
  collegeRecord?.description,
  ...(Array.isArray(collegeRecord?.streams) ? collegeRecord.streams : []),
  ...(Array.isArray(collegeRecord?.courseTags) ? collegeRecord.courseTags : []),
];

type FallbackCollegeAggregate = {
  college: College;
  minCutoff: number | null;
  maxCutoff: number | null;
};

type TierBucket = {
  id: "tier1" | "tier2" | "tier3";
  title: string;
  subtitle: string;
  chance: number;
  previewCards: PredictorCard[];
};

const SENIOR_SUGGESTIONS_PER_PAGE = 6;

// Junior standard appearance config for the premium cutoff page cards.
const STANDARD_OPTIONS: Array<{
  id: StandardId;
  label: string;
  chipTone: string;
  borderTone: string;
  softTone: string;
}> = [
    {
      id: "6",
      label: "6th Standard",
      chipTone: "from-sky-500 to-blue-600",
      borderTone: "border-sky-200",
      softTone: "from-sky-50 to-white",
    },
    {
      id: "7",
      label: "7th Standard",
      chipTone: "from-emerald-500 to-teal-600",
      borderTone: "border-emerald-200",
      softTone: "from-emerald-50 to-white",
    },
    {
      id: "8",
      label: "8th Standard",
      chipTone: "from-violet-500 to-indigo-600",
      borderTone: "border-violet-200",
      softTone: "from-violet-50 to-white",
    },
    {
      id: "9",
      label: "9th Standard",
      chipTone: "from-fuchsia-500 to-pink-600",
      borderTone: "border-fuchsia-200",
      softTone: "from-fuchsia-50 to-white",
    },
    {
      id: "10",
      label: "10th Standard",
      chipTone: "from-amber-500 to-orange-600",
      borderTone: "border-amber-200",
      softTone: "from-amber-50 to-white",
    },
  ];

type SubjectMeta = {
  key: SubjectKey;
  label: string;
  icon: typeof Microscope;
  accent: string;
  soft: string;
  stroke: string;
  progressTone: string;
  dotTone: string;
};

const DEGREE_SUBJECTS: Record<string, SubjectMeta[]> = {
  Engineering: [
    {
      key: "subjectOne",
      label: "Maths",
      icon: BrainCircuit,
      accent: "text-indigo-600",
      soft: "bg-indigo-50",
      stroke: "#6366f1",
      progressTone: "from-indigo-500 to-violet-600",
      dotTone: "bg-indigo-500",
    },
    {
      key: "subjectTwo",
      label: "Physics",
      icon: Microscope,
      accent: "text-sky-600",
      soft: "bg-sky-50",
      stroke: "#0ea5e9",
      progressTone: "from-sky-500 to-blue-600",
      dotTone: "bg-sky-500",
    },
    {
      key: "subjectThree",
      label: "Chemistry",
      icon: FlaskConical,
      accent: "text-rose-600",
      soft: "bg-rose-50",
      stroke: "#f43f5e",
      progressTone: "from-rose-500 to-orange-500",
      dotTone: "bg-rose-500",
    },
  ],
  "B.Arch": [
    {
      key: "subjectOne",
      label: "Maths",
      icon: BrainCircuit,
      accent: "text-indigo-600",
      soft: "bg-indigo-50",
      stroke: "#6366f1",
      progressTone: "from-indigo-500 to-violet-600",
      dotTone: "bg-indigo-500",
    },
    {
      key: "subjectTwo",
      label: "Drawing (Art)",
      icon: PenTool,
      accent: "text-amber-600",
      soft: "bg-amber-50",
      stroke: "#f59e0b",
      progressTone: "from-amber-500 to-orange-500",
      dotTone: "bg-amber-500",
    },
    {
      key: "subjectThree",
      label: "Physics",
      icon: Microscope,
      accent: "text-sky-600",
      soft: "bg-sky-50",
      stroke: "#0ea5e9",
      progressTone: "from-sky-500 to-blue-600",
      dotTone: "bg-sky-500",
    },
  ],
  "Arts & Science": [
    {
      key: "subjectOne",
      label: "History",
      icon: BookOpen,
      accent: "text-amber-700",
      soft: "bg-amber-50",
      stroke: "#d97706",
      progressTone: "from-amber-500 to-yellow-500",
      dotTone: "bg-amber-500",
    },
    {
      key: "subjectTwo",
      label: "Commerce",
      icon: LineChart,
      accent: "text-emerald-600",
      soft: "bg-emerald-50",
      stroke: "#10b981",
      progressTone: "from-emerald-500 to-teal-500",
      dotTone: "bg-emerald-500",
    },
    {
      key: "subjectThree",
      label: "Biology",
      icon: Microscope,
      accent: "text-pink-600",
      soft: "bg-pink-50",
      stroke: "#ec4899",
      progressTone: "from-pink-500 to-rose-500",
      dotTone: "bg-pink-500",
    },
  ],
  Medical: [
    {
      key: "subjectOne",
      label: "Biology",
      icon: Microscope,
      accent: "text-emerald-600",
      soft: "bg-emerald-50",
      stroke: "#10b981",
      progressTone: "from-emerald-500 to-teal-500",
      dotTone: "bg-emerald-500",
    },
    {
      key: "subjectTwo",
      label: "Chemistry",
      icon: FlaskConical,
      accent: "text-rose-600",
      soft: "bg-rose-50",
      stroke: "#f43f5e",
      progressTone: "from-rose-500 to-orange-500",
      dotTone: "bg-rose-500",
    },
    {
      key: "subjectThree",
      label: "Physics",
      icon: Target,
      accent: "text-sky-600",
      soft: "bg-sky-50",
      stroke: "#0ea5e9",
      progressTone: "from-sky-500 to-blue-600",
      dotTone: "bg-sky-500",
    },
  ],
  Law: [
    {
      key: "subjectOne",
      label: "English",
      icon: BookOpen,
      accent: "text-blue-600",
      soft: "bg-blue-50",
      stroke: "#2563eb",
      progressTone: "from-blue-500 to-sky-500",
      dotTone: "bg-blue-500",
    },
    {
      key: "subjectTwo",
      label: "History",
      icon: FileText,
      accent: "text-amber-700",
      soft: "bg-amber-50",
      stroke: "#d97706",
      progressTone: "from-amber-500 to-yellow-500",
      dotTone: "bg-amber-500",
    },
    {
      key: "subjectThree",
      label: "Political Science",
      icon: ShieldCheck,
      accent: "text-violet-600",
      soft: "bg-violet-50",
      stroke: "#7c3aed",
      progressTone: "from-violet-500 to-purple-500",
      dotTone: "bg-violet-500",
    },
  ],
  Agriculture: [
    {
      key: "subjectOne",
      label: "Biology",
      icon: Microscope,
      accent: "text-emerald-600",
      soft: "bg-emerald-50",
      stroke: "#10b981",
      progressTone: "from-emerald-500 to-teal-500",
      dotTone: "bg-emerald-500",
    },
    {
      key: "subjectTwo",
      label: "Chemistry",
      icon: FlaskConical,
      accent: "text-rose-600",
      soft: "bg-rose-50",
      stroke: "#f43f5e",
      progressTone: "from-rose-500 to-orange-500",
      dotTone: "bg-rose-500",
    },
    {
      key: "subjectThree",
      label: "Agriculture Basics",
      icon: Sprout,
      accent: "text-lime-700",
      soft: "bg-lime-50",
      stroke: "#65a30d",
      progressTone: "from-lime-500 to-emerald-500",
      dotTone: "bg-lime-500",
    },
  ],
  Paramedical: [
    {
      key: "subjectOne",
      label: "Biology",
      icon: Microscope,
      accent: "text-emerald-600",
      soft: "bg-emerald-50",
      stroke: "#10b981",
      progressTone: "from-emerald-500 to-teal-500",
      dotTone: "bg-emerald-500",
    },
    {
      key: "subjectTwo",
      label: "Chemistry",
      icon: FlaskConical,
      accent: "text-rose-600",
      soft: "bg-rose-50",
      stroke: "#f43f5e",
      progressTone: "from-rose-500 to-orange-500",
      dotTone: "bg-rose-500",
    },
    {
      key: "subjectThree",
      label: "Physics",
      icon: Target,
      accent: "text-sky-600",
      soft: "bg-sky-50",
      stroke: "#0ea5e9",
      progressTone: "from-sky-500 to-blue-600",
      dotTone: "bg-sky-500",
    },
  ],
};

// Default junior marks state used in the Enter Your Marks section.
const DEFAULT_MARKS: MarksByStandard = {
  "6": { subjectOne: 0, subjectTwo: 0, subjectThree: 0 },
  "7": { subjectOne: 0, subjectTwo: 0, subjectThree: 0 },
  "8": { subjectOne: 0, subjectTwo: 0, subjectThree: 0 },
  "9": { subjectOne: 0, subjectTwo: 0, subjectThree: 0 },
  "10": { subjectOne: 0, subjectTwo: 0, subjectThree: 0 },
};

const JUNIOR_GROUP_RECOMMENDATIONS = {
  Engineering: {
    title: "Science (PCM)",
    icon: GraduationCap,
    points: [
      "You are good in Maths",
      "Physics is also strong",
      "Chemistry can be improved",
      "This group is best for Engineering, Medical & Research Field",
    ],
  },
  "B.Arch": {
    title: "Architecture Track",
    icon: PenTool,
    points: [
      "Maths supports design thinking",
      "Drawing skill is important here",
      "Physics helps with structural basics",
      "This group is best for Architecture and Design courses",
    ],
  },
  "Arts & Science": {
    title: "Arts & Science Group",
    icon: BookOpen,
    points: [
      "History builds strong theory understanding",
      "Commerce improves analytical thinking",
      "Biology keeps science options open",
      "This group is best for Arts, Commerce and Science degrees",
    ],
  },
  Medical: {
    title: "Science (PCB)",
    icon: Microscope,
    points: [
      "Biology is the main strength for this path",
      "Chemistry is important for entrance preparation",
      "Physics needs steady practice",
      "This group is best for Medical and Life Science courses",
    ],
  },
  Law: {
    title: "Law & Humanities",
    icon: ShieldCheck,
    points: [
      "English builds communication skill",
      "History supports legal reasoning",
      "Political Science improves civic awareness",
      "This group is best for Law and Public Service paths",
    ],
  },
  Agriculture: {
    title: "Agriculture Science",
    icon: Sprout,
    points: [
      "Biology supports plant and life science",
      "Chemistry helps in soil and crop concepts",
      "Agriculture basics give field awareness",
      "This group is best for Agriculture and Food Science courses",
    ],
  },
  Paramedical: {
    title: "Paramedical Science",
    icon: Microscope,
    points: [
      "Biology is a core subject here",
      "Chemistry supports health science concepts",
      "Physics helps in practical healthcare applications",
      "This group is best for Allied Health and Paramedical courses",
    ],
  },
} as const;

// Shared label resolver for junior and senior level displays.
const labelForLevel = (value: SelectedLevelId) => {
  if (value === "11") return "11th Standard";
  if (value === "12") return "12th Standard";
  return STANDARD_OPTIONS.find((item) => item.id === value)?.label || "10th Standard";
};

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

// Senior roadmap content for 11th and 12th standard students.
const SENIOR_GUIDE: Record<
  string,
  {
    title: string;
    subtitle: string;
    exams: string[];
    checklist: string[];
    strategy: string[];
  }
> = {
  Engineering: {
    title: "Engineering roadmap",
    subtitle: "PCM strength, entrance readiness, and counselling direction should move together in 11th and 12th.",
    exams: ["JEE Main", "JEE Advanced", "BITSAT", "TNEA Counselling"],
    checklist: [
      "Physics, Chemistry, Maths must stay consistent across school and entrance prep",
      "Mock tests and chapter-wise revision should start early in 11th itself",
      "Board marks and cutoff range together improve college flexibility",
    ],
    strategy: ["Focus on concept clarity", "Weekly mocks", "Counselling shortlist planning"],
  },
  Medical: {
    title: "Medical roadmap",
    subtitle: "PCB mastery and NEET-focused practice should drive your score growth through senior secondary.",
    exams: ["NEET UG", "State Medical Counselling", "All India Quota"],
    checklist: [
      "Biology and Chemistry revision depth directly impacts NEET confidence",
      "Physics speed and accuracy need separate weekly problem practice",
      "Cutoff pressure is high, so consistency matters more than last-minute effort",
    ],
    strategy: ["Daily biology revision", "NEET tests", "Safe-score tracking"],
  },
  "Arts & Science": {
    title: "Arts & Science roadmap",
    subtitle: "Stream clarity, subject confidence, and university entrance planning should work together.",
    exams: ["CUET UG", "University Entrance", "Merit Admission"],
    checklist: [
      "Choose subjects aligned with the degree you want after 12th",
      "Track course-specific admission rules early",
      "Build language, aptitude, and subject confidence together",
    ],
    strategy: ["Course mapping", "Portfolio building", "University shortlist"],
  },
  Law: {
    title: "Law roadmap",
    subtitle: "Aptitude, reasoning, and legal awareness should become your strong edge before entrance season.",
    exams: ["CLAT", "AILET", "SLAT"],
    checklist: [
      "Reading speed and comprehension must improve steadily",
      "Mock legal reasoning practice should start early",
      "Top NLUs require both consistency and exam temperament",
    ],
    strategy: ["Current affairs", "Mock drills", "Reading habit"],
  },
  Agriculture: {
    title: "Agriculture roadmap",
    subtitle: "Science fundamentals and agriculture-oriented entrance awareness can open strong domain colleges.",
    exams: ["ICAR AIEEA", "State Agriculture Counselling"],
    checklist: [
      "Biology and chemistry fundamentals support this path strongly",
      "State counselling and ICAR timelines should be tracked carefully",
      "College type and specialization choice matter for long-term growth",
    ],
    strategy: ["Science focus", "ICAR prep", "College-fit planning"],
  },
  Paramedical: {
    title: "Paramedical roadmap",
    subtitle: "Allied health routes need clear course understanding, entrance awareness, and practical decision-making.",
    exams: ["State Entrance", "Health Science Counselling", "Institute Admission"],
    checklist: [
      "PCB fundamentals stay important for most allied health programs",
      "Different paramedical courses have different growth pathways",
      "Compare fees, placements, and clinical exposure before choosing",
    ],
    strategy: ["Course research", "PCB revision", "Safety shortlist"],
  },
  "B.Arch": {
    title: "Architecture roadmap",
    subtitle: "Creativity, aptitude, and score planning should combine before architecture admissions open.",
    exams: ["NATA", "JEE Paper 2"],
    checklist: [
      "Maths and visual reasoning both matter here",
      "Portfolio-style creative thinking helps even when entrance is score-based",
      "Architecture colleges vary a lot by fees and exposure",
    ],
    strategy: ["NATA prep", "Design practice", "College research"],
  },
};

const clampMark = (value: number) => Math.max(0, Math.min(100, value));

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

const averageMarks = (marks: SubjectMarks) =>
  Math.round((marks.subjectOne + marks.subjectTwo + marks.subjectThree) / 3);

const linePathForSeries = (values: number[], width = 320, height = 120) => {
  if (!values.length) return "";
  const stepX = values.length === 1 ? 0 : width / (values.length - 1);
  return values
    .map((value, index) => {
      const x = stepX * index;
      const y = height - (clampMark(value) / 100) * height;
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
};

const badgeForStrength = (marks: SubjectMarks) => {
  const entries = Object.entries(marks) as Array<[SubjectKey, number]>;
  const sorted = [...entries].sort((left, right) => right[1] - left[1]);
  const strong = sorted[0];
  const weak = sorted[sorted.length - 1];
  const improve = sorted[1] || sorted[0];
  return { strong, weak, improve };
};

const recommendationForDegree = (degree: string) =>
  JUNIOR_GROUP_RECOMMENDATIONS[degree as keyof typeof JUNIOR_GROUP_RECOMMENDATIONS] ||
  JUNIOR_GROUP_RECOMMENDATIONS.Engineering;

const juniorRecommendationLabel = () => "11th";

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

const predictorTierTheme = (tierId: TierBucket["id"]) => {
  if (tierId === "tier1") {
    return {
      titleColor: "text-[#1e4e79]",
      subtitleColor: "text-slate-500",
      iconWrap: "bg-[linear-gradient(135deg,rgba(37,99,235,0.12),rgba(255,255,255,0.96))] text-[#2563eb]",
      chanceColor: "text-[#2563eb]",
      progressTrack: "bg-[#dbeafe]",
      progressBar: "bg-[linear-gradient(90deg,#1e4e79,#2563eb)]",
      cardTone: "border-[#bfdbfe] bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)]",
      buttonTone: "bg-[#eff6ff] text-[#1d4ed8]",
    };
  }

  if (tierId === "tier2") {
    return {
      titleColor: "text-emerald-700",
      subtitleColor: "text-slate-500",
      iconWrap: "bg-slate-100 text-slate-500",
      chanceColor: "text-[#16a34a]",
      progressTrack: "bg-slate-200",
      progressBar: "bg-[linear-gradient(90deg,#16a34a,#0f9f72)]",
      cardTone: "border-[#dce9f8] bg-white",
      buttonTone: "bg-[#f4f7ff] text-[#3456ff]",
    };
  }

  return {
    titleColor: "text-rose-600",
    subtitleColor: "text-slate-500",
    iconWrap: "bg-orange-50 text-orange-500",
    chanceColor: "text-[#3949ff]",
    progressTrack: "bg-slate-200",
    progressBar: "bg-[linear-gradient(90deg,#4f46e5,#4f46e5,#7c3aed)]",
    cardTone: "border-[#f1d9dd] bg-[#fffafb]",
    buttonTone: "bg-[#f4f7ff] text-[#3456ff]",
  };
};

const juniorCardsGridClass = (count: number) => {
  if (count === 1) return "grid-cols-1 xl:grid-cols-12";
  if (count === 2) return "grid-cols-1 md:grid-cols-2 xl:grid-cols-12";
  if (count === 3) return "grid-cols-1 md:grid-cols-2 xl:grid-cols-12";
  if (count === 4) return "grid-cols-1 md:grid-cols-2 xl:grid-cols-12";
  return "grid-cols-1 md:grid-cols-2 xl:grid-cols-12";
};

const juniorCardSpanClass = (count: number) => {
  if (count === 1) return "xl:col-span-7";
  if (count === 2) return "xl:col-span-4";
  if (count === 3) return "xl:col-span-4";
  if (count === 4) return "xl:col-span-4";
  return "xl:col-span-4";
};

const juniorAsideSpanClass = (count: number) => {
  if (count === 1) return "xl:col-span-5";
  if (count === 2) return "xl:col-span-4";
  if (count === 3) return "xl:col-span-4 xl:col-start-9";
  if (count === 4) return "xl:col-span-4 xl:col-start-9";
  return "xl:col-span-4 xl:col-start-9";
};

const juniorIllustrationHeightClass = (count: number) => {
  if (count === 1) return "h-[420px] max-w-[460px]";
  if (count === 2) return "h-[360px] max-w-[380px]";
  if (count === 3) return "h-[330px] max-w-[360px]";
  if (count === 4) return "h-[320px] max-w-[350px]";
  return "h-[320px] max-w-[350px]";
};

const showJuniorInlineCta = (count: number) => count === 3;

const compactLevelLabel = (value: string) => value.replace(" Standard", "");

const formatCutoffLabel = (value: unknown) => {
  const parsed = parseCutoffValue(String(value || ""));
  if (!parsed || Math.max(parsed.start, parsed.end) <= 0) return "Cutoff unavailable";
  return parsed.start === parsed.end ? `${parsed.start}` : `${parsed.start} - ${parsed.end}`;
};

const buildCutoffRangeLabel = (minCutoff: number | null, maxCutoff: number | null) => {
  if ((minCutoff === null || minCutoff <= 0) && (maxCutoff === null || maxCutoff <= 0)) return "Cutoff unavailable";
  if (minCutoff === null) return `${maxCutoff}`;
  if (maxCutoff === null) return `${minCutoff}`;
  return minCutoff === maxCutoff ? `${minCutoff}` : `${minCutoff} - ${maxCutoff}`;
};

const hasUsableCutoffRange = (value: string | number | null | undefined) => {
  const parsed = parseCutoffValue(value);
  return Boolean(parsed && Math.max(parsed.start, parsed.end) > 0);
};

const DEGREE_MATCH_ALIASES: Record<string, string[]> = {
  Engineering: ["engineering", "be", "btech", "b.e", "b.tech", "technology"],
  "Arts & Science": ["arts", "science", "arts science", "bsc", "b.sc", "ba", "b.a", "bcom", "b.com"],
  Law: ["law", "llb", "ba llb", "bba llb", "llm", "legal"],
  "B.Arch": ["barch", "b.arch", "architecture", "arch", "design"],
  Paramedical: ["paramedical", "allied health", "health science", "nursing", "physiotherapy", "radiology"],
  Medical: ["medical", "mbbs", "bds", "doctor", "medicine", "clinical"],
  Agriculture: ["agriculture", "agri", "farming", "food science", "crop science"],
};

const matchesAnyAlias = (haystack: string, aliases: string[]) =>
  aliases.some((alias) => haystack.includes(normalizeText(alias)));

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
  const aliases = DEGREE_MATCH_ALIASES[degree] || [degreeToken];
  return matchesAnyAlias(haystack, aliases);
};

const degreeMatchesCollege = (college: College, degree: string) => {
  if (!degree) return true;
  const degreeToken = normalizeText(degree);
  if (!degreeToken) return true;

  const haystack = [
    ...(Array.isArray(college.streams) ? college.streams : []),
    ...(Array.isArray(college.courseTags) ? college.courseTags : []),
    college.name,
    college.university,
    college.description,
  ]
    .map((item) => normalizeText(String(item || "")))
    .filter(Boolean)
    .join(" ");

  if (haystack.includes(degreeToken)) return true;
  const aliases = DEGREE_MATCH_ALIASES[degree] || [degreeToken];
  return matchesAnyAlias(haystack, aliases);
};

const courseMatchesSelection = (course: Course, selectedCourse: string, selectedSpecialization: string) => {
  const courseSearch = normalizeText(selectedCourse);
  const specializationSearch = normalizeText(selectedSpecialization);
  if (!courseSearch && !specializationSearch) return true;

  const courseName = normalizeText(course.course || course.courseName || course.courseType || "");
  const specialization = normalizeText(course.specialization || course.courseName || "");
  const stream = normalizeText(course.stream || course.courseCategory || "");
  const courseHaystack = [courseName, specialization, stream].filter(Boolean).join(" ");

  if (
    courseSearch &&
    (
      courseHaystack.includes(courseSearch) ||
      courseSearch.includes(courseName) ||
      courseSearch.includes(specialization) ||
      courseSearch.includes(stream)
    )
  ) {
    if (!specializationSearch) return true;
    return specialization.includes(specializationSearch);
  }

  if (specializationSearch && specialization.includes(specializationSearch)) return true;
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

const courseMatchesExamSelection = (course: Course, selectedExam: string) => {
  if (!selectedExam) return true;
  const entranceExams = Array.isArray(course.entranceExams) ? course.entranceExams : [];
  return entranceExams.some((exam) => examNameMatchesSelection(String(exam.examName || ""), selectedExam));
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

const findCollegeForCourseDetail = (
  colleges: College[],
  detail: Course["collegeDetails"][number] | { college?: string; collegeId?: string; collegeCode?: string },
) => {
  const detailKeys = [detail.college || "", detail.collegeId || "", detail.collegeCode || ""]
    .map((value) => normalizeText(String(value || "")))
    .filter(Boolean);
  if (!detailKeys.length) return undefined;

  return colleges.find((college) => {
    const collegeKeys = getCollegeLookupValues(college);
    return detailKeys.some((detailKey) =>
      collegeKeys.some(
        (collegeKey) =>
          collegeKey === detailKey ||
          collegeKey.includes(detailKey) ||
          detailKey.includes(collegeKey),
      ),
    );
  });
};

const collegeTypeMatches = (college: College, selectedCollegeType: string) => {
  const selected = normalizeText(selectedCollegeType);
  if (!selected) return true;
  const ownership = normalizeText(college.ownershipType || "");
  if (selected.includes("government") || selected.includes("govt")) {
    return ownership.includes("government") || ownership.includes("govt") || ownership.includes("public");
  }
  if (selected.includes("private")) {
    return ownership.includes("private") || ownership.includes("self") || ownership.includes("deemed");
  }
  return true;
};

const getRankingStartValue = (ranking: string) => {
  const parsed = parseRankingRange(ranking);
  if (!parsed) return null;
  return Math.min(parsed.start, parsed.end);
};

const getTierIdForRanking = (ranking: string): TierBucket["id"] => {
  const start = getRankingStartValue(ranking);
  if (start !== null && start <= 75) return "tier1";
  if (start !== null && start <= 150) return "tier2";
  return "tier3";
};

const cutoffMatchesScore = (cutoffValue: string | number, score: number) => {
  const parsed = parseCutoffValue(cutoffValue);
  if (!parsed || Math.max(parsed.start, parsed.end) <= 0) return false;
  const start = Math.min(parsed.start, parsed.end);
  const end = Math.max(parsed.start, parsed.end);
  if (start === end) return score >= start;
  return score >= start && score <= end;
};

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
  const initialJuniorStandard = (isJuniorLevel ? resolvedLevel : "10") as StandardId;
  const [activeStandard, setActiveStandard] = useState<StandardId>(initialJuniorStandard);
  const [analyzedStandard, setAnalyzedStandard] = useState<StandardId>(initialJuniorStandard);
  const [marksByStandard, setMarksByStandard] = useState<MarksByStandard>(DEFAULT_MARKS);
  const [hasAnalyzedJunior, setHasAnalyzedJunior] = useState(false);
  const [showSuggestedColleges, setShowSuggestedColleges] = useState(
    () => typeof window !== "undefined" && window.sessionStorage.getItem(CUTOFF_RETURN_TO_SUGGESTIONS_KEY) === "1",
  );
  const [suggestionSort, setSuggestionSort] = useState<SuggestedCollegeSort>("alphabetical");
  const [isSuggestionSortOpen, setIsSuggestionSortOpen] = useState(false);
  const [suggestionView, setSuggestionView] = useState<SuggestedCollegeView>("grid");
  const [suggestionPage, setSuggestionPage] = useState(1);
  const juniorAnalysisRef = useRef<HTMLElement | null>(null);
  const whatsNextSectionRef = useRef<HTMLElement | null>(null);
  const suggestedCollegesButtonRef = useRef<HTMLButtonElement | null>(null);
  const suggestedCollegesSectionRef = useRef<HTMLElement | null>(null);
  const rememberCollegeReturnRoute = useCallback(() => {
    window.sessionStorage.setItem(COLLEGE_RETURN_URL_KEY, `${window.location.pathname}${window.location.search}`);
    window.sessionStorage.setItem(CUTOFF_RETURN_TO_SUGGESTIONS_KEY, "1");
  }, []);

  const handleArrowScrollToSuggestedColleges = useCallback(() => {
    whatsNextSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleSuggestCollegesAction = useCallback(() => {
    if (showSuggestedColleges && suggestedCollegesSectionRef.current) {
      suggestedCollegesSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    setShowSuggestedColleges(true);
    window.setTimeout(() => {
      suggestedCollegesSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 160);
  }, [showSuggestedColleges]);

  // Header summary values.
  const safeStudentName = String(studentName || "").trim() || "Student";
  const topStandardLabel = labelForLevel(resolvedLevel);
  const juniorSubjectMeta = useMemo(
    () => DEGREE_SUBJECTS[selectedDegree] || DEGREE_SUBJECTS.Engineering,
    [selectedDegree],
  );
  const visibleJuniorStandards = useMemo(
    () =>
      STANDARD_OPTIONS.filter((item) =>
        Number(item.id) <= Number(isJuniorLevel ? resolvedLevel : "10"),
      ),
    [isJuniorLevel, resolvedLevel],
  );
  const analyzedMarks = marksByStandard[analyzedStandard];
  const analyzedAverage = averageMarks(analyzedMarks);

  const performanceSummary = badgeForStrength(analyzedMarks);
  const groupRecommendation = recommendationForDegree(selectedDegree);
  const allVisibleJuniorMarksFilled = useMemo(
    () =>
      visibleJuniorStandards.every((standard) =>
        juniorSubjectMeta.every((subject) => marksByStandard[standard.id][subject.key] > 0),
      ),
    [juniorSubjectMeta, marksByStandard, visibleJuniorStandards],
  );
  const showJuniorAnalysis = isJuniorLevel && hasAnalyzedJunior && allVisibleJuniorMarksFilled;
  // Normalized cutoff score used by the predictor.
  const selectedCutoffScore = useMemo(() => {
    const parsed = parseCutoffValue(enteredCutoff);
    if (!parsed) return null;
    return Math.max(parsed.start, parsed.end);
  }, [enteredCutoff]);

  const predictorBenchmark = selectedCutoffScore ?? analyzedAverage;
  const predictorPercentage = useMemo(() => {
    const scaleMax =
      selectedCutoffScore !== null
        ? getCutoffScale(selectedDegree, selectedAdmissionType)
        : 100;
    if (!Number.isFinite(predictorBenchmark) || predictorBenchmark <= 0) return 0;
    if (scaleMax > 100) {
      return Math.max(0, Math.min(100, Math.round((predictorBenchmark / scaleMax) * 100)));
    }
    return Math.max(0, Math.min(100, Math.round(predictorBenchmark)));
  }, [
    predictorBenchmark,
    resolvedLevel,
    selectedAdmissionType,
    selectedCutoffScore,
    selectedDegree,
  ]);
  const eligibleCourses = useMemo(
    () => courses.filter((course) => !isCertificateCourse(course)),
    [courses],
  );
  const courseBasedCollegeCards = useMemo(() => {
    const scaleMax = getCutoffScale(selectedDegree, selectedAdmissionType);
    const categoryKey = normalizeCategoryKey(selectedCategory);
    const mapped = new Map<string, PredictorCard>();

    eligibleCourses.forEach((course) => {
      if (!degreeMatchesCourse(course, selectedDegree)) return;
      if (!courseMatchesSelection(course, selectedCourse, selectedSpecialization)) return;
      if (hasExamBasedCutoffFlow && !courseMatchesExamSelection(course, selectedAdmissionType)) return;

      const selectedExam = hasExamBasedCutoffFlow
        ? getSelectedExamForCourse(course, selectedAdmissionType)
        : undefined;
      const examCutoffValue = hasExamBasedCutoffFlow
        ? getExamCutoffValue(selectedExam, categoryKey)
        : "";
      if (hasExamBasedCutoffFlow && !examCutoffValue) return;

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

      details.forEach((detail) => {
        const college = findCollegeForCourseDetail(colleges, detail);

        if (!college || !collegeTypeMatches(college, selectedCollegeType)) return;

        const categoryCutoff = hasExamBasedCutoffFlow
          ? ""
          : getCategoryCutoffValue(detail.cutoffByCategory || course.cutoffByCategory || [], categoryKey);

        const rawCutoff = hasExamBasedCutoffFlow
          ? examCutoffValue
          : categoryCutoff || detail.cutoffText || course.cutoffText || detail.cutoff || course.cutoff;
        const parsed = parseCutoffValue(String(rawCutoff || ""));
        const targetRaw = parsed ? Math.max(parsed.start, parsed.end) : Number(rawCutoff || 0);
        const scaledTarget =
          Number.isFinite(targetRaw) && targetRaw > 0
            ? scaleMax > 100
              ? Math.min(100, Math.round((targetRaw / scaleMax) * 100))
              : Math.min(100, Math.round(targetRaw))
            : 68;

        const matchScore = Math.max(38, Math.min(98, Math.round(100 - Math.max(0, scaledTarget - predictorPercentage) * 1.6)));
        const existing = mapped.get(college.id);
        const ranking = String(college.ranking || "");
        const rankingStart = getRankingStartValue(ranking);

        const nextCard: PredictorCard = {
          id: college.id,
          name: college.name,
          location: [college.district, college.state].filter(Boolean).join(", "),
          image: college.image || "",
          logo: college.logo || "",
          href: `/college/${college.id}`,
          cutoffLabel: formatCutoffLabel(rawCutoff),
          matchScore,
          isBestCollege: Boolean(college.isBestCollege || college.isTopCollege),
          ranking,
          rankingStart,
          tierId: getTierIdForRanking(ranking),
          targetScore: Number.isFinite(targetRaw) && targetRaw > 0 ? targetRaw : null,
          ownershipType: String(college.ownershipType || "Private"),
          accreditation: String(college.accreditation || "AICTE"),
          establishedYear: String(college.establishedYear || "Est. --"),
        };

        if (
          !existing ||
          nextCard.matchScore > existing.matchScore ||
          (
            nextCard.matchScore === existing.matchScore &&
            nextCard.rankingStart !== null &&
            (existing.rankingStart === null || nextCard.rankingStart < existing.rankingStart)
          )
        ) {
          mapped.set(college.id, nextCard);
        }
      });
    });

    const fallbackAggregates = new Map<string, FallbackCollegeAggregate>();

    eligibleCourses.forEach((course) => {
      if (!degreeMatchesCourse(course, selectedDegree)) return;
      if ((selectedCourse || selectedSpecialization) && !courseMatchesSelection(course, selectedCourse, selectedSpecialization)) {
        return;
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

      details.forEach((detail) => {
        const college = findCollegeForCourseDetail(colleges, detail);

        if (!college || !collegeTypeMatches(college, selectedCollegeType)) return;

        const rawCutoff =
          getCategoryCutoffValue(detail.cutoffByCategory || course.cutoffByCategory || [], categoryKey) ||
          detail.cutoffText ||
          course.cutoffText ||
          detail.cutoff ||
          course.cutoff;
        const parsed = parseCutoffValue(String(rawCutoff || ""));
        if (!parsed || Math.max(parsed.start, parsed.end) <= 0) return;

        const existing = fallbackAggregates.get(college.id);
        if (!existing) {
          fallbackAggregates.set(college.id, {
            college,
            minCutoff: Math.min(parsed.start, parsed.end),
            maxCutoff: Math.max(parsed.start, parsed.end),
          });
          return;
        }

        fallbackAggregates.set(college.id, {
          college,
          minCutoff:
            existing.minCutoff === null
              ? Math.min(parsed.start, parsed.end)
              : Math.min(existing.minCutoff, parsed.start, parsed.end),
          maxCutoff:
            existing.maxCutoff === null
              ? Math.max(parsed.start, parsed.end)
              : Math.max(existing.maxCutoff, parsed.start, parsed.end),
        });
      });
    });

    const fallbackCards = Array.from(fallbackAggregates.values())
      .sort((left, right) => {
        const leftTier = getTierIdForRanking(String(left.college.ranking || ""));
        const rightTier = getTierIdForRanking(String(right.college.ranking || ""));
        if (leftTier !== rightTier) {
          const tierOrder = { tier1: 0, tier2: 1, tier3: 2 };
          return tierOrder[leftTier] - tierOrder[rightTier];
        }

        const leftRankingStart = getRankingStartValue(String(left.college.ranking || ""));
        const rightRankingStart = getRankingStartValue(String(right.college.ranking || ""));
        if (leftRankingStart !== null && rightRankingStart !== null && leftRankingStart !== rightRankingStart) {
          return leftRankingStart - rightRankingStart;
        }
        if (leftRankingStart !== null && rightRankingStart === null) return -1;
        if (leftRankingStart === null && rightRankingStart !== null) return 1;
        return left.college.name.localeCompare(right.college.name);
      })
      .slice(0, 12)
      .map(({ college, minCutoff, maxCutoff }) => {
        const targetScore = maxCutoff;
        const scaledTarget =
          Number.isFinite(targetScore) && targetScore !== null && targetScore > 0
            ? scaleMax > 100
              ? Math.min(100, Math.round((targetScore / scaleMax) * 100))
              : Math.min(100, Math.round(targetScore))
            : 68;

        return {
          id: college.id,
          name: college.name,
          location: [college.district, college.state].filter(Boolean).join(", "),
          image: college.image || "",
          logo: college.logo || "",
          href: `/college/${college.id}`,
          cutoffLabel: buildCutoffRangeLabel(minCutoff, maxCutoff),
          matchScore: Math.max(38, Math.min(98, Math.round(100 - Math.max(0, scaledTarget - predictorPercentage) * 1.6))),
          isBestCollege: Boolean(college.isBestCollege || college.isTopCollege),
          ranking: String(college.ranking || ""),
          rankingStart: getRankingStartValue(String(college.ranking || "")),
          tierId: getTierIdForRanking(String(college.ranking || "")),
          targetScore: targetScore && Number.isFinite(targetScore) ? targetScore : null,
          ownershipType: String(college.ownershipType || "Private"),
          accreditation: String(college.accreditation || "AICTE"),
          establishedYear: String(college.establishedYear || "Est. --"),
        };
      });

    const genericFallbackCards = colleges
      .filter((college) => degreeMatchesCollege(college, selectedDegree))
      .filter((college) => collegeTypeMatches(college, selectedCollegeType))
      .slice(0, 12)
      .map((college) => ({
        id: college.id,
        name: college.name,
        location: [college.district, college.state].filter(Boolean).join(", "),
        image: college.image || "",
        logo: college.logo || "",
        href: `/college/${college.id}`,
        cutoffLabel: "Cutoff unavailable",
        matchScore: 55,
        isBestCollege: Boolean(college.isBestCollege || college.isTopCollege),
        ranking: String(college.ranking || ""),
        rankingStart: getRankingStartValue(String(college.ranking || "")),
        tierId: getTierIdForRanking(String(college.ranking || "")),
        targetScore: null,
        ownershipType: String(college.ownershipType || "Private"),
        accreditation: String(college.accreditation || "AICTE"),
        establishedYear: String(college.establishedYear || "Est. --"),
      }));

    const sortedCards = Array.from(mapped.values()).sort((left, right) => {
      if (left.tierId !== right.tierId) {
        const tierOrder = { tier1: 0, tier2: 1, tier3: 2 };
        return tierOrder[left.tierId] - tierOrder[right.tierId];
      }
      if (left.rankingStart !== null && right.rankingStart !== null && left.rankingStart !== right.rankingStart) {
        return left.rankingStart - right.rankingStart;
      }
      if (left.rankingStart !== null && right.rankingStart === null) return -1;
      if (left.rankingStart === null && right.rankingStart !== null) return 1;
      return right.matchScore - left.matchScore;
    });
    if (isTwelfthStandard) return sortedCards;
    return sortedCards.length ? sortedCards : fallbackCards.length ? fallbackCards : genericFallbackCards;
  }, [
    colleges,
    eligibleCourses,
    hasExamBasedCutoffFlow,
    isTwelfthStandard,
    predictorPercentage,
    selectedAdmissionType,
    selectedCategory,
    selectedCollegeType,
    selectedCourse,
    selectedDegree,
    resolvedLevel,
    selectedSpecialization,
  ]);

  // Backend/public data-driven college matching engine.
  const matchingColleges = useMemo(() => {
    const requiresExactCutoffMatch = usesFocusedMatchFlow && selectedCutoffScore !== null;
    if (!requiresExactCutoffMatch) return courseBasedCollegeCards;
    const exactMatches = courseBasedCollegeCards.filter(
      (college) =>
        college.targetScore !== null &&
        cutoffMatchesScore(college.cutoffLabel, selectedCutoffScore),
    );
    return exactMatches.length ? exactMatches : courseBasedCollegeCards;
  }, [courseBasedCollegeCards, selectedCutoffScore, usesFocusedMatchFlow]);

  // Tier 1 / Tier 2 / Tier 3 predictor grouping.
  const predictorTiers = useMemo<TierBucket[]>(() => {
    const firstTierCards = matchingColleges.filter((card) => card.tierId === "tier1");
    const secondTierCards = matchingColleges.filter((card) => card.tierId === "tier2");
    const thirdTierCards = matchingColleges.filter((card) => card.tierId === "tier3");

    const getChance = (cards: PredictorCard[], offset: number) => {
      if (!cards.length) return Math.max(38, predictorPercentage - offset);
      const avg = cards.reduce((total, card) => total + card.matchScore, 0) / cards.length;
      return Math.max(35, Math.min(96, Math.round(avg - offset)));
    };

    return [
      {
        id: "tier1",
        title: "Tier 1 Colleges",
        subtitle: "Top national campuses and highly competitive choices",
        chance: getChance(firstTierCards, 8),
        previewCards: firstTierCards,
      },
      {
        id: "tier2",
        title: "Tier 2 Colleges",
        subtitle: "Balanced picks with strong placements and safer reach",
        chance: getChance(secondTierCards, 1),
        previewCards: secondTierCards,
      },
      {
        id: "tier3",
        title: "Tier 3 Colleges",
        subtitle: "Comfort options that still keep momentum strong",
        chance: getChance(thirdTierCards, -8),
        previewCards: thirdTierCards,
      },
    ];
  }, [matchingColleges, predictorPercentage]);

  // Senior-only roadmap and stretch options.
  const seniorGuide = SENIOR_GUIDE[selectedDegree] || SENIOR_GUIDE.Engineering;
  const bArchSubmittedBoardTotal = String(submittedDetails.boardTotal || "").trim();
  const bArchSubmittedConvertedScore = String(
    submittedDetails.converted12th || enteredCutoff || "",
  ).trim();
  const bArchSubmittedNataScore = String(submittedDetails.nata || "").trim();
  const showBArchResultBreakdown = selectedDegree === "B.Arch" && Boolean(bArchSubmittedBoardTotal);
  const twelfthBestColleges = useMemo(
    () => (usesFocusedMatchFlow && !hasExamBasedCutoffFlow ? matchingColleges.filter((card) => card.isBestCollege) : []),
    [hasExamBasedCutoffFlow, matchingColleges, usesFocusedMatchFlow],
  );
  const twelfthOtherColleges = useMemo(
    () => (usesFocusedMatchFlow && !hasExamBasedCutoffFlow ? matchingColleges.filter((card) => !card.isBestCollege) : []),
    [hasExamBasedCutoffFlow, matchingColleges, usesFocusedMatchFlow],
  );
  const seniorBestPicks = matchingColleges.slice(0, 3);
  const seniorStretchCards = useMemo(
    () =>
      !isJuniorLevel && selectedCutoffScore !== null
        ? courseBasedCollegeCards.filter(
            (item) => item.targetScore !== null && item.targetScore > selectedCutoffScore,
          )
        : [],
    [courseBasedCollegeCards, isJuniorLevel, selectedCutoffScore],
  );
  const seniorOpportunityCards = useMemo(
    () =>
      seniorStretchCards
        .slice(0, 10)
        .map((item) => ({
          ...item,
          need:
            item.targetScore !== null && selectedCutoffScore !== null
              ? `${Math.max(1, Number((item.targetScore - selectedCutoffScore).toFixed(1)))} more cutoff needed`
              : "More cutoff needed",
        })),
    [selectedCutoffScore, seniorStretchCards],
  );

  // Junior marks form input handler.
  const handleMarkChange = (standard: StandardId, subject: SubjectKey, nextValue: string) => {
    const digitsOnly = nextValue.replace(/[^\d]/g, "");
    const parsed = digitsOnly ? clampMark(Number(digitsOnly)) : 0;
    setMarksByStandard((prev) => ({
      ...prev,
      [standard]: {
        ...prev[standard],
        [subject]: parsed,
      },
    }));
    setActiveStandard(standard);
    setHasAnalyzedJunior(false);
  };

  const renderMatchedCollegeCards = (cards: PredictorCard[], options?: { horizontalScroll?: boolean }) => (
    <div className={options?.horizontalScroll ? "relative" : ""}>
      {options?.horizontalScroll ? (
        <>
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 rounded-l-[1.2rem] bg-[linear-gradient(90deg,rgba(248,251,255,0.96),rgba(248,251,255,0))]" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 rounded-r-[1.2rem] bg-[linear-gradient(270deg,rgba(248,251,255,0.96),rgba(248,251,255,0))]" />
          <div className="mb-3 flex justify-end">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50/80 px-3 py-1 text-[11px] font-semibold text-sky-700">
              <Sparkles className="size-3" />
              Swipe to see more colleges
            </div>
          </div>
        </>
      ) : null}

      <div
        className={
          options?.horizontalScroll
            ? "flex gap-4 overflow-x-auto px-1 py-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            : "grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        }
      >
        {cards.map((college) => (
          <Link
            key={college.id}
            href={college.href}
            className={`group box-border rounded-[1.35rem] border border-[#d8e3ff] bg-white p-3 shadow-[0_12px_28px_rgba(52,86,255,0.08)] transition-[border-color,box-shadow] duration-200 hover:border-[#b8caff] hover:shadow-[0_18px_36px_rgba(52,86,255,0.14)] ${
              options?.horizontalScroll
                ? "w-[min(20rem,calc(100vw-2rem))] max-w-full shrink-0 sm:w-[calc((100%-1rem)/2)] xl:w-[calc((100%-2rem)/3)]"
                : ""
            }`}
          >
            <div className="relative h-40 w-full overflow-hidden rounded-[1rem] border border-[#dfe7ff] bg-[linear-gradient(180deg,#ffffff_0%,#f6f9ff_100%)]">
              {college.isBestCollege ? (
                <div className="absolute left-3 top-3 z-10 inline-flex items-center rounded-full bg-[linear-gradient(135deg,#f59e0b,#f97316)] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white shadow-[0_10px_24px_rgba(249,115,22,0.28)]">
                  Best College
                </div>
              ) : null}
              <Image
                src={college.image}
                alt={college.name}
                fill
                sizes="(min-width: 1280px) 360px, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition duration-300 group-hover:scale-105"
              />
            </div>

            <div className="mt-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="line-clamp-2 text-sm font-bold text-slate-900">{college.name}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                  <MapPin className="size-3 shrink-0" />
                  <span className="truncate">{college.location || "Tamil Nadu"}</span>
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                {college.matchScore}%
              </span>
            </div>

            <p className="mt-3 text-sm font-semibold text-slate-700">{college.cutoffLabel} cutoff</p>
          </Link>
        ))}
      </div>
    </div>
  );

  useEffect(() => {
    if (!showJuniorAnalysis) return;
    const frame = window.requestAnimationFrame(() => {
      juniorAnalysisRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [showJuniorAnalysis]);

  useEffect(() => {
    if (typeof window === "undefined" || isJuniorLevel) return;
    if (window.sessionStorage.getItem(CUTOFF_RETURN_TO_SUGGESTIONS_KEY) !== "1") return;

    window.sessionStorage.removeItem(CUTOFF_RETURN_TO_SUGGESTIONS_KEY);

    const scrollTimer = window.setTimeout(() => {
      suggestedCollegesSectionRef.current?.scrollIntoView({ behavior: "auto", block: "start" });
    }, 80);
    const scrollIntoViewTimer = window.setTimeout(() => {
      suggestedCollegesSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 850);

    return () => {
      window.clearTimeout(scrollTimer);
      window.clearTimeout(scrollIntoViewTimer);
    };
  }, [isJuniorLevel]);

  const selectedCollegeRecord = colleges.find(
    (college) =>
      normalizeText(college.id) === normalizeText(selectedDreamCollege) ||
      normalizeText(college.name) === normalizeText(selectedDreamCollege),
  );
  
  const dreamCollegeName = selectedCollegeRecord?.name || selectedDreamCollege || "-";
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
      { label: "Phone", value: submittedDetails.phone || "-", icon: Phone },
      { label: "Dream College", value: dreamCollegeName, icon: Building2 },
    ],
    [
      { label: "Course", value: selectedCourse || "-", icon: BookOpen },
      { label: "State", value: selectedState || "Tamil Nadu", icon: MapPin },
    ],
  ];
  const selectedCollegeMatchCard = matchingColleges.find(
    (college) => matchesSelectedCollegeKey(college.id) || matchesSelectedCollegeKey(college.name),
  );
  const selectedCollegeLogo =
    selectedCollegeRecord?.logo ||
    selectedCollegeRecord?.image ||
    selectedCollegeMatchCard?.image ||
    "";
  const selectedCourseForCollege = eligibleCourses.find((course) => {
    if (!degreeMatchesCourse(course, selectedDegree)) return false;
    if (!courseMatchesSelection(course, selectedCourse, selectedSpecialization)) return false;
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

    return details.some((detail) => {
      return (
        matchesSelectedCollegeKey(String(detail.college || "")) ||
        matchesSelectedCollegeKey(String(detail.collegeId || "")) ||
        matchesSelectedCollegeKey(String(detail.collegeCode || ""))
      );
    });
  });
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
  const selectedCategoryCutoff = getCategoryCutoffValue(
    selectedCourseDetails?.cutoffByCategory || selectedCourseForCollege?.cutoffByCategory || [],
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
    selectedCourseDetails?.cutoffText ||
    selectedCourseForCollege?.cutoffText ||
    selectedCourseDetails?.cutoff ||
    selectedCourseForCollege?.cutoff ||
    selectedCollegeMatchCard?.cutoffLabel ||
    "";
  const parsedSelectedCollegeCutoff = parseCutoffValue(String(rawSelectedCollegeCutoff || ""));
  const hasSelectedCollegeCutoffValue = hasUsableCutoffRange(rawSelectedCollegeCutoff);
  const selectedCollegeCutoffScore =
    parsedSelectedCollegeCutoff && hasSelectedCollegeCutoffValue
      ? Math.max(parsedSelectedCollegeCutoff.start, parsedSelectedCollegeCutoff.end)
      : selectedCollegeMatchCard?.targetScore ?? null;
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
      : hasUsableCutoffRange(selectedCollegeMatchCard?.cutoffLabel)
        ? selectedCollegeMatchCard?.cutoffLabel || "Not available"
        : "Not available";
  const selectedCollegeComparison = compareScoreToCutoff(
    rawSelectedCollegeCutoff || selectedCollegeMatchCard?.cutoffLabel || "",
    selectedCutoffScore,
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
      : "Don’t worry! Click “Suggest Colleges for Me” to explore better options that match your score.";
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
  const suggestedCollegeRows = useMemo(
    () => matchingColleges.filter((college) => !matchesSelectedCollegeKey(college.id) && !matchesSelectedCollegeKey(college.name)),
    [matchingColleges, matchesSelectedCollegeKey],
  );
  const collegeSearchLookup = useMemo(() => {
    const lookup = new Map<string, College>();
    colleges.forEach((college) => {
      [
        college.id,
        college.collegeCode,
        college.name,
        college.university,
      ]
        .map((value) => normalizeText(String(value || "")))
        .filter(Boolean)
        .forEach((key) => lookup.set(key, college));
    });
    return lookup;
  }, [colleges]);
  const findCollegeRecordForSuggestion = useCallback(
    (suggestion: PredictorCard) => {
      const directMatch =
        collegeSearchLookup.get(normalizeText(suggestion.id)) ||
        collegeSearchLookup.get(normalizeText(suggestion.name));
      if (directMatch) return directMatch;

      const suggestionKeys = [suggestion.id, suggestion.name]
        .map((value) => normalizeText(String(value || "")))
        .filter(Boolean);
      if (!suggestionKeys.length) return undefined;

      return colleges.find((college) => {
        const collegeKeys = [
          college.id,
          college.collegeCode,
          college.name,
          college.university,
        ]
          .map((value) => normalizeText(String(value || "")))
          .filter(Boolean);

        return suggestionKeys.some((suggestionKey) =>
          collegeKeys.some(
            (collegeKey) =>
              collegeKey === suggestionKey ||
              collegeKey.includes(suggestionKey) ||
              suggestionKey.includes(collegeKey),
          ),
        );
      });
    },
    [collegeSearchLookup, colleges],
  );
  const filteredSuggestedCollegeRows = useMemo(() => {
    const sortByYear = (college: PredictorCard) => {
      const parsed = Number.parseInt(college.establishedYear, 10);
      return Number.isFinite(parsed) ? parsed : 0;
    };
    return suggestedCollegeRows
      .filter((college) => {
        return suggestionMatchesSearch(
          getCollegeLocationSearchParts(college, findCollegeRecordForSuggestion(college)),
          "",
        );
      })
      .sort((left, right) => {
        if (suggestionSort === "newest") {
          return sortByYear(right) - sortByYear(left) || left.name.localeCompare(right.name);
        }
        if (suggestionSort === "oldest") {
          return sortByYear(left) - sortByYear(right) || left.name.localeCompare(right.name);
        }
        return left.name.localeCompare(right.name);
      });
  }, [findCollegeRecordForSuggestion, suggestedCollegeRows, suggestionSort]);
  const suggestionPageCount = Math.max(1, Math.ceil(filteredSuggestedCollegeRows.length / SENIOR_SUGGESTIONS_PER_PAGE));
  const safeSuggestionPage = Math.min(suggestionPage, suggestionPageCount);
  const visibleSuggestedCollegeRows = filteredSuggestedCollegeRows.slice(
    (safeSuggestionPage - 1) * SENIOR_SUGGESTIONS_PER_PAGE,
    safeSuggestionPage * SENIOR_SUGGESTIONS_PER_PAGE,
  );
  const suggestionStartNumber =
    filteredSuggestedCollegeRows.length > 0 ? (safeSuggestionPage - 1) * SENIOR_SUGGESTIONS_PER_PAGE + 1 : 0;
  const suggestionEndNumber = Math.min(safeSuggestionPage * SENIOR_SUGGESTIONS_PER_PAGE, filteredSuggestedCollegeRows.length);
  const suggestionSortLabel =
    suggestionSort === "newest" ? "Newest" : suggestionSort === "oldest" ? "Oldest" : "Alphabetical";
  const visibleSuggestionPageNumbers = Array.from({ length: suggestionPageCount }, (_, index) => index + 1).filter(
    (pageNumber) => Math.abs(pageNumber - safeSuggestionPage) <= 1,
  );
  const goToSuggestionPage = (pageNumber: number) => {
    setSuggestionPage(Math.max(1, Math.min(pageNumber, suggestionPageCount)));
    window.setTimeout(() => {
      suggestedCollegesSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
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
            

            <section className={`${embedded ? "mt-1" : "mt-5"} overflow-hidden rounded-[10px] border border-[#E6EAF0] bg-white px-3 py-4 shadow-[0_10px_26px_rgba(15,27,37,0.08)] sm:px-7 sm:py-7`}>
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#FFF4CC] text-[#F4B400] shadow-[0_14px_24px_rgba(244,180,0,0.18)] sm:size-12">
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
                          <div className="flex size-7 items-center justify-center rounded-full bg-[#FFF4CC] text-[#F4B400] sm:size-11">
                            <Icon className="size-4 sm:size-6" strokeWidth={2.2} />
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

            <section className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
              <article className="rounded-[12px] border border-[#e1e9f8] bg-white p-4 shadow-[0_18px_48px_rgba(20,42,99,0.09)] sm:p-5">
                <div className="flex items-start gap-4">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#FFF4CC] text-[#F4B400] shadow-[0_14px_24px_rgba(244,180,0,0.18)]">
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
  href={
    selectedCollegeRecord?.id
      ? `/college/${selectedCollegeRecord.id}`
      : "#"
  }
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
                            ? "bg-[#fff1bd] text-[#07133b]"
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

                <div className="mt-5 rounded-[12px] border border-[#e5edf9] bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)] p-5">
                  <div className="flex items-center gap-3">
                    <Building2 className="size-7 text-[#1766f2]" />
                    <h3 className="text-[1.05rem] font-black text-[#09246b]">What does this mean?</h3>
                  </div>

                  <div className="mt-5 grid divide-y divide-[#dbe5f7] md:grid-cols-3 md:divide-x md:divide-y-0">
                    <div className="flex items-center gap-4 py-4 first:pt-0 md:border-r md:border-[#dbe5f7] md:py-0 md:pr-4">
                      <div className={`flex size-14 shrink-0 items-center justify-center rounded-full text-[1.8rem] ${hasPositiveCollegeMatch ? "bg-[#e9fff1]" : "bg-[#fff0f0]"}`}>
                        {hasPositiveCollegeMatch ? "📈" : "📉"}
                      </div>
                      <div>
                        <p className="text-[0.82rem] font-black text-[#09246b]">Score Difference</p>
                        <p className={`mt-1 text-[1.25rem] font-black ${hasPositiveCollegeMatch ? "text-[#058b3d]" : "text-[#d40000]"}`}>
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

                    <div className="flex items-center gap-4 py-4 md:border-r md:border-[#dbe5f7] md:px-4 md:py-0">
                      <div className={`flex size-14 shrink-0 items-center justify-center rounded-full text-[1.8rem] ${hasPositiveCollegeMatch ? "bg-[#e9fff1]" : "bg-[#fff7df]"}`}>
                        {hasPositiveCollegeMatch ? "🎯" : "🧭"}
                      </div>
                      <div>
                        <p className="text-[0.82rem] font-black text-[#09246b]">Improve Chances</p>
                        <p className={`mt-1 text-[1.25rem] font-black ${hasPositiveCollegeMatch ? "text-[#058b3d]" : "text-[#e08700]"}`}>
                          {hasPositiveCollegeMatch ? "Strong" : "Low"} 
                        </p>
                        <p className="mt-1 text-[0.82rem] font-medium text-[#07133b]">
                          {hasPositiveCollegeMatch ? "Good admission chance" : "Consider other options"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 py-4 last:pb-0 md:py-0 md:pl-4">
                      <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-[#e8fff2] text-[1.8rem]">
                        📖
                      </div>
                      <div>
                        <p className="text-[0.82rem] font-black text-[#09246b]">Better Options</p>
                        <p className="mt-1 text-[1.25rem] font-black text-[#058b3d]">
                          Available 🙂
                        </p>
                        <p className="mt-1 text-[0.82rem] font-medium text-[#07133b]">Explore suggested colleges</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-3 rounded-[12px] border border-[#c8dcff] bg-[linear-gradient(90deg,#ffffff_0%,#f4f8ff_100%)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5">
                  <div className="flex min-w-0 items-start gap-3 sm:items-center sm:gap-4">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-[8px] bg-[#1766f2] text-white shadow-[0_12px_22px_rgba(23,102,242,0.2)] sm:size-12 sm:rounded-[10px]">
                      <GraduationCap className="size-5 sm:size-7" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-[20px] font-medium leading-6 text-[#1766f2]">
                        Find better colleges that match your score!
                      </h3>
                      <p className="mt-1 text-[14px] font-light leading-5 text-[#07133b]">
                        Get personalized college suggestions based on your score and preferences.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleArrowScrollToSuggestedColleges}
                    aria-label="Show suggested colleges"
                    className="inline-flex h-10 w-full shrink-0 items-center justify-center gap-2 rounded-[8px] border border-[#bfd9ff] bg-white px-4 text-[14px] font-normal text-[#1766f2] shadow-[0_12px_24px_rgba(23,102,242,0.12)] transition hover:-translate-y-0.5 hover:border-[#1f6fe9] hover:bg-[#f8fbff] sm:h-11 sm:w-11 sm:rounded-full sm:px-0"
                  >
                    <span className="sm:hidden">Show suggested colleges</span>
                    <ChevronDown className="size-5" />
                  </button>
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
                              <stop offset="0%" stopColor="#F4B400" />
                              <stop offset="52%" stopColor="#F4B400" />
                              <stop offset="100%" stopColor="#D99A00" />
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
                            <div className="mt-2.5 h-1 w-12 rounded-full bg-[#F4B400]" />
                          </div>
                        </div>

                        <div className="absolute bottom-[8px] left-0 text-center">
                          <div className="text-[0.96rem] font-black text-[#2563eb]">0</div>
                          <div className="mt-1 text-[0.72rem] font-medium text-[#7384b9]">Minimum</div>
                        </div>
                        <div className="absolute bottom-[24px] left-[50px] h-px w-[42px] border-t-2 border-dashed border-[#cddcff]" />

                        <div className="absolute bottom-[8px] right-0 text-center">
                          <div className="text-[0.96rem] font-black text-[#2563eb]">{resultMaximumCutoff}</div>
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
                      <span className="text-[0.72rem] font-black uppercase tracking-[0.24em] text-[#2563eb]">
                        College Cutoff Range
                      </span>
                      <span className="h-px w-6 bg-[#d7e4ff]" />
                    </div>

                    <div className="mt-4 grid grid-cols-[64px_minmax(0,1fr)_64px] items-center gap-3">
                      <div className="text-left">
                        <div className="text-[1.16rem] font-black tracking-[-0.05em] text-[#2563eb]">
                          {selectedCollegeCutoffMin !== null ? formatResultValue(String(selectedCollegeCutoffMin)) : "-"}
                        </div>
                        <div className="mt-0.5 text-[0.7rem] font-medium leading-4 text-[#7583b5]">Low Cutoff</div>
                      </div>

                      <div className="relative px-0.5 py-6">
                        <div className="h-3.5 overflow-hidden rounded-full border border-[#dbe6fb] bg-[repeating-linear-gradient(135deg,#eef3ff_0px,#eef3ff_4px,#f9fbff_4px,#f9fbff_8px)]">
                          {hasCollegeCutoff ? (
                            <div
                              className="absolute top-1/2 h-3.5 -translate-y-1/2 rounded-full bg-[#F4B400] shadow-[0_8px_14px_rgba(244,180,0,0.18)]"
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
                          <div className="rounded-[0.7rem] bg-[#F4B400] px-1.5 py-0.5 text-[0.58rem] font-black leading-none text-[#0F1B25] shadow-[0_10px_18px_rgba(244,180,0,0.2)]">
                            {enteredScoreLabel}
                          </div>
                          <div className="-mt-0.5 h-2 w-2 rotate-45 bg-[#F4B400]" />
                        </div>

                        <div
                          className="absolute top-1/2 flex size-4 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-[#F4B400] bg-white shadow-[0_8px_16px_rgba(244,180,0,0.14)]"
                          style={{ left: `${rangeBarMarkerPercent}%` }}
                        >
                          <span className="size-1.5 rounded-full bg-[#F4B400]" />
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
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#F4B400] text-white shadow-[0_12px_24px_rgba(244,180,0,0.24)]">
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
{/* 
            <section className="mt-5 flex flex-col gap-4 rounded-[12px] border border-[#bfe9d0] bg-[linear-gradient(90deg,#f0fff6_0%,#ffffff_100%)] px-5 py-4 shadow-[0_12px_32px_rgba(5,139,61,0.08)] sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-[#dff8e9] text-[2rem]">🎓</div>
                <div>
                  <h3 className="text-[1.12rem] font-black text-[#058b3d]">Stay Positive! 😍</h3>
                  <p className="mt-2 text-[0.95rem] font-medium text-[#07133b]">
                    Many great opportunities are waiting for you. The right college is just a step away!
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSuggestedColleges(true)}
                className="inline-flex h-11 items-center justify-center rounded-full border border-[#058b3d] px-6 text-[0.9rem] font-black text-[#058b3d] transition hover:bg-[#e9fff1]"
              >
                ♡ Keep Exploring
              </button>
            </section> */}
            <section
              ref={whatsNextSectionRef}
              className="relative mt-8 scroll-mt-6 overflow-hidden rounded-[14px] border border-[#E1E6EE] bg-white px-4 py-5 shadow-[0_16px_40px_rgba(15,27,37,0.04)] sm:scroll-mt-8 sm:px-8 sm:py-7 lg:mt-10 lg:px-[52px] lg:pb-10 lg:pt-11"
            >
              <div className="pointer-events-none absolute right-0 top-0 hidden h-[340px] w-[34%] rounded-bl-[60%] bg-[#F7F9FC] lg:block" />

              <div className="relative z-10 flex flex-col gap-5 sm:gap-8">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-[800px]">
                    <h1 className="text-[32px] font-medium leading-[1.12] text-[#071A44] sm:text-[44px] lg:text-[50px]">
                      What’s next after your <span className="text-[#F4B400]">cutoff?</span>
                    </h1>
                    <p className="mt-3 text-[14px] font-light leading-6 text-[#536079] sm:mt-5 sm:text-[18px] sm:leading-8">
                      Based on your score, <span className="font-semibold text-[#38445C]">WhatsNext</span> can guide you to the best-fit colleges and counseling advice.
                    </p>
                  </div>
                  <button
                    ref={suggestedCollegesButtonRef}
                    type="button"
                    onClick={handleSuggestCollegesAction}
                    className="inline-flex h-14 w-full max-w-[316px] items-center justify-center gap-3 rounded-full !bg-[#071A44] px-4 text-[14px] font-bold text-white shadow-[0_14px_28px_rgba(7,26,68,0.20)] transition hover:-translate-y-0.5 hover:!bg-[#020B2D] hover:shadow-[0_20px_38px_rgba(2,11,45,0.32)] sm:h-16 sm:w-auto sm:max-w-none sm:min-w-[330px] sm:gap-4 sm:px-8 sm:text-[16px] lg:mt-4 lg:shrink-0"
                  >
                    <Building2 className="size-6 shrink-0 text-[#F4B400] sm:size-7" strokeWidth={3} />
                    <span className="whitespace-nowrap !text-white">Show Suggested Colleges</span>
                    <ChevronDown className="size-4 shrink-0 -rotate-90 !text-[#F4B400] sm:size-5" strokeWidth={3} />
                  </button>
                </div>

                <div className="grid gap-3 sm:gap-5 lg:grid-cols-3 lg:gap-6">
                  {[
                    {
                      title: "Best-Fit College Matches",
                      icon: GraduationCap,
                      text: "Explore colleges that align with your cutoff score and personal preferences. Identify ambitious, safe, and best-fit college options to create a smarter and more effective shortlist for admissions.",
                    },
                    {
                      title: "Course and Eligibility Guidance",
                      icon: Bell,
                      text: "Understand the admission pathway for your preferred course, including expected cutoff ranges, eligibility criteria, and admission requirements. This helps students plan their next steps with less confusion and better clarity.",
                    },
                    {
                      title: "Smarter Shortlist Support",
                      icon: Star,
                      text: "Use cutoff trends, category-based insights, and college-fit analysis to build a practical and reliable shortlist. Compare multiple college options and make a more informed final admission decision.",
                    },
                  ].map((item) => {
                    const Icon = item.icon;

                    return (
                      <article
                        key={item.title}
                        className="rounded-[12px] border border-[#DDE2E7] bg-white px-4 py-4 shadow-[0_18px_34px_rgba(15,27,37,0.04)] sm:rounded-[16px] sm:px-7 sm:py-7 lg:min-h-[310px]"
                      >
                        <div className="flex items-center gap-3 sm:items-start sm:gap-5">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#FFF7DF] text-[#F4B400] sm:size-16">
                            <Icon className="size-5 sm:size-8" strokeWidth={2.7} />
                          </div>
                          <div className="min-w-0">
                            <h2 className="text-[18px] font-medium leading-[1.3] text-[#071A44] sm:pt-2 sm:text-[23px]">{item.title}</h2>
                          </div>
                        </div>
                        <p className="mt-3 text-[14px] font-light leading-6 text-[#536079] sm:mt-7 sm:text-[17px] sm:leading-8">{item.text}</p>
                      </article>
                    );
                  })}
                </div>

                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <p className="text-[14px] font-light leading-6 text-[#536079] sm:text-[18px]">
                    Let <span className="font-semibold text-[#F4B400]">WhatsNext</span> guide your journey to success.
                  </p>
                </div>
              </div>
            </section>

            {showSuggestedColleges ? (
  <section
    ref={suggestedCollegesSectionRef}
    className="mt-8 overflow-hidden rounded-[18px] border border-[#E6E6E6] bg-white px-4 py-6 shadow-[0_16px_36px_rgba(15,27,37,0.08)] sm:px-6 sm:py-7"
  >
    <div className="flex items-start gap-5">
      <div className="flex size-12 shrink-0 items-center justify-center rounded-[10px] text-[#F4B400]">
        <Building2 className="size-10" />
      </div>

      <div>
        <h1 className="font-[family:Gambarino] text-[24px] font-semibold leading-tight text-[#0F1B25] sm:text-[35.2px]">
          Suggested Colleges for <span className="font-[family:Outfit] text-[22px] italic font-semibold text-[#F4B400] sm:text-[31.2px]">You</span>
        </h1>

        <p className="mt-3 text-[16px] font-normal text-[#5F6B76]">
          Colleges suggested based on your score and preferences.
        </p>
      </div>
    </div>

    <div className="mt-7 border-t border-[#E6E6E6] pt-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <p className="text-[16px] font-light text-[#0F1B25]">
          Showing <span className="font-semibold">{suggestionStartNumber}-{suggestionEndNumber}</span> of{" "}
          <span className="font-semibold">{filteredSuggestedCollegeRows.length}</span> colleges
        </p>

        <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:w-auto lg:grid-cols-[220px_216px] lg:items-center">
          <div className="relative min-w-0">
            <button
              type="button"
              onClick={() => setIsSuggestionSortOpen((current) => !current)}
              className="cutoff-sort-trigger flex h-14 w-full items-center justify-between rounded-[8px] border border-[#D8DEE8] bg-white px-6 text-[16px] font-normal text-[#0F1B25] transition hover:border-[#F4B400]"
            >
              {suggestionSortLabel}
              <ChevronDown className={`size-5 text-[#52618A] transition ${isSuggestionSortOpen ? "rotate-180" : ""}`} />
            </button>
            {isSuggestionSortOpen ? (
              <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 overflow-hidden rounded-[8px] border border-[#D8DEE8] bg-white shadow-[0_18px_34px_rgba(15,27,37,0.12)]">
                {[
                  { value: "alphabetical", label: "Alphabetical" },
                  { value: "newest", label: "Newest" },
                  { value: "oldest", label: "Oldest" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setSuggestionSort(option.value as SuggestedCollegeSort);
                      setSuggestionPage(1);
                      setIsSuggestionSortOpen(false);
                    }}
                    className="cutoff-sort-option flex w-full items-center justify-between px-5 py-3 text-left text-[14px] font-normal text-[#0F1B25] transition hover:bg-[#F8F9FB]"
                  >
                    {option.label}
                    {suggestionSort === option.value ? <Check className="size-4 text-[#52618A]" /> : null}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="grid h-14 grid-cols-2 overflow-hidden rounded-[8px] border border-[#D8DEE8] bg-white">
            <button
              type="button"
              onClick={() => {
                setSuggestionView("grid");
                setSuggestionPage(1);
              }}
              className={`inline-flex items-center justify-center gap-2 text-[16px] font-normal transition ${
                suggestionView === "grid" ? "cutoff-view-toggle-active" : "cutoff-view-toggle"
              }`}
            >
              <LayoutGrid className="size-5" />
              Grid
            </button>
            <button
              type="button"
              onClick={() => {
                setSuggestionView("list");
                setSuggestionPage(1);
              }}
              className={`inline-flex items-center justify-center gap-2 text-[16px] font-normal transition ${
                suggestionView === "list" ? "cutoff-view-toggle-active" : "cutoff-view-toggle"
              }`}
            >
              <List className="size-5" />
              List
            </button>
          </div>
        </div>
      </div>

      {visibleSuggestedCollegeRows.length ? (
        <div className={suggestionView === "grid" ? "mt-8 grid gap-6 lg:grid-cols-3" : "mt-8 grid gap-4"}>
          {visibleSuggestedCollegeRows.map((college, index) => {
            const absoluteIndex = (safeSuggestionPage - 1) * SENIOR_SUGGESTIONS_PER_PAGE + index;
            const cardTheme =
              absoluteIndex % 3 === 0
                ? {
                    band: "radial-gradient(circle at 20% 0%, rgba(255,255,255,0.24), transparent 32%), linear-gradient(135deg, #5BBDA7, #168A7C)",
                    label: "Best Match",
                    labelIcon: <Trophy className="size-4 fill-[#F4B400]/30" />,
                    pill: "border-[#F4B400] bg-[#FFF4CC] text-[#D99A00]",
                    metric: "text-[#008C46]",
                    cta: "bg-[#FFF8E5] text-[#D99A00]",
                  }
                : absoluteIndex % 3 === 1
                  ? {
                      band: "radial-gradient(circle at 30% 0%, rgba(255,255,255,0.25), transparent 35%), linear-gradient(135deg, #7182F4, #C4B5FD)",
                      label: "High Match",
                      labelIcon: <Check className="size-4" />,
                      pill: "border-[#CDEFD8] bg-[#ECFFF2] text-[#008C46]",
                      metric: "text-[#008C46]",
                      cta: "bg-[#ECFFF2] text-[#008C46]",
                    }
                  : {
                      band: "radial-gradient(circle at 20% 0%, rgba(255,255,255,0.34), transparent 32%), linear-gradient(135deg, #FF6F61, #FFD0A3)",
                      label: "Top Match",
                      labelIcon: <Trophy className="size-4 fill-[#D99A00]/30" />,
                      pill: "border-[#F4B400] bg-[#FFF4CC] text-[#D99A00]",
                      metric: "text-[#D94E00]",
                      cta: "bg-[#FFF8E5] text-[#D99A00]",
                    };
            const rankingLabel = college.ranking || "-";
            const establishedLabel = college.establishedYear || "Est. --";
            const locationLabel = college.location || selectedState || "Tamil Nadu";

            if (suggestionView === "list") {
              return (
                <Link
                  key={`${college.id}-${index}`}
                  href={college.href}
                  onClick={rememberCollegeReturnRoute}
                  className="group grid min-h-[108px] grid-cols-[56px_minmax(0,1fr)] items-center gap-x-3 gap-y-4 rounded-[18px] border border-[#E6E6E6] bg-white px-3 py-4 shadow-[0_8px_18px_rgba(15,27,37,0.04)] transition hover:border-[#F4B400] hover:shadow-[0_14px_26px_rgba(15,27,37,0.08)] sm:grid-cols-[72px_minmax(0,1fr)_92px_86px_86px_32px] sm:gap-5 sm:px-5"
                >
                  <div className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#D8DEE8] bg-white text-[#174b7a] shadow-[0_8px_18px_rgba(15,27,37,0.06)] sm:size-[68px]">
                    {college.logo ? (
                      <Image src={college.logo} alt={`${college.name} logo`} fill sizes="68px" className="object-contain p-2" />
                    ) : (
                      <Building2 className="size-7" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="line-clamp-2 text-[20px] font-medium leading-[1.3] text-[#0F1B25] sm:truncate">
                      {college.name}
                    </div>
                    <div className="mt-2 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[16px] font-light text-[#5F6B76] sm:flex-nowrap">
                      <span className="truncate">{college.ownershipType}</span>
                      <span aria-hidden="true">.</span>
                      <span className="truncate">{locationLabel}</span>
                    </div>
                  </div>
                  <div className="col-span-2 grid min-w-0 grid-cols-3 gap-2 sm:contents">
                    <div className="min-w-0 rounded-[10px] bg-[#F8F9FB] px-1.5 py-2 text-center sm:bg-transparent sm:p-0">
                      <div className="text-[14px] font-light text-[#8A949F]">Cut Off</div>
                      <div className={`mt-1 whitespace-nowrap text-[clamp(0.72rem,3vw,1rem)] font-light sm:text-[16px] ${cardTheme.metric}`}>
                        {college.cutoffLabel || "-"}
                      </div>
                    </div>
                    <div className="min-w-0 rounded-[10px] bg-[#F8F9FB] px-1.5 py-2 text-center sm:bg-transparent sm:p-0">
                      <div className="text-[14px] font-light text-[#8A949F]">Est.</div>
                      <div className="mt-1 text-[16px] font-light text-[#0F1B25]">{establishedLabel}</div>
                    </div>
                    <div className="min-w-0 rounded-[10px] bg-[#F8F9FB] px-1.5 py-2 text-center sm:bg-transparent sm:p-0">
                      <div className="text-[14px] font-light text-[#8A949F]">Ranking</div>
                      <div className="mt-1 text-[16px] font-light leading-5 text-[#0F1B25]">{rankingLabel}</div>
                    </div>
                  </div>
                  <ArrowRight className="hidden size-5 text-[#B8C0C8] transition group-hover:translate-x-1 group-hover:text-[#D99A00] sm:block" />
                </Link>
              );
            }

            return (
              <Link
                key={`${college.id}-${index}`}
                href={college.href}
                onClick={rememberCollegeReturnRoute}
                className="group overflow-hidden rounded-[14px] border border-[#E6E6E6] bg-white shadow-[0_18px_34px_rgba(15,27,37,0.08)] transition hover:-translate-y-1 hover:shadow-[0_24px_44px_rgba(15,27,37,0.12)]"
              >
                <div
                  className="relative min-h-[176px] overflow-hidden p-5 text-white"
                  style={{ backgroundImage: cardTheme.band }}
                >
                  <span className={`inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-[14px] font-light ${cardTheme.pill}`}>
                    {cardTheme.labelIcon}
                    {cardTheme.label}
                  </span>
                  <span className="absolute right-5 top-5 flex size-10 items-center justify-center rounded-[10px] bg-white text-[#0F1B25] shadow-[0_10px_18px_rgba(15,27,37,0.16)]">
                    <BookOpen className="size-5" />
                  </span>
                  <div className="mt-9 flex items-center gap-4">
                    <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white/70 bg-white text-[#174b7a] shadow-[0_12px_20px_rgba(15,27,37,0.16)]">
                      {college.logo ? (
                        <Image src={college.logo} alt={`${college.name} logo`} fill sizes="64px" className="object-contain p-2.5" />
                      ) : (
                        <Building2 className="size-8" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="line-clamp-2 text-[18px] font-medium leading-[1.28] text-white">
                        {college.name}
                      </div>
                      <div className="mt-2 flex min-w-0 items-center gap-2 text-[14px] font-light text-white/95">
                        <MapPin className="size-4 shrink-0" />
                        <span className="truncate">{locationLabel}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3.5">
                  <div className="grid grid-cols-2 overflow-hidden rounded-[10px] bg-[#F8F9FB]">
                    <div className="border-r border-[#DDE2E7] px-3 py-2.5 text-center">
                      <div className="text-[14px] font-light uppercase text-[#354150]">Cut Off</div>
                      <div className={`mt-1 text-[18px] font-medium ${cardTheme.metric}`}>
                        {college.cutoffLabel || "-"}
                      </div>
                    </div>
                    <div className="px-3 py-2.5 text-center">
                      <div className="text-[14px] font-light uppercase text-[#354150]">Ranking</div>
                      <div className="mt-1 text-[18px] font-medium text-[#0F1B25]">
                        {rankingLabel}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-[14px] font-light leading-5 text-[#0F1B25]">
                    <span className="inline-flex min-w-0 items-center gap-2">
                      <GraduationCap className="size-4 shrink-0" />
                      <span>{college.ownershipType}</span>
                    </span>
                    <span className="text-[#8A949F]">.</span>
                    <span>{college.accreditation}</span>
                    <span className="text-[#8A949F]">.</span>
                    <span className="inline-flex min-w-0 items-center gap-2">
                      <CalendarDays className="size-4 shrink-0" />
                      <span>{establishedLabel}</span>
                    </span>
                  </div>

                  <div className={`mt-4 inline-flex h-10 w-full items-center justify-center gap-3 rounded-[10px] text-[14px] font-normal transition group-hover:brightness-95 ${cardTheme.cta}`}>
                    View College Details
                    <ArrowRight className="size-5 transition group-hover:translate-x-0.5" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="mt-8 rounded-[12px] border border-[#D8DEE8] bg-[#F8F9FB] px-4 py-8 text-center text-[14px] font-light text-[#5F6B76]">
          Suggested colleges are not available for this selection yet.
        </div>
      )}

      {suggestionPageCount > 1 ? (
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {safeSuggestionPage > 1 ? (
            <button
              type="button"
              onClick={() => goToSuggestionPage(safeSuggestionPage - 1)}
              className="inline-flex h-10 items-center justify-center rounded-[10px] px-3 text-[15px] font-normal text-[#008C46] transition hover:bg-[#FFF4CC]"
            >
              Prev
            </button>
          ) : null}
          {visibleSuggestionPageNumbers.map((pageNumber) => {
            const isCurrentPage = safeSuggestionPage === pageNumber;
            return (
              <button
                key={pageNumber}
                type="button"
                onClick={() => goToSuggestionPage(pageNumber)}
                className={`inline-flex size-10 items-center justify-center rounded-[10px] text-[15px] font-normal transition ${
                  isCurrentPage
                    ? "bg-[#F4B400] text-[#0F1B25] shadow-[0_8px_16px_rgba(244,180,0,0.24)]"
                    : "bg-white text-[#008C46] hover:bg-[#FFF4CC]"
                }`}
                aria-current={isCurrentPage ? "page" : undefined}
              >
                {pageNumber}
              </button>
            );
          })}
          {safeSuggestionPage < suggestionPageCount ? (
            <button
              type="button"
              onClick={() => goToSuggestionPage(safeSuggestionPage + 1)}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-[10px] px-3 text-[15px] font-normal text-[#008C46] transition hover:bg-[#FFF4CC]"
            >
              Next
              <ArrowRight className="size-4" />
            </button>
          ) : null}
        </div>
      ) : null}
    </div>

    <p className="mt-6 flex items-center justify-center gap-2 text-[16px] font-normal text-[#5F6B76]">
      <CircleAlert className="size-5 text-[#F4B400]" />
      Cutoff ranges may vary each year. Please verify with official college sources.
    </p>
  </section>
) : null}
          </div>
        </main>
      </>
    );
  }

  return null;
}

function JuniorPerformanceBars({
  standards,
  subjects,
}: {
  standards: Array<{ id: string; label: string; marks: SubjectMarks }>;
  subjects: SubjectMeta[];
}) {
  const chartHeight = 140;
  const ticks = [100, 75, 50, 25, 0];

  return (
    <div className="mt-4">
      <div className="grid grid-cols-[28px_minmax(0,1fr)] gap-3">
        <div className="relative h-[190px]">
          {ticks.map((tick, index) => (
            <div
              key={tick}
              className="absolute left-0 -translate-y-1/2 text-[10px] font-semibold text-slate-400"
              style={{ top: `${(index / (ticks.length - 1)) * 100}%` }}
            >
              {tick}
            </div>
          ))}
        </div>

        <div className="relative h-[190px]">
          {ticks.map((tick, index) => (
            <div
              key={tick}
              className="absolute left-0 right-0 border-t border-[#ebf0fb]"
              style={{ top: `${(index / (ticks.length - 1)) * 100}%` }}
            />
          ))}

          <div className="relative flex h-full items-end justify-around gap-4 px-2 pb-8">
            {standards.map((standard) => (
              <div key={standard.id} className="flex flex-1 items-end justify-center gap-2">
                {subjects.map((subject) => {
                  const value = standard.marks[subject.key];
                  const barHeight = Math.max(6, (value / 100) * chartHeight);

                  return (
                    <div key={`${standard.id}-${subject.key}`} className="flex flex-col items-center justify-end gap-1">
                      <span className="text-[10px] font-bold text-slate-600">{value}</span>
                      <div
                        className="w-4 rounded-t-[8px] sm:w-5"
                        style={{
                          height: `${barHeight}px`,
                          background: subject.stroke,
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="mt-2 grid gap-2 text-center" style={{ gridTemplateColumns: `repeat(${standards.length}, minmax(0, 1fr))` }}>
            {standards.map((standard) => (
              <div key={standard.id} className="text-[11px] font-semibold text-slate-600">
                {standard.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function JuniorImprovementLines({
  standards,
  subjects,
}: {
  standards: Array<{ id: string; label: string; marks: SubjectMarks }>;
  subjects: SubjectMeta[];
}) {
  const ticks = [100, 75, 50, 25, 0];

  return (
    <div className="mt-4">
      <div className="grid grid-cols-[30px_minmax(0,1fr)] gap-3">
        <div className="relative h-[190px]">
          {ticks.map((tick, index) => (
            <div
              key={tick}
              className="absolute left-0 -translate-y-1/2 text-[10px] font-semibold text-slate-400"
              style={{ top: `${(index / (ticks.length - 1)) * 100}%` }}
            >
              {tick}
            </div>
          ))}
        </div>

        <div className="relative h-[190px]">
          {ticks.map((tick, index) => (
            <div
              key={tick}
              className="absolute left-0 right-0 border-t border-[#ebf0fb]"
              style={{ top: `${(index / (ticks.length - 1)) * 100}%` }}
            />
          ))}

          <svg viewBox="0 0 220 160" className="relative h-[160px] w-full overflow-visible">
            {subjects.map((subject) => {
              const values = standards.map((standard) => standard.marks[subject.key]);
              const path = linePathForSeries(values, 220, 160);

              return (
                <g key={subject.key}>
                  <path
                    d={path}
                    fill="none"
                    stroke={subject.stroke}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {values.map((value, index) => {
                    const x = values.length === 1 ? 0 : (220 / (values.length - 1)) * index;
                    const y = 160 - (value / 100) * 160;

                    return (
                      <circle
                        key={`${subject.key}-${standards[index].id}`}
                        cx={x}
                        cy={y}
                        r="4"
                        fill={subject.stroke}
                        stroke="#ffffff"
                        strokeWidth="2"
                      />
                    );
                  })}
                </g>
              );
            })}
          </svg>

          <div className="mt-2 grid gap-2 text-center" style={{ gridTemplateColumns: `repeat(${standards.length}, minmax(0, 1fr))` }}>
            {standards.map((standard) => (
              <div key={standard.id} className="text-[11px] font-semibold text-slate-600">
                {standard.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
