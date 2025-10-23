import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Button,
  Card,
  CardMedia,
  CardActions,
  Typography,
  IconButton,
  Tooltip,
  Alert,
  Paper,
  Chip,
  Skeleton,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Badge,
} from '@mui/material';
import {
  CloudUpload,
  Image,
  Delete,
  Edit,
  Visibility,
  Add,
  Check,
  Error as ErrorIcon,
  Info,
  Download,
  Refresh,
} from '@mui/icons-material';
import { MediaPicker } from './MediaPicker';
import { MediaUploader } from './MediaUploader';
import type { Media } from '../types/media.types';

interface ImageFieldProps {
  label?: string;
  value?: string | Media; // URL أو Media object
  // eslint-disable-next-line no-unused-vars
  onChange: (media: Media | null) => void;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  category?: 'product' | 'category' | 'brand' | 'banner' | 'other';
  disabled?: boolean;
  multiple?: boolean;
  maxSelections?: number;
  showPreview?: boolean;
  showDetails?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'card' | 'compact' | 'minimal';
}

export const ImageField: React.FC<ImageFieldProps> = ({
  label = 'الصورة',
  value,
  onChange,
  required = false,
  error = false,
  helperText,
  category = 'other',
  disabled = false,
  multiple = false,
  maxSelections = 1,
  showPreview = true,
  showDetails = true,
  size = 'medium',
  variant = 'card',
}) => {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [uploaderOpen, setUploaderOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<Media | Media[] | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // تحويل value إلى Media object
  const currentMedia = useMemo(() => {
    if (!value) return null;
    
    if (typeof value === 'string') {
      return {
        url: value,
        name: 'صورة محملة',
        _id: 'temp',
        category: category as any,
        type: 'image' as const,
        size: 0,
        mimeType: 'image/jpeg',
        isPublic: true,
        usageCount: 0,
      } as Media;
    }
    
    return value as Media;
  }, [value, category]);

  const handleSelectMedia = useCallback((media: Media | Media[]) => {
    setSelectedMedia(media);
    onChange(Array.isArray(media) ? media[0] : media);
    setPickerOpen(false);
  }, [onChange]);

  const handleUploadSuccess = useCallback(() => {
    setUploaderOpen(false);
    // يمكن إضافة منطق لجلب آخر ملف مرفوع هنا
  }, []);

  const handleRemoveImage = useCallback(() => {
    setSelectedMedia(null);
    onChange(null);
  }, [onChange]);

  const handlePreviewImage = useCallback(() => {
    if (currentMedia?.url) {
      window.open(currentMedia.url, '_blank');
    }
  }, [currentMedia]);

  const handleDownloadImage = useCallback(() => {
    if (currentMedia?.url) {
      const link = document.createElement('a');
      link.href = currentMedia.url;
      link.download = currentMedia.name || 'image';
      link.click();
    }
  }, [currentMedia]);

  const formatFileSize = useCallback((bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  const getSizeStyles = useCallback(() => {
    switch (size) {
      case 'small':
        return { width: 120, height: 80 };
      case 'large':
        return { width: 300, height: 200 };
      default:
        return { width: 200, height: 150 };
    }
  }, [size]);

  if (variant === 'minimal') {
    return (
      <Box>
        {label && (
          <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
            {label}
            {required && <span style={{ color: 'red' }}> *</span>}
          </Typography>
        )}

        {currentMedia ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              component="img"
              src={currentMedia.url}
              alt={currentMedia.name}
              sx={{
                width: 40,
                height: 40,
                objectFit: 'cover',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
              }}
            />
            <Typography variant="body2" noWrap sx={{ flex: 1 }}>
              {currentMedia.name}
            </Typography>
            <IconButton size="small" onClick={handleRemoveImage} disabled={disabled}>
              <Delete fontSize="small" />
            </IconButton>
          </Box>
        ) : (
          <Button
            variant="outlined"
            size="small"
            startIcon={<Add />}
            onClick={() => setPickerOpen(true)}
            disabled={disabled}
          >
            اختيار صورة
          </Button>
        )}

        <MediaPicker
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
          onSelect={handleSelectMedia}
          category={category}
          title={`اختيار صورة - ${label}`}
          acceptTypes={['image']}
          showFilters={false}
          showUpload={false}
        />
      </Box>
    );
  }

  if (variant === 'compact') {
    return (
      <Box>
        {label && (
          <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
            {label}
            {required && <span style={{ color: 'red' }}> *</span>}
          </Typography>
        )}

        {currentMedia ? (
          <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              component="img"
              src={currentMedia.url}
              alt={currentMedia.name}
              sx={{
                width: 60,
                height: 60,
                objectFit: 'cover',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
              }}
            />
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" fontWeight="medium">
                {currentMedia.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatFileSize(currentMedia.size)}
                {currentMedia.width && currentMedia.height && 
                  ` • ${currentMedia.width} × ${currentMedia.height}`
                }
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Tooltip title="معاينة">
                <IconButton size="small" onClick={handlePreviewImage}>
                  <Visibility fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="تغيير">
                <IconButton 
                  size="small" 
                  onClick={() => setPickerOpen(true)}
                  disabled={disabled}
                >
                  <Edit fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="حذف">
                <IconButton 
                  size="small" 
                  color="error" 
                  onClick={handleRemoveImage}
                  disabled={disabled}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Paper>
        ) : (
          <Box
            sx={{
              border: 2,
              borderStyle: 'dashed',
              borderColor: error ? 'error.main' : 'grey.300',
              borderRadius: 2,
              p: 3,
              textAlign: 'center',
              bgcolor: 'grey.50',
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.6 : 1,
            }}
          >
            <Image sx={{ fontSize: 32, color: 'grey.400', mb: 1 }} />
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {required ? 'الصورة مطلوبة' : 'لا توجد صورة مختارة'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mt: 1 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Image />}
                onClick={() => setPickerOpen(true)}
                disabled={disabled}
              >
                اختيار
              </Button>
              <Button
                variant="contained"
                size="small"
                startIcon={<CloudUpload />}
                onClick={() => setUploaderOpen(true)}
                disabled={disabled}
              >
                رفع
              </Button>
            </Box>
          </Box>
        )}

        {helperText && (
          <Alert severity={error ? 'error' : 'info'} sx={{ mt: 1 }}>
            {helperText}
          </Alert>
        )}

        <MediaPicker
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
          onSelect={handleSelectMedia}
          category={category}
          title={`اختيار صورة - ${label}`}
          acceptTypes={['image']}
        />

        <MediaUploader
          open={uploaderOpen}
          onClose={() => setUploaderOpen(false)}
          onSuccess={handleUploadSuccess}
          defaultCategory={category as any}
        />
      </Box>
    );
  }

  // Card variant (default)
  return (
    <Box>
      {label && (
        <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
          {label}
          {required && <span style={{ color: 'red' }}> *</span>}
        </Typography>
      )}

      {currentMedia ? (
        <Card sx={{ maxWidth: getSizeStyles().width }}>
          <CardMedia
            component="img"
            height={getSizeStyles().height}
            image={currentMedia.url}
            alt={currentMedia.name}
            sx={{ objectFit: 'cover' }}
          />
          <CardContent sx={{ p: 1.5 }}>
            <Typography variant="body2" fontWeight="medium" noWrap gutterBottom>
              {currentMedia.name}
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
              <Chip label={currentMedia.category} size="small" variant="outlined" />
              <Chip 
                label={currentMedia.isPublic ? 'عام' : 'خاص'} 
                size="small" 
                color={currentMedia.isPublic ? 'success' : 'warning'}
                variant="outlined"
              />
            </Box>
            <Typography variant="caption" color="text.secondary">
              {formatFileSize(currentMedia.size)}
              {currentMedia.width && currentMedia.height && 
                ` • ${currentMedia.width} × ${currentMedia.height}`
              }
            </Typography>
          </CardContent>
          <CardActions sx={{ justifyContent: 'space-between', px: 1.5, pb: 1.5 }}>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Tooltip title="معاينة">
                <IconButton size="small" onClick={handlePreviewImage}>
                  <Visibility fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="تحميل">
                <IconButton size="small" onClick={handleDownloadImage}>
                  <Download fontSize="small" />
                </IconButton>
              </Tooltip>
              {showDetails && (
                <Tooltip title="تفاصيل">
                  <IconButton size="small" onClick={() => setDetailsOpen(true)}>
                    <Info fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Tooltip title="تغيير الصورة">
                <IconButton 
                  size="small" 
                  onClick={() => setPickerOpen(true)}
                  disabled={disabled}
                >
                  <Edit fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="حذف الصورة">
                <IconButton 
                  size="small" 
                  color="error" 
                  onClick={handleRemoveImage}
                  disabled={disabled}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </CardActions>
        </Card>
      ) : (
        <Box
          sx={{
            border: 2,
            borderStyle: 'dashed',
            borderColor: error ? 'error.main' : 'grey.300',
            borderRadius: 2,
            p: 4,
            textAlign: 'center',
            bgcolor: 'grey.50',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.6 : 1,
            transition: 'all 0.3s ease',
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: 'primary.light',
            },
          }}
        >
          <Image sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {required ? 'الصورة مطلوبة' : 'لا توجد صورة مختارة'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mt: 2 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Image />}
              onClick={() => setPickerOpen(true)}
              disabled={disabled}
            >
              اختيار من المكتبة
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<CloudUpload />}
              onClick={() => setUploaderOpen(true)}
              disabled={disabled}
            >
              رفع صورة جديدة
            </Button>
          </Box>
        </Box>
      )}

      {helperText && (
        <Alert severity={error ? 'error' : 'info'} sx={{ mt: 1 }}>
          {helperText}
        </Alert>
      )}

      {/* Media Picker Dialog */}
      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleSelectMedia}
        category={category}
        title={`اختيار صورة - ${label}`}
        acceptTypes={['image']}
        multiple={multiple}
        maxSelections={maxSelections}
      />

      {/* Upload Dialog */}
      <MediaUploader
        open={uploaderOpen}
        onClose={() => setUploaderOpen(false)}
        onSuccess={handleUploadSuccess}
        defaultCategory={category as any}
      />

      {/* Details Dialog */}
      {showDetails && currentMedia && (
        <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>تفاصيل الصورة</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12 }}>
                <Box
                  component="img"
                  src={currentMedia.url}
                  alt={currentMedia.name}
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
                  value={currentMedia.name}
                  sx={{ mb: 2 }}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="الفئة"
                  value={currentMedia.category}
                  sx={{ mb: 2 }}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="الحجم"
                  value={formatFileSize(currentMedia.size)}
                  sx={{ mb: 2 }}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="الأبعاد"
                  value={currentMedia.width && currentMedia.height ? 
                    `${currentMedia.width} × ${currentMedia.height}` : 'غير محدد'
                  }
                  sx={{ mb: 2 }}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="الرابط"
                  value={currentMedia.url}
                  sx={{ mb: 2 }}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailsOpen(false)}>إغلاق</Button>
            <Button variant="contained" onClick={handlePreviewImage}>
              معاينة
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};
