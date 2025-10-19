import { useEffect, useRef, useCallback, useState } from 'react';
import { 
  focusManagement, 
  screenReader, 
  keyboardNavigation, 
  ariaAttributes,
  tabIndex 
} from '@/shared/utils/accessibility';

/**
 * Accessibility hook for common accessibility patterns
 */
export const useAccessibility = () => {

  // Focus trap hook
  const useFocusTrap = (isActive: boolean = true) => {
    const containerRef = useRef<HTMLElement>(null);
    const cleanupRef = useRef<(() => void) | null>(null);

    useEffect(() => {
      if (isActive && containerRef.current) {
        cleanupRef.current = focusManagement.trapFocus(containerRef.current);
      }

      return () => {
        if (cleanupRef.current) {
          cleanupRef.current();
        }
      };
    }, [isActive]);

    return containerRef;
  };

  // Skip link functionality
  const useSkipLink = (targetId: string) => {
    const handleSkip = useCallback((e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const target = document.getElementById(targetId);
        if (target) {
          target.focus();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }, [targetId]);

    return { handleSkip };
  };

  // ARIA live region for announcements
  const useLiveRegion = (priority: 'polite' | 'assertive' = 'polite') => {
    const announce = useCallback((message: string) => {
      screenReader.announce(message, priority);
    }, [priority]);

    return { announce };
  };

  // Keyboard navigation for lists
  const useKeyboardNavigation = (
    items: HTMLElement[],
    orientation: 'horizontal' | 'vertical' = 'vertical'
  ) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
      keyboardNavigation.handleArrowKeys(e, items, currentIndex, orientation);
      keyboardNavigation.handleHomeEndKeys(e, items);
      
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || 
          e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        const direction = e.key.includes('Up') || e.key.includes('Left') ? -1 : 1;
        const newIndex = Math.max(0, Math.min(items.length - 1, currentIndex + direction));
        setCurrentIndex(newIndex);
      } else if (e.key === 'Home') {
        setCurrentIndex(0);
      } else if (e.key === 'End') {
        setCurrentIndex(items.length - 1);
      }
    }, [items, currentIndex, orientation]);

    return { currentIndex, handleKeyDown };
  };

  // Modal accessibility
  const useModalAccessibility = (isOpen: boolean) => {
    const modalRef = useRef<HTMLElement>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
      if (isOpen) {
        // Store previous focus
        previousFocusRef.current = document.activeElement as HTMLElement;
        
        // Focus modal
        if (modalRef.current) {
          focusManagement.focusFirst(modalRef.current);
        }
      } else {
        // Restore previous focus
        if (previousFocusRef.current) {
          previousFocusRef.current.focus();
        }
      }
    }, [isOpen]);

    return modalRef;
  };

  // Form field accessibility
  const useFormFieldAccessibility = (fieldId: string, hasError: boolean = false) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasBeenTouched, setHasBeenTouched] = useState(false);

    const handleFocus = useCallback(() => {
      setIsFocused(true);
    }, []);

    const handleBlur = useCallback(() => {
      setIsFocused(false);
      setHasBeenTouched(true);
    }, []);

    const getAriaProps = useCallback(() => {
      const baseProps = {
        id: fieldId,
        'aria-describedby': hasError ? `${fieldId}-error` : undefined,
        'aria-invalid': hasError,
      };

      return baseProps;
    }, [fieldId, hasError]);

    const getErrorProps = useCallback(() => {
      if (!hasError) return {};

      return {
        id: `${fieldId}-error`,
        role: 'alert',
        'aria-live': 'polite' as const,
      };
    }, [fieldId, hasError]);

    return {
      isFocused,
      hasBeenTouched,
      handleFocus,
      handleBlur,
      getAriaProps,
      getErrorProps,
    };
  };

  // Tab panel accessibility
  const useTabPanelAccessibility = (panelId: string, isActive: boolean) => {
    const getTabProps = useCallback(() => ({
      id: `tab-${panelId}`,
      role: 'tab',
      'aria-selected': isActive,
      'aria-controls': `panel-${panelId}`,
      tabIndex: isActive ? 0 : -1,
    }), [panelId, isActive]);

    const getPanelProps = useCallback(() => ({
      id: `panel-${panelId}`,
      role: 'tabpanel',
      'aria-labelledby': `tab-${panelId}`,
      hidden: !isActive,
    }), [panelId, isActive]);

    return { getTabProps, getPanelProps };
  };

  // Button accessibility
  const useButtonAccessibility = (
    variant: 'primary' | 'secondary' | 'danger' = 'primary'
  ) => {
    const getButtonProps = useCallback(() => {
      const baseProps = {
        role: 'button',
        tabIndex: tabIndex.focusable,
      };

      // Add variant-specific props
      switch (variant) {
        case 'danger':
          return {
            ...baseProps,
            'aria-describedby': 'danger-button-description',
          };
        case 'secondary':
          return {
            ...baseProps,
            'aria-pressed': false,
          };
        default:
          return baseProps;
      }
    }, [variant]);

    return { getButtonProps };
  };

  // Loading state accessibility
  const useLoadingAccessibility = (isLoading: boolean, loadingText: string = 'Loading...') => {
    const loadingRef = useRef<HTMLElement>(null);

    useEffect(() => {
      if (isLoading && loadingRef.current) {
        loadingRef.current.setAttribute('aria-live', 'polite');
        loadingRef.current.setAttribute('aria-busy', 'true');
      } else if (loadingRef.current) {
        loadingRef.current.setAttribute('aria-busy', 'false');
      }
    }, [isLoading]);

    const getLoadingProps = useCallback(() => ({
      ref: loadingRef,
      role: 'status',
      'aria-live': 'polite' as const,
      'aria-label': loadingText,
    }), [loadingText]);

    return { loadingRef, getLoadingProps };
  };

  // High contrast mode detection
  const useHighContrastMode = () => {
    const [isHighContrast, setIsHighContrast] = useState(false);

    useEffect(() => {
      const checkHighContrast = () => {
        // Check for Windows High Contrast Mode
        const isWindowsHighContrast = window.matchMedia('(-ms-high-contrast: active)').matches;
        // Check for forced colors
        const isForcedColors = window.matchMedia('(forced-colors: active)').matches;
        
        setIsHighContrast(isWindowsHighContrast || isForcedColors);
      };

      checkHighContrast();
      
      const mediaQuery = window.matchMedia('(-ms-high-contrast: active), (forced-colors: active)');
      mediaQuery.addEventListener('change', checkHighContrast);
      
      return () => mediaQuery.removeEventListener('change', checkHighContrast);
    }, []);

    return isHighContrast;
  };

  // Reduced motion detection
  const useReducedMotion = () => {
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    useEffect(() => {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);

      const handleChange = (e: MediaQueryListEvent) => {
        setPrefersReducedMotion(e.matches);
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    return prefersReducedMotion;
  };

  return {
    // Hooks
    useFocusTrap,
    useSkipLink,
    useLiveRegion,
    useKeyboardNavigation,
    useModalAccessibility,
    useFormFieldAccessibility,
    useTabPanelAccessibility,
    useButtonAccessibility,
    useLoadingAccessibility,
    useHighContrastMode,
    useReducedMotion,
    
    // Utilities
    ariaAttributes,
    tabIndex,
    focusManagement,
    screenReader,
    keyboardNavigation,
  };
};

export default useAccessibility;
