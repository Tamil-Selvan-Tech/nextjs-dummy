"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ChevronLeft,
  BookOpen,
  GraduationCap,
  MapPin,
  Search,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchPublicPanelData } from "@/lib/public-data";
import { colleges, courses } from "@/lib/site-data";

type SearchResultState = {
  courses: typeof courses;
  colleges: typeof colleges;
  cities: Array<{ id: string; name: string; state: string }>;
};

const normalizeText = (value: string) => String(value || "").trim().toLowerCase();

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialKeyword = searchParams.get("q") || "";
  const [keyword, setKeyword] = useState(initialKeyword);
  const [searchData, setSearchData] = useState<SearchResultState>({
    courses,
    colleges,
    cities: [],
  });

  useEffect(() => {
    let active = true;
    const loadData = async () => {
      try {
        const panelData = await fetchPublicPanelData();
        if (!active) return;
        const mappedCities = Array.from(
          new Map(
            panelData.colleges.map((college) => [
              `${college.district.toLowerCase()}-${college.state.toLowerCase()}`,
              {
                id: `${college.district.toLowerCase()}-${college.state.toLowerCase()}`,
                name: college.district,
                state: college.state,
              },
            ]),
          ).values(),
        );
        setSearchData({
          courses: panelData.courses.length ? panelData.courses : courses,
          colleges: panelData.colleges.length ? panelData.colleges : colleges,
          cities: mappedCities,
        });
      } catch {
        const fallbackCities = Array.from(
          new Map(
            colleges.map((college) => [
              `${college.district.toLowerCase()}-${college.state.toLowerCase()}`,
              {
                id: `${college.district.toLowerCase()}-${college.state.toLowerCase()}`,
                name: college.district,
                state: college.state,
              },
            ]),
          ).values(),
        );
        if (!active) return;
        setSearchData({
          courses,
          colleges,
          cities: fallbackCities,
        });
      }
    };

    void loadData();

    return () => {
      active = false;
    };
  }, []);

  const uniqueCourses = useMemo(
    () =>
      [
        ...new Map(
          searchData.courses.map((item) => [item.course.toLowerCase(), item]),
        ).values(),
      ],
    [searchData.courses],
  );

  const trendingSearchItems = useMemo(
    () =>
      [
        ...uniqueCourses.slice(0, 2).map((course) => ({ name: course.course, type: "Course" as const })),
        ...searchData.cities.slice(0, 1).map((city) => ({ name: city.name, type: "City" as const })),
        ...searchData.colleges.slice(0, 1).map((college) => ({ name: college.name, type: "College" as const })),
      ].filter(
        (item, index, list) =>
          list.findIndex(
            (candidate) =>
              candidate.type === item.type &&
              normalizeText(candidate.name) === normalizeText(item.name),
          ) === index,
      ),
    [searchData.cities, searchData.colleges, uniqueCourses],
  );

  const results = useMemo<SearchResultState>(() => {
    if (!keyword.trim()) {
      return { courses: [], colleges: [], cities: [] };
    }

    const query = normalizeText(keyword);
    return {
      courses: uniqueCourses
        .filter((course) => normalizeText(course.course).includes(query))
        .slice(0, 5),
      colleges: searchData.colleges
        .filter((college) => normalizeText(college.name).includes(query))
        .slice(0, 5),
      cities: searchData.cities
        .filter((city) => normalizeText(city.name).includes(query))
        .slice(0, 5),
    };
  }, [keyword, searchData.colleges, searchData.cities, uniqueCourses]);

  const handleSearch = () => {
    const value = keyword.trim();
    if (!value) return;

    const query = normalizeText(value);
    const matchedCourse = uniqueCourses.find((course) => normalizeText(course.course) === query);
    if (matchedCourse) {
      router.push(`/explore/course/${encodeURIComponent(matchedCourse.course)}`);
      return;
    }

    const matchedCollege = searchData.colleges.find((college) => normalizeText(college.name) === query);
    if (matchedCollege) {
      router.push(`/college/${matchedCollege.id}`);
      return;
    }

    const matchedCity = searchData.cities.find((city) => normalizeText(city.name) === query);
    if (matchedCity) {
      router.push(`/explore?q=${encodeURIComponent(matchedCity.name)}`);
      return;
    }

    router.push(`/search-results?q=${encodeURIComponent(value)}`);
  };

  const highlightText = (text: string) => {
    if (!keyword.trim()) return text;
    const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, index) => (
      <span
        key={`${text}-${index}`}
        className={
          normalizeText(part) === normalizeText(keyword)
            ? "font-semibold text-[color:var(--brand-accent-deep)]"
            : ""
        }
      >
        {part}
      </span>
    ));
  };

  return (
    <section className="section-shell min-h-screen overflow-hidden bg-[linear-gradient(180deg,#eef4fb_0%,#e7eef8_100%)] text-[color:var(--text-dark)]">
      <div className="absolute inset-0">
        <div className="absolute left-[-4rem] top-10 h-56 w-56 rounded-full bg-[rgba(60,126,182,0.1)] blur-3xl" />
        <div className="absolute right-[-3rem] top-16 h-44 w-44 rounded-full bg-[rgba(255,138,61,0.1)] blur-3xl" />
      </div>

      <div className="page-container relative z-10 flex min-h-screen items-start justify-center px-3 pb-8 pt-10 sm:px-4 sm:pb-10 sm:pt-16">
        <div className="w-full max-w-[54rem]">
          <div className="flex flex-col gap-3.5 rounded-[1.5rem] border border-[rgba(15,76,129,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(243,248,255,0.98))] p-3.5 text-[color:var(--text-dark)] shadow-[0_24px_56px_rgba(22,50,79,0.12)] sm:gap-4 sm:rounded-[1.75rem] sm:p-5">
            <div className="responsive-topbar">
              <Link
                href="/"
                className="inline-flex min-h-10 items-center justify-self-start gap-2 rounded-full border border-[rgba(15,76,129,0.1)] bg-white px-3 py-2 text-[11px] font-semibold text-[color:var(--brand-primary)] transition hover:bg-[rgba(15,76,129,0.04)] sm:min-h-0 sm:px-3.5 sm:py-1.5 sm:text-xs"
              >
                <ChevronLeft className="size-4" />
                <span className="hidden min-[380px]:inline">Back Home</span>
                <span className="min-[380px]:hidden">Back</span>
              </Link>
              <div className="flex justify-center">
                <span className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[rgba(15,76,129,0.08)] bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(236,245,255,0.96))] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[color:var(--brand-primary)] shadow-[0_12px_24px_rgba(22,50,79,0.06)] sm:min-h-0 sm:py-1.5 sm:text-[11px] sm:tracking-[0.16em]">
                  <Sparkles className="size-3.5 text-[color:var(--brand-accent)]" />
                  Smart Search
                </span>
              </div>
              <Link
                href={keyword.trim() ? `/search-results?q=${encodeURIComponent(keyword.trim())}` : "/search-results"}
                className="inline-flex min-h-10 items-center justify-self-end gap-2 rounded-full border border-[rgba(15,76,129,0.1)] bg-white px-3 py-2 text-[11px] font-semibold text-[color:var(--brand-primary)] transition hover:bg-[rgba(15,76,129,0.04)] sm:min-h-0 sm:px-3.5 sm:py-1.5 sm:text-xs"
              >
                <span className="hidden min-[380px]:inline">Explore Results</span>
                <span className="min-[380px]:hidden">Explore</span>
                <ArrowRight className="size-4" />
              </Link>
            </div>

            <div className="rounded-[1.25rem] border border-[rgba(15,76,129,0.08)] bg-[linear-gradient(145deg,rgba(255,255,255,0.95),rgba(239,246,255,0.94))] p-3 shadow-[0_18px_38px_rgba(22,50,79,0.08)] sm:rounded-[1.5rem] sm:p-4">
              <div className="flex flex-col gap-2.5 md:flex-row md:gap-3">
                <div className="group relative flex-1">
                  <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[color:var(--brand-primary)] transition duration-200 group-focus-within:scale-110 group-focus-within:text-[color:var(--brand-accent)]" />
                  <input
                    type="text"
                    placeholder="Search colleges, courses, cities..."
                    value={keyword}
                    onChange={(event) => setKeyword(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        handleSearch();
                      }
                    }}
                    className="h-11 w-full rounded-[0.95rem] border border-[rgba(15,76,129,0.12)] bg-white pl-11 pr-4 text-[13px] text-[color:var(--text-dark)] outline-none transition placeholder:text-slate-400 focus:border-[rgba(255,138,61,0.46)] focus:shadow-[0_0_0_4px_rgba(255,138,61,0.12)] sm:rounded-[1rem]"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSearch}
                  className="shine-button inline-flex h-11 w-full shrink-0 items-center justify-center rounded-[0.95rem] bg-[color:var(--brand-accent)] text-white transition duration-200 hover:-translate-y-0.5 hover:bg-[color:var(--brand-accent-deep)] md:h-11 md:w-auto md:gap-2 md:rounded-[1rem] md:px-5"
                  aria-label="Search"
                >
                  <Search className="size-4 transition duration-200 group-hover:scale-110" />
                  <span>Search</span>
                </button>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  "MBA colleges in Chennai",
                  "B.Tech",
                  "Medical colleges",
                ].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setKeyword(item)}
                    className="inline-flex min-h-9 items-center rounded-full border border-[rgba(15,76,129,0.08)] bg-white px-3 py-1.5 text-[10px] font-semibold text-[color:var(--brand-primary)] transition duration-200 hover:-translate-y-0.5 hover:border-[rgba(255,138,61,0.26)] hover:text-[color:var(--brand-accent-deep)] sm:text-[11px]"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-1 rounded-[1.2rem] border border-[rgba(15,76,129,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,249,255,0.96))] p-3.5 shadow-[0_20px_44px_rgba(22,50,79,0.08)] sm:mt-4 sm:rounded-[1.4rem] sm:p-5">
              {!keyword.trim() ? (
                <div>
                  <div className="mb-3 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--text-muted)] sm:mb-4 sm:text-[11px] sm:tracking-[0.18em]">
                    <TrendingUp className="size-4 text-[color:var(--brand-accent)]" />
                    Trending Searches
                  </div>

                  <div className="space-y-2.5">
                    {trendingSearchItems.map((item) => (
                      <button
                        key={`${item.type}-${normalizeText(item.name)}`}
                        type="button"
                        onClick={() => setKeyword(item.name)}
                        className="group flex w-full items-start justify-between gap-3 rounded-[0.95rem] border border-[rgba(15,76,129,0.06)] bg-white px-3 py-2.5 text-left transition duration-200 hover:-translate-y-0.5 hover:border-[rgba(255,138,61,0.26)] hover:bg-[rgba(15,76,129,0.03)] sm:items-center sm:rounded-[1rem]"
                      >
                        <span className="pr-2 text-[12px] font-medium leading-5 text-[color:var(--text-dark)] transition duration-200 group-hover:translate-x-1 sm:text-[13px]">
                          {item.name}
                        </span>
                        <span className="shrink-0 rounded-full bg-[rgba(15,76,129,0.05)] px-2.5 py-1 text-[10px] font-semibold text-[color:var(--brand-primary)]">
                          {item.type}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  {results.courses.length > 0 ? (
                    <div>
                      <div className="mb-3 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
                        <BookOpen className="size-4 text-[color:var(--brand-accent)]" />
                        Courses
                      </div>
                      <div className="space-y-2.5">
                        {results.courses.map((course) => (
                          <button
                            key={course.id}
                            type="button"
                            onClick={() => router.push(`/explore/course/${encodeURIComponent(course.course)}`)}
                            className="group flex w-full items-start justify-between gap-3 rounded-[0.95rem] border border-[rgba(15,76,129,0.06)] bg-white px-3 py-2.5 text-left transition duration-200 hover:-translate-y-0.5 hover:border-[rgba(255,138,61,0.26)] hover:bg-[rgba(15,76,129,0.03)] sm:items-center sm:rounded-[1rem]"
                          >
                            <div className="min-w-0">
                              <p className="text-[12px] font-medium leading-5 text-[color:var(--text-dark)] transition duration-200 group-hover:translate-x-1 sm:text-[13px]">
                                {highlightText(course.course)}
                              </p>
                              <p className="mt-0.5 text-[10px] text-[color:var(--text-muted)]">{course.college}</p>
                            </div>
                            <ArrowRight className="mt-0.5 size-4 shrink-0 text-[color:var(--brand-primary-soft)] transition duration-200 group-hover:translate-x-1 group-hover:text-[color:var(--brand-accent)] sm:mt-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {results.colleges.length > 0 ? (
                    <div>
                      <div className="mb-3 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
                        <GraduationCap className="size-4 text-[color:var(--brand-accent)]" />
                        Colleges
                      </div>
                      <div className="space-y-2.5">
                        {results.colleges.map((college) => (
                          <button
                            key={college.id}
                            type="button"
                            onClick={() => router.push(`/college/${college.id}`)}
                            className="group flex w-full items-start justify-between gap-3 rounded-[0.95rem] border border-[rgba(15,76,129,0.06)] bg-white px-3 py-2.5 text-left transition duration-200 hover:-translate-y-0.5 hover:border-[rgba(255,138,61,0.26)] hover:bg-[rgba(15,76,129,0.03)] sm:items-center sm:rounded-[1rem]"
                          >
                            <div className="min-w-0">
                              <p className="text-[12px] font-medium leading-5 text-[color:var(--text-dark)] transition duration-200 group-hover:translate-x-1 sm:text-[13px]">
                                {highlightText(college.name)}
                              </p>
                              <p className="mt-0.5 text-[10px] text-[color:var(--text-muted)]">{college.university}</p>
                            </div>
                            <ArrowRight className="mt-0.5 size-4 shrink-0 text-[color:var(--brand-primary-soft)] transition duration-200 group-hover:translate-x-1 group-hover:text-[color:var(--brand-accent)] sm:mt-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {results.cities.length > 0 ? (
                    <div>
                      <div className="mb-3 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
                        <MapPin className="size-4 text-[color:var(--brand-accent)]" />
                        Cities
                      </div>
                      <div className="space-y-2.5">
                        {results.cities.map((city) => (
                          <button
                            key={city.id}
                            type="button"
                            onClick={() => router.push(`/explore?q=${encodeURIComponent(city.name)}`)}
                            className="group flex w-full items-start justify-between gap-3 rounded-[0.95rem] border border-[rgba(15,76,129,0.06)] bg-white px-3 py-2.5 text-left transition duration-200 hover:-translate-y-0.5 hover:border-[rgba(255,138,61,0.26)] hover:bg-[rgba(15,76,129,0.03)] sm:items-center sm:rounded-[1rem]"
                          >
                            <div className="min-w-0">
                              <p className="text-[12px] font-medium leading-5 text-[color:var(--text-dark)] transition duration-200 group-hover:translate-x-1 sm:text-[13px]">
                                {highlightText(city.name)}
                              </p>
                              <p className="mt-0.5 text-[10px] text-[color:var(--text-muted)]">{city.state}</p>
                            </div>
                            <ArrowRight className="mt-0.5 size-4 shrink-0 text-[color:var(--brand-primary-soft)] transition duration-200 group-hover:translate-x-1 group-hover:text-[color:var(--brand-accent)] sm:mt-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {!results.courses.length && !results.colleges.length && !results.cities.length ? (
                    <div className="rounded-[1rem] border border-dashed border-[rgba(15,76,129,0.14)] bg-[rgba(15,76,129,0.03)] px-4 py-7 text-center text-[11px] text-[color:var(--text-muted)]">
                      No matching results. Try another keyword or continue with explore search.
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
