import React from 'react';

/**
 * InteractiveWrapper - A utility component to prevent "Invisible Text" bugs.
 * Automatically handles B&W inversion for Light and Dark modes.
 */
export const InteractiveWrapper = ({ 
  children, 
  onClick, 
  isActive = false, 
  className = "",
  padding = "px-4 py-3"
}) => {
  const lightStyles = isActive 
    ? "bg-black text-zinc-50 shadow-lg shadow-black/10" 
    : "text-zinc-900 hover:bg-zinc-200/50 active:bg-black active:text-zinc-50";

  const darkStyles = isActive 
    ? "bg-zinc-100 text-black shadow-lg shadow-white/5" 
    : "text-zinc-300 hover:bg-white/10 active:bg-zinc-100 active:text-black";

  return (
    <div
      onClick={onClick}
      className={`
        relative cursor-pointer transition-all duration-200 rounded-xl leading-relaxed font-medium break-words
        ${padding}
        ${lightStyles}
        dark:${darkStyles}
        ${className}
      `}
    >
      {children}
    </div>
  );
};
