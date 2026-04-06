"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Navbar } from "@/components/navbar";
import { colleges, courses, normalizeText, type College, type Course } from "@/lib/site-data";

type ExploreClientProps = {
  query: string;
  initialView?: string;
  cityFilter?: string;
  collegeFilter?: string;
  collegesData?: College[];
  coursesData?: Course[];
};

export function ExploreClient({
  query,
  initialView = "",
  cityFilter = "",
  collegeFilter = "",
  collegesData = colleges,
  coursesData = courses,
}: ExploreClientProps) {
  const router = useRouter();
  const searchText = normalizeText(query);
  const safeInitialView =
    initialView === "colleges" || initialView === "courses" || initialView === "home"
      ? initialView
      : "home";
  const [viewMode, setViewMode] = useState<"home" | "colleges" | "courses">(safeInitialView);
  const [showBestOnly, setShowBestOnly] = useState(false);
  const [homeCollegePage, setHomeCollegePage] = useState(0);
  const [allCollegePage, setAllCollegePage] = useState(0);

  const groupedCourses = useMemo(() => {
    const grouped = new Map<string, typeof coursesData>();
    coursesData.forEach((course) => {
      const matches =
        !searchText ||
        normalizeText(`${course.course} ${course.college} ${course.university} ${course.specialization}`).includes(searchText);
      if (!matches) return;
      grouped.set(course.course, [...(grouped.get(course.course) || []), course]);
    });
    return [...grouped.entries()];
  }, [coursesData, searchText]);

  const filteredColleges = useMemo(() => {
    let data = collegesData;
    if (showBestOnly) data = data.filter((college) => college.isBestCollege);
    if (cityFilter) {
      const normalizedCity = normalizeText(cityFilter);
      data = data.filter(
        (college) =>
          normalizeText(college.district) === normalizedCity ||
          normalizeText(college.state) === normalizedCity,
      );
    }
    if (!searchText) return data;
    return data.filter((college) =>
      normalizeText(
        `${college.name} ${college.university} ${college.description} ${college.state} ${college.district}`,
      ).includes(searchText),
    );
  }, [cityFilter, collegesData, searchText, showBestOnly]);
  const selectedCollege = useMemo(() => {
    if (!collegeFilter) return null;
    const normalizedCollege = normalizeText(collegeFilter);
    return filteredColleges.find(
      (college) => normalizeText(college.name) === normalizedCollege,
    ) || null;
  }, [collegeFilter, filteredColleges]);
  const orderedColleges = useMemo(() => {
    if (!selectedCollege) return filteredColleges;
    return [
      selectedCollege,
      ...filteredColleges.filter((college) => college.id !== selectedCollege.id),
    ];
  }, [filteredColleges, selectedCollege]);
  const bestColleges = useMemo(
    () => orderedColleges.filter((college) => college.isBestCollege),
    [orderedColleges],
  );
  const collegesPerPage = 10;
  const totalBestCollegePages = Math.max(1, Math.ceil(bestColleges.length / collegesPerPage));
  const totalCollegePages = Math.max(1, Math.ceil(filteredColleges.length / collegesPerPage));
  const currentHomeCollegePage = Math.min(homeCollegePage, totalBestCollegePages - 1);
  const currentAllCollegePage = Math.min(allCollegePage, totalCollegePages - 1);
  const visibleBestColleges = bestColleges.slice(
    currentHomeCollegePage * collegesPerPage,
    currentHomeCollegePage * collegesPerPage + collegesPerPage,
  );
  const visibleColleges = orderedColleges.slice(
    currentAllCollegePage * collegesPerPage,
    currentAllCollegePage * collegesPerPage + collegesPerPage,
  );

  return (
    <section className="min-h-screen bg-[linear-gradient(180deg,#eef4fb_0%,#e7eef8_100%)] text-[color:var(--text-dark)]">
      <div className="relative border-b border-[rgba(15,76,129,0.08)] pb-6">
        <div className="absolute inset-0">
          <div className="absolute left-[-4rem] top-8 h-56 w-56 rounded-full bg-[rgba(60,126,182,0.1)] blur-3xl" />
          <div className="absolute right-[-3rem] top-20 h-48 w-48 rounded-full bg-[rgba(255,138,61,0.12)] blur-3xl" />
        </div>
        <div className="relative z-10">
          <Navbar />
          <div className="page-container pt-5 pb-3">
            <div className="mx-auto max-w-6xl">
            <h1 className="text-xl font-bold text-[color:var(--text-dark)] md:text-3xl">Explore Education</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[color:var(--text-muted)]">
              Discover top colleges and best-fit courses for your education journey.
            </p>
            </div>
          </div>
        </div>
      </div>

      <div className="page-container py-5">
        <div className="mx-auto max-w-6xl">
        {cityFilter ? (
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-[rgba(15,76,129,0.12)] bg-[rgba(15,76,129,0.06)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--brand-primary)]">
              City: {cityFilter}
            </span>
            {collegeFilter ? (
              <span className="rounded-full border border-[rgba(255,138,61,0.18)] bg-[rgba(255,138,61,0.08)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--brand-accent-deep)]">
                College: {collegeFilter}
              </span>
            ) : null}
          </div>
        ) : null}

        <div className="mb-5 flex gap-3 border-b border-[rgba(15,76,129,0.08)]">
          {[
            { key: "home", label: "Home" },
            { key: "colleges", label: "All Colleges" },
            { key: "courses", label: "All Courses" },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setViewMode(tab.key as "home" | "colleges" | "courses")}
              className={`pb-3 text-sm font-semibold transition ${
                viewMode === tab.key
                  ? "border-b-2 border-[color:var(--brand-primary)] text-[color:var(--brand-primary)]"
                  : "text-[color:var(--text-muted)] hover:text-[color:var(--text-dark)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {viewMode === "home" ? (
          <div>
            <div className="mb-12">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-[color:var(--text-dark)] md:text-xl">Top Courses</h2>
                <button type="button" onClick={() => setViewMode("courses")} className="text-sm font-semibold text-[color:var(--brand-primary)] hover:text-[color:var(--brand-primary-soft)]">
                  View More &rarr;
                </button>
              </div>

              <div className="overflow-x-auto rounded-[1.1rem] border border-[rgba(15,76,129,0.08)] bg-white shadow-[0_14px_30px_rgba(22,50,79,0.05)]">
                <table className="w-full min-w-[680px] text-left text-[13px]">
                  <thead className="bg-[rgba(15,76,129,0.05)] text-[color:var(--text-dark)]">
                    <tr>
                      <th className="px-3 py-2">Course</th>
                      <th className="px-3 py-2">Total Fees</th>
                      <th className="px-3 py-2">Cutoff</th>
                      <th className="px-3 py-2">Duration</th>
                      <th className="px-3 py-2">Top</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedCourses
                      .filter(([, rows]) => rows.some((row) => row.isTopCourse))
                      .slice(0, 10)
                      .map(([courseName, rows]) => {
                        const fees = rows.map((item) => item.totalFees);
                        const cutoffs = rows.map((item) => item.cutoff);
                        const durations = [...new Set(rows.map((item) => item.duration))];
                        return (
                          <tr
                            key={courseName}
                            className="cursor-pointer border-t border-[rgba(15,76,129,0.08)] text-[color:var(--text-dark)] hover:bg-[rgba(15,76,129,0.03)]"
                            onClick={() => router.push(`/explore/course/${encodeURIComponent(courseName)}`)}
                          >
                            <td className="px-3 py-2 text-[13px] font-semibold">{courseName}</td>
                            <td className="px-3 py-2">
                              Rs. {Math.min(...fees).toLocaleString()} - {Math.max(...fees).toLocaleString()}
                            </td>
                            <td className="px-3 py-2">
                              {Math.min(...cutoffs)} - {Math.max(...cutoffs)}
                            </td>
                            <td className="px-3 py-2">{durations.join(", ")}</td>
                            <td className="px-3 py-2">Top</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-[color:var(--text-dark)] md:text-xl">Best Colleges</h2>
                <div className="flex items-center gap-2">
                  <span className="rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-white px-3 py-2 text-sm font-semibold text-[color:var(--brand-primary)]">
                    Colleges: {bestColleges.length}
                  </span>
                  <div className="flex items-center gap-2 rounded-full border border-[rgba(15,76,129,0.12)] bg-white px-3 py-2 text-xs font-semibold text-[color:var(--brand-primary)]">
                    <span>Page</span>
                    <select
                      value={currentHomeCollegePage}
                      onChange={(event) => setHomeCollegePage(Number(event.target.value))}
                      className="bg-transparent text-xs font-semibold text-[color:var(--text-dark)] outline-none"
                    >
                      {Array.from({ length: totalBestCollegePages }, (_, index) => {
                        const start = index * collegesPerPage + 1;
                        const end = Math.min((index + 1) * collegesPerPage, bestColleges.length);
                        return (
                          <option key={`best-page-${index}`} value={index}>
                            {start}-{end}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
              </div>
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {visibleBestColleges.map((college) => (
                    <div
                      key={college.id}
                      onClick={() => router.push(`/college/${college.id}`)}
                      className="group cursor-pointer overflow-hidden rounded-[1.15rem] border border-[rgba(15,76,129,0.08)] bg-white shadow-[0_14px_30px_rgba(22,50,79,0.05)] transition hover:-translate-y-0.5 hover:border-[rgba(255,138,61,0.28)]"
                    >
                      <div className="relative h-36 overflow-hidden bg-slate-100">
                        <img src={college.image} alt={college.name} className="h-full w-full object-cover transition group-hover:scale-105" />
                      </div>
                      <div className="p-3.5">
                        <h3 className="text-sm font-bold text-[color:var(--text-dark)] md:text-[15px]">{college.name}</h3>
                        <p className="mt-1 text-[11px] text-[color:var(--text-muted)]">{college.university}</p>
                        <p className="mt-2 line-clamp-2 text-[13px] leading-5 text-[color:var(--text-muted)]">{college.description}</p>
                        <div className="mt-2 inline-block rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-700">
                          Best College
                        </div>
                        <p className="mt-3 text-[11px] text-[color:var(--text-muted)]">{college.district}, {college.state}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        ) : null}

        {viewMode === "colleges" ? (
          <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-[color:var(--text-dark)] md:text-xl">All Colleges</h2>
              <div className="flex items-center gap-2">
                <span className="rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-white px-3 py-2 text-sm font-semibold text-[color:var(--brand-primary)]">
                  Colleges: {filteredColleges.length}
                </span>
                <div className="flex items-center gap-2 rounded-full border border-[rgba(15,76,129,0.12)] bg-white px-3 py-2 text-xs font-semibold text-[color:var(--brand-primary)]">
                  <span>Page</span>
                  <select
                    value={currentAllCollegePage}
                    onChange={(event) => setAllCollegePage(Number(event.target.value))}
                    className="bg-transparent text-xs font-semibold text-[color:var(--text-dark)] outline-none"
                  >
                    {Array.from({ length: totalCollegePages }, (_, index) => {
                      const start = index * collegesPerPage + 1;
                      const end = Math.min((index + 1) * collegesPerPage, filteredColleges.length);
                      return (
                        <option key={`page-${index}`} value={index}>
                          {start}-{end}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
            </div>
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {visibleColleges.map((college) => {
                const isSelectedCollege = selectedCollege?.id === college.id;
                return (
                <div
                  key={college.id}
                  onClick={() => router.push(`/college/${college.id}`)}
                  className={`group cursor-pointer overflow-hidden rounded-[1.15rem] border bg-white shadow-[0_14px_30px_rgba(22,50,79,0.05)] transition hover:-translate-y-0.5 ${
                    isSelectedCollege
                      ? "border-[rgba(255,138,61,0.45)] ring-1 ring-[rgba(255,138,61,0.2)]"
                      : "border-[rgba(15,76,129,0.08)] hover:border-[rgba(255,138,61,0.28)]"
                  }`}
                >
                  <div className="relative h-36 overflow-hidden bg-slate-100">
                    <img src={college.image} alt={college.name} className="h-full w-full object-cover transition group-hover:scale-105" />
                    {college.isBestCollege ? (
                      <div className="absolute right-2 top-2 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-700">
                        Best
                      </div>
                    ) : null}
                    {isSelectedCollege ? (
                      <div className="absolute left-2 top-2 rounded-full bg-[rgba(255,138,61,0.12)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[color:var(--brand-accent-deep)]">
                        Selected
                      </div>
                    ) : null}
                  </div>
                  <div className="p-3.5">
                    <h3 className="text-sm font-bold text-[color:var(--text-dark)] md:text-[15px]">{college.name}</h3>
                    <p className="mt-1 text-[11px] text-[color:var(--text-muted)]">{college.university}</p>
                    <p className="mt-2 line-clamp-2 text-[13px] leading-5 text-[color:var(--text-muted)]">{college.description}</p>
                    <p className="mt-3 text-[11px] text-[color:var(--text-muted)]">{college.district}, {college.state}</p>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        router.push(`/college/${college.id}`);
                      }}
                      className="shine-button mt-4 w-full rounded-[1rem] bg-[color:var(--brand-primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[color:var(--brand-primary-soft)]"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              )})}
            </div>
          </div>
        ) : null}

        {viewMode === "courses" ? (
          <div>
              <h2 className="mb-5 text-lg font-bold text-[color:var(--text-dark)] md:text-xl">All Courses</h2>
            <div className="overflow-x-auto rounded-[1.1rem] border border-[rgba(15,76,129,0.08)] bg-white shadow-[0_14px_30px_rgba(22,50,79,0.05)]">
              <table className="w-full min-w-[680px] text-left text-[13px]">
                <thead className="bg-[rgba(15,76,129,0.05)] text-[color:var(--text-dark)]">
                  <tr>
                    <th className="px-3 py-2">Course</th>
                    <th className="px-3 py-2">Total Fees</th>
                    <th className="px-3 py-2">Cutoff</th>
                    <th className="px-3 py-2">Duration</th>
                    <th className="px-3 py-2">Top</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedCourses.map(([courseName, rows]) => {
                    const fees = rows.map((item) => item.totalFees);
                    const cutoffs = rows.map((item) => item.cutoff);
                    const durations = [...new Set(rows.map((item) => item.duration))];
                    const isTop = rows.some((item) => item.isTopCourse);
                    return (
                      <tr
                        key={courseName}
                        className="cursor-pointer border-t border-[rgba(15,76,129,0.08)] text-[color:var(--text-dark)] hover:bg-[rgba(15,76,129,0.03)]"
                        onClick={() => router.push(`/explore/course/${encodeURIComponent(courseName)}`)}
                      >
                        <td className="px-3 py-2 text-[13px] font-semibold">{courseName}</td>
                        <td className="px-3 py-2">
                          Rs. {Math.min(...fees).toLocaleString()} - {Math.max(...fees).toLocaleString()}
                        </td>
                        <td className="px-3 py-2">
                          {Math.min(...cutoffs)} - {Math.max(...cutoffs)}
                        </td>
                        <td className="px-3 py-2">{durations.join(", ")}</td>
                        <td className="px-3 py-2">{isTop ? "Top" : "-"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
        </div>
      </div>
    </section>
  );
}
