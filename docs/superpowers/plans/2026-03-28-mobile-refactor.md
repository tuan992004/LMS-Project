# Mobile Summary-to-Detail Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Standardize the mobile "Summary-to-Detail" pattern across the prj-frontend to improve UX and accessibility.

**Architecture:** Utilize `MobileListItem.jsx` to wrap list items, hiding full metadata and actions until an item is expanded. Maintains existing desktop (md:) layouts.

**Tech Stack:** React 19, Tailwind CSS v4, Lucide-React icons.

---

### Task 1: Enhance `MobileListItem` for Universal Utility

**Files:**
- Modify: `prj-frontend/src/components/shared/MobileListItem.jsx`

- [ ] **Step 1: Update icon/avatar container for 44px touch zone**
- [ ] **Step 2: Add `break-words` to title/subtitle for VN support**
- [ ] **Step 3: Ensure `actions` buttons have minimum height/width for touch targets**

---

### Task 2: Refactor Teacher - Student Roster

**Files:**
- Modify: `prj-frontend/src/pages/teacher/TeacherStudents.jsx`

- [ ] **Step 1: Import `MobileListItem`**
- [ ] **Step 2: Add `expandedStudentId` state**
- [ ] **Step 3: Wrap list in responsive conditional (hidden md: block for Mobile, md: grid for Desktop)**
- [ ] **Step 4: Implement `MobileListItem` in the mobile view**

---

### Task 3: Refactor Teacher - Global Assignments

**Files:**
- Modify: `prj-frontend/src/pages/teacher/TeacherAssignments.jsx`

- [ ] **Step 1: Import `MobileListItem`**
- [ ] **Step 2: Add `expandedAssignmentId` state**
- [ ] **Step 3: Refactor list into `hidden md:block` (Mobile) and `md:grid` (Desktop)**
- [ ] **Step 4: Implement `MobileListItem` with Summary (Title, Course) and Detail (Dates, Actions)**

---

### Task 4: Polish Notification Bell for Mobile Width

**Files:**
- Modify: `prj-frontend/src/components/shared/NotificationBell.jsx`

- [ ] **Step 1: Update dropdown width to `w-[calc(100vw-2rem)]` on mobile**
- [ ] **Step 2: Verify touch targets (44px+) for all buttons in the list**

---

### Task 5: Final Validation Sweep

- [ ] **Step 1: Audit all modified files for 16px input fonts (using UI components)**
- [ ] **Step 2: Verify `pb-28` or similar in all layout containers to prevent Bottom Nav overlap**
- [ ] **Step 3: Check for horizontal overflows on 320px simulated width**
