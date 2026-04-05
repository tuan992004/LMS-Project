import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../lib/axios';
import { Megaphone, Calendar, User, ChevronLeft, Loader2, Bookmark, Share2 } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuthStore } from '../../stores/userAuthStore';

const AnnouncementDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { user } = useAuthStore();
    const [announcement, setAnnouncement] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchDetail = async () => {
        setLoading(true);
        try {
            // Depending on your backend, you might need a specific detail endpoint like /announcements/:id
            // If not available, we can fetch all and filter, but /announcements/:id is standard.
            const res = await api.get(`/announcements/${id}`);
            setAnnouncement(res.data);
        } catch (error) {
            console.error("Failed to fetch announcement detail", error);
            // Fallback: If detail endpoint doesn't exist yet, try finding in the list
            try {
                const listRes = await api.get('/announcements');
                const found = listRes.data.find(a => String(a.id) === String(id));
                if (found) setAnnouncement(found);
            } catch (e) {
                console.error(e);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetail();
    }, [id]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-[var(--accent-primary)] opacity-20" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--text-secondary)] animate-pulse">Decrypting Broadcast...</p>
            </div>
        );
    }

    if (!announcement) {
        return (
            <div className="max-w-4xl mx-auto py-32 text-center space-y-8 animate-fade-in-up">
                <div className="h-24 w-24 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto text-rose-500 ring-4 ring-rose-500/5">
                    <Bookmark className="h-8 w-8" />
                </div>
                <h2 className="text-3xl font-black italic tracking-tighter">Broadcast Not Found</h2>
                <p className="text-sm font-medium italic opacity-40 max-w-sm mx-auto leading-relaxed">The requested briefing may have been archived or retracted from the network.</p>
                <button 
                    onClick={() => navigate(-1)}
                    className="btn-monochrome px-12"
                >
                    Return to Portal
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pb-32 animate-fade-in-up">
            {/* Header / Meta */}
            <div className="space-y-12">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <button 
                        onClick={() => navigate(-1)}
                        className="h-12 w-12 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-primary)] border border-[var(--border-color)] shadow-sm hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-all active:scale-90 shrink-0"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    
                    <div className="flex items-center gap-4">
                        <button className="h-12 w-12 rounded-xl border border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] transition-all active:scale-95">
                            <Share2 className="h-5 w-5" />
                        </button>
                        <button className="h-12 w-12 rounded-xl bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] flex items-center justify-center border border-[var(--accent-primary)]/20 hover:scale-105 transition-all">
                            <Bookmark className="h-5 w-5" />
                        </button>
                    </div>
                </header>

                {/* Content Card */}
                <article className="insta-card p-12 md:p-20 relative overflow-hidden group border-none shadow-[0_50px_100px_-20px_rgba(0,0,0,0.2)] bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl">
                    <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                        <Megaphone className="h-32 w-32" />
                    </div>

                    <div className="relative z-10 space-y-12">
                        {/* Meta Tags */}
                        <div className="flex items-center gap-6">
                            <span className="px-4 py-2 bg-[var(--accent-primary)] text-[var(--bg-primary)] rounded-full text-[9px] font-black uppercase tracking-widest italic shadow-xl shadow-[var(--accent-primary)]/20">
                                Global Briefing
                            </span>
                            <div className="h-px w-12 bg-[var(--border-color)] opacity-20" />
                            <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-50 italic">
                                <span className="flex items-center gap-2"><User className="h-3 w-3" /> {announcement.author_name || announcement.author}</span>
                                <span className="flex items-center gap-2"><Calendar className="h-3 w-3" /> {new Date(announcement.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>

                        {/* Title */}
                        <h1 className="text-4xl md:text-7xl font-black italic tracking-tighter text-[var(--text-primary)] leading-[0.9] max-w-3xl selection:bg-[var(--accent-primary)] selection:text-[var(--bg-primary)]">
                            {announcement.title}
                        </h1>

                        <div className="w-24 h-2 bg-[var(--accent-primary)] opacity-20 rounded-full" />

                        {/* Body Text */}
                        <div className="prose prose-slate dark:prose-invert max-w-none">
                            <p className="text-lg md:text-2xl font-medium italic text-[var(--text-primary)]/80 leading-relaxed whitespace-pre-wrap selection:bg-[var(--text-primary)] selection:text-[var(--bg-primary)]">
                                {announcement.content}
                            </p>
                        </div>
                    </div>
                </article>

                {/* Return Action */}
                <div className="flex justify-center pt-12">
                    <button 
                        onClick={() => navigate(-1)}
                        className="group flex flex-col items-center gap-4 opacity-40 hover:opacity-100 transition-opacity"
                    >
                        <div className="h-1 w-12 bg-[var(--border-color)] rounded-full group-hover:w-24 transition-all" />
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] italic">Deactivate Briefing View</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AnnouncementDetailPage;
