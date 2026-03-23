import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { courseService } from "../../service/courseService";
import { toast } from "sonner";
import { useAuthStore } from "../../stores/userAuthStore";

export const TeacherDashboard = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await courseService.getAllCourses();
                setCourses(data);
            } catch (error) {
                toast.error("Không thể tải danh sách khóa học");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const activeCourses = courses.filter(c => c.status === 'approved').length;

    return (
        <div style={{ padding: '3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827' }}>
                    Dashboard
                </h2>
                <button 
                    onClick={() => navigate("/instructor/addcourse")}
                    style={{ backgroundColor: '#000', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer', border: 'none' }}
                >
                    + Tạo khóa học mới
                </button>
            </div>
            <p style={{ color: '#4b5563', marginBottom: '2rem' }}>
                Chào mừng trở lại, {user?.fullname || 'Giảng viên'}.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
                    <h3 style={{ fontSize: '0.875rem', color: '#6b7280', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Tổng số khóa học</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827' }}>{loading ? "--" : courses.length}</p>
                </div>
                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
                    <h3 style={{ fontSize: '0.875rem', color: '#6b7280', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Khóa học hoạt động</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827' }}>{loading ? "--" : activeCourses}</p>
                </div>
            </div>

            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginTop: '3rem', marginBottom: '1.5rem' }}>Khóa học của tôi</h3>
            
            {loading ? (
                <p style={{ color: '#111827' }}>Đang tải danh sách...</p>
            ) : courses.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
                    {courses.map((course) => (
                        <div 
                            key={course.courseid} 
                            style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', cursor: 'pointer' }}
                            onClick={() => navigate(`/instructor/lessons/${course.courseid}`)}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <span style={{ padding: '0.25rem 0.6rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', border: '1px solid black', backgroundColor: course.status === 'approved' ? '#f0f0f0' : '#ffffff', color: 'black' }}>
                                    {course.status}
                                </span>
                                <span style={{ fontSize: '0.75rem', color: 'black' }}>ID: {course.courseid}</span>
                            </div>
                            <h4 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>{course.title}</h4>
                            <p style={{ fontSize: '0.875rem', color: '#4b5563' }}>
                                {course.description || "Chưa có mô tả chi tiết cho khóa học này..."}
                            </p>
                        </div>
                    ))}
                </div>
            ) : (
                <p style={{ color: '#6b7280' }}>Bạn chưa tạo khóa học nào.</p>
            )}
        </div>
    );
};