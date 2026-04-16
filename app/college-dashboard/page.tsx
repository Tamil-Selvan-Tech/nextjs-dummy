"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, BookOpen, Building2, MailOpen } from "lucide-react";
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
import { useStatusToast } from "@/lib/toast";

type CollegeProfile = {
  _id?: string;
  name?: string;
  university?: string;
  state?: string;
  district?: string;
  ranking?: string | number;
  lastDashboardEditAt?: string;
};

type CollegeCourse = Record<string, unknown> & {
  _id?: string;
};

type PortalState = {
  college: CollegeProfile | null;
  courses: CollegeCourse[];
  enquiries: Array<{ _id: string }>;
};

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
  const [status, setStatus] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [showCollegeForm, setShowCollegeForm] = useState(false);
  useStatusToast(status);

  const loadDashboard = useCallback(
    async (authToken: string) => {
      try {
        setLoading(true);
        const headers = withAuth(authToken);
        const [collegeData, courseData, enquiryData] = await Promise.all([
          request("/api/users/my-college", headers).catch(() => ({ college: null })),
          request("/api/users/my-courses", headers).catch(() => ({ courses: [] })),
          request("/api/users/college-enquiries", headers).catch(() => ({ enquiries: [] })),
        ]);

        setPortalState({
          college: (collegeData.college as CollegeProfile | null) || null,
          courses: (courseData.courses as CollegeCourse[]) || [],
          enquiries: (enquiryData.enquiries as Array<{ _id: string }>) || [],
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
  const formattedLastDashboardEditAt = lastDashboardEditAt
    ? lastDashboardEditAt.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "";
  const formattedNextDashboardEditAt = nextDashboardEditAt
    ? nextDashboardEditAt.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "";

  const statCards = useMemo(
    () => [
      {
        label: "College Link",
        value: hasExistingCollege ? "Matched" : "Not linked",
        icon: Building2,
      },
      {
        label: "Courses",
        value: String(portalState.courses.length),
        icon: BookOpen,
      },
      {
        label: "Enquiries",
        value: String(portalState.enquiries.length),
        icon: MailOpen,
      },
    ],
    [hasExistingCollege, portalState.courses.length, portalState.enquiries.length],
  );

  return (
    <CollegePortalShell
      title="College Dashboard"
      subtitle="Your college profile is editable only when admin-added college email matches your login email."
      currentUser={currentUser}
      actions={<></>}
    >
      {!hasExistingCollege ? (
        <article className="reveal-up delay-2 rounded-[1.2rem] border border-amber-200 bg-[linear-gradient(135deg,#fffbeb_0%,#fefce8_100%)] p-4 shadow-[0_16px_28px_rgba(245,158,11,0.12)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-700">
            Edit Locked
          </p>
          <h2 className="mt-1.5 text-lg font-bold text-amber-950">
            College not linked to this email
          </h2>
          <p className="mt-1.5 text-[13px] leading-5 text-amber-800">
            Admin college add pannumbodhu, unga login/register email-oda same email set pannina udane
            inga `Edit Your College` option unlock aagum.
          </p>
        </article>
      ) : null}

      {hasExistingCollege ? (
        <article
          className={`reveal-up delay-2 rounded-[1.2rem] border p-4 shadow-[0_16px_28px_rgba(15,76,129,0.08)] ${
            isEditCooldownActive
              ? "border-amber-200 bg-[linear-gradient(135deg,#fffbeb_0%,#fef3c7_100%)]"
              : "border-sky-200 bg-[linear-gradient(135deg,#f8fbff_0%,#eff6ff_100%)]"
          }`}
        >
          <p
            className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${
              isEditCooldownActive ? "text-amber-700" : "text-sky-700"
            }`}
          >
            Edit Disclaimer
          </p>
          <p
            className={`mt-1.5 text-sm font-semibold ${
              isEditCooldownActive ? "text-amber-950" : "text-slate-900"
            }`}
          >
            One dashboard edit unlocks the next edit only after 10 days.
          </p>
          <p
            className={`mt-1.5 text-[13px] leading-5 ${
              isEditCooldownActive ? "text-amber-800" : "text-slate-600"
            }`}
          >
            {isEditCooldownActive
              ? `You edited this on ${formattedLastDashboardEditAt || "recently"}. The next edit will unlock on ${formattedNextDashboardEditAt || "after 10 days"}.`
              : "Once you save college details, the next dashboard edit will be available after a 10-day cooldown."}
          </p>
        </article>
      ) : null}

      <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
        {statCards.map((item, index) => {
          const Icon = item.icon;
          return (
            <article key={item.label} className={`luxe-card reveal-up delay-${Math.min(index + 1, 4)} rounded-[1.1rem] p-3.5 sm:p-4`}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  {item.label}
                </p>
                <span className="rounded-full bg-[rgba(15,76,129,0.08)] p-1.5 text-[color:var(--brand-primary)]">
                  <Icon className="size-4" />
                </span>
              </div>
              <p className="mt-2.5 text-lg font-extrabold capitalize text-slate-900 sm:text-[1.35rem]">
                {loading ? "--" : item.value}
              </p>
            </article>
          );
        })}
      </div>

      {portalState.college ? (
        <article className="luxe-card reveal-up delay-2 rounded-[1.2rem] p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--brand-primary)]">
                College Details
              </p>
              <h2 className="mt-1.5 text-lg font-bold text-slate-900 sm:text-xl">
                {portalState.college.name || "Your College"}
              </h2>
              <div className="mt-2 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                <p>University: {portalState.college.university || "-"}</p>
                <p>State: {portalState.college.state || "-"}</p>
                <p>District: {portalState.college.district || "-"}</p>
                <p>Ranking: {String(portalState.college.ranking || "-")}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                if (!hasExistingCollege || isEditCooldownActive) return;
                setShowCollegeForm(true);
                setTimeout(() => {
                  document.getElementById("approved-college-form")?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }, 50);
              }}
              disabled={!hasExistingCollege || isEditCooldownActive}
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Edit Your College
              <ArrowRight className="size-4" />
            </button>
          </div>
          {isEditCooldownActive ? (
            <p className="mt-3 text-xs font-medium text-amber-700">
              Next edit unlock date: {formattedNextDashboardEditAt || "-"}
            </p>
          ) : null}
        </article>
      ) : null}

      {hasExistingCollege && showCollegeForm ? (
        <div id="approved-college-form">
          <CollegeDashboardAddCollegeForm
            token={token}
            currentUser={currentUser}
            college={portalState.college as Record<string, unknown> | null}
            courses={portalState.courses}
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
