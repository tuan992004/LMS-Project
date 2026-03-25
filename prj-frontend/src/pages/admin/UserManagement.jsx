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
        <div className="p-8 max-w-7xl mx-auto min-h-screen">
            <header className="mb-10 flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
                        User Management
                    </h2>
                    <p className="text-[var(--text-secondary)] mt-1">Manage and monitor all system accounts.</p>
                </div>
                <button
                    onClick={() => navigate('/adduser')}
                    className="flex items-center gap-2 bg-[var(--text-primary)] text-[var(--bg-primary)] px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-all shadow-lg active:scale-95"
                >
                    <UserPlus className="h-5 w-5" />
                    Add New User
                </button>
            </header>

            {/* Content Area */}
            <div className="insta-card overflow-hidden">
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-20">
                        <Loader2 className="h-10 w-10 animate-spin text-[var(--text-secondary)] mb-4" />
                        <p className="text-[var(--text-secondary)] font-medium">Loading system users...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-[var(--border-color)] bg-white/30 backdrop-blur-sm">
                                    <th className="px-6 py-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Full Name</th>
                                    <th className="px-6 py-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Username</th>
                                    <th className="px-6 py-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Email Address</th>
                                    <th className="px-6 py-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border-color)]">
                                {users.map((u) => (
                                    <tr key={u.userid} className="hover:bg-white/40 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-primary)] font-bold text-sm">
                                                    {u.fullname.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-semibold text-[var(--text-primary)]">{u.fullname}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-[var(--text-secondary)] font-medium">{u.username}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-[var(--text-secondary)]">{u.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`
                                                px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase
                                                ${u.role === 'admin' ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]' : 
                                                  u.role === 'instructor' ? 'bg-indigo-500/10 text-indigo-500' : 
                                                  'bg-white/40 text-[var(--text-secondary)]'}
                                            `}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {u.role === 'student' && (
                                                    <button
                                                        onClick={() => handleAssignClick(u)}
                                                        className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors flex items-center gap-1 text-sm font-bold"
                                                        title="Assign Courses"
                                                    >
                                                        <BookOpen className="h-4 w-4" />
                                                        <span className="hidden sm:inline">Courses</span>
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleEditClick(u)}
                                                    className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors flex items-center gap-1 text-sm font-bold"
                                                    title="Edit User"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                    <span className="hidden sm:inline">Edit</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(u.userid)}
                                                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-1 text-sm font-bold"
                                                    title="Delete User"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    <span className="hidden sm:inline">Delete</span>
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
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="glass-card p-8 md:p-12 w-full max-w-[550px] shadow-2xl relative overflow-hidden">
                        <button 
                            onClick={handleCloseModal}
                            className="absolute right-8 top-8 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                        >
                            <X className="h-6 w-6" />
                        </button>

                        <div className="mb-10">
                            <h3 className="text-3xl font-extrabold text-[var(--text-primary)] mb-2 tracking-tight">Edit Profile</h3>
                            <p className="text-[var(--text-secondary)]">Update account settings and permissions.</p>
                        </div>

                        <form onSubmit={handleEditSubmit(onUpdateSubmit)} className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold mb-2 text-[var(--text-secondary)]">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] h-5 w-5" />
                                    <input
                                        {...register("fullname")}
                                        className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border transition-all text-[var(--text-primary)] bg-white/40 focus:bg-white/60 ${
                                            editErrors.fullname ? 'border-red-500 bg-red-50/10' : 'border-[var(--border-color)] focus:border-[var(--accent-primary)]'
                                        }`}
                                    />
                                </div>
                                {editErrors.fullname && <p className="text-red-500 text-xs mt-2 font-medium">{editErrors.fullname.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-2 text-[var(--text-secondary)]">Username</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] h-5 w-5" />
                                    <input
                                        {...register("username")}
                                        className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border transition-all text-[var(--text-primary)] bg-white/40 focus:bg-white/60 ${
                                            editErrors.username ? 'border-red-500 bg-red-50/10' : 'border-[var(--border-color)] focus:border-[var(--accent-primary)]'
                                        }`}
                                    />
                                </div>
                                {editErrors.username && <p className="text-red-500 text-xs mt-2 font-medium">{editErrors.username.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-2 text-[var(--text-secondary)]">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] h-5 w-5" />
                                    <input
                                        {...register("email")}
                                        className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border transition-all text-[var(--text-primary)] bg-white/40 focus:bg-white/60 ${
                                            editErrors.email ? 'border-red-500 bg-red-50/10' : 'border-[var(--border-color)] focus:border-[var(--accent-primary)]'
                                        }`}
                                    />
                                </div>
                                {editErrors.email && <p className="text-red-500 text-xs mt-2 font-medium">{editErrors.email.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-2 text-[var(--text-secondary)]">
                                    Password <span className="text-[var(--text-secondary)] font-normal ml-1">(Optional)</span>
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] h-5 w-5" />
                                    <input
                                        {...register("password")}
                                        type="password"
                                        placeholder="Leave blank to keep current"
                                        className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border transition-all text-[var(--text-primary)] bg-white/40 focus:bg-white/60 ${
                                            editErrors.password ? 'border-red-500 bg-red-50/10' : 'border-[var(--border-color)] focus:border-[var(--accent-primary)]'
                                        }`}
                                    />
                                </div>
                                {editErrors.password && <p className="text-red-500 text-xs mt-2 font-medium">{editErrors.password.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-2 text-[var(--text-secondary)]">Account Role</label>
                                <div className="relative">
                                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] h-5 w-5" />
                                    <select
                                        {...register("role")}
                                        className={`w-full pl-12 pr-10 py-3.5 rounded-2xl border transition-all appearance-none text-[var(--text-primary)] bg-white/40 focus:bg-white/60 ${
                                            editErrors.role ? 'border-red-500 bg-red-50/10' : 'border-[var(--border-color)] focus:border-[var(--accent-primary)]'
                                        }`}
                                    >
                                        <option value="student">Student</option>
                                        <option value="instructor">Instructor</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-6">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 py-4 rounded-2xl bg-[var(--bg-secondary)] text-[var(--text-primary)] font-bold hover:opacity-80 transition-all active:scale-95"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUpdating}
                                    className="flex-1 py-4 rounded-2xl bg-[var(--text-primary)] text-[var(--bg-primary)] font-bold hover:opacity-90 disabled:opacity-50 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2"
                                >
                                    {isUpdating ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        "Save Changes"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Assign Course Modal Overlay */}
            {isAssignModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="glass-card p-8 md:p-12 w-full max-w-[550px] max-h-[90vh] flex flex-col shadow-2xl relative">
                        <button 
                            onClick={() => setIsAssignModalOpen(false)}
                            className="absolute right-8 top-8 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                        >
                            <X className="h-6 w-6" />
                        </button>

                        <div className="mb-8">
                            <h3 className="text-3xl font-extrabold text-[var(--text-primary)] mb-2 tracking-tight">Assign Courses</h3>
                            <p className="text-[var(--text-secondary)]">
                                Select courses for <span className="font-bold text-[var(--text-primary)]">{assigningUser?.fullname}</span>
                            </p>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto mb-8 border border-[var(--border-color)] rounded-2xl p-6 bg-white/20">
                            {availableCourses.length === 0 ? (
                                <div className="text-center py-10">
                                    <BookOpen className="h-12 w-12 text-[var(--text-secondary)] opacity-20 mx-auto mb-3" />
                                    <p className="text-[var(--text-secondary)] font-medium">No courses available.</p>
                                </div>
                            ) : (
                                <ul className="space-y-3">
                                    {availableCourses.map(course => (
                                        <li 
                                            key={course.courseid} 
                                            onClick={() => toggleCourseSelection(course.courseid)}
                                            className={`
                                                flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all border
                                                ${selectedCourseIds.includes(course.courseid) 
                                                    ? 'bg-white/40 border-[var(--text-primary)] shadow-sm' 
                                                    : 'bg-transparent border-transparent hover:bg-white/30'}
                                            `}
                                        >
                                            <div className={`
                                                w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all
                                                ${selectedCourseIds.includes(course.courseid) 
                                                    ? 'bg-[var(--text-primary)] border-[var(--text-primary)] text-[var(--bg-primary)]' 
                                                    : 'bg-white/50 border-[var(--border-color)]'}
                                            `}>
                                                {selectedCourseIds.includes(course.courseid) && (
                                                    <div className="w-2 h-2 bg-[var(--bg-primary)] rounded-full" />
                                                )}
                                            </div>
                                            <div>
                                                <p className={`font-bold transition-colors ${selectedCourseIds.includes(course.courseid) ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                                                    {course.title}
                                                </p>
                                                <p className="text-xs text-[var(--text-secondary)] opacity-60 uppercase tracking-widest font-bold">ID: {course.courseid}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => setIsAssignModalOpen(false)}
                                className="flex-1 py-4 rounded-2xl bg-[var(--bg-secondary)] text-[var(--text-primary)] font-bold hover:opacity-80 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveAssignments}
                                className="flex-1 py-4 rounded-2xl bg-[var(--text-primary)] text-[var(--bg-primary)] font-bold hover:opacity-90 transition-all shadow-xl active:scale-95"
                            >
                                Save Assignments
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
