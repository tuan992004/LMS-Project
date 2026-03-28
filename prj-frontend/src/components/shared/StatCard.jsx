import React from 'react';
import { Loader2, ArrowUpRight } from 'lucide-react';

/**
 * StatCard Component
 * High-fidelity glassmorphic metric card for mobile first dashboards.
 */
export const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  loading, 
  Trend, 
  delayClass = '',
  variant = 'default' 
}) => {
  return (
    <div className={`animate-fade-in-up ${delayClass} h-full`}>
      <div className={`
        insta-card p-6 md:p-10 flex items-center justify-between group cursor-default h-full transition-all duration-500
        border-transparent hover:border-[var(--accent-primary)]/20 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)]
        active:scale-[0.98] relative overflow-hidden
        ${variant === 'dark' ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] border-none' : 'bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border-[var(--border-color)]/20 shadow-xl shadow-black/5'}
      `}>
        <div className="absolute top-0 left-0 w-32 h-32 bg-[var(--accent-primary)] opacity-[0.02] rounded-full -ml-16 -mt-16 pointer-events-none" />
        
        <div className="space-y-4 md:space-y-6 flex-1 pr-4 relative z-10">
          <h3 className={`
            text-[10px] md:text-xs font-black uppercase tracking-[0.4em] italic leading-relaxed
            ${variant === 'dark' ? 'text-[var(--bg-primary)] opacity-60' : 'text-[var(--text-secondary)] opacity-50'}
          `}>
            {title}
          </h3>
          <div className="flex items-baseline gap-3">
            <p className={`
              text-4xl md:text-6xl font-black tracking-tighter italic leading-none
              ${variant === 'dark' ? 'text-[var(--bg-primary)]' : 'text-[var(--text-primary)]'}
            `}>
              {loading ? (
                <Loader2 className={`h-8 w-8 animate-spin ${variant === 'dark' ? 'text-[var(--bg-primary)]' : 'text-[var(--accent-primary)]'}`} />
              ) : (
                value
              )}
            </p>
            {Trend && !loading && (
              <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded-md ${variant === 'dark' ? 'bg-white/10 text-[var(--bg-primary)]' : 'bg-emerald-500/10 text-emerald-600'}`}>
                {Trend}
              </span>
            )}
          </div>
        </div>

        <div className={`
          p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] transition-all duration-700 shadow-inner group-hover:rotate-12 relative z-10
          ${variant === 'dark' ? 'bg-white/10 text-[var(--bg-primary)]' : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] group-hover:bg-[var(--accent-primary)] group-hover:text-white'}
        `}>
          <Icon className="h-7 md:h-12 w-7 md:w-12" />
        </div>
      </div>
    </div>
  );
};
