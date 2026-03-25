import React, { useState, useEffect } from 'react';
import { api } from '../../lib/axios';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Loader2, ArrowRight } from 'lucide-react';

export const StudentCourses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

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
        <div className="p-8 max-w-7xl mx-auto min-h-screen">
            <header className="mb-12">
                <h2 className="text-4xl font-black text-[var(--text-primary)] tracking-tight mb-2">
                    My Courses
                </h2>
                <p className="text-[var(--text-secondary)] font-medium">
                    Continue learning where you left off.
                </p>
            </header>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="h-12 w-12 animate-spin text-[var(--accent-primary)] mb-4" />
                    <p className="text-[var(--text-secondary)] font-bold animate-pulse">Loading your courses...</p>
                </div>
            ) : courses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {courses.map(course => (
                        <div 
                            key={course.courseid || course.id} 
                            className="insta-card p-8 group cursor-pointer flex flex-col h-full"
                            onClick={() => navigate(`/student/course/${course.courseid || course.id}`)} 
                        >
                            <div className="flex justify-between items-center mb-6">
                                <span className="px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                                    Enrolled
                                </span>
                                <div className="h-8 w-8 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-secondary)] group-hover:bg-[var(--accent-primary)] group-hover:text-white transition-all">
                                    <BookOpen className="h-4 w-4" />
                                </div>
                            </div>

                            <h4 className="text-xl font-bold text-[var(--text-primary)] mb-3 group-hover:text-[var(--accent-primary)] transition-colors">
                                {course.title}
                            </h4>
                            
                            <p className="text-sm text-[var(--text-secondary)] font-medium line-clamp-3 mb-8 flex-1">
                                {course.description || "A comprehensive course designed to improve your knowledge."}
                            </p>
                            
                            <div className="space-y-4 pt-6 border-t border-[var(--border-color)]">
                                <div className="flex justify-between items-center text-xs font-bold text-[var(--text-secondary)]">
                                    <span>Progress</span>
                                    <span className="text-[var(--text-primary)]">0%</span>
                                </div>
                                <div className="w-full h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                                    <div className="h-full bg-[var(--accent-primary)] w-0 group-hover:w-[5%] transition-all duration-1000"></div>
                                </div>
                                <div className="flex justify-end pt-2">
                                    <span className="text-xs font-black uppercase tracking-widest text-[var(--accent-primary)] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                        Continue <ArrowRight className="h-3 w-3" />
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="glass-card p-20 text-center flex flex-col items-center">
                    <div className="w-20 h-20 bg-[var(--bg-secondary)] rounded-3xl flex items-center justify-center mb-6">
                        <BookOpen className="h-10 w-10 text-[var(--text-secondary)] opacity-20" />
                    </div>
                    <h3 className="text-2xl font-black text-[var(--text-primary)] mb-4">No Courses Found</h3>
                    <p className="text-[var(--text-secondary)] max-w-md mb-8 font-medium">
                        You are not currently enrolled in any courses. Check out the available courses and start learning today!
                    </p>
                    <button 
                        onClick={() => navigate('/student/courses')}
                        className="bg-[var(--text-primary)] text-[var(--bg-primary)] px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-all shadow-xl"
                    >
                        Explore Courses
                    </button>
                </div>
            )}
        </div>
    );
};
