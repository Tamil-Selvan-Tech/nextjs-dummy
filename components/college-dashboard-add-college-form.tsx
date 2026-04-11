"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, BadgeCheck, Plus, X } from "lucide-react";
import type { SafeAuthUser } from "@/lib/auth-storage";
import { request, withAuth } from "@/lib/api";
import {
  COLLEGE_ACCREDITATION_OPTIONS,
  INDIA_STATE_DISTRICT_MAP,
  INDIA_STATES,
} from "@/lib/india-location-data";
import { formatRankingRangeForSave, normalizeRankingRangeInput, parseRankingRange } from "@/lib/ranking-utils";
import { useStatusToast } from "@/lib/toast";

type Props = {
  token: string;
  currentUser: SafeAuthUser | null;
  college: Record<string, unknown> | null;
  courses?: Record<string, unknown>[];
  requestActionType?: "create" | "update" | "delete";
  approvalMessage?: string;
  onSaved: () => Promise<void> | void;
};

type CourseExam = {
  examName: string;
  cutoffScoreOrRank: string;
  weightage: string;
  paperOrSyllabus: string;
  preparationNotes: string;
};

type CourseDraft = {
  id: string;
  persisted?: boolean;
  courseType: string;
  degreeType: string;
  stream: string;
  specialization: string;
  duration: string;
  mode: string;
  lateralEntryAvailable: boolean;
  lateralEntryDetails: string;
  minimumQualification: string;
  university: string;
  admissionProcess: string;
  description: string;
  semesterFees: string;
  totalFees: string;
  cutoff: string;
  intake: string;
  applicationFee: string;
  entranceExamsEnabled: boolean;
  entranceExams: CourseExam[];
  isTopCourse: boolean;
};

const steps = ["Basic Info", "Location", "Contact", "Media", "Highlights", "Facilities", "Admission", "Placement", "Hostel", "Courses"];
const inputClass = "w-full rounded-[1rem] border border-[rgba(148,163,184,0.24)] bg-white px-3.5 py-2.5 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[rgba(56,189,248,0.38)] focus:ring-4 focus:ring-sky-100 sm:text-sm";
const labelClass = "mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500";
const sectionClass = "grid gap-2 md:grid-cols-2 xl:grid-cols-3";
const softButton = "inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50";
const primaryButton = "inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60";
const facilityOptions = ["Library", "Labs", "Hostel", "Sports", "Transport", "WiFi", "Cafeteria", "Gym", "Auditorium", "Medical"];
const availableCountries = ["India"];
const ownershipTypeOptions = ["Private", "Government", "Deemed"];
const degreeTypeOptions = ["UG", "PG", "Diploma", "Certificate", "Doctorate"];
const streamOptions = ["Engineering", "Management", "Arts", "Science", "Commerce", "Medical", "Law", "Design", "Education", "Paramedical", "Computer Applications"];
const modeOptions = ["Full-time", "Part-time", "Distance", "Online", "Hybrid"];
const qualificationOptions = ["10th", "10+2", "Diploma", "Graduation", "Post Graduation"];
const applicationModeOptions = ["Online", "Offline", "Online & Offline"];
const hostelTypeOptions = [
  { value: "inside_campus", label: "Inside Campus Hostel" },
  { value: "outside_campus", label: "Outside Campus Hostel" },
];
const yesNoOptions = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];
const availabilityOptions = [
  { value: "available", label: "Available" },
  { value: "not_available", label: "Not Available" },
];
const specializationMap: Record<string, string[]> = {
  Engineering: ["Computer Science", "Information Technology", "Mechanical", "Civil", "ECE", "EEE"],
  Management: ["Finance", "Marketing", "HR", "Operations", "Business Analytics"],
  Arts: ["English", "Tamil", "History", "Economics", "Sociology"],
  Science: ["Physics", "Chemistry", "Mathematics", "Microbiology", "Biotechnology"],
  Commerce: ["Accounting", "Finance", "Banking", "Taxation", "Professional Accounting"],
  Medical: ["MBBS", "BDS", "Nursing", "Pharmacy", "Allied Health"],
  Law: ["Corporate Law", "Criminal Law", "Civil Law"],
  Design: ["Fashion Design", "Interior Design", "Graphic Design"],
  Education: ["B.Ed", "M.Ed", "Special Education"],
  Paramedical: ["Physiotherapy", "Radiology", "Lab Technology"],
  "Computer Applications": ["BCA", "MCA", "Data Science", "Cyber Security"],
};
const defaultDurationByDegreeType: Record<string, string> = {
  UG: "3 Years",
  PG: "2 Years",
  Diploma: "2 Years",
  Certificate: "6 Months",
  Doctorate: "3 Years",
};
const streamDurationByDegreeType: Record<string, Partial<Record<string, string>>> = {
  Engineering: { UG: "4 Years", PG: "2 Years", Diploma: "3 Years", Certificate: "6 Months", Doctorate: "3 Years" },
  Medical: { UG: "5.5 Years", PG: "3 Years", Diploma: "2 Years", Certificate: "1 Year", Doctorate: "3 Years" },
  Law: { UG: "3 Years", PG: "2 Years", Diploma: "1 Year", Certificate: "6 Months", Doctorate: "3 Years" },
  Design: { UG: "4 Years", PG: "2 Years", Diploma: "2 Years", Certificate: "6 Months", Doctorate: "3 Years" },
  Education: { UG: "3 Years", PG: "2 Years", Diploma: "2 Years", Certificate: "1 Year", Doctorate: "3 Years" },
  Paramedical: { UG: "4 Years", PG: "2 Years", Diploma: "2 Years", Certificate: "1 Year", Doctorate: "3 Years" },
  "Computer Applications": { UG: "3 Years", PG: "2 Years", Diploma: "2 Years", Certificate: "6 Months", Doctorate: "3 Years" },
};
const streamCourseNameByDegreeType: Record<string, Partial<Record<string, string>>> = {
  Engineering: { UG: "B.E", PG: "M.E", Diploma: "Diploma in Engineering", Certificate: "Certificate in Engineering", Doctorate: "Ph.D" },
  Management: { UG: "BBA", PG: "MBA", Diploma: "Diploma in Management", Certificate: "Certificate in Management", Doctorate: "Ph.D" },
  Arts: { UG: "B.A", PG: "M.A", Diploma: "Diploma in Arts", Certificate: "Certificate in Arts", Doctorate: "Ph.D" },
  Science: { UG: "B.Sc", PG: "M.Sc", Diploma: "Diploma in Science", Certificate: "Certificate in Science", Doctorate: "Ph.D" },
  Commerce: { UG: "B.Com", PG: "M.Com", Diploma: "Diploma in Commerce", Certificate: "Certificate in Commerce", Doctorate: "Ph.D" },
  Medical: { UG: "MBBS", PG: "M.D", Diploma: "Diploma in Medical Sciences", Certificate: "Certificate in Medical Sciences", Doctorate: "Ph.D" },
  Law: { UG: "LLB", PG: "LLM", Diploma: "Diploma in Law", Certificate: "Certificate in Law", Doctorate: "Ph.D" },
  Design: { UG: "B.Des", PG: "M.Des", Diploma: "Diploma in Design", Certificate: "Certificate in Design", Doctorate: "Ph.D" },
  Education: { UG: "B.Ed", PG: "M.Ed", Diploma: "Diploma in Education", Certificate: "Certificate in Education", Doctorate: "Ph.D" },
  Paramedical: { UG: "BPT", PG: "MPT", Diploma: "Diploma in Paramedical", Certificate: "Certificate in Paramedical", Doctorate: "Ph.D" },
  "Computer Applications": { UG: "BCA", PG: "MCA", Diploma: "Diploma in Computer Applications", Certificate: "Certificate in Computer Applications", Doctorate: "Ph.D" },
};
const normalizeIndianPhoneInput = (value: string) => {
  const digits = value.replace(/\D/g, "");
  if (digits.length > 10 && digits.startsWith("91")) return digits.slice(2, 12);
  return digits.slice(0, 10);
};
const isValidIndianPhone = (value: string) => /^[6-9]\d{9}$/.test(value);

const toList = (value: unknown) => Array.isArray(value) ? value.map((item) => String(item || "").trim()).filter(Boolean) : String(value || "").split(",").map((item) => item.trim()).filter(Boolean);
const text = (obj: Record<string, unknown> | null, key: string) => String(obj?.[key] || "");
const nested = (obj: Record<string, unknown> | null, key: string) => ((obj?.[key] as Record<string, unknown>) || {});
const emptyExam = (): CourseExam => ({ examName: "", cutoffScoreOrRank: "", weightage: "", paperOrSyllabus: "", preparationNotes: "" });
const emptyCourseDraft = (university = ""): CourseDraft => ({ id: "", persisted: false, courseType: "", degreeType: "", stream: "", specialization: "", duration: "", mode: "Full-time", lateralEntryAvailable: false, lateralEntryDetails: "", minimumQualification: "", university, admissionProcess: "", description: "", semesterFees: "", totalFees: "", cutoff: "", intake: "", applicationFee: "", entranceExamsEnabled: false, entranceExams: [emptyExam()], isTopCourse: false });
const mergeUniqueValues = (primary: string[], secondary: string[]) => Array.from(new Set([...primary, ...secondary].filter(Boolean)));
const mapExistingCourseToDraft = (course: Record<string, unknown>): CourseDraft => {
  const collegeDetails = Array.isArray(course.collegeDetails) ? course.collegeDetails[0] as Record<string, unknown> : null;
  const entranceExams = Array.isArray(course.entranceExams)
    ? course.entranceExams
        .map((exam) => ({
          examName: String((exam as Record<string, unknown>)?.examName || ""),
          cutoffScoreOrRank: String((exam as Record<string, unknown>)?.cutoffScoreOrRank || ""),
          weightage: String((exam as Record<string, unknown>)?.weightage || ""),
          paperOrSyllabus: String((exam as Record<string, unknown>)?.paperOrSyllabus || ""),
          preparationNotes: String((exam as Record<string, unknown>)?.preparationNotes || ""),
        }))
        .filter((exam) => [exam.examName, exam.cutoffScoreOrRank, exam.weightage, exam.paperOrSyllabus, exam.preparationNotes].some(Boolean))
    : [];

  return {
    id: String(course._id || ""),
    persisted: true,
    courseType: String(course.courseType || ""),
    degreeType: String(course.degreeType || ""),
    stream: String(course.stream || ""),
    specialization: String(course.specialization || ""),
    duration: String(course.duration || ""),
    mode: String(course.mode || "Full-time"),
    lateralEntryAvailable: Boolean(course.lateralEntryAvailable),
    lateralEntryDetails: String(course.lateralEntryDetails || ""),
    minimumQualification: String(course.minimumQualification || ""),
    university: String(course.university || ""),
    admissionProcess: String(course.admissionProcess || ""),
    description: String(course.description || ""),
    semesterFees: String(collegeDetails?.semesterFees ?? ""),
    totalFees: String(collegeDetails?.totalFees ?? course.totalFees ?? ""),
    cutoff: String(collegeDetails?.cutoff ?? course.cutoff ?? ""),
    intake: String(collegeDetails?.intake ?? course.intake ?? ""),
    applicationFee: String(collegeDetails?.applicationFee ?? course.applicationFee ?? ""),
    entranceExamsEnabled: entranceExams.length > 0,
    entranceExams: entranceExams.length > 0 ? entranceExams : [emptyExam()],
    isTopCourse: Boolean(course.isTopCourse),
  };
};
const calcTotalFees = (semesterFees: string, duration: string) => {
  const perSem = Number(semesterFees || 0);
  const years = Number(String(duration || "").replace(/[^\d.]/g, ""));
  if (!Number.isFinite(perSem) || perSem <= 0 || !Number.isFinite(years) || years <= 0) return "";
  return String(Math.round(perSem * years * 2));
};
const normalizeExamDraft = (exam: CourseExam) => ({
  examName: String(exam.examName || "").trim(),
  cutoffScoreOrRank: String(exam.cutoffScoreOrRank || "").trim(),
  weightage: String(exam.weightage || "").trim(),
  paperOrSyllabus: String(exam.paperOrSyllabus || "").trim(),
  preparationNotes: String(exam.preparationNotes || "").trim(),
});
const serializeCourseDraftForCompare = (course: CourseDraft) =>
  JSON.stringify({
    courseType: String(course.courseType || "").trim(),
    degreeType: String(course.degreeType || "").trim(),
    stream: String(course.stream || "").trim(),
    specialization: String(course.specialization || "").trim(),
    duration: String(course.duration || "").trim(),
    mode: String(course.mode || "").trim(),
    lateralEntryAvailable: Boolean(course.lateralEntryAvailable),
    lateralEntryDetails: String(course.lateralEntryDetails || "").trim(),
    minimumQualification: String(course.minimumQualification || "").trim(),
    university: String(course.university || "").trim(),
    admissionProcess: String(course.admissionProcess || "").trim(),
    description: String(course.description || "").trim(),
    semesterFees: String(course.semesterFees || "").trim(),
    totalFees: String(course.totalFees || "").trim(),
    cutoff: String(course.cutoff || "").trim(),
    intake: String(course.intake || "").trim(),
    applicationFee: String(course.applicationFee || "").trim(),
    entranceExamsEnabled: Boolean(course.entranceExamsEnabled),
    entranceExams: (course.entranceExamsEnabled ? course.entranceExams : [])
      .map(normalizeExamDraft)
      .filter((exam) =>
        [exam.examName, exam.cutoffScoreOrRank, exam.weightage, exam.paperOrSyllabus, exam.preparationNotes].some(Boolean),
      ),
    isTopCourse: Boolean(course.isTopCourse),
  });
const getDefaultDuration = (stream: string, degreeType: string) =>
  streamDurationByDegreeType[stream]?.[degreeType] || defaultDurationByDegreeType[degreeType] || "";
const getDefaultCourseName = (stream: string, degreeType: string) =>
  streamCourseNameByDegreeType[stream]?.[degreeType] || "";
const getDefaultMinimumQualification = (courseName: string, degreeType: string, stream: string) => {
  const normalizedCourse = courseName.trim().toUpperCase();
  const normalizedStream = stream.trim();

  if (["MBA", "MCA", "M.E", "M.TECH", "M.SC", "M.COM", "M.A", "LLM", "MPT", "M.DES", "M.ED"].includes(normalizedCourse)) {
    return "Graduation";
  }
  if (["PH.D", "M.D"].includes(normalizedCourse) || degreeType === "Doctorate") {
    return "Post Graduation";
  }
  if (["B.ED"].includes(normalizedCourse)) {
    return "Graduation";
  }
  if (degreeType === "PG") return "Graduation";
  if (degreeType === "Doctorate") return "Post Graduation";
  if (degreeType === "Diploma") return "10th";
  if (degreeType === "Certificate") return normalizedStream === "Medical" ? "10+2" : "10th";
  return "10+2";
};
const getQualificationSuggestions = (courseName: string, degreeType: string, stream: string) => {
  const highestRequired = getDefaultMinimumQualification(courseName, degreeType, stream);
  return highestRequired ? [highestRequired] : qualificationOptions;
};
const shouldAutoShowEntranceExams = (courseName: string, degreeType: string, stream: string) => {
  const normalizedCourse = courseName.trim().toUpperCase();
  const normalizedStream = stream.trim();

  if (["Engineering", "Medical", "Law"].includes(normalizedStream)) return true;
  if (normalizedStream === "Management" && degreeType === "PG") return true;
  return ["B.E", "B.TECH", "M.E", "M.TECH", "MBBS", "M.D", "LLB", "LLM", "MBA", "MCA"].includes(normalizedCourse);
};

const buildForm = (college: Record<string, unknown> | null, user: SafeAuthUser | null) => {
  const fees = nested(college, "feesStructure");
  const placements = nested(college, "placements");
  const hostel = nested(college, "hostelDetails");
  const hostelFees = (hostel.feesStructure as Record<string, unknown>) || {};
  const wifi = (hostel.wifi as Record<string, unknown>) || {};
  return {
    name: text(college, "name"), description: text(college, "description"), establishedYear: text(college, "establishedYear"), ownershipType: text(college, "ownershipType"), university: text(college, "university"),
    country: text(college, "country") || "India", state: text(college, "state"), city: text(college, "city"), district: text(college, "district"), address: text(college, "address"), pincode: text(college, "pincode"), locationLink: text(college, "locationLink"),
    contactEmail: text(college, "contactEmail") || user?.email || "", contactPhone: text(college, "contactPhone") || user?.phone || "", alternatePhone: text(college, "alternatePhone"), website: text(college, "website"),
    logo: text(college, "logo"), coverImage: text(college, "image"), images: toList(college?.images), brochurePdfUrl: text(college, "brochurePdfUrl") || text(college, "brochureUrl"), campusVideoUrl: text(college, "campusVideoUrl"),
    ranking: formatRankingRangeForSave(college?.ranking as string | number | undefined), accreditation: text(college, "accreditation"), awardsRecognitions: text(college, "awardsRecognitions"), reviews: text(college, "reviews"), courseTags: toList(college?.courseTags).join(", "),
    isTopCollege: Boolean(college?.isTopCollege), isBestCollege: Boolean(college?.isBestCollege), facilities: toList(college?.facilities).join(", "), quotas: toList(college?.quotas).join(", "), feeMin: String(fees.min || ""), feeMax: String(fees.max || ""), admissionProcess: text(college, "admissionProcess"), applicationMode: text(college, "applicationMode"), scholarships: text(college, "scholarships"),
    averagePackage: String(placements.averagePackage || ""), highestPackage: String(placements.highestPackage || ""), placementRate: String(placements.placementRate || ""), companyCount: String(placements.companiesVisited || ""),
    hostelAvailability: String(hostel.availability || "not_available"), hostelType: String(hostel.hostelType || ""), hostelFeeMin: String(hostelFees.min || ""), hostelFeeMax: String(hostelFees.max || ""), cctvAvailable: String(hostel.cctvAvailable || ""), hostelFacilityOptions: toList(hostel.facilities).join(", "), waterAvailability: String(hostel.waterAvailability || ""), powerBackup: String(hostel.powerBackup || ""), wifiAvailable: String(wifi.available || ""), wifiSpeed: String(wifi.speed || ""), wifiPricing: String(wifi.pricing || ""), foodAvailability: String(hostel.foodAvailability || ""), foodTimings: String(hostel.foodTimings || ""), laundryService: String(hostel.laundryService || ""), roomCleaningFrequency: String(hostel.roomCleaningFrequency || ""), hostelRules: String(hostel.rules || ""),
  };
};

export function CollegeDashboardAddCollegeForm({ token, currentUser, college, courses = [], requestActionType, approvalMessage, onSaved }: Props) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(() => buildForm(college, currentUser));
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [brochureFile, setBrochureFile] = useState<File | null>(null);
  const [courseDrafts, setCourseDrafts] = useState<CourseDraft[]>(() => courses.map(mapExistingCourseToDraft));
  const [removedCourseIds, setRemovedCourseIds] = useState<string[]>([]);
  const [showCourseEditor, setShowCourseEditor] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState("");
  const [courseForm, setCourseForm] = useState<CourseDraft>(() => emptyCourseDraft(text(college, "university")));
  const persistedCourseBaselineRef = useRef<Record<string, string>>({});
  useStatusToast(status);
  useEffect(() => {
    const mappedCourseDrafts = courses.map(mapExistingCourseToDraft);
    setForm(buildForm(college, currentUser));
    setCourseDrafts(mappedCourseDrafts);
    setRemovedCourseIds([]);
    setCourseForm(emptyCourseDraft(text(college, "university")));
    setEditingCourseId("");
    setShowCourseEditor(false);
    persistedCourseBaselineRef.current = Object.fromEntries(
      mappedCourseDrafts
        .filter((item) => item.persisted && item.id)
        .map((item) => [item.id, serializeCourseDraftForCompare(item)]),
    );
  }, [college, courses, currentUser]);
  const hasHostel = form.hostelAvailability === "available";
  const availableStates = useMemo(() => INDIA_STATES, []);
  const availableDistricts = useMemo(
    () => (form.state ? (INDIA_STATE_DISTRICT_MAP[form.state] || []).slice().sort((a, b) => a.localeCompare(b)) : []),
    [form.state],
  );
  const selectedFacilities = useMemo(() => toList(form.facilities), [form.facilities]);
  const specializationOptions = useMemo(() => specializationMap[courseForm.stream] || [], [courseForm.stream]);
  const qualificationSuggestions = useMemo(
    () => getQualificationSuggestions(courseForm.courseType, courseForm.degreeType, courseForm.stream),
    [courseForm.courseType, courseForm.degreeType, courseForm.stream],
  );
  const setField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm((prev) => ({ ...prev, [key]: value }));
  const setCourseField = <K extends keyof CourseDraft>(key: K, value: CourseDraft[K]) => setCourseForm((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    if (form.state && !availableDistricts.includes(form.district)) {
      setForm((prev) => ({ ...prev, district: "" }));
    }
  }, [availableDistricts, form.district, form.state]);

  const uploadAssets = async () => {
    if (!token || (!logoFile && !coverImageFile && imageFiles.length === 0 && !brochureFile)) return { logo: "", coverImage: "", images: [] as string[], brochurePdfUrl: "" };
    const formData = new FormData();
    if (logoFile) formData.append("logo", logoFile);
    if (coverImageFile) formData.append("coverImage", coverImageFile);
    imageFiles.forEach((file) => formData.append("images", file));
    if (brochureFile) formData.append("brochure", brochureFile);
    const data = await request("/api/users/upload-assets", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData });
    return { logo: String(data?.data?.logo || ""), coverImage: String(data?.data?.coverImage || ""), images: Array.isArray(data?.data?.images) ? (data.data.images as string[]) : [], brochurePdfUrl: String(data?.data?.brochurePdfUrl || "") };
  };

  const resetCourseEditor = () => {
    setEditingCourseId("");
    setShowCourseEditor(false);
    setCourseForm(emptyCourseDraft(form.university));
  };

  const saveCourseDraft = () => {
    if (!courseForm.courseType.trim() || !courseForm.degreeType.trim() || !courseForm.stream.trim() || !courseForm.specialization.trim() || !courseForm.duration.trim() || !courseForm.minimumQualification.trim() || !courseForm.totalFees.trim() || !courseForm.cutoff.trim()) {
      setStatus({ type: "error", text: "Courses: fill all required course fields." });
      return;
    }
    const nextDraft = {
      ...courseForm,
      id: editingCourseId || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      persisted: editingCourseId ? courseDrafts.find((item) => item.id === editingCourseId)?.persisted || false : false,
      entranceExams: courseForm.entranceExams.filter((exam) => [exam.examName, exam.cutoffScoreOrRank, exam.weightage, exam.paperOrSyllabus, exam.preparationNotes].some((value) => String(value || "").trim())),
    };
    setCourseDrafts((prev) => editingCourseId ? prev.map((item) => item.id === editingCourseId ? nextDraft : item) : [...prev, nextDraft]);
    setStatus({ type: "success", text: "Course draft saved." });
    resetCourseEditor();
  };

  const saveCollege = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setSaving(true);
      const uploaded = await uploadAssets();
      const next = { ...form, logo: uploaded.logo || form.logo, coverImage: uploaded.coverImage || form.coverImage, images: uploaded.images.length ? mergeUniqueValues(form.images, uploaded.images) : form.images, brochurePdfUrl: uploaded.brochurePdfUrl || form.brochurePdfUrl, ranking: formatRankingRangeForSave(form.ranking) };
      if (!next.name.trim() || !next.description.trim() || !next.establishedYear.trim() || !next.university.trim()) return setStatus({ type: "error", text: "Basic Info fields are required" });
      if (!next.country.trim() || !next.state.trim() || !next.city.trim() || !next.address.trim() || !next.pincode.trim()) return setStatus({ type: "error", text: "Location fields are required" });
      if (!next.contactEmail.trim() || !next.contactPhone.trim()) return setStatus({ type: "error", text: "Contact fields are required" });
      if (!isValidIndianPhone(next.contactPhone)) return setStatus({ type: "error", text: "Enter a valid 10 digit contact phone number" });
      if (next.alternatePhone.trim() && !isValidIndianPhone(next.alternatePhone)) return setStatus({ type: "error", text: "Enter a valid 10 digit alternate phone number" });
      if (!next.logo.trim() || !next.coverImage.trim() || next.images.length < 2) return setStatus({ type: "error", text: "Logo, cover image, and at least 2 college images are required" });
      if (next.ranking.trim() && !parseRankingRange(next.ranking)) return setStatus({ type: "error", text: "Ranking format should be like 25-50" });
      if (!next.feeMin.trim() || !next.feeMax.trim() || !next.admissionProcess.trim() || !next.applicationMode.trim()) return setStatus({ type: "error", text: "Admission fields are required" });
      if (hasHostel && (!next.hostelType.trim() || !next.hostelFeeMin.trim() || !next.hostelFeeMax.trim() || !next.cctvAvailable.trim())) return setStatus({ type: "error", text: "Hostel fields are required" });
      const payload = { ...next, image: next.coverImage, brochureUrl: next.brochurePdfUrl, courseTags: toList(next.courseTags), facilities: toList(next.facilities), quotas: toList(next.quotas), feesStructure: { min: next.feeMin, max: next.feeMax }, placements: { averagePackage: next.averagePackage, highestPackage: next.highestPackage, placementRate: next.placementRate, companiesVisited: next.companyCount }, hostelDetails: { availability: hasHostel ? "available" : "not_available", hostelType: hasHostel ? next.hostelType : "", feesStructure: { min: hasHostel ? next.hostelFeeMin : "", max: hasHostel ? next.hostelFeeMax : "" }, cctvAvailable: hasHostel ? next.cctvAvailable : "", facilities: hasHostel ? toList(next.hostelFacilityOptions) : [], waterAvailability: hasHostel ? next.waterAvailability : "", powerBackup: hasHostel ? next.powerBackup : "", wifi: { available: hasHostel ? next.wifiAvailable : "", speed: hasHostel ? next.wifiSpeed : "", pricing: hasHostel ? next.wifiPricing : "" }, foodAvailability: hasHostel ? next.foodAvailability : "", foodTimings: hasHostel ? next.foodTimings : "", laundryService: hasHostel ? next.laundryService : "", roomCleaningFrequency: hasHostel ? next.roomCleaningFrequency : "", rules: hasHostel ? next.hostelRules : "" }, approvedFromCollegeRequest: requestActionType === "update" ? "update" : "create" };
      await request("/api/users/my-college", withAuth(token, { method: "POST", body: JSON.stringify(payload) }));
      for (const courseId of removedCourseIds) {
        await request(`/api/users/my-courses/${courseId}`, withAuth(token, { method: "DELETE" }));
      }
      for (const course of courseDrafts) {
        const coursePayload = { courseType: course.courseType, degreeType: course.degreeType, stream: course.stream, specialization: course.specialization, duration: course.duration, mode: course.mode, lateralEntryAvailable: course.lateralEntryAvailable, lateralEntryDetails: course.lateralEntryDetails, minimumQualification: course.minimumQualification, university: course.university, admissionProcess: course.admissionProcess, description: course.description, semesterFees: course.semesterFees, totalFees: course.totalFees, cutoff: course.cutoff, intake: course.intake, applicationFee: course.applicationFee, entranceExams: course.entranceExamsEnabled ? course.entranceExams : [], isTopCourse: course.isTopCourse };
        if (course.persisted) {
          if (persistedCourseBaselineRef.current[course.id] === serializeCourseDraftForCompare(course)) {
            continue;
          }
          await request(`/api/users/my-courses/${course.id}`, withAuth(token, { method: "PUT", body: JSON.stringify(coursePayload) }));
        } else {
          await request("/api/users/my-courses", withAuth(token, { method: "POST", body: JSON.stringify(coursePayload) }));
        }
      }
      setStatus({
        type: "success",
        text:
          requestActionType === "create"
            ? "Your college was created successfully."
            : "College details were updated successfully.",
      });
      await onSaved();
    } catch (error) {
      setStatus({ type: "error", text: error instanceof Error ? error.message : "Unable to save college." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <article className="luxe-card reveal-up delay-3 rounded-[1.35rem] p-3.5 sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--brand-support)]">Approved College Request</p>
          <h2 className="mt-1.5 text-lg font-bold text-slate-900 sm:text-xl">{requestActionType === "update" ? "Edit Our College" : "Add New College"}</h2>
          <p className="mt-1.5 text-[13px] leading-5 text-slate-600">This form mirrors the admin add-college flow with the same section order and field coverage.</p>
        </div>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">{requestActionType === "update" ? "Edit Unlocked" : "Add Unlocked"}</span>
      </div>
      {approvalMessage ? <div className="mt-4 rounded-[1rem] border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{approvalMessage}</div> : null}
      <form onSubmit={saveCollege} className="mt-4 rounded-[1.35rem] border border-white/80 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-3 text-sm shadow-[0_24px_46px_rgba(148,163,184,0.14)] sm:p-4">
        <div className="rounded-[1.15rem] border border-slate-200 bg-slate-50 p-3">
          <div className="h-2 rounded-full bg-white"><div className="h-2 rounded-full bg-slate-900 transition-all" style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div>
          <div className="mt-3 grid gap-2 sm:grid-cols-5 xl:grid-cols-10">{steps.map((item, index) => <button key={item} type="button" onClick={() => setStep(index)} className={`rounded-[0.95rem] border px-2.5 py-2 text-left text-[11px] font-semibold transition ${index === step ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-500"}`}>{item}</button>)}</div>
        </div>
        <div className="mt-4 space-y-4">
          {step === 0 ? <div className={sectionClass}><label><span className={labelClass}>College Name *</span><input className={inputClass} value={form.name} onChange={(e) => setField("name", e.target.value)} /></label><label className="md:col-span-2 xl:col-span-2"><span className={labelClass}>Description *</span><textarea className={inputClass} rows={4} value={form.description} onChange={(e) => setField("description", e.target.value)} /></label><label><span className={labelClass}>Established Year *</span><input className={inputClass} value={form.establishedYear} onChange={(e) => setField("establishedYear", e.target.value)} /></label><label><span className={labelClass}>Ownership Type</span><select className={inputClass} value={form.ownershipType} onChange={(e) => setField("ownershipType", e.target.value)}><option value="">Select ownership</option>{ownershipTypeOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select></label><label><span className={labelClass}>University / Affiliation *</span><input className={inputClass} value={form.university} onChange={(e) => setField("university", e.target.value)} /></label></div> : null}
          {step === 1 ? <div className={sectionClass}><label><span className={labelClass}>Country *</span><select className={inputClass} value={form.country} onChange={(e) => setField("country", e.target.value)}>{availableCountries.map((item) => <option key={item} value={item}>{item}</option>)}</select></label><label><span className={labelClass}>State *</span><select className={inputClass} value={form.state} onChange={(e) => setForm((prev) => ({ ...prev, state: e.target.value, district: "" }))}><option value="">Select state</option>{availableStates.map((item) => <option key={item} value={item}>{item}</option>)}</select></label><label><span className={labelClass}>City *</span><input className={inputClass} value={form.city} onChange={(e) => setField("city", e.target.value)} /></label><label><span className={labelClass}>District</span><select className={inputClass} value={form.district} onChange={(e) => setField("district", e.target.value)}><option value="">Select district</option>{availableDistricts.map((item) => <option key={item} value={item}>{item}</option>)}</select></label><label className="md:col-span-2 xl:col-span-2"><span className={labelClass}>Address *</span><textarea className={inputClass} rows={3} value={form.address} onChange={(e) => setField("address", e.target.value)} /></label><label><span className={labelClass}>Pincode *</span><input className={inputClass} value={form.pincode} onChange={(e) => setField("pincode", e.target.value)} /></label><label><span className={labelClass}>Google Map URL</span><input className={inputClass} value={form.locationLink} onChange={(e) => setField("locationLink", e.target.value)} /></label></div> : null}
          {step === 2 ? <div className={sectionClass}><label><span className={labelClass}>Official Email *</span><input className={inputClass} type="email" value={form.contactEmail} onChange={(e) => setField("contactEmail", e.target.value)} /></label><label><span className={labelClass}>Phone Number *</span><input className={inputClass} type="tel" inputMode="numeric" maxLength={10} placeholder="10 digit mobile number" value={form.contactPhone} onChange={(e) => setField("contactPhone", normalizeIndianPhoneInput(e.target.value))} /></label><label><span className={labelClass}>Alternate Phone</span><input className={inputClass} type="tel" inputMode="numeric" maxLength={10} placeholder="10 digit alternate number" value={form.alternatePhone} onChange={(e) => setField("alternatePhone", normalizeIndianPhoneInput(e.target.value))} /></label><label><span className={labelClass}>Website URL</span><input className={inputClass} value={form.website} onChange={(e) => setField("website", e.target.value)} /></label></div> : null}
          {step === 3 ? <div className={sectionClass}><label><span className={labelClass}>Logo Image *</span><input className={inputClass} type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} /></label><label><span className={labelClass}>Cover Image *</span><input className={inputClass} type="file" accept="image/*" onChange={(e) => setCoverImageFile(e.target.files?.[0] || null)} /></label><label><span className={labelClass}>College Images * (Minimum 2)</span><input className={inputClass} type="file" accept="image/*" multiple onChange={(e) => { const nextFiles = Array.from(e.target.files || []); if (nextFiles.length) { setImageFiles((prev) => [...prev, ...nextFiles]); } }} /></label><label><span className={labelClass}>Brochure PDF</span><input className={inputClass} type="file" accept="application/pdf" onChange={(e) => setBrochureFile(e.target.files?.[0] || null)} /></label><label className="md:col-span-2 xl:col-span-2"><span className={labelClass}>Campus Video</span><input className={inputClass} value={form.campusVideoUrl} onChange={(e) => setField("campusVideoUrl", e.target.value)} /></label></div> : null}
          {step === 4 ? <div className={sectionClass}><label><span className={labelClass}>Ranking</span><input className={inputClass} value={form.ranking} onChange={(e) => setField("ranking", normalizeRankingRangeInput(e.target.value))} onBlur={() => setField("ranking", formatRankingRangeForSave(form.ranking))} /></label><label><span className={labelClass}>Accreditation</span><input className={inputClass} list="college-accreditation-options" value={form.accreditation} onChange={(e) => setField("accreditation", e.target.value)} /></label><label><span className={labelClass}>Awards & Recognitions</span><input className={inputClass} value={form.awardsRecognitions} onChange={(e) => setField("awardsRecognitions", e.target.value)} /></label><label className="md:col-span-2 xl:col-span-2"><span className={labelClass}>Reviews</span><textarea className={inputClass} rows={3} value={form.reviews} onChange={(e) => setField("reviews", e.target.value)} /></label><label className="md:col-span-2 xl:col-span-2"><span className={labelClass}>Course Tags</span><input className={inputClass} value={form.courseTags} onChange={(e) => setField("courseTags", e.target.value)} /></label><label className="flex items-center gap-3 rounded-[1rem] border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"><input type="checkbox" checked={form.isTopCollege} onChange={(e) => setField("isTopCollege", e.target.checked)} /> Top College</label><label className="flex items-center gap-3 rounded-[1rem] border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"><input type="checkbox" checked={form.isBestCollege} onChange={(e) => setField("isBestCollege", e.target.checked)} /> Best College</label></div> : null}
          {step === 5 ? <div className="space-y-4"><div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">{facilityOptions.map((item) => { const selected = selectedFacilities.some((value) => value.toLowerCase() === item.toLowerCase()); const next = selected ? selectedFacilities.filter((value) => value.toLowerCase() !== item.toLowerCase()) : [...selectedFacilities, item]; return <button key={item} type="button" onClick={() => setField("facilities", next.join(", "))} className={`rounded-[1rem] border px-3 py-2 text-sm font-semibold transition ${selected ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-700"}`}>{item}</button>; })}</div><label><span className={labelClass}>Facilities</span><input className={inputClass} value={form.facilities} onChange={(e) => setField("facilities", e.target.value)} /></label></div> : null}
          {step === 6 ? <div className={sectionClass}><label><span className={labelClass}>Quotas</span><input className={inputClass} value={form.quotas} onChange={(e) => setField("quotas", e.target.value)} /></label><label className="md:col-span-2 xl:col-span-2"><span className={labelClass}>Fees Structure *</span><div className="grid gap-2 sm:grid-cols-2"><input className={inputClass} value={form.feeMin} onChange={(e) => setField("feeMin", e.target.value)} placeholder="Minimum fee" /><input className={inputClass} value={form.feeMax} onChange={(e) => setField("feeMax", e.target.value)} placeholder="Maximum fee" /></div></label><label className="md:col-span-2 xl:col-span-2"><span className={labelClass}>Admission Process *</span><textarea className={inputClass} rows={3} value={form.admissionProcess} onChange={(e) => setField("admissionProcess", e.target.value)} /></label><label><span className={labelClass}>Application Mode *</span><select className={inputClass} value={form.applicationMode} onChange={(e) => setField("applicationMode", e.target.value)}><option value="">Select application mode</option>{applicationModeOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select></label><label className="md:col-span-2 xl:col-span-3"><span className={labelClass}>Scholarships</span><textarea className={inputClass} rows={2} value={form.scholarships} onChange={(e) => setField("scholarships", e.target.value)} /></label></div> : null}
          {step === 7 ? <div className="space-y-3"><div className="rounded-[1rem] border border-emerald-200 bg-emerald-50 p-3"><p className={`${labelClass} mb-1 text-emerald-700`}>Placement Percentage</p><input className={`${inputClass} border-emerald-200 bg-white`} value={form.placementRate} onChange={(e) => setField("placementRate", e.target.value)} placeholder="Placement %" /><p className="mt-2 text-xs text-emerald-700">Keep this as a key highlight point while submitting the college profile.</p></div><div className={sectionClass}><label><span className={labelClass}>Average Package</span><input className={inputClass} value={form.averagePackage} onChange={(e) => setField("averagePackage", e.target.value)} /></label><label><span className={labelClass}>Highest Package</span><input className={inputClass} value={form.highestPackage} onChange={(e) => setField("highestPackage", e.target.value)} /></label><label><span className={labelClass}>Companies Visited</span><input className={inputClass} value={form.companyCount} onChange={(e) => setField("companyCount", e.target.value)} /></label></div></div> : null}
          {step === 8 ? <div className="space-y-4"><div className="flex flex-wrap gap-2"><button type="button" onClick={() => setField("hostelAvailability", "available")} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${hasHostel ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-700"}`}>Hostel Available</button><button type="button" onClick={() => setField("hostelAvailability", "not_available")} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${!hasHostel ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-700"}`}>Hostel Not Available</button></div>{hasHostel ? <div className={sectionClass}><label><span className={labelClass}>Hostel Type *</span><select className={inputClass} value={form.hostelType} onChange={(e) => setField("hostelType", e.target.value)}><option value="">Hostel type</option>{hostelTypeOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label><label><span className={labelClass}>Hostel Min Fee *</span><input className={inputClass} value={form.hostelFeeMin} onChange={(e) => setField("hostelFeeMin", e.target.value)} /></label><label><span className={labelClass}>Hostel Max Fee *</span><input className={inputClass} value={form.hostelFeeMax} onChange={(e) => setField("hostelFeeMax", e.target.value)} /></label><label><span className={labelClass}>CCTV Availability *</span><select className={inputClass} value={form.cctvAvailable} onChange={(e) => setField("cctvAvailable", e.target.value)}><option value="">CCTV availability</option>{yesNoOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label><label><span className={labelClass}>Facilities</span><input className={inputClass} value={form.hostelFacilityOptions} onChange={(e) => setField("hostelFacilityOptions", e.target.value)} /></label><label><span className={labelClass}>Water Availability</span><select className={inputClass} value={form.waterAvailability} onChange={(e) => setField("waterAvailability", e.target.value)}><option value="">Water availability</option>{availabilityOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label><label><span className={labelClass}>Power Backup</span><select className={inputClass} value={form.powerBackup} onChange={(e) => setField("powerBackup", e.target.value)}><option value="">Power backup</option>{yesNoOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label><label><span className={labelClass}>WiFi Availability</span><select className={inputClass} value={form.wifiAvailable} onChange={(e) => setField("wifiAvailable", e.target.value)}><option value="">WiFi availability</option>{yesNoOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label><label><span className={labelClass}>WiFi Speed</span><input className={inputClass} value={form.wifiSpeed} onChange={(e) => setField("wifiSpeed", e.target.value)} /></label><label><span className={labelClass}>WiFi Pricing</span><input className={inputClass} value={form.wifiPricing} onChange={(e) => setField("wifiPricing", e.target.value)} /></label><label><span className={labelClass}>Food Availability</span><select className={inputClass} value={form.foodAvailability} onChange={(e) => setField("foodAvailability", e.target.value)}><option value="">Food availability</option>{availabilityOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label><label><span className={labelClass}>Food Timings</span><input className={inputClass} value={form.foodTimings} onChange={(e) => setField("foodTimings", e.target.value)} /></label><label><span className={labelClass}>Laundry Service</span><select className={inputClass} value={form.laundryService} onChange={(e) => setField("laundryService", e.target.value)}><option value="">Laundry service</option>{yesNoOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label><label><span className={labelClass}>Room Cleaning Frequency</span><input className={inputClass} value={form.roomCleaningFrequency} onChange={(e) => setField("roomCleaningFrequency", e.target.value)} /></label><label className="md:col-span-2 xl:col-span-3"><span className={labelClass}>General Info</span><textarea className={inputClass} rows={3} value={form.hostelRules} onChange={(e) => setField("hostelRules", e.target.value)} /></label></div> : <div className="rounded-[1rem] border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">Select Hostel Available to enter hostel details.</div>}</div> : null}
          {step === 9 ? <div className="space-y-4"><div className="flex items-center justify-between gap-3 rounded-[1rem] border border-slate-200 bg-slate-50 p-4"><div><p className="text-sm font-semibold text-slate-900">Courses In Add College</p><p className="text-xs text-slate-500">Existing courses are loaded here as-is, so you can edit, keep, or remove them before saving.</p></div><div className="flex items-center gap-2"><span className="text-xs text-slate-500">Selected: {courseDrafts.length}</span><button type="button" onClick={() => { setShowCourseEditor(true); setEditingCourseId(""); setCourseForm(emptyCourseDraft(form.university)); }} className={primaryButton}>Add Course</button></div></div>{showCourseEditor ? <div className="space-y-4 rounded-[1rem] border border-slate-200 bg-slate-50 p-4"><div className="flex items-center justify-between gap-3"><div><h3 className="text-sm font-bold text-slate-900">{editingCourseId ? "Edit Course In Add College" : "Create Course In Add College"}</h3><p className="text-xs text-slate-500">This course will be saved together with the current college.</p></div><button type="button" onClick={resetCourseEditor} className={softButton}>Cancel</button></div><div className={sectionClass}><label><span className={labelClass}>Course Name *</span><input className={inputClass} value={courseForm.courseType} onChange={(e) => setCourseField("courseType", e.target.value)} placeholder="B.Tech, MBA, B.Sc..." /></label><label><span className={labelClass}>Degree Type *</span><select className={inputClass} value={courseForm.degreeType} onChange={(e) => setCourseForm((prev) => { const nextDegreeType = e.target.value; const nextCourseName = getDefaultCourseName(prev.stream, nextDegreeType) || prev.courseType; return { ...prev, degreeType: nextDegreeType, courseType: nextCourseName, duration: getDefaultDuration(prev.stream, nextDegreeType) || prev.duration, minimumQualification: getDefaultMinimumQualification(nextCourseName, nextDegreeType, prev.stream) || prev.minimumQualification, entranceExamsEnabled: shouldAutoShowEntranceExams(nextCourseName, nextDegreeType, prev.stream) || prev.entranceExamsEnabled, entranceExams: shouldAutoShowEntranceExams(nextCourseName, nextDegreeType, prev.stream) ? (prev.entranceExams.length ? prev.entranceExams : [emptyExam()]) : prev.entranceExams }; })}><option value="">Select degree type</option>{degreeTypeOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select></label><label><span className={labelClass}>Stream *</span><select className={inputClass} value={courseForm.stream} onChange={(e) => setCourseForm((prev) => { const nextStream = e.target.value; const nextCourseName = getDefaultCourseName(nextStream, prev.degreeType) || prev.courseType; return { ...prev, stream: nextStream, courseType: nextCourseName, specialization: "", duration: getDefaultDuration(nextStream, prev.degreeType) || prev.duration, minimumQualification: getDefaultMinimumQualification(nextCourseName, prev.degreeType, nextStream) || prev.minimumQualification, entranceExamsEnabled: shouldAutoShowEntranceExams(nextCourseName, prev.degreeType, nextStream) || prev.entranceExamsEnabled, entranceExams: shouldAutoShowEntranceExams(nextCourseName, prev.degreeType, nextStream) ? (prev.entranceExams.length ? prev.entranceExams : [emptyExam()]) : prev.entranceExams }; })}><option value="">Select stream</option>{streamOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select></label><label><span className={labelClass}>Specialization *</span><select className={inputClass} value={courseForm.specialization} onChange={(e) => setCourseForm((prev) => { const nextSpecialization = e.target.value; const nextCourseName = getDefaultCourseName(prev.stream, prev.degreeType) || prev.courseType; return { ...prev, specialization: nextSpecialization, courseType: nextCourseName, minimumQualification: getDefaultMinimumQualification(nextCourseName, prev.degreeType, prev.stream) || prev.minimumQualification, entranceExamsEnabled: shouldAutoShowEntranceExams(nextCourseName, prev.degreeType, prev.stream) || prev.entranceExamsEnabled, entranceExams: shouldAutoShowEntranceExams(nextCourseName, prev.degreeType, prev.stream) ? (prev.entranceExams.length ? prev.entranceExams : [emptyExam()]) : prev.entranceExams }; })}><option value="">Select specialization</option>{specializationOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select></label><label><span className={labelClass}>Duration *</span><input className={inputClass} value={courseForm.duration} onChange={(e) => setCourseForm((prev) => ({ ...prev, duration: e.target.value, totalFees: calcTotalFees(prev.semesterFees, e.target.value) || prev.totalFees }))} placeholder="4 Years" /></label><label><span className={labelClass}>Mode</span><select className={inputClass} value={courseForm.mode} onChange={(e) => setCourseField("mode", e.target.value)}>{modeOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select></label><label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"><input type="checkbox" checked={courseForm.lateralEntryAvailable} onChange={(e) => setCourseForm((prev) => ({ ...prev, lateralEntryAvailable: e.target.checked, lateralEntryDetails: e.target.checked ? prev.lateralEntryDetails : "" }))} />Lateral Entry</label>{courseForm.lateralEntryAvailable ? <label className="md:col-span-2"><span className={labelClass}>Lateral Entry Details</span><input className={inputClass} value={courseForm.lateralEntryDetails} onChange={(e) => setCourseField("lateralEntryDetails", e.target.value)} placeholder="Direct second year / diploma entry rules" /></label> : null}<label><span className={labelClass}>Minimum Qualification *</span><input className={inputClass} list="course-qualification-options" value={courseForm.minimumQualification} onChange={(e) => setCourseField("minimumQualification", e.target.value)} placeholder="10+2 / Graduation" /></label><label><span className={labelClass}>University</span><input className={inputClass} value={courseForm.university} onChange={(e) => setCourseField("university", e.target.value)} placeholder="Affiliated or awarding university" /></label><label><span className={labelClass}>Semester Fees *</span><input className={inputClass} value={courseForm.semesterFees} onChange={(e) => setCourseForm((prev) => ({ ...prev, semesterFees: e.target.value, totalFees: calcTotalFees(e.target.value, prev.duration) || prev.totalFees }))} placeholder="Semester fees" /></label><label><span className={labelClass}>Total Fees *</span><input className={inputClass} value={courseForm.totalFees} onChange={(e) => setCourseField("totalFees", e.target.value)} placeholder="Total fees" /></label><label><span className={labelClass}>Cutoff *</span><input className={inputClass} value={courseForm.cutoff} onChange={(e) => setCourseField("cutoff", e.target.value)} placeholder="Cutoff" /></label><label><span className={labelClass}>Intake</span><input className={inputClass} value={courseForm.intake} onChange={(e) => setCourseField("intake", e.target.value)} placeholder="Total allotted seats" /></label><label><span className={labelClass}>Application Fee</span><input className={inputClass} value={courseForm.applicationFee} onChange={(e) => setCourseField("applicationFee", e.target.value)} placeholder="Application fee" /></label><label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"><input type="checkbox" checked={courseForm.isTopCourse} onChange={(e) => setCourseField("isTopCourse", e.target.checked)} />Top Course</label><label className="md:col-span-2 xl:col-span-3"><span className={labelClass}>Admission Process</span><textarea className={inputClass} rows={2} value={courseForm.admissionProcess} onChange={(e) => setCourseField("admissionProcess", e.target.value)} /></label><label className="md:col-span-2 xl:col-span-3"><span className={labelClass}>Course Description</span><textarea className={inputClass} rows={3} value={courseForm.description} onChange={(e) => setCourseField("description", e.target.value)} /></label></div>{courseForm.entranceExamsEnabled ? <div className="rounded-[1rem] border border-slate-200 bg-white p-3"><div className="mb-3 flex items-center justify-between gap-3"><div><h3 className="text-sm font-bold text-slate-900">Entrance Exams</h3><p className="text-xs text-slate-500">Add exam details if this course needs them.</p></div><div className="flex items-center gap-2"><button type="button" onClick={() => setCourseForm((prev) => ({ ...prev, entranceExamsEnabled: false, entranceExams: [emptyExam()] }))} className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700"><X className="size-4" /></button><button type="button" onClick={() => setCourseForm((prev) => ({ ...prev, entranceExams: [...prev.entranceExams, emptyExam()] }))} className={softButton}><Plus className="size-4" />Add Exam</button></div></div><div className="space-y-3">{courseForm.entranceExams.map((exam, index) => <div key={`exam-${index}`} className="rounded-[1rem] border border-slate-200 bg-slate-50 p-3"><div className="mb-2 flex items-center justify-between gap-3"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Exam {index + 1}</p>{courseForm.entranceExams.length > 1 ? <button type="button" onClick={() => setCourseForm((prev) => ({ ...prev, entranceExams: prev.entranceExams.filter((_, examIndex) => examIndex !== index) }))} className="text-xs font-semibold text-rose-600">Remove</button> : null}</div><div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3"><input className={inputClass} value={exam.examName} onChange={(e) => setCourseForm((prev) => ({ ...prev, entranceExams: prev.entranceExams.map((item, i) => i === index ? { ...item, examName: e.target.value } : item) }))} placeholder="Exam name" /><input className={inputClass} value={exam.cutoffScoreOrRank} onChange={(e) => setCourseForm((prev) => ({ ...prev, entranceExams: prev.entranceExams.map((item, i) => i === index ? { ...item, cutoffScoreOrRank: e.target.value } : item) }))} placeholder="Cutoff score / rank" /><input className={inputClass} value={exam.weightage} onChange={(e) => setCourseForm((prev) => ({ ...prev, entranceExams: prev.entranceExams.map((item, i) => i === index ? { ...item, weightage: e.target.value } : item) }))} placeholder="Exam weightage" /><input className={`${inputClass} md:col-span-2 xl:col-span-3`} value={exam.paperOrSyllabus} onChange={(e) => setCourseForm((prev) => ({ ...prev, entranceExams: prev.entranceExams.map((item, i) => i === index ? { ...item, paperOrSyllabus: e.target.value } : item) }))} placeholder="Specified paper / syllabus" /><textarea className={`${inputClass} md:col-span-2 xl:col-span-3`} rows={2} value={exam.preparationNotes} onChange={(e) => setCourseForm((prev) => ({ ...prev, entranceExams: prev.entranceExams.map((item, i) => i === index ? { ...item, preparationNotes: e.target.value } : item) }))} placeholder="Preparation notes" /></div></div>)}</div></div> : <div className="rounded-[1rem] border border-dashed border-slate-300 bg-white p-3"><div className="flex flex-wrap gap-2"><button type="button" onClick={() => setCourseForm((prev) => ({ ...prev, entranceExamsEnabled: true, entranceExams: prev.entranceExams.length ? prev.entranceExams : [emptyExam()] }))} className={softButton}><Plus className="size-4" />Add Entrance Exam</button><button type="button" onClick={() => setCourseForm((prev) => ({ ...prev, entranceExamsEnabled: false, entranceExams: [emptyExam()] }))} className={softButton}>Entrance Exam Not Needed</button></div></div>}<div className="flex gap-2"><button type="button" onClick={saveCourseDraft} className={primaryButton}>{editingCourseId ? "Update Course" : "Save Course"}</button><button type="button" onClick={resetCourseEditor} className={softButton}>Cancel</button></div></div> : null}{courseDrafts.length > 0 ? <div className="rounded-[1rem] border border-slate-200 bg-slate-50 p-4"><h3 className="text-sm font-bold text-slate-900">Saved Course List</h3><div className="mt-3 space-y-3">{courseDrafts.map((item) => <div key={item.id} className="flex flex-col gap-3 rounded-[1rem] border border-slate-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-semibold text-slate-900">{[item.courseType, item.specialization].filter(Boolean).join(" - ")}</p><p className="mt-1 text-xs text-slate-500">{[item.degreeType, item.stream, item.duration].filter(Boolean).join(" | ")}</p></div><div className="flex gap-2"><button type="button" onClick={() => { setEditingCourseId(item.id); setCourseForm(item); setShowCourseEditor(true); }} className={softButton}>Edit</button><button type="button" onClick={() => { if (item.persisted) { setRemovedCourseIds((prev) => prev.includes(item.id) ? prev : [...prev, item.id]); } setCourseDrafts((prev) => prev.filter((course) => course.id !== item.id)); }} className={softButton}>Remove</button></div></div>)}</div></div> : null}</div> : null}
        </div>
        <datalist id="college-accreditation-options">{COLLEGE_ACCREDITATION_OPTIONS.map((item) => <option key={item} value={item} />)}</datalist>
        <datalist id="course-qualification-options">{qualificationSuggestions.map((item) => <option key={item} value={item} />)}</datalist>
        <div className="mt-5 flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-2 text-xs text-slate-500"><BadgeCheck className="size-4" /><span>Step {step + 1} of {steps.length}</span></div><div className="flex flex-wrap gap-2"><button type="button" onClick={() => setStep((prev) => Math.max(prev - 1, 0))} className={softButton} disabled={step === 0}><ArrowLeft className="size-4" />Previous</button>{step < steps.length - 1 ? <button type="button" onClick={() => setStep((prev) => Math.min(prev + 1, steps.length - 1))} className={softButton}>Next<ArrowRight className="size-4" /></button> : null}<button type="submit" className={primaryButton} disabled={saving}>{saving ? "Saving..." : "Save College"}</button></div></div>
      </form>
    </article>
  );
}

