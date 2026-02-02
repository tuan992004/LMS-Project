import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/axios';
import { useAuthStore } from '../../stores/userAuthStore';
import { toast } from 'sonner';

export const UserManagement = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        fullname: '',
        username: '',
        email: '',
        role: 'student',
        password: ''
    });

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

    // Delete User
    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            await api.delete(`/users/${userId}`);
            toast.success("User deleted successfully");
            fetchUsers();
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete user");
        }
    };

    // Open Edit Modal
    const handleEditClick = (user) => {
        setEditingUser(user);
        setFormData({
            fullname: user.fullname,
            username: user.username,
            email: user.email,
            role: user.role,
            password: '' // Reset password field
        });
        setIsEditModalOpen(true);
    };

    // Close Edit Modal
    const handleCloseModal = () => {
        setIsEditModalOpen(false);
        setEditingUser(null);
    };

    // Update User
    const handleUpdateUser = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...formData };
            if (!payload.password) {
                delete payload.password; // Don't send empty password
            }

            await api.put(`/users/${editingUser.userid}`, payload);
            toast.success("User updated successfully");
            setIsEditModalOpen(false);
            fetchUsers();
        } catch (error) {
            console.error(error);
            toast.error("Failed to update user");
        }
    };

    return (
        <div style={{ padding: '3rem' }}>
            <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827' }}>
                    User Management
                </h2>
                <button
                    onClick={() => navigate('/adduser')}
                    style={{ backgroundColor: 'black', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
                >
                    + Add New User
                </button>
            </header>

            {/* Content Area */}
            <div style={{ backgroundColor: 'white', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', padding: '2rem', border: '1px solid #e5e7eb' }}>
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                                    <th style={{ padding: '1rem', fontSize: '0.875rem', color: '#6b7280', textTransform: 'uppercase' }}>Full Name</th>
                                    <th style={{ padding: '1rem', fontSize: '0.875rem', color: '#6b7280', textTransform: 'uppercase' }}>Username</th>
                                    <th style={{ padding: '1rem', fontSize: '0.875rem', color: '#6b7280', textTransform: 'uppercase' }}>Email</th>
                                    <th style={{ padding: '1rem', fontSize: '0.875rem', color: '#6b7280', textTransform: 'uppercase' }}>Role</th>
                                    <th style={{ padding: '1rem', fontSize: '0.875rem', color: '#6b7280', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <tr key={u.userid} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                        <td style={{ padding: '1rem', fontWeight: 500, color: '#111827' }}>{u.fullname}</td>
                                        <td style={{ padding: '1rem', color: '#4b5563' }}>{u.username}</td>
                                        <td style={{ padding: '1rem', color: '#4b5563' }}>{u.email}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '9999px',
                                                fontSize: '0.75rem',
                                                fontWeight: 'bold',
                                                backgroundColor: u.role === 'admin' ? '#f3f4f6' : '#e0e7ff',
                                                color: u.role === 'admin' ? '#1f2937' : '#3730a3'
                                            }}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                            <button
                                                onClick={() => handleEditClick(u)}
                                                style={{ padding: '0.5rem', color: '#2563eb', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(u.userid)}
                                                style={{ padding: '0.5rem', color: '#dc2626', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}
                                            >
                                                Delete
                                            </button>
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
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', width: '100%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Edit User</h3>
                        <form onSubmit={handleUpdateUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Full Name</label>
                                <input
                                    type="text"
                                    value={formData.fullname}
                                    onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db' }}
                                    required
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Username</label>
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db' }}
                                    required
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db' }}
                                    required
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Password (Leave blank to keep current)</label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db' }}
                                    placeholder="New Password"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Role</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db' }}
                                >
                                    <option value="student">Student</option>
                                    <option value="instructor">Instructor</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: '#f3f4f6', color: '#1f2937', fontWeight: 600, border: 'none', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: 'black', color: 'white', fontWeight: 600, border: 'none', cursor: 'pointer' }}
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
