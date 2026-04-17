import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../lib/axios';
import { toast } from 'sonner';
import { 
    House, 
    Users, 
    Search, 
    UserPlus, 
    UserMinus, 
    Mail, 
    Fingerprint, 
    ExternalLink, 
    Loader2, 
    ArrowLeft 
} from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import StudentDossierModal from '../../components/shared/StudentDossierModal';

const ManageStudentsPage = () => {
    const { courseid } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [course, setCourse] = useState(null);
    const [enrolledStudents, setEnrolledStudents] = useState([]);
    const [allStudents, setAllStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [studentSearch, setStudentSearch] = useState('');
    const [addStudentSearch, setAddStudentSearch] = useState('');
    
    const [enrollingId, setEnrollingId] = useState(null);
    const [removingId, setRemovingId] = useState(null);

    const [isDossierOpen, setIsDossierOpen] = useState(false);
    const [selectedDossierStudentId, setSelectedDossierStudentId] = useState(null);

    const handleViewDossier = (id) => {
        setSelectedDossierStudentId(id);
        setIsDossierOpen(true);
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [courseRes, enrolledRes, allRes] = await Promise.all([
                api.get(`/courses/detail/${courseid}`),
                api.get(`/enrollments/course/${courseid}/students`),
                api.get('/users/students')
            ]);
            setCourse(courseRes.data);
            setEnrolledStudents(enrolledRes.data);
            setAllStudents(allRes.data);
        } catch (error) {
            console.error(error);
            // Fallback for course title if details route fails, though normally it should exist
            setCourse({ title: 'Course Roster' }); 
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [courseid]);

    const handleEnrollStudent = async (student) => {
        setEnrollingId(student.userid);
        try {
            const res = await api.post(`/enrollments/course/${courseid}/enroll`, { studentId: student.userid });
            const newRecord = { 
                ...student, 
                enrolled_at: new Date().toISOString(),
                status: res.data.status || 'active'
            };
            setEnrolledStudents(prev => [...prev, newRecord]);
            toast.success(res.data.message || `${student.fullname} enrolled successfully`);
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to enroll student');
        } finally {
            setEnrollingId(null);
        }
    };

    const handleUnenrollStudent = async (studentId, fullname) => {
        setRemovingId(studentId);
        try {
            await api.delete(`/enrollments/course/${courseid}/student/${studentId}`);
            setEnrolledStudents(prev => prev.filter(s => s.userid !== studentId));
            toast.success(`${fullname} removed from course`);
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to remove student');
        } finally {
            setRemovingId(null);
        }
    };

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

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <Loader2 className="h-12 w-12 animate-spin text-[var(--accent-primary)] mb-4" />
                <p className="text-[var(--text-secondary)] font-bold italic animate-pulse">Accessing Student Directory...</p>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen animate-fade-in-up pb-32">
            <header className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
                <div className="flex items-center gap-4 w-full">
                    <button 
                        onClick={() => navigate(-1)}
                        className="h-12 w-12 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-primary)] border border-[var(--border-color)] shadow-sm shrink-0 hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-all duration-300 group"
                    >
                        <ArrowLeft className="h-5 w-5 opacity-60 group-hover:opacity-100 transition-opacity" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-[var(--text-primary)] leading-tight flex items-center gap-3">
                            <Users className="h-7 w-7 text-violet-500" />
                            Manage Students
                        </h1>
                        <p className="text-sm text-[var(--text-secondary)] font-medium opacity-60 italic">
                            {course?.title || 'Course Details'} • ID: {courseid}
                        </p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* LEFT PANEL: Enrolled Students */}
                <div className="insta-card p-6 md:p-8 space-y-6">
                    <div>
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-60 mb-4 flex items-center justify-between">
                            Current Roster
                            <span className="bg-violet-500/10 text-violet-500 px-3 py-1 rounded-full text-[9px]">
                                {enrolledStudents.length} Students
                            </span>
                        </h3>
                        <div className="flex items-center gap-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] px-4 py-4 rounded-2xl focus-within:ring-2 focus-within:ring-violet-500/20 transition-all">
                            <Search className="h-4 w-4 text-[var(--text-secondary)] opacity-40 shrink-0" />
                            <input
                                type="text"
                                placeholder="Filter enrolled roster..."
                                value={studentSearch}
                                onChange={e => setStudentSearch(e.target.value)}
                                className="bg-transparent border-none outline-none w-full text-sm text-[var(--text-primary)] font-medium"
                            />
                        </div>
                    </div>

                    <div className="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
                        {filteredEnrolled.length === 0 ? (
                            <div className="py-20 flex flex-col items-center justify-center opacity-30 text-center">
                                <Users className="h-12 w-12 mb-4" />
                                <p className="text-xs font-black uppercase tracking-widest">No matching students</p>
                            </div>
                        ) : (
                            filteredEnrolled.map(s => (
                                <div key={s.userid} className="flex items-center justify-between gap-4 p-5 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)] hover:border-violet-500/30 transition-all group">
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="h-12 w-12 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center font-black text-lg shrink-0">
                                            {s.fullname?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="font-bold text-[var(--text-primary)] truncate">{s.fullname}</p>
                                                {s.status === 'pending' && (
                                                    <span className="bg-amber-500/10 text-amber-500 text-[8px] font-black uppercase px-2 py-0.5 rounded">Pending</span>
                                                )}
                                            </div>
                                            <p className="text-[10px] text-[var(--text-secondary)] opacity-50 flex items-center gap-1 truncate lowercase">
                                                <Mail className="h-3 w-3 shrink-0" />
                                                {s.email}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleViewDossier(s.userid)}
                                            className="h-10 w-10 rounded-xl bg-violet-500/0 text-violet-500/50 hover:bg-violet-500/10 hover:text-violet-500 border border-transparent hover:border-violet-500/20 flex items-center justify-center transition-all active:scale-95 shrink-0"
                                            title="View Dossier"
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleUnenrollStudent(s.userid, s.fullname)}
                                            disabled={removingId === s.userid}
                                            className="h-10 w-10 rounded-xl bg-rose-500/0 text-rose-500/50 hover:bg-rose-500/10 hover:text-rose-500 border border-transparent hover:border-rose-500/20 flex items-center justify-center transition-all active:scale-95 shrink-0 disabled:opacity-40"
                                            title="Remove from course"
                                        >
                                            {removingId === s.userid
                                                ? <Loader2 className="h-4 w-4 animate-spin" />
                                                : <UserMinus className="h-4 w-4" />
                                            }
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* RIGHT PANEL: Add Students */}
                <div className="insta-card p-6 md:p-8 space-y-6">
                    <div>
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-60 mb-4 flex items-center justify-between">
                            Available Scholars
                        </h3>
                        <div className="flex items-center gap-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] px-4 py-4 rounded-2xl focus-within:ring-2 focus-within:ring-violet-500/20 transition-all">
                            <Search className="h-4 w-4 text-[var(--text-secondary)] opacity-40 shrink-0" />
                            <input
                                type="text"
                                placeholder="Search all scholars..."
                                value={addStudentSearch}
                                onChange={e => setAddStudentSearch(e.target.value)}
                                className="bg-transparent border-none outline-none w-full text-sm text-[var(--text-primary)] font-medium"
                            />
                        </div>
                    </div>

                    <div className="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
                        {filteredAvailable.length === 0 ? (
                            <div className="py-20 flex flex-col items-center justify-center opacity-30 text-center">
                                <UserPlus className="h-12 w-12 mb-4" />
                                <p className="text-sm font-black uppercase tracking-widest">
                                    {addStudentSearch ? 'Zero matches found' : 'All scholars enrolled'}
                                </p>
                            </div>
                        ) : (
                            filteredAvailable.map(s => (
                                <div key={s.userid} className="flex items-center justify-between gap-4 p-5 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)] hover:border-violet-500/10 transition-all group">
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="h-12 w-12 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-secondary)] flex items-center justify-center font-black text-lg shrink-0 opacity-50">
                                            {s.fullname?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-[var(--text-primary)] truncate">{s.fullname}</p>
                                            <p className="text-[10px] text-[var(--text-secondary)] opacity-50 flex items-center gap-1 truncate uppercase tracking-tighter">
                                                <Fingerprint className="h-3 w-3 shrink-0" />
                                                ID: {s.userid}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleEnrollStudent(s)}
                                        disabled={enrollingId === s.userid}
                                        className="h-10 w-10 rounded-xl bg-violet-500/0 text-violet-500/40 hover:bg-violet-500/10 hover:text-violet-500 border border-transparent hover:border-violet-500/20 flex items-center justify-center transition-all active:scale-95 shrink-0 disabled:opacity-40"
                                        title="Enroll student"
                                    >
                                        {enrollingId === s.userid
                                            ? <Loader2 className="h-4 w-4 animate-spin" />
                                            : <UserPlus className="h-4 w-4" />
                                        }
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <StudentDossierModal 
                isOpen={isDossierOpen} 
                onClose={() => setIsDossierOpen(false)} 
                studentId={selectedDossierStudentId} 
            />
        </div>
    );
};

export default ManageStudentsPage;
