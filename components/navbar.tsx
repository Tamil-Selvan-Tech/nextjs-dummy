"use client";

import {
  Bell,
  Building2,
  ChevronDown,
  CircleHelp,
  LayoutDashboard,
  LogIn,
  Menu,
  School,
  UserPlus,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { PageBackButton } from "@/components/global-back-button";
import { StudyPreferenceModal } from "@/components/study-preference-modal";
import {
  clearAuth,
  CURRENT_USER_KEY,
  type SafeAuthUser,
} from "@/lib/auth-storage";
import { SearchBar } from "@/components/search-bar";
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

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCoursesOpen, setIsCoursesOpen] = useState(false);
  const [isCoursesCueDimmed, setIsCoursesCueDimmed] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isPreferenceModalOpen, setIsPreferenceModalOpen] = useState(false);
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
  const accountHref = isCollegeUser ? "/college-dashboard" : "/account";
  const visibleStudyPreference = hasMounted ? readStudyPreference() : studyPreference;

  const filteredCourses = useMemo(() => {
    const query = courseSearch.trim().toLowerCase();
    if (!query) return allCoursesList;
    return allCoursesList.filter((course) => course.toLowerCase().includes(query));
  }, [courseSearch]);

  useEffect(() => {
    if (!isCoursesOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onMouseDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!panelRef.current?.contains(target)) setIsCoursesOpen(false);
    };

    document.addEventListener("mousedown", onMouseDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("mousedown", onMouseDown);
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
    collegeId,
  }: {
    city: string;
    college: string;
    collegeId?: string;
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

  const mobileLinks = [
    { label: "About Us", href: "/about-us" },
    { label: "Explore", href: "/explore" },
    { label: "Contact", href: "/contact" },
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms & Conditions", href: "/terms" },
  ];
  const movingNavLinks = [
    { label: "About Us", href: "/about-us" },
    { label: "Services", href: "/services" },
    { label: "Careers", href: "/careers" },
    { label: "Contact Us", href: "/contact" },
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms & Conditions", href: "/terms" },
  ];

  return (
    <header className="page-container-full relative z-30 pt-4 pb-2 text-[color:var(--text-dark)] md:pt-6 md:pb-0">
      {pathname !== "/" ? <div className="mb-3"><PageBackButton /></div> : null}
      <div className="rounded-[1.75rem] border border-[rgba(15,76,129,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,249,255,0.96))] px-3 py-3 shadow-[0_16px_40px_rgba(22,50,79,0.08)] md:px-4">
        <div className="flex flex-wrap items-center gap-3 md:flex-nowrap">
          <Link href="/" className="transition hover:opacity-80">
            <BrandLogo variant="tab" textColor="dark" className="h-9" />
          </Link>

          <button
            type="button"
            onClick={openPreferenceModal}
            className="hidden min-w-44 rounded-full border border-[rgba(15,76,129,0.1)] bg-white px-4 py-2 text-left transition hover:bg-[rgba(15,76,129,0.04)] md:flex md:flex-col"
          >
            <div className="flex items-center gap-1 text-[11px] uppercase tracking-[0.18em] text-[color:var(--brand-accent-deep)]">
              <School className="size-3.5" />
              City
            </div>
            <div className="flex items-center gap-1 text-sm font-medium text-[color:var(--text-dark)]">
              {visibleStudyPreference.city} / {visibleStudyPreference.college}
              <ChevronDown className="size-4" />
            </div>
          </button>

          <div className="order-3 w-full md:order-none md:mt-0 md:flex-1">
            <SearchBar />
          </div>

          <div className="ml-auto hidden items-center gap-4 text-sm md:flex">
            <button
              type="button"
              onClick={() => goTo("/about-us")}
              className="flex items-center gap-1 rounded-full border border-[rgba(15,76,129,0.1)] bg-white px-3 py-2 font-semibold transition hover:bg-[rgba(15,76,129,0.04)]"
            >
              <CircleHelp className="size-4 text-[color:var(--brand-accent-deep)]" />
              About
            </button>
            <button
              type="button"
              onClick={() => goTo("/explore")}
              className="flex items-center gap-1 rounded-full border border-[rgba(15,76,129,0.1)] bg-white px-3 py-2 transition hover:bg-[rgba(15,76,129,0.04)]"
            >
              <Building2 className="size-4 text-[color:var(--brand-primary)]" />
              Explore
            </button>
            <button
              type="button"
              className="rounded-full border border-[rgba(15,76,129,0.1)] bg-white p-2 hover:bg-[rgba(15,76,129,0.04)]"
              aria-label="Notifications"
            >
              <Bell className="size-4" />
            </button>
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
                className={`absolute right-0 top-[calc(100%+0.7rem)] w-44 origin-top-right rounded-2xl border border-[rgba(15,76,129,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,249,255,0.98))] p-2 shadow-[0_18px_40px_rgba(22,50,79,0.12)] transition-all duration-300 ${
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
                      {isCollegeUser ? "Dashboard" : "Account"}
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
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
      </div>

      <nav className="relative z-20 mt-3 flex flex-col gap-2 overflow-visible pb-0 text-sm text-[color:var(--text-dark)] md:flex-row md:flex-nowrap md:items-center">
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
          className="peer w-full rounded-full border border-[rgba(255,138,61,0.35)] bg-white px-4 py-2 font-semibold shadow-[0_10px_24px_rgba(22,50,79,0.08)] transition hover:border-[rgba(255,138,61,0.6)] hover:bg-[rgba(255,138,61,0.05)] md:w-auto md:py-1.5"
        >
          All Courses
        </button>
        <div className="relative z-20 min-w-0 flex-1 overflow-hidden rounded-2xl border border-[rgba(15,76,129,0.08)] bg-white/70 px-3 py-2 shadow-[0_10px_24px_rgba(22,50,79,0.04)] transition duration-300 md:block md:py-1.5">
          <div className="scrollbar-hide relative z-30 flex w-full items-center gap-x-1 gap-y-1 overflow-x-auto whitespace-nowrap py-1 text-xs font-semibold md:flex-wrap md:justify-center md:py-0">
            {movingNavLinks.map((item, index) => (
              <span key={item.label} className="inline-flex items-center">
                <button
                  type="button"
                  onClick={() => goTo(item.href)}
                  className="rounded-full px-2.5 py-1 font-[family:var(--font-display)] text-[color:var(--text-muted)] transition hover:bg-[rgba(15,76,129,0.05)] hover:text-[color:var(--brand-primary)]"
                >
                  {item.label}
                </button>
                {index < movingNavLinks.length - 1 ? (
                  <span className="px-1.5 text-[color:var(--brand-accent)]">|</span>
                ) : null}
              </span>
            ))}
          </div>
        </div>
      </nav>

      {isDrawerOpen ? (
        <div className="fixed inset-0 z-[400] bg-black/35 md:hidden">
          <button
            type="button"
            aria-label="Close menu overlay"
            className="absolute inset-0 h-full w-full"
            onClick={() => setIsDrawerOpen(false)}
          />
          <aside className="absolute right-0 top-0 z-[401] h-full w-[86%] max-w-sm overflow-y-auto border-l border-[rgba(15,76,129,0.12)] bg-[linear-gradient(180deg,#ffffff,#f1f6ff)] p-5 text-[color:var(--text-dark)] shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <BrandLogo variant="tab" textColor="dark" className="h-8" />
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="rounded-full border border-[rgba(15,76,129,0.25)] p-2 text-[color:var(--text-dark)] hover:bg-[rgba(15,76,129,0.06)]"
                aria-label="Close menu"
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
                onClick={openPreferenceModal}
                className="w-full rounded-full border border-[rgba(15,76,129,0.1)] bg-white px-4 py-2 text-left text-sm font-semibold text-[color:var(--text-dark)] transition hover:bg-[rgba(15,76,129,0.04)]"
              >
                City & College
              </button>
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

            <div className="mt-5 space-y-2">
              {currentUser ? (
                <>
                  <Link
                    href={accountHref}
                    className="flex w-full items-center gap-2 rounded-full border border-[rgba(15,76,129,0.1)] bg-white px-4 py-2 text-left text-sm font-semibold text-[color:var(--text-dark)] transition hover:bg-[rgba(15,76,129,0.04)]"
                  >
                    <LayoutDashboard className="size-4" />
                    {isCollegeUser ? "Dashboard" : "Account"}
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
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

      {isPreferenceModalOpen ? (
        <StudyPreferenceModal
          key={`${visibleStudyPreference.city}-${visibleStudyPreference.college}`}
          isOpen={isPreferenceModalOpen}
          selectedCity={visibleStudyPreference.city}
          selectedCollege={visibleStudyPreference.college}
          onClose={() => setIsPreferenceModalOpen(false)}
          onApply={handleApplyPreference}
        />
      ) : null}

      {isCoursesOpen ? (
        <div className="fixed inset-0 z-[1600] bg-black/35 backdrop-blur-[2px]">
          <div
            ref={panelRef}
            className="fixed left-0 top-0 z-[1601] h-screen w-[84vw] max-w-[18rem] overflow-hidden border-r border-[#d9cfbf] bg-[linear-gradient(180deg,#fffdf8,#f6efe2)] text-slate-800 shadow-2xl sm:w-[19rem] sm:max-w-[19rem]"
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
