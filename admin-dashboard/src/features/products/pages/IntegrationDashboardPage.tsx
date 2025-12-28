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
    Grid,
    Card,
    CardContent,
    Skeleton,
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
    ArrowForward,
    Home,
    ChevronRight,
} from '@mui/icons-material';
import { Breadcrumbs, Link } from '@mui/material';
import { useIntegrationStats } from '../hooks/useInventoryIntegration';

// Stat Card Component
interface StatCardProps {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    color: string;
    subtitle?: string;
    action?: React.ReactNode;
    loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    icon,
    color,
    subtitle,
    action,
    loading,
}) => (
    <Card
        sx={{
            height: '100%',
            background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
            border: `1px solid ${color}30`,
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0 8px 24px ${color}20`,
            },
        }}
    >
        <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        {title}
                    </Typography>
                    {loading ? (
                        <Skeleton variant="text" width={80} height={48} />
                    ) : (
                        <Typography variant="h3" fontWeight="bold" color={color}>
                            {typeof value === 'number' ? value.toLocaleString('ar-SA') : value}
                        </Typography>
                    )}
                    {subtitle && (
                        <Typography variant="caption" color="text.secondary">
                            {subtitle}
                        </Typography>
                    )}
                </Box>
                <Box
                    sx={{
                        p: 1.5,
                        borderRadius: 2,
                        backgroundColor: `${color}20`,
                        color: color,
                    }}
                >
                    {icon}
                </Box>
            </Box>
            {action && <Box sx={{ mt: 2 }}>{action}</Box>}
        </CardContent>
    </Card>
);

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
            <Grid container spacing={3}>
                {/* Total Onyx Items */}
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                        title={t('products:integration.cards.totalOnyx', 'إجمالي أصناف أونكس')}
                        value={stats?.onyxTotalItems ?? 0}
                        icon={<Inventory sx={{ fontSize: 32 }} />}
                        color="#2196f3"
                        loading={isLoading}
                    />
                </Grid>

                {/* Synced Items */}
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                        title={t('products:integration.cards.synced', 'المربوطة بنجاح')}
                        value={stats?.fullySynced ?? 0}
                        icon={<CheckCircle sx={{ fontSize: 32 }} />}
                        color="#4caf50"
                        loading={isLoading}
                        subtitle={
                            stats?.onyxTotalItems
                                ? `${Math.round(((stats?.fullySynced ?? 0) / stats.onyxTotalItems) * 100)}%`
                                : undefined
                        }
                    />
                </Grid>

                {/* Unlinked Opportunities */}
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                        title={t('products:integration.cards.opportunities', 'فرص الإضافة')}
                        value={stats?.notLinkedOpportunities ?? 0}
                        icon={<AddCircleOutline sx={{ fontSize: 32 }} />}
                        color="#ff9800"
                        loading={isLoading}
                        action={
                            (stats?.notLinkedOpportunities ?? 0) > 0 && (
                                <Button
                                    size="small"
                                    endIcon={<ArrowForward />}
                                    onClick={() => navigate('/products/unlinked')}
                                    sx={{ color: '#ff9800' }}
                                >
                                    {t('products:integration.viewOpportunities', 'عرض التفاصيل')}
                                </Button>
                            )
                        }
                    />
                </Grid>

                {/* Last Sync */}
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                        title={t('products:integration.cards.lastSync', 'آخر تحديث')}
                        value={formatLastSync(lastSyncTime)}
                        icon={<Schedule sx={{ fontSize: 32 }} />}
                        color="#9c27b0"
                        loading={isLoading}
                        subtitle={
                            lastSyncTime
                                ? new Date(lastSyncTime).toLocaleString('ar-SA', {
                                    dateStyle: 'short',
                                    timeStyle: 'short',
                                })
                                : undefined
                        }
                    />
                </Grid>
            </Grid>

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
