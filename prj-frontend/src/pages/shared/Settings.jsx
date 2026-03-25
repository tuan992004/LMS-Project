import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/userAuthStore';
import { api } from '../../lib/axios';
import { toast } from 'sonner';
import { User, Mail, Lock, Shield, Loader2, Save } from 'lucide-react';

export const Settings = () => {
    const { user, refresh } = useAuthStore((state) => state);
    const [loading, setLoading] = useState(false);

    // User cannot edit their username or role.
    const [form, setForm] = useState({
        fullname: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    // Populate initial form data
    useEffect(() => {
        if (user) {
            setForm(prev => ({
                ...prev,
                fullname: user.fullname || '',
                email: user.email || ''
            }));
        }
    }, [user]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (form.password && form.password !== form.confirmPassword) {
            toast.error("Mật khẩu không khớp!");
            return;
        }

        setLoading(true);
        try {
            const dataToUpdate = {
                fullname: form.fullname,
                email: form.email,
            };
            if (form.password) {
                dataToUpdate.password = form.password;
            }

            await api.put('/users/profile/edit', dataToUpdate);
            toast.success("Cập nhật hồ sơ thành công!");

            await refresh();

            setForm(prev => ({ ...prev, password: '', confirmPassword: '' }));
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Lỗi cập nhật hồ sơ!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto min-h-screen">
            <header className="mb-12">
                <h2 className="text-4xl font-black text-[var(--text-primary)] tracking-tight mb-2">Account Settings</h2>
                <p className="text-[var(--text-secondary)] font-medium">View and update your personal details and account preferences here.</p>
            </header>

            <div className="glass-card p-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent-primary)] opacity-[0.03] rounded-full -mr-32 -mt-32"></div>
                
                <form onSubmit={handleSubmit} className="flex flex-col gap-10 relative z-10">
                    
                    {/* Basic Info Section */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-3 border-b border-[var(--border-color)] pb-4">
                            <User className="h-5 w-5 text-[var(--accent-primary)]" />
                            <h3 className="text-xl font-bold text-[var(--text-primary)]">Personal Information</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Read-only Username Field */}
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest mb-2 text-[var(--text-secondary)]">Username</label>
                                <div className="relative group">
                                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] h-5 w-5 opacity-40" />
                                    <input
                                        type="text"
                                        value={user?.username || ''}
                                        disabled
                                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] font-mono text-sm cursor-not-allowed opacity-60"
                                    />
                                    <div className="absolute inset-0 rounded-2xl bg-black/5 pointer-events-none"></div>
                                </div>
                                <p className="text-[10px] text-[var(--text-secondary)] mt-2 font-medium italic">Unique system identifier (read-only)</p>
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest mb-2 text-[var(--text-secondary)]">Full Name <span className="text-rose-500">*</span></label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] h-5 w-5" />
                                    <input
                                        name="fullname"
                                        value={form.fullname}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-[var(--border-color)] bg-white/40 focus:bg-white/60 focus:ring-2 focus:ring-[var(--accent-primary)] outline-none transition-all text-[var(--text-primary)] font-medium"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest mb-2 text-[var(--text-secondary)]">Email Address <span className="text-rose-500">*</span></label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] h-5 w-5" />
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-[var(--border-color)] bg-white/40 focus:bg-white/60 focus:ring-2 focus:ring-[var(--accent-primary)] outline-none transition-all text-[var(--text-primary)] font-medium"
                                />
                            </div>
                            <p className="text-[10px] text-[var(--text-secondary)] mt-2 font-medium">Used for notifications and account recovery.</p>
                        </div>
                    </div>

                    {/* Security Section */}
                    <div className="space-y-8 pt-6">
                        <div className="flex items-center gap-3 border-b border-[var(--border-color)] pb-4">
                            <Lock className="h-5 w-5 text-[var(--accent-primary)]" />
                            <h3 className="text-xl font-bold text-[var(--text-primary)]">Security & Authentication</h3>
                        </div>

                        <div className="bg-white/20 p-6 rounded-[2rem] border border-white/30 backdrop-blur-sm">
                            <p className="text-sm text-[var(--text-secondary)] font-medium mb-6">
                                Update your password regularly to keep your account secure. <strong>Leave blank to keep current password.</strong>
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest mb-2 text-[var(--text-secondary)]">New Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] h-5 w-5" />
                                        <input
                                            type="password"
                                            name="password"
                                            value={form.password}
                                            onChange={handleChange}
                                            placeholder="••••••••"
                                            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-[var(--border-color)] bg-white/40 focus:bg-white/60 focus:ring-2 focus:ring-[var(--accent-primary)] outline-none transition-all text-[var(--text-primary)] font-medium"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest mb-2 text-[var(--text-secondary)]">Confirm Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] h-5 w-5" />
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={form.confirmPassword}
                                            onChange={handleChange}
                                            placeholder="••••••••"
                                            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-[var(--border-color)] bg-white/40 focus:bg-white/60 focus:ring-2 focus:ring-[var(--accent-primary)] outline-none transition-all text-[var(--text-primary)] font-medium"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Footer */}
                    <div className="flex justify-end pt-8 border-t border-[var(--border-color)]">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`
                                flex items-center gap-2 px-10 py-4 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all shadow-2xl active:scale-95
                                ${loading 
                                    ? 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] cursor-not-allowed' 
                                    : 'bg-[var(--text-primary)] text-[var(--bg-primary)] hover:opacity-90'}
                            `}
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <Save className="h-5 w-5" />
                            )}
                            {loading ? 'Saving Changes...' : 'Save Profile'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
