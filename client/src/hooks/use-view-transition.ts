import { useCallback } from 'react';

interface ViewTransitionOptions {
  duration?: number;
  easing?: string;
}

export function useViewTransition() {
  const startTransition = useCallback(async (
    callback: () => void,
    triggerElement?: HTMLElement,
    options: ViewTransitionOptions = {}
  ) => {
    // Check if View Transitions API is supported
    if (!('startViewTransition' in document)) {
      // Fallback: execute callback immediately
      callback();
      return;
    }

    // Calculate center point for circular reveal
    if (triggerElement) {
      const rect = triggerElement.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Set CSS custom properties for the animation center
      document.documentElement.style.setProperty('--theme-center-x', `${centerX}px`);
      document.documentElement.style.setProperty('--theme-center-y', `${centerY}px`);
    } else {
      // Default to top-right corner if no trigger element
      document.documentElement.style.setProperty('--theme-center-x', '90%');
      document.documentElement.style.setProperty('--theme-center-y', '10%');
    }

    // Start the view transition
    const transition = (document as any).startViewTransition(callback);
    
    // Wait for the transition to complete
    await transition.finished;
  }, []);

  return { startTransition };
}
