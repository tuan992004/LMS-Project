import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../lib/axios';
import { useAuthStore } from '../../stores/userAuthStore';
import { toast } from 'sonner';
import { Home, Plus, Loader2, BookOpen, CheckCircle, Trash2, Settings2, Users, X, Search, UserPlus, UserMinus, Mail, Fingerprint, ExternalLink } from 'lucide-react';
import { DataCard } from "../../components/shared/DataCard";
import MobileListItem from "../../components/shared/MobileListItem";
import { useTranslation } from '../../hooks/useTranslation';
import StudentDossierModal from '../../components/shared/StudentDossierModal';

export const CourseManagement = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { t } = useTranslation();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedCourseId, setExpandedCourseId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    // --- US-18: Student Management Modal State ---
    const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [enrolledStudents, setEnrolledStudents] = useState([]);
    const [studentsLoading, setStudentsLoading] = useState(false);
    const [studentSearch, setStudentSearch] = useState('');
    const [allStudents, setAllStudents] = useState([]);
    const [allStudentsLoading, setAllStudentsLoading] = useState(false);
    const [addStudentSearch, setAddStudentSearch] = useState('');
    const [enrollingId, setEnrollingId] = useState(null);
    const [removingId, setRemovingId] = useState(null);

    // --- US-18: Student Dossier State ---
    const [isDossierOpen, setIsDossierOpen] = useState(false);
    const [selectedDossierStudentId, setSelectedDossierStudentId] = useState(null);

    const handleViewDossier = (id) => {
        setSelectedDossierStudentId(id);
        setIsDossierOpen(true);
    };

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

    // --- US-18: Open the student management modal for a course ---
    const handleManageStudents = async (course) => {
        setSelectedCourse(course);
        setStudentSearch('');
        setAddStudentSearch('');
        setIsStudentModalOpen(true);
        setStudentsLoading(true);
        setAllStudentsLoading(true);

        try {
            const [studentsRes, allRes] = await Promise.all([
                api.get(`/enrollments/course/${course.courseid}/students`),
                api.get('/users/students')
            ]);
            setEnrolledStudents(studentsRes.data);
            // Endpoint already returns only students
            setAllStudents(allRes.data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load student data');
        } finally {
            setStudentsLoading(false);
            setAllStudentsLoading(false);
        }
    };

    // --- US-18: Enroll a student ---
    const handleEnrollStudent = async (student) => {
        setEnrollingId(student.userid);
        try {
            const res = await api.post(`/enrollments/course/${selectedCourse.courseid}/enroll`, { studentId: student.userid });
            const newRecord = { 
                ...student, 
                enrolled_at: new Date().toISOString(),
                status: res.data.status // Use status from server (e.g., 'pending')
            };
            setEnrolledStudents(prev => [...prev, newRecord]);
            toast.success(res.data.message || `${student.fullname} enrolled successfully`);
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to enroll student');
        } finally {
            setEnrollingId(null);
        }
    };

    // --- US-18: Unenroll a student ---
    const handleUnenrollStudent = async (studentId, fullname) => {
        setRemovingId(studentId);
        try {
            await api.delete(`/enrollments/course/${selectedCourse.courseid}/student/${studentId}`);
            setEnrolledStudents(prev => prev.filter(s => s.userid !== studentId));
            toast.success(`${fullname} removed from course`);
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to remove student');
        } finally {
            setRemovingId(null);
        }
    };

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

    // Filtered lists for the student modal
    const filteredEnrolled = enrolledStudents.filter(s =>
        s.fullname?.toLowerCase().includes(studentSearch.toLowerCase()) ||
        s.email?.toLowerCase().includes(studentSearch.toLowerCase()) ||
        s.username?.toLowerCase().includes(studentSearch.toLowerCase())
    );
    const enrolledIds = new Set(enrolledStudents.map(s => s.userid));
    const filteredAvailable = allStudents.filter(s =>
        !enrolledIds.has(s.userid) && (
            s.fullname?.toLowerCase().includes(addStudentSearch.toLowerCase()) ||
            s.email?.toLowerCase().includes(addStudentSearch.toLowerCase()) ||
            s.username?.toLowerCase().includes(addStudentSearch.toLowerCase())
        )
    );

    const filteredCourses = courses.filter(c => {
        const s = searchTerm.toLowerCase();
        return (
            c.title.toLowerCase().includes(s) || 
            String(c.courseid).toLowerCase().includes(s) || 
            String(c.instructor_id).toLowerCase().includes(s)
        );
    });

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen animate-fade-in-up pb-32">
            {/* Minimal Header Action Bar */}
            <header className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
                <div className="flex flex-1 items-center gap-4 w-full md:w-auto">
                    <Link 
                        to="/admin"
                        className="h-12 w-12 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-primary)] border border-[var(--border-color)] shadow-sm shrink-0 hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-all duration-300 group/header-icon"
                    >
                        <Home className="h-5 w-5 opacity-60 group-hover/header-icon:opacity-100 transition-opacity" strokeWidth={1.5} />
                    </Link>

                    {/* Search Bar */}
                    <div className="relative w-full md:max-w-md group/search">
                        <input 
                            type="text"
                            data-region="input"
                            data-action="search"
                            id="searchinput"
                            name="search"
                            autoComplete="off"
                            placeholder={t('nav_search_placeholder') || "Search courses..."}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="form-control withclear pl-6 focus:ring-4 focus:ring-[var(--accent-primary)]/10"
                        />
                        {searchTerm && (
                            <button 
                                onClick={() => setSearchTerm("")}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-[var(--bg-primary)] text-[var(--text-secondary)] opacity-40 hover:opacity-100 transition-all"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        )}
                    </div>
                </div>

                <button
                    onClick={() => navigate(user?.role === 'admin' ? '/admin/addcourse' : '/teacher/addcourse')}
                    className="btn-primary w-full sm:w-auto flex items-center justify-center gap-3 !px-10 !py-5 shadow-xl hover:shadow-2xl hover:-translate-y-1 hover:scale-105 group active:scale-95 transition-all duration-300 text-[10px] uppercase tracking-widest bg-[var(--nav-bg)] text-[var(--text-primary)] border border-[var(--border-color)] hover:bg-[var(--bg-secondary)]"
                >
                    <Plus className="h-5 w-5 group-hover:rotate-90 group-hover:scale-110 transition-transform duration-300" />
                    {t('course_add_new')}
                </button>
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
            <div className="hidden md:block overflow-x-auto custom-scrollbar">
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
                        {filteredCourses.map((c, idx) => (
                            <tr key={c.courseid} className="hover:bg-[var(--accent-primary)]/[0.02] transition-colors group">
                                <td 
                                    className="px-8 py-6 whitespace-nowrap text-xs text-[var(--text-secondary)] font-black tracking-widest opacity-40 cursor-pointer"
                                    onClick={() => navigate(user?.role === 'admin' ? `/admin/lessons/${c.courseid}` : `/teacher/course/${c.courseid}`)}
                                >
                                    #{c.courseid}
                                </td>
                                <td 
                                    className="px-8 py-6 cursor-pointer group/title"
                                    onClick={() => navigate(user?.role === 'admin' ? `/admin/lessons/${c.courseid}` : `/teacher/course/${c.courseid}`)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-2xl bg-[var(--text-primary)] flex items-center justify-center text-[var(--bg-primary)] group-hover/title:bg-[var(--bg-primary)] group-hover/title:text-[var(--text-primary)] border border-transparent group-hover/title:border-[var(--text-primary)]/20 transition-all duration-500 shadow-xl shadow-black/10">
                                            <BookOpen className="h-5 w-5" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-[var(--text-primary)] text-lg leading-tight group-hover/title:text-[var(--accent-primary)] transition-colors">{c.title}</span>
                                            <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest opacity-30">{t('course_academic_module')}</span>
                                        </div>
                                    </div>
                                </td>
                                            <td 
                                                className="px-8 py-6 whitespace-nowrap cursor-pointer"
                                                onClick={() => navigate(user?.role === 'admin' ? `/admin/lessons/${c.courseid}` : `/teacher/course/${c.courseid}`)}
                                            >
                                                <span className={`
                                                    px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border shadow-sm
                                                    ${c.status === 'approved' 
                                                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                                                        : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}
                                                `}>
                                                    {c.status === 'approved' ? t('status_approved') : t('status_pending')}
                                                </span>
                                            </td>
                                            <td 
                                                className="px-8 py-6 whitespace-nowrap cursor-pointer"
                                                onClick={() => navigate(user?.role === 'admin' ? `/admin/lessons/${c.courseid}` : `/teacher/course/${c.courseid}`)}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className="h-6 w-6 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)]" />
                                                    <span className="text-sm font-bold text-[var(--text-secondary)] italic opacity-80 decoration-indigo-500/30 underline-offset-4 hover:underline">ID:{c.instructor_id}</span>
                                                </div>
                                            </td>
                                            <td 
                                                className="px-8 py-6 whitespace-nowrap text-right cursor-pointer"
                                                onClick={() => navigate(user?.role === 'admin' ? `/admin/lessons/${c.courseid}` : `/teacher/course/${c.courseid}`)}
                                            >
                                                <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-500">
                                                    {/* US-18: Manage Students Button */}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleManageStudents(c);
                                                        }}
                                                        className="h-10 px-4 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-violet-500 hover:bg-violet-500/10 border border-transparent hover:border-violet-500/20 transition-all active:scale-95"
                                                        title="Manage Students"
                                                    >
                                                        <Users className="h-4 w-4" />
                                                        Students
                                                    </button>
                                                    
                                                    {user?.role === 'admin' && (
                                                        <>
                                                            {c.status === 'pending' && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleApprove(c.courseid);
                                                                    }}
                                                                    className="h-10 px-4 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-500 hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/20 transition-all active:scale-95"
                                                                >
                                                                    <CheckCircle className="h-4 w-4" />
                                                                    {t('course_approve_btn')}
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDeleteCourse(c.courseid);
                                                                }}
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
                            {filteredCourses.map((c) => (
                                <MobileListItem
                                    key={c.courseid}
                                    title={c.title}
                                    subtitle={`Artifact #${c.courseid} • ID:${c.instructor_id}`}
                                    icon={BookOpen}
                                    isExpanded={expandedCourseId === c.courseid}
                                    onToggle={() => setExpandedCourseId(expandedCourseId === c.courseid ? null : c.courseid)}
                                    actions={[
                                        {
                                            label: 'Students',
                                            icon: Users,
                                            onClick: () => handleManageStudents(c),
                                            variant: 'primary'
                                        },
                                        {
                                            label: t('course_curriculum_btn') || 'View Course',
                                            icon: BookOpen,
                                            onClick: () => navigate(user?.role === 'admin' ? `/admin/lessons/${c.courseid}` : `/teacher/course/${c.courseid}`),
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
                                                <Users className="h-3.5 w-3.5 text-[var(--accent-primary)]" />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-40">Instructor</p>
                                                <p className="text-xs font-bold text-[var(--text-primary)]">ID: {c.instructor_id}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center">
                                                <CheckCircle className={`h-3.5 w-3.5 ${c.status === 'approved' ? 'text-emerald-500' : 'text-amber-500'}`} />
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

            {/* ===== US-18: Manage Students Modal ===== */}
            {isStudentModalOpen && selectedCourse && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[150] flex items-start justify-center p-0 md:p-6 animate-fade-in overflow-y-auto">
                    <div className="glass-card w-full max-w-4xl relative animate-fade-in-up shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border-none my-0 md:my-6 rounded-none md:rounded-3xl min-h-screen md:min-h-0">
                        
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 md:p-8 border-b border-[var(--border-color)]">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-violet-500/10 flex items-center justify-center shrink-0">
                                    <Users className="h-6 w-6 text-violet-500" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-[var(--text-primary)] leading-tight">Manage Students</h2>
                                    <p className="text-sm text-[var(--text-secondary)] opacity-60 font-medium truncate max-w-xs">{selectedCourse.title}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsStudentModalOpen(false)}
                                className="h-10 w-10 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center hover:bg-[var(--border-color)] transition-all active:scale-95"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">

                            {/* LEFT PANEL: Enrolled Students */}
                            <div className="flex flex-col gap-4">
                                <div>
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-60 mb-3">
                                        Enrolled Students
                                        <span className="ml-2 bg-violet-500/10 text-violet-500 px-2 py-0.5 rounded-full text-[9px]">
                                            {enrolledStudents.length}
                                        </span>
                                    </h3>
                                    {/* Search enrolled */}
                                    <div className="flex items-center gap-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] px-4 py-3 rounded-xl focus-within:border-violet-500/50 transition-all">
                                        <Search className="h-4 w-4 text-[var(--text-secondary)] opacity-40 shrink-0" />
                                        <input
                                            type="text"
                                            placeholder="Search enrolled students..."
                                            value={studentSearch}
                                            onChange={e => setStudentSearch(e.target.value)}
                                            className="bg-transparent border-none outline-none w-full text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/40 font-medium"
                                        />
                                    </div>
                                </div>

                                {studentsLoading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
                                    </div>
                                ) : filteredEnrolled.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center opacity-40">
                                        <Users className="h-10 w-10 mb-3" />
                                        <p className="text-sm font-black uppercase tracking-widest">
                                            {studentSearch ? 'No results' : 'No students enrolled'}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-[50vh] overflow-y-auto custom-scrollbar pr-1">
                                        {filteredEnrolled.map(s => (
                                            <div key={s.userid} className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-violet-500/20 transition-all group">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="h-10 w-10 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center font-black text-base shrink-0">
                                                        {s.fullname?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2 mb-0.5">
                                                            <p className="font-bold text-sm text-[var(--text-primary)] truncate">{s.fullname}</p>
                                                            {s.status === 'pending' && (
                                                                <span className="bg-amber-500/10 text-amber-500 text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border border-amber-500/20">
                                                                    Pending
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-[10px] text-[var(--text-secondary)] opacity-50 flex items-center gap-1 truncate">
                                                            <Mail className="h-2.5 w-2.5 shrink-0" />
                                                            {s.email}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleViewDossier(s.userid)}
                                                        className="h-8 w-8 rounded-xl bg-violet-500/0 text-violet-500/50 hover:bg-violet-500/10 hover:text-violet-500 border border-transparent hover:border-violet-500/20 flex items-center justify-center transition-all active:scale-95 shrink-0"
                                                        title={`View ${s.fullname}'s Dossier`}
                                                    >
                                                        <ExternalLink className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleUnenrollStudent(s.userid, s.fullname)}
                                                        disabled={removingId === s.userid}
                                                        className="h-8 w-8 rounded-xl bg-rose-500/0 text-rose-500/50 hover:bg-rose-500/10 hover:text-rose-500 border border-transparent hover:border-rose-500/20 flex items-center justify-center transition-all active:scale-95 shrink-0 disabled:opacity-40"
                                                        title={`Remove ${s.fullname}`}
                                                    >
                                                        {removingId === s.userid
                                                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                            : <UserMinus className="h-3.5 w-3.5" />
                                                        }
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* RIGHT PANEL: Add Students */}
                            <div className="flex flex-col gap-4">
                                <div>
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-60 mb-3">
                                        Add Students
                                    </h3>
                                    {/* Search all students */}
                                    <div className="flex items-center gap-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] px-4 py-3 rounded-xl focus-within:border-violet-500/50 transition-all">
                                        <Search className="h-4 w-4 text-[var(--text-secondary)] opacity-40 shrink-0" />
                                        <input
                                            type="text"
                                            placeholder="Search by name, email, or username…"
                                            value={addStudentSearch}
                                            onChange={e => setAddStudentSearch(e.target.value)}
                                            className="bg-transparent border-none outline-none w-full text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/40 font-medium"
                                        />
                                    </div>
                                </div>

                                {allStudentsLoading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
                                    </div>
                                ) : filteredAvailable.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center opacity-40">
                                        <UserPlus className="h-10 w-10 mb-3" />
                                        <p className="text-sm font-black uppercase tracking-widest">
                                            {addStudentSearch ? 'No results' : 'All students enrolled'}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-[50vh] overflow-y-auto custom-scrollbar pr-1">
                                        {filteredAvailable.map(s => (
                                            <div key={s.userid} className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-violet-500/20 transition-all group">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="h-10 w-10 rounded-xl bg-[var(--border-color)] text-[var(--text-secondary)] flex items-center justify-center font-black text-base shrink-0">
                                                        {s.fullname?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-sm text-[var(--text-primary)] truncate">{s.fullname}</p>
                                                        <p className="text-[10px] text-[var(--text-secondary)] opacity-50 flex items-center gap-1 truncate">
                                                            <Fingerprint className="h-2.5 w-2.5 shrink-0" />
                                                            @{s.username}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleEnrollStudent(s)}
                                                    disabled={enrollingId === s.userid}
                                                    className="h-8 w-8 rounded-xl bg-violet-500/0 text-violet-500/50 hover:bg-violet-500/10 hover:text-violet-500 border border-transparent hover:border-violet-500/20 flex items-center justify-center transition-all active:scale-95 shrink-0 disabled:opacity-40"
                                                    title={`Enroll ${s.fullname}`}
                                                >
                                                    {enrollingId === s.userid
                                                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                        : <UserPlus className="h-3.5 w-3.5" />
                                                    }
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <StudentDossierModal 
                                isOpen={isDossierOpen} 
                                onClose={() => setIsDossierOpen(false)} 
                                studentId={selectedDossierStudentId} 
                            />
        </div>
    );
};
