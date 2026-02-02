import { useState, useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { LoginPage } from "./pages/logInPage";
import { TestPage } from "./pages/TestPage";
import AddUserPage from "./pages/admin/AddUserPage";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { UserManagement } from "./pages/admin/UserManagement";
import { CourseManagement } from "./pages/admin/CourseManagement";
import { StudentDashboard } from "./pages/student/StudentDashboard";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { Toaster } from "sonner";
import { RoleRedirect } from "./components/auth/RoleRedirect";
import { useAuthStore } from "./stores/userAuthStore";
import { AdminLayout } from "./components/admin/AdminLayout";

function App() {
  const { refresh, loading } = useAuthStore();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    refresh().finally(() => setCheckingAuth(false));
  }, []);

  if (checkingAuth) return <div>Khởi động ứng dụng...</div>;
  return (
    <>
      <Toaster richColors />
      <BrowserRouter>
        <Routes>
          {/* Root redirect */}
          <Route path="/" element={<LoginPage />} />

          {/* Public */}
          <Route path="/login" element={<LoginPage />} />

          {/* Admin */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/courses" element={<CourseManagement />} />
              <Route path="/adduser" element={<AddUserPage />} />
            </Route>
          </Route>

          {/* Student */}
          <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
            <Route path="/student" element={<StudentDashboard />} />
          </Route>

          <Route path="/unauthorized" element={<h1>403 - Không có quyền</h1>} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
