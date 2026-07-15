"use client";

import { useRouter } from "next/navigation";
import { startTransition, useEffect, useMemo, useState } from "react";
import { Navbar } from "@/components/navbar";
import {
  colleges,
  courses,
  formatCourseDisplayName,
  normalizeText,
  type College,
  type Course,
} from "@/lib/site-data";
import { fetchPublicSummaryData } from "@/lib/public-data";

type ExploreClientProps = {
  query: string;
  streamFilter?: string;
  initialView?: string;
  cityFilter?: string;
  collegeFilter?: string;
  collegesData?: College[];
  coursesData?: Course[];
};

const STREAM_QUERY_ALIASES: Record<string, string[]> = {
  Engineering: ["engineering", "be", "b.e", "btech", "b.tech", "mtech", "m.tech"],
  "Arts & Science": [
    "arts & science",
    "arts and science",
    "arts",
    "science",
    "bsc",
    "b.sc",
    "ba",
    "b.a",
    "bcom",
    "b.com",
    "bba",
    "bca",
    "msc",
    "m.sc",
    "computer applications",
    "management",
  ],
  Medical: ["medical", "paramedical", "mbbs", "bds", "bams", "bhms", "bums", "bpt", "bpharm", "mpharm"],
  Law: ["law", "llb", "ba llb", "ba_llb", "bba llb", "bba_llb", "llm"],
};

const normalizeSearchValue = (value: string) =>
  normalizeText(value).replace(/[^a-z0-9]+/g, " ").trim();

const matchesAlias = (value: string, alias: string) => {
  const normalizedValue = normalizeSearchValue(value);
  const normalizedAlias = normalizeSearchValue(alias);

  if (!normalizedValue || !normalizedAlias) return false;

  if (normalizedAlias.includes(" ")) {
    return normalizedValue.includes(normalizedAlias);
  }

  return normalizedValue.split(" ").includes(normalizedAlias);
};

const getMatchedStreamAliases = (query: string) => {
  const normalizedQuery = normalizeText(query);
  const matchedKey = Object.keys(STREAM_QUERY_ALIASES).find(
    (key) => normalizeText(key) === normalizedQuery,
  );

  return matchedKey ? STREAM_QUERY_ALIASES[matchedKey] : [];
};

const matchesStreamAliases = (value: string, aliases: string[]) =>
  aliases.some((alias) => matchesAlias(value, alias));

const matchesCourseQuery = (
  course: Course,
  searchText: string,
  matchedStreamAliases: string[],
  hasStreamFilter: boolean,
) => {
  const courseText = normalizeText(
    `${course.course} ${course.specialization} ${course.courseCategory} ${course.courseType} ${course.stream || ""} ${course.degreeType || ""} ${course.college} ${course.university}`,
  );
  const courseStreamText = normalizeText(
    `${course.course} ${course.specialization} ${course.courseCategory} ${course.courseType} ${course.stream || ""} ${course.degreeType || ""}`,
  );

  if (hasStreamFilter && matchedStreamAliases.length > 0) {
    return matchesStreamAliases(courseStreamText, matchedStreamAliases);
  }

  if (!searchText) return true;

  if (matchedStreamAliases.length > 0) {
    return matchesStreamAliases(courseText, matchedStreamAliases);
  }

  return courseText.includes(searchText);
};

const CollegeImage = ({ college }: { college: College }) => {
  const imageSrc = college.image?.trim();
  const initials = college.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");

  if (!imageSrc) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#f8fafc,#e0f2fe)] text-2xl font-extrabold text-[color:var(--brand-primary)]">
        {initials || "CE"}
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={college.name}
      className="h-full w-full object-cover transition group-hover:scale-105"
    />
  );
};

export function ExploreClient({
  query,
  streamFilter = "",
  initialView = "",
  cityFilter = "",
  collegeFilter = "",
  collegesData = colleges,
  coursesData = courses,
}: ExploreClientProps) {
  const router = useRouter();
  const searchText = normalizeText(query);
  const normalizedStreamFilter = normalizeText(streamFilter);
  const hasStreamFilter = Boolean(normalizedStreamFilter);
  const matchedStreamAliases = useMemo(
    () => getMatchedStreamAliases(hasStreamFilter ? streamFilter : query),
    [hasStreamFilter, query, streamFilter],
  );
  const safeInitialView =
    initialView === "colleges" || initialView === "courses" || initialView === "home"
      ? initialView
      : "home";
  const [viewMode, setViewMode] = useState<"home" | "colleges" | "courses">(safeInitialView);
  const [showBestOnly] = useState(false);
  const [coursePage, setCoursePage] = useState(0);
  const [homeCollegePage, setHomeCollegePage] = useState(0);
  const [allCollegePage, setAllCollegePage] = useState(0);

  const [liveColleges, setLiveColleges] = useState(() =>
    collegesData.length ? collegesData : colleges,
  );
  const [liveCourses, setLiveCourses] = useState(() =>
    coursesData.length ? coursesData : courses,
  );

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      try {
        const panelData = await fetchPublicSummaryData();
        if (!active) return;

        startTransition(() => {
          setLiveColleges(panelData.colleges.length ? panelData.colleges : colleges);
          setLiveCourses(panelData.courses.length ? panelData.courses : courses);
        });
      } catch {
        if (!active) return;
        startTransition(() => {
          setLiveColleges(collegesData.length ? collegesData : colleges);
          setLiveCourses(coursesData.length ? coursesData : courses);
        });
      }
    };

    if (typeof window === "undefined") return () => {};

    const idleWindow = window as Window & {
      requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    let cancelIdleLoad: (() => void) | undefined;
    if (idleWindow.requestIdleCallback && idleWindow.cancelIdleCallback) {
      const handle = idleWindow.requestIdleCallback(() => {
        void loadData();
      }, { timeout: 1200 });
      cancelIdleLoad = () => idleWindow.cancelIdleCallback?.(handle);
    } else {
      const timer = window.setTimeout(() => {
        void loadData();
      }, 0);
      cancelIdleLoad = () => window.clearTimeout(timer);
    }

    return () => {
      active = false;
      cancelIdleLoad?.();
    };
  }, [collegesData, coursesData]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash !== "#allF-courses") return;
    if (safeInitialView !== "courses") return;

    window.requestAnimationFrame(() => {
      document.getElementById("all-courses")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [safeInitialView]);

  const collegesMatchingCourseQuery = useMemo(() => {
    if (!searchText && !hasStreamFilter) return new Set<string>();

    const matchedCourseRows = liveCourses.filter((course) =>
      matchesCourseQuery(course, searchText, matchedStreamAliases, hasStreamFilter),
    );

    const matchedCollegeIds = new Set<string>();
    matchedCourseRows.forEach((course) => {
      const normalizedCollegeName = normalizeText(course.college);
      const normalizedUniversityName = normalizeText(course.university);

      if (course.collegeId) {
        matchedCollegeIds.add(course.collegeId);
      }

      liveColleges.forEach((college) => {
        const tagsText = normalizeText(
          `${college.courseTags?.join(" ") || ""} ${college.streams.join(" ")}`,
        );
        const matchesTextSearch = searchText ? tagsText.includes(searchText) : false;
        const matchesStreamAlias =
          matchedStreamAliases.length > 0 &&
          matchesStreamAliases(tagsText, matchedStreamAliases);

        if (
          college.id === course.collegeId ||
          normalizeText(college.name) === normalizedCollegeName ||
          (normalizedUniversityName &&
            normalizeText(college.university) === normalizedUniversityName) ||
          matchesTextSearch ||
          matchesStreamAlias
        ) {
          matchedCollegeIds.add(college.id);
        }
      });
    });

    return matchedCollegeIds;
  }, [hasStreamFilter, liveColleges, liveCourses, matchedStreamAliases, searchText]);

  const filteredCourseRows = useMemo(
    () =>
      liveCourses.filter((course) => matchesCourseQuery(course, searchText, matchedStreamAliases, hasStreamFilter)),
    [hasStreamFilter, liveCourses, matchedStreamAliases, searchText],
  );

  const groupedCourses = useMemo(() => {
    const grouped = new Map<string, typeof filteredCourseRows>();
    filteredCourseRows.forEach((course) => {
      const key = formatCourseDisplayName(
        String(course.course || "").trim(),
        course.stream || course.courseCategory,
        course.specialization,
      );
      grouped.set(key, [...(grouped.get(key) || []), course]);
    });
    return [...grouped.entries()];
  }, [filteredCourseRows]);

  const coursesPerPage = 10;

const totalCoursePages = Math.max(
  1,
  Math.ceil(filteredCourseRows.length / coursesPerPage)
);

const currentCoursePage = Math.min(
  coursePage,
  totalCoursePages - 1
);

const visibleCourses = filteredCourseRows.slice(
  currentCoursePage * coursesPerPage,
  currentCoursePage * coursesPerPage + coursesPerPage
);

  const filteredColleges = useMemo(() => {
    let data = liveColleges;
    if (showBestOnly) data = data.filter((college) => college.isBestCollege);
    if (cityFilter) {
      const normalizedCity = normalizeText(cityFilter);
      data = data.filter(
        (college) =>
          normalizeText(college.city || "") === normalizedCity ||
          normalizeText(college.district) === normalizedCity ||
          normalizeText(college.state) === normalizedCity,
      );
    }
    if (searchText || hasStreamFilter) {
      data = data.filter((college) => {
        const searchableText = normalizeText(
          `${college.name} ${college.university} ${college.description} ${college.state} ${college.district} ${(college.courseTags || []).join(" ")} ${college.streams.join(" ")}`,
        );
        const tagsText = normalizeText(
          `${college.courseTags?.join(" ") || ""} ${college.streams.join(" ")}`,
        );
        const matchesTextSearch = searchText ? searchableText.includes(searchText) : false;
        const matchesStreamAlias =
          matchedStreamAliases.length > 0 &&
          matchesStreamAliases(tagsText, matchedStreamAliases);

        return matchesTextSearch || matchesStreamAlias || collegesMatchingCourseQuery.has(college.id);
      });
    }
    if (collegeFilter) {
      const normalizedCollege = normalizeText(collegeFilter);
      data = data.filter((college) => normalizeText(college.name) === normalizedCollege);
    }
    return data;
  }, [cityFilter, collegeFilter, collegesMatchingCourseQuery, hasStreamFilter, liveColleges, matchedStreamAliases, searchText, showBestOnly]);
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
  const featuredCourses = useMemo(
    () =>
      (searchText || hasStreamFilter
        ? groupedCourses
        : groupedCourses.filter(([, rows]) => rows.some((row) => row.isTopCourse))).slice(0, 10),
    [groupedCourses, hasStreamFilter, searchText],
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
          <div className="page-container-full pt-5 pb-3">
            <div className="mx-auto w-full px-4 sm:px-6">
            <h1 className="text-xl font-bold text-[color:var(--text-dark)] md:text-3xl">Explore Education</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[color:var(--text-muted)]">
              Discover top colleges and best-fit courses for your education journey.
            </p>
            </div>
          </div>
        </div>
      </div>

      <div className="page-container-full py-5">
        <div className="mx-auto w-full px-4 sm:px-6">
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
                <h2 className="text-lg font-bold text-[color:var(--text-dark)] md:text-xl">
                  {searchText || hasStreamFilter ? "Matching Courses" : "Top Courses"}
                </h2>
                <button type="button" onClick={() => setViewMode("courses")} className="text-sm font-semibold text-[color:var(--brand-primary)] hover:text-[color:var(--brand-primary-soft)]">
                  View More &rarr;
                </button>
              </div>

             <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
  <table className="w-full min-w-[650px] md:min-w-[900px]">
    <thead>
      <tr className=" bg-slate-50">
        <th className="px-6 py-4 text-left text-sm font-bold text-blue-700">
          COURSE
        </th>
        <th className="px-6 py-4 text-left text-sm font-bold text-green-700">
          TOTAL FEES
        </th>
        <th className="px-6 py-4 text-left text-sm font-bold text-orange-600">
          CUTOFF
        </th>
        <th className="px-6 py-4 text-left text-sm font-bold text-purple-600">
          DURATION
        </th>
        <th className="px-6 py-4 text-center text-sm font-bold text-red-600">
          STATUS
        </th>
      </tr>
    </thead>

    <tbody>
      {featuredCourses.map(([courseName, rows]) => {
        const primaryCourse = rows[0];

        const displayCourseName = formatCourseDisplayName(
          courseName,
          primaryCourse?.stream || primaryCourse?.courseCategory,
          primaryCourse?.specialization
        );

        const fees = rows.map((item) => item.totalFees);
        const cutoffs = rows.map((item) => item.cutoff);
        const durations = [...new Set(rows.map((item) => item.duration))];
        const isTop = rows.some((row) => row.isTopCourse);

        return (
          <tr
            key={courseName}
            onClick={() =>
              router.push(
                `/explore/course/${encodeURIComponent(displayCourseName)}`
              )
            }
            className="cursor-pointer border-b border-slate-200 hover:bg-slate-50 transition h-12"
          >
            <td className="px-4 py-2 font-semibold text-slate-800 max-w-[220px] md:max-w-none">
  <div className="line-clamp-2 md:line-clamp-1">
    {displayCourseName}
  </div>
</td>
            <td className="px-4 py-2 text-slate-700 whitespace-nowrap">
  ₹ {Math.min(...fees).toLocaleString()} -{" "}
  {Math.max(...fees).toLocaleString()}
</td>

            <td className="px-4 py-2 text-slate-700">
              {Math.min(...cutoffs)} - {Math.max(...cutoffs)}
            </td>

            <td className="px-4 py-2 text-slate-700">
              {durations.join(", ")}
            </td>

            <td className="px-4 py-2 text-center whitespace-nowrap">
              {isTop ? (
<span className="inline-flex items-center justify-center whitespace-nowrap rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">                  Top
                </span>
              ) : (
<span className="inline-flex items-center justify-center whitespace-nowrap rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">                  Regular
                </span>
              )}
            </td>
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
                        <CollegeImage college={college} />
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
                      ? "border-[rgba(255,138,61,0.72)] ring-2 ring-[rgba(255,138,61,0.28)] shadow-[0_18px_34px_rgba(255,138,61,0.18)]"
                      : "border-[rgba(15,76,129,0.08)] hover:border-[rgba(255,138,61,0.28)]"
                  }`}
                >
                  <div className="relative h-36 overflow-hidden bg-slate-100">
                    <CollegeImage college={college} />
                    {college.isBestCollege ? (
                      <div className="absolute right-2 top-2 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-700">
                        Best
                      </div>
                    ) : null}
                    {isSelectedCollege ? (
                      <div className="absolute left-2 top-2 rounded-full border border-[rgba(255,255,255,0.82)] bg-[linear-gradient(135deg,#ea580c,#fb923c)] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-white shadow-[0_12px_24px_rgba(234,88,12,0.32)]">
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
          <div id="all-courses" className="scroll-mt-32">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
  <h2 className="text-lg font-bold text-[color:var(--text-dark)] md:text-xl">
    All Courses
  </h2>

  <div className="flex items-center gap-2">
    <span className="rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-white px-3 py-2 text-sm font-semibold text-[color:var(--brand-primary)]">
      Courses: {filteredCourseRows.length}
    </span>

<div className="flex items-center gap-2 rounded-full border border-[rgba(15,76,129,0.12)] bg-white px-2 py-1 text-[10px] md:text-xs font-medium text-[color:var(--brand-primary)]">      <span>Page</span>

      <select
        value={currentCoursePage}
        onChange={(e) => setCoursePage(Number(e.target.value))}
        className="bg-transparent text-xs font-semibold text-[color:var(--text-dark)] outline-none"
      >
        {Array.from({ length: totalCoursePages }, (_, index) => {
          const start = index * coursesPerPage + 1;
          const end = Math.min(
            (index + 1) * coursesPerPage,
            filteredCourseRows.length
          );

          return (
            <option key={index} value={index}>
              {start}-{end}
            </option>
          );
        })}
      </select>
    </div>
  </div>
</div>
           <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
  <table className="w-full min-w-[900px]">
    <thead>
      <tr className="bg-slate-50">
        <th className="px-6 py-4 text-left text-sm font-bold text-blue-700">
          COURSE
        </th>
        <th className="px-6 py-4 text-left text-sm font-bold text-green-700">
          TOTAL FEES
        </th>
        <th className="px-6 py-4 text-left text-sm font-bold text-orange-600">
          CUTOFF
        </th>
        <th className="px-6 py-4 text-left text-sm font-bold text-purple-600">
          DURATION
        </th>
        <th className="px-6 py-4 text-center text-sm font-bold text-red-600">
          STATUS
        </th>
      </tr>
    </thead>

    <tbody>
      {visibleCourses.map((course) => {
        const displayCourseName = formatCourseDisplayName(
          String(course.course || '').trim(),
          course.stream || course.courseCategory,
          course.specialization,
        );
        const fees = [
          Number(course.totalFees),
          ...(Array.isArray(course.collegeDetails)
            ? course.collegeDetails.map((detail) => Number(detail.totalFees))
            : []),
        ].filter((value) => Number.isFinite(value) && value > 0);
        const cutoffs = [
          Number(course.cutoff),
          ...(Array.isArray(course.collegeDetails)
            ? course.collegeDetails.map((detail) => Number(detail.cutoff))
            : []),
        ].filter((value) => Number.isFinite(value) && value > 0);
        const duration = String(course.duration || '').trim() || '-';

        return (
          <tr
            key={course.id}
            onClick={() => router.push(`/explore/course/${encodeURIComponent(displayCourseName)}`)}
            className="cursor-pointer border-b border-slate-200 transition hover:bg-slate-50 h-12"
          >
            <td className="px-4 py-2 font-semibold text-slate-800 max-w-[220px] md:max-w-none">
              <div className="line-clamp-2 md:line-clamp-1">{displayCourseName}</div>
            </td>

            <td className="px-4 py-2 text-slate-700">
              Rs.{' '}
              {fees.length
                ? `${Math.min(...fees).toLocaleString()}${Math.max(...fees) !== Math.min(...fees) ? ` - ${Math.max(...fees).toLocaleString()}` : ''}`
                : '-'}
            </td>

            <td className="px-4 py-2 text-slate-700">
              {cutoffs.length
                ? Math.min(...cutoffs) === Math.max(...cutoffs)
                  ? `${Math.min(...cutoffs)}`
                  : `${Math.min(...cutoffs)} - ${Math.max(...cutoffs)}`
                : '-'}
            </td>

            <td className="px-4 py-2 text-slate-700">{duration}</td>

            <td className="px-4 py-2 text-center">
              {course.isTopCourse ? (
                <span className="rounded-full border border-green-200 bg-green-50 px-4 py-1 text-xs font-semibold text-green-700">
                  Top
                </span>
              ) : (
                <span className="rounded-full border border-blue-200 bg-blue-50 px-4 py-1 text-xs font-semibold text-blue-700">
                  Regular
                </span>
              )}
            </td>
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

