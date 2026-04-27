"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { type ReactNode, useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Calculator,
  Clock3,
  FlaskConical,
  GraduationCap,
  Phone,
  School,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  User,
  Users,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { degreeOptions, engineeringCourseOptions, medicalCourseOptions } from "@/lib/site-data";

const levelOptions = [
  { value: "6", label: "6" },
  { value: "7", label: "7" },
  { value: "8", label: "8" },
  { value: "9", label: "9" },
  { value: "10", label: "10" },
  { value: "11", label: "11" },
  { value: "12", label: "12" },
];

const categoryOptions = [
  { value: "OC", label: "OC / General" },
  { value: "BC", label: "BC" },
  { value: "BCM", label: "BCM" },
  { value: "MBC", label: "MBC / DNC" },
  { value: "SC", label: "SC" },
  { value: "SCA", label: "SCA" },
  { value: "ST", label: "ST" },
];

const lawCourseOptions = ["LLB", "BA LLB", "BBA LLB", "LLM"];

const lawAdmissionTypeOptions = [
  { value: "11th/12th Mark", label: "11th/12th Mark" },
  { value: "CLAT", label: "CLAT" },
];

const trustItems = [
  {
    icon: ShieldCheck,
    title: "100% Safe & Secure",
    description: "Your data is protected",
  },
  {
    icon: Clock3,
    title: "Quick & Easy",
    description: "Results in just 2 mins",
  },
  {
    icon: Users,
    title: "Trusted by Students",
    description: "1L+ students already used",
  },
];

type PerformanceMetric = {
  label: string;
  score: number;
  expected: number;
  max: number;
};

type ComparisonPoint = {
  label: string;
  score: number;
  expected: number;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const buildProgressSeries = (score: number, expected: number): ComparisonPoint[] => {
  const milestones = [
    { label: "Start", ratio: 0.25 },
    { label: "Progress", ratio: 0.5 },
    { label: "Competitive", ratio: 0.75 },
    { label: "Target", ratio: 1 },
  ];

  return milestones.map((item) => ({
    label: item.label,
    score: Math.round(score * item.ratio),
    expected: Math.round(expected * item.ratio),
  }));
};

export default function FindPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("11");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDegree, setSelectedDegree] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [physicsMarks, setPhysicsMarks] = useState("");
  const [chemistryMarks, setChemistryMarks] = useState("");
  const [mathsMarks, setMathsMarks] = useState("");
  const [neetMarks, setNeetMarks] = useState("");
  const [boardMarksTotal, setBoardMarksTotal] = useState("");
  const [nataScore, setNataScore] = useState("");
  const [selectedAdmissionType, setSelectedAdmissionType] = useState("");
  const [clatMarks, setClatMarks] = useState("");
  const [lawBestSubjectOne, setLawBestSubjectOne] = useState("");
  const [lawBestSubjectTwo, setLawBestSubjectTwo] = useState("");
  const [lawBestSubjectThree, setLawBestSubjectThree] = useState("");
  const [paramedicalBiologyMarks, setParamedicalBiologyMarks] = useState("");
  const [paramedicalPhysicsMarks, setParamedicalPhysicsMarks] = useState("");
  const [paramedicalChemistryMarks, setParamedicalChemistryMarks] = useState("");
  const [agricultureBiologyMarks, setAgricultureBiologyMarks] = useState("");
  const [agriculturePhysicsMarks, setAgriculturePhysicsMarks] = useState("");
  const [agricultureChemistryMarks, setAgricultureChemistryMarks] = useState("");

  const showEngineeringFields =
    selectedDegree === "Engineering" && (selectedLevel === "11" || selectedLevel === "12");
  const showMedicalFields = selectedDegree === "Medical" && selectedLevel === "12";
  const showBArchFields = selectedDegree === "B.Arch" && (selectedLevel === "11" || selectedLevel === "12");
  const showLawFields = selectedDegree === "Law" && (selectedLevel === "11" || selectedLevel === "12");
  const showParamedicalFields = selectedDegree === "Paramedical" && (selectedLevel === "11" || selectedLevel === "12");
  const showAgricultureFields = selectedDegree === "Agriculture" && (selectedLevel === "11" || selectedLevel === "12");
  const showLawClatFields = showLawFields && selectedAdmissionType === "CLAT";
  const showLawMarksFields = showLawFields && selectedAdmissionType === "11th/12th Mark";

  const resetAcademicFields = () => {
    setSelectedCourse("");
    setPhysicsMarks("");
    setChemistryMarks("");
    setMathsMarks("");
    setNeetMarks("");
    setBoardMarksTotal("");
    setNataScore("");
    setSelectedAdmissionType("");
    setClatMarks("");
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

  const engineeringCutoff = useMemo(() => {
    if (!showEngineeringFields) return "";
    const physics = Number(physicsMarks);
    const chemistry = Number(chemistryMarks);
    const maths = Number(mathsMarks);
    if (!Number.isFinite(physics) || !Number.isFinite(chemistry) || !Number.isFinite(maths)) {
      return "";
    }
    return (maths + physics / 2 + chemistry / 2).toFixed(1);
  }, [chemistryMarks, mathsMarks, physicsMarks, showEngineeringFields]);

  const bArchConvertedScore = useMemo(() => {
    if (!showBArchFields) return "";
    const total = Number(boardMarksTotal);
    if (!Number.isFinite(total)) return "";
    return (total / 3).toFixed(1);
  }, [boardMarksTotal, showBArchFields]);

  const bArchCombinedScore = useMemo(() => {
    if (!showBArchFields) return "";
    const converted = Number(bArchConvertedScore);
    const nata = Number(nataScore);
    if (!Number.isFinite(converted) || !Number.isFinite(nata)) return "";
    return (converted + nata).toFixed(1);
  }, [bArchConvertedScore, nataScore, showBArchFields]);

  const lawBestThreeTotal = useMemo(() => {
    if (!showLawMarksFields) return "";
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

  const finalCutoffValue = useMemo(() => {
    if (showEngineeringFields) return engineeringCutoff;
    if (showMedicalFields) return neetMarks;
    if (showBArchFields) return bArchCombinedScore;
    if (showLawClatFields) return clatMarks;
    if (showLawMarksFields) return lawBestThreeTotal;
    if (showParamedicalFields) return paramedicalCutoff200;
    if (showAgricultureFields) return agricultureCutoff200;
    return "";
  }, [
    agricultureCutoff200,
    bArchCombinedScore,
    clatMarks,
    engineeringCutoff,
    lawBestThreeTotal,
    neetMarks,
    paramedicalCutoff200,
    showAgricultureFields,
    showBArchFields,
    showEngineeringFields,
    showLawClatFields,
    showLawMarksFields,
    showMedicalFields,
    showParamedicalFields,
  ]);

  const chartConfig = useMemo(() => {
    if (showEngineeringFields) {
      return {
        comparisonTitle: "Engineering Cutoff",
        scaleHint: "Cutoff shown out of 200. Subject bars are shown out of 100.",
        expectedCutoff: 175,
        scoreMax: 200,
        subjectMetrics: [
          { label: "Mathematics", score: Number(mathsMarks) || 0, expected: 95, max: 100 },
          { label: "Physics", score: Number(physicsMarks) || 0, expected: 90, max: 100 },
          { label: "Chemistry", score: Number(chemistryMarks) || 0, expected: 90, max: 100 },
        ] as PerformanceMetric[],
      };
    }
    if (showParamedicalFields) {
      return {
        comparisonTitle: "Paramedical Cutoff",
        scaleHint: "Cutoff shown out of 200. Biology, Physics, and Chemistry are shown out of 100.",
        expectedCutoff: 160,
        scoreMax: 200,
        subjectMetrics: [
          { label: "Biology", score: Number(paramedicalBiologyMarks) || 0, expected: 90, max: 100 },
          { label: "Physics", score: Number(paramedicalPhysicsMarks) || 0, expected: 80, max: 100 },
          { label: "Chemistry", score: Number(paramedicalChemistryMarks) || 0, expected: 80, max: 100 },
        ] as PerformanceMetric[],
      };
    }
    if (showAgricultureFields) {
      return {
        comparisonTitle: "Agriculture Cutoff",
        scaleHint: "Cutoff shown out of 200. Biology, Physics, and Chemistry are shown out of 100.",
        expectedCutoff: 155,
        scoreMax: 200,
        subjectMetrics: [
          { label: "Biology", score: Number(agricultureBiologyMarks) || 0, expected: 88, max: 100 },
          { label: "Physics", score: Number(agriculturePhysicsMarks) || 0, expected: 78, max: 100 },
          { label: "Chemistry", score: Number(agricultureChemistryMarks) || 0, expected: 78, max: 100 },
        ] as PerformanceMetric[],
      };
    }
    if (showLawMarksFields) {
      return {
        comparisonTitle: "Best Three Total",
        scaleHint: "Each best-subject mark is shown out of 100. Total cutoff is shown out of 300.",
        expectedCutoff: 225,
        scoreMax: 300,
        subjectMetrics: [
          { label: "Best 1", score: Number(lawBestSubjectOne) || 0, expected: 75, max: 100 },
          { label: "Best 2", score: Number(lawBestSubjectTwo) || 0, expected: 75, max: 100 },
          { label: "Best 3", score: Number(lawBestSubjectThree) || 0, expected: 75, max: 100 },
        ] as PerformanceMetric[],
      };
    }
    if (showLawClatFields) {
      return {
        comparisonTitle: "CLAT Score",
        scaleHint: "CLAT score is shown out of 120.",
        expectedCutoff: 85,
        scoreMax: 120,
        subjectMetrics: [{ label: "CLAT", score: Number(clatMarks) || 0, expected: 85, max: 120 }] as PerformanceMetric[],
      };
    }
    if (showMedicalFields) {
      return {
        comparisonTitle: "NEET Score",
        scaleHint: "NEET score is shown out of 720.",
        expectedCutoff: 540,
        scoreMax: 720,
        subjectMetrics: [{ label: "NEET", score: Number(neetMarks) || 0, expected: 540, max: 720 }] as PerformanceMetric[],
      };
    }
    if (showBArchFields) {
      return {
        comparisonTitle: "B.Arch Combined Score",
        scaleHint: "12th converted score and NATA are shown out of 200 each. Combined cutoff is shown out of 400.",
        expectedCutoff: 255,
        scoreMax: 400,
        subjectMetrics: [
          { label: "12th Conv.", score: Number(bArchConvertedScore) || 0, expected: 140, max: 200 },
          { label: "NATA", score: Number(nataScore) || 0, expected: 115, max: 200 },
        ] as PerformanceMetric[],
      };
    }
    return {
      comparisonTitle: "Target Score",
      scaleHint: "Score is shown on the active cutoff scale.",
      expectedCutoff: 120,
      scoreMax: 200,
      subjectMetrics: [{ label: "Target", score: 0, expected: 120, max: 200 }] as PerformanceMetric[],
    };
  }, [
    agricultureBiologyMarks,
    agricultureChemistryMarks,
    agriculturePhysicsMarks,
    bArchConvertedScore,
    chemistryMarks,
    clatMarks,
    lawBestSubjectOne,
    lawBestSubjectThree,
    lawBestSubjectTwo,
    mathsMarks,
    nataScore,
    neetMarks,
    paramedicalBiologyMarks,
    paramedicalChemistryMarks,
    paramedicalPhysicsMarks,
    physicsMarks,
    showAgricultureFields,
    showBArchFields,
    showEngineeringFields,
    showLawClatFields,
    showLawMarksFields,
    showMedicalFields,
    showParamedicalFields,
  ]);

  const cutoffScaleMax = chartConfig.scoreMax;
  const expectedCutoffValue = chartConfig.expectedCutoff;

  const liveCutoffValue = useMemo(() => {
    const parsed = Number(finalCutoffValue);
    return Number.isFinite(parsed) ? parsed : 0;
  }, [finalCutoffValue]);

  const displayScoreTrend = useMemo(
    () => buildProgressSeries(liveCutoffValue, expectedCutoffValue),
    [expectedCutoffValue, liveCutoffValue],
  );

  const scoreProgress = useMemo(() => {
    if (!cutoffScaleMax) return 0;
    return clamp((liveCutoffValue / cutoffScaleMax) * 100, 0, 100);
  }, [cutoffScaleMax, liveCutoffValue]);

  const normalizedMoodScore = useMemo(() => {
    if (!cutoffScaleMax) return 0;
    return Math.round(clamp((liveCutoffValue / cutoffScaleMax) * 200, 0, 200));
  }, [cutoffScaleMax, liveCutoffValue]);

  const moodOptions = useMemo(() => {
    const excitedMin = Math.ceil(cutoffScaleMax * 0.95);
    const happyMin = Math.ceil(cutoffScaleMax * 0.85);
    const confidentMin = Math.ceil(cutoffScaleMax * 0.75);
    const neutralMin = Math.ceil(cutoffScaleMax * 0.6);

    return [
      {
        label: "Excited",
        emoji: "🤩",
        min: excitedMin,
        max: cutoffScaleMax,
        rangeLabel: `${excitedMin} - ${cutoffScaleMax}`,
        summary: "Outstanding score! You are leading the pack.",
      },
      {
        label: "Happy",
        emoji: "😄",
        min: happyMin,
        max: excitedMin - 1,
        rangeLabel: `${happyMin} - ${excitedMin - 1}`,
        summary: "Great job! You're doing awesome.",
      },
      {
        label: "Confident",
        emoji: "💪",
        min: confidentMin,
        max: happyMin - 1,
        rangeLabel: `${confidentMin} - ${happyMin - 1}`,
        summary: "Good momentum. Keep pushing forward.",
      },
      {
        label: "Neutral",
        emoji: "😐",
        min: neutralMin,
        max: confidentMin - 1,
        rangeLabel: `${neutralMin} - ${confidentMin - 1}`,
        summary: "You're on track. A little more effort will help.",
      },
      {
        label: "Need Help",
        emoji: "☹️",
        min: 0,
        max: neutralMin - 1,
        rangeLabel: `Below ${neutralMin}`,
        summary: "Keep going. Steady practice will improve your score.",
      },
    ];
  }, [cutoffScaleMax]);

  const activeMood = useMemo(() => {
    if (normalizedMoodScore >= 190) return moodOptions.find((item) => item.label === "Excited") ?? moodOptions[0];
    if (normalizedMoodScore >= 170) return moodOptions.find((item) => item.label === "Happy") ?? moodOptions[1];
    if (normalizedMoodScore >= 150) return moodOptions.find((item) => item.label === "Confident") ?? moodOptions[2];
    if (normalizedMoodScore >= 120) return moodOptions.find((item) => item.label === "Neutral") ?? moodOptions[3];
    return moodOptions.find((item) => item.label === "Need Help") ?? moodOptions[moodOptions.length - 1];
  }, [moodOptions, normalizedMoodScore]);

  const scoreFeedback = useMemo(() => {
    if (scoreProgress >= 95) return "Excellent score! You're in a top range.";
    if (scoreProgress >= 85) return "You scored well! Keep it up!";
    if (scoreProgress >= 75) return "Nice work. You're building strong momentum.";
    if (scoreProgress >= 60) return "You're getting closer. Keep improving steadily.";
    return "Keep practicing. You can raise this score.";
  }, [scoreProgress]);

  const moodTip = useMemo(() => {
    if (scoreProgress >= 85) return "Tip: Consistent effort leads to excellent results. Keep learning and stay positive!";
    if (scoreProgress >= 60) return "Tip: You're close to the next band. Daily revision can lift your cutoff quickly.";
    return "Tip: Focus on basics first, practice daily, and your cutoff score will improve step by step.";
  }, [scoreProgress]);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#dfe9ff_0%,#edf3ff_16%,#f7f9ff_100%)] text-slate-900">
      <Navbar />
<div className="px-2 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8">
  <div className="mx-auto grid w-full max-w-[1440px] gap-4 sm:gap-5 md:gap-6 
grid-cols-1 md:grid-cols-2 items-start">
 <section className="w-full order-2 md:order-1 rounded-[24px] border-2 border-[#8db2ff] bg-white/95 
p-3 sm:p-4 md:p-6 xl:p-7">
            <div className="flex flex-col gap-4 sm:gap-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-3 text-[#2d5bff]">
                  <GraduationCap className="size-7 fill-[#2d5bff] stroke-[1.6]" />
                  <span className="text-[1.05rem] font-bold tracking-tight">CUTOFF ZONE</span>
                </div>
                <h1 className="mt-4 max-w-[680px] text-[1.72rem] font-bold leading-tight tracking-[-0.04em] text-[#11275d] sm:text-[1.95rem] md:mt-5 md:text-[2.55rem]">
                  Let&apos;s find the best colleges for you
                </h1>
                <p className="mt-2.5 text-[0.94rem] text-[#4f689b] md:text-[0.98rem]">
                  Enter your details and get{" "}
                  <span className="font-semibold text-[#355cff]">accurate college predictions</span>{" "}
                  in seconds
                </p>
              </div>

              <div className="inline-flex h-12 sm:h-14 w-full items-center justify-center gap-2 self-start rounded-[14px] border-2 border-[#8fd9bc] bg-[#effaf5] px-3.5 py-2 text-[0.82rem] font-semibold text-[#0f7b5c] shadow-[0_10px_24px_rgba(20,138,103,0.08)] sm:w-auto sm:justify-start">
                <ShieldCheck className="size-4" />
                100% Safe &amp; Secure
              </div>
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                const params = new URLSearchParams();
                params.set("name", name);
                params.set("phone", phone);
                params.set("level", selectedLevel);
                params.set("degree", selectedDegree);
                if (selectedCategory) params.set("category", selectedCategory);
                if (selectedCourse) params.set("course", selectedCourse);
                if (selectedAdmissionType) params.set("admissionType", selectedAdmissionType);
                if (physicsMarks) params.set("physics", physicsMarks);
                if (chemistryMarks) params.set("chemistry", chemistryMarks);
                if (mathsMarks) params.set("maths", mathsMarks);
                if (neetMarks) params.set("neet", neetMarks);
                if (boardMarksTotal) params.set("boardTotal", boardMarksTotal);
                if (nataScore) params.set("nata", nataScore);
                if (bArchConvertedScore) params.set("converted12th", bArchConvertedScore);
                if (clatMarks) params.set("clat", clatMarks);
                if (lawBestSubjectOne) params.set("bestSubject1", lawBestSubjectOne);
                if (lawBestSubjectTwo) params.set("bestSubject2", lawBestSubjectTwo);
                if (lawBestSubjectThree) params.set("bestSubject3", lawBestSubjectThree);
                if (paramedicalBiologyMarks) params.set("paramedicalBiology", paramedicalBiologyMarks);
                if (paramedicalPhysicsMarks) params.set("paramedicalPhysics", paramedicalPhysicsMarks);
                if (paramedicalChemistryMarks) params.set("paramedicalChemistry", paramedicalChemistryMarks);
                if (agricultureBiologyMarks) params.set("agricultureBiology", agricultureBiologyMarks);
                if (agriculturePhysicsMarks) params.set("agriculturePhysics", agriculturePhysicsMarks);
                if (agricultureChemistryMarks) params.set("agricultureChemistry", agricultureChemistryMarks);
                if (finalCutoffValue) params.set("cutoff", finalCutoffValue);
                router.push(`/cutoff?${params.toString()}`);
              }}
              className="mt-3 rounded-[22px] border-2 border-[#9ebcff] bg-[linear-gradient(180deg,#ffffff_0%,#fdfefe_100%)] p-3.5 shadow-[0_20px_48px_rgba(89,107,168,0.12)] sm:p-4 md:p-5"
            >
              <div className="mb-6">
                <h2 className="text-[1.55rem] font-bold tracking-[-0.04em] text-[#162b62]">Personal Details</h2>
                <p className="mt-1.5 text-[0.92rem] text-[#4f689b]">Enter your basic information to get started</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FieldShell icon={User} label="Full Name">
                  <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Enter your full name"
                    className={inputClassName}
                    required
                  />
                </FieldShell>

                <FieldShell icon={Phone} label="Phone Number">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="Enter 10 digit mobile number"
                    className={inputClassName}
                    inputMode="numeric"
                    pattern="[0-9]{10}"
                    maxLength={10}
                    minLength={10}
                    required
                  />
                </FieldShell>

                <FieldShell icon={BarChart3} label="Select Level">
                  <select
                    value={selectedLevel}
                    onChange={(event) => {
                      const value = event.target.value;
                      setSelectedLevel(value);
                      if (!["11", "12"].includes(value)) {
                        resetAcademicFields();
                      }
                      if (value !== "12" && selectedDegree === "Medical") {
                        resetAcademicFields();
                      }
                    }}
                    className={inputClassName}
                    required
                  >
                    {levelOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </FieldShell>

                <FieldShell icon={Users} label="Category">
                  <select
                    value={selectedCategory}
                    onChange={(event) => setSelectedCategory(event.target.value)}
                    className={inputClassName}
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

                <div
                  className={
                    showEngineeringFields || showMedicalFields || showLawFields || showParamedicalFields
                      ? ""
                      : "md:col-span-2"
                  }
                >
                  <FieldShell icon={School} label="Select Degree">
                    <select
                      value={selectedDegree}
                      onChange={(event) => {
                        setSelectedDegree(event.target.value);
                        resetAcademicFields();
                      }}
                      className={inputClassName}
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

                {showEngineeringFields || showMedicalFields || showLawFields ? (
                  <AcademicShell icon={BookOpen} label="Select Course">
                    <select
                      value={selectedCourse}
                      onChange={(event) => setSelectedCourse(event.target.value)}
                      className={academicInputClassName}
                      required={showEngineeringFields || showMedicalFields || showLawFields}
                    >
                      <option value="">Choose course</option>
                      {(
                        showMedicalFields
                          ? medicalCourseOptions
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
              </div>

              {showEngineeringFields ? (
                <div className="mt-5 space-y-3.5">
                  <div className="grid gap-3.5 md:grid-cols-2">
                    <AcademicShell icon={FlaskConical} label="Physics">
                      <input
                        type="number"
                        min="0"
                        max="200"
                        step="0.01"
                        value={physicsMarks}
                        onChange={(event) => setPhysicsMarks(event.target.value)}
                        placeholder="Enter your marks"
                        className={academicInputClassName}
                        required={showEngineeringFields}
                      />
                    </AcademicShell>

                    <AcademicShell icon={FlaskConical} label="Chemistry">
                      <input
                        type="number"
                        min="0"
                        max="200"
                        step="0.01"
                        value={chemistryMarks}
                        onChange={(event) => setChemistryMarks(event.target.value)}
                        placeholder="Enter your marks"
                        className={academicInputClassName}
                        required={showEngineeringFields}
                      />
                    </AcademicShell>

                    <AcademicShell icon={Calculator} label="Maths">
                      <input
                        type="number"
                        min="0"
                        max="200"
                        step="0.01"
                        value={mathsMarks}
                        onChange={(event) => setMathsMarks(event.target.value)}
                        placeholder="Enter your marks"
                        className={academicInputClassName}
                        required={showEngineeringFields}
                      />
                    </AcademicShell>
                  </div>

                  <ScoreHighlight
                    title="Engineering Cutoff"
                    formula="Cutoff = Maths + (Physics / 2) + (Chemistry / 2)"
                    primaryLabel="Calculated Cutoff"
                    primaryValue={engineeringCutoff || "0.0"}
                  />
                </div>
              ) : null}

              {showMedicalFields ? (
                <div className="mt-5 space-y-3.5">
                  <div className="grid gap-3.5 md:grid-cols-2">
                    <AcademicShell icon={Calculator} label="NEET Mark">
                      <input
                        type="number"
                        min="0"
                        max="720"
                        step="0.01"
                        value={neetMarks}
                        onChange={(event) => setNeetMarks(event.target.value)}
                        placeholder="Enter your NEET mark"
                        className={academicInputClassName}
                        required={showMedicalFields}
                      />
                    </AcademicShell>
                  </div>

                  <ScoreHighlight
                    title="Medical Cutoff"
                    formula="Medical prediction uses your NEET mark directly"
                    primaryLabel="NEET Mark"
                    primaryValue={`${neetMarks || "0"} / 720`}
                  />
                </div>
              ) : null}

              {showBArchFields ? (
                <div className="mt-5 space-y-3.5">
                  <div className="grid gap-3.5 md:grid-cols-2">
                    <AcademicShell icon={BookOpen} label="11th / 12th Marks (Out of 600)">
                      <input
                        type="number"
                        min="0"
                        max="600"
                        step="0.01"
                        value={boardMarksTotal}
                        onChange={(event) => setBoardMarksTotal(event.target.value)}
                        placeholder="Enter your 11th/12th total"
                        className={academicInputClassName}
                        required={showBArchFields}
                      />
                    </AcademicShell>

                    <AcademicShell icon={Calculator} label="NATA Score (Out of 200)">
                      <input
                        type="number"
                        min="0"
                        max="200"
                        step="0.01"
                        value={nataScore}
                        onChange={(event) => setNataScore(event.target.value)}
                        placeholder="Enter your NATA score"
                        className={academicInputClassName}
                        required={showBArchFields}
                      />
                    </AcademicShell>
                  </div>

                  <ScoreHighlight
                    title="B.Arch Combined Score"
                    formula="12th (out of 600) to (out of 200) + NATA (out of 200)"
                    primaryLabel="Calculated Cutoff"
                    primaryValue={`${bArchCombinedScore || "0.0"} / 400`}
                    secondaryLabel="12th Converted"
                    secondaryValue={`${bArchConvertedScore || "0.0"} / 200`}
                  />
                </div>
              ) : null}

              {showLawFields ? (
                <div className="mt-5 space-y-3.5">
                  <div className="grid gap-3.5 md:grid-cols-2">
                    <AcademicShell icon={BarChart3} label="Admission Type">
                      <select
                        value={selectedAdmissionType}
                        onChange={(event) => {
                          setSelectedAdmissionType(event.target.value);
                          setClatMarks("");
                          setLawBestSubjectOne("");
                          setLawBestSubjectTwo("");
                          setLawBestSubjectThree("");
                        }}
                        className={academicInputClassName}
                        required={showLawFields}
                      >
                        <option value="">Select admission type</option>
                        {lawAdmissionTypeOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </AcademicShell>

                    {showLawClatFields ? (
                      <AcademicShell icon={Calculator} label="Enter your CLAT mark">
                        <input
                          type="number"
                          min="0"
                          max="120"
                          step="0.01"
                          value={clatMarks}
                          onChange={(event) => setClatMarks(event.target.value)}
                          placeholder="Enter your CLAT mark"
                          className={academicInputClassName}
                          required={showLawClatFields}
                        />
                      </AcademicShell>
                    ) : null}
                  </div>

                  {showLawMarksFields ? (
                    <div className="space-y-3.5">
                      <div className="grid gap-3.5 md:grid-cols-2 xl:grid-cols-3">
                        <AcademicShell icon={BookOpen} label="Best Subject 1" hint="Eg: Tamil">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={lawBestSubjectOne}
                            onChange={(event) => setLawBestSubjectOne(event.target.value)}
                            placeholder="Enter mark"
                            className={academicInputClassName}
                            required={showLawMarksFields}
                          />
                        </AcademicShell>

                        <AcademicShell icon={BookOpen} label="Best Subject 2" hint="Eg: English">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={lawBestSubjectTwo}
                            onChange={(event) => setLawBestSubjectTwo(event.target.value)}
                            placeholder="Enter mark"
                            className={academicInputClassName}
                            required={showLawMarksFields}
                          />
                        </AcademicShell>

                        <AcademicShell icon={BookOpen} label="Best Subject 3" hint="Eg: History / Commerce">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={lawBestSubjectThree}
                            onChange={(event) => setLawBestSubjectThree(event.target.value)}
                            placeholder="Enter mark"
                            className={academicInputClassName}
                            required={showLawMarksFields}
                          />
                        </AcademicShell>
                      </div>

                      <ScoreHighlight
                        title="Law Cutoff (Best 3 Subjects)"
                        formula="Total = Best 3 subjects mark sum (out of 300)"
                        primaryLabel="Calculated Total"
                        primaryValue={`${lawBestThreeTotal || "0.0"} / 300`}
                      />
                    </div>
                  ) : null}

                  {showLawClatFields ? (
                    <ScoreHighlight
                      title="Law Cutoff (CLAT)"
                      formula="Law prediction uses your CLAT mark directly"
                      primaryLabel="CLAT Mark"
                      primaryValue={`${clatMarks || "0"} / 120`}
                    />
                  ) : null}
                </div>
              ) : null}

              {showParamedicalFields ? (
                <div className="mt-5 space-y-3.5">
                  <div className="grid gap-3.5 md:grid-cols-2 xl:grid-cols-3">
                    <AcademicShell icon={BookOpen} label="Biology">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={paramedicalBiologyMarks}
                        onChange={(event) => setParamedicalBiologyMarks(event.target.value)}
                        placeholder="Enter your marks"
                        className={academicInputClassName}
                        required={showParamedicalFields}
                      />
                    </AcademicShell>

                    <AcademicShell icon={FlaskConical} label="Physics">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={paramedicalPhysicsMarks}
                        onChange={(event) => setParamedicalPhysicsMarks(event.target.value)}
                        placeholder="Enter your marks"
                        className={academicInputClassName}
                        required={showParamedicalFields}
                      />
                    </AcademicShell>

                    <AcademicShell icon={FlaskConical} label="Chemistry">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={paramedicalChemistryMarks}
                        onChange={(event) => setParamedicalChemistryMarks(event.target.value)}
                        placeholder="Enter your marks"
                        className={academicInputClassName}
                        required={showParamedicalFields}
                      />
                    </AcademicShell>
                  </div>

                  <ScoreHighlight
                    title="Paramedical Cutoff"
                    formula={`Calculation: Biology / 2 + Physics / 4 + Chemistry / 4 = ${paramedicalCutoff100 || "0.00"} / 100`}
                    primaryLabel="Converted Cutoff"
                    primaryValue={`${paramedicalCutoff200 || "0.00"} / 200`}
                    secondaryLabel="Cutoff"
                    secondaryValue={`${paramedicalCutoff100 || "0.00"} / 100`}
                  />
                </div>
              ) : null}

              {showAgricultureFields ? (
                <div className="mt-5 space-y-3.5">
                  <div className="grid gap-3.5 md:grid-cols-2 xl:grid-cols-3">
                    <AcademicShell icon={BookOpen} label="Biology">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={agricultureBiologyMarks}
                        onChange={(event) => setAgricultureBiologyMarks(event.target.value)}
                        placeholder="Enter your marks"
                        className={academicInputClassName}
                        required={showAgricultureFields}
                      />
                    </AcademicShell>

                    <AcademicShell icon={FlaskConical} label="Physics">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={agriculturePhysicsMarks}
                        onChange={(event) => setAgriculturePhysicsMarks(event.target.value)}
                        placeholder="Enter your marks"
                        className={academicInputClassName}
                        required={showAgricultureFields}
                      />
                    </AcademicShell>

                    <AcademicShell icon={FlaskConical} label="Chemistry">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={agricultureChemistryMarks}
                        onChange={(event) => setAgricultureChemistryMarks(event.target.value)}
                        placeholder="Enter your marks"
                        className={academicInputClassName}
                        required={showAgricultureFields}
                      />
                    </AcademicShell>
                  </div>

                  <ScoreHighlight
                    title="Agriculture Cutoff"
                    formula={`Calculation: Biology / 2 + Physics / 4 + Chemistry / 4 = ${agricultureCutoff100 || "0.00"} / 100`}
                    primaryLabel="Converted Cutoff"
                    primaryValue={`${agricultureCutoff200 || "0.00"} / 200`}
                    secondaryLabel="Total Cutoff"
                    secondaryValue={`${agricultureCutoff100 || "0.00"} / 100`}
                  />
                </div>
              ) : null}

              <div className="mt-7 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="inline-flex w-full items-center gap-3 rounded-[16px] bg-[#f2f1ff] px-4 py-3 text-left shadow-[inset_0_0_0_1px_rgba(152,146,255,0.08)] sm:w-fit">
                  <Sparkles className="size-5 text-[#ffb21f]" />
                  <div>
                    <div className="text-[0.92rem] font-semibold text-[#254bbd]">Takes less than 2 minutes</div>
                    <div className="text-[0.8rem] text-[#4f689b]">Get your results instantly</div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="inline-flex h-14 w-full items-center justify-center gap-3 rounded-[18px] border-2 border-[#2f63ff] bg-[linear-gradient(90deg,#2d5bff_0%,#9d55f7_100%)] px-7 text-[0.98rem] font-semibold text-white shadow-[0_20px_34px_rgba(92,93,255,0.24)] transition hover:-translate-y-0.5 sm:w-auto"
                >
                  <Sparkles className="size-5" />
                  Get My Colleges
                  <ArrowRight className="size-5" />
                </button>
              </div>
            </form>

            <div className="grid gap-3.5 pt-2 sm:grid-cols-2 lg:grid-cols-3">
              {trustItems.map((item) => (
                <div
                  key={item.title}
                  className="rounded-[20px] border-2 border-[#9ebcff] bg-[linear-gradient(180deg,#ffffff_0%,#f7f9ff_100%)] px-4 py-4 shadow-[0_14px_30px_rgba(76,104,205,0.1)]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-12 items-center justify-center rounded-full border border-[#c8d8ff] bg-[linear-gradient(180deg,#eef3ff_0%,#e5ecff_100%)] text-[#355cff] shadow-[0_10px_20px_rgba(76,104,205,0.12)]">
                      <item.icon className="size-6 stroke-[2.2]" />
                    </div>
                    <div>
                      <div className="text-[0.94rem] font-semibold tracking-[-0.03em] text-[#172b60]">{item.title}</div>
                      <div className="mt-0.5 text-[0.84rem] text-[#4f689b]">{item.description}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
<aside className="w-full order-1 md:order-2 mt-4 md:mt-0 md:sticky md:top-4">
          <div className="relative overflow-hidden rounded-[24px] bg-[radial-gradient(circle_at_top,#eef2ff_0%,#d9e3ff_38%,#aebfe6_68%,#6f7f9d_100%)] p-3 sm:p-4">
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.04),rgba(255,255,255,0.22),rgba(255,255,255,0.04))]" />
<div className="relative w-full h-full flex items-center justify-center">
             <Image
  src="/cutoff.png"
  alt="Student using laptop"
  width={900}
  height={900}
  className="w-full h-auto object-contain max-h-[380px] md:max-h-[480px]"
  priority
/>
            </div>
          </div>

          <div className="mt-4 space-y-3.5">
            <div className="rounded-[22px] border-2 border-[#b6ccff] bg-white/95 p-3.5 shadow-[0_12px_30px_rgba(88,113,196,0.08)]">
              <div className="flex items-center gap-2 text-[#17306f]">
                <TrendingUp className="size-5 text-[#2f63ff]" />
                <h3 className="text-[1rem] font-semibold">Score vs Expected Cutoff</h3>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.78rem] text-[#5f79b1]">
                <span className="inline-flex items-center gap-2"><span className="h-2.5 w-4 rounded-full bg-[#2f63ff]" />Your Score</span>
                <span className="inline-flex items-center gap-2"><span className="h-2.5 w-4 rounded-full bg-[#9b75ff]" />Expected Cutoff</span>
              </div>
              <div className="mt-2 text-[0.76rem] text-[#5f79b1]">
                {chartConfig.comparisonTitle} scale: 0 to {cutoffScaleMax}
              </div>
              <TrendChart points={displayScoreTrend} maxValue={cutoffScaleMax} />
            </div>

            <div className="rounded-[22px] border-2 border-[#b6ccff] bg-white/95 p-3 shadow-[0_12px_30px_rgba(88,113,196,0.08)]">
              <h3 className="text-[1rem] font-semibold text-[#17306f]">Your Cutoff Score</h3>
              <p className="mt-1 text-[0.82rem] text-[#5f79b1]">
                Check your eligibility and college chances based on your score
              </p>
              <div className="mt-2.5 rounded-[22px] border border-[#d9e4ff] bg-[linear-gradient(180deg,#ffffff_0%,#f9fbff_100%)] p-2.5 shadow-[inset_0_0_0_1px_rgba(232,239,255,0.7)]">
                <div className="grid gap-2.5 md:grid-cols-[minmax(0,1fr)_1px_minmax(0,0.92fr)] md:items-center">
                  <div className="px-1.5 text-center">
                    <div className="text-[0.88rem] font-semibold text-[#506aa3]">Your Cutoff Score</div>
                    <div className="mt-2.5 flex items-end justify-center gap-2 text-[#17306f]">
                      <span className="text-[2.9rem] font-bold leading-none tracking-[-0.06em] text-[#2f63ff]">
                        {Math.round(liveCutoffValue)}
                      </span>
                      <span className="pb-1 text-[1.05rem] font-semibold text-[#6f86b7]">/ {cutoffScaleMax}</span>
                    </div>
                    <div className="mx-auto mt-3 h-2.5 w-full max-w-[220px] overflow-hidden rounded-full bg-[#e5ecfa]">
                      <div
                        className="h-full rounded-full bg-[linear-gradient(90deg,#2f63ff_0%,#3e79ff_100%)]"
                        style={{ width: `${scoreProgress}%` }}
                      />
                    </div>
                    <div className="mt-2.5 text-[0.8rem] font-medium text-[#4f689b]">{scoreFeedback}</div>
                  </div>
                  <div className="h-px w-full bg-[#dfe7ff] md:hidden" />
                  <div className="hidden h-full w-px bg-[#dfe7ff] md:block" />
                  <div className="px-1.5 text-center">
                    <div className="text-[0.88rem] font-semibold text-[#506aa3]">Your Mood</div>
                    <div className="mt-2 text-[3.3rem] leading-none">{activeMood.emoji}</div>
                    <div className="mt-1.5 text-[1.45rem] font-bold tracking-[-0.04em] text-[#2f63ff]">{activeMood.label}</div>
                    <div className="mt-1 text-[0.78rem] font-medium text-[#5f79b1]">{activeMood.summary}</div>
                  </div>
                </div>
              </div>
              <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
                {moodOptions.map((item) => {
                  const isActive = item.label === activeMood.label;

                  return (
                    <div
                      key={item.label}
                      className={`relative rounded-[18px] border bg-white px-2 py-3 text-center shadow-[0_8px_18px_rgba(88,113,196,0.06)] sm:px-2.5 ${
                        isActive ? "border-[#7aa3ff] shadow-[0_10px_24px_rgba(47,99,255,0.12)]" : "border-[#d9e4ff]"
                      }`}
                    >
                      {isActive ? (
                        <div className="absolute right-2.5 top-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#2f63ff] text-[0.8rem] font-bold text-white">
                          {"\u2713"}
                        </div>
                      ) : null}
                      <div className="text-[2.35rem] leading-none">{item.emoji}</div>
                      <div className="mt-2 text-[0.78rem] font-semibold text-[#17306f] sm:text-[0.82rem]">{item.label}</div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-2.5 flex items-center gap-2.5 rounded-[18px] bg-[linear-gradient(180deg,#f2f6ff_0%,#ebf1ff_100%)] px-3 py-2 text-[#17306f]">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#2f63ff] shadow-[0_6px_16px_rgba(47,99,255,0.12)]">
                  <Sparkles className="size-4.5" />
                </div>
                <p className="text-[0.76rem] font-medium leading-relaxed text-[#27477c]">{moodTip}</p>
              </div>
            </div>
          </div>
        </aside>
        </div>
      </div>
    </main>
  );
}

function FieldShell({
  children,
  icon: Icon,
  label,
}: {
  children: ReactNode;
  icon: typeof User;
  label: string;
}) {
  return (
    <label className="block rounded-[14px] border-2 border-[#9ebcff] bg-white px-3.5 py-2 shadow-[0_8px_20px_rgba(76,104,205,0.08)] transition hover:border-[#5b8eff] hover:shadow-[0_12px_24px_rgba(76,104,205,0.14)]">
      <div className="grid min-h-[50px] grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
        <div className="flex size-8 items-center justify-center rounded-[10px] border border-[#bdd1ff] bg-[#eef4ff] text-[#2f63ff] shadow-[inset_0_0_0_1px_rgba(75,116,255,0.14)]">
          <Icon className="size-4 stroke-[2.4]" />
        </div>
        <div className="min-w-0">
          <div className="mb-0.5 text-[0.82rem] font-semibold text-[#17306f]">{label}</div>
          {children}
        </div>
      </div>
    </label>
  );
}

function AcademicShell({
  children,
  icon: Icon,
  label,
  hint,
}: {
  children: ReactNode;
  icon: typeof User;
  label: string;
  hint?: string;
}) {
  return (
    <label className="block rounded-[14px] border-2 border-[#9ebcff] bg-white px-3.5 py-2 shadow-[0_8px_20px_rgba(76,104,205,0.08)] transition hover:border-[#5b8eff] hover:shadow-[0_12px_24px_rgba(76,104,205,0.14)]">
      <div className="grid min-h-[50px] grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
        <div className="flex size-8 items-center justify-center rounded-[10px] border border-[#bdd1ff] bg-[#eef4ff] text-[#2f63ff] shadow-[inset_0_0_0_1px_rgba(75,116,255,0.14)]">
          <Icon className="size-4 stroke-[2.3]" />
        </div>
        <div className="min-w-0">
          <div className="mb-0.5 text-[0.82rem] font-semibold text-[#17306f]">{label}</div>
          {hint ? <div className="mb-1 text-[0.74rem] text-[#5f79b1]">{hint}</div> : null}
          {children}
        </div>
      </div>
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
    <div className="rounded-[18px] border-2 border-[#8fb3ff] bg-[linear-gradient(135deg,#edf4ff_0%,#f7fbff_55%,#eef3ff_100%)] px-4 py-3 shadow-[0_12px_28px_rgba(76,104,205,0.12)]">
      <div className="flex items-center gap-2 text-[#17306f]">
        <div className="flex size-8 items-center justify-center rounded-full border border-[#bdd1ff] bg-white text-[#2f63ff] shadow-[0_6px_16px_rgba(76,104,205,0.12)]">
          <Calculator className="size-4" />
        </div>
        <span className="text-[0.84rem] font-semibold uppercase tracking-[0.18em]">{title}</span>
      </div>
      <p className="mt-2 text-[0.84rem] text-[#4f689b]">{formula}</p>
      <div className="mt-2.5 grid gap-2 rounded-[14px] border border-[#bcd0ff] bg-white/90 px-3.5 py-2.5 shadow-[inset_0_0_0_1px_rgba(191,212,255,0.7)] md:grid-cols-2">
        <div className="min-w-0">
          <div className="text-[0.76rem] font-semibold uppercase tracking-[0.14em] text-[#2f63ff]">{primaryLabel}</div>
          <div className="mt-1 text-[1.28rem] font-bold tracking-[-0.04em] text-[#17306f]">{primaryValue}</div>
        </div>
        {secondaryLabel && secondaryValue ? (
          <div className="min-w-0 border-t border-[#cfe0ff] pt-2 md:border-l md:border-t-0 md:pl-3 md:pt-0">
            <div className="text-[0.76rem] font-semibold uppercase tracking-[0.14em] text-[#2f63ff]">{secondaryLabel}</div>
            <div className="mt-1 text-[1rem] font-semibold text-[#17306f]">{secondaryValue}</div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function TrendChart({
  points,
  maxValue,
}: {
  points: ComparisonPoint[];
  maxValue: number;
}) {
  const width = 360;
  const height = 140;
  const left = 28;
  const right = 24;
  const top = 14;
  const bottom = 34;
  const innerWidth = width - left - right;
  const innerHeight = height - top - bottom;
  const normalizedMax = Math.max(1, maxValue);
  const ticks = Array.from({ length: 5 }, (_, index) => Math.round((normalizedMax / 4) * index));
  const toX = (index: number) => left + (innerWidth / Math.max(1, points.length - 1)) * index;
  const toY = (value: number) => top + innerHeight - (clamp(value, 0, normalizedMax) / normalizedMax) * innerHeight;
  const buildPath = (values: number[]) =>
    values.map((value, index) => `${index === 0 ? "M" : "L"} ${toX(index)} ${toY(value)}`).join(" ");
  const getPointAnchor = (index: number) => {
    if (index === 0) return "start";
    if (index === points.length - 1) return "end";
    return "middle";
  };
  const getPointTextX = (index: number) => {
    const x = toX(index);
    if (index === 0) return x + 8;
    if (index === points.length - 1) return x - 8;
    return x;
  };

  return (
    <div className="mt-4">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-[180px] w-full">
        {ticks.map((tick) => (
          <g key={tick}>
            <line
              x1={left}
              x2={width - right}
              y1={toY(tick)}
              y2={toY(tick)}
              stroke="#dfe7ff"
              strokeWidth="1"
            />
            <text x="4" y={toY(tick) + 4} fontSize="10" fill="#6f86b7">
              {tick}
            </text>
          </g>
        ))}
        <path d={buildPath(points.map((point) => point.score))} fill="none" stroke="#2f63ff" strokeWidth="3" />
        <path
          d={buildPath(points.map((point) => point.expected))}
          fill="none"
          stroke="#9b75ff"
          strokeWidth="3"
          strokeDasharray="6 6"
        />
        {points.map((point, index) => (
          <g key={point.label}>
            {(() => {
              const scoreY = toY(point.score);
              const expectedY = toY(point.expected);
              const labelsTooClose = Math.abs(scoreY - expectedY) < 20;
              const labelX = getPointTextX(index);
              const labelAnchor = getPointAnchor(index);

              return (
                <>
                  <circle cx={toX(index)} cy={scoreY} r="4.5" fill="#2f63ff" />
                  <text
                    x={labelX}
                    y={scoreY - (labelsTooClose ? 16 : 10)}
                    fontSize="10"
                    fill="#17306f"
                    fontWeight="700"
                    textAnchor={labelAnchor}
                  >
                    {point.score}
                  </text>
                  <circle cx={toX(index)} cy={expectedY} r="4.5" fill="#9b75ff" />
                  <text
                    x={labelX}
                    y={expectedY + (labelsTooClose ? 22 : 16)}
                    fontSize="10"
                    fill="#7d62e8"
                    fontWeight="700"
                    textAnchor={labelAnchor}
                  >
                    {point.expected}
                  </text>
                  <text x={labelX} y={height - 8} fontSize="10" fill="#6f86b7" textAnchor={labelAnchor}>
                    {point.label}
                  </text>
                </>
              );
            })()}
          </g>
        ))}
      </svg>
    </div>
  );
}

const inputClassName =
  "w-full h-[44px] sm:h-auto border-0 bg-transparent p-0 text-[0.92rem] font-medium text-[#27477c] outline-none placeholder:text-[#7e97c8]";
const academicInputClassName =
  "w-full border-0 bg-transparent p-0 text-[0.92rem] font-medium text-[#27477c] outline-none transition placeholder:text-[#7e97c8]";


