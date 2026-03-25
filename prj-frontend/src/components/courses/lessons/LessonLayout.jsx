import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Plus, 
  Video, 
  Image as ImageIcon, 
  Type, 
  Trash2, 
  Save, 
  X, 
  ArrowLeft,
  Loader2,
  GripVertical,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import { courseService } from "../../../service/courseService";
import { api } from "../../../lib/axios";
import { toast } from "sonner";
import { useAuthStore } from "../../../stores/userAuthStore";

export const LessonLayout = () => {
  const { courseid, lessonid } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isEditMode, setIsEditMode] = useState(false);
  const [title, setTitle] = useState("Untitled Lesson");
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
        toast.error("Failed to load lesson content");
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

  const moveBlock = (index, direction) => {
    if ((direction === -1 && index === 0) || (direction === 1 && index === blocks.length - 1)) return;
    const newBlocks = [...blocks];
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[index + direction];
    newBlocks[index + direction] = temp;
    setBlocks(newBlocks);
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
      toast.error("Failed to save lesson");
    }
  };

  const handleCancel = () => {
      if (lessonid === "new") goBack();
      else setIsEditMode(false);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-[var(--text-secondary)]">
      <Loader2 className="h-12 w-12 animate-spin mb-4 text-[var(--accent-primary)]" />
      <p className="font-black uppercase tracking-widest text-xs animate-pulse">Loading lesson content...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500 p-4 sm:p-0">
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-10 glass-nav p-4 rounded-3xl sticky top-24 z-30 shadow-xl border border-[var(--border-color)]">
        <button 
          onClick={goBack} 
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/40 border border-[var(--border-color)] text-[var(--text-secondary)] font-black text-[10px] uppercase tracking-widest hover:bg-[var(--text-primary)] hover:text-white transition-all shadow-sm group active:scale-95"
        >
           <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
           Back to Course
        </button>
        
        {!isEditMode && (user?.role === 'admin' || user?.role === 'instructor') && (
          <button 
            onClick={() => setIsEditMode(true)} 
            className="flex items-center gap-2 bg-[var(--text-primary)] text-[var(--bg-primary)] px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition-all shadow-xl active:scale-95"
          >
            Edit Lesson Content
          </button>
        )}
      </div>

      {/* Lesson Document Card */}
      <div className="glass-card p-10 md:p-16 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[var(--accent-primary)] opacity-[0.02] rounded-full -mr-40 -mt-40 pointer-events-none transition-transform group-hover:scale-110" />
        
        <div className="relative z-10 space-y-16">
          {/* Title Area */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent-primary)] bg-[var(--accent-primary)]/10 px-4 py-1.5 rounded-full border border-[var(--accent-primary)]/20 shadow-sm">
                Lesson Module
              </span>
            </div>
            <input 
              disabled={!isEditMode}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`
                w-full bg-transparent text-5xl sm:text-6xl font-black text-[var(--text-primary)] outline-none transition-all placeholder:text-[var(--text-secondary)]/20 leading-tight tracking-tighter
                ${isEditMode ? 'border-b-4 border-dashed border-[var(--border-color)] focus:border-[var(--accent-primary)]' : 'border-none'}
              `}
              placeholder="Give your lesson a name..."
            />
          </div>

          {/* Blocks Area */}
          <div className="space-y-16 relative">
            {blocks.map((block, index) => (
              <div key={block.id} className="group relative">
                <div className={`
                  relative rounded-[2.5rem] transition-all duration-500
                  ${isEditMode ? 'hover:bg-white/30 backdrop-blur-sm p-4 -m-4' : ''}
                `}>
                  {/* Block Controls */}
                  {isEditMode && (
                    <div className="absolute -left-12 top-0 bottom-0 flex flex-col items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <button onClick={() => moveBlock(index, -1)} className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:bg-white shadow-sm transition-all active:scale-90" title="Move Up">
                        <ChevronUp className="h-5 w-5" />
                      </button>
                      <div className="h-8 w-px bg-[var(--border-color)] opacity-40"></div>
                      <button onClick={() => moveBlock(index, 1)} className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:bg-white shadow-sm transition-all active:scale-90" title="Move Down">
                        <ChevronDown className="h-5 w-5" />
                      </button>
                    </div>
                  )}

                  {isEditMode && (
                    <button 
                      onClick={() => deleteBlock(block.id)} 
                      className="absolute -right-4 -top-4 h-12 w-12 bg-white border border-[var(--border-color)] text-rose-500 rounded-2xl flex items-center justify-center shadow-2xl opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-50 z-10 hover:scale-110 active:scale-90"
                    >
                      <Trash2 className="h-6 w-6" />
                    </button>
                  )}

                  {/* Block Content Renderer */}
                  <div className="p-2">
                    {block.type === 'text' && (
                      isEditMode ? 
                      <textarea 
                        value={block.value} 
                        onChange={(e) => updateBlock(block.id, e.target.value)} 
                        className="w-full bg-white/40 p-10 rounded-[2rem] border-2 border-transparent focus:border-[var(--accent-primary)] outline-none transition-all text-xl leading-relaxed text-[var(--text-primary)] min-h-[250px] font-medium shadow-inner placeholder:text-[var(--text-secondary)]/20 resize-none" 
                        placeholder="Share your expert knowledge here..."
                      /> : <p className="text-2xl leading-relaxed text-[var(--text-primary)] font-medium whitespace-pre-wrap">{block.value}</p>
                    )}

                    {(block.type === 'video' || block.type === 'image') && (
                      <div className="space-y-6">
                        {isEditMode ? (
                          <div className="bg-white/30 border-2 border-dashed border-[var(--border-color)] rounded-[3rem] p-16 flex flex-col items-center justify-center gap-6 transition-all hover:border-[var(--accent-primary)]/50 hover:bg-white/40 group/media shadow-inner">
                            {block.value && (
                              <div className="relative max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white group-hover/media:scale-[1.02] transition-transform duration-500">
                                {block.type === 'video' ? 
                                  <div className="bg-slate-900 aspect-video flex items-center justify-center text-white"><Video className="h-12 w-12 opacity-40" /></div> : 
                                  <img src={`${import.meta.env.VITE_API_URL}${block.value}`} className="w-full h-auto" />
                                }
                                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover/media:opacity-100 transition-opacity">
                                  <p className="text-white font-black text-[10px] uppercase tracking-widest bg-black/60 px-6 py-2 rounded-full border border-white/20">Thay thế tệp tin</p>
                                </div>
                              </div>
                            )}
                            <div className="flex flex-col items-center gap-4">
                              <div className="h-16 w-16 rounded-[1.5rem] bg-white border border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)] group-hover/media:text-[var(--accent-primary)] group-hover/media:shadow-lg transition-all duration-300">
                                {block.type === 'video' ? <Video className="h-8 w-8" /> : <ImageIcon className="h-8 w-8" />}
                              </div>
                              <div className="text-center">
                                <p className="text-sm font-black text-[var(--text-primary)] uppercase tracking-widest">Tải lên {block.type}</p>
                                <p className="text-[10px] text-[var(--text-secondary)] mt-1 font-bold">Recommended high quality files</p>
                              </div>
                              <input 
                                type="file" 
                                className="text-xs text-[var(--text-secondary)] cursor-pointer file:mr-4 file:py-3 file:px-8 file:rounded-2xl file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-widest file:bg-[var(--text-primary)] file:text-[var(--bg-primary)] hover:file:opacity-90 file:transition-all file:shadow-lg"
                                accept={block.type === 'video' ? "video/*" : "image/*"}
                                onChange={(e) => updateBlock(block.id, block.value, e.target.files[0])}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="rounded-[3rem] overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.15)] border-[12px] border-white/40">
                            {block.type === 'video' ? (
                              <video src={`${import.meta.env.VITE_API_URL}${block.value}`} controls className="w-full h-auto bg-black max-h-[700px]" />
                            ) : (
                              <img src={`${import.meta.env.VITE_API_URL}${block.value}`} alt="Lesson Module" className="w-full h-auto object-cover" />
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Builder Toolbar */}
          {isEditMode && (
            <div className="pt-20 mt-20 border-t-4 border-dashed border-[var(--border-color)] opacity-60">
              <div className="flex flex-wrap items-center justify-center gap-6 p-10 bg-white/30 rounded-[3rem] border border-[var(--border-color)] backdrop-blur-md">
                <button 
                  onClick={() => addBlock('text')} 
                  className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-white border border-[var(--border-color)] text-[var(--text-primary)] font-black text-[10px] uppercase tracking-widest hover:bg-[var(--text-primary)] hover:text-white transition-all shadow-sm active:scale-95"
                >
                  <Type className="h-5 w-5" /> Thêm Văn Bản
                </button>
                <button 
                  onClick={() => addBlock('video')} 
                  className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-white border border-[var(--border-color)] text-[var(--text-primary)] font-black text-[10px] uppercase tracking-widest hover:bg-[var(--text-primary)] hover:text-white transition-all shadow-sm active:scale-95"
                >
                  <Video className="h-5 w-5" /> Thêm Video
                </button>
                <button 
                  onClick={() => addBlock('image')} 
                  className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-white border border-[var(--border-color)] text-[var(--text-primary)] font-black text-[10px] uppercase tracking-widest hover:bg-[var(--text-primary)] hover:text-white transition-all shadow-sm active:scale-95"
                >
                  <ImageIcon className="h-5 w-5" /> Thêm Hình Ảnh
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Editor Footer Actions */}
      {isEditMode && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-white/70 backdrop-blur-2xl p-4 rounded-[2.5rem] border border-white/40 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] z-[100] animate-in slide-in-from-bottom-12 duration-700">
          <button 
            onClick={handleCancel} 
            className="px-10 py-4 rounded-2xl bg-[var(--bg-secondary)] text-[var(--text-primary)] font-black text-[10px] uppercase tracking-widest hover:opacity-80 transition-all active:scale-95 shadow-sm"
          >
            Cancel Edit
          </button>
          <button 
            onClick={handleSave} 
            className="flex items-center gap-3 bg-[var(--text-primary)] text-[var(--bg-primary)] px-12 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition-all shadow-2xl active:scale-95"
          >
            <Save className="h-5 w-5" />
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
};
