import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Plus, 
  Video, 
  Image as ImageIcon, 
  Type, 
  FileText,
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
import { useTranslation } from "../../../hooks/useTranslation";
import { ConfirmModal } from "../../shared/ConfirmModal";

export const LessonLayout = () => {
  const { t } = useTranslation();
  const { courseid, lessonid } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isEditMode, setIsEditMode] = useState(false);
  const [title, setTitle] = useState("Untitled Lesson");
  const [loading, setLoading] = useState(true);
  const [blocks, setBlocks] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const listPath = user?.role === 'admin' ? `/admin/lessons/${courseid}` : `/teacher/lessons/${courseid}`;

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
          value: typeof b.value === 'object' ? JSON.stringify(b.value) : b.value,
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
      if ((block.type === 'video' || block.type === 'image' || block.type === 'file') && block.file) {
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
      console.error("Save Error Details:", error.response?.data || error);
      const msg = error.response?.data?.message || "Failed to save lesson. File might be too large.";
      toast.error(msg);
    }
  };

  const handleCancel = () => {
      if (lessonid === "new") goBack();
      else setIsEditMode(false);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/courses/lessons/${lessonid}`);
      toast.success(t('alert_delete_lesson_success'));
      navigate(listPath, { replace: true });
    } catch (e) {
      toast.error(t('alert_error'));
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-[var(--text-secondary)]">
      <Loader2 className="h-12 w-12 animate-spin mb-4 text-[var(--accent-primary)]" />
      <p className="font-black uppercase tracking-widest text-xs animate-pulse">Loading lesson content...</p>
    </div>
  );

  return (
    <article className="max-w-5xl mx-auto pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Lesson Document Card */}
      <section className="glass-card p-10 md:p-16 shadow-2xl relative overflow-hidden" aria-labelledby="lesson-title">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[var(--accent-primary)] opacity-[0.02] rounded-full -mr-40 -mt-40 pointer-events-none transition-transform group-hover:scale-110" />
        
        <div className="relative z-10 space-y-16">
          {/* Header Actions */}
          <header className="flex items-center justify-between glass-nav p-4 rounded-3xl sticky top-28 z-30 shadow-xl border border-[var(--border-color)]">
            <button 
              onClick={goBack} 
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[var(--bg-primary)]/40 border border-[var(--border-color)] text-[var(--text-secondary)] font-black text-[10px] uppercase tracking-widest hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-all active:scale-95"
            >
               <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
               Back to Course
            </button>
            
            <div className="flex items-center gap-4">
              {!isEditMode && lessonid !== 'new' && (user?.role === 'admin' || user?.role === 'instructor') && (
                <button 
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="flex items-center gap-2 bg-rose-500/10 text-rose-500 border border-rose-500/20 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all active:scale-95"
                >
                  <Trash2 className="h-4 w-4" />
                  {t('user_delete')}
                </button>
              )}
              {!isEditMode && (user?.role === 'admin' || user?.role === 'instructor') && (
                <button 
                  onClick={() => setIsEditMode(true)} 
                  className="flex items-center gap-2 bg-[var(--text-primary)] text-[var(--bg-primary)] px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition-all active:scale-95"
                >
                  Edit Lesson Content
                </button>
              )}
            </div>
          </header>

          {/* Title Area */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent-primary)] bg-[var(--accent-primary)]/10 px-4 py-1.5 rounded-full border border-[var(--accent-primary)]/20 shadow-sm">
                Lesson Module
              </span>
            </div>
            <h1 id="lesson-title" className="sr-only">{title}</h1>
            <input 
              disabled={!isEditMode}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              aria-label={t?.('lesson_title_label') || "Lesson Title"}
              className={`
                w-full bg-transparent text-5xl sm:text-6xl font-black text-[var(--text-primary)] outline-none transition-all placeholder:text-[var(--text-secondary)]/20 leading-tight tracking-tighter
                ${isEditMode ? 'border-b-4 border-dashed border-[var(--border-color)] focus:border-[var(--accent-primary)]' : 'border-none'}
              `}
              placeholder="Give your lesson a name..."
            />
          </div>

          {/* Blocks Area */}
          <section className="space-y-16 relative" aria-label="Lesson Content Blocks">
            {blocks.map((block, index) => (
              <div key={block.id} className="group relative">
                <div className={`
                  relative rounded-[2.5rem] transition-all duration-500
                  ${isEditMode ? 'hover:bg-[var(--bg-primary)]/30 backdrop-blur-sm p-4 -m-4' : ''}
                `}>
                  {/* Block Controls */}
                  {isEditMode && (
                    <div className="absolute -left-12 top-0 bottom-0 flex flex-col items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <button onClick={() => moveBlock(index, -1)} className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] shadow-sm transition-all active:scale-90" title="Move Up">
                        <ChevronUp className="h-5 w-5" />
                      </button>
                      <div className="h-8 w-px bg-[var(--border-color)] opacity-40"></div>
                      <button onClick={() => moveBlock(index, 1)} className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] shadow-sm transition-all active:scale-90" title="Move Down">
                        <ChevronDown className="h-5 w-5" />
                      </button>
                    </div>
                  )}

                  {isEditMode && (
                    <button 
                      onClick={() => deleteBlock(block.id)} 
                      className="absolute -right-4 -top-4 h-12 w-12 bg-[var(--bg-primary)] border border-[var(--border-color)] text-rose-500 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-50 z-10 hover:scale-110 active:scale-90"
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
                        className="w-full bg-[var(--bg-primary)]/40 p-10 rounded-[2rem] border-2 border-transparent focus:border-[var(--accent-primary)] outline-none transition-all text-xl leading-relaxed text-[var(--text-primary)] min-h-[250px] font-medium shadow-inner placeholder:text-[var(--text-secondary)]/20 resize-none" 
                        placeholder="Share your expert knowledge here..."
                      /> : <p className="text-2xl leading-relaxed text-[var(--text-primary)] font-medium whitespace-pre-wrap">{block.value}</p>
                    )}

                    {(block.type === 'video' || block.type === 'image' || block.type === 'file') && (
                      <div className="space-y-6">
                        {isEditMode ? (
                          <div className="bg-[var(--bg-primary)]/30 border-2 border-dashed border-[var(--border-color)] rounded-[3rem] p-16 flex flex-col items-center justify-center gap-6 transition-all hover:border-[var(--accent-primary)]/50 hover:bg-[var(--bg-primary)]/40 group/media shadow-inner">
                            {block.value && (
                              <div className="relative max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-[var(--bg-primary)] group-hover/media:scale-[1.02] transition-transform duration-500">
                                {block.type === 'video' ? 
                                  <div className="bg-slate-900 aspect-video flex items-center justify-center text-[var(--bg-primary)]"><Video className="h-12 w-12 opacity-40" /></div> : 
                                  block.type === 'image' ?
                                  <img src={`${import.meta.env.VITE_API_URL}${block.value}`} className="w-full h-auto" /> :
                                  <div className="bg-[var(--bg-secondary)] aspect-square flex items-center justify-center text-[var(--text-primary)] px-8"><FileText className="h-12 w-12 opacity-40" /></div>
                                }
                                <div className="absolute inset-0 bg-[var(--text-primary)]/60 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover/media:opacity-100 transition-opacity text-center p-4">
                                  <p className="text-[var(--bg-primary)] font-black text-[10px] uppercase tracking-widest bg-[var(--text-primary)]/60 px-6 py-2 rounded-full border border-[var(--bg-primary)]/20">Replace {block.type}</p>
                                </div>
                              </div>
                            )}
                            <div className="flex flex-col items-center gap-4">
                              <div className="h-16 w-16 rounded-[1.5rem] bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)] group-hover/media:text-[var(--accent-primary)] group-hover/media:shadow-lg transition-all duration-300">
                                {block.type === 'video' ? <Video className="h-8 w-8" /> : block.type === 'image' ? <ImageIcon className="h-8 w-8" /> : <FileText className="h-8 w-8" />}
                              </div>
                              <div className="text-center">
                                <p className="text-sm font-black text-[var(--text-primary)] uppercase tracking-widest">Upload {block.type}</p>
                                <p className="text-[10px] text-[var(--text-secondary)] mt-1 font-bold">Recommended high quality files</p>
                              </div>
                              <input 
                                type="file" 
                                className="text-xs text-[var(--text-secondary)] cursor-pointer file:mr-4 file:py-3 file:px-8 file:rounded-2xl file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-widest file:bg-[var(--text-primary)] file:text-[var(--bg-primary)] hover:file:opacity-90 file:transition-all file:shadow-lg"
                                accept={block.type === 'video' ? "video/*" : block.type === 'image' ? "image/*" : "*/*"}
                                onChange={(e) => updateBlock(block.id, block.value, e.target.files[0])}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="rounded-[3rem] overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.15)] border-[12px] border-[var(--bg-primary)]/40">
                            {block.type === 'video' ? (
                              <video src={`${import.meta.env.VITE_API_URL}${block.value}`} controls className="w-full h-auto bg-black max-h-[700px]" />
                            ) : block.type === 'image' ? (
                              <img src={`${import.meta.env.VITE_API_URL}${block.value}`} alt="Lesson Module" className="w-full h-auto object-cover" />
                            ) : (
                              <div className="bg-[var(--bg-primary)]/30 p-12 flex items-center justify-between gap-6 group hover:bg-[var(--bg-primary)]/50 transition-all">
                                <div className="flex items-center gap-6">
                                  <div className="h-20 w-20 rounded-3xl bg-[var(--text-primary)] text-[var(--bg-primary)] flex items-center justify-center shadow-xl">
                                    <FileText className="h-10 w-10" />
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-lg font-black text-[var(--text-primary)] uppercase tracking-widest">Document Attachment</p>
                                    <p className="text-xs text-[var(--text-secondary)] font-medium">Click to download resource</p>
                                  </div>
                                </div>
                                <a 
                                  href={`${import.meta.env.VITE_API_URL}${block.value}`} 
                                  download
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-10 py-4 rounded-2xl bg-[var(--bg-secondary)] text-[var(--text-primary)] font-black text-[10px] uppercase tracking-widest hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-all shadow-sm"
                                >
                                  Download File
                                </a>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}


                  </div>
                </div>
              </div>
            ))}
          </section>

          {/* Builder Toolbar */}
          {isEditMode && (
            <div className="pt-20 mt-20 border-t-4 border-dashed border-[var(--border-color)]">
              <div className="flex flex-wrap items-center justify-center gap-6 p-10 bg-[var(--bg-primary)]/30 rounded-[3rem] border border-[var(--border-color)] backdrop-blur-md">
                <button 
                  onClick={() => addBlock('file')} 
                  className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] font-black text-[10px] uppercase tracking-widest hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-all active:scale-95"
                >
                  <FileText className="h-5 w-5" /> Add File
                </button>
                <button 
                  onClick={() => addBlock('text')} 
                  className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] font-black text-[10px] uppercase tracking-widest hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-all active:scale-95"
                >
                  <Type className="h-5 w-5" /> Add Description
                </button>
                <button 
                  onClick={() => addBlock('video')} 
                  className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] font-black text-[10px] uppercase tracking-widest hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-all active:scale-95"
                >
                  <Video className="h-5 w-5" /> Add Video
                </button>
                <button 
                  onClick={() => addBlock('image')} 
                  className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] font-black text-[10px] uppercase tracking-widest hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-all active:scale-95"
                >
                  <ImageIcon className="h-5 w-5" /> Add Picture
                </button>
              </div>
            </div>
          )}

          {/* Editor Footer Actions (Static Layout) */}
          {isEditMode && (
            <div className="flex flex-wrap items-center justify-center gap-6 mt-12 p-10 bg-[var(--bg-primary)]/30 rounded-[3rem] border border-[var(--border-color)] backdrop-blur-md">

              <button 
                onClick={handleSave} 
                className="flex items-center gap-3 bg-[var(--text-primary)] text-[var(--bg-primary)] px-12 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition-all active:scale-95"
              >
                <Save className="h-5 w-5" />
                Save Changes
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Confirmation Modal */}
      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={t('course_academic_module')}
        message={t('delete_lesson_confirm')}
        confirmText={t('user_delete')}
        variant="danger"
      />
    </article>
  );
};
