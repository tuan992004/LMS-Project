import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCircle2, Trash2 } from 'lucide-react';
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
    // Refresh every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
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
    
    // Optimistically remove
    setNotifications(prev => prev.filter(n => n.id !== id));

    const timer = setTimeout(async () => {
        try {
          await api.delete(`/notifications/${id}`);
        } catch (error) {
          toast.error("Lỗi xóa thông báo");
          fetchNotifications(); // restore on fail
        }
    }, 5000);

    toast.success("Đã xóa thông báo", {
        duration: 5000,
        action: {
            label: 'Hoàn tác',
            onClick: () => {
                clearTimeout(timer);
                fetchNotifications();
                toast.success("Đã hoàn tác xóa");
            }
        }
    });
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, is_read: 1 })));
      toast.success("Đã đánh dấu tất cả là đã đọc");
    } catch (error) {
      toast.error("Lỗi cập nhật trạng thái");
    }
  };

  const timeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return "Vừa xong";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          background: 'none', 
          border: 'none', 
          cursor: 'pointer', 
          position: 'relative',
          padding: '8px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background-color 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        <Bell size={24} color="#111827" />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            backgroundColor: '#ef4444',
            color: 'white',
            fontSize: '0.65rem',
            fontWeight: 'bold',
            width: '18px',
            height: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            border: '2px solid white'
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '110%',
          right: '-10px',
          width: '350px',
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e5e7eb',
          zIndex: 50,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '400px'
        }}>
          {/* Header */}
          <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f9fafb' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 'bold', color: '#111827' }}>Thông báo</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.8rem', fontWeight: '500', cursor: 'pointer' }}
              >
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280', fontSize: '0.875rem' }}>
                Không có thông báo nào.
              </div>
            ) : (
              notifications.map((n) => (
                <div 
                  key={n.id} 
                  style={{ 
                    padding: '1rem', 
                    borderBottom: '1px solid #f3f4f6',
                    backgroundColor: n.is_read ? 'white' : '#f0fdf4',
                    display: 'flex',
                    gap: '1rem',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => { if (n.is_read) e.currentTarget.style.backgroundColor = '#f9fafb'; }}
                  onMouseLeave={(e) => { if (n.is_read) e.currentTarget.style.backgroundColor = 'white'; }}
                >
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#374151', lineHeight: '1.4' }}>
                      {n.message}
                    </p>
                    <span style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '4px', display: 'block' }}>
                      {timeAgo(n.created_at)}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {!n.is_read && (
                      <button 
                        onClick={(e) => markAsRead(n.id, e)}
                        title="Đánh dấu đã đọc"
                        style={{ 
                          background: 'none', border: 'none', cursor: 'pointer', color: '#22c55e',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px'
                        }}
                      >
                        <CheckCircle2 size={18} />
                      </button>
                    )}
                    <button 
                      onClick={(e) => deleteNotification(n.id, e)}
                      title="Xóa thông báo"
                      style={{ 
                        background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px'
                      }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
