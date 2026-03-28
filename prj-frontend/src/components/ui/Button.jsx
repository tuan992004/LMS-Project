import React from 'react';

/**
 * Button - Strict Monochrome high-contrast button.
 * Implements color inversion logic for Light/Dark modes.
 */
export const Button = ({ 
  children, 
  onClick, 
  type = "button", 
  variant = "primary", // primary (solid) | secondary (outline)
  className = "",
  disabled = false,
  icon: Icon
}) => {
  const baseStyles = "inline-flex items-center justify-center gap-3 px-8 h-14 rounded-2xl font-medium text-[10px] uppercase tracking-[0.2em] transition-all duration-200 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-[var(--text-primary)] text-[var(--bg-primary)] border border-[var(--text-primary)] hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)]",
    secondary: "bg-transparent text-[var(--text-primary)] border border-[var(--border-color)] hover:border-[var(--text-primary)]"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {Icon && <Icon size={18} strokeWidth={1.5} />}
      <span className="italic">{children}</span>
    </button>
  );
};
