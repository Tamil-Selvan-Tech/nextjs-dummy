"use client";

import { ArrowRight, CalendarDays, CheckCircle2, GraduationCap } from "lucide-react";
import Link from "next/link";

export type TopExamCardData = {
  id: string;
  name: string;
  href: string;
  mode: string;
  participatingColleges: string;
  examDate: string;
  examLevel: string;
  summary?: string;
  highlights?: string[];
};

export type TopExamCardVariant = "compact" | "detailed";

const EXAM_SHORT_LABEL_MAP: Record<string, string> = {
  "JEE Main": "JEE",
  "JEE Advanced": "ADV",
  CUET: "CUET",
  NEET: "NEET",
};

const formatExamDateLabel = (value: string) => {
  const raw = String(value || "").trim();
  if (!raw) return "";

  const shortDateMatch = raw.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (shortDateMatch) {
    return raw;
  }

  const slashDateMatch = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (slashDateMatch) {
    return `${slashDateMatch[1]}-${slashDateMatch[2]}-${slashDateMatch[3]}`;
  }

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return raw;
  const day = `${parsed.getDate()}`.padStart(2, "0");
  const month = `${parsed.getMonth() + 1}`.padStart(2, "0");
  const year = parsed.getFullYear();
  return `${day}-${month}-${year}`;
};

export function TopExamCard({
  exam,
  variant = "compact",
}: {
  exam: TopExamCardData;
  variant?: TopExamCardVariant;
}) {
  const isDetailed = variant === "detailed";
  const highlights = Array.isArray(exam.highlights) ? exam.highlights.slice(0, 3) : [];

  return (
    <Link
      href={exam.href}
      className={`group relative flex h-full w-full flex-col overflow-hidden rounded-[1.4rem] border border-[rgba(20,42,99,0.08)] text-left shadow-[0_8px_20px_rgba(20,42,99,0.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_14px_26px_rgba(20,42,99,0.09)] ${
        isDetailed
          ? "min-h-[18.25rem] bg-[linear-gradient(180deg,#ffffff,#f7f9ff)] px-3.5 py-3.5 sm:px-4 sm:py-4"
          : "min-h-[16.5rem] bg-white px-4 py-4"
      }`}
    >
      {isDetailed ? (
        <>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-[linear-gradient(90deg,#142a63,#3d5aa9,#0f1f52)]" />
          <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[rgba(61,90,169,0.08)] blur-3xl" />
        </>
      ) : null}

      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex rounded-full border border-[rgba(37,99,235,0.12)] bg-[rgba(37,99,235,0.05)] px-2.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.14em] text-[#2563eb]">
          Featured
        </span>
        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.12em] ${
          exam.mode.toLowerCase().includes("online")
            ? "bg-[rgba(34,197,94,0.12)] text-[#15803d]"
            : "bg-[rgba(15,23,42,0.08)] text-[#1e3a8a]"
        }`}>
          {exam.mode}
        </span>
      </div>

      <div className={`mt-3 flex min-w-0 items-start gap-3 ${isDetailed ? "sm:mt-3" : ""}`}>
        <span className={`inline-flex shrink-0 items-center justify-center rounded-[0.95rem] border border-[rgba(37,99,235,0.16)] bg-[linear-gradient(180deg,#f3f6ff,#eef2ff)] text-[0.82rem] font-bold tracking-[0.04em] text-[#1f2f5d] ${
          isDetailed ? "h-11 w-11" : "h-11 w-11"
        }`}>
          {EXAM_SHORT_LABEL_MAP[exam.name] || exam.name.slice(0, 4).toUpperCase()}
        </span>
        <div className="min-w-0 pt-0.5">
          <h3 className={`truncate type-title-medium text-[#0f1738] ${isDetailed ? "text-[1rem]" : ""}`}>
            {exam.name}
          </h3>
          <p className="mt-1 uppercase tracking-[0.12em] text-[10px] font-semibold text-[#7a86a8]">
            {exam.examLevel}
          </p>
        </div>
      </div>

      {isDetailed ? (
        <>
          {exam.summary ? (
            <p className="mt-2.5 text-[12px] leading-5 text-[color:var(--text-muted)]">
              {exam.summary}
            </p>
          ) : null}

          {highlights.length > 0 ? (
            <div className="mt-2.5 space-y-1.5">
              {highlights.map((highlight) => (
                <div key={highlight} className="flex items-start gap-2 text-[12px] leading-5 text-[#33456d]">
                  <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[rgba(37,99,235,0.1)] text-[#1d4ed8]">
                    <CheckCircle2 className="size-[0.68rem]" />
                  </span>
                  <span>{highlight}</span>
                </div>
              ))}
            </div>
          ) : null}

          <div className="mt-3 rounded-[1rem] border border-[rgba(20,42,99,0.08)] bg-white p-2.5 shadow-[0_10px_24px_rgba(20,42,99,0.05)]">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="grid gap-2 sm:grid-cols-2 flex-1">
                {[
                  { label: "Exam Date", value: formatExamDateLabel(exam.examDate), icon: CalendarDays },
                  { label: "Level", value: exam.examLevel, icon: GraduationCap },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="flex items-center gap-2 rounded-[0.85rem] border border-[rgba(20,42,99,0.08)] bg-[linear-gradient(180deg,#ffffff,#f8fbff)] px-2.5 py-[0.5625rem]"
                    >
                      <span className="inline-flex h-[1.625rem] w-[1.625rem] shrink-0 items-center justify-center rounded-[0.7rem] bg-[rgba(37,99,235,0.1)] text-[#1d4ed8]">
                        <Icon className="size-3.5" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[8px] font-semibold uppercase tracking-[0.12em] text-[#7a86a8]">
                          {item.label}
                        </p>
                        <p className="mt-0.5 truncate text-[12px] font-bold text-[#0f1738]">
                          {item.value}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-end sm:pl-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#3d5aa9,#142a63)] px-3.5 py-2 text-[12px] font-semibold text-white shadow-[0_12px_24px_rgba(20,42,99,0.22)] transition group-hover:translate-x-0.5 whitespace-nowrap">
                  View Details
                  <ArrowRight className="size-3.5" />
                </span>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="type-body-small mt-5 space-y-2.5 text-[color:var(--text-muted)]">
            <div className="flex items-center justify-between gap-3 border-b border-[rgba(15,76,129,0.08)] pb-2.5">
              <span>Colleges</span>
              <span className="type-label-bold text-[color:var(--text-dark)]">{exam.participatingColleges}</span>
            </div>
            <div className="flex items-center justify-between gap-3 border-b border-[rgba(15,76,129,0.08)] pb-2.5">
              <span>Exam Date</span>
              <span className="type-label-bold text-[color:var(--text-dark)]">{formatExamDateLabel(exam.examDate)}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span>Level</span>
              <span className="type-label-bold text-[color:var(--text-dark)]">{exam.examLevel}</span>
            </div>
          </div>
        </>
      )}

      {!isDetailed ? (
        <div className="mt-auto space-y-0.5 pt-5">
          <div className="type-label-bold flex items-center justify-between border-t border-[rgba(15,76,129,0.08)] pt-3 text-[#0f1738]">
            <span>Application Process</span>
            <ArrowRight className="size-4 text-[#1d4ed8] transition group-hover:translate-x-0.5" />
          </div>
          <div className="type-label-bold flex items-center justify-between pt-2 text-[#0f1738]">
            <span>Exam Info</span>
            <ArrowRight className="size-4 text-[#1d4ed8] transition group-hover:translate-x-0.5" />
          </div>
        </div>
      ) : null}
    </Link>
  );
}
