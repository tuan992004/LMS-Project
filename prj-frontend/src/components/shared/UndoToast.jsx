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
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--accent-primary)]">
          <RotateCcw size={12} strokeWidth={3} />
          {t('action_undo')}
        </div>
      ),
      onClick: onUndo
    }
  });
};
