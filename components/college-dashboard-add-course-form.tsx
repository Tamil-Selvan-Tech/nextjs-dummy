"use client";

import { useEffect, useMemo, useState } from "react";
import type { SafeAuthUser } from "@/lib/auth-storage";
import { request, withAuth } from "@/lib/api";
import { useStatusToast } from "@/lib/toast";

type CollegeProfile = {
  _id?: string;
  name?: string;
  university?: string;
};

type CourseForm = {
  courseType: string;
  degreeType: string;
  stream: string;
  specialization: string;
  duration: string;
  mode: string;
  lateralEntryAvailable: boolean;
  lateralEntryDetails: string;
  minimumQualification: string;
  university: string;
  admissionProcess: string;
  description: string;
  semesterFees: string;
  totalFees: string;
  cutoff: string;
  intake: string;
  applicationFee: string;
};

const degreeTypeOptions = ["UG", "PG", "Diploma", "Certificate", "Doctorate"];
const streamOptions = ["Engineering", "Management", "Arts", "Science", "Commerce", "Medical", "Law", "Design", "Education", "Paramedical", "Computer Applications"];
const modeOptions = ["Full-time", "Part-time", "Distance", "Online", "Hybrid"];
const qualificationOptions = ["10th", "10+2", "Diploma", "Graduation", "Post Graduation"];

const emptyCourseForm: CourseForm = {
  courseType: "",
  degreeType: "",
  stream: "",
  specialization: "",
  duration: "",
  mode: "Full-time",
  lateralEntryAvailable: false,
  lateralEntryDetails: "",
  minimumQualification: "",
  university: "",
  admissionProcess: "",
  description: "",
  semesterFees: "",
  totalFees: "",
  cutoff: "",
  intake: "",
  applicationFee: "",
};

export function CollegeDashboardAddCourseForm({
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
  const [form, setForm] = useState<CourseForm>({
    ...emptyCourseForm,
    university: String(college?.university || ""),
  });
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "error" | "success"; text: string } | null>(null);
  useStatusToast(status);

  useEffect(() => {
    const nextUniversity = String(college?.university || "");
    setForm((previous) =>
      previous.university === nextUniversity
        ? previous
        : { ...previous, university: previous.university || nextUniversity },
    );
  }, [college?.university]);

  const coursePreview = useMemo(
    () => [form.courseType, form.stream, form.specialization].filter(Boolean).join(" - "),
    [form.courseType, form.stream, form.specialization],
  );
  const setField = <K extends keyof CourseForm>(key: K, value: CourseForm[K]) => {
    setForm((previous) => ({ ...previous, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;

    try {
      setSaving(true);
      const data = await request(
        "/api/users/my-courses",
        withAuth(token, {
          method: "POST",
          body: JSON.stringify(form),
        }),
      );
      setStatus({ type: "success", text: data.message || "Course created successfully." });
      setForm({
        ...emptyCourseForm,
        university: String(college?.university || ""),
      });
      await onSaved();
    } catch (error) {
      setStatus({
        type: "error",
        text: error instanceof Error ? error.message : "Unable to save course.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <article className="luxe-card reveal-up delay-3 rounded-[1.2rem] p-4 sm:p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--brand-support)]">
            Approved Course Request
          </p>
          <h3 className="mt-1.5 text-lg font-bold text-slate-900 sm:text-xl">Add Course</h3>
          <p className="mt-1.5 text-[13px] leading-5 text-slate-600">
            This course will be saved only to {college?.name || currentUser?.name || "your college"}.
          </p>
        </div>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
          Form Unlocked
        </span>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 grid gap-4 md:grid-cols-2">
        <label>
          <span className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">Course Type *</span>
          <input value={form.courseType} onChange={(e) => setField("courseType", e.target.value)} placeholder="B.Tech, MBA, B.Sc" className="w-full rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-white px-4 py-3 text-sm outline-none" />
        </label>
        <label>
          <span className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">Degree Type *</span>
          <select value={form.degreeType} onChange={(e) => setField("degreeType", e.target.value)} className="w-full rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-white px-4 py-3 text-sm outline-none">
            <option value="">Select degree type</option>
            {degreeTypeOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">Stream *</span>
          <select value={form.stream} onChange={(e) => setField("stream", e.target.value)} className="w-full rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-white px-4 py-3 text-sm outline-none">
            <option value="">Select stream</option>
            {streamOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">Specialization *</span>
          <input value={form.specialization} onChange={(e) => setField("specialization", e.target.value)} placeholder="Computer Science" className="w-full rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-white px-4 py-3 text-sm outline-none" />
        </label>
        <label>
          <span className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">Duration *</span>
          <input value={form.duration} onChange={(e) => setField("duration", e.target.value)} placeholder="4 Years" className="w-full rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-white px-4 py-3 text-sm outline-none" />
        </label>
        <label>
          <span className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">Mode</span>
          <select value={form.mode} onChange={(e) => setField("mode", e.target.value)} className="w-full rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-white px-4 py-3 text-sm outline-none">
            {modeOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">Minimum Qualification *</span>
          <select value={form.minimumQualification} onChange={(e) => setField("minimumQualification", e.target.value)} className="w-full rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-white px-4 py-3 text-sm outline-none">
            <option value="">Select qualification</option>
            {qualificationOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">University</span>
          <input value={form.university} onChange={(e) => setField("university", e.target.value)} placeholder="Affiliated university" className="w-full rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-white px-4 py-3 text-sm outline-none" />
        </label>
        <label>
          <span className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">Semester Fees</span>
          <input value={form.semesterFees} onChange={(e) => setField("semesterFees", e.target.value)} placeholder="50000" className="w-full rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-white px-4 py-3 text-sm outline-none" />
        </label>
        <label>
          <span className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">Total Fees *</span>
          <input value={form.totalFees} onChange={(e) => setField("totalFees", e.target.value)} placeholder="200000" className="w-full rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-white px-4 py-3 text-sm outline-none" />
        </label>
        <label>
          <span className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">Cutoff *</span>
          <input value={form.cutoff} onChange={(e) => setField("cutoff", e.target.value)} placeholder="150-180" className="w-full rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-white px-4 py-3 text-sm outline-none" />
        </label>
        <label>
          <span className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">Intake</span>
          <input value={form.intake} onChange={(e) => setField("intake", e.target.value)} placeholder="120" className="w-full rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-white px-4 py-3 text-sm outline-none" />
        </label>
        <label>
          <span className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">Application Fee</span>
          <input value={form.applicationFee} onChange={(e) => setField("applicationFee", e.target.value)} placeholder="1000" className="w-full rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-white px-4 py-3 text-sm outline-none" />
        </label>
        <label className="flex items-center gap-3 rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-white px-4 py-3 text-sm font-semibold text-[color:var(--text-dark)]">
          <input type="checkbox" checked={form.lateralEntryAvailable} onChange={(e) => setField("lateralEntryAvailable", e.target.checked)} />
          Lateral Entry Available
        </label>
        {form.lateralEntryAvailable ? (
          <label>
            <span className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">Lateral Entry Details</span>
            <input value={form.lateralEntryDetails} onChange={(e) => setField("lateralEntryDetails", e.target.value)} placeholder="Direct second year entry" className="w-full rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-white px-4 py-3 text-sm outline-none" />
          </label>
        ) : null}
        <label className="md:col-span-2">
          <span className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">Admission Process</span>
          <textarea rows={3} value={form.admissionProcess} onChange={(e) => setField("admissionProcess", e.target.value)} className="w-full rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-white px-4 py-3 text-sm outline-none" />
        </label>
        <label className="md:col-span-2">
          <span className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">Description</span>
          <textarea rows={3} value={form.description} onChange={(e) => setField("description", e.target.value)} className="w-full rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-white px-4 py-3 text-sm outline-none" />
        </label>
        <div className="md:col-span-2 rounded-[1rem] border border-[rgba(15,76,129,0.08)] bg-[rgba(15,76,129,0.03)] px-4 py-3 text-sm text-slate-600">
          Course Preview: <span className="font-semibold text-slate-900">{coursePreview || "Fill course details"}</span>
        </div>
        <div className="md:col-span-2">
          <button type="submit" disabled={saving} className="inline-flex w-full items-center justify-center rounded-full bg-[color:var(--brand-support)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1b978e] disabled:opacity-60">
            {saving ? "Saving..." : "Add Course"}
          </button>
        </div>
      </form>
    </article>
  );
}
