import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { courseService } from "../../service/courseService";
import { api } from "../../lib/axios";
import { toast } from "sonner";
import { useAuthStore } from "../../stores/userAuthStore";
import { BookOpen, CheckCircle, Plus, LayoutDashboard, Loader2, ArrowUpRight, GraduationCap, Users, Zap, Activity } from "lucide-react";
import { useTranslation } from "../../hooks/useTranslation";
import { StatCard } from "../../components/shared/StatCard";
import { MobileDashboard } from "../shared/MobileDashboard";
import { AnnouncementList } from "../../components/dashboard/AnnouncementList";

export const TeacherDashboard = () => {
    const [courses, setCourses] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
    const [loading, setLoading] = useState(true);
    const { user } = useAuthStore();
    const { t } = useTranslation();
    const navigate = useNavigate();

    const fetchAnnouncements = async () => {
        setLoadingAnnouncements(true);
        try {
            const res = await api.get('/announcements');
            setAnnouncements(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingAnnouncements(false);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await courseService.getAllCourses();
                setCourses(data);
                await fetchAnnouncements();
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
                <header className="flex items-center gap-6 mb-12 md:mb-16">
                    <div className="h-12 w-12 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-primary)] border border-[var(--border-color)] shadow-sm shrink-0">
                        <GraduationCap className="h-5 w-5 opacity-60" strokeWidth={1.5} />
                    </div>
                    <div className="flex flex-col">
                        <p className="text-[var(--text-secondary)] font-medium text-lg md:text-xl italic opacity-80 leading-relaxed truncate">
                            {t('dash_welcome', { name: user?.fullname || 'Educator' })}
                        </p>
                        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-[var(--text-secondary)] opacity-30 italic">{t('portal_teacher_sub')}</span>
                    </div>
                </header>

            {/* Quick Stats Grid */}
            <section 
                aria-label="Executive Statistics"
                className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 lg:gap-10 mb-12 md:mb-20"
            >
                <StatCard 
                    value={loading ? "..." : courses.length} 
                    icon={BookOpen}
                    to="/teacher/courses"
                    delayClass="stagger-1"
                />
                <StatCard 
                    value={loading ? "..." : activeCoursesCount} 
                    icon={CheckCircle}
                    color="accent"
                    delayClass="stagger-2"
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

            {/* Content Split: Announcements & My Curricula */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 md:gap-20 mb-24">
                <div className="lg:col-span-2 space-y-16">
                    <section className="space-y-8 md:space-y-12">
                         <div className="flex flex-col md:flex-row items-baseline justify-between gap-4 md:px-2">
                            <div className="space-y-2">
                                <h3 className="text-3xl md:text-4xl font-black text-[var(--text-primary)] tracking-tight italic">{t('dash_my_courses')}</h3>
                            </div>
                            <div className="h-px flex-1 mx-0 md:mx-10 bg-[var(--border-color)] opacity-20 w-full md:w-auto"></div>
                        </div>

                         {loading ? (
                            <div className="py-24 md:py-40 flex flex-col items-center justify-center glass-card border-dashed border-2 bg-white/5">
                                <Loader2 className="h-16 w-16 animate-spin text-[var(--accent-primary)] mb-6" />
                            </div>
                        ) : courses.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                                {courses.map((course, idx) => (
                                    <div key={course.courseid} className={`animate-fade-in-up stagger-${(idx % 4) + 1}`}>
                                        <article
                                            className="insta-card p-6 md:p-10 group cursor-pointer flex flex-col h-full active:scale-[0.98] transition-all hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] border-transparent hover:border-[var(--accent-primary)]/20"
                                            onClick={() => navigate(`/teacher/lessons/${course.courseid}`)}
                                        >
                                             <div className="flex justify-between items-start mb-10 md:mb-12">
                                                <span className={`
                                                    px-4 md:px-5 py-2 rounded-2xl text-[10px] font-black tracking-widest uppercase border shadow-sm backdrop-blur-md
                                                    ${course.status === 'approved'
                                                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                                        : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}
                                                `}>
                                                    {course.status === 'approved' ? t('status_approved') : t('status_pending')}
                                                </span>
                                            </div>
                                            <h4 className="text-2xl font-black text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors leading-[1.1] italic tracking-tight mb-4">
                                                {course.title}
                                            </h4>
                                            <p className="text-xs text-[var(--text-secondary)] font-medium line-clamp-2 italic opacity-70 leading-relaxed mb-8">
                                                {course.description}
                                            </p>
                                            <div className="pt-6 border-t border-[var(--border-color)] flex items-center justify-between">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-40">Manage Asset</span>
                                                <ArrowUpRight className="h-5 w-5 text-[var(--text-secondary)] opacity-20 group-hover:opacity-100 group-hover:text-[var(--accent-primary)] transition-all" />
                                            </div>
                                        </article>
                                    </div>
                                ))}
                            </div>
                        ) : null}
                    </section>
                </div>

                <div className="space-y-12">
                    <AnnouncementList announcements={announcements} loading={loadingAnnouncements} />
                </div>
            </div>
            </main>
        </div>
    );
};

