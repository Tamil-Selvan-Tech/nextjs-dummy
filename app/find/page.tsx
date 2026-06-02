"use client";
import { useSearchParams } from "next/navigation";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  CircleAlert,
  BarChart3,
  BookOpen,
  Building2,
  Calculator,
  FlaskConical,
  MapPin,
  Phone,
  Search,
  School,
  User,
  Users,
  X,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { CutoffClient } from "@/app/cutoff/cutoff-client";
import { fetchPublicPanelData } from "@/lib/public-data";
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
};

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
// Cutoff form page: collects student details, academic inputs, and sends the computed cutoff to /cutoff.
export default function FindPage() {
  const searchParams = useSearchParams();
  const hasHydratedPersistedForm = useRef(false);
  const inlineMatchResultsRef = useRef<HTMLDivElement | null>(null);
  const [colleges, setColleges] = useState<College[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [inlineMatchQueryString, setInlineMatchQueryString] = useState("");
  const [selectedState, setSelectedState] = useState("Tamil Nadu");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [hasCalculatedPreview, setHasCalculatedPreview] = useState(false);
  const [showValidationPopup, setShowValidationPopup] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [selectedLevel] = useState("12");
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

  useEffect(() => {
    let isMounted = true;

    fetchPublicPanelData().then((panelData) => {
      if (!isMounted) return;
      setColleges(panelData.colleges);
      setCourses(panelData.courses);
    });

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
      setSelectedState(String(savedState.selectedState || "Tamil Nadu"));
      setName(String(savedState.name || ""));
      setPhone(String(savedState.phone || ""));
      setTouchedFields(
        savedState.touchedFields && typeof savedState.touchedFields === "object"
          ? savedState.touchedFields
          : {},
      );
      setSelectedCategory(String(savedState.selectedCategory || ""));
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
    } catch {
      window.sessionStorage.removeItem(FIND_FORM_STORAGE_KEY);
    } finally {
      hasHydratedPersistedForm.current = true;
    }
  }, []);

  useEffect(() => {
    const hasQueryState = [
      "name",
      "phone",
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

    if (!hasQueryState) return;

    setSelectedState(searchParams.get("state") || "Tamil Nadu");
    setName(searchParams.get("name") || "");
    setPhone(searchParams.get("phone") || "");
    setHasSubmitted(false);
    setHasCalculatedPreview(false);
    setShowValidationPopup(false);
    setTouchedFields({});
    setSelectedCategory(searchParams.get("category") || "");
    setSelectedDreamCollege(searchParams.get("dreamCollege") || "");
    setTargetCollegeSearch("");
    setSelectedDegree(searchParams.get("degree") || "");
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

    if (searchParams.get("cutoff")) {
      setInlineMatchQueryString(searchParams.toString());
    }
  }, [searchParams]);

  const persistedFindFormState = useMemo<PersistedFindFormState>(
    () => ({
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
    }),
    [
      agricultureBiologyMarks,
      agricultureChemistryMarks,
      agriculturePhysicsMarks,
      artsScienceCuetMarks,
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
      selectedAdmissionType,
      selectedCategory,
      selectedCourse,
      selectedDegree,
      selectedDreamCollege,
      selectedState,
      targetCollegeSearch,
      touchedFields,
    ],
  );

  useEffect(() => {
    if (!hasHydratedPersistedForm.current || typeof window === "undefined") return;

    window.sessionStorage.setItem(FIND_FORM_STORAGE_KEY, JSON.stringify(persistedFindFormState));
  }, [persistedFindFormState]);

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
    setSelectedDreamCollege(matchedCollege?.id || "");
  };

  const validationErrors = useMemo(() => {
    const errors: Record<string, string> = {};

    if (isBlank(name)) errors.name = "This field is required";
    if (isBlank(phone)) {
      errors.phone = "This field is required";
    } else if (phone.length !== 10) {
      errors.phone = "Enter a valid 10 digit mobile number";
    }
    if (showCategoryField && isBlank(selectedCategory)) errors.category = "This field is required";
    if (isBlank(selectedDegree)) errors.degree = "This field is required";

    if (showEngineeringFields || showMedicalFields || showLawFields || showArtsScienceFields) {
      if (isBlank(selectedCourse)) errors.course = "This field is required";
    }

    if (showEngineeringFields) {
      if (isBlank(selectedAdmissionType)) {
        errors.admissionType = "This field is required";
      } else if (showEngineeringPcmFields) {
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

    if (showLawFields && isBlank(selectedAdmissionType)) {
      errors.admissionType = "This field is required";
    }

    if (showLawClatFields && isBlank(clatMarks)) {
      errors.clat = "This field is required";
    }

    if (showLawMarksFields) {
      if (isBlank(lawBestSubjectOne)) errors.bestSubject1 = "This field is required";
      if (isBlank(lawBestSubjectTwo)) errors.bestSubject2 = "This field is required";
      if (isBlank(lawBestSubjectThree)) errors.bestSubject3 = "This field is required";
    }

    if (showArtsScienceAdmissionTypeField && isBlank(selectedAdmissionType)) {
      errors.admissionType = "This field is required";
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
    selectedAdmissionType,
    selectedCategory,
    selectedCourse,
    selectedDegree,
    showCategoryField,
    showAgricultureFields,
    showBArchFields,
    showBArchNataField,
    showEngineeringFields,
    showEngineeringJeeAdvancedFields,
    showEngineeringPcmFields,
    showArtsScienceAdmissionTypeField,
    showArtsScienceBoardMarksField,
    showArtsScienceCuetField,
    showArtsScienceFields,
    showLawClatFields,
    showLawFields,
    showLawMarksFields,
    showMedicalFields,
    showParamedicalFields,
  ]);

  const validationErrorCount = Object.keys(validationErrors).length;
  const hasValidationErrors = validationErrorCount > 0;
  const clearSubmittedValidation = () => {
    if (hasSubmitted) setHasSubmitted(false);
    if (hasCalculatedPreview) setHasCalculatedPreview(false);
    if (showValidationPopup) setShowValidationPopup(false);
    if (inlineMatchQueryString) setInlineMatchQueryString("");
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

  return (
    <main className="min-h-screen overflow-x-hidden bg-[linear-gradient(180deg,#eef2fb_0%,#f7f9ff_52%,#fbfcff_100%)] text-slate-900">
      <Navbar />
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
      <div className="px-3 pb-6 pt-4 sm:px-5 md:px-7">
        <div className="mx-auto w-full max-w-[1280px]">
          <div className="rounded-[16px] bg-[#142a63] px-6 py-3 text-center shadow-[0_18px_34px_rgba(20,42,99,0.22)]">
            <h1 className="text-[1.35rem] font-bold tracking-[-0.04em] text-white sm:text-[1.6rem]">
              Cutoff Calculator
            </h1>
          </div>

          <section className="mt-4 w-full rounded-[18px] border border-[#d8dff2] bg-white px-5 py-5 shadow-[0_14px_30px_rgba(20,42,99,0.1)] sm:px-6 md:px-7 md:py-6">
            <div className="flex flex-col gap-4">
            <form
              noValidate
              onInputCapture={clearSubmittedValidation}
              onChangeCapture={clearSubmittedValidation}
              onSubmit={(event) => {
                event.preventDefault();
                setHasSubmitted(true);
                if (hasValidationErrors) {
                  setHasCalculatedPreview(false);
                  setShowValidationPopup(true);
                  scrollToFirstInvalidField();
                  return;
                }
                setShowValidationPopup(false);
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
                if (selectedCategory) params.set("category", selectedCategory);
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
                setInlineMatchQueryString(params.toString());
              }}
              className="p-0"
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
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

                <FieldShell fieldId="name" icon={User} label="Full Name" invalid={Boolean(hasSubmitted && validationErrors.name)} error={hasSubmitted ? validationErrors.name : undefined}>
                  <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Enter your full name"
                    className={getInputClassName(inputClassName, Boolean(hasSubmitted && validationErrors.name))}
                    aria-invalid={Boolean(hasSubmitted && validationErrors.name)}
                    required
                  />
                </FieldShell>

                <FieldShell fieldId="phone" icon={Phone} label="Phone Number" invalid={Boolean(hasSubmitted && validationErrors.phone)} error={hasSubmitted ? validationErrors.phone : undefined}>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="Enter 10 digit mobile number"
                    className={getInputClassName(inputClassName, Boolean(hasSubmitted && validationErrors.phone))}
                    aria-invalid={Boolean(hasSubmitted && validationErrors.phone)}
                    inputMode="numeric"
                    pattern="[0-9]{10}"
                    maxLength={10}
                    minLength={10}
                    required
                  />
                </FieldShell>

                {showCategoryField ? (
                  <FieldShell fieldId="category" icon={Users} label="Category" invalid={Boolean(hasSubmitted && validationErrors.category)} error={hasSubmitted ? validationErrors.category : undefined}>
                    <select
                      value={selectedCategory}
                      onChange={(event) => setSelectedCategory(event.target.value)}
                      className={getSelectClassName(inputClassName, Boolean(hasSubmitted && validationErrors.category))}
                      aria-invalid={Boolean(hasSubmitted && validationErrors.category)}
                      required
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

                <div>
                  <FieldShell fieldId="degree" icon={School} label="Select Degree" invalid={Boolean(hasSubmitted && validationErrors.degree)} error={hasSubmitted ? validationErrors.degree : undefined}>
                    <select
                      value={selectedDegree}
                      onChange={(event) => {
                        setSelectedDegree(event.target.value);
                        setSelectedDreamCollege("");
                        setTargetCollegeSearch("");
                        resetAcademicFields();
                      }}
                      className={getSelectClassName(inputClassName, Boolean(hasSubmitted && validationErrors.degree))}
                      aria-invalid={Boolean(hasSubmitted && validationErrors.degree)}
                      required
                    >
                      <option value="">Choose your preferred degree</option>
                      {degreeOptions.map((degree) => (
                        <option key={degree} value={degree}>
                          {degree}
                        </option>
                      ))}
                    </select>
                  </FieldShell>
                </div>

 {showDreamCollegeField ? (
                  <FieldShell icon={Building2} label="Select Your Target College">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-0 top-1/2 size-4 -translate-y-1/2 text-[#7a87ad]" />
                      <input
                      type="search"
                      value={targetCollegeSearch}
                      onChange={(event) => selectTargetCollegeByName(event.target.value)}
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
                      {filteredDreamCollegeOptions.map((college) => (
                        <option key={college.id} value={college.name}>
                          {college.city || college.district || college.state}
                        </option>
                      ))}
                    </datalist>
                  </FieldShell>
                ) : null}

                {showEngineeringFields || showMedicalFields || showLawFields || showArtsScienceFields ? (
                  <AcademicShell fieldId="course" icon={BookOpen} label="Select Course" invalid={Boolean(hasSubmitted && validationErrors.course)} error={hasSubmitted ? validationErrors.course : undefined}>
                    <select
                      value={selectedCourse}
                      onChange={(event) => {
                        setSelectedCourse(event.target.value);
                      }}
                      className={getSelectClassName(academicInputClassName, Boolean(hasSubmitted && validationErrors.course))}
                      aria-invalid={Boolean(hasSubmitted && validationErrors.course)}
                      required={showEngineeringFields || showMedicalFields || showLawFields || showArtsScienceFields}
                    >
                      <option value="">Choose course</option>
                      {(
                        showMedicalFields
                          ? medicalCourseOptions
                          : showArtsScienceFields
                            ? artsScienceCourseOptions
                          : showLawFields
                            ? lawCourseOptions
                            : engineeringCourseOptions
                      ).map((course) => (
                        <option key={course} value={course}>
                          {course}
                        </option>
                      ))}
                    </select>
                  </AcademicShell>
                ) : null}

                {showEngineeringFields ? (
                  <AcademicShell fieldId="admissionType" icon={BarChart3} label="Admission Type" invalid={Boolean(hasSubmitted && validationErrors.admissionType)} error={hasSubmitted ? validationErrors.admissionType : undefined}>
                    <select
                      value={selectedAdmissionType}
                      onChange={(event) => {
                        setSelectedAdmissionType(event.target.value);
                        setPhysicsMarks("");
                        setChemistryMarks("");
                        setMathsMarks("");
                        setEngineeringEntranceMarks("");
                      }}
                      className={getSelectClassName(academicInputClassName, Boolean(hasSubmitted && validationErrors.admissionType))}
                      aria-invalid={Boolean(hasSubmitted && validationErrors.admissionType)}
                      required={showEngineeringFields}
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

                {showMedicalFields ? (
                  <AcademicShell fieldId="neet" icon={Calculator} label="NEET Mark" hint="Out of 720" invalid={Boolean((hasSubmitted || touchedFields.neet) && validationErrors.neet)} valid={Boolean(touchedFields.neet && !validationErrors.neet && neetMarks.trim())} error={hasSubmitted || touchedFields.neet ? validationErrors.neet : undefined}>
                    <input
                      type="number"
                      min="0"
                      max="720"
                      step="0.01"
                      value={neetMarks}
                      onChange={(event) => setNeetMarks(getNonNegativeNumberValue(event.target.value))}
                      onBlur={() => markFieldTouched("neet")}
                      placeholder="Enter your NEET mark"
                      className={getInputClassName(academicInputClassName, Boolean((hasSubmitted || touchedFields.neet) && validationErrors.neet))}
                      aria-invalid={Boolean((hasSubmitted || touchedFields.neet) && validationErrors.neet)}
                      required={showMedicalFields}
                    />
                  </AcademicShell>
                ) : null}

                {showLawFields ? (
                  <AcademicShell fieldId="admissionType" icon={BarChart3} label="Admission Type" invalid={Boolean(hasSubmitted && validationErrors.admissionType)} error={hasSubmitted ? validationErrors.admissionType : undefined}>
                    <select
                      value={selectedAdmissionType}
                      onChange={(event) => {
                        setSelectedAdmissionType(event.target.value);
                        setClatMarks("");
                        setLawBestSubjectOne("");
                        setLawBestSubjectTwo("");
                        setLawBestSubjectThree("");
                      }}
                      className={getSelectClassName(academicInputClassName, Boolean(hasSubmitted && validationErrors.admissionType))}
                      aria-invalid={Boolean(hasSubmitted && validationErrors.admissionType)}
                      required={showLawFields}
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

                {showArtsScienceAdmissionTypeField ? (
                  <AcademicShell fieldId="admissionType" icon={BarChart3} label="Admission Type" invalid={Boolean(hasSubmitted && validationErrors.admissionType)} error={hasSubmitted ? validationErrors.admissionType : undefined}>
                    <select
                      value={selectedAdmissionType}
                      onChange={(event) => {
                        setSelectedAdmissionType(event.target.value);
                        setArtsScienceCuetMarks("");
                        setBoardMarksTotal("");
                      }}
                      className={getSelectClassName(academicInputClassName, Boolean(hasSubmitted && validationErrors.admissionType))}
                      aria-invalid={Boolean(hasSubmitted && validationErrors.admissionType)}
                      required={showArtsScienceAdmissionTypeField}
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

              {showEngineeringFields ? (
                <div className="mt-4 space-y-2.5">
                  {showEngineeringPcmFields ? (
                    <>
                      <div className="grid gap-3 md:grid-cols-3">
                        <AcademicShell fieldId="physics" icon={FlaskConical} label="Physics" hint="Out of 100" invalid={Boolean((hasSubmitted || touchedFields.physics) && validationErrors.physics)} valid={Boolean(touchedFields.physics && !validationErrors.physics && physicsMarks.trim())} error={hasSubmitted || touchedFields.physics ? validationErrors.physics : undefined}>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={physicsMarks}
                            onChange={(event) => setPhysicsMarks(getNonNegativeNumberValue(event.target.value))}
                            onBlur={() => markFieldTouched("physics")}
                            placeholder="Enter your marks"
                            className={getInputClassName(academicInputClassName, Boolean((hasSubmitted || touchedFields.physics) && validationErrors.physics))}
                            aria-invalid={Boolean((hasSubmitted || touchedFields.physics) && validationErrors.physics)}
                            required={showEngineeringPcmFields}
                          />
                        </AcademicShell>

                        <AcademicShell fieldId="chemistry" icon={FlaskConical} label="Chemistry" hint="Out of 100" invalid={Boolean((hasSubmitted || touchedFields.chemistry) && validationErrors.chemistry)} valid={Boolean(touchedFields.chemistry && !validationErrors.chemistry && chemistryMarks.trim())} error={hasSubmitted || touchedFields.chemistry ? validationErrors.chemistry : undefined}>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={chemistryMarks}
                            onChange={(event) => setChemistryMarks(getNonNegativeNumberValue(event.target.value))}
                            onBlur={() => markFieldTouched("chemistry")}
                            placeholder="Enter your marks"
                            className={getInputClassName(academicInputClassName, Boolean((hasSubmitted || touchedFields.chemistry) && validationErrors.chemistry))}
                            aria-invalid={Boolean((hasSubmitted || touchedFields.chemistry) && validationErrors.chemistry)}
                            required={showEngineeringPcmFields}
                          />
                        </AcademicShell>

                        <AcademicShell fieldId="maths" icon={Calculator} label="Maths" hint="Out of 100" invalid={Boolean((hasSubmitted || touchedFields.maths) && validationErrors.maths)} valid={Boolean(touchedFields.maths && !validationErrors.maths && mathsMarks.trim())} error={hasSubmitted || touchedFields.maths ? validationErrors.maths : undefined}>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={mathsMarks}
                            onChange={(event) => setMathsMarks(getNonNegativeNumberValue(event.target.value))}
                            onBlur={() => markFieldTouched("maths")}
                            placeholder="Enter your marks"
                            className={getInputClassName(academicInputClassName, Boolean((hasSubmitted || touchedFields.maths) && validationErrors.maths))}
                            aria-invalid={Boolean((hasSubmitted || touchedFields.maths) && validationErrors.maths)}
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
                      <AcademicShell fieldId="engineeringEntranceMarks" icon={Calculator} label="JEE Main Mark" hint="Out of 300" invalid={Boolean((hasSubmitted || touchedFields.engineeringEntranceMarks) && validationErrors.engineeringEntranceMarks)} valid={Boolean(touchedFields.engineeringEntranceMarks && !validationErrors.engineeringEntranceMarks && engineeringEntranceMarks.trim())} error={hasSubmitted || touchedFields.engineeringEntranceMarks ? validationErrors.engineeringEntranceMarks : undefined}>
                          <input
                            type="number"
                            min="0"
                            max="300"
                            step="0.01"
                            value={engineeringEntranceMarks}
                            onChange={(event) => setEngineeringEntranceMarks(getNonNegativeNumberValue(event.target.value))}
                            onBlur={() => markFieldTouched("engineeringEntranceMarks")}
                            placeholder="Enter your JEE Main mark"
                            className={getInputClassName(academicInputClassName, Boolean((hasSubmitted || touchedFields.engineeringEntranceMarks) && validationErrors.engineeringEntranceMarks))}
                            aria-invalid={Boolean((hasSubmitted || touchedFields.engineeringEntranceMarks) && validationErrors.engineeringEntranceMarks)}
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
                      <AcademicShell fieldId="engineeringEntranceMarks" icon={Calculator} label="JEE Advanced Mark" hint="Out of 360" invalid={Boolean((hasSubmitted || touchedFields.engineeringEntranceMarks) && validationErrors.engineeringEntranceMarks)} valid={Boolean(touchedFields.engineeringEntranceMarks && !validationErrors.engineeringEntranceMarks && engineeringEntranceMarks.trim())} error={hasSubmitted || touchedFields.engineeringEntranceMarks ? validationErrors.engineeringEntranceMarks : undefined}>
                          <input
                            type="number"
                            min="0"
                            max="360"
                            step="0.01"
                            value={engineeringEntranceMarks}
                            onChange={(event) => setEngineeringEntranceMarks(getNonNegativeNumberValue(event.target.value))}
                            onBlur={() => markFieldTouched("engineeringEntranceMarks")}
                            placeholder="Enter your JEE Advanced mark"
                            className={getInputClassName(academicInputClassName, Boolean((hasSubmitted || touchedFields.engineeringEntranceMarks) && validationErrors.engineeringEntranceMarks))}
                            aria-invalid={Boolean((hasSubmitted || touchedFields.engineeringEntranceMarks) && validationErrors.engineeringEntranceMarks)}
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

              {showMedicalFields ? (
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

              {showBArchFields ? (
                <div className="mt-4 space-y-3">
                  <div className="grid gap-3 md:grid-cols-2">
                    <AcademicShell fieldId="boardTotal" icon={BookOpen} label="11th / 12th Marks (Out of 600)" invalid={Boolean((hasSubmitted || touchedFields.boardTotal) && validationErrors.boardTotal)} valid={Boolean(touchedFields.boardTotal && !validationErrors.boardTotal && boardMarksTotal.trim())} error={hasSubmitted || touchedFields.boardTotal ? validationErrors.boardTotal : undefined}>
                      <input
                        type="number"
                        min="0"
                        max="600"
                        step="0.01"
                        value={boardMarksTotal}
                        onChange={(event) => setBoardMarksTotal(getNonNegativeNumberValue(event.target.value))}
                        onBlur={() => markFieldTouched("boardTotal")}
                        placeholder="Enter your 11th/12th total"
                        className={getInputClassName(academicInputClassName, Boolean((hasSubmitted || touchedFields.boardTotal) && validationErrors.boardTotal))}
                        aria-invalid={Boolean((hasSubmitted || touchedFields.boardTotal) && validationErrors.boardTotal)}
                        required={showBArchFields}
                      />
                    </AcademicShell>

                    {showBArchNataField ? (
                      <AcademicShell fieldId="nata" icon={Calculator} label="NATA Score (Out of 200)" invalid={Boolean((hasSubmitted || touchedFields.nata) && validationErrors.nata)} valid={Boolean(touchedFields.nata && !validationErrors.nata && nataScore.trim())} error={hasSubmitted || touchedFields.nata ? validationErrors.nata : undefined}>
                        <input
                          type="number"
                          min="0"
                          max="200"
                          step="0.01"
                          value={nataScore}
                          onChange={(event) => setNataScore(getNonNegativeNumberValue(event.target.value))}
                          onBlur={() => markFieldTouched("nata")}
                          placeholder="Enter your NATA score"
                          className={getInputClassName(academicInputClassName, Boolean((hasSubmitted || touchedFields.nata) && validationErrors.nata))}
                          aria-invalid={Boolean((hasSubmitted || touchedFields.nata) && validationErrors.nata)}
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

              {showLawFields ? (
                <div className="mt-4 space-y-3">
                  <div className="grid gap-3 md:grid-cols-2">
                    {showLawClatFields ? (
                      <AcademicShell fieldId="clat" icon={Calculator} label="CLAT Mark" hint="Out of 120" invalid={Boolean((hasSubmitted || touchedFields.clat) && validationErrors.clat)} valid={Boolean(touchedFields.clat && !validationErrors.clat && clatMarks.trim())} error={hasSubmitted || touchedFields.clat ? validationErrors.clat : undefined}>
                        <input
                          type="number"
                          min="0"
                          max="120"
                          step="0.01"
                          value={clatMarks}
                          onChange={(event) => setClatMarks(getNonNegativeNumberValue(event.target.value))}
                          onBlur={() => markFieldTouched("clat")}
                          placeholder="Enter your CLAT mark"
                          className={getInputClassName(academicInputClassName, Boolean((hasSubmitted || touchedFields.clat) && validationErrors.clat))}
                          aria-invalid={Boolean((hasSubmitted || touchedFields.clat) && validationErrors.clat)}
                          required={showLawClatFields}
                        />
                      </AcademicShell>
                    ) : null}
                  </div>

                  {showLawMarksFields ? (
                    <div className="space-y-3">
                      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        <AcademicShell fieldId="bestSubject1" icon={BookOpen} label="Best Subject 1" hint="Eg: Tamil | Out of 100" invalid={Boolean((hasSubmitted || touchedFields.bestSubject1) && validationErrors.bestSubject1)} valid={Boolean(touchedFields.bestSubject1 && !validationErrors.bestSubject1 && lawBestSubjectOne.trim())} error={hasSubmitted || touchedFields.bestSubject1 ? validationErrors.bestSubject1 : undefined}>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={lawBestSubjectOne}
                            onChange={(event) => setLawBestSubjectOne(getNonNegativeNumberValue(event.target.value))}
                            onBlur={() => markFieldTouched("bestSubject1")}
                            placeholder="Enter mark"
                            className={getInputClassName(academicInputClassName, Boolean((hasSubmitted || touchedFields.bestSubject1) && validationErrors.bestSubject1))}
                            aria-invalid={Boolean((hasSubmitted || touchedFields.bestSubject1) && validationErrors.bestSubject1)}
                            required={showLawMarksFields}
                          />
                        </AcademicShell>

                        <AcademicShell fieldId="bestSubject2" icon={BookOpen} label="Best Subject 2" hint="Eg: English | Out of 100" invalid={Boolean((hasSubmitted || touchedFields.bestSubject2) && validationErrors.bestSubject2)} valid={Boolean(touchedFields.bestSubject2 && !validationErrors.bestSubject2 && lawBestSubjectTwo.trim())} error={hasSubmitted || touchedFields.bestSubject2 ? validationErrors.bestSubject2 : undefined}>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={lawBestSubjectTwo}
                            onChange={(event) => setLawBestSubjectTwo(getNonNegativeNumberValue(event.target.value))}
                            onBlur={() => markFieldTouched("bestSubject2")}
                            placeholder="Enter mark"
                            className={getInputClassName(academicInputClassName, Boolean((hasSubmitted || touchedFields.bestSubject2) && validationErrors.bestSubject2))}
                            aria-invalid={Boolean((hasSubmitted || touchedFields.bestSubject2) && validationErrors.bestSubject2)}
                            required={showLawMarksFields}
                          />
                        </AcademicShell>

                        <AcademicShell fieldId="bestSubject3" icon={BookOpen} label="Best Subject 3" hint="Eg: History / Commerce | Out of 100" invalid={Boolean((hasSubmitted || touchedFields.bestSubject3) && validationErrors.bestSubject3)} valid={Boolean(touchedFields.bestSubject3 && !validationErrors.bestSubject3 && lawBestSubjectThree.trim())} error={hasSubmitted || touchedFields.bestSubject3 ? validationErrors.bestSubject3 : undefined}>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={lawBestSubjectThree}
                            onChange={(event) => setLawBestSubjectThree(getNonNegativeNumberValue(event.target.value))}
                            onBlur={() => markFieldTouched("bestSubject3")}
                            placeholder="Enter mark"
                            className={getInputClassName(academicInputClassName, Boolean((hasSubmitted || touchedFields.bestSubject3) && validationErrors.bestSubject3))}
                            aria-invalid={Boolean((hasSubmitted || touchedFields.bestSubject3) && validationErrors.bestSubject3)}
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

              {showArtsScienceFields ? (
                <div className="mt-4 space-y-3">
                  <div className="grid gap-3 md:grid-cols-2">
                    {showArtsScienceCuetField ? (
                      <AcademicShell fieldId="artsScienceCuet" icon={Calculator} label="Enter Cutemark (Out of 600)" invalid={Boolean((hasSubmitted || touchedFields.artsScienceCuet) && validationErrors.artsScienceCuet)} valid={Boolean(touchedFields.artsScienceCuet && !validationErrors.artsScienceCuet && artsScienceCuetMarks.trim())} error={hasSubmitted || touchedFields.artsScienceCuet ? validationErrors.artsScienceCuet : undefined}>
                        <input
                          type="number"
                          min="0"
                          max="600"
                          step="0.01"
                          value={artsScienceCuetMarks}
                          onChange={(event) => setArtsScienceCuetMarks(getNonNegativeNumberValue(event.target.value))}
                          onBlur={() => markFieldTouched("artsScienceCuet")}
                          placeholder="Enter your CUET mark"
                          className={getInputClassName(academicInputClassName, Boolean((hasSubmitted || touchedFields.artsScienceCuet) && validationErrors.artsScienceCuet))}
                          aria-invalid={Boolean((hasSubmitted || touchedFields.artsScienceCuet) && validationErrors.artsScienceCuet)}
                          required={showArtsScienceCuetField}
                        />
                      </AcademicShell>
                    ) : null}

                    {showArtsScienceBoardMarksField ? (
                      <AcademicShell fieldId="boardTotal" icon={BookOpen} label="12th Marks (Out of 600)" invalid={Boolean((hasSubmitted || touchedFields.boardTotal) && validationErrors.boardTotal)} valid={Boolean(touchedFields.boardTotal && !validationErrors.boardTotal && boardMarksTotal.trim())} error={hasSubmitted || touchedFields.boardTotal ? validationErrors.boardTotal : undefined}>
                        <input
                          type="number"
                          min="0"
                          max="600"
                          step="0.01"
                          value={boardMarksTotal}
                          onChange={(event) => setBoardMarksTotal(getNonNegativeNumberValue(event.target.value))}
                          onBlur={() => markFieldTouched("boardTotal")}
                          placeholder="Enter your 12th total"
                          className={getInputClassName(academicInputClassName, Boolean((hasSubmitted || touchedFields.boardTotal) && validationErrors.boardTotal))}
                          aria-invalid={Boolean((hasSubmitted || touchedFields.boardTotal) && validationErrors.boardTotal)}
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

              {showParamedicalFields ? (
                <div className="mt-4 space-y-3">
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    <AcademicShell fieldId="paramedicalBiology" icon={BookOpen} label="Biology" hint="Out of 100" invalid={Boolean((hasSubmitted || touchedFields.paramedicalBiology) && validationErrors.paramedicalBiology)} valid={Boolean(touchedFields.paramedicalBiology && !validationErrors.paramedicalBiology && paramedicalBiologyMarks.trim())} error={hasSubmitted || touchedFields.paramedicalBiology ? validationErrors.paramedicalBiology : undefined}>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={paramedicalBiologyMarks}
                        onChange={(event) => setParamedicalBiologyMarks(getNonNegativeNumberValue(event.target.value))}
                        onBlur={() => markFieldTouched("paramedicalBiology")}
                        placeholder="Enter your marks"
                        className={getInputClassName(academicInputClassName, Boolean((hasSubmitted || touchedFields.paramedicalBiology) && validationErrors.paramedicalBiology))}
                        aria-invalid={Boolean((hasSubmitted || touchedFields.paramedicalBiology) && validationErrors.paramedicalBiology)}
                        required={showParamedicalFields}
                      />
                    </AcademicShell>

                    <AcademicShell fieldId="paramedicalPhysics" icon={FlaskConical} label="Physics" hint="Out of 100" invalid={Boolean((hasSubmitted || touchedFields.paramedicalPhysics) && validationErrors.paramedicalPhysics)} valid={Boolean(touchedFields.paramedicalPhysics && !validationErrors.paramedicalPhysics && paramedicalPhysicsMarks.trim())} error={hasSubmitted || touchedFields.paramedicalPhysics ? validationErrors.paramedicalPhysics : undefined}>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={paramedicalPhysicsMarks}
                        onChange={(event) => setParamedicalPhysicsMarks(getNonNegativeNumberValue(event.target.value))}
                        onBlur={() => markFieldTouched("paramedicalPhysics")}
                        placeholder="Enter your marks"
                        className={getInputClassName(academicInputClassName, Boolean((hasSubmitted || touchedFields.paramedicalPhysics) && validationErrors.paramedicalPhysics))}
                        aria-invalid={Boolean((hasSubmitted || touchedFields.paramedicalPhysics) && validationErrors.paramedicalPhysics)}
                        required={showParamedicalFields}
                      />
                    </AcademicShell>

                    <AcademicShell fieldId="paramedicalChemistry" icon={FlaskConical} label="Chemistry" hint="Out of 100" invalid={Boolean((hasSubmitted || touchedFields.paramedicalChemistry) && validationErrors.paramedicalChemistry)} valid={Boolean(touchedFields.paramedicalChemistry && !validationErrors.paramedicalChemistry && paramedicalChemistryMarks.trim())} error={hasSubmitted || touchedFields.paramedicalChemistry ? validationErrors.paramedicalChemistry : undefined}>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={paramedicalChemistryMarks}
                        onChange={(event) => setParamedicalChemistryMarks(getNonNegativeNumberValue(event.target.value))}
                        onBlur={() => markFieldTouched("paramedicalChemistry")}
                        placeholder="Enter your marks"
                        className={getInputClassName(academicInputClassName, Boolean((hasSubmitted || touchedFields.paramedicalChemistry) && validationErrors.paramedicalChemistry))}
                        aria-invalid={Boolean((hasSubmitted || touchedFields.paramedicalChemistry) && validationErrors.paramedicalChemistry)}
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

              {showAgricultureFields ? (
                <div className="mt-4 space-y-3">
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    <AcademicShell fieldId="agricultureBiology" icon={BookOpen} label="Biology" hint="Out of 100" invalid={Boolean((hasSubmitted || touchedFields.agricultureBiology) && validationErrors.agricultureBiology)} valid={Boolean(touchedFields.agricultureBiology && !validationErrors.agricultureBiology && agricultureBiologyMarks.trim())} error={hasSubmitted || touchedFields.agricultureBiology ? validationErrors.agricultureBiology : undefined}>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={agricultureBiologyMarks}
                        onChange={(event) => setAgricultureBiologyMarks(getNonNegativeNumberValue(event.target.value))}
                        onBlur={() => markFieldTouched("agricultureBiology")}
                        placeholder="Enter your marks"
                        className={getInputClassName(academicInputClassName, Boolean((hasSubmitted || touchedFields.agricultureBiology) && validationErrors.agricultureBiology))}
                        aria-invalid={Boolean((hasSubmitted || touchedFields.agricultureBiology) && validationErrors.agricultureBiology)}
                        required={showAgricultureFields}
                      />
                    </AcademicShell>

                    <AcademicShell fieldId="agriculturePhysics" icon={FlaskConical} label="Physics" hint="Out of 100" invalid={Boolean((hasSubmitted || touchedFields.agriculturePhysics) && validationErrors.agriculturePhysics)} valid={Boolean(touchedFields.agriculturePhysics && !validationErrors.agriculturePhysics && agriculturePhysicsMarks.trim())} error={hasSubmitted || touchedFields.agriculturePhysics ? validationErrors.agriculturePhysics : undefined}>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={agriculturePhysicsMarks}
                        onChange={(event) => setAgriculturePhysicsMarks(getNonNegativeNumberValue(event.target.value))}
                        onBlur={() => markFieldTouched("agriculturePhysics")}
                        placeholder="Enter your marks"
                        className={getInputClassName(academicInputClassName, Boolean((hasSubmitted || touchedFields.agriculturePhysics) && validationErrors.agriculturePhysics))}
                        aria-invalid={Boolean((hasSubmitted || touchedFields.agriculturePhysics) && validationErrors.agriculturePhysics)}
                        required={showAgricultureFields}
                      />
                    </AcademicShell>

                    <AcademicShell fieldId="agricultureChemistry" icon={FlaskConical} label="Chemistry" hint="Out of 100" invalid={Boolean((hasSubmitted || touchedFields.agricultureChemistry) && validationErrors.agricultureChemistry)} valid={Boolean(touchedFields.agricultureChemistry && !validationErrors.agricultureChemistry && agricultureChemistryMarks.trim())} error={hasSubmitted || touchedFields.agricultureChemistry ? validationErrors.agricultureChemistry : undefined}>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={agricultureChemistryMarks}
                        onChange={(event) => setAgricultureChemistryMarks(getNonNegativeNumberValue(event.target.value))}
                        onBlur={() => markFieldTouched("agricultureChemistry")}
                        placeholder="Enter your marks"
                        className={getInputClassName(academicInputClassName, Boolean((hasSubmitted || touchedFields.agricultureChemistry) && validationErrors.agricultureChemistry))}
                        aria-invalid={Boolean((hasSubmitted || touchedFields.agricultureChemistry) && validationErrors.agricultureChemistry)}
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

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  onClick={resetFormFields}
                  className="inline-flex h-11 items-center justify-center rounded-[10px] border border-[#142a63] bg-white px-6 text-[0.95rem] font-semibold text-[#142a63] shadow-[0_10px_18px_rgba(20,42,99,0.08)] transition hover:bg-[#f4f7ff] sm:min-w-[140px]"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-[10px] bg-[#142a63] px-6 text-[0.95rem] font-semibold text-white shadow-[0_12px_22px_rgba(20,42,99,0.2)] transition hover:bg-[#0f1f4a] sm:min-w-[140px]"
                >
                  Calculate
                </button>
              </div>
            </form>
          </div>
        </section>
        {inlineMatchQueryString ? (
          <div ref={inlineMatchResultsRef} className="mt-8 scroll-mt-6 overflow-hidden rounded-[18px]">
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
        </div>
      </div>
    </main>
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
    <label
      data-field-id={fieldId}
      className={`block rounded-[14px] border px-3 py-2 shadow-[0_8px_18px_rgba(20,42,99,0.06)] transition ${
        invalid
          ? "border-[#ff4d5e] bg-white shadow-[0_8px_20px_rgba(255,77,94,0.14)]"
          : "border-[#d8dff2] bg-white hover:border-[#142a63] hover:shadow-[0_12px_22px_rgba(20,42,99,0.1)]"
      }`}
    >
      <div
        className={`grid min-h-[36px] items-center gap-2 ${
          invalid ? "grid-cols-[auto_minmax(0,1fr)_auto]" : "grid-cols-[auto_minmax(0,1fr)]"
        }`}
      >
        <div
          className={`flex size-6.5 items-center justify-center rounded-[9px] border shadow-[inset_0_0_0_1px_rgba(20,42,99,0.08)] ${
            invalid ? "border-[#ffd0d5] bg-[#fff1f3] text-[#ff4d5e]" : "border-[#d7dff5] bg-[#f3f6ff] text-[#142a63]"
          }`}
        >
          <Icon className="size-4 stroke-[2.4]" />
        </div>
        <div className="min-w-0">
          <div className={`mb-0.5 text-[0.82rem] font-semibold ${invalid ? "text-[#d92d20]" : "text-[#142a63]"}`}>{label}</div>
          {children}
        </div>
        {invalid ? (
          <div className="flex items-center justify-center">
            <CircleAlert className="size-6 text-[#ff4d5e]" strokeWidth={2.2} />
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
    </label>
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
    <label
      data-field-id={fieldId}
      className={`block rounded-[14px] border px-3 py-2 shadow-[0_8px_18px_rgba(20,42,99,0.06)] transition ${
        invalid
          ? "border-[#ff4d5e] bg-white shadow-[0_8px_20px_rgba(255,77,94,0.14)]"
          : "border-[#d8dff2] bg-white hover:border-[#142a63] hover:shadow-[0_12px_22px_rgba(20,42,99,0.1)]"
      }`}
    >
      <div className="grid min-h-[36px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2">
        <div
          className={`flex size-6.5 items-center justify-center rounded-[9px] border shadow-[inset_0_0_0_1px_rgba(20,42,99,0.08)] ${
            invalid ? "border-[#ffd0d5] bg-[#fff1f3] text-[#ff4d5e]" : "border-[#d7dff5] bg-[#f3f6ff] text-[#142a63]"
          }`}
        >
          <Icon className="size-4 stroke-[2.3]" />
        </div>
        <div className="min-w-0">
          <div className="mb-0.5 flex flex-wrap items-center gap-1.5">
            <div className={`text-[0.82rem] font-semibold ${invalid ? "text-[#d92d20]" : "text-[#142a63]"}`}>{label}</div>
            {hint ? (
              <div
                className={`inline-flex rounded-full px-1.5 py-0.5 text-[0.58rem] font-semibold tracking-[0.01em] ${
                  invalid ? "bg-[#fff1f3] text-[#ff4d5e]" : "bg-[#eef4ff] text-[#142a63]"
                }`}
              >
                {hint}
              </div>
            ) : null}
          </div>
          {children}
        </div>
        <div className="flex items-center justify-center">
          {invalid ? <CircleAlert className="size-6 text-[#ff4d5e]" strokeWidth={2.2} /> : valid ? <Check className="size-5 text-[#0b7a25]" strokeWidth={3} /> : null}
        </div>
      </div>
      {error ? (
        <div className="mt-1.5 flex items-center gap-1.5 text-[0.82rem] font-medium text-[#ff4d5e]">
          <CircleAlert className="size-5 shrink-0" strokeWidth={2.2} />
          <span>{error}</span>
        </div>
      ) : null}
    </label>
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
  "w-full h-[30px] sm:h-[32px] border-0 bg-transparent p-0 text-[0.86rem] font-medium text-[#142a63] outline-none placeholder:text-[#7a87ad]";
const academicInputClassName =
  "w-full h-[30px] sm:h-[32px] border-0 bg-transparent p-0 text-[0.86rem] font-medium text-[#142a63] outline-none transition placeholder:text-[#7a87ad]";
const getInputClassName = (baseClassName: string, invalid: boolean) =>
  `${baseClassName}${invalid ? " text-[#d92d20] placeholder:text-[#f97066]" : ""}`;
const getSelectClassName = (baseClassName: string, invalid: boolean) =>
  `${baseClassName}${invalid ? " text-[#142a63]" : ""}`;


