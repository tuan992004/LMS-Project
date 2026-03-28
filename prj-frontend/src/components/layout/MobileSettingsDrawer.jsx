import React, { useEffect } from 'react';
import { X, Sun, Moon, Languages, UserCog, LogOut, ChevronRight, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '../../stores/useUIStore';
import { useAuthStore } from '../../stores/userAuthStore';
import useThemeStore from '../../stores/useThemeStore';
import useLanguageStore from '../../stores/useLanguageStore';
import { useTranslation } from '../../hooks/useTranslation';

/**
 * MobileSettingsDrawer - Ultra-minimalist utility hub.
 * FIXED: All bg-white/5, border-white/5, border-white/10 replaced with
 * theme-aware --surface-* tokens for light-mode visibility.
 * FIXED: font-bold → font-medium for "No Bold" compliance.
 */
export const MobileSettingsDrawer = () => {
  const { isSettingsOpen, setSettingsOpen } = useUIStore();
  const { user, logOut } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { language, setLanguage } = useLanguageStore();
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setSettingsOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [setSettingsOpen]);

  const handleLogout = () => {
    setSettingsOpen(false);
    logOut();
    navigate('/login');
  };

  const handleAccountEdit = () => {
    setSettingsOpen(false);
    const roleBase = user?.role === 'admin' ? '/admin' : user?.role === 'instructor' ? '/teacher' : '/student';
    navigate(`${roleBase}/settings`);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[110] bg-black/40 backdrop-blur-sm transition-opacity duration-500 lg:hidden ${
          isSettingsOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSettingsOpen(false)}
      />

      {/* Drawer Container */}
      <aside
        className={`fixed top-0 right-0 bottom-0 z-[120] w-[85%] max-w-[360px] bg-[var(--bg-primary)] shadow-2xl transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) lg:hidden ${
          isSettingsOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto no-scrollbar">
          
          {/* Header */}
          <header className="px-8 pt-12 pb-10 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-medium uppercase tracking-[0.4em] text-[var(--accent-primary)] italic mb-1">
                SYSTEM
              </span>
              <h2 className="text-2xl font-medium text-[var(--text-primary)] tracking-tighter italic uppercase leading-relaxed">
                {t('settings_mobile_title')}
              </h2>
            </div>
            <button
              onClick={() => setSettingsOpen(false)}
              className="h-12 w-12 flex items-center justify-center rounded-full bg-[var(--surface-tint)] border border-[var(--surface-border)] text-[var(--text-secondary)] active:scale-90 transition-all"
            >
              <X strokeWidth={1} className="h-6 w-6" />
            </button>
          </header>

          {/* Body Section */}
          <main className="flex-1 px-8 space-y-12 pb-12">
            
            {/* Appearance Section */}
            <div className="space-y-6">
              <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-[var(--text-secondary)] opacity-60 leading-relaxed">
                {t('settings_appearance')}
              </p>
              <button
                onClick={toggleTheme}
                className="w-full flex items-center justify-between group py-2"
              >
                <div className="flex items-center gap-5">
                  <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-[var(--surface-tint)] text-[var(--accent-primary)] shrink-0">
                    {theme === 'light' ? <Sun strokeWidth={1.5} size={20} /> : <Moon strokeWidth={1.5} size={20} />}
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium text-[var(--text-primary)] leading-relaxed">{t('settings_theme')}</span>
                    <span className="text-[10px] font-medium text-[var(--text-secondary)] opacity-60 uppercase tracking-widest leading-relaxed">
                      {theme === 'light' ? t('settings_mode_light') : t('settings_mode_dark')}
                    </span>
                  </div>
                </div>
                <div className="w-12 h-6 rounded-full bg-[var(--surface-tint)] border border-[var(--surface-border)] relative p-1 transition-colors group-hover:bg-[var(--surface-hover)]">
                    <div className={`h-4 w-4 rounded-full bg-[var(--accent-primary)] transition-transform duration-500 ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`} />
                </div>
              </button>
            </div>

            {/* Language Section */}
            <div className="space-y-6">
              <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-[var(--text-secondary)] opacity-60 leading-relaxed">
                {t('settings_language_label')}
              </p>
              <div className="grid grid-cols-2 gap-3 p-1.5 rounded-2xl bg-[var(--surface-tint)] border border-[var(--surface-border)]">
                {['en', 'vi'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`h-12 rounded-xl text-[10px] font-medium tracking-widest transition-all leading-relaxed ${
                      language === lang
                        ? 'bg-[var(--accent-primary)] text-[var(--bg-primary)] shadow-lg'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
                    }`}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Account Section */}
            <div className="space-y-6">
              <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-[var(--text-secondary)] opacity-60 leading-relaxed">
                {t('settings_account')}
              </p>
              <button
                onClick={handleAccountEdit}
                className="w-full flex items-center justify-between group py-2"
              >
                <div className="flex items-center gap-5">
                  <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-[var(--surface-tint)] text-[var(--accent-primary)] shrink-0">
                    <UserCog strokeWidth={1.5} size={20} />
                  </div>
                  <div className="flex flex-col items-start min-w-0 pr-4">
                    <span className="text-sm font-medium text-[var(--text-primary)] truncate max-w-full italic break-words leading-relaxed">{user?.fullname || 'Profile'}</span>
                    <span className="text-[10px] font-medium text-[var(--text-secondary)] opacity-60 uppercase tracking-widest truncate leading-relaxed">{user?.email}</span>
                  </div>
                </div>
                <ChevronRight strokeWidth={1} size={18} className="text-[var(--text-secondary)] opacity-30 group-hover:translate-x-1 transition-all shrink-0" />
              </button>
            </div>

          </main>

          {/* Footer - Minimalist Logout */}
          <footer className="p-8 border-t border-[var(--surface-divider)] bg-[var(--surface-tint)]">
            <button
              onClick={handleLogout}
              className="w-full h-14 flex items-center justify-center gap-4 rounded-2xl text-rose-500 hover:bg-rose-500/10 active:scale-[0.98] transition-all font-medium text-[10px] uppercase tracking-[0.3em] leading-relaxed"
            >
              <LogOut strokeWidth={1.5} size={18} className="shrink-0" />
              {t('nav_logout')}
            </button>
          </footer>
        </div>
      </aside>
    </>
  );
};
