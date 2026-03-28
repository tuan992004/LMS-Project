import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../lib/axios';
import { useAuthStore } from '../../stores/userAuthStore';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle, FileText, Upload, Clock, GraduationCap, X, ChevronRight, File, Loader2, User, Mail, Star } from 'lucide-react';
import { DataCard } from "../../components/shared/DataCard";
import MobileListItem from "../../components/shared/MobileListItem";
import { useTranslation } from '../../hooks/useTranslation';

export const AssignmentDetail = () => {
    const { t } = useTranslation();
    const { assignment_id } = useParams();
    const { user } = useAuthStore();
    const navigate = useNavigate();

    const [assignment, setAssignment] = useState(null);
    const [loading, setLoading] = useState(true);

    // STUDENT STATE
    const [mySubmission, setMySubmission] = useState(null);
    const [submitContent, setSubmitContent] = useState("");
    const [submitFile, setSubmitFile] = useState(null);

    // INSTRUCTOR STATE
    const [allSubmissions, setAllSubmissions] = useState([]);
    const [gradingTarget, setGradingTarget] = useState(null);
    const [gradeScore, setGradeScore] = useState("");
    const [gradeFeedback, setGradeFeedback] = useState("");

    const isStudent = user?.role === 'student';

    useEffect(() => {
        fetchAssignmentData();
    }, [assignment_id]);

    const fetchAssignmentData = async () => {
        try {
            if (isStudent) {
                const subRes = await api.get(`/assignments/${assignment_id}/my-submission`);
                setMySubmission(subRes.data);
                if (subRes.data) {
                    setSubmitContent(subRes.data.content || "");
                }
            } else {
                const subsRes = await api.get(`/assignments/${assignment_id}/submissions`);
                setAllSubmissions(subsRes.data);
            }
        } catch (error) {
            if (error.response?.status !== 404) {
                toast.error(t('alert_load_assignment_error'));
            }
        } finally {
            setLoading(false);
        }
    };

    const handleStudentSubmit = async () => {
        if (!submitContent && !submitFile) {
            toast.error(t('alert_content_required'));
            return;
        }
        try {
            const formData = new FormData();
            formData.append('content', submitContent);
            if (submitFile) formData.append('file', submitFile);

            await api.post(`/assignments/${assignment_id}/submit`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast.success(t('alert_submit_success'));
            fetchAssignmentData();
        } catch (e) {
            toast.error(t('alert_submit_error'));
        }
    };

    const handleInstructorGrade = async () => {
        if (!gradeScore) {
            toast.error(t('alert_score_required'));
            return;
        }
        try {
            await api.patch(`/assignments/submissions/${gradingTarget.id}/grade`, {
                grade: gradeScore,
                feedback: gradeFeedback
            });
            toast.success(t('alert_grade_success'));
            setGradingTarget(null);
            setGradeScore("");
            setGradeFeedback("");
            fetchAssignmentData();
        } catch (e) {
            toast.error(t('alert_grade_error'));
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen animate-fade-in">
            <div className="relative h-20 w-20 mb-8">
                <div className="absolute inset-0 rounded-full border-4 border-[var(--accent-primary)] opacity-10 blur-sm" />
                <Loader2 className="h-20 w-20 animate-spin text-[var(--accent-primary)] relative z-10" />
            </div>
            <p className="text-[var(--text-secondary)] font-black uppercase tracking-[0.3em] text-xs animate-pulse">{t('assign_sync_records')}</p>
        </div>
    );

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto min-h-screen animate-fade-in-up pb-32">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] font-black text-[var(--text-secondary)] hover:text-[var(--accent-primary)] mb-10 transition-all group"
            >
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> 
                {t('assign_ret_modules')}
            </button>

            <header className="glass-card p-8 md:p-12 mb-8 md:mb-12 relative overflow-hidden group shadow-2xl">
                <div className="absolute top-0 right-0 w-80 h-80 bg-[var(--accent-primary)] opacity-[0.03] rounded-full -mr-40 -mt-40 transition-transform duration-[2000ms] group-hover:scale-125" />
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-end md:items-center gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-2xl bg-[var(--accent-primary)] flex items-center justify-center text-[var(--bg-primary)] shadow-xl">
                                <FileText className="h-6 w-6" strokeWidth={1.5} />
                            </div>
                            <h1 className="text-4xl font-black text-[var(--text-primary)] tracking-tight italic">
                                {t('assign_intelligence').split(' ')[0]} <span className="text-[var(--accent-primary)]">{t('assign_intelligence').split(' ')[1]}</span>
                            </h1>
                        </div>
                        <p className="text-[var(--text-secondary)] font-medium text-lg italic opacity-80 leading-relaxed max-w-2xl">
                            {isStudent 
                                ? t('assign_student_detail_sub')
                                : t('assign_teacher_detail_sub')}
                        </p>
                    </div>
                </div>
            </header>

            {isStudent ? (
                /* STUDENT VIEW */
                <div className="space-y-12">
                    <section className="animate-fade-in-up stagger-1">
                        <div className="flex items-center gap-4 mb-8">
                            <h3 className="text-xl font-black text-[var(--text-primary)] tracking-tight italic">{t('assign_sub_status')}</h3>
                            <div className="h-px flex-1 bg-[var(--border-color)] opacity-40"></div>
                        </div>

                        {mySubmission?.status === 'graded' ? (
                            <div className="insta-card p-10 bg-[var(--text-primary)] text-[var(--bg-primary)] border-none relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32" />
                                <div className="relative z-10 flex flex-col md:flex-row gap-10 items-start md:items-center">
                                    <div className="flex-1 space-y-6">
                                        <div className="flex items-center gap-3 px-3 py-1 rounded-full bg-white/10 w-fit text-[10px] font-black tracking-widest uppercase mb-4">
                                            <CheckCircle className="h-3 w-3" /> {t('assign_eval_complete')}
                                        </div>
                                        <div className="flex items-baseline gap-3">
                                            <span className="text-7xl font-black tracking-tighter italic">{mySubmission.grade}</span>
                                            <span className="text-xl font-bold opacity-40">/ 100</span>
                                        </div>
                                        <div className="space-y-2">
                                            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">{t('label_feedback')}</span>
                                            <p className="text-lg font-medium italic opacity-90 leading-relaxed border-l-2 border-white/20 pl-6">
                                                "{mySubmission.feedback || t('assign_def_feedback')}"
                                            </p>
                                        </div>
                                    </div>
                                    {mySubmission.file_url && (
                                        <a 
                                            href={mySubmission.file_url} 
                                            target="_blank" 
                                            rel="noreferrer" 
                                            className="px-8 py-4 rounded-2xl bg-[var(--bg-primary)] text-[var(--text-primary)] font-black text-[10px] uppercase tracking-widest transition-all shadow-2xl active:scale-95 flex items-center gap-3 hover:translate-y-[-2px]"
                                        >
                                            <File className="h-4 w-4" /> {t('assign_down_appendix')}
                                        </a>
                                    )}
                                </div>
                            </div>
                        ) : mySubmission?.status === 'submitted' ? (
                            <div className="insta-card p-10 border-l-4 border-l-amber-500 bg-amber-500/[0.03] flex items-center gap-8">
                                <div className="h-16 w-16 rounded-[2rem] bg-amber-500/10 flex items-center justify-center text-amber-500 shadow-inner">
                                    <Clock className="h-8 w-8" />
                                </div>
                                <div>
                                    <h3 className="text-amber-600 font-black uppercase tracking-[0.2em] text-[10px] mb-2">{t('assign_stat_sub_pending')}</h3>
                                    <p className="text-[var(--text-secondary)] font-medium italic opacity-80 decoration-amber-500/20 underline underline-offset-8 decoration-2">
                                        {t('assign_sub_pending_sub')}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="insta-card p-10 border-l-4 border-l-[var(--text-secondary)] bg-[var(--bg-secondary)]/[0.2] flex items-center gap-8 opacity-60">
                                <div className="h-16 w-16 rounded-[2rem] bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-secondary)] shadow-inner">
                                    <FileText className="h-8 w-8" />
                                </div>
                                <div>
                                    <h3 className="text-[var(--text-secondary)] font-black uppercase tracking-[0.2em] text-[10px] mb-2">{t('assign_stat_no_sub')}</h3>
                                    <p className="text-[var(--text-secondary)] font-medium italic leading-relaxed">
                                        {t('assign_no_sub_sub')}
                                    </p>
                                </div>
                            </div>
                        )}
                    </section>

                    {!mySubmission || mySubmission.status === 'submitted' ? (
                        <section className="animate-fade-in-up stagger-2">
                            <div className="flex items-center gap-4 mb-10">
                                <h3 className="text-xl font-black text-[var(--text-primary)] tracking-tight italic">
                                    {mySubmission ? t('assign_refine_sub') : t('assign_initial_sub')}
                                </h3>
                                <div className="h-px flex-1 bg-[var(--border-color)] opacity-40"></div>
                            </div>
                            
                            <div className="glass-card p-10 space-y-10 border-none shadow-xl">
                                <div className="space-y-4">
                                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] opacity-60 ml-1">
                                        <FileText className="h-3 w-3" />
                                        {t('assign_label_abstract')}
                                    </label>
                                    <textarea
                                        value={submitContent}
                                        onChange={(e) => setSubmitContent(e.target.value)}
                                        placeholder={t('assign_place_abstract')}
                                        className="w-full h-56 px-8 py-6 rounded-[2.5rem] border border-[var(--border-color)] bg-white/5 focus:bg-white/10 focus:ring-4 focus:ring-[var(--accent-primary)]/20 outline-none transition-all text-[var(--text-primary)] font-medium italic leading-[1.8] resize-none custom-scrollbar"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] opacity-60 ml-1">
                                        <Upload className="h-3 w-3" />
                                        {t('assign_label_portfolio')}
                                    </label>
                                    <div className="relative group overflow-hidden rounded-[2.5rem]">
                                        <input
                                            type="file"
                                            onChange={(e) => setSubmitFile(e.target.files[0])}
                                            className="w-full px-8 py-20 border-2 border-dashed border-[var(--border-color)] bg-[var(--bg-secondary)]/[0.3] hover:bg-[var(--bg-secondary)]/[0.6] transition-all cursor-pointer text-transparent file:hidden"
                                        />
                                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-all duration-500 group-hover:scale-105">
                                            <div className="h-16 w-16 mb-4 rounded-3xl bg-white/30 backdrop-blur-md flex items-center justify-center text-[var(--accent-primary)] shadow-2xl group-hover:rotate-6 transition-transform">
                                                <Upload className="h-8 w-8" />
                                            </div>
                                            <span className="text-sm font-black tracking-widest uppercase text-[var(--text-primary)] opacity-60 group-hover:opacity-100">
                                                {submitFile ? submitFile.name : t('assign_place_portfolio')}
                                            </span>
                                            <span className="text-[10px] mt-2 italic text-[var(--text-secondary)] opacity-40">{t('assign_port_hint')}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-6">
                                    <button
                                        onClick={handleStudentSubmit}
                                        className="btn-primary !px-16 !py-5 text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 shadow-2xl group active:scale-95"
                                    >
                                        <Upload className="h-4 w-4 group-hover:translate-y-[-2px] transition-transform" />
                                        {mySubmission ? t('assign_action_resubmit') : t('assign_action_final_submit')}
                                    </button>
                                </div>
                            </div>
                        </section>
                    ) : null}
                </div>
            ) : (
                /* INSTRUCTOR VIEW */
                <section className="animate-fade-in-up stagger-1">
                    <div className="insta-card overflow-hidden shadow-2xl border-none border-t border-[var(--border-color)]">
                        <div className="p-10 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/30 backdrop-blur-md flex justify-between items-center">
                            <div className="space-y-1">
                                <h2 className="text-2xl font-black text-[var(--text-primary)] tracking-tight italic flex items-center gap-3">
                                    <FileText className="h-6 w-6 text-[var(--accent-primary)]" />
                                    {t('assign_ledger')}
                                </h2>
                                <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] opacity-40">{t('assign_ledger_sub')}</p>
                            </div>
                            <div className="h-10 px-5 rounded-full bg-[var(--text-primary)] text-[var(--bg-primary)] text-[10px] font-black tracking-widest uppercase flex items-center justify-center shadow-2xl">
                                {t('assign_reg_records', { count: allSubmissions.length })}
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            {/* Desktop View: Table */}
                            <table className="hidden md:table w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[var(--bg-secondary)]/50 border-b border-[var(--border-color)]">
                                        <th className="px-10 py-6 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest opacity-60">{t('label_scholar_id')}</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest opacity-60 text-center">{t('table_status')}</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest opacity-60 text-center">{t('label_evaluation')}</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest opacity-60 text-right">{t('label_actions')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border-color)] bg-white/5">
                                    {allSubmissions.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-10 py-32 text-center">
                                                <div className="flex flex-col items-center">
                                                    <div className="h-20 w-20 rounded-[2rem] bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-secondary)] opacity-10 mb-6">
                                                        <FileText className="h-10 w-10" />
                                                    </div>
                                                    <p className="text-[var(--text-secondary)] font-black uppercase tracking-widest text-xs opacity-30 italic">{t('assign_nulla_records')}</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        allSubmissions.map((sub, idx) => (
                                            <tr key={sub.id} className={`hover:bg-[var(--accent-primary)]/[0.02] transition-colors group animate-fade-in-up stagger-${(idx % 5) + 1}`}>
                                                <td className="px-10 py-8">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-12 w-12 rounded-2xl bg-[var(--text-primary)] text-[var(--bg-primary)] flex items-center justify-center font-black text-lg group-hover:bg-[var(--accent-primary)] transition-all duration-500 shadow-xl overflow-hidden relative">
                                                            <div className="absolute inset-x-0 bottom-0 h-1 bg-white opacity-20" />
                                                            {sub.fullname.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="space-y-1">
                                                            <div className="font-bold text-[var(--text-primary)] text-lg tracking-tight group-hover:text-[var(--accent-primary)] transition-colors">{sub.fullname}</div>
                                                            <div className="text-[10px] text-[var(--text-secondary)] font-black tracking-widest uppercase opacity-40 italic">{sub.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-8 text-center">
                                                    <span className={`
                                                        px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border inline-flex items-center gap-2
                                                        ${sub.status === 'graded' 
                                                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)]' 
                                                            : 'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-[0_0_20px_-5px_rgba(245,158,11,0.3)]'}
                                                    `}>
                                                        <div className={`h-1.5 w-1.5 rounded-full ${sub.status === 'graded' ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
                                                        {sub.status === 'graded' ? t('assign_stat_evaluated') : t('assign_stat_pending_rev')}
                                                    </span>
                                                </td>
                                                <td className="px-10 py-8 text-center font-black text-[var(--text-primary)]">
                                                    {sub.grade !== null ? (
                                                        <div className="flex items-center justify-center gap-1 italic">
                                                            <span className="text-3xl tracking-tighter decoration-[var(--accent-primary)]/30 underline underline-offset-4">{sub.grade}</span>
                                                            <span className="text-[10px] text-[var(--text-secondary)] opacity-40">/ 100</span>
                                                        </div>
                                                    ) : <span className="text-[var(--text-secondary)] opacity-20 italic">{t('assign_stat_unprocessed')}</span>}
                                                </td>
                                                <td className="px-10 py-8 text-right">
                                                    <button
                                                        onClick={() => {
                                                            setGradingTarget(sub);
                                                            setGradeScore(sub.grade || "");
                                                            setGradeFeedback(sub.feedback || "");
                                                        }}
                                                        className="px-6 py-3 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-primary)] font-black text-[10px] uppercase tracking-widest hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-all shadow-inner active:scale-95 group/btn"
                                                    >
                                                        {t('assign_action_review')}
                                                        <ChevronRight className="h-3 w-3 inline ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>

                            {/* Mobile Summary-to-Detail View (< md) */}
                            <div className="md:hidden">
                                {allSubmissions.length === 0 ? (
                                    <div className="flex flex-col items-center py-20 px-8 text-center bg-[var(--bg-secondary)]/10 rounded-[2rem] mx-4 my-8">
                                        <div className="h-16 w-16 rounded-2xl bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-secondary)] opacity-10 mb-6">
                                            <FileText className="h-8 w-8" />
                                        </div>
                                        <p className="text-[var(--text-secondary)] font-black uppercase tracking-widest text-[10px] opacity-30 italic">{t('assign_nulla_records')}</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-[var(--border-color)]/30">
                                        {allSubmissions.map((sub) => (
                                            <MobileListItem
                                                key={sub.id}
                                                title={sub.fullname}
                                                subtitle={sub.status === 'graded' ? `${t('assign_stat_evaluated')} • ${sub.grade}/100` : t('assign_stat_pending_rev')}
                                                avatar={sub.fullname.charAt(0).toUpperCase()}
                                                isExpanded={gradingTarget?.id === sub.id}
                                                onToggle={() => {
                                                    if (gradingTarget?.id === sub.id) {
                                                        setGradingTarget(null);
                                                    } else {
                                                        setGradingTarget(sub);
                                                        setGradeScore(sub.grade || "");
                                                        setGradeFeedback(sub.feedback || "");
                                                    }
                                                }}
                                                actions={[
                                                    {
                                                        label: t('assign_action_process'),
                                                        icon: GraduationCap,
                                                        onClick: () => {
                                                            setGradingTarget(sub);
                                                            setGradeScore(sub.grade || "");
                                                            setGradeFeedback(sub.feedback || "");
                                                        },
                                                        variant: 'primary'
                                                    }
                                                ]}
                                            >
                                                <div className="grid grid-cols-1 gap-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center">
                                                            <Mail className="h-3 w-3 text-[var(--text-secondary)]" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-40">{t('assign_label_email')}</p>
                                                            <p className="font-bold text-[var(--text-primary)] truncate">{sub.email}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center">
                                                            <Star className={`h-3 w-3 ${sub.status === 'graded' ? 'text-emerald-500' : 'text-amber-500'}`} />
                                                        </div>
                                                        <div>
                                                            <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-40">{t('label_evaluation')}</p>
                                                            <p className={`font-bold ${sub.status === 'graded' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                                                {sub.status === 'graded' ? t('assign_stat_finalized', { grade: sub.grade }) : t('assign_stat_awaiting')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </MobileListItem>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Evaluation Modal */}
            {gradingTarget && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100] flex items-center justify-center p-8 animate-fade-in">
                    <div className="glass-card p-0 w-full max-w-4xl max-h-[90vh] flex flex-col shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border-none relative overflow-hidden animate-fade-in-up">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[var(--accent-primary)] to-emerald-500 transform origin-left animate-in slide-in-from-left duration-1000" />
                        
                        <div className="p-10 pb-0 flex justify-between items-start z-10">
                            <div className="space-y-2">
                                <h3 className="text-4xl font-black text-[var(--text-primary)] tracking-tight italic">
                                    {t('assign_digital_eval').split(' ')[0]} <span className="text-[var(--accent-primary)]">{t('assign_digital_eval').split(' ')[1]}</span>
                                </h3>
                                <div className="flex items-center gap-3">
                                    <div className="h-3 w-3 rounded-full bg-emerald-500" />
                                    <p className="text-[var(--text-secondary)] font-medium text-lg italic opacity-80">{t('assign_scholar_label')} <span className="text-[var(--text-primary)] font-black not-italic ml-2">{gradingTarget.fullname}</span></p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setGradingTarget(null)}
                                className="h-12 w-12 rounded-2xl bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-secondary)] hover:bg-rose-500 hover:text-white transition-all shadow-inner group"
                            >
                                <X className="h-6 w-6 group-hover:rotate-90 transition-transform" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-10 pt-12 space-y-12 pr-6 custom-scrollbar z-10">
                            <section className="space-y-6">
                                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] opacity-60">
                                    <FileText className="h-3 w-3" />
                                    {t('assign_artifact')}
                                </label>
                                <div className="bg-[var(--bg-secondary)]/[0.3] border border-[var(--border-color)] p-8 rounded-[2.5rem] relative group/artifact">
                                    <div className="absolute top-6 right-6 opacity-10 group-hover/artifact:opacity-20 transition-opacity">
                                        <FileText className="h-10 w-10" />
                                    </div>
                                    <p className="text-[var(--text-primary)] font-medium text-lg leading-[1.8] italic whitespace-pre-wrap decoration-[var(--accent-primary)]/10 underline decoration-2 underline-offset-8">
                                        {gradingTarget.content || t('assign_no_art_content')}
                                    </p>
                                    {gradingTarget.file_url && (
                                        <div className="mt-10 pt-10 border-t border-[var(--border-color)]/50">
                                            <a 
                                                href={gradingTarget.file_url} 
                                                target="_blank" 
                                                rel="noreferrer" 
                                                className="inline-flex items-center gap-4 px-10 py-4 rounded-2xl bg-[var(--text-primary)] text-[var(--bg-primary)] font-black text-[10px] uppercase tracking-widest transition-all shadow-2xl hover:scale-[1.02] active:scale-98"
                                            >
                                                <Upload className="h-4 w-4" /> {t('assign_down_artifact')}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </section>

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-end">
                                <div className="md:col-span-3 space-y-4">
                                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] opacity-60">{t('label_grade')}</label>
                                    <div className="relative group">
                                        <input
                                            type="number"
                                            value={gradeScore}
                                            onChange={(e) => setGradeScore(e.target.value)}
                                            placeholder="0"
                                            className="w-full h-24 px-8 rounded-3xl border border-[var(--border-color)] bg-white/5 focus:bg-white/10 focus:ring-4 focus:ring-[var(--accent-primary)]/20 outline-none transition-all text-5xl font-black text-[var(--text-primary)] text-center tracking-tighter"
                                            style={{ fontSize: '3rem' }}
                                        />
                                        <div className="absolute top-1/2 -right-3 -translate-y-1/2 text-[10px] font-black text-[var(--text-secondary)] opacity-40">/ 100</div>
                                    </div>
                                </div>
                                <div className="md:col-span-9 space-y-4">
                                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] opacity-60">{t('assign_label_eval_note')}</label>
                                    <textarea
                                        value={gradeFeedback}
                                        onChange={(e) => setGradeFeedback(e.target.value)}
                                        placeholder={t('assign_place_eval_note')}
                                        className="w-full h-32 px-8 py-6 rounded-3xl border border-[var(--border-color)] bg-white/5 focus:bg-white/10 focus:ring-4 focus:ring-[var(--accent-primary)]/20 outline-none transition-all text-base font-medium text-[var(--text-primary)] italic resize-none custom-scrollbar"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-10 pt-4 flex gap-6 z-10 bg-gradient-to-t from-[var(--bg-primary)] to-transparent">
                            <button 
                                onClick={() => setGradingTarget(null)} 
                                className="flex-1 py-5 rounded-2xl bg-[var(--bg-secondary)] text-[var(--text-primary)] text-[10px] font-black uppercase tracking-widest hover:bg-[var(--border-color)] transition-all active:scale-95 shadow-inner"
                            >
                                {t('assign_action_abandon_rev')}
                            </button>
                            <button 
                                onClick={handleInstructorGrade} 
                                className="flex-[2] py-5 rounded-2xl bg-[var(--text-primary)] text-[var(--bg-primary)] text-[10px] font-black uppercase tracking-widest transition-all shadow-2xl active:scale-95 hover:opacity-95 flex items-center justify-center gap-3 group"
                            >
                                <CheckCircle className="h-4 w-4 group-hover:scale-110 transition-transform" />
                                {t('assign_action_commemorate')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

