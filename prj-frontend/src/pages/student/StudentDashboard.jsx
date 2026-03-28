import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/userAuthStore';
import { api } from '../../lib/axios';
import { useNavigate } from 'react-router-dom';
import { BookOpen, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

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

    const StatCard = ({ title, value, icon: Icon, description }) => (
        <div className="insta-card p-6 flex items-center justify-between group cursor-default">
            <div className="space-y-1">
                <h3 className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">{title}</h3>
                <p className="text-4xl font-black text-[var(--text-primary)] tracking-tighter">
                    {loading ? <Loader2 className="h-6 w-6 animate-spin text-[var(--accent-primary)]" /> : value}
                </p>
                <p className="text-[10px] text-[var(--text-secondary)] font-bold italic opacity-60">
                    {description}
                </p>
            </div>
            <div className="h-14 w-14 rounded-2xl bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--accent-primary)] group-hover:bg-[var(--accent-primary)] group-hover:text-white transition-all duration-300 shadow-sm border border-[var(--border-color)]">
                <Icon className="h-6 w-6" />
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-12 animate-fade-in-up p-4 sm:p-0">
            {/* Hero Header */}
            <header className="relative p-10 glass-card overflow-hidden group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--accent-primary)] opacity-[0.03] rounded-full -mr-48 -mt-48 transition-transform duration-1000 group-hover:scale-110" />
                <div className="relative z-10">
                    <h2 className="text-4xl sm:text-5xl font-black text-[var(--text-primary)] tracking-tighter leading-none mb-6">
                        {t('nav_dashboard')} <span className="text-[var(--accent-primary)] italic">Dashboard</span>
                    </h2>
                    <p className="text-[var(--text-secondary)] font-medium text-lg max-w-2xl leading-relaxed italic">
                        {t('dash_welcome', { name: user?.fullname || t('portal_student_sub') })}
                    </p>
                </div>
            </header>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="animate-fade-in-up stagger-1">
                    <StatCard 
                        title={t('dash_enrolled_courses')} 
                        value={courses.length} 
                        icon={BookOpen}
                        description={t('dash_enrolled_courses')}
                    />
                </div>
                <div className="animate-fade-in-up stagger-2">
                    <StatCard 
                        title={t('dash_completed_lessons')} 
                        value={completedLessons} 
                        icon={CheckCircle}
                        description={t('dash_completed_lessons')}
                    />
                </div>
                <div className="animate-fade-in-up stagger-3">
                    <div className="insta-card p-6 flex flex-col justify-center bg-[var(--text-primary)] text-[var(--bg-primary)] group h-full relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2 text-[var(--bg-primary)] relative z-10">{t('dash_daily_progress')}</h3>
                        <div className="flex items-end gap-3 relative z-10">
                            <span className="text-4xl font-black tracking-tighter">85%</span>
                            <span className="text-[10px] font-bold mb-2 opacity-60 uppercase tracking-widest">{t('dash_goal_achieved')}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Courses Section */}
            <section className="space-y-8 animate-fade-in-up stagger-4">
                <div className="flex items-end justify-between px-2">
                    <div className="space-y-1">
                        <h3 className="text-2xl font-black text-[var(--text-primary)] tracking-tight italic">{t('dash_continue_learning')}</h3>
                    </div>
                    <button 
                        onClick={() => navigate("/student/courses")}
                        className="btn-primary !py-2 !px-4 text-[10px] uppercase tracking-widest group"
                    >
                        {t('dash_view_all_courses')}
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
                
                {loading ? (
                    <div className="py-24 flex flex-col items-center justify-center glass-card border-dashed">
                        <Loader2 className="h-10 w-10 animate-spin text-[var(--accent-primary)] mb-4" />
                        <p className="text-[var(--text-secondary)] font-bold italic">{t('dash_curriculum_loading')}</p>
                    </div>
                ) : courses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {courses.slice(0, 3).map((course, idx) => (
                            <div 
                                key={course.courseid || course.id} 
                                className={`animate-fade-in-up stagger-${idx + 1}`}
                            >
                                <div 
                                    className="group insta-card p-8 flex flex-col h-full cursor-pointer active:scale-[0.98] transition-all"
                                    onClick={() => navigate(`/student/course/${course.courseid || course.id}`)}
                                >
                                    <div className="mb-6 flex justify-between items-start">
                                        <div className="h-12 w-12 rounded-xl bg-[var(--text-primary)] flex items-center justify-center text-[var(--bg-primary)] shadow-lg group-hover:bg-[var(--accent-primary)] transition-colors">
                                            <BookOpen className="h-6 w-6" />
                                        </div>
                                        <span className="text-[10px] font-black text-[var(--accent-primary)] bg-[var(--accent-primary)]/10 px-3 py-1.5 rounded-full border border-[var(--accent-primary)]/20 uppercase tracking-widest">
                                            {t('dash_active')}
                                        </span>
                                    </div>
                                    <h4 className="text-xl font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors leading-tight mb-4">
                                        {course.title}
                                    </h4>
                                    <p className="text-sm font-medium text-[var(--text-secondary)] leading-relaxed line-clamp-2 mb-8 flex-1 italic opacity-80">
                                        {course.description || t('course_empty_teacher_sub')}
                                    </p>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">
                                            <span>{t('course_progress')}</span>
                                            <span className="text-[var(--text-primary)]">35%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-[var(--bg-secondary)] rounded-full overflow-hidden border border-[var(--border-color)]">
                                            <div className="h-full bg-[var(--accent-primary)] w-[35%] rounded-full shadow-[0_0_12px_rgba(79,70,229,0.3)] transition-all duration-1000" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-24 flex flex-col items-center justify-center glass-card border-dashed border-2 text-center bg-white/5">
                        <BookOpen className="h-24 w-24 text-[var(--text-secondary)] opacity-10 mb-8" />
                        <p className="text-[var(--text-primary)] font-black uppercase tracking-widest text-sm">{t('dash_no_enrollments')}</p>
                        <p className="text-[var(--text-secondary)] text-sm mt-3 font-medium italic opacity-60">{t('dash_no_enrollments_sub')}</p>
                        <button 
                            onClick={() => navigate("/student/courses")}
                            className="mt-8 btn-primary px-10 py-4 text-[10px] uppercase tracking-widest"
                        >
                            {t('dash_course_catalog')}
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
};
