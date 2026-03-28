import { create } from 'zustand';

export const useUIStore = create((set) => ({
  isSidebarOpen: false,
  isMobileMenuOpen: false,
  isSettingsOpen: false,
  isNotificationsOpen: false,
  
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (value) => set({ isSidebarOpen: value }),
  
  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  setMobileMenuOpen: (value) => set({ isMobileMenuOpen: value }),

  toggleSettings: () => set((state) => ({ isSettingsOpen: !state.isSettingsOpen })),
  setSettingsOpen: (value) => set({ isSettingsOpen: value }),

  toggleNotifications: () => set((state) => ({ isNotificationsOpen: !state.isNotificationsOpen })),
  setNotificationsOpen: (value) => set({ isNotificationsOpen: value }),
  
  // Reset all UI states (useful on route change)
  resetUI: () => set({ isMobileMenuOpen: false, isSidebarOpen: false, isSettingsOpen: false, isNotificationsOpen: false }),
}));
