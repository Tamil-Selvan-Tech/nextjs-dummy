"use client";

import {
  Bell,
  BookOpen,
  BriefcaseBusiness,
  Compass,
  Globe2,
  ChevronDown,
  LayoutDashboard,
  LogIn,
  Menu,
  Rocket,
  School,
  Target,
  UserPlus,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { CSSProperties } from "react";
import { Suspense, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { PageBackButton } from "@/components/global-back-button";
import {
  clearAuth,
  CURRENT_USER_KEY,
  type SafeAuthUser,
} from "@/lib/auth-storage";
import { BREAKING_NEWS_ITEMS } from "@/lib/breaking-news";
import { allCoursesList } from "@/lib/site-data";
import {
  defaultStudyPreference,
  persistStudyPreference,
  readStudyPreference,
} from "@/lib/study-preferences";

const subscribeToAuthChanges = (callback: () => void) => {
  if (typeof window === "undefined") return () => {};

  const handleStorage = (event: StorageEvent) => {
    if (!event.key || event.key === CURRENT_USER_KEY || event.key === "collegehub_token") {
      callback();
    }
  };

  window.addEventListener("storage", handleStorage);
  return () => window.removeEventListener("storage", handleStorage);
};

const getAuthSnapshot = () => {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(CURRENT_USER_KEY) || "";
};

const getAuthServerSnapshot = () => "";
const subscribeToMount = () => () => {};
const getMountSnapshot = () => true;
const getMountServerSnapshot = () => false;

const navbarThemeStyles = {
  "--brand-primary": "#2563eb",
  "--brand-primary-soft": "#3b82f6",
  "--brand-accent": "#2563eb",
  "--brand-accent-deep": "#1d4ed8",
  "--brand-support": "#2563eb",

  "--surface-base": "#ffffff",
  "--surface-muted": "#f8fbff",
  "--surface-soft": "#eef4ff",
  "--page-bg": "#f9fbff",

  "--text-dark": "#1e293b",
  "--text-muted": "#64748b",
} as CSSProperties;

const BACK_BUTTON_UNDER_NAV_ROUTES = new Set([
  "/about-us",
  "/advertising",
  "/careers",
  "/contact",
  "/disclaimer",
  "/find",
  "/privacy-policy",
  "/terms",
  "/services",
]);

const serviceMenuItems = [
  {
    navLabel: "Career",
    navIconClassName: "text-[#ef4444]",
    label: "Career Guidance",
    description: "Plan the right path with expert counseling",
    href: "/services/career-guidance",
    icon: Target,
    iconClassName: "bg-[rgba(239,68,68,0.12)] text-[#ef4444]",
  },
  {
    navLabel: "Skills",
    navIconClassName: "text-[#2563eb]",
    label: "Skill Programs",
    description: "Build job-ready technical and domain skills",
    href: "/services/skill-programs",
    icon: BookOpen,
    iconClassName: "bg-[rgba(37,99,235,0.12)] text-[#2563eb]",
  },
  {
    navLabel: "Placements",
    navIconClassName: "text-[#f97316]",
    label: "Placements",
    description: "Connect students with real hiring opportunities",
    href: "/services/placements",
    icon: BriefcaseBusiness,
    iconClassName: "bg-[rgba(249,115,22,0.12)] text-[#f97316]",
  },
  {
    navLabel: "Internships",
    navIconClassName: "text-[#8b5cf6]",
    label: "Internships",
    description: "Gain practical exposure through live projects",
    href: "/services/internships",
    icon: Rocket,
    iconClassName: "bg-[rgba(139,92,246,0.12)] text-[#8b5cf6]",
  },
  {
    navLabel: "Abroad",
    navIconClassName: "text-[#0284c7]",
    label: "Study Abroad",
    description: "Get support for global education and careers",
    href: "/services/study-abroad",
    icon: Globe2,
    iconClassName: "bg-[rgba(14,165,233,0.12)] text-[#0284c7]",
  },
] as const;

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCoursesOpen, setIsCoursesOpen] = useState(false);
  const [, setIsCoursesCueDimmed] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isPreferenceModalOpen, setIsPreferenceModalOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [courseSearch, setCourseSearch] = useState("");
  const [studyPreference, setStudyPreference] = useState(defaultStudyPreference);
  const currentUserRaw = useSyncExternalStore(
    subscribeToAuthChanges,
    getAuthSnapshot,
    getAuthServerSnapshot,
  );
  const hasMounted = useSyncExternalStore(
    subscribeToMount,
    getMountSnapshot,
    getMountServerSnapshot,
  );
  const panelRef = useRef<HTMLDivElement | null>(null);
  const accountMenuRef = useRef<HTMLDivElement | null>(null);
  const currentUser = useMemo<SafeAuthUser | null>(() => {
    if (!currentUserRaw) return null;
    try {
      return JSON.parse(currentUserRaw) as SafeAuthUser;
    } catch {
      return null;
    }
  }, [currentUserRaw]);
  const isCollegeUser = currentUser?.role === "college";
  const isAdminUser = currentUser?.role === "admin";
  const accountHref = isAdminUser ? "/admin" : isCollegeUser ? "/college-dashboard" : "/account";
  const accountLabel = isAdminUser ? "Admin" : "Account";
  const logoutAvatarInitial = isAdminUser
    ? "A"
    : currentUser?.name?.trim().charAt(0)?.toUpperCase() || (isCollegeUser ? "C" : "S");
  const isServicesRoute = pathname?.startsWith("/services") ?? false;
  const hideBackButton =
    pathname === "/" ||
    pathname.startsWith("/explore") ||
    pathname.startsWith("/compare") ||
    pathname.startsWith("/college/") ||
    pathname.startsWith("/exams/") ||
    pathname.startsWith("/explore/course/") ||
    pathname.startsWith("/cutoff") ||
    isServicesRoute ||
    BACK_BUTTON_UNDER_NAV_ROUTES.has(pathname);
  const showBackUnderNav =
    pathname?.startsWith("/explore") ||
    pathname?.startsWith("/college/") ||
    pathname?.startsWith("/exams/") ||
    pathname?.startsWith("/compare") ||
    isServicesRoute ||
    (pathname !== "/find" && BACK_BUTTON_UNDER_NAV_ROUTES.has(pathname));
  const visibleStudyPreference = hasMounted ? readStudyPreference() : studyPreference;

  const filteredCourses = useMemo(() => {
    const query = courseSearch.trim().toLowerCase();
    if (!query) return allCoursesList;
    return allCoursesList.filter((course) => course.toLowerCase().includes(query));
  }, [courseSearch]);

  useEffect(() => {
    if (!isCoursesOpen) return;

    const scrollY = window.scrollY;
    const previousOverflow = document.body.style.overflow;
    const previousBodyPosition = document.body.style.position;
    const previousBodyTop = document.body.style.top;
    const previousBodyWidth = document.body.style.width;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    document.documentElement.style.overflow = "hidden";

    const onMouseDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!panelRef.current?.contains(target)) setIsCoursesOpen(false);
    };

    const preventTouchMove = (event: TouchEvent) => {
      const target = event.target as Node;
      if (!panelRef.current?.contains(target)) {
        event.preventDefault();
      }
    };

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("touchmove", preventTouchMove, { passive: false });

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.position = previousBodyPosition;
      document.body.style.top = previousBodyTop;
      document.body.style.width = previousBodyWidth;
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("touchmove", preventTouchMove);
      window.scrollTo(0, scrollY);
    };
  }, [isCoursesOpen]);

  useEffect(() => {
    if (!isAccountMenuOpen) return;

    const onMouseDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!accountMenuRef.current?.contains(target)) setIsAccountMenuOpen(false);
    };

    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [isAccountMenuOpen]);

  const goTo = (href: string) => {
    router.push(href);
    setIsDrawerOpen(false);
    setIsAccountMenuOpen(false);
    setIsPreferenceModalOpen(false);
  };

  const handleLogout = () => {
    clearAuth();
    setIsDrawerOpen(false);
    setIsAccountMenuOpen(false);
    router.push("/login");
  };

  const openCoursesPanel = () => {
    setCourseSearch("");
    setIsCoursesCueDimmed(true);
    setIsCoursesOpen(true);
  };

  const openPreferenceModal = () => {
    setIsDrawerOpen(false);
    setIsPreferenceModalOpen(true);
  };

  const handleApplyPreference = ({
    city,
    college,
  }: {
    city: string;
    college: string;
  }) => {
    if (!city) return;

    const finalPreference = {
      city,
      college: college || "All Colleges",
    };

    setStudyPreference(finalPreference);
    persistStudyPreference(finalPreference);
    setIsPreferenceModalOpen(false);

    const params = new URLSearchParams();
    params.set("view", "colleges");
    params.set("city", city);
    if (college) params.set("college", college);

    router.push(`/explore?${params.toString()}`);
  };

  const closeCoursesPanel = () => {
    setCourseSearch("");
    setIsCoursesOpen(false);
    setIsCoursesCueDimmed(false);
  };

  const desktopPrimaryNavItems = [
    ...serviceMenuItems.map((item) => ({
      label: item.navLabel,
      title: item.label,
      href: item.href,
      icon: item.icon,
      iconClassName: item.navIconClassName,
    })),
    {
      label: "Explore",
      title: "Explore",
      href: "/explore",
      icon: Compass,
      iconClassName: "text-[#1e4e79]",
    },
  ] as const;

  const isDesktopNavItemActive = (href: string) => {
    if (!pathname) return false;
    if (href === "/explore") return pathname.startsWith("/explore");
    return pathname === href;
  };

  const mobileLinks = [
    { label: "Services", href: "/services" },
    { label: "About Us", href: "/about-us" },
    { label: "Explore", href: "/explore" },
    { label: "Contact", href: "/contact" },
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms & Conditions", href: "/terms" },
  ];
  return (
    <header
      className="page-container-full relative z-30 max-w-[96rem] pt-3 pb-0 text-[color:var(--text-dark)] md:pt-4 md:pb-0"
      style={navbarThemeStyles}
    >
      {!hideBackButton ? <div className="mb-3"><Suspense fallback={null}><PageBackButton /></Suspense></div> : null}
      <div className="rounded-[1.75rem] border border-[#dbeafe] bg-white px-2 py-3 shadow-[0_8px_30px_rgba(37,99,235,0.08)] md:px-4 lg:px-5">
        <div className="flex flex-wrap items-center gap-4 md:flex-nowrap md:gap-5 lg:gap-6">
          <Link
            href="/"
            className="rounded-full px-1.5 py-1 shadow-[0_10px_24px_rgba(37,99,235,0.08),0_0_18px_rgba(255,255,255,0.75)] transition hover:opacity-80"
          >
            <BrandLogo variant="tab" textColor="dark" className="origin-left scale-110 text-[17px] drop-shadow-[0_4px_10px_rgba(15,23,42,0.08)] sm:text-[18px] md:text-[19px]" iconClassName="h-11 w-11 drop-shadow-[0_8px_18px_rgba(245,158,11,0.22)] sm:h-12 sm:w-12 md:h-[3.15rem] md:w-[3.15rem]" />
          </Link>

          {/* Study preference chip hidden as requested
          <button
            type="button"
            onClick={openPreferenceModal}
            className="hidden min-w-0 rounded-full border border-[#dbeafe] bg-[#f8fbff] px-4 py-2.5 text-left transition hover:bg-[#eef4ff] md:ml-2 md:flex md:w-full md:max-w-[13.5rem] md:flex-col lg:ml-3 lg:max-w-[14.5rem] xl:max-w-[15.5rem]"
          >
            <div className="flex items-center gap-1 text-[11px] uppercase tracking-[0.18em] text-[color:var(--brand-accent-deep)]">
              <School className="size-3.5" />
              City
            </div>
            <div className="flex items-center gap-1 text-sm font-medium text-[color:var(--text-dark)]">
              <span className="truncate">{visibleStudyPreference.city} / {visibleStudyPreference.college}</span>
              <ChevronDown className="size-4 shrink-0" />
            </div>
          </button>
          */}

          <div className="order-3 hidden min-w-0 flex-1 items-center justify-center md:order-none md:flex md:px-0 md:pl-2 lg:pl-4">
            {desktopPrimaryNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = isDesktopNavItemActive(item.href);

                return (
                  <button
                    key={item.href}
                    type="button"
                    onClick={() => goTo(item.href)}
                    className={`group relative inline-flex min-w-[4.9rem] shrink-0 flex-col items-center justify-center gap-1 rounded-[1.1rem] px-2 py-2.5 text-center transition lg:min-w-[5.3rem] lg:px-2.5 xl:min-w-[5.6rem] xl:px-3 ${
  isActive
    ? "bg-[#f3f7ff] text-[color:var(--text-dark)] shadow-[0_6px_18px_rgba(37,99,235,0.10)]"
    : "text-[color:var(--text-muted)] hover:bg-[#f8fbff] hover:text-[color:var(--text-dark)]"
}`}
                    aria-label={item.title}
                    title={item.title}
                  >
                    <Icon className={`size-[1.05rem] shrink-0 transition group-hover:scale-105 lg:size-[1.15rem] ${item.iconClassName}`} />
                    <span className="type-label-bold text-[color:inherit]">{item.title}</span>
                    <span
                      className={`absolute bottom-0 left-1/2 h-[3px] w-8 -translate-x-1/2 rounded-full bg-[#2563eb] transition-all duration-200 ${
                        isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                      }`}
                    />
                  </button>
                );
              })}
          </div>

          <div className="ml-auto hidden items-center gap-3 text-sm md:flex lg:gap-4">
            <div ref={accountMenuRef} className="relative z-30">
              <button
                type="button"
                onClick={() => setIsAccountMenuOpen((current) => !current)}
                className="rounded-full border border-[rgba(15,76,129,0.1)] bg-white p-2 transition hover:bg-[rgba(15,76,129,0.04)]"
                aria-label="Open account menu"
                aria-expanded={isAccountMenuOpen}
              >
                <Menu className="size-4" />
              </button>
              <div
                className={`absolute right-0 top-[calc(100%+0.7rem)] w-44 origin-top-right rounded-2xl border border-[rgba(30,78,121,0.12)] bg-white p-2 shadow-[0_18px_40px_rgba(30,78,121,0.16)] transition-all duration-300 ${
                  isAccountMenuOpen
                    ? "pointer-events-auto translate-y-0 opacity-100"
                    : "pointer-events-none -translate-y-2 opacity-0"
                }`}
              >
                {currentUser ? (
                  <>
                    <button
                      type="button"
                      onClick={() => goTo(accountHref)}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-[color:var(--text-dark)] transition hover:bg-[rgba(15,76,129,0.06)]"
                    >
                      <LayoutDashboard className="size-4 text-[color:var(--brand-primary)]" />
                      {accountLabel}
                    </button>
                    <button
                      type="button"
                    onClick={() => setShowLogoutConfirm(true)}
                      className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-[color:var(--text-dark)] transition hover:bg-[rgba(255,138,61,0.08)]"
                    >
                      <LogIn className="size-4 text-[color:var(--brand-accent-deep)]" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => goTo("/login")}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-[color:var(--text-dark)] transition hover:bg-[rgba(15,76,129,0.06)]"
                    >
                      <LogIn className="size-4 text-[color:var(--brand-primary)]" />
                      Login
                    </button>
                    <button
                      type="button"
                      onClick={() => goTo("/signup")}
                      className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-[color:var(--text-dark)] transition hover:bg-[rgba(255,138,61,0.08)]"
                    >
                      <UserPlus className="size-4 text-[color:var(--brand-accent-deep)]" />
                      Register
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="rounded-full border border-[rgba(15,76,129,0.1)] bg-white p-2 hover:bg-[rgba(15,76,129,0.04)]"
              aria-label="Open menu"
            >
              <Menu className="size-4" />
            </button>
          </div>
        </div>

        {/* Study preference mobile chip hidden as requested
        <button
          type="button"
          onClick={openPreferenceModal}
          className="mt-3 flex w-full rounded-[1.2rem] border border-[#dbeafe] bg-[#f8fbff] px-4 py-3 text-left transition hover:bg-[#eef4ff] md:hidden"
        >
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-center gap-1 text-[11px] uppercase tracking-[0.18em] text-[color:var(--brand-accent-deep)]">
              <School className="size-3.5" />
              City
            </div>
            <div className="mt-1 flex items-center gap-1 text-sm font-medium text-[color:var(--text-dark)]">
              <span className="truncate">{visibleStudyPreference.city} / {visibleStudyPreference.college}</span>
              <ChevronDown className="size-4 shrink-0" />
            </div>
          </div>
        </button>
        */}
      </div>

      <nav className="relative z-20 mt-3 flex flex-col items-stretch gap-2 overflow-visible pb-0 text-sm text-[color:var(--text-dark)] md:flex-nowrap md:flex-row md:items-center">
        <button
          type="button"
          onClick={openCoursesPanel}
          onMouseEnter={() => setIsCoursesCueDimmed(true)}
          onMouseLeave={() => {
            if (!isCoursesOpen) setIsCoursesCueDimmed(false);
          }}
          onFocus={() => setIsCoursesCueDimmed(true)}
          onBlur={() => {
            if (!isCoursesOpen) setIsCoursesCueDimmed(false);
          }}
 className="peer type-label-bold w-full shrink-0 rounded-full border border-[#0f172a] bg-[#0f172a] px-5 py-2.5 text-white shadow-[0_10px_24px_rgba(15,23,42,0.35)] transition hover:bg-[#1e293b] md:w-auto md:min-w-[130px] md:py-2.5"     >
          All Courses
        </button>
        <div className="breaking-news-shell min-w-0 w-full flex-1">
          <div className="breaking-news-label">
            <Bell className="breaking-news-label-icon" />
            Breaking Updates
          </div>

          <div className="breaking-news-viewport">
            <div className="marquee-track breaking-news-track" aria-live="polite">
              {[0, 1].map((loopIndex) =>
                BREAKING_NEWS_ITEMS.map((item, itemIndex) => (
                  <div
                    key={`${loopIndex}-${item.status}-${item.title}`}
                    className="marquee-item breaking-news-entry"
                    aria-hidden={loopIndex === 1}
                  >
                    <a
                      href={item.href}
                      target={item.href.startsWith("http") ? "_blank" : undefined}
                      rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="breaking-news-link"
                      aria-label={`${item.title} page`}
                    >
                      <span className={`breaking-news-status breaking-news-status-${item.tone}`}>
                        <span className="breaking-news-status-dot" />
                        {item.status}
                      </span>
                      <span className="breaking-news-dash" aria-hidden="true">-</span>
                      <span className="breaking-news-headline">{item.title}</span>
                    </a>
                    {itemIndex < BREAKING_NEWS_ITEMS.length - 1 || loopIndex === 0 ? (
                      <span className="breaking-news-separator" aria-hidden="true" />
                    ) : null}
                  </div>
                )),
              )}
            </div>
          </div>
        </div>
      </nav>
      {showBackUnderNav ? (
        <div className="mt-3 flex justify-start">
          <Suspense fallback={null}>
            <PageBackButton />
          </Suspense>
        </div>
      ) : null}

      {isDrawerOpen ? (
        <div className="fixed inset-0 z-[400] bg-black/35 md:hidden">
          <button
            type="button"
            aria-label="Close menu overlay"
            className="absolute inset-0 h-full w-full"
            onClick={() => setIsDrawerOpen(false)}
          />
          <aside className="absolute right-0 top-0 z-[401] h-full w-[86%] max-w-sm overflow-y-auto border-l border-[rgba(30,78,121,0.12)] bg-white p-5 text-[color:var(--text-dark)] shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <BrandLogo variant="tab" textColor="dark" className="origin-left scale-105 text-[16px] sm:text-[17px]" iconClassName="h-11 w-11 sm:h-12 sm:w-12" />
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
className="rounded-full border border-[#dbeafe] bg-white p-2 transition hover:bg-[#f3f7ff]"                aria-label="Close menu"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-2 border-b border-[rgba(15,76,129,0.12)] pb-5">
              {mobileLinks.map((link) => (
                <button
                  key={link.label}
                  type="button"
                  onClick={() => goTo(link.href)}
                  className="w-full rounded-full border border-[rgba(15,76,129,0.1)] bg-white px-4 py-2 text-left text-sm font-semibold text-[color:var(--text-dark)] transition hover:bg-[rgba(15,76,129,0.04)]"
                >
                  {link.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setIsDrawerOpen(false);
                  openCoursesPanel();
                }}
                className="w-full rounded-full border border-[rgba(15,76,129,0.1)] bg-white px-4 py-2 text-left text-sm font-semibold text-[color:var(--text-dark)] transition hover:bg-[rgba(15,76,129,0.04)]"
              >
                All Courses
              </button>
            </div>

            <div className="mt-5 space-y-2 border-b border-[rgba(15,76,129,0.12)] pb-5">
              <div className="px-1 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--brand-accent-deep)]">
                Services
              </div>
              {serviceMenuItems.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => goTo(item.href)}
                    className="flex w-full items-start gap-3 rounded-[1.2rem] border border-[rgba(15,76,129,0.1)] bg-white px-4 py-3 text-left transition hover:bg-[rgba(15,76,129,0.04)]"
                  >
                    <span className={`flex size-10 shrink-0 items-center justify-center rounded-2xl ${item.iconClassName}`}>
                      <Icon className="size-4.5" />
                    </span>
                    <span className="block">
                      <span className="block text-sm font-semibold text-[color:var(--text-dark)]">{item.label}</span>
                      <span className="mt-1 block text-xs leading-5 text-[color:var(--text-muted)]">{item.description}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 space-y-2">
              {currentUser ? (
                <>
                  <Link
                    href={accountHref}
                    className="flex w-full items-center gap-2 rounded-full border border-[rgba(15,76,129,0.1)] bg-white px-4 py-2 text-left text-sm font-semibold text-[color:var(--text-dark)] transition hover:bg-[rgba(15,76,129,0.04)]"
                  >
                    <LayoutDashboard className="size-4" />
                    {accountLabel}
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setIsDrawerOpen(false);
                      setShowLogoutConfirm(true);
                    }}
                    className="flex w-full items-center gap-2 rounded-full border border-[rgba(15,76,129,0.1)] bg-white px-4 py-2 text-left text-sm font-semibold text-[color:var(--text-dark)] transition hover:bg-[rgba(15,76,129,0.04)]"
                  >
                    <LogIn className="size-4" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="flex w-full items-center gap-2 rounded-full border border-[rgba(15,76,129,0.1)] bg-white px-4 py-2 text-left text-sm font-semibold text-[color:var(--text-dark)] transition hover:bg-[rgba(15,76,129,0.04)]"
                  >
                    <LogIn className="size-4" />
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="flex w-full items-center gap-2 rounded-full border border-[rgba(15,76,129,0.1)] bg-white px-4 py-2 text-left text-sm font-semibold text-[color:var(--text-dark)] transition hover:bg-[rgba(15,76,129,0.04)]"
                  >
                    <UserPlus className="size-4" />
                    Register
                  </Link>
                </>
              )}
            </div>
          </aside>
        </div>
      ) : null}
{/* LOGOUT POPUP */}

{showLogoutConfirm ? (
  <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">

    <div className="relative w-full max-w-[470px] rounded-[2rem] bg-white px-6 py-6 shadow-[0_20px_60px_rgba(15,23,42,0.18)] animate-in fade-in zoom-in-95 duration-200">

      {/* CLOSE BUTTON */}

      <button
        type="button"
        onClick={() => setShowLogoutConfirm(false)}
        className="absolute right-5 top-5 flex size-8 items-center justify-center rounded-full transition hover:bg-slate-100"
      >
        <X className="size-4 text-slate-500" />
      </button>

      {/* TOP SECTION */}

      <div className="flex items-center gap-4">

        {/* AVATAR LETTER */}

        <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#2563eb,#60a5fa)] text-2xl font-extrabold text-white shadow-lg">
          {logoutAvatarInitial}
        </div>

        {/* TEXT */}

        <div>
          <h2 className="text-[2rem] font-extrabold leading-none text-slate-900">
            Logout
          </h2>

          <p className="mt-2 text-base font-medium text-slate-500">
            {isAdminUser
              ? "Admin"
              : currentUser?.name || "Student"}
          </p>
        </div>
      </div>

      {/* DESCRIPTION */}

      <p className="mt-7 text-[1rem] leading-7 text-slate-600">
        Are you sure you want to logout from your account?
      </p>

      {/* BUTTONS */}

      <div className="mt-8 flex items-center justify-end gap-3">

        <button
          type="button"
          onClick={() => setShowLogoutConfirm(false)}
          className="rounded-2xl border border-slate-300 bg-white px-6 py-3 text-base font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={() => {
            setShowLogoutConfirm(false);
            handleLogout();
          }}
          className="rounded-2xl bg-[#ff3347] px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-[#eb2237]"
        >
          Logout
        </button>
      </div>
    </div>
  </div>
) : null}

      {isCoursesOpen ? (
        <div className="fixed inset-0 z-[1600] bg-black/35 backdrop-blur-[2px]">
          <div
            ref={panelRef}
            className="fixed left-0 top-0 z-[1601] h-screen w-full max-w-[20rem] overflow-hidden border-r border-[#d9cfbf] bg-[linear-gradient(180deg,#fffdf8,#f6efe2)] text-slate-800 shadow-2xl sm:w-[19rem]"
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h3 className="font-[family:var(--font-display)] text-3xl font-bold text-gray-800">All Courses</h3>
              <button
                type="button"
                onClick={closeCoursesPanel}
                className="flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="border-b border-slate-200 p-4">
              <input
                type="text"
                value={courseSearch}
                onChange={(event) => setCourseSearch(event.target.value)}
                placeholder="Search All Courses"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base outline-none focus:border-blue-500"
              />
            </div>

            <div className="h-[calc(100vh-150px)] overflow-y-auto">
              {filteredCourses.map((course) => (
                <button
                  key={course}
                  type="button"
                  onClick={() => {
                    closeCoursesPanel();
                    goTo(`/explore?q=${encodeURIComponent(course)}`);
                  }}
                  className="flex w-full items-center justify-between gap-3 border-b border-gray-200 px-4 py-4 text-left text-base font-medium text-gray-700 hover:bg-gray-50 sm:px-6 sm:text-lg"
                >
                  <span className="min-w-0 flex-1 break-words">{course}</span>
                  <span className="text-xl text-gray-400">&rsaquo;</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
