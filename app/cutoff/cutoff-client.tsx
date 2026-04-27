"use client";

import { Navbar } from "@/components/navbar";
import { useMemo, useState, type CSSProperties } from "react";
import {
  ArrowUpRight,
  Award,
  BookOpen,
  Brain,
  Calculator,
  CalendarDays,
  FileText,
  GraduationCap,
  Info,
  Landmark,
  Lightbulb,
  MapPin,
  Scale,
  Stethoscope,
  Target,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
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
  colleges: College[];
  courses: Course[];
};

type JuniorConfig = {
  heroTag: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  chips: Array<{ label: string; icon: LucideIcon }>;
  topSectionTitle: string;
  topSectionSubtitle: string;
  topBadges: string[];
  topColleges: Array<{ name: string; location: string; badge: string; image: string }>;
  otherSectionTitle: string;
  otherColleges: Array<{ name: string; location: string; image: string }>;
  engagementTitle: string;
  engagementSubtitle: string;
  engagementItems: string[];
  cutoffTitle: string;
  cutoffSubtitle: string;
  cutoffBands: Array<{ label: string; score: string; progress: string }>;
  careerTitle: string;
  careerSubtitle: string;
  careerOptions: string[];
  examTitle: string;
  examSubtitle: string;
  skillCards: Array<{ title: string; description: string; chips: string[] }>;
  roadmapTitle: string;
  roadmap: Array<{ title: string; detail: string }>;
  ctaEyebrow: string;
  ctaTitle: string;
  ctaSubtitle: string;
  ctaButton: string;
};

const getCutoffScale = (degree: string, admissionType: string) => {
  if (degree === "Medical") return 720;
  if (degree === "B.Arch") return 400;
  if (degree === "Law") {
    return admissionType === "CLAT" ? 125 : 300;
  }
  if (degree === "Engineering") return 200;
  if (degree === "Agriculture") return 200;
  if (degree === "Paramedical") return 200;
  return 200;
};

const formatScoreDisplay = (value: number) => {
  if (!Number.isFinite(value)) return "";
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
};

const LEVEL11_EXAMS_BY_DEGREE: Record<string, string[]> = {
  Engineering: ["JEE Main", "JEE Advanced", "BITSAT", "VITEEE", "TNEA Counseling"],
  Medical: ["NEET UG", "AIIMS (via NEET)", "JIPMER (via NEET)", "State Medical Counseling"],
  "Arts & Science": ["CUET UG", "State University Entrance", "TANCET (PG)"],
  Law: ["CLAT", "AILET", "SLAT"],
  Agriculture: ["ICAR AIEEA (UG)", "State Agriculture Entrance", "University Counseling"],
  Nursing: ["NEET UG (B.Sc Nursing)", "State Nursing Entrance", "Nursing Counseling"],
  Paramedical: ["State Paramedical Entrance", "Health Science Counseling", "Institute Entrance Tests"],
  "B.Arch": ["NATA", "JEE Main (Paper 2)", "State Architecture Counseling"],
};

const GENERAL_EXAMS_BY_DEGREE: Record<string, string[]> = {
  Engineering: ["JEE Main", "JEE Advanced", "BITSAT", "VITEEE", "TNEA Counseling"],
  Medical: ["NEET UG", "State Medical Counseling"],
  "Arts & Science": ["CUET UG", "State University Admission"],
  Law: ["CLAT", "AILET", "SLAT"],
  Agriculture: ["ICAR AIEEA (UG)", "State Agriculture Counseling"],
  Nursing: ["NEET UG (B.Sc Nursing)", "State Nursing Counseling"],
  Paramedical: ["State Paramedical Entrance", "Health Science Counseling"],
  "B.Arch": ["NATA", "JEE Main (Paper 2)"],
};

const DEGREE_STREAM_MAP: Record<string, string[]> = {
  Engineering: ["Engineering"],
  Medical: ["Medical", "Paramedical"],
  "Arts & Science": ["Science", "Arts", "Computer Science", "Management"],
  Law: ["Law"],
  Agriculture: ["Agriculture", "Agri"],
  Nursing: ["Nursing", "Medical"],
  Paramedical: ["Paramedical", "Medical"],
  "B.Arch": ["Architecture", "Design"],
};

type DegreeOption = {
  name: "Engineering" | "Medical" | "Law" | "B.Arch" | "Arts & Science" | "Agriculture" | "Paramedical";
  accent: string;
  accentSoft: string;
  border: string;
  icon: LucideIcon;
  exam: string;
  highlight: string;
};

type EligibilitySection = {
  title: string;
  icon: LucideIcon;
  points: string[];
};

type EligibilityConfig = {
  degree: DegreeOption["name"];
  accent: string;
  accentSoft: string;
  border: string;
  icon: LucideIcon;
  headline: string;
  summary: string;
  exams: string[];
  highlight: string;
  levelMessage: string;
  levelLabel: string;
  sections: EligibilitySection[];
};

type MatchingCollegeCard = {
  id: string;
  name: string;
  location: string;
  cutoff: string;
  match: string;
  image: string;
  tags: string[];
  href: string;
  score: number;
  isBestCollege?: boolean;
};

const DEGREE_OPTIONS: DegreeOption[] = [
  {
    name: "Engineering",
    accent: "#2563eb",
    accentSoft: "rgba(37,99,235,0.1)",
    border: "rgba(37,99,235,0.22)",
    icon: Brain,
    exam: "JEE Track",
    highlight: "JEE Main + JEE Advanced pathway",
  },
  {
    name: "Medical",
    accent: "#dc2626",
    accentSoft: "rgba(220,38,38,0.1)",
    border: "rgba(220,38,38,0.22)",
    icon: Stethoscope,
    exam: "NEET Track",
    highlight: "NEET-UG mandatory eligibility",
  },
  {
    name: "Law",
    accent: "#7c3aed",
    accentSoft: "rgba(124,58,237,0.1)",
    border: "rgba(124,58,237,0.22)",
    icon: Scale,
    exam: "CLAT Track",
    highlight: "CLAT roadmap for 5-year LLB",
  },
  {
    name: "B.Arch",
    accent: "#ea580c",
    accentSoft: "rgba(234,88,12,0.1)",
    border: "rgba(234,88,12,0.22)",
    icon: Landmark,
    exam: "NATA Track",
    highlight: "NATA and JEE Paper 2 options",
  },
  {
    name: "Arts & Science",
    accent: "#0f766e",
    accentSoft: "rgba(15,118,110,0.1)",
    border: "rgba(15,118,110,0.22)",
    icon: BookOpen,
    exam: "CUET Track",
    highlight: "CUET and university admission pathway",
  },
  {
    name: "Agriculture",
    accent: "#15803d",
    accentSoft: "rgba(21,128,61,0.1)",
    border: "rgba(21,128,61,0.22)",
    icon: Target,
    exam: "ICAR Track",
    highlight: "ICAR and state agriculture counseling route",
  },
  {
    name: "Paramedical",
    accent: "#0891b2",
    accentSoft: "rgba(8,145,178,0.1)",
    border: "rgba(8,145,178,0.22)",
    icon: Stethoscope,
    exam: "Allied Health Track",
    highlight: "State counseling and allied health entrance route",
  },
];

const ELIGIBILITY_CONTENT: Record<DegreeOption["name"], Omit<EligibilityConfig, "levelMessage" | "levelLabel">> = {
  Engineering: {
    degree: "Engineering",
    accent: "#2563eb",
    accentSoft: "rgba(37,99,235,0.1)",
    border: "rgba(37,99,235,0.22)",
    icon: Brain,
    headline: "Engineering eligibility roadmap",
    summary: "Choose PCM in senior secondary and track both JEE Main and JEE Advanced if IITs are your target.",
    exams: ["JEE Main", "JEE Advanced", "IIT", "NIT"],
    highlight: "Top-performing JEE Main students unlock the IIT route through JEE Advanced.",
    sections: [
      {
        title: "JEE Main",
        icon: FileText,
        points: [
          "Eligibility: 12th pass / appearing students",
          "Stream requirement: Physics + Chemistry + Mathematics (PCM) compulsory",
          "Minimum marks: No fixed percentage required, passing 12th is enough",
          "Age limit: No strict upper age limit as per NTA rules",
          "Purpose: Admission into NITs, IIITs, GFTIs, and other engineering colleges",
        ],
      },
      {
        title: "JEE Advanced",
        icon: Award,
        points: [
          "Eligibility: Must qualify JEE Main first",
          "Rank requirement: Top ~2.5 lakh JEE Main rank holders become eligible",
          "Stream requirement: PCM compulsory in 12th",
          "Purpose: Admission into IITs",
          "Note: Only top-performing students in JEE Main can attempt this exam",
        ],
      },
    ],
  },
  Medical: {
    degree: "Medical",
    accent: "#dc2626",
    accentSoft: "rgba(220,38,38,0.1)",
    border: "rgba(220,38,38,0.22)",
    icon: Stethoscope,
    headline: "Medical eligibility roadmap",
    summary: "Medical admissions revolve around PCB subjects, NEET qualification, and category-based minimum marks.",
    exams: ["NEET", "MBBS", "BDS", "AIQ"],
    highlight: "NEET-UG qualification is the key gateway for MBBS, BDS, and allied medical admissions.",
    sections: [
      {
        title: "NEET Eligibility",
        icon: Stethoscope,
        points: [
          "Eligibility: 12th pass / appearing students",
          "Stream requirement: Physics + Chemistry + Biology (PCB) compulsory",
          "Minimum marks: General 50% in PCB, OBC/SC/ST 40%, PwD 45%",
          "Age requirement: Minimum 17 years, currently no upper age limit",
          "Exam requirement: NEET-UG qualification is mandatory for medical admission",
          "Courses eligible: MBBS, BDS, BAMS / BHMS, and selected veterinary seats",
        ],
      },
    ],
  },
  Law: {
    degree: "Law",
    accent: "#7c3aed",
    accentSoft: "rgba(124,58,237,0.1)",
    border: "rgba(124,58,237,0.22)",
    icon: Scale,
    headline: "Law eligibility roadmap",
    summary: "Law aspirants can come from any stream, but CLAT readiness and strong language aptitude matter most.",
    exams: ["CLAT", "NLUs", "5-Year LLB", "AILET"],
    highlight: "Students from Science, Commerce, or Arts can all aim for CLAT and NLU admissions.",
    sections: [
      {
        title: "CLAT Eligibility",
        icon: Scale,
        points: [
          "Eligibility: 12th pass / appearing students",
          "Stream: Any stream allowed - Science, Commerce, or Arts",
          "Minimum marks: General around 45% in 12th, SC/ST around 40%",
          "Age limit: No upper age limit",
          "Purpose: Admission into National Law Universities (NLUs)",
          "Courses: 5-year integrated LLB programs",
        ],
      },
    ],
  },
  "B.Arch": {
    degree: "B.Arch",
    accent: "#ea580c",
    accentSoft: "rgba(234,88,12,0.1)",
    border: "rgba(234,88,12,0.22)",
    icon: Landmark,
    headline: "Architecture eligibility roadmap",
    summary: "Architecture admissions usually expect Mathematics in 12th and NATA or JEE Paper 2 performance.",
    exams: ["NATA", "JEE Paper 2", "B.Arch", "Design Aptitude"],
    highlight: "Many B.Arch colleges accept NATA, while some also consider JEE Main Paper 2.",
    sections: [
      {
        title: "NATA Eligibility",
        icon: Landmark,
        points: [
          "Eligibility: 12th pass / appearing students",
          "Stream: Maths is compulsory, with PCM or PM group preferred",
          "Minimum marks: Around 50% in 12th, varies by college",
          "Age limit: No strict age restriction",
          "Purpose: Admission into B.Arch programs",
          "Note: Some colleges may also consider JEE Paper 2 instead of NATA",
        ],
      },
    ],
  },
  "Arts & Science": {
    degree: "Arts & Science",
    accent: "#0f766e",
    accentSoft: "rgba(15,118,110,0.1)",
    border: "rgba(15,118,110,0.22)",
    icon: BookOpen,
    headline: "Arts & Science eligibility roadmap",
    summary: "Admissions are typically based on 12th marks, CUET scores, and college-specific cutoffs by course.",
    exams: ["CUET UG", "State University Admissions", "Merit Quota", "Subject-Based Selection"],
    highlight: "Choose your core subjects early and build strong marks in Class 11 and 12 for top admissions.",
    sections: [
      {
        title: "CUET / Merit Eligibility",
        icon: BookOpen,
        points: [
          "Eligibility: 12th pass / appearing students",
          "Stream: Science, Commerce, and Arts streams are all eligible based on course",
          "Minimum marks: Usually 40% to 60% depending on university and reservation category",
          "Exam route: CUET UG for central universities; many state colleges follow 12th merit",
          "Purpose: Admission into BA, BSc, BCom, BBA, BCA, and related UG courses",
        ],
      },
    ],
  },
  Agriculture: {
    degree: "Agriculture",
    accent: "#15803d",
    accentSoft: "rgba(21,128,61,0.1)",
    border: "rgba(21,128,61,0.22)",
    icon: Target,
    headline: "Agriculture eligibility roadmap",
    summary: "Agriculture admissions prefer PCB/PCM backgrounds and are usually routed through ICAR or state counseling.",
    exams: ["ICAR AIEEA", "State Agri Entrance", "University Counseling", "BSc Agriculture"],
    highlight: "ICAR and state quotas open pathways into top agriculture universities and allied domains.",
    sections: [
      {
        title: "Agriculture Entrance Eligibility",
        icon: Target,
        points: [
          "Eligibility: 12th pass / appearing students",
          "Stream: PCB or PCM accepted in most institutions",
          "Minimum marks: Typically around 50% aggregate, varies by category and institute",
          "Exam route: ICAR AIEEA (UG) and state agriculture entrance or counseling",
          "Courses eligible: BSc Agriculture, Horticulture, Forestry, and Agri Engineering tracks",
        ],
      },
    ],
  },
  Paramedical: {
    degree: "Paramedical",
    accent: "#0891b2",
    accentSoft: "rgba(8,145,178,0.1)",
    border: "rgba(8,145,178,0.22)",
    icon: Stethoscope,
    headline: "Paramedical eligibility roadmap",
    summary: "Paramedical admissions are based on PCB/PCM in 12th plus state-level counseling or institute entrance rules.",
    exams: ["State Paramedical Entrance", "Allied Health Counseling", "Merit Admission", "BSc Allied Health"],
    highlight: "Strong biology and chemistry scores improve admission chances in top allied health programs.",
    sections: [
      {
        title: "Paramedical Admission Eligibility",
        icon: Stethoscope,
        points: [
          "Eligibility: 12th pass / appearing students",
          "Stream: PCB is preferred; some programs also accept PCM",
          "Minimum marks: Usually 45% to 50% depending on course and category",
          "Exam route: State paramedical entrance, counseling, or direct merit process",
          "Courses eligible: BPT, BOT, BMLT, Radiology, and other allied health sciences",
        ],
      },
    ],
  },
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
  colleges,
  courses,
}: CutoffClientProps) {
  const summaryLevel = selectedLevel || "11";
  const summaryDegree =
    (DEGREE_OPTIONS.find((option) => option.name === selectedDegree)?.name as DegreeOption["name"]) || "Engineering";
  const summaryCourse = selectedCourse || "-";
  const summarySpecialization = selectedSpecialization || "-";
  
  // Get marks from URL query parameter (if provided)
  const [userMarks] = useState<number | null>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const marksParam = params.get("marks");
      return marksParam ? Number(marksParam) : null;
    }
    return null;
  });
  
  // Use userMarks if available, otherwise use enteredCutoff
  const summaryCutoff =
    userMarks !== null ? String(userMarks) : enteredCutoff || (summaryDegree === "Law" ? "0" : "184.5");
  const cutoffMax = getCutoffScale(summaryDegree, selectedAdmissionType);
  const parsedSummaryCutoff = parseCutoffValue(summaryCutoff);
  const estimatedCutoffValue =
    userMarks ??
    (parsedSummaryCutoff
      ? Math.max(parsedSummaryCutoff.start, parsedSummaryCutoff.end)
      : Number(summaryCutoff));
  const normalizedEstimatedCutoff = Number.isFinite(estimatedCutoffValue)
    ? Math.max(0, Math.min(estimatedCutoffValue, cutoffMax))
    : NaN;
  const estimatedCutoffDisplay = Number.isFinite(normalizedEstimatedCutoff)
    ? formatScoreDisplay(normalizedEstimatedCutoff)
    : "--";
  const levelBadgeLabel =
    summaryLevel === "11" ? "11th Grade" : summaryLevel === "12" ? "12th Grade" : `Level ${summaryLevel}`;
  const percentileTag = useMemo(() => {
    if (!Number.isFinite(normalizedEstimatedCutoff) || cutoffMax <= 0) return "";
    const ratio = normalizedEstimatedCutoff / cutoffMax;
    const topPercent = Math.max(1, Math.min(99, Math.round((1 - ratio) * 100)));
    return `Top ${topPercent}% Percentile`;
  }, [cutoffMax, normalizedEstimatedCutoff]);
  const isJuniorLevel = ["6", "7", "8", "9", "10"].includes(summaryLevel);
  const resolveCategoryKey = (value: string) => {
    const normalized = normalizeText(value).replace(/[^a-z0-9]/g, "");
    if (!normalized) return "";
    const categoryMap: Record<string, string> = {
      oc: "OC",
      open: "OC",
      opencompetition: "OC",
      general: "OC",
      obc: "BC",
      backwardclass: "BC",
      bcm: "BCM",
      backwardclassmuslim: "BCM",
      mbc: "MBC",
      dnc: "MBC",
      mbcdnc: "MBC",
      mostbackwardclass: "MBC",
      sc: "SC",
      scheduledcaste: "SC",
      sca: "SCA",
      scheduledcastearunthathiyar: "SCA",
      st: "ST",
      scheduledtribe: "ST",
      ews: "OC",
    };
    return (categoryMap[normalized] || normalized).toUpperCase();
  };
  const parseSelectedCourse = (value: string) => {
    const parts = String(value || "")
      .split(" - ")
      .map((item) => item.trim())
      .filter(Boolean);
    if (parts.length === 0) return { courseType: "", specialization: "" };
    const [courseType, ...rest] = parts;
    return { courseType, specialization: rest.join(" - ") };
  };
  const streamMatches = (streams: string[], targets: string[]) => {
    const lowerStreams = streams.map((item) => item.toLowerCase());
    return targets.some((target) =>
      lowerStreams.some((stream) => stream.includes(target.toLowerCase())),
    );
  };
  const degreeTargets = DEGREE_STREAM_MAP[summaryDegree] || [];
  const availableColleges = colleges || [];
  const matchingColleges = degreeTargets.length
    ? availableColleges.filter((college) => streamMatches(college.streams, degreeTargets))
    : availableColleges;
  const topColleges = matchingColleges.filter((college) => college.isBestCollege).slice(0, 6);
  const otherColleges = matchingColleges.filter((college) => !college.isBestCollege).slice(0, 10);
  const examsForDegree =
    summaryLevel === "11"
      ? LEVEL11_EXAMS_BY_DEGREE[summaryDegree] || []
      : GENERAL_EXAMS_BY_DEGREE[summaryDegree] || [];
  const examCards = (examsForDegree.length ? examsForDegree : ["Explore entrance exams for this degree"]).map(
    (exam) => ({
      title: exam,
      date: "Check official portal",
      tag: "Recommended",
    }),
  );
  const studyPlan = [
    { title: "Maths Practice", time: "30 mins", detail: "Solve 8-10 problems" },
    { title: "Science Concepts", time: "30 mins", detail: "Revise one chapter" },
    { title: "Revision Slot", time: "20 mins", detail: "Quick recap notes" },
    { title: "Mock Questions", time: "15 mins", detail: "Try 5 mixed questions" },
  ];
  const medicalHeroImage =
    "https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?auto=format&fit=crop&w=900&q=80";
  const medicalTopColleges = [
    {
      name: "AIIMS Delhi",
      location: "New Delhi",
      badge: "Top Pick",
      image: topColleges[0]?.image || "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "JIPMER Puducherry",
      location: "Puducherry",
      badge: "NEET Leader",
      image: topColleges[1]?.image || "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "CMC Vellore",
      location: "Vellore, TN",
      badge: "Clinical Focus",
      image: topColleges[2]?.image || "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80",
    },
  ];
  const medicalOtherColleges = [
    {
      name: "Madras Medical College",
      location: "Chennai",
      image: otherColleges[0]?.image || "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=700&q=80",
    },
    {
      name: "Stanley Medical College",
      location: "Chennai",
      image: otherColleges[1]?.image || "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=700&q=80",
    },
    {
      name: "KMC Manipal",
      location: "Karnataka",
      image: otherColleges[2]?.image || "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=700&q=80",
    },
    {
      name: "SRM Medical College",
      location: "Chengalpattu",
      image: otherColleges[3]?.image || "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=700&q=80",
    },
  ];
  const medicalEngagement = [
    "Doctor shadowing sessions",
    "Hospital / clinic visits",
    "Community health camps",
    "Career talks with alumni",
  ];
  const medicalCutoffBands = [
    { label: "OC Cutoff", score: "610+", progress: "84%" },
    { label: "BC Cutoff", score: "595+", progress: "78%" },
    { label: "MBC Cutoff", score: "580+", progress: "72%" },
    { label: "SC Cutoff", score: "520+", progress: "62%" },
  ];
  const medicalCareerOptions = [
    "MBBS (Doctor)",
    "BDS (Dentist)",
    "BPT (Physiotherapist)",
    "B.Sc Nursing",
    "Pharmacy",
    "Allied Health Sciences",
  ];
  const medicalSkillCards = [
    {
      title: "Skill Builder",
      description: "Focus on biology basics, human anatomy charts, and lab observations.",
      chips: ["Biology Basics", "Lab Skills", "Health Awareness"],
    },
    {
      title: "Subject Focus",
      description: "Keep Maths & English strong along with Biology, Chemistry, Physics.",
      chips: ["Biology", "Chemistry", "Physics", "English"],
    },
  ];
  const medicalRoadmap = [
    { title: "Build Basics", detail: "6th-10th: Strong Science foundation" },
    { title: "Choose Biology", detail: "11th-12th: PCB stream focus" },
    { title: "NEET Prep", detail: "Practice + mock tests" },
    { title: "Counselling", detail: "State & AIQ rounds" },
    { title: "MBBS Start", detail: "College admissions" },
  ];
  const juniorBaseConfig: JuniorConfig = {
    heroTag: "Career Guide",
    heroTitle: `6th-10th ${summaryDegree} Career Guide`,
    heroSubtitle: "Explore colleges, exams, and skills to build early clarity.",
    heroImage: medicalHeroImage,
    chips: [
      { label: "Top Colleges", icon: Target },
      { label: "Exam Readiness", icon: CalendarDays },
      { label: "Career Options", icon: GraduationCap },
    ],
    topSectionTitle: "Top Colleges",
    topSectionSubtitle: "Based on recent trends",
    topBadges: ["Top Pick", "Popular", "Rising"],
    topColleges: medicalTopColleges,
    otherSectionTitle: "Other Popular Institutions",
    otherColleges: medicalOtherColleges,
    engagementTitle: "Exploration Program",
    engagementSubtitle: "Activities that build curiosity and confidence early.",
    engagementItems: ["Workshops", "Project fairs", "Mentor talks"],
    cutoffTitle: "Admission Benchmarks",
    cutoffSubtitle: "Typical targets for leading programs.",
    cutoffBands: [
      { label: "Top Institutes", score: "85%+", progress: "80%" },
      { label: "Strong Programs", score: "80%+", progress: "70%" },
      { label: "Core Streams", score: "75%+", progress: "60%" },
    ],
    careerTitle: "Career Options",
    careerSubtitle: "Popular pathways to explore after 12th.",
    careerOptions: ["Core Programs", "Specializations", "Emerging Fields"],
    examTitle: "Important Exams",
    examSubtitle: "Entrance exams and admissions to track.",
    skillCards: [
      {
        title: "Skill Builder",
        description: "Strengthen core academics and learning habits.",
        chips: ["Basics", "Practice", "Focus"],
      },
      {
        title: "Growth Focus",
        description: "Explore projects to sharpen interest.",
        chips: ["Projects", "Clubs", "Mentorship"],
      },
    ],
    roadmapTitle: "Your Career Roadmap",
    roadmap: [
      { title: "Build Basics", detail: "6th-8th: Strong academic base" },
      { title: "Explore Interests", detail: "8th-10th: Clubs and projects" },
      { title: "Choose Stream", detail: "11th-12th: Focus on electives" },
      { title: "Admissions", detail: "Counseling and college selection" },
    ],
    ctaEyebrow: "Opportunities",
    ctaTitle: "Start early, stay ahead.",
    ctaSubtitle: "Get a personalized plan for exams, projects, and guidance.",
    ctaButton: "Book Free Counseling",
  };
  const juniorConfigOverrides: Record<string, Partial<JuniorConfig>> = {
    Medical: {
      heroTag: "Students Guide",
      heroTitle: "6th-10th Students Medical Career Guide",
      heroSubtitle:
        "A complete roadmap to explore medical colleges, entrance exams, and career paths after 10th.",
      heroImage: medicalHeroImage,
      chips: [
        { label: "Top Medical Colleges", icon: Stethoscope },
        { label: "NEET Cutoff Insights", icon: Target },
        { label: "Career Options", icon: GraduationCap },
      ],
      topSectionTitle: "Top Medical Colleges",
      topSectionSubtitle: "Based on NEET trends",
      topBadges: ["Top Pick", "NEET Leader", "Clinical Focus"],
      topColleges: medicalTopColleges,
      otherSectionTitle: "Other Popular Institutions",
      otherColleges: medicalOtherColleges,
      engagementTitle: "Doctor Engagement Program",
      engagementSubtitle: "Hands-on exposure that helps you understand real careers early.",
      engagementItems: medicalEngagement,
      cutoffTitle: "Cutoff Percentile (For Colleges)",
      cutoffSubtitle: "Typical NEET ranges for high-demand medical colleges.",
      cutoffBands: medicalCutoffBands,
      careerTitle: "Medical Career Options",
      careerSubtitle: "Explore common medical career paths after 12th.",
      careerOptions: medicalCareerOptions,
      examTitle: "Important Exams",
      examSubtitle: "Key exams and counseling rounds to track.",
      skillCards: medicalSkillCards,
      roadmapTitle: "Your Career Roadmap",
      roadmap: medicalRoadmap,
      ctaEyebrow: "Doctor Opportunities",
      ctaTitle: "Start early, stay ahead.",
      ctaSubtitle:
        "Get a personalized plan for NEET preparation, mentorship sessions, and guidance.",
      ctaButton: "Book Free Counseling",
    },
    Engineering: {
      heroTag: "STEM Track",
      heroTitle: "6th-10th Engineering Explorer",
      heroSubtitle:
        "Build strong math and science foundations while discovering engineering pathways.",
      heroImage:
        "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=80",
      chips: [
        { label: "Tech Foundations", icon: Brain },
        { label: "JEE Readiness", icon: Target },
        { label: "Project Skills", icon: Lightbulb },
      ],
      topSectionTitle: "Top Engineering Colleges",
      topSectionSubtitle: "Based on JEE and state trends",
      topBadges: ["Top Pick", "Tech Focus", "Research Hub"],
      topColleges: [
        {
          name: "IIT Madras",
          location: "Chennai",
          badge: "Top Pick",
          image:
            "https://images.unsplash.com/photo-1519452575417-564c1401ecc0?auto=format&fit=crop&w=800&q=80",
        },
        {
          name: "NIT Trichy",
          location: "Tiruchirappalli",
          badge: "Tech Focus",
          image:
            "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=800&q=80",
        },
        {
          name: "Anna University",
          location: "Chennai",
          badge: "Research Hub",
          image:
            "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80",
        },
      ],
      otherColleges: [
        {
          name: "VIT Vellore",
          location: "Vellore, TN",
          image:
            "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=700&q=80",
        },
        {
          name: "SRM Institute of Science and Technology",
          location: "Chengalpattu, TN",
          image:
            "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=700&q=80",
        },
        {
          name: "PSG Tech",
          location: "Coimbatore, TN",
          image:
            "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=700&q=80",
        },
      ],
      engagementTitle: "Tech Exploration Program",
      engagementSubtitle: "Hands-on activities to build curiosity for engineering.",
      engagementItems: ["Robotics clubs", "STEM fairs", "Coding challenges"],
      cutoffBands: [
        { label: "Top Institutes Target", score: "95+ %ile", progress: "84%" },
        { label: "Strong State Target", score: "90+ %ile", progress: "74%" },
        { label: "Core Branches", score: "85+ %ile", progress: "64%" },
      ],
      careerTitle: "Engineering Career Options",
      careerOptions: ["Computer Science", "ECE", "Mechanical"],
      skillCards: [
        {
          title: "Skill Builder",
          description: "Strengthen Maths, Physics, and reasoning.",
          chips: ["Maths", "Physics", "Logic"],
        },
        {
          title: "Project Focus",
          description: "Build mini projects to develop design confidence.",
          chips: ["Coding", "Design", "Teamwork"],
        },
      ],
      roadmap: [
        { title: "Build Basics", detail: "6th-8th: Maths and Science" },
        { title: "Explore Tech", detail: "8th-10th: Robotics and coding" },
        { title: "Choose PCM", detail: "11th-12th: Core subjects" },
        { title: "JEE Prep", detail: "Practice + mock tests" },
      ],
      ctaEyebrow: "Engineering Opportunities",
    },
    "Arts & Science": {
      heroTag: "Core Stream",
      heroTitle: "6th-10th Arts & Science Pathway",
      heroSubtitle: "Discover academic pathways across science, commerce, and humanities.",
      heroImage:
        "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=80",
      chips: [
        { label: "CUET Readiness", icon: BookOpen },
        { label: "Research Skills", icon: Brain },
        { label: "Creative Growth", icon: Lightbulb },
      ],
      topSectionTitle: "Top Arts & Science Colleges",
      topSectionSubtitle: "Based on university trends",
      topBadges: ["Top Pick", "Research Focus", "Student Favorite"],
      topColleges: [
        {
          name: "Loyola College",
          location: "Chennai",
          badge: "Top Pick",
          image:
            "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80",
        },
        {
          name: "Madras Christian College",
          location: "Chennai",
          badge: "Research Focus",
          image:
            "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=800&q=80",
        },
        {
          name: "PSG College of Arts & Science",
          location: "Coimbatore, TN",
          badge: "Student Favorite",
          image:
            "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80",
        },
      ],
      otherColleges: [
        {
          name: "Ethiraj College for Women",
          location: "Chennai",
          image:
            "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=700&q=80",
        },
        {
          name: "Presidency College",
          location: "Chennai",
          image:
            "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=700&q=80",
        },
        {
          name: "St. Joseph's College",
          location: "Trichy, TN",
          image:
            "https://images.unsplash.com/photo-1519452575417-564c1401ecc0?auto=format&fit=crop&w=700&q=80",
        },
      ],
      engagementTitle: "Academic Exploration Program",
      engagementItems: ["Science exhibitions", "Debate club", "Writing workshops"],
      cutoffBands: [
        { label: "Top Universities", score: "90%+", progress: "82%" },
        { label: "Strong Programs", score: "85%+", progress: "72%" },
        { label: "Popular Streams", score: "80%+", progress: "62%" },
      ],
      careerTitle: "Arts & Science Options",
      careerOptions: ["B.Sc", "B.A", "B.Com"],
      skillCards: [
        {
          title: "Skill Builder",
          description: "Develop reading, writing, and analysis.",
          chips: ["Reading", "Writing", "Research"],
        },
        {
          title: "Subject Focus",
          description: "Keep Maths, Science, and English strong.",
          chips: ["Maths", "Science", "English"],
        },
      ],
      roadmap: [
        { title: "Build Basics", detail: "6th-8th: Core subjects" },
        { title: "Find Interests", detail: "8th-10th: Clubs and labs" },
        { title: "Choose Stream", detail: "11th-12th: Electives" },
        { title: "Admissions", detail: "Applications and counseling" },
      ],
    },
    Law: {
      heroTag: "Legal Track",
      heroTitle: "6th-10th Law & Public Policy Path",
      heroSubtitle: "Build critical thinking and communication skills for law.",
      heroImage:
        "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=900&q=80",
      chips: [
        { label: "CLAT Readiness", icon: Scale },
        { label: "Debate Skills", icon: Lightbulb },
        { label: "Current Affairs", icon: FileText },
      ],
      topSectionTitle: "Top Law Colleges",
      topSectionSubtitle: "Based on CLAT trends",
      topBadges: ["Top Pick", "Advocacy Focus", "Policy Hub"],
      topColleges: [
        {
          name: "NLSIU Bengaluru",
          location: "Bengaluru",
          badge: "Top Pick",
          image:
            "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80",
        },
        {
          name: "NALSAR Hyderabad",
          location: "Hyderabad",
          badge: "Advocacy Focus",
          image:
            "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=800&q=80",
        },
        {
          name: "NLU Delhi",
          location: "New Delhi",
          badge: "Policy Hub",
          image:
            "https://images.unsplash.com/photo-1519452575417-564c1401ecc0?auto=format&fit=crop&w=800&q=80",
        },
      ],
      otherColleges: [
        {
          name: "SASTRA Law School",
          location: "Thanjavur, TN",
          image:
            "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=700&q=80",
        },
        {
          name: "School of Excellence in Law",
          location: "Chennai, TN",
          image:
            "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=700&q=80",
        },
        {
          name: "Saveetha School of Law",
          location: "Chennai, TN",
          image:
            "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=700&q=80",
        },
      ],
      engagementTitle: "Legal Exploration Program",
      engagementItems: ["Mock trials", "Debate club", "Model UN"],
      cutoffBands: [
        { label: "National Law Schools", score: "90+ score", progress: "82%" },
        { label: "Top Private Law", score: "80+ score", progress: "72%" },
        { label: "State Universities", score: "70+ score", progress: "62%" },
      ],
      careerTitle: "Law Career Options",
      careerOptions: ["BA LLB", "Corporate Law", "Judiciary"],
      skillCards: [
        {
          title: "Skill Builder",
          description: "Improve reading speed, reasoning, and writing clarity.",
          chips: ["Reasoning", "Reading", "Writing"],
        },
        {
          title: "Advocacy Focus",
          description: "Practice debates and public speaking.",
          chips: ["Debate", "Speaking", "Ethics"],
        },
      ],
      roadmap: [
        { title: "Build Basics", detail: "6th-8th: Reading and comprehension" },
        { title: "Explore Law", detail: "8th-10th: Debates and mock trials" },
        { title: "Humanities Stream", detail: "11th-12th: Legal aptitude" },
        { title: "Admissions", detail: "Counseling and selection" },
      ],
    },
    Agriculture: {
      heroTag: "Green Track",
      heroTitle: "6th-10th Agriculture & Life Sciences",
      heroSubtitle: "Learn about food science, sustainability, and agriculture.",
      heroImage:
        "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=900&q=80",
      chips: [
        { label: "ICAR Readiness", icon: Target },
        { label: "Life Sciences", icon: Brain },
        { label: "Field Learning", icon: Lightbulb },
      ],
      topSectionTitle: "Top Agriculture Colleges",
      topSectionSubtitle: "Based on ICAR trends",
      topBadges: ["Top Pick", "Research Farm", "Agri Tech"],
      topColleges: [
        {
          name: "TNAU Coimbatore",
          location: "Coimbatore, TN",
          badge: "Top Pick",
          image:
            "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=800&q=80",
        },
        {
          name: "ICAR-IARI",
          location: "New Delhi",
          badge: "Research Farm",
          image:
            "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=800&q=80",
        },
        {
          name: "PJTSAU",
          location: "Hyderabad",
          badge: "Agri Tech",
          image:
            "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=800&q=80",
        },
      ],
      otherColleges: [
        {
          name: "Annamalai University",
          location: "Chidambaram, TN",
          image:
            "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=700&q=80",
        },
        {
          name: "TNAU Madurai",
          location: "Madurai, TN",
          image:
            "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=700&q=80",
        },
        {
          name: "Kerala Agricultural University",
          location: "Thrissur, KL",
          image:
            "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=700&q=80",
        },
      ],
      engagementTitle: "Agri Exploration Program",
      engagementItems: ["Farm visits", "Plant lab sessions", "Soil testing"],
      cutoffBands: [
        { label: "Top Universities", score: "85%+", progress: "78%" },
        { label: "Strong Programs", score: "80%+", progress: "70%" },
        { label: "Core Streams", score: "75%+", progress: "62%" },
      ],
      careerTitle: "Agriculture Career Options",
      careerOptions: ["B.Sc Agriculture", "Horticulture", "Food Technology"],
      skillCards: [
        {
          title: "Skill Builder",
          description: "Develop biology basics and environmental awareness.",
          chips: ["Biology", "Environment", "Research"],
        },
        {
          title: "Field Focus",
          description: "Engage in field observations and sustainability projects.",
          chips: ["Fieldwork", "Sustainability", "Data"],
        },
      ],
      roadmap: [
        { title: "Build Basics", detail: "6th-8th: Biology and environment" },
        { title: "Explore Agri", detail: "8th-10th: Field visits and labs" },
        { title: "Choose PCB", detail: "11th-12th: Life science focus" },
        { title: "Admissions", detail: "Counseling and selection" },
      ],
    },
    Paramedical: {
      heroTag: "Health Track",
      heroTitle: "6th-10th Paramedical & Health Track",
      heroSubtitle: "Explore allied health careers that support patient care.",
      heroImage:
        "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=900&q=80",
      chips: [
        { label: "Health Sciences", icon: Stethoscope },
        { label: "Skill Training", icon: Target },
        { label: "Care Pathways", icon: GraduationCap },
      ],
      topSectionTitle: "Top Paramedical Colleges",
      topSectionSubtitle: "Based on health science trends",
      topBadges: ["Top Pick", "Clinical Focus", "Skills Hub"],
      topColleges: [
        {
          name: "CMC Vellore",
          location: "Vellore, TN",
          badge: "Top Pick",
          image:
            "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80",
        },
        {
          name: "Sri Ramachandra Institute",
          location: "Chennai, TN",
          badge: "Clinical Focus",
          image:
            "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=80",
        },
        {
          name: "JSS Medical College",
          location: "Mysuru, KA",
          badge: "Skills Hub",
          image:
            "https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?auto=format&fit=crop&w=800&q=80",
        },
      ],
      otherColleges: [
        {
          name: "KMC Manipal",
          location: "Karnataka",
          image:
            "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=700&q=80",
        },
        {
          name: "SRM Medical College",
          location: "Chengalpattu, TN",
          image:
            "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=700&q=80",
        },
        {
          name: "Amrita Institute of Medical Sciences",
          location: "Kochi, KL",
          image:
            "https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?auto=format&fit=crop&w=700&q=80",
        },
      ],
      engagementTitle: "Health Exploration Program",
      engagementItems: ["First aid training", "Health camps", "Hospital visits"],
      cutoffBands: [
        { label: "Top Institutes", score: "85%+", progress: "78%" },
        { label: "Strong Programs", score: "80%+", progress: "70%" },
        { label: "Core Streams", score: "75%+", progress: "62%" },
      ],
      careerTitle: "Paramedical Career Options",
      careerOptions: ["Physiotherapy", "Radiology", "Lab Technology"],
      skillCards: [
        {
          title: "Skill Builder",
          description: "Strengthen biology basics and communication.",
          chips: ["Biology", "Health", "Communication"],
        },
        {
          title: "Care Focus",
          description: "Understand patient care and teamwork.",
          chips: ["Empathy", "Teamwork", "Safety"],
        },
      ],
      roadmap: [
        { title: "Build Basics", detail: "6th-8th: Science and health basics" },
        { title: "Explore Health", detail: "8th-10th: First aid and clinics" },
        { title: "Choose PCB", detail: "11th-12th: Life science focus" },
        { title: "Admissions", detail: "Counseling and selection" },
      ],
    },
    "B.Arch": {
      heroTag: "Design Track",
      heroTitle: "6th-10th Architecture & Design Track",
      heroSubtitle: "Develop creativity, spatial thinking, and design basics early.",
      heroImage:
        "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=900&q=80",
      chips: [
        { label: "Design Basics", icon: Lightbulb },
        { label: "Drawing Skills", icon: BookOpen },
        { label: "NATA Readiness", icon: Target },
      ],
      topSectionTitle: "Top Architecture Colleges",
      topSectionSubtitle: "Based on NATA trends",
      topBadges: ["Top Pick", "Studio Focus", "Design Hub"],
      topColleges: [
        {
          name: "SPA Delhi",
          location: "New Delhi",
          badge: "Top Pick",
          image:
            "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80",
        },
        {
          name: "CEPT University",
          location: "Ahmedabad",
          badge: "Studio Focus",
          image:
            "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&w=800&q=80",
        },
        {
          name: "Anna University",
          location: "Chennai",
          badge: "Design Hub",
          image:
            "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80",
        },
      ],
      otherColleges: [
        {
          name: "School of Architecture & Planning",
          location: "Chennai, TN",
          image:
            "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=700&q=80",
        },
        {
          name: "SRM School of Architecture",
          location: "Chengalpattu, TN",
          image:
            "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&w=700&q=80",
        },
        {
          name: "BMS College of Architecture",
          location: "Bengaluru, KA",
          image:
            "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=700&q=80",
        },
      ],
      engagementTitle: "Design Exploration Program",
      engagementItems: ["Sketching practice", "Model making", "Portfolio building"],
      cutoffBands: [
        { label: "Top Schools", score: "120+ NATA", progress: "82%" },
        { label: "Strong Programs", score: "100+ NATA", progress: "72%" },
        { label: "Core Institutes", score: "90+ NATA", progress: "62%" },
      ],
      careerTitle: "Architecture Career Options",
      careerOptions: ["Architecture", "Interior Design", "Urban Planning"],
      skillCards: [
        {
          title: "Skill Builder",
          description: "Develop drawing, geometry, and visualization skills.",
          chips: ["Drawing", "Geometry", "Creativity"],
        },
        {
          title: "Design Focus",
          description: "Work on mini models and design thinking exercises.",
          chips: ["Model Making", "Design", "Portfolio"],
        },
      ],
      roadmap: [
        { title: "Build Basics", detail: "6th-8th: Drawing and geometry" },
        { title: "Explore Design", detail: "8th-10th: Sketching and models" },
        { title: "Choose PCM", detail: "11th-12th: Focus on NATA" },
        { title: "Admissions", detail: "Counseling and selection" },
      ],
    },
  };
  const resolvedJuniorConfig: JuniorConfig = {
    ...juniorBaseConfig,
    ...(juniorConfigOverrides[summaryDegree] || {}),
  };
  const resolveLocation = (college: College) =>
    [college.district, college.state].filter(Boolean).join(", ") || "Location not listed";
  const topBadges = resolvedJuniorConfig.topBadges.length
    ? resolvedJuniorConfig.topBadges
    : ["Top Pick", "Popular", "Rising"];
  const resolvedTopColleges = topColleges.length
    ? topColleges.slice(0, 3).map((college, index) => ({
        name: college.name,
        location: resolveLocation(college),
        badge: topBadges[index] ?? "Top Pick",
        image:
          college.image ||
          resolvedJuniorConfig.topColleges[index]?.image ||
          resolvedJuniorConfig.heroImage,
      }))
    : resolvedJuniorConfig.topColleges;
  const resolvedOtherColleges = otherColleges.length
    ? otherColleges.slice(0, 3).map((college, index) => ({
        name: college.name,
        location: resolveLocation(college),
        image:
          college.image ||
          resolvedJuniorConfig.otherColleges[index]?.image ||
          resolvedJuniorConfig.heroImage,
      }))
    : resolvedJuniorConfig.otherColleges;
  const subjectTips: Record<number, string> = {
    1: "Start with basics and short daily practice.",
    2: "Revise core topics with simple examples.",
    3: "Good progress - add more practice questions.",
    4: "Strong - start timed problem sets.",
    5: "Excellent - help peers or teach-back.",
  };
  const [subjectRatings, setSubjectRatings] = useState({
    Maths: 3,
    Science: 3,
    English: 3,
  });
  const quizOptionsByQuestion = [
    [
      { label: "I enjoy solving problems and building things", track: "Engineering" },
      { label: "I like helping people and learning about health", track: "Medical" },
      { label: "I enjoy creativity, reading, or social topics", track: "Arts" },
      { label: "I like justice, rules, and helping people with rights", track: "Law" },
    ],
    [
      { label: "I like fixing gadgets or understanding how machines work", track: "Engineering" },
      { label: "I am curious about biology and how the body works", track: "Medical" },
      { label: "I enjoy writing, debating, or storytelling", track: "Arts" },
      { label: "I like debating, public speaking, and fairness", track: "Law" },
    ],
    [
      { label: "I like building apps, models, or simple experiments", track: "Engineering" },
      { label: "I want a career where I can help patients", track: "Medical" },
      { label: "I enjoy design, art, or creative projects", track: "Arts" },
      { label: "I want to work on cases and solve disputes", track: "Law" },
    ],
  ];
  const [quizAnswers, setQuizAnswers] = useState([0, 0, 0]);
  const quizScores = quizAnswers.reduce(
    (acc, answerIndex) => {
      const optionsForQuestion = quizOptionsByQuestion[acc.__index] || [];
      const picked = optionsForQuestion[answerIndex]?.track;
      if (picked) acc[picked] = (acc[picked] || 0) + 1;
      acc.__index += 1;
      return acc;
    },
    { Engineering: 0, Medical: 0, Arts: 0, Law: 0, __index: 0 } as Record<string, number>,
  );
  const quizResult = Object.entries(quizScores)
    .filter(([key]) => key !== "__index")
    .sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Engineering";
  const [scoreInput, setScoreInput] = useState("");
  const [showAllMatching, setShowAllMatching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [locationSearchInput, setLocationSearchInput] = useState("");
  const [selectedCollegeTypeFilter, setSelectedCollegeTypeFilter] = useState<"all" | "government" | "private">("all");
  const scoreValue = Number(scoreInput);
  const resolvedScore = Number.isFinite(scoreValue) ? scoreValue : NaN;
  const levelResult = useMemo(() => {
    if (!Number.isFinite(resolvedScore)) {
      return { level: "-", label: "Enter a score", tip: "Start with Maths + Science basics." };
    }
    if (resolvedScore >= 90) return { level: "10", label: "Top Performer", tip: "Keep a steady revision plan." };
    if (resolvedScore >= 80) return { level: "8", label: "Very Good", tip: "Practice weekly tests." };
    if (resolvedScore >= 60) return { level: "6", label: "Good", tip: "Focus on tricky topics daily." };
    if (resolvedScore >= 40) return { level: "4", label: "Needs Improvement", tip: "Spend extra time on basics." };
    return { level: "4", label: "Needs Improvement", tip: "Ask for help and revise fundamentals." };
  }, [resolvedScore]);

  const { matchingCards, aimHigherCards } = useMemo(() => {
    if (!courses.length || !colleges.length) {
      return { matchingCards: [], aimHigherCards: [] };
    }
    const categoryKey = resolveCategoryKey(selectedCategory);
    const normalizedCollegeType = normalizeText(selectedCollegeType);
    const normalizeCollegeType = (value: string) => {
      const normalized = normalizeText(value);
      if (!normalized) return "";
      if (
        normalized.includes("government") ||
        normalized.includes("govt") ||
        normalized.includes("public") ||
        normalized.includes("state")
      ) {
        return "government";
      }
      if (
        normalized.includes("private") ||
        normalized.includes("self") ||
        normalized.includes("deemed")
      ) {
        return "private";
      }
      return normalized;
    };
    const selectedCollegeTypeKey = normalizeCollegeType(normalizedCollegeType);
    const { courseType: selectedCourseType, specialization: selectedCourseSpecialization } =
      parseSelectedCourse(selectedCourse);
    const normalizeMatchText = (value: string | null | undefined) =>
      normalizeText(value).replace(/[^a-z0-9]/g, "");
    const normalizedCourseSearch = normalizeMatchText(selectedCourse);
    const normalizedCourseType = normalizeMatchText(selectedCourseType);
    const normalizedSpecialization = normalizeMatchText(
      selectedSpecialization || selectedCourseSpecialization,
    );
    const userCutoff = parseCutoffValue(enteredCutoff);
    const userScore = userMarks !== null ? userMarks : userCutoff ? Math.max(userCutoff.start, userCutoff.end) : null;
    const localDegreeTargets = DEGREE_STREAM_MAP[summaryDegree] || [];
    const degreeTokens = (localDegreeTargets.length ? localDegreeTargets : [summaryDegree]).map((value) =>
      normalizeText(value),
    );
    const formatGap = (value: number) => {
      if (!Number.isFinite(value)) return "";
      const rounded = Math.round(value * 10) / 10;
      return Number.isInteger(rounded) ? `${rounded}` : rounded.toFixed(1);
    };

    const resolveCutoffByCategory = (
      entries: Array<{ category: string; cutoff: string }> | undefined,
      category: string,
    ) => {
      if (!entries?.length || !category) return "";
      const resolved = entries.find(
        (entry) => resolveCategoryKey(entry.category) === resolveCategoryKey(category),
      );
      return resolved?.cutoff || "";
    };

    const matchesDegree = (course: Course) => {
      if (!degreeTokens[0]) return true;
      const haystack = [
        course.stream,
        course.courseCategory,
        course.degreeType,
        course.courseType,
      ]
        .map((value) => normalizeText(value))
        .join(" ");
      return degreeTokens.some((token) => token && haystack.includes(token));
    };

    const matchesCourseSelection = (course: Course) => {
      if (!normalizedCourseSearch && !normalizedCourseType && !normalizedSpecialization) {
        return true;
      }
      const courseName = normalizeMatchText(course.course || course.courseName || "");
      const courseType = normalizeMatchText(course.courseType || course.course || "");
      const specialization = normalizeMatchText(
        course.specialization || course.courseName || course.courseCategory || "",
      );
      const combinedCourse = `${courseType}${specialization}`;
      if (normalizedCourseSearch) {
        if (courseName && courseName.includes(normalizedCourseSearch)) return true;
        if (combinedCourse && combinedCourse.includes(normalizedCourseSearch)) return true;
        if (normalizedCourseSearch.includes(courseName) && courseName) return true;
      }
      if (normalizedCourseType && courseType.includes(normalizedCourseType)) {
        if (!normalizedSpecialization) return true;
        return specialization.includes(normalizedSpecialization);
      }
      if (normalizedSpecialization && specialization.includes(normalizedSpecialization)) return true;
      return false;
    };

    const matchesCollegeType = (college: College) => {
      if (!selectedCollegeTypeKey) return true;
      const ownership = normalizeCollegeType(college.ownershipType || "");
      if (ownership && ownership.includes(selectedCollegeTypeKey)) return true;
      if (college.quotas?.length) {
        return college.quotas.some((quota) =>
          normalizeCollegeType(quota).includes(selectedCollegeTypeKey),
        );
      }
      if (!ownership && (!college.quotas || college.quotas.length === 0)) {
        return true;
      }
      return false;
    };

    const matchingMap = new Map<string, MatchingCollegeCard>();
    const aimHigherMap = new Map<
      string,
      {
        id: string;
        name: string;
        location: string;
        require: string;
        need: string;
        image: string;
        href: string;
        gap: number;
      }
    >();

    courses.forEach((course) => {
      const courseSelectionMatch = matchesCourseSelection(course);
      const degreeMatch = matchesDegree(course);
      // If a specific course is selected, it must match that course
      if (normalizedCourseSearch && !courseSelectionMatch) return;
      // Otherwise, check degree match
      if (!degreeMatch) return;
      const courseDetails =
        course.collegeDetails && course.collegeDetails.length > 0
          ? course.collegeDetails
          : [
              {
                college: course.collegeId || course.college,
                cutoff: course.cutoff,
                cutoffByCategory: course.cutoffByCategory || [],
              },
            ];

      courseDetails.forEach((detail) => {
        const collegeKey = normalizeText(detail.college || "");
        if (!collegeKey) return;
        const college = colleges.find(
          (item) =>
            normalizeText(item.id) === collegeKey ||
            normalizeText(item.name) === collegeKey ||
            normalizeText(item.university) === collegeKey,
        );
        if (!college) return;
        if (!matchesCollegeType(college)) return;

        const categoryCutoff =
          resolveCutoffByCategory(detail.cutoffByCategory, categoryKey) ||
          resolveCutoffByCategory(course.cutoffByCategory, categoryKey);
        const rawCutoff =
          categoryCutoff ||
          detail.cutoffText ||
          course.cutoffText ||
          detail.cutoff ||
          course.cutoff;
        const parsedCutoff = parseCutoffValue(rawCutoff);
        const cutoffLabel = parsedCutoff
          ? parsedCutoff.start === parsedCutoff.end
            ? `${parsedCutoff.start}`
            : `${parsedCutoff.start} - ${parsedCutoff.end}`
          : rawCutoff
            ? String(rawCutoff)
            : "N/A";

        const aimHigherTarget =
          parsedCutoff && college.isBestCollege
            ? Math.max(parsedCutoff.start, parsedCutoff.end)
            : null;

        if (userScore !== null && aimHigherTarget !== null && userScore < aimHigherTarget) {
          const gap = aimHigherTarget - userScore;
          const requireText = categoryKey
            ? `Best college target: ${categoryKey} ${cutoffLabel}`
            : `Best college target: ${cutoffLabel}`;
          const needText = `+${formatGap(gap)} marks`;
          const existingTarget = aimHigherMap.get(college.id);
          if (!existingTarget || gap < existingTarget.gap) {
            aimHigherMap.set(college.id, {
              id: college.id,
              name: college.name,
              location: [college.district, college.state].filter(Boolean).join(", "),
              require: requireText,
              need: needText,
              image: college.image,
              href: `/college/${college.id}`,
              gap,
            });
          }
        }

        if (userScore !== null && parsedCutoff && userScore < parsedCutoff.start) {
          return;
        }

        const target = parsedCutoff ? parsedCutoff.end : null;
        const ratio = userScore !== null && target ? userScore / target : 0.75;
        const score = Math.max(55, Math.min(99, Math.round(ratio * 100)));

        const tags = [
          course.courseType || course.courseCategory || summaryDegree,
          course.specialization || course.courseName,
          categoryKey ? `${categoryKey} Cutoff` : "",
        ]
          .map((tag) => String(tag || "").trim())
          .filter(Boolean)
          .slice(0, 3);

        const existing = matchingMap.get(college.id);
        if (!existing || score > existing.score) {
          const cardData = {
            id: college.id,
            name: college.name,
            location: [college.district, college.state].filter(Boolean).join(", "),
            cutoff: cutoffLabel,
            match: `${score}% Match`,
            image: college.image,
            tags,
            href: `/college/${college.id}`,
            score,
            isBestCollege: Boolean(college.isBestCollege),
          };
          matchingMap.set(college.id, cardData);
        }
      });
    });

    return {
      matchingCards: Array.from(matchingMap.values())
        .sort((a, b) => b.score - a.score)
        .slice(0, 6),
      aimHigherCards: Array.from(aimHigherMap.values())
        .sort((a, b) => a.gap - b.gap)
        .slice(0, 4),
    };
  }, [
    colleges,
    courses,
    enteredCutoff,
    selectedCategory,
    selectedCollegeType,
    selectedCourse,
    selectedSpecialization,
    summaryDegree,
    userMarks,
  ]);
  const closestAimGap = aimHigherCards[0]?.gap;
  const closestAimGapText =
    typeof closestAimGap === "number" && Number.isFinite(closestAimGap)
      ? `${Math.round(closestAimGap * 10) / 10}`
      : "";

  // Get unique locations from colleges
  const uniqueLocations = Array.from(
    new Set(
      colleges
        .map((c) => c.district)
        .filter(Boolean)
        .map((d) => String(d).trim())
    )
  ).sort();

  // Filter locations based on search input
  const filteredLocations = useMemo(() => {
    const searchLower = locationSearchInput.toLowerCase();
    return uniqueLocations.filter((loc) => loc.toLowerCase().includes(searchLower));
  }, [locationSearchInput, uniqueLocations]);

  const activeDegreeOption =
    DEGREE_OPTIONS.find((option) => option.name === summaryDegree) || DEGREE_OPTIONS[0];
  const activeEligibility = useMemo<EligibilityConfig>(() => {
    const baseConfig = ELIGIBILITY_CONTENT[summaryDegree as DegreeOption["name"]] || ELIGIBILITY_CONTENT.Engineering;
    return {
      ...baseConfig,
      levelLabel: `Class ${summaryLevel} guidance`,
      levelMessage: `For Class ${summaryLevel}, this degree-specific exam eligibility roadmap highlights the right entrance path and preparation focus.`,
    };
  }, [summaryDegree, summaryLevel]);
  const ActiveEligibilityIcon = activeEligibility.icon;

  // Apply location and college type filtering to matching colleges
  const filteredMatchingCards = useMemo(() => {
    let filtered = matchingCards;

    // Apply location filter
    if (selectedLocation) {
      filtered = filtered.filter(
        (college: MatchingCollegeCard) =>
          college.location.toLowerCase().includes(selectedLocation.toLowerCase()) ||
          colleges.find((c) => c.id === college.id)?.district?.toLowerCase() === selectedLocation.toLowerCase()
      );
    }

    // Apply college type filter
    if (selectedCollegeTypeFilter !== "all" && selectedLocation) {
      filtered = filtered.filter((college: MatchingCollegeCard) => {
        const collegeData = colleges.find((c) => c.id === college.id);
        const ownership = collegeData?.ownershipType?.toLowerCase() || "";
        if (selectedCollegeTypeFilter === "government") {
          return ownership.includes("government") || ownership.includes("govt");
        } else if (selectedCollegeTypeFilter === "private") {
          return ownership.includes("private");
        }
        return true;
      });
    }

    // Remove duplicates by ID
    return Array.from(new Map(filtered.map((c: MatchingCollegeCard) => [c.id, c])).values());
  }, [matchingCards, selectedLocation, selectedCollegeTypeFilter, colleges]);

  if (isJuniorLevel) {
    return (
      <section
        className="min-h-screen bg-[#f5f8ff] text-[color:var(--text-dark)]"
        style={
          {
            "--brand-primary": "#5FA0E6",
            "--brand-primary-soft": "#7bb3f0",
            "--text-dark": "#0f172a",
            "--text-muted": "rgba(15,23,42,0.64)",
          } as CSSProperties
        }
      >
        <Navbar />
        <div className="page-container-full py-8 md:py-10">
          <h2 className="mb-8 text-4xl font-bold text-[color:var(--text-dark)]">Career Guidance</h2>
          <section className="rounded-[1.8rem] border border-[rgba(95,160,230,0.12)] bg-white p-6 shadow-[0_18px_40px_rgba(95,160,230,0.12)] md:p-8">
            <div className="grid items-center gap-6 lg:grid-cols-[1.45fr_1fr]">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--brand-primary)]">
                  {resolvedJuniorConfig.heroTag}
                </div>
                <h1 className="mt-3 text-2xl font-bold text-[color:var(--text-dark)] md:text-3xl">
                  {resolvedJuniorConfig.heroTitle}
                </h1>
                <p className="mt-2 max-w-xl text-sm text-[color:var(--text-muted)] md:text-base">
                  {resolvedJuniorConfig.heroSubtitle}
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {resolvedJuniorConfig.chips.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center gap-2 rounded-full border border-[rgba(95,160,230,0.16)] bg-[rgba(95,160,230,0.08)] px-3 py-2 text-xs font-semibold text-[color:var(--text-dark)]"
                    >
                      <item.icon className="size-3.5 text-[color:var(--brand-primary)]" />
                      {item.label}
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative h-56 overflow-hidden rounded-3xl border border-[rgba(95,160,230,0.12)] bg-[rgba(95,160,230,0.06)] md:h-64 lg:h-72">
                <Image
                  src={resolvedJuniorConfig.heroImage}
                  alt={resolvedJuniorConfig.heroTitle}
                  fill
                  sizes="(min-width: 1024px) 420px, 100vw"
                  className="object-cover"
                />
              </div>
            </div>
          </section>

          <section className="mt-6 overflow-hidden rounded-[1.7rem] border p-5 shadow-[0_18px_38px_rgba(15,76,129,0.08)] transition duration-300 md:p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(15,76,129,0.08)] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--brand-primary)] shadow-[0_10px_22px_rgba(15,76,129,0.06)]">
                  <Lightbulb className="size-3.5" />
                  Exam Eligibility
                </div>
                <h2 className="mt-3 text-2xl font-bold tracking-[-0.03em] text-[color:var(--text-dark)]">
                  {summaryDegree} exam eligibility
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-7 text-[color:var(--text-muted)]">
                  This section shows exam eligibility details mapped to the degree selected in the cutoff form.
                </p>
              </div>
              <div
                className="rounded-full px-4 py-2 text-xs font-semibold shadow-[0_10px_24px_rgba(15,76,129,0.08)]"
                style={{
                  color: activeDegreeOption.accent,
                  backgroundColor: activeDegreeOption.accentSoft,
                }}
              >
                {activeEligibility.levelLabel}
              </div>
            </div>

            <div
              className="mt-5 overflow-hidden rounded-[1.5rem] border p-5 shadow-[0_14px_28px_rgba(15,76,129,0.08)]"
              style={{
                borderColor: activeEligibility.border,
                background: `linear-gradient(180deg, ${activeEligibility.accentSoft}, rgba(255,255,255,0.98))`,
              }}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-3xl">
                  <div
                    className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]"
                    style={{ backgroundColor: "#fff", color: activeEligibility.accent }}
                  >
                    <ActiveEligibilityIcon className="size-3.5" />
                    {activeEligibility.degree} Eligibility Panel
                  </div>
                  <h3 className="mt-3 text-xl font-bold tracking-[-0.02em] text-[color:var(--text-dark)]">
                    {activeEligibility.headline}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-[color:var(--text-muted)]">{activeEligibility.summary}</p>
                  <p className="mt-3 rounded-[1.1rem] bg-white/80 px-4 py-3 text-sm font-medium text-[color:var(--text-dark)]">
                    {activeEligibility.levelMessage}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {activeEligibility.exams.map((exam) => (
                      <span
                        key={exam}
                        className="rounded-full border px-3 py-1.5 text-[11px] font-semibold"
                        style={{
                          color: activeEligibility.accent,
                          borderColor: activeEligibility.border,
                          backgroundColor: "#fff",
                        }}
                      >
                        {exam}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="w-full max-w-sm rounded-[1.2rem] border border-white/70 bg-white/85 p-4 shadow-[0_14px_28px_rgba(15,76,129,0.06)]">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[color:var(--text-dark)]">
                    <Info className="size-4" style={{ color: activeEligibility.accent }} />
                    Quick Snapshot
                  </div>
                  <p className="mt-3 text-sm leading-7 text-[color:var(--text-muted)]">{activeEligibility.highlight}</p>
                  <div className="mt-4 space-y-2">
                    <div className="rounded-[1rem] border border-[rgba(15,76,129,0.08)] bg-[rgba(248,250,252,0.95)] px-3 py-2.5 text-xs font-semibold text-[color:var(--text-dark)]">
                      Class Focus: Foundation + stream awareness
                    </div>
                    <div className="rounded-[1rem] border border-[rgba(15,76,129,0.08)] bg-[rgba(248,250,252,0.95)] px-3 py-2.5 text-xs font-semibold text-[color:var(--text-dark)]">
                      Target Exam: {activeDegreeOption.exam}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-6 rounded-[1.6rem] border border-[rgba(95,160,230,0.12)] bg-white p-6 shadow-[0_16px_32px_rgba(95,160,230,0.08)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-base font-semibold text-[color:var(--text-dark)]">
                <Target className="size-4 text-[color:var(--brand-primary)]" />
                {resolvedJuniorConfig.topSectionTitle}
              </div>
              <span className="text-xs font-semibold text-[color:var(--text-muted)]">
                {resolvedJuniorConfig.topSectionSubtitle}
              </span>
            </div>
            <div className="mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 pr-2">
              {resolvedTopColleges.map((college) => (
                <article
                  key={college.name}
                  className="min-w-[260px] snap-start overflow-hidden rounded-2xl border border-[rgba(95,160,230,0.12)] bg-white shadow-[0_12px_24px_rgba(95,160,230,0.08)] sm:min-w-[300px] lg:min-w-[320px]"
                >
                  <div className="relative h-36 w-full bg-[rgba(95,160,230,0.08)]">
                    <Image
                      src={college.image}
                      alt={college.name}
                      fill
                      sizes="(min-width: 1024px) 320px, (min-width: 640px) 45vw, 100vw"
                      className="object-cover"
                    />
                    <span className="absolute left-3 top-3 rounded-full bg-[rgba(95,160,230,0.16)] px-2.5 py-1 text-[10px] font-semibold text-[color:var(--brand-primary)]">
                      {college.badge}
                    </span>
                  </div>
                  <div className="p-4">
                    <div className="text-sm font-semibold text-[color:var(--text-dark)]">{college.name}</div>
                    <div className="mt-1 flex items-center gap-1 text-xs text-[color:var(--text-muted)]">
                      <MapPin className="size-3" />
                      {college.location}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-6 rounded-[1.6rem] border border-[rgba(95,160,230,0.12)] bg-white p-6 shadow-[0_16px_32px_rgba(95,160,230,0.08)]">
            <div className="text-sm font-semibold text-[color:var(--text-dark)]">
              {resolvedJuniorConfig.otherSectionTitle}
            </div>
            <div className="mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 pr-2">
              {resolvedOtherColleges.map((college) => (
                <article
                  key={college.name}
                  className="min-w-[240px] snap-start overflow-hidden rounded-2xl border border-[rgba(95,160,230,0.12)] bg-white shadow-[0_10px_20px_rgba(95,160,230,0.06)] sm:min-w-[280px] lg:min-w-[300px]"
                >
                  <div className="relative h-28 w-full bg-[rgba(95,160,230,0.08)]">
                    <Image
                      src={college.image}
                      alt={college.name}
                      fill
                      sizes="(min-width: 1024px) 260px, (min-width: 640px) 45vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <div className="text-sm font-semibold text-[color:var(--text-dark)]">{college.name}</div>
                    <div className="mt-1 text-xs text-[color:var(--text-muted)]">{college.location}</div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[1.6rem] border border-[rgba(95,160,230,0.12)] bg-white p-6 shadow-[0_16px_32px_rgba(95,160,230,0.08)]">
              <div className="flex items-center gap-2 text-base font-semibold text-[color:var(--text-dark)]">
                <Award className="size-4 text-[color:var(--brand-primary)]" />
                {resolvedJuniorConfig.engagementTitle}
              </div>
              <p className="mt-2 text-sm text-[color:var(--text-muted)]">
                {resolvedJuniorConfig.engagementSubtitle}
              </p>
              <div className="mt-4 space-y-3 text-sm text-[color:var(--text-dark)]">
                {resolvedJuniorConfig.engagementItems.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-xl border border-[rgba(95,160,230,0.12)] bg-[rgba(95,160,230,0.06)] px-3 py-2"
                  >
                    <Target className="size-4 text-[color:var(--brand-primary)]" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.6rem] border border-[rgba(95,160,230,0.12)] bg-white p-6 shadow-[0_16px_32px_rgba(95,160,230,0.08)]">
              <div className="flex items-center gap-2 text-base font-semibold text-[color:var(--text-dark)]">
                <TrendingUp className="size-4 text-[color:var(--brand-primary)]" />
                {resolvedJuniorConfig.cutoffTitle}
              </div>
              <p className="mt-2 text-xs text-[color:var(--text-muted)]">
                {resolvedJuniorConfig.cutoffSubtitle}
              </p>
              <div className="mt-4 space-y-3">
                {resolvedJuniorConfig.cutoffBands.map((band) => (
                  <div
                    key={band.label}
                    className="rounded-xl border border-[rgba(95,160,230,0.12)] bg-[rgba(95,160,230,0.06)] p-3"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-[color:var(--text-dark)]">
                      <span>{band.label}</span>
                      <span>{band.score}</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-[rgba(95,160,230,0.12)]">
                      <div
                        className="h-2 rounded-full bg-[linear-gradient(90deg,#22c55e,#16a34a)]"
                        style={{ width: band.progress }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-xl border border-[rgba(95,160,230,0.14)] bg-white p-3 text-xs text-[color:var(--text-muted)]">
                Enter your latest school % to see your level:
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <label className="flex items-center gap-2 rounded-full border border-[rgba(95,160,230,0.14)] bg-[rgba(95,160,230,0.06)] px-3 py-2 text-xs text-[color:var(--text-dark)]">
                    <Calculator className="size-3.5 text-[color:var(--brand-primary)]" />
                    %
                    <input
                      type="number"
                      min={0}
                      max={100}
                      inputMode="numeric"
                      value={scoreInput}
                      onChange={(event) => setScoreInput(event.target.value)}
                      placeholder="78"
                      className="w-14 bg-transparent text-[color:var(--text-dark)] outline-none"
                    />
                  </label>
                  <span className="rounded-full bg-[rgba(95,160,230,0.12)] px-3 py-1 text-[11px] font-semibold text-[color:var(--text-dark)]">
                    Level {levelResult.level} - {levelResult.label}
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[1.6rem] border border-[rgba(95,160,230,0.12)] bg-white p-6 shadow-[0_16px_32px_rgba(95,160,230,0.08)]">
              <div className="flex items-center gap-2 text-base font-semibold text-[color:var(--text-dark)]">
                <GraduationCap className="size-4 text-[color:var(--brand-primary)]" />
                {resolvedJuniorConfig.careerTitle}
              </div>
              <p className="mt-2 text-xs text-[color:var(--text-muted)]">
                {resolvedJuniorConfig.careerSubtitle}
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {resolvedJuniorConfig.careerOptions.map((option) => (
                  <div
                    key={option}
                    className="flex items-center gap-2 rounded-xl border border-[rgba(29,78,216,0.12)] bg-[rgba(29,78,216,0.06)] px-3 py-2 text-xs font-semibold text-[color:var(--text-dark)]"
                  >
                    <Target className="size-3.5 text-[color:var(--brand-primary)]" />
                    {option}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.6rem] border border-[rgba(29,78,216,0.12)] bg-white p-6 shadow-[0_16px_32px_rgba(29,78,216,0.08)]">
              <div className="flex items-center gap-2 text-base font-semibold text-[color:var(--text-dark)]">
                <CalendarDays className="size-4 text-[color:var(--brand-primary)]" />
                {resolvedJuniorConfig.examTitle}
              </div>
              <p className="mt-2 text-xs text-[color:var(--text-muted)]">
                {resolvedJuniorConfig.examSubtitle}
              </p>
              <div className="mt-4 space-y-3">
                {examCards.map((exam) => (
                  <div
                    key={exam.title}
                    className="rounded-xl border border-[rgba(29,78,216,0.12)] bg-[rgba(29,78,216,0.04)] p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-semibold text-[color:var(--text-dark)]">{exam.title}</div>
                      <span className="rounded-full bg-[rgba(29,78,216,0.12)] px-2 py-0.5 text-[10px] font-semibold text-[color:var(--brand-primary)]">
                        {exam.tag}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-[color:var(--text-muted)]">{exam.date}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-6 grid gap-6 lg:grid-cols-2">
            {resolvedJuniorConfig.skillCards.map((card) => (
              <div
                key={card.title}
                className="rounded-[1.6rem] border border-[rgba(29,78,216,0.12)] bg-white p-6 shadow-[0_16px_32px_rgba(29,78,216,0.08)]"
              >
                <div className="flex items-center gap-2 text-base font-semibold text-[color:var(--text-dark)]">
                  <BookOpen className="size-4 text-[color:var(--brand-primary)]" />
                  {card.title}
                </div>
                <p className="mt-2 text-xs text-[color:var(--text-muted)]">{card.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {card.chips.map((chip) => (
                    <span
                      key={chip}
                      className="rounded-full border border-[rgba(29,78,216,0.14)] bg-[rgba(29,78,216,0.08)] px-3 py-1 text-[10px] font-semibold text-[color:var(--text-dark)]"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </section>

          <section className="mt-6 rounded-[1.6rem] border border-[rgba(29,78,216,0.12)] bg-white p-6 shadow-[0_16px_32px_rgba(29,78,216,0.08)]">
            <div className="text-sm font-semibold text-[color:var(--text-dark)]">
              {resolvedJuniorConfig.roadmapTitle}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {resolvedJuniorConfig.roadmap.map((step, index) => (
                <div
                  key={step.title}
                  className="rounded-xl border border-[rgba(29,78,216,0.12)] bg-[rgba(29,78,216,0.04)] p-3"
                >
                  <div className="text-xs font-semibold text-[color:var(--brand-primary)]">Step {index + 1}</div>
                  <div className="mt-1 text-sm font-semibold text-[color:var(--text-dark)]">{step.title}</div>
                  <div className="mt-1 text-xs text-[color:var(--text-muted)]">{step.detail}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-6 overflow-hidden rounded-[1.6rem] border border-[rgba(29,78,216,0.2)] bg-[linear-gradient(120deg,#1d4ed8,#60a5fa)] p-6 text-white shadow-[0_18px_40px_rgba(29,78,216,0.25)]">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[rgba(255,255,255,0.7)]">
                  {resolvedJuniorConfig.ctaEyebrow}
                </div>
                <div className="mt-2 text-xl font-semibold">{resolvedJuniorConfig.ctaTitle}</div>
                <p className="mt-2 max-w-xl text-sm text-[rgba(255,255,255,0.8)]">
                  {resolvedJuniorConfig.ctaSubtitle}
                </p>
              </div>
              <button
                type="button"
                className="rounded-full bg-white px-5 py-2 text-xs font-semibold text-[color:#1d4ed8]"
              >
                {resolvedJuniorConfig.ctaButton}
              </button>
            </div>
          </section>
        </div>
      </section>
    );
  }

  return (
    <section
      className="min-h-screen bg-white text-[color:var(--text-dark)]"
      style={
        {
          "--brand-primary": "#3B82F6",
          "--brand-primary-soft": "#60A5FA",
        } as CSSProperties
      }
    >
      <Navbar />
      <div className="page-container-full py-10 md:py-12">
        <div className="space-y-6">
            <section className="relative overflow-hidden rounded-[2.4rem] border border-[rgba(147,197,253,0.7)] bg-[radial-gradient(circle_at_top_left,rgba(186,230,253,0.95)_0%,rgba(56,189,248,0.9)_26%,rgba(37,99,235,0.96)_68%,rgba(29,78,216,1)_100%)] p-6 text-white shadow-[0_28px_70px_rgba(59,130,246,0.22)] md:p-8">
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.22)_0%,rgba(255,255,255,0.04)_34%,rgba(255,255,255,0)_55%)]" />
              <div className="pointer-events-none absolute -left-24 top-10 h-56 w-56 rounded-full bg-[rgba(255,255,255,0.18)] blur-3xl" />
              <div className="pointer-events-none absolute -bottom-16 right-40 h-56 w-56 rounded-full bg-[rgba(147,197,253,0.22)] blur-3xl" />
              <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="max-w-2xl">
                  <span className="inline-flex rounded-full border border-[rgba(147,197,253,0.45)] bg-[linear-gradient(135deg,rgba(217,249,157,0.9),rgba(187,247,208,0.84))] px-4 py-1.5 text-[13px] font-semibold text-[#163d6b] shadow-[0_8px_18px_rgba(15,23,42,0.12)]">
                    Current Analysis
                  </span>
                  <div className="mt-6 text-4xl font-black tracking-[-0.04em] text-white drop-shadow-[0_6px_18px_rgba(15,23,42,0.26)] md:text-6xl">
                    Level: <span className="italic text-white">{levelBadgeLabel}</span>
                  </div>
                  <div className="mt-6 h-px w-full max-w-3xl bg-[linear-gradient(90deg,rgba(255,255,255,0.32),rgba(255,255,255,0.08))]" />
                  <p className="mt-6 max-w-2xl text-base leading-8 text-[rgba(255,255,255,0.92)] md:text-[1.05rem]">
                    Based on your selected degree and current score, here is your estimated cutoff view for 2026.
                  </p>
                </div>

                <div className="min-w-[290px] rounded-[2rem] border border-[rgba(255,255,255,0.62)] bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(239,246,255,0.88))] p-6 text-center text-[color:var(--text-dark)] shadow-[0_22px_42px_rgba(15,23,42,0.18)] backdrop-blur">
                  <div className="text-[14px] font-medium uppercase tracking-[0.22em] text-[#2c5ea7]">
                    Estimated Cutoff
                  </div>
                  <div className="mx-auto mt-4 h-px w-full bg-[linear-gradient(90deg,rgba(59,130,246,0),rgba(59,130,246,0.18),rgba(59,130,246,0))]" />
                  <div className="mt-6 text-5xl font-black leading-none tracking-[-0.05em] text-[#225ea8] md:text-6xl">
                    {estimatedCutoffDisplay}
                    <span className="ml-2 text-2xl font-bold text-[#204d8f] md:text-3xl">/ {cutoffMax}</span>
                  </div>
                  {percentileTag ? (
                    <div className="mt-6 inline-flex items-center rounded-full bg-[linear-gradient(135deg,#2f7df6,#1d4ed8)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(37,99,235,0.28)]">
                      <TrendingUp className="mr-2 size-4" />
                      {percentileTag}
                    </div>
                  ) : null}
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-[2rem] border border-[rgba(15,76,129,0.1)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(243,248,255,0.98))] p-5 shadow-[0_22px_48px_rgba(15,76,129,0.08)] md:p-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(15,76,129,0.08)] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--brand-primary)] shadow-[0_10px_22px_rgba(15,76,129,0.06)]">
                    <Lightbulb className="size-3.5" />
                    Exam Eligibility
                  </div>
                  <h2 className="mt-3 text-2xl font-bold tracking-[-0.03em] text-[color:var(--text-dark)]">
                    {summaryDegree} exam eligibility
                  </h2>
                  <p className="mt-2 max-w-3xl text-sm leading-7 text-[color:var(--text-muted)]">
                    This section shows the eligibility path for your selected degree from the cutoff form.
                  </p>
                </div>
                <div
                  className="rounded-full px-4 py-2 text-xs font-semibold shadow-[0_10px_24px_rgba(15,76,129,0.08)]"
                  style={{
                    color: activeDegreeOption.accent,
                    backgroundColor: activeDegreeOption.accentSoft,
                  }}
                >
                  {activeEligibility.levelLabel}
                </div>
              </div>

              <div
                className="mt-5 overflow-hidden rounded-[1.7rem] border p-5 shadow-[0_18px_38px_rgba(15,76,129,0.08)] transition duration-300"
                style={{
                  borderColor: activeEligibility.border,
                  background: `linear-gradient(180deg, ${activeEligibility.accentSoft}, rgba(255,255,255,0.98))`,
                }}
              >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="max-w-3xl">
                    <div
                      className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]"
                      style={{ backgroundColor: "#fff", color: activeEligibility.accent }}
                    >
                      <ActiveEligibilityIcon className="size-3.5" />
                      {activeEligibility.degree} Eligibility Panel
                    </div>
                    <h3 className="mt-3 text-2xl font-bold tracking-[-0.03em] text-[color:var(--text-dark)]">
                      {activeEligibility.headline}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-[color:var(--text-muted)]">{activeEligibility.summary}</p>
                    <p className="mt-3 rounded-[1.2rem] bg-white/80 px-4 py-3 text-sm font-medium text-[color:var(--text-dark)]">
                      {activeEligibility.levelMessage}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {activeEligibility.exams.map((exam) => (
                        <span
                          key={exam}
                          className="rounded-full border px-3 py-1.5 text-[11px] font-semibold"
                          style={{
                            color: activeEligibility.accent,
                            borderColor: activeEligibility.border,
                            backgroundColor: "#fff",
                          }}
                        >
                          {exam}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="w-full max-w-sm rounded-[1.4rem] border border-white/70 bg-white/85 p-4 shadow-[0_14px_28px_rgba(15,76,129,0.06)]">
                    <div className="flex items-center gap-2 text-sm font-semibold text-[color:var(--text-dark)]">
                      <Info className="size-4" style={{ color: activeEligibility.accent }} />
                      Quick Snapshot
                    </div>
                    <p className="mt-3 text-sm leading-7 text-[color:var(--text-muted)]">{activeEligibility.highlight}</p>
                    <div className="mt-4 space-y-2">
                      <div className="rounded-[1rem] border border-[rgba(15,76,129,0.08)] bg-[rgba(248,250,252,0.95)] px-3 py-2.5 text-xs font-semibold text-[color:var(--text-dark)]">
                        Class Focus: {summaryLevel === "11" || summaryLevel === "12" ? "Subject alignment + exam strategy" : "Foundation + stream awareness"}
                      </div>
                      <div className="rounded-[1rem] border border-[rgba(15,76,129,0.08)] bg-[rgba(248,250,252,0.95)] px-3 py-2.5 text-xs font-semibold text-[color:var(--text-dark)]">
                        Target Exam: {activeDegreeOption.exam}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 xl:grid-cols-2">
                  {activeEligibility.sections.map((section) => {
                    const SectionIcon = section.icon;
                    return (
                      <article
                        key={section.title}
                        className="rounded-[1.4rem] border bg-white/90 p-5 shadow-[0_16px_30px_rgba(15,76,129,0.06)]"
                        style={{ borderColor: activeEligibility.border }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-11 w-11 items-center justify-center rounded-2xl"
                            style={{ backgroundColor: activeEligibility.accentSoft, color: activeEligibility.accent }}
                          >
                            <SectionIcon className="size-5" />
                          </div>
                          <div>
                            <h4 className="text-base font-bold text-[color:var(--text-dark)]">{section.title}</h4>
                            <p className="text-xs text-[color:var(--text-muted)]">Eligibility essentials</p>
                          </div>
                        </div>
                        <div className="mt-4 space-y-2.5">
                          {section.points.map((point) => (
                            <div
                              key={point}
                              className="flex gap-3 rounded-[1rem] border border-[rgba(15,76,129,0.08)] bg-[rgba(248,250,252,0.92)] px-3 py-2.5"
                            >
                              <span
                                className="mt-1 block h-2.5 w-2.5 flex-shrink-0 rounded-full"
                                style={{ backgroundColor: activeEligibility.accent }}
                              />
                              <p className="text-sm leading-6 text-[color:var(--text-dark)]">{point}</p>
                            </div>
                          ))}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            </section>
            <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
              {/* Important Exams Section */}
              <section className="rounded-[1.6rem] border border-[rgba(29,78,216,0.12)] bg-white p-6 shadow-[0_16px_32px_rgba(29,78,216,0.08)]">
                <div className="flex items-center gap-2 text-base font-semibold text-[color:var(--text-dark)]">
                  <CalendarDays className="size-4 text-[#3B82F6]" />
                  Important Exams
                </div>
                <p className="mt-2 text-sm text-[color:var(--text-muted)]">
                  Entrance exams and admissions to track.
                </p>
                <div className="mt-4 space-y-3">
                  {examsForDegree.map((exam) => (
                    <div
                      key={exam}
                      className="rounded-xl border border-[rgba(29,78,216,0.12)] bg-[rgba(29,78,216,0.04)] p-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-semibold text-[color:var(--text-dark)]">{exam}</div>
                        <span className="rounded-full bg-[rgba(29,78,216,0.12)] px-2 py-0.5 text-[10px] font-semibold text-[#3B82F6]">
                          Recommended
                        </span>
                      </div>
                      <div className="mt-2 text-xs text-[color:var(--text-muted)]">Check official portal</div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-[1.6rem] border border-[rgba(30,79,163,0.12)] bg-white p-6 shadow-[0_18px_40px_rgba(30,79,163,0.08)]">
                <div className="flex items-center gap-2 text-base font-semibold text-[color:var(--text-dark)]">
                  <Target className="size-4 text-[color:var(--brand-primary)]" />
                  Counselling Steps
                </div>
                <p className="mt-2 text-sm text-[color:var(--text-muted)]">
                  Follow these steps to secure your college seat
                </p>

                <div className="mt-6 space-y-4">
                  {[
                    { step: 1, title: "Register for Counselling", desc: "Sign up with your exam score and category on official portal" },
                    { step: 2, title: "Fill College Choices", desc: "Select colleges in your preferred order of merit" },
                    { step: 3, title: "Lock Preferences", desc: "Confirm and lock your college choice order" },
                    { step: 4, title: "Seat Allotment", desc: "Check allotment results based on cutoff and merit" },
                    { step: 5, title: "Report to College", desc: "Complete verification and report at allotted college" },
                  ].map((item) => (
                    <div key={item.step} className="flex gap-4">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#3B82F6,#60A5FA)] text-sm font-bold text-white shadow-[0_4px_12px_rgba(59,130,246,0.3)]">
                        {item.step}
                      </div>
                      <div className="flex-1 py-1">
                        <div className="text-sm font-semibold text-[color:var(--text-dark)]">{item.title}</div>
                        <p className="mt-1 text-xs text-[color:var(--text-muted)]">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-2xl border border-[rgba(30,79,163,0.12)] bg-[rgba(59,130,246,0.05)] p-4">
                  <p className="text-xs font-semibold text-[color:var(--text-dark)]">
                    ℹ️ Time Management Tip
                  </p>
                  <p className="mt-2 text-xs text-[color:var(--text-muted)]">
                    Plan ahead! Counselling rounds typically happen within 2-4 weeks of exam results. Keep your documents ready.
                  </p>
                </div>
              </section>
            </div>

            <section className="rounded-[1.6rem] border border-[rgba(59,130,246,0.12)] bg-gradient-to-br from-[rgba(59,130,246,0.05)] to-[rgba(37,99,235,0.05)] p-6 shadow-[0_18px_40px_rgba(59,130,246,0.08)]">
              <div className="flex items-center gap-2 text-base font-semibold text-[color:var(--text-dark)]">
                <MapPin className="size-4 text-[#3B82F6]" />
                Find Colleges By Location
              </div>
              <p className="mt-2 text-sm text-[color:var(--text-muted)]">
                Search and select a location to discover colleges near you
              </p>

              {/* Location Search Input */}
              <div className="mt-4">
                <input
                  type="text"
                  placeholder="Search locations..."
                  value={locationSearchInput}
                  onChange={(e) => setLocationSearchInput(e.target.value)}
                  className="w-full rounded-2xl border-2 border-[rgba(59,130,246,0.2)] bg-white px-4 py-2.5 text-sm font-semibold text-[color:var(--text-dark)] placeholder-[color:var(--text-muted)] transition focus:border-[#3B82F6] focus:outline-none focus:ring-2 focus:ring-[rgba(59,130,246,0.2)]"
                />
              </div>

              {/* Location Buttons */}
              <div className="mt-4 grid gap-2 md:grid-cols-4">
                <button
                  type="button"
                  onClick={() => setSelectedLocation("")}
                  className={`rounded-2xl border-2 px-4 py-3 text-sm font-semibold transition ${
                    !selectedLocation
                      ? "border-[#3B82F6] bg-[#3B82F6] text-white shadow-[0_4px_12px_rgba(59,130,246,0.4)]"
                      : "border-[rgba(59,130,246,0.2)] bg-white text-[color:var(--text-dark)] hover:border-[#3B82F6] hover:bg-[rgba(59,130,246,0.05)]"
                  }`}
                >
                  All Colleges
                </button>
                {filteredLocations.length > 0 ? (
                  filteredLocations.map((location) => (
                    <button
                      key={location}
                      onClick={() => setSelectedLocation(selectedLocation === location ? "" : location)}
                      className={`rounded-2xl border-2 px-4 py-3 text-sm font-semibold transition ${
                        selectedLocation === location
                          ? "border-[#3B82F6] bg-[#3B82F6] text-white shadow-[0_4px_12px_rgba(59,130,246,0.4)]"
                          : "border-[rgba(59,130,246,0.2)] bg-white text-[color:var(--text-dark)] hover:border-[#3B82F6] hover:bg-[rgba(59,130,246,0.05)]"
                      }`}
                    >
                      <MapPin className="mb-1 inline size-3" /> {location}
                    </button>
                  ))
                ) : locationSearchInput ? (
                  <p className="col-span-full text-center text-sm text-[color:var(--text-muted)]">
                    No locations found matching &quot;{locationSearchInput}&quot;
                  </p>
                ) : null}
              </div>

              {/* College Type Filter */}
              {selectedLocation && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-widest text-[color:var(--text-muted)]">
                    Filter by College Type
                  </p>
                  <div className="flex gap-2">
                    {(["all", "government", "private"] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setSelectedCollegeTypeFilter(type)}
                        className={`rounded-full px-4 py-2 text-xs font-semibold transition capitalize ${
                          selectedCollegeTypeFilter === type
                            ? "bg-[#3B82F6] text-white shadow-[0_4px_12px_rgba(59,130,246,0.4)]"
                            : "border border-[rgba(59,130,246,0.2)] bg-white text-[color:var(--text-dark)] hover:border-[#3B82F6] hover:bg-[rgba(59,130,246,0.05)]"
                        }`}
                      >
                        {type === "all" ? "All Colleges" : `${type} Colleges`}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </section>

            <section className="mt-10 rounded-[1.6rem] border border-[rgba(30,79,163,0.12)] bg-white p-6 shadow-[0_18px_40px_rgba(30,79,163,0.08)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-base font-semibold text-[color:var(--text-dark)]">
                  <Target className="size-4 text-[color:var(--brand-primary)]" />
                  {selectedLocation
                    ? `Colleges Matching Your Cutoff in ${selectedLocation}`
                    : "Colleges Matching Your Cutoff"}
                </div>
                <button
                  type="button"
                  onClick={() => setShowAllMatching(!showAllMatching)}
                  className="rounded-full border border-[rgba(30,79,163,0.3)] px-3 py-1 text-xs font-semibold text-[color:var(--brand-primary)] transition hover:bg-[rgba(30,79,163,0.08)]"
                >
                  {showAllMatching ? "Show Less" : "View All Matching"}
                </button>
              </div>
              <p className="mt-2 text-sm text-[color:var(--text-muted)]">
                {selectedLocation
                  ? `Colleges aligned with your cutoff in ${selectedLocation}`
                  : "Colleges aligned with your current estimated score"}
              </p>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {(showAllMatching ? filteredMatchingCards : filteredMatchingCards.slice(0, 3)).length ? (
                  (showAllMatching ? filteredMatchingCards : filteredMatchingCards.slice(0, 3)).map((college) => (
                    <article
                      key={college.id}
                      className="flex h-full flex-col overflow-hidden rounded-2xl border border-[rgba(15,76,129,0.08)] bg-white shadow-[0_12px_26px_rgba(15,76,129,0.08)]"
                    >
                      <div className="relative h-[190px] w-full bg-[rgba(15,76,129,0.08)]">
                        <Image
                          src={college.image}
                          alt={`${college.name} campus`}
                          fill
                          sizes="(min-width: 1024px) 300px, (min-width: 768px) 30vw, 100vw"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex h-full flex-col p-4">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <h3 className="text-sm font-semibold text-[color:var(--text-dark)]">{college.name}</h3>
                            <div className="mt-1 flex items-center gap-1 text-xs text-[color:var(--text-muted)]">
                              <MapPin className="size-3" />
                              {college.location || "Location not listed"}
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center justify-end gap-2">
                            {college.isBestCollege ? (
                              <span className="rounded-full bg-[linear-gradient(135deg,#f59e0b,#f97316)] px-2.5 py-1 text-[10px] font-bold text-white shadow-[0_8px_16px_rgba(249,115,22,0.22)]">
                                Best College
                              </span>
                            ) : null}
                            <span className="rounded-full bg-[linear-gradient(135deg,#10b981,#059669)] px-3 py-1 text-[10px] font-bold text-white shadow-[0_8px_16px_rgba(16,185,129,0.22)]">
                              {college.match}
                            </span>
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {college.tags.map((tag: string, index: number) => (
                            <span
                              key={`${college.id}-${tag}-${index}`}
                              className="rounded-full border border-[rgba(15,76,129,0.12)] bg-[rgba(15,76,129,0.04)] px-2 py-0.5 text-[10px] font-semibold text-[color:var(--text-muted)]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="mt-auto flex items-center justify-between pt-4 text-[11px] text-[color:var(--text-muted)]">
                          <span>
                            Avg Cutoff{" "}
                            <span className="font-semibold text-[color:var(--text-dark)]">{college.cutoff}</span>
                          </span>
                          <Link href={college.href} className="font-semibold text-[color:var(--brand-primary)]">
                            Details <ArrowUpRight className="ml-1 inline size-3" />
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))
                ) : selectedLocation ? (
                  <div className="col-span-full rounded-2xl border-2 border-dashed border-[rgba(59,130,246,0.3)] bg-[rgba(59,130,246,0.05)] p-8 text-center">
                    <MapPin className="mx-auto mb-3 size-8 text-[rgba(59,130,246,0.4)]" />
                    <h3 className="text-base font-semibold text-[color:var(--text-dark)]">
                      No colleges found in {selectedLocation}
                    </h3>
                    <p className="mt-2 text-sm text-[color:var(--text-muted)]">
                      No colleges found in this location for your cutoff score.{" "}
                      {selectedCollegeTypeFilter !== "all" && `Try selecting "All Colleges" instead of just ${selectedCollegeTypeFilter} colleges.`}
                    </p>
                  </div>
                ) : (
                  <div className="col-span-full text-center text-sm text-[color:var(--text-muted)]">
                    No matching colleges found for the selected course and cutoff.
                  </div>
                )}
              </div>
            </section>

            <section className="mt-10 rounded-[1.6rem] border border-[rgba(30,79,163,0.12)] bg-white p-6 shadow-[0_18px_40px_rgba(30,79,163,0.08)]">
              <div className="flex items-center gap-2 text-base font-semibold text-[color:var(--text-dark)]">
                <Award className="size-4 text-[color:var(--brand-primary)]" />
                Best Picks For You
              </div>
              <p className="mt-2 text-sm text-[color:var(--text-muted)]">
                Top recommended colleges based on your cutoff score
              </p>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {(() => {
                  const bestMarkedColleges = matchingCards.filter((college: MatchingCollegeCard) => college.isBestCollege);
                  const displayCards =
                    bestMarkedColleges.length > 0
                      ? bestMarkedColleges.slice(0, 3)
                      : matchingCards.slice(0, 3);
                  return displayCards.length ? (
                    displayCards.map((college: MatchingCollegeCard) => (
                    <article
                      key={college.id}
                      className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-[rgba(95,160,230,0.16)] bg-gradient-to-br from-white to-[rgba(95,160,230,0.04)] shadow-[0_12px_26px_rgba(95,160,230,0.12)]"
                    >
                      <div className="absolute -right-2 -top-2 rounded-full bg-[linear-gradient(135deg,#fbbf24,#f97316)] px-3 py-1 text-[11px] font-bold text-white shadow-[0_4px_12px_rgba(251,191,36,0.3)]">
                        ⭐ Best
                      </div>
                      <div className="relative h-[190px] w-full bg-[rgba(30,79,163,0.08)]">
                        <Image
                          src={college.image}
                          alt={`${college.name} campus`}
                          fill
                          sizes="(min-width: 1024px) 300px, (min-width: 768px) 30vw, 100vw"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex h-full flex-col p-4">
                        <h3 className="pr-6 text-sm font-semibold text-[color:var(--text-dark)]">{college.name}</h3>
                        <div className="mt-1 flex items-center gap-1 text-xs text-[color:var(--text-muted)]">
                          <MapPin className="size-3" />
                          {college.location || "Location not listed"}
                        </div>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {college.tags.slice(0, 2).map((tag: string, index: number) => (
                            <span
                              key={`${college.id}-${tag}-${index}`}
                              className="rounded-full border border-[rgba(95,160,230,0.16)] bg-[rgba(95,160,230,0.08)] px-2 py-0.5 text-[10px] font-semibold text-[color:var(--brand-primary)]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="mt-auto flex items-center justify-between border-t border-[rgba(30,79,163,0.08)] pt-3 text-[11px] text-[color:var(--text-muted)]">
                          <span className="font-semibold text-[color:var(--text-dark)]">{college.match}</span>
                          <Link href={college.href} className="font-semibold text-[color:var(--brand-primary)]">
                            View <ArrowUpRight className="ml-1 inline size-3" />
                          </Link>
                        </div>
                      </div>
                    </article>
                    ))
                  ) : (
                    <p className="col-span-full text-sm text-[color:var(--text-muted)]">
                      No colleges yet. Enter your cutoff to see recommendations.
                    </p>
                  );
                })()}
              </div>
            </section>

            <section className="hidden mt-10 rounded-[1.6rem] border border-[rgba(30,79,163,0.12)] bg-white p-6 shadow-[0_18px_40px_rgba(30,79,163,0.08)]">
              <div className="flex items-center gap-2 text-base font-semibold text-[color:var(--text-dark)]">
                <Target className="size-4 text-[color:var(--brand-primary)]" />
                Counselling Steps
              </div>
              <p className="mt-2 text-sm text-[color:var(--text-muted)]">
                Follow these steps to secure your college seat
              </p>

              <div className="mt-6 space-y-4">
                {[
                  { step: 1, title: "Register for Counselling", desc: "Sign up with your exam score and category on official portal" },
                  { step: 2, title: "Fill College Choices", desc: "Select colleges in your preferred order of merit" },
                  { step: 3, title: "Lock Preferences", desc: "Confirm and lock your college choice order" },
                  { step: 4, title: "Seat Allotment", desc: "Check allotment results based on cutoff and merit" },
                  { step: 5, title: "Report to College", desc: "Complete verification and report at allotted college" },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#3B82F6,#60A5FA)] text-sm font-bold text-white shadow-[0_4px_12px_rgba(59,130,246,0.3)]">
                      {item.step}
                    </div>
                    <div className="flex-1 py-1">
                      <div className="text-sm font-semibold text-[color:var(--text-dark)]">{item.title}</div>
                      <p className="mt-1 text-xs text-[color:var(--text-muted)]">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-[rgba(30,79,163,0.12)] bg-[rgba(59,130,246,0.05)] p-4">
                <p className="text-xs font-semibold text-[color:var(--text-dark)]">
                  ℹ️ Time Management Tip
                </p>
                <p className="mt-2 text-xs text-[color:var(--text-muted)]">
                  Plan ahead! Counselling rounds typically happen within 2-4 weeks of exam results. Keep your documents ready.
                </p>
              </div>
            </section>

            {summaryLevel === "11" ? (
              <section className="rounded-[1.6rem] border border-[rgba(30,79,163,0.12)] bg-[rgba(228,237,255,0.7)] p-6 shadow-[0_18px_40px_rgba(30,79,163,0.08)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-base font-semibold text-[color:var(--text-dark)]">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[rgba(30,79,163,0.12)]">
                        <Target className="size-4 text-[color:rgb(30,79,163)]" />
                      </div>
                      Aim Higher: Tier 1 Targets
                    </div>
                    <p className="mt-2 text-sm text-[color:var(--text-muted)]">
                      Boost your marks to unlock these premium institutions
                    </p>
                  </div>
                  <button
                    type="button"
                    className="rounded-full bg-[color:var(--brand-primary)] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[color:var(--brand-primary-soft)]"
                  >
                    Get Study Roadmap
                  </button>
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {aimHigherCards.length ? (
                    aimHigherCards.map((college) => (
                      <article
                        key={college.id}
                        className="rounded-2xl border border-[rgba(15,76,129,0.1)] bg-white p-4 shadow-[0_10px_24px_rgba(15,76,129,0.06)]"
                      >
                        <div className="flex items-start gap-3">
                          <div className="relative h-14 w-14 overflow-hidden rounded-xl border border-[rgba(15,76,129,0.12)] bg-[rgba(15,76,129,0.08)]">
                            <Image
                              src={college.image}
                              alt={college.name}
                              fill
                              sizes="56px"
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-[color:var(--text-dark)]">{college.name}</div>
                            <div className="mt-1 flex items-center gap-1 text-xs text-[color:var(--text-muted)]">
                              <MapPin className="size-3" />
                              {college.location || "Location not listed"}
                            </div>
                            <span className="mt-2 inline-flex rounded-full bg-[rgba(30,79,163,0.14)] px-2.5 py-1 text-[10px] font-semibold text-[color:#5FA0E6]">
                              {college.require}
                            </span>
                          </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between text-[11px] text-[color:var(--text-muted)]">
                          <span className="font-semibold text-[color:var(--text-dark)]">Need {college.need}</span>
                          <Link href={college.href} className="font-semibold text-[color:var(--brand-primary)]">
                            Preparation Guide
                          </Link>
                        </div>
                      </article>
                    ))
                  ) : (
                    <p className="text-sm text-[color:var(--text-muted)]">
                      You are already in range for the top colleges listed for your selection.
                    </p>
                  )}
                </div>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[rgba(15,76,129,0.08)] bg-white p-4">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 overflow-hidden rounded-full border border-[rgba(15,76,129,0.12)] bg-[rgba(15,76,129,0.08)]">
                      <Image src="/student.png" alt="Mentor" fill sizes="40px" className="object-cover" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[color:var(--text-dark)]">Academic Improvement Plan</div>
                      <div className="text-xs text-[color:var(--text-muted)]">
                        {closestAimGapText
                          ? `Our mentors can help you bridge the ${closestAimGapText} mark gap.`
                          : "Our mentors can help you set a goal-based improvement plan."}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="rounded-full bg-[color:var(--brand-primary)] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[color:var(--brand-primary-soft)]"
                  >
                    Get Study Roadmap
                  </button>
                </div>
              </section>
            ) : null}
        </div>
      </div>
    </section>
  );
}
