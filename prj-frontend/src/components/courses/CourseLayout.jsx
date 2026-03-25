import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Plus, 
  BookOpen, 
  ArrowLeft, 
  ChevronRight, 
  FileText, 
  Calendar,
  Clock,
  Info,
  Layout,
  Layers,
  X,
  Upload,
  Loader2
} from "lucide-react";
import { courseService } from "../../service/courseService";
import { api } from "../../lib/axios";
import { toast } from "sonner";
import { useAuthStore } from "../../stores/userAuthStore";

export const CourseLayout = () => {
  const { courseid } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
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
      toast.error("Failed to load course data");
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
      toast.error("Please enter an assignment title");
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

      toast.success("Assignment created successfully");
      setIsAssignmentModalOpen(false);
      setNewAssignment({ title: '', description: '', due_date: '', file: null });
      fetchData();
    } catch (e) {
      toast.error("Failed to create assignment");
    }
  };

  const isInstructorOrAdmin = user?.role === 'admin' || user?.role === 'instructor';

  const navigateToAssignment = (id) => {
    if (user?.role === 'student') navigate(`/student/assignment/${id}`);
    else if (user?.role === 'admin') navigate(`/admin/assignment/${id}`);
    else navigate(`/instructor/course/${courseid}/assignment/${id}`);
  };

  const getBackPath = () => {
    if (user?.role === 'admin') return '/admin/courses';
    if (user?.role === 'student') return '/student/courses';
    return '/instructor/courses';
  };

  if (loading && lessons.length === 0) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-[var(--accent-primary)] mb-4" />
        <p className="text-[var(--text-secondary)] font-bold animate-pulse">Loading course architecture...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 p-4 sm:p-0">
      {/* Top Header */}
      <div className="glass-card p-10 relative overflow-hidden group shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent-primary)] opacity-[0.03] rounded-full -mr-32 -mt-32 transition-transform group-hover:scale-110" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between gap-8">
          <div className="space-y-6 flex-1">
            <button
                onClick={() => navigate(getBackPath())}
                className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all text-[10px] font-black uppercase tracking-widest group/back"
            >
                <ArrowLeft className="h-4 w-4 group-hover/back:-translate-x-1 transition-transform" />
                Quay lại danh sách
            </button>
            
            <h1 className="text-5xl font-black text-[var(--text-primary)] tracking-tight leading-[1.1]">
                {course.title || "Chi tiết khóa học"}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 bg-[var(--bg-secondary)] px-4 py-2 rounded-2xl text-[var(--text-secondary)] font-bold text-[10px] uppercase tracking-widest border border-[var(--border-color)]">
                    <Layout className="h-3.5 w-3.5" />
                    ID: {courseid}
                </div>
                {lessons.length > 0 && (
                    <div className="flex items-center gap-2 bg-[var(--accent-primary)]/10 px-4 py-2 rounded-2xl text-[var(--accent-primary)] font-bold text-[10px] uppercase tracking-widest border border-[var(--accent-primary)]/20 shadow-sm">
                        <Layers className="h-3.5 w-3.5" />
                        {lessons.length} Bài học
                    </div>
                )}
            </div>
          </div>

          <div className="relative z-10 flex flex-col justify-end max-w-sm">
            <div className="bg-white/30 backdrop-blur-sm p-6 rounded-3xl border border-white/20 shadow-sm">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-2 flex items-center gap-2">
                    <Info className="h-3 w-3" /> Giới thiệu
                </h4>
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed line-clamp-4 font-medium italic">
                    {course.description || "Khóa học này cung cấp các kiến thức chuyên sâu và kỹ năng thực hành thực tế cho học viên."}
                </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="glass-card overflow-hidden min-h-[600px] flex flex-col shadow-2xl">
        {/* Navigation Tabs */}
        <div className="flex border-b border-[var(--border-color)] px-8 pt-6 bg-white/30 backdrop-blur-md">
          <button
            onClick={() => setActiveTab('lessons')}
            className={`
              flex items-center gap-3 px-8 py-5 transition-all duration-300 relative font-black text-[10px] uppercase tracking-widest
              ${activeTab === 'lessons' ? 'text-[var(--accent-primary)]' : 'text-[var(--text-secondary)] opacity-50 hover:opacity-100'}
            `}
          >
            <BookOpen className={`h-5 w-5 ${activeTab === 'lessons' ? 'text-[var(--accent-primary)]' : 'text-[var(--text-secondary)]'}`} />
            Nội dung bài học
            {activeTab === 'lessons' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--accent-primary)] rounded-t-full shadow-lg shadow-indigo-600/20" />}
          </button>
          <button
            onClick={() => setActiveTab('assignments')}
            className={`
              flex items-center gap-3 px-8 py-5 transition-all duration-300 relative font-black text-[10px] uppercase tracking-widest
              ${activeTab === 'assignments' ? 'text-[var(--accent-primary)]' : 'text-[var(--text-secondary)] opacity-50 hover:opacity-100'}
            `}
          >
            <FileText className={`h-5 w-5 ${activeTab === 'assignments' ? 'text-[var(--accent-primary)]' : 'text-[var(--text-secondary)]'}`} />
            Bài tập & Dự án
            {activeTab === 'assignments' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--accent-primary)] rounded-t-full shadow-lg shadow-indigo-600/20" />}
          </button>
        </div>

        {/* Tab View Content */}
        <div className="p-8 sm:p-12 flex-1 relative">
          {activeTab === 'lessons' && (
            <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                  <h2 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">Học phần đào tạo</h2>
                  <p className="text-[var(--text-secondary)] font-medium mt-1">Hoàn thành các bài học theo lộ trình để nắm vững kiến thức.</p>
                </div>
                {isInstructorOrAdmin && (
                  <button 
                    onClick={handleAddLesson} 
                    className="flex items-center gap-3 bg-[var(--text-primary)] text-[var(--bg-primary)] px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition-all shadow-xl active:scale-95 group"
                  >
                    <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform" />
                    Thêm bài học mới
                  </button>
                )}
              </div>

              <div className="grid gap-6">
                {lessons.length === 0 ? (
                  <div className="py-24 flex flex-col items-center justify-center text-center bg-white/20 rounded-[3rem] border-2 border-dashed border-[var(--border-color)]">
                    <BookOpen className="h-20 w-20 text-[var(--text-secondary)] opacity-10 mb-6" />
                    <p className="text-[var(--text-primary)] font-black uppercase tracking-widest text-sm">Chưa có bài học nào</p>
                    <p className="text-[var(--text-secondary)] text-sm mt-2 font-medium">Nội dung đang được biên soạn, vui lòng quay lại sau.</p>
                  </div>
                ) : (
                  lessons.map((lesson, index) => (
                    <div
                      key={lesson.lesson_id}
                      onClick={() => navigate(`/course/${courseid}/lesson/${lesson.lesson_id}`)}
                      className="group insta-card p-6 flex items-center justify-between cursor-pointer border-transparent hover:border-[var(--accent-primary)]/30 active:scale-[0.99] transition-all"
                    >
                      <div className="flex items-center gap-8">
                        <div className="h-14 w-14 rounded-2xl bg-[var(--text-primary)] flex items-center justify-center text-[var(--bg-primary)] font-black text-xl group-hover:bg-[var(--accent-primary)] transition-all shadow-lg shadow-black/10">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors leading-tight">{lesson.title}</h3>
                          <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-widest font-black opacity-40 mt-1">Lesson Module</p>
                        </div>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-secondary)] group-hover:bg-[var(--accent-primary)] group-hover:text-white transition-all duration-300 shadow-sm">
                        <ChevronRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'assignments' && (
            <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                  <h2 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">Cổng nộp bài tập</h2>
                  <p className="text-[var(--text-secondary)] font-medium mt-1">Thực hành thông qua các bài tập và dự án thực tế.</p>
                </div>
                {isInstructorOrAdmin && (
                  <button 
                    onClick={() => setIsAssignmentModalOpen(true)} 
                    className="flex items-center gap-3 bg-[var(--text-primary)] text-[var(--bg-primary)] px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition-all shadow-xl active:scale-95 group"
                  >
                    <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform" />
                    Tạo bài tập mới
                  </button>
                )}
              </div>

              <div className="grid gap-6">
                {assignments.length === 0 ? (
                  <div className="py-24 flex flex-col items-center justify-center text-center bg-white/20 rounded-[3rem] border-2 border-dashed border-[var(--border-color)]">
                    <FileText className="h-20 w-20 text-[var(--text-secondary)] opacity-10 mb-6" />
                    <p className="text-[var(--text-primary)] font-black uppercase tracking-widest text-sm">Chưa có bài tập nào</p>
                    <p className="text-[var(--text-secondary)] text-sm mt-2 font-medium">Bạn đã hoàn thành tất cả các yêu cầu hiện tại!</p>
                  </div>
                ) : (
                  assignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      onClick={() => navigateToAssignment(assignment.id)}
                      className="group insta-card p-6 flex items-center justify-between cursor-pointer border-transparent hover:border-[var(--accent-primary)]/30 active:scale-[0.99] transition-all"
                    >
                      <div className="flex items-center gap-8">
                        <div className="h-14 w-14 rounded-2xl bg-[var(--accent-primary)]/10 flex items-center justify-center text-[var(--accent-primary)] shadow-sm border border-[var(--accent-primary)]/20 group-hover:bg-[var(--accent-primary)] group-hover:text-white transition-all">
                          <FileText className="h-7 w-7" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-xl font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors leading-tight">{assignment.title}</h3>
                          <div className="flex flex-wrap items-center gap-4">
                            <span className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest flex items-center gap-2">
                              <Calendar className="h-3.5 w-3.5 opacity-40" />
                              Ngày tạo: {new Date(assignment.created_at).toLocaleDateString()}
                            </span>
                            {assignment.due_date && (
                              <span className="text-[10px] text-rose-500 font-black uppercase tracking-widest flex items-center gap-2 bg-rose-500/5 px-3 py-1 rounded-xl border border-rose-500/10">
                                <Clock className="h-3.5 w-3.5" />
                                Hạn nộp: {new Date(assignment.due_date).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-secondary)] group-hover:bg-[var(--accent-primary)] group-hover:text-white transition-all duration-300 shadow-sm">
                        <ChevronRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="glass-card p-10 md:p-14 w-full max-w-2xl max-h-[95vh] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsAssignmentModalOpen(false)}
              className="absolute right-10 top-10 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <X className="h-7 w-7" />
            </button>

            <div className="mb-12">
              <h3 className="text-4xl font-black text-[var(--text-primary)] mb-3 tracking-tight leading-none italic">New Project</h3>
              <p className="text-[var(--text-secondary)] font-medium">Thiết kế bài tập thực hành mới cho học viên của bạn.</p>
            </div>

            <form onSubmit={handleCreateAssignment} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">Tiêu đề bài tập</label>
                <input
                  type="text"
                  value={newAssignment.title}
                  onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                  placeholder="Ví dụ: Final Project Phase 1 - Database Schema"
                  className="w-full px-6 py-5 rounded-3xl border border-[var(--border-color)] bg-white/40 focus:bg-white/60 focus:ring-4 focus:ring-[var(--accent-primary)]/10 outline-none transition-all text-[var(--text-primary)] font-bold placeholder:text-[var(--text-secondary)]/30"
                  required
                />
              </div>
              
              <div className="space-y-3">
                <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">Yêu cầu chi tiết</label>
                <textarea
                  value={newAssignment.description}
                  onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                  placeholder="Mô tả các bước thực hiện, mục tiêu và tiêu chí đánh giá..."
                  className="w-full h-40 px-6 py-5 rounded-3xl border border-[var(--border-color)] bg-white/40 focus:bg-white/60 focus:ring-4 focus:ring-[var(--accent-primary)]/10 outline-none transition-all text-[var(--text-primary)] font-medium placeholder:text-[var(--text-secondary)]/30 resize-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">Hạn chót (Deadline)</label>
                  <input
                    type="datetime-local"
                    value={newAssignment.due_date}
                    onChange={(e) => setNewAssignment({ ...newAssignment, due_date: e.target.value })}
                    className="w-full px-6 py-5 rounded-3xl border border-[var(--border-color)] bg-white/40 focus:bg-white/60 focus:ring-4 focus:ring-[var(--accent-primary)]/10 outline-none transition-all text-[var(--text-primary)] font-bold"
                  />
                </div>
                
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">Tài liệu tham khảo</label>
                  <div className="relative group cursor-pointer h-[66px]">
                    <input
                      type="file"
                      onChange={(e) => setNewAssignment({ ...newAssignment, file: e.target.files[0] })}
                      className="absolute inset-0 opacity-0 z-10 cursor-pointer"
                    />
                    <div className="w-full h-full px-6 rounded-3xl border-2 border-dashed border-[var(--border-color)] bg-white/20 group-hover:bg-white/40 group-hover:border-[var(--accent-primary)]/50 transition-all flex items-center justify-center gap-3">
                      <Upload className="h-5 w-5 text-[var(--text-secondary)] group-hover:text-[var(--accent-primary)] transition-colors" />
                      <span className="text-xs font-black text-[var(--text-secondary)] truncate group-hover:text-[var(--text-primary)] transition-colors uppercase tracking-widest">
                        {newAssignment.file ? newAssignment.file.name : "Tải lên tài liệu"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-6 pt-8">
                <button
                  type="button"
                  onClick={() => setIsAssignmentModalOpen(false)}
                  className="flex-1 py-5 rounded-3xl bg-[var(--bg-secondary)] text-[var(--text-primary)] font-black text-[10px] uppercase tracking-widest hover:opacity-80 transition-all active:scale-95"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex-[2] py-5 rounded-3xl bg-[var(--text-primary)] text-[var(--bg-primary)] font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-3"
                >
                  <Plus className="h-5 w-5" />
                  Xuất bản bài tập
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
