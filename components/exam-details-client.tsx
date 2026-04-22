"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  Atom,
  ArrowUp,
  BookOpenText,
  Building2,
  CalendarDays,
  ChevronRight,
  Download,
  ExternalLink,
  FileText,
  FlaskConical,
  Landmark,
  MonitorSmartphone,
  Home,
  Info,
  ListChecks,
  RefreshCcw,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import type {
  ExamDateRow,
  ExamDetails,
  ExamEligibilityRow,
  ExamStudyLink,
  ExamScoreCalculation,
  ExamSection,
  ExamTableRow,
} from "@/lib/exam-content";

type ExamDetailsClientProps = {
  details: ExamDetails;
  allExams: ExamDetails[];
};

type DisplayTab = {
  id: string;
  label: string;
  sectionId: ExamSection["id"];
};

type OverviewPalette = {
  accent: string;
  soft: string;
  ring: string;
};

const displayTabs: DisplayTab[] = [
  { id: "overview", label: "Overview", sectionId: "overview" },
  { id: "exam-pattern", label: "Exam Pattern", sectionId: "exam-pattern" },
  { id: "question-papers", label: "Question Papers", sectionId: "question-paper" },
  { id: "prep", label: "Preparation Tips", sectionId: "preparation" },
  { id: "registration", label: "Registration", sectionId: "registration" },
];

const overviewPalettes: OverviewPalette[] = [
  { accent: "#0f7db5", soft: "#d9f1fb", ring: "#0f7db5" },
  { accent: "#1aa6b7", soft: "#d8f6f7", ring: "#1aa6b7" },
  { accent: "#8bc21a", soft: "#edf8d1", ring: "#8bc21a" },
  { accent: "#c8c615", soft: "#f8f7cc", ring: "#c8c615" },
  { accent: "#ea9721", soft: "#fce8c8", ring: "#ea9721" },
  { accent: "#df5c4a", soft: "#fbe0db", ring: "#df5c4a" },
];

const highlightTerms = [
  "JEE Advanced",
  "JEE Main",
  "CUET UG",
  "CUET",
  "NEET UG",
  "NEET",
  "IIT Roorkee",
  "National Testing Agency",
  "NTA",
  "Computer-Based Test (CBT)",
  "CBT Mode",
  "CBT",
  "MCQ Questions",
  "MCQs",
  "MCQ",
  "Section 1",
  "Section 2",
  "Section 3",
  "Language Section",
  "Domain Subjects",
  "General Test",
  "Physics",
  "Chemistry",
  "Mathematics",
  "Biology",
  "Paper 1",
  "Paper 2",
  "Class 12",
  "NCERT",
  "+5",
  "-1",
  "250 marks",
  "1250 marks",
];

const highlightPattern = new RegExp(`(${highlightTerms.sort((a, b) => b.length - a.length).map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");

function buildHeroTitle(details: ExamDetails) {
  const examName = details.title.replace(/\s+\d{4}$/, "");
  return `${examName} 2026: Exam Date, Registration, Syllabus, Previous Year Papers and Mock Test`;
}

function getSection(details: ExamDetails, sectionId: ExamSection["id"]) {
  return details.sections.find((section) => section.id === sectionId) ?? details.sections[0];
}

function getOverviewPalette(index: number) {
  return overviewPalettes[index % overviewPalettes.length];
}

function getOverviewIcon(title: string) {
  const normalized = title.toLowerCase();

  if (normalized.includes("conducting") || normalized.includes("authority")) {
    return Building2;
  }

  if (normalized.includes("mode")) {
    return MonitorSmartphone;
  }

  if (normalized.includes("date")) {
    return CalendarDays;
  }

  if (normalized.includes("paper")) {
    return BookOpenText;
  }

  if (normalized.includes("subject")) {
    return FlaskConical;
  }

  if (normalized.includes("attempt")) {
    return RefreshCcw;
  }

  if (normalized.includes("section")) {
    return ListChecks;
  }

  return Atom;
}

function normalizeExamMetaLabel(value: string) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function getExamApplicationFee(details: ExamDetails) {
  if (String(details.applicationFees || "").trim()) {
    return String(details.applicationFees || "").trim();
  }

  const rows: Array<{ label: string; value: string }> = [
    ...details.highlightsTable.map((row) => ({ label: row.label, value: row.value })),
    ...details.overviewCards.map((row) => ({ label: row.title, value: row.value })),
    ...details.sections.flatMap((section) => [
      ...(section.tableRows || []).map((row) => ({ label: row.key, value: row.value })),
      ...(section.secondaryTableRows || []).map((row) => ({ label: row.key, value: row.value })),
      ...(section.tertiaryTableRows || []).map((row) => ({ label: row.key, value: row.value })),
    ]),
  ];

  return (
    rows.find((row) =>
      ["application fee", "application fees", "registration fee", "registration fees"].some(
        (keyword) => normalizeExamMetaLabel(row.label).includes(keyword),
      ),
    )?.value || ""
  );
}

function renderHighlightedText(text: string): ReactNode {
  const parts = text.split(highlightPattern);

  return (
    <>
      {parts.map((part, index) =>
        highlightTerms.some((term) => term.toLowerCase() === part.toLowerCase()) ? (
          <span key={`${part}-${index}`} className="font-bold text-[#111827]">
            {part}
          </span>
        ) : (
          <span key={`${part}-${index}`}>{part}</span>
        ),
      )}
    </>
  );
}

function StudyLinkGrid({
  title,
  summary,
  links,
  accentClass,
}: {
  title: string;
  summary: string;
  links: ExamStudyLink[];
  accentClass: string;
}) {
  return (
    <section className="rounded-[1.8rem] border border-[#edf1f6] bg-[linear-gradient(135deg,#f8fbff_0%,#fff8ef_100%)] p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${accentClass}`}>Official Resource Hub</p>
          <h3 className="mt-2 text-[1.5rem] font-bold tracking-[-0.03em] text-[#172033]">{title}</h3>
          <p className="mt-3 max-w-3xl text-[0.98rem] leading-7 text-[#526071]">{summary}</p>
        </div>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noreferrer"
            className="group rounded-[1.4rem] border border-[#dbe6f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:border-[#bfd4f5] hover:shadow-[0_16px_34px_rgba(15,23,42,0.08)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#2f6edb]">
                <ExternalLink className="size-5" />
              </div>
              {link.meta ? (
                <span className="rounded-full bg-[#fff4e8] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#b45309]">
                  {link.meta}
                </span>
              ) : null}
            </div>
            <h4 className="mt-4 text-[1.02rem] font-bold leading-7 text-[#172033]">{link.label}</h4>
            <p className="mt-2 text-sm leading-6 text-[#607086]">{link.note}</p>
            <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#2f6edb]">
              Open official link
              <ChevronRight className="size-4 transition group-hover:translate-x-0.5" />
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

function PreparationInfographic({
  title,
  items,
}: {
  title: string;
  items: NonNullable<ExamSection["preparationVisualItems"]>;
}) {
  const icons = [BookOpenText, CalendarDays, Atom, FileText, RefreshCcw];
  const badgeColors = ["bg-[#ff8a00]", "bg-[#f59e0b]", "bg-[#c2410c]", "bg-[#2563eb]", "bg-[#0ea5e9]"];

  return (
    <section className="overflow-hidden rounded-[2rem] border border-[#f1d4bd] bg-white">
      <div className="bg-[linear-gradient(90deg,#bf4d00_0%,#d66609_100%)] px-6 py-5 text-center">
        <h3 className="text-[2rem] font-bold tracking-[-0.03em] text-white">{title}</h3>
      </div>
      <div className="grid gap-6 px-6 py-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-center">
        <div className="relative mx-auto flex h-[240px] w-[240px] items-center justify-center rounded-full border-2 border-dashed border-[#26364d]">
          <div className="flex h-[168px] w-[168px] items-center justify-center rounded-full bg-[radial-gradient(circle_at_center,#ffe6d4_0%,#fff4eb_70%,#ffffff_100%)] text-center shadow-[inset_0_0_0_10px_rgba(255,255,255,0.92)]">
            <div>
              <p className="text-[1rem] font-medium uppercase tracking-[0.08em] text-[#6b7280]">{title.replace(" Preparation Tips", "")}</p>
              <p className="mt-1 text-[1.05rem] font-black uppercase leading-none text-[#f97316]">Preparation Tips</p>
            </div>
          </div>
          {items.slice(0, 5).map((item, index) => {
            const angle = [-90, -25, 10, 50, 125][index] ?? 0;
            const radius = 120;
            const x = Math.cos((angle * Math.PI) / 180) * radius;
            const y = Math.sin((angle * Math.PI) / 180) * radius;
            const Icon = icons[index] ?? BookOpenText;

            return (
              <div
                key={item.title}
                className={`absolute flex h-11 w-11 items-center justify-center rounded-full text-white shadow-lg ${badgeColors[index] ?? "bg-[#f97316]"}`}
                style={{ transform: `translate(${x}px, ${y}px)` }}
              >
                <Icon className="size-5" />
              </div>
            );
          })}
        </div>

        <div className="space-y-5">
          {items.map((item, index) => (
            <div key={item.title} className="rounded-[1.35rem] border border-[#eef2f7] bg-[#fcfdff] px-5 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
              <div className="flex items-start gap-4">
                <div className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${badgeColors[index] ?? "bg-[#f97316]"}`}>
                  {index + 1}
                </div>
                <div>
                  <h4 className="text-[1.08rem] font-bold leading-8 text-[#172033]">{item.title}</h4>
                  <p className="mt-1.5 text-[0.95rem] leading-7 text-[#556274]">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function RoutineTable({
  title,
  columns,
  rows,
}: {
  title: string;
  columns: [string, string, string];
  rows: NonNullable<ExamSection["routineTableRows"]>;
}) {
  return (
    <section className="mt-8 overflow-hidden rounded-[2rem] border border-[#dbe5f5] bg-white shadow-[0_18px_44px_rgba(15,23,42,0.08)]">
      <div className="bg-[linear-gradient(90deg,#eff6ff_0%,#fff7ed_100%)] px-6 py-5">
        <h3 className="text-[1.6rem] font-bold tracking-[-0.03em] text-[#172033]">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[900px]">
          <div className="grid grid-cols-[180px_minmax(300px,1.2fr)_minmax(320px,1fr)] bg-[#dfeafe] text-sm font-semibold text-[#172033]">
            <div className="border-r border-[#cfe0ff] px-5 py-4">{columns[0]}</div>
            <div className="border-r border-[#cfe0ff] px-5 py-4">{columns[1]}</div>
            <div className="px-5 py-4">{columns[2]}</div>
          </div>
          {rows.map((row) => (
            <div
              key={`${row.time}-${row.activity}`}
              className="grid grid-cols-[180px_minmax(300px,1.2fr)_minmax(320px,1fr)] border-t border-[#e5edf8] text-sm text-[#425066]"
            >
              <div className="border-r border-[#e5edf8] bg-[#fbfdff] px-5 py-4 font-semibold text-[#172033]">{row.time}</div>
              <div className="border-r border-[#e5edf8] px-5 py-4 leading-7">{row.activity}</div>
              <div className="px-5 py-4 leading-7">{row.notes}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function GovernmentPortalHeader({ details }: { details: ExamDetails }) {
  const examName = details.title.replace(/\s+\d{4}$/, "");
  const paperLabel = details.coursesOffered.split("/")[0]?.trim() || "Paper";

  return (
    <section className="overflow-hidden rounded-[1.6rem] border border-[#d8dde5] bg-white">
      <div className="grid gap-4 border-b border-[#d8dde5] px-4 py-4 md:grid-cols-[minmax(260px,0.9fr)_minmax(0,1.2fr)] md:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-[#d7dbe2] bg-[#f7f7f7] text-[#5c6573]">
            <Landmark className="size-9" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-xs font-medium text-[#5f6774]">उच्च शिक्षा विभाग</p>
            <p className="text-[1.45rem] font-bold leading-tight text-[#172033]">Department of Higher Education</p>
          </div>
        </div>

        <div className="text-left md:text-center">
          <a
            href={details.officialSite}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-[1.6rem] font-bold leading-tight text-[#111827] hover:text-[#0f3b82]"
          >
            <span>{examName}</span>
            <ExternalLink className="size-4" />
          </a>
          <p className="mt-1 text-[1rem] font-medium text-[#253b66]">{examName}</p>
        </div>
      </div>

      <div className="border-b border-[#d8dde5] bg-[#123a7a] text-white">
        <div className="flex flex-wrap items-stretch text-[0.96rem] font-medium">
          {[
            { label: "Home", active: true },
            { label: "About Us", dropdown: true },
            { label: "Information", dropdown: true },
            { label: "FAQ" },
            { label: "Question Papers", dropdown: true, active: true },
            { label: "Candidates' Corner", dropdown: true },
            { label: "Archive", dropdown: true },
            { label: "Contact Us" },
          ].map((item) => (
            <div
              key={item.label}
              className={`flex items-center gap-1 border-r border-[#d8dde533] px-4 py-3 ${
                item.active ? "bg-[#f5a623] text-[#172033]" : ""
              }`}
            >
              <span>{item.label}</span>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-[180px_minmax(250px,1fr)_minmax(0,1.4fr)]">
          <div className="border-r border-white/30 bg-[#123a7a] px-4 py-4 text-[1.05rem] font-bold uppercase tracking-[0.04em]">
            Latest News
          </div>
          <div className="border-r border-[#d08a12] bg-[#f5a623] text-[#172033]">
            <div className="border-b border-[#d08a12] px-4 py-3 font-semibold">{paperLabel} {details.date} Paper 1</div>
            <div className="px-4 py-3 font-semibold">{paperLabel} {details.date} Paper 2</div>
          </div>
          <div className="overflow-hidden bg-[#123a7a] px-4 py-3 text-[0.98rem] font-medium text-white/95">
            <div className="marquee-track" aria-live="polite">
              {[0, 1].map((index) => (
                <span key={`${examName}-notice-${index}`} className="marquee-item mr-10">
                  {examName} 2026 updates and official notices are available on the portal.
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-3 text-sm italic">
        <span className="font-semibold text-[#d62828]">Source: </span>
        <a href={details.officialSite} target="_blank" rel="noreferrer" className="text-[#2563eb] hover:underline">
          {examName} Official Website
        </a>
      </div>
    </section>
  );
}

function TableSection({
  title,
  columns,
  rows,
}: {
  title: string;
  columns: [string, string];
  rows: { key: string; value: string }[];
}) {
  return (
    <section className="rounded-[1.8rem] bg-white p-7 shadow-[0_18px_44px_rgba(15,23,42,0.08)]">
      <h3 className="text-[2rem] font-bold tracking-[-0.03em] text-[#172033]">{title}</h3>
      <div className="mt-5 overflow-hidden rounded-[1.35rem] border border-[#cfe0ff]">
        <div className="grid grid-cols-2 bg-[#dfeafe] text-base font-semibold text-[#172033]">
          <div className="border-r border-[#cfe0ff] px-5 py-4">{columns[0]}</div>
          <div className="px-5 py-4">{columns[1]}</div>
        </div>
        {rows.map((row) => (
          <div key={`${row.key}-${row.value}`} className="grid grid-cols-2 border-t border-[#dbe5f5] bg-white text-[1rem] text-[#425066]">
            <div className="border-r border-[#dbe5f5] px-5 py-4 font-medium">{renderHighlightedText(row.key)}</div>
            <div className="px-5 py-4">{renderHighlightedText(row.value)}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function getBlockStyles(variant?: "default" | "highlight") {
  if (variant === "highlight") {
    return {
      sectionClass:
        "rounded-[1.5rem] border border-[#fed7aa] bg-[linear-gradient(135deg,#fff7d6,#fff1e6)] p-5 shadow-[0_18px_36px_rgba(245,158,11,0.14)]",
      titleClass: "text-[1.2rem] font-semibold text-[#9a3412]",
      itemClass:
        "rounded-[1.1rem] border border-[#fdba74] bg-white/80 px-4 py-3 text-[0.97rem] leading-7 text-[#7c2d12] shadow-[0_8px_24px_rgba(245,158,11,0.12)] backdrop-blur-sm",
      listClass: "mt-4 list-disc space-y-3 pl-7 text-[0.99rem] leading-8 text-[#7c2d12]",
    };
  }

  return {
    sectionClass: "rounded-[1.5rem] border border-[#edf1f6] bg-[#fcfdff] p-5",
    titleClass: "text-[1.2rem] font-semibold text-[#1f2937]",
    itemClass: "rounded-[1.1rem] bg-white px-4 py-3 text-[0.97rem] leading-7 text-[#526071] shadow-[0_6px_20px_rgba(15,23,42,0.04)]",
    listClass: "mt-4 list-disc space-y-3 pl-7 text-[0.99rem] leading-8 text-[#526071]",
  };
}

function ScoreCalculationSection({ calculation }: { calculation: ExamScoreCalculation }) {
  return (
    <section className="rounded-[1.8rem] bg-white p-7 shadow-[0_18px_44px_rgba(15,23,42,0.08)]">
      <h3 className="text-[2rem] font-bold tracking-[-0.03em] text-[#172033]">{calculation.title}</h3>
      <p className="mt-5 text-[1rem] leading-8 text-[#425066]">{renderHighlightedText(calculation.description)}</p>
      <p className="mt-5 text-[1.05rem] font-bold italic leading-9 text-[#ff1f10]">{renderHighlightedText(calculation.highlight)}</p>

      <div className="mt-7">
        <p className="text-[1.1rem] font-bold text-[#172033]">{calculation.formulaLabel}</p>
        <div className="mt-4 rounded-[1rem] border border-[#cfe0ff] bg-white px-5 py-4 text-center text-[1.15rem] font-medium text-[#ff1f10]">
          {renderHighlightedText(calculation.formula)}
        </div>
      </div>

      <div className="mt-7">
        <p className="text-[1.8rem] font-bold italic text-[#374151]">{calculation.exampleLabel}</p>
        <div className="mt-4 overflow-hidden rounded-[1.35rem] border border-[#cfe0ff]">
          <div className="grid grid-cols-2 bg-[#dfeafe] text-base font-semibold text-[#172033]">
            <div className="border-r border-[#cfe0ff] px-5 py-4">Parameter</div>
            <div className="px-5 py-4">Example Value</div>
          </div>
          {calculation.exampleRows.map((row) => (
            <div key={`${row.label}-${row.value}`} className="grid grid-cols-2 border-t border-[#dbe5f5] bg-white text-[1rem] text-[#425066]">
              <div className="border-r border-[#dbe5f5] px-5 py-4 font-medium">{renderHighlightedText(row.label)}</div>
              <div className="px-5 py-4">{renderHighlightedText(row.value)}</div>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-7 text-[1.05rem] font-bold italic leading-9 text-[#ff1f10]">{renderHighlightedText(calculation.footer)}</p>
    </section>
  );
}

function renderOverviewTables(details: ExamDetails) {
  const highlightRows = details.highlightsTable.map((row: ExamTableRow) => ({
    key: row.label,
    value: row.value,
  }));
  const dateRows = details.importantDatesTable.map((row: ExamDateRow) => ({
    key: row.date,
    value: row.event,
  }));
  const eligibilityRows = (details.eligibilityTable ?? []).map((row: ExamEligibilityRow) => ({
    key: row.criteria,
    value: row.eligibility,
  }));

  return (
    <>
      <TableSection title={`${details.title.replace(/\s+\d{4}$/, "")} 2026 Highlights`} columns={["Particulars", "Details"]} rows={highlightRows} />
      <OverviewInfographic details={details} />
      <TableSection title="Important Dates" columns={["Date (Timeline)", "Event"]} rows={dateRows} />
      {eligibilityRows.length ? (
        <TableSection
          title={`${details.title.replace(/\s+\d{4}$/, "")} Eligibility Criteria`}
          columns={["Criteria", "Eligibility"]}
          rows={eligibilityRows}
        />
      ) : null}
      {details.scoreCalculation ? <ScoreCalculationSection calculation={details.scoreCalculation} /> : null}
    </>
  );
}

function OverviewInfographic({ details }: { details: ExamDetails }) {
  const examName = details.title.replace(/\s+\d{4}$/, "");
  const orbitPositions = [
    { top: "10%", left: "50%" },
    { top: "27%", left: "80%" },
    { top: "64%", left: "80%" },
    { top: "87%", left: "50%" },
    { top: "64%", left: "20%" },
    { top: "27%", left: "20%" },
  ];

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-[#f4d6c4] bg-[radial-gradient(circle_at_top,#fffdf9_0%,#fff3ea_52%,#fffaf5_100%)] p-5 shadow-[0_24px_60px_rgba(223,92,74,0.08)] md:p-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_22%,rgba(251,146,60,0.14),transparent_22%),radial-gradient(circle_at_82%_30%,rgba(249,115,22,0.12),transparent_20%),radial-gradient(circle_at_55%_82%,rgba(245,158,11,0.1),transparent_18%)] opacity-70" />
      <h3 className="text-center text-[1.55rem] font-bold tracking-[-0.03em] text-[#172033] md:text-[2.1rem]">
        {examName} 2026 Overview
      </h3>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.12fr)_minmax(340px,0.88fr)] xl:items-center">
        <div className="relative mx-auto hidden aspect-square w-full max-w-[560px] xl:block">
          <div className="absolute inset-[12%] rounded-full border border-[#f7d2bb] bg-[radial-gradient(circle,#fffaf6_0%,#fff1e7_68%,transparent_70%)] shadow-[0_0_70px_rgba(245,158,11,0.12)]" />
          <div className="absolute inset-[24%] rounded-full border border-[#f3cbb1]/80" />
          <div className="absolute inset-[36%] rounded-full border border-[#f3cbb1]/60" />

          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" aria-hidden="true">
            <circle cx="50" cy="50" r="37" fill="none" stroke="#f3c4a8" strokeWidth="0.35" strokeDasharray="1.5 2.6" />
            <circle cx="50" cy="50" r="26" fill="none" stroke="#f6d7c5" strokeWidth="0.3" strokeDasharray="1.2 2.2" />
            {details.overviewCards.slice(0, 6).map((card, index) => {
              const position = orbitPositions[index];

              return (
                <path
                  key={`${card.title}-path`}
                  d={`M 50 50 Q ${(Number.parseFloat(position.left) + 50) / 2} ${(Number.parseFloat(position.top) + 50) / 2 - 6} ${position.left.replace("%", "")} ${position.top.replace("%", "")}`}
                  fill="none"
                  stroke={getOverviewPalette(index).accent}
                  strokeWidth="0.5"
                  strokeLinecap="round"
                  opacity="0.6"
                />
              );
            })}
          </svg>

          <div className="absolute left-1/2 top-1/2 flex h-[180px] w-[180px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-[linear-gradient(145deg,rgba(255,255,255,0.82),rgba(255,232,214,0.7))] text-center shadow-[0_0_0_10px_rgba(255,255,255,0.35),0_24px_60px_rgba(248,146,32,0.18),inset_0_0_30px_rgba(255,255,255,0.7)] backdrop-blur-xl">
            <div className="absolute inset-4 rounded-full border border-[#ffd7be]/80" />
            <div>
              <p className="text-[0.82rem] font-semibold uppercase tracking-[0.3em] text-[#f08b33]">Overview</p>
              <p className="mt-2 px-5 text-[1.6rem] font-bold leading-tight tracking-[-0.04em] text-[#172033]">
                {details.title.replace(/\s+2026$/, "")}
              </p>
            </div>
          </div>

          {details.overviewCards.slice(0, 6).map((card, index) => {
            const palette = getOverviewPalette(index);
            const Icon = getOverviewIcon(card.title);

            return (
              <div
                key={`${card.title}-${card.value}-orbit`}
                className="absolute flex h-[98px] w-[98px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-[linear-gradient(145deg,rgba(255,255,255,0.88),rgba(255,243,234,0.68))] shadow-[0_0_0_8px_rgba(255,255,255,0.32),0_18px_34px_rgba(15,23,42,0.14)] backdrop-blur-xl"
                style={{
                  top: orbitPositions[index].top,
                  left: orbitPositions[index].left,
                  boxShadow: `0 0 0 8px rgba(255,255,255,0.32), 0 0 30px ${palette.accent}30, 0 18px 34px rgba(15,23,42,0.14)`,
                }}
              >
                <div
                  className="flex h-[66px] w-[66px] items-center justify-center rounded-full border text-center"
                  style={{ borderColor: `${palette.accent}66`, background: `linear-gradient(145deg, ${palette.soft}, #ffffff)` }}
                >
                  <div className="flex flex-col items-center gap-1">
                    <Icon className="size-4" style={{ color: palette.accent }} />
                    <span className="text-xs font-bold" style={{ color: palette.accent }}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-3">
          {details.overviewCards.map((card, index) => {
            const palette = getOverviewPalette(index);
            const Icon = getOverviewIcon(card.title);

            return (
              <div key={`${card.title}-${card.value}`} className="flex items-start gap-3 md:gap-4">
                <div className="flex shrink-0 items-center gap-3">
                  <div
                    className="relative flex h-10 w-10 items-center justify-center rounded-full border-[3px] bg-white text-base font-bold shadow-[0_10px_24px_rgba(15,23,42,0.12)]"
                    style={{ color: palette.accent, borderColor: palette.ring }}
                  >
                    <Icon className="size-3.5" />
                  </div>
                  <div className="hidden h-[2px] w-9 rounded-full md:block" style={{ backgroundColor: palette.accent }} />
                </div>
                <div
                  className="min-w-0 flex-1 rounded-[1.2rem] border border-white/60 px-4 py-2.5 shadow-[0_14px_36px_rgba(15,23,42,0.06)] backdrop-blur-xl"
                  style={{
                    background: `linear-gradient(135deg, ${palette.soft}cc 0%, rgba(255,255,255,0.72) 100%)`,
                    borderColor: `${palette.accent}33`,
                    boxShadow: `0 10px 28px rgba(15,23,42,0.06), 0 0 22px ${palette.accent}14`,
                  }}
                >
                  <p className="text-[1rem] font-bold leading-5 text-[#172033]">{card.title}</p>
                  <p className="mt-0.5 text-[0.92rem] leading-5 text-[#425066]">{card.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function OverviewContent({ details, section }: { details: ExamDetails; section: ExamSection }) {
  return (
    <article className="rounded-[2rem] bg-white p-7 shadow-[0_18px_44px_rgba(15,23,42,0.08)]">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#ff6b00]">{section.eyebrow}</p>
      <h2 className="mt-3 text-[2rem] font-bold leading-tight tracking-[-0.03em] text-[#172033]">{section.title}</h2>
      <p className="mt-4 text-[1.02rem] leading-8 text-[#5a6678]">{renderHighlightedText(section.summary)}</p>

      {section.highlights?.length ? (
        <div className="mt-6 space-y-4 text-[1rem] leading-8 text-[#526071]">
          {section.highlights.map((item) => (
            <p key={item}>{renderHighlightedText(item)}</p>
          ))}
        </div>
      ) : null}

      <section className="mt-8 rounded-[1.8rem] border border-[#edf1f6] bg-[#fcfdff] p-6">
        <h3 className="text-[1.5rem] font-bold tracking-[-0.03em] text-[#172033]">Key Summary</h3>
        <div className="mt-4 space-y-4 text-[1rem] leading-8 text-[#4d5b6c]">
          {details.keySummary.map((item) => (
            <p key={item}>{renderHighlightedText(item)}</p>
          ))}
        </div>
      </section>

      <div className="mt-8">
        <GovernmentPortalHeader details={details} />
      </div>

      <section className="mt-8 rounded-[1.8rem] border border-[#edf1f6] bg-[#f7fbff] p-6">
        <h3 className="text-[1.7rem] font-bold tracking-[-0.03em] text-[#172033]">{details.aboutTitle}</h3>
        <div className="mt-4 space-y-4 text-[1rem] leading-8 text-[#516071]">
          {details.aboutParagraphs.map((paragraph) => (
            <p key={paragraph}>{renderHighlightedText(paragraph)}</p>
          ))}
        </div>
      </section>
      <div className="mt-8 space-y-8">{renderOverviewTables(details)}</div>

      {details.relatedArticles?.length ? (
        <section className="mt-8 rounded-[1.8rem] border border-[#edf1f6] bg-[#fffdf9] p-6">
          <h3 className="text-[1.5rem] font-bold tracking-[-0.03em] text-[#172033]">Related Articles</h3>
          <div className="mt-4 space-y-3">
            {details.relatedArticles.map((article) => (
                <div key={article} className="rounded-[1.2rem] bg-white px-4 py-3 text-[0.98rem] font-medium text-[#2f6edb] shadow-[0_6px_20px_rgba(15,23,42,0.04)]">
                {renderHighlightedText(article)}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {details.relatedQuestions?.length ? (
        <section className="mt-8 rounded-[1.8rem] border border-[#edf1f6] bg-[#fcfdff] p-6">
          <h3 className="text-[1.5rem] font-bold tracking-[-0.03em] text-[#172033]">Important Questions</h3>
          <div className="mt-4 space-y-3">
            {details.relatedQuestions.map((question) => (
                <div key={question} className="rounded-[1.2rem] border border-[#e7edf5] bg-white px-4 py-3 text-[0.98rem] leading-7 text-[#425066]">
                {renderHighlightedText(question)}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {section.id !== "overview" && section.blocks?.length ? (
        <div className="mt-8 space-y-4">
          {section.blocks.map((block) => {
            const styles = getBlockStyles(block.variant);

            return (
            <section key={block.title} className={styles.sectionClass}>
              <h3 className={styles.titleClass}>{block.title}</h3>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {block.items.map((item) => (
                  <div key={item} className={styles.itemClass}>
                    {renderHighlightedText(item)}
                  </div>
                ))}
              </div>
            </section>
          )})}
        </div>
      ) : null}

      {section.id !== "overview" && section.resources?.length ? (
        <section className="mt-8 rounded-[1.7rem] border border-[#edf1f6] bg-[linear-gradient(135deg,#f5f9ff,#fff7ee)] p-5">
          <h3 className="text-[1.2rem] font-bold text-[#172033]">Refer Links</h3>
          <div className="mt-4 grid gap-3">
            {section.resources.map((resource) => (
              <a
                key={resource.label}
                href={resource.href}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between gap-3 rounded-[1.2rem] border border-[#e4edf9] bg-white px-4 py-3 transition hover:border-[#c8daf7]"
              >
                <div>
                  <p className="text-sm font-semibold text-[#172033]">{resource.label}</p>
                  <p className="mt-1 text-xs text-[#718096]">{resource.note}</p>
                </div>
                <ChevronRight className="size-4 text-[#2f6edb]" />
              </a>
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}

function GenericSectionContent({ section, details }: { section: ExamSection; details: ExamDetails }) {
  const isExamPattern = section.id === "exam-pattern";
  const isRegistration = section.id === "registration";
  const isQuestionPaper = section.id === "question-paper";
  const isPreparation = section.id === "preparation";
  const showStudyHub = (section.id === "question-paper" || section.id === "mock-test") && details.studyHub;

  return (
    <article className="rounded-[2rem] bg-white p-7 shadow-[0_18px_44px_rgba(15,23,42,0.08)]">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#ff6b00]">{section.eyebrow}</p>
      {section.introParagraphs?.length ? (
        <div className="mt-2 space-y-4 text-[1rem] leading-8 text-[#3e4b5e]">
          {section.introParagraphs.map((paragraph) => (
            <p key={paragraph}>{renderHighlightedText(paragraph)}</p>
          ))}
        </div>
      ) : null}

      {section.ctaLabel ? (
        <div className="mt-6">
          <a
            href={section.ctaHref ?? "#"}
            target={section.ctaHref ? "_blank" : undefined}
            rel={section.ctaHref ? "noreferrer" : undefined}
            className="block rounded-[1rem] border border-[#c9dafc] px-6 py-4 text-center text-[1.02rem] font-semibold text-[#2563eb] hover:bg-[#f8fbff]"
          >
            {renderHighlightedText(section.ctaLabel)}
          </a>
        </div>
      ) : null}

      <h2 className="mt-3 text-[2rem] font-bold leading-tight tracking-[-0.03em] text-[#172033]">{section.title}</h2>
      {!isQuestionPaper ? (
        <p className="mt-4 text-[1.02rem] leading-8 text-[#5a6678]">{renderHighlightedText(section.summary)}</p>
      ) : null}

      {isRegistration && section.liveLinkLabel && section.liveLinkHref ? (
        <div className="mt-6">
          <a
            href={section.liveLinkHref}
            target="_blank"
            rel="noreferrer"
            className="block rounded-[1rem] border border-[#cad7ee] bg-[#fbfdff] px-6 py-4 text-center text-[1.02rem] italic text-[#2563eb] transition hover:border-[#9fb8e8] hover:bg-white"
          >
            {renderHighlightedText(section.liveLinkLabel)}
          </a>
        </div>
      ) : null}

      {section.keySummaryItems?.length ? (
        <section className="mt-8 rounded-[1.8rem] border border-[#edf1f6] bg-[#fcfdff] p-6">
          <h3 className="text-[1.5rem] font-bold tracking-[-0.03em] text-[#172033]">{section.keySummaryTitle ?? "Key Summary"}</h3>
          <div className="mt-4 space-y-4 text-[1rem] leading-8 text-[#4d5b6c]">
            {section.keySummaryItems.map((item) => (
              <p key={item}>{renderHighlightedText(item)}</p>
            ))}
          </div>
        </section>
      ) : null}

      {isRegistration && section.secondaryTitle ? (
        <section className="mt-8">
          <h3 className="text-[1.75rem] font-bold tracking-[-0.03em] text-[#172033]">{section.secondaryTitle}</h3>
          {section.secondarySummary ? (
            <p className="mt-4 text-[1rem] leading-8 text-[#526071]">{renderHighlightedText(section.secondarySummary)}</p>
          ) : null}
          {section.secondaryTableRows?.length && section.secondaryTableColumns ? (
            <div className="mt-6">
              <TableSection
                title={section.secondaryTableTitle ?? section.secondaryTitle}
                columns={section.secondaryTableColumns}
                rows={section.secondaryTableRows.map((row) => ({ key: row.key, value: row.value }))}
              />
            </div>
          ) : null}
        </section>
      ) : null}

      {isRegistration && section.tertiaryTitle ? (
        <section className="mt-8">
          <h3 className="text-[1.75rem] font-bold tracking-[-0.03em] text-[#172033]">{section.tertiaryTitle}</h3>
          {section.tertiarySummary ? (
            <p className="mt-4 text-[1rem] leading-8 text-[#526071]">{renderHighlightedText(section.tertiarySummary)}</p>
          ) : null}
          {section.tertiaryTableRows?.length && section.tertiaryTableColumns ? (
            <div className="mt-6">
              <TableSection
                title={section.tertiaryTableTitle ?? section.tertiaryTitle}
                columns={section.tertiaryTableColumns}
                rows={section.tertiaryTableRows.map((row) => ({ key: row.key, value: row.value }))}
              />
            </div>
          ) : null}
        </section>
      ) : null}

      {isRegistration && section.quaternaryTitle ? (
        <section className="mt-8">
          <h3 className="text-[1.75rem] font-bold tracking-[-0.03em] text-[#172033]">{section.quaternaryTitle}</h3>
          {section.quaternarySummary ? (
            <div className="mt-4 space-y-4 text-[1rem] leading-8 text-[#526071]">
              {section.quaternarySummary.split("\n").map((paragraph) => (
                <p key={paragraph}>{renderHighlightedText(paragraph)}</p>
              ))}
            </div>
          ) : null}
          {section.quaternaryTableRows?.length && section.quaternaryTableColumns ? (
            <div className="mt-6">
              <TripleTableSection
                title={section.quaternaryTableTitle ?? section.quaternaryTitle}
                columns={section.quaternaryTableColumns}
                rows={section.quaternaryTableRows.map((row) => ({
                  first: row.first,
                  second: row.second,
                  third: row.third,
                }))}
              />
            </div>
          ) : null}
        </section>
      ) : null}

      {section.paragraphs?.length && !isQuestionPaper ? (
        <div className="mt-6 space-y-4 text-[1rem] leading-8 text-[#526071]">
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph}>{renderHighlightedText(paragraph)}</p>
          ))}
        </div>
      ) : null}

      {section.bullets?.length && !isQuestionPaper ? (
        <ul className="mt-6 list-disc space-y-3 pl-8 text-[1rem] leading-8 text-[#2f3d4f]">
          {section.bullets.map((item) => (
            <li key={item}>
              {renderHighlightedText(item)}
            </li>
          ))}
        </ul>
      ) : null}

      {section.note ? (
        <section className="mt-8 rounded-[1rem] border border-[#c9dafc] bg-white px-5 py-4 text-center">
          <p className="text-[1.05rem] font-bold italic leading-9 text-[#ff2b06]">{renderHighlightedText(section.note)}</p>
        </section>
      ) : null}

      {section.followupTitle ? (
        <section className="mt-8">
          <h3 className="text-[1.9rem] font-bold tracking-[-0.03em] text-[#172033]">{section.followupTitle}</h3>
          {section.followupParagraphs?.length ? (
            <div className="mt-5 space-y-4 text-[1rem] leading-8 text-[#526071]">
              {section.followupParagraphs.map((paragraph) => (
                <p key={paragraph}>{renderHighlightedText(paragraph)}</p>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}

      {section.alsoCheckLabel ? (
        <p className="mt-6 text-[1rem] font-semibold leading-8">
          <span className="text-[#ff2b06]">Also Check: </span>
          {section.alsoCheckHref ? (
            <a href={section.alsoCheckHref} target="_blank" rel="noreferrer" className="text-[#2563eb] hover:underline">
              {renderHighlightedText(section.alsoCheckLabel)}
            </a>
          ) : (
            <span className="text-[#2563eb]">{renderHighlightedText(section.alsoCheckLabel)}</span>
          )}
        </p>
      ) : null}

      {!isExamPattern && !isQuestionPaper && section.highlights?.length ? (
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {section.highlights.map((item) => (
            <div key={item} className="rounded-[1.25rem] border border-[#e8edf3] bg-[#fbfcff] px-5 py-4 text-[0.98rem] leading-7 text-[#334155]">
              {renderHighlightedText(item)}
            </div>
          ))}
        </div>
      ) : null}

      {section.tableRows?.length && section.tableColumns ? (
        <section className="mt-8 rounded-[1.8rem] bg-white shadow-[0_18px_44px_rgba(15,23,42,0.08)]">
          <div className="px-1 pt-1">
            <div className="rounded-[1.6rem] border border-[#cfe0ff]">
              <div className="px-6 py-5">
                <h3 className="text-[1.55rem] font-bold tracking-[-0.03em] text-[#172033]">
                  {section.tableTitle ?? section.title}
                </h3>
              </div>
              <div className="grid grid-cols-2 bg-[#dfeafe] text-base font-semibold text-[#172033]">
                <div className="border-r border-[#cfe0ff] px-5 py-4">{section.tableColumns[0]}</div>
                <div className="px-5 py-4">{section.tableColumns[1]}</div>
              </div>
              {section.tableRows.map((row) => (
                <div key={`${row.key}-${row.value}`} className="grid grid-cols-2 border-t border-[#dbe5f5] bg-white text-[1rem] text-[#425066]">
                  <div className="border-r border-[#dbe5f5] px-5 py-4 font-medium">{renderHighlightedText(row.key)}</div>
                  <div className="px-5 py-4">{renderHighlightedText(row.value)}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {section.postTableParagraphs?.length ? (
        <div className="mt-8 space-y-4 text-[1rem] leading-8 text-[#526071]">
          {section.postTableParagraphs.map((paragraph) => (
            <p key={paragraph}>{renderHighlightedText(paragraph)}</p>
          ))}
        </div>
      ) : null}

      {section.postTableBullets?.length ? (
        <ul className="mt-6 list-disc space-y-3 pl-8 text-[1rem] leading-8 text-[#2f3d4f]">
          {section.postTableBullets.map((item) => (
            <li key={item}>{renderHighlightedText(item)}</li>
          ))}
        </ul>
      ) : null}

      {section.postTableNote ? (
        <section className="mt-8">
          <p className="inline italic font-bold leading-9 text-[#ff2b06] [box-shadow:inset_0_-0.95em_0_rgba(255,239,77,0.88)]">
            {renderHighlightedText(section.postTableNote)}
          </p>
        </section>
      ) : null}

      {section.postTableFollowupTitle ? (
        <section className="mt-8">
          <h3 className="text-[1.9rem] font-bold tracking-[-0.03em] text-[#172033]">{section.postTableFollowupTitle}</h3>
          {section.postTableFollowupParagraphs?.length ? (
            <div className="mt-5 space-y-4 text-[1rem] leading-8 text-[#526071]">
              {section.postTableFollowupParagraphs.map((paragraph) => (
                <p key={paragraph}>{renderHighlightedText(paragraph)}</p>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}

      {section.postTableAlsoCheckLabel ? (
        <p className="mt-6 text-[1rem] font-semibold leading-8">
          <span className="text-[#ff2b06]">Also Check: </span>
          {section.postTableAlsoCheckHref ? (
            <a href={section.postTableAlsoCheckHref} target="_blank" rel="noreferrer" className="text-[#2563eb] hover:underline">
              {renderHighlightedText(section.postTableAlsoCheckLabel)}
            </a>
          ) : (
            <span className="text-[#2563eb]">{renderHighlightedText(section.postTableAlsoCheckLabel)}</span>
          )}
        </p>
      ) : null}

      {!isRegistration && !isQuestionPaper && section.steps?.length ? (
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {section.steps.map((step, index) => (
            <div key={step} className="rounded-[1.35rem] border border-[#e9edf4] bg-[#fffdf9] px-5 py-4">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#2f6edb] text-sm font-semibold text-white">
                {index + 1}
              </span>
              <p className="mt-3 text-base font-semibold text-[#243041]">{renderHighlightedText(step)}</p>
            </div>
          ))}
        </div>
      ) : null}

      {!isRegistration && !isQuestionPaper && section.blocks?.length ? (
        <div className="mt-6 space-y-4">
          {section.blocks.map((block) => {
            const styles = getBlockStyles(block.variant);

            return (
            <section key={block.title} className={styles.sectionClass}>
              <h3 className={styles.titleClass}>{block.title}</h3>
              {isExamPattern ? (
                <ul className={styles.listClass}>
                  {block.items.map((item) => (
                    <li key={item}>{renderHighlightedText(item)}</li>
                  ))}
                </ul>
              ) : (
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {block.items.map((item) => (
                    <div key={item} className={styles.itemClass}>
                      {renderHighlightedText(item)}
                    </div>
                  ))}
                </div>
              )}
            </section>
          )})}
        </div>
      ) : null}

      {section.resources?.length && !isQuestionPaper ? (
        <section className="mt-8 rounded-[1.7rem] border border-[#edf1f6] bg-[linear-gradient(135deg,#f5f9ff,#fff7ee)] p-5">
          <h3 className="text-[1.2rem] font-bold text-[#172033]">Refer Links</h3>
          <div className="mt-4 grid gap-3">
            {section.resources.map((resource) => (
              <a
                key={resource.label}
                href={resource.href}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between gap-3 rounded-[1.2rem] border border-[#e4edf9] bg-white px-4 py-3 transition hover:border-[#c8daf7]"
              >
                <div>
                  <p className="text-sm font-semibold text-[#172033]">{resource.label}</p>
                  <p className="mt-1 text-xs text-[#718096]">{resource.note}</p>
                </div>
                <ChevronRight className="size-4 text-[#2f6edb]" />
              </a>
            ))}
          </div>
        </section>
      ) : null}

      {isPreparation && section.preparationVisualItems?.length ? (
        <div className="mt-8">
          <PreparationInfographic
            title={section.preparationVisualTitle ?? `${details.title.replace(/\s+\d{4}$/, "")} Preparation Tips`}
            items={section.preparationVisualItems}
          />
        </div>
      ) : null}

      {isPreparation && section.routineTableRows?.length && section.routineTableColumns ? (
        <RoutineTable
          title={section.routineTableTitle ?? "Daily Routine Structure"}
          columns={section.routineTableColumns}
          rows={section.routineTableRows}
        />
      ) : null}

      {showStudyHub ? (
        <div className="mt-8 space-y-6">
          <StudyLinkGrid
            title={details.studyHub?.previousYearPapersTitle ?? "Official Previous Year Question Papers"}
            summary={details.studyHub?.previousYearPapersSummary ?? "Official paper links and archives."}
            links={details.studyHub?.previousYearPapers ?? []}
            accentClass="text-[#2f6edb]"
          />
          <StudyLinkGrid
            title={details.studyHub?.practiceTitle ?? "Official Practice Links"}
            summary={details.studyHub?.practiceSummary ?? "Official mock tests and practice links."}
            links={details.studyHub?.practiceLinks ?? []}
            accentClass="text-[#ea580c]"
          />
        </div>
      ) : null}
    </article>
  );
}

export function ExamDetailsClient({ details, allExams }: ExamDetailsClientProps) {
  const [activeTab, setActiveTab] = useState(displayTabs[0]?.id ?? "overview");
  const [showScrollTop, setShowScrollTop] = useState(false);

  const activeTabConfig = displayTabs.find((tab) => tab.id === activeTab) ?? displayTabs[0];
  const activeSection = getSection(details, activeTabConfig.sectionId);
  const moreExams = allExams.filter((exam) => exam.slug !== details.slug).slice(0, 3);
  const applicationFee = getExamApplicationFee(details);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 240);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section className="min-h-screen bg-[#f5f7fb] text-[#1f2a37]">
      <Navbar />
      <div className="page-container-full w-full px-4 py-6 sm:px-6 md:py-8">
          <div className="flex flex-wrap items-center gap-2 text-sm text-[#55708b]">
            <Home className="size-4 text-[#2f6edb]" />
            <Link href="/explore" className="text-[#2f6edb] hover:underline">
              Exams
            </Link>
            <ChevronRight className="size-4" />
            <span className="font-medium text-[#344256]">{details.title.replace(/\s+\d{4}$/, "")}</span>
          </div>

          <section className="mt-6 flex flex-col gap-4 border-b border-[#d8dee8] pb-6 md:flex-row md:items-center">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-[#dfe5ed] bg-white shadow-sm">
              <Image src={details.logo} alt={details.title} width={60} height={60} className="h-14 w-14 object-contain" />
            </div>
            <div className="max-w-5xl">
              <h1 className="text-3xl font-bold leading-tight tracking-[-0.03em] text-[#152238] md:text-[3.2rem]">
                {buildHeroTitle(details)}
              </h1>
            </div>
          </section>

          <section className="overflow-x-auto border-b border-[#d8dee8] bg-white/70">
            <div className="flex min-w-max items-stretch gap-6 px-2 py-3">
              {displayTabs.map((tab) => {
                const isActive = tab.id === activeTab;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex min-h-[44px] shrink-0 items-center justify-center px-1 py-2 text-center text-[0.98rem] font-medium leading-6 transition ${
                      isActive
                        ? "bg-transparent text-[#2f6edb]"
                        : "bg-transparent text-[#334155] hover:text-[#2f6edb]"
                    }`}
                  >
                    <span className="whitespace-nowrap">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="mt-5 grid gap-6 xl:grid-cols-[minmax(0,1.8fr)_minmax(320px,0.82fr)]">
            <div className="space-y-5">
              <div className="overflow-hidden rounded-none border border-[#d0d8e3] bg-[linear-gradient(90deg,#2f3e93_0%,#4357bf_34%,#7467cc_67%,#f1f4ff_100%)] px-5 py-5 text-white shadow-sm">
                <div className="flex h-full flex-col justify-between gap-4 md:flex-row md:items-center">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/75">Admissions Open</p>
                    <h2 className="mt-2 text-2xl font-bold leading-tight md:text-[2rem]">Pursue UG & PG Programs</h2>
                    <p className="mt-2 max-w-xl text-sm text-white/85">
                      Explore engineering, management, law, design, and science pathways with scholarship-backed guidance.
                    </p>
                  </div>
                  <div className="inline-flex rounded-full bg-[#f9b61f] px-6 py-3 text-base font-bold text-[#172554] shadow-[0_8px_18px_rgba(15,23,42,0.2)]">
                    APPLY NOW
                  </div>
                </div>
              </div>

              <article className="overflow-hidden rounded-[2rem] bg-white shadow-[0_18px_44px_rgba(15,23,42,0.08)]">
                <div className="bg-[#fdf6ee] px-7 py-8">
                  <div className="mb-5 flex items-center gap-3">
                    <span className="h-8 w-1 rounded-full bg-[#ff6b00]" />
                    <h2 className="text-[2rem] font-bold tracking-[-0.03em] text-[#2a2f37]">
                      {details.title.replace(/\s+\d{4}$/, "")} Latest Updates
                    </h2>
                  </div>
                  <div className="space-y-4 text-[1.02rem] leading-8 text-[#4a5565]">
                    {details.latestUpdates.map((update) => (
                      <p key={`${update.date}-${update.body}`}>
                        <span className="font-semibold text-[#ef4444]">{update.date}</span>{" "}
                        {update.body}{" "}
                        {update.ctaLabel && update.ctaHref ? (
                          <a href={update.ctaHref} target="_blank" rel="noreferrer" className="font-semibold text-[#2f6edb]">
                            {update.ctaLabel}
                          </a>
                        ) : null}
                      </p>
                    ))}
                  </div>
                </div>
              </article>

              {activeSection.id === "overview" ? (
                <OverviewContent details={details} section={activeSection} />
              ) : (
                <GenericSectionContent section={activeSection} details={details} />
              )}
            </div>

            <aside className="space-y-5 xl:sticky xl:top-6 xl:max-h-[calc(100vh-3rem)] xl:self-start xl:overflow-y-auto xl:pr-2">
              <section className="rounded-[2rem] bg-white p-7 shadow-[0_18px_44px_rgba(15,23,42,0.08)]">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#fff4ec] text-[#ef4444]">
                    <FileText className="size-7" />
                  </div>
                  <h3 className="text-[1.05rem] font-semibold leading-8 text-[#2a2f37] md:text-[1.1rem]">
                    Download Free {details.title.replace(/\s+\d{4}$/, "")} Previous Year Papers with Solutions
                  </h3>
                </div>
                {details.studyHub?.previousYearPapers?.[0] ? (
                  <a
                    href={details.studyHub.previousYearPapers[0].href}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-[#f97316] px-6 py-5 text-xl font-semibold text-white transition hover:bg-[#ea6a0c]"
                    title={applicationFee ? `Application Fee: ${applicationFee}` : undefined}
                  >
                    Free Download
                    <Download className="size-5" />
                  </a>
                ) : (
                  <button
                    type="button"
                    className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-[#f97316] px-6 py-5 text-xl font-semibold text-white transition hover:bg-[#ea6a0c]"
                    title={applicationFee ? `Application Fee: ${applicationFee}` : undefined}
                  >
                    Free Download
                    <Download className="size-5" />
                  </button>
                )}
              </section>

              <section className="rounded-[2rem] bg-white p-7 shadow-[0_18px_44px_rgba(15,23,42,0.08)]">
                <h3 className="text-[1.2rem] font-bold text-[#2a2f37]">Get More Info About {details.title.replace(/\s+\d{4}$/, "")}</h3>
                {details.studyHub?.practiceLinks?.[0] ? (
                  <a
                    href={details.studyHub.practiceLinks[0].href}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-[#2f6edb] px-6 py-5 text-xl font-semibold text-white transition hover:bg-[#245fc5]"
                  >
                    Download Sample Papers
                    <Download className="size-5" />
                  </a>
                ) : (
                  <button
                    type="button"
                    className="mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-[#2f6edb] px-6 py-5 text-xl font-semibold text-white transition hover:bg-[#245fc5]"
                  >
                    Download Sample Papers
                    <Download className="size-5" />
                  </button>
                )}
              </section>

              <section className="rounded-[2rem] bg-white p-7 shadow-[0_18px_44px_rgba(15,23,42,0.08)]">
                <h3 className="text-[1.2rem] font-bold text-[#2a2f37]">Important Timeline</h3>
                <div className="mt-5 space-y-4">
                  {details.timeline.map((item) => (
                    <div key={item.label} className="rounded-[1.25rem] bg-[#f8fafc] px-4 py-4">
                      <p className="text-sm font-semibold text-[#172033]">{item.label}</p>
                      <p className="mt-1 text-sm text-[#637181]">{item.displayDate}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-[2rem] bg-white p-7 shadow-[0_18px_44px_rgba(15,23,42,0.08)]">
                <h3 className="text-[1.2rem] font-bold text-[#2a2f37]">Quick Facts</h3>
                <div className="mt-5 space-y-4">
                  {[
                    { label: "Exam Mode", value: details.examMode },
                    { label: "Authority", value: details.authority },
                    { label: "Courses Offered", value: details.coursesOffered },
                  ].map((item) => (
                    <div key={item.label} className="rounded-[1.25rem] border border-[#edf1f6] px-4 py-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#7b8796]">{item.label}</p>
                      <p className="mt-2 text-sm font-semibold leading-6 text-[#243041]">{item.value}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-[2rem] bg-white p-7 shadow-[0_18px_44px_rgba(15,23,42,0.08)]">
                <div className="flex items-center gap-2">
                  <Info className="size-5 text-[#2f6edb]" />
                  <h3 className="text-[1.2rem] font-bold text-[#2a2f37]">Explore Other Exams</h3>
                </div>
                <div className="mt-5 space-y-3">
                  {moreExams.map((exam) => (
                    <Link
                      key={exam.slug}
                      href={`/exams/${exam.slug}`}
                      className="flex items-center gap-3 rounded-[1.2rem] border border-[#edf1f6] px-4 py-3 transition hover:border-[#cdd9ea] hover:bg-[#fbfdff]"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f5f8ff]">
                        <Image src={exam.logo} alt={exam.title} width={28} height={28} className="h-7 w-7 object-contain" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#243041]">{exam.title}</p>
                        <p className="text-xs text-[#718096]">{exam.date}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            </aside>
          </section>
      </div>
      {showScrollTop ? (
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Scroll to top"
          className="fixed bottom-8 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-md border border-[#d7dbe2] bg-white text-[#4b5563] shadow-[0_10px_30px_rgba(15,23,42,0.18)] transition hover:-translate-y-0.5 hover:text-[#1f2937]"
        >
          <ArrowUp className="size-7" strokeWidth={1.75} />
        </button>
      ) : null}
    </section>
  );
}

function TripleTableSection({
  title,
  columns,
  rows,
}: {
  title: string;
  columns: [string, string, string];
  rows: { first: string; second: string; third: string }[];
}) {
  return (
    <section className="rounded-[1.8rem] bg-white p-7 shadow-[0_18px_44px_rgba(15,23,42,0.08)]">
      <h3 className="text-[2rem] font-bold tracking-[-0.03em] text-[#172033]">{title}</h3>
      <div className="mt-5 overflow-hidden rounded-[1.35rem] border border-[#cfe0ff]">
        <div className="grid grid-cols-3 bg-[#dfeafe] text-base font-semibold text-[#172033]">
          <div className="border-r border-[#cfe0ff] px-5 py-4">{columns[0]}</div>
          <div className="border-r border-[#cfe0ff] px-5 py-4">{columns[1]}</div>
          <div className="px-5 py-4">{columns[2]}</div>
        </div>
        {rows.map((row) => (
          <div key={`${row.first}-${row.second}-${row.third}`} className="grid grid-cols-3 border-t border-[#dbe5f5] bg-white text-[1rem] text-[#425066]">
            <div className="border-r border-[#dbe5f5] px-5 py-4 font-medium">{renderHighlightedText(row.first)}</div>
            <div className="border-r border-[#dbe5f5] px-5 py-4">{renderHighlightedText(row.second)}</div>
            <div className="px-5 py-4">{renderHighlightedText(row.third)}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
