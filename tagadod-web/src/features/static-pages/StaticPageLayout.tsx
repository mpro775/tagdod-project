import { useTranslation } from 'react-i18next';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Container } from '@/components/layout/Container';
import { SEO } from '@/components/seo';
import type { BreadcrumbItem } from '@/components/layout/Breadcrumbs';

type StaticPageLayoutProps = {
  title: string;
  breadcrumbs: BreadcrumbItem[];
  children: React.ReactNode;
  description?: string;
  noIndex?: boolean;
};

export function StaticPageLayout({
  title,
  breadcrumbs,
  children,
  description,
  noIndex = false,
}: StaticPageLayoutProps) {
  const { t } = useTranslation();

  const defaultBreadcrumbs: BreadcrumbItem[] = [
    { label: t('layout.nav.home'), href: '/home' },
    ...breadcrumbs,
  ];

  return (
    <>
      <SEO title={title} description={description} noIndex={noIndex} />
      <Container className="py-8">
        <Breadcrumbs items={defaultBreadcrumbs} />
        <article className="max-w-3xl mx-auto bg-white dark:bg-tagadod-dark-card rounded-xl border border-gray-100 dark:border-white/5 p-6 md:p-10">
          <h1 className="text-2xl md:text-3xl font-bold text-tagadod-titles dark:text-tagadod-dark-titles mb-6">
            {title}
          </h1>
          <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-tagadod-gray leading-relaxed space-y-4">
            {children}
          </div>
        </article>
      </Container>
    </>
  );
}
