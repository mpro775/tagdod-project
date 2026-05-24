export const designShadows = {
  card: '0 8px 24px rgba(15, 23, 42, 0.06)',
  dropdown: '0 14px 36px rgba(15, 23, 42, 0.12)',
  drawer: '0 18px 48px rgba(15, 23, 42, 0.16)',
  modal: '0 24px 64px rgba(15, 23, 42, 0.20)',
} as const;

export type DesignShadow = keyof typeof designShadows;

export default designShadows;
