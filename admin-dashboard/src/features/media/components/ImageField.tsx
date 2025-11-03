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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  CardContent,
  useTheme,
} from '@mui/material';
import {
  CloudUpload,
  Image,
  Delete,
  Edit,
  Visibility,
  Add,
  Info,
  Download,
} from '@mui/icons-material';
import { MediaPicker } from './MediaPicker';
import { MediaUploader } from './MediaUploader';
import type { Media } from '../types/media.types';
import { MediaType, MediaCategory } from '../types/media.types';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import { useTranslation } from 'react-i18next';

interface ImageFieldProps {
  label?: string;
  value?: string | Media; // URL أو Media object
  // eslint-disable-next-line no-unused-vars
  onChange: (media: Media | null) => void;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  category?: MediaCategory;
  disabled?: boolean;
  multiple?: boolean;
  maxSelections?: number;
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
  category = MediaCategory.OTHER,
  disabled = false,
  multiple = false,
  maxSelections = 1,
  showDetails = true,
  size = 'medium',
  variant = 'card',
}) => {
  const theme = useTheme();
  const { isMobile } = useBreakpoint();
  const { t } = useTranslation('media');
  
  const [pickerOpen, setPickerOpen] = useState(false);
  const [uploaderOpen, setUploaderOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<Media | Media[] | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // تحويل value إلى Media object أو استخدام selectedMedia
  const currentMedia = useMemo(() => {
    if (selectedMedia && !Array.isArray(selectedMedia)) {
      return selectedMedia;
    }
    
    if (!value) return null;
    
    if (typeof value === 'string') {
      return {
        url: value,
        name: 'صورة محملة',
        _id: 'temp',
        category: category,
        type: MediaType.IMAGE,
        size: 0,
        mimeType: 'image/jpeg',
        isPublic: true,
        usageCount: 0,
      } as Media;
    }
    
    return value as Media;
  }, [value, category, selectedMedia]);

  const handleSelectMedia = useCallback((media: Media | Media[]) => {
    setSelectedMedia(media);
    onChange(Array.isArray(media) ? media[0] : media);
    setPickerOpen(false);
  }, [onChange]);

  const handleUploadSuccess = useCallback((uploadedMedia?: Media) => {
    if (uploadedMedia) {
      setSelectedMedia(uploadedMedia);
      onChange(uploadedMedia);
    }
    setUploaderOpen(false);
    setIsLoading(false);
  }, [onChange]);

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
        return { width: { xs: 80, sm: 120 }, height: { xs: 60, sm: 80 } };
      case 'large':
        return { width: { xs: 200, sm: 300 }, height: { xs: 150, sm: 200 } };
      default:
        return { width: { xs: 150, sm: 200 }, height: { xs: 120, sm: 150 } };
    }
  }, [size]);

  if (variant === 'minimal') {
    return (
      <Box>
        {label && (
          <Typography 
            variant="body2" 
            fontWeight="medium" 
            sx={{ mb: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
          >
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
            <Typography 
              variant="body2" 
              noWrap 
              sx={{ 
                flex: 1,
                fontSize: { xs: '0.75rem', sm: '0.875rem' }
              }}
            >
              {currentMedia.name}
            </Typography>
            <IconButton 
              size="small" 
              onClick={handleRemoveImage} 
              disabled={disabled}
              sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
            >
              <Delete fontSize="inherit" />
            </IconButton>
          </Box>
        ) : (
          <Button
            variant="outlined"
            size="small"
            startIcon={<Add />}
            onClick={() => setPickerOpen(true)}
            disabled={disabled}
            fullWidth={isMobile}
          >
            {t('empty.selectImage')}
          </Button>
        )}

        <MediaPicker
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
          onSelect={handleSelectMedia}
          category={category}
          title={`${t('empty.selectImage')} - ${label}`}
          acceptTypes={[MediaType.IMAGE]}
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
          <Typography 
            variant="body2" 
            fontWeight="medium" 
            sx={{ mb: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
          >
            {label}
            {required && <span style={{ color: 'red' }}> *</span>}
          </Typography>
        )}

        {currentMedia ? (
          <Paper sx={{ 
            p: 2, 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            bgcolor: 'background.paper',
          }}>
            <Box
              component="img"
              src={currentMedia.url}
              alt={currentMedia.name}
              sx={{
                width: { xs: 50, sm: 60 },
                height: { xs: 50, sm: 60 },
                objectFit: 'cover',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
              }}
            />
            <Box sx={{ flex: 1 }}>
              <Typography 
                variant="body2" 
                fontWeight="medium"
                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              >
                {currentMedia.name}
              </Typography>
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
              >
                {formatFileSize(currentMedia.size)}
                {currentMedia.width && currentMedia.height && 
                  ` • ${currentMedia.width} × ${currentMedia.height}`
                }
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Tooltip title={t('details.preview')}>
                <IconButton 
                  size="small" 
                  onClick={handlePreviewImage}
                  sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                >
                  <Visibility fontSize="inherit" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('details.change')}>
                <IconButton 
                  size="small" 
                  onClick={() => setPickerOpen(true)}
                  disabled={disabled}
                  sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                >
                  <Edit fontSize="inherit" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('details.delete')}>
                <IconButton 
                  size="small" 
                  color="error" 
                  onClick={handleRemoveImage}
                  disabled={disabled}
                  sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                >
                  <Delete fontSize="inherit" />
                </IconButton>
              </Tooltip>
            </Box>
          </Paper>
        ) : (
          <Box
            sx={{
              border: 2,
              borderStyle: 'dashed',
              borderColor: error ? 'error.main' : 'divider',
              borderRadius: 2,
              p: { xs: 2, sm: 3 },
              textAlign: 'center',
              bgcolor: 'background.paper',
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.6 : 1,
              transition: 'all 0.3s ease',
              '&:hover': {
                borderColor: error ? 'error.main' : 'primary.main',
                bgcolor: disabled ? undefined : (theme.palette.mode === 'dark' ? 'action.hover' : 'primary.light'),
              },
            }}
          >
            <Image sx={{ fontSize: { xs: 28, sm: 32 }, color: 'text.disabled', mb: 1 }} />
            <Typography 
              variant="body2" 
              color="text.secondary" 
              gutterBottom
              sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}
            >
              {required ? t('empty.imageRequired') : t('empty.noImageSelected')}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mt: 1 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Image />}
                onClick={() => setPickerOpen(true)}
                disabled={disabled}
                fullWidth={isMobile}
              >
                {t('empty.selectImage')}
              </Button>
              {!isMobile && (
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<CloudUpload />}
                  onClick={() => {
                    setUploaderOpen(true);
                    setIsLoading(true);
                  }}
                  disabled={disabled || isLoading}
                >
                  {isLoading ? t('empty.uploadingProgress') : t('upload')}
                </Button>
              )}
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
          title={`${t('empty.selectImage')} - ${label}`}
          acceptTypes={[MediaType.IMAGE]}
        />

        <MediaUploader
          open={uploaderOpen}
          onClose={() => setUploaderOpen(false)}
          onSuccess={handleUploadSuccess}
          defaultCategory={category}
        />
      </Box>
    );
  }

  // Card variant (default)
  const sizeStyles = getSizeStyles();
  
  return (
    <Box>
      {label && (
        <Typography 
          variant="body2" 
          fontWeight="medium" 
          sx={{ mb: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
        >
          {label}
          {required && <span style={{ color: 'red' }}> *</span>}
        </Typography>
      )}

      {currentMedia ? (
        <Card sx={{ 
          maxWidth: sizeStyles.width,
          bgcolor: 'background.paper',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: theme.palette.mode === 'dark' ? 8 : 3,
            transform: 'translateY(-2px)',
          },
        }}>
          <CardMedia
            component="img"
            height={sizeStyles.height[isMobile ? 'xs' : 'sm']}
            image={currentMedia.url}
            alt={currentMedia.name}
            sx={{ objectFit: 'cover' }}
          />
          <CardContent sx={{ p: { xs: 1, sm: 1.5 } }}>
            <Typography 
              variant="body2" 
              fontWeight="medium" 
              noWrap 
              gutterBottom
              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
            >
              {currentMedia.name}
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
              <Chip 
                label={currentMedia.category} 
                size="small" 
                variant="outlined"
                sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' } }}
              />
              <Chip 
                label={currentMedia.isPublic ? t('public') : t('private')} 
                size="small" 
                color={currentMedia.isPublic ? 'success' : 'warning'}
                variant="outlined"
                sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' } }}
              />
            </Box>
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
            >
              {formatFileSize(currentMedia.size)}
              {currentMedia.width && currentMedia.height && 
                ` • ${currentMedia.width} × ${currentMedia.height}`
              }
            </Typography>
          </CardContent>
          <CardActions 
            sx={{ 
              justifyContent: 'space-between', 
              px: { xs: 1, sm: 1.5 }, 
              pb: { xs: 1, sm: 1.5 },
              flexWrap: 'wrap',
              gap: 0.5,
            }}
          >
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Tooltip title={t('details.preview')}>
                <IconButton 
                  size="small" 
                  onClick={handlePreviewImage}
                  sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                >
                  <Visibility fontSize="inherit" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('details.download')}>
                <IconButton 
                  size="small" 
                  onClick={handleDownloadImage}
                  sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                >
                  <Download fontSize="inherit" />
                </IconButton>
              </Tooltip>
              {showDetails && (
                <Tooltip title={t('details.title')}>
                  <IconButton 
                    size="small" 
                    onClick={() => setDetailsOpen(true)}
                    sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                  >
                    <Info fontSize="inherit" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Tooltip title={t('details.changeImage')}>
                <IconButton 
                  size="small" 
                  onClick={() => setPickerOpen(true)}
                  disabled={disabled}
                  sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                >
                  <Edit fontSize="inherit" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('details.remove')}>
                <IconButton 
                  size="small" 
                  color="error" 
                  onClick={handleRemoveImage}
                  disabled={disabled}
                  sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                >
                  <Delete fontSize="inherit" />
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
            borderColor: error ? 'error.main' : 'divider',
            borderRadius: 2,
            p: { xs: 3, sm: 4 },
            textAlign: 'center',
            bgcolor: 'background.paper',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.6 : 1,
            transition: 'all 0.3s ease',
            '&:hover': {
              borderColor: error ? 'error.main' : 'primary.main',
              bgcolor: disabled ? undefined : (theme.palette.mode === 'dark' ? 'action.hover' : 'primary.light'),
            },
          }}
        >
          <Image sx={{ fontSize: { xs: 40, sm: 48 }, color: 'text.disabled', mb: 2 }} />
          <Typography 
            variant="body2" 
            color="text.secondary" 
            gutterBottom
            sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}
          >
            {required ? t('empty.imageRequired') : t('empty.noImageSelected')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mt: 2 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Image />}
              onClick={() => setPickerOpen(true)}
              disabled={disabled}
              fullWidth={isMobile}
            >
              {isMobile ? t('empty.selectImage') : t('empty.selectFromLibrary')}
            </Button>
            {!isMobile && (
              <Button
                variant="contained"
                size="small"
                startIcon={<CloudUpload />}
                onClick={() => {
                  setUploaderOpen(true);
                  setIsLoading(true);
                }}
                disabled={disabled || isLoading}
              >
                {isLoading ? t('empty.uploadingNew') : t('empty.uploadNew')}
              </Button>
            )}
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
        title={`${t('empty.selectImage')} - ${label}`}
        acceptTypes={[MediaType.IMAGE]}
        multiple={multiple}
        maxSelections={maxSelections}
      />

      {/* Upload Dialog */}
      <MediaUploader
        open={uploaderOpen}
        onClose={() => setUploaderOpen(false)}
        onSuccess={handleUploadSuccess}
        defaultCategory={category}
      />

      {/* Details Dialog */}
      {showDetails && currentMedia && (
        <Dialog 
          open={detailsOpen} 
          onClose={() => setDetailsOpen(false)} 
          maxWidth="sm" 
          fullWidth
          fullScreen={isMobile}
        >
          <DialogTitle sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
            {t('details.imageDetails')}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12 }}>
                <Box
                  component="img"
                  src={currentMedia.url}
                  alt={currentMedia.name}
                  sx={{
                    width: '100%',
                    maxHeight: { xs: 200, sm: 300 },
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
                  value={currentMedia.name}
                  sx={{ mb: 2 }}
                  InputProps={{ readOnly: true }}
                  size={isMobile ? 'small' : 'medium'}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label={t('details.category')}
                  value={currentMedia.category}
                  sx={{ mb: 2 }}
                  InputProps={{ readOnly: true }}
                  size={isMobile ? 'small' : 'medium'}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label={t('details.size')}
                  value={formatFileSize(currentMedia.size)}
                  sx={{ mb: 2 }}
                  InputProps={{ readOnly: true }}
                  size={isMobile ? 'small' : 'medium'}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label={t('details.dimensions')}
                  value={currentMedia.width && currentMedia.height ? 
                    `${currentMedia.width} × ${currentMedia.height}` : t('empty.notSpecified')
                  }
                  sx={{ mb: 2 }}
                  InputProps={{ readOnly: true }}
                  size={isMobile ? 'small' : 'medium'}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label={t('details.url')}
                  value={currentMedia.url}
                  sx={{ mb: 2 }}
                  InputProps={{ readOnly: true }}
                  size={isMobile ? 'small' : 'medium'}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: { xs: 1, sm: 2 } }}>
            <Button 
              onClick={() => setDetailsOpen(false)}
              fullWidth={isMobile}
            >
              {t('close')}
            </Button>
            <Button 
              variant="contained" 
              onClick={handlePreviewImage}
              fullWidth={isMobile}
            >
              {t('details.preview')}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};
