"use client";

import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { colleges, courses, normalizeText, toNumber } from "@/lib/site-data";

type CutoffClientProps = {
  selectedLevel: string;
  selectedDegree: string;
  selectedCourse: string;
  selectedSpecialization: string;
  enteredCutoff: string;
};

export function CutoffClient({
  selectedLevel,
  selectedDegree,
  selectedCourse,
  selectedSpecialization,
  enteredCutoff,
}: CutoffClientProps) {
  const router = useRouter();
  const enteredCutoffNumber = toNumber(enteredCutoff);
  const isLevel11 = selectedLevel === "11";

  const filteredRows = courses
    .filter((course) => {
      const haystack = `${course.course} ${course.courseCategory} ${course.specialization}`.toLowerCase();
      if (selectedDegree && !haystack.includes(normalizeText(selectedDegree))) return false;
      if (selectedCourse && !haystack.includes(normalizeText(selectedCourse))) return false;
      if (selectedSpecialization && !haystack.includes(normalizeText(selectedSpecialization))) return false;
      return true;
    })
    .flatMap((course) =>
      course.collegeDetails.map((detail) => {
        const college = colleges.find((item) => item.id === detail.college);
        if (!college) return null;
        return { ...college, cutoff: detail.cutoff };
      }),
    )
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  const recommendedColleges = Number.isNaN(enteredCutoffNumber)
    ? []
    : filteredRows.filter((item) => item.cutoff === enteredCutoffNumber);

  const betterColleges =
    isLevel11 && !Number.isNaN(enteredCutoffNumber)
      ? filteredRows.filter((item) => item.cutoff > enteredCutoffNumber)
      : [];

  return (
    <section className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <div className="page-container py-12 md:py-16">
        <p className="inline-flex rounded-full border border-cyan-300/40 bg-cyan-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
          Cutoff Page
        </p>
        <h1 className="mt-4 text-3xl font-bold md:text-5xl">College Cutoff Results</h1>

        <div className="mt-5 rounded-2xl border border-white/15 bg-white/5 p-4 text-sm text-slate-200 md:p-5">
          <p>Level: <span className="font-semibold text-white">{selectedLevel || "-"}</span></p>
          <p className="mt-1">Degree: <span className="font-semibold text-white">{selectedDegree || "-"}</span></p>
          <p className="mt-1">Course: <span className="font-semibold text-white">{selectedCourse || "-"}</span></p>
          <p className="mt-1">Specialization: <span className="font-semibold text-white">{selectedSpecialization || "-"}</span></p>
          <p className="mt-1">Entered Cutoff: <span className="font-semibold text-cyan-300">{enteredCutoff || "-"}</span></p>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-semibold text-white">Recommended Colleges For you</h2>
        </div>
        {recommendedColleges.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-white/15 bg-white/5 p-5">
            <p className="text-slate-200">No colleges found for this course and cutoff.</p>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {recommendedColleges.map((item) => (
              <article key={`recommended-${item.id}`} className="rounded-2xl border border-white/15 bg-white/5 p-5">
                <img src={item.image} alt={item.name} className="h-40 w-full rounded-xl object-cover" />
                <div className="mt-3 flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-white">{item.name}</h2>
                  {item.isBestCollege ? <span className="rounded-full bg-amber-400/20 px-2.5 py-1 text-xs font-semibold text-amber-300">Best College</span> : null}
                </div>
                <p className="mt-1 text-sm text-slate-300">{item.university}</p>
                <p className="mt-1 text-sm text-slate-400">{item.district}, {item.state}</p>
                <p className="mt-1 text-sm text-slate-200">College Cutoff: <span className="font-semibold text-cyan-300">{item.cutoff}</span></p>
              </article>
            ))}
          </div>
        )}

        {isLevel11 ? (
          <>
            <div className="mt-10">
              <h2 className="text-xl font-semibold text-white">Better Colleges If You Improve Your Score</h2>
            </div>
            {betterColleges.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-white/15 bg-white/5 p-5">
                <p className="text-slate-200">No higher cutoff colleges found for this selection.</p>
              </div>
            ) : (
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {betterColleges.map((item) => (
                  <article key={`better-${item.id}`} className="rounded-2xl border border-white/15 bg-white/5 p-5">
                    <img src={item.image} alt={item.name} className="h-40 w-full rounded-xl object-cover" />
                    <div className="mt-3 flex items-center gap-2">
                      <h2 className="text-lg font-semibold text-white">{item.name}</h2>
                      {item.isBestCollege ? <span className="rounded-full bg-amber-400/20 px-2.5 py-1 text-xs font-semibold text-amber-300">Best College</span> : null}
                    </div>
                    <p className="mt-1 text-sm text-slate-300">{item.university}</p>
                    <p className="mt-1 text-sm text-slate-400">{item.district}, {item.state}</p>
                    <p className="mt-1 text-sm text-slate-200">College Cutoff: <span className="font-semibold text-cyan-300">{item.cutoff}</span></p>
                  </article>
                ))}
              </div>
            )}
          </>
        ) : null}

        <button
          type="button"
          onClick={() => router.push("/find")}
          className="mt-8 rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-cyan-300"
        >
          Back to Find Page
        </button>
      </div>
    </section>
  );
}
