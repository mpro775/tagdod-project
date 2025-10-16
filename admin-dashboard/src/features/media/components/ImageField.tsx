import React, { useState } from 'react';
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
} from '@mui/material';
import {
  CloudUpload,
  Image,
  Delete,
  Edit,
  Visibility,
} from '@mui/icons-material';
import { MediaPicker } from './MediaPicker';
import { MediaUploader } from './MediaUploader';
import type { Media } from '../types/media.types';

interface ImageFieldProps {
  label?: string;
  value?: string; // URL أو Media object
  onChange: (media: Media | null) => void;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  category?: 'product' | 'category' | 'brand' | 'banner' | 'other';
  disabled?: boolean;
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
}) => {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [uploaderOpen, setUploaderOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);

  // إذا كان value هو string (URL)، نحاول تحويله إلى Media object
  const currentMedia = typeof value === 'string' && value ? 
    { url: value, name: 'صورة محملة', _id: 'temp', category, type: 'image' as const } : 
    selectedMedia;

  const handleSelectMedia = (media: Media) => {
    setSelectedMedia(media);
    onChange(media);
    setPickerOpen(false);
  };

  const handleUploadSuccess = () => {
    // بعد الرفع الناجح، سنحتاج إلى جلب أحدث الملفات المرفوعة
    setUploaderOpen(false);
    // يمكن إضافة منطق لجلب آخر ملف مرفوع هنا
  };

  const handleRemoveImage = () => {
    setSelectedMedia(null);
    onChange(null);
  };

  const handlePreviewImage = () => {
    if (currentMedia?.url) {
      window.open(currentMedia.url, '_blank');
    }
  };

  return (
    <Box>
      {label && (
        <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
          {label}
          {required && <span style={{ color: 'red' }}> *</span>}
        </Typography>
      )}

      {currentMedia ? (
        <Card sx={{ maxWidth: 300 }}>
          <CardMedia
            component="img"
            height="200"
            image={currentMedia.url}
            alt={currentMedia.name}
            sx={{ objectFit: 'cover' }}
          />
          <CardActions sx={{ justifyContent: 'space-between' }}>
            <Typography variant="body2" noWrap sx={{ flex: 1, mr: 1 }}>
              {currentMedia.name}
            </Typography>
            <Box>
              <Tooltip title="معاينة">
                <IconButton size="small" onClick={handlePreviewImage}>
                  <Visibility fontSize="small" />
                </IconButton>
              </Tooltip>
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
      />

      {/* Upload Dialog */}
      <MediaUploader
        open={uploaderOpen}
        onClose={() => setUploaderOpen(false)}
        onSuccess={handleUploadSuccess}
      />
    </Box>
  );
};
