import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/axios';
import { toast } from 'sonner';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userSchema } from "../../type/userSchema";
import { User, Mail, Lock, Shield, Loader2, Edit2, Trash2, UserPlus, BookOpen, X, ChevronRight, Fingerprint } from "lucide-react";
import { DataCard } from "../../components/shared/DataCard";
import { useTranslation } from "../../hooks/useTranslation";
import MobileListItem from "../../components/shared/MobileListItem";

export const UserManagement = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedUserId, setExpandedUserId] = useState(null);

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    const {
        register,
        handleSubmit: handleEditSubmit,
        reset,
        formState: { errors: editErrors, isSubmitting: isUpdating },
    } = useForm({
        resolver: zodResolver(userSchema),
    });

    // Assign Course Modal State
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [assigningUser, setAssigningUser] = useState(null);
    const [availableCourses, setAvailableCourses] = useState([]);
    const [selectedCourseIds, setSelectedCourseIds] = useState([]);

    // Fetch Users
    const fetchUsers = async () => {
        try {
            const res = await api.get("/users");
            setUsers(res.data);
        } catch (error) {
            console.error(error);
            toast.error(t('alert_fetch_error') || "Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Delete User (Optimistic with Undo)
    const handleDeleteUser = (userId) => {
        const previousUsers = [...users];
        setUsers(prev => prev.filter(u => u.userid !== userId));

        const timer = setTimeout(async () => {
            try {
                await api.delete(`/users/${userId}`);
            } catch (error) {
                console.error(error);
                toast.error(t('alert_error'));
                setUsers(previousUsers);
            }
        }, 5000);

        toast.success(t('alert_deleted_toast') || "Tài khoản đã được đưa vào thùng rác", {
            duration: 5000,
            action: {
                label: t('alert_undo') || 'Hoàn tác (Undo)',
                onClick: () => {
                    clearTimeout(timer);
                    setUsers(previousUsers);
                    toast.success(t('alert_undo_success') || "Đã hoàn tác xóa tài khoản!");
                }
            }
        });
    };

    const handleEditClick = (user) => {
        setEditingUser(user);
        reset({
            fullname: user.fullname,
            username: user.username,
            email: user.email,
            role: user.role,
            password: ''
        });
        setIsEditModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsEditModalOpen(false);
        setEditingUser(null);
    };

    const onUpdateSubmit = async (data) => {
        try {
            const payload = { ...data };
            if (!payload.password) delete payload.password;
            await api.put(`/users/${editingUser.userid}`, payload);
            toast.success(t('alert_success') || "User updated successfully");
            setIsEditModalOpen(false);
            fetchUsers();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || t('alert_error'));
        }
    };

    const fetchCourses = async () => {
        try {
            const res = await api.get("/courses");
            setAvailableCourses(res.data);
        } catch (error) {
            console.error(error);
            toast.error(t('alert_fetch_error'));
        }
    };

    const handleAssignClick = async (user) => {
        setAssigningUser(user);
        setIsAssignModalOpen(true);
        if (availableCourses.length === 0) await fetchCourses();
        try {
            const res = await api.get(`/enrollments/student/${user.userid}`);
            const enrolledIds = res.data.map(e => e.course_id);
            setSelectedCourseIds(enrolledIds);
        } catch (error) {
            console.error(error);
            toast.error(t('alert_error'));
        }
    };

    const handleSaveAssignments = async () => {
        try {
            await api.post('/enrollments/assign', { 
                studentId: assigningUser.userid, 
                courseIds: selectedCourseIds 
            });
            toast.success(t('alert_assign_success') || "Courses assigned successfully!");
            setIsAssignModalOpen(false);
        } catch (error) {
            console.error(error);
            toast.error(t('alert_assign_error'));
        }
    };

    const toggleCourseSelection = (courseId) => {
        setSelectedCourseIds(prev => 
            prev.includes(courseId) ? prev.filter(id => id !== courseId) : [...prev, courseId]
        );
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen animate-fade-in-up pb-32">
            <header className="glass-card p-8 md:p-12 mb-8 md:mb-12 relative overflow-hidden group shadow-2xl">
                <div className="absolute top-0 right-0 w-80 h-80 bg-[var(--accent-primary)] opacity-[0.03] rounded-full -mr-40 -mt-40 transition-transform duration-[2000ms] group-hover:scale-125" />
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-end md:items-center gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-2xl bg-[var(--accent-primary)] flex items-center justify-center text-[var(--bg-primary)] shadow-xl">
                                <Shield className="h-6 w-6" strokeWidth={1.5} />
                            </div>
                            <h1 className="text-3xl md:text-4xl font-medium text-[var(--text-primary)] tracking-tight italic leading-relaxed">
                                {t('user_governance').split(' ')[0]} <span className="text-[var(--accent-primary)]">{t('user_governance').split(' ')[1]}</span>
                            </h1>
                        </div>
                        <p className="text-[var(--text-secondary)] font-medium text-base md:text-lg italic opacity-80 leading-relaxed max-w-2xl">
                            {t('portal_admin_sub')} — {t('user_add_subtitle')}
                        </p>
                    </div>
                    <button onClick={() => navigate('/adduser')} className="btn-primary w-full md:w-auto !px-10 !py-4 flex items-center justify-center gap-3 shadow-2xl group active:scale-95 text-[10px] uppercase tracking-[0.2em]">
                        <UserPlus className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                        {t('user_provision_new')}
                    </button>
                </div>
            </header>

            <div className="insta-card overflow-hidden shadow-2xl border-none">
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-32 animate-fade-in">
                        <Loader2 className="h-16 w-16 animate-spin text-[var(--accent-primary)] mb-6" />
                        <p className="text-[var(--text-secondary)] font-black uppercase tracking-[0.3em] text-[10px]">{t('user_init_registry')}</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table View (≥ md) */}
                        <div className="hidden md:block overflow-x-auto">
                        {/* Desktop View: Table (Accessible via md:table) */}
                        <table className="hidden md:table w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[var(--bg-secondary)]/50 border-b border-[var(--border-color)]">
                                        <th className="px-10 py-6 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest opacity-60">{t('label_scholar_id')}</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest opacity-60 text-center">{t('label_system_authority')}</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest opacity-60 text-right">{t('label_actions')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border-color)] bg-white/5">
                                    {users.map((u) => (
                                        <tr key={u.userid} className="hover:bg-[var(--accent-primary)]/[0.02] transition-colors group">
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-2xl bg-[var(--text-primary)] text-[var(--bg-primary)] flex items-center justify-center font-black text-lg group-hover:bg-[var(--accent-primary)] transition-all">
                                                        {u.fullname.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-[var(--text-primary)] text-lg">{u.fullname}</div>
                                                        <div className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest opacity-40 italic">@{u.username}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8 text-center">
                                                <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase bg-[var(--bg-secondary)] text-[var(--text-secondary)]">
                                                    {u.role === 'admin' ? t('role_admin') : u.role === 'instructor' ? t('role_instructor') : t('role_student')}
                                                </span>
                                            </td>
                                            <td className="px-10 py-8 text-right">
                                                <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                                                    <button onClick={() => handleEditClick(u)} className="h-10 w-10 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all"><Edit2 className="h-4 w-4" /></button>
                                                    <button onClick={() => handleDeleteUser(u.userid)} className="h-10 w-10 bg-rose-500/10 text-rose-500 rounded-xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"><Trash2 className="h-4 w-4" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Summary-to-Detail View (< md) */}
                        <div className="md:hidden">
                            {users.map((u) => (
                                <MobileListItem
                                    key={u.userid}
                                    title={u.fullname}
                                    subtitle={u.role === 'admin' ? t('role_admin') : u.role === 'instructor' ? t('role_instructor') : t('role_student')}
                                    avatar={u.fullname.charAt(0).toUpperCase()}
                                    isExpanded={expandedUserId === u.userid}
                                    onToggle={() => setExpandedUserId(expandedUserId === u.userid ? null : u.userid)}
                                    actions={[
                                        ...(u.role === 'student' ? [{
                                            label: t('course_enroll'),
                                            icon: BookOpen,
                                            onClick: () => handleAssignClick(u),
                                            variant: 'success'
                                        }] : []),
                                        {
                                            label: t('settings_save').split(' ')[0], // "Edit" equivalent
                                            icon: Edit2,
                                            onClick: () => handleEditClick(u),
                                            variant: 'primary'
                                        },
                                        {
                                            label: t('user_delete'),
                                            icon: Trash2,
                                            onClick: () => handleDeleteUser(u.userid),
                                            variant: 'danger'
                                        }
                                    ]}
                                >
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <span className="text-[9px] font-black uppercase tracking-widest opacity-40 italic flex items-center gap-2">
                                                <Fingerprint className="h-3 w-3" /> {t('label_username')}
                                            </span>
                                            <p className="font-bold text-[var(--text-primary)]">@{u.username}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[9px] font-black uppercase tracking-widest opacity-40 italic flex items-center gap-2">
                                                <Shield className="h-3 w-3" /> {t('label_scholar_id')}
                                            </span>
                                            <p className="font-bold text-[var(--text-primary)]">#{u.userid}</p>
                                        </div>
                                        <div className="col-span-2 space-y-1">
                                            <span className="text-[9px] font-black uppercase tracking-widest opacity-40 italic flex items-center gap-2">
                                                <Mail className="h-3 w-3" /> {t('label_email')}
                                            </span>
                                            <p className="font-bold text-[var(--text-primary)] break-all">{u.email}</p>
                                        </div>
                                    </div>
                                </MobileListItem>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Evaluation Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[150] flex items-center justify-center p-4 md:p-8 animate-fade-in">
                    <div className="glass-card p-8 md:p-12 w-full max-w-2xl relative animate-fade-in-up shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border-none">
                        <button onClick={handleCloseModal} className="absolute right-6 top-6 h-10 w-10 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center transition-all hover:bg-rose-500 hover:text-white shadow-inner active:scale-95"><X className="h-5 w-5" /></button>
                        <h3 className="text-3xl font-black italic mb-8">{t('user_refine').split(' ')[0]} <span className="text-[var(--accent-primary)]">{t('user_refine').split(' ')[1]}</span></h3>
                        <form onSubmit={handleEditSubmit(onUpdateSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-2">{t('label_full_name')}</label>
                                    <input {...register("fullname")} className="w-full text-base p-5 rounded-2xl bg-white/5 border border-[var(--border-color)] outline-none focus:border-[var(--accent-primary)] focus:ring-4 focus:ring-[var(--accent-primary)]/10 transition-all font-medium italic"/>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-2">{t('label_username')}</label>
                                    <input {...register("username")} className="w-full text-base p-5 rounded-2xl bg-white/5 border border-[var(--border-color)] outline-none focus:border-[var(--accent-primary)] focus:ring-4 focus:ring-[var(--accent-primary)]/10 transition-all font-medium italic"/>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-2">{t('label_email')}</label>
                                <input {...register("email")} className="w-full text-base p-5 rounded-2xl bg-white/5 border border-[var(--border-color)] outline-none focus:border-[var(--accent-primary)] focus:ring-4 focus:ring-[var(--accent-primary)]/10 transition-all font-medium italic"/>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-2">{t('user_cred_refresh')}</label>
                                    <input {...register("password")} type="password" placeholder="••••••••" className="w-full text-base p-5 rounded-2xl bg-white/5 border border-[var(--border-color)] outline-none focus:border-[var(--accent-primary)] focus:ring-4 focus:ring-[var(--accent-primary)]/10 transition-all font-medium"/>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-2">{t('label_system_authority')}</label>
                                    <select {...register("role")} className="w-full text-base p-5 rounded-2xl bg-white/5 border border-[var(--border-color)] outline-none focus:border-[var(--accent-primary)] focus:ring-4 focus:ring-[var(--accent-primary)]/10 transition-all font-black uppercase tracking-widest italic appearance-none cursor-pointer">
                                        <option value="student">{t('user_student_acc')}</option>
                                        <option value="instructor">{t('user_instructor_acc')}</option>
                                        <option value="admin">{t('role_admin_architect')}</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4 pt-6">
                                <button type="button" onClick={handleCloseModal} className="flex-1 py-5 rounded-2xl bg-[var(--bg-secondary)] font-black text-[10px] uppercase tracking-widest shadow-inner active:scale-95 transition-all">{t('action_abandon')}</button>
                                <button type="submit" disabled={isUpdating} className="flex-[2] py-5 rounded-2xl bg-[var(--text-primary)] text-[var(--bg-primary)] font-black text-[10px] uppercase tracking-widest shadow-2xl active:scale-95 transition-all hover:bg-[var(--accent-primary)] hover:text-white">
                                    {isUpdating ? <Loader2 className="animate-spin h-4 w-4 mx-auto"/> : t('user_commit_update')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Course Allocation Modal */}
            {isAssignModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[150] flex items-center justify-center p-4 md:p-8 animate-fade-in">
                    <div className="glass-card p-8 md:p-12 w-full max-w-2xl max-h-[85vh] flex flex-col relative animate-fade-in-up border-none shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]">
                        <button onClick={() => setIsAssignModalOpen(false)} className="absolute right-6 top-6 h-10 w-10 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center transition-all hover:bg-rose-500 hover:text-white shadow-inner active:scale-95"><X className="h-5 w-5" /></button>
                        <div className="mb-8">
                            <h3 className="text-3xl font-black italic flex items-center gap-3">
                                {t('user_allocation').split(' ')[0]} <span className="text-emerald-500">{t('user_allocation').split(' ')[1]}</span>
                                <BookOpen className="h-6 w-6 text-emerald-500 opacity-20" />
                            </h3>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40 italic mt-2">{t('user_for_scholar', { name: assigningUser?.fullname })}</p>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-3 mb-8 pr-4 custom-scrollbar">
                            {availableCourses.map((c) => (
                                <div key={c.courseid} onClick={() => toggleCourseSelection(c.courseid)} className={`group p-5 rounded-[1.5rem] border transition-all cursor-pointer flex justify-between items-center ${selectedCourseIds.includes(c.courseid) ? 'bg-emerald-500/10 border-emerald-500/50 shadow-inner' : 'bg-white/5 border-[var(--border-color)] hover:bg-white/10 hover:border-[var(--accent-primary)]/30'}`}>
                                    <div className="space-y-1">
                                        <p className={`font-bold transition-colors ${selectedCourseIds.includes(c.courseid) ? 'text-emerald-500' : 'text-[var(--text-primary)]'}`}>{c.title}</p>
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">{t('user_artifact')} #{c.courseid}</p>
                                    </div>
                                    <div className={`h-6 w-6 rounded-lg flex items-center justify-center transition-all ${selectedCourseIds.includes(c.courseid) ? 'bg-emerald-500 text-white rotate-0' : 'bg-[var(--bg-secondary)] text-transparent rotate-45 opacity-20 group-hover:opacity-100'}`}>
                                        <ChevronRight className="h-4 w-4" />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button onClick={handleSaveAssignments} className="w-full py-6 rounded-2xl bg-emerald-500 text-white font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-emerald-500/30 active:scale-95 transition-all hover:bg-emerald-600">{t('action_save_allocation')}</button>
                    </div>
                </div>
            )}
        </div>
    );
};
