import { useTranslation } from 'react-i18next';
import { Chip, Typography } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import type { LinkedItem } from '../../types/inventory-integration.types';
import { StatusChip } from '@/shared/design-system';

export const useLinkedProductsTableColumns = (): GridColDef[] => {
    const { t } = useTranslation('products');

    return [
        {
            field: 'sku',
            headerName: t('integration.linked.columns.sku', 'SKU'),
            flex: 1,
            minWidth: 120,
            renderCell: (params) => (
                <Chip label={params.value} size="small" variant="outlined" sx={{ fontFamily: 'monospace' }} />
            ),
        },
        {
            field: 'onyxName',
            headerName: t('integration.linked.columns.onyxName', 'اسم أونكس'),
            flex: 1.5,
            minWidth: 150,
            renderCell: (params) => (
                <Typography variant="body2" noWrap>{params.value || '-'}</Typography>
            ),
        },
        {
            field: 'appName',
            headerName: t('integration.linked.columns.appName', 'اسم التطبيق'),
            flex: 1.5,
            minWidth: 150,
            renderCell: (params) => (
                <Typography variant="body2" noWrap>{params.value || '-'}</Typography>
            ),
        },
        {
            field: 'onyxStock',
            headerName: t('integration.linked.columns.onyxStock', 'مخزون أونكس'),
            width: 120,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <Chip label={params.value?.toLocaleString('en-US') ?? 0} color="primary" variant="outlined" size="small" />
            ),
        },
        {
            field: 'appStock',
            headerName: t('integration.linked.columns.appStock', 'مخزون التطبيق'),
            width: 130,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => {
                const row = params.row as LinkedItem;
                return (
                    <Chip
                        label={params.value?.toLocaleString('en-US') ?? 0}
                        color={row.isStockMatch ? 'success' : 'error'}
                        size="small"
                    />
                );
            },
        },
        {
            field: 'stockDifference',
            headerName: t('integration.linked.columns.difference', 'الفرق'),
            width: 100,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => {
                const row = params.row as LinkedItem;
                if (row.isStockMatch) return '-';
                return (
                    <Typography variant="body2" color="error.main" fontWeight={700}>
                        {row.stockDifference?.toLocaleString('en-US') ?? 0}
                    </Typography>
                );
            },
        },
        {
            field: 'isStockMatch',
            headerName: t('integration.linked.columns.status', 'الحالة'),
            width: 110,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => {
                const row = params.row as LinkedItem;
                return (
                    <StatusChip
                        label={row.isStockMatch ? t('integration.linked.matchedLabel', 'متطابق') : t('integration.linked.mismatchedLabel', 'اختلاف')}
                        status={row.isStockMatch ? 'success' : 'warning'}
                        size="small"
                    />
                );
            },
        },
    ];
};