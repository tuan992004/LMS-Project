import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { courseService } from "../../service/courseService";
import { toast } from "sonner";
import { useAuthStore } from "../../stores/userAuthStore";
import { BookOpen, CheckCircle, Plus, LayoutDashboard, Loader2 } from "lucide-react";

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

    const activeCoursesCount = courses.filter(c => c.status === 'approved').length;

    return (
        <div className="p-8 max-w-7xl mx-auto min-h-screen">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                <div>
                    <h2 className="text-4xl font-black text-[var(--text-primary)] tracking-tight flex items-center gap-3">
                        <LayoutDashboard className="h-10 w-10 text-[var(--accent-primary)]" />
                        Dashboard
                    </h2>
                    <p className="text-[var(--text-secondary)] mt-2 font-medium">
                        Chào mừng trở lại, <span className="text-[var(--text-primary)] font-bold">{user?.fullname || 'Giảng viên'}</span>.
                    </p>
                </div>
                <button 
                    onClick={() => navigate("/instructor/addcourse")}
                    className="flex items-center gap-2 bg-[var(--text-primary)] text-[var(--bg-primary)] px-8 py-4 rounded-2xl font-bold hover:opacity-90 transition-all shadow-xl active:scale-95 group"
                >
                    <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform" />
                    Tạo khóa học mới
                </button>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <div className="glass-card p-6 border-l-4 border-l-[var(--accent-primary)]">
                    <h3 className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest mb-2">Tổng số khóa học</h3>
                    <div className="flex items-end gap-2">
                        <p className="text-4xl font-black text-[var(--text-primary)]">
                            {loading ? <Loader2 className="h-8 w-8 animate-spin" /> : courses.length}
                        </p>
                        <BookOpen className="h-6 w-6 text-[var(--text-secondary)] mb-1 opacity-20" />
                    </div>
                </div>
                
                <div className="glass-card p-6 border-l-4 border-l-emerald-500">
                    <h3 className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest mb-2">Khóa học hoạt động</h3>
                    <div className="flex items-end gap-2">
                        <p className="text-4xl font-black text-[var(--text-primary)]">
                            {loading ? <Loader2 className="h-8 w-8 animate-spin" /> : activeCoursesCount}
                        </p>
                        <CheckCircle className="h-6 w-6 text-emerald-500 mb-1 opacity-20" />
                    </div>
                </div>
            </div>

            {/* My Courses Section */}
            <div className="flex items-center gap-4 mb-8">
                <h3 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">Khóa học của tôi</h3>
                <div className="h-px flex-1 bg-[var(--border-color)]"></div>
            </div>
            
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="h-12 w-12 animate-spin text-[var(--accent-primary)] mb-4" />
                    <p className="text-[var(--text-secondary)] font-bold animate-pulse">Đang tải danh sách khóa học...</p>
                </div>
            ) : courses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {courses.map((course) => (
                        <div 
                            key={course.courseid} 
                            className="insta-card p-8 group cursor-pointer flex flex-col h-full"
                            onClick={() => navigate(`/instructor/lessons/${course.courseid}`)}
                        >
                            <div className="flex justify-between items-start mb-6">
                                <span className={`
                                    px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border
                                    ${course.status === 'approved' 
                                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                                        : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}
                                `}>
                                    {course.status}
                                </span>
                                <span className="text-[10px] font-mono text-[var(--text-secondary)] opacity-60">ID: {course.courseid}</span>
                            </div>
                            
                            <h4 className="text-xl font-bold text-[var(--text-primary)] mb-3 group-hover:text-[var(--accent-primary)] transition-colors leading-tight">
                                {course.title}
                            </h4>
                            
                            <p className="text-sm text-[var(--text-secondary)] font-medium line-clamp-3 mb-8 flex-1">
                                {course.description || "Chưa có mô tả chi tiết cho khóa học này..."}
                            </p>

                            <div className="flex items-center justify-between pt-6 border-t border-[var(--border-color)] group-hover:border-[var(--accent-primary)]/20 transition-colors">
                                <span className="text-xs font-bold text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">Manage Content</span>
                                <Plus className="h-4 w-4 text-[var(--text-secondary)] group-hover:text-[var(--accent-primary)] transition-all group-hover:translate-x-1" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="glass-card p-20 text-center flex flex-col items-center">
                    <div className="w-20 h-20 bg-[var(--bg-secondary)] rounded-3xl flex items-center justify-center mb-6">
                        <BookOpen className="h-10 w-10 text-[var(--text-secondary)] opacity-20" />
                    </div>
                    <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Bạn chưa tạo khóa học nào</h3>
                    <p className="text-[var(--text-secondary)] max-w-md mb-8">
                        Bắt đầu hành trình giảng dạy của bạn bằng cách tạo khóa học đầu tiên ngay hôm nay.
                    </p>
                    <button 
                        onClick={() => navigate("/instructor/addcourse")}
                        className="bg-[var(--text-primary)] text-[var(--bg-primary)] px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-all shadow-xl"
                    >
                        Tạo khóa học đầu tiên
                    </button>
                </div>
            )}
        </div>
    );
};
