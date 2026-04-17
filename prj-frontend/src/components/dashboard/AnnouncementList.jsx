import { useState, useEffect } from 'react';
import { api } from '../../lib/axios';
import { Megaphone, Calendar, User, ArrowRight, Loader2, Bookmark, FileText } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';

export const AnnouncementList = ({ announcements = [], loading = false, limit = 0 }) => {
    const { t } = useTranslation();
    const location = useLocation();
    const [dateFilter, setDateFilter] = useState('all'); // all | today | week | month
    
    // Determine the base path (e.g., /admin, /teacher, /student)
    const basePath = location.pathname.split('/')[1];

    const filterAnnouncements = () => {
        const now = new Date();
        const startOfToday = new Date(now.setHours(0, 0, 0, 0));
        
        return announcements.filter(ann => {
            const annDate = new Date(ann.created_at);
            if (dateFilter === 'today') {
                return annDate >= startOfToday;
            }
            if (dateFilter === 'week') {
                const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                return annDate >= weekAgo;
            }
            if (dateFilter === 'month') {
                const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                return annDate >= monthAgo;
            }
            return true;
        });
    };

    const filteredList = filterAnnouncements();
    const displayList = limit > 0 ? filteredList.slice(0, limit) : filteredList;

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

    const FilterButton = ({ type, label }) => (
        <button
            onClick={() => setDateFilter(type)}
            className={`px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border ${
                dateFilter === type 
                ? 'bg-[var(--text-primary)]/10 text-[var(--text-primary)] border-[var(--text-primary)] shadow-md scale-105' 
                : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border-transparent opacity-40 hover:opacity-100 hover:bg-[var(--bg-primary)] hover:border-[var(--border-color)]'
            }`}
        >
            {label}
        </button>
    );

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
            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-4 mb-2">
                <FilterButton type="all" label="All" />
                <FilterButton type="today" label="Today" />
                <FilterButton type="week" label="Last 7 Days" />
                <FilterButton type="month" label="Last 30 Days" />
            </div>

            <div className="space-y-6">
                {displayList.length > 0 ? (
                    displayList.map((ann, idx) => (
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

                            {ann.file_url && (
                                <div className="mt-8 flex items-center gap-4 animate-fade-in group/doc">
                                    <div className="h-10 w-10 rounded-xl bg-[var(--accent-primary)]/10 flex items-center justify-center text-[var(--accent-primary)] group-hover/doc:bg-[var(--accent-primary)] group-hover/doc:text-[var(--bg-primary)] transition-all">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Appendix Attached</span>
                                        <a 
                                            href={`http://localhost:5001${ann.file_url}`} 
                                            onClick={(e) => e.stopPropagation()}
                                            download
                                            className="text-xs font-bold text-[var(--text-primary)] hover:text-[var(--accent-primary)] transition-colors underline decoration-[var(--accent-primary)]/20 underline-offset-4"
                                        >
                                            {ann.file_url.split('-').length > 2 ? ann.file_url.split('-').slice(2).join('-') : ann.file_url.split('/').pop()}
                                        </a>
                                    </div>
                                </div>
                            )}

                            <div className="mt-8 pt-8 border-t border-[var(--border-color)] flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                <Link 
                                    to={`/${basePath}/announcements/${ann.id}`} 
                                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--accent-primary)] group/btn"
                                >
                                    Details <ArrowRight className="h-3 w-3 group-hover/btn:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </article>
                    ))
                ) : (
                    <div className="insta-card p-24 flex flex-col items-center justify-center border-dashed border-2 bg-white/5 text-center">
                        <Calendar className="h-10 w-10 text-[var(--accent-primary)] opacity-40 mb-8 animate-pulse" />
                        <p className="text-[11px] font-black uppercase tracking-[0.4em] text-[var(--text-primary)] italic">Feed Synchronization Complete</p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-40 mt-3 italic">No matching broadcasts discovered for this epoch</p>
                    </div>
                )}
            </div>

            {limit > 0 && (
                <div className="flex items-center justify-between pt-6 border-t border-dashed border-[var(--border-color)]">
                    {filteredList.length > limit ? (
                        <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-30 italic">
                            Showing {limit} of {filteredList.length} broadcasts
                        </span>
                    ) : (
                        <span />
                    )}
                    <Link
                        to={`/${basePath}/announcements`}
                        className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors duration-300 opacity-60 hover:opacity-100"
                    >
                        See All Broadcasts
                        <div className="h-7 w-7 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center group-hover:bg-[var(--accent-primary)] group-hover:border-[var(--accent-primary)] transition-all duration-300">
                            <ArrowRight className="h-3 w-3 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                        </div>
                    </Link>
                </div>
            )}
        </div>
    );
};
