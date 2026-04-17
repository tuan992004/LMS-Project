import React from 'react';
import { toast } from 'sonner';
import { RotateCcw } from 'lucide-react';

/**
 * showUndoToast - A utility function to trigger a premium Undo toast.
 * Matches the LMS "Corporate Glassmorphism" aesthetic.
 */
export const showUndoToast = (message, onUndo, t) => {
  toast.success(message, {
    duration: 6000,
    className: "glass-card !bg-white/10 !backdrop-blur-xl !border-white/20 !shadow-2xl",
    action: {
      label: (
        <div className="flex items-center gap-2 font-black text-[10px] uppercase tracking-widest">
          <RotateCcw size={12} strokeWidth={3} />
          {t('action_undo')}
        </div>
      ),
      onClick: onUndo
    },
    actionButtonStyle: {
      backgroundColor: 'var(--text-primary)',
      color: 'var(--bg-primary)',
      borderRadius: '0.75rem',
      padding: '0.5rem 1rem',
      fontWeight: '900',
      fontSize: '10px',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
    }
  });
};
