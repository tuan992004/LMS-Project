import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  ClipboardList, 
  Bell, 
  Users, 
  GraduationCap 
} from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuthStore } from '../../stores/userAuthStore';

/**
 * MobileFooterNav - Strict Monochrome version.
 * FIXED: Active state uses proper inversion for light mode.
 * FIXED: font-bold → font-medium for "No Bold" compliance.
 * FIXED: Active text-black ensures visibility on zinc-50 bg.
 */
export const MobileFooterNav = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();

  if (!user) return null;

  const getNavItems = () => {
    switch (user.role) {
      case 'admin':
        return [
          { to: '/admin', label: t('nav_dashboard'), icon: LayoutDashboard },
          { to: '/admin/users', label: t('nav_users'), icon: Users },
          { to: '/admin/courses', label: t('nav_courses'), icon: BookOpen },
          { to: '/admin/notifications', label: t('nav_updates'), icon: Bell },
        ];
      case 'instructor':
        return [
          { to: '/teacher', label: t('nav_dashboard'), icon: LayoutDashboard },
          { to: '/teacher/courses', label: t('nav_courses'), icon: BookOpen },
          { to: '/teacher/students', label: t('nav_students'), icon: GraduationCap },
          { to: '/teacher/notifications', label: t('nav_updates'), icon: Bell },
        ];
      case 'student':
      default:
        return [
          { to: '/student', label: t('nav_dashboard'), icon: LayoutDashboard },
          { to: '/student/courses', label: t('nav_courses'), icon: BookOpen },
          { to: '/student/assignments', label: t('nav_tasks'), icon: ClipboardList },
          { to: '/student/notifications', label: t('nav_updates'), icon: Bell },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-[var(--bg-primary)] border-t border-[var(--border-color)] pb-[env(safe-area-inset-bottom)] transition-colors duration-300">
      <div className="relative flex h-16 items-center justify-around px-2">
        {navItems.map((item, idx) => (
          <NavLink
            key={idx}
            to={item.to}
            end={item.to.split('/').length <= 2}
            className={({ isActive }) => `
              relative flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all duration-200 ease-out active:scale-90
              ${isActive 
                ? 'text-[var(--text-primary)]' 
                : 'text-[var(--text-secondary)] opacity-60'}
            `}
          >
            {({ isActive }) => (
              <>
                <div className={`transition-all duration-300 ${isActive ? 'scale-110 opacity-100' : 'opacity-70'}`}>
                  <item.icon strokeWidth={1.5} className="h-5 w-5 shrink-0" />
                </div>
                <span className={`
                  text-[10px] font-medium tracking-wider uppercase leading-relaxed text-center px-1 break-words
                  ${isActive ? 'opacity-100' : 'opacity-60'}
                `}>
                  {item.label}
                </span>
                {isActive && (
                  <div className="absolute -bottom-1.5 h-0.5 w-4 bg-[var(--accent-primary)] rounded-full transition-all duration-300 shadow-[0_0_8px_var(--accent-primary)]" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
