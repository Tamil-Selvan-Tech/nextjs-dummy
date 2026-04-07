"use client";

import {
  ArrowRight,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  Compass,
  Cpu,
  GraduationCap as CourseIcon,
  Mail,
  MapPin,
  Phone,
  Scale,
  Search,
  Sparkles,
  Stethoscope,
  TrendingUp,
} from "lucide-react";
import Image from "next/image";
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
    const iconMap = {
      "B.Tech": Cpu,
      MBA: BriefcaseBusiness,
      MBBS: Stethoscope,
      MCA: CourseIcon,
      "B.Sc": Sparkles,
      Law: Scale,
    } as const;

    const subtitleMap: Record<string, string> = {
      "B.Tech": "Engineering Path",
      MBA: "Business Leadership",
      MBBS: "Medical Studies",
      MCA: "Tech Careers",
      "B.Sc": "Science Track",
      Law: "Legal Studies",
      BBA: "Management Track",
      "M.Tech": "Advanced Engineering",
      BCA: "Computing Basics",
    };

    const items = topCourseChips.map((course) => ({
      ...course,
      icon: iconMap[course.course as keyof typeof iconMap] ?? CourseIcon,
      subtitle: subtitleMap[course.course] ?? "Student Favorite",
      href: `/explore/course/${encodeURIComponent(course.course)}`,
    }));

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
    ];

    for (const fallback of fallbackCourses) {
      if (items.length >= 6) break;
      if (!items.some((item) => item.course === fallback.course)) {
        items.push(fallback);
      }
    }

    return items.slice(0, 6);
  }, [topCourseChips]);

  const stats = [
    { label: "Verified Colleges", value: "120+", icon: Compass },
    { label: "High-demand Courses", value: "40+", icon: CourseIcon },
    { label: "Career Pathways", value: "300+", icon: TrendingUp },
  ];
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
    const timer = window.setInterval(() => {
      setActiveAction((current) => (current + 1) % Math.max(spotlightColleges.length, 1));
    }, 2800);

    return () => window.clearInterval(timer);
  }, [spotlightColleges.length]);

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
      <section className="relative overflow-hidden text-[color:var(--text-dark)]">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_56%,#edf5fb_100%)]" />
          <div className="absolute left-[-4rem] top-10 h-52 w-52 rounded-full bg-[rgba(60,126,182,0.12)] blur-3xl" />
          <div className="absolute right-[4%] top-8 h-40 w-40 rounded-full bg-[rgba(255,138,61,0.12)] blur-3xl" />
          <div className="hero-grid absolute inset-0 opacity-[0.07]" />
        </div>

        <div className="relative z-10">
          <Navbar />

          <div className="page-container pb-20 pt-8 md:pb-24 md:pt-10">
            <div className="grid items-start gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-9">
              <div className="max-w-5xl">
                <div className="reveal-up">
                  <div className="relative max-w-[38rem] overflow-hidden rounded-[1.8rem] border border-[rgba(15,76,129,0.14)] bg-white/90 shadow-[0_22px_50px_rgba(22,50,79,0.12)]">
                    <div className="relative aspect-[16/9] w-full">
                      <Image
                        src="/college-hero-v2.jpg"
                        alt="College campus building"
                        fill
                        priority
                        sizes="(max-width: 1024px) 100vw, 560px"
                        className="object-cover object-top"
                      />
                    </div>
                  </div>
                </div>

                <div className="reveal-up delay-3 mt-6 max-w-[42rem] rounded-[2rem] border border-[rgba(15,76,129,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(240,247,255,0.98))] p-4 shadow-[0_22px_50px_rgba(22,50,79,0.08)] md:p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center">
                    <div className="group relative flex-1">
                      <div className="pointer-events-none absolute inset-y-1.5 left-1.5 flex items-center justify-center rounded-full bg-[linear-gradient(135deg,rgba(255,138,61,0.18),rgba(255,255,255,0.94))] px-3 text-[color:var(--brand-primary)] transition group-focus-within:scale-105">
                        <Search className="size-4" />
                      </div>

                      {!heroSearchInput ? (
                        <div className="pointer-events-none absolute inset-y-0 left-14 right-5 flex items-center overflow-hidden">
                          <div className="text-[11px] font-medium text-[color:var(--text-muted)] sm:text-xs md:text-[13px]">
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
                        className="h-[3.35rem] w-full rounded-full border border-[rgba(15,76,129,0.14)] bg-white pl-14 pr-5 text-[13px] text-[color:var(--text-dark)] shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_14px_30px_rgba(15,76,129,0.08)] outline-none transition focus:border-[color:var(--brand-primary-soft)] focus:shadow-[inset_0_1px_0_rgba(255,255,255,0.92),0_18px_36px_rgba(15,76,129,0.12)] sm:h-14 sm:text-sm"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleHeroSearch}
                      className="shine-button w-full rounded-full bg-[color:var(--brand-primary)] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_12px_26px_rgba(15,76,129,0.2)] transition hover:bg-[color:var(--brand-primary-soft)] md:w-auto md:px-7"
                    >
                      Start Exploring
                    </button>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-[color:var(--text-muted)] sm:text-xs md:text-sm">
                    <span className="rounded-full border border-[rgba(15,76,129,0.1)] bg-white px-3 py-1.5 font-semibold text-[color:var(--brand-primary)]">
                      Live search flow
                    </span>
                    {["Top Engineering Colleges", "MBA Programs", "Medical Admissions"].map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => router.push(`/explore?q=${encodeURIComponent(item)}`)}
                        className="rounded-full border border-[rgba(15,76,129,0.1)] bg-white px-3 py-1.5 transition hover:border-[rgba(15,76,129,0.2)] hover:bg-[rgba(15,76,129,0.04)]"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="reveal-up delay-4 mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                      <article
                        key={stat.label}
                        className="overflow-hidden rounded-[1.5rem] border border-[rgba(15,76,129,0.1)] bg-[linear-gradient(180deg,#ffffff_0%,#f6fbff_100%)] px-4 py-4 shadow-[0_18px_38px_rgba(22,50,79,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_42px_rgba(22,50,79,0.12)]"
                      >
                        <div className="mb-3 h-1.5 w-16 rounded-full bg-[linear-gradient(90deg,var(--brand-primary),var(--brand-accent))]" />
                        <div className="flex flex-col items-center gap-3 text-center">
                          <div className="rounded-[1.1rem] border border-[rgba(15,76,129,0.08)] bg-[linear-gradient(135deg,rgba(15,76,129,0.12),rgba(255,255,255,0.92))] p-2.5 text-[color:var(--brand-primary)] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                            <Icon className="size-4" />
                          </div>
                          <div>
                            <p className="text-xl font-bold tracking-[-0.03em] text-[color:var(--text-dark)] sm:text-[1.45rem]">
                              {stat.value}
                            </p>
                            <p className="text-[11px] font-medium text-[color:var(--text-muted)] sm:text-xs">
                              {stat.label}
                            </p>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>

              <div className="reveal-up delay-3">
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
                    <div className="relative mb-4 h-36 overflow-hidden rounded-[1.3rem] border border-[rgba(15,76,129,0.08)] bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(241,248,255,0.95))]">
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
                    <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--brand-primary-soft)]">Top College Details</p>
                    <p className="mt-3 text-sm leading-6 text-[color:var(--text-muted)]">
                      {activeCollege?.description}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[color:var(--brand-primary)] shadow-[0_10px_20px_rgba(22,50,79,0.06)]">
                        {activeCollege ? `${activeCollege.district}, ${activeCollege.state}` : ""}
                      </span>
                      <span className="rounded-full bg-[rgba(255,138,61,0.12)] px-3 py-1.5 text-xs font-semibold text-[color:var(--brand-accent-deep)]">
                        {activeCollege ? `${activeCollege.placementRate}% Placement` : ""}
                      </span>
                      <button
                        type="button"
                        onClick={() => router.push("/explore?view=colleges")}
                        className="inline-flex items-center gap-2 rounded-full bg-[color:var(--brand-primary)] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[color:var(--brand-primary-soft)]"
                      >
                        Browse Colleges
                        <ArrowRight className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell page-section bg-[color:var(--surface-muted)] text-slate-800">
        <div className="page-container relative z-10">
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
              className="flex gap-4 overflow-x-auto pb-4 scroll-smooth scrollbar-hide"
            >
              {exploreCourseCards.slice(0, 10).map((course) => (
                <article
                  key={course.id}
                  className="luxe-card min-w-[14.5rem] shrink-0 p-4 sm:min-w-[18rem] lg:min-w-[20rem]"
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

      <section className="section-shell page-section bg-[linear-gradient(180deg,#f8fbff_0%,#eef6fc_100%)] text-slate-800">
        <div className="page-container">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <p className="editorial-kicker">Trending Courses</p>
              <h2 className="display-title mt-5 max-w-xl text-balance text-[color:var(--text-dark)]">
                Courses students keep returning to first.
              </h2>
              <p className="mt-4 max-w-lg text-base leading-8 text-[color:var(--text-muted)]">
                These programs are highlighted with stronger visual identity so each
                stream feels easier to scan and quicker to explore.
              </p>
            </div>

            <div className="grid gap-2.5 md:grid-cols-2 lg:grid-cols-3">
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
              )})}
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell page-section bg-[color:var(--surface-base)] text-slate-800">
        <div className="page-container relative z-10">
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
