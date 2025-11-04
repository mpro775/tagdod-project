import { BreakpointState } from '@/shared/hooks/useBreakpoint';

/**
 * Get responsive chart height based on breakpoint
 */
export const getChartHeight = (
  breakpoint: BreakpointState,
  baseHeight: number = 350
): number => {
  if (breakpoint.isXs) return Math.max(220, baseHeight * 0.65);
  if (breakpoint.isSm) return Math.max(250, baseHeight * 0.75);
  if (breakpoint.isMd) return Math.max(280, baseHeight * 0.85);
  return baseHeight;
};

/**
 * Get responsive padding for cards
 */
export const getCardPadding = (breakpoint: BreakpointState): number => {
  if (breakpoint.isXs) return 1;
  if (breakpoint.isSm) return 1.5;
  return 2;
};

/**
 * Get responsive spacing between cards
 */
export const getCardSpacing = (breakpoint: BreakpointState): number => {
  if (breakpoint.isXs) return 1.5;
  if (breakpoint.isSm) return 2;
  return 3;
};

/**
 * Get responsive margin for charts
 */
export const getChartMargin = (breakpoint: BreakpointState) => {
  if (breakpoint.isXs) {
    return { top: 5, right: 5, left: 0, bottom: 40 };
  }
  if (breakpoint.isSm) {
    return { top: 5, right: 10, left: 10, bottom: 5 };
  }
  return { top: 5, right: 30, left: 20, bottom: 5 };
};

/**
 * Get responsive font size for chart labels
 */
export const getChartLabelFontSize = (breakpoint: BreakpointState): number => {
  if (breakpoint.isXs) return 9;
  if (breakpoint.isSm) return 10;
  return 12;
};

/**
 * Get responsive font size for chart tooltip
 */
export const getChartTooltipFontSize = (breakpoint: BreakpointState): number => {
  if (breakpoint.isXs) return 11;
  if (breakpoint.isSm) return 12;
  return 14;
};

/**
 * Should hide legend on mobile
 */
export const shouldHideLegend = (breakpoint: BreakpointState): boolean => {
  return breakpoint.isXs;
};

/**
 * Get legend position based on breakpoint
 */
export const getLegendPosition = (breakpoint: BreakpointState): 'top' | 'bottom' => {
  if (breakpoint.isXs || breakpoint.isSm) return 'bottom';
  return 'top';
};

/**
 * Get responsive Y axis width
 */
export const getYAxisWidth = (breakpoint: BreakpointState): number | undefined => {
  if (breakpoint.isXs) return 35;
  if (breakpoint.isSm) return 40;
  return undefined;
};

/**
 * Get responsive X axis height for rotated labels
 */
export const getXAxisHeight = (breakpoint: BreakpointState, needsRotation: boolean = false): number | undefined => {
  if (breakpoint.isXs && needsRotation) return 70;
  if (breakpoint.isSm && needsRotation) return 60;
  return undefined;
};

