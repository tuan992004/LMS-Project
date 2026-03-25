# Design Spec: User Management UI Improvements (Validation-Focused)

**Date:** 2026-03-25
**Topic:** Improving Add and Edit User Forms with Rich Validation and Modern UI

## 1. Overview
The goal is to enhance the User Management forms (Add and Edit) in the Admin role by implementing professional validation and UI polish. We will leverage `react-hook-form` and `zod` to provide real-time feedback and ensure data integrity, while maintaining the existing clean aesthetic.

## 2. Architecture & Tech Stack
- **Form Management:** `react-hook-form` (v7+)
- **Schema Validation:** `zod` (v3+)
- **Hook Form Resolver:** `@hookform/resolvers/zod`
- **UI Icons:** `lucide-react`
- **Styling:** Tailwind CSS (existing project styles)
- **Notifications:** `sonner` (existing project dependency)

## 3. Detailed Design

### 3.1 Validation Schema (`userSchema`)
A unified `zod` schema will be used for both creating and updating users:
- `fullname`: string, min 3 chars, max 50 chars.
- `username`: string, min 3 chars, alphanumeric.
- `email`: string, valid email format.
- `role`: enum ('student', 'instructor', 'admin').
- `password`: string, min 6 chars (required for create, optional for update).

### 3.2 AddUserForm.jsx
- **Form Hook:** Initialize `useForm` with the `zodResolver`.
- **Input Components:**
    - Use `register` for all fields (`fullname`, `username`, `email`, `role`, `password`).
    - Add `<p className="text-red-500 text-xs mt-1">{errors.fieldName?.message}</p>` for each field.
    - Style inputs with `border-red-500` class when `errors.fieldName` exists.
- **Loading State:** Disable submit button and show "Creating..." when `isSubmitting` is true.

### 3.3 UserManagement.jsx (Edit Modal)
- **Modularization (Optional but Recommended):** Consider extracting the edit form into a reusable component or keep it inline but refactor using `react-hook-form`.
- **Default Values:** Use `reset()` or `defaultValues` to populate the form with existing user data.
- **Optional Password:** The `password` field in the edit schema will be `.optional()` or allow an empty string, but if provided, it must be at least 6 characters.

### 3.4 Visual Feedback & UX
- **Input Borders:** Transitions on focus and error states (e.g., `focus:ring-2 focus:ring-black`).
- **Icons:** Add `User`, `Mail`, `Lock`, and `Shield` icons from `lucide-react` as input decorators.
- **Submit Buttons:** Consistent styling with loading indicators.

## 4. Implementation Plan
1.  **Define Schema:** Create a shared validation schema.
2.  **Refactor AddUserForm:** Replace manual state with `react-hook-form`.
3.  **Refactor Edit Modal:** Apply the same logic to the edit form in `UserManagement.jsx`.
4.  **Polish Styles:** Add icons and transition effects to inputs.
5.  **Test:** Verify validation triggers correctly for all fields and API calls work as expected.

## 5. Testing Strategy
- **Unit Tests:** Verify the `zod` schema against various valid/invalid inputs.
- **Integration Tests:** Ensure forms submit correctly to the `userService` and `api` endpoints.
- **UX Verification:** Manually confirm that error messages appear/disappear in real-time.
