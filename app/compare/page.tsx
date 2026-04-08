"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeIndianRupee,
  Download,
  GraduationCap,
  Heart,
  List,
  Library,
  MapPin,
  Medal,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trophy,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { PopularComparisons } from "@/components/popular-comparisons";
import { readAuthToken } from "@/lib/auth-storage";
import { fetchPublicPanelData } from "@/lib/public-data";
import {
  colleges,
  getCoursesForCollege,
  type College,
} from "@/lib/site-data";

type CompareCollege = College | null;

const sectionCards = [
  { key: "overview", title: "Institute Information", icon: GraduationCap },
  { key: "ranking", title: "Ranking & Recognition", icon: Trophy },
  { key: "fees", title: "Course Fees", icon: BadgeIndianRupee },
  { key: "cutoff", title: "Cut Off Snapshot", icon: Medal },
  { key: "facilities", title: "Infrastructure & Facilities", icon: Library },
];

const facilityIconMap: Record<string, typeof Library> = {
  Library,
  Hostel: ShieldCheck,
  Labs: GraduationCap,
  Sports: Trophy,
  Hospital: ShieldCheck,
};

const comparisonPairs = [
  { label: "University", value: (college: College) => college.university || "-" },
  { label: "Location", value: (college: College) => `${college.district}, ${college.state}` },
  { label: "Accreditation", value: (college: College) => college.accreditation || "-" },
  { label: "Placement Rate", value: (college: College) => `${college.placementRate || 0}%` },
  { label: "Hostel", value: (college: College) => (college.hasHostel ? "Available" : "Not Available") },
];

const getCourseSummary = (college: College) => {
  const collegeCourses = getCoursesForCollege(college.name);
  const topCourse = collegeCourses[0];
  return {
    totalCourses: collegeCourses.length,
    topCourse,
    fees:
      typeof topCourse?.totalFees === "number"
        ? `Rs. ${topCourse.totalFees.toLocaleString()}`
        : "-",
    cutoff: topCourse?.cutoff ? `${topCourse.cutoff}` : "-",
  };
};

const scoreCollege = (college: College) => {
  const summary = getCourseSummary(college);
  return (college.placementRate || 0) + (summary.topCourse?.cutoff || 0) / 10;
};

const getCollegeByIdFromList = (list: College[], id: string | null) => {
  if (!id) return null;
  return list.find((college) => college.id === id) || null;
};

export default function ComparePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCollegeId = searchParams.get("college");
  const focusCollegeId = searchParams.get("focus");
  const token = readAuthToken();
  const [search, setSearch] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [likedCollegeId, setLikedCollegeId] = useState<string | null>(null);
  const [availableColleges, setAvailableColleges] = useState<College[]>(colleges);
  const [compareColleges, setCompareColleges] = useState<CompareCollege[]>([null, null, null]);

  useEffect(() => {
    let isMounted = true;

    const loadCompareColleges = async () => {
      try {
        const panelData = await fetchPublicPanelData();
        if (!isMounted || !panelData.colleges.length) return;

        let resolvedColleges = panelData.colleges;
        let seededCollege = getCollegeByIdFromList(resolvedColleges, initialCollegeId);
        let focusedCollege =
          focusCollegeId && focusCollegeId !== initialCollegeId
            ? getCollegeByIdFromList(resolvedColleges, focusCollegeId)
            : null;

        if (!seededCollege && initialCollegeId) {
          const fallbackSeed = getCollegeByIdFromList(colleges, initialCollegeId);
          if (fallbackSeed) {
            resolvedColleges = [
              fallbackSeed,
              ...resolvedColleges.filter((item) => item.id !== fallbackSeed.id),
            ];
            seededCollege = fallbackSeed;
          }
        }

        if (!focusedCollege && focusCollegeId) {
          const fallbackFocus = getCollegeByIdFromList(colleges, focusCollegeId);
          if (fallbackFocus) {
            resolvedColleges = [
              ...resolvedColleges.filter((item) => item.id !== fallbackFocus.id),
              fallbackFocus,
            ];
            focusedCollege = fallbackFocus;
          }
        }

        setAvailableColleges(resolvedColleges);
        setCompareColleges((previous) => {
          const seed = seededCollege || previous[0] || null;
          const focus = focusedCollege || previous[1] || null;
          const base = [seed, focus, previous[2] || null];
          if (!seed) return base;
          const withoutSeed = base.filter((item) => item?.id !== seed.id);
          return [seed, ...withoutSeed].slice(0, 3);
        });
      } catch {
        const seededCollege = getCollegeByIdFromList(colleges, initialCollegeId);
        const focusedCollege =
          focusCollegeId && focusCollegeId !== initialCollegeId
            ? getCollegeByIdFromList(colleges, focusCollegeId)
            : null;

        setCompareColleges((previous) => {
          const seed = seededCollege || previous[0] || null;
          const focus = focusedCollege || previous[1] || null;
          const base = [seed, focus, previous[2] || null];
          if (!seed) return base;
          const withoutSeed = base.filter((item) => item?.id !== seed.id);
          return [seed, ...withoutSeed].slice(0, 3);
        });
      }
    };

    void loadCompareColleges();

    return () => {
      isMounted = false;
    };
  }, [focusCollegeId, initialCollegeId]);

  const filteredColleges = useMemo(() => {
    const query = search.trim().toLowerCase();
    return availableColleges.filter((college) => {
      if (!query) return true;
      return (
        college.name.toLowerCase().includes(query) ||
        college.university.toLowerCase().includes(query) ||
        college.district.toLowerCase().includes(query)
      );
    });
  }, [availableColleges, search]);

  const selectedColleges = compareColleges.filter(Boolean) as College[];
  const compareTitle = selectedColleges.map((college) => college.name).join(" vs ");

  const ensureAuth = (slot: number) => {
    if (token) {
      setActiveSlot(slot);
      setShowPicker(true);
      return;
    }
    setActiveSlot(slot);
    setShowLoginPrompt(true);
  };

  const applyCollege = (college: College) => {
    if (activeSlot === null) return;
    setCompareColleges((previous) => {
      const next = [...previous];
      next[activeSlot] = college;
      return next;
    });
    setShowPicker(false);
    setSearch("");
  };

  const applyPopularComparison = (primary: College, secondary: College) => {
    setCompareColleges((previous) => {
      const third =
        previous.find(
          (item) =>
            item &&
            item.id !== primary.id &&
            item.id !== secondary.id,
        ) || null;
      return [primary, secondary, third];
    });
  };

  const removeCollege = (slot: number) => {
    setCompareColleges((previous) => {
      const next = [...previous];
      next[slot] = null;
      return next;
    });
  };

  const handleDownload = () => {
    window.print();
  };

  const renderMobileSlot = (college: CompareCollege, slot: number) => {
    if (college) {
      return (
        <div className="flex h-full flex-col items-center gap-3 rounded-[1.35rem] border border-[rgba(15,76,129,0.12)] bg-white px-2.5 py-2.5 text-center shadow-[0_12px_26px_rgba(15,76,129,0.08)] sm:px-3 sm:py-3">
          <div className="flex w-full items-center justify-end">
            <button
              type="button"
              onClick={() => removeCollege(slot)}
              className="rounded-full border border-[rgba(15,76,129,0.14)] p-1.5 text-slate-500 transition hover:bg-[rgba(15,76,129,0.04)]"
              aria-label="Remove selected college"
            >
              <X className="size-3.5" />
            </button>
          </div>
          <div
            className="relative h-12 w-24 overflow-hidden rounded-[0.9rem] border border-[rgba(15,76,129,0.14)] shadow-[0_8px_18px_rgba(22,50,79,0.1)]"
            style={{
              backgroundImage:
                "linear-gradient(135deg, #e7edf6 0%, #ffffff 100%), repeating-linear-gradient(45deg, rgba(15,76,129,0.08) 0 6px, rgba(255,255,255,0.9) 6px 12px)",
              backgroundBlendMode: "multiply",
            }}
          >
            <Image
              src={college.logo || college.image}
              alt={college.name}
              fill
              sizes="96px"
              className={college.logo ? "object-contain p-2" : "object-cover"}
            />
          </div>
          <h3 className="line-clamp-3 text-sm font-semibold leading-5 text-[color:var(--brand-primary)]">
            {college.name}
          </h3>
          <p className="inline-flex items-center gap-1 text-xs text-slate-500">
            <MapPin className="size-3.5" />
            {college.district}
          </p>
          <button
            type="button"
            onClick={() => ensureAuth(slot)}
            className="mt-1 inline-flex items-center justify-center gap-2 rounded-full border border-[rgba(15,76,129,0.2)] px-3 py-1.5 text-xs font-semibold text-[color:var(--brand-primary)] transition hover:bg-[rgba(15,76,129,0.04)]"
          >
            <RefreshCw className="size-3.5" />
            Modify Selection
          </button>
        </div>
      );
    }

    return (
      <div
        role="button"
        tabIndex={0}
        onClick={() => ensureAuth(slot)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            ensureAuth(slot);
          }
        }}
        className="flex h-full flex-col items-center justify-center gap-3 rounded-[1.35rem] border-2 border-dashed border-[rgba(15,76,129,0.24)] bg-white/70 px-2.5 py-2.5 text-center transition hover:border-[rgba(15,76,129,0.4)] sm:px-3 sm:py-3"
      >
        <div className="rounded-[0.9rem] border border-dashed border-[rgba(15,76,129,0.35)] bg-white px-4 py-5 text-[color:var(--brand-primary)]">
          <Plus className="size-5" />
        </div>
        <p className="text-sm font-semibold text-[color:var(--text-dark)]">Add College</p>
        <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">Or</span>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            ensureAuth(slot);
          }}
          className="rounded-full border border-[rgba(15,76,129,0.2)] px-3 py-1.5 text-xs font-semibold text-[color:var(--brand-primary)] transition hover:bg-[rgba(15,76,129,0.04)]"
        >
          Add Similar College
        </button>
      </div>
    );
  };

  return (
    <section className="section-shell min-h-screen bg-[linear-gradient(180deg,#f9fcff_0%,#eef6fc_100%)] text-[color:var(--text-dark)]">
      <div className="mesh-bg opacity-65" />
      <div className="hero-grid absolute inset-0 opacity-[0.05]" />

      <div className="relative z-10">
        <Navbar />

        <div className="page-container-full py-6 px-4 sm:px-6 md:py-10">
          <div className="reveal-up rounded-[2rem] border border-[rgba(15,76,129,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,251,255,0.96))] p-5 shadow-[0_28px_60px_rgba(22,50,79,0.1)] sm:p-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <p className="editorial-kicker">
                  <Trophy className="size-3.5" />
                  Compare Colleges
                </p>
                <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[rgba(15,76,129,0.1)] bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--brand-primary)] shadow-[0_10px_24px_rgba(22,50,79,0.05)]">
                  Side-by-side college snapshot
                </div>
                <h1 className="mt-4 max-w-4xl text-balance font-[family:var(--font-display)] text-[1.55rem] font-bold leading-[1.2] text-[color:var(--text-dark)] sm:text-[1.85rem]">
                  {compareTitle || "Compare top colleges side by side"}
                </h1>
                <p className="mt-4 max-w-3xl text-sm leading-6 text-[color:var(--text-muted)] sm:text-base">
                  Review rankings, fees, cut off signals, facilities, and key college facts in one
                  cleaner comparison experience built with the same modern visual language as the
                  homepage.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex items-center gap-2 rounded-full border border-[rgba(15,76,129,0.12)] bg-white px-4 py-2.5 text-sm font-semibold text-[color:var(--brand-primary)] transition hover:bg-[rgba(15,76,129,0.04)]"
                >
                  <Download className="size-4" />
                  Download / Print
                </button>
                <Link
                  href="/explore"
                  className="shine-button inline-flex items-center gap-2 rounded-full bg-[color:var(--brand-primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[color:var(--brand-primary-soft)]"
                >
                  Explore More
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-6 md:hidden">
            <article className="luxe-card reveal-up p-3 sm:p-4">
              <div className="grid grid-cols-2 gap-3">
                {renderMobileSlot(compareColleges[0], 0)}
                {renderMobileSlot(compareColleges[1], 1)}
              </div>
            </article>
          </div>

          <div className="mt-6 hidden gap-4 md:grid lg:grid-cols-3">
            {compareColleges.map((college, slot) => (
              <article
                key={`compare-slot-${slot}`}
                className="luxe-card reveal-up flex min-h-[22rem] flex-col p-4 sm:p-5"
              >
                {college ? (
                  <>
                    <div className="flex items-start justify-between gap-3">
                      <span className="rounded-full bg-[rgba(15,76,129,0.06)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--brand-primary)]">
                        Compare Slot {slot + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeCollege(slot)}
                        className="rounded-full border border-[rgba(15,76,129,0.1)] p-2 text-slate-500 transition hover:bg-[rgba(15,76,129,0.04)] hover:text-slate-700"
                        aria-label="Remove selected college"
                      >
                        <X className="size-4" />
                      </button>
                    </div>

                    <div className="mt-4 flex items-center gap-4">
                      <div
                        className="relative h-16 w-16 overflow-hidden rounded-[1.2rem] border border-[rgba(15,76,129,0.14)] shadow-[0_10px_20px_rgba(22,50,79,0.1)]"
                        style={{
                          backgroundImage:
                            "linear-gradient(135deg, #e7edf6 0%, #ffffff 100%), repeating-linear-gradient(45deg, rgba(15,76,129,0.08) 0 6px, rgba(255,255,255,0.9) 6px 12px)",
                          backgroundBlendMode: "multiply",
                        }}
                      >
                        <Image
                          src={college.logo || college.image}
                          alt={college.name}
                          fill
                          sizes="64px"
                          className={college.logo ? "object-contain p-2" : "object-cover"}
                        />
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-lg font-bold text-[color:var(--text-dark)]">
                          {college.name}
                        </h2>
                        <p className="mt-1 inline-flex items-center gap-1 text-sm text-slate-500">
                          <MapPin className="size-4" />
                          {college.district}, {college.state}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-[1rem] border border-[rgba(15,76,129,0.08)] bg-white px-4 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                          Ranking
                        </p>
                        <p className="mt-2 font-bold text-[color:var(--text-dark)]">{college.ranking}</p>
                      </div>
                      <div className="rounded-[1rem] border border-[rgba(15,76,129,0.08)] bg-white px-4 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                          Placement
                        </p>
                        <p className="mt-2 font-bold text-[color:var(--text-dark)]">
                          {college.placementRate}%
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => ensureAuth(slot)}
                        className="inline-flex items-center gap-2 rounded-full border border-[rgba(15,76,129,0.12)] bg-white px-4 py-2 text-sm font-semibold text-[color:var(--brand-primary)] transition hover:bg-[rgba(15,76,129,0.04)]"
                      >
                        <RefreshCw className="size-4" />
                        Modify
                      </button>
                      <button
                        type="button"
                        onClick={() => setLikedCollegeId(college.id)}
                        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                          likedCollegeId === college.id
                            ? "bg-[rgba(255,138,61,0.12)] text-[color:var(--brand-accent-deep)]"
                            : "border border-[rgba(15,76,129,0.1)] bg-white text-slate-600 hover:bg-[rgba(255,138,61,0.06)]"
                        }`}
                      >
                        <Heart className="size-4" />
                        Prefer This
                      </button>
                    </div>
                  </>
                ) : (
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => ensureAuth(slot)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        ensureAuth(slot);
                      }
                    }}
                    className="flex h-full flex-col items-center justify-center rounded-[1.5rem] border-2 border-dashed border-[rgba(15,76,129,0.16)] bg-[rgba(15,76,129,0.03)] px-6 text-center transition hover:border-[rgba(15,76,129,0.28)]"
                  >
                    <div className="rounded-full bg-white p-3 text-[color:var(--brand-primary)] shadow-[0_12px_24px_rgba(22,50,79,0.08)]">
                      <Plus className="size-5" />
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-[color:var(--text-dark)]">
                      Add College
                    </h3>
                    <p className="mt-2 max-w-xs text-sm leading-7 text-[color:var(--text-muted)]">
                      Select another college to expand your comparison table.
                    </p>
                    <button
                      type="button"
                      onClick={() => ensureAuth(slot)}
                      className="mt-5 inline-flex items-center gap-2 rounded-full bg-[color:var(--brand-primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[color:var(--brand-primary-soft)]"
                    >
                      Choose College
                      <ArrowRight className="size-4" />
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>

          <div className="mt-8 space-y-5">
            {sectionCards.map((section) => {
              const Icon = section.icon;
              return (
                <section
                  key={section.key}
                  className="reveal-up rounded-[1.8rem] border border-[rgba(15,76,129,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,251,255,0.95))] p-5 shadow-[0_18px_44px_rgba(22,50,79,0.08)] sm:p-6"
                >
                  <div className="flex items-center gap-3">
                    <span className="rounded-[1rem] bg-[rgba(15,76,129,0.08)] p-2.5 text-[color:var(--brand-primary)]">
                      <Icon className="size-4.5" />
                    </span>
                    <h2 className="text-lg font-bold text-[color:var(--text-dark)]">{section.title}</h2>
                  </div>

                  <div className="mt-5 grid grid-cols-2 items-stretch gap-0 overflow-hidden rounded-[1.3rem] border border-[rgba(15,76,129,0.08)] bg-white sm:gap-4 sm:rounded-none sm:border-0 sm:bg-transparent md:grid-cols-2 lg:grid-cols-3">
                    {compareColleges.map((college, index) => {
                      if (!college) {
                        return (
                          <div
                            key={`${section.key}-empty-${index}`}
                            className={`rounded-[1.3rem] border border-dashed border-[rgba(15,76,129,0.14)] bg-[rgba(15,76,129,0.03)] px-3 py-6 text-center text-sm text-[color:var(--text-muted)] sm:px-4 sm:py-8 ${
                              index === 2 ? "hidden lg:block" : ""
                            }`}
                          >
                            No college selected
                          </div>
                        );
                      }

                      const summary = getCourseSummary(college);
                      const topFacilities = college.facilities.slice(0, 3);
                      const facilityHighlightsMobile = topFacilities;

                      return (
                        <article
                          key={`${section.key}-${college.id}`}
                          className={`flex h-full flex-col border border-[rgba(15,76,129,0.08)] bg-white px-3 py-3 sm:rounded-[1.3rem] sm:px-4 sm:py-4 ${
                            index === 0 ? "border-r-0 sm:border" : ""
                          } ${index === 1 ? "border-l-0 sm:border" : ""} ${
                            index === 2 ? "hidden lg:block" : ""
                          }`}
                        >
                          <div className="mb-4 border-b border-[rgba(15,76,129,0.08)] pb-3">
                            <p className="line-clamp-2 text-sm font-bold text-[color:var(--text-dark)] sm:text-base">
                              {college.name}
                            </p>
                            <p className="mt-1 line-clamp-1 text-xs text-slate-500 sm:text-sm">
                              {college.university}
                            </p>
                          </div>

                          {section.key === "overview" ? (
                            <div className="space-y-2.5 text-[12.5px] sm:text-[13px]">
                              {comparisonPairs.map((item) => (
                                <div
                                  key={item.label}
                                  className="grid grid-cols-[72px_minmax(0,1fr)] items-start gap-x-2 border-b border-[rgba(15,76,129,0.08)] pb-2.5 last:border-b-0 last:pb-0 sm:grid-cols-[92px_minmax(0,1fr)]"
                                >
                                  <span className="text-slate-500">{item.label}</span>
                                  <span className="text-left font-semibold text-[color:var(--text-dark)] break-words sm:text-right">
                                    {item.value(college)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : null}

                          {section.key === "ranking" ? (
                            <div className="space-y-2.5 text-[12.5px] sm:text-[13px]">
                              <div className="grid grid-cols-[72px_minmax(0,1fr)] items-start gap-x-2 border-b border-[rgba(15,76,129,0.08)] pb-2.5 sm:grid-cols-[92px_minmax(0,1fr)]">
                                <span className="text-slate-500">Recognition</span>
                                <span className="text-left font-semibold text-[color:var(--text-dark)] break-words sm:text-right">
                                  {college.accreditation}
                                </span>
                              </div>
                              <div className="grid grid-cols-[72px_minmax(0,1fr)] items-start gap-x-2 sm:grid-cols-[92px_minmax(0,1fr)]">
                                <span className="text-slate-500">Current Rank</span>
                                <span className="text-left font-semibold text-[color:var(--text-dark)] break-words sm:text-right">
                                  {college.ranking}
                                </span>
                              </div>
                              <div className="rounded-[1rem] bg-[rgba(255,138,61,0.08)] px-4 py-3 text-[13px] text-[color:var(--brand-accent-deep)]">
                                Strong standing for students comparing trust, recognition, and visibility.
                              </div>
                            </div>
                          ) : null}

                          {section.key === "fees" ? (
                            <div className="space-y-2.5 text-[12.5px] sm:text-[13px]">
                              <div className="grid grid-cols-[72px_minmax(0,1fr)] items-start gap-x-2 border-b border-[rgba(15,76,129,0.08)] pb-2.5 sm:grid-cols-[92px_minmax(0,1fr)]">
                                <span className="text-slate-500">Top Course</span>
                                <span className="text-left font-semibold text-[color:var(--text-dark)] break-words sm:text-right">
                                  {summary.topCourse?.course || "-"}
                                </span>
                              </div>
                              <div className="grid grid-cols-[72px_minmax(0,1fr)] items-start gap-x-2 border-b border-[rgba(15,76,129,0.08)] pb-2.5 sm:grid-cols-[92px_minmax(0,1fr)]">
                                <span className="text-slate-500">Estimated Fees</span>
                                <span className="text-left font-semibold text-[color:var(--text-dark)] break-words sm:text-right">
                                  {summary.fees}
                                </span>
                              </div>
                              <div className="grid grid-cols-[72px_minmax(0,1fr)] items-start gap-x-2 sm:grid-cols-[92px_minmax(0,1fr)]">
                                <span className="text-slate-500">Programs Listed</span>
                                <span className="text-left font-semibold text-[color:var(--text-dark)] break-words sm:text-right">
                                  {summary.totalCourses}
                                </span>
                              </div>
                            </div>
                          ) : null}

                          {section.key === "cutoff" ? (
                            <div className="space-y-2.5 text-[12.5px] sm:text-[13px]">
                              <div className="grid grid-cols-[72px_minmax(0,1fr)] items-start gap-x-2 sm:grid-cols-[92px_minmax(0,1fr)]">
                                <span className="text-slate-500">Top Cutoff</span>
                                <span className="text-left font-semibold text-[color:var(--text-dark)] break-words sm:text-right">
                                  {summary.cutoff}
                                </span>
                              </div>
                              <div className="rounded-[1rem] bg-[rgba(15,76,129,0.05)] px-4 py-3 text-[13px] text-slate-600">
                                Compare with caution: cutoff varies by course, category, and counselling round.
                              </div>
                            </div>
                          ) : null}

                          {section.key === "facilities" ? (
                            <div className="space-y-2.5 text-[12.5px] sm:text-[13px]">
                              <div className="grid gap-2 sm:hidden">
                                {facilityHighlightsMobile.map((item, idx) => (
                                  <div
                                    key={`${college.id}-facility-${idx}`}
                                    className="flex items-start gap-2 rounded-[1.1rem] bg-[rgba(15,76,129,0.06)] px-3 py-2 text-[11.5px] font-semibold leading-4 text-[color:var(--brand-primary)] min-[380px]:text-[12px] min-[380px]:leading-5"
                                  >
                                    <List className="mt-0.5 size-3.5 shrink-0" />
                                    <span className="line-clamp-4 text-pretty break-words">{item}</span>
                                  </div>
                                ))}
                              </div>
                              <div className="hidden flex-wrap gap-2 sm:flex">
                                {topFacilities.map((facility) => {
                                  const FacilityIcon = facilityIconMap[facility] || Library;
                                  return (
                                    <span
                                      key={facility}
                                      className="inline-flex items-center gap-2 rounded-full bg-[rgba(15,76,129,0.06)] px-3 py-1.5 text-xs font-semibold text-[color:var(--brand-primary)]"
                                    >
                                      <FacilityIcon className="size-3.5" />
                                      {facility}
                                    </span>
                                  );
                                })}
                              </div>
                              <div className="text-[11.5px] leading-4 text-slate-600 min-[380px]:text-[12.5px] min-[380px]:leading-5 sm:text-[13px]">
                                Hostel:{" "}
                                <span className="font-semibold text-[color:var(--text-dark)]">
                                  {college.hasHostel ? "Available" : "Not Available"}
                                </span>
                              </div>
                              <div className="text-[11.5px] leading-4 text-slate-600 break-words min-[380px]:text-[12.5px] min-[380px]:leading-5 sm:text-[13px]">
                                Streams:{" "}
                                <span className="font-semibold text-[color:var(--text-dark)]">
                                  {college.streams.join(", ")}
                                </span>
                              </div>
                            </div>
                          ) : null}
                        </article>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>

          <PopularComparisons
            selectedCollege={selectedColleges[0] || null}
            colleges={availableColleges}
            onSelectComparison={applyPopularComparison}
          />
        </div>
      </div>

      {showPicker ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[2rem] border border-[rgba(15,76,129,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,251,255,0.96))] p-5 shadow-[0_30px_80px_rgba(4,12,26,0.2)] sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--brand-primary)]">
                  Compare Setup
                </p>
                <h2 className="mt-2 text-xl font-bold text-[color:var(--text-dark)]">Select a college</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowPicker(false)}
                className="rounded-full border border-[rgba(15,76,129,0.12)] p-2 text-slate-500 transition hover:bg-[rgba(15,76,129,0.04)]"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-5 rounded-[1.2rem] border border-[rgba(15,76,129,0.08)] bg-white px-4 py-3">
              <div className="flex items-center gap-3">
                <Search className="size-4 text-[color:var(--brand-primary)]" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search college by name, district, or university"
                  className="w-full bg-transparent text-sm text-[color:var(--text-dark)] outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="mt-5 max-h-[24rem] space-y-3 overflow-y-auto pr-1">
              {filteredColleges.map((college) => {
                const summary = getCourseSummary(college);
                return (
                  <button
                    key={college.id}
                    type="button"
                    onClick={() => applyCollege(college)}
                    className="flex w-full items-start justify-between gap-4 rounded-[1.2rem] border border-[rgba(15,76,129,0.08)] bg-white px-4 py-4 text-left transition hover:border-[rgba(255,138,61,0.35)] hover:bg-[rgba(15,76,129,0.03)]"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[0.95rem] border border-[rgba(15,76,129,0.08)] bg-white">
                        <Image
                          src={college.logo || college.image}
                          alt={college.name}
                          fill
                          sizes="48px"
                          className={college.logo ? "object-contain p-1.5" : "object-cover"}
                        />
                      </div>
                      <div className="min-w-0">
                      <p className="font-semibold text-[color:var(--text-dark)]">{college.name}</p>
                      <p className="mt-1 text-sm text-slate-500">{college.university}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-full bg-[rgba(15,76,129,0.06)] px-3 py-1 text-xs font-semibold text-[color:var(--brand-primary)]">
                          {college.district}
                        </span>
                        <span className="rounded-full bg-[rgba(255,138,61,0.08)] px-3 py-1 text-xs font-semibold text-[color:var(--brand-accent-deep)]">
                          {summary.fees}
                        </span>
                      </div>
                      </div>
                    </div>
                    <ArrowRight className="mt-1 size-4 shrink-0 text-[color:var(--brand-primary)]" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}

      {showLoginPrompt ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[2rem] border border-[rgba(15,76,129,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,251,255,0.96))] p-6 text-center shadow-[0_30px_80px_rgba(4,12,26,0.2)]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(15,76,129,0.08)] text-[color:var(--brand-primary)]">
              <ShieldCheck className="size-7" />
            </div>
            <h2 className="mt-5 text-2xl font-bold text-[color:var(--text-dark)]">Login required</h2>
            <p className="mt-3 text-sm leading-7 text-[color:var(--text-muted)]">
              Compare setup and saved shortlist features use your signed-in student session. Login
              to continue with college comparison.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => setShowLoginPrompt(false)}
                className="rounded-full border border-[rgba(15,76,129,0.12)] px-5 py-3 text-sm font-semibold text-[color:var(--text-dark)] transition hover:bg-[rgba(15,76,129,0.04)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() =>
                  router.push(
                    `/login?redirect=${encodeURIComponent(
                      `/compare${initialCollegeId ? `?college=${initialCollegeId}` : ""}`,
                    )}`,
                  )
                }
                className="rounded-full bg-[color:var(--brand-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--brand-primary-soft)]"
              >
                Login Now
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
