export const STORE_NAME = 'تجدد - Tagadod';
export const DEFAULT_DESCRIPTION =
  'متجر يمني يوفر منتجات كهربائية وآلات عالية الجودة بمعايير عالمية. صيانة، تركيب، وإصلاح بواسطة مهندسين معتمدين. تسوق الآن!';
export const DEFAULT_OG_IMAGE = 'https://tagadod.com/og-image.png';
export const BASE_URL = import.meta.env.VITE_BASE_URL || 'https://tagadod.com';

export function buildTitle(pageTitle: string): string {
  return `${pageTitle} | ${STORE_NAME}`;
}

export function buildCanonical(path: string): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${BASE_URL}${clean}`;
}
