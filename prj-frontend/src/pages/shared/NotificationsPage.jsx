import React, { useEffect } from 'react';
import { 
  Bell, 
  BellOff, 
  CheckCircle2, 
  Trash2, 
  Info, 
  AlertTriangle, 
  CheckCircle,
  UserPlus,
  ShieldAlert,
  Loader2,
  Trash
} from 'lucide-react';
import { useNotificationStore } from '../../stores/useNotificationStore';
import { useTranslation } from '../../hooks/useTranslation';
import { useTimeAgo } from '../../hooks/useTimeAgo';
import { showUndoToast } from '../../components/shared/UndoToast';

/**
 * NotificationsPage - Dedicated view for full notification management.
 * Follows strict Monochrome Minimalist guidelines.
 */
export const NotificationsPage = () => {
  const { 
    notifications, 
    loading,
    unreadCount, 
    fetchNotifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    clearAllNotifications,
    undoLastAction
  } = useNotificationStore();
  
  const { t } = useTranslation();
  const { format: timeAgo } = useTimeAgo();

  useEffect(() => {
    fetchNotifications();
  }, []);

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
    <main className="min-h-screen bg-zinc-50 dark:bg-black transition-colors duration-300">
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 bg-zinc-50/80 dark:bg-black/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-medium text-zinc-900 dark:text-zinc-300 tracking-tighter italic leading-relaxed">
              {t('notif_title')}
            </h1>
            <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-zinc-500 italic">
              {unreadCount} {t('notif_new_count')}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button 
              onClick={markAllAsRead}
              className="flex-1 md:flex-none h-11 px-6 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-black text-[10px] font-medium uppercase tracking-widest active:scale-95 transition-all shadow-sm italic"
            >
              {t('notif_mark_all')}
            </button>
            <button 
              onClick={clearAllNotifications}
              className="flex-1 md:flex-none h-11 px-6 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-300 text-[10px] font-medium uppercase tracking-widest hover:bg-zinc-200/50 dark:hover:bg-white/5 active:scale-95 transition-all italic"
            >
              {t('notif_clear_all')}
            </button>
          </div>
        </div>
      </header>

      {/* Content Area */}
      <div className="max-w-4xl mx-auto px-6 py-12 pb-32">
        {loading && notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 animate-pulse">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-900 dark:text-zinc-100 mb-4 opacity-20" />
            <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-zinc-500 italic">
              Synchronizing updates...
            </p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-32 text-center flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[2.5rem]">
            <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-8">
              <BellOff className="h-8 w-8 text-zinc-400 opacity-40" />
            </div>
            <h3 className="text-xl font-medium text-zinc-900 dark:text-zinc-300 mb-2 italic">
              {t('notif_empty')}
            </h3>
            <p className="text-zinc-500 text-sm font-medium italic opacity-60">
              {t('notif_empty_sub')}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((n, idx) => {
              const { icon: Icon, color } = getIcon(n.type);
              return (
                <article 
                  key={n.id}
                  onClick={() => !n.is_read && markAsRead(n.id)}
                  className={`
                    group relative p-6 md:p-8 rounded-3xl border transition-all duration-500 animate-fade-in-up stagger-${(idx % 5) + 1} cursor-pointer
                    ${n.is_read 
                      ? 'bg-transparent border-zinc-200 dark:border-zinc-800 opacity-60 grayscale-[0.5]' 
                      : 'bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 shadow-xl shadow-black/5'}
                  `}
                >
                  <div className="flex gap-6 md:gap-8 items-start">
                    <div className={`mt-1 h-10 w-10 shrink-0 rounded-xl flex items-center justify-center bg-zinc-100 dark:bg-white/5 ${color}`}>
                      <Icon size={18} strokeWidth={1.5} />
                    </div>
                    
                    <div className="flex-1 min-w-0 space-y-4">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-4">
                           <p className={`text-base md:text-lg leading-relaxed break-words font-medium italic ${n.is_read ? 'text-zinc-500' : 'text-zinc-900 dark:text-zinc-100'}`}>
                             {n.message}
                           </p>
                           {!n.is_read && (
                             <div className="h-2 w-2 rounded-full bg-zinc-900 dark:bg-zinc-100 shrink-0 shadow-[0_0_8px_rgba(0,0,0,0.2)]" />
                           )}
                        </div>
                        <span className="text-[10px] text-zinc-500 font-medium mt-2 block uppercase tracking-[0.2em] opacity-60">
                          {timeAgo(n.created_at)}
                        </span>
                      </div>
                    </div>

                    <button 
                      onClick={(e) => handleDelete(n.id, e)}
                      className="flex-none h-11 w-11 flex items-center justify-center rounded-xl hover:bg-rose-500/10 hover:text-rose-500 text-zinc-400 opacity-0 group-hover:opacity-100 transition-all duration-300"
                      aria-label="Delete"
                    >
                      <Trash size={18} strokeWidth={1.5} />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
};
