import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  LinearProgress,
  Badge,
  Avatar,
  Paper,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  FormControlLabel,
  Switch,
  useTheme,
} from '@mui/material';
import {
  CloudUpload,
  Search,
  Check,
  Image,
  VideoFile,
  Description,
  ViewModule,
  ViewList,
  Refresh,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useMedia } from '../hooks/useMedia';
import { MediaUploader } from './MediaUploader';
import { formatFileSize } from '@/shared/utils/formatters';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import type { Media, MediaCategory, MediaType } from '../types/media.types';

interface MediaPickerProps {
  open: boolean;
  onClose: () => void;
  // eslint-disable-next-line no-unused-vars
  onSelect: (media: Media | Media[]) => void;
  category?: MediaCategory;
  multiple?: boolean;
  title?: string;
  acceptTypes?: MediaType[];
  showFilters?: boolean;
  showUpload?: boolean;
  maxSelections?: number;
}

export const MediaPicker: React.FC<MediaPickerProps> = ({
  open,
  onClose,
  onSelect,
  category,
  multiple = false,
  title,
  acceptTypes = ['image'],
  showFilters = true,
  showUpload = true,
  maxSelections,
}) => {
  const { t } = useTranslation('media');
  const theme = useTheme();
  const { isMobile } = useBreakpoint();
  
  const defaultTitle = title || t('picker.title');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<MediaCategory | ''>(category || '');
  const [typeFilter, setTypeFilter] = useState<MediaType | ''>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMedia, setSelectedMedia] = useState<Media[]>([]);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(isMobile ? 'list' : 'grid');
  const [sortBy, setSortBy] = useState<'createdAt' | 'name' | 'size'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showDeleted, setShowDeleted] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const { data, isLoading, refetch } = useMedia({
    page: currentPage,
    limit: 24,
    search: searchTerm,
    category: categoryFilter || undefined,
    type: typeFilter || undefined,
    includeDeleted: showDeleted,
    sortBy,
    sortOrder,
  });

  const handleSelectMedia = useCallback(
    (media: Media) => {
      if (multiple) {
        setSelectedMedia((prev) => {
          const exists = prev.find((m) => m._id === media._id);
          if (exists) {
            return prev.filter((m) => m._id !== media._id);
          } else {
            if (maxSelections && prev.length >= maxSelections) {
              return prev;
            }
            return [...prev, media];
          }
        });
      } else {
        onSelect(media);
        onClose();
      }
    },
    [multiple, maxSelections, onSelect, onClose]
  );

  const handleConfirmSelection = useCallback(() => {
    if (selectedMedia.length > 0) {
      onSelect(multiple ? selectedMedia : selectedMedia[0]);
    }
    onClose();
  }, [selectedMedia, multiple, onSelect, onClose]);

  const handleUploadSuccess = useCallback(() => {
    refetch();
    setUploadDialogOpen(false);
  }, [refetch]);

  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setCategoryFilter(category || '');
    setTypeFilter('');
    setShowDeleted(false);
    setCurrentPage(1);
  }, [category]);

  const getFileIcon = useCallback((type: string) => {
    if (type.startsWith('image/')) return <Image />;
    if (type.startsWith('video/')) return <VideoFile />;
    if (type.includes('pdf')) return <Description />;
    return <Description />;
  }, []);

  const isSelected = useCallback(
    (media: Media) => {
      return selectedMedia.some((m) => m._id === media._id);
    },
    [selectedMedia]
  );

  const filteredMedia = useMemo(() => {
    if (!data?.data) return [];

    return data.data.filter((media) => {
      if (acceptTypes.length > 0) {
        return acceptTypes.some((type) => type === media.type);
      }
      return true;
    });
  }, [data?.data, acceptTypes]);

  const handleTabChange = useCallback((_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  }, []);

  const handleSortChange = useCallback(
    (field: 'createdAt' | 'name' | 'size') => {
      if (sortBy === field) {
        setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortBy(field);
        setSortOrder('desc');
      }
    },
    [sortBy]
  );

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="xl" 
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 1,
          }}>
            <Typography 
              variant="h6"
              sx={{ fontSize: { xs: '0.875rem', sm: '1.25rem' } }}
            >
              {defaultTitle}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              {showUpload && (
                <Button
                  variant="outlined"
                  startIcon={<CloudUpload />}
                  onClick={() => setUploadDialogOpen(true)}
                  size={isMobile ? 'small' : 'medium'}
                  fullWidth={isMobile}
                >
                  {isMobile ? t('picker.upload') : t('picker.uploadNew')}
                </Button>
              )}
              {multiple && selectedMedia.length > 0 && (
                <Badge badgeContent={selectedMedia.length} color="primary">
                  <Button 
                    variant="contained" 
                    onClick={handleConfirmSelection}
                    size={isMobile ? 'small' : 'medium'}
                  >
                    {isMobile ? `${selectedMedia.length}` : t('picker.confirmMultiple', { count: selectedMedia.length })}
                  </Button>
                </Badge>
              )}
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              variant={isMobile ? 'scrollable' : 'standard'}
              scrollButtons="auto"
            >
              <Tab label={t('picker.allMedia')} sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }} />
              <Tab label={t('picker.images')} sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }} />
              <Tab label={t('picker.videos')} sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }} />
              <Tab label={t('picker.documents')} sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }} />
            </Tabs>
          </Box>

          <Box sx={{ p: { xs: 1, sm: 3 } }}>
            {/* Filters and Controls */}
            {showFilters && (
              <Paper sx={{ p: { xs: 1, sm: 2 }, mb: 3, bgcolor: 'background.paper' }}>
                <Grid container spacing={2} alignItems="center">
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
                      size={isMobile ? 'small' : 'medium'}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                    <FormControl fullWidth size={isMobile ? 'small' : 'medium'}>
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
                  <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                    <FormControl fullWidth size={isMobile ? 'small' : 'medium'}>
                      <InputLabel>{t('filters.type')}</InputLabel>
                      <Select
                        value={typeFilter}
                        label={t('filters.type')}
                        onChange={(e) => setTypeFilter(e.target.value as MediaType | '')}
                      >
                        <MenuItem value="">{t('types.all')}</MenuItem>
                        <MenuItem value="image">{t('types.images')}</MenuItem>
                        <MenuItem value="video">{t('types.videos')}</MenuItem>
                        <MenuItem value="document">{t('types.documents')}</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 6, md: 1.5 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={showDeleted}
                          onChange={(e) => setShowDeleted(e.target.checked)}
                          size={isMobile ? 'small' : 'medium'}
                        />
                      }
                      label={t('picker.showDeleted')}
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 6, md: 2.5 }}>
                    <FormControl fullWidth size={isMobile ? 'small' : 'medium'}>
                      <InputLabel>{t('picker.sortBy')}</InputLabel>
                      <Select
                        value={sortBy}
                        label={t('picker.sortBy')}
                        onChange={(e) => handleSortChange(e.target.value as 'createdAt' | 'name' | 'size')}
                      >
                        <MenuItem value="createdAt">{t('picker.sortDate')}</MenuItem>
                        <MenuItem value="name">{t('picker.sortName')}</MenuItem>
                        <MenuItem value="size">{t('picker.sortSize')}</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, md: 12 }}>
                    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', flexWrap: 'wrap' }}>
                      {!isMobile && (
                        <>
                          <Tooltip title={t('picker.gridView')}>
                            <IconButton
                              size="small"
                              color={viewMode === 'grid' ? 'primary' : 'default'}
                              onClick={() => setViewMode('grid')}
                            >
                              <ViewModule />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={t('picker.listView')}>
                            <IconButton
                              size="small"
                              color={viewMode === 'list' ? 'primary' : 'default'}
                              onClick={() => setViewMode('list')}
                            >
                              <ViewList />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                      <Tooltip title={t('picker.refresh')}>
                        <IconButton size="small" onClick={() => refetch()}>
                          <Refresh />
                        </IconButton>
                      </Tooltip>
                      <Button 
                        size="small" 
                        onClick={handleClearFilters}
                        fullWidth={isMobile}
                      >
                        {t('picker.clear')}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            )}

            {/* Loading */}
            {isLoading && <LinearProgress sx={{ mb: 2 }} />}

            {/* Media Grid */}
            {!isLoading && viewMode === 'grid' && (
              <Grid container spacing={2}>
                {filteredMedia.map((media) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={media._id}>
                    <Card
                      sx={{
                        cursor: 'pointer',
                        border: isSelected(media) ? 2 : 1,
                        borderColor: isSelected(media) ? 'primary.main' : 'divider',
                        position: 'relative',
                        transition: 'all 0.3s ease',
                        bgcolor: 'background.paper',
                        '&:hover': {
                          boxShadow: theme.palette.mode === 'dark' ? 8 : 3,
                          transform: 'translateY(-2px)',
                        },
                      }}
                      onClick={() => handleSelectMedia(media)}
                    >
                      {/* Selection Indicator */}
                      {isSelected(media) && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            zIndex: 1,
                            bgcolor: 'primary.main',
                            borderRadius: '50%',
                            width: 24,
                            height: 24,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Check sx={{ color: 'white', fontSize: 16 }} />
                        </Box>
                      )}

                      {/* Status Indicators */}
                      <Box sx={{ position: 'absolute', top: 8, left: 8, zIndex: 1 }}>
                        {media.deletedAt && <Chip label={t('deleted')} size="small" color="error" />}
                        {media.usageCount > 0 && (
                          <Chip
                            label={`${media.usageCount}`}
                            size="small"
                            color="info"
                            sx={{ ml: 0.5 }}
                          />
                        )}
                      </Box>

                      {media.type === 'image' ? (
                        <CardMedia
                          component="img"
                          height="150"
                          image={media.url}
                          alt={media.name}
                          sx={{ objectFit: 'cover' }}
                        />
                      ) : (
                        <Box
                          sx={{
                            height: 150,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100',
                          }}
                        >
                          <Avatar sx={{ width: 60, height: 60, fontSize: 24 }}>
                            {getFileIcon(media.mimeType)}
                          </Avatar>
                        </Box>
                      )}

                      <CardContent sx={{ p: { xs: 1, sm: 1.5 } }}>
                        <Typography 
                          variant="body2" 
                          fontWeight="medium" 
                          noWrap
                          sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                        >
                          {media.name}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          color="text.secondary" 
                          display="block"
                          sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                        >
                          {formatFileSize(media.size)}
                        </Typography>
                        {media.width && media.height && (
                          <Typography 
                            variant="caption" 
                            color="text.secondary" 
                            display="block"
                            sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                          >
                            {media.width} × {media.height}
                          </Typography>
                        )}
                        <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          <Chip 
                            label={media.category} 
                            size="small" 
                            variant="outlined"
                            sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' } }}
                          />
                          <Chip
                            label={media.isPublic ? t('public') : t('private')}
                            size="small"
                            color={media.isPublic ? 'success' : 'warning'}
                            variant="outlined"
                            sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' } }}
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}

            {/* Media List */}
            {!isLoading && viewMode === 'list' && (
              <List>
                {filteredMedia.map((media) => (
                  <ListItem
                    key={media._id}
                    sx={{
                      border: '1px solid',
                      borderColor: isSelected(media) ? 'primary.main' : 'divider',
                      borderRadius: 1,
                      mb: 1,
                      cursor: 'pointer',
                      bgcolor: isSelected(media) 
                        ? (theme.palette.mode === 'dark' ? 'primary.dark' : 'primary.light') 
                        : 'transparent',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        bgcolor: isSelected(media) 
                          ? (theme.palette.mode === 'dark' ? 'primary.dark' : 'primary.light') 
                          : 'action.hover',
                        boxShadow: 2,
                      },
                    }}
                    onClick={() => handleSelectMedia(media)}
                  >
                    <ListItemAvatar>
                      <Avatar src={media.type === 'image' ? media.url : undefined}>
                        {getFileIcon(media.mimeType)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography 
                          sx={{ 
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            fontWeight: 'medium',
                          }}
                        >
                          {media.name}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                          >
                            {formatFileSize(media.size)}
                            {media.width && media.height && ` • ${media.width} × ${media.height}`}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                            <Chip 
                              label={media.category} 
                              size="small" 
                              variant="outlined"
                              sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' } }}
                            />
                            <Chip
                              label={media.isPublic ? t('public') : t('private')}
                              size="small"
                              color={media.isPublic ? 'success' : 'warning'}
                              variant="outlined"
                              sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' } }}
                            />
                          </Box>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      {isSelected(media) && <Check color="primary" />}
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}

            {/* Empty State */}
            {!isLoading && filteredMedia.length === 0 && (
              <Box sx={{ textAlign: 'center', py: { xs: 4, sm: 8 } }}>
                <Image sx={{ fontSize: { xs: 48, sm: 64 }, color: 'text.secondary', mb: 2 }} />
                <Typography 
                  variant="h6" 
                  color="text.secondary" 
                  gutterBottom
                  sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                >
                  {t('picker.noMedia')}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ mb: 3, fontSize: { xs: '0.7rem', sm: '0.875rem' } }}
                >
                  {searchTerm || categoryFilter || typeFilter
                    ? t('picker.noMediaDescription')
                    : t('picker.noMediaDefault')}
                </Typography>
                {showUpload && (
                  <Button
                    variant="contained"
                    startIcon={<CloudUpload />}
                    onClick={() => setUploadDialogOpen(true)}
                    size={isMobile ? 'medium' : 'large'}
                  >
                    {t('empty.uploadMediaNew')}
                  </Button>
                )}
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: { xs: 1, sm: 2 } }}>
          <Button 
            onClick={onClose}
            fullWidth={isMobile}
            size={isMobile ? 'medium' : 'small'}
          >
            {t('picker.cancel')}
          </Button>
          {multiple && (
            <Button
              variant="contained"
              disabled={selectedMedia.length === 0}
              onClick={handleConfirmSelection}
              fullWidth={isMobile}
              size={isMobile ? 'medium' : 'small'}
            >
              {t('picker.selectMultiple', { count: selectedMedia.length })}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Upload Dialog */}
      {showUpload && (
        <MediaUploader
          open={uploadDialogOpen}
          onClose={() => setUploadDialogOpen(false)}
          onSuccess={handleUploadSuccess}
          defaultCategory={category}
        />
      )}
    </>
  );
};
