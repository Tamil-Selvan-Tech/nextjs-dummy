"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, MessageSquareText, Phone, UserRound, X } from "lucide-react";
import { useRouter } from "next/navigation";
import type { College, Course } from "@/lib/site-data";
import { readAuthToken, readCurrentUser } from "@/lib/auth-storage";
import { request, withAuth } from "@/lib/api";
import { useStatusToast } from "@/lib/toast";

type EnquiryFormProps = {
  college: College;
  relatedCourses?: Course[];
  onClose: () => void;
};

type FormErrors = Partial<Record<"name" | "email" | "phone" | "course" | "message", string>>;

export function EnquiryForm({ college, relatedCourses = [], onClose }: EnquiryFormProps) {
  const router = useRouter();
  const currentUser = readCurrentUser();
  const token = readAuthToken();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  useStatusToast(status);
  const [formData, setFormData] = useState(() => ({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    phone: currentUser?.phone || "",
    course: "",
    message: "",
  }));

  const validateForm = () => {
    const nextErrors: FormErrors = {};

    if (!formData.name.trim()) nextErrors.name = "Name is required";
    if (!formData.email.trim()) nextErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) nextErrors.email = "Invalid email format";
    if (!formData.phone.trim()) nextErrors.phone = "Phone is required";
    else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ""))) nextErrors.phone = "Phone must be 10 digits";
    if (!formData.course.trim()) nextErrors.course = "Course is required";
    if (formData.message && formData.message.length > 20) nextErrors.message = "Message must be 20 characters or less";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);

    if (!validateForm()) return;

    if (!token) {
      router.push(`/login?redirect=/college/${college.id}`);
      return;
    }

    setIsSubmitting(true);
    try {
      await request(
        "/api/users/enquiry",
        withAuth(token, {
          method: "POST",
          body: JSON.stringify({
            collegeId: String(college.id),
            collegeName: college.name,
            ...formData,
          }),
        }),
      );

      setIsSubmitted(true);
      setStatus({
        type: "success",
        text: `Enquiry submitted for ${college.name}.`,
      });
      window.setTimeout(() => onClose(), 1800);
    } catch (error) {
      setStatus({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to submit enquiry.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const courseOptions = [...new Set(relatedCourses.map((course) => course.course).filter(Boolean))];

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[1700] overflow-y-auto bg-[rgba(7,20,38,0.48)] p-3 backdrop-blur-[4px] sm:p-4"
      onClick={onClose}
    >
      <div className="flex min-h-full items-center justify-center">
      <div
        className="my-4 flex w-full max-w-2xl flex-col overflow-hidden rounded-[1.8rem] border border-[rgba(15,76,129,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(243,248,255,0.98))] text-[color:var(--text-dark)] shadow-[0_30px_80px_rgba(4,12,26,0.22)] max-h-[calc(100vh-2rem)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[rgba(15,76,129,0.08)] px-5 py-4 sm:px-6 sm:py-5">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(15,76,129,0.08)] bg-white/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--brand-primary)]">
              <MessageSquareText className="size-3.5 text-[color:var(--brand-accent)]" />
              Send Enquiry
            </div>
            <h2 className="mt-3 text-2xl font-bold text-[color:var(--text-dark)]">Connect With {college.name}</h2>
            <p className="mt-2 text-sm text-[color:var(--text-muted)]">
              Share your details and course interest. The college team can follow up with you.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[rgba(15,76,129,0.1)] bg-white text-[color:var(--text-muted)] transition hover:bg-[rgba(15,76,129,0.04)]"
            aria-label="Close enquiry form"
          >
            <X className="size-4" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="px-5 py-10 text-center sm:px-6">
            <CheckCircle2 className="mx-auto size-14 text-emerald-500" />
            <h3 className="mt-4 text-2xl font-bold text-[color:var(--text-dark)]">Enquiry Submitted</h3>
            <p className="mt-2 text-sm text-[color:var(--text-muted)]">
              Thank you for your interest in {college.name}. We will get back to you soon.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5 pb-4 sm:px-6 sm:py-6 sm:pb-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">Full Name *</span>
                <div className="relative">
                  <UserRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[color:var(--text-muted)]" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
                    className="w-full rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[color:var(--brand-primary-soft)] focus:shadow-[0_0_0_4px_rgba(60,126,182,0.12)]"
                    placeholder="Enter your full name"
                  />
                </div>
                {errors.name ? <p className="mt-1 text-xs text-red-600">{errors.name}</p> : null}
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">Phone *</span>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[color:var(--text-muted)]" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        phone: event.target.value.replace(/\D/g, "").slice(0, 10),
                      }))
                    }
                    className="w-full rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[color:var(--brand-primary-soft)] focus:shadow-[0_0_0_4px_rgba(60,126,182,0.12)]"
                    placeholder="Enter 10-digit phone"
                  />
                </div>
                {errors.phone ? <p className="mt-1 text-xs text-red-600">{errors.phone}</p> : null}
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-[1.2fr_0.8fr]">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">Email *</span>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))}
                  className="w-full rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--brand-primary-soft)] focus:shadow-[0_0_0_4px_rgba(60,126,182,0.12)]"
                  placeholder="Enter your email"
                />
                {errors.email ? <p className="mt-1 text-xs text-red-600">{errors.email}</p> : null}
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">Interested Course *</span>
                <select
                  value={formData.course}
                  onChange={(event) => setFormData((current) => ({ ...current, course: event.target.value }))}
                  className="w-full rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--brand-primary-soft)] focus:shadow-[0_0_0_4px_rgba(60,126,182,0.12)]"
                >
                  <option value="">Select a course</option>
                  {courseOptions.length === 0 ? <option value="">No courses available</option> : null}
                  {courseOptions.map((courseName) => (
                    <option key={courseName} value={courseName}>
                      {courseName}
                    </option>
                  ))}
                </select>
                {errors.course ? <p className="mt-1 text-xs text-red-600">{errors.course}</p> : null}
              </label>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[color:var(--text-dark)]">Message</span>
              <textarea
                value={formData.message}
                onChange={(event) => {
                  const raw = event.target.value.replace(/\n/g, " ");
                  setFormData((current) => ({ ...current, message: raw.slice(0, 20) }));
                }}
                rows={3}
                className="w-full rounded-[1rem] border border-[rgba(15,76,129,0.12)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--brand-primary-soft)] focus:shadow-[0_0_0_4px_rgba(60,126,182,0.12)]"
                placeholder="Short message (max 20 chars)"
              />
              <div className="mt-1 flex items-center justify-between text-[11px] text-[color:var(--text-muted)]">
                <span>Keep it short. Max 20 characters.</span>
                <span>{formData.message.length}/20</span>
              </div>
              {errors.message ? <p className="mt-1 text-xs text-red-600">{errors.message}</p> : null}
            </label>
            </div>

            <div className="shrink-0 border-t border-[rgba(15,76,129,0.08)] bg-white px-5 py-4 sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                disabled={isSubmitting}
                className="shine-button inline-flex flex-1 items-center justify-center rounded-full bg-[color:var(--brand-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--brand-primary-soft)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Submitting..." : "Submit Enquiry"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex flex-1 items-center justify-center rounded-full border border-[rgba(15,76,129,0.1)] bg-white px-5 py-3 text-sm font-semibold text-[color:var(--brand-primary)] transition hover:bg-[rgba(15,76,129,0.04)]"
              >
                Cancel
              </button>
            </div>
            </div>
          </form>
        )}
      </div>
      </div>
    </div>
  );
}
