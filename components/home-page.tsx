"use client";

import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Gavel,
  Globe2,
  GraduationCap as CourseIcon,
  Mail,
  MapPin,
  Medal,
  Phone,
  Search,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Navbar } from "@/components/navbar";
import { colleges as fallbackColleges, courses as fallbackCourses, type College, type Course } from "@/lib/site-data";
import { formatCompactIndianCurrencyRange } from "@/lib/currency-format";

// Custom hook for scroll animations
function useScrollAnimation() {
  useEffect(() => {
    const elements = document.querySelectorAll('[data-scroll-animate]');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    });

    elements.forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);
}

const SEARCH_FLOW_ITEMS = [
  "Search for college",
  "Search for exams",
  "Search for course",
];
const HERO_EXAM_NAMES = ["JEE Main", "JEE Advanced", "CUET", "NEET"];
const TOP_EXAM_CARDS = [
  {
    name: "JEE Main",
    slug: "jee-main",
    logo: "/exams/jee-main.svg",
    mode: "Online Exam",
    participatingColleges: "2031",
    examDate: "April 02, 2026",
    examLevel: "National",
  },
  {
    name: "JEE Advanced",
    slug: "jee-advanced",
    logo: "/exams/jee-advanced.svg",
    mode: "Online Exam",
    participatingColleges: "73",
    examDate: "May 17, 2026",
    examLevel: "National",
  },
  {
    name: "CUET",
    slug: "cuet",
    logo: "/exams/cuet.svg",
    mode: "Offline Exam",
    participatingColleges: "584",
    examDate: "May 11, 2026",
    examLevel: "National",
  },
  {
    name: "NEET",
    slug: "neet",
    logo: "/exams/neet.svg",
    mode: "Offline Exam",
    participatingColleges: "612",
    examDate: "May 05, 2026",
    examLevel: "National",
  },
];

type HomePageProps = {
  collegesData?: College[];
  coursesData?: Course[];
  heroImageUrl?: string;
};

type ThemeStyleVars = CSSProperties & Record<`--${string}`, string>;
type HeroSearchItem = {
  id: string;
  label: string;
  href: string;
  type: "college" | "course" | "exam" | "city";
  keywords: string[];
  imageSrc?: string;
};
type FeatureCardItem = {
  title: string;
  description: string;
  icon: typeof Search;
  imageSrc: string;
};

const FEATURE_CARDS: FeatureCardItem[] = [
  {
    title: "Smart Search",
    description: "Search colleges, courses, exams, and cities from one flow.",
    icon: Search,
    imageSrc: "/features/features-img-6.png",
  },
  {
    title: "College Compare",
    description: "Compare top colleges side by side before you shortlist.",
    icon: Building2,
    imageSrc: "/features/features-img-1.png",
  },
  {
    title: "Course Explorer",
    description: "Browse course fees, duration, and cutoff faster.",
    icon: BookOpen,
    imageSrc: "/features/features-img-2.png",
  },
  {
    title: "Cutoff Calculation",
    description: "Cutoff calculation insights to shortlist colleges faster.",
    icon: Medal,
    imageSrc: "/features/features-img-3.png",
  },
  {
    title: "Verified Profiles",
    description: "See approved college details, fees, facilities, and rankings in one place.",
    icon: CourseIcon,
    imageSrc: "/features/features-img-5.png",
  },
  {
    title: "Ranking View",
    description: "See college rankings in a clean range format directly on detail pages.",
    icon: Globe2,
    imageSrc: "/features/features-img-4.png",
  },
];

export function HomePage({
  collegesData = fallbackColleges,
  coursesData = fallbackCourses,
  heroImageUrl = "",
}: HomePageProps) {
  const router = useRouter();
  const featureCards = FEATURE_CARDS;
  const [heroSearchInput, setHeroSearchInput] = useState("");
  const [activeAction, setActiveAction] = useState(0);
  const [activeFeatureCard, setActiveFeatureCard] = useState(0);
  const [isSpotlightPaused, setIsSpotlightPaused] = useState(false);
  const [typedSearchText, setTypedSearchText] = useState("");
  const [isHeroSearchFocused, setIsHeroSearchFocused] = useState(false);
  const [brokenCollegeImages, setBrokenCollegeImages] = useState<Record<string, boolean>>({});
  const [brokenHeroSuggestionImages, setBrokenHeroSuggestionImages] = useState<Record<string, boolean>>({});
  const [showHeroNoMatch, setShowHeroNoMatch] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const collegesScrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [showLeftArrowColleges, setShowLeftArrowColleges] = useState(false);
  const [showRightArrowColleges, setShowRightArrowColleges] = useState(true);

  const exploreCourseCards = useMemo(() => {
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
      Law: Gavel,
    } as const;

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
        feesRange: formatCompactIndianCurrencyRange(minFees, maxFees),
        cutoffRange: minCutoff === maxCutoff ? `${minCutoff}` : `${minCutoff} - ${maxCutoff}`,
        isTopCourse: rows.some((row) => row.isTopCourse),
        icon: iconMap[courseName as keyof typeof iconMap] ?? CourseIcon,
        href: `/explore/course/${encodeURIComponent(courseName)}`,
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
      Law: Gavel,
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

  const topExamCards = TOP_EXAM_CARDS;
  const heroSearchPool = useMemo(() => {
    const unique = new Map<string, HeroSearchItem>();
    const pushValue = ({
      label,
      href,
      type,
      keywords = [],
      imageSrc,
    }: {
      label: string;
      href: string;
      type: "college" | "course" | "exam" | "city";
      keywords?: string[];
      imageSrc?: string;
    }) => {
      const trimmed = String(label || "").trim();
      if (!trimmed || !href) return;
      const key = `${type}:${trimmed.toLowerCase()}`;
      if (unique.has(key)) return;
      unique.set(key, {
        id: key,
        label: trimmed,
        href,
        type,
        keywords: keywords.filter(Boolean).map((item) => item.toLowerCase()),
        imageSrc: imageSrc ? String(imageSrc).trim() : undefined,
      });
    };

    collegesData.forEach((college) => {
      pushValue({
        label: college.name,
        href: `/college/${college.id}`,
        type: "college",
        keywords: [college.district, college.state, college.ownershipType ?? '', ...(college.courseTags || [])],
        imageSrc: college.logo || college.image,
      });
      pushValue({
        label: college.district,
        href: `/explore?view=colleges&city=${encodeURIComponent(college.district)}`,
        type: "city",
        keywords: [college.state],
      });
    });

    coursesData.forEach((course) => {
      pushValue({
        label: course.course,
        href: `/explore/course/${encodeURIComponent(course.course)}`,
        type: "course",
        keywords: [course.specialization, course.courseType, course.stream ?? ''],
      });
      pushValue({
        label: course.specialization,
        href: `/explore/course/${encodeURIComponent(course.course)}`,
        type: "course",
        keywords: [course.course, course.stream ?? ''],
      });
    });

    TOP_EXAM_CARDS.forEach((exam) => {
      pushValue({
        label: exam.name,
        href: `/exams/${exam.slug}`,
        type: "exam",
        keywords: [exam.mode, exam.examLevel, exam.examDate],
      });
    });

    HERO_EXAM_NAMES.forEach((exam) =>
      pushValue({
        label: exam,
        href: `/exams/${exam.toLowerCase().replace(/\s+/g, "-")}`,
        type: "exam",
      }),
    );

    return [...unique.values()];
  }, [collegesData, coursesData]);

  const heroSearchSuggestions = useMemo(() => {
    const query = heroSearchInput.trim().toLowerCase();
    if (!query) return [];

    return heroSearchPool
      .filter((item) => {
        if (item.label.toLowerCase().includes(query)) return true;
        return item.keywords.some((keyword) => keyword.includes(query));
      })
      .slice(0, 8);
  }, [heroSearchInput, heroSearchPool]);
  const spotlightColleges = useMemo(() => {
    const bestColleges = collegesData.filter(
      (college) => college.isBestCollege || college.isTopCollege,
    );
    const additionalColleges = collegesData.filter(
      (college) => !college.isBestCollege && !college.isTopCollege,
    ).slice(0, 4);
    return [...bestColleges, ...additionalColleges].slice(0, 8);
  }, [collegesData]);
  const activeCollege = spotlightColleges[activeAction] ?? spotlightColleges[0];
  const getSpotlightImage = (college: College) =>
    String(college.image || college.logo || "").trim();
  const heroStatCards = useMemo(
    () => [
      {
        value: `${collegesData.length}+`,
        label: "Colleges Listed",
        icon: Building2,
        iconClassName: "bg-[rgba(255,138,61,0.12)] text-[#ff8a3d]",
      },
      {
        value: `${exploreCourseCards.length}+`,
        label: "Course Paths",
        icon: BookOpen,
        iconClassName: "bg-[rgba(249,115,22,0.12)] text-[#f97316]",
      },
      {
        value: `${topExamCards.length}+`,
        label: "Exam Tracks",
        icon: Medal,
        iconClassName: "bg-[rgba(251,146,60,0.14)] text-[#fb923c]",
      },
      {
        value: `${new Set(collegesData.map((college) => college.state).filter(Boolean)).size}+`,
        label: "States Covered",
        icon: Globe2,
        iconClassName: "bg-[rgba(236,72,153,0.12)] text-[#ec4899]",
      },
    ],
    [collegesData, exploreCourseCards, topExamCards],
  );
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
      setActiveAction((current) => (current + 1) % Math.max(spotlightColleges.length, 1));
    }, 2800);

    return () => window.clearInterval(timer);
  }, [isSpotlightPaused, spotlightColleges.length]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveFeatureCard((current) => (current + 1) % featureCards.length);
    }, 3300);

    return () => window.clearInterval(timer);
  }, [featureCards.length]);


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

  // Initialize scroll animations
  useScrollAnimation();

  const handleHeroSearch = () => {
    const query = heroSearchInput.trim();
    if (!query) return;
    const exactMatch = heroSearchPool.find((item) => item.label.toLowerCase() === query.toLowerCase());
    if (exactMatch) {
      setShowHeroNoMatch(false);
      router.push(exactMatch.href);
    } else if (heroSearchSuggestions.length > 0) {
      setShowHeroNoMatch(false);
      router.push(heroSearchSuggestions[0].href);
    } else {
      setShowHeroNoMatch(true);
      setIsHeroSearchFocused(true);
      return;
    }
    setHeroSearchInput("");
    setIsHeroSearchFocused(false);
  };

  const handleHeroSuggestionSelect = (value: { label: string; href: string }) => {
    if (!value.href) return;
    setShowHeroNoMatch(false);
    router.push(value.href);
    setHeroSearchInput(value.label);
    setIsHeroSearchFocused(false);
  };

  const homeThemeStyles: ThemeStyleVars = {
    "--brand-primary": "#1e4e79",
    "--brand-primary-soft": "#2f6aa3",
    "--brand-accent": "#ef4444",
    "--brand-accent-deep": "#dc2626",
    "--brand-support": "#2563eb",
    "--surface-base": "#ffffff",
    "--surface-muted": "#ffffff",
    "--surface-soft": "#ffffff",
    "--page-bg": "#ffffff",
    "--text-dark": "#0f172a",
    "--text-muted": "#475569",
  };
  const resolvedHeroImageUrl = String(heroImageUrl || "").trim() || "/college-hero-v2.jpg";
  const activeFeature = featureCards[activeFeatureCard] ?? featureCards[0];
  const renderFeatureCard = (feature: FeatureCardItem, variant: "hero" | "grid" = "grid") => {
    const isHeroCard = variant === "hero";
    const Icon = feature.icon;

    return (
      <div
        className={`overflow-hidden rounded-[1.8rem] border border-[rgba(15,76,129,0.1)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(244,248,255,0.98))] shadow-[0_18px_40px_rgba(15,76,129,0.11)] ${
          isHeroCard ? "flex h-full min-h-[11.75rem] p-3 sm:min-h-[12.5rem] sm:p-3.5" : "p-4"
        }`}
      >
        {isHeroCard ? (
          <>
            <div className="flex w-full flex-1 items-center gap-2.5 sm:gap-3.5">
              <div className="flex min-w-0 flex-1 flex-col items-center justify-center text-center">
                <div className="mb-1.5 inline-flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(15,76,129,0.1)] bg-[linear-gradient(135deg,rgba(29,78,216,0.12),rgba(255,255,255,0.96))] text-[color:var(--brand-primary)] sm:h-[2.125rem] sm:w-[2.125rem]">
                  <Icon className="size-4" />
                </div>
                <h3 className="font-bold tracking-[-0.03em] text-[color:var(--text-dark)] text-[1.02rem] leading-tight sm:text-[1.15rem]">
                  {feature.title}
                </h3>
                <p className="mt-1.5 max-w-[10rem] text-[10px] leading-[1.15rem] text-[color:var(--text-muted)] sm:max-w-[11rem] sm:text-[11px]">
                  {feature.description}
                </p>
              </div>
              <div className="relative w-[46%] shrink-0 overflow-hidden rounded-[1.15rem] border border-[rgba(15,76,129,0.08)] bg-[linear-gradient(180deg,rgba(248,251,255,0.98),rgba(255,255,255,0.92))] p-2 sm:w-[44%]">
                <img
                  src={feature.imageSrc}
                  alt={feature.title}
                  className="mx-auto h-[6.9rem] w-full max-w-[10.25rem] object-contain sm:h-[7.4rem] sm:max-w-[10.9rem]"
                  loading="lazy"
                />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex shrink-0 items-center justify-center rounded-[0.75rem] border border-[rgba(15,76,129,0.1)] bg-[linear-gradient(135deg,rgba(29,78,216,0.12),rgba(255,255,255,0.96))] p-2.5 text-[color:var(--brand-primary)]">
                <Icon className="size-5" />
              </div>
              <div className="flex flex-1 flex-col justify-start">
                <h3 className="font-bold tracking-[-0.03em] text-[color:var(--text-dark)] text-[0.95rem]">
                  {feature.title}
                </h3>
                <p className="mt-1 leading-5 text-[color:var(--text-muted)] text-[12px]">
                  {feature.description}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="home-theme bg-white" style={homeThemeStyles}>
      <section className="relative overflow-hidden bg-white text-[color:var(--text-dark)]">
        <div className="absolute inset-0">
          <div
            className="hero-bg absolute inset-0 bg-cover bg-center opacity-[0.26]"
            style={{ backgroundImage: `url('${resolvedHeroImageUrl}')` }}
          />
          <div className="absolute inset-0 bg-white/55" />
        </div>

        <div className="relative z-10">
          <Navbar />

          {/* feature cards flow */}
          
          <div className="page-container-full pb-[4.5rem]  pt-0 md:pb-[5.5rem]  md:pt-1">
            <div className="space-y-2 py-2">
              {/* hero content */}
              <div className="reveal-up mx-auto mb-1 w-full px-2">
                <div className="relative py-0.5 sm:py-1">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.85),transparent_60%)]" />
                  <div className="pointer-events-none absolute -left-6 top-10 h-32 w-32 rounded-full bg-[rgba(59,130,246,0.12)] blur-3xl" />
                  <div className="pointer-events-none absolute right-0 top-6 h-32 w-32 rounded-full bg-[rgba(239,68,68,0.14)] blur-3xl" />

                  <div className="relative space-y-1 ">
                    <div className="grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,0.82fr)] lg:items-start">
                      <div className="flex h-full flex-col justify-start space-y-3">
                        <div className="mx-auto max-w-[38rem] py-3 text-center lg:mx-auto">
                          <h1 className="text-[2.05rem] font-black leading-[0.98] tracking-[-0.05em] text-[#163761] sm:text-[2.55rem] lg:text-[2.95rem]">
                            Find Your{" "}
                            <span className="text-[#2563eb]">
                              Future College
                            </span>{" "}
                            Smartly.
                          </h1>
                          <p className="mx-auto mt-3 max-w-[34rem] text-[13px] leading-6 text-[color:var(--text-muted)] sm:text-[14px]">
                            Discover colleges, courses, exams, and cities from one premium search flow built to help you shortlist faster and decide with more confidence.
                          </p>
                        </div>
                        {/* Features card pop */}

                        <div className="relative mx-auto w-full max-w-[15.5rem] sm:max-w-[17rem] lg:max-w-[30rem]">
                          <div key={`${activeFeature.title}-${activeFeatureCard}`} className="feature-pop-card absolute inset-0">
                            {renderFeatureCard(activeFeature, "hero")}
                          </div>
                          <div className="min-h-[12.75rem] sm:min-h-[9rem]" />
                        </div>
                      </div>

                      {/* Top colleges flow */}
                      <div className="lg:ml-auto lg:w-full lg:max-w-[33rem]">
                        <div className="flex h-full flex-col rounded-[1.8rem] border border-[rgba(15,76,129,0.1)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(244,248,255,0.98))] p-4 shadow-[0_18px_40px_rgba(15,76,129,0.11)]">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-[13px] font-semibold uppercase tracking-[0.22em] text-[color:var(--brand-primary-soft)]">
                              Top College Flow
                            </p>
                            <div className="flex gap-1.5">
                              {spotlightColleges.map((college, index) => (
                                <span
                                  key={college.id}
                                  className={`h-1.5 rounded-full transition-all ${index === activeAction ? "w-6 bg-[color:var(--brand-primary)]" : "w-2 bg-[rgba(15,76,129,0.18)]"
                                    }`}
                                />
                              ))}
                            </div>
                          </div>

                          <div
                            className="relative mt-3 h-36 overflow-hidden rounded-[1.3rem] border border-[rgba(15,76,129,0.08)] bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(241,248,255,0.95))] sm:h-40"
                            onMouseEnter={() => setIsSpotlightPaused(true)}
                            onMouseLeave={() => setIsSpotlightPaused(false)}
                          >
                            <div
                              className="flex h-full w-full transition-transform duration-700 ease-out"
                              style={{ transform: `translateX(-${activeAction * 100}%)` }}
                            >
                              {spotlightColleges.map((college) => (
                                <div key={college.id} className="relative h-full w-full min-w-full shrink-0 basis-full overflow-hidden">
                                  {!getSpotlightImage(college) || brokenCollegeImages[college.id] ? (
                                    <div className="flex h-full w-full items-end bg-[linear-gradient(135deg,rgba(15,76,129,0.88),rgba(255,138,61,0.68))] p-4">
                                      <div>
                                        <p className="text-[15px] font-semibold text-white">{college.name}</p>
                                        <p className="mt-1 text-[11px] text-white/80">
                                          {college.district}, {college.state}
                                        </p>
                                      </div>
                                    </div>
                                  ) : (
                                    <img
                                      src={getSpotlightImage(college)}
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
                                  <div className="absolute bottom-3 left-3 right-3">
                                    <p className="text-[15px] font-semibold text-white">{college.name}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="mt-3 rounded-[1.1rem] border border-[rgba(15,76,129,0.08)] bg-white/90 p-3">
                            <p className="text-[14px] font-semibold text-[color:var(--text-dark)]">
                              {activeCollege?.name || "Top College"}
                            </p>
                            <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[10px] text-[color:var(--text-muted)]">
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="size-3" />
                                {activeCollege ? `${activeCollege.district}, ${activeCollege.state}` : "Location unavailable"}
                              </span>
                            </div>
                            <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
                              <div className="rounded-[0.95rem] border border-[rgba(15,76,129,0.1)] bg-[rgba(15,76,129,0.03)] p-2.5">
                                <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[color:var(--brand-primary-soft)]">
                                  Placement
                                </p>
                                <p className="mt-1.5 text-base font-bold text-[color:var(--text-dark)]">
                                  {activeCollege?.placementRate ? `${activeCollege.placementRate}%` : "-"}
                                </p>
                                <p className="mt-0.5 text-[10px] leading-4 text-[color:var(--text-muted)]">
                                  Recent placement performance
                                </p>
                              </div>
                              <div className="rounded-[0.95rem] border border-[rgba(239,68,68,0.18)] bg-[rgba(239,68,68,0.06)] p-2.5">
                                <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[color:var(--brand-accent-deep)]">
                                  Accreditation
                                </p>
                                <p className="mt-1.5 text-base font-bold text-[color:var(--text-dark)]">
                                  {activeCollege?.accreditation || "-"}
                                </p>
                                <p className="mt-0.5 text-[10px] leading-4 text-[color:var(--text-muted)]">
                                  Latest approved accreditation status
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Search bar */}
                    <div className="hero-search-shell group relative z-[70] mx-auto mt-5 w-full max-w-none px-0 py-5 sm:mt-6">
                      <div className="hero-search-input relative z-[2] overflow-hidden rounded-[1.65rem] border border-[rgba(255,138,61,0.22)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,248,255,0.98))] p-1.5 shadow-[0_18px_36px_rgba(22,50,79,0.11)] ring-1 ring-[rgba(255,138,61,0.08)]">
                        <div className="grid gap-2 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_auto] md:items-center md:gap-0">
                          <div className="relative min-w-0 px-5 py-3 md:border-r md:border-[rgba(15,76,129,0.1)]">
                            <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--brand-primary-soft)]">
                              <Search className="size-4" />
                              Search Colleges
                            </div>
                            {!heroSearchInput ? (
                              <div className="pointer-events-none absolute inset-x-5 bottom-3 flex items-center overflow-hidden text-[16px] text-[color:var(--text-muted)]">
                                {typedSearchText}
                                <span className="ml-0.5 inline-block text-[color:var(--brand-accent)]">|</span>
                              </div>
                            ) : null}
                            <input
                              type="text"
                              value={heroSearchInput}
                              onChange={(event) => {
                                const nextValue = event.target.value;
                                setHeroSearchInput(nextValue);
                                if (showHeroNoMatch) {
                                  setShowHeroNoMatch(false);
                                }
                              }}
                              onFocus={() => setIsHeroSearchFocused(true)}
                              onBlur={() => {
                                window.setTimeout(() => setIsHeroSearchFocused(false), 120);
                              }}
                              onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                  event.preventDefault();
                                  handleHeroSearch();
                                }
                              }}
                              placeholder=""
                              className="min-h-[2rem] w-full border-0 bg-transparent px-0 pb-0 pt-0 text-[16px] text-[color:var(--text-dark)] outline-none placeholder:text-[color:var(--text-muted)]"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => router.push("/explore")}
                            className="flex min-h-[4.1rem] items-center gap-3 rounded-[1.15rem] bg-white px-5 py-3 text-left transition hover:bg-[rgba(15,76,129,0.04)] md:rounded-none md:border-r md:border-[rgba(15,76,129,0.1)] md:bg-transparent"
                          >
                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(30,78,121,0.08)] text-[color:var(--brand-primary)]">
                              <MapPin className="size-[1.1rem]" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-[14px] font-medium text-[color:var(--text-dark)]">
                                Location · Tamil Nadu, Chennai
                              </span>
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => router.push("/explore")}
                            className="flex min-h-[4.1rem] items-center gap-3 rounded-[1.15rem] bg-white px-5 py-3 text-left transition hover:bg-[rgba(15,76,129,0.04)] md:rounded-none md:border-r md:border-[rgba(15,76,129,0.1)] md:bg-transparent"
                          >
                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(239,68,68,0.08)] text-[color:var(--brand-accent)]">
                              <CourseIcon className="size-[1.1rem]" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-[14px] font-medium text-[color:var(--text-dark)]">
                                Course · B.Tech, MBA, Design
                              </span>
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={handleHeroSearch}
                            className="inline-flex h-12 min-h-[3.25rem] w-full items-center justify-center gap-2 rounded-[1.05rem] bg-[linear-gradient(135deg,#1d4ed8_0%,#2563eb_52%,#38bdf8_100%)] px-5 text-[15px] font-semibold text-white shadow-[0_12px_24px_rgba(37,99,235,0.24)] transition hover:translate-y-[-1px] hover:shadow-[0_16px_28px_rgba(56,189,248,0.22)] md:mx-2 md:min-w-[7.5rem] md:w-auto"
                          >
                            Find
                            <Search className="size-[1.1rem]" />
                          </button>
                        </div>
                      </div>

                      {isHeroSearchFocused &&
                      heroSearchInput.trim().length > 0 &&
                      (heroSearchSuggestions.length > 0 || showHeroNoMatch) ? (
                        <div className="absolute left-0 right-0 top-[calc(100%+0.8rem)] z-[120] overflow-hidden rounded-[1.2rem] border border-[rgba(29,78,216,0.18)] bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(243,248,255,0.97))] p-1.5 shadow-[0_24px_48px_rgba(29,78,216,0.16)] backdrop-blur-sm">
                          {heroSearchSuggestions.length > 0 ? (
                            heroSearchSuggestions.map((item) => (
                              <button
                                key={item.id}
                                type="button"
                                onMouseDown={(event) => {
                                  event.preventDefault();
                                  handleHeroSuggestionSelect(item);
                                }}
                                className="flex w-full items-center gap-2 rounded-[0.9rem] px-3 py-2.5 text-left text-sm text-[color:var(--text-dark)] transition hover:bg-[rgba(29,78,216,0.07)]"
                              >
                                {item.type === "college" && item.imageSrc && !brokenHeroSuggestionImages[item.id] ? (
                                  <span className="inline-flex h-9 w-9 shrink-0 overflow-hidden rounded-full border border-[rgba(29,78,216,0.12)] bg-white shadow-[0_6px_16px_rgba(29,78,216,0.1)]">
                                    <img
                                      src={item.imageSrc}
                                      alt={item.label}
                                      className="h-full w-full object-cover"
                                      onError={() =>
                                        setBrokenHeroSuggestionImages((current) => ({
                                          ...current,
                                          [item.id]: true,
                                        }))
                                      }
                                    />
                                  </span>
                                ) : (
                                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[rgba(29,78,216,0.12)] text-[color:var(--brand-primary)]">
                                    <Search className="size-4" />
                                  </span>
                                )}
                                <span className="min-w-0 flex-1">
                                  <span className="block truncate font-medium">{item.label}</span>
                                  <span className="mt-0.5 block text-[11px] uppercase tracking-[0.08em] text-[color:var(--text-muted)]">
                                    {item.type}
                                  </span>
                                </span>
                              </button>
                            ))
                          ) : (
                            <div className="rounded-[0.9rem] px-4 py-4 text-left">
                              <p className="text-sm font-semibold text-[color:var(--text-dark)]">Not found</p>
                              <p className="mt-1 text-xs leading-5 text-[color:var(--text-muted)]">
                                No matching college, course, location, or exam found for {heroSearchInput.trim()}.
                              </p>
                            </div>
                          )}
                        </div>
                      ) : null}
                    </div>

                    <div className="mx-auto grid w-[80%] max-w-[69rem] grid-cols-4 gap-2.5">
                      {heroStatCards.map((item) => (
                        <div key={item.label} className="rounded-[1rem] border border-[rgba(15,76,129,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(250,247,243,0.96))] px-3 py-3 shadow-[0_10px_20px_rgba(15,76,129,0.06)]">
                          <div className="flex items-center gap-2.5">
                            <span className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${item.iconClassName}`}>
                              <item.icon className="size-4" />
                            </span>
                            <div className="min-w-0">
                              <p className="text-[1.15rem] font-bold leading-none text-[color:var(--text-dark)] sm:text-[1.35rem]">{item.value}</p>
                              <p className="mt-1 text-[11px] font-medium leading-4 text-[color:var(--text-muted)]">{item.label}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>
                  {/* cutoff banner */}

                  <div className="mx-auto w-full max-w-none">
                    <div className="mt-6">
                      <article className="relative overflow-hidden rounded-[2rem] border border-[rgba(37,99,235,0.2)] bg-[linear-gradient(132deg,rgba(255,255,255,0.98),rgba(239,246,255,0.98)_52%,rgba(219,234,254,0.98))] p-6 text-[color:var(--text-dark)] shadow-[0_24px_54px_rgba(30,64,175,0.16)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_28px_62px_rgba(30,64,175,0.22)] md:p-8 scroll-fade-in" data-scroll-animate>
                        <div className="pointer-events-none absolute -left-14 -top-16 h-44 w-44 rounded-full bg-[rgba(96,165,250,0.22)] blur-3xl" />
                        <div className="pointer-events-none absolute -bottom-14 right-0 h-52 w-52 rounded-full bg-[rgba(59,130,246,0.18)] blur-3xl" />
                        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                          <div className="max-w-2xl">
                            <span className="inline-flex rounded-full border border-[rgba(37,99,235,0.3)] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3b82f6]">
                              Cutoff Zone
                            </span>
                            <h3 className="mt-4 text-2xl font-bold leading-tight md:text-3xl">
                              Predict Smarter, Apply Better
                            </h3>
                            <p className="mt-2 max-w-xl text-sm leading-6 text-[color:var(--text-muted)] md:text-base">
                              Enter marks, choose your degree, and instantly view cutoff-based college matches with confidence.
                            </p>
                            <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-[color:var(--brand-primary)]">
                              <span className="rounded-full border border-[rgba(29,78,216,0.2)] bg-white/95 px-3 py-1">Fast prediction</span>
                              <span className="rounded-full border border-[rgba(29,78,216,0.2)] bg-white/95 px-3 py-1">Category-wise fit</span>
                              <span className="rounded-full border border-[rgba(29,78,216,0.2)] bg-white/95 px-3 py-1">One form flow</span>
                            </div>
                          </div>
                          <div className="shrink-0">
                            <button
                              type="button"
                              onClick={() => router.push("/find")}
                              className="inline-flex items-center gap-2 rounded-full border border-[rgba(37,99,235,0.3)] bg-[#3b82f6] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(37,99,235,0.28)] transition hover:bg-[#2563eb] hover:shadow-[0_14px_34px_rgba(37,99,235,0.32)]"
                            >
                              Go To Cutoff Form
                              <ArrowRight className="size-4" />
                            </button>
                          </div>
                        </div>
                      </article>
                    </div>

                    <div className="reveal-up delay-3 mt-8 pt-3">
                      <div className="rounded-[2rem] border border-[rgba(15,76,129,0.08)] bg-[linear-gradient(180deg,#ffffff,#f5faff)] p-5 shadow-[0_22px_50px_rgba(22,50,79,0.08)] md:p-6 scroll-fade-in scroll-delay-2" data-scroll-animate>
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
                                className="group rounded-[1.05rem] border border-[rgba(15,76,129,0.1)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,249,255,0.96))] px-3 py-2.5 text-left shadow-[0_12px_26px_rgba(22,50,79,0.07)] transition duration-300 hover:-translate-y-0.5 hover:border-[rgba(239,68,68,0.35)] hover:shadow-[0_18px_32px_rgba(22,50,79,0.12)]"
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <div className="rounded-[0.8rem] border border-[rgba(15,76,129,0.08)] bg-[linear-gradient(135deg,rgba(239,68,68,0.14),rgba(255,255,255,0.94))] p-1.5 text-[color:var(--brand-accent-deep)] transition group-hover:scale-[1.03]">
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
          </div>
        </div>
      </section>

      <section className="section-shell page-section bg-[color:var(--surface-muted)] text-slate-800">
        <div className="page-container-full relative z-10 max-w-[1120px] px-4 sm:px-6">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="scroll-fade-in" data-scroll-animate>
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
              className="scroll-fade-in scroll-delay-2 inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--brand-primary)]"
              data-scroll-animate
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
              className="flex gap-3 overflow-x-auto overflow-y-visible pb-6 pt-2 scroll-smooth scrollbar-hide"
            >
              {exploreCourseCards.slice(0, 10).map((course, index) => {
                const delays = ["", "scroll-delay-1", "scroll-delay-2", "scroll-delay-3", "scroll-delay-4"];
                return (
                  <article
                    key={course.id}
                    className={`luxe-card flex h-[19rem] w-[14rem] shrink-0 flex-col p-4 sm:h-[20rem] sm:w-[17.25rem] lg:h-[21rem] lg:w-[19rem] scroll-fade-in ${delays[index % 5]}`}
                    data-scroll-animate
                  >
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-[rgba(16,37,78,0.08)] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[color:var(--brand-primary)]">
                        {course.isTopCourse ? "Top Course" : "Course"}
                      </span>
                    </div>
                    <h3 className="mt-4 line-clamp-2 font-[family:var(--font-display)] text-[1.28rem] leading-tight text-[color:var(--text-dark)] sm:text-[1.42rem]">
                      {course.course}
                    </h3>
                    <dl className="mt-4 space-y-2 text-sm">
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
                      className="mt-auto inline-flex items-center gap-2 rounded-full border border-[rgba(37,99,235,0.3)] bg-[#3b82f6] px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(37,99,235,0.22)] transition hover:bg-[#2563eb] hover:shadow-[0_12px_28px_rgba(37,99,235,0.28)]"
                    >
                      Course Overview
                      <ArrowRight className="size-4" />
                    </button>
                  </article>
                );
              })}
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

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featureCards.map((item, index) => {
              const Icon = item.icon;
              const delays = ["", "scroll-delay-1", "scroll-delay-2", "scroll-delay-3"];
              return (
                <article
                  key={item.title}
                  className={`luxe-card flex flex-col gap-3 p-5 scroll-fade-in ${delays[Math.min(index, 3)]}`}
                  data-scroll-animate
                >
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[rgba(15,76,129,0.16)] bg-white shadow-[0_10px_24px_rgba(15,76,129,0.12)]">
                    <Icon className="size-5 text-[color:var(--brand-primary)]" />
                  </div>
                  <h3 className="text-base font-semibold text-[color:var(--text-dark)]">{item.title}</h3>
                  <p className="text-sm leading-6 text-[color:var(--text-muted)]">{item.description}</p>
                </article>
              );
            })}
          </div>

          <div className="mt-12 w-full scroll-fade-in" data-scroll-animate>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-2xl font-bold text-[color:var(--text-dark)] md:text-3xl">Top Exams</h2>
              <button
                type="button"
                onClick={() => router.push("/search?type=exam")}
                className="inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--brand-primary)]"
              >
                Explore all
                <ArrowRight className="size-4" />
              </button>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {topExamCards.map((exam, index) => {
                const delays = ["", "scroll-delay-1", "scroll-delay-2", "scroll-delay-3", "scroll-delay-4"];
                return (
                  <article
                    key={exam.name}
                    onClick={() => router.push(`/exams/${exam.slug}`)}
                    className={`luxe-card relative flex h-full min-h-[18rem] w-full flex-col gap-3 p-4 scroll-fade-in ${delays[index % 5]}`}
                    data-scroll-animate
                  >
                    <span
                      className={`absolute right-3 top-3 inline-flex rounded-md px-2.5 py-0.5 text-[11px] font-semibold ${
                        exam.mode === "Online Exam"
                          ? "bg-[rgba(34,197,94,0.14)] text-[rgb(21,128,61)]"
                          : "bg-[rgba(249,115,22,0.14)] text-[rgb(194,65,12)]"
                      }`}
                    >
                      {exam.mode}
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 overflow-hidden rounded-full border border-[rgba(15,76,129,0.16)] bg-white shadow-[0_10px_24px_rgba(15,76,129,0.12)]">
                        <img
                          src={exam.logo}
                          alt={`${exam.name} logo`}
                          className="h-full w-full object-contain p-1"
                          loading="lazy"
                        />
                      </div>
                      <div>
                        <h3 className="mt-1 text-[1.25rem] font-semibold leading-none text-[color:var(--text-dark)]">
                          {exam.name}
                        </h3>
                      </div>
                    </div>

                    <dl className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between gap-2 border-b border-[rgba(20,32,51,0.08)] pb-1.5">
                        <dt className="text-[color:var(--text-muted)]">Colleges</dt>
                        <dd className="font-semibold text-[color:var(--text-dark)]">{exam.participatingColleges}</dd>
                      </div>
                      <div className="flex items-center justify-between gap-2 border-b border-[rgba(20,32,51,0.08)] pb-1.5">
                        <dt className="text-[color:var(--text-muted)]">Exam Date</dt>
                        <dd className="font-semibold text-[color:var(--text-dark)]">{exam.examDate}</dd>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <dt className="text-[color:var(--text-muted)]">Level</dt>
                        <dd className="font-semibold text-[color:var(--text-dark)]">{exam.examLevel}</dd>
                      </div>
                    </dl>

                    <div className="mt-auto space-y-1.5 border-t border-[rgba(20,32,51,0.08)] pt-2">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          router.push(`/exams/${exam.slug}`);
                        }}
                        className="flex w-full items-center justify-between text-left text-sm font-semibold text-[color:var(--text-dark)]"
                      >
                        Application Process
                        <ArrowRight className="size-4 text-[color:var(--brand-primary)]" />
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          router.push(`/exams/${exam.slug}`);
                        }}
                        className="flex w-full items-center justify-between border-t border-[rgba(20,32,51,0.08)] pt-1.5 text-left text-sm font-semibold text-[color:var(--text-dark)]"
                      >
                        Exam Info
                        <ArrowRight className="size-4 text-[color:var(--brand-primary)]" />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
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
          <div className="relative mx-auto max-w-4xl overflow-hidden rounded-[2rem] border border-[rgba(15,76,129,0.16)] bg-[linear-gradient(135deg,#ffffff,#f2f5ff)] p-6 shadow-[0_18px_44px_rgba(12,31,58,0.18),0_10px_26px_rgba(10,18,34,0.14)] md:p-8 scroll-scale-in" data-scroll-animate>
            <div className="pointer-events-none absolute -right-10 top-6 h-32 w-32 rounded-full bg-[rgba(239,68,68,0.28)] blur-3xl" />
            <div className="pointer-events-none absolute -bottom-10 left-6 h-28 w-28 rounded-full bg-[rgba(14,116,144,0.22)] blur-3xl" />
            <div className="relative z-10 mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--brand-primary-soft)] scroll-fade-in" data-scroll-animate>
                Newsletter
              </p>
              <h2 className="section-title mt-3 text-balance scroll-fade-in scroll-delay-1" data-scroll-animate>
                Get sharper updates on colleges, exams, and opportunities.
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600 md:text-base scroll-fade-in scroll-delay-2" data-scroll-animate>
                A cleaner form, stronger contrast, and a more premium finish so the last section feels as polished as the hero.
              </p>
            </div>

            <form className="relative z-10 mx-auto mt-8 grid w-full max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
              <div className="rounded-[1.4rem] border border-[rgba(15,76,129,0.2)] bg-[linear-gradient(180deg,#ffffff,#f7f9ff)] px-4 py-2 shadow-[0_12px_26px_rgba(16,37,78,0.12)] transition focus-within:border-[rgba(15,76,129,0.4)] focus-within:ring-4 focus-within:ring-[rgba(14,116,144,0.16)]">
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600">Email</label>
                <div className="flex items-center gap-2">
                  <Mail className="size-4 shrink-0 text-[color:var(--brand-primary-soft)]" />
                  <input type="email" placeholder="your@email.com" className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400" />
                </div>
              </div>
              <div className="rounded-[1.4rem] border border-[rgba(15,76,129,0.2)] bg-[linear-gradient(180deg,#ffffff,#f7f9ff)] px-4 py-2 shadow-[0_12px_26px_rgba(16,37,78,0.12)] transition focus-within:border-[rgba(15,76,129,0.4)] focus-within:ring-4 focus-within:ring-[rgba(14,116,144,0.16)]">
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600">Phone</label>
                <div className="flex items-center gap-2">
                  <Phone className="size-4 shrink-0 text-[color:var(--brand-primary-soft)]" />
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]{10}"
                    maxLength={10}
                    placeholder="10-digit number"
                    className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                    onInput={(event) => {
                      const target = event.currentTarget;
                      target.value = target.value.replace(/\D/g, "").slice(0, 10);
                    }}
                  />
                </div>
              </div>
              <div className="rounded-[1.4rem] border border-[rgba(15,76,129,0.2)] bg-[linear-gradient(180deg,#ffffff,#f7f9ff)] px-4 py-2 shadow-[0_12px_26px_rgba(16,37,78,0.12)] transition focus-within:border-[rgba(15,76,129,0.4)] focus-within:ring-4 focus-within:ring-[rgba(14,116,144,0.16)]">
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600">Course</label>
                <div className="flex items-center gap-2">
                  <CourseIcon className="size-4 shrink-0 text-[color:var(--brand-primary-soft)]" />
                  <input type="text" placeholder="B.Tech, MBA, etc." className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400" />
                </div>
              </div>
              <div className="flex items-stretch sm:col-span-2 md:col-span-1">
                <button
                  type="submit"
                  className="shine-button w-full rounded-[1.4rem] border border-[rgba(37,99,235,0.3)] bg-[#3b82f6] px-6 py-2 text-sm font-semibold text-white shadow-[0_16px_32px_rgba(37,99,235,0.24)] transition hover:bg-[#2563eb] hover:shadow-[0_18px_36px_rgba(37,99,235,0.3)]"
                >
                  Join Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
