import { useTranslation } from 'react-i18next';
import { StaticPageLayout } from './StaticPageLayout';

export function ShippingPolicyPage() {
  const { t } = useTranslation();

  return (
    <StaticPageLayout
      title={t('staticPages.shipping.title')}
      breadcrumbs={[{ label: t('staticPages.shipping.title') }]}
      description={t('staticPages.shipping.description')}
    >
      <p>{t('staticPages.shipping.intro')}</p>

      <h2 className="text-xl font-semibold text-tagadod-titles dark:text-tagadod-dark-titles mt-6 mb-3">
        {t('staticPages.shipping.cost')}
      </h2>
      <p>{t('staticPages.shipping.costText')}</p>

      <h2 className="text-xl font-semibold text-tagadod-titles dark:text-tagadod-dark-titles mt-6 mb-3">
        {t('staticPages.shipping.deliveryTime')}
      </h2>
      <p>{t('staticPages.shipping.deliveryTimeText')}</p>

      <h2 className="text-xl font-semibold text-tagadod-titles dark:text-tagadod-dark-titles mt-6 mb-3">
        {t('staticPages.shipping.areas')}
      </h2>
      <p>{t('staticPages.shipping.areasText')}</p>

      <h2 className="text-xl font-semibold text-tagadod-titles dark:text-tagadod-dark-titles mt-6 mb-3">
        {t('staticPages.shipping.tracking')}
      </h2>
      <p>{t('staticPages.shipping.trackingText')}</p>
    </StaticPageLayout>
  );
}
