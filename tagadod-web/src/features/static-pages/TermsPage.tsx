import { useTranslation } from 'react-i18next';
import { StaticPageLayout } from './StaticPageLayout';

export function TermsPage() {
  const { t } = useTranslation();

  return (
    <StaticPageLayout
      title={t('staticPages.terms.title')}
      breadcrumbs={[{ label: t('staticPages.terms.title') }]}
      description={t('staticPages.terms.description')}
    >
      <p>{t('staticPages.terms.intro')}</p>

      <h2 className="text-xl font-semibold text-tagadod-titles dark:text-tagadod-dark-titles mt-6 mb-3">
        {t('staticPages.terms.useOfStore')}
      </h2>
      <p>{t('staticPages.terms.useOfStoreText')}</p>

      <h2 className="text-xl font-semibold text-tagadod-titles dark:text-tagadod-dark-titles mt-6 mb-3">
        {t('staticPages.terms.pricing')}
      </h2>
      <p>{t('staticPages.terms.pricingText')}</p>

      <h2 className="text-xl font-semibold text-tagadod-titles dark:text-tagadod-dark-titles mt-6 mb-3">
        {t('staticPages.terms.userResponsibility')}
      </h2>
      <p>{t('staticPages.terms.userResponsibilityText')}</p>

      <h2 className="text-xl font-semibold text-tagadod-titles dark:text-tagadod-dark-titles mt-6 mb-3">
        {t('staticPages.terms.limitation')}
      </h2>
      <p>{t('staticPages.terms.limitationText')}</p>

      <h2 className="text-xl font-semibold text-tagadod-titles dark:text-tagadod-dark-titles mt-6 mb-3">
        {t('staticPages.terms.modifications')}
      </h2>
      <p>{t('staticPages.terms.modificationsText')}</p>
    </StaticPageLayout>
  );
}
