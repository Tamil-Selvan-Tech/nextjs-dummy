"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  Image as ImageIcon,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AdminPortalShell } from "@/components/admin-portal-shell";
import {
  clearAuth,
  readAuthToken,
  readCurrentUser,
  type SafeAuthUser,
} from "@/lib/auth-storage";
import { request, withAuth } from "@/lib/api";
import { useStatusToast } from "@/lib/toast";

type AdminUser = SafeAuthUser & {
  isSuperAdmin?: boolean;
  permissions?: string[];
};

type CollegeRequestDetail = {
  _id: string;
  requesterName?: string;
  requesterEmail?: string;
  actionType?: string;
  status?: string;
  updatedAt?: string;
  payload?: Record<string, unknown> & {
    name?: string;
    university?: string;
    district?: string;
    state?: string;
    description?: string;
    overview?: string;
    admissionProcess?: string;
    scholarships?: string;
    logo?: string;
    image?: string;
    images?: string[] | string;
    feesStructure?: unknown;
    facilities?: unknown;
    quotas?: unknown;
  };
};

export default function RequestedCollegeAdminPage() {
  const params = useParams<{ requestId: string }>();
  const router = useRouter();
  const [token, setToken] = useState("");
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [requestItem, setRequestItem] = useState<CollegeRequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ type: "error" | "success"; text: string } | null>(null);
  useStatusToast(status);

  useEffect(() => {
    const storedToken = readAuthToken();
    const storedUser = readCurrentUser() as AdminUser | null;

    if (!storedToken || !storedUser) {
      router.replace("/login?type=admin&redirect=/admin");
      return;
    }
    if (storedUser.role !== "admin") {
      router.replace("/");
      return;
    }

    setToken(storedToken);
    setCurrentUser(storedUser);

    const loadDetail = async () => {
      try {
        setLoading(true);
        const data = await request(
          `/api/admin/college-add-requests/${params.requestId}`,
          withAuth(storedToken),
        );
        setRequestItem((data?.request as CollegeRequestDetail) || null);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to load request";
        setStatus({ type: "error", text: message });
        if (message.toLowerCase().includes("not authorized")) {
          clearAuth();
          router.replace("/login?type=admin&redirect=/admin");
        }
      } finally {
        setLoading(false);
      }
    };

    void loadDetail();
  }, [params.requestId, router]);

  const payload = requestItem?.payload || {};

  const topMeta = [
    ["Action", requestItem?.actionType || "-"],
    ["Status", requestItem?.status || "-"],
    ["Requester", requestItem?.requesterName || "-"],
    ["Requester Email", requestItem?.requesterEmail || "-"],
  ];

  const runAction = async (mode: "approve" | "reject") => {
    if (!token || !requestItem?._id || busy) return;
    try {
      setBusy(true);
      if (mode === "approve") {
        const data = await request(
          `/api/admin/college-add-requests/${requestItem._id}/status`,
          withAuth(token, {
            method: "PUT",
            body: JSON.stringify({ status: "approved" }),
          }),
        );
        setStatus({ type: "success", text: data?.message || "College request approved" });
      } else {
        const data = await request(
          `/api/admin/college-add-requests/${requestItem._id}`,
          withAuth(token, { method: "DELETE" }),
        );
        setStatus({ type: "success", text: data?.message || "College request rejected" });
      }
      window.setTimeout(() => router.push("/admin"), 800);
    } catch (error) {
      setStatus({
        type: "error",
        text: error instanceof Error ? error.message : "Unable to update request",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminPortalShell
      title="College Request Review"
      subtitle="Inspect the submitted college profile, verify its media and content, and approve or reject it with the backend workflow."
      currentUser={currentUser}
      navItems={[{ id: "detail", label: "Request Detail", icon: ImageIcon }]}
      activeTab="detail"
      onChangeTab={() => undefined}
      actions={
        <Link href="/admin" className="inline-flex items-center gap-2 rounded-full border border-[rgba(15,76,129,0.12)] bg-white px-4 py-2.5 text-sm font-semibold text-[color:var(--brand-primary)] transition hover:bg-[rgba(15,76,129,0.04)]">
          <ArrowLeft className="size-4" />
          Back to Admin
        </Link>
      }
    >
      {loading ? (
        <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="h-80 rounded-[1.8rem] border border-[rgba(15,76,129,0.08)] bg-[rgba(15,76,129,0.05)]" />
          <div className="h-80 rounded-[1.8rem] border border-[rgba(15,76,129,0.08)] bg-[rgba(15,76,129,0.05)]" />
        </div>
      ) : !requestItem ? (
        <article className="luxe-card p-6">
          <h2 className="text-xl font-bold text-[color:var(--text-dark)]">Request not found</h2>
          <p className="mt-2 text-sm leading-7 text-[color:var(--text-muted)]">This college request could not be loaded from the backend.</p>
        </article>
      ) : (
        <div className="space-y-5">
          <article className="luxe-card p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[1.3rem] border border-[rgba(15,76,129,0.08)] bg-white">
                {requestItem.payload?.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={String(requestItem.payload.logo)} alt={String(requestItem.payload?.name || "College")} className="h-full w-full object-contain p-2" />
                ) : (
                  <ImageIcon className="size-7 text-[color:var(--brand-primary)]" />
                )}
              </div>
              <div className="min-w-0">
                <h2 className="text-2xl font-bold text-[color:var(--text-dark)]">{String(requestItem.payload?.name || "College request")}</h2>
                <p className="mt-1 text-sm text-slate-500">{String(requestItem.payload?.university || "-")}</p>
                <p className="mt-2 text-sm text-[color:var(--text-muted)]">{[requestItem.payload?.district && String(requestItem.payload.district), requestItem.payload?.state && String(requestItem.payload.state)].filter(Boolean).join(", ") || "-"}</p>
                <div className="mt-4 grid gap-1 text-sm text-slate-600">
                  {topMeta.map(([label, value]) => (
                    <p key={label}>
                      <span className="font-semibold text-[color:var(--text-dark)]">{label}:</span>{" "}
                      {String(value)}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-[1rem] border border-[rgba(15,76,129,0.08)] bg-[rgba(15,76,129,0.03)] p-4 text-sm leading-7 text-[color:var(--text-muted)]">
              {String(payload.description || payload.overview || "No description provided.")}
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              {requestItem.status !== "approved" ? (
                <>
                  <button type="button" onClick={() => void runAction("approve")} disabled={busy} className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-60">
                    <BadgeCheck className="size-4" />
                    {busy ? "Working..." : "Approve Request"}
                  </button>
                  <button type="button" onClick={() => void runAction("reject")} disabled={busy} className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:opacity-60">
                    <Trash2 className="size-4" />
                    {busy ? "Working..." : "Reject Request"}
                  </button>
                </>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700">
                  <BadgeCheck className="size-4" />
                  Approved
                </span>
              )}
            </div>
          </article>
        </div>
      )}
    </AdminPortalShell>
  );
}
