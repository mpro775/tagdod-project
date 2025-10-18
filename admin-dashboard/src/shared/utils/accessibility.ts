/**
 * Accessibility utilities for the admin dashboard
 */

// ARIA attributes helpers
export const ariaAttributes = {
  // Common ARIA roles
  role: {
    button: 'button',
    link: 'link',
    tab: 'tab',
    tabpanel: 'tabpanel',
    dialog: 'dialog',
    alert: 'alert',
    status: 'status',
    progressbar: 'progressbar',
    menu: 'menu',
    menuitem: 'menuitem',
    navigation: 'navigation',
    main: 'main',
    banner: 'banner',
    contentinfo: 'contentinfo',
    complementary: 'complementary',
    form: 'form',
    search: 'search',
  },
  
  // ARIA states and properties
  state: {
    expanded: 'aria-expanded',
    selected: 'aria-selected',
    checked: 'aria-checked',
    disabled: 'aria-disabled',
    hidden: 'aria-hidden',
    pressed: 'aria-pressed',
    current: 'aria-current',
    live: 'aria-live',
    atomic: 'aria-atomic',
    relevant: 'aria-relevant',
    busy: 'aria-busy',
    invalid: 'aria-invalid',
    required: 'aria-required',
    readonly: 'aria-readonly',
  },
  
  // ARIA relationships
  relationship: {
    labelledBy: 'aria-labelledby',
    describedBy: 'aria-describedby',
    controls: 'aria-controls',
    owns: 'aria-owns',
    flowto: 'aria-flowto',
    activedescendant: 'aria-activedescendant',
  },
} as const;

// Tab index helpers
export const tabIndex = {
  // Remove from tab order but keep focusable
  focusable: 0,
  // Remove from tab order and make unfocusable
  unfocusable: -1,
  // Custom tab order (use sparingly)
  custom: (order: number) => order,
} as const;

// Focus management
export const focusManagement = {
  // Trap focus within an element
  trapFocus: (element: HTMLElement) => {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    element.addEventListener('keydown', handleTabKey);
    return () => element.removeEventListener('keydown', handleTabKey);
  },

  // Focus first focusable element
  focusFirst: (element: HTMLElement) => {
    const focusableElement = element.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as HTMLElement;
    focusableElement?.focus();
  },

  // Focus last focusable element
  focusLast: (element: HTMLElement) => {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    lastElement?.focus();
  },
};

// Screen reader utilities
export const screenReader = {
  // Announce text to screen readers
  announce: (text: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';
    announcement.textContent = text;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  },

  // Hide element from screen readers
  hideFromScreenReader: (element: HTMLElement) => {
    element.setAttribute('aria-hidden', 'true');
  },

  // Show element to screen readers
  showToScreenReader: (element: HTMLElement) => {
    element.removeAttribute('aria-hidden');
  },
};

// Keyboard navigation helpers
export const keyboardNavigation = {
  // Arrow key navigation for lists
  handleArrowKeys: (
    event: KeyboardEvent,
    items: HTMLElement[],
    currentIndex: number,
    orientation: 'horizontal' | 'vertical' = 'vertical'
  ) => {
    const isVertical = orientation === 'vertical';
    const isHorizontal = orientation === 'horizontal';
    
    if (isVertical && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
      event.preventDefault();
      const direction = event.key === 'ArrowUp' ? -1 : 1;
      const newIndex = Math.max(0, Math.min(items.length - 1, currentIndex + direction));
      items[newIndex]?.focus();
    }
    
    if (isHorizontal && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
      event.preventDefault();
      const direction = event.key === 'ArrowLeft' ? -1 : 1;
      const newIndex = Math.max(0, Math.min(items.length - 1, currentIndex + direction));
      items[newIndex]?.focus();
    }
  },

  // Home/End key navigation
  handleHomeEndKeys: (
    event: KeyboardEvent,
    items: HTMLElement[]
  ) => {
    if (event.key === 'Home') {
      event.preventDefault();
      items[0]?.focus();
    }
    
    if (event.key === 'End') {
      event.preventDefault();
      items[items.length - 1]?.focus();
    }
  },
};

// Color contrast utilities
export const colorContrast = {
  // Calculate relative luminance
  getLuminance: (r: number, g: number, b: number) => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  },

  // Calculate contrast ratio
  getContrastRatio: (color1: string, color2: string) => {
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    };

    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);
    
    if (!rgb1 || !rgb2) return 0;
    
    const lum1 = colorContrast.getLuminance(rgb1.r, rgb1.g, rgb1.b);
    const lum2 = colorContrast.getLuminance(rgb2.r, rgb2.g, rgb2.b);
    
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    
    return (brightest + 0.05) / (darkest + 0.05);
  },

  // Check if contrast meets WCAG standards
  meetsWCAG: (color1: string, color2: string, level: 'AA' | 'AAA' = 'AA') => {
    const ratio = colorContrast.getContrastRatio(color1, color2);
    return level === 'AA' ? ratio >= 4.5 : ratio >= 7;
  },
};

// RTL utilities
export const rtlUtils = {
  // Get appropriate margin/padding direction
  getDirectionalProperty: (property: string, direction: 'ltr' | 'rtl') => {
    const isRTL = direction === 'rtl';
    const directionalMap: Record<string, { ltr: string; rtl: string }> = {
      marginLeft: { ltr: 'marginLeft', rtl: 'marginRight' },
      marginRight: { ltr: 'marginRight', rtl: 'marginLeft' },
      paddingLeft: { ltr: 'paddingLeft', rtl: 'paddingRight' },
      paddingRight: { ltr: 'paddingRight', rtl: 'paddingLeft' },
      left: { ltr: 'left', rtl: 'right' },
      right: { ltr: 'right', rtl: 'left' },
      borderLeft: { ltr: 'borderLeft', rtl: 'borderRight' },
      borderRight: { ltr: 'borderRight', rtl: 'borderLeft' },
    };
    
    return directionalMap[property]?.[direction] || property;
  },

  // Get appropriate text alignment
  getTextAlign: (direction: 'ltr' | 'rtl') => {
    return direction === 'rtl' ? 'right' : 'left';
  },

  // Get appropriate flex direction
  getFlexDirection: (direction: 'ltr' | 'rtl') => {
    return direction === 'rtl' ? 'row-reverse' : 'row';
  },
};

// Form accessibility helpers
export const formAccessibility = {
  // Generate unique IDs for form elements
  generateId: (prefix: string = 'form') => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  },

  // Create accessible label association
  createLabelAssociation: (inputId: string, labelText: string) => {
    return {
      inputProps: {
        id: inputId,
        'aria-describedby': `${inputId}-description`,
      },
      labelProps: {
        htmlFor: inputId,
      },
      descriptionId: `${inputId}-description`,
    };
  },

  // Create error message association
  createErrorMessageAssociation: (inputId: string, errorMessage: string) => {
    return {
      inputProps: {
        'aria-invalid': 'true',
        'aria-describedby': `${inputId}-error`,
      },
      errorProps: {
        id: `${inputId}-error`,
        role: 'alert',
        'aria-live': 'polite',
      },
    };
  },
};

export default {
  ariaAttributes,
  tabIndex,
  focusManagement,
  screenReader,
  keyboardNavigation,
  colorContrast,
  rtlUtils,
  formAccessibility,
};
