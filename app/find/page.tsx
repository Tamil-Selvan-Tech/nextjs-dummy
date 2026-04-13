"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Navbar } from "@/components/navbar";
import {
  degreeCourseOptions,
  degreeOptions,
  engineeringCourseOptions,
  medicalCourseOptions,
} from "@/lib/site-data";

export default function FindPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("11");
  const [selectedDegree, setSelectedDegree] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCollegeType, setSelectedCollegeType] = useState("");
  const [selectedAdmissionType, setSelectedAdmissionType] = useState("");
  const [selectedLawAdmissionType, setSelectedLawAdmissionType] = useState("");
  const [lawRank, setLawRank] = useState("");
  const [lawSubjectOne, setLawSubjectOne] = useState("");
  const [lawSubjectTwo, setLawSubjectTwo] = useState("");
  const [lawSubjectThree, setLawSubjectThree] = useState("");
  const [selectedAgricultureStream, setSelectedAgricultureStream] = useState("");
  const [jeeMarks, setJeeMarks] = useState("");
  const [physicsMarks, setPhysicsMarks] = useState("");
  const [chemistryMarks, setChemistryMarks] = useState("");
  const [mathsMarks, setMathsMarks] = useState("");
  const [biologyMarks, setBiologyMarks] = useState("");
  const [medicalMarks, setMedicalMarks] = useState("");
  const [arch12thMarks, setArch12thMarks] = useState("");
  const [archNataMarks, setArchNataMarks] = useState("");
  const levelOptions = useMemo(() => ["6", "7", "8", "9", "10", "11", "12"], []);
  const isSeniorLevel = selectedLevel === "11" || selectedLevel === "12";
  const isMedicalMarksLevel = selectedLevel === "12";
  const isEngineeringLevel12 = selectedDegree === "Engineering" && selectedLevel === "12";
  const isTneaSelected = selectedAdmissionType === "TNEA" || !isEngineeringLevel12;
  const isJeeSelected =
    selectedAdmissionType === "JEE Main" || selectedAdmissionType === "JEE Advanced";
  const isParamedical = selectedDegree === "Paramedical";
  const isLaw = selectedDegree === "Law";
  const isLawMarkBased = selectedLawAdmissionType === "11th/12th Mark";
  const isLawClat = selectedLawAdmissionType === "CLAT";
  const isAgriculture = selectedDegree === "Agriculture";
  const isArch = selectedDegree === "B.Arch";
  const engineeringCourses = engineeringCourseOptions;
  const medicalCourses = medicalCourseOptions;
  const paramedicalCourses = degreeCourseOptions.Paramedical || [];
  const lawCourses = degreeCourseOptions.Law || [];
  const agricultureCourses = [
    "B.Sc Agriculture",
    "B.Sc Horticulture",
    "B.Sc Forestry",
    "B.Tech Agricultural Engineering",
  ];
  const engineeringCutoff = useMemo(() => {
    if (selectedDegree !== "Engineering" || !isSeniorLevel || !isTneaSelected) return "";
    const physics = Number(physicsMarks);
    const chemistry = Number(chemistryMarks);
    const maths = Number(mathsMarks);
    if (!Number.isFinite(physics) || !Number.isFinite(chemistry) || !Number.isFinite(maths)) {
      return "";
    }
    const cutoff = maths + physics / 2 + chemistry / 2;
    return cutoff.toFixed(1);
  }, [chemistryMarks, isSeniorLevel, mathsMarks, physicsMarks, selectedDegree]);
  const paramedicalTotal = useMemo(() => {
    if (!isParamedical || !isSeniorLevel) return "";
    const physics = Number(physicsMarks);
    const chemistry = Number(chemistryMarks);
    const biology = Number(biologyMarks);
    if (!Number.isFinite(physics) || !Number.isFinite(chemistry) || !Number.isFinite(biology)) {
      return "";
    }
    const total = physics + chemistry + biology;
    return total.toFixed(0);
  }, [biologyMarks, chemistryMarks, isParamedical, isSeniorLevel, physicsMarks]);
  const paramedicalCutoffPercent = useMemo(() => {
    if (!paramedicalTotal) return "";
    const total = Number(paramedicalTotal);
    if (!Number.isFinite(total)) return "";
    const percent = (total / 300) * 100;
    return percent.toFixed(1);
  }, [paramedicalTotal]);
  const lawBestThreeTotal = useMemo(() => {
    if (!isLaw || !isSeniorLevel || !isLawMarkBased) return "0";
    const first = Number(lawSubjectOne);
    const second = Number(lawSubjectTwo);
    const third = Number(lawSubjectThree);
    if (!Number.isFinite(first) || !Number.isFinite(second) || !Number.isFinite(third)) {
      return "0";
    }
    const total = first + second + third;
    return total.toFixed(0);
  }, [isLaw, isLawMarkBased, isSeniorLevel, lawSubjectOne, lawSubjectTwo, lawSubjectThree]);
  const agricultureCutoff = useMemo(() => {
    if (!isAgriculture || !isSeniorLevel) return "";
    const physics = Number(physicsMarks);
    const chemistry = Number(chemistryMarks);
    const bioOrMaths =
      selectedAgricultureStream === "PCB"
        ? Number(biologyMarks)
        : selectedAgricultureStream === "PCM"
          ? Number(mathsMarks)
          : Number.NaN;
    if (!Number.isFinite(physics) || !Number.isFinite(chemistry) || !Number.isFinite(bioOrMaths)) {
      return "";
    }
    const cutoff = physics / 4 + chemistry / 4 + bioOrMaths / 2;
    return cutoff.toFixed(2);
  }, [
    biologyMarks,
    chemistryMarks,
    isAgriculture,
    isSeniorLevel,
    mathsMarks,
    physicsMarks,
    selectedAgricultureStream,
  ]);
  const arch12thConverted = useMemo(() => {
    if (!isArch || !isSeniorLevel) return "";
    const marks = Number(arch12thMarks);
    if (!Number.isFinite(marks)) return "";
    const converted = (marks / 600) * 200;
    return converted.toFixed(0);
  }, [arch12thMarks, isArch, isSeniorLevel]);
  const archCombinedCutoff = useMemo(() => {
    if (!arch12thConverted || !isArch || !isSeniorLevel) return "";
    const nata = Number(archNataMarks);
    if (!Number.isFinite(nata)) return "";
    const total = Number(arch12thConverted) + nata;
    return total.toFixed(0);
  }, [arch12thConverted, archNataMarks, isArch, isSeniorLevel]);

  return (
    <section className="min-h-screen bg-[linear-gradient(180deg,#eef4fb_0%,#e7eef8_100%)] text-[color:var(--text-dark)]">
      <Navbar />

      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute left-[-4rem] top-8 h-56 w-56 rounded-full bg-[rgba(60,126,182,0.1)] blur-3xl" />
          <div className="absolute right-[-3rem] top-20 h-48 w-48 rounded-full bg-[rgba(255,138,61,0.12)] blur-3xl" />
        </div>
        <div className="page-container-full relative z-10 py-8 md:py-10">
          <div className="mx-auto max-w-none">
          <p className="inline-flex rounded-full border border-[rgba(15,76,129,0.12)] bg-[rgba(15,76,129,0.06)] px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--brand-primary)]">
            College Finder
          </p>
          <h1 className="mt-4 max-w-3xl text-xl font-bold leading-tight md:text-3xl">
            Find colleges based on your level, degree, course and cutoff
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[color:var(--text-muted)] md:text-[15px]">
            Fill in your details below and click Find Colleges.
          </p>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              const params = new URLSearchParams();
              if (name) params.set("name", name);
              if (phone) params.set("phone", phone);
              if (selectedLevel) params.set("level", selectedLevel);
              if (selectedDegree) params.set("degree", selectedDegree);
              if (selectedCourse) params.set("course", selectedCourse);
              if (selectedCategory) params.set("category", selectedCategory);
              if (selectedCollegeType) params.set("collegeType", selectedCollegeType);
                if (selectedDegree === "Engineering" && isSeniorLevel) {
                if (isJeeSelected) {
                  if (jeeMarks) params.set("marks", jeeMarks);
                } else {
                  if (physicsMarks) params.set("physics", physicsMarks);
                  if (chemistryMarks) params.set("chemistry", chemistryMarks);
                  if (mathsMarks) params.set("maths", mathsMarks);
                  if (engineeringCutoff) params.set("cutoff", engineeringCutoff);
                }
              }
              if (selectedDegree === "Medical" && isSeniorLevel) {
                if (medicalMarks) params.set("marks", medicalMarks);
              }
              if (selectedDegree === "Law" && isSeniorLevel) {
                if (selectedLawAdmissionType) params.set("admissionType", selectedLawAdmissionType);
                if (selectedLawAdmissionType === "CLAT") {
                  if (lawRank) params.set("rank", lawRank);
                }
                if (selectedLawAdmissionType === "11th/12th Mark") {
                  if (selectedLevel) params.set("markLevel", `${selectedLevel}th`);
                  if (lawSubjectOne) params.set("subject1", lawSubjectOne);
                  if (lawSubjectTwo) params.set("subject2", lawSubjectTwo);
                  if (lawSubjectThree) params.set("subject3", lawSubjectThree);
                  if (lawBestThreeTotal) params.set("cutoff", lawBestThreeTotal);
                }
              }
              if (selectedDegree === "Agriculture" && isSeniorLevel) {
                if (selectedAgricultureStream) params.set("stream", selectedAgricultureStream);
                if (physicsMarks) params.set("physics", physicsMarks);
                if (chemistryMarks) params.set("chemistry", chemistryMarks);
                if (selectedAgricultureStream === "PCB" && biologyMarks) {
                  params.set("biology", biologyMarks);
                }
                if (selectedAgricultureStream === "PCM" && mathsMarks) {
                  params.set("maths", mathsMarks);
                }
                if (agricultureCutoff) params.set("cutoff", agricultureCutoff);
              }
              if (selectedDegree === "Paramedical" && isSeniorLevel) {
                if (physicsMarks) params.set("physics", physicsMarks);
                if (chemistryMarks) params.set("chemistry", chemistryMarks);
                if (biologyMarks) params.set("biology", biologyMarks);
                if (paramedicalCutoffPercent) params.set("cutoff", paramedicalCutoffPercent);
              }
              if (selectedDegree === "B.Arch" && isSeniorLevel) {
                if (arch12thMarks) params.set("marks12th", arch12thMarks);
                if (arch12thConverted) params.set("converted12th", arch12thConverted);
                if (archNataMarks) params.set("nata", archNataMarks);
                if (archCombinedCutoff) params.set("cutoff", archCombinedCutoff);
              }
              router.push(`/cutoff?${params.toString()}`);
            }}
            className="mt-7 rounded-[1.8rem] border border-[rgba(15,76,129,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,249,255,0.96))] p-5 shadow-[0_24px_56px_rgba(22,50,79,0.08)] md:p-6"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Name"
                  aria-label="Name"
                  className="h-11 w-full rounded-[1rem] border border-[rgba(15,76,129,0.1)] bg-white px-3 text-sm text-[color:var(--text-dark)] outline-none placeholder:text-[color:var(--text-muted)] focus:border-[color:var(--brand-primary-soft)]"
                  required
                />
              </label>

              <label className="block">
                <input
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="Phone No"
                  aria-label="Phone number"
                  className="h-11 w-full rounded-[1rem] border border-[rgba(15,76,129,0.1)] bg-white px-3 text-sm text-[color:var(--text-dark)] outline-none placeholder:text-[color:var(--text-muted)] focus:border-[color:var(--brand-primary-soft)]"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">Select Level</span>
                <select
                  value={selectedLevel}
                  onChange={(event) => {
                    const value = event.target.value;
                    setSelectedLevel(value);
                    if (!["11", "12"].includes(value)) {
                      setSelectedCategory("");
                      setSelectedCollegeType("");
                      setSelectedCourse("");
                      setSelectedAdmissionType("");
                      setSelectedLawAdmissionType("");
                      setSelectedAgricultureStream("");
                      setLawRank("");
                      setLawSubjectOne("");
                      setLawSubjectTwo("");
                      setLawSubjectThree("");
                      setJeeMarks("");
                      setPhysicsMarks("");
                      setChemistryMarks("");
                      setMathsMarks("");
                      setBiologyMarks("");
                      setMedicalMarks("");
                      setArch12thMarks("");
                      setArchNataMarks("");
                    }
                    if (value !== "12") {
                      setSelectedAdmissionType("");
                      setJeeMarks("");
                      setLawSubjectOne("");
                      setLawSubjectTwo("");
                      setLawSubjectThree("");
                      setSelectedAgricultureStream("");
                      setPhysicsMarks("");
                      setChemistryMarks("");
                      setMathsMarks("");
                      setBiologyMarks("");
                    }
                  }}
                  className="h-11 w-full rounded-[1rem] border border-[rgba(15,76,129,0.1)] bg-white px-3 text-sm text-[color:var(--text-dark)] outline-none focus:border-[color:var(--brand-primary-soft)]"
                  required
                >
                  <option value="">Choose level</option>
                  {levelOptions.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </label>

              {isSeniorLevel ? (
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">Category</span>
                  <select
                    value={selectedCategory}
                    onChange={(event) => setSelectedCategory(event.target.value)}
                    className="h-11 w-full rounded-[1rem] border border-[rgba(15,76,129,0.1)] bg-white px-3 text-sm text-[color:var(--text-dark)] outline-none focus:border-[color:var(--brand-primary-soft)]"
                    required
                  >
                    <option value="">Select category</option>
                    <option value="OC">OC / General</option>
                    <option value="BC">BC</option>
                    <option value="BCM">BCM</option>
                    <option value="MBC">MBC / DNC</option>
                    <option value="SC">SC</option>
                    <option value="SCA">SCA</option>
                    <option value="ST">ST</option>
                  </select>
                </label>
              ) : null}

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">Select Degree</span>
                <select
                  value={selectedDegree}
                  onChange={(event) => {
                    const value = event.target.value;
                    setSelectedDegree(value);
                    setSelectedCourse("");
                    if (value !== "Engineering") {
                      setSelectedAdmissionType("");
                      setJeeMarks("");
                      setPhysicsMarks("");
                      setChemistryMarks("");
                      setMathsMarks("");
                    }
                    if (value !== "Law") {
                      setSelectedLawAdmissionType("");
                      setLawRank("");
                      setLawSubjectOne("");
                      setLawSubjectTwo("");
                      setLawSubjectThree("");
                    }
                    if (value !== "Agriculture") {
                      setSelectedAgricultureStream("");
                      setPhysicsMarks("");
                      setChemistryMarks("");
                      setMathsMarks("");
                      setBiologyMarks("");
                    }
                    if (value !== "Medical") {
                      setMedicalMarks("");
                      setSelectedCollegeType("");
                    }
                    if (value !== "Paramedical") {
                      setBiologyMarks("");
                    }
                    if (value !== "B.Arch") {
                      setArch12thMarks("");
                      setArchNataMarks("");
                    }
                  }}
                  className="h-11 w-full rounded-[1rem] border border-[rgba(15,76,129,0.1)] bg-white px-3 text-sm text-[color:var(--text-dark)] outline-none focus:border-[color:var(--brand-primary-soft)]"
                  required
                >
                  <option value="">Choose degree</option>
                  {degreeOptions.map((degree) => (
                    <option key={degree} value={degree}>
                      {degree}
                    </option>
                  ))}
                </select>
              </label>

              {selectedDegree === "Engineering" && isSeniorLevel ? (
                <>
                  {isEngineeringLevel12 ? (
                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">
                        Admission Type
                      </span>
                      <select
                        value={selectedAdmissionType}
                        onChange={(event) => {
                          const value = event.target.value;
                          setSelectedAdmissionType(value);
                          setJeeMarks("");
                          if (value !== "TNEA") {
                            setPhysicsMarks("");
                            setChemistryMarks("");
                            setMathsMarks("");
                          }
                        }}
                        className="h-11 w-full rounded-[1rem] border border-[rgba(15,76,129,0.1)] bg-white px-3 text-sm text-[color:var(--text-dark)] outline-none focus:border-[color:var(--brand-primary-soft)]"
                        required
                      >
                        <option value="">Select admission type</option>
                        <option value="JEE Main">JEE Main</option>
                        <option value="JEE Advanced">JEE Advanced</option>
                        <option value="TNEA">TNEA</option>
                      </select>
                    </label>
                  ) : null}

                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">
                      Select Course
                    </span>
                    <select
                      value={selectedCourse}
                      onChange={(event) => setSelectedCourse(event.target.value)}
                      className="h-11 w-full rounded-[1rem] border border-[rgba(15,76,129,0.1)] bg-white px-3 text-sm text-[color:var(--text-dark)] outline-none focus:border-[color:var(--brand-primary-soft)]"
                      required
                    >
                      <option value="">Choose course</option>
                      {engineeringCourses.map((course) => (
                        <option key={course} value={course}>
                          {course}
                        </option>
                      ))}
                    </select>
                  </label>

                  {isEngineeringLevel12 && isJeeSelected ? (
                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">
                        Enter Mark/Percentile
                      </span>
                      <input
                        type="number"
                        min="0"
                        max="500"
                        step="0.01"
                        value={jeeMarks}
                        onChange={(event) => setJeeMarks(event.target.value)}
                        placeholder="Enter mark or percentile"
                        aria-label="JEE mark or percentile"
                        className="h-11 w-full rounded-[1rem] border border-[rgba(15,76,129,0.1)] bg-white px-3 text-sm text-[color:var(--text-dark)] outline-none placeholder:text-[color:var(--text-muted)] focus:border-[color:var(--brand-primary-soft)]"
                        required
                      />
                    </label>
                  ) : null}

                  {isTneaSelected ? (
                    <>
                      <label className="block">
                        <span className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">Physics</span>
                        <input
                          type="number"
                          min="0"
                          max="200"
                          step="0.01"
                          value={physicsMarks}
                          onChange={(event) => setPhysicsMarks(event.target.value)}
                          placeholder="Enter your marks"
                          aria-label="Physics marks"
                          className="h-11 w-full rounded-[1rem] border border-[rgba(15,76,129,0.1)] bg-white px-3 text-sm text-[color:var(--text-dark)] outline-none placeholder:text-[color:var(--text-muted)] focus:border-[color:var(--brand-primary-soft)]"
                          required
                        />
                      </label>

                      <label className="block">
                        <span className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">Chemistry</span>
                        <input
                          type="number"
                          min="0"
                          max="200"
                          step="0.01"
                          value={chemistryMarks}
                          onChange={(event) => setChemistryMarks(event.target.value)}
                          placeholder="Enter your marks"
                          aria-label="Chemistry marks"
                          className="h-11 w-full rounded-[1rem] border border-[rgba(15,76,129,0.1)] bg-white px-3 text-sm text-[color:var(--text-dark)] outline-none placeholder:text-[color:var(--text-muted)] focus:border-[color:var(--brand-primary-soft)]"
                          required
                        />
                      </label>

                      <label className="block">
                        <span className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">Maths</span>
                        <input
                          type="number"
                          min="0"
                          max="200"
                          step="0.01"
                          value={mathsMarks}
                          onChange={(event) => setMathsMarks(event.target.value)}
                          placeholder="Enter your marks"
                          aria-label="Maths marks"
                          className="h-11 w-full rounded-[1rem] border border-[rgba(15,76,129,0.1)] bg-white px-3 text-sm text-[color:var(--text-dark)] outline-none placeholder:text-[color:var(--text-muted)] focus:border-[color:var(--brand-primary-soft)]"
                          required
                        />
                      </label>

                      <div className="md:col-span-2">
                        <div className="rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-[rgba(255,255,255,0.8)] px-4 py-3 text-xs text-[color:var(--text-muted)]">
                          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--text-dark)]">
                            Cutoff Calculation
                          </div>
                          <div className="mt-2">
                            Cutoff = Maths + (Physics / 2) + (Chemistry / 2)
                          </div>
                          <div className="mt-2 text-sm font-semibold text-[color:var(--brand-primary)]">
                            {engineeringCutoff ? `Calculated Cutoff: ${engineeringCutoff}` : "Enter marks to calculate"}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : null}
                </>
              ) : null}

              {selectedDegree === "Medical" && isSeniorLevel ? (
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">
                    Select Course
                  </span>
                  <select
                    value={selectedCourse}
                    onChange={(event) => setSelectedCourse(event.target.value)}
                    className="h-11 w-full rounded-[1rem] border border-[rgba(15,76,129,0.1)] bg-white px-3 text-sm text-[color:var(--text-dark)] outline-none focus:border-[color:var(--brand-primary-soft)]"
                    required
                  >
                    <option value="">Choose course</option>
                    {medicalCourses.map((course) => (
                      <option key={course} value={course}>
                        {course}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}

              {isLaw && isSeniorLevel ? (
                <>
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">
                      Select Course
                    </span>
                    <select
                      value={selectedCourse}
                      onChange={(event) => setSelectedCourse(event.target.value)}
                      className="h-11 w-full rounded-[1rem] border border-[rgba(15,76,129,0.1)] bg-white px-3 text-sm text-[color:var(--text-dark)] outline-none focus:border-[color:var(--brand-primary-soft)]"
                      required
                    >
                      <option value="">Choose course</option>
                      {lawCourses.map((course) => (
                        <option key={course} value={course}>
                          {course}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">
                      Admission Type
                    </span>
                    <select
                      value={selectedLawAdmissionType}
                      onChange={(event) => {
                        const value = event.target.value;
                        setSelectedLawAdmissionType(value);
                        setLawRank("");
                        setLawSubjectOne("");
                        setLawSubjectTwo("");
                        setLawSubjectThree("");
                      }}
                      className="h-11 w-full rounded-[1rem] border border-[rgba(15,76,129,0.1)] bg-white px-3 text-sm text-[color:var(--text-dark)] outline-none focus:border-[color:var(--brand-primary-soft)]"
                      required
                    >
                      <option value="">Select admission type</option>
                      <option value="CLAT">CLAT</option>
                      <option value="11th/12th Mark">11th/12th Mark</option>
                    </select>
                  </label>

                  {isLawClat ? (
                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">
                        Enter Rank
                      </span>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={lawRank}
                        onChange={(event) => setLawRank(event.target.value)}
                        placeholder="Enter CLAT rank"
                        aria-label="CLAT rank"
                        className="h-11 w-full rounded-[1rem] border border-[rgba(15,76,129,0.1)] bg-white px-3 text-sm text-[color:var(--text-dark)] outline-none placeholder:text-[color:var(--text-muted)] focus:border-[color:var(--brand-primary-soft)]"
                        required
                      />
                    </label>
                  ) : null}

                  {isLawMarkBased ? (
                    <>
                      <label className="block">
                        <span className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">
                          Best Subject 1
                        </span>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="1"
                          value={lawSubjectOne}
                          onChange={(event) => setLawSubjectOne(event.target.value)}
                          placeholder="Eg: Tamil"
                          aria-label="Best subject one"
                          className="h-11 w-full rounded-[1rem] border border-[rgba(15,76,129,0.1)] bg-white px-3 text-sm text-[color:var(--text-dark)] outline-none placeholder:text-[color:var(--text-muted)] focus:border-[color:var(--brand-primary-soft)]"
                          required
                        />
                      </label>

                      <label className="block">
                        <span className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">
                          Best Subject 2
                        </span>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="1"
                          value={lawSubjectTwo}
                          onChange={(event) => setLawSubjectTwo(event.target.value)}
                          placeholder="Eg: English"
                          aria-label="Best subject two"
                          className="h-11 w-full rounded-[1rem] border border-[rgba(15,76,129,0.1)] bg-white px-3 text-sm text-[color:var(--text-dark)] outline-none placeholder:text-[color:var(--text-muted)] focus:border-[color:var(--brand-primary-soft)]"
                          required
                        />
                      </label>

                      <label className="block">
                        <span className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">
                          Best Subject 3
                        </span>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="1"
                          value={lawSubjectThree}
                          onChange={(event) => setLawSubjectThree(event.target.value)}
                          placeholder="Eg: History / Commerce"
                          aria-label="Best subject three"
                          className="h-11 w-full rounded-[1rem] border border-[rgba(15,76,129,0.1)] bg-white px-3 text-sm text-[color:var(--text-dark)] outline-none placeholder:text-[color:var(--text-muted)] focus:border-[color:var(--brand-primary-soft)]"
                          required
                        />
                      </label>

                      <div className="md:col-span-2">
                        <div className="rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-[rgba(255,255,255,0.8)] px-4 py-3 text-xs text-[color:var(--text-muted)]">
                          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--text-dark)]">
                            Law Cutoff (Best 3 Subjects)
                          </div>
                          <div className="mt-2">Total = Best 3 subjects mark sum (out of 300)</div>
                          <div className="mt-2 text-sm font-semibold text-[color:var(--brand-primary)]">
                            {`Calculated Total: ${lawBestThreeTotal} / 300`}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : null}
                </>
              ) : null}

              {isAgriculture && isSeniorLevel ? (
                <>
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">
                      Select Course
                    </span>
                    <select
                      value={selectedCourse}
                      onChange={(event) => setSelectedCourse(event.target.value)}
                      className="h-11 w-full rounded-[1rem] border border-[rgba(15,76,129,0.1)] bg-white px-3 text-sm text-[color:var(--text-dark)] outline-none focus:border-[color:var(--brand-primary-soft)]"
                      required
                    >
                      <option value="">Choose course</option>
                      {agricultureCourses.map((course) => (
                        <option key={course} value={course}>
                          {course}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">
                      Admission Type
                    </span>
                    <select
                      value={selectedAgricultureStream}
                      onChange={(event) => {
                        setSelectedAgricultureStream(event.target.value);
                        setPhysicsMarks("");
                        setChemistryMarks("");
                        setMathsMarks("");
                        setBiologyMarks("");
                      }}
                      className="h-11 w-full rounded-[1rem] border border-[rgba(15,76,129,0.1)] bg-white px-3 text-sm text-[color:var(--text-dark)] outline-none focus:border-[color:var(--brand-primary-soft)]"
                      required
                    >
                      <option value="">Select 12th PCB / PCM</option>
                      <option value="PCB">PCB</option>
                      <option value="PCM">PCM</option>
                    </select>
                  </label>

                  {selectedAgricultureStream ? (
                    <>
                      <label className="block">
                        <span className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">
                          Physics
                        </span>
                        <input
                          type="number"
                          min="0"
                          max="200"
                          step="0.01"
                          value={physicsMarks}
                          onChange={(event) => setPhysicsMarks(event.target.value)}
                          placeholder="Enter your marks"
                          aria-label="Physics marks"
                          className="h-11 w-full rounded-[1rem] border border-[rgba(15,76,129,0.1)] bg-white px-3 text-sm text-[color:var(--text-dark)] outline-none placeholder:text-[color:var(--text-muted)] focus:border-[color:var(--brand-primary-soft)]"
                          required
                        />
                      </label>

                      <label className="block">
                        <span className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">
                          Chemistry
                        </span>
                        <input
                          type="number"
                          min="0"
                          max="200"
                          step="0.01"
                          value={chemistryMarks}
                          onChange={(event) => setChemistryMarks(event.target.value)}
                          placeholder="Enter your marks"
                          aria-label="Chemistry marks"
                          className="h-11 w-full rounded-[1rem] border border-[rgba(15,76,129,0.1)] bg-white px-3 text-sm text-[color:var(--text-dark)] outline-none placeholder:text-[color:var(--text-muted)] focus:border-[color:var(--brand-primary-soft)]"
                          required
                        />
                      </label>

                      <label className="block">
                        <span className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">
                          {selectedAgricultureStream === "PCB" ? "Biology" : "Maths"}
                        </span>
                        <input
                          type="number"
                          min="0"
                          max="200"
                          step="0.01"
                          value={selectedAgricultureStream === "PCB" ? biologyMarks : mathsMarks}
                          onChange={(event) =>
                            selectedAgricultureStream === "PCB"
                              ? setBiologyMarks(event.target.value)
                              : setMathsMarks(event.target.value)
                          }
                          placeholder="Enter your marks"
                          aria-label="Biology or Maths marks"
                          className="h-11 w-full rounded-[1rem] border border-[rgba(15,76,129,0.1)] bg-white px-3 text-sm text-[color:var(--text-dark)] outline-none placeholder:text-[color:var(--text-muted)] focus:border-[color:var(--brand-primary-soft)]"
                          required
                        />
                      </label>

                      <div className="md:col-span-2">
                        <div className="rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-[rgba(255,255,255,0.8)] px-4 py-3 text-xs text-[color:var(--text-muted)]">
                          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--text-dark)]">
                            Cutoff Calculation (TN)
                          </div>
                          <div className="mt-2">
                            Cutoff = (Physics / 4) + (Chemistry / 4) + (
                            {selectedAgricultureStream === "PCB" ? "Biology" : "Maths"} / 2)
                          </div>
                          <div className="mt-2 text-sm font-semibold text-[color:var(--brand-primary)]">
                            {agricultureCutoff
                              ? `Calculated Cutoff: ${agricultureCutoff}`
                              : "Enter marks to calculate"}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : null}
                </>
              ) : null}

              {selectedDegree === "Medical" && isSeniorLevel ? (
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">
                    Select College Type
                  </span>
                  <select
                    value={selectedCollegeType}
                    onChange={(event) => setSelectedCollegeType(event.target.value)}
                    className="h-11 w-full rounded-[1rem] border border-[rgba(15,76,129,0.1)] bg-white px-3 text-sm text-[color:var(--text-dark)] outline-none focus:border-[color:var(--brand-primary-soft)]"
                    required
                  >
                    <option value="">Choose college type</option>
                    <option value="Government">Government</option>
                    <option value="Private">Private</option>
                  </select>
                </label>
              ) : null}

              {selectedDegree === "Paramedical" && isSeniorLevel ? (
                <>
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">
                      Select Course
                    </span>
                    <select
                      value={selectedCourse}
                      onChange={(event) => setSelectedCourse(event.target.value)}
                      className="h-11 w-full rounded-[1rem] border border-[rgba(15,76,129,0.1)] bg-white px-3 text-sm text-[color:var(--text-dark)] outline-none focus:border-[color:var(--brand-primary-soft)]"
                      required
                    >
                      <option value="">Choose course</option>
                      {paramedicalCourses.map((course) => (
                        <option key={course} value={course}>
                          {course}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">Physics</span>
                    <input
                      type="number"
                      min="0"
                      max="200"
                      step="0.01"
                      value={physicsMarks}
                      onChange={(event) => setPhysicsMarks(event.target.value)}
                      placeholder="Enter your marks"
                      aria-label="Physics marks"
                      className="h-11 w-full rounded-[1rem] border border-[rgba(15,76,129,0.1)] bg-white px-3 text-sm text-[color:var(--text-dark)] outline-none placeholder:text-[color:var(--text-muted)] focus:border-[color:var(--brand-primary-soft)]"
                      required
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">Chemistry</span>
                    <input
                      type="number"
                      min="0"
                      max="200"
                      step="0.01"
                      value={chemistryMarks}
                      onChange={(event) => setChemistryMarks(event.target.value)}
                      placeholder="Enter your marks"
                      aria-label="Chemistry marks"
                      className="h-11 w-full rounded-[1rem] border border-[rgba(15,76,129,0.1)] bg-white px-3 text-sm text-[color:var(--text-dark)] outline-none placeholder:text-[color:var(--text-muted)] focus:border-[color:var(--brand-primary-soft)]"
                      required
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">Biology</span>
                    <input
                      type="number"
                      min="0"
                      max="200"
                      step="0.01"
                      value={biologyMarks}
                      onChange={(event) => setBiologyMarks(event.target.value)}
                      placeholder="Enter your marks"
                      aria-label="Biology marks"
                      className="h-11 w-full rounded-[1rem] border border-[rgba(15,76,129,0.1)] bg-white px-3 text-sm text-[color:var(--text-dark)] outline-none placeholder:text-[color:var(--text-muted)] focus:border-[color:var(--brand-primary-soft)]"
                      required
                    />
                  </label>

                  <div className="md:col-span-2">
                    <div className="rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-[rgba(255,255,255,0.8)] px-4 py-3 text-xs text-[color:var(--text-muted)]">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--text-dark)]">
                        Cutoff Calculation
                      </div>
                      <div className="mt-2">
                        Cutoff Percentage = (Physics + Chemistry + Biology) / 300 × 100
                      </div>
                      <div className="mt-2 text-sm font-semibold text-[color:var(--brand-primary)]">
                        {paramedicalCutoffPercent
                          ? `Calculated Cutoff: ${paramedicalCutoffPercent}%`
                          : "Enter marks to calculate"}
                      </div>
                    </div>
                  </div>
                </>
              ) : null}

              {isArch && isSeniorLevel ? (
                <>
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">
                      12th Marks (Out of 600)
                    </span>
                    <input
                      type="number"
                      min="0"
                      max="600"
                      step="1"
                      value={arch12thMarks}
                      onChange={(event) => setArch12thMarks(event.target.value)}
                      placeholder="Enter your 12th total"
                      aria-label="12th total marks"
                      className="h-11 w-full rounded-[1rem] border border-[rgba(15,76,129,0.1)] bg-white px-3 text-sm text-[color:var(--text-dark)] outline-none placeholder:text-[color:var(--text-muted)] focus:border-[color:var(--brand-primary-soft)]"
                      required
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">
                      NATA Score (Out of 200)
                    </span>
                    <input
                      type="number"
                      min="0"
                      max="200"
                      step="1"
                      value={archNataMarks}
                      onChange={(event) => setArchNataMarks(event.target.value)}
                      placeholder="Enter your NATA score"
                      aria-label="NATA marks"
                      className="h-11 w-full rounded-[1rem] border border-[rgba(15,76,129,0.1)] bg-white px-3 text-sm text-[color:var(--text-dark)] outline-none placeholder:text-[color:var(--text-muted)] focus:border-[color:var(--brand-primary-soft)]"
                      required
                    />
                  </label>

                  <div className="md:col-span-2">
                    <div className="rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-[rgba(255,255,255,0.8)] px-4 py-3 text-xs text-[color:var(--text-muted)]">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--text-dark)]">
                        B.Arch Combined Score
                      </div>
                      <div className="mt-2">12th (out of 600) → (out of 200) + NATA (out of 200)</div>
                      <div className="mt-2 text-sm font-semibold text-[color:var(--brand-primary)]">
                        {archCombinedCutoff
                          ? `Calculated Cutoff: ${archCombinedCutoff} / 400`
                          : "Enter marks to calculate"}
                      </div>
                      <div className="mt-1 text-[11px] text-[color:var(--text-muted)]">
                        {arch12thConverted ? `12th Converted: ${arch12thConverted} / 200` : ""}
                      </div>
                    </div>
                  </div>
                </>
              ) : null}

              {selectedDegree === "Medical" && isMedicalMarksLevel ? (
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">Enter your mark</span>
                  <input
                    type="number"
                    min="0"
                    max="1000"
                    step="0.01"
                    value={medicalMarks}
                    onChange={(event) => setMedicalMarks(event.target.value)}
                    placeholder="Enter your marks"
                    aria-label="Medical marks"
                    className="h-11 w-full rounded-[1rem] border border-[rgba(15,76,129,0.1)] bg-white px-3 text-sm text-[color:var(--text-dark)] outline-none placeholder:text-[color:var(--text-muted)] focus:border-[color:var(--brand-primary-soft)]"
                    required
                  />
                </label>
              ) : null}
            </div>

            <button
              type="submit"
              className="shine-button mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-[1rem] bg-[color:var(--brand-primary)] px-6 text-sm font-semibold text-white transition hover:bg-[color:var(--brand-primary-soft)]"
            >
              <Search className="size-4" />
              Find Colleges
            </button>
          </form>
          </div>
        </div>
      </div>
    </section>
  );
}
