# Design Spec: Global UI Background Improvements (Subtle Mesh Gradient)

**Date:** 2026-03-25
**Topic:** Implementing a modern, premium mesh gradient background globally across all user roles.

## 1. Overview
The current UI uses flat, off-white backgrounds (`bg-gray-50/50` or `#FAFAFA`). While functional, it lacks depth on modern high-resolution displays. This spec defines the implementation of a subtle "mesh gradient" using pure CSS, applied globally to the `body` to create a more polished and professional aesthetic for Lumina LMS while ensuring full compatibility with both light and dark modes.

## 2. Architecture & Tech Stack
- **Styling:** CSS3 (Radial Gradients), Tailwind CSS, CSS Variables.
- **Scope:** Truly Global (Applied to `body`, covering all layouts, routes, and error pages).
- **Performance:** High (Pure CSS rendering, optimized for smooth scrolling).

## 3. Detailed Design

### 3.1 Global CSS Definition (`index.css`)
To ensure theme-awareness and true global coverage, we will define the background on the `body` selector and use CSS variables for colors.

```css
:root {
  --bg-mesh-base: #f8fafc; /* slate-50 */
  --bg-mesh-color-1: rgba(99, 102, 241, 0.03); /* indigo */
  --bg-mesh-color-2: rgba(168, 85, 247, 0.03); /* purple */
  --bg-mesh-color-3: rgba(236, 72, 153, 0.03); /* pink */
  --bg-mesh-color-4: rgba(79, 70, 229, 0.03); /* indigo-600 */
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg-mesh-base: #0f172a; /* slate-900 */
    --bg-mesh-color-1: rgba(99, 102, 241, 0.05);
    --bg-mesh-color-2: rgba(168, 85, 247, 0.05);
    --bg-mesh-color-3: rgba(236, 72, 153, 0.05);
    --bg-mesh-color-4: rgba(79, 70, 229, 0.05);
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

### 3.2 Cleanup of Existing Styles
Since the background is now on `body`, we will remove redundant background classes from:
- `AdminLayout.jsx`
- `StudentLayout.jsx`
- `TeacherLayout.jsx`
- `logInPage.jsx` (inline styles)

This ensures a cleaner codebase and avoids unnecessary "over-painting" of the background.

### 3.3 Visual Hierarchy & Polish
- **Backdrop Blur:** Verify that headers with `backdrop-blur-md` and `bg-white/80` (or dark equivalent) interact cleanly with the mesh gradient.
- **Main Containers:** Ensure content areas that need a solid white/gray background (like cards or tables) use appropriate Tailwind classes (e.g., `bg-white/50` with `backdrop-blur` for a glassmorphism feel).

## 4. Implementation Plan
1. **Refactor index.css:** Update the `:root` and `body` selectors with the mesh gradient logic and CSS variables.
2. **Clean Layouts:** Remove `bg-gray-50/50` from `AdminLayout.jsx`, `StudentLayout.jsx`, and `TeacherLayout.jsx`.
3. **Clean Login:** Remove `#FAFAFA` and other inline background styles from `logInPage.jsx`.
4. **Theme Check:** Verify that the background shifts correctly between light and dark modes based on system preferences.
5. **Route Audit:** Ensure the background is visible on "layout-less" routes (404, 403, and direct lesson views).
6. **Validation:** Manually verify background consistency and performance across all roles and devices.

## 5. Testing Strategy
- **Visual Audit:** Check every major page to ensure the background is active and subtle.
- **Theme Testing:** Toggle system appearance (Light/Dark) to verify the CSS variables update correctly.
- **Performance/Scroll:** Test on long pages (e.g., User Management) to ensure `background-attachment: fixed` doesn't cause frame drops.
- **Mobile Audit:** Specifically check iOS Safari for "jumping" issues with fixed backgrounds.
