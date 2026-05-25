import { useTranslation } from 'react-i18next';
import { Inventory, AddCircleOutline } from '@mui/icons-material';
import { PageSummaryGrid, StatCard } from '@/shared/design-system';

interface UnlinkedProductsStatsCardsProps {
    total: number;
    loading?: boolean;
    compact?: boolean;
}

export const UnlinkedProductsStatsCards: React.FC<UnlinkedProductsStatsCardsProps> = ({
    total,
    loading = false,
    compact = false,
}) => {
    const { t } = useTranslation('products');

    const items = [
        {
            title: t('integration.unlinked.totalLabel', 'إجمالي الفرص'),
            value: total.toLocaleString('en-US'),
            icon: <Inventory fontSize="small" />,
            tone: 'primary' as const,
            unit: t('integration.unlinked.itemUnit', 'صنف'),
        },
        {
            title: t('integration.unlinked.opportunityLabel', 'فرص الإضافة'),
            value: total.toLocaleString('en-US'),
            icon: <AddCircleOutline fontSize="small" />,
            tone: 'warning' as const,
        },
    ];

    return (
        <PageSummaryGrid columns={2} compact={compact}>
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
                />
            ))}
        </PageSummaryGrid>
    );
};