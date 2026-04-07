"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Building2, Save, ShieldAlert } from "lucide-react";
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
import {
  formatRankingRangeForSave,
  normalizeRankingRangeInput,
  parseRankingRange,
} from "@/lib/ranking-utils";
import { useStatusToast } from "@/lib/toast";

type AccessRequest = {
  status?: "pending" | "accepted" | "declined";
  message?: string;
};

type CollegeForm = {
  name: string;
  university: string;
  country: string;
  state: string;
  district: string;
  description: string;
  overview: string;
  infrastructure: string;
  faculty: string;
  admissionProcess: string;
  scholarships: string;
  industryPartnerships: string;
  reviews: string;
  courseTags: string;
  contactPhone: string;
  website: string;
  locationLink: string;
  accreditation: string;
  ranking: string;
  hasHostel: boolean;
  facilities: string;
  quotas: string;
};

const accreditationOptions = ["NAAC A++", "NAAC A+", "NAAC A", "NAAC B++", "NAAC B+", "NAAC B", "Others"];
const accreditationRankMap: Record<string, string> = {
  "NAAC A++": "1-50",
  "NAAC A+": "51-100",
  "NAAC A": "101-150",
  "NAAC B++": "151-200",
  "NAAC B+": "201-250",
  "NAAC B": "251-300",
  Others: "",
};

const emptyForm: CollegeForm = {
  name: "",
  university: "",
  country: "India",
  state: "",
  district: "",
  description: "",
  overview: "",
  infrastructure: "",
  faculty: "",
  admissionProcess: "",
  scholarships: "",
  industryPartnerships: "",
  reviews: "",
  courseTags: "",
  contactPhone: "",
  website: "",
  locationLink: "",
  accreditation: "",
  ranking: "",
  hasHostel: false,
  facilities: "",
  quotas: "",
};

export default function CollegeManagePage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [currentUser, setCurrentUser] = useState<SafeAuthUser | null>(null);
  const [accessRequest, setAccessRequest] = useState<AccessRequest | null>(null);
  const [form, setForm] = useState<CollegeForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [hasExistingProfile, setHasExistingProfile] = useState(false);
  useStatusToast(status);

  useEffect(() => {
    const storedToken = readAuthToken();
    const storedUser = readCurrentUser();

    if (!storedToken || !storedUser) {
      router.replace("/login?type=college&redirect=/college/manage");
      return;
    }
    if (storedUser.role !== "college") {
      router.replace("/account");
      return;
    }

    setToken(storedToken);
    setCurrentUser(storedUser);

    const loadData = async () => {
      try {
        setLoading(true);
        const headers = withAuth(storedToken);
        const [requestData, collegeData] = await Promise.all([
          request("/api/users/college-access-request", headers).catch(() => ({ request: null })),
          request("/api/users/my-college", headers).catch(() => ({ college: null })),
        ]);

        const access = (requestData.request as AccessRequest | null) || null;
        const college = (collegeData.college as Partial<CollegeForm> | null) || null;
        setAccessRequest(access);
        if (college) {
          setForm({
            ...emptyForm,
            ...college,
            contactPhone: college.contactPhone || storedUser.phone || "",
            hasHostel: Boolean(college.hasHostel),
            ranking: String(college.ranking || ""),
          });
          setHasExistingProfile(true);
        } else {
          setForm((previous) => ({
            ...previous,
            contactPhone: storedUser.phone || "",
          }));
          setHasExistingProfile(false);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to load college profile";
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

  const blocked = useMemo(() => accessRequest?.status !== "accepted", [accessRequest?.status]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;

    if (
      !form.name.trim() ||
      !form.university.trim() ||
      !form.state.trim() ||
      !form.district.trim() ||
      !form.description.trim()
    ) {
      setStatus({
        type: "error",
        text: "Name, university, state, district and description are required.",
      });
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...form,
        ranking: formatRankingRangeForSave(form.ranking),
        contactPhone: form.contactPhone || currentUser?.phone || "",
      };
      const data = await request(
        "/api/users/my-college",
        withAuth(token, {
          method: "POST",
          body: JSON.stringify(payload),
        }),
      );

      setStatus({ type: "success", text: data.message || "College profile saved successfully." });
      setHasExistingProfile(true);
    } catch (error) {
      setStatus({
        type: "error",
        text: error instanceof Error ? error.message : "Unable to save college profile.",
      });
    } finally {
      setSaving(false);
    }
  };

  const setField = <K extends keyof CollegeForm>(key: K, value: CollegeForm[K]) => {
    setForm((previous) => ({ ...previous, [key]: value }));
  };

  return (
    <CollegePortalShell
      title="Manage College Profile"
      subtitle="Create or update your college listing with the same polished presentation students see across the platform."
      currentUser={currentUser}
      actions={
        <>
          <Link
            href="/college-dashboard"
            className="inline-flex items-center gap-2 rounded-full border border-[rgba(15,76,129,0.12)] bg-white px-4 py-2.5 text-sm font-semibold text-[color:var(--brand-primary)] transition hover:bg-[rgba(15,76,129,0.04)]"
          >
            Dashboard
          </Link>
          <Link
            href="/college/requests"
            className="inline-flex items-center gap-2 rounded-full bg-[color:var(--brand-primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[color:var(--brand-primary-soft)]"
          >
            Request Center
            <ArrowRight className="size-4" />
          </Link>
        </>
      }
    >
      {blocked ? (
        <article className="luxe-card p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="rounded-full bg-[rgba(255,138,61,0.12)] p-3 text-[color:var(--brand-accent)]">
              <ShieldAlert className="size-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[color:var(--text-dark)]">
                Access approval needed
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-[color:var(--text-muted)]">
                College profile management unlock ஆக வேண்டும்னா admin access request accepted ஆகணும்.
                Current status: <span className="font-semibold capitalize text-[color:var(--text-dark)]">{accessRequest?.status || "not started"}</span>.
              </p>
              {accessRequest?.message ? (
                <p className="mt-2 text-sm text-slate-600">{accessRequest.message}</p>
              ) : null}
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/college-dashboard"
                  className="inline-flex items-center gap-2 rounded-full bg-[color:var(--brand-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--brand-primary-soft)]"
                >
                  Go to Dashboard
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/college/requests"
                  className="inline-flex items-center gap-2 rounded-full border border-[rgba(15,76,129,0.12)] bg-white px-5 py-3 text-sm font-semibold text-[color:var(--brand-primary)] transition hover:bg-[rgba(15,76,129,0.04)]"
                >
                  Open Request Center
                </Link>
              </div>
            </div>
          </div>
        </article>
      ) : (
        <form onSubmit={handleSubmit} className="grid gap-5 xl:grid-cols-[1.12fr_0.88fr]">
          <section className="space-y-5">
            <article className="luxe-card p-5 sm:p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--brand-primary)]">
                    Profile Form
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-[color:var(--text-dark)]">
                    {hasExistingProfile ? "Update college details" : "Create college profile"}
                  </h2>
                </div>
                <span className="rounded-full border border-[rgba(15,76,129,0.08)] bg-[rgba(15,76,129,0.04)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--brand-primary)]">
                  Responsive Form
                </span>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">College Name *</label>
                  <input value={form.name} onChange={(e) => setField("name", e.target.value)} className="w-full rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--brand-primary-soft)] focus:shadow-[0_0_0_4px_rgba(60,126,182,0.12)]" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">University *</label>
                  <input value={form.university} onChange={(e) => setField("university", e.target.value)} className="w-full rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--brand-primary-soft)] focus:shadow-[0_0_0_4px_rgba(60,126,182,0.12)]" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">Country</label>
                  <input value={form.country} onChange={(e) => setField("country", e.target.value)} className="w-full rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--brand-primary-soft)] focus:shadow-[0_0_0_4px_rgba(60,126,182,0.12)]" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">State *</label>
                  <input value={form.state} onChange={(e) => setField("state", e.target.value)} className="w-full rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--brand-primary-soft)] focus:shadow-[0_0_0_4px_rgba(60,126,182,0.12)]" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">District *</label>
                  <input value={form.district} onChange={(e) => setField("district", e.target.value)} className="w-full rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--brand-primary-soft)] focus:shadow-[0_0_0_4px_rgba(60,126,182,0.12)]" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">Contact Phone</label>
                  <input value={form.contactPhone} onChange={(e) => setField("contactPhone", e.target.value)} className="w-full rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--brand-primary-soft)] focus:shadow-[0_0_0_4px_rgba(60,126,182,0.12)]" />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">Description *</label>
                  <textarea rows={4} value={form.description} onChange={(e) => setField("description", e.target.value)} className="w-full rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--brand-primary-soft)] focus:shadow-[0_0_0_4px_rgba(60,126,182,0.12)]" />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">Overview</label>
                  <textarea rows={4} value={form.overview} onChange={(e) => setField("overview", e.target.value)} className="w-full rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--brand-primary-soft)] focus:shadow-[0_0_0_4px_rgba(60,126,182,0.12)]" />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">Infrastructure</label>
                  <textarea rows={4} value={form.infrastructure} onChange={(e) => setField("infrastructure", e.target.value)} className="w-full rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--brand-primary-soft)] focus:shadow-[0_0_0_4px_rgba(60,126,182,0.12)]" />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">Faculty</label>
                  <textarea rows={3} value={form.faculty} onChange={(e) => setField("faculty", e.target.value)} className="w-full rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--brand-primary-soft)] focus:shadow-[0_0_0_4px_rgba(60,126,182,0.12)]" />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">Admission Process</label>
                  <textarea rows={3} value={form.admissionProcess} onChange={(e) => setField("admissionProcess", e.target.value)} className="w-full rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--brand-primary-soft)] focus:shadow-[0_0_0_4px_rgba(60,126,182,0.12)]" />
                </div>
              </div>
            </article>
          </section>

          <section className="space-y-5">
            <article className="luxe-card p-5">
              <h3 className="text-lg font-bold text-[color:var(--text-dark)]">Highlights</h3>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">Website</label>
                  <input value={form.website} onChange={(e) => setField("website", e.target.value)} className="w-full rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--brand-primary-soft)] focus:shadow-[0_0_0_4px_rgba(60,126,182,0.12)]" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">Location Link</label>
                  <input value={form.locationLink} onChange={(e) => setField("locationLink", e.target.value)} className="w-full rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--brand-primary-soft)] focus:shadow-[0_0_0_4px_rgba(60,126,182,0.12)]" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">Accreditation</label>
                  <select value={form.accreditation} onChange={(e) => {
                    const value = e.target.value;
                    setField("accreditation", value);
                    if (!form.ranking) setField("ranking", accreditationRankMap[value] || "");
                  }} className="w-full rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--brand-primary-soft)] focus:shadow-[0_0_0_4px_rgba(60,126,182,0.12)]">
                    <option value="">Select accreditation</option>
                    {accreditationOptions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">Ranking</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="101-150"
                    value={form.ranking}
                    onChange={(e) => {
                      const raw = e.target.value;
                      const cleaned = String(raw || "").replace(/[\u2013\u2014]/g, "-").replace(/[^\d-]/g, "");
                      const digitsOnly = cleaned.replace(/-/g, "");
                      let normalizedInput = "";
                      if (cleaned.includes("-")) {
                        normalizedInput = normalizeRankingRangeInput(cleaned);
                      } else if (digitsOnly.length > 4) {
                        const parsed = parseRankingRange(digitsOnly);
                        normalizedInput = parsed ? `${parsed.start}-${parsed.end}` : digitsOnly.slice(0, 4);
                      } else {
                        normalizedInput = digitsOnly ? `${digitsOnly}-` : "";
                      }
                      setField("ranking", normalizedInput);
                    }}
                    onBlur={() => setField("ranking", formatRankingRangeForSave(form.ranking))}
                    className="w-full rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--brand-primary-soft)] focus:shadow-[0_0_0_4px_rgba(60,126,182,0.12)]"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">Scholarships</label>
                  <textarea rows={3} value={form.scholarships} onChange={(e) => setField("scholarships", e.target.value)} className="w-full rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--brand-primary-soft)] focus:shadow-[0_0_0_4px_rgba(60,126,182,0.12)]" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">Industry Partnerships</label>
                  <textarea rows={3} value={form.industryPartnerships} onChange={(e) => setField("industryPartnerships", e.target.value)} className="w-full rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--brand-primary-soft)] focus:shadow-[0_0_0_4px_rgba(60,126,182,0.12)]" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">Reviews</label>
                  <textarea rows={3} value={form.reviews} onChange={(e) => setField("reviews", e.target.value)} className="w-full rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--brand-primary-soft)] focus:shadow-[0_0_0_4px_rgba(60,126,182,0.12)]" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">Course Tags</label>
                  <input value={form.courseTags} onChange={(e) => setField("courseTags", e.target.value)} className="w-full rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--brand-primary-soft)] focus:shadow-[0_0_0_4px_rgba(60,126,182,0.12)]" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">Facilities</label>
                  <input value={form.facilities} onChange={(e) => setField("facilities", e.target.value)} className="w-full rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--brand-primary-soft)] focus:shadow-[0_0_0_4px_rgba(60,126,182,0.12)]" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">Quotas</label>
                  <input value={form.quotas} onChange={(e) => setField("quotas", e.target.value)} className="w-full rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--brand-primary-soft)] focus:shadow-[0_0_0_4px_rgba(60,126,182,0.12)]" />
                </div>
                <label className="inline-flex items-center gap-3 rounded-[1rem] border border-[rgba(15,76,129,0.08)] bg-[rgba(15,76,129,0.03)] px-4 py-3 text-sm font-semibold text-[color:var(--text-dark)]">
                  <input type="checkbox" checked={form.hasHostel} onChange={(e) => setField("hasHostel", e.target.checked)} className="size-4" />
                  Hostel Available
                </label>
              </div>
            </article>

            <article className="luxe-card p-5">
              <div className="inline-flex items-center gap-3 rounded-[1rem] border border-[rgba(15,76,129,0.08)] bg-[rgba(15,76,129,0.03)] px-4 py-3 text-sm text-[color:var(--text-muted)]">
                <Building2 className="size-4 text-[color:var(--brand-primary)]" />
                Form fields backend college model-க்கு match ஆக save ஆகும்.
              </div>
              <button
                type="submit"
                disabled={loading || saving}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[color:var(--brand-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--brand-primary-soft)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save className="size-4" />
                {saving ? "Saving..." : hasExistingProfile ? "Update College Details" : "Save College Details"}
              </button>
            </article>
          </section>
        </form>
      )}
    </CollegePortalShell>
  );
}
