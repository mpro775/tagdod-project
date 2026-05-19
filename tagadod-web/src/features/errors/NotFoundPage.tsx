import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, ShoppingBag } from 'lucide-react';
import { SEO } from '@/components/seo';

export function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <>
      <SEO
        title={t('errors.notFound.title')}
        description={t('errors.notFound.subtitle')}
        noIndex
      />
      <div className="min-h-[60vh] flex items-center justify-center px-6 text-center">
        <div className="max-w-md">
          <div className="text-7xl font-bold text-primary/20 mb-4">404</div>
          <h1 className="text-2xl font-bold text-tagadod-titles dark:text-tagadod-dark-titles mb-3">
            {t('errors.notFound.title')}
          </h1>
          <p className="text-tagadod-gray mb-8">
            {t('errors.notFound.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/home"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
            >
              <Home className="w-4 h-4" />
              {t('errors.notFound.backHome')}
            </Link>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-gray-300 dark:border-white/20 text-tagadod-titles dark:text-tagadod-dark-titles hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              {t('errors.notFound.browseProducts')}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
