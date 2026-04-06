"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Building2,
  CirclePlus,
  Clock3,
  FileStack,
  MailOpen,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CollegePortalShell } from "@/components/college-portal-shell";
import {
  clearAuth,
  readAuthToken,
  readCurrentUser,
  type SafeAuthUser,
} from "@/lib/auth-storage";
import { request, withAuth } from "@/lib/api";

type AccessRequest = {
  _id?: string;
  status?: "pending" | "accepted" | "declined";
  email?: string;
  phone?: string;
  message?: string;
  updatedAt?: string;
};

type CollegeProfile = {
  _id?: string;
  name?: string;
  university?: string;
  state?: string;
  district?: string;
};

type PortalState = {
  request: AccessRequest | null;
  college: CollegeProfile | null;
  enquiries: Array<{ _id: string }>;
  collegeRequests: Array<{ _id: string }>;
  courseRequests: Array<{ _id: string }>;
};

const getWordCount = (value = "") =>
  String(value || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

export default function CollegeDashboardPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [currentUser, setCurrentUser] = useState<SafeAuthUser | null>(null);
  const [portalState, setPortalState] = useState<PortalState>({
    request: null,
    college: null,
    enquiries: [],
    collegeRequests: [],
    courseRequests: [],
  });
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requestForm, setRequestForm] = useState({
    email: "",
    phone: "",
    message: "",
  });
  const wordCount = getWordCount(requestForm.message);
  const canSubmitRequest = Boolean(requestForm.message.trim()) && wordCount <= 50;

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

    const loadDashboard = async () => {
      try {
        setLoading(true);
        const headers = withAuth(storedToken);
        const [requestData, collegeData, enquiryData, collegeRequestData, courseRequestData] =
          await Promise.all([
            request("/api/users/college-access-request", headers).catch(() => ({ request: null })),
            request("/api/users/my-college", headers).catch(() => ({ college: null })),
            request("/api/users/college-enquiries", headers).catch(() => ({ enquiries: [] })),
            request("/api/users/college-add-requests", headers).catch(() => ({ requests: [] })),
            request("/api/users/course-add-requests", headers).catch(() => ({ requests: [] })),
          ]);

        setPortalState({
          request: (requestData.request as AccessRequest | null) || null,
          college: (collegeData.college as CollegeProfile | null) || null,
          enquiries: (enquiryData.enquiries as Array<{ _id: string }>) || [],
          collegeRequests: (collegeRequestData.requests as Array<{ _id: string }>) || [],
          courseRequests: (courseRequestData.requests as Array<{ _id: string }>) || [],
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to load dashboard";
        setStatus({ type: "error", text: message });
        if (message.toLowerCase().includes("not authorized")) {
          clearAuth();
          router.replace("/login?type=college");
          return;
        }
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [router]);

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
      {
        label: "Course Requests",
        value: String(portalState.courseRequests.length),
        icon: FileStack,
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

  const accessStatusTone =
    portalState.request?.status === "accepted"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : portalState.request?.status === "declined"
        ? "border-rose-200 bg-rose-50 text-rose-700"
        : "border-amber-200 bg-amber-50 text-amber-700";

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
      {status ? (
        <div
          className={`reveal-up delay-2 rounded-[1.1rem] border px-3.5 py-2.5 text-[13px] font-medium ${
            status.type === "error"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {status.text}
        </div>
      ) : null}

      <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
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

      <div className="grid gap-3 xl:grid-cols-[1.02fr_0.82fr]">
        <section className="luxe-card reveal-up delay-2 rounded-[1.2rem] p-3.5 sm:p-4">
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--brand-primary)]">
                Access Control
              </p>
              <h2 className="mt-1.5 text-lg font-bold text-slate-900 sm:text-xl">
                College Access Approval
              </h2>
              <p className="mt-1.5 max-w-lg text-[13px] leading-5 text-slate-600">
                Once access is approved, you can manage your profile, submit requests, and respond to enquiries.
              </p>
            </div>
            {portalState.request?.status !== "accepted" ? (
              <button
                type="button"
                onClick={() => setRequestModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[color:var(--brand-accent)] px-3.5 py-2 text-[13px] font-semibold text-white transition hover:bg-[color:var(--brand-accent-deep)]"
              >
                <CirclePlus className="size-4" />
                Request Access
              </button>
            ) : null}
          </div>

          <div className="mt-3 rounded-[1.1rem] border border-[rgba(15,76,129,0.08)] bg-[rgba(15,76,129,0.03)] p-3.5 sm:p-4">
            {portalState.request ? (
              <>
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-sm font-bold text-slate-900">Latest Request</h3>
                  <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize ${accessStatusTone}`}>
                    {portalState.request.status}
                  </span>
                </div>
                <p className="mt-2.5 text-[13px] leading-5 text-slate-600">
                  {portalState.request.message || "No request message available."}
                </p>
                <div className="mt-3 grid gap-2 text-[13px] text-slate-600 sm:grid-cols-2">
                  <p>Email: {portalState.request.email || "-"}</p>
                  <p>Phone: {portalState.request.phone || "-"}</p>
                </div>
                {portalState.request.updatedAt ? (
                  <p className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] text-slate-500">
                    <Clock3 className="size-3.5" />
                    Updated on {new Date(portalState.request.updatedAt).toLocaleDateString()}
                  </p>
                ) : null}
              </>
            ) : (
              <div className="rounded-[1rem] border border-dashed border-[rgba(15,76,129,0.14)] bg-white px-3.5 py-5 text-center text-[13px] leading-5 text-slate-600">
                No access request has been submitted yet. Start a request to unlock college management.
              </div>
            )}
          </div>

          <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
            <Link
              href="/college/requests"
              className="flex items-center justify-between rounded-[1rem] border border-[rgba(15,76,129,0.1)] bg-white px-3.5 py-2.5 text-[13px] font-semibold text-slate-700 transition hover:bg-[rgba(15,76,129,0.04)]"
            >
              Open Request Center
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>

        <section className="space-y-3" />
      </div>

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
