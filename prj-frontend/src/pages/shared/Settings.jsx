import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/userAuthStore';
import { api } from '../../lib/axios';
import { toast } from 'sonner';

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

    const inputStyle = { padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #d1d5db', color: '#111827', backgroundColor: 'white', outline: 'none', width: '100%' };
    const labelStyle = { fontSize: '0.875rem', fontWeight: 'bold', color: '#374151', display: 'block', marginBottom: '0.2rem' };
    const descStyle = { fontSize: '0.8rem', color: '#6b7280', marginTop: '0.2rem', marginBottom: '0.5rem' };

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827' }}>Account Settings</h2>
                <p style={{ color: '#4b5563', marginTop: '0.5rem' }}>View and update your personal details and account preferences here.</p>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '2rem', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    
                    {/* Read-only Username Field */}
                    <div>
                        <label style={labelStyle}>Username</label>
                        <p style={descStyle}>Your unique system username used during login. Cannot be modified.</p>
                        <input
                            type="text"
                            value={user?.username || ''}
                            disabled
                            style={{ ...inputStyle, backgroundColor: '#f3f4f6', color: '#9ca3af', cursor: 'not-allowed' }}
                        />
                    </div>

                    <div>
                        <label style={labelStyle}>Full Name <span style={{color: '#ef4444'}}>*</span></label>
                        <p style={descStyle}>Please enter your full, real name so peers and administrators can identify you.</p>
                        <input
                            name="fullname"
                            value={form.fullname}
                            onChange={handleChange}
                            required
                            style={inputStyle}
                        />
                    </div>

                    <div>
                        <label style={labelStyle}>Email Address <span style={{color: '#ef4444'}}>*</span></label>
                        <p style={descStyle}>We will use this email for important platform notifications and account recovery.</p>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            style={inputStyle}
                        />
                    </div>

                    <div style={{ margin: '1rem 0', borderTop: '1px solid #e5e7eb', paddingTop: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.25rem' }}>Security & Authentication</h3>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1.5rem' }}>
                            Update your password regularly to keep your account secure. <strong>If you do not want to change your password, simply leave these fields blank.</strong>
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <label style={labelStyle}>New Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="Enter a new password"
                                    style={inputStyle}
                                />
                            </div>

                            <div>
                                <label style={labelStyle}>Confirm New Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={form.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Re-enter your new password"
                                    style={inputStyle}
                                />
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem', borderTop: '1px solid #e5e7eb', paddingTop: '1.5rem' }}>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                backgroundColor: loading ? '#9ca3af' : 'black',
                                color: 'white',
                                padding: '0.75rem 2rem',
                                borderRadius: '0.5rem',
                                fontWeight: 'bold',
                                border: 'none',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'background-color 0.2s',
                                fontSize: '1rem'
                            }}
                        >
                            {loading ? 'Saving Changes...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
