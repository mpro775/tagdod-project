import React, { useState } from 'react';
import {
  Box,
  Paper,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  IconButton,
  Typography,
  Chip,
  Tooltip,
  Button,
  Menu,
  MenuItem,
  TextField,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  CloudUpload,
  Edit,
  Delete,
  Restore,
  MoreVert,
  ContentCopy,
  Folder,
} from '@mui/icons-material';
import { useMedia, useDeleteMedia, useRestoreMedia } from '../hooks/useMedia';
import { MediaUploader } from '../components/MediaUploader';
import { formatFileSize } from '@/shared/utils/formatters';
import type { Media, MediaCategory } from '../types/media.types';

export const MediaLibraryPage: React.FC = () => {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<MediaCategory | ''>('');
  const [paginationModel] = useState({ page: 0, pageSize: 20 });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);

  const { data, isLoading, refetch } = useMedia({
    page: paginationModel.page + 1,
    limit: paginationModel.pageSize,
    search: searchTerm,
    category: categoryFilter || undefined,
  });

  const { mutate: deleteMedia } = useDeleteMedia();
  const { mutate: restoreMedia } = useRestoreMedia();

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, media: Media) => {
    setAnchorEl(event.currentTarget);
    setSelectedMedia(media);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMedia(null);
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    handleMenuClose();
  };

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight="bold">
            مكتبة الوسائط
          </Typography>
          <Button
            variant="contained"
            startIcon={<CloudUpload />}
            onClick={() => setUploadDialogOpen(true)}
          >
            رفع ملف
          </Button>
        </Box>

        {/* Filters */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="البحث"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث بالاسم أو الوصف..."
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <InputLabel>الفئة</InputLabel>
              <Select
                value={categoryFilter}
                label="الفئة"
                onChange={(e) => setCategoryFilter(e.target.value as MediaCategory | '')}
              >
                <MenuItem value="">الكل</MenuItem>
                <MenuItem value="product">منتجات</MenuItem>
                <MenuItem value="category">فئات</MenuItem>
                <MenuItem value="brand">براندات</MenuItem>
                <MenuItem value="banner">بانرات</MenuItem>
                <MenuItem value="other">أخرى</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Gallery Grid */}
        {isLoading ? (
          <Typography>جاري التحميل...</Typography>
        ) : (
          <Grid container spacing={2}>
            {data?.data?.map((media) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={media._id}>
                <Card>
                  <CardMedia
                    component="img"
                    height="200"
                    image={media.url}
                    alt={media.name}
                    sx={{ objectFit: 'cover', bgcolor: 'grey.100' }}
                  />
                  <CardContent>
                    <Typography variant="body2" fontWeight="medium" noWrap>
                      {media.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {formatFileSize(media.size)}
                    </Typography>
                    {media.width && media.height && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        {media.width} × {media.height}
                      </Typography>
                    )}
                    <Box sx={{ mt: 1 }}>
                      <Chip label={media.category} size="small" variant="outlined" />
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Tooltip title="نسخ الرابط">
                      <IconButton size="small" onClick={() => handleCopyUrl(media.url)}>
                        <ContentCopy fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {media.deletedAt ? (
                      <Tooltip title="استعادة">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => restoreMedia(media._id, { onSuccess: () => refetch() })}
                        >
                          <Restore fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <>
                        <Tooltip title="حذف">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              if (window.confirm(`هل تريد حذف "${media.name}"؟`)) {
                                deleteMedia(media._id, { onSuccess: () => refetch() });
                              }
                            }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                    <IconButton size="small" onClick={(e) => handleMenuOpen(e, media)}>
                      <MoreVert fontSize="small" />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Empty State */}
        {!isLoading && (!data?.data || data.data.length === 0) && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Folder sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              لا توجد ملفات
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ابدأ برفع ملفاتك الأولى
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Upload Dialog */}
      <MediaUploader
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        onSuccess={() => refetch()}
      />

      {/* Context Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem
          onClick={() => {
            if (selectedMedia) handleCopyUrl(selectedMedia.url);
          }}
        >
          <ContentCopy sx={{ mr: 1, fontSize: 18 }} />
          نسخ الرابط
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Edit sx={{ mr: 1, fontSize: 18 }} />
          تعديل
        </MenuItem>
      </Menu>
    </Box>
  );
};

