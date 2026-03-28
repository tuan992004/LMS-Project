import React from 'react';
import { User, Settings as SettingsIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '../../stores/useUIStore';
import { useAuthStore } from '../../stores/userAuthStore';
import { useTranslation } from '../../hooks/useTranslation';

/**
 * MobileHeader - Strict Monochrome version.
 * FIXED: All text uses var(--text-*) tokens for guaranteed visibility.
 * FIXED: Active states properly invert background and text.
 * FIXED: font-bold → font-medium.
 */
export const MobileHeader = () => {
  const { toggleSettings } = useUIStore();
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleProfileClick = () => {
    const roleBase = user?.role === 'admin' ? '/admin' : user?.role === 'instructor' ? '/teacher' : '/student';
    navigate(`${roleBase}/settings`);
  };

  return (
    <header
      className="lg:hidden sticky top-0 z-50 h-16 bg-[var(--nav-bg)] backdrop-blur-md border-b border-[var(--border-color)] px-6 flex items-center justify-between transition-colors duration-300"
      aria-label="Mobile Utility Header"
    >
      {/* Left: Brand - Muted Primary Tier */}
      <div className="flex flex-col select-none">
        <span className="text-[8px] font-medium uppercase tracking-[0.4em] text-[var(--text-secondary)] leading-relaxed mb-1">
          {t('portal_identity')}
        </span>
        <span className="text-sm font-medium tracking-tight text-[var(--text-primary)] italic leading-relaxed">
          LMS
        </span>
      </div>

      {/* Right: Tools - Icons with proper active inversion */}
      <div className="flex items-center gap-1">
        <button
          onClick={toggleSettings}
          className="h-11 w-11 flex items-center justify-center rounded-full text-[var(--text-primary)] opacity-70 hover:opacity-100 active:bg-[var(--accent-primary)] active:text-[var(--bg-primary)] active:opacity-100 active:scale-90 transition-all duration-200 ease-out"
          aria-label={t('nav_settings_aria')}
        >
          <SettingsIcon strokeWidth={1.5} size={20} className="shrink-0" />
        </button>
      </div>
    </header>
  );
};
