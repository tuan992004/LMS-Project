import React, { useState, useEffect } from 'react';
import { api } from '../../lib/axios';
import { Users, Mail, BookOpen, Loader2, Search, ExternalLink, Fingerprint } from 'lucide-react';
import { toast } from 'sonner';
import MobileListItem from '../../components/shared/MobileListItem';
import { useTranslation } from '../../hooks/useTranslation';

export const TeacherStudents = () => {
    const { t } = useTranslation();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [expandedStudentId, setExpandedStudentId] = useState(null);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const res = await api.get('/instructor/students');
                setStudents(res.data);
            } catch (error) {
                console.error(error);
                toast.error(t('alert_fetch_students_error'));
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, [t]);

    const filteredStudents = students.filter(s => 
        s.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Loader2 className="h-12 w-12 animate-spin text-[var(--accent-primary)] mb-4" />
            <p className="text-[var(--text-secondary)] font-bold animate-pulse uppercase tracking-widest text-xs">{t('student_dir_loading')}</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-12 p-4 sm:p-8 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2">
                    <h2 className="text-4xl font-black text-[var(--text-primary)] tracking-tight flex items-center gap-3">
                        <Users className="h-10 w-10 text-[var(--accent-primary)]" />
                        {t('nav_students')}
                    </h2>
                    <p className="text-[var(--text-secondary)] font-medium">{t('student_roster_sub')}</p>
                </div>
                
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--text-secondary)] group-focus-within:text-[var(--accent-primary)] transition-colors" />
                    <input 
                        type="text"
                        placeholder={t('search_scholars')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/20 focus:border-[var(--accent-primary)] transition-all shadow-sm font-medium"
                    />
                </div>
            </header>

            <div className="space-y-6">
                {filteredStudents.length === 0 ? (
                    <div className="py-24 flex flex-col items-center justify-center glass-card border-dashed border-2 text-center">
                        <Users className="h-20 w-20 text-[var(--text-secondary)] opacity-10 mb-6" />
                        <p className="text-[var(--text-primary)] font-black uppercase tracking-widest text-sm">{t('student_none_found')}</p>
                        <p className="text-[var(--text-secondary)] text-sm mt-2 font-medium">{t('student_none_found_sub')}</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Grid View (≥ md) */}
                        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredStudents.map((student) => (
                                <div key={student.userid} className="group insta-card p-8 space-y-8 hover:border-[var(--accent-primary)]/30 transition-all active:scale-[0.98]">
                                    <div className="flex items-center gap-5">
                                        <div className="h-16 w-16 rounded-2xl bg-[var(--text-primary)] text-[var(--bg-primary)] flex items-center justify-center font-black text-2xl shadow-xl group-hover:bg-[var(--accent-primary)] transition-colors">
                                            {student.fullname.charAt(0)}
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-xl font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors">
                                                {student.fullname}
                                            </h3>
                                            <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2">
                                                <Mail className="h-3 w-3 opacity-40" />
                                                {student.email}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-[var(--border-color)] flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] opacity-60">{t('status_active_enrollments')}</p>
                                            <div className="flex items-center gap-2 text-[var(--text-primary)] font-bold">
                                                <BookOpen className="h-4 w-4 text-[var(--accent-primary)]" />
                                                <span>{student.course_count} {t('student_modules')}</span>
                                            </div>
                                        </div>
                                        <button className="h-12 w-12 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--accent-primary)] hover:text-[var(--bg-primary)] transition-all shadow-sm">
                                            <ExternalLink className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Mobile Summary-to-Detail View (< md) */}
                        <div className="md:hidden divide-y divide-[var(--border-color)]/30">
                            {filteredStudents.map((student) => (
                                <MobileListItem
                                    key={student.userid}
                                    title={student.fullname}
                                    subtitle={`${student.course_count} ${t('dash_active')} ${t('student_modules')}`}
                                    avatar={student.fullname.charAt(0).toUpperCase()}
                                    isExpanded={expandedStudentId === student.userid}
                                    onToggle={() => setExpandedStudentId(expandedStudentId === student.userid ? null : student.userid)}
                                    actions={[
                                        {
                                            label: t('action_view_dossier'),
                                            icon: ExternalLink,
                                            onClick: () => {},
                                            variant: 'primary'
                                        }
                                    ]}
                                >
                                    <div className="grid grid-cols-1 gap-6">
                                        <div className="space-y-1.5">
                                            <span className="text-[9px] font-black uppercase tracking-widest opacity-40 italic flex items-center gap-2">
                                                <Mail className="h-3 w-3" /> {t('label_email_alt')}
                                            </span>
                                            <p className="font-bold text-[var(--text-primary)] break-all">{student.email}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <span className="text-[9px] font-black uppercase tracking-widest opacity-40 italic flex items-center gap-2">
                                                    <Fingerprint className="h-3 w-3" /> {t('label_username')}
                                                </span>
                                                <p className="font-bold text-[var(--text-primary)]">@{student.username}</p>
                                            </div>
                                            <div className="space-y-1.5">
                                                <span className="text-[9px] font-black uppercase tracking-widest opacity-40 italic flex items-center gap-2">
                                                    <Users className="h-3 w-3" /> {t('label_scholar_id')}
                                                </span>
                                                <p className="font-bold text-[var(--text-primary)]">#{student.userid}</p>
                                            </div>
                                        </div>
                                    </div>
                                </MobileListItem>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
