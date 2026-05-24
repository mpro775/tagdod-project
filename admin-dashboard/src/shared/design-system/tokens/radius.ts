export const designRadius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  pill: 999,
} as const;

export type DesignRadius = keyof typeof designRadius;

export default designRadius;
