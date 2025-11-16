import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Rating,
  Chip,
  Divider,
  useTheme,
} from '@mui/material';
import {
  Star,
  RateReview,
  AccessTime,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { formatDate } from '@/shared/utils/formatters';
import { formatCurrency } from '@/shared/utils/formatters';
import { OrderStatusChip } from './OrderStatusChip';
import type { RatingInfo, OrderStatus } from '../types/order.types';

interface RatingCardProps {
  ratingInfo: RatingInfo;
  orderNumber: string;
  orderStatus: OrderStatus;
  orderTotal?: number;
  orderCurrency?: string;
  ratedAt?: Date;
}

export const RatingCard: React.FC<RatingCardProps> = ({
  ratingInfo,
  orderNumber,
  orderStatus,
  orderTotal,
  orderCurrency,
  ratedAt,
}) => {
  const { t } = useTranslation('orders');
  const theme = useTheme();

  if (!ratingInfo?.rating) {
    return (
      <Card>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Star sx={{ color: theme.palette.text.disabled }} />
            <Typography variant="body2" color="text.secondary">
              {t('details.noRating', { defaultValue: 'لا يوجد تقييم لهذا الطلب' })}
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                {t('details.rating.title', { defaultValue: 'تقييم الطلب' })}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('details.orderNumber', { defaultValue: 'رقم الطلب' })}: {orderNumber}
              </Typography>
            </Box>
            <OrderStatusChip status={orderStatus} />
          </Box>

          <Divider />

          {/* Rating */}
          <Box>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Rating
                value={ratingInfo.rating}
                readOnly
                precision={0.5}
                size="large"
                icon={<Star sx={{ fontSize: '2rem' }} />}
                emptyIcon={<Star sx={{ fontSize: '2rem', color: theme.palette.action.disabled }} />}
              />
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                {ratingInfo.rating.toFixed(1)}
              </Typography>
              <Chip
                label={`${ratingInfo.rating}/5`}
                color="primary"
                size="small"
                sx={{ fontWeight: 'bold' }}
              />
            </Stack>
          </Box>

          {/* Review */}
          {ratingInfo.review && (
            <Box>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <RateReview color="primary" fontSize="small" />
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  {t('details.rating.review', { defaultValue: 'المراجعة' })}
                </Typography>
              </Stack>
              <Box
                sx={{
                  p: 2,
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                  borderRadius: 1,
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                  {ratingInfo.review}
                </Typography>
              </Box>
            </Box>
          )}

          {/* Footer Info */}
          <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 1 }}>
            {ratedAt && (
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <AccessTime fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">
                  {t('details.rating.ratedAt', { defaultValue: 'تاريخ التقييم' })}:{' '}
                  {formatDate(ratedAt)}
                </Typography>
              </Stack>
            )}
            {orderTotal !== undefined && orderCurrency && (
              <Typography variant="caption" color="text.secondary">
                {t('details.total', { defaultValue: 'المجموع' })}:{' '}
                {formatCurrency(orderTotal, orderCurrency)}
              </Typography>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

