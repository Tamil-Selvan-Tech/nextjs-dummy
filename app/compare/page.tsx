"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeIndianRupee,
  Building2,
  Download,
  Dumbbell,
  GraduationCap,
  Hospital,
  Heart,
  Laptop,
  Library,
  MapPin,
  Medal,
  Monitor,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trophy,
  Wifi,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CollegeLogoBadge } from "@/components/college-logo-badge";
import { Navbar } from "@/components/navbar";
import { PopularComparisons } from "@/components/popular-comparisons";
import { readAuthToken } from "@/lib/auth-storage";
import { fetchPublicPanelData } from "@/lib/public-data";
import { formatCompactIndianCurrency, formatCompactIndianCurrencyRange } from "@/lib/currency-format";
import { formatRankingRangeForDisplay } from "@/lib/ranking-utils";
import {
  colleges,
  courses as fallbackCourses,
  getCoursesForCollege,
  normalizeText,
  type Course,
  type College,
} from "@/lib/site-data";

type CompareCollege = College | null;

const PDF_PAGE_WIDTH = 595.28;
const PDF_PAGE_HEIGHT = 841.89;
const PDF_MARGIN = 40;
const PDF_BOTTOM_GAP = 40;

const sectionCards = [
  { key: "overview", title: "Institute Information", icon: GraduationCap },
  { key: "ranking", title: "Ranking & Recognition", icon: Trophy },
  { key: "fees", title: "Course Details", icon: BadgeIndianRupee },
  { key: "cutoff", title: "Admission Quotas", icon: Medal },
  { key: "facilities", title: "Infrastructure & Facilities", icon: Library },
];

const facilityIconMap: Record<string, typeof Library> = {
  Library,
  Hostel: ShieldCheck,
  "Medical Center": Hospital,
  Hospital,
  Labs: GraduationCap,
  "Specialized computer labs": Laptop,
  "Computer Labs": Laptop,
  "Academic & IT Infrastructure": Monitor,
  "ICT-enabled classrooms": Monitor,
  "Innovation Hub": GraduationCap,
  "Incubation Center": GraduationCap,
  Sports: Trophy,
  "Sports & Wellness": Dumbbell,
  Gym: Dumbbell,
  "Wi-Fi": Wifi,
  WiFi: Wifi,
  "Accommodations": Building2,
  "Accommodation": Building2,
};

const getFacilityIcon = (facility: string) => {
  const key = facility.trim();
  if (facilityIconMap[key]) return facilityIconMap[key];
  const normalized = key.toLowerCase();
  if (normalized.includes("lab")) return Laptop;
  if (normalized.includes("library")) return Library;
  if (normalized.includes("hostel") || normalized.includes("accommodation")) return Building2;
  if (normalized.includes("sport") || normalized.includes("wellness") || normalized.includes("gym"))
    return Dumbbell;
  if (normalized.includes("hospital") || normalized.includes("medical")) return Hospital;
  if (normalized.includes("wifi") || normalized.includes("wi-fi")) return Wifi;
  if (normalized.includes("ict") || normalized.includes("it") || normalized.includes("computer"))
    return Monitor;
  return ShieldCheck;
};

const sanitizePdfText = (value: unknown) =>
  String(value ?? "")
    .replace(/\r?\n+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/[^\x20-\x7E]/g, "")
    .trim();

const escapePdfText = (value: string) =>
  value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

const slugifyFilenamePart = (value: string) =>
  sanitizePdfText(value)
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const buildComparePdfFilename = (collegesToExport: College[]) => {
  const names = collegesToExport.map((college) => slugifyFilenamePart(college.name)).filter(Boolean);
  if (!names.length) return "compare.pdf";
  if (names.length === 1) return `${names[0]}-compare.pdf`;
  return `${names.join("-vs-")}.pdf`;
};

const wrapPdfText = (text: string, maxChars: number) => {
  const normalized = sanitizePdfText(text);
  if (!normalized) return [""];

  const words = normalized.split(" ");
  const lines: string[] = [];
  let current = "";

  words.forEach((word) => {
    if (!current) {
      current = word;
      return;
    }

    if ((current + " " + word).length <= maxChars) {
      current += ` ${word}`;
      return;
    }

    lines.push(current);
    current = word;
  });

  if (current) lines.push(current);
  return lines.length ? lines : [normalized];
};

const approxMaxChars = (usableWidth: number, fontSize: number) =>
  Math.max(20, Math.floor(usableWidth / (fontSize * 0.52)));

type PdfPageItem = {
  text: string;
  x: number;
  y: number;
  size: number;
  bold?: boolean;
};

const generatePdfBlob = (pages: PdfPageItem[][]) => {
  const totalPages = pages.length;
  const fontRegularObject = 3;
  const fontBoldObject = 4;
  const contentStartObject = 5;
  const pageStartObject = contentStartObject + totalPages;
  const objects: string[] = new Array(pageStartObject + totalPages);

  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[2] = `<< /Type /Pages /Kids [${Array.from({ length: totalPages }, (_, index) => `${pageStartObject + index} 0 R`).join(" ")}] /Count ${totalPages} >>`;
  objects[fontRegularObject] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";
  objects[fontBoldObject] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>";

  pages.forEach((pageItems, index) => {
    const contentObjectNumber = contentStartObject + index;
    const pageObjectNumber = pageStartObject + index;
    const contentStream = pageItems
      .map((item) => `BT /${item.bold ? "F2" : "F1"} ${item.size} Tf ${item.x.toFixed(2)} ${item.y.toFixed(2)} Td (${escapePdfText(item.text)}) Tj ET`)
      .join("\n");
    objects[contentObjectNumber] = `<< /Length ${contentStream.length} >>\nstream\n${contentStream}\nendstream`;
    objects[pageObjectNumber] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PDF_PAGE_WIDTH.toFixed(2)} ${PDF_PAGE_HEIGHT.toFixed(2)}] ` +
      `/Resources << /Font << /F1 ${fontRegularObject} 0 R /F2 ${fontBoldObject} 0 R >> >> ` +
      `/Contents ${contentObjectNumber} 0 R >>`;
  });

  let pdf = "%PDF-1.4\n%\xFF\xFF\xFF\xFF\n";
  const offsets: number[] = [0];

  for (let objectNumber = 1; objectNumber < objects.length; objectNumber += 1) {
    const objectBody = objects[objectNumber];
    if (!objectBody) continue;
    offsets[objectNumber] = pdf.length;
    pdf += `${objectNumber} 0 obj\n${objectBody}\nendobj\n`;
  }

  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length}\n`;
  pdf += "0000000000 65535 f \n";
  for (let objectNumber = 1; objectNumber < objects.length; objectNumber += 1) {
    const offset = offsets[objectNumber] || 0;
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return new Blob([pdf], { type: "application/pdf" });
};

function formatPlacementRateDisplay(value: unknown) {
  const raw = String(value ?? "").trim();
  if (!raw) return "Not available";

  const numericValue = typeof value === "number" ? value : Number(raw.replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return "Not available";
  }

  const percentageValue = numericValue > 0 && numericValue <= 1 ? numericValue * 100 : numericValue;
  return `${Number(percentageValue.toFixed(1)).toString()}%`;
}

const comparisonPairs = [
  { label: "University", value: (college: College) => college.university || "-" },
  { label: "Location", value: (college: College) => `${college.district}, ${college.state}` },
  { label: "Established Year", value: (college: College) => college.establishedYear || "-" },
  { label: "Ownership Type", value: (college: College) => college.ownershipType || "-" },
  {
    label: "Placement Rate",
    value: (college: College) =>
      formatPlacementRateDisplay(
        (college.placements as Record<string, unknown> | undefined)?.placementRate ?? college.placementRate ?? 0,
      ),
  },
  { label: "Hostel", value: (college: College) => (college.hasHostel ? "Available" : "Not Available") },
];

const toList = (value: unknown) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }
  return String(value || "")
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
};

const getFeeRangeFromStructure = (college: College) => {
  const structure = college.feesStructure as Record<string, unknown> | undefined;
  if (!structure || typeof structure !== "object") return "";
  const tuition = (structure.tuitionFee as Record<string, unknown> | undefined) || structure;
  const min = (tuition.minAmount ?? structure.minAmount ?? tuition.min ?? structure.min ?? "") as
    | string
    | number;
  const max = (tuition.maxAmount ?? structure.maxAmount ?? tuition.max ?? structure.max ?? "") as
    | string
    | number;
  if (!min && !max) return "";
  return formatCompactIndianCurrencyRange(min, max);
};

const getRelatedCoursesForCollege = (college: College, courseData: Course[]) => {
  const collegeIdentityValues = getCollegeIdentityValues(college);

  return courseData.filter((course) => {
    const courseIdentityValues = [course.collegeId || "", course.collegeCode || "", course.college || ""]
      .map((value) => normalizeText(value))
      .filter(Boolean);

    if (courseIdentityValues.some((value) => collegeIdentityValues.includes(value))) {
      return true;
    }

    return course.collegeDetails.some((detail) =>
      [detail.college, detail.collegeId, detail.collegeCode].some((value) =>
        collegeIdentityValues.includes(normalizeText(value || "")),
      ),
    );
  });
};

const getCourseSummary = (college: College, courseData: Course[] = fallbackCourses) => {
  const scopedCourses = resolveCollegeScopedCourses(college, courseData);
  const fees = scopedCourses.map((course) => course.totalFees);
  const validFees = fees.filter((value) => Number.isFinite(value));
  const adminFeeRange = getFeeRangeFromStructure(college);
  const feesRange = validFees.length
    ? formatCompactIndianCurrencyRange(Math.min(...validFees), Math.max(...validFees))
    : "Not available";
  return {
    totalCourses: scopedCourses.length,
    fees: adminFeeRange || feesRange,
  };
};

const getCollegeIdentityValues = (college: College) =>
  [college.id, (college as { collegeCode?: string }).collegeCode || "", college.name]
    .map((value) => normalizeText(value))
    .filter(Boolean);

const resolveCollegeScopedCourses = (college: College, courseData: Course[]) => {
  const collegeIdentityValues = getCollegeIdentityValues(college);
  const relatedCourses = getRelatedCoursesForCollege(college, courseData);
  const matchingRelatedCourses = relatedCourses.length ? relatedCourses : getCoursesForCollege(college.name);

  const pickLatestRepeatedEntranceExam = (
    exams: (typeof matchingRelatedCourses)[number]["entranceExams"],
  ) => {
    if (!Array.isArray(exams) || exams.length <= 1) return exams || [];

    const counts = new Map<string, number>();
    exams.forEach((exam) => {
      const key = normalizeText(exam.examName);
      if (key) counts.set(key, (counts.get(key) || 0) + 1);
    });

    const repeatedExamName = [...counts.entries()]
      .filter(([, count]) => count > 1)
      .sort((first, second) => second[1] - first[1])[0]?.[0];

    if (!repeatedExamName) return exams;

    const repeatedExams = exams.filter((exam) => normalizeText(exam.examName) === repeatedExamName);
    const latestRepeatedExamWithoutCutoff = [...repeatedExams]
      .reverse()
      .find(
        (exam) =>
          !normalizeText(exam.cutoffScoreOrRank) &&
          (normalizeText(exam.paperOrSyllabus) || normalizeText(exam.preparationNotes)),
      );
    const latestRepeatedExam =
      latestRepeatedExamWithoutCutoff || [...repeatedExams].reverse().find(Boolean);

    return latestRepeatedExam ? [latestRepeatedExam] : exams;
  };

  return matchingRelatedCourses.map((course) => {
    const matchingCollegeDetail = course.collegeDetails.find((detail) =>
      [detail.college, detail.collegeId, detail.collegeCode].some((value) =>
        collegeIdentityValues.includes(normalizeText(value || "")),
      ),
    );
    const hasExamCollegeScope = course.entranceExams?.some(
      (exam) => normalizeText(exam.collegeId) || normalizeText(exam.college) || normalizeText(exam.collegeCode),
    );
    const scopedEntranceExams = hasExamCollegeScope
      ? course.entranceExams?.filter(
          (exam) =>
            normalizeText(exam.collegeId) === normalizeText(college.id) ||
            normalizeText(exam.college) === normalizeText(college.name) ||
            normalizeText(exam.collegeCode) === normalizeText((college as { collegeCode?: string }).collegeCode),
        )
      : pickLatestRepeatedEntranceExam(course.entranceExams);

    return {
      ...course,
      college: course.college || college.name,
      collegeId: course.collegeId || college.id,
      semesterFees: matchingCollegeDetail?.semesterFees ?? course.semesterFees,
      totalFees: matchingCollegeDetail?.totalFees ?? course.totalFees,
      hostelFees: matchingCollegeDetail?.hostelFees ?? course.hostelFees,
      cutoff: matchingCollegeDetail?.cutoff ?? course.cutoff,
      cutoffText: matchingCollegeDetail?.cutoffText ?? course.cutoffText,
      cutoffByCategory: matchingCollegeDetail?.cutoffByCategory ?? course.cutoffByCategory,
      intake: matchingCollegeDetail?.intake ?? course.intake,
      applicationFee: matchingCollegeDetail?.applicationFee ?? course.applicationFee,
      entranceExams: scopedEntranceExams || [],
    };
  });
};

const getCourseDisplayTitle = (course: Course) =>
  sanitizePdfText(course.courseName || course.course || course.specialization || course.courseType || "Course");

const buildComparePdfPages = (selectedColleges: College[], courseData: Course[]) => {
  const pages: PdfPageItem[][] = [[]];
  let cursorY = PDF_PAGE_HEIGHT - PDF_MARGIN;

  const currentPage = () => pages[pages.length - 1];
  const newPage = () => {
    pages.push([]);
    cursorY = PDF_PAGE_HEIGHT - PDF_MARGIN;
  };

  const addBlank = (amount: number) => {
    cursorY -= amount;
    if (cursorY < PDF_BOTTOM_GAP) {
      newPage();
    }
  };

  const addText = (text: string, size: number, options: { bold?: boolean; indent?: number } = {}) => {
    const indent = options.indent || 0;
    const maxChars = approxMaxChars(PDF_PAGE_WIDTH - PDF_MARGIN * 2 - indent, size);
    const lines = wrapPdfText(text, maxChars);
    lines.forEach((line) => {
      const lineHeight = size * 1.35;
      if (cursorY - lineHeight < PDF_BOTTOM_GAP) {
        newPage();
      }
      currentPage().push({
        text: line,
        x: PDF_MARGIN + indent,
        y: cursorY,
        size,
        bold: options.bold,
      });
      cursorY -= lineHeight;
    });
  };

  const addSectionTitle = (text: string) => {
    addBlank(6);
    addText(text, 15, { bold: true });
    addText("-----------------------------------------------------------------------", 8);
    addBlank(3);
  };

  const addLabelValue = (label: string, value: string, indent = 0) => {
    const labelX = PDF_MARGIN + indent;
    const valueX = labelX + 105;
    const lineHeight = 10.5 * 1.28;
    const labelText = sanitizePdfText(label);
    const valueText = sanitizePdfText(value) || "-";
    const maxChars = approxMaxChars(PDF_PAGE_WIDTH - PDF_MARGIN - valueX, 10.5);
    const valueLines = wrapPdfText(valueText, maxChars);

    if (cursorY - lineHeight < PDF_BOTTOM_GAP) {
      newPage();
    }

    currentPage().push({
      text: labelText,
      x: labelX,
      y: cursorY,
      size: 10.5,
      bold: true,
    });

    valueLines.forEach((line, index) => {
      const lineY = cursorY - index * lineHeight;
      if (lineY - lineHeight < PDF_BOTTOM_GAP) {
        newPage();
      }
      currentPage().push({
        text: line,
        x: valueX,
        y: lineY,
        size: 10.5,
      });
    });

    cursorY -= Math.max(valueLines.length, 1) * lineHeight + 1.5;
  };

  const addCollegeSummary = (college: College, index: number) => {
    const summary = getCourseSummary(college, courseData);
    const placement = formatPlacementRateDisplay(
      (college.placements as Record<string, unknown> | undefined)?.placementRate ?? college.placementRate ?? 0,
    );
    addText(`${index + 1}. ${college.name}`, 13, { bold: true });
    addText("-----------------------------------------------------------------------", 8);
    addLabelValue("University", college.university || "-");
    addLabelValue("Location", `${college.district}, ${college.state}`);
    addLabelValue("Ranking", formatRankingRangeForDisplay(college.ranking));
    addLabelValue("Fees", summary.fees || "Not available");
    addLabelValue("Placement", placement);
    addBlank(4);
  };

  const addCollegeSection = (title: string, college: College) => {
    addText(college.name, 12.5, { bold: true, indent: 6 });
    addText("------------------------------------------------", 8, { indent: 6 });

    if (title === "Institute Information") {
      comparisonPairs.forEach((item) => addLabelValue(item.label, item.value(college), 12));
    } else if (title === "Ranking & Recognition") {
      addLabelValue("Recognition", college.accreditation || "Not available", 12);
      addLabelValue("Current Rank", formatRankingRangeForDisplay(college.ranking), 12);
      addLabelValue("Placement Rate", formatPlacementRateDisplay((college.placements as Record<string, unknown> | undefined)?.placementRate ?? college.placementRate ?? 0), 12);
    } else if (title === "Course Details") {
      const summary = getCourseSummary(college, courseData);
      addLabelValue("Course Count", String(summary.totalCourses), 12);
      addLabelValue("Estimated Fees", summary.fees || "Not available", 12);

      const scopedCourses = resolveCollegeScopedCourses(college, courseData).slice(0, 5);
      if (scopedCourses.length) {
        scopedCourses.forEach((course, courseIndex) => {
          addText(`${courseIndex + 1}. ${getCourseDisplayTitle(course)}`, 11, { indent: 14 });
          addLabelValue("Fees", formatCompactIndianCurrencyRange(course.totalFees, course.totalFees), 18);
          addLabelValue("Cutoff", String(course.cutoff || "-"), 18);
        });
      } else {
        addLabelValue("Courses", "No course data available", 12);
      }
    } else if (title === "Admission Quotas") {
      const quotas = toList(college.quotas);
      if (quotas.length) {
        quotas.slice(0, 6).forEach((quota) => addLabelValue("Quota", quota, 12));
      } else {
        addLabelValue("Quota", "Admission quota details not available", 12);
      }
      addLabelValue("Admission Process", college.admissionProcess?.trim() || "Not available", 12);
      addLabelValue("Application Mode", college.applicationMode?.trim() || "Not available", 12);
    } else if (title === "Infrastructure & Facilities") {
      const facilities = college.facilities.slice(0, 5);
      if (facilities.length) {
        facilities.forEach((facility, facilityIndex) => addLabelValue(`Facility ${facilityIndex + 1}`, facility, 12));
      } else {
        addLabelValue("Facilities", "Not available", 12);
      }
      addLabelValue("Hostel", college.hasHostel ? "Available" : "Not Available", 12);
      addLabelValue("Streams", college.streams.join(", ") || "Not available", 12);
    }

    addBlank(6);
  };

  const addCollegeOperationsSection = (college: College) => {
    addText(`${college.name} - Placements & Admission Details`, 12, { bold: true, indent: 6 });
    addText("------------------------------------------------", 8, { indent: 6 });
    const placements = (college.placements as Record<string, unknown> | undefined) || {};
    addLabelValue("Placement Rate", formatPlacementRateDisplay(placements.placementRate ?? college.placementRate ?? 0), 12);
    addLabelValue("Highest Package", formatCompactIndianCurrency(placements.highestPackage ?? ""), 12);
    addLabelValue("Average Package", formatCompactIndianCurrency(placements.averagePackage ?? ""), 12);
    addLabelValue("Companies Visited", sanitizePdfText(placements.companiesVisited ?? ""), 12);
    addLabelValue("Website", college.website?.trim() || "Not available", 12);
    addLabelValue("Contact", college.contactPhone?.trim() || college.alternatePhone?.trim() || "Not available", 12);
    addBlank(4);
  };

  const selectedTitles = selectedColleges.map((college) => college.name).join(" vs ");
  addText("Compare Colleges", 20, { bold: true });
  if (selectedTitles) {
    addText(selectedTitles, 14, { bold: true });
  }
  addText("Comparison report generated from the current Compare page selection.", 10.5);
  addBlank(8);

  selectedColleges.forEach((college, index) => addCollegeSummary(college, index));

  sectionCards.forEach((section) => {
    addSectionTitle(section.title);
    selectedColleges.forEach((college) => addCollegeSection(section.title, college));
  });

  addSectionTitle("Courses & Entrance Exams");
  selectedColleges.forEach((college) => {
    addText(college.name, 12.5, { bold: true, indent: 6 });
    const scopedCourses = resolveCollegeScopedCourses(college, courseData).slice(0, 5);
    if (!scopedCourses.length) {
      addLabelValue("Course", "No course data available", 12);
      addBlank(4);
      return;
    }

    scopedCourses.forEach((course, courseIndex) => {
      addText(`${courseIndex + 1}. ${getCourseDisplayTitle(course)}`, 11, { indent: 12 });
      addLabelValue("Fees", formatCompactIndianCurrencyRange(course.totalFees, course.totalFees), 18);
      addLabelValue("Cutoff", course.cutoff ? String(course.cutoff) : "-", 18);
      const exams = Array.isArray(course.entranceExams) ? course.entranceExams : [];
      if (exams.length) {
        const examSummary = exams
          .slice(0, 3)
          .map((exam) => `${sanitizePdfText(exam.examName || "Exam")} ${sanitizePdfText(exam.cutoffScoreOrRank || "")}`.trim())
          .filter(Boolean)
          .join(" | ");
        addLabelValue("Entrance Exams", examSummary || "Not available", 18);
      } else {
        addLabelValue("Entrance Exams", "Not available", 18);
      }
    });
    addBlank(4);
  });

  addSectionTitle("Placements & Admission Details");
  selectedColleges.forEach((college) => {
    addCollegeOperationsSection(college);
  });

  pages.forEach((page, index) => {
    page.push({
      text: `Page ${index + 1} of ${pages.length}`,
      x: PDF_PAGE_WIDTH - PDF_MARGIN - 70,
      y: 24,
      size: 9,
    });
  });

  return pages;
};

const getCollegeByIdFromList = (list: College[], id: string | null) => {
  if (!id) return null;
  return list.find((college) => college.id === id) || null;
};

function ComparePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCollegeId = searchParams.get("college");
  const focusCollegeId = searchParams.get("focus");
  const token = readAuthToken();
  const [search, setSearch] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [likedCollegeId, setLikedCollegeId] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [availableColleges, setAvailableColleges] = useState<College[]>(colleges);
  const [availableCourses, setAvailableCourses] = useState<Course[]>(fallbackCourses);
  const [compareColleges, setCompareColleges] = useState<CompareCollege[]>([null, null, null]);

  useEffect(() => {
    let isActive = true;

    const commitLoadedData = (
      resolvedColleges: College[],
      resolvedCourses: Course[],
      seededCollege: College | null,
      focusedCollege: College | null,
    ) => {
      if (!isActive) return;

      setAvailableColleges(resolvedColleges);
      setAvailableCourses(resolvedCourses);
      setCompareColleges((previous) => {
        const seed = seededCollege || previous[0] || null;
        const focus = focusedCollege || previous[1] || null;
        const base = [seed, focus, previous[2] || null];
        if (!seed) return base;
        const withoutSeed = base.filter((item) => item?.id !== seed.id);
        return [seed, ...withoutSeed].slice(0, 3);
      });
    };

    const loadCompareColleges = async () => {
      try {
        const panelData = await fetchPublicPanelData();
        if (!isActive) return;

        let resolvedColleges = panelData.colleges.length ? panelData.colleges : colleges;
        let seededCollege = getCollegeByIdFromList(resolvedColleges, initialCollegeId);
        let focusedCollege =
          focusCollegeId && focusCollegeId !== initialCollegeId
            ? getCollegeByIdFromList(resolvedColleges, focusCollegeId)
            : null;

        if (!seededCollege && initialCollegeId) {
          const fallbackSeed = getCollegeByIdFromList(colleges, initialCollegeId);
          if (fallbackSeed) {
            resolvedColleges = [
              fallbackSeed,
              ...resolvedColleges.filter((item) => item.id !== fallbackSeed.id),
            ];
            seededCollege = fallbackSeed;
          }
        }

        if (!focusedCollege && focusCollegeId) {
          const fallbackFocus = getCollegeByIdFromList(colleges, focusCollegeId);
          if (fallbackFocus) {
            resolvedColleges = [
              ...resolvedColleges.filter((item) => item.id !== fallbackFocus.id),
              fallbackFocus,
            ];
            focusedCollege = fallbackFocus;
          }
        }

        commitLoadedData(
          resolvedColleges,
          panelData.courses.length ? panelData.courses : fallbackCourses,
          seededCollege,
          focusedCollege,
        );
      } catch {
        if (!isActive) return;

        const seededCollege = getCollegeByIdFromList(colleges, initialCollegeId);
        const focusedCollege =
          focusCollegeId && focusCollegeId !== initialCollegeId
            ? getCollegeByIdFromList(colleges, focusCollegeId)
            : null;

        commitLoadedData(colleges, fallbackCourses, seededCollege, focusedCollege);
      }
    };

    if (typeof window === "undefined") return () => {};

    const idleWindow = window as Window & {
      requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    let cancelIdleLoad: (() => void) | undefined;
    if (idleWindow.requestIdleCallback && idleWindow.cancelIdleCallback) {
      const handle = idleWindow.requestIdleCallback(() => {
        void loadCompareColleges();
      }, { timeout: 1200 });
      cancelIdleLoad = () => idleWindow.cancelIdleCallback?.(handle);
    } else {
      const timer = window.setTimeout(() => {
        void loadCompareColleges();
      }, 0);
      cancelIdleLoad = () => window.clearTimeout(timer);
    }

    return () => {
      isActive = false;
      cancelIdleLoad?.();
    };
  }, [focusCollegeId, initialCollegeId]);

  const filteredColleges = useMemo(() => {
    const query = search.trim().toLowerCase();
    return availableColleges.filter((college) => {
      if (!query) return true;
      return (
        college.name.toLowerCase().includes(query) ||
        college.university.toLowerCase().includes(query) ||
        college.district.toLowerCase().includes(query)
      );
    });
  }, [availableColleges, search]);

  const selectedColleges = compareColleges.filter(Boolean) as College[];
  const compareTitle = selectedColleges.map((college) => college.name).join(" vs ");

  const ensureAuth = (slot: number) => {
    if (token) {
      setActiveSlot(slot);
      setShowPicker(true);
      return;
    }
    setActiveSlot(slot);
    setShowLoginPrompt(true);
  };

  const applyCollege = (college: College) => {
    if (activeSlot === null) return;
    setCompareColleges((previous) => {
      const next = [...previous];
      next[activeSlot] = college;
      return next;
    });
    setShowPicker(false);
    setSearch("");
  };

  const applyPopularComparison = (primary: College, secondary: College) => {
    setCompareColleges((previous) => {
      const third =
        previous.find(
          (item) =>
            item &&
            item.id !== primary.id &&
            item.id !== secondary.id,
        ) || null;
      return [primary, secondary, third];
    });
  };

  const removeCollege = (slot: number) => {
    setCompareColleges((previous) => {
      const next = [...previous];
      next[slot] = null;
      return next;
    });
  };

  const handleDownload = async () => {
    const selectedColleges = compareColleges.filter(Boolean) as College[];
    if (!selectedColleges.length || isGeneratingPdf) return;

    try {
      setIsGeneratingPdf(true);
      const pdfPages = buildComparePdfPages(selectedColleges, availableCourses.length ? availableCourses : fallbackCourses);
      const pdfBlob = generatePdfBlob(pdfPages);
      const filename = buildComparePdfFilename(selectedColleges);
      const blobUrl = URL.createObjectURL(pdfBlob);
      const anchor = document.createElement("a");
      anchor.href = blobUrl;
      anchor.download = filename;
      anchor.rel = "noopener";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const renderMobileSlot = (college: CompareCollege, slot: number) => {
    if (college) {
      return (
        <div className="flex h-full flex-col items-center gap-3 rounded-[1.35rem] border border-[rgba(15,76,129,0.12)] bg-white px-2.5 py-2.5 text-center shadow-[0_12px_26px_rgba(15,76,129,0.08)] sm:px-3 sm:py-3">
          <div className="flex w-full items-center justify-end">
            <button
              type="button"
              onClick={() => removeCollege(slot)}
              className="rounded-full border border-[rgba(15,76,129,0.14)] p-1.5 text-slate-500 transition hover:bg-[rgba(15,76,129,0.04)]"
              aria-label="Remove selected college"
            >
              <X className="size-3.5" />
            </button>
          </div>
          <CollegeLogoBadge
            src={college.logo || college.image}
            alt={college.name}
            mode={college.logo ? "logo" : "cover"}
            className={college.logo ? "h-14 w-14 rounded-full" : "h-12 w-24 rounded-[0.9rem]"}
            imageClassName={college.logo ? "rounded-full p-2" : ""}
          />
          <h3 className="line-clamp-3 text-sm font-semibold leading-5 text-[color:var(--brand-primary)]">
            {college.name}
          </h3>
          <p className="inline-flex items-center gap-1 text-xs text-slate-500">
            <MapPin className="size-3.5" />
            {college.district}
          </p>
          <button
            type="button"
            onClick={() => ensureAuth(slot)}
            className="mt-1 inline-flex items-center justify-center gap-2 rounded-full border border-[rgba(15,76,129,0.2)] px-3 py-1.5 text-xs font-semibold text-[color:var(--brand-primary)] transition hover:bg-[rgba(15,76,129,0.04)]"
          >
            <RefreshCw className="size-3.5" />
            Modify Selection
          </button>
        </div>
      );
    }

    return (
      <div
        role="button"
        tabIndex={0}
        onClick={() => ensureAuth(slot)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            ensureAuth(slot);
          }
        }}
        className="flex h-full flex-col items-center justify-center gap-3 rounded-[1.35rem] border-2 border-dashed border-[rgba(15,76,129,0.24)] bg-white/70 px-2.5 py-2.5 text-center transition hover:border-[rgba(15,76,129,0.4)] sm:px-3 sm:py-3"
      >
        <div className="rounded-[0.9rem] border border-dashed border-[rgba(15,76,129,0.35)] bg-white px-4 py-5 text-[color:var(--brand-primary)]">
          <Plus className="size-5" />
        </div>
        <p className="text-sm font-semibold text-[color:var(--text-dark)]">Add College</p>
        <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">Or</span>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            ensureAuth(slot);
          }}
          className="rounded-full border border-[rgba(15,76,129,0.2)] px-3 py-1.5 text-xs font-semibold text-[color:var(--brand-primary)] transition hover:bg-[rgba(15,76,129,0.04)]"
        >
          Add Similar College
        </button>
      </div>
    );
  };

  return (
    <section className="section-shell min-h-screen bg-[linear-gradient(180deg,#f9fcff_0%,#eef6fc_100%)] text-[color:var(--text-dark)]">
      <div className="mesh-bg opacity-65" />
      <div className="hero-grid absolute inset-0 opacity-[0.05]" />

      <div className="relative z-10">
        <Navbar />

        <div className="page-container-full py-6 px-4 sm:px-6 md:py-10">
          <div className="reveal-up rounded-[2rem] border border-[rgba(15,76,129,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,251,255,0.96))] p-5 shadow-[0_28px_60px_rgba(22,50,79,0.1)] sm:p-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div className="space-y-6">
                <p className="editorial-kicker">
                  <Trophy className="size-3.5" />
                  Compare Colleges
                </p>
                <div className="inline-flex items-center gap-4 rounded-full border border-[rgba(15,76,129,0.1)] bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--brand-primary)] shadow-[0_10px_24px_rgba(22,50,79,0.05)]">
                  Side-by-side college snapshot
                </div>
                <h1 className="max-w-4xl text-balance font-[family:var(--font-display)] text-[1.55rem] font-bold leading-[1.2] text-[color:var(--text-dark)] sm:text-[1.85rem]">
                  {compareTitle || "Compare top colleges side by side"}
                </h1>
                <p className="max-w-3xl text-sm leading-6 text-[color:var(--text-muted)] sm:text-base">
                  Review rankings, fees, cut off signals, facilities, and key college facts in one
                  cleaner comparison experience built with the same modern visual language as the
                  homepage.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={isGeneratingPdf}
                  aria-busy={isGeneratingPdf}
                  className="inline-flex items-center gap-2 rounded-full bg-[color:var(--brand-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_26px_rgba(22,50,79,0.18)] transition hover:bg-[color:var(--brand-primary-soft)] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <Download className="size-4" />
                  {isGeneratingPdf ? "Generating PDF..." : "Download "}
                </button>
                <Link
                  href="/explore"
                  className="shine-button inline-flex items-center gap-2 rounded-full bg-[color:var(--brand-primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[color:var(--brand-primary-soft)]"
                >
                  Explore More
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-6 md:hidden">
            <article className="luxe-card reveal-up p-3 sm:p-4">
              <div className="grid grid-cols-2 gap-3">
                {renderMobileSlot(compareColleges[0], 0)}
                {renderMobileSlot(compareColleges[1], 1)}
              </div>
            </article>
          </div>

          <div className="mt-6 hidden gap-4 md:grid lg:grid-cols-3">
            {compareColleges.map((college, slot) => (
              <article
                key={`compare-slot-${slot}`}
                className="luxe-card reveal-up flex min-h-[22rem] flex-col p-4 sm:p-5"
              >
                {college ? (
                  <>
                    <div className="flex items-start justify-between gap-3">
                      <span className="rounded-full bg-[rgba(15,76,129,0.06)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--brand-primary)]">
                        Compare Slot {slot + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeCollege(slot)}
                        className="rounded-full border border-[rgba(15,76,129,0.1)] p-2 text-slate-500 transition hover:bg-[rgba(15,76,129,0.04)] hover:text-slate-700"
                        aria-label="Remove selected college"
                      >
                        <X className="size-4" />
                      </button>
                    </div>

                    <div className="mt-4 flex items-center gap-4">
                      <CollegeLogoBadge
                        src={college.logo || college.image}
                        alt={college.name}
                        mode={college.logo ? "logo" : "cover"}
                        className={college.logo ? "h-16 w-16 rounded-full" : "h-16 w-16 rounded-[1.2rem]"}
                        imageClassName={college.logo ? "rounded-full p-2" : ""}
                      />
                      <div className="min-w-0">
                        <h2 className="text-lg font-bold text-[color:var(--text-dark)]">
                          {college.name}
                        </h2>
                        <p className="mt-1 inline-flex items-center gap-1 text-sm text-slate-500">
                          <MapPin className="size-4" />
                          {college.district}, {college.state}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-[1rem] border border-[rgba(15,76,129,0.08)] bg-white px-4 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                          Ranking
                        </p>
                        <p className="mt-2 font-bold text-[color:var(--text-dark)]">
                          {formatRankingRangeForDisplay(college.ranking)}
                        </p>
                      </div>
                      <div className="rounded-[1rem] border border-[rgba(15,76,129,0.08)] bg-white px-4 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                          Placement
                        </p>
                        <p className="mt-2 font-bold text-[color:var(--text-dark)]">
                          {formatPlacementRateDisplay(
                            (college.placements as Record<string, unknown> | undefined)?.placementRate ??
                              college.placementRate ??
                              0,
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => ensureAuth(slot)}
                        className="inline-flex items-center gap-2 rounded-full border border-[rgba(15,76,129,0.12)] bg-white px-4 py-2 text-sm font-semibold text-[color:var(--brand-primary)] transition hover:bg-[rgba(15,76,129,0.04)]"
                      >
                        <RefreshCw className="size-4" />
                        Modify
                      </button>
                      <button
                        type="button"
                        onClick={() => setLikedCollegeId(college.id)}
                        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                          likedCollegeId === college.id
                            ? "bg-[rgba(255,138,61,0.12)] text-[color:var(--brand-accent-deep)]"
                            : "border border-[rgba(15,76,129,0.1)] bg-white text-slate-600 hover:bg-[rgba(255,138,61,0.06)]"
                        }`}
                      >
                        <Heart className="size-4" />
                        Prefer This
                      </button>
                    </div>
                  </>
                ) : (
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => ensureAuth(slot)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        ensureAuth(slot);
                      }
                    }}
                    className="flex h-full flex-col items-center justify-center rounded-[1.5rem] border-2 border-dashed border-[rgba(15,76,129,0.16)] bg-[rgba(15,76,129,0.03)] px-6 text-center transition hover:border-[rgba(15,76,129,0.28)]"
                  >
                    <div className="rounded-full bg-white p-3 text-[color:var(--brand-primary)] shadow-[0_12px_24px_rgba(22,50,79,0.08)]">
                      <Plus className="size-5" />
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-[color:var(--text-dark)]">
                      Add College
                    </h3>
                    <p className="mt-2 max-w-xs text-sm leading-7 text-[color:var(--text-muted)]">
                      Select another college to expand your comparison table.
                    </p>
                    <button
                      type="button"
                      onClick={() => ensureAuth(slot)}
                      className="mt-5 inline-flex items-center gap-2 rounded-full bg-[color:var(--brand-primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[color:var(--brand-primary-soft)]"
                    >
                      Choose College
                      <ArrowRight className="size-4" />
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>

          <div className="mt-8 space-y-5">
            {sectionCards.map((section) => {
              const Icon = section.icon;
              return (
                <section
                  key={section.key}
                  className="reveal-up rounded-[1.8rem] border border-[rgba(15,76,129,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,251,255,0.95))] p-5 shadow-[0_18px_44px_rgba(22,50,79,0.08)] sm:p-6"
                >
                  <div className="flex items-center gap-3">
                    <span className="rounded-[1rem] bg-[rgba(15,76,129,0.08)] p-2.5 text-[color:var(--brand-primary)]">
                      <Icon className="size-4.5" />
                    </span>
                    <h2 className="text-lg font-bold text-[color:var(--text-dark)]">{section.title}</h2>
                  </div>

                  <div className="mt-5 grid grid-cols-2 items-stretch gap-3 bg-transparent md:grid-cols-2 lg:grid-cols-3">
                    {compareColleges.map((college, index) => {
                      if (!college) {
                        return (
                          <div
                            key={`${section.key}-empty-${index}`}
                          className={`rounded-[1.3rem] border border-dashed border-[rgba(15,76,129,0.16)] bg-[rgba(15,76,129,0.025)] px-3 py-6 text-center text-sm text-[color:var(--text-muted)] sm:px-4 sm:py-8 ${
                              index === 2 ? "hidden lg:block" : ""
                            }`}
                        >
                            No college selected
                          </div>
                        );
                      }

                      const summary = getCourseSummary(college, availableCourses);
                      const topFacilities = college.facilities.slice(0, 5);
                      const facilityHighlightsMobile = topFacilities;

                      return (
                        <article
                          key={`${section.key}-${college.id}`}
                          className={`flex h-full flex-col rounded-[1.3rem] border border-[rgba(15,76,129,0.09)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(250,252,255,0.94))] px-3 py-3 shadow-[0_10px_24px_rgba(22,50,79,0.04)] sm:px-4 sm:py-4 ${
                            index === 2 ? "hidden lg:block" : ""
                          }`}
                        >
                          <div className="mb-4 border-b border-[rgba(15,76,129,0.06)] pb-3">
                            <p className="line-clamp-2 text-sm font-bold text-[color:var(--text-dark)] sm:text-base">
                              {college.name}
                            </p>
                            <p className="mt-1 line-clamp-1 text-xs text-slate-500 sm:text-sm">
                              {college.university}
                            </p>
                          </div>

                          {section.key === "overview" ? (
                            <div className="space-y-2.5 text-[12.5px] sm:text-[13px]">
                              {comparisonPairs.map((item) => (
                                <div
                                  key={item.label}
                                  className="grid grid-cols-[72px_minmax(0,1fr)] items-start gap-x-2 border-b border-[rgba(15,76,129,0.05)] pb-2.5 last:border-b-0 last:pb-0 sm:grid-cols-[92px_minmax(0,1fr)]"
                                >
                                  <span className="text-slate-500">{item.label}</span>
                                  <span className="text-left font-semibold text-[color:var(--text-dark)] break-words sm:text-right">
                                    {item.value(college)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : null}

                          {section.key === "ranking" ? (
                            <div className="space-y-2.5 text-[12.5px] sm:text-[13px]">
                              <div className="grid grid-cols-[72px_minmax(0,1fr)] items-start gap-x-2 border-b border-[rgba(15,76,129,0.05)] pb-2.5 sm:grid-cols-[92px_minmax(0,1fr)]">
                                <span className="text-slate-500">Recognition</span>
                                <span className="text-left font-semibold text-[color:var(--text-dark)] break-words sm:text-right">
                                  {college.accreditation}
                                </span>
                              </div>
                              <div className="grid grid-cols-[72px_minmax(0,1fr)] items-start gap-x-2 sm:grid-cols-[92px_minmax(0,1fr)]">
                                <span className="text-slate-500">Current Rank</span>
                                <span className="text-left font-semibold text-[color:var(--text-dark)] break-words sm:text-right">
                                  {formatRankingRangeForDisplay(college.ranking)}
                                </span>
                              </div>
                              <div className="rounded-[1rem] bg-[rgba(255,138,61,0.08)] px-4 py-3 text-[13px] text-[color:var(--brand-accent-deep)]">
                                Strong standing for students comparing trust, recognition, and visibility.
                              </div>
                            </div>
                          ) : null}

                          {section.key === "fees" ? (
                            <div className="space-y-2.5 text-[12.5px] sm:text-[13px]">
                              <div className="grid grid-cols-[72px_minmax(0,1fr)] items-start gap-x-2 border-b border-[rgba(15,76,129,0.05)] pb-2.5 sm:grid-cols-[92px_minmax(0,1fr)]">
                                <span className="text-slate-500">Courses</span>
                                <span className="text-left font-semibold text-[color:var(--text-dark)] break-words sm:text-right">
                                  {summary.totalCourses}
                                </span>
                              </div>
                              <div className="grid grid-cols-[72px_minmax(0,1fr)] items-start gap-x-2 border-b border-[rgba(15,76,129,0.05)] pb-2.5 sm:grid-cols-[92px_minmax(0,1fr)]">
                                <span className="text-slate-500">Estimated Fees</span>
                                <span className="text-left font-semibold text-[color:var(--text-dark)] break-words sm:text-right">
                                  {summary.fees}
                                </span>
                              </div>
                            </div>
                          ) : null}

                          {section.key === "cutoff" ? (
                            <div className="space-y-2.5 text-[12.5px] sm:text-[13px]">
                              <div className="grid gap-2">
                                {toList(college.quotas).length ? (
                                  toList(college.quotas).map((quota) => (
                                    <div
                                      key={`${college.id}-quota-${quota}`}
                                      className="rounded-[1rem] bg-[rgba(15,76,129,0.06)] px-4 py-2 text-[12.5px] font-semibold text-[color:var(--brand-primary)]"
                                    >
                                      {quota}
                                    </div>
                                  ))
                                ) : (
                                  <div className="rounded-[1rem] bg-[rgba(15,76,129,0.05)] px-4 py-3 text-[13px] text-slate-600">
                                    Admission quota details not available.
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : null}

                          {section.key === "facilities" ? (
                            <div className="space-y-2.5 text-[12.5px] sm:text-[13px]">
                              <div className="grid gap-2 sm:hidden">
                                {facilityHighlightsMobile.map((item, idx) => (
                                  <div
                                    key={`${college.id}-facility-${idx}`}
                                    className="flex items-start gap-2 rounded-[1.1rem] bg-[rgba(15,76,129,0.06)] px-3 py-2 text-[11.5px] font-semibold leading-4 text-[color:var(--brand-primary)] min-[380px]:text-[12px] min-[380px]:leading-5"
                                  >
                                    {(() => {
                                      const FacilityIcon = getFacilityIcon(item);
                                      return <FacilityIcon className="mt-0.5 size-3.5 shrink-0" />;
                                    })()}
                                    <span className="line-clamp-4 text-pretty break-words">{item}</span>
                                  </div>
                                ))}
                              </div>
                              <div className="hidden flex-wrap gap-2 sm:flex">
                                {topFacilities.map((facility) => {
                                  const FacilityIcon = getFacilityIcon(facility);
                                  return (
                                    <span
                                      key={facility}
                                      className="inline-flex items-center gap-2 rounded-full bg-[rgba(15,76,129,0.06)] px-3 py-1.5 text-xs font-semibold text-[color:var(--brand-primary)]"
                                    >
                                      <FacilityIcon className="size-3.5" />
                                      {facility}
                                    </span>
                                  );
                                })}
                              </div>
                              <div className="text-[11.5px] leading-4 text-slate-600 min-[380px]:text-[12.5px] min-[380px]:leading-5 sm:text-[13px]">
                                <span className="font-bold text-[color:var(--text-dark)]">Hostel:</span>{" "}
                                <span className="font-semibold text-[color:var(--text-dark)]">
                                  {college.hasHostel ? "Available" : "Not Available"}
                                </span>
                              </div>
                              <div className="text-[11.5px] leading-4 text-slate-600 break-words min-[380px]:text-[12.5px] min-[380px]:leading-5 sm:text-[13px]">
                                <span className="font-bold text-[color:var(--text-dark)]">Streams:</span>{" "}
                                <span className="font-semibold text-[color:var(--text-dark)]">
                                  {college.streams.join(", ")}
                                </span>
                              </div>
                            </div>
                          ) : null}
                        </article>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>

          <PopularComparisons
            selectedCollege={selectedColleges[0] || null}
            colleges={availableColleges}
            onSelectComparison={applyPopularComparison}
          />
        </div>
      </div>

      {showPicker ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[2rem] border border-[rgba(15,76,129,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,251,255,0.96))] p-5 shadow-[0_30px_80px_rgba(4,12,26,0.2)] sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--brand-primary)]">
                  Compare Setup
                </p>
                <h2 className="mt-2 text-xl font-bold text-[color:var(--text-dark)]">Select a college</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowPicker(false)}
                className="rounded-full border border-[rgba(15,76,129,0.12)] p-2 text-slate-500 transition hover:bg-[rgba(15,76,129,0.04)]"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-5 rounded-[1.2rem] border border-[rgba(15,76,129,0.08)] bg-white px-4 py-3">
              <div className="flex items-center gap-3">
                <Search className="size-4 text-[color:var(--brand-primary)]" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search college by name, district, or university"
                  className="w-full bg-transparent text-sm text-[color:var(--text-dark)] outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="mt-5 max-h-[24rem] space-y-3 overflow-y-auto pr-1">
              {filteredColleges.map((college) => {
                const summary = getCourseSummary(college);
                return (
                  <button
                    key={college.id}
                    type="button"
                    onClick={() => applyCollege(college)}
                    className="flex w-full items-start justify-between gap-4 rounded-[1.2rem] border border-[rgba(15,76,129,0.08)] bg-white px-4 py-4 text-left transition hover:border-[rgba(255,138,61,0.35)] hover:bg-[rgba(15,76,129,0.03)]"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <CollegeLogoBadge
                        src={college.logo || college.image}
                        alt={college.name}
                        mode={college.logo ? "logo" : "cover"}
                        className={college.logo ? "h-12 w-12 shrink-0 rounded-full" : "h-12 w-12 shrink-0 rounded-[0.95rem]"}
                        imageClassName={college.logo ? "rounded-full p-2" : ""}
                      />
                      <div className="min-w-0">
                      <p className="font-semibold text-[color:var(--text-dark)]">{college.name}</p>
                      <p className="mt-1 text-sm text-slate-500">{college.university}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                      <p className="mt-1 text-sm text-slate-500 whitespace-nowrap overflow-hidden text-ellipsis">
  {college.district}, {college.state}
</p>

<span className="rounded-full bg-[rgba(255,138,61,0.08)] px-3 py-1 text-xs font-semibold text-[color:var(--brand-accent-deep)] whitespace-nowrap">
  {summary.fees}
</span>
                      </div>
                      </div>
                    </div>
                    <ArrowRight className="mt-1 size-4 shrink-0 text-[color:var(--brand-primary)]" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}

      {showLoginPrompt ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[2rem] border border-[rgba(15,76,129,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,251,255,0.96))] p-6 text-center shadow-[0_30px_80px_rgba(4,12,26,0.2)]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(15,76,129,0.08)] text-[color:var(--brand-primary)]">
              <ShieldCheck className="size-7" />
            </div>
            <h2 className="mt-5 text-2xl font-bold text-[color:var(--text-dark)]">Login required</h2>
            <p className="mt-3 text-sm leading-7 text-[color:var(--text-muted)]">
              Compare setup and saved shortlist features use your signed-in student session. Login
              to continue with college comparison.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => setShowLoginPrompt(false)}
                className="rounded-full border border-[rgba(15,76,129,0.12)] px-5 py-3 text-sm font-semibold text-[color:var(--text-dark)] transition hover:bg-[rgba(15,76,129,0.04)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() =>
                  router.push(
                    `/login?redirect=${encodeURIComponent(
                      `/compare${initialCollegeId ? `?college=${initialCollegeId}` : ""}`,
                    )}`,
                  )
                }
                className="rounded-full bg-[color:var(--brand-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--brand-primary-soft)]"
              >
                Login Now
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={null}>
      <ComparePageContent />
    </Suspense>
  );
}

