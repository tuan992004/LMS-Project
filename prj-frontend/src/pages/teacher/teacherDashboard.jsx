import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { courseService } from "../../service/courseService";
import { toast } from "sonner";
import { useAuthStore } from "../../stores/userAuthStore";
import { ChevronRight } from "lucide-react"; // Import thêm icon để tăng trải nghiệm người dùng

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

    return (
        <div style={{ padding: '2rem', backgroundColor: '#f9fafb', minHeight: '100vh', color: 'black' }}>
            {/* Header */}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'black' }}>Teacher Dashboard</h1>
                    <p style={{ color: 'black' }}>Chào mừng trở lại, {user?.fullname || 'Giảng viên'}!</p>
                </div>
                <button 
                    onClick={() => navigate("/admin/addcourse")}
                    style={primaryBtnStyle}
                >
                    + Tạo khóa học mới
                </button>
            </header>

            {/* Stats Overview */}
            <div style={statsGridStyle}>
                <div style={statCardStyle}>
                    <span style={statLabelStyle}>Tổng số khóa học</span>
                    <span style={statValueStyle}>{courses.length}</span>
                </div>
                <div style={statCardStyle}>
                    <span style={statLabelStyle}>Trạng thái hoạt động</span>
                    <span style={{...statValueStyle, color: 'black'}}>Sẵn sàng</span>
                </div>
            </div>

            {/* Courses Grid */}
            {loading ? (
                <p style={{ color: 'black' }}>Đang tải danh sách...</p>
            ) : (
                <div style={courseGridStyle}>
                    {courses.map((course) => (
                        <div 
                            key={course.courseid} 
                            style={courseCardStyle}
                            onClick={() => navigate(`/instructor/lessons/${course.courseid}`)}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = 'black';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = '#e5e7eb';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            <div style={cardHeaderStyle}>
                                <span style={badgeStyle(course.status)}>
                                    {course.status}
                                </span>
                                <span style={{ fontSize: '0.75rem', color: 'black' }}>ID: {course.courseid}</span>
                            </div>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ flex: 1 }}>
                                    <h3 style={courseTitleStyle}>{course.title}</h3>
                                    <p style={courseDescStyle}>
                                        {course.description || "Chưa có mô tả chi tiết cho khóa học này..."}
                                    </p>
                                </div>
                                <ChevronRight size={20} color="black" style={{ marginTop: '4px', marginLeft: '10px' }} />
                            </div>
                        </div>  
                    ))}
                </div>
            )}
        </div>
    );
};

// --- Styles Updated ---
const statsGridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' };
const statCardStyle = { backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid black', display: 'flex', flexDirection: 'column' };
const statLabelStyle = { fontSize: '0.875rem', color: 'black', fontWeight: '500' };
const statValueStyle = { fontSize: '1.5rem', fontWeight: '700', marginTop: '0.25rem', color: 'black' };

const courseGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' };

const courseCardStyle = { 
    backgroundColor: 'white', 
    borderRadius: '1rem', 
    border: '1px solid #e5e7eb', 
    padding: '1.5rem', 
    display: 'flex', 
    flexDirection: 'column', 
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
};

const cardHeaderStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' };
const courseTitleStyle = { fontSize: '1.25rem', fontWeight: 'bold', color: 'black', marginBottom: '0.75rem' };
const courseDescStyle = { 
    fontSize: '0.875rem', 
    color: 'black', 
    marginBottom: '0.5rem', 
    lineClamp: 2, 
    overflow: 'hidden', 
    display: '-webkit-box', 
    WebkitBoxOrient: 'vertical', 
    WebkitLineClamp: 2 
};

const primaryBtnStyle = { backgroundColor: '#000', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: '600', border: '1px solid black', cursor: 'pointer' };

const badgeStyle = (status) => ({
    padding: '0.25rem 0.6rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    border: '1px solid black',
    backgroundColor: status === 'approved' ? '#f0f0f0' : '#ffffff',
    color: 'black'
});