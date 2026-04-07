"use client";

import { useEffect, useMemo, useState } from "react";
import type { SafeAuthUser } from "@/lib/auth-storage";
import { request, withAuth } from "@/lib/api";
import {
  formatRankingRangeForSave,
  normalizeRankingRangeInput,
  parseRankingRange,
} from "@/lib/ranking-utils";
import { useStatusToast } from "@/lib/toast";

type CollegeProfile = {
  _id?: string;
  name?: string;
  university?: string;
  country?: string;
  state?: string;
  district?: string;
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

const normalizeList = (value?: string[] | string) =>
  Array.isArray(value) ? value.filter(Boolean).join(", ") : String(value || "");

export function CollegeDashboardAddCollegeForm({
  token,
  currentUser,
  college,
  onSaved,
}: {
  token: string;
  currentUser: SafeAuthUser | null;
  college: CollegeProfile | null;
  onSaved: () => Promise<void> | void;
}) {
  const [form, setForm] = useState<CollegeForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "error" | "success"; text: string } | null>(null);

  useEffect(() => {
    setForm({
      ...emptyForm,
      ...college,
      country: String(college?.country || "India"),
      courseTags: normalizeList(college?.courseTags),
      facilities: normalizeList(college?.facilities),
      quotas: normalizeList(college?.quotas),
      contactPhone: String(college?.contactPhone || currentUser?.phone || ""),
      ranking: String(college?.ranking || ""),
      hasHostel: Boolean(college?.hasHostel),
    });
  }, [college, currentUser?.phone]);
  useStatusToast(status);

  const rankingText = useMemo(() => {
    const parsed = parseRankingRange(form.ranking);
    if (!parsed) return null;
    return `${parsed.start} - ${parsed.end}`;
  }, [form.ranking]);

  const setField = <K extends keyof CollegeForm>(key: K, value: CollegeForm[K]) => {
    setForm((previous) => ({ ...previous, [key]: value }));
  };

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
        text: "College name, university, state, district and description are required.",
      });
      return;
    }

    try {
      setSaving(true);
      const data = await request(
        "/api/users/my-college",
        withAuth(token, {
          method: "POST",
          body: JSON.stringify({
            ...form,
            ranking: formatRankingRangeForSave(form.ranking),
            contactPhone: form.contactPhone || currentUser?.phone || "",
          }),
        }),
      );
      setStatus({ type: "success", text: data.message || "College saved successfully." });
      await onSaved();
    } catch (error) {
      setStatus({
        type: "error",
        text: error instanceof Error ? error.message : "Unable to save college profile.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <article className="luxe-card reveal-up delay-2 rounded-[1.2rem] p-4 sm:p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--brand-primary)]">
            Approved College Request
          </p>
          <h3 className="mt-1.5 text-lg font-bold text-slate-900 sm:text-xl">
            {college?._id ? "Update College Details" : "Add College"}
          </h3>
          <p className="mt-1.5 text-[13px] leading-5 text-slate-600">
            Admin approval is complete. Fill the details here and save directly from the college dashboard.
          </p>
        </div>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
          Form Unlocked
        </span>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
        <section className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">College Name *</span>
              <input value={form.name} onChange={(e) => setField("name", e.target.value)} className="w-full rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-white px-4 py-3 text-sm outline-none" />
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">University *</span>
              <input value={form.university} onChange={(e) => setField("university", e.target.value)} className="w-full rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-white px-4 py-3 text-sm outline-none" />
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">Country</span>
              <input value={form.country} onChange={(e) => setField("country", e.target.value)} className="w-full rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-white px-4 py-3 text-sm outline-none" />
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">State *</span>
              <input value={form.state} onChange={(e) => setField("state", e.target.value)} className="w-full rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-white px-4 py-3 text-sm outline-none" />
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">District *</span>
              <input value={form.district} onChange={(e) => setField("district", e.target.value)} className="w-full rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-white px-4 py-3 text-sm outline-none" />
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">Contact Phone</span>
              <input value={form.contactPhone} onChange={(e) => setField("contactPhone", e.target.value)} className="w-full rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-white px-4 py-3 text-sm outline-none" />
            </label>
            <label className="md:col-span-2">
              <span className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">Description *</span>
              <textarea rows={4} value={form.description} onChange={(e) => setField("description", e.target.value)} className="w-full rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-white px-4 py-3 text-sm outline-none" />
            </label>
            <label className="md:col-span-2">
              <span className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">Overview</span>
              <textarea rows={4} value={form.overview} onChange={(e) => setField("overview", e.target.value)} className="w-full rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-white px-4 py-3 text-sm outline-none" />
            </label>
            <label className="md:col-span-2">
              <span className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">Infrastructure</span>
              <textarea rows={3} value={form.infrastructure} onChange={(e) => setField("infrastructure", e.target.value)} className="w-full rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-white px-4 py-3 text-sm outline-none" />
            </label>
            <label className="md:col-span-2">
              <span className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">Faculty</span>
              <textarea rows={3} value={form.faculty} onChange={(e) => setField("faculty", e.target.value)} className="w-full rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-white px-4 py-3 text-sm outline-none" />
            </label>
            <label className="md:col-span-2">
              <span className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">Admission Process</span>
              <textarea rows={3} value={form.admissionProcess} onChange={(e) => setField("admissionProcess", e.target.value)} className="w-full rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-white px-4 py-3 text-sm outline-none" />
            </label>
          </div>
        </section>

        <section className="space-y-4">
          <label>
            <span className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">Website</span>
            <input value={form.website} onChange={(e) => setField("website", e.target.value)} className="w-full rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-white px-4 py-3 text-sm outline-none" />
          </label>
          <label>
            <span className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">Location Link</span>
            <input value={form.locationLink} onChange={(e) => setField("locationLink", e.target.value)} className="w-full rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-white px-4 py-3 text-sm outline-none" />
          </label>
          <label>
            <span className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">Accreditation</span>
            <select value={form.accreditation} onChange={(e) => setField("accreditation", e.target.value)} className="w-full rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-white px-4 py-3 text-sm outline-none">
              <option value="">Select accreditation</option>
              {accreditationOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">Ranking</span>
            <input
              value={form.ranking}
              onChange={(e) => setField("ranking", normalizeRankingRangeInput(e.target.value))}
              onBlur={() => setField("ranking", formatRankingRangeForSave(form.ranking))}
              placeholder="25-50"
              className="w-full rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-white px-4 py-3 text-sm outline-none"
            />
            {rankingText ? <span className="mt-1.5 block text-xs text-slate-500">Preview: {rankingText}</span> : null}
          </label>
          <label>
            <span className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">Scholarships</span>
            <textarea rows={3} value={form.scholarships} onChange={(e) => setField("scholarships", e.target.value)} className="w-full rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-white px-4 py-3 text-sm outline-none" />
          </label>
          <label>
            <span className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">Industry Partnerships</span>
            <textarea rows={3} value={form.industryPartnerships} onChange={(e) => setField("industryPartnerships", e.target.value)} className="w-full rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-white px-4 py-3 text-sm outline-none" />
          </label>
          <label>
            <span className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">Reviews</span>
            <textarea rows={3} value={form.reviews} onChange={(e) => setField("reviews", e.target.value)} className="w-full rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-white px-4 py-3 text-sm outline-none" />
          </label>
          <label>
            <span className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">Course Tags</span>
            <input value={form.courseTags} onChange={(e) => setField("courseTags", e.target.value)} className="w-full rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-white px-4 py-3 text-sm outline-none" />
          </label>
          <label>
            <span className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">Facilities</span>
            <input value={form.facilities} onChange={(e) => setField("facilities", e.target.value)} className="w-full rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-white px-4 py-3 text-sm outline-none" />
          </label>
          <label>
            <span className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">Admission Quotas</span>
            <input value={form.quotas} onChange={(e) => setField("quotas", e.target.value)} className="w-full rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-white px-4 py-3 text-sm outline-none" />
          </label>
          <label className="flex items-center gap-3 rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-white px-4 py-3 text-sm font-semibold text-[color:var(--text-dark)]">
            <input type="checkbox" checked={form.hasHostel} onChange={(e) => setField("hasHostel", e.target.checked)} />
            Hostel Available
          </label>
          <button type="submit" disabled={saving} className="inline-flex w-full items-center justify-center rounded-full bg-[color:var(--brand-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--brand-primary-soft)] disabled:opacity-60">
            {saving ? "Saving..." : college?._id ? "Update College" : "Add College"}
          </button>
        </section>
      </form>
    </article>
  );
}
