import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  BookOpen, 
  Calendar, 
  Clock, 
  Plus, 
  Layout, 
  X, 
  FileText, 
  ChevronRight,
  ClipboardList,
  Upload,
  Loader2,
  Layers,
  Info,
  Trash2,
  Users,
  Search
} from "lucide-react";
import { ConfirmModal } from "../shared/ConfirmModal";
import { courseService } from "../../service/courseService";
import { api } from "../../lib/axios";
import { toast } from "sonner";
import { useAuthStore } from "../../stores/userAuthStore";
import { useTranslation } from "../../hooks/useTranslation";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import { showUndoToast } from "../shared/UndoToast";

export const CourseLayout = () => {
  const { courseid } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const [course, setCourse] = useState({ title: "", description: "", id: courseid });
  const [lessons, setLessons] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [students, setStudents] = useState([]);
  const [activeTab, setActiveTab] = useState('lessons'); // 'lessons' | 'assignments' | 'students'
  const [loading, setLoading] = useState(true);
  const [studentSearch, setStudentSearch] = useState("");

  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [newAssignment, setNewAssignment] = useState({ title: '', description: '', due_date: '', type: 'assignment', file: null });

  // Delete handling state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null); // { type: 'lesson' | 'assignment', id: string, title: string }
  const undoTimeoutRef = useRef(null);

  const modalRef = useRef(null);
  useFocusTrap(modalRef, isAssignmentModalOpen);

  const fetchData = async () => {
    setLoading(true);
    try {
      const lessonsData = await courseService.getCourseContent(courseid);
      setLessons(lessonsData);

      if (lessonsData.length > 0 && lessonsData[0].course_title) {
        setCourse(prev => ({ 
            ...prev, 
            title: lessonsData[0].course_title,
            description: lessonsData[0].course_description || prev.description 
        }));
      }

      const assignRes = await api.get(`/assignments/course/${courseid}`);
      setAssignments(assignRes.data);

      if (user?.role === 'admin' || user?.role === 'instructor') {
        try {
          const stdRes = await api.get(`/enrollments/course/${courseid}/students`);
          setStudents(stdRes.data);
        } catch (err) {
          console.error("Failed to load students", err);
        }
      }
    } catch (e) {
      toast.error(t('alert_course_data_error'));
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [courseid]);

  const handleAddLesson = () => {
    navigate(`/course/${courseid}/lesson/new`);
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!newAssignment.title) {
      toast.error(t('alert_assign_title_req'));
      return;
    }

    if (newAssignment.due_date) {
        const selectedDate = new Date(newAssignment.due_date);
        const now = new Date();
        if (selectedDate < now) {
            toast.error("Assignment due date cannot be in the past");
            return;
        }
    }

    try {
      const formData = new FormData();
      formData.append('title', newAssignment.title);
      formData.append('description', newAssignment.description);
      if (newAssignment.due_date) {
        // Fix for MySQL datetime strict format: from 'YYYY-MM-DDTHH:mm' to 'YYYY-MM-DD HH:mm:00'
        const safeMySQLDate = newAssignment.due_date.replace('T', ' ') + ':00';
        formData.append('due_date', safeMySQLDate);
      }
      formData.append('type', newAssignment.type);
      if (newAssignment.file) formData.append('file', newAssignment.file);

      await api.post(`/assignments/course/${courseid}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success(t('alert_assign_success'));
      setIsAssignmentModalOpen(false);
      setNewAssignment({ title: '', description: '', due_date: '', type: 'assignment', file: null });
      fetchData();
    } catch (e) {
      toast.error(t('alert_assign_error'));
    }
  };

  const performDelete = async () => {
    if (!itemToDelete) return;
    const target = { ...itemToDelete };
    setIsDeleteModalOpen(false);

    // Optimistic UI or just show Undo toast
    const message = target.type === 'lesson' 
        ? `Lesson "${target.title}" moved to trash` 
        : `Assignment "${target.title}" moved to trash`;

    showUndoToast(message, () => {
        if (undoTimeoutRef.current) {
            clearTimeout(undoTimeoutRef.current);
            undoTimeoutRef.current = null;
            toast.info("Deletion cancelled");
        }
    }, t);

    undoTimeoutRef.current = setTimeout(async () => {
        try {
            if (target.type === 'lesson') {
                await api.delete(`/courses/lessons/${target.id}`);
            } else {
                await api.delete(`/assignments/${target.id}`);
            }
            fetchData();
            undoTimeoutRef.current = null;
        } catch (e) {
            toast.error(t('alert_error'));
        }
    }, 5000);
  };

  const confirmDelete = (e, type, id, title) => {
    e.stopPropagation();
    setItemToDelete({ type, id, title });
    setIsDeleteModalOpen(true);
  };

  const isInstructorOrAdmin = user?.role === 'admin' || user?.role === 'instructor';

  const navigateToAssignment = (id) => {
    const roleBase = user?.role === 'admin' ? '/admin' : user?.role === 'instructor' ? '/teacher' : '/student';
    const path = user?.role === 'instructor' 
      ? `/teacher/course/${courseid}/assignment/${id}`
      : `${roleBase}/assignment/${id}`;
    navigate(path);
  };

  const getBackPath = () => {
    if (user?.role === 'admin') return '/admin/courses';
    if (user?.role === 'student') return '/student/courses';
    return '/teacher/courses';
  };

  if (loading && lessons.length === 0) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-[var(--text-primary)] mb-4" />
        <p className="text-[var(--text-secondary)] font-medium animate-pulse uppercase tracking-widest text-[10px]">{t('course_load_arch')}</p>
    </div>
  );

  return (
    <main 
      role="main" 
      className="max-w-6xl mx-auto space-y-6 md:space-y-10 animate-fade-in-up p-4 md:p-0 pb-32"
    >
      {/* Compact Command Center Header */}
      <header className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-12">
        <div className="flex items-center gap-6 w-full sm:w-auto">
          <div className="h-14 w-14 rounded-2xl bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-primary)] border border-[var(--border-color)] shadow-sm shrink-0">
            <BookOpen className="h-6 w-6 opacity-60" />
          </div>
          <div className="space-y-1.5 overflow-hidden">
            <h1 className="text-2xl md:text-3xl font-medium text-[var(--text-primary)] tracking-tight italic truncate">
              {course.title || t('course_curriculum_overview')}
            </h1>
            <div className="flex items-center gap-6 text-[15px] uppercase tracking-[0.2em] font-black text-[var(--text-secondary)]">
              <button 
                onClick={() => navigate(getBackPath())}
                className="flex items-center gap-4 px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--accent-primary)] transition-all group/back leading-relaxed"
              >
                <ArrowLeft size={16} className="group-hover/back:-translate-x-1.5 transition-transform" /> 
                {t('course_back_to_dash')}
              </button>
              <div className="flex items-center gap-4 opacity-40 py-2.5 overflow-hidden">
                <span className="text-[12px]">•</span>
                <span className="truncate italic">CID: {courseid}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <section className="bg-[var(--bg-primary)] border border-[var(--border-color)] overflow-hidden min-h-[600px] flex flex-col rounded-[2.5rem] shadow-sm">
        {/* Navigation Tabs - Monochrome Style */}
        <nav 
          aria-label="Course Sections" 
          className="flex border-b border-[var(--border-color)] px-6 md:px-12 pt-6 md:pt-10 bg-[var(--bg-secondary)]/50 backdrop-blur-3xl overflow-x-auto no-scrollbar"
        >
          <button
            onClick={() => setActiveTab('lessons')}
            className={`
              flex flex-none items-center gap-3 px-8 md:px-12 py-6 transition-all duration-300 relative font-medium text-[10px] md:text-xs uppercase tracking-widest
              ${activeTab === 'lessons' ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] opacity-40 hover:opacity-100'}
            `}
          >
            <BookOpen size={18} strokeWidth={activeTab === 'lessons' ? 2 : 1.5} />
            {t('course_tab_lessons')}
            {activeTab === 'lessons' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--text-primary)]" />}
          </button>
          <button
            onClick={() => setActiveTab('assignments')}
            className={`
              flex flex-none items-center gap-3 px-8 md:px-12 py-6 transition-all duration-300 relative font-medium text-[10px] md:text-xs uppercase tracking-widest
              ${activeTab === 'assignments' ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] opacity-40 hover:opacity-100'}
            `}
          >
            <FileText size={18} strokeWidth={activeTab === 'assignments' ? 2 : 1.5} />
            {t('course_tab_assignments')}
            {activeTab === 'assignments' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--text-primary)]" />}
          </button>
          
          {(isInstructorOrAdmin || user?.role === 'admin') && (
            <button
              onClick={() => setActiveTab('students')}
              className={`
                flex flex-none items-center gap-3 px-8 md:px-12 py-6 transition-all duration-300 relative font-medium text-[10px] md:text-xs uppercase tracking-widest
                ${activeTab === 'students' ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] opacity-40 hover:opacity-100'}
              `}
            >
              <Users size={18} strokeWidth={activeTab === 'students' ? 2 : 1.5} />
              {t('nav_students') || 'Scholars'}
              {activeTab === 'students' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--text-primary)]" />}
            </button>
          )}
        </nav>

        {/* Tab View Content */}
        <div className="p-6 md:p-16 flex-1 bg-gradient-to-b from-transparent to-[var(--bg-secondary)]/30">
          {activeTab === 'lessons' && (
            <div className="space-y-10 md:space-y-16 animate-fade-in-up">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                <div className="space-y-2">
                  <h2 className="text-3xl md:text-4xl font-medium text-[var(--text-primary)] italic tracking-tight">{t('course_academic_modules_title')}</h2>
                  <p className="text-[var(--text-secondary)] font-medium text-sm md:text-base leading-relaxed break-words">{t('course_academic_modules_sub')}</p>
                </div>
                {isInstructorOrAdmin && (
                  <button 
                    onClick={handleAddLesson} 
                    className="btn-primary w-full sm:w-auto flex items-center justify-center gap-3 !px-10 !py-5 shadow-xl hover:shadow-2xl hover:-translate-y-1 hover:scale-105 group active:scale-95 transition-all duration-300 text-[10px] uppercase tracking-widest bg-[var(--nav-bg)] text-[var(--text-primary)] border border-[var(--border-color)] hover:bg-[var(--bg-secondary)]"
                  >
                    <Plus className="h-5 w-5 group-hover:rotate-90 group-hover:scale-110 transition-transform duration-300" />
                    {t('course_add_lesson')}
                  </button>
                )}
              </div>

              <section aria-label="Lessons List" className="grid grid-cols-1 gap-6 md:gap-8">
                {lessons.length === 0 ? (
                  <div className="py-24 md:py-40 flex flex-col items-center justify-center text-center rounded-[2rem] border-2 border-dashed border-[var(--border-color)]">
                    <BookOpen size={48} strokeWidth={1} className="text-[var(--text-secondary)] opacity-20 mb-8" />
                    <p className="text-[var(--text-primary)] font-medium uppercase tracking-[0.3em] text-[10px] md:text-xs">{t('course_lessons_empty')}</p>
                    <p className="text-[var(--text-secondary)] text-sm mt-4 font-medium italic opacity-60 max-w-sm px-6 leading-relaxed">{t('course_lessons_empty_sub')}</p>
                  </div>
                ) : (
                  lessons.map((lesson, index) => (
                    <article
                      key={lesson.lesson_id}
                      onClick={() => {
                        if (user?.role === 'student') {
                          navigate(`/student/course/${courseid}/lesson/${lesson.lesson_id}`);
                        } else {
                          navigate(`/course/${courseid}/lesson/${lesson.lesson_id}`);
                        }
                      }}
                      className={`animate-fade-in-up stagger-${(index % 4) + 1}`}
                    >
                        <div className="group insta-card p-8 md:p-10 flex items-center justify-between cursor-pointer border-[var(--border-color)] hover:border-[var(--text-primary)] active:scale-[0.99] transition-all bg-[var(--bg-primary)]">
                        <div className="flex items-center gap-8 md:gap-12 overflow-hidden min-w-0">
                            <div className="h-14 md:h-20 w-14 md:w-20 flex-none rounded-2xl bg-[var(--text-primary)] flex items-center justify-center text-[var(--bg-primary)] font-medium text-xl md:text-3xl transition-transform duration-500 group-hover:rotate-3 shadow-lg">
                            {(index + 1).toString().padStart(2, '0')}
                            </div>
                            <div className="space-y-2 overflow-hidden min-w-0">
                            <h3 className="text-xl md:text-3xl font-medium text-[var(--text-primary)] leading-relaxed break-words italic">{lesson.title}</h3>
                            <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-[0.3em] font-medium opacity-60 truncate">{t('course_section_module')} {(index + 1).toString().padStart(2, '0')}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            {isInstructorOrAdmin && (
                                <button 
                                    onClick={(e) => confirmDelete(e, 'lesson', lesson.lesson_id, lesson.title)}
                                    className="h-12 w-12 rounded-full border border-[var(--border-color)] flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white transition-all duration-300 z-10"
                                    title={t('user_delete')}
                                >
                                    <Trash2 size={20} strokeWidth={1.5} />
                                </button>
                            )}
                            <div className="h-12 md:h-16 w-12 md:w-16 flex-none rounded-full border border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)] group-hover:bg-[var(--text-primary)] group-hover:text-[var(--bg-primary)] transition-all duration-500 group-hover:rotate-12">
                                <ChevronRight size={24} strokeWidth={1.5} />
                            </div>
                        </div>
                        </div>
                    </article>
                  ))
                )}
              </section>
            </div>
          )}

          {activeTab === 'assignments' && (
            <div className="space-y-10 md:space-y-16 animate-fade-in-up">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-end gap-8">
                {isInstructorOrAdmin && (
                  <button 
                    onClick={() => setIsAssignmentModalOpen(true)} 
                    className="btn-primary w-full sm:w-auto flex items-center justify-center gap-3 !px-10 !py-5 shadow-xl hover:shadow-2xl hover:-translate-y-1 hover:scale-105 group active:scale-95 transition-all duration-300 text-[10px] uppercase tracking-widest bg-[var(--nav-bg)] text-[var(--text-primary)] border border-[var(--border-color)] hover:bg-[var(--bg-secondary)]"
                  >
                    <Plus className="h-5 w-5 group-hover:rotate-90 group-hover:scale-110 transition-transform duration-300" />
                    {t('course_add_assignment')}
                  </button>
                )}
              </div>

              <section aria-label="Assignments List" className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                {assignments.length === 0 ? (
                  <div className="py-24 md:py-40 col-span-full flex flex-col items-center justify-center text-center rounded-[2rem] border-2 border-dashed border-[var(--border-color)]">
                    <FileText size={48} strokeWidth={1} className="text-[var(--text-secondary)] opacity-20 mb-8" />
                    <p className="text-[var(--text-primary)] font-medium uppercase tracking-[0.3em] text-[10px] md:text-xs">{t('course_assignments_empty')}</p>
                    <p className="text-[var(--text-secondary)] text-sm mt-4 font-medium italic opacity-60 max-w-sm px-6 leading-relaxed">{t('course_assignments_empty_sub')}</p>
                  </div>
                ) : (
                  assignments.map((assignment, index) => (
                    <article
                      key={assignment.id}
                      onClick={() => navigateToAssignment(assignment.id)}
                      className={`animate-fade-in-up stagger-${(index % 4) + 1} h-full`}
                    >
                        <div className="group insta-card p-8 md:p-12 flex flex-col justify-between cursor-pointer border-[var(--border-color)] hover:border-[var(--text-primary)] active:scale-[0.99] transition-all h-full bg-[var(--bg-primary)]">
                        <div className="space-y-8">
                            <div className="flex justify-between items-start">
                                <div className="h-14 md:h-16 w-14 md:w-16 rounded-2xl border border-[var(--text-primary)]/10 flex items-center justify-center text-[var(--text-primary)] shadow-sm group-hover:bg-[var(--text-primary)] group-hover:text-[var(--bg-primary)] transition-all duration-500">
                                    <ClipboardList size={24} strokeWidth={1.5} />
                                </div>
                                <div className="flex items-center gap-3">
                                    {isInstructorOrAdmin && (
                                        <button 
                                            onClick={(e) => confirmDelete(e, 'assignment', assignment.id, assignment.title)}
                                            className="h-10 w-10 rounded-xl border border-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all duration-300 z-10 flex items-center justify-center"
                                            title={t('user_delete')}
                                        >
                                            <Trash2 size={16} strokeWidth={1.5} />
                                        </button>
                                    )}
                                    <span className="text-[9px] font-medium tracking-[0.3em] text-[var(--text-secondary)] uppercase opacity-40">#{assignment.id}</span>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-xl md:text-3xl font-medium text-[var(--text-primary)] leading-relaxed italic break-words">{assignment.title}</h3>
                                <div className="flex flex-col gap-3">
                                    <span className="text-[10px] text-[var(--text-secondary)] font-medium uppercase tracking-widest flex items-center gap-2 opacity-60">
                                        <Calendar size={12} strokeWidth={1.5} />
                                        {new Date(assignment.created_at).toLocaleDateString()}
                                    </span>
                                    {assignment.due_date && (
                                    <span className="text-[10px] text-[var(--text-primary)] font-medium uppercase tracking-[0.2em] flex items-center gap-2 bg-[var(--bg-secondary)] px-4 py-2 rounded-xl border border-[var(--border-color)] w-fit">
                                        <Clock size={12} strokeWidth={1.5} />
                                        {t('course_assignment_due')}: {new Date(assignment.due_date).toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="mt-10 pt-8 border-t border-[var(--border-color)]/50 flex items-center justify-between group-hover:border-[var(--text-primary)]/20 transition-all duration-700">
                            <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors italic">{t('assign_view_detail')}</span>
                            <ChevronRight size={18} strokeWidth={1.5} className="text-[var(--text-secondary)] group-hover:translate-x-1.5 transition-all" />
                        </div>
                        </div>
                    </article>
                  ))
                )}
              </section>
            </div>
          )}

          {activeTab === 'students' && (
            <div className="space-y-10 md:space-y-16 animate-fade-in-up">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                <div className="space-y-2">
                  <h2 className="text-3xl md:text-4xl font-medium text-[var(--text-primary)] italic tracking-tight">{t('nav_students') || 'Scholars Directory'}</h2>
                  <p className="text-[var(--text-secondary)] font-medium text-sm md:text-base leading-relaxed break-words">Manage and view enrolled scholars in this course</p>
                </div>
                <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto">
                  <div className="relative flex-1 md:w-80 group">
                    <input 
                      type="text"
                      placeholder="Search enrolled scholars..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      className="w-full pl-6 pr-6 py-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] font-medium text-xs outline-none focus:border-[var(--accent-primary)] focus:ring-4 focus:ring-[var(--accent-primary)]/5 transition-all placeholder:opacity-20 italic"
                    />
                  </div>
                  <div className="px-6 py-3 rounded-full border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] font-medium text-[10px] uppercase tracking-widest whitespace-nowrap">
                    Total: {students.length}
                  </div>
                </div>
              </div>

              <section aria-label="Students List" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {students.filter(s => 
                  s.fullname?.toLowerCase().includes(studentSearch.toLowerCase()) || 
                  s.username?.toLowerCase().includes(studentSearch.toLowerCase()) ||
                  s.email?.toLowerCase().includes(studentSearch.toLowerCase())
                ).length === 0 ? (
                  <div className="py-24 md:py-40 col-span-full flex flex-col items-center justify-center text-center rounded-[2rem] border-2 border-dashed border-[var(--border-color)]">
                    <Users size={48} strokeWidth={1} className="text-[var(--text-secondary)] opacity-20 mb-8" />
                    <p className="text-[var(--text-primary)] font-medium uppercase tracking-[0.3em] text-[10px] md:text-xs">
                      {studentSearch ? "No scholars matching your query" : "No students enrolled"}
                    </p>
                    <p className="text-[var(--text-secondary)] text-sm mt-4 font-medium italic opacity-60 max-w-sm px-6 leading-relaxed">
                      {studentSearch ? "Try adjusting your search criteria" : "Admin must assign students to this course"}
                    </p>
                  </div>
                ) : (
                  students
                    .filter(s => 
                      s.fullname?.toLowerCase().includes(studentSearch.toLowerCase()) || 
                      s.username?.toLowerCase().includes(studentSearch.toLowerCase()) ||
                      s.email?.toLowerCase().includes(studentSearch.toLowerCase())
                    )
                    .map((student, index) => (
                    <article
                      key={student.student_id || student.userid || index}
                      className={`animate-fade-in-up stagger-${(index % 4) + 1} h-full`}
                    >
                        <div className="group insta-card p-6 md:p-8 flex items-center gap-6 cursor-default border-[var(--border-color)] hover:border-[var(--text-primary)] transition-all h-full bg-[var(--bg-primary)]">
                            <div className="h-16 w-16 rounded-full border border-[var(--text-primary)]/10 bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-primary)] shadow-inner text-xl font-medium uppercase overflow-hidden shrink-0">
                                {student.avatar ? (
                                    <img src={student.avatar} alt={student.fullname} className="w-full h-full object-cover" />
                                ) : (
                                    (student.fullname?.charAt(0) || student.username?.charAt(0) || "U")
                                )}
                            </div>
                            <div className="space-y-1.5 overflow-hidden flex-1 min-w-0">
                                <h3 className="text-lg font-medium text-[var(--text-primary)] truncate">{student.fullname || student.username}</h3>
                                <div className="flex flex-col gap-0.5">
                                    <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-widest font-medium opacity-60 truncate">{student.email}</p>
                                    <p className="text-[9px] text-[var(--accent-primary)] font-black tracking-widest uppercase truncate">@{student.username}</p>
                                </div>
                            </div>
                            <div className="h-8 w-8 rounded-full border border-[var(--border-color)] flex items-center justify-center group-hover:bg-[var(--text-primary)] group-hover:text-[var(--bg-primary)] transition-all">
                                <ChevronRight size={14} strokeWidth={2} />
                            </div>
                        </div>
                    </article>
                  ))
                )}
              </section>
             </div>
          )}
        </div>
      </section>

      {/* Assignment Creation Modal - Strict Monochrome */}
      {isAssignmentModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 md:p-10 animate-fade-in">
          <div ref={modalRef} className="bg-[var(--bg-primary)] p-8 md:p-16 w-full max-w-3xl max-h-[90vh] shadow-2xl relative overflow-y-auto rounded-[2.5rem] border border-[var(--border-color)]">
            
            <button 
              onClick={() => setIsAssignmentModalOpen(false)}
              className="absolute right-8 top-8 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all duration-500 transform hover:rotate-90 z-20"
            >
              <X size={32} strokeWidth={1} />
            </button>

            <header className="mb-12">
              <h3 className="text-3xl md:text-5xl font-medium text-[var(--text-primary)] mb-4 tracking-tighter italic uppercase">{t('course_assignment_modal_title')}</h3>
              <p className="text-[var(--text-secondary)] font-medium text-base md:text-lg italic opacity-80">{t('course_assignment_modal_sub')}</p>
            </header>

            <form onSubmit={handleCreateAssignment} className="space-y-10">
              <div className="space-y-4">
                <label className="text-[10px] font-medium text-[var(--text-secondary)] uppercase tracking-[0.3em] ml-1 opacity-60">
                  {t('course_assignment_label_title')}
                </label>
                <input
                  type="text"
                  value={newAssignment.title}
                  onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                  placeholder={t('course_assignment_placeholder_title')}
                  className="w-full px-8 py-6 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-secondary)]/50 focus:bg-[var(--bg-primary)] focus:border-[var(--text-primary)] outline-none transition-all text-[var(--text-primary)] font-medium placeholder:opacity-20 italic"
                  required
                />
              </div>
              
              <div className="space-y-4">
                <label className="text-[10px] font-medium text-[var(--text-secondary)] uppercase tracking-[0.3em] ml-1 opacity-60">
                  {t('course_assignment_label_desc')}
                </label>
                <textarea
                  value={newAssignment.description}
                  onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                  placeholder={t('course_assignment_placeholder_desc')}
                  className="w-full h-40 px-8 py-6 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-secondary)]/50 focus:bg-[var(--bg-primary)] focus:border-[var(--text-primary)] outline-none transition-all text-[var(--text-primary)] font-medium placeholder:opacity-20 resize-none leading-relaxed italic"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-medium text-[var(--text-secondary)] uppercase tracking-[0.3em] ml-1 opacity-60">
                    {t('course_assignment_label_due')}
                  </label>
                  <input
                    type="datetime-local"
                    value={newAssignment.due_date}
                    onChange={(e) => setNewAssignment({ ...newAssignment, due_date: e.target.value })}
                    className="w-full px-8 py-6 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-secondary)]/50 focus:bg-[var(--bg-primary)] focus:border-[var(--text-primary)] outline-none transition-all text-[var(--text-primary)] font-medium italic"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-medium text-[var(--text-secondary)] uppercase tracking-[0.3em] ml-1 opacity-60">
                    Event Classification
                  </label>
                  <select
                    value={newAssignment.type}
                    onChange={(e) => setNewAssignment({ ...newAssignment, type: e.target.value })}
                    className="w-full px-8 py-6 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-secondary)]/50 focus:bg-[var(--bg-primary)] focus:border-[var(--text-primary)] outline-none transition-all text-[var(--text-primary)] font-medium italic appearance-none cursor-pointer"
                  >
                    <option value="assignment">Assignment</option>
                    <option value="homework">Homework</option>
                    <option value="test">Test</option>
                  </select>
                </div>
                
                <div className="space-y-4">
                  <label className="text-[10px] font-medium text-[var(--text-secondary)] uppercase tracking-[0.3em] ml-1 opacity-60">
                    {t('course_assignment_label_file')}
                  </label>
                  <div className="relative group cursor-pointer h-20">
                    <input
                      type="file"
                      onChange={(e) => setNewAssignment({ ...newAssignment, file: e.target.files[0] })}
                      className="absolute inset-0 opacity-0 z-10 cursor-pointer"
                    />
                    <div className="w-full h-full px-8 rounded-3xl border-2 border-dashed border-[var(--border-color)] bg-[var(--bg-secondary)]/30 group-hover:border-[var(--text-primary)] transition-all flex items-center justify-center gap-4 overflow-hidden">
                      <Upload size={20} strokeWidth={1.5} className="text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]" />
                      <span className="text-[10px] font-medium text-[var(--text-secondary)] truncate group-hover:text-[var(--text-primary)] uppercase tracking-[0.2em] italic">
                        {newAssignment.file ? newAssignment.file.name : t('course_assignment_attach_file')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <footer className="flex flex-col sm:flex-row gap-6 pt-10">
                <button
                  type="button"
                  onClick={() => setIsAssignmentModalOpen(false)}
                  className="flex-1 py-6 rounded-3xl bg-[var(--bg-secondary)] text-[var(--text-primary)] font-medium text-[10px] uppercase tracking-widest hover:bg-[var(--border-color)] transition-all active:scale-95 italic"
                >
                  {t('course_assignment_discard')}
                </button>
                <button
                  type="submit"
                  className="flex-[2] btn-primary w-full sm:w-auto flex items-center justify-center gap-4 px-4 py-6 rounded-xl text-[10px] font-black uppercase tracking-widest bg-[var(--nav-bg)] text-[var(--text-primary)] border border-[var(--border-color)] hover:bg-[var(--bg-secondary)] shadow-xl hover:shadow-2xl hover:-translate-y-1 hover:scale-105 active:scale-95 transition-all duration-300"
                >
                  <Plus className="h-5 w-5 group-hover:rotate-90 group-hover:scale-110 transition-transform duration-300" />
                  {t('course_assignment_publish')}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={performDelete}
        title={itemToDelete?.type === 'lesson' ? t('course_academic_module') : t('nav_assignments')}
        message={itemToDelete?.type === 'lesson' ? t('delete_lesson_confirm') : t('delete_assignment_confirm')}
        confirmText={t('user_delete')}
        icon={Trash2}
        variant="danger"
      />
    </main>
  );
};
