import { useTranslation } from 'react-i18next';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { StaticPageLayout } from './StaticPageLayout';

export function ContactPage() {
  const { t } = useTranslation();

  const contactItems = [
    {
      icon: Phone,
      label: t('staticPages.contact.phone'),
      value: '+967-XXX-XXX-XXX',
      hint: t('staticPages.contact.phoneHint'),
    },
    {
      icon: Mail,
      label: t('staticPages.contact.email'),
      value: 'info@tagadod.com',
      hint: t('staticPages.contact.emailHint'),
    },
    {
      icon: MapPin,
      label: t('staticPages.contact.address'),
      value: t('staticPages.contact.addressValue'),
      hint: '',
    },
    {
      icon: Clock,
      label: t('staticPages.contact.hours'),
      value: t('staticPages.contact.hoursValue'),
      hint: '',
    },
  ];

  return (
    <StaticPageLayout
      title={t('staticPages.contact.title')}
      breadcrumbs={[{ label: t('staticPages.contact.title') }]}
      description={t('staticPages.contact.description')}
    >
      <p className="mb-6">{t('staticPages.contact.intro')}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {contactItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-white/5 rounded-lg"
            >
              <Icon className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-tagadod-titles dark:text-tagadod-dark-titles">
                  {item.label}
                </p>
                <p className="text-sm text-tagadod-gray">{item.value}</p>
                {item.hint && (
                  <p className="text-xs text-tagadod-gray opacity-70 mt-1">{item.hint}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </StaticPageLayout>
  );
}
