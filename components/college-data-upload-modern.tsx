"use client";

import { useState, useRef, useEffect } from "react";
import {
  Bell,
  FileText,
  Building2,
  Zap,
  CheckCircle,
  Upload,
  Download,
  Search,
  Filter,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Shield,
  AlertCircle,
  CheckCircle2,
  FileUp,
  Archive,
  ExternalLink,
} from "lucide-react";

type UploadStep = "college-data" | "images-zip" | "validation" | "review" | "finish";

interface UploadProgress {
  step: UploadStep;
  completed: boolean;
}

interface ValidationStats {
  totalRecords: number;
  validRecords: number;
  failedRecords: number;
  invalidRecords: number;
  duplicates: number;
  pendingReview: number;
}

interface College {
  id: string;
  code: string;
  name: string;
  district: string;
  state: string;
  status: "Valid" | "Invalid";
}

export function CollegeDataUploadModern({
  onImportComplete,
  existingColleges = [],
}: {
  onImportComplete?: () => Promise<void> | void;
  existingColleges?: any[];
}) {
  const [currentStep, setCurrentStep] = useState<UploadStep>("college-data");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedZipFile, setSelectedZipFile] = useState<File | null>(null);
  const [uploadMode, setUploadMode] = useState<"bulk" | "single">("bulk");
  const [stats, setStats] = useState<ValidationStats>({
    totalRecords: 16,
    validRecords: 5,
    failedRecords: 0,
    invalidRecords: 11,
    duplicates: 0,
    pendingReview: 0,
  });

  const [colleges, setColleges] = useState<College[]>([
    { id: "1", code: "COL001", name: "PSG College of Technology", district: "Coimbatore", state: "Tamil Nadu", status: "Valid" },
    { id: "2", code: "COL002", name: "SRM College of Engineering", district: "Chennai", state: "Tamil Nadu", status: "Valid" },
    { id: "3", code: "COL003", name: "Karunya Engineering College", district: "Erode", state: "Tamil Nadu", status: "Invalid" },
    { id: "4", code: "COL004", name: "Unknown College Name", district: "Madurai", state: "Tamil Nadu", status: "Invalid" },
    { id: "5", code: "COL005", name: "Sample Engineering College", district: "Trichy", state: "Tamil Nadu", status: "Valid" },
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "Valid" | "Invalid">("all");

  const steps: { key: UploadStep; label: string; number: number }[] = [
    { key: "college-data", label: "College Data", number: 1 },
    { key: "images-zip", label: "College Images ZIP", number: 2 },
    { key: "validation", label: "Validation Summary", number: 3 },
    { key: "review", label: "Review Uploaded Data", number: 4 },
    { key: "finish", label: "Finish", number: 5 },
  ];

  const itemsPerPage = 5;
  const filteredColleges = colleges.filter(
    (college) =>
      (filterStatus === "all" || college.status === filterStatus) &&
      (college.name.toLowerCase().includes(searchText.toLowerCase()) ||
        college.code.toLowerCase().includes(searchText.toLowerCase()))
  );
  const totalPages = Math.ceil(filteredColleges.length / itemsPerPage);
  const paginatedColleges = filteredColleges.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToStep = (step: UploadStep) => {
    setCurrentStep(step);
  };

  const handleFileSelect = (file: File | null) => {
    if (file) {
      setSelectedFile(file);
      // Auto-advance to next step
      setCurrentStep("images-zip");
    }
  };

  const handleZipFileSelect = (file: File | null) => {
    if (file) {
      setSelectedZipFile(file);
      // Auto-advance to validation
      setCurrentStep("validation");
    }
  };

  // Step 1: College Data
  const CollegeDataStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Step 1: College Data</h2>
        <p className="mt-1 text-sm text-slate-600">Choose an option to add college data</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Bulk Upload Card */}
        <div
          onClick={() => setUploadMode("bulk")}
          className={`cursor-pointer rounded-2xl border-2 p-6 transition-all ${
            uploadMode === "bulk"
              ? "border-blue-400 bg-blue-50 shadow-md"
              : "border-slate-200 bg-white hover:border-blue-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-900">Add Bulk College Data</h3>
              <p className="mt-1 text-sm text-slate-600">Upload Excel file for multiple colleges</p>
            </div>
            {uploadMode === "bulk" && (
              <CheckCircle className="h-6 w-6 text-blue-600" />
            )}
          </div>
          <div className="mt-4">
            <label className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 cursor-pointer">
              Upload Excel File
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
                className="hidden"
              />
            </label>
          </div>
          {selectedFile && uploadMode === "bulk" && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-green-50 p-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-700">{selectedFile.name}</span>
            </div>
          )}
        </div>

        {/* Single Upload Card */}
        <div
          onClick={() => setUploadMode("single")}
          className={`cursor-pointer rounded-2xl border-2 p-6 transition-all ${
            uploadMode === "single"
              ? "border-blue-400 bg-blue-50 shadow-md"
              : "border-slate-200 bg-white hover:border-blue-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-900">Add Single College Data</h3>
              <p className="mt-1 text-sm text-slate-600">Add college details manually one by one</p>
            </div>
            {uploadMode === "single" && (
              <CheckCircle className="h-6 w-6 text-blue-600" />
            )}
          </div>
          <div className="mt-4">
            <button className="inline-block rounded-lg border-2 border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50">
              Add Manually
            </button>
          </div>
        </div>
      </div>

      {/* Download Sample */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
              <Download className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">Download Sample Excel</h4>
              <p className="text-sm text-slate-600">Get template with correct format to avoid errors</p>
            </div>
          </div>
          <button className="rounded-lg border-2 border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50">
            Download
          </button>
        </div>
      </div>
    </div>
  );

  // Step 2: Images ZIP
  const ImagesZipStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Step 2: Add College Images ZIP</h2>
        <p className="mt-1 text-sm text-slate-600">Upload a combined ZIP with logo, cover, and college images</p>
      </div>

      <div className="rounded-2xl border-2 border-dashed border-slate-300 p-8 text-center hover:border-blue-400 transition-colors">
        <div className="flex flex-col items-center justify-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-blue-100">
            <Archive className="h-8 w-8 text-blue-600" />
          </div>
          <p className="text-base font-medium text-slate-900">Drag & drop ZIP file here</p>
          <p className="mt-1 text-sm text-slate-600">or</p>
          <label className="mt-3 cursor-pointer rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700">
            Choose ZIP File
            <input
              type="file"
              accept=".zip"
              onChange={(e) => handleZipFileSelect(e.target.files?.[0] || null)}
              className="hidden"
            />
          </label>
          <div className="mt-4 space-y-1 text-xs text-slate-500">
            <p>Supported formats: JPG, PNG, JPEG</p>
            <p>Maximum ZIP size: 100MB</p>
            <p>ZIP should contain: logo, cover, and college images</p>
          </div>
        </div>
      </div>

      {selectedZipFile && (
        <div className="flex items-center gap-3 rounded-xl bg-green-50 border border-green-200 p-4">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <div>
            <p className="font-medium text-green-900">{selectedZipFile.name}</p>
            <p className="text-sm text-green-700">34.8 MB • 12 images</p>
          </div>
        </div>
      )}
    </div>
  );

  // Step 3: Validation Summary
  const ValidationSummaryStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Step 3: Validation Summary</h2>
        <p className="mt-1 text-sm text-slate-600">Excel validated. Upload images to verify media files.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {[
          { label: "Total Records", value: stats.totalRecords, color: "bg-blue-50 text-blue-700", dot: "bg-blue-600" },
          { label: "Valid Records", value: stats.validRecords, color: "bg-green-50 text-green-700", dot: "bg-green-600" },
          { label: "Failed Records", value: stats.failedRecords, color: "bg-red-50 text-red-700", dot: "bg-red-600" },
          { label: "Invalid Records", value: stats.invalidRecords, color: "bg-orange-50 text-orange-700", dot: "bg-orange-600" },
          { label: "Duplicates", value: stats.duplicates, color: "bg-yellow-50 text-yellow-700", dot: "bg-yellow-600" },
          { label: "Pending Review", value: stats.pendingReview, color: "bg-purple-50 text-purple-700", dot: "bg-purple-600" },
        ].map((stat, idx) => (
          <div key={idx} className={`rounded-xl ${stat.color} p-4`}>
            <p className="text-xs font-medium opacity-75">{stat.label}</p>
            <p className="mt-2 text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => setCurrentStep("review")}
          className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700"
        >
          Preview Data →
        </button>
      </div>
    </div>
  );

  // Step 4: Review Data
  const ReviewDataStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Step 4: Review Uploaded Data</h2>
        <p className="mt-1 text-sm text-slate-600">Review and verify the uploaded college data</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search college..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full rounded-lg border border-slate-200 pl-10 pr-4 py-2 text-sm focus:border-blue-400 focus:outline-none"
            />
          </div>
          <button className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <Filter className="h-4 w-4" />
          </button>
        </div>
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="Valid">Valid</option>
            <option value="Invalid">Invalid</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-slate-700">S.No</th>
              <th className="px-4 py-3 text-left font-medium text-slate-700">College Code</th>
              <th className="px-4 py-3 text-left font-medium text-slate-700">College Name</th>
              <th className="px-4 py-3 text-left font-medium text-slate-700">District</th>
              <th className="px-4 py-3 text-left font-medium text-slate-700">State</th>
              <th className="px-4 py-3 text-left font-medium text-slate-700">Status</th>
              <th className="px-4 py-3 text-left font-medium text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedColleges.map((college, idx) => (
              <tr
                key={college.id}
                className={`border-b border-slate-200 transition-colors last:border-b-0 ${
                  college.status === "Valid" ? "bg-green-50/40 hover:bg-green-50" : "bg-red-50/40 hover:bg-red-50"
                }`}
              >
                <td className="px-4 py-3 text-slate-700">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                <td className="px-4 py-3 font-medium text-slate-900">{college.code}</td>
                <td className="px-4 py-3 text-slate-700">{college.name}</td>
                <td className="px-4 py-3 text-slate-700">{college.district}</td>
                <td className="px-4 py-3 text-slate-700">{college.state}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                      college.status === "Valid"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {college.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button className="text-slate-500 hover:text-blue-600">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="text-slate-500 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredColleges.length)} of {filteredColleges.length} records
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="rounded-lg border border-slate-200 px-3 py-2 disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`rounded-lg px-3 py-2 text-sm font-medium ${
                page === currentPage
                  ? "bg-blue-600 text-white"
                  : "border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="rounded-lg border border-slate-200 px-3 py-2 disabled:opacity-50"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => setCurrentStep("finish")}
          className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700"
        >
          Continue →
        </button>
      </div>
    </div>
  );

  // Step 5: Finish
  const FinishStep = () => (
    <div className="flex flex-col items-center justify-center space-y-6 py-12">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
        <CheckCircle className="h-10 w-10 text-green-600" />
      </div>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900">All college data and images uploaded successfully</h2>
        <p className="mt-2 text-slate-600">You can now proceed or go back to dashboard.</p>
      </div>
      <div className="flex gap-4">
        <button className="rounded-lg border border-slate-300 px-6 py-2 font-medium text-slate-700 hover:bg-slate-50">
          Back to Dashboard
        </button>
        <button className="rounded-lg bg-green-600 px-6 py-2 font-medium text-white hover:bg-green-700">
          Finish Upload
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-full min-h-screen gap-6 bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
      {/* Main Content */}
      <div className="flex-1">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">College Data Upload</h1>
              <p className="mt-1 text-slate-600">Upload college data and images in a few simple steps</p>
            </div>
            <button className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-700 border border-slate-200 hover:bg-slate-50">
              ← Back to Dashboard
            </button>
          </div>

          {/* Step Progress */}
          <div className="hidden gap-2 md:flex">
            {steps.map((step, idx) => {
              const isActive = currentStep === step.key;
              const isCompleted = steps.findIndex(s => s.key === currentStep) > idx;
              
              return (
                <div key={step.key} className="flex items-center">
                  <button
                    onClick={() => goToStep(step.key)}
                    className={`flex h-10 w-10 items-center justify-center rounded-full font-semibold text-sm transition-all ${
                      isActive
                        ? "bg-blue-600 text-white shadow-lg"
                        : isCompleted
                        ? "bg-green-600 text-white"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : step.number}
                  </button>
                  {idx < steps.length - 1 && (
                    <div
                      className={`h-1 w-12 transition-colors ${
                        isCompleted ? "bg-green-600" : "bg-slate-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          {currentStep === "college-data" && <CollegeDataStep />}
          {currentStep === "images-zip" && <ImagesZipStep />}
          {currentStep === "validation" && <ValidationSummaryStep />}
          {currentStep === "review" && <ReviewDataStep />}
          {currentStep === "finish" && <FinishStep />}
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="hidden w-80 space-y-6 lg:block">
        {/* Upload Progress */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-slate-900">Upload Progress</h3>
          <div className="mt-4 space-y-3">
            {steps.map((step) => {
              const isActive = currentStep === step.key;
              const isCompleted = steps.findIndex(s => s.key === currentStep) > steps.findIndex(s => s.key === step.key);
              
              return (
                <div key={step.key} className="flex items-center gap-3">
                  <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : isCompleted
                      ? "bg-green-600 text-white"
                      : "bg-slate-200 text-slate-600"
                  }`}>
                    {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : step.number}
                  </div>
                  <p className={`text-sm ${isActive ? "font-semibold text-slate-900" : "text-slate-600"}`}>
                    {step.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Guidelines */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            Guidelines
          </h3>
          <div className="mt-4 space-y-2 text-sm text-slate-600">
            {[
              "Excel format: .xlsx, .xls",
              "ZIP format: .zip",
              "Image formats: JPG, PNG, JPEG",
              "Max ZIP size: 100MB",
              "ZIP should contain: logo, cover & images",
              "File names should not contain special characters",
            ].map((guide, idx) => (
              <div key={idx} className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-600 mt-0.5" />
                <span>{guide}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Downloads */}
        <div className="space-y-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <Download className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">Download Sample Excel</p>
                <p className="text-xs text-slate-500">Template with correct format</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <Download className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">Download Guidelines</p>
                <p className="text-xs text-slate-500">Image upload guidelines</p>
              </div>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-blue-600 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Secure Upload</p>
              <p className="mt-2 text-sm text-blue-700">All files are encrypted and stored with 256-bit SSL encryption.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
