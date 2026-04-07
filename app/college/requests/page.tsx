"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Send, Trash2 } from "lucide-react";
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
import { useStatusToast } from "@/lib/toast";

type AccessRequest = {
  _id?: string;
  status?: string;
  message?: string;
  updatedAt?: string;
};

type UserRequest = {
  _id: string;
  actionType?: "create" | "update" | "delete";
  status?: "pending" | "approved" | "rejected";
  updatedAt?: string;
  payload?: Record<string, unknown> | null;
};

export default function CollegeRequestsPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [currentUser, setCurrentUser] = useState<SafeAuthUser | null>(null);
  const [accessRequest, setAccessRequest] = useState<AccessRequest | null>(null);
  const [collegeRequests, setCollegeRequests] = useState<UserRequest[]>([]);
  const [courseRequests, setCourseRequests] = useState<UserRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<null | "college" | "course">(null);
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
  const [courseForm, setCourseForm] = useState({
    actionType: "create",
    entityName: "",
    collegeName: "",
    duration: "",
    degree: "",
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
    setCourseForm((previous) => ({
      ...previous,
      entityName: "Course Request",
    }));

    const loadData = async () => {
      try {
        setLoading(true);
        const headers = withAuth(storedToken);
        const [accessData, collegeData, courseData] = await Promise.all([
          request("/api/users/college-access-request", headers).catch(() => ({ request: null })),
          request("/api/users/college-add-requests", headers).catch(() => ({ requests: [] })),
          request("/api/users/course-add-requests", headers).catch(() => ({ requests: [] })),
        ]);
        setAccessRequest((accessData.request as AccessRequest | null) || null);
        setCollegeRequests((collegeData.requests as UserRequest[]) || []);
        setCourseRequests((courseData.requests as UserRequest[]) || []);
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

  const refreshLists = async () => {
    if (!token) return;
    const headers = withAuth(token);
    const [collegeData, courseData] = await Promise.all([
      request("/api/users/college-add-requests", headers).catch(() => ({ requests: [] })),
      request("/api/users/course-add-requests", headers).catch(() => ({ requests: [] })),
    ]);
    setCollegeRequests((collegeData.requests as UserRequest[]) || []);
    setCourseRequests((courseData.requests as UserRequest[]) || []);
  };

  const submitCollegeRequest = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;
    if (!collegeForm.entityName.trim() && collegeForm.actionType !== "delete") {
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
            actionType: collegeForm.actionType,
            entityName: collegeForm.entityName,
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
        actionType: "create",
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

  const submitCourseRequest = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;
    if (!courseForm.entityName.trim() && courseForm.actionType !== "delete") {
      setStatus({ type: "error", text: "Course name is required." });
      return;
    }
    if (!courseForm.description.trim()) {
      setStatus({ type: "error", text: "Description is required." });
      return;
    }

    try {
      setSubmitting("course");
      const data = await request(
        "/api/users/course-add-requests",
        withAuth(token, {
          method: "POST",
          body: JSON.stringify({
            actionType: courseForm.actionType,
            entityName: courseForm.entityName,
            payload: {
              course: courseForm.entityName,
              collegeName: courseForm.collegeName,
              duration: courseForm.duration,
              degree: courseForm.degree,
              description: courseForm.description,
            },
          }),
        }),
      );
      setStatus({ type: "success", text: data.message || "Course request submitted." });
      setCourseForm({
        actionType: "create",
        entityName: "",
        collegeName: "",
        duration: "",
        degree: "",
        description: "",
      });
      await refreshLists();
    } catch (error) {
      setStatus({
        type: "error",
        text: error instanceof Error ? error.message : "Unable to submit course request.",
      });
    } finally {
      setSubmitting(null);
    }
  };

  const deleteRequest = async (kind: "college" | "course", id: string) => {
    if (!token) return;
    try {
      const path =
        kind === "college"
          ? `/api/users/college-add-requests/${id}`
          : `/api/users/course-add-requests/${id}`;
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

  const mergedRequests = [
    ...collegeRequests.map((item) => ({ ...item, kind: "college" as const })),
    ...courseRequests.map((item) => ({ ...item, kind: "course" as const })),
  ].slice(0, 8);

  return (
    <CollegePortalShell
      title="Request Center"
      subtitle="Track your access approval and send college or course update requests without leaving the portal."
      currentUser={currentUser}
    >
      <div className="grid gap-4 xl:grid-cols-2">
        <section>
          <article className="luxe-card p-4">
            <h3 className="text-lg font-bold text-[color:var(--text-dark)]">Submit college request</h3>
            <form onSubmit={submitCollegeRequest} className="mt-3 space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">Email</label>
                  <input value={currentUser?.email || ""} readOnly className="w-full rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-[rgba(15,76,129,0.04)] px-4 py-3 text-sm outline-none" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">College Name</label>
                  <input value={collegeForm.entityName} readOnly className="w-full rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-[rgba(15,76,129,0.04)] px-4 py-3 text-sm outline-none" />
                </div>
              </div>
              <textarea
                rows={4}
                value={collegeForm.description}
                onChange={(e) => setCollegeForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Description or requested change"
                className="w-full rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-white px-4 py-3 text-sm outline-none"
              />
              <button type="submit" disabled={submitting === "college"} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[color:var(--brand-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--brand-primary-soft)] disabled:opacity-60">
                <Send className="size-4" />
                {submitting === "college" ? "Submitting..." : "Submit College Request"}
              </button>
            </form>
          </article>
        </section>

        <section>
          <article className="luxe-card p-4">
            <h3 className="text-lg font-bold text-[color:var(--text-dark)]">Submit course request</h3>
            <form onSubmit={submitCourseRequest} className="mt-3 space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">Email</label>
                  <input value={currentUser?.email || ""} readOnly className="w-full rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-[rgba(15,76,129,0.04)] px-4 py-3 text-sm outline-none" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">College Name</label>
                  <input value={collegeForm.entityName} readOnly className="w-full rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-[rgba(15,76,129,0.04)] px-4 py-3 text-sm outline-none" />
                </div>
              </div>
              <textarea
                rows={4}
                value={courseForm.description}
                onChange={(e) => setCourseForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Description or requested change"
                className="w-full rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-white px-4 py-3 text-sm outline-none"
              />
              <button type="submit" disabled={submitting === "course"} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[color:var(--brand-support)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1b978e] disabled:opacity-60">
                <Send className="size-4" />
                {submitting === "course" ? "Submitting..." : "Submit Course Request"}
              </button>
            </form>
          </article>

        </section>

        <section className="xl:col-span-2">
          <article className="luxe-card p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-bold text-[color:var(--text-dark)]">Recent requests</h3>
              <span className="rounded-full border border-[rgba(15,76,129,0.08)] bg-[rgba(15,76,129,0.04)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--brand-primary)]">
                {loading ? "--" : collegeRequests.length + courseRequests.length} Total
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
                    </div>
                    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${statusTone(item.status)}`}>
                      {item.status || "pending"}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-slate-500">
                      {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : "-"}
                    </p>
                    {item.status === "pending" ? (
                      <button type="button" onClick={() => deleteRequest(item.kind, item._id)} className="inline-flex items-center gap-2 text-sm font-semibold text-rose-600 transition hover:text-rose-700">
                        <Trash2 className="size-4" />
                        Delete
                      </button>
                    ) : null}
                  </div>
                </article>
              ))}
              {collegeRequests.length + courseRequests.length === 0 ? (
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
