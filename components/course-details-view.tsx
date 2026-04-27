"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Building2,
  ChevronDown,
  Filter,
  GraduationCap,
  MapPin,
  Search,
  Sparkles,
  Trophy,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import type { College, Course } from "@/lib/site-data";
import {
  formatCompactIndianCurrency,
  formatCompactIndianCurrencyRange,
} from "@/lib/currency-format";

type Filters = {
  search: string;
  location: string;
  feeMin: string;
  feeMax: string;
  cutoffMin: string;
  cutoffMax: string;
};

type CourseDetailsViewProps = {
  courseName: string;
  relatedCourses: Course[];
  collegesForCourse: College[];
};

const initialFilters: Filters = {
  search: "",
  location: "",
  feeMin: "",
  feeMax: "",
  cutoffMin: "",
  cutoffMax: "",
};

export function CourseDetailsView({
  courseName,
  relatedCourses,
  collegesForCourse,
}: CourseDetailsViewProps) {
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);

  const feeValues = relatedCourses.map((course) => course.totalFees);
  const cutoffValues = relatedCourses.map((course) => course.cutoff);
  const validCutoffValues = cutoffValues.filter((value) => Number.isFinite(value) && value > 0);
  const feeMin = Math.min(...feeValues);
  const feeMax = Math.max(...feeValues);
  const cutoffMin = validCutoffValues.length ? Math.min(...validCutoffValues) : Math.min(...cutoffValues);
  const cutoffMax = validCutoffValues.length ? Math.max(...validCutoffValues) : Math.max(...cutoffValues);
  const durations = [...new Set(relatedCourses.map((course) => course.duration).filter(Boolean))];
  const categories = [...new Set(relatedCourses.map((course) => course.courseCategory).filter(Boolean))];
  const locationOptions = [
    ...new Set(
      collegesForCourse
        .map((college) => [college.district, college.state].filter(Boolean).join(", "))
        .filter(Boolean),
    ),
  ].sort((a, b) => a.localeCompare(b));
  const collegeLookup = useMemo(
    () =>
      new Map(
        collegesForCourse.map((college) => [college.name.trim().toLowerCase(), college]),
      ),
    [collegesForCourse],
  );

  const collegeRows = useMemo(
    () =>
      relatedCourses.map((course) => {
        const college = collegeLookup.get(course.college.trim().toLowerCase());
        return {
          course,
          college,
          location: [college?.district, college?.state].filter(Boolean).join(", "),
        };
      }),
    [collegeLookup, relatedCourses],
  );
  const renderCutoffDetails = (course: Course) => {
    if (Array.isArray(course.cutoffByCategory) && course.cutoffByCategory.length > 0) {
      const cutoffItems = course.cutoffByCategory.filter((item) => item.category && item.cutoff);
      if (cutoffItems.length > 0) {
        return (
          <div className="grid grid-cols-2 gap-1.5">
            {cutoffItems.map((item) => (
              <span
                key={`${course.id}-${item.category}`}
                className="inline-flex items-center gap-1 rounded-full border border-[rgba(15,76,129,0.12)] bg-[rgba(15,76,129,0.04)] px-2.5 py-1 text-[11px] font-medium leading-4 text-[color:var(--text-dark)]"
              >
                <span className="font-semibold text-slate-700">{item.category}</span>
                <span className="text-slate-500">:</span>
                <span>{item.cutoff}</span>
              </span>
            ))}
          </div>
        );
      }
    }
    return <span>{course.cutoff ? String(course.cutoff) : "-"}</span>;
  };

  const filteredRows = useMemo(() => {
    return collegeRows.filter(({ course, college, location }) => {
      const matchesSearch = filters.search.trim()
        ? `${course.college} ${course.university} ${course.specialization}`
            .toLowerCase()
            .includes(filters.search.toLowerCase())
        : true;
      const matchesLocation = filters.location ? location === filters.location : true;
      const matchesFeeMin = filters.feeMin ? course.totalFees >= Number(filters.feeMin) : true;
      const matchesFeeMax = filters.feeMax ? course.totalFees <= Number(filters.feeMax) : true;
      const matchesCutoffMin = filters.cutoffMin ? course.cutoff >= Number(filters.cutoffMin) : true;
      const matchesCutoffMax = filters.cutoffMax ? course.cutoff <= Number(filters.cutoffMax) : true;
      return (
        matchesSearch &&
        matchesLocation &&
        matchesFeeMin &&
        matchesFeeMax &&
        matchesCutoffMin &&
        matchesCutoffMax &&
        Boolean(college)
      );
    });
  }, [collegeRows, filters]);

  return (
    <section className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#eef4fb_0%,#e7eef8_100%)] text-[color:var(--text-dark)]">
      <div className="absolute inset-0">
        <div className="absolute left-[-5rem] top-10 h-56 w-56 rounded-full bg-[rgba(60,126,182,0.1)] blur-3xl" />
        <div className="absolute right-[-4rem] top-24 h-52 w-52 rounded-full bg-[rgba(255,138,61,0.12)] blur-3xl" />
      </div>

      <div className="relative z-10">
        <Navbar />
        <div className="page-container py-8 md:py-12">
          <div className="mb-5">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-[rgba(15,76,129,0.08)] bg-white px-4 py-2 text-sm font-semibold text-[color:var(--brand-primary)] shadow-[0_12px_24px_rgba(22,50,79,0.05)] transition hover:-translate-y-0.5 hover:bg-[rgba(15,76,129,0.04)]"
            >
              <ArrowLeft className="size-4" />
              Back to Home
            </Link>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-[rgba(15,76,129,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(243,248,255,0.98))] shadow-[0_24px_56px_rgba(22,50,79,0.12)]">
            <div className="grid gap-6 p-5 md:p-8 xl:grid-cols-[1.1fr_0.9fr]">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-[rgba(15,76,129,0.06)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--brand-primary)]">
                  <Sparkles className="size-3.5" />
                  Course Overview
                </div>
                <h1 className="mt-4 text-2xl font-bold md:text-4xl">{courseName}</h1>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-[color:var(--text-muted)] md:text-[15px]">
                  Compare the same course across colleges, scan fees and cutoff ranges, and jump faster into the college that best fits your shortlist.
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {[
                    { label: "Course Duration", value: durations.join(" / ") || "Not available", icon: GraduationCap },
                    {
                      label: "Fees Range",
                      value: formatCompactIndianCurrencyRange(Math.min(...feeValues), Math.max(...feeValues)),
                      icon: Trophy,
                    },
                    { label: "Cutoff Range", value: `${Math.min(...cutoffValues)} - ${Math.max(...cutoffValues)}`, icon: BadgeCheck },
                    { label: "College Options", value: String(collegesForCourse.length), icon: Building2 },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <article
                        key={item.label}
                        className="flex min-h-[120px] flex-col justify-between rounded-[1.2rem] border border-[rgba(15,76,129,0.08)] bg-white px-4 py-4 shadow-[0_14px_30px_rgba(22,50,79,0.05)]"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
                            {item.label}
                          </p>
                          <div className="rounded-xl bg-[rgba(15,76,129,0.08)] p-2.5 text-[color:var(--brand-primary)]">
                            <Icon className="size-4" />
                          </div>
                        </div>
                        <p className="mt-3 text-[15px] font-semibold leading-6 text-[color:var(--text-dark)] [text-wrap:balance]">
                          {item.value}
                        </p>
                      </article>
                    );
                  })}
                </div>
              </div>

              <aside className="rounded-[1.6rem] border border-[rgba(255,138,61,0.14)] bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(255,244,236,0.94))] p-5 shadow-[0_18px_40px_rgba(255,138,61,0.09)]">
                <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--brand-accent-deep)]">Quick Read</p>
                <h2 className="mt-3 text-lg font-bold text-[color:var(--text-dark)] md:text-xl">Why this course shortlist helps</h2>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-[color:var(--text-muted)]">
                  <li>Track which colleges offer the same course with different fee and cutoff ranges.</li>
                  <li>Use location and eligibility filters to reduce noisy results quickly.</li>
                  <li>Open a college profile directly from the results grid when one option stands out.</li>
                </ul>
                <div className="mt-5 flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <span
                      key={category}
                      className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[color:var(--brand-primary)] shadow-[0_10px_20px_rgba(22,50,79,0.04)]"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </aside>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Lowest Fees", value: formatCompactIndianCurrency(feeMin) },
              { label: "Highest Fees", value: formatCompactIndianCurrency(feeMax) },
              { label: "Lowest Cutoff", value: `${cutoffMin}` },
              { label: "Highest Cutoff", value: `${cutoffMax}` },
            ].map((item) => (
              <article
                key={item.label}
                className="rounded-[1.3rem] border border-[rgba(15,76,129,0.08)] bg-white p-5 shadow-[0_14px_30px_rgba(22,50,79,0.05)]"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
                  {item.label}
                </p>
                <p className="mt-2 text-base font-semibold text-[color:var(--brand-primary)] md:text-lg">{item.value}</p>
              </article>
            ))}
          </div>

          <div className="mt-8 rounded-[1.8rem] border border-[rgba(15,76,129,0.08)] bg-white/90 p-5 shadow-[0_24px_56px_rgba(22,50,79,0.08)] md:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-bold text-[color:var(--text-dark)] md:text-2xl">Colleges Offering {courseName}</h2>
                <p className="mt-1 text-sm text-[color:var(--text-muted)]">
                  {filteredRows.length} visible result{filteredRows.length === 1 ? "" : "s"} across {collegesForCourse.length} colleges.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsFiltersOpen((prev) => !prev)}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[rgba(15,76,129,0.1)] bg-[rgba(15,76,129,0.03)] px-4 py-2 text-sm font-semibold text-[color:var(--brand-primary)] transition hover:bg-[rgba(15,76,129,0.06)]"
              >
                <Filter className="size-4" />
                {isFiltersOpen ? "Hide Filters" : "Show Filters"}
                <ChevronDown className={`size-4 transition ${isFiltersOpen ? "rotate-180" : ""}`} />
              </button>
            </div>

            {isFiltersOpen ? (
              <div className="mt-5 grid gap-3 rounded-[1.5rem] border border-[rgba(15,76,129,0.08)] bg-[linear-gradient(180deg,rgba(245,249,255,0.92),rgba(255,255,255,0.96))] p-4 md:grid-cols-2 xl:grid-cols-3">
                <label className="relative block">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[color:var(--text-muted)]" />
                  <input
                    type="text"
                    placeholder="Search college or specialization"
                    value={filters.search}
                    onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
                    className="h-11 w-full rounded-2xl border border-[rgba(15,76,129,0.08)] bg-white pl-10 pr-4 text-sm text-[color:var(--text-dark)] outline-none transition placeholder:text-[color:var(--text-muted)] focus:border-[rgba(15,76,129,0.25)]"
                  />
                </label>
                <select
                  value={filters.location}
                  onChange={(event) => setFilters((prev) => ({ ...prev, location: event.target.value }))}
                  className="h-11 rounded-2xl border border-[rgba(15,76,129,0.08)] bg-white px-4 text-sm text-[color:var(--text-dark)] outline-none transition focus:border-[rgba(15,76,129,0.25)]"
                >
                  <option value="">All locations</option>
                  {locationOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Min fees"
                  value={filters.feeMin}
                  onChange={(event) => setFilters((prev) => ({ ...prev, feeMin: event.target.value }))}
                  className="h-11 rounded-2xl border border-[rgba(15,76,129,0.08)] bg-white px-4 text-sm text-[color:var(--text-dark)] outline-none transition placeholder:text-[color:var(--text-muted)] focus:border-[rgba(15,76,129,0.25)]"
                />
                <input
                  type="number"
                  placeholder="Max fees"
                  value={filters.feeMax}
                  onChange={(event) => setFilters((prev) => ({ ...prev, feeMax: event.target.value }))}
                  className="h-11 rounded-2xl border border-[rgba(15,76,129,0.08)] bg-white px-4 text-sm text-[color:var(--text-dark)] outline-none transition placeholder:text-[color:var(--text-muted)] focus:border-[rgba(15,76,129,0.25)]"
                />
                <input
                  type="number"
                  placeholder="Min cutoff"
                  value={filters.cutoffMin}
                  onChange={(event) => setFilters((prev) => ({ ...prev, cutoffMin: event.target.value }))}
                  className="h-11 rounded-2xl border border-[rgba(15,76,129,0.08)] bg-white px-4 text-sm text-[color:var(--text-dark)] outline-none transition placeholder:text-[color:var(--text-muted)] focus:border-[rgba(15,76,129,0.25)]"
                />
                <input
                  type="number"
                  placeholder="Max cutoff"
                  value={filters.cutoffMax}
                  onChange={(event) => setFilters((prev) => ({ ...prev, cutoffMax: event.target.value }))}
                  className="h-11 rounded-2xl border border-[rgba(15,76,129,0.08)] bg-white px-4 text-sm text-[color:var(--text-dark)] outline-none transition placeholder:text-[color:var(--text-muted)] focus:border-[rgba(15,76,129,0.25)]"
                />
                <button
                  type="button"
                  onClick={() => setFilters(initialFilters)}
                  className="h-11 rounded-2xl border border-[rgba(255,138,61,0.16)] bg-[rgba(255,138,61,0.08)] px-4 text-sm font-semibold text-[color:var(--brand-accent-deep)] transition hover:bg-[rgba(255,138,61,0.12)]"
                >
                  Reset Filters
                </button>
              </div>
            ) : null}

            <div className="mt-6 grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
              {filteredRows.map(({ course, college, location }) =>
                college ? (
                  <article
                    key={course.id}
                    className="overflow-hidden rounded-[1.6rem] border border-[rgba(15,76,129,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(245,249,255,0.96))] shadow-[0_16px_36px_rgba(22,50,79,0.06)] transition hover:-translate-y-1 hover:shadow-[0_24px_48px_rgba(22,50,79,0.1)]"
                  >
                    <img src={college.image} alt={college.name} className="h-48 w-full object-cover" />
                    <div className="p-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-[rgba(15,76,129,0.06)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--brand-primary)]">
                          {course.courseCategory}
                        </span>
                        <span className="rounded-full bg-[rgba(255,138,61,0.1)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--brand-accent-deep)]">
                          {course.duration}
                        </span>
                      </div>
                      <h3 className="mt-4 text-lg font-bold text-[color:var(--text-dark)] md:text-xl">{college.name}</h3>
                      <p className="mt-1 text-sm text-[color:var(--text-muted)]">{college.university}</p>
                      <p className="mt-3 text-sm leading-6 text-[color:var(--text-muted)]">{course.specialization}</p>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-[1rem] border border-[rgba(15,76,129,0.08)] bg-white p-4">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">Total Fees</p>
                          <p className="mt-2 text-sm font-semibold text-[color:var(--text-dark)] md:text-base">{formatCompactIndianCurrency(course.totalFees)}</p>
                        </div>
                        <div className="rounded-[1rem] border border-[rgba(15,76,129,0.08)] bg-white p-4">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">Cutoff</p>
                          <div className="mt-2 text-sm font-semibold text-[color:var(--text-dark)] md:text-base">
                            {renderCutoffDetails(course)}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex items-start gap-2 text-sm text-[color:var(--text-muted)]">
                        <MapPin className="mt-0.5 size-4 shrink-0 text-[color:var(--brand-accent-deep)]" />
                        <span>{location || "Location not available"}</span>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-3">
                        <Link
                          href={`/college/${college.id}?course=${encodeURIComponent(course.course)}`}
                          className="shine-button inline-flex items-center justify-center gap-2 rounded-full bg-[#0f4c81] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0c3d6b]"
                        >
                          View College
                          <ArrowRight className="size-4" />
                        </Link>
                        <Link
                          href={`/compare?college=${encodeURIComponent(college.id)}`}
                          className="inline-flex items-center justify-center gap-2 rounded-full border border-[rgba(255,138,61,0.18)] bg-[rgba(255,138,61,0.08)] px-4 py-2.5 text-sm font-semibold text-[color:var(--brand-accent-deep)] transition hover:bg-[rgba(255,138,61,0.12)]"
                        >
                          Compare
                        </Link>
                      </div>
                    </div>
                  </article>
                ) : null,
              )}
            </div>

            {filteredRows.length === 0 ? (
              <div className="mt-6 rounded-[1.5rem] border border-dashed border-[rgba(15,76,129,0.14)] bg-[rgba(255,255,255,0.75)] px-5 py-10 text-center">
                <BookOpen className="mx-auto size-8 text-[color:var(--brand-primary)]" />
                <h3 className="mt-3 text-lg font-semibold text-[color:var(--text-dark)]">No colleges match these filters</h3>
                <p className="mt-2 text-sm text-[color:var(--text-muted)]">Try removing one or two filters to expand the course shortlist again.</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
