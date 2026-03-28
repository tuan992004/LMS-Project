import { useTranslation } from "../../hooks/useTranslation";

export const CourseLayout = () => {
  const { courseid } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const [course, setCourse] = useState({ title: "", description: "", id: courseid });
  const [lessons, setLessons] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [activeTab, setActiveTab] = useState('lessons'); // 'lessons' | 'assignments'
  const [loading, setLoading] = useState(true);

  // Assignment Modal
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [newAssignment, setNewAssignment] = useState({ title: '', description: '', due_date: '', file: null });

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Content (Lessons)
      const lessonsData = await courseService.getCourseContent(courseid);
      setLessons(lessonsData);

      if (lessonsData.length > 0 && lessonsData[0].course_title) {
        setCourse(prev => ({ 
            ...prev, 
            title: lessonsData[0].course_title,
            description: lessonsData[0].course_description || prev.description 
        }));
      }

      // Fetch Assignments
      const assignRes = await api.get(`/assignments/course/${courseid}`);
      setAssignments(assignRes.data);
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

    try {
      const formData = new FormData();
      formData.append('title', newAssignment.title);
      formData.append('description', newAssignment.description);
      if (newAssignment.due_date) formData.append('due_date', newAssignment.due_date);
      if (newAssignment.file) formData.append('file', newAssignment.file);

      await api.post(`/assignments/course/${courseid}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success(t('alert_assign_success'));
      setIsAssignmentModalOpen(false);
      setNewAssignment({ title: '', description: '', due_date: '', file: null });
      fetchData();
    } catch (e) {
      toast.error(t('alert_assign_error'));
    }
  };

  const isInstructorOrAdmin = user?.role === 'admin' || user?.role === 'instructor';

  const navigateToAssignment = (id) => {
    if (user?.role === 'student') navigate(`/student/assignment/${id}`);
    else if (user?.role === 'admin') navigate(`/admin/assignment/${id}`);
    else navigate(`/teacher/course/${courseid}/assignment/${id}`);
  };

  const getBackPath = () => {
    if (user?.role === 'admin') return '/admin/courses';
    if (user?.role === 'student') return '/student/courses';
    return '/teacher/courses';
  };

  if (loading && lessons.length === 0) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-[var(--accent-primary)] mb-4" />
        <p className="text-[var(--text-secondary)] font-bold animate-pulse">{t('course_load_arch')}</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-fade-in-up p-4 sm:p-0">
      {/* Top Header */}
      <div className="glass-card p-12 relative overflow-hidden group shadow-2xl transition-all duration-500 hover:shadow-[var(--accent-primary)]/5">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[var(--accent-primary)] opacity-[0.04] rounded-full -mr-40 -mt-40 transition-transform duration-1000 group-hover:scale-125" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between gap-10">
          <div className="space-y-8 flex-1">
            <button
                onClick={() => navigate(getBackPath())}
                className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all text-[10px] font-black uppercase tracking-widest group/back"
            >
                <ArrowLeft className="h-4 w-4 group-hover/back:-translate-x-1.5 transition-transform" />
                {t('course_back_to_dash')}
            </button>
            
            <h1 className="text-5xl font-black text-[var(--text-primary)] tracking-tight leading-[1.05] italic">
                {course.title || t('course_curriculum_overview')}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2.5 bg-[var(--bg-secondary)] px-5 py-2.5 rounded-2xl text-[var(--text-secondary)] font-black text-[10px] uppercase tracking-widest border border-[var(--border-color)] shadow-sm">
                    <Layout className="h-4 w-4 opacity-50" />
                    CID: {courseid}
                </div>
                {lessons.length > 0 && (
                    <div className="flex items-center gap-2.5 bg-[var(--accent-primary)]/10 px-5 py-2.5 rounded-2xl text-[var(--accent-primary)] font-black text-[10px] uppercase tracking-widest border border-[var(--accent-primary)]/20 shadow-lg shadow-indigo-500/5">
                        <Layers className="h-4 w-4" />
                        {lessons.length} {t('course_learning_modules')}
                    </div>
                )}
            </div>
          </div>

          <div className="relative z-10 flex flex-col justify-end max-w-sm">
            <div className="bg-[var(--bg-secondary)]/40 p-8 rounded-[2.5rem] border border-[var(--border-color)] shadow-sm backdrop-blur-md">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-3 flex items-center gap-2 opacity-50">
                    <Info className="h-3.5 w-3.5" /> {t('course_synopsis')}
                </h4>
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed line-clamp-4 font-medium italic">
                    {course.description || t('course_default_desc')}
                </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="glass-card overflow-hidden min-h-[650px] flex flex-col shadow-2xl">
        {/* Navigation Tabs */}
        <div className="flex border-b border-[var(--border-color)] px-10 pt-8 bg-white/5 backdrop-blur-3xl">
          <button
            onClick={() => setActiveTab('lessons')}
            className={`
              flex items-center gap-3 px-10 py-6 transition-all duration-300 relative font-black text-[10px] uppercase tracking-widest
              ${activeTab === 'lessons' ? 'text-[var(--accent-primary)]' : 'text-[var(--text-secondary)] opacity-40 hover:opacity-100'}
            `}
          >
            <BookOpen className={`h-5 w-5 ${activeTab === 'lessons' ? 'text-[var(--accent-primary)]' : 'text-[var(--text-secondary)]'}`} />
            {t('course_tab_lessons')}
            {activeTab === 'lessons' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--accent-primary)] rounded-t-full shadow-lg shadow-indigo-500/40" />}
          </button>
          <button
            onClick={() => setActiveTab('assignments')}
            className={`
              flex items-center gap-3 px-10 py-6 transition-all duration-300 relative font-black text-[10px] uppercase tracking-widest
              ${activeTab === 'assignments' ? 'text-[var(--accent-primary)]' : 'text-[var(--text-secondary)] opacity-40 hover:opacity-100'}
            `}
          >
            <FileText className={`h-5 w-5 ${activeTab === 'assignments' ? 'text-[var(--accent-primary)]' : 'text-[var(--text-secondary)]'}`} />
            {t('course_tab_assignments')}
            {activeTab === 'assignments' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--accent-primary)] rounded-t-full shadow-lg shadow-indigo-500/40" />}
          </button>
        </div>

        {/* Tab View Content */}
        <div className="p-10 sm:p-14 flex-1 relative bg-gradient-to-b from-transparent to-[var(--bg-secondary)]/10">
          {activeTab === 'lessons' && (
            <div className="space-y-12 animate-fade-in-up">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
                <div className="space-y-1">
                  <h2 className="text-3xl font-black text-[var(--text-primary)] tracking-tight italic">{t('course_academic_modules_title')}</h2>
                  <p className="text-[var(--text-secondary)] font-medium opacity-70">{t('course_academic_modules_sub')}</p>
                </div>
                {isInstructorOrAdmin && (
                  <button 
                    onClick={handleAddLesson} 
                    className="btn-primary !px-10 !py-5 text-[10px] uppercase tracking-widest group"
                  >
                    <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                    {t('course_add_lesson')}
                  </button>
                )}
              </div>

              <div className="grid gap-6">
                {lessons.length === 0 ? (
                  <div className="py-32 flex flex-col items-center justify-center text-center glass-card border-dashed border-2 bg-white/5">
                    <BookOpen className="h-24 w-24 text-[var(--text-secondary)] opacity-10 mb-8" />
                    <p className="text-[var(--text-primary)] font-black uppercase tracking-widest text-sm">{t('course_lessons_empty')}</p>
                    <p className="text-[var(--text-secondary)] text-sm mt-3 font-medium italic opacity-60">{t('course_lessons_empty_sub')}</p>
                  </div>
                ) : (
                  lessons.map((lesson, index) => (
                    <div
                      key={lesson.lesson_id}
                      onClick={() => navigate(`/course/${courseid}/lesson/${lesson.lesson_id}`)}
                      className={`animate-fade-in-up stagger-${(index % 4) + 1}`}
                    >
                        <div className="group insta-card p-8 flex items-center justify-between cursor-pointer border-transparent hover:border-[var(--accent-primary)]/20 active:scale-[0.99] transition-all">
                        <div className="flex items-center gap-10">
                            <div className="h-16 w-16 rounded-[1.5rem] bg-[var(--text-primary)] flex items-center justify-center text-[var(--bg-primary)] font-black text-2xl group-hover:bg-[var(--accent-primary)] transition-all duration-500 shadow-2xl shadow-black/10">
                            {index + 1}
                            </div>
                            <div className="space-y-1.5">
                            <h3 className="text-2xl font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors leading-tight">{lesson.title}</h3>
                            <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-[0.2em] font-black opacity-40">{t('course_section_module')} {(index + 1).toString().padStart(2, '0')}</p>
                            </div>
                        </div>
                        <div className="h-14 w-14 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-secondary)] group-hover:bg-[var(--accent-primary)] group-hover:text-white transition-all duration-500 shadow-inner">
                            <ChevronRight className="h-7 w-7 group-hover:translate-x-1.5 transition-transform" />
                        </div>
                        </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'assignments' && (
            <div className="space-y-12 animate-fade-in-up">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
                <div className="space-y-1">
                  <h2 className="text-3xl font-black text-[var(--text-primary)] tracking-tight italic">{t('course_assignments_title')}</h2>
                  <p className="text-[var(--text-secondary)] font-medium opacity-70">{t('course_assignments_sub')}</p>
                </div>
                {isInstructorOrAdmin && (
                  <button 
                    onClick={() => setIsAssignmentModalOpen(true)} 
                    className="btn-primary !px-10 !py-5 text-[10px] uppercase tracking-widest group"
                  >
                    <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                    {t('course_add_assignment')}
                  </button>
                )}
              </div>

              <div className="grid gap-6">
                {assignments.length === 0 ? (
                  <div className="py-32 flex flex-col items-center justify-center text-center glass-card border-dashed border-2 bg-white/5">
                    <FileText className="h-24 w-24 text-[var(--text-secondary)] opacity-10 mb-8" />
                    <p className="text-[var(--text-primary)] font-black uppercase tracking-widest text-sm">{t('course_assignments_empty')}</p>
                    <p className="text-[var(--text-secondary)] text-sm mt-3 font-medium italic opacity-60">{t('course_assignments_empty_sub')}</p>
                  </div>
                ) : (
                  assignments.map((assignment, index) => (
                    <div
                      key={assignment.id}
                      onClick={() => navigateToAssignment(assignment.id)}
                      className={`animate-fade-in-up stagger-${(index % 4) + 1}`}
                    >
                        <div className="group insta-card p-8 flex items-center justify-between cursor-pointer border-transparent hover:border-[var(--accent-primary)]/20 active:scale-[0.99] transition-all">
                        <div className="flex items-center gap-10">
                            <div className="h-16 w-16 rounded-[1.5rem] bg-[var(--accent-primary)]/10 flex items-center justify-center text-[var(--accent-primary)] shadow-inner border border-[var(--accent-primary)]/10 group-hover:bg-[var(--accent-primary)] group-hover:text-white transition-all duration-500">
                            <FileText className="h-8 w-8" />
                            </div>
                            <div className="space-y-3">
                            <h3 className="text-2xl font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors leading-tight">{assignment.title}</h3>
                            <div className="flex flex-wrap items-center gap-6">
                                <span className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest flex items-center gap-2.5 opacity-60">
                                <Calendar className="h-4 w-4 opacity-40" />
                                {t('course_assignment_provisioned')}: {new Date(assignment.created_at).toLocaleDateString()}
                                </span>
                                {assignment.due_date && (
                                <span className="text-[10px] text-rose-500 font-black uppercase tracking-widest flex items-center gap-2.5 bg-rose-500/5 px-4 py-1.5 rounded-2xl border border-rose-500/10 shadow-sm">
                                    <Clock className="h-4 w-4" />
                                    {t('course_assignment_due')}: {new Date(assignment.due_date).toLocaleDateString()}
                                </span>
                                )}
                            </div>
                            </div>
                        </div>
                        <div className="h-14 w-14 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-secondary)] group-hover:bg-[var(--accent-primary)] group-hover:text-white transition-all duration-500 shadow-inner">
                            <ChevronRight className="h-7 w-7 group-hover:translate-x-1.5 transition-transform" />
                        </div>
                        </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Assignment Creation Modal */}
      {isAssignmentModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-fade-in">
          <div className="glass-card p-12 md:p-16 w-full max-w-3xl max-h-[92vh] shadow-[0_0_100px_rgba(0,0,0,0.5)] relative overflow-hidden animate-in zoom-in-95 duration-300 border border-white/10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent-primary)] opacity-[0.05] rounded-full -mr-32 -mt-32" />
            
            <button 
              onClick={() => setIsAssignmentModalOpen(false)}
              className="absolute right-12 top-12 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all transform hover:rotate-90 duration-300 z-20"
            >
              <X className="h-8 w-8" />
            </button>

            <div className="mb-14 relative z-10">
              <h3 className="text-4xl font-black text-[var(--text-primary)] mb-4 tracking-tighter leading-none italic">{t('course_assignment_modal_title')}</h3>
              <p className="text-[var(--text-secondary)] font-medium text-lg opacity-80">{t('course_assignment_modal_sub')}</p>
            </div>

            <form onSubmit={handleCreateAssignment} className="space-y-10 relative z-10">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] ml-1 opacity-50">{t('course_assignment_label_title')}</label>
                <input
                  type="text"
                  value={newAssignment.title}
                  onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                  placeholder={t('course_assignment_placeholder_title')}
                  className="w-full px-8 py-6 rounded-[2rem] border border-[var(--border-color)] bg-[var(--bg-primary)]/50 focus:bg-[var(--bg-primary)] focus:ring-4 focus:ring-[var(--accent-primary)]/10 outline-none transition-all text-[var(--text-primary)] font-bold placeholder:text-[var(--text-secondary)]/20 shadow-inner"
                  required
                />
              </div>
              
              <div className="space-y-4">
                <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] ml-1 opacity-50">{t('course_assignment_label_desc')}</label>
                <textarea
                  value={newAssignment.description}
                  onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                  placeholder={t('course_assignment_placeholder_desc')}
                  className="w-full h-44 px-8 py-6 rounded-[2rem] border border-[var(--border-color)] bg-[var(--bg-primary)]/50 focus:bg-[var(--bg-primary)] focus:ring-4 focus:ring-[var(--accent-primary)]/10 outline-none transition-all text-[var(--text-primary)] font-medium placeholder:text-[var(--text-secondary)]/20 resize-none leading-relaxed shadow-inner"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] ml-1 opacity-50">{t('course_assignment_label_due')}</label>
                  <input
                    type="datetime-local"
                    value={newAssignment.due_date}
                    onChange={(e) => setNewAssignment({ ...newAssignment, due_date: e.target.value })}
                    className="w-full px-8 py-6 rounded-[2rem] border border-[var(--border-color)] bg-[var(--bg-primary)]/50 focus:bg-[var(--bg-primary)] focus:ring-4 focus:ring-[var(--accent-primary)]/10 outline-none transition-all text-[var(--text-primary)] font-bold shadow-inner"
                  />
                </div>
                
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] ml-1 opacity-50">{t('course_assignment_label_file')}</label>
                  <div className="relative group cursor-pointer h-[74px]">
                    <input
                      type="file"
                      onChange={(e) => setNewAssignment({ ...newAssignment, file: e.target.files[0] })}
                      className="absolute inset-0 opacity-0 z-10 cursor-pointer"
                    />
                    <div className="w-full h-full px-8 rounded-[2rem] border-2 border-dashed border-[var(--border-color)] bg-[var(--bg-primary)]/20 group-hover:bg-[var(--bg-primary)]/40 group-hover:border-[var(--accent-primary)]/40 transition-all flex items-center justify-center gap-4 shadow-sm">
                      <Upload className="h-6 w-6 text-[var(--text-secondary)] group-hover:text-[var(--accent-primary)] transition-colors" />
                      <span className="text-[10px] font-black text-[var(--text-secondary)] truncate group-hover:text-[var(--text-primary)] transition-colors uppercase tracking-[0.2em]">
                        {newAssignment.file ? newAssignment.file.name : t('course_assignment_attach_file')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-8 pt-10">
                <button
                  type="button"
                  onClick={() => setIsAssignmentModalOpen(false)}
                  className="flex-1 py-6 rounded-[2rem] bg-[var(--bg-secondary)] text-[var(--text-primary)] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[var(--border-color)] transition-all active:scale-[0.98] shadow-sm"
                >
                  {t('course_assignment_discard')}
                </button>
                <button
                  type="submit"
                  className="flex-[2] py-6 rounded-[2rem] bg-[var(--text-primary)] text-[var(--bg-primary)] font-black text-[10px] uppercase tracking-[0.2em] hover:opacity-95 transition-all shadow-2xl active:scale-[0.98] flex items-center justify-center gap-4"
                >
                  <Plus className="h-5 w-5" />
                  {t('course_assignment_publish')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
