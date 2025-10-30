import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Avatar,
  Button,
} from '@mui/material';
import { Edit, Delete, Visibility, Inventory, AttachMoney, Image } from '@mui/icons-material';
import { formatDate } from '@/shared/utils/formatters';
import type { Variant } from '../types/product.types';

interface VariantCardProps {
  variant: Variant;
  onEdit?: (variant: Variant) => void;
  onDelete?: (variant: Variant) => void;
  onView?: (variant: Variant) => void;
  showActions?: boolean;
}

export const VariantCard: React.FC<VariantCardProps> = ({
  variant,
  onEdit,
  onDelete,
  onView,
  showActions = true,
}) => {
  const getStockStatus = () => {
    if (variant.stock === 0) {
      return { label: 'نفذ', color: 'error' as const };
    } else if (variant.stock <= variant.minStock) {
      return { label: 'مخزون منخفض', color: 'warning' as const };
    } else {
      return { label: 'متوفر', color: 'success' as const };
    }
  };

  const stockStatus = getStockStatus();

  const getAttributeDisplay = () => {
    if (!variant.attributeValues || variant.attributeValues.length === 0) {
      return 'بدون سمات';
    }
    return variant.attributeValues.map((attr) => `${attr.name}: ${attr.value}`).join(', ');
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        {/* Header */}
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Avatar src={(variant as any).imageId?.url} sx={{ width: 56, height: 56 }} variant="rounded">
            <Image />
          </Avatar>
          <Box flexGrow={1}>
            <Typography variant="h6" component="div" noWrap>
              {variant.sku || 'بدون SKU'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {getAttributeDisplay()}
            </Typography>
          </Box>
          <Chip
            label={variant.isActive ? 'نشط' : 'غير نشط'}
            color={variant.isActive ? 'success' : 'default'}
            size="small"
          />
        </Box>

        {/* Price Information */}
        <Box mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <AttachMoney color="primary" fontSize="small" />
            <Typography variant="h6" color="primary" fontWeight="bold">
              ${variant.price}
            </Typography>
          </Box>
        </Box>

        {/* Stock Information */}
        <Box mb={2}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <Inventory color="primary" fontSize="small" />
            <Typography variant="body1">{variant.stock} وحدة</Typography>
          </Box>
          <Chip
            label={stockStatus.label}
            color={stockStatus.color}
            size="small"
            variant="outlined"
          />
          <Typography variant="caption" display="block" color="text.secondary">
            الحد الأدنى: {variant.minStock}
          </Typography>
        </Box>

        {/* SKU Information */}
        {variant.sku && (
          <Box mb={2}>
            <Typography variant="caption" color="text.secondary" display="block">
              SKU
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              {variant.sku}
            </Typography>
          </Box>
        )}

        {/* Statistics */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="caption" color="text.secondary">
            المبيعات: {variant.salesCount}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatDate(variant.createdAt)}
          </Typography>
        </Box>
      </CardContent>

      {/* Actions */}
      {showActions && (
        <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
          <Box>
            <Tooltip title="عرض التفاصيل">
              <IconButton size="small" onClick={() => onView?.(variant)} color="info">
                <Visibility fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="تعديل">
              <IconButton size="small" onClick={() => onEdit?.(variant)} color="primary">
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="حذف">
              <IconButton size="small" onClick={() => onDelete?.(variant)} color="error">
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          <Button variant="outlined" size="small" onClick={() => onView?.(variant)}>
            عرض التفاصيل
          </Button>
        </CardActions>
      )}
    </Card>
  );
};
