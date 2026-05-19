export type SEOProps = {
  title: string;
  description?: string;
  canonical?: string;
  image?: string;
  type?: 'website' | 'product' | 'article';
  noIndex?: boolean;
};
