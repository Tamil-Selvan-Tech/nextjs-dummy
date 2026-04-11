"use client";

import { Navbar } from "@/components/navbar";
import { useMemo, useState, type CSSProperties } from "react";
import {
  ArrowUpRight,
  Award,
  BookOpen,
  Brain,
  Calculator,
  CalendarDays,
  FileText,
  GraduationCap,
  Info,
  Lightbulb,
  MapPin,
  Scale,
  Stethoscope,
  Target,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { type College } from "@/lib/site-data";

type CutoffClientProps = {
  selectedLevel: string;
  selectedDegree: string;
  selectedCourse: string;
  selectedSpecialization: string;
  enteredCutoff: string;
  colleges: College[];
};

export function CutoffClient({
  selectedLevel,
  selectedDegree,
  selectedCourse,
  selectedSpecialization,
  enteredCutoff,
  colleges,
}: CutoffClientProps) {
  const summaryLevel = selectedLevel || "11";
  const summaryDegree = selectedDegree || "Engineering";
  const summaryCourse = selectedCourse || "-";
  const summarySpecialization = selectedSpecialization || "-";
  const summaryCutoff = enteredCutoff || "184.5";
  const isJuniorLevel = ["6", "7", "8", "9", "10"].includes(summaryLevel);
  const examsByDegree: Record<string, string[]> = {
    Engineering: ["JEE Main", "JEE Advanced", "BITSAT", "VITEEE", "TNEA Counseling"],
    Medical: ["NEET UG", "AIIMS (via NEET)", "JIPMER (via NEET)", "State Medical Counseling"],
    "Arts & Science": ["CUET UG", "State University Entrance", "TANCET (PG)"],
    Law: ["CLAT", "AILET", "SLAT"],
  };
  const degreeStreamMap: Record<string, string[]> = {
    Engineering: ["Engineering"],
    Medical: ["Medical", "Paramedical"],
    "Arts & Science": ["Science", "Arts", "Computer Science", "Management"],
    Law: ["Law"],
  };
  const streamMatches = (streams: string[], targets: string[]) => {
    const lowerStreams = streams.map((item) => item.toLowerCase());
    return targets.some((target) =>
      lowerStreams.some((stream) => stream.includes(target.toLowerCase())),
    );
  };
  const degreeTargets = degreeStreamMap[summaryDegree] || [];
  const availableColleges = colleges || [];
  const matchingColleges = degreeTargets.length
    ? availableColleges.filter((college) => streamMatches(college.streams, degreeTargets))
    : availableColleges;
  const topColleges = matchingColleges.filter((college) => college.isBestCollege).slice(0, 6);
  const otherColleges = matchingColleges.filter((college) => !college.isBestCollege).slice(0, 10);
  const examsForDegree = examsByDegree[summaryDegree] || [];
  const examCards = (examsForDegree.length ? examsForDegree : ["Explore entrance exams for this degree"]).map(
    (exam) => ({
      title: exam,
      date: "Check official portal",
      tag: "Recommended",
    }),
  );
  const studyPlan = [
    { title: "Maths Practice", time: "30 mins", detail: "Solve 8-10 problems" },
    { title: "Science Concepts", time: "30 mins", detail: "Revise one chapter" },
    { title: "Revision Slot", time: "20 mins", detail: "Quick recap notes" },
    { title: "Mock Questions", time: "15 mins", detail: "Try 5 mixed questions" },
  ];
  const subjectTips: Record<number, string> = {
    1: "Start with basics and short daily practice.",
    2: "Revise core topics with simple examples.",
    3: "Good progress—add more practice questions.",
    4: "Strong—start timed problem sets.",
    5: "Excellent—help peers or teach-back.",
  };
  const [subjectRatings, setSubjectRatings] = useState({
    Maths: 3,
    Science: 3,
    English: 3,
  });
  const quizOptionsByQuestion = [
    [
      { label: "I enjoy solving problems and building things", track: "Engineering" },
      { label: "I like helping people and learning about health", track: "Medical" },
      { label: "I enjoy creativity, reading, or social topics", track: "Arts" },
      { label: "I like justice, rules, and helping people with rights", track: "Law" },
    ],
    [
      { label: "I like fixing gadgets or understanding how machines work", track: "Engineering" },
      { label: "I am curious about biology and how the body works", track: "Medical" },
      { label: "I enjoy writing, debating, or storytelling", track: "Arts" },
      { label: "I like debating, public speaking, and fairness", track: "Law" },
    ],
    [
      { label: "I like building apps, models, or simple experiments", track: "Engineering" },
      { label: "I want a career where I can help patients", track: "Medical" },
      { label: "I enjoy design, art, or creative projects", track: "Arts" },
      { label: "I want to work on cases and solve disputes", track: "Law" },
    ],
  ];
  const [quizAnswers, setQuizAnswers] = useState([0, 0, 0]);
  const quizScores = quizAnswers.reduce(
    (acc, answerIndex) => {
      const optionsForQuestion = quizOptionsByQuestion[acc.__index] || [];
      const picked = optionsForQuestion[answerIndex]?.track;
      if (picked) acc[picked] = (acc[picked] || 0) + 1;
      acc.__index += 1;
      return acc;
    },
    { Engineering: 0, Medical: 0, Arts: 0, Law: 0, __index: 0 } as Record<string, number>,
  );
  const quizResult = Object.entries(quizScores)
    .filter(([key]) => key !== "__index")
    .sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Engineering";
  const [scoreInput, setScoreInput] = useState("");
  const scoreValue = Number(scoreInput);
  const resolvedScore = Number.isFinite(scoreValue) ? scoreValue : NaN;
  const levelResult = useMemo(() => {
    if (!Number.isFinite(resolvedScore)) {
      return { level: "-", label: "Enter a score", tip: "Start with Maths + Science basics." };
    }
    if (resolvedScore >= 90) return { level: "10", label: "Top Performer", tip: "Keep a steady revision plan." };
    if (resolvedScore >= 80) return { level: "8", label: "Very Good", tip: "Practice weekly tests." };
    if (resolvedScore >= 60) return { level: "6", label: "Good", tip: "Focus on tricky topics daily." };
    if (resolvedScore >= 40) return { level: "4", label: "Needs Improvement", tip: "Spend extra time on basics." };
    return { level: "4", label: "Needs Improvement", tip: "Ask for help and revise fundamentals." };
  }, [resolvedScore]);

  if (isJuniorLevel) {
    return (
      <section
        className="min-h-screen bg-white text-[color:var(--text-dark)]"
        style={
          {
            "--brand-primary": "#4F8DBB",
            "--brand-primary-soft": "#6FA6CD",
          } as CSSProperties
        }
      >
        <Navbar />
        <div className="page-container-full py-10 md:py-12">
          <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            <div className="space-y-6">
              <section className="rounded-[1.6rem] border border-[rgba(79,141,187,0.14)] bg-[linear-gradient(135deg,rgba(79,141,187,0.08),rgba(255,255,255,0.95))] p-6 shadow-[0_20px_44px_rgba(79,141,187,0.12)] md:p-7">
                <span className="inline-flex rounded-full border border-[rgba(79,141,187,0.2)] bg-[rgba(79,141,187,0.08)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--brand-primary)]">
                  Career Guidance
                </span>
                <h1 className="mt-4 text-2xl font-bold text-[color:var(--text-dark)] md:text-3xl">
                  Level {summaryLevel} • {summaryDegree}
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-[color:var(--text-muted)] md:text-base">
                  Based on your selected degree, here are suggested exams and colleges to explore.
                </p>
              </section>

              <section className="rounded-[1.6rem] border border-[rgba(79,141,187,0.12)] bg-white p-6 shadow-[0_18px_40px_rgba(79,141,187,0.08)]">
                <div className="flex items-center gap-2 text-base font-semibold text-[color:var(--text-dark)]">
                  <Target className="size-4 text-[color:var(--brand-primary)]" />
                  Top Colleges
                </div>
                <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
                  {topColleges.length ? (
                    topColleges.map((college) => (
                      <Link
                        key={college.id}
                        href={`/college/${college.id}`}
                        className="group min-w-[240px] rounded-2xl border border-[rgba(79,141,187,0.12)] bg-[rgba(248,252,255,0.9)] p-4 transition hover:-translate-y-0.5 hover:border-[rgba(79,141,187,0.28)] hover:shadow-[0_18px_36px_rgba(79,141,187,0.16)]"
                      >
                        <div className="overflow-hidden rounded-xl border border-[rgba(79,141,187,0.12)] bg-white">
                          <img
                            src={college.image}
                            alt={college.name}
                            className="h-32 w-full object-cover transition group-hover:scale-[1.02]"
                            loading="lazy"
                          />
                        </div>
                        <div className="mt-3 text-sm font-semibold text-[color:var(--text-dark)]">{college.name}</div>
                        <div className="mt-1 text-xs text-[color:var(--text-muted)]">
                          {college.district}, {college.state}
                        </div>
                        <div className="mt-2 text-xs font-semibold text-[color:var(--brand-primary)]">
                          {college.accreditation}
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p className="text-sm text-[color:var(--text-muted)]">No top colleges found for this degree.</p>
                  )}
                </div>
              </section>

              <section className="rounded-[1.6rem] border border-[rgba(79,141,187,0.12)] bg-white p-6 shadow-[0_18px_40px_rgba(79,141,187,0.08)]">
                <div className="text-sm font-semibold text-[color:var(--text-dark)]">Other Colleges</div>
                <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
                  {otherColleges.length ? (
                    otherColleges.map((college) => (
                      <Link
                        key={college.id}
                        href={`/college/${college.id}`}
                        className="group min-w-[240px] rounded-2xl border border-[rgba(79,141,187,0.12)] bg-[rgba(248,252,255,0.9)] p-4 transition hover:-translate-y-0.5 hover:border-[rgba(79,141,187,0.28)] hover:shadow-[0_18px_36px_rgba(79,141,187,0.16)]"
                      >
                        <div className="overflow-hidden rounded-xl border border-[rgba(79,141,187,0.12)] bg-white">
                          <img
                            src={college.image}
                            alt={college.name}
                            className="h-32 w-full object-cover transition group-hover:scale-[1.02]"
                            loading="lazy"
                          />
                        </div>
                        <div className="mt-3 text-sm font-semibold text-[color:var(--text-dark)]">{college.name}</div>
                        <div className="mt-1 text-xs text-[color:var(--text-muted)]">
                          {college.district}, {college.state}
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p className="text-xs text-[color:var(--text-muted)]">No other colleges found.</p>
                  )}
                </div>
              </section>

            </div>

            <aside className="space-y-6">
              <section className="rounded-[1.6rem] border border-[rgba(79,141,187,0.12)] bg-white p-6 shadow-[0_18px_40px_rgba(79,141,187,0.08)]">
                <div className="flex items-center gap-2 text-base font-semibold text-[color:var(--text-dark)]">
                  <CalendarDays className="size-4 text-[color:var(--text-dark)]" />
                  Recommended Exams
                </div>
                <div className="mt-4 space-y-3">
                  {examCards.map((exam) => (
                    <div
                      key={exam.title}
                      className="rounded-xl border border-[rgba(79,141,187,0.12)] bg-[rgba(248,252,255,0.9)] p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-semibold text-[color:var(--text-dark)]">{exam.title}</div>
                        <span className="rounded-full bg-[rgba(79,141,187,0.12)] px-2 py-0.5 text-[10px] font-semibold text-[color:var(--brand-primary)]">
                          {exam.tag}
                        </span>
                      </div>
                      <div className="mt-2 text-xs text-[color:var(--text-muted)]">{exam.date}</div>
                      <button
                        type="button"
                        className="mt-3 text-xs font-semibold text-[color:var(--brand-primary)]"
                      >
                        Portal <ArrowUpRight className="ml-1 inline size-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            </aside>
          </div>

          <section className="mt-6 rounded-[1.6rem] border border-[rgba(79,141,187,0.12)] bg-white p-6 shadow-[0_18px_40px_rgba(79,141,187,0.08)]">
            <div className="flex items-center gap-2 text-base font-semibold text-[color:var(--text-dark)]">
              <Info className="size-4 text-[color:var(--text-dark)]" />
              Cutoff Awareness
            </div>
            <p className="mt-2 text-sm text-[color:var(--text-muted)]">
              Cutoff is the minimum mark you need to get admission in a good college.
            </p>
            <div className="mt-3 grid gap-2 text-xs text-[color:var(--text-muted)] sm:grid-cols-3">
              <div className="rounded-xl border border-[rgba(79,141,187,0.12)] bg-[rgba(248,252,255,0.9)] px-3 py-2">
                <div className="flex items-center gap-2 font-semibold text-[color:var(--text-dark)]">
                  <Award className="size-4 text-[color:var(--text-dark)]" />
                  90% = Top college
                </div>
              </div>
              <div className="rounded-xl border border-[rgba(79,141,187,0.12)] bg-[rgba(248,252,255,0.9)] px-3 py-2">
                <div className="flex items-center gap-2 font-semibold text-[color:var(--text-dark)]">
                  <TrendingUp className="size-4 text-[color:var(--text-dark)]" />
                  80% = Good college
                </div>
              </div>
              <div className="rounded-xl border border-[rgba(79,141,187,0.12)] bg-[rgba(248,252,255,0.9)] px-3 py-2">
                <div className="flex items-center gap-2 font-semibold text-[color:var(--text-dark)]">
                  <Target className="size-4 text-[color:var(--text-dark)]" />
                  60% = Average college
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-[color:var(--text-dark)]">
              <GraduationCap className="size-4 text-[color:var(--text-dark)]" />
              Level System
            </div>
            <ul className="mt-2 grid gap-2 text-xs text-[color:var(--text-muted)] sm:grid-cols-2">
              <li className="rounded-xl border border-[rgba(79,141,187,0.12)] bg-[rgba(248,252,255,0.9)] px-3 py-2">
                <div className="flex items-center gap-2 font-semibold text-[color:var(--text-dark)]">
                  <Award className="size-4 text-[color:var(--text-dark)]" />
                  Level 10 = Top Performer
                </div>
              </li>
              <li className="rounded-xl border border-[rgba(79,141,187,0.12)] bg-[rgba(248,252,255,0.9)] px-3 py-2">
                <div className="flex items-center gap-2 font-semibold text-[color:var(--text-dark)]">
                  <TrendingUp className="size-4 text-[color:var(--text-dark)]" />
                  Level 8 = Very Good
                </div>
              </li>
              <li className="rounded-xl border border-[rgba(79,141,187,0.12)] bg-[rgba(248,252,255,0.9)] px-3 py-2">
                <div className="flex items-center gap-2 font-semibold text-[color:var(--text-dark)]">
                  <Target className="size-4 text-[color:var(--text-dark)]" />
                  Level 6 = Good
                </div>
              </li>
              <li className="rounded-xl border border-[rgba(79,141,187,0.12)] bg-[rgba(248,252,255,0.9)] px-3 py-2">
                <div className="flex items-center gap-2 font-semibold text-[color:var(--text-dark)]">
                  <Lightbulb className="size-4 text-[color:var(--text-dark)]" />
                  Level 4 = Needs Improvement
                </div>
              </li>
            </ul>

            <div className="mt-5 rounded-2xl border border-[rgba(79,141,187,0.14)] bg-[rgba(240,247,255,0.8)] p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-[color:var(--text-dark)]">
                <Lightbulb className="size-4 text-[color:var(--text-dark)]" />
                Motivation
              </div>
              <p className="mt-2 text-xs text-[color:var(--text-muted)]">
                Cutoff becomes important in 11th and 12th. Focus on Maths and Science now to keep
                your options open later.
              </p>
            </div>

            <div className="mt-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-[color:var(--text-dark)]">
                <Calculator className="size-4 text-[color:var(--text-dark)]" />
                Try It Yourself
              </div>
              <p className="mt-2 text-xs text-[color:var(--text-muted)]">
                Enter your current percentage to see your level and a small improvement tip.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <label className="flex items-center gap-2 rounded-full border border-[rgba(79,141,187,0.18)] bg-white px-3 py-2 text-xs text-[color:var(--text-muted)]">
                  <Calculator className="size-3.5 text-[color:var(--text-dark)]" />
                  % Score
                  <input
                    type="number"
                    min={0}
                    max={100}
                    inputMode="numeric"
                    value={scoreInput}
                    onChange={(event) => setScoreInput(event.target.value)}
                    placeholder="78"
                    className="w-16 bg-transparent text-[color:var(--text-dark)] outline-none"
                  />
                </label>
                <span className="rounded-full border border-[rgba(79,141,187,0.18)] bg-[rgba(79,141,187,0.06)] px-3 py-1 text-[11px] font-semibold text-[color:var(--text-dark)]">
                  Level {levelResult.level} • {levelResult.label}
                </span>
                <span className="text-[11px] text-[color:var(--text-muted)]">
                  Tip: {levelResult.tip}
                </span>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-[color:var(--text-dark)]">
              <Brain className="size-4 text-[color:var(--text-dark)]" />
              Future Awareness
            </div>
            <div className="mt-2 grid gap-2 text-xs text-[color:var(--text-muted)] sm:grid-cols-3">
              <div className="flex items-center gap-2 rounded-xl border border-[rgba(79,141,187,0.12)] bg-[rgba(248,252,255,0.9)] px-3 py-2">
                <BookOpen className="size-3.5 text-[color:var(--text-dark)]" />
                Engineering → Maths + Science marks
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-[rgba(79,141,187,0.12)] bg-[rgba(248,252,255,0.9)] px-3 py-2">
                <Stethoscope className="size-3.5 text-[color:var(--text-dark)]" />
                Medical → NEET exam
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-[rgba(79,141,187,0.12)] bg-[rgba(248,252,255,0.9)] px-3 py-2">
                <Scale className="size-3.5 text-[color:var(--text-dark)]" />
                Law → Entrance exams
              </div>
            </div>

            {summaryDegree === "Engineering" ? (
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-[rgba(79,141,187,0.12)] bg-[rgba(248,252,255,0.9)] p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[color:var(--text-dark)]">
                    <Info className="size-4 text-[color:var(--text-dark)]" />
                    About Engineering
                  </div>
                  <p className="mt-2 text-xs text-[color:var(--text-muted)]">
                    Engineering teaches how to design, build, and improve things using Maths and
                    Science.
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-[color:var(--text-dark)]">
                    <TrendingUp className="size-4 text-[color:var(--text-dark)]" />
                    How to Join Engineering?
                  </div>
                  <p className="mt-2 text-xs text-[color:var(--text-muted)]">
                    Do well in Maths and Science in school, then take engineering entrance exams in
                    11th and 12th.
                  </p>
                </div>

                <div className="rounded-2xl border border-[rgba(79,141,187,0.12)] bg-[rgba(248,252,255,0.9)] p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[color:var(--text-dark)]">
                    <Brain className="size-4 text-[color:var(--text-dark)]" />
                    Skills Needed
                  </div>
                  <ul className="mt-2 space-y-2 text-xs text-[color:var(--text-muted)]">
                    <li className="flex items-center gap-2">
                      <Target className="size-3.5 text-[color:var(--text-dark)]" />
                      Strong Maths
                    </li>
                    <li className="flex items-center gap-2">
                      <Lightbulb className="size-3.5 text-[color:var(--text-dark)]" />
                      Logical thinking
                    </li>
                    <li className="flex items-center gap-2">
                      <TrendingUp className="size-3.5 text-[color:var(--text-dark)]" />
                      Problem solving
                    </li>
                    <li className="flex items-center gap-2">
                      <BookOpen className="size-3.5 text-[color:var(--text-dark)]" />
                      Basic coding (optional)
                    </li>
                  </ul>

                  <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-[color:var(--text-dark)]">
                    <GraduationCap className="size-4 text-[color:var(--text-dark)]" />
                    Popular Courses
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    {[
                      "CSE (Computer Science)",
                      "ECE (Electronics)",
                      "Mechanical",
                      "Civil",
                      "IT",
                      "AI & Data Science",
                    ].map((course) => (
                      <span
                        key={course}
                        className="rounded-full border border-[rgba(79,141,187,0.18)] bg-white px-3 py-1 text-[10px] font-semibold text-[color:var(--text-dark)]"
                      >
                        {course}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            <div className="mt-6 grid gap-4 lg:grid-cols-[1.05fr_1fr]">
              <section className="rounded-[1.6rem] border border-[rgba(79,141,187,0.14)] bg-white p-5 shadow-[0_18px_40px_rgba(79,141,187,0.08)]">
                <div className="flex items-center gap-2 text-sm font-semibold text-[color:var(--text-dark)]">
                  <Target className="size-4 text-[color:var(--brand-primary)]" />
                  Weekly Study Plan
                </div>
                <p className="mt-2 text-xs text-[color:var(--text-muted)]">
                  Simple daily goals to keep you consistent this week.
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {studyPlan.map((item) => (
                    <div
                      key={item.title}
                      className="rounded-xl border border-[rgba(79,141,187,0.12)] bg-[rgba(248,252,255,0.9)] p-3"
                    >
                      <div className="text-xs font-semibold text-[color:var(--text-dark)]">{item.title}</div>
                      <div className="mt-1 text-[11px] text-[color:var(--text-muted)]">{item.detail}</div>
                      <div className="mt-2 text-[11px] font-semibold text-[color:var(--brand-primary)]">
                        {item.time}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-[1.6rem] border border-[rgba(79,141,187,0.14)] bg-white p-5 shadow-[0_18px_40px_rgba(79,141,187,0.08)]">
                <div className="flex items-center gap-2 text-sm font-semibold text-[color:var(--text-dark)]">
                  <Brain className="size-4 text-[color:var(--brand-primary)]" />
                  Subject Strength Meter
                </div>
                <p className="mt-2 text-xs text-[color:var(--text-muted)]">
                  Rate yourself from 1 to 5 and get a quick tip.
                </p>
                <div className="mt-4 space-y-3">
                  {Object.entries(subjectRatings).map(([subject, rating]) => (
                    <div key={subject} className="rounded-xl border border-[rgba(79,141,187,0.12)] bg-[rgba(248,252,255,0.9)] p-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-semibold text-[color:var(--text-dark)]">{subject}</span>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((value) => (
                            <button
                              key={value}
                              type="button"
                              onClick={() =>
                                setSubjectRatings((prev) => ({ ...prev, [subject]: value }))
                              }
                              className={`h-7 w-7 rounded-full border text-[11px] font-semibold transition ${
                                rating === value
                                  ? "border-transparent bg-[color:var(--brand-primary)] text-white"
                                  : "border-[rgba(79,141,187,0.2)] bg-white text-[color:var(--text-dark)]"
                              }`}
                            >
                              {value}
                            </button>
                          ))}
                        </div>
                      </div>
                      <p className="mt-2 text-[11px] text-[color:var(--text-muted)]">{subjectTips[rating]}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <section className="mt-6 rounded-[1.6rem] border border-[rgba(79,141,187,0.14)] bg-[rgba(248,252,255,0.9)] p-6 shadow-[0_18px_40px_rgba(79,141,187,0.08)]">
              <div className="flex items-center gap-2 text-sm font-semibold text-[color:var(--text-dark)]">
                <BookOpen className="size-4 text-[color:var(--brand-primary)]" />
                Mini Career Quiz
              </div>
              <p className="mt-2 text-xs text-[color:var(--text-muted)]">
                Pick the option that feels most like you.
              </p>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                {["Q1", "Q2", "Q3"].map((label, index) => (
                  <div key={label} className="rounded-xl border border-[rgba(79,141,187,0.12)] bg-white p-4">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--text-muted)]">
                      {label}
                    </div>
                    <div className="mt-3 space-y-2 text-[11px] text-[color:var(--text-muted)]">
                      {(quizOptionsByQuestion[index] || []).map((option, optionIndex) => (
                        <button
                          key={option.label}
                          type="button"
                          onClick={() =>
                            setQuizAnswers((prev) => {
                              const next = [...prev];
                              next[index] = optionIndex;
                              return next;
                            })
                          }
                          className={`w-full rounded-xl border px-3 py-2 text-left font-semibold transition ${
                            quizAnswers[index] === optionIndex
                              ? "border-transparent bg-[color:var(--brand-primary)] text-white"
                              : "border-[rgba(79,141,187,0.18)] bg-[rgba(248,252,255,0.9)] text-[color:var(--text-dark)]"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-2xl border border-[rgba(79,141,187,0.16)] bg-white p-4 text-xs text-[color:var(--text-muted)]">
                Result:{" "}
                <span className="font-semibold text-[color:var(--brand-primary)]">
                  You may like {quizResult}.
                </span>{" "}
                Explore more options and talk to teachers for guidance.
              </div>
            </section>

            <section className="mt-6 rounded-[1.6rem] border border-[rgba(79,141,187,0.14)] bg-white p-6 shadow-[0_18px_40px_rgba(79,141,187,0.08)]">
              <div className="flex items-center gap-2 text-sm font-semibold text-[color:var(--text-dark)]">
                <CalendarDays className="size-4 text-[color:var(--brand-primary)]" />
                Next Milestone
              </div>
              <p className="mt-2 text-xs text-[color:var(--text-muted)]">
                In Class 11, these exams start mattering. Start exploring now so you are ready.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { title: "Engineering", exams: "JEE Main, State Entrance" },
                  { title: "Medical", exams: "NEET UG" },
                  { title: "Arts & Science", exams: "CUET UG, State University Exams" },
                  { title: "Law", exams: "CLAT, AILET" },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="rounded-xl border border-[rgba(79,141,187,0.12)] bg-[rgba(248,252,255,0.9)] p-3"
                  >
                    <div className="text-xs font-semibold text-[color:var(--text-dark)]">{item.title}</div>
                    <div className="mt-1 text-[11px] text-[color:var(--text-muted)]">{item.exams}</div>
                  </div>
                ))}
              </div>
            </section>
          </section>
        </div>
      </section>
    );
  }

  return (
    <section
      className="min-h-screen bg-white text-[color:var(--text-dark)]"
      style={
        {
          "--brand-primary": "#4F8DBB",
          "--brand-primary-soft": "#6FA6CD",
        } as CSSProperties
      }
    >
      <Navbar />
      <div className="page-container-full py-10 md:py-12">
        <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
          <div className="space-y-6">
            <section className="rounded-[1.6rem] border border-[rgba(15,76,129,0.18)] bg-[rgba(229,239,248,0.95)] p-6 shadow-[0_18px_40px_rgba(15,76,129,0.16)] md:p-7">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className="inline-flex rounded-full border border-[rgba(15,76,129,0.3)] bg-[rgba(15,76,129,0.12)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:rgb(15,76,129)]">
                    Current Analysis
                  </span>
                  <h1 className="mt-4 text-2xl font-bold text-[color:var(--text-dark)] md:text-3xl">
                    Level: <span className="text-[color:rgb(15,76,129)]">{summaryLevel}th Grade</span>
                  </h1>
                  <p className="mt-2 max-w-xl text-sm text-[color:var(--text-muted)] md:text-base">
                    Based on your current academic scores and state-level standards, here is your predicted cutoff estimate for 2026.
                  </p>
                </div>
                <div className="min-w-[220px] rounded-2xl border border-[rgba(15,76,129,0.18)] bg-white p-4 text-center shadow-[0_14px_30px_rgba(15,76,129,0.12)]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--text-muted)]">
                    Estimated Cutoff
                  </p>
                  <div className="mt-3 flex items-end justify-center gap-2">
                    <span className="text-3xl font-bold text-[color:var(--text-dark)] md:text-4xl">{summaryCutoff}</span>
                    <span className="text-sm font-semibold text-[color:var(--text-muted)]">/ 200</span>
                  </div>
                  <p className="mt-2 text-xs font-semibold text-[color:rgb(15,76,129)]">Top 15% Percentile</p>
                </div>
              </div>
            </section>

            <section className="rounded-[1.6rem] border border-[rgba(79,141,187,0.12)] bg-white p-6 shadow-[0_18px_40px_rgba(79,141,187,0.08)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-base font-semibold text-[color:var(--text-dark)]">
                  <Target className="size-4 text-[color:var(--brand-primary)]" />
                  Suggested Matchings
                </div>
                <button
                  type="button"
                  className="rounded-full border border-[rgba(79,141,187,0.2)] px-3 py-1 text-xs font-semibold text-[color:var(--brand-primary)] transition hover:bg-[rgba(79,141,187,0.06)]"
                >
                  View All Matching
                </button>
              </div>
              <p className="mt-2 text-sm text-[color:var(--text-muted)]">
                Colleges aligned with your current estimated score
              </p>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {[
                  {
                    name: "PSG College of Technology",
                    location: "Coimbatore, Tamil Nadu",
                    cutoff: "182.5 - 194.0",
                    match: "92% Match",
                  },
                  {
                    name: "Kumaraguru College",
                    location: "Coimbatore, Tamil Nadu",
                    cutoff: "178.0 - 188.5",
                    match: "88% Match",
                  },
                  {
                    name: "SSN College of Engineering",
                    location: "Kalavakkam, Tamil Nadu",
                    cutoff: "185.5 - 196.0",
                    match: "74% Match",
                  },
                ].map((college) => (
                  <article
                    key={college.name}
                    className="flex h-full flex-col rounded-2xl border border-[rgba(79,141,187,0.12)] bg-[rgba(248,252,255,0.9)] p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="rounded-full bg-[rgba(79,141,187,0.1)] px-2.5 py-1 text-[11px] font-semibold text-[color:var(--brand-primary)]">
                        {college.match}
                      </div>
                      <button type="button" className="text-xs font-semibold text-[color:var(--brand-primary)]">
                        Details <ArrowUpRight className="ml-1 inline size-3" />
                      </button>
                    </div>
                    <h3 className="mt-4 text-sm font-semibold text-[color:var(--text-dark)]">{college.name}</h3>
                    <p className="mt-1 text-xs text-[color:var(--text-muted)]">{college.location}</p>
                    <div className="mt-auto pt-4 text-xs text-[color:var(--text-muted)]">
                      Avg Cutoff
                      <span className="ml-2 font-semibold text-[color:var(--brand-primary)]">{college.cutoff}</span>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="rounded-[1.6rem] border border-[rgba(79,141,187,0.12)] bg-[rgba(240,247,255,0.75)] p-6 shadow-[0_18px_40px_rgba(79,141,187,0.08)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-base font-semibold text-[color:var(--text-dark)]">
                    <GraduationCap className="size-5 text-[color:var(--brand-primary)]" />
                    Aim Higher: Tier 1 Targets
                  </div>
                  <p className="mt-2 text-sm text-[color:var(--text-muted)]">
                    Boost your marks to unlock these premium institutions
                  </p>
                </div>
                <button
                  type="button"
                  className="rounded-full bg-[color:var(--brand-primary)] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[color:var(--brand-primary-soft)]"
                >
                  Get Study Roadmap
                </button>
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {[
                  { name: "Anna University (CEG)", city: "Chennai, Tamil Nadu", need: "+12.5 marks" },
                  { name: "Madras Institute of Technology", city: "Chromepet, Chennai", need: "+8.5 marks" },
                ].map((college) => (
                  <article
                    key={college.name}
                    className="rounded-2xl border border-[rgba(79,141,187,0.14)] bg-white p-4"
                  >
                    <div className="text-sm font-semibold text-[color:var(--text-dark)]">{college.name}</div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-[color:var(--text-muted)]">
                      <MapPin className="size-3" />
                      {college.city}
                    </div>
                    <div className="mt-3 text-xs font-semibold text-[color:var(--brand-primary)]">
                      Need {college.need}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-[1.6rem] border border-[rgba(79,141,187,0.12)] bg-white p-6 shadow-[0_18px_40px_rgba(79,141,187,0.08)]">
              <div className="flex items-center gap-2 text-base font-semibold text-[color:var(--text-dark)]">
                <CalendarDays className="size-4 text-[color:var(--brand-primary)]" />
                Recommended Exams
              </div>
              <p className="mt-2 text-sm text-[color:var(--text-muted)]">
                Critical deadlines tailored to your profile
              </p>
              <div className="mt-4 space-y-3">
                {[
                  { title: "JEE Main 2026", date: "Jan 24 - Feb 01", tag: "Upcoming" },
                  { title: "NEET UG 2026", date: "May 04, 2026", tag: "Upcoming" },
                  { title: "TNEA Counseling", date: "July 2026 Expected", tag: "Upcoming" },
                ].map((exam) => (
                  <div
                    key={exam.title}
                    className="rounded-xl border border-[rgba(79,141,187,0.12)] bg-[rgba(248,252,255,0.9)] p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-semibold text-[color:var(--text-dark)]">{exam.title}</div>
                      <span className="rounded-full bg-[rgba(79,141,187,0.12)] px-2 py-0.5 text-[10px] font-semibold text-[color:var(--brand-primary)]">
                        {exam.tag}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-[color:var(--text-muted)]">{exam.date}</div>
                    <button
                      type="button"
                      className="mt-3 text-xs font-semibold text-[color:var(--brand-primary)]"
                    >
                      Portal <ArrowUpRight className="ml-1 inline size-3" />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[1.6rem] border border-[rgba(79,141,187,0.12)] bg-white p-6 shadow-[0_18px_40px_rgba(79,141,187,0.08)]">
              <div className="text-sm font-semibold text-[color:var(--text-dark)]">Academic Tools</div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  { label: "Mock Tests", icon: BookOpen },
                  { label: "Past Papers", icon: FileText },
                  { label: "Syllabus Tracker", icon: Target },
                  { label: "Campus Tours", icon: MapPin },
                ].map((tool) => (
                  <button
                    key={tool.label}
                    type="button"
                    className="flex items-center gap-2 rounded-xl border border-[rgba(79,141,187,0.12)] bg-[rgba(248,252,255,0.9)] px-3 py-3 text-xs font-semibold text-[color:var(--text-dark)] transition hover:border-[rgba(79,141,187,0.28)]"
                  >
                    <tool.icon className="size-4 text-[color:var(--brand-primary)]" />
                    {tool.label}
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-[1.6rem] border border-[rgba(79,141,187,0.18)] bg-[color:var(--text-dark)] p-6 text-white shadow-[0_18px_40px_rgba(79,141,187,0.16)]">
              <div className="text-sm font-semibold uppercase tracking-[0.16em] text-[rgba(255,255,255,0.6)]">
                Summary Report
              </div>
              <p className="mt-3 text-sm text-[rgba(255,255,255,0.8)]">
                Download a detailed PDF analysis of your current standing and college prospects.
              </p>
              <button
                type="button"
                className="mt-5 w-full rounded-full bg-white px-4 py-2 text-xs font-semibold text-[color:var(--text-dark)]"
              >
                Download Analysis PDF
              </button>
            </section>

            <section className="rounded-[1.6rem] border border-[rgba(79,141,187,0.12)] bg-white p-6 shadow-[0_18px_40px_rgba(79,141,187,0.08)]">
              <div className="text-sm font-semibold text-[color:var(--text-dark)]">Quick Summary</div>
              <div className="mt-3 space-y-2 text-xs text-[color:var(--text-muted)]">
                <div>Level: <span className="font-semibold text-[color:var(--text-dark)]">{summaryLevel}</span></div>
                <div>Degree: <span className="font-semibold text-[color:var(--text-dark)]">{summaryDegree}</span></div>
                <div>Course: <span className="font-semibold text-[color:var(--text-dark)]">{summaryCourse}</span></div>
                <div>Specialization: <span className="font-semibold text-[color:var(--text-dark)]">{summarySpecialization}</span></div>
                <div>Entered Cutoff: <span className="font-semibold text-[color:var(--brand-primary)]">{summaryCutoff}</span></div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </section>
  );
}

