# College Data Upload - Visual Design Guide

## Overview Layout

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  HEADER: Title, Breadcrumb, Back Button                               ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  STEP PROGRESS: ① ─── ② ─── ③ ─── ④ ─── ⑤                            ┃
┃  (Horizontal with connecting lines)                                   ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  ┏━━━━━━━━━━━━━━━━━━━┓
┃                                             ┃  ┃                   ┃
┃     MAIN CONTENT AREA                       ┃  ┃  RIGHT SIDEBAR   ┃
┃     (Step-specific content)                 ┃  ┃  (lg+ screens)   ┃
┃                                             ┃  ┃                   ┃
┃     White card with shadow                  ┃  ┃ - Progress       ┃
┃     Soft padding                            ┃  ┃ - Guidelines     ┃
┃                                             ┃  ┃ - Downloads      ┃
┃                                             ┃  ┃ - Security       ┃
┃                                             ┃  ┃                   ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  ┗━━━━━━━━━━━━━━━━━━━┛
```

## Color Palette Reference

```
Primary Colors:
  ✓ Blue:       #3b82f6 (bg-blue-600)       🔵
  ✓ Green:      #16a34a (bg-green-600)      🟢
  ✓ Red:        #ef233c (bg-red-600)        🔴
  ✓ Orange:     #ff9f1c (bg-orange-600)     🟠
  ✓ Purple:     #a855f7 (bg-purple-600)     🟣
  ✓ Yellow:     #eab308 (bg-yellow-600)     🟡

Background:
  ✓ Gradient:   from-slate-50 to-blue-50
  ✓ Card BG:    bg-white
  ✓ Border:     border-slate-200

Text:
  ✓ Primary:    text-slate-900 (headings)
  ✓ Secondary:  text-slate-600 (body)
  ✓ Tertiary:   text-slate-500 (labels)
```

---

## STEP 1: COLLEGE DATA

### Layout Structure
```
┌──────────────────────────────────────────────────────────┐
│ Step 1: College Data                                     │
│ Choose an option to add college data                     │
└──────────────────────────────────────────────────────────┘

┌─────────────────────────────┐  ┌─────────────────────────────┐
│ Add Bulk College Data       │  │ Add Single College Data      │
│ (Blue card - Selected)      │  │ (White card - Unselected)   │
├─────────────────────────────┤  ├─────────────────────────────┤
│ [📄] (Blue Icon)            │  │ [🏢] (Blue Icon)            │
│                             │  │                             │
│ Add Bulk College Data       │  │ Add Single College Data      │
│ Upload Excel file for       │  │ Add college details         │
│ multiple colleges           │  │ manually one by one         │
│                             │  │                             │
│ [Upload Excel File] (Blue)  │  │ [Add Manually] (Outlined)   │
│ ✓ college_data.xlsx         │  │                             │
│                             │  │                             │
│ [✓] (Green checkmark)       │  │                             │
└─────────────────────────────┘  └─────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ Download Sample Excel (Light Blue Gradient)             │
├──────────────────────────────────────────────────────────┤
│ [📥] Download Sample Excel                              │
│ Get template with correct format to avoid errors        │
│                          [Download] (Blue Outlined)      │
└──────────────────────────────────────────────────────────┘
```

### Visual Styling
- **Selected Card**: 
  - Border: 2px solid #3b82f6 (blue-400)
  - Background: #eff6ff (blue-50)
  - Shadow: md shadow
  - Check icon: ✓ in top-right corner

- **Unselected Card**:
  - Border: 2px solid #e2e8f0 (slate-200)
  - Background: #ffffff (white)
  - Hover: Border becomes #bfdbfe (blue-300)

- **Upload Button**:
  - Color: #ffffff on #2563eb
  - Hover: Background becomes #1d4ed8
  - Rounded: lg (0.5rem)

- **Sample Excel Container**:
  - Background Gradient: linear-gradient(to right, #f0f9ff, #ecf9ff)
  - Border: 1px solid #e0f2fe
  - Padding: xl (1.5rem)

---

## STEP 2: ADD COLLEGE IMAGES ZIP

### Layout Structure
```
┌──────────────────────────────────────────────────────────┐
│ Step 2: Add College Images ZIP                           │
│ Upload a combined ZIP with logo, cover, and college...  │
└──────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│           (Dashed Border - Drag & Drop)                 │
│                                                          │
│                    [📦]                                  │
│                                                          │
│            Drag & drop ZIP file here                    │
│                      or                                  │
│                                                          │
│           [Choose ZIP File] (Blue Button)                │
│                                                          │
│        Supported formats: JPG, PNG, JPEG               │
│        Maximum ZIP size: 100MB                          │
│        ZIP should contain: logo, cover, and images     │
│                                                          │
└─────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ ✓ college_images.zip                        34.8 MB     │
│   12 images                                              │
│                                                          │
│ [✓ Green Success Container]                             │
└──────────────────────────────────────────────────────────┘
```

### Visual Styling
- **Dashed Border Area**:
  - Border: 2px dashed #cbd5e1 (slate-300)
  - Padding: 2rem (8x)
  - Hover: Border color changes to #60a5fa (blue-400)
  - Text align: center

- **Archive Icon**:
  - Background: #eff6ff (blue-50)
  - Icon color: #2563eb (blue-600)
  - Size: 4rem × 4rem

- **Upload Button**:
  - Style: Same as Step 1
  - Margin-top: 1rem

- **Uploaded File Preview**:
  - Background: #f0fdf4 (green-50)
  - Border: 1px solid #bbf7d0 (green-200)
  - Text: #15803d (green-800)
  - Padding: 1rem (4x)
  - Rounded: xl (0.75rem)

---

## STEP 3: VALIDATION SUMMARY

### Layout Structure
```
┌──────────────────────────────────────────────────────────┐
│ Step 3: Validation Summary                               │
│ Excel validated. Upload images to verify media files.   │
└──────────────────────────────────────────────────────────┘

┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ Total    │ │ Valid    │ │ Failed   │ │ Invalid  │ │ Duplicates│ │ Pending │
│ Records  │ │ Records  │ │ Records  │ │ Records  │ │           │ │ Review  │
├──────────┤ ├──────────┤ ├──────────┤ ├──────────┤ ├──────────┤ ├──────────┤
│   16     │ │    5     │ │    0     │ │   11     │ │    0     │ │    0     │
└─ Blue ──┘ └─ Green ──┘ └─ Red ───┘ └─ Orange ─┘ └─ Yellow ─┘ └─ Purple ─┘
```

### Stat Card Styling (6 columns on lg, 3 on md, 2 on sm)
```
Each Card:
  - Rounded: xl (0.75rem)
  - Padding: 1rem (4x)
  - Label: text-xs font-medium (opacity-75)
  - Value: text-2xl font-bold
  - Color variations:
    * Blue:    bg-blue-50,    text-blue-700
    * Green:   bg-green-50,   text-green-700
    * Red:     bg-red-50,     text-red-700
    * Orange:  bg-orange-50,  text-orange-700
    * Yellow:  bg-yellow-50,  text-yellow-700
    * Purple:  bg-purple-50,  text-purple-700
```

### Action Button
```
[Preview Data →] (Blue Button, right-aligned)
  - Background: #2563eb
  - Padding: px-6 py-2
  - Font: medium weight
```

---

## STEP 4: REVIEW UPLOADED DATA

### Layout Structure
```
┌──────────────────────────────────────────────────────────┐
│ Step 4: Review Uploaded Data                             │
│ Review and verify the uploaded college data              │
└──────────────────────────────────────────────────────────┘

[Search Box] [Filter]                    [Status Dropdown]

┌──────────────────────────────────────────────────────────┐
│ S.No │ Code  │ Name          │ District │ State │ Status  │
├──────────────────────────────────────────────────────────┤
│  1   │ COL001│ PSG College... │ Coimbat... │ TN  │ ✓ Valid │
│  2   │ COL002│ SRM College... │ Chennai   │ TN  │ ✓ Valid │
│  3   │ COL003│ Karunya Eng... │ Erode     │ TN  │ ✗ Inval │
│  4   │ COL004│ Unknown Coll...│ Madurai   │ TN  │ ✗ Inval │
│  5   │ COL005│ Sample Eng...  │ Trichy    │ TN  │ ✓ Valid │
└──────────────────────────────────────────────────────────┘

Showing 1 to 5 of 16 records
[< ] [1] [2] [3] [4] [ >]

                                          [Continue →] (Blue Button)
```

### Search & Filter Bar
```
┌─────────────────────┐  ┌────────┐              ┌──────────────────┐
│ 🔍 Search college...│  │ ⚙️ Filt │              │ All Status ▼     │
└─────────────────────┘  └────────┘              └──────────────────┘
```

### Table Styling
- **Header**:
  - Background: #f8fafc (slate-50)
  - Border-bottom: 1px solid #e2e8f0
  - Font: medium weight
  - Padding: py-3 px-4

- **Rows**:
  - Valid rows: bg-green-50/40, hover: bg-green-50
  - Invalid rows: bg-red-50/40, hover: bg-red-50
  - Border-bottom: 1px solid #e2e8f0
  - Transition: smooth color change

- **Status Badges**:
  - Valid: bg-green-100, text-green-700
  - Invalid: bg-red-100, text-red-700
  - Border-radius: rounded-full

- **Action Icons**:
  - Color: text-slate-500
  - Hover: text-blue-600 (edit), text-red-600 (delete)

### Pagination
```
Showing 1 to 5 of 16 records

[◀ Prev]  [1]  [2]  [3]  [4]  [Next ▶]

Active page: bg-blue-600, text-white
Inactive page: border-slate-200, hover: bg-slate-50
Disabled: opacity-50
```

---

## STEP 5: FINISH

### Layout Structure
```
┌────────────────────────────────────────────────────────┐
│                                                         │
│                    [ ✓ ]                               │
│                 (Large Green Icon)                     │
│                                                         │
│    All college data and images uploaded successfully  │
│                                                         │
│   You can now proceed or go back to dashboard.         │
│                                                         │
│                                                         │
│  [Back to Dashboard]        [Finish Upload] (Green)    │
│                                                         │
└────────────────────────────────────────────────────────┘
```

### Visual Styling
- **Success Icon Container**:
  - Background: #ecfdf5 (green-50)
  - Size: 5rem × 5rem (h-20 w-20)
  - Rounded: rounded-full
  - Icon: text-green-600, size h-10 w-10

- **Heading**:
  - Font-size: 2xl (1.875rem)
  - Font-weight: bold
  - Color: text-slate-900
  - Margin-bottom: 1rem

- **Subtitle**:
  - Font-size: sm (0.875rem)
  - Color: text-slate-600

- **Buttons**:
  - Secondary: border border-slate-300, text-slate-700, hover: bg-slate-50
  - Primary: bg-green-600, text-white, hover: bg-green-700

---

## RIGHT SIDEBAR COMPONENTS

### Upload Progress Tracker
```
┌──────────────────────────────┐
│ Upload Progress              │
├──────────────────────────────┤
│ ① College Data               │
│ ② College Images ZIP         │
│ ③ Validation Summary    (🔵) │
│ ④ Review Uploaded Data       │
│ ⑤ Finish                     │
└──────────────────────────────┘

Legend:
  (🔵) = Current step (Blue)
  (✓) = Completed (Green)
  (⚪) = Upcoming (Gray)
```

### Guidelines
```
┌──────────────────────────────┐
│ ⓘ Guidelines                 │
├──────────────────────────────┤
│ ✓ Excel format: .xlsx, .xls  │
│ ✓ ZIP format: .zip           │
│ ✓ Image formats: JPG, PNG... │
│ ✓ Max ZIP size: 100MB        │
│ ✓ ZIP should contain: ...    │
│ ✓ File names should not...   │
└──────────────────────────────┘
```

### Downloads
```
┌──────────────────────────────┐
│ 📥 Download Sample Excel     │
│ Template with correct format │
└──────────────────────────────┘

┌──────────────────────────────┐
│ 📥 Download Guidelines       │
│ Image upload guidelines      │
└──────────────────────────────┘
```

### Security
```
┌──────────────────────────────┐
│ 🔒 SECURE UPLOAD             │
│                              │
│ All files are encrypted and  │
│ stored with 256-bit SSL      │
│ encryption.                  │
└──────────────────────────────┘

Background: bg-blue-50
Border: border-blue-200
Text: text-blue-700
```

---

## RESPONSIVE BEHAVIOR

### Desktop (lg: 1024px+)
- Main content: 70% width
- Right sidebar: 30% width (visible)
- Horizontal step progress: visible
- Multi-column grids: 6 columns

### Tablet (md: 768px - 1023px)
- Full width layout
- Right sidebar: hidden
- Step progress: horizontal, scaled
- Multi-column grids: 2-3 columns

### Mobile (< 768px)
- Full width, single column
- Right sidebar: hidden
- Step progress: may show as small indicators
- Tables: horizontal scroll
- Multi-column grids: stacked (2 columns)

---

## ANIMATION & TRANSITIONS

### Hover Effects
```css
- Card: shadow-sm -> shadow-md
- Border: slate-200 -> blue-300
- Buttons: opacity + background color
- Icons: color changes smoothly
```

### Transitions Used
```css
transition-all (default)
transition-colors (color-only changes)
transition-shadow (shadow changes)
```

### Duration
- Default: 200ms
- Card hovers: smooth scale + shadow

---

## Typography Scale

```
Display: 2xl (1.875rem) - Page title
Heading: xl (1.25rem) - Section title
Subheading: lg (1.125rem) - Card title
Body: base (1rem) - Default text
Small: sm (0.875rem) - Labels
Tiny: xs (0.75rem) - Captions

Font Weights:
  - Headers: semibold (600) or bold (700)
  - Body: normal (400)
  - Labels: medium (500)
```

---

## Spacing System

```
Minimal: 0.25rem (1px)
Extra-small: 0.5rem (2px)
Small: 0.75rem (3px)
Regular: 1rem (4px)
Medium: 1.5rem (6px)
Large: 2rem (8px)
Extra-large: 3rem (12px)
Huge: 4rem+ (16px+)
```

---

## Component Summary

✅ **Modern & Professional** - Premium SaaS design
✅ **Clean & Minimal** - No visual clutter
✅ **Fully Responsive** - Works on all devices
✅ **Color-Coded** - Easy to understand status
✅ **Interactive** - Smooth transitions & feedback
✅ **Accessible** - WCAG compliant
✅ **User-Friendly** - Clear step-by-step flow

---

**Created**: May 25, 2026
**Design System**: Custom Tailwind CSS
**Color Palette**: Blue & Green with warm accents
**Typography**: Professional sans-serif (Tailwind default)
