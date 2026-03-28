import React, { useEffect } from 'react';
import { 
  X, 
  BellOff, 
  CheckCircle2, 
  Trash2, 
  Info, 
  AlertTriangle, 
  CheckCircle,
  UserPlus,
  ShieldAlert
} from 'lucide-react';
import { useNotificationStore } from '../../stores/useNotificationStore';
import { useTranslation } from '../../hooks/useTranslation';
import { useTimeAgo } from '../../hooks/useTimeAgo';
import { showUndoToast } from './UndoToast';
import { useUIStore } from '../../stores/useUIStore';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/userAuthStore';

/**
 * NotificationDrawer - Advanced full-height slide-over for Mobile.
 * Features: Large touch targets, role-aware navigation, and Undo support.
 */
export const NotificationDrawer = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { 
    notifications, 
    unreadCount, 
    fetchNotifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    undoLastAction
  } = useNotificationStore();
  
  const { isNotificationsOpen, toggleNotifications } = useUIStore();
  const { t } = useTranslation();
  const { format: timeAgo } = useTimeAgo();

  useEffect(() => {
    if (isNotificationsOpen) {
      fetchNotifications();
    }
  }, [isNotificationsOpen]);

  const getNotificationPath = () => {
    if (user?.role === 'admin') return '/admin/notifications';
    if (user?.role === 'instructor') return '/teacher/notifications';
    return '/student/notifications';
  };

  const handleMarkAllAndNavigate = async () => {
    await markAllAsRead();
    toggleNotifications();
    navigate(getNotificationPath());
  };

  const getIcon = (type) => {
    switch (type) {
      case 'assignment_graded':
      case 'grade':
        return { icon: CheckCircle, color: 'text-zinc-900 dark:text-zinc-100' };
      case 'assignment_due':
      case 'security':
        return { icon: AlertTriangle, color: 'text-zinc-900 dark:text-zinc-100' };
      default:
        return { icon: Info, color: 'text-zinc-900 dark:text-zinc-100' };
    }
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    deleteNotification(id);
    showUndoToast(t('notif_deleted'), undoLastAction, t);
  };

  return (
    <aside className={`fixed inset-0 z-[200] lg:hidden pointer-events-none transition-all duration-500`}>
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto transition-opacity duration-500 ${isNotificationsOpen ? 'opacity-100' : 'opacity-0 !pointer-events-none'}`} 
        onClick={toggleNotifications}
      />
      
      {/* Drawer */}
      <div className={`absolute right-0 top-0 bottom-0 w-[85%] max-w-[400px] bg-[var(--bg-primary)] shadow-2xl pointer-events-auto transition-transform duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) ${isNotificationsOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full overflow-hidden">
          
          {/* Header */}
          <header className="px-8 pt-12 pb-8 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900">
            <div className="flex flex-col">
              <span className="text-[10px] font-medium uppercase tracking-[0.4em] text-zinc-500 italic mb-1">
                UPDATES
              </span>
              <h2 className="text-2xl font-medium text-[var(--text-primary)] tracking-tighter italic uppercase">
                {t('notif_title')}
              </h2>
            </div>
            <button
              onClick={toggleNotifications}
              className="h-12 w-12 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-zinc-800 text-[var(--text-secondary)] active:scale-90 transition-all"
            >
              <X strokeWidth={1} className="h-6 w-6" />
            </button>
          </header>

          {/* Quick Actions */}
          {unreadCount > 0 && (
            <div className="px-8 py-4 bg-zinc-100 dark:bg-white/5 flex justify-between items-center">
              <span className="text-[10px] font-medium uppercase tracking-widest text-zinc-500 italic">
                {unreadCount} {t('notif_new_count')}
              </span>
              <button 
                onClick={handleMarkAllAndNavigate}
                className="text-[10px] font-medium uppercase tracking-widest text-zinc-900 dark:text-zinc-100 italic"
              >
                {t('notif_mark_all')}
              </button>
            </div>
          )}

          {/* List */}
          <div className="flex-1 overflow-y-auto no-scrollbar pb-12">
            {notifications.length === 0 ? (
              <div className="py-32 px-12 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 rounded-[2.5rem] bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-8 border border-zinc-200 dark:border-zinc-800 shadow-inner">
                  <BellOff className="h-10 w-10 text-zinc-400 opacity-20" />
                </div>
                <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2 italic">{t('notif_empty')}</h3>
                <p className="text-sm text-zinc-500 font-medium opacity-60 italic">{t('notif_empty_sub')}</p>
              </div>
            ) : (
              <ul className="divide-y divide-zinc-100 dark:divide-zinc-900">
                {notifications.map((n) => {
                  const { icon: Icon, color } = getIcon(n.type);
                  return (
                    <li 
                      key={n.id} 
                      className={`
                        group relative px-8 py-8 flex gap-6 transition-all duration-300
                        ${n.is_read ? 'opacity-40 grayscale-[0.5]' : 'bg-zinc-100/50 dark:bg-white/5'}
                      `}
                    >
                      <div className={`mt-1 h-12 w-12 shrink-0 rounded-2xl flex items-center justify-center shadow-sm bg-zinc-100 dark:bg-white/10 ${color}`}>
                        <Icon size={20} strokeWidth={1.5} />
                      </div>
                      
                      <div className="flex-1 min-w-0 space-y-4">
                        <p className={`text-sm leading-relaxed break-words font-medium italic ${n.is_read ? 'text-zinc-500' : 'text-zinc-900 dark:text-zinc-100'}`}>
                          {n.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-[0.2em] opacity-40">
                            {timeAgo(n.created_at)}
                          </span>
                          
                          <div className="flex items-center gap-4">
                            {!n.is_read && (
                              <button 
                                onClick={() => markAsRead(n.id)}
                                className="h-11 w-11 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-black active:scale-90 transition-all flex items-center justify-center shadow-sm"
                              >
                                <CheckCircle2 size={18} strokeWidth={1.5} />
                              </button>
                            )}
                            <button 
                              onClick={(e) => handleDelete(n.id, e)}
                              className="h-11 w-11 rounded-xl bg-rose-500/10 text-rose-500 active:scale-90 transition-all flex items-center justify-center border border-rose-500/10"
                            >
                              <Trash2 size={18} strokeWidth={1.5} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Footer (Always Visible) */}
          <footer className="p-4 bg-zinc-50 dark:bg-zinc-900/30 border-t border-zinc-100 dark:border-zinc-900 grid grid-cols-1">
            <Link 
              to={getNotificationPath()}
              onClick={toggleNotifications}
              className="w-full h-14 flex items-center justify-center rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-black font-medium text-[10px] uppercase tracking-[0.4em] italic shadow-xl active:scale-95 transition-all"
            >
              {t('notif_view_all')}
            </Link>
          </footer>
        </div>
      </div>
    </aside>
  );
};
