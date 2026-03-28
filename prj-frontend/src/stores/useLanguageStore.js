import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useLanguageStore = create(
  persist(
    (set) => ({
      language: 'en',
      setLanguage: (lang) => {
        set({ language: lang });
        document.documentElement.lang = lang;
      },
    }),
    {
      name: 'lms-language-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          document.documentElement.lang = state.language;
        }
      },
    }
  )
);

export default useLanguageStore;
