import React, { useState, useCallback } from 'react';
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  IconButton,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  PlayArrow,
  Stop,
  VideoFile,
  Close,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { videoApi, VideoUploadResponse } from '../api/videoApi';
import toast from 'react-hot-toast';

interface VideoUploaderProps {
  value?: string | null;
  onChange?: (videoId: string | null) => void;
  title?: string;
  disabled?: boolean;
}

export const VideoUploader: React.FC<VideoUploaderProps> = ({
  value,
  onChange,
  title,
  disabled = false,
}) => {
  const { t } = useTranslation(['media', 'common']);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoTitle, setVideoTitle] = useState(title || '');
  const [titleDialogOpen, setTitleDialogOpen] = useState(false);
  const [uploadedVideo, setUploadedVideo] = useState<VideoUploadResponse | null>(null);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file type
      const allowedTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/webm', 'video/mkv', 'video/quicktime'];
      if (!allowedTypes.includes(file.type)) {
        toast.error(t('media:video.invalidType', 'نوع الفيديو غير مدعوم'));
        return;
      }

      // Check file size (max 500MB)
      const maxSize = 500 * 1024 * 1024; // 500MB
      if (file.size > maxSize) {
        toast.error(t('media:video.tooLarge', 'حجم الفيديو كبير جداً. الحد الأقصى 500 ميجابايت'));
        return;
      }

      setSelectedFile(file);
      if (!videoTitle) {
        setVideoTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
      setTitleDialogOpen(true);
    }
  }, [videoTitle, t]);

  const handleUpload = useCallback(async () => {
    if (!selectedFile || !videoTitle.trim()) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const result = await videoApi.upload(selectedFile, videoTitle.trim());
      setUploadedVideo(result);
      onChange?.(result.videoId);
      setTitleDialogOpen(false);
      toast.success(t('media:video.uploadSuccess', 'تم رفع الفيديو بنجاح'));
    } catch (error: any) {
      console.error('Video upload error:', error);
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        t('media:video.uploadError', 'فشل رفع الفيديو')
      );
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [selectedFile, videoTitle, onChange, t]);

  const handleDelete = useCallback(async () => {
    if (!value) return;

    try {
      await videoApi.delete(value);
      onChange?.(null);
      setUploadedVideo(null);
      toast.success(t('media:video.deleteSuccess', 'تم حذف الفيديو بنجاح'));
    } catch (error: any) {
      console.error('Video delete error:', error);
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        t('media:video.deleteError', 'فشل حذف الفيديو')
      );
    }
  }, [value, onChange, t]);

  const resetUpload = useCallback(() => {
    setSelectedFile(null);
    setVideoTitle('');
    setTitleDialogOpen(false);
    setUploadProgress(0);
  }, []);

  return (
    <Box>
      {/* Upload Area */}
      {!value && !uploadedVideo && (
        <Card
          variant="outlined"
          sx={{
            border: '2px dashed',
            borderColor: 'grey.300',
            textAlign: 'center',
            p: 3,
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            '&:hover': {
              borderColor: disabled ? 'grey.300' : 'primary.main',
              bgcolor: disabled ? 'transparent' : 'action.hover',
            },
          }}
          onClick={() => !disabled && document.getElementById('video-upload-input')?.click()}
        >
          <CardContent sx={{ p: 0 }}>
            <CloudUpload sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              {t('media:video.uploadTitle', 'رفع فيديو')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('media:video.uploadDescription', 'اسحب وأفلت الفيديو هنا أو انقر للاختيار')}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              {t('media:video.supportedFormats', 'الصيغ المدعومة: MP4, AVI, MOV, WMV, FLV, WebM, MKV')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t('media:video.maxSize', 'الحد الأقصى: 500 ميجابايت')}
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Hidden File Input */}
      <input
        id="video-upload-input"
        type="file"
        accept="video/*"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
        disabled={disabled || isUploading}
      />

      {/* Uploaded Video Preview */}
      {(value || uploadedVideo) && (
        <Card variant="outlined">
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <VideoFile sx={{ fontSize: 40, color: 'primary.main' }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {uploadedVideo?.title || t('media:video.uploadedVideo', 'فيديو مرفوع')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {uploadedVideo?.status === 'processing' 
                    ? t('media:video.processing', 'جاري المعالجة...')
                    : uploadedVideo?.status === 'ready'
                    ? t('media:video.ready', 'جاهز للعرض')
                    : t('media:video.failed', 'فشلت المعالجة')
                  }
                </Typography>
                {uploadedVideo?.duration && (
                  <Typography variant="caption" color="text.secondary">
                    {t('media:video.duration', 'المدة: {{seconds}} ثانية', {
                      seconds: Math.round(uploadedVideo.duration),
                    })}
                  </Typography>
                )}
              </Box>
              <IconButton
                color="error"
                onClick={handleDelete}
                disabled={disabled}
                title={t('common:actions.delete', 'حذف')}
              >
                <Delete />
              </IconButton>
            </Box>

            {/* Video Preview */}
            {uploadedVideo?.url && (
              <Box sx={{ mt: 2 }}>
                <video
                  controls
                  style={{ width: '100%', maxHeight: '200px' }}
                  src={uploadedVideo.url}
                >
                  {t('media:video.notSupported', 'متصفحك لا يدعم تشغيل الفيديو')}
                </video>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Title Dialog */}
      <Dialog open={titleDialogOpen} onClose={resetUpload} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">
              {t('media:video.enterTitle', 'أدخل عنوان الفيديو')}
            </Typography>
            <IconButton onClick={resetUpload} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label={t('media:video.title', 'عنوان الفيديو')}
            value={videoTitle}
            onChange={(e) => setVideoTitle(e.target.value)}
            placeholder={selectedFile?.name.replace(/\.[^/.]+$/, '')}
            disabled={isUploading}
          />
          {isUploading && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" gutterBottom>
                {t('media:video.uploading', 'جاري رفع الفيديو...')}
              </Typography>
              <LinearProgress variant="indeterminate" />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={resetUpload} disabled={isUploading}>
            {t('common:actions.cancel', 'إلغاء')}
          </Button>
          <Button
            onClick={handleUpload}
            variant="contained"
            disabled={!videoTitle.trim() || isUploading}
            startIcon={isUploading ? <Stop /> : <PlayArrow />}
          >
            {isUploading 
              ? t('media:video.uploading', 'جاري الرفع...')
              : t('media:video.upload', 'رفع')
            }
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
