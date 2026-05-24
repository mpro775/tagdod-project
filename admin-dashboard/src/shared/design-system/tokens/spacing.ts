export const designSpacing = {
  xs: 0.5,
  sm: 1,
  md: 2,
  lg: 3,
  xl: 4,
  xxl: 6,
} as const;

export type DesignSpacing = keyof typeof designSpacing;

export default designSpacing;
