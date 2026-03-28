import React from 'react';
import { ChevronRight } from 'lucide-react';

/**
 * SettingRow - A reusable component for the Account Settings page.
 * FIXED: Active state uses proper bg-[var(--accent-primary)] / text-[var(--bg-primary)] inversion.
 * FIXED: Default state has visible icon colors in light mode (text-zinc-900 / dark:text-zinc-400).
 * FIXED: font-bold → font-medium for "No Bold" compliance.
 * FIXED: All text elements use leading-relaxed for VN diacritic safety.
 */
export const SettingRow = ({ 
  icon: Icon, 
  label, 
  value, 
  onClick, 
  isActive = false,
  className = "" 
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center justify-between gap-4 px-5 py-5 rounded-2xl transition-all duration-300 group
        ${isActive 
          ? 'bg-[var(--accent-primary)] text-[var(--bg-primary)] shadow-lg shadow-black/10' 
          : 'bg-[var(--card-bg)] border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'}
        ${className}
      `}
    >
      <div className="flex items-center gap-4 min-w-0">
        {Icon && (
          <div className={`
            shrink-0 flex items-center justify-center transition-colors duration-300
            ${isActive ? 'text-[var(--bg-primary)]' : 'text-[var(--text-primary)] opacity-70'}
          `}>
            <Icon size={20} strokeWidth={1.5} />
          </div>
        )}
        <div className="flex flex-col items-start min-w-0">
          <span className={`text-sm font-medium leading-relaxed break-words ${isActive ? 'opacity-100' : 'opacity-90'}`}>
            {label}
          </span>
          {value && (
            <span className={`text-[10px] uppercase tracking-widest font-medium mt-0.5 truncate w-full leading-relaxed ${isActive ? 'opacity-60' : 'opacity-40'}`}>
              {value}
            </span>
          )}
        </div>
      </div>
      
      <div className={`shrink-0 transition-all duration-300 ${isActive ? 'translate-x-1 opacity-100' : 'opacity-20 group-hover:opacity-60'}`}>
        <ChevronRight size={18} strokeWidth={1.5} />
      </div>
    </button>
  );
};
