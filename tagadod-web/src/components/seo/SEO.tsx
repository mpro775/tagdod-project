import { useEffect } from 'react';
import type { SEOProps } from './seo.types';
import {
  STORE_NAME,
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  BASE_URL,
  buildTitle,
} from './seo.helpers';

function setMeta(name: string, content: string, attr = 'name') {
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setProperty(prop: string, content: string) {
  let el = document.querySelector(`meta[property="${prop}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('property', prop);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export function SEO({
  title,
  description,
  canonical,
  image,
  type = 'website',
  noIndex = false,
}: SEOProps) {
  useEffect(() => {
    const fullTitle = buildTitle(title);
    document.title = fullTitle;

    setMeta('title', fullTitle);
    setMeta('description', description || DEFAULT_DESCRIPTION);
    setMeta('robots', noIndex ? 'noindex, nofollow' : 'index, follow');

    setProperty('og:type', type);
    setProperty('og:title', fullTitle);
    setProperty('og:description', description || DEFAULT_DESCRIPTION);
    setProperty('og:image', image || DEFAULT_OG_IMAGE);
    setProperty('og:site_name', STORE_NAME);
    setProperty('og:url', canonical || BASE_URL);

    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', fullTitle, 'property');
    setMeta('twitter:description', description || DEFAULT_DESCRIPTION, 'property');
    setMeta('twitter:image', image || DEFAULT_OG_IMAGE, 'property');

    let linkEl = document.querySelector('link[rel="canonical"]');
    if (!linkEl) {
      linkEl = document.createElement('link');
      linkEl.setAttribute('rel', 'canonical');
      document.head.appendChild(linkEl);
    }
    linkEl.setAttribute('href', canonical || BASE_URL);
  }, [title, description, canonical, image, type, noIndex]);

  return null;
}
