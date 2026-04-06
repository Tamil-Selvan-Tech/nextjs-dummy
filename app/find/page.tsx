"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Navbar } from "@/components/navbar";
import {
  courseSpecializationOptions,
  degreeCourseOptions,
  degreeOptions,
} from "@/lib/site-data";

export default function FindPage() {
  const router = useRouter();
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedDegree, setSelectedDegree] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("");
  const [cutoff, setCutoff] = useState("");

  const courseOptions = useMemo(
    () => (selectedDegree ? degreeCourseOptions[selectedDegree] || [] : []),
    [selectedDegree],
  );

  const specializationOptions = useMemo(
    () => (selectedCourse ? courseSpecializationOptions[selectedCourse] || [] : []),
    [selectedCourse],
  );

  return (
    <section className="min-h-screen bg-[linear-gradient(180deg,#eef4fb_0%,#e7eef8_100%)] text-[color:var(--text-dark)]">
      <Navbar />

      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute left-[-4rem] top-8 h-56 w-56 rounded-full bg-[rgba(60,126,182,0.1)] blur-3xl" />
          <div className="absolute right-[-3rem] top-20 h-48 w-48 rounded-full bg-[rgba(255,138,61,0.12)] blur-3xl" />
        </div>
        <div className="page-container relative z-10 py-8 md:py-10">
          <div className="mx-auto max-w-4xl">
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
              if (selectedLevel) params.set("level", selectedLevel);
              if (selectedDegree) params.set("degree", selectedDegree);
              if (selectedCourse) params.set("course", selectedCourse);
              if (selectedSpecialization) params.set("specialization", selectedSpecialization);
              if (cutoff) params.set("cutoff", cutoff);
              router.push(`/cutoff?${params.toString()}`);
            }}
            className="mt-7 rounded-[1.8rem] border border-[rgba(15,76,129,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,249,255,0.96))] p-5 shadow-[0_24px_56px_rgba(22,50,79,0.08)] md:p-6"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">Select Level</span>
                <select
                  value={selectedLevel}
                  onChange={(event) => setSelectedLevel(event.target.value)}
                  className="h-11 w-full rounded-[1rem] border border-[rgba(15,76,129,0.1)] bg-white px-3 text-sm text-[color:var(--text-dark)] outline-none focus:border-[color:var(--brand-primary-soft)]"
                  required
                >
                  <option value="">Choose level</option>
                  <option value="11">11</option>
                  <option value="12">12</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">Select Degree</span>
                <select
                  value={selectedDegree}
                  onChange={(event) => {
                    setSelectedDegree(event.target.value);
                    setSelectedCourse("");
                    setSelectedSpecialization("");
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

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">Select Course</span>
                <select
                  value={selectedCourse}
                  onChange={(event) => {
                    setSelectedCourse(event.target.value);
                    setSelectedSpecialization("");
                  }}
                  className="h-11 w-full rounded-[1rem] border border-[rgba(15,76,129,0.1)] bg-white px-3 text-sm text-[color:var(--text-dark)] outline-none transition disabled:cursor-not-allowed disabled:opacity-60 focus:border-[color:var(--brand-primary-soft)]"
                  disabled={!selectedDegree}
                  required
                >
                  <option value="">{selectedDegree ? "Choose course" : "Select degree first"}</option>
                  {courseOptions.map((course) => (
                    <option key={course} value={course}>
                      {course}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">Select Specialization</span>
                <select
                  value={selectedSpecialization}
                  onChange={(event) => setSelectedSpecialization(event.target.value)}
                  className="h-11 w-full rounded-[1rem] border border-[rgba(15,76,129,0.1)] bg-white px-3 text-sm text-[color:var(--text-dark)] outline-none transition disabled:cursor-not-allowed disabled:opacity-60 focus:border-[color:var(--brand-primary-soft)]"
                  disabled={!selectedCourse}
                  required
                >
                  <option value="">{selectedCourse ? "Choose specialization" : "Select course first"}</option>
                  {specializationOptions.map((specialization) => (
                    <option key={specialization} value={specialization}>
                      {specialization}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">Enter Cutoff</span>
                <input
                  type="number"
                  min="0"
                  max="600"
                  step="0.01"
                  value={cutoff}
                  onChange={(event) => setCutoff(event.target.value)}
                  placeholder="Example: 185.50"
                  className="h-11 w-full rounded-[1rem] border border-[rgba(15,76,129,0.1)] bg-white px-3 text-sm text-[color:var(--text-dark)] outline-none placeholder:text-[color:var(--text-muted)] focus:border-[color:var(--brand-primary-soft)]"
                  required
                />
              </label>
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
