import { useEffect, useState, useCallback } from 'react';
import { useThemeStore } from '@/store/themeStore';
import { rtlUtils } from '@/shared/utils/accessibility';

/**
 * Enhanced RTL hook with accessibility features
 */
export const useRTL = () => {
  const { direction, setDirection } = useThemeStore();
  const [isRTL, setIsRTL] = useState(direction === 'rtl');

  // Update RTL state when direction changes
  useEffect(() => {
    setIsRTL(direction === 'rtl');
  }, [direction]);

  // Toggle RTL direction
  const toggleRTL = useCallback(() => {
    const newDirection = direction === 'rtl' ? 'ltr' : 'rtl';
    setDirection(newDirection);
  }, [direction, setDirection]);

  // Set specific direction
  const setRTL = useCallback((rtl: boolean) => {
    setDirection(rtl ? 'rtl' : 'ltr');
  }, [setDirection]);

  // Get directional CSS properties
  const getDirectionalStyle = useCallback((property: string) => {
    return rtlUtils.getDirectionalProperty(property, direction);
  }, [direction]);

  // Get text alignment
  const getTextAlign = useCallback(() => {
    return rtlUtils.getTextAlign(direction);
  }, [direction]);

  // Get flex direction
  const getFlexDirection = useCallback(() => {
    return rtlUtils.getFlexDirection(direction);
  }, [direction]);

  // Get margin/padding direction
  const getMargin = useCallback((side: 'left' | 'right') => {
    return getDirectionalStyle(`margin${side.charAt(0).toUpperCase() + side.slice(1)}`);
  }, [getDirectionalStyle]);

  const getPadding = useCallback((side: 'left' | 'right') => {
    return getDirectionalStyle(`padding${side.charAt(0).toUpperCase() + side.slice(1)}`);
  }, [getDirectionalStyle]);

  // Get border direction
  const getBorder = useCallback((side: 'left' | 'right') => {
    return getDirectionalStyle(`border${side.charAt(0).toUpperCase() + side.slice(1)}`);
  }, [getDirectionalStyle]);

  // Get position direction
  const getPosition = useCallback((side: 'left' | 'right') => {
    return getDirectionalStyle(side);
  }, [getDirectionalStyle]);

  // Create RTL-aware styles object
  const createRTLStyles = useCallback((styles: Record<string, any>) => {
    const rtlStyles: Record<string, any> = {};
    
    Object.entries(styles).forEach(([key, value]) => {
      if (key.includes('Left') || key.includes('Right')) {
        const rtlKey = getDirectionalStyle(key);
        rtlStyles[rtlKey] = value;
      } else {
        rtlStyles[key] = value;
      }
    });
    
    return rtlStyles;
  }, [getDirectionalStyle]);

  // Get RTL-aware className
  const getRTLClassName = useCallback((baseClass: string, rtlClass?: string) => {
    if (isRTL && rtlClass) {
      return `${baseClass} ${rtlClass}`;
    }
    return baseClass;
  }, [isRTL]);

  // Get RTL-aware icon rotation
  const getIconRotation = useCallback((baseRotation: number = 0) => {
    return isRTL ? baseRotation + 180 : baseRotation;
  }, [isRTL]);

  // Get RTL-aware transform
  const getRTLTransform = useCallback((baseTransform: string = '') => {
    if (isRTL) {
      return `${baseTransform} scaleX(-1)`;
    }
    return baseTransform;
  }, [isRTL]);

  return {
    // State
    isRTL,
    direction,
    
    // Actions
    toggleRTL,
    setRTL,
    
    // Style helpers
    getDirectionalStyle,
    getTextAlign,
    getFlexDirection,
    getMargin,
    getPadding,
    getBorder,
    getPosition,
    createRTLStyles,
    
    // Class helpers
    getRTLClassName,
    
    // Transform helpers
    getIconRotation,
    getRTLTransform,
  };
};

export default useRTL;
