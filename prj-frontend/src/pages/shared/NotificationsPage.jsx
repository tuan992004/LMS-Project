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
import { api } from '../../lib/axios';
import { toast } from 'sonner';
import { useAuthStore } from '../../stores/userAuthStore';

import { useNavigate } from 'react-router-dom';

/**
 * NotificationsPage - Dedicated view for full notification management.
 * Follows strict Monochrome Minimalist guidelines.
 */
export const NotificationsPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
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
        return { icon: CheckCircle, color: 'text-[var(--text-primary)]' };
      case 'assignment_due':
      case 'security':
        return { icon: AlertTriangle, color: 'text-[var(--text-primary)]' };
      case 'enrollment_request':
        return { icon: UserPlus, color: 'text-violet-500' };
      default:
        return { icon: Info, color: 'text-[var(--text-primary)]' };
    }
  };

  const handleNotificationClick = (n) => {
    if (!n.is_read) {
        markAsRead(n.id);
    }
    
    // Parse data if it exists
    let data = n.data;
    if (typeof data === 'string') {
        try {
            data = JSON.parse(data);
        } catch (e) {
            console.error("Failed to parse notification data", e);
            data = null;
        }
    }

    if (!data) return;

    // Navigate based on type
    if (n.type === 'assignment_graded' || n.type === 'new_assignment') {
        if (data.assignmentId) {
            navigate(`/student/assignment/${data.assignmentId}`);
        }
    } else if (n.type === 'enrollment_request') {
        if (data.courseId) {
            const rolePrefix = user?.role === 'instructor' ? 'teacher' : 'admin';
            navigate(`/${rolePrefix}/course/${data.courseId}/students`);
        }
    } else if (n.type === 'assignment_submitted') {
         if (data.assignmentId) {
             if (user?.role === 'admin') {
                 // Admin route doesn't require course ID context
                 navigate(`/admin/assignment/${data.assignmentId}`);
             } else if (data.courseId) {
                 // Teacher route requires the course context for role-based access
                 navigate(`/teacher/course/${data.courseId}/assignment/${data.assignmentId}`);
             }
         }
    }
  };

  // --- US-18: Admin Approval Action ---
  const handleApprovalAction = async (notif, action) => {
    try {
      let data = notif.data;
      if (typeof data === 'string') data = JSON.parse(data);
      
      await api.post('/enrollments/approve', {
        studentId: data.studentId,
        courseId: data.courseId,
        instructorId: data.instructorId,
        action: action,
        notificationId: notif.id
      });
      
      toast.success(action === 'approve' ? 'Enrollment approved' : 'Enrollment denied');
      fetchNotifications(); // Refresh list
    } catch (error) {
      console.error(error);
      toast.error('Failed to process approval');
    }
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    deleteNotification(id);
    showUndoToast(t('notif_deleted'), undoLastAction, t);
  };

  return (
    <section className="flex-1 min-h-screen bg-[var(--bg-primary)] transition-colors duration-500 animate-fade-in relative overflow-x-hidden">
      {/* Decorative Top Accent */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--accent-primary)]/10 to-transparent" />

      {/* Sticky Header */}
      <header className="sticky top-0 z-30 bg-[var(--bg-primary)]/80 backdrop-blur-md border-b border-[var(--border-color)]">
        <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-black text-[var(--text-primary)] tracking-tighter italic leading-none">
              {t('notif_title')}
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--text-secondary)] opacity-40 italic">
              {unreadCount} {t('notif_new_count')}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button 
              onClick={markAllAsRead}
              className="flex-1 md:flex-none h-11 px-6 rounded-xl bg-[var(--text-primary)] text-[var(--bg-primary)] text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-xl italic"
            >
              {t('notif_mark_all')}
            </button>
            <button 
              onClick={clearAllNotifications}
              className="flex-1 md:flex-none h-11 px-6 rounded-xl border border-[var(--border-color)] text-[var(--text-primary)] text-[10px] font-black uppercase tracking-widest hover:bg-[var(--text-primary)]/[0.03] active:scale-95 transition-all italic"
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
            <Loader2 className="h-8 w-8 animate-spin text-[var(--accent-primary)] mb-4 opacity-20" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)] opacity-40 italic">
              Synchronizing updates...
            </p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-32 text-center flex flex-col items-center justify-center border-2 border-dashed border-[var(--border-color)] rounded-[2.5rem]">
            <div className="w-20 h-20 bg-[var(--bg-secondary)] rounded-full flex items-center justify-center mb-8">
              <BellOff className="h-8 w-8 text-[var(--text-secondary)] opacity-40" />
            </div>
            <h3 className="text-xl font-black text-[var(--text-primary)] mb-2 italic">
              {t('notif_empty')}
            </h3>
            <p className="text-[var(--text-secondary)] text-sm font-medium italic opacity-60">
              {t('notif_empty_sub')}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((n, idx) => {
              const { icon: Icon } = getIcon(n.type);
              return (
                <article 
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`
                    group relative p-6 md:p-8 rounded-3xl border transition-all duration-500 animate-fade-in-up stagger-${(idx % 5) + 1} cursor-pointer
                    ${n.is_read 
                      ? 'bg-transparent border-[var(--border-color)] opacity-60 grayscale-[0.5]' 
                      : 'bg-[var(--card-bg)] border-[var(--card-border)] shadow-xl shadow-black/5'}
                  `}
                >
                  <div className="flex gap-6 md:gap-8 items-start">
                    <div className={`mt-1 h-10 w-10 shrink-0 rounded-xl flex items-center justify-center bg-[var(--bg-secondary)] text-[var(--text-primary)]`}>
                      <Icon size={18} strokeWidth={1.5} />
                    </div>
                    
                    <div className="flex-1 min-w-0 space-y-4">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-4">
                           <p className={`text-base md:text-lg leading-relaxed break-words font-medium italic ${n.is_read ? 'text-[var(--text-secondary)]' : 'text-[var(--text-primary)]'}`}>
                             {n.message?.length > 240 ? n.message.substring(0, 240) + "..." : n.message}
                           </p>
                           {!n.is_read && (
                             <div className="h-2 w-2 rounded-full bg-[var(--accent-primary)] shrink-0 shadow-[0_0_8px_var(--accent-primary)]" />
                           )}
                        </div>
                        <span className="text-[10px] text-[var(--text-secondary)] font-black mt-2 block uppercase tracking-[0.2em] opacity-60">
                          {timeAgo(n.created_at)}
                        </span>
                      </div>

                      {/* US-18: Admin Approval UI on Full Page */}
                      {n.type === 'enrollment_request' && !n.is_read && user?.role === 'admin' && (
                        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[var(--border-color)]/30 animate-in fade-in slide-in-from-top-2">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleApprovalAction(n, 'approve'); }}
                            className="h-10 px-6 rounded-xl bg-violet-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-violet-700 transition-all shadow-lg shadow-violet-600/20 active:scale-95 flex items-center gap-2"
                          >
                            <CheckCircle2 size={14} />
                            Approve Request
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleApprovalAction(n, 'deny'); }}
                            className="h-10 px-6 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-primary)] text-[10px] font-black uppercase tracking-widest border border-[var(--border-color)] hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/20 transition-all active:scale-95 flex items-center gap-2"
                          >
                            <Trash2 size={14} />
                            Deny
                          </button>
                        </div>
                      )}
                    </div>

                    <button 
                      onClick={(e) => handleDelete(n.id, e)}
                      className="flex-none h-11 w-11 flex items-center justify-center rounded-xl hover:bg-rose-500/10 hover:text-rose-500 text-[var(--text-secondary)] opacity-0 group-hover:opacity-100 transition-all duration-300"
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
    </section>
  );
};
