"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Beaker,
  BookOpen,
  BrainCircuit,
  Building2,
  ChevronDown,
  FileText,
  FlaskConical,
  GraduationCap,
  LineChart,
  MapPin,
  Medal,
  Microscope,
  Rocket,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  UserCircle2,
} from "lucide-react";
import { parseCutoffValue } from "@/lib/cutoff-utils";
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
type SubjectKey = "physics" | "maths" | "chemistry";

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
};

type TierBucket = {
  id: "tier1" | "tier2" | "tier3";
  title: string;
  subtitle: string;
  chance: number;
  tone: string;
  progressTone: string;
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

const SUBJECT_META: Array<{
  key: SubjectKey;
  label: string;
  icon: typeof Microscope;
  accent: string;
  soft: string;
}> = [
    {
      key: "physics",
      label: "Physics",
      icon: Microscope,
      accent: "text-sky-600",
      soft: "bg-sky-50",
    },
    {
      key: "maths",
      label: "Maths",
      icon: BrainCircuit,
      accent: "text-indigo-600",
      soft: "bg-indigo-50",
    },
    {
      key: "chemistry",
      label: "Chemistry",
      icon: FlaskConical,
      accent: "text-rose-600",
      soft: "bg-rose-50",
    },
  ];

// Default junior marks state used in the Enter Your Marks section.
const DEFAULT_MARKS: MarksByStandard = {
  "6": { physics: 0, maths: 0, chemistry: 0 },
  "7": { physics: 0, maths: 0, chemistry: 0 },
  "8": { physics: 0, maths: 0, chemistry: 0 },
  "9": { physics: 0, maths: 0, chemistry: 0 },
  "10": { physics: 0, maths: 0, chemistry: 0 },
};

// Recommended academic group suggestions based on subject strengths.
const GROUP_RECOMMENDATIONS = {
  pcm: {
    title: "Science (PCM)",
    points: [
      "Maths score strongly supports analytical subjects",
      "Physics understanding already shows good problem-solving depth",
      "This path opens engineering, architecture, and core science choices",
    ],
  },
  pcmb: {
    title: "Science (PCMB)",
    points: [
      "Balanced marks suggest flexibility across engineering and medical options",
      "Chemistry performance supports both entrance preparation styles",
      "You can keep wider future choices before final specialization",
    ],
  },
  foundation: {
    title: "Science Foundation",
    points: [
      "Core science base is growing steadily across subjects",
      "One focused revision cycle can lift overall confidence quickly",
      "This is the right time to build consistency before higher standards",
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
  if (degree === "Engineering") return 200;
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
  Math.round((marks.physics + marks.maths + marks.chemistry) / 3);

const linePathForSeries = (values: number[]) => {
  if (!values.length) return "";
  const width = 320;
  const height = 120;
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

const recommendationForMarks = (marks: SubjectMarks) => {
  if (marks.maths >= 90 && marks.physics >= 85) return GROUP_RECOMMENDATIONS.pcm;
  if (marks.chemistry >= 85 && marks.physics >= 80) return GROUP_RECOMMENDATIONS.pcmb;
  return GROUP_RECOMMENDATIONS.foundation;
};

const formatCutoffLabel = (value: unknown) => {
  const parsed = parseCutoffValue(String(value || ""));
  if (!parsed) return String(value || "-");
  return parsed.start === parsed.end ? `${parsed.start}` : `${parsed.start} - ${parsed.end}`;
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
  return !degreeToken || haystack.includes(degreeToken);
};

const courseMatchesSelection = (course: Course, selectedCourse: string, selectedSpecialization: string) => {
  const courseSearch = normalizeText(selectedCourse);
  const specializationSearch = normalizeText(selectedSpecialization);
  if (!courseSearch && !specializationSearch) return true;

  const courseName = normalizeText(course.course || course.courseName || course.courseType || "");
  const specialization = normalizeText(course.specialization || course.courseName || "");

  if (courseSearch && (courseName.includes(courseSearch) || courseSearch.includes(courseName))) {
    if (!specializationSearch) return true;
    return specialization.includes(specializationSearch);
  }

  if (specializationSearch && specialization.includes(specializationSearch)) return true;
  return false;
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
  const initialJuniorStandard = (isJuniorLevel ? resolvedLevel : "10") as StandardId;
  const [activeStandard, setActiveStandard] = useState<StandardId>(initialJuniorStandard);
  const [analyzedStandard, setAnalyzedStandard] = useState<StandardId>(initialJuniorStandard);
  const [marksByStandard, setMarksByStandard] = useState<MarksByStandard>(DEFAULT_MARKS);

  // Header summary values.
  const safeStudentName = String(studentName || "").trim() || "Student";
  const topStandardLabel = labelForLevel(resolvedLevel);
  const visibleJuniorStandards = useMemo(
    () =>
      STANDARD_OPTIONS.filter((item) =>
        Number(item.id) <= Number(isJuniorLevel ? resolvedLevel : "10"),
      ),
    [isJuniorLevel, resolvedLevel],
  );
  const analyzedMarks = marksByStandard[analyzedStandard];
  const analyzedAverage = averageMarks(analyzedMarks);
  const performanceLevel =
    analyzedAverage >= 90 ? "Outstanding" : analyzedAverage >= 80 ? "Strong" : analyzedAverage >= 70 ? "Promising" : "Growing";

  const performanceSummary = badgeForStrength(analyzedMarks);
  const groupRecommendation = recommendationForMarks(analyzedMarks);
  // Normalized cutoff score used by the predictor.
  const selectedCutoffScore = useMemo(() => {
    const parsed = parseCutoffValue(enteredCutoff);
    if (!parsed) return null;
    return Math.max(parsed.start, parsed.end);
  }, [enteredCutoff]);

  const predictorBenchmark = selectedCutoffScore ?? analyzedAverage;
  const predictorPercentage = Math.max(0, Math.min(100, predictorBenchmark));

  // Junior chart series generated from entered marks.
  const chartSeries = useMemo(
    () =>
      SUBJECT_META.map((subject) => ({
        ...subject,
        values: visibleJuniorStandards.map((option) => marksByStandard[option.id][subject.key]),
      })),
    [marksByStandard, visibleJuniorStandards],
  );
  const visibleStandardsAverage = useMemo(() => {
    if (!visibleJuniorStandards.length) return 0;
    const total = visibleJuniorStandards.reduce(
      (sum, standard) => sum + averageMarks(marksByStandard[standard.id]),
      0,
    );
    return Math.round(total / visibleJuniorStandards.length);
  }, [marksByStandard, visibleJuniorStandards]);

  // Backend/public data-driven college matching engine.
  const matchingColleges = useMemo(() => {
    const scaleMax = getCutoffScale(selectedDegree, selectedAdmissionType);
    const categoryKey = normalizeCategoryKey(selectedCategory);
    const mapped = new Map<string, PredictorCard>();

    courses.forEach((course) => {
      if (!degreeMatchesCourse(course, selectedDegree)) return;
      if (!courseMatchesSelection(course, selectedCourse, selectedSpecialization)) return;

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

        const categoryCutoff =
          (detail.cutoffByCategory || course.cutoffByCategory || []).find(
            (item) => normalizeCategoryKey(item.category) === categoryKey,
          )?.cutoff || "";

        const rawCutoff = categoryCutoff || detail.cutoffText || course.cutoffText || detail.cutoff || course.cutoff;
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

        const nextCard: PredictorCard = {
          id: college.id,
          name: college.name,
          location: [college.district, college.state].filter(Boolean).join(", "),
          image: college.image || "/cutoff-page-topImage.png",
          href: `/college/${college.id}`,
          cutoffLabel: formatCutoffLabel(rawCutoff),
          matchScore,
          isBestCollege: Boolean(college.isBestCollege),
        };

        if (!existing || nextCard.matchScore > existing.matchScore) {
          mapped.set(college.id, nextCard);
        }
      });
    });

    const fallbackCards = colleges
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
      }));

    const sortedCards = Array.from(mapped.values()).sort((left, right) => right.matchScore - left.matchScore);
    return sortedCards.length ? sortedCards : fallbackCards;
  }, [
    colleges,
    courses,
    predictorPercentage,
    selectedAdmissionType,
    selectedCategory,
    selectedCollegeType,
    selectedCourse,
    selectedDegree,
    selectedSpecialization,
  ]);

  // Tier 1 / Tier 2 / Tier 3 predictor grouping.
  const predictorTiers = useMemo<TierBucket[]>(() => {
    const bestCards = matchingColleges.filter((card) => card.isBestCollege);
    const regularCards = matchingColleges.filter((card) => !card.isBestCollege);
    const firstTierCards = (bestCards.length ? bestCards : matchingColleges).slice(0, 3);
    const secondTierCards = regularCards.slice(0, 3);
    const thirdTierCards = regularCards.slice(3, 6);

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
        tone: "from-blue-600 via-indigo-600 to-sky-500",
        progressTone: "from-blue-500 to-sky-400",
        previewCards: firstTierCards,
      },
      {
        id: "tier2",
        title: "Tier 2 Colleges",
        subtitle: "Balanced picks with strong placements and safer reach",
        chance: getChance(secondTierCards.length ? secondTierCards : firstTierCards, 1),
        tone: "from-emerald-500 via-teal-500 to-cyan-500",
        progressTone: "from-emerald-500 to-teal-400",
        previewCards: secondTierCards.length ? secondTierCards : matchingColleges.slice(0, 3),
      },
      {
        id: "tier3",
        title: "Tier 3 Colleges",
        subtitle: "Comfort options that still keep momentum strong",
        chance: getChance(thirdTierCards.length ? thirdTierCards : regularCards.slice(0, 3), -8),
        tone: "from-fuchsia-500 via-pink-500 to-rose-500",
        progressTone: "from-fuchsia-500 to-rose-400",
        previewCards: thirdTierCards.length ? thirdTierCards : regularCards.slice(0, 3),
      },
    ];
  }, [matchingColleges, predictorPercentage]);

  // Senior-only roadmap and stretch options.
  const seniorGuide = SENIOR_GUIDE[selectedDegree] || SENIOR_GUIDE.Engineering;
  const seniorBestPicks = matchingColleges.slice(0, 3);
  const seniorMoreOptions = matchingColleges.slice(3, 9);
  const seniorAimHigher = useMemo(
    () =>
      matchingColleges
        .filter((item) => item.matchScore < 75)
        .slice(0, 4)
        .map((item, index) => ({
          ...item,
          need: `${Math.max(4, 16 - index * 3)}% more score push`,
        })),
    [matchingColleges],
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
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(191,219,254,0.38),transparent_28%),radial-gradient(circle_at_top_right,rgba(196,181,253,0.24),transparent_24%),#f8fbff] text-slate-950">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 xl:px-10">
        {/* Header Welcome Section */}
        <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 shadow-[0_24px_80px_rgba(59,130,246,0.12)] backdrop-blur-xl">
          <div className="grid gap-5 px-5 py-5 sm:px-7 sm:py-6 lg:grid-cols-[1.08fr_0.92fr] lg:px-8 xl:px-10 xl:py-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-600">
                    Premium Cutoff Intelligence
                  </p>

                  <h1 className="mt-2 text-[2rem] font-black tracking-[-0.05em] text-slate-950 sm:text-[2.2rem] lg:text-[2.55rem]">
                    Hello, {safeStudentName}
                  </h1>

                  <p className="mt-1.5 max-w-2xl text-[13px] leading-6 text-slate-600 sm:text-[0.94rem]">
                    {isJuniorLevel
                      ? "Let’s analyze your cutoff and plan your future with a cleaner view of school performance, strengths, and early college prediction."
                      : "Let’s analyze your cutoff and plan your future with entrance-focused clarity, eligibility direction, and smarter college prediction."}
                  </p>
                </div>

                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-[0_12px_28px_rgba(15,23,42,0.06)]">
                    {topStandardLabel}
                    <ChevronDown className="size-4 text-slate-500" />
                  </div>

                  <div className="inline-flex size-11 items-center justify-center rounded-full bg-[linear-gradient(135deg,#2563eb,#60a5fa)] text-white shadow-[0_16px_30px_rgba(37,99,235,0.26)]">
                    <UserCircle2 className="size-6" />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
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
                    {isJuniorLevel ? "Performance Band" : "Selected Degree"}
                  </p>
                  <p className="mt-1.5 text-[1.45rem] font-black tracking-[-0.04em] text-slate-900">
                    {isJuniorLevel ? performanceLevel : selectedDegree || "Engineering"}
                  </p>
                </div>

                <div className="rounded-[1.4rem] border border-emerald-100 bg-[linear-gradient(180deg,rgba(236,253,245,0.95),rgba(255,255,255,0.96))] p-3.5 shadow-[0_14px_40px_rgba(16,185,129,0.08)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-600">
                    {isJuniorLevel ? "Analysis Score" : "Cutoff / Score"}
                  </p>
                  <p className="mt-1.5 text-[1.45rem] font-black tracking-[-0.04em] text-slate-900">
                    {isJuniorLevel
                      ? `${visibleStandardsAverage}%`
                      : enteredCutoff || "Pending"}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#2563eb,#3b82f6,#60a5fa)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(37,99,235,0.28)] transition hover:-translate-y-0.5"
                >
                  <Rocket className="size-4" />
                  Take Mock Test
                </button>

                <span className="rounded-full border border-sky-100 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700">
                  Full-width career analysis view
                </span>
              </div>
            </div>

            <div className="relative flex min-h-[200px] items-center justify-center overflow-hidden rounded-[2rem] border border-sky-100 bg-[linear-gradient(180deg,#eff6ff_0%,#ffffff_100%)] px-3.5 pb-3 pt-18 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] sm:min-h-[230px] sm:pt-20">
              <div className="absolute inset-x-8 top-5 h-20 rounded-full bg-[radial-gradient(circle,rgba(96,165,250,0.28),transparent_72%)] blur-3xl" />

              <div className="absolute left-4 right-4 top-4 flex items-start justify-between gap-3">
                <div className="rounded-[1.1rem] border border-white/80 bg-white/92 px-3.5 py-2.5 shadow-[0_16px_32px_rgba(14,165,233,0.12)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-600">
                    {isJuniorLevel ? "Target Readiness" : "Prediction Strength"}
                  </p>
                  <p className="mt-1 text-[1.45rem] font-black tracking-[-0.04em] text-slate-900">
                    {isJuniorLevel
                      ? `${Math.max(35, visibleStandardsAverage)}%`
                      : `${Math.max(48, predictorPercentage)}%`}
                  </p>
                </div>

                <div className="rounded-[1.1rem] border border-white/80 bg-white/92 px-3.5 py-2.5 shadow-[0_16px_32px_rgba(37,99,235,0.12)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                    Future Snapshot
                  </p>
                  <p className="mt-1 text-[13px] font-semibold text-slate-900">
                    Smarter analysis. Clearer choices.
                  </p>
                </div>
              </div>

              <div className="relative z-10 h-[210px] w-[164px] overflow-hidden rounded-[1.7rem] sm:h-[228px] sm:w-[178px] lg:h-[214px] lg:w-[168px]">
                <Image
                  src="/cutoff-page-topImage.png"
                  alt="Student future planning illustration"
                  fill
                  priority
                  sizes="178px"
                  className="object-cover object-[48%_28%] scale-[1.08]"
                />
              </div>
            </div>
          </div>
        </section>

        {isJuniorLevel ? (
          <>
            {/* Enter Your Marks */}
            <section className="rounded-[2rem] border border-white/70 bg-white/80 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-5 lg:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white">
                    <span className="inline-flex size-5 items-center justify-center rounded-full bg-white/20 text-[11px]">
                      1
                    </span>
                    Enter Your Marks
                  </div>

                  <h2 className="mt-3 text-2xl font-black tracking-[-0.04em] text-slate-950">
                    Marks Entry (Out of 100)
                  </h2>
                </div>

                <div className="rounded-full border  border-sky-100 bg-sky-50 px-4 py-2 text-sm font-semibold  text-sky-700">
                  Selected: {topStandardLabel}
                </div>
              </div>

              {/* Desktop la perfect one row + gap reduce */}
              <div
                className={`mt-5 grid gap-2 ${visibleJuniorStandards.length === 5
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
                  : visibleJuniorStandards.length === 4
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4"
                    : visibleJuniorStandards.length === 3
                      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                      : visibleJuniorStandards.length === 2
                        ? "grid-cols-1 sm:grid-cols-2"
                        : "grid-cols-1"
                  }`}
              >
                {visibleJuniorStandards.map((standard) => {
                  const isActive = activeStandard === standard.id;
                  const marks = marksByStandard[standard.id];

                  return (
                    <article
                      key={standard.id}
                      className={`rounded-[1.2rem] border bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,255,0.98))] p-2.5 shadow-[0_14px_30px_rgba(15,23,42,0.05)] transition ${isActive
                        ? `${standard.borderTone} ring-2 ring-sky-200`
                        : "border-slate-100"
                        }`}
                    >
                      <button
                        type="button"
                        onClick={() => setActiveStandard(standard.id)}
                        className={`inline-flex rounded-full bg-gradient-to-r px-3 py-1 text-[11px] font-semibold text-white shadow-[0_12px_24px_rgba(37,99,235,0.16)] ${standard.chipTone}`}
                      >
                        {standard.label}
                      </button>

                      <div className="mt-3 space-y-1.5">
                        {SUBJECT_META.map((subject) => (
                          <div
                            key={`${standard.id}-${subject.key}`}
                            className="flex items-center justify-between gap-1 rounded-[0.9rem] border border-slate-100 bg-white px-2 py-2 shadow-[0_8px_18px_rgba(15,23,42,0.03)]"
                          >
                            <div className="flex min-w-0 items-center gap-2">
                              <div
                                className={`inline-flex size-8 items-center justify-center rounded-lg ${subject.soft}`}
                              >
                                <subject.icon
                                  className={`size-4 ${subject.accent}`}
                                />
                              </div>

                              <span className="truncate text-[13px] font-bold text-slate-800 sm:text-[14px]">
                                {subject.label}
                              </span>
                            </div>

                            <input
                              type="text"
                              inputMode="numeric"
                              value={marks[subject.key] || ""}
                              onChange={(event) =>
                                handleMarkChange(
                                  standard.id,
                                  subject.key,
                                  event.target.value
                                )
                              }
                              className="h-9 w-14 rounded-lg border border-slate-200 bg-slate-50 px-1 text-center text-[13px] font-bold text-slate-900 outline-none transition focus:border-sky-300 focus:bg-white"
                              aria-label={`${standard.label} ${subject.label} marks`}
                            />
                          </div>
                        ))}
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="mt-5 flex justify-center">
                <button
                  type="button"
                  onClick={() => setAnalyzedStandard(activeStandard)}
                  className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#2563eb,#3b82f6,#60a5fa)] px-6 py-3 text-sm font-semibold text-white shadow-[0_20px_44px_rgba(37,99,235,0.26)] transition hover:-translate-y-0.5"
                >
                  <Sparkles className="size-4" />
                  Analyze My Performance
                </button>
              </div>
            </section>

            {/* Performance Analysis Section - Full Width Row */}
            <section className="w-full">
              <article className="w-full rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white">
                      <span className="inline-flex size-5 items-center justify-center rounded-full bg-white/20 text-[11px]">2</span>
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

                <div className="mt-6 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
                  <div className="rounded-[1.6rem] border border-slate-100 bg-[linear-gradient(180deg,#ffffff,#f8fbff)] p-4 shadow-[0_14px_32px_rgba(15,23,42,0.04)]">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                      <LineChart className="size-4 text-sky-600" />
                      Subject Performance
                    </div>
                    <div className="mt-5 space-y-4">
                      {SUBJECT_META.map((subject) => {
                        const score = analyzedMarks[subject.key];
                        return (
                          <div key={subject.key}>
                            <div className="mb-2 flex items-center justify-between text-sm">
                              <span className="font-semibold text-slate-700">{subject.label}</span>
                              <span className="font-bold text-slate-950">{score}%</span>
                            </div>
                            <div className="h-3 rounded-full bg-slate-100">
                              <div
                                className={`h-3 rounded-full bg-gradient-to-r ${subject.key === "physics"
                                  ? "from-sky-500 to-blue-600"
                                  : subject.key === "maths"
                                    ? "from-indigo-500 to-violet-600"
                                    : "from-rose-500 to-orange-500"
                                  }`}
                                style={{ width: `${score}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="rounded-[1.6rem] border border-slate-100 bg-[linear-gradient(180deg,#ffffff,#f8fbff)] p-4 shadow-[0_14px_32px_rgba(15,23,42,0.04)]">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                      <TrendingUp className="size-4 text-violet-600" />
                      Improvement Trends
                    </div>
                    <div className="mt-4 rounded-[1.4rem] border border-slate-100 bg-white p-4">
                      <svg viewBox="0 0 320 120" className="h-[140px] w-full overflow-visible">
                        {chartSeries.map((series) => (
                          <path
                            key={series.key}
                            d={linePathForSeries(series.values)}
                            fill="none"
                            stroke={
                              series.key === "physics"
                                ? "#0ea5e9"
                                : series.key === "maths"
                                  ? "#6366f1"
                                  : "#f43f5e"
                            }
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        ))}
                      </svg>
                      <div className="mt-3 flex flex-wrap gap-3">
                        {SUBJECT_META.map((subject) => (
                          <div key={subject.key} className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">
                            <span
                              className={`inline-flex size-2.5 rounded-full ${subject.key === "physics"
                                ? "bg-sky-500"
                                : subject.key === "maths"
                                  ? "bg-indigo-500"
                                  : "bg-rose-500"
                                }`}
                            />
                            {subject.label}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className={`mt-4 grid gap-3 text-center ${visibleJuniorStandards.length === 5 ? "grid-cols-5" : visibleJuniorStandards.length === 4 ? "grid-cols-4" : visibleJuniorStandards.length === 3 ? "grid-cols-3" : visibleJuniorStandards.length === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
                      {visibleJuniorStandards.map((option) => (
                        <div key={option.id} className="rounded-[1.1rem] border border-slate-100 bg-white px-3 py-3 text-xs font-semibold text-slate-600 shadow-[0_8px_20px_rgba(15,23,42,0.03)]">
                          <div className="text-slate-400">{option.label.replace(" Standard", "")}</div>
                          <div className="mt-2 text-base font-black text-slate-900">{averageMarks(marksByStandard[option.id])}%</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            </section>

            {/* Strength, Weakness & Improvement Section - Separate Row */}
            <section className="grid items-stretch gap-5 lg:grid-cols-2">
                <article className="h-full rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-6">
                  <div className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white">
                    <span className="inline-flex size-5 items-center justify-center rounded-full bg-white/20 text-[11px]">
                      3
                    </span>
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
                            {
                              SUBJECT_META.find(
                                (item) => item.key === performanceSummary.strong[0]
                              )?.label
                            }
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
                            {
                              SUBJECT_META.find(
                                (item) => item.key === performanceSummary.weak[0]
                              )?.label
                            }
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
                            {
                              SUBJECT_META.find(
                                (item) => item.key === performanceSummary.improve[0]
                              )?.label
                            }
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
                    <span className="inline-flex size-5 items-center justify-center rounded-full bg-white/20 text-[11px]">4</span>
                    Recommended Group
                  </div>
                  <div className="mt-5 rounded-[1.5rem] border border-indigo-100 bg-[linear-gradient(180deg,#eef2ff,#ffffff)] p-5">
                    <div className="flex items-center gap-3">
                      <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-[0_12px_28px_rgba(99,102,241,0.14)]">
                        <GraduationCap className="size-6" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-600">Best-fit Recommendation</p>
                        <h4 className="mt-1 text-2xl font-black tracking-[-0.04em] text-slate-950">{groupRecommendation.title}</h4>
                      </div>
                    </div>
                    <div className="mt-5 space-y-3">
                      {groupRecommendation.points.map((point) => (
                        <div key={point} className="flex items-start gap-3 rounded-[1.05rem] bg-white px-4 py-3 text-sm text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
                          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                          <span>{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </article>
              </section>
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

        {/* College Predictor */}
        <section className="rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-6 lg:p-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white">
                <span className="inline-flex size-5 items-center justify-center rounded-full bg-white/20 text-[11px]">{isJuniorLevel ? "5" : "3"}</span>
                College Predictor
              </div>
              <h2 className="mt-4 text-2xl font-black tracking-[-0.04em] text-slate-950">
                Premium cutoff-based college prediction
              </h2>
              <p className="mt-2 max-w-3xl text-sm text-slate-600">
                {isJuniorLevel
                  ? "We combine the entered marks, recommendation pattern, and available cutoff data to show tier-wise college chances."
                  : "We combine selected category, degree path, and entered cutoff data to show the right college tiers and prediction strength."}
              </p>
            </div>
            <div className="rounded-full border border-violet-100 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700">
              Predictor score {predictorBenchmark}
            </div>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            {predictorTiers.map((tier) => (
              <article
                key={tier.id}
                className="rounded-[1.7rem] border border-slate-100 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,255,0.98))] p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white ${tier.tone}`}>
                    {tier.id === "tier1" ? <Medal className="size-4" /> : tier.id === "tier2" ? <Building2 className="size-4" /> : <Beaker className="size-4" />}
                    {tier.title}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative inline-flex h-16 w-16 items-center justify-center">
                      {(() => {
                        const headerGradientId = `cutoff-tier-header-gradient-${tier.id}`;
                        return (
                          <svg viewBox="0 0 120 120" className="h-14 w-14 -rotate-90">
                            <circle cx="60" cy="60" r="48" fill="none" stroke="#e5eefc" strokeWidth="12" />
                            <circle
                              cx="60"
                              cy="60"
                              r="48"
                              fill="none"
                              stroke={`url(#${headerGradientId})`}
                              strokeWidth="12"
                              strokeLinecap="round"
                              strokeDasharray={301.59}
                              strokeDashoffset={301.59 - (301.59 * tier.chance) / 100}
                            />
                            <defs>
                              <linearGradient id={headerGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#2563eb" />
                                <stop offset="55%" stopColor="#7c3aed" />
                                <stop offset="100%" stopColor="#06b6d4" />
                              </linearGradient>
                            </defs>
                          </svg>
                        );
                      })()}
                      <div className="absolute inset-0 flex items-center justify-center text-sm font-black tracking-[-0.05em] text-slate-950">
                        {tier.chance}%
                      </div>
                    </div>
                    {/* <span className="text-sm font-bold text-slate-700 ">
                      {tier.chance >= 80 ? "High" : tier.chance >= 65 ? "Good" : "Growing"}
                    </span> */}
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-600">{tier.subtitle}</p>

                {/* <div className="mt-5 rounded-[1.4rem] border border-slate-100 bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
                  <div className="text-sm font-semibold text-slate-700">
                    Cutoff-matching colleges with the strongest fit for this tier.
                  </div>
                </div> */}

                <div className="mt-5 space-y-3">
                  {tier.previewCards.length ? (
                    tier.previewCards.map((college) => (
                      <Link
                        key={`${tier.id}-${college.id}`}
                        href={college.href}
                        className="flex items-center gap-3 rounded-[1.25rem] border border-slate-100 bg-white p-3 shadow-[0_10px_24px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5"
                      >
                        <div className="relative h-16 w-16 overflow-hidden rounded-[1rem] bg-slate-100">
                          <Image
                            src={college.image}
                            alt={college.name}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-900">{college.name}</p>
                          <p className="mt-1 truncate text-xs text-slate-500">{college.location || "Tamil Nadu"}</p>
                          <div className="mt-2 flex items-center justify-between gap-2 text-[11px]">
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-700">
                              Cutoff {college.cutoffLabel}
                            </span>
                            <span className="font-bold text-sky-700">{college.matchScore}% fit</span>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="rounded-[1.2rem] border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                      Matching college data is still building for this combination.
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        {!isJuniorLevel ? (
          <section className="grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
            <article className="rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white">
                <span className="inline-flex size-5 items-center justify-center rounded-full bg-white/20 text-[11px]">4</span>
                Best Picks For You
              </div>
              <div className="mt-5 space-y-3">
                {seniorBestPicks.map((college) => (
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
                ))}
              </div>
            </article>

            <article className="rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white">
                <span className="inline-flex size-5 items-center justify-center rounded-full bg-white/20 text-[11px]">5</span>
                Aim Higher & More Options
              </div>
              <div className="mt-5 grid gap-3 lg:grid-cols-2">
                {seniorAimHigher.map((college) => (
                  <div key={`${college.id}-aim`} className="rounded-[1.25rem] border border-slate-100 bg-[linear-gradient(180deg,#ffffff,#f8fbff)] p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
                    <p className="text-sm font-semibold text-slate-900">{college.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{college.cutoffLabel} target cutoff</p>
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className="rounded-full bg-amber-50 px-2.5 py-1 font-semibold text-amber-700">{college.need}</span>
                      <Link href={college.href} className="font-semibold text-sky-700">
                        View <ArrowUpRight className="ml-1 inline size-3" />
                      </Link>
                    </div>
                  </div>
                ))}
                {seniorMoreOptions.slice(0, 2).map((college) => (
                  <div key={`${college.id}-more`} className="rounded-[1.25rem] border border-slate-100 bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
                    <p className="text-sm font-semibold text-slate-900">{college.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{college.location || "Tamil Nadu"}</p>
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-700">{college.matchScore}% fit</span>
                      <Link href={college.href} className="font-semibold text-sky-700">
                        Explore <ArrowUpRight className="ml-1 inline size-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </section>
        ) : null}
      </div>
    </main>
  );
}
