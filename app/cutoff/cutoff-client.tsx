"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Bell,
  BookOpen,
  BrainCircuit,
  Building2,
  ChevronDown,
  CheckCircle2,
  CircleAlert,
  FileText,
  FlaskConical,
  GraduationCap,
  LineChart,
  MapPin,
  Medal,
  Microscope,
  PenTool,
  ShieldCheck,
  Sparkles,
  Sprout,
  Star,
  Target,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { parseCutoffValue } from "@/lib/cutoff-utils";
import { parseRankingRange } from "@/lib/ranking-utils";
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
  href: string;
  cutoffLabel: string;
  matchScore: number;
  isBestCollege: boolean;
  ranking: string;
  rankingStart: number | null;
  tierId: TierBucket["id"];
  targetScore: number | null;
};

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
  if (!parsed) return String(value || "-");
  return parsed.start === parsed.end ? `${parsed.start}` : `${parsed.start} - ${parsed.end}`;
};

const buildCutoffRangeLabel = (minCutoff: number | null, maxCutoff: number | null) => {
  if (minCutoff === null && maxCutoff === null) return "Cutoff unavailable";
  if (minCutoff === null) return `${maxCutoff}`;
  if (maxCutoff === null) return `${minCutoff}`;
  return minCutoff === maxCutoff ? `${minCutoff}` : `${minCutoff} - ${maxCutoff}`;
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
  const categoryCutoff =
    Array.isArray(exam.cutoffByCategory) && categoryKey
      ? exam.cutoffByCategory.find(
          (item) => normalizeCategoryKey(String(item.category || "")) === categoryKey,
        )?.cutoff || ""
      : "";
  return String(categoryCutoff || exam.cutoffScoreOrRank || "").trim();
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
  if (!parsed) return false;
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
  if (!parsed) return { status: "unavailable", distance: null };

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
  const router = useRouter();
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
  const [showSuggestedColleges, setShowSuggestedColleges] = useState(false);
  const juniorAnalysisRef = useRef<HTMLElement | null>(null);
  const whatsNextSectionRef = useRef<HTMLElement | null>(null);
  const suggestedCollegesButtonRef = useRef<HTMLButtonElement | null>(null);
  const suggestedCollegesSectionRef = useRef<HTMLElement | null>(null);

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
        const rawCollegeKey = normalizeText(String(detail.college || ""));
        const college = colleges.find(
          (item) =>
            normalizeText(item.id) === rawCollegeKey ||
            normalizeText(item.name) === rawCollegeKey ||
            normalizeText(item.university) === rawCollegeKey,
        );

        if (!college || !collegeTypeMatches(college, selectedCollegeType)) return;

        const categoryCutoffEntry =
          hasExamBasedCutoffFlow
            ? undefined
            : (detail.cutoffByCategory || course.cutoffByCategory || []).find(
                (item) => normalizeCategoryKey(item.category) === categoryKey,
              );
        const categoryCutoff = categoryCutoffEntry?.cutoff || "";

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
          href: `/college/${college.id}`,
          cutoffLabel: formatCutoffLabel(rawCutoff),
          matchScore,
          isBestCollege: Boolean(college.isBestCollege || college.isTopCollege),
          ranking,
          rankingStart,
          tierId: getTierIdForRanking(ranking),
          targetScore: Number.isFinite(targetRaw) && targetRaw > 0 ? targetRaw : null,
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
        const rawCollegeKey = normalizeText(String(detail.college || ""));
        const college = colleges.find(
          (item) =>
            normalizeText(item.id) === rawCollegeKey ||
            normalizeText(item.name) === rawCollegeKey ||
            normalizeText(item.university) === rawCollegeKey,
        );

        if (!college || !collegeTypeMatches(college, selectedCollegeType)) return;

        const rawCutoff = detail.cutoffText || course.cutoffText || detail.cutoff || course.cutoff;
        const parsed = parseCutoffValue(String(rawCutoff || ""));
        if (!parsed) return;

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
          href: `/college/${college.id}`,
          cutoffLabel: buildCutoffRangeLabel(minCutoff, maxCutoff),
          matchScore: Math.max(38, Math.min(98, Math.round(100 - Math.max(0, scaledTarget - predictorPercentage) * 1.6))),
          isBestCollege: Boolean(college.isBestCollege || college.isTopCollege),
          ranking: String(college.ranking || ""),
          rankingStart: getRankingStartValue(String(college.ranking || "")),
          tierId: getTierIdForRanking(String(college.ranking || "")),
          targetScore: targetScore && Number.isFinite(targetScore) ? targetScore : null,
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
        href: `/college/${college.id}`,
        cutoffLabel: "Cutoff unavailable",
        matchScore: 55,
        isBestCollege: Boolean(college.isBestCollege || college.isTopCollege),
        ranking: String(college.ranking || ""),
        rankingStart: getRankingStartValue(String(college.ranking || "")),
        tierId: getTierIdForRanking(String(college.ranking || "")),
        targetScore: null,
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

  const selectedCollegeRecord = colleges.find(
    (college) =>
      normalizeText(college.id) === normalizeText(selectedDreamCollege) ||
      normalizeText(college.name) === normalizeText(selectedDreamCollege),
  );
  
  const dreamCollegeName = selectedCollegeRecord?.name || selectedDreamCollege || "-";
  const selectedCollegeLookupKeys = [
    selectedDreamCollege,
    selectedCollegeRecord?.id,
    selectedCollegeRecord?.name,
    selectedCollegeRecord?.university,
    dreamCollegeName,
  ]
    .map((value) => normalizeText(String(value || "")))
    .filter(Boolean);
  const matchesSelectedCollegeKey = (value: string) => {
    const normalized = normalizeText(value);
    if (!normalized) return false;
    return selectedCollegeLookupKeys.some(
      (key) => key === normalized || key.includes(normalized) || normalized.includes(key),
    );
  };
  const resultMaximumCutoff =
    selectedDegree === "Law" && selectedAdmissionType === "CLAT"
      ? 120
      : getCutoffScale(selectedDegree, selectedAdmissionType);
  const enteredScoreLabel = formatResultValue(enteredCutoff);
  const resultDetailRows = [
    [
      { label: "Maximum Cutoff", value: String(resultMaximumCutoff) },
      { label: "Cutoff", value: enteredScoreLabel },
    ],
    [
      { label: "Admission Type", value: selectedAdmissionType || "-" },
      { label: "Degree", value: selectedDegree || "-" },
    ],
    [
      { label: "Category", value: categoryDisplayLabel(selectedCategory) },
      { label: "Name", value: safeStudentName },
    ],
    [
      { label: "Phone", value: submittedDetails.phone || "-" },
      { label: "Dream College", value: dreamCollegeName },
    ],
    [
      { label: "Course", value: selectedCourse || "-" },
      { label: "State", value: selectedState || "Tamil Nadu" },
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
      const collegeKey = normalizeText(String(detail.college || ""));
      return matchesSelectedCollegeKey(collegeKey);
    });
  });
  const selectedCourseDetails =
    selectedCourseForCollege && Array.isArray(selectedCourseForCollege.collegeDetails)
      ? selectedCourseForCollege.collegeDetails.find((detail) => {
          const collegeKey = String(detail.college || "");
          return matchesSelectedCollegeKey(collegeKey);
        })
      : undefined;
  const selectedCategoryCutoff = (
    selectedCourseDetails?.cutoffByCategory ||
    selectedCourseForCollege?.cutoffByCategory ||
    []
  ).find((item) => normalizeCategoryKey(item.category) === normalizeCategoryKey(selectedCategory))?.cutoff;
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
  const selectedCollegeCutoffScore =
    parsedSelectedCollegeCutoff
      ? Math.max(parsedSelectedCollegeCutoff.start, parsedSelectedCollegeCutoff.end)
      : selectedCollegeMatchCard?.targetScore ?? null;
  const selectedCollegeCutoffMin =
    parsedSelectedCollegeCutoff
      ? Math.min(parsedSelectedCollegeCutoff.start, parsedSelectedCollegeCutoff.end)
      : selectedCollegeCutoffScore;
  const selectedCollegeCutoffMax =
    parsedSelectedCollegeCutoff
      ? Math.max(parsedSelectedCollegeCutoff.start, parsedSelectedCollegeCutoff.end)
      : selectedCollegeCutoffScore;
  const selectedCollegeCutoffLabel =
    parsedSelectedCollegeCutoff
      ? formatCutoffLabel(rawSelectedCollegeCutoff)
      : selectedCollegeMatchCard?.cutoffLabel || "Unavailable";
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
  const selectedMatchLabel = hasHighMatch ? "High Match" : "Not Matched";
  const selectedMatchMessage = hasHighMatch
    ? "Great! Your cutoff matches the college cutoff range. You have a good chance of getting admission."
    : isAboveCollegeCutoff
      ? "Your cutoff is above the college cutoff range. This is a positive sign for admission chances."
      : "Your cutoff is below this selected college cutoff range.";
  const selectedMatchHelpText = hasHighMatch
    ? "Keep this college in your main shortlist and continue comparing similar options."
    : isAboveCollegeCutoff
      ? "You are above the required cutoff mark. Keep this college in your shortlist and review course demand before applying."
      : "Don’t worry! Click “Suggest Colleges for Me” to explore better options that match your score.";
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
  const suggestedCollegeRows = matchingColleges
    .filter((college) => !matchesSelectedCollegeKey(college.id) && !matchesSelectedCollegeKey(college.name))
    .slice(0, 5);

  if (isJuniorLevel) {
    return null;
  }

  if (!isJuniorLevel) {
    return (
      <>
        {!embedded ? <Navbar /> : null}
        <main className="cutoff-result-theme min-h-screen bg-[#FFFFFF] px-4 py-4 text-[#0F1B25] sm:px-6">
          <div className="mx-auto w-full max-w-[1180px]">
            

            <section className="mt-5 overflow-hidden rounded-[10px] border border-[#edf0f5] bg-white shadow-[0_12px_28px_rgba(15,23,42,0.08)]">
              <div className="flex items-center gap-4 px-6 pt-5">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#1766f2] text-white shadow-[0_12px_22px_rgba(23,102,242,0.25)] ring-4 ring-[#e7efff]">
                  <CheckCircle2 className="size-7" strokeWidth={2.7} />
                </div>
                <h2 className="text-[1.9rem] font-black leading-tight tracking-[-0.04em] text-[#09246b] sm:text-[2.15rem]">
                  Your Cutoff Result
                </h2>
              </div>
              <div className="mt-4">
                {resultDetailRows.map((row, rowIndex) => (
                  <div
                    key={row.map((item) => item.label).join("-")}
                    className={`grid gap-5 px-6 py-5 sm:grid-cols-2 ${
                      rowIndex < resultDetailRows.length - 1 ? "border-b border-[#e5e7eb]" : ""
                    }`}
                  >
                    {row.map((item) => (
                      <div key={item.label} className="min-w-0">
                        <div className="text-[0.92rem] font-semibold text-[#6b7280]">{item.label}</div>
                        <div className="mt-2 break-words text-[1rem] font-semibold leading-6 text-[#2563EB]">
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
              <article className="rounded-[12px] border border-[#e1e9f8] bg-white p-4 shadow-[0_18px_48px_rgba(20,42,99,0.09)] sm:p-5">
                <div className="flex items-start gap-4">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#1766f2] text-white shadow-[0_12px_22px_rgba(23,102,242,0.25)] ring-4 ring-[#e7efff]">
                    <CheckCircle2 className="size-7" strokeWidth={2.7} />
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
                  <div className="grid grid-cols-3 gap-0 lg:grid-cols-[minmax(0,1.5fr)_0.7fr_0.7fr_0.85fr] lg:items-center">
                   <div className="col-span-3 flex min-w-0 items-center gap-4 p-4 lg:col-span-1">
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
    <h3 className="line-clamp-2 text-[1.08rem] font-black leading-6 text-[#09246b]">
      {dreamCollegeName}
    </h3>

    <p className="mt-2 flex items-center gap-2 text-[0.86rem] font-semibold text-[#1766f2]">
      <MapPin className="size-4 shrink-0" />
      <span className="truncate">
        {selectedCollegeRecord?.city ||
          selectedCollegeRecord?.district ||
          selectedState ||
          "Tamil Nadu"}
      </span>
    </p>

    <p className="mt-3 text-[0.94rem] font-black text-[#1766f2]">
      {selectedCourse || "-"}
    </p>
  </div>
</div>

                    <div className="border-t border-[#dbe5f7] px-2 py-4 lg:border-l lg:border-t-0 lg:pl-5">
                      <p className="text-center text-[0.74rem] font-semibold leading-5 text-[#07133b] sm:text-[0.84rem]">Your Cutoff<br />(Score)</p>
                      <p className="mt-3 text-center text-[1.55rem] font-black text-[#1766f2] sm:text-[1.7rem]">
                        {enteredScoreLabel} <span className="text-[1.35rem]"></span>
                      </p>
                    </div>

                    <div className="border-l border-t border-[#dbe5f7] px-2 py-4 lg:pl-5">
                      <p className="text-center text-[0.74rem] font-semibold leading-5 text-[#07133b] sm:text-[0.84rem]">Target College<br />Cutoff (Score)</p>
                      <p className="mt-3 whitespace-nowrap text-center text-[1.15rem] font-black text-[#1766f2] sm:text-[1.25rem]">
                        {selectedCollegeCutoffLabel} <span className="text-[1.35rem]"></span>
                      </p>
                    </div>

                    <div className="border-l border-t border-[#dbe5f7] px-2 py-4 lg:pl-5">
                      <p className="text-center text-[0.74rem] font-semibold text-[#07133b] sm:text-[0.84rem]">Match Status</p>
                      <span
                        className={`mx-auto mt-4 inline-flex items-center gap-1.5 rounded-[18px] px-3 py-2 text-[0.74rem] font-black sm:gap-2 sm:px-4 sm:text-[0.82rem] ${
                          hasPositiveCollegeMatch
                            ? "bg-[#e9fff1] text-[#058b3d]"
                            : "bg-[#fff0f0] text-[#d40000]"
                        }`}
                      >
                        <span className="text-[1.25rem]">{selectedMatchBadgeEmoji}</span>
                        {selectedMatchLabel}
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className={`mt-5 flex items-center justify-between gap-3 rounded-[12px] border px-4 py-4 sm:gap-4 sm:px-5 ${
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
                        {selectedMatchHelpText}
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
                              : "Below college cutoff"}
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

                <div className="mt-5 flex flex-col gap-4 rounded-[12px] border border-[#c8dcff] bg-[linear-gradient(90deg,#ffffff_0%,#f4f8ff_100%)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-[10px] bg-[#1766f2] text-white shadow-[0_12px_22px_rgba(23,102,242,0.2)]">
                      <GraduationCap className="size-7" />
                    </div>
                    <div>
                      <h3 className="text-[1.02rem] font-black text-[#1766f2]">
                        Find better colleges that match your score!
                      </h3>
                      <p className="mt-1 text-[0.9rem] font-medium text-[#07133b]">
                        Get personalized college suggestions based on your score and preferences.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleArrowScrollToSuggestedColleges}
                    aria-label="Show suggested colleges"
                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#bfd9ff] bg-white text-[#1766f2] shadow-[0_12px_24px_rgba(23,102,242,0.12)] transition hover:-translate-y-0.5 hover:border-[#1f6fe9] hover:bg-[#f8fbff]"
                  >
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
                          {selectedMatchHelpText}
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
              className="relative mt-10 scroll-mt-6 overflow-hidden rounded-[24px] border border-[#d7e7ff] bg-[linear-gradient(135deg,#ffffff_0%,#f7fbff_45%,#eef6ff_100%)] px-5 py-6 shadow-[0_18px_46px_rgba(20,42,99,0.09)] sm:scroll-mt-8 sm:px-7 lg:px-8"
            >
              <div className="pointer-events-none absolute -right-14 -top-16 h-[22rem] w-[22rem] rounded-full border border-[#d8e8ff] bg-[linear-gradient(135deg,rgba(255,255,255,0.1),rgba(219,235,255,0.7))]" />
              <div className="pointer-events-none absolute -bottom-28 left-[-8%] h-52 w-[58%] rounded-[50%] bg-[#eaf3ff]" />
              <div className="pointer-events-none absolute -bottom-24 right-[24%] h-44 w-[44%] rounded-[50%] bg-white/80" />

              <div className="relative z-10">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <h1 className="text-[1.65rem] font-black leading-tight tracking-[-0.04em] text-[#102b57] sm:text-[2.1rem] lg:text-[2.45rem]">
                    What’s next after your <span className="text-[#2b8df5]">cutoff?</span>
                  </h1>
                  <button
                    ref={suggestedCollegesButtonRef}
                    type="button"
                    onClick={handleSuggestCollegesAction}
                    className="suggest-college-cta shine-button inline-flex h-12 w-full items-center justify-center gap-3 rounded-full border border-[#1f6fe9] bg-[linear-gradient(180deg,#2c83f6_0%,#1766d9_100%)] px-7 text-[0.95rem] font-semibold text-white shadow-[0_14px_26px_rgba(23,102,217,0.25)] transition hover:translate-y-[-1px] hover:shadow-[0_18px_32px_rgba(23,102,217,0.32)] sm:w-auto sm:min-w-[260px] lg:shrink-0"
                  >
                    <span className="relative flex size-2.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/80 opacity-90" />
                      <span className="relative inline-flex size-2.5 rounded-full bg-white" />
                    </span>
                    <Building2 className="size-5.5" />
                    Show Suggested Colleges
                  </button>
                </div>
                <p className="mt-2.5 max-w-4xl text-[0.9rem] font-medium leading-6 text-[#183965] sm:text-[1rem]">
                  Based on your score, <span className="font-black">WhatsNext</span> can guide you to the best-fit colleges
                  and counseling alerts.
                </p>

                <div className="mt-6 grid gap-5 lg:grid-cols-3">
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
                        className="min-h-[138px] rounded-[12px] border border-[#e4edf9] border-l-[4px] border-l-[#1d74f5] bg-white/92 px-4 py-4 shadow-[0_14px_30px_rgba(20,42,99,0.10)]"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#eef5ff] text-[#1d6fe8] shadow-[inset_0_0_0_1px_rgba(29,111,232,0.05)]">
                            <Icon className="size-5.5 fill-[#1d6fe8]/10" strokeWidth={2.6} />
                          </div>
                          <div className="min-w-0">
                            <h2 className="text-[1.02rem] font-black leading-snug text-[#1264d8] sm:text-[1.12rem]">{item.title}</h2>
                            <p className="mt-3 text-[0.82rem] font-medium leading-6 text-[#193965] sm:text-[0.88rem]">{item.text}</p>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>

                <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <p className="text-[0.95rem] font-medium text-[#193965] sm:text-[1.02rem]">
                    Let <span className="font-black text-[#1264d8]">WhatsNext</span> guide your journey to success.
                  </p>
                </div>
              </div>
            </section>

            {showSuggestedColleges ? (
  <section
    ref={suggestedCollegesSectionRef}
    className="mt-8 overflow-hidden rounded-[18px] border border-[#E6E6E6] bg-white px-6 py-7 shadow-[0_16px_36px_rgba(15,27,37,0.08)]"
  >
    <div className="flex items-start gap-5">
      <div className="flex size-12 shrink-0 items-center justify-center rounded-[10px] text-[#F4B400]">
        <Building2 className="size-10" />
      </div>

      <div>
        <h1 className="font-[family:Gambarino] text-[35.2px] font-semibold leading-tight text-[#0F1B25]">
          Suggested Colleges for <span className="font-[family:Outfit] text-[31.2px] italic font-semibold text-[#F4B400]">You</span>
        </h1>

        <p className="mt-3 text-[16px] font-normal text-[#5F6B76]">
          Colleges suggested based on your score and preferences.
        </p>
      </div>
    </div>

    <div className="mt-7 overflow-hidden rounded-[8px] border border-[#E6E6E6] bg-white">
    <div className="overflow-x-auto [scrollbar-color:#F4B400_#F8F9FB] [scrollbar-width:thin] [&::-webkit-scrollbar]:h-3 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#F4B400] [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-[#F8F9FB]">
      <table className="w-full min-w-[1360px] border-collapse text-left">
        <thead>
          <tr className="bg-[#0F1B25] text-white">
            <th className="w-[90px] px-6 py-5 text-center text-[16px] font-medium uppercase">
              S.NO
            </th>

            <th className="w-[520px] px-6 py-5 text-[16px] font-medium uppercase">
              College
            </th>

            <th className="w-[300px] px-6 py-5 text-[16px] font-medium uppercase">
              Course
            </th>

            <th className="px-6 py-5 text-center text-[16px] font-medium uppercase">
              Admission<br />Type
            </th>

            <th className="whitespace-nowrap px-6 py-5 text-center text-[16px] font-medium uppercase">
              Cut Off
            </th>

            <th className="px-6 py-5 text-center text-[16px] font-medium uppercase">
              Your<br />Score
            </th>

            <th className="px-6 py-5 text-center text-[16px] font-medium uppercase">
              Match Status
            </th>
          </tr>
        </thead>

        <tbody>
          {suggestedCollegeRows.length ? (
            suggestedCollegeRows.map((college, index) => {
              const collegeCutoff = college.targetScore;

              const comparison = compareScoreToCutoff(
                college.cutoffLabel,
                selectedCutoffScore
              );

              const difference = comparison.distance;

              const status =
                comparison.status === "unavailable"
                  ? "close"
                  : comparison.status === "match"
                  ? "great"
                  : comparison.status === "above"
                  ? "above"
                  : difference !== null &&
                    Math.abs(difference) <= 5
                  ? "close"
                  : "low";

              const statusTitle =
                status === "great"
                  ? "Great Match!"
                  : status === "above"
                  ? "Above Cutoff"
                  : status === "close"
                  ? "Close Match"
                  : "Not a Match";

              const statusText =
                status === "great"
                  ? "Your score matches the cutoff range."
                  : status === "above"
                  ? "Your score is above the cutoff range."
                  : status === "close"
                  ? "Your score is close to the cutoff."
                  : "Your score is below the cutoff.";

              return (
                <tr
                  key={`${college.id}-${index}`}
                  className="border-b border-[#E6E6E6] last:border-b-0"
                >
                  <td className="px-6 py-9 text-center text-[16px] font-normal text-[#0F1B25]">
                    {index + 1}
                  </td>

                  <td className="px-6 py-7">
                    <div
                      onClick={() =>
                        router.push(`/college/${college.id}`)
                      }
                      className="flex cursor-pointer flex-col items-start gap-4 rounded-[10px] p-2 transition hover:bg-[#F8F9FB]"
                    >
                      <div className="relative h-[76px] w-[128px] shrink-0 overflow-hidden rounded-[8px] border border-[#E6E6E6] bg-[#F8F9FB]">
                        {college.image ? (
                          <Image
                            src={college.image}
                            alt={college.name}
                            fill
                            sizes="128px"
                            className="object-cover transition duration-300 hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full flex-col items-center justify-center bg-white px-2 text-center text-[#F4B400]">
                            <Building2 className="size-8" />
                            <span className="mt-1 text-[16px] font-medium leading-5">
                              Campus<br />Visual
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="max-w-[440px] text-[20px] font-semibold leading-7 text-[#0F1B25] hover:text-[#D99A00]">
                          {college.name}
                        </p>

                        <p className="mt-3 flex max-w-[440px] items-center gap-2 text-[16px] font-normal text-[#5F6B76]">
                          <MapPin className="size-5 shrink-0" />

                          <span>
                            {college.location ||
                              selectedState ||
                              "Tamil Nadu"}
                          </span>
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-7 text-[16px] font-normal leading-7 text-[#0F1B25]">
                    {selectedCourse || "-"}
                  </td>

                  <td className="px-6 py-7 text-center text-[16px] font-normal text-[#0F1B25]">
                    {selectedAdmissionType || "-"}
                  </td>

                  <td className="whitespace-nowrap px-6 py-7 text-center text-[16px] font-normal text-[#0F1B25]">
                    {college.cutoffLabel ||
                      (collegeCutoff !== null
                        ? formatResultValue(
                            String(collegeCutoff)
                          )
                        : "-")}
                  </td>

                  <td className="px-6 py-7 text-center text-[16px] font-normal text-[#0F1B25]">
                    {enteredScoreLabel}
                  </td>

                  <td className="px-6 py-7">
                    <div className="ml-auto flex min-h-[150px] w-[170px] items-center gap-4 rounded-[8px] bg-[#FFF4CC] px-5 py-5 text-[#0F1B25]">
                      <CheckCircle2 className="size-7 shrink-0 text-[#F4B400]" />

                      <div>
                        <p className="text-[24px] font-semibold leading-7 text-[#0F1B25]">
                          {statusTitle}
                        </p>

                        <p className="mt-3 text-[16px] font-normal leading-6 text-[#0F1B25]">
                          {statusText}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td
                colSpan={7}
                className="px-6 py-10 text-center text-[16px] font-normal text-[#5F6B76]"
              >
                Suggested colleges are not available for this selection yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
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
