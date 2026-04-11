"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Navbar } from "@/components/navbar";
import { degreeOptions } from "@/lib/site-data";

export default function FindPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("11");
  const [selectedDegree, setSelectedDegree] = useState("Engineering");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [physicsMarks, setPhysicsMarks] = useState("");
  const [chemistryMarks, setChemistryMarks] = useState("");
  const [mathsMarks, setMathsMarks] = useState("");
  const [medicalMarks, setMedicalMarks] = useState("");
  const levelOptions = useMemo(() => ["6", "7", "8", "9", "10", "11", "12"], []);
  const isSeniorLevel = selectedLevel === "11" || selectedLevel === "12";

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
              if (selectedCategory) params.set("category", selectedCategory);
              if (selectedDegree === "Engineering" && isSeniorLevel) {
                if (physicsMarks) params.set("physics", physicsMarks);
                if (chemistryMarks) params.set("chemistry", chemistryMarks);
                if (mathsMarks) params.set("maths", mathsMarks);
              }
              if (selectedDegree === "Medical" && isSeniorLevel) {
                if (medicalMarks) params.set("marks", medicalMarks);
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
                  onChange={(event) => setSelectedLevel(event.target.value)}
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

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">Category</span>
                <select
                  value={selectedCategory}
                  onChange={(event) => setSelectedCategory(event.target.value)}
                  className="h-11 w-full rounded-[1rem] border border-[rgba(15,76,129,0.1)] bg-white px-3 text-sm text-[color:var(--text-dark)] outline-none focus:border-[color:var(--brand-primary-soft)]"
                  required
                >
                  <option value="">Select category</option>
                  <option value="General">General</option>
                  <option value="OBC">OBC</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                  <option value="EWS">EWS</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">Select Degree</span>
                <select
                  value={selectedDegree}
                  onChange={(event) => {
                    const value = event.target.value;
                    setSelectedDegree(value);
                    if (value !== "Engineering") {
                      setPhysicsMarks("");
                      setChemistryMarks("");
                      setMathsMarks("");
                    }
                    if (value !== "Medical") {
                      setMedicalMarks("");
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
                </>
              ) : null}

              {selectedDegree === "Medical" && isSeniorLevel ? (
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">Enter your mark</span>
                  <input
                    type="number"
                    min="0"
                    max="200"
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
