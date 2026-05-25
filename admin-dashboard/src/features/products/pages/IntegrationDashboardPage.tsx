import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sync, Inventory, CheckCircle, AddCircleOutline, Schedule } from '@mui/icons-material';
import {
    PageShell,
    PageHeader,
    PageSummaryGrid,
    StatCard,
    LoadingState,
    ErrorState,
    usePageTitle,
} from '@/shared/design-system';
import { useIntegrationStats } from '../hooks/useInventoryIntegration';
import { IntegrationStepsCard } from '../components/admin/IntegrationStepsCard';

export const IntegrationDashboardPage: React.FC = () => {
    const { t } = useTranslation(['products', 'common']);
    const pageTitle = t('products:integration.title', 'لوحة ربط المخزون');
    usePageTitle(pageTitle);

    const { data: stats, isLoading, error, refetch } = useIntegrationStats();

    const formatLastSync = (dateString: string | null | undefined): string => {
        if (!dateString) return t('products:integration.cards.noSync', 'لم يتم المزامنة بعد');
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        if (diffMins < 1) return t('products:integration.cards.justNow', 'الآن');
        if (diffMins < 60) return t('products:integration.cards.minsAgo', 'منذ {{count}} دقيقة', { count: diffMins });
        if (diffHours < 24) return t('products:integration.cards.hoursAgo', 'منذ {{count}} ساعة', { count: diffHours });
        return t('products:integration.cards.daysAgo', 'منذ {{count}} يوم', { count: diffDays });
    };

    const lastSyncTime = stats?.lastUpdate?.lastSyncedAt;

    if (isLoading) {
        return (
            <PageShell spacing="compact" fullHeight>
                <PageHeader variant="compact" title={pageTitle} />
                <LoadingState variant="skeleton" rows={4} />
            </PageShell>
        );
    }

    if (error) {
        return (
            <PageShell spacing="compact" fullHeight>
                <PageHeader variant="compact" title={pageTitle} />
                <ErrorState
                    title={t('products:integration.error', 'حدث خطأ في جلب البيانات')}
                    onRetry={() => refetch()}
                />
            </PageShell>
        );
    }

    return (
        <PageShell spacing="compact" fullHeight>
            <PageHeader
                variant="compact"
                title={pageTitle}
                description={t('products:integration.subtitle', 'نظرة شاملة على حالة ربط المخزون مع نظام أونكس')}
                breadcrumbs={[
                    { label: t('common:navigation.home', 'الرئيسية'), to: '/' },
                    { label: t('products:title', 'المنتجات'), to: '/products' },
                    { label: pageTitle },
                ]}
                actions={[
                    {
                        label: t('common:actions.refresh', 'تحديث'),
                        icon: <Sync fontSize="small" />,
                        onClick: () => refetch(),
                        variant: 'secondary',
                    },
                ]}
            />

            <PageSummaryGrid columns={4} compact>
                <StatCard
                    title={t('products:integration.cards.totalOnyx', 'إجمالي أصناف أونكس')}
                    value={(stats?.onyxTotalItems ?? 0).toLocaleString('en-US')}
                    icon={<Inventory fontSize="small" />}
                    tone="primary"
                    compact
                />
                <StatCard
                    title={t('products:integration.cards.synced', 'المربوطة بنجاح')}
                    value={(stats?.fullySynced ?? 0).toLocaleString('en-US')}
                    icon={<CheckCircle fontSize="small" />}
                    tone="success"
                    compact
                    description={
                        stats?.onyxTotalItems
                            ? `${Math.round(((stats?.fullySynced ?? 0) / stats.onyxTotalItems) * 100)}%`
                            : undefined
                    }
                />
                <StatCard
                    title={t('products:integration.cards.opportunities', 'فرص الإضافة')}
                    value={(stats?.notLinkedOpportunities ?? 0).toLocaleString('en-US')}
                    icon={<AddCircleOutline fontSize="small" />}
                    tone="warning"
                    compact
                    linkTo={(stats?.notLinkedOpportunities ?? 0) > 0 ? '/products/unlinked' : undefined}
                />
                <StatCard
                    title={t('products:integration.cards.lastSync', 'آخر تحديث')}
                    value={formatLastSync(lastSyncTime)}
                    icon={<Schedule fontSize="small" />}
                    tone="secondary"
                    compact
                    description={
                        lastSyncTime
                            ? new Date(lastSyncTime).toLocaleString('ar-SA', { dateStyle: 'short', timeStyle: 'short' })
                            : undefined
                    }
                />
            </PageSummaryGrid>

            <IntegrationStepsCard />
        </PageShell>
    );
};