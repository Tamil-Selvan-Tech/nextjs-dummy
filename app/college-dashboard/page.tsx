"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Building2,
  MailOpen,
  ShieldCheck,
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
import { useStatusToast } from "@/lib/toast";

type AccessRequest = {
  _id?: string;
  status?: "pending" | "accepted" | "declined";
  email?: string;
  phone?: string;
  message?: string;
  createdAt?: string;
  updatedAt?: string;
};

type CollegeProfile = {
  _id?: string;
  name?: string;
  university?: string;
  state?: string;
  district?: string;
  country?: string;
  description?: string;
  overview?: string;
  infrastructure?: string;
  faculty?: string;
  admissionProcess?: string;
  scholarships?: string;
  industryPartnerships?: string;
  reviews?: string;
  courseTags?: string[] | string;
  contactPhone?: string;
  website?: string;
  locationLink?: string;
  accreditation?: string;
  ranking?: string | number;
  hasHostel?: boolean;
  facilities?: string[] | string;
  quotas?: string[] | string;
};

type CollegeRequestItem = {
  _id: string;
  status?: "pending" | "approved" | "rejected";
  actionType?: "create" | "update" | "delete";
  createdAt?: string;
  updatedAt?: string;
  approvalMessage?: string;
  verificationStatus?: "pending" | "verified" | "not_required";
  verificationMailSentAt?: string;
  verificationConfirmedAt?: string;
  formAccessUsedAt?: string;
  payload?: Record<string, unknown> | null;
};

type CollegeCourse = Record<string, unknown> & {
  _id?: string;
};

type PortalState = {
  request: AccessRequest | null;
  college: CollegeProfile | null;
  courses: CollegeCourse[];
  enquiries: Array<{ _id: string }>;
  collegeRequests: CollegeRequestItem[];
};

const getWordCount = (value = "") =>
  String(value || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

const isCollegeRequestUnlocked = (item?: CollegeRequestItem | null) =>
  Boolean(
    item &&
      !item.formAccessUsedAt &&
      item.status === "approved" &&
      (item.verificationStatus === "verified" ||
        item.verificationStatus === "not_required" ||
        item.verificationConfirmedAt),
  );

const isCollegeRequestWaitingForVerification = (item?: CollegeRequestItem | null) =>
  Boolean(item && !item.formAccessUsedAt && item.status === "approved" && !isCollegeRequestUnlocked(item));

const getCollegeRequestStateLabel = (item?: CollegeRequestItem | null) => {
  if (!item) return "waiting";
  if (item.formAccessUsedAt) return "used";
  if (isCollegeRequestUnlocked(item)) return "verified";
  if (isCollegeRequestWaitingForVerification(item)) return "mail confirmation";
  return item.status || "waiting";
};

const getCollegeRequestTone = (item?: CollegeRequestItem | null) => {
  if (!item) return "border-amber-200 bg-amber-50 text-amber-700";
  if (item.formAccessUsedAt) return "border-slate-200 bg-slate-50 text-slate-600";
  if (isCollegeRequestUnlocked(item)) return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (isCollegeRequestWaitingForVerification(item)) return "border-sky-200 bg-sky-50 text-sky-700";
  if (item.status === "rejected") return "border-rose-200 bg-rose-50 text-rose-700";
  return "border-amber-200 bg-amber-50 text-amber-700";
};

const formatRequestDateTime = (value?: string) =>
  value
    ? new Date(value).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

export default function CollegeDashboardPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [currentUser, setCurrentUser] = useState<SafeAuthUser | null>(null);
  const [portalState, setPortalState] = useState<PortalState>({
    request: null,
    college: null,
    courses: [],
    enquiries: [],
    collegeRequests: [],
  });
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [showCollegeForm, setShowCollegeForm] = useState(false);
  const [suppressCollegeFormAutoOpen, setSuppressCollegeFormAutoOpen] = useState(false);
  useStatusToast(status);
  const [requestForm, setRequestForm] = useState({
    email: "",
    phone: "",
    message: "",
  });
  const wordCount = getWordCount(requestForm.message);
  const canSubmitRequest = Boolean(requestForm.message.trim()) && wordCount <= 50;

  const loadDashboard = useCallback(
    async (authToken: string) => {
      try {
        setLoading(true);
        const headers = withAuth(authToken);
        const [requestData, collegeData, courseData, enquiryData, collegeRequestData] =
          await Promise.all([
            request("/api/users/college-access-request", headers).catch(() => ({ request: null })),
            request("/api/users/my-college", headers).catch(() => ({ college: null })),
            request("/api/users/my-courses", headers).catch(() => ({ courses: [] })),
            request("/api/users/college-enquiries", headers).catch(() => ({ enquiries: [] })),
            request("/api/users/college-add-requests", headers).catch(() => ({ requests: [] })),
          ]);

        setPortalState({
          request: (requestData.request as AccessRequest | null) || null,
          college: (collegeData.college as CollegeProfile | null) || null,
          courses: (courseData.courses as CollegeCourse[]) || [],
          enquiries: (enquiryData.enquiries as Array<{ _id: string }>) || [],
          collegeRequests: (collegeRequestData.requests as CollegeRequestItem[]) || [],
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
    setRequestForm({
      email: storedUser.email || "",
      phone: storedUser.phone || "",
      message: "",
    });

    void loadDashboard(storedToken);
  }, [loadDashboard, router]);

  const statCards = useMemo(
    () => [
      {
        label: "Access Status",
        value: portalState.request?.status || "Not started",
        icon: ShieldCheck,
      },
      {
        label: "Enquiries",
        value: String(portalState.enquiries.length),
        icon: MailOpen,
      },
      {
        label: "College Requests",
        value: String(portalState.collegeRequests.length),
        icon: Building2,
      },
    ],
    [portalState],
  );

  const submitAccessRequest = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;

    if (!requestForm.message.trim()) {
      setStatus({ type: "error", text: "Message is required." });
      return;
    }
    if (wordCount > 50) {
      setStatus({ type: "error", text: "Message allows only 50 words." });
      return;
    }

    try {
      const data = await request(
        "/api/users/college-access-request",
        withAuth(token, {
          method: "POST",
          body: JSON.stringify({
            requesterName: currentUser?.name || "College",
            email: requestForm.email,
            phone: requestForm.phone,
            message: requestForm.message,
          }),
        }),
      );
      setPortalState((previous) => ({
        ...previous,
        request: (data.request as AccessRequest | null) || previous.request,
      }));
      setStatus({ type: "success", text: data.message || "College access request submitted." });
      setRequestModalOpen(false);
    } catch (error) {
      setStatus({
        type: "error",
        text: error instanceof Error ? error.message : "Unable to submit request.",
      });
    }
  };

  const hasExistingCollege = Boolean(portalState.college?._id);
  const latestUpdateCollegeRequest = portalState.collegeRequests.find((item) => item.actionType === "update");
  const unlockedCollegeRequest =
    portalState.collegeRequests.find(
      (item) => item.actionType === "update" && isCollegeRequestUnlocked(item),
    ) || null;
  const pendingCollegeVerificationRequest =
    portalState.collegeRequests.find(
      (item) => item.actionType === "update" && isCollegeRequestWaitingForVerification(item),
    ) || null;
  const hydratedCollege = (portalState.college ||
    (unlockedCollegeRequest?.payload as CollegeProfile | null) ||
    null) as CollegeProfile | null;
  const canOpenCollegeForm = Boolean(unlockedCollegeRequest);
  const unlockedCollegeActionType = unlockedCollegeRequest?.actionType || "";
  const resolvedCollegeActionType = unlockedCollegeRequest?.actionType || (hydratedCollege ? "update" : "create");

  useEffect(() => {
    if (!canOpenCollegeForm) {
      setShowCollegeForm(false);
      return;
    }
    if (suppressCollegeFormAutoOpen) {
      return;
    }
    if (unlockedCollegeActionType === "create" && !hydratedCollege) {
      setShowCollegeForm(true);
      return;
    }
    setShowCollegeForm(false);
  }, [canOpenCollegeForm, hydratedCollege, suppressCollegeFormAutoOpen, unlockedCollegeActionType]);

  return (
    <CollegePortalShell
      title="College Dashboard"
      subtitle="Track access, profile status, requests, and student enquiries in one place."
      currentUser={currentUser}
      actions={
        <>
        </>
      }
    >
      {unlockedCollegeRequest || pendingCollegeVerificationRequest ? (
        <div className="grid gap-3">
          {unlockedCollegeRequest ? (
            <article className="reveal-up delay-2 rounded-[1.2rem] border border-emerald-200 bg-[linear-gradient(135deg,#ecfdf5_0%,#f0fdf4_100%)] p-4 shadow-[0_16px_28px_rgba(16,185,129,0.12)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
                {unlockedCollegeRequest.actionType === "update" ? "Edit Request Verified" : "Add Request Verified"}
              </p>
              <h2 className="mt-1.5 text-lg font-bold text-emerald-950">
                {unlockedCollegeRequest.actionType === "update" ? "Edit College form ready" : "Add College form ready"}
              </h2>
              <p className="mt-1.5 text-[13px] leading-5 text-emerald-800">
                {unlockedCollegeRequest.approvalMessage ||
                  (unlockedCollegeRequest.actionType === "update"
                    ? "Admin approval and email confirmation are complete. You can now edit and save the college details."
                    : "Admin approval and email confirmation are complete. You can now add and save the college details.")}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSuppressCollegeFormAutoOpen(false);
                  setShowCollegeForm(true);
                  setTimeout(() => {
                    document.getElementById("approved-college-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }, 50);
                }}
                className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500"
              >
                Open College Form
                <ArrowRight className="size-4" />
              </button>
            </article>
          ) : null}

          {pendingCollegeVerificationRequest ? (
            <article className="reveal-up delay-2 rounded-[1.2rem] border border-sky-200 bg-[linear-gradient(135deg,#eff6ff_0%,#f0f9ff_100%)] p-4 shadow-[0_16px_28px_rgba(56,189,248,0.12)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-700">
                Approval Mail Sent
              </p>
              <h2 className="mt-1.5 text-lg font-bold text-sky-950">
                Confirm email to unlock the form
              </h2>
              <p className="mt-1.5 text-[13px] leading-5 text-sky-800">
                {pendingCollegeVerificationRequest.approvalMessage ||
                  "Admin approved your request. Check your mail, confirm the link, and then the college form will open here."}
              </p>
              {pendingCollegeVerificationRequest.verificationMailSentAt ? (
                <p className="mt-3 text-[12px] font-medium text-sky-700">
                  Verification mail sent on{" "}
                  {new Date(pendingCollegeVerificationRequest.verificationMailSentAt).toLocaleString()}
                </p>
              ) : null}
            </article>
          ) : null}

        </div>
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

      <div className="grid gap-3">
        <section className="space-y-3">
          <article className="luxe-card reveal-up delay-3 rounded-[1.2rem] p-3.5 sm:p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--brand-support)]">
              Approval Queue
            </p>
            <h2 className="mt-1.5 text-lg font-bold text-slate-900 sm:text-xl">
              Request Unlock Status
            </h2>
            <div className="mt-3 space-y-3">
              <div className="rounded-[1rem] border border-[rgba(15,76,129,0.08)] bg-[rgba(15,76,129,0.03)] p-3.5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">Edit Our College Request</p>
                  <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize ${getCollegeRequestTone(latestUpdateCollegeRequest)}`}>
                    {getCollegeRequestStateLabel(latestUpdateCollegeRequest)}
                  </span>
                </div>
                <p className="mt-2 text-[13px] leading-5 text-slate-600">
                  {hasExistingCollege
                    ? "Admin added your college with this same email, so you can send an edit request and update it after approval and email confirmation."
                    : "Your college will appear here only after admin adds it with the same email as your college login."}
                </p>
                {latestUpdateCollegeRequest?.createdAt || latestUpdateCollegeRequest?.updatedAt ? (
                  <p className="mt-2 text-[12px] text-slate-500">
                    Submitted: {formatRequestDateTime(latestUpdateCollegeRequest?.createdAt || latestUpdateCollegeRequest?.updatedAt)}
                  </p>
                ) : null}
              </div>
            </div>
          </article>
        </section>
      </div>

      {hydratedCollege ? (
        <article className="luxe-card reveal-up delay-2 rounded-[1.2rem] p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--brand-primary)]">
                College Details
              </p>
              <h2 className="mt-1.5 text-lg font-bold text-slate-900 sm:text-xl">
                {hydratedCollege.name || "Your College"}
              </h2>
              <div className="mt-2 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                <p>University: {hydratedCollege.university || "-"}</p>
                <p>State: {hydratedCollege.state || "-"}</p>
                <p>District: {hydratedCollege.district || "-"}</p>
                <p>Ranking: {String(hydratedCollege.ranking || "-")}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                if (!unlockedCollegeRequest || unlockedCollegeRequest.actionType !== "update") {
                  return;
                }
                setSuppressCollegeFormAutoOpen(false);
                setShowCollegeForm(true);
                setTimeout(() => {
                  document.getElementById("approved-college-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
                }, 50);
              }}
              disabled={!unlockedCollegeRequest || unlockedCollegeRequest.actionType !== "update"}
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              {unlockedCollegeRequest?.actionType === "update" ? "Edit College Details" : "Send New Edit Request First"}
              <ArrowRight className="size-4" />
            </button>
          </div>
        </article>
      ) : null}

      {canOpenCollegeForm && showCollegeForm ? (
        <div id="approved-college-form">
          <CollegeDashboardAddCollegeForm
            token={token}
            currentUser={currentUser}
            college={hydratedCollege as Record<string, unknown> | null}
            courses={portalState.courses}
            requestActionType={resolvedCollegeActionType}
            approvalMessage={unlockedCollegeRequest?.approvalMessage}
            onSaved={async () => {
              await loadDashboard(token);
              setSuppressCollegeFormAutoOpen(true);
              setShowCollegeForm(false);
              setStatus({
                type: "success",
                text:
                  resolvedCollegeActionType === "create"
                    ? "Your college was created successfully."
                    : "College details were updated successfully.",
              });
            }}
          />
        </div>
      ) : null}

      {requestModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-[2rem] border border-[rgba(15,76,129,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,251,255,0.96))] p-5 shadow-[0_30px_80px_rgba(4,12,26,0.18)] sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--brand-primary)]">
                  College Access
                </p>
                <h3 className="mt-2 text-xl font-bold text-[color:var(--text-dark)]">
                  Send access request
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setRequestModalOpen(false)}
                className="rounded-full border border-[rgba(15,76,129,0.12)] px-3 py-1.5 text-xs font-semibold text-[color:var(--text-dark)] transition hover:bg-[rgba(15,76,129,0.04)]"
              >
                Close
              </button>
            </div>

            <form onSubmit={submitAccessRequest} className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                <div className="min-w-0">
                  <label className="mb-1.5 block text-[12px] font-semibold text-[color:var(--text-dark)] sm:mb-2 sm:text-sm">
                    Email
                  </label>
                  <input
                    value={requestForm.email}
                    readOnly
                    className="w-full min-w-0 rounded-[0.9rem] border border-[rgba(15,76,129,0.1)] bg-[rgba(15,76,129,0.04)] px-3 py-2.5 text-[12px] text-slate-700 outline-none sm:rounded-[1rem] sm:px-4 sm:py-3 sm:text-sm"
                  />
                </div>
                <div className="min-w-0">
                  <label className="mb-1.5 block text-[12px] font-semibold text-[color:var(--text-dark)] sm:mb-2 sm:text-sm">
                    Phone
                  </label>
                  <input
                    value={requestForm.phone}
                    readOnly
                    className="w-full min-w-0 rounded-[0.9rem] border border-[rgba(15,76,129,0.1)] bg-[rgba(15,76,129,0.04)] px-3 py-2.5 text-[12px] text-slate-700 outline-none sm:rounded-[1rem] sm:px-4 sm:py-3 sm:text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">
                  Why do you need college access?
                </label>
                <textarea
                  rows={5}
                  value={requestForm.message}
                  onChange={(event) =>
                    setRequestForm((previous) => ({ ...previous, message: event.target.value }))
                  }
                  className="w-full rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-white px-4 py-3 text-sm text-[color:var(--text-dark)] outline-none transition focus:border-[color:var(--brand-primary-soft)] focus:shadow-[0_0_0_4px_rgba(60,126,182,0.12)]"
                  placeholder="Explain your ownership or management responsibility for the college profile."
                />
                <p className={`mt-2 text-xs ${wordCount > 50 ? "text-red-600" : "text-slate-500"}`}>
                  {wordCount}/50 words
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={!canSubmitRequest}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[color:var(--brand-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--brand-primary-soft)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Submit Request
                  <ArrowRight className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setRequestModalOpen(false)}
                  className="rounded-full border border-[rgba(15,76,129,0.12)] px-5 py-3 text-sm font-semibold text-[color:var(--text-dark)] transition hover:bg-[rgba(15,76,129,0.04)]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </CollegePortalShell>
  );
}

