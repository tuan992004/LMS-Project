import React, { useState, useEffect } from 'react';
import { api } from '../../lib/axios';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, BookOpen, Calendar, Clock, Loader2, ChevronRight, FileText, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import MobileListItem from '../../components/shared/MobileListItem';
import { useTranslation } from '../../hooks/useTranslation';

export const TeacherAssignments = () => {
    const { t } = useTranslation();
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedAssignmentId, setExpandedAssignmentId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                const res = await api.get('/assignments/instructor/all');
                setAssignments(res.data);
            } catch (error) {
                console.error(error);
                toast.error(t('alert_fetch_error'));
            } finally {
                setLoading(false);
            }
        };
        fetchAssignments();
    }, [t]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Loader2 className="h-12 w-12 animate-spin text-[var(--accent-primary)] mb-4" />
            <p className="text-[var(--text-secondary)] font-bold animate-pulse uppercase tracking-widest text-xs">{t('assign_ledger_loading')}</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-12 p-4 sm:p-8 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2">
                    <h2 className="text-4xl font-black text-[var(--text-primary)] tracking-tight flex items-center gap-3">
                        <ClipboardList className="h-10 w-10 text-[var(--accent-primary)]" />
                        {t('assign_global')}
                    </h2>
                    <p className="text-[var(--text-secondary)] font-medium">{t('assign_teacher_sub')}</p>
                </div>
            </header>

            <div className="grid gap-6">
                {assignments.length === 0 ? (
                    <div className="py-24 flex flex-col items-center justify-center glass-card border-dashed border-2 text-center">
                        <FileText className="h-20 w-20 text-[var(--text-secondary)] opacity-10 mb-6" />
                        <p className="text-[var(--text-primary)] font-black uppercase tracking-widest text-sm">{t('assign_empty')}</p>
                        <p className="text-[var(--text-secondary)] text-sm mt-2 font-medium">{t('assign_none_found_sub')}</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop List View (≥ md) */}
                        <div className="hidden md:grid gap-6">
                            {assignments.map((assignment) => (
                                <div 
                                    key={assignment.id} 
                                    onClick={() => navigate(`/teacher/course/${assignment.course_id}/assignment/${assignment.id}`)}
                                    className="group insta-card p-8 flex items-center justify-between cursor-pointer hover:border-[var(--accent-primary)]/30 active:scale-[0.99] transition-all"
                                >
                                    <div className="flex items-center gap-8">
                                        <div className="h-16 w-16 rounded-2xl bg-[var(--accent-primary)]/10 flex items-center justify-center text-[var(--accent-primary)] shadow-sm border border-[var(--accent-primary)]/20 group-hover:bg-[var(--accent-primary)] group-hover:text-[var(--bg-primary)] transition-all">
                                            <FileText className="h-8 w-8" />
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-2xl font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors leading-tight">
                                                    {assignment.title}
                                                </h3>
                                                <span className="text-[10px] font-black text-[var(--text-secondary)] bg-[var(--bg-secondary)] px-3 py-1 rounded-full border border-[var(--border-color)] uppercase tracking-widest">
                                                    {assignment.course_title}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-6">
                                                <span className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest flex items-center gap-2">
                                                    <Calendar className="h-3.5 w-3.5 opacity-40" />
                                                    {t('label_created')} {new Date(assignment.created_at).toLocaleDateString()}
                                                </span>
                                                {assignment.due_date && (
                                                    <span className="text-[10px] text-rose-500 font-black uppercase tracking-widest flex items-center gap-2 bg-rose-500/5 px-3 py-1 rounded-xl border border-rose-500/10 shadow-sm">
                                                        <Clock className="h-3.5 w-3.5" />
                                                        {t('label_deadline_prefix')} {new Date(assignment.due_date).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="h-14 w-14 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-secondary)] group-hover:bg-[var(--accent-primary)] group-hover:text-[var(--bg-primary)] transition-all duration-300 shadow-sm">
                                        <ChevronRight className="h-7 w-7 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Mobile Summary-to-Detail View (< md) */}
                        <div className="md:hidden divide-y divide-[var(--border-color)]/30">
                            {assignments.map((assignment) => (
                                <MobileListItem
                                    key={assignment.id}
                                    title={assignment.title}
                                    subtitle={assignment.course_title}
                                    icon={FileText}
                                    isExpanded={expandedAssignmentId === assignment.id}
                                    onToggle={() => setExpandedAssignmentId(expandedAssignmentId === assignment.id ? null : assignment.id)}
                                    actions={[
                                        {
                                            label: t('assign_review_submissions'),
                                            icon: ArrowRight,
                                            onClick: () => navigate(`/teacher/course/${assignment.course_id}/assignment/${assignment.id}`),
                                            variant: 'primary'
                                        }
                                    ]}
                                >
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center">
                                                <Calendar className="h-3.5 w-3.5 text-[var(--text-secondary)] opacity-40" />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-40">{t('label_created_at')}</p>
                                                <p className="text-xs font-bold text-[var(--text-primary)]">
                                                    {new Date(assignment.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        {assignment.due_date && (
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-lg bg-rose-500/10 flex items-center justify-center">
                                                    <Clock className="h-3.5 w-3.5 text-rose-500" />
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-rose-500 opacity-60">{t('label_deadline')}</p>
                                                    <p className="text-xs font-bold text-rose-600">
                                                        {new Date(assignment.due_date).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
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
