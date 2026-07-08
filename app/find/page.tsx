"use client";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { type ReactNode, startTransition, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BadgeCheck,
  ArrowRight,
  Brain,
  BookOpen,
  Compass,
  Check,
  CalendarDays,
  CircleAlert,
  BarChart3,
  Building2,
  Calculator,
  ChevronDown,
  Clock,
  Globe,
  FlaskConical,
  GraduationCap,
  Landmark,
  LayoutGrid,
  List,
  Laptop,
  MapPin,
  RotateCcw,
  Phone,
  Sparkles,
  Search,
  School,
  Scale,
  Award,
  Sprout,
  Stethoscope,
  Trophy,
  User,
  Users,
  X,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { CollegeLogoBadge } from "@/components/college-logo-badge";
import { FindAuthModal } from "@/components/find-auth-modal";
import { CutoffClient } from "@/app/cutoff/cutoff-client";
import { readAuthToken, readCurrentUser, type SafeAuthUser } from "@/lib/auth-storage";
import { request } from "@/lib/api";
import { parseCutoffValue } from "@/lib/cutoff-utils";
import { formatRankingRangeForDisplay } from "@/lib/ranking-utils";
import {
  degreeOptions,
  engineeringCourseOptions,
  medicalCourseOptions,
  normalizeText,
  type College,
  type Course,
} from "@/lib/site-data";

const categoryOptions = [
  { value: "OC", label: "OC / General" },
  { value: "BC", label: "BC" },
  { value: "BCM", label: "BCM" },
  { value: "MBC", label: "MBC / DNC" },
  { value: "SC", label: "SC" },
  { value: "SCA", label: "SCA" },
  { value: "ST", label: "ST" },
];

const normalizeCategorySelection = (value: string) => {
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

const levelOptions = [
  { value: "6", icon: GraduationCap },
  { value: "7", icon: BookOpen },
  { value: "8", icon: Compass },
  { value: "9", icon: Globe },
  { value: "10", icon: Laptop },
  { value: "11", icon: FlaskConical },
  { value: "12", icon: Award },
];
const formatLevelLabel = (level: string) => `Grade ${level}`;
const assessmentLevelOptions = new Set(["6", "7", "8", "9", "10"]);
const levelHighlights = [
  {
    icon: BadgeCheck,
    title: "Personalized Recommendations",
  },
  {
    icon: BarChart3,
    title: "Accurate Assessment",
  },
  {
    icon: Award,
    title: "Best Course Matching",
  },
];

const hiddenMedicalPreviewBranches = new Set([
  "Medical Laboratory Technology - Clinical Hematology",
  "Medical Laboratory Technology - Clinical Pathology",
  "Medical Laboratory Technology - Clinical Microbiology",
  "Medical Laboratory Technology - Clinical Biochemistry",
]);

const degreePreviewDetails: Record<
  string,
  {
    duration: string;
    scoreScale: string;
    image: string;
    accentLabel: string;
  }
> = {
  Engineering: {
    duration: "4 Years",
    scoreScale: "200 Marks",
    image: "/find-step-stream-illustration.png",
    accentLabel: "Engineering",
  },
  "B.Arch": {
    duration: "5 Years",
    scoreScale: "200 Marks",
    image: "/find-step-stream-illustration.png",
    accentLabel: "Architecture",
  },
  "Arts & Science": {
    duration: "3 Years",
    scoreScale: "100 Marks",
    image: "/find-step-stream-illustration.png",
    accentLabel: "Arts & Science",
  },
  Medical: {
    duration: "5.5 Years",
    scoreScale: "720 Marks",
    image: "/find-step-stream-illustration.png",
    accentLabel: "Medical",
  },
  Law: {
    duration: "5 Years",
    scoreScale: "300 Marks",
    image: "/find-step-stream-illustration.png",
    accentLabel: "Law",
  },
  Agriculture: {
    duration: "4 Years",
    scoreScale: "200 Marks",
    image: "/find-step-stream-illustration.png",
    accentLabel: "Agriculture",
  },
  Paramedical: {
    duration: "3 Years",
    scoreScale: "200 Marks",
    image: "/find-step-stream-illustration.png",
    accentLabel: "Paramedical",
  },
};

const stateOptions = [
  "Tamil Nadu",
  "Kerala",
  "Karnataka",
  "Andhra Pradesh",
  "Telangana",
  "Puducherry",
];

const lawCourseOptions = ["LLB", "BA LLB", "BBA LLB", "LLM"];

const lawAdmissionTypeOptions = [
  { value: "11th/12th Mark", label: "11th/12th Mark" },
  { value: "CLAT", label: "CLAT" },
];

const engineeringAdmissionTypeOptions = [
  { value: "PCM", label: "PCM" },
  { value: "JEE Main", label: "JEE Main" },
  { value: "JEE Advanced", label: "JEE Advanced" },
];

const artsScienceCourseOptions = [
  "B.Sc Mathematics",
  "B.Sc Physics",
  "B.Sc Chemistry",
  "B.Sc Computer Science",
  "B.Sc Information Technology (IT)",
  "B.Sc Microbiology",
  "B.Sc Biotechnology",
  "B.Sc Zoology",
  "B.Sc Botany",
  "B.Sc Geology",
  "B.Sc Home Science",
  "B.Sc Nutrition & Dietetics",
  "B.Com (General)",
  "B.Com Accounting & Finance",
  "B.Com Banking & Insurance",
  "B.Com Corporate Secretaryship",
  "B.Com Computer Applications",
  "B.A English",
  "B.A Tamil",
  "B.A History",
  "B.A Economics",
  "B.A Political Science",
  "B.A Sociology",
  "B.A Psychology",
  "BBA (Bachelor of Business Administration)",
  "BCA (Bachelor of Computer Applications)",
  "BSW (Social Work)",
  "BFA (Fine Arts)",
];

const artsScienceAdmissionTypeOptions = [
  { value: "CUET", label: "CUET" },
  { value: "12th Marks", label: "12th Marks" },
];

const VALIDATION_FIELD_ORDER = [
  "name",
  "phone",
  "level",
  "category",
  "degree",
  "course",
  "admissionType",
  "physics",
  "chemistry",
  "maths",
  "engineeringEntranceMarks",
  "neet",
  "boardTotal",
  "nata",
  "clat",
  "bestSubject1",
  "bestSubject2",
  "bestSubject3",
  "artsScienceCuet",
  "paramedicalBiology",
  "paramedicalPhysics",
  "paramedicalChemistry",
  "agricultureBiology",
  "agriculturePhysics",
  "agricultureChemistry",
] as const;

const FIND_FORM_STORAGE_KEY = "collegeedwiser-find-form-state";
const FIND_RETURN_TO_SUGGESTIONS_KEY = "collegeedwiser-find-return-to-suggestions";
const FIND_AUTH_RETURN_STEP_KEY = "collegeedwiser-find-auth-return-step";
const SUGGESTIONS_PER_PAGE = 6;
const DETAIL_PARAM_KEYS = [
  "phone",
  "physics",
  "chemistry",
  "maths",
  "engineeringScore",
  "neet",
  "boardTotal",
  "nata",
  "converted12th",
  "clat",
  "bestSubject1",
  "bestSubject2",
  "bestSubject3",
  "artsScienceCuet",
  "paramedicalBiology",
  "paramedicalPhysics",
  "paramedicalChemistry",
  "agricultureBiology",
  "agriculturePhysics",
  "agricultureChemistry",
] as const;

type PersistedFindFormState = {
  activeStep: number;
  selectedLevel: string;
  selectedState: string;
  name: string;
  phone: string;
  touchedFields: Record<string, boolean>;
  selectedCategory: string;
  selectedDreamCollege: string;
  targetCollegeSearch: string;
  selectedDegree: string;
  selectedCourse: string;
  physicsMarks: string;
  chemistryMarks: string;
  mathsMarks: string;
  engineeringEntranceMarks: string;
  neetMarks: string;
  boardMarksTotal: string;
  nataScore: string;
  selectedAdmissionType: string;
  clatMarks: string;
  artsScienceCuetMarks: string;
  lawBestSubjectOne: string;
  lawBestSubjectTwo: string;
  lawBestSubjectThree: string;
  paramedicalBiologyMarks: string;
  paramedicalPhysicsMarks: string;
  paramedicalChemistryMarks: string;
  agricultureBiologyMarks: string;
  agriculturePhysicsMarks: string;
  agricultureChemistryMarks: string;
  activeJuniorQuestionIndex: number;
  juniorAnswers: Record<string, string>;
  juniorTimerSeconds: number;
  hasStartedJuniorTest: boolean;
  hasSubmittedJuniorTest: boolean;
  activeJuniorResultSubject: string;
  suggestionSort: "alphabetical" | "newest" | "oldest";
  suggestionView: "grid" | "list";
  suggestionPage: number;
};

type JuniorQuestion = {
  id: string;
  question: string;
  options: string[];
  correctAnswer?: string;
  subject: string;
};

type JuniorQuestionSet = {
  id: string;
  degree: string;
  level: string;
  subjects: string[];
  questionsBySubject: Record<string, JuniorQuestion[]>;
  savedAt: string;
};

type JuniorQuestionSetResponse = {
  sets?: JuniorQuestionSet[];
  questionSets?: JuniorQuestionSet[];
  cutoffQuestionSets?: JuniorQuestionSet[];
  data?: {
    sets?: JuniorQuestionSet[];
    questionSets?: JuniorQuestionSet[];
    cutoffQuestionSets?: JuniorQuestionSet[];
  };
};

const getJuniorQuestionSetsFromResponse = (data: JuniorQuestionSetResponse | null) => {
  if (!data) return [];
  const directSets = data.sets || data.questionSets || data.cutoffQuestionSets;
  const nestedSets = data.data?.sets || data.data?.questionSets || data.data?.cutoffQuestionSets;
  return Array.isArray(directSets) ? directSets : Array.isArray(nestedSets) ? nestedSets : [];
};

const isAdminOnlyQuestionSetError = (error: unknown) =>
  error instanceof Error && /admin access|admin only|unauthorized|forbidden|403|401/i.test(error.message);

const fallbackQuestionSubjects: Record<string, string[]> = {
  Engineering: ["Mathematics", "Physics", "Chemistry"],
  Medical: ["Biology", "Physics", "Chemistry"],
  "Arts & Science": ["English", "Mathematics", "General Knowledge"],
  Law: ["English", "General Knowledge", "Logical Reasoning"],
  "B.Arch": ["Mathematics", "Physics", "Drawing"],
  Agriculture: ["Biology", "Physics", "Chemistry"],
  Paramedical: ["Biology", "Physics", "Chemistry"],
};

const fallbackQuestionTemplates: Record<string, JuniorQuestion[]> = {
  Mathematics: [
    { id: "math-1", subject: "Mathematics", question: "What is 2 + 2?", options: ["4", "2", "3", "5"], correctAnswer: "A" },
    { id: "math-2", subject: "Mathematics", question: "What is 5 x 3?", options: ["15", "8", "10", "20"], correctAnswer: "A" },
  ],
  Physics: [
    { id: "physics-1", subject: "Physics", question: "Which force pulls objects toward Earth?", options: ["Gravity", "Friction", "Magnetism", "Heat"], correctAnswer: "A" },
    { id: "physics-2", subject: "Physics", question: "What is the SI unit of force?", options: ["Newton", "Joule", "Watt", "Volt"], correctAnswer: "A" },
  ],
  Chemistry: [
    { id: "chemistry-1", subject: "Chemistry", question: "What is the chemical symbol for water?", options: ["H2O", "O2", "CO2", "NaCl"], correctAnswer: "A" },
    { id: "chemistry-2", subject: "Chemistry", question: "Which gas do plants use for photosynthesis?", options: ["Carbon dioxide", "Oxygen", "Nitrogen", "Hydrogen"], correctAnswer: "A" },
  ],
  Biology: [
    { id: "biology-1", subject: "Biology", question: "Which organ pumps blood in the human body?", options: ["Heart", "Lungs", "Brain", "Kidney"], correctAnswer: "A" },
    { id: "biology-2", subject: "Biology", question: "What is the basic unit of life?", options: ["Cell", "Atom", "Tissue", "Organ"], correctAnswer: "A" },
  ],
  English: [
    { id: "english-1", subject: "English", question: "Choose the correct spelling.", options: ["School", "Shcool", "Scool", "Schol"], correctAnswer: "A" },
    { id: "english-2", subject: "English", question: "Which word is a noun?", options: ["Book", "Quickly", "Blue", "Run"], correctAnswer: "A" },
  ],
  "General Knowledge": [
    { id: "gk-1", subject: "General Knowledge", question: "What is the capital of India?", options: ["New Delhi", "Chennai", "Mumbai", "Kolkata"], correctAnswer: "A" },
    { id: "gk-2", subject: "General Knowledge", question: "How many days are there in a leap year?", options: ["366", "365", "364", "360"], correctAnswer: "A" },
  ],
  "Logical Reasoning": [
    { id: "reasoning-1", subject: "Logical Reasoning", question: "Find the next number: 2, 4, 6, 8, ?", options: ["10", "9", "12", "14"], correctAnswer: "A" },
    { id: "reasoning-2", subject: "Logical Reasoning", question: "If all roses are flowers, then roses are?", options: ["Flowers", "Trees", "Fruits", "Seeds"], correctAnswer: "A" },
  ],
  Drawing: [
    { id: "drawing-1", subject: "Drawing", question: "Which shape has three sides?", options: ["Triangle", "Square", "Circle", "Rectangle"], correctAnswer: "A" },
    { id: "drawing-2", subject: "Drawing", question: "Which color is made by mixing red and blue?", options: ["Purple", "Green", "Orange", "Yellow"], correctAnswer: "A" },
  ],
};

const fallbackAssessmentLevels = ["6th - 8th", "9th - 10th"];

const createFallbackJuniorQuestionSets = (): JuniorQuestionSet[] =>
  Object.entries(fallbackQuestionSubjects).flatMap(([degree, subjects]) =>
    fallbackAssessmentLevels.map((level) => ({
      id: `fallback-${normalizeText(degree).replace(/[^a-z0-9]+/g, "-")}-${normalizeText(level).replace(/[^a-z0-9]+/g, "-")}`,
      degree,
      level,
      subjects,
      questionsBySubject: subjects.reduce<Record<string, JuniorQuestion[]>>((questionsBySubject, subject) => {
        questionsBySubject[subject] = (fallbackQuestionTemplates[subject] || []).map((question) => ({
          ...question,
          id: `${normalizeText(level).replace(/[^a-z0-9]+/g, "-")}-${question.id}`,
        }));
        return questionsBySubject;
      }, {}),
      savedAt: "2026-01-01T00:00:00.000Z",
    })),
  );

const degreeAliases: Record<string, string[]> = {
  Engineering: ["engineering", "be", "btech", "b.e", "b.tech", "technology"],
  Medical: ["medical", "mbbs", "bds", "medicine", "clinical"],
  Law: ["law", "llb", "llm", "legal"],
  "Arts & Science": ["arts", "science", "bsc", "b.sc", "ba", "b.a", "bcom", "b.com", "bba", "bca"],
  "B.Arch": ["barch", "b.arch", "architecture", "arch"],
  Agriculture: ["agriculture", "agri", "farming", "crop science"],
  Paramedical: ["paramedical", "allied health", "physiotherapy", "radiology", "nursing"],
};

const courseMatchesDegree = (course: Course, degree: string) => {
  if (!degree) return true;
  const haystack = [
    course.course,
    course.courseName,
    course.degreeType,
    course.courseType,
    course.courseCategory,
    course.stream,
    course.specialization,
  ]
    .map((item) => normalizeText(String(item || "")))
    .filter(Boolean)
    .join(" ");
  const aliases = degreeAliases[degree] || [degree];
  return aliases.some((alias) => haystack.includes(normalizeText(alias)));
};

const collegeMatchesDegree = (college: College, degree: string) => {
  if (!degree) return true;
  const haystack = [
    college.name,
    college.university,
    college.description,
    ...(Array.isArray(college.streams) ? college.streams : []),
    ...(Array.isArray(college.courseTags) ? college.courseTags : []),
  ]
    .map((item) => normalizeText(String(item || "")))
    .filter(Boolean)
    .join(" ");
  const aliases = degreeAliases[degree] || [degree];
  return aliases.some((alias) => haystack.includes(normalizeText(alias)));
};

const courseMatchesSelection = (course: Course, selectedCourse: string) => {
  if (!selectedCourse) return true;
  const selected = normalizeText(selectedCourse);
  const selectedTokens = selected.split(" ").filter(Boolean);
  const haystack = [
    course.course,
    course.courseName,
    course.specialization,
    course.stream,
    course.courseCategory,
  ]
    .map((item) => normalizeText(String(item || "")))
    .filter(Boolean)
    .join(" ");
  const specialization = normalizeText(course.specialization || "");
  const baseCourse = normalizeText(course.course || course.courseName || "");

  return (
    haystack.includes(selected) ||
    selected.includes(specialization) ||
    selected.includes(baseCourse) ||
    selectedTokens.every((token) => haystack.includes(token))
  );
};

const getCleanCourseOptionLabel = (course: Course, selectedDegree: string) => {
  const degreeText = normalizeText(selectedDegree);
  const splitAndClean = (value: string) => {
    const seenParts = new Set<string>();
    return value
      .split(/\s+-\s+/)
      .map((part) => part.trim())
      .filter(Boolean)
      .filter((part) => {
        const normalizedPart = normalizeText(part);
        if (!normalizedPart || normalizedPart === degreeText || seenParts.has(normalizedPart)) {
          return false;
        }
        seenParts.add(normalizedPart);
        return true;
      });
  };

  const directName = String(course.courseName || "").trim();
  const specialization = String(course.specialization || "").trim();
  const courseName = String(course.course || "").trim();
  const courseType = String(course.courseType || "").trim();
  const directParts = splitAndClean(directName);
  const courseParts = splitAndClean(courseName);
  const specializationParts = splitAndClean(specialization);

  if (directParts.length === 1) return directParts[0];
  if (specializationParts.length === 1 && courseParts.some((part) => normalizeText(part) === normalizeText(specializationParts[0]))) {
    return specializationParts[0];
  }
  if (courseParts.length === 1) return courseParts[0];
  if (
    courseType &&
    specialization &&
    normalizeText(courseType) !== normalizeText(specialization) &&
    !normalizeText(specialization).includes(normalizeText(courseType))
  ) {
    return `${courseType} - ${specialization}`;
  }
  if (specializationParts.length) return specializationParts.join(" - ");
  if (directParts.length) return directParts.join(" - ");
  return courseParts.join(" - ") || directName || specialization || courseName;
};

const getNonNegativeNumberValue = (value: string) => {
  if (value === "") return "";
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return "";
  }
  return value;
};

const validateNumericRange = (
  errors: Record<string, string>,
  value: string,
  errorKey: string,
  max: number,
  min = 0,
  message?: string,
) => {
  if (value.trim().length === 0) return;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
    errors[errorKey] = message || `Please enter a valid number between ${min} and ${max}.`;
  }
};

const getJuniorQuestionLevelGroup = (level: string) => {
  if (["6", "7", "8"].includes(level)) return "6th - 8th";
  if (["9", "10"].includes(level)) return "9th - 10th";
  return "";
};

const JUNIOR_TEST_DURATION_SECONDS = 30 * 60;

const formatTimer = (seconds: number) => {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;
  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
};

const formatDurationLabel = (seconds: number) => {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
};

const getAssessmentScale = (degree: string) => {
  const normalizedDegree = normalizeText(degree);
  if (normalizedDegree === "medical") return 720;
  if (normalizedDegree === "law") return 300;
  if (["engineering", "paramedical", "agriculture", "barch", "b arch"].includes(normalizedDegree)) return 200;
  return 100;
};

const getAssessmentTone = (percentage: number) => {
  if (percentage >= 80) return { label: "Excellent", color: "#10a85a", bg: "#eefbf4" };
  if (percentage >= 60) return { label: "Good", color: "#f59e0b", bg: "#fff8e8" };
  return { label: "Keep Practicing", color: "#ef4444", bg: "#fff1f2" };
};

const formatScoreNumber = (value: number) =>
  Number.isInteger(value) ? String(value) : value.toFixed(1);

type JuniorCollegeSuggestion = {
  id: string;
  collegeId: string;
  collegeName: string;
  location: string;
  courseName: string;
  logo: string;
  cutoff: number;
  cutoffLabel: string;
  ranking: string;
  ownershipType: string;
  accreditation: string;
  establishedYear: string;
  placementRate: number;
  href: string;
};

// Cutoff form page: collects student details, academic inputs, and sends the computed cutoff to /cutoff.
export default function FindPage() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const hasHydratedPersistedForm = useRef(false);
  const previousJuniorQuestionSetIdRef = useRef<string | null>(null);
  const [hasRestoredPersistedForm, setHasRestoredPersistedForm] = useState(false);
  const inlineMatchResultsRef = useRef<HTMLDivElement | null>(null);
  const suggestedCollegesListRef = useRef<HTMLDivElement | null>(null);
  const shouldScrollSuggestedCollegesRef = useRef(false);
  const [currentUser, setCurrentUser] = useState<SafeAuthUser | null>(() => readCurrentUser());
  const isAuthenticated = Boolean(currentUser || readAuthToken());
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [colleges, setColleges] = useState<College[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [juniorQuestionSets, setJuniorQuestionSets] = useState<JuniorQuestionSet[]>([]);
  const [juniorQuestionsLoading, setJuniorQuestionsLoading] = useState(false);
  const [juniorQuestionsStatus, setJuniorQuestionsStatus] = useState("");
  const [activeJuniorQuestionIndex, setActiveJuniorQuestionIndex] = useState(0);
  const [juniorAnswers, setJuniorAnswers] = useState<Record<string, string>>({});
  const [juniorTimerSeconds, setJuniorTimerSeconds] = useState(0);
  const [hasStartedJuniorTest, setHasStartedJuniorTest] = useState(false);
  const [hasSubmittedJuniorTest, setHasSubmittedJuniorTest] = useState(false);
  const [activeJuniorResultSubject, setActiveJuniorResultSubject] = useState("");
  const [suggestionSort, setSuggestionSort] = useState<"alphabetical" | "newest" | "oldest">("alphabetical");
  const [isSuggestionSortOpen, setIsSuggestionSortOpen] = useState(false);
  const [suggestionView, setSuggestionView] = useState<"grid" | "list">("grid");
  const [suggestionPage, setSuggestionPage] = useState(1);
  const [inlineMatchQueryString, setInlineMatchQueryString] = useState("");
  const [selectedState, setSelectedState] = useState("Tamil Nadu");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [validationStep, setValidationStep] = useState<number | null>(null);
  const [hasCalculatedPreview, setHasCalculatedPreview] = useState(false);
  const [showValidationPopup, setShowValidationPopup] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [activeStep, setActiveStep] = useState(1);
  const [hasClientMounted, setHasClientMounted] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDreamCollege, setSelectedDreamCollege] = useState("");
  const [targetCollegeSearch, setTargetCollegeSearch] = useState("");
  const [selectedDegree, setSelectedDegree] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [physicsMarks, setPhysicsMarks] = useState("");
  const [chemistryMarks, setChemistryMarks] = useState("");
  const [mathsMarks, setMathsMarks] = useState("");
  const [engineeringEntranceMarks, setEngineeringEntranceMarks] = useState("");
  const [neetMarks, setNeetMarks] = useState("");
  const [boardMarksTotal, setBoardMarksTotal] = useState("");
  const [nataScore, setNataScore] = useState("");
  const [selectedAdmissionType, setSelectedAdmissionType] = useState("");
  const [clatMarks, setClatMarks] = useState("");
  const [artsScienceCuetMarks, setArtsScienceCuetMarks] = useState("");
  const [lawBestSubjectOne, setLawBestSubjectOne] = useState("");
  const [lawBestSubjectTwo, setLawBestSubjectTwo] = useState("");
  const [lawBestSubjectThree, setLawBestSubjectThree] = useState("");
  const [paramedicalBiologyMarks, setParamedicalBiologyMarks] = useState("");
  const [paramedicalPhysicsMarks, setParamedicalPhysicsMarks] = useState("");
  const [paramedicalChemistryMarks, setParamedicalChemistryMarks] = useState("");
  const [agricultureBiologyMarks, setAgricultureBiologyMarks] = useState("");
  const [agriculturePhysicsMarks, setAgriculturePhysicsMarks] = useState("");
  const [agricultureChemistryMarks, setAgricultureChemistryMarks] = useState("");
  const displayedProfileProgressRef = useRef(0);

  useEffect(() => {
    let isMounted = true;
    let cancelDeferredLoad: (() => void) | undefined;
    const idleWindow = window as Window & {
      requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    void (async () => {
      try {
        const collegeData = await request<{ colleges?: College[] }>("/api/public/colleges");
        if (!isMounted) return;
        setColleges(Array.isArray(collegeData?.colleges) ? collegeData.colleges : []);

        const loadCourses = async () => {
          try {
            const courseData = await request<{ courses?: Course[] }>("/api/public/courses");
            if (!isMounted) return;
            startTransition(() => {
              setCourses(Array.isArray(courseData?.courses) ? courseData.courses : []);
            });
          } catch {
            if (!isMounted) return;
            startTransition(() => {
              setCourses([]);
            });
          }
        };

        if (idleWindow.requestIdleCallback && idleWindow.cancelIdleCallback) {
          const idleHandle = idleWindow.requestIdleCallback(() => {
            void loadCourses();
          }, { timeout: 1500 });
          cancelDeferredLoad = () => idleWindow.cancelIdleCallback?.(idleHandle);
        } else {
          const timer = window.setTimeout(() => {
            void loadCourses();
          }, 0);
          cancelDeferredLoad = () => window.clearTimeout(timer);
        }
      } catch {
        if (!isMounted) return;
        setColleges([]);
        setCourses([]);
      }
    })();

    return () => {
      isMounted = false;
      cancelDeferredLoad?.();
    };
  }, []);

  const currentRoute = useMemo(() => {
    if (!pathname) return "/find";
    const query = searchParams.toString();
    return query ? `${pathname}?${query}` : pathname;
  }, [pathname, searchParams]);

  const normalizedLivePhone = useMemo(() => phone.replace(/\D/g, "").slice(0, 10), [phone]);
  const liveProfileTarget = useMemo(() => {
    const hasName = Boolean(name.trim());
    const phoneDigits = normalizedLivePhone.length;
    const hasPhone = phoneDigits > 0;
    const hasCompletePhone = phoneDigits === 10;

    if (!hasName && !hasPhone) return 0;
    if (hasName && !hasPhone) return 50;
    if (!hasCompletePhone) return hasName ? 75 : 50;
    return hasName ? 100 : 75;
  }, [name, normalizedLivePhone]);
  const isProfileReady = liveProfileTarget === 100;
  const hasNameVerification = Boolean(name.trim());
  const hasPhoneVerification = normalizedLivePhone.length === 10;
  const profileDisplayName = name.trim();
  const profileDisplayPhone = phone.trim();
  const [displayedProfileProgress, setDisplayedProfileProgress] = useState(0);
  const profileCompletionPercent = Math.round(displayedProfileProgress);

  useEffect(() => {
    let animationFrame = 0;
    const start = performance.now();
    const initial = displayedProfileProgressRef.current;
    const target = liveProfileTarget;
    const duration = 420;

    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const nextValue = initial + (target - initial) * eased;
      const roundedValue = Number(nextValue.toFixed(1));
      displayedProfileProgressRef.current = roundedValue;
      setDisplayedProfileProgress(roundedValue);

      if (progress < 1) {
        animationFrame = window.requestAnimationFrame(step);
      } else {
        displayedProfileProgressRef.current = target;
        setDisplayedProfileProgress(target);
      }
    };

    animationFrame = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [liveProfileTarget]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const nextStep = window.sessionStorage.getItem(FIND_AUTH_RETURN_STEP_KEY);
    if (nextStep !== "2" || activeStep !== 1 || !isAuthenticated) return;

    window.sessionStorage.removeItem(FIND_AUTH_RETURN_STEP_KEY);
    setShowAuthGate(false);
    setActiveStep(2);
  }, [activeStep, isAuthenticated]);

  useEffect(() => {
    let isMounted = true;

    const loadJuniorQuestionSets = async () => {
      setJuniorQuestionsLoading(true);
      setJuniorQuestionsStatus("");

      try {
        let data: JuniorQuestionSetResponse | null = null;
        const currentUser = readCurrentUser();
        const token = readAuthToken();
        const authInit = token
          ? {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          : undefined;
        const openQuestionEndpoints = [
          "/api/public/cutoff-question-sets",
          "/api/public/cutoff-questions",
          "/api/cutoff-question-sets",
          "/api/cutoff-questions",
        ];
        const authenticatedQuestionEndpoints = [
          "/api/users/cutoff-question-sets",
          "/api/user/cutoff-question-sets",
          "/api/student/cutoff-question-sets",
          "/api/cutoff-question-sets",
          "/api/admin/cutoff-question-sets",
        ];

        for (const endpoint of openQuestionEndpoints) {
          try {
            data = await request<JuniorQuestionSetResponse>(endpoint);
            break;
          } catch {
            data = null;
          }
        }

        if (!data && authInit && currentUser) {
          for (const endpoint of authenticatedQuestionEndpoints) {
            try {
              data = await request<JuniorQuestionSetResponse>(endpoint, authInit);
              break;
            } catch {
              data = null;
            }
          }
        }

        if (!isMounted) return;

        const loadedQuestionSets = getJuniorQuestionSetsFromResponse(data);
        setJuniorQuestionSets(loadedQuestionSets.length > 0 ? loadedQuestionSets : createFallbackJuniorQuestionSets());
      } catch (error) {
        if (!isMounted) return;
        setJuniorQuestionSets(createFallbackJuniorQuestionSets());
        setJuniorQuestionsStatus(
          isAdminOnlyQuestionSetError(error)
            ? ""
            : error instanceof Error ? error.message : "Unable to load assessment questions.",
        );
      } finally {
        if (isMounted) {
          setJuniorQuestionsLoading(false);
        }
      }
    };

    void loadJuniorQuestionSets();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const rawValue = window.sessionStorage.getItem(FIND_FORM_STORAGE_KEY);
      if (!rawValue) {
        hasHydratedPersistedForm.current = true;
        return;
      }

      const savedState = JSON.parse(rawValue) as Partial<PersistedFindFormState>;
      const savedActiveStep = Number(savedState.activeStep);
      if (Number.isFinite(savedActiveStep) && savedActiveStep >= 1 && savedActiveStep <= 5) {
        setActiveStep(savedActiveStep);
      }
      setSelectedLevel(String(savedState.selectedLevel || ""));
      setSelectedState(String(savedState.selectedState || "Tamil Nadu"));
      setName(String(savedState.name || ""));
      setPhone(String(savedState.phone || ""));
      setTouchedFields({});
      setSelectedCategory(normalizeCategorySelection(String(savedState.selectedCategory || "")));
      setSelectedDreamCollege(String(savedState.selectedDreamCollege || ""));
      setTargetCollegeSearch(String(savedState.targetCollegeSearch || ""));
      setSelectedDegree(String(savedState.selectedDegree || ""));
      setSelectedCourse(String(savedState.selectedCourse || ""));
      setPhysicsMarks(String(savedState.physicsMarks || ""));
      setChemistryMarks(String(savedState.chemistryMarks || ""));
      setMathsMarks(String(savedState.mathsMarks || ""));
      setEngineeringEntranceMarks(String(savedState.engineeringEntranceMarks || ""));
      setNeetMarks(String(savedState.neetMarks || ""));
      setBoardMarksTotal(String(savedState.boardMarksTotal || ""));
      setNataScore(String(savedState.nataScore || ""));
      setSelectedAdmissionType(String(savedState.selectedAdmissionType || ""));
      setClatMarks(String(savedState.clatMarks || ""));
      setArtsScienceCuetMarks(String(savedState.artsScienceCuetMarks || ""));
      setLawBestSubjectOne(String(savedState.lawBestSubjectOne || ""));
      setLawBestSubjectTwo(String(savedState.lawBestSubjectTwo || ""));
      setLawBestSubjectThree(String(savedState.lawBestSubjectThree || ""));
      setParamedicalBiologyMarks(String(savedState.paramedicalBiologyMarks || ""));
      setParamedicalPhysicsMarks(String(savedState.paramedicalPhysicsMarks || ""));
      setParamedicalChemistryMarks(String(savedState.paramedicalChemistryMarks || ""));
      setAgricultureBiologyMarks(String(savedState.agricultureBiologyMarks || ""));
      setAgriculturePhysicsMarks(String(savedState.agriculturePhysicsMarks || ""));
      setAgricultureChemistryMarks(String(savedState.agricultureChemistryMarks || ""));
      const savedJuniorQuestionIndex = Number(savedState.activeJuniorQuestionIndex);
      setActiveJuniorQuestionIndex(
        Number.isFinite(savedJuniorQuestionIndex) && savedJuniorQuestionIndex >= 0
          ? savedJuniorQuestionIndex
          : 0,
      );
      setJuniorAnswers(
        savedState.juniorAnswers && typeof savedState.juniorAnswers === "object"
          ? savedState.juniorAnswers
          : {},
      );
      const savedJuniorTimerSeconds = Number(savedState.juniorTimerSeconds);
      setJuniorTimerSeconds(
        Number.isFinite(savedJuniorTimerSeconds) && savedJuniorTimerSeconds >= 0
          ? savedJuniorTimerSeconds
          : 0,
      );
      setHasStartedJuniorTest(Boolean(savedState.hasStartedJuniorTest));
      setHasSubmittedJuniorTest(Boolean(savedState.hasSubmittedJuniorTest));
      setActiveJuniorResultSubject(String(savedState.activeJuniorResultSubject || ""));
      setSuggestionSort(
        savedState.suggestionSort === "newest" || savedState.suggestionSort === "oldest"
          ? savedState.suggestionSort
          : "alphabetical",
      );
      setSuggestionView(savedState.suggestionView === "list" ? "list" : "grid");
      const savedSuggestionPage = Number(savedState.suggestionPage);
      setSuggestionPage(
        Number.isFinite(savedSuggestionPage) && savedSuggestionPage >= 1
          ? savedSuggestionPage
          : 1,
      );
    } catch {
      window.sessionStorage.removeItem(FIND_FORM_STORAGE_KEY);
    } finally {
      hasHydratedPersistedForm.current = true;
      setHasRestoredPersistedForm(true);
    }
  }, []);

  useEffect(() => {
    const hasQueryState = [
      "name",
      "phone",
      "level",
      "state",
      "degree",
      "category",
      "dreamCollege",
      "course",
      "admissionType",
      "physics",
      "chemistry",
      "maths",
      "engineeringScore",
      "neet",
      "boardTotal",
      "nata",
      "clat",
      "bestSubject1",
      "bestSubject2",
      "bestSubject3",
      "artsScienceCuet",
      "paramedicalBiology",
      "paramedicalPhysics",
      "paramedicalChemistry",
      "agricultureBiology",
      "agriculturePhysics",
      "agricultureChemistry",
    ].some((key) => {
      const value = searchParams.get(key);
      return Boolean(value && value.trim());
    });

    if (!hasQueryState) {
      setHasSubmitted(false);
      setValidationStep(null);
      setHasCalculatedPreview(false);
      setShowValidationPopup(false);
      setInlineMatchQueryString("");
      return;
    }

    const queryLevel = searchParams.get("level") || searchParams.get("standard") || searchParams.get("class") || "";
    const queryDegree = searchParams.get("degree") || "";

    setSelectedLevel(queryLevel);
    setSelectedState(searchParams.get("state") || "Tamil Nadu");
    setName(searchParams.get("name") || "");
    setPhone(searchParams.get("phone") || "");
    setHasSubmitted(false);
    setHasCalculatedPreview(false);
    setShowValidationPopup(false);
    setTouchedFields({});
    setSelectedCategory(normalizeCategorySelection(searchParams.get("category") || ""));
    setSelectedDreamCollege(searchParams.get("dreamCollege") || "");
    setTargetCollegeSearch("");
    setSelectedDegree(queryDegree);
    setSelectedCourse(searchParams.get("course") || "");
    setPhysicsMarks(searchParams.get("physics") || "");
    setChemistryMarks(searchParams.get("chemistry") || "");
    setMathsMarks(searchParams.get("maths") || "");
    setEngineeringEntranceMarks(searchParams.get("engineeringScore") || "");
    setNeetMarks(searchParams.get("neet") || "");
    setBoardMarksTotal(searchParams.get("boardTotal") || "");
    setNataScore(searchParams.get("nata") || "");
    setSelectedAdmissionType(searchParams.get("admissionType") || "");
    setClatMarks(searchParams.get("clat") || "");
    setArtsScienceCuetMarks(searchParams.get("artsScienceCuet") || "");
    setLawBestSubjectOne(searchParams.get("bestSubject1") || "");
    setLawBestSubjectTwo(searchParams.get("bestSubject2") || "");
    setLawBestSubjectThree(searchParams.get("bestSubject3") || "");
    setParamedicalBiologyMarks(searchParams.get("paramedicalBiology") || "");
    setParamedicalPhysicsMarks(searchParams.get("paramedicalPhysics") || "");
    setParamedicalChemistryMarks(searchParams.get("paramedicalChemistry") || "");
    setAgricultureBiologyMarks(searchParams.get("agricultureBiology") || "");
    setAgriculturePhysicsMarks(searchParams.get("agriculturePhysics") || "");
    setAgricultureChemistryMarks(searchParams.get("agricultureChemistry") || "");

    if (assessmentLevelOptions.has(queryLevel) && queryDegree) {
      setActiveStep(4);
      setInlineMatchQueryString("");
    } else if (queryLevel && queryDegree) {
      setActiveStep(4);
    }

    if (searchParams.get("cutoff") && !assessmentLevelOptions.has(queryLevel)) {
      setInlineMatchQueryString(searchParams.toString());
    }
  }, [searchParams]);

  useEffect(() => {
    setHasClientMounted(true);
  }, []);

  const persistedFindFormState = useMemo<PersistedFindFormState>(
    () => ({
      activeStep,
      selectedLevel,
      selectedState,
      name,
      phone,
      touchedFields,
      selectedCategory,
      selectedDreamCollege,
      targetCollegeSearch,
      selectedDegree,
      selectedCourse,
      physicsMarks,
      chemistryMarks,
      mathsMarks,
      engineeringEntranceMarks,
      neetMarks,
      boardMarksTotal,
      nataScore,
      selectedAdmissionType,
      clatMarks,
      artsScienceCuetMarks,
      lawBestSubjectOne,
      lawBestSubjectTwo,
      lawBestSubjectThree,
      paramedicalBiologyMarks,
      paramedicalPhysicsMarks,
      paramedicalChemistryMarks,
      agricultureBiologyMarks,
      agriculturePhysicsMarks,
      agricultureChemistryMarks,
      activeJuniorQuestionIndex,
      juniorAnswers,
      juniorTimerSeconds,
      hasStartedJuniorTest,
      hasSubmittedJuniorTest,
      activeJuniorResultSubject,
      suggestionSort,
      suggestionView,
      suggestionPage,
    }),
    [
      activeJuniorQuestionIndex,
      activeJuniorResultSubject,
      activeStep,
      agricultureBiologyMarks,
      agricultureChemistryMarks,
      agriculturePhysicsMarks,
      artsScienceCuetMarks,
      boardMarksTotal,
      chemistryMarks,
      clatMarks,
      engineeringEntranceMarks,
      hasStartedJuniorTest,
      hasSubmittedJuniorTest,
      juniorAnswers,
      juniorTimerSeconds,
      lawBestSubjectOne,
      lawBestSubjectThree,
      lawBestSubjectTwo,
      mathsMarks,
      name,
      nataScore,
      neetMarks,
      paramedicalBiologyMarks,
      paramedicalChemistryMarks,
      paramedicalPhysicsMarks,
      phone,
      physicsMarks,
      selectedLevel,
      selectedAdmissionType,
      selectedCategory,
      selectedCourse,
      selectedDegree,
      selectedDreamCollege,
      selectedState,
      suggestionPage,
      suggestionSort,
      suggestionView,
      targetCollegeSearch,
      touchedFields,
    ],
  );

  const saveFindFormState = useCallback(() => {
    if (typeof window === "undefined") return;
    window.sessionStorage.setItem(FIND_FORM_STORAGE_KEY, JSON.stringify(persistedFindFormState));
  }, [persistedFindFormState]);

  const saveFindFormStateForCollegeDetails = useCallback(() => {
    saveFindFormState();
    if (typeof window === "undefined") return;
    window.sessionStorage.setItem(FIND_RETURN_TO_SUGGESTIONS_KEY, "1");
  }, [saveFindFormState]);

  useEffect(() => {
    if (!hasRestoredPersistedForm || typeof window === "undefined") return;

    saveFindFormState();
  }, [hasRestoredPersistedForm, persistedFindFormState, saveFindFormState]);

  // Form field visibility by selected degree and level.
  const isSeniorSecondaryLevel = selectedLevel === "11" || selectedLevel === "12";
  const isLevel11 = selectedLevel === "11";
  const showEngineeringFields =
    selectedDegree === "Engineering" && isSeniorSecondaryLevel;
  const showMedicalFields = selectedDegree === "Medical" && selectedLevel === "12";
  const showBArchFields = selectedDegree === "B.Arch" && isSeniorSecondaryLevel;
  const showLawFields = selectedDegree === "Law" && isSeniorSecondaryLevel;
  const showArtsScienceFields =
    selectedDegree === "Arts & Science" && isSeniorSecondaryLevel;
  const showParamedicalFields = selectedDegree === "Paramedical" && isSeniorSecondaryLevel;
  const showAgricultureFields = selectedDegree === "Agriculture" && isSeniorSecondaryLevel;
  const showBArchNataField = showBArchFields && !isLevel11;
  const showArtsScienceAdmissionTypeField = showArtsScienceFields && !isLevel11;
  const showArtsScienceCuetField =
    showArtsScienceAdmissionTypeField && selectedAdmissionType === "CUET";
  const showArtsScienceBoardMarksField =
    showArtsScienceFields && (isLevel11 || selectedAdmissionType === "12th Marks");
  const showEngineeringPcmFields = showEngineeringFields && selectedAdmissionType === "PCM";
  const showEngineeringJeeMainFields = showEngineeringFields && selectedAdmissionType === "JEE Main";
  const showEngineeringJeeAdvancedFields = showEngineeringFields && selectedAdmissionType === "JEE Advanced";
  const showLawClatFields = showLawFields && selectedAdmissionType === "CLAT";
  const showLawMarksFields = showLawFields && selectedAdmissionType === "11th/12th Mark";
  const showCategoryField = isSeniorSecondaryLevel;
  const showDreamCollegeField = Boolean(selectedDegree) && isSeniorSecondaryLevel;
  const availableEngineeringAdmissionTypeOptions = isLevel11
    ? engineeringAdmissionTypeOptions.filter((option) => option.value === "PCM")
    : engineeringAdmissionTypeOptions;
  const availableLawAdmissionTypeOptions = isLevel11
    ? lawAdmissionTypeOptions.filter((option) => option.value === "11th/12th Mark")
    : lawAdmissionTypeOptions;

  const isBlank = (value: string) => value.trim().length === 0;

  const eligibleCourses = useMemo(
    () =>
      courses.filter(
        (course) =>
          courseMatchesDegree(course, selectedDegree) &&
          courseMatchesSelection(course, selectedCourse),
      ),
    [courses, selectedCourse, selectedDegree],
  );

  const dreamCollegeOptions = useMemo(() => {
    const filteredColleges = colleges
      .filter((college) => collegeMatchesDegree(college, selectedDegree))
      .sort((left, right) => left.name.localeCompare(right.name));

    if (!selectedDreamCollege) {
      return filteredColleges;
    }

    const selectedCollegeRecord = colleges.find(
      (college) =>
        normalizeText(college.id) === normalizeText(selectedDreamCollege) ||
        normalizeText(college.name) === normalizeText(selectedDreamCollege),
    );

    if (
      selectedCollegeRecord &&
      !filteredColleges.some(
        (college) => normalizeText(college.id) === normalizeText(selectedCollegeRecord.id),
      )
    ) {
      return [selectedCollegeRecord, ...filteredColleges];
    }
    return filteredColleges;
  }, [colleges, selectedDegree, selectedDreamCollege]);

  const selectedDegreePreview = useMemo(() => {
    const previewConfig = degreePreviewDetails[selectedDegree];
    const relatedCourses = courses.filter((course) => courseMatchesDegree(course, selectedDegree));
    const relatedColleges = colleges.filter((college) => collegeMatchesDegree(college, selectedDegree));
    const branchNames = Array.from(
      new Set(
        relatedCourses
          .map((course) => getCleanCourseOptionLabel(course, selectedDegree))
          .map((label) => label.trim())
          .filter((label) => Boolean(label) && !hiddenMedicalPreviewBranches.has(label)),
      ),
    );

    if (!previewConfig) {
      return null;
    }

    return {
      ...previewConfig,
      branchCount: branchNames.length,
      collegeCount: relatedColleges.length,
      branchNames: branchNames.slice(0, 4),
    };
  }, [colleges, courses, selectedDegree]);

  // Resets all cutoff form academic inputs when degree/level path changes.
  const resetAcademicFields = () => {
    setTouchedFields({});
    setSelectedCourse("");
    setPhysicsMarks("");
    setChemistryMarks("");
    setMathsMarks("");
    setEngineeringEntranceMarks("");
    setNeetMarks("");
    setBoardMarksTotal("");
    setNataScore("");
    setSelectedAdmissionType("");
    setClatMarks("");
    setArtsScienceCuetMarks("");
    setLawBestSubjectOne("");
    setLawBestSubjectTwo("");
    setLawBestSubjectThree("");
    setParamedicalBiologyMarks("");
    setParamedicalPhysicsMarks("");
    setParamedicalChemistryMarks("");
    setAgricultureBiologyMarks("");
    setAgriculturePhysicsMarks("");
    setAgricultureChemistryMarks("");
  };

  const resetFormFields = () => {
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(FIND_FORM_STORAGE_KEY);
      window.history.replaceState(window.history.state, "", "/find");
    }
    setInlineMatchQueryString("");
    setSelectedState("Tamil Nadu");
    setName("");
    setPhone("");
    setActiveStep(1);
    setSelectedLevel("");
    setHasSubmitted(false);
    setHasCalculatedPreview(false);
    setShowValidationPopup(false);
    setTouchedFields({});
    setSelectedCategory("");
    setSelectedDreamCollege("");
    setTargetCollegeSearch("");
    setSelectedDegree("");
    resetAcademicFields();
  };

  const resetFinalDetailsFields = () => {
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(FIND_FORM_STORAGE_KEY);
      window.history.replaceState(window.history.state, "", "/find");
    }
    setInlineMatchQueryString("");
    setHasSubmitted(false);
    setHasCalculatedPreview(false);
    setShowValidationPopup(false);
    setTouchedFields({});
    setSelectedState("Tamil Nadu");
    setSelectedCategory("");
    setSelectedDreamCollege("");
    setTargetCollegeSearch("");
    resetAcademicFields();
  };

  useEffect(() => {
    if (!selectedDreamCollege || targetCollegeSearch.trim() || colleges.length === 0) return;

    const selectedCollege = colleges.find(
      (college) =>
        normalizeText(college.id) === normalizeText(selectedDreamCollege) ||
        normalizeText(college.name) === normalizeText(selectedDreamCollege),
    );

    if (selectedCollege) {
      setTargetCollegeSearch(selectedCollege.name);
    }
  }, [colleges, selectedDreamCollege, targetCollegeSearch]);

  // Degree-specific cutoff calculators used by the cutoff form.
  const engineeringCutoff = useMemo(() => {
    if (!showEngineeringPcmFields) return "";
    if (isBlank(physicsMarks) || isBlank(chemistryMarks) || isBlank(mathsMarks)) return "";
    const physics = Number(physicsMarks);
    const chemistry = Number(chemistryMarks);
    const maths = Number(mathsMarks);
    if (!Number.isFinite(physics) || !Number.isFinite(chemistry) || !Number.isFinite(maths)) {
      return "";
    }
    return (maths + physics / 2 + chemistry / 2).toFixed(1);
  }, [chemistryMarks, mathsMarks, physicsMarks, showEngineeringPcmFields]);

  const bArchConvertedScore = useMemo(() => {
    if (!showBArchFields) return "";
    if (isBlank(boardMarksTotal)) return "";
    const total = Number(boardMarksTotal);
    if (!Number.isFinite(total)) return "";
    if (isLevel11) return ((total / 600) * 400).toFixed(1);
    return (total / 3).toFixed(1);
  }, [boardMarksTotal, isLevel11, showBArchFields]);

  const bArchCombinedScore = useMemo(() => {
    if (!showBArchNataField) return "";
    if (isBlank(bArchConvertedScore) || isBlank(nataScore)) return "";
    const converted = Number(bArchConvertedScore);
    const nata = Number(nataScore);
    if (!Number.isFinite(converted) || !Number.isFinite(nata)) return "";
    return (converted + nata).toFixed(1);
  }, [bArchConvertedScore, nataScore, showBArchNataField]);

  const lawBestThreeTotal = useMemo(() => {
    if (!showLawMarksFields) return "";
    if (isBlank(lawBestSubjectOne) || isBlank(lawBestSubjectTwo) || isBlank(lawBestSubjectThree)) return "";
    const subjectOne = Number(lawBestSubjectOne);
    const subjectTwo = Number(lawBestSubjectTwo);
    const subjectThree = Number(lawBestSubjectThree);
    if (!Number.isFinite(subjectOne) || !Number.isFinite(subjectTwo) || !Number.isFinite(subjectThree)) {
      return "";
    }
    return (subjectOne + subjectTwo + subjectThree).toFixed(1);
  }, [lawBestSubjectOne, lawBestSubjectThree, lawBestSubjectTwo, showLawMarksFields]);

  const paramedicalCutoff100 = useMemo(() => {
    if (!showParamedicalFields) return "";
    if (
      isBlank(paramedicalBiologyMarks) ||
      isBlank(paramedicalPhysicsMarks) ||
      isBlank(paramedicalChemistryMarks)
    ) {
      return "";
    }
    const biology = Number(paramedicalBiologyMarks);
    const physics = Number(paramedicalPhysicsMarks);
    const chemistry = Number(paramedicalChemistryMarks);
    if (!Number.isFinite(biology) || !Number.isFinite(physics) || !Number.isFinite(chemistry)) {
      return "";
    }
    return (biology / 2 + physics / 4 + chemistry / 4).toFixed(2);
  }, [
    paramedicalBiologyMarks,
    paramedicalChemistryMarks,
    paramedicalPhysicsMarks,
    showParamedicalFields,
  ]);

  const paramedicalCutoff200 = useMemo(() => {
    if (!showParamedicalFields) return "";
    const cutoff = Number(paramedicalCutoff100);
    if (!Number.isFinite(cutoff)) return "";
    return (cutoff * 2).toFixed(2);
  }, [paramedicalCutoff100, showParamedicalFields]);

  const agricultureCutoff100 = useMemo(() => {
    if (!showAgricultureFields) return "";
    if (
      isBlank(agricultureBiologyMarks) ||
      isBlank(agriculturePhysicsMarks) ||
      isBlank(agricultureChemistryMarks)
    ) {
      return "";
    }
    const biology = Number(agricultureBiologyMarks);
    const physics = Number(agriculturePhysicsMarks);
    const chemistry = Number(agricultureChemistryMarks);
    if (!Number.isFinite(biology) || !Number.isFinite(physics) || !Number.isFinite(chemistry)) {
      return "";
    }
    return (biology / 2 + physics / 4 + chemistry / 4).toFixed(2);
  }, [
    agricultureBiologyMarks,
    agricultureChemistryMarks,
    agriculturePhysicsMarks,
    showAgricultureFields,
  ]);

  const agricultureCutoff200 = useMemo(() => {
    if (!showAgricultureFields) return "";
    const cutoff = Number(agricultureCutoff100);
    if (!Number.isFinite(cutoff)) return "";
    return (cutoff * 2).toFixed(2);
  }, [agricultureCutoff100, showAgricultureFields]);

  // Final cutoff value pushed to the cutoff page query string.
  const finalCutoffValue = useMemo(() => {
    if (showEngineeringPcmFields) return engineeringCutoff;
    if (showEngineeringJeeMainFields || showEngineeringJeeAdvancedFields) return engineeringEntranceMarks;
    if (showMedicalFields) return neetMarks;
    if (showBArchFields) return showBArchNataField ? bArchCombinedScore : bArchConvertedScore;
    if (showLawClatFields) return clatMarks;
    if (showLawMarksFields) return lawBestThreeTotal;
    if (showArtsScienceCuetField) return artsScienceCuetMarks;
    if (showArtsScienceBoardMarksField) return boardMarksTotal;
    if (showParamedicalFields) return paramedicalCutoff200;
    if (showAgricultureFields) return agricultureCutoff200;
    return "";
  }, [
    agricultureCutoff200,
    artsScienceCuetMarks,
    bArchCombinedScore,
    bArchConvertedScore,
    boardMarksTotal,
    clatMarks,
    engineeringCutoff,
    engineeringEntranceMarks,
    lawBestThreeTotal,
    neetMarks,
    paramedicalCutoff200,
    showAgricultureFields,
    showBArchFields,
    showBArchNataField,
    showEngineeringJeeAdvancedFields,
    showEngineeringJeeMainFields,
    showEngineeringPcmFields,
    showArtsScienceBoardMarksField,
    showArtsScienceCuetField,
    showLawClatFields,
    showLawMarksFields,
    showMedicalFields,
    showParamedicalFields,
  ]);

  const filteredDreamCollegeOptions = useMemo(() => {
    const query = normalizeText(targetCollegeSearch);
    if (!query) return dreamCollegeOptions.slice(0, 80);

    const queryTokens = query.split(" ").filter(Boolean);
    return dreamCollegeOptions
      .filter((college) => {
        const haystack = normalizeText(
          [
            college.name,
            college.city,
            college.district,
            college.university,
            ...(Array.isArray(college.streams) ? college.streams : []),
            ...(Array.isArray(college.courseTags) ? college.courseTags : []),
          ]
            .filter(Boolean)
            .join(" "),
        );
        return queryTokens.every((token) => haystack.includes(token));
      })
      .sort((left, right) => {
        const leftName = normalizeText(left.name);
        const rightName = normalizeText(right.name);
        const leftStarts = leftName.startsWith(query) ? 0 : 1;
        const rightStarts = rightName.startsWith(query) ? 0 : 1;
        return leftStarts - rightStarts || left.name.localeCompare(right.name);
      })
      .slice(0, 80);
  }, [dreamCollegeOptions, targetCollegeSearch]);

  const selectTargetCollegeByName = (value: string) => {
    setTargetCollegeSearch(value);
    const matchedCollege = dreamCollegeOptions.find(
      (college) => normalizeText(college.name) === normalizeText(value),
    );
    const nextCollegeId = matchedCollege?.id || "";
    setSelectedDreamCollege(nextCollegeId);
    setSelectedCourse("");
  };

  const selectedTargetCollege = useMemo(
    () =>
      colleges.find(
        (college) =>
          normalizeText(college.id) === normalizeText(selectedDreamCollege) ||
          normalizeText(college.name) === normalizeText(selectedDreamCollege) ||
          normalizeText(college.collegeCode || "") === normalizeText(selectedDreamCollege),
      ) || null,
    [colleges, selectedDreamCollege],
  );

  const defaultCourseOptions = useMemo(
    () =>
      showMedicalFields
        ? medicalCourseOptions
        : showArtsScienceFields
          ? artsScienceCourseOptions
          : showLawFields
            ? lawCourseOptions
            : showBArchFields
              ? ["B.Arch"]
              : showAgricultureFields
                ? ["B.Sc Agriculture"]
                : showParamedicalFields
                  ? ["B.Sc Nursing", "BPT", "B.Pharm", "B.Sc Radiology", "B.Sc Medical Laboratory Technology"]
                  : engineeringCourseOptions,
    [
      showAgricultureFields,
      showArtsScienceFields,
      showBArchFields,
      showLawFields,
      showMedicalFields,
      showParamedicalFields,
    ],
  );

  const availableCourseOptions = useMemo(() => {
    if (!selectedTargetCollege) return defaultCourseOptions;

    const selectedCollegeKeys = [
      selectedTargetCollege.id,
      selectedTargetCollege.name,
      selectedTargetCollege.collegeCode || "",
    ]
      .map((item) => normalizeText(item))
      .filter(Boolean);

    const courseNames = new Map<string, string>();
    courses.forEach((course) => {
      if (!courseMatchesDegree(course, selectedDegree)) return;

      const courseCollegeKeys = [course.collegeId || "", course.college || "", course.collegeCode || ""]
        .map((item) => normalizeText(item))
        .filter(Boolean);
      const courseHasCollege =
        courseCollegeKeys.some((key) => selectedCollegeKeys.includes(key)) ||
        (Array.isArray(course.collegeDetails) &&
          course.collegeDetails.some((detail) => {
            const detailKeys = [detail.collegeId || "", detail.college || "", detail.collegeCode || ""]
              .map((item) => normalizeText(item))
              .filter(Boolean);
            return detailKeys.some((key) => selectedCollegeKeys.includes(key));
          }));

      if (!courseHasCollege) return;

      const displayName = getCleanCourseOptionLabel(course, selectedDegree);
      if (displayName) {
        courseNames.set(normalizeText(displayName), displayName);
      }
    });

    return Array.from(courseNames.values()).sort((left, right) => left.localeCompare(right));
  }, [courses, defaultCourseOptions, selectedDegree, selectedTargetCollege]);

  useEffect(() => {
    if (!selectedCourse || availableCourseOptions.includes(selectedCourse)) return;
    setSelectedCourse("");
  }, [availableCourseOptions, selectedCourse]);

  const validationErrors = useMemo(() => {
    const errors: Record<string, string> = {};

    if (isBlank(name)) errors.name = "This field is required";
    if (isBlank(phone)) {
      errors.phone = "This field is required";
    } else if (phone.length !== 10) {
      errors.phone = "Enter a valid 10 digit mobile number";
    }
    if (isBlank(selectedLevel)) errors.level = "Please pick your level";
    if (isBlank(selectedDegree)) errors.degree = "This field is required";

    if (showEngineeringFields) {
      if (showEngineeringPcmFields) {
        if (isBlank(physicsMarks)) errors.physics = "This field is required";
        if (isBlank(chemistryMarks)) errors.chemistry = "This field is required";
        if (isBlank(mathsMarks)) errors.maths = "This field is required";
      } else if (isBlank(engineeringEntranceMarks)) {
        errors.engineeringEntranceMarks = "This field is required";
      }
    }

    if (showMedicalFields && isBlank(neetMarks)) {
      errors.neet = "This field is required";
    }

    if (showBArchFields) {
      if (isBlank(boardMarksTotal)) errors.boardTotal = "This field is required";
      if (showBArchNataField && isBlank(nataScore)) errors.nata = "This field is required";
    }

    if (showLawClatFields && isBlank(clatMarks)) {
      errors.clat = "This field is required";
    }

    if (showLawMarksFields) {
      if (isBlank(lawBestSubjectOne)) errors.bestSubject1 = "This field is required";
      if (isBlank(lawBestSubjectTwo)) errors.bestSubject2 = "This field is required";
      if (isBlank(lawBestSubjectThree)) errors.bestSubject3 = "This field is required";
    }

    if (showArtsScienceCuetField && isBlank(artsScienceCuetMarks)) {
      errors.artsScienceCuet = "This field is required";
    }

    if (showArtsScienceBoardMarksField && isBlank(boardMarksTotal)) {
      errors.boardTotal = "This field is required";
    }

    if (showParamedicalFields) {
      if (isBlank(paramedicalBiologyMarks)) errors.paramedicalBiology = "This field is required";
      if (isBlank(paramedicalPhysicsMarks)) errors.paramedicalPhysics = "This field is required";
      if (isBlank(paramedicalChemistryMarks)) errors.paramedicalChemistry = "This field is required";
    }

    if (showAgricultureFields) {
      if (isBlank(agricultureBiologyMarks)) errors.agricultureBiology = "This field is required";
      if (isBlank(agriculturePhysicsMarks)) errors.agriculturePhysics = "This field is required";
      if (isBlank(agricultureChemistryMarks)) errors.agricultureChemistry = "This field is required";
    }

    validateNumericRange(errors, physicsMarks, "physics", 100, 35, "Please enter a valid number between 35 and 100.");
    validateNumericRange(errors, chemistryMarks, "chemistry", 100, 35, "Please enter a valid number between 35 and 100.");
    validateNumericRange(errors, mathsMarks, "maths", 100, 35, "Please enter a valid number between 35 and 100.");
    validateNumericRange(errors, engineeringEntranceMarks, "engineeringEntranceMarks", showEngineeringJeeAdvancedFields ? 360 : 300);
    validateNumericRange(errors, neetMarks, "neet", 720);
    validateNumericRange(errors, boardMarksTotal, "boardTotal", 600);
    validateNumericRange(errors, nataScore, "nata", 200);
    validateNumericRange(errors, clatMarks, "clat", 120);
    validateNumericRange(errors, lawBestSubjectOne, "bestSubject1", 100);
    validateNumericRange(errors, lawBestSubjectTwo, "bestSubject2", 100);
    validateNumericRange(errors, lawBestSubjectThree, "bestSubject3", 100);
    validateNumericRange(errors, artsScienceCuetMarks, "artsScienceCuet", 600);
    validateNumericRange(errors, paramedicalBiologyMarks, "paramedicalBiology", 100);
    validateNumericRange(errors, paramedicalPhysicsMarks, "paramedicalPhysics", 100);
    validateNumericRange(errors, paramedicalChemistryMarks, "paramedicalChemistry", 100);
    validateNumericRange(errors, agricultureBiologyMarks, "agricultureBiology", 100);
    validateNumericRange(errors, agriculturePhysicsMarks, "agriculturePhysics", 100);
    validateNumericRange(errors, agricultureChemistryMarks, "agricultureChemistry", 100);

    return errors;
  }, [
    agricultureBiologyMarks,
    artsScienceCuetMarks,
    agricultureChemistryMarks,
    agriculturePhysicsMarks,
    boardMarksTotal,
    chemistryMarks,
    clatMarks,
    engineeringEntranceMarks,
    lawBestSubjectOne,
    lawBestSubjectThree,
    lawBestSubjectTwo,
    mathsMarks,
    name,
    nataScore,
    neetMarks,
    paramedicalBiologyMarks,
    paramedicalChemistryMarks,
    paramedicalPhysicsMarks,
    phone,
    physicsMarks,
    selectedDegree,
    selectedLevel,
    showAgricultureFields,
    showBArchFields,
    showBArchNataField,
    showEngineeringFields,
    showEngineeringJeeAdvancedFields,
    showEngineeringPcmFields,
    showArtsScienceBoardMarksField,
    showArtsScienceCuetField,
    showLawClatFields,
    showLawMarksFields,
    showMedicalFields,
    showParamedicalFields,
  ]);

  const validationErrorCount = Object.keys(validationErrors).length;
  const hasValidationErrors = validationErrorCount > 0;
  const clearSubmittedValidation = () => {
    if (hasSubmitted) setHasSubmitted(false);
    if (validationStep !== null) setValidationStep(null);
    if (hasCalculatedPreview) setHasCalculatedPreview(false);
    if (showValidationPopup) setShowValidationPopup(false);
    if (inlineMatchQueryString) setInlineMatchQueryString("");
  };
  const updateAcademicValue = (fieldId: string, updateValue: () => void) => {
    clearSubmittedValidation();
    setTouchedFields((previous) => {
      if (!previous[fieldId]) return previous;
      const nextTouchedFields = { ...previous };
      delete nextTouchedFields[fieldId];
      return nextTouchedFields;
    });
    updateValue();
  };
  const markFieldTouched = (fieldId: string) => {
    setTouchedFields((previous) => (previous[fieldId] ? previous : { ...previous, [fieldId]: true }));
  };
  const isCompletedMarkField = (fieldId: string, value: string) =>
    Boolean(
      value.trim() &&
      !validationErrors[fieldId] &&
      (touchedFields[fieldId] || hasCalculatedPreview),
    );
  const engineeringPcmMarksReady =
    isCompletedMarkField("physics", physicsMarks) &&
    isCompletedMarkField("chemistry", chemistryMarks) &&
    isCompletedMarkField("maths", mathsMarks);
  const engineeringEntranceMarksReady = isCompletedMarkField(
    "engineeringEntranceMarks",
    engineeringEntranceMarks,
  );
  const neetMarksReady = isCompletedMarkField("neet", neetMarks);
  const bArchMarksReady =
    isCompletedMarkField("boardTotal", boardMarksTotal) &&
    (!showBArchNataField || isCompletedMarkField("nata", nataScore));
  const clatMarksReady = isCompletedMarkField("clat", clatMarks);
  const lawMarksReady =
    isCompletedMarkField("bestSubject1", lawBestSubjectOne) &&
    isCompletedMarkField("bestSubject2", lawBestSubjectTwo) &&
    isCompletedMarkField("bestSubject3", lawBestSubjectThree);
  const artsScienceCuetReady = isCompletedMarkField("artsScienceCuet", artsScienceCuetMarks);
  const artsScienceBoardReady = isCompletedMarkField("boardTotal", boardMarksTotal);
  const paramedicalMarksReady =
    isCompletedMarkField("paramedicalBiology", paramedicalBiologyMarks) &&
    isCompletedMarkField("paramedicalPhysics", paramedicalPhysicsMarks) &&
    isCompletedMarkField("paramedicalChemistry", paramedicalChemistryMarks);
  const agricultureMarksReady =
    isCompletedMarkField("agricultureBiology", agricultureBiologyMarks) &&
    isCompletedMarkField("agriculturePhysics", agriculturePhysicsMarks) &&
    isCompletedMarkField("agricultureChemistry", agricultureChemistryMarks);
  const showCalculatedScorePreview = hasCalculatedPreview && !hasValidationErrors;
  const inlineMatchParams = useMemo(
    () => new URLSearchParams(inlineMatchQueryString),
    [inlineMatchQueryString],
  );
  const pickInlineMatchParam = (key: string) => inlineMatchParams.get(key) || "";
  const inlineSubmittedDetails = useMemo(
    () =>
      Object.fromEntries(
        DETAIL_PARAM_KEYS.map((key) => [key, inlineMatchParams.get(key) || ""]),
      ),
    [inlineMatchParams],
  );
  const inlineEnteredScore =
    pickInlineMatchParam("cutoff") ||
    pickInlineMatchParam("marks") ||
    pickInlineMatchParam("rank");

  useEffect(() => {
    if (!inlineMatchQueryString) return;

    const frame = window.requestAnimationFrame(() => {
      inlineMatchResultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [inlineMatchQueryString]);

  useEffect(() => {
    setHasSubmitted(false);
    setValidationStep(null);
    setHasCalculatedPreview(false);
    setShowValidationPopup(false);
    setTouchedFields({});
  }, [activeStep]);

  const scrollToFirstInvalidField = () => {
    const firstInvalidField = VALIDATION_FIELD_ORDER.find((field) => validationErrors[field]);
    if (!firstInvalidField) return;

    window.requestAnimationFrame(() => {
      const fieldElement = document.querySelector<HTMLElement>(`[data-field-id="${firstInvalidField}"]`);
      if (!fieldElement) return;

      fieldElement.scrollIntoView({ behavior: "smooth", block: "center" });
      const control = fieldElement.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
        "input, select, textarea",
      );
      control?.focus();
    });
  };
  const isJuniorLevel = assessmentLevelOptions.has(selectedLevel);
  const juniorQuestionLevelGroup = getJuniorQuestionLevelGroup(selectedLevel);
  const selectedJuniorQuestionSet = useMemo(
    () =>
      juniorQuestionSets
        .filter(
          (set) =>
            normalizeText(set.degree) === normalizeText(selectedDegree) &&
            normalizeText(set.level) === normalizeText(juniorQuestionLevelGroup),
        )
        .sort((left, right) => new Date(right.savedAt || 0).getTime() - new Date(left.savedAt || 0).getTime())[0] ||
      null,
    [juniorQuestionLevelGroup, juniorQuestionSets, selectedDegree],
  );
  const juniorQuestionSubjectRows = useMemo(() => {
    if (!selectedJuniorQuestionSet) return [];

    const subjects =
      selectedJuniorQuestionSet.subjects.length > 0
        ? selectedJuniorQuestionSet.subjects
        : Object.keys(selectedJuniorQuestionSet.questionsBySubject);

    return subjects.map((subject) => ({
      subject,
      questions: selectedJuniorQuestionSet.questionsBySubject[subject] || [],
    }));
  }, [selectedJuniorQuestionSet]);
  const juniorQuestionTotal = juniorQuestionSubjectRows.reduce(
    (total, row) => total + row.questions.length,
    0,
  );
  const juniorQuestions = useMemo(
    () =>
      juniorQuestionSubjectRows.flatMap(({ subject, questions }) =>
        questions.map((question) => ({ ...question, subject })),
      ),
    [juniorQuestionSubjectRows],
  );
  const activeJuniorQuestion =
    juniorQuestions[Math.min(activeJuniorQuestionIndex, Math.max(juniorQuestions.length - 1, 0))] || null;
  const activeJuniorQuestionKey = activeJuniorQuestion
    ? `${activeJuniorQuestion.subject}-${activeJuniorQuestion.id}-${activeJuniorQuestionIndex}`
    : "";
  const selectedJuniorAnswer = activeJuniorQuestionKey ? juniorAnswers[activeJuniorQuestionKey] || "" : "";
  const juniorResultDate = useMemo(
    () =>
      new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date()),
    [],
  );
  const juniorAssessmentScale = getAssessmentScale(selectedDegree);
  const juniorResultRows = useMemo(
    () =>
      juniorQuestions.map((question, index) => {
        const questionKey = `${question.subject}-${question.id}-${index}`;
        const selectedAnswer = juniorAnswers[questionKey] || "";
        const selectedAnswerIndex = selectedAnswer ? selectedAnswer.charCodeAt(0) - 65 : -1;
        const selectedAnswerText =
          selectedAnswerIndex >= 0 ? question.options[selectedAnswerIndex] || "" : "";
        const correctAnswer = (question.correctAnswer || "").trim();
        const correctAnswerIndex = /^[A-D]$/i.test(correctAnswer)
          ? correctAnswer.toUpperCase().charCodeAt(0) - 65
          : -1;
        const correctAnswerLabel = correctAnswerIndex >= 0 ? correctAnswer.toUpperCase() : "";
        const correctAnswerText =
          correctAnswerIndex >= 0 ? question.options[correctAnswerIndex] || correctAnswer : correctAnswer;
        const isCorrect =
          Boolean(selectedAnswer) &&
          (selectedAnswer.toUpperCase() === correctAnswer.toUpperCase() ||
            normalizeText(selectedAnswerText) === normalizeText(correctAnswer));

        return {
          ...question,
          correctAnswer: correctAnswerLabel,
          correctAnswerText,
          isCorrect,
          selectedAnswer,
          selectedAnswerText,
        };
      }),
    [juniorAnswers, juniorQuestions],
  );
  const juniorCorrectCount = juniorResultRows.filter((row) => row.isCorrect).length;
  const juniorPercentage = juniorQuestionTotal > 0 ? (juniorCorrectCount / juniorQuestionTotal) * 100 : 0;
  const juniorOverallScore = (juniorPercentage / 100) * juniorAssessmentScale;
  const juniorResultTone = getAssessmentTone(juniorPercentage);
  const juniorSubjectResults = useMemo(
    () =>
      juniorQuestionSubjectRows.map(({ subject }) => {
        const rows = juniorResultRows.filter((row) => row.subject === subject);
        const correct = rows.filter((row) => row.isCorrect).length;
        const total = rows.length;
        const percentage = total > 0 ? (correct / total) * 100 : 0;
        return {
          subject,
          correct,
          total,
          percentage,
          rows,
          tone: getAssessmentTone(percentage),
        };
      }),
    [juniorQuestionSubjectRows, juniorResultRows],
  );
  const activeJuniorSubjectResult =
    juniorSubjectResults.find((row) => row.subject === activeJuniorResultSubject) ||
    juniorSubjectResults[0] ||
    null;
  const juniorCollegeSuggestions = useMemo<JuniorCollegeSuggestion[]>(() => {
    if (!hasSubmittedJuniorTest || juniorOverallScore <= 0 || !selectedDegree) return [];

    const mappedSuggestions = new Map<string, JuniorCollegeSuggestion>();

    eligibleCourses.forEach((course) => {
      if (!courseMatchesDegree(course, selectedDegree)) return;

      const courseName = [course.courseName || course.course, course.specialization]
        .map((item) => String(item || "").trim())
        .filter(Boolean)
        .join(" - ");
      const details =
        Array.isArray(course.collegeDetails) && course.collegeDetails.length
          ? course.collegeDetails
          : [
              {
                college: course.collegeId || course.college,
                cutoff: course.cutoff,
                cutoffText: course.cutoffText,
              },
            ];

      details.forEach((detail) => {
        const rawCollegeKey = normalizeText(String(detail.college || ""));
        const college = colleges.find(
          (item) =>
            normalizeText(item.id) === rawCollegeKey ||
            normalizeText(item.name) === rawCollegeKey ||
            normalizeText(item.collegeCode || "") === rawCollegeKey,
        );

        if (!college || !collegeMatchesDegree(college, selectedDegree)) return;

        const rawCutoff = detail.cutoffText || course.cutoffText || detail.cutoff || course.cutoff;
        const parsedCutoff = parseCutoffValue(rawCutoff);
        if (!parsedCutoff) return;

        const requiredCutoff = Math.max(parsedCutoff.start, parsedCutoff.end);
        if (requiredCutoff > juniorOverallScore) return;

        const suggestionKey = college.id;
        const existing = mappedSuggestions.get(suggestionKey);
        const nextSuggestion: JuniorCollegeSuggestion = {
          id: suggestionKey,
          collegeId: college.id,
          collegeName: college.name,
          location: [college.district, college.state].filter(Boolean).join(", "),
          courseName,
          logo: String(college.logo || college.image || ""),
          cutoff: requiredCutoff,
          cutoffLabel:
            parsedCutoff.start === parsedCutoff.end
              ? formatScoreNumber(requiredCutoff)
              : `${formatScoreNumber(parsedCutoff.start)} - ${formatScoreNumber(parsedCutoff.end)}`,
          ranking: formatRankingRangeForDisplay(college.ranking),
          ownershipType: String(college.ownershipType || "Private"),
          accreditation: String(college.accreditation || "NAAC A"),
          establishedYear: String(college.establishedYear || "Est. --"),
          placementRate: Number(college.placementRate || 0),
          href: `/college/${college.id}`,
        };

        if (!existing || nextSuggestion.cutoff > existing.cutoff) {
          mappedSuggestions.set(suggestionKey, nextSuggestion);
        }
      });
    });

    const sortedSuggestions = Array.from(mappedSuggestions.values()).sort((left, right) => {
      if (right.cutoff !== left.cutoff) return right.cutoff - left.cutoff;
      if (right.placementRate !== left.placementRate) return right.placementRate - left.placementRate;
      return left.collegeName.localeCompare(right.collegeName);
    });
    const stateMatchedSuggestions = sortedSuggestions.filter(
      (suggestion) => normalizeText(suggestion.location).includes(normalizeText(selectedState)),
    );

    return (stateMatchedSuggestions.length ? stateMatchedSuggestions : sortedSuggestions).slice(0, 12);
  }, [
    colleges,
    eligibleCourses,
    hasSubmittedJuniorTest,
    juniorOverallScore,
    selectedDegree,
    selectedState,
  ]);
  const sortedJuniorCollegeSuggestions = useMemo(() => {
    const suggestions = [...juniorCollegeSuggestions];
    const getYear = (suggestion: JuniorCollegeSuggestion) => {
      const parsedYear = Number.parseInt(suggestion.establishedYear, 10);
      return Number.isFinite(parsedYear) ? parsedYear : 0;
    };

    if (suggestionSort === "newest") {
      return suggestions.sort((left, right) => getYear(right) - getYear(left));
    }
    if (suggestionSort === "oldest") {
      return suggestions.sort((left, right) => getYear(left) - getYear(right));
    }
    return suggestions.sort((left, right) => left.collegeName.localeCompare(right.collegeName));
  }, [juniorCollegeSuggestions, suggestionSort]);
  const suggestionSortLabel =
    suggestionSort === "newest" ? "Newest first" : suggestionSort === "oldest" ? "Oldest first" : "Alphabetical";
  const suggestionPageCount = Math.max(1, Math.ceil(sortedJuniorCollegeSuggestions.length / SUGGESTIONS_PER_PAGE));
  const visibleJuniorCollegeSuggestions = useMemo(() => {
    const startIndex = (suggestionPage - 1) * SUGGESTIONS_PER_PAGE;
    return sortedJuniorCollegeSuggestions.slice(startIndex, startIndex + SUGGESTIONS_PER_PAGE);
  }, [sortedJuniorCollegeSuggestions, suggestionPage]);
  const suggestionStartNumber = sortedJuniorCollegeSuggestions.length
    ? (suggestionPage - 1) * SUGGESTIONS_PER_PAGE + 1
    : 0;
  const suggestionEndNumber = Math.min(
    suggestionPage * SUGGESTIONS_PER_PAGE,
    sortedJuniorCollegeSuggestions.length,
  );
  const visibleSuggestionPageNumbers = useMemo(() => {
    const visibleCount = Math.min(5, suggestionPageCount);
    const halfWindow = Math.floor(visibleCount / 2);
    let startPage = Math.max(1, suggestionPage - halfWindow);
    const endPage = Math.min(suggestionPageCount, startPage + visibleCount - 1);
    startPage = Math.max(1, endPage - visibleCount + 1);

    return Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index);
  }, [suggestionPage, suggestionPageCount]);

  useEffect(() => {
    setSuggestionPage(1);
  }, [suggestionSort, suggestionView, sortedJuniorCollegeSuggestions.length]);

  useEffect(() => {
    setSuggestionPage((page) => Math.min(page, suggestionPageCount));
  }, [suggestionPageCount]);

  useEffect(() => {
    if (!shouldScrollSuggestedCollegesRef.current) return;
    shouldScrollSuggestedCollegesRef.current = false;

    window.requestAnimationFrame(() => {
      suggestedCollegesListRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [suggestionPage]);

  const goToSuggestionPage = (page: number) => {
    const nextPage = Math.min(Math.max(page, 1), suggestionPageCount);
    shouldScrollSuggestedCollegesRef.current = true;
    setSuggestionPage(nextPage);
    if (nextPage === suggestionPage) {
      window.requestAnimationFrame(() => {
        shouldScrollSuggestedCollegesRef.current = false;
        suggestedCollegesListRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  };

  useEffect(() => {
    if (!hasRestoredPersistedForm) return;

    const currentQuestionSetId = selectedJuniorQuestionSet?.id || "";
    if (previousJuniorQuestionSetIdRef.current === null) {
      previousJuniorQuestionSetIdRef.current = currentQuestionSetId;
      return;
    }
    if (previousJuniorQuestionSetIdRef.current === "" && currentQuestionSetId && hasSubmittedJuniorTest) {
      previousJuniorQuestionSetIdRef.current = currentQuestionSetId;
      return;
    }
    if (previousJuniorQuestionSetIdRef.current === currentQuestionSetId) return;

    previousJuniorQuestionSetIdRef.current = currentQuestionSetId;
    setActiveJuniorQuestionIndex(0);
    setJuniorAnswers({});
    setJuniorTimerSeconds(0);
    setHasStartedJuniorTest(false);
    setHasSubmittedJuniorTest(false);
    setActiveJuniorResultSubject("");
  }, [hasRestoredPersistedForm, hasSubmittedJuniorTest, selectedJuniorQuestionSet?.id]);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      activeStep !== 5 ||
      !hasSubmittedJuniorTest ||
      sortedJuniorCollegeSuggestions.length === 0 ||
      window.sessionStorage.getItem(FIND_RETURN_TO_SUGGESTIONS_KEY) !== "1"
    ) {
      return;
    }

    window.sessionStorage.removeItem(FIND_RETURN_TO_SUGGESTIONS_KEY);
    window.requestAnimationFrame(() => {
      suggestedCollegesListRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [activeStep, hasSubmittedJuniorTest, sortedJuniorCollegeSuggestions.length]);

  useEffect(() => {
    if (!hasStartedJuniorTest || !activeJuniorQuestion || hasSubmittedJuniorTest || juniorTimerSeconds >= JUNIOR_TEST_DURATION_SECONDS) return;

    const timerId = window.setInterval(() => {
      setJuniorTimerSeconds((seconds) => Math.min(JUNIOR_TEST_DURATION_SECONDS, seconds + 1));
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [activeJuniorQuestion, hasStartedJuniorTest, hasSubmittedJuniorTest, juniorTimerSeconds]);

  const selectJuniorAnswer = (optionIndex: number) => {
    if (!hasStartedJuniorTest || !activeJuniorQuestionKey) return;
    setJuniorAnswers((previous) => ({
      ...previous,
      [activeJuniorQuestionKey]: String.fromCharCode(65 + optionIndex),
    }));
  };

  const goToNextJuniorQuestion = () => {
    setActiveJuniorQuestionIndex((index) => Math.min(index + 1, Math.max(juniorQuestions.length - 1, 0)));
  };

  const goToPreviousJuniorQuestion = () => {
    setActiveJuniorQuestionIndex((index) => Math.max(index - 1, 0));
  };

  const submitJuniorTest = () => {
    if (!selectedJuniorAnswer) return;
    setActiveJuniorResultSubject(juniorSubjectResults[0]?.subject || "");
    setHasSubmittedJuniorTest(true);
    setActiveStep(5);
  };

  const resetJuniorAssessment = () => {
    setActiveJuniorQuestionIndex(0);
    setJuniorAnswers({});
    setJuniorTimerSeconds(0);
    setHasStartedJuniorTest(false);
    setHasSubmittedJuniorTest(false);
    setActiveJuniorResultSubject("");
    if (isJuniorLevel) {
      setActiveStep(4);
    }
  };

  const stepLabels = [
    "Basic Details",
    "Pick Your Level",
    "Pick Your Degree Stream",
    isSeniorSecondaryLevel ? "Academic Details" : "Assessment Test",
    "Results",
  ];
  const progressLabels = stepLabels;
  const visibleStep = inlineMatchQueryString ? 5 : activeStep;
  const submittedForCurrentStep = hasClientMounted && hasSubmitted && validationStep === activeStep;
  const currentStepFields =
    activeStep === 1
      ? ["name", "phone"]
      : activeStep === 2
        ? ["level"]
      : activeStep === 3
        ? ["degree"]
        : activeStep === 4 && isSeniorSecondaryLevel
          ? VALIDATION_FIELD_ORDER.filter((field) => !["name", "phone", "degree"].includes(field))
          : [];
  const currentStepHasErrors = currentStepFields.some((field) => validationErrors[field]);
  const goToNextStep = () => {
    if (currentStepHasErrors) {
      setHasSubmitted(true);
      setValidationStep(activeStep);
      setShowValidationPopup(false);
      scrollToFirstInvalidField();
      return;
    }

    if (activeStep === 1 && !isAuthenticated) {
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(FIND_AUTH_RETURN_STEP_KEY, "2");
      }
      setShowAuthGate(true);
      return;
    }

    setShowValidationPopup(false);
    setHasSubmitted(false);
    setValidationStep(null);
    setTouchedFields({});
    setInlineMatchQueryString("");
    if (activeStep === 3 && assessmentLevelOptions.has(selectedLevel)) {
      resetJuniorAssessment();
    }
    setActiveStep((step) => Math.min(step + 1, 4));
  };
  const goToPreviousStep = () => {
    setShowValidationPopup(false);
    setHasSubmitted(false);
    setValidationStep(null);
    setInlineMatchQueryString("");
    if (activeStep === 5 && isJuniorLevel) {
      setHasSubmittedJuniorTest(false);
    }
    setActiveStep((step) => Math.max(step - 1, 1));
  };
  const goBackFromInlineResults = () => {
    setShowValidationPopup(false);
    setHasSubmitted(false);
    setValidationStep(null);
    setInlineMatchQueryString("");
    setActiveStep(4);
  };
  const handleCalculate = () => {
    setHasSubmitted(true);
    if (hasValidationErrors) {
      setValidationStep(activeStep);
      setHasCalculatedPreview(false);
      setShowValidationPopup(false);
      scrollToFirstInvalidField();
      return;
    }
    setShowValidationPopup(false);
    setValidationStep(null);
    setHasCalculatedPreview(true);
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(
        FIND_FORM_STORAGE_KEY,
        JSON.stringify(persistedFindFormState),
      );
    }
    const params = new URLSearchParams();
    params.set("name", name);
    params.set("phone", phone);
    params.set("level", selectedLevel);
    params.set("state", selectedState);
    params.set("degree", selectedDegree);
    if (selectedCategory) params.set("category", normalizeCategorySelection(selectedCategory));
    if (selectedDreamCollege) params.set("dreamCollege", selectedDreamCollege);
    if (selectedCourse) params.set("course", selectedCourse);
    if (
      selectedAdmissionType &&
      (showEngineeringFields || showLawFields || showArtsScienceAdmissionTypeField)
    ) {
      params.set("admissionType", selectedAdmissionType);
    }
    if (showEngineeringPcmFields && physicsMarks) params.set("physics", physicsMarks);
    if (showEngineeringPcmFields && chemistryMarks) params.set("chemistry", chemistryMarks);
    if (showEngineeringPcmFields && mathsMarks) params.set("maths", mathsMarks);
    if ((showEngineeringJeeMainFields || showEngineeringJeeAdvancedFields) && engineeringEntranceMarks) {
      params.set("engineeringScore", engineeringEntranceMarks);
    }
    if (showMedicalFields && neetMarks) params.set("neet", neetMarks);
    if (showBArchFields && boardMarksTotal) params.set("boardTotal", boardMarksTotal);
    if (showBArchNataField && nataScore) params.set("nata", nataScore);
    if (bArchConvertedScore) params.set("converted12th", bArchConvertedScore);
    if (showLawClatFields && clatMarks) params.set("clat", clatMarks);
    if (showLawMarksFields && lawBestSubjectOne) params.set("bestSubject1", lawBestSubjectOne);
    if (showLawMarksFields && lawBestSubjectTwo) params.set("bestSubject2", lawBestSubjectTwo);
    if (showLawMarksFields && lawBestSubjectThree) params.set("bestSubject3", lawBestSubjectThree);
    if (showArtsScienceBoardMarksField && boardMarksTotal) params.set("boardTotal", boardMarksTotal);
    if (showArtsScienceCuetField && artsScienceCuetMarks) params.set("artsScienceCuet", artsScienceCuetMarks);
    if (showParamedicalFields && paramedicalBiologyMarks) params.set("paramedicalBiology", paramedicalBiologyMarks);
    if (showParamedicalFields && paramedicalPhysicsMarks) params.set("paramedicalPhysics", paramedicalPhysicsMarks);
    if (showParamedicalFields && paramedicalChemistryMarks) params.set("paramedicalChemistry", paramedicalChemistryMarks);
    if (showAgricultureFields && agricultureBiologyMarks) params.set("agricultureBiology", agricultureBiologyMarks);
    if (showAgricultureFields && agriculturePhysicsMarks) params.set("agriculturePhysics", agriculturePhysicsMarks);
    if (showAgricultureFields && agricultureChemistryMarks) params.set("agricultureChemistry", agricultureChemistryMarks);
    if (finalCutoffValue) params.set("cutoff", finalCutoffValue);
    if (typeof window !== "undefined") {
      const findUrl = `/find?${params.toString()}`;
      window.history.replaceState(window.history.state, "", findUrl);
    }
    if (isJuniorLevel) {
      setActiveStep(4);
      setInlineMatchQueryString("");
      return;
    }
    setActiveStep(5);
    setInlineMatchQueryString(params.toString());
  };

  return (
    <>
      <Navbar />
      <FindAuthModal
        isOpen={showAuthGate && !isAuthenticated}
        redirectPath={currentRoute}
        onClose={() => setShowAuthGate(false)}
        onAuthenticated={(user) => {
          setCurrentUser(user);
          setShowAuthGate(false);
        }}
      />
      <main className="find-theme min-h-screen overflow-x-hidden bg-white text-[#0F1B25]">
      {showValidationPopup ? (
        <div className="fixed inset-0 z-[90] flex items-start justify-center bg-[#071333]/35 px-4 pt-24 backdrop-blur-[2px] sm:pt-28">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="validation-popup-title"
            aria-describedby="validation-popup-message"
            className="w-full max-w-[420px] overflow-hidden rounded-[18px] border border-[#d8dff2] bg-white shadow-[0_24px_70px_rgba(7,19,51,0.28)]"
          >
            <div className="flex items-start gap-3 border-b border-[#eef2ff] bg-[linear-gradient(135deg,#ffffff_0%,#f7f9ff_55%,#fff4f5_100%)] px-5 py-4">
              <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full border border-[#ffd0d5] bg-[#fff1f3] text-[#ff4d5e] shadow-[0_8px_20px_rgba(255,77,94,0.16)]">
                <CircleAlert className="size-5" strokeWidth={2.4} />
              </div>
              <div className="min-w-0 flex-1">
                <h2 id="validation-popup-title" className="text-[1rem] font-bold text-[#142a63]">
                  Complete the required details
                </h2>
                <p id="validation-popup-message" className="mt-1 text-[0.9rem] leading-5 text-[#4f5f89]">
                  {validationErrorCount === 1
                    ? "One field needs your attention before calculating."
                    : `${validationErrorCount} fields need your attention before calculating.`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowValidationPopup(false)}
                className="flex size-8 shrink-0 items-center justify-center rounded-full text-[#52618a] transition hover:bg-white hover:text-[#142a63]"
                aria-label="Close validation message"
              >
                <X className="size-4.5" />
              </button>
            </div>
            <div className="px-5 py-4">
              <p className="text-[0.92rem] leading-6 text-[#304061]">
                Please fill all mandatory fields. The first missing field has been highlighted for you.
              </p>
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowValidationPopup(false)}
                  className="inline-flex h-10 items-center justify-center rounded-[10px] bg-[#142a63] px-5 text-[0.9rem] font-semibold text-white shadow-[0_12px_22px_rgba(20,42,99,0.22)] transition hover:bg-[#0f1f4a]"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      <div className="px-2 pb-8 pt-2 sm:px-4 lg:px-6 2xl:px-8">
        <div className="mx-auto w-full max-w-[1600px]">
          <div className="space-y-4">
            <nav
              aria-label="Find college progress"
              className="sticky top-0 z-40 overflow-hidden rounded-[8px] border border-[#E6E6E6] bg-white/95 px-2 py-1.5 shadow-[0_8px_22px_rgba(15,27,37,0.08)] backdrop-blur md:px-4 md:py-1.5"
            >
              <div className="grid grid-cols-[minmax(42px,1fr)_16px_minmax(42px,1fr)_16px_minmax(42px,1fr)_16px_minmax(42px,1fr)_16px_minmax(42px,1fr)] items-start gap-0 md:grid-cols-[repeat(9,minmax(0,1fr))]">
                {progressLabels.map((label, index) => {
                  const stepNumber = index + 1;
                  const isCompleted = stepNumber < visibleStep;
                  const isCurrent = stepNumber === visibleStep;
                  const StepIcon =
                    stepNumber === 1
                      ? User
                      : stepNumber === 2
                        ? School
                        : stepNumber === 3
                          ? Building2
                          : stepNumber === 4
                            ? Brain
                            : Trophy;
                  return (
                    <div key={label} className="contents">
                      <div
                        className={`relative flex min-w-0 flex-col items-center justify-start gap-px pb-1 text-center ${
                          isCurrent ? "text-[#0F1B25]" : isCompleted ? "text-[#0F1B25]" : "text-[#5F6B76]"
                        }`}
                        aria-current={isCurrent ? "step" : undefined}
                      >
                        <span
                          className={`flex size-5 shrink-0 items-center justify-center rounded-full border text-[0.64rem] font-semibold md:size-5 md:text-[0.66rem] ${
                            isCompleted
                              ? "border-[#0F1B25] bg-[#0F1B25] text-white"
                              : isCurrent
                                ? "border-[#0F1B25] bg-[#0F1B25] text-white shadow-[0_8px_16px_rgba(15,27,37,0.14)]"
                                : "border-[#D7DCE2] bg-white text-[#0F1B25]"
                          }`}
                        >
                          {isCompleted ? <Check className="size-3.5 md:size-4" /> : stepNumber}
                        </span>
                        <StepIcon
                          className={`size-3.5 stroke-[1.9] md:size-4 ${
                            isCompleted || isCurrent ? "text-[#F4B400]" : "text-[#7C8793]"
                          }`}
                        />
                        <span className="min-w-0 text-[8.5px] font-semibold leading-[10px] md:text-[11px] md:leading-3.5">{label}</span>
                        {isCurrent ? (
                          <span className="absolute bottom-0 left-1/2 h-0.5 w-12 -translate-x-1/2 rounded-full bg-[#F4B400] md:w-[66%]" />
                        ) : null}
                      </div>
                      {index < progressLabels.length - 1 ? (
                        <div className="mt-2 h-px self-start bg-[#DDE2E7]" aria-hidden="true" />
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </nav>

          <section className="w-full rounded-[8px] border border-[#E6E6E6] bg-white px-3 py-3 shadow-[0_12px_24px_rgba(15,27,37,0.06)] sm:px-4 md:px-5 md:py-4">
            <div className="flex flex-col gap-3">
            <form
              noValidate
              onInputCapture={clearSubmittedValidation}
              onChangeCapture={clearSubmittedValidation}
              onSubmit={(event) => {
                event.preventDefault();
                if (activeStep < 4) {
                  goToNextStep();
                  return;
                }
                handleCalculate();
              }}
              className="p-0"
            >
              {!inlineMatchQueryString ? (
                <>
                {activeStep === 1 ? (
                  <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,0.98fr)_minmax(340px,1fr)] lg:pl-6 xl:pl-10">
                    <div className="premium-onboarding-card min-w-0 rounded-[18px] bg-white p-2.5 shadow-none sm:p-3 lg:p-3">
                      <div className="mb-2 max-w-xl">
                        <div className="inline-flex items-center gap-2 rounded-[12px] border border-[#ffe08a] bg-white px-3 py-1.5 text-[12px] font-semibold leading-none text-[#8f6a00]">
                          <Sparkles className="size-4 shrink-0 text-[#FFC107]" />
                          <span className="translate-y-px">Live onboarding</span>
                        </div>
                        <h3 className="mt-2 text-[20px] font-semibold leading-none tracking-[-0.03em] text-[#0F1B25] sm:text-[22px]">
                          Basic Details
                        </h3>
                        <div className="mt-1 max-w-lg text-[13px] font-normal leading-5 text-[#5F6B76] sm:text-[13px]">
                          Please enter your basic details to continue.
                        </div>
                      </div>

                      <div className="grid w-full max-w-[560px] grid-cols-1 gap-2">
                        <div data-field-id="name" className="space-y-1">
                          <label htmlFor="find-name" className="block text-[13px] font-semibold text-[#0F1B25]">
                            Full Name
                          </label>
                          <div
                            className={`flex h-10 items-center gap-2.5 rounded-[12px] bg-white px-3.5 shadow-[0_10px_28px_rgba(17,24,39,0.05)] backdrop-blur-sm transition ${
                              submittedForCurrentStep && validationErrors.name
                                ? "ring-1 ring-[#ff4d5e]"
                                : "ring-1 ring-[#f1e6bf] focus-within:ring-[#FFC107]"
                            }`}
                          >
                            <User className="size-4 shrink-0 text-[#6b7280]" />
                            <input
                              id="find-name"
                              type="text"
                              value={name}
                              onChange={(event) => setName(event.target.value)}
                              placeholder="Enter your full name"
                              className="h-full w-full border-0 bg-transparent p-0 text-[13px] font-medium text-[#0F1B25] outline-none placeholder:text-[#9aa1ad]"
                              aria-invalid={Boolean(submittedForCurrentStep && validationErrors.name)}
                              required
                            />
                            {hasNameVerification && !(submittedForCurrentStep && validationErrors.name) ? (
                              <span className="profile-check-pop inline-flex size-7 items-center justify-center rounded-full bg-[#eaf9ef] text-[#16a34a]">
                                <BadgeCheck className="size-4" />
                              </span>
                            ) : null}
                          </div>
                          {submittedForCurrentStep && validationErrors.name ? (
                            <div className="flex items-center gap-2 text-[14px] font-medium text-[#ff4d5e]">
                              <CircleAlert className="size-4 shrink-0" />
                              <span>{validationErrors.name}</span>
                            </div>
                          ) : null}
                        </div>

                        <div data-field-id="phone" className="space-y-1">
                          <label htmlFor="find-phone" className="block text-[13px] font-semibold text-[#0F1B25]">
                            Phone Number
                          </label>
                          <div
                            className={`flex h-10 items-center gap-2.5 rounded-[12px] bg-white px-3.5 shadow-[0_10px_28px_rgba(17,24,39,0.05)] backdrop-blur-sm transition ${
                              submittedForCurrentStep && validationErrors.phone
                                ? "ring-1 ring-[#ff4d5e]"
                                : "ring-1 ring-[#f1e6bf] focus-within:ring-[#FFC107]"
                            }`}
                          >
                            <Phone className="size-4 shrink-0 text-[#6b7280]" />
                            <input
                              id="find-phone"
                              type="tel"
                              value={phone}
                              onChange={(event) => setPhone(event.target.value.replace(/\D/g, "").slice(0, 10))}
                              placeholder="Enter 10 digit mobile number"
                              className="h-full w-full border-0 bg-transparent p-0 text-[13px] font-medium text-[#0F1B25] outline-none placeholder:text-[#9aa1ad]"
                              aria-invalid={Boolean(submittedForCurrentStep && validationErrors.phone)}
                              inputMode="numeric"
                              pattern="[0-9]{10}"
                              maxLength={10}
                              minLength={10}
                              required
                            />
                            {hasPhoneVerification ? (
                              <span className="profile-check-pop inline-flex size-7 items-center justify-center rounded-full bg-[#eaf9ef] text-[#16a34a]">
                                <BadgeCheck className="size-4" />
                              </span>
                            ) : null}
                          </div>
                          {submittedForCurrentStep && validationErrors.phone ? (
                            <div className="flex items-center gap-2 text-[14px] font-medium text-[#ff4d5e]">
                              <CircleAlert className="size-4 shrink-0" />
                              <span>{validationErrors.phone}</span>
                            </div>
                          ) : null}
                        </div>

                        <div className="mt-1 flex flex-col gap-2.5 sm:flex-row sm:gap-4">
                          <button
                            type="button"
                            onClick={resetFormFields}
                            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[6px] border border-[#E6E6E6] bg-white px-6 text-[16px] font-medium text-[#0F1B25] shadow-[0_5px_14px_rgba(15,27,37,0.04)] transition hover:bg-[#F8F9FB] sm:w-auto sm:min-w-[154px]"
                          >
                            <ArrowRight className="size-4 rotate-180" />
                            Back
                          </button>
                          <button
                            type="button"
                            onClick={goToNextStep}
                            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[6px] bg-[#f4b400] px-6 text-[16px] font-medium !text-[#0F1B25] shadow-[0_10px_18px_rgba(244,180,0,0.22)] transition hover:bg-[#e8ab00] sm:w-auto sm:min-w-[154px]"
                          >
                            Next
                            <ArrowRight className="size-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="relative hidden w-full self-stretch lg:block">
                      <div className="premium-profile-card profile-card-float relative w-full overflow-hidden rounded-[22px] border border-[#e5e7eb] bg-white p-1.5 shadow-[0_18px_38px_rgba(15,27,37,0.08)] sm:p-2">
                        <div className="pointer-events-none absolute inset-0 overflow-hidden">
                          <div className="absolute left-[-20px] top-[-24px] size-20 rounded-full bg-white/70 blur-2xl" />
                          <div className="absolute right-[-28px] top-10 size-28 rounded-full bg-white/60 blur-3xl" />
                          <span className="absolute left-4 top-16 text-[#f4b400]/18">
                            <Sparkles className="size-4" />
                          </span>
                          <span className="absolute right-12 top-24 text-[#f4b400]/18">
                            <Sparkles className="size-4" />
                          </span>
                          <span className="absolute bottom-24 left-8 text-[#f4b400]/12">
                            <Sparkles className="size-3.5" />
                          </span>
                          <span className="absolute bottom-28 right-6 text-[#f4b400]/12">
                            <Sparkles className="size-3.5" />
                          </span>
                        </div>

                        <div className="relative z-10">
                          <div className="mb-1 flex items-start justify-between gap-2">
                            <div>
                              <div className="text-[14px] font-semibold tracking-[-0.03em] text-[#172554] sm:text-[14px]">
                                Live Profile Card
                              </div>
                              <div className="mt-0.5 h-0.5 w-8 rounded-full bg-[#f4b400]" />
                            </div>
                            <span className="inline-flex items-center gap-2 rounded-full border border-[#f3df9a] bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-[#172554] shadow-[0_10px_24px_rgba(148,111,9,0.08)]">
                              <span className="relative flex size-3 items-center justify-center rounded-full bg-[#fff4cc] text-[#f4b400]">
                                <span className="size-2 rounded-full bg-[#f4b400]" />
                              </span>
                              Live
                            </span>
                          </div>

                          <div className="grid items-center gap-2 lg:grid-cols-[minmax(0,1.12fr)_minmax(108px,0.72fr)]">
                            <div className="grid gap-2 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center">
                              <div className="avatar-glow relative flex size-[64px] items-center justify-center rounded-full border-[6px] border-[#eef2ff] bg-[#ffc107] shadow-[0_14px_22px_rgba(15,27,37,0.08)] sm:size-[72px]">
                                <User className="size-6.5 text-white sm:size-7" strokeWidth={2} />
                                <span className="absolute right-0.5 top-1.5 flex size-5.5 items-center justify-center rounded-full border-2 border-white bg-[#17356f] text-white shadow-[0_10px_18px_rgba(23,53,111,0.22)]">
                                  <BadgeCheck className="size-3" />
                                </span>
                              </div>

                              <div className="min-w-0 text-center sm:text-left">
                                <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                                  <div className="profile-name-fade text-[19px] font-semibold tracking-[-0.05em] text-[#172554] sm:text-[20px]">
                                    {profileDisplayName || "Student"}
                                  </div>
                                  <span className="inline-flex items-center justify-center rounded-full bg-[#fff7df] px-1.5 py-0.5 text-[#f4b400]">
                                    <BadgeCheck className="size-2.5" />
                                  </span>
                                </div>

                                <div className="mt-1 flex flex-wrap justify-center gap-1 sm:justify-start">
                                  <span className="inline-flex items-center gap-1 rounded-full border border-[#e5e7eb] bg-white px-1.5 py-0.5 text-[9px] font-semibold text-[#172554] shadow-[0_8px_18px_rgba(17,24,39,0.04)]">
                                    <BadgeCheck className="size-2.5 text-[#f4b400]" />
                                    Verified Student
                                  </span>
                                  <span className="inline-flex items-center gap-1 rounded-full border border-[#e5e7eb] bg-white px-1.5 py-0.5 text-[9px] font-semibold text-[#172554] shadow-[0_8px_18px_rgba(17,24,39,0.04)]">
                                    <Sparkles className="size-2.5 text-[#f4b400]" />
                                    Active Learner
                                  </span>
                                  <span className="inline-flex items-center gap-1 rounded-full border border-[#e5e7eb] bg-white px-1.5 py-0.5 text-[9px] font-semibold text-[#172554] shadow-[0_8px_18px_rgba(17,24,39,0.04)]">
                                    <Award className="size-2.5 text-[#f4b400]" />
                                    Top Performer
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="relative mx-auto hidden min-h-[120px] w-full max-w-[260px] items-center justify-center md:flex lg:justify-end xl:max-w-[300px]">
                              <Image
                                src="/find-step-basic-illustration.png"
                                alt="Clipboard illustration"
                                fill
                                unoptimized
                                sizes="(min-width: 1280px) 480px, (min-width: 1024px) 390px, 320px"
                                className="object-contain"
                              />
                            </div>
                          </div>

                          <div className="mt-1.5 grid gap-2 md:grid-cols-2">
                            <div className="rounded-[16px] border border-[#e5e7eb] bg-white p-2 shadow-[0_14px_32px_rgba(17,24,39,0.06)]">
                              <div className="flex items-center gap-2">
                                <span className="flex size-6 shrink-0 items-center justify-center rounded-[11px] bg-[#f4b400] text-[#172554] shadow-[0_10px_18px_rgba(244,180,0,0.22)]">
                                  <Phone className="size-3" />
                                </span>
                                <div className="min-w-0 flex-1 text-left">
                                  <div className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#6c7a99]">
                                    Phone Number
                                  </div>
                                  <div className="mt-0.5 text-[11px] font-semibold tracking-[-0.04em] text-[#172554]">
                                    {profileDisplayPhone || "Enter phone number"}
                                  </div>
                                </div>
                                <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-[#e5e7eb] bg-white text-[#172554]">
                                  <Phone className="size-2.5 rotate-[20deg]" />
                                </span>
                              </div>
                            </div>

                            <div className="rounded-[16px] border border-[#e5e7eb] bg-white p-2 shadow-[0_14px_32px_rgba(17,24,39,0.06)]">
                              <div className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_88px] lg:items-center">
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 text-[#172554]">
                                    <div className="flex size-[22px] items-center justify-center rounded-full bg-[#fff7df] text-[#f4b400]">
                                      <Sparkles className="size-2.5" />
                                    </div>
                                    <span className="text-[11px] font-semibold">Profile Completion</span>
                                  </div>

                                  <div className="mt-1.5 flex items-center gap-2">
                                    <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-[#e8edf5]">
                                      <div
                                        className="profile-progress-fill h-full rounded-full bg-[linear-gradient(90deg,#f4b400,#ffc107,#17356f)] transition-[width] duration-300 ease-out"
                                        style={{ width: `${displayedProfileProgress}%` }}
                                      />
                                    </div>
                                    <div key={profileCompletionPercent} className="profile-count-up text-[13px] font-semibold tracking-[-0.04em] text-[#f4b400]">
                                      {profileCompletionPercent}%
                                    </div>
                                  </div>

                                  <div className="mt-1 text-[10px] font-normal leading-[1.25rem] text-[#6c7a99]">
                                    {isProfileReady
                                      ? "Awesome! Your profile is complete."
                                      : profileCompletionPercent > 0
                                        ? "Great start. Add the remaining details to finish your profile."
                                        : "Start by entering your name and phone number."}
                                  </div>
                                </div>

                                <div className="mx-auto flex items-center justify-center">
                                  <div
                                    className="flex size-[72px] items-center justify-center rounded-full p-[5px]"
                                    style={{
                                      background: `conic-gradient(#17356f ${displayedProfileProgress * 3.6}deg, #f4b400 0deg, #f4b400 360deg)`,
                                    }}
                                  >
                                    <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-white text-[#172554] shadow-[inset_0_0_0_1px_rgba(232,223,196,0.9)]">
                                      <div className="text-[12px] font-semibold leading-none tracking-[-0.04em] text-[#172554]">
                                        {profileCompletionPercent}%
                                      </div>
                                      <div className="mt-0.5 whitespace-nowrap text-[7px] font-semibold uppercase leading-none tracking-[0.02em] text-[#6c7a99]">
                                        Complete
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}

              {activeStep === 2 ? (
                <div
                  data-field-id="level"
                  className="relative -mt-1 bg-white px-4 py-1 sm:mt-0 sm:px-6 sm:py-1.5 lg:-mt-3 lg:px-8 lg:py-1.5"
                >
                  <div className="relative grid items-start gap-2 lg:grid-cols-[minmax(0,0.94fr)_minmax(420px,1.06fr)] lg:gap-3 lg:pl-0 xl:grid-cols-[minmax(0,0.92fr)_minmax(480px,1.08fr)] xl:pl-1">
                    <div className="min-w-0 lg:pl-4 xl:pl-6">
                      <div className="mb-0">
                        <div className="inline-flex items-center gap-2">
                          <div className="text-[22px] font-semibold leading-[1.05] text-[#0F1B25] sm:text-[24px]">
                            Pick Your Level
                          </div>
                          <Sparkles className="size-5 shrink-0 text-[#F4B400]" />
                        </div>
                        <div className="mt-1.5 text-[13px] font-normal text-[#5F6B76] sm:text-[14px]">
                          Select your current grade
                        </div>
                      </div>

                      <div className="grid max-w-[580px] grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
                        {levelOptions.map(({ value: level }) => (
                          <button
                            key={level}
                            type="button"
                            onClick={() => {
                              setHasSubmitted(false);
                              setValidationStep(null);
                              setShowValidationPopup(false);
                              setInlineMatchQueryString("");
                              setSelectedLevel(level);
                              setSelectedCategory("");
                              setSelectedDreamCollege("");
                              setTargetCollegeSearch("");
                              resetAcademicFields();
                            }}
                            className={`flex h-[86px] flex-col items-center justify-center gap-2 rounded-[6px] border px-2 text-center !text-[15px] !font-normal leading-4 transition ${
                              selectedLevel === level
                                ? "border-[#F4B400] bg-[#FFF4CC] text-[#0F1B25] shadow-[0_8px_16px_rgba(244,180,0,0.16)]"
                                : "border-[#DDE2E7] bg-white text-[#0F1B25] shadow-[0_5px_14px_rgba(15,27,37,0.04)] hover:border-[#F4B400] hover:bg-[#FFF4CC] hover:text-[#D99A00]"
                            }`}
                            aria-pressed={selectedLevel === level}
                          >
                            {level === "6" ? <GraduationCap className="size-[24px]" /> : null}
                            {level === "7" ? <BookOpen className="size-[24px]" /> : null}
                            {level === "8" ? <Compass className="size-[24px]" /> : null}
                            {level === "9" ? <Globe className="size-[24px]" /> : null}
                            {level === "10" ? <Laptop className="size-[24px]" /> : null}
                            {level === "11" ? <FlaskConical className="size-[24px]" /> : null}
                            {level === "12" ? <Award className="size-[24px]" /> : null}
                            {formatLevelLabel(level)}
                          </button>
                        ))}
                      </div>

                      {submittedForCurrentStep && validationErrors.level ? (
                        <div className="mt-3 flex items-center gap-2 text-[14px] font-medium text-[#ff4d5e]">
                          <CircleAlert className="size-4" />
                          <span>{validationErrors.level}</span>
                        </div>
                      ) : null}

                      {/* <div className="mt-3 flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-3">
                        <div className="flex min-w-0 items-start gap-3 lg:max-w-[300px]">
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[#EEE7C8] bg-white text-[#F4B400] shadow-none">
                            <Sparkles className="size-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-[14px] font-semibold text-[#0F1B25]">
                              Why choose your level?
                            </div>
                            <p className="mt-0.5 text-[11px] leading-4 text-[#5F6B76]">
                              Your grade helps us recommend the right courses, colleges, and assessments for you.
                            </p>
                          </div>
                        </div>

                        <div className="grid flex-[1.2] gap-3 sm:grid-cols-3 sm:items-stretch sm:gap-4 lg:ml-8 lg:min-w-[380px]">
                          {levelHighlights.map(({ icon: Icon, title }, index) => (
                            <div
                              key={title}
                              className={`flex items-center gap-1.5 px-0.5 py-0 sm:h-full sm:flex-col sm:items-center sm:justify-center sm:px-3 sm:py-2 sm:text-center ${
                                index < levelHighlights.length - 1 ? "sm:border-r sm:border-[#eddca4]" : ""
                              }`}
                            >
                              <div className="flex size-7 shrink-0 items-center justify-center rounded-full border border-[#EEF0F4] bg-white text-[#0F1B25] shadow-none">
                                <Icon className="size-3.5 text-[#F4B400]" />
                              </div>
                          <div className="min-w-0 text-[11px] font-bold leading-4 tracking-[-0.01em] text-[#0F1B25] sm:text-[12px]">
                                {title}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div> */}

                      <div className="mt-2.5 flex flex-col gap-3 sm:flex-row">
                        <button
                          type="button"
                          onClick={goToPreviousStep}
                          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[6px] border border-[#E6E6E6] bg-white px-5 !text-[14px] !font-medium text-[#0F1B25] shadow-none transition hover:bg-[#F8F9FB] sm:w-auto sm:min-w-[154px]"
                        >
                          <ArrowRight className="size-5 rotate-180" />
                          Back
                        </button>
                        <button
                          type="button"
                          onClick={goToNextStep}
                          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[6px] bg-[#F4B400] px-5 !text-[14px] !font-medium !text-[#071A44] shadow-none transition hover:bg-[#e6ac00] sm:w-auto sm:min-w-[154px]"
                        >
                          Next
                          <ArrowRight className="size-5" />
                        </button>
                      </div>
                    </div>

                    <div className="relative hidden min-h-[420px] overflow-hidden rounded-[24px] bg-white lg:block" aria-hidden="true">
                      <div className="absolute inset-0 rounded-[24px] bg-white" />
                      <div className="absolute inset-0 bg-[url('/find-step-level-illustration.png')] bg-contain bg-[position:50%_25%] bg-no-repeat" />
                    </div>
                  </div>
                </div>
              ) : null}

              {activeStep !== 1 && activeStep !== 2 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">

                {activeStep === 4 && isSeniorSecondaryLevel ? (
                  <FieldShell icon={MapPin} label="Select your State">
                    <select
                      value={selectedState}
                      onChange={(event) => setSelectedState(event.target.value)}
                      className={inputClassName}
                    >
                      {stateOptions.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </FieldShell>
                ) : null}

                {activeStep === 4 && showCategoryField ? (
                  <FieldShell fieldId="category" icon={Users} label="Category">
                    <select
                      value={selectedCategory}
                      onChange={(event) => {
                        clearSubmittedValidation();
                        setSelectedCategory(normalizeCategorySelection(event.target.value));
                      }}
                      className={inputClassName}
                    >
                      <option value="">Select your category</option>
                      {categoryOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </FieldShell>
                ) : null}
{/* 
                {showDreamCollegeField ? (
                  <FieldShell icon={Building2} label="Select Dream College">
                    <select
                      value={selectedDreamCollege}
                      onChange={(event) => setSelectedDreamCollege(event.target.value)}
                      className={inputClassName}
                    >
                      <option value="">Select dream college</option>
                      {dreamCollegeOptions.map((college) => (
                        <option key={college.id} value={college.id}>
                          {college.name}
                        </option>
                      ))}
                    </select>
                  </FieldShell>
                ) : null} */}

                {activeStep === 3 ? (
                <div data-field-id="degree" className="col-span-full grid items-start gap-7 lg:grid-cols-[minmax(0,1.02fr)_minmax(320px,0.82fr)] lg:pt-2">
                  <div className="min-w-0 lg:pl-12 xl:pl-14">
                    <div className="mb-4">
                      <h3 className="text-[24px] font-semibold text-[#0F1B25]">Pick Your Degree Stream</h3>
                      <div className="mt-2 text-[14px] font-normal text-[#5F6B76]">
                        Choose the stream you are interested in
                      </div>
                    </div>
                    <div className="grid max-w-[580px] grid-cols-2 gap-5 sm:grid-cols-4">
                      {degreeOptions.map((degree) => (
                        <button
                          key={degree}
                          type="button"
                          onClick={() => {
                            setHasSubmitted(false);
                            setValidationStep(null);
                            setShowValidationPopup(false);
                            setInlineMatchQueryString("");
                            setSelectedDegree(degree);
                            setSelectedDreamCollege("");
                            setTargetCollegeSearch("");
                            resetAcademicFields();
                          }}
                          className={`flex h-[86px] flex-col items-center justify-center gap-2 rounded-[6px] border px-2 text-center text-[13px] font-semibold leading-4 transition ${
                            selectedDegree === degree
                              ? "border-[#F4B400] bg-[#FFF4CC] text-[#0F1B25] shadow-[0_8px_16px_rgba(244,180,0,0.16)]"
                              : "border-[#DDE2E7] bg-white text-[#0F1B25] shadow-[0_5px_14px_rgba(15,27,37,0.04)] hover:border-[#F4B400] hover:bg-[#FFF4CC] hover:text-[#D99A00]"
                          }`}
                          aria-pressed={selectedDegree === degree}
                        >
                          {degree === "Engineering" ? <Calculator className="size-6" /> : null}
                          {degree === "Medical" ? <Stethoscope className="size-6" /> : null}
                          {degree === "Arts & Science" ? <GraduationCap className="size-6" /> : null}
                          {degree === "Law" ? <Scale className="size-6" /> : null}
                          {degree === "B.Arch" ? <Landmark className="size-6" /> : null}
                          {degree === "Agriculture" ? <Sprout className="size-6" /> : null}
                          {degree === "Paramedical" ? <FlaskConical className="size-6" /> : null}
                          {degree}
                        </button>
                      ))}
                    </div>
                    {submittedForCurrentStep && validationErrors.degree ? (
                      <div className="mt-3 flex items-center gap-2 text-[14px] font-medium text-[#ff4d5e]">
                        <CircleAlert className="size-4" />
                        <span>{validationErrors.degree}</span>
                      </div>
                    ) : null}
                    <div className="mt-6 flex w-full flex-col gap-3 sm:max-w-none sm:flex-row">
                      <button
                        type="button"
                        onClick={goToPreviousStep}
                        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[6px] border border-[#E6E6E6] bg-white px-6 text-[16px] font-medium text-[#0F1B25] shadow-[0_5px_14px_rgba(15,27,37,0.04)] transition hover:bg-[#F8F9FB] sm:w-[128px]"
                      >
                        <ArrowRight className="size-5 rotate-180" />
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={goToNextStep}
                        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[6px] bg-[#F4B400] px-6 text-[16px] font-medium !text-[#071A44] shadow-[0_10px_18px_rgba(244,180,0,0.22)] transition hover:bg-[#0F1B25] hover:!text-white sm:w-[128px]"
                      >
                        Next
                        <ArrowRight className="size-4" />
                      </button>
                    </div>
                  </div>
                  <div className="relative hidden min-h-[520px] w-full items-center justify-center lg:flex" aria-hidden="true">
                    <div className="absolute right-12 top-4 h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle,rgba(244,180,0,0.20)_0%,rgba(244,180,0,0.10)_42%,rgba(255,255,255,0)_72%)]" />
                    <div className="absolute left-14 top-24 text-[#F4B400]">
                      <Sparkles className="size-5" />
                    </div>
                    <div className="absolute right-24 top-44 text-[#F4B400]">
                      <Sparkles className="size-5" />
                    </div>
                    <div className="relative flex min-h-[520px] w-full items-start justify-start lg:-translate-x-8">
                      <Image
                        src={selectedDegreePreview?.image || "/find-step-stream-illustration.png"}
                        alt={selectedDegree ? `${selectedDegree} illustration` : "Degree stream illustration"}
                        width={1642}
                        height={958}
                        unoptimized
                        className="h-auto w-[600px] max-w-full object-contain drop-shadow-[0_24px_48px_rgba(15,27,37,0.12)] lg:w-[580px]"
                        priority={activeStep === 3}
                      />
                    </div>
                  </div>
                </div>
              ) : null}

 {activeStep === 4 && showDreamCollegeField ? (
                  <FieldShell icon={Building2} label="Select Your Target College">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-0 top-1/2 size-4 -translate-y-1/2 text-[#7a87ad]" />
                      <input
                      type="search"
                      value={targetCollegeSearch}
                      onChange={(event) => {
                        clearSubmittedValidation();
                        selectTargetCollegeByName(event.target.value);
                      }}
                      onBlur={() => {
                        if (!targetCollegeSearch.trim()) {
                          setSelectedDreamCollege("");
                          return;
                        }
                        const selectedCollege = dreamCollegeOptions.find((college) => college.id === selectedDreamCollege);
                        if (selectedCollege) setTargetCollegeSearch(selectedCollege.name);
                      }}
                      list="target-college-options"
                      placeholder="Search and select college"
                      className={inputClassName}
                      style={{ paddingLeft: "1.35rem" }}
                      autoComplete="off"
                    />
                    </div>
                    <datalist id="target-college-options">
                      {filteredDreamCollegeOptions.map((college, index) => (
                        <option key={`${college.id || college.name}-${index}`} value={college.name}>
                          {college.city || college.district || college.state}
                        </option>
                      ))}
                    </datalist>
                  </FieldShell>
                ) : null}

                {activeStep === 4 && (showEngineeringFields || showMedicalFields || showLawFields || showArtsScienceFields) ? (
                  <AcademicShell fieldId="course" icon={BookOpen} label="Select Course">
                    <select
                      value={selectedCourse}
                      onChange={(event) => {
                        clearSubmittedValidation();
                        setSelectedCourse(event.target.value);
                      }}
                      className={academicInputClassName}
                    >
                      <option value="">
                        {selectedTargetCollege && availableCourseOptions.length === 0
                          ? "No courses found for selected college"
                          : "Choose course"}
                      </option>
                      {availableCourseOptions.map((course) => (
                        <option key={course} value={course}>
                          {course}
                        </option>
                      ))}
                    </select>
                  </AcademicShell>
                ) : null}

                {activeStep === 4 && showEngineeringFields ? (
                  <AcademicShell fieldId="admissionType" icon={BarChart3} label="Admission Type">
                    <select
                      value={selectedAdmissionType}
                      onChange={(event) => {
                        clearSubmittedValidation();
                        setSelectedAdmissionType(event.target.value);
                        setPhysicsMarks("");
                        setChemistryMarks("");
                        setMathsMarks("");
                        setEngineeringEntranceMarks("");
                      }}
                      className={academicInputClassName}
                    >
                      <option value="">Select admission type</option>
                      {availableEngineeringAdmissionTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </AcademicShell>
                ) : null}

                {activeStep === 4 && showMedicalFields ? (
                  <AcademicShell fieldId="neet" icon={Calculator} label="NEET Mark" hint="Out of 720" invalid={Boolean((submittedForCurrentStep || touchedFields.neet) && validationErrors.neet)} valid={Boolean(touchedFields.neet && !validationErrors.neet && neetMarks.trim())} error={submittedForCurrentStep || touchedFields.neet ? validationErrors.neet : undefined}>
                    <input
                      type="number"
                      min="0"
                      max="720"
                      step="0.01"
                      value={neetMarks}
                      onChange={(event) =>
                        updateAcademicValue("neet", () =>
                          setNeetMarks(getNonNegativeNumberValue(event.target.value)),
                        )
                      }
                      onBlur={() => markFieldTouched("neet")}
                      placeholder="Enter your NEET mark"
                      className={getInputClassName(academicInputClassName, Boolean((submittedForCurrentStep || touchedFields.neet) && validationErrors.neet))}
                      aria-invalid={Boolean((submittedForCurrentStep || touchedFields.neet) && validationErrors.neet)}
                      required={showMedicalFields}
                    />
                  </AcademicShell>
                ) : null}

                {activeStep === 4 && showLawFields ? (
                  <AcademicShell fieldId="admissionType" icon={BarChart3} label="Admission Type">
                    <select
                      value={selectedAdmissionType}
                      onChange={(event) => {
                        clearSubmittedValidation();
                        setSelectedAdmissionType(event.target.value);
                        setClatMarks("");
                        setLawBestSubjectOne("");
                        setLawBestSubjectTwo("");
                        setLawBestSubjectThree("");
                      }}
                      className={academicInputClassName}
                    >
                      <option value="">Select admission type</option>
                      {availableLawAdmissionTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </AcademicShell>
                ) : null}

                {activeStep === 4 && showArtsScienceAdmissionTypeField ? (
                  <AcademicShell fieldId="admissionType" icon={BarChart3} label="Admission Type">
                    <select
                      value={selectedAdmissionType}
                      onChange={(event) => {
                        clearSubmittedValidation();
                        setSelectedAdmissionType(event.target.value);
                        setArtsScienceCuetMarks("");
                        setBoardMarksTotal("");
                      }}
                      className={academicInputClassName}
                    >
                      <option value="">Select admission type</option>
                      {artsScienceAdmissionTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </AcademicShell>
                ) : null}
              </div>
              ) : null}

              {activeStep === 4 && showEngineeringFields ? (
                <div className="mt-4 space-y-2.5">
                  {showEngineeringPcmFields ? (
                    <>
                      <div className="grid gap-3 md:grid-cols-3">
                        <AcademicShell fieldId="physics" icon={FlaskConical} label="Physics" hint="Out of 100" invalid={Boolean((submittedForCurrentStep || touchedFields.physics) && validationErrors.physics)} valid={Boolean(touchedFields.physics && !validationErrors.physics && physicsMarks.trim())} error={submittedForCurrentStep || touchedFields.physics ? validationErrors.physics : undefined}>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={physicsMarks}
                            onChange={(event) =>
                              updateAcademicValue("physics", () =>
                                setPhysicsMarks(getNonNegativeNumberValue(event.target.value)),
                              )
                            }
                            onBlur={() => markFieldTouched("physics")}
                            placeholder="Enter your marks"
                            className={getInputClassName(academicInputClassName, Boolean((submittedForCurrentStep || touchedFields.physics) && validationErrors.physics))}
                            aria-invalid={Boolean((submittedForCurrentStep || touchedFields.physics) && validationErrors.physics)}
                            required={showEngineeringPcmFields}
                          />
                        </AcademicShell>

                        <AcademicShell fieldId="chemistry" icon={FlaskConical} label="Chemistry" hint="Out of 100" invalid={Boolean((submittedForCurrentStep || touchedFields.chemistry) && validationErrors.chemistry)} valid={Boolean(touchedFields.chemistry && !validationErrors.chemistry && chemistryMarks.trim())} error={submittedForCurrentStep || touchedFields.chemistry ? validationErrors.chemistry : undefined}>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={chemistryMarks}
                            onChange={(event) =>
                              updateAcademicValue("chemistry", () =>
                                setChemistryMarks(getNonNegativeNumberValue(event.target.value)),
                              )
                            }
                            onBlur={() => markFieldTouched("chemistry")}
                            placeholder="Enter your marks"
                            className={getInputClassName(academicInputClassName, Boolean((submittedForCurrentStep || touchedFields.chemistry) && validationErrors.chemistry))}
                            aria-invalid={Boolean((submittedForCurrentStep || touchedFields.chemistry) && validationErrors.chemistry)}
                            required={showEngineeringPcmFields}
                          />
                        </AcademicShell>

                        <AcademicShell fieldId="maths" icon={Calculator} label="Maths" hint="Out of 100" invalid={Boolean((submittedForCurrentStep || touchedFields.maths) && validationErrors.maths)} valid={Boolean(touchedFields.maths && !validationErrors.maths && mathsMarks.trim())} error={submittedForCurrentStep || touchedFields.maths ? validationErrors.maths : undefined}>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={mathsMarks}
                            onChange={(event) =>
                              updateAcademicValue("maths", () =>
                                setMathsMarks(getNonNegativeNumberValue(event.target.value)),
                              )
                            }
                            onBlur={() => markFieldTouched("maths")}
                            placeholder="Enter your marks"
                            className={getInputClassName(academicInputClassName, Boolean((submittedForCurrentStep || touchedFields.maths) && validationErrors.maths))}
                            aria-invalid={Boolean((submittedForCurrentStep || touchedFields.maths) && validationErrors.maths)}
                            required={showEngineeringPcmFields}
                          />
                        </AcademicShell>
                      </div>

                      {showCalculatedScorePreview && engineeringPcmMarksReady && engineeringCutoff ? (
                        <ScoreHighlight
                        title="Engineering Cutoff"
                        formula="Cutoff = Maths + (Physics / 2) + (Chemistry / 2)"
                        primaryLabel="Calculated Cutoff"
                        primaryValue={`${engineeringCutoff} / 200`}
                        />
                      ) : null}
                    </>
                  ) : null}

                  {showEngineeringJeeMainFields ? (
                    <>
                      <div className="grid gap-3 md:grid-cols-2">
                      <AcademicShell fieldId="engineeringEntranceMarks" icon={Calculator} label="JEE Main Mark" hint="Out of 300" invalid={Boolean((submittedForCurrentStep || touchedFields.engineeringEntranceMarks) && validationErrors.engineeringEntranceMarks)} valid={Boolean(touchedFields.engineeringEntranceMarks && !validationErrors.engineeringEntranceMarks && engineeringEntranceMarks.trim())} error={submittedForCurrentStep || touchedFields.engineeringEntranceMarks ? validationErrors.engineeringEntranceMarks : undefined}>
                          <input
                            type="number"
                            min="0"
                            max="300"
                            step="0.01"
                            value={engineeringEntranceMarks}
                            onChange={(event) =>
                              updateAcademicValue("engineeringEntranceMarks", () =>
                                setEngineeringEntranceMarks(getNonNegativeNumberValue(event.target.value)),
                              )
                            }
                            onBlur={() => markFieldTouched("engineeringEntranceMarks")}
                            placeholder="Enter your JEE Main mark"
                            className={getInputClassName(academicInputClassName, Boolean((submittedForCurrentStep || touchedFields.engineeringEntranceMarks) && validationErrors.engineeringEntranceMarks))}
                            aria-invalid={Boolean((submittedForCurrentStep || touchedFields.engineeringEntranceMarks) && validationErrors.engineeringEntranceMarks)}
                            required={showEngineeringJeeMainFields}
                          />
                        </AcademicShell>
                      </div>

                      {showCalculatedScorePreview && engineeringEntranceMarksReady ? (
                        <ScoreHighlight
                        title="JEE Main Score"
                        formula="Engineering prediction uses your JEE Main mark directly"
                        primaryLabel="JEE Main Mark"
                        primaryValue={`${engineeringEntranceMarks} / 300`}
                        />
                      ) : null}
                    </>
                  ) : null}

                  {showEngineeringJeeAdvancedFields ? (
                    <>
                      <div className="grid gap-3 md:grid-cols-2">
                      <AcademicShell fieldId="engineeringEntranceMarks" icon={Calculator} label="JEE Advanced Mark" hint="Out of 360" invalid={Boolean((submittedForCurrentStep || touchedFields.engineeringEntranceMarks) && validationErrors.engineeringEntranceMarks)} valid={Boolean(touchedFields.engineeringEntranceMarks && !validationErrors.engineeringEntranceMarks && engineeringEntranceMarks.trim())} error={submittedForCurrentStep || touchedFields.engineeringEntranceMarks ? validationErrors.engineeringEntranceMarks : undefined}>
                          <input
                            type="number"
                            min="0"
                            max="360"
                            step="0.01"
                            value={engineeringEntranceMarks}
                            onChange={(event) =>
                              updateAcademicValue("engineeringEntranceMarks", () =>
                                setEngineeringEntranceMarks(getNonNegativeNumberValue(event.target.value)),
                              )
                            }
                            onBlur={() => markFieldTouched("engineeringEntranceMarks")}
                            placeholder="Enter your JEE Advanced mark"
                            className={getInputClassName(academicInputClassName, Boolean((submittedForCurrentStep || touchedFields.engineeringEntranceMarks) && validationErrors.engineeringEntranceMarks))}
                            aria-invalid={Boolean((submittedForCurrentStep || touchedFields.engineeringEntranceMarks) && validationErrors.engineeringEntranceMarks)}
                            required={showEngineeringJeeAdvancedFields}
                          />
                        </AcademicShell>
                      </div>

                      {showCalculatedScorePreview && engineeringEntranceMarksReady ? (
                        <ScoreHighlight
                        title="JEE Advanced Score"
                        formula="Engineering prediction uses your JEE Advanced mark directly"
                        primaryLabel="JEE Advanced Mark"
                        primaryValue={`${engineeringEntranceMarks} / 360`}
                        />
                      ) : null}
                    </>
                  ) : null}
                </div>
              ) : null}

              {activeStep === 4 && showMedicalFields ? (
                <div className="mt-4 space-y-3">
                  {showCalculatedScorePreview && neetMarksReady ? (
                    <ScoreHighlight
                    title="Medical Cutoff"
                    formula="Medical prediction uses your NEET mark directly"
                    primaryLabel="NEET Mark"
                    primaryValue={`${neetMarks} / 720`}
                    />
                  ) : null}
                </div>
              ) : null}

              {activeStep === 4 && showBArchFields ? (
                <div className="mt-4 space-y-3">
                  <div className="grid gap-3 md:grid-cols-2">
                    <AcademicShell fieldId="boardTotal" icon={BookOpen} label="11th / 12th Marks (Out of 600)" invalid={Boolean((submittedForCurrentStep || touchedFields.boardTotal) && validationErrors.boardTotal)} valid={Boolean(touchedFields.boardTotal && !validationErrors.boardTotal && boardMarksTotal.trim())} error={submittedForCurrentStep || touchedFields.boardTotal ? validationErrors.boardTotal : undefined}>
                      <input
                        type="number"
                        min="0"
                        max="600"
                        step="0.01"
                        value={boardMarksTotal}
                        onChange={(event) =>
                          updateAcademicValue("boardTotal", () =>
                            setBoardMarksTotal(getNonNegativeNumberValue(event.target.value)),
                          )
                        }
                        onBlur={() => markFieldTouched("boardTotal")}
                        placeholder="Enter your 11th/12th total"
                        className={getInputClassName(academicInputClassName, Boolean((submittedForCurrentStep || touchedFields.boardTotal) && validationErrors.boardTotal))}
                        aria-invalid={Boolean((submittedForCurrentStep || touchedFields.boardTotal) && validationErrors.boardTotal)}
                        required={showBArchFields}
                      />
                    </AcademicShell>

                    {showBArchNataField ? (
                      <AcademicShell fieldId="nata" icon={Calculator} label="NATA Score (Out of 200)" invalid={Boolean((submittedForCurrentStep || touchedFields.nata) && validationErrors.nata)} valid={Boolean(touchedFields.nata && !validationErrors.nata && nataScore.trim())} error={submittedForCurrentStep || touchedFields.nata ? validationErrors.nata : undefined}>
                        <input
                          type="number"
                          min="0"
                          max="200"
                          step="0.01"
                          value={nataScore}
                          onChange={(event) =>
                            updateAcademicValue("nata", () =>
                              setNataScore(getNonNegativeNumberValue(event.target.value)),
                            )
                          }
                          onBlur={() => markFieldTouched("nata")}
                          placeholder="Enter your NATA score"
                          className={getInputClassName(academicInputClassName, Boolean((submittedForCurrentStep || touchedFields.nata) && validationErrors.nata))}
                          aria-invalid={Boolean((submittedForCurrentStep || touchedFields.nata) && validationErrors.nata)}
                          required={showBArchNataField}
                        />
                      </AcademicShell>
                    ) : null}
                  </div>

                  {showCalculatedScorePreview && bArchMarksReady && (showBArchNataField ? bArchCombinedScore : bArchConvertedScore) ? (
                    <ScoreHighlight
                    title={showBArchNataField ? "B.Arch Combined Score" : "B.Arch Board Score"}
                    formula={
                      showBArchNataField
                        ? "12th (out of 600) to (out of 200) + NATA (out of 200)"
                        : "(11th total / 600) x 400"
                    }
                    primaryLabel="Calculated Cutoff"
                    primaryValue={
                      showBArchNataField
                        ? `${bArchCombinedScore} / 400`
                        : `${bArchConvertedScore} / 400`
                    }
                    secondaryLabel={showBArchNataField ? "12th Converted" : undefined}
                    secondaryValue={showBArchNataField ? `${bArchConvertedScore} / 200` : undefined}
                    />
                  ) : null}
                </div>
              ) : null}

              {activeStep === 4 && showLawFields ? (
                <div className="mt-4 space-y-3">
                  <div className="grid gap-3 md:grid-cols-2">
                    {showLawClatFields ? (
                      <AcademicShell fieldId="clat" icon={Calculator} label="CLAT Mark" hint="Out of 120" invalid={Boolean((submittedForCurrentStep || touchedFields.clat) && validationErrors.clat)} valid={Boolean(touchedFields.clat && !validationErrors.clat && clatMarks.trim())} error={submittedForCurrentStep || touchedFields.clat ? validationErrors.clat : undefined}>
                        <input
                          type="number"
                          min="0"
                          max="120"
                          step="0.01"
                          value={clatMarks}
                          onChange={(event) =>
                            updateAcademicValue("clat", () =>
                              setClatMarks(getNonNegativeNumberValue(event.target.value)),
                            )
                          }
                          onBlur={() => markFieldTouched("clat")}
                          placeholder="Enter your CLAT mark"
                          className={getInputClassName(academicInputClassName, Boolean((submittedForCurrentStep || touchedFields.clat) && validationErrors.clat))}
                          aria-invalid={Boolean((submittedForCurrentStep || touchedFields.clat) && validationErrors.clat)}
                          required={showLawClatFields}
                        />
                      </AcademicShell>
                    ) : null}
                  </div>

                  {showLawMarksFields ? (
                    <div className="space-y-3">
                      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        <AcademicShell fieldId="bestSubject1" icon={BookOpen} label="Best Subject 1" hint="Eg: Tamil | Out of 100" invalid={Boolean((submittedForCurrentStep || touchedFields.bestSubject1) && validationErrors.bestSubject1)} valid={Boolean(touchedFields.bestSubject1 && !validationErrors.bestSubject1 && lawBestSubjectOne.trim())} error={submittedForCurrentStep || touchedFields.bestSubject1 ? validationErrors.bestSubject1 : undefined}>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={lawBestSubjectOne}
                            onChange={(event) =>
                              updateAcademicValue("bestSubject1", () =>
                                setLawBestSubjectOne(getNonNegativeNumberValue(event.target.value)),
                              )
                            }
                            onBlur={() => markFieldTouched("bestSubject1")}
                            placeholder="Enter mark"
                            className={getInputClassName(academicInputClassName, Boolean((submittedForCurrentStep || touchedFields.bestSubject1) && validationErrors.bestSubject1))}
                            aria-invalid={Boolean((submittedForCurrentStep || touchedFields.bestSubject1) && validationErrors.bestSubject1)}
                            required={showLawMarksFields}
                          />
                        </AcademicShell>

                        <AcademicShell fieldId="bestSubject2" icon={BookOpen} label="Best Subject 2" hint="Eg: English | Out of 100" invalid={Boolean((submittedForCurrentStep || touchedFields.bestSubject2) && validationErrors.bestSubject2)} valid={Boolean(touchedFields.bestSubject2 && !validationErrors.bestSubject2 && lawBestSubjectTwo.trim())} error={submittedForCurrentStep || touchedFields.bestSubject2 ? validationErrors.bestSubject2 : undefined}>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={lawBestSubjectTwo}
                            onChange={(event) =>
                              updateAcademicValue("bestSubject2", () =>
                                setLawBestSubjectTwo(getNonNegativeNumberValue(event.target.value)),
                              )
                            }
                            onBlur={() => markFieldTouched("bestSubject2")}
                            placeholder="Enter mark"
                            className={getInputClassName(academicInputClassName, Boolean((submittedForCurrentStep || touchedFields.bestSubject2) && validationErrors.bestSubject2))}
                            aria-invalid={Boolean((submittedForCurrentStep || touchedFields.bestSubject2) && validationErrors.bestSubject2)}
                            required={showLawMarksFields}
                          />
                        </AcademicShell>

                        <AcademicShell fieldId="bestSubject3" icon={BookOpen} label="Best Subject 3" hint="Eg: History / Commerce | Out of 100" invalid={Boolean((submittedForCurrentStep || touchedFields.bestSubject3) && validationErrors.bestSubject3)} valid={Boolean(touchedFields.bestSubject3 && !validationErrors.bestSubject3 && lawBestSubjectThree.trim())} error={submittedForCurrentStep || touchedFields.bestSubject3 ? validationErrors.bestSubject3 : undefined}>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={lawBestSubjectThree}
                            onChange={(event) =>
                              updateAcademicValue("bestSubject3", () =>
                                setLawBestSubjectThree(getNonNegativeNumberValue(event.target.value)),
                              )
                            }
                            onBlur={() => markFieldTouched("bestSubject3")}
                            placeholder="Enter mark"
                            className={getInputClassName(academicInputClassName, Boolean((submittedForCurrentStep || touchedFields.bestSubject3) && validationErrors.bestSubject3))}
                            aria-invalid={Boolean((submittedForCurrentStep || touchedFields.bestSubject3) && validationErrors.bestSubject3)}
                            required={showLawMarksFields}
                          />
                        </AcademicShell>
                      </div>

                      {showCalculatedScorePreview && lawMarksReady && lawBestThreeTotal ? (
                        <ScoreHighlight
                        title="Law Cutoff (Best 3 Subjects)"
                        formula="Total = Best 3 subjects mark sum (out of 300)"
                        primaryLabel="Calculated Total"
                        primaryValue={`${lawBestThreeTotal} / 300`}
                        />
                      ) : null}
                    </div>
                  ) : null}

                  {showCalculatedScorePreview && showLawClatFields && clatMarksReady ? (
                    <ScoreHighlight
                      title="Law Cutoff (CLAT)"
                      formula="Law prediction uses your CLAT mark directly"
                      primaryLabel="CLAT Mark"
                      primaryValue={`${clatMarks} / 120`}
                    />
                  ) : null}
                </div>
              ) : null}

              {activeStep === 4 && showArtsScienceFields ? (
                <div className="mt-4 space-y-3">
                  <div className="grid gap-3 md:grid-cols-2">
                    {showArtsScienceCuetField ? (
                      <AcademicShell fieldId="artsScienceCuet" icon={Calculator} label="Enter Cutemark (Out of 600)" invalid={Boolean((submittedForCurrentStep || touchedFields.artsScienceCuet) && validationErrors.artsScienceCuet)} valid={Boolean(touchedFields.artsScienceCuet && !validationErrors.artsScienceCuet && artsScienceCuetMarks.trim())} error={submittedForCurrentStep || touchedFields.artsScienceCuet ? validationErrors.artsScienceCuet : undefined}>
                        <input
                          type="number"
                          min="0"
                          max="600"
                          step="0.01"
                          value={artsScienceCuetMarks}
                          onChange={(event) =>
                            updateAcademicValue("artsScienceCuet", () =>
                              setArtsScienceCuetMarks(getNonNegativeNumberValue(event.target.value)),
                            )
                          }
                          onBlur={() => markFieldTouched("artsScienceCuet")}
                          placeholder="Enter your CUET mark"
                          className={getInputClassName(academicInputClassName, Boolean((submittedForCurrentStep || touchedFields.artsScienceCuet) && validationErrors.artsScienceCuet))}
                          aria-invalid={Boolean((submittedForCurrentStep || touchedFields.artsScienceCuet) && validationErrors.artsScienceCuet)}
                          required={showArtsScienceCuetField}
                        />
                      </AcademicShell>
                    ) : null}

                    {showArtsScienceBoardMarksField ? (
                      <AcademicShell fieldId="boardTotal" icon={BookOpen} label="12th Marks (Out of 600)" invalid={Boolean((submittedForCurrentStep || touchedFields.boardTotal) && validationErrors.boardTotal)} valid={Boolean(touchedFields.boardTotal && !validationErrors.boardTotal && boardMarksTotal.trim())} error={submittedForCurrentStep || touchedFields.boardTotal ? validationErrors.boardTotal : undefined}>
                        <input
                          type="number"
                          min="0"
                          max="600"
                          step="0.01"
                          value={boardMarksTotal}
                          onChange={(event) =>
                            updateAcademicValue("boardTotal", () =>
                              setBoardMarksTotal(getNonNegativeNumberValue(event.target.value)),
                            )
                          }
                          onBlur={() => markFieldTouched("boardTotal")}
                          placeholder="Enter your 12th total"
                          className={getInputClassName(academicInputClassName, Boolean((submittedForCurrentStep || touchedFields.boardTotal) && validationErrors.boardTotal))}
                          aria-invalid={Boolean((submittedForCurrentStep || touchedFields.boardTotal) && validationErrors.boardTotal)}
                          required={showArtsScienceBoardMarksField}
                        />
                      </AcademicShell>
                    ) : null}
                  </div>

                  {showCalculatedScorePreview && (showArtsScienceCuetField ? artsScienceCuetReady : artsScienceBoardReady) ? (
                    <ScoreHighlight
                    title={showArtsScienceCuetField ? "Arts & Science CUET Score" : "Arts & Science Board Score"}
                    formula={
                      showArtsScienceCuetField
                        ? "Arts & Science prediction uses your CUET mark directly"
                        : "Arts & Science prediction uses your 12th Marks total directly"
                    }
                    primaryLabel={showArtsScienceCuetField ? "CUET Mark" : "12th Marks"}
                    primaryValue={
                      showArtsScienceCuetField
                        ? `${artsScienceCuetMarks} / 600`
                        : `${boardMarksTotal} / 600`
                    }
                    />
                  ) : null}
                </div>
              ) : null}

              {activeStep === 4 && showParamedicalFields ? (
                <div className="mt-4 space-y-3">
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    <AcademicShell fieldId="paramedicalBiology" icon={BookOpen} label="Biology" hint="Out of 100" invalid={Boolean((submittedForCurrentStep || touchedFields.paramedicalBiology) && validationErrors.paramedicalBiology)} valid={Boolean(touchedFields.paramedicalBiology && !validationErrors.paramedicalBiology && paramedicalBiologyMarks.trim())} error={submittedForCurrentStep || touchedFields.paramedicalBiology ? validationErrors.paramedicalBiology : undefined}>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={paramedicalBiologyMarks}
                        onChange={(event) =>
                          updateAcademicValue("paramedicalBiology", () =>
                            setParamedicalBiologyMarks(getNonNegativeNumberValue(event.target.value)),
                          )
                        }
                        onBlur={() => markFieldTouched("paramedicalBiology")}
                        placeholder="Enter your marks"
                        className={getInputClassName(academicInputClassName, Boolean((submittedForCurrentStep || touchedFields.paramedicalBiology) && validationErrors.paramedicalBiology))}
                        aria-invalid={Boolean((submittedForCurrentStep || touchedFields.paramedicalBiology) && validationErrors.paramedicalBiology)}
                        required={showParamedicalFields}
                      />
                    </AcademicShell>

                    <AcademicShell fieldId="paramedicalPhysics" icon={FlaskConical} label="Physics" hint="Out of 100" invalid={Boolean((submittedForCurrentStep || touchedFields.paramedicalPhysics) && validationErrors.paramedicalPhysics)} valid={Boolean(touchedFields.paramedicalPhysics && !validationErrors.paramedicalPhysics && paramedicalPhysicsMarks.trim())} error={submittedForCurrentStep || touchedFields.paramedicalPhysics ? validationErrors.paramedicalPhysics : undefined}>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={paramedicalPhysicsMarks}
                        onChange={(event) =>
                          updateAcademicValue("paramedicalPhysics", () =>
                            setParamedicalPhysicsMarks(getNonNegativeNumberValue(event.target.value)),
                          )
                        }
                        onBlur={() => markFieldTouched("paramedicalPhysics")}
                        placeholder="Enter your marks"
                        className={getInputClassName(academicInputClassName, Boolean((submittedForCurrentStep || touchedFields.paramedicalPhysics) && validationErrors.paramedicalPhysics))}
                        aria-invalid={Boolean((submittedForCurrentStep || touchedFields.paramedicalPhysics) && validationErrors.paramedicalPhysics)}
                        required={showParamedicalFields}
                      />
                    </AcademicShell>

                    <AcademicShell fieldId="paramedicalChemistry" icon={FlaskConical} label="Chemistry" hint="Out of 100" invalid={Boolean((submittedForCurrentStep || touchedFields.paramedicalChemistry) && validationErrors.paramedicalChemistry)} valid={Boolean(touchedFields.paramedicalChemistry && !validationErrors.paramedicalChemistry && paramedicalChemistryMarks.trim())} error={submittedForCurrentStep || touchedFields.paramedicalChemistry ? validationErrors.paramedicalChemistry : undefined}>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={paramedicalChemistryMarks}
                        onChange={(event) =>
                          updateAcademicValue("paramedicalChemistry", () =>
                            setParamedicalChemistryMarks(getNonNegativeNumberValue(event.target.value)),
                          )
                        }
                        onBlur={() => markFieldTouched("paramedicalChemistry")}
                        placeholder="Enter your marks"
                        className={getInputClassName(academicInputClassName, Boolean((submittedForCurrentStep || touchedFields.paramedicalChemistry) && validationErrors.paramedicalChemistry))}
                        aria-invalid={Boolean((submittedForCurrentStep || touchedFields.paramedicalChemistry) && validationErrors.paramedicalChemistry)}
                        required={showParamedicalFields}
                      />
                    </AcademicShell>
                  </div>

                  {showCalculatedScorePreview && paramedicalMarksReady && paramedicalCutoff100 && paramedicalCutoff200 ? (
                    <ScoreHighlight
                    title="Paramedical Cutoff"
                    formula={`Calculation: Biology / 2 + Physics / 4 + Chemistry / 4 = ${paramedicalCutoff100} / 100`}
                    primaryLabel="Converted Cutoff"
                    primaryValue={`${paramedicalCutoff200} / 200`}
                    secondaryLabel="Cutoff"
                    secondaryValue={`${paramedicalCutoff100} / 100`}
                    />
                  ) : null}
                </div>
              ) : null}

              {activeStep === 4 && showAgricultureFields ? (
                <div className="mt-4 space-y-3">
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    <AcademicShell fieldId="agricultureBiology" icon={BookOpen} label="Biology" hint="Out of 100" invalid={Boolean((submittedForCurrentStep || touchedFields.agricultureBiology) && validationErrors.agricultureBiology)} valid={Boolean(touchedFields.agricultureBiology && !validationErrors.agricultureBiology && agricultureBiologyMarks.trim())} error={submittedForCurrentStep || touchedFields.agricultureBiology ? validationErrors.agricultureBiology : undefined}>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={agricultureBiologyMarks}
                        onChange={(event) =>
                          updateAcademicValue("agricultureBiology", () =>
                            setAgricultureBiologyMarks(getNonNegativeNumberValue(event.target.value)),
                          )
                        }
                        onBlur={() => markFieldTouched("agricultureBiology")}
                        placeholder="Enter your marks"
                        className={getInputClassName(academicInputClassName, Boolean((submittedForCurrentStep || touchedFields.agricultureBiology) && validationErrors.agricultureBiology))}
                        aria-invalid={Boolean((submittedForCurrentStep || touchedFields.agricultureBiology) && validationErrors.agricultureBiology)}
                        required={showAgricultureFields}
                      />
                    </AcademicShell>

                    <AcademicShell fieldId="agriculturePhysics" icon={FlaskConical} label="Physics" hint="Out of 100" invalid={Boolean((submittedForCurrentStep || touchedFields.agriculturePhysics) && validationErrors.agriculturePhysics)} valid={Boolean(touchedFields.agriculturePhysics && !validationErrors.agriculturePhysics && agriculturePhysicsMarks.trim())} error={submittedForCurrentStep || touchedFields.agriculturePhysics ? validationErrors.agriculturePhysics : undefined}>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={agriculturePhysicsMarks}
                        onChange={(event) =>
                          updateAcademicValue("agriculturePhysics", () =>
                            setAgriculturePhysicsMarks(getNonNegativeNumberValue(event.target.value)),
                          )
                        }
                        onBlur={() => markFieldTouched("agriculturePhysics")}
                        placeholder="Enter your marks"
                        className={getInputClassName(academicInputClassName, Boolean((submittedForCurrentStep || touchedFields.agriculturePhysics) && validationErrors.agriculturePhysics))}
                        aria-invalid={Boolean((submittedForCurrentStep || touchedFields.agriculturePhysics) && validationErrors.agriculturePhysics)}
                        required={showAgricultureFields}
                      />
                    </AcademicShell>

                    <AcademicShell fieldId="agricultureChemistry" icon={FlaskConical} label="Chemistry" hint="Out of 100" invalid={Boolean((submittedForCurrentStep || touchedFields.agricultureChemistry) && validationErrors.agricultureChemistry)} valid={Boolean(touchedFields.agricultureChemistry && !validationErrors.agricultureChemistry && agricultureChemistryMarks.trim())} error={submittedForCurrentStep || touchedFields.agricultureChemistry ? validationErrors.agricultureChemistry : undefined}>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={agricultureChemistryMarks}
                        onChange={(event) =>
                          updateAcademicValue("agricultureChemistry", () =>
                            setAgricultureChemistryMarks(getNonNegativeNumberValue(event.target.value)),
                          )
                        }
                        onBlur={() => markFieldTouched("agricultureChemistry")}
                        placeholder="Enter your marks"
                        className={getInputClassName(academicInputClassName, Boolean((submittedForCurrentStep || touchedFields.agricultureChemistry) && validationErrors.agricultureChemistry))}
                        aria-invalid={Boolean((submittedForCurrentStep || touchedFields.agricultureChemistry) && validationErrors.agricultureChemistry)}
                        required={showAgricultureFields}
                      />
                    </AcademicShell>
                  </div>

                  {showCalculatedScorePreview && agricultureMarksReady && agricultureCutoff100 && agricultureCutoff200 ? (
                    <ScoreHighlight
                    title="Agriculture Cutoff"
                    formula={`Calculation: Biology / 2 + Physics / 4 + Chemistry / 4 = ${agricultureCutoff100} / 100`}
                    primaryLabel="Converted Cutoff"
                    primaryValue={`${agricultureCutoff200} / 200`}
                    secondaryLabel="Total Cutoff"
                    secondaryValue={`${agricultureCutoff100} / 100`}
                    />
                  ) : null}
                </div>
              ) : null}

              {activeStep === 4 && isJuniorLevel ? (
                <div className="mt-4">
                  <div className="mb-5 text-center">
                    <h3 className="text-[28px] font-semibold text-[#0F1B25]">
                      Assessment Test <span className="font-[family:Outfit] text-[24px] italic text-[#D99A00]">(Preview)</span>
                    </h3>
                    <div className="mt-2 text-[16px] font-normal text-[#5F6B76]">This is how your test will look</div>
                  </div>

                  {juniorQuestionsLoading ? (
                    <div className="rounded-[8px] border border-[#E6E6E6] bg-white px-4 py-5 text-center text-[14px] font-medium text-[#5F6B76]">
                      Loading saved questions...
                    </div>
                  ) : activeJuniorQuestion ? (
                    <>
                      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_250px]">
                        <div className="grid min-h-[310px] gap-4 rounded-[8px] border border-[#E6E6E6] bg-white p-4 shadow-[0_12px_24px_rgba(15,27,37,0.06)] xl:grid-cols-[minmax(0,1fr)_340px]">
                          <div className="min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div className="text-[16px] font-semibold text-[#0F1B25]">
                                Question {activeJuniorQuestionIndex + 1} of {juniorQuestions.length}
                              </div>
                              <div className="inline-flex items-center gap-2 text-[20px] font-semibold text-[#0F1B25] xl:hidden">
                                <Clock className="size-5" />
                                {formatTimer(juniorTimerSeconds)}
                              </div>
                            </div>
                            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#F4B400] bg-[#FFF4CC] px-3 py-1.5 text-[14px] font-semibold text-[#0F1B25] shadow-[0_8px_16px_rgba(244,180,0,0.12)]">
                              <Calculator className="size-4" />
                              {activeJuniorQuestion.subject || "Mathematics"}
                            </div>
                            <div className="mt-3 min-h-[42px] border-b border-[#E6E6E6] pb-3 text-[17px] font-semibold leading-6 text-[#0F1B25]">
                              {activeJuniorQuestion.question}
                            </div>
                            <div className="mt-3 grid gap-2">
                              {activeJuniorQuestion.options.map((option, optionIndex) => {
                                const optionLetter = String.fromCharCode(65 + optionIndex);
                                const isSelected = selectedJuniorAnswer === optionLetter;
                                return (
                                  <button
                                    key={`${activeJuniorQuestion.id}-${optionIndex}`}
                                    type="button"
                                    onClick={() => selectJuniorAnswer(optionIndex)}
                                    disabled={!hasStartedJuniorTest || hasSubmittedJuniorTest}
                                    className={`grid min-h-11 grid-cols-[34px_minmax(0,1fr)] items-center gap-3 rounded-[8px] border px-3 py-2 text-left transition ${
                                      isSelected
                                        ? "border-[#F4B400] bg-[#FFF4CC] text-[#0F1B25] shadow-[0_8px_16px_rgba(244,180,0,0.16)]"
                                        : hasStartedJuniorTest && !hasSubmittedJuniorTest
                                          ? "border-[#F3D98B] bg-[#FFFDF7] text-[#0F1B25] hover:border-[#F4B400] hover:bg-[#FFF4CC]"
                                          : "cursor-not-allowed border-[#F3D98B] bg-[#FFFDF7] text-[#5F6B76]"
                                    }`}
                                  >
                                    <span
                                      className={`flex size-8 items-center justify-center rounded-full text-[15px] font-semibold ${
                                        isSelected ? "bg-[#F4B400] text-white" : "bg-[#FFF4CC] text-[#D99A00]"
                                      }`}
                                    >
                                      {optionLetter}
                                    </span>
                                    <span className="min-w-0 break-words text-[16px] font-normal">{option}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div className="relative hidden min-h-[300px] overflow-hidden xl:block" aria-hidden="true">
                            <div className="absolute right-0 top-0 inline-flex items-center gap-2 text-[20px] font-semibold text-[#0F1B25]">
                              <Clock className="size-5" />
                              {formatTimer(juniorTimerSeconds)}
                            </div>
                            <div className="absolute inset-x-[-18px] bottom-[-10px] top-8 bg-[url('/find-step-assessment-illustration.png')] bg-contain bg-center bg-no-repeat" />
                          </div>
                        </div>

                        <div className="rounded-[8px] border border-[#E6E6E6] bg-white p-4 shadow-[0_12px_24px_rgba(15,27,37,0.06)]">
                          <div className="text-[18px] font-semibold text-[#0F1B25]">Questions</div>
                          <div className="mt-4 grid grid-cols-5 gap-2.5">
                            {Array.from({ length: juniorQuestions.length }).map((_, index) => {
                              const question = juniorQuestions[index];
                              const questionKey = question ? `${question.subject}-${question.id}-${index}` : "";
                              const isAnswered = Boolean(questionKey && juniorAnswers[questionKey]);
                              const isActive = index === activeJuniorQuestionIndex;
                              return (
                                <button
                                  key={index}
                                  type="button"
                                  onClick={() => question && setActiveJuniorQuestionIndex(index)}
                                  disabled={!hasStartedJuniorTest || !question}
                                  className={`flex size-8 items-center justify-center rounded-full border text-[14px] font-medium transition ${
                                    isActive
                                      ? "border-[#F4B400] bg-[#F4B400] text-white"
                                      : isAnswered
                                        ? "border-[#F4B400] bg-[#FFF4CC] text-[#0F1B25]"
                                        : hasStartedJuniorTest && question
                                          ? "border-[#E6E6E6] bg-white text-[#0F1B25] hover:border-[#F4B400] hover:bg-[#FFF4CC]"
                                          : "cursor-not-allowed border-[#E6E6E6] bg-[#F8F9FB] text-[#B8C0C8]"
                                  }`}
                                  aria-label={`Go to question ${index + 1}`}
                                >
                                  {index + 1}
                                </button>
                              );
                            })}
                          </div>
                          <div className="mt-5 space-y-2 text-[14px] text-[#5F6B76]">
                            <div className="flex items-center gap-2">
                              <span className="size-3 rounded-full bg-[#F4B400]" />
                              Answered
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="size-3 rounded-full bg-[#DDE2E7]" />
                              Not Answered
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-col items-center gap-3">
                        {!hasStartedJuniorTest ? (
                        <div className="flex w-full max-w-[520px] flex-col gap-3 sm:flex-row sm:gap-4">
                          <button
                            type="button"
                            onClick={goToPreviousStep}
                            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[6px] border border-[#F4B400] bg-[#F4B400] px-6 text-[16px] font-semibold !text-[#071A44] shadow-[0_8px_16px_rgba(244,180,0,0.18)] transition hover:border-[#0F1B25] hover:bg-[#0F1B25] hover:!text-white sm:flex-1"
                          >
                            <ArrowRight className="size-4 rotate-180" />
                            Back
                          </button>
                          <button
                            type="button"
                            onClick={() => setHasStartedJuniorTest(true)}
                            className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-[6px] bg-[#F4B400] px-6 text-[16px] font-semibold !text-[#071A44] shadow-[0_10px_18px_rgba(244,180,0,0.22)] transition hover:bg-[#0F1B25] hover:!text-white sm:flex-[1.8]"
                          >
                            <span className="whitespace-nowrap">Start Assessment</span>
                            <ArrowRight className="size-5 shrink-0" />
                          </button>
                        </div>
                        ) : (
                        <div className="flex w-full max-w-[560px] flex-wrap justify-center gap-3">
                          <button
                            type="button"
                            onClick={goToPreviousStep}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-[6px] border border-[#F4B400] bg-[#F4B400] px-5 text-[16px] font-semibold !text-[#071A44] shadow-[0_8px_16px_rgba(244,180,0,0.18)] transition hover:border-[#0F1B25] hover:bg-[#0F1B25] hover:!text-white"
                          >
                            <ArrowRight className="size-4 rotate-180" />
                            Back
                          </button>
                          <button
                            type="button"
                            onClick={goToPreviousJuniorQuestion}
                            disabled={activeJuniorQuestionIndex === 0}
                            className="inline-flex h-11 items-center justify-center rounded-[6px] border border-[#E6E6E6] bg-white px-5 text-[16px] font-medium text-[#0F1B25] shadow-[0_5px_14px_rgba(15,27,37,0.04)] transition hover:bg-[#F8F9FB] disabled:cursor-not-allowed disabled:text-[#B8C0C8]"
                          >
                            Previous
                          </button>
                          {activeJuniorQuestionIndex >= juniorQuestions.length - 1 ? (
                          <button
                            type="button"
                            onClick={submitJuniorTest}
                            disabled={!selectedJuniorAnswer || hasSubmittedJuniorTest}
                              className="inline-flex h-11 items-center justify-center rounded-[6px] bg-[#F4B400] px-6 text-[16px] font-semibold text-[#0F1B25] shadow-[0_10px_18px_rgba(244,180,0,0.22)] transition hover:bg-[#0F1B25] hover:text-white disabled:cursor-not-allowed disabled:bg-[#B8C0C8] disabled:text-white"
                            >
                              {hasSubmittedJuniorTest ? "Submitted" : "Submit"}
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={goToNextJuniorQuestion}
                              className="inline-flex h-11 items-center justify-center gap-2 rounded-[6px] bg-[#F4B400] px-6 text-[16px] font-medium !text-[#071A44] shadow-[0_10px_18px_rgba(244,180,0,0.22)] transition hover:bg-[#0F1B25] hover:!text-white"
                            >
                              Next
                              <ArrowRight className="size-4" />
                            </button>
                          )}
                        </div>
                        )}
                        <div className="text-center text-[14px] text-[#5F6B76]">
                          This is just a preview. Actual test may vary.
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="rounded-[8px] border border-[#E6E6E6] bg-white px-4 py-5 text-center text-[14px] font-medium text-[#5F6B76]">
                      {juniorQuestionsStatus ||
                        `No saved questions found for ${selectedDegree || "this degree"} ${juniorQuestionLevelGroup || selectedLevel}.`}
                    </div>
                  )}
                </div>
              ) : null}

              {activeStep === 5 && isJuniorLevel ? (
                <div className="mt-3 rounded-[10px] border border-[#dce5fb] bg-white p-3 shadow-[0_10px_22px_rgba(20,42,99,0.08)]">
                  <div className="mb-3 flex items-center justify-center gap-2.5">
                    <div className="relative flex size-10 items-center justify-center text-[#F4B400]">
                      <Trophy className="size-8 fill-[#F4B400]/20" />
                      <span className="absolute -left-2 top-0 text-[12px] text-[#F4B400]">+</span>
                      <span className="absolute -right-1 -top-1 text-[12px] text-[#F4B400]">+</span>
                    </div>
                    <div>
                      <h3 className="text-[24px] font-semibold leading-[1.25] text-[#0F1B25]">Assessment Result</h3>
                      <div className="mt-0.5 text-[16px] font-normal leading-6 text-[#5F6B76]">Your score is calculated from saved admin answers</div>
                    </div>
                  </div>

                  {juniorQuestionsLoading ? (
                    <div className="mt-4 rounded-[8px] border border-[#dce5fb] bg-[#fbfdff] px-4 py-5 text-center text-[0.82rem] font-semibold text-[#52618a]">
                      Loading saved questions...
                    </div>
                  ) : activeJuniorQuestion ? (
                    <div className="mt-3">
                      {activeStep === 5 && hasSubmittedJuniorTest ? (
                        <div className="space-y-3">
                          <div className="grid gap-3 rounded-[8px] border border-[#E6E6E6] bg-white p-3 shadow-[0_10px_20px_rgba(15,27,37,0.06)] lg:grid-cols-[minmax(0,1fr)_270px]">
                            <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-3">
                              <div className="flex min-h-[58px] items-center gap-2 border-b border-r border-[#E6E6E6] pb-2.5 pr-2 lg:border-b-0 lg:pb-0">
                                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#FFF4CC] text-[#D99A00] sm:size-8">
                                  <User className="size-4" />
                                </div>
                                <div className="min-w-0">
                                  <div className="text-[14px] font-normal uppercase text-[#5F6B76]">Full Name</div>
                                  <div className="mt-0.5 truncate text-[16px] font-normal text-[#0F1B25]">
                                    {name || "Student"}
                                  </div>
                                </div>
                              </div>
                              <div className="flex min-h-[58px] items-center gap-2 border-b border-[#E6E6E6] pb-2.5 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-2">
                                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#FFF4CC] text-[#D99A00] sm:size-8">
                                  <Phone className="size-4" />
                                </div>
                                <div className="min-w-0">
                                  <div className="text-[14px] font-normal uppercase text-[#5F6B76]">Phone Number</div>
                                  <div className="mt-0.5 truncate text-[16px] font-normal text-[#0F1B25]">
                                    {phone || "Not added"}
                                  </div>
                                </div>
                              </div>
                              <div className="flex min-h-[58px] items-center gap-2 border-b border-r border-[#E6E6E6] pb-2.5 pr-2 lg:border-b-0 lg:border-r-0 lg:pb-0 lg:pr-0">
                                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#FFF4CC] text-[#D99A00] sm:size-8">
                                  <GraduationCap className="size-4" />
                                </div>
                                <div className="min-w-0">
                                  <div className="text-[14px] font-normal uppercase text-[#5F6B76]">Level</div>
                                  <div className="mt-0.5 truncate text-[16px] font-normal text-[#0F1B25]">
                                    {formatLevelLabel(selectedLevel)}
                                  </div>
                                </div>
                              </div>
                              <div className="flex min-h-[58px] items-center gap-2 border-b border-[#E6E6E6] pb-2.5 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-2">
                                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#FFF4CC] text-[#D99A00] sm:size-8">
                                  <School className="size-4" />
                                </div>
                                <div className="min-w-0">
                                  <div className="text-[14px] font-normal uppercase text-[#5F6B76]">Degree Stream</div>
                                  <div className="mt-0.5 truncate text-[16px] font-normal text-[#0F1B25]">
                                    {selectedDegree}
                                  </div>
                                </div>
                              </div>
                              <div className="flex min-h-[58px] items-center gap-2 border-r border-[#E6E6E6] pr-2 lg:border-r">
                                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#FFF4CC] text-[#D99A00] sm:size-8">
                                  <CalendarDays className="size-4" />
                                </div>
                                <div className="min-w-0">
                                  <div className="text-[14px] font-normal uppercase text-[#5F6B76]">Test Date</div>
                                  <div className="mt-0.5 truncate text-[16px] font-normal text-[#0F1B25]">
                                    {juniorResultDate}
                                  </div>
                                </div>
                              </div>
                              <div className="flex min-h-[58px] items-center gap-2 lg:border-r-0">
                                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#FFF4CC] text-[#D99A00] sm:size-8">
                                  <Clock className="size-4" />
                                </div>
                                <div className="min-w-0">
                                  <div className="text-[14px] font-normal uppercase text-[#5F6B76]">Time Taken</div>
                                  <div className="mt-0.5 truncate text-[16px] font-normal text-[#0F1B25]">
                                    {formatDurationLabel(juniorTimerSeconds)}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="rounded-[8px] border border-[#F4B400] bg-white p-3 text-center shadow-[0_10px_20px_rgba(244,180,0,0.12)]">
                              <div className="text-[14px] font-normal uppercase text-[#0F1B25]">Overall Score</div>
                              <div className="mt-1.5 text-[35.2px] font-semibold leading-none text-[#F4B400]">
                                {formatScoreNumber(juniorOverallScore)}
                                <span className="text-[16px] font-normal text-[#0F1B25]"> / {juniorAssessmentScale}</span>
                              </div>
                              <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-[#FFF4CC]">
                                <div
                                  className="h-full rounded-full bg-[#F4B400]"
                                  style={{ width: `${Math.min(100, juniorPercentage)}%` }}
                                />
                              </div>
                              <div className="mt-1 text-right text-[14px] font-normal text-[#0F1B25]">
                                {Math.round(juniorPercentage)}%
                              </div>
                              <div className="mt-2.5 rounded-[8px] border border-[#DCEEDB] bg-[#F5FFF4] px-3 py-2 text-left">
                                <div className="flex items-center gap-2 text-[16px] font-normal text-[#16A34A]">
                                  <Check className="size-4" />
                                  {juniorResultTone.label} Performance
                                </div>
                                <div className="mt-0.5 text-[14px] font-normal text-[#5F6B76]">
                                  {juniorCorrectCount} correct out of {juniorQuestionTotal} questions
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="rounded-[8px] bg-white">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div>
                                <div className="text-[28px] font-semibold leading-[1.22] text-[#0F1B25]">Subject Wise Marks</div>
                                <div className="mt-1 text-[16px] font-normal text-[#5F6B76]">Out of 100. Click a subject to view answers.</div>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={goToPreviousStep}
                                  className="inline-flex h-10 items-center justify-center rounded-[6px] border border-[#0F1B25] bg-[#0F1B25] px-5 text-[16px] font-medium !text-white shadow-[0_8px_16px_rgba(15,27,37,0.18)] transition hover:border-[#F4B400] hover:bg-[#F4B400] hover:!text-[#0F1B25]"
                                >
                                  Back
                                </button>
                                <button
                                  type="button"
                                  onClick={resetJuniorAssessment}
                                  className="inline-flex h-10 items-center justify-center gap-2 rounded-[6px] border border-[#F4B400] bg-[#F4B400] px-5 text-[16px] font-medium !text-[#0F1B25] shadow-[0_8px_16px_rgba(244,180,0,0.18)] transition hover:border-[#0F1B25] hover:bg-[#0F1B25] hover:!text-white"
                                >
                                  <RotateCcw className="size-4" />
                                  Retake
                                </button>
                              </div>
                            </div>
                            <div className="mt-4 grid gap-4 md:grid-cols-3">
                              {juniorSubjectResults.map((subjectResult) => {
                                const isActiveSubject = activeJuniorSubjectResult?.subject === subjectResult.subject;
                                const SubjectIcon = normalizeText(subjectResult.subject).includes("math")
                                  ? Calculator
                                  : normalizeText(subjectResult.subject).includes("chem")
                                    ? FlaskConical
                                    : BookOpen;

                                return (
                                  <button
                                    key={subjectResult.subject}
                                    type="button"
                                    onClick={() => setActiveJuniorResultSubject(subjectResult.subject)}
                                    className={`rounded-[8px] border bg-white p-4 text-left transition shadow-[0_8px_18px_rgba(15,27,37,0.05)] ${
                                      isActiveSubject
                                        ? "border-[#F4B400]"
                                        : "border-[#E6E6E6] hover:border-[#F4B400]"
                                    }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#FFF4CC] text-[#D99A00]">
                                        <SubjectIcon className="size-5" />
                                      </div>
                                      <div className="min-w-0">
                                        <div className="truncate text-[20px] font-semibold leading-[1.3] text-[#0F1B25]">{subjectResult.subject}</div>
                                        <div className="mt-1 text-[20px] font-semibold leading-none text-[#16A34A]">
                                          {Math.round(subjectResult.percentage)}
                                          <span className="text-[16px] font-normal text-[#0F1B25]"> / 100</span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#E6E6E6]">
                                      <div
                                        className="h-full rounded-full bg-[#16A34A]"
                                        style={{ width: `${Math.min(100, subjectResult.percentage)}%` }}
                                      />
                                    </div>
                                    <div className="mt-3 flex items-center justify-between gap-2 text-[14px] font-normal">
                                      <span className="text-[#16A34A]">
                                        {subjectResult.tone.label}
                                      </span>
                                      <span className="text-[#5F6B76]">{subjectResult.correct}/{subjectResult.total} correct</span>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div className="rounded-[8px] bg-white py-6">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                              <div>
                                <div className="text-[28px] font-semibold leading-[1.22] text-[#0F1B25]">
                                  Suggested Colleges
                                </div>
                                <div className="mt-4 text-[16px] font-normal text-[#354150]">
                                  Based on {selectedDegree} cutoff {formatScoreNumber(juniorOverallScore)} / {juniorAssessmentScale}
                                </div>
                              </div>
                              <div className="inline-flex h-14 items-center gap-3 rounded-[10px] border border-[#DDE2E7] bg-white px-6 text-[16px] font-medium text-[#0F1B25] shadow-[0_8px_18px_rgba(15,27,37,0.04)]">
                                <Users className="size-5" />
                                {sortedJuniorCollegeSuggestions.length} matches
                              </div>
                            </div>
                            <div className="mt-7 border-t border-[#E6E6E6] pt-7">
                              <div className="flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:flex-wrap sm:items-center">
                                <div className="text-[16px] font-normal text-[#354150]">
                                  Showing <span className="font-semibold text-[#0F1B25]">{suggestionStartNumber}</span>-<span className="font-semibold text-[#0F1B25]">{suggestionEndNumber}</span> of <span className="font-semibold text-[#0F1B25]">{sortedJuniorCollegeSuggestions.length}</span> colleges
                                </div>
                                <div className="grid w-full grid-cols-1 gap-3 lg:w-auto lg:grid-cols-[minmax(190px,auto)_auto] lg:items-center">
                                  <div className="relative min-w-0">
                                    <button
                                      type="button"
                                      onClick={() => setIsSuggestionSortOpen((isOpen) => !isOpen)}
                                      className="inline-flex h-12 w-full items-center justify-between gap-4 rounded-[8px] border border-[#DDE2E7] bg-white px-5 text-[16px] font-normal text-[#0F1B25] sm:min-w-[190px]"
                                      aria-expanded={isSuggestionSortOpen}
                                    >
                                      <span className="min-w-0 truncate">{suggestionSortLabel}</span>
                                      <ChevronDown className="size-4 shrink-0 text-[#5F6B76]" />
                                    </button>
                                    {isSuggestionSortOpen ? (
                                      <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-[12px] border border-[#E6E6E6] bg-white p-2 shadow-[0_18px_34px_rgba(15,27,37,0.16)] sm:left-auto sm:w-[220px]">
                                        {[
                                          { value: "alphabetical" as const, label: "Alphabetical" },
                                          { value: "newest" as const, label: "Newest first" },
                                          { value: "oldest" as const, label: "Oldest first" },
                                        ].map((option) => {
                                          const isSelected = suggestionSort === option.value;
                                          return (
                                            <button
                                              key={option.value}
                                              type="button"
                                              onClick={() => {
                                                setSuggestionSort(option.value);
                                                setIsSuggestionSortOpen(false);
                                              }}
                                              className={`flex h-12 w-full items-center gap-3 rounded-[10px] px-4 text-left text-[16px] font-normal transition ${
                                                isSelected ? "bg-[#ECFFF2] text-[#16A34A]" : "text-[#354150] hover:bg-[#F8F9FB]"
                                              }`}
                                            >
                                              <Check className={`size-4 ${isSelected ? "opacity-100" : "opacity-0"}`} />
                                              {option.label}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    ) : null}
                                  </div>
                                  <div className="grid w-full grid-cols-2 overflow-hidden rounded-[8px] border border-[#DDE2E7] bg-white sm:inline-flex sm:w-auto">
                                    <button
                                      type="button"
                                      onClick={() => setSuggestionView("grid")}
                                      className={`inline-flex h-12 min-w-0 items-center justify-center gap-2 px-3 text-[15px] font-medium sm:px-5 sm:text-[16px] ${
                                        suggestionView === "grid" ? "bg-[#F4B400] text-[#0F1B25]" : "bg-white text-[#354150]"
                                      }`}
                                    >
                                      <LayoutGrid className="size-4 shrink-0" />
                                      <span className="whitespace-nowrap">Grid</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setSuggestionView("list")}
                                      className={`inline-flex h-12 min-w-0 items-center justify-center gap-2 px-3 text-[15px] font-medium sm:px-5 sm:text-[16px] ${
                                        suggestionView === "list" ? "bg-[#F4B400] text-[#0F1B25]" : "bg-white text-[#354150]"
                                      }`}
                                    >
                                      <List className="size-4 shrink-0" />
                                      <span className="whitespace-nowrap">List</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {sortedJuniorCollegeSuggestions.length ? (
                              <>
                              <div
                                ref={suggestedCollegesListRef}
                                className={suggestionView === "grid" ? "mt-8 scroll-mt-24 grid auto-rows-fr gap-6 lg:grid-cols-3" : "mt-8 scroll-mt-24 grid gap-4"}
                              >
                                {visibleJuniorCollegeSuggestions.map((suggestion, suggestionIndex) => {
                                  const absoluteSuggestionIndex = (suggestionPage - 1) * SUGGESTIONS_PER_PAGE + suggestionIndex;
                                  const cardTheme =
                                    absoluteSuggestionIndex % 3 === 0
                                      ? {
                                          band: "bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,0.24),transparent_32%),linear-gradient(135deg,#5BBDA7,#168A7C)]",
                                          label: "Best Match",
                                          labelIcon: <Trophy className="size-4 fill-[#F4B400]/30" />,
                                          pill: "border-[#F4B400] bg-[#FFF4CC] text-[#D99A00]",
                                          metric: "text-[#008C46]",
                                          cta: "bg-[#FFF8E5] text-[#D99A00]",
                                        }
                                      : absoluteSuggestionIndex % 3 === 1
                                        ? {
                                            band: "bg-[radial-gradient(circle_at_30%_0%,rgba(255,255,255,0.25),transparent_35%),linear-gradient(135deg,#7182F4,#C4B5FD)]",
                                            label: "High Match",
                                            labelIcon: <Check className="size-4" />,
                                            pill: "border-[#CDEFD8] bg-[#ECFFF2] text-[#008C46]",
                                            metric: "text-[#008C46]",
                                            cta: "bg-[#ECFFF2] text-[#008C46]",
                                          }
                                        : {
                                            band: "bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,0.34),transparent_32%),linear-gradient(135deg,#FF6F61,#FFD0A3)]",
                                            label: "Top Match",
                                            labelIcon: <Trophy className="size-4 fill-[#D99A00]/30" />,
                                            pill: "border-[#F4B400] bg-[#FFF4CC] text-[#D99A00]",
                                            metric: "text-[#D94E00]",
                                            cta: "bg-[#FFF8E5] text-[#D99A00]",
                                          };

                                  if (suggestionView === "list") {
                                    return (
                                      <a
                                        key={suggestion.id}
                                        href={suggestion.href}
                                        onClick={saveFindFormStateForCollegeDetails}
                                        className="group grid min-h-[108px] grid-cols-[56px_minmax(0,1fr)] items-center gap-x-3 gap-y-4 rounded-[18px] border border-[#E6E6E6] bg-white px-3 py-4 shadow-[0_8px_18px_rgba(15,27,37,0.04)] transition hover:border-[#F4B400] hover:shadow-[0_14px_26px_rgba(15,27,37,0.08)] sm:grid-cols-[72px_minmax(0,1fr)_92px_86px_86px_32px] sm:gap-5 sm:px-5"
                                      >
                                        <CollegeLogoBadge
                                          src={suggestion.logo}
                                          alt={suggestion.collegeName}
                                          mode="cover"
                                          className="size-14 rounded-full sm:size-[68px]"
                                          imageClassName="rounded-full"
                                          fallback={<Building2 className="size-7" />}
                                        />
                                        <div className="min-w-0">
                                          <div className="line-clamp-2 text-[20px] font-semibold leading-[1.3] text-[#0F1B25] sm:truncate">
                                            {suggestion.collegeName}
                                          </div>
                                          <div className="mt-2 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[16px] font-normal text-[#5F6B76] sm:flex-nowrap">
                                            <span className="truncate">{suggestion.ownershipType}</span>
                                            <span aria-hidden="true">.</span>
                                            <span className="truncate">{suggestion.location || selectedState}</span>
                                          </div>
                                        </div>
                                        <div className="col-span-2 grid min-w-0 grid-cols-3 gap-2 sm:contents">
                                          <div className="min-w-0 rounded-[10px] bg-[#F8F9FB] px-1.5 py-2 text-center sm:bg-transparent sm:p-0">
                                            <div className="text-[14px] font-normal text-[#8A949F]">Cut Off</div>
                                            <div className={`mt-1 whitespace-nowrap text-[clamp(0.72rem,3vw,1rem)] font-normal sm:text-[16px] ${cardTheme.metric}`}>{suggestion.cutoffLabel}</div>
                                          </div>
                                          <div className="min-w-0 rounded-[10px] bg-[#F8F9FB] px-1.5 py-2 text-center sm:bg-transparent sm:p-0">
                                            <div className="text-[14px] font-normal text-[#8A949F]">Est.</div>
                                            <div className="mt-1 text-[16px] font-normal text-[#0F1B25]">{suggestion.establishedYear}</div>
                                          </div>
                                          <div className="min-w-0 rounded-[10px] bg-[#F8F9FB] px-1.5 py-2 text-center sm:bg-transparent sm:p-0">
                                            <div className="text-[14px] font-normal text-[#8A949F]">Ranking</div>
                                            <div className="mt-1 text-[16px] font-normal leading-5 text-[#0F1B25]">{suggestion.ranking}</div>
                                          </div>
                                        </div>
                                        <ArrowRight className="hidden size-5 text-[#B8C0C8] transition group-hover:translate-x-1 group-hover:text-[#D99A00] sm:block" />
                                      </a>
                                    );
                                  }

                                  return (
                                  <a
                                    key={suggestion.id}
                                    href={suggestion.href}
                                    onClick={saveFindFormStateForCollegeDetails}
                                    className="group flex h-full flex-col overflow-hidden rounded-[14px] border border-[#E6E6E6] bg-white shadow-[0_18px_34px_rgba(15,27,37,0.08)] transition hover:-translate-y-1 hover:shadow-[0_24px_44px_rgba(15,27,37,0.12)]"
                                  >
                                    <div className={`relative min-h-[205px] overflow-hidden p-5 text-white ${cardTheme.band}`}>
                                      <span className={`inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-[14px] font-normal ${cardTheme.pill}`}>
                                        {cardTheme.labelIcon}
                                        {cardTheme.label}
                                      </span>
                                      <span className="absolute right-5 top-5 flex size-10 items-center justify-center rounded-[10px] bg-white text-[#0F1B25] shadow-[0_10px_18px_rgba(15,27,37,0.16)]">
                                        <BookOpen className="size-5" />
                                      </span>
                                      <div className="mt-12 flex items-center gap-5">
                                        <CollegeLogoBadge
                                          src={suggestion.logo}
                                          alt={suggestion.collegeName}
                                          mode="cover"
                                          className="size-[74px] shrink-0 rounded-full border-4 border-white/70 shadow-[0_12px_20px_rgba(15,27,37,0.16)]"
                                          imageClassName="rounded-full"
                                          fallback={<Building2 className="size-8" />}
                                        />
                                        <div className="min-w-0">
                                          <div className="line-clamp-2 text-[20px] font-semibold leading-[1.3] text-white">
                                            {suggestion.collegeName}
                                          </div>
                                          <div className="mt-2.5 flex min-w-0 items-center gap-2 text-[16px] font-normal text-white/95">
                                            <MapPin className="size-4.5 shrink-0" />
                                            <span className="truncate">{suggestion.location || selectedState}</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex flex-1 flex-col p-4">
                                      <div className="grid grid-cols-2 overflow-hidden rounded-[10px] bg-[#F8F9FB]">
                                        <div className="border-r border-[#DDE2E7] px-3 py-3 text-center">
                                          <div className="text-[14px] font-normal uppercase text-[#354150]">Cut Off</div>
                                          <div className={`mt-1.5 text-[20px] font-semibold ${cardTheme.metric}`}>
                                          {suggestion.cutoffLabel}
                                          </div>
                                        </div>
                                        <div className="px-3 py-3 text-center">
                                          <div className="text-[14px] font-normal uppercase text-[#354150]">Ranking</div>
                                          <div className="mt-1.5 text-[20px] font-semibold text-[#0F1B25]">
                                            {suggestion.ranking}
                                          </div>
                                        </div>
                                      </div>

                                      <div className="mt-4 flex min-h-[72px] flex-wrap items-start gap-x-2.5 gap-y-1.5 text-[16px] font-normal leading-6 text-[#0F1B25]">
                                        <span className="inline-flex min-w-0 items-center gap-2">
                                          <GraduationCap className="size-4 shrink-0" />
                                          <span>{suggestion.ownershipType}</span>
                                        </span>
                                        <span className="text-[#8A949F]">.</span>
                                        <span>{suggestion.accreditation}</span>
                                        <span className="text-[#8A949F]">.</span>
                                        <span className="inline-flex min-w-0 items-center gap-2">
                                          <CalendarDays className="size-4 shrink-0" />
                                          <span>{suggestion.establishedYear}</span>
                                        </span>
                                      </div>

                                      <div className={`mt-auto inline-flex h-12 w-full items-center justify-center gap-3 rounded-[10px] text-[16px] font-medium transition group-hover:brightness-95 ${cardTheme.cta}`}>
                                        View College Details
                                        <ArrowRight className="size-5 transition group-hover:translate-x-0.5" />
                                      </div>
                                    </div>
                                  </a>
                                  );
                                })}
                              </div>
                              {suggestionPageCount > 1 ? (
                                <div className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                                  {visibleSuggestionPageNumbers[0] > 1 ? (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => goToSuggestionPage(1)}
                                        className="inline-flex size-10 items-center justify-center rounded-[10px] border border-[#E6E6E6] bg-white text-[15px] font-semibold text-[#008C46] shadow-[0_6px_14px_rgba(15,27,37,0.08)] transition hover:border-[#F4B400] hover:bg-[#FFF4CC] sm:size-12 sm:rounded-[12px] sm:text-[16px]"
                                        aria-label="Go to page 1"
                                      >
                                        1
                                      </button>
                                      <span className="inline-flex size-10 items-center justify-center text-[16px] font-semibold text-[#0F1B25] sm:size-12 sm:text-[18px]">
                                        ...
                                      </span>
                                    </>
                                  ) : null}
                                  {visibleSuggestionPageNumbers.map((pageNumber) => {
                                    const isCurrentPage = suggestionPage === pageNumber;
                                    return (
                                      <button
                                        key={pageNumber}
                                        type="button"
                                        onClick={() => goToSuggestionPage(pageNumber)}
                                        className={`inline-flex size-10 items-center justify-center rounded-[10px] text-[15px] font-semibold transition sm:size-12 sm:rounded-[12px] sm:text-[16px] ${
                                          isCurrentPage
                                            ? "bg-[#F4B400] text-[#0F1B25] shadow-[0_8px_16px_rgba(244,180,0,0.24)]"
                                            : "bg-white text-[#008C46] hover:bg-[#FFF4CC]"
                                        } ${isCurrentPage ? "" : "border border-transparent"}`}
                                        aria-current={isCurrentPage ? "page" : undefined}
                                        aria-label={`Go to page ${pageNumber}`}
                                      >
                                        {pageNumber}
                                      </button>
                                    );
                                  })}
                                  {visibleSuggestionPageNumbers[visibleSuggestionPageNumbers.length - 1] < suggestionPageCount ? (
                                    <>
                                      <span className="inline-flex size-10 items-center justify-center text-[16px] font-semibold text-[#0F1B25] sm:size-12 sm:text-[18px]">
                                        ...
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => goToSuggestionPage(suggestionPageCount)}
                                        className="inline-flex size-10 items-center justify-center rounded-[10px] bg-white text-[15px] font-semibold text-[#008C46] transition hover:bg-[#FFF4CC] sm:size-12 sm:rounded-[12px] sm:text-[16px]"
                                        aria-label={`Go to page ${suggestionPageCount}`}
                                      >
                                        {suggestionPageCount}
                                      </button>
                                    </>
                                  ) : null}
                                  <button
                                    type="button"
                                    onClick={() => goToSuggestionPage(suggestionPage + 1)}
                                    disabled={suggestionPage >= suggestionPageCount}
                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-[10px] px-3 text-[15px] font-semibold text-[#008C46] transition hover:bg-[#FFF4CC] disabled:cursor-not-allowed disabled:text-[#B8C0C8] disabled:hover:bg-transparent sm:h-12 sm:rounded-[12px] sm:px-4 sm:text-[17px]"
                                  >
                                    Next
                                    <ArrowRight className="size-4" />
                                  </button>
                                </div>
                              ) : null}
                              </>
                            ) : (
                              <div className="mt-3 rounded-[8px] border border-[#dce5fb] bg-[#fbfdff] px-4 py-5 text-center">
                                <div className="text-[0.78rem] font-extrabold text-[#052a82]">
                                  No cutoff-matched colleges found yet.
                                </div>
                                <div className="mt-1 text-[0.68rem] font-semibold text-[#52618a]">
                                  {`Add ${selectedDegree || "degree"} courses with cutoff details in admin to show suggestions here.`}
                                </div>
                              </div>
                            )}
                          </div>

                        </div>
                      ) : (
                      <>
                      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_190px]">
                        <div className="rounded-[8px] border border-[#dce5fb] bg-[#fbfdff] p-3">
                          <div className="flex items-center justify-between gap-3 text-[0.74rem] font-bold text-[#52618a]">
                            <span>
                              Question {activeJuniorQuestionIndex + 1} of {juniorQuestionTotal}
                            </span>
                            <span className="inline-flex items-center gap-1.5 text-[#0856dc]">
                              <Clock className="size-4" />
                              <span className="text-[1.05rem] font-extrabold leading-5">
                                {formatTimer(juniorTimerSeconds)}
                              </span>
                            </span>
                          </div>
                          <div className="mt-2 inline-flex rounded-full bg-[#eef4ff] px-2.5 py-1 text-[0.68rem] font-bold text-[#0856dc]">
                            {activeJuniorQuestion.subject}
                          </div>
                          <p className="mt-3 min-h-[54px] text-[0.82rem] font-semibold leading-5 text-[#17356f]">
                            {activeJuniorQuestion.question}
                          </p>
                          <div className="mt-4 grid gap-2">
                            {activeJuniorQuestion.options.map((option, optionIndex) => {
                              const optionLetter = String.fromCharCode(65 + optionIndex);
                              const isSelected = selectedJuniorAnswer === optionLetter;
                              return (
                                <button
                                  key={`${activeJuniorQuestion.id}-${optionIndex}`}
                                  type="button"
                                  onClick={() => selectJuniorAnswer(optionIndex)}
                                  disabled={!hasStartedJuniorTest || hasSubmittedJuniorTest}
                                  className={`grid min-h-12 grid-cols-[2rem_minmax(0,1fr)] items-center gap-3 rounded-[8px] border px-3 py-2 text-left text-[0.82rem] font-bold transition ${
                                    isSelected
                                      ? "border-[#0856dc] bg-[#eef4ff] text-[#0856dc] shadow-[0_8px_16px_rgba(8,86,220,0.12)]"
                                      : hasStartedJuniorTest && !hasSubmittedJuniorTest
                                        ? "border-[#dce5fb] bg-white text-[#17356f] hover:border-[#0856dc] hover:bg-[#f8fbff]"
                                        : "cursor-not-allowed border-[#dce5fb] bg-white text-[#9aa8c7]"
                                  }`}
                                >
                                  <span
                                    className={`flex size-7 items-center justify-center rounded-full text-[0.78rem] ${
                                      isSelected ? "bg-[#0856dc] text-white" : "bg-[#f3f6ff] text-[#0856dc]"
                                    }`}
                                  >
                                    {optionLetter}
                                  </span>
                                  <span className="min-w-0 break-words">{option}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="rounded-[8px] border border-[#dce5fb] bg-white p-3">
                          <div className="text-[0.74rem] font-bold text-[#052a82]">Questions</div>
                          <div className="mt-3 grid grid-cols-5 gap-2">
                            {juniorQuestions.map((question, index) => {
                              const questionKey = `${question.subject}-${question.id}-${index}`;
                              const isAnswered = Boolean(juniorAnswers[questionKey]);
                              const isActive = index === activeJuniorQuestionIndex;
                              return (
                                <button
                                  key={questionKey}
                                  type="button"
                                  onClick={() => setActiveJuniorQuestionIndex(index)}
                                  disabled={!hasStartedJuniorTest}
                                  className={`flex size-7 items-center justify-center rounded-full text-[0.68rem] font-bold transition ${
                                    isActive
                                      ? "bg-[#0856dc] text-white"
                                      : isAnswered
                                        ? "bg-[#10a85a] text-white"
                                        : hasStartedJuniorTest
                                          ? "bg-[#eef4ff] text-[#052a82] hover:bg-[#dce8ff]"
                                          : "cursor-not-allowed bg-[#f3f6ff] text-[#9aa8c7]"
                                  }`}
                                  aria-label={`Go to question ${index + 1}`}
                                >
                                  {index + 1}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {!hasStartedJuniorTest ? (
                        <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
                          <button
                            type="button"
                            onClick={goToPreviousStep}
                            className="inline-flex h-10 items-center justify-center rounded-[8px] border border-[#F4B400] bg-[#F4B400] px-6 text-[0.82rem] font-bold text-[#0F1B25] shadow-[0_8px_16px_rgba(244,180,0,0.18)] transition hover:border-[#0F1B25] hover:bg-[#0F1B25] hover:text-white"
                          >
                            Back
                          </button>
                          <button
                            type="button"
                            onClick={() => setHasStartedJuniorTest(true)}
                            className="inline-flex h-10 min-w-[180px] items-center justify-center rounded-[8px] bg-[#F4B400] px-6 text-[0.82rem] font-bold text-[#0F1B25] shadow-[0_10px_18px_rgba(244,180,0,0.22)] transition hover:bg-[#0F1B25] hover:text-white"
                          >
                            <span className="whitespace-nowrap">Start Assessment</span>
                          </button>
                        </div>
                      ) : (
                      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={goToPreviousStep}
                            className="inline-flex h-10 items-center justify-center rounded-[8px] border border-[#F4B400] bg-[#F4B400] px-5 text-[0.82rem] font-bold text-[#0F1B25] shadow-[0_8px_16px_rgba(244,180,0,0.18)] transition hover:border-[#0F1B25] hover:bg-[#0F1B25] hover:text-white"
                          >
                            Back
                          </button>
                          <button
                            type="button"
                            onClick={goToPreviousJuniorQuestion}
                            disabled={activeJuniorQuestionIndex === 0}
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-[8px] border border-[#dce5fb] bg-white px-5 text-[0.82rem] font-bold text-[#052a82] shadow-[0_8px_16px_rgba(20,42,99,0.06)] transition hover:bg-[#f4f7ff] disabled:cursor-not-allowed disabled:text-[#9aa8c7] disabled:hover:bg-white"
                          >
                            Previous
                          </button>
                        </div>
                        {activeJuniorQuestionIndex >= juniorQuestions.length - 1 ? (
                          <button
                            type="button"
                            onClick={submitJuniorTest}
                            disabled={!selectedJuniorAnswer || hasSubmittedJuniorTest}
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-[8px] bg-[#F4B400] px-6 text-[0.82rem] font-bold text-[#0F1B25] shadow-[0_10px_18px_rgba(244,180,0,0.22)] transition hover:bg-[#0F1B25] hover:text-white disabled:cursor-not-allowed disabled:bg-[#9db8ed] disabled:text-white"
                          >
                            {hasSubmittedJuniorTest ? "Submitted" : "Submit"}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={goToNextJuniorQuestion}
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-[8px] bg-[#F4B400] px-6 text-[0.82rem] font-bold text-[#0F1B25] shadow-[0_10px_18px_rgba(244,180,0,0.22)] transition hover:bg-[#0F1B25] hover:text-white"
                          >
                            Next
                            <ArrowRight className="size-4" />
                          </button>
                        )}
                      </div>
                      )}
                      </>
                      )}
                    </div>
                  ) : (
                    <div className="mt-4 rounded-[8px] border border-[#dce5fb] bg-[#fbfdff] px-4 py-5 text-center text-[0.82rem] font-semibold text-[#52618a]">
                      {juniorQuestionsStatus ||
                        `No saved questions found for ${selectedDegree || "this degree"} ${juniorQuestionLevelGroup || selectedLevel}.`}
                    </div>
                  )}
                  {!activeJuniorQuestion ? (
                    <div className="mt-4 flex justify-center">
                      <button
                        type="button"
                        onClick={goToPreviousStep}
                        className="inline-flex h-10 items-center justify-center rounded-[8px] border border-[#dce5fb] bg-white px-6 text-[0.82rem] font-bold text-[#052a82] shadow-[0_8px_16px_rgba(20,42,99,0.06)] transition hover:bg-[#f4f7ff]"
                      >
                        Back
                      </button>
                    </div>
                  ) : null}
                </div>
              ) : null}
                </>
              ) : null}

              {inlineMatchQueryString ? (
                <div ref={inlineMatchResultsRef} className="mt-3 scroll-mt-6 overflow-hidden rounded-[18px]">
                  <div className="mb-2 flex justify-start">
                    <button
                      type="button"
                      onClick={goBackFromInlineResults}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-[2px] border border-[#F4B400] bg-[#F4B400] px-6 text-[16px] font-medium !text-[#071A44] shadow-[0_10px_18px_rgba(244,180,0,0.18)] transition hover:border-[#0F1B25] hover:bg-[#0F1B25] hover:!text-white"
                    >
                      <ArrowRight className="size-4 rotate-180" />
                      Back
                    </button>
                  </div>
                  <CutoffClient
                    embedded
                    selectedLevel={
                      pickInlineMatchParam("level") ||
                      pickInlineMatchParam("standard") ||
                      pickInlineMatchParam("class")
                    }
                    selectedState={pickInlineMatchParam("state") || "Tamil Nadu"}
                    selectedDegree={pickInlineMatchParam("degree")}
                    selectedCourse={pickInlineMatchParam("course")}
                    selectedSpecialization={pickInlineMatchParam("specialization")}
                    selectedCategory={pickInlineMatchParam("category")}
                    selectedDreamCollege={pickInlineMatchParam("dreamCollege")}
                    selectedCollegeType={pickInlineMatchParam("collegeType")}
                    selectedAdmissionType={pickInlineMatchParam("admissionType")}
                    enteredCutoff={inlineEnteredScore}
                    studentName={
                      pickInlineMatchParam("name") ||
                      pickInlineMatchParam("studentName") ||
                      pickInlineMatchParam("fullName") ||
                      pickInlineMatchParam("username")
                    }
                    submittedDetails={inlineSubmittedDetails}
                    colleges={colleges}
                    courses={courses}
                  />
                </div>
              ) : null}

              {activeStep <= 3 || ((activeStep === 4 || activeStep === 5) && isJuniorLevel) ? null : inlineMatchQueryString ? null : (
              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-center">
                {activeStep > 1 ? (
                  <>
                  <button
                    type="button"
                    onClick={goToPreviousStep}
                    className="inline-flex h-11 items-center justify-center rounded-[8px] border border-[#dce5fb] bg-white px-6 text-[0.9rem] font-bold text-[#052a82] shadow-[0_10px_18px_rgba(20,42,99,0.06)] transition hover:bg-[#f4f7ff] sm:min-w-[120px]"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={resetFinalDetailsFields}
                    className="inline-flex h-11 items-center justify-center rounded-[8px] border border-[#F4B400] bg-white px-6 text-[0.9rem] font-bold text-[#071A44] shadow-[0_10px_18px_rgba(244,180,0,0.10)] transition hover:bg-[#FFF7DF] sm:min-w-[120px]"
                  >
                    Reset
                  </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={resetFormFields}
                    className="inline-flex h-11 items-center justify-center rounded-[8px] border border-[#dce5fb] bg-white px-6 text-[0.9rem] font-bold text-[#052a82] shadow-[0_10px_18px_rgba(20,42,99,0.06)] transition hover:bg-[#f4f7ff] sm:min-w-[120px]"
                  >
                    Reset
                  </button>
                )}
                <button
                  type={activeStep < 4 ? "button" : "submit"}
                  onClick={activeStep < 4 ? goToNextStep : undefined}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-[8px] bg-[#F4B400] px-6 text-[0.9rem] font-bold !text-[#071A44] shadow-[0_12px_22px_rgba(244,180,0,0.22)] transition hover:bg-[#0F1B25] hover:!text-white sm:min-w-[140px]"
                >
                  {activeStep < 4 ? "Next" : isJuniorLevel ? "View Results" : "Calculate"}
                  <ArrowRight className="size-4" />
                </button>
              </div>
              )}
            </form>
          </div>
        </section>
          </div>
        </div>
      </div>
      </main>
    </>
  );
}

function FieldShell({
  children,
  icon: Icon,
  label,
  fieldId,
  invalid = false,
  valid = false,
  error,
}: {
  children: ReactNode;
  icon: typeof User;
  label: string;
  fieldId?: string;
  invalid?: boolean;
  valid?: boolean;
  error?: string;
}) {
  return (
    <div
      data-field-id={fieldId}
      className="block"
    >
      <div className={`mb-2.5 text-[16px] font-semibold leading-5 ${invalid ? "text-[#d92d20]" : "text-[#0F1B25]"}`}>{label}</div>
      <div
        className={`grid min-h-[54px] grid-cols-[38px_minmax(0,1fr)_auto] items-center gap-3 rounded-[6px] border bg-white px-3.5 shadow-[0_5px_14px_rgba(15,27,37,0.04)] transition ${
          invalid
            ? "border-[#ff4d5e] shadow-[0_8px_20px_rgba(255,77,94,0.14)]"
            : "border-[#DDE2E7] hover:border-[#AEB7C2]"
        }`}
      >
        <div
          className={`flex size-7.5 items-center justify-center rounded-[9px] border shadow-[0_3px_8px_rgba(15,27,37,0.04)] ${
            invalid ? "border-[#ffd0d5] bg-[#fff1f3] text-[#ff4d5e]" : "border-[#E6EAF0] bg-[#F8F9FB] text-[#0F1B25]"
          }`}
        >
          <Icon className="size-4.5 stroke-[2.2]" />
        </div>
        <div className="min-w-0">{children}</div>
        {invalid ? (
          <div className="flex items-center justify-center">
            <CircleAlert className="size-5 text-[#ff4d5e]" strokeWidth={2.2} />
          </div>
        ) : valid ? (
          <div className="flex items-center justify-center">
            <Check className="size-5 text-[#0b7a25]" strokeWidth={3} />
          </div>
        ) : null}
      </div>
      {error ? (
        <div className="mt-2 flex items-center gap-2 text-[0.9rem] font-medium text-[#ff4d5e]">
          <CircleAlert className="size-5 shrink-0" strokeWidth={2.2} />
          <span>{error}</span>
        </div>
      ) : null}
    </div>
  );
}

function AcademicShell({
  children,
  icon: Icon,
  label,
  hint,
  fieldId,
  invalid = false,
  valid = false,
  error,
}: {
  children: ReactNode;
  icon: typeof User;
  label: string;
  hint?: string;
  fieldId?: string;
  invalid?: boolean;
  valid?: boolean;
  error?: string;
}) {
  return (
    <div
      data-field-id={fieldId}
      className="block"
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className={`text-[16px] font-semibold leading-5 ${invalid ? "text-[#d92d20]" : "text-[#0F1B25]"}`}>{label}</div>
        {hint ? (
          <div
            className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${
              invalid ? "bg-[#fff1f3] text-[#ff4d5e]" : "bg-[#F8F9FB] text-[#5F6B76]"
            }`}
          >
            {hint}
          </div>
        ) : null}
      </div>
      <div
        className={`grid min-h-[54px] grid-cols-[38px_minmax(0,1fr)_auto] items-center gap-3 rounded-[6px] border bg-white px-3.5 shadow-[0_5px_14px_rgba(15,27,37,0.04)] transition ${
          invalid
            ? "border-[#ff4d5e] shadow-[0_8px_20px_rgba(255,77,94,0.14)]"
            : "border-[#DDE2E7] hover:border-[#AEB7C2]"
        }`}
      >
        <div
          className={`flex size-7.5 items-center justify-center rounded-[9px] border shadow-[0_3px_8px_rgba(15,27,37,0.04)] ${
            invalid ? "border-[#ffd0d5] bg-[#fff1f3] text-[#ff4d5e]" : "border-[#E6EAF0] bg-[#F8F9FB] text-[#0F1B25]"
          }`}
        >
          <Icon className="size-4.5 stroke-[2.2]" />
        </div>
        <div className="min-w-0">{children}</div>
        <div className="flex items-center justify-center">
          {invalid ? <CircleAlert className="size-5 text-[#ff4d5e]" strokeWidth={2.2} /> : valid ? <Check className="size-5 text-[#0b7a25]" strokeWidth={3} /> : null}
        </div>
      </div>
      {error ? (
        <div className="mt-1.5 flex items-center gap-1.5 text-[0.82rem] font-medium text-[#ff4d5e]">
          <CircleAlert className="size-5 shrink-0" strokeWidth={2.2} />
          <span>{error}</span>
        </div>
      ) : null}
    </div>
  );
}

function ScoreHighlight({
  title,
  formula,
  primaryLabel,
  primaryValue,
  secondaryLabel,
  secondaryValue,
}: {
  title: string;
  formula: string;
  primaryLabel: string;
  primaryValue: string;
  secondaryLabel?: string;
  secondaryValue?: string;
}) {
  return (
    <div className="rounded-[18px] border border-[#d8dff2] bg-[linear-gradient(135deg,#f8faff_0%,#f3f6ff_55%,#eef2ff_100%)] px-4 py-2.5 shadow-[0_12px_22px_rgba(20,42,99,0.08)]">
      <div className="flex items-center gap-2 text-[#142a63]">
        <div className="flex size-8 items-center justify-center rounded-full border border-[#d7dff5] bg-white text-[#142a63] shadow-[0_6px_16px_rgba(20,42,99,0.08)]">
          <Calculator className="size-4" />
        </div>
        <span className="text-[0.84rem] font-semibold uppercase tracking-[0.18em]">{title}</span>
      </div>
      <p className="mt-1.5 text-[0.84rem] text-[#4f5f89]">{formula}</p>
      <div className="mt-2 grid gap-2 rounded-[14px] border border-[#d8dff2] bg-white/90 px-3 py-2 shadow-[inset_0_0_0_1px_rgba(216,223,242,0.7)] md:grid-cols-2">
        <div className="min-w-0">
          <div className="text-[0.76rem] font-semibold uppercase tracking-[0.14em] text-[#142a63]">{primaryLabel}</div>
          <div className="mt-1 text-[1.28rem] font-bold tracking-[-0.04em] text-[#142a63]">{primaryValue}</div>
        </div>
        {secondaryLabel && secondaryValue ? (
          <div className="min-w-0 border-t border-[#d8dff2] pt-2 md:border-l md:border-t-0 md:pl-3 md:pt-0">
            <div className="text-[0.76rem] font-semibold uppercase tracking-[0.14em] text-[#142a63]">{secondaryLabel}</div>
            <div className="mt-1 text-[1rem] font-semibold text-[#142a63]">{secondaryValue}</div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

const inputClassName =
  "h-full min-h-[50px] w-full border-0 bg-transparent p-0 text-[15px] font-normal text-[#0F1B25] outline-none placeholder:text-[#8A949F]";
const academicInputClassName =
  "h-full min-h-[50px] w-full border-0 bg-transparent p-0 text-[15px] font-normal text-[#0F1B25] outline-none transition placeholder:text-[#8A949F]";
const getInputClassName = (baseClassName: string, invalid: boolean) =>
  `${baseClassName}${invalid ? " text-[#d92d20] placeholder:text-[#f97066]" : ""}`;



