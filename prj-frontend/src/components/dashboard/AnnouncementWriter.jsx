import { useState, useRef } from 'react';
import { api } from '../../lib/axios';
import { toast } from 'sonner';
import { Send, Loader2, Sparkles, AlertCircle, Paperclip, X, FileText } from 'lucide-react';
import { useAuthStore } from '../../stores/userAuthStore';
import { useTranslation } from '../../hooks/useTranslation';

export const AnnouncementWriter = ({ onPublished }) => {
    const { user } = useAuthStore();
    const { t } = useTranslation();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [file, setFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef(null);

    const isAdmin = user?.role === 'admin';

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
        }
    };

    const removeFile = () => {
        setFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handlePublish = async (e) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) return;

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('content', content);
            if (file) {
                formData.append('file', file);
            }

            const res = await api.post('/announcements', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            toast.success(res.data.message);
            setTitle('');
            setContent('');
            setFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            
            if (onPublished) onPublished();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to publish announcement");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="insta-card p-8 md:p-12 relative overflow-hidden group border-none shadow-[0_50px_100px_-20px_rgba(0,0,0,0.2)] bg-[var(--bg-secondary)]/50 backdrop-blur-xl">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Sparkles className="h-20 w-20 text-[var(--accent-primary)]" />
            </div>
            
            <div className="relative z-10">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--accent-primary)] mb-8 flex items-center gap-3">
                    <Send className="h-4 w-4" /> 
                    {isAdmin ? "Publish Global Directive" : "Propose Academic Announcement"}
                </h3>

                <form onSubmit={handlePublish} className="space-y-6">
                    <div className="space-y-2">
                        <input 
                            type="text" 
                            placeholder="Announcement Title..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-transparent border-b border-[var(--border-color)] py-4 text-2xl font-black italic outline-none focus:border-[var(--accent-primary)] transition-all placeholder:opacity-20"
                            required
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <textarea 
                            placeholder="Compose your message here..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows="4"
                            className="w-full bg-white/5 border border-[var(--border-color)] rounded-2xl p-6 text-sm font-medium outline-none focus:border-[var(--accent-primary)] focus:ring-4 focus:ring-[var(--accent-primary)]/5 transition-all placeholder:opacity-20 resize-none"
                            required
                        />
                    </div>

                    {/* File Upload Section */}
                    <div className="space-y-4">
                        <input 
                            type="file" 
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept=".doc,.docx,.xls,.xlsx,.pdf"
                        />
                        
                        {!file ? (
                            <button 
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center gap-3 px-6 py-4 rounded-xl border-2 border-dashed border-[var(--border-color)]/30 bg-[var(--accent-primary)]/[0.02] hover:border-[var(--accent-primary)]/50 transition-all group/upload"
                            >
                                <Paperclip className="h-4 w-4 text-[var(--text-secondary)] opacity-40 group-hover/upload:text-[var(--accent-primary)] group-hover/upload:opacity-100 transition-all" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-40 group-hover/upload:opacity-100 group-hover/upload:text-[var(--text-primary)]">
                                    Attach Protocol Documents (.docx, .xlsx, .pdf)
                                </span>
                            </button>
                        ) : (
                            <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--text-primary)]/5 border border-[var(--accent-primary)]/20 animate-fade-in">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-[var(--accent-primary)]/10 flex items-center justify-center text-[var(--accent-primary)]">
                                        <FileText className="h-4 w-4" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-[var(--text-primary)] truncate max-w-[200px]">{file.name}</span>
                                        <span className="text-[9px] font-black uppercase opacity-40 tracking-widest">{(file.size / 1024).toFixed(1)} KB</span>
                                    </div>
                                </div>
                                <button 
                                    type="button"
                                    onClick={removeFile}
                                    className="p-2 hover:bg-rose-500/10 hover:text-rose-500 rounded-lg transition-all"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        )}
                    </div>

                    {!isAdmin && (
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-widest">
                            <AlertCircle className="h-4 w-4" />
                            Note: Your announcement will require administrative verification before broadcast.
                        </div>
                    )}

                    <div className="flex justify-end pt-4">
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className={`
                                flex items-center gap-3 px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-xl
                                ${isAdmin 
                                    ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] hover:bg-[var(--accent-primary)] hover:text-white shadow-[var(--accent-primary)]/20' 
                                    : 'bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border-color)] hover:border-[var(--accent-primary)]/50'}
                            `}
                        >
                            {isSubmitting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="h-4 w-4" />
                            )}
                            {isAdmin ? "Execute Broadcast" : "Submit for Protocol"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
