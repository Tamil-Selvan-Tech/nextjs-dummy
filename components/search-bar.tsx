"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  GraduationCap,
  MapPin,
  Search,
  TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { fetchPublicPanelData } from "@/lib/public-data";
import { colleges, courses } from "@/lib/site-data";
import { getRankedSearchResults, normalizeSearchText } from "@/lib/search-utils";

type SearchResultState = {
  courses: typeof courses;
  colleges: typeof colleges;
  cities: Array<{ id: string; name: string; state: string }>;
};

type SearchExam = {
  id: string;
  name: string;
  slug: string;
  href: string;
  logo: string;
  mode: string;
  level: string;
};

type RankedSearchState = SearchResultState & {
  exams: SearchExam[];
};

const NAVBAR_EXAMS: SearchExam[] = [
  {
    id: "jee-main",
    name: "JEE Main",
    slug: "jee-main",
    href: "/exams/jee-main",
    logo: "/exams/jee-main.svg",
    mode: "Online Exam",
    level: "National",
  },
  {
    id: "jee-advanced",
    name: "JEE Advanced",
    slug: "jee-advanced",
    href: "/exams/jee-advanced",
    logo: "/exams/jee-advanced.svg",
    mode: "Online Exam",
    level: "National",
  },
  {
    id: "cuet",
    name: "CUET",
    slug: "cuet",
    href: "/exams/cuet",
    logo: "/exams/cuet.svg",
    mode: "Offline Exam",
    level: "National",
  },
  {
    id: "neet",
    name: "NEET",
    slug: "neet",
    href: "/exams/neet",
    logo: "/exams/neet.svg",
    mode: "Offline Exam",
    level: "National",
  },
];

export function SearchBar() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [keyword, setKeyword] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [brokenCollegeLogos, setBrokenCollegeLogos] = useState<Record<string, boolean>>({});
  const [brokenExamLogos, setBrokenExamLogos] = useState<Record<string, boolean>>({});
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
              `${normalizeSearchText(college.district)}-${normalizeSearchText(college.state)}`,
              {
                id: `${normalizeSearchText(college.district)}-${normalizeSearchText(college.state)}`,
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
              `${normalizeSearchText(college.district)}-${normalizeSearchText(college.state)}`,
              {
                id: `${normalizeSearchText(college.district)}-${normalizeSearchText(college.state)}`,
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

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!containerRef.current?.contains(target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [isOpen]);

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
        ...NAVBAR_EXAMS.slice(0, 1).map((exam) => ({ name: exam.name, type: "Exam" as const })),
      ].filter(
        (item, index, list) =>
          list.findIndex(
            (candidate) =>
              candidate.type === item.type &&
              normalizeSearchText(candidate.name) === normalizeSearchText(item.name),
          ) === index,
      ),
    [searchData.cities, searchData.colleges, uniqueCourses],
  );

  const results = useMemo<RankedSearchState>(() => {
    if (!keyword.trim()) {
      return { courses: [], colleges: [], cities: [], exams: [] };
    }

    const ranked = getRankedSearchResults(keyword, searchData.colleges, uniqueCourses, searchData.cities);
    const normalizedQuery = normalizeSearchText(keyword);
    const queryTokens = normalizedQuery.split(" ").filter(Boolean);
    const rankedExams = NAVBAR_EXAMS.filter((exam) => {
      const examText = normalizeSearchText(`${exam.name} ${exam.slug} ${exam.mode} ${exam.level}`);
      return (
        examText.includes(normalizedQuery) ||
        queryTokens.some((token) => examText.includes(token))
      );
    })
      .sort((left, right) => {
        const leftText = normalizeSearchText(`${left.name} ${left.slug}`);
        const rightText = normalizeSearchText(`${right.name} ${right.slug}`);
        const leftScore =
          (leftText === normalizedQuery ? 200 : 0) +
          (leftText.includes(normalizedQuery) ? 80 : 0) +
          queryTokens.reduce((total, token) => total + (leftText.includes(token) ? 18 : 0), 0);
        const rightScore =
          (rightText === normalizedQuery ? 200 : 0) +
          (rightText.includes(normalizedQuery) ? 80 : 0) +
          queryTokens.reduce((total, token) => total + (rightText.includes(token) ? 18 : 0), 0);
        return rightScore - leftScore || left.name.localeCompare(right.name);
      })
      .slice(0, 5);

    return {
      courses: ranked.courses.slice(0, 5),
      colleges: ranked.colleges.slice(0, 5),
      cities: ranked.cities.slice(0, 5),
      exams: rankedExams,
    };
  }, [keyword, searchData.colleges, searchData.cities, uniqueCourses]);

  const handleSearch = () => {
    const value = keyword.trim();
    if (!value) return;

    const query = normalizeSearchText(value);
    const matchedCourse = uniqueCourses.find((course) => normalizeSearchText(course.course) === query);
    if (matchedCourse) {
      setIsOpen(false);
      router.push(`/explore/course/${encodeURIComponent(matchedCourse.course)}`);
      return;
    }

    const matchedCollege = searchData.colleges.find((college) => normalizeSearchText(college.name) === query);
    if (matchedCollege) {
      setIsOpen(false);
      router.push(`/college/${matchedCollege.id}`);
      return;
    }

    const matchedCity = searchData.cities.find((city) => normalizeSearchText(city.name) === query);
    if (matchedCity) {
      setIsOpen(false);
      router.push(`/explore?q=${encodeURIComponent(matchedCity.name)}`);
      return;
    }

    const matchedExam = NAVBAR_EXAMS.find(
      (exam) =>
        normalizeSearchText(exam.name) === query || normalizeSearchText(exam.slug) === query,
    );
    if (matchedExam) {
      setIsOpen(false);
      router.push(matchedExam.href);
      return;
    }

    setIsOpen(false);
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
          normalizeSearchText(part) === normalizeSearchText(keyword)
            ? "font-semibold text-[color:var(--brand-accent-deep)]"
            : ""
        }
      >
        {part}
      </span>
    ));
  };

  const hasSearchResults =
    results.courses.length ||
    results.colleges.length ||
    results.cities.length ||
    results.exams.length;
  const hasCourseResults = results.courses.length > 0;
  const hasCollegeResults = results.colleges.length > 0;
  const hasCityResults = results.cities.length > 0;
  const hasExamResults = results.exams.length > 0;
  const searchShellClassName =
    "group relative flex min-h-14 w-full items-center gap-2 rounded-full border border-[rgba(239,68,68,0.3)] bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(247,242,232,0.96))] pl-16 pr-2 text-left shadow-[0_18px_40px_rgba(8,17,31,0.12)] transition hover:border-[rgba(239,68,68,0.55)] hover:shadow-[0_22px_50px_rgba(8,17,31,0.18)] focus-within:border-[rgba(239,68,68,0.7)] focus-within:shadow-[0_22px_50px_rgba(8,17,31,0.18)]";

  const renderSearchShell = (autoFocus = false) => (
    <div className={searchShellClassName}>
      <span className="pointer-events-none absolute inset-y-1.5 left-1.5 flex items-center justify-center rounded-full bg-[linear-gradient(135deg,rgba(239,68,68,0.24),rgba(255,255,255,0.7))] px-3.5 text-[color:var(--brand-primary)] transition group-focus-within:scale-105 group-hover:scale-105">
        <Search className="size-[18px]" />
      </span>

      <input
        type="text"
        value={keyword}
        onChange={(event) => {
          setKeyword(event.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            handleSearch();
          }
        }}
        placeholder="Search colleges, courses, locations and exams"
        className="h-full min-w-0 flex-1 border-0 bg-transparent text-[15px] text-slate-700 outline-none placeholder:text-slate-500"
        aria-label="Search colleges, courses, locations and exams"
        autoFocus={autoFocus}
      />

      <button
        type="button"
        onClick={handleSearch}
        className="inline-flex h-10 shrink-0 items-center justify-center rounded-full bg-[color:var(--brand-accent)] px-4 text-xs font-semibold text-white transition hover:bg-[color:var(--brand-accent-deep)] sm:h-11 sm:min-w-[6.5rem] sm:px-5 sm:text-sm"
      >
        Search
      </button>
    </div>
  );

  return (
    <div
      ref={containerRef}
      className={isOpen ? "relative z-[240] w-full" : "relative w-full"}
    >
      {renderSearchShell()}

      {isOpen ? (
        <div className="fixed left-1/2 top-[7.5rem] z-[210] w-[calc(100vw-1.5rem)] max-w-[78rem] -translate-x-1/2 sm:top-[8rem] sm:w-[calc(100vw-2.5rem)] lg:top-[8.5rem] lg:w-[calc(100vw-4rem)]">
          <div className="max-h-[78vh] overflow-y-auto rounded-[1.35rem] border border-[rgba(15,76,129,0.1)] bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(244,249,255,0.98))] p-3 shadow-[0_26px_54px_rgba(22,50,79,0.18)] sm:p-3.5">
              {!keyword.trim() ? (
                <div>
                  <div className="mb-3 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--text-muted)]">
                    <TrendingUp className="size-4 text-[color:var(--brand-accent)]" />
                    Trending Searches
                  </div>

                  <div className="space-y-2.5">
                    {trendingSearchItems.map((item) => (
                      <button
                        key={`${item.type}-${normalizeSearchText(item.name)}`}
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
                  <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
                    {hasCourseResults ? (
                      <div className="rounded-[1rem] border border-[rgba(15,76,129,0.08)] bg-white/90 p-3 shadow-[0_10px_24px_rgba(15,76,129,0.06)]">
                        <div className="mb-3 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
                          <BookOpen className="size-4 text-[color:var(--brand-accent)]" />
                          Courses
                        </div>
                        <div className="space-y-2.5">
                          {results.courses.map((course) => (
                            <button
                              key={course.id}
                              type="button"
                              onClick={() => {
                                setIsOpen(false);
                                router.push(`/explore/course/${encodeURIComponent(course.course)}`);
                              }}
                              className="group flex w-full items-start justify-between gap-3 rounded-[0.95rem] border border-[rgba(15,76,129,0.06)] bg-white px-3 py-2.5 text-left transition duration-200 hover:-translate-y-0.5 hover:border-[rgba(255,138,61,0.26)] hover:bg-[rgba(15,76,129,0.03)] sm:items-center"
                            >
                              <div className="min-w-0">
                                <p className="text-[12px] font-medium leading-5 text-[color:var(--text-dark)] transition duration-200 group-hover:translate-x-1 sm:text-[13px]">
                                  {highlightText(course.course)}
                                </p>
                                <p className="mt-0.5 line-clamp-1 text-[10px] text-[color:var(--text-muted)]">{course.college}</p>
                              </div>
                              <ArrowRight className="mt-0.5 size-4 shrink-0 text-[color:var(--brand-primary-soft)] transition duration-200 group-hover:translate-x-1 group-hover:text-[color:var(--brand-accent)] sm:mt-0" />
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {hasCollegeResults ? (
                      <div className="rounded-[1rem] border border-[rgba(15,76,129,0.08)] bg-white/90 p-3 shadow-[0_10px_24px_rgba(15,76,129,0.06)]">
                        <div className="mb-3 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
                          <GraduationCap className="size-4 text-[color:var(--brand-accent)]" />
                          Colleges
                        </div>
                        <div className="space-y-2.5">
                          {results.colleges.map((college) => (
                            <button
                              key={college.id}
                              type="button"
                              onClick={() => {
                                setIsOpen(false);
                                router.push(`/college/${college.id}`);
                              }}
                              className="group flex w-full items-start justify-between gap-3 rounded-[0.95rem] border border-[rgba(15,76,129,0.06)] bg-white px-3 py-2.5 text-left transition duration-200 hover:-translate-y-0.5 hover:border-[rgba(255,138,61,0.26)] hover:bg-[rgba(15,76,129,0.03)] sm:items-center"
                            >
                              <div className="flex min-w-0 items-center gap-3">
                                {String(college.logo || college.image || "").trim() && !brokenCollegeLogos[college.id] ? (
                                  <span className="inline-flex h-10 w-10 shrink-0 overflow-hidden rounded-full border border-[rgba(15,76,129,0.12)] bg-white shadow-[0_6px_16px_rgba(15,76,129,0.08)]">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={String(college.logo || college.image || "")}
                                      alt={college.name}
                                      className="h-full w-full object-cover"
                                      onError={() =>
                                        setBrokenCollegeLogos((current) => ({
                                          ...current,
                                          [college.id]: true,
                                        }))
                                      }
                                    />
                                  </span>
                                ) : (
                                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgba(15,76,129,0.08)] text-[color:var(--brand-primary)]">
                                    <GraduationCap className="size-4.5" />
                                  </span>
                                )}
                                <div className="min-w-0">
                                  <p className="text-[12px] font-medium leading-5 text-[color:var(--text-dark)] transition duration-200 group-hover:translate-x-1 sm:text-[13px]">
                                    {highlightText(college.name)}
                                  </p>
                                  <p className="mt-0.5 line-clamp-1 text-[10px] text-[color:var(--text-muted)]">{college.university}</p>
                                </div>
                              </div>
                              <ArrowRight className="mt-0.5 size-4 shrink-0 text-[color:var(--brand-primary-soft)] transition duration-200 group-hover:translate-x-1 group-hover:text-[color:var(--brand-accent)] sm:mt-0" />
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {hasCityResults ? (
                      <div className="rounded-[1rem] border border-[rgba(15,76,129,0.08)] bg-white/90 p-3 shadow-[0_10px_24px_rgba(15,76,129,0.06)]">
                        <div className="mb-3 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
                          <MapPin className="size-4 text-[color:var(--brand-accent)]" />
                          Locations
                        </div>
                        <div className="space-y-2.5">
                          {results.cities.map((city) => (
                            <button
                              key={city.id}
                              type="button"
                              onClick={() => {
                                setIsOpen(false);
                                router.push(`/explore?q=${encodeURIComponent(city.name)}`);
                              }}
                              className="group flex w-full items-start justify-between gap-3 rounded-[0.95rem] border border-[rgba(15,76,129,0.06)] bg-white px-3 py-2.5 text-left transition duration-200 hover:-translate-y-0.5 hover:border-[rgba(255,138,61,0.26)] hover:bg-[rgba(15,76,129,0.03)] sm:items-center"
                            >
                              <div className="min-w-0">
                                <p className="text-[12px] font-medium leading-5 text-[color:var(--text-dark)] transition duration-200 group-hover:translate-x-1 sm:text-[13px]">
                                  {highlightText(city.name)}
                                </p>
                                <p className="mt-0.5 line-clamp-1 text-[10px] text-[color:var(--text-muted)]">{city.state}</p>
                              </div>
                              <ArrowRight className="mt-0.5 size-4 shrink-0 text-[color:var(--brand-primary-soft)] transition duration-200 group-hover:translate-x-1 group-hover:text-[color:var(--brand-accent)] sm:mt-0" />
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {hasExamResults ? (
                      <div className="rounded-[1rem] border border-[rgba(15,76,129,0.08)] bg-white/90 p-3 shadow-[0_10px_24px_rgba(15,76,129,0.06)]">
                        <div className="mb-3 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
                          <CalendarDays className="size-4 text-[color:var(--brand-accent)]" />
                          Exams
                        </div>
                        <div className="space-y-2.5">
                          {results.exams.map((exam) => (
                            <button
                              key={exam.id}
                              type="button"
                              onClick={() => {
                                setIsOpen(false);
                                router.push(exam.href);
                              }}
                              className="group flex w-full items-start justify-between gap-3 rounded-[0.95rem] border border-[rgba(15,76,129,0.06)] bg-white px-3 py-2.5 text-left transition duration-200 hover:-translate-y-0.5 hover:border-[rgba(255,138,61,0.26)] hover:bg-[rgba(15,76,129,0.03)] sm:items-center"
                            >
                              <div className="flex min-w-0 items-center gap-3">
                                {exam.logo && !brokenExamLogos[exam.id] ? (
                                  <span className="inline-flex h-10 w-10 shrink-0 overflow-hidden rounded-full border border-[rgba(15,76,129,0.12)] bg-white shadow-[0_6px_16px_rgba(15,76,129,0.08)]">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={exam.logo}
                                      alt={exam.name}
                                      className="h-full w-full object-cover"
                                      onError={() =>
                                        setBrokenExamLogos((current) => ({
                                          ...current,
                                          [exam.id]: true,
                                        }))
                                      }
                                    />
                                  </span>
                                ) : (
                                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgba(15,76,129,0.08)] text-[color:var(--brand-primary)]">
                                    <CalendarDays className="size-4.5" />
                                  </span>
                                )}
                                <div className="min-w-0">
                                  <p className="text-[12px] font-medium leading-5 text-[color:var(--text-dark)] transition duration-200 group-hover:translate-x-1 sm:text-[13px]">
                                    {highlightText(exam.name)}
                                  </p>
                                  <p className="mt-0.5 line-clamp-1 text-[10px] text-[color:var(--text-muted)]">
                                    {exam.mode} - {exam.level}
                                  </p>
                                </div>
                              </div>
                              <ArrowRight className="mt-0.5 size-4 shrink-0 text-[color:var(--brand-primary-soft)] transition duration-200 group-hover:translate-x-1 group-hover:text-[color:var(--brand-accent)] sm:mt-0" />
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {!hasSearchResults ? (
                    <div className="rounded-[1rem] border border-dashed border-[rgba(15,76,129,0.14)] bg-[rgba(15,76,129,0.03)] px-4 py-7 text-center text-[11px] text-[color:var(--text-muted)]">
                      No matching results. Try another keyword or continue with search results.
                    </div>
                  ) : null}
                </div>
              )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
