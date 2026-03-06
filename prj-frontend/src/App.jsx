import { useState, useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { LoginPage } from "./pages/logInPage";
import { TestPage } from "./pages/TestPage";
import AddUserPage from "./pages/admin/AddUserPage";
import { CourseManagement } from "./pages/admin/CourseManagement";
import { UserManagement } from "./pages/admin/UserManagement";
import { StudentDashboard } from "./pages/student/StudentDashboard";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { Toaster } from "sonner";
import { RoleRedirect } from "./components/auth/RoleRedirect";
import { useAuthStore } from "./stores/userAuthStore";
import { AdminLayout } from "./components/admin/AdminLayout";
import { AdminDashboard } from "./pages/admin/adminDashboard";
import AddCoursePage from "./pages/admin/AddCoursePage";
import { TeacherDashboard } from "./pages/teacher/teacherDashboard";
import { TeacherLayout } from "./components/teacher/TeacherLayour";

// IMPORT CÁC COMPONENT MỚI Ở ĐÂY
import { CourseLayout } from "./components/courses/CourseLayout";
import { LessonLayout } from "./components/courses/lessons/LessonLayout";
import { StudentLayout } from "./components/student/StudentLayout";
import { StudentCourses } from "./pages/student/StudentCourses";
import { Settings } from "./pages/shared/Settings";

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
              <Route path="/admin/addcourse" element={<AddCoursePage />} />
              <Route path="/admin/settings" element={<Settings />} />
              <Route path="/adduser" element={<AddUserPage />} />

              {/* 1. Trang quản lý danh sách bài giảng của 1 khóa học */}
              <Route path="admin/lessons/:courseid" element={<CourseLayout />} />
            </Route>
          </Route>

          {/* Instructor (Giảng viên) */}
          <Route element={<ProtectedRoute allowedRoles={["instructor"]} />}>
            <Route element={<TeacherLayout />}>
              <Route path="/instructor" element={<TeacherDashboard />} />
              <Route path="/instructor/settings" element={<Settings />} />
              {/* Thêm Route quản lý khóa học và bài học cho Giảng viên */}
              <Route path="/instructor/course/:courseid" element={<CourseLayout />} />
              <Route path="/instructor/course/:courseid/lesson/:lessonid" element={<LessonLayout />} />
              {/* 1. Trang quản lý danh sách bài giảng của 1 khóa học */}
              <Route path="/instructor/lessons/:courseid" element={<CourseLayout />} />
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