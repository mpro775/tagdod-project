import { useTranslation } from 'react-i18next';
import { Box, Stack, Typography } from '@mui/material';

import { StatusChip, designRadius } from '@/shared/design-system';
import { alpha, useTheme } from '@mui/material/styles';
import type { LinkedItem } from '../../types/inventory-integration.types';

interface LinkedProductCardProps {
    item: LinkedItem;
    onClick?: (item: LinkedItem) => void;
}

export const LinkedProductCard: React.FC<LinkedProductCardProps> = ({ item, onClick }) => {
    const { t } = useTranslation('products');
    const theme = useTheme();

    const borderColor = item.isStockMatch
        ? alpha(theme.palette.success.main, 0.4)
        : alpha(theme.palette.warning.main, 0.4);

    return (
        <Box
            onClick={() => onClick?.(item)}
            sx={{
                border: '1px solid',
                borderColor,
                borderRadius: `${designRadius.md}px`,
                p: 2,
                cursor: onClick ? 'pointer' : 'default',
                transition: theme.transitions.create(['border-color', 'box-shadow'], {
                    duration: theme.transitions.duration.short,
                }),
                '&:hover': onClick
                    ? {
                        borderColor: item.isStockMatch
                            ? theme.palette.success.main
                            : theme.palette.warning.main,
                        boxShadow: '0 1px 4px rgba(15,23,42,0.06)',
                    }
                    : undefined,
            }}
        >
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 700 }} noWrap>
                    {item.sku}
                </Typography>
                <StatusChip
                    label={item.isStockMatch
                        ? t('integration.linked.matchedLabel', 'متطابق')
                        : t('integration.linked.mismatchedLabel', 'اختلاف')}
                    status={item.isStockMatch ? 'success' : 'warning'}
                    size="small"
                />
            </Stack>

            <Typography variant="body2" fontWeight={700} noWrap sx={{ mb: 0.5 }}>
                {item.appName || item.onyxName || '-'}
            </Typography>
            {item.onyxName && item.appName && item.onyxName !== item.appName && (
                <Typography variant="caption" color="text.secondary" noWrap display="block" sx={{ mb: 1 }}>
                    {t('integration.linked.columns.onyxName', 'أونكس')}: {item.onyxName}
                </Typography>
            )}

            <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                <Box sx={{
                    flex: 1, textAlign: 'center', p: 1, bgcolor: 'grey.100', borderRadius: 1,
                    ...(theme.palette.mode === 'dark' ? { bgcolor: 'grey.900' } : {}),
                }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                        {t('integration.linked.columns.onyxStock', 'أونكس')}
                    </Typography>
                    <Typography variant="h6" color="primary.main" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                        {item.onyxStock?.toLocaleString('en-US') ?? 0}
                    </Typography>
                </Box>
                <Box sx={{
                    flex: 1, textAlign: 'center', p: 1, borderRadius: 1,
                    bgcolor: item.isStockMatch ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.error.main, 0.08),
                }}>
                    <Typography variant="caption" color={item.isStockMatch ? 'success.dark' : 'error.dark'} display="block">
                        {t('integration.linked.columns.appStock', 'التطبيق')}
                    </Typography>
                    <Typography variant="h6" color={item.isStockMatch ? 'success.dark' : 'error.dark'} sx={{ fontVariantNumeric: 'tabular-nums' }}>
                        {item.appStock?.toLocaleString('en-US') ?? 0}
                    </Typography>
                </Box>
            </Stack>

            {!item.isStockMatch && (
                <Typography variant="caption" color="error.main" sx={{ mt: 1, display: 'block', fontWeight: 700 }}>
                    {t('integration.linked.columns.difference', 'الفرق')}: {item.stockDifference?.toLocaleString('en-US') ?? 0}
                </Typography>
            )}
        </Box>
    );
};