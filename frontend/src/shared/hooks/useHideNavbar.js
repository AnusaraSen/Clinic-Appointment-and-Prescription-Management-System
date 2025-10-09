import { useEffect } from 'react';

/**
 * Custom hook to hide the navbar when a modal is open
 * @param {boolean} isOpen - Whether the modal is currently open
 */
export const useHideNavbar = (isOpen) => {
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    
    // Cleanup on unmount
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);
};
