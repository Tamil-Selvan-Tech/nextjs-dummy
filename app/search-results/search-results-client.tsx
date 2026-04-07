"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  ChevronLeft,
  GraduationCap,
  MapPin,
  Search,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  colleges as fallbackColleges,
  courses as fallbackCourses,
  type College,
  type Course,
} from "@/lib/site-data";

const normalizeText = (value: string) => String(value || "").trim().toLowerCase();

const buildCityOptions = (colleges: College[]) =>
  Array.from(
    new Map(
      colleges.flatMap((college) => [
        [
          `${college.district.toLowerCase()}-${college.state.toLowerCase()}`,
          {
            id: `${college.district.toLowerCase()}-${college.state.toLowerCase()}`,
            name: college.district,
            state: college.state,
          },
        ],
        [
          `${college.state.toLowerCase()}-state`,
          {
            id: `${college.state.toLowerCase()}-state`,
            name: college.state,
            state: "State",
          },
        ],
      ]),
    ).values(),
  );

type SearchResultsClientProps = {
  collegesData?: College[];
  coursesData?: Course[];
};

type CourseGroup = {
  name: string;
  rows: Course[];
};

export function SearchResultsClient({
  collegesData = fallbackColleges,
  coursesData = fallbackCourses,
}: SearchResultsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialKeyword = searchParams.get("q") || "";
  const [searchInput, setSearchInput] = useState(initialKeyword);

  const colleges = collegesData.length ? collegesData : fallbackColleges;
  const courses = coursesData.length ? coursesData : fallbackCourses;
  const cityOptions = useMemo(() => buildCityOptions(colleges), [colleges]);

  const query = initialKeyword.trim();
  const normalizedQuery = normalizeText(query);

  const matchingCities = useMemo(() => {
    if (!normalizedQuery) return [];

    return cityOptions
      .filter((city) => normalizeText(`${city.name} ${city.state}`).includes(normalizedQuery))
      .slice(0, 18);
  }, [cityOptions, normalizedQuery]);

  const matchingColleges = useMemo(() => {
    if (!normalizedQuery) return [];

    return colleges
      .filter((college) =>
        normalizeText(
          `${college.name} ${college.university} ${college.description} ${college.district} ${college.state}`,
        ).includes(normalizedQuery),
      )
      .slice(0, 18);
  }, [colleges, normalizedQuery]);

  const matchingCourses = useMemo<CourseGroup[]>(() => {
    if (!normalizedQuery) return [];

    const grouped = new Map<string, Course[]>();

    courses
      .filter((course) =>
        normalizeText(
          `${course.course} ${course.college} ${course.university} ${course.specialization} ${course.courseCategory}`,
        ).includes(normalizedQuery),
      )
      .forEach((course) => {
        const key = course.course.trim();
        const current = grouped.get(key) || [];
        grouped.set(key, [...current, course]);
      });

    return [...grouped.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([name, rows]) => ({ name, rows }))
      .slice(0, 18);
  }, [courses, normalizedQuery]);

  const totalResults = matchingCities.length + matchingColleges.length + matchingCourses.length;

  const handleSubmit = () => {
    const value = searchInput.trim();
    router.push(value ? `/search-results?q=${encodeURIComponent(value)}` : "/search-results");
  };

  return (
    <section className="section-shell min-h-screen overflow-hidden bg-[linear-gradient(180deg,#eef4fb_0%,#e7eef8_100%)] text-[color:var(--text-dark)]">
      <div className="absolute inset-0">
        <div className="absolute left-[-4rem] top-8 h-56 w-56 rounded-full bg-[rgba(60,126,182,0.1)] blur-3xl" />
        <div className="absolute right-[-3rem] top-20 h-48 w-48 rounded-full bg-[rgba(255,138,61,0.12)] blur-3xl" />
      </div>

      <div className="page-container relative z-10 px-3 pb-10 pt-10 sm:px-4 sm:pt-14">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-[1.6rem] border border-[rgba(15,76,129,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(243,248,255,0.98))] p-3.5 shadow-[0_24px_56px_rgba(22,50,79,0.12)] sm:p-5">
            <div className="responsive-topbar">
              <Link
                href="/search"
                className="inline-flex min-h-10 items-center justify-self-start gap-2 rounded-full border border-[rgba(15,76,129,0.1)] bg-white px-3 py-2 text-[11px] font-semibold text-[color:var(--brand-primary)] transition hover:bg-[rgba(15,76,129,0.04)] sm:px-3.5 sm:py-1.5 sm:text-xs"
              >
                <ChevronLeft className="size-4" />
                <span className="hidden min-[380px]:inline">Back Search</span>
                <span className="min-[380px]:hidden">Back</span>
              </Link>
              <div className="flex justify-center">
                <span className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[rgba(15,76,129,0.08)] bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(236,245,255,0.96))] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[color:var(--brand-primary)] shadow-[0_12px_24px_rgba(22,50,79,0.06)] sm:py-1.5 sm:text-[11px]">
                  <Sparkles className="size-3.5 text-[color:var(--brand-accent)]" />
                  Search Results
                </span>
              </div>
              <Link
                href="/"
                className="inline-flex min-h-10 items-center justify-self-end gap-2 rounded-full border border-[rgba(15,76,129,0.1)] bg-white px-3 py-2 text-[11px] font-semibold text-[color:var(--brand-primary)] transition hover:bg-[rgba(15,76,129,0.04)] sm:px-3.5 sm:py-1.5 sm:text-xs"
              >
                <span className="hidden min-[380px]:inline">Back Home</span>
                <span className="min-[380px]:hidden">Home</span>
                <ArrowRight className="size-4" />
              </Link>
            </div>

            <div className="mt-3 rounded-[1.3rem] border border-[rgba(15,76,129,0.08)] bg-[linear-gradient(145deg,rgba(255,255,255,0.95),rgba(239,246,255,0.94))] p-3 shadow-[0_18px_38px_rgba(22,50,79,0.08)] sm:mt-4 sm:p-4">
              <div className="flex flex-col gap-2.5 md:flex-row md:gap-3">
                <div className="group relative flex-1">
                  <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[color:var(--brand-primary)] transition duration-200 group-focus-within:scale-110 group-focus-within:text-[color:var(--brand-accent)]" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        handleSubmit();
                      }
                    }}
                    placeholder="Search city, college, or course..."
                    className="h-11 w-full rounded-[0.95rem] border border-[rgba(15,76,129,0.12)] bg-white pl-11 pr-4 text-[13px] text-[color:var(--text-dark)] outline-none transition placeholder:text-slate-400 focus:border-[rgba(255,138,61,0.46)] focus:shadow-[0_0_0_4px_rgba(255,138,61,0.12)] sm:rounded-[1rem]"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="shine-button inline-flex h-11 w-full shrink-0 items-center justify-center rounded-[0.95rem] bg-[color:var(--brand-accent)] text-white transition duration-200 hover:-translate-y-0.5 hover:bg-[color:var(--brand-accent-deep)] md:w-auto md:gap-2 md:rounded-[1rem] md:px-5"
                  aria-label="Search Results"
                >
                  <Search className="size-4" />
                  <span>Search</span>
                </button>
              </div>

              <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
                {[
                  { label: "Cities", value: matchingCities.length },
                  { label: "Colleges", value: matchingColleges.length },
                  { label: "Courses", value: matchingCourses.length },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[1rem] border border-[rgba(15,76,129,0.06)] bg-white px-3 py-2.5"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--text-muted)]">
                      {item.label}
                    </p>
                    <p className="mt-1 text-lg font-semibold text-[color:var(--brand-primary)]">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 space-y-5">
              <div className="rounded-[1.35rem] border border-[rgba(15,76,129,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,249,255,0.96))] p-4 shadow-[0_20px_44px_rgba(22,50,79,0.08)] sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--text-muted)]">
                      Results Overview
                    </p>
                    <h1 className="mt-1 text-xl font-semibold text-[color:var(--text-dark)] sm:text-2xl">
                      {query ? `Results for "${query}"` : "Search Results"}
                    </h1>
                  </div>
                  <Link
                    href={query ? `/explore?q=${encodeURIComponent(query)}` : "/explore"}
                    className="inline-flex items-center gap-2 rounded-full border border-[rgba(15,76,129,0.1)] bg-white px-4 py-2 text-xs font-semibold text-[color:var(--brand-primary)] transition hover:bg-[rgba(15,76,129,0.04)]"
                  >
                    Open In Explore
                    <ArrowRight className="size-4" />
                  </Link>
                </div>

                <p className="mt-3 text-sm text-[color:var(--text-muted)]">
                  {query
                    ? `${totalResults} matching sections found across cities, colleges, and courses.`
                    : "Type a keyword to see matching cities, colleges, and courses."}
                </p>
              </div>

              <section className="rounded-[1.35rem] border border-[rgba(15,76,129,0.08)] bg-white/90 p-4 shadow-[0_18px_38px_rgba(22,50,79,0.06)] sm:p-5">
                <div className="mb-3 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
                  <MapPin className="size-4 text-[color:var(--brand-accent)]" />
                  Cities
                </div>
                {matchingCities.length ? (
                  <div className="flex flex-wrap gap-2.5">
                    {matchingCities.map((city) => (
                      <button
                        key={city.id}
                        type="button"
                        onClick={() => router.push(`/explore?q=${encodeURIComponent(city.name)}`)}
                        className="inline-flex items-center rounded-full border border-[rgba(15,76,129,0.08)] bg-[rgba(15,76,129,0.03)] px-3 py-2 text-[12px] font-semibold text-[color:var(--brand-primary)] transition duration-200 hover:-translate-y-0.5 hover:border-[rgba(255,138,61,0.26)] hover:text-[color:var(--brand-accent-deep)]"
                      >
                        {city.name}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[color:var(--text-muted)]">No matching cities.</p>
                )}
              </section>

              <section className="rounded-[1.35rem] border border-[rgba(15,76,129,0.08)] bg-white/90 p-4 shadow-[0_18px_38px_rgba(22,50,79,0.06)] sm:p-5">
                <div className="mb-3 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
                  <GraduationCap className="size-4 text-[color:var(--brand-accent)]" />
                  Colleges
                </div>
                {matchingColleges.length ? (
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {matchingColleges.map((college) => (
                      <button
                        key={college.id}
                        type="button"
                        onClick={() => router.push(`/college/${college.id}`)}
                        className="group rounded-[1.1rem] border border-[rgba(15,76,129,0.07)] bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(245,249,255,0.96))] p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:border-[rgba(255,138,61,0.22)] hover:shadow-[0_16px_28px_rgba(22,50,79,0.08)]"
                      >
                        <p className="text-sm font-semibold text-[color:var(--text-dark)] transition group-hover:text-[color:var(--brand-primary)]">
                          {college.name}
                        </p>
                        <p className="mt-1 text-[11px] text-[color:var(--text-muted)]">{college.university}</p>
                        <p className="mt-3 text-[11px] text-[color:var(--text-muted)]">
                          {college.district}, {college.state}
                        </p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[color:var(--text-muted)]">No matching colleges.</p>
                )}
              </section>

              <section className="rounded-[1.35rem] border border-[rgba(15,76,129,0.08)] bg-white/90 p-4 shadow-[0_18px_38px_rgba(22,50,79,0.06)] sm:p-5">
                <div className="mb-3 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
                  <BookOpen className="size-4 text-[color:var(--brand-accent)]" />
                  Courses
                </div>
                {matchingCourses.length ? (
                  <div className="space-y-2.5">
                    {matchingCourses.map((item) => (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => router.push(`/explore/course/${encodeURIComponent(item.name)}`)}
                        className="group flex w-full items-start justify-between gap-3 rounded-[1rem] border border-[rgba(15,76,129,0.06)] bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(245,249,255,0.96))] px-4 py-3 text-left transition duration-200 hover:-translate-y-0.5 hover:border-[rgba(255,138,61,0.24)] sm:items-center"
                      >
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-[color:var(--text-dark)] transition group-hover:text-[color:var(--brand-primary)]">
                            {item.name}
                          </p>
                          <p className="mt-0.5 text-[10px] text-[color:var(--text-muted)]">
                            {item.rows.length} result{item.rows.length > 1 ? "s" : ""}
                          </p>
                        </div>
                        <ArrowRight className="size-4 shrink-0 text-[color:var(--brand-primary-soft)] transition group-hover:translate-x-1 group-hover:text-[color:var(--brand-accent)]" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[color:var(--text-muted)]">No matching courses.</p>
                )}
              </section>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
