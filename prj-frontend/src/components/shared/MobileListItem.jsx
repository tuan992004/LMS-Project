import React, { memo } from 'react';
import { ChevronRight } from 'lucide-react';

/**
 * MobileListItem - A reusable, high-performance "Summary-to-Detail" component.
 * Standardizes list interactions across the mobile application.
 */
const MobileListItem = memo(({ 
  title, 
  subtitle, 
  icon: Icon, 
  avatar,
  isExpanded, 
  onToggle, 
  children, 
  actions = [],
  className = ""
}) => {
  return (
    <div className={`transition-all duration-300 border-b border-[var(--border-color)] last:border-none ${className}`}>
      {/* Summary Row (Always Visible) */}
      <div 
        onClick={onToggle}
        className={`
          group px-6 py-5 flex items-center justify-between cursor-pointer transition-all duration-300
          ${isExpanded ? 'bg-[var(--accent-primary)]/5' : 'bg-transparent hover:bg-[var(--bg-secondary)]/30'}
          active:scale-[0.99]
        `}
        role="button"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-4 min-w-0">
          {/* Visual Lead (Avatar or Icon) - Upgraded to 44px touch zone */}
          {avatar ? (
            <div className={`
              h-11 w-11 shrink-0 rounded-xl flex items-center justify-center font-black text-xs transition-all duration-500
              ${isExpanded ? 'bg-[var(--accent-primary)] text-[var(--bg-primary)] scale-110 shadow-lg' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] opacity-60'}
            `}>
              {avatar}
            </div>
          ) : Icon && (
            <div className={`
              h-11 w-11 shrink-0 rounded-xl flex items-center justify-center transition-all duration-500
              ${isExpanded ? 'bg-[var(--accent-primary)] text-[var(--bg-primary)] scale-110 shadow-lg' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] opacity-60'}
            `}>
              <Icon className="h-5 w-5" strokeWidth={1.5} />
            </div>
          )}

          {/* Text Labels - break-words for VN support */}
          <div className="flex flex-col min-w-0">
            <h4 className={`text-sm font-bold truncate transition-colors leading-tight break-words whitespace-normal ${isExpanded ? 'text-[var(--text-primary)]' : 'text-[var(--text-primary)]/80'}`}>
              {title}
            </h4>
            <span className={`text-[9px] font-black uppercase tracking-[0.15em] break-words whitespace-normal ${isExpanded ? 'text-[var(--accent-primary)]' : 'text-[var(--text-secondary)] opacity-40'}`}>
              {subtitle}
            </span>
          </div>
        </div>

        {/* Interactive Indicator - 44px touch zone */}
        <div className={`h-11 w-11 flex items-center justify-center transition-all duration-300 ${isExpanded ? 'rotate-90 bg-[var(--accent-primary)]/10 rounded-full' : ''}`}>
          <ChevronRight className={`h-4 w-4 transition-colors ${isExpanded ? 'text-[var(--accent-primary)]' : 'text-[var(--text-secondary)] opacity-20'}`} strokeWidth={1.5} />
        </div>
      </div>

      {/* Detail Expansion (Revealed on Click) */}
      <div 
        className={`overflow-hidden transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}
        aria-hidden={!isExpanded}
      >
        <div className="px-6 pb-8 pt-2 bg-[var(--bg-secondary)]/10 animate-fade-in-up">
          {/* Metadata/Content Area */}
          <div className="text-sm text-[var(--text-primary)]/90 leading-relaxed font-medium mb-8 break-words">
            {children}
          </div>
          
          {/* Action Row - 56px (h-14) buttons already exceed 44px touch zone */}
          {actions && actions.length > 0 && (
            <div className="flex flex-wrap gap-4 pt-6 border-t border-[var(--border-color)]/30 mt-6">
              {actions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    action.onClick && action.onClick();
                  }}
                  className={`
                    flex-1 min-w-[130px] h-14 rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] transition-all active:scale-[0.97] flex items-center justify-center gap-3 border shadow-sm
                    ${action.variant === 'danger' 
                      ? 'bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500 hover:text-[var(--bg-primary)]' 
                      : action.variant === 'success'
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500 hover:text-[var(--bg-primary)]'
                      : 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border-[var(--accent-primary)]/20 hover:bg-[var(--accent-primary)] hover:text-[var(--bg-primary)]'}
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
    </div>
  );
});

MobileListItem.displayName = 'MobileListItem';

export default MobileListItem;
