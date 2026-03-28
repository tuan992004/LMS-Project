import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { useNotificationStore } from '../../stores/useNotificationStore';
import { useUIStore } from '../../stores/useUIStore';
import { NotificationDropdown } from './NotificationDropdown';

/**
 * NotificationBell - Unified trigger for Desktop (Dropdown) and Mobile (Drawer).
 */
export const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { t } = useTranslation();
  
  const { unreadCount, fetchNotifications } = useNotificationStore();
  const { toggleNotifications } = useUIStore();

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Dynamic update every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (window.innerWidth < 1024) {
      toggleNotifications();
    } else {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button 
        onClick={handleToggle}
        aria-label={t('notif_title')}
        aria-haspopup="true"
        aria-expanded={isOpen}
        className={`
          relative p-2.5 rounded-2xl transition-all duration-300 active:scale-90
          ${isOpen 
            ? 'bg-[var(--accent-primary)] text-[var(--bg-primary)] shadow-lg shadow-black/10' 
            : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'}
        `}
      >
        <Bell className={`h-6 w-6 transition-transform duration-500 ${isOpen ? 'rotate-[15deg]' : ''}`} strokeWidth={1.5} />
        {unreadCount > 0 && (
          <span className="absolute top-2.5 right-2.5 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className={`relative inline-flex rounded-full h-3 w-3 bg-rose-500 border-2 transition-colors duration-300 ${isOpen ? 'border-[var(--accent-primary)]' : 'border-[var(--bg-primary)]'} shadow-sm`}></span>
          </span>
        )}
      </button>

      {/* Desktop Dropdown */}
      <div className="hidden lg:block">
        {isOpen && <NotificationDropdown />}
      </div>
    </div>
  );
};
