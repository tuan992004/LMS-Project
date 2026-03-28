import { useTranslation } from './useTranslation';

/**
 * useTimeAgo - Real-time bilingual Time-Ago utility.
 * Supports English and Vietnamese with dynamic unit pluralization.
 */
export const useTimeAgo = () => {
  const { t } = useTranslation();

  const format = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return t('time_just_now');
    
    if (diffInSeconds < 3600) {
      const mins = Math.floor(diffInSeconds / 60);
      return t('time_min_ago').replace('{n}', mins);
    }
    
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return t('time_hour_ago').replace('{n}', hours);
    }
    
    const days = Math.floor(diffInSeconds / 86400);
    return t('time_day_ago').replace('{n}', days);
  };

  return { format };
};
