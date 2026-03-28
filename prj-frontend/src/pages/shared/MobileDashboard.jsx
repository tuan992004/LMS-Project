import React, { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '../../stores/userAuthStore';
import { api } from '../../lib/axios';
import { useTranslation } from '../../hooks/useTranslation';
import { GlassCard } from '../../components/ui/GlassCard';
import { 
  Loader2, 
  Trophy, 
  Calendar, 
  ClipboardList, 
  Users, 
  ShieldCheck, 
  Zap,
  Activity,
  ArrowRight
} from 'lucide-react';

/**
 * MobileDashboard - Ultra-minimalistic, role-aware dashboard for mobile devices.
 * Features strict text-overflow prevention and corporate glassmorphism.
 */
export const MobileDashboard = () => {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await api.get('/dashboard/summary');
        setSummary(res.data);
      } catch (err) {
        console.error("Dashboard Sync Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  const todayStr = useMemo(() => {
    return new Date().toLocaleDateString(undefined, { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      {/* Welcome Section */}
      <header className="px-2 pt-4">
        <h1 className="text-2xl font-black text-[var(--text-primary)] tracking-tighter italic leading-none break-words flex-wrap hyphens-auto">
          {t('dashboard_welcome', { name: user?.fullname || 'Scholar' })}
        </h1>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] opacity-40 mt-3 italic leading-relaxed break-words flex-wrap hyphens-auto">
          {t('dashboard_today', { date: todayStr })}
        </p>
      </header>

      {/* Role-Specific Widget Grid */}
      <section className="grid grid-cols-1 gap-y-6">
        {user?.role === 'student' && summary?.data && (
          <>
            {/* Student Progress */}
            <GlassCard 
              title={t('dashboard_student_progress')}
              subtitle={`${summary.data.courseCount} Modules Enrolled`}
            >
              <div className="flex items-center justify-between gap-4 mt-2">
                <div className="relative h-12 w-12 flex items-center justify-center">
                   <svg className="h-full w-full -rotate-90">
                     <circle cx="24" cy="24" r="20" fill="transparent" stroke="currentColor" strokeWidth="4" className="text-white/5" />
                     <circle cx="24" cy="24" r="20" fill="transparent" stroke="currentColor" strokeWidth="4" strokeDasharray="125.6" strokeDashoffset={125.6 * (1 - summary.data.progress / 100)} className="text-[var(--accent-primary)]" />
                   </svg>
                   <span className="absolute text-[10px] font-black italic">{summary.data.progress}%</span>
                </div>
                <Trophy className="h-6 w-6 text-[var(--accent-primary)] opacity-20" />
              </div>
            </GlassCard>

            {/* Imminent Deadline */}
            <GlassCard 
              title={t('dashboard_student_deadline')}
              subtitle={summary.data.nextDeadline?.course_title || "Academic Integrity"}
            >
              <div className="mt-2 space-y-2">
                <p className="text-sm font-bold text-[var(--text-primary)] break-words flex-wrap italic leading-tight">
                  {summary.data.nextDeadline?.title || "No pending deadlines"}
                </p>
                {summary.data.nextDeadline && (
                  <div className="flex items-center gap-2 text-[10px] font-black text-rose-500 uppercase tracking-widest bg-rose-500/10 px-3 py-1.5 rounded-lg w-fit">
                    <Calendar className="h-3 w-3" />
                    {new Date(summary.data.nextDeadline.due_date).toLocaleDateString()}
                  </div>
                )}
              </div>
            </GlassCard>
          </>
        )}

        {user?.role === 'instructor' && summary?.data && (
          <>
            {/* Teacher Pending Submissions */}
            <GlassCard 
              title={t('dashboard_teacher_pending')}
              subtitle="Action Required"
            >
              <div className="flex items-center justify-between gap-4 mt-2">
                <span className="text-3xl font-black italic text-[var(--accent-primary)]">
                  {summary.data.pendingCount}
                </span>
                <ClipboardList className="h-8 w-8 text-[var(--accent-primary)] opacity-20" />
              </div>
            </GlassCard>

            {/* Teacher Schedule */}
            <GlassCard 
              title={t('dashboard_teacher_schedule')}
              subtitle="Instructional Flow"
            >
              <div className="mt-2 space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                   <Zap className="h-4 w-4 text-[var(--accent-primary)]" />
                   <p className="text-xs font-bold break-words flex-wrap hyphens-auto leading-tight italic">
                     {summary.data.todaySchedule}
                   </p>
                </div>
              </div>
            </GlassCard>
          </>
        )}

        {user?.role === 'admin' && summary?.data && (
          <>
            {/* Admin Active Users */}
            <GlassCard 
              title={t('dashboard_admin_users')}
              subtitle="Population Statistics"
            >
              <div className="flex items-center justify-between mt-2">
                <span className="text-3xl font-black italic text-[var(--accent-primary)]">
                  {summary.data.activeUsers}
                </span>
                <Users className="h-8 w-8 text-[var(--accent-primary)] opacity-20" />
              </div>
            </GlassCard>

            {/* Admin System Status */}
            <GlassCard 
              title={t('dashboard_admin_status')}
              subtitle="Network Heuristics"
            >
              <div className="flex items-center gap-3 mt-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <span className="text-xs font-black uppercase tracking-widest text-emerald-500 italic">
                  {summary.data.systemStatus}
                </span>
                <ShieldCheck className="h-8 w-8 ml-auto text-emerald-500 opacity-20" />
              </div>
            </GlassCard>
          </>
        )}
      </section>

      {/* Activity Feed Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)] opacity-40 italic">
            {t('dashboard_student_announcements')}
          </h3>
          <Activity className="h-3 w-3 text-[var(--text-secondary)] opacity-20" />
        </div>

        <div className="space-y-3">
          {summary?.activity?.length > 0 ? (
            summary.activity.map((item, idx) => (
              <div 
                key={item.id} 
                className={`
                  flex items-start gap-4 p-4 rounded-xl transition-all duration-300
                  ${idx === 0 ? 'bg-white/10' : 'bg-white/5 border border-white/5'}
                `}
              >
                <div className="h-2 w-2 rounded-full bg-[var(--accent-primary)] mt-1.5 shrink-0" />
                <p className="text-xs font-bold leading-relaxed break-words flex-wrap hyphens-auto text-[var(--text-primary)] opacity-80 italic">
                  {item.message}
                </p>
              </div>
            ))
          ) : (
            <div className="py-12 text-center opacity-20">
              <p className="text-[10px] font-black uppercase tracking-widest italic">{t('dashboard_no_activity')}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
