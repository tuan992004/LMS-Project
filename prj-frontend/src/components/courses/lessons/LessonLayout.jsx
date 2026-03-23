import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, Video, Image, Type, Trash2, Save, X, ArrowLeft } from "lucide-react";
import { courseService } from "../../../service/courseService";
import { api } from "../../../lib/axios";
import { toast } from "sonner";
import { useAuthStore } from "../../../stores/userAuthStore";

export const LessonLayout = () => {
  const { courseid, lessonid } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isEditMode, setIsEditMode] = useState(false);
  const [title, setTitle] = useState("Bài học chưa đặt tên");
  const [loading, setLoading] = useState(true);
  const [blocks, setBlocks] = useState([]);

  const listPath = user?.role === 'admin' ? `/admin/lessons/${courseid}` : `/instructor/lessons/${courseid}`;

  const goBack = () => navigate(listPath, { replace: true });

  useEffect(() => {
    const fetchLessonDetail = async () => {
      if (!lessonid || lessonid === "new") {
        setBlocks([{ id: Date.now(), type: 'text', value: '', file: null }]);
        setLoading(false);
        setIsEditMode(true);
        return;
      }

      try {
        const res = await api.get(`courses/lessons/detail/${lessonid}`);
        const lesson = res.data;
        setTitle(lesson.title);
        
        const contentData = typeof lesson.content === 'string' ? JSON.parse(lesson.content) : lesson.content;
        const loadedBlocks = contentData.map((b, index) => ({
          id: index,
          type: b.type,
          value: b.value,
          file: null
        }));
        
        setBlocks(loadedBlocks);
      } catch (error) {
        toast.error("Không thể tải nội dung bài học");
      } finally {
        setLoading(false);
      }
    };

    fetchLessonDetail();
  }, [lessonid]);

  const addBlock = (type) => {
    setBlocks([...blocks, { id: Date.now(), type, value: '', file: null }]);
  };

  const updateBlock = (id, newValue, file = null) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, value: newValue, file } : b));
  };

  const deleteBlock = (id) => {
    setBlocks(blocks.filter(b => b.id !== id));
  };

  const handleSave = async () => {
    const formData = new FormData();
    formData.append("course_id", courseid);
    if (lessonid !== "new") formData.append("lesson_id", lessonid);
    formData.append("title", title);
    
    const contentStructure = blocks.map((block, index) => {
      if ((block.type === 'video' || block.type === 'image') && block.file) {
        const fileKey = `file_${index}`;
        formData.append(fileKey, block.file);
        return { type: block.type, fileKey };
      }
      return { type: block.type, value: block.value };
    });

    formData.append("content", JSON.stringify(contentStructure));

    try {
      const response = await courseService.upsertLesson(formData);
      toast.success(response.message);
      setIsEditMode(false);
      
      if (lessonid === "new") {
         navigate(listPath, { replace: true });
      }
    } catch (error) {
      toast.error("Lỗi khi lưu bài học");
    }
  };

  const handleCancel = () => {
      if (lessonid === "new") goBack();
      else setIsEditMode(false);
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '5rem', color: 'black' }}>Đang tải nội dung...</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', paddingBottom: '100px', color: 'black' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', alignItems: 'center' }}>
        <button onClick={goBack} style={backBtnStyle}>
           <ArrowLeft size={18} color="black" /> Back to Lessons
        </button>
        {!isEditMode && (
          <button onClick={() => setIsEditMode(true)} style={btnPrimary}>
            Chỉnh sửa nội dung
          </button>
        )}
      </div>

      <div style={lessonCard}>
        <input 
          disabled={!isEditMode}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{...titleInput, borderBottom: isEditMode ? '2px solid black' : 'none'}}
          placeholder="Nhập tiêu đề bài học..."
        />

        <div style={{ marginTop: '2rem' }}>
          {blocks.map((block) => (
            <div key={block.id} style={{ marginBottom: '1.5rem' }}>
              <div style={blockContainer}>
                {isEditMode && (
                  <button onClick={() => deleteBlock(block.id)} style={deleteBtn}>
                    <Trash2 size={14} color="black" />
                  </button>
                )}

                {block.type === 'text' && (
                  isEditMode ? 
                  <textarea 
                    value={block.value} 
                    onChange={(e) => updateBlock(block.id, e.target.value)} 
                    style={textAreaStyle} 
                    placeholder="Nhập nội dung văn bản..."
                  /> : <p style={{ lineHeight: '1.6', whiteSpace: 'pre-wrap', color: 'black' }}>{block.value}</p>
                )}

                {(block.type === 'video' || block.type === 'image') && (
                  <div style={mediaBox}>
                    {isEditMode ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {block.value && <span style={{fontSize: '12px', color: 'black', fontWeight: 'bold'}}>Đã có file từ trước</span>}
                        <input 
                          type="file" 
                          style={{ color: 'black' }}
                          accept={block.type === 'video' ? "video/*" : "image/*"}
                          onChange={(e) => updateBlock(block.id, block.value, e.target.files[0])}
                        />
                      </div>
                    ) : (
                      block.type === 'video' ? (
                        <video src={`${import.meta.env.VITE_API_URL}${block.value}`} controls style={mediaStyle} />
                      ) : (
                        <img src={`${import.meta.env.VITE_API_URL}${block.value}`} alt="Nội dung" style={mediaStyle} />
                      )
                    )}
                  </div>
                )}
              </div>
              <hr style={divider} />
            </div>
          ))}
        </div>

        {isEditMode && (
          <div style={toolbar}>
            <button onClick={() => addBlock('text')} style={toolBtn}><Type size={18} color="black"/> Thêm Text</button>
            <button onClick={() => addBlock('video')} style={toolBtn}><Video size={18} color="black"/> Thêm Video</button>
            <button onClick={() => addBlock('image')} style={toolBtn}><Image size={18} color="black"/> Thêm Ảnh</button>
          </div>
        )}
      </div>

      {isEditMode && (
        <div style={actionFooter}>
          <button onClick={handleCancel} style={btnSecondary}>Hủy bỏ</button>
          <button onClick={handleSave} style={btnBlack}><Save size={18} /> Lưu bài giảng</button>
        </div>
      )}
    </div>
  );
};

// --- Styles tối giản với tông màu Đen/Trắng ---
const lessonCard = { backgroundColor: 'white', padding: '2.5rem', borderRadius: '1rem', border: '1px solid black', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' };
const titleInput = { fontSize: '1.8rem', fontWeight: 'bold', border: 'none', width: '100%', outline: 'none', color: 'black', paddingBottom: '10px', backgroundColor: 'transparent' };
const blockContainer = { position: 'relative', padding: '1rem' };
const divider = { border: 'none', borderBottom: '1px solid black', margin: '1rem 0', opacity: 0.2 };
const textAreaStyle = { width: '100%', padding: '1rem', borderRadius: '0.5rem', border: '1px solid black', minHeight: '120px', fontFamily: 'inherit', color: 'black' };
const toolbar = { display: 'flex', gap: '1rem', justifyContent: 'center', padding: '1.5rem', marginTop: '2rem', border: '2px dashed black', borderRadius: '0.5rem', backgroundColor: '#f9f9f9' };
const toolBtn = { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', cursor: 'pointer', borderRadius: '0.5rem', border: '1px solid black', backgroundColor: 'white', fontWeight: 'bold', color: 'black' };
const deleteBtn = { position: 'absolute', top: '0', right: '0', backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '50%', padding: '6px', cursor: 'pointer', zIndex: 10 };
const actionFooter = { position: 'fixed', bottom: 0, left: 0, right: 0, padding: '1.5rem', backgroundColor: 'white', display: 'flex', justifyContent: 'center', gap: '2rem', borderTop: '1px solid black', zIndex: 100 };
const btnBlack = { backgroundColor: 'black', color: 'white', padding: '0.7rem 2.5rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid black' };
const btnSecondary = { backgroundColor: 'white', color: 'black', padding: '0.7rem 2.5rem', borderRadius: '0.5rem', cursor: 'pointer', border: '1px solid black', fontWeight: 'bold' };
const btnPrimary = { backgroundColor: 'black', color: 'white', padding: '0.6rem 1.2rem', borderRadius: '0.5rem', cursor: 'pointer', border: 'none', fontWeight: 'bold' };
const mediaBox = { padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem', textAlign: 'center', border: '1px solid black' };
const mediaStyle = { maxWidth: '100%', borderRadius: '8px', maxHeight: '450px', border: '1px solid black' };
const backBtnStyle = { border: '1px solid #d1d5db', backgroundColor: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#111827', fontWeight: '600', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' };