import React, { useState, useEffect } from 'react';
import { api } from '../../lib/axios';
import { AnnouncementList } from '../../components/dashboard/AnnouncementList';
import { House, Search, Filter, Loader2, Plus } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/userAuthStore';

const AnnouncementFeedPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const isAdmin = user?.role === 'admin';
    const isTeacher = user?.role === 'instructor';

    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchAnnouncements = async () => {
        setLoading(true);
        try {
            const res = await api.get('/announcements');
            setAnnouncements(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const filteredAnnouncements = announcements.filter(ann => 
        ann.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ann.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto space-y-12 animate-fade-in-up pb-32">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
                <div className="flex flex-1 items-center gap-4 w-full md:w-auto">
                    <Link 
                        to={isAdmin ? "/admin" : "/teacher"}
                        className="h-12 w-12 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-primary)] border border-[var(--border-color)] shadow-sm shrink-0 hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-all duration-300 group/header-icon"
                    >
                        <House className="h-5 w-5 opacity-60 group-hover/header-icon:opacity-100 transition-opacity" />
                    </Link>
                    <div className="relative w-full md:max-w-md group/search">
                        <input 
                            data-region="input" 
                            data-action="search" 
                            id="searchinput" 
                            autoComplete="off" 
                            placeholder="Search broadcasts..." 
                            className="form-control withclear pl-6 focus:ring-4 focus:ring-[var(--accent-primary)]/10" 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {(isAdmin || isTeacher) && (
                    <button 
                        onClick={() => navigate(`/${isAdmin ? 'admin' : 'teacher'}/announcements/new`)}
                        className="btn-primary w-full sm:w-auto flex items-center justify-center gap-3 !px-10 !py-5 shadow-xl hover:shadow-2xl hover:-translate-y-1 hover:scale-105 group active:scale-95 transition-all duration-300 text-[10px] uppercase tracking-widest bg-[var(--nav-bg)] text-[var(--text-primary)] border border-[var(--border-color)] hover:bg-[var(--bg-secondary)]"
                    >
                        <Plus className="h-5 w-5 group-hover:rotate-90 group-hover:scale-110 transition-transform duration-300" />
                        Add New Broadcast
                    </button>
                )}
            </header>

            {/* List Section */}
            <div className="bg-transparent">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-4">
                        <Loader2 className="h-8 w-8 animate-spin text-[var(--accent-primary)] opacity-20" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] animate-pulse">Syncing feed...</p>
                    </div>
                ) : (
                    <AnnouncementList announcements={filteredAnnouncements} loading={false} />
                )}
            </div>
        </div>
    );
};

export default AnnouncementFeedPage;
