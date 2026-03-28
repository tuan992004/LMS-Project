import React from 'react';
import { Sun, Moon } from 'lucide-react';
import useThemeStore from '../../stores/useThemeStore';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 rounded-2xl bg-[var(--bg-secondary)] hover:bg-opacity-80 transition-all duration-300 flex items-center justify-center border border-[var(--border-color)] shadow-sm group active:scale-95"
      aria-label="Toggle Theme"
    >
      <div className="relative w-5 h-5">
        <Sun
          className={`absolute inset-0 transition-all duration-500 transform ${
            theme === 'dark' ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100 text-amber-500'
          }`}
          size={20}
        />
        <Moon
          className={`absolute inset-0 transition-all duration-500 transform ${
            theme === 'dark' ? 'rotate-0 scale-100 opacity-100 text-indigo-400' : '-rotate-90 scale-0 opacity-0'
          }`}
          size={20}
        />
      </div>
    </button>
  );
};

export default ThemeToggle;
