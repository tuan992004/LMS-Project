import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/axios';
import { toast } from 'sonner';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userSchema } from "../../type/userSchema";
import { User, Mail, Lock, Shield, Loader2, Edit2, Trash2, UserPlus, BookOpen, X } from "lucide-react";

export const UserManagement = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

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
            toast.error("Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Delete User (Optimistic with Undo)
    const handleDeleteUser = (userId) => {
        // Optimistically remove from UI
        const previousUsers = [...users];
        setUsers(prev => prev.filter(u => u.userid !== userId));

        const timer = setTimeout(async () => {
            try {
                await api.delete(`/users/${userId}`);
            } catch (error) {
                console.error(error);
                toast.error("Lỗi xóa người dùng");
                setUsers(previousUsers); // Restore if failed
            }
        }, 5000);

        toast.success("Tài khoản đã được đưa vào thùng rác", {
            duration: 5000,
            action: {
                label: 'Hoàn tác (Undo)',
                onClick: () => {
                    clearTimeout(timer);
                    setUsers(previousUsers); // Instantly restore
                    toast.success("Đã hoàn tác xóa tài khoản!");
                }
            }
        });
    };

    // Open Edit Modal
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

    // Close Edit Modal
    const handleCloseModal = () => {
        setIsEditModalOpen(false);
        setEditingUser(null);
    };

    // Update User
    const onUpdateSubmit = async (data) => {
        try {
            const payload = { ...data };
            if (!payload.password) {
                delete payload.password; // Don't send empty password
            }

            await api.put(`/users/${editingUser.userid}`, payload);
            toast.success("User updated successfully");
            setIsEditModalOpen(false);
            fetchUsers();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to update user");
        }
    };

    // --- ASSIGN COURSES LOGIC ---
    const fetchCourses = async () => {
        try {
            const res = await api.get("/courses");
            setAvailableCourses(res.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch available courses");
        }
    };

    const handleAssignClick = async (user) => {
        setAssigningUser(user);
        setIsAssignModalOpen(true);
        if (availableCourses.length === 0) {
            await fetchCourses();
        }
        
        try {
            const res = await api.get(`/enrollments/student/${user.userid}`);
            const enrolledIds = res.data.map(e => e.course_id);
            setSelectedCourseIds(enrolledIds);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch student enrollments");
        }
    };

    const handleSaveAssignments = async () => {
        try {
            await api.post('/enrollments/assign', { 
                studentId: assigningUser.userid, 
                courseIds: selectedCourseIds 
            });
            toast.success("Courses assigned successfully!");
            setIsAssignModalOpen(false);
        } catch (error) {
            console.error(error);
            toast.error("Failed to assign courses");
        }
    };

    const toggleCourseSelection = (courseId) => {
        setSelectedCourseIds(prev => 
            prev.includes(courseId) ? prev.filter(id => id !== courseId) : [...prev, courseId]
        );
    };

    return (
        <div className="p-8 max-w-7xl mx-auto min-h-screen animate-fade-in-up">
            <header className="glass-card p-12 mb-12 relative overflow-hidden group shadow-2xl">
                <div className="absolute top-0 right-0 w-80 h-80 bg-[var(--accent-primary)] opacity-[0.03] rounded-full -mr-40 -mt-40 transition-transform duration-[2000ms] group-hover:scale-125" />
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-end md:items-center gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-2xl bg-[var(--accent-primary)] flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
                                <Shield className="h-8 w-8" />
                            </div>
                            <h1 className="text-4xl font-black text-[var(--text-primary)] tracking-tight italic">
                                Identity <span className="text-[var(--accent-primary)]">Governance</span>
                            </h1>
                        </div>
                        <p className="text-[var(--text-secondary)] font-medium text-lg italic opacity-80 leading-relaxed max-w-2xl">
                            Quản trị hệ thống danh tính, phân quyền và điều phối nguồn lực học thuật.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/adduser')}
                        className="btn-primary !px-10 !py-4 flex items-center gap-3 shadow-2xl group active:scale-95 text-[10px] uppercase tracking-[0.2em]"
                    >
                        <UserPlus className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                        Provision New Identity
                    </button>
                </div>
            </header>

            <div className="insta-card overflow-hidden shadow-2xl border-none">
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-32 animate-fade-in">
                        <div className="relative h-16 w-16 mb-6">
                            <div className="absolute inset-0 rounded-full border-4 border-[var(--accent-primary)] opacity-10 blur-sm" />
                            <Loader2 className="h-16 w-16 animate-spin text-[var(--accent-primary)] relative z-10" />
                        </div>
                        <p className="text-[var(--text-secondary)] font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Initializing Identity Registry</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[var(--bg-secondary)]/50 border-b border-[var(--border-color)]">
                                    <th className="px-10 py-6 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest opacity-60">Scholar Identity</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest opacity-60">Credential Alias</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest opacity-60">Digital Mail</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest opacity-60 text-center">System Authority</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest opacity-60 text-right">Operations</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border-color)] bg-white/5">
                                {users.map((u, idx) => (
                                    <tr key={u.userid} className={`hover:bg-[var(--accent-primary)]/[0.02] transition-colors group animate-fade-in-up stagger-${(idx % 5) + 1}`}>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-2xl bg-[var(--text-primary)] text-[var(--bg-primary)] flex items-center justify-center font-black text-lg group-hover:bg-[var(--accent-primary)] transition-all duration-500 shadow-xl overflow-hidden relative">
                                                    <div className="absolute inset-x-0 bottom-0 h-1 bg-white opacity-20" />
                                                    {u.fullname.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="font-bold text-[var(--text-primary)] text-lg tracking-tight group-hover:text-[var(--accent-primary)] transition-colors">{u.fullname}</div>
                                                    <div className="text-[10px] text-[var(--text-secondary)] font-black tracking-widest uppercase opacity-40 italic">Registered Personnel</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-[var(--text-secondary)] font-medium italic italic">@{u.username}</td>
                                        <td className="px-10 py-8 text-[var(--text-secondary)] opacity-80 decoration-[var(--accent-primary)]/10 underline underline-offset-8 decoration-1">{u.email}</td>
                                        <td className="px-10 py-8 text-center">
                                            <span className={`
                                                px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border inline-flex items-center gap-2
                                                ${u.role === 'admin' ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] border-none shadow-[0_10px_30px_-10px_rgba(0,0,0,0.3)]' : 
                                                  u.role === 'instructor' ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20 shadow-[0_0_20px_-5px_rgba(99,102,241,0.3)]' : 
                                                  'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border-color)] opacity-60'}
                                            `}>
                                                <div className={`h-1.5 w-1.5 rounded-full ${u.role === 'admin' ? 'bg-white blink' : u.role === 'instructor' ? 'bg-indigo-500 mt-0.5' : 'bg-[var(--text-secondary)]'} `} />
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                                {u.role === 'student' && (
                                                    <button
                                                        onClick={() => handleAssignClick(u)}
                                                        className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all shadow-xl active:scale-90"
                                                        title="Course Allocation"
                                                    >
                                                        <BookOpen className="h-4 w-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleEditClick(u)}
                                                    className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all shadow-xl active:scale-90"
                                                    title="Refine Identity"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(u.userid)}
                                                    className="h-10 w-10 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-xl active:scale-90"
                                                    title="Terminate Credential"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Edit Modal Overlay */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100] flex items-center justify-center p-8 animate-fade-in">
                    <div className="glass-card p-0 w-full max-w-2xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border-none relative overflow-hidden animate-fade-in-up">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[var(--accent-primary)] to-blue-500 transform origin-left animate-in slide-in-from-left duration-1000" />
                        
                        <div className="p-12 pb-0 flex justify-between items-start z-10">
                            <div className="space-y-2">
                                <h3 className="text-4xl font-black text-[var(--text-primary)] tracking-tight italic">
                                    Identity <span className="text-[var(--accent-primary)]">Refinement</span>
                                </h3>
                                <div className="flex items-center gap-3">
                                    <div className="h-3 w-3 rounded-full bg-blue-500" />
                                    <p className="text-[var(--text-secondary)] font-medium text-lg italic opacity-80">Chỉnh sửa thông số nhận diện của đối tượng.</p>
                                </div>
                            </div>
                            <button 
                                onClick={handleCloseModal}
                                className="h-12 w-12 rounded-2xl bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-secondary)] hover:bg-rose-500 hover:text-white transition-all shadow-inner group"
                            >
                                <X className="h-6 w-6 group-hover:rotate-90 transition-transform" />
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit(onUpdateSubmit)} className="p-12 space-y-8 z-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] opacity-60 ml-1">Legal Full Name</label>
                                    <div className="relative group">
                                        <User className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] h-4 w-4 opacity-40 group-focus-within:opacity-100 group-focus-within:text-[var(--accent-primary)] transition-all" />
                                        <input
                                            {...register("fullname")}
                                            className={`w-full pl-14 pr-6 py-4 rounded-3xl border transition-all text-[var(--text-primary)] font-medium bg-white/5 focus:bg-white/10 outline-none ${
                                                editErrors.fullname ? 'border-rose-500 focus:ring-4 focus:ring-rose-500/10' : 'border-[var(--border-color)] focus:border-[var(--accent-primary)] focus:ring-4 focus:ring-[var(--accent-primary)]/10'
                                            }`}
                                        />
                                    </div>
                                    {editErrors.fullname && <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest mt-2 ml-4">{editErrors.fullname.message}</p>}
                                </div>

                                <div className="space-y-4">
                                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] opacity-60 ml-1">Credential Alias</label>
                                    <div className="relative group">
                                        <User className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] h-4 w-4 opacity-40 group-focus-within:opacity-100 group-focus-within:text-[var(--accent-primary)] transition-all" />
                                        <input
                                            {...register("username")}
                                            className={`w-full pl-14 pr-6 py-4 rounded-3xl border transition-all text-[var(--text-primary)] font-medium bg-white/5 focus:bg-white/10 outline-none ${
                                                editErrors.username ? 'border-rose-500 focus:ring-4 focus:ring-rose-500/10' : 'border-[var(--border-color)] focus:border-[var(--accent-primary)] focus:ring-4 focus:ring-[var(--accent-primary)]/10'
                                            }`}
                                        />
                                    </div>
                                    {editErrors.username && <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest mt-2 ml-4">{editErrors.username.message}</p>}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] opacity-60 ml-1">Digital Mail Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] h-4 w-4 opacity-40 group-focus-within:opacity-100 group-focus-within:text-[var(--accent-primary)] transition-all" />
                                    <input
                                        {...register("email")}
                                        className={`w-full pl-14 pr-6 py-4 rounded-3xl border transition-all text-[var(--text-primary)] font-medium bg-white/5 focus:bg-white/10 outline-none ${
                                            editErrors.email ? 'border-rose-500 focus:ring-4 focus:ring-rose-500/10' : 'border-[var(--border-color)] focus:border-[var(--accent-primary)] focus:ring-4 focus:ring-[var(--accent-primary)]/10'
                                        }`}
                                    />
                                </div>
                                {editErrors.email && <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest mt-2 ml-4">{editErrors.email.message}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] opacity-60 ml-1">Access Passphrase</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] h-4 w-4 opacity-40 group-focus-within:opacity-100 group-focus-within:text-[var(--accent-primary)] transition-all" />
                                        <input
                                            {...register("password")}
                                            type="password"
                                            placeholder="Phát sinh mật mã mới (tùy chọn)"
                                            className={`w-full pl-14 pr-6 py-4 rounded-3xl border transition-all text-[var(--text-primary)] font-medium bg-white/5 focus:bg-white/10 outline-none ${
                                                editErrors.password ? 'border-rose-500 focus:ring-4 focus:ring-rose-500/10' : 'border-[var(--border-color)] focus:border-[var(--accent-primary)] focus:ring-4 focus:ring-[var(--accent-primary)]/10'
                                            }`}
                                        />
                                    </div>
                                    {editErrors.password && <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest mt-2 ml-4">{editErrors.password.message}</p>}
                                </div>

                                <div className="space-y-4">
                                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] opacity-60 ml-1">Functional Designation</label>
                                    <div className="relative group">
                                        <Shield className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] h-4 w-4 opacity-40 group-focus-within:opacity-100 group-focus-within:text-[var(--accent-primary)] transition-all pointer-events-none" />
                                        <select
                                            {...register("role")}
                                            className={`w-full pl-14 pr-10 py-4 rounded-3xl border transition-all appearance-none text-[var(--text-primary)] font-bold bg-white/5 focus:bg-white/10 outline-none cursor-pointer ${
                                                editErrors.role ? 'border-rose-500 focus:ring-4 focus:ring-rose-500/10' : 'border-[var(--border-color)] focus:border-[var(--accent-primary)] focus:ring-4 focus:ring-[var(--accent-primary)]/10'
                                            }`}
                                        >
                                            <option value="student">Academic Personnel (Student)</option>
                                            <option value="instructor">Pedagogical Expert (Instructor)</option>
                                            <option value="admin">System Custodian (Admin)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-6 pt-6">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 py-5 rounded-2xl bg-[var(--bg-secondary)] text-[var(--text-primary)] text-[10px] font-black uppercase tracking-widest hover:bg-[var(--border-color)] transition-all active:scale-95 shadow-inner"
                                >
                                    Abandon
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUpdating}
                                    className="flex-[2] py-5 rounded-2xl bg-[var(--text-primary)] text-[var(--bg-primary)] text-[10px] font-black uppercase tracking-widest transition-all shadow-2xl active:scale-95 hover:opacity-95 flex items-center justify-center gap-3 group"
                                >
                                    {isUpdating ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <>
                                            <Shield className="h-4 w-4 group-hover:scale-110 transition-transform" />
                                            Synchronize Identity
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Assign Course Modal Overlay */}
            {isAssignModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100] flex items-center justify-center p-8 animate-fade-in">
                    <div className="glass-card p-0 w-full max-w-2xl max-h-[90vh] flex flex-col shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border-none relative overflow-hidden animate-fade-in-up">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 to-teal-500 transform origin-left animate-in slide-in-from-left duration-1000" />
                        
                        <div className="p-12 pb-0 flex justify-between items-start z-10">
                            <div className="space-y-2">
                                <h3 className="text-4xl font-black text-[var(--text-primary)] tracking-tight italic">
                                    Course <span className="text-emerald-500">Allocation</span>
                                </h3>
                                <div className="flex items-center gap-3">
                                    <div className="h-3 w-3 rounded-full bg-emerald-500" />
                                    <p className="text-[var(--text-secondary)] font-medium text-lg italic opacity-80">
                                        Ủy thác học thuật cho: <span className="text-[var(--text-primary)] font-black not-italic ml-2">{assigningUser?.fullname}</span>
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsAssignModalOpen(false)}
                                className="h-12 w-12 rounded-2xl bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-secondary)] hover:bg-rose-500 hover:text-white transition-all shadow-inner group"
                            >
                                <X className="h-6 w-6 group-hover:rotate-90 transition-transform" />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto my-12 mx-12 p-8 border border-[var(--border-color)]/30 rounded-[2.5rem] bg-white/5 backdrop-blur-md custom-scrollbar z-10">
                            {availableCourses.length === 0 ? (
                                <div className="text-center py-20 animate-fade-in">
                                    <BookOpen className="h-20 w-20 text-[var(--text-secondary)] opacity-10 mx-auto mb-6" />
                                    <p className="text-[var(--text-secondary)] font-black uppercase tracking-widest text-xs opacity-30 italic">No Academic Modules Available</p>
                                </div>
                            ) : (
                                <ul className="space-y-4">
                                    {availableCourses.map((course, idx) => (
                                        <li 
                                            key={course.courseid} 
                                            onClick={() => toggleCourseSelection(course.courseid)}
                                            className={`
                                                flex items-center gap-6 p-6 rounded-[2rem] cursor-pointer transition-all border animate-fade-in-up stagger-${(idx % 5) + 1}
                                                ${selectedCourseIds.includes(course.courseid) 
                                                    ? 'bg-[var(--accent-primary)]/10 border-[var(--accent-primary)]/30 shadow-[0_10px_30px_-10px_rgba(var(--accent-primary-rgb),0.2)]' 
                                                    : 'bg-transparent border-transparent hover:bg-white/5'}
                                            `}
                                        >
                                            <div className={`
                                                w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all duration-500
                                                ${selectedCourseIds.includes(course.courseid) 
                                                    ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)] text-white rotate-[360deg]' 
                                                    : 'bg-white/10 border-[var(--border-color)] opacity-40'}
                                            `}>
                                                {selectedCourseIds.includes(course.courseid) && (
                                                    <div className="w-2.5 h-2.5 bg-white rounded-full shadow-lg" />
                                                )}
                                            </div>
                                            <div className="space-y-1">
                                                <p className={`font-black text-lg tracking-tight transition-colors ${selectedCourseIds.includes(course.courseid) ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] opacity-60'}`}>
                                                    {course.title}
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] text-[var(--accent-primary)] font-black tracking-widest uppercase opacity-40">MODULE ID:</span>
                                                    <span className="text-[10px] text-[var(--text-secondary)] font-black tracking-widest opacity-60">{course.courseid}</span>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="p-12 pt-0 flex gap-6 z-10 bg-gradient-to-t from-[var(--bg-primary)] to-transparent">
                            <button
                                type="button"
                                onClick={() => setIsAssignModalOpen(false)}
                                className="flex-1 py-5 rounded-2xl bg-[var(--bg-secondary)] text-[var(--text-primary)] text-[10px] font-black uppercase tracking-widest hover:bg-[var(--border-color)] transition-all active:scale-95 shadow-inner"
                            >
                                Abandon
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveAssignments}
                                className="flex-[2] py-5 rounded-2xl bg-[var(--text-primary)] text-[var(--bg-primary)] text-[10px] font-black uppercase tracking-widest transition-all shadow-2xl active:scale-95 hover:opacity-95 flex items-center justify-center gap-3 group"
                            >
                                <BookOpen className="h-4 w-4 group-hover:translate-y-[-2px] transition-transform" />
                                Commemorate Allocation
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
