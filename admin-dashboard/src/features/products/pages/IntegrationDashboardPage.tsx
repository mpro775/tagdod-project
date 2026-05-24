/**
 * Integration Dashboard Page
 * لوحة معلومات ربط المخزون مع أونكس
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Box,
    Typography,
    Paper,
    Button,
    Alert,
    Chip,
} from '@mui/material';
import {
    Inventory,
    CheckCircle,
    AddCircleOutline,
    Schedule,
    Sync,
    Home,
    ChevronRight,
} from '@mui/icons-material';
import { Breadcrumbs, Link } from '@mui/material';
import { useIntegrationStats } from '../hooks/useInventoryIntegration';
import { PageSummaryGrid, StatCard } from '@/shared/design-system';

export const IntegrationDashboardPage: React.FC = () => {
    const { t } = useTranslation(['products', 'common']);
    const navigate = useNavigate();
    const { data: stats, isLoading, error, refetch } = useIntegrationStats();

    // Format last sync time
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

    return (
        <Box sx={{ p: 3 }}>
            {/* Breadcrumbs */}
            <Breadcrumbs
                separator={<ChevronRight fontSize="small" />}
                sx={{ mb: 3 }}
            >
                <Link
                    component="button"
                    underline="hover"
                    color="inherit"
                    onClick={() => navigate('/')}
                    sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                >
                    <Home fontSize="small" />
                    {t('common:navigation.home', 'الرئيسية')}
                </Link>
                <Link
                    component="button"
                    underline="hover"
                    color="inherit"
                    onClick={() => navigate('/products')}
                >
                    {t('products:title', 'المنتجات')}
                </Link>
                <Typography color="text.primary">
                    {t('products:integration.title', 'ربط المخزون')}
                </Typography>
            </Breadcrumbs>

            {/* Page Header */}
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        <Sync sx={{ mr: 1, verticalAlign: 'middle' }} />
                        {t('products:integration.title', 'لوحة ربط المخزون')}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        {t('products:integration.subtitle', 'نظرة شاملة على حالة ربط المخزون مع نظام أونكس')}
                    </Typography>
                </Box>
                <Button
                    variant="outlined"
                    startIcon={<Sync />}
                    onClick={() => refetch()}
                    disabled={isLoading}
                >
                    {t('common:actions.refresh', 'تحديث')}
                </Button>
            </Box>

            {/* Error Alert */}
            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {t('products:integration.error', 'حدث خطأ في جلب البيانات. تأكد من تشغيل سيرفر أونكس المحلي.')}
                </Alert>
            )}

            {/* Stats Cards */}
            <PageSummaryGrid columns={4}>
                {/* Total Onyx Items */}
                <StatCard
                    title={t('products:integration.cards.totalOnyx', 'إجمالي أصناف أونكس')}
                    value={isLoading ? '-' : (stats?.onyxTotalItems ?? 0).toLocaleString('en-US')}
                    icon={<Inventory fontSize="small" />}
                    tone="primary"
                    loading={isLoading}
                />

                {/* Synced Items */}
                <StatCard
                    title={t('products:integration.cards.synced', 'المربوطة بنجاح')}
                    value={isLoading ? '-' : (stats?.fullySynced ?? 0).toLocaleString('en-US')}
                    icon={<CheckCircle fontSize="small" />}
                    tone="success"
                    loading={isLoading}
                    description={
                        stats?.onyxTotalItems
                            ? `${Math.round(((stats?.fullySynced ?? 0) / stats.onyxTotalItems) * 100)}%`
                            : undefined
                    }
                />

                {/* Unlinked Opportunities */}
                <StatCard
                    title={t('products:integration.cards.opportunities', 'فرص الإضافة')}
                    value={isLoading ? '-' : (stats?.notLinkedOpportunities ?? 0).toLocaleString('en-US')}
                    icon={<AddCircleOutline fontSize="small" />}
                    tone="warning"
                    loading={isLoading}
                    linkTo={(stats?.notLinkedOpportunities ?? 0) > 0 ? '/products/unlinked' : undefined}
                />

                {/* Last Sync */}
                <StatCard
                    title={t('products:integration.cards.lastSync', 'آخر تحديث')}
                    value={isLoading ? '-' : formatLastSync(lastSyncTime)}
                    icon={<Schedule fontSize="small" />}
                    tone="secondary"
                    loading={isLoading}
                    description={
                        lastSyncTime
                            ? new Date(lastSyncTime).toLocaleString('ar-SA', {
                                dateStyle: 'short',
                                timeStyle: 'short',
                            })
                            : undefined
                    }
                />
            </PageSummaryGrid>

            {/* Info Section */}
            <Paper sx={{ mt: 4, p: 3 }}>
                <Typography variant="h6" gutterBottom>
                    {t('products:integration.howItWorks', 'كيف يعمل الربط؟')}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
                    <Chip
                        icon={<Sync />}
                        label={t('products:integration.step1', '1. السكربت المحلي يرسل البيانات')}
                        variant="outlined"
                    />
                    <Chip
                        icon={<Inventory />}
                        label={t('products:integration.step2', '2. النظام يحفظ في مخزون الظل')}
                        variant="outlined"
                    />
                    <Chip
                        icon={<CheckCircle />}
                        label={t('products:integration.step3', '3. المنتجات المربوطة تتحدث تلقائياً')}
                        variant="outlined"
                    />
                </Box>
                <Alert severity="info" sx={{ mt: 3 }}>
                    {t(
                        'products:integration.tip',
                        'نصيحة: المنتجات في "فرص الإضافة" موجودة في أونكس ولم تُضف للموقع بعد. أضفها لتفعيل الربط التلقائي.'
                    )}
                </Alert>
            </Paper>
        </Box>
    );
};
