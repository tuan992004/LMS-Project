import React, { useState, useEffect } from 'react';
import { 
    X, 
    User, 
    Mail, 
    BookOpen, 
    FileText, 
    ExternalLink, 
    Calendar,
    Download,
    CheckCircle2,
    Clock,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { api } from '../../lib/axios';

/**
 * StudentDossierModal - Premium monochrome student profile view.
 * Displays enrolled courses, assignments, and file submissions.
 */
const StudentDossierModal = ({ isOpen, onClose, studentId }) => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {
        if (isOpen && studentId) {
            fetchDossier();
        }
    }, [isOpen, studentId]);

    const fetchDossier = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/users/dossier/${studentId}`);
            setData(res.data);
        } catch (error) {
            console.error('Error fetching student dossier:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-8 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-5xl bg-[var(--bg-primary)] border border-[var(--border-color)] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] rounded-[2.5rem] overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
                
                {/* Header */}
                <div className="p-8 border-b border-[var(--border-color)]/30 flex justify-between items-center bg-[var(--bg-secondary)]/30">
                    <div className="flex items-center gap-6">
                        <div className="h-16 w-16 rounded-2xl bg-[var(--text-primary)] flex items-center justify-center text-[var(--bg-primary)] shadow-2xl">
                            <User className="h-8 w-8" strokeWidth={1.5} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-[var(--text-primary)] tracking-tighter italic">Student Profile</h2>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--text-secondary)] opacity-40">Academic Record & Submissions</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="h-12 w-12 rounded-full hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center transition-all active:scale-90"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                    {loading ? (
                        <div className="h-96 flex flex-col items-center justify-center space-y-4">
                            <Loader2 className="h-10 w-10 animate-spin text-[var(--accent-primary)] opacity-20" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] animate-pulse">Retreiving Dossier...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            
                            {/* Left Side: Profile & Courses */}
                            <div className="lg:col-span-4 space-y-8">
                                {/* Profile Card */}
                                <div className="p-8 rounded-[2rem] border border-[var(--border-color)] bg-white/5 space-y-6">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)] opacity-40 italic">Candidate Profile</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-secondary)]">
                                                <User className="h-5 w-5" />
                                            </div>
                                            <span className="font-bold text-[var(--text-primary)] truncate">{data.profile.fullname}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-secondary)]">
                                                <Mail className="h-5 w-5" />
                                            </div>
                                            <span className="text-xs font-medium text-[var(--text-secondary)] truncate">{data.profile.email}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Active Courses */}
                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)] opacity-40 italic px-4">Active Enrollments</h3>
                                    <div className="space-y-2">
                                        {data.courses.map((c, idx) => (
                                            <div key={`${c.courseid}-${idx}`} className="p-4 rounded-2xl border border-[var(--border-color)] bg-white/5 flex items-center gap-4 hover:bg-[var(--accent-primary)]/[0.02] transition-all">
                                                <div className="h-8 w-8 rounded-lg bg-[var(--text-primary)]/5 flex items-center justify-center">
                                                    <BookOpen className="h-4 w-4 opacity-40" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold text-[var(--text-primary)] truncate uppercase tracking-tight">{c.title}</p>
                                                    <p className="text-[8px] font-black text-[var(--text-secondary)] opacity-30 tracking-widest">{c.courseid}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right Side: Assignments & Uploads */}
                            <div className="lg:col-span-8 space-y-6">
                                <header className="flex justify-between items-center px-4">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)] opacity-40 italic">Assignment Ledger</h3>
                                </header>
                                
                                <div className="space-y-4">
                                    {data.assignments.length === 0 ? (
                                        <div className="p-12 text-center rounded-3xl border border-dashed border-[var(--border-color)]">
                                            <p className="text-sm font-medium text-[var(--text-secondary)] italic opacity-40 uppercase tracking-widest">No assignments found</p>
                                        </div>
                                    ) : (
                                        data.assignments.map((a, idx) => (
                                            <div 
                                                key={`${a.id || a.assignment_id || idx}-${idx}`} 
                                                className="group p-6 rounded-[2rem] border border-[var(--border-color)] bg-white/5 hover:bg-[var(--accent-primary)]/[0.03] transition-all duration-300 relative overflow-hidden"
                                            >
                                                <div className="flex flex-col md:flex-row gap-6 justify-between">
                                                    <div className="flex-1 space-y-2">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-[8px] font-black uppercase tracking-[0.2em] bg-[var(--text-primary)] text-[var(--bg-primary)] px-2 py-0.5 rounded">
                                                                {a.course_title}
                                                            </span>
                                                            <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-secondary)] opacity-50 uppercase font-black tracking-widest leading-none">
                                                                <Clock className="h-3 w-3" />
                                                                {new Date(a.due_date).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                        <h4 className="text-lg font-black text-[var(--text-primary)] italic group-hover:text-[var(--accent-primary)] transition-all">{a.title}</h4>
                                                    </div>

                                                    <div className="flex items-center gap-4">
                                                        {a.status === 'submitted' || a.status === 'graded' ? (
                                                            <div className="flex flex-col items-end gap-2 text-right">
                                                                <span className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                                                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                                                    Evidence Uploaded
                                                                </span>
                                                                <a 
                                                                    href={a.file_url} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer"
                                                                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-500 hover:underline"
                                                                >
                                                                    <Download className="h-3.5 w-3.5" />
                                                                    View Submission
                                                                </a>
                                                            </div>
                                                        ) : (
                                                            <span className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-500/20">
                                                                <AlertCircle className="h-3.5 w-3.5" />
                                                                Pending Submission
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-[var(--border-color)]/30 bg-[var(--bg-secondary)]/30 flex justify-end">
                    <button 
                        onClick={onClose}
                        className="px-10 h-12 rounded-2xl bg-[var(--text-primary)] text-[var(--bg-primary)] text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl italic"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StudentDossierModal;
