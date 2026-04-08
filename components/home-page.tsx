"use client";

import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  Cpu,
  GraduationCap as CourseIcon,
  Mail,
  MapPin,
  Phone,
  Scale,
  Search,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Navbar } from "@/components/navbar";
import { colleges as fallbackColleges, courses as fallbackCourses, type College, type Course } from "@/lib/site-data";

const SEARCH_FLOW_ITEMS = [
  "Search for college",
  "Search for exams",
  "Search for course",
];

type HomePageProps = {
  collegesData?: College[];
  coursesData?: Course[];
};

export function HomePage({ collegesData = fallbackColleges, coursesData = fallbackCourses }: HomePageProps) {
  const router = useRouter();
  const [heroSearchInput, setHeroSearchInput] = useState("");
  const [activeAction, setActiveAction] = useState(0);
  const [isSpotlightPaused, setIsSpotlightPaused] = useState(false);
  const [expandedSpotlightId, setExpandedSpotlightId] = useState<string | null>(null);
  const [typedSearchText, setTypedSearchText] = useState("");
  const [brokenCollegeImages, setBrokenCollegeImages] = useState<Record<string, boolean>>({});
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const collegesScrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [showLeftArrowColleges, setShowLeftArrowColleges] = useState(false);
  const [showRightArrowColleges, setShowRightArrowColleges] = useState(true);

  const exploreCourseCards = useMemo(() => {
    const grouped = new Map<string, Course[]>();

    coursesData.forEach((item) => {
      const courseName = item.course.trim();
      const existing = grouped.get(courseName) || [];
      grouped.set(courseName, [...existing, item]);
    });

    return [...grouped.entries()].map(([courseName, rows]) => {
      const fees = rows.map((row) => row.totalFees);
      const cutoffs = rows.map((row) => row.cutoff);
      const durations = [...new Set(rows.map((row) => row.duration).filter(Boolean))];
      const minFees = Math.min(...fees);
      const maxFees = Math.max(...fees);
      const minCutoff = Math.min(...cutoffs);
      const maxCutoff = Math.max(...cutoffs);

      return {
        id: courseName,
        course: courseName,
        duration: durations.join(", ") || "-",
        feesRange:
          minFees === maxFees
            ? `Rs. ${minFees.toLocaleString()}`
            : `Rs. ${minFees.toLocaleString()} - ${maxFees.toLocaleString()}`,
        cutoffRange: minCutoff === maxCutoff ? `${minCutoff}` : `${minCutoff} - ${maxCutoff}`,
        isTopCourse: rows.some((row) => row.isTopCourse),
      };
    });
  }, [coursesData]);

  const topCourseChips = useMemo(
    () =>
      coursesData
        .filter((course) => course.isTopCourse)
        .filter((course, index, arr) => arr.findIndex((item) => item.course === course.course) === index)
        .map((course) => ({ id: course.id, course: course.course })),
    [coursesData],
  );
  const trendingCourseCards = useMemo(() => {
    const normalizeTrendingCourse = (value: string) => {
      const courseName = value.trim();
      const normalized = courseName.toUpperCase();

      const aliases = [
        { key: "B.Tech", patterns: ["B.TECH", "B E", "B.E", "BE "] },
        { key: "MBA", patterns: ["MBA"] },
        { key: "MBBS", patterns: ["MBBS"] },
        { key: "MCA", patterns: ["MCA"] },
        { key: "B.Sc", patterns: ["B.SC", "BSC"] },
        { key: "B.Com", patterns: ["B.COM", "BCOM"] },
        { key: "BBA", patterns: ["BBA"] },
        { key: "BCA", patterns: ["BCA"] },
        { key: "M.Tech", patterns: ["M.TECH", "MTECH", "M E", "M.E"] },
        { key: "Law", patterns: ["LLB", "LLM", "LAW"] },
      ];

      const matched = aliases.find(({ patterns }) =>
        patterns.some((pattern) => normalized === pattern || normalized.startsWith(`${pattern} `) || normalized.startsWith(`${pattern}.`)),
      );

      return matched?.key || courseName;
    };

    const iconMap = {
      "B.Tech": Cpu,
      MBA: BriefcaseBusiness,
      MBBS: Stethoscope,
      MCA: CourseIcon,
      "B.Sc": Sparkles,
      "B.Com": BriefcaseBusiness,
      BBA: BriefcaseBusiness,
      BCA: CourseIcon,
      "M.Tech": Cpu,
      Law: Scale,
    } as const;

    const subtitleMap: Record<string, string> = {
      "B.Tech": "Engineering Path",
      MBA: "Business Leadership",
      MBBS: "Medical Studies",
      MCA: "Tech Careers",
      "B.Sc": "Science Track",
      "B.Com": "Commerce Track",
      Law: "Legal Studies",
      BBA: "Management Track",
      "M.Tech": "Advanced Engineering",
      BCA: "Computing Basics",
    };

    const preferredOrder = ["B.Tech", "MBA", "MBBS", "MCA", "B.Sc", "B.Com", "BBA", "BCA", "M.Tech", "Law"];

    const normalizedTopCourses = topCourseChips.reduce<Array<{ id: string; course: string; hrefCourse: string }>>((list, course) => {
      const normalizedCourse = normalizeTrendingCourse(course.course);
      if (list.some((item) => item.course === normalizedCourse)) return list;
      return [...list, { id: course.id, course: normalizedCourse, hrefCourse: course.course }];
    }, []);

    const orderedTopCourses = [
      ...preferredOrder.filter((course) => normalizedTopCourses.some((item) => item.course === course)),
      ...normalizedTopCourses.map((item) => item.course).filter((course) => !preferredOrder.includes(course)),
    ];

    const items = orderedTopCourses
      .map((course) => {
        const matchedCourse = normalizedTopCourses.find((item) => item.course === course);
        const hrefCourse = matchedCourse?.hrefCourse || course;

        return {
          id: `${course.toLowerCase().replace(/\s+/g, "-")}-trending`,
          course: hrefCourse,
          icon: iconMap[course as keyof typeof iconMap] ?? CourseIcon,
          subtitle: subtitleMap[course] ?? "Student Favorite",
          href: `/explore/course/${encodeURIComponent(hrefCourse)}`,
        };
      });

    if (!items.some((item) => item.course === "MCA")) {
      items.push({
        id: "mca-trending",
        course: "MCA",
        icon: CourseIcon,
        subtitle: subtitleMap.MCA,
        href: `/explore/course/${encodeURIComponent("MCA")}`,
      });
    }
    if (!items.some((item) => item.course === "B.Tech")) {
      items.push({
        id: "btech-trending",
        course: "B.Tech",
        icon: Cpu,
        subtitle: subtitleMap["B.Tech"],
        href: `/explore/course/${encodeURIComponent("B.Tech")}`,
      });
    }

    const fallbackCourses = [
      {
        id: "mba-trending",
        course: "MBA",
        icon: BriefcaseBusiness,
        subtitle: subtitleMap.MBA,
        href: `/explore/course/${encodeURIComponent("MBA")}`,
      },
      {
        id: "mbbs-trending",
        course: "MBBS",
        icon: Stethoscope,
        subtitle: subtitleMap.MBBS,
        href: `/explore/course/${encodeURIComponent("MBBS")}`,
      },
      {
        id: "bba-trending",
        course: "BBA",
        icon: BriefcaseBusiness,
        subtitle: subtitleMap.BBA,
        href: `/explore/course/${encodeURIComponent("BBA")}`,
      },
      {
        id: "mca-trending-fallback",
        course: "MCA",
        icon: CourseIcon,
        subtitle: subtitleMap.MCA,
        href: `/explore/course/${encodeURIComponent("MCA")}`,
      },
      {
        id: "btech-trending-fallback",
        course: "B.Tech",
        icon: Cpu,
        subtitle: subtitleMap["B.Tech"],
        href: `/explore/course/${encodeURIComponent("B.Tech")}`,
      },
      {
        id: "bca-trending",
        course: "BCA",
        icon: CourseIcon,
        subtitle: subtitleMap.BCA,
        href: `/explore/course/${encodeURIComponent("BCA")}`,
      },
      {
        id: "bcom-trending",
        course: "B.Com",
        icon: BriefcaseBusiness,
        subtitle: subtitleMap["B.Com"],
        href: `/explore/course/${encodeURIComponent("B.Com")}`,
      },
    ];

    for (const fallback of fallbackCourses) {
      if (items.length >= 6) break;
      if (!items.some((item) => item.course === fallback.course)) {
        items.push(fallback);
      }
    }

    return items.slice(0, 6);
  }, [topCourseChips]);

  const featureCards = [
    {
      title: "Smart Search",
      description: "Search colleges, courses, exams, and cities from one flow.",
      icon: Search,
    },
    {
      title: "College Compare",
      description: "Compare top colleges side by side before you shortlist.",
      icon: Scale,
    },
    {
      title: "Course Explorer",
      description: "Browse course fees, duration, and cutoff faster.",
      icon: CourseIcon,
    },
    {
      title: "Top Colleges",
      description: "Browse spotlight colleges with details, location, and quick access.",
      icon: Sparkles,
    },
    {
      title: "Verified Profiles",
      description: "See approved college details, fees, facilities, and rankings in one place.",
      icon: BadgeCheck,
    },
    {
      title: "Ranking View",
      description: "See college rankings in a clean range format directly on detail pages.",
      icon: BadgeCheck,
    },
  ];
  const featureMarqueeItems = useMemo(() => [...featureCards, ...featureCards], [featureCards]);
  const spotlightColleges = useMemo(() => {
    const bestColleges = collegesData.filter((college) => college.isBestCollege);
    const additionalColleges = collegesData.filter((college) => !college.isBestCollege).slice(0, 4);
    return [...bestColleges, ...additionalColleges].slice(0, 8);
  }, [collegesData]);
  const activeCollege = spotlightColleges[activeAction] ?? spotlightColleges[0];

  const syncScrollIndicators = (
    element: HTMLDivElement | null,
    setLeft: (value: boolean) => void,
    setRight: (value: boolean) => void,
  ) => {
    if (!element) return;
    const { scrollLeft, scrollWidth, clientWidth } = element;
    setLeft(scrollLeft > 0);
    setRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    syncScrollIndicators(scrollContainerRef.current, setShowLeftArrow, setShowRightArrow);
    syncScrollIndicators(
      collegesScrollContainerRef.current,
      setShowLeftArrowColleges,
      setShowRightArrowColleges,
    );
  }, []);

  useEffect(() => {
    if (isSpotlightPaused) return;
    const timer = window.setInterval(() => {
      setExpandedSpotlightId(null);
      setActiveAction((current) => (current + 1) % Math.max(spotlightColleges.length, 1));
    }, 2800);

    return () => window.clearInterval(timer);
  }, [isSpotlightPaused, spotlightColleges.length]);


  useEffect(() => {
    let itemIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    const tick = () => {
      const currentText = SEARCH_FLOW_ITEMS[itemIndex];

      if (isDeleting) {
        charIndex = Math.max(0, charIndex - 1);
      } else {
        charIndex = Math.min(currentText.length, charIndex + 1);
      }

      setTypedSearchText(currentText.slice(0, charIndex));

      if (!isDeleting && charIndex === currentText.length) {
        isDeleting = true;
        return 1200;
      }

      if (isDeleting && charIndex === 0) {
        isDeleting = false;
        itemIndex = (itemIndex + 1) % SEARCH_FLOW_ITEMS.length;
        return 260;
      }

      return isDeleting ? 45 : 85;
    };

    let timeoutId: ReturnType<typeof setTimeout>;
    const loop = () => {
      const delay = tick();
      timeoutId = setTimeout(loop, delay);
    };

    loop();

    return () => clearTimeout(timeoutId);
  }, []);

  const handleHeroSearch = () => {
    const query = heroSearchInput.trim();
    router.push(query ? `/search?q=${encodeURIComponent(query)}` : "/search");
    setHeroSearchInput("");
  };

  return (
    <>
      <section className="relative overflow-hidden bg-white text-[color:var(--text-dark)]">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('/college-hero-v2.jpg')] bg-cover bg-center opacity-[0.26]" />
          <div className="absolute inset-0 bg-white/55" />
        </div>

        <div className="relative z-10">
          <Navbar />

          <div className="page-container-full pb-20 pt-8 md:pb-24 md:pt-10">
            <div className="space-y-4">
              <div className="reveal-up w-full" />

              <div className="reveal-up mx-auto -mt-1 mb-3 w-full px-2">
                <div className="relative py-6 sm:py-8">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.85),transparent_60%)]" />
                  <div className="pointer-events-none absolute -right-10 top-6 h-28 w-28 rounded-full bg-[rgba(255,138,61,0.18)] blur-3xl" />
                  <div className="relative flex flex-col gap-4 md:flex-row md:items-center">
                    <div className="hero-search-shell group relative w-full md:w-[75%] md:flex-none">
                      <div className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.8),transparent_60%)] opacity-70" />
                      <div className="pointer-events-none absolute inset-y-1.5 left-1.5 z-[3] flex items-center justify-center rounded-full bg-[linear-gradient(135deg,rgba(255,138,61,0.18),rgba(255,255,255,0.94))] px-3 text-[color:var(--brand-primary)] transition group-focus-within:scale-105">
                        <Search className="size-4" />
                      </div>

                      {!heroSearchInput ? (
                        <div className="pointer-events-none absolute inset-y-0 left-14 right-5 z-[2] flex items-center overflow-hidden">
                          <div className="text-[13px] font-medium text-[color:var(--text-muted)] sm:text-sm md:text-[15px]">
                            {typedSearchText}
                            <span className="ml-0.5 inline-block text-[color:var(--brand-accent)]">|</span>
                          </div>
                        </div>
                      ) : null}
                      <input
                        type="text"
                        value={heroSearchInput}
                        onChange={(event) => setHeroSearchInput(event.target.value)}
                        onFocus={() =>
                          router.push(
                            heroSearchInput.trim()
                              ? `/search?q=${encodeURIComponent(heroSearchInput.trim())}`
                              : "/search",
                          )
                        }
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            handleHeroSearch();
                          }
                        }}
                        placeholder=""
                        className="hero-search-input h-[3.4rem] w-full rounded-full border border-[rgba(15,76,129,0.25)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(245,250,255,0.96))] pl-14 pr-5 text-[13px] text-[color:var(--text-dark)] outline-none shadow-[0_10px_24px_rgba(15,76,129,0.18)] ring-1 ring-[rgba(255,138,61,0.18)] sm:h-[3.85rem] sm:text-sm"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => router.push("/find")}
                      className="shine-button w-full rounded-full bg-[linear-gradient(135deg,var(--brand-primary),var(--brand-primary-soft))] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(15,76,129,0.22)] transition hover:scale-[1.01] hover:brightness-105 md:w-auto md:px-8"
                    >
                      Find Colleges
                    </button>
                  </div>

                  <div className="relative mt-4 flex flex-wrap items-center gap-2 text-[11px] text-[color:var(--text-muted)] sm:text-xs md:text-sm">
                    <span className="rounded-full border border-[rgba(15,76,129,0.1)] bg-white px-3 py-1.5 font-semibold text-[color:var(--brand-primary)]">
                      Live search flow
                    </span>
                    {[
                      { label: "Top Engineering Colleges", href: "/search-results?q=best%20engineering%20colleges" },
                      { label: "MBA Programs", href: "/search-results?q=MBA%20programs" },
                      { label: "Medical Admissions", href: "/search-results?q=best%20medical%20colleges" },
                    ].map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => router.push(item.href)}
                        className="rounded-full border border-[rgba(15,76,129,0.1)] bg-white px-3 py-1.5 transition hover:border-[rgba(15,76,129,0.2)] hover:bg-[rgba(15,76,129,0.04)]"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>

                  <div className="feature-marquee mt-5 pl-20 md:pl-28">
                    <div className="marquee-track">
                      {featureMarqueeItems.map((item, index) => {
                        const Icon = item.icon;
                        return (
                          <div key={`${item.title}-${index}`} className="feature-pill marquee-item">
                            <span className="feature-pill-icon">
                              <Icon className="size-4" />
                            </span>
                            <div>
                              <p className="feature-pill-title">{item.title}</p>
                              <p className="feature-pill-desc">{item.description}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mx-auto w-full max-w-[1260px]">
                <div className="reveal-up delay-3 mt-8 pt-3 grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
                  <div className="rounded-[2rem] border border-[rgba(15,76,129,0.08)] bg-[linear-gradient(180deg,#ffffff,#f5faff)] p-5 shadow-[0_22px_50px_rgba(22,50,79,0.08)] md:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--brand-primary-soft)]">
                      Top College Flow
                    </p>
                    <div className="flex gap-1.5">
                      {spotlightColleges.map((college, index) => (
                        <span
                          key={college.id}
                          className={`h-1.5 rounded-full transition-all ${
                            index === activeAction ? "w-6 bg-[color:var(--brand-primary)]" : "w-2 bg-[rgba(15,76,129,0.18)]"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 rounded-[1.5rem] border border-[rgba(15,76,129,0.08)] bg-[linear-gradient(135deg,rgba(15,76,129,0.05),rgba(255,138,61,0.08))] p-4">
                    <div
                      className="relative h-40 overflow-hidden rounded-[1.3rem] border border-[rgba(15,76,129,0.08)] bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(241,248,255,0.95))] sm:h-44"
                      onMouseEnter={() => setIsSpotlightPaused(true)}
                      onMouseLeave={() => setIsSpotlightPaused(false)}
                    >
                      <div
                        className="flex h-full transition-transform duration-700 ease-out"
                        style={{ transform: `translateX(-${activeAction * 100}%)` }}
                      >
                        {spotlightColleges.map((college) => (
                          <div key={college.id} className="relative h-full min-w-full">
                            {brokenCollegeImages[college.id] ? (
                              <div className="flex h-full w-full items-end bg-[linear-gradient(135deg,rgba(15,76,129,0.88),rgba(255,138,61,0.68))] p-4">
                                <div>
                                  <p className="text-sm font-semibold text-white">{college.name}</p>
                                  <p className="mt-1 text-[11px] text-white/80">
                                    {college.district}, {college.state}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <img
                                src={college.image}
                                alt={college.name}
                                className="h-full w-full object-cover"
                                onError={() =>
                                  setBrokenCollegeImages((current) => ({
                                    ...current,
                                    [college.id]: true,
                                  }))
                                }
                              />
                            )}
                            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,23,40,0.08),rgba(9,23,40,0.72))]" />
                            <div className="absolute left-3 top-3 rounded-full bg-white/92 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--brand-primary)]">
                              Top College
                            </div>
                            <div className="absolute bottom-3 left-3 right-3">
                              <div>
                                <p className="text-sm font-semibold text-white">{college.name}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[color:var(--text-dark)]">
                          {activeCollege?.name || "Top College"}
                        </p>
                        <p className="mt-1 inline-flex items-center gap-1 text-xs text-[color:var(--text-muted)]">
                          <MapPin className="size-3.5" />
                          {activeCollege ? `${activeCollege.district}, ${activeCollege.state}` : "Location unavailable"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedSpotlightId((current) =>
                            current === activeCollege?.id ? null : (activeCollege?.id ?? null),
                          )
                        }
                        className="rounded-full border border-[rgba(15,76,129,0.1)] bg-white px-3 py-1.5 text-xs font-semibold text-[color:var(--brand-primary)] transition hover:bg-[rgba(15,76,129,0.04)]"
                      >
                        {expandedSpotlightId === activeCollege?.id ? "Show less" : "Show more"}
                      </button>
                    </div>
                    {expandedSpotlightId === activeCollege?.id ? (
                      <div className="mt-3 rounded-[1rem] border border-[rgba(15,76,129,0.08)] bg-white/90 p-3">
                        <p className="text-sm leading-6 text-[color:var(--text-muted)]">
                          {activeCollege?.description || "Top college details not available."}
                        </p>
                      </div>
                    ) : null}
                  </div>
                </div>

                  <div className="rounded-[2rem] border border-[rgba(15,76,129,0.08)] bg-[linear-gradient(180deg,#ffffff,#f5faff)] p-5 shadow-[0_22px_50px_rgba(22,50,79,0.08)] md:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--brand-primary-soft)]">
                      Trending Courses
                    </p>
                    <button
                      type="button"
                      onClick={() => router.push("/explore")}
                      className="inline-flex items-center gap-2 text-xs font-semibold text-[color:var(--brand-primary)]"
                    >
                      View all
                      <ArrowRight className="size-3.5" />
                    </button>
                  </div>
                  <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                    {trendingCourseCards.map((course) => {
                      const Icon = course.icon;
                      return (
                        <button
                          key={course.id}
                          type="button"
                          onClick={() => router.push(course.href)}
                          className="group rounded-[1.05rem] border border-[rgba(15,76,129,0.1)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,249,255,0.96))] px-3 py-2.5 text-left shadow-[0_12px_26px_rgba(22,50,79,0.07)] transition duration-300 hover:-translate-y-0.5 hover:border-[rgba(255,138,61,0.35)] hover:shadow-[0_18px_32px_rgba(22,50,79,0.12)]"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="rounded-[0.8rem] border border-[rgba(15,76,129,0.08)] bg-[linear-gradient(135deg,rgba(255,138,61,0.14),rgba(255,255,255,0.94))] p-1.5 text-[color:var(--brand-accent-deep)] transition group-hover:scale-[1.03]">
                              <Icon className="size-[13px]" />
                            </div>
                          </div>
                          <div className="mt-3">
                            <p className="font-[family:var(--font-display)] text-[1.05rem] leading-none text-[color:var(--text-dark)]">
                              {course.course}
                            </p>
                            <p className="mt-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-[color:var(--text-muted)]">
                              {course.subtitle}
                            </p>
                          </div>
                          <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold text-[color:var(--brand-primary)]">
                            Explore Course
                            <ArrowRight className="size-[13px] text-[color:var(--brand-accent)] transition group-hover:translate-x-0.5" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell page-section bg-[color:var(--surface-muted)] text-slate-800">
        <div className="page-container-full relative z-10 max-w-[1200px]">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--brand-primary-soft)]">
                Discover Pathways
              </p>
              <h2 className="section-title mt-3 text-balance">
                Explore courses with clearer decisions and stronger presentation.
              </h2>
            </div>
            <button
              type="button"
              onClick={() => router.push("/explore")}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--brand-primary)]"
            >
              View all courses
              <ArrowRight className="size-4" />
            </button>
          </div>

          <div className="relative mt-8">
            <div
              ref={scrollContainerRef}
              onScroll={() =>
                syncScrollIndicators(scrollContainerRef.current, setShowLeftArrow, setShowRightArrow)
              }
              className="flex gap-3 overflow-x-auto pb-4 scroll-smooth scrollbar-hide"
            >
              {exploreCourseCards.slice(0, 10).map((course) => (
                <article
                  key={course.id}
                  className="luxe-card min-w-[14rem] shrink-0 p-4 sm:min-w-[17.25rem] lg:min-w-[19rem]"
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-[rgba(16,37,78,0.08)] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[color:var(--brand-primary)]">
                      {course.isTopCourse ? "Top Course" : "Course"}
                    </span>
                  </div>
                  <h3 className="mt-4 font-[family:var(--font-display)] text-[1.28rem] leading-tight text-[color:var(--text-dark)] sm:text-[1.42rem]">
                    {course.course}
                  </h3>
                  <dl className="mt-5 space-y-2.5 text-sm">
                    <div className="flex items-center justify-between gap-4 border-b border-[rgba(20,32,51,0.08)] pb-2.5">
                      <dt className="text-slate-500">Duration</dt>
                      <dd className="font-semibold text-[color:var(--text-dark)]">{course.duration}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-4 border-b border-[rgba(20,32,51,0.08)] pb-2.5">
                      <dt className="text-slate-500">Total Fees</dt>
                      <dd className="font-semibold text-[color:var(--text-dark)]">{course.feesRange}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <dt className="text-slate-500">Cutoff</dt>
                      <dd className="font-semibold text-[color:var(--text-dark)]">{course.cutoffRange}</dd>
                    </div>
                  </dl>
                  <button
                    type="button"
                    onClick={() => router.push(`/explore/course/${encodeURIComponent(course.course)}`)}
                    className="mt-5 inline-flex items-center gap-2 rounded-full bg-[color:var(--brand-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[color:var(--brand-primary-soft)]"
                  >
                    Course Overview
                    <ArrowRight className="size-4" />
                  </button>
                </article>
              ))}
            </div>

            {showLeftArrow ? (
              <button
                type="button"
                onClick={() => scrollContainerRef.current?.scrollBy({ left: -320, behavior: "smooth" })}
                className="absolute -left-4 top-1/2 hidden -translate-y-1/2 rounded-full bg-white p-2.5 text-slate-700 shadow-xl transition hover:bg-slate-100 lg:block"
              >
                <ChevronLeft className="size-5" />
              </button>
            ) : null}

            {showRightArrow ? (
              <button
                type="button"
                onClick={() => scrollContainerRef.current?.scrollBy({ left: 320, behavior: "smooth" })}
                className="absolute -right-4 top-1/2 hidden -translate-y-1/2 rounded-full bg-white p-2.5 text-slate-700 shadow-xl transition hover:bg-slate-100 lg:block"
              >
                <ChevronRight className="size-5" />
              </button>
            ) : null}
          </div>
        </div>
      </section>

      {false && (
      <section className="section-shell page-section bg-[#f6f1e7] text-slate-800">
        <div className="page-container relative z-10">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--brand-primary-soft)]">
                Spotlight Institutions
              </p>
              <h2 className="section-title mt-3">Top colleges presented with more trust, texture, and clarity.</h2>
            </div>
            <button
              type="button"
              onClick={() => router.push("/explore")}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--brand-primary)]"
            >
              Browse colleges
              <ArrowRight className="size-4" />
            </button>
          </div>

          <div className="relative mt-8">
            <div
              ref={collegesScrollContainerRef}
              onScroll={() =>
                syncScrollIndicators(
                  collegesScrollContainerRef.current,
                  setShowLeftArrowColleges,
                  setShowRightArrowColleges,
                )
              }
              className="flex gap-4 overflow-x-auto pb-4 scroll-smooth scrollbar-hide"
            >
              {collegesData
                .filter((college) => college.isBestCollege)
                .slice(0, 10)
                .map((college) => (
                  <article
                    key={college.id}
                    onClick={() => router.push(`/college/${college.id}`)}
                    className="luxe-card group min-w-[17rem] cursor-pointer overflow-hidden sm:min-w-[20rem]"
                  >
                    <div className="relative h-44 overflow-hidden">
                      <img
                        src={college.image}
                        alt={college.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-[#09111d] via-[#09111d]/65 to-transparent" />
                      <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--brand-primary)]">
                        Best College
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-[family:var(--font-display)] text-[1.75rem] leading-none text-[color:var(--text-dark)]">
                            {college.name}
                          </h3>
                          <p className="mt-1.5 text-xs text-slate-500">{college.university}</p>
                        </div>
                        <div className="rounded-2xl bg-[rgba(16,37,78,0.08)] px-3 py-2 text-right">
                          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Placement</p>
                          <p className="text-base font-bold text-[color:var(--brand-primary)]">{college.placementRate}%</p>
                        </div>
                      </div>

                      <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">{college.description}</p>

                      <div className="mt-4 flex items-center justify-between">
                        <p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                          <MapPin className="size-3.5" />
                          {college.district}, {college.state}
                        </p>
                        <span className="inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--brand-accent-deep)]">
                          Details
                          <ArrowRight className="size-4" />
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
            </div>

            {showLeftArrowColleges ? (
              <button
                type="button"
                onClick={() =>
                  collegesScrollContainerRef.current?.scrollBy({ left: -320, behavior: "smooth" })
                }
                className="absolute -left-4 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-white p-2.5 text-slate-700 shadow-xl transition hover:bg-slate-100 lg:block"
              >
                <ChevronLeft className="size-5" />
              </button>
            ) : null}

            {showRightArrowColleges ? (
              <button
                type="button"
                onClick={() =>
                  collegesScrollContainerRef.current?.scrollBy({ left: 320, behavior: "smooth" })
                }
                className="absolute -right-4 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-white p-2.5 text-slate-700 shadow-xl transition hover:bg-slate-100 lg:block"
              >
                <ChevronRight className="size-5" />
              </button>
            ) : null}
          </div>
        </div>
      </section>
      )}

      <section className="section-shell page-section bg-[color:var(--surface-base)] text-slate-800">
        <div className="page-container-full relative z-10 max-w-[1300px]">
          <div className="mx-auto max-w-4xl rounded-[2rem] border border-[rgba(16,37,78,0.1)] bg-[linear-gradient(135deg,#fffdf7,#f4ecdf)] p-6 shadow-[0_18px_36px_rgba(16,37,78,0.12)] md:p-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--brand-primary-soft)]">
                Newsletter
              </p>
              <h2 className="section-title mt-3 text-balance">
                Get sharper updates on colleges, exams, and opportunities.
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600 md:text-base">
                A cleaner form, stronger contrast, and a more premium finish so the last section feels as polished as the hero.
              </p>
            </div>

            <form className="mx-auto mt-8 grid w-full max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
              <div className="rounded-[1.4rem] border border-[rgba(16,37,78,0.12)] bg-white px-4 py-2">
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Email</label>
                <div className="flex items-center gap-2">
                  <Mail className="size-4 shrink-0 text-[color:var(--brand-primary-soft)]" />
                  <input type="email" placeholder="your@email.com" className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400" />
                </div>
              </div>
              <div className="rounded-[1.4rem] border border-[rgba(16,37,78,0.12)] bg-white px-4 py-2">
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Phone</label>
                <div className="flex items-center gap-2">
                  <Phone className="size-4 shrink-0 text-[color:var(--brand-primary-soft)]" />
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]{10}"
                    maxLength={10}
                    placeholder="10-digit number"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                    onInput={(event) => {
                      const target = event.currentTarget;
                      target.value = target.value.replace(/\D/g, "").slice(0, 10);
                    }}
                  />
                </div>
              </div>
              <div className="rounded-[1.4rem] border border-[rgba(16,37,78,0.12)] bg-white px-4 py-2">
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Course</label>
                <div className="flex items-center gap-2">
                  <CourseIcon className="size-4 shrink-0 text-[color:var(--brand-primary-soft)]" />
                  <input type="text" placeholder="B.Tech, MBA, etc." className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400" />
                </div>
              </div>
              <div className="flex items-stretch sm:col-span-2 md:col-span-1">
                <button
                  type="submit"
                  className="shine-button w-full rounded-[1.4rem] bg-[color:var(--brand-primary)] px-6 py-2 text-sm font-semibold text-white transition hover:bg-[color:var(--brand-primary-soft)]"
                >
                  Join Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
