import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, BookOpen, ArrowLeft, ChevronRight, FileText, Calendar } from "lucide-react";
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

  // Assignment Modal
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [newAssignment, setNewAssignment] = useState({ title: '', description: '', due_date: '', file: null });

  const fetchData = async () => {
    try {
      // Fetch Content (Lessons)
      const lessonsData = await courseService.getCourseContent(courseid);
      setLessons(lessonsData);

      if (lessonsData.length > 0 && lessonsData[0].course_title) {
        setCourse(prev => ({ ...prev, title: lessonsData[0].course_title }));
      }

      // Fetch Assignments
      const assignRes = await api.get(`/assignments/course/${courseid}`);
      setAssignments(assignRes.data);
    } catch (e) {
      toast.error("Lỗi tải dữ liệu khóa học");
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
         toast.error("Vui lòng nhập tiêu đề bài tập");
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

         toast.success("Tạo bài tập thành công");
         setIsAssignmentModalOpen(false);
         setNewAssignment({ title: '', description: '', due_date: '', file: null });
         fetchData();
     } catch (e) {
         toast.error("Lỗi khi tạo bài tập");
     }
  };

  const isInstructorOrAdmin = user?.role === 'admin' || user?.role === 'instructor';

  const navigateToAssignment = (id) => {
      if (user?.role === 'student') navigate(`/student/assignment/${id}`);
      else if (user?.role === 'admin') navigate(`/admin/assignment/${id}`);
      else navigate(`/instructor/course/${courseid}/assignment/${id}`);
  };

  return (
    <div style={containerStyle}>
      <button 
        onClick={() => {
            if (user?.role === 'admin') navigate('/admin/courses');
            else if (user?.role === 'student') navigate('/student/courses');
            else navigate('/instructor/courses');
        }} 
        style={backBtnStyle}
      >
        <ArrowLeft size={18} color="black" /> Quay lại danh sách
      </button>
      
      <section style={infoSectionStyle}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'black' }}>
          {course.title || "Tên khóa học"}
        </h1>
        <p style={{ color: 'black' }}>ID: <strong>{courseid}</strong></p>
        <p style={{ marginTop: '1rem', lineHeight: '1.6', color: 'black' }}>
          {course.description || "Mô tả khóa học sẽ hiển thị ở đây..."}
        </p>
      </section>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', borderBottom: '2px solid #e5e7eb' }}>
          <button 
              onClick={() => setActiveTab('lessons')}
              style={{ ...tabStyle, borderBottom: activeTab === 'lessons' ? '3px solid black' : '3px solid transparent', fontWeight: activeTab === 'lessons' ? 'bold' : 'normal', color: activeTab === 'lessons' ? 'black' : '#6b7280' }}
          >
              <BookOpen size={20} /> Bài học
          </button>
          <button 
              onClick={() => setActiveTab('assignments')}
              style={{ ...tabStyle, borderBottom: activeTab === 'assignments' ? '3px solid black' : '3px solid transparent', fontWeight: activeTab === 'assignments' ? 'bold' : 'normal', color: activeTab === 'assignments' ? 'black' : '#6b7280' }}
          >
              <FileText size={20} /> Bài tập
          </button>
      </div>

      <div style={{ paddingTop: '2rem' }}>
          {activeTab === 'lessons' && (
              <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'black' }}>Nội dung bài học</h2>
                    {isInstructorOrAdmin && (
                        <button onClick={handleAddLesson} style={addBtnStyle}>
                          <Plus size={18} /> Thêm bài học mới
                        </button>
                    )}
                  </div>

                  <div style={lessonContainerStyle}>
                    {lessons.length === 0 ? (
                      <div style={emptyStyle}>Chưa có bài học nào.</div>
                    ) : (
                      lessons.map((lesson, index) => (
                        <div 
                          key={lesson.lesson_id} 
                          style={lessonItemStyle}
                          onClick={() => navigate(`/course/${courseid}/lesson/${lesson.lesson_id}`)}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'black' }}>
                            <BookOpen size={20} color="black" />
                            <span style={{ fontWeight: '500' }}>Bài {index + 1}: {lesson.title}</span>
                          </div>
                          <ChevronRight size={20} color="black" />
                        </div>
                      ))
                    )}
                  </div>
              </>
          )}

          {activeTab === 'assignments' && (
              <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'black' }}>Danh sách bài tập</h2>
                    {isInstructorOrAdmin && (
                        <button onClick={() => setIsAssignmentModalOpen(true)} style={addBtnStyle}>
                          <Plus size={18} /> Tạo bài tập
                        </button>
                    )}
                  </div>

                  <div style={lessonContainerStyle}>
                    {assignments.length === 0 ? (
                      <div style={emptyStyle}>Chưa có bài tập nào cho khóa học này.</div>
                    ) : (
                      assignments.map((assignment) => (
                        <div 
                          key={assignment.id} 
                          style={lessonItemStyle}
                          onClick={() => navigateToAssignment(assignment.id)}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0fdf4'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'black' }}>
                            <FileText size={20} color="#059669" />
                            <div>
                                <span style={{ fontWeight: 'bold', display: 'block', fontSize: '1.1rem' }}>{assignment.title}</span>
                                <span style={{ fontSize: '0.85rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                                    <Calendar size={14} /> Created: {new Date(assignment.created_at).toLocaleDateString()}
                                </span>
                            </div>
                          </div>
                          
                          <ChevronRight size={20} color="black" />
                        </div>
                      ))
                    )}
                  </div>
              </>
          )}
      </div>

      {/* Assignment Creation Modal */}
      {isAssignmentModalOpen && (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', width: '100%', maxWidth: '500px' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Tạo bài tập mới</h3>
                <form onSubmit={handleCreateAssignment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Tiêu đề</label>
                        <input
                            type="text"
                            value={newAssignment.title}
                            onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db' }}
                            required
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Mô tả</label>
                        <textarea
                            value={newAssignment.description}
                            onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db', height: '100px', resize: 'vertical' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Hạn nộp (Không bắt buộc)</label>
                        <input
                            type="datetime-local"
                            value={newAssignment.due_date}
                            onChange={(e) => setNewAssignment({ ...newAssignment, due_date: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Tài liệu đính kèm (Không bắt buộc)</label>
                        <input
                            type="file"
                            onChange={(e) => setNewAssignment({ ...newAssignment, file: e.target.files[0] })}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db', backgroundColor: '#f9fafb' }}
                        />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                        <button
                            type="button"
                            onClick={() => setIsAssignmentModalOpen(false)}
                            style={{ padding: '0.75rem 1.5rem', borderRadius: '0.5rem', backgroundColor: '#f3f4f6', color: '#1f2937', fontWeight: 600, border: 'none', cursor: 'pointer' }}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            style={{ padding: '0.75rem 1.5rem', borderRadius: '0.5rem', backgroundColor: 'black', color: 'white', fontWeight: 600, border: 'none', cursor: 'pointer' }}
                        >
                            Tạo bài tập
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

    </div>
  );
};

// --- Styles ---
const containerStyle = { padding: '2rem', maxWidth: '900px', margin: '0 auto', color: 'black' };

const infoSectionStyle = { 
  backgroundColor: 'white', 
  padding: '2rem', 
  borderRadius: '1rem', 
  border: '1px solid black' 
};

const tabStyle = {
  background: 'none',
  border: 'none',
  padding: '1rem 2rem',
  fontSize: '1.1rem',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  transition: 'all 0.2s ease'
};

const addBtnStyle = { 
  display: 'flex', 
  alignItems: 'center', 
  gap: '0.5rem', 
  backgroundColor: 'black', 
  color: 'white', 
  padding: '0.6rem 1.2rem', 
  borderRadius: '0.5rem', 
  border: 'none', 
  cursor: 'pointer',
  fontWeight: 'bold'
};

const lessonContainerStyle = { display: 'flex', flexDirection: 'column', gap: '0.75rem' };

const lessonItemStyle = { 
  display: 'flex', 
  justifyContent: 'space-between', 
  alignItems: 'center', 
  padding: '1.25rem 1.5rem', 
  backgroundColor: 'white', 
  borderRadius: '0.75rem', 
  border: '1px solid black',
  cursor: 'pointer',
  transition: 'all 0.2s ease'
};

const backBtnStyle = { 
  background: 'none', 
  border: 'none', 
  cursor: 'pointer', 
  display: 'flex', 
  alignItems: 'center', 
  gap: '0.5rem', 
  marginBottom: '1rem', 
  color: 'black',
  fontWeight: 'bold'
};

const emptyStyle = { 
  textAlign: 'center', 
  padding: '3rem', 
  color: '#6b7280', 
  border: '2px dashed #d1d5db', 
  borderRadius: '1rem',
  backgroundColor: '#f9fafb'
};