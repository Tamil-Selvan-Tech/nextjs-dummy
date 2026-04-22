"use client";

import { useMemo, useState } from "react";
import { MapPin, Star, X } from "lucide-react";
import Image from "next/image";
import { getCoursesForCollege, type College } from "@/lib/site-data";

type PopularComparisonsProps = {
  selectedCollege: College | null;
  colleges: College[];
  onSelectComparison?: (primary: College, secondary: College) => void;
};

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M13.5 21v-7h2.3l.4-3h-2.7V9.1c0-.9.3-1.5 1.6-1.5H16V4.9c-.5-.1-1.4-.2-2.4-.2-2.4 0-4 1.5-4 4.2V11H7v3h2.2v7h4.3Z" />
  </svg>
);

const MailIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 4-8 5L4 8V6l8 5 8-5v2Z" />
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M12 7.3A4.7 4.7 0 1 0 16.7 12 4.7 4.7 0 0 0 12 7.3Zm0 7.7A3 3 0 1 1 15 12 3 3 0 0 1 12 15Zm6-7.9a1.1 1.1 0 1 0 1.1 1.1A1.1 1.1 0 0 0 18 7.1Zm2.9 1.1a5.2 5.2 0 0 0-1.4-3.7A5.2 5.2 0 0 0 15.8 3.1C14.4 3 9.6 3 8.2 3.1A5.2 5.2 0 0 0 4.5 4.5 5.2 5.2 0 0 0 3.1 8.2C3 9.6 3 14.4 3.1 15.8a5.2 5.2 0 0 0 1.4 3.7 5.2 5.2 0 0 0 3.7 1.4c1.4.1 6.2.1 7.6 0a5.2 5.2 0 0 0 3.7-1.4 5.2 5.2 0 0 0 1.4-3.7c.1-1.4.1-6.2 0-7.6ZM19.2 17a3.3 3.3 0 0 1-1.9 1.9c-1.3.5-4.3.4-5.3.4s-4 .1-5.3-.4A3.3 3.3 0 0 1 4.8 17c-.5-1.3-.4-4.3-.4-5.3s-.1-4 .4-5.3A3.3 3.3 0 0 1 6.7 4.8c1.3-.5 4.3-.4 5.3-.4s4-.1 5.3.4a3.3 3.3 0 0 1 1.9 1.9c.5 1.3.4 4.3.4 5.3s.1 4-.4 5.3Z" />
  </svg>
);

export function PopularComparisons({
  selectedCollege,
  colleges,
  onSelectComparison,
}: PopularComparisonsProps) {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");

  const shareButtons = [
    { label: "Facebook", icon: FacebookIcon, className: "bg-[#1877F2]" },
    { label: "Instagram", icon: InstagramIcon, className: "bg-[#E4405F]" },
    { label: "Email", icon: MailIcon, className: "bg-[#1f2937]" },
  ];
  const ratingLabels = ["Bad", "Poor", "Okay", "Very Good", "Excellent"];
  const trimmedFeedback = feedbackText.trim();
  const wordCount = trimmedFeedback ? trimmedFeedback.split(/\s+/).length : 0;
  const canSubmit = wordCount > 0;
  const popularColleges = useMemo(() => {
    if (!selectedCollege) return [];
    const fallback = colleges.filter((college) => college.id !== selectedCollege.id);
    return fallback
      .slice()
      .sort((left, right) => (right.placementRate || 0) - (left.placementRate || 0))
      .slice(0, 5);
  }, [colleges, selectedCollege]);

  if (!selectedCollege) return null;

  const getTopCourseInfo = (college: College) => {
    const courseList = getCoursesForCollege(college.name);
    const topCourse = courseList.find((course) => course.isTopCourse) || courseList[0];
    const specialization = topCourse?.specialization ? ` in ${topCourse.specialization}` : "";
    const courseLabel = topCourse ? `${topCourse.course}${specialization}` : "Top course";
    const rating = Math.min(5, Math.max(3.8, Number(((college.placementRate || 0) / 20).toFixed(1))));
    const feesValue = typeof topCourse?.totalFees === "number" ? topCourse.totalFees : null;
    const fees =
      typeof feesValue === "number"
        ? `₹${(feesValue / 100000).toFixed(1).replace(/\.0$/, "")}L`
        : "₹-";

    return {
      courseLabel,
      rating,
      fees,
    };
  };

  return (
    <section className="mt-10 space-y-5">
      <div className="rounded-[1rem] border border-[rgba(15,76,129,0.18)] bg-white px-5 py-4 shadow-[0_10px_26px_rgba(22,50,79,0.08)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-[color:var(--text-dark)]">
              How would you rate this page?
            </h3>
            <p className="mt-1 text-sm text-[color:var(--text-muted)]">
              We will use this feedback to improve your experience.
            </p>
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <div className="flex items-center gap-1 text-amber-400">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setSelectedRating(value);
                    setSubmitMessage("");
                    setIsFeedbackOpen(true);
                  }}
                  aria-label={`Rate ${value}`}
                >
                  <Star className="size-6" />
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                setSubmitMessage("");
                setIsFeedbackOpen(true);
              }}
              className="text-sm font-semibold text-[color:var(--text-dark)]"
            >
              Rate Us Now
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-[1rem] border border-[rgba(15,76,129,0.18)] bg-white px-5 py-4 shadow-[0_10px_26px_rgba(22,50,79,0.08)]">
        <div className="flex flex-wrap items-center gap-4">
          <p className="text-sm font-semibold text-[color:var(--text-dark)]">Share this :</p>
          <div className="flex flex-wrap items-center gap-3">
            {shareButtons.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  type="button"
                  aria-label={item.label}
                  className={`flex h-11 w-11 items-center justify-center rounded-full text-white shadow-[0_10px_20px_rgba(16,24,40,0.12)] transition hover:-translate-y-0.5 ${item.className}`}
                >
                  <Icon className="size-5" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {popularColleges.length ? (
        <div className="rounded-[1.2rem] border border-[rgba(15,76,129,0.16)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,251,255,0.96))] px-5 py-5 shadow-[0_14px_32px_rgba(22,50,79,0.08)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-[color:var(--text-dark)]">
                Popular comparisons with {selectedCollege.name}
              </h3>
            </div>
          </div>

          <div className="mt-6 flex gap-4 overflow-x-auto overflow-y-visible pb-4 pt-2">
            {popularColleges.map((college) => {
              const leftInfo = getTopCourseInfo(selectedCollege);
              const rightInfo = getTopCourseInfo(college);
              return (
              <button
                key={`popular-compare-${selectedCollege.id}-${college.id}`}
                type="button"
                onClick={() => onSelectComparison?.(selectedCollege, college)}
                className="group min-w-[18.5rem] flex-1 rounded-[1.25rem] border border-[rgba(15,76,129,0.12)] bg-white p-5 text-left shadow-[0_12px_26px_rgba(22,50,79,0.08)] transition hover:-translate-y-0.5 hover:border-[rgba(255,138,61,0.35)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div
                    className="relative h-14 w-14 overflow-hidden rounded-[1rem] border border-[rgba(15,76,129,0.16)] shadow-[0_10px_20px_rgba(22,50,79,0.1)]"
                    style={{
                      backgroundImage:
                        "linear-gradient(135deg, #e7edf6 0%, #ffffff 100%), repeating-linear-gradient(45deg, rgba(15,76,129,0.08) 0 6px, rgba(255,255,255,0.9) 6px 12px)",
                      backgroundBlendMode: "multiply",
                    }}
                  >
                    <Image
                      src={selectedCollege.logo || selectedCollege.image}
                      alt={selectedCollege.name}
                      fill
                      sizes="56px"
                      className={selectedCollege.logo ? "object-contain p-2" : "object-cover"}
                    />
                  </div>
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-black text-xs font-semibold text-white">
                    VS
                  </span>
                  <div
                    className="relative h-14 w-14 overflow-hidden rounded-[1rem] border border-[rgba(15,76,129,0.16)] shadow-[0_10px_20px_rgba(22,50,79,0.1)]"
                    style={{
                      backgroundImage:
                        "linear-gradient(135deg, #e7edf6 0%, #ffffff 100%), repeating-linear-gradient(45deg, rgba(15,76,129,0.08) 0 6px, rgba(255,255,255,0.9) 6px 12px)",
                      backgroundBlendMode: "multiply",
                    }}
                  >
                    <Image
                      src={college.logo || college.image}
                      alt={college.name}
                      fill
                      sizes="56px"
                      className={college.logo ? "object-contain p-2" : "object-cover"}
                    />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                  <p className="line-clamp-2 text-sm font-semibold text-[color:var(--text-dark)]">
                    {selectedCollege.name}
                  </p>
                  <p className="line-clamp-2 text-sm font-semibold text-[color:var(--text-dark)]">
                    {college.name}
                  </p>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-[1rem] border border-[rgba(15,76,129,0.08)] bg-[rgba(15,76,129,0.03)] px-3 py-3 text-[12px] text-slate-600">
                    <p className="font-semibold text-[color:var(--text-dark)]">
                      {leftInfo.courseLabel}
                    </p>
                    <p className="mt-1 inline-flex items-center gap-1 text-[11.5px] text-slate-500">
                      <MapPin className="size-3" />
                      {selectedCollege.district}, {selectedCollege.state}
                    </p>
                    <p className="mt-2 text-[11.5px] font-semibold text-[color:var(--text-dark)]">
                      {leftInfo.rating} ★
                    </p>
                    <p className="mt-1 text-[11.5px] text-slate-600">
                      Fees: {leftInfo.fees}
                    </p>
                    <p className="text-[11.5px] text-slate-600">
                      Placement: {selectedCollege.placementRate}%
                    </p>
                  </div>
                  <div className="rounded-[1rem] border border-[rgba(15,76,129,0.08)] bg-[rgba(15,76,129,0.03)] px-3 py-3 text-[12px] text-slate-600">
                    <p className="font-semibold text-[color:var(--text-dark)]">
                      {rightInfo.courseLabel}
                    </p>
                    <p className="mt-1 inline-flex items-center gap-1 text-[11.5px] text-slate-500">
                      <MapPin className="size-3" />
                      {college.district}, {college.state}
                    </p>
                    <p className="mt-2 text-[11.5px] font-semibold text-[color:var(--text-dark)]">
                      {rightInfo.rating} ★
                    </p>
                    <p className="mt-1 text-[11.5px] text-slate-600">
                      Fees: {rightInfo.fees}
                    </p>
                    <p className="text-[11.5px] text-slate-600">
                      Placement: {college.placementRate}%
                    </p>
                  </div>
                </div>
              </button>
            );
            })}
          </div>
        </div>
      ) : null}

      {isFeedbackOpen ? (
        <div className="fixed inset-0 z-[1400] flex items-center justify-center bg-black/45 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-xl overflow-hidden rounded-[1.2rem] bg-white shadow-[0_30px_80px_rgba(4,12,26,0.25)]">
            <div className="flex items-center justify-between bg-[#00796B] px-5 py-3 text-white">
              <p className="text-sm font-semibold">Feedback</p>
              <button
                type="button"
                onClick={() => setIsFeedbackOpen(false)}
                className="rounded-full p-1 text-white/90 hover:bg-white/10"
                aria-label="Close feedback"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="px-5 py-6 text-center">
              <h3 className="text-lg font-bold text-[color:var(--text-dark)]">
                How would you rate this page?
              </h3>
              <p className="mt-1 text-sm text-[color:var(--text-muted)]">
                We will use this feedback to improve your experience.
              </p>

              <div className="mt-4 flex flex-col items-center gap-2">
                <div className="flex items-center gap-1 text-amber-400">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setSelectedRating(value)}
                      className="transition hover:scale-105"
                      aria-label={`Rate ${value}`}
                    >
                      <Star className={`size-7 ${selectedRating && value <= selectedRating ? "fill-current" : ""}`} />
                    </button>
                  ))}
                </div>
                <p className="text-sm font-semibold text-slate-600">
                  {selectedRating ? ratingLabels[selectedRating - 1] : "Select a rating"}
                </p>
              </div>

              <div className="mt-5 border-t border-slate-200 pt-4 text-left">
                <p className="text-sm text-[color:var(--text-muted)]">
                  Please provide your feedback so that we can improve your experience.
                </p>
                <textarea
                  rows={4}
                  value={feedbackText}
                  onChange={(event) => {
                    const next = event.target.value;
                    const words = next.trim() ? next.trim().split(/\s+/) : [];
                    if (words.length <= 50) {
                      setFeedbackText(next);
                      return;
                    }
                    setFeedbackText(words.slice(0, 50).join(" "));
                  }}
                  placeholder="Write here"
                  className="mt-3 w-full rounded-[0.75rem] border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[color:var(--brand-primary-soft)]"
                />
                <p className="mt-2 text-xs text-slate-500">{wordCount}/50 words</p>
              </div>

              <div className="mt-5 flex justify-center">
                {canSubmit ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitMessage("Submitted successfully.");
                      setFeedbackText("");
                      setSelectedRating(null);
                    }}
                    className="rounded-md bg-slate-400 px-6 py-2 text-sm font-semibold text-white transition hover:bg-slate-500"
                  >
                    Submit
                  </button>
                ) : null}
              </div>
              {submitMessage ? (
                <p className="mt-3 text-sm font-semibold text-emerald-600">{submitMessage}</p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
