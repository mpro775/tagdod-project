import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, RefreshCw } from 'lucide-react';
import { SEO } from '@/components/seo';

export function GeneralErrorPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <>
      <SEO
        title={t('errors.general.title')}
        description={t('errors.general.subtitle')}
        noIndex
      />
      <div className="min-h-[60vh] flex items-center justify-center px-6 text-center">
        <div className="max-w-md">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <span className="text-3xl">!</span>
          </div>
          <h1 className="text-2xl font-bold text-tagadod-titles dark:text-tagadod-dark-titles mb-3">
            {t('errors.general.title')}
          </h1>
          <p className="text-tagadod-gray mb-8">
            {t('errors.general.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate(0)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              {t('errors.general.retry')}
            </button>
            <Link
              to="/home"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-gray-300 dark:border-white/20 text-tagadod-titles dark:text-tagadod-dark-titles hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            >
              <Home className="w-4 h-4" />
              {t('errors.general.backHome')}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
