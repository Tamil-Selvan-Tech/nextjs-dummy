"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Building2,
  ChevronLeft,
  ChevronRight,
  Download,
  Globe,
  GraduationCap,
  ImageIcon,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Send,
  ShieldCheck,
  Sparkles,
  Trophy,
  Wifi,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { formatRankingRangeForDisplay } from "@/lib/ranking-utils";
import type { College, Course } from "@/lib/site-data";
import { EnquiryForm } from "@/components/enquiry-form";
import {
  formatCompactIndianCurrency,
  formatCompactIndianCurrencyRange,
} from "@/lib/currency-format";

type CollegeDetailsViewProps = { college: College; relatedCourses: Course[] };
const tabs = [
  { key: "overview", label: "Overview" },
  { key: "courses", label: "Courses Offered" },
  { key: "fees", label: "Fees Structure" },
  { key: "admission", label: "Admission Process" },
  { key: "career", label: "Career & Campus" },
  { key: "scholarships", label: "Scholarships" },
  { key: "hostel", label: "Hostel Details" },
] as const;
type TabKey = (typeof tabs)[number]["key"];

export function CollegeDetailsView({ college, relatedCourses }: CollegeDetailsViewProps) {
  const router = useRouter();
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const tabSectionRef = useRef<HTMLDivElement | null>(null);
  const hasTabInteractionRef = useRef(false);
  const [expandedCourseKey, setExpandedCourseKey] = useState<string | null>(null);
  const [expandedFeeKey, setExpandedFeeKey] = useState<string | null>(null);
  const [showAllCourses, setShowAllCourses] = useState(false);

  const fees = relatedCourses.map((course) => course.totalFees);
  const cutoffs = relatedCourses.map((course) => course.cutoff);
  const courseCount = relatedCourses.length;
  const courseCategories = [...new Set(relatedCourses.map((course) => course.courseCategory).filter(Boolean))];
  const feesRange = fees.length ? formatCompactIndianCurrencyRange(Math.min(...fees), Math.max(...fees)) : "Not available";
  const cutoffRange = cutoffs.length ? `${Math.min(...cutoffs)} - ${Math.max(...cutoffs)}` : "Not available";
  const websiteUrl =
    college.website?.trim() ||
    `https://www.google.com/search?q=${encodeURIComponent(`${college.name} official website`)}`;
  const mapUrl =
    college.mapUrl?.trim() ||
    college.locationLink?.trim() ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${college.name}, ${college.district}, ${college.state}`)}`;
  const brochureUrl = college.brochurePdfUrl?.trim() || college.brochureUrl?.trim();
  const establishedYear = college.establishedYear?.trim() || "";
  const compactAddressLineOne = [college.address?.trim(), college.city?.trim()]
    .filter(Boolean)
    .join(", ");
  const compactAddressLineTwo = [
    college.district?.trim(),
    college.state?.trim(),
    college.pincode?.trim(),
  ]
    .filter(Boolean)
    .join(", ");
  const contactNumber = college.contactPhone?.trim() || college.alternatePhone?.trim() || "";
  const placementDetails = (college.placements as Record<string, unknown> | undefined) || {};
  const placementRateValue = Number(
    placementDetails.placementRate ?? college.placementRate ?? 0,
  );
  const placementRateDisplay = placementRateValue > 0 ? `${placementRateValue}%` : "Not available";
  const rankingDisplay = String(college.ranking || "")
    .split(/\s*[-–—]+\s*/)
    .map((item) => item.trim())
    .filter(Boolean)
    .join(" - ") || "Not available";

  const normalizedRankingDisplay = String(college.ranking || "")
    .replace(/[\u2013\u2014]/g, "-")
    .split(/\s*-\s*/)
    .map((item) => item.trim())
    .filter(Boolean)
    .join(" - ") || "Not available";
  const rankingCardParts = (() => {
    const normalized = String(college.ranking || "").replace(/[\u2013\u2014]/g, "-");
    const parts = normalized.split("-").map((item) => item.trim());

    return {
      start: parts[0] || "",
      end: parts[1] || "",
    };
  })();
  const fixedRankingDisplay = formatRankingRangeForDisplay(college.ranking);

  const formatMoney = (value?: unknown) => {
    if (typeof value !== "string" && typeof value !== "number") {
      return "Not available";
    }
    const raw = String(value ?? "").trim();
    if (!raw) {
      return "Not available";
    }
    if (typeof value === "string" && /[a-zA-Z]/.test(raw)) {
      return raw;
    }
    const formatted = formatCompactIndianCurrency(value);
    return formatted === "-" ? "Not available" : formatted;
  };
  const escapeHtml = (value: unknown) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const renderCutoffDetails = (course: Course) => {
    if (Array.isArray(course.cutoffByCategory) && course.cutoffByCategory.length > 0) {
      const cutoffItems = course.cutoffByCategory.filter((item) => item.category && item.cutoff);
      if (cutoffItems.length > 0) {
        return (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {cutoffItems.map((item) => (
              <div
                key={`${course.id}-${item.category}`}
                className="grid min-w-0 grid-cols-[2.7rem_auto_minmax(0,1fr)] items-center gap-1 rounded-full border border-[rgba(15,76,129,0.12)] bg-[rgba(15,76,129,0.04)] px-3 py-1.5 text-[11px] font-medium leading-4 text-[color:var(--text-dark)]"
              >
                <span className="shrink-0 font-semibold text-slate-700">{item.category}</span>
                <span className="shrink-0 text-slate-500">:</span>
                <span className="shrink-0 whitespace-nowrap text-slate-600">{item.cutoff}</span>
              </div>
            ))}
          </div>
        );
      }
    }
    return <span>{course.cutoff ? String(course.cutoff) : "-"}</span>;
  };

  const getFeeRangeFromStructure = () => {
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
    return `${formatMoney(min)} - ${formatMoney(max)}`;
  };

  const adminFeeRange = getFeeRangeFromStructure();
  const scholarshipDisplayItems = college.scholarships?.trim()
    ? college.scholarships
        .split(/[,\n\u2022]+/)
        .map((item) => item.trim().replace(/^[^\w(]+/, ""))
        .filter(Boolean)
    : [];

  const groupedCourses = useMemo(() => {
    const groups = new Map<string, Course[]>();
    relatedCourses.forEach((course) => {
      const key = course.courseType || course.course || "Course";
      const list = groups.get(key) || [];
      list.push(course);
      groups.set(key, list);
    });

    return Array.from(groups.entries()).map(([key, courses]) => {
      const totalFees = courses.map((course) => course.totalFees).filter((value) => Number.isFinite(value));
      const minFees = totalFees.length ? Math.min(...totalFees) : null;
      const maxFees = totalFees.length ? Math.max(...totalFees) : null;
      return { key, courses, minFees, maxFees };
    });
  }, [relatedCourses]);

  const getCourseTitle = (course: Course) => {
    const specialization = String(course.specialization || "").trim();
    const baseCourse = String(course.course || "").trim();
    const streamLabel = String(course.stream || course.courseCategory || "").trim();
    const normalizedBaseCourse = streamLabel
      ? baseCourse
          .split(" - ")
          .filter((part) => part.trim().toLowerCase() !== streamLabel.toLowerCase())
          .join(" - ")
          .trim()
      : baseCourse;
    if (specialization && normalizedBaseCourse.toLowerCase().includes(specialization.toLowerCase())) {
      return normalizedBaseCourse;
    }
    return [normalizedBaseCourse, specialization].filter(Boolean).join(" - ");
  };

  const galleryImages = Array.from(
    new Set([college.image, ...(college.images || [])].map((image) => String(image || "").trim()).filter(Boolean)),
  );
  const mainImage = galleryImages[0] || college.image;
  const collageImages = galleryImages.slice(1, 3);
  const remainingImageCount = Math.max(galleryImages.length - 3, 0);
  const activeTabIndex = tabs.findIndex((tab) => tab.key === activeTab);
  const feeMin = fees.length ? Math.min(...fees) : null;
  const feeMax = fees.length ? Math.max(...fees) : null;
  const admissionSteps = college.admissionProcess?.trim()
    ? college.admissionProcess
        .split(/[\n.]+/)
        .map((item) => item.trim().replace(/^[•\-\u2022]+\s*/, ""))
        .filter(Boolean)
    : [
        "Check your preferred course, fees range, and cutoff before shortlisting.",
        "Submit the enquiry form to get counseling support and course matching help.",
        "Review quota options, required marks, and seat availability with the team.",
        "Complete the college application and document verification based on the chosen course.",
      ];
  const hostelDetails = (college.hostelDetails as Record<string, unknown> | undefined) || {};
  const hostelAvailability =
    String(hostelDetails.availability || "").trim().toLowerCase() === "available";
  const hasHostel = college.hasHostel || hostelAvailability;
  const hostelFees =
    (hostelDetails.hostelFees as Record<string, unknown> | undefined) ||
    (hostelDetails.feesStructure as Record<string, unknown> | undefined) ||
    {};
  const hostelFeeMin = hostelFees.minAmount ?? hostelFees.min ?? "";
  const hostelFeeMax = hostelFees.maxAmount ?? hostelFees.max ?? "";
  const hostelFacilitySource = Array.isArray(hostelDetails.facilityOptions)
    ? hostelDetails.facilityOptions
    : Array.isArray(hostelDetails.facilities)
      ? hostelDetails.facilities
      : [];
  const hostelFacilityOptions = hostelFacilitySource
    .map((item) => String(item || "").trim())
    .filter(Boolean);
  const hostelMetaItems = [
    { label: "General Info", value: String(hostelDetails.rules || "").trim() || "Not available" },
    { label: "Hostel Type", value: String(hostelDetails.hostelType || "").trim() || "Not available" },
    {
      label: "Hostel Fees Structure",
      value: `${formatMoney(hostelFeeMin)} - ${formatMoney(hostelFeeMax)}`,
    },
    { label: "CCTV Availability", value: String(hostelDetails.cctvAvailable || "").trim() || "Not available" },
    { label: "Facilities", value: hostelFacilityOptions.length ? hostelFacilityOptions.join(", ") : "Not available" },
  ];
  const scholarshipItems = college.scholarships?.trim()
    ? college.scholarships
        .split(/[•\n]+/)
        .map((item) => item.trim())
        .filter(Boolean)
    : [];
  const reviewItems = college.reviews?.trim()
    ? college.reviews
        .split(/[.\n]+/)
        .map((item) => item.trim().replace(/^[â€¢•\-\u2022]+\s*/, ""))
        .filter(Boolean)
    : [];
  const overviewDetailItems = [
    { label: "Ownership Type", value: college.ownershipType?.trim() || "Not available" },
    { label: "University / Affiliation", value: college.university?.trim() || "Not available" },
    { label: "Country", value: college.country?.trim() || "Not available" },
    { label: "State", value: college.state?.trim() || "Not available" },
    { label: "City", value: college.city?.trim() || "Not available" },
    { label: "District", value: college.district?.trim() || "Not available" },
    { label: "Address", value: college.address?.trim() || "Not available" },
    { label: "Pincode", value: college.pincode?.trim() || "Not available" },
    { label: "Website", value: college.website?.trim() || "Not available" },
    { label: "Map Link", value: college.locationLink?.trim() || college.mapUrl?.trim() || "Not available" },
  ];
  const downloadBrochure = () => {
    if (brochureUrl) {
      window.open(brochureUrl, "_blank", "noopener,noreferrer");
      return;
    }

    const courseRows = relatedCourses
      .map(
        (course) => `
          <tr>
            <td>${escapeHtml(getCourseTitle(course))}</td>
            <td>${escapeHtml(course.duration || "-")}</td>
            <td>${escapeHtml(formatCompactIndianCurrency(course.totalFees))}</td>
            <td>${escapeHtml(course.cutoff ? String(course.cutoff) : "-")}</td>
          </tr>`,
      )
      .join("");

    const printWindow = window.open("", "_blank", "noopener,noreferrer,width=1100,height=850");
    if (!printWindow) return;

    const printableHtml = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>${escapeHtml(college.name)} - Print</title>
          <style>
            :root {
              color-scheme: light;
            }
            * {
              box-sizing: border-box;
            }
            body {
              margin: 0;
              padding: 32px;
              font-family: Arial, sans-serif;
              color: #0f172a;
              background: #ffffff;
            }
            .sheet {
              max-width: 980px;
              margin: 0 auto;
            }
            .hero {
              border: 1px solid #cbd5e1;
              border-radius: 20px;
              padding: 24px;
              background: linear-gradient(180deg, #f8fbff 0%, #ffffff 100%);
            }
            .eyebrow {
              display: inline-block;
              margin-bottom: 10px;
              font-size: 11px;
              font-weight: 700;
              letter-spacing: 0.16em;
              text-transform: uppercase;
              color: #0f4c81;
            }
            h1 {
              margin: 0;
              font-size: 30px;
              line-height: 1.2;
            }
            .subhead {
              margin: 8px 0 0;
              font-size: 15px;
              color: #475569;
            }
            .meta-grid {
              display: grid;
              grid-template-columns: repeat(2, minmax(0, 1fr));
              gap: 14px;
              margin-top: 22px;
            }
            .meta-card {
              border: 1px solid #dbe4ef;
              border-radius: 16px;
              padding: 14px 16px;
              background: #fff;
            }
            .label {
              font-size: 11px;
              font-weight: 700;
              letter-spacing: 0.12em;
              text-transform: uppercase;
              color: #64748b;
            }
            .value {
              margin-top: 6px;
              font-size: 15px;
              font-weight: 700;
              color: #0f172a;
            }
            .section {
              margin-top: 24px;
              border: 1px solid #dbe4ef;
              border-radius: 20px;
              padding: 20px 22px;
            }
            .section h2 {
              margin: 0 0 12px;
              font-size: 20px;
            }
            .section p {
              margin: 0;
              line-height: 1.7;
              color: #334155;
            }
            .chips {
              display: flex;
              flex-wrap: wrap;
              gap: 8px;
              margin-top: 12px;
            }
            .chip {
              border: 1px solid #dbe4ef;
              border-radius: 999px;
              padding: 6px 12px;
              font-size: 12px;
              font-weight: 700;
              color: #0f4c81;
              background: #f8fbff;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 12px;
            }
            th, td {
              border-bottom: 1px solid #e2e8f0;
              padding: 12px 10px;
              text-align: left;
              vertical-align: top;
              font-size: 14px;
            }
            th {
              font-size: 11px;
              letter-spacing: 0.12em;
              text-transform: uppercase;
              color: #64748b;
            }
            @media print {
              body {
                padding: 0;
              }
              .sheet {
                max-width: none;
              }
              .hero, .section {
                break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="sheet">
            <section class="hero">
              <div class="eyebrow">College Profile</div>
              <h1>${escapeHtml(college.name)}</h1>
              <p class="subhead">${escapeHtml(college.university || "University details not available")}</p>
              <div class="meta-grid">
                <div class="meta-card">
                  <div class="label">Location</div>
                  <div class="value">${escapeHtml([college.district, college.state].filter(Boolean).join(", ") || "Not available")}</div>
                </div>
                <div class="meta-card">
                  <div class="label">Ranking</div>
                  <div class="value">${escapeHtml(fixedRankingDisplay)}</div>
                </div>
                <div class="meta-card">
                  <div class="label">Placement Rate</div>
                  <div class="value">${escapeHtml(placementRateDisplay)}</div>
                </div>
                <div class="meta-card">
                  <div class="label">Fees Range</div>
                  <div class="value">${escapeHtml(adminFeeRange || feesRange)}</div>
                </div>
              </div>
            </section>

            <section class="section">
              <h2>About</h2>
              <p>${escapeHtml(college.description || "No description available.")}</p>
            </section>

            <section class="section">
              <h2>Contact & Campus Details</h2>
              <div class="meta-grid">
                <div class="meta-card">
                  <div class="label">Official Email</div>
                  <div class="value">${escapeHtml(college.contactEmail || "Not available")}</div>
                </div>
                <div class="meta-card">
                  <div class="label">Phone</div>
                  <div class="value">${escapeHtml(contactNumber || "Not available")}</div>
                </div>
                <div class="meta-card">
                  <div class="label">Address</div>
                  <div class="value">${escapeHtml([compactAddressLineOne, compactAddressLineTwo].filter(Boolean).join(", ") || "Not available")}</div>
                </div>
                <div class="meta-card">
                  <div class="label">Hostel</div>
                  <div class="value">${escapeHtml(hasHostel ? "Available" : "Not available")}</div>
                </div>
              </div>
              <div class="chips">
                ${(college.facilities || []).map((item) => `<span class="chip">${escapeHtml(item)}</span>`).join("") || '<span class="chip">Facilities not available</span>'}
              </div>
            </section>

            <section class="section">
              <h2>Courses Offered</h2>
              <table>
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Duration</th>
                    <th>Total Fees</th>
                    <th>Cutoff</th>
                  </tr>
                </thead>
                <tbody>
                  ${courseRows || '<tr><td colspan="4">No course details available.</td></tr>'}
                </tbody>
              </table>
            </section>
          </div>
          <script>
            window.addEventListener('load', function () {
              window.print();
            });
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(printableHtml);
    printWindow.document.close();
  };

  const topInfoCards = [
    { label: "Ranking", value: fixedRankingDisplay, icon: Trophy },
    { label: "Placement", value: placementRateDisplay, icon: BadgeCheck },
    { label: "Courses", value: String(courseCount), icon: BookOpen },
    { label: "Application Mode", value: college.applicationMode?.trim() || "Not available", icon: BadgeCheck },
    { label: "Hostel", value: hasHostel ? "Available" : "No", icon: Building2 },
    { label: "Accreditation", value: college.accreditation, icon: ShieldCheck },
  ];
  const topInfoCardMobileOrder: Record<string, string> = {
    Placement: "order-1 sm:order-none",
    Accreditation: "order-2 sm:order-none",
    Ranking: "order-3 sm:order-none",
    Courses: "order-4 sm:order-none",
    "Application Mode": "order-5 sm:order-none",
    Hostel: "order-6 sm:order-none",
  };

  const openGallery = (index: number) => {
    setActiveGalleryIndex(index);
    setIsGalleryOpen(true);
  };

  const closeGallery = () => setIsGalleryOpen(false);

  const showPreviousImage = () => {
    if (!galleryImages.length) return;
    setActiveGalleryIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const showNextImage = () => {
    if (!galleryImages.length) return;
    setActiveGalleryIndex((prev) => (prev + 1) % galleryImages.length);
  };

  useEffect(() => {
    const hasActiveOverlay =
      isGalleryOpen || Boolean(expandedCourseKey) || Boolean(expandedFeeKey);
    if (!hasActiveOverlay) return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [expandedCourseKey, expandedFeeKey, isGalleryOpen]);

  useEffect(() => {
    if (!isGalleryOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeGallery();
        return;
      }

      if (!galleryImages.length) return;

      if (event.key === "ArrowLeft") {
        setActiveGalleryIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
      }

      if (event.key === "ArrowRight") {
        setActiveGalleryIndex((prev) => (prev + 1) % galleryImages.length);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [galleryImages.length, isGalleryOpen]);

  useEffect(() => {
    if (!hasTabInteractionRef.current) return;
    if (!tabSectionRef.current) return;

    const frameId = window.requestAnimationFrame(() => {
      const navOffset = 0;
      const top =
        tabSectionRef.current!.getBoundingClientRect().top + window.scrollY - navOffset;

      window.scrollTo({
        top: Math.max(top, 0),
        behavior: "smooth",
      });
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [activeTab]);

  return (
    <section className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#eef4fb_0%,#e7eef8_100%)] text-[color:var(--text-dark)]">
      <div className="absolute inset-0">
        <div className="absolute left-[-4rem] top-12 h-56 w-56 rounded-full bg-[rgba(60,126,182,0.1)] blur-3xl" />
        <div className="absolute right-[-3rem] top-24 h-48 w-48 rounded-full bg-[rgba(255,138,61,0.12)] blur-3xl" />
      </div>

      <div className="relative z-10">
        <Navbar />
        <div className="page-container-full px-3 py-5 sm:px-6 md:py-10">
          <div className="mx-auto w-full overflow-hidden rounded-[1.8rem] border border-[rgba(15,76,129,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(243,248,255,0.98))] shadow-[0_22px_48px_rgba(22,50,79,0.1)]">
            <div className="grid border-b border-[rgba(15,76,129,0.08)] lg:grid-cols-[1.08fr_0.92fr]">
              <div className="order-2 relative overflow-hidden bg-[linear-gradient(180deg,#d8e7f4_0%,#edf4fb_100%)] p-4 md:p-5 lg:order-1">
                <div className="absolute left-6 top-6 z-10 h-20 w-20 rounded-full bg-[rgba(255,255,255,0.24)] blur-2xl" />
                <div className="absolute bottom-6 right-6 z-10 h-24 w-24 rounded-full bg-[rgba(255,138,61,0.18)] blur-3xl" />
                <div className="relative rounded-[1.5rem] border border-[rgba(255,255,255,0.55)] bg-white/30 p-3 shadow-[0_20px_40px_rgba(22,50,79,0.1)] backdrop-blur-sm">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex rounded-full bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--brand-primary)]">
                        {college.isBestCollege ? "Best College" : "Featured College"}
                      </span>
                      <span className="rounded-full bg-[rgba(15,76,129,0.08)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--brand-primary)]">
                        {courseCount} course options
                      </span>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-[rgba(15,76,129,0.08)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--brand-primary)]">
                      <ImageIcon className="size-3.5" />
                      Campus View
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => openGallery(0)}
                    className="group relative block h-44 w-full overflow-hidden sm:h-52 rounded-[1.25rem] border border-white/60"
                  >
                    <img
                      src={mainImage}
                      alt={`${college.name} primary view`}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,20,38,0.04),rgba(7,20,38,0.46))]" />
                  </button>

                  <div className={`mt-3 grid gap-3 ${collageImages.length > 1 ? "sm:grid-cols-2" : "sm:grid-cols-1"}`}>
                    {collageImages.length ? collageImages.map((image, index) => {
                      const imageIndex = index + 1;
                      const isLastVisibleCard = imageIndex === 2;
                      const showMoreOverlay = isLastVisibleCard && remainingImageCount > 0;
                      return (
                      <button
                        key={`${image}-${imageIndex}`}
                        type="button"
                        onClick={() => openGallery(imageIndex)}
                        className={`group relative overflow-hidden rounded-[1.15rem] border transition ${
                          activeGalleryIndex === imageIndex
                            ? "border-[rgba(15,76,129,0.32)] shadow-[0_14px_28px_rgba(22,50,79,0.12)]"
                            : "border-white/65 hover:border-[rgba(15,76,129,0.22)]"
                        }`}
                      >
                        <div className={`overflow-hidden ${collageImages.length === 1 ? "h-40" : "h-36"}`}>
                          <img
                            src={image}
                            alt={`${college.name} collage view ${imageIndex + 1}`}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                          <div
                            className={`absolute inset-0 ${
                              showMoreOverlay
                                ? "bg-[linear-gradient(180deg,rgba(7,20,38,0.14),rgba(7,20,38,0.72))]"
                                : "bg-[linear-gradient(180deg,rgba(7,20,38,0.03),rgba(7,20,38,0.32))]"
                            }`}
                          />
                          {showMoreOverlay ? (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="rounded-full border border-white/20 bg-black/35 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm">
                                +{remainingImageCount} more images
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </button>
                    );
                    }) : (
                      <button
                        type="button"
                        onClick={() => openGallery(0)}
                        className="group relative overflow-hidden rounded-[1.15rem] border border-white/65 transition hover:border-[rgba(15,76,129,0.22)]"
                      >
                        <div className="h-40 overflow-hidden">
                          <img
                            src={mainImage}
                            alt={`${college.name} additional campus view`}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,20,38,0.03),rgba(7,20,38,0.28))]" />
                        </div>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="order-1 relative flex overflow-hidden bg-[linear-gradient(180deg,#f9fbff_0%,#eef5fc_100%)] p-5 md:p-7 lg:order-2">
                <div className="absolute right-[-3rem] top-[-2rem] h-32 w-32 rounded-full bg-[rgba(255,138,61,0.14)] blur-3xl" />
                <div className="absolute bottom-[-2rem] left-[-2rem] h-32 w-32 rounded-full bg-[rgba(60,126,182,0.12)] blur-3xl" />
                <div className="relative flex w-full flex-1 flex-col">
                  <div className="flex items-center gap-4 rounded-[1.35rem] border border-[rgba(15,76,129,0.08)] bg-white/92 p-4 shadow-[0_12px_24px_rgba(22,50,79,0.05)]">
                    {college.logo ? (
                      <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.98),rgba(231,240,250,0.96))] shadow-[0_16px_28px_rgba(22,50,79,0.15)] ring-1 ring-[rgba(255,255,255,0.88)] sm:h-24 sm:w-24">
                        <div className="absolute inset-[-0.4rem] rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.18),rgba(255,255,255,0))] blur-md" />
                        <div className="absolute inset-[0.3rem] rounded-full border border-[rgba(37,99,235,0.16)] bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]" />
                        <img
                          src={college.logo}
                          alt={`${college.name} logo`}
                          className="relative z-10 h-[72%] w-[72%] object-contain sm:h-[74%] sm:w-[74%]"
                        />
                      </div>
                    ) : (
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--brand-primary),var(--brand-primary-soft))] text-xl font-bold uppercase text-white shadow-[0_16px_26px_rgba(22,50,79,0.18)] sm:h-24 sm:w-24">
                        {college.name
                          .split(" ")
                          .slice(0, 2)
                          .map((part) => part[0])
                          .join("")
                          .slice(0, 2)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
                        College Profile
                      </p>
<h2 className="mt-1 text-base font-bold leading-6 text-[color:var(--text-dark)] sm:text-lg md:text-[1.35rem]">
                          {college.name}
                      </h2>
                      <p className="mt-1 text-sm text-[color:var(--text-muted)]">{college.university}</p>
                      {establishedYear ? (
                        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--brand-primary)]">
                          Established {establishedYear}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:gap-3">
                    {topInfoCards.map((item) => {
                      const Icon = item.icon;
                      return (
                        <article
                          key={item.label}
                          className={`${topInfoCardMobileOrder[item.label] || ""} rounded-[1rem] border border-[rgba(15,76,129,0.08)] bg-white/95 p-2.5 shadow-[0_12px_24px_rgba(22,50,79,0.05)] sm:rounded-[1.15rem] sm:p-4`}
                        >
                          <div className="flex flex-col items-center gap-2 text-center sm:gap-3">
                            <div className="rounded-[0.9rem] bg-[rgba(15,76,129,0.08)] p-2 text-[color:var(--brand-primary)] sm:rounded-[1rem] sm:p-2.5">
                              <Icon className="size-[13px] sm:size-[15px]" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[8px] font-semibold uppercase tracking-[0.12em] text-[color:var(--text-muted)] sm:text-[9px] sm:tracking-[0.16em]">
                                {item.label}
                              </p>
                              {Array.isArray(item.value) ? (
                                <div className="mt-1 space-y-0.5 text-[13px] font-bold leading-5 text-[color:var(--text-dark)] md:text-[14px]">
                                  {item.value.map((line) => (
                                    <p key={line}>{line}</p>
                                  ))}
                                </div>
                              ) : (
                                <p className="mt-1 break-words text-[11px] font-bold leading-4 text-[color:var(--text-dark)] sm:text-[13px] sm:leading-5 md:text-[14px]">
                                  {item.value}
                                </p>
                              )}
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>

                  <div className="mt-auto pt-4">
                  <div className="grid grid-cols-[0.95fr_0.75fr_1.3fr] gap-2 md:flex md:flex-wrap md:items-center md:gap-3">
                    <a href={websiteUrl} target="_blank" rel="noreferrer" className="inline-flex min-w-0 items-center justify-center gap-1.5 rounded-full border border-[rgba(15,76,129,0.12)] bg-white px-2.5 py-2.5 text-[11px] font-semibold leading-4 text-[color:var(--brand-primary)] transition hover:-translate-y-0.5 hover:bg-[rgba(15,76,129,0.04)] sm:gap-2 sm:px-4 sm:py-3 sm:text-sm md:w-auto md:min-w-[7.75rem] md:flex-none md:px-3.5">
                      <Globe className="size-3.5 sm:size-4" />
                      Website
                    </a>
                    <a href={mapUrl} target="_blank" rel="noreferrer" className="inline-flex min-w-0 items-center justify-center gap-1.5 rounded-full border border-[rgba(15,76,129,0.12)] bg-white px-2.5 py-2.5 text-[11px] font-semibold leading-4 text-[color:var(--brand-primary)] transition hover:-translate-y-0.5 hover:bg-[rgba(15,76,129,0.04)] sm:gap-2 sm:px-4 sm:py-3 sm:text-sm md:w-auto md:min-w-[6.75rem] md:flex-none md:px-3.5">
                      <MapPin className="size-3.5 sm:size-4" />
                      Map
                    </a>
                    <button type="button" onClick={() => router.push(`/compare?college=${encodeURIComponent(college.id)}`)} className="inline-flex min-w-0 items-center justify-center gap-1.5 rounded-full border border-[rgba(255,138,61,0.18)] bg-[rgba(255,138,61,0.08)] px-2.5 py-2.5 text-[11px] font-semibold leading-4 text-[color:var(--brand-accent-deep)] transition hover:-translate-y-0.5 hover:bg-[rgba(255,138,61,0.12)] sm:gap-2 sm:px-5 sm:py-3 sm:text-sm md:flex-1">
                      Compare College
                      <ArrowRight className="size-3.5 sm:size-4" />
                    </button>
                  </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-6 p-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.82fr)] lg:items-start md:p-7">
              <div className="space-y-6">
                <section className="rounded-[1.55rem] border border-[rgba(15,76,129,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(245,249,255,0.95))] p-5 shadow-[0_16px_34px_rgba(22,50,79,0.06)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(22,50,79,0.09)] md:p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--brand-primary)] text-white shadow-[0_10px_20px_rgba(22,50,79,0.25)]">
                    <BookOpen className="size-5" />
                  </div>
                  <h2 className="text-xl font-bold text-[color:var(--text-dark)] md:text-2xl">About</h2>
                </div>
                <p className="mt-4 text-sm leading-6 text-[color:var(--text-muted)] md:text-[15px]">{college.description}</p>
                </section>

                <section className="rounded-[1.55rem] border border-[rgba(15,76,129,0.08)] bg-white p-5 shadow-[0_16px_34px_rgba(22,50,79,0.06)] md:p-6">
                  <div className="rounded-[1.15rem] border border-[rgba(255,138,61,0.14)] bg-[linear-gradient(180deg,rgba(255,245,236,0.72),rgba(255,255,255,0.98))] p-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[rgba(255,138,61,0.14)] text-[color:var(--brand-accent-deep)]">
                        <MessageCircle className="size-4" />
                      </div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--text-muted)]">Reviews</p>
                    </div>
                    <div className="mt-3 space-y-2.5">
                      {reviewItems.length ? (
                        reviewItems.map((item, index) => (
                          <div
                            key={`${college.id || college.name}-review-${index}`}
                            className="flex items-start gap-2.5 rounded-[1rem] border border-[rgba(255,138,61,0.14)] bg-white px-3.5 py-3"
                          >
                            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[rgba(255,138,61,0.14)] text-[color:var(--brand-accent-deep)]">
                              <Sparkles className="size-3.5" />
                            </div>
                            <p className="text-sm leading-6 text-[color:var(--text-dark)]">{item}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm leading-6 text-[color:var(--text-muted)]">Reviews not available</p>
                      )}
                    </div>
                  </div>
                </section>

                <section className="rounded-[1.55rem] border border-[rgba(15,76,129,0.08)] bg-white p-5 shadow-[0_16px_34px_rgba(22,50,79,0.06)] md:p-6">
                  <div className="rounded-[1.15rem] border border-[rgba(15,76,129,0.08)] bg-[rgba(15,76,129,0.03)] p-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[rgba(15,76,129,0.12)] text-[color:var(--brand-primary)]">
                        <MapPin className="size-4" />
                      </div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--text-muted)]">Address</p>
                    </div>
                    <p className="mt-2 text-sm leading-7 text-[color:var(--text-dark)]">{compactAddressLineOne || "Not available"}</p>
                    {compactAddressLineTwo ? (
                      <p className="text-sm leading-7 text-[color:var(--text-dark)]">{compactAddressLineTwo}</p>
                    ) : null}
                  </div>
                </section>
              </div>

              <aside className="lg:sticky lg:top-24">
                <div className="rounded-[1.55rem] border border-[rgba(15,76,129,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(243,248,255,0.97))] p-5 shadow-[0_18px_38px_rgba(22,50,79,0.08)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_44px_rgba(22,50,79,0.11)] md:p-6">
                  <div className="inline-flex items-center gap-2 rounded-full bg-[rgba(15,76,129,0.06)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--brand-primary)]"><ShieldCheck className="size-3.5" />Quick Contact</div>
                  <div className="mt-4 flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-bold text-[color:var(--text-dark)] md:text-[1.35rem]">Campus Highlights</h2>
                      <p className="mt-2 max-w-sm text-sm leading-6 text-[color:var(--text-muted)]">
                        Explore smarter, shortlist faster, and move closer to the right campus fit.
                      </p>
                    </div>
                    <div className="rounded-[1.1rem] bg-[rgba(255,138,61,0.1)] p-3 text-[color:var(--brand-accent-deep)]">
                      <Sparkles className="size-5" />
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                    <article className="rounded-[1.15rem] border border-[rgba(15,76,129,0.08)] bg-white px-4 py-3.5 shadow-[0_10px_24px_rgba(22,50,79,0.04)]">
                      <div className="flex items-start gap-3">
                        <div className="rounded-xl bg-[rgba(255,138,61,0.12)] p-2.5 text-[color:var(--brand-accent-deep)]">
                          <BookOpen className="size-4" />
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">Campus Focus</p>
                          <p className="mt-1 text-sm font-semibold leading-6 text-[color:var(--text-dark)]">{courseCategories.join(", ") || "Multi Stream"}</p>
                        </div>
                      </div>
                    </article>
                    <article className="rounded-[1.15rem] border border-[rgba(15,76,129,0.08)] bg-white px-4 py-3.5 shadow-[0_10px_24px_rgba(22,50,79,0.04)]">
                      <div className="flex items-start gap-3">
                        <div className="rounded-xl bg-[rgba(15,76,129,0.08)] p-2.5 text-[color:var(--brand-primary)]">
                          <Mail className="size-4" />
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">Official Email</p>
                          <p className="mt-1 break-all text-sm font-semibold leading-6 text-[color:var(--text-dark)]">{college.contactEmail || "Not available"}</p>
                        </div>
                      </div>
                    </article>
                    <article className="rounded-[1.15rem] border border-[rgba(15,76,129,0.08)] bg-white px-4 py-3.5 shadow-[0_10px_24px_rgba(22,50,79,0.04)]">
                      <div className="flex items-start gap-3">
                        <div className="rounded-xl bg-[rgba(15,76,129,0.08)] p-2.5 text-[color:var(--brand-primary)]">
                          <Phone className="size-4" />
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">Mobile Number</p>
                          <p className="mt-1 text-sm font-semibold leading-6 text-[color:var(--text-dark)]">{contactNumber || "Not available"}</p>
                        </div>
                      </div>
                    </article>
                    <article className="rounded-[1.15rem] border border-[rgba(15,76,129,0.08)] bg-white px-4 py-3.5 shadow-[0_10px_24px_rgba(22,50,79,0.04)]">
                      <div className="flex items-start gap-3">
                        <div className="rounded-xl bg-[rgba(15,76,129,0.08)] p-2.5 text-[color:var(--brand-primary)]">
                          <Phone className="size-4" />
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">Alternate Phone</p>
                          <p className="mt-1 text-sm font-semibold leading-6 text-[color:var(--text-dark)]">{college.alternatePhone?.trim() || "Not available"}</p>
                        </div>
                      </div>
                    </article>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEnquiryOpen(true)}
                    className="shine-button mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[color:var(--brand-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[color:var(--brand-primary-soft)]"
                  >
                    <Send className="size-4" />
                    Enquiry Now
                  </button>
                  <div className="mt-3 inline-flex items-center gap-2 text-xs text-[color:var(--text-muted)]"><Mail className="size-4 text-[color:var(--brand-primary)]" />Login required for submission</div>
                  {college.awardsRecognitions?.trim() ? (
                    <div className="mt-4 rounded-[1.15rem] border border-[rgba(15,76,129,0.12)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(245,249,255,0.98))] px-4 py-4 shadow-[0_12px_26px_rgba(22,50,79,0.06)]">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--brand-primary)] text-white shadow-[0_8px_18px_rgba(22,50,79,0.2)]">
                          <Trophy className="size-4" />
                        </div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">Awards & Recognitions</p>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-[color:var(--text-dark)]">
                        {college.awardsRecognitions}
                      </p>
                    </div>
                  ) : null}
                </div>
              </aside>
            </div>

            <div
              ref={tabSectionRef}
              className="border-t border-[rgba(15,76,129,0.08)] bg-[linear-gradient(180deg,rgba(248,251,255,0.96),rgba(239,246,253,0.96))] px-5 py-6 md:px-7 md:py-7"
            >
              <div className="rounded-[1.35rem] border border-[rgba(15,76,129,0.08)] bg-white/80 px-4 pt-4 shadow-[0_10px_22px_rgba(22,50,79,0.04)] md:px-5">
                <div className="flex gap-4 overflow-x-auto pb-3 whitespace-nowrap">
                  {tabs.map((tab) => (
                    <button key={tab.key} type="button" onClick={() => {
                      hasTabInteractionRef.current = true;
                      setActiveTab(tab.key);
                    }} className={`border-b-2 pb-2 text-sm font-semibold transition ${activeTab === tab.key ? "border-[color:var(--brand-primary)] text-[color:var(--brand-primary)]" : "border-transparent text-[color:var(--text-muted)] hover:text-[color:var(--text-dark)]"}`}>
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-sm">
                <button type="button" onClick={() => {
                  if (activeTabIndex > 0) {
                    hasTabInteractionRef.current = true;
                    setActiveTab(tabs[activeTabIndex - 1].key);
                  }
                }} disabled={activeTabIndex <= 0} className="rounded-full border border-[rgba(15,76,129,0.1)] bg-white px-4 py-2 font-medium text-[color:var(--brand-primary)] transition hover:bg-[rgba(15,76,129,0.04)] disabled:cursor-not-allowed disabled:opacity-40"><span className="inline-flex items-center gap-2"><ChevronLeft className="size-4" />Previous Tab</span></button>
                <button type="button" onClick={() => {
                  if (activeTabIndex < tabs.length - 1) {
                    hasTabInteractionRef.current = true;
                    setActiveTab(tabs[activeTabIndex + 1].key);
                  }
                }} disabled={activeTabIndex >= tabs.length - 1} className="rounded-full border border-[rgba(15,76,129,0.1)] bg-white px-4 py-2 font-medium text-[color:var(--brand-primary)] transition hover:bg-[rgba(15,76,129,0.04)] disabled:cursor-not-allowed disabled:opacity-40"><span className="inline-flex items-center gap-2">Next Tab<ChevronRight className="size-4" /></span></button>
              </div>

              {activeTab === "overview" ? (
                <div className="mt-6 space-y-4">
                  <div className="grid gap-4 lg:grid-cols-1">
                    <div className="grid gap-4 md:grid-cols-3">
                      <article className="rounded-[1.4rem] border border-[rgba(15,76,129,0.08)] bg-white p-5 shadow-[0_14px_30px_rgba(22,50,79,0.05)]">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="size-4 text-[color:var(--brand-primary)]" />
                          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--text-dark)]">Facilities</h3>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {college.facilities.length ? (
                            college.facilities.map((facility) => (
                              <span key={facility} className="rounded-full bg-[rgba(15,76,129,0.06)] px-3 py-1 text-xs font-semibold text-[color:var(--brand-primary)]">
                                {facility}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-[color:var(--text-muted)]">Facilities not available</span>
                          )}
                        </div>
                      </article>

                      <article className="rounded-[1.4rem] border border-[rgba(15,76,129,0.08)] bg-white p-5 shadow-[0_14px_30px_rgba(22,50,79,0.05)]">
                        <div className="flex items-center gap-2">
                          <BadgeCheck className="size-4 text-[color:var(--brand-accent-deep)]" />
                          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--text-dark)]">Admission Quotas</h3>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {college.quotas.length ? (
                            college.quotas.map((quota) => (
                              <span key={quota} className="rounded-full bg-[rgba(255,138,61,0.1)] px-3 py-1 text-xs font-semibold text-[color:var(--brand-accent-deep)]">
                                {quota}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-[color:var(--text-muted)]">Admission quotas not available</span>
                          )}
                        </div>
                      </article>

                      <article className="rounded-[1.4rem] border border-[rgba(15,76,129,0.08)] bg-white p-5 shadow-[0_14px_30px_rgba(22,50,79,0.05)]">
                        <div className="flex items-center gap-2">
                          <BookOpen className="size-4 text-[color:var(--brand-primary)]" />
                          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--text-dark)]">Streams</h3>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {college.streams.length ? (
                            college.streams.map((stream) => (
                              <span key={stream} className="rounded-full border border-[rgba(15,76,129,0.08)] bg-white px-3 py-1 text-xs font-semibold text-[color:var(--text-dark)]">
                                {stream}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-[color:var(--text-muted)]">Streams not available</span>
                          )}
                        </div>
                      </article>
                    </div>
                  </div>
                </div>
              ) : null}

              {activeTab === "courses" ? (
                <div className="mt-6 space-y-4">
                  <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-[color:var(--text-dark)] md:text-2xl">Courses Offered</h2>
                      <p className="mt-1 text-sm text-[color:var(--text-muted)]">{courseCount} course options available across {courseCategories.join(", ") || "different categories"}.</p>
                    </div>
                  </div>
                  <div className="overflow-hidden rounded-[1.55rem] border border-[rgba(15,76,129,0.08)] bg-white shadow-[0_16px_34px_rgba(22,50,79,0.06)]">
                    <div className="border-b border-[rgba(15,76,129,0.08)] bg-[rgba(15,76,129,0.03)] px-4 py-2 text-[11px] font-medium text-[color:var(--text-muted)] md:hidden ">
                      Scroll horizontally to compare course details.
                    </div>
                    <div className="responsive-data-table ">
                    <div className="grid grid-cols-[minmax(260px,2fr)_minmax(150px,0.85fr)_minmax(140px,0.6fr)] gap-0 border-b border-[rgba(15,76,129,0.12)] bg-[rgba(15,76,129,0.04)] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--brand-primary)]">
                      <div>Course</div>
                      <div className="w-full justify-self-center text-center">Total Fees</div>
                      <div className="text-right">Details</div>
                    </div>

                    {(showAllCourses ? groupedCourses : groupedCourses.slice(0, 10)).map((group) => {
                      const totalFeesText =
                        group.minFees !== null
                          ? formatCompactIndianCurrencyRange(group.minFees, group.maxFees)
                          : adminFeeRange || "Not available";
                      return (
                        <div key={group.key} className="border-b border-[rgba(15,76,129,0.08)] last:border-b-0">
                          <button
                            type="button"
                            onClick={() => setExpandedCourseKey(group.key)}
                            className="grid w-full grid-cols-[minmax(260px,2fr)_minmax(150px,0.85fr)_minmax(140px,0.6fr)] items-center gap-0 px-4 py-4 text-left hover:bg-[rgba(15,76,129,0.03)]"
                          >
                            <div>
                              <p className="text-base font-semibold text-[color:var(--text-dark)]">{group.key}</p>
                              <span
                                className="mt-2 inline-flex rounded-full bg-[rgba(255,138,61,0.16)] px-3 py-1 text-xs font-semibold text-[color:var(--brand-accent-deep)]"
                              >
                                {group.courses.length} Courses
                              </span>
                            </div>
                            <div className="w-full justify-self-center text-center text-sm font-semibold text-[color:var(--brand-primary)]">
                              {totalFeesText}
                            </div>
                            <div className="text-right text-sm font-semibold text-[color:var(--brand-primary)]">
                              <span className="underline underline-offset-4">
                                Check Details
                              </span>
                            </div>
                          </button>
                        </div>
                      );
                    })}
                    </div>
                  </div>
                  {groupedCourses.length > 10 ? (
                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={() => setShowAllCourses((prev) => !prev)}
                        className="inline-flex items-center gap-2 rounded-full border border-[rgba(15,76,129,0.18)] bg-[linear-gradient(135deg,rgba(15,76,129,0.12),rgba(56,189,248,0.12))] px-6 py-2.5 text-sm font-semibold text-[color:var(--brand-primary)] shadow-[0_12px_26px_rgba(22,50,79,0.12)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_34px_rgba(22,50,79,0.18)]"
                      >
                        {showAllCourses ? "View Less" : "View More"}
                        <ChevronRight className={`size-4 transition ${showAllCourses ? "rotate-[-90deg]" : "rotate-90"}`} />
                      </button>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {activeTab === "career" ? (
                <div className="mt-6 space-y-4">
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <article className="rounded-[1.4rem] border border-[rgba(15,76,129,0.08)] bg-white p-5 shadow-[0_14px_30px_rgba(22,50,79,0.05)]"><p className="text-xs uppercase tracking-[0.18em] text-[color:var(--text-muted)]">Placement Rate</p><p className="mt-2 text-xl font-bold text-[color:var(--brand-primary)]">{placementRateDisplay}</p></article>
                    <article className="rounded-[1.4rem] border border-[rgba(15,76,129,0.08)] bg-white p-5 shadow-[0_14px_30px_rgba(22,50,79,0.05)]"><p className="text-xs uppercase tracking-[0.18em] text-[color:var(--text-muted)]">Highest Package</p><p className="mt-2 text-lg font-bold text-[color:var(--brand-primary)]">{formatMoney((college.placements as Record<string, unknown> | undefined)?.highestPackage)}</p></article>
                    <article className="rounded-[1.4rem] border border-[rgba(15,76,129,0.08)] bg-white p-5 shadow-[0_14px_30px_rgba(22,50,79,0.05)]"><p className="text-xs uppercase tracking-[0.18em] text-[color:var(--text-muted)]">Average Package</p><p className="mt-2 text-lg font-bold text-[color:var(--brand-primary)]">{formatMoney((college.placements as Record<string, unknown> | undefined)?.averagePackage)}</p></article>
                    <article className="rounded-[1.4rem] border border-[rgba(15,76,129,0.08)] bg-white p-5 shadow-[0_14px_30px_rgba(22,50,79,0.05)]">
                      <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--text-muted)]">Ownership Type</p>
                      <p className="mt-2 text-lg font-bold text-[color:var(--brand-primary)]">{college.ownershipType?.trim() || "Not available"}</p>
                    </article>
                    {college.campusVideoUrl?.trim() ? (
                      <article className="rounded-[1.4rem] border border-[rgba(15,76,129,0.08)] bg-white p-5 shadow-[0_14px_30px_rgba(22,50,79,0.05)]">
                        <div className="flex items-center gap-2">
                          <Globe className="size-4 text-[color:var(--brand-primary)]" />
                          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--text-dark)]">Campus Video</h3>
                        </div>
                        <a href={college.campusVideoUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex text-sm font-semibold text-[color:var(--brand-primary)] underline underline-offset-4">
                          Watch campus video
                        </a>
                      </article>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {activeTab === "fees" ? (
                <div className="mt-6 space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <article className="rounded-[1.4rem] border border-[rgba(15,76,129,0.08)] bg-white p-5 shadow-[0_14px_30px_rgba(22,50,79,0.05)]">
                      <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--text-dark)]">Fee Summary</h3>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-[1rem] border border-[rgba(15,76,129,0.08)] bg-[rgba(15,76,129,0.03)] p-3">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--text-muted)]">General Fee Range</p>
                          <p className="mt-1 text-sm font-semibold text-[color:var(--text-dark)]">{adminFeeRange || feesRange}</p>
                        </div>
                        <div className="rounded-[1rem] border border-[rgba(15,76,129,0.08)] bg-[rgba(15,76,129,0.03)] p-3">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--text-muted)]">Hostel Fee Range</p>
                          <p className="mt-1 text-sm font-semibold text-[color:var(--text-dark)]">{`${formatMoney(hostelFeeMin)} - ${formatMoney(hostelFeeMax)}`}</p>
                        </div>
                      </div>
                    </article>
                  </div>
                </div>
              ) : null}

              {activeTab === "admission" ? (
                <div className="mt-6 space-y-4">
                  <div className="grid gap-4 lg:grid-cols-2">
                    {admissionSteps.map((step, index) => (
                      <article key={step} className="flex gap-4 rounded-[1.4rem] border border-[rgba(15,76,129,0.08)] bg-white p-5 shadow-[0_14px_30px_rgba(22,50,79,0.05)]">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[color:var(--brand-primary)] text-sm font-bold text-white">
                          {index + 1}
                        </div>
                        <p className="pt-1 text-sm leading-6 text-[color:var(--text-muted)]">{step}</p>
                      </article>
                    ))}
                  </div>
                </div>
              ) : null}

              {activeTab === "scholarships" ? (
                <div className="mt-6 space-y-4">
                  <article className="rounded-[1.5rem] border border-[rgba(15,76,129,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(243,248,255,0.98))] p-6 shadow-[0_14px_30px_rgba(22,50,79,0.05)]">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--text-muted)]">Support Options</p>
                        <h3 className="mt-2 text-xl font-bold text-[color:var(--text-dark)] md:text-2xl">Scholarships</h3>
                      </div>
                      <span className="rounded-full bg-[rgba(15,76,129,0.08)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--brand-primary)]">
                        {scholarshipDisplayItems.length ? `${scholarshipDisplayItems.length} types` : "Not available"}
                      </span>
                    </div>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {scholarshipDisplayItems.length ? (
                        scholarshipDisplayItems.map((item) => (
                          <span
                            key={item}
                            className="rounded-full border border-[rgba(15,76,129,0.12)] bg-white px-3 py-1 text-xs font-semibold text-[color:var(--brand-primary)]"
                          >
                            {item}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-[color:var(--text-muted)]">Not available</span>
                      )}
                    </div>
                  </article>
                </div>
              ) : null}

              {activeTab === "hostel" ? (
                <div className="mt-6 rounded-[1.5rem] border border-[rgba(15,76,129,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(245,249,255,0.96))] p-5 shadow-[0_14px_30px_rgba(22,50,79,0.05)]">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div><p className="text-xs uppercase tracking-[0.18em] text-[color:var(--text-muted)]">Residential Life</p><h3 className="mt-2 text-xl font-bold text-[color:var(--text-dark)] md:text-2xl">Hostel Details</h3></div>
                    <span className={`rounded-full px-4 py-2 text-sm font-semibold ${hasHostel ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>{hasHostel ? "Hostel Available" : "Hostel Not Available"}</span>
                  </div>
                  {hasHostel ? (
                    <div className="mt-6 space-y-4">
                      <div className="grid gap-3 sm:grid-cols-2">
                        {hostelMetaItems.map((item) => (
                          <div key={item.label} className="rounded-[1rem] border border-[rgba(15,76,129,0.08)] bg-white p-4">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--text-muted)]">{item.label}</p>
                            <p className="mt-1 break-words text-sm font-semibold leading-6 text-[color:var(--text-dark)]">{item.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : <p className="mt-5 text-sm text-[color:var(--text-muted)]">Hostel details are not available for this college.</p>}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {isEnquiryOpen ? <EnquiryForm college={college} relatedCourses={relatedCourses} onClose={() => setIsEnquiryOpen(false)} /> : null}
      {isGalleryOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent p-4 backdrop-blur-[22px]">
          <button
            type="button"
            aria-label="Close gallery"
            onClick={closeGallery}
            className="absolute right-8 top-8 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/35 bg-white/75 text-slate-700 shadow-[0_12px_28px_rgba(15,23,42,0.16)] transition hover:scale-105 hover:bg-white"
          >
            <X className="size-5" />
          </button>

          {galleryImages.length > 1 ? (
            <button
              type="button"
              aria-label="Previous image"
              onClick={showPreviousImage}
              className="absolute left-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/35 bg-white/70 text-slate-700 shadow-[0_12px_28px_rgba(15,23,42,0.12)] transition hover:scale-105 hover:bg-white md:left-6"
            >
              <ChevronLeft className="size-5" />
            </button>
          ) : null}

          <div className="w-full max-w-5xl overflow-hidden rounded-[1.8rem] border border-white/20 bg-white/8 shadow-[0_24px_64px_rgba(15,23,42,0.16)] backdrop-blur-2xl">
            <div className="relative bg-transparent px-3 py-3 md:px-6 md:py-5">
              <img
                src={galleryImages[activeGalleryIndex] || mainImage}
                alt={`${college.name} full view ${activeGalleryIndex + 1}`}
                className="max-h-[72vh] w-full rounded-[1.25rem] object-contain transition-transform duration-500 ease-out"
              />
            </div>
          </div>

          {galleryImages.length > 1 ? (
            <button
              type="button"
              aria-label="Next image"
              onClick={showNextImage}
              className="absolute right-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/35 bg-white/70 text-slate-700 shadow-[0_12px_28px_rgba(15,23,42,0.12)] transition hover:scale-105 hover:bg-white md:right-6"
            >
              <ChevronRight className="size-5" />
            </button>
          ) : null}
        </div>
      ) : null}
      {expandedCourseKey ? (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-950/40 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-7xl overflow-hidden rounded-[1.5rem] border border-[rgba(15,76,129,0.12)] bg-white shadow-[0_28px_60px_rgba(22,50,79,0.22)]">
            <div className="flex items-center justify-between border-b border-[rgba(15,76,129,0.08)] px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">Course</p>
                <h3 className="mt-1 text-lg font-bold text-[color:var(--text-dark)]">{expandedCourseKey}</h3>
              </div>
              <button
                type="button"
                onClick={() => setExpandedCourseKey(null)}
                className="rounded-full border border-[rgba(15,76,129,0.12)] p-2 text-slate-500 transition hover:bg-[rgba(15,76,129,0.06)]"
                aria-label="Close course details"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-auto px-3 py-4 sm:px-4 lg:px-5">
              <div className="rounded-[1.1rem] border border-[rgba(15,76,129,0.16)] bg-[rgba(15,76,129,0.02)]">
                <div className="border-b border-[rgba(15,76,129,0.16)] px-3 py-2 text-[11px] font-medium text-[color:var(--text-muted)] md:hidden">
                  Scroll horizontally to view all course columns.
                </div>
                <div className="responsive-data-table">
                  <table className="w-full min-w-[72rem] border-collapse text-left text-sm text-[color:var(--text-dark)] lg:min-w-[84rem]">
                    <thead>
                      <tr className="bg-[rgba(15,76,129,0.08)] text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--brand-primary)]">
                        <th className="w-[240px] border-r border-[rgba(15,76,129,0.22)] px-3 py-2">Course</th>
                        <th className="w-[90px] border-r border-[rgba(15,76,129,0.22)] px-3 py-2 text-center whitespace-nowrap">Mode</th>
                        <th className="w-[90px] border-r border-[rgba(15,76,129,0.22)] px-3 py-2 text-center whitespace-nowrap">Duration</th>
                        <th className="w-[460px] border-r border-[rgba(15,76,129,0.22)] px-3 py-2 text-left whitespace-nowrap">Cutoff</th>
                        <th className="w-[90px] border-r border-[rgba(15,76,129,0.22)] px-3 py-2 text-center whitespace-nowrap">Intake</th>
                        <th className="w-[190px] border-r border-[rgba(15,76,129,0.22)] px-3 py-2 text-center whitespace-nowrap">Min Qualification</th>
                        <th className="w-[130px] border-r border-[rgba(15,76,129,0.22)] px-3 py-2 text-center whitespace-nowrap">Semester Fee</th>
                        <th className="w-[130px] border-r border-[rgba(15,76,129,0.22)] px-3 py-2 text-center whitespace-nowrap">Total Fee</th>
                        <th className="w-[110px] px-3 py-2 text-center whitespace-nowrap">App Fee</th>
                      </tr>
                    </thead>
                      {(groupedCourses.find((group) => group.key === expandedCourseKey)?.courses || []).map((course) => (
                        <tbody key={`modal-${course.id}`}>
                          <tr className="border-t border-[rgba(15,76,129,0.2)] bg-white align-top">
                            <td className="border-r border-[rgba(15,76,129,0.16)] px-3 py-3 font-semibold">{getCourseTitle(course)}</td>
                            <td className="border-r border-[rgba(15,76,129,0.16)] px-3 py-3 text-center text-xs font-semibold text-[color:var(--brand-primary)]">{course.mode || "Full-time"}</td>
                            <td className="border-r border-[rgba(15,76,129,0.16)] px-3 py-3 text-center text-xs text-[color:var(--text-muted)]">{course.duration}</td>
                            <td className="border-r border-[rgba(15,76,129,0.16)] px-3 py-3 text-left align-top text-xs leading-5 text-[color:var(--text-muted)] min-w-[16rem] sm:min-w-[20rem]">{renderCutoffDetails(course)}</td>
                            <td className="border-r border-[rgba(15,76,129,0.16)] px-3 py-3 text-center text-xs text-[color:var(--text-muted)]">{course.intake || "-"}</td>
                            <td className="border-r border-[rgba(15,76,129,0.16)] px-3 py-3 text-center text-xs text-[color:var(--text-muted)]">{course.minimumQualification || "-"}</td>
                            <td className="border-r border-[rgba(15,76,129,0.16)] px-3 py-3 text-center text-xs text-[color:var(--text-muted)]">{formatCompactIndianCurrency(course.semesterFees)}</td>
                            <td className="border-r border-[rgba(15,76,129,0.16)] px-3 py-3 text-center text-xs text-[color:var(--text-muted)]">{formatCompactIndianCurrency(course.totalFees)}</td>
                            <td className="px-3 py-3 text-center text-xs text-[color:var(--text-muted)]">{formatCompactIndianCurrency(course.applicationFee)}</td>
                          </tr>
                          {course.description ? (
                            <tr key={`modal-${course.id}-description`} className="border-t border-[rgba(15,76,129,0.2)] bg-[rgba(15,76,129,0.02)]">
                              <td colSpan={9} className="px-3 py-3 text-xs text-[color:var(--text-muted)]">
                                <span className="inline-flex rounded-full bg-[rgba(15,76,129,0.1)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--brand-primary)]">
                                  Course Description
                                </span>
                                <p className="mt-2 text-xs leading-5 text-[color:var(--text-muted)]">{course.description}</p>
                              </td>
                            </tr>
                          ) : null}
                          {course.entranceExams?.length ? (
                            <tr key={`modal-${course.id}-entrance`} className="border-t border-[rgba(15,76,129,0.2)] bg-white">
                              <td colSpan={9} className="px-3 py-3">
                                <details className="rounded-[0.85rem] border border-[rgba(15,76,129,0.08)] bg-[rgba(15,76,129,0.03)] px-3 py-2 text-xs text-[color:var(--text-muted)]">
                                  <summary className="cursor-pointer text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--brand-primary)]">
                                    Entrance Exams
                                  </summary>
                                  <div className="mt-2 space-y-2">
                                    {course.entranceExams.map((exam, index) => (
                                      <div key={`${course.id}-exam-${index}`} className="rounded-[0.75rem] border border-[rgba(15,76,129,0.08)] bg-white px-3 py-2">
                                        <p className="text-xs font-semibold text-[color:var(--text-dark)]">{exam.examName || `Exam ${index + 1}`}</p>
                                        {exam.cutoffScoreOrRank ? <p className="mt-1 text-[11px]">Cutoff: {exam.cutoffScoreOrRank}</p> : null}
                                        {exam.weightage ? <p className="text-[11px]">Weightage: {exam.weightage}</p> : null}
                                        {exam.paperOrSyllabus ? <p className="text-[11px]">Paper: {exam.paperOrSyllabus}</p> : null}
                                        {exam.preparationNotes ? <p className="mt-1 text-[11px]">{exam.preparationNotes}</p> : null}
                                      </div>
                                    ))}
                                  </div>
                                </details>
                              </td>
                            </tr>
                          ) : null}
                        </tbody>
                      ))}
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      {expandedFeeKey ? (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-950/40 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-4xl overflow-hidden rounded-[1.5rem] border border-[rgba(15,76,129,0.12)] bg-white shadow-[0_28px_60px_rgba(22,50,79,0.22)]">
            <div className="flex items-center justify-between border-b border-[rgba(15,76,129,0.08)] px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">Total Fees</p>
                <h3 className="mt-1 text-lg font-bold text-[color:var(--text-dark)]">{expandedFeeKey}</h3>
              </div>
              <button
                type="button"
                onClick={() => setExpandedFeeKey(null)}
                className="rounded-full border border-[rgba(15,76,129,0.12)] p-2 text-slate-500 transition hover:bg-[rgba(15,76,129,0.06)]"
                aria-label="Close fees details"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-auto px-4 py-4 sm:px-5">
              <div className="rounded-[1.1rem] border border-[rgba(15,76,129,0.08)] bg-[rgba(15,76,129,0.02)]">
                <div className="border-b border-[rgba(15,76,129,0.08)] px-4 py-2 text-[11px] font-medium text-[color:var(--text-muted)] md:hidden">
                  Scroll horizontally to view all fee columns.
                </div>
                <div className="responsive-data-table">
                <div className="grid grid-cols-12 gap-0 divide-x divide-[rgba(15,76,129,0.12)] border-b border-[rgba(15,76,129,0.12)] bg-[rgba(15,76,129,0.04)] text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--brand-primary)]">
                  <div className="col-span-6 px-4 py-3">Course</div>
                  <div className="col-span-2 px-4 py-3">Semester</div>
                  <div className="col-span-2 px-4 py-3">Total</div>
                  <div className="col-span-2 px-4 py-3 text-right">App Fee</div>
                </div>
                <div className="divide-y divide-[rgba(15,76,129,0.12)]">
                  {(groupedCourses.find((group) => group.key === expandedFeeKey)?.courses || []).map((course) => (
                    <div key={`fee-modal-${course.id}`} className="grid grid-cols-12 gap-0 divide-x divide-[rgba(15,76,129,0.08)] bg-white text-sm text-[color:var(--text-dark)]">
                      <div className="col-span-6 px-4 py-3 font-semibold">{getCourseTitle(course)}</div>
                      <div className="col-span-2 px-4 py-3 text-xs text-[color:var(--text-muted)]">{formatCompactIndianCurrency(course.semesterFees)}</div>
                      <div className="col-span-2 px-4 py-3 text-xs text-[color:var(--text-muted)]">{formatCompactIndianCurrency(course.totalFees)}</div>
                      <div className="col-span-2 px-4 py-3 text-right text-xs text-[color:var(--text-muted)]">{formatCompactIndianCurrency(course.applicationFee)}</div>
                    </div>
                  ))}
                </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
