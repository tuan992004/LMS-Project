import React, { useState } from 'react';
import { MoreVertical, Edit2, Trash2, Eye } from 'lucide-react';

/**
 * DataCard Component
 * Replaces table rows on mobile with a premium glassmorphic card.
 */
export const DataCard = ({ 
  title, 
  subtitle, 
  icon: Icon, 
  details = [], 
  actions = [], 
  status,
  onClick 
}) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <div 
      className="glass-card p-5 relative overflow-hidden group transition-all active:scale-[0.98] border border-white/20 backdrop-blur-md bg-white/60 dark:bg-slate-900/60 shadow-xl rounded-2xl mb-4"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-4">
          {Icon && (
            <div className="h-10 w-10 rounded-xl bg-[var(--accent-primary)]/10 flex items-center justify-center text-[var(--accent-primary)] shadow-inner">
              <Icon className="h-5 w-5" />
            </div>
          )}
          <div className="space-y-0.5">
            <h4 className="font-black text-[var(--text-primary)] text-lg tracking-tight italic break-words line-clamp-1">
              {title}
            </h4>
            {subtitle && (
              <p className="text-[10px] uppercase tracking-widest font-black text-[var(--text-secondary)] opacity-40 italic">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="relative">
          <button 
            onClick={(e) => { e.stopPropagation(); setShowActions(!showActions); }}
            className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-[var(--bg-secondary)] transition-all active:scale-90"
            aria-label="Actions"
          >
            <MoreVertical className="h-5 w-5 text-[var(--text-secondary)]" />
          </button>

          {showActions && (
            <div className="absolute right-0 mt-2 w-48 glass-card border-[var(--border-color)]/30 shadow-2xl z-[50] animate-in fade-in zoom-in-95 duration-200 p-2">
              {actions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); action.onClick(); setShowActions(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                    ${action.variant === 'danger' ? 'text-rose-500 hover:bg-rose-500/10' : 'text-[var(--text-secondary)] hover:bg-[var(--accent-primary)]/10 hover:text-[var(--accent-primary)]'}
                  `}
                >
                  {action.icon && <action.icon className="h-4 w-4" />}
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {details.map((detail, idx) => (
          <div key={idx} className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
            <span className="text-[var(--text-secondary)] opacity-40">{detail.label}</span>
            <span className={`text-[var(--text-primary)] ${detail.className || ''}`}>
              {detail.value}
            </span>
          </div>
        ))}
      </div>

      {status && (
        <div className="mt-4 pt-4 border-t border-[var(--border-color)]/20">
          {status}
        </div>
      )}
    </div>
  );
};
