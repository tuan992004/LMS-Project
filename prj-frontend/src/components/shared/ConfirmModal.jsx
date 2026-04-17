import React from "react";
import { X, AlertCircle } from "lucide-react";

/**
 * ConfirmModal - A standard, minimalist confirmation modal for the LMS
 * Adheres to the 'Soft Light' monochrome design system.
 */
export const ConfirmModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    message, 
    confirmText, 
    cancelText,
    icon: IconComponent,
    variant = "danger" // "danger" | "primary"
}) => {
    if (!isOpen) return null;

    const isDanger = variant === "danger";

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/40 backdrop-blur-md animate-in fade-in duration-500" 
                onClick={onClose} 
            />
            
            {/* Modal Body */}
            <div className="relative bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[2.5rem] p-10 md:p-14 max-w-xl w-full shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
                
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute right-8 top-8 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all duration-300 transform hover:rotate-90"
                >
                    <X size={24} strokeWidth={1} />
                </button>

                <div className="space-y-8">
                    <header className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${isDanger ? 'bg-rose-500/10 text-rose-500' : 'bg-[var(--text-primary)]/10 text-[var(--text-primary)]'}`}>
                                <AlertCircle size={20} strokeWidth={2} />
                            </div>
                            <h3 className="text-2xl md:text-3xl font-medium text-[var(--text-primary)] italic tracking-tight uppercase">
                                {title}
                            </h3>
                        </div>
                        <p className="text-[var(--text-secondary)] font-medium leading-relaxed italic opacity-70 text-base md:text-lg">
                            {message}
                        </p>
                    </header>

                    <footer className="flex flex-col sm:flex-row gap-4 pt-4">
                        <button 
                            onClick={onClose} 
                            className="flex-1 py-5 rounded-2xl bg-[var(--bg-secondary)] text-[var(--text-secondary)] font-black uppercase tracking-widest text-[10px] hover:bg-[var(--border-color)] transition-all active:scale-95 italic"
                        >
                            {cancelText || "Abort Operation"}
                        </button>
                        <button 
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }} 
                            className={`
                                flex-1 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-95 shadow-xl italic flex items-center justify-center gap-3
                                ${isDanger 
                                    ? 'bg-rose-500 text-white hover:bg-rose-600' 
                                    : 'bg-[var(--text-primary)] text-[var(--bg-primary)] hover:opacity-90'}
                            `}
                        >
                            {IconComponent && <IconComponent size={16} strokeWidth={1.5} />}
                            {confirmText || "Execute Process"}
                        </button>
                    </footer>
                </div>
            </div>
        </div>
    );
};
