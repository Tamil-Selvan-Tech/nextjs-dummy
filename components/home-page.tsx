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
  Rocket,
  Search,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Navbar } from "@/components/navbar";
import { colleges as fallbackColleges, courses as fallbackCourses, type College, type Course } from "@/lib/site-data";
import { formatCompactIndianCurrencyRange } from "@/lib/currency-format";
import { normalizeSearchText } from "@/lib/search-utils";

// Custom hook for scroll animations
function useScrollAnimation() {
  // Scroll indicators, autoplay, and typing animations
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
  "Search for course",
  "Search for college",
  "Search for location",
];
const TOP_EXAM_CARDS = [
  {
    id: "jee-main",
    name: "JEE Main",
    slug: "jee-main",
    href: "/exams/jee-main",
    logo: "/exams/jee-main.svg",
    mode: "Online Exam",
    participatingColleges: "2031",
    examDate: "April 02, 2026",
    examLevel: "National",
  },
  {
    id: "jee-advanced",
    name: "JEE Advanced",
    slug: "jee-advanced",
    href: "/exams/jee-advanced",
    logo: "/exams/jee-advanced.svg",
    mode: "Online Exam",
    participatingColleges: "73",
    examDate: "May 17, 2026",
    examLevel: "National",
  },
  {
    id: "cuet",
    name: "CUET",
    slug: "cuet",
    href: "/exams/cuet",
    logo: "/exams/cuet.svg",
    mode: "Offline Exam",
    participatingColleges: "584",
    examDate: "May 11, 2026",
    examLevel: "National",
  },
  {
    id: "neet",
    name: "NEET",
    slug: "neet",
    href: "/exams/neet",
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
  examSchedules?: Array<{
    id?: string;
    examName?: string;
    applicationFees?: string;
    startDateToApply?: string;
    lastDateToApply?: string;
    correctionDate?: string;
    lastDateForFeePayment?: string;
    admitCardRelease?: string;
    examDate?: string;
    resultDate?: string;
    updatedAt?: string;
  }>;
};

type ThemeStyleVars = CSSProperties & Record<`--${string}`, string>;
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
  {
    title: "Fund & Training",
    description: "Access scholarships, financial aid, and training programs for your education.",
    icon: BriefcaseBusiness,
    imageSrc: "/features/features-img-7.png",
  },
  {
    title: "Internship & Jobs",
    description: "Explore internship opportunities and job placements from partner companies.",
    icon: Rocket,
    imageSrc: "/features/features-img-8.png",
  },
  {
    title: "Project Guidance & Funding",
    description: "Get expert guidance on projects and access funding opportunities.",
    icon: Sparkles,
    imageSrc: "/features/features-img-9.png",
  },
];

export function HomePage({
  collegesData = fallbackColleges,
  coursesData = fallbackCourses,
  heroImageUrl = "",
  examSchedules = [],
}: HomePageProps) {
  const router = useRouter();
  const featureCards = FEATURE_CARDS;

  // Home page search and interaction state
  const [collegeSearchInput, setCollegeSearchInput] = useState("");
  const [locationSearchInput, setLocationSearchInput] = useState("");
  const [courseSearchInput, setCourseSearchInput] = useState("");
  const [activeAction, setActiveAction] = useState(0);
  const [activeFeatureCard, setActiveFeatureCard] = useState(0);
  const [isSpotlightPaused, setIsSpotlightPaused] = useState(false);
  const [typedSearchText, setTypedSearchText] = useState("");
  const [activeSearchField, setActiveSearchField] = useState<"college" | "location" | "course" | null>(null);
  const [brokenCollegeImages, setBrokenCollegeImages] = useState<Record<string, boolean>>({});
  const [brokenHeroSuggestionImages, setBrokenHeroSuggestionImages] = useState<Record<string, boolean>>({});
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const trendingCoursesScrollRef = useRef<HTMLDivElement | null>(null);
  const topExamsScrollRef = useRef<HTMLDivElement | null>(null);
  const collegesScrollContainerRef = useRef<HTMLDivElement | null>(null);
  const searchFieldBlurTimeoutRef = useRef<number | null>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [showLeftArrowTrendingCourses, setShowLeftArrowTrendingCourses] = useState(false);
  const [showRightArrowTrendingCourses, setShowRightArrowTrendingCourses] = useState(true);
  const [showLeftArrowTopExams, setShowLeftArrowTopExams] = useState(false);
  const [showRightArrowTopExams, setShowRightArrowTopExams] = useState(true);
  const [showLeftArrowColleges, setShowLeftArrowColleges] = useState(false);
  const [showRightArrowColleges, setShowRightArrowColleges] = useState(true);
  const [activeTrendingCourseIndex, setActiveTrendingCourseIndex] = useState(0);

  // Search bar submit and focus handlers
  const handleHeroSearch = useCallback(() => {
    if (searchFieldBlurTimeoutRef.current !== null) {
      window.clearTimeout(searchFieldBlurTimeoutRef.current);
      searchFieldBlurTimeoutRef.current = null;
    }
    setActiveSearchField(null);
    const collegeValue = collegeSearchInput.trim();
    const courseValue = courseSearchInput.trim();
    const locationValue = locationSearchInput.trim();
    const combinedQuery = [courseValue, collegeValue, locationValue].filter(Boolean).join(" ").trim();

    if (!combinedQuery) {
      router.push("/search");
      return;
    }

    const normalizedCollegeQuery = normalizeSearchText(collegeValue);
    const normalizedCourseQuery = normalizeSearchText(courseValue);
    const normalizedLocationQuery = normalizeSearchText(locationValue);
    const hasCollege = Boolean(normalizedCollegeQuery);
    const hasCourse = Boolean(normalizedCourseQuery);
    const hasLocation = Boolean(normalizedLocationQuery);

    if (hasLocation && !hasCollege && !hasCourse) {
      const matchedLocationCollege = collegesData.find((college) => {
        const district = normalizeSearchText(college.district);
        const state = normalizeSearchText(college.state);
        const city = normalizeSearchText(college.city || "");
        const fullLocation = normalizeSearchText([college.district, college.state].filter(Boolean).join(" "));
        return (
          district === normalizedLocationQuery ||
          state === normalizedLocationQuery ||
          city === normalizedLocationQuery ||
          fullLocation === normalizedLocationQuery ||
          district.includes(normalizedLocationQuery) ||
          state.includes(normalizedLocationQuery) ||
          city.includes(normalizedLocationQuery) ||
          fullLocation.includes(normalizedLocationQuery)
        );
      });

      if (matchedLocationCollege) {
        const cityFilterValue =
          normalizeSearchText(matchedLocationCollege.district) === normalizedLocationQuery ||
            normalizeSearchText(matchedLocationCollege.district).includes(normalizedLocationQuery)
            ? matchedLocationCollege.district
            : normalizeSearchText(matchedLocationCollege.city || "") === normalizedLocationQuery ||
              normalizeSearchText(matchedLocationCollege.city || "").includes(normalizedLocationQuery)
              ? matchedLocationCollege.city || matchedLocationCollege.district
              : matchedLocationCollege.state;

        router.push(`/explore?view=colleges&city=${encodeURIComponent(cityFilterValue)}`);
        return;
      }

      router.push(`/explore?view=colleges&city=${encodeURIComponent(locationValue)}`);
      return;
    }

    if (hasCourse && !hasCollege && !hasLocation) {
      const matchedCourse = coursesData.find(
        (course) =>
          normalizeSearchText(course.course) === normalizedCourseQuery ||
          normalizeSearchText(course.course).includes(normalizedCourseQuery),
      );
      if (matchedCourse) {
        router.push(`/explore/course/${encodeURIComponent(matchedCourse.course)}`);
        return;
      }

      router.push(`/search-results?q=${encodeURIComponent(courseValue)}`);
      return;
    }

    if (hasCollege) {
      const exactCollegeMatch = collegesData.find(
        (college) => normalizeSearchText(college.name) === normalizedCollegeQuery,
      );
      if (exactCollegeMatch) {
        router.push(`/college/${exactCollegeMatch.id}`);
        return;
      }
    }

    const scoredCollegeMatches = collegesData
      .map((college) => {
        const collegeName = normalizeSearchText(college.name);
        const universityName = normalizeSearchText(college.university);
        const locationText = normalizeSearchText(
          [college.district, college.state, college.city].filter(Boolean).join(" "),
        );
        const courseText = normalizeSearchText(
          [
            ...(college.courseTags || []),
            ...(college.streams || []),
            ...coursesData
              .filter(
                (course) =>
                  String(course.collegeId || "").trim() === college.id ||
                  normalizeSearchText(course.college) === collegeName,
              )
              .flatMap((course) => [
                course.course,
                course.specialization,
                course.courseType,
                course.courseCategory,
                course.degreeType,
                course.stream,
              ]),
          ]
            .filter(Boolean)
            .join(" "),
        );

        let score = 0;

        if (hasCollege) {
          const matchesCollege =
            collegeName.includes(normalizedCollegeQuery) ||
            universityName.includes(normalizedCollegeQuery);
          if (!matchesCollege) return null;
          score += collegeName === normalizedCollegeQuery ? 320 : 160;
        }

        if (hasLocation) {
          if (!locationText.includes(normalizedLocationQuery)) return null;
          score += 120;
        }

        if (hasCourse) {
          if (!courseText.includes(normalizedCourseQuery)) return null;
          score += courseText.split(" ").includes(normalizedCourseQuery) ? 180 : 140;
        }

        if (!hasCollege && !hasCourse && !hasLocation) {
          return null;
        }

        score += college.isBestCollege ? 20 : 0;
        score += Math.min(college.placementRate || 0, 100) / 10;

        return { college, score };
      })
      .filter((entry): entry is { college: College; score: number } => Boolean(entry))
      .sort((left, right) => right.score - left.score || right.college.placementRate - left.college.placementRate);

    if (scoredCollegeMatches[0]) {
      router.push(`/college/${scoredCollegeMatches[0].college.id}`);
      return;
    }

    if (hasCourse) {
      const exactCourseMatch = coursesData.find(
        (course) =>
          normalizeSearchText(course.course) === normalizedCourseQuery ||
          normalizeSearchText(course.course).includes(normalizedCourseQuery),
      );
      if (exactCourseMatch) {
        router.push(`/explore/course/${encodeURIComponent(exactCourseMatch.course)}`);
        return;
      }
    }

    router.push(`/search-results?q=${encodeURIComponent(combinedQuery)}`);
  }, [collegeSearchInput, collegesData, courseSearchInput, coursesData, locationSearchInput, router]);
  const activateSearchField = useCallback((field: "college" | "location" | "course") => {
    if (searchFieldBlurTimeoutRef.current !== null) {
      window.clearTimeout(searchFieldBlurTimeoutRef.current);
      searchFieldBlurTimeoutRef.current = null;
    }
    setActiveSearchField(field);
  }, []);
  const scheduleSearchFieldClose = useCallback(() => {
    if (searchFieldBlurTimeoutRef.current !== null) {
      window.clearTimeout(searchFieldBlurTimeoutRef.current);
    }
    searchFieldBlurTimeoutRef.current = window.setTimeout(() => {
      setActiveSearchField(null);
      searchFieldBlurTimeoutRef.current = null;
    }, 120);
  }, []);

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
          course: course,
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

  // Derived cards and lists used across the home page
  const topExamCards = useMemo(() => {
    const normalizeExamName = (value: string) =>
      String(value || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim();

    const scheduleMap = new Map(
      (Array.isArray(examSchedules) ? examSchedules : [])
        .map((item, index) => ({
          id: String(item?.id || `${index}`),
          examName: String(item?.examName || "").trim(),
          examDate: String(item?.examDate || "").trim(),
          updatedAt: String(item?.updatedAt || "").trim(),
        }))
        .filter((item) => item.examName)
        .sort(
          (left, right) =>
            new Date(right.updatedAt || 0).getTime() -
            new Date(left.updatedAt || 0).getTime(),
        )
        .map((item) => [normalizeExamName(item.examName), item]),
    );

    return TOP_EXAM_CARDS.map((item) => {
      const matchedSchedule = scheduleMap.get(normalizeExamName(item.name));
      return {
        ...item,
        examDate: matchedSchedule?.examDate || item.examDate,
      };
    });
  }, [examSchedules]);
  // Search suggestion data for course, college, and location fields
  const locationSuggestions = useMemo(() => {
    const unique = new Map<string, { id: string; label: string; district: string; state: string }>();
    collegesData.forEach((college) => {
      const district = String(college.district || "").trim();
      const state = String(college.state || "").trim();
      const label = [district, state].filter(Boolean).join(", ");
      const key = label.toLowerCase();
      if (!label || unique.has(key)) return;
      unique.set(key, { id: `location:${key}`, label, district, state });
    });

    const query = locationSearchInput.trim().toLowerCase();
    return [...unique.values()]
      .filter((item) => !query || item.label.toLowerCase().includes(query))
      .slice(0, 8);
  }, [collegesData, locationSearchInput]);
  const courseSuggestions = useMemo(() => {
    const unique = new Map<string, { id: string; label: string }>();
    coursesData.forEach((course) => {
      const label = String(course.course || "").trim();
      const key = label.toLowerCase();
      if (!label || unique.has(key)) return;
      unique.set(key, { id: `course:${key}`, label });
    });

    const query = courseSearchInput.trim().toLowerCase();
    return [...unique.values()]
      .filter((item) => !query || item.label.toLowerCase().includes(query))
      .slice(0, 8);
  }, [courseSearchInput, coursesData]);
  const collegeSuggestions = useMemo(() => {
    const query = collegeSearchInput.trim().toLowerCase();
    return collegesData
      .filter((college) => {
        const collegeName = String(college.name || "").toLowerCase();
        return !query || collegeName.includes(query);
      })
      .slice(0, 8);
  }, [collegeSearchInput, collegesData]);
  const activeSearchSuggestions = useMemo(() => {
    if (activeSearchField === "college") {
      return collegeSuggestions.map((item) => ({
        id: item.id,
        label: item.name,
        meta: [item.district, item.state].filter(Boolean).join(", ") || item.university,
        imageSrc: item.logo || item.image,
        onSelect: () => {
          setCollegeSearchInput(item.name);
          activateSearchField("college");
        },
      }));
    }
    if (activeSearchField === "location") {
      return locationSuggestions.map((item) => ({
        id: item.id,
        label: item.label,
        meta: "Location",
        imageSrc: "",
        onSelect: () => {
          setLocationSearchInput(item.label);
          activateSearchField("location");
        },
      }));
    }
    if (activeSearchField === "course") {
      return courseSuggestions.map((item) => ({
        id: item.id,
        label: item.label,
        meta: "Course",
        imageSrc: "",
        onSelect: () => {
          setCourseSearchInput(item.label);
          activateSearchField("course");
        },
      }));
    }
    return [];
  }, [activateSearchField, activeSearchField, collegeSuggestions, courseSuggestions, locationSuggestions]);
  const shouldShowHeroSearchPanel = useMemo(
    () => activeSearchField !== null,
    [
      activeSearchField,
    ],
  );
  const activeSearchEmptyState = useMemo(() => {
    if (activeSearchField === "course") {
      return {
        title: "No matching courses",
        description: "Type a course name and matching courses will show here.",
      };
    }
    if (activeSearchField === "college") {
      return {
        title: "No matching colleges",
        description: "Type a college name and matching colleges will show here.",
      };
    }
    return {
      title: "No matching locations",
      description: "Type a city or district and matching locations will show here.",
    };
  }, [activeSearchField]);

  useEffect(() => {
    if (!shouldShowHeroSearchPanel) return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [shouldShowHeroSearchPanel]);

  // Hero spotlight and quick stat data
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

  const updateTrendingCoursesScrollState = useCallback(() => {
    const element = trendingCoursesScrollRef.current;
    if (!element) return;

    syncScrollIndicators(
      element,
      setShowLeftArrowTrendingCourses,
      setShowRightArrowTrendingCourses,
    );

    const cards = Array.from(element.children) as HTMLElement[];
    if (!cards.length) {
      setActiveTrendingCourseIndex(0);
      return;
    }

    const nearestIndex = cards.reduce((closestIndex, card, index) => {
      const currentDistance = Math.abs(card.offsetLeft - element.scrollLeft);
      const closestDistance = Math.abs(cards[closestIndex].offsetLeft - element.scrollLeft);
      return currentDistance < closestDistance ? index : closestIndex;
    }, 0);

    setActiveTrendingCourseIndex(nearestIndex);
  }, []);

  const updateTopExamsScrollState = useCallback(() => {
    syncScrollIndicators(
      topExamsScrollRef.current,
      setShowLeftArrowTopExams,
      setShowRightArrowTopExams,
    );
  }, []);

  const scrollTrendingCoursesByCard = (direction: "left" | "right") => {
    const element = trendingCoursesScrollRef.current;
    if (!element) return;
    const firstCard = element.firstElementChild as HTMLElement | null;
    const step = firstCard ? firstCard.offsetWidth + 16 : 320;
    element.scrollBy({ left: direction === "left" ? -step : step, behavior: "smooth" });
  };

  const scrollTopExamsByCard = (direction: "left" | "right") => {
    const element = topExamsScrollRef.current;
    if (!element) return;
    const firstCard = element.firstElementChild as HTMLElement | null;
    const step = firstCard ? firstCard.offsetWidth + 16 : 320;
    element.scrollBy({ left: direction === "left" ? -step : step, behavior: "smooth" });
  };

  const scrollTrendingCoursesToIndex = (index: number) => {
    const element = trendingCoursesScrollRef.current;
    if (!element) return;
    const cards = Array.from(element.children) as HTMLElement[];
    const target = cards[index];
    if (!target) return;
    element.scrollTo({ left: target.offsetLeft, behavior: "smooth" });
  };

  useEffect(() => {
    syncScrollIndicators(scrollContainerRef.current, setShowLeftArrow, setShowRightArrow);
    const animationFrame = window.requestAnimationFrame(() => {
      updateTrendingCoursesScrollState();
      updateTopExamsScrollState();
    });
    syncScrollIndicators(
      collegesScrollContainerRef.current,
      setShowLeftArrowColleges,
      setShowRightArrowColleges,
    );
    return () => window.cancelAnimationFrame(animationFrame);
  }, [updateTopExamsScrollState, updateTrendingCoursesScrollState]);

  useEffect(() => {
    const handleResize = () => {
      syncScrollIndicators(scrollContainerRef.current, setShowLeftArrow, setShowRightArrow);
      updateTrendingCoursesScrollState();
      updateTopExamsScrollState();
      syncScrollIndicators(
        collegesScrollContainerRef.current,
        setShowLeftArrowColleges,
        setShowRightArrowColleges,
      );
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [updateTopExamsScrollState, updateTrendingCoursesScrollState]);

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

  // Home page theme variables and section render helpers
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
  // Hero layout helpers
  const resolvedHeroImageUrl = String(heroImageUrl || "").trim() || "/college-hero-v2.jpg";
  const activeFeature = featureCards[activeFeatureCard] ?? featureCards[0];

  // Feature cards
  const renderFeatureCard = (feature: FeatureCardItem, variant: "hero" | "grid" = "grid") => {
    const isHeroCard = variant === "hero";
    const isCompactFeature = !isHeroCard && feature.title === "Course Explorer";
    const isShortFeature = !isHeroCard && feature.title === "Ranking View";
    const isLongFeature =
      !isHeroCard &&
      (feature.title === "Project Guidance and Funding" || feature.title === "Internships and Jobs");
    const Icon = feature.icon;

    return (
      <div
        className={`overflow-hidden rounded-[1.6rem] border border-[rgba(15,76,129,0.1)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(244,248,255,0.98))] shadow-[0_14px_28px_rgba(15,76,129,0.1)] ${isHeroCard ? "flex h-full min-h-[9.75rem] p-3 sm:min-h-[10.4rem] sm:p-3.5" : isCompactFeature ? "p-2.5 sm:p-3" : isShortFeature ? "p-2.5 sm:p-3" : isLongFeature ? "p-2.5 sm:p-3" : "p-3 sm:p-3.5"
          }`}
      >
        {isHeroCard ? (
          <>
            <div className="flex w-full flex-1 items-center gap-2 sm:gap-3">
              <div className="flex min-w-0 flex-1 flex-col items-center justify-center text-center">
                <div className="mb-1.5 inline-flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(15,76,129,0.1)] bg-[linear-gradient(135deg,rgba(29,78,216,0.12),rgba(255,255,255,0.96))] text-[color:var(--brand-primary)] sm:h-[2.125rem] sm:w-[2.125rem]">
                  <Icon className="size-4" />
                </div>
                <h3 className="font-bold tracking-[-0.03em] text-[color:var(--text-dark)] text-[0.9rem] leading-tight sm:text-[1rem]">
                  {feature.title}
                </h3>
                <p className="mt-1 max-w-[9rem] text-[9px] leading-[0.95rem] text-[color:var(--text-muted)] sm:max-w-[9.75rem] sm:text-[10px] sm:leading-[1rem]">
                  {feature.description}
                </p>
              </div>
              <div className="relative w-[46%] shrink-0 overflow-hidden rounded-[1.15rem] border border-[rgba(15,76,129,0.08)] bg-[linear-gradient(180deg,rgba(248,251,255,0.98),rgba(255,255,255,0.92))] p-2 sm:w-[44%]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={feature.imageSrc}
                  alt={feature.title}
                  className="mx-auto h-[5.8rem] w-full max-w-[9.25rem] object-contain sm:h-[6.3rem] sm:max-w-[9.8rem]"
                  loading="lazy"
                />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col items-center gap-2 text-center sm:gap-3 sm:items-start sm:text-left">
              <div className={`mt-0.5 flex shrink-0 items-center justify-center rounded-[0.85rem] border border-[rgba(15,76,129,0.1)] bg-[linear-gradient(135deg,rgba(29,78,216,0.12),rgba(255,255,255,0.96))] text-[color:var(--brand-primary)] ${isCompactFeature || isShortFeature ? "h-7 w-7 sm:h-8 sm:w-8" : "h-8 w-8 sm:h-9 sm:w-9 sm:rounded-[0.7rem]"}`}>
                <Icon className="size-3.5 sm:size-4.5" />
              </div>
              <div className="flex flex-1 flex-col justify-start items-center text-center sm:items-start sm:text-left">
                <h3 className={`line-clamp-2 font-bold tracking-[-0.03em] text-[color:var(--text-dark)] ${isCompactFeature ? "text-[0.7rem] leading-[0.95rem] sm:text-[0.82rem] sm:leading-[1.05rem]" : isShortFeature ? "text-[0.69rem] leading-[0.95rem] sm:text-[0.8rem] sm:leading-[1rem]" : isLongFeature ? "text-[0.67rem] leading-[0.92rem] sm:text-[0.79rem] sm:leading-[1rem]" : "text-[0.72rem] leading-[1rem] sm:text-[0.88rem] sm:leading-[1.1rem]"}`}>
                  {feature.title}
                </h3>
                <p className={`mt-1 hidden text-[color:var(--text-muted)] sm:block ${isCompactFeature ? "text-[10px] leading-[0.95rem]" : isShortFeature ? "text-[10px] leading-[0.92rem]" : isLongFeature ? "text-[9px] leading-[0.88rem]" : "text-[10px] leading-[0.98rem]"}`}>
                  {feature.description}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };
  // Hero cutoff banner
  const renderHeroCutoffBanner = () => (
    <article
      className="
        relative overflow-hidden
        h-full
        rounded-[1.4rem] sm:rounded-[1.8rem]
        border border-[rgba(99,102,241,0.14)]
        bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(239,244,255,0.98)_48%,rgba(224,231,255,0.96))]
        p-4
        text-[color:var(--text-dark)]
        shadow-[0_18px_40px_rgba(59,130,246,0.11)]
      "
    >
      <div className="pointer-events-none absolute -left-14 -top-16 h-44 w-44 rounded-full bg-[rgba(96,165,250,0.18)] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 right-8 h-52 w-52 rounded-full bg-[rgba(59,130,246,0.14)] blur-3xl" />

      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(59,130,246,0.18)] bg-[rgba(59,130,246,0.08)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#2563eb]">
            <CourseIcon className="size-3.5" />
            Cutoff Zone
          </span>
          <span className="rounded-full bg-white/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--brand-primary-soft)] shadow-sm">
            Fast Match
          </span>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_16.25rem] md:items-center lg:grid-cols-[minmax(0,1fr)_19.5rem]">
          <div className="min-w-0">
            <h3 className="text-[1.08rem] font-black leading-[1.12] tracking-[-0.035em] text-[#14213d] sm:text-[1.18rem] lg:text-[1.34rem]">
              <span className="block whitespace-nowrap">
                Unlock Your Future College.
              </span>
              <span className="mt-1 block text-[#3b82f6]">
                Discover Your Best Fit.
              </span>
            </h3>

            <p className="mt-2.5 max-w-none text-[10px] leading-[1.05rem] text-[color:var(--text-muted)] sm:text-[11px] sm:leading-[1.2rem] lg:text-[12px] lg:leading-5">
              Enter your marks and preferences to find better college matches.
              Get clearer cutoff guidance in one simple flow.
            </p>

            <div className="mt-3 grid grid-cols-3 items-stretch gap-0 rounded-[1rem] border border-[rgba(29,78,216,0.12)] bg-white/88 text-[8.5px] font-semibold text-[color:var(--brand-primary)] shadow-sm sm:max-w-[19rem] sm:text-[9px]">
              <span className="inline-flex min-h-[3rem] flex-col items-center justify-center gap-1 px-2 py-2 text-center">
                <Sparkles className="size-3.5 shrink-0 text-[#f59e0b]" />
                <span>Instant results</span>
              </span>
              <span className="inline-flex min-h-[3rem] flex-col items-center justify-center gap-1 border-x border-[rgba(29,78,216,0.12)] px-1 py-2 text-center">
                <ArrowRight className="size-3.5 shrink-0 text-[#2563eb]" />
                <span>Extra match picks</span>
              </span>
              <span className="inline-flex min-h-[3rem] flex-col items-center justify-center gap-1 px-2 py-2 text-center">
                <Medal className="size-3.5 shrink-0 text-[#ef4444]" />
                <span>Category accurate</span>
              </span>
            </div>
          </div>

          <div className="mx-auto flex w-full max-w-[16.75rem] justify-center md:mx-0 md:max-w-[18rem] md:justify-end lg:max-w-[22rem]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/cutoff-banner.png"
              alt="Cutoff banner illustration"
              className="h-auto w-full scale-[1.08] object-contain md:scale-[1.1]"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => router.push("/find")}
            className="
              inline-flex w-full items-center justify-center gap-2.5
              rounded-[1rem]
              bg-[linear-gradient(135deg,#2563eb_0%,#3b82f6_55%,#60a5fa_100%)]
              px-5 py-3
              text-sm font-semibold
              text-white
              shadow-[0_16px_28px_rgba(37,99,235,0.24)]
              transition
              hover:-translate-y-0.5
              sm:w-auto
            "
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
              <Rocket className="size-4" />
            </span>
            Check My Cutoff
            <ArrowRight className="size-4" />
          </button>

          <div className="flex items-center justify-center gap-3 text-sm text-[color:var(--text-muted)] sm:justify-end">
            <div className="flex -space-x-2">
              {["A", "S", "M"].map((letter, index) => (
                <span
                  key={letter}
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-white shadow-sm ${index === 0
                    ? "bg-[#1d4ed8]"
                    : index === 1
                      ? "bg-[#f97316]"
                      : "bg-[#0f766e]"
                    }`}
                >
                  {letter}
                </span>
              ))}
            </div>
            <span className="text-[12px] font-medium">Trusted by 1L+ students</span>
          </div>
        </div>
      </div>
    </article>
  );
  // Top college flow
  const renderTopCollegeFlow = () => (
    <div className="flex h-full min-h-[20.5rem] w-full flex-col rounded-[1.4rem] sm:rounded-[1.8rem] border border-[rgba(15,76,129,0.1)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(244,248,255,0.98))] p-4 shadow-[0_18px_40px_rgba(15,76,129,0.11)]">
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
        className="relative mt-3 h-32 overflow-hidden rounded-[1.3rem] border border-[rgba(15,76,129,0.08)] bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(241,248,255,0.95))] sm:h-36 md:h-40"
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
                /* eslint-disable-next-line @next/next/no-img-element */
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
        <div className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-2">
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
          <div className="rounded-[0.95rem] border border-[rgba(29,78,216,0.18)] bg-[rgba(29,78,216,0.06)] p-2.5">
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
  );

  // Top exams card
  const renderTopExamCard = (exam: (typeof topExamCards)[number]) => (
    <button
      type="button"
      onClick={() => router.push(exam.href)}
      className="group flex min-h-[18.75rem] w-[15rem] shrink-0 flex-col rounded-[1.5rem] border border-[rgba(220,230,248,0.95)] bg-white p-4 text-left shadow-[0_10px_30px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(30,64,175,0.12)] sm:w-[15.35rem] lg:min-h-[19rem] lg:w-full"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3 mt-1.5">
          <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[rgba(15,76,129,0.12)] bg-white shadow-[0_6px_16px_rgba(15,76,129,0.08)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={exam.logo}
              alt={exam.name}
              className="h-full w-full object-contain p-0.5"
            />
          </span>
          <div className="min-w-0">
            <h3 className="whitespace-nowrap font-[family:var(--font-display)] text-[0.96rem] leading-tight text-[#0f1738] sm:text-[1.02rem]">
              {exam.name}
            </h3>
          </div>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-0.5 mb-1.5 text-[10px] font-semibold ${exam.mode.toLowerCase().includes("online")
          ? "bg-[rgba(34,197,94,0.14)] text-[#15803d]"
          : "bg-[rgba(249,115,22,0.14)] text-[#c2410c]"
          }`}>
          {exam.mode}
        </span>
      </div>

      <div className="mt-5 space-y-3 text-[12px] text-[color:var(--text-muted)]">
        <div className="flex items-center justify-between gap-3 border-b border-[rgba(15,76,129,0.08)] pb-2.5">
          <span>Colleges</span>
          <span className="font-semibold text-[color:var(--text-dark)]">{exam.participatingColleges}</span>
        </div>
        <div className="flex items-center justify-between gap-3 border-b border-[rgba(15,76,129,0.08)] pb-2.5">
          <span>Exam Date</span>
          <span className="font-semibold text-[color:var(--text-dark)]">{exam.examDate}</span>
        </div>
        <div className="flex items-center justify-between gap-3 pb-1">
          <span>Level</span>
          <span className="font-semibold text-[color:var(--text-dark)]">{exam.examLevel}</span>
        </div>
      </div>

      <div className="mt-auto space-y-2 pt-5">
        <div className="flex items-center justify-between border-t border-[rgba(15,76,129,0.08)] pt-3 text-[0.95rem] font-medium text-[#0f1738]">
          <span>Application Process</span>
          <ArrowRight className="size-4 text-[#1d4ed8] transition group-hover:translate-x-0.5" />
        </div>
        <div className="flex items-center justify-between border-t border-[rgba(15,76,129,0.08)] pt-3 text-[0.95rem] font-medium text-[#0f1738]">
          <span>Exam Info</span>
          <ArrowRight className="size-4 text-[#1d4ed8] transition group-hover:translate-x-0.5" />
        </div>
      </div>
    </button>
  );
  return (
    <div className="home-theme bg-white" style={homeThemeStyles}>
      {/* Hero section */}
      <section className="relative overflow-hidden bg-white text-[color:var(--text-dark)]">
        {/* Hero background artwork */}
        <div className="absolute inset-0">
          <div
            className="hero-bg absolute inset-0 bg-cover bg-center opacity-[0.26]"
            style={{ backgroundImage: `url('${resolvedHeroImageUrl}')` }}
          />
          <div className="absolute inset-0 bg-white/55" />
        </div>

        <div className="relative z-10">
          {/* Top navigation */}
          <Navbar />

          {/* Hero content section */}

          <div className="page-container-full px-1 sm:px-3 lg:px-4 pb-[4rem] pt-0 md:pb-[5.5rem] md:pt-1">
            <div className="space-y-2 py-2">
              {/* Hero headline and spotlight content */}
              <div className="reveal-up mx-auto mb-1 w-full px-0 sm:px-1">
                <div className="relative py-0.5 sm:py-1">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.85),transparent_60%)]" />
                  <div className="pointer-events-none absolute -left-6 top-10 h-32 w-32 rounded-full bg-[rgba(59,130,246,0.12)] blur-3xl" />
                  <div className="pointer-events-none absolute right-0 top-6 h-32 w-32 rounded-full bg-[rgba(29,78,216,0.14)] blur-3xl" />

                  <div className="relative space-y-1">
                    <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch lg:gap-3">
                      {/* Hero introduction */}
                      <div className="flex h-full flex-col justify-center space-y-4 lg:space-y-3 lg:pr-2">
                        <div className="max-w-full py-2 px-1 text-center lg:px-0 lg:text-left">
                          <h1 className="text-[1.55rem] font-black leading-tight tracking-[-0.04em] text-[#163761] sm:text-[1.95rem] lg:text-[2.55rem]">
                            Find Your{" "}
                            <span className="text-[#2563eb]">
                              Future College
                            </span>{" "}
                            Smartly.
                          </h1>

                          <p className="mx-auto mt-2.5 max-w-[34rem] px-2 text-[11px] leading-5 text-[color:var(--text-muted)] sm:text-[12px] sm:leading-[1.45rem] lg:mx-0 lg:px-0 lg:text-[13px] lg:leading-6">
                            Discover colleges, courses, exams, and cities from one premium
                            search flow built to help you shortlist faster and decide with
                            more confidence.
                          </p>
                        </div>

                        {/* Hero feature spotlight */}
                        <div className="relative mx-auto w-full max-w-full px-2 lg:mx-0 lg:max-w-[28.5rem] lg:px-0">
                          <div
                            key={`${activeFeature.title}-${activeFeatureCard}`}
                            className="feature-pop-card absolute inset-0"
                          >
                            {renderFeatureCard(activeFeature, "hero")}
                          </div>

                          <div className="min-h-[10.9rem] sm:min-h-[8.15rem]" />
                        </div>
                      </div>

                      {/* Hero cutoff banner */}
                      <div className="w-full lg:max-w-[42rem] lg:justify-self-end">
                        {renderHeroCutoffBanner()}
                      </div>
                    </div>

                    {/* Hero search module */}
                    <div className="hero-search-shell group relative z-[70] mx-auto mt-3 w-full max-w-none px-0 py-2 sm:mt-4 sm:py-2.5">
                    <div
                      className="
      hero-search-input
      relative z-[2] overflow-hidden
      rounded-[1.2rem] sm:rounded-[1.65rem]
      border
      bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,248,255,0.98))]
      p-1.5 sm:p-1
      shadow-[0_18px_36px_rgba(22,50,79,0.11)]
      ring-1
    "
                      style={{
                        borderColor: activeSearchField ? "rgba(37,99,235,0.72)" : "rgba(56,189,248,0.52)",
                        boxShadow: activeSearchField
                          ? "0 18px 36px rgba(22,50,79,0.11), 0 0 0 3px rgba(37,99,235,0.14)"
                          : "0 18px 36px rgba(22,50,79,0.11), 0 0 0 1px rgba(56,189,248,0.14)",
                      }}
                      >
                        {/* SAME DESIGN FOR MOBILE + DESKTOP */}
                        <div
                          className="
        grid
        grid-cols-1
        md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_auto]
        items-stretch
        gap-2
        md:gap-0
      " >
                          {/* Course Search */}
                          <div
                            className={`
                            
          relative min-w-0
          px-4 py-2.5 md:px-5
          rounded-[1rem] md:rounded-none
          bg-white md:bg-transparent
          border
          md:border-0
          md:border-r md:border-[rgba(15,76,129,0.1)]
        ${activeSearchField === "course" ? "border-[rgba(15,76,129,0.85)] bg-[linear-gradient(180deg,rgba(243,248,255,0.98),rgba(239,246,255,0.95))] shadow-[0_10px_20px_rgba(29,78,216,0.12)]" : "border-[rgba(15,76,129,0.08)]"}
        `}
                          >
                            <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--brand-primary-soft)]">
                              <Search className="size-4" />
                              Search Courses
                            </div>

                            {!courseSearchInput ? (
                              <div className="pointer-events-none absolute inset-x-4 bottom-2.5 flex items-center overflow-hidden text-[15px] md:inset-x-5 md:text-[16px] text-[color:var(--text-muted)]">
                                {typedSearchText}
                                <span className="ml-0.5 inline-block text-[color:var(--brand-accent)]">
                                  |
                                </span>
                              </div>
                            ) : null}

                            <input
                              type="text"
                              value={courseSearchInput}
                              onChange={(event) => {
                                setCourseSearchInput(event.target.value);
                                activateSearchField("course");
                              }}
                              onFocus={() => activateSearchField("course")}
                              onBlur={scheduleSearchFieldClose}
                              onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                  event.preventDefault();
                                  handleHeroSearch();
                                }
                              }}
                              placeholder=""
                              className="min-h-[1.8rem] w-full border-0 bg-transparent px-0 pb-0 pt-0 text-[15px] md:text-[16px] text-[color:var(--text-dark)] outline-none placeholder:text-[color:var(--text-muted)]"
                            />
                          </div>

                          {/* College Search */}
                          <div
                            className={`
                            
          flex min-h-[2.95rem] items-center gap-3
          rounded-[1rem] md:rounded-none
          bg-white md:bg-transparent
          px-4 py-2.5 md:py-1.5
          border
          md:border-0
          md:border-r md:border-[rgba(15,76,129,0.1)]
        ${activeSearchField === "college" ? "border-[rgba(15,76,129,0.85)] bg-[linear-gradient(180deg,rgba(243,248,255,0.98),rgba(239,246,255,0.95))] shadow-[0_10px_20px_rgba(29,78,216,0.12)]" : "border-[rgba(15,76,129,0.08)]"}
        `}
                          >
                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(15,76,129,0.08)] text-[color:var(--brand-primary)]">
                              <Building2 className="size-[1.1rem]" />
                            </span>

                            <div className="min-w-0 flex-1">
                              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--brand-primary-soft)]">
                                College
                              </label>

                              <input
                                type="text"
                                value={collegeSearchInput}
                                onChange={(event) => {
                                  setCollegeSearchInput(event.target.value);
                                  activateSearchField("college");
                                }}
                                onFocus={() => activateSearchField("college")}
                                onBlur={scheduleSearchFieldClose}
                                aria-label="College"
                                placeholder="Type college"
                                className="w-full border-0 bg-transparent px-0 py-0 text-[14px] font-medium text-[color:var(--text-dark)] outline-none placeholder:text-[color:var(--text-muted)]"
                              />
                            </div>
                          </div>

                          {/* Location Search */}
                          <div
                            className={`
                            
          flex min-h-[2.95rem] items-center gap-3
          rounded-[1rem] md:rounded-none
          bg-white md:bg-transparent
          px-4 py-2.5 md:py-1.5
          border
          md:border-0
          md:border-r md:border-[rgba(15,76,129,0.1)]
        ${activeSearchField === "location" ? "border-[rgba(15,76,129,0.85)] bg-[linear-gradient(180deg,rgba(243,248,255,0.98),rgba(239,246,255,0.95))] shadow-[0_10px_20px_rgba(29,78,216,0.12)]" : "border-[rgba(15,76,129,0.08)]"}
        `}
                          >
                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(30,78,121,0.08)] text-[color:var(--brand-primary)]">
                              <MapPin className="size-[1.1rem]" />
                            </span>

                            <div className="min-w-0 flex-1">
                              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--brand-primary-soft)]">
                                Location
                              </label>

                              <input
                                type="text"
                                value={locationSearchInput}
                                onChange={(event) => {
                                  setLocationSearchInput(event.target.value);
                                  activateSearchField("location");
                                }}
                                onFocus={() => activateSearchField("location")}
                                onBlur={scheduleSearchFieldClose}
                                aria-label="Location"
                                placeholder="Type location"
                                className="w-full border-0 bg-transparent px-0 py-0 text-[14px] font-medium text-[color:var(--text-dark)] outline-none placeholder:text-[color:var(--text-muted)]"
                              />
                            </div>
                          </div>

                          {/* Search Button */}
                          <button
                            type="button"
                            onClick={handleHeroSearch}
                            className="
          inline-flex
          h-11 min-h-[3rem]
          w-full
          items-center justify-center
          gap-2
          rounded-[1.05rem]
          bg-[linear-gradient(135deg,#1d4ed8_0%,#2563eb_52%,#38bdf8_100%)]
          px-5
          text-[14px]
          font-semibold
          text-white
          shadow-[0_12px_24px_rgba(37,99,235,0.24)]
          transition
          hover:translate-y-[-1px]
                          hover:shadow-[0_16px_28px_rgba(56,189,248,0.22)]
          md:self-center
          md:mx-2
          md:min-w-[7rem]
          md:w-auto
        "
                          >
                            Find
                            <Search className="size-[1.1rem]" />
                          </button>
                        </div>
                      </div>

                      {/* Suggestion Panel */}
                      {shouldShowHeroSearchPanel ? (
                        <div className="absolute left-0 right-0 top-[calc(100%+0.8rem)] z-[120] max-h-[24rem] overflow-hidden rounded-[1.2rem] border border-[rgba(29,78,216,0.18)] bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(243,248,255,0.97))] p-1.5 shadow-[0_24px_48px_rgba(29,78,216,0.16)] backdrop-blur-sm">
                          {activeSearchField && activeSearchSuggestions.length > 0 ? (
                            <div className="max-h-[22.75rem] overflow-y-auto px-2 py-2">
                              <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--brand-primary-soft)]">
                                Related {activeSearchField}
                              </p>

                              {activeSearchSuggestions.map((item) => (
                                <button
                                  key={item.id}
                                  type="button"
                                  onMouseDown={(event) => {
                                    event.preventDefault();
                                    item.onSelect();
                                  }}
                                  className="flex w-full items-center gap-2 rounded-[0.9rem] px-3 py-2.5 text-left text-sm text-[color:var(--text-dark)] transition hover:bg-[rgba(29,78,216,0.07)]"
                                >
                                  {item.imageSrc && !brokenHeroSuggestionImages[item.id] ? (
                                    <span className="inline-flex h-9 w-9 shrink-0 overflow-hidden rounded-full border border-[rgba(29,78,216,0.12)] bg-white shadow-[0_6px_16px_rgba(29,78,216,0.1)]">
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
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
                                      {activeSearchField === "location" ? (
                                        <MapPin className="size-4" />
                                      ) : activeSearchField === "course" ? (
                                        <CourseIcon className="size-4" />
                                      ) : (
                                        <Search className="size-4" />
                                      )}
                                    </span>
                                  )}

                                  <span className="min-w-0 flex-1">
                                    <span className="block truncate font-medium">
                                      {item.label}
                                    </span>
                                    <span className="mt-0.5 block text-[11px] uppercase tracking-[0.08em] text-[color:var(--text-muted)]">
                                      {item.meta}
                                    </span>
                                  </span>
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="max-h-[22.75rem] overflow-y-auto px-4 py-4 text-left">
                              <p className="text-sm font-semibold text-[color:var(--text-dark)]">
                                {activeSearchEmptyState.title}
                              </p>
                              <p className="mt-1 text-xs leading-5 text-[color:var(--text-muted)]">
                                {activeSearchEmptyState.description}
                              </p>
                            </div>
                          )}
                        </div>
                      ) : null}
                    </div>

                    {/* Hero quick stats */}
                    <div className="mx-auto grid w-full max-w-[72rem] grid-cols-4 gap-1 sm:w-[94%] sm:gap-2 items-center justify-center">
                      {heroStatCards.map((item) => (
                        <div key={item.label} className="min-w-0 rounded-[0.9rem] border border-[rgba(15,76,129,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(250,247,243,0.96))] px-1.5 py-2 shadow-[0_8px_16px_rgba(15,76,129,0.06)] sm:rounded-[1rem] sm:px-3 sm:py-3">
                          <div className="flex flex-col items-center gap-1 text-center sm:flex-row sm:items-center sm:gap-2.5 sm:text-left">
                            <span className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full sm:h-9 sm:w-9 ${item.iconClassName}`}>
                              <item.icon className="size-3 sm:size-4" />
                            </span>
                            <div className="min-w-0 text-center sm:text-left">
                              <p className="text-[0.78rem] font-bold leading-none text-[color:var(--text-dark)] sm:text-[1.35rem]">{item.value}</p>
                              <p className="mt-1 text-[7px] font-medium leading-[0.7rem] text-[color:var(--text-muted)] sm:text-[11px] sm:leading-4">{item.label}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Top exams overview */}
                    <div className="mx-auto mt-6 w-full max-w-[72rem] px-1 sm:px-2 md:px-0">
                      <div className="relative w-full">
                        <div className="mb-4 flex items-center justify-between gap-3">
                          <p className="text-[1rem] font-semibold uppercase tracking-[0.22em] text-[#132a6b]">
                            Top Exams
                          </p>
                          <button
                            type="button"
                            onClick={() => router.push("/exams")}
                            className="inline-flex items-center gap-2 text-sm font-medium text-[#1d4ed8]"
                          >
                            Explore all
                            <ArrowRight className="size-4" />
                          </button>
                        </div>

                        <div className="hidden gap-4 lg:grid lg:grid-cols-4">
                          {topExamCards.map((exam) => (
                            <div key={exam.id}>
                              {renderTopExamCard(exam)}
                            </div>
                          ))}
                        </div>

                        <div className="relative lg:hidden">
                          <div
                            ref={topExamsScrollRef}
                            onScroll={updateTopExamsScrollState}
                            className="flex snap-x snap-mandatory gap-4 overflow-x-auto overflow-y-visible pb-4 scroll-smooth scrollbar-hide"
                          >
                            {topExamCards.map((exam) => (
                              <div key={exam.id} className="shrink-0 snap-start">
                                {renderTopExamCard(exam)}
                              </div>
                            ))}
                          </div>

                          {showLeftArrowTopExams ? (
                            <button
                              type="button"
                              onClick={() => scrollTopExamsByCard("left")}
                              className="absolute -left-3 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-[rgba(220,230,248,0.95)] bg-white text-[#132a6b] shadow-[0_10px_30px_rgba(15,23,42,0.08)] transition hover:bg-slate-50 lg:inline-flex"
                              aria-label="Scroll top exams left"
                            >
                              <ChevronLeft className="size-5" />
                            </button>
                          ) : null}

                          {showRightArrowTopExams ? (
                            <button
                              type="button"
                              onClick={() => scrollTopExamsByCard("right")}
                              className="absolute -right-3 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-[rgba(220,230,248,0.95)] bg-white text-[#132a6b] shadow-[0_10px_30px_rgba(15,23,42,0.08)] transition hover:bg-slate-50 lg:inline-flex"
                              aria-label="Scroll top exams right"
                            >
                              <ChevronRight className="size-5" />
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </div>

                  </div>
                  {/* Trending courses and top college flow */}
                  <div className="reveal-up delay-3 mt-8 pt-3">
                    <div className="mx-auto grid w-full max-w-[72rem] gap-6 px-1 sm:px-2  md:px-0 lg:grid-cols-2 lg:items-stretch">
                      {/* Trending courses section */}
                      <div className="relative flex h-full flex-col rounded-[1.4rem] border border-[rgba(15,76,129,0.1)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(244,248,255,0.98))] px-4 py-4 shadow-[0_18px_40px_rgba(15,76,129,0.11)] scroll-fade-in scroll-delay-2" data-scroll-animate>
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-[1.05rem] font-semibold uppercase tracking-[0.24em] text-[#132a6b]">
                            Trending Courses
                          </p>
                          <button
                            type="button"
                            onClick={() => router.push("/explore")}
                            className="inline-flex items-center gap-2 text-lg font-medium text-[#1d4ed8]"
                          >
                            View all
                            <ArrowRight className="size-5" />
                          </button>
                        </div>

                        <div className="mt-6 hidden gap-2.5 lg:grid lg:grid-cols-3 ">
                          {trendingCourseCards.slice(0, 6).map((course) => {
                            const Icon = course.icon;
                            return (
                              <button
                                key={course.id}
                                type="button"
                                onClick={() => router.push(course.href)}
                                className="group flex min-h-[10.5rem] flex-col rounded-[1.15rem] border border-[rgba(220,230,248,0.95)] bg-white px-3 py-3 text-left shadow-[0_8px_20px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(30,64,175,0.12)]"
                              >
                                <div className="flex h-[3.1rem] w-[3.1rem] items-center justify-center rounded-full border border-[rgba(248,113,113,0.16)] bg-[linear-gradient(180deg,rgba(254,242,242,1),rgba(254,226,226,0.82))] text-[#ff2f2f] transition group-hover:scale-[1.03]">
                                  <Icon className="size-5 stroke-[1.8] " />
                                </div>
                                <div className="mt-3">
                                  <p className="font-[family:var(--font-display)] text-[0.96rem] leading-[1.15] text-[#0f1738]">
                                    {course.course}
                                  </p>
                                  <p className="mt-1.5 text-[0.52rem] font-semibold uppercase tracking-[0.14em] text-[#5d6f99]">
                                    {course.subtitle}
                                  </p>
                                </div>
                                <div className="mt-auto inline-flex items-center gap-1.5 pt-3 text-[0.74rem] font-medium text-[#1d4ed8]">
                                  Explore Course
                                  <ArrowRight className="size-3.5 text-[#ff3b30] transition group-hover:translate-x-0.5" />
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        <div className="mt-5 grid grid-cols-3 gap-1.5 md:hidden">
                          {trendingCourseCards.slice(0, 6).map((course) => {
                            const Icon = course.icon;
                            return (
                              <button
                                key={`${course.id}-mobile-grid`}
                                type="button"
                                onClick={() => router.push(course.href)}
                                className="group flex min-h-[7.15rem] flex-col rounded-[0.9rem] border border-[rgba(220,230,248,0.95)] bg-white px-1.5 py-1.5 text-left shadow-[0_6px_14px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_20px_rgba(30,64,175,0.1)]"
                              >
                                <div className="flex h-[2.15rem] w-[2.15rem] items-center justify-center rounded-full border border-[rgba(248,113,113,0.16)] bg-[linear-gradient(180deg,rgba(254,242,242,1),rgba(254,226,226,0.82))] text-[#ff2f2f]">
                                  <Icon className="size-3.5 stroke-[1.8]" />
                                </div>
                                <div className="mt-1.5">
                                  <p className="font-[family:var(--font-display)] text-[0.66rem] leading-[1] text-[#0f1738]">
                                    {course.course}
                                  </p>
                                  <p className="mt-0.5 text-[0.4rem] font-semibold uppercase tracking-[0.06em] text-[#5d6f99]">
                                    {course.subtitle}
                                  </p>
                                </div>
                                <div className="mt-auto inline-flex items-center gap-1 pt-1.5 text-[0.5rem] font-medium text-[#1d4ed8]">
                                  Explore
                                  <ArrowRight className="size-2.5 text-[#ff3b30]" />
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        <div className="relative mt-8 hidden md:block lg:hidden">
                          <div
                            ref={trendingCoursesScrollRef}
                            onScroll={updateTrendingCoursesScrollState}
                            className="flex snap-x snap-mandatory gap-4 overflow-x-auto overflow-y-visible pb-4 scroll-smooth scrollbar-hide"
                          >
                            {trendingCourseCards.map((course) => {
                              const Icon = course.icon;
                              return (
                                <button
                                  key={course.id}
                                  type="button"
                                  onClick={() => router.push(course.href)}
                                  className="group flex min-h-[20rem] w-[14.75rem] shrink-0 snap-start flex-col rounded-[1.7rem] border border-[rgba(220,230,248,0.95)] bg-white px-6 py-7 text-left shadow-[0_10px_30px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(30,64,175,0.12)] sm:w-[15.5rem]"
                                >
                                  <div className="flex items-center justify-between gap-3">
                                    <div className="flex h-[5.3rem] w-[5.3rem] items-center justify-center rounded-full border border-[rgba(248,113,113,0.16)] bg-[linear-gradient(180deg,rgba(254,242,242,1),rgba(254,226,226,0.82))] text-[#ff2f2f] transition group-hover:scale-[1.03]">
                                      <Icon className="size-8 stroke-[1.8]" />
                                    </div>
                                  </div>
                                  <div className="mt-8">
                                    <p className="font-[family:var(--font-display)] text-[1.2rem] leading-[1.22] text-[#0f1738]">
                                      {course.course}
                                    </p>
                                    <p className="mt-4 text-[0.72rem] font-semibold uppercase tracking-[0.26em] text-[#5d6f99]">
                                      {course.subtitle}
                                    </p>
                                  </div>
                                  <div className="mt-auto inline-flex items-center gap-2 text-[1rem] font-medium text-[#1d4ed8]">
                                    Explore Course
                                    <ArrowRight className="size-5 text-[#ff3b30] transition group-hover:translate-x-0.5" />
                                  </div>
                                </button>
                              );
                            })}
                          </div>

                          {showLeftArrowTrendingCourses ? (
                            <button
                              type="button"
                              onClick={() => scrollTrendingCoursesByCard("left")}
                              className="absolute left-[-1.55rem] top-1/2 z-10 hidden h-16 w-16 -translate-y-1/2 items-center justify-center rounded-full border border-[rgba(220,230,248,0.95)] bg-white text-[#132a6b] shadow-[0_10px_30px_rgba(15,23,42,0.08)] transition hover:bg-slate-50 lg:inline-flex"
                              aria-label="Scroll trending courses left"
                            >
                              <ChevronLeft className="size-7" />
                            </button>
                          ) : null}

                          {showRightArrowTrendingCourses ? (
                            <button
                              type="button"
                              onClick={() => scrollTrendingCoursesByCard("right")}
                              className="absolute right-[-1.55rem] top-1/2 z-10 hidden h-16 w-16 -translate-y-1/2 items-center justify-center rounded-full border border-[rgba(220,230,248,0.95)] bg-white text-[#132a6b] shadow-[0_10px_30px_rgba(15,23,42,0.08)] transition hover:bg-slate-50 lg:inline-flex"
                              aria-label="Scroll trending courses right"
                            >
                              <ChevronRight className="size-7" />
                            </button>
                          ) : null}
                        </div>

                        <div className="mt-5 hidden items-center justify-center gap-4 md:flex lg:hidden">
                          {trendingCourseCards.map((course, index) => (
                            <button
                              key={`${course.id}-dot`}
                              type="button"
                              onClick={() => scrollTrendingCoursesToIndex(index)}
                              aria-label={`Go to trending course ${index + 1}`}
                              className={`h-3.5 w-3.5 rounded-full transition ${index === activeTrendingCourseIndex
                                ? "bg-[#1d4ed8]"
                                : "bg-[rgba(148,163,184,0.35)] hover:bg-[rgba(148,163,184,0.6)]"
                                }`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Top college flow section */}
                      <div className="w-full">
                        {renderTopCollegeFlow()}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Explore courses and feature highlights section */}
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

          {/* Explore courses horizontal cards */}
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

          {/* Feature highlights grid */}
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-3">
            {featureCards.map((item, index) => {
              const delays = ["", "scroll-delay-1", "scroll-delay-2", "scroll-delay-3"];
              return (
                <div
                  key={item.title}
                  className={`scroll-fade-in ${delays[Math.min(index, 3)]}`}
                  data-scroll-animate
                >
                  {renderFeatureCard(item, "grid")}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Hidden spotlight colleges section */}
      {
        false && (
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
                          {/* eslint-disable-next-line @next/next/no-img-element */}
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
        )
      }

      {/* Newsletter section */}
      <section className="section-shell page-section bg-[color:var(--surface-base)] text-slate-800">
        <div className="page-container-full relative z-10 max-w-[1300px]">
          <div className="relative mx-auto max-w-4xl overflow-hidden rounded-[2rem] border border-[rgba(15,76,129,0.16)] bg-[linear-gradient(135deg,#ffffff,#f2f5ff)] p-6 shadow-[0_18px_44px_rgba(12,31,58,0.18),0_10px_26px_rgba(10,18,34,0.14)] md:p-8 scroll-scale-in" data-scroll-animate>
            <div className="pointer-events-none absolute -right-10 top-6 h-32 w-32 rounded-full bg-[rgba(29,78,216,0.28)] blur-3xl" />
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
