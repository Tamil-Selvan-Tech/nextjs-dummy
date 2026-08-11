"use client";

import { strFromU8, strToU8, unzipSync, zipSync } from "@/lib/vendor/fflate-browser";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BadgeCheck,
  Bell,
  BookOpen,
  Building2,
  ChevronDown,
  ChevronRight,
  Download,
  ExternalLink,
  FileClock,
  Filter,
  ImageUp,
  KeyRound,
  LayoutDashboard,
  Mail,
  MailOpen,
  MapPin,
  PencilLine,
  Plus,
  Search,
  TriangleAlert,
  Trash2,
  UserRound,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AdminCutoffQuestions } from "@/components/admin-cutoff-questions";
import { CollegeLogoBadge } from "@/components/college-logo-badge";
import { ResponsiveTableWrapper } from "@/components/responsive-table-wrapper";
import {
  clearAuth,
  readAuthToken,
  readCurrentUser,
  type SafeAuthUser,
} from "@/lib/auth-storage";
import { API_BASE_URL, request, withAuth } from "@/lib/api";
import {
  COLLEGE_ACCREDITATION_OPTIONS,
  INDIA_STATE_DISTRICT_MAP,
  INDIA_STATES,
} from "@/lib/india-location-data";
import {
  formatCutoffForSave,
  isValidCutoffValue,
  normalizeCutoffInput,
  parseCutoffValue,
} from "@/lib/cutoff-utils";
import { normalizeScientificIntegerText } from "@/lib/integer-text";
import {
  formatRankingRangeForDisplay,
  formatRankingRangeForSave,
  isValidRankingRange,
  parseRankingRange,
  normalizeRankingRangeInput,
} from "@/lib/ranking-utils";
import {
  formatCompactIndianCurrency,
  formatCompactIndianCurrencyRange,
} from "@/lib/currency-format";
import { showToast } from "@/lib/toast";

type AdminCollege = { _id: string; collegeCode?: string; name?: string; establishedYear?: string | number; ownershipType?: string; university?: string; country?: string; state?: string; city?: string; district?: string; address?: string; pincode?: string; description?: string; reviews?: string; admissionProcess?: string; applicationMode?: string; locationLink?: string; mapUrl?: string; website?: string; contactEmail?: string; ownerEmail?: string; alternatePhone?: string; contactPhone?: string; phone?: string; accreditation?: string; awardsRecognitions?: string; quotas?: string[] | string; brochurePdfUrl?: string; brochureUrl?: string; campusVideoUrl?: string; isBestCollege?: boolean; isTopCollege?: boolean; logo?: string; images?: string[]; image?: string; ranking?: string | number; placementRate?: string | number; lastDashboardEditAt?: string; feesStructure?: Record<string, unknown>; courseTags?: string; facilities?: string[] | string; scholarships?: string; placements?: { highestPackage?: string | number; averagePackage?: string | number; companiesVisited?: string | number; placementRate?: string | number }; hostelDetails?: { availability?: string; hostelType?: string; cctvAvailable?: string; boysRoomsCount?: string | number; girlsRoomsCount?: string | number; facilityOptions?: string[]; waterAvailability?: string; powerBackup?: string; internet?: { wifiAvailable?: string; speed?: string; pricing?: string }; foodAvailability?: string; foodTimings?: string; laundryService?: string; roomCleaningFrequency?: string; rules?: string; hostelFees?: { minAmount?: string | number; maxAmount?: string | number } } };
type CategoryCutoff = { category?: string; cutoff?: string };

const MAX_BULK_COLLEGE_ROWS = 100;
const MAX_BULK_IMAGE_ZIP_SIZE_BYTES = 100 * 1024 * 1024;
const getBulkCollegeLimitMessage = () =>
  `You can upload up to ${MAX_BULK_COLLEGE_ROWS} colleges at a time. Please split larger files and try again.`;
const getBulkZipLimitMessage = () =>
  "ZIP file must be 100MB or less. Please upload a smaller ZIP file.";
const normalizeCourseStream = (value?: string) => streamAliasMap[normalizeAdminOption(value)] || normalizeAdminOption(value);
const getDurationMultiplier = (duration: string) => {
  const match = String(duration || "").match(/(\d+(?:\.\d+)?)/);
  if (!match) return 0;
  return Number(match[1]) || 0;
};
const calculateTotalFeesFromSemesterFees = (semesterFees: string, duration: string) => {
  const feeValue = Number(String(semesterFees || "").replace(/,/g, "").trim() || 0);
  const durationYears = getDurationMultiplier(duration);
  const multiplier = durationYears * 2;
  if (!feeValue || !multiplier) return "";
  return String(feeValue * multiplier);
};
const shouldAutoShowEntranceExams = (courseName: string, degreeType: string, stream: string) => {
  const normalizedCourse = courseName.trim().toUpperCase();
  const normalizedStream = normalizeCourseStream(stream);

  if (["Engineering", "Medical / Health", "Law"].includes(normalizedStream)) return true;
  if (normalizedStream === "Management" && degreeType === "PG") return true;
  return ["B.E", "B.TECH", "M.E", "M.TECH", "MBBS", "M.D", "LLB", "LLM", "MBA", "MCA"].includes(normalizedCourse);
};

const formatDate = (value?: string) =>
  value
    ? /^\d{2}-\d{2}-\d{4}$/.test(String(value).trim())
      ? String(value).trim()
      : new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "-";

const correctionDateRangePattern = /^\d{2}-\d{2}-\d{4}\s+to\s+\d{2}-\d{2}-\d{4}$/i;
const parseDayMonthYearValue = (value: string) => {
  const trimmedValue = String(value || "").trim();
  const match = trimmedValue.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (!match) return null;

  const [, dayText, monthText, yearText] = match;
  const day = Number(dayText);
  const month = Number(monthText);
  const year = Number(yearText);
  const parsedDate = new Date(Date.UTC(year, month - 1, day));

  if (
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.getUTCFullYear() !== year ||
    parsedDate.getUTCMonth() !== month - 1 ||
    parsedDate.getUTCDate() !== day
  ) {
    return null;
  }

  return `${yearText}-${monthText}-${dayText}`;
};

const parseExamDateValue = (value: string) => {
  const trimmedValue = String(value || "").trim();
  if (!trimmedValue) return null;
  if (/^\d{2}-\d{2}-\d{4}$/.test(trimmedValue)) {
    return parseDayMonthYearValue(trimmedValue);
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmedValue)) {
    const [yearText = "", monthText = "", dayText = ""] = trimmedValue.split("-");
    return parseDayMonthYearValue(`${dayText}-${monthText}-${yearText}`);
  }
  return null;
};

const formatExamDateForInput = (value: string) => {
  const parsedValue = parseExamDateValue(value);
  return parsedValue || "";
};

const formatExamDateFromInput = (value: string) => {
  const trimmedValue = String(value || "").trim();
  if (!trimmedValue) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmedValue)) {
    const [yearText = "", monthText = "", dayText = ""] = trimmedValue.split("-");
    return `${dayText}-${monthText}-${yearText}`;
  }
  return trimmedValue;
};

const formatCorrectionDateRange = (value?: string) => String(value || "").trim() || "-";

const renderChangeValue = (value: unknown) => {
  if (Array.isArray(value)) {
    const normalized = value.map((item) => String(item ?? "").trim()).filter(Boolean);
    if (normalized.length === 0) return "Empty";
    return normalized.join(", ");
  }
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  const text = String(value ?? "").trim();
  return text || "Empty";
};

const getRequestAssetValue = (item: RequestItem, keys: string[]) => {
  for (const key of keys) {
    const value = item.payload?.[key as keyof NonNullable<RequestItem["payload"]>] ?? item.submittedPayload?.[key];
    const normalizedValue = String(value ?? "").trim();
    if (normalizedValue) return normalizedValue;
  }
  return "";
};

const stripTrailingZeroDecimal = (value: unknown) => {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  return raw.replace(/^(-?\d+)\.0+$/, "$1");
};

const isCutoffPreviewColumn = (column?: string) =>
  column === "cutoff" || String(column || "").startsWith("cutoff_");

const formatFeeRange = (value?: Record<string, unknown>) => {
  const tuition = ((value?.tuitionFee as Record<string, unknown> | undefined) || value || {}) as Record<string, unknown>;
  return {
    min: stripTrailingZeroDecimal(tuition.minAmount ?? value?.minAmount ?? ""),
    max: stripTrailingZeroDecimal(tuition.maxAmount ?? value?.maxAmount ?? ""),
  };
};

const normalizeRankingInteger = (value: string) => {
  const raw = normalizeScientificIntegerText(value);
  if (!raw) return "";
  const numeric = Number(raw);
  if (!Number.isFinite(numeric)) return raw.replace(/[^\d]/g, "");
  return String(Math.trunc(numeric));
};

const formatPreviewCellValue = (value: unknown, column?: string) => {
  const raw = String(value ?? "").trim();
  if (!raw) return column === "accreditation" ? "Empty" : "-";
  if (column === "phoneNumber" || column === "alternatePhone" || column === "pincode") return normalizeScientificIntegerText(raw);
  if (isCutoffPreviewColumn(column)) return raw;
  if (/^-?\d+\.0+$/.test(raw)) return stripTrailingZeroDecimal(raw);
  if (/^\d+$/.test(raw) && raw.length > 1 && raw.startsWith("0")) return raw;
  return raw;
};

const normalizeScientificInteger = (value: string) => normalizeScientificIntegerText(value);

const buildFeeRange = (min: string, max: string) => ({
  tuitionFee: { minAmount: min, maxAmount: max },
  admissionFee: { minAmount: min, maxAmount: max },
  transportFee: { minAmount: min, maxAmount: max },
  hostelFee: { minAmount: min, maxAmount: max },
  minAmount: min,
  maxAmount: max,
});

const collegeSteps = [
  "College Basic Details",
  "Media & Facilities",
  "Admission & Placement",
  "Courses & Cutoff",
];

const facilityQuickOptions = ["Library", "Sports", "WiFi", "Labs", "Transport", "Cafeteria"];
const quotaQuickOptions = ["Management Quota", "Government Quota", "Reservation Quota", "Sports Quota", "Minority Quota", "NRI Quota"];
const scholarshipQuickOptions = ["Merit Scholarship", "Government Scholarship", "Minority Scholarship", "Sports Scholarship", "Need Based Scholarship", "First Graduate Scholarship"];

type BulkSheetKey = "colleges" | "courses" | "entranceexams" | "collegeimages";
type BulkRowStatus = "Valid" | "Invalid" | "Review";
type BulkFieldIssueLevel = "missing" | "invalid" | "review" | "duplicate" | "exists";
type BulkFieldIssue = {
  level: BulkFieldIssueLevel;
  messages: string[];
};
type BulkPreviewRow = {
  id: number;
  sheet: BulkSheetKey;
  rowNumber: number;
  data: Record<string, string>;
  status: BulkRowStatus;
  errors: string[];
  fieldIssues: Record<string, BulkFieldIssue>;
};
type ZipAssetRecord = {
  normalizedPath: string;
  normalizedName: string;
  matchTokens: Set<string>;
};
type ZipAssetIndex = {
  byPath: Map<string, ZipAssetRecord>;
  byName: Map<string, ZipAssetRecord[]>;
};

const bulkSheetLabels: Record<BulkSheetKey, string> = {
  colleges: "Colleges",
  courses: "Courses",
  entranceexams: "EntranceExams",
  collegeimages: "CollegeImages",
};
const normalizeAccreditationOptionValue = (value: string) => String(value || "").trim().replace(/\s+/g, " ").toLowerCase();
const bulkEmptyLikeValues = new Set(["", "-", "na", "n/a", "none", "null", "not applicable", "not available"]);
const isBulkEmptyLikeValue = (value: string) => bulkEmptyLikeValues.has(normalizeAccreditationOptionValue(value));
const bulkCutoffCategories = ["OC", "BC", "BCM", "MBC", "SC", "SCA", "ST"] as const;
const bulkCutoffCategoryKeyMap = Object.fromEntries(
  bulkCutoffCategories.map((category) => [category, category.toLowerCase()]),
) as Record<(typeof bulkCutoffCategories)[number], string>;
const bulkSingleCutoffColumns = bulkCutoffCategories.map((category) => {
  const key = bulkCutoffCategoryKeyMap[category];
  return `cutoff_${key}`;
});
const bulkRangeCutoffColumns = bulkCutoffCategories.flatMap((category) => {
  const key = bulkCutoffCategoryKeyMap[category];
  return [`cutoff_${key}_min`, `cutoff_${key}_max`];
});
const bulkCutoffColumns = [...bulkSingleCutoffColumns, ...bulkRangeCutoffColumns];

const bulkSheetColumns: Record<BulkSheetKey, string[]> = {
  colleges: [
    "collegeCode", "collegeName", "description", "establishedYear", "ownershipType", "university", "country", "state", "city", "district", "address", "pincode", "googleMapUrl", "officialEmail", "phoneNumber", "alternatePhone", "websiteUrl", "logoImage", "coverImage", "brochurePdf", "campusVideo", "ranking", "accreditation", "awards", "reviews", "facilities", "quotas", "minFee", "maxFee", "admissionProcess", "applicationMode", "scholarships", "placementPercentage", "averagePackage", "highestPackage", "hostelGeneralInfo", "hostelType", "hostelMinFee", "hostelMaxFee", "cctvAvailability", "hostelFacilities", "isBestCollege",
  ],
  courses: [
    "collegeCode", "degreeType", "stream", "specialization", "courseName", "duration", "mode", "lateralEntry", "bestCourse", "minimumQualification", "university", "allottedSeats", "applicationFee", "courseDescription", "semesterFees", "totalFees", "cutoff_oc_min", "cutoff_oc_max", "cutoff_bc_min", "cutoff_bc_max", "cutoff_bcm_min", "cutoff_bcm_max", "cutoff_mbc_min", "cutoff_mbc_max", "cutoff_sc_min", "cutoff_sc_max", "cutoff_sca_min", "cutoff_sca_max", "cutoff_st_min", "cutoff_st_max",
  ],
  entranceexams: [
    "collegeCode", "courseName", "examName", "examWeightage", "cutoff_oc_min", "cutoff_oc_max", "cutoff_bc_min", "cutoff_bc_max", "cutoff_bcm_min", "cutoff_bcm_max", "cutoff_mbc_min", "cutoff_mbc_max", "cutoff_sc_min", "cutoff_sc_max", "cutoff_sca_min", "cutoff_sca_max", "cutoff_st_min", "cutoff_st_max", "specifiedSubjects", "preparationNotes",
  ],
  collegeimages: ["collegeCode", "imageType", "imageName"],
};

const normalizedBulkColumnLookup = Object.fromEntries(
  Object.values(bulkSheetColumns).flat().map((column) => [column.toLowerCase(), column]),
) as Record<string, string>;
const bulkPreviewColumnLabels: Record<string, string> = {
  rankingMin: "ranking_min",
  rankingMax: "ranking_max",
};

const bulkColumnAliases: Record<string, string> = {
  scholarship: "scholarships",
  hostelgen: "hostelgeneralinfo",
  allotedseats: "allottedseats",
  specifiedpaperorsyllabus: "specifiedsubjects",
  rankingmin: "rankingmin",
  rankingmax: "rankingmax",
};

const bulkSheetColumnAliases: Partial<Record<BulkSheetKey, Record<string, string>>> = {
  colleges: {
    name: "collegeName",
    collegename: "collegeName",
    collegeid: "collegeCode",
    email: "officialEmail",
    contactemail: "officialEmail",
    phone: "phoneNumber",
    contactphone: "phoneNumber",
    mobile: "phoneNumber",
    website: "websiteUrl",
    locationlink: "googleMapUrl",
    mapurl: "googleMapUrl",
    logo: "logoImage",
    cover: "coverImage",
    brochure: "brochurePdf",
    placementrate: "placementPercentage",
    minrank: "rankingMin",
    minimumrank: "rankingMin",
    rankmin: "rankingMin",
    maxrank: "rankingMax",
    maximumrank: "rankingMax",
    rankmax: "rankingMax",
    rankingminimum: "rankingMin",
    rankingmaximum: "rankingMax",
    awardsrecognitions: "awards",
    awardsandrecognitions: "awards",
    awardrecognitions: "awards",
    awardandrecognitions: "awards",
  },
  courses: {
    course: "courseName",
    coursename: "courseName",
    collegeid: "collegeCode",
    seats: "allottedSeats",
    seat: "allottedSeats",
    intake: "allottedSeats",
    allottedseat: "allottedSeats",
    allottedseats: "allottedSeats",
    allotedseat: "allottedSeats",
    allotedseats: "allottedSeats",
    applicationfee: "applicationFee",
    applicationfees: "applicationFee",
    semesterfee: "semesterFees",
    semesterfees: "semesterFees",
    totalfee: "totalFees",
    totalfees: "totalFees",
    description: "courseDescription",
  },
  entranceexams: {
    exam: "examName",
    examname: "examName",
    collegeid: "collegeCode",
    course: "courseName",
    weightage: "examWeightage",
    subjects: "specifiedSubjects",
    syllabus: "specifiedSubjects",
    notes: "preparationNotes",
  },
  collegeimages: {
    collegeid: "collegeCode",
    type: "imageType",
    image: "imageName",
    name: "imageName",
    filename: "imageName",
  },
};

const bulkSheetNameAliases: Record<string, BulkSheetKey> = {
  college: "colleges",
  colleges: "colleges",
  course: "courses",
  courses: "courses",
  entranceexam: "entranceexams",
  entranceexams: "entranceexams",
  enternceexam: "entranceexams",
  enternceexams: "entranceexams",
  enteranceexam: "entranceexams",
  enteranceexams: "entranceexams",
  enterenceexam: "entranceexams",
  enterenceexams: "entranceexams",
  collegeimage: "collegeimages",
  collegeimages: "collegeimages",
};

export default function BulkUploadDashboard({
  onImportComplete,
  onAddManualCollege,
  existingColleges = [],
}: {
  onImportComplete?: () => Promise<void> | void;
  onAddManualCollege?: () => void;
  existingColleges?: AdminCollege[];
}) {
  const previewDetailsRef = useRef<HTMLElement | null>(null);
  const [selectedUploadFiles, setSelectedUploadFiles] = useState<Record<string, File | null>>({});
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});
  const [activeUploadStep, setActiveUploadStep] = useState<"1" | "2" | null>(null);
  const [showZipUploadStep, setShowZipUploadStep] = useState(false);
  const [showValidationSummaryStep, setShowValidationSummaryStep] = useState(false);
  const [validationSummary, setValidationSummary] = useState({
    totalRecords: 0,
    validRecords: 0,
    failedRecords: 0,
    invalidRecords: 0,
    duplicates: 0,
    pendingReview: 0,
  });
  
  const [validationStatusText, setValidationStatusText] = useState("Upload bulk Excel or single college Excel, then upload one combined image ZIP to validate records.");
  const [showBulkLimitPopup, setShowBulkLimitPopup] = useState(false);
  const [showZipLimitPopup, setShowZipLimitPopup] = useState(false);
  const [showFullDetails, setShowFullDetails] = useState(false);
  const [showFinishPopup, setShowFinishPopup] = useState(false);
  const [bulkImportFinished, setBulkImportFinished] = useState(false);
  const [showAllErrors, setShowAllErrors] = useState(false);
  const [activeDetailSheet, setActiveDetailSheet] = useState<BulkSheetKey>("colleges");
  const [detailSearchText, setDetailSearchText] = useState("");
  const [detailStatusFilter, setDetailStatusFilter] = useState<"all" | BulkRowStatus>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [openFieldPanel, setOpenFieldPanel] = useState<"all" | "single" | null>(null);
  const [customSheetColumns, setCustomSheetColumns] = useState<Record<BulkSheetKey, string[]>>({
    colleges: [],
    courses: [],
    entranceexams: [],
    collegeimages: [],
  });
  const [customFieldForm, setCustomFieldForm] = useState({
    fieldName: "",
    fieldType: "Number",
    defaultValue: "",
    selectedCollegeRowId: "",
  });
  const [editingRowId, setEditingRowId] = useState<number | null>(null);
  const [editingFocusField, setEditingFocusField] = useState("");
  const [editingRowBackup, setEditingRowBackup] = useState<BulkPreviewRow | null>(null);
  const [fieldErrorText, setFieldErrorText] = useState("");
  const [previewRows, setPreviewRows] = useState<BulkPreviewRow[]>([]);
  const [validatedZipAssetIndex, setValidatedZipAssetIndex] = useState<ZipAssetIndex | null>(null);
  const [mediaPreviewUrls, setMediaPreviewUrls] = useState<Record<string, string>>({});
  const [isImporting, setIsImporting] = useState(false);
  const [bulkImportProgress, setBulkImportProgress] = useState({ completed: 0, total: 0 });
  const [currentDetailPage, setCurrentDetailPage] = useState(1);
  const editingFieldRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const itemsPerPage = 5;
  const existingCollegeCodeSet = useMemo(
    () =>
      new Set(
        existingColleges
          .map((college) => String(college.collegeCode || "").trim().toLowerCase())
          .filter(Boolean),
      ),
    [existingColleges],
  );
  const existingCollegeNameSet = useMemo(
    () =>
      new Set(
        existingColleges
          .map((college) => String(college.name || "").trim().toLowerCase())
          .filter(Boolean),
      ),
    [existingColleges],
  );
  const existingCollegeMediaByCode = useMemo(() => {
    const normalizeMediaReference = (value: string) =>
      String(value || "")
        .replace(/\\/g, "/")
        .split("/")
        .pop()
        ?.trim()
        .toLowerCase() || "";

    return new Map(
      existingColleges
        .map((college) => {
          const code = String(college.collegeCode || "").trim().toLowerCase();
          if (!code) return null;

          return [
            code,
            {
              hasLogo: Boolean(String(college.logo || "").trim()),
              hasCoverImage: Boolean(String(college.image || "").trim()),
              hasBrochure: Boolean(String(college.brochurePdfUrl || college.brochureUrl || "").trim()),
              mediaNames: new Set(
                [college.logo, college.image, college.brochurePdfUrl, college.brochureUrl, ...(Array.isArray(college.images) ? college.images : [])]
                  .map((image) => normalizeMediaReference(String(image || "")))
                  .filter(Boolean),
              ),
              imageNames: new Set(
                (Array.isArray(college.images) ? college.images : [])
                  .map((image) => normalizeMediaReference(String(image || "")))
                  .filter(Boolean),
              ),
              hasAnyMedia: Boolean(
                String(college.logo || college.image || college.brochurePdfUrl || college.brochureUrl || "").trim()
                  || (Array.isArray(college.images) && college.images.some((image) => String(image || "").trim())),
              ),
              hasGalleryImages: Array.isArray(college.images) && college.images.some((image) => String(image || "").trim()),
            },
          ] as const;
        })
        .filter((entry): entry is readonly [string, { hasLogo: boolean; hasCoverImage: boolean; hasBrochure: boolean; mediaNames: Set<string>; imageNames: Set<string>; hasAnyMedia: boolean; hasGalleryImages: boolean }] => Boolean(entry)),
    );
  }, [existingColleges]);
  const bulkCollegeRowCount = previewRows.filter((row) => row.sheet === "colleges").length;
  const isBulkCollegeLimitExceeded = bulkCollegeRowCount > MAX_BULK_COLLEGE_ROWS;
  const bulkCollegeLimitMessage = isBulkCollegeLimitExceeded ? getBulkCollegeLimitMessage() : "";
  const uploadCards = [
    {
      step: "1",
      title: "Add Bulk College Data",
      subtitle: "Upload Excel file to add multiple colleges at once",
      icon: ImageUp,
      dropText: "Drag & drop your Excel file here",
      action: "Choose Excel File",
      note: `Supports: .xlsx, .csv. Max ${MAX_BULK_COLLEGE_ROWS} colleges per bulk upload.`,
      accept: ".xlsx,.csv",
      allowedExtensions: [".xlsx", ".csv"],
    },
    {
      step: "2",
      title: "Add Single College Data",
      subtitle: "Upload one college record as Excel or CSV",
      icon: ImageUp,
      dropText: "Drag & drop your single college Excel here",
      action: "Choose Excel File",
      note: "Supports: .xlsx, .csv",
      accept: ".xlsx,.csv",
      allowedExtensions: [".xlsx", ".csv"],
    },
    {
      step: "3",
      title: "Add College Images ZIP",
      subtitle: "Upload logo, cover, brochure, and gallery files for each college",
      icon: FileClock,
      dropText: "Drag & drop combined media ZIP here",
      action: "Choose ZIP File",
      note: `Excel media columns must contain ZIP file names only. Max size: 100MB. Keep it aligned with the ${MAX_BULK_COLLEGE_ROWS}-college limit.`,
      accept: ".zip",
      allowedExtensions: [".zip"],
      maxSize: MAX_BULK_IMAGE_ZIP_SIZE_BYTES,
    },
  ];

  const formatFileSize = (size: number) => {
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getFileExtension = (fileName: string) => {
    const dotIndex = fileName.lastIndexOf(".");
    return dotIndex >= 0 ? fileName.slice(dotIndex).toLowerCase() : "";
  };

  const zipImageExtensions = new Set([".jpg", ".jpeg", ".jfif", ".png", ".webp", ".gif", ".svg"]);
  const extensionlessImageTokens = ["logo", "cover", "coverimage", "banner", "campus", "image", "photo", "img", "gallery", "hostel", "classroom", "laboratory", "library", "sports", "placement", "hospital"];

  const isZipImageLikeName = (fileName: string) => {
    const extension = getFileExtension(fileName);
    if (zipImageExtensions.has(extension)) return true;
    if (extension === ".pdf") return false;
    const normalizedName = normalizeUploadKey(normalizeZipName(fileName));
    const normalizedBaseName = normalizeUploadKey(normalizeZipName(fileName).replace(/\.[^.]+$/, ""));
    return extensionlessImageTokens.some((token) => normalizedName.includes(token) || normalizedBaseName.includes(token));
  };

  const decodeXml = (value: string) =>
    value
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'");

  const normalizeUploadKey = (value: string) =>
    String(value || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");

  const displayColumnName = (value: string) =>
    bulkPreviewColumnLabels[value] || normalizedBulkColumnLookup[value.toLowerCase()] || value;

  const normalizeZipName = (value: string) =>
    String(value || "").replace(/\\/g, "/").split("/").pop()?.trim().toLowerCase() || "";

  const normalizeZipPath = (value: string) =>
    String(value || "").replace(/\\/g, "/").replace(/^\.?\//, "").trim().toLowerCase();

  const getZipMatchTokens = (value: string) => {
    const normalizedPath = normalizeZipPath(value);
    const tokens = new Set<string>();

    normalizedPath
      .split("/")
      .map((segment) => segment.replace(/\.[^.]+$/, ""))
      .forEach((segment) => {
        const compactToken = normalizeUploadKey(segment);
        if (compactToken) tokens.add(compactToken);

        const segmentParts = segment
          .split(/[^a-z0-9]+/i)
          .map((part) => normalizeUploadKey(part))
          .filter(Boolean);

        segmentParts.forEach((partToken) => tokens.add(partToken));
        if (segmentParts.length > 1) {
          const joinedPartsToken = segmentParts.join("");
          if (joinedPartsToken) tokens.add(joinedPartsToken);
        }

        const alphaNumericGroups = segment.match(/[a-z]+|\d+/gi) || [];
        const normalizedGroups = alphaNumericGroups
          .map((part) => normalizeUploadKey(part))
          .filter(Boolean);

        normalizedGroups.forEach((partToken) => tokens.add(partToken));
        for (let index = 0; index < normalizedGroups.length - 1; index += 1) {
          const combinedGroupToken = `${normalizedGroups[index]}${normalizedGroups[index + 1]}`;
          if (combinedGroupToken) tokens.add(combinedGroupToken);
        }

        ["logo", "cover", "banner", "brochure", "campus", "image", "photo", "img"].forEach((mediaToken) => {
          if (compactToken.endsWith(mediaToken) && compactToken.length > mediaToken.length) {
            tokens.add(compactToken.slice(0, -mediaToken.length));
          }
          if (compactToken.startsWith(mediaToken) && compactToken.length > mediaToken.length) {
            tokens.add(compactToken.slice(mediaToken.length));
          }
        });
      });

    const fullPathToken = normalizeUploadKey(normalizedPath.replace(/\.[^.]+$/, ""));
    if (fullPathToken) tokens.add(fullPathToken);

    return tokens;
  };

  const buildZipAssetIndex = (fileNames: Iterable<string>): ZipAssetIndex => {
    const byPath = new Map<string, ZipAssetRecord>();
    const byName = new Map<string, ZipAssetRecord[]>();

    for (const fileName of fileNames) {
      const normalizedPath = normalizeZipPath(fileName);
      const normalizedName = normalizeZipName(fileName);
      if (!normalizedPath || !normalizedName) continue;

      const descriptor: ZipAssetRecord = {
        normalizedPath,
        normalizedName,
        matchTokens: getZipMatchTokens(fileName),
      };

      byPath.set(normalizedPath, descriptor);
      if (!byName.has(normalizedName)) byName.set(normalizedName, []);
      byName.get(normalizedName)?.push(descriptor);
    }

    return { byPath, byName };
  };

  const findBrochureZipAssetRecord = (
    zipAssetIndex: ZipAssetIndex | null,
    collegeCode = "",
  ): ZipAssetRecord | null => {
    if (!zipAssetIndex) return null;

    const collegeToken = normalizeUploadKey(collegeCode);
    const records = [...zipAssetIndex.byPath.values()].filter((record) =>
      !collegeToken || record.matchTokens.has(collegeToken),
    );

    const brochureNamedRecords = records.filter((record) => record.normalizedName.includes("brochure"));
    if (brochureNamedRecords.length > 0) return brochureNamedRecords[0];

    const pdfRecords = records.filter((record) => getFileExtension(record.normalizedName) === ".pdf");
    if (pdfRecords.length === 1) return pdfRecords[0];

    return null;
  };

  const resolveZipAssetRecord = (
    zipAssetIndex: ZipAssetIndex | null,
    fileName: string,
    collegeCode = "",
    options: { preferBrochure?: boolean } = {},
  ): ZipAssetRecord | null => {
    const raw = String(fileName || "").trim();
    if (!raw || !zipAssetIndex) return null;

    const collegeToken = normalizeUploadKey(collegeCode);
    const normalizedPath = normalizeZipPath(raw);
    if (normalizedPath && zipAssetIndex.byPath.has(normalizedPath)) {
      const pathRecord = zipAssetIndex.byPath.get(normalizedPath) || null;
      if (pathRecord && collegeToken && !pathRecord.matchTokens.has(collegeToken)) {
        return null;
      }
      return pathRecord;
    }

    const normalizedName = normalizeZipName(raw);
    if (!normalizedName) return null;

    const candidates = zipAssetIndex.byName.get(normalizedName) || [];
    const codeScopedCandidates = collegeToken
      ? candidates.filter((candidate) => candidate.matchTokens.has(collegeToken))
      : candidates;
    if (collegeToken && candidates.length > 0 && codeScopedCandidates.length === 0) {
      return null;
    }
    if (candidates.length <= 1) {
      if (codeScopedCandidates[0]) return codeScopedCandidates[0];
      if (!collegeToken && candidates[0]) return candidates[0];
    } else if (collegeToken) {
      if (codeScopedCandidates.length > 0) return codeScopedCandidates[0];
    }

    const requestedBaseToken = normalizeUploadKey(
      normalizedName.replace(/\.(jpg|jpeg|jfif|png|webp|gif|svg|pdf)$/i, ""),
    );
    if (requestedBaseToken) {
      const looseMatches = [...zipAssetIndex.byPath.values()].filter((record) => {
        if (collegeToken && !record.matchTokens.has(collegeToken)) return false;
        const recordBaseToken = normalizeUploadKey(record.normalizedName.replace(/\.(jpg|jpeg|jfif|png|webp|gif|svg|pdf)$/i, ""));
        return recordBaseToken === requestedBaseToken || recordBaseToken.includes(requestedBaseToken);
      });
      if (looseMatches.length > 0) return looseMatches[0];
    }

    if (options.preferBrochure) {
      return findBrochureZipAssetRecord(zipAssetIndex, collegeCode);
    }

    return codeScopedCandidates[0] || (!collegeToken ? candidates[0] : null) || null;
  };

  const supportedGalleryImageTypes = ["campus", "hostel", "classroom", "laboratory", "library", "sports", "placement", "hospital"] as const;

  const inferGalleryImageType = (fileName: string) => {
    const normalizedFileName = normalizeUploadKey(normalizeZipName(fileName));
    const normalizedBaseName = normalizeUploadKey(normalizeZipName(fileName).replace(/\.[^.]+$/, ""));
    const searchableName = `${normalizedFileName} ${normalizedBaseName}`;
    return supportedGalleryImageTypes.find((type) => searchableName.includes(type)) || "campus";
  };

  const inferZipMediaForCollege = (
    zipAssetIndex: ZipAssetIndex | null,
    collegeCode: string,
    allowLooseMatch = false,
  ) => {
    if (!zipAssetIndex) {
      return {
        logoImage: "",
        coverImage: "",
        brochurePdf: "",
        galleryImages: [] as Array<{ imageName: string; imageType: string }>,
      };
    }

    const collegeToken = normalizeUploadKey(collegeCode);
    const allRecords = [...zipAssetIndex.byPath.values()];
    const records = allRecords.filter((record) =>
      collegeToken ? record.matchTokens.has(collegeToken) : allowLooseMatch,
    );

    records.sort((left, right) => left.normalizedPath.localeCompare(right.normalizedPath));

    let logoImage = "";
    let coverImage = "";
    let brochurePdf = "";
    const galleryImages: Array<{ imageName: string; imageType: string }> = [];

    for (const record of records) {
      const extension = getFileExtension(record.normalizedName);
      const normalizedPathBaseName = normalizeUploadKey(record.normalizedPath.replace(/\.[^.]+$/, ""));
      const normalizedPathName = normalizeUploadKey(record.normalizedPath);
      const searchablePathName = `${normalizedPathName} ${normalizedPathBaseName}`;

      if (!brochurePdf && (extension === ".pdf" || normalizedPathBaseName.includes("brochure"))) {
        brochurePdf = record.normalizedPath;
        continue;
      }

      if (!isZipImageLikeName(record.normalizedName)) continue;

      if (!logoImage && searchablePathName.includes("logo")) {
        logoImage = record.normalizedPath;
        continue;
      }

      if (!coverImage && (searchablePathName.includes("cover") || searchablePathName.includes("coverimage") || searchablePathName.includes("banner"))) {
        coverImage = record.normalizedPath;
        continue;
      }

      galleryImages.push({
        imageName: record.normalizedPath,
        imageType: inferGalleryImageType(record.normalizedName),
      });
    }

    if (allowLooseMatch && collegeToken) {
      const seenGalleryImages = new Set(galleryImages.map((image) => normalizeZipPath(image.imageName)));
      const codeMatchedPaths = new Set(records.map((record) => record.normalizedPath));

      allRecords
        .filter((record) => !codeMatchedPaths.has(record.normalizedPath) && isZipImageLikeName(record.normalizedName))
        .sort((left, right) => left.normalizedPath.localeCompare(right.normalizedPath))
        .forEach((record) => {
          if (seenGalleryImages.has(record.normalizedPath)) return;
          galleryImages.push({
            imageName: record.normalizedPath,
            imageType: inferGalleryImageType(record.normalizedName),
          });
          seenGalleryImages.add(record.normalizedPath);
        });
    }

    return {
      logoImage,
      coverImage,
      brochurePdf,
      galleryImages,
    };
  };

  const enrichSheetsWithZipAssets = (
    sheets: Map<string, Record<string, string>[]>,
    zipAssetIndex: ZipAssetIndex | null,
  ) => {
    if (!zipAssetIndex) return sheets;

    const nextSheets = new Map<string, Record<string, string>[]>(
      [...sheets.entries()].map(([sheet, rows]) => [sheet, rows.map((row) => ({ ...row }))]),
    );

    const collegeCodeKey = normalizeUploadKey("collegeCode");
    const logoImageKey = normalizeUploadKey("logoImage");
    const coverImageKey = normalizeUploadKey("coverImage");
    const brochurePdfKey = normalizeUploadKey("brochurePdf");
    const imageTypeKey = normalizeUploadKey("imageType");
    const imageNameKey = normalizeUploadKey("imageName");

    const colleges = nextSheets.get("colleges") || [];
    const collegeImages = [...(nextSheets.get("collegeimages") || [])];
    const hasSingleCollege = colleges.length === 1;
    const existingImageKeys = new Set(
      collegeImages.map((row) => {
        const code = String(row[collegeCodeKey] || "").trim().toLowerCase();
        const imageName = normalizeZipPath(String(row[imageNameKey] || ""));
        return `${code}|${imageName}`;
      }),
    );
    const imageCountByCollege = collegeImages.reduce<Record<string, number>>((counts, row) => {
      const code = String(row[collegeCodeKey] || "").trim().toLowerCase();
      if (code) counts[code] = (counts[code] || 0) + 1;
      return counts;
    }, {});

    for (const collegeRow of colleges) {
      const collegeCode = String(collegeRow[collegeCodeKey] || "").trim();
      if (!collegeCode) continue;

      const inferredMedia = inferZipMediaForCollege(zipAssetIndex, collegeCode, hasSingleCollege);
      if (!String(collegeRow[logoImageKey] || "").trim() && inferredMedia.logoImage) {
        collegeRow[logoImageKey] = inferredMedia.logoImage;
      }
      if (!String(collegeRow[coverImageKey] || "").trim() && inferredMedia.coverImage) {
        collegeRow[coverImageKey] = inferredMedia.coverImage;
      }
      if (!String(collegeRow[brochurePdfKey] || "").trim() && inferredMedia.brochurePdf) {
        collegeRow[brochurePdfKey] = inferredMedia.brochurePdf;
      }

      const codeKey = collegeCode.toLowerCase();
      let currentImageCount = imageCountByCollege[codeKey] || 0;
      for (const galleryImage of inferredMedia.galleryImages) {
        const imageName = normalizeZipPath(galleryImage.imageName);
        const existingKey = `${codeKey}|${imageName}`;
        if (!imageName || existingImageKeys.has(existingKey)) continue;

        collegeImages.push({
          [collegeCodeKey]: collegeCode,
          [imageTypeKey]: galleryImage.imageType,
          [imageNameKey]: galleryImage.imageName,
        });
        existingImageKeys.add(existingKey);
        currentImageCount += 1;
      }
      imageCountByCollege[codeKey] = currentImageCount;
    }

    nextSheets.set("colleges", colleges);
    if (collegeImages.length > 0) {
      nextSheets.set("collegeimages", collegeImages);
    }

    return nextSheets;
  };

  const parseCsvRows = (text: string) => {
    const rows: string[][] = [];
    let cell = "";
    let row: string[] = [];
    let inQuotes = false;

    for (let index = 0; index < text.length; index += 1) {
      const char = text[index];
      const next = text[index + 1];
      if (char === '"' && inQuotes && next === '"') {
        cell += '"';
        index += 1;
      } else if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        row.push(cell.trim());
        cell = "";
      } else if ((char === "\n" || char === "\r") && !inQuotes) {
        if (char === "\r" && next === "\n") index += 1;
        row.push(cell.trim());
        if (row.some(Boolean)) rows.push(row);
        row = [];
        cell = "";
      } else {
        cell += char;
      }
    }

    row.push(cell.trim());
    if (row.some(Boolean)) rows.push(row);
    return rows;
  };

  const resolveBulkSheetKey = (value: string): BulkSheetKey | undefined =>
    bulkSheetNameAliases[normalizeUploadKey(value)];

  const getSchemaHeaderKey = (header: string, sheet?: BulkSheetKey) => {
    const normalized = normalizeUploadKey(header);
    if (!normalized) return "";

    const sheetAlias = sheet ? bulkSheetColumnAliases[sheet]?.[normalized] : "";
    const globalAlias = bulkColumnAliases[normalized];
    const aliasTarget = sheetAlias || globalAlias;
    if (aliasTarget) return normalizeUploadKey(aliasTarget);

    const schemaColumns = sheet ? bulkSheetColumns[sheet] : Object.values(bulkSheetColumns).flat();
    const schemaColumn = schemaColumns.find((column) => normalizeUploadKey(column) === normalized);
    return schemaColumn ? normalizeUploadKey(schemaColumn) : "";
  };

  const getUploadHeaderKey = (header: string, sheet?: BulkSheetKey) => {
    const knownKey = getSchemaHeaderKey(header, sheet);
    return knownKey || normalizeUploadKey(header);
  };

  const findHeaderRowIndex = (rows: string[][], sheet?: BulkSheetKey) => {
    const scoredRows = rows.map((row, index) => ({
      index,
      score: row.filter((cell) => getSchemaHeaderKey(cell, sheet)).length,
    }));
    const bestRow = scoredRows.reduce((best, current) => (current.score > best.score ? current : best), {
      index: 0,
      score: 0,
    });
    return bestRow.score >= 2 ? bestRow.index : 0;
  };

  const rowsToObjects = (rows: string[][], sheet?: BulkSheetKey) => {
    const headerRowIndex = findHeaderRowIndex(rows, sheet);
    const headerRow = rows[headerRowIndex] || [];
    const dataRows = rows.slice(headerRowIndex + 1);
    const headers = headerRow.map((item) => getUploadHeaderKey(item, sheet));
    const integerTextColumns = new Set(["phoneNumber", "alternatePhone", "pincode"]);
    return dataRows
      .map((row) =>
        headers.reduce<Record<string, string>>((record, header, index) => {
          const value = String(row[index] || "").trim();
          if (header && value) {
            record[header] = integerTextColumns.has(header)
              ? normalizeScientificIntegerText(value)
              : value;
          }
          return record;
        }, {}),
      )
      .filter((row) => Object.values(row).some(Boolean));
  };

  const readZipEntries = async (file: File) => {
    try {
      const buffer = new Uint8Array(await file.arrayBuffer());
      const entries = unzipSync(buffer);
      return new Map<string, Uint8Array>(
        Object.entries(entries).map(([fileName, content]) => [fileName.replace(/\\/g, "/"), content]),
      );
    } catch {
      throw new Error("Unable to extract ZIP file. Please upload a valid .zip archive.");
    }
  };

  const readZipEntryNames = async (file: File) => {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    let endOffset = -1;

    for (let offset = bytes.length - 22; offset >= Math.max(0, bytes.length - 66000); offset -= 1) {
      if (view.getUint32(offset, true) === 0x06054b50) {
        endOffset = offset;
        break;
      }
    }

    if (endOffset < 0) {
      throw new Error("Unable to read ZIP file names.");
    }

    const decoder = new TextDecoder("utf-8");
    const totalEntries = view.getUint16(endOffset + 10, true);
    let centralOffset = view.getUint32(endOffset + 16, true);
    const fileNames: string[] = [];

    for (let entryIndex = 0; entryIndex < totalEntries; entryIndex += 1) {
      if (centralOffset + 46 > bytes.length || view.getUint32(centralOffset, true) !== 0x02014b50) break;

      const fileNameLength = view.getUint16(centralOffset + 28, true);
      const extraLength = view.getUint16(centralOffset + 30, true);
      const commentLength = view.getUint16(centralOffset + 32, true);
      const nameStart = centralOffset + 46;
      const nameEnd = nameStart + fileNameLength;
      if (nameEnd > bytes.length) break;

      const fileName = decoder.decode(bytes.slice(nameStart, nameEnd)).replace(/\\/g, "/");
      if (fileName && !fileName.endsWith("/")) fileNames.push(fileName);
      centralOffset += 46 + fileNameLength + extraLength + commentLength;
    }

    return fileNames;
  };

  const parseAttributes = (value: string) => {
    const attrs: Record<string, string> = {};
    value.replace(/([\w:]+)="([^"]*)"/g, (_match, key: string, attrValue: string) => {
      attrs[key] = decodeXml(attrValue);
      return "";
    });
    return attrs;
  };

  const columnIndexFromCellRef = (ref: string) => {
    const letters = (ref.match(/[A-Z]+/i)?.[0] || "").toUpperCase();
    return letters.split("").reduce((total, char) => total * 26 + char.charCodeAt(0) - 64, 0) - 1;
  };

  const getXlsxCellValue = (cellAttrs: string, cellXml: string, sharedStrings: string[]) => {
    const attrsForCell = parseAttributes(cellAttrs);
    const rawValue = cellXml.match(/<v[^>]*>([\s\S]*?)<\/v>/)?.[1] || "";
    const inlineValues = [...cellXml.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((match) => match[1]).join("");
    const value =
      attrsForCell.t === "s"
        ? sharedStrings[Number(rawValue)] || ""
        : decodeXml(inlineValues || rawValue);

    return {
      columnIndex: columnIndexFromCellRef(attrsForCell.r || ""),
      value,
    };
  };

  const parseXlsxFile = async (file: File) => {
    const entries = await readZipEntries(file);
    const getXml = (path: string) => {
      const entry = entries.get(path) || entries.get(path.replace(/^\//, ""));
      return entry ? strFromU8(entry) : "";
    };

    const sharedXml = getXml("xl/sharedStrings.xml");
    const sharedStrings = [...sharedXml.matchAll(/<si[^>]*>([\s\S]*?)<\/si>/g)].map((match) =>
      decodeXml([...match[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((item) => item[1]).join("")),
    );
    const workbookXml = getXml("xl/workbook.xml");
    const relsXml = getXml("xl/_rels/workbook.xml.rels");
    const rels = new Map<string, string>();
    relsXml.replace(/<Relationship\b([^>]*)\/>/g, (_match, attrsText: string) => {
      const attrs = parseAttributes(attrsText);
      if (attrs.Id && attrs.Target) rels.set(attrs.Id, attrs.Target);
      return "";
    });

    const sheets = new Map<string, Record<string, string>[]>();
    workbookXml.replace(/<sheet\b([^>]*)\/>/g, (_match, attrsText: string) => {
      const attrs = parseAttributes(attrsText);
      const relId = attrs["r:id"];
      const target = relId ? rels.get(relId) : "";
      if (!attrs.name || !target) return "";
      const sheetPath = target.startsWith("/") ? target.slice(1) : `xl/${target.replace(/^\.\.\//, "")}`;
      const sheetXml = getXml(sheetPath);
      const tableRows: string[][] = [];

      sheetXml.replace(/<row\b[^>]*>([\s\S]*?)<\/row>/g, (_rowMatch, rowXml: string) => {
        const rowValues: string[] = [];
        rowXml.replace(/<c\b([^>]*?)(?:>([\s\S]*?)<\/c>|\/>)/g, (_cellMatch, cellAttrs: string, cellXml = "") => {
          const { columnIndex, value } = getXlsxCellValue(cellAttrs, cellXml, sharedStrings);
          rowValues[columnIndex >= 0 ? columnIndex : rowValues.length] = value;
          return "";
        });
        if (rowValues.some(Boolean)) tableRows.push(rowValues);
        return "";
      });

      const sheetKey = resolveBulkSheetKey(attrs.name);
      sheets.set(sheetKey || normalizeUploadKey(attrs.name), rowsToObjects(tableRows, sheetKey));
      return "";
    });

    return sheets;
  };

  const readWorkbookSheets = async (file: File) => {
    const extension = getFileExtension(file.name);
    if (extension === ".csv") {
      return new Map([["colleges", rowsToObjects(parseCsvRows(await file.text()), "colleges")]]);
    }
    if (extension === ".xlsx") return parseXlsxFile(file);
    throw new Error("Please upload .xlsx or .csv files for bulk validation.");
  };

  const readZipAssetIndex = async (file: File) => {
    try {
      const entries = await readZipEntries(file);
      return buildZipAssetIndex(entries.keys());
    } catch {
      const fileNames = await readZipEntryNames(file);
      return buildZipAssetIndex(fileNames);
    }
  };

  const getImageMimeType = (fileName: string) => {
    const extension = getFileExtension(fileName);
    if (extension === ".png") return "image/png";
    if (extension === ".jfif") return "image/jpeg";
    if (extension === ".webp") return "image/webp";
    if (extension === ".gif") return "image/gif";
    if (extension === ".svg") return "image/svg+xml";
    return "image/jpeg";
  };

  const readZipImagePreviewUrls = async (file: File) => {
    let entries: Map<string, Uint8Array>;
    try {
      entries = await readZipEntries(file);
    } catch {
      return {};
    }
    return Object.fromEntries(
      [...entries.entries()]
        .filter(([name]) => isZipImageLikeName(name))
        .map(([name, bytes]) => {
          const normalizedName = normalizeZipPath(name);
          const blobPart = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
          return [normalizedName, URL.createObjectURL(new Blob([blobPart], { type: getImageMimeType(name) }))];
        }),
    );
  };

  const getSheetRows = (sheets: Map<string, Record<string, string>[]>, sheet: BulkSheetKey) => sheets.get(sheet) || [];

  const cellValue = (row: Record<string, string>, column: string) => String(row[normalizeUploadKey(column)] || "").trim();

  const isRemoteAssetReference = (value: string) => /^https?:\/\//i.test(String(value || "").trim());
  const getZipOnlyAssetError = (column: string) => `${displayColumnName(column)} must be a ZIP file name, not a URL`;
  const parseLooseNumber = (value: string) => {
    const raw = String(value || "").trim();
    if (isBulkEmptyLikeValue(raw)) return undefined;
    const cleaned = raw.replace(/,/g, "");
    const directParsed = Number(cleaned);
    if (Number.isFinite(directParsed)) return directParsed;
    const match = cleaned.match(/-?\d+(\.\d+)?/);
    if (!match) return undefined;
    const parsed = Number(match[0]);
    return Number.isFinite(parsed) ? parsed : undefined;
  };
  const normalizeIntegerishValue = (value: string) => {
    const raw = String(value || "").trim().replace(/,/g, "");
    if (isBulkEmptyLikeValue(raw)) return "";
    if (/^\d+\.0+$/.test(raw)) return raw.replace(/\.0+$/, "");
    return raw;
  };
  const isFlexibleBooleanValue = (value: string) => {
    const normalized = String(value || "").trim().toLowerCase();
    return isBulkEmptyLikeValue(normalized) || ["true", "false", "yes", "no", "y", "n", "1", "0", "available", "not_available"].includes(normalized);
  };
  const isBestCourseValue = (value: string) => {
    const raw = String(value || "").trim();
    return isBulkEmptyLikeValue(raw) || raw.length <= 120;
  };
  const isValidEmailValue = (value: string) => {
    const raw = String(value || "").trim();
    return isBulkEmptyLikeValue(raw) || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw);
  };
  const isValidPhoneValue = (value: string) => {
    const raw = String(value || "").trim();
    if (isBulkEmptyLikeValue(raw)) return true;
    const digits = normalizeScientificInteger(raw).replace(/\D/g, "");
    if (/^\d{10}$/.test(digits)) return true;
    if (digits.length === 11 && digits.startsWith("0")) return true;
    const normalized = digits.length > 10 && digits.startsWith("91") ? digits.slice(2) : digits;
    return /^\d{10}$/.test(normalized);
  };
  const isValidPincodeValue = (value: string) => {
    const raw = normalizeScientificInteger(normalizeIntegerishValue(value)).replace(/\s/g, "");
    return isBulkEmptyLikeValue(raw) || /^\d{6}$/.test(raw);
  };
  const isValidUrlValue = (value: string) => {
    const raw = String(value || "").trim();
    if (isBulkEmptyLikeValue(raw) || isRemoteAssetReference(raw)) return true;
    try {
      const parsed = new URL(raw);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  };
  const isValidYearValue = (value: string) => {
    const raw = String(value || "").trim();
    if (isBulkEmptyLikeValue(raw)) return true;
    const year = parseLooseNumber(raw);
    return year !== undefined && year >= 1800 && year <= new Date().getFullYear() + 1;
  };
  const isStrictIntegerValue = (value: string) => {
    const raw = normalizeScientificInteger(normalizeIntegerishValue(value));
    return isBulkEmptyLikeValue(raw) || /^\d+$/.test(raw);
  };
  const isValidDurationValue = (value: string) => {
    const raw = String(value || "").trim();
    if (isBulkEmptyLikeValue(raw)) return true;
    return /^\d+(?:\.\d+)?\s*(year|years|month|months|semester|semesters)$/i.test(raw);
  };
  const isValidAccreditationValue = (value: string) => {
    const raw = String(value || "").trim();
    return isBulkEmptyLikeValue(raw) || Boolean(raw);
  };
  const getBulkRankingValidationMessage = (value: string) => {
    const normalized = String(value || "").trim();
    if (!normalized) return "";
    const [startText = "", endText = ""] = normalized.split("-").map((item) => normalizeRankingInteger(item));
    if (!startText || !endText) return "Both rankingMin and rankingMax are required when entering ranking";
    if (Number(startText) > Number(endText)) return "rankingMin must be less than or equal to rankingMax";
    return "";
  };
  const isValidBulkRankingValue = (value: string) => {
    const normalized = String(value || "").trim();
    if (isBulkEmptyLikeValue(normalized)) return true;
    const [startText = "", endText = ""] = normalized.split("-").map((item) => normalizeRankingInteger(item));
    return Boolean(startText && endText && Number.isFinite(Number(startText)) && Number.isFinite(Number(endText)));
  };
  const isNumberWithinRange = (value: string, minimum: number, maximum: number) => {
    const parsed = parseLooseNumber(value);
    return parsed === undefined || (parsed >= minimum && parsed <= maximum);
  };
  const isCheckedPreviewBoolean = (value: string) => {
    const normalized = String(value || "").trim().toLowerCase();
    return ["true", "yes", "y", "1", "available", "best", "top", "recommended", "popular", "featured", "main"].includes(normalized);
  };
  const bulkDegreeTypeValues = new Set(["ug", "pg", "diploma", "iti", "certificate", "doctorate", "phd"]);
  const looksLikeBulkDegreeType = (value: string) =>
    bulkDegreeTypeValues.has(String(value || "").trim().toLowerCase().replace(/\./g, ""));
  const resolveBulkCourseStreamAndDegree = (rowData: Record<string, string>) => {
    const rawDegreeType = String(rowData.degreeType || "").trim();
    const rawStream = String(rowData.stream || rowData.courseCategory || "").trim();

    if (rawDegreeType && rawStream && !looksLikeBulkDegreeType(rawDegreeType) && looksLikeBulkDegreeType(rawStream)) {
      return {
        degreeType: rawStream.toUpperCase(),
        stream: normalizeCourseStream(rawDegreeType),
      };
    }

    return {
      degreeType: rawDegreeType,
      stream: normalizeCourseStream(rawStream),
    };
  };
  const getBulkCutoffByCategoryForImport = (rowData: Record<string, string>) =>
    bulkCutoffCategories
      .map((category): CategoryCutoff | null => {
        const key = bulkCutoffCategoryKeyMap[category];
        const single = String(rowData[`cutoff_${key}`] || "").trim();
        const min = String(rowData[`cutoff_${key}_min`] || "").trim();
        const max = String(rowData[`cutoff_${key}_max`] || "").trim();
        const hasExplicitEmptyCutoff = [single, min, max].some(
          (value) => Boolean(value) && isBulkEmptyLikeValue(value),
        );
        const cutoff =
          formatCutoffForSave(single || (min || max ? `${min}-${max}` : "")) ||
          (hasExplicitEmptyCutoff ? "N/A" : "");
        return cutoff ? { category, cutoff } : null;
      })
      .filter((item): item is CategoryCutoff => Boolean(item));
  const cleanBulkNumericImportValue = (value: string) => {
    const raw = String(value || "").trim();
    return isBulkEmptyLikeValue(raw) ? "" : raw;
  };
  const cleanBulkNumericImportColumns = (rowData: Record<string, string>, columns: string[]) =>
    Object.fromEntries(columns.map((column) => [column, cleanBulkNumericImportValue(rowData[column] || "")]));
  const enrichBulkImportRowData = (row: BulkPreviewRow) => {
    const data = { ...row.data };

    if (row.sheet === "courses") {
      const baseCourseName = String(data.courseName || "").trim();
      const resolvedCourseIdentity = resolveBulkCourseStreamAndDegree(data);
      const normalizedStream = resolvedCourseIdentity.stream;
      const specialization = String(data.specialization || baseCourseName || "").trim();
      const cutoffByCategory = getBulkCutoffByCategoryForImport(data);

      return {
        ...data,
        ...cleanBulkNumericImportColumns(data, bulkCutoffColumns),
        course: [baseCourseName, normalizedStream, specialization].filter(Boolean).join(" - "),
        courseType: baseCourseName,
        courseCategory: normalizedStream,
        courseName: specialization,
        degreeType: resolvedCourseIdentity.degreeType,
        stream: normalizedStream,
        specialization,
        lateralEntryAvailable: isCheckedPreviewBoolean(data.lateralEntry),
        isTopCourse: isCheckedPreviewBoolean(data.bestCourse),
        admissionProcess: data.admissionProcess || "",
        description: data.courseDescription || data.description || "",
        allottedSeats: cleanBulkNumericImportValue(data.allottedSeats),
        applicationFee: cleanBulkNumericImportValue(data.applicationFee),
        semesterFees: cleanBulkNumericImportValue(data.semesterFees),
        totalFees: cleanBulkNumericImportValue(data.totalFees),
        intake: cleanBulkNumericImportValue(data.allottedSeats || data.intake || ""),
        cutoffByCategory,
        cutoff: cutoffByCategory[0]?.cutoff || "",
        college: data.collegeCode || "",
        collegeCode: data.collegeCode || "",
      };
    }

    if (row.sheet === "entranceexams") {
      const cutoffByCategory = getBulkCutoffByCategoryForImport(data);

      return {
        ...data,
        ...cleanBulkNumericImportColumns(data, bulkCutoffColumns),
        weightage: data.examWeightage || "",
        paperOrSyllabus: data.specifiedSubjects || "",
        examWeightage: cleanBulkNumericImportValue(data.examWeightage),
        cutoffByCategory,
        cutoffScoreOrRank: cutoffByCategory[0]?.cutoff || "",
      };
    }

    if (row.sheet === "colleges") {
      return {
        ...data,
        name: data.collegeName || data.name || "",
        contactEmail: data.officialEmail || data.contactEmail || "",
        contactPhone: data.phoneNumber || data.contactPhone || "",
        website: data.websiteUrl || data.website || "",
        locationLink: data.googleMapUrl || data.locationLink || "",
        mapUrl: data.googleMapUrl || data.mapUrl || "",
        logo: data.logoImage || data.logo || "",
        image: data.coverImage || data.image || "",
        coverImage: data.coverImage || "",
        isBestCollege: isCheckedPreviewBoolean(data.isBestCollege),
        isTopCollege: isCheckedPreviewBoolean(data.isBestCollege),
      };
    }

    return data;
  };
  const hasAnyBulkCutoffValue = (rowData: Record<string, string>, columns = bulkCutoffColumns) =>
    columns.some((column) => String(rowData[column] || "").trim());
  const getBulkPreviewColumns = (sheet: BulkSheetKey) =>
    sheet === "colleges"
      ? bulkSheetColumns.colleges.flatMap((column) => (column === "ranking" ? ["rankingMin", "rankingMax"] : [column]))
      : bulkSheetColumns[sheet];
  const getPreviewRankingRangeValues = (rankingValue: string) => {
    const normalized = String(rankingValue || "").trim();
    if (!normalized) return { rankingMin: "", rankingMax: "" };
    const [rankingMin = "", rankingMax = ""] = normalized.split("-").map((item) => normalizeRankingInteger(item));
    return { rankingMin, rankingMax };
  };
  const createFieldIssue = (level: BulkFieldIssueLevel, message: string): BulkFieldIssue => ({
    level,
    messages: [message],
  });
  const addFieldIssue = (
    issues: Record<string, BulkFieldIssue>,
    column: string,
    level: BulkFieldIssueLevel,
    message: string,
  ) => {
    const current = issues[column];
    if (!current) {
      issues[column] = createFieldIssue(level, message);
      return;
    }
    const levelPriority: Record<BulkFieldIssueLevel, number> = {
      missing: 5,
      exists: 4,
      invalid: 3,
      duplicate: 3,
      review: 1,
    };
    issues[column] = {
      level: levelPriority[level] > levelPriority[current.level] ? level : current.level,
      messages: current.messages.includes(message) ? current.messages : [...current.messages, message],
    };
  };
  const collectFieldIssues = (issues: Record<string, BulkFieldIssue>) =>
    Object.values(issues).flatMap((issue) => issue.messages);
  const hasExistingFieldIssue = (issues: Record<string, BulkFieldIssue>) =>
    Object.values(issues).some((issue) => issue.level === "exists");
  const getBulkPreviewStatusLabel = (row: Pick<BulkPreviewRow, "status" | "fieldIssues">) =>
    hasExistingFieldIssue(row.fieldIssues) ? "Already Exists" : row.status;
  const getBulkPreviewStatusClassName = (row: Pick<BulkPreviewRow, "status" | "fieldIssues">) => {
    if (hasExistingFieldIssue(row.fieldIssues)) return "bg-[#fff1f1] text-[#c81e1e]";
    if (row.status === "Valid") return "bg-[#e8f8ee] text-[#16a34a]";
    if (row.status === "Review") return "bg-[#fff7e6] text-[#e8790a]";
    return "bg-[#ffe9e9] text-[#ef233c]";
  };
  const validateBulkCutoffRanges = (
    rowData: Record<string, string>,
    { allowSingle = true }: { allowSingle?: boolean } = {},
  ) =>
    bulkCutoffCategories.flatMap((category) => {
      const key = bulkCutoffCategoryKeyMap[category];
      const singleColumn = `cutoff_${key}`;
      const minColumn = `cutoff_${key}_min`;
      const maxColumn = `cutoff_${key}_max`;
      const single = String(rowData[singleColumn] || "").trim();
      const min = String(rowData[minColumn] || "").trim();
      const max = String(rowData[maxColumn] || "").trim();
      const errors: string[] = [];

      if ((min && !max) || (!min && max)) {
        errors.push(`Both ${displayColumnName(minColumn)} and ${displayColumnName(maxColumn)} are required when using a range for ${category}`);
        return errors;
      }

      if (allowSingle && single && (min || max)) {
        errors.push(`Use either ${displayColumnName(singleColumn)} or ${displayColumnName(minColumn)} / ${displayColumnName(maxColumn)} for ${category}`);
      }

      const minValue = parseLooseNumber(min);
      const maxValue = parseLooseNumber(max);
      if (minValue !== undefined && maxValue !== undefined && minValue > maxValue) {
        errors.push(`${displayColumnName(minColumn)} must be less than or equal to ${displayColumnName(maxColumn)}`);
      }

      return errors;
    });

  const getBulkCollegeGroupKey = (row: Pick<BulkPreviewRow, "id" | "sheet" | "data">) => {
    const collegeCode = String(row.data.collegeCode || "").trim().toLowerCase();
    return collegeCode ? `code:${collegeCode}` : `missing:${row.sheet}:${row.id}`;
  };

  const hasDuplicateCollegeIssue = (row: BulkPreviewRow) =>
    row.errors.some((error) => error === "Duplicate collegeCode" || error.includes("already exists in the system"));

  const isImportableBulkRow = (row: BulkPreviewRow) => String(row.status || "").trim().toLowerCase() === "valid";
  const isImportableBulkGroup = (group: BulkPreviewRow[]) =>
    group.length > 0 && group.every(isImportableBulkRow);

  const buildBulkCollegeGroups = (rows: BulkPreviewRow[]) => {
    const groups = new Map<string, BulkPreviewRow[]>();

    rows
      .filter((row) => row.sheet === "colleges")
      .forEach((row) => {
        const key = getBulkCollegeGroupKey(row);
        const group = groups.get(key) || [];
        group.push(row);
        groups.set(key, group);
      });

    rows
      .filter((row) => row.sheet !== "colleges")
      .forEach((row) => {
        const key = getBulkCollegeGroupKey(row);
        if (!groups.has(key)) return;
        const group = groups.get(key) || [];
        group.push(row);
        groups.set(key, group);
      });

    return groups;
  };

  const getValidBulkCollegeGroupKeys = (rows: BulkPreviewRow[]) =>
    new Set(
      [...buildBulkCollegeGroups(rows).entries()]
        .filter(([, group]) => isImportableBulkGroup(group))
        .map(([key]) => key),
    );

  const buildBulkValidationSummary = (rows: BulkPreviewRow[]) => {
    const collegeGroups = buildBulkCollegeGroups(rows);
    const groupedRows = [...collegeGroups.values()];
    const hasInvalidRow = (group: BulkPreviewRow[]) => group.some((row) => row.status === "Invalid" && !isImportableBulkRow(row));
    const hasReviewRow = (group: BulkPreviewRow[]) => group.some((row) => row.status === "Review");

    return {
      totalRecords: groupedRows.length,
      validRecords: groupedRows.filter(isImportableBulkGroup).length,
      failedRecords: 0,
      invalidRecords: groupedRows.filter(hasInvalidRow).length,
      duplicates: groupedRows.filter((group) => group.some(hasDuplicateCollegeIssue)).length,
      pendingReview: groupedRows.filter((group) => !hasInvalidRow(group) && hasReviewRow(group)).length,
    };
  };
  const validBulkCollegeGroupKeys = getValidBulkCollegeGroupKeys(previewRows);
  const importableBulkCollegeRows = previewRows.filter(
    (row) => row.sheet === "colleges" && validBulkCollegeGroupKeys.has(getBulkCollegeGroupKey(row)) && isImportableBulkRow(row),
  );
  const importableBulkCollegeCodeSet = new Set(
    importableBulkCollegeRows
      .map((row) => String(row.data.collegeCode || "").trim().toLowerCase())
      .filter(Boolean),
  );
  const importableBulkCourseRowsForExistingColleges = previewRows.filter((row) => {
    if (row.sheet !== "courses" || !isImportableBulkRow(row)) return false;
    const rowCollegeCode = String(row.data.collegeCode || "").trim().toLowerCase();
    return Boolean(rowCollegeCode && existingCollegeCodeSet.has(rowCollegeCode) && !importableBulkCollegeCodeSet.has(rowCollegeCode));
  });
  const importableBulkCollegeCount = importableBulkCollegeRows.length;
  const importableBulkCourseOnlyCollegeCount = new Set(
    importableBulkCourseRowsForExistingColleges
      .map((row) => String(row.data.collegeCode || "").trim().toLowerCase())
      .filter(Boolean),
  ).size;
  const hasImportableBulkCollegeRows = importableBulkCollegeCount > 0;
  const hasImportableBulkRows = hasImportableBulkCollegeRows || importableBulkCourseRowsForExistingColleges.length > 0;
  const bulkImportProgressTotal = bulkImportProgress.total || importableBulkCollegeCount || 0;
  const bulkImportProgressCompleted = Math.min(bulkImportProgress.completed, bulkImportProgressTotal);
  const bulkImportProgressPercent = bulkImportProgressTotal
    ? Math.round((bulkImportProgressCompleted / bulkImportProgressTotal) * 100)
    : 0;

  const validateBulkPreviewRows = (
    rows: Array<Pick<BulkPreviewRow, "id" | "sheet" | "rowNumber" | "data">>,
    zipAssetIndex: ZipAssetIndex | null,
    hasImageZip: boolean,
  ): BulkPreviewRow[] => {
    const colleges = rows.filter((row) => row.sheet === "colleges");
    const courses = rows.filter((row) => row.sheet === "courses");
    const collegeImages = rows.filter((row) => row.sheet === "collegeimages");
    const collegeCodeCounts = colleges.reduce<Record<string, number>>((counts, row) => {
      const code = String(row.data.collegeCode || "").trim().toLowerCase();
      if (code) counts[code] = (counts[code] || 0) + 1;
      return counts;
    }, {});
    const collegeCodes = new Set(Object.keys(collegeCodeCounts));
    const normalizeEntranceCourseMatchText = (value: string) =>
      String(value || "")
        .trim()
        .toLowerCase()
        .replace(/&/g, " and ")
        .replace(/\bm\s*\.?\s*b\s*\.?\s*a\b/g, "mba")
        .replace(/\bm\s*\.?\s*c\s*\.?\s*a\b/g, "mca")
        .replace(/\bb\s*\.?\s*a\b/g, "ba")
        .replace(/\bb\s*\.?\s*sc\b/g, "bsc")
        .replace(/\bb\s*\.?\s*com\b/g, "bcom")
        .replace(/[^a-z0-9]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    const compactEntranceCourseMatchText = (value: string) => normalizeEntranceCourseMatchText(value).replace(/\s+/g, "");
    const getCourseMatchVariants = (courseName: string, specialization = "", degreeType = "") => {
      const values = [
        courseName,
        specialization,
        degreeType,
        [courseName, specialization].filter(Boolean).join(" "),
        [courseName, specialization].filter(Boolean).join(" - "),
      ];

      return values
        .flatMap((value) => {
          const normalized = normalizeEntranceCourseMatchText(value);
          const compact = compactEntranceCourseMatchText(value);
          return [normalized, compact];
        })
        .filter(Boolean);
    };
    const getCourseMatchValuesForCollege = (collegeCode: string) =>
      courses
        .filter((row) => String(row.data.collegeCode || "").trim().toLowerCase() === collegeCode.trim().toLowerCase())
        .flatMap((row) => {
          const courseName = String(row.data.courseName || "").trim();
          const specialization = String(row.data.specialization || "").trim();
          const degreeType = String(row.data.degreeType || "").trim();
          const courseType = String(row.data.courseType || "").trim();
          const courseCategory = String(row.data.courseCategory || row.data.stream || "").trim();
          return getCourseMatchVariants(courseName || courseType, specialization, degreeType)
            .concat(getCourseMatchVariants(courseType, specialization, courseCategory));
        })
        .filter(Boolean);
    const courseNameList = (value: string) =>
      String(value || "")
        .split(/[,|]/)
        .map((item) => item.trim())
        .filter(Boolean);
    const isValidEntranceExamCourseName = (value: string, collegeCode: string) => {
      const names = courseNameList(value);
      if (names.length === 0) return true;
      const sameCollegeCourseNames = getCourseMatchValuesForCollege(collegeCode);
      const sameCollegeCourseNameSet = new Set(sameCollegeCourseNames);

      return names.every((name) => {
        const normalizedName = normalizeEntranceCourseMatchText(name);
        const compactName = compactEntranceCourseMatchText(name);
        if (!normalizedName && !compactName) return true;
        if (sameCollegeCourseNameSet.has(normalizedName) || sameCollegeCourseNameSet.has(compactName)) return true;
        return [...sameCollegeCourseNameSet].some((courseName) => {
          return courseName.includes(normalizedName) || courseName.includes(compactName) || normalizedName.includes(courseName) || compactName.includes(courseName);
        });
      });
    };
    const imageCountByCollege = collegeImages.reduce<Record<string, number>>((counts, row) => {
      const code = String(row.data.collegeCode || "").trim().toLowerCase();
      if (code) counts[code] = (counts[code] || 0) + 1;
      return counts;
    }, {});
    const supportedImageTypes = new Set(["campus", "hostel", "classroom", "laboratory", "library", "sports", "placement", "hospital"]);

    return rows.map((row) => {
      const rowData = row.data || {};
      const cell = (column: string) => String(rowData[column] || "").trim();
      const isFilledCell = (column: string) => Boolean(cell(column));
      const isNumericPreviewCell = (column: string) => {
        const value = cell(column);
        return isBulkEmptyLikeValue(value) || parseLooseNumber(value) !== undefined;
      };
      const isTrueFalsePreviewCell = (column: string) => {
        return isFlexibleBooleanValue(cell(column));
      };

      let errors: string[] = [];
      let reviewErrors: string[] = [];
      const fieldIssues: Record<string, BulkFieldIssue> = {};

      if (row.sheet === "colleges") {
        const required = ["collegeCode", "collegeName", "university", "state", "city", "officialEmail", "phoneNumber"];
        const numeric = ["establishedYear", "minFee", "maxFee", "placementPercentage", "averagePackage", "highestPackage", "hostelMinFee", "hostelMaxFee"];
        const imageMediaNames = ["logoImage", "coverImage"].map((column) => cell(column)).filter(Boolean);
        const localImageMediaNames = imageMediaNames.filter((name) => !isRemoteAssetReference(name));
        const localImageMediaColumns = ["logoImage", "coverImage"].filter((column) => {
          const columnValue = cell(column);
          return columnValue && !isRemoteAssetReference(columnValue);
        });
        const brochureValue = cell("brochurePdf");

        required.forEach((column) => {
          if (!isFilledCell(column)) addFieldIssue(fieldIssues, column, "missing", `${column} is required`);
        });
        numeric.forEach((column) => {
          if (!isNumericPreviewCell(column)) addFieldIssue(fieldIssues, column, "invalid", `${column} must be numeric`);
        });
        if (!isValidYearValue(cell("establishedYear"))) addFieldIssue(fieldIssues, "establishedYear", "invalid", "establishedYear must be a valid year");
        if (!isValidEmailValue(cell("officialEmail"))) addFieldIssue(fieldIssues, "officialEmail", "invalid", "officialEmail must be a valid email address");
        if (!isValidPhoneValue(cell("phoneNumber"))) addFieldIssue(fieldIssues, "phoneNumber", "invalid", "phoneNumber must be a valid phone number");
        if (!isValidPhoneValue(cell("alternatePhone"))) addFieldIssue(fieldIssues, "alternatePhone", "invalid", "alternatePhone must be a valid phone number");
        if (!isValidPincodeValue(cell("pincode"))) addFieldIssue(fieldIssues, "pincode", "invalid", "pincode must be a valid 6 digit code");
        if (!isValidUrlValue(cell("websiteUrl"))) addFieldIssue(fieldIssues, "websiteUrl", "invalid", "websiteUrl must be a valid URL");
        if (!isValidUrlValue(cell("googleMapUrl"))) addFieldIssue(fieldIssues, "googleMapUrl", "invalid", "googleMapUrl must be a valid URL");
        if (!isValidUrlValue(cell("campusVideo"))) addFieldIssue(fieldIssues, "campusVideo", "invalid", "campusVideo must be a valid URL");
        if (!isValidBulkRankingValue(cell("ranking"))) addFieldIssue(fieldIssues, "ranking", "invalid", getBulkRankingValidationMessage(cell("ranking")));
        if (!isValidAccreditationValue(cell("accreditation"))) {
          addFieldIssue(fieldIssues, "accreditation", "invalid", "accreditation must match a valid accreditation option or be left empty");
        }
        if (!isNumberWithinRange(cell("placementPercentage"), 0, 100)) addFieldIssue(fieldIssues, "placementPercentage", "invalid", "placementPercentage must be between 0 and 100");
        if (parseLooseNumber(cell("minFee")) !== undefined && parseLooseNumber(cell("maxFee")) !== undefined && (parseLooseNumber(cell("minFee")) || 0) > (parseLooseNumber(cell("maxFee")) || 0)) {
          addFieldIssue(fieldIssues, "minFee", "invalid", "minFee must be less than or equal to maxFee");
          addFieldIssue(fieldIssues, "maxFee", "invalid", "minFee must be less than or equal to maxFee");
        }
        if (parseLooseNumber(cell("hostelMinFee")) !== undefined && parseLooseNumber(cell("hostelMaxFee")) !== undefined && (parseLooseNumber(cell("hostelMinFee")) || 0) > (parseLooseNumber(cell("hostelMaxFee")) || 0)) {
          addFieldIssue(fieldIssues, "hostelMinFee", "invalid", "hostelMinFee must be less than or equal to hostelMaxFee");
          addFieldIssue(fieldIssues, "hostelMaxFee", "invalid", "hostelMinFee must be less than or equal to hostelMaxFee");
        }
        if (parseLooseNumber(cell("averagePackage")) !== undefined && parseLooseNumber(cell("highestPackage")) !== undefined && (parseLooseNumber(cell("averagePackage")) || 0) > (parseLooseNumber(cell("highestPackage")) || 0)) {
          addFieldIssue(fieldIssues, "averagePackage", "invalid", "averagePackage must be less than or equal to highestPackage");
          addFieldIssue(fieldIssues, "highestPackage", "invalid", "averagePackage must be less than or equal to highestPackage");
        }
        if (!isTrueFalsePreviewCell("cctvAvailability")) addFieldIssue(fieldIssues, "cctvAvailability", "invalid", "cctvAvailability must be TRUE or FALSE");
        if (!isTrueFalsePreviewCell("isBestCollege")) addFieldIssue(fieldIssues, "isBestCollege", "invalid", "isBestCollege must be TRUE or FALSE");
        if (collegeCodeCounts[cell("collegeCode").toLowerCase()] > 1) addFieldIssue(fieldIssues, "collegeCode", "duplicate", "Duplicate collegeCode");
        if (cell("collegeCode") && existingCollegeCodeSet.has(cell("collegeCode").toLowerCase())) {
          addFieldIssue(fieldIssues, "collegeCode", "exists", "collegeCode already exists in the system");
        }
        if (cell("collegeName") && existingCollegeNameSet.has(cell("collegeName").toLowerCase())) {
          addFieldIssue(fieldIssues, "collegeName", "exists", "collegeName already exists in the system");
        }
        const existingCollegeMedia = existingCollegeMediaByCode.get(cell("collegeCode").toLowerCase());
        if (existingCollegeMedia) {
          if (cell("logoImage") && existingCollegeMedia.hasLogo) {
            addFieldIssue(fieldIssues, "logoImage", "exists", "logoImage already exists for this college");
          }
          if (cell("coverImage") && existingCollegeMedia.hasCoverImage) {
            addFieldIssue(fieldIssues, "coverImage", "exists", "coverImage already exists for this college");
          }
          if (cell("brochurePdf") && existingCollegeMedia.hasBrochure) {
            addFieldIssue(fieldIssues, "brochurePdf", "exists", "brochurePdf already exists for this college");
          }
        }
        ["logoImage", "coverImage"]
          .filter((column) => isRemoteAssetReference(cell(column)))
          .forEach((column) => addFieldIssue(fieldIssues, column, "invalid", getZipOnlyAssetError(column)));
        if (hasImageZip) {
          localImageMediaNames.forEach((name, index) => {
            if (!resolveZipAssetRecord(zipAssetIndex, name, cell("collegeCode"))) {
              const column = localImageMediaColumns[index] || "logoImage";
              addFieldIssue(fieldIssues, column, "invalid", `${name} not found in ZIP`);
            }
          });
        } else if (localImageMediaNames.length) {
          if (localImageMediaNames.length) {
            addFieldIssue(fieldIssues, "logoImage", "review", "Upload combined media ZIP to validate logo and cover files");
            addFieldIssue(fieldIssues, "coverImage", "review", "Upload combined media ZIP to validate logo and cover files");
          }
        }
      }

      if (row.sheet === "courses") {
        const numeric = ["allottedSeats", "applicationFee", "semesterFees", "totalFees", ...bulkCutoffColumns];
        ["collegeCode", "courseName", "degreeType", "stream", "specialization", "duration", "mode"].forEach((column) => {
          if (!isFilledCell(column)) addFieldIssue(fieldIssues, column, "missing", `${column} is required`);
        });
        if (isFilledCell("collegeCode") && !collegeCodes.has(cell("collegeCode").toLowerCase())) {
          addFieldIssue(fieldIssues, "collegeCode", "invalid", "collegeCode does not exist in Colleges sheet");
        }
        numeric.forEach((column) => {
          if (!isNumericPreviewCell(column)) addFieldIssue(fieldIssues, column, "invalid", `${column} must be numeric`);
        });
        if (isFilledCell("duration") && !isValidDurationValue(cell("duration"))) addFieldIssue(fieldIssues, "duration", "invalid", "duration must be like 4 Years, 5.5 Years, or 6 Months");
        if (!isStrictIntegerValue(cell("allottedSeats"))) addFieldIssue(fieldIssues, "allottedSeats", "invalid", "allottedSeats must contain digits only");
        validateBulkCutoffRanges(rowData).forEach((message) => {
          const matchedColumns = bulkCutoffColumns.filter((column) => message.includes(displayColumnName(column)) || message.includes(column));
          if (matchedColumns.length) {
            matchedColumns.forEach((column) => addFieldIssue(fieldIssues, column, "invalid", message));
          } else {
            addFieldIssue(fieldIssues, "cutoff_oc", "invalid", message);
          }
        });
        if (!isTrueFalsePreviewCell("lateralEntry")) addFieldIssue(fieldIssues, "lateralEntry", "invalid", "lateralEntry must be TRUE or FALSE");
        if (!isBestCourseValue(cell("bestCourse"))) addFieldIssue(fieldIssues, "bestCourse", "invalid", "bestCourse must be 120 characters or less");
        if (parseLooseNumber(cell("semesterFees")) !== undefined && parseLooseNumber(cell("totalFees")) !== undefined && (parseLooseNumber(cell("semesterFees")) || 0) > (parseLooseNumber(cell("totalFees")) || 0)) {
          addFieldIssue(fieldIssues, "semesterFees", "invalid", "semesterFees must be less than or equal to totalFees");
          addFieldIssue(fieldIssues, "totalFees", "invalid", "semesterFees must be less than or equal to totalFees");
        }
      }

      if (row.sheet === "entranceexams") {
        const numeric = ["examWeightage", ...bulkRangeCutoffColumns];
        ["collegeCode", "courseName", "examName"].forEach((column) => {
          if (!isFilledCell(column)) addFieldIssue(fieldIssues, column, "missing", `${column} is required`);
        });
        if (isFilledCell("collegeCode") && !collegeCodes.has(cell("collegeCode").toLowerCase())) {
          addFieldIssue(fieldIssues, "collegeCode", "invalid", "collegeCode does not exist in Colleges sheet");
        }
        if (isFilledCell("courseName") && !isValidEntranceExamCourseName(cell("courseName"), cell("collegeCode"))) {
          addFieldIssue(fieldIssues, "courseName", "invalid", "courseName must match a Courses sheet row with the same collegeCode");
        }
        numeric.forEach((column) => {
          if (!isNumericPreviewCell(column)) addFieldIssue(fieldIssues, column, "invalid", `${column} must be numeric`);
        });
        validateBulkCutoffRanges(rowData, { allowSingle: false }).forEach((message) => {
          const matchedColumns = bulkRangeCutoffColumns.filter((column) => message.includes(displayColumnName(column)) || message.includes(column));
          if (matchedColumns.length) {
            matchedColumns.forEach((column) => addFieldIssue(fieldIssues, column, "invalid", message));
          } else {
            addFieldIssue(fieldIssues, "cutoff_oc_min", "invalid", message);
          }
        });
        if (!isNumberWithinRange(cell("examWeightage"), 0, 100)) addFieldIssue(fieldIssues, "examWeightage", "invalid", "examWeightage must be between 0 and 100");
      }

      if (row.sheet === "collegeimages") {
        const imageName = cell("imageName");
        const imageType = cell("imageType").toLowerCase();
        const needsZipValidation = imageName && !isRemoteAssetReference(imageName);
        ["collegeCode", "imageType", "imageName"].forEach((column) => {
          if (!isFilledCell(column)) addFieldIssue(fieldIssues, column, "missing", `${column} is required`);
        });
        if (isFilledCell("collegeCode") && !collegeCodes.has(cell("collegeCode").toLowerCase())) {
          addFieldIssue(fieldIssues, "collegeCode", "invalid", "collegeCode does not exist in Colleges sheet");
        }
        if (imageType && !supportedImageTypes.has(imageType)) addFieldIssue(fieldIssues, "imageType", "invalid", "imageType is not supported");
        if (imageCountByCollege[cell("collegeCode").toLowerCase()] > 7) addFieldIssue(fieldIssues, "imageName", "invalid", "Maximum 7 college images allowed");
        const existingCollegeMedia = existingCollegeMediaByCode.get(cell("collegeCode").toLowerCase());
        const normalizedImageName = normalizeZipName(imageName);
        const isExistingCollegeImage =
          Boolean(imageName && existingCollegeMedia) &&
          Boolean(
            existingCollegeMedia?.hasAnyMedia ||
              existingCollegeMedia?.hasGalleryImages ||
              existingCollegeMedia?.imageNames.has(normalizedImageName) ||
              existingCollegeMedia?.mediaNames.has(normalizedImageName),
          );
        if (
          imageName &&
          existingCollegeMedia &&
          isExistingCollegeImage
        ) {
          addFieldIssue(fieldIssues, "imageName", "exists", "imageName already exists for this college");
        }
        if (isRemoteAssetReference(imageName)) addFieldIssue(fieldIssues, "imageName", "invalid", getZipOnlyAssetError("imageName"));
        if (hasImageZip && needsZipValidation && !isExistingCollegeImage && !resolveZipAssetRecord(zipAssetIndex, imageName, cell("collegeCode"))) {
          addFieldIssue(fieldIssues, "imageName", "invalid", `${imageName} not found in ZIP`);
        }
        if (!hasImageZip && needsZipValidation) addFieldIssue(fieldIssues, "imageName", "review", "Upload combined media ZIP to validate this image");
      }

      errors = collectFieldIssues(fieldIssues);
      reviewErrors = Object.values(fieldIssues)
        .filter((issue) => issue.level === "review")
        .flatMap((issue) => issue.messages);

      return {
        ...row,
        status:
          errors.some((message) => !reviewErrors.includes(message))
            ? "Invalid"
            : reviewErrors.length && !Object.keys(fieldIssues).every((column) => ["logoImage", "coverImage"].includes(column))
              ? "Review"
              : "Valid",
        errors,
        fieldIssues,
      };
    });
  };

  const createBulkPreviewRows = (
    sheets: Map<string, Record<string, string>[]>,
    zipAssetIndex: ZipAssetIndex | null,
    hasImageZip: boolean,
    isSingleCollegeUpload: boolean,
  ) => {
    const colleges = isSingleCollegeUpload ? getSheetRows(sheets, "colleges").slice(0, 1) : getSheetRows(sheets, "colleges");
    const courses = isSingleCollegeUpload ? getSheetRows(sheets, "courses").filter((row) => !colleges[0] || cellValue(row, "collegeCode") === cellValue(colleges[0], "collegeCode")) : getSheetRows(sheets, "courses");
    const entranceExams = getSheetRows(sheets, "entranceexams");
    const collegeImages = getSheetRows(sheets, "collegeimages");
    let nextId = 1;
    const makeRow = (sheet: BulkSheetKey, row: Record<string, string>, index: number): Pick<BulkPreviewRow, "id" | "sheet" | "rowNumber" | "data"> => {
      const data = Object.fromEntries(bulkSheetColumns[sheet].map((column) => [column, cellValue(row, column)]));
      if (sheet === "colleges") {
        const rankingValue = cellValue(row, "ranking");
        const rankingMinValue = cellValue(row, "rankingMin");
        const rankingMaxValue = cellValue(row, "rankingMax");
        data.ranking = rankingValue || (rankingMinValue || rankingMaxValue ? `${normalizeRankingInteger(rankingMinValue)}-${normalizeRankingInteger(rankingMaxValue)}` : "");
      }

      return {
        id: nextId++,
        sheet,
        rowNumber: index + 2,
        data,
      };
    };

    return validateBulkPreviewRows(
      [
        ...colleges.map((row, index) => makeRow("colleges", row, index)),
        ...courses.map((row, index) => makeRow("courses", row, index)),
        ...entranceExams.map((row, index) => makeRow("entranceexams", row, index)),
        ...collegeImages.map((row, index) => makeRow("collegeimages", row, index)),
      ],
      zipAssetIndex,
      hasImageZip,
    );
  };

  const summaryRows = [
    { label: "Total Colleges", value: `${validationSummary.totalRecords}`, color: "text-[#143071]", dot: "bg-[#16a34a]", icon: BadgeCheck },
    { label: "Valid Colleges", value: `${importableBulkCollegeCount}`, color: "text-[#16a34a]", dot: "bg-[#16a34a]", icon: BadgeCheck },
    { label: "Failed Colleges", value: `${validationSummary.failedRecords}`, color: "text-[#ef233c]", dot: "bg-[#ef233c]", icon: X },
    { label: "Invalid Colleges", value: `${validationSummary.invalidRecords}`, color: "text-[#ef233c]", dot: "bg-[#ff9f1c]", icon: TriangleAlert },
    { label: "Duplicate Colleges", value: `${validationSummary.duplicates}`, color: "text-[#e8790a]", dot: "bg-[#ff9f1c]", icon: TriangleAlert },
  ];

  const getUploadFileError = (file: File, item: (typeof uploadCards)[number]) => {
    const extension = getFileExtension(file.name);
    if (!item.allowedExtensions.includes(extension)) {
      return item.accept === ".zip" ? "Only .zip image archive files are allowed." : "Only .xlsx or .csv files are allowed.";
    }
    if (item.maxSize && file.size > item.maxSize) {
      return "ZIP file size must be 100MB or less.";
    }
    return "";
  };

  const resetUploadSelection = useCallback((step: "1" | "2" | "3") => {
    setSelectedUploadFiles((previous) => {
      if (step === "3") {
        return { ...previous, "3": null };
      }

      const otherExcelStep = step === "1" ? "2" : "1";
      return { ...previous, [step]: null, [otherExcelStep]: null, "3": null };
    });

    setUploadErrors((previous) => {
      if (step === "3") {
        return { ...previous, "3": "" };
      }

      const otherExcelStep = step === "1" ? "2" : "1";
      return { ...previous, [step]: "", [otherExcelStep]: "", "3": "" };
    });

    if (step !== "3") {
      setActiveUploadStep(step);
      setShowZipUploadStep(false);
    }
    setShowValidationSummaryStep(false);
    setShowFullDetails(false);
    setShowFinishPopup(false);
    setBulkImportFinished(false);
    setBulkImportProgress({ completed: 0, total: 0 });
    setShowBulkLimitPopup(false);
    setShowZipLimitPopup(false);
  }, []);

  const selectUploadFile = (item: (typeof uploadCards)[number], file: File | null) => {
    if (!file) {
      resetUploadSelection(item.step as "1" | "2" | "3");
      return;
    }

    const error = getUploadFileError(file, item);
    if (error) {
      if (item.step === "3") {
        setSelectedUploadFiles((previous) => ({ ...previous, "3": null }));
        setUploadErrors((previous) => ({ ...previous, "3": error }));
        setShowZipUploadStep(true);
        setShowValidationSummaryStep(false);
        setBulkImportFinished(false);
        setShowZipLimitPopup(true);
        setShowBulkLimitPopup(false);
        return;
      }

      const otherExcelStep = item.step === "1" ? "2" : "1";
      setActiveUploadStep(item.step as "1" | "2");
      setShowZipUploadStep(false);
      setShowFullDetails(false);
      setSelectedUploadFiles((previous) => ({ ...previous, [item.step]: null, [otherExcelStep]: null, "3": null }));
      setUploadErrors((previous) => ({ ...previous, [item.step]: error, [otherExcelStep]: "", "3": "" }));
      setShowBulkLimitPopup(false);
      setShowZipLimitPopup(false);
      return;
    }

    if (item.step === "3") {
      setSelectedUploadFiles((previous) => ({ ...previous, "3": file }));
      setUploadErrors((previous) => ({ ...previous, "3": "" }));
      setShowValidationSummaryStep(false);
      setShowFinishPopup(false);
      setShowZipLimitPopup(false);
      return;
    }

    const otherExcelStep = item.step === "1" ? "2" : "1";
    setActiveUploadStep(item.step as "1" | "2");
    setShowZipUploadStep(false);
    setShowValidationSummaryStep(false);
    setShowFullDetails(false);
    setShowFinishPopup(false);
    setBulkImportFinished(false);
    setBulkImportProgress({ completed: 0, total: 0 });
    setShowBulkLimitPopup(false);
    setShowZipLimitPopup(false);
    setSelectedUploadFiles((previous) => ({ ...previous, [item.step]: file, [otherExcelStep]: null, "3": null }));
    setUploadErrors((previous) => ({ ...previous, [item.step]: "", [otherExcelStep]: "", "3": "" }));
  };

  const activeExcelFile = activeUploadStep ? selectedUploadFiles[activeUploadStep] : null;
  const selectedZipFile = selectedUploadFiles["3"];
  const hasZipUploadError = Boolean(uploadErrors["3"]);
  const workflowSteps = [
    "College Data",
    "College Images ZIP",
    "Validation Summary",
    "Review Uploaded Data",
    "Finish",
  ];
  const visibleWorkflowStep = showFullDetails
    ? 3
    : showFinishPopup
      ? 4
      : showValidationSummaryStep && !isBulkCollegeLimitExceeded && !hasZipUploadError
        ? 2
        : showZipUploadStep
          ? 1
          : 0;
  const currentWorkflowStep = visibleWorkflowStep;
  const summaryCardStyles = [
    "border-blue-100 bg-blue-50 text-blue-700",
    "border-green-100 bg-green-50 text-green-700",
    "border-red-100 bg-red-50 text-red-700",
    "border-orange-100 bg-orange-50 text-orange-700",
    "border-purple-100 bg-purple-50 text-purple-700",
    "border-amber-100 bg-amber-50 text-amber-700",
  ];

  const downloadSampleTemplates = () => {
    const escapeXml = (value: string) =>
      String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
    const getExcelColumnName = (index: number) => {
      let value = index + 1;
      let result = "";
      while (value > 0) {
        const remainder = (value - 1) % 26;
        result = String.fromCharCode(65 + remainder) + result;
        value = Math.floor((value - 1) / 26);
      }
      return result;
    };
    const createInlineStringCell = (cellRef: string, value: string) =>
      `<c r="${cellRef}" t="inlineStr"><is><t xml:space="preserve">${escapeXml(value)}</t></is></c>`;
    const createWorksheetXml = (headers: string[], row: Record<string, string | undefined>) => {
      const headerCells = headers
        .map((header, index) => createInlineStringCell(`${getExcelColumnName(index)}1`, header))
        .join("");
      const valueCells = headers
        .map((header, index) => createInlineStringCell(`${getExcelColumnName(index)}2`, String(row[header] || "")))
        .join("");

      return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>
    <row r="1">${headerCells}</row>
    <row r="2">${valueCells}</row>
  </sheetData>
</worksheet>`;
    };

    const workbookSheets = [
      {
        name: "Colleges",
        headers: [
          "collegeCode", "collegeName", "description", "establishedYear", "ownershipType", "university", "country", "state", "city", "district", "address", "pincode", "googleMapUrl", "officialEmail", "phoneNumber", "alternatePhone", "websiteUrl", "logoImage", "coverImage", "brochurePdf", "campusVideo", "ranking_min", "ranking_max", "accreditation", "awards", "reviews", "facilities", "quotas", "minFee", "maxFee", "admissionProcess", "applicationMode", "scholarships", "placementPercentage", "averagePackage", "highestPackage", "hostelGeneralInfo", "hostelType", "hostelMinFee", "hostelMaxFee", "cctvAvailability", "hostelFacilities", "isBestCollege",
        ],
        row: {
          collegeCode: "CLG001",
          collegeName: "ABC Engineering College",
          description: "NAAC accredited engineering college in Chennai",
          establishedYear: "2001",
          ownershipType: "Private",
          university: "Anna University",
          country: "India",
          state: "Tamil Nadu",
          city: "Chennai",
          district: "Chennai",
          address: "123 Sample Road, Guindy",
          pincode: "600001",
          googleMapUrl: "https://maps.google.com/?q=ABC+Engineering+College+Chennai",
          officialEmail: "info@abccollege.edu",
          phoneNumber: "9876543210",
          alternatePhone: "9444455555",
          websiteUrl: "https://abccollege.edu",
          logoImage: "clg001-logo.png",
          coverImage: "clg001-cover.jpg",
          brochurePdf: "clg001-brochure.pdf",
          campusVideo: "https://www.youtube.com/watch?v=college-demo",
          ranking_min: "10",
          ranking_max: "25",
          accreditation: "NAAC A+",
          awards: "Best Emerging Engineering College 2025",
          reviews: "Strong placements and modern campus facilities",
          facilities: "Sports,WiFi,Labs",
          quotas: "Management Quota,Government Quota,Reservation Quota",
          minFee: "50000",
          maxFee: "85000",
          admissionProcess: "Online Application",
          applicationMode: "Online",
          scholarships: "Merit Scholarship",
          placementPercentage: "92",
          averagePackage: "450000",
          highestPackage: "1800000",
          hostelGeneralInfo: "Separate hostel blocks",
          hostelType: "Boys & Girls",
          hostelMinFee: "60000",
          hostelMaxFee: "120000",
          cctvAvailability: "TRUE",
          hostelFacilities: "WiFi,Gym,CCTV",
          isBestCollege: "TRUE",
        },
      },
      {
        name: "Courses",
        headers: [
          "collegeCode", "degreeType", "stream", "specialization", "courseName", "duration", "mode", "lateralEntry", "bestCourse", "minimumQualification", "university", "allottedSeats", "applicationFee", "courseDescription", "semesterFees", "totalFees", "cutoff_oc_min", "cutoff_oc_max", "cutoff_bc_min", "cutoff_bc_max", "cutoff_bcm_min", "cutoff_bcm_max", "cutoff_mbc_min", "cutoff_mbc_max", "cutoff_sc_min", "cutoff_sc_max", "cutoff_sca_min", "cutoff_sca_max", "cutoff_st_min", "cutoff_st_max",
        ],
        row: {
          collegeCode: "CLG001",
          degreeType: "UG",
          stream: "Engineering",
          specialization: "Computer Science Engineering",
          courseName: "Computer Science Engineering",
          duration: "4 Years",
          mode: "Full-time",
          lateralEntry: "TRUE",
          bestCourse: "TRUE",
          minimumQualification: "12th Pass",
          university: "Anna University",
          allottedSeats: "120",
          applicationFee: "500",
          courseDescription: "Industry-aligned computer science program",
          semesterFees: "50000",
          totalFees: "400000",
          cutoff_oc_min: "180",
          cutoff_oc_max: "190",
          cutoff_bc_min: "175",
          cutoff_bc_max: "185",
          cutoff_bcm_min: "172",
          cutoff_bcm_max: "182",
          cutoff_mbc_min: "170",
          cutoff_mbc_max: "180",
          cutoff_sc_min: "160",
          cutoff_sc_max: "170",
          cutoff_sca_min: "155",
          cutoff_sca_max: "165",
          cutoff_st_min: "150",
          cutoff_st_max: "160",
        },
      },
      {
        name: "EntranceExams",
        headers: [
          "collegeCode", "courseName", "examName", "examWeightage", "cutoff_oc_min", "cutoff_oc_max", "cutoff_bc_min", "cutoff_bc_max", "cutoff_bcm_min", "cutoff_bcm_max", "cutoff_mbc_min", "cutoff_mbc_max", "cutoff_sc_min", "cutoff_sc_max", "cutoff_sca_min", "cutoff_sca_max", "cutoff_st_min", "cutoff_st_max", "specifiedSubjects", "preparationNotes",
        ],
        row: {
          collegeCode: "CLG001",
          courseName: "Computer Science Engineering",
          examName: "TNEA",
          examWeightage: "80",
          cutoff_oc_min: "180",
          cutoff_oc_max: "190",
          cutoff_bc_min: "175",
          cutoff_bc_max: "185",
          cutoff_bcm_min: "172",
          cutoff_bcm_max: "182",
          cutoff_mbc_min: "170",
          cutoff_mbc_max: "180",
          cutoff_sc_min: "160",
          cutoff_sc_max: "170",
          cutoff_sca_min: "155",
          cutoff_sca_max: "165",
          cutoff_st_min: "150",
          cutoff_st_max: "160",
          specifiedSubjects: "Physics, Chemistry, Mathematics",
          preparationNotes: "Practice previous year questions",
        },
      },
    ];

    const workbookXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    ${workbookSheets.map((sheet, index) => `<sheet name="${escapeXml(sheet.name)}" sheetId="${index + 1}" r:id="rId${index + 1}"/>`).join("")}
  </sheets>
</workbook>`;
    const workbookRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  ${workbookSheets.map((_, index) => `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${index + 1}.xml"/>`).join("")}
  <Relationship Id="rId${workbookSheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;
    const rootRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;
    const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
  ${workbookSheets.map((_, index) => `<Override PartName="/xl/worksheets/sheet${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join("")}
</Types>`;
    const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="1"><font><sz val="11"/><name val="Calibri"/></font></fonts>
  <fills count="1"><fill><patternFill patternType="none"/></fill></fills>
  <borders count="1"><border/></borders>
  <cellStyleXfs count="1"><xf/></cellStyleXfs>
  <cellXfs count="1"><xf xfId="0"/></cellXfs>
  <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`;

    const zipEntries = {
      "[Content_Types].xml": strToU8(contentTypesXml),
      "_rels/.rels": strToU8(rootRelsXml),
      "xl/workbook.xml": strToU8(workbookXml),
      "xl/_rels/workbook.xml.rels": strToU8(workbookRelsXml),
      "xl/styles.xml": strToU8(stylesXml),
      ...Object.fromEntries(
        workbookSheets.map((sheet, index) => [
          `xl/worksheets/sheet${index + 1}.xml`,
          strToU8(createWorksheetXml(sheet.headers, sheet.row)),
        ]),
      ),
    };

    const workbookBlob = new Blob([zipSync(zipEntries)], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(workbookBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "sample-bulk-upload.xlsx";
    link.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    let isCancelled = false;

    const validateBulkUpload = async () => {
      const bulkExcelFile = selectedUploadFiles["1"];
      const singleExcelFile = selectedUploadFiles["2"];
      const imageZipFile = selectedUploadFiles["3"];
      const excelFile = bulkExcelFile || singleExcelFile;
      const hasBlockingZipUploadError = Boolean(uploadErrors["3"]) && !imageZipFile;

      if (!excelFile) {
        setPreviewRows([]);
        setValidatedZipAssetIndex(null);
        setMediaPreviewUrls((previousUrls) => {
          Object.values(previousUrls).forEach((url) => URL.revokeObjectURL(url));
          return {};
        });
        setValidationSummary(buildBulkValidationSummary([]));
        setValidationStatusText("Upload bulk Excel or single college Excel, then upload one combined image ZIP to validate records.");
        setShowBulkLimitPopup(false);
        if (!hasBlockingZipUploadError) {
          setShowZipLimitPopup(false);
        }
        return;
      }

      setValidationStatusText("Validating uploaded college data...");

      try {
        const sheets = await readWorkbookSheets(excelFile);
        if (!sheets.has("colleges") && sheets.has("college")) sheets.set("colleges", sheets.get("college") || []);
        if (!sheets.has("courses") && sheets.has("course")) sheets.set("courses", sheets.get("course") || []);
        if (!sheets.has("entranceexams") && sheets.has("entranceexam")) sheets.set("entranceexams", sheets.get("entranceexam") || []);
        if (!sheets.has("entranceexams") && sheets.has("enteranceexam")) sheets.set("entranceexams", sheets.get("enteranceexam") || []);
        if (!sheets.has("entranceexams") && sheets.has("enteranceexams")) sheets.set("entranceexams", sheets.get("enteranceexams") || []);
        if (!sheets.has("entranceexams") && sheets.has("enterenceexam")) sheets.set("entranceexams", sheets.get("enterenceexam") || []);
        if (!sheets.has("entranceexams") && sheets.has("enterenceexams")) sheets.set("entranceexams", sheets.get("enterenceexams") || []);
        if (!sheets.has("collegeimages") && sheets.has("collegeimage")) sheets.set("collegeimages", sheets.get("collegeimage") || []);
        if (!sheets.has("colleges") && sheets.size === 1) {
          sheets.set("colleges", [...sheets.values()][0] || []);
        }
        let imageZipAssetIndex: ZipAssetIndex | null = null;
        let imagePreviewUrls: Record<string, string> = {};
        let hasReadableImageZip = Boolean(imageZipFile);
        let zipValidationMessage = "";
        if (imageZipFile) {
          try {
            imageZipAssetIndex = await readZipAssetIndex(imageZipFile);
            imagePreviewUrls = await readZipImagePreviewUrls(imageZipFile);
          } catch (error) {
            hasReadableImageZip = false;
            zipValidationMessage = error instanceof Error ? error.message : "Unable to read ZIP file.";
          }
        }
        const enrichedSheets = enrichSheetsWithZipAssets(sheets, imageZipAssetIndex);
        const nextPreviewRows = createBulkPreviewRows(
          enrichedSheets,
          imageZipAssetIndex,
          hasReadableImageZip,
          Boolean(singleExcelFile && !bulkExcelFile),
        );
        if (isCancelled) return;
        setValidatedZipAssetIndex(imageZipAssetIndex);
        setMediaPreviewUrls((previousUrls) => {
          Object.values(previousUrls).forEach((url) => URL.revokeObjectURL(url));
          return imagePreviewUrls;
        });
        setPreviewRows(nextPreviewRows);
        if (!nextPreviewRows.some((row) => row.sheet === activeDetailSheet)) {
          setActiveDetailSheet(nextPreviewRows[0]?.sheet || "colleges");
        }
        const nextValidationSummary = buildBulkValidationSummary(nextPreviewRows);
        const nextBulkCollegeRowCount = nextPreviewRows.filter((row) => row.sheet === "colleges").length;
        const nextBulkLimitExceeded = nextBulkCollegeRowCount > MAX_BULK_COLLEGE_ROWS;
        setValidationSummary(nextValidationSummary);
        setShowBulkLimitPopup(nextBulkLimitExceeded);
        setShowZipLimitPopup(hasBlockingZipUploadError || Boolean(zipValidationMessage));
        if (nextBulkLimitExceeded) {
          setShowZipUploadStep(false);
          setShowValidationSummaryStep(false);
          if (imageZipFile) {
            setSelectedUploadFiles((previous) => ({ ...previous, "3": null }));
          }
        } else if (zipValidationMessage) {
          setShowZipUploadStep(true);
          setShowValidationSummaryStep(false);
          setUploadErrors((previous) => ({ ...previous, "3": zipValidationMessage }));
        }
        setValidationStatusText(
          nextBulkLimitExceeded
            ? getBulkCollegeLimitMessage()
            : zipValidationMessage
              ? zipValidationMessage
            : hasReadableImageZip
              ? "Excel and combined image ZIP validation completed."
              : "Excel validated. Upload one combined ZIP with logo, cover, and college images to verify media files.",
        );
      } catch (error) {
        if (isCancelled) return;
        setPreviewRows([]);
        setValidatedZipAssetIndex(null);
        setMediaPreviewUrls((previousUrls) => {
          Object.values(previousUrls).forEach((url) => URL.revokeObjectURL(url));
          return {};
        });
        setValidationSummary({
          totalRecords: 0,
          validRecords: 0,
          failedRecords: 1,
          invalidRecords: 0,
          duplicates: 0,
          pendingReview: 0,
        });
        setValidationStatusText(error instanceof Error ? error.message : "Unable to validate uploaded file.");
        setShowBulkLimitPopup(false);
        if (!hasBlockingZipUploadError) {
          setShowZipLimitPopup(false);
        }
      }
    };

    void validateBulkUpload();

    return () => {
      isCancelled = true;
    };
    // The parser helpers are local pure functions; validation should rerun only when selected files change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUploadFiles]);

  useEffect(() => {
    setCurrentDetailPage(1);
  }, [activeDetailSheet, detailSearchText, detailStatusFilter]);

  useEffect(() => {
    if (editingRowId === null || !editingFocusField) return;
    const targetKey = `${editingRowId}-${editingFocusField}`;
    const timer = window.setTimeout(() => {
      const targetField = editingFieldRefs.current[targetKey];
      targetField?.focus();
      targetField?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }, 80);
    return () => window.clearTimeout(timer);
  }, [editingFocusField, editingRowId]);

  const visibleDetailRows = previewRows.filter((row) => row.sheet === activeDetailSheet);
  const normalizedDetailSearch = detailSearchText.trim().toLowerCase();
  const detailRows = visibleDetailRows.filter((row) => {
    const matchesStatus = detailStatusFilter === "all" || row.status === detailStatusFilter;
    const searchableText = [bulkSheetLabels[row.sheet], row.rowNumber, row.status, ...Object.values(row.data)].join(" ").toLowerCase();
    return matchesStatus && (!normalizedDetailSearch || searchableText.includes(normalizedDetailSearch));
  });
  const totalPages = Math.ceil(detailRows.length / itemsPerPage);
  const startIndex = (currentDetailPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDetailRows = detailRows.slice(startIndex, endIndex);
  const activeDetailColumns = [...getBulkPreviewColumns(activeDetailSheet), ...customSheetColumns[activeDetailSheet]];
  const getIssueColumnForPreviewColumn = (column: string) =>
    column === "rankingMin" || column === "rankingMax" ? "ranking" : column;
  const getPreviewColumnWidthClass = (column: string) => {
    if (["facilities", "quotas", "hostelFacilities", "address", "awards", "reviews"].includes(column)) {
      return "w-72 min-w-72";
    }
    if (["googleMapUrl", "websiteUrl", "campusVideo", "brochurePdf", "courseDescription", "description"].includes(column)) {
      return "w-64 min-w-64";
    }
    if (["logoImage", "coverImage", "imageName"].includes(column)) {
      return "w-52 min-w-52";
    }
    return "w-48 min-w-48";
  };
  const errorItems = useMemo(
    () =>
      previewRows.flatMap((row, rowIndex) =>
        row.errors.map((message, messageIndex) => ({
          id: `${row.id}-${rowIndex}-${messageIndex}`,
          rowId: row.id,
          sheet: row.sheet,
          rowNumber: row.rowNumber,
          summary: `${bulkSheetLabels[row.sheet]} row ${row.rowNumber}: ${message}`,
          message,
        })),
      ),
    [previewRows],
  );
  const activeErrors = errorItems.map((item) => item.summary);
  const visibleErrorItems = showAllErrors ? errorItems : errorItems.slice(0, 4);
  const editingRow = editingRowId !== null ? previewRows.find((row) => row.id === editingRowId) || null : null;
  const editingRowIssueEntries = useMemo(() => {
    if (!editingRow) return [];
    const seen = new Set<string>();
    const orderedColumns = [...getBulkPreviewColumns(editingRow.sheet), ...customSheetColumns[editingRow.sheet]];
    return orderedColumns
      .map((column) => {
        const issueColumn = getIssueColumnForPreviewColumn(column);
        if (seen.has(issueColumn)) return null;
        seen.add(issueColumn);
        const issue = editingRow.fieldIssues[issueColumn];
        if (!issue) return null;
        return {
          column,
          issueColumn,
          label: displayColumnName(column),
          level: issue.level,
          messages: issue.messages,
        };
      })
      .filter(Boolean) as Array<{
      column: string;
      issueColumn: string;
      label: string;
      level: BulkFieldIssueLevel;
      messages: string[];
    }>;
  }, [customSheetColumns, editingRow]);

  const refreshValidationSummary = (rows: BulkPreviewRow[]) => {
    setValidationSummary(buildBulkValidationSummary(rows));
  };
  const openPreviewTable = () => {
    setShowFullDetails(true);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        previewDetailsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  };

  const updatePreviewCell = (rowId: number, column: string, value: string) => {
    setPreviewRows((rows) => {
      const editingTargetRow = rows.find((row) => row.id === rowId);
      const previousCollegeCode =
        editingTargetRow?.sheet === "colleges" && column === "collegeCode"
          ? String(editingTargetRow.data.collegeCode || "").trim().toLowerCase()
          : "";

      const updatedRows = rows.map((row) => {
        if (column === "rankingMin" || column === "rankingMax") {
          if (row.id !== rowId) return row;
          const currentRange = getPreviewRankingRangeValues(row.data.ranking || "");
          const nextRange = {
            rankingMin: column === "rankingMin" ? value : currentRange.rankingMin,
            rankingMax: column === "rankingMax" ? value : currentRange.rankingMax,
          };
          const nextRanking = normalizeRankingRangeInput(`${nextRange.rankingMin.trim()}-${nextRange.rankingMax.trim()}`);
          return { ...row, data: { ...row.data, ranking: nextRanking } };
        }
        if (row.id === rowId) {
          return { ...row, data: { ...row.data, [column]: value } };
        }
        if (
          previousCollegeCode &&
          ["courses", "entranceexams", "collegeimages"].includes(row.sheet) &&
          String(row.data.collegeCode || "").trim().toLowerCase() === previousCollegeCode
        ) {
          return { ...row, data: { ...row.data, collegeCode: value } };
        }
        return row;
      });

      const revalidatedRows = validateBulkPreviewRows(
        updatedRows,
        validatedZipAssetIndex,
        Boolean(validatedZipAssetIndex?.byPath.size),
      );
      setValidationSummary(buildBulkValidationSummary(revalidatedRows));
      return revalidatedRows;
    });
  };

  const getFirstIssueColumn = (row: BulkPreviewRow) => {
    const orderedColumns = [...getBulkPreviewColumns(row.sheet), ...customSheetColumns[row.sheet]];
    const firstMatchedColumn = orderedColumns.find((column) => row.fieldIssues[getIssueColumnForPreviewColumn(column)]);
    return firstMatchedColumn || Object.keys(row.fieldIssues)[0] || "";
  };

  const startEditingRow = (row: BulkPreviewRow) => {
    setEditingRowBackup({ ...row, data: { ...row.data }, errors: [...row.errors], fieldIssues: { ...row.fieldIssues } });
    setEditingRowId(row.id);
    setEditingFocusField(getFirstIssueColumn(row));
  };

  const saveEditingRow = () => {
    const nextPreviewRows = validateBulkPreviewRows(
      previewRows,
      validatedZipAssetIndex,
      Boolean(validatedZipAssetIndex?.byPath.size),
    );
    setPreviewRows(nextPreviewRows);
    refreshValidationSummary(nextPreviewRows);
    setEditingRowId(null);
    setEditingFocusField("");
    setEditingRowBackup(null);
    setValidationStatusText("");
  };

  const cancelEditingRow = () => {
    if (editingRowBackup) {
      setPreviewRows((rows) =>
        rows.map((row) => (row.id === editingRowBackup.id ? { ...editingRowBackup, data: { ...editingRowBackup.data }, errors: [...editingRowBackup.errors], fieldIssues: { ...editingRowBackup.fieldIssues } } : row)),
      );
      refreshValidationSummary(previewRows.map((row) => (row.id === editingRowBackup.id ? editingRowBackup : row)));
    }
    setEditingRowId(null);
    setEditingFocusField("");
    setEditingRowBackup(null);
  };

  const startDeleteCellDataMode = (row: BulkPreviewRow) => {
    startEditingRow(row);
    setValidationStatusText("Delete mode enabled. Clear only the cell values you want to remove, then save the row.");
  };

  const openAllCollegeFieldPanel = () => {
    setActiveDetailSheet("colleges");
    setOpenFieldPanel((panel) => (panel === "all" ? null : "all"));
    setCustomFieldForm({
      fieldName: "",
      fieldType: "Number",
      defaultValue: "",
      selectedCollegeRowId: "",
    });
    setFieldErrorText("");
  };

  const openSingleCollegeFieldPanel = () => {
    const firstCollege = previewRows.find((row) => row.sheet === "colleges");
    setActiveDetailSheet("colleges");
    setOpenFieldPanel((panel) => (panel === "single" ? null : "single"));
    setCustomFieldForm({
      fieldName: "",
      fieldType: "Number",
      defaultValue: "",
      selectedCollegeRowId: firstCollege ? String(firstCollege.id) : "",
    });
    setFieldErrorText("");
  };

  const addCustomFieldToTable = () => {
    const fieldName = customFieldForm.fieldName.trim();
    if (!fieldName) {
      setFieldErrorText("Field name is required");
      return;
    }
    const targetSheet: BulkSheetKey = "colleges";
    const existingColumns = [...bulkSheetColumns[targetSheet], ...customSheetColumns[targetSheet]];
    if (existingColumns.some((column) => column.trim().toLowerCase() === fieldName.toLowerCase())) {
      setFieldErrorText(`Field name '${fieldName}' already exists`);
      return;
    }
    if (openFieldPanel === "single" && !customFieldForm.selectedCollegeRowId) {
      setFieldErrorText("Select a college before adding custom field");
      return;
    }

    setCustomSheetColumns((columns) => ({
      ...columns,
      [targetSheet]: [...columns[targetSheet], fieldName],
    }));
    setPreviewRows((rows) =>
      rows.map((row) => {
        if (row.sheet !== targetSheet) return row;
        const shouldApplyValue = openFieldPanel === "all" || String(row.id) === customFieldForm.selectedCollegeRowId;
        return {
          ...row,
          data: {
            ...row.data,
            [fieldName]: shouldApplyValue ? customFieldForm.defaultValue : "",
          },
        };
      }),
    );
    setActiveDetailSheet(targetSheet);
    setOpenFieldPanel(null);
    setFieldErrorText("");
    setValidationStatusText(`${fieldName} field added to ${openFieldPanel === "all" ? "all colleges" : "selected college"}.`);
  };

  const openErrorRow = (rowId: number, sheet: BulkSheetKey) => {
    const targetRows = previewRows.filter((row) => row.sheet === sheet);
    const targetIndex = targetRows.findIndex((row) => row.id === rowId);
    const targetPage = targetIndex >= 0 ? Math.floor(targetIndex / itemsPerPage) + 1 : 1;
    const targetRow = targetRows[targetIndex] || previewRows.find((row) => row.id === rowId) || null;

    setShowFullDetails(true);
    setShowAllErrors(true);
    setActiveDetailSheet(sheet);
    setDetailStatusFilter("all");
    setDetailSearchText("");
    setCurrentDetailPage(targetPage);

    window.setTimeout(() => {
      previewDetailsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      if (targetRow) {
        startEditingRow(targetRow);
      }
    }, 120);
  };

  const importValidData = async () => {
    const notifyImportStatus = (message: string, type: "success" | "error" | "info" = "info") => {
      setValidationStatusText(message);
      showToast(message, type);
    };

    const authToken = readAuthToken();
      if (!authToken) {
      notifyImportStatus("Admin session expired. Please login again.", "error");
      return;
    }

    if (isBulkCollegeLimitExceeded) {
      notifyImportStatus(bulkCollegeLimitMessage, "error");
      setShowBulkLimitPopup(true);
      return;
    }

    if (editingRowId !== null) {
      notifyImportStatus("Finish editing the current row before importing.", "error");
      return;
    }

    if (!hasImportableBulkRows) {
      notifyImportStatus("No valid records are ready for import.", "error");
      return;
    }

    const validCollegeGroupKeys = validBulkCollegeGroupKeys;
    const importableCollegeRows = importableBulkCollegeRows;
    const importableCollegeCodes = new Set(
      importableCollegeRows
        .map((row) => String(row.data.collegeCode || "").trim().toLowerCase())
        .filter(Boolean),
    );
    const validPreviewRows = previewRows.filter((row) => {
      if (row.sheet === "colleges") return importableCollegeRows.some((collegeRow) => collegeRow.id === row.id);
      if (!validCollegeGroupKeys.has(getBulkCollegeGroupKey(row))) return false;
      const rowCollegeCode = String(row.data.collegeCode || "").trim().toLowerCase();
      return rowCollegeCode && importableCollegeCodes.has(rowCollegeCode) && isImportableBulkRow(row);
    }).concat(importableBulkCourseRowsForExistingColleges);
    const backendSheetNames: Record<BulkSheetKey, string> = {
      colleges: "College",
      courses: "Courses",
      entranceexams: "EntranceExams",
      collegeimages: "CollegeImages",
    };
    const validCollegeRows = importableCollegeRows;
    const backendPreviewRows = validPreviewRows.map((row) => ({
      ...row,
      data: enrichBulkImportRowData(row),
      sheet: row.sheet,
      sheetKey: row.sheet,
      sheetName: backendSheetNames[row.sheet] || row.sheet,
      status: "valid",
      statusKey: "valid",
      displayStatus: "Valid",
      isValid: true,
    }));
    const formData = new FormData();
    formData.append("previewRows", JSON.stringify(backendPreviewRows));
    formData.append(
      "collegeRows",
      JSON.stringify(
        validCollegeRows.map((row) => ({
          ...row,
          data: enrichBulkImportRowData(row),
          sheet: "colleges",
          sheetKey: "colleges",
          sheetName: "College",
          status: "valid",
          statusKey: "valid",
          displayStatus: "Valid",
          isValid: true,
        })),
      ),
    );
    const imageZipFile = selectedUploadFiles["3"];
    if (imageZipFile) {
      formData.append("imageZip", imageZipFile);
    }

    const validCollegeCount = validCollegeRows.length + importableBulkCourseOnlyCollegeCount;
    let progressTimer: number | null = null;
    setBulkImportProgress({ completed: 0, total: validCollegeCount });
    setIsImporting(true);
    setValidationStatusText("");

    if (validCollegeCount > 0) {
      progressTimer = window.setInterval(() => {
        setBulkImportProgress((current) => {
          const total = current.total || validCollegeCount;
          const maxBeforeFinish = Math.max(0, total - 1);
          if (current.completed >= maxBeforeFinish) return current;

          const step = total >= 40 ? Math.max(1, Math.ceil(total / 18)) : total >= 12 ? 2 : 1;
          return {
            total,
            completed: Math.min(maxBeforeFinish, current.completed + step),
          };
        });
      }, 420);
    }

    try {
      const data = await request<{
        message?: string;
        summary?: {
          importedColleges?: number;
          collegesCreated?: number;
          collegesUpdated?: number;
          coursesCreated?: number;
          coursesUpdated?: number;
        };
        issues?: Array<{
          sheet?: string;
          rowNumber?: number;
          message?: string;
        }>;
      }>("/api/admin/bulk-import", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: formData,
      });

      const summary = data?.summary || {};
      const backendIssueText = data?.issues?.length
        ? `${data.issues.length} backend issues: ${data.issues
            .slice(0, 2)
            .map((issue) => issue.message)
            .filter(Boolean)
            .join(" | ")}`
        : "";
      const nextStatusText = [
        data?.message || "Bulk import completed.",
        summary.importedColleges ? `${summary.importedColleges} colleges synced` : "",
        summary.coursesCreated || summary.coursesUpdated
          ? `${(summary.coursesCreated || 0) + (summary.coursesUpdated || 0)} courses synced`
          : "",
        backendIssueText,
      ]
        .filter(Boolean)
        .join(" ");

      setValidationStatusText(nextStatusText);
      showToast(nextStatusText, inferToastTypeFromMessage(nextStatusText));
      await onImportComplete?.();

      setShowFullDetails(false);
      setBulkImportProgress({ completed: validCollegeCount, total: validCollegeCount });
      setBulkImportFinished(true);
      setShowFinishPopup(true);
    } catch (error) {
      const rawMessage = error instanceof Error ? error.message : "Bulk import failed.";
      const message =
        rawMessage === "Failed to fetch"
          ? `Bulk import failed. Backend is not reachable at ${API_BASE_URL}.`
          : rawMessage;
      notifyImportStatus(message, "error");
      setBulkImportProgress({ completed: 0, total: validCollegeCount });
    if (/100 colleges/i.test(message)) {
      setShowBulkLimitPopup(true);
    }
    } finally {
      if (progressTimer) window.clearInterval(progressTimer);
      setIsImporting(false);
    }
  };

  const renderUploadCard = (item: (typeof uploadCards)[number]) => {
    const Icon = item.icon;
    const selectedFile = selectedUploadFiles[item.step];
    const uploadError = uploadErrors[item.step];
    const isZipCard = item.step === "3";
    const isManualCard = item.step === "2";
    const isSelectedExcel = !isZipCard && activeUploadStep === item.step;
    const cardClasses = isZipCard
      ? "border border-blue-200 bg-white"
      : isSelectedExcel
        ? "border-2 border-blue-400 bg-blue-50/60 ring-2 ring-blue-100"
        : "border border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/30";
    const fileMetaClasses = selectedFile ? "border-green-100 bg-green-50" : "border-slate-100 bg-slate-50";
    const iconClasses = isZipCard ? "text-blue-600" : isManualCard ? "text-purple-600" : "text-green-600";

    if (isZipCard) {
      return (
        <article className="rounded-2xl border border-blue-100 bg-white p-4 shadow-[0_18px_44px_rgba(15,23,42,0.06)] sm:p-5">
          <div className="flex items-start gap-3">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
              <FileClock className="size-6" />
            </span>
            <div>
              <h3 className="text-base font-black leading-6 text-slate-950">Add College Images ZIP</h3>
              <p className="mt-1 text-sm font-semibold leading-5 text-slate-500">
                ZIP should contain logo, cover, brochure, and college images
              </p>
            </div>
          </div>

          <div
            className="mt-4 flex min-h-40 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-blue-300 bg-gradient-to-br from-blue-50/80 via-white to-blue-50 px-4 py-6 text-center"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              selectUploadFile(item, event.dataTransfer.files?.[0] || null);
            }}
          >
            <FileClock className="size-14 text-blue-600" />
            <p className="mt-3 text-sm font-black text-slate-950">Drag & drop ZIP file here</p>
            <p className="mt-1 text-xs font-semibold text-slate-500">Supported formats: ZIP with images and PDF (Max size: 100MB)</p>
            <label className="mt-4 inline-flex cursor-pointer items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-black text-white shadow-[0_12px_24px_rgba(37,99,235,0.2)] transition hover:bg-blue-700">
              Choose ZIP File
              <input
                type="file"
                accept={item.accept}
                className="hidden"
                onChange={(event) => {
                  selectUploadFile(item, event.target.files?.[0] || null);
                  event.target.value = "";
                }}
              />
            </label>
            {uploadError ? (
              <span className="mt-3 block text-xs font-bold leading-5 text-red-600">{uploadError}</span>
            ) : null}
          </div>

          <div className="mt-4 rounded-2xl bg-blue-50/80 p-4">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                <span className="text-xs font-black">i</span>
              </span>
              <div className="text-xs font-semibold leading-5 text-slate-700">
                <p className="font-black text-blue-700">Important Instructions</p>
                <ul className="mt-1 list-disc space-y-0.5 pl-4">
                  <li>Upload a ZIP file only.</li>
                  <li>ZIP must contain college logo, cover image, brochure PDF, and gallery images.</li>
                  <li>File names must follow the college code.</li>
                  <li>
                    Example: If college code is <span className="rounded-md bg-white px-1.5 py-0.5 font-black">CLG001</span>, then files should be:
                  </li>
                </ul>
                <div className="mt-1 flex flex-wrap items-center gap-2 pl-4">
                  <span className="rounded-md bg-white px-2 py-1 font-black">CLG001.logo</span>
                  <span>and</span>
                  <span className="rounded-md bg-white px-2 py-1 font-black">CLG001.coverimage</span>
                  <span>and</span>
                  <span className="rounded-md bg-white px-2 py-1 font-black">CLG001.brochure.pdf</span>
                </div>
              </div>
            </div>
          </div>

          {selectedFile ? (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="max-w-full truncate rounded-lg bg-white px-4 py-3 text-sm font-black text-slate-950 shadow-sm">
                {selectedFile.name}
              </span>
              <button
                type="button"
                onClick={() => resetUploadSelection("3")}
                className="flex size-10 items-center justify-center rounded-full border border-red-100 bg-white text-red-500 transition hover:bg-red-50 hover:text-red-700"
                aria-label="Remove selected ZIP file"
              >
                <X className="size-5" />
              </button>
            </div>
          ) : null}
        </article>
      );
    }

    return (
      <article
        className={`relative flex h-full flex-col rounded-2xl p-5 shadow-[0_18px_44px_rgba(15,23,42,0.06)] transition ${!isZipCard ? "cursor-pointer" : ""} ${cardClasses}`}
        onClick={() => {
          if (!isZipCard) {
            setActiveUploadStep(item.step as "1" | "2");
          }
        }}
      >
        {!isZipCard && isSelectedExcel ? (
          <span className="absolute right-4 top-4 flex size-6 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm">
            <BadgeCheck className="size-4" />
          </span>
        ) : null}
        <div className="mb-4 flex items-start gap-3 pr-8">
          <span className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${isZipCard ? "bg-blue-100" : isManualCard ? "bg-purple-50" : "bg-green-50"}`}>
            <Icon className={`size-6 ${iconClasses}`} />
          </span>
          <div>
            <h3 className="text-base font-bold leading-snug text-slate-950">{item.title}</h3>
            <span className="mt-1 block text-sm font-medium leading-5 text-slate-500">
              {isZipCard ? "ZIP should contain logo, cover, brochure, and college images" : isManualCard ? "Add college details manually one by one" : "Upload Excel file for multiple colleges"}
            </span>
          </div>
        </div>

        <div
          className={`flex ${isZipCard ? "min-h-52 border-2 border-dashed border-blue-300 bg-gradient-to-br from-blue-50 to-white" : "min-h-36 border border-slate-100 bg-white"} flex-col items-center justify-center rounded-2xl px-4 py-5 text-center transition`}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            selectUploadFile(item, event.dataTransfer.files?.[0] || null);
          }}
        >
          {isZipCard ? <FileClock className="size-14 text-blue-600" /> : null}
          <span className="mt-2 block max-w-xs text-sm font-bold leading-5 text-slate-900">
            {isZipCard ? "Drag & drop ZIP file here" : isManualCard ? "Add college details manually" : "Upload Excel file"}
          </span>
          <span className="mt-1 block text-xs font-semibold leading-4 text-slate-500">
            {isZipCard ? "Supported formats: JPG, PNG, JPEG, PDF brochure. Maximum ZIP size: 100MB." : item.note}
          </span>
          {item.step === "2" ? (
            <button
              type="button"
              onClick={onAddManualCollege}
              className="mt-4 rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-xs font-bold leading-none text-blue-700 shadow-[0_12px_24px_rgba(37,99,235,0.08)] transition hover:bg-blue-50"
            >
              Add Manually
            </button>
          ) : (
            <label className={`mt-4 inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-[0_12px_24px_rgba(37,99,235,0.18)] transition ${isZipCard ? "bg-blue-600 hover:bg-blue-700" : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"}`}>
              {isZipCard ? "Choose ZIP File" : "Upload Excel File"}
              <input
                type="file"
                accept={item.accept}
                className="hidden"
                onChange={(event) => {
                  selectUploadFile(item, event.target.files?.[0] || null);
                  event.target.value = "";
                }}
              />
            </label>
          )}
          {uploadError ? (
            <span className="mt-3 block text-xs font-bold leading-5 text-red-600">{uploadError}</span>
          ) : null}
        </div>

        <div className={`mt-4 grid min-h-14 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border px-3 py-3 ${fileMetaClasses}`}>
          <FileClock className={`size-5 shrink-0 ${iconClasses}`} />
          <span className="min-w-0 overflow-hidden wrap-break-word text-xs font-bold leading-5 text-slate-900 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
            {selectedFile?.name || "No file selected"}
          </span>
          {selectedFile ? (
            <span className="flex shrink-0 items-center gap-2">
              <span className="whitespace-nowrap text-xs font-semibold leading-5 text-slate-500">
                {formatFileSize(selectedFile.size)}
              </span>
              {isZipCard ? (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    resetUploadSelection("3");
                  }}
                  className="flex size-7 shrink-0 items-center justify-center rounded-full border border-red-100 bg-white text-red-500 transition hover:bg-red-50 hover:text-red-700"
                  aria-label="Remove selected ZIP file"
                >
                  <X className="size-4" />
                </button>
              ) : (
                <BadgeCheck className="size-5 shrink-0 text-green-600" />
              )}
            </span>
          ) : null}
        </div>
      </article>
    );
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] rounded-[1.5rem] bg-gradient-to-br from-white via-blue-50/70 to-slate-50 px-4 py-5 text-slate-900 sm:px-6">
      <div className="flex flex-col gap-4 border-b border-blue-100 pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold leading-tight text-slate-950 sm:text-3xl">College Data Upload</h1>
          <p className="mt-1 text-sm font-medium text-slate-500 sm:text-base">
            Upload college data and images in a few simple steps
          </p>
        </div>
        <Link
          href="/admin"
          className="inline-flex w-fit items-center justify-center gap-2 rounded-xl border border-blue-100 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.06)] transition hover:border-blue-200 hover:bg-blue-50"
        >
          <LayoutDashboard className="size-4" />
          Back to Dashboard
        </Link>
      </div>

      <div className="mt-6">
        <main className="min-w-0 space-y-5">
          <section className="rounded-2xl border border-blue-100 bg-white p-4 shadow-[0_18px_46px_rgba(15,23,42,0.06)] sm:p-6">
            <div className="relative hidden items-start justify-between gap-3 md:flex">
              <div className="absolute left-[5%] right-[5%] top-5 h-1 rounded-full bg-slate-100" />
              <div
                className="absolute left-[5%] top-5 h-1 rounded-full bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 transition-all"
                style={{ width: `${Math.max(0, (currentWorkflowStep / Math.max(workflowSteps.length - 1, 1)) * 90)}%` }}
              />
              {workflowSteps.map((step, index) => {
                const completed = index < currentWorkflowStep;
                const active = index === currentWorkflowStep;
                return (
                  <div key={step} className="relative z-10 flex flex-1 flex-col items-center text-center">
                    <span className={`flex size-10 items-center justify-center rounded-full text-sm font-bold shadow-sm ${completed ? "bg-green-600 text-white" : active ? "bg-blue-600 text-white ring-4 ring-blue-100" : "bg-white text-slate-400 ring-1 ring-slate-200"}`}>
                      {completed ? <BadgeCheck className="size-5" /> : index + 1}
                    </span>
                    <span className={`mt-2 text-xs font-bold ${active ? "text-blue-700" : completed ? "text-green-700" : "text-slate-500"}`}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {!showValidationSummaryStep ? (
            <section className="rounded-2xl border border-blue-100 bg-white p-4 shadow-[0_18px_46px_rgba(15,23,42,0.06)] sm:p-6">
              <div className="mb-5">
                <h2 className="text-lg font-bold text-slate-950">
                  {showZipUploadStep ? "Step 2: Add College Images ZIP" : "Step 1: College Data"}
                </h2>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  {showZipUploadStep ? "Upload a ZIP file containing logo, cover, brochure and college images" : "Choose an option to add college data"}
                </p>
              </div>

              {showZipUploadStep ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-white px-4 py-3 shadow-[0_14px_30px_rgba(37,99,235,0.08)]">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                      <span className="text-sm font-black">i</span>
                    </span>
                    <div>
                      <p className="text-sm font-extrabold leading-5 text-slate-950">Please note before uploading ZIP</p>
                      <p className="mt-0.5 text-xs font-semibold leading-5 text-slate-600">
                        Upload only one .zip file up to 100MB. It should contain logo, cover, brochure PDF, and college images for the same Excel upload.
                      </p>
                    </div>
                  </div>
                  {renderUploadCard(uploadCards[2])}
                  <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold leading-6 text-blue-700">
                    {selectedZipFile ? "ZIP file selected. Validation results are updated automatically." : "Excel is ready. Upload one combined ZIP with logo, cover, brochure, and college images."}
                  </div>
                  <div className="rounded-2xl border border-blue-200 bg-white px-4 py-3 text-sm font-semibold leading-6 text-blue-800 shadow-[0_10px_24px_rgba(37,99,235,0.06)]">
                    The media ZIP is validated against the same bulk upload, so keep the logo, cover, brochure, and image files aligned with the 100-college Excel limit.
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="rounded-2xl border border-green-100 bg-gradient-to-r from-green-50 to-blue-50 p-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-3">
                        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-green-100 text-green-700">
                          <Download className="size-5" />
                        </span>
                        <div>
                          <h3 className="text-sm font-bold text-slate-950">Download Sample Excel</h3>
                          <p className="mt-1 text-sm font-medium text-slate-500">Download sample Excel file with the correct format.</p>
                          <p className="mt-1 text-xs font-semibold text-green-700">Use this format to avoid validation errors</p>
                          <p className="mt-2 text-[11px] font-semibold leading-5 text-slate-600">
                            Brochure example: <span className="font-black text-slate-900">CLG001.brochure.pdf</span>
                          </p>
                          <p className="text-[11px] font-semibold leading-5 text-slate-600">
                            Matching ZIP examples: <span className="font-black text-slate-900">CLG001.logo.png</span>, <span className="font-black text-slate-900">CLG001.cover.png</span>, <span className="font-black text-slate-900">CLG001.brochure.pdf</span>
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={downloadSampleTemplates}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-green-200 bg-white px-4 py-2.5 text-xs font-bold text-green-700 shadow-sm transition hover:bg-green-50"
                      >
                        <Download className="size-4" />
                        Download Sample
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-white px-4 py-3 shadow-[0_14px_30px_rgba(37,99,235,0.08)]">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                      <span className="text-sm font-black">i</span>
                    </span>
                    <div>
                      <p className="text-sm font-extrabold leading-5 text-slate-950">Please note before uploading</p>
                      <p className="mt-0.5 text-xs font-semibold leading-5 text-slate-600">
                        You can upload up to {MAX_BULK_COLLEGE_ROWS} colleges at a time. If your file contains more than {MAX_BULK_COLLEGE_ROWS} colleges, please split the data into multiple files and upload them separately.
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-4 lg:grid-cols-2">
                    {renderUploadCard(uploadCards[0])}
                    {renderUploadCard(uploadCards[1])}
                  </div>
                </div>
              )}

              <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-blue-50 pt-5">
                {showZipUploadStep ? (
                  <button
                    type="button"
                    onClick={() => {
                      setShowZipUploadStep(false);
                      setShowValidationSummaryStep(false);
                    }}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    Back
                  </button>
                ) : null}
                {!showZipUploadStep ? (
                  activeExcelFile && activeUploadStep ? (
                    <button
                      type="button"
                      onClick={() => resetUploadSelection(activeUploadStep)}
                      className="rounded-xl border border-red-100 px-5 py-2.5 text-xs font-bold text-red-600 transition hover:bg-red-50"
                    >
                      Cancel
                    </button>
                  ) : null
                ) : null}
                {!showZipUploadStep ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (isBulkCollegeLimitExceeded) {
                        setShowBulkLimitPopup(true);
                        setShowZipUploadStep(false);
                        setShowValidationSummaryStep(false);
                        return;
                      }
                      setShowZipUploadStep(true);
                      setShowValidationSummaryStep(false);
                    }}
                    disabled={!activeExcelFile}
                    className={`rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-[0_12px_24px_rgba(79,70,229,0.22)] transition disabled:cursor-not-allowed disabled:shadow-none ${
                      isBulkCollegeLimitExceeded
                        ? "bg-rose-600 hover:bg-rose-700"
                        : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-purple-300 disabled:to-blue-300"
                    }`}
                  >
                    Next
                  </button>
                ) : null}
                {showZipUploadStep ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (hasZipUploadError) {
                        setShowZipLimitPopup(true);
                        setShowValidationSummaryStep(false);
                        return;
                      }
                      setShowValidationSummaryStep(true);
                    }}
                    className={`rounded-xl border px-5 py-2.5 text-xs font-bold transition ${
                      hasZipUploadError
                        ? "border-rose-100 bg-white text-rose-700 hover:bg-rose-50"
                        : "border-blue-100 bg-white text-blue-700 hover:bg-blue-50"
                    }`}
                  >
                    Skip
                  </button>
                ) : null}
                {showZipUploadStep ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (hasZipUploadError) {
                        setShowZipLimitPopup(true);
                        setShowValidationSummaryStep(false);
                        return;
                      }
                      setShowValidationSummaryStep(true);
                    }}
                    disabled={!selectedZipFile || hasZipUploadError}
                    className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-2.5 text-xs font-bold text-white shadow-[0_12px_24px_rgba(79,70,229,0.22)] transition hover:from-blue-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:from-purple-300 disabled:to-blue-300 disabled:shadow-none"
                  >
                    Next
                  </button>
                ) : null}
              </div>
            </section>
          ) : null}

          {showValidationSummaryStep && !isBulkCollegeLimitExceeded && !hasZipUploadError ? (
            <section className="rounded-2xl border border-blue-100 bg-white p-4 shadow-[0_18px_46px_rgba(15,23,42,0.06)] sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-950">Step 3: Validation Summary</h2>
                  <p className="mt-1 max-w-3xl text-sm font-medium leading-6 text-slate-500">
                    Excel validated. Upload one combined ZIP with logo, cover, brochure, and college images to verify media files.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openPreviewTable}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-2.5 text-xs font-bold text-white shadow-[0_12px_24px_rgba(79,70,229,0.22)] transition hover:from-blue-700 hover:to-purple-700"
                >
                  Preview Data
                  <ExternalLink className="size-4" />
                </button>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
                {summaryRows.map((row, index) => (
                  <div key={row.label} className={`rounded-2xl border p-4 ${summaryCardStyles[index] || summaryCardStyles[0]}`}>
                    <span className="text-xs font-bold">{row.label}</span>
                    <strong className="mt-2 block text-2xl font-black">{row.value}</strong>
                  </div>
                ))}
              </div>
              {validationStatusText ? (
                <div
                  className={`mt-5 rounded-2xl px-4 py-3 text-sm font-bold leading-6 ${
                    isBulkCollegeLimitExceeded
                      ? "border border-rose-200 bg-rose-50 text-rose-800"
                      : "border border-blue-100 bg-blue-50 text-blue-800"
                  }`}
                >
                  {validationStatusText}
                </div>
              ) : null}
              <div className="mt-5 flex border-t border-blue-50 pt-5">
                <button
                  type="button"
                  onClick={() => {
                    setShowValidationSummaryStep(false);
                    setShowZipUploadStep(true);
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  Back
                </button>
              </div>
            </section>
          ) : null}
        </main>

        {false ? (
        <aside className="space-y-4 xl:sticky xl:top-4 xl:self-start">
          <section className="rounded-2xl border border-blue-100 bg-white p-5 shadow-[0_18px_46px_rgba(15,23,42,0.06)]">
            <h2 className="text-base font-bold text-slate-950">Upload Progress</h2>
            <div className="mt-4 space-y-1">
              {workflowSteps.map((step, index) => {
                const completed = index < currentWorkflowStep;
                const active = index === currentWorkflowStep;
                return (
                  <div key={step} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span className={`flex size-7 items-center justify-center rounded-full text-xs font-bold ${completed ? "bg-green-600 text-white" : active ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"}`}>
                        {completed ? <BadgeCheck className="size-4" /> : index + 1}
                      </span>
                      {index < workflowSteps.length - 1 ? <span className="h-8 w-px bg-slate-200" /> : null}
                    </div>
                    <div className="pb-3">
                      <p className={`text-sm font-bold ${active ? "text-slate-950" : "text-slate-600"}`}>{step}</p>
                      <p className="mt-0.5 text-xs font-medium text-slate-400">{completed ? "Completed" : active ? "In progress" : "Pending"}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-blue-100 bg-white p-5 shadow-[0_18px_46px_rgba(15,23,42,0.06)]">
            <h2 className="text-base font-bold text-slate-950">Summary</h2>
            <div className="mt-4 space-y-2">
              {summaryRows.map((row) => (
                <div key={row.label} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                  <span className="text-xs font-bold text-slate-600">{row.label}</span>
                  <span className={`text-sm font-black ${row.color}`}>{row.value}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-blue-100 bg-white p-5 shadow-[0_18px_46px_rgba(15,23,42,0.06)]">
            <h2 className="text-base font-bold text-slate-950">Guidelines</h2>
            <div className="mt-4 space-y-2 text-sm font-medium text-slate-600">
              {["Excel format: .xlsx, .xls", "ZIP format: .zip", "Image formats: JPG, PNG, JPEG", "Brochure format: PDF", "Max ZIP size: 100MB", "ZIP should contain logo, cover, brochure & images", "File names should not contain special characters"].map((guide) => (
                <div key={guide} className="flex gap-2">
                  <BadgeCheck className="mt-0.5 size-4 shrink-0 text-blue-600" />
                  <span>{guide}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-green-100 bg-green-50 p-5 shadow-[0_18px_46px_rgba(15,23,42,0.06)]">
            <div className="flex items-start gap-3">
              <Download className="mt-1 size-5 text-green-700" />
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-green-900">Need Help?</h3>
                <p className="mt-1 text-xs font-semibold leading-5 text-green-800">Download sample files and view format guidelines.</p>
                <button type="button" onClick={downloadSampleTemplates} className="mt-4 w-full rounded-xl border border-green-200 bg-white px-4 py-2.5 text-xs font-bold text-green-700 transition hover:bg-green-50">
                  Download Sample Files
                </button>
              </div>
            </div>
          </section>
        </aside>
        ) : null}
      </div>

      {showFullDetails ? (
        <section ref={previewDetailsRef} className="mt-5 rounded-lg border border-[#dbe6f8] bg-white shadow-[0_12px_30px_rgba(25,61,137,0.08)]">
          <div className="flex flex-col gap-3 border-b border-[#e7eefb] p-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={openAllCollegeFieldPanel}
                className="inline-flex items-center gap-2 rounded-md bg-[#4f32f6] px-4 py-2 text-xs font-extrabold text-white shadow-[0_8px_18px_rgba(79,50,246,0.2)]"
              >
                <Plus className="size-4" />
                Add New Field (All Colleges)
              </button>
              <button
                type="button"
                onClick={openSingleCollegeFieldPanel}
                className="inline-flex items-center gap-2 rounded-md border border-[#cbc8ff] bg-white px-4 py-2 text-xs font-extrabold text-[#4f32f6]"
              >
                <Plus className="size-4" />
                Add Custom Field (Single College)
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex h-10 min-w-55 items-center gap-2 rounded-md border border-[#dbe6f8] bg-white px-3 text-xs font-bold text-[#4965aa]">
                <Search className="size-4" />
                <input
                  className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-[#8a9bc6]"
                  placeholder="Search college..."
                  value={detailSearchText}
                  onChange={(event) => setDetailSearchText(event.target.value)}
                />
              </label>
              <button
                type="button"
                onClick={() => setShowFilters((value) => !value)}
                className={`inline-flex h-10 items-center gap-2 rounded-md border px-3 text-xs font-extrabold ${showFilters || detailStatusFilter !== "all" ? "border-[#4f32f6] bg-[#f4f2ff] text-[#4f32f6]" : "border-[#dbe6f8] bg-white text-[#10235d]"}`}
              >
                <Filter className="size-4" />
                Filters
              </button>
            </div>
          </div>

          {showFilters ? (
            <div className="flex flex-wrap items-center gap-2 border-b border-[#e7eefb] bg-[#fbfcff] px-3 py-3">
              {(["all", "Valid", "Invalid", "Review"] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setDetailStatusFilter(status)}
                  className={`rounded-md px-3 py-2 text-xs font-extrabold ${detailStatusFilter === status ? "bg-[#4f32f6] text-white" : "border border-[#dbe6f8] bg-white text-[#31509c]"}`}
                >
                  {status === "all" ? "All Status" : status}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setDetailSearchText("");
                  setDetailStatusFilter("all");
                }}
                className="rounded-md border border-[#dbe6f8] bg-white px-3 py-2 text-xs font-extrabold text-[#ef233c]"
              >
                Clear
              </button>
            </div>
          ) : null}

          <div className="sticky top-0 z-10 border-b border-[#e7eefb] bg-white">
            <div className="flex flex-wrap gap-2 px-3 py-2">
              {(Object.keys(bulkSheetLabels) as BulkSheetKey[]).map((sheet) => {
                const count = previewRows.filter((row) => row.sheet === sheet).length;
                return (
                  <button
                    key={sheet}
                    type="button"
                    onClick={() => {
                      setActiveDetailSheet(sheet);
                      setCurrentDetailPage(1);
                    }}
                    className={`rounded-md px-3 py-2 text-xs font-extrabold ${activeDetailSheet === sheet ? "bg-[#4f32f6] text-white" : "border border-[#dbe6f8] bg-white text-[#31509c]"}`}
                  >
                    {bulkSheetLabels[sheet]} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          <div className="responsive-data-table max-h-[58vh] max-w-full overflow-auto rounded-[1.1rem] border border-[#e7eefb] bg-white pb-2 [scrollbar-color:#31509c_#dbe6f8] [scrollbar-width:thin] [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#31509c] [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-[#dbe6f8]">
            <table className="min-w-max border-separate border-spacing-0 text-left text-xs">
              <thead className="bg-[#f3f5ff] text-[#10235d]">
                <tr>
                  {["S.No", ...activeDetailColumns, "Status", "Actions"].map((heading) => {
                    const isStatusColumn = heading === "Status";
                    const isActionsColumn = heading === "Actions";
                    const isSerialColumn = heading === "S.No";
                    const columnWidthClass = isSerialColumn
                      ? "w-16 min-w-16"
                      : isStatusColumn
                        ? "w-28 min-w-28 bg-[#f3f5ff] md:sticky md:right-20 md:z-20"
                        : isActionsColumn
                          ? "w-24 min-w-24 bg-[#f3f5ff] md:sticky md:right-0 md:z-20"
                          : getPreviewColumnWidthClass(heading);
                    return (
                      <th
                        key={heading || "select"}
                        className={`border-b border-r border-[#e7eefb] px-3 py-3 align-top font-extrabold whitespace-nowrap ${columnWidthClass}`}
                      >
                        {displayColumnName(heading)}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf2fb] border-b-2 border-[#e7eefb]">
                {paginatedDetailRows.length ? paginatedDetailRows.map((row) => (
                  <tr key={row.id} className="bg-white text-[#10235d]">
                    <td className="w-16 border-r border-[#edf2fb] px-3 py-3 align-top font-extrabold">{row.id}</td>
                    {activeDetailColumns.map((column) => {
                      const rankingRange = getPreviewRankingRangeValues(row.data.ranking || "");
                      const value =
                        column === "rankingMin"
                          ? rankingRange.rankingMin
                          : column === "rankingMax"
                            ? rankingRange.rankingMax
                            : row.data[column] || "";
                      const isImagePreviewColumn = ["logoImage", "coverImage", "imageName"].includes(column);
                      const previewAsset = value
                        ? resolveZipAssetRecord(
                            validatedZipAssetIndex,
                            value,
                            row.data.collegeCode || "",
                            column === "brochurePdf" ? { preferBrochure: true } : {},
                          )
                        : null;
                      const previewUrl = previewAsset ? mediaPreviewUrls[previewAsset.normalizedPath] : "";
                      const isBooleanColumn = ["cctvAvailability", "isBestCollege", "lateralEntry", "bestCourse"].includes(column);
                      const isEditing = editingRowId === row.id;
                      const issueColumn = column === "rankingMin" || column === "rankingMax" ? "ranking" : column;
                      const fieldIssue = row.fieldIssues[issueColumn];
                      const fieldIssueMessage = fieldIssue?.messages.join(" | ") || "";
                      const editingFieldKey = `${row.id}-${column}`;
                      const issueLabel =
                        fieldIssue?.level === "missing"
                          ? "Missing"
                          : fieldIssue?.level === "invalid"
                            ? "Invalid"
                            : fieldIssue?.level === "duplicate"
                              ? "Duplicate"
                              : fieldIssue?.level === "exists"
                                ? "Already Exists"
                              : fieldIssue?.level === "review"
                                ? ["logoImage", "coverImage"].includes(column)
                                  ? "Missing"
                                  : "Review"
                                : "";
                      const issueClassName =
                        fieldIssue?.level === "missing"
                          ? "bg-[#fff4e5] text-[#b45309]"
                          : fieldIssue?.level === "invalid"
                            ? "bg-[#ffe9e9] text-[#ef233c]"
                            : fieldIssue?.level === "duplicate" || fieldIssue?.level === "exists"
                              ? "bg-[#fff1f1] text-[#c81e1e]"
                              : "bg-[#fff7e6] text-[#e8790a]";
                      const displayValue = formatPreviewCellValue(value, column);
                      const isAssetValueColumn = isImagePreviewColumn || column === "brochurePdf";
                      return (
                        <td key={`${row.id}-${column}`} className={`${getPreviewColumnWidthClass(column)} border-r border-[#edf2fb] px-3 py-3 align-top font-bold`}>
                          {isEditing ? (
                            <div className="min-w-30 space-y-2">
                              {isBooleanColumn ? (
                                <label className={`inline-flex items-center gap-2 rounded-md border px-2 py-1.5 ${fieldIssue ? "border-[#ef233c] bg-[#fff5f5]" : "border-[#cbd7ee] bg-white"}`}>
                                  <input
                                    ref={(node) => {
                                      editingFieldRefs.current[editingFieldKey] = node;
                                    }}
                                    type="checkbox"
                                    checked={isCheckedPreviewBoolean(value)}
                                    onChange={(event) => updatePreviewCell(row.id, column, event.target.checked ? "TRUE" : "FALSE")}
                                    className="size-4 accent-[#4f32f6]"
                                    aria-invalid={Boolean(fieldIssue)}
                                  />
                                  <span className={`text-[11px] font-extrabold ${fieldIssue ? "text-[#ef233c]" : "text-[#31509c]"}`}>
                                    {isCheckedPreviewBoolean(value) ? "TRUE" : "FALSE"}
                                  </span>
                                </label>
                              ) : (
                                <input
                                  ref={(node) => {
                                    editingFieldRefs.current[editingFieldKey] = node;
                                  }}
                                  value={value}
                                  onChange={(event) => updatePreviewCell(row.id, column, event.target.value)}
                                  aria-invalid={Boolean(fieldIssue)}
                                  className={`min-w-30 rounded-sm border px-2 py-1 text-xs font-bold outline-none ${
                                    fieldIssue
                                      ? "border-[#ef233c] bg-[#fff5f5] text-[#b42318] focus:border-[#ef233c]"
                                      : "border-[#cbd7ee] bg-white text-[#10235d] focus:border-[#4f32f6]"
                                  }`}
                                />
                              )}
                              {fieldIssue ? (
                                <div className="space-y-1">
                                  <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] ${issueClassName}`}>
                                    {issueLabel}
                                  </span>
                                  <p className="text-[11px] font-semibold leading-4 text-[#b42318]" title={fieldIssueMessage}>
                                    {fieldIssueMessage}
                                  </p>
                                </div>
                              ) : null}
                            </div>
                          ) : isBooleanColumn ? (
                            <input type="checkbox" checked={isCheckedPreviewBoolean(value)} readOnly className="size-4 accent-[#4f32f6]" />
                          ) : isAssetValueColumn ? (
                            <div className="space-y-2">
                              <span
                                className={`block min-w-0 whitespace-normal break-all leading-5 ${fieldIssue ? "text-[#10235d]" : ""}`}
                                title={displayValue}
                              >
                                {displayValue === "-"
                                  ? fieldIssue?.level === "missing"
                                    ? "Missing"
                                    : "-"
                                  : displayValue}
                              </span>
                              {previewUrl && isImagePreviewColumn ? (
                                <span className="flex min-w-24 items-center gap-2">
                                  {/* Blob URLs from uploaded ZIP files cannot be optimized by next/image. */}
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={previewUrl}
                                    alt={value}
                                    className="h-12 w-20 rounded-md border border-[#dbe6f8] object-cover"
                                  />
                                </span>
                              ) : null}
                              {column === "brochurePdf" && isRemoteAssetReference(value) ? (
                                <a
                                  href={value}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white"
                                >
                                  Open File
                                  <ExternalLink className="size-3" />
                                </a>
                              ) : null}
                              {fieldIssue ? (
                                <span
                                  className={`inline-flex whitespace-nowrap rounded-full px-2 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] ${issueClassName}`}
                                  title={fieldIssue.messages.join(" | ")}
                                >
                                  {issueLabel}
                                </span>
                              ) : null}
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <span
                                className={`block min-w-0 whitespace-normal break-normal leading-5 [overflow-wrap:normal] ${fieldIssue ? "text-[#10235d]" : ""}`}
                                title={formatPreviewCellValue(value, column)}
                              >
                                {formatPreviewCellValue(value, column) === "-"
                                  ? fieldIssue?.level === "missing"
                                    ? "Missing"
                                    : "-"
                                  : formatPreviewCellValue(value, column)}
                              </span>
                              {fieldIssue ? (
                                <span
                                  className={`inline-flex whitespace-nowrap rounded-full px-2 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] ${issueClassName}`}
                                  title={fieldIssue.messages.join(" | ")}
                                >
                                  {issueLabel}
                                </span>
                              ) : null}
                            </div>
                          )}
                        </td>
                      );
                    })}
                    <td className="w-28 min-w-28 border-r border-[#edf2fb] bg-white px-3 py-3 align-top md:sticky md:right-20 md:z-20">
                      <span
                        className={`inline-flex min-w-20 justify-center whitespace-nowrap rounded-sm px-2 py-1 text-[11px] font-extrabold ${getBulkPreviewStatusClassName(row)}`}
                      >
                        {getBulkPreviewStatusLabel(row)}
                      </span>
                    </td>
                    <td className="w-24 min-w-24 bg-white px-3 py-3 align-top md:sticky md:right-0 md:z-20">
                      <div className="flex items-center justify-center gap-3">
                        {editingRowId === row.id ? (
                          <>
                            <button type="button" className="text-[#16a34a]" aria-label="Save row changes" onClick={saveEditingRow}>
                              <BadgeCheck className="size-4" />
                            </button>
                            <button type="button" className="text-[#ef233c]" aria-label="Cancel row changes" onClick={cancelEditingRow}>
                              <X className="size-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button type="button" className="text-[#31509c]" aria-label="Edit row" onClick={() => startEditingRow(row)}>
                              <PencilLine className="size-4" />
                            </button>
                            <button type="button" className="text-[#ef233c]" aria-label="Delete selected cell data" onClick={() => startDeleteCellDataMode(row)}>
                              <Trash2 className="size-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={activeDetailColumns.length + 3} className="px-4 py-10 text-center text-sm font-bold text-[#4965aa]">
                      {previewRows.length ? "No records match the current search or filter." : "Upload bulk Excel data to show records in this table."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {detailRows.length > 0 && (
            <div className="flex flex-col gap-3 border-t border-[#e7eefb] bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs font-bold text-[#10235d]">
                Showing {startIndex + 1} to {Math.min(endIndex, detailRows.length)} of {detailRows.length} records
              </div>
              <div className="flex max-w-full items-center gap-1 overflow-x-auto pb-1 sm:gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentDetailPage(Math.max(1, currentDetailPage - 1))}
                  disabled={currentDetailPage === 1}
                  className="inline-flex h-9 items-center justify-center rounded-full border border-[#dbe6f8] bg-white px-3 text-xs font-extrabold text-[#31509c] transition hover:bg-[#f3f5ff] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Prev
                </button>
                {(() => {
                  const visiblePages = new Set<number>([1, totalPages, currentDetailPage - 1, currentDetailPage, currentDetailPage + 1]);
                  const pages = Array.from(visiblePages)
                    .filter((page) => page >= 1 && page <= totalPages)
                    .sort((left, right) => left - right);
                  return pages.map((page, index) => {
                    const previousPage = pages[index - 1];
                    const needsGap = previousPage && page - previousPage > 1;
                    return (
                      <div key={page} className="flex items-center gap-1">
                        {needsGap ? <span className="px-1 text-sm font-black text-[#7a8ab3]">...</span> : null}
                        <button
                          type="button"
                          onClick={() => setCurrentDetailPage(page)}
                          className={`inline-flex h-9 min-w-9 items-center justify-center rounded-full border px-3 text-xs font-extrabold transition ${
                            currentDetailPage === page
                              ? "border-[#4f32f6] bg-[#4f32f6] text-white shadow-[0_10px_18px_rgba(79,50,246,0.18)]"
                              : "border-[#dbe6f8] bg-white text-[#31509c] hover:bg-[#f3f5ff]"
                          }`}
                        >
                          {page}
                        </button>
                      </div>
                    );
                  });
                })()}
                <button
                  type="button"
                  onClick={() => setCurrentDetailPage(Math.min(totalPages, currentDetailPage + 1))}
                  disabled={currentDetailPage === totalPages}
                  className="inline-flex h-9 items-center justify-center rounded-full border border-[#dbe6f8] bg-white px-3 text-xs font-extrabold text-[#31509c] transition hover:bg-[#f3f5ff] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}

      

{false ? (
<div className="border-t border-[#e7eefb] bg-white p-3">
  <div className="overflow-hidden rounded-2xl border border-[#f4b7b7] bg-linear-to-br from-[#fff5f5] to-white shadow-sm">

  
    <div className="flex flex-col gap-3 border-b border-[#f3dede] px-4 py-4 lg:flex-row lg:items-center lg:justify-between">

      <div className="flex items-center gap-3">

      
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ffe3e3]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-[#e11d2e]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v4m0 4h.01M10.29 3.86l-8 14A1 1 0 003.14 19h17.72a1 1 0 00.85-1.5l-8-14a1 1 0 00-1.72 0z"
            />
          </svg>
        </div>

        
        <div>
          <h2 className="text-xl font-extrabold text-[#a11220]">
            Errors ({activeErrors.length})
          </h2>

          <p className="mt-1 text-sm font-medium text-[#5b6678]">
            {activeErrors.length} issues found while processing your file
          </p>
        </div>
      </div>

 
      <div className="rounded-full border border-[#f2b7b7] bg-[#fff5f5] px-4 py-2 text-sm font-bold text-[#d11a2a] shadow-sm">
        ⚠ {activeErrors.length} Errors
      </div>
    </div>


    <div className="space-y-3 px-4 py-4">

      {(showAllErrors ? activeErrors : activeErrors.slice(0, 4)).map(
        (error, index) => (
          <div
            key={`${index}-${error}`}
            className="flex items-center justify-between rounded-xl border border-[#ececec] bg-white px-4 py-3 shadow-sm"
          >
            <div className="flex items-center gap-3">

             
              <div className="h-3 w-3 rounded-full bg-[#ef233c]" />

           
              <p className="text-sm font-semibold text-[#a11220]">
                {error}
              </p>
            </div>

           
            <div className="rounded-lg bg-[#fff1f1] px-3 py-1 text-xs font-bold text-[#d11a2a]">
              Error
            </div>
          </div>
        )
      )}
    </div>

  
    <div className="flex flex-col gap-3 border-t border-[#e6e6e6] px-4 py-4 lg:flex-row lg:items-center lg:justify-between">

      <p className="text-sm font-medium text-[#6b7280]">
        Please fix the above errors and try uploading again.
      </p>

      <div className="flex items-center gap-3">

    
        <div className="rounded-lg bg-[#fff1f1] px-4 py-2 text-sm font-bold text-[#d11a2a]">
          Total Errors: {activeErrors.length}
        </div>

    
        {activeErrors.length > 4 && (
          <button
            type="button"
            onClick={() => setShowAllErrors(!showAllErrors)}
            className="rounded-lg bg-[#ef233c] px-4 py-2 text-sm font-bold text-white shadow-md transition hover:bg-[#d90429]"
          >
            {showAllErrors ? "Show Less" : "View All Errors →"}
          </button>
        )}
      </div>
    </div>
</div>
</div>
) : null}

            {openFieldPanel ? (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 py-6 backdrop-blur-sm">
                <div className="w-full max-w-3xl rounded-2xl border border-blue-100 bg-white p-5 shadow-[0_28px_80px_rgba(15,23,42,0.24)]">
                  <span className="block text-lg font-bold text-slate-950">
                    {openFieldPanel === "all" ? "Add New Field for All Colleges" : "Add Custom Field for Single College"}
                  </span>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    {openFieldPanel === "single" ? (
                      <label className="text-xs font-bold text-slate-600">
                        College
                        <select
                          className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold outline-none focus:border-purple-300 focus:ring-4 focus:ring-purple-50"
                          value={customFieldForm.selectedCollegeRowId}
                          onChange={(event) => setCustomFieldForm((form) => ({ ...form, selectedCollegeRowId: event.target.value }))}
                        >
                          {previewRows.filter((row) => row.sheet === "colleges").map((row) => (
                            <option key={row.id} value={row.id}>{row.data.collegeName || row.data.collegeCode || `Row ${row.rowNumber}`}</option>
                          ))}
                          {!previewRows.some((row) => row.sheet === "colleges") ? <option value="">No college loaded</option> : null}
                        </select>
                      </label>
                    ) : null}
                    <label className="text-xs font-bold text-slate-600">
                      Field Name
                      <input
                        className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold outline-none focus:border-purple-300 focus:ring-4 focus:ring-purple-50"
                        value={customFieldForm.fieldName}
                        onChange={(event) => setCustomFieldForm((form) => ({ ...form, fieldName: event.target.value }))}
                      />
                    </label>
                    <label className="text-xs font-bold text-slate-600">
                      Field Type
                      <select
                        className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold outline-none focus:border-purple-300 focus:ring-4 focus:ring-purple-50"
                        value={customFieldForm.fieldType}
                        onChange={(event) => setCustomFieldForm((form) => ({ ...form, fieldType: event.target.value }))}
                      >
                        <option>Number</option>
                        <option>Text</option>
                        <option>TRUE/FALSE</option>
                      </select>
                    </label>
                    <label className="text-xs font-bold text-slate-600">
                      Default Value
                      <input
                        className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold outline-none focus:border-purple-300 focus:ring-4 focus:ring-purple-50"
                        value={customFieldForm.defaultValue}
                        onChange={(event) => setCustomFieldForm((form) => ({ ...form, defaultValue: event.target.value }))}
                      />
                    </label>
                  </div>
                  <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button type="button" className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50" onClick={() => setOpenFieldPanel(null)}>Cancel</button>
                    <button type="button" className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-2.5 text-xs font-bold text-white shadow-[0_12px_24px_rgba(79,70,229,0.22)] transition hover:from-blue-700 hover:to-purple-700" onClick={addCustomFieldToTable}>Add Field</button>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="flex justify-end gap-3 border-t border-[#e7eefb] bg-white px-4 py-4">
              {validationStatusText ? (
                <div
                  className={`mr-auto flex min-h-11 max-w-xl items-center rounded-md px-4 py-2 text-xs font-bold leading-5 ${
                    isBulkCollegeLimitExceeded
                      ? "border border-rose-200 bg-rose-50 text-rose-800"
                      : "border border-blue-100 bg-blue-50 text-blue-800"
                  }`}
                >
                  {validationStatusText}
                </div>
              ) : null}
              <button
                type="button"
                onClick={() => {
                  cancelEditingRow();
                  setShowFullDetails(false);
                  setOpenFieldPanel(null);
                  setShowFilters(false);
                }}
                className="h-11 rounded-md border border-[#dbe6f8] px-8 text-xs font-extrabold text-[#31509c]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!hasImportableBulkRows || editingRowId !== null || isImporting || isBulkCollegeLimitExceeded}
                onClick={() => {
                  setBulkImportFinished(false);
                  setValidationStatusText("");
                  setShowFinishPopup(true);
                }}
                className={`h-11 rounded-md px-8 text-xs font-extrabold shadow-[0_8px_18px_rgba(79,50,246,0.22)] ${
                  !hasImportableBulkRows || editingRowId !== null || isImporting || isBulkCollegeLimitExceeded
                    ? "cursor-not-allowed bg-[#c7cbe0] text-white"
                    : "bg-[#4f32f6] text-white"
                }`}
              >
                {isImporting
                  ? "Importing..."
                  : `Import Valid Data (${importableBulkCollegeCount + importableBulkCourseOnlyCollegeCount})`}
              </button>
            </div>
          

          {fieldErrorText ? (
            <div className="fixed bottom-6 right-6 z-40 flex w-[min(360px,calc(100vw-2rem))] items-start gap-3 rounded-md border border-[#ffb4b4] bg-[#fff5f5] p-4 text-xs shadow-[0_14px_34px_rgba(239,35,60,0.14)]">
              <X className="mt-0.5 size-4 shrink-0 rounded-full bg-[#ef233c] p-0.5 text-white" />
              <div className="min-w-0 flex-1">
                <span className="block font-extrabold text-[#a11220]">Cannot add field</span>
                <span className="mt-1 block font-bold text-[#6b2830]">{fieldErrorText}</span>
              </div>
              <button type="button" onClick={() => setFieldErrorText("")} className="text-[#8a9bc6]">
                <X className="size-4" />
              </button>
            </div>
          ) : null}
        </section>
      ) : null}

      {showFinishPopup ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl border border-green-100 bg-white p-6 text-center shadow-[0_28px_80px_rgba(15,23,42,0.24)]">
            <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-green-100 text-green-700">
              <BadgeCheck className="size-9" />
            </span>
            <h2 className="mt-5 text-xl font-bold text-slate-950">
              {bulkImportFinished ? "All college data and images uploaded successfully" : "Finish bulk college import"}
            </h2>
            <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
              {bulkImportFinished
                ? "The valid college records have been imported. You can close this popup and review the updated college list."
                : isImporting
                  ? "Please wait while we import the valid college records. Keep this window open until the process completes."
                : `Ready to import ${importableBulkCollegeCount + importableBulkCourseOnlyCollegeCount} valid college record${importableBulkCollegeCount + importableBulkCourseOnlyCollegeCount === 1 ? "" : "s"}. Click Finish to complete the import.`}
            </p>
            {isImporting ? (
              <div className="mt-6 rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-blue-50 p-4 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-700">Importing Colleges</p>
                    <p className="mt-1 text-sm font-bold text-slate-700">
                      {bulkImportProgressCompleted}/{bulkImportProgressTotal} loading
                    </p>
                  </div>
                  <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-white text-base font-black text-emerald-700 shadow-[0_12px_28px_rgba(16,185,129,0.16)] ring-1 ring-emerald-100">
                    {bulkImportProgressPercent}%
                  </div>
                </div>
                <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 transition-all duration-500"
                    style={{ width: `${bulkImportProgressPercent}%` }}
                  />
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-slate-500">
                  <span>Validating saved records</span>
                  <span>{bulkImportProgressTotal - bulkImportProgressCompleted} remaining</span>
                </div>
              </div>
            ) : null}
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => {
                  if (isImporting) return;
                  setShowFinishPopup(false);
                }}
                disabled={isImporting}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
              >
                {bulkImportFinished ? "Close" : "Back"}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (bulkImportFinished) {
                    setShowFinishPopup(false);
                    return;
                  }
                  void importValidData();
                }}
                disabled={isImporting}
                className="rounded-xl bg-gradient-to-r from-green-600 to-emerald-500 px-5 py-2.5 text-xs font-bold text-white shadow-[0_12px_24px_rgba(22,163,74,0.22)] transition hover:from-green-700 hover:to-emerald-600 disabled:cursor-not-allowed disabled:from-green-300 disabled:to-emerald-300"
              >
                {isImporting ? "Importing..." : bulkImportFinished ? "Done" : "Finish Upload"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showBulkLimitPopup ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-3xl border border-rose-100 bg-white p-6 shadow-[0_28px_80px_rgba(15,23,42,0.26)]">
            <div className="flex items-start gap-4">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-700">
                <TriangleAlert className="size-8" />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-rose-700">Upload Limit Reached</p>
                <h2 className="mt-1 text-2xl font-black leading-tight text-slate-950">
                  You can upload up to {MAX_BULK_COLLEGE_ROWS} colleges at a time.
                </h2>
                <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
                  Please split larger files and try again.
                </p>
              </div>
            </div>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowBulkLimitPopup(false)}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowBulkLimitPopup(false);
                  resetUploadSelection(activeUploadStep || "1");
                }}
                className="rounded-xl bg-gradient-to-r from-rose-600 to-orange-500 px-5 py-2.5 text-xs font-bold text-white shadow-[0_12px_24px_rgba(244,63,94,0.22)] transition hover:from-rose-700 hover:to-orange-600"
              >
                Choose Another File
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showZipLimitPopup ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-3xl border border-blue-100 bg-white p-6 shadow-[0_28px_80px_rgba(15,23,42,0.26)]">
            <div className="flex items-start gap-4">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                <FileClock className="size-8" />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-blue-700">ZIP Upload Restricted</p>
                <h2 className="mt-1 text-2xl font-black leading-tight text-slate-950">
                  {uploadErrors["3"] || getBulkZipLimitMessage()}
                </h2>
                <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
                  Please upload one valid .zip file within 100MB. The ZIP should contain the logo, cover, brochure PDF, and college images for the selected Excel data.
                </p>
              </div>
            </div>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowZipLimitPopup(false)}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowZipLimitPopup(false);
                  resetUploadSelection("3");
                }}
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-[0_12px_24px_rgba(37,99,235,0.22)] transition hover:bg-blue-700"
              >
                Choose Another ZIP
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

