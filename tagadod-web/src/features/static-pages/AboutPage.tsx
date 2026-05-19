import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { StaticPageLayout } from './StaticPageLayout';

export function AboutPage() {
  const { t } = useTranslation();

  return (
    <StaticPageLayout
      title={t('staticPages.about.title')}
      breadcrumbs={[{ label: t('staticPages.about.title') }]}
      description={t('staticPages.about.description')}
    >
      <p>{t('staticPages.about.intro')}</p>
      <h2 className="text-xl font-semibold text-tagadod-titles dark:text-tagadod-dark-titles mt-6 mb-3">
        {t('staticPages.about.whatWeOffer')}
      </h2>
      <p>{t('staticPages.about.whatWeOfferText')}</p>
      <h2 className="text-xl font-semibold text-tagadod-titles dark:text-tagadod-dark-titles mt-6 mb-3">
        {t('staticPages.about.whyTrustUs')}
      </h2>
      <p>{t('staticPages.about.whyTrustUsText')}</p>
      <div className="mt-8 p-4 bg-gray-50 dark:bg-white/5 rounded-lg">
        <p className="text-sm">
          <Link to="/products" className="text-primary hover:underline font-medium">
            {t('staticPages.about.browseProducts')}
          </Link>
          {' '}·{' '}
          <Link to="/contact" className="text-primary hover:underline font-medium">
            {t('staticPages.about.contactUs')}
          </Link>
        </p>
      </div>
    </StaticPageLayout>
  );
}
