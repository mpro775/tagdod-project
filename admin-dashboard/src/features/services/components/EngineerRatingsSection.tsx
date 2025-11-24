import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  CircularProgress,
  Pagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Star, Delete } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '@/shared/utils/formatters';
import { useEngineerRatingsAdmin, useDeleteEngineerRating } from '@/features/users/hooks/useEngineerProfileAdmin';
import type { EngineerProfileAdmin } from '@/features/users/types/user.types';

interface EngineerRatingsSectionProps {
  profile: EngineerProfileAdmin;
  userId: string;
}

export const EngineerRatingsSection: React.FC<EngineerRatingsSectionProps> = ({ profile, userId }) => {
  const { t } = useTranslation(['services', 'common']);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<'recent' | 'top' | 'oldest'>('recent');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRatingId, setSelectedRatingId] = useState<string | null>(null);

  const { data: ratingsData, isLoading } = useEngineerRatingsAdmin(userId, {
    page,
    limit: 10,
    sortBy,
  });

  const deleteRatingMutation = useDeleteEngineerRating();

  const handleDeleteClick = (ratingId: string) => {
    setSelectedRatingId(ratingId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedRatingId) {
      await deleteRatingMutation.mutateAsync({
        userId,
        ratingId: selectedRatingId,
      });
      setDeleteDialogOpen(false);
      setSelectedRatingId(null);
    }
  };

  const getRatingColor = (score: number) => {
    if (score >= 4.5) return 'success';
    if (score >= 3.5) return 'warning';
    return 'error';
  };

  return (
    <>
      <Card sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              {t('services:engineers.ratings', 'التقييمات')}
            </Typography>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>{t('common:sort', 'الترتيب')}</InputLabel>
              <Select
                value={sortBy}
                label={t('common:sort', 'الترتيب')}
                onChange={(e) => setSortBy(e.target.value as 'recent' | 'top' | 'oldest')}
              >
                <MenuItem value="recent">{t('services:engineers.recent', 'الأحدث')}</MenuItem>
                <MenuItem value="top">{t('services:engineers.top', 'الأعلى')}</MenuItem>
                <MenuItem value="oldest">{t('services:engineers.oldest', 'الأقدم')}</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Rating Summary */}
          <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Box display="flex" alignItems="center" gap={2} mb={1}>
              <Star sx={{ color: 'warning.main', fontSize: '2rem' }} />
              <Box>
                <Typography variant="h4">{profile.averageRating.toFixed(1)}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatNumber(profile.totalRatings)} {t('services:engineers.totalRatings', 'تقييم')}
                </Typography>
              </Box>
            </Box>

            {/* Rating Distribution */}
            <Stack spacing={0.5} mt={2}>
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = profile.ratingDistribution[5 - stars] || 0;
                const percentage = profile.totalRatings > 0 ? (count / profile.totalRatings) * 100 : 0;
                return (
                  <Box key={stars} display="flex" alignItems="center" gap={1}>
                    <Typography variant="caption" sx={{ minWidth: 40 }}>
                      {stars} {t('services:engineers.stars', 'نجوم')}
                    </Typography>
                    <Box sx={{ flex: 1, height: 8, bgcolor: 'divider', borderRadius: 1, position: 'relative' }}>
                      <Box
                        sx={{
                          width: `${percentage}%`,
                          height: '100%',
                          bgcolor: 'primary.main',
                          borderRadius: 1,
                        }}
                      />
                    </Box>
                    <Typography variant="caption" sx={{ minWidth: 30, textAlign: 'right' }}>
                      {count}
                    </Typography>
                  </Box>
                );
              })}
            </Stack>
          </Box>

          {/* Ratings List */}
          {isLoading ? (
            <Box display="flex" justifyContent="center" py={3}>
              <CircularProgress size={24} />
            </Box>
          ) : ratingsData && ratingsData.ratings.length > 0 ? (
            <Stack spacing={2}>
              {ratingsData.ratings.map((rating, index) => (
                <Box
                  key={index}
                  sx={{
                    p: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                  }}
                >
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip
                        icon={<Star />}
                        label={rating.score}
                        color={getRatingColor(rating.score) as any}
                        size="small"
                      />
                      <Typography variant="body2" fontWeight="medium">
                        {rating.customerName || t('services:engineers.customer', 'عميل')}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteClick(rating.serviceRequestId || rating.orderId || '')}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {rating.comment}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    {new Date(rating.ratedAt).toLocaleDateString('ar-YE')}
                  </Typography>
                </Box>
              ))}

              {/* Pagination */}
              {ratingsData.total > ratingsData.limit && (
                <Box display="flex" justifyContent="center" mt={2}>
                  <Pagination
                    count={Math.ceil(ratingsData.total / ratingsData.limit)}
                    page={page}
                    onChange={(_, value) => setPage(value)}
                    color="primary"
                  />
                </Box>
              )}
            </Stack>
          ) : (
            <Alert severity="info">{t('services:engineers.noRatings', 'لا توجد تقييمات')}</Alert>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>{t('common:confirmDelete', 'تأكيد الحذف')}</DialogTitle>
        <DialogContent>
          <Typography>{t('services:engineers.deleteRatingConfirm', 'هل أنت متأكد من حذف هذا التقييم؟')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            {t('common:actions.cancel', 'إلغاء')}
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleteRatingMutation.isPending}
          >
            {deleteRatingMutation.isPending ? <CircularProgress size={20} /> : t('common:actions.delete', 'حذف')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

