import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/userAuthStore';
import { api } from '../../lib/axios';
import { Users, BookOpen, Loader2, Shield, ArrowUpRight, Activity, History, Megaphone, Bell, User } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { StatCard } from '../../components/shared/StatCard';
import { MobileDashboard } from '../shared/MobileDashboard';
import { AnnouncementList } from '../../components/dashboard/AnnouncementList';
import { useNavigate } from 'react-router-dom';
import SharedCalendar from '../../components/shared/SharedCalendar';

export const AdminDashboard = () => {
    const user = useAuthStore((s) => s.user);
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalCourses: 0,
        pendingAnnouncements: 0
    });
    const [announcements, setAnnouncements] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [usersRes, coursesRes, pendingRes, summaryRes] = await Promise.all([
                api.get("/users"),
                api.get("/courses"),
                api.get("/announcements/pending"),
                api.get("/dashboard/summary")
            ]);

            setStats({
                totalUsers: usersRes.data.length,
                totalCourses: coursesRes.data.length,
                pendingAnnouncements: pendingRes.data.length
            });
            setSummary(summaryRes.data);
        } catch (error) {
            console.error("Failed to fetch stats", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAnnouncements = async () => {
        setLoadingAnnouncements(true);
        try {
            const res = await api.get('/announcements');
            setAnnouncements(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingAnnouncements(false);
        }
    };

    useEffect(() => {
        fetchData();
        fetchAnnouncements();
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-[var(--accent-primary)] opacity-20" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)] animate-pulse">
                {t('dashboard_syncing')}
            </p>
        </div>
    );


    return (
        <div className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto">
             {/* Mobile View */}
             <div className="md:hidden">
                <MobileDashboard />
            </div>

            {/* Desktop View */}
            <main className="hidden md:block animate-fade-in-up" role="main" aria-labelledby="admin-dash-title">
                <header className="flex items-center justify-between gap-6 mb-12 md:mb-16">
                    <div className="flex items-center gap-6">
                        <div className="h-12 w-12 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-primary)] border border-[var(--border-color)] shadow-sm shrink-0">
                            <Shield className="h-5 w-5 opacity-60" strokeWidth={1.5} />
                        </div>
                        <p className="text-[var(--text-secondary)] font-medium text-lg md:text-xl italic opacity-80 leading-relaxed truncate">
                            {t('dash_welcome', { name: user?.fullname || 'Administrator' })}
                        </p>
                    </div>

                    {stats.pendingAnnouncements > 0 && (
                        <button 
                            onClick={() => navigate('/admin/announcements/approve')}
                            className="group flex items-center gap-4 bg-amber-500/10 text-amber-500 border border-amber-500/20 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-500 hover:text-white transition-all shadow-xl shadow-amber-500/10 active:scale-95"
                        >
                            <Bell className="h-4 w-4 animate-bounce" />
                            {stats.pendingAnnouncements} Pending Broadcasts
                        </button>
                    )}
                </header>

                {/* Quick Discovery Navigation Hub */}
                <section className="mb-12 md:mb-20">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)] opacity-60 mb-6 italic">Quick Discovery</h2>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        <button onClick={() => navigate('/admin/users')} className="insta-card p-6 flex flex-col items-start text-left group hover:bg-[var(--bg-secondary)] transition-all">
                            <Users className="h-6 w-6 mb-4 opacity-60 group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-black uppercase tracking-wider italic">Users Management</span>
                            <span className="text-[9px] font-medium opacity-40 mt-1 uppercase tracking-widest">Manage Users</span>
                        </button>
                        <button onClick={() => navigate('/admin/courses')} className="insta-card p-6 flex flex-col items-start text-left group hover:bg-[var(--bg-secondary)] transition-all">
                            <BookOpen className="h-6 w-6 mb-4 opacity-60 group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-black uppercase tracking-wider italic">Course Management</span>
                            <span className="text-[9px] font-medium opacity-40 mt-1 uppercase tracking-widest">Manage Courses</span>
                        </button>
                        <button onClick={() => navigate('/admin/announcements')} className="insta-card p-6 flex flex-col items-start text-left group hover:bg-[var(--bg-secondary)] transition-all">
                            <Megaphone className="h-6 w-6 mb-4 opacity-60 group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-black uppercase tracking-wider italic">Broadcasting</span>
                            <span className="text-[9px] font-medium opacity-40 mt-1 uppercase tracking-widest">System Alerts</span>
                        </button>
                        <button onClick={() => navigate('/admin/settings')} className="insta-card p-6 flex flex-col items-start text-left group hover:bg-[var(--bg-secondary)] transition-all">
                            <Shield className="h-6 w-6 mb-4 opacity-60 group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-black uppercase tracking-wider italic">Setting</span>
                            <span className="text-[9px] font-medium opacity-40 mt-1 uppercase tracking-widest">System Params</span>
                        </button>
                    </div>
                </section>

                <section className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-10 mb-12 md:mb-20">
                    <div className="lg:col-span-1 flex flex-col gap-8">
                        <StatCard
                            label={t('dash_total_users')}
                            value={loading ? "..." : stats.totalUsers}
                            icon={Users}
                        />
                        <StatCard
                            label={t('dash_total_courses')}
                            value={loading ? "..." : stats.totalCourses}
                            icon={BookOpen}
                            color="accent"
                        />
                    </div>
                    {/* Expanded Calendar */}
                    <div className="animate-fade-in-up stagger-3 lg:col-span-3">
                        <SharedCalendar events={summary?.data?.calendarEvents || []} variant="mini" />
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 md:gap-20 pb-32">
                    <div className="lg:col-span-2 space-y-12">
                        <AnnouncementList announcements={announcements} loading={loadingAnnouncements} limit={3} />
                    </div>

                    <aside className="space-y-8">
                        <div className="insta-card p-8 md:p-10 border-dashed border-2 bg-white/5 border-[var(--border-color)] flex flex-col group min-h-[400px]">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-[var(--text-secondary)]/10 text-[var(--text-secondary)] flex items-center justify-center">
                                        <History className="h-4 w-4" />
                                    </div>
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 italic">System Activity Log</h4>
                                </div>
                                <span className="text-[9px] font-black uppercase opacity-20 px-2 py-1 border border-[var(--border-color)] rounded-md">Live Feed</span>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4 max-h-[400px]">
                                {(!summary?.data?.globalActivities || summary.data.globalActivities.length === 0) ? (
                                    <div className="h-full flex flex-col items-center justify-center opacity-20 py-12">
                                        <Activity className="h-10 w-10 mb-4 animate-pulse" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">{t('dashboard_no_activity')}</p>
                                    </div>
                                ) : (
                                    summary.data.globalActivities.map((act, idx) => (
                                        <div key={act.id || idx} className="group/item flex items-start gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-[var(--border-color)]/30">
                                            <div className="h-8 w-8 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center shrink-0">
                                                <User className="h-3.5 w-3.5 opacity-40" />
                                            </div>
                                            <div className="space-y-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-black uppercase tracking-wider text-[var(--text-primary)] truncate max-w-[120px]">
                                                        {act.fullname || 'Unknown User'}
                                                    </span>
                                                    <span className="text-[8px] font-black bg-[var(--text-secondary)]/10 text-[var(--text-secondary)] px-1.5 py-0.5 rounded uppercase">
                                                        {act.role}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] font-medium italic opacity-60 leading-tight">
                                                    {act.action.replace(/_/g, ' ')} {act.details?.lessonTitle || act.details?.courseTitle || ''}
                                                </p>
                                                <div className="flex items-center gap-2 opacity-30">
                                                    <span className="text-[8px] font-black uppercase tracking-tighter">
                                                        {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    <span className="text-[8px]">•</span>
                                                    <span className="text-[8px] font-black uppercase tracking-tighter truncate">
                                                        {act.ip_address}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>


                    </aside>
                </div>
            </main>
        </div>
    );
};
