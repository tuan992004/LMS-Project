import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { courseService } from "../../service/courseService";
import { toast } from "sonner";
import { useAuthStore } from "../../stores/userAuthStore";
import { BookOpen, CheckCircle, Plus, LayoutDashboard, Loader2 } from "lucide-react";
import { useTranslation } from "../../hooks/useTranslation";

export const TeacherDashboard = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuthStore();
    const { t } = useTranslation();
    const navigate = useNavigate();

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await courseService.getAllCourses();
                setCourses(data);
            } catch (error) {
                toast.error(t('alert_error'));
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const activeCoursesCount = courses.filter(c => c.status === 'approved').length;

    return (
        <div className="p-8 max-w-7xl mx-auto min-h-screen animate-fade-in-up">
            {/* Header / Hero */}
            <header className="glass-card p-12 relative overflow-hidden group mb-12 shadow-2xl">
                <div className="absolute top-0 right-0 w-80 h-80 bg-[var(--accent-primary)] opacity-[0.03] rounded-full -mr-40 -mt-40 transition-transform duration-1000 group-hover:scale-125" />

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-2xl bg-[var(--accent-primary)]/10 flex items-center justify-center text-[var(--accent-primary)] shadow-inner">
                                <LayoutDashboard className="h-8 w-8" />
                            </div>
                            <h2 className="text-4xl font-black text-[var(--text-primary)] tracking-tight italic">
                                {t('portal_teacher')}
                            </h2>
                        </div>
                        <p className="text-[var(--text-secondary)] font-medium text-lg italic opacity-80">
                            {t('dash_welcome', { name: user?.fullname || t('portal_teacher_sub') })}
                        </p>
                    </div>
                    <button
                        onClick={() => navigate("/teacher/addcourse")}
                        className="btn-primary !px-10 !py-5 text-[10px] uppercase tracking-widest group shadow-2xl"
                    >
                        <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                        {t('course_create')}
                    </button>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                <div className="animate-fade-in-up stagger-1">
                    <div className="insta-card p-8 border-l-4 border-l-[var(--accent-primary)] group h-full transition-all hover:translate-y-[-4px]">
                        <h3 className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-4 opacity-50">{t('dash_total_courses')}</h3>
                        <div className="flex items-end justify-between">
                            <p className="text-5xl font-black text-[var(--text-primary)] tracking-tighter">
                                {loading ? <Loader2 className="h-10 w-10 animate-spin text-[var(--accent-primary)]" /> : courses.length}
                            </p>
                            <BookOpen className="h-10 w-10 text-[var(--text-secondary)] opacity-10 group-hover:text-[var(--accent-primary)] group-hover:opacity-20 transition-all duration-500" />
                        </div>
                    </div>
                </div>

                <div className="animate-fade-in-up stagger-2">
                    <div className="insta-card p-8 border-l-4 border-l-emerald-500 group h-full transition-all hover:translate-y-[-4px]">
                        <h3 className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-4 opacity-50">{t('dash_active_courses')}</h3>
                        <div className="flex items-end justify-between">
                            <p className="text-5xl font-black text-[var(--text-primary)] tracking-tighter">
                                {loading ? <Loader2 className="h-10 w-10 animate-spin text-emerald-500" /> : activeCoursesCount}
                            </p>
                            <CheckCircle className="h-10 w-10 text-emerald-500 opacity-10 group-hover:opacity-20 transition-all duration-500" />
                        </div>
                    </div>
                </div>

                {/* Engagement Placeholder */}
                <div className="animate-fade-in-up stagger-3 lg:col-span-2">
                    <div className="insta-card p-8 bg-[var(--text-primary)] text-[var(--bg-primary)] overflow-hidden relative group h-full">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/5 pointer-events-none" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-4 text-[var(--bg-primary)] relative z-10">{t('dash_system_status')}</h3>
                        <div className="flex items-center gap-6 relative z-10">
                            <div className="flex items-end gap-2">
                                <span className="text-4xl font-black tracking-tighter">100%</span>
                                <span className="text-[10px] font-bold mb-1.5 uppercase opacity-60">Uptime</span>
                            </div>
                            <div className="h-10 w-px bg-[var(--bg-primary)]/20" />
                            <p className="text-xs font-medium italic opacity-80 max-w-xs">{t('system_status_desc') || "All services are performing at peak capacity."}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* My Courses Section */}
            <section className="space-y-10 animate-fade-in-up stagger-4">
                <div className="flex items-end justify-between px-2">
                    <div className="space-y-1">
                        <h3 className="text-2xl font-black text-[var(--text-primary)] tracking-tight italic">{t('dash_my_courses')}</h3>
                        <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest opacity-60">{t('dash_manage_curriculum_sub') || "Manage content and scholars"}</p>
                    </div>
                    <div className="h-px flex-1 mx-8 bg-[var(--border-color)] hidden md:block opacity-50"></div>
                </div>

                {loading ? (
                    <div className="py-32 flex flex-col items-center justify-center glass-card border-dashed bg-white/5">
                        <Loader2 className="h-12 w-12 animate-spin text-[var(--accent-primary)] mb-4" />
                        <p className="text-[var(--text-secondary)] font-bold italic animate-pulse">{t('dash_teaching_sync') || "Synchronizing data..."}</p>
                    </div>
                ) : courses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {courses.map((course, idx) => (
                            <div
                                key={course.courseid}
                                className={`animate-fade-in-up stagger-${(idx % 4) + 1}`}
                            >
                                <div
                                    className="insta-card p-8 group cursor-pointer flex flex-col h-full active:scale-[0.98] transition-all"
                                    onClick={() => navigate(`/teacher/lessons/${course.courseid}`)}
                                >
                                    <div className="flex justify-between items-start mb-8">
                                        <span className={`
                                            px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border shadow-sm
                                            ${course.status === 'approved'
                                                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                                : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}
                                        `}>
                                            {course.status === 'approved' ? t('status_approved') : t('status_pending')}
                                        </span>
                                        <span className="text-[10px] font-black text-[var(--text-secondary)] opacity-30 tracking-widest">ID:{course.courseid}</span>
                                    </div>

                                    <h4 className="text-2xl font-bold text-[var(--text-primary)] mb-4 group-hover:text-[var(--accent-primary)] transition-colors leading-tight">
                                        {course.title}
                                    </h4>

                                    <p className="text-sm text-[var(--text-secondary)] font-medium line-clamp-3 mb-10 flex-1 italic opacity-80 leading-relaxed">
                                        {course.description || t('course_empty_teacher_sub')}
                                    </p>

                                    <div className="flex items-center justify-between pt-8 border-t border-[var(--border-color)] group-hover:border-[var(--accent-primary)]/20 transition-all duration-500">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] group-hover:text-[var(--accent-primary)] transition-colors">{t('course_manage')}</span>
                                        <div className="h-10 w-10 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-secondary)] group-hover:bg-[var(--accent-primary)] group-hover:text-white transition-all duration-500 shadow-inner">
                                            <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="glass-card p-24 text-center flex flex-col items-center bg-white/5 border-dashed border-2">
                        <div className="w-24 h-24 bg-[var(--bg-secondary)] rounded-[2.5rem] flex items-center justify-center mb-10 shadow-inner">
                            <BookOpen className="h-12 w-12 text-[var(--text-secondary)] opacity-10" />
                        </div>
                        <h3 className="text-3xl font-black text-[var(--text-primary)] mb-4 tracking-tighter">{t('course_empty_teacher')}</h3>
                        <p className="text-[var(--text-secondary)] max-w-md mb-12 font-medium italic opacity-60 leading-relaxed">
                            {t('course_empty_teacher_sub')}
                        </p>
                        <button
                            onClick={() => navigate("/teacher/addcourse")}
                            className="btn-primary px-12 py-5 text-[10px] uppercase tracking-widest shadow-2xl active:scale-95 transition-all"
                        >
                            {t('course_create')}
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
};
