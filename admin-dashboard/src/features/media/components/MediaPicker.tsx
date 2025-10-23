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
  Skeleton,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Checkbox,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  CloudUpload,
  Search,
  Check,
  Image,
  VideoFile,
  Description,
  FilterList,
  ViewModule,
  ViewList,
  Sort,
  Refresh,
  Info,
  Download,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useMedia } from '../hooks/useMedia';
import { MediaUploader } from './MediaUploader';
import { formatFileSize } from '@/shared/utils/formatters';
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
  title = 'اختيار وسائط',
  acceptTypes = ['image'],
  showFilters = true,
  showUpload = true,
  maxSelections,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<MediaCategory | ''>(category || '');
  const [typeFilter, setTypeFilter] = useState<MediaType | ''>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMedia, setSelectedMedia] = useState<Media[]>([]);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
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

  const handleSelectMedia = useCallback((media: Media) => {
    if (multiple) {
      setSelectedMedia(prev => {
        const exists = prev.find(m => m._id === media._id);
        if (exists) {
          return prev.filter(m => m._id !== media._id);
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
  }, [multiple, maxSelections, onSelect, onClose]);

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

  const isSelected = useCallback((media: Media) => {
    return selectedMedia.some(m => m._id === media._id);
  }, [selectedMedia]);

  const filteredMedia = useMemo(() => {
    if (!data?.data) return [];
    
    return data.data.filter(media => {
      if (acceptTypes.length > 0) {
        return acceptTypes.some(type => type === media.type);
      }
      return true;
    });
  }, [data?.data, acceptTypes]);

  const handleTabChange = useCallback((_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  }, []);

  const handleSortChange = useCallback((field: 'createdAt' | 'name' | 'size') => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  }, [sortBy]);

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">{title}</Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              {showUpload && (
                <Button
                  variant="outlined"
                  startIcon={<CloudUpload />}
                  onClick={() => setUploadDialogOpen(true)}
                >
                  رفع جديد
                </Button>
              )}
              {multiple && selectedMedia.length > 0 && (
                <Badge badgeContent={selectedMedia.length} color="primary">
                  <Button variant="contained" onClick={handleConfirmSelection}>
                    تأكيد الاختيار ({selectedMedia.length})
                  </Button>
                </Badge>
              )}
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeTab} onChange={handleTabChange}>
              <Tab label="جميع الوسائط" />
              <Tab label="الصور" />
              <Tab label="الفيديوهات" />
              <Tab label="المستندات" />
            </Tabs>
          </Box>

          <Box sx={{ p: 3 }}>
            {/* Filters and Controls */}
            {showFilters && (
              <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid size={{ xs: 12, md: 3 }}>
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
                  <Grid size={{ xs: 12, md: 2 }}>
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
                  <Grid size={{ xs: 12, md: 2 }}>
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
                    <FormControlLabel
                      control={
                        <Switch
                          checked={showDeleted}
                          onChange={(e) => setShowDeleted(e.target.checked)}
                        />
                      }
                      label="المحذوفة"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
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
                      <Tooltip title="ترتيب حسب التاريخ">
                        <IconButton
                          size="small"
                          color={sortBy === 'createdAt' ? 'primary' : 'default'}
                          onClick={() => handleSortChange('createdAt')}
                        >
                          <Sort />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="تحديث">
                        <IconButton size="small" onClick={() => refetch()}>
                          <Refresh />
                        </IconButton>
                      </Tooltip>
                      <Button size="small" onClick={handleClearFilters}>
                        مسح الفلاتر
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
                        '&:hover': {
                          boxShadow: 3,
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
                        {media.deletedAt && (
                          <Chip label="محذوف" size="small" color="error" />
                        )}
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
                            bgcolor: 'grey.100',
                          }}
                        >
                          <Avatar sx={{ width: 60, height: 60, fontSize: 24 }}>
                            {getFileIcon(media.mimeType)}
                          </Avatar>
                        </Box>
                      )}

                      <CardContent sx={{ p: 1.5 }}>
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
                      bgcolor: isSelected(media) ? 'primary.light' : 'transparent',
                      '&:hover': {
                        bgcolor: isSelected(media) ? 'primary.light' : 'grey.50',
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
                      primary={media.name}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {formatFileSize(media.size)}
                            {media.width && media.height && ` • ${media.width} × ${media.height}`}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                            <Chip label={media.category} size="small" variant="outlined" />
                            <Chip 
                              label={media.isPublic ? 'عام' : 'خاص'} 
                              size="small" 
                              color={media.isPublic ? 'success' : 'warning'}
                              variant="outlined"
                            />
                          </Box>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      {isSelected(media) && (
                        <Check color="primary" />
                      )}
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}

            {/* Empty State */}
            {!isLoading && filteredMedia.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Image sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  لا توجد وسائط
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {searchTerm || categoryFilter || typeFilter
                    ? 'لم يتم العثور على وسائط تطابق المعايير المحددة'
                    : 'ابدأ برفع وسائطك الأولى'}
                </Typography>
                {showUpload && (
                  <Button
                    variant="contained"
                    startIcon={<CloudUpload />}
                    onClick={() => setUploadDialogOpen(true)}
                  >
                    رفع وسائط جديدة
                  </Button>
                )}
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose}>إلغاء</Button>
          {multiple && (
            <Button 
              variant="contained" 
              disabled={selectedMedia.length === 0} 
              onClick={handleConfirmSelection}
            >
              اختيار ({selectedMedia.length})
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
