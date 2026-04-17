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
import SharedCalendar from "../../components/shared/SharedCalendar";


export const TeacherDashboard = () => {
    const [courses, setCourses] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
    const [summary, setSummary] = useState(null);
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
                const [courseData, summaryRes] = await Promise.all([
                    courseService.getAllCourses(),
                    api.get("/dashboard/summary")
                ]);
                setCourses(courseData);
                setSummary(summaryRes.data);
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
            <main className="hidden md:block animate-fade-in-up" role="main" aria-labelledby="dashboard-title">
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

                {/* Quick Discovery Navigation Hub */}
                <section className="mb-12 md:mb-20">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)] opacity-60 mb-6 italic">Quick Discovery</h2>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        <button onClick={() => navigate('/teacher/students')} className="insta-card p-6 flex flex-col items-start text-left group hover:bg-[var(--bg-secondary)] transition-all">
                            <Users className="h-6 w-6 mb-4 opacity-60 group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-black uppercase tracking-wider italic">Scholars Hub</span>
                            <span className="text-[9px] font-medium opacity-40 mt-1 uppercase tracking-widest">Manage Students</span>
                        </button>
                        <button onClick={() => navigate('/teacher/courses')} className="insta-card p-6 flex flex-col items-start text-left group hover:bg-[var(--bg-secondary)] transition-all">
                            <BookOpen className="h-6 w-6 mb-4 opacity-60 group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-black uppercase tracking-wider italic">Active Academy</span>
                            <span className="text-[9px] font-medium opacity-40 mt-1 uppercase tracking-widest">Course Registry</span>
                        </button>
                        <button onClick={() => navigate('/teacher/assignments')} className="insta-card p-6 flex flex-col items-start text-left group hover:bg-[var(--bg-secondary)] transition-all">
                            <CheckCircle className="h-6 w-6 mb-4 opacity-60 group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-black uppercase tracking-wider italic">Evaluations</span>
                            <span className="text-[9px] font-medium opacity-40 mt-1 uppercase tracking-widest">Pending Grading</span>
                        </button>
                        <button onClick={() => navigate('/teacher/settings')} className="insta-card p-6 flex flex-col items-start text-left group hover:bg-[var(--bg-secondary)] transition-all">
                            <LayoutDashboard className="h-6 w-6 mb-4 opacity-60 group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-black uppercase tracking-wider italic">Office Settings</span>
                            <span className="text-[9px] font-medium opacity-40 mt-1 uppercase tracking-widest">Portal Params</span>
                        </button>
                    </div>
                </section>

                <section className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-10 mb-12 md:mb-20">
                    <div className="lg:col-span-1 flex flex-col gap-8">
                        <StatCard 
                            label={t('dash_total_courses')}
                            value={loading ? "..." : courses.length} 
                            icon={BookOpen}
                        />
                        <StatCard 
                            label="Active Scholars"
                            value={loading ? "..." : summary?.data?.scholarCount || 0} 
                            icon={Users}
                            color="accent"
                        />
                    </div>
                    {/* Expanded Calendar */}
                    <div className="animate-fade-in-up stagger-3 lg:col-span-3">
                        <SharedCalendar events={summary?.data?.calendarEvents || []} variant="mini" />
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 md:gap-20 pb-32">
                    <div className="lg:col-span-2 space-y-16">
                        <section className="space-y-8">
                             <div className="flex items-center gap-4">
                                <h3 className="text-2xl font-black text-[var(--text-primary)] tracking-tighter uppercase italic">{t('dash_my_courses')}</h3>
                                <div className="h-px flex-1 bg-[var(--border-color)] opacity-20"></div>
                            </div>

                             {loading ? (
                                <div className="py-24 flex flex-col items-center justify-center glass-card border-dashed border-2 bg-white/5">
                                    <Loader2 className="h-16 w-16 animate-spin text-[var(--accent-primary)] mb-6" />
                                </div>
                            ) : courses.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {courses.map((course, idx) => (
                                        <article
                                            key={course.courseid}
                                            className={`insta-card p-6 group cursor-pointer flex flex-col h-full animate-fade-in-up stagger-${(idx % 4) + 1}`}
                                            onClick={() => navigate(`/teacher/lessons/${course.courseid}`)}
                                        >
                                             <div className="flex justify-between items-start mb-6">
                                                <span className={`
                                                    px-3 py-1 rounded-xl text-[8px] font-black tracking-widest uppercase border backdrop-blur-md
                                                    ${course.status === 'approved'
                                                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                                        : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}
                                                `}>
                                                    {course.status === 'approved' ? t('status_approved') : t('status_pending')}
                                                </span>
                                            </div>
                                            <h4 className="text-lg font-black text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors leading-tight italic tracking-tight mb-2 truncate">
                                                {course.title}
                                            </h4>
                                            <p className="text-[11px] text-[var(--text-secondary)] font-medium line-clamp-2 italic opacity-70 leading-relaxed mb-6">
                                                {course.description}
                                            </p>
                                            <div className="mt-auto pt-4 border-t border-[var(--border-color)] flex items-center justify-between">
                                                <span className="text-[8px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-40">Manage Academy</span>
                                                <ArrowUpRight className="h-4 w-4 text-[var(--text-secondary)] opacity-20 group-hover:opacity-100 group-hover:text-[var(--accent-primary)] transition-all" />
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            ) : null}
                        </section>

                        <AnnouncementList announcements={announcements} loading={loadingAnnouncements} limit={3} />
                    </div>

                    <aside className="space-y-8">
                         {/* Recent Activity Log */}
                         <div className="insta-card p-8 md:p-10 border-dashed border-2 bg-white/5 flex flex-col group">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-6 flex items-center gap-2">
                                <Activity className="h-4 w-4" /> Instructor Feed
                            </h4>
                            {(!summary?.data?.recentActivities || summary.data.recentActivities.length === 0) ? (
                                <p className="text-[10px] font-medium italic opacity-40 text-center py-4">{t('dashboard_no_activity')}</p>
                            ) : (
                                <ul className="space-y-4">
                                    {summary.data.recentActivities.map((act, idx) => (
                                        <li key={act.id || idx} className="flex flex-col gap-2 border-b border-[var(--border-color)]/50 pb-4 last:border-0">
                                            <p className="text-xs font-medium italic opacity-80 leading-relaxed text-[var(--text-primary)]">
                                                {act.action === 'visit_lesson' && `Reviewed lesson: ${act.details?.lessonTitle || 'Unknown'}`}
                                                {act.action === 'grade_submission' && `Graded student submission`}
                                                {act.action === 'create_assignment' && `Created new assessment`}
                                                {act.action !== 'visit_lesson' && act.action !== 'grade_submission' && act.action !== 'create_assignment' && act.action.replace(/_/g, ' ')}
                                            </p>
                                            <span className="text-[9px] font-black text-[var(--text-secondary)] opacity-40 uppercase tracking-widest">
                                                {new Date(act.created_at).toLocaleString()}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
};

