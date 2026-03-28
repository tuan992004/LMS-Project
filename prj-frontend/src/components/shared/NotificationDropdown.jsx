import React, { useEffect } from 'react';
import { 
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
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/userAuthStore';

/**
 * NotificationDropdown - Minimalist monochrome dropdown for Desktop.
 */
export const NotificationDropdown = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { 
    notifications, 
    fetchNotifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    undoLastAction
  } = useNotificationStore();
  
  const { t } = useTranslation();
  const { format: timeAgo } = useTimeAgo();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const getNotificationPath = () => {
    if (user?.role === 'admin') return '/admin/notifications';
    if (user?.role === 'instructor') return '/teacher/notifications';
    return '/student/notifications';
  };

  const handleMarkAllAndNavigate = async () => {
    await markAllAsRead();
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
    <div className="absolute top-full right-0 mt-4 w-80 bg-[var(--bg-primary)] border border-[var(--border-color)] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] z-[110] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200 origin-top-right !rounded-3xl">
      {/* Header */}
      <div className="px-6 py-5 border-b border-[var(--border-color)]/50 flex justify-between items-center bg-[var(--bg-secondary)]/30 backdrop-blur-md">
        <h3 className="text-sm font-medium text-[var(--text-primary)] uppercase tracking-widest">{t('notif_title')}</h3>
      </div>

      {/* List */}
      <div className="overflow-y-auto max-h-[400px] custom-scrollbar">
        {notifications.length === 0 ? (
          <div className="py-16 px-8 flex flex-col items-center justify-center text-center">
            <BellOff className="h-10 w-10 text-zinc-400 opacity-20 mb-4" />
            <p className="text-xs font-medium text-zinc-500 italic">{t('notif_empty')}</p>
          </div>
        ) : (
          <ul className="divide-y divide-[var(--border-color)]/30">
            {notifications.slice(0, 20).map((n) => {
              const { icon: Icon, color } = getIcon(n.type);
              return (
                <li 
                  key={n.id} 
                  className={`
                    group relative px-6 py-5 flex gap-4 transition-all duration-300
                    ${n.is_read ? 'opacity-50 grayscale-[0.5]' : 'bg-zinc-100 dark:bg-white/5'}
                  `}
                >
                  <div className={`mt-1 h-8 w-8 shrink-0 rounded-lg flex items-center justify-center bg-zinc-100 dark:bg-white/10 ${color}`}>
                    <Icon size={16} strokeWidth={1.5} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs leading-relaxed break-words font-medium italic ${n.is_read ? 'text-zinc-500' : 'text-zinc-900 dark:text-zinc-100'}`}>
                      {n.message}
                    </p>
                    <span className="text-[9px] text-zinc-500 font-medium mt-2 block uppercase tracking-widest opacity-40">
                      {timeAgo(n.created_at)}
                    </span>
                  </div>
                  
                  <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
                    {!n.is_read && (
                      <button 
                        onClick={() => markAsRead(n.id)}
                        className="h-8 w-8 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-black transition-all flex items-center justify-center shadow-sm"
                      >
                        <CheckCircle2 size={14} strokeWidth={1.5} />
                      </button>
                    )}
                    <button 
                      onClick={(e) => handleDelete(n.id, e)}
                      className="h-8 w-8 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center"
                    >
                      <Trash2 size={14} strokeWidth={1.5} />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Footer - Role-aware Navigation (Always Visible) */}
      <div className="p-2 bg-[var(--bg-secondary)]/30 border-t border-[var(--border-color)]/50 grid grid-cols-1 gap-1">
        {notifications.length > 0 && (
          <button 
            onClick={handleMarkAllAndNavigate}
            className="w-full py-3 rounded-xl text-[10px] font-medium uppercase tracking-widest text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-white/5 transition-all italic"
          >
            {t('notif_mark_all')}
          </button>
        )}
        <Link 
          to={getNotificationPath()}
          className="w-full py-3 rounded-xl text-[10px] font-medium uppercase tracking-widest bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-black text-center transition-all italic shadow-sm"
        >
          {t('notif_view_all')}
        </Link>
      </div>
    </div>
  );
};
