import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/userAuthStore';
import { api } from '../../lib/axios';
import { useNavigate } from 'react-router-dom';
import { BookOpen, CheckCircle, ArrowRight, Loader2, GraduationCap, Trophy, Target, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { StatCard } from '../../components/shared/StatCard';
import MobileListItem from '../../components/shared/MobileListItem';
import { MobileDashboard } from '../shared/MobileDashboard';

export const StudentDashboard = () => {
    const user = useAuthStore((s) => s.user);
    const { t } = useTranslation();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        api.get("/courses/my-enrolled")
           .then(res => setCourses(res.data))
           .catch(err => console.error(err))
           .finally(() => setLoading(false));
    }, []);

    const completedLessons = 12; // Placeholder for now

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-[var(--accent-primary)] opacity-20" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)] animate-pulse">
                {t('dashboard_syncing')}
            </p>
        </div>
    );


    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 lg:p-12 pb-32">
            {/* Mobile View (< md) */}
            <div className="md:hidden">
                <MobileDashboard />
            </div>

            {/* Desktop View (>= md) */}
            <main 
                className="hidden md:block space-y-10 md:space-y-16 animate-fade-in-up"
                role="main"
                aria-labelledby="student-dash-title"
            >
                {/* Academic Hero Header */}
                <header className="relative p-8 md:p-14 lg:p-16 glass-card overflow-hidden group shadow-2xl">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--accent-primary)] opacity-[0.03] rounded-full -mr-64 -mt-64 transition-transform duration-1000 group-hover:scale-110 pointer-events-none" />
                <div className="relative z-10 space-y-6">
                    <div className="flex items-center gap-6">
                        <div className="h-14 w-14 rounded-2xl bg-[var(--accent-primary)] flex items-center justify-center text-[var(--bg-primary)] shadow-xl">
                            <ShieldCheck className="h-6 w-6" strokeWidth={1.5} />
                        </div>
                        <div className="space-y-1">
                            <h1 id="student-dash-title" className="text-3xl md:text-5xl lg:text-7xl font-black text-[var(--text-primary)] tracking-tighter italic leading-none">
                                {t('nav_learning_hub') || "Learning Hub"}
                            </h1>
                            <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-[var(--text-secondary)] opacity-40 italic">{t('portal_student_sub')}</span>
                        </div>
                    </div>
                    <p className="text-[var(--text-secondary)] font-medium text-lg md:text-2xl max-w-3xl leading-relaxed italic opacity-80">
                        {t('dash_welcome', { name: user?.fullname || t('portal_student_sub') })}
                    </p>
                </div>
            </header>

            {/* Scholastic Metrics */}
            <section 
                aria-label="Academic Performance Overview"
                className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 lg:gap-10"
            >
                <StatCard 
                    label={t('dash_enrolled_courses')} 
                    value={loading ? "..." : courses.length} 
                    icon={BookOpen}
                    description={t('dash_active_curricula') || "Active Curricula"}
                />
                <StatCard 
                    label={t('dash_completed_lessons')} 
                    value={loading ? "..." : completedLessons} 
                    icon={Trophy}
                    description={t('dash_verified_modules') || "Verified Modules"}
                    color="accent"
                />
                
                {/* Progress Visualizer */}
                <div className="animate-fade-in-up stagger-3 col-span-1 md:col-span-2">
                    <div className="glass-card p-6 md:p-8 bg-indigo-500/5 group h-full relative overflow-hidden flex flex-col justify-center border border-indigo-500/20 shadow-[0_30px_60px_-15px_rgba(79,70,229,0.1)] min-h-[160px]">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                        <h3 className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-indigo-500 mb-6 relative z-10 flex items-center gap-2">
                             <Target className="h-4 w-4" /> {t('dash_scholastic_attainment')}
                        </h3>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-8 md:gap-12 relative z-10">
                            <div className="flex items-baseline gap-3">
                                <span className="text-4xl md:text-6xl font-black tracking-tighter italic text-[var(--text-primary)]">85%</span>
                                <span className="text-[10px] font-black text-indigo-500/60 uppercase tracking-[0.2em]">{t('dash_goal_target')}</span>
                            </div>
                            <div className="hidden sm:block h-14 w-px bg-[var(--border-color)] opacity-20" />
                            <p className="text-sm md:text-base font-medium italic text-[var(--text-secondary)] opacity-80 max-w-sm leading-relaxed">
                                {t('dash_goal_achieved_sub')}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Continuous Learning Intersection */}
            <section className="space-y-10 md:space-y-16 animate-fade-in-up stagger-4">
                <div className="flex flex-col md:flex-row items-baseline justify-between gap-6 md:px-2">
                    <div className="space-y-2">
                        <h3 className="text-3xl md:text-5xl font-black text-[var(--text-primary)] tracking-tight italic leading-none">{t('dash_continue_learning')}</h3>
                        <p className="text-[10px] md:text-xs font-black text-[var(--text-secondary)] uppercase tracking-[0.4em] opacity-40 italic">
                            {t('dash_academic_flow_sub') || "SYNCHRONIZING RECENT PROGRESS"}
                        </p>
                    </div>
                    <button 
                        onClick={() => navigate("/student/courses")}
                        aria-label={t('dash_view_all_courses_aria') || "Navigate to complete course catalog"}
                        className="btn-primary flex items-center justify-center gap-3 !px-8 h-14 text-[10px] md:text-xs font-black uppercase tracking-widest group shadow-xl active:scale-95 transition-all w-full md:w-auto overflow-hidden relative"
                    >
                        <span className="relative z-10">{t('dash_view_all_courses')}</span>
                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1.5 transition-transform relative z-10" />
                    </button>
                    <div className="hidden lg:block h-px flex-1 ml-10 bg-[var(--border-color)] opacity-20" />
                </div>
                
                {loading ? (
                    <div className="py-32 md:py-48 flex flex-col items-center justify-center glass-card border-dashed border-2 bg-white/5">
                        <Loader2 className="h-16 w-16 animate-spin text-[var(--accent-primary)] mb-6" />
                        <p className="text-[var(--text-secondary)] font-black uppercase tracking-widest text-xs md:text-sm animate-pulse">{t('dash_curriculum_loading') || "RECALLING DATA..."}</p>
                    </div>
                ) : courses.length > 0 ? (
                    <>
                        {/* Desktop Grid View (≥ md) */}
                        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
                            {courses.slice(0, 3).map((course, idx) => (
                                <div 
                                    key={course.courseid || course.id} 
                                    className={`animate-fade-in-up stagger-${idx + 1}`}
                                >
                                    <article 
                                        className="group insta-card p-6 md:p-10 flex flex-col h-full cursor-pointer active:scale-[0.98] transition-all hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] border-transparent hover:border-[var(--accent-primary)]/20"
                                        onClick={() => navigate(`/student/course/${course.courseid || course.id}`)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => e.key === 'Enter' && navigate(`/student/course/${course.courseid || course.id}`)}
                                        aria-label={`${t('course_resume_aria') || "Resume curriculum"}: ${course.title}`}
                                    >
                                        <div className="mb-8 md:mb-12 flex justify-between items-start">
                                            <div className="h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-[var(--text-primary)] flex items-center justify-center text-[var(--bg-primary)] shadow-2xl group-hover:bg-[var(--accent-primary)] transition-all duration-500 overflow-hidden relative">
                                                <div className="absolute inset-x-0 bottom-0 h-2 bg-white/10" />
                                                <BookOpen className="h-6 w-6 md:h-7 md:w-7" />
                                            </div>
                                            <span className="text-[10px] font-black text-[var(--accent-primary)] bg-[var(--accent-primary)]/10 px-4 py-2 rounded-2xl border border-[var(--accent-primary)]/20 uppercase tracking-widest backdrop-blur-md shadow-sm">
                                                {t('dash_active')}
                                            </span>
                                        </div>

                                        <div className="space-y-4 md:space-y-6 flex-1 mb-10 md:mb-12">
                                            <h4 className="text-2xl md:text-3xl font-black text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors leading-[1.1] italic tracking-tight">
                                                {course.title}
                                            </h4>
                                            <p className="text-sm md:text-base text-[var(--text-secondary)] font-medium leading-relaxed line-clamp-3 italic opacity-70 flex-1 break-words hyphens-auto">
                                                {course.description || t('course_empty_teacher_sub')}
                                            </p>
                                        </div>

                                        <footer className="space-y-6 pt-8 border-t border-[var(--border-color)] group-hover:border-[var(--accent-primary)]/20 transition-all duration-700">
                                            <div className="flex justify-between items-center text-[10px] md:text-xs font-black text-[var(--text-secondary)] uppercase tracking-[0.3em] italic">
                                                <span className="group-hover:text-[var(--text-primary)] transition-colors">{t('course_progress')}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[var(--text-primary)] tabular-nums">35%</span>
                                                    <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all text-[var(--accent-primary)]" />
                                                </div>
                                            </div>
                                            <div className="h-2 w-full bg-[var(--bg-secondary)] rounded-full overflow-hidden shadow-inner p-[1px]">
                                                <div className="h-full bg-gradient-to-r from-[var(--accent-primary)] via-indigo-400 to-[var(--accent-primary)] w-[35%] rounded-full shadow-[0_0_15px_rgba(79,70,229,0.4)] transition-all duration-1000 group-hover:w-[38%]" />
                                            </div>
                                        </footer>
                                    </article>
                                </div>
                            ))}
                        </div>

                        {/* Mobile Summary-to-Detail View (< md) */}
                        <div className="md:hidden space-y-2">
                            {courses.slice(0, 5).map((course) => (
                                <MobileListItem
                                    key={course.courseid || course.id}
                                    title={course.title || "Untitled Artifact"}
                                    subtitle={course.instructor_name || t('dash_active') || "Active Curriculum"}
                                    icon={BookOpen}
                                    actions={[
                                        {
                                            label: t('course_resume_aria') || 'Resume',
                                            icon: ArrowRight,
                                            onClick: () => navigate(`/student/course/${course.courseid || course.id}`),
                                            variant: 'primary'
                                        }
                                    ]}
                                >
                                    <div className="space-y-6">
                                        <p className="text-sm font-medium italic opacity-70 leading-relaxed break-words">
                                            {course.description || t('course_empty_teacher_sub')}
                                        </p>
                                        
                                        <div className="space-y-4 pt-4 border-t border-[var(--border-color)]/20">
                                            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-[0.2em] italic opacity-60">
                                                <span>{t('course_progress')}</span>
                                                <span className="text-[var(--accent-primary)]">35%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-[var(--bg-secondary)] rounded-full overflow-hidden p-[1px]">
                                                <div className="h-full bg-[var(--accent-primary)] w-[35%] rounded-full shadow-[0_0_10px_rgba(79,70,229,0.3)]" />
                                            </div>
                                        </div>
                                    </div>
                                </MobileListItem>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="glass-card py-20 md:py-32 flex flex-col items-center justify-center border-dashed border-2 text-center bg-white/5 transition-all hover:bg-white/10 group">
                        <div className="w-24 md:w-32 h-24 md:h-32 bg-[var(--bg-secondary)] rounded-[2.5rem] md:rounded-[3rem] flex items-center justify-center mb-10 shadow-inner group-hover:scale-110 transition-transform duration-700">
                            <BookOpen className="h-12 h-16 w-12 w-16 text-[var(--text-secondary)] opacity-10" />
                        </div>
                        <h3 className="text-3xl md:text-5xl font-black text-[var(--text-primary)] mb-6 tracking-tighter italic">{t('dash_no_enrollments')}</h3>
                        <p className="text-[var(--text-secondary)] text-base md:text-xl max-w-lg mb-12 font-medium italic opacity-60 leading-relaxed px-6">
                            {t('dash_no_enrollments_sub')}
                        </p>
                        <button 
                            onClick={() => navigate("/student/courses")}
                            aria-label={t('dash_course_catalog_aria') || "Navigate to complete course catalog"}
                            className="btn-primary !px-12 md:!px-16 py-5 md:py-6 text-[10px] md:text-xs font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all"
                        >
                            {t('dash_course_catalog')}
                        </button>
                    </div>
                )}
            </section>
        </main>
        </div>
    );
};
