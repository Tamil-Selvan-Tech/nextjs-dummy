"use client";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  BookOpen,
  Calculator,
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
import {
  colleges as fallbackColleges,
  courses as fallbackCourses,
  findBestCourseLookupMatch,
  formatCourseDisplayName,
  type College,
  type Course,
} from "@/lib/site-data";
import { formatCompactIndianCurrencyRange } from "@/lib/currency-format";
import { getRankedSearchResults, normalizeSearchText, type SearchCity } from "@/lib/search-utils";

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

const MOBILE_HERO_SEARCH_PROMPTS = {
  college: "Search for College",
  course: "Search for Course",
  location: "Search for Location",
} as const;
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
const EXAM_SUBTITLE_MAP: Record<string, string> = {
  "JEE Main": "Joint Entrance Exam",
  "JEE Advanced": "IIT Admissions",
  CUET: "Central Universities",
  NEET: "Medical Entrance",
};
const EXAM_SHORT_LABEL_MAP: Record<string, string> = {
  "JEE Main": "JEE",
  "JEE Advanced": "ADV",
  CUET: "CUET",
  NEET: "NEET",
};
const formatExamDateLabel = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  const day = `${parsed.getDate()}`.padStart(2, "0");
  const month = `${parsed.getMonth() + 1}`.padStart(2, "0");
  const year = parsed.getFullYear();
  return `${day}-${month}-${year}`;
};

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

export function HomePage({
  collegesData = fallbackColleges,
  coursesData = fallbackCourses,
  heroImageUrl = "",
  examSchedules = [],
}: HomePageProps) {
  const router = useRouter();

  // Home page search and interaction state
  const [collegeSearchInput, setCollegeSearchInput] = useState("");
  const [locationSearchInput, setLocationSearchInput] = useState("");
  const [courseSearchInput, setCourseSearchInput] = useState("");
  const [mobileHeroSearchTab, setMobileHeroSearchTab] = useState<"college" | "course" | "location">("college");
  const [activeAction, setActiveAction] = useState(0);
  const [isSpotlightPaused, setIsSpotlightPaused] = useState(false);
  const [activeSearchField, setActiveSearchField] = useState<"college" | "location" | "course" | null>(null);
  const [brokenCollegeImages, setBrokenCollegeImages] = useState<Record<string, boolean>>({});
  const [brokenHeroSuggestionImages, setBrokenHeroSuggestionImages] = useState<Record<string, boolean>>({});
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const trendingCoursesScrollRef = useRef<HTMLDivElement | null>(null);
  const topExamsScrollRef = useRef<HTMLDivElement | null>(null);
  const collegesScrollContainerRef = useRef<HTMLDivElement | null>(null);
  const searchFieldBlurTimeoutRef = useRef<number | null>(null);
  const isMountedRef = useRef(false);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [showLeftArrowTrendingCourses, setShowLeftArrowTrendingCourses] = useState(false);
  const [showRightArrowTrendingCourses, setShowRightArrowTrendingCourses] = useState(true);
  const [showLeftArrowTopExams, setShowLeftArrowTopExams] = useState(false);
  const [showRightArrowTopExams, setShowRightArrowTopExams] = useState(true);
  const [showLeftArrowColleges, setShowLeftArrowColleges] = useState(false);
  const [showRightArrowColleges, setShowRightArrowColleges] = useState(true);
  const [activeTrendingCourseIndex, setActiveTrendingCourseIndex] = useState(0);

  const openAllCoursesPage = useCallback(() => {
    router.push("/explore?view=courses#all-courses");
  }, [router]);

  const activeMobileHeroSearchValue =
    mobileHeroSearchTab === "college"
      ? collegeSearchInput
      : mobileHeroSearchTab === "course"
        ? courseSearchInput
        : locationSearchInput;

  const heroLocationOptions = useMemo<SearchCity[]>(() => {
    const unique = new Map<string, SearchCity>();
    collegesData.forEach((college) => {
      const state = String(college.state || "").trim();
      const candidates = [
        String(college.city || "").trim(),
        String(college.district || "").trim(),
        state,
      ];

      candidates.forEach((name) => {
        if (!name) return;
        const key = normalizeSearchText(`${name} ${state}`);
        if (!key || unique.has(key)) return;
        unique.set(key, { id: `location:${key}`, name, state });
      });
    });

    return [...unique.values()];
  }, [collegesData]);

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

    if (!combinedQuery) return;

    const normalizedCollegeQuery = normalizeSearchText(collegeValue);
    const normalizedCourseQuery = normalizeSearchText(courseValue);
    const normalizedLocationQuery = normalizeSearchText(locationValue);
    const hasCollege = Boolean(normalizedCollegeQuery);
    const hasCourse = Boolean(normalizedCourseQuery);
    const hasLocation = Boolean(normalizedLocationQuery);
    const rankedCourseResults = hasCourse
      ? getRankedSearchResults(courseValue, [], coursesData, []).courses
      : [];
    const rankedLocationResults = hasLocation
      ? getRankedSearchResults(locationValue, [], [], heroLocationOptions).cities
      : [];
    const matchedCourse = hasCourse
      ? rankedCourseResults[0] ||
        findBestCourseLookupMatch(coursesData, courseValue)
      : undefined;
    const matchedCourseRoute = matchedCourse
      ? formatCourseDisplayName(
          matchedCourse.course,
          matchedCourse.stream || matchedCourse.courseCategory,
          matchedCourse.specialization,
        )
      : "";
    const matchedLocation = hasLocation
      ? rankedLocationResults[0] ||
        heroLocationOptions.find((item) => {
          const normalizedName = normalizeSearchText(item.name);
          const normalizedLabel = normalizeSearchText(`${item.name} ${item.state}`);
          return normalizedName === normalizedLocationQuery || normalizedLabel === normalizedLocationQuery;
        })
      : undefined;
    const resolvedLocationFilter = matchedLocation?.name || locationValue;

    if (hasLocation && !hasCollege && !hasCourse) {
      router.push(`/explore?view=colleges&city=${encodeURIComponent(resolvedLocationFilter)}`);
      return;
    }

    if (hasCourse && !hasCollege && !hasLocation) {
      if (matchedCourse) {
        router.push(`/explore/course/${encodeURIComponent(matchedCourseRoute)}`);
        return;
      }

      router.push(`/search-results?q=${encodeURIComponent(courseValue)}`);
      return;
    }

    if (hasCourse && hasLocation && !hasCollege) {
      router.push(
        `/explore?view=colleges&city=${encodeURIComponent(resolvedLocationFilter)}&q=${encodeURIComponent(matchedCourseRoute || courseValue)}`,
      );
      return;
    }

    if (hasCollege) {
      const exactCollegeMatch = collegesData.find(
        (college) => normalizeSearchText(college.name) === normalizedCollegeQuery,
      );
      if (exactCollegeMatch && hasLocation && !hasCourse) {
        router.push(
          `/explore?view=colleges&city=${encodeURIComponent(resolvedLocationFilter)}&college=${encodeURIComponent(exactCollegeMatch.name)}`,
        );
        return;
      }
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
      if (matchedCourse) {
        router.push(`/explore/course/${encodeURIComponent(matchedCourseRoute)}`);
        return;
      }
    }

    router.push(`/search-results?q=${encodeURIComponent(combinedQuery)}`);
  }, [collegeSearchInput, collegesData, courseSearchInput, coursesData, heroLocationOptions, locationSearchInput, router]);
  const activateSearchField = useCallback((field: "college" | "location" | "course") => {
    if (searchFieldBlurTimeoutRef.current !== null) {
      window.clearTimeout(searchFieldBlurTimeoutRef.current);
      searchFieldBlurTimeoutRef.current = null;
    }
    if (!isMountedRef.current) return;
    setActiveSearchField(field);
  }, []);
  const scheduleSearchFieldClose = useCallback(() => {
    if (searchFieldBlurTimeoutRef.current !== null) {
      window.clearTimeout(searchFieldBlurTimeoutRef.current);
    }
    searchFieldBlurTimeoutRef.current = window.setTimeout(() => {
      if (!isMountedRef.current) return;
      setActiveSearchField(null);
      searchFieldBlurTimeoutRef.current = null;
    }, 120);
  }, []);

  const handleCompactMobileHeroSearch = useCallback(() => {
    handleHeroSearch();
  }, [handleHeroSearch]);

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
      const primaryCourse = rows[0];
      const displayCourseName = formatCourseDisplayName(
        courseName,
        primaryCourse?.stream || primaryCourse?.courseCategory,
        primaryCourse?.specialization,
      );
      const fees = rows.map((row) => row.totalFees);
      const cutoffs = rows.map((row) => row.cutoff);
      const durations = [...new Set(rows.map((row) => row.duration).filter(Boolean))];
      const minFees = Math.min(...fees);
      const maxFees = Math.max(...fees);
      const minCutoff = Math.min(...cutoffs);
      const maxCutoff = Math.max(...cutoffs);

      return {
        id: courseName,
        course: displayCourseName,
        duration: durations.join(", ") || "-",
        feesRange: formatCompactIndianCurrencyRange(minFees, maxFees),
        cutoffRange: minCutoff === maxCutoff ? `${minCutoff}` : `${minCutoff} - ${maxCutoff}`,
        isTopCourse: rows.some((row) => row.isTopCourse),
        icon: iconMap[courseName as keyof typeof iconMap] ?? CourseIcon,
        href: `/explore/course/${encodeURIComponent(displayCourseName)}`,
      };
    });
  }, [coursesData]);

  const topCourseChips = useMemo(
    () =>
      coursesData
        .filter((course) => course.isTopCourse)
        .filter((course, index, arr) => arr.findIndex((item) => item.course === course.course) === index)
         .map((course) => ({
           id: course.id,
           course: formatCourseDisplayName(
             course.course,
             course.stream || course.courseCategory,
             course.specialization,
           ),
           hrefCourse: formatCourseDisplayName(
             course.course,
             course.stream || course.courseCategory,
             course.specialization,
           ),
         })),
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
      return [...list, { id: course.id, course: normalizedCourse, hrefCourse: course.hrefCourse }];
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
    const query = locationSearchInput.trim();
    if (!query) {
      return heroLocationOptions.slice(0, 8).map((item) => ({
        id: item.id,
        label: item.name,
        state: item.state,
      }));
    }

    return getRankedSearchResults(query, [], [], heroLocationOptions).cities
      .slice(0, 8)
      .map((item) => ({
        id: item.id,
        label: item.name,
        state: item.state,
      }));
  }, [heroLocationOptions, locationSearchInput]);
  const courseSuggestions = useMemo(() => {
    const unique = new Map<string, { id: string; label: string; meta: string }>();
    const rankedCourses = courseSearchInput.trim()
      ? getRankedSearchResults(courseSearchInput, [], coursesData, []).courses
      : coursesData;

    rankedCourses.forEach((course) => {
      const label = formatCourseDisplayName(
        String(course.course || "").trim(),
        course.stream || course.courseCategory,
        course.specialization,
      );
      const key = normalizeSearchText(label);
      if (!label || unique.has(key)) return;
      unique.set(key, {
        id: `course:${course.id || key}`,
        label,
        meta: course.college || course.university || "Course",
      });
    });

    return [...unique.values()]
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
          setActiveSearchField(null);
        },
      }));
    }
    if (activeSearchField === "location") {
      return locationSuggestions.map((item) => ({
        id: item.id,
        label: item.label,
        meta: item.state || "Location",
        imageSrc: "",
        onSelect: () => {
          setLocationSearchInput(item.label);
          setActiveSearchField(null);
        },
      }));
    }
    if (activeSearchField === "course") {
      return courseSuggestions.map((item) => ({
        id: item.id,
        label: item.label,
        meta: item.meta,
        imageSrc: "",
        onSelect: () => {
          setCourseSearchInput(item.label);
          setActiveSearchField(null);
        },
      }));
    }
    return [];
  }, [activeSearchField, collegeSuggestions, courseSuggestions, locationSuggestions]);
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
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (searchFieldBlurTimeoutRef.current !== null) {
        window.clearTimeout(searchFieldBlurTimeoutRef.current);
        searchFieldBlurTimeoutRef.current = null;
      }
    };
  }, []);

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
  const openCollegeProfile = useCallback(
    (collegeId?: string) => {
      if (!collegeId) return;
      router.push(`/college/${collegeId}`);
    },
    [router],
  );
  const heroStatCards = useMemo(
    () => [
      {
        value: `${collegesData.length}+`,
        label: "Colleges Listed",
        icon: Building2,
        iconClassName: "bg-[rgba(37,99,235,0.12)] text-[#2563eb]",
      },
      {
        value: `${exploreCourseCards.length}+`,
        label: "Course Paths",
        icon: BookOpen,
        iconClassName: "bg-[rgba(37,99,235,0.12)] text-[#2563eb]",
      },
      {
        value: `${topExamCards.length}+`,
        label: "Exam Tracks",
        icon: Medal,
        iconClassName: "bg-[rgba(37,99,235,0.12)] text-[#2563eb]",
      },
      {
        value: `${new Set(collegesData.map((college) => college.state).filter(Boolean)).size}+`,
        label: "States Covered",
        icon: Globe2,
        iconClassName: "bg-[rgba(37,99,235,0.12)] text-[#2563eb]",
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

  // Initialize scroll animations
  useScrollAnimation();

  // Home page theme variables and section render helpers
  const homeThemeStyles: ThemeStyleVars = {
    "--brand-primary": "#142a63",
    "--brand-primary-soft": "#3d5aa9",
    "--brand-accent": "#2563eb",
    "--brand-accent-deep": "#0f1f52",
    "--brand-support": "#2563eb",
    "--surface-base": "#ffffff",
    "--surface-muted": "#f4f6fb",
    "--surface-soft": "#eef2fb",
    "--page-bg": "#f7f8fc",
    "--text-dark": "#101a37",
    "--text-muted": "#5e6785",
  };
  // Hero layout helpers
  const resolvedHeroImageUrl = String(heroImageUrl || "").trim() || "/college-hero-v2.jpg";
  // Hero cutoff banner
  const renderHeroCutoffBanner = () => (
    <div className="space-y-3">
      <article
        className="
          relative overflow-hidden
          min-h-[21rem] sm:min-h-[19rem] md:min-h-[18rem] lg:min-h-[20.25rem]
          rounded-[1.45rem] sm:rounded-[1.8rem]
          border border-[rgba(10,20,56,0.08)]
          bg-[linear-gradient(160deg,#15285f_0%,#11214f_52%,#0f1a42_100%)]
          p-4 sm:p-[1.15rem] lg:p-[1.35rem]
          text-white
          shadow-[0_26px_52px_rgba(9,18,47,0.26)]
        "
      >
        <div className="relative flex h-full flex-col md:grid md:min-h-[15.5rem] md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:grid-rows-[auto_1fr] md:gap-x-0.5 lg:flex lg:min-h-0">
          <button
            type="button"
            onClick={() => router.push("/find")}
            className="
              inline-flex w-fit items-center justify-center gap-2
              rounded-full
              border border-[#7db4ff]/55
              bg-[linear-gradient(135deg,rgba(59,130,246,0.28),rgba(96,165,250,0.16))]
              px-3.5 py-1.5
              text-[9px] font-semibold uppercase tracking-[0.14em]
              text-white
              shadow-[0_0_0_1px_rgba(125,180,255,0.16),0_12px_28px_rgba(37,99,235,0.24)]
              transition
              md:col-span-2
            "
          >
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/22 shadow-[0_0_16px_rgba(125,180,255,0.32)]">
              <Rocket className="size-3" />
            </span>
            Check My Cutoff
            <ArrowRight className="size-3" />
          </button>

          <div className="mt-5 w-full max-w-none md:mt-3 md:flex md:h-full md:flex-col md:pr-0 lg:mt-5 lg:h-auto">
            <div className="w-full max-w-none md:max-w-[17rem] lg:max-w-[17.5rem]">
              <h3 className="font-montserrat-display text-[1.18rem] font-bold leading-[1.12] tracking-[-0.04em] text-white sm:text-[1.3rem] md:text-[1.42rem] lg:text-[1.62rem]">
                <span className="block">Unlock Your Future College.</span>
                <span className="mt-1 block text-[#dbe7ff]">Discover Your Best Fit.</span>
              </h3>

              <p className="mt-3 w-full max-w-none pr-1 text-[10px] leading-[1.2rem] text-white/72 sm:text-[11px] md:max-w-[15.5rem] md:pr-0 lg:max-w-[15.25rem]">
                Enter your marks and preferences to find better college matches.
                Get clearer cutoff guidance in one simple flow.
              </p>
            </div>

            <div className="mt-5 grid w-full max-w-none grid-cols-3 gap-1.5 pt-5 text-[8px] font-semibold text-white sm:max-w-[12rem] sm:text-[8.5px] md:mt-auto md:max-w-[16.5rem] md:pt-3 lg:hidden">
              <span className="inline-flex min-h-[3.1rem] flex-col items-center justify-center gap-1 rounded-[0.95rem] border border-white/10 bg-white/7 px-1.5 py-2 text-center">
                <Sparkles className="size-3.5 shrink-0 text-[#ffcf69]" />
                <span>Instant results</span>
              </span>
              <span className="inline-flex min-h-[3.1rem] flex-col items-center justify-center gap-1 rounded-[0.95rem] border border-white/10 bg-white/7 px-1 py-2 text-center">
                <ArrowRight className="size-3.5 shrink-0 text-[#8cc3ff]" />
                <span>Extra picks</span>
              </span>
              <span className="inline-flex min-h-[3.1rem] flex-col items-center justify-center gap-1 rounded-[0.95rem] border border-white/10 bg-white/7 px-1.5 py-2 text-center">
                <Medal className="size-3.5 shrink-0 text-[#ff8f86]" />
                <span>Accurate</span>
              </span>
            </div>
          </div>

          <div className="pointer-events-none relative left-1/2 flex w-[calc(100%+2rem)] max-w-none -translate-x-1/2 shrink-0 items-end justify-center self-center sm:left-auto sm:w-full sm:max-w-[10.25rem] sm:translate-x-0 sm:self-auto sm:justify-end md:left-auto md:mt-3 md:flex md:h-full md:w-full md:max-w-none md:translate-x-0 md:items-end md:justify-end lg:hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/cutoff-banner-image.png"
              alt="Cutoff banner illustration"
              className="h-auto w-full scale-[1.08] object-contain sm:scale-100 md:h-full md:max-h-[15rem] md:w-full md:object-bottom"
            />
          </div>

          <div className="mt-auto hidden items-end justify-between gap-3 pt-6 lg:flex">
            <div className="grid max-w-[11rem] grid-cols-3 gap-1.5 text-[8px] font-semibold text-white sm:max-w-[12rem] sm:text-[8.5px]">
              <span className="inline-flex min-h-[3.1rem] flex-col items-center justify-center gap-1 rounded-[0.95rem] border border-white/10 bg-white/7 px-1.5 py-2 text-center">
                <Sparkles className="size-3.5 shrink-0 text-[#ffcf69]" />
                <span>Instant results</span>
              </span>
              <span className="inline-flex min-h-[3.1rem] flex-col items-center justify-center gap-1 rounded-[0.95rem] border border-white/10 bg-white/7 px-1 py-2 text-center">
                <ArrowRight className="size-3.5 shrink-0 text-[#8cc3ff]" />
                <span>Extra picks</span>
              </span>
              <span className="inline-flex min-h-[3.1rem] flex-col items-center justify-center gap-1 rounded-[0.95rem] border border-white/10 bg-white/7 px-1.5 py-2 text-center">
                <Medal className="size-3.5 shrink-0 text-[#ff8f86]" />
                <span>Accurate</span>
              </span>
            </div>

            <div className="pointer-events-none mr-[-0.35rem] flex w-full max-w-[8.75rem] shrink-0 items-end justify-end sm:max-w-[9.5rem] lg:max-w-[10.75rem]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/cutoff-banner-image.png"
                alt="Cutoff banner illustration"
                className="h-auto w-full object-contain"
              />
            </div>
          </div>
        </div>
      </article>

      <div className="flex items-center justify-center gap-3 px-2 text-sm text-[color:var(--text-muted)]">
        <div className="flex -space-x-2">
          {["A", "S", "M"].map((letter, index) => (
            <span
              key={letter}
              className={`inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-white shadow-sm ${index === 0
                ? "bg-[#3b82f6]"
                : index === 1
                  ? "bg-[#ef4444]"
                  : "bg-[#0f766e]"
                }`}
            >
              {letter}
            </span>
          ))}
        </div>
        <span className="text-[11px] font-medium sm:text-[12px]">Trusted by 1L+ students</span>
      </div>
    </div>
  );
  // Top college flow
  const renderTopCollegeFlow = () => (
    <div className="flex h-full min-h-[22rem] w-full flex-col rounded-[1.65rem] border border-[rgba(20,42,99,0.08)] bg-[linear-gradient(180deg,#ffffff_0%,#f8faff_100%)] p-3.5 shadow-[0_22px_50px_rgba(20,42,99,0.1)] scroll-fade-in scroll-delay-3 sm:min-h-[22.5rem] sm:rounded-[1.9rem] sm:p-5" data-scroll-animate>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="type-headline-small text-[color:var(--text-dark)]">
            Explore Top Rated College
          </p>
        </div>
        <div className="flex gap-1.5">
          {spotlightColleges.map((college, index) => (
            <button
              key={college.id}
              type="button"
              onClick={() => setActiveAction(index)}
              aria-label={`Show ${college.name}`}
              className={`h-1.5 rounded-full transition-all ${index === activeAction ? "w-6 bg-[color:var(--brand-primary)]" : "w-2 bg-[rgba(15,76,129,0.18)]"
                }`}
            />
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => openCollegeProfile(activeCollege?.id)}
        className="relative mt-4 h-36 overflow-hidden rounded-[1.45rem] border border-[rgba(20,42,99,0.08)] bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(241,248,255,0.95))] text-left transition hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(20,42,99,0.14)] sm:h-40 md:h-[13rem]"
        onMouseEnter={() => setIsSpotlightPaused(true)}
        onMouseLeave={() => setIsSpotlightPaused(false)}
        aria-label={activeCollege ? `Open ${activeCollege.name}` : "Open college profile"}
      >
        <div
          className="flex h-full w-full transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${activeAction * 100}%)` }}
        >
          {spotlightColleges.map((college) => {
            const spotlightImage = getSpotlightImage(college);
            const hasSpotlightImage = Boolean(spotlightImage) && !brokenCollegeImages[college.id];

            return (
            <div key={college.id} className="relative h-full w-full min-w-full shrink-0 basis-full overflow-hidden">
              {!hasSpotlightImage ? (
                <div className="flex h-full w-full items-end bg-[linear-gradient(135deg,rgba(15,76,129,0.88),rgba(255,138,61,0.68))] p-3 sm:p-4">
                  <div>
                    <p className="line-clamp-2 type-title-medium text-white">
                      {college.name}
                    </p>
                    <p className="mt-1 text-[10px] text-white/80 sm:text-[11px]">
                      {college.district}, {college.state}
                    </p>
                  </div>
                </div>
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={spotlightImage}
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
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,23,40,0.02),rgba(9,23,40,0.76))]" />
              {hasSpotlightImage ? (
                <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4">
                  <p className="line-clamp-2 font-[family:var(--font-display)] text-[1rem] font-semibold leading-[1.3] text-white">
                    {college.name}
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-[9px] text-white/75 sm:text-[10px]">
                    <MapPin className="size-3" />
                    {college.district}, {college.state}
                  </p>
                </div>
              ) : null}
            </div>
          )})}
        </div>
      </button>

      <div className="mt-4 space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-[1rem] border border-[rgba(20,42,99,0.08)] bg-[color:var(--surface-soft)] p-3">
          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[color:var(--brand-primary-soft)]">
            Success Rate
          </p>
          <p className="mt-1.5 text-[1.55rem] font-bold text-[color:var(--brand-support)]">
            {activeCollege?.placementRate ? `${activeCollege.placementRate}%` : "-"}
          </p>
          <p className="mt-1 text-[10px] leading-4 text-[color:var(--text-muted)]">
            Campus placement 2026
          </p>
          </div>
          <div className="min-w-0 rounded-[1rem] border border-[rgba(20,42,99,0.08)] bg-[#fbfbfe] p-2.5 sm:p-3">
            <p className="type-caption uppercase tracking-[0.12em] text-[color:var(--brand-primary-soft)]">
              Student Reviews
            </p>
            <p className="type-title-medium mt-1.5 text-[color:var(--text-dark)]">
              {activeCollege?.isBestCollege || activeCollege?.isTopCollege ? "1.2k+" : "860+"}
            </p>
            <p className="type-caption mt-1 text-[color:var(--text-muted)]">
              Verified campus feedback
            </p>
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => openCollegeProfile(activeCollege?.id)}
            disabled={!activeCollege?.id}
            className="type-label-bold inline-flex w-full items-center justify-center gap-2 rounded-full bg-[color:var(--brand-accent-deep)] px-4 py-3 text-center text-white shadow-[0_12px_26px_rgba(15,31,82,0.24)] transition hover:-translate-y-0.5 hover:bg-[color:var(--brand-primary)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Browse College
            <ArrowRight className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => router.push("/explore?view=colleges")}
            className="type-label-bold inline-flex w-full items-center justify-center gap-2 rounded-full border border-[rgba(20,42,99,0.12)] bg-white px-4 py-3 text-center text-[color:var(--brand-primary)] transition hover:bg-[rgba(20,42,99,0.04)]"
          >
            View All Colleges
          </button>
        </div>
      </div>
    </div>
  );

  // Top exams card
  const renderTopExamCard = (exam: (typeof topExamCards)[number]) => (
    <button
      type="button"
      onClick={() => router.push(exam.href)}
      className="group flex h-full min-h-[16.5rem] w-[min(17.5rem,calc(100vw-2.25rem))] shrink-0 flex-col rounded-[1.4rem] border border-[rgba(20,42,99,0.08)] bg-white px-4 py-4 text-left shadow-[0_8px_20px_rgba(20,42,99,0.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_14px_26px_rgba(20,42,99,0.09)] sm:w-[15.35rem] lg:min-h-[15.25rem] lg:w-full"
    >
      <div className="flex justify-end">
        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.12em] ${exam.mode.toLowerCase().includes("online")
          ? "bg-[rgba(34,197,94,0.12)] text-[#15803d]"
          : "bg-[rgba(15,23,42,0.08)] text-[#1e3a8a]"
          }`}>
          {exam.mode}
        </span>
      </div>

      <div className="mt-3 flex min-w-0 items-start gap-3">
        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[0.95rem] border border-[rgba(37,99,235,0.16)] bg-[linear-gradient(180deg,#f3f6ff,#eef2ff)] text-[0.82rem] font-bold tracking-[0.04em] text-[#1f2f5d]">
          {EXAM_SHORT_LABEL_MAP[exam.name] || exam.name.slice(0, 4).toUpperCase()}
        </span>
        <div className="min-w-0 pt-0.5">
          <h3 className="type-title-medium text-[#0f1738]">
            {exam.name}
          </h3>
          <p className="type-caption-small mt-1 uppercase tracking-[0.12em] text-[#7a86a8]">
            {EXAM_SUBTITLE_MAP[exam.name] || exam.examLevel}
          </p>
        </div>
      </div>

      <div className="type-body-small mt-5 space-y-2.5 text-[color:var(--text-muted)]">
        <div className="flex items-center justify-between gap-3 border-b border-[rgba(15,76,129,0.08)] pb-2.5">
          <span>Colleges</span>
          <span className="type-label-bold text-[color:var(--text-dark)]">{exam.participatingColleges}</span>
        </div>
        <div className="flex items-center justify-between gap-3 border-b border-[rgba(15,76,129,0.08)] pb-2.5">
          <span>Exam Date</span>
          <span className="type-label-bold text-[color:var(--text-dark)]">{formatExamDateLabel(exam.examDate)}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span>Level</span>
          <span className="type-label-bold text-[color:var(--text-dark)]">{exam.examLevel}</span>
        </div>
      </div>

      <div className="mt-auto space-y-0.5 pt-5">
        <div className="type-label-bold flex items-center justify-between border-t border-[rgba(15,76,129,0.08)] pt-3 text-[#0f1738]">
          <span>Application Process</span>
          <ArrowRight className="size-4 text-[#1d4ed8] transition group-hover:translate-x-0.5" />
        </div>
        <div className="type-label-bold flex items-center justify-between pt-2 text-[#0f1738]">
          <span>Exam Info</span>
          <ArrowRight className="size-4 text-[#1d4ed8] transition group-hover:translate-x-0.5" />
        </div>
      </div>
    </button>
  );
  return (
    <div className="home-theme bg-[color:var(--page-bg)]" style={homeThemeStyles}>
      {/* Hero section */}
      <section className="relative overflow-hidden bg-[color:var(--page-bg)] text-[color:var(--text-dark)]">
        {/* Hero background artwork */}
        <div className="absolute inset-0">
          <div
            className="hero-bg absolute inset-0 bg-cover bg-center opacity-[0.1]"
            style={{ backgroundImage: `url('${resolvedHeroImageUrl}')` }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(247,248,252,0.92),rgba(247,248,252,0.98))]" />
        </div>

        <div className="relative z-10">
          {/* Top navigation */}
          <Navbar />

          {/* Hero content section */}

          <div className="page-container-full max-w-[86rem] px-0 sm:px-1 lg:px-2 pb-[2.25rem] pt-0 md:pb-[2.75rem] md:pt-1 2xl:max-w-[96rem] 2xl:px-6">
            <div className="space-y-1 py-0.5 sm:space-y-2 sm:py-1.5">
              {/* Hero headline and spotlight content */}
              <div className="reveal-up mx-auto mb-0.5 mt-2 w-full px-0 sm:mt-3">
                <div className="relative py-0 sm:py-0.5">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.92),transparent_62%)]" />
                  <div className="pointer-events-none absolute -left-6 top-10 h-32 w-32 rounded-full bg-[rgba(59,130,246,0.09)] blur-3xl" />
                  <div className="pointer-events-none absolute right-0 top-6 h-32 w-32 rounded-full bg-[rgba(29,78,216,0.1)] blur-3xl" />

                  <div className="relative space-y-4 lg:grid lg:grid-cols-[minmax(0,1.22fr)_minmax(20.75rem,0.68fr)] lg:items-start lg:gap-x-5 lg:gap-y-4 lg:space-y-0 xl:grid-cols-[minmax(0,1.26fr)_minmax(22rem,0.7fr)] xl:gap-x-6 2xl:grid-cols-[minmax(0,1.34fr)_minmax(26rem,0.78fr)] 2xl:gap-x-8 2xl:gap-y-6">
                    <div className="flex h-full flex-col justify-start space-y-4 lg:pr-2">
                      <div className="max-w-full px-0 py-1.5 text-center lg:px-0 lg:py-1 lg:text-left">
                        <h1 className="home-hero-title font-montserrat-display mt-2 text-[clamp(2.2rem,8vw,2.9rem)] font-bold leading-[1.1] tracking-[-0.045em] text-[color:var(--text-dark)] lg:max-w-[33rem] lg:text-[50px] lg:leading-[50px] xl:max-w-[35rem] xl:text-[46px] xl:leading-[54px] 2xl:max-w-[40rem] 2xl:text-[50px] 2xl:leading-[58px]">
                          <span className="block">
                            Find Your <span className="text-[#2563eb]">Future</span>
                          </span>
                          <span className="block">
                            <span className="text-[#2563eb]">College</span> Smartly.
                          </span>
                        </h1>

                        <p className="type-body-large mx-auto mt-3.5 max-w-[31rem] px-2 text-[color:var(--text-muted)] lg:mx-0 lg:px-0">
                          Discover colleges, courses, exams, and cities from one premium
                          search flow built to help you shortlist faster and decide with
                          more confidence.
                        </p>

                        <div className="mx-auto mt-5 w-full max-w-none px-0 sm:px-1 md:hidden">
                          <div className="rounded-[1rem] border border-[rgba(37,99,235,0.2)] bg-white/95 p-2.5 shadow-[0_12px_28px_rgba(20,42,99,0.08)] ring-1 ring-[rgba(37,99,235,0.08)]">
                            <div className="grid grid-cols-3 gap-2">
                              {[
                                { id: "college", label: "Colleges" },
                                { id: "course", label: "Courses" },
                                { id: "location", label: "Location" },
                              ].map((item) => (
                                <button
                                  key={item.id}
                                  type="button"
                                  onClick={() => setMobileHeroSearchTab(item.id as "college" | "course" | "location")}
                                  className={`inline-flex items-center justify-center rounded-[0.65rem] px-2 py-2 text-[11px] font-semibold transition ${mobileHeroSearchTab === item.id
                                    ? "bg-[color:var(--brand-accent-deep)] text-white shadow-[0_8px_18px_rgba(20,42,99,0.18)]"
                                    : "border border-[rgba(20,42,99,0.08)] bg-[rgba(246,248,252,0.9)] text-[color:var(--text-muted)]"
                                    }`}
                                >
                                  {item.label}
                                </button>
                              ))}
                            </div>

                            <div className={`relative mt-2 flex items-center gap-2 rounded-[0.8rem] border bg-white px-3.5 py-3 shadow-[0_8px_20px_rgba(7,15,40,0.08)] transition ${activeSearchField === mobileHeroSearchTab ? "border-[rgba(37,99,235,0.5)] ring-2 ring-[rgba(37,99,235,0.14)]" : "border-[rgba(20,42,99,0.16)] hover:border-[rgba(37,99,235,0.28)]"}`}>
                              <Search className="size-4 shrink-0 text-[color:var(--brand-primary-soft)]" />
                              <div className="min-w-0 flex-1">
                                {!activeMobileHeroSearchValue ? (
                                  <div className="pointer-events-none absolute left-10 right-12 top-1/2 flex -translate-y-1/2 items-center overflow-hidden text-[12px]">
                                    <span className="truncate text-[color:var(--brand-primary-soft)]">{MOBILE_HERO_SEARCH_PROMPTS[mobileHeroSearchTab]}</span>
                                  </div>
                                ) : null}
                                <input
                                  type="text"
                                  value={activeMobileHeroSearchValue}
                                  onChange={(event) => {
                                    const value = event.target.value.replace(/[^A-Za-z\s]/g, "");
                                    if (mobileHeroSearchTab === "college") {
                                      setCollegeSearchInput(value);
                                    } else if (mobileHeroSearchTab === "course") {
                                      setCourseSearchInput(value);
                                    } else {
                                      setLocationSearchInput(value);
                                    }
                                    activateSearchField(mobileHeroSearchTab);
                                  }}
                                  onFocus={() => activateSearchField(mobileHeroSearchTab)}
                                  onBlur={scheduleSearchFieldClose}
                                  onKeyDown={(event) => {
                                    if (event.key === "Enter") {
                                      event.preventDefault();
                                      handleCompactMobileHeroSearch();
                                    }
                                  }}
                                  placeholder=""
                                  className={`min-w-0 w-full border-0 bg-transparent text-[12px] outline-none ${activeMobileHeroSearchValue ? "text-[color:var(--text-dark)]" : "text-transparent caret-[color:var(--brand-primary-soft)]"}`}
                                  aria-label="Mobile homepage search"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={handleCompactMobileHeroSearch}
                                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[rgba(20,42,99,0.1)] text-[color:var(--brand-primary)]"
                                aria-label="Submit mobile search"
                              >
                                <ArrowRight className="size-4" />
                              </button>
                            </div>

                            {activeSearchField === mobileHeroSearchTab ? (
                              <div className="mt-2 overflow-hidden rounded-[0.95rem] border border-[rgba(20,42,99,0.08)] bg-white shadow-[0_12px_30px_rgba(20,42,99,0.08)]">
                                {activeSearchSuggestions.length > 0 ? (
                                  <div className="max-h-[16rem] overflow-y-auto px-2 py-2">
                                    <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[color:var(--brand-primary-soft)]">
                                      Related {mobileHeroSearchTab}
                                    </p>
                                    {activeSearchSuggestions.map((item) => (
                                      <button
                                        key={item.id}
                                        type="button"
                                        onMouseDown={(event) => {
                                          event.preventDefault();
                                          item.onSelect();
                                        }}
                                        className="flex w-full items-center gap-2 rounded-[0.8rem] px-3 py-2 text-left text-[12px] text-[color:var(--text-dark)] transition hover:bg-[rgba(29,78,216,0.07)]"
                                      >
                                        {item.imageSrc && !brokenHeroSuggestionImages[item.id] ? (
                                          <span className="inline-flex h-8 w-8 shrink-0 overflow-hidden rounded-full border border-[rgba(29,78,216,0.12)] bg-white shadow-[0_4px_12px_rgba(29,78,216,0.08)]">
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
                                          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgba(29,78,216,0.12)] text-[color:var(--brand-primary)]">
                                            {mobileHeroSearchTab === "location" ? (
                                              <MapPin className="size-3.5" />
                                            ) : mobileHeroSearchTab === "course" ? (
                                              <CourseIcon className="size-3.5" />
                                            ) : (
                                              <Search className="size-3.5" />
                                            )}
                                          </span>
                                        )}
                                        <span className="min-w-0 flex-1">
                                          <span className="block truncate font-medium">{item.label}</span>
                                          <span className="mt-0.5 block text-[10px] uppercase tracking-[0.08em] text-[color:var(--text-muted)]">
                                            {item.meta}
                                          </span>
                                        </span>
                                      </button>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="px-4 py-4 text-left">
                                    <p className="text-[12px] font-semibold text-[color:var(--text-dark)]">
                                      {activeSearchEmptyState.title}
                                    </p>
                                    <p className="mt-1 text-[11px] leading-5 text-[color:var(--text-muted)]">
                                      {activeSearchEmptyState.description}
                                    </p>
                                  </div>
                                )}
                              </div>
                            ) : null}
                          </div>
                        </div>

                        <div className="relative z-[1] mx-auto mt-4 grid w-full max-w-[22.5rem] grid-cols-2 justify-items-center gap-2 px-2 md:hidden">
                          {heroStatCards.map((item) => (
                            <div key={`${item.label}-mobile`} className="w-full min-w-0 rounded-[0.9rem] border border-[rgba(37,99,235,0.12)] bg-white px-3 py-2.5 shadow-[0_8px_16px_rgba(20,42,99,0.05)]">
                              <div className="flex flex-col gap-1 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  <span className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${item.iconClassName}`}>
                                    <item.icon className="size-[0.85rem]" />
                                  </span>
                                  <p className="font-[family:var(--font-display)] text-[0.84rem] font-bold leading-none text-[#2563eb]">{item.value}</p>
                                </div>
                                <p className="text-[0.52rem] font-medium uppercase tracking-[0.05em] leading-[0.78rem] text-[#2563eb]">{item.label}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mx-auto hidden w-full max-w-[40rem] md:block lg:mx-0 xl:max-w-[43rem] 2xl:max-w-[47rem]">
                        <div className="hero-search-shell group relative z-[70] mx-auto w-full max-w-none px-0 py-1 lg:mx-0">
                          <div
                            className="
      hero-search-input
      relative z-[2] overflow-hidden
      rounded-[1.05rem] sm:rounded-[1.35rem]
      border-2
      bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(248,250,255,0.98))]
      p-1 sm:p-1
      shadow-[0_16px_34px_rgba(20,42,99,0.1)]
      ring-1
    "
                          style={{
                            borderColor: activeSearchField ? "rgba(37,99,235,0.82)" : "rgba(37,99,235,0.42)",
                            boxShadow: activeSearchField
                              ? "0 24px 48px rgba(20,42,99,0.16), 0 0 0 5px rgba(37,99,235,0.16)"
                              : "0 18px 36px rgba(20,42,99,0.1), 0 0 0 2px rgba(37,99,235,0.12)",
                          }}
                          >
                            <div className="grid grid-cols-1 items-stretch gap-2 md:grid-cols-[minmax(0,1.14fr)_minmax(0,0.92fr)_minmax(0,0.92fr)_6.8rem] md:items-center md:gap-0 md:pr-1">
                            <div
                              className={`
          relative min-w-0
          px-3 py-2.5 md:px-4
          rounded-[0.9rem] md:rounded-none
          bg-white md:bg-transparent
          border
          md:border-0
          md:border-r md:border-[rgba(37,99,235,0.18)]
          ${activeSearchField === "course" ? "border-[rgba(37,99,235,0.5)] bg-[linear-gradient(180deg,rgba(244,248,255,0.98),rgba(255,255,255,0.98))] shadow-[0_12px_24px_rgba(37,99,235,0.12)]" : "border-[rgba(37,99,235,0.14)]"}
        `}
                            >
                              <div className="mb-1.5 flex items-center gap-1.5 whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.12em] text-[color:var(--brand-primary-soft)]">
                                <Search className="size-3.5" />
                                Search Courses
                              </div>

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
                                placeholder="Search for Course"
                                className="relative z-[1] min-h-[1.55rem] w-full border-0 bg-transparent px-0 pb-0 pt-0 text-[14px] text-[color:var(--text-dark)] outline-none placeholder:text-[color:var(--brand-primary-soft)]"
                              />
                            </div>

                            <div
                              className={`
          flex min-h-[2.85rem] flex-col items-start justify-center gap-1.5
          rounded-[0.9rem] md:rounded-none
          bg-white md:bg-transparent
          px-3 py-2.5 md:px-4 md:py-2
          border
          md:border-0
          md:border-r md:border-[rgba(37,99,235,0.18)]
          ${activeSearchField === "college" ? "border-[rgba(37,99,235,0.5)] bg-[linear-gradient(180deg,rgba(244,248,255,0.98),rgba(255,255,255,0.98))] shadow-[0_12px_24px_rgba(37,99,235,0.12)]" : "border-[rgba(37,99,235,0.14)]"}
        `}
                            >
                              <div className="flex items-center gap-2">
                                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[rgba(15,76,129,0.08)] text-[color:var(--brand-primary)]">
                                  <Building2 className="size-[0.9rem]" />
                                </span>
                                <label className="block whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.12em] text-[color:var(--brand-primary-soft)]">
                                  College
                                </label>
                              </div>

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
                                placeholder="Search for College"
                                className="w-full border-0 bg-transparent px-0 py-0 text-[13px] font-medium text-[color:var(--text-dark)] outline-none placeholder:text-[color:var(--brand-primary-soft)]"
                              />
                            </div>

                            <div
                              className={`
          flex min-h-[2.85rem] flex-col items-start justify-center gap-1.5
          rounded-[0.9rem] md:rounded-none
          bg-white md:bg-transparent
          px-3 py-2.5 md:px-4 md:py-2
          border
          md:border-0
          md:border-r md:border-[rgba(37,99,235,0.18)]
          ${activeSearchField === "location" ? "border-[rgba(37,99,235,0.5)] bg-[linear-gradient(180deg,rgba(244,248,255,0.98),rgba(255,255,255,0.98))] shadow-[0_12px_24px_rgba(37,99,235,0.12)]" : "border-[rgba(37,99,235,0.14)]"}
        `}
                            >
                              <div className="flex items-center gap-2">
                                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[rgba(30,78,121,0.08)] text-[color:var(--brand-primary)]">
                                  <MapPin className="size-[0.9rem]" />
                                </span>
                                <label className="block whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.12em] text-[color:var(--brand-primary-soft)]">
                                  Location
                                </label>
                              </div>

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
                                placeholder="Search for Location"
                                className="w-full border-0 bg-transparent px-0 py-0 text-[13px] font-medium text-[color:var(--text-dark)] outline-none placeholder:text-[color:var(--brand-primary-soft)]"
                              />
                            </div>

                              <button
                                type="button"
                                onClick={handleHeroSearch}
                                className="
          inline-flex
          h-12 min-h-[3rem]
          w-full
          items-center justify-center
          gap-2
          rounded-[0.95rem]
          bg-[color:var(--brand-accent-deep)]
          px-4
          text-[13px]
          font-semibold
          text-white
          shadow-[0_14px_26px_rgba(15,31,82,0.24)]
          transition
          hover:translate-y-[-1px]
          hover:bg-[color:var(--brand-primary)]
          hover:shadow-[0_16px_30px_rgba(15,31,82,0.28)]
          md:mx-auto
          md:min-w-0
          md:self-center
          md:w-[5.9rem]
        "
                              >
                                Find
                                <Search className="size-[1.1rem]" />
                              </button>
                            </div>
                          </div>

                          {shouldShowHeroSearchPanel ? (
                            <div className="absolute left-0 right-0 top-[calc(100%+0.8rem)] z-[120] max-h-[24rem] overflow-hidden rounded-[1.2rem] border border-[rgba(20,42,99,0.1)] bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(246,248,253,0.98))] p-1.5 shadow-[0_24px_48px_rgba(20,42,99,0.12)] backdrop-blur-sm">
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

                        <div className="relative z-[1] mx-auto mt-4 grid w-full max-w-[41rem] grid-cols-2 gap-2 sm:mt-2 sm:grid-cols-4 sm:gap-2.5 lg:mx-0 xl:max-w-[44rem] 2xl:max-w-[48rem]">
                          {heroStatCards.map((item) => (
                            <div key={item.label} className="min-w-0 rounded-[1rem] border border-[rgba(37,99,235,0.12)] bg-white px-2 py-2.5 shadow-[0_10px_20px_rgba(20,42,99,0.05)] sm:rounded-[1rem] sm:px-2.5 sm:py-2.5">
                              <div className="flex flex-col items-center justify-center gap-1.5 text-center sm:flex-row sm:gap-2">
                                <span className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full sm:h-9 sm:w-9 ${item.iconClassName}`}>
                                  <item.icon className="size-[0.95rem] sm:size-[0.95rem]" />
                                </span>
                                <div className="min-w-0 flex-1">
                                  <p className="text-center text-[0.92rem] font-bold leading-none text-[#2563eb] sm:text-[1rem]">{item.value}</p>
                                  <p className="mt-0.5 text-center text-[0.56rem] font-medium uppercase tracking-[0.05em] leading-[0.82rem] text-[#2563eb] sm:mt-1 sm:text-[8.5px] sm:tracking-[0.08em] sm:leading-[0.9rem]">{item.label}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="w-full self-start lg:max-w-[24.5rem] lg:justify-self-end lg:pt-5 xl:max-w-[26rem] 2xl:max-w-[28rem]">
                      {renderHeroCutoffBanner()}
                    </div>

                    {/* Top exams overview */}
                    <div className="mx-auto mt-6 w-full max-w-[72rem] px-1 sm:px-2 md:px-0 scroll-fade-in scroll-delay-1 lg:col-span-2 2xl:max-w-[84rem]" data-scroll-animate>
                      <div className="relative w-full">
                        <div className="mb-4 flex items-center gap-3">
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[color:var(--brand-primary-soft)]">
                              Top Exams
                            </p>
                            <p className="home-section-title type-headline-small mt-2 text-[color:var(--text-dark)]">
                              Master Your Entry Strategy
                            </p>
                          </div>
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
                              className="absolute -left-3 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-[rgba(220,230,248,0.95)] bg-white text-[#132a6b] shadow-[0_10px_30px_rgba(15,23,42,0.08)] transition hover:bg-slate-50 md:inline-flex lg:hidden"
                              aria-label="Scroll top exams left"
                            >
                              <ChevronLeft className="size-5" />
                            </button>
                          ) : null}

                          {showRightArrowTopExams ? (
                            <button
                              type="button"
                              onClick={() => scrollTopExamsByCard("right")}
                              className="absolute -right-3 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-[rgba(220,230,248,0.95)] bg-white text-[#132a6b] shadow-[0_10px_30px_rgba(15,23,42,0.08)] transition hover:bg-slate-50 md:inline-flex lg:hidden"
                              aria-label="Scroll top exams right"
                            >
                              <ChevronRight className="size-5" />
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </div>

                  </div>
                  {/* Featured institutions section */}
                  <div className="reveal-up delay-3 mt-6 rounded-[2rem] bg-[color:var(--surface-muted)] px-1 py-7 sm:px-4 lg:px-6 2xl:px-8">
                    <div className="mx-auto grid w-full max-w-[72rem] gap-4 px-0 sm:px-2 md:px-0 lg:grid-cols-2 lg:items-stretch 2xl:max-w-[84rem] 2xl:gap-8">
                      {/* Top courses section */}
                      <div className="relative flex h-full flex-col rounded-[1.6rem] border border-[rgba(20,42,99,0.08)] bg-white px-3 py-4 shadow-[0_18px_40px_rgba(20,42,99,0.08)] scroll-fade-in scroll-delay-2 sm:px-4" data-scroll-animate>
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--brand-primary-soft)]">
                              Top Courses
                            </p>
                            <p className="home-section-title type-headline-small mt-2 text-[color:var(--text-dark)]">
                              Explore Pathways
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => router.push("/explore")}
                            className="inline-flex items-center gap-2 text-sm font-medium text-[#1d4ed8]"
                          >
                            View all
                            <ArrowRight className="size-4" />
                          </button>
                        </div>

                        <div className="mt-6 hidden gap-3 lg:grid lg:grid-cols-3">
                          {trendingCourseCards.slice(0, 6).map((course) => {
                            const Icon = course.icon;
                            return (
                              <button
                                key={course.id}
                                type="button"
                                onClick={() => router.push(course.href)}
                                className="home-course-card group flex min-h-[9.25rem] flex-col rounded-[1.2rem] border border-[rgba(20,42,99,0.08)] bg-[linear-gradient(180deg,#ffffff,#f9fbff)] px-3.5 py-3.5 text-left shadow-[0_8px_18px_rgba(20,42,99,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_28px_rgba(20,42,99,0.1)]"
                              >
                                <div className="flex h-[3rem] w-[3rem] items-center justify-center rounded-full border border-[rgba(37,99,235,0.14)] bg-[linear-gradient(180deg,rgba(232,240,255,0.98),rgba(255,255,255,0.98))] text-[color:var(--brand-primary)] transition group-hover:scale-[1.03]">
                                  <Icon className="size-5 stroke-[1.8] " />
                                </div>
                                <div className="mt-3">
                                  <p className="home-course-card-title type-title-medium text-[#0f1738] transition-colors group-hover:text-[color:var(--brand-primary)]">
                                    {course.course}
                                  </p>
                                  <p className="type-caption-small mt-1.5 uppercase tracking-[0.12em] text-[#5d6f99] transition-colors group-hover:text-[color:var(--brand-primary-soft)]">
                                    {course.subtitle}
                                  </p>
                                </div>
                                <div className="type-label-bold mt-auto inline-flex items-center gap-1.5 pt-3 text-[#1d4ed8] transition-colors group-hover:text-[color:var(--brand-accent-deep)]">
                                  Explore Course
                                  <ArrowRight className="size-3.5 text-[#1d4ed8] transition group-hover:translate-x-0.5 group-hover:text-[color:var(--brand-accent-deep)]" />
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-2 min-[480px]:grid-cols-3 md:hidden">
                          {trendingCourseCards.slice(0, 6).map((course) => {
                            const Icon = course.icon;
                            return (
                              <button
                                key={`${course.id}-mobile-grid`}
                                type="button"
                                onClick={() => router.push(course.href)}
                                  className="home-course-card group flex min-h-[7.35rem] flex-col rounded-[0.9rem] border border-[rgba(220,230,248,0.95)] bg-white px-2.5 py-2.5 text-left shadow-[0_8px_18px_rgba(15,23,42,0.07)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(30,64,175,0.12)] min-[480px]:px-2 min-[480px]:py-2"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="flex h-[2.15rem] w-[2.15rem] shrink-0 items-center justify-center rounded-full border border-[rgba(37,99,235,0.14)] bg-[linear-gradient(180deg,rgba(232,240,255,0.98),rgba(255,255,255,0.98))] text-[color:var(--brand-primary)] transition group-hover:scale-[1.03]">
                                    <Icon className="size-3.5 stroke-[1.8]" />
                                  </div>
                                  <p className="home-course-card-title line-clamp-1 text-[15px] font-semibold leading-[20px] text-[#0f1738] transition-colors group-hover:text-[color:var(--brand-primary)]">
                                    {course.course}
                                  </p>
                                </div>
                                <div className="mt-1.5">
                                  <p className="mt-0.5 text-[10px] font-normal uppercase tracking-[0.08em] leading-[14px] text-[#5d6f99] transition-colors group-hover:text-[color:var(--brand-primary-soft)]">
                                    {course.subtitle}
                                  </p>
                                </div>
                                <div className="mt-auto inline-flex items-center gap-1 pt-1.5 text-[12px] font-semibold leading-[12px] text-[#1d4ed8] transition-colors group-hover:text-[color:var(--brand-accent-deep)]">
                                  Explore
                                  <ArrowRight className="size-2.5 text-[#1d4ed8] transition group-hover:translate-x-0.5 group-hover:text-[color:var(--brand-accent-deep)]" />
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
                                  className="home-course-card group flex min-h-[20rem] w-[min(14.75rem,calc(100vw-5rem))] shrink-0 snap-start flex-col rounded-[1.7rem] border border-[rgba(220,230,248,0.95)] bg-white px-6 py-7 text-left shadow-[0_10px_30px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(30,64,175,0.12)] sm:w-[15.5rem]"
                                >
                                  <div className="flex items-center justify-between gap-3">
                                    <div className="flex h-[5.3rem] w-[5.3rem] items-center justify-center rounded-full border border-[rgba(37,99,235,0.14)] bg-[linear-gradient(180deg,rgba(232,240,255,0.98),rgba(255,255,255,0.98))] text-[color:var(--brand-primary)] transition group-hover:scale-[1.03]">
                                      <Icon className="size-8 stroke-[1.8]" />
                                    </div>
                                  </div>
                                  <div className="mt-8">
                                    <p className="home-course-card-title type-title-medium text-[#0f1738] transition-colors group-hover:text-[color:var(--brand-primary)]">
                                      {course.course}
                                    </p>
                                    <p className="type-caption-small mt-4 uppercase tracking-[0.16em] text-[#5d6f99] transition-colors group-hover:text-[color:var(--brand-primary-soft)]">
                                      {course.subtitle}
                                    </p>
                                  </div>
                                  <div className="type-label-bold mt-auto inline-flex items-center gap-2 text-[#1d4ed8] transition-colors group-hover:text-[color:var(--brand-accent-deep)]">
                                    Explore Course
                                    <ArrowRight className="size-5 text-[#1d4ed8] transition group-hover:translate-x-0.5 group-hover:text-[color:var(--brand-accent-deep)]" />
                                  </div>
                                </button>
                              );
                            })}
                          </div>

                          {showLeftArrowTrendingCourses ? (
                            <button
                              type="button"
                              onClick={() => scrollTrendingCoursesByCard("left")}
                              className="absolute left-[-1.55rem] top-1/2 z-10 hidden h-16 w-16 -translate-y-1/2 items-center justify-center rounded-full border border-[rgba(220,230,248,0.95)] bg-white text-[#132a6b] shadow-[0_10px_30px_rgba(15,23,42,0.08)] transition hover:bg-slate-50 md:inline-flex lg:hidden"
                              aria-label="Scroll trending courses left"
                            >
                              <ChevronLeft className="size-7" />
                            </button>
                          ) : null}

                          {showRightArrowTrendingCourses ? (
                            <button
                              type="button"
                              onClick={() => scrollTrendingCoursesByCard("right")}
                              className="absolute right-[-1.55rem] top-1/2 z-10 hidden h-16 w-16 -translate-y-1/2 items-center justify-center rounded-full border border-[rgba(220,230,248,0.95)] bg-white text-[#132a6b] shadow-[0_10px_30px_rgba(15,23,42,0.08)] transition hover:bg-slate-50 md:inline-flex lg:hidden"
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
      <section className="section-shell page-section !pt-8 bg-white text-slate-800 md:!pt-10">
        <div className="page-container-full relative z-10 max-w-[1120px] px-4 sm:px-6 xl:max-w-[1280px] 2xl:max-w-[1400px] 2xl:px-8">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="scroll-fade-in" data-scroll-animate>
              <p className="font-[family:var(--font-display)] text-[10px] font-semibold uppercase tracking-[0.24em] text-[color:var(--brand-primary-soft)]">
                Discover Pathways
              </p>
              <h2 className="home-hero-title type-headline-small mt-2 max-w-[42rem] text-balance text-[color:var(--text-dark)]">
                Explore courses with clearer decisions and stronger presentation.
              </h2>
            </div>
            <button
              type="button"
              onClick={openAllCoursesPage}
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
              className="flex gap-3 overflow-x-auto overflow-y-visible pb-6 pt-2 scroll-smooth scrollbar-hide 2xl:gap-5"
            >
              {exploreCourseCards.slice(0, 10).map((course) => {
                return (
                  <article
                    key={course.id}
                    className="home-course-card flex h-[20.5rem] w-[min(16.25rem,calc(100vw-2rem))] shrink-0 flex-col rounded-[1.6rem] border border-[rgba(20,42,99,0.08)] bg-[linear-gradient(180deg,#ffffff,#f9fbff)] p-[1.125rem] shadow-[0_14px_30px_rgba(20,42,99,0.07)] sm:h-[20rem] sm:w-[17.25rem] lg:h-[21rem] lg:w-[19rem] 2xl:w-[21rem]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-[rgba(16,37,78,0.08)] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[color:var(--brand-primary)]">
                        {course.isTopCourse ? "Top Course" : "Course"}
                      </span>
                    </div>
                    <h3 className="home-course-card-title type-title-medium mt-4 line-clamp-2 text-[color:var(--text-dark)]">
                      {course.course}
                    </h3>
                    <dl className="type-body-small mt-4 space-y-2 text-[color:var(--text-muted)]">
                      <div className="flex items-center justify-between gap-4 border-b border-[rgba(20,32,51,0.08)] pb-2.5">
                        <dt className="text-slate-500">Duration</dt>
                        <dd className="type-label-bold text-[color:var(--text-dark)]">{course.duration}</dd>
                      </div>
                      <div className="flex items-center justify-between gap-4 border-b border-[rgba(20,32,51,0.08)] pb-2.5">
                        <dt className="text-slate-500">Total Fees</dt>
                        <dd className="type-label-bold text-[color:var(--text-dark)]">{course.feesRange}</dd>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <dt className="text-slate-500">Cutoff</dt>
                        <dd className="type-label-bold text-[color:var(--text-dark)]">{course.cutoffRange}</dd>
                      </div>
                    </dl>
                    <button
                      type="button"
                      onClick={() => router.push(course.href)}
                      className="type-label-bold mt-auto inline-flex items-center gap-1.5 rounded-full border border-[rgba(15,31,82,0.18)] bg-[color:var(--brand-accent-deep)] px-3 py-1.5 text-white shadow-[0_10px_24px_rgba(15,31,82,0.18)] transition hover:bg-[color:var(--brand-primary)] hover:shadow-[0_12px_28px_rgba(15,31,82,0.22)] sm:gap-2 sm:px-4 sm:py-2"
                    >
                      Course Overview
                      <ArrowRight className="size-3.5 sm:size-4" />
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
          {/* <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-3">
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
          </div> */}

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
                        className="luxe-card group w-[min(18rem,calc(100vw-2rem))] shrink-0 cursor-pointer overflow-hidden sm:w-[20rem]"
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
                              <p className="text-base font-bold text-[color:var(--brand-primary)]">{college.placementRate > 0 ? `${college.placementRate}%` : "N/A"}</p>
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
      <section className="section-shell bg-[color:var(--surface-base)] pt-4 pb-12 text-slate-800 md:pt-5 md:pb-14">
        <div className="page-container-full relative z-10 max-w-[1300px] 2xl:max-w-[1480px] 2xl:px-8">
          <div className="relative mx-auto max-w-4xl overflow-hidden rounded-[2rem] border border-[rgba(15,76,129,0.16)] bg-[linear-gradient(135deg,#ffffff,#f2f5ff)] p-6 shadow-[0_18px_44px_rgba(12,31,58,0.18),0_10px_26px_rgba(10,18,34,0.14)] md:p-8 xl:max-w-5xl 2xl:max-w-6xl 2xl:p-10 scroll-scale-in" data-scroll-animate>
            <div className="pointer-events-none absolute -right-10 top-6 h-32 w-32 rounded-full bg-[rgba(29,78,216,0.28)] blur-3xl" />
            <div className="pointer-events-none absolute -bottom-10 left-6 h-28 w-28 rounded-full bg-[rgba(14,116,144,0.22)] blur-3xl" />
            <div className="relative z-10 mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--brand-primary-soft)] scroll-fade-in" data-scroll-animate>
                Newsletter
              </p>
              <h2 className="section-title mt-3 text-balance scroll-fade-in scroll-delay-1" data-scroll-animate>
                Get sharper updates on colleges, exams, and opportunities.
              </h2>
              <p className="type-body-large mt-4 text-slate-600 scroll-fade-in scroll-delay-2" data-scroll-animate>
                A cleaner form, stronger contrast, and a more premium finish so the last section feels as polished as the hero.
              </p>
            </div>

            <form className="relative z-10 mx-auto mt-8 grid w-full max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 2xl:max-w-6xl">
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

      <button
        type="button"
        onClick={() => router.push("/find")}
        aria-label="Open cutoff calculator"
        className="
          cutoff-calculator-float
          fixed bottom-4 right-4 z-50
          flex h-15 w-15 items-center justify-center
          rounded-full
          border border-[rgba(255,255,255,0.36)]
          bg-[linear-gradient(135deg,#2563eb_0%,#142a63_100%)]
          p-0
          text-xs font-extrabold tracking-[0.04em] text-white
          shadow-[0_18px_34px_rgba(20,42,99,0.34)]
          ring-4 ring-[rgba(37,99,235,0.16)]
          backdrop-blur-sm
          sm:bottom-auto sm:right-0 sm:top-1/2 sm:-translate-y-1/2
          sm:h-auto sm:w-auto
          sm:ring-0
          sm:rounded-l-[1rem] sm:rounded-r-none
          sm:px-3 sm:py-3.5 sm:text-sm
          [writing-mode:horizontal-tb] sm:[writing-mode:vertical-rl]
        "
      >
        <Calculator className="size-6 drop-shadow-[0_4px_10px_rgba(255,255,255,0.22)] sm:hidden" />
        <span className="hidden sm:inline">Cutoff Calculator</span>
      </button>
    </div>
  );
}
