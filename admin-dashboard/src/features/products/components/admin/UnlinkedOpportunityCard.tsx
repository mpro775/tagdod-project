import { useTranslation } from 'react-i18next';
import { Box, Stack, Typography, Button } from '@mui/material';
import { Add, Inventory } from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';
import { designRadius, StatusChip } from '@/shared/design-system';
import type { UnlinkedItem } from '../../types/inventory-integration.types';

interface UnlinkedOpportunityCardProps {
    item: UnlinkedItem;
    onCreateProduct?: (item: UnlinkedItem) => void;
}

export const UnlinkedOpportunityCard: React.FC<UnlinkedOpportunityCardProps> = ({
    item,
    onCreateProduct,
}) => {
    const { t } = useTranslation('products');
    const theme = useTheme();

    return (
        <Box
            sx={{
                border: '1px solid',
                borderColor: alpha(theme.palette.warning.main, 0.4),
                borderRadius: `${designRadius.md}px`,
                p: 2,
                minHeight: 140,
                transition: theme.transitions.create(['border-color', 'box-shadow'], {
                    duration: theme.transitions.duration.short,
                }),
                '&:hover': {
                    borderColor: theme.palette.warning.main,
                    boxShadow: '0 1px 4px rgba(15,23,42,0.06)',
                },
            }}
        >
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 700 }} noWrap>
                    {item.sku}
                </Typography>
                <StatusChip
                    label={item.quantity?.toLocaleString('en-US') ?? 0}
                    status={item.quantity > 0 ? 'success' : 'neutral'}
                    size="small"
                />
            </Stack>

            <Typography variant="body2" fontWeight={700} noWrap sx={{ mb: 0.5 }}>
                {item.itemNameAr || (
                    <Typography component="span" variant="body2" color="text.secondary" fontStyle="italic">
                        {t('integration.unlinked.noName', 'بدون اسم')}
                    </Typography>
                )}
            </Typography>

            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                <Inventory sx={{ fontSize: 18, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                    {t('integration.unlinked.columns.quantity', 'الكمية')}:
                    <Typography component="span" fontWeight={700} color="text.primary" sx={{ ml: 0.5 }}>
                        {item.quantity?.toLocaleString('ar-SA') ?? 0}
                    </Typography>
                </Typography>
                {item.price != null && (
                    <>
                        <Typography variant="body2" color="text.secondary" sx={{ mx: 0.5 }}>|</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {t('integration.unlinked.columns.price', 'السعر')}:
                            <Typography component="span" fontWeight={700} color="text.primary" sx={{ ml: 0.5 }}>
                                ${item.price.toLocaleString('en-US')}
                            </Typography>
                        </Typography>
                    </>
                )}
            </Stack>

            <Button
                variant="contained"
                size="small"
                color="primary"
                startIcon={<Add />}
                onClick={() => onCreateProduct?.(item)}
                fullWidth
            >
                {t('integration.unlinked.createProduct', 'إضافة كمنتج')}
            </Button>
        </Box>
    );
};