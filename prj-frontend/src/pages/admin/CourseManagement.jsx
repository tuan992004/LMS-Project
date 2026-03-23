import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/axios';
import { useAuthStore } from '../../stores/userAuthStore';
import { toast } from 'sonner';

export const CourseManagement = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch Courses
    const fetchCourses = async () => {
        try {
            const res = await api.get("/courses");
            setCourses(res.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch courses");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    // Delete Course (Optimistic with Undo)
    const handleDeleteCourse = (courseId) => {
        const targetCourse = courses.find(c => c.courseid === courseId);
        
        // Optimistically remove from UI
        setCourses(prev => prev.filter(c => c.courseid !== courseId));

        const timer = setTimeout(async () => {
            try {
                await api.delete(`/courses/${courseId}`);
            } catch (error) {
                toast.error("Lỗi xóa khóa học");
                fetchCourses(); // Restore if failed
            }
        }, 5000);

        toast.success("Khóa học đã được đưa vào thùng rác", {
            duration: 5000,
            action: {
                label: 'Hoàn tác (Undo)',
                onClick: () => {
                    clearTimeout(timer);
                    fetchCourses(); // Restore UI
                    toast.success("Đã hoàn tác xóa khóa học!");
                }
            }
        });
    };

    // Approve Course (Only Admin)
    const handleApprove = async (courseId) => {
        try {
            await api.patch(`/courses/approve/${courseId}`, { status: 'approved' });
            toast.success("Course approved!");
            fetchCourses();
        } catch (error) {
            toast.error("Failed to approve course");
        }
    };

    return (
        <div style={{ padding: '3rem' }}>
            <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827' }}>
                    Course Management
                </h2>
                
                {/* Nút Add New Course chung cho cả Admin và Instructor */}
                <button
                    onClick={() => navigate(user?.role === 'admin' ? '/admin/addcourse' : '/instructor/addcourse')}
                    style={{ backgroundColor: 'black', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
                >
                    + Add New Course
                </button>
            </header>

            <div style={{ backgroundColor: 'white', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', padding: '2rem', border: '1px solid #e5e7eb' }}>
                {loading ? (
                    <p>Loading courses...</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                                    <th style={tableHeadStyle}>Course ID</th>
                                    <th style={tableHeadStyle}>Title</th>
                                    <th style={tableHeadStyle}>Status</th>
                                    <th style={tableHeadStyle}>Instructor ID</th>
                                    <th style={{ ...tableHeadStyle, textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {courses.map((c) => (
                                    <tr key={c.courseid} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                        <td style={tableCellStyle}>{c.courseid}</td>
                                        <td style={{ ...tableCellStyle, fontWeight: 500, color: '#111827' }}>{c.title}</td>
                                        <td style={tableCellStyle}>
                                            <span style={{
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '9999px',
                                                fontSize: '0.75rem',
                                                fontWeight: 'bold',
                                                backgroundColor: c.status === 'approved' ? '#dcfce7' : '#fef9c3',
                                                color: c.status === 'approved' ? '#166534' : '#854d0e'
                                            }}>
                                                {c.status}
                                            </span>
                                        </td>
                                        <td style={tableCellStyle}>{c.instructor_id}</td>
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                                
                                                {/* Button chung cho cả Admin và Instructor */}
                                                <button
                                                    onClick={() => navigate(user?.role === 'admin' ? `/admin/lessons/${c.courseid}` : `/instructor/lessons/${c.courseid}`)}
                                                    style={{ color: '#2563eb', ...actionBtnStyle }}
                                                >
                                                    Manage Lessons
                                                </button>

                                                {/* Admin Only Actions */}
                                                {user?.role === 'admin' && (
                                                    <>
                                                        {c.status === 'pending' && (
                                                            <button
                                                                onClick={() => handleApprove(c.courseid)}
                                                                style={{ color: '#059669', ...actionBtnStyle }}
                                                            >
                                                                Approve
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleDeleteCourse(c.courseid)}
                                                            style={{ color: '#dc2626', ...actionBtnStyle }}
                                                        >
                                                            Delete
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
                )}
            </div>
        </div>
    );
};

// Reusable Styles
const tableHeadStyle = { padding: '1rem', fontSize: '0.875rem', color: '#6b7280', textTransform: 'uppercase' };
const tableCellStyle = { padding: '1rem', color: '#4b5563', fontSize: '0.875rem' };
const actionBtnStyle = { background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' };