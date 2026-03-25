import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCircle2, Trash2, X, BellOff, Dot } from 'lucide-react';
import { api } from '../../lib/axios';
import { toast } from 'sonner';

export const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error("Lỗi lấy thông báo:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
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

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: 1 } : n));
    } catch (error) {
      toast.error("Lỗi cập nhật trạng thái");
    }
  };

  const deleteNotification = (id, e) => {
    e.stopPropagation();
    const previous = [...notifications];
    setNotifications(prev => prev.filter(n => n.id !== id));

    const timer = setTimeout(async () => {
        try {
          await api.delete(`/notifications/${id}`);
        } catch (error) {
          toast.error("Lỗi xóa thông báo");
          setNotifications(previous);
        }
    }, 5000);

    toast.success("Notification deleted", {
        duration: 5000,
        action: {
            label: 'Undo',
            onClick: () => {
                clearTimeout(timer);
                setNotifications(previous);
                toast.success("Undo successful");
            }
        }
    });
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, is_read: 1 })));
      toast.success("All caught up!");
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const timeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`
          relative p-2.5 rounded-2xl transition-all duration-200 active:scale-95
          ${isOpen ? 'bg-[var(--accent-primary)] text-white shadow-lg' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'}
        `}
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500 border-2 border-white shadow-sm"></span>
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-4 w-80 sm:w-[420px] glass-card shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200 origin-top-right border border-white/20">
          {/* Header */}
          <div className="px-8 py-6 border-b border-[var(--border-color)] flex justify-between items-center bg-white/30 backdrop-blur-md">
            <div>
              <h3 className="text-xl font-black text-[var(--text-primary)] tracking-tight">Thông báo</h3>
              <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-[0.2em] font-black mt-1">
                {unreadCount} tin nhắn mới
              </p>
            </div>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="px-4 py-2 rounded-xl bg-indigo-500/10 text-indigo-500 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all shadow-sm"
              >
                Đánh dấu tất cả
              </button>
            )}
          </div>

          {/* List */}
          <div className="overflow-y-auto max-h-[480px] custom-scrollbar bg-white/10">
            {notifications.length === 0 ? (
              <div className="py-20 px-8 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 rounded-[2.5rem] bg-[var(--bg-secondary)] flex items-center justify-center mb-6 shadow-inner border border-[var(--border-color)]">
                  <BellOff className="h-10 w-10 text-[var(--text-secondary)] opacity-20" />
                </div>
                <p className="text-lg font-bold text-[var(--text-primary)]">Hiện không có thông báo</p>
                <p className="text-sm text-[var(--text-secondary)] mt-2 font-medium">Hệ thống sẽ cập nhật tin tức mới nhất tại đây.</p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--border-color)]">
                {notifications.map((n) => (
                  <div 
                    key={n.id} 
                    className={`
                      group relative px-8 py-6 flex gap-5 transition-all duration-300 cursor-default
                      ${n.is_read ? 'opacity-60 hover:opacity-100 grayscale-[0.5] hover:grayscale-0' : 'bg-[var(--accent-primary)]/5'}
                    `}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3">
                        {!n.is_read && (
                            <div className="mt-1.5 shrink-0">
                                <div className="h-2.5 w-2.5 rounded-full bg-[var(--accent-primary)] shadow-lg shadow-indigo-500/50" />
                            </div>
                        )}
                        <div>
                            <p className={`text-sm leading-relaxed ${n.is_read ? 'text-[var(--text-secondary)] font-medium' : 'text-[var(--text-primary)] font-bold'}`}>
                                {n.message}
                            </p>
                            <span className="text-[10px] text-[var(--text-secondary)] font-black mt-3 block uppercase tracking-[0.1em] opacity-60">
                                {timeAgo(n.created_at)}
                            </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
                      {!n.is_read && (
                        <button 
                          onClick={(e) => markAsRead(n.id, e)}
                          className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all shadow-sm active:scale-90"
                          title="Mark as read"
                        >
                          <CheckCircle2 size={18} />
                        </button>
                      )}
                      <button 
                        onClick={(e) => deleteNotification(n.id, e)}
                        className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm active:scale-90"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-5 bg-white/30 backdrop-blur-md border-t border-[var(--border-color)] text-center">
              <button className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-all">
                Xem tất cả hoạt động
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
