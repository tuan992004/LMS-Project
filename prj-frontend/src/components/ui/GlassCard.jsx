import React from 'react';

/**
 * GlassCard - A minimalistic, role-aware container.
 * FIXED: bg-white/5 → var(--surface-tint), border-white/10 → var(--surface-border)
 * for light mode visibility. font-bold → font-medium. All text uses leading-relaxed.
 */
export const GlassCard = ({ 
  children, 
  className = "", 
  title, 
  subtitle,
  onClick
}) => {
  return (
    <div 
      onClick={onClick}
      className={`
        relative p-4 rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)]
        transition-all duration-300 group
        ${onClick ? 'cursor-pointer active:scale-[0.98] hover:bg-[var(--surface-hover)]' : ''}
        ${className}
      `}
    >
      {/* Background Glow Effect */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--accent-primary)] opacity-[0.02] rounded-full -mr-12 -mt-12 pointer-events-none" />

      {title && (
        <div className="mb-4 space-y-1">
          <h4 className="text-sm font-medium text-[var(--text-primary)] leading-relaxed break-words flex-wrap hyphens-auto italic">
            {title}
          </h4>
          {subtitle && (
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--text-secondary)] opacity-60 leading-relaxed break-words flex-wrap hyphens-auto">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Main Content Area with strict overflow prevention */}
      <div className="text-[var(--text-primary)] leading-relaxed break-words flex-wrap hyphens-auto font-medium">
        {children}
      </div>
    </div>
  );
};
