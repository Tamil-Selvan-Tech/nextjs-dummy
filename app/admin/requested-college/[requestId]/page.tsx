"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  FileText,
  Image as ImageIcon,
  ListChecks,
  ScrollText,
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

const parseList = (value: unknown) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }

  return String(value || "")
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
};

const parseAmount = (value: unknown) => {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const digits = raw.replace(/[^0-9.]/g, "");
  if (!digits) return null;
  const numeric = Number(digits);
  return Number.isFinite(numeric) ? numeric : null;
};

const toCurrencyText = (value: unknown) => {
  const amount = parseAmount(value);
  return amount === null ? "-" : `Rs ${amount.toLocaleString("en-IN")}`;
};

const getFeesRows = (value: unknown) => {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const objectValue = value as Record<string, unknown>;

    if (
      "minAmount" in objectValue ||
      "maxAmount" in objectValue ||
      "min" in objectValue ||
      "max" in objectValue
    ) {
      return [
        {
          label: "Fees Range",
          minAmount: parseAmount(objectValue.minAmount ?? objectValue.min),
          maxAmount: parseAmount(objectValue.maxAmount ?? objectValue.max),
        },
      ].filter((item) => item.minAmount !== null || item.maxAmount !== null);
    }

    if (
      objectValue.overallFees &&
      typeof objectValue.overallFees === "object" &&
      !Array.isArray(objectValue.overallFees)
    ) {
      const overallFees = objectValue.overallFees as Record<string, unknown>;
      return [
        {
          label: "Fees Range",
          minAmount: parseAmount(overallFees.minAmount ?? overallFees.min),
          maxAmount: parseAmount(overallFees.maxAmount ?? overallFees.max),
        },
      ].filter((item) => item.minAmount !== null || item.maxAmount !== null);
    }

    return Object.entries(objectValue)
      .map(([label, amount]) => {
        if (amount && typeof amount === "object" && !Array.isArray(amount)) {
          const amountValue = amount as Record<string, unknown>;
          return {
            label: String(label || "").trim(),
            minAmount: parseAmount(amountValue.minAmount ?? amountValue.min),
            maxAmount: parseAmount(amountValue.maxAmount ?? amountValue.max),
          };
        }

        const parsedAmount = parseAmount(amount);
        return {
          label: String(label || "").trim(),
          minAmount: parsedAmount,
          maxAmount: parsedAmount,
        };
      })
      .filter((item) => item.label && (item.minAmount !== null || item.maxAmount !== null));
  }

  return [];
};

const toTitle = (value = "") =>
  String(value || "")
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (char) => char.toUpperCase());

const parseImages = (payload?: CollegeRequestDetail["payload"]) => {
  const images = payload?.images;
  const list = Array.isArray(images)
    ? images
    : String(images || "")
        .split(/[\n,]/)
        .map((item) => item.trim())
        .filter(Boolean);

  return [...new Set([payload?.image, ...list].filter(Boolean) as string[])];
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
  const [activeTab, setActiveTab] = useState("overview");
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
  const galleryImages = useMemo(() => parseImages(requestItem?.payload), [requestItem?.payload]);
  const facilities = useMemo(() => parseList(payload.facilities), [payload.facilities]);
  const quotas = useMemo(() => parseList(payload.quotas), [payload.quotas]);
  const feesRows = useMemo(() => getFeesRows(payload.feesStructure), [payload.feesStructure]);

  const topMeta = [
    ["Action", requestItem?.actionType || "-"],
    ["Status", requestItem?.status || "-"],
    ["Requester", requestItem?.requesterName || "-"],
    ["Requester Email", requestItem?.requesterEmail || "-"],
  ];

  const tabItems = [
    { key: "overview", label: "Overview", icon: FileText },
    { key: "facilities", label: "Facilities & Quotas", icon: ListChecks },
    { key: "admission", label: "Admission Process", icon: ScrollText },
    { key: "fees", label: "Fees Structure", icon: BadgeCheck },
    { key: "scholarships", label: "Scholarships", icon: ImageIcon },
  ];

  const fallbackFields = Object.entries(payload || {}).filter(([key, value]) => {
    if (
      [
        "overview",
        "description",
        "admissionProcess",
        "scholarships",
        "facilities",
        "quotas",
        "feesStructure",
        "image",
        "images",
        "logo",
      ].includes(key)
    ) {
      return false;
    }

    if (Array.isArray(value)) return value.length > 0;
    if (value && typeof value === "object") return Object.keys(value).length > 0;
    return value !== undefined && value !== null && String(value).trim() !== "";
  });

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
          <div className="grid gap-5 lg:grid-cols-[1.04fr_0.96fr]">
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

              <div className="mt-5 flex flex-wrap gap-3">
                <button type="button" onClick={() => void runAction("approve")} disabled={busy} className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-60">
                  <BadgeCheck className="size-4" />
                  {busy ? "Working..." : "Approve Request"}
                </button>
                <button type="button" onClick={() => void runAction("reject")} disabled={busy} className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:opacity-60">
                  <Trash2 className="size-4" />
                  {busy ? "Working..." : "Reject Request"}
                </button>
              </div>
            </article>

            <article className="luxe-card p-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-xl font-bold text-[color:var(--text-dark)]">Submitted Gallery</h3>
                <span className="text-sm font-semibold text-slate-500">{galleryImages.length} images</span>
              </div>
              {galleryImages.length > 0 ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {galleryImages.map((image, index) => (
                    <div key={`${image}-${index}`} className="overflow-hidden rounded-[1.2rem] border border-[rgba(15,76,129,0.08)] bg-white">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={image} alt={`College request ${index + 1}`} className="h-44 w-full object-cover" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm leading-7 text-[color:var(--text-muted)]">No gallery images were included with this request.</p>
              )}
            </article>
          </div>

          <article className="luxe-card p-5">
            <div className="flex flex-wrap gap-2">
              {tabItems.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                      active
                        ? "bg-[color:var(--brand-primary)] text-white"
                        : "border border-[rgba(15,76,129,0.1)] bg-white text-[color:var(--brand-primary)] hover:bg-[rgba(15,76,129,0.04)]"
                    }`}
                  >
                    <Icon className="size-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-5">
              {activeTab === "overview" ? (
                <div className="space-y-4">
                  <div className="rounded-[1rem] border border-[rgba(15,76,129,0.08)] bg-[rgba(15,76,129,0.03)] p-4 text-sm leading-7 text-[color:var(--text-muted)]">
                    {String(payload.overview || payload.description || "No overview provided.")}
                  </div>

                  {fallbackFields.length > 0 ? (
                    <div className="rounded-[1rem] border border-[rgba(15,76,129,0.08)] bg-white p-4">
                      <h3 className="text-sm font-bold text-[color:var(--text-dark)]">Additional Submitted Fields</h3>
                      <div className="mt-3 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                        {fallbackFields.map(([key, value]) => (
                          <p key={key}>
                            <span className="font-semibold text-[color:var(--text-dark)]">{toTitle(key)}:</span>{" "}
                            {typeof value === "object" ? JSON.stringify(value) : String(value)}
                          </p>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {activeTab === "facilities" ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-[1rem] border border-[rgba(15,76,129,0.08)] bg-white p-4">
                    <h3 className="text-sm font-bold text-[color:var(--text-dark)]">Facilities</h3>
                    {facilities.length === 0 ? (
                      <p className="mt-3 text-sm text-slate-500">No facilities submitted.</p>
                    ) : (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {facilities.map((item) => (
                          <span key={item} className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                            {item}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="rounded-[1rem] border border-[rgba(15,76,129,0.08)] bg-white p-4">
                    <h3 className="text-sm font-bold text-[color:var(--text-dark)]">Quotas</h3>
                    {quotas.length === 0 ? (
                      <p className="mt-3 text-sm text-slate-500">No quotas submitted.</p>
                    ) : (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {quotas.map((item) => (
                          <span key={item} className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                            {item}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : null}

              {activeTab === "admission" ? (
                <div className="rounded-[1rem] border border-[rgba(15,76,129,0.08)] bg-white p-4 text-sm leading-7 text-[color:var(--text-muted)]">
                  {String(payload.admissionProcess || "No admission process submitted.")}
                </div>
              ) : null}

              {activeTab === "fees" ? (
                <div className="rounded-[1rem] border border-[rgba(15,76,129,0.08)] bg-white p-4">
                  {feesRows.length === 0 ? (
                    <p className="text-sm text-slate-500">No valid fees data submitted.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-left text-sm">
                        <thead>
                          <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                            <th className="px-2 py-2">Fee Type</th>
                            <th className="px-2 py-2">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {feesRows.map((row) => {
                            const isRange =
                              row.minAmount !== null &&
                              row.maxAmount !== null &&
                              row.minAmount !== row.maxAmount;

                            return (
                              <tr key={row.label} className="border-b border-slate-100">
                                <td className="px-2 py-2 text-slate-600">{toTitle(row.label)}</td>
                                <td className="px-2 py-2 font-medium text-[color:var(--text-dark)]">
                                  {isRange
                                    ? `${toCurrencyText(row.minAmount)} - ${toCurrencyText(row.maxAmount)}`
                                    : toCurrencyText(row.minAmount ?? row.maxAmount)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ) : null}

              {activeTab === "scholarships" ? (
                <div className="rounded-[1rem] border border-[rgba(15,76,129,0.08)] bg-white p-4 text-sm leading-7 text-[color:var(--text-muted)]">
                  {String(payload.scholarships || "No scholarships content submitted.")}
                </div>
              ) : null}
            </div>
          </article>
        </div>
      )}
    </AdminPortalShell>
  );
}
