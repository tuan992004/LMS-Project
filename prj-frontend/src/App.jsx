import { useState, useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

// Utility/Auth/Stores
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { Toaster } from "sonner";
import { RoleRedirect } from "./components/auth/RoleRedirect";
import { useAuthStore } from "./stores/userAuthStore";
import useThemeStore from "./stores/useThemeStore";
import useLanguageStore from "./stores/useLanguageStore";

// Layouts & Portals
import { AdminLayout } from "./components/admin/AdminLayout";
import { TeacherLayout } from "./components/teacher/TeacherLayout";
import { StudentLayout } from "./components/student/StudentLayout";
import { CourseLayout } from "./components/courses/CourseLayout";
import { LessonLayout } from "./components/courses/lessons/LessonLayout";

// Pages
import { LoginPage } from "./pages/logInPage";
import { TestPage } from "./pages/TestPage";
import AddUserPage from "./pages/admin/AddUserPage";
import { CourseManagement } from "./pages/admin/CourseManagement";
import { UserManagement } from "./pages/admin/UserManagement";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { TeacherDashboard } from "./pages/teacher/TeacherDashboard";
import { StudentDashboard } from "./pages/student/StudentDashboard";
import { AssignmentDetail } from "./pages/shared/AssignmentDetail";
import AddCoursePage from "./pages/admin/AddCoursePage";
import { Settings } from "./pages/shared/Settings";
import { TeacherAssignments } from "./pages/teacher/TeacherAssignments";
import { TeacherStudents } from "./pages/teacher/TeacherStudents";
import { StudentCourses } from "./pages/student/StudentCourses";

function App() {
  const { refresh, loading } = useAuthStore();
  const { theme } = useThemeStore();
  const { language } = useLanguageStore();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    refresh().finally(() => setCheckingAuth(false));
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  if (checkingAuth) return <div>Loading Application...</div>;

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
              <Route path="/admin/addcourse" element={<AddCoursePage />} />
              <Route path="/admin/settings" element={<Settings />} />
              <Route path="/adduser" element={<AddUserPage />} />

              {/* 1. Trang quản lý danh sách bài giảng của 1 khóa học */}
              <Route path="admin/lessons/:courseid" element={<CourseLayout />} />
              <Route path="admin/assignment/:assignment_id" element={<AssignmentDetail />} />
            </Route>
          </Route>

          {/* Teacher (Giảng viên) */}
          <Route element={<ProtectedRoute allowedRoles={["instructor"]} />}>
            <Route element={<TeacherLayout />}>
              <Route path="/teacher" element={<TeacherDashboard />} />
              <Route path="/teacher/courses" element={<CourseManagement />} />
              <Route path="/teacher/addcourse" element={<AddCoursePage />} />
              <Route path="/teacher/settings" element={<Settings />} />
              {/* Thêm Route quản lý khóa học và bài học cho Giảng viên */}
              <Route path="/teacher/course/:courseid" element={<CourseLayout />} />
              <Route path="/teacher/course/:courseid/lesson/:lessonid" element={<LessonLayout />} />
              <Route path="/teacher/assignments" element={<TeacherAssignments />} />
              <Route path="/teacher/students" element={<TeacherStudents />} />
              {/* 1. Trang quản lý danh sách bài giảng của 1 khóa học */}
              <Route path="/teacher/lessons/:courseid" element={<CourseLayout />} />
              <Route path="/teacher/course/:courseid/assignment/:assignment_id" element={<AssignmentDetail />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["instructor", "admin"]} />}>
            <Route path="/course/:courseid/lesson/:lessonid" element={<LessonLayout />} />
            <Route path="/course/:courseid/lesson/new" element={<LessonLayout />} />
          </Route>
          {/* Student */}
          <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
            <Route element={<StudentLayout />}>
              <Route path="/student" element={<StudentDashboard />} />
              <Route path="/student/courses" element={<StudentCourses />} />
              <Route path="/student/course/:courseid" element={<CourseLayout />} />
              <Route path="/student/assignment/:assignment_id" element={<AssignmentDetail />} />
              <Route path="/student/settings" element={<Settings />} />
            </Route>
          </Route>

          <Route path="/unauthorized" element={<h1>403 - Không có quyền</h1>} />
          {/* Route bắt lỗi 404 để không bị trắng trang hoàn toàn */}
          <Route path="*" element={<h1>404 - Trang không tồn tại</h1>} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;