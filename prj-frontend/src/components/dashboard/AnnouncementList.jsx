import { useState, useEffect } from 'react';
import { api } from '../../lib/axios';
import { Megaphone, Calendar, User, ArrowRight, Loader2, Bookmark } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';

export const AnnouncementList = ({ announcements = [], loading = false }) => {
    const { t } = useTranslation();
    const location = useLocation();
    
    // Determine the base path (e.g., /admin, /teacher, /student)
    const basePath = location.pathname.split('/')[1];

    if (loading) {
        return (
            <div className="space-y-6">
                {[1, 2, 3].map(i => (
                    <div key={i} className="insta-card p-8 animate-pulse bg-white/5 border-dashed border-2 border-[var(--border-color)]">
                        <div className="h-4 w-24 bg-[var(--text-secondary)]/10 rounded mb-4" />
                        <div className="h-8 w-64 bg-[var(--text-secondary)]/20 rounded mb-6" />
                        <div className="space-y-2">
                            <div className="h-3 w-full bg-[var(--text-secondary)]/5 rounded" />
                            <div className="h-3 w-4/5 bg-[var(--text-secondary)]/5 rounded" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (announcements.length === 0) {
        return (
            <div className="insta-card p-20 flex flex-col items-center justify-center border-dashed border-2 bg-white/5 text-center transition-all hover:bg-white/10 group">
                <div className="w-20 h-20 bg-[var(--bg-secondary)] rounded-3xl flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 transition-transform duration-700">
                    <Bookmark className="h-8 w-8 text-[var(--text-secondary)] opacity-10" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--text-secondary)] opacity-30 italic">
                    {t('dash_activity_sync') || "Heuristic Feed Depleted"}
                </p>
                <p className="text-sm font-medium italic opacity-40 mt-4 max-w-xs">{t('dash_activity_sub') || "No global announcements have been broadcasted yet."}</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in-up">
            
            <div className="space-y-6">
                {announcements.map((ann, idx) => (
                    <article 
                        key={ann.id} 
                        className={`insta-card p-10 group relative overflow-hidden transition-all hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] border-transparent hover:border-[var(--accent-primary)]/20 animate-fade-in-up stagger-${(idx % 5) + 1}`}
                    >
                        {/* Broadcast Indicator Line */}
                        <div className="absolute left-0 top-0 bottom-0 w-[6px] bg-[var(--accent-primary)] opacity-40 group-hover:opacity-100 transition-opacity" />

                        <div className="flex justify-between items-start mb-8">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-xl bg-[var(--text-primary)] text-[var(--bg-primary)] flex items-center justify-center shadow-lg transition-transform group-hover:rotate-12 duration-500">
                                    <Megaphone className="h-4 w-4" />
                                </div>
                                <div>
                                    <h4 className="text-xl md:text-2xl font-black italic tracking-tighter text-[var(--text-primary)] leading-none mb-1 group-hover:text-[var(--accent-primary)] transition-colors">
                                        {ann.title}
                                    </h4>
                                    <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-60">
                                        <span className="flex items-center gap-1.5"><User className="h-2.5 w-2.5" /> {ann.author_name || ann.author}</span>
                                        <span className="opacity-20">•</span>
                                        <span className="flex items-center gap-1.5"><Calendar className="h-2.5 w-2.5" /> {new Date(ann.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <p className="text-sm md:text-base font-medium italic text-[var(--text-secondary)] opacity-80 leading-relaxed max-w-3xl line-clamp-3 group-hover:line-clamp-none transition-all duration-500">
                            {ann.content}
                        </p>

                        <div className="mt-8 pt-8 border-t border-[var(--border-color)] flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link 
                                to={`/${basePath}/announcements/${ann.id}`} 
                                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--accent-primary)] group/btn"
                            >
                                Details <ArrowRight className="h-3 w-3 group-hover/btn:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
};
