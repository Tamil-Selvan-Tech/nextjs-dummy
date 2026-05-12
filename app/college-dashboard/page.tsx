"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, BookOpen, MapPin, Trophy } from "lucide-react";
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
  });
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [showCollegeForm, setShowCollegeForm] = useState(false);
  useStatusToast(status);

  const loadDashboard = useCallback(
    async (authToken: string) => {
      try {
        setLoading(true);
        const headers = withAuth(authToken);
        const [collegeData, courseData] = await Promise.all([
          request("/api/users/my-college", headers).catch(() => ({ college: null })),
          request("/api/users/my-courses", headers).catch(() => ({ courses: [] })),
        ]);

        setPortalState({
          college: (collegeData.college as CollegeProfile | null) || null,
          courses: (courseData.courses as CollegeCourse[]) || [],
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to load dashboard";
        setStatus({ type: "error", text: message });
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
      router.replace("/login?type=college&redirect=/college-dashboard");
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

  const hasExistingCollege = Boolean(portalState.college?._id);
  const lastDashboardEditAt = useMemo(() => {
    if (!portalState.college?.lastDashboardEditAt) return null;
    const parsed = new Date(portalState.college.lastDashboardEditAt);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }, [portalState.college?.lastDashboardEditAt]);
  const nextDashboardEditAt = useMemo(() => {
    if (!lastDashboardEditAt) return null;
    return new Date(lastDashboardEditAt.getTime() + collegeDashboardEditCooldownMs);
  }, [collegeDashboardEditCooldownMs, lastDashboardEditAt]);
  const isEditCooldownActive = Boolean(
    nextDashboardEditAt && nextDashboardEditAt.getTime() > Date.now(),
  );
  const locationLabel = useMemo(() => {
    const district = String(portalState.college?.district || "").trim();
    const state = String(portalState.college?.state || "").trim();
    if (district && state) return `${district}, ${state}`;
    return district || state || "-";
  }, [portalState.college?.district, portalState.college?.state]);
  const formattedNextDashboardEditAt = nextDashboardEditAt
    ? nextDashboardEditAt.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "";

  const openCollegeEditor = useCallback(() => {
    if (!hasExistingCollege || isEditCooldownActive) return;
    setShowCollegeForm(true);
    setTimeout(() => {
      document.getElementById("approved-college-form")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  }, [hasExistingCollege, isEditCooldownActive]);

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
            Once admin links the college profile, the summary will appear here.
          </p>
        </article>
      ) : null}

      {hasExistingCollege ? (
        <article className="overflow-hidden rounded-[1.45rem] border border-[rgba(15,76,129,0.1)] bg-[linear-gradient(135deg,#ffffff_0%,#eef7ff_52%,#f8fbff_100%)] p-5 shadow-[0_24px_48px_rgba(15,76,129,0.1)] sm:p-6">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-4">
                <div className="shrink-0">
                  {portalState.college?.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={portalState.college.logo}
                      alt={portalState.college.name || "College logo"}
                      className="h-24 w-24 rounded-[1.4rem] border border-[rgba(15,76,129,0.08)] bg-white object-contain p-4 shadow-[0_16px_28px_rgba(15,76,129,0.08)] sm:h-28 sm:w-28"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-[1.4rem] border border-[rgba(15,76,129,0.08)] bg-white text-2xl font-bold text-[color:var(--brand-primary)] shadow-[0_16px_28px_rgba(15,76,129,0.08)] sm:h-28 sm:w-28">
                      {getInitials(portalState.college?.name)}
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--brand-primary)]">
                    College Summary
                  </p>
                  <h2 className="mt-2 break-words text-2xl font-bold text-slate-900 sm:text-[2rem]">
                    {loading ? "Loading..." : portalState.college?.name || "Your College"}
                  </h2>
                  <p className="mt-2 text-sm font-semibold text-slate-600">
                    {portalState.college?.university && portalState.college?.establishedYear
                      ? `${portalState.college.university} | ${portalState.college.establishedYear}`
                      : portalState.college?.university || portalState.college?.establishedYear || "-"}
                  </p>
                </div>
              </div>

              <div className="sm:shrink-0">
                <button
                  type="button"
                  onClick={openCollegeEditor}
                  disabled={!hasExistingCollege || isEditCooldownActive}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  Edit Your College
                  <ArrowRight className="size-4" />
                </button>
                {isEditCooldownActive ? (
                  <p className="mt-2 text-xs font-medium text-amber-700">
                    Next edit unlock date: {formattedNextDashboardEditAt || "-"}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-[1rem] border border-[rgba(15,76,129,0.08)] bg-white/90 px-4 py-3 shadow-[0_12px_24px_rgba(15,76,129,0.06)]">
                <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  <Trophy className="size-3.5 text-[color:var(--brand-primary)]" />
                  Ranking
                </p>
                <p className="mt-2 text-sm font-bold text-slate-900">
                  {formatRankingRangeForDisplay(portalState.college?.ranking || "-")}
                </p>
              </div>

              <div className="rounded-[1rem] border border-[rgba(15,76,129,0.08)] bg-white/90 px-4 py-3 shadow-[0_12px_24px_rgba(15,76,129,0.06)]">
                <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  <MapPin className="size-3.5 text-[color:var(--brand-primary)]" />
                  Location
                </p>
                <p className="mt-2 text-sm font-bold text-slate-900 break-words">{locationLabel}</p>
              </div>

              <div className="rounded-[1rem] border border-[rgba(15,76,129,0.08)] bg-white/90 px-4 py-3 shadow-[0_12px_24px_rgba(15,76,129,0.06)]">
                <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  <BookOpen className="size-3.5 text-[color:var(--brand-primary)]" />
                  Course Count
                </p>
                <p className="mt-2 text-sm font-bold text-slate-900">
                  {loading ? "--" : portalState.courses.length}
                </p>
              </div>
            </div>
          </div>
        </article>
      ) : null}

      {hasExistingCollege && showCollegeForm ? (
        <div id="approved-college-form">
          <CollegeDashboardAddCollegeForm
            token={token}
            currentUser={currentUser}
            college={portalState.college as Record<string, unknown> | null}
            courses={portalState.courses as Record<string, unknown>[]}
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
