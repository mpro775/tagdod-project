import { useTranslation } from 'react-i18next';
import { StaticPageLayout } from './StaticPageLayout';

export function PrivacyPolicyPage() {
  const { t } = useTranslation();

  return (
    <StaticPageLayout
      title={t('staticPages.privacy.title')}
      breadcrumbs={[{ label: t('staticPages.privacy.title') }]}
      description={t('staticPages.privacy.description')}
    >
      <p>{t('staticPages.privacy.intro')}</p>

      <h2 className="text-xl font-semibold text-tagadod-titles dark:text-tagadod-dark-titles mt-6 mb-3">
        {t('staticPages.privacy.dataCollection')}
      </h2>
      <p>{t('staticPages.privacy.dataCollectionText')}</p>

      <h2 className="text-xl font-semibold text-tagadod-titles dark:text-tagadod-dark-titles mt-6 mb-3">
        {t('staticPages.privacy.dataUsage')}
      </h2>
      <p>{t('staticPages.privacy.dataUsageText')}</p>

      <h2 className="text-xl font-semibold text-tagadod-titles dark:text-tagadod-dark-titles mt-6 mb-3">
        {t('staticPages.privacy.dataSharing')}
      </h2>
      <p>{t('staticPages.privacy.dataSharingText')}</p>

      <h2 className="text-xl font-semibold text-tagadod-titles dark:text-tagadod-dark-titles mt-6 mb-3">
        {t('staticPages.privacy.yourRights')}
      </h2>
      <p>{t('staticPages.privacy.yourRightsText')}</p>

      <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <p className="text-sm text-yellow-800 dark:text-yellow-300">
          {t('staticPages.privacy.disclaimer')}
        </p>
      </div>
    </StaticPageLayout>
  );
}
