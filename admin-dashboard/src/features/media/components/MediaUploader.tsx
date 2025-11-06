import React, { useState, useCallback } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Typography,
  LinearProgress,
  Alert,
  FormControlLabel,
  Switch,
  Chip,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Card,
  CardMedia,
  CardContent,
  Skeleton,
  useTheme,
} from '@mui/material';
import {
  CloudUpload,
  Image,
  VideoFile,
  Description,
  CheckCircle,  
} from '@mui/icons-material';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { useUploadMedia } from '../hooks/useMedia';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import { MediaCategory } from '../types/media.types';

interface MediaUploaderProps {
  open: boolean;
  onClose: () => void;
  // eslint-disable-next-line no-unused-vars
  onSuccess?: (media?: any) => void;
  defaultCategory?: MediaCategory;
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  open,
  onClose,
  onSuccess,
  defaultCategory = MediaCategory.OTHER
}) => {
  const { t } = useTranslation('media');
  const theme = useTheme();
  const { isMobile } = useBreakpoint();
  
  const [activeStep, setActiveStep] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<MediaCategory>(defaultCategory);
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { mutate: upload, isPending } = useUploadMedia();

  const handleFileSelect = useCallback((selectedFile: File) => {
    setFile(selectedFile);
    setName(selectedFile.name.split('.')[0]);
    setUploadError(null);

    // Create preview for images
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
    
    // Auto-advance to next step
    setActiveStep(1);
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      handleFileSelect(acceptedFiles[0]);
    }
  }, [handleFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'video/*': ['.mp4', '.webm', '.ogg'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    multiple: false,
    noClick: false,
  });

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image />;
    if (file.type.startsWith('video/')) return <VideoFile />;
    return <Description />;
  };

  const handleAddTag = useCallback(() => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  }, [tagInput, tags]);

  const handleRemoveTag = useCallback((tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  }, [tags]);

  const handleNext = useCallback(() => {
    setActiveStep(prev => prev + 1);
  }, []);

  const handleBack = useCallback(() => {
    setActiveStep(prev => prev - 1);
  }, []);

  const handleClose = useCallback(() => {
    setActiveStep(0);
    setFile(null);
    setName('');
    setDescription('');
    setTags([]);
    setTagInput('');
    setIsPublic(true);
    setPreview(null);
    setUploadProgress(0);
    setUploadError(null);
    onClose();
  }, [onClose]);

  const handleUpload = useCallback(() => {
    if (!file || !name) return;

    setUploadProgress(0);
    setUploadError(null);

    upload(
      {
        file,
        data: {
          name,
          category,
          description,
          tags,
          isPublic,
        },
      },
      {
        onSuccess: (response) => {
          setUploadProgress(100);
          setTimeout(() => {
            handleClose();
            onSuccess?.(response.media);
          }, 1000);
        },
        onError: (error) => {
          setUploadError((error as Error).message || t('uploader.uploadError'));
        },
      }
    );
  }, [file, name, category, description, tags, isPublic, upload, onSuccess, handleClose, t]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="lg" 
      fullWidth
      fullScreen={isMobile}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CloudUpload color="primary" />
          <Typography 
            variant="h6"
            sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
          >
            {t('uploadNewFile')}
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ p: { xs: 1, sm: 3 } }}>
        <Box>
          <Stepper 
            activeStep={activeStep} 
            orientation={isMobile ? 'vertical' : 'horizontal'}
            sx={{ mb: 3 }}
          >
            {/* Step 1: File Selection */}
            <Step>
              <StepLabel>{t('uploader.selectFile')}</StepLabel>
              <StepContent>
                <Paper
                  {...getRootProps()}
                  sx={{
                    p: { xs: 2, sm: 3 },
                    border: '2px dashed',
                    borderColor: isDragActive 
                      ? 'primary.main' 
                      : file 
                        ? 'success.main' 
                        : 'divider',
                    bgcolor: isDragActive
                      ? theme.palette.mode === 'dark'
                        ? 'primary.dark'
                        : 'primary.light'
                      : file 
                        ? theme.palette.mode === 'dark' 
                          ? 'success.dark' 
                          : 'success.light' 
                        : 'background.paper',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    opacity: isDragActive ? 0.8 : 1,
                    transform: isDragActive ? 'scale(1.02)' : 'scale(1)',
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: theme.palette.mode === 'dark' 
                        ? 'action.hover' 
                        : 'primary.light',
                    },
                  }}
                >
                  <input {...getInputProps()} />
                  
                  {file ? (
                    <Box>
                      <CheckCircle color="success" sx={{ fontSize: { xs: 40, sm: 48 }, mb: 2 }} />
                      <Typography 
                        variant="h6" 
                        gutterBottom
                        sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                      >
                        {t('uploader.fileSelected')}
                      </Typography>
                      <Card sx={{ maxWidth: { xs: 200, sm: 300 }, mx: 'auto' }}>
                        {preview ? (
                          <CardMedia
                            component="img"
                            height="150"
                            image={preview}
                            alt={file.name}
                            sx={{ objectFit: 'cover' }}
                          />
                        ) : (
                          <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {getFileIcon(file)}
                          </Box>
                        )}
                        <CardContent>
                          <Typography 
                            variant="body2" 
                            fontWeight="medium" 
                            noWrap
                            sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                          >
                            {file.name}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            color="text.secondary"
                            sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                          >
                            {formatFileSize(file.size)}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Box>
                  ) : (
                    <Box>
                      <CloudUpload 
                        sx={{ 
                          fontSize: { xs: 40, sm: 48 }, 
                          color: isDragActive ? 'primary.main' : 'text.disabled', 
                          mb: 2,
                          transition: 'all 0.3s ease',
                          transform: isDragActive ? 'scale(1.1)' : 'scale(1)',
                        }} 
                      />
                      <Typography 
                        variant="h6" 
                        gutterBottom
                        sx={{ 
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                          color: isDragActive ? 'primary.main' : 'text.primary',
                        }}
                      >
                        {isDragActive ? t('uploader.dropFile') : t('uploader.selectFile')}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}
                      >
                        {t('uploader.dragDrop')}
                      </Typography>
                    </Box>
                  )}
                </Paper>
                
                {file && (
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button 
                      variant="contained" 
                      onClick={handleNext}
                      fullWidth={isMobile}
                      size={isMobile ? 'medium' : 'small'}
                    >
                      {t('next')}
                    </Button>
                  </Box>
                )}
              </StepContent>
            </Step>

            {/* Step 2: Data Entry */}
            <Step>
              <StepLabel>{t('uploader.fileDetails')}</StepLabel>
              <StepContent>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label={`${t('uploader.fileName')} *`}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      helperText={t('uploader.fileName')}
                      size={isMobile ? 'small' : 'medium'}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormControl fullWidth>
                      <InputLabel>{t('uploader.category')}</InputLabel>
                      <Select
                        value={category}
                        label={t('uploader.category')}
                        onChange={(e) => setCategory(e.target.value as MediaCategory)}
                        size={isMobile ? 'small' : 'medium'}
                      >
                        <MenuItem value={MediaCategory.PRODUCT}>{t('categories.product')}</MenuItem>
                        <MenuItem value={MediaCategory.CATEGORY}>{t('categories.category')}</MenuItem>
                        <MenuItem value={MediaCategory.BRAND}>{t('categories.brand')}</MenuItem>
                        <MenuItem value={MediaCategory.BANNER}>{t('categories.banner')}</MenuItem>
                        <MenuItem value={MediaCategory.OTHER}>{t('categories.other')}</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={isPublic}
                          onChange={(e) => setIsPublic(e.target.checked)}
                          size={isMobile ? 'small' : 'medium'}
                        />
                      }
                      label={t('uploader.publicFile')}
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label={t('uploader.description')}
                      multiline
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={t('uploader.description')}
                      size={isMobile ? 'small' : 'medium'}
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label={t('uploader.tags')}
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      placeholder={t('uploader.addTag')}
                      helperText={t('uploader.tags')}
                      size={isMobile ? 'small' : 'medium'}
                    />
                    {tags.length > 0 && (
                      <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {tags.map((tag) => (
                          <Chip
                            key={tag}
                            label={tag}
                            size="small"
                            onDelete={() => handleRemoveTag(tag)}
                            color="primary"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    )}
                  </Grid>
                </Grid>

                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                  <Button 
                    onClick={handleBack}
                    fullWidth={isMobile}
                    size={isMobile ? 'medium' : 'small'}
                  >
                    {t('form.back')}
                  </Button>
                  <Button 
                    variant="contained" 
                    onClick={handleNext} 
                    disabled={!name}
                    fullWidth={isMobile}
                    size={isMobile ? 'medium' : 'small'}
                  >
                    {t('form.next')}
                  </Button>
                </Box>
              </StepContent>
            </Step>

            {/* Step 3: Review and Upload */}
            <Step>
              <StepLabel>{t('review')}</StepLabel>
              <StepContent>
                <Paper sx={{ p: 2, mb: 2, bgcolor: 'background.paper' }}>
                  <Typography 
                    variant="h6" 
                    gutterBottom
                    sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                  >
                    {t('dataReview')}
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        {t('fileName')}:
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {name}
                      </Typography>
                    </Grid>
                    
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        {t('category')}:
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {category}
                      </Typography>
                    </Grid>
                    
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        {t('status')}:
                      </Typography>
                      <Chip 
                        label={isPublic ? t('public') : t('private')} 
                        color={isPublic ? 'success' : 'warning'} 
                        size="small" 
                      />
                    </Grid>
                    
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        {t('size')}:
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {file ? formatFileSize(file.size) : '-'}
                      </Typography>
                    </Grid>
                    
                    {description && (
                      <Grid size={{ xs: 12 }}>
                        <Typography variant="body2" color="text.secondary">
                          {t('description')}:
                        </Typography>
                        <Typography variant="body1">
                          {description}
                        </Typography>
                      </Grid>
                    )}
                    
                    {tags.length > 0 && (
                      <Grid size={{ xs: 12 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {t('tags')}:
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {tags.map((tag) => (
                            <Chip key={tag} label={tag} size="small" />
                          ))}
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </Paper>

                {/* Upload Progress */}
                {isPending && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      {t('uploading')}
                    </Typography>
                    <LinearProgress variant="determinate" value={uploadProgress} />
                  </Box>
                )}

                {/* Upload Error */}
                {uploadError && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {uploadError}
                  </Alert>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                  <Button 
                    onClick={handleBack} 
                    disabled={isPending}
                    fullWidth={isMobile}
                    size={isMobile ? 'medium' : 'small'}
                  >
                    {t('form.back')}
                  </Button>
                  <Button 
                    variant="contained" 
                    onClick={handleUpload} 
                    disabled={!file || !name || isPending}
                    startIcon={isPending ? <Skeleton width={20} height={20} /> : <CloudUpload />}
                    fullWidth={isMobile}
                    size={isMobile ? 'medium' : 'small'}
                  >
                    {isPending ? t('uploading') : t('uploadFile')}
                  </Button>
                </Box>
              </StepContent>
            </Step>
          </Stepper>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: { xs: 1, sm: 2 } }}>
        <Button 
          onClick={handleClose} 
          disabled={isPending}
          fullWidth={isMobile}
          size={isMobile ? 'medium' : 'small'}
        >
          {t('form.cancel')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
