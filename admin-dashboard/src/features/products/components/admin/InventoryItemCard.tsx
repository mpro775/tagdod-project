import React from 'react';
import {
  Card,
  Stack,
  Typography,
  Box,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Visibility as ViewIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { StatusChip, designRadius } from '@/shared/design-system';
import type { InventoryItem } from './InventoryItemsTable';

interface InventoryItemCardProps {
  item: InventoryItem;
  onView: (item: InventoryItem) => void;
}

export const InventoryItemCard: React.FC<InventoryItemCardProps> = ({ item, onView }) => {
  const { t } = useTranslation('products');

  const getStatusLabel = (status: InventoryItem['status']) => {
    switch (status) {
      case 'available':
        return t('inventory.status.available', 'متوفر');
      case 'low':
        return t('inventory.status.low', 'منخفض');
      case 'out':
        return t('inventory.status.out', 'نفذ');
    }
  };

  const getStatusTone = (status: InventoryItem['status']): 'success' | 'warning' | 'error' => {
    switch (status) {
      case 'available':
        return 'success';
      case 'low':
        return 'warning';
      case 'out':
        return 'error';
    }
  };

  const stockColor = item.stock === 0
    ? 'error.main'
    : item.stock <= item.minStock
      ? 'warning.main'
      : 'text.primary';

  return (
    <Card
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: `${designRadius.lg}px`,
        overflow: 'hidden',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        '&:hover': {
          borderColor: 'primary.main',
          boxShadow: '0 2px 8px rgba(15,23,42,0.08)',
        },
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <Stack spacing={1} sx={{ p: 1.5, flex: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
          <Stack spacing={0.25} sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="body2" fontWeight={700} noWrap>
              {item.name}
            </Typography>
            <Typography variant="caption" sx={{ fontFamily: 'monospace', letterSpacing: 0.5 }} color="text.secondary">
              {item.sku || '—'}
            </Typography>
          </Stack>
          <StatusChip
            label={getStatusLabel(item.status)}
            status={getStatusTone(item.status)}
            size="small"
          />
        </Stack>

        <Typography variant="caption" color="text.secondary" noWrap>
          {t('inventory.product', 'المنتج')}: {item.product}
        </Typography>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Box
            sx={{
              px: 0.75,
              py: 0.25,
              borderRadius: 0.5,
              bgcolor: 'grey.100',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            <Typography variant="caption" color={stockColor} sx={{ fontWeight: 600 }}>
              {t('inventory.stock', 'المخزون')}: {item.stock.toLocaleString('en-US')}
            </Typography>
          </Box>
          <Box
            sx={{
              px: 0.75,
              py: 0.25,
              borderRadius: 0.5,
              bgcolor: 'grey.100',
            }}
          >
            <Typography variant="caption" color="text.secondary">
              {t('inventory.minStock', 'الحد الأدنى')}: {item.minStock.toLocaleString('en-US')}
            </Typography>
          </Box>
          <Box
            sx={{
              px: 0.75,
              py: 0.25,
              borderRadius: 0.5,
              bgcolor: 'grey.100',
            }}
          >
            <Typography variant="caption" color="text.secondary">
              ${item.price.toFixed(2)}
            </Typography>
          </Box>
        </Stack>

        {item.isVariant && (
          <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            {t('inventory.variant', 'متغير')}
          </Typography>
        )}
      </Stack>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          px: 0.5,
          pb: 0.75,
          borderTop: '1px solid',
          borderColor: 'divider',
          pt: 0.5,
        }}
      >
        <Tooltip title={t('inventory.viewDetails', 'عرض التفاصيل')}>
          <IconButton size="small" onClick={() => onView(item)} color="primary">
            <ViewIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Card>
  );
};