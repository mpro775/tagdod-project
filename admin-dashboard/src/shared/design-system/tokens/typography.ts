export const designTypography = {
  fontFamily: [
    '"Norsal"',
    '"Cairo"',
    '"Tajawal"',
    '"Noto Sans Arabic"',
    '"Segoe UI Arabic"',
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Arial',
    'sans-serif',
  ].join(','),
  fontWeights: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  sizes: {
    display: '2rem',
    h1: '1.75rem',
    h2: '1.5rem',
    h3: '1.25rem',
    body: '0.9375rem',
    small: '0.8125rem',
    caption: '0.75rem',
  },
  lineHeights: {
    heading: 1.35,
    body: 1.75,
    compact: 1.45,
  },
} as const;

export default designTypography;
