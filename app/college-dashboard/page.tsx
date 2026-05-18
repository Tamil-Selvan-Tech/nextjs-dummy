"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  GraduationCap,
  MessageSquareText,
  MapPin,
  ShieldCheck,
  Trophy,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { CollegeDashboardAddCollegeForm } from "@/components/college-dashboard-add-college-form";
import { CollegePortalShell } from "@/components/college-portal-shell";
import {
  clearAuth,
  readAuthToken,
  readCurrentUser,
  type SafeAuthUser,
} from "@/lib/auth-storage";
import { request, withAuth } from "@/lib/api";
import { formatRankingRangeForDisplay } from "@/lib/ranking-utils";
import { useStatusToast } from "@/lib/toast";

type CollegeProfile = {
  _id?: string;
  name?: string;
  university?: string;
  establishedYear?: string | number;
  state?: string;
  district?: string;
  ranking?: string | number;
  logo?: string;
  lastDashboardEditAt?: string;
};

type CollegeCourse = {
  _id?: string;
};

type PortalState = {
  college: CollegeProfile | null;
  courses: CollegeCourse[];
  enquiries: { _id?: string }[];
};

const getInitials = (value?: string) =>
  String(value || "College")
    .split(" ")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 2)
    .map((item) => item.charAt(0).toUpperCase())
    .join("");

export default function CollegeDashboardPage() {
  const collegeDashboardEditCooldownMs = 1000 * 60 * 60 * 24 * 10;

  const router = useRouter();

  const [token, setToken] = useState("");
  const [currentUser, setCurrentUser] = useState<SafeAuthUser | null>(null);

  const [portalState, setPortalState] = useState<PortalState>({
    college: null,
    courses: [],
    enquiries: [],
  });

  const [loading, setLoading] = useState(true);

  const [status, setStatus] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  const [showCollegeForm, setShowCollegeForm] = useState(false);

  useStatusToast(status);

  const loadDashboard = useCallback(
    async (authToken: string) => {
      try {
        setLoading(true);

        const headers = withAuth(authToken);

        const [collegeData, courseData, enquiryData] = await Promise.all([
          request("/api/users/my-college", headers).catch(() => ({
            college: null,
          })),
          request("/api/users/my-courses", headers).catch(() => ({
            courses: [],
          })),
          request("/api/users/college-enquiries", headers).catch(() => ({
            enquiries: [],
          })),
        ]);

        setPortalState({
          college:
            (collegeData.college as CollegeProfile | null) || null,
          courses:
            (courseData.courses as CollegeCourse[]) || [],
          enquiries:
            (enquiryData.enquiries as { _id?: string }[]) || [],
        });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to load dashboard";

        setStatus({
          type: "error",
          text: message,
        });

        if (message.toLowerCase().includes("not authorized")) {
          clearAuth();
          router.replace("/login?type=college");
        }
      } finally {
        setLoading(false);
      }
    },
    [router],
  );

  useEffect(() => {
    const storedToken = readAuthToken();
    const storedUser = readCurrentUser();

    if (!storedToken || !storedUser) {
      router.replace(
        "/login?type=college&redirect=/college-dashboard",
      );
      return;
    }

    if (storedUser.role !== "college") {
      router.replace("/account");
      return;
    }

    setToken(storedToken);
    setCurrentUser(storedUser);

    void loadDashboard(storedToken);
  }, [loadDashboard, router]);

  const hasExistingCollege = Boolean(
    portalState.college?._id,
  );

  const lastDashboardEditAt = useMemo(() => {
    if (!portalState.college?.lastDashboardEditAt) {
      return null;
    }

    const parsed = new Date(
      portalState.college.lastDashboardEditAt,
    );

    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }, [portalState.college?.lastDashboardEditAt]);

  const nextDashboardEditAt = useMemo(() => {
    if (!lastDashboardEditAt) {
      return null;
    }

    return new Date(
      lastDashboardEditAt.getTime() +
        collegeDashboardEditCooldownMs,
    );
  }, [
    collegeDashboardEditCooldownMs,
    lastDashboardEditAt,
  ]);

  const isEditCooldownActive = Boolean(
    nextDashboardEditAt &&
      nextDashboardEditAt.getTime() > Date.now(),
  );

  const locationLabel = useMemo(() => {
    const district = String(
      portalState.college?.district || "",
    ).trim();

    const state = String(
      portalState.college?.state || "",
    ).trim();

    if (district && state) {
      return `${district}, ${state}`;
    }

    return district || state || "-";
  }, [
    portalState.college?.district,
    portalState.college?.state,
  ]);

  const formattedNextDashboardEditAt =
    nextDashboardEditAt
      ? nextDashboardEditAt.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "";

  const openCollegeEditor = useCallback(() => {
    if (
      !hasExistingCollege ||
      isEditCooldownActive
    ) {
      return;
    }

    setShowCollegeForm(true);

    setTimeout(() => {
      document
        .getElementById("approved-college-form")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 50);
  }, [hasExistingCollege, isEditCooldownActive]);

  const summaryCards = [
    {
      label: "Ranking",
      value: formatRankingRangeForDisplay(
        portalState.college?.ranking || "-",
      ),
      helper: "State Rank",
      icon: Trophy,
    },
    {
      label: "Location",
      value: locationLabel,
      helper: "India",
      icon: MapPin,
    },
    {
      label: "Course Count",
      value: loading
        ? "--"
        : String(portalState.courses.length),
      helper: "Total Courses",
      icon: GraduationCap,
    },
    {
      label: "Enquiry Count",
      value: loading
        ? "--"
        : String(portalState.enquiries.length),
      helper: "Student Enquiries",
      icon: MessageSquareText,
    },
  ] as const;

  return (
    <CollegePortalShell
      title="College Dashboard"
      subtitle="Your college summary in one clean view."
      currentUser={currentUser}
    >
      {!hasExistingCollege ? (
        <article className="rounded-[1.25rem] border border-amber-200 bg-[linear-gradient(135deg,#fffbeb_0%,#fef3c7_100%)] p-5 shadow-[0_18px_34px_rgba(245,158,11,0.12)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-700">
            Dashboard Locked
          </p>

          <h2 className="mt-2 text-lg font-bold text-amber-950">
            College not linked to this login email
          </h2>

          <p className="mt-2 text-sm leading-6 text-amber-900/80">
            Once admin links the college profile,
            the summary will appear here.
          </p>
        </article>
      ) : null}

      {hasExistingCollege ? (
        <div className="space-y-5">

          {/* Welcome Banner */}
          <article className="relative overflow-hidden rounded-[1.8rem] border border-[#dbeafe] bg-[linear-gradient(135deg,#f8fbff_0%,#eef4ff_45%,#ffffff_100%)] p-5 shadow-[0_14px_32px_rgba(37,99,235,0.08)]">
            <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-[#dbeafe]/40 blur-3xl" />

            <div className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-[#bfdbfe]/30 blur-2xl" />

            <div className="relative flex items-center justify-between gap-4">
              <div>
                <p className="text-[1.05rem] font-semibold text-slate-700">
                  Welcome to{" "}
                  <span className="font-bold text-[#2563eb]">
                    {portalState.college?.name ||
                      "Your College"}{" "}
                    👋
                  </span>
                </p>

                {/* <p className="mt-2 text-sm text-slate-500">
                  Here's what's happening with your
                  college today.
                </p> */}
              </div>

              {/* <div className="hidden sm:flex h-14 w-14 items-center justify-center rounded-[1.2rem] bg-white shadow-[0_12px_24px_rgba(37,99,235,0.12)]">
                <GraduationCap className="size-7 text-[#2563eb]" />
              </div> */}
            </div>
          </article>

          {/* Main Card */}
          <article className="rounded-[2rem] border border-[rgba(15,76,129,0.08)] bg-white/95 p-5 shadow-[0_20px_44px_rgba(15,23,42,0.05)] sm:p-6">
            <div className="flex flex-col gap-5">

              <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

                <div className="flex min-w-0 items-center gap-5">

                  <div className="shrink-0">
                    {portalState.college?.logo ? (
                      <img
                        src={portalState.college.logo}
                        alt={
                          portalState.college.name ||
                          "College logo"
                        }
                        className="h-28 w-28 rounded-[1.8rem] border border-[rgba(15,76,129,0.08)] bg-white object-contain p-4 shadow-[0_16px_28px_rgba(15,76,129,0.08)] sm:h-32 sm:w-32"
                      />
                    ) : (
                      <div className="flex h-28 w-28 items-center justify-center rounded-[1.8rem] border border-[rgba(15,76,129,0.08)] bg-white text-3xl font-bold text-[color:var(--brand-primary)] shadow-[0_16px_28px_rgba(15,76,129,0.08)] sm:h-32 sm:w-32">
                        {getInitials(
                          portalState.college?.name,
                        )}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#2563eb]">
                      College Summary
                    </p>

                    <h2 className="mt-2 break-words text-[1.35rem] font-semibold leading-snug text-[#1e3a5f] sm:text-[1.65rem]">
                      {loading
                        ? "Loading..."
                        : portalState.college?.name ||
                          "Your College"}
                    </h2>

                    <p className="mt-2 text-base font-medium text-slate-700">
                      {portalState.college?.university &&
                      portalState.college
                        ?.establishedYear
                        ? `${portalState.college.university} | ${portalState.college.establishedYear}`
                        : portalState.college
                            ?.university ||
                          portalState.college
                            ?.establishedYear ||
                          "-"}
                    </p>
                  </div>
                </div>

                <div className="xl:shrink-0">
                  <button
                    type="button"
                    onClick={openCollegeEditor}
                    disabled={
                      !hasExistingCollege ||
                      isEditCooldownActive
                    }
                    className="inline-flex w-full items-center justify-center gap-2 rounded-[1.15rem] bg-[linear-gradient(135deg,#2563eb,#3b82f6_55%,#60a5fa)] px-5 py-3.5 text-base font-semibold text-white shadow-[0_18px_34px_rgba(37,99,235,0.24)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_38px_rgba(37,99,235,0.28)] disabled:cursor-not-allowed disabled:opacity-60 xl:w-auto"
                  >
                    Edit Your College

                    <ArrowRight className="size-4.5" />
                  </button>

                  {isEditCooldownActive ? (
                    <p className="mt-2 text-xs font-medium text-amber-700">
                      Next edit unlock date:{" "}
                      {formattedNextDashboardEditAt ||
                        "-"}
                    </p>
                  ) : null}
                </div>
              </div>

             {/* Summary Cards */}
<div className="grid gap-3 lg:grid-cols-4">
  {summaryCards.map((item, index) => {
    const Icon = item.icon;

    const cardStyles = [
      {
        card:
          "bg-[linear-gradient(135deg,#eff6ff_0%,#dbeafe_100%)] border-blue-100",
        icon:
          "bg-gradient-to-br from-blue-500 to-blue-600 text-white",
        glow: "bg-blue-400/20",
      },
      {
        card:
          "bg-[linear-gradient(135deg,#ecfeff_0%,#cffafe_100%)] border-cyan-100",
        icon:
          "bg-gradient-to-br from-cyan-500 to-sky-500 text-white",
        glow: "bg-cyan-400/20",
      },
      {
        card:
          "bg-[linear-gradient(135deg,#ecfdf3_0%,#d1fae5_100%)] border-emerald-100",
        icon:
          "bg-gradient-to-br from-emerald-500 to-green-500 text-white",
        glow: "bg-emerald-400/20",
      },
      {
        card:
          "bg-[linear-gradient(135deg,#fff7ed_0%,#ffedd5_100%)] border-orange-100",
        icon:
          "bg-gradient-to-br from-orange-500 to-amber-500 text-white",
        glow: "bg-orange-400/20",
      },
    ];

    return (
      <article
        key={item.label}
        className={`group relative overflow-hidden rounded-[1.35rem] border p-4 shadow-[0_12px_28px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_38px_rgba(37,99,235,0.12)] ${cardStyles[index].card}`}
      >
        <div
          className={`absolute -right-8 -top-8 h-24 w-24 rounded-full blur-3xl ${cardStyles[index].glow}`}
        />

        <div className="relative flex items-center gap-3">

          <span
            className={`inline-flex size-12 items-center justify-center rounded-[1rem] shadow-[0_10px_20px_rgba(0,0,0,0.10)] ${cardStyles[index].icon}`}
          >
            <Icon className="size-5" />
          </span>

          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
              {item.label}
            </p>

            <p className="mt-1 break-words text-[1.1rem] font-bold leading-tight text-slate-900">
              {item.value}
            </p>

            <p className="mt-0.5 text-[12px] font-medium text-slate-600">
              {item.helper}
            </p>
          </div>
        </div>
      </article>
    );
  })}
</div>
            </div>
          </article>

          {/* Privacy Card */}
          <article className="rounded-[1.8rem] border border-[rgba(56,108,255,0.1)] bg-[linear-gradient(135deg,#f7fbff,#edf4ff)] px-5 py-5 shadow-[0_16px_34px_rgba(37,99,235,0.06)]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-start gap-4">
                <span className="inline-flex size-14 items-center justify-center rounded-[1.1rem] bg-white text-[#2563eb] shadow-[0_10px_22px_rgba(37,99,235,0.08)]">
                  <ShieldCheck className="size-7" />
                </span>

                <div>
                  <h3 className="text-2xl font-bold text-[#2563eb]">
                    Your data is safe with us
                  </h3>

                  <p className="mt-2 text-base text-slate-600">
                    We never share your data with
                    anyone. Privacy protected.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  router.push("/privacy-policy")
                }
                className="inline-flex items-center gap-2 text-lg font-semibold text-[#2563eb]"
              >
                Learn more

                <ArrowRight className="size-5" />
              </button>
            </div>
          </article>
        </div>
      ) : null}

      {hasExistingCollege && showCollegeForm ? (
        <div id="approved-college-form">
          <CollegeDashboardAddCollegeForm
            token={token}
            currentUser={currentUser}
            college={
              portalState.college as Record<
                string,
                unknown
              > | null
            }
            courses={
              portalState.courses as Record<
                string,
                unknown
              >[]
            }
            requestActionType="update"
            onSaved={async () => {
              await loadDashboard(token);

              setShowCollegeForm(false);

              setStatus({
                type: "success",
                text: "College details were updated successfully. Next dashboard edit will unlock after 10 days.",
              });
            }}
          />
        </div>
      ) : null}
    </CollegePortalShell>
  );
}
