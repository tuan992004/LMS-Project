# User Management UI Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve Add and Edit User forms with rich validation using `react-hook-form` and `zod`.

**Architecture:** Centralized Zod schema for consistent validation across forms; refactor existing components to use hooks for state and error handling.

**Tech Stack:** React, `react-hook-form`, `zod`, `@hookform/resolvers`, `lucide-react`, Tailwind CSS.

---

### Task 1: Create Validation Schema

**Files:**
- Create: `prj-frontend/src/type/userSchema.js`

- [ ] **Step 1: Define the Zod schema**

```javascript
import { z } from "zod";

export const userSchema = z.object({
  fullname: z.string().min(3, "Full name must be at least 3 characters").max(50),
  username: z.string().min(3, "Username must be at least 3 characters").regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["student", "instructor", "admin"]),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
});

export const createUserSchema = userSchema.extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
});
```

- [ ] **Step 2: Commit**

```bash
git add prj-frontend/src/type/userSchema.js
git commit -m "feat: add user validation schema with zod"
```

---

### Task 2: Refactor AddUserForm

**Files:**
- Modify: `prj-frontend/src/components/admin/AddUserForm.jsx`

- [ ] **Step 1: Update imports and initialize useForm**

```javascript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUserSchema } from "../../type/userSchema";
import { User, Mail, Lock, Shield, Loader2 } from "lucide-react";
// ... existing imports
```

- [ ] **Step 2: Refactor component logic**

```javascript
const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
  resolver: zodResolver(createUserSchema),
  defaultValues: { role: "student" }
});

const onSubmit = async (data) => {
  try {
    await userService.addUser(data);
    toast.success('User added successfully!');
    navigate('/admin/users');
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to add user');
  }
};
```

- [ ] **Step 3: Update JSX with icons and error messages**

```javascript
// Example for Full Name field
<div className="relative">
  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
  <input 
    {...register("fullname")}
    className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all ${errors.fullname ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-black'}`}
    placeholder="John Doe"
  />
</div>
{errors.fullname && <p className="text-red-500 text-xs mt-1">{errors.fullname.message}</p>}
```

- [ ] **Step 4: Commit**

```bash
git add prj-frontend/src/components/admin/AddUserForm.jsx
git commit -m "refactor: implement react-hook-form and validation in AddUserForm"
```

---

### Task 3: Refactor Edit User Modal in UserManagement

**Files:**
- Modify: `prj-frontend/src/pages/admin/UserManagement.jsx`

- [ ] **Step 1: Initialize useForm for the Edit Modal**

```javascript
const { register, handleSubmit: handleEditSubmit, reset, formState: { errors: editErrors } } = useForm({
  resolver: zodResolver(userSchema),
});

// Update handleEditClick to reset form with user data
const handleEditClick = (user) => {
  setEditingUser(user);
  reset({
    fullname: user.fullname,
    username: user.username,
    email: user.email,
    role: user.role,
    password: ""
  });
  setIsEditModalOpen(true);
};
```

- [ ] **Step 2: Update Edit Modal JSX**

Apply similar icon and error message patterns as Task 2 to the modal inputs.

- [ ] **Step 3: Commit**

```bash
git add prj-frontend/src/pages/admin/UserManagement.jsx
git commit -m "refactor: implement validation in UserManagement edit modal"
```

---

### Task 4: Final Polish & Verification

- [ ] **Step 1: Verify validation in browser**
Check that errors appear when entering invalid data (e.g., short password, invalid email).

- [ ] **Step 2: Verify successful submissions**
Confirm that users are still being added/updated correctly in the backend.

- [ ] **Step 3: Commit final polish**

```bash
git commit -m "style: final UI polish for user management forms"
```
