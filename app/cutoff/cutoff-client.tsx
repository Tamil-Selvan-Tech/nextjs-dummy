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
import Image from "next/image";
import { parseCutoffValue } from "@/lib/cutoff-utils";
import { normalizeText, type College, type Course } from "@/lib/site-data";

type CutoffClientProps = {
  selectedLevel: string;
  selectedDegree: string;
  selectedCourse: string;
  selectedSpecialization: string;
  selectedCategory: string;
  selectedCollegeType: string;
  enteredCutoff: string;
  colleges: College[];
  courses: Course[];
};

export function CutoffClient({
  selectedLevel,
  selectedDegree,
  selectedCourse,
  selectedSpecialization,
  selectedCategory,
  selectedCollegeType,
  enteredCutoff,
  colleges,
  courses,
}: CutoffClientProps) {
  const summaryLevel = selectedLevel || "11";
  const summaryDegree = selectedDegree || "Engineering";
  const summaryCourse = selectedCourse || "-";
  const summarySpecialization = selectedSpecialization || "-";
  const summaryCutoff = enteredCutoff || "184.5";
  const cutoffMax = summaryDegree === "Medical" ? 720 : 200;
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
  const resolveCategoryKey = (value: string) => {
    const normalized = normalizeText(value);
    if (!normalized) return "";
    const categoryMap: Record<string, string> = {
      general: "OC",
      obc: "BC",
      sc: "SC",
      st: "ST",
      ews: "OC",
    };
    return (categoryMap[normalized] || normalized).toUpperCase();
  };
  const parseSelectedCourse = (value: string) => {
    const parts = String(value || "")
      .split(" - ")
      .map((item) => item.trim())
      .filter(Boolean);
    if (parts.length === 0) return { courseType: "", specialization: "" };
    const [courseType, ...rest] = parts;
    return { courseType, specialization: rest.join(" - ") };
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

  const matchingCards = useMemo(() => {
    if (!courses.length || !colleges.length) return [];
    const categoryKey = resolveCategoryKey(selectedCategory);
    const normalizedCollegeType = normalizeText(selectedCollegeType);
    const normalizeCollegeType = (value: string) => {
      const normalized = normalizeText(value);
      if (!normalized) return "";
      if (
        normalized.includes("government") ||
        normalized.includes("govt") ||
        normalized.includes("public") ||
        normalized.includes("state")
      ) {
        return "government";
      }
      if (
        normalized.includes("private") ||
        normalized.includes("self") ||
        normalized.includes("deemed")
      ) {
        return "private";
      }
      return normalized;
    };
    const selectedCollegeTypeKey = normalizeCollegeType(normalizedCollegeType);
    const { courseType: selectedCourseType, specialization: selectedCourseSpecialization } =
      parseSelectedCourse(selectedCourse);
    const normalizeMatchText = (value: string | null | undefined) =>
      normalizeText(value).replace(/[^a-z0-9]/g, "");
    const normalizedCourseSearch = normalizeMatchText(selectedCourse);
    const normalizedCourseType = normalizeMatchText(selectedCourseType);
    const normalizedSpecialization = normalizeMatchText(
      selectedSpecialization || selectedCourseSpecialization,
    );
    const userCutoff = parseCutoffValue(enteredCutoff);
    const userScore = userCutoff ? Math.max(userCutoff.start, userCutoff.end) : null;
    const degreeTokens =
      summaryDegree === "Arts & Science"
        ? ["arts", "science"]
        : [normalizeText(summaryDegree)];

    const resolveCutoffByCategory = (
      entries: Array<{ category: string; cutoff: string }> | undefined,
      category: string,
    ) => {
      if (!entries?.length || !category) return "";
      const resolved = entries.find(
        (entry) => normalizeText(entry.category) === normalizeText(category),
      );
      return resolved?.cutoff || "";
    };

    const matchesDegree = (course: Course) => {
      if (!degreeTokens[0]) return true;
      const haystack = [
        course.stream,
        course.courseCategory,
        course.degreeType,
        course.courseType,
      ]
        .map((value) => normalizeText(value))
        .join(" ");
      return degreeTokens.some((token) => token && haystack.includes(token));
    };

    const matchesCourseSelection = (course: Course) => {
      if (!normalizedCourseSearch && !normalizedCourseType && !normalizedSpecialization) {
        return true;
      }
      const courseName = normalizeMatchText(course.course || course.courseName || "");
      const courseType = normalizeMatchText(course.courseType || course.course || "");
      const specialization = normalizeMatchText(
        course.specialization || course.courseName || course.courseCategory || "",
      );
      const combinedCourse = `${courseType}${specialization}`;
      if (normalizedCourseSearch) {
        if (courseName && courseName.includes(normalizedCourseSearch)) return true;
        if (combinedCourse && combinedCourse.includes(normalizedCourseSearch)) return true;
        if (normalizedCourseSearch.includes(courseName) && courseName) return true;
      }
      if (normalizedCourseType && courseType.includes(normalizedCourseType)) {
        if (!normalizedSpecialization) return true;
        return specialization.includes(normalizedSpecialization);
      }
      if (normalizedSpecialization && specialization.includes(normalizedSpecialization)) return true;
      return false;
    };

    const matchesCollegeType = (college: College) => {
      if (!selectedCollegeTypeKey) return true;
      const ownership = normalizeCollegeType(college.ownershipType || "");
      if (ownership && ownership.includes(selectedCollegeTypeKey)) return true;
      if (college.quotas?.length) {
        return college.quotas.some((quota) =>
          normalizeCollegeType(quota).includes(selectedCollegeTypeKey),
        );
      }
      if (!ownership && (!college.quotas || college.quotas.length === 0)) {
        return true;
      }
      return false;
    };

    const matchingMap = new Map<
      string,
      {
        id: string;
        name: string;
        location: string;
        cutoff: string;
        match: string;
        image: string;
        tags: string[];
        href: string;
        score: number;
      }
    >();

    courses.forEach((course) => {
      const courseSelectionMatch = matchesCourseSelection(course);
      const degreeMatch = matchesDegree(course);
      if (!courseSelectionMatch && !degreeMatch) return;
      const courseDetails =
        course.collegeDetails && course.collegeDetails.length > 0
          ? course.collegeDetails
          : [
              {
                college: course.collegeId || course.college,
                cutoff: course.cutoff,
                cutoffByCategory: course.cutoffByCategory || [],
              },
            ];

      courseDetails.forEach((detail) => {
        const collegeKey = normalizeText(detail.college || "");
        if (!collegeKey) return;
        const college = colleges.find(
          (item) =>
            normalizeText(item.id) === collegeKey ||
            normalizeText(item.name) === collegeKey ||
            normalizeText(item.university) === collegeKey,
        );
        if (!college) return;
        if (!matchesCollegeType(college)) return;

        const categoryCutoff =
          resolveCutoffByCategory(detail.cutoffByCategory, categoryKey) ||
          resolveCutoffByCategory(course.cutoffByCategory, categoryKey);
        const rawCutoff =
          categoryCutoff ||
          detail.cutoffText ||
          course.cutoffText ||
          detail.cutoff ||
          course.cutoff;
        const parsedCutoff = parseCutoffValue(rawCutoff);
        const cutoffLabel = parsedCutoff
          ? parsedCutoff.start === parsedCutoff.end
            ? `${parsedCutoff.start}`
            : `${parsedCutoff.start} - ${parsedCutoff.end}`
          : rawCutoff
            ? String(rawCutoff)
            : "N/A";

        if (userScore !== null && parsedCutoff && userScore < parsedCutoff.start) return;

        const target = parsedCutoff ? parsedCutoff.end : null;
        const ratio = userScore !== null && target ? userScore / target : 0.75;
        const score = Math.max(55, Math.min(99, Math.round(ratio * 100)));

        const tags = [
          course.courseType || course.courseCategory || summaryDegree,
          course.specialization || course.courseName,
          categoryKey ? `${categoryKey} Cutoff` : "",
        ]
          .map((tag) => String(tag || "").trim())
          .filter(Boolean)
          .slice(0, 3);

        const existing = matchingMap.get(college.id);
        if (!existing || score > existing.score) {
          matchingMap.set(college.id, {
            id: college.id,
            name: college.name,
            location: [college.district, college.state].filter(Boolean).join(", "),
            cutoff: cutoffLabel,
            match: `${score}% Match`,
            image: college.image,
            tags,
            href: `/college/${college.id}`,
            score,
          });
        }
      });
    });

    return Array.from(matchingMap.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
  }, [
    colleges,
    courses,
    enteredCutoff,
    selectedCategory,
    selectedCollegeType,
    selectedCourse,
    selectedSpecialization,
    summaryDegree,
  ]);

  if (isJuniorLevel) {
    return (
        <section
        className="min-h-screen bg-white text-[color:var(--text-dark)]"
        style={
          {
            "--brand-primary": "#1E4FA3",
            "--brand-primary-soft": "#2E6BD1",
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
              <section className="rounded-[1.6rem] border border-[rgba(15,76,129,0.08)] bg-white p-6 shadow-[0_18px_40px_rgba(15,76,129,0.08)]">
                <div className="flex items-center gap-2 text-base font-semibold text-[color:var(--text-dark)]">
                  <CalendarDays className="size-4 text-[color:var(--brand-primary)]" />
                  Recommended Exams
                </div>
                <p className="mt-2 text-sm text-[color:var(--text-muted)]">
                  Critical deadlines tailored to your profile
                </p>
                <div className="mt-4 space-y-3">
                  {examCards.map((exam) => (
                    <div
                      key={exam.title}
                      className="rounded-xl border border-[rgba(15,76,129,0.08)] bg-white p-4 shadow-[0_10px_24px_rgba(15,76,129,0.06)]"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[rgba(30,79,163,0.12)] text-[color:rgb(24,64,132)]">
                          <BookOpen className="size-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <div className="text-sm font-semibold text-[color:var(--text-dark)]">{exam.title}</div>
                            <span className="rounded-full border border-[rgba(30,79,163,0.18)] bg-[rgba(30,79,163,0.1)] px-2 py-0.5 text-[10px] font-semibold text-[color:rgb(24,64,132)]">
                              {exam.tag}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-[color:var(--text-muted)]">
                            Check official portal for dates and updates.
                          </p>
                          <div className="mt-2 flex items-center justify-between text-[11px] text-[color:rgb(24,64,132)]">
                            <span>{exam.date}</span>
                            <button type="button" className="font-semibold text-[color:var(--brand-primary)]">
                              Portal <ArrowUpRight className="ml-1 inline size-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </aside>
          </div>

          <section className="mt-6 rounded-[1.6rem] border border-[rgba(79,141,187,0.14)] bg-white p-6 shadow-[0_18px_40px_rgba(79,141,187,0.08)]">
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

            <div className="mt-5 rounded-2xl border border-[rgba(79,141,187,0.12)] bg-[rgba(248,252,255,0.9)] p-4">
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
                <label className="flex items-center gap-2 rounded-full border border-[rgba(79,141,187,0.12)] bg-[rgba(248,252,255,0.9)] px-3 py-2 text-xs text-[color:var(--text-muted)]">
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
                <span className="rounded-full border border-[rgba(79,141,187,0.12)] bg-[rgba(248,252,255,0.9)] px-3 py-1 text-[11px] font-semibold text-[color:var(--text-dark)]">
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
                        className="rounded-full border border-[rgba(79,141,187,0.12)] bg-[rgba(248,252,255,0.9)] px-3 py-1 text-[10px] font-semibold text-[color:var(--text-dark)]"
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
          "--brand-primary": "#1E4FA3",
          "--brand-primary-soft": "#2E6BD1",
        } as CSSProperties
      }
    >
      <Navbar />
      <div className="page-container-full py-10 md:py-12">
        <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
          <div className="space-y-6">
            <section className="rounded-[1.6rem] border border-[rgba(30,79,163,0.16)] bg-[rgba(228,237,255,0.9)] p-6 shadow-[0_18px_40px_rgba(30,79,163,0.14)] md:p-7">
              <div className="flex flex-wrap items-start justify-between gap-6">
                <div>
                  <span className="inline-flex rounded-full border border-[rgba(30,79,163,0.24)] bg-[rgba(30,79,163,0.12)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:rgb(24,64,132)]">
                    Current Analysis
                  </span>
                  <h1 className="mt-4 text-2xl font-bold text-[color:var(--text-dark)] md:text-3xl">
                    Level: <span className="text-[color:rgb(24,64,132)]">{summaryLevel}th Grade</span>
                  </h1>
                  <p className="mt-2 max-w-xl text-sm text-[color:var(--text-muted)] md:text-base">
                    Based on your current academic scores and state-level standards, here is your predicted cutoff estimate for 2025.
                  </p>
                </div>
                <div className="min-w-[220px] rounded-2xl border border-[rgba(30,79,163,0.2)] bg-white p-4 text-center shadow-[0_14px_30px_rgba(30,79,163,0.12)]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--text-muted)]">
                    Estimated Cutoff
                  </p>
                <div className="mt-3 flex items-end justify-center gap-2">
                  <span className="text-3xl font-bold text-[color:var(--text-dark)] md:text-4xl">{summaryCutoff}</span>
                    <span className="text-sm font-semibold text-[color:var(--text-muted)]">/ {cutoffMax}</span>
                </div>
                  <p className="mt-2 text-xs font-semibold text-[color:rgb(24,64,132)]">Top 15% Percentile</p>
                </div>
              </div>
            </section>

            <section className="rounded-[1.6rem] border border-[rgba(31,108,78,0.08)] bg-white p-6 shadow-[0_18px_40px_rgba(15,76,129,0.08)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-base font-semibold text-[color:var(--text-dark)]">
                  <Target className="size-4 text-[color:var(--brand-primary)]" />
                  Suggested Matchings
                </div>
                <button
                  type="button"
                  className="rounded-full border border-[rgba(30,79,163,0.3)] px-3 py-1 text-xs font-semibold text-[color:var(--brand-primary)] transition hover:bg-[rgba(30,79,163,0.08)]"
                >
                  View All Matching
                </button>
              </div>
              <p className="mt-2 text-sm text-[color:var(--text-muted)]">
                Colleges aligned with your current estimated score
              </p>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {matchingCards.length ? (
                  matchingCards.map((college) => (
                    <article
                      key={college.id}
                      className="flex h-full flex-col overflow-hidden rounded-2xl border border-[rgba(15,76,129,0.08)] bg-white shadow-[0_12px_26px_rgba(15,76,129,0.08)]"
                    >
                      <div className="relative h-32 w-full bg-[rgba(15,76,129,0.08)]">
                        <Image
                          src={college.image}
                          alt={`${college.name} campus`}
                          fill
                          sizes="(min-width: 1024px) 300px, (min-width: 768px) 30vw, 100vw"
                          className="object-cover"
                        />
                        <div className="absolute right-3 top-3 rounded-full bg-[rgba(30,79,163,0.18)] px-2.5 py-1 text-[10px] font-semibold text-[color:rgb(24,64,132)]">
                          {college.match}
                        </div>
                      </div>
                      <div className="flex h-full flex-col p-4">
                        <h3 className="text-sm font-semibold text-[color:var(--text-dark)]">{college.name}</h3>
                        <div className="mt-1 flex items-center gap-1 text-xs text-[color:var(--text-muted)]">
                          <MapPin className="size-3" />
                          {college.location || "Location not listed"}
                        </div>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {college.tags.map((tag, index) => (
                            <span
                              key={`${college.id}-${tag}-${index}`}
                              className="rounded-full border border-[rgba(15,76,129,0.12)] bg-[rgba(15,76,129,0.04)] px-2 py-0.5 text-[10px] font-semibold text-[color:var(--text-muted)]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="mt-auto flex items-center justify-between pt-4 text-[11px] text-[color:var(--text-muted)]">
                          <span>
                            Avg Cutoff{" "}
                            <span className="font-semibold text-[color:var(--text-dark)]">{college.cutoff}</span>
                          </span>
                          <Link href={college.href} className="font-semibold text-[color:var(--brand-primary)]">
                            Details <ArrowUpRight className="ml-1 inline size-3" />
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))
                ) : (
                  <p className="text-sm text-[color:var(--text-muted)]">
                    No matching colleges found for the selected course and cutoff.
                  </p>
                )}
              </div>
            </section>

            {summaryLevel === "11" ? (
              <section className="rounded-[1.6rem] border border-[rgba(30,79,163,0.12)] bg-[rgba(228,237,255,0.7)] p-6 shadow-[0_18px_40px_rgba(30,79,163,0.08)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-base font-semibold text-[color:var(--text-dark)]">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[rgba(30,79,163,0.12)]">
                        <Target className="size-4 text-[color:rgb(30,79,163)]" />
                      </div>
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
                    {
                      name: "Anna University (CEG)",
                      city: "Chennai, Tamil Nadu",
                      require: "Requires 197 Cutoff",
                      need: "+12.5 marks",
                      image: "/college-hero.jpg",
                    },
                    {
                      name: "Madras Institute of Technology",
                      city: "Chromepet, Chennai",
                      require: "Requires 193 Cutoff",
                      need: "+8.5 marks",
                      image: "/college-hero-v2.jpg",
                    },
                  ].map((college) => (
                    <article
                      key={college.name}
                      className="rounded-2xl border border-[rgba(15,76,129,0.1)] bg-white p-4 shadow-[0_10px_24px_rgba(15,76,129,0.06)]"
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative h-14 w-14 overflow-hidden rounded-xl border border-[rgba(15,76,129,0.12)] bg-[rgba(15,76,129,0.08)]">
                          <Image
                            src={college.image}
                            alt={college.name}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-[color:var(--text-dark)]">{college.name}</div>
                          <div className="mt-1 flex items-center gap-1 text-xs text-[color:var(--text-muted)]">
                            <MapPin className="size-3" />
                            {college.city}
                          </div>
                          <span className="mt-2 inline-flex rounded-full bg-[rgba(30,79,163,0.14)] px-2.5 py-1 text-[10px] font-semibold text-[color:rgb(24,64,132)]">
                            {college.require}
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between text-[11px] text-[color:var(--text-muted)]">
                        <span className="font-semibold text-[color:var(--text-dark)]">Need {college.need}</span>
                        <button type="button" className="font-semibold text-[color:var(--brand-primary)]">
                          Preparation Guide
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[rgba(15,76,129,0.08)] bg-white p-4">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 overflow-hidden rounded-full border border-[rgba(15,76,129,0.12)] bg-[rgba(15,76,129,0.08)]">
                      <Image src="/student.png" alt="Mentor" fill sizes="40px" className="object-cover" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[color:var(--text-dark)]">Academic Improvement Plan</div>
                      <div className="text-xs text-[color:var(--text-muted)]">
                        Our mentors can help you bridge the 12.5 mark gap.
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="rounded-full bg-[color:var(--brand-primary)] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[color:var(--brand-primary-soft)]"
                  >
                    Get Study Roadmap
                  </button>
                </div>
              </section>
            ) : null}
          </div>

          <aside className="space-y-6">
            <section className="rounded-[1.6rem] border border-[rgba(15,76,129,0.08)] bg-white p-6 shadow-[0_18px_40px_rgba(15,76,129,0.08)]">
              <div className="flex items-center gap-2 text-base font-semibold text-[color:var(--text-dark)]">
                <CalendarDays className="size-4 text-[color:var(--brand-primary)]" />
                Recommended Exams
              </div>
              <p className="mt-2 text-sm text-[color:var(--text-muted)]">
                Critical deadlines tailored to your profile
              </p>
              <div className="mt-4 space-y-3">
                {[
                  {
                    title: "JEE Main 2025",
                    desc: "Gateway to NITs, IIITs and GFTIs. Essential for all engineering aspirants.",
                    date: "Jan 24 - Feb 01",
                    icon: BookOpen,
                    tag: "Upcoming",
                  },
                  {
                    title: "NEET UG 2025",
                    desc: "National level medical entrance exam for MBBS/BDS courses across India.",
                    date: "May 04, 2025",
                    icon: Stethoscope,
                    tag: "Upcoming",
                  },
                  {
                    title: "TNEA Counseling",
                    desc: "Tamil Nadu Engineering Admissions single-window counseling process.",
                    date: "July 2025 Expected",
                    icon: GraduationCap,
                    tag: "Upcoming",
                  },
                ].map((exam) => (
                  <div
                    key={exam.title}
                    className="rounded-xl border border-[rgba(15,76,129,0.08)] bg-white p-4 shadow-[0_10px_24px_rgba(15,76,129,0.06)]"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[rgba(30,79,163,0.12)] text-[color:rgb(24,64,132)]">
                        <exam.icon className="size-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-sm font-semibold text-[color:var(--text-dark)]">{exam.title}</div>
                          <span className="rounded-full border border-[rgba(30,79,163,0.18)] bg-[rgba(30,79,163,0.1)] px-2 py-0.5 text-[10px] font-semibold text-[color:rgb(24,64,132)]">
                            {exam.tag}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-[color:var(--text-muted)]">{exam.desc}</p>
                        <div className="mt-2 flex items-center justify-between text-[11px] text-[color:rgb(24,64,132)]">
                          <span>{exam.date}</span>
                          <button type="button" className="font-semibold text-[color:var(--brand-primary)]">
                            Portal <ArrowUpRight className="ml-1 inline size-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-xl border border-[rgba(15,76,129,0.08)] bg-white p-4 shadow-[0_10px_24px_rgba(15,76,129,0.06)]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-[color:var(--text-dark)]">Exclusive Workshop</div>
                    <p className="mt-1 text-xs text-[color:var(--text-muted)]">
                      Join our “Mastering JEE 2025” webinar this weekend with IIT Madras alumni.
                    </p>
                  </div>
                  <Award className="size-6 text-[rgba(15,76,129,0.2)]" />
                </div>
                <button
                  type="button"
                  className="mt-3 w-full rounded-full border border-[rgba(15,76,129,0.12)] px-4 py-2 text-xs font-semibold text-[color:var(--text-dark)]"
                >
                  Register For Free
                </button>
              </div>
            </section>

            <section className="rounded-[1.6rem] border border-[rgba(15,76,129,0.08)] bg-white p-6 shadow-[0_18px_40px_rgba(15,76,129,0.08)]">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--text-muted)]">
                Academic Tools
              </div>
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
                    className="flex flex-col items-center justify-center gap-2 rounded-xl border border-[rgba(15,76,129,0.1)] bg-white px-3 py-4 text-[11px] font-semibold text-[color:var(--text-dark)] shadow-[0_8px_18px_rgba(15,76,129,0.05)] transition hover:border-[rgba(47,174,99,0.3)]"
                  >
                    <tool.icon className="size-4 text-[color:var(--brand-primary)]" />
                    {tool.label}
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-[1.6rem] border border-[rgba(15,76,129,0.18)] bg-[color:#0f172a] p-6 text-white shadow-[0_18px_40px_rgba(15,76,129,0.16)]">
              <div className="text-sm font-semibold uppercase tracking-[0.16em] text-[rgba(255,255,255,0.6)]">
                Summary Report
              </div>
              <p className="mt-3 text-sm text-[rgba(255,255,255,0.8)]">
                Download a detailed 12-page PDF analysis of your 11th grade standing and college prospects.
              </p>
              <button
                type="button"
                className="mt-5 w-full rounded-full bg-white px-4 py-2 text-xs font-semibold text-[color:#0f172a]"
              >
                Download Analysis PDF
              </button>
            </section>
          </aside>
        </div>
      </div>
    </section>
  );
}

