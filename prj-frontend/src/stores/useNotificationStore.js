import { create } from 'zustand';
import { api } from '../lib/axios';
import { toast } from 'sonner';

/**
 * useNotificationStore - Advanced real-time notification management.
 * Features: Soft-delete with Undo, Role-based filtering, and dynamic unread counts.
 */
export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  lastAction: null, // For Undo functionality

  fetchNotifications: async () => {
    set({ loading: true });
    try {
      const res = await api.get('/notifications');
      set({ 
        notifications: res.data,
        unreadCount: res.data.filter(n => !n.is_read).length,
        loading: false 
      });
    } catch (error) {
      console.error("Fetch Notifications Error:", error);
      set({ loading: false });
    }
  },

  markAsRead: async (id) => {
    const previousState = get().notifications;
    // Optimistic Update
    set({
      notifications: previousState.map(n => n.id === id ? { ...n, is_read: 1 } : n),
      unreadCount: Math.max(0, get().unreadCount - 1)
    });

    try {
      await api.patch(`/notifications/${id}/read`);
    } catch (error) {
      set({ notifications: previousState, unreadCount: previousState.filter(n => !n.is_read).length });
      toast.error("Failed to update status");
    }
  },

  markAllAsRead: async () => {
    const previousState = get().notifications;
    set({
      notifications: previousState.map(n => ({ ...n, is_read: 1 })),
      unreadCount: 0
    });

    try {
      await api.patch('/notifications/read-all');
    } catch (error) {
      set({ notifications: previousState, unreadCount: previousState.filter(n => !n.is_read).length });
      toast.error("Failed to update status");
    }
  },

  deleteNotification: async (id) => {
    const previousState = get().notifications;
    const deletedItem = previousState.find(n => n.id === id);
    
    set({
      notifications: previousState.filter(n => n.id !== id),
      unreadCount: deletedItem && !deletedItem.is_read ? get().unreadCount - 1 : get().unreadCount,
      lastAction: { type: 'delete', item: deletedItem }
    });

    try {
      await api.delete(`/notifications/${id}`);
    } catch (error) {
      set({ notifications: previousState, unreadCount: previousState.filter(n => !n.is_read).length });
      toast.error("Failed to remove notification");
    }
  },

  clearAllNotifications: async () => {
    const previousState = get().notifications;
    set({ notifications: [], unreadCount: 0 });

    try {
      await api.delete('/notifications/clear-all');
    } catch (error) {
      set({ notifications: previousState, unreadCount: previousState.filter(n => !n.is_read).length });
      toast.error("Failed to clear notifications");
    }
  },

  undoLastAction: async () => {
    const { lastAction, notifications } = get();
    if (!lastAction) return;

    if (lastAction.type === 'delete') {
      const item = lastAction.item;
      // Optimistic Restore
      set({
        notifications: [item, ...notifications].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
        unreadCount: !item.is_read ? get().unreadCount + 1 : get().unreadCount,
        lastAction: null
      });

      try {
        await api.patch(`/notifications/${item.id}/restore`);
      } catch (error) {
        set({ notifications }); // Revert on failure
        toast.error("Failed to restore notification");
      }
    }
  }
}));
