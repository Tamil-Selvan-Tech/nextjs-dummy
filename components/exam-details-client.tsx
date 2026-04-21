"use client";

import { useState, type ReactNode } from "react";
import {
  Atom,
  BookOpenText,
  Building2,
  CalendarDays,
  ChevronDown,
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
  hasDropdown?: boolean;
};

type OverviewPalette = {
  accent: string;
  soft: string;
  ring: string;
};

const displayTabs: DisplayTab[] = [
  { id: "overview", label: "Overview", sectionId: "overview", hasDropdown: true },
  { id: "exam-date", label: "Exam Date", sectionId: "registration", hasDropdown: true },
  { id: "exam-pattern", label: "Exam Pattern", sectionId: "exam-pattern", hasDropdown: true },
  { id: "question-papers", label: "Question Papers", sectionId: "question-paper", hasDropdown: true },
  { id: "prep", label: "Preparation Tips", sectionId: "preparation", hasDropdown: true },
  { id: "results", label: "Results", sectionId: "answer-key", hasDropdown: true },
  { id: "cutoff", label: "Cutoff", sectionId: "cutoff", hasDropdown: true },
  { id: "mock-test", label: "Mock Test", sectionId: "mock-test" },
  { id: "predictor", label: "College Predictor", sectionId: "overview" },
  { id: "news", label: "News", sectionId: "news" },
  { id: "colleges", label: "Participating Colleges", sectionId: "overview" },
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
              {item.dropdown ? <ChevronDown className="size-4" /> : null}
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
          <div className="bg-[#123a7a] px-4 py-3 text-[0.98rem] font-medium text-white/95">
            <marquee behavior="scroll" direction="left" scrollamount="5">
              {examName} 2026 updates and official notices are available on the portal.
            </marquee>
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
    <section className="relative overflow-hidden rounded-[2rem] border border-[#f4d6c4] bg-[radial-gradient(circle_at_top,#fffdf9_0%,#fff3ea_52%,#fffaf5_100%)] p-6 shadow-[0_24px_60px_rgba(223,92,74,0.08)] md:p-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_22%,rgba(251,146,60,0.14),transparent_22%),radial-gradient(circle_at_82%_30%,rgba(249,115,22,0.12),transparent_20%),radial-gradient(circle_at_55%_82%,rgba(245,158,11,0.1),transparent_18%)] opacity-70" />
      <h3 className="text-center text-[1.8rem] font-bold tracking-[-0.03em] text-[#172033] md:text-[2.45rem]">
        {examName} 2026 Overview
      </h3>

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1.18fr)_minmax(360px,0.88fr)] xl:items-center">
        <div className="relative mx-auto hidden aspect-square w-full max-w-[640px] xl:block">
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

          <div className="absolute left-1/2 top-1/2 flex h-[210px] w-[210px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-[linear-gradient(145deg,rgba(255,255,255,0.82),rgba(255,232,214,0.7))] text-center shadow-[0_0_0_10px_rgba(255,255,255,0.35),0_24px_60px_rgba(248,146,32,0.18),inset_0_0_30px_rgba(255,255,255,0.7)] backdrop-blur-xl">
            <div className="absolute inset-4 rounded-full border border-[#ffd7be]/80" />
            <div>
              <p className="text-[0.82rem] font-semibold uppercase tracking-[0.3em] text-[#f08b33]">Overview</p>
              <p className="mt-3 px-6 text-[1.9rem] font-bold leading-tight tracking-[-0.04em] text-[#172033]">
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
                className="absolute flex h-[116px] w-[116px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-[linear-gradient(145deg,rgba(255,255,255,0.88),rgba(255,243,234,0.68))] shadow-[0_0_0_8px_rgba(255,255,255,0.32),0_18px_34px_rgba(15,23,42,0.14)] backdrop-blur-xl"
                style={{
                  top: orbitPositions[index].top,
                  left: orbitPositions[index].left,
                  boxShadow: `0 0 0 8px rgba(255,255,255,0.32), 0 0 30px ${palette.accent}30, 0 18px 34px rgba(15,23,42,0.14)`,
                }}
              >
                <div
                  className="flex h-[78px] w-[78px] items-center justify-center rounded-full border text-center"
                  style={{ borderColor: `${palette.accent}66`, background: `linear-gradient(145deg, ${palette.soft}, #ffffff)` }}
                >
                  <div className="flex flex-col items-center gap-1">
                    <Icon className="size-5" style={{ color: palette.accent }} />
                    <span className="text-sm font-bold" style={{ color: palette.accent }}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-4">
          {details.overviewCards.map((card, index) => {
            const palette = getOverviewPalette(index);
            const Icon = getOverviewIcon(card.title);

            return (
              <div key={`${card.title}-${card.value}`} className="flex items-start gap-4 md:gap-5">
                <div className="flex shrink-0 items-center gap-3">
                  <div
                    className="relative flex h-12 w-12 items-center justify-center rounded-full border-[4px] bg-white text-base font-bold shadow-[0_10px_24px_rgba(15,23,42,0.12)]"
                    style={{ color: palette.accent, borderColor: palette.ring }}
                  >
                    <Icon className="size-4" />
                  </div>
                  <div className="hidden h-[2px] w-12 rounded-full md:block" style={{ backgroundColor: palette.accent }} />
                </div>
                <div
                  className="min-w-0 flex-1 rounded-[1.35rem] border border-white/60 px-5 py-3 shadow-[0_14px_36px_rgba(15,23,42,0.06)] backdrop-blur-xl"
                  style={{
                    background: `linear-gradient(135deg, ${palette.soft}cc 0%, rgba(255,255,255,0.72) 100%)`,
                    borderColor: `${palette.accent}33`,
                    boxShadow: `0 10px 28px rgba(15,23,42,0.06), 0 0 22px ${palette.accent}14`,
                  }}
                >
                  <p className="text-[1.08rem] font-bold leading-6 text-[#172033]">{card.title}</p>
                  <p className="mt-0.5 text-[0.98rem] leading-6 text-[#425066]">{card.value}</p>
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
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {section.highlights.map((item) => (
            <div key={item} className="rounded-[1.25rem] border border-[#e8edf3] bg-[#fbfcff] px-5 py-4 text-[0.98rem] leading-7 text-[#334155]">
              {renderHighlightedText(item)}
            </div>
          ))}
        </div>
      ) : null}

      <section className="mt-8 rounded-[1.8rem] border border-[#edf1f6] bg-[#fcfdff] p-6">
        <h3 className="text-[1.5rem] font-bold tracking-[-0.03em] text-[#172033]">Key Summary</h3>
        <div className="mt-4 space-y-3">
          {details.keySummary.map((item) => (
            <div key={item} className="rounded-[1.2rem] bg-white px-4 py-3 text-[0.98rem] leading-7 text-[#4d5b6c] shadow-[0_6px_20px_rgba(15,23,42,0.04)]">
              {renderHighlightedText(item)}
            </div>
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
          {section.blocks.map((block) => (
            <section key={block.title} className="rounded-[1.5rem] border border-[#edf1f6] bg-[#fcfdff] p-5">
              <h3 className="text-[1.2rem] font-semibold text-[#1f2937]">{block.title}</h3>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {block.items.map((item) => (
                  <div key={item} className="rounded-[1.1rem] bg-white px-4 py-3 text-[0.97rem] leading-7 text-[#526071] shadow-[0_6px_20px_rgba(15,23,42,0.04)]">
                    {renderHighlightedText(item)}
                  </div>
                ))}
              </div>
            </section>
          ))}
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

function GenericSectionContent({ section }: { section: ExamSection }) {
  const isExamPattern = section.id === "exam-pattern";

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
      <p className="mt-4 text-[1.02rem] leading-8 text-[#5a6678]">{renderHighlightedText(section.summary)}</p>

      {section.paragraphs?.length ? (
        <div className="mt-6 space-y-4 text-[1rem] leading-8 text-[#526071]">
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph}>{renderHighlightedText(paragraph)}</p>
          ))}
        </div>
      ) : null}

      {section.bullets?.length ? (
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

      {!isExamPattern && section.highlights?.length ? (
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

      {section.steps?.length ? (
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

      {section.blocks?.length ? (
        <div className="mt-6 space-y-4">
          {section.blocks.map((block) => (
            <section key={block.title} className="rounded-[1.5rem] border border-[#edf1f6] bg-[#fcfdff] p-5">
              <h3 className="text-[1.2rem] font-semibold text-[#1f2937]">{block.title}</h3>
              {isExamPattern ? (
                <ul className="mt-4 list-disc space-y-3 pl-7 text-[0.99rem] leading-8 text-[#526071]">
                  {block.items.map((item) => (
                    <li key={item}>{renderHighlightedText(item)}</li>
                  ))}
                </ul>
              ) : (
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {block.items.map((item) => (
                    <div key={item} className="rounded-[1.1rem] bg-white px-4 py-3 text-[0.97rem] leading-7 text-[#526071] shadow-[0_6px_20px_rgba(15,23,42,0.04)]">
                      {renderHighlightedText(item)}
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      ) : null}

      {section.resources?.length ? (
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

export function ExamDetailsClient({ details, allExams }: ExamDetailsClientProps) {
  const [activeTab, setActiveTab] = useState(displayTabs[0]?.id ?? "overview");

  const activeTabConfig = displayTabs.find((tab) => tab.id === activeTab) ?? displayTabs[0];
  const activeSection = getSection(details, activeTabConfig.sectionId);
  const moreExams = allExams.filter((exam) => exam.slug !== details.slug).slice(0, 3);

  return (
    <section className="min-h-screen bg-[#f5f7fb] text-[#1f2a37]">
      <Navbar />
      <div className="mx-auto w-full max-w-[1620px] px-4 py-6 md:px-8 md:py-8">
        <div className="mx-auto max-w-[1550px]">
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
            <div className="flex min-w-max items-stretch gap-1 px-1">
              {displayTabs.map((tab) => {
                const isActive = tab.id === activeTab;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex min-h-[86px] min-w-[132px] shrink-0 items-center justify-center gap-1 border-b-[3px] px-4 py-4 text-center text-[0.96rem] font-medium leading-7 transition ${
                      isActive ? "border-[#2f6edb] text-[#2f6edb]" : "border-transparent text-[#334155] hover:text-[#2f6edb]"
                    }`}
                  >
                    <span className="max-w-[110px] text-balance">{tab.label}</span>
                    {tab.hasDropdown ? <ChevronDown className="size-4" /> : null}
                  </button>
                );
              })}
              <button
                type="button"
                aria-label="More tabs"
                className="ml-2 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#d8dee8] bg-white text-[#475569]"
              >
                <ChevronRight className="size-5" />
              </button>
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
                <GenericSectionContent section={activeSection} />
              )}
            </div>

            <aside className="space-y-5">
              <section className="rounded-[2rem] bg-white p-7 shadow-[0_18px_44px_rgba(15,23,42,0.08)]">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#fff4ec] text-[#ef4444]">
                    <FileText className="size-7" />
                  </div>
                  <h3 className="text-[1.05rem] font-semibold leading-8 text-[#2a2f37] md:text-[1.1rem]">
                    Download Free {details.title.replace(/\s+\d{4}$/, "")} Previous Year Papers with Solutions
                  </h3>
                </div>
                <button
                  type="button"
                  className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-[#f97316] px-6 py-5 text-xl font-semibold text-white transition hover:bg-[#ea6a0c]"
                >
                  Free Download
                  <Download className="size-5" />
                </button>
              </section>

              <section className="rounded-[2rem] bg-white p-7 shadow-[0_18px_44px_rgba(15,23,42,0.08)]">
                <h3 className="text-[1.2rem] font-bold text-[#2a2f37]">Get More Info About {details.title.replace(/\s+\d{4}$/, "")}</h3>
                <button
                  type="button"
                  className="mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-[#2f6edb] px-6 py-5 text-xl font-semibold text-white transition hover:bg-[#245fc5]"
                >
                  Download Sample Papers
                  <Download className="size-5" />
                </button>
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
                    { label: "Participating Colleges", value: details.colleges },
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
      </div>
    </section>
  );
}
