import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/axios";
import { 
    BookOpen, 
    Clock, 
    ArrowUpRight, 
    Loader2,
    Layout,
    Target,
    Megaphone
} from "lucide-react";
import SharedCalendar from '../../components/shared/SharedCalendar';
import { useTranslation } from "../../hooks/useTranslation";
import { useAuthStore } from "../../stores/userAuthStore";
import { StatCard } from "../../components/shared/StatCard";
import { MobileDashboard } from "../shared/MobileDashboard";
import { AnnouncementList } from "../../components/dashboard/AnnouncementList";

export const StudentDashboard = () => {
    const [summary, setSummary] = useState(null);
    const [announcements, setAnnouncements] = useState([]);
    const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
    const [loading, setLoading] = useState(true);
    const { user } = useAuthStore();
    const { t } = useTranslation();
    const navigate = useNavigate();

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
        const fetchDashboardData = async () => {
            try {
                const response = await api.get("/dashboard/summary");
                setSummary(response.data);
                await fetchAnnouncements();
            } catch (error) {
                console.error("Dashboard sync error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-[var(--accent-primary)] opacity-20" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)] animate-pulse">{t('dashboard_syncing')}</p>
        </div>
    );

    return (
        <div className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto">
             {/* Mobile View */}
             <div className="md:hidden">
                <MobileDashboard />
            </div>

            {/* Desktop View */}
            <main className="hidden md:block animate-fade-in-up" role="main">
                <header className="flex items-center gap-6 mb-12 md:mb-16">
                    <div className="h-12 w-12 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-primary)] border border-[var(--border-color)] shadow-sm shrink-0">
                        <Layout className="h-5 w-5 opacity-60" strokeWidth={1.5} />
                    </div>
                    <p className="text-[var(--text-secondary)] font-medium text-lg md:text-xl italic opacity-80 leading-relaxed truncate">
                        {t('dash_welcome', { name: user?.fullname || 'Scholar' })}
                    </p>
                </header>

                {/* Quick Discovery Navigation Hub */}
                <section className="mb-12 md:mb-20">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)] opacity-60 mb-6 italic">Quick Discovery</h2>
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
                        <button onClick={() => navigate('/student/courses')} className="insta-card p-6 flex flex-col items-start text-left group hover:bg-[var(--bg-secondary)] transition-all">
                            <BookOpen className="h-6 w-6 mb-4 opacity-60 group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-black uppercase tracking-wider italic">Courses</span>
                            <span className="text-[9px] font-medium opacity-40 mt-1 uppercase tracking-widest">Browse Catalog</span>
                        </button>
                        <button onClick={() => navigate('/student/assignments')} className="insta-card p-6 flex flex-col items-start text-left group hover:bg-[var(--bg-secondary)] transition-all">
                            <Target className="h-6 w-6 mb-4 opacity-60 group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-black uppercase tracking-wider italic">Assignments</span>
                            <span className="text-[9px] font-medium opacity-40 mt-1 uppercase tracking-widest">Pending Tasks</span>
                        </button>
                        <button onClick={() => navigate('/student/announcements')} className="insta-card p-6 flex flex-col items-start text-left group hover:bg-[var(--bg-secondary)] transition-all">
                            <Megaphone className="h-6 w-6 mb-4 opacity-60 group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-black uppercase tracking-wider italic">Broadcasting</span>
                            <span className="text-[9px] font-medium opacity-40 mt-1 uppercase tracking-widest">System Alerts</span>
                        </button>
                        <button onClick={() => navigate('/student/notifications')} className="insta-card p-6 flex flex-col items-start text-left group hover:bg-[var(--bg-secondary)] transition-all">
                            <ArrowUpRight className="h-6 w-6 mb-4 opacity-60 group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-black uppercase tracking-wider italic">New Updates</span>
                            <span className="text-[9px] font-medium opacity-40 mt-1 uppercase tracking-widest">Recent Alerts</span>
                        </button>
                        <button onClick={() => navigate('/student/settings')} className="insta-card p-6 flex flex-col items-start text-left group hover:bg-[var(--bg-secondary)] transition-all">
                            <Layout className="h-6 w-6 mb-4 opacity-60 group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-black uppercase tracking-wider italic">Settings</span>
                            <span className="text-[9px] font-medium opacity-40 mt-1 uppercase tracking-widest">Preferences</span>
                        </button>
                    </div>
                </section>

                <section className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-10 mb-12 md:mb-20">
                    <div className="lg:col-span-1 flex flex-col gap-8">
                        <StatCard 
                            label={t('dash_enrolled_courses')} 
                            value={summary?.data?.courseCount || 0} 
                            icon={BookOpen}
                        />

                    </div>
                    {/* Expanded Calendar */}
                    <div className="animate-fade-in-up stagger-3 lg:col-span-3">
                        <SharedCalendar events={summary?.data?.calendarEvents || []} variant="mini" />
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 md:gap-20">
                    <div className="lg:col-span-2 space-y-12">
                        <AnnouncementList announcements={announcements} loading={loadingAnnouncements} limit={3} />
                    </div>

                    <aside className="space-y-8">
                         {/* Recent Activity Log */}
                         <div className="insta-card p-8 md:p-10 border-dashed border-2 bg-white/5 flex flex-col group">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-6 flex items-center gap-2">
                                <Clock className="h-4 w-4" /> Activity Log
                            </h4>
                            {(!summary?.data?.recentActivities || summary.data.recentActivities.length === 0) ? (
                                <p className="text-[10px] font-medium italic opacity-40 text-center py-4">{t('dashboard_no_activity')}</p>
                            ) : (
                                <ul className="space-y-4">
                                    {summary.data.recentActivities.map((act, idx) => (
                                        <li key={act.id || idx} className="flex flex-col gap-2 border-b border-[var(--border-color)]/50 pb-4 last:border-0">
                                            <p className="text-xs font-medium italic opacity-80 leading-relaxed text-[var(--text-primary)]">
                                                {act.action === 'visit_lesson' && `Reviewed lesson: ${act.details?.lessonTitle || 'Unknown'}`}
                                                {act.action === 'submit_assignment' && `Submitted assignment`}
                                                {act.action !== 'visit_lesson' && act.action !== 'submit_assignment' && act.action}
                                            </p>
                                            <span className="text-[9px] font-black text-[var(--text-secondary)] opacity-40 uppercase tracking-widest">
                                                {new Date(act.created_at).toLocaleString()}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
};
