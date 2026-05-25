# College Data Upload - Developer Quick Reference

## Quick Start

### Import the Component
```tsx
import { CollegeDataUploadModern } from "@/components/college-data-upload-modern";

// In your admin page
<CollegeDataUploadModern 
  onImportComplete={handleBulkImportComplete} 
  existingColleges={adminState.colleges} 
/>
```

### Props Interface
```tsx
interface Props {
  onImportComplete?: () => Promise<void> | void;
  existingColleges?: AdminCollege[];
}
```

---

## Component State Structure

```tsx
// Step tracking
const [currentStep, setCurrentStep] = useState<UploadStep>(
  "college-data" | "images-zip" | "validation" | "review" | "finish"
);

// File uploads
const [selectedFile, setSelectedFile] = useState<File | null>(null);
const [selectedZipFile, setSelectedZipFile] = useState<File | null>(null);

// Upload mode
const [uploadMode, setUploadMode] = useState<"bulk" | "single">("bulk");

// Validation metrics
const [stats, setStats] = useState<ValidationStats>({
  totalRecords: 0,
  validRecords: 0,
  failedRecords: 0,
  invalidRecords: 0,
  duplicates: 0,
  pendingReview: 0,
});

// College data preview
const [colleges, setColleges] = useState<College[]>([]);

// Table controls
const [currentPage, setCurrentPage] = useState(1);
const [searchText, setSearchText] = useState("");
const [filterStatus, setFilterStatus] = useState<"all" | "Valid" | "Invalid">("all");
```

---

## Key Functions

### Navigate Between Steps
```tsx
const goToStep = (step: UploadStep) => {
  setCurrentStep(step);
  // Optional: Scroll to top
  window.scrollTo({ top: 0, behavior: "smooth" });
};
```

### Handle File Selection
```tsx
const handleFileSelect = (file: File | null) => {
  if (file) {
    setSelectedFile(file);
    setCurrentStep("images-zip"); // Auto-advance
  }
};

const handleZipFileSelect = (file: File | null) => {
  if (file) {
    setSelectedZipFile(file);
    setCurrentStep("validation"); // Auto-advance
  }
};
```

### Filter & Search Table
```tsx
const filteredColleges = colleges.filter(
  (college) =>
    (filterStatus === "all" || college.status === filterStatus) &&
    (college.name.toLowerCase().includes(searchText.toLowerCase()) ||
      college.code.toLowerCase().includes(searchText.toLowerCase()))
);

const itemsPerPage = 5;
const totalPages = Math.ceil(filteredColleges.length / itemsPerPage);
const paginatedColleges = filteredColleges.slice(
  (currentPage - 1) * itemsPerPage,
  currentPage * itemsPerPage
);
```

---

## Customization Guide

### Change Colors

#### Primary Blue Theme (Example: Change to Purple)
```tsx
// Before (Blue)
className="bg-blue-600 text-blue-50 hover:bg-blue-700"

// After (Purple)
className="bg-purple-600 text-purple-50 hover:bg-purple-700"
```

#### Color Replacements
```tsx
// Success status
"bg-green-50 text-green-700" → "bg-emerald-50 text-emerald-700"

// Error status
"bg-red-50 text-red-700" → "bg-rose-50 text-rose-700"

// Warning status
"bg-orange-50 text-orange-700" → "bg-amber-50 text-amber-700"
```

### Modify Layout

#### Change Sidebar Width
```tsx
// Current: w-80 (20rem)
// Make wider:
<div className="w-96 space-y-6 lg:block">

// Make narrower:
<div className="w-72 space-y-6 lg:block">
```

#### Change Main Content Padding
```tsx
// Current: p-8
<div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

// Less padding:
<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

// More padding:
<div className="rounded-2xl border border-slate-200 bg-white p-12 shadow-sm">
```

#### Adjust Card Border Radius
```tsx
// Current: rounded-2xl (1rem)
// Sharper corners:
className="rounded-lg"

// More rounded:
className="rounded-3xl"
```

### Modify Typography

#### Change Heading Size
```tsx
// Current: text-xl
<h2 className="text-xl font-semibold text-slate-900">Step 1: College Data</h2>

// Larger:
<h2 className="text-2xl font-bold text-slate-900">Step 1: College Data</h2>

// Smaller:
<h2 className="text-lg font-semibold text-slate-900">Step 1: College Data</h2>
```

#### Adjust Font Weight
```tsx
// Regular: font-normal (400)
// Medium: font-medium (500)
// Semibold: font-semibold (600) ← Current
// Bold: font-bold (700)
```

---

## Adding New Features

### Add Icon to Step Progress

```tsx
{steps.map((step) => (
  <button
    onClick={() => goToStep(step.key)}
    className="..."
  >
    <span className="...">
      {/* Add icon here */}
      {step.key === "college-data" && <FileUp className="h-4 w-4" />}
      {step.key === "images-zip" && <Archive className="h-4 w-4" />}
      {/* ... etc */}
    </span>
  </button>
))}
```

### Add Progress Bar to Upload

```tsx
const [uploadProgress, setUploadProgress] = useState(0);

<div className="w-full bg-slate-200 rounded-full h-2">
  <div 
    className="bg-blue-600 h-2 rounded-full transition-all"
    style={{ width: `${uploadProgress}%` }}
  />
</div>
<p className="text-sm text-slate-600 mt-2">{uploadProgress}% Complete</p>
```

### Add Toast Notifications

```tsx
import { showToast } from "@/lib/toast";

const handleValidation = async () => {
  try {
    const result = await validateData(selectedFile);
    showToast("Validation successful!", "success");
    setStats(result.stats);
    setCurrentStep("validation");
  } catch (error) {
    showToast("Validation failed: " + error.message, "error");
  }
};
```

### Add Loading State

```tsx
const [isLoading, setIsLoading] = useState(false);

const handleFileSelect = async (file: File | null) => {
  if (!file) return;
  
  try {
    setIsLoading(true);
    // Process file
    await new Promise(resolve => setTimeout(resolve, 2000)); // Mock delay
    setCurrentStep("images-zip");
  } finally {
    setIsLoading(false);
  }
};

// In button:
<button disabled={isLoading} className="...">
  {isLoading ? "Processing..." : "Upload"}
</button>
```

---

## Common Modifications

### Make Sidebar Always Visible (on mobile too)
```tsx
// Change from:
<div className="hidden w-80 space-y-6 lg:block">

// To:
<div className="w-full md:w-80 space-y-6">
```

### Add Custom Validation

```tsx
const validateFile = (file: File): string | null => {
  // Check file size
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  if (file.size > MAX_SIZE) {
    return `File size must be less than ${MAX_SIZE / (1024 * 1024)}MB`;
  }

  // Check file type
  const allowedTypes = ["application/vnd.ms-excel", "text/csv"];
  if (!allowedTypes.includes(file.type)) {
    return "Only Excel and CSV files are allowed";
  }

  return null;
};

const handleFileSelect = (file: File | null) => {
  if (!file) return;
  
  const error = validateFile(file);
  if (error) {
    showToast(error, "error");
    return;
  }
  
  setSelectedFile(file);
  setCurrentStep("images-zip");
};
```

### Change Items Per Page

```tsx
// Current: 5
const itemsPerPage = 5;

// Change to:
const itemsPerPage = 10; // Show 10 records per page
```

### Add Bulk Actions

```tsx
const [selectedRows, setSelectedRows] = useState<string[]>([]);

// In table header:
<th className="px-4 py-3 text-left">
  <input
    type="checkbox"
    onChange={(e) => {
      if (e.target.checked) {
        setSelectedRows(paginatedColleges.map(c => c.id));
      } else {
        setSelectedRows([]);
      }
    }}
  />
</th>

// In table rows:
<td className="px-4 py-3">
  <input
    type="checkbox"
    checked={selectedRows.includes(college.id)}
    onChange={(e) => {
      if (e.target.checked) {
        setSelectedRows([...selectedRows, college.id]);
      } else {
        setSelectedRows(selectedRows.filter(id => id !== college.id));
      }
    }}
  />
</td>

// Add bulk action buttons:
{selectedRows.length > 0 && (
  <div className="fixed bottom-6 right-6 bg-white rounded-lg shadow-lg p-4">
    <p className="text-sm text-slate-600 mb-2">
      {selectedRows.length} selected
    </p>
    <div className="flex gap-2">
      <button 
        onClick={() => handleDeleteBulk(selectedRows)}
        className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
      >
        Delete Selected
      </button>
    </div>
  </div>
)}
```

---

## Integration with Backend

### Sample API Calls

```tsx
// Validate Excel file
const validateExcel = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  
  const response = await fetch("/api/bulk-upload/validate", {
    method: "POST",
    body: formData,
  });
  
  return response.json();
};

// Upload ZIP
const uploadZip = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  
  const response = await fetch("/api/bulk-upload/upload-zip", {
    method: "POST",
    body: formData,
  });
  
  return response.json();
};

// Import data
const importData = async (excelFile: File, zipFile: File) => {
  const formData = new FormData();
  formData.append("excel", excelFile);
  formData.append("zip", zipFile);
  
  const response = await fetch("/api/bulk-upload/import", {
    method: "POST",
    body: formData,
  });
  
  return response.json();
};
```

### Usage in Component

```tsx
const handleContinueFromValidation = async () => {
  try {
    setIsLoading(true);
    const validation = await validateExcel(selectedFile!);
    
    setStats(validation.stats);
    setColleges(validation.colleges);
    setCurrentStep("review");
  } catch (error) {
    showToast("Validation failed", "error");
  } finally {
    setIsLoading(false);
  }
};
```

---

## Testing Checklist

### Functional Tests
- [ ] Navigate between all 5 steps
- [ ] File selection triggers auto-advance
- [ ] Search/filter table works correctly
- [ ] Pagination controls work
- [ ] Step progress updates correctly
- [ ] Sidebar visibility on different screen sizes

### UI Tests
- [ ] Colors display correctly
- [ ] Buttons are clickable
- [ ] Hover effects work
- [ ] Transitions are smooth
- [ ] Icons render properly
- [ ] Text is readable

### Responsive Tests
- [ ] Mobile (< 600px)
- [ ] Tablet (600px - 1023px)
- [ ] Desktop (1024px+)
- [ ] Extra-wide (1280px+)

### Accessibility Tests
- [ ] Tab navigation works
- [ ] Screen reader compatibility
- [ ] Color contrast meets WCAG AA
- [ ] Focus indicators visible
- [ ] Form labels associated

---

## Troubleshooting

### Issue: Sidebar not showing on lg screens
**Solution**: Check that `lg:block` class is present and tailwind config includes `lg` breakpoint

### Issue: Files not uploading
**Solution**: 
1. Check file size limits
2. Verify accept attributes
3. Check browser console for errors

### Issue: Table not updating
**Solution**: 
1. Ensure state is updated with `.map()` creating new array
2. Check dependencies in useEffect
3. Verify data structure matches College interface

### Issue: Buttons not responding
**Solution**: 
1. Check onClick handlers are defined
2. Verify event handlers aren't stopped with `e.preventDefault()`
3. Check disabled state isn't accidentally set

---

## Performance Tips

1. **Memoize Components**: Use `React.memo()` for Card components if rendering large lists
2. **Lazy Load**: Use React.lazy() for heavy components
3. **Optimize Re-renders**: Use `useCallback` for event handlers
4. **Virtualize Tables**: For 1000+ records, use react-window
5. **Code Split**: Split large components into smaller modules

---

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ⚠️ IE 11 (Not supported - uses modern ES2020 features)

---

## File Structure

```
components/
  ├── college-data-upload-modern.tsx (Main component - 400 lines)
  └── college-data-upload-modern/
      ├── steps/
      │   ├── CollegeDataStep.tsx
      │   ├── ImagesZipStep.tsx
      │   ├── ValidationStep.tsx
      │   ├── ReviewStep.tsx
      │   └── FinishStep.tsx
      ├── sidebar/
      │   ├── ProgressTracker.tsx
      │   ├── Guidelines.tsx
      │   ├── Downloads.tsx
      │   └── Security.tsx
      └── table/
          ├── DataTable.tsx
          ├── Pagination.tsx
          └── SearchFilter.tsx
```

---

## Related Files

- [COLLEGE_DATA_UPLOAD_DOCS.md](COLLEGE_DATA_UPLOAD_DOCS.md) - Full documentation
- [COLLEGE_DATA_UPLOAD_VISUAL_GUIDE.md](COLLEGE_DATA_UPLOAD_VISUAL_GUIDE.md) - Visual design guide
- [components/college-data-upload-modern.tsx](components/college-data-upload-modern.tsx) - Source code
- [app/admin/page.tsx](app/admin/page.tsx) - Integration point

---

## Version History

**v1.0.0** (May 25, 2026) - Initial release
- 5-step workflow
- Modern UI with Tailwind CSS
- Responsive design
- Data table with search/filter
- Validation summary
- Progress tracking
- Security information

---

## Support & Questions

For issues or questions about the component, refer to:
1. Check the visual guide for design details
2. Review the main documentation
3. Check the component source code comments
4. Look at usage examples in admin page

---

**Last Updated**: May 25, 2026
**Maintained By**: Development Team
**Status**: Production Ready
