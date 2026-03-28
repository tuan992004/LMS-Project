import React from 'react';

/**
 * Input component with standardized typography and 16px mobile rule.
 * FIXED: Light mode border-zinc-300 for visibility, focus ring-1 ring-black.
 * FIXED: Icon colors properly visible in both themes.
 * FIXED: font-bold → font-medium for "No Bold" compliance.
 */
export const Input = React.forwardRef(({ 
  label, 
  error, 
  icon: Icon,
  className = '', 
  ...props 
}, ref) => {
  return (
    <div className="w-full space-y-2">
      {label && (
        <label className="block text-[10px] font-medium text-[var(--text-secondary)] uppercase tracking-widest px-1 leading-relaxed">
          {label}
        </label>
      )}
      
      <div className="relative group/input">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] opacity-50 h-5 w-5 shrink-0 flex items-center justify-center group-focus-within/input:text-[var(--accent-primary)] group-focus-within/input:opacity-100 transition-colors pointer-events-none">
            <Icon size={20} strokeWidth={1.5} className="shrink-0" />
          </div>
        )}
        
        <input
          ref={ref}
          className={`
            w-full transition-all duration-300 outline-none rounded-2xl border
            ${Icon ? 'pl-14' : 'px-6'} pr-4 py-3.5 
            bg-[var(--bg-secondary)] 
            text-[var(--text-primary)] font-medium
            /* 16px Rule: text-base (16px) on mobile, md:text-sm (14px) on desktop */
            text-base md:text-sm leading-relaxed
            ${error 
              ? 'border-rose-500/50 bg-rose-500/5 ring-1 ring-rose-500/30' 
              : 'border-[var(--border-color)] focus:bg-[var(--bg-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)]'}
            ${className}
          `}
          {...props}
        />
      </div>

      {error && (
        <p className="text-rose-500 text-[10px] font-medium mt-2 px-1 italic leading-relaxed">
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
