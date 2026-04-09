"use client";

import { useEffect, useState } from "react";
import { Send, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { CollegePortalShell } from "@/components/college-portal-shell";
import {
  clearAuth,
  readAuthToken,
  readCurrentUser,
  type SafeAuthUser,
} from "@/lib/auth-storage";
import { request, withAuth } from "@/lib/api";
import { useStatusToast } from "@/lib/toast";

type UserRequest = {
  _id: string;
  actionType?: "create" | "update" | "delete";
  status?: "pending" | "approved" | "rejected";
  createdAt?: string;
  updatedAt?: string;
  approvalMessage?: string;
  verificationStatus?: "pending" | "verified" | "not_required";
  verificationMailSentAt?: string;
  formAccessUsedAt?: string;
  payload?: Record<string, unknown> | null;
};

type CollegeProfile = {
  _id?: string;
  name?: string;
  university?: string;
  state?: string;
  district?: string;
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

export default function CollegeRequestsPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [currentUser, setCurrentUser] = useState<SafeAuthUser | null>(null);
  const [collegeProfile, setCollegeProfile] = useState<CollegeProfile | null>(null);
  const [collegeRequests, setCollegeRequests] = useState<UserRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<null | "college">(null);
  const [status, setStatus] = useState<{ type: "error" | "success"; text: string } | null>(null);
  useStatusToast(status);
  const [collegeForm, setCollegeForm] = useState({
    actionType: "create",
    entityName: "",
    university: "",
    state: "",
    district: "",
    description: "",
  });

  useEffect(() => {
    const storedToken = readAuthToken();
    const storedUser = readCurrentUser();

    if (!storedToken || !storedUser) {
      router.replace("/login?type=college&redirect=/college/requests");
      return;
    }
    if (storedUser.role !== "college") {
      router.replace("/account");
      return;
    }

    setToken(storedToken);
    setCurrentUser(storedUser);
    setCollegeForm((previous) => ({
      ...previous,
      entityName: storedUser.name ? `${storedUser.name} College` : "College Request",
    }));

    const loadData = async () => {
      try {
        setLoading(true);
        const headers = withAuth(storedToken);
        const [, myCollegeData, collegeData] = await Promise.all([
          request("/api/users/college-access-request", headers).catch(() => ({ request: null })),
          request("/api/users/my-college", headers).catch(() => ({ college: null })),
          request("/api/users/college-add-requests", headers).catch(() => ({ requests: [] })),
        ]);
        setCollegeProfile((myCollegeData.college as CollegeProfile | null) || null);
        setCollegeRequests((collegeData.requests as UserRequest[]) || []);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to load requests";
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

    loadData();
  }, [router]);

  useEffect(() => {
    if (!collegeProfile?._id) return;
    setCollegeForm((previous) => ({
      ...previous,
      actionType: "update",
      entityName: collegeProfile.name || previous.entityName,
      university: collegeProfile.university || previous.university,
      state: collegeProfile.state || previous.state,
      district: collegeProfile.district || previous.district,
    }));
  }, [collegeProfile]);

  const refreshLists = async () => {
    if (!token) return;
    const headers = withAuth(token);
    const [myCollegeData, collegeData] = await Promise.all([
      request("/api/users/my-college", headers).catch(() => ({ college: null })),
      request("/api/users/college-add-requests", headers).catch(() => ({ requests: [] })),
    ]);
    setCollegeProfile((myCollegeData.college as CollegeProfile | null) || null);
    setCollegeRequests((collegeData.requests as UserRequest[]) || []);
  };

  const submitCollegeRequest = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;
    const normalizedActionType = "update" as const;
    if (!collegeForm.entityName.trim() && normalizedActionType !== "delete") {
      setStatus({ type: "error", text: "College name is required." });
      return;
    }
    if (!collegeForm.description.trim()) {
      setStatus({ type: "error", text: "Description is required." });
      return;
    }

    try {
      setSubmitting("college");
      const data = await request(
        "/api/users/college-add-requests",
        withAuth(token, {
          method: "POST",
          body: JSON.stringify({
            actionType: normalizedActionType,
            entityName: collegeForm.entityName,
            targetCollegeId: normalizedActionType === "update" ? collegeProfile?._id || undefined : undefined,
            payload: {
              name: collegeForm.entityName,
              university: collegeForm.university,
              state: collegeForm.state,
              district: collegeForm.district,
              description: collegeForm.description,
            },
          }),
        }),
      );
      setStatus({ type: "success", text: data.message || "College request submitted." });
      setCollegeForm({
        actionType: collegeProfile?._id ? "update" : "create",
        entityName: "",
        university: "",
        state: "",
        district: "",
        description: "",
      });
      await refreshLists();
    } catch (error) {
      setStatus({
        type: "error",
        text: error instanceof Error ? error.message : "Unable to submit college request.",
      });
    } finally {
      setSubmitting(null);
    }
  };

  const deleteRequest = async (kind: "college", id: string) => {
    if (!token) return;
    try {
      const path = `/api/users/college-add-requests/${id}`;
      const data = await request(
        path,
        withAuth(token, {
          method: "DELETE",
        }),
      );
      setStatus({ type: "success", text: data.message || "Request deleted." });
      await refreshLists();
    } catch (error) {
      setStatus({
        type: "error",
        text: error instanceof Error ? error.message : "Unable to delete request.",
      });
    }
  };

  const statusTone = (value?: string) =>
    value === "approved"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : value === "rejected"
        ? "border-rose-200 bg-rose-50 text-rose-700"
        : "border-amber-200 bg-amber-50 text-amber-700";

  const requestStageLabel = (item: UserRequest) => {
    if (item.formAccessUsedAt) {
      return "used";
    }
    if (
      item.status === "approved" &&
      (item.verificationStatus === "verified" || item.verificationStatus === "not_required")
    ) {
      return "verified";
    }
    if (item.status === "approved" && item.verificationStatus === "pending") {
      return "mail confirmation";
    }
    return item.status || "pending";
  };

  const mergedRequests = collegeRequests.map((item) => ({ ...item, kind: "college" as const })).slice(0, 8);
  const canEditExistingCollege = Boolean(collegeProfile?._id);
  const editRequestTypeLabel = "Edit Our College";

  return (
    <CollegePortalShell
      title="Request Center"
      subtitle="Track your access approval and send only edit requests for the college linked to your login email."
      currentUser={currentUser}
    >
      <div className="grid gap-4 xl:grid-cols-1">
        <section>
          <article className="luxe-card p-4">
            <h3 className="text-lg font-bold text-[color:var(--text-dark)]">Submit college request</h3>
            <div className="mt-3 rounded-[1rem] border border-[rgba(15,76,129,0.1)] bg-[rgba(15,76,129,0.03)] px-4 py-3">
              <p className="text-sm font-semibold text-[color:var(--text-dark)]">{editRequestTypeLabel}</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Admin added your college with the same mail as this login account-na, inga irundhu edit request anuppi approval vandha apram update pannalaam.
              </p>
            </div>
            {!canEditExistingCollege ? (
              <p className="mt-2 text-xs text-amber-700">
                Admin add pannina college-ku same email match aana backend auto detect pannum. Inga form fill panni request anuppalaam; refresh pannina apram linked college details visible aagum.
              </p>
            ) : null}
            <form onSubmit={submitCollegeRequest} className="mt-3 space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">Email</label>
                  <input value={currentUser?.email || ""} readOnly className="w-full rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-[rgba(15,76,129,0.04)] px-4 py-3 text-sm outline-none" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">Request Type</label>
                  <input value={editRequestTypeLabel} readOnly className="w-full rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-[rgba(15,76,129,0.04)] px-4 py-3 text-sm outline-none" />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  value={collegeForm.entityName}
                  onChange={(e) => setCollegeForm((p) => ({ ...p, entityName: e.target.value }))}
                  placeholder="Existing college name"
                  className="w-full rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-white px-4 py-3 text-sm outline-none"
                />
                <input
                  value={collegeForm.university}
                  onChange={(e) => setCollegeForm((p) => ({ ...p, university: e.target.value }))}
                  placeholder="University"
                  className="w-full rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-white px-4 py-3 text-sm outline-none"
                />
              </div>
              <textarea
                rows={4}
                value={collegeForm.description}
                onChange={(e) => setCollegeForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Explain what you want to edit in your college profile"
                className="w-full rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-white px-4 py-3 text-sm outline-none"
              />
              <button
                type="submit"
                disabled={submitting === "college"}
                className="inline-flex w-full max-w-[320px] items-center justify-center gap-2 rounded-full bg-[color:var(--brand-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--brand-primary-soft)] disabled:opacity-60 sm:max-w-[360px] sm:self-start"
              >
                <Send className="size-4" />
                {submitting === "college" ? "Submitting..." : "Submit Edit Request"}
              </button>
            </form>
          </article>
        </section>

        <section className="xl:col-span-2">
          <article className="luxe-card p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-bold text-[color:var(--text-dark)]">Recent requests</h3>
              <span className="rounded-full border border-[rgba(15,76,129,0.08)] bg-[rgba(15,76,129,0.04)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--brand-primary)]">
                {loading ? "--" : collegeRequests.length} Total
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {mergedRequests.map((item) => (
                <article key={`${item.kind}-${item._id}`} className="rounded-[1.2rem] border border-[rgba(15,76,129,0.08)] bg-[rgba(15,76,129,0.03)] p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-bold capitalize text-[color:var(--text-dark)]">
                        {item.kind} {item.actionType} request
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {String(item.payload?.name || item.payload?.course || "No entity name")}
                      </p>
                      {item.kind === "college" && item.approvalMessage ? (
                        <p className="mt-2 text-xs leading-5 text-slate-500">{item.approvalMessage}</p>
                      ) : null}
                    </div>
                    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${item.formAccessUsedAt ? "border-slate-200 bg-slate-50 text-slate-600" : statusTone(item.status === "approved" && item.verificationStatus === "pending" ? "pending" : item.status)}`}>
                      {requestStageLabel(item)}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-xs text-slate-500">
                      <p>Submitted: {formatRequestDateTime(item.createdAt || item.updatedAt)}</p>
                      {item.formAccessUsedAt ? (
                        <p className="mt-1">Form used on: {formatRequestDateTime(item.formAccessUsedAt)}</p>
                      ) : null}
                    </div>
                    {item.status === "pending" ? (
                      <button type="button" onClick={() => deleteRequest(item.kind, item._id)} className="inline-flex items-center gap-2 text-sm font-semibold text-rose-600 transition hover:text-rose-700">
                        <Trash2 className="size-4" />
                        Delete
                      </button>
                    ) : null}
                  </div>
                </article>
              ))}
              {collegeRequests.length === 0 ? (
                <div className="rounded-[1.2rem] border border-dashed border-[rgba(15,76,129,0.14)] bg-white px-4 py-8 text-center text-sm text-[color:var(--text-muted)]">
                  No requests submitted yet.
                </div>
              ) : null}
            </div>
          </article>
        </section>
      </div>
    </CollegePortalShell>
  );
}

