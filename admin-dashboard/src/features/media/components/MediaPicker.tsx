import React, { useState } from 'react';
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
  CardActions,
  IconButton,
  Typography,
  Chip,
  Tooltip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Alert,
  LinearProgress,
  Badge,
  Avatar,
} from '@mui/material';
import {
  CloudUpload,
  Search,
  FilterList,
  ContentCopy,
  Check,
  Close,
  Image,
  VideoLibrary,
  Description,
} from '@mui/icons-material';
import { useMedia } from '../hooks/useMedia';
import { MediaUploader } from './MediaUploader';
import { formatFileSize } from '@/shared/utils/formatters';
import type { Media, MediaCategory, MediaType } from '../types/media.types';

interface MediaPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (media: Media) => void;
  category?: MediaCategory;
  multiple?: boolean;
  title?: string;
  acceptTypes?: MediaType[];
}

export const MediaPicker: React.FC<MediaPickerProps> = ({
  open,
  onClose,
  onSelect,
  category,
  multiple = false,
  title = 'اختيار وسائط',
  acceptTypes = ['image'],
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<MediaCategory | ''>(category || '');
  const [typeFilter, setTypeFilter] = useState<MediaType | ''>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMedia, setSelectedMedia] = useState<Media[]>([]);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const { data, isLoading, refetch } = useMedia({
    page: currentPage,
    limit: 12,
    search: searchTerm,
    category: categoryFilter || undefined,
    type: typeFilter || undefined,
  });

  const handleSelectMedia = (media: Media) => {
    if (multiple) {
      setSelectedMedia(prev => {
        const exists = prev.find(m => m._id === media._id);
        if (exists) {
          return prev.filter(m => m._id !== media._id);
        } else {
          return [...prev, media];
        }
      });
    } else {
      onSelect(media);
      onClose();
    }
  };

  const handleConfirmSelection = () => {
    if (selectedMedia.length > 0) {
      // في حالة الاختيار المتعدد، نرجع الملف الأول أو نستدعي callback لكل ملف
      onSelect(selectedMedia[0]);
    }
    onClose();
  };

  const handleUploadSuccess = () => {
    refetch();
    setUploadDialogOpen(false);
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return '🖼️';
    if (type.startsWith('video/')) return '🎥';
    if (type.includes('pdf')) return '📄';
    if (type.includes('word')) return '📝';
    return '📁';
  };

  const isSelected = (media: Media) => {
    return selectedMedia.some(m => m._id === media._id);
  };

  const filteredMedia = data?.data?.filter(media => {
    if (acceptTypes.length > 0) {
      return acceptTypes.includes(media.type);
    }
    return true;
  }) || [];

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">{title}</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<CloudUpload />}
                onClick={() => setUploadDialogOpen(true)}
              >
                رفع جديد
              </Button>
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
        
        <DialogContent>
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
            <Grid size={{ xs: 12, md: 4 }}>
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
            <Grid size={{ xs: 12, md: 4 }}>
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
          </Grid>

          {/* Loading */}
          {isLoading && <LinearProgress sx={{ mb: 2 }} />}

          {/* Media Grid */}
          {!isLoading && (
            <Grid container spacing={2}>
              {filteredMedia.map((media) => (
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={media._id}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      border: isSelected(media) ? 2 : 1,
                      borderColor: isSelected(media) ? 'primary.main' : 'divider',
                      position: 'relative',
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
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
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
              <Button
                variant="contained"
                startIcon={<CloudUpload />}
                onClick={() => setUploadDialogOpen(true)}
              >
                رفع وسائط جديدة
              </Button>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>إلغاء</Button>
          {!multiple && (
            <Button variant="contained" disabled={selectedMedia.length === 0} onClick={handleConfirmSelection}>
              اختيار
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Upload Dialog */}
      <MediaUploader
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        onSuccess={handleUploadSuccess}
      />
    </>
  );
};
