import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/axios';
import { useAuthStore } from '../../stores/userAuthStore';
import { toast } from 'sonner';
import { Plus, Loader2, BookOpen, CheckCircle, Trash2, Settings2 } from 'lucide-react';

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
        const previousCourses = [...courses];
        setCourses(prev => prev.filter(c => c.courseid !== courseId));

        const timer = setTimeout(async () => {
            try {
                await api.delete(`/courses/${courseId}`);
            } catch (error) {
                toast.error("Lỗi xóa khóa học");
                setCourses(previousCourses);
            }
        }, 5000);

        toast.success("Khóa học đã được đưa vào thùng rác", {
            duration: 5000,
            action: {
                label: 'Hoàn tác (Undo)',
                onClick: () => {
                    clearTimeout(timer);
                    setCourses(previousCourses);
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
        <div className="p-8 max-w-7xl mx-auto min-h-screen">
            <header className="mb-10 flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">
                        Course Management
                    </h2>
                    <p className="text-[var(--text-secondary)] mt-1 font-medium">Review and manage learning materials.</p>
                </div>
                
                <button
                    onClick={() => navigate(user?.role === 'admin' ? '/admin/addcourse' : '/instructor/addcourse')}
                    className="flex items-center gap-2 bg-[var(--text-primary)] text-[var(--bg-primary)] px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-all shadow-lg active:scale-95"
                >
                    <Plus className="h-5 w-5" />
                    Add New Course
                </button>
            </header>

            <div className="insta-card overflow-hidden">
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-20">
                        <Loader2 className="h-10 w-10 animate-spin text-[var(--text-secondary)] mb-4" />
                        <p className="text-[var(--text-secondary)] font-medium">Loading system courses...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-[var(--border-color)] bg-white/30 backdrop-blur-sm">
                                    <th className="px-6 py-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Course ID</th>
                                    <th className="px-6 py-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Title</th>
                                    <th className="px-6 py-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Instructor ID</th>
                                    <th className="px-6 py-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border-color)]">
                                {courses.map((c) => (
                                    <tr key={c.courseid} className="hover:bg-white/40 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)] font-mono">{c.courseid}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-primary)] font-bold">
                                                    <BookOpen className="h-4 w-4" />
                                                </div>
                                                <span className="font-bold text-[var(--text-primary)]">{c.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`
                                                px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase
                                                ${c.status === 'approved' 
                                                    ? 'bg-emerald-500/10 text-emerald-500' 
                                                    : 'bg-amber-500/10 text-amber-500'}
                                            `}>
                                                {c.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">{c.instructor_id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => navigate(user?.role === 'admin' ? `/admin/lessons/${c.courseid}` : `/instructor/lessons/${c.courseid}`)}
                                                    className="p-2 text-indigo-500 hover:bg-indigo-500/10 rounded-lg transition-colors flex items-center gap-1 text-sm font-bold"
                                                    title="Manage Lessons"
                                                >
                                                    <Settings2 className="h-4 w-4" />
                                                    <span className="hidden sm:inline">Lessons</span>
                                                </button>

                                                {user?.role === 'admin' && (
                                                    <>
                                                        {c.status === 'pending' && (
                                                            <button
                                                                onClick={() => handleApprove(c.courseid)}
                                                                className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors flex items-center gap-1 text-sm font-bold"
                                                            >
                                                                <CheckCircle className="h-4 w-4" />
                                                                <span className="hidden sm:inline">Approve</span>
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleDeleteCourse(c.courseid)}
                                                            className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-1 text-sm font-bold"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                            <span className="hidden sm:inline">Delete</span>
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
