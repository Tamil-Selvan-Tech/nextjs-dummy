import Link from "next/link";
import type { PublicExamSchedule } from "@/lib/public-data";

type ExamScheduleCardProps = {
  exam: PublicExamSchedule;
  href?: string;
  title?: string;
  subtitle?: string;
  showTopBadge?: boolean;
};

const formatExamDateLabel = (value: string) => {
  const raw = String(value || "").trim();
  if (!raw) return "To be announced";

  const shortDateMatch = raw.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (shortDateMatch) {
    return raw;
  }

  const slashDateMatch = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (slashDateMatch) {
    return `${slashDateMatch[1]}-${slashDateMatch[2]}-${slashDateMatch[3]}`;
  }

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return raw || "To be announced";
  const day = `${parsed.getDate()}`.padStart(2, "0");
  const month = `${parsed.getMonth() + 1}`.padStart(2, "0");
  const year = parsed.getFullYear();
  return `${day}-${month}-${year}`;
};

const ExamScheduleCardInner = ({ exam, title, subtitle, showTopBadge }: ExamScheduleCardProps) => (
  <article className="group relative flex h-full min-h-[14.5rem] flex-col overflow-hidden rounded-[1.35rem] border border-[rgba(20,42,99,0.08)] bg-[linear-gradient(180deg,#ffffff,#f7f9ff)] px-4 py-4 shadow-[0_10px_24px_rgba(20,42,99,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_30px_rgba(20,42,99,0.1)] sm:px-4 sm:py-4">
    <div className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-[linear-gradient(90deg,#142a63,#3d5aa9,#8b5cf6)]" />
    <div className="flex items-start justify-between gap-3">
      <span className="inline-flex rounded-full border border-[rgba(37,99,235,0.12)] bg-[rgba(37,99,235,0.05)] px-2.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.14em] text-[#2563eb]">
        Exam Schedule
      </span>
      {showTopBadge ? (
        <span className="inline-flex rounded-full bg-[rgba(16,185,129,0.12)] px-2.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-emerald-700">
          Top Exam
        </span>
      ) : (
        <span className="inline-flex rounded-full bg-[rgba(15,23,42,0.06)] px-2.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-[#1e3a8a]">
          Live Update
        </span>
      )}
    </div>

    <div className="mt-3 flex min-w-0 items-start gap-3">
      <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[0.95rem] border border-[rgba(37,99,235,0.14)] bg-[linear-gradient(180deg,#f3f6ff,#eef2ff)] text-[0.78rem] font-bold tracking-[0.04em] text-[#1f2f5d]">
        {String(exam.examName || "EXAM")
          .slice(0, 4)
          .toUpperCase()}
      </span>
      <div className="min-w-0">
        <h3 className="truncate text-[1rem] font-bold tracking-[-0.02em] text-[#0f1738]">
          {title || exam.examName || "Exam"}
        </h3>
        <p className="mt-1 text-[11px] leading-4 text-[color:var(--text-muted)]">
          {subtitle || "Important dates, fees, and schedule details updated by admin."}
        </p>
      </div>
    </div>

    <div className="mt-3 grid gap-2 sm:grid-cols-2">
      <div className="rounded-[0.95rem] border border-[rgba(20,42,99,0.08)] bg-white px-3 py-2.5">
        <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#7a86a8]">
          Application Fees
        </p>
        <p className="mt-1 text-sm font-bold text-[#0f1738]">
          {exam.applicationFees || "-"}
        </p>
      </div>
      <div className="rounded-[0.95rem] border border-[rgba(20,42,99,0.08)] bg-white px-3 py-2.5">
        <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#7a86a8]">
          Exam Date
        </p>
        <p className="mt-1 text-sm font-bold text-[#0f1738]">
          {formatExamDateLabel(exam.examDate)}
        </p>
      </div>
    </div>

    <div className="mt-2 flex flex-wrap gap-2">
      {exam.startDateToApply ? (
        <span className="rounded-full bg-[rgba(37,99,235,0.06)] px-2.5 py-1 text-[11px] font-semibold text-[#1d4ed8]">
          Starts {formatExamDateLabel(exam.startDateToApply)}
        </span>
      ) : null}
      {exam.lastDateToApply ? (
        <span className="rounded-full bg-[rgba(59,130,246,0.06)] px-2.5 py-1 text-[11px] font-semibold text-[#1d4ed8]">
          Apply till {formatExamDateLabel(exam.lastDateToApply)}
        </span>
      ) : null}
      {exam.resultDate ? (
        <span className="rounded-full bg-[rgba(15,23,42,0.05)] px-2.5 py-1 text-[11px] font-semibold text-[#33456d]">
          Result {formatExamDateLabel(exam.resultDate)}
        </span>
      ) : null}
    </div>

    <div className="mt-auto flex items-center justify-between gap-3 border-t border-[rgba(15,76,129,0.08)] pt-3">
      <p className="text-[11px] text-[color:var(--text-muted)]">
        {exam.correctionDate || exam.admitCardRelease
          ? "Correction and admit-card dates are also available."
          : "Clean schedule view with the latest admin updates."}
      </p>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[linear-gradient(135deg,#3d5aa9,#142a63)] px-3 py-1.5 text-[11px] font-semibold text-white">
        {showTopBadge ? "Featured" : "Open"}
        <span aria-hidden="true">→</span>
      </span>
    </div>
  </article>
);

export function ExamScheduleCard(props: ExamScheduleCardProps) {
  if (!props.href) {
    return <ExamScheduleCardInner {...props} />;
  }

  return (
    <Link href={props.href} className="block h-full">
      <ExamScheduleCardInner {...props} />
    </Link>
  );
}
