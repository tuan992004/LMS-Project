import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, BookOpen, ArrowLeft, ChevronRight } from "lucide-react";
import { courseService } from "../../service/courseService";
import { toast } from "sonner";

export const CourseLayout = () => {
  const { courseid } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState({ title: "", description: "", id: courseid });
  const [lessons, setLessons] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const lessonsData = await courseService.getCourseContent(courseid);
        setLessons(lessonsData);

        if (lessonsData.length > 0 && lessonsData[0].course_title) {
          setCourse(prev => ({ ...prev, title: lessonsData[0].course_title }));
        }
      } catch (e) {
        toast.error("Lỗi tải danh sách bài học");
      }
    };
    fetchData();
  }, [courseid]);

  const handleAddLesson = () => {
    navigate(`/course/${courseid}/lesson/new`);
  };

  return (
    <div style={containerStyle}>
      <button onClick={() => navigate(-1)} style={backBtnStyle}>
        <ArrowLeft size={18} color="black" /> Quay lại
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

      <hr style={{ margin: '2rem 0', border: '0.5px solid black' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'black' }}>Nội dung bài học</h2>
        <button onClick={handleAddLesson} style={addBtnStyle}>
          <Plus size={18} /> Thêm bài học mới
        </button>
      </div>

      <div style={lessonContainerStyle}>
        {lessons.length === 0 ? (
          <div style={emptyStyle}>Chưa có bài học nào. Hãy nhấn nút thêm để bắt đầu.</div>
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
  color: 'black', 
  border: '2px dashed black', 
  borderRadius: '1rem' 
};