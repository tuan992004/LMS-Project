import React from 'react';
import { AnnouncementWriter } from '../../components/dashboard/AnnouncementWriter';
import { Megaphone, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuthStore } from '../../stores/userAuthStore';

const CreateAnnouncementPage = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { user } = useAuthStore();
    const isAdmin = user?.role === 'admin';

    return (
        <div className="max-w-4xl mx-auto space-y-12 animate-fade-in-up pb-32">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <button 
                        onClick={() => navigate(-1)}
                        className="h-12 w-12 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-primary)] border border-[var(--border-color)] shadow-sm hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-all active:scale-90"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black italic tracking-tight text-[var(--text-primary)]">
                            {t('nav_broadcast') || "Broadcast Hub"}
                        </h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--text-secondary)] opacity-40 italic mt-2">
                            {isAdmin ? "SYSTEM-WIDE DIRECTIVE DISPATCH" : "ACADEMIC COMMUNICATION PROTOCOL"}
                        </p>
                    </div>
                </div>
                
                <div className="h-12 w-12 rounded-2xl bg-[var(--accent-primary)]/10 flex items-center justify-center text-[var(--accent-primary)] hidden md:flex">
                    <Megaphone className="h-6 w-6" />
                </div>
            </header>

            {/* Writer Component */}
            <div className="mt-12">
                <AnnouncementWriter onPublished={() => navigate(isAdmin ? '/admin/announcements' : '/teacher/announcements')} />
            </div>

            {/* Guidelines / Help */}
            <div className="glass-card p-8 border-dashed border-2 bg-white/5 opacity-50">
                <h4 className="text-[10px] font-black uppercase tracking-widest mb-4 italic">Protocol Guidelines</h4>
                <ul className="space-y-3">
                    <li className="text-xs font-medium italic leading-relaxed">• Ensure the directive title is concise and authoritative.</li>
                    <li className="text-xs font-medium italic leading-relaxed">• Academic announcements should follow the established pedagogical tone.</li>
                    <li className="text-xs font-medium italic leading-relaxed">• Directives are broadcasted instantly across all verified scholar terminals.</li>
                </ul>
            </div>
        </div>
    );
};

export default CreateAnnouncementPage;
