import { useTranslation } from 'react-i18next';
import { CheckCircle, Warning, Link as LinkIcon } from '@mui/icons-material';
import { PageSummaryGrid, StatCard } from '@/shared/design-system';
import type { LinkedPaginatedResponse } from '../../types/inventory-integration.types';

interface LinkedProductsStatsCardsProps {
    data?: LinkedPaginatedResponse;
    loading?: boolean;
    compact?: boolean;
}

export const LinkedProductsStatsCards: React.FC<LinkedProductsStatsCardsProps> = ({
    data,
    loading = false,
    compact = false,
}) => {
    const { t } = useTranslation('products');

    const total = data?.total ?? 0;
    const matched = data?.matchedTotal ?? 0;
    const mismatched = data?.mismatchedTotal ?? 0;

    const items = [
        {
            title: t('integration.linked.totalLabel', 'إجمالي المربوطة'),
            value: total.toLocaleString('en-US'),
            icon: <LinkIcon fontSize="small" />,
            tone: 'primary' as const,
            unit: t('integration.linked.productUnit', 'منتج'),
        },
        {
            title: t('integration.linked.matchedLabel', 'متطابق'),
            value: matched.toLocaleString('en-US'),
            icon: <CheckCircle fontSize="small" />,
            tone: 'success' as const,
            progress: {
                value: total > 0 ? (matched / total) * 100 : 0,
                showValue: !compact,
            },
        },
        {
            title: t('integration.linked.mismatchedLabel', 'اختلاف'),
            value: mismatched.toLocaleString('en-US'),
            icon: <Warning fontSize="small" />,
            tone: 'warning' as const,
            progress: {
                value: total > 0 ? (mismatched / total) * 100 : 0,
                showValue: !compact,
            },
        },
    ];

    return (
        <PageSummaryGrid columns={compact ? 3 : 3} compact={compact}>
            {items.map((item) => (
                <StatCard
                    key={item.title}
                    title={item.title}
                    value={loading ? '-' : item.value}
                    icon={item.icon}
                    tone={item.tone}
                    compact={compact}
                    loading={loading}
                    unit={item.unit}
                    progress={item.progress}
                />
            ))}
        </PageSummaryGrid>
    );
};