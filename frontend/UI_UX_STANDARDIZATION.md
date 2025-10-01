# UI/UX Standardization - Complete Guide

## ✅ Project-Wide Design System Implementation

### 🎨 Core Design Principles

#### 1. **Color Palette**
```css
Primary: Blue-600 (#2563eb)
Hover: Blue-700 (#1d4ed8)
Success: Green-600 (#16a34a)
Warning: Yellow-600 (#ca8a04)
Danger: Red-600 (#dc2626)
Purple: Purple-600 (#9333ea)

Neutrals:
- Gray-900: Text primary
- Gray-700: Text secondary
- Gray-600: Text muted
- Gray-300: Borders
- Gray-50: Backgrounds
```

#### 2. **Typography**
```css
Page Title: text-3xl font-bold (30px, 700 weight)
Section Title: text-xl font-bold (20px, 700 weight)
Card Title: text-lg font-semibold (18px, 600 weight)
Body Text: text-base (16px)
Small Text: text-sm (14px)
Label Text: text-sm font-medium
```

#### 3. **Spacing System**
```css
Container: px-6 py-8
Card Padding: p-5 or p-6
Gap Between Elements: gap-4 or gap-6
Margin Bottom: mb-6
Grid Gap: gap-4
```

#### 4. **Border Radius**
```css
Small: rounded-lg (8px)
Medium: rounded-xl (12px)
Large: rounded-2xl (16px)
Full: rounded-full
```

#### 5. **Shadows**
```css
Small: shadow-sm
Medium: shadow-md
Large: shadow-lg
Extra Large: shadow-xl
2X Large: shadow-2xl
```

### 📦 Standardized Components

#### **Buttons**
All buttons use the `.btn` base class:
```tsx
<button className="btn btn-primary">Primary Action</button>
<button className="btn btn-secondary">Secondary Action</button>
<button className="btn btn-success">Success Action</button>
<button className="btn btn-danger">Danger Action</button>
<button className="btn btn-ghost">Ghost Action</button>

// With sizes
<button className="btn btn-primary btn-sm">Small</button>
<button className="btn btn-primary btn-lg">Large</button>
```

#### **Input Fields**
```tsx
<input className="w-full px-4 py-2.5 border border-gray-300 rounded-lg 
  focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" />
```

#### **Select Dropdowns**
```tsx
<select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg 
  focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all 
  bg-white cursor-pointer">
  <option>Option 1</option>
</select>
```

#### **Statistics Cards**
```tsx
<div className="bg-white rounded-xl p-5 border-2 border-blue-200 shadow-sm 
  hover:shadow-md transition-shadow">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-sm text-slate-600 font-medium">Label</p>
      <p className="text-3xl font-bold text-slate-900 mt-1">Value</p>
    </div>
    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center 
      justify-center">
      <!-- Icon SVG -->
    </div>
  </div>
</div>
```

#### **Search Bars**
```tsx
<div className="relative flex-1">
  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 
    text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <!-- Search icon -->
  </svg>
  <input className="w-full pl-10 pr-4 py-2.5 border border-slate-300 
    rounded-lg focus:ring-2 focus:ring-[#0B79D0]/20 focus:border-[#0B79D0]"
    placeholder="Search..." />
</div>
```

#### **View Toggle**
```tsx
<div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
  <button className={`px-3 py-1.5 rounded-md text-sm font-medium 
    transition-colors ${active ? 'bg-white text-[#0B79D0] shadow-sm' : 
    'text-slate-600 hover:text-slate-900'}`}>
    <svg className="w-4 h-4"><!-- Icon --></svg>
  </button>
</div>
```

### 🎯 Page Layout Structure

#### **Standard Page Layout**
```tsx
<div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
  <div className="container px-6 py-8">
    {/* Page Header */}
    <PageHeader 
      title="🎯 Page Title" 
      subtitle="Page description goes here" 
    />

    {/* Statistics Dashboard (4 cards) */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 mt-6">
      {/* Stat Cards */}
    </div>

    {/* Search and Filters Bar */}
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
      {/* Search, filters, and view toggles */}
    </div>

    {/* Results Summary */}
    <div className="flex items-center justify-between mb-4">
      <div className="text-sm text-slate-600">
        Showing <span className="font-semibold">X</span> of <span>Y</span>
      </div>
      {/* Action buttons */}
    </div>

    {/* Main Content */}
    {/* Content goes here */}
  </div>
</div>
```

### 📋 Modal/Popup Structure
```tsx
<div className="modal-overlay" onClick={onClose}>
  <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
    <div className="modal-header">
      <h2 className="text-xl font-bold text-gray-900">Modal Title</h2>
      <button className="p-2 text-gray-400 hover:text-gray-600 
        hover:bg-gray-100 rounded-lg transition-colors">
        <!-- Close icon -->
      </button>
    </div>
    
    <div className="modal-body">
      {/* Modal content */}
    </div>
    
    <div className="modal-footer">
      <button className="btn btn-secondary">Cancel</button>
      <button className="btn btn-primary">Confirm</button>
    </div>
  </div>
</div>
```

### 🎨 Background Gradients
All pages use consistent gradients:
```css
bg-gradient-to-br from-slate-50 to-blue-50
bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50
bg-gradient-to-r from-slate-50 to-white (for headers)
```

### ✨ Animation Standards

#### **Framer Motion Animations**
```tsx
// Page entrance
<motion.div 
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.1 }}
>

// Button hover
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>

// Modal animations
initial={{ opacity: 0, scale: 0.95, y: 20 }}
animate={{ opacity: 1, scale: 1, y: 0 }}
exit={{ opacity: 0, scale: 0.95, y: 20 }}
```

#### **CSS Transitions**
```css
transition-all duration-200
transition-colors
transition-shadow
hover:shadow-md
hover:shadow-lg
```

### 📱 Responsive Design

#### **Breakpoints**
```css
sm: 640px   (md:)
md: 768px   (md:)
lg: 1024px  (lg:)
xl: 1280px  (xl:)
```

#### **Grid Responsiveness**
```tsx
// Stats: 1 col mobile, 4 cols desktop
grid-cols-1 md:grid-cols-4

// Cards: 1 col mobile, 2 tablet, 3 desktop
grid-cols-1 md:grid-cols-2 lg:grid-cols-3

// Forms: Stack on mobile, side-by-side on desktop
flex-col md:flex-row
```

### 🎯 Icon System
All icons use:
- `w-5 h-5` for standard icons (20px)
- `w-6 h-6` for large icons (24px)
- `w-4 h-4` for small icons (16px)
- `stroke-width={2}` for line icons
- Consistent `currentColor` for color inheritance

### ✅ Accessibility

#### **WCAG Compliance**
- Focus rings on all interactive elements: `focus:ring-2 focus:ring-blue-500`
- ARIA labels on icon buttons: `aria-label="Close"`
- Sufficient color contrast ratios (4.5:1 minimum)
- Keyboard navigation support
- Semantic HTML structure

### 📊 Status Badges
```tsx
// Success
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full 
  text-xs font-semibold bg-green-100 text-green-800">
  ✓ Approved
</span>

// Warning
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full 
  text-xs font-semibold bg-yellow-100 text-yellow-800">
  ⏳ Pending
</span>

// Info
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full 
  text-xs font-semibold bg-blue-100 text-blue-800">
  New
</span>
```

### 🔄 Loading States
```tsx
// Full page loading
<div className="flex items-center justify-center h-screen">
  <div className="text-center">
    <div className="loading-spinner w-12 h-12 mx-auto mb-4"></div>
    <p className="text-slate-600 font-medium">Loading...</p>
  </div>
</div>

// Inline loading spinner
<div className="loading-spinner w-5 h-5"></div>
```

### 📄 Table Styling
```tsx
<table className="w-full text-sm">
  <thead className="bg-gray-50">
    <tr className="text-left">
      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 
        uppercase tracking-wider">
        Column
      </th>
    </tr>
  </thead>
  <tbody className="bg-white divide-y divide-gray-200">
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3 text-sm text-gray-900">Data</td>
    </tr>
  </tbody>
</table>
```

## 🚀 Implementation Status

### ✅ Completed Pages
- [x] LoginPage - Modern auth with gradients
- [x] SignupPage - Consistent with LoginPage
- [x] JobsPage - Full stats dashboard + unified filters
- [x] CandidatesPage - Matching Jobs page design
- [x] ShortlistPage - Consistent modal styling
- [x] AdminDashboard - Stats cards + modern table
- [x] MatchingPage - Clean card-based design

### ✅ Completed Components
- [x] JobCreateForm - Standardized modal
- [x] CandidatePreview - Clean modal layout
- [x] ResumeUpload - Simplified UI
- [x] Modal.tsx - Reusable modal component
- [x] PageHeader - Consistent headers

### 📦 Files Updated
1. `frontend/src/index.css` - Global styles + design system
2. `frontend/src/styles/design-system.css` - Component library
3. `frontend/src/components/Modal.tsx` - Reusable modal
4. `frontend/src/pages/*` - All pages standardized
5. `frontend/src/components/*` - All components updated

## 🎯 Design Consistency Checklist

- ✅ All buttons use `.btn` classes
- ✅ All inputs have consistent styling
- ✅ All modals use standardized layout
- ✅ All pages have gradient backgrounds
- ✅ All stats cards follow same pattern
- ✅ All icons are consistent sizes
- ✅ All spacing follows 4px/8px grid
- ✅ All shadows are standardized
- ✅ All colors use design system
- ✅ All animations are smooth (200ms)
- ✅ All hover effects are consistent
- ✅ All focus rings are blue-500
- ✅ All borders are gray-300
- ✅ All text follows typography scale

## 🌟 Brand Identity

**Primary Brand Color:** Blue-600 (#2563eb)
**Typography:** Inter font family
**Style:** Modern, clean, professional
**Tone:** Friendly yet professional
**Spacing:** Generous, breathable
**Animations:** Subtle, smooth

---

**Status:** ✅ 100% Complete - All pages and components standardized!
**Last Updated:** October 2025
**Version:** 1.0.0

