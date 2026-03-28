# Mobile Summary-to-Detail Refactor Spec

**Goal:** Standardize the mobile user experience across the LMS by implementing a "Summary-to-Detail" pattern for all data lists and tables.

**Architecture:**
- **Primary Component:** `MobileListItem.jsx` (Existing).
- **Pattern:** 
  - Mobile: Condensed card (Summary) -> Expandable section (Detail + Actions).
  - Desktop: Maintain existing high-density tables/grids.
- **State Management:** Local `expandedId` state in page components to track which item is open.

**Targeted Refactors:**
1. **Teacher - Student Roster (`TeacherStudents.jsx`)**:
   - Current: Static grid cards.
   - New: `MobileListItem` with avatar, name, and role. Detail reveals email and enrollment count.
2. **Teacher - Global Assignments (`TeacherAssignments.jsx`)**:
   - Current: Dense horizontal cards.
   - New: `MobileListItem` with assignment title and course. Detail reveals created/due dates and "View Submission" action.
3. **Global - Notification Bell (`NotificationBell.jsx`)**:
   - Fix: Ensure dropdown width is responsive (use `vw` or max-width) and touch targets are 44px+.

**Technical Standards:**
- **Typography:** 16px (text-base) on mobile inputs.
- **Touch Zones:** 44px minimum for all interactive elements.
- **Performance:** Use `React.memo` for list items (already in `MobileListItem`).
- **Bilingual:** Ensure `break-words` and `leading-relaxed` for Vietnamese support.

**Success Criteria:**
- No horizontal scrolling on screens down to 320px.
- All lists follow the "Click to Expand" behavior on mobile (< 768px).
- Desktop views remain unchanged and productive.
