"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  BrainCircuit,
  ChevronDown,
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
  selectedDegree: string;
  selectedCourse: string;
  selectedSpecialization: string;
  selectedCategory: string;
  selectedCollegeType: string;
  selectedAdmissionType: string;
  enteredCutoff: string;
  studentName: string;
  colleges: College[];
  courses: Course[];
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

const juniorRecommendationLabel = (_level: StandardId) => "11th";

const predictorTierTheme = (tierId: TierBucket["id"]) => {
  if (tierId === "tier1") {
    return {
      titleColor: "text-emerald-700",
      subtitleColor: "text-slate-500",
      iconWrap: "bg-amber-50 text-amber-500",
      chanceColor: "text-[#f59e0b]",
      progressTrack: "bg-slate-200",
      progressBar: "bg-[linear-gradient(90deg,#12b76a,#8be1b4)]",
      cardTone: "border-[#dce9f8] bg-white",
      buttonTone: "bg-[#f4f7ff] text-[#3456ff]",
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
  if (parsed.start === parsed.end) return score >= parsed.start;
  return score >= parsed.start && score <= parsed.end;
};

export function CutoffClient({
  selectedLevel,
  selectedDegree,
  selectedCourse,
  selectedSpecialization,
  selectedCategory,
  selectedCollegeType,
  selectedAdmissionType,
  enteredCutoff,
  studentName,
  colleges,
  courses,
}: CutoffClientProps) {
  // Core cutoff page state and active level selection.
  const resolvedLevel = normalizeSelectedLevel(selectedLevel);
  const isJuniorLevel = ["6", "7", "8", "9", "10"].includes(resolvedLevel);
  const isTwelfthStandard = resolvedLevel === "12";
  const usesFocusedMatchFlow = !isJuniorLevel && (isTwelfthStandard || selectedDegree === "Law");
  const hasExamBasedCutoffFlow = usesFocusedMatchFlow && isExamBasedAdmissionType(selectedAdmissionType);
  const initialJuniorStandard = (isJuniorLevel ? resolvedLevel : "10") as StandardId;
  const [activeStandard, setActiveStandard] = useState<StandardId>(initialJuniorStandard);
  const [analyzedStandard, setAnalyzedStandard] = useState<StandardId>(initialJuniorStandard);
  const [marksByStandard, setMarksByStandard] = useState<MarksByStandard>(DEFAULT_MARKS);
  const [hasAnalyzedJunior, setHasAnalyzedJunior] = useState(false);
  const juniorAnalysisRef = useRef<HTMLElement | null>(null);

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
  const predictorPercentage = Math.max(0, Math.min(100, predictorBenchmark));
  const courseBasedCollegeCards = useMemo(() => {
    const scaleMax = getCutoffScale(selectedDegree, selectedAdmissionType);
    const categoryKey = normalizeCategoryKey(selectedCategory);
    const mapped = new Map<string, PredictorCard>();

    courses.forEach((course) => {
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
          image: college.image || "/cutoff-page-topImage.png",
          href: `/college/${college.id}`,
          cutoffLabel: formatCutoffLabel(rawCutoff),
          matchScore,
          isBestCollege: Boolean(college.isBestCollege),
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

    const fallbackCards = colleges
      .filter(() => isJuniorLevel || selectedCutoffScore === null)
      .filter((college) => !selectedDegree || college.streams.some((item) => normalizeText(item).includes(normalizeText(selectedDegree))))
      .filter((college) => collegeTypeMatches(college, selectedCollegeType))
      .slice(0, 12)
      .map((college, index) => ({
        id: college.id,
        name: college.name,
        location: [college.district, college.state].filter(Boolean).join(", "),
        image: college.image || "/cutoff-page-topImage.png",
        href: `/college/${college.id}`,
        cutoffLabel: `${72 + index * 3}`,
        matchScore: Math.max(55, 86 - index * 4),
        isBestCollege: Boolean(college.isBestCollege),
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
    return sortedCards.length ? sortedCards : fallbackCards;
  }, [
    colleges,
    courses,
    hasExamBasedCutoffFlow,
    isJuniorLevel,
    isTwelfthStandard,
    predictorPercentage,
    selectedAdmissionType,
    selectedCategory,
    selectedCollegeType,
    selectedCutoffScore,
    selectedCourse,
    selectedDegree,
    selectedSpecialization,
  ]);

  // Backend/public data-driven college matching engine.
  const matchingColleges = useMemo(() => {
    const requiresExactCutoffMatch = !isJuniorLevel && selectedCutoffScore !== null;
    if (!requiresExactCutoffMatch) return courseBasedCollegeCards;
    return courseBasedCollegeCards.filter(
      (college) =>
        college.targetScore !== null &&
        cutoffMatchesScore(college.cutoffLabel, selectedCutoffScore),
    );
  }, [courseBasedCollegeCards, isJuniorLevel, selectedCutoffScore]);

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
                ? "w-[85%] min-w-[85%] shrink-0 sm:w-[calc((100%-1rem)/2)] sm:min-w-[calc((100%-1rem)/2)] xl:w-[calc((100%-2rem)/3)] xl:min-w-[calc((100%-2rem)/3)]"
                : ""
            }`}
          >
            <div className="relative h-40 w-full overflow-hidden rounded-[1rem] border border-[#dfe7ff] bg-[linear-gradient(180deg,#ffffff_0%,#f6f9ff_100%)]">
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

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(191,219,254,0.38),transparent_28%),radial-gradient(circle_at_top_right,rgba(196,181,253,0.24),transparent_24%),#f8fbff] text-slate-950">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 xl:px-10">
        {/* Header Welcome Section */}
        <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 shadow-[0_24px_80px_rgba(59,130,246,0.12)] backdrop-blur-xl">
          <div className="px-5 py-5 sm:px-7 sm:py-6 lg:px-8 xl:px-10">
            <div className="flex flex-col gap-4 rounded-[1.6rem] border border-slate-100 bg-white/90 px-4 py-4 shadow-[0_16px_48px_rgba(15,23,42,0.06)] sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-600">
                  Premium Cutoff Intelligence
                </p>
                <h1 className="mt-2 text-[1.8rem] font-black tracking-[-0.05em] text-slate-950 sm:text-[2rem]">
                  Hello, {safeStudentName}!
                </h1>
                <p className="mt-1.5 max-w-3xl text-sm text-slate-600">
                  {isJuniorLevel
                    ? "Let’s analyze your cutoff and plan your future with a cleaner view of school performance, strengths, and early college prediction."
                    : "Let’s analyze your cutoff and plan your future with entrance-focused clarity, eligibility direction, and smarter college prediction."}
                </p>
              </div>

              <div className="flex items-center gap-3 self-start sm:self-center">
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
                  {topStandardLabel}
                  <ChevronDown className="size-4 text-slate-500" />
                </div>
                <div className="relative h-12 w-12 overflow-hidden rounded-full border border-blue-100 bg-[linear-gradient(135deg,#eff6ff,#dbeafe)] shadow-[0_12px_24px_rgba(37,99,235,0.18)]">
                  <Image
                    src="/boy.png"
                    alt="Student avatar"
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>

            {!isJuniorLevel ? (
              <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-[1.4rem] border border-sky-100 bg-[linear-gradient(180deg,rgba(239,246,255,0.95),rgba(255,255,255,0.96))] p-3.5 shadow-[0_14px_40px_rgba(14,165,233,0.08)]">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600">
                      Current Standard
                    </p>
                    <p className="mt-1.5 text-[1.45rem] font-black tracking-[-0.04em] text-slate-900">
                      {topStandardLabel}
                    </p>
                  </div>

                  <div className="rounded-[1.4rem] border border-indigo-100 bg-[linear-gradient(180deg,rgba(238,242,255,0.95),rgba(255,255,255,0.96))] p-3.5 shadow-[0_14px_40px_rgba(99,102,241,0.08)]">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-600">
                      Selected Degree
                    </p>
                    <p className="mt-1.5 text-[1.45rem] font-black tracking-[-0.04em] text-slate-900">
                      {selectedDegree || "Engineering"}
                    </p>
                  </div>

                  <div className="rounded-[1.4rem] border border-emerald-100 bg-[linear-gradient(180deg,rgba(236,253,245,0.95),rgba(255,255,255,0.96))] p-3.5 shadow-[0_14px_40px_rgba(16,185,129,0.08)]">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-600">
                      Cutoff / Score
                    </p>
                    <p className="mt-1.5 text-[1.45rem] font-black tracking-[-0.04em] text-slate-900">
                      {enteredCutoff || "Pending"}
                    </p>
                  </div>

                  <div className="rounded-[1.4rem] border border-violet-100 bg-[linear-gradient(180deg,rgba(245,243,255,0.95),rgba(255,255,255,0.96))] p-3.5 shadow-[0_14px_40px_rgba(139,92,246,0.08)]">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-600">
                          Prediction Strength
                        </p>
                        <p className="mt-1.5 text-sm font-semibold text-slate-900">
                          Smarter analysis. Clearer choices.
                        </p>
                      </div>
                      <div className="rounded-full bg-[linear-gradient(135deg,#2563eb,#3b82f6,#60a5fa)] px-4 py-2 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(37,99,235,0.28)]">
                        {Math.max(48, predictorPercentage)}%
                      </div>
                    </div>
                  </div>
              </div>
            ) : null}
          </div>
        </section>

        {isJuniorLevel ? (
          <>
            {/* Enter Your Marks */}
            <section className="rounded-[2.2rem] border border-[#dce8ff] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.95),rgba(241,246,255,0.92)_56%,rgba(255,255,255,0.98))] p-4 shadow-[0_32px_90px_rgba(59,130,246,0.1)] sm:p-6 xl:p-7">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h2 className="text-[2rem] font-black tracking-[-0.05em] text-slate-950 sm:text-[2.4rem]">
                    Enter your marks
                  </h2>
                  <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
                    Fill in your marks for each subject to get accurate performance analysis.
                  </p>
                </div>

                <div className="rounded-[1.45rem] border border-[#e3ecff] bg-white/90 px-4 py-4 shadow-[0_18px_44px_rgba(59,130,246,0.08)] sm:px-5">
                  <div className="flex items-center gap-4">
                    <div className="inline-flex size-14 items-center justify-center rounded-[1rem] bg-[#eef5ff] text-[#2d6cff]">
                      <LineChart className="size-7" />
                    </div>
                    <div>
                      <p className="text-[1.1rem] font-semibold text-[#3254ff]">Track. Analyze. Improve.</p>
                      <p className="mt-1 text-sm text-slate-500">Your performance journey starts here!</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`mt-8 grid gap-5 ${juniorCardsGridClass(visibleJuniorStandards.length)}`}>
                {visibleJuniorStandards.map((standard) => {
                  const isActive = activeStandard === standard.id;
                  const marks = marksByStandard[standard.id];

                  return (
                    <article
                      key={standard.id}
                      className={`rounded-[1.9rem] border border-[#dfe7fb] bg-white/90 p-5 shadow-[0_22px_60px_rgba(15,23,42,0.06)] transition ${
                        juniorCardSpanClass(visibleJuniorStandards.length)
                      } ${
                        isActive
                          ? `${standard.borderTone} shadow-[0_24px_70px_rgba(59,130,246,0.12)]`
                          : ""
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => setActiveStandard(standard.id)}
                          className={`inline-flex rounded-[1rem] bg-gradient-to-r px-6 py-3 text-[0.95rem] font-bold text-white shadow-[0_16px_28px_rgba(37,99,235,0.16)] ${standard.chipTone}`}
                        >
                          {standard.label}
                        </button>
                        <GraduationCap className={`size-7 ${standard.id === "6" ? "text-sky-500" : standard.id === "7" ? "text-emerald-500" : standard.id === "8" ? "text-violet-500" : standard.id === "9" ? "text-pink-500" : "text-orange-500"}`} />
                      </div>

                      <div className="mt-6 space-y-5">
                        {juniorSubjectMeta.map((subject) => (
                          <div
                            key={`${standard.id}-${subject.key}`}
                            className="flex items-center gap-4"
                          >
                            <div className={`inline-flex size-14 shrink-0 items-center justify-center rounded-[1rem] ${subject.soft}`}>
                              <subject.icon className={`size-7 ${subject.accent}`} />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="mb-2 text-[1.05rem] font-semibold text-slate-900">
                                {subject.label}
                              </div>
                              <div className="flex items-center gap-3 rounded-[1rem] border border-[#d9e2fb] bg-white px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  value={marks[subject.key] || ""}
                                  onChange={(event) =>
                                    handleMarkChange(standard.id, subject.key, event.target.value)
                                  }
                                  placeholder="Enter marks"
                                  className="h-10 flex-1 bg-transparent text-[1rem] font-medium text-slate-900 outline-none placeholder:text-[#b5c0e3]"
                                  aria-label={`${standard.label} ${subject.label} marks`}
                                />
                                <span className="text-[1rem] font-semibold text-slate-800">/100</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </article>
                  );
                })}

                {!showJuniorInlineCta(visibleJuniorStandards.length) ? (
                <aside className={`flex flex-col ${juniorAsideSpanClass(visibleJuniorStandards.length)}`}>
                  <div className="rounded-[1.9rem] bg-transparent p-2">
                    <div className={`relative mx-auto w-full ${juniorIllustrationHeightClass(visibleJuniorStandards.length)}`}>
                      <div className="absolute right-0 top-2 rounded-[1.6rem] border border-[#d9d7ff] bg-white/95 px-6 py-5 text-[1.1rem] leading-9 text-slate-900 shadow-[0_20px_48px_rgba(99,102,241,0.08)]">
                        <div>Enter your marks,</div>
                        <div>I&apos;ll help you <span className="font-bold text-[#3f51ff]">analyze!</span></div>
                      </div>

                      <div
                        className={`absolute inset-x-0 bottom-0 ${
                          visibleJuniorStandards.length === 1
                            ? "top-4 scale-[1.08]"
                            : visibleJuniorStandards.length === 3
                              ? "top-20"
                              : "top-16"
                        }`}
                      >
                        <Image
                          src="/boy.png"
                          alt="Boy illustration"
                          fill
                          priority
                          sizes="380px"
                          className="object-contain object-bottom"
                        />
                      </div>
                    </div>
                  </div>
                </aside>
                ) : null}
              </div>

              {showJuniorInlineCta(visibleJuniorStandards.length) ? (
                <div className="mt-6 grid gap-5 xl:grid-cols-12">
                  <div className="rounded-[1.9rem] border border-[#dbe6ff] bg-white/80 px-5 py-5 shadow-[0_18px_44px_rgba(59,130,246,0.05)] xl:col-span-8">
                    <div className="flex items-center gap-4 text-[#3556b8]">
                      <div className="inline-flex size-12 items-center justify-center rounded-full bg-[#2f6dff] text-white shadow-[0_14px_28px_rgba(47,109,255,0.2)]">
                        <CircleAlert className="size-5" />
                      </div>
                      <p className="text-lg font-medium">
                        Please enter your marks for all subjects to get accurate performance analysis.
                      </p>
                    </div>
                    <div className="mt-7 flex justify-center xl:justify-start">
                      <button
                        type="button"
                        onClick={() => {
                          if (!allVisibleJuniorMarksFilled) return;
                          setAnalyzedStandard(activeStandard);
                          setHasAnalyzedJunior(true);
                        }}
                        disabled={!allVisibleJuniorMarksFilled}
                        className={`inline-flex min-h-16 items-center justify-center gap-4 rounded-[1.3rem] px-8 py-4 text-lg font-semibold text-white shadow-[0_28px_54px_rgba(63,81,255,0.28)] transition sm:min-w-[430px] ${
                          allVisibleJuniorMarksFilled
                            ? "bg-[linear-gradient(135deg,#4f63ff,#3158ff)] hover:-translate-y-0.5"
                            : "cursor-not-allowed bg-[linear-gradient(135deg,#aab7ff,#8599ff)] opacity-70"
                        }`}
                      >
                        <span className="inline-flex size-11 items-center justify-center rounded-full bg-white/12">
                          <TrendingUp className="size-5" />
                        </span>
                        Analyze My Performance
                        <ArrowUpRight className="size-6" />
                      </button>
                    </div>
                  </div>
                  <aside className="flex flex-col xl:col-span-4">
                    <div className="rounded-[1.9rem] bg-transparent p-2">
                      <div className={`relative mx-auto w-full ${juniorIllustrationHeightClass(visibleJuniorStandards.length)}`}>
                        <div className="absolute right-0 top-2 rounded-[1.6rem] border border-[#d9d7ff] bg-white/95 px-6 py-5 text-[1.1rem] leading-9 text-slate-900 shadow-[0_20px_48px_rgba(99,102,241,0.08)]">
                          <div>Enter your marks,</div>
                          <div>I&apos;ll help you <span className="font-bold text-[#3f51ff]">analyze!</span></div>
                        </div>
                        <div className="absolute inset-x-0 bottom-0 top-20">
                          <Image
                            src="/boy.png"
                            alt="Boy illustration"
                            fill
                            priority
                            sizes="380px"
                            className="object-contain object-bottom"
                          />
                        </div>
                      </div>
                    </div>
                  </aside>
                </div>
              ) : (
                <>
                  <div className="mt-6 rounded-[1.6rem] border border-[#dbe6ff] bg-white/80 px-5 py-5 shadow-[0_18px_44px_rgba(59,130,246,0.05)]">
                    <div className="flex items-center gap-4 text-[#3556b8]">
                      <div className="inline-flex size-12 items-center justify-center rounded-full bg-[#2f6dff] text-white shadow-[0_14px_28px_rgba(47,109,255,0.2)]">
                        <CircleAlert className="size-5" />
                      </div>
                      <p className="text-lg font-medium">
                        Please enter your marks for all subjects to get accurate performance analysis.
                      </p>
                    </div>
                  </div>

                  <div className="mt-7 flex justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        if (!allVisibleJuniorMarksFilled) return;
                        setAnalyzedStandard(activeStandard);
                        setHasAnalyzedJunior(true);
                      }}
                      disabled={!allVisibleJuniorMarksFilled}
                      className={`inline-flex min-h-16 items-center justify-center gap-4 rounded-[1.3rem] px-8 py-4 text-lg font-semibold text-white shadow-[0_28px_54px_rgba(63,81,255,0.28)] transition sm:min-w-[430px] ${
                        allVisibleJuniorMarksFilled
                          ? "bg-[linear-gradient(135deg,#4f63ff,#3158ff)] hover:-translate-y-0.5"
                          : "cursor-not-allowed bg-[linear-gradient(135deg,#aab7ff,#8599ff)] opacity-70"
                      }`}
                    >
                      <span className="inline-flex size-11 items-center justify-center rounded-full bg-white/12">
                        <TrendingUp className="size-5" />
                      </span>
                      Analyze My Performance
                      <ArrowUpRight className="size-6" />
                    </button>
                  </div>
                </>
              )}
            </section>

            {showJuniorAnalysis ? (
            <>
            {/* Performance Analysis Section - Full Width Row */}
            <section ref={juniorAnalysisRef} className="w-full">
              <article className="w-full rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white">
                      Performance Analysis
                    </div>
                    <h3 className="mt-4 text-2xl font-black tracking-[-0.04em] text-slate-950">
                      {labelForLevel(analyzedStandard)} performance snapshot
                    </h3>
                  </div>
                  <div className="rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                    Average {analyzedAverage}%
                  </div>
                </div>

                <div className="mt-6 rounded-[1.65rem] border border-[#dde7fb] bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-4 shadow-[0_14px_32px_rgba(15,23,42,0.04)] sm:p-5">
                  <div className="mb-4 flex flex-wrap gap-4 text-xs font-semibold text-slate-700">
                    {juniorSubjectMeta.map((subject) => (
                      <div key={subject.key} className="inline-flex items-center gap-2">
                        <span className={`inline-flex size-3 rounded-full ${subject.dotTone}`} />
                        {subject.label}
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
                    <div className="rounded-[1.35rem] border border-[#e4ebfb] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.03)]">
                      <div className="text-sm font-semibold text-slate-800">Subject Performance</div>
                      <JuniorPerformanceBars
                        standards={visibleJuniorStandards.map((option) => ({
                          id: option.id,
                          label: compactLevelLabel(option.label),
                          marks: marksByStandard[option.id],
                        }))}
                        subjects={juniorSubjectMeta}
                      />
                    </div>

                    <div className="rounded-[1.35rem] border border-[#e4ebfb] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.03)]">
                      <div className="text-sm font-semibold text-slate-800">Year-wise Improvement</div>
                      <JuniorImprovementLines
                        standards={visibleJuniorStandards.map((option) => ({
                          id: option.id,
                          label: compactLevelLabel(option.label),
                          marks: marksByStandard[option.id],
                        }))}
                        subjects={juniorSubjectMeta}
                      />
                    </div>
                  </div>
                </div>
              </article>
            </section>

            {/* Strength, Weakness & Improvement Section - Separate Row */}
            <section className="grid items-stretch gap-5 lg:grid-cols-2">
                <article className="h-full rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-6">
                  <div className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white">
                    Strength, Weakness & Improvement
                  </div>

                  <div className="mt-5 space-y-3">
                    <div className="rounded-[1.35rem] border border-emerald-100 bg-[linear-gradient(180deg,#f0fdf4,#ffffff)] p-4">
                      <div className="flex items-start gap-3">
                        <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                          <Trophy className="size-5" />
                        </div>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-600">
                            Strong Subject
                          </p>

                          <h4 className="mt-1 text-lg font-black text-slate-950">
                            {juniorSubjectMeta.find((item) => item.key === performanceSummary.strong[0])?.label}
                          </h4>

                          <p className="mt-1 text-sm text-slate-600">
                            You scored {performanceSummary.strong[1]} marks in this subject. This is your strongest area.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[1.35rem] border border-rose-100 bg-[linear-gradient(180deg,#fff1f2,#ffffff)] p-4">
                      <div className="flex items-start gap-3">
                        <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
                          <Target className="size-5" />
                        </div>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-rose-600">
                            Weak Subject
                          </p>

                          <h4 className="mt-1 text-lg font-black text-slate-950">
                            {juniorSubjectMeta.find((item) => item.key === performanceSummary.weak[0])?.label}
                          </h4>

                          <p className="mt-1 text-sm text-slate-600">
                            This subject needs more revision and regular practice to improve your score.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[1.35rem] border border-blue-100 bg-[linear-gradient(180deg,#eff6ff,#ffffff)] p-4">
                      <div className="flex items-start gap-3">
                        <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                          <TrendingUp className="size-5" />
                        </div>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">
                            Improve Subject
                          </p>

                          <h4 className="mt-1 text-lg font-black text-slate-950">
                            {juniorSubjectMeta.find((item) => item.key === performanceSummary.improve[0])?.label}
                          </h4>

                          <p className="mt-1 text-sm text-slate-600">
                            Improving this subject every week will help you achieve better results quickly.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>

                <article className="h-full rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-6">
                  <div className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white">
                    Recommended Group for {juniorRecommendationLabel(resolvedLevel as StandardId)}
                  </div>
                  <div className="mt-5 rounded-[1.6rem] border border-[#dce5ff] bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)] p-5">
                    <div className="flex items-start gap-4">
                      <div className="inline-flex size-16 items-center justify-center rounded-full bg-[linear-gradient(180deg,#eef4ff_0%,#ffffff_100%)] text-[#2f63ff] shadow-[0_12px_28px_rgba(47,99,255,0.14)]">
                        <groupRecommendation.icon className="size-8" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#506aa3]">Recommended Group</p>
                        <h4 className="mt-1 text-[2rem] font-black tracking-[-0.04em] text-[#1c46d7]">{groupRecommendation.title}</h4>
                      </div>
                    </div>
                    <div className="mt-5 space-y-3">
                      {groupRecommendation.points.map((point) => (
                        <div key={point} className="flex items-start gap-3 text-[1rem] text-slate-800">
                          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-emerald-500" />
                          <span>{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </article>
              </section>
              </>
            ) : null}
          </>
        ) : (
          <>
            {/* Senior Cutoff Overview */}
            <section className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
              <article className="rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white">
                  <span className="inline-flex size-5 items-center justify-center rounded-full bg-white/20 text-[11px]">
                    1
                  </span>
                  Cutoff Overview
                </div>

                <h2 className="mt-4 text-2xl font-black tracking-[-0.04em] text-slate-950">
                  {selectedDegree || "Career"} cutoff summary
                </h2>

                <p className="mt-2 text-sm text-slate-600">
                  This section includes cutoff prediction, eligibility guidance, and
                  college matching features for 11th and 12th standard students in a
                  new premium design.
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.25rem] border border-slate-100 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                      Course
                    </p>
                    <p className="mt-2 text-lg font-black text-slate-950">
                      {selectedCourse || selectedDegree || "Not selected"}
                    </p>
                  </div>

                  <div className="rounded-[1.25rem] border border-slate-100 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                      Category
                    </p>
                    <p className="mt-2 text-lg font-black text-slate-950">
                      {selectedCategory || "Open Category"}
                    </p>
                  </div>

                  <div className="rounded-[1.25rem] border border-slate-100 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                      Admission Type
                    </p>
                    <p className="mt-2 text-lg font-black text-slate-950">
                      {selectedAdmissionType || "General Admission"}
                    </p>
                  </div>

                  <div className="rounded-[1.25rem] border border-slate-100 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                      Entered Score
                    </p>
                    <p className="mt-2 text-lg font-black text-slate-950">
                      {enteredCutoff || "Pending"}
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-[1.5rem] border border-sky-100 bg-[linear-gradient(180deg,#eff6ff,#ffffff)] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-600">
                        Prediction Strength
                      </p>
                      <p className="mt-2 text-3xl font-black tracking-[-0.04em] text-slate-950">
                        {predictorPercentage}%
                      </p>
                    </div>

                    <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-white text-sky-600 shadow-[0_12px_24px_rgba(59,130,246,0.12)]">
                      <Target className="size-6" />
                    </div>
                  </div>

                  <div className="mt-4 h-3 rounded-full bg-slate-100">
                    <div
                      className="h-3 rounded-full bg-[linear-gradient(90deg,#2563eb,#60a5fa)]"
                      style={{ width: `${Math.max(18, predictorPercentage)}%` }}
                    />
                  </div>
                </div>
              </article>

              <article className="rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white">
                  <span className="inline-flex size-5 items-center justify-center rounded-full bg-white/20 text-[11px]">2</span>
                  Eligibility & Exam Direction
                </div>
                <h3 className="mt-4 text-2xl font-black tracking-[-0.04em] text-slate-950">{seniorGuide.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{seniorGuide.subtitle}</p>

                <div className="mt-5 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
                  <div className="rounded-[1.45rem] border border-slate-100 bg-white p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                      <FileText className="size-4 text-sky-600" />
                      Exams to Track
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {seniorGuide.exams.map((exam) => (
                        <span key={exam} className="rounded-full border border-sky-100 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700">
                          {exam}
                        </span>
                      ))}
                    </div>
                    <div className="mt-4 space-y-3">
                      {seniorGuide.strategy.map((point) => (
                        <div key={point} className="flex items-center gap-2 rounded-[1rem] bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-700">
                          <Sparkles className="size-4 text-indigo-500" />
                          {point}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[1.45rem] border border-slate-100 bg-white p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                      <BookOpen className="size-4 text-indigo-600" />
                      Current Checklist
                    </div>
                    <div className="mt-4 space-y-3">
                      {seniorGuide.checklist.map((point) => (
                        <div key={point} className="flex items-start gap-3 rounded-[1rem] border border-slate-100 bg-[linear-gradient(180deg,#ffffff,#f8fbff)] px-4 py-3 text-sm text-slate-700">
                          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                          <span>{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            </section>
          </>
        )}

        {(!isJuniorLevel || showJuniorAnalysis) ? (
          usesFocusedMatchFlow ? (
            <section className="rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-6 lg:p-7">
              <div className="flex flex-wrap items-center gap-3 text-slate-900">
                <h2 className="text-[1.45rem] font-black tracking-[-0.04em] text-slate-950">
                  College Predictor
                </h2>
              </div>

              <div className="mt-6">
                {matchingColleges.length === 0 ? (
                  <div className="rounded-[1.25rem] border border-dashed border-slate-200 bg-slate-50 p-5 text-sm font-semibold text-slate-500">
                    No colleges found
                  </div>
                ) : hasExamBasedCutoffFlow ? (
                  renderMatchedCollegeCards(matchingColleges)
                ) : (
                  <div className="space-y-5">
                    <article className="rounded-[1.35rem] border border-emerald-100 bg-[linear-gradient(180deg,#f8fffb_0%,#ffffff_100%)] p-4 shadow-[0_14px_32px_rgba(16,185,129,0.06)]">
                      <h3 className="text-[1.2rem] font-black tracking-[-0.04em] text-emerald-700">
                        Premier Campus Picks
                      </h3>
                      <div className="mt-4">
                        {twelfthBestColleges.length ? (
                          renderMatchedCollegeCards(twelfthBestColleges, { horizontalScroll: true })
                        ) : (
                          <div className="rounded-[1rem] border border-dashed border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-500">
                            No colleges found
                          </div>
                        )}
                      </div>
                    </article>

                    <article className="rounded-[1.35rem] border border-sky-100 bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)] p-4 shadow-[0_14px_32px_rgba(59,130,246,0.06)]">
                      <h3 className="text-[1.2rem] font-black tracking-[-0.04em] text-sky-700">
                        More Matching Campuses
                      </h3>
                      <div className="mt-4">
                        {twelfthOtherColleges.length ? (
                          renderMatchedCollegeCards(twelfthOtherColleges, { horizontalScroll: true })
                        ) : (
                          <div className="rounded-[1rem] border border-dashed border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-500">
                            No colleges found
                          </div>
                        )}
                      </div>
                    </article>
                  </div>
                )}
              </div>
            </section>
          ) : (
            <section className="rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-6 lg:p-7">
              <div className="flex flex-wrap items-center gap-3 text-slate-900">
                <div className="flex flex-wrap items-baseline gap-2">
                  <h2 className="text-[1.45rem] font-black tracking-[-0.04em] text-slate-950">
                    College Predictor
                  </h2>
                </div>
              </div>

              <div className="mt-6 grid gap-5 lg:grid-cols-3">
                {predictorTiers.map((tier) => (
                  (() => {
                    const theme = predictorTierTheme(tier.id);

                    return (
                  <article
                    key={tier.id}
                    className={`rounded-[1.25rem] border-2 p-4 shadow-[0_14px_34px_rgba(15,23,42,0.05)] sm:p-5 ${theme.cardTone}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`inline-flex size-10 items-center justify-center rounded-full ${theme.iconWrap}`}>
                        {tier.id === "tier1" ? <Trophy className="size-5" /> : tier.id === "tier2" ? <Medal className="size-5" /> : <Trophy className="size-5" />}
                      </div>
                      <div>
                        <h3 className={`text-[1.45rem] font-black tracking-[-0.04em] ${theme.titleColor}`}>
                          {tier.title}
                        </h3>
                        <p className={`mt-1 text-sm font-semibold ${theme.subtitleColor}`}>
                          {tier.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5">
                      {tier.previewCards.length ? (
                        <div className="overflow-x-auto pb-2">
                          <div className="flex gap-3">
                          {tier.previewCards.map((college) => (
                            <Link
                              key={`${tier.id}-${college.id}`}
                              href={college.href}
                              className="group w-[calc(50%-0.375rem)] min-w-[calc(50%-0.375rem)] shrink-0 rounded-[1rem] border border-[#d8e3ff] bg-white p-3 text-center shadow-[0_12px_28px_rgba(52,86,255,0.08)] transition hover:-translate-y-0.5 hover:border-[#b8caff]"
                            >
                              <div className="relative mx-auto h-[78px] w-full overflow-hidden rounded-[0.9rem] border-2 border-[#dfe7ff] bg-[linear-gradient(180deg,#ffffff_0%,#f6f9ff_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                                <Image
                                  src={college.image}
                                  alt={college.name}
                                  fill
                                  sizes="(min-width: 1024px) 180px, 50vw"
                                  className="object-cover transition duration-300 group-hover:scale-105"
                                />
                              </div>
                              <p className="mt-3 line-clamp-2 text-[11px] font-semibold leading-4 text-slate-700">
                                {college.name}
                              </p>
                            </Link>
                          ))}
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-[1rem] border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                          Matching college data is still building for this combination.
                        </div>
                      )}
                    </div>
                  </article>
                    );
                  })()
                ))}
              </div>
            </section>
          )
        ) : null}

        {!isJuniorLevel ? (
          <section className={`grid gap-5 ${usesFocusedMatchFlow ? "" : "xl:grid-cols-[0.92fr_1.08fr]"}`}>
            <article className="rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white">
                <span className="inline-flex size-5 items-center justify-center rounded-full bg-white/20 text-[11px]">4</span>
                Best Picks For You
              </div>
              <div className="mt-5 space-y-3">
                {seniorBestPicks.length ? (
                  seniorBestPicks.map((college) => (
                    <Link key={college.id} href={college.href} className="flex items-center gap-3 rounded-[1.25rem] border border-slate-100 bg-white p-3 shadow-[0_10px_24px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5">
                      <div className="relative h-16 w-16 overflow-hidden rounded-[1rem] bg-slate-100">
                        <Image src={college.image} alt={college.name} fill sizes="64px" className="object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="truncate text-sm font-semibold text-slate-900">{college.name}</p>
                          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                            {college.matchScore}%
                          </span>
                        </div>
                        <p className="mt-1 flex items-center gap-1 truncate text-xs text-slate-500">
                          <MapPin className="size-3" />
                          {college.location || "Tamil Nadu"}
                        </p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="rounded-[1.25rem] border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                    No colleges found
                  </div>
                )}
              </div>
            </article>

            {!usesFocusedMatchFlow ? (
            <article className="rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white">
                <span className="inline-flex size-5 items-center justify-center rounded-full bg-white/20 text-[11px]">5</span>
                Aim Higher & More Options
              </div>
              <div className="mt-5">
                {seniorOpportunityCards.length ? (
                  <div className="overflow-x-auto px-1 py-1">
                    <div className="flex gap-4">
                      {seniorOpportunityCards.map((college) => (
                        <Link
                          key={`${college.id}-opportunity`}
                          href={college.href}
                          className="group box-border w-[84%] min-w-[84%] shrink-0 rounded-[1.4rem] border border-[#f3c44e] bg-[linear-gradient(180deg,#ffffff,#f8fbff)] p-3 shadow-[0_14px_30px_rgba(15,23,42,0.06)] transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-px hover:border-[#e9b52c] hover:shadow-[0_18px_34px_rgba(245,158,11,0.12)] sm:w-[48%] sm:min-w-[48%] lg:w-[calc((100%-2rem)/3)] lg:min-w-[calc((100%-2rem)/3)]"
                        >
                          <div className="relative h-40 w-full overflow-hidden rounded-[1.1rem] bg-slate-100">
                            <Image
                              src={college.image}
                              alt={college.name}
                              fill
                              sizes="(min-width: 1024px) 320px, (min-width: 640px) 48vw, 84vw"
                              className="object-cover transition duration-300 group-hover:scale-105"
                            />
                          </div>

                          <div className="mt-4 flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="line-clamp-2 text-sm font-bold text-slate-900">
                                {college.name}
                              </p>
                              <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                                <MapPin className="size-3 shrink-0" />
                                <span className="truncate">{college.location || "Tamil Nadu"}</span>
                              </p>
                            </div>
                            <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">
                              {college.matchScore}% fit
                            </span>
                          </div>

                          <p className="mt-3 text-sm font-semibold text-slate-700">
                            {college.cutoffLabel} target cutoff
                          </p>

                          <div className="mt-4 flex items-center justify-between gap-3 text-xs">
                            <span className="rounded-full bg-sky-50 px-2.5 py-1 font-semibold text-sky-700">
                              {college.need}
                            </span>
                            <span className="font-semibold text-sky-700">
                              View <ArrowUpRight className="ml-1 inline size-3" />
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-[1.25rem] border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                    More stretch colleges are not available for this cutoff yet.
                  </div>
                )}
              </div>
            </article>
            ) : null}
          </section>
        ) : null}
      </div>
      </main>
    </>
  );
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
