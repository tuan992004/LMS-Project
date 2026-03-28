import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/axios';
import { useAuthStore } from '../../stores/userAuthStore';
import { toast } from 'sonner';
import { Plus, Loader2, BookOpen, CheckCircle, Trash2, Settings2, ChevronRight, Mail, User, Shield } from 'lucide-react';
import { DataCard } from "../../components/shared/DataCard";
import MobileListItem from "../../components/shared/MobileListItem";
import { useTranslation } from '../../hooks/useTranslation';

export const CourseManagement = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { t } = useTranslation();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedCourseId, setExpandedCourseId] = useState(null);

    // Fetch Courses
    const fetchCourses = async () => {
        try {
            const res = await api.get("/courses");
            setCourses(res.data);
        } catch (error) {
            console.error(error);
            toast.error(t('alert_fetch_error'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    // Delete Course (Optimistic with Undo)
    const handleDeleteCourse = (courseId) => {
        const previousCourses = [...courses];
        setCourses(prev => prev.filter(c => c.courseid !== courseId));

        const timer = setTimeout(async () => {
            try {
                await api.delete(`/courses/${courseId}`);
            } catch (error) {
                toast.error(t('alert_delete_error'));
                setCourses(previousCourses);
            }
        }, 5000);

        toast.success(t('alert_deleted_toast'), {
            duration: 5000,
            action: {
                label: t('alert_undo'),
                onClick: () => {
                    clearTimeout(timer);
                    setCourses(previousCourses);
                    toast.success(t('alert_undo_success'));
                }
            }
        });
    };

    // Approve Course (Only Admin)
    const handleApprove = async (courseId) => {
        try {
            await api.patch(`/courses/approve/${courseId}`, { status: 'approved' });
            toast.success(t('alert_approve_success'));
            fetchCourses();
        } catch (error) {
            toast.error(t('alert_approve_error'));
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen animate-fade-in-up pb-32">
            {/* Header Area */}
            <header className="glass-card p-10 relative overflow-hidden group mb-12 shadow-2xl">
                <div className="absolute top-0 right-0 w-72 h-72 bg-[var(--accent-primary)] opacity-[0.03] rounded-full -mr-36 -mt-36 transition-transform duration-1000 group-hover:scale-125" />
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div className="flex items-center gap-6">
                        <div className="h-14 w-14 rounded-2xl bg-[var(--accent-primary)] flex items-center justify-center text-[var(--bg-primary)] shadow-xl">
                            <BookOpen className="h-6 w-6" strokeWidth={1.5} />
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-4xl font-black text-[var(--text-primary)] tracking-tight italic">
                                {t('course_catalog_title').split(' ')[0]} <span className="text-[var(--accent-primary)]">{t('course_catalog_title').split(' ')[1] || ''}</span>
                            </h2>
                            <p className="text-[var(--text-secondary)] font-medium text-lg italic opacity-80">
                                {t('course_catalog_subtitle')}
                            </p>
                        </div>
                    </div>
                    
                    <button
                        onClick={() => navigate(user?.role === 'admin' ? '/admin/addcourse' : '/teacher/addcourse')}
                        className="btn-primary !px-10 !py-5 text-[10px] uppercase tracking-widest group shadow-2xl"
                    >
                        <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                        {t('course_add_new')}
                    </button>
                </div>
            </header>

            {/* Table Container */}
            <div className="insta-card overflow-hidden shadow-2xl animate-fade-in-up stagger-1 border-none">
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-32 bg-white/5">
                        <Loader2 className="h-12 w-12 animate-spin text-[var(--accent-primary)] mb-6" />
                        <p className="text-[var(--text-secondary)] font-bold italic animate-pulse">{t('course_sync_data')}</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop View: Table */}
                        <div className="hidden md:block overflow-x-auto">
                        {/* Desktop View: Table (≥ md) */}
                        <table className="hidden md:table w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/50 backdrop-blur-md">
                                        <th className="px-8 py-6 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] opacity-60">{t('table_identity')}</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] opacity-60">{t('table_title')}</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] opacity-60">{t('table_status')}</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] opacity-60">{t('table_instructor')}</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] opacity-60 text-right">{t('table_operations')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border-color)] bg-white/5">
                                    {courses.map((c, idx) => (
                                        <tr key={c.courseid} className="hover:bg-[var(--accent-primary)]/[0.02] transition-colors group">
                                            <td className="px-8 py-6 whitespace-nowrap text-xs text-[var(--text-secondary)] font-black tracking-widest opacity-40">#{c.courseid}</td>
                                            <td className="px-8 py-6 whitespace-nowrap">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-2xl bg-[var(--text-primary)] flex items-center justify-center text-[var(--bg-primary)] group-hover:bg-[var(--accent-primary)] transition-all duration-500 shadow-xl shadow-black/10">
                                                        <BookOpen className="h-5 w-5" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-[var(--text-primary)] text-lg leading-tight group-hover:text-[var(--accent-primary)] transition-colors">{c.title}</span>
                                                        <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest opacity-30">{t('course_academic_module')}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap">
                                                <span className={`
                                                    px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border shadow-sm
                                                    ${c.status === 'approved' 
                                                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                                                        : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}
                                                `}>
                                                    {c.status === 'approved' ? t('status_approved') : t('status_pending')}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-6 w-6 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)]" />
                                                    <span className="text-sm font-bold text-[var(--text-secondary)] italic opacity-80 decoration-indigo-500/30 underline-offset-4 hover:underline">ID:{c.instructor_id}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap text-right">
                                                <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-500">
                                                    <button
                                                        onClick={() => navigate(user?.role === 'admin' ? `/admin/lessons/${c.courseid}` : `/teacher/lessons/${c.courseid}`)}
                                                        className="h-10 px-4 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-500 hover:bg-indigo-500/10 border border-transparent hover:border-indigo-500/20 transition-all active:scale-95"
                                                        title={t('course_curriculum_btn')}
                                                    >
                                                        <Settings2 className="h-4 w-4" />
                                                        {t('course_curriculum_btn')}
                                                    </button>
                                                    
                                                    {user?.role === 'admin' && (
                                                        <>
                                                            {c.status === 'pending' && (
                                                                <button
                                                                    onClick={() => handleApprove(c.courseid)}
                                                                    className="h-10 px-4 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-500 hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/20 transition-all active:scale-95"
                                                                >
                                                                    <CheckCircle className="h-4 w-4" />
                                                                    {t('course_approve_btn')}
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => handleDeleteCourse(c.courseid)}
                                                                className="h-10 w-10 rounded-xl flex items-center justify-center text-rose-500 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all active:scale-95"
                                                                title="Delete Permanently"
                                                            >
                                                                <Trash2 className="h-4.5 w-4.5" />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Summary-to-Detail View (< md) */}
                        <div className="md:hidden">
                            {courses.map((c) => (
                                <MobileListItem
                                    key={c.courseid}
                                    title={c.title}
                                    subtitle={`Artifact #${c.courseid} • ID:${c.instructor_id}`}
                                    icon={BookOpen}
                                    isExpanded={expandedCourseId === c.courseid}
                                    onToggle={() => setExpandedCourseId(expandedCourseId === c.courseid ? null : c.courseid)}
                                    actions={[
                                        {
                                            label: t('course_curriculum_btn'),
                                            icon: Settings2,
                                            onClick: () => navigate(user?.role === 'admin' ? `/admin/lessons/${c.courseid}` : `/teacher/lessons/${c.courseid}`),
                                            variant: 'primary'
                                        },
                                        ...(user?.role === 'admin' && c.status === 'pending' ? [{
                                            label: t('course_approve_btn'),
                                            icon: CheckCircle,
                                            onClick: () => handleApprove(c.courseid),
                                            variant: 'success'
                                        }] : []),
                                        ...(user?.role === 'admin' ? [{
                                            label: 'Delete',
                                            icon: Trash2,
                                            onClick: () => handleDeleteCourse(c.courseid),
                                            variant: 'danger'
                                        }] : [])
                                    ]}
                                >
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center">
                                                <User className="h-3.5 w-3.5 text-[var(--accent-primary)]" />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-40">Instructor</p>
                                                <p className="text-xs font-bold text-[var(--text-primary)]">ID: {c.instructor_id}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center">
                                                <Shield className={`h-3.5 w-3.5 ${c.status === 'approved' ? 'text-emerald-500' : 'text-amber-500'}`} />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-40">Status</p>
                                                <p className={`text-[9px] font-black uppercase ${c.status === 'approved' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                                    {c.status === 'approved' ? t('status_approved') : t('status_pending')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </MobileListItem>
                            ))}
                        </div>
                    </>
                )}
            </div>
            
            {/* Empty State */}
            {!loading && courses.length === 0 && (
                <div className="p-32 glass-card border-dashed border-2 flex flex-col items-center text-center bg-white/5 mt-10">
                    <BookOpen className="h-20 w-20 text-[var(--text-secondary)] opacity-10 mb-8" />
                    <h3 className="text-2xl font-black text-[var(--text-primary)] mb-2 italic">{t('course_none_found')}</h3>
                    <p className="text-[var(--text-secondary)] font-medium max-w-sm italic opacity-60">{t('course_none_found_sub')}</p>
                </div>
            )}
        </div>
    );
};
