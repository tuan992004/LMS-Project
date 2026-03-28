import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/userAuthStore';
import { api } from '../../lib/axios';
import { Users, BookOpen, Loader2 } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

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

    const StatCard = ({ title, value, icon: Icon }) => (
        <div className="insta-card p-6 flex items-center justify-between group cursor-default">
            <div>
                <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-1">{title}</h3>
                <p className="text-3xl font-black text-[var(--text-primary)]">
                    {loading ? <Loader2 className="h-6 w-6 animate-spin text-[var(--text-secondary)]" /> : value}
                </p>
            </div>
            <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] text-[var(--text-primary)] group-hover:scale-110 transition-transform duration-300 border border-[var(--border-color)]">
                <Icon className="h-6 w-6" />
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto p-8">
            <header className="mb-10">
                <h2 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">
                    {t('portal_admin')}
                </h2>
                <p className="text-[var(--text-secondary)] mt-1 font-medium">
                    {t('dash_welcome', { name: user?.fullname || 'Admin' })}
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title={t('dash_total_users')} 
                    value={stats.totalUsers} 
                    icon={Users}
                />
                <StatCard 
                    title={t('dash_total_courses')} 
                    value={stats.totalCourses} 
                    icon={BookOpen}
                />
            </div>

            {/* Placeholder for more dashboard content */}
            <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 insta-card p-8 min-h-[300px] flex items-center justify-center border-dashed border-2">
                    <p className="text-[var(--text-secondary)] font-bold italic opacity-40 uppercase tracking-tighter text-4xl select-none">{t('dash_activity')}</p>
                </div>
                <div className="insta-card p-8 flex items-center justify-center border-dashed border-2">
                    <p className="text-[var(--text-secondary)] font-bold italic opacity-40 uppercase tracking-tighter text-2xl select-none">{t('dash_quick_actions')}</p>
                </div>
            </div>
        </div>
    );
};
