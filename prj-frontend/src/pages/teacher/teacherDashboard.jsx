import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { courseService } from "../../service/courseService";
import { toast } from "sonner";
import { useAuthStore } from "../../stores/userAuthStore";
import { BookOpen, CheckCircle, Plus, LayoutDashboard, Loader2, ArrowUpRight, GraduationCap, Users } from "lucide-react";
import { useTranslation } from "../../hooks/useTranslation";
import { StatCard } from "../../components/shared/StatCard";
import { MobileDashboard } from "../shared/MobileDashboard";

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

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-[var(--accent-primary)] opacity-20" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)] animate-pulse">
                {t('dashboard_syncing')}
            </p>
        </div>
    );

    return (
        <div className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto min-h-screen">
            {/* Mobile View */}
            <div className="md:hidden">
                <MobileDashboard />
            </div>

            {/* Desktop View */}
            <main 
                className="hidden md:block animate-fade-in-up" 
                aria-labelledby="dashboard-title"
            >
                {/* Header / Hero Section */}
                <header className="glass-card p-8 md:p-14 lg:p-16 relative overflow-hidden group mb-8 md:mb-12 shadow-2xl">
                <div className="absolute top-0 right-0 w-80 h-80 bg-[var(--accent-primary)] opacity-[0.03] rounded-full -mr-40 -mt-40 transition-transform duration-1000 group-hover:scale-125 pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 md:gap-12">
                    <div className="space-y-4 md:space-y-6">
                        <div className="flex items-center gap-4 md:gap-6">
                            <div className="h-14 w-14 rounded-2xl bg-[var(--accent-primary)] flex items-center justify-center text-[var(--bg-primary)] shadow-xl">
                                <GraduationCap className="h-6 w-6" strokeWidth={1.5} />
                            </div>
                            <div className="flex flex-col">
                                <h1 id="dashboard-title" className="text-3xl md:text-5xl lg:text-6xl font-black text-[var(--text-primary)] tracking-tighter italic leading-none">
                                    {t('portal_teacher')}
                                </h1>
                                <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-[var(--text-secondary)] opacity-40 italic">{t('portal_teacher_sub')}</span>
                            </div>
                        </div>
                        <p className="text-[var(--text-secondary)] font-medium text-base md:text-xl italic opacity-80 leading-relaxed max-w-2xl">
                            {t('dash_welcome', { name: user?.fullname || t('portal_teacher_sub') })}
                        </p>
                    </div>
                    <button
                        onClick={() => navigate("/teacher/addcourse")}
                        aria-label={t('course_create_aria') || "Initialize new academic curriculum"}
                        className="btn-primary flex items-center justify-center gap-3 !px-8 md:!px-12 h-14 md:h-16 text-[10px] md:text-xs font-black uppercase tracking-widest group shadow-2xl active:scale-95 transition-all w-full md:w-auto"
                    >
                        <Plus className="h-5 md:h-6 w-5 md:w-6 group-hover:rotate-90 transition-transform duration-500" />
                        {t('course_create')}
                    </button>
                </div>
            </header>

            {/* Quick Stats Grid */}
            <section 
                aria-label="Executive Statistics"
                className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 lg:gap-10 mb-12 md:mb-20"
            >
                <StatCard 
                    label={t('dash_total_courses')} 
                    value={loading ? "..." : courses.length} 
                    icon={BookOpen}
                />
                <StatCard 
                    label={t('dash_active_courses')} 
                    value={loading ? "..." : activeCoursesCount} 
                    icon={CheckCircle}
                    color="accent"
                />

                {/* Engagement / Students Placeholder */}
                <div className="animate-fade-in-up stagger-3 sm:col-span-2">
                    <div className="insta-card p-6 md:p-8 bg-[var(--text-primary)] text-[var(--bg-primary)] overflow-hidden relative group h-full border-none">
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
                        <h3 className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] opacity-60 mb-6 text-[var(--bg-primary)] relative z-10 flex items-center gap-2">
                            <Users className="h-4 w-4" /> {t('dash_scholar_engagement') || "SCHOLAR ENGAGEMENT"}
                        </h3>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-8 md:gap-12 relative z-10">
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl md:text-6xl font-black tracking-tighter italic">98%</span>
                                <span className="text-[10px] font-bold uppercase opacity-60 tracking-widest">{t('dash_uptime') || "Optimal"}</span>
                            </div>
                            <div className="hidden sm:block h-12 w-px bg-[var(--bg-primary)]/20" />
                            <p className="text-sm md:text-base font-medium italic opacity-80 max-w-sm leading-relaxed">
                                {t('system_status_desc') || "All academic infrastructure is performing at peak heuristic capacity."}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* My Curricula Content Section */}
            <section className="space-y-8 md:space-y-12 animate-fade-in-up stagger-4">
                <div className="flex flex-col md:flex-row items-baseline justify-between gap-4 md:px-2">
                    <div className="space-y-2">
                        <h3 className="text-3xl md:text-4xl lg:text-5xl font-black text-[var(--text-primary)] tracking-tight italic">{t('dash_my_courses')}</h3>
                        <p className="text-[10px] md:text-xs font-black text-[var(--text-secondary)] uppercase tracking-[0.4em] opacity-50 italic">
                            {t('dash_manage_curriculum_sub') || "SYNCHRONIZING ACADEMIC ASSETS"}
                        </p>
                    </div>
                    <div className="h-px flex-1 mx-0 md:mx-10 bg-[var(--border-color)] opacity-20 w-full md:w-auto"></div>
                </div>

                {loading ? (
                    <div className="py-24 md:py-40 flex flex-col items-center justify-center glass-card border-dashed border-2 bg-white/5">
                        <Loader2 className="h-16 w-16 animate-spin text-[var(--accent-primary)] mb-6" />
                        <p className="text-[var(--text-secondary)] font-black uppercase tracking-widest md:text-sm animate-pulse">{t('dash_teaching_sync') || "SYNCHRONIZING..."}</p>
                    </div>
                ) : courses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
                        {courses.map((course, idx) => (
                            <div
                                key={course.courseid}
                                className={`animate-fade-in-up stagger-${(idx % 4) + 1} h-full`}
                            >
                                <article
                                    className="insta-card p-6 md:p-10 group cursor-pointer flex flex-col h-full active:scale-[0.98] transition-all hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] border-transparent hover:border-[var(--accent-primary)]/20"
                                    onClick={() => navigate(`/teacher/lessons/${course.courseid}`)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => e.key === 'Enter' && navigate(`/teacher/lessons/${course.courseid}`)}
                                    aria-label={`${t('course_manage_aria') || "Manage curriculum"}: ${course.title}`}
                                >
                                    <div className="flex justify-between items-start mb-10 md:mb-12">
                                        <span className={`
                                            px-4 md:px-5 py-2 rounded-2xl text-[10px] font-black tracking-widest uppercase border shadow-sm backdrop-blur-md
                                            ${course.status === 'approved'
                                                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-emerald-500/5'
                                                : 'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-amber-500/5'}
                                        `}>
                                            {course.status === 'approved' ? t('status_approved') : t('status_pending')}
                                        </span>
                                        <span className="text-[10px] font-black text-[var(--text-secondary)] opacity-30 tracking-[0.2em] font-mono">#{course.courseid}</span>
                                    </div>

                                    <div className="space-y-4 md:space-y-6 flex-1 mb-10 md:mb-12">
                                        <h4 className="text-2xl md:text-3xl font-black text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors leading-[1.1] italic tracking-tight">
                                            {course.title}
                                        </h4>
                                        <p className="text-sm md:text-base text-[var(--text-secondary)] font-medium line-clamp-3 italic opacity-70 leading-relaxed hyphens-auto break-words">
                                            {course.description || t('course_empty_teacher_sub')}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between pt-8 md:pt-10 border-t border-[var(--border-color)] group-hover:border-[var(--accent-primary)]/20 transition-all duration-700">
                                        <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-[var(--text-secondary)] group-hover:text-[var(--accent-primary)] transition-colors italic">
                                            {t('course_manage')}
                                        </span>
                                        <div className="h-12 md:h-14 w-12 md:w-14 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-secondary)] group-hover:bg-[var(--accent-primary)] group-hover:text-white transition-all duration-500 shadow-inner group-hover:rotate-12">
                                            <ArrowUpRight className="h-7 md:h-8 w-7 md:w-8 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        </div>
                                    </div>
                                </article>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="glass-card p-16 md:p-32 text-center flex flex-col items-center bg-white/5 border-dashed border-2 transition-all hover:bg-white/10 group">
                        <div className="w-20 md:w-28 h-20 md:h-28 bg-[var(--bg-secondary)] rounded-[2.5rem] md:rounded-[3rem] flex items-center justify-center mb-10 shadow-inner group-hover:scale-110 transition-transform duration-700">
                            <BookOpen className="h-10 md:h-14 w-10 md:w-14 text-[var(--text-secondary)] opacity-10" />
                        </div>
                        <h3 className="text-3xl md:text-5xl font-black text-[var(--text-primary)] mb-6 tracking-tighter italic">{t('course_empty_teacher')}</h3>
                        <p className="text-[var(--text-secondary)] text-base md:text-xl max-w-lg mb-12 font-medium italic opacity-60 leading-relaxed">
                            {t('course_empty_teacher_sub')}
                        </p>
                        <button
                            onClick={() => navigate("/teacher/addcourse")}
                            aria-label={t('course_create_aria') || "Initialize first curriculum"}
                            className="btn-primary !px-12 md:!px-16 py-5 md:py-6 text-[10px] md:text-xs font-black uppercase tracking-widest shadow-3xl active:scale-95 transition-all"
                        >
                            {t('course_create')}
                        </button>
                    </div>
                )}
            </section>
        </main>
        </div>
    );
};
