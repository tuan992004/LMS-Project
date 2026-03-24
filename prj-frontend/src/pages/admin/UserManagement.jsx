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
        const targetUser = users.find(u => u.userid === userId);
        
        // Optimistically remove from UI
        setUsers(prev => prev.filter(u => u.userid !== userId));

        const timer = setTimeout(async () => {
            try {
                await api.delete(`/users/${userId}`);
            } catch (error) {
                console.error(error);
                toast.error("Lỗi xóa người dùng");
                fetchUsers(); // Restore if failed
            }
        }, 5000);

        toast.success("Tài khoản đã được đưa vào thùng rác", {
            duration: 5000,
            action: {
                label: 'Hoàn tác (Undo)',
                onClick: () => {
                    clearTimeout(timer);
                    fetchUsers(); // Instantly restore
                    toast.success("Đã hoàn tác xóa tài khoản!");
                }
            }
        });
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
                                            {u.role === 'student' && (
                                                <button
                                                    onClick={() => handleAssignClick(u)}
                                                    style={{ padding: '0.5rem', color: '#059669', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}
                                                >
                                                    Assign Courses
                                                </button>
                                            )}
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
                    backgroundColor: 'rgba(17, 24, 39, 0.6)', zIndex: 100,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)'
                }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '1.5rem', padding: '3rem', width: '100%', maxWidth: '500px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                        <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
                            <h3 style={{ fontSize: '2rem', fontWeight: '800', color: '#111827', marginBottom: '0.5rem', letterSpacing: '-0.025em' }}>Edit User</h3>
                            <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>Update the details for this system user.</p>
                        </div>
                        <form onSubmit={handleUpdateUser} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: '#374151' }}>Full Name</label>
                                <input
                                    type="text"
                                    value={formData.fullname}
                                    onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                                    style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '0.75rem', border: '1px solid #d1d5db', outline: 'none', fontSize: '0.95rem', backgroundColor: '#f9fafb', color: '#111827', transition: 'border-color 0.2s' }}
                                    required
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: '#374151' }}>Username</label>
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '0.75rem', border: '1px solid #d1d5db', outline: 'none', fontSize: '0.95rem', backgroundColor: '#f9fafb', color: '#111827', transition: 'border-color 0.2s' }}
                                    required
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: '#374151' }}>Email Address</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '0.75rem', border: '1px solid #d1d5db', outline: 'none', fontSize: '0.95rem', backgroundColor: '#f9fafb', color: '#111827', transition: 'border-color 0.2s' }}
                                    required
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: '#374151' }}>Password <span style={{fontWeight: 400, color: '#9ca3af'}}>(Leave blank to keep current)</span></label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '0.75rem', border: '1px solid #d1d5db', outline: 'none', fontSize: '0.95rem', backgroundColor: '#f9fafb', color: '#111827', transition: 'border-color 0.2s' }}
                                    placeholder="••••••••"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: '#374151' }}>Role</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '0.75rem', border: '1px solid #d1d5db', outline: 'none', fontSize: '0.95rem', backgroundColor: '#f9fafb', color: '#111827', transition: 'border-color 0.2s' }}
                                >
                                    <option value="student">Student</option>
                                    <option value="instructor">Instructor</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    style={{ flex: 1, padding: '0.875rem', borderRadius: '0.75rem', backgroundColor: '#f3f4f6', color: '#374151', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.95rem' }}
                                    onMouseOver={(e) => e.target.style.backgroundColor = '#e5e7eb'}
                                    onMouseOut={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{ flex: 1, padding: '0.875rem', borderRadius: '0.75rem', backgroundColor: '#111827', color: 'white', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.95rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    onMouseOver={(e) => e.target.style.backgroundColor = '#000000'}
                                    onMouseOut={(e) => e.target.style.backgroundColor = '#111827'}
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Assign Course Modal Overlay */}
            {isAssignModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(17, 24, 39, 0.6)', zIndex: 100,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)'
                }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '1.5rem', padding: '3rem', width: '100%', maxWidth: '500px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                            <h3 style={{ fontSize: '2rem', fontWeight: '800', color: '#111827', marginBottom: '0.5rem', letterSpacing: '-0.025em' }}>Assign Courses</h3>
                            <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>Select courses for student: <span style={{ fontWeight: '700', color: '#111827' }}>{assigningUser?.fullname}</span></p>
                        </div>
                        
                        <div style={{ flex: 1, overflowY: 'auto', marginBottom: '2rem', border: '1px solid #e5e7eb', borderRadius: '0.75rem', padding: '1.25rem', backgroundColor: '#f9fafb' }}>
                            {availableCourses.length === 0 ? (
                                <p style={{ color: '#6b7280', fontSize: '0.95rem', textAlign: 'center', margin: '2rem 0' }}>No available courses found.</p>
                            ) : (
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {availableCourses.map(course => (
                                        <li key={course.courseid} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem', borderRadius: '0.5rem', transition: 'background-color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'white'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                            <input
                                                type="checkbox"
                                                id={`course-${course.courseid}`}
                                                checked={selectedCourseIds.includes(course.courseid)}
                                                onChange={() => toggleCourseSelection(course.courseid)}
                                                style={{ width: '1.25rem', height: '1.25rem', cursor: 'pointer', accentColor: '#111827' }}
                                            />
                                            <label htmlFor={`course-${course.courseid}`} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', flex: 1 }}>
                                                <span style={{ fontWeight: 600, fontSize: '0.95rem', color: '#111827' }}>{course.title}</span>
                                                <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>ID: {course.courseid}</span>
                                            </label>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                type="button"
                                onClick={() => setIsAssignModalOpen(false)}
                                style={{ flex: 1, padding: '0.875rem', borderRadius: '0.75rem', backgroundColor: '#f3f4f6', color: '#374151', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.95rem' }}
                                onMouseOver={(e) => e.target.style.backgroundColor = '#e5e7eb'}
                                onMouseOut={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveAssignments}
                                style={{ flex: 1, padding: '0.875rem', borderRadius: '0.75rem', backgroundColor: '#111827', color: 'white', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.95rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                onMouseOver={(e) => e.target.style.backgroundColor = '#000000'}
                                onMouseOut={(e) => e.target.style.backgroundColor = '#111827'}
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
