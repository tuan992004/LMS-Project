import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/userAuthStore';
import { api } from '../../lib/axios';
import { Users, BookOpen, Loader2, Shield, ArrowUpRight, Activity, Zap } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { StatCard } from '../../components/shared/StatCard';
import { MobileDashboard } from '../shared/MobileDashboard';

export const AdminDashboard = () => {
    const user = useAuthStore((s) => s.user);
    const { t } = useTranslation();
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalCourses: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [usersRes, coursesRes] = await Promise.all([
                    api.get("/users"),
                    api.get("/courses")
                ]);

                setStats({
                    totalUsers: usersRes.data.length,
                    totalCourses: coursesRes.data.length
                });
            } catch (error) {
                console.error("Failed to fetch stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
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
        <div className="max-w-7xl mx-auto p-4 md:p-8 lg:p-12">
            {/* Mobile-First View (< md) */}
            <div className="md:hidden">
                <MobileDashboard />
            </div>

            {/* Desktop View (>= md) */}
            <main className="hidden md:block space-y-12 md:space-y-20 animate-fade-in-up" role="main" aria-labelledby="admin-dash-title">
                <header className="glass-card p-10 md:p-16 relative overflow-hidden group shadow-2xl">
                <div className="absolute top-0 right-0 w-80 h-80 bg-[var(--accent-primary)] opacity-[0.03] rounded-full -mr-40 -mt-40 transition-transform duration-1000 group-hover:scale-125 pointer-events-none" />
                
                <div className="relative z-10 space-y-6">
                    <div className="flex items-center gap-6">
                        <div className="h-14 w-14 rounded-2xl bg-[var(--accent-primary)] flex items-center justify-center text-[var(--bg-primary)] shadow-xl">
                            <Shield className="h-6 w-6" strokeWidth={1.5} />
                        </div>
                        <div className="space-y-1">
                            <h1 id="admin-dash-title" className="text-3xl md:text-5xl lg:text-7xl font-black text-[var(--text-primary)] tracking-tighter italic leading-none">
                                {t('portal_admin')}
                            </h1>
                            <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-[var(--text-secondary)] opacity-40 italic">{t('portal_admin_sub')}</span>
                        </div>
                    </div>
                    <p className="text-[var(--text-secondary)] font-medium text-lg md:text-2xl italic opacity-80 max-w-3xl leading-relaxed">
                        {t('dash_welcome', { name: user?.fullname || 'Administrator' })}
                    </p>
                </div>
            </header>

            {/* Metrics Overview */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 lg:gap-12" aria-label="Administrative Metrics">
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
                
                {/* Status Placeholders */}
                <div className="animate-fade-in-up stagger-3 col-span-1 md:col-span-2">
                    <div className="insta-card p-6 md:p-10 bg-[var(--text-primary)] text-[var(--bg-primary)] overflow-hidden relative group h-full border-none shadow-[0_40px_80px_-20px_rgba(0,0,0,0.3)]">
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-white/10 pointer-events-none" />
                        <h3 className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] opacity-60 mb-6 text-[var(--bg-primary)] relative z-10 flex items-center gap-2">
                            <Zap className="h-4 w-4" /> {t('dash_infra_load') || "INFRASTRUCTURE LOAD"}
                        </h3>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-8 md:gap-12 relative z-10">
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl md:text-6xl font-black tracking-tighter italic">12%</span>
                                <span className="text-[10px] font-bold uppercase opacity-60 tracking-widest">{t('dash_load_low') || "NOMINAL"}</span>
                            </div>
                            <div className="hidden sm:block h-14 w-px bg-[var(--bg-primary)]/20" />
                            <p className="text-sm md:text-base font-medium italic opacity-80 max-w-sm leading-relaxed">
                                {t('dash_infra_desc') || "Heuristic clusters are operating well within safety parameters."}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Strategic Insights Placeholders */}
            <section className="mt-12 md:mt-24 grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12" aria-label="Strategic Insights">
                <div className="lg:col-span-2 insta-card p-12 md:p-20 min-h-[400px] flex flex-col items-center justify-center border-dashed border-2 bg-white/5 group border-[var(--border-color)]">
                    <div className="w-24 h-24 bg-[var(--bg-secondary)] rounded-[2.5rem] flex items-center justify-center mb-10 shadow-inner group-hover:scale-110 transition-transform duration-700">
                        <Activity className="h-10 w-10 text-[var(--text-secondary)] opacity-10" />
                    </div>
                    <p className="text-[var(--text-secondary)] font-black italic opacity-20 uppercase tracking-tighter text-4xl md:text-6xl select-none text-center">
                        {t('dash_activity_sync') || "ACTIVITY STREAM"}
                    </p>
                    <p className="text-[var(--text-secondary)] font-medium italic opacity-40 mt-6 md:text-lg">
                        {t('dash_activity_sub') || "Awaiting heuristic input..."}
                    </p>
                </div>

                <div className="insta-card p-12 md:p-14 flex flex-col items-center justify-center border-dashed border-2 bg-white/5 border-[var(--border-color)] group">
                    <div className="w-20 h-20 bg-[var(--bg-secondary)] rounded-3xl flex items-center justify-center mb-8 shadow-inner group-hover:rotate-12 transition-transform duration-700">
                         <Zap className="h-8 w-8 text-[var(--text-secondary)] opacity-10" />
                    </div>
                    <p className="text-[var(--text-secondary)] font-black italic opacity-20 uppercase tracking-tighter text-2xl md:text-3xl select-none text-center">
                        {t('dash_quick_actions')}
                    </p>
                    <div className="w-12 h-1 bg-[var(--border-color)] mt-6 opacity-20" />
                </div>
            </section>
        </main>
        </div>
    );
};
