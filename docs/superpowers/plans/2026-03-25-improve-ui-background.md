# Global UI Background Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a theme-aware, premium mesh gradient background globally across all routes by modifying the root `index.css` and cleaning up redundant layout styles.

**Architecture:** Centralized background logic on the `body` selector using CSS variables for light/dark mode compatibility. Overlapping `radial-gradient` layers create a subtle "glow" effect.

**Tech Stack:** React, Tailwind CSS, CSS3 Radial Gradients.

---

### Task 1: Refactor Global CSS

**Files:**
- Modify: `prj-frontend/src/index.css`

- [ ] **Step 1: Define CSS variables and update body selector**

Replace the existing `:root` and `body` styles with the following:

```css
:root {
  font-family: system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;

  color-scheme: light dark;
  color: rgba(255, 255, 255, 0.87);

  /* Mesh Gradient Variables - Light Mode */
  --bg-mesh-base: #f8fafc; /* slate-50 */
  --bg-mesh-color-1: rgba(99, 102, 241, 0.03); /* indigo */
  --bg-mesh-color-2: rgba(168, 85, 247, 0.03); /* purple */
  --bg-mesh-color-3: rgba(236, 72, 153, 0.03); /* pink */
  --bg-mesh-color-4: rgba(79, 70, 229, 0.03); /* indigo-600 */

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

@media (prefers-color-scheme: dark) {
  :root {
    color: #f1f5f9;
    --bg-mesh-base: #0f172a; /* slate-900 */
    --bg-mesh-color-1: rgba(99, 102, 241, 0.06);
    --bg-mesh-color-2: rgba(168, 85, 247, 0.06);
    --bg-mesh-color-3: rgba(236, 72, 153, 0.06);
    --bg-mesh-color-4: rgba(79, 70, 229, 0.06);
  }
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
  background-color: var(--bg-mesh-base);
  background-image: 
    radial-gradient(at 0% 0%, var(--bg-mesh-color-1) 0px, transparent 50%), 
    radial-gradient(at 100% 0%, var(--bg-mesh-color-2) 0px, transparent 50%), 
    radial-gradient(at 100% 100%, var(--bg-mesh-color-3) 0px, transparent 50%), 
    radial-gradient(at 0% 100%, var(--bg-mesh-color-4) 0px, transparent 50%);
  background-attachment: fixed;
}
```

- [ ] **Step 2: Commit changes**

```bash
git add prj-frontend/src/index.css
git commit -m "style: implement global mesh gradient background on body"
```

### Task 2: Clean Up AdminLayout

**Files:**
- Modify: `prj-frontend/src/components/admin/AdminLayout.jsx`

- [ ] **Step 1: Remove redundant background class**

Find the root `div` in `AdminLayout` and remove `bg-gray-50/50`.

```javascript
// Before
<div className="flex min-h-screen bg-gray-50/50 font-sans text-slate-900">

// After
<div className="flex min-h-screen font-sans text-slate-900">
```

- [ ] **Step 2: Commit changes**

```bash
git add prj-frontend/src/components/admin/AdminLayout.jsx
git commit -m "style: remove redundant background from AdminLayout"
```

### Task 3: Clean Up StudentLayout

**Files:**
- Modify: `prj-frontend/src/components/student/StudentLayout.jsx`

- [ ] **Step 1: Remove redundant background class**

Find the root `div` in `StudentLayout` and remove `bg-gray-50/50`.

```javascript
// Before
<div className="flex min-h-screen bg-gray-50/50 font-sans text-slate-900">

// After
<div className="flex min-h-screen font-sans text-slate-900">
```

- [ ] **Step 2: Commit changes**

```bash
git add prj-frontend/src/components/student/StudentLayout.jsx
git commit -m "style: remove redundant background from StudentLayout"
```

### Task 4: Clean Up TeacherLayout

**Files:**
- Modify: `prj-frontend/src/components/teacher/TeacherLayout.jsx`

- [ ] **Step 1: Remove redundant background class**

Find the root `div` in `TeacherLayout` and remove `bg-gray-50/50`.

```javascript
// Before
<div className="flex min-h-screen bg-gray-50/50 font-sans text-slate-900">

// After
<div className="flex min-h-screen font-sans text-slate-900">
```

- [ ] **Step 2: Commit changes**

```bash
git add prj-frontend/src/components/teacher/TeacherLayout.jsx
git commit -m "style: remove redundant background from TeacherLayout"
```

### Task 5: Clean Up LoginPage

**Files:**
- Modify: `prj-frontend/src/pages/logInPage.jsx`

- [ ] **Step 1: Remove inline background styles**

Remove `backgroundColor: "#FAFAFA"` and `width: "100vw"` (body handles width) from the root `div`.

```javascript
// Before
<div
  style={{
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    width: "100vw",
    backgroundColor: "#FAFAFA",
    overflow: "hidden",
    position: "relative",
  }}
>

// After
<div
  style={{
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    overflow: "hidden",
    position: "relative",
  }}
>
```

- [ ] **Step 2: Commit changes**

```bash
git add prj-frontend/src/pages/logInPage.jsx
git commit -m "style: remove redundant background from LoginPage"
```

### Task 6: Final Validation

- [ ] **Step 1: Audit all views**

Check:
1. Login Page
2. Admin Dashboard
3. Student Dashboard
4. Teacher Dashboard
5. Unauthorized (403) Page
6. 404 Page

Verify that the subtle mesh gradient is visible and consistent across all pages.

- [ ] **Step 2: Theme Toggle**

Verify that the background switches correctly when the system theme is changed (Light -> Dark).
