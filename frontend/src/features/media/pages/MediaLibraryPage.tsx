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
  Badge,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  InputAdornment,
  Pagination,
} from '@mui/material';
import {
  CloudUpload,
  Edit,
  Delete,
  Restore,
  MoreVert,
  ContentCopy,
  Folder,
  Search,
  FilterList,
  ViewModule,
  ViewList,
  Visibility,
  VisibilityOff,
  Analytics,
} from '@mui/icons-material';
import { useMedia, useDeleteMedia, useRestoreMedia, useMediaStats, useUpdateMedia } from '../hooks/useMedia';
import { MediaUploader } from '../components/MediaUploader';
import { MediaListItem } from '../components/MediaListItem';
import { formatFileSize } from '@/shared/utils/formatters';
import type { Media, MediaCategory, MediaType } from '../types/media.types';

export const MediaLibraryPage: React.FC = () => {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<MediaCategory | ''>('');
  const [typeFilter, setTypeFilter] = useState<MediaType | ''>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(24);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showDeleted, setShowDeleted] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [statsDialogOpen, setStatsDialogOpen] = useState(false);

  const { data, isLoading, refetch } = useMedia({
    page: currentPage,
    limit: pageSize,
    search: searchTerm,
    category: categoryFilter || undefined,
    type: typeFilter || undefined,
    includeDeleted: showDeleted,
  });

  const { mutate: deleteMedia } = useDeleteMedia();
  const { mutate: restoreMedia } = useRestoreMedia();
  const { mutate: updateMedia } = useUpdateMedia();
  const { data: stats } = useMediaStats();

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

  const handleTogglePublic = (media: Media) => {
    updateMedia(
      {
        id: media._id,
        data: { isPublic: !media.isPublic },
      },
      {
        onSuccess: () => {
          refetch();
          handleMenuClose();
        },
      }
    );
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setTypeFilter('');
    setShowDeleted(false);
    setCurrentPage(1);
  };

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h5" fontWeight="bold">
              مكتبة الوسائط
            </Typography>
            {stats && (
              <Typography variant="body2" color="text.secondary">
                إجمالي الملفات: {stats.total} | الحجم الإجمالي: {stats.totalSizeMB} ميجابايت
              </Typography>
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<Analytics />}
              onClick={() => setStatsDialogOpen(true)}
            >
              الإحصائيات
            </Button>
            <Button
              variant="contained"
              startIcon={<CloudUpload />}
              onClick={() => setUploadDialogOpen(true)}
            >
              رفع ملف
            </Button>
          </Box>
        </Box>

        {/* Filters */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              label="البحث"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث بالاسم أو الوصف..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
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
          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth>
              <InputLabel>النوع</InputLabel>
              <Select
                value={typeFilter}
                label="النوع"
                onChange={(e) => setTypeFilter(e.target.value as MediaType | '')}
              >
                <MenuItem value="">الكل</MenuItem>
                <MenuItem value="image">صور</MenuItem>
                <MenuItem value="video">فيديوهات</MenuItem>
                <MenuItem value="document">مستندات</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', height: '100%' }}>
              <Tooltip title="عرض المحذوفة">
                <FormControlLabel
                  control={
                    <Switch
                      checked={showDeleted}
                      onChange={(e) => setShowDeleted(e.target.checked)}
                      size="small"
                    />
                  }
                  label="محذوفة"
                />
              </Tooltip>
            </Box>
          </Grid>
        </Grid>

        {/* Controls */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<FilterList />}
              onClick={handleClearFilters}
            >
              مسح الفلاتر
            </Button>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="عرض شبكي">
              <IconButton
                size="small"
                color={viewMode === 'grid' ? 'primary' : 'default'}
                onClick={() => setViewMode('grid')}
              >
                <ViewModule />
              </IconButton>
            </Tooltip>
            <Tooltip title="عرض قائمة">
              <IconButton
                size="small"
                color={viewMode === 'list' ? 'primary' : 'default'}
                onClick={() => setViewMode('list')}
              >
                <ViewList />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Loading */}
        {isLoading && <LinearProgress sx={{ mb: 2 }} />}

        {/* Gallery Grid */}
        {!isLoading && viewMode === 'grid' && (
          <Grid container spacing={2}>
            {data?.data?.map((media) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={media._id}>
                <Card sx={{ opacity: media.deletedAt ? 0.6 : 1 }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={media.url}
                    alt={media.name}
                    sx={{ 
                      objectFit: 'cover', 
                      bgcolor: 'grey.100',
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      setSelectedMedia(media);
                      setDetailsDialogOpen(true);
                    }}
                  />
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ flex: 1 }}>
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
                        <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          <Chip label={media.category} size="small" variant="outlined" />
                          <Chip 
                            label={media.isPublic ? 'عام' : 'خاص'} 
                            size="small" 
                            color={media.isPublic ? 'success' : 'warning'}
                            variant="outlined"
                          />
                          {media.deletedAt && (
                            <Chip label="محذوف" size="small" color="error" variant="outlined" />
                          )}
                        </Box>
                      </Box>
                      {media.usageCount > 0 && (
                        <Badge badgeContent={media.usageCount} color="primary">
                          <Typography variant="caption" color="text.secondary">
                            مستخدم
                          </Typography>
                        </Badge>
                      )}
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Tooltip title="نسخ الرابط">
                      <IconButton size="small" onClick={() => handleCopyUrl(media.url)}>
                        <ContentCopy fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={media.isPublic ? 'إخفاء' : 'إظهار'}>
                      <IconButton 
                        size="small" 
                        color={media.isPublic ? 'success' : 'default'}
                        onClick={() => handleTogglePublic(media)}
                      >
                        {media.isPublic ? <Visibility fontSize="small" /> : <VisibilityOff fontSize="small" />}
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
                        <Tooltip title="تعديل">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => {
                              setSelectedMedia(media);
                              setDetailsDialogOpen(true);
                            }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
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

        {/* List View */}
        {!isLoading && viewMode === 'list' && (
          <Box>
            {data?.data?.map((media) => (
              <MediaListItem
                key={media._id}
                media={media}
                onEdit={(media) => {
                  setSelectedMedia(media);
                  setDetailsDialogOpen(true);
                }}
                onDelete={(id) => deleteMedia(id, { onSuccess: () => refetch() })}
                onRestore={(id) => restoreMedia(id, { onSuccess: () => refetch() })}
                onCopyUrl={handleCopyUrl}
                onTogglePublic={handleTogglePublic}
              />
            ))}
          </Box>
        )}

        {/* Empty State */}
        {!isLoading && (!data?.data || data.data.length === 0) && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Folder sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              لا توجد ملفات
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {searchTerm || categoryFilter || typeFilter || showDeleted
                ? 'لم يتم العثور على ملفات تطابق المعايير المحددة'
                : 'ابدأ برفع ملفاتك الأولى'}
            </Typography>
            {(!searchTerm && !categoryFilter && !typeFilter && !showDeleted) && (
              <Button
                variant="contained"
                startIcon={<CloudUpload />}
                onClick={() => setUploadDialogOpen(true)}
              >
                رفع أول ملف
              </Button>
            )}
          </Box>
        )}

        {/* Pagination */}
        {data && data.meta && data.meta.totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination
              count={data.meta.totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              showFirstButton
              showLastButton
            />
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
            if (selectedMedia) {
              setSelectedMedia(selectedMedia);
              setDetailsDialogOpen(true);
            }
            handleMenuClose();
          }}
        >
          <Edit sx={{ mr: 1, fontSize: 18 }} />
          تعديل
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedMedia) handleCopyUrl(selectedMedia.url);
          }}
        >
          <ContentCopy sx={{ mr: 1, fontSize: 18 }} />
          نسخ الرابط
        </MenuItem>
        {selectedMedia && !selectedMedia.deletedAt && (
          <MenuItem
            onClick={() => {
              if (selectedMedia) handleTogglePublic(selectedMedia);
            }}
          >
            {selectedMedia.isPublic ? <VisibilityOff sx={{ mr: 1, fontSize: 18 }} /> : <Visibility sx={{ mr: 1, fontSize: 18 }} />}
            {selectedMedia.isPublic ? 'إخفاء' : 'إظهار'}
          </MenuItem>
        )}
        {selectedMedia && selectedMedia.deletedAt && (
          <MenuItem
            onClick={() => {
              if (selectedMedia) {
                restoreMedia(selectedMedia._id, { onSuccess: () => refetch() });
              }
              handleMenuClose();
            }}
          >
            <Restore sx={{ mr: 1, fontSize: 18 }} />
            استعادة
          </MenuItem>
        )}
      </Menu>

      {/* Media Details Dialog */}
      <Dialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>تفاصيل الملف</DialogTitle>
        <DialogContent>
          {selectedMedia && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box
                  component="img"
                  src={selectedMedia.url}
                  alt={selectedMedia.name}
                  sx={{
                    width: '100%',
                    maxHeight: 300,
                    objectFit: 'contain',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="اسم الملف"
                  value={selectedMedia.name}
                  sx={{ mb: 2 }}
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  fullWidth
                  label="الفئة"
                  value={selectedMedia.category}
                  sx={{ mb: 2 }}
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  fullWidth
                  label="النوع"
                  value={selectedMedia.type}
                  sx={{ mb: 2 }}
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  fullWidth
                  label="الحجم"
                  value={formatFileSize(selectedMedia.size)}
                  sx={{ mb: 2 }}
                  InputProps={{ readOnly: true }}
                />
                {selectedMedia.width && selectedMedia.height && (
                  <TextField
                    fullWidth
                    label="الأبعاد"
                    value={`${selectedMedia.width} × ${selectedMedia.height}`}
                    sx={{ mb: 2 }}
                    InputProps={{ readOnly: true }}
                  />
                )}
                <TextField
                  fullWidth
                  label="الرابط"
                  value={selectedMedia.url}
                  sx={{ mb: 2 }}
                  InputProps={{ readOnly: true }}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={selectedMedia.isPublic}
                      onChange={() => handleTogglePublic(selectedMedia)}
                    />
                  }
                  label="عام"
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>إغلاق</Button>
        </DialogActions>
      </Dialog>

      {/* Stats Dialog */}
      <Dialog open={statsDialogOpen} onClose={() => setStatsDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>إحصائيات مكتبة الوسائط</DialogTitle>
        <DialogContent>
          {stats && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12 }}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  إجمالي الملفات: <strong>{stats.total}</strong>
                </Alert>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="h6" gutterBottom>
                  حسب الفئة:
                </Typography>
                {Object.entries(stats.byCategory).map(([category, count]) => (
                  <Box key={category} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">{category}</Typography>
                    <Typography variant="body2" fontWeight="bold">{count}</Typography>
                  </Box>
                ))}
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Alert severity="success">
                  الحجم الإجمالي: <strong>{stats.totalSizeMB} ميجابايت</strong>
                </Alert>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatsDialogOpen(false)}>إغلاق</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
