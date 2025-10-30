import React, { useState } from 'react';
import {
  Box,
  Paper,
  Grid,
 
  Typography,
  Button,
  
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
  Menu,
  MenuItem,

  Chip,
  Stack,
  Card,
  CardContent,
  CardActions,
  Tooltip,
  IconButton,
  CardMedia,
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
  Storage,
  Warning,
  Refresh,
  CleanHands,

} from '@mui/icons-material';
import {
  useMedia,
  useDeleteMedia,
  useRestoreMedia,
  useMediaStats,
  useUpdateMedia,
  useCleanupDeletedFiles,
  useCleanupDuplicateFiles,
  useCleanupUnusedFiles,
  useBulkMediaOperation,
} from '../hooks/useMedia';
import { MediaUploader } from '../components/MediaUploader';
import { MediaListItem } from '../components/MediaListItem';
import { formatFileSize } from '@/shared/utils/formatters';
import { useTranslation } from 'react-i18next';
import type { Media, MediaCategory, MediaType } from '../types/media.types';

export const MediaLibraryPage: React.FC = () => {
  const { t } = useTranslation('media');
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
  const [cleanupDialogOpen, setCleanupDialogOpen] = useState(false);
  const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

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
  const { mutate: cleanupDeleted } = useCleanupDeletedFiles();
  const { mutate: cleanupDuplicates } = useCleanupDuplicateFiles();
  const { mutate: cleanupUnused } = useCleanupUnusedFiles();
  const { mutate: bulkOperation } = useBulkMediaOperation();
  const { data: stats } = useMediaStats();
  
  // Provide default stats to prevent undefined errors
  const safeStats = {
    total: stats?.total || 0,
    byCategory: stats?.byCategory || {},
    byType: stats?.byType || {},
    totalSize: stats?.totalSize || 0,
    totalSizeMB: stats?.totalSizeMB || '0',
    averageSize: stats?.averageSize || 0,
    recentlyAdded: stats?.recentlyAdded || [],
  };

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

  const handleBulkSelect = (mediaId: string) => {
    setSelectedMediaIds(prev => 
      prev.includes(mediaId) 
        ? prev.filter(id => id !== mediaId)
        : [...prev, mediaId]
    );
  };

  const handleBulkSelectAll = () => {
    if (selectedMediaIds.length === (data?.data?.length || 0)) {
      setSelectedMediaIds([]);
    } else {
      setSelectedMediaIds(data?.data?.map(media => media._id) || []);
    }
  };

  const handleBulkOperation = (operation: 'delete' | 'restore' | 'togglePublic' | 'changeCategory') => {
    if (selectedMediaIds.length === 0) return;

    bulkOperation({
      mediaIds: selectedMediaIds,
      operation,
    }, {
      onSuccess: () => {
        setSelectedMediaIds([]);
        setShowBulkActions(false);
        refetch();
      },
    });
  };

  const handleCleanupOperation = (operation: 'deleted' | 'duplicates' | 'unused') => {
    switch (operation) {
      case 'deleted':
        cleanupDeleted();
        break;
      case 'duplicates':
        cleanupDuplicates();
        break;
      case 'unused':
        cleanupUnused(90); // 90 days threshold
        break;
    }
    setCleanupDialogOpen(false);
  };


  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h5" fontWeight="bold">
              {t('pageTitle')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('stats.totalFiles')}: {safeStats.total} | {t('stats.totalSize')}: {safeStats.totalSizeMB} MB
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<Analytics />}
              onClick={() => setStatsDialogOpen(true)}
            >
              {t('analytics')}
            </Button>
            <Button
              variant="outlined"
              startIcon={<CleanHands />}
              onClick={() => setCleanupDialogOpen(true)}
            >
              {t('cleanup.title', { defaultValue: 'تنظيف' })}
            </Button>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => refetch()}
            >
              {t('refresh')}
            </Button>
            <Button
              variant="contained"
              startIcon={<CloudUpload />}
              onClick={() => setUploadDialogOpen(true)}
            >
              {t('uploadFile')}
            </Button>
          </Box>
        </Box>

        {/* Filters */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              label={t('filters.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('filters.searchPlaceholder')}
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
              <InputLabel>{t('filters.category')}</InputLabel>
              <Select
                value={categoryFilter}
                label={t('filters.category')}
                onChange={(e) => setCategoryFilter(e.target.value as MediaCategory | '')}
              >
                <MenuItem value="">{t('categories.all')}</MenuItem>
                <MenuItem value="product">{t('categories.product')}</MenuItem>
                <MenuItem value="category">{t('categories.category')}</MenuItem>
                <MenuItem value="brand">{t('categories.brand')}</MenuItem>
                <MenuItem value="banner">{t('categories.banner')}</MenuItem>
                <MenuItem value="other">{t('categories.other')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth>
              <InputLabel>{t('filters.type')}</InputLabel>
              <Select
                value={typeFilter}
                label={t('filters.type')}
                onChange={(e) => setTypeFilter(e.target.value as MediaType | '')}
              >
                <MenuItem value="">{t('types.all')}</MenuItem>
                <MenuItem value="image">{t('types.image')}</MenuItem>
                <MenuItem value="video">{t('types.video')}</MenuItem>
                <MenuItem value="document">{t('types.document')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', height: '100%' }}>
              <Tooltip title={t('actions.toggleDeleted')}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={showDeleted}
                      onChange={(e) => setShowDeleted(e.target.checked)}
                      size="small"
                    />
                  }
                  label={t('deleted')}
                />
              </Tooltip>
            </Box>
          </Grid>
        </Grid>

        {/* Controls */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<FilterList />}
              onClick={handleClearFilters}
            >
              {t('filters.clearFilters')}
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setShowBulkActions(!showBulkActions)}
            >
              {showBulkActions ? t('filters.hideBulkSelect') : t('filters.bulkSelect')}
            </Button>
            {showBulkActions && (
              <Button
                variant="outlined"
                size="small"
                onClick={handleBulkSelectAll}
              >
                {selectedMediaIds.length === (data?.data?.length || 0) ? t('filters.unselectAll') : t('filters.selectAll')}
              </Button>
            )}
            {selectedMediaIds.length > 0 && (
              <Chip
                label={`${selectedMediaIds.length} ${t('filters.selected')}`}
                color="primary"
                onDelete={() => setSelectedMediaIds([])}
              />
            )}
            {selectedMediaIds.length > 0 && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<Delete />}
                onClick={() => handleBulkOperation('delete')}
                color="error"
              >
                {t('actions.bulkDelete')}
              </Button>
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title={t('actions.gridView')}>
              <IconButton
                size="small"
                color={viewMode === 'grid' ? 'primary' : 'default'}
                onClick={() => setViewMode('grid')}
              >
                <ViewModule />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('actions.listView')}>
              <IconButton
                size="small"
                color={viewMode === 'list' ? 'primary' : 'default'}
                onClick={() => setViewMode('list')}
              >
                <ViewList />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('refresh')}>
              <IconButton size="small" onClick={() => refetch()}>
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Loading */}
        {isLoading && <LinearProgress sx={{ mb: 2 }} />}

        {/* Gallery Grid */}
        {!isLoading && viewMode === 'grid' && (
          <Grid container spacing={2}>
            {(Array.isArray(data?.data) ? data.data : [])?.map((media) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={media._id}>
                <Card 
                  sx={{ 
                    opacity: media.deletedAt ? 0.6 : 1,
                    border: showBulkActions && selectedMediaIds.includes(media._id) ? 2 : 0,
                    borderColor: 'primary.main',
                    cursor: showBulkActions ? 'pointer' : 'default'
                  }}
                  onClick={() => showBulkActions && handleBulkSelect(media._id)}
                >
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
                            label={media.isPublic ? t('public') : t('private')}
                            size="small"
                            color={media.isPublic ? 'success' : 'warning'}
                            variant="outlined"
                          />
                          {media.deletedAt && (
                            <Chip label={t('deleted')} size="small" color="error" variant="outlined" />
                          )}
                        </Box>
                      </Box>
                      {media.usageCount > 0 && (
                        <Badge badgeContent={media.usageCount} color="primary">
                          <Typography variant="caption" color="text.secondary">
                            {t('used')}
                          </Typography>
                        </Badge>
                      )}
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Tooltip title={t('copyUrl')}>
                      <IconButton size="small" onClick={() => handleCopyUrl(media.url)}>
                        <ContentCopy fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={media.isPublic ? t('hide') : t('show')}>
                      <IconButton
                        size="small"
                        color={media.isPublic ? 'success' : 'default'}
                        onClick={() => handleTogglePublic(media)}
                      >
                        {media.isPublic ? <Visibility fontSize="small" /> : <VisibilityOff fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                    {media.deletedAt ? (
                      <Tooltip title={t('restore')}>
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
                        <Tooltip title={t('edit')}>
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
                        <Tooltip title={t('delete')}>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              if (window.confirm(t('messages.deleteConfirm', { name: media.name }))) {
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
            {(Array.isArray(data?.data) ? data.data : [])?.map((media) => (
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
        {!isLoading && (!data?.data || !Array.isArray(data.data) || data.data.length === 0) && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Folder sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {t('empty.noFiles')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {searchTerm || categoryFilter || typeFilter || showDeleted
                ? t('empty.noFilesDescription')
                : t('empty.startUploading')}
            </Typography>
            {(!searchTerm && !categoryFilter && !typeFilter && !showDeleted) && (
              <Button
                variant="contained"
                startIcon={<CloudUpload />}
                onClick={() => setUploadDialogOpen(true)}
              >
                {t('empty.uploadFirst')}
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
          {t('edit')}
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedMedia) handleCopyUrl(selectedMedia.url);
          }}
        >
          <ContentCopy sx={{ mr: 1, fontSize: 18 }} />
          {t('copyUrl')}
        </MenuItem>
        {selectedMedia && !selectedMedia.deletedAt && (
          <MenuItem
            onClick={() => {
              if (selectedMedia) handleTogglePublic(selectedMedia);
            }}
          >
            {selectedMedia.isPublic ? <VisibilityOff sx={{ mr: 1, fontSize: 18 }} /> : <Visibility sx={{ mr: 1, fontSize: 18 }} />}
            {selectedMedia.isPublic ? t('hide') : t('show')}
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
            {t('restore')}
          </MenuItem>
        )}
      </Menu>

      {/* Media Details Dialog */}
      <Dialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{t('details.title')}</DialogTitle>
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
                  label={t('details.fileName')}
                  value={selectedMedia.name}
                  sx={{ mb: 2 }}
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  fullWidth
                  label={t('details.category')}
                  value={selectedMedia.category}
                  sx={{ mb: 2 }}
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  fullWidth
                  label={t('details.type')}
                  value={selectedMedia.type}
                  sx={{ mb: 2 }}
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  fullWidth
                  label={t('details.size')}
                  value={formatFileSize(selectedMedia.size)}
                  sx={{ mb: 2 }}
                  InputProps={{ readOnly: true }}
                />
                {selectedMedia.width && selectedMedia.height && (
                  <TextField
                    fullWidth
                    label={t('details.dimensions')}
                    value={`${selectedMedia.width} × ${selectedMedia.height}`}
                    sx={{ mb: 2 }}
                    InputProps={{ readOnly: true }}
                  />
                )}
                <TextField
                  fullWidth
                  label={t('details.url')}
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
                  label={t('details.public')}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>{t('close')}</Button>
        </DialogActions>
      </Dialog>

      {/* Stats Dialog */}
      <Dialog open={statsDialogOpen} onClose={() => setStatsDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('stats.storageStats')}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <Alert severity="info" sx={{ mb: 2 }}>
                {t('stats.totalFiles')}: <strong>{safeStats.total}</strong>
              </Alert>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h6" gutterBottom>
                {t('stats.byCategory')}:
              </Typography>
              {Object.entries(safeStats.byCategory || {}).map(([category, count]) => (
                <Box key={category} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">{category}</Typography>
                  <Typography variant="body2" fontWeight="bold">{count}</Typography>
                </Box>
              ))}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h6" gutterBottom>
                {t('stats.byType')}:
              </Typography>
              {Object.entries(safeStats.byType).map(([type, count]) => (
                <Box key={type} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">{type}</Typography>
                  <Typography variant="body2" fontWeight="bold">{count}</Typography>
                </Box>
              ))}
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Alert severity="success">
                {t('stats.totalSize')}: <strong>{safeStats.totalSizeMB} MB</strong>
              </Alert>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatsDialogOpen(false)}>{t('close')}</Button>
        </DialogActions>
      </Dialog>

      {/* Cleanup Dialog */}
      <Dialog open={cleanupDialogOpen} onClose={() => setCleanupDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('cleanup.title')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {t('cleanup.description')}
          </Typography>
          
          <Stack spacing={2}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Delete color="error" />
                  <Box>
                    <Typography variant="h6">{t('cleanup.deletedFiles')}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('cleanup.deletedDescription')}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
              <CardActions>
                <Button
                  color="error"
                  onClick={() => handleCleanupOperation('deleted')}
                  startIcon={<Delete />}
                >
                  {t('cleanup.cleanupDeleted')}
                </Button>
              </CardActions>
            </Card>

            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Warning color="warning" />
                  <Box>
                    <Typography variant="h6">{t('cleanup.duplicates')}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('cleanup.duplicatesDescription')}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
              <CardActions>
                <Button
                  color="warning"
                  onClick={() => handleCleanupOperation('duplicates')}
                  startIcon={<Warning />}
                >
                  {t('cleanup.cleanupDuplicates')}
                </Button>
              </CardActions>
            </Card>

            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Storage color="info" />
                  <Box>
                    <Typography variant="h6">{t('cleanup.unused')}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('cleanup.unusedDescription')}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
              <CardActions>
                <Button
                  color="info"
                  onClick={() => handleCleanupOperation('unused')}
                  startIcon={<Storage />}
                >
                  {t('cleanup.cleanupUnused')}
                </Button>
              </CardActions>
            </Card>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCleanupDialogOpen(false)}>{t('cancel')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
