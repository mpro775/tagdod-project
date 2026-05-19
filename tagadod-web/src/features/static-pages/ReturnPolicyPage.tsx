import { useTranslation } from 'react-i18next';
import { StaticPageLayout } from './StaticPageLayout';

export function ReturnPolicyPage() {
  const { t } = useTranslation();

  return (
    <StaticPageLayout
      title={t('staticPages.returns.title')}
      breadcrumbs={[{ label: t('staticPages.returns.title') }]}
      description={t('staticPages.returns.description')}
    >
      <p>{t('staticPages.returns.intro')}</p>

      <h2 className="text-xl font-semibold text-tagadod-titles dark:text-tagadod-dark-titles mt-6 mb-3">
        {t('staticPages.returns.conditions')}
      </h2>
      <p>{t('staticPages.returns.conditionsText')}</p>

      <h2 className="text-xl font-semibold text-tagadod-titles dark:text-tagadod-dark-titles mt-6 mb-3">
        {t('staticPages.returns.nonReturnable')}
      </h2>
      <p>{t('staticPages.returns.nonReturnableText')}</p>

      <h2 className="text-xl font-semibold text-tagadod-titles dark:text-tagadod-dark-titles mt-6 mb-3">
        {t('staticPages.returns.process')}
      </h2>
      <p>{t('staticPages.returns.processText')}</p>

      <div className="mt-6 p-4 bg-gray-50 dark:bg-white/5 rounded-lg">
        <p className="text-sm">
          {t('staticPages.returns.contactHint')}{' '}
          <a href="mailto:info@tagadod.com" className="text-primary hover:underline">
            info@tagadod.com
          </a>
        </p>
      </div>
    </StaticPageLayout>
  );
}
