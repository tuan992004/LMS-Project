import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/userAuthStore';
import { api } from '../../lib/axios';
import { useNavigate } from 'react-router-dom';
import { BookOpen, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';

export const StudentDashboard = () => {
    const user = useAuthStore((s) => s.user);
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
        <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700">
            {/* Hero Header */}
            <header className="relative p-10 glass-card overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent-primary)] opacity-[0.03] rounded-full -mr-32 -mt-32" />
                <div className="relative z-10">
                    <h2 className="text-4xl sm:text-5xl font-black text-[var(--text-primary)] tracking-tighter leading-none mb-4">
                        My Learning <span className="text-[var(--accent-primary)] italic">Dashboard</span>
                    </h2>
                    <p className="text-[var(--text-secondary)] font-medium text-lg max-w-2xl leading-relaxed">
                        Welcome back, <span className="text-[var(--text-primary)] font-bold">{user?.fullname || 'Scholar'}</span>. 
                        Let's continue your transformation journey. You have <span className="text-[var(--accent-primary)] font-black">{courses.length} Active Courses</span> today.
                    </p>
                </div>
            </header>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <StatCard 
                    title="Enrolled Courses" 
                    value={courses.length} 
                    icon={BookOpen}
                    description="Courses you're currently mastering"
                />
                <StatCard 
                    title="Completed Lessons" 
                    value={completedLessons} 
                    icon={CheckCircle}
                    description="Modules successfully finished"
                />
                {/* Daily Engagement Placeholder */}
                <div className="insta-card p-6 flex flex-col justify-center bg-[var(--text-primary)] text-[var(--bg-primary)] group">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1 text-[var(--bg-primary)]">Daily Progress</h3>
                    <div className="flex items-end gap-2">
                        <span className="text-4xl font-black tracking-tighter">85%</span>
                        <span className="text-[10px] font-bold mb-1.5 opacity-60">Goal Met</span>
                    </div>
                </div>
            </div>

            {/* Recent Courses Section */}
            <section className="space-y-8">
                <div className="flex items-end justify-between px-2">
                    <div className="space-y-1">
                        <h3 className="text-2xl font-black text-[var(--text-primary)] tracking-tight italic">Continue Learning</h3>
                        <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest opacity-60">Your top 3 most recent modules</p>
                    </div>
                    <button 
                        onClick={() => navigate("/student/courses")}
                        className="flex items-center gap-2 text-[var(--accent-primary)] font-black text-[10px] uppercase tracking-widest hover:translate-x-1 transition-transform group"
                    >
                        View All My Courses
                        <ArrowRight className="h-4 w-4" />
                    </button>
                </div>
                
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center glass-card border-dashed">
                        <Loader2 className="h-10 w-10 animate-spin text-[var(--accent-primary)] mb-4" />
                        <p className="text-[var(--text-secondary)] font-bold italic">Loading your curriculum...</p>
                    </div>
                ) : courses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {courses.slice(0, 3).map((course) => (
                            <div 
                                key={course.courseid || course.id} 
                                className="group insta-card p-8 flex flex-col h-full cursor-pointer hover:border-[var(--accent-primary)]/30 active:scale-[0.99] transition-all"
                                onClick={() => navigate(`/student/lessons/${course.courseid || course.id}`)}
                            >
                                <div className="mb-6 flex justify-between items-start">
                                    <div className="h-12 w-12 rounded-xl bg-[var(--text-primary)] flex items-center justify-center text-[var(--bg-primary)] shadow-lg group-hover:bg-[var(--accent-primary)] transition-colors">
                                        <BookOpen className="h-6 w-6" />
                                    </div>
                                    <span className="text-[10px] font-black text-[var(--accent-primary)] bg-[var(--accent-primary)]/10 px-3 py-1 rounded-full border border-[var(--accent-primary)]/20 uppercase tracking-widest">
                                        Active
                                    </span>
                                </div>
                                <h4 className="text-xl font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors leading-tight mb-3">
                                    {course.title}
                                </h4>
                                <p className="text-sm font-medium text-[var(--text-secondary)] leading-relaxed line-clamp-2 mb-8 flex-1 italic">
                                    {course.description || "A comprehensive course designed to improve your knowledge."}
                                </p>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">
                                        <span>Progress</span>
                                        <span>35%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-[var(--bg-secondary)] rounded-full overflow-hidden border border-[var(--border-color)]">
                                        <div className="h-full bg-[var(--accent-primary)] w-[35%] rounded-full shadow-[0_0_8px_rgba(99,102,241,0.4)]" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-24 flex flex-col items-center justify-center glass-card border-dashed border-2 text-center">
                        <BookOpen className="h-20 w-20 text-[var(--text-secondary)] opacity-10 mb-6" />
                        <p className="text-[var(--text-primary)] font-black uppercase tracking-widest text-sm">No active enrollments</p>
                        <p className="text-[var(--text-secondary)] text-sm mt-2 font-medium">Ready to start? Browse the course library to begin your journey.</p>
                        <button 
                            onClick={() => navigate("/student/courses")}
                            className="mt-8 px-8 py-3 rounded-2xl bg-[var(--text-primary)] text-[var(--bg-primary)] font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition-all shadow-xl active:scale-95"
                        >
                            Explore Courses
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
};