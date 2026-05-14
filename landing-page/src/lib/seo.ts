interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  siteName?: string;
}

const DEFAULT_TITLE = 'تجدد - حلول ذكية للطاقة والخدمات والمشاريع';
const DEFAULT_DESCRIPTION = 'نقدم منظومة متكاملة تجمع بين المنتجات، الصيانة، الدعم الفني، وتنفيذ المشاريع باحترافية.';
const DEFAULT_IMAGE = '/og-image.jpg';
const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://tagadod.app';

export function setSEO({
  title,
  description,
  image,
  url,
  type = 'website',
  siteName = 'تجدد',
}: SEOProps = {}): void {
  const finalTitle = title ? `${title} | ${siteName}` : DEFAULT_TITLE;
  const finalDescription = description || DEFAULT_DESCRIPTION;
  const finalImage = image || DEFAULT_IMAGE;
  const finalUrl = url || SITE_URL;

  document.title = finalTitle;

  const setMeta = (name: string, content: string, attr: 'name' | 'property' = 'name') => {
    let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, name);
      document.head.appendChild(el);
    }
    el.content = content;
  };

  setMeta('description', finalDescription);
  setMeta('keywords', 'تجدد, طاقة شمسية, حلول طاقة, مشاريع, مقاولات, صيانة, Yemen');

  setMeta('og:title', finalTitle, 'property');
  setMeta('og:description', finalDescription, 'property');
  setMeta('og:image', finalImage, 'property');
  setMeta('og:url', finalUrl, 'property');
  setMeta('og:type', type, 'property');
  setMeta('og:site_name', siteName, 'property');
  setMeta('og:locale', 'ar_SA', 'property');

  setMeta('twitter:card', 'summary_large_image', 'name');
  setMeta('twitter:title', finalTitle, 'name');
  setMeta('twitter:description', finalDescription, 'name');
  setMeta('twitter:image', finalImage, 'name');

  let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  canonical.href = finalUrl;
}

export function resetSEO(): void {
  setSEO({});
}
