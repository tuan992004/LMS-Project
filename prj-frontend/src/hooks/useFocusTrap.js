import { useEffect } from 'react';

/**
 * Custom hook to trap focus within a container element.
 * Useful for modals, sidebars, and other overlays.
 * 
 * @param {React.RefObject} ref - The ref of the container element.
 * @param {boolean} active - Whether the focus trap should be active.
 */
export const useFocusTrap = (ref, active) => {
  useEffect(() => {
    if (!active || !ref.current) return;

    const container = ref.current;
    // Find all focusable elements inside the container
    const focusableElementsSelector = 
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    
    const getFocusableElements = () => 
      Array.from(container.querySelectorAll(focusableElementsSelector))
        .filter(el => !el.hasAttribute('disabled') && el.offsetParent !== null);

    const firstFocusableElement = getFocusableElements()[0];
    const lastFocusableElement = getFocusableElements()[getFocusableElements().length - 1];

    // Focus the first element initially
    if (firstFocusableElement) {
        firstFocusableElement.focus();
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
        const focusableElements = getFocusableElements();
        if (focusableElements.length === 0) {
          e.preventDefault();
          return;
        }

        const activeElement = document.activeElement;

        if (e.shiftKey) { // Shift + Tab
          if (activeElement === focusableElements[0]) {
            lastFocusableElement.focus();
            e.preventDefault();
          }
        } else { // Tab
          if (activeElement === focusableElements[focusableElements.length - 1]) {
            focusableElements[0].focus();
            e.preventDefault();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [active, ref]);
};
