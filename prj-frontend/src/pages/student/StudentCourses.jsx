import React, { useState, useEffect } from 'react';
import { api } from '../../lib/axios';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Loader2, ArrowRight } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

export const StudentCourses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { t } = useTranslation();

    useEffect(() => {
        api.get("/courses/my-enrolled")
           .then(res => {
               setCourses(res.data);
               setLoading(false);
           })
           .catch(err => {
               console.error(err);
               setLoading(false);
           });
    }, []);

    return (
        <div className="p-8 max-w-7xl mx-auto min-h-screen animate-fade-in-up">
            {/* Minimalist Portal Header */}
            <header className="flex items-center gap-6 mb-12 md:mb-16">
                <div className="h-12 w-12 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-primary)] border border-[var(--border-color)] shadow-sm shrink-0">
                    <BookOpen className="h-5 w-5 opacity-60" strokeWidth={1.5} />
                </div>
                <div className="flex flex-col">
                    <p className="text-[var(--text-secondary)] font-medium text-lg md:text-xl italic opacity-80 leading-relaxed truncate">
                        Course Library
                    </p>
                    <span className="text-[9px] font-black uppercase tracking-[0.4em] text-[var(--text-secondary)] opacity-30 italic">
                        Scholastic Portal
                    </span>
                </div>
            </header>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 glass-card border-dashed">
                    <Loader2 className="h-12 w-12 animate-spin text-[var(--accent-primary)] mb-4" />
                    <p className="text-[var(--text-secondary)] font-bold italic animate-pulse">Synchronizing your curriculum...</p>
                </div>
            ) : courses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {courses.map((course, idx) => (
                        <div 
                            key={course.courseid || course.id} 
                            className={`animate-fade-in-up stagger-${(idx % 4) + 1}`}
                        >
                            <div 
                                className="insta-card p-8 group cursor-pointer flex flex-col h-full active:scale-[0.98] transition-all"
                                onClick={() => navigate(`/student/course/${course.courseid || course.id}`)} 
                            >
                                <div className="flex justify-between items-center mb-8">
                                    <span className="px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20 shadow-sm">
                                        Enrolled
                                    </span>
                                    <div className="h-10 w-10 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-secondary)] group-hover:bg-[var(--accent-primary)] group-hover:text-[var(--bg-primary)] transition-all shadow-sm">
                                        <BookOpen className="h-5 w-5" />
                                    </div>
                                </div>

                                <h4 className="text-xl font-bold text-[var(--text-primary)] mb-4 group-hover:text-[var(--accent-primary)] transition-colors leading-tight">
                                    {course.title}
                                </h4>
                                
                                <p className="text-sm text-[var(--text-secondary)] font-medium line-clamp-3 mb-10 flex-1 italic opacity-80">
                                    {course.description || "A comprehensive course designed to provide deep insights and practical skills."}
                                </p>
                                
                                <div className="space-y-5 pt-8 border-t border-[var(--border-color)]">
                                    <div className="flex justify-between items-center text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">
                                        <span>Current Progress</span>
                                        <span className="text-[var(--text-primary)]">0%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-[var(--bg-secondary)] rounded-full overflow-hidden border border-[var(--border-color)]">
                                        <div className="h-full bg-[var(--accent-primary)] w-0 group-hover:w-[8%] transition-all duration-1000 shadow-[0_0_12px_rgba(79,70,229,0.3)]"></div>
                                    </div>
                                    <div className="flex justify-end pt-3">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-primary)] flex items-center gap-2 transform translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                                            {t('dash_continue_learning')} <ArrowRight className="h-3.5 w-3.5" />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="glass-card p-24 text-center flex flex-col items-center bg-white/5 border-dashed border-2">
                    <div className="w-24 h-24 bg-[var(--bg-secondary)] rounded-[2rem] flex items-center justify-center mb-8 shadow-inner">
                        <BookOpen className="h-12 w-12 text-[var(--text-secondary)] opacity-10" />
                    </div>
                    <h3 className="text-3xl font-black text-[var(--text-primary)] mb-4 tracking-tighter">No Active Enrollments</h3>
                    <p className="text-[var(--text-secondary)] max-w-md mb-10 font-medium italic opacity-60">
                        You have not enrolled in any modules yet. Explore our world-class curriculum to begin your educational journey.
                    </p>
                    <button 
                        onClick={() => navigate('/student/courses')}
                        className="btn-primary px-12 py-5 text-[10px] uppercase tracking-widest shadow-2xl"
                    >
                        Explore Curriculum
                    </button>
                </div>
            )}
        </div>
    );
};
